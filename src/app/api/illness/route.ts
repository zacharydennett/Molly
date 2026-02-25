import { NextResponse } from "next/server";
import { getCurrentEpiweeks } from "@/lib/utils/dates";
import type {
  IllnessApiResponse,
  FluDataPoint,
  WastewaterDataPoint,
  IllnessLevel,
  Trend,
} from "@/types/illness";
import { format, subDays, addDays, subWeeks, subYears } from "date-fns";

const DELPHI_FLU_URL = "https://api.delphi.cmu.edu/epidata/fluview/";
const NWSS_URL = "https://data.cdc.gov/resource/2ew6-ywp6.json";

function getFluLevel(wili: number): IllnessLevel {
  if (wili < 2.5) return "minimal";
  if (wili < 5) return "low";
  if (wili < 7.5) return "moderate";
  if (wili < 10) return "high";
  return "very_high";
}

function getWastewaterLevel(percentile: number | null): IllnessLevel {
  if (percentile == null) return "unknown";
  if (percentile < 10) return "minimal";
  if (percentile < 25) return "low";
  if (percentile < 50) return "moderate";
  if (percentile < 75) return "high";
  return "very_high";
}

function getTrend(current: number | null | undefined, previous: number | null | undefined): Trend {
  if (current == null || previous == null) return "unknown";
  const diff = current - previous;
  if (Math.abs(diff) < 0.5) return "stable";
  return diff > 0 ? "rising" : "falling";
}

// ─── Flu (CDC FluView via Delphi Epidata) ────────────────────────────────────

