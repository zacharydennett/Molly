export interface WeekSummary {
  startDate: string;
  endDate: string;
  avgTempF: number;
  minTempF: number;
  maxTempF: number;
  totalSnowfallInches: number;
  dominantWeatherCode: number;
  hasSevereStorm: boolean;
  stormLabel: string | null;
}

export interface RegionWeekData {
  regionId: string;
  regionLabel: string;
  city: string;
  lat: number;
  lon: number;
  weeks: {
    lastWeek: WeekSummary;
    previousWeek: WeekSummary;
    sameWeekLastYear: WeekSummary;
  };
}

export interface WeatherApiResponse {
  generatedAt: string;
  regions: RegionWeekData[];
}

export type WeekKey = "lastWeek" | "previousWeek" | "sameWeekLastYear";
