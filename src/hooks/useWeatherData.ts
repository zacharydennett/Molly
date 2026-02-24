import useSWR from "swr";
import type { WeatherApiResponse } from "@/types/weather";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useWeatherData() {
  const { data, error, isLoading, mutate } = useSWR<WeatherApiResponse>(
    "/api/weather",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 21600000 }
  );
  return { data, error, isLoading, refetch: mutate };
}
