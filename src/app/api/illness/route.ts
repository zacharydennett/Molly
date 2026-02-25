import { NextResponse } from "next/server";
import { getCurrentEpiweeks } from "@/lib/utils/dates";
import type {
  IllnessApiResponse,
  FluDataPoint,
  WastewaterWVAL,
  IllnessLevel,
  Trend,
} from "@/types/illness";
import { format } from "date-fns";

const DELPHI_FLU_URL = "https://api.delphi.cmu.edu/epidata/fluview/";
const NWSS_CSV_URL =
  "https://www.cdc.gov/wcms/vizdata/NCEZID_DIDRI/sc2/nwsssc2regionalactivitylevelDL.csv";

function getFluLevel(wili: number): IllnessLevel {
  if (wili < 2.5) return "minimal";
  if (wili < 5) return "low";
  if (wili < 7.5) return "moderate";
  if (wili < 10) return "high";
  return "very_high";
}

// CDC WVAL thresholds: Very Low ≤2, Low 2–3.4, Moderate 3.4–5.3, High 5.3–7.8, Very High >7.8
function getWastewaterLevel(wval: number | null): IllnessLevel {
  if (wval == null) return "unknown";
  if (wval <= 2) return "minimal";
  if (wval <= 3.4) return "low";
  if (wval <= 5.3) return "moderate";
  if (wval <= 7.8) return "high";
  return "very_high";
}

function getTrend(
  current: number | null | undefined,
  previous: number | null | undefined
): Trend {
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

// ─── Wastewater (CDC NWSS WVAL CSV) ──────────────────────────────────────────

interface NwssRawRow {
  weekEnding: string;
  national: number | null;
  midwest: number | null;
  northeast: number | null;
  south: number | null;
  west: number | null;
}

function parseNwssCsv(text: string): NwssRawRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  // Strip surrounding quotes and \r from a cell value
  const clean = (s: string) => s.trim().replace(/\r/g, "").replace(/^"|"$/g, "");

  const headers = lines[0].split(",").map(clean);

  const parseVal = (s: string | undefined): number | null => {
    if (!s || s === "" || s.toLowerCase() === "na") return null;
    const n = parseFloat(s);
    return isNaN(n) ? null : Math.round(n * 100) / 100;
  };

  const rows = lines
    .slice(1)
    .map((line) => {
      const vals = line.split(",").map(clean);
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = vals[i] ?? "";
      });
      return {
        weekEnding: obj["Week_Ending_Date"] ?? "",
        national: parseVal(obj["National_WVAL"]),
        midwest: parseVal(obj["Midwest_WVAL"]),
        northeast: parseVal(obj["Northeast_WVAL"]),
        south: parseVal(obj["South_WVAL"]),
        west: parseVal(obj["West_WVAL"]),
      };
    })
    .filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.weekEnding));

  // Deduplicate — keep one row per date (CSV has duplicate date entries)
  const seen = new Set<string>();
  return rows.filter((r) => {
    if (seen.has(r.weekEnding)) return false;
    seen.add(r.weekEnding);
    return true;
  });
}

async function fetchWastewaterData(): Promise<{
  current: WastewaterWVAL | null;
  trendSeries: WastewaterWVAL[];
  error: string | null;
}> {
  try {
    const res = await fetch(NWSS_CSV_URL, { next: { revalidate: 43200 } });
    if (!res.ok) throw new Error(`NWSS CSV ${res.status}`);
    const text = await res.text();
    const rows = parseNwssCsv(text);

    // Sort newest first
    rows.sort((a, b) => b.weekEnding.localeCompare(a.weekEnding));

    if (rows.length === 0) {
      return { current: null, trendSeries: [], error: "No NWSS data in CSV" };
    }

    // Build lookup map for same-week-last-year matching
    const byDate = new Map(rows.map((r) => [r.weekEnding, r]));

    const makePoint = (raw: NwssRawRow, lyRaw?: NwssRawRow): WastewaterWVAL => ({
      weekEnding: raw.weekEnding,
      weekLabel: format(new Date(`${raw.weekEnding}T12:00:00Z`), "MMM d"),
      national: raw.national,
      midwest: raw.midwest,
      northeast: raw.northeast,
      south: raw.south,
      west: raw.west,
      nationalLY: lyRaw?.national ?? null,
    });

    // Find the closest row to 52 weeks (364 days) prior
    const findLY = (weekEnding: string): NwssRawRow | undefined => {
      const ms = new Date(`${weekEnding}T12:00:00Z`).getTime();
      const lyMs = ms - 364 * 24 * 60 * 60 * 1000;
      const lyStr = format(new Date(lyMs), "yyyy-MM-dd");
      if (byDate.has(lyStr)) return byDate.get(lyStr);
      for (let d = 1; d <= 7; d++) {
        const earlier = format(new Date(lyMs - d * 86400000), "yyyy-MM-dd");
        const later = format(new Date(lyMs + d * 86400000), "yyyy-MM-dd");
        if (byDate.has(earlier)) return byDate.get(earlier);
        if (byDate.has(later)) return byDate.get(later);
      }
      return undefined;
    };

    // Take 12 most recent, reverse for oldest-first chart display
    const recentRows = rows.slice(0, 12);
    const trendSeries = recentRows
      .map((row) => makePoint(row, findLY(row.weekEnding)))
      .reverse();

    const current = makePoint(rows[0], findLY(rows[0].weekEnding));

    return { current, trendSeries, error: null };
  } catch (e) {
    return {
      current: null,
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

  const wwLevel = getWastewaterLevel(wastewaterResult.current?.national ?? null);
  // Trend: compare current to previous week (second-to-last in trendSeries)
  const wwPrevWeek =
    wastewaterResult.trendSeries.length >= 2
      ? wastewaterResult.trendSeries[wastewaterResult.trendSeries.length - 2]
      : null;
  const wwTrend = getTrend(
    wastewaterResult.current?.national,
    wwPrevWeek?.national
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
      current: wastewaterResult.current,
      trendSeries: wastewaterResult.trendSeries,
      level: wwLevel,
      trend: wwTrend,
      error: wastewaterResult.error,
    },
  };

  return NextResponse.json(response, {
    headers: { "Cache-Control": "s-maxage=43200, stale-while-revalidate=86400" },
  });
}
