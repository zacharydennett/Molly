export interface RetailerAdData {
  id: string;
  name: string;
  shortName: string;
  color: string;
  archiveUrl: string | null;
  snapshotTimestamp: string | null;
  snapshotDate: string | null;
  originalUrl: string;
  directUrl: string;
  error: string | null;
}

export interface CompetitorAdsApiResponse {
  generatedAt: string;
  retailers: RetailerAdData[];
}
