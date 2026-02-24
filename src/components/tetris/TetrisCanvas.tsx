"use client";

import { useRef, useEffect, useMemo } from "react";
import type { TetrisGameState } from "@/types/tetris";
import { PIECES } from "@/lib/tetris/pieces";
import { COLS, ROWS, CELL_SIZE } from "@/lib/tetris/engine";
import { drawFrame } from "@/lib/tetris/renderer";

interface Props {
  gameState: TetrisGameState;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
}

export function TetrisCanvas({ gameState, onSwipeLeft, onSwipeRight, onSwipeDown, onTap }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgImages = useRef<Map<number, HTMLImageElement>>(new Map());
  const colorMap = useRef<Map<number, string>>(new Map());

  // Pre-load SVG images
  useEffect(() => {
    PIECES.forEach((piece) => {
      const img = new window.Image();
      img.src = piece.svgAsset;
      img.onload = () => {
        svgImages.current.set(piece.id, img);
        colorMap.current.set(piece.id, piece.color);
      };
      // Also set color immediately
      colorMap.current.set(piece.id, piece.color);
    });
  }, []);

  // Draw frame on state change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawFrame(ctx, gameState.board, gameState.currentPiece, svgImages.current, colorMap.current);
  }, [gameState]);

  // Touch handling
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.t;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx < 10 && absDy < 10 && dt < 200) {
      onTap?.();
    } else if (absDy > absDx && dy > 40) {
      onSwipeDown?.();
    } else if (absDx > absDy) {
      if (dx < -20) onSwipeLeft?.();
      else if (dx > 20) onSwipeRight?.();
    }
    touchStart.current = null;
  };

  const width = COLS * CELL_SIZE;
  const height = ROWS * CELL_SIZE;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg border-2 border-slate-700 shadow-xl cursor-pointer"
      style={{ maxWidth: "100%", height: "auto", touchAction: "none" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    />
  );
}
