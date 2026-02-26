-- Molly The Monday Reporter — Supabase Schema
-- Run this entire file in the Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TETRIS HIGH SCORES
-- ============================================================
CREATE TABLE IF NOT EXISTS tetris_scores (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_name VARCHAR(25)  NOT NULL CHECK (length(trim(player_name)) BETWEEN 3 AND 25),
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
-- MIGRATION: Widen player_name for first name + last initial
-- Run this if the table was already created with VARCHAR(3):
-- ============================================================
-- ALTER TABLE tetris_scores ALTER COLUMN player_name TYPE VARCHAR(25);
-- ALTER TABLE tetris_scores DROP CONSTRAINT IF EXISTS tetris_scores_player_name_check;
-- ALTER TABLE tetris_scores ADD CONSTRAINT tetris_scores_player_name_check CHECK (length(trim(player_name)) BETWEEN 3 AND 25);

-- ============================================================
-- VERIFY
-- ============================================================
-- After running, confirm the table exists:
-- SELECT * FROM tetris_scores LIMIT 1;

-- ============================================================
-- COMPETITOR ADS CACHE
-- ============================================================
CREATE TABLE IF NOT EXISTS competitor_ads_cache (
  week_end    DATE         PRIMARY KEY,
  data        JSONB        NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE competitor_ads_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_ads_cache"
  ON competitor_ads_cache FOR SELECT
  USING (true);

CREATE POLICY "public_insert_ads_cache"
  ON competitor_ads_cache FOR INSERT
  WITH CHECK (true);

-- Allow server-side UPDATE (used by screenshotCache.ts to write screenshotUrls back)
CREATE POLICY "service_update_ads_cache"
  ON competitor_ads_cache FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- COMPETITOR ADS SCREENSHOTS — Storage bucket (manual step)
-- ============================================================
-- 1. Go to Supabase Dashboard → Storage
-- 2. Create a new bucket named: competitor-ads-screenshots
-- 3. Set it to PUBLIC (so <img> tags can load PNGs without auth)
-- 4. Add your service_role key to .env.local:
--      SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
--    (Dashboard → Project Settings → API → service_role secret)
--
-- The existing JSONB `data` column in competitor_ads_cache stores
-- screenshotUrl strings alongside archiveUrl — no schema change needed.
