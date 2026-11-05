CREATE TABLE IF NOT EXISTS public.user_card_discoveries (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('vehicle', 'circuit', 'driver')),
  card_id UUID NOT NULL,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  seen_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, category, card_id)
);

CREATE INDEX IF NOT EXISTS user_card_discoveries_unseen_idx
  ON public.user_card_discoveries (user_id, discovered_at DESC)
  WHERE seen_at IS NULL;

ALTER TABLE public.user_card_discoveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players read own card discoveries" ON public.user_card_discoveries;
CREATE POLICY "Players read own card discoveries"
  ON public.user_card_discoveries FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Players record discoveries for owned cards" ON public.user_card_discoveries;
CREATE POLICY "Players record discoveries for owned cards"
  ON public.user_card_discoveries FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND seen_at IS NULL
    AND (
      (category = 'vehicle' AND EXISTS (
        SELECT 1 FROM public.user_cards AS owned
        WHERE owned.user_id = (SELECT auth.uid())
          AND owned.card_id = user_card_discoveries.card_id
          AND COALESCE(owned.count, 0) > 0
      ))
      OR
      (category = 'circuit' AND EXISTS (
        SELECT 1 FROM public.user_circuits AS owned
        WHERE owned.user_id = (SELECT auth.uid())
          AND owned.circuit_id = user_card_discoveries.card_id
          AND COALESCE(owned.count, 0) > 0
      ))
      OR
      (category = 'driver' AND EXISTS (
        SELECT 1 FROM public.user_drivers AS owned
        WHERE owned.user_id = (SELECT auth.uid())
          AND owned.driver_id = user_card_discoveries.card_id
          AND COALESCE(owned.count, 0) > 0
      ))
    )
  );

DROP POLICY IF EXISTS "Players mark own discoveries as seen" ON public.user_card_discoveries;
CREATE POLICY "Players mark own discoveries as seen"
  ON public.user_card_discoveries FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id AND seen_at IS NULL)
  WITH CHECK ((SELECT auth.uid()) = user_id AND seen_at IS NOT NULL);

REVOKE ALL ON public.user_card_discoveries FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.user_card_discoveries TO authenticated;
GRANT UPDATE (seen_at) ON public.user_card_discoveries TO authenticated;
GRANT ALL ON public.user_card_discoveries TO service_role;
