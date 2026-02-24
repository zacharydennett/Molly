import { NextResponse } from "next/server";
import { format } from "date-fns";
import {
  formatWaybackTimestamp,
  getPrevWeekWednesday,
  getLastYearWednesday,
  toWaybackTimestamp,
} from "@/lib/utils/dates";
import type { CompetitorAdsApiResponse, RetailerAdData, RetailerSnapshot } from "@/types/competitor-ads";

const RETAILERS = [
  {
    id: "cvs",
    name: "CVS Pharmacy",
    shortName: "CVS",
    color: "#CC0000",
    url: "www.cvs.com/shop",
    directUrl: "https://www.cvs.com/shop",
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

async function getWaybackSnapshot(
  url: string,
  targetDate: Date,
  label: string
): Promise<RetailerSnapshot> {
  const ts = toWaybackTimestamp(targetDate);
  const apiUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}&timestamp=${ts}`;

  try {
    const res = await fetch(apiUrl, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`Wayback API ${res.status}`);

    const data = await res.json();
    const closest = data?.archived_snapshots?.closest;

    if (!closest?.available) {
      return { archiveUrl: null, timestamp: null, date: null, label, error: null };
    }

    // Normalize to https
    const archiveUrl = (closest.url as string).replace(
      "http://web.archive.org",
      "https://web.archive.org"
    );

    return {
      archiveUrl,
      timestamp: closest.timestamp,
      date: formatWaybackTimestamp(closest.timestamp),
      label,
      error: null,
    };
  } catch (e) {
    return {
      archiveUrl: null,
      timestamp: null,
      date: null,
      label,
      error: e instanceof Error ? e.message : "Wayback lookup failed",
    };
  }
}

export async function GET() {
  const prevWed = getPrevWeekWednesday();
  const lastYearWed = getLastYearWednesday();

  const prevWeekLabel = format(prevWed, "MMM d, yyyy");
  const lastYearLabel = format(lastYearWed, "MMM d, yyyy");

  // Fetch both snapshots for all 5 retailers in parallel (10 total requests)
  const results = await Promise.allSettled(
    RETAILERS.map(async (retailer) => {
      const [prevSnap, lastYearSnap] = await Promise.all([
        getWaybackSnapshot(retailer.url, prevWed, prevWeekLabel),
        getWaybackSnapshot(retailer.url, lastYearWed, lastYearLabel),
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

  return NextResponse.json(response, {
    headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=86400" },
  });
}
