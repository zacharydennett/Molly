import type { Metadata } from "next";
import { TetrisPageClient } from "./TetrisPageClient";

export const metadata: Metadata = { title: "Tetris — Molly The Monday Reporter" };

export default function TetrisPage() {
  return <TetrisPageClient />;
}
