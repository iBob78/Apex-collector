-- Registration: chosen username/language/units, verified email, 20,000 Apex Credits.
-- Keep the technical column 'ap' for compatibility; never overwrite existing balances.
ALTER TABLE public.profiles ALTER COLUMN ap SET DEFAULT 20000;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_unique
  ON public.profiles (lower(username));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_username text;
  v_language text;
  v_units text;
BEGIN
  v_username := btrim(coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    split_part(new.email, '@', 1)
  ));
  IF new.raw_user_meta_data ? 'username'
     AND (v_username IS NULL OR v_username !~ '^[A-Za-z0-9_-]{3,24}$') THEN
    RAISE EXCEPTION 'Invalid player username';
  END IF;
  -- Invitation-created accounts may have no username metadata.
  IF v_username IS NULL OR v_username !~ '^[A-Za-z0-9_-]{3,24}$' THEN
    v_username := 'pilot_' || left(replace(new.id::text, '-', ''), 12);
  END IF;
  v_language := CASE
    WHEN new.raw_user_meta_data->>'language' IN ('fr', 'en', 'es')
      THEN new.raw_user_meta_data->>'language'
    ELSE 'fr'
  END;
  v_units := CASE
    WHEN new.raw_user_meta_data->>'unit_preference' IN ('metric', 'imperial')
      THEN new.raw_user_meta_data->>'unit_preference'
    ELSE 'metric'
  END;
  INSERT INTO public.profiles (id, username, email, language, unit_preference, ap)
  VALUES (new.id, v_username, new.email, v_language, v_units, 20000);
  RETURN new;
END
$function$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
UPDATE public.profiles AS p SET email = a.email
FROM auth.users AS a
WHERE p.id = a.id AND p.email IS NULL;

-- Repair historical Auth accounts with no profile; do not alter existing profiles.
INSERT INTO public.profiles (id, username, email, ap, language, unit_preference)
SELECT a.id, 'pilot_' || left(replace(a.id::text, '-', ''), 12), a.email, 20000, 'fr', 'metric'
FROM auth.users AS a
WHERE NOT EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = a.id)
ON CONFLICT (id) DO NOTHING;
