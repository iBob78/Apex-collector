ALTER TABLE public.user_cards
  ADD COLUMN IF NOT EXISTS upgrade_level INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
  ALTER TABLE public.user_cards
    ADD CONSTRAINT user_cards_upgrade_level_range
    CHECK (upgrade_level BETWEEN 0 AND 9);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
