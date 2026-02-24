export type Board = number[][];

export interface PieceDefinition {
  id: number;
  name: string;
  color: string;
  bgColor: string;
  imageAsset: string;
  shapes: number[][][];
}

export interface ActivePiece {
  definition: PieceDefinition;
  rotation: number;
  x: number;
  y: number;
}

export type GameStatus = "idle" | "playing" | "paused" | "gameover";

export interface TetrisGameState {
  board: Board;
  currentPiece: ActivePiece | null;
  nextPiece: PieceDefinition | null;
  score: number;
  level: number;
  lines: number;
  status: GameStatus;
  isNewHighScore: boolean;
  flashRows: number[];
}

export type TetrisAction =
  | { type: "TICK" }
  | { type: "MOVE_LEFT" }
  | { type: "MOVE_RIGHT" }
  | { type: "ROTATE" }
  | { type: "SOFT_DROP" }
  | { type: "HARD_DROP" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "START" }
  | { type: "RESET" }
  | { type: "CLEAR_FLASH" };

export interface TetrisScore {
  id: string;
  player_name: string;
  score: number;
  level: number;
  lines: number;
  created_at: string;
}
