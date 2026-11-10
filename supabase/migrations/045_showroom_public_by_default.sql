-- New player profiles are public by default. Existing showroom visibility is preserved.
-- The profile owner can still make their showroom private with set_user_showroom_public.
ALTER TABLE public.profiles
  ALTER COLUMN showroom_public SET DEFAULT TRUE;
