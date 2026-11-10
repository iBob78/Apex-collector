-- Extend the transactional Market (SQL 044) without losing existing vehicle listings.
-- Deploy this migration BEFORE the corresponding frontend code. Never run it twice manually.
ALTER TABLE public.marketplace_listings
  ADD COLUMN category TEXT NOT NULL DEFAULT 'vehicle'
    CHECK (category IN ('vehicle', 'circuit', 'driver')),
  ADD COLUMN circuit_id UUID REFERENCES public.circuits(id),
  ADD COLUMN driver_id UUID REFERENCES public.drivers(driver_id);

ALTER TABLE public.marketplace_listings
  ALTER COLUMN card_id DROP NOT NULL;

ALTER TABLE public.marketplace_listings
  ADD CONSTRAINT marketplace_listing_one_card_category CHECK (
    (category = 'vehicle' AND card_id IS NOT NULL AND circuit_id IS NULL AND driver_id IS NULL)
    OR (category = 'circuit' AND card_id IS NULL AND circuit_id IS NOT NULL AND driver_id IS NULL)
    OR (category = 'driver' AND card_id IS NULL AND circuit_id IS NULL AND driver_id IS NOT NULL)
  );

CREATE INDEX marketplace_listings_seller_category_active_idx
  ON public.marketplace_listings (seller_id, category, status)
  WHERE status = 'active';

-- A public listing reveals only catalog data and the seller's public pseudonym.
CREATE OR REPLACE FUNCTION public.get_marketplace_listings()
RETURNS SETOF JSONB
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'id', listing.id,
    'seller_id', listing.seller_id,
    'category', listing.category,
    'card_id', COALESCE(listing.card_id, listing.circuit_id, listing.driver_id),
    'price', listing.price,
    'status', listing.status,
    'created_at', listing.created_at,
    'card', CASE listing.category
      WHEN 'vehicle' THEN to_jsonb(vehicle)
      WHEN 'circuit' THEN to_jsonb(circuit) - 'user_id' - 'count'
      WHEN 'driver' THEN to_jsonb(driver)
    END || jsonb_build_object('category', listing.category),
    'seller', jsonb_build_object('username', seller.username)
  )
  FROM public.marketplace_listings AS listing
  LEFT JOIN public.cards AS vehicle
    ON listing.category = 'vehicle' AND vehicle.card_id = listing.card_id
  LEFT JOIN public.circuits AS circuit
    ON listing.category = 'circuit' AND circuit.id = listing.circuit_id
  LEFT JOIN public.drivers AS driver
    ON listing.category = 'driver' AND driver.driver_id = listing.driver_id
  JOIN public.profiles AS seller ON seller.id = listing.seller_id
  WHERE auth.uid() IS NOT NULL
    AND listing.status = 'active'
    AND CASE listing.category
      WHEN 'vehicle' THEN vehicle.is_active = TRUE
      WHEN 'circuit' THEN circuit.id IS NOT NULL
      WHEN 'driver' THEN driver.is_active = TRUE
      ELSE FALSE
    END
  ORDER BY listing.created_at DESC;
$$;

-- Return the three categories for the authenticated seller, including sale history.
CREATE FUNCTION public.get_my_marketplace_listings()
RETURNS SETOF JSONB
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'id', listing.id,
    'seller_id', listing.seller_id,
    'category', listing.category,
    'card_id', COALESCE(listing.card_id, listing.circuit_id, listing.driver_id),
    'price', listing.price,
    'status', listing.status,
    'created_at', listing.created_at,
    'sold_at', listing.sold_at,
    'card', CASE listing.category
      WHEN 'vehicle' THEN to_jsonb(vehicle)
      WHEN 'circuit' THEN to_jsonb(circuit) - 'user_id' - 'count'
      WHEN 'driver' THEN to_jsonb(driver)
    END || jsonb_build_object('category', listing.category),
    'seller', jsonb_build_object('username', seller.username)
  )
  FROM public.marketplace_listings AS listing
  LEFT JOIN public.cards AS vehicle
    ON listing.category = 'vehicle' AND vehicle.card_id = listing.card_id
  LEFT JOIN public.circuits AS circuit
    ON listing.category = 'circuit' AND circuit.id = listing.circuit_id
  LEFT JOIN public.drivers AS driver
    ON listing.category = 'driver' AND driver.driver_id = listing.driver_id
  JOIN public.profiles AS seller ON seller.id = listing.seller_id
  WHERE auth.uid() IS NOT NULL
    AND listing.seller_id = auth.uid()
  ORDER BY listing.created_at DESC;
