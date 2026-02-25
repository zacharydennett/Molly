import useSWR from "swr";
import type { CompetitorAdsApiResponse } from "@/types/competitor-ads";
import { useWeek } from "@/contexts/WeekContext";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useCompetitorAds() {
  const { weekEnd } = useWeek();
  const { data, error, isLoading, mutate } = useSWR<CompetitorAdsApiResponse>(
    `/api/competitor-ads?weekEnd=${weekEnd}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 14400000 }
  );
  return { data, error, isLoading, refetch: mutate };
}
