"use client";

import { useTetrisScores } from "@/hooks/useTetrisScores";
import { formatScore } from "@/lib/utils/formatters";
import { Trophy } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

interface Props {
  highlightScore?: number;
}

export function Leaderboard({ highlightScore }: Props) {
  const { scores, isLoading } = useTetrisScores();

  return (
    <Card className="min-w-[200px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-molly-amber" />
          High Scores
        </CardTitle>
      </CardHeader>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-6 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <ol className="space-y-1">
          {scores.length === 0 && (
            <li className="text-xs text-molly-slate text-center py-2">
              No scores yet — be first!
            </li>
          )}
          {scores.map((s, i) => {
            const isHighlight = highlightScore != null && s.score === highlightScore;
            return (
              <li
                key={s.id}
                className={`flex items-center gap-2 py-1 px-2 rounded text-sm ${
                  isHighlight ? "bg-molly-amber text-white font-bold" : ""
                }`}
              >
                <span
                  className={`w-5 text-xs font-bold text-center ${
                    i === 0
                      ? "text-yellow-500"
                      : i === 1
                      ? "text-slate-400"
                      : i === 2
                      ? "text-amber-600"
                      : "text-molly-slate"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="font-mono font-bold text-molly-ink w-10 uppercase">
                  {s.player_name}
                </span>
                <span className="flex-1 text-right font-mono text-xs text-molly-slate">
                  {formatScore(s.score)}
                </span>
                <span className="text-xs text-molly-slate">Lv{s.level}</span>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
