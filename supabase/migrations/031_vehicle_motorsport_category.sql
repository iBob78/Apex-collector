ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS motorsport_category TEXT;

CREATE OR REPLACE FUNCTION public.sync_alternative_art_motorsport_category()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.variant_of_card_id IS NULL THEN
    UPDATE public.cards
    SET motorsport_category = NEW.motorsport_category
    WHERE variant_of_card_id = NEW.card_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_alternative_art_motorsport_category ON public.cards;

CREATE TRIGGER sync_alternative_art_motorsport_category
AFTER UPDATE OF motorsport_category ON public.cards
FOR EACH ROW
EXECUTE FUNCTION public.sync_alternative_art_motorsport_category();
