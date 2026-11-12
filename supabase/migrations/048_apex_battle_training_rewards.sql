-- Apex Battle: authoritative training matches and reward settlement.
-- NOT APPLIED TO PRODUCTION. Apply only after owner approves this migration.
-- Requires existing public.cards, user_cards, profiles and user_gift_boosters.
-- Rules: 250 AC for each victory; every tenth victory adds ONE six-card
-- common/uncommon gift booster (50/50), delivered to the existing gift inventory.
-- The client never supplies scores, opponents, card stats, or reward amounts.

CREATE TABLE IF NOT EXISTS public.battle_training_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player_deck JSONB NOT NULL,
  opponent_deck JSONB NOT NULL,
  rounds JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'finished', 'abandoned')),
  winner TEXT CHECK (winner IN ('player1', 'player2', 'tie')),
  awarded_ac INTEGER NOT NULL DEFAULT 0 CHECK (awarded_ac IN (0, 250)),
  awarded_booster_slug TEXT CHECK (awarded_booster_slug IN ('common', 'uncommon')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  CONSTRAINT battle_training_deck_shapes CHECK (
    jsonb_typeof(player_deck) = 'array' AND jsonb_array_length(player_deck) = 10
    AND jsonb_typeof(opponent_deck) = 'array' AND jsonb_array_length(opponent_deck) = 10
    AND jsonb_typeof(rounds) = 'array' AND jsonb_array_length(rounds) <= 10
  ),
  CONSTRAINT battle_training_status_consistency CHECK (
    (status = 'finished' AND winner IS NOT NULL AND finished_at IS NOT NULL
      AND jsonb_array_length(rounds) = 10)
    OR (status <> 'finished' AND winner IS NULL AND finished_at IS NULL
      AND awarded_ac = 0 AND awarded_booster_slug IS NULL)
  )
);
CREATE INDEX IF NOT EXISTS battle_training_wins_idx
  ON public.battle_training_matches (user_id, finished_at)
  WHERE status = 'finished' AND winner = 'player1';

-- Nobody can directly read opponent snapshots or forge match rows/rewards.
ALTER TABLE public.battle_training_matches ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.battle_training_matches FROM PUBLIC, anon, authenticated;

-- The helper is private in practice: no execute grant to API roles.
CREATE OR REPLACE FUNCTION public.battle_training_vehicle_stats(p_card public.cards)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
  v_hp NUMERIC;
  v_torque NUMERIC;
  v_speed NUMERIC;
  v_accel NUMERIC;
  v_raw_weight NUMERIC;
  v_weight NUMERIC;
  v_ip INTEGER;
BEGIN
  IF p_card.card_id IS NULL OR NOT p_card.is_active
    OR COALESCE(BTRIM(p_card.power_hp), '') !~ '^[0-9]+([.,][0-9]+)?$'
    OR COALESCE(BTRIM(p_card.torque_nm), '') !~ '^[0-9]+([.,][0-9]+)?$'
    OR COALESCE(BTRIM(p_card.max_speed_kmh), '') !~ '^[0-9]+([.,][0-9]+)?$'
    OR COALESCE(BTRIM(p_card.acceleration_0_100), '') !~ '^[0-9]+([.,][0-9]+)?$'
    OR COALESCE(BTRIM(p_card.weight_t), '') !~ '^[0-9]+([.,][0-9]+)?$'
  THEN
    RETURN NULL;
  END IF;

  v_hp := REPLACE(BTRIM(p_card.power_hp), ',', '.')::numeric;
  v_torque := REPLACE(BTRIM(p_card.torque_nm), ',', '.')::numeric;
  v_speed := REPLACE(BTRIM(p_card.max_speed_kmh), ',', '.')::numeric;
  v_accel := REPLACE(BTRIM(p_card.acceleration_0_100), ',', '.')::numeric;
  v_raw_weight := REPLACE(BTRIM(p_card.weight_t), ',', '.')::numeric;
  v_weight := CASE
    WHEN v_raw_weight BETWEEN 0.1 AND 5 THEN v_raw_weight * 1000
    WHEN v_raw_weight > 50 AND v_raw_weight <= 5000 THEN v_raw_weight
    ELSE NULL END;

  IF v_hp <= 0 OR v_torque <= 0 OR v_speed < 100 OR v_accel <= 0
    OR v_weight IS NULL THEN
    RETURN NULL;
  END IF;
  v_ip := FLOOR(v_hp / v_weight * 1000)::integer;
  IF v_ip <= 0 THEN RETURN NULL; END IF;

  RETURN jsonb_build_object(
    'power_hp', v_hp,
    'torque_nm', v_torque,
    'max_speed_kmh', v_speed,
    'acceleration_0_100', v_accel,
    'weight_kg', v_weight,
    'ip', v_ip
  );
