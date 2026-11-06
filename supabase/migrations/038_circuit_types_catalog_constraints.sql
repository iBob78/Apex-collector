DO $$
DECLARE
  v_table_name TEXT;
  v_table_oid REGCLASS;
  v_type_attnum SMALLINT;
  v_constraint_name TEXT;
BEGIN
  FOREACH v_table_name IN ARRAY ARRAY['circuits', 'user_circuits']
  LOOP
    v_table_oid := to_regclass(format('public.%I', v_table_name));
    IF v_table_oid IS NULL THEN
      CONTINUE;
    END IF;

    SELECT attnum
    INTO v_type_attnum
    FROM pg_attribute
    WHERE attrelid = v_table_oid
      AND attname = 'type'
      AND NOT attisdropped;

    IF v_type_attnum IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format($query$
      INSERT INTO public.circuit_types (name)
      SELECT min(btrim(owned.type::text))
      FROM public.%I AS owned
      WHERE NULLIF(btrim(owned.type::text), '') IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM public.circuit_types
          WHERE lower(public.circuit_types.name) = lower(btrim(owned.type::text))
        )
      GROUP BY lower(btrim(owned.type::text))
      ON CONFLICT (name) DO NOTHING
    $query$, v_table_name);

    FOR v_constraint_name IN
      SELECT constraint_row.conname
      FROM pg_constraint AS constraint_row
      WHERE constraint_row.conrelid = v_table_oid
        AND constraint_row.contype = 'c'
        AND v_type_attnum = ANY(constraint_row.conkey)
    LOOP
      EXECUTE format(
        'ALTER TABLE public.%I DROP CONSTRAINT %I',
        v_table_name,
        v_constraint_name
      );
    END LOOP;

    EXECUTE format($query$
      UPDATE public.%I AS owned
      SET type = circuit_types.name
      FROM public.circuit_types
      WHERE lower(btrim(owned.type::text)) = lower(circuit_types.name)
        AND owned.type::text IS DISTINCT FROM circuit_types.name
    $query$, v_table_name);

    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', v_table_name, v_table_name || '_type_fkey');
    EXECUTE format($query$
      ALTER TABLE public.%I
        ADD CONSTRAINT %I
        FOREIGN KEY (type)
        REFERENCES public.circuit_types (name)
        ON UPDATE CASCADE
        ON DELETE SET NULL
    $query$, v_table_name, v_table_name || '_type_fkey');
  END LOOP;
END;
$$;
