import { supabase } from '@/lib/supabaseClient';
import type { CardCategory } from '@/types/game';
import { updateQuestProgress } from './objectives';

type MarketActionResult = {
  success: boolean;
  error?: string;
  balance?: number;
};

/** Only active listings are public, with the seller's pseudonym (not their balance). */
export async function getMarketplaceListings() {
  const { data, error } = await supabase.rpc('get_marketplace_listings');
  if (error) {
    console.error('[getMarketplaceListings] Erreur:', error.message);
    return { data: [], error: error.message };
  }
  return { data: data ?? [], error: null };
}

/** The seller can view their own active, sold and cancelled listings. */
export async function getMyMarketplaceListings(sellerId: string) {
  if (!sellerId) return { data: [], error: 'Connexion requise.' };
  // Only the authenticated seller is returned; the RPC normalizes all card categories.
  const { data, error } = await supabase.rpc('get_my_marketplace_listings');

  if (error) {
    console.error('[getMyMarketplaceListings] Erreur:', error.message);
    return { data: [], error: error.message };
  }
  return { data: data ?? [], error: null };
}

/**
 * Ownership, remaining unlisted copies and seller identity are verified by
 * Supabase in one transaction. Never trust an arbitrary sellerId from the UI.
 */
export async function createListing(
  sellerId: string,
  cardId: string,
  price: number,
  category: CardCategory = 'vehicle',
): Promise<MarketActionResult> {
  if (!sellerId || !cardId || !Number.isSafeInteger(price) || price <= 0
    || !(['vehicle', 'circuit', 'driver'] as const).includes(category)) {
    return { success: false, error: 'Paramètres invalides.' };
  }

  const { data, error } = await supabase.rpc('create_market_listing', {
    p_card_id: cardId,
    p_price: price,
    p_category: category,
  });

  if (error) return { success: false, error: error.message };
  if (!data?.success) return { success: false, error: data?.error ?? 'Annonce non créée.' };

  // Progress is only recorded after the transaction has succeeded.
  await updateQuestProgress(sellerId, 'marketplace_listing');
  return { success: true };
}

/** Atomic purchase: credits and exactly one card transfer together, or nothing. */
export async function buyListing(buyerId: string, listingId: string): Promise<MarketActionResult> {
  if (!buyerId || !listingId) return { success: false, error: 'Paramètres invalides.' };

  const { data, error } = await supabase.rpc('buy_market_listing', {
    p_listing_id: listingId,
  });

  if (error) return { success: false, error: error.message };
  if (!data?.success) return { success: false, error: data?.error ?? 'Achat impossible.' };

  await updateQuestProgress(buyerId, 'collection_count');
  await updateQuestProgress(buyerId, 'rarity_card', 1, { rarity: data.card_rarity ?? undefined });
  return { success: true, balance: Number(data.buyer_balance) };
}

export async function cancelListing(listingId: string): Promise<MarketActionResult> {
  if (!listingId) return { success: false, error: 'Annonce invalide.' };

  const { data, error } = await supabase.rpc('cancel_market_listing', {
    p_listing_id: listingId,
  });

  if (error) return { success: false, error: error.message };
  if (!data?.success) return { success: false, error: data?.error ?? 'Annulation impossible.' };
  return { success: true };
}
