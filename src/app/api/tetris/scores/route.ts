import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tetris_scores")
    .select("id, player_name, score, level, lines, created_at")
    .order("score", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ scores: data ?? [] });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { player_name, score, level, lines } = body as Record<string, unknown>;

  // Validate
  if (
    typeof player_name !== "string" ||
    !/^[A-Za-z]{1,20} [A-Za-z]$/.test(player_name.trim()) ||
    typeof score !== "number" ||
    score < 0 ||
    score > 9999999 ||
    typeof level !== "number" ||
    level < 1 ||
    level > 30 ||
    typeof lines !== "number" ||
    lines < 0 ||
    lines > 9999
  ) {
    return NextResponse.json({ error: "Invalid score data" }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("tetris_scores")
    .insert({
      player_name: player_name.trim(),
      score: Math.round(score),
      level: Math.round(level),
      lines: Math.round(lines),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
