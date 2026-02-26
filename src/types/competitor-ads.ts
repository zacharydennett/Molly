export interface RetailerSnapshot {
  archiveUrl: string | null;
  timestamp: string | null;
  date: string | null;
  label: string;
  error: string | null;
  screenshotUrl: string | null; // Supabase Storage PNG URL; null until screenshot is ready
}

export interface RetailerAdData {
  id: string;
  name: string;
  shortName: string;
  color: string;
  prevWeek: RetailerSnapshot;
  lastYear: RetailerSnapshot;
  directUrl: string;
}

export interface CompetitorAdsApiResponse {
  generatedAt: string;
  prevWeekLabel: string;
  lastYearLabel: string;
  retailers: RetailerAdData[];
}
