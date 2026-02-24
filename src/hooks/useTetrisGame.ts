"use client";

import { useReducer, useEffect, useRef, useCallback } from "react";
import type { TetrisGameState, TetrisAction, ActivePiece } from "@/types/tetris";
import {
  createEmptyBoard,
  canPlace,
  lockPiece,
  clearLines,
  getSpawnPosition,
  tryRotate,
  isGameOver,
} from "@/lib/tetris/engine";
import { getRandomPiece } from "@/lib/tetris/pieces";
import {
  calculateScore,
  calculateLevel,
  getGravityMs,
  SOFT_DROP_BONUS,
  HARD_DROP_BONUS,
} from "@/lib/tetris/scoring";

function spawnPiece(state: TetrisGameState): TetrisGameState {
  const piece = state.nextPiece ?? getRandomPiece();
  const { x, y } = getSpawnPosition(piece);
  const newPiece: ActivePiece = { definition: piece, rotation: 0, x, y };

  if (isGameOver(state.board, newPiece)) {
    return { ...state, currentPiece: newPiece, status: "gameover", isNewHighScore: false };
  }

  return {
    ...state,
    currentPiece: newPiece,
    nextPiece: getRandomPiece(),
  };
}

function movePieceDown(state: TetrisGameState, isHardDrop = false): TetrisGameState {
  if (!state.currentPiece || state.status !== "playing") return state;

  const { currentPiece, board } = state;

  if (canPlace(board, currentPiece.definition, currentPiece.rotation, currentPiece.x, currentPiece.y + 1)) {
    const bonus = isHardDrop ? 0 : SOFT_DROP_BONUS;
    return {
      ...state,
      currentPiece: { ...currentPiece, y: currentPiece.y + 1 },
      score: state.score + bonus,
    };
  }

  // Lock piece
  const lockedBoard = lockPiece(board, currentPiece);
  const { board: clearedBoard, linesCleared, clearedRows } = clearLines(lockedBoard);
  const newLines = state.lines + linesCleared;
  const newLevel = calculateLevel(newLines);
  const lineScore = calculateScore(linesCleared, newLevel);

  const newState: TetrisGameState = {
    ...state,
    board: clearedBoard,
    currentPiece: null,
    score: state.score + lineScore,
    lines: newLines,
    level: newLevel,
    flashRows: clearedRows,
  };

  return spawnPiece(newState);
}

function hardDrop(state: TetrisGameState): TetrisGameState {
  if (!state.currentPiece || state.status !== "playing") return state;
  let { currentPiece, board } = state;
  let dropped = 0;

  while (canPlace(board, currentPiece.definition, currentPiece.rotation, currentPiece.x, currentPiece.y + 1)) {
    currentPiece = { ...currentPiece, y: currentPiece.y + 1 };
    dropped++;
  }

  const stateWithPiece = { ...state, currentPiece, score: state.score + dropped * HARD_DROP_BONUS };
  return movePieceDown(stateWithPiece, true);
}

