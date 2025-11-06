-- Add name field to profiles table
ALTER TABLE public.profiles ADD COLUMN name TEXT;

-- Create user_apps table to store user-specific apps
CREATE TABLE public.user_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL,
  time_limit INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT false,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, app_id)
);

-- Enable RLS on user_apps
ALTER TABLE public.user_apps ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_apps
CREATE POLICY "Users can view their own apps"
  ON public.user_apps
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own apps"
  ON public.user_apps
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own apps"
  ON public.user_apps
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own apps"
  ON public.user_apps
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_apps_user_id ON public.user_apps(user_id);

-- Add trigger to update updated_at
CREATE TRIGGER update_user_apps_updated_at
  BEFORE UPDATE ON public.user_apps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();