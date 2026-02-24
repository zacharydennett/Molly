"use client";

import { useState } from "react";
import { Trophy, Loader2 } from "lucide-react";
import { formatScore } from "@/lib/utils/formatters";

interface Props {
  score: number;
  level: number;
  lines: number;
  onSubmit: (name: string) => Promise<void>;
  onSkip: () => void;
}

export function NameEntryModal({ score, level, lines, onSubmit, onSkip }: Props) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = name.trim().toUpperCase().slice(0, 3);
    if (!cleaned || !/^[A-Z0-9 ]{1,3}$/.test(cleaned)) {
      setError("Enter 1–3 letters or numbers");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(cleaned);
    } catch {
      setError("Failed to save. Try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
        <div className="flex justify-center mb-3">
          <div className="bg-molly-amber rounded-full p-3">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-molly-navy mb-1">New High Score!</h2>
        <p className="text-3xl font-black text-molly-red font-mono mb-1">
          {formatScore(score)}
        </p>
        <p className="text-xs text-molly-slate mb-5">
          Level {level} · {lines} lines cleared
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm font-semibold text-molly-ink">
            Enter your initials (3 chars)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value.toUpperCase().slice(0, 3));
              setError("");
            }}
            maxLength={3}
            autoFocus
            placeholder="AAA"
            className="w-full text-center text-3xl font-black font-mono tracking-[0.5em] border-2 border-slate-200 rounded-xl py-3 focus:border-molly-navy focus:outline-none uppercase"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full py-3 bg-molly-navy text-white font-bold rounded-xl hover:bg-molly-navy-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Score"
            )}
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="w-full py-2 text-sm text-molly-slate hover:text-molly-ink"
          >
            Skip (don&apos;t save)
          </button>
        </form>
      </div>
    </div>
  );
}