async function fetchFluData(): Promise<{
  thisWeek: FluDataPoint | null;
  lastWeek: FluDataPoint | null;
  sameWeekLastYear: FluDataPoint | null;
  error: string | null;
}> {
  const epiweeks = getCurrentEpiweeks();
  const epiStr = `${epiweeks.thisWeek},${epiweeks.lastWeek},${epiweeks.sameWeekLastYear}`;
  const url = `${DELPHI_FLU_URL}?regions=nat&epiweeks=${epiStr}`;

  try {
    const res = await fetch(url, { next: { revalidate: 43200 } });
    if (!res.ok) throw new Error(`Delphi API ${res.status}`);
    const json = await res.json();

    if (json.result !== 1 && json.result !== 2) {
      throw new Error(`Delphi result code: ${json.result}`);
    }

    const rows: Array<{
      epiweek: number;
      wili: number;
      num_ili: number;
      num_patients: number;
    }> = json.epidata ?? [];

    const makePoint = (epiweek: number): FluDataPoint | null => {
      const row = rows.find((r) => r.epiweek === epiweek);
      if (!row) return null;
      const weekNum = epiweek % 100;
      const year = Math.floor(epiweek / 100);
      return {
        epiweek: row.epiweek,
        wili: Math.round(row.wili * 100) / 100,
        numIli: row.num_ili ?? 0,
        numPatients: row.num_patients ?? 0,
        weekLabel: `Epiweek ${weekNum}, ${year}`,
      };
    };

    return {
      thisWeek: makePoint(epiweeks.thisWeek),
      lastWeek: makePoint(epiweeks.lastWeek),
      sameWeekLastYear: makePoint(epiweeks.sameWeekLastYear),
      error: null,
    };
  } catch (e) {
    return {
      thisWeek: null,
      lastWeek: null,
      sameWeekLastYear: null,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

// ─── Wastewater (CDC NWSS) ───────────────────────────────────────────────────

interface NwssAggRow {
  date_end: string;
  avg_percentile: string;
  avg_detect_prop: string;
  site_count: string;
}

async function fetchNwssAggregated(fromDate: string, toDate: string | null): Promise<NwssAggRow[]> {
  const whereClause = toDate
    ? `date_end >= '${fromDate}T00:00:00.000' AND date_end <= '${toDate}T23:59:59.000'`
    : `date_end >= '${fromDate}T00:00:00.000'`;

  const params = new URLSearchParams({
    $select: "date_end,avg(percentile) as avg_percentile,avg(detect_prop_15d) as avg_detect_prop,count(*) as site_count",
    $where: whereClause,
    $group: "date_end",
    $order: "date_end DESC",
    $limit: "15",
  });

  const res = await fetch(`${NWSS_URL}?${params}`, { next: { revalidate: 43200 } });
  if (!res.ok) throw new Error(`NWSS API ${res.status}`);
  return res.json();
}

function makeWastewaterPoint(row: NwssAggRow): WastewaterDataPoint {
  const dateStr = row.date_end.split("T")[0]; // "2026-02-14"
  const d = new Date(`${dateStr}T12:00:00Z`);
  const avgPct = row.avg_percentile ? parseFloat(row.avg_percentile) : null;
  const detectRaw = row.avg_detect_prop ? parseFloat(row.avg_detect_prop) : null;
  return {
    weekEnding: dateStr,
    weekLabel: `Week of ${format(d, "MMM d")}`,
    sitesReporting: parseInt(row.site_count, 10) || 0,
    avgPercentile: avgPct != null ? Math.round(avgPct) : null,
    // detect_prop_15d is a 0–1 proportion; convert to 0–100 percentage
    detectProp: detectRaw != null ? Math.round(detectRaw * 100) : null,
  };
}

async function fetchWastewaterData(): Promise<{
  thisWeek: WastewaterDataPoint | null;
  lastWeek: WastewaterDataPoint | null;
  sameWeekLastYear: WastewaterDataPoint | null;
  trendSeries: WastewaterDataPoint[];
  error: string | null;
}> {
  const now = new Date();
  // Fetch ~13 weeks for the trend (91 days); newest-first from API
  const trendFrom = format(subDays(now, 91), "yyyy-MM-dd");
  // Same-week-last-year: 52 weeks back ±14 days
  const lyTarget = subDays(now, 364);
  const lyFrom = format(subDays(lyTarget, 14), "yyyy-MM-dd");
  const lyTo = format(addDays(lyTarget, 14), "yyyy-MM-dd");

  try {
    const [recentRows, lyRows] = await Promise.all([
      fetchNwssAggregated(trendFrom, null),
      fetchNwssAggregated(lyFrom, lyTo),
    ]);

    const points = recentRows.map(makeWastewaterPoint); // newest first
    const thisWeek = points[0] ?? null;
    const lastWeek = points[1] ?? null;
    const sameWeekLastYear = lyRows[0] ? makeWastewaterPoint(lyRows[0]) : null;
    // Reverse so oldest is first for charting; cap at 12 weeks
    const trendSeries = points.slice(0, 12).reverse();

    return { thisWeek, lastWeek, sameWeekLastYear, trendSeries, error: null };
  } catch (e) {
    return {
      thisWeek: null,
      lastWeek: null,
      sameWeekLastYear: null,
      trendSeries: [],
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET() {
  const [fluResult, wastewaterResult] = await Promise.all([
    fetchFluData(),
    fetchWastewaterData(),
  ]);

  const fluLevel = getFluLevel(fluResult.lastWeek?.wili ?? fluResult.thisWeek?.wili ?? 0);
  const fluTrend = getTrend(
    fluResult.lastWeek?.wili ?? fluResult.thisWeek?.wili,
    fluResult.sameWeekLastYear?.wili
  );

  const wwCurrent = wastewaterResult.thisWeek ?? wastewaterResult.lastWeek;
  const wwLevel = getWastewaterLevel(wwCurrent?.avgPercentile ?? null);
  const wwTrend = getTrend(
    wwCurrent?.avgPercentile,
    wastewaterResult.sameWeekLastYear?.avgPercentile
  );

  const response: IllnessApiResponse = {
    generatedAt: new Date().toISOString(),
    flu: {
      thisWeek: fluResult.thisWeek,
      lastWeek: fluResult.lastWeek,
      sameWeekLastYear: fluResult.sameWeekLastYear,
      trend: fluTrend,
      nationalLevel: fluLevel,
      error: fluResult.error,
    },
    wastewater: {
      thisWeek: wastewaterResult.thisWeek,
      lastWeek: wastewaterResult.lastWeek,
      sameWeekLastYear: wastewaterResult.sameWeekLastYear,
      trendSeries: wastewaterResult.trendSeries,
      trend: wwTrend,
      level: wwLevel,
      error: wastewaterResult.error,
    },
  };

  return NextResponse.json(response, {
    headers: { "Cache-Control": "s-maxage=43200, stale-while-revalidate=86400" },
  });
}
