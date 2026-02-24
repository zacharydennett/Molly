"use client";

import { TetrisGame } from "@/components/tetris/TetrisGame";
import { Gamepad2 } from "lucide-react";

export function TetrisPageClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-molly-navy flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-molly-red" />
          Molly Blocks — Health &amp; Wellness Edition
        </h1>
        <p className="text-sm text-molly-slate mt-1">
          Tetris with your favorite health products. High scores are shared across all players!
        </p>
      </div>

      {/* Product legend */}
      <div className="flex flex-wrap gap-2">
        {[
          { name: "Tylenol", color: "#E8001C", piece: "I" },
          { name: "Nature's Made", color: "#EA580C", piece: "O" },
          { name: "Kleenex", color: "#0284C7", piece: "T" },
          { name: "NyQuil", color: "#1D4ED8", piece: "S" },
          { name: "Advil", color: "#DC2626", piece: "Z" },
          { name: "Pampers", color: "#0369A1", piece: "L" },
          { name: "Band-Aid", color: "#B45309", piece: "J" },
        ].map(({ name, color, piece }) => (
          <div
            key={name}
            className="flex items-center gap-1.5 text-xs bg-white rounded-lg px-2 py-1 border border-slate-100 shadow-sm"
          >
            <span
              className="w-4 h-4 rounded-sm text-white flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: color }}
            >
              {piece}
            </span>
            <span className="text-molly-ink">{name}</span>
          </div>
        ))}
      </div>

      <TetrisGame />
    </div>
  );
}
