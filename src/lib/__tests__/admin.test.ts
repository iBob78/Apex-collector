import { getAdminAccess } from '../admin';

describe('getAdminAccess', () => {
  it('returns the administrator and owner roles from Supabase', async () => {
    const client = {
      rpc: jest.fn()
        .mockResolvedValueOnce({ data: true, error: null })
        .mockResolvedValueOnce({ data: false, error: null }),
    };

    await expect(getAdminAccess(client)).resolves.toEqual({
      isAdmin: true,
      isOwner: false,
      error: null,
    });
  });

  it('returns an explicit error when role lookup fails', async () => {
    const client = {
      rpc: jest.fn()
        .mockResolvedValueOnce({ data: null, error: { message: 'function missing' } })
        .mockResolvedValueOnce({ data: null, error: null }),
    };

    await expect(getAdminAccess(client)).resolves.toEqual({
      isAdmin: false,
      isOwner: false,
      error: 'Impossible de vérifier les droits administrateur : function missing',
    });
  });
});
