import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function createAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET() {
  const results: Record<string, unknown> = {};

  // 1. Env vars
  results.env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : "MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? "set (" + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(0, 20) + "…)"
      : "MISSING",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "set (" + process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 20) + "…)"
      : "MISSING ⚠️",
  };

  // 2. Storage bucket check (requires service role)
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createServiceClient();
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) {
        results.storageBuckets = { error: error.message };
      } else {
        const names = buckets?.map((b) => b.name) ?? [];
        results.storageBuckets = {
          found: names,
          competitorAdsBucketExists: names.includes("competitor-ads-screenshots"),
        };
      }

      // List files in bucket if it exists
      if ((results.storageBuckets as { competitorAdsBucketExists?: boolean }).competitorAdsBucketExists) {
        const { data: files, error: listErr } = await supabase.storage
          .from("competitor-ads-screenshots")
          .list("", { limit: 100, sortBy: { column: "name", order: "asc" } });
        results.bucketFiles = listErr
          ? { error: listErr.message }
          : files?.map((f) => f.name) ?? [];
      }
    } catch (e) {
      results.storageBuckets = { error: String(e) };
    }
  } else {
    results.storageBuckets = "skipped — SUPABASE_SERVICE_ROLE_KEY missing";
  }

  // 3. competitor_ads_cache rows (anon read)
  try {
    const supabase = createAnonClient();
    const { data: rows, error } = await supabase
      .from("competitor_ads_cache")
      .select("week_end, created_at, data")
      .order("week_end", { ascending: false })
      .limit(10);

    if (error) {
      results.cacheRows = { error: error.message };
    } else {
      results.cacheRows = rows?.map((row) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = row.data as any;
        const retailers = data?.retailers ?? [];
        const snapshots = retailers.flatMap((r: { id: string; prevWeek: { archiveUrl?: string; screenshotUrl?: string }; lastYear: { archiveUrl?: string; screenshotUrl?: string } }) => [
          {
            retailer: r.id,
            slot: "prevWeek",
            hasArchiveUrl: !!r.prevWeek?.archiveUrl,
            screenshotUrl: r.prevWeek?.screenshotUrl ?? null,
          },
          {
            retailer: r.id,
            slot: "lastYear",
            hasArchiveUrl: !!r.lastYear?.archiveUrl,
            screenshotUrl: r.lastYear?.screenshotUrl ?? null,
          },
        ]);
        const total = snapshots.filter((s: { hasArchiveUrl: boolean }) => s.hasArchiveUrl).length;
        const done = snapshots.filter((s: { screenshotUrl: string | null }) => s.screenshotUrl).length;
        return {
          week_end: row.week_end,
          created_at: row.created_at,
          screenshots: `${done}/${total}`,
          snapshots,
        };
      });
    }
  } catch (e) {
    results.cacheRows = { error: String(e) };
  }

  // 4. UPDATE policy check — try to update a non-existent row (should get 0 rows affected, not auth error)
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createServiceClient();
      const { error } = await supabase
        .from("competitor_ads_cache")
        .update({ data: {} as never })
        .eq("week_end", "1900-01-01"); // safe no-op
      results.updatePolicyCheck = error
        ? { error: error.message }
        : "ok — UPDATE policy is working";
    } catch (e) {
      results.updatePolicyCheck = { error: String(e) };
    }
  } else {
    results.updatePolicyCheck = "skipped — service role key missing";
  }

  return NextResponse.json(results, { status: 200 });
}
