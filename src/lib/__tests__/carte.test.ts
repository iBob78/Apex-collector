jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn()
  }
}));

import { supabase } from '@/lib/supabaseClient';
import { ajouterCircuitAuJoueur } from '../actions/carte';

describe('ajouterCircuitAuJoueur', () => {
  it('inserts only columns supported by user_circuits', async () => {
    const query = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ error: null })
    };
    (supabase.from as jest.Mock).mockReturnValue(query);

    const result = await ajouterCircuitAuJoueur('user-1', 'circuit-1');

    expect(supabase.from).toHaveBeenCalledWith('user_circuits');
    expect(query.insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      circuit_id: 'circuit-1',
      count: 1
    });
    expect(result.success).toBe(true);
  });
});