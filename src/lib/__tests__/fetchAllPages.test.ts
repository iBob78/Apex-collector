import { COLLECTION_FETCH_PAGE_SIZE, fetchAllPages } from '../fetchAllPages';

describe('fetchAllPages', () => {
  it('charge tous les véhicules et circuits au-delà de 1 000 lignes', async () => {
    const vehicles = Array.from({ length: 1785 }, (_, index) => ({ id: index + 1 }));
    const circuits = Array.from({ length: 1053 }, (_, index) => ({ id: index + 1 }));
    const vehiclePage = jest.fn(async (from: number, to: number) => ({
      data: vehicles.slice(from, to + 1),
      error: null,
    }));
    const circuitPage = jest.fn(async (from: number, to: number) => ({
      data: circuits.slice(from, to + 1),
      error: null,
    }));

    const [allVehicles, allCircuits] = await Promise.all([
      fetchAllPages(vehiclePage),
      fetchAllPages(circuitPage),
    ]);

    expect(COLLECTION_FETCH_PAGE_SIZE).toBe(500);
    expect(allVehicles).toEqual(vehicles);
    expect(allCircuits).toEqual(circuits);
    expect(allVehicles.length + allCircuits.length).toBe(2838);
    expect(vehiclePage).toHaveBeenCalledTimes(4);
    expect(vehiclePage).toHaveBeenLastCalledWith(1500, 1999);
    expect(circuitPage).toHaveBeenCalledTimes(3);
    expect(circuitPage).toHaveBeenLastCalledWith(1000, 1499);
  });

  it('s’arrête dès la première page incomplète', async () => {
    const request = jest.fn(async () => ({ data: [{ id: 1 }], error: null }));
    await expect(fetchAllPages(request)).resolves.toEqual([{ id: 1 }]);
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith(0, 499);
  });

  it('gère une table vide', async () => {
    const request = jest.fn(async () => ({ data: [], error: null }));
    await expect(fetchAllPages(request)).resolves.toEqual([]);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('lit une page supplémentaire lorsque la dernière est exactement pleine', async () => {
    const rows = Array.from({ length: 1000 }, (_, id) => ({ id }));
    const request = jest.fn(async (from: number, to: number) => ({
      data: rows.slice(from, to + 1),
      error: null,
    }));

    expect(await fetchAllPages(request)).toHaveLength(1000);
    expect(request).toHaveBeenCalledTimes(3);
    expect(request).toHaveBeenLastCalledWith(1000, 1499);
  });

  it('remonte une erreur Supabase au lieu de retourner un catalogue incomplet', async () => {
    const request = jest.fn(async (from: number) => ({
      data: from === 0 ? Array.from({ length: 500 }, (_, id) => ({ id })) : null,
      error: from === 0 ? null : { message: 'Erreur de lecture Supabase' },
    }));

    await expect(fetchAllPages(request)).rejects.toMatchObject({
      message: 'Erreur de lecture Supabase',
    });
    expect(request).toHaveBeenCalledTimes(2);
  });
});