EXCEPTION WHEN numeric_value_out_of_range OR division_by_zero THEN
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.battle_training_vehicle_stats(public.cards)
  FROM PUBLIC, anon, authenticated;

-- Starts a match only with ten distinct *owned* and active cards.
-- The server chooses the ten bot cards, normalizes and freezes both decks.
-- Bot identities are NOT returned at match creation; the client sees only the
-- current opponent after its statistic has been irrevocably chosen.
-- Every new match abandons the previous unfinished match without rewards.
CREATE OR REPLACE FUNCTION public.start_training_battle(p_card_ids UUID[])
RETURNS JSONB
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_user UUID := (SELECT auth.uid());
  v_card public.cards%ROWTYPE;
  v_bot_card public.cards%ROWTYPE;
  v_card_id UUID;
  v_canonical TEXT;
  v_stats JSONB;
  v_bot_stats JSONB;
  v_player JSONB := '[]'::jsonb;
  v_bot JSONB := '[]'::jsonb;
  v_used TEXT[] := ARRAY[]::text[];
  v_target_ip NUMERIC;
  v_offset INTEGER;
  v_index INTEGER := 0;
  v_match_id UUID;
  v_wins INTEGER;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Connexion requise.'; END IF;
  IF p_card_ids IS NULL OR cardinality(p_card_ids) <> 10 THEN
    RAISE EXCEPTION 'Sélectionne exactement dix voitures.';
  END IF;

  -- Check ownership and duplicate canonical models using the real catalog.
  FOREACH v_card_id IN ARRAY p_card_ids LOOP
    SELECT card.* INTO v_card
    FROM public.cards AS card
    WHERE card.card_id = v_card_id AND card.is_active = TRUE
      AND EXISTS (
        SELECT 1 FROM public.user_cards AS owned
        WHERE owned.user_id = v_user
          AND owned.card_id = card.card_id AND COALESCE(owned.count, 0) > 0
      );
    IF NOT FOUND THEN RAISE EXCEPTION 'Voiture non possédée ou indisponible.'; END IF;
    v_canonical := COALESCE(NULLIF(BTRIM(v_card.variant_of_card_id), ''), v_card.card_id::text);
    IF v_canonical = ANY(v_used) THEN RAISE EXCEPTION 'Deux exemplaires du même modèle.'; END IF;
    v_stats := public.battle_training_vehicle_stats(v_card);
    IF v_stats IS NULL THEN RAISE EXCEPTION 'Statistiques incomplètes pour une des voitures.'; END IF;
    v_player := v_player || jsonb_build_array(jsonb_build_object(
      'cardId', v_card.card_id::text, 'canonicalCardId', v_canonical, 'stats', v_stats
    ));
    v_used := array_append(v_used, v_canonical);
  END LOOP;

  -- The bot's deck is derived in the database, never from client-provided cars.
  FOR v_index IN 0..9 LOOP
    v_target_ip := (v_player->v_index->'stats'->>'ip')::numeric;
    -- Unpredictable within the ten nearest eligible models.
    v_offset := FLOOR(RANDOM() * 10)::integer;
    SELECT card.* INTO v_bot_card
    FROM public.cards AS card
    WHERE card.is_active = TRUE
      AND COALESCE(NULLIF(BTRIM(card.variant_of_card_id), ''), card.card_id::text) <> ALL (v_used)
      AND public.battle_training_vehicle_stats(card) IS NOT NULL
    ORDER BY
      ABS(LN((public.battle_training_vehicle_stats(card)->>'ip')::numeric / v_target_ip)),
      card.card_id
    OFFSET v_offset LIMIT 1;
    IF NOT FOUND THEN RAISE EXCEPTION 'Le catalogue ne contient pas assez de voitures.'; END IF;
    v_canonical := COALESCE(NULLIF(BTRIM(v_bot_card.variant_of_card_id), ''), v_bot_card.card_id::text);
    v_bot_stats := public.battle_training_vehicle_stats(v_bot_card);
    v_bot := v_bot || jsonb_build_array(jsonb_build_object(
      'cardId', v_bot_card.card_id::text, 'canonicalCardId', v_canonical, 'stats', v_bot_stats
    ));
    v_used := array_append(v_used, v_canonical);
  END LOOP;

  -- A fresh training supersedes an unfinished one; none of the old rounds pays.
  UPDATE public.battle_training_matches
  SET status = 'abandoned'
  WHERE user_id = v_user AND status = 'active';

  INSERT INTO public.battle_training_matches (user_id, player_deck, opponent_deck)
  VALUES (v_user, v_player, v_bot)
  RETURNING id INTO v_match_id;

  SELECT COUNT(*)::integer INTO v_wins FROM public.battle_training_matches
  WHERE user_id = v_user AND status = 'finished' AND winner = 'player1';

  -- No opponent IDs/stats are returned before a round is committed.
  RETURN jsonb_build_object(
    'success', true, 'battle_id', v_match_id, 'wins_total', v_wins
  );
