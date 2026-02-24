"use client";

import { useRef, useEffect } from "react";
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
  const images = useRef<Map<number, HTMLImageElement>>(new Map());
  const colorMap = useRef<Map<number, string>>(new Map());
  const imagesLoadedRef = useRef(0);

  // Pre-load all product images; redraw canvas once each loads
  useEffect(() => {
    PIECES.forEach((piece) => {
      colorMap.current.set(piece.id, piece.color);

      const img = new window.Image();
      img.src = piece.imageAsset;
      img.onload = () => {
        images.current.set(piece.id, img);
        imagesLoadedRef.current += 1;
        // Trigger a redraw now that this image is ready
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        drawFrame(ctx, gameState.board, gameState.currentPiece, images.current, colorMap.current);
      };
      img.onerror = () => {
        // Image failed — color fallback is already handled in renderer
        colorMap.current.set(piece.id, piece.color);
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw whenever game state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawFrame(ctx, gameState.board, gameState.currentPiece, images.current, colorMap.current);
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

    if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 200) {
      onTap?.();
    } else if (Math.abs(dy) > Math.abs(dx) && dy > 40) {
      onSwipeDown?.();
    } else if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < -20) onSwipeLeft?.();
      else if (dx > 20) onSwipeRight?.();
    }
    touchStart.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      width={COLS * CELL_SIZE}
      height={ROWS * CELL_SIZE}
      className="rounded-lg border-2 border-slate-700 shadow-xl cursor-pointer"
      style={{ maxWidth: "100%", height: "auto", touchAction: "none" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    />
  );
}
