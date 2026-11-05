CREATE TABLE IF NOT EXISTS public.user_booster_open_stats (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_opens BIGINT NOT NULL DEFAULT 0 CHECK (total_opens >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_booster_open_stats ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.user_booster_open_stats FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.record_objective_progress(
  p_objective_type TEXT,
  p_amount INTEGER DEFAULT 1,
  p_rarity TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_amount < 1 OR p_objective_type NOT IN (
    'booster_open', 'collection_count', 'rarity_card',
    'marketplace_listing', 'circuit_collection', 'daily_login'
  ) THEN
    RAISE EXCEPTION 'Invalid objective progress event';
  END IF;

  PERFORM public.ensure_user_objectives();

  IF p_objective_type = 'booster_open' THEN
    INSERT INTO public.user_booster_open_stats (user_id, total_opens, updated_at)
    VALUES (v_user_id, p_amount, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET total_opens = user_booster_open_stats.total_opens + EXCLUDED.total_opens,
        updated_at = NOW();
  END IF;

  UPDATE public.user_objective_progress AS progress
  SET
    current_count = LEAST(objective.target_count, progress.current_count + p_amount),
    status = CASE
      WHEN progress.current_count + p_amount >= objective.target_count THEN 'completed'
      ELSE 'active'
    END,
    completed_at = CASE
      WHEN progress.current_count + p_amount >= objective.target_count THEN NOW()
      ELSE NULL
    END,
    last_daily_progress_at = CASE
      WHEN p_objective_type = 'daily_login' THEN CURRENT_DATE
      ELSE progress.last_daily_progress_at
    END
  FROM public.objective_definitions AS objective
  WHERE progress.objective_id = objective.id
    AND progress.user_id = v_user_id
    AND progress.status = 'active'
    AND objective.is_active
    AND objective.objective_type = p_objective_type
    AND (objective.objective_type <> 'rarity_card' OR lower(objective.required_rarity) = lower(coalesce(p_rarity, '')))
    AND (
      p_objective_type <> 'daily_login'
      OR progress.last_daily_progress_at IS DISTINCT FROM CURRENT_DATE
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_showroom(p_username TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_username TEXT;
  v_showroom_public BOOLEAN;
  v_vehicles JSONB;
  v_top_upgrades JSONB;
  v_achievements JSONB;
  v_total_cards BIGINT;
  v_legendary_cards BIGINT;
  v_manufacturers BIGINT;
  v_circuit_cards BIGINT;
  v_driver_cards BIGINT;
  v_legendary_circuits BIGINT;
  v_legendary_drivers BIGINT;
  v_booster_opens BIGINT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT profile.id, profile.username, profile.showroom_public
  INTO v_user_id, v_username, v_showroom_public
  FROM public.profiles AS profile
  WHERE lower(profile.username) = lower(trim(p_username))
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT v_showroom_public THEN
    RETURN jsonb_build_object(
      'username', v_username,
      'isPublic', FALSE,
      'vehicles', '[]'::JSONB,
      'topUpgrades', '[]'::JSONB,
      'achievements', '[]'::JSONB,
      'stats', NULL
    );
  END IF;

  SELECT COALESCE(
    jsonb_agg(to_jsonb(catalog) || jsonb_build_object('category', 'vehicle', 'position', showcase.position)
      ORDER BY showcase.position),
    '[]'::JSONB
  )
  INTO v_vehicles
  FROM public.user_garage_showcase AS showcase
  JOIN public.cards AS catalog ON catalog.id = showcase.card_id
  WHERE showcase.user_id = v_user_id;

  SELECT COALESCE(jsonb_agg(
    to_jsonb(upgraded) || jsonb_build_object(
      'category', 'vehicle',
      'upgradeLevel', upgraded.upgrade_level
    )
    ORDER BY upgraded.upgrade_level DESC, upgraded.make, upgraded.model
  ), '[]'::JSONB)
  INTO v_top_upgrades
  FROM (
    SELECT top_cards.*
    FROM (
      SELECT DISTINCT ON (catalog.id)
        catalog.*,
        owned.upgrade_level
      FROM public.user_cards AS owned
      JOIN public.cards AS catalog
        ON owned.card_id::TEXT IN (catalog.id::TEXT, catalog.card_id::TEXT)
      WHERE owned.user_id = v_user_id
        AND owned.upgrade_level > 0
      ORDER BY catalog.id, owned.upgrade_level DESC
    ) AS top_cards
    ORDER BY top_cards.upgrade_level DESC, top_cards.make, top_cards.model
    LIMIT 3
  ) AS upgraded;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'title', objective.title,
      'description', objective.description
    )
    ORDER BY progress.completed_at DESC NULLS LAST, objective.title
  ), '[]'::JSONB)
  INTO v_achievements
  FROM public.user_objective_progress AS progress
  JOIN public.objective_definitions AS objective
    ON objective.id = progress.objective_id
  WHERE progress.user_id = v_user_id
    AND progress.status = 'claimed'
    AND objective.category = 'achievement';

  SELECT
    COALESCE(SUM(COALESCE(owned.count, 1)), 0),
    COUNT(DISTINCT catalog.id) FILTER (WHERE lower(catalog.rarity) IN ('legend', 'legendary')),
    COUNT(DISTINCT lower(catalog.make)) FILTER (WHERE NULLIF(trim(catalog.make), '') IS NOT NULL)
  INTO v_total_cards, v_legendary_cards, v_manufacturers
  FROM public.user_cards AS owned
  LEFT JOIN public.cards AS catalog
    ON owned.card_id::TEXT IN (catalog.id::TEXT, catalog.card_id::TEXT)
  WHERE owned.user_id = v_user_id
    AND COALESCE(owned.count, 1) > 0;

  SELECT COALESCE(SUM(owned.count), 0)
  INTO v_circuit_cards
  FROM public.user_circuits AS owned
  WHERE owned.user_id = v_user_id;

  SELECT COALESCE(SUM(owned.count), 0)
  INTO v_driver_cards
  FROM public.user_drivers AS owned
  WHERE owned.user_id = v_user_id;

  SELECT COUNT(DISTINCT catalog.id)
  INTO v_legendary_circuits
  FROM public.user_circuits AS owned
  JOIN public.circuits AS catalog
    ON owned.circuit_id::TEXT = catalog.id::TEXT
  WHERE owned.user_id = v_user_id
    AND lower(catalog.rarity) IN ('legend', 'legendary');

  SELECT COUNT(DISTINCT catalog.id)
  INTO v_legendary_drivers
  FROM public.user_drivers AS owned
  JOIN public.drivers AS catalog
    ON owned.driver_id::TEXT IN (catalog.id::TEXT, catalog.driver_id::TEXT)
  WHERE owned.user_id = v_user_id
    AND lower(catalog.rarity) IN ('legend', 'legendary');

  SELECT COALESCE(stats.total_opens, 0)
  INTO v_booster_opens
  FROM public.user_booster_open_stats AS stats
  WHERE stats.user_id = v_user_id;
  v_booster_opens := COALESCE(v_booster_opens, 0);

  RETURN jsonb_build_object(
    'username', v_username,
    'isPublic', TRUE,
    'vehicles', v_vehicles,
    'topUpgrades', v_top_upgrades,
    'achievements', v_achievements,
    'stats', jsonb_build_object(
      'totalCards', v_total_cards + v_circuit_cards + v_driver_cards,
      'legendaryCards', v_legendary_cards + v_legendary_circuits + v_legendary_drivers,
      'manufacturers', v_manufacturers,
      'boosterOpens', v_booster_opens,
      'cardsAcquired', v_total_cards + v_circuit_cards + v_driver_cards
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_showroom(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_public_showroom(TEXT) TO authenticated;
