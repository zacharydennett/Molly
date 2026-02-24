import { NextResponse } from "next/server";
import { getCurrentEpiweeks } from "@/lib/utils/dates";
import type { IllnessApiResponse, FluDataPoint, CovidDataPoint, IllnessLevel, Trend } from "@/types/illness";
import { format, subWeeks, subYears } from "date-fns";

const DELPHI_FLU_URL = "https://api.delphi.cmu.edu/epidata/fluview/";
const CDC_COVID_URL = "https://data.cdc.gov/resource/3nnm-4jni.json";

function getFluLevel(wili: number): IllnessLevel {
  if (wili < 2.5) return "minimal";
  if (wili < 5) return "low";
  if (wili < 7.5) return "moderate";
  if (wili < 10) return "high";
  return "very_high";
}

function getTrend(current: number | null | undefined, previous: number | null | undefined): Trend {
  if (current == null || previous == null) return "unknown";
  const diff = current - previous;
  if (Math.abs(diff) < 0.1) return "stable";
  return diff > 0 ? "rising" : "falling";
}

function weekLabel(date: Date): string {
  return `Week of ${format(date, "MMM d")}`;
}

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

async function fetchCovidData(): Promise<{
  thisWeek: CovidDataPoint | null;
  lastWeek: CovidDataPoint | null;
  sameWeekLastYear: CovidDataPoint | null;
  error: string | null;
}> {
  const now = new Date();
  const lastWeekDate = subWeeks(now, 1);
  const lastYearDate = subYears(lastWeekDate, 1);
  const twoWeeksAgo = subWeeks(now, 2);

  // Fetch last ~56 weeks to get comparison points
  const afterDate = format(subWeeks(lastYearDate, 2), "yyyy-MM-dd");
  const url = `${CDC_COVID_URL}?$where=week_end_date>'${afterDate}'T00:00:00.000&$order=week_end_date DESC&$limit=60`;

  try {
    const res = await fetch(url, { next: { revalidate: 43200 } });
    if (!res.ok) throw new Error(`CDC COVID ${res.status}`);
    const rows: Array<{
      week_end_date: string;
      total_admissions_covid_confirmed_all_ages?: string;
      total_admissions_covid_confirmed_adult?: string;
    }> = await res.json();

    const makePoint = (targetDate: Date): CovidDataPoint | null => {
      const targetStr = format(targetDate, "yyyy-MM-dd");
      // Find closest week
      const closest = rows.find((r) => r.week_end_date?.startsWith(targetStr));
      if (!closest) {
        // Try ±3 days
        const candidates = rows.filter((r) => {
          const d = new Date(r.week_end_date);
          return Math.abs(d.getTime() - targetDate.getTime()) < 4 * 86400000;
        });
        if (!candidates.length) return null;
        const row = candidates[0];
        const admissions = parseInt(
          row.total_admissions_covid_confirmed_all_ages ??
            row.total_admissions_covid_confirmed_adult ??
            "0"
        );
        return {
          weekEnding: row.week_end_date,
          weeklyAdmissions: admissions,
          per100k: null,
          weekLabel: weekLabel(new Date(row.week_end_date)),
        };
      }
      const admissions = parseInt(
        closest.total_admissions_covid_confirmed_all_ages ??
          closest.total_admissions_covid_confirmed_adult ??
          "0"
      );
      return {
        weekEnding: closest.week_end_date,
        weeklyAdmissions: admissions,
        per100k: null,
        weekLabel: weekLabel(new Date(closest.week_end_date)),
      };
    };

    return {
      thisWeek: makePoint(now),
      lastWeek: makePoint(lastWeekDate),
      sameWeekLastYear: makePoint(lastYearDate),
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

export async function GET() {
  const [fluResult, covidResult] = await Promise.all([
    fetchFluData(),
    fetchCovidData(),
  ]);

  const fluLevel = getFluLevel(fluResult.lastWeek?.wili ?? fluResult.thisWeek?.wili ?? 0);
  const fluTrend = getTrend(
    fluResult.lastWeek?.wili ?? fluResult.thisWeek?.wili,
    fluResult.sameWeekLastYear?.wili
  );
  const covidTrend = getTrend(
    covidResult.lastWeek?.weeklyAdmissions,
    covidResult.sameWeekLastYear?.weeklyAdmissions
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
    covid: {
      thisWeek: covidResult.thisWeek,
      lastWeek: covidResult.lastWeek,
      sameWeekLastYear: covidResult.sameWeekLastYear,
      trend: covidTrend,
      error: covidResult.error,
    },
  };

  return NextResponse.json(response, {
    headers: { "Cache-Control": "s-maxage=43200, stale-while-revalidate=86400" },
  });
}
