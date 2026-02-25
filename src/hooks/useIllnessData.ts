import useSWR from "swr";
import type { IllnessApiResponse } from "@/types/illness";
import { useWeek } from "@/contexts/WeekContext";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useIllnessData() {
  const { weekEnd } = useWeek();
  const { data, error, isLoading, mutate } = useSWR<IllnessApiResponse>(
    `/api/illness?weekEnd=${weekEnd}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 43200000 }
  );
  return { data, error, isLoading, refetch: mutate };
}
