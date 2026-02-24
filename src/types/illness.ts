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

export interface CovidDataPoint {
  weekEnding: string;
  weeklyAdmissions: number;
  per100k: number | null;
  weekLabel: string;
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
  covid: {
    thisWeek: CovidDataPoint | null;
    lastWeek: CovidDataPoint | null;
    sameWeekLastYear: CovidDataPoint | null;
    trend: Trend;
    error: string | null;
  };
}
