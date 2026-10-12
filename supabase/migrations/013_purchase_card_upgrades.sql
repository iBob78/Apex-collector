CREATE OR REPLACE FUNCTION public.purchase_card_upgrade(p_card_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_card_active BOOLEAN;
  v_balance INTEGER;
  v_total_copies BIGINT;
  v_current_level INTEGER;
  v_next_level INTEGER;
  v_required_copies INTEGER;
  v_price INTEGER;
  v_thresholds INTEGER[] := ARRAY[1, 2, 5, 10, 25, 50, 100, 200, 500, 1000];
  v_prices INTEGER[] := ARRAY[0, 250, 500, 1000, 2000, 3000, 5000, 10000, 20000, 50000];
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Connecte-toi pour améliorer cette carte.';
  END IF;

  SELECT card.is_active
  INTO v_card_active
  FROM public.cards AS card
  WHERE card.card_id::TEXT = p_card_id OR card.id::TEXT = p_card_id
  LIMIT 1;

  IF NOT FOUND OR NOT COALESCE(v_card_active, FALSE) THEN
    RAISE EXCEPTION 'Cette carte est désactivée ou introuvable.';
  END IF;

  SELECT profile.ap
  INTO v_balance
  FROM public.profiles AS profile
  WHERE profile.id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profil joueur introuvable.';
  END IF;

  PERFORM 1
  FROM public.user_cards AS owned_card
  WHERE owned_card.user_id = v_user_id
    AND owned_card.card_id::TEXT = p_card_id
  FOR UPDATE;

  SELECT
    COALESCE(SUM(owned_card.count), 0),
    COALESCE(MAX(owned_card.upgrade_level), 0)
  INTO v_total_copies, v_current_level
  FROM public.user_cards AS owned_card
  WHERE owned_card.user_id = v_user_id
    AND owned_card.card_id::TEXT = p_card_id;

  IF v_total_copies = 0 THEN
    RAISE EXCEPTION 'Tu ne possèdes pas cette carte.';
  END IF;

  v_next_level := v_current_level + 1;
  IF v_next_level > 9 THEN
    RAISE EXCEPTION 'Cette carte a déjà atteint le niveau maximum.';
  END IF;

  v_required_copies := v_thresholds[v_next_level + 1];
  IF v_total_copies < v_required_copies THEN
    RAISE EXCEPTION 'Il te faut % exemplaires pour débloquer le niveau %.', v_required_copies, v_next_level;
  END IF;

  v_price := v_prices[v_next_level + 1];
  IF COALESCE(v_balance, 0) < v_price THEN
    RAISE EXCEPTION 'Solde AP insuffisant : % AP sont nécessaires.', v_price;
  END IF;

  UPDATE public.profiles
  SET ap = COALESCE(ap, 0) - v_price
  WHERE id = v_user_id
  RETURNING ap INTO v_balance;

  UPDATE public.user_cards
  SET upgrade_level = v_next_level
  WHERE user_id = v_user_id
    AND card_id::TEXT = p_card_id;

  RETURN jsonb_build_object(
    'upgrade_level', v_next_level,
    'balance', v_balance
  );
END;
$$;

REVOKE ALL ON FUNCTION public.purchase_card_upgrade(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.purchase_card_upgrade(TEXT) TO authenticated;
