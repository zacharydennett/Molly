// Nintendo Tetris scoring formula
const LINE_SCORES = [0, 100, 300, 500, 800];

export function calculateScore(linesCleared: number, level: number): number {
  const base = LINE_SCORES[Math.min(linesCleared, 4)] ?? 0;
  return base * level;
}

export function calculateLevel(totalLines: number): number {
  return Math.max(1, Math.floor(totalLines / 10) + 1);
}

export function getGravityMs(level: number): number {
  const intervals = [800, 720, 630, 550, 470, 380, 300, 220, 130, 100, 80];
  return intervals[Math.min(level - 1, intervals.length - 1)];
}

export const SOFT_DROP_BONUS = 1;
export const HARD_DROP_BONUS = 2;
