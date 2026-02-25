export type IllnessLevel =
  | "minimal"
  | "low"
  | "moderate"
  | "high"
  | "very_high"
  | "unknown";

export type Trend = "rising" | "falling" | "stable" | "unknown";

export interface FluDataPoint {
  epiweek: number;
  wili: number;
  numIli: number;
  numPatients: number;
  weekLabel: string;
}

/** One week of CDC NWSS Wastewater Viral Activity Level (WVAL) data */
export interface WastewaterWVAL {
  weekEnding: string;        // ISO date "2026-02-14"
  weekLabel: string;         // "Feb 14"
  national: number | null;   // National_WVAL (0–10+ scale)
  midwest: number | null;
  northeast: number | null;
  south: number | null;
  west: number | null;
  nationalLY: number | null; // same-week-last-year national WVAL
}

export interface IllnessApiResponse {
  generatedAt: string;
  flu: {
    thisWeek: FluDataPoint | null;
    lastWeek: FluDataPoint | null;
    sameWeekLastYear: FluDataPoint | null;
    trend: Trend;
    nationalLevel: IllnessLevel;
    error: string | null;
  };
  wastewater: {
    current: WastewaterWVAL | null;          // most recent week
    trendSeries: WastewaterWVAL[];            // up to 12 weeks, oldest first
    level: IllnessLevel;
    trend: Trend;
    error: string | null;
  };
}
