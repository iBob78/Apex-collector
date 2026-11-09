-- Marketplace v1: real listings backed by vehicle ownership and atomic AC transfers.
-- The legacy public.market table references the unused public.users table; leave it
-- untouched for compatibility and create the table expected by the current UI.
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id),
  card_id UUID NOT NULL REFERENCES public.cards(card_id),
  price INTEGER NOT NULL CHECK (price > 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  buyer_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sold_at TIMESTAMPTZ,
  CONSTRAINT marketplace_listings_sale_consistency CHECK (
    (status = 'sold' AND buyer_id IS NOT NULL AND sold_at IS NOT NULL)
    OR (status <> 'sold' AND buyer_id IS NULL AND sold_at IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS marketplace_listings_active_created_idx
  ON public.marketplace_listings (created_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS marketplace_listings_seller_idx
  ON public.marketplace_listings (seller_id, status);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read active or own marketplace listings"
  ON public.marketplace_listings FOR SELECT TO authenticated
  USING (status = 'active' OR seller_id = (SELECT auth.uid()));

-- Clients can only read listings. Mutations must go through vetted RPCs.
REVOKE ALL ON TABLE public.marketplace_listings FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.marketplace_listings TO authenticated;

-- Return the public card and seller pseudonym, not the private profile/balance.
CREATE OR REPLACE FUNCTION public.get_marketplace_listings()
RETURNS SETOF JSONB
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'id', listing.id,
    'seller_id', listing.seller_id,
    'card_id', listing.card_id,
    'price', listing.price,
    'status', listing.status,
    'created_at', listing.created_at,
    'card', to_jsonb(card),
    'seller', jsonb_build_object('username', seller.username)
  )
  FROM public.marketplace_listings AS listing
  JOIN public.cards AS card ON card.card_id = listing.card_id
  JOIN public.profiles AS seller ON seller.id = listing.seller_id
  WHERE auth.uid() IS NOT NULL
    AND listing.status = 'active'
    AND card.is_active = TRUE
  ORDER BY listing.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.create_market_listing(
  p_card_id UUID,
  p_price INTEGER
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
  IF p_card_id IS NULL OR p_price IS NULL OR p_price <= 0 THEN
    RAISE EXCEPTION 'Prix ou carte invalide.';
  END IF;

  -- Serialize creations for a given seller with buys on that seller.
  PERFORM 1 FROM public.profiles WHERE id = v_seller_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profil vendeur introuvable.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.cards
    WHERE card_id = p_card_id AND is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Carte introuvable ou désactivée.';
  END IF;

  SELECT COALESCE(SUM(COALESCE(count, 0)), 0)
  INTO v_available
  FROM public.user_cards
  WHERE user_id = v_seller_id AND card_id = p_card_id;

  SELECT COUNT(*) INTO v_reserved
  FROM public.marketplace_listings
  WHERE seller_id = v_seller_id AND card_id = p_card_id AND status = 'active';

  IF v_available <= v_reserved THEN
    RAISE EXCEPTION 'Aucun exemplaire disponible pour la vente.';
  END IF;

  INSERT INTO public.marketplace_listings (seller_id, card_id, price)
  VALUES (v_seller_id, p_card_id, p_price)
  RETURNING id INTO v_listing_id;

  RETURN jsonb_build_object('success', TRUE, 'listing_id', v_listing_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_market_listing(p_listing_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Connexion requise.';
  END IF;

  UPDATE public.marketplace_listings
  SET status = 'cancelled'
  WHERE id = p_listing_id AND seller_id = v_user_id AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Annonce active introuvable ou non autorisée.';
  END IF;

  RETURN jsonb_build_object('success', TRUE);
END;
$$;

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
  v_seller_card_id UUID;
  v_seller_count INTEGER;
  v_buyer_card_id UUID;
  v_new_balance INTEGER;
BEGIN
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Connexion requise.';
  END IF;

  -- One winner per listing, even when two users try to buy simultaneously.
  SELECT * INTO v_listing
  FROM public.marketplace_listings
  WHERE id = p_listing_id
  FOR UPDATE;

  IF NOT FOUND OR v_listing.status <> 'active' THEN
    RAISE EXCEPTION 'Annonce non disponible.';
  END IF;
  IF v_listing.seller_id = v_buyer_id THEN
    RAISE EXCEPTION 'Vous ne pouvez pas acheter votre propre carte.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.cards
    WHERE card_id = v_listing.card_id AND is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Carte introuvable ou désactivée.';
  END IF;

  -- Consistent lock order prevents two opposite purchases from deadlocking.
  PERFORM 1 FROM public.profiles
  WHERE id IN (v_buyer_id, v_listing.seller_id)
  ORDER BY id FOR UPDATE;

  SELECT ap INTO v_buyer_balance FROM public.profiles WHERE id = v_buyer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profil acheteur introuvable.';
  END IF;
  SELECT ap INTO v_seller_balance FROM public.profiles WHERE id = v_listing.seller_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profil vendeur introuvable.';
  END IF;
  IF COALESCE(v_buyer_balance, 0) < v_listing.price THEN
    RAISE EXCEPTION 'Solde AC insuffisant.';
  END IF;
  IF COALESCE(v_seller_balance, 0)::BIGINT + v_listing.price > 2147483647 THEN
    RAISE EXCEPTION 'Plafond de solde vendeur atteint.';
  END IF;

  PERFORM 1 FROM public.user_cards
  WHERE (user_id = v_listing.seller_id OR user_id = v_buyer_id)
    AND card_id = v_listing.card_id
  ORDER BY user_id, id FOR UPDATE;

  -- Existing inventories can contain several rows for the same card.
  SELECT id, count INTO v_seller_card_id, v_seller_count
  FROM public.user_cards
  WHERE user_id = v_listing.seller_id AND card_id = v_listing.card_id
    AND count > 0
  ORDER BY id LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Le vendeur ne possède plus cette carte.';
  END IF;

  SELECT id INTO v_buyer_card_id
  FROM public.user_cards
  WHERE user_id = v_buyer_id AND card_id = v_listing.card_id
  ORDER BY id LIMIT 1;

  IF v_seller_count > 1 THEN
    UPDATE public.user_cards SET count = v_seller_count - 1
    WHERE id = v_seller_card_id;
  ELSE
    DELETE FROM public.user_cards WHERE id = v_seller_card_id;
  END IF;

  IF v_buyer_card_id IS NOT NULL THEN
    UPDATE public.user_cards SET count = COALESCE(count, 0) + 1
    WHERE id = v_buyer_card_id;
  ELSE
    INSERT INTO public.user_cards (user_id, card_id, count, source)
    VALUES (v_buyer_id, v_listing.card_id, 1, 'marketplace');
  END IF;

  UPDATE public.profiles SET ap = COALESCE(ap, 0) - v_listing.price
  WHERE id = v_buyer_id RETURNING ap INTO v_new_balance;
  UPDATE public.profiles SET ap = COALESCE(ap, 0) + v_listing.price
  WHERE id = v_listing.seller_id;

  UPDATE public.marketplace_listings
  SET status = 'sold', buyer_id = v_buyer_id, sold_at = now()
  WHERE id = v_listing.id;

  RETURN jsonb_build_object('success', TRUE, 'buyer_balance', v_new_balance);
END;
$$;

REVOKE ALL ON FUNCTION public.get_marketplace_listings() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_market_listing(UUID, INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cancel_market_listing(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.buy_market_listing(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_marketplace_listings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_market_listing(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_market_listing(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.buy_market_listing(UUID) TO authenticated;
