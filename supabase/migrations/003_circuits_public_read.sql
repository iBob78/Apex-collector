-- Allow the collection page to read the public circuit catalog.
DROP POLICY IF EXISTS "Circuits are viewable by all" ON public.circuits;

CREATE POLICY "Circuits are viewable by all"
ON public.circuits
FOR SELECT
USING (true);