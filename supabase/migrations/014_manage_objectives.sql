CREATE TABLE IF NOT EXISTS public.objective_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('contract', 'achievement')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  objective_type TEXT NOT NULL CHECK (
    objective_type IN (
      'booster_open',
      'collection_count',
      'rarity_card',
      'marketplace_listing',
      'circuit_collection',
      'daily_login'
    )
  ),
  target_count INTEGER NOT NULL DEFAULT 1 CHECK (target_count > 0),
  required_rarity TEXT,
  reward_ap INTEGER NOT NULL DEFAULT 0 CHECK (reward_ap >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (objective_type <> 'rarity_card' OR required_rarity IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.user_objective_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  objective_id UUID NOT NULL REFERENCES public.objective_definitions(id) ON DELETE CASCADE,
  current_count INTEGER NOT NULL DEFAULT 0 CHECK (current_count >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'claimed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_daily_progress_at DATE,
  UNIQUE (user_id, objective_id)
);

ALTER TABLE public.objective_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_objective_progress ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.objective_definitions TO anon, authenticated;
GRANT INSERT, UPDATE ON public.objective_definitions TO authenticated;
GRANT SELECT ON public.user_objective_progress TO authenticated;

DROP POLICY IF EXISTS "Active objectives are viewable by all" ON public.objective_definitions;
CREATE POLICY "Active objectives are viewable by all"
ON public.objective_definitions
FOR SELECT
USING (
  is_active
  OR lower(coalesce(auth.jwt() ->> 'email', '')) = 'bobwatercooling@gmail.com'
);

DROP POLICY IF EXISTS "Admins manage objectives" ON public.objective_definitions;
CREATE POLICY "Admins manage objectives"
ON public.objective_definitions
FOR ALL
TO authenticated
USING (lower(coalesce(auth.jwt() ->> 'email', '')) = 'bobwatercooling@gmail.com')
WITH CHECK (lower(coalesce(auth.jwt() ->> 'email', '')) = 'bobwatercooling@gmail.com');

DROP POLICY IF EXISTS "Users can view their own objective progress" ON public.user_objective_progress;
CREATE POLICY "Users can view their own objective progress"
ON public.user_objective_progress
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.ensure_user_objectives()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.user_objective_progress (user_id, objective_id)
  SELECT v_user_id, objective.id
  FROM public.objective_definitions AS objective
  WHERE objective.is_active
  ON CONFLICT (user_id, objective_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_objectives_to_profiles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.is_active THEN
    INSERT INTO public.user_objective_progress (user_id, objective_id)
    SELECT profile.id, NEW.id
    FROM public.profiles AS profile
    ON CONFLICT (user_id, objective_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assign_objectives_to_profiles ON public.objective_definitions;
CREATE TRIGGER assign_objectives_to_profiles
AFTER INSERT OR UPDATE OF is_active ON public.objective_definitions
FOR EACH ROW
EXECUTE FUNCTION public.assign_objectives_to_profiles();

CREATE OR REPLACE FUNCTION public.record_objective_progress(
  p_objective_type TEXT,
  p_amount INTEGER DEFAULT 1,
  p_rarity TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_amount < 1 OR p_objective_type NOT IN (
    'booster_open', 'collection_count', 'rarity_card',
    'marketplace_listing', 'circuit_collection', 'daily_login'
  ) THEN
    RAISE EXCEPTION 'Invalid objective progress event';
  END IF;

  PERFORM public.ensure_user_objectives();

  UPDATE public.user_objective_progress AS progress
  SET
    current_count = LEAST(objective.target_count, progress.current_count + p_amount),
    status = CASE
      WHEN progress.current_count + p_amount >= objective.target_count THEN 'completed'
      ELSE 'active'
    END,
    completed_at = CASE
      WHEN progress.current_count + p_amount >= objective.target_count THEN NOW()
      ELSE NULL
    END,
    last_daily_progress_at = CASE
      WHEN p_objective_type = 'daily_login' THEN CURRENT_DATE
      ELSE progress.last_daily_progress_at
    END
  FROM public.objective_definitions AS objective
  WHERE progress.objective_id = objective.id
    AND progress.user_id = v_user_id
    AND progress.status = 'active'
    AND objective.is_active
    AND objective.objective_type = p_objective_type
    AND (objective.objective_type <> 'rarity_card' OR lower(objective.required_rarity) = lower(coalesce(p_rarity, '')))
    AND (
      p_objective_type <> 'daily_login'
      OR progress.last_daily_progress_at IS DISTINCT FROM CURRENT_DATE
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_objective_reward(p_progress_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_reward INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT objective.reward_ap
  INTO v_reward
  FROM public.user_objective_progress AS progress
  JOIN public.objective_definitions AS objective ON objective.id = progress.objective_id
  WHERE progress.id = p_progress_id
    AND progress.user_id = v_user_id
    AND progress.status = 'completed'
  FOR UPDATE OF progress;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Récompense non disponible.');
  END IF;

  UPDATE public.profiles
  SET ap = coalesce(ap, 0) + v_reward
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Player profile not found';
  END IF;

  UPDATE public.user_objective_progress
  SET status = 'claimed'
  WHERE id = p_progress_id AND user_id = v_user_id AND status = 'completed';

  RETURN jsonb_build_object('success', true, 'reward', v_reward);
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_user_objectives() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_objective_progress(TEXT, INTEGER, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_objective_reward(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_user_objectives() TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_objective_progress(TEXT, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_objective_reward(UUID) TO authenticated;

INSERT INTO public.objective_definitions (
  id, category, title, description, objective_type, target_count,
  required_rarity, reward_ap, created_at
)
SELECT
  quest.id,
  'contract',
  quest.title,
  coalesce(quest.description, ''),
  CASE quest.quest_type
    WHEN 'booster_open' THEN 'booster_open'
    WHEN 'marketplace_sell' THEN 'marketplace_listing'
    WHEN 'collection_target' THEN 'rarity_card'
    WHEN 'daily_login' THEN 'daily_login'
    ELSE 'collection_count'
  END,
  greatest(coalesce(quest.required_count, 1), 1),
  CASE
    WHEN quest.quest_type = 'collection_target' THEN coalesce(quest.rarity_requirement, 'Icon')
    ELSE quest.rarity_requirement
  END,
  greatest(quest.reward_ap, 0),
  quest.created_at
FROM public.quests AS quest
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_objective_progress (
  user_id, objective_id, current_count, status, started_at, completed_at
)
SELECT
  user_quest.user_id,
  user_quest.quest_id,
  least(greatest(coalesce(user_quest.current_count, 0), 0), objective.target_count),
  CASE
    WHEN user_quest.status = 'active'
      AND coalesce(user_quest.current_count, 0) >= objective.target_count THEN 'completed'
    ELSE user_quest.status
  END,
  coalesce(user_quest.started_at, NOW()),
  CASE
    WHEN user_quest.status = 'active'
      AND coalesce(user_quest.current_count, 0) >= objective.target_count THEN coalesce(user_quest.completed_at, NOW())
    ELSE user_quest.completed_at
  END
FROM public.user_quests AS user_quest
JOIN public.objective_definitions AS objective ON objective.id = user_quest.quest_id
WHERE user_quest.user_id IS NOT NULL
ON CONFLICT (user_id, objective_id) DO UPDATE
SET
  current_count = EXCLUDED.current_count,
  status = EXCLUDED.status,
  started_at = EXCLUDED.started_at,
  completed_at = EXCLUDED.completed_at;
