import { supabase } from '@/lib/supabaseClient';
import { deductAP, getUserProfile } from './profile';
import { ajouterCarteAuJoueur } from './carte';
import { updateQuestProgress } from './quests';

/**
 * Récupère tous les listings actifs du marché.
 */
export async function getMarketplaceListings() {
    const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
      *,
      card:cards(*),
      seller:profiles(username, ap)
    `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getMarketplaceListings] Erreur:', error.message);
        return { data: [], error: error.message };
    }

    return { data, error: null };
}

/**
 * Crée une nouvelle annonce sur le marché.
 */
export async function createListing(sellerId: string, cardId: string, price: number) {
    if (!sellerId || !cardId || price <= 0) return { success: false, error: 'Paramètres invalides' };

    try {
        // 1. Vérifier si l'utilisateur possède la carte (count > 0)
        const { data: userCard, error: cardError } = await supabase
            .from('user_cards')
            .select('id, count')
            .eq('user_id', sellerId)
            .eq('card_id', cardId)
            .single();

        if (cardError || !userCard || userCard.count <= 0) {
            return { success: false, error: 'Vous ne possédez pas cette carte.' };
        }

        // 2. Créer le listing
        const { error: insertError } = await supabase
            .from('marketplace_listings')
            .insert({
                seller_id: sellerId,
                card_id: cardId,
                price,
                status: 'active'
            });

        if (insertError) {
            console.error('[createListing] Erreur insertion:', insertError.message);
            return { success: false, error: insertError.message };
        }

        // 3. (Optionnel) Réduire la quantité immédiatement ? 
        // Pour l'instant on laisse comme ça, mais idéalement on "bloque" la carte.

        // 4. Update Quest Progress
        updateQuestProgress(sellerId, 'marketplace_sell');

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Achète une carte listée.
 */
export async function buyListing(buyerId: string, listingId: string) {
    if (!buyerId || !listingId) return { success: false, error: 'Paramètres invalides' };

    try {
        // 1. Récupérer le listing
        const { data: listing, error: listError } = await supabase
            .from('marketplace_listings')
            .select('*, card:cards(*)')
            .eq('id', listingId)
            .single();

        if (listError || !listing || listing.status !== 'active') {
            return { success: false, error: 'Annonce non disponible.' };
        }

        if (listing.seller_id === buyerId) {
            return { success: false, error: 'Vous ne pouvez pas acheter votre propre carte.' };
        }

        // 2. Déduire les AP de l'acheteur
        const deduction = await deductAP(buyerId, listing.price);
        if (!deduction.success) {
            return { success: false, error: deduction.error };
        }

        // 3. Transférer la carte à l'acheteur
        await ajouterCarteAuJoueur(buyerId, listing.card_id, 'marketplace');

        // 4. Ajouter les AP au vendeur
        const { data: sellerProfile } = await getUserProfile(listing.seller_id);
        if (sellerProfile) {
            await supabase
                .from('profiles')
                .update({ ap: (sellerProfile.ap || 0) + listing.price })
                .eq('id', listing.seller_id);
        }

        // 5. Marquer le listing comme vendu
        await supabase
            .from('marketplace_listings')
            .update({ status: 'sold' })
            .eq('id', listingId);

        // 6. Retirer 1 de count au vendeur
        const { data: sellerCard } = await supabase
            .from('user_cards')
            .select('id, count')
            .eq('user_id', listing.seller_id)
            .eq('card_id', listing.card_id)
            .single();

        if (sellerCard) {
            if (sellerCard.count > 1) {
                await supabase
                    .from('user_cards')
                    .update({ count: sellerCard.count - 1 })
                    .eq('id', sellerCard.id);
            } else {
                await supabase
                    .from('user_cards')
                    .delete()
                    .eq('id', sellerCard.id);
            }
        }

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
