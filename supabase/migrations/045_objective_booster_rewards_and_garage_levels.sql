-- 045: Boosters et AC comme recompenses, premiere exposition et paliers d'ecurie.
-- Ajouter ce fichier dans une PR. Ne pas appliquer en production sans validation.

ALTER TABLE public.objective_definitions
  DROP CONSTRAINT IF EXISTS objective_definitions_objective_type_check;
ALTER TABLE public.objective_definitions
  ADD CONSTRAINT objective_definitions_objective_type_check
  CHECK (objective_type IN (
    'booster_open', 'collection_count', 'rarity_card', 'marketplace_listing',
    'circuit_collection', 'daily_login', 'collection_requirement', 'showroom_first'
  ));

ALTER TABLE public.objective_definitions
  ADD COLUMN IF NOT EXISTS reward_mode TEXT NOT NULL DEFAULT 'ac';
ALTER TABLE public.objective_definitions
  ADD COLUMN IF NOT EXISTS reward_booster_slug TEXT NOT NULL DEFAULT 'random';
ALTER TABLE public.objective_definitions
  ADD CONSTRAINT objective_definitions_reward_mode_check
    CHECK (reward_mode IN ('ac', 'booster', 'both', 'either'));
ALTER TABLE public.objective_definitions
  ADD CONSTRAINT objective_definitions_reward_booster_slug_check
    CHECK (reward_booster_slug IN (
      'random', 'common', 'uncommon', 'rare', 'ultrarare',
      'prototype', 'mythic', 'legend', 'carbon'
    ));
ALTER TABLE public.objective_definitions
  ADD CONSTRAINT objective_definitions_reward_combo_check
    CHECK (
      (reward_mode <> 'booster' OR reward_ap = 0)
      AND (reward_mode NOT IN ('both', 'either') OR reward_ap > 0)
    );

-- La sauvegarde du showroom est controlee cote serveur : ce trigger
-- ne fait que valider une progression existante, sans accord de recompense.
CREATE OR REPLACE FUNCTION public.complete_first_showroom_objective()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  UPDATE public.user_objective_progress AS progress
  SET current_count = 1,
      status = 'completed',
      completed_at = COALESCE(progress.completed_at, NOW())
  FROM public.objective_definitions AS objective
  WHERE progress.objective_id = objective.id
    AND progress.user_id = NEW.user_id
    AND progress.status = 'active'
    AND objective.objective_type = 'showroom_first'
    AND objective.is_active;
  RETURN NEW;
END;
$function$;
REVOKE ALL ON FUNCTION public.complete_first_showroom_objective() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS on_showroom_first_exhibition ON public.user_garage_showcase;
CREATE TRIGGER on_showroom_first_exhibition
AFTER INSERT ON public.user_garage_showcase
FOR EACH ROW EXECUTE FUNCTION public.complete_first_showroom_objective();

-- Recompenses de niveau : un cadeau par palier (niveau 2 a N),
-- deterministe via gift_key unique ; la rarete du pack est tiree une seule fois.
CREATE OR REPLACE FUNCTION public.grant_garage_level_boosters(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  v_unique INTEGER;
  v_current_level INTEGER;
  v_level INTEGER;
  v_slug TEXT;
  v_packs CONSTANT TEXT[] := ARRAY[
    'common', 'uncommon', 'rare', 'ultrarare',
    'prototype', 'mythic', 'legend', 'carbon'
  ];
BEGIN
  IF p_user_id IS NULL THEN RETURN; END IF;
  SELECT COUNT(DISTINCT owned.card_id)::INTEGER
  INTO v_unique
  FROM public.user_cards AS owned
  WHERE owned.user_id = p_user_id AND COALESCE(owned.count, 0) > 0;
  v_current_level := 1 + v_unique / 10;

  FOR v_level IN 2..v_current_level LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.user_gift_boosters
      WHERE user_id = p_user_id AND gift_key = 'garage_level_' || v_level
    ) THEN
      v_slug := v_packs[1 + FLOOR(random() * array_length(v_packs, 1))::INTEGER];
      INSERT INTO public.user_gift_boosters
        (user_id, gift_key, pack_slug, card_count)
      VALUES (
        p_user_id, 'garage_level_' || v_level, v_slug,
        CASE WHEN v_slug IN ('mythic', 'carbon') THEN 8 ELSE 6 END
      )
      ON CONFLICT (user_id, gift_key) DO NOTHING;
    END IF;
  END LOOP;
END;
$function$;
REVOKE ALL ON FUNCTION public.grant_garage_level_boosters(UUID) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.grant_garage_level_boosters_on_inventory_change()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  PERFORM public.grant_garage_level_boosters(NEW.user_id);
  RETURN NEW;
END;
$function$;
REVOKE ALL ON FUNCTION public.grant_garage_level_boosters_on_inventory_change() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS on_inventory_garage_level_boosters ON public.user_cards;
CREATE TRIGGER on_inventory_garage_level_boosters
AFTER INSERT OR UPDATE OF count, card_id, user_id ON public.user_cards
FOR EACH ROW EXECUTE FUNCTION public.grant_garage_level_boosters_on_inventory_change();

