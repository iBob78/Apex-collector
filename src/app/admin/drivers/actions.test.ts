import { createDriver, type DriverDraft } from './actions';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { getAdminAccess } from '@/lib/admin';

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('@/lib/supabaseServer', () => ({
  createServerSupabaseClient: jest.fn(),
}));

jest.mock('@/lib/admin', () => ({
  getAdminAccess: jest.fn(),
}));

const mockCreateServerSupabaseClient = jest.mocked(createServerSupabaseClient);
const mockGetAdminAccess = jest.mocked(getAdminAccess);

const draft: DriverDraft = {
  name: 'Alex Driver',
  year: '2025',
  birth_date: '1990-01-01',
  country: 'France',
  country_code: 'FR',
  world_championships: '2',
  podiums: '42',
  race_wins: '17',
  won_monaco_gp: false,
  won_indy_500: false,
  won_24h_le_mans: false,
  rarity: 'Rare',
  image_url: '',
  description: '',
  is_active: true,
  booster_enabled: true,
};

function configureAdminClient(from: jest.Mock) {
  const client = {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-id' } }, error: null }) },
    from,
  };
  mockCreateServerSupabaseClient.mockResolvedValue(client as never);
  mockGetAdminAccess.mockResolvedValue({ isAdmin: true, isOwner: false, error: null });
}

describe('createDriver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: { randomUUID: jest.fn().mockReturnValue('new-driver-id') },
    });
  });

  it('saves podium and race-win counts as integers', async () => {
    const single = jest.fn().mockResolvedValue({ data: { id: 'driver-row-id', ...draft }, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    const from = jest.fn().mockReturnValue({ insert });
    configureAdminClient(from);

    const result = await createDriver(draft);

    expect(result.success).toBe(true);
    expect(from).toHaveBeenCalledWith('drivers');
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      world_championships: 2,
      podiums: 42,
      race_wins: 17,
    }));
  });

  it('rejects negative podium counts without inserting a driver', async () => {
    const from = jest.fn();
    configureAdminClient(from);

    const result = await createDriver({ ...draft, podiums: '-1' });

    expect(result).toEqual({ success: false, error: 'Le nombre de podiums doit être un entier positif ou nul.' });
    expect(from).not.toHaveBeenCalled();
  });
});
