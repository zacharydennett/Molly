"use client";

import { useRef, useEffect } from "react";
import type { PieceDefinition } from "@/types/tetris";
import { CELL_SIZE } from "@/lib/tetris/engine";
import { drawNextPiece } from "@/lib/tetris/renderer";

interface Props {
  piece: PieceDefinition;
}

export function NextPieceCanvas({ piece }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = piece.imageAsset;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const images = new Map([[piece.id, img]]);
      const colors = new Map([[piece.id, piece.color]]);
      drawNextPiece(ctx, piece.id, piece.shapes, images, colors);
    };

    if (img.complete) {
      imageRef.current = img;
      draw();
    } else {
      img.onload = () => {
        imageRef.current = img;
        draw();
      };
    }

    // Also draw immediately with whatever we have (color fallback)
    draw();
  }, [piece]);

  // Redraw when piece changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = imageRef.current;
    const images = img ? new Map([[piece.id, img]]) : new Map<number, HTMLImageElement>();
    const colors = new Map([[piece.id, piece.color]]);
    drawNextPiece(ctx, piece.id, piece.shapes, images, colors);
  }, [piece]);

  return (
    <canvas
      ref={canvasRef}
      width={5 * CELL_SIZE}
      height={4 * CELL_SIZE}
      className="rounded mx-auto block"
      style={{ maxWidth: "100%", height: "auto" }}
    />
  );
}
