"use client";

import { TetrisGame } from "@/components/tetris/TetrisGame";
import { Gamepad2 } from "lucide-react";
import { PIECES } from "@/lib/tetris/pieces";

export function TetrisPageClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-molly-navy flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-molly-red" />
          POG Process — Health &amp; Wellness Edition
        </h1>
        <p className="text-sm text-molly-slate mt-1">
          Match real product packaging pieces. High scores are shared across all players!
        </p>
      </div>

      {/* Product legend */}
      <div className="flex flex-wrap gap-2">
        {PIECES.map((piece) => (
          <div
            key={piece.id}
            className="flex items-center gap-2 text-xs bg-white rounded-lg px-2 py-1.5 border border-slate-100 shadow-sm"
          >
            {/* Thumbnail of actual product image */}
            <div
              className="w-8 h-8 rounded overflow-hidden shrink-0 border border-slate-200"
              style={{ backgroundColor: piece.bgColor }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={piece.imageAsset}
                alt={piece.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-semibold text-molly-ink">{piece.name}</div>
              <div className="text-molly-slate" style={{ color: piece.color }}>
                {["I", "O", "T", "S", "Z", "L", "J"][piece.id - 1]}-piece
              </div>
            </div>
          </div>
        ))}
      </div>

      <TetrisGame />
    </div>
  );
}
