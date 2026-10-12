DO $$
DECLARE
  v_table_name TEXT;
  v_constraint_name TEXT;
  v_table_oid REGCLASS;
BEGIN
  FOREACH v_table_name IN ARRAY ARRAY['circuits', 'user_circuits']
  LOOP
    v_table_oid := to_regclass(format('public.%I', v_table_name));
    IF v_table_oid IS NULL OR NOT EXISTS (
      SELECT 1
      FROM pg_attribute
      WHERE attrelid = v_table_oid
        AND attname = 'rarity'
        AND NOT attisdropped
    ) THEN
      CONTINUE;
    END IF;

    FOR v_constraint_name IN
      SELECT constraint_row.conname
      FROM pg_constraint AS constraint_row
      WHERE constraint_row.conrelid = v_table_oid
        AND constraint_row.contype = 'c'
        AND constraint_row.conname IN (
          'user_circuits_rarity_check',
          'circuits_rarity_check',
          'user_circuits_rarity_supported_check',
          'circuits_rarity_supported_check'
        )
    LOOP
      EXECUTE format(
        'ALTER TABLE public.%I DROP CONSTRAINT %I',
        v_table_name,
        v_constraint_name
      );
    END LOOP;

    EXECUTE format(
      'ALTER TABLE public.%I ADD CONSTRAINT %I CHECK (
        rarity IS NULL OR lower(rarity::text) IN (
          ''common'', ''uncommon'', ''atypique'', ''rare'', ''very rare'',
          ''epic'', ''legend'', ''legendary'', ''mythic'', ''icon''
        )
      ) NOT VALID',
      v_table_name,
      v_table_name || '_rarity_supported_check'
    );
  END LOOP;
END;
$$;
