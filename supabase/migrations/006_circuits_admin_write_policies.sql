DROP POLICY IF EXISTS "Allow admin insert on circuits" ON public.circuits;
CREATE POLICY "Allow admin insert on circuits"
ON public.circuits
FOR INSERT
TO authenticated
WITH CHECK (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'bobwatercooling@gmail.com'
);

DROP POLICY IF EXISTS "Allow admin update on circuits" ON public.circuits;
CREATE POLICY "Allow admin update on circuits"
ON public.circuits
FOR UPDATE
TO authenticated
USING (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'bobwatercooling@gmail.com'
)
WITH CHECK (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'bobwatercooling@gmail.com'
);
