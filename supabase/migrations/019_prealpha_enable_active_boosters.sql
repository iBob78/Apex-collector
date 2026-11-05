UPDATE public.cards
SET booster_enabled = TRUE
WHERE is_active IS TRUE
  AND booster_enabled IS FALSE;