$$;

-- Replace the old two-argument signature to avoid PostgREST RPC overload ambiguity.
-- The default category preserves compatibility with already-deployed vehicle clients.
DROP FUNCTION public.create_market_listing(UUID, INTEGER);
CREATE FUNCTION public.create_market_listing(
  p_card_id UUID,
  p_price INTEGER,
  p_category TEXT DEFAULT 'vehicle'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_seller_id UUID := auth.uid();
  v_available BIGINT;
  v_reserved BIGINT;
  v_listing_id UUID;
BEGIN
  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'Connexion requise.';
  END IF;
  IF p_card_id IS NULL OR p_price IS NULL OR p_price <= 0
     OR p_category IS NULL OR p_category NOT IN ('vehicle', 'circuit', 'driver') THEN
    RAISE EXCEPTION 'Prix ou carte invalide.';
  END IF;

  -- Match the lock order used by SQL 044: profile lock before inventory checks.
  PERFORM 1 FROM public.profiles WHERE id = v_seller_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profil vendeur introuvable.';
  END IF;

  IF p_category = 'vehicle' THEN
    IF NOT EXISTS (SELECT 1 FROM public.cards WHERE card_id = p_card_id AND is_active = TRUE) THEN
      RAISE EXCEPTION 'Carte introuvable ou désactivée.';
    END IF;
    SELECT COALESCE(SUM(GREATEST(COALESCE(count, 0), 0)), 0) INTO v_available
      FROM public.user_cards WHERE user_id = v_seller_id AND card_id = p_card_id;
  ELSIF p_category = 'circuit' THEN
    -- Circuits are identified by circuits.id in user_circuits, not circuits.circuit_id.
    IF NOT EXISTS (SELECT 1 FROM public.circuits WHERE id = p_card_id) THEN
      RAISE EXCEPTION 'Circuit introuvable.';
    END IF;
    SELECT COALESCE(SUM(GREATEST(COALESCE(count, 0), 0)), 0) INTO v_available
      FROM public.user_circuits WHERE user_id = v_seller_id AND circuit_id = p_card_id;
  ELSE
    IF NOT EXISTS (SELECT 1 FROM public.drivers WHERE driver_id = p_card_id AND is_active = TRUE) THEN
      RAISE EXCEPTION 'Pilote introuvable ou désactivé.';
    END IF;
    SELECT COALESCE(SUM(GREATEST(COALESCE(count, 0), 0)), 0) INTO v_available
      FROM public.user_drivers WHERE user_id = v_seller_id AND driver_id = p_card_id;
  END IF;

  SELECT COUNT(*) INTO v_reserved
  FROM public.marketplace_listings
  WHERE seller_id = v_seller_id AND category = p_category
    AND COALESCE(card_id, circuit_id, driver_id) = p_card_id AND status = 'active';

  IF v_available <= v_reserved THEN
    RAISE EXCEPTION 'Aucun exemplaire disponible pour la vente.';
  END IF;

  INSERT INTO public.marketplace_listings (seller_id, category, card_id, circuit_id, driver_id, price)
  VALUES (
    v_seller_id, p_category,
    CASE WHEN p_category = 'vehicle' THEN p_card_id ELSE NULL END,
    CASE WHEN p_category = 'circuit' THEN p_card_id ELSE NULL END,
    CASE WHEN p_category = 'driver' THEN p_card_id ELSE NULL END,
    p_price
  ) RETURNING id INTO v_listing_id;

  RETURN jsonb_build_object('success', TRUE, 'listing_id', v_listing_id);
END;
$$;

-- Cancellation still works without changes: listings share the same status/id model.
CREATE OR REPLACE FUNCTION public.buy_market_listing(p_listing_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_buyer_id UUID := auth.uid();
  v_listing public.marketplace_listings%ROWTYPE;
  v_buyer_balance INTEGER;
  v_seller_balance INTEGER;
  v_seller_inventory_id UUID;
  v_seller_count INTEGER;
  v_buyer_inventory_id UUID;
  v_new_balance INTEGER;
  v_card_rarity TEXT;
  v_card_id UUID;
BEGIN
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Connexion requise.';
  END IF;

  -- Exactly one winner for the listing, even under concurrent purchases.
  SELECT * INTO v_listing FROM public.marketplace_listings
    WHERE id = p_listing_id FOR UPDATE;

  IF NOT FOUND OR v_listing.status <> 'active' THEN
    RAISE EXCEPTION 'Annonce non disponible.';
  END IF;
  IF v_listing.seller_id = v_buyer_id THEN
    RAISE EXCEPTION 'Vous ne pouvez pas acheter votre propre carte.';
  END IF;

  v_card_id := COALESCE(v_listing.card_id, v_listing.circuit_id, v_listing.driver_id);
  IF v_listing.category = 'vehicle' THEN
    SELECT rarity INTO v_card_rarity FROM public.cards
      WHERE card_id = v_card_id AND is_active = TRUE;
  ELSIF v_listing.category = 'circuit' THEN
    SELECT rarity INTO v_card_rarity FROM public.circuits WHERE id = v_card_id;
  ELSIF v_listing.category = 'driver' THEN
    SELECT rarity INTO v_card_rarity FROM public.drivers
      WHERE driver_id = v_card_id AND is_active = TRUE;
  ELSE
    RAISE EXCEPTION 'Catégorie invalide.';
  END IF;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Carte introuvable ou désactivée.';
  END IF;

  -- Lock accounts in a consistent order for opposite-direction trades.
  PERFORM 1 FROM public.profiles
    WHERE id IN (v_buyer_id, v_listing.seller_id)
    ORDER BY id FOR UPDATE;

  SELECT ap INTO v_buyer_balance FROM public.profiles WHERE id = v_buyer_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profil acheteur introuvable.'; END IF;
  SELECT ap INTO v_seller_balance FROM public.profiles WHERE id = v_listing.seller_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profil vendeur introuvable.'; END IF;
  IF COALESCE(v_buyer_balance, 0) < v_listing.price THEN
    RAISE EXCEPTION 'Solde AC insuffisant.';
  END IF;
  IF COALESCE(v_seller_balance, 0)::BIGINT + v_listing.price > 2147483647 THEN
    RAISE EXCEPTION 'Plafond de solde vendeur atteint.';
  END IF;

  -- Transfer exactly one copy from the matching inventory.
  IF v_listing.category = 'vehicle' THEN
    PERFORM 1 FROM public.user_cards
      WHERE user_id IN (v_listing.seller_id, v_buyer_id) AND card_id = v_card_id
      ORDER BY user_id, id FOR UPDATE;
    SELECT id, count INTO v_seller_inventory_id, v_seller_count FROM public.user_cards
      WHERE user_id = v_listing.seller_id AND card_id = v_card_id AND count > 0
      ORDER BY id LIMIT 1;
    IF NOT FOUND THEN RAISE EXCEPTION 'Le vendeur ne possède plus cette carte.'; END IF;
    SELECT id INTO v_buyer_inventory_id FROM public.user_cards
      WHERE user_id = v_buyer_id AND card_id = v_card_id ORDER BY id LIMIT 1;
    IF v_seller_count > 1 THEN
      UPDATE public.user_cards SET count = v_seller_count - 1 WHERE id = v_seller_inventory_id;
    ELSE
      DELETE FROM public.user_cards WHERE id = v_seller_inventory_id;
    END IF;
    IF v_buyer_inventory_id IS NOT NULL THEN
      UPDATE public.user_cards SET count = COALESCE(count, 0) + 1 WHERE id = v_buyer_inventory_id;
    ELSE
      INSERT INTO public.user_cards (user_id, card_id, count, source)
        VALUES (v_buyer_id, v_card_id, 1, 'marketplace');
    END IF;

  ELSIF v_listing.category = 'circuit' THEN
    PERFORM 1 FROM public.user_circuits
      WHERE user_id IN (v_listing.seller_id, v_buyer_id) AND circuit_id = v_card_id
      ORDER BY user_id, id FOR UPDATE;
    SELECT id, count INTO v_seller_inventory_id, v_seller_count FROM public.user_circuits
      WHERE user_id = v_listing.seller_id AND circuit_id = v_card_id AND count > 0
      ORDER BY id LIMIT 1;
    IF NOT FOUND THEN RAISE EXCEPTION 'Le vendeur ne possède plus ce circuit.'; END IF;
    SELECT id INTO v_buyer_inventory_id FROM public.user_circuits
      WHERE user_id = v_buyer_id AND circuit_id = v_card_id ORDER BY id LIMIT 1;
    IF v_seller_count > 1 THEN
      UPDATE public.user_circuits SET count = v_seller_count - 1 WHERE id = v_seller_inventory_id;
    ELSE
      DELETE FROM public.user_circuits WHERE id = v_seller_inventory_id;
    END IF;
    IF v_buyer_inventory_id IS NOT NULL THEN
      UPDATE public.user_circuits SET count = COALESCE(count, 0) + 1 WHERE id = v_buyer_inventory_id;
    ELSE
      INSERT INTO public.user_circuits (user_id, circuit_id, count)
        VALUES (v_buyer_id, v_card_id, 1);
    END IF;

  ELSE
    PERFORM 1 FROM public.user_drivers
      WHERE user_id IN (v_listing.seller_id, v_buyer_id) AND driver_id = v_card_id
      ORDER BY user_id, id FOR UPDATE;
    SELECT id, count INTO v_seller_inventory_id, v_seller_count FROM public.user_drivers
      WHERE user_id = v_listing.seller_id AND driver_id = v_card_id AND count > 0
      ORDER BY id LIMIT 1;
    IF NOT FOUND THEN RAISE EXCEPTION 'Le vendeur ne possède plus ce pilote.'; END IF;
    SELECT id INTO v_buyer_inventory_id FROM public.user_drivers
      WHERE user_id = v_buyer_id AND driver_id = v_card_id ORDER BY id LIMIT 1;
    IF v_seller_count > 1 THEN
      UPDATE public.user_drivers SET count = v_seller_count - 1 WHERE id = v_seller_inventory_id;
    ELSE
      DELETE FROM public.user_drivers WHERE id = v_seller_inventory_id;
    END IF;
    IF v_buyer_inventory_id IS NOT NULL THEN
      UPDATE public.user_drivers SET count = count + 1 WHERE id = v_buyer_inventory_id;
    ELSE
      INSERT INTO public.user_drivers (user_id, driver_id, count, source)
        VALUES (v_buyer_id, v_card_id, 1, 'marketplace');
    END IF;
  END IF;

  -- Keep the persistent NEW! discovery when the buyer had no prior copy.
  IF v_buyer_inventory_id IS NULL THEN
    INSERT INTO public.user_card_discoveries (user_id, category, card_id)
      VALUES (v_buyer_id, v_listing.category, v_card_id)
      ON CONFLICT DO NOTHING;
  END IF;

  UPDATE public.profiles SET ap = COALESCE(ap, 0) - v_listing.price
    WHERE id = v_buyer_id RETURNING ap INTO v_new_balance;
  UPDATE public.profiles SET ap = COALESCE(ap, 0) + v_listing.price
    WHERE id = v_listing.seller_id;
  UPDATE public.marketplace_listings SET status = 'sold', buyer_id = v_buyer_id, sold_at = now()
    WHERE id = v_listing.id;

  RETURN jsonb_build_object(
    'success', TRUE, 'buyer_balance', v_new_balance, 'card_rarity', v_card_rarity
  );
END;
$$;

-- Keep transaction RPCs unavailable to anonymous callers and prevent direct writes.
REVOKE ALL ON FUNCTION public.get_my_marketplace_listings() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_market_listing(UUID, INTEGER, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_marketplace_listings() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.buy_market_listing(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_marketplace_listings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_market_listing(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_marketplace_listings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.buy_market_listing(UUID) TO authenticated;
