-- Apex Battle V1 pilot palmares.
-- Prepared for review. Do not apply to production without owner approval.
-- Existing authoritative source: 048_apex_battle_training_rewards.sql.
-- No history backfill: only finished, server-recorded training matches count.
-- IMPORTANT: no direct SELECT grants on battle_training_matches.

-- Lookup: owner receives full summary + private last 20 matches.
-- Another logged-in player sees aggregate summary ONLY when showroom_public=true.
-- Anonymous users and private showrooms are never disclosed.
CREATE OR REPLACE FUNCTION public.get_battle_pilot_palmares(p_username TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_requester UUID := (SELECT auth.uid());
  v_target UUID;
  v_target_public BOOLEAN;
  v_owner BOOLEAN;
  v_total INTEGER := 0;
  v_wins INTEGER := 0;
  v_losses INTEGER := 0;
  v_draws INTEGER := 0;
  v_awarded_ac INTEGER := 0;
  v_awarded_boosters INTEGER := 0;
  v_best_score NUMERIC := 0;
  v_perfect_wins INTEGER := 0;
  v_streak INTEGER := 0;
  v_best_streak INTEGER := 0;
  v_current_streak INTEGER := 0;
  v_match RECORD;
  v_top_winner JSONB;
  v_most_used JSONB;
  v_recent JSONB := '[]'::jsonb;
  v_payload JSONB;
BEGIN
  IF v_requester IS NULL THEN
    RAISE EXCEPTION 'Connexion requise.';
  END IF;

  IF p_username IS NULL THEN
    v_target := v_requester;
    SELECT COALESCE(showroom_public, FALSE) INTO v_target_public
    FROM public.profiles WHERE id = v_target;
  ELSE
    SELECT id, COALESCE(showroom_public, FALSE)
    INTO v_target, v_target_public
    FROM public.profiles
    WHERE LOWER(username) = LOWER(BTRIM(p_username))
    LIMIT 1;
  END IF;

  IF v_target IS NULL THEN RETURN '{"available":false}'::jsonb; END IF;
  v_owner := v_target = v_requester;

  IF NOT v_owner AND NOT COALESCE(v_target_public, FALSE) THEN
    RETURN '{"available":false}'::jsonb;
  END IF;

  SELECT COUNT(*)::int,
    COUNT(*) FILTER (WHERE winner = 'player1')::int,
    COUNT(*) FILTER (WHERE winner = 'player2')::int,
    COUNT(*) FILTER (WHERE winner = 'tie')::int,
    COALESCE(SUM(awarded_ac), 0)::int,
    COUNT(*) FILTER (WHERE awarded_booster_slug IS NOT NULL)::int
  INTO v_total, v_wins, v_losses, v_draws, v_awarded_ac, v_awarded_boosters
  FROM public.battle_training_matches
  WHERE user_id = v_target AND status = 'finished';

  -- Score and perfect 10-0 are calculated from committed rounds, never the client.
  SELECT COALESCE(MAX(round_scores.player_points), 0),
    COUNT(*) FILTER (WHERE round_scores.player_points = 10)::int
  INTO v_best_score, v_perfect_wins
  FROM public.battle_training_matches AS m
  CROSS JOIN LATERAL (
    SELECT COALESCE(SUM((r.value->>'player1Points')::numeric), 0) AS player_points
    FROM jsonb_array_elements(m.rounds) AS r(value)
  ) AS round_scores
  WHERE m.user_id = v_target AND m.status = 'finished';

  -- Consecutive wins ordered from the first to latest finished match.
  -- A loss OR draw ends the streak.
  FOR v_match IN
    SELECT winner FROM public.battle_training_matches
    WHERE user_id = v_target AND status = 'finished'
    ORDER BY finished_at, id
  LOOP
    IF v_match.winner = 'player1' THEN
      v_streak := v_streak + 1;
      v_best_streak := GREATEST(v_best_streak, v_streak);
    ELSE
      v_streak := 0;
    END IF;
  END LOOP;
  v_current_streak := v_streak;

  -- A car's "rounds won" comes from individual completed rounds; "used" from
  -- match decks. Both are historical even if the car is sold afterward.
  WITH usage_counts AS (
    SELECT car.value->>'cardId' AS card_id, COUNT(*)::int AS played
    FROM public.battle_training_matches AS m
    CROSS JOIN LATERAL jsonb_array_elements(m.player_deck) AS car(value)
    WHERE m.user_id = v_target AND m.status = 'finished'
    GROUP BY car.value->>'cardId'
  ),
  round_wins AS (
    SELECT r.value->>'player1CardId' AS card_id, COUNT(*)::int AS wins
    FROM public.battle_training_matches AS m
    CROSS JOIN LATERAL jsonb_array_elements(m.rounds) AS r(value)
    WHERE m.user_id = v_target AND m.status = 'finished'
      AND r.value->>'winner' = 'player1'
    GROUP BY r.value->>'player1CardId'
  ),
  car_stats AS (
    SELECT u.card_id, u.played, COALESCE(w.wins, 0)::int AS wins,
      c.make, c.model, c.year, c.image_url
    FROM usage_counts AS u
    LEFT JOIN round_wins AS w ON w.card_id = u.card_id
    LEFT JOIN public.cards AS c ON c.card_id::text = u.card_id
  )
  SELECT
    (SELECT jsonb_build_object('cardId', cs.card_id,
        'make', COALESCE(cs.make, 'Voiture'),
        'model', COALESCE(cs.model, 'indisponible'),
        'year', cs.year, 'imageUrl', cs.image_url,
        'roundsWon', cs.wins, 'timesUsed', cs.played)
      FROM car_stats AS cs
      ORDER BY cs.wins DESC, cs.played DESC, cs.card_id LIMIT 1),
    (SELECT jsonb_build_object('cardId', cs.card_id,
        'make', COALESCE(cs.make, 'Voiture'),
        'model', COALESCE(cs.model, 'indisponible'),
        'year', cs.year, 'imageUrl', cs.image_url,
        'roundsWon', cs.wins, 'timesUsed', cs.played)
      FROM car_stats AS cs
      ORDER BY cs.played DESC, cs.wins DESC, cs.card_id LIMIT 1)
  INTO v_top_winner, v_most_used;

  -- Summary is safe for a public showroom: no email, private inventory, AC
  -- balance, opponent deck or match history is exposed.
  v_payload := jsonb_build_object(
    'available', TRUE,
    'isOwner', v_owner,
    'stats', jsonb_build_object(
      'battles', v_total,
      'wins', v_wins,
      'losses', v_losses,
      'draws', v_draws,
      'winRate', CASE WHEN v_total > 0
        THEN ROUND(v_wins::numeric * 100 / v_total, 1) ELSE 0 END,
      'bestStreak', v_best_streak,
      'currentStreak', v_current_streak,
      'bestScore', v_best_score,
      'perfectWins', v_perfect_wins,
      'earnedAc', CASE WHEN v_owner THEN v_awarded_ac ELSE NULL END,
      'boostersEarned', v_awarded_boosters
    ),
    'topWinner', v_top_winner,
    'mostUsed', v_most_used
  );

  IF v_owner THEN
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', rec.id,
        'finishedAt', rec.finished_at,
        'winner', rec.winner,
        'playerPoints', rec.player_points,
        'opponentPoints', 10 - rec.player_points,
        'rounds', rec.rounds
      ) ORDER BY rec.finished_at DESC, rec.id DESC
    ), '[]'::jsonb)
    INTO v_recent
    FROM (
      SELECT m.id, m.finished_at, m.winner, m.rounds,
        (SELECT COALESCE(SUM((r.value->>'player1Points')::numeric), 0)
          FROM jsonb_array_elements(m.rounds) AS r(value)) AS player_points
      FROM public.battle_training_matches AS m
      WHERE m.user_id = v_target AND m.status = 'finished'
      ORDER BY m.finished_at DESC, m.id DESC LIMIT 20
    ) AS rec;
    v_payload := v_payload || jsonb_build_object('history', v_recent);
  END IF;

  RETURN v_payload;
END;
$$;

REVOKE ALL ON FUNCTION public.get_battle_pilot_palmares(TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_battle_pilot_palmares(TEXT) TO authenticated;

COMMENT ON FUNCTION public.get_battle_pilot_palmares(TEXT) IS
  'Aggregated Apex Battle training palmares; owner gets private last 20 matches; public showroom visitors only see summary when showroom is public.';
