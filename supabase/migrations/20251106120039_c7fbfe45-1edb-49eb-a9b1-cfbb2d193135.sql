-- Add columns to track highest streak and daily activity completion
ALTER TABLE user_streaks 
ADD COLUMN IF NOT EXISTS highest_streak integer NOT NULL DEFAULT 0;

-- Create a table to track daily completions for calendar view
CREATE TABLE IF NOT EXISTS daily_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  date date NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  total_time_seconds integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on daily_completions
ALTER TABLE daily_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_completions
CREATE POLICY "Users can view their own daily completions"
  ON daily_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily completions"
  ON daily_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily completions"
  ON daily_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_completions_user_date 
  ON daily_completions(user_id, date DESC);