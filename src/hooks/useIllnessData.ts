import useSWR from "swr";
import type { IllnessApiResponse } from "@/types/illness";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useIllnessData() {
  const { data, error, isLoading, mutate } = useSWR<IllnessApiResponse>(
    "/api/illness",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 43200000 }
  );
  return { data, error, isLoading, refetch: mutate };
}
