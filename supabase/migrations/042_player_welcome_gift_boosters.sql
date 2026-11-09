-- Welcome gifts: awarded exactly once on creation of a player profile.
-- Apply after 041_signup_profile_preferences_and_ac.sql.
-- Historical players are NOT granted retroactively by this migration.
-- Gift keys are versioned to support other onboarding rewards later.

CREATE TABLE IF NOT EXISTS public.user_gift_boosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  gift_key TEXT NOT NULL CHECK (gift_key ~ '^[a-z0-9_]{3,64}$'),
  pack_slug TEXT NOT NULL CHECK (pack_slug IN (
    'common', 'uncommon', 'rare', 'ultrarare', 'prototype',
    'mythic', 'legend', 'carbon'
  )),
  card_count SMALLINT NOT NULL CHECK (card_count BETWEEN 1 AND 20),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  UNIQUE (user_id, gift_key)
);

ALTER TABLE public.user_gift_boosters ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.user_gift_boosters FROM PUBLIC, anon, authenticated;
DROP POLICY IF EXISTS "Players can read their own gifts" ON public.user_gift_boosters;
CREATE POLICY "Players can read their own gifts" ON public.user_gift_boosters
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);
GRANT SELECT ON public.user_gift_boosters TO authenticated;

-- Awarding is database-driven: cannot be duplicated by reloading the page
-- or claiming daily login bonuses, or spoofed from the client.
CREATE OR REPLACE FUNCTION public.grant_player_welcome_booster()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.user_gift_boosters (user_id, gift_key, pack_slug, card_count)
  VALUES (NEW.id, 'welcome_2026', 'common', 10)
  ON CONFLICT (user_id, gift_key) DO NOTHING;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.grant_player_welcome_booster() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS on_profile_created_grant_welcome_booster ON public.profiles;
CREATE TRIGGER on_profile_created_grant_welcome_booster
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.grant_player_welcome_booster();

-- Only a signed-in owner can consume their gift, exactly once.
-- The client reads and draws the eligible cards before consuming (same flow as daily gifts).
CREATE OR REPLACE FUNCTION public.consume_player_gift_booster(p_booster_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_user_id UUID := (SELECT auth.uid());
  v_pack_slug TEXT;
  v_card_count SMALLINT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  UPDATE public.user_gift_boosters
  SET opened_at = NOW()
  WHERE id = p_booster_id
    AND user_id = v_user_id
    AND opened_at IS NULL
  RETURNING pack_slug, card_count INTO v_pack_slug, v_card_count;

  IF v_pack_slug IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cadeau introuvable ou déjà ouvert.');
  END IF;
  RETURN jsonb_build_object('success', true, 'pack_slug', v_pack_slug, 'card_count', v_card_count);
END;
$function$;

REVOKE ALL ON FUNCTION public.consume_player_gift_booster(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_player_gift_booster(UUID) TO authenticated;
