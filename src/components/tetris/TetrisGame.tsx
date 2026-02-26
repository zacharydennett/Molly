"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTetrisGame } from "@/hooks/useTetrisGame";
import { useTetrisScores, submitScore } from "@/hooks/useTetrisScores";
import { TetrisCanvas } from "./TetrisCanvas";
import { TetrisControls } from "./TetrisControls";
import { Leaderboard } from "./Leaderboard";
import { NameEntryModal } from "./NameEntryModal";
import { NextPieceCanvas } from "./NextPieceCanvas";
import { formatScore } from "@/lib/utils/formatters";
import { CELL_SIZE } from "@/lib/tetris/engine";
import { Play, RotateCcw, Pause, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function TetrisGame() {
  const { scores } = useTetrisScores();
  const topScore = scores[0]?.score ?? 0;

  const { state, start, reset, pause, resume, moveLeft, moveRight, rotate, softDrop, hardDrop } =
    useTetrisGame(topScore);

  const [showNameEntry, setShowNameEntry] = useState(false);
  const [savedScore, setSavedScore] = useState<number | null>(null);
  const { refresh } = useTetrisScores();

  // Show name entry on game over if it's a high score
  const prevStatus = useRef(state.status);
  useEffect(() => {
    if (prevStatus.current === "playing" && state.status === "gameover") {
      const isHighScore = state.score > 0 && (scores.length < 10 || state.score >= (scores[scores.length - 1]?.score ?? 0));
      if (isHighScore) setShowNameEntry(true);
    }
    prevStatus.current = state.status;
  }, [state.status, state.score, scores]);

  const handleNameSubmit = useCallback(
    async (name: string) => {
      await submitScore(name, state.score, state.level, state.lines);
      setSavedScore(state.score);
      setShowNameEntry(false);
      await refresh();
    },
    [state.score, state.level, state.lines, refresh]
  );

  const nextPieceDef = state.nextPiece;

  return (
    <>
      {showNameEntry && (
        <NameEntryModal
          score={state.score}
          level={state.level}
          lines={state.lines}
          onSubmit={handleNameSubmit}
          onSkip={() => setShowNameEntry(false)}
        />
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        {/* Game area */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <TetrisCanvas
              gameState={state}
              onSwipeLeft={moveLeft}
              onSwipeRight={moveRight}
              onSwipeDown={hardDrop}
              onTap={rotate}
            />

            {/* Overlay: idle */}
            {state.status === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 rounded-lg gap-4">
                <div className="text-center text-white">
                  <p className="text-2xl font-black text-molly-amber mb-1">🎮 POG PROCESS</p>
                  <p className="text-sm opacity-70">Health &amp; Wellness Edition</p>
                </div>
                <button
                  onClick={start}
                  className="flex items-center gap-2 bg-molly-red text-white font-bold px-8 py-3 rounded-xl hover:bg-molly-red-dark transition-colors text-lg"
                >
                  <Play className="w-5 h-5" />
                  Start Game
                </button>
              </div>
            )}

            {/* Overlay: paused */}
            {state.status === "paused" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 rounded-lg gap-4">
                <p className="text-2xl font-black text-white">PAUSED</p>
                <button
                  onClick={resume}
                  className="flex items-center gap-2 bg-molly-navy text-white font-bold px-8 py-3 rounded-xl hover:bg-molly-navy-light transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Resume
                </button>
              </div>
            )}

            {/* Overlay: game over */}
            {state.status === "gameover" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/85 rounded-lg gap-4">
                <div className="text-center">
                  <p className="text-3xl font-black text-molly-red">GAME OVER</p>
                  <p className="text-white text-xl font-mono font-bold mt-1">
                    {formatScore(state.score)}
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 bg-molly-red text-white font-bold px-8 py-3 rounded-xl hover:bg-molly-red-dark transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </button>
              </div>
            )}
          </div>

          {/* Mobile controls */}
          <TetrisControls
            onLeft={moveLeft}
            onRight={moveRight}
            onRotate={rotate}
            onSoftDrop={softDrop}
            onHardDrop={hardDrop}
          />
        </div>

        {/* Side panel */}
        <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-64 flex-wrap">
          {/* Score */}
          <Card className="flex-1 lg:flex-none">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-molly-slate uppercase tracking-wide">Score</p>
                <p className="text-2xl font-black font-mono text-molly-red">
                  {formatScore(state.score)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-molly-slate">Level</p>
                  <p className="font-bold text-molly-navy font-mono">{state.level}</p>
                </div>
                <div>
                  <p className="text-molly-slate">Lines</p>
                  <p className="font-bold text-molly-navy font-mono">{state.lines}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Next piece */}
          <Card className="flex-1 lg:flex-none">
            <p className="text-xs font-semibold text-molly-slate uppercase tracking-wide mb-2">Next</p>
            {nextPieceDef ? (
              <div className="space-y-1">
                <NextPieceCanvas piece={nextPieceDef} />
                <p className="text-xs text-center text-molly-slate font-medium mt-1">
                  {nextPieceDef.name}
                </p>
              </div>
            ) : (
              <div className="w-full h-12 bg-slate-100 rounded" />
            )}
          </Card>

          {/* Controls */}
          {state.status === "playing" && (
            <div className="flex gap-2 lg:flex-col">
              <button
                onClick={pause}
                className="flex-1 flex items-center justify-center gap-1 text-xs text-molly-slate bg-slate-100 hover:bg-slate-200 rounded-xl py-2 px-3 transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                Pause
              </button>
              <button
                onClick={reset}
                className="flex-1 flex items-center justify-center gap-1 text-xs text-molly-slate bg-slate-100 hover:bg-slate-200 rounded-xl py-2 px-3 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restart
              </button>
            </div>
          )}

          {/* Keyboard hints (desktop) */}
          <Card className="hidden lg:block text-xs text-molly-slate">
            <p className="font-semibold text-molly-ink mb-2 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Controls
            </p>
            <div className="space-y-1">
              {[
                ["←→", "Move"],
                ["↑ / Z", "Rotate"],
                ["↓", "Soft drop"],
                ["Space", "Hard drop"],
                ["P / Esc", "Pause"],
              ].map(([key, action]) => (
                <div key={key} className="flex justify-between">
                  <kbd className="bg-slate-100 px-1 rounded text-xs font-mono">{key}</kbd>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Leaderboard */}
          <Leaderboard highlightScore={savedScore ?? undefined} />
        </div>
      </div>
    </>
  );
}
