-- Run this in Supabase SQL Editor (supabase.com -> SQL Editor -> New Query)

CREATE TABLE IF NOT EXISTS screenshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  step_id INT NOT NULL,
  step_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  pinata_url TEXT NOT NULL,
  pinata_cid TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one screenshot per member per step (re-uploads replace)
  CONSTRAINT unique_member_step UNIQUE (member_id, step_id)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_screenshots_member ON screenshots (member_id);
CREATE INDEX IF NOT EXISTS idx_screenshots_step ON screenshots (step_id);

-- Enable Row Level Security & allow public access (no auth needed)
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON screenshots FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON screenshots FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON screenshots FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete" ON screenshots FOR DELETE USING (true);
