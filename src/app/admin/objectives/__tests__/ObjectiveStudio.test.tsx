import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ObjectiveStudio, { type ObjectiveCatalogs } from '../ObjectiveStudio';
import { createObjective } from '../actions';

jest.mock('../actions', () => ({
  createObjective: jest.fn(),
  setObjectiveActive: jest.fn(),
  updateObjective: jest.fn(),
}));

const catalogs: ObjectiveCatalogs = {
  vehicles: [
    {
      card_id: '10000000-0000-4000-8000-000000000001',
      make: 'Ferrari',
      model: 'F40',
      year: 1987,
      rarity: 'Legend',
      fuel_type: 'Essence',
      transmission: 'MR',
      collection_number: 1,
    },
  ],
  circuits: [
    {
      circuit_id: '20000000-0000-4000-8000-000000000002',
      name: 'Monza',
      country: 'Italie',
      year: 1922,
      rarity: 'Rare',
      type: 'Route',
      collection_number: 1,
    },
  ],
  drivers: [
    {
      driver_id: '30000000-0000-4000-8000-000000000003',
      name: 'Pilote Test',
      year: 2026,
      country: 'France',
      rarity: 'Epic',
      collection_number: 1,
    },
  ],
};

describe('ObjectiveStudio collection conditions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createObjective as jest.Mock).mockImplementation(async (draft) => ({
      success: true,
      objective: { ...draft, id: 'objective-1', created_at: '2026-11-06T00:00:00Z' },
    }));
  });

  it('saves several conditions across card categories with their own count modes', async () => {
    render(<ObjectiveStudio initialObjectives={[]} catalogs={catalogs} />);

    fireEvent.change(screen.getByLabelText('Objectif de progression'), {
      target: { value: 'collection_requirement' },
    });
    fireEvent.change(screen.getByLabelText('Combinaison des conditions'), {
      target: { value: 'any' },
    });

    fireEvent.change(screen.getByLabelText('Marque'), { target: { value: 'Ferrari' } });
    fireEvent.change(screen.getByLabelText('Modèle'), { target: { value: 'F40' } });
    fireEvent.change(screen.getByLabelText('Nombre d’exemplaires'), { target: { value: '3' } });

    fireEvent.click(screen.getByRole('button', { name: 'Ajouter une condition' }));
    fireEvent.change(screen.getAllByLabelText('Catégorie')[1], { target: { value: 'driver' } });
    fireEvent.change(screen.getAllByLabelText('Carte précise (facultatif)')[1], {
      target: { value: catalogs.drivers[0].driver_id },
    });
    fireEvent.change(screen.getAllByLabelText('Mode de comptage')[1], {
      target: { value: 'unique' },
    });

    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'Garage de légende' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer l’objectif' }));

    await waitFor(() => expect(createObjective).toHaveBeenCalledTimes(1));
    expect(createObjective).toHaveBeenCalledWith(expect.objectContaining({
      objective_type: 'collection_requirement',
      target_count: 1,
      requirement_operator: 'any',
      requirements: [
        expect.objectContaining({
          category: 'vehicle',
          make: 'Ferrari',
          model: 'F40',
          target_count: 3,
          count_mode: 'copies',
        }),
        expect.objectContaining({
          category: 'driver',
          card_id: catalogs.drivers[0].driver_id,
          item_label: expect.stringContaining('Pilote Test'),
          count_mode: 'unique',
        }),
      ],
    }));
  });
});
