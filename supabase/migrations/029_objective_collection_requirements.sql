ALTER TABLE public.objective_definitions
  DROP CONSTRAINT IF EXISTS objective_definitions_objective_type_check;

ALTER TABLE public.objective_definitions
  ADD CONSTRAINT objective_definitions_objective_type_check
  CHECK (
    objective_type IN (
      'booster_open',
      'collection_count',
      'rarity_card',
      'marketplace_listing',
      'circuit_collection',
      'daily_login',
      'collection_requirement'
    )
  );

ALTER TABLE public.objective_definitions
  ADD COLUMN IF NOT EXISTS requirements JSONB NOT NULL DEFAULT '[]'::JSONB;

ALTER TABLE public.objective_definitions
  DROP CONSTRAINT IF EXISTS objective_definitions_requirements_check;

ALTER TABLE public.objective_definitions
  ADD CONSTRAINT objective_definitions_requirements_check
  CHECK (
    jsonb_typeof(requirements) = 'array'
    AND jsonb_array_length(requirements) <= 20
    AND (objective_type <> 'collection_requirement' OR jsonb_array_length(requirements) > 0)
  );

ALTER TABLE public.objective_definitions
  ADD COLUMN IF NOT EXISTS requirement_operator TEXT NOT NULL DEFAULT 'all';

ALTER TABLE public.objective_definitions
  DROP CONSTRAINT IF EXISTS objective_definitions_requirement_operator_check;

ALTER TABLE public.objective_definitions
  ADD CONSTRAINT objective_definitions_requirement_operator_check
  CHECK (requirement_operator IN ('all', 'any'));

ALTER TABLE public.user_objective_progress
  ADD COLUMN IF NOT EXISTS requirement_progress JSONB NOT NULL DEFAULT '[]'::JSONB;

