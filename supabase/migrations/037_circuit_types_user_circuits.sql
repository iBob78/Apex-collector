DO $$
DECLARE
  v_table_oid REGCLASS;
BEGIN
  v_table_oid := to_regclass('public.user_circuits');
  IF v_table_oid IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = v_table_oid
      AND attname = 'type'
      AND NOT attisdropped
  ) THEN
    RETURN;
  END IF;

  EXECUTE $query$
    INSERT INTO public.circuit_types (name)
    SELECT min(btrim(owned.type::text))
    FROM public.user_circuits AS owned
    WHERE NULLIF(btrim(owned.type::text), '') IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM public.circuit_types
        WHERE lower(public.circuit_types.name) = lower(btrim(owned.type::text))
      )
    GROUP BY lower(btrim(owned.type::text))
    ON CONFLICT (name) DO NOTHING
  $query$;

  EXECUTE $query$
    UPDATE public.user_circuits AS owned
    SET type = circuit_types.name
    FROM public.circuit_types
    WHERE lower(btrim(owned.type::text)) = lower(circuit_types.name)
      AND owned.type::text IS DISTINCT FROM circuit_types.name
  $query$;

  EXECUTE 'ALTER TABLE public.user_circuits DROP CONSTRAINT IF EXISTS user_circuits_type_check';
  EXECUTE 'ALTER TABLE public.user_circuits DROP CONSTRAINT IF EXISTS user_circuits_type_fkey';
  EXECUTE $query$
    ALTER TABLE public.user_circuits
      ADD CONSTRAINT user_circuits_type_fkey
      FOREIGN KEY (type)
      REFERENCES public.circuit_types (name)
      ON UPDATE CASCADE
      ON DELETE SET NULL
  $query$;
END;
$$;
