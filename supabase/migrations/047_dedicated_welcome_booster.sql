-- 047: Give the one-time welcome booster its own non-purchasable pack slug.
-- Apply AFTER 042_player_welcome_gift_boosters.sql.
-- Run this migration BEFORE deploying the new frontend to avoid an opening race.
-- No retroactive gifts are granted; already opened gifts remain untouched.

ALTER TABLE public.user_gift_boosters
  DROP CONSTRAINT IF EXISTS user_gift_boosters_pack_slug_check;

ALTER TABLE public.user_gift_boosters
  ADD CONSTRAINT user_gift_boosters_pack_slug_check
  CHECK (pack_slug IN (
    'welcome', 'common', 'uncommon', 'rare', 'ultrarare',
    'prototype', 'mythic', 'legend', 'carbon'
  ));

-- Preserve IDs and uniqueness: update only unopened welcome gifts in place.
UPDATE public.user_gift_boosters
SET pack_slug = 'welcome', card_count = 10
WHERE gift_key = 'welcome_2026'
  AND opened_at IS NULL
  AND (pack_slug IS DISTINCT FROM 'welcome' OR card_count IS DISTINCT FROM 10);

CREATE OR REPLACE FUNCTION public.grant_player_welcome_booster()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.user_gift_boosters (user_id, gift_key, pack_slug, card_count)
  VALUES (NEW.id, 'welcome_2026', 'welcome', 10)
  ON CONFLICT (user_id, gift_key) DO NOTHING;
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.grant_player_welcome_booster() FROM PUBLIC, anon, authenticated;