END;
$$;
REVOKE ALL ON FUNCTION public.start_training_battle(UUID[])
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.start_training_battle(UUID[]) TO authenticated;

-- Commits ONE round at a time, using the frozen cards and game rules.
-- Even rounds are chosen by the bot using only the bot's current car.
-- At round 10, the entire match, balance update and gift grant commit atomically.
CREATE OR REPLACE FUNCTION public.play_training_battle_round(
  p_battle_id UUID,
  p_stat TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_user UUID := (SELECT auth.uid());
  v_match public.battle_training_matches%ROWTYPE;
  v_count INTEGER;
  v_chooser TEXT;
  v_stat TEXT;
  v_allowed CONSTANT TEXT[] := ARRAY[
    'power_hp', 'torque_nm', 'max_speed_kmh',
    'acceleration_0_100', 'weight_kg', 'ip'
  ];
  v_baseline CONSTANT NUMERIC[] := ARRAY[250, 350, 240, 7, 1300, 200];
  v_used INTEGER;
  v_index INTEGER;
  v_strength NUMERIC;
  v_best NUMERIC := -1;
  v_bot_stats JSONB;
  v_player_stats JSONB;
  v_val1 NUMERIC;
  v_val2 NUMERIC;
  v_winner TEXT;
  v_score1 NUMERIC;
  v_score2 NUMERIC;
  v_round JSONB;
  v_rounds JSONB;
  v_match_winner TEXT := NULL;
  v_awarded INTEGER := 0;
  v_booster TEXT := NULL;
  v_wins INTEGER := 0;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Connexion requise.'; END IF;
  SELECT * INTO v_match
  FROM public.battle_training_matches
  WHERE id = p_battle_id AND user_id = v_user
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Partie introuvable.'; END IF;
  IF v_match.status <> 'active' THEN RAISE EXCEPTION 'Partie déjà terminée ou abandonnée.'; END IF;

  v_count := jsonb_array_length(v_match.rounds);
  IF v_count >= 10 THEN RAISE EXCEPTION 'La bataille est terminée.'; END IF;
  v_chooser := CASE WHEN v_count % 2 = 0 THEN 'player1' ELSE 'player2' END;
  v_player_stats := v_match.player_deck->v_count->'stats';
  v_bot_stats := v_match.opponent_deck->v_count->'stats';

  IF v_chooser = 'player1' THEN
    IF p_stat IS NULL OR NOT (p_stat = ANY(v_allowed)) THEN
      RAISE EXCEPTION 'Caractéristique inconnue.';
    END IF;
    v_stat := p_stat;
  ELSE
    IF p_stat IS NOT NULL THEN RAISE EXCEPTION 'Au tour de l’ordinateur.'; END IF;
    FOR v_index IN 1..array_length(v_allowed, 1) LOOP
      SELECT COUNT(*)::integer INTO v_used
      FROM jsonb_array_elements(v_match.rounds) AS item(value)
      WHERE item.value->>'selectedBy' = 'player2'
        AND item.value->>'stat' = v_allowed[v_index];
      IF v_used >= 2 THEN CONTINUE; END IF;
      v_strength := (v_bot_stats->>v_allowed[v_index])::numeric;
      IF v_allowed[v_index] IN ('weight_kg', 'acceleration_0_100') THEN
        v_strength := v_baseline[v_index] / v_strength;
      ELSE
        v_strength := v_strength / v_baseline[v_index];
      END IF;
      IF v_strength > v_best THEN
        v_best := v_strength;
        v_stat := v_allowed[v_index];
      END IF;
    END LOOP;
  END IF;

  IF v_stat IS NULL THEN RAISE EXCEPTION 'Aucun critère disponible.'; END IF;
  SELECT COUNT(*)::integer INTO v_used
  FROM jsonb_array_elements(v_match.rounds) AS item(value)
  WHERE item.value->>'selectedBy' = v_chooser AND item.value->>'stat' = v_stat;
  IF v_used >= 2 THEN RAISE EXCEPTION 'Limite de deux choix atteinte.'; END IF;

  v_val1 := (v_player_stats->>v_stat)::numeric;
  v_val2 := (v_bot_stats->>v_stat)::numeric;
  v_winner := CASE
    WHEN v_val1 = v_val2 THEN 'tie'
    WHEN v_stat IN ('weight_kg', 'acceleration_0_100')
      THEN CASE WHEN v_val1 < v_val2 THEN 'player1' ELSE 'player2' END
    ELSE CASE WHEN v_val1 > v_val2 THEN 'player1' ELSE 'player2' END
  END;

  v_round := jsonb_build_object(
    'roundNumber', v_count + 1,
    'selectedBy', v_chooser,
    'stat', v_stat,
    'player1CardId', v_match.player_deck->v_count->>'cardId',
    'player2CardId', v_match.opponent_deck->v_count->>'cardId',
    'player1Value', v_val1, 'player2Value', v_val2,
    'winner', v_winner,
    'player1Points', CASE WHEN v_winner = 'tie' THEN 0.5
      WHEN v_winner = 'player1' THEN 1 ELSE 0 END,
    'player2Points', CASE WHEN v_winner = 'tie' THEN 0.5
      WHEN v_winner = 'player2' THEN 1 ELSE 0 END
  );
  v_rounds := v_match.rounds || jsonb_build_array(v_round);
  SELECT COALESCE(SUM((item.value->>'player1Points')::numeric), 0)
  INTO v_score1
  FROM jsonb_array_elements(v_rounds) AS item(value);
  v_score2 := v_count + 1 - v_score1;

  IF v_count = 9 THEN
    v_match_winner := CASE WHEN v_score1 > v_score2 THEN 'player1'
      WHEN v_score1 < v_score2 THEN 'player2' ELSE 'tie' END;

    IF v_match_winner = 'player1' THEN
      -- Serializes simultaneous match completions and booster milestones.
      PERFORM 1 FROM public.profiles WHERE id = v_user FOR UPDATE;
      IF NOT FOUND THEN RAISE EXCEPTION 'Profil introuvable.'; END IF;

      SELECT COUNT(*)::integer INTO v_wins
      FROM public.battle_training_matches
      WHERE user_id = v_user AND status = 'finished' AND winner = 'player1';
      v_wins := v_wins + 1;

      UPDATE public.profiles SET ap = COALESCE(ap, 0) + 250 WHERE id = v_user;
      v_awarded := 250;

      IF v_wins % 10 = 0 THEN
        v_booster := CASE WHEN RANDOM() < 0.5 THEN 'common' ELSE 'uncommon' END;
        INSERT INTO public.user_gift_boosters
          (user_id, gift_key, pack_slug, card_count)
        VALUES (
          v_user, 'battle_training_10_' || (v_wins / 10)::text,
          v_booster, 6
        )
        ON CONFLICT (user_id, gift_key) DO NOTHING;
      END IF;
    END IF;

    UPDATE public.battle_training_matches
    SET rounds = v_rounds, status = 'finished', winner = v_match_winner,
        finished_at = NOW(), awarded_ac = v_awarded,
        awarded_booster_slug = v_booster
    WHERE id = p_battle_id AND user_id = v_user;
  ELSE
    UPDATE public.battle_training_matches
    SET rounds = v_rounds
    WHERE id = p_battle_id AND user_id = v_user;
  END IF;

  IF v_count = 9 AND v_match_winner <> 'player1' THEN
    SELECT COUNT(*)::integer INTO v_wins
    FROM public.battle_training_matches
    WHERE user_id = v_user AND status = 'finished' AND winner = 'player1';
  END IF;

  RETURN jsonb_build_object(
    'success', true, 'round', v_round,
    'score', jsonb_build_object('player1', v_score1, 'player2', v_score2,
      'finished', v_count = 9, 'winner', v_match_winner),
    'reward', jsonb_build_object(
      'ac', v_awarded, 'booster_slug', v_booster, 'wins_total', v_wins,
      'wins_to_next', CASE WHEN v_count = 9 THEN 10 - (v_wins % 10) ELSE NULL END
    )
  );
END;
$$;
REVOKE ALL ON FUNCTION public.play_training_battle_round(UUID, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.play_training_battle_round(UUID, TEXT) TO authenticated;
