-- 049: Replace the garage reward thresholds with sparse garage ranks.
-- Frontend and SQL must use the same thresholds. Do not reapply migration 045.
-- Preserve all previously granted garage_level_N gifts, including gifts granted
-- under the old ten-cars-per-level system. No retroactive gift backfill here.
-- Level 0 (unranked) and level 1 (Rookie) do not award a booster, as previously
-- the initial level 1 had no reward. Level 2 is intentionally unused.
-- Future ranks: 3=50, 4=100, 5=200, 6=500, 7=1000, 8=2000, 9=5000.
CREATE OR REPLACE FUNCTION public.grant_garage_level_boosters(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  v_unique INTEGER;
  v_level INTEGER;
  v_index INTEGER;
  v_slug TEXT;
  v_thresholds CONSTANT INTEGER[] := ARRAY[50, 100, 200, 500, 1000, 2000, 5000];
  v_levels CONSTANT INTEGER[] := ARRAY[3, 4, 5, 6, 7, 8, 9];
  v_packs CONSTANT TEXT[] := ARRAY[
    'common', 'uncommon', 'rare', 'ultrarare',
    'prototype', 'mythic', 'legend', 'carbon'
  ];
BEGIN
  IF p_user_id IS NULL THEN RETURN; END IF;

  SELECT COUNT(DISTINCT owned.card_id)::INTEGER
  INTO v_unique
  FROM public.user_cards AS owned
  WHERE owned.user_id = p_user_id AND COALESCE(owned.count, 0) > 0;

  FOR v_index IN 1..array_length(v_thresholds, 1) LOOP
    EXIT WHEN v_unique < v_thresholds[v_index];
    v_level := v_levels[v_index];
    IF NOT EXISTS (
      SELECT 1 FROM public.user_gift_boosters
      WHERE user_id = p_user_id AND gift_key = 'garage_level_' || v_level
    ) THEN
      v_slug := v_packs[1 + FLOOR(random() * array_length(v_packs, 1))::INTEGER];
      INSERT INTO public.user_gift_boosters
        (user_id, gift_key, pack_slug, card_count)
      VALUES (
        p_user_id, 'garage_level_' || v_level, v_slug,
        CASE WHEN v_slug IN ('mythic', 'carbon') THEN 8 ELSE 6 END
      )
      ON CONFLICT (user_id, gift_key) DO NOTHING;
    END IF;
  END LOOP;
END;
$function$;

REVOKE ALL ON FUNCTION public.grant_garage_level_boosters(UUID) FROM PUBLIC, anon, authenticated;
-- Existing trigger on_inventory_garage_level_boosters continues to call this
-- function after vehicle inventory insertion or count/card ownership changes.
