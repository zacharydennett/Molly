import type { Board, ActivePiece } from "@/types/tetris";
import { COLS, ROWS, CELL_SIZE, getShape, getGhostY } from "./engine";

const GRID_COLOR = "#E2E8F0";
const BG_COLOR = "#0F172A";

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  board: Board,
  currentPiece: ActivePiece | null,
  svgImages: Map<number, HTMLImageElement>,
  colorMap: Map<number, string>
) {
  const width = COLS * CELL_SIZE;
  const height = ROWS * CELL_SIZE;

  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, width, height);

  // Grid lines
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 0.5;
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * CELL_SIZE, 0);
    ctx.lineTo(c * CELL_SIZE, height);
    ctx.stroke();
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * CELL_SIZE);
    ctx.lineTo(width, r * CELL_SIZE);
    ctx.stroke();
  }

  // Locked board cells
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const pieceId = board[row][col];
      if (pieceId > 0) {
        drawCell(ctx, col, row, pieceId, svgImages, colorMap);
      }
    }
  }

  // Ghost piece
  if (currentPiece) {
    const ghostY = getGhostY(board, currentPiece);
    if (ghostY !== currentPiece.y) {
      const shape = getShape(currentPiece);
      const color = colorMap.get(currentPiece.definition.id) ?? "#888";
      ctx.globalAlpha = 0.25;
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (!shape[row][col]) continue;
          const bRow = ghostY + row;
          const bCol = currentPiece.x + col;
          if (bRow < 0 || bRow >= ROWS) continue;
          ctx.fillStyle = color;
          ctx.fillRect(
            bCol * CELL_SIZE + 1,
            bRow * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
          );
        }
      }
      ctx.globalAlpha = 1;
    }

    // Active piece
    const shape = getShape(currentPiece);
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (!shape[row][col]) continue;
        const bRow = currentPiece.y + row;
        const bCol = currentPiece.x + col;
        if (bRow < 0) continue;
        drawCell(ctx, bCol, bRow, currentPiece.definition.id, svgImages, colorMap);
      }
    }
  }
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  pieceId: number,
  svgImages: Map<number, HTMLImageElement>,
  colorMap: Map<number, string>
) {
  const x = col * CELL_SIZE;
  const y = row * CELL_SIZE;
  const img = svgImages.get(pieceId);
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x, y, CELL_SIZE, CELL_SIZE);
  } else {
    // Fallback colored block
    const color = colorMap.get(pieceId) ?? "#888";
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
  }
}

export function drawNextPiece(
  ctx: CanvasRenderingContext2D,
  pieceId: number,
  shapes: number[][][],
  svgImages: Map<number, HTMLImageElement>,
  colorMap: Map<number, string>
) {
  const shape = shapes[0];
  ctx.clearRect(0, 0, 5 * CELL_SIZE, 4 * CELL_SIZE);
  ctx.fillStyle = "#1E293B";
  ctx.fillRect(0, 0, 5 * CELL_SIZE, 4 * CELL_SIZE);

  const offsetX = Math.floor((5 - shape[0].length) / 2);
  const offsetY = Math.floor((4 - shape.length) / 2);

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (!shape[row][col]) continue;
      drawCell(ctx, col + offsetX, row + offsetY, pieceId, svgImages, colorMap);
    }
  }
}
