import { addCircuitType, createCard, type CardDraft } from './actions';
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

const draft: CardDraft = {
  make: 'Nissan',
  model: '300ZX',
  year: '1989',
  rarity: 'Rare',
  is_active: true,
  booster_enabled: true,
  image_url: '',
  description: '',
  power_hp: '280',
  power_kw: '206',
  torque_nm: '375',
  max_speed_kmh: '250',
  weight_t: '1.585',
  acceleration_0_100: '5.9',
  engine_size: '2960',
  cylinder: 'V6',
  boost: 'Bi-Turbo',
  country_code: 'jp',
  transmission: 'FR',
  new_price_eur: '95000',
  fuel_type: 'ES',
  competition_type: 'PROD',
  competition_type_custom: '',
  is_record: false,
  record_description: '',
  max_rpm: '7000',
  units_sold: '164534',
};

describe('createCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: { randomUUID: jest.fn().mockReturnValue('new-card-id') },
    });
  });

  it('accepts the record checkbox boolean when validating a new vehicle', async () => {
    const savedCard = { id: 'card-row-id', card_id: 'card-id' };
    const single = jest.fn().mockResolvedValue({ data: savedCard, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    const from = jest.fn().mockReturnValue({ insert });
    const client = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-id' } }, error: null }) },
      from,
    };

    mockCreateServerSupabaseClient.mockResolvedValue(client as never);
    mockGetAdminAccess.mockResolvedValue({ isAdmin: true, isOwner: false, error: null });

    const result = await createCard(draft);

    expect(result.success).toBe(true);
    expect(from).toHaveBeenCalledWith('cards');
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      is_record: false,
      record_description: null,
    }));
  });
});

describe('addCircuitType', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds a trimmed type after confirming administrator access', async () => {
    const single = jest.fn().mockResolvedValue({ data: { name: 'Street' }, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    const from = jest.fn().mockReturnValue({ insert });
    const client = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-id' } }, error: null }) },
      from,
    };

    mockCreateServerSupabaseClient.mockResolvedValue(client as never);
    mockGetAdminAccess.mockResolvedValue({ isAdmin: true, isOwner: false, error: null });

    const result = await addCircuitType(' Street ');

    expect(result).toEqual({ success: true, name: 'Street' });
    expect(from).toHaveBeenCalledWith('circuit_types');
    expect(insert).toHaveBeenCalledWith({ name: 'Street' });
  });
});
