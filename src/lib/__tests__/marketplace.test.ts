jest.mock('@/lib/supabaseClient', () => ({
  supabase: { rpc: jest.fn(), from: jest.fn() },
}));
jest.mock('../actions/objectives', () => ({
  updateQuestProgress: jest.fn().mockResolvedValue(undefined),
}));

import { supabase } from '@/lib/supabaseClient';
import { updateQuestProgress } from '../actions/objectives';
import {
  getMarketplaceListings,
  createListing,
  buyListing,
  cancelListing,
} from '../actions/marketplace';

const rpc = supabase.rpc as jest.Mock;
const progress = updateQuestProgress as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('marketplace actions', () => {
  it('reads only the public listing payload from the RPC', async () => {
    rpc.mockResolvedValue({ data: [{ id: 'listing-1', seller: { username: 'Pilot' } }], error: null });
    const result = await getMarketplaceListings();
    expect(rpc).toHaveBeenCalledWith('get_marketplace_listings');
    expect(result.data).toHaveLength(1);
  });

  it('creates a listing through the transaction and records a quest only on success', async () => {
    rpc.mockResolvedValue({ data: { success: true, listing_id: 'listing-1' }, error: null });
    expect(await createListing('seller-1', 'card-1', 150)).toEqual({ success: true });
    expect(rpc).toHaveBeenCalledWith('create_market_listing', {
      p_card_id: 'card-1',
      p_price: 150,
    });
    expect(progress).toHaveBeenCalledWith('seller-1', 'marketplace_listing');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('rejects invalid prices without a database operation', async () => {
    expect(await createListing('seller-1', 'card-1', NaN)).toMatchObject({ success: false });
    expect(await createListing('seller-1', 'card-1', 1.5)).toMatchObject({ success: false });
    expect(await createListing('seller-1', 'card-1', 0)).toMatchObject({ success: false });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('shows database errors and does not award quest progress after failed listing', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'Aucun exemplaire disponible pour la vente.' } });
    const result = await createListing('seller-1', 'card-1', 150);
    expect(result).toEqual({ success: false, error: 'Aucun exemplaire disponible pour la vente.' });
    expect(progress).not.toHaveBeenCalled();
  });

  it('purchases atomically without client-side credit or inventory writes', async () => {
    rpc.mockResolvedValue({ data: { success: true, buyer_balance: 850, card_rarity: 'Rare' }, error: null });
    const result = await buyListing('buyer-1', 'listing-1');
    expect(rpc).toHaveBeenCalledWith('buy_market_listing', { p_listing_id: 'listing-1' });
    expect(result).toEqual({ success: true, balance: 850 });
    expect(progress).toHaveBeenCalledWith('buyer-1', 'collection_count');
    expect(progress).toHaveBeenCalledWith('buyer-1', 'rarity_card', 1, { rarity: 'Rare' });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('never reports a rejected purchase as successful', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'Annonce non disponible.' } });
    expect(await buyListing('buyer-1', 'listing-1'))
      .toEqual({ success: false, error: 'Annonce non disponible.' });
    expect(progress).not.toHaveBeenCalled();
  });

  it('cancels only through the authenticated RPC', async () => {
    rpc.mockResolvedValue({ data: { success: true }, error: null });
    expect(await cancelListing('listing-1')).toEqual({ success: true });
    expect(rpc).toHaveBeenCalledWith('cancel_market_listing', { p_listing_id: 'listing-1' });
  });
});
