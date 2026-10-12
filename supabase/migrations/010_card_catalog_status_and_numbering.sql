ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS collection_number BIGINT;

UPDATE public.cards
SET is_active = TRUE
WHERE is_active IS NULL;

ALTER TABLE public.cards
  ALTER COLUMN is_active SET DEFAULT TRUE,
  ALTER COLUMN is_active SET NOT NULL;

WITH numbered_cards AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at NULLS FIRST, id) AS number
  FROM public.cards
)
UPDATE public.cards AS card
SET collection_number = numbered_cards.number
FROM numbered_cards
WHERE card.id = numbered_cards.id;

ALTER TABLE public.cards
  ALTER COLUMN collection_number SET NOT NULL;

CREATE SEQUENCE IF NOT EXISTS public.cards_collection_number_seq;

SELECT setval(
  'public.cards_collection_number_seq',
  COALESCE(MAX(collection_number), 0) + 1,
  FALSE
)
FROM public.cards;

ALTER TABLE public.cards
  ALTER COLUMN collection_number
  SET DEFAULT nextval('public.cards_collection_number_seq');

CREATE UNIQUE INDEX IF NOT EXISTS cards_collection_number_unique
  ON public.cards (collection_number);
