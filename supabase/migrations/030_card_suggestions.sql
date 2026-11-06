CREATE TABLE IF NOT EXISTS public.card_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('vehicle', 'circuit', 'driver')),
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 160),
  details JSONB NOT NULL CHECK (jsonb_typeof(details) = 'object'),
  submitter_name TEXT CHECK (submitter_name IS NULL OR length(submitter_name) <= 60),
  source_url TEXT CHECK (source_url IS NULL OR length(source_url) <= 2048),
  message TEXT CHECK (message IS NULL OR length(message) <= 1000),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  admin_note TEXT CHECK (admin_note IS NULL OR length(admin_note) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS card_suggestions_status_created_idx
  ON public.card_suggestions (status, created_at DESC);

ALTER TABLE public.card_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players submit own card suggestions" ON public.card_suggestions;
CREATE POLICY "Players submit own card suggestions"
  ON public.card_suggestions FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND status = 'pending'
    AND admin_note IS NULL
  );

DROP POLICY IF EXISTS "Admins read card suggestions" ON public.card_suggestions;
CREATE POLICY "Admins read card suggestions"
  ON public.card_suggestions FOR SELECT TO authenticated
  USING (
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'bobwatercooling@gmail.com'
  );

DROP POLICY IF EXISTS "Admins update card suggestions" ON public.card_suggestions;
CREATE POLICY "Admins update card suggestions"
  ON public.card_suggestions FOR UPDATE TO authenticated
  USING (
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'bobwatercooling@gmail.com'
  )
  WITH CHECK (
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'bobwatercooling@gmail.com'
  );

GRANT INSERT, SELECT, UPDATE ON public.card_suggestions TO authenticated;
