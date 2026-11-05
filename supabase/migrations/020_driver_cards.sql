CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year BETWEEN 1880 AND 2200),
  birth_date DATE NOT NULL,
  country TEXT NOT NULL,
  country_code TEXT,
  world_championships INTEGER NOT NULL DEFAULT 0 CHECK (world_championships >= 0),
  won_monaco_gp BOOLEAN NOT NULL DEFAULT FALSE,
  won_indy_500 BOOLEAN NOT NULL DEFAULT FALSE,
  won_24h_le_mans BOOLEAN NOT NULL DEFAULT FALSE,
  rarity TEXT NOT NULL DEFAULT 'Common',
  image_url TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  booster_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT drivers_birth_before_card_year CHECK (birth_date <= make_date(year, 12, 31))
);

CREATE INDEX IF NOT EXISTS drivers_active_year_name_idx
  ON public.drivers (is_active, year, name);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Drivers are viewable by all" ON public.drivers;
CREATE POLICY "Drivers are viewable by all"
  ON public.drivers FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Allow admin insert on drivers" ON public.drivers;
CREATE POLICY "Allow admin insert on drivers"
  ON public.drivers FOR INSERT TO authenticated
  WITH CHECK (
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'bobwatercooling@gmail.com'
  );

DROP POLICY IF EXISTS "Allow admin update on drivers" ON public.drivers;
CREATE POLICY "Allow admin update on drivers"
  ON public.drivers FOR UPDATE TO authenticated
  USING (
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'bobwatercooling@gmail.com'
  )
  WITH CHECK (
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'bobwatercooling@gmail.com'
  );

GRANT SELECT ON public.drivers TO anon, authenticated;
GRANT INSERT, UPDATE ON public.drivers TO authenticated;

CREATE TABLE IF NOT EXISTS public.user_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.drivers(driver_id) ON DELETE CASCADE,
  count INTEGER NOT NULL DEFAULT 1 CHECK (count > 0),
  source TEXT NOT NULL DEFAULT 'booster',
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, driver_id)
);

CREATE INDEX IF NOT EXISTS user_drivers_user_idx
  ON public.user_drivers (user_id);

ALTER TABLE public.user_drivers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players read own drivers" ON public.user_drivers;
CREATE POLICY "Players read own drivers"
  ON public.user_drivers FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Players add own drivers" ON public.user_drivers;
CREATE POLICY "Players add own drivers"
  ON public.user_drivers FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Players update own drivers" ON public.user_drivers;
CREATE POLICY "Players update own drivers"
  ON public.user_drivers FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Players remove own drivers" ON public.user_drivers;
CREATE POLICY "Players remove own drivers"
  ON public.user_drivers FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_drivers TO authenticated;

ALTER TABLE public.card_favorites
  DROP CONSTRAINT IF EXISTS card_favorites_category_check;

ALTER TABLE public.card_favorites
  ADD CONSTRAINT card_favorites_category_check
  CHECK (category IN ('vehicle', 'circuit', 'driver'));

DROP POLICY IF EXISTS "Players favorite only owned cards" ON public.card_favorites;
CREATE POLICY "Players favorite only owned cards"
  ON public.card_favorites FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (
      (category = 'vehicle' AND EXISTS (
        SELECT 1 FROM public.user_cards AS owned
        WHERE owned.user_id = (SELECT auth.uid())
          AND owned.card_id = card_favorites.card_id
          AND COALESCE(owned.count, 0) > 0
      ))
      OR
      (category = 'circuit' AND EXISTS (
        SELECT 1 FROM public.user_circuits AS owned
        WHERE owned.user_id = (SELECT auth.uid())
          AND owned.circuit_id = card_favorites.card_id
          AND COALESCE(owned.count, 0) > 0
      ))
      OR
      (category = 'driver' AND EXISTS (
        SELECT 1 FROM public.user_drivers AS owned
        WHERE owned.user_id = (SELECT auth.uid())
          AND owned.driver_id = card_favorites.card_id
          AND COALESCE(owned.count, 0) > 0
      ))
    )
  );
