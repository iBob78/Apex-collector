CREATE OR REPLACE FUNCTION public.assign_lowest_available_collection_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  IF TG_TABLE_NAME NOT IN ('cards', 'circuits', 'drivers') THEN
    RAISE EXCEPTION 'Unsupported collection-number catalog: %', TG_TABLE_NAME;
  END IF;

  PERFORM pg_advisory_xact_lock(1463897165, hashtext(TG_TABLE_NAME));

  EXECUTE format(
    'SELECT min(candidate)
       FROM pg_catalog.generate_series(
         1::bigint,
         (SELECT count(*)::bigint + 1 FROM public.%I)
       ) AS available(candidate)
      WHERE NOT EXISTS (
        SELECT 1
          FROM public.%I AS existing
         WHERE existing.collection_number = available.candidate
      )',
    TG_TABLE_NAME,
    TG_TABLE_NAME
  )
  INTO NEW.collection_number;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assign_lowest_collection_number ON public.cards;
CREATE TRIGGER assign_lowest_collection_number
BEFORE INSERT ON public.cards
FOR EACH ROW
EXECUTE FUNCTION public.assign_lowest_available_collection_number();

DROP TRIGGER IF EXISTS assign_lowest_collection_number ON public.circuits;
CREATE TRIGGER assign_lowest_collection_number
BEFORE INSERT ON public.circuits
FOR EACH ROW
EXECUTE FUNCTION public.assign_lowest_available_collection_number();

DROP TRIGGER IF EXISTS assign_lowest_collection_number ON public.drivers;
CREATE TRIGGER assign_lowest_collection_number
BEFORE INSERT ON public.drivers
FOR EACH ROW
EXECUTE FUNCTION public.assign_lowest_available_collection_number();
