CREATE OR REPLACE FUNCTION public.save_personal_garage_showcase(p_card_ids UUID[])
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

  IF p_card_ids IS NULL OR cardinality(p_card_ids) > 3 THEN
    RAISE EXCEPTION 'A garage can display up to three vehicles';
  END IF;

  IF cardinality(p_card_ids) <> (
    SELECT count(DISTINCT requested.card_id)
    FROM unnest(p_card_ids) AS requested(card_id)
  ) THEN
    RAISE EXCEPTION 'Duplicate vehicles are not allowed';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM unnest(p_card_ids) AS requested(card_id)
    LEFT JOIN public.cards AS catalog ON catalog.id = requested.card_id
    WHERE catalog.id IS NULL
      OR NOT EXISTS (
        SELECT 1
        FROM public.user_cards AS owned
        WHERE owned.user_id = v_user_id
          AND owned.card_id::TEXT IN (catalog.id::TEXT, catalog.card_id::TEXT)
          AND COALESCE(owned.count, 0) > 0
      )
  ) THEN
    RAISE EXCEPTION 'Every showcased vehicle must be owned by the player';
  END IF;

  DELETE FROM public.user_garage_showcase
  WHERE user_id = v_user_id;

  INSERT INTO public.user_garage_showcase (user_id, card_id, position)
  SELECT v_user_id, requested.card_id, requested.position::SMALLINT
  FROM unnest(p_card_ids) WITH ORDINALITY AS requested(card_id, position);
END;
$$;

REVOKE ALL ON FUNCTION public.save_personal_garage_showcase(UUID[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_personal_garage_showcase(UUID[]) TO authenticated;
