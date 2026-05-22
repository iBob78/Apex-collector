-- Migration: Add quantity column to user_cards table
-- This fixes the error: "column user_cards.quantity does not exist"

-- Step 1: Add the quantity column with default value 1
ALTER TABLE public.user_cards 
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1 NOT NULL;

-- Step 2: Update existing records to have quantity = 1
-- (In case there are already records without this column)
UPDATE public.user_cards 
SET quantity = 1 
WHERE quantity IS NULL;

-- Step 3: Add a check constraint to ensure quantity is always positive
ALTER TABLE public.user_cards
ADD CONSTRAINT user_cards_quantity_positive CHECK (quantity > 0);

-- Verification query (run this after migration)
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_cards';
