import useSWR from "swr";
import type { TetrisScore } from "@/types/tetris";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useTetrisScores() {
  const { data, error, isLoading, mutate } = useSWR<{ scores: TetrisScore[] }>(
    "/api/tetris/scores",
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 30000 }
  );
  return {
    scores: data?.scores ?? [],
    error,
    isLoading,
    refresh: mutate,
  };
}

export async function submitScore(
  playerName: string,
  score: number,
  level: number,
  lines: number
) {
  const res = await fetch("/api/tetris/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_name: playerName, score, level, lines }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
