import type { Metadata } from "next";
import { TetrisPageClient } from "./TetrisPageClient";

export const metadata: Metadata = { title: "POG Process — Molly The Monday Reporter" };

export default function TetrisPage() {
  return <TetrisPageClient />;
}
