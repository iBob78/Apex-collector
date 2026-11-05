ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS showroom_public BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE FUNCTION public.set_user_showroom_public(p_is_public BOOLEAN)
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

  UPDATE public.profiles
  SET showroom_public = p_is_public
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
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
  v_vehicles JSONB;
  v_total_cards BIGINT;
  v_legendary_cards BIGINT;
  v_manufacturers BIGINT;
  v_circuit_cards BIGINT;
  v_driver_cards BIGINT;
  v_legendary_circuits BIGINT;
  v_legendary_drivers BIGINT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT profile.id, profile.username
  INTO v_user_id, v_username
  FROM public.profiles AS profile
  WHERE lower(profile.username) = lower(trim(p_username))
    AND profile.showroom_public = TRUE
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN NULL;
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

  SELECT
    COALESCE(SUM(COALESCE(owned.count, owned.quantity, 1)), 0),
    COUNT(DISTINCT catalog.id) FILTER (WHERE lower(catalog.rarity) IN ('legend', 'legendary')),
    COUNT(DISTINCT lower(catalog.make)) FILTER (WHERE NULLIF(trim(catalog.make), '') IS NOT NULL)
  INTO v_total_cards, v_legendary_cards, v_manufacturers
  FROM public.user_cards AS owned
  LEFT JOIN public.cards AS catalog
    ON owned.card_id::TEXT IN (catalog.id::TEXT, catalog.card_id::TEXT)
  WHERE owned.user_id = v_user_id
    AND COALESCE(owned.count, owned.quantity, 1) > 0;

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

  RETURN jsonb_build_object(
    'username', v_username,
    'vehicles', v_vehicles,
    'stats', jsonb_build_object(
      'totalCards', v_total_cards + v_circuit_cards + v_driver_cards,
      'legendaryCards', v_legendary_cards + v_legendary_circuits + v_legendary_drivers,
      'manufacturers', v_manufacturers
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.set_user_showroom_public(BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_user_showroom_public(BOOLEAN) TO authenticated;

REVOKE ALL ON FUNCTION public.get_public_showroom(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_public_showroom(TEXT) TO authenticated;
