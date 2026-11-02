-- Favorites are private for now. A future public showroom must expose only curated safe data.
CREATE TABLE IF NOT EXISTS public.card_favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('vehicle', 'circuit')),
  card_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, category, card_id)
);

CREATE INDEX IF NOT EXISTS card_favorites_recent_idx
  ON public.card_favorites (user_id, created_at DESC);

ALTER TABLE public.card_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players read own favorites" ON public.card_favorites;

CREATE POLICY "Players read own favorites"
  ON public.card_favorites FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Players favorite only owned cards" ON public.card_favorites;

CREATE POLICY "Players favorite only owned cards"
  ON public.card_favorites FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid()) = user_id
    AND (
      (category = 'vehicle' AND EXISTS (
        SELECT 1 FROM public.user_cards AS owned
        WHERE owned.user_id = (select auth.uid())
          AND owned.card_id = card_favorites.card_id
          AND COALESCE(owned.count, 0) > 0
      ))
      OR
      (category = 'circuit' AND EXISTS (
        SELECT 1 FROM public.user_circuits AS owned
        WHERE owned.user_id = (select auth.uid())
          AND owned.circuit_id = card_favorites.card_id
          AND COALESCE(owned.count, 0) > 0
      ))
    )
  );

DROP POLICY IF EXISTS "Players remove own favorites" ON public.card_favorites;

CREATE POLICY "Players remove own favorites"
  ON public.card_favorites FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

REVOKE ALL ON public.card_favorites FROM PUBLIC, anon;
GRANT SELECT, INSERT, DELETE ON public.card_favorites TO authenticated;
GRANT ALL ON public.card_favorites TO service_role;
