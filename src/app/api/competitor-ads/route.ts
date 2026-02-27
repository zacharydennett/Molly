import { NextResponse } from "next/server";
import { format, addDays, subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import {
  formatWaybackTimestamp,
  saturdayToWednesday,
  getMostRecentSaturday,
} from "@/lib/utils/dates";
import type { CompetitorAdsApiResponse, RetailerAdData, RetailerSnapshot } from "@/types/competitor-ads";
import { cacheScreenshotsForWeek } from "@/lib/competitor-ads/screenshotCache";
import { waitUntil } from "@vercel/functions";

export const maxDuration = 300;

const CDX_BASE = "http://web.archive.org/cdx/search/cdx";

const RETAILERS = [
  {
    id: "cvs",
    name: "CVS Pharmacy",
    shortName: "CVS",
    color: "#CC0000",
    url: "www.cvs.com",
    directUrl: "https://www.cvs.com",
  },
  {
    id: "walgreens",
    name: "Walgreens",
    shortName: "Walgreens",
    color: "#E31837",
    url: "www.walgreens.com",
    directUrl: "https://www.walgreens.com",
  },
  {
    id: "walmart",
    name: "Walmart",
    shortName: "Walmart",
    color: "#0071CE",
    url: "www.walmart.com",
    directUrl: "https://www.walmart.com",
  },
  {
    id: "costco",
    name: "Costco",
    shortName: "Costco",
    color: "#005DAA",
    url: "www.costco.com",
    directUrl: "https://www.costco.com",
  },
  {
    id: "kroger",
    name: "Kroger",
    shortName: "Kroger",
    color: "#1F5FA6",
    url: "www.kroger.com",
    directUrl: "https://www.kroger.com",
  },
];

/**
 * Search CDX within ±windowDays of targetDate.
 * Returns the snapshot with a timestamp closest to targetDate.
 */
async function getCdxSnapshot(
  url: string,
  targetDate: Date,
  label: string,
  windowDays = 5
): Promise<RetailerSnapshot> {
  const from = format(subDays(targetDate, windowDays), "yyyyMMdd");
  const to = format(addDays(targetDate, windowDays), "yyyyMMdd");

  const params = new URLSearchParams({
    url,
    from,
    to,
    output: "json",
    fl: "timestamp,original",
    filter: "statuscode:200",
    limit: "5",
    collapse: "timestamp:8", // deduplicate by day
  });

  try {
    const res = await fetch(`${CDX_BASE}?${params}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`CDX API ${res.status}`);

    const rows: string[][] = await res.json();
    if (!rows || rows.length < 2) {
      // No results — widen to ±14 days if default window failed
      if (windowDays < 14) return getCdxSnapshot(url, targetDate, label, 14);
      return { archiveUrl: null, timestamp: null, date: null, label, error: null, screenshotUrl: null };
    }

    // rows[0] is the header row; find data row with timestamp closest to targetDate
    const targetTs = parseInt(format(targetDate, "yyyyMMddHHmmss"), 10);
    const dataRows = rows.slice(1);

    let best = dataRows[0];
    let minDiff = Math.abs(parseInt(best[0], 10) - targetTs);
    for (const row of dataRows.slice(1)) {
      const diff = Math.abs(parseInt(row[0], 10) - targetTs);
      if (diff < minDiff) {
        minDiff = diff;
        best = row;
      }
    }

    const [timestamp, original] = best;
    return {
      archiveUrl: `https://web.archive.org/web/${timestamp}/${original}`,
      timestamp,
      date: formatWaybackTimestamp(timestamp),
      label,
      error: null,
      screenshotUrl: null,
    };
  } catch (e) {
    return {
      archiveUrl: null,
      timestamp: null,
      date: null,
      label,
      error: e instanceof Error ? e.message : "CDX lookup failed",
      screenshotUrl: null,
    };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const weekEndParam = searchParams.get("weekEnd");
  const saturday = weekEndParam
    ? new Date(`${weekEndParam}T12:00:00`)
    : getMostRecentSaturday();

  const weekEndKey = format(saturday, "yyyy-MM-dd");

  const supabase = createClient();
  const { data: cached } = await supabase
    .from("competitor_ads_cache")
    .select("data")
    .eq("week_end", weekEndKey)
    .single();

  if (cached) {
    const data = cached.data as CompetitorAdsApiResponse;
    const needsScreenshots = data.retailers.some(
      (r) =>
        (r.prevWeek.archiveUrl && !r.prevWeek.screenshotUrl) ||
        (r.lastYear.archiveUrl && !r.lastYear.screenshotUrl)
    );
    if (needsScreenshots) waitUntil(cacheScreenshotsForWeek(weekEndKey, data));
    return NextResponse.json(data, {
      headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=86400" },
    });
  }

  const prevWed = saturdayToWednesday(saturday);
  const lastYearWed = saturdayToWednesday(subDays(saturday, 364));

  const prevWeekLabel = format(prevWed, "MMM d, yyyy");
  const lastYearLabel = format(lastYearWed, "MMM d, yyyy");

  // All 10 CDX lookups in parallel
  const results = await Promise.allSettled(
    RETAILERS.map(async (retailer) => {
      const [prevSnap, lastYearSnap] = await Promise.all([
        getCdxSnapshot(retailer.url, prevWed, prevWeekLabel),
        getCdxSnapshot(retailer.url, lastYearWed, lastYearLabel),
      ]);
      const result: RetailerAdData = {
        id: retailer.id,
        name: retailer.name,
        shortName: retailer.shortName,
        color: retailer.color,
        prevWeek: prevSnap,
        lastYear: lastYearSnap,
        directUrl: retailer.directUrl,
      };
      return result;
    })
  );

  const noSnap = (label: string): RetailerSnapshot => ({
    archiveUrl: null,
    timestamp: null,
    date: null,
    label,
    error: "Request failed",
    screenshotUrl: null,
  });

  const retailers: RetailerAdData[] = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      id: RETAILERS[i].id,
      name: RETAILERS[i].name,
      shortName: RETAILERS[i].shortName,
      color: RETAILERS[i].color,
      prevWeek: noSnap(prevWeekLabel),
      lastYear: noSnap(lastYearLabel),
      directUrl: RETAILERS[i].directUrl,
    };
  });

  const response: CompetitorAdsApiResponse = {
    generatedAt: new Date().toISOString(),
    prevWeekLabel,
    lastYearLabel,
    retailers,
  };

  await supabase
    .from("competitor_ads_cache")
    .insert({ week_end: weekEndKey, data: response });

  waitUntil(cacheScreenshotsForWeek(weekEndKey, response));

  return NextResponse.json(response, {
    headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=86400" },
  });
}