function tetrisReducer(state: TetrisGameState, action: TetrisAction): TetrisGameState {
  switch (action.type) {
    case "START":
    case "RESET": {
      const initial: TetrisGameState = {
        board: createEmptyBoard(),
        currentPiece: null,
        nextPiece: getRandomPiece(),
        score: 0,
        level: 1,
        lines: 0,
        status: "playing",
        isNewHighScore: false,
        flashRows: [],
      };
      return spawnPiece(initial);
    }
    case "TICK":
      return movePieceDown(state);
    case "MOVE_LEFT": {
      if (!state.currentPiece || state.status !== "playing") return state;
      const p = state.currentPiece;
      if (!canPlace(state.board, p.definition, p.rotation, p.x - 1, p.y)) return state;
      return { ...state, currentPiece: { ...p, x: p.x - 1 } };
    }
    case "MOVE_RIGHT": {
      if (!state.currentPiece || state.status !== "playing") return state;
      const p = state.currentPiece;
      if (!canPlace(state.board, p.definition, p.rotation, p.x + 1, p.y)) return state;
      return { ...state, currentPiece: { ...p, x: p.x + 1 } };
    }
    case "ROTATE": {
      if (!state.currentPiece || state.status !== "playing") return state;
      const rotated = tryRotate(state.board, state.currentPiece);
      if (!rotated) return state;
      return { ...state, currentPiece: rotated };
    }
    case "SOFT_DROP":
      return movePieceDown({ ...state, score: state.score }, false);
    case "HARD_DROP":
      return hardDrop(state);
    case "PAUSE":
      return state.status === "playing" ? { ...state, status: "paused" } : state;
    case "RESUME":
      return state.status === "paused" ? { ...state, status: "playing" } : state;
    case "CLEAR_FLASH":
      return { ...state, flashRows: [] };
    default:
      return state;
  }
}

const INITIAL_STATE: TetrisGameState = {
  board: createEmptyBoard(),
  currentPiece: null,
  nextPiece: null,
  score: 0,
  level: 1,
  lines: 0,
  status: "idle",
  isNewHighScore: false,
  flashRows: [],
};

export function useTetrisGame(topScore: number) {
  const [state, dispatch] = useReducer(tetrisReducer, INITIAL_STATE);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // Gravity loop
  useEffect(() => {
    if (state.status === "playing") {
      const ms = getGravityMs(state.level);
      intervalRef.current = setInterval(() => dispatch({ type: "TICK" }), ms);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [state.status, state.level]);

  // Flash row cleanup
  useEffect(() => {
    if (state.flashRows.length > 0) {
      const t = setTimeout(() => dispatch({ type: "CLEAR_FLASH" }), 300);
      return () => clearTimeout(t);
    }
  }, [state.flashRows]);

  // Detect new high score on game over
  const prevStatus = useRef(state.status);
  useEffect(() => {
    if (prevStatus.current !== "gameover" && state.status === "gameover") {
      if (state.score > 0 && state.score >= topScore) {
        // Will be handled by parent
      }
    }
    prevStatus.current = state.status;
  }, [state.status, state.score, topScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (state.status === "gameover" || state.status === "idle") return;
      switch (e.code) {
        case "ArrowLeft":
          e.preventDefault();
          dispatch({ type: "MOVE_LEFT" });
          break;
        case "ArrowRight":
          e.preventDefault();
          dispatch({ type: "MOVE_RIGHT" });
          break;
        case "ArrowDown":
          e.preventDefault();
          dispatch({ type: "SOFT_DROP" });
          break;
        case "ArrowUp":
        case "KeyZ":
          e.preventDefault();
          dispatch({ type: "ROTATE" });
          break;
        case "Space":
          e.preventDefault();
          dispatch({ type: "HARD_DROP" });
          break;
        case "KeyP":
        case "Escape":
          e.preventDefault();
          dispatch({ type: state.status === "paused" ? "RESUME" : "PAUSE" });
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state.status]);

  const start = useCallback(() => dispatch({ type: "START" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);
  const pause = useCallback(() => dispatch({ type: "PAUSE" }), []);
  const resume = useCallback(() => dispatch({ type: "RESUME" }), []);
  const moveLeft = useCallback(() => dispatch({ type: "MOVE_LEFT" }), []);
  const moveRight = useCallback(() => dispatch({ type: "MOVE_RIGHT" }), []);
  const rotate = useCallback(() => dispatch({ type: "ROTATE" }), []);
  const softDrop = useCallback(() => dispatch({ type: "SOFT_DROP" }), []);
  const hardDrop = useCallback(() => dispatch({ type: "HARD_DROP" }), []);

  return {
    state,
    start,
    reset,
    pause,
    resume,
    moveLeft,
    moveRight,
    rotate,
    softDrop,
    hardDrop,
  };
}
