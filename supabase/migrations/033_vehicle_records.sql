ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS is_record BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS record_description TEXT;

CREATE OR REPLACE FUNCTION public.sync_alternative_art_competition_type()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.variant_of_card_id IS NULL THEN
    UPDATE public.cards
    SET
      competition_type = NEW.competition_type,
      competition_type_custom = NEW.competition_type_custom,
      is_record = NEW.is_record,
      record_description = NEW.record_description
    WHERE variant_of_card_id = NEW.card_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_alternative_art_competition_type ON public.cards;

CREATE TRIGGER sync_alternative_art_competition_type
AFTER UPDATE OF
  competition_type, competition_type_custom, is_record, record_description
ON public.cards
FOR EACH ROW
EXECUTE FUNCTION public.sync_alternative_art_competition_type();
