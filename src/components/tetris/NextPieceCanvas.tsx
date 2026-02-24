"use client";

import { useRef, useEffect } from "react";
import type { PieceDefinition } from "@/types/tetris";
import { CELL_SIZE } from "@/lib/tetris/engine";
import { drawNextPiece } from "@/lib/tetris/renderer";

interface Props {
  piece: PieceDefinition;
}

const LOGICAL_W = 5 * CELL_SIZE;
const LOGICAL_H = 4 * CELL_SIZE;

export function NextPieceCanvas({ piece }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dprSetup = useRef(false);

  const redraw = (img?: HTMLImageElement | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resolvedImg = img ?? imageRef.current;
    const images = resolvedImg ? new Map([[piece.id, resolvedImg]]) : new Map<number, HTMLImageElement>();
    const colors = new Map([[piece.id, piece.color]]);
    drawNextPiece(ctx, piece.id, piece.shapes, images, colors);
  };

  // Set up DPR scaling once on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dprSetup.current) return;
    dprSetup.current = true;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = LOGICAL_W * dpr;
    canvas.height = LOGICAL_H * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  useEffect(() => {
    const img = new window.Image();
    img.src = piece.imageAsset;

    if (img.complete) {
      imageRef.current = img;
      redraw(img);
    } else {
      img.onload = () => {
        imageRef.current = img;
        redraw(img);
      };
    }

    // Also draw immediately with color fallback
    redraw();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piece]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: LOGICAL_W,
        height: LOGICAL_H,
        maxWidth: "100%",
        height: "auto",
        display: "block",
        margin: "0 auto",
        borderRadius: "0.25rem",
      }}
    />
  );
}
