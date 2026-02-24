import type { PieceDefinition } from "@/types/tetris";

export const PIECES: PieceDefinition[] = [
  {
    id: 1,
    name: "Tylenol",
    color: "#E8001C",
    bgColor: "#FEE2E2",
    imageAsset: "/tetris/tylenol.jpg",
    imageCrop: { top: 0.28, right: 0.04, bottom: 0.02, left: 0.04 },
    shapes: [
      [[1, 1, 1, 1]],
      [[1], [1], [1], [1]],
    ],
  },
  {
    id: 2,
    name: "Pampers",
    color: "#0D9488",
    bgColor: "#CCFBF1",
    imageAsset: "/tetris/pampers.jpg",
    imageCrop: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
    shapes: [[[1, 1], [1, 1]]],
  },
  {
    id: 3,
    name: "Nature Made",
    color: "#CA8A04",
    bgColor: "#FEF9C3",
    imageAsset: "/tetris/natures-made.jpg",
    imageCrop: { top: 0.03, right: 0.07, bottom: 0.03, left: 0.07 },
    shapes: [
      [[0, 1, 0], [1, 1, 1]],
      [[1, 0], [1, 1], [1, 0]],
      [[1, 1, 1], [0, 1, 0]],
      [[0, 1], [1, 1], [0, 1]],
    ],
  },
  {
    id: 4,
    name: "Zyrtec",
    color: "#16A34A",
    bgColor: "#DCFCE7",
    imageAsset: "/tetris/zyrtec.jpg",
    imageCrop: { top: 0.02, right: 0.05, bottom: 0.01, left: 0.01 },
    shapes: [
      [[0, 1, 1], [1, 1, 0]],
      [[1, 0], [1, 1], [0, 1]],
    ],
  },
  {
    id: 5,
    name: "CVS Dairy Relief",
    color: "#0284C7",
    bgColor: "#E0F2FE",
    imageAsset: "/tetris/cvsh-lactase.jpg",
    imageCrop: { top: 0.01, right: 0.01, bottom: 0.03, left: 0.01 },
    shapes: [
      [[1, 1, 0], [0, 1, 1]],
      [[0, 1], [1, 1], [1, 0]],
    ],
  },
  {
    id: 6,
    name: "MiraLAX",
    color: "#9333EA",
    bgColor: "#F3E8FF",
    imageAsset: "/tetris/miralax.jpg",
    imageCrop: { top: 0.02, right: 0.10, bottom: 0.02, left: 0.10 },
    shapes: [
      [[1, 0], [1, 0], [1, 1]],
      [[1, 1, 1], [1, 0, 0]],
      [[1, 1], [0, 1], [0, 1]],
      [[0, 0, 1], [1, 1, 1]],
    ],
  },
  {
    id: 7,
    name: "CVS Ibuprofen",
    color: "#1D4ED8",
    bgColor: "#DBEAFE",
    imageAsset: "/tetris/cvsh-ibu.jpg",
    imageCrop: { top: 0.08, right: 0.04, bottom: 0.08, left: 0.04 },
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
