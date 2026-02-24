-- Molly The Monday Reporter — Supabase Schema
-- Run this entire file in the Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TETRIS HIGH SCORES
-- ============================================================
CREATE TABLE IF NOT EXISTS tetris_scores (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_name VARCHAR(3)   NOT NULL CHECK (length(trim(player_name)) BETWEEN 1 AND 3),
  score       INTEGER      NOT NULL CHECK (score >= 0),
  level       INTEGER      NOT NULL DEFAULT 1 CHECK (level >= 1),
  lines       INTEGER      NOT NULL DEFAULT 0 CHECK (lines >= 0),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index for fast leaderboard queries
CREATE INDEX IF NOT EXISTS idx_tetris_scores_score_desc ON tetris_scores (score DESC);

-- Row Level Security: all users can read and insert
ALTER TABLE tetris_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_scores"
  ON tetris_scores FOR SELECT
  USING (true);

CREATE POLICY "public_insert_scores"
  ON tetris_scores FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- VERIFY
-- ============================================================
-- After running, confirm the table exists:
-- SELECT * FROM tetris_scores LIMIT 1;
