CREATE TABLE IF NOT EXISTS public.admin_control (
  singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT
);

ALTER TABLE public.admin_control ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_control FROM PUBLIC, anon, authenticated;

DO $$
DECLARE
  v_owner_id UUID;
BEGIN
  SELECT id
  INTO v_owner_id
  FROM auth.users
  WHERE lower(email) = 'bobwatercooling@gmail.com'
  ORDER BY created_at
  LIMIT 1;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Cannot initialize admin control: the existing owner account was not found.';
  END IF;

  INSERT INTO public.admin_control (singleton, owner_user_id)
  VALUES (TRUE, v_owner_id)
  ON CONFLICT (singleton) DO NOTHING;
END;
$$;

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_users FROM PUBLIC, anon, authenticated;

INSERT INTO public.admin_users (user_id, assigned_by)
SELECT owner_user_id, owner_user_id
FROM public.admin_control
WHERE singleton = TRUE
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_site_owner()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_control
    WHERE singleton = TRUE
      AND owner_user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (user_id UUID, username TEXT, assigned_at TIMESTAMPTZ)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF NOT public.is_site_owner() THEN
    RAISE EXCEPTION 'Only the site owner can view assigned administrators.';
  END IF;

  RETURN QUERY
  SELECT admins.user_id, profile.username::TEXT, admins.assigned_at
  FROM public.admin_users AS admins
  LEFT JOIN public.profiles AS profile ON profile.id = admins.user_id
  ORDER BY (admins.user_id = auth.uid()) DESC, lower(COALESCE(profile.username, ''));
END;
$$;

CREATE OR REPLACE FUNCTION public.set_admin_by_username(p_username TEXT)
RETURNS TABLE (user_id UUID, username TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_requested_username TEXT := NULLIF(BTRIM(p_username), '');
  v_match_count INTEGER;
  v_user_id UUID;
  v_username TEXT;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_site_owner() THEN
    RAISE EXCEPTION 'Only the site owner can assign administrators.';
  END IF;
  IF v_requested_username IS NULL OR LENGTH(v_requested_username) > 100 THEN
    RAISE EXCEPTION 'Enter a valid player username.';
  END IF;

  SELECT COUNT(*)
  INTO v_match_count
  FROM public.profiles AS profile
  WHERE lower(BTRIM(profile.username)) = lower(v_requested_username);

  IF v_match_count = 0 THEN
    RAISE EXCEPTION 'No player was found with that username.';
  END IF;
  IF v_match_count > 1 THEN
    RAISE EXCEPTION 'That username matches multiple accounts; no administrator was added.';
  END IF;

  SELECT profile.id, profile.username::TEXT
  INTO v_user_id, v_username
  FROM public.profiles AS profile
  WHERE lower(BTRIM(profile.username)) = lower(v_requested_username);

  INSERT INTO public.admin_users (user_id, assigned_by)
  VALUES (v_user_id, auth.uid())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN QUERY SELECT v_user_id, v_username;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_admin_by_user_id(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_site_owner() THEN
    RAISE EXCEPTION 'Only the site owner can remove administrators.';
  END IF;
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'An administrator account is required.';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM public.admin_control
    WHERE singleton = TRUE
      AND owner_user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'The site owner cannot be removed as an administrator.';
  END IF;

  DELETE FROM public.admin_users WHERE user_id = p_user_id;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.is_site_owner() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_admin_users() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_admin_by_username(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.remove_admin_by_user_id(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_site_owner() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_admin_by_username(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_admin_by_user_id(UUID) TO authenticated;

DROP POLICY IF EXISTS "Allow admin insert on cards" ON public.cards;
CREATE POLICY "Allow admin insert on cards"
  ON public.cards FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow admin update on cards" ON public.cards;
CREATE POLICY "Allow admin update on cards"
  ON public.cards FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow admin insert on circuits" ON public.circuits;
CREATE POLICY "Allow admin insert on circuits"
  ON public.circuits FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow admin update on circuits" ON public.circuits;
CREATE POLICY "Allow admin update on circuits"
  ON public.circuits FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow admin insert on drivers" ON public.drivers;
CREATE POLICY "Allow admin insert on drivers"
  ON public.drivers FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow admin update on drivers" ON public.drivers;
CREATE POLICY "Allow admin update on drivers"
  ON public.drivers FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Active objectives are viewable by all" ON public.objective_definitions;
CREATE POLICY "Active objectives are viewable by all"
  ON public.objective_definitions FOR SELECT
  USING (is_active OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage objectives" ON public.objective_definitions;
CREATE POLICY "Admins manage objectives"
  ON public.objective_definitions FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins insert competition types" ON public.competition_types;
CREATE POLICY "Admins insert competition types"
  ON public.competition_types FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins update competition types" ON public.competition_types;
CREATE POLICY "Admins update competition types"
  ON public.competition_types FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins delete competition types" ON public.competition_types;
CREATE POLICY "Admins delete competition types"
  ON public.competition_types FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins read card suggestions" ON public.card_suggestions;
CREATE POLICY "Admins read card suggestions"
  ON public.card_suggestions FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins update card suggestions" ON public.card_suggestions;
CREATE POLICY "Admins update card suggestions"
  ON public.card_suggestions FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
