ALTER TABLE public.circuits
  ADD COLUMN IF NOT EXISTS collection_number BIGINT;

ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS collection_number BIGINT;

UPDATE public.circuits
SET rarity = 'Atypique'
WHERE rarity = 'Atypic';

WITH current_max AS (
  SELECT COALESCE(MAX(collection_number), 0) AS value
  FROM public.circuits
),
missing AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      ORDER BY NULLIF(to_jsonb(circuit) ->> 'created_at', '')::TIMESTAMPTZ NULLS FIRST, id
    ) AS row_number
  FROM public.circuits AS circuit
  WHERE collection_number IS NULL
)
UPDATE public.circuits AS circuit
SET collection_number = current_max.value + missing.row_number
FROM current_max, missing
WHERE circuit.id = missing.id;

WITH current_max AS (
  SELECT COALESCE(MAX(collection_number), 0) AS value
  FROM public.drivers
),
missing AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      ORDER BY created_at NULLS FIRST, id
    ) AS row_number
  FROM public.drivers
  WHERE collection_number IS NULL
)
UPDATE public.drivers AS driver
SET collection_number = current_max.value + missing.row_number
FROM current_max, missing
WHERE driver.id = missing.id;

ALTER TABLE public.circuits
  ALTER COLUMN collection_number SET NOT NULL;

ALTER TABLE public.drivers
  ALTER COLUMN collection_number SET NOT NULL;

CREATE SEQUENCE IF NOT EXISTS public.circuits_collection_number_seq;
SELECT setval(
  'public.circuits_collection_number_seq',
  COALESCE(MAX(collection_number), 0) + 1,
  FALSE
)
FROM public.circuits;

ALTER TABLE public.circuits
  ALTER COLUMN collection_number
  SET DEFAULT nextval('public.circuits_collection_number_seq');

GRANT USAGE, SELECT ON SEQUENCE public.circuits_collection_number_seq TO authenticated;

CREATE UNIQUE INDEX IF NOT EXISTS circuits_collection_number_unique
  ON public.circuits (collection_number);

CREATE SEQUENCE IF NOT EXISTS public.drivers_collection_number_seq;
SELECT setval(
  'public.drivers_collection_number_seq',
  COALESCE(MAX(collection_number), 0) + 1,
  FALSE
)
FROM public.drivers;

ALTER TABLE public.drivers
  ALTER COLUMN collection_number
  SET DEFAULT nextval('public.drivers_collection_number_seq');

GRANT USAGE, SELECT ON SEQUENCE public.drivers_collection_number_seq TO authenticated;

CREATE UNIQUE INDEX IF NOT EXISTS drivers_collection_number_unique
  ON public.drivers (collection_number);
