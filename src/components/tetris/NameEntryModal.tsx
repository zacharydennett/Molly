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
  const [firstName, setFirstName] = useState("");
  const [lastInitial, setLastInitial] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fn = firstName.trim();
    const li = lastInitial.trim().toUpperCase();
    if (!fn || !/^[A-Za-z]{1,20}$/.test(fn)) {
      setError("Enter a valid first name (letters only)");
      return;
    }
    if (!li || !/^[A-Z]$/.test(li)) {
      setError("Enter a single letter for your last initial");
      return;
    }
    const combined = `${fn} ${li}`;
    setSubmitting(true);
    try {
      await onSubmit(combined);
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
          <div className="text-left space-y-2">
            <div>
              <label className="block text-xs font-semibold text-molly-slate mb-1 uppercase tracking-wide">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value.replace(/[^A-Za-z]/g, "").slice(0, 20));
                  setError("");
                }}
                maxLength={20}
                autoFocus
                placeholder="e.g. Zachary"
                className="w-full text-lg font-semibold border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:border-molly-navy focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-molly-slate mb-1 uppercase tracking-wide">
                Last Initial
              </label>
              <input
                type="text"
                value={lastInitial}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^A-Za-z]/g, "").slice(0, 1).toUpperCase();
                  setLastInitial(val);
                  setError("");
                }}
                maxLength={1}
                placeholder="D"
                className="w-20 text-center text-xl font-black font-mono border-2 border-slate-200 rounded-xl py-2.5 focus:border-molly-navy focus:outline-none uppercase"
              />
            </div>
          </div>
          {firstName && lastInitial && (
            <p className="text-sm text-molly-slate">
              Saving as: <span className="font-bold text-molly-ink">{firstName.trim()} {lastInitial.toUpperCase()}</span>
            </p>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !firstName.trim() || !lastInitial.trim()}
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