CREATE OR REPLACE FUNCTION public.refresh_collection_objective_progress()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_objective RECORD;
  v_requirement JSONB;
  v_count BIGINT;
  v_satisfied INTEGER;
  v_progress JSONB;
  v_mode TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  PERFORM public.ensure_user_objectives();

  FOR v_objective IN
    SELECT objective.id, objective.requirements, objective.requirement_operator, objective.target_count
    FROM public.objective_definitions AS objective
    JOIN public.user_objective_progress AS progress
      ON progress.objective_id = objective.id
    WHERE progress.user_id = v_user_id
      AND progress.status = 'active'
      AND objective.is_active
      AND objective.objective_type = 'collection_requirement'
  LOOP
    v_progress := '[]'::JSONB;
    v_satisfied := 0;

    FOR v_requirement IN
      SELECT value FROM jsonb_array_elements(v_objective.requirements)
    LOOP
      v_mode := CASE WHEN v_requirement ->> 'count_mode' = 'unique' THEN 'unique' ELSE 'copies' END;
      v_count := 0;

      IF v_requirement ->> 'category' = 'vehicle' THEN
        SELECT CASE
          WHEN v_mode = 'unique' THEN COUNT(DISTINCT catalog.id)
          ELSE COALESCE(SUM(COALESCE(owned.count, 1)), 0)
        END
        INTO v_count
        FROM public.cards AS catalog
        JOIN public.user_cards AS owned
          ON owned.card_id::TEXT = catalog.card_id::TEXT
          OR owned.card_id::TEXT = catalog.id::TEXT
        WHERE owned.user_id = v_user_id
          AND COALESCE(owned.count, 1) > 0
          AND (NULLIF(v_requirement ->> 'card_id', '') IS NULL OR catalog.card_id::TEXT = v_requirement ->> 'card_id')
          AND (NULLIF(v_requirement ->> 'make', '') IS NULL OR lower(btrim(catalog.make)) = lower(btrim(v_requirement ->> 'make')))
          AND (NULLIF(v_requirement ->> 'model', '') IS NULL OR lower(btrim(catalog.model)) = lower(btrim(v_requirement ->> 'model')))
          AND (NULLIF(v_requirement ->> 'year', '') IS NULL OR catalog.year::TEXT = v_requirement ->> 'year')
          AND (NULLIF(v_requirement ->> 'rarity', '') IS NULL OR lower(catalog.rarity) = lower(v_requirement ->> 'rarity'))
          AND (NULLIF(v_requirement ->> 'fuel_type', '') IS NULL OR lower(btrim(COALESCE(catalog.fuel_type, ''))) = lower(btrim(v_requirement ->> 'fuel_type')))
          AND (NULLIF(v_requirement ->> 'transmission', '') IS NULL OR lower(btrim(COALESCE(catalog.transmission, ''))) = lower(btrim(v_requirement ->> 'transmission')));
      ELSIF v_requirement ->> 'category' = 'circuit' THEN
        SELECT CASE
          WHEN v_mode = 'unique' THEN COUNT(DISTINCT catalog.id)
          ELSE COALESCE(SUM(COALESCE(owned.count, 1)), 0)
        END
        INTO v_count
        FROM public.circuits AS catalog
        JOIN public.user_circuits AS owned
          ON owned.circuit_id::TEXT = catalog.circuit_id::TEXT
          OR owned.circuit_id::TEXT = catalog.id::TEXT
        WHERE owned.user_id = v_user_id
          AND COALESCE(owned.count, 1) > 0
          AND (NULLIF(v_requirement ->> 'card_id', '') IS NULL OR catalog.circuit_id::TEXT = v_requirement ->> 'card_id')
          AND (NULLIF(v_requirement ->> 'year', '') IS NULL OR catalog.year::TEXT = v_requirement ->> 'year')
          AND (NULLIF(v_requirement ->> 'rarity', '') IS NULL OR lower(catalog.rarity) = lower(v_requirement ->> 'rarity'))
          AND (NULLIF(v_requirement ->> 'country', '') IS NULL OR lower(btrim(COALESCE(catalog.country, ''))) = lower(btrim(v_requirement ->> 'country')))
          AND (NULLIF(v_requirement ->> 'type', '') IS NULL OR lower(btrim(COALESCE(catalog.type, ''))) = lower(btrim(v_requirement ->> 'type')));
      ELSIF v_requirement ->> 'category' = 'driver' THEN
        SELECT CASE
          WHEN v_mode = 'unique' THEN COUNT(DISTINCT catalog.driver_id)
          ELSE COALESCE(SUM(COALESCE(owned.count, 1)), 0)
        END
        INTO v_count
        FROM public.drivers AS catalog
        JOIN public.user_drivers AS owned
          ON owned.driver_id::TEXT = catalog.driver_id::TEXT
          OR owned.driver_id::TEXT = catalog.id::TEXT
        WHERE owned.user_id = v_user_id
          AND COALESCE(owned.count, 1) > 0
          AND (NULLIF(v_requirement ->> 'card_id', '') IS NULL OR catalog.driver_id::TEXT = v_requirement ->> 'card_id')
          AND (NULLIF(v_requirement ->> 'year', '') IS NULL OR catalog.year::TEXT = v_requirement ->> 'year')
          AND (NULLIF(v_requirement ->> 'rarity', '') IS NULL OR lower(catalog.rarity) = lower(v_requirement ->> 'rarity'))
          AND (NULLIF(v_requirement ->> 'country', '') IS NULL OR lower(btrim(catalog.country)) = lower(btrim(v_requirement ->> 'country')));
      END IF;

      v_progress := v_progress || jsonb_build_array(v_count);
      IF v_count >= COALESCE(NULLIF(v_requirement ->> 'target_count', '')::INTEGER, 1) THEN
        v_satisfied := v_satisfied + 1;
      END IF;
    END LOOP;

    IF v_objective.requirement_operator = 'any' THEN
      v_satisfied := LEAST(v_satisfied, 1);
    END IF;

    UPDATE public.user_objective_progress AS progress
    SET
      current_count = v_satisfied,
      requirement_progress = v_progress,
      status = CASE
        WHEN v_satisfied >= v_objective.target_count THEN 'completed'
        ELSE 'active'
      END,
      completed_at = CASE
        WHEN v_satisfied >= v_objective.target_count THEN NOW()
        ELSE NULL
      END
    WHERE progress.user_id = v_user_id
      AND progress.objective_id = v_objective.id
      AND progress.status = 'active';
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_objective_progress(
  p_objective_type TEXT,
  p_amount INTEGER DEFAULT 1,
  p_rarity TEXT DEFAULT NULL
)
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
  IF p_amount < 1 OR p_objective_type NOT IN (
    'booster_open', 'collection_count', 'rarity_card',
    'marketplace_listing', 'circuit_collection', 'daily_login'
  ) THEN
    RAISE EXCEPTION 'Invalid objective progress event';
  END IF;

  PERFORM public.ensure_user_objectives();

  IF p_objective_type = 'booster_open' THEN
    INSERT INTO public.user_booster_open_stats (user_id, total_opens, updated_at)
    VALUES (v_user_id, p_amount, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET total_opens = user_booster_open_stats.total_opens + EXCLUDED.total_opens,
        updated_at = NOW();
  END IF;

  UPDATE public.user_objective_progress AS progress
  SET
    current_count = LEAST(objective.target_count, progress.current_count + p_amount),
    status = CASE
      WHEN progress.current_count + p_amount >= objective.target_count THEN 'completed'
      ELSE 'active'
    END,
    completed_at = CASE
      WHEN progress.current_count + p_amount >= objective.target_count THEN NOW()
      ELSE NULL
    END,
    last_daily_progress_at = CASE
      WHEN p_objective_type = 'daily_login' THEN CURRENT_DATE
      ELSE progress.last_daily_progress_at
    END
  FROM public.objective_definitions AS objective
  WHERE progress.objective_id = objective.id
    AND progress.user_id = v_user_id
    AND progress.status = 'active'
    AND objective.is_active
    AND objective.objective_type = p_objective_type
    AND (objective.objective_type <> 'rarity_card' OR lower(objective.required_rarity) = lower(coalesce(p_rarity, '')))
    AND (
      p_objective_type <> 'daily_login'
      OR progress.last_daily_progress_at IS DISTINCT FROM CURRENT_DATE
    );

  IF p_objective_type IN ('collection_count', 'circuit_collection') THEN
    PERFORM public.refresh_collection_objective_progress();
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_collection_objective_progress() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_collection_objective_progress() TO authenticated;

REVOKE ALL ON FUNCTION public.record_objective_progress(TEXT, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_objective_progress(TEXT, INTEGER, TEXT) TO authenticated;
