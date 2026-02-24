import type { Board, ActivePiece } from "@/types/tetris";
import { COLS, ROWS, CELL_SIZE, getShape, getGhostY } from "./engine";

const GRID_COLOR = "rgba(255,255,255,0.06)";
const BG_COLOR = "#0F172A";

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  board: Board,
  currentPiece: ActivePiece | null,
  images: Map<number, HTMLImageElement>,
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

  // Locked board cells — full product image thumbnail per cell
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const pieceId = board[row][col];
      if (pieceId > 0) {
        drawThumbnailCell(ctx, col, row, pieceId, images, colorMap);
      }
    }
  }

  // Ghost piece
  if (currentPiece) {
    const ghostY = getGhostY(board, currentPiece);
    if (ghostY !== currentPiece.y) {
      drawPieceTiled(ctx, currentPiece, ghostY, images, colorMap, 0.3);
    }

    // Active falling piece — tiled product image cropped to piece shape
    drawPieceTiled(ctx, currentPiece, currentPiece.y, images, colorMap, 1.0);
  }
}

/**
 * Draw the active piece by tiling the product image across its bounding box.
 * Each filled cell shows its proportional slice of the image — like a cookie-cutter.
 */
function drawPieceTiled(
  ctx: CanvasRenderingContext2D,
  piece: ActivePiece,
  overrideY: number,
  images: Map<number, HTMLImageElement>,
  colorMap: Map<number, string>,
  alpha: number
) {
  const shape = getShape(piece);
  const shapeRows = shape.length;
  const shapeCols = shape[0].length;
  const img = images.get(piece.definition.id);
  const color = colorMap.get(piece.definition.id) ?? "#888";

  ctx.globalAlpha = alpha;

  for (let r = 0; r < shapeRows; r++) {
    for (let c = 0; c < shapeCols; c++) {
      if (!shape[r][c]) continue;

      const destX = (piece.x + c) * CELL_SIZE;
      const destY = (overrideY + r) * CELL_SIZE;

      if (destY + CELL_SIZE <= 0) continue; // above visible area

      if (img?.complete && img.naturalWidth > 0) {
        // Crop: this cell's slice of the image based on its position in the bounding box
        const srcX = (c / shapeCols) * img.naturalWidth;
        const srcY = (r / shapeRows) * img.naturalHeight;
        const srcW = img.naturalWidth / shapeCols;
        const srcH = img.naturalHeight / shapeRows;

        ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, CELL_SIZE, CELL_SIZE);
      } else {
        // Color fallback while image loads
        ctx.fillStyle = color;
        ctx.fillRect(destX + 1, destY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      }

      // Cell border for visual separation between cells of the same piece
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.strokeRect(destX + 0.5, destY + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
    }
  }

  ctx.globalAlpha = 1.0;
}

/**
 * Draw a single locked board cell — full product image scaled to cell size.
 */
function drawThumbnailCell(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  pieceId: number,
  images: Map<number, HTMLImageElement>,
  colorMap: Map<number, string>
) {
  const x = col * CELL_SIZE;
  const y = row * CELL_SIZE;
  const img = images.get(pieceId);

  if (img?.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, x, y, CELL_SIZE, CELL_SIZE);
    // Subtle inset border
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x + 0.5, y + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
  } else {
    const color = colorMap.get(pieceId) ?? "#888";
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
  }
}

/**
 * Draw the "next piece" preview canvas — tiled image cropped to piece shape.
 */
export function drawNextPiece(
  ctx: CanvasRenderingContext2D,
  pieceId: number,
  shapes: number[][][],
  images: Map<number, HTMLImageElement>,
  colorMap: Map<number, string>
) {
  const shape = shapes[0];
  const shapeRows = shape.length;
  const shapeCols = shape[0].length;
  const previewW = 5 * CELL_SIZE;
  const previewH = 4 * CELL_SIZE;

  ctx.clearRect(0, 0, previewW, previewH);
  ctx.fillStyle = "#1E293B";
  ctx.fillRect(0, 0, previewW, previewH);

  const offsetX = Math.floor((5 - shapeCols) / 2);
  const offsetY = Math.floor((4 - shapeRows) / 2);
  const img = images.get(pieceId);
  const color = colorMap.get(pieceId) ?? "#888";

  for (let r = 0; r < shapeRows; r++) {
    for (let c = 0; c < shapeCols; c++) {
      if (!shape[r][c]) continue;

      const destX = (offsetX + c) * CELL_SIZE;
      const destY = (offsetY + r) * CELL_SIZE;

      if (img?.complete && img.naturalWidth > 0) {
        const srcX = (c / shapeCols) * img.naturalWidth;
        const srcY = (r / shapeRows) * img.naturalHeight;
        const srcW = img.naturalWidth / shapeCols;
        const srcH = img.naturalHeight / shapeRows;
        ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, CELL_SIZE, CELL_SIZE);
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(destX + 1, destY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      }

      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.strokeRect(destX + 0.5, destY + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
    }
  }
}
