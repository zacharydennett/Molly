import { createClient } from "@supabase/supabase-js";
import type { CompetitorAdsApiResponse, RetailerAdData, RetailerSnapshot } from "@/types/competitor-ads";

const BUCKET = "competitor-ads-screenshots";
const PAGE_TIMEOUT_MS = 240_000; // 4 minutes — Wayback Machine is very slow
const BATCH_SIZE = 3; // 3 parallel pages, sharing one browser process

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Takes a screenshot of a Wayback Machine URL.
// Returns PNG Buffer or null on failure.
async function captureScreenshot(
  page: import("playwright").Page,
  url: string
): Promise<Buffer | null> {
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: PAGE_TIMEOUT_MS });
    await page.waitForTimeout(2000); // let lazy content settle
    return await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: 1280, height: 2400 }, // top ~2400px of page
    });
  } catch {
    return null;
  }
}

// Uploads PNG to Supabase Storage; idempotent (skip if already exists).
// Returns public URL or null.
async function uploadScreenshot(
  storagePath: string,
  png: Buffer
): Promise<string | null> {
  const supabase = createServiceClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, png, {
      contentType: "image/png",
      upsert: false,
      cacheControl: "31536000", // 1 year — historical snapshots are immutable
    });

  if (error && !error.message.includes("already exists")) {
    console.error("[screenshotCache] upload error:", error.message);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl ?? null;
}

// Launches Chromium: uses @sparticuz/chromium on Vercel (Linux serverless),
// falls back to locally installed browser in development.
async function launchBrowser() {
  const { chromium } = await import("playwright-core");
  if (process.env.VERCEL) {
    const sparticuz = (await import("@sparticuz/chromium")).default;
    return chromium.launch({
      args: sparticuz.args,
      executablePath: await sparticuz.executablePath(),
      headless: true,
    });
  }
  // Local dev: uses browser installed by `playwright install chromium`
  return chromium.launch({ headless: true });
}

// Main entry point — called fire-and-forget after API response is sent.
// For each snapshot with archiveUrl but no screenshotUrl:
//   - visit URL with Playwright, take screenshot, upload to Storage
// Then UPDATE the competitor_ads_cache row with the new screenshotUrls.
export async function cacheScreenshotsForWeek(
  weekEndKey: string,
  response: CompetitorAdsApiResponse
): Promise<void> {
  type WorkItem = {
    retailerIdx: number;
    slot: "prevWeek" | "lastYear";
    archiveUrl: string;
    storagePath: string;
  };

  const work: WorkItem[] = [];
  for (let i = 0; i < response.retailers.length; i++) {
    const retailer = response.retailers[i];
    for (const slot of ["prevWeek", "lastYear"] as const) {
      const snap = retailer[slot];
      if (snap.archiveUrl && !snap.screenshotUrl) {
        work.push({
          retailerIdx: i,
          slot,
          archiveUrl: snap.archiveUrl,
          storagePath: `${weekEndKey}/${retailer.id}/${slot}.png`,
        });
      }
    }
  }
  if (work.length === 0) return;

  const results: { retailerIdx: number; slot: string; screenshotUrl: string | null }[] = [];
  const browser = await launchBrowser();

  try {
    for (let i = 0; i < work.length; i += BATCH_SIZE) {
      const batch = work.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        batch.map(async (item) => {
          const page = await browser.newPage();
          await page.setViewportSize({ width: 1280, height: 800 });
          try {
            const png = await captureScreenshot(page, item.archiveUrl);
            const url = png ? await uploadScreenshot(item.storagePath, png) : null;
            return { retailerIdx: item.retailerIdx, slot: item.slot, screenshotUrl: url };
          } finally {
            await page.close();
          }
        })
      );
      for (const r of batchResults) {
        if (r.status === "fulfilled") results.push(r.value);
      }
    }
  } finally {
    await browser.close();
  }

  // Merge screenshotUrls back into retailers and UPDATE the Supabase cache row
  const updatedRetailers: RetailerAdData[] = response.retailers.map((r) => ({
    ...r,
    prevWeek: { ...r.prevWeek },
    lastYear: { ...r.lastYear },
  }));
  for (const result of results) {
    (updatedRetailers[result.retailerIdx][result.slot as "prevWeek" | "lastYear"] as RetailerSnapshot).screenshotUrl =
      result.screenshotUrl;
  }

  const supabase = createServiceClient();
  await supabase
    .from("competitor_ads_cache")
    .update({ data: { ...response, retailers: updatedRetailers } })
    .eq("week_end", weekEndKey);
}
