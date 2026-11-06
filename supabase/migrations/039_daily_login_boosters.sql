CREATE TABLE public.user_daily_login_streaks (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_login_date DATE,
  streak_day SMALLINT NOT NULL DEFAULT 0 CHECK (streak_day BETWEEN 0 AND 7),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.user_daily_boosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pack_slug TEXT NOT NULL CHECK (pack_slug IN (
    'common', 'uncommon', 'rare', 'ultrarare', 'prototype', 'mythic', 'carbon'
  )),
  streak_day SMALLINT NOT NULL CHECK (streak_day BETWEEN 1 AND 7),
  awarded_on DATE NOT NULL,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, awarded_on)
);

ALTER TABLE public.user_daily_login_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_boosters ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.user_daily_login_streaks FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.user_daily_boosters FROM PUBLIC, anon, authenticated;

CREATE POLICY "Players read own daily boosters"
  ON public.user_daily_boosters FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

GRANT SELECT ON public.user_daily_boosters TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_daily_login_booster()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_today DATE := CURRENT_DATE;
  v_last_login DATE;
  v_streak_day SMALLINT;
  v_next_streak_day SMALLINT;
  v_pack_slug TEXT;
  v_booster_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.user_daily_login_streaks (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT last_login_date, streak_day
  INTO v_last_login, v_streak_day
  FROM public.user_daily_login_streaks
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF v_last_login = v_today THEN
    RETURN jsonb_build_object(
      'awarded', false,
      'streak_day', v_streak_day
    );
  END IF;

  IF v_last_login = v_today - 1 AND v_streak_day < 7 THEN
    v_next_streak_day := v_streak_day + 1;
  ELSE
    v_next_streak_day := 1;
  END IF;

  v_pack_slug := CASE v_next_streak_day
    WHEN 1 THEN 'common'
    WHEN 2 THEN 'uncommon'
    WHEN 3 THEN 'rare'
    WHEN 4 THEN 'ultrarare'
    WHEN 5 THEN 'prototype'
    WHEN 6 THEN 'mythic'
    WHEN 7 THEN 'carbon'
  END;

  INSERT INTO public.user_daily_boosters (user_id, pack_slug, streak_day, awarded_on)
  VALUES (v_user_id, v_pack_slug, v_next_streak_day, v_today)
  ON CONFLICT (user_id, awarded_on) DO NOTHING
  RETURNING id INTO v_booster_id;

  IF v_booster_id IS NULL THEN
    RETURN jsonb_build_object(
      'awarded', false,
      'streak_day', v_streak_day
    );
  END IF;

  UPDATE public.user_daily_login_streaks
  SET last_login_date = v_today,
      streak_day = v_next_streak_day,
      updated_at = NOW()
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'awarded', true,
    'booster_id', v_booster_id,
    'pack_slug', v_pack_slug,
    'streak_day', v_next_streak_day
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_daily_login_booster(p_booster_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_pack_slug TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.user_daily_boosters
  SET opened_at = NOW()
  WHERE id = p_booster_id
    AND user_id = v_user_id
    AND opened_at IS NULL
  RETURNING pack_slug INTO v_pack_slug;

  IF v_pack_slug IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ce booster offert est introuvable ou a déjà été ouvert.'
    );
  END IF;

  RETURN jsonb_build_object('success', true, 'pack_slug', v_pack_slug);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_daily_login_booster() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_daily_login_booster(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_daily_login_booster() TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_daily_login_booster(UUID) TO authenticated;
