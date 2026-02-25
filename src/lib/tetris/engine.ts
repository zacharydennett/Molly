import type { Board, ActivePiece, PieceDefinition } from "@/types/tetris";

export const COLS = 10;
export const ROWS = 20;
export const CELL_SIZE = 30;

export function createEmptyBoard(): Board {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

export function getShape(piece: ActivePiece): number[][] {
  return piece.definition.shapes[piece.rotation % piece.definition.shapes.length];
}

export function canPlace(
  board: Board,
  piece: PieceDefinition,
  rotation: number,
  x: number,
  y: number
): boolean {
  const shape = piece.shapes[rotation % piece.shapes.length];
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (!shape[row][col]) continue;
      const newRow = y + row;
      const newCol = x + col;
      if (newCol < 0 || newCol >= COLS) return false;
      if (newRow >= ROWS) return false;
      if (newRow >= 0 && board[newRow][newCol] !== 0) return false;
    }
  }
  return true;
}

export function lockPiece(board: Board, piece: ActivePiece): Board {
  const newBoard = board.map((row) => [...row]);
  const shape = getShape(piece);
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (!shape[row][col]) continue;
      const boardRow = piece.y + row;
      const boardCol = piece.x + col;
      if (boardRow >= 0 && boardRow < ROWS && boardCol >= 0 && boardCol < COLS) {
        newBoard[boardRow][boardCol] = piece.definition.id;
      }
    }
  }
  return newBoard;
}

export function clearLines(board: Board): { board: Board; linesCleared: number; clearedRows: number[] } {
  const clearedRows: number[] = [];
  const newBoard = board.filter((row, i) => {
    if (row.every((cell) => cell !== 0)) {
      clearedRows.push(i);
      return false;
    }
    return true;
  });
  const linesCleared = clearedRows.length;
  while (newBoard.length < ROWS) {
    newBoard.unshift(new Array(COLS).fill(0));
  }
  return { board: newBoard, linesCleared, clearedRows };
}

export function getSpawnPosition(piece: PieceDefinition): { x: number; y: number } {
  const shape = piece.shapes[0];
  const x = Math.floor((COLS - shape[0].length) / 2);
  return { x, y: -1 };
}

export function getGhostY(board: Board, piece: ActivePiece): number {
  let ghostY = piece.y;
  while (canPlace(board, piece.definition, piece.rotation, piece.x, ghostY + 1)) {
    ghostY++;
  }
  return ghostY;
}

export function isGameOver(board: Board, piece: ActivePiece): boolean {
  return !canPlace(board, piece.definition, piece.rotation, piece.x, piece.y);
}

export function tryRotate(
  board: Board,
  piece: ActivePiece
): ActivePiece | null {
  const newRotation = (piece.rotation + 1) % piece.definition.shapes.length;
  const kicks = [0, 1, -1, 2, -2];
  for (const kick of kicks) {
    if (canPlace(board, piece.definition, newRotation, piece.x + kick, piece.y)) {
      return { ...piece, rotation: newRotation, x: piece.x + kick };
    }
  }
  return null;
}
