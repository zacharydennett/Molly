import useSWR from "swr";
import type { WeatherApiResponse } from "@/types/weather";
import { useWeek } from "@/contexts/WeekContext";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useWeatherData() {
  const { weekEnd } = useWeek();
  const { data, error, isLoading, mutate } = useSWR<WeatherApiResponse>(
    `/api/weather?weekEnd=${weekEnd}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 21600000 }
  );
  return { data, error, isLoading, refetch: mutate };
}