-- Les paliers deja atteints lors de l'activation sont accordes une seule fois.
SELECT public.grant_garage_level_boosters(profile.id) FROM public.profiles AS profile;

-- Les quatre nouveaux succes : motorisation du catalogue stockee
-- en codes ES (essence), GO (diesel), EL (electrique).
INSERT INTO public.objective_definitions
  (category, title, description, objective_type, target_count, reward_ap, is_active)
SELECT 'achievement', 'Première carte exposée',
       'Expose une carte de ta collection dans ton showroom personnel.',
       'showroom_first', 1, 1500, TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM public.objective_definitions
  WHERE category = 'achievement' AND title = 'Première carte exposée'
);

INSERT INTO public.objective_definitions
  (category, title, description, objective_type, target_count, reward_ap,
   requirements, requirement_operator, is_active)
SELECT
  'achievement', seed.title, seed.description, 'collection_requirement', 1,
  seed.reward, jsonb_build_array(jsonb_build_object(
    'category','vehicle','card_id','','item_label','','make','','model','',
    'year','','rarity','','country','','type','','fuel_type',seed.fuel,
    'transmission','','count_mode','unique','target_count',1
  )), 'all', TRUE
FROM (VALUES
  ('Posséder une carte électrique', 'Possède au moins un véhicule électrique.', 'EL', 1500),
  ('Posséder une carte diesel', 'Possède au moins un véhicule diesel.', 'GO', 250),
  ('Posséder une carte essence', 'Possède au moins un véhicule essence.', 'ES', 2500)
) AS seed(title, description, fuel, reward)
WHERE NOT EXISTS (
  SELECT 1 FROM public.objective_definitions
  WHERE category = 'achievement' AND title = seed.title
);

-- Validation de l'exposition deja enregistree avant l'ajout du succes.
UPDATE public.user_objective_progress AS progress
SET current_count = 1, status = 'completed',
    completed_at = COALESCE(progress.completed_at, NOW())
FROM public.objective_definitions AS objective
WHERE objective.id = progress.objective_id
  AND objective.objective_type = 'showroom_first'
  AND progress.status = 'active'
  AND EXISTS (
    SELECT 1 FROM public.user_garage_showcase AS showcase
    WHERE showcase.user_id = progress.user_id
  );

-- Reclamation atomique et anti-double-claim (verrouillage de la progression).
-- "either" donne au hasard soit les AC, soit le booster ; "both" donne les deux.
CREATE OR REPLACE FUNCTION public.claim_objective_reward(p_progress_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  v_user_id UUID := (SELECT auth.uid());
  v_reward INTEGER;
  v_mode TEXT;
  v_configured_slug TEXT;
  v_objective_id UUID;
  v_award_ac BOOLEAN;
  v_award_booster BOOLEAN;
  v_granted_ac INTEGER := 0;
  v_slug TEXT := NULL;
  v_packs CONSTANT TEXT[] := ARRAY[
    'common', 'uncommon', 'rare', 'ultrarare',
    'prototype', 'mythic', 'legend', 'carbon'
  ];
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT objective.reward_ap, objective.reward_mode,
         objective.reward_booster_slug, objective.id
  INTO v_reward, v_mode, v_configured_slug, v_objective_id
  FROM public.user_objective_progress AS progress
  JOIN public.objective_definitions AS objective ON objective.id = progress.objective_id
  WHERE progress.id = p_progress_id
    AND progress.user_id = v_user_id
    AND progress.status = 'completed'
  FOR UPDATE OF progress;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Récompense non disponible.');
  END IF;

  IF v_mode = 'either' THEN
    v_award_booster := random() < 0.5;
    v_award_ac := NOT v_award_booster;
  ELSE
    v_award_ac := v_mode IN ('ac', 'both');
    v_award_booster := v_mode IN ('booster', 'both');
  END IF;

  IF v_award_ac AND v_reward > 0 THEN
    UPDATE public.profiles
    SET ap = COALESCE(ap, 0) + v_reward
    WHERE id = v_user_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Player profile not found'; END IF;
    v_granted_ac := v_reward;
  END IF;

  IF v_award_booster THEN
    v_slug := CASE WHEN v_configured_slug = 'random'
      THEN v_packs[1 + FLOOR(random() * array_length(v_packs, 1))::INTEGER]
      ELSE v_configured_slug END;
    INSERT INTO public.user_gift_boosters (user_id, gift_key, pack_slug, card_count)
    VALUES (
      v_user_id,
      'objective_' || REPLACE(v_objective_id::TEXT, '-', ''),
      v_slug,
      CASE WHEN v_slug IN ('mythic', 'carbon') THEN 8 ELSE 6 END
    );
  END IF;

  UPDATE public.user_objective_progress
  SET status = 'claimed'
  WHERE id = p_progress_id AND user_id = v_user_id AND status = 'completed';

  RETURN jsonb_build_object(
    'success', true, 'reward', v_granted_ac, 'booster_slug', v_slug
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.claim_objective_reward(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_objective_reward(UUID) TO authenticated;
