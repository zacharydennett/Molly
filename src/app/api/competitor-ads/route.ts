import { NextResponse } from "next/server";
import { formatWaybackTimestamp } from "@/lib/utils/dates";
import type { CompetitorAdsApiResponse, RetailerAdData } from "@/types/competitor-ads";

const CDX_BASE = "http://web.archive.org/cdx/search/cdx";

const RETAILERS = [
  {
    id: "cvs",
    name: "CVS Pharmacy",
    shortName: "CVS",
    color: "#CC0000",
    url: "cvs.com/weeklyad/",
    directUrl: "https://www.cvs.com/weeklyad/",
  },
  {
    id: "walmart",
    name: "Walmart",
    shortName: "Walmart",
    color: "#0071CE",
    url: "walmart.com/shop/weekly-ad",
    directUrl: "https://www.walmart.com/shop/weekly-ad",
  },
  {
    id: "walgreens",
    name: "Walgreens",
    shortName: "Walgreens",
    color: "#E31837",
    url: "walgreens.com/offers/offers.jsp",
    directUrl: "https://www.walgreens.com/offers/offers.jsp?view=weeklyad",
  },
  {
    id: "costco",
    name: "Costco",
    shortName: "Costco",
    color: "#005DAA",
    url: "costco.com/hot-buys.html",
    directUrl: "https://www.costco.com/hot-buys.html",
  },
  {
    id: "kroger",
    name: "Kroger",
    shortName: "Kroger",
    color: "#005DAA",
    url: "kroger.com/weeklyad",
    directUrl: "https://www.kroger.com/weeklyad",
  },
];

async function getLatestSnapshot(
  targetUrl: string
): Promise<{ archiveUrl: string | null; timestamp: string | null; error: string | null }> {
  const params = new URLSearchParams({
    url: targetUrl,
    limit: "-5",
    filter: "statuscode:200",
    output: "json",
    fl: "timestamp,original,statuscode",
    collapse: "timestamp:8",
  });

  try {
    const res = await fetch(`${CDX_BASE}?${params}`, {
      next: { revalidate: 14400 }, // 4 hours
    });
    if (!res.ok) throw new Error(`CDX API ${res.status}`);

    const rows: string[][] = await res.json();
    if (!rows || rows.length < 2) return { archiveUrl: null, timestamp: null, error: null };

    // Skip header row (rows[0]), get most recent (last row)
    const lastRow = rows[rows.length - 1];
    const [timestamp, original] = lastRow;

    return {
      archiveUrl: `https://web.archive.org/web/${timestamp}/${original}`,
      timestamp,
      error: null,
    };
  } catch (e) {
    return {
      archiveUrl: null,
      timestamp: null,
      error: e instanceof Error ? e.message : "CDX lookup failed",
    };
  }
}

export async function GET() {
  const results = await Promise.allSettled(
    RETAILERS.map(async (retailer) => {
      const snap = await getLatestSnapshot(retailer.url);
      const result: RetailerAdData = {
        id: retailer.id,
        name: retailer.name,
        shortName: retailer.shortName,
        color: retailer.color,
        archiveUrl: snap.archiveUrl,
        snapshotTimestamp: snap.timestamp,
        snapshotDate: snap.timestamp ? formatWaybackTimestamp(snap.timestamp) : null,
        originalUrl: retailer.url,
        directUrl: retailer.directUrl,
        error: snap.error,
      };
      return result;
    })
  );

  const retailers: RetailerAdData[] = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      id: RETAILERS[i].id,
      name: RETAILERS[i].name,
      shortName: RETAILERS[i].shortName,
      color: RETAILERS[i].color,
      archiveUrl: null,
      snapshotTimestamp: null,
      snapshotDate: null,
      originalUrl: RETAILERS[i].url,
      directUrl: RETAILERS[i].directUrl,
      error: "Request failed",
    };
  });

  const response: CompetitorAdsApiResponse = {
    generatedAt: new Date().toISOString(),
    retailers,
  };

  return NextResponse.json(response, {
    headers: { "Cache-Control": "s-maxage=14400, stale-while-revalidate=86400" },
  });
}
