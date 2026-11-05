CREATE OR REPLACE FUNCTION public.get_top_card_owner(
  p_category TEXT,
  p_card_id TEXT
)
RETURNS TABLE (
  username TEXT,
  owned_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH owned_copies AS (
    SELECT owned.user_id, SUM(COALESCE(owned.count, 1))::BIGINT AS copy_count
    FROM public.user_cards AS owned
    WHERE p_category = 'vehicle'
      AND owned.card_id::TEXT = p_card_id
      AND COALESCE(owned.count, 1) > 0
    GROUP BY owned.user_id

    UNION ALL

    SELECT owned.user_id, SUM(COALESCE(owned.count, 1))::BIGINT AS copy_count
    FROM public.user_circuits AS owned
    WHERE p_category = 'circuit'
      AND owned.circuit_id::TEXT = p_card_id
      AND COALESCE(owned.count, 1) > 0
    GROUP BY owned.user_id

    UNION ALL

    SELECT owned.user_id, SUM(COALESCE(owned.count, 1))::BIGINT AS copy_count
    FROM public.user_drivers AS owned
    WHERE p_category = 'driver'
      AND owned.driver_id::TEXT = p_card_id
      AND COALESCE(owned.count, 1) > 0
    GROUP BY owned.user_id
  )
  SELECT profile.username, owned_copies.copy_count
  FROM owned_copies
  JOIN public.profiles AS profile ON profile.id = owned_copies.user_id
  WHERE NULLIF(trim(profile.username), '') IS NOT NULL
    AND auth.uid() IS NOT NULL
  ORDER BY owned_copies.copy_count DESC, lower(profile.username), profile.username
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_top_card_owner(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_top_card_owner(TEXT, TEXT) TO authenticated;
