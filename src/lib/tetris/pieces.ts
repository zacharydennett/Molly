import type { PieceDefinition } from "@/types/tetris";

export const PIECES: PieceDefinition[] = [
  {
    id: 1,
    name: "Tylenol",
    color: "#E8001C",
    bgColor: "#FEE2E2",
    svgAsset: "/tetris/tylenol-i.svg",
    shapes: [
      [[1, 1, 1, 1]],
      [[1], [1], [1], [1]],
    ],
  },
  {
    id: 2,
    name: "Nature's Made",
    color: "#EA580C",
    bgColor: "#FED7AA",
    svgAsset: "/tetris/natures-made-o.svg",
    shapes: [[[1, 1], [1, 1]]],
  },
  {
    id: 3,
    name: "Kleenex",
    color: "#0284C7",
    bgColor: "#BAE6FD",
    svgAsset: "/tetris/kleenex-t.svg",
    shapes: [
      [[0, 1, 0], [1, 1, 1]],
      [[1, 0], [1, 1], [1, 0]],
      [[1, 1, 1], [0, 1, 0]],
      [[0, 1], [1, 1], [0, 1]],
    ],
  },
  {
    id: 4,
    name: "NyQuil",
    color: "#1D4ED8",
    bgColor: "#BFDBFE",
    svgAsset: "/tetris/nyquil-s.svg",
    shapes: [
      [[0, 1, 1], [1, 1, 0]],
      [[1, 0], [1, 1], [0, 1]],
    ],
  },
  {
    id: 5,
    name: "Advil",
    color: "#DC2626",
    bgColor: "#FECACA",
    svgAsset: "/tetris/advil-z.svg",
    shapes: [
      [[1, 1, 0], [0, 1, 1]],
      [[0, 1], [1, 1], [1, 0]],
    ],
  },
  {
    id: 6,
    name: "Pampers",
    color: "#0369A1",
    bgColor: "#E0F2FE",
    svgAsset: "/tetris/pampers-l.svg",
    shapes: [
      [[1, 0], [1, 0], [1, 1]],
      [[1, 1, 1], [1, 0, 0]],
      [[1, 1], [0, 1], [0, 1]],
      [[0, 0, 1], [1, 1, 1]],
    ],
  },
  {
    id: 7,
    name: "Band-Aid",
    color: "#B45309",
    bgColor: "#FEF3C7",
    svgAsset: "/tetris/bandaid-j.svg",
    shapes: [
      [[0, 1], [0, 1], [1, 1]],
      [[1, 0, 0], [1, 1, 1]],
      [[1, 1], [1, 0], [1, 0]],
      [[1, 1, 1], [0, 0, 1]],
    ],
  },
];

export function getRandomPiece(): PieceDefinition {
  return PIECES[Math.floor(Math.random() * PIECES.length)];
}
