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

export interface WastewaterDataPoint {
  weekEnding: string;         // ISO date "2026-02-14"
  weekLabel: string;          // "Week of Feb 14"
  sitesReporting: number;
  avgPercentile: number | null;  // 0–100: avg percentile vs historical at each site
  detectProp: number | null;     // 0–100: % of sites detecting COVID
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
    thisWeek: WastewaterDataPoint | null;
    lastWeek: WastewaterDataPoint | null;
    sameWeekLastYear: WastewaterDataPoint | null;
    trendSeries: WastewaterDataPoint[];  // up to 12 weeks, oldest first
    trend: Trend;
    level: IllnessLevel;
    error: string | null;
  };
}
