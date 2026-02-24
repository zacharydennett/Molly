import useSWR from "swr";
import type { CompetitorAdsApiResponse } from "@/types/competitor-ads";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useCompetitorAds() {
  const { data, error, isLoading, mutate } = useSWR<CompetitorAdsApiResponse>(
    "/api/competitor-ads",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 14400000 }
  );
  return { data, error, isLoading, refetch: mutate };
}
