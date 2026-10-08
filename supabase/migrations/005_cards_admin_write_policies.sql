DROP POLICY IF EXISTS "Allow admin insert on cards" ON public.cards;
CREATE POLICY "Allow admin insert on cards"
ON public.cards
FOR INSERT
TO authenticated
WITH CHECK (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'bobwatercooling@gmail.com'
);

DROP POLICY IF EXISTS "Allow admin update on cards" ON public.cards;
CREATE POLICY "Allow admin update on cards"
ON public.cards
FOR UPDATE
TO authenticated
USING (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'bobwatercooling@gmail.com'
)
WITH CHECK (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'bobwatercooling@gmail.com'
);
