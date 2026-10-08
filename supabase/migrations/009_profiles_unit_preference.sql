ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS unit_preference TEXT NOT NULL DEFAULT 'metric';
