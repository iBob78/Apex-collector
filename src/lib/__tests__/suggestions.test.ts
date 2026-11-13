import { boostTypes } from '../boost';
import { parseSuggestionDraft } from '../suggestions';

describe('parseSuggestionDraft', () => {
  it('accepts a vehicle suggestion with optional technical details', () => {
    const result = parseSuggestionDraft({
      category: 'vehicle',
      details: { make: ' Porsche ', model: '911 GT3', year: '2024', power_hp: '510' },
      submitterName: 'Alex',
      sourceUrl: 'https://example.com/car',
      message: 'Une belle idée',
    });

    expect(result).toEqual({
      data: {
        category: 'vehicle',
        details: { make: 'Porsche', model: '911 GT3', year: '2024', power_hp: '510' },
        submitterName: 'Alex',
        sourceUrl: 'https://example.com/car',
        message: 'Une belle idée',
      },
      title: 'Porsche 911 GT3',
    });
  });

  it('accepts all six suralimentation choices and rejects arbitrary values', () => {
    for (const boost of boostTypes) {
      const result = parseSuggestionDraft({
        category: 'vehicle',
        details: { make: 'Apex', model: 'GT', year: '2025', boost },
        submitterName: '',
        sourceUrl: '',
        message: '',
      });
      expect('data' in result && result.data.details.boost).toBe(boost);
    }

    expect(parseSuggestionDraft({
      category: 'vehicle',
      details: { make: 'Apex', model: 'GT', year: '2025', boost: 'Nitro' },
      submitterName: '',
      sourceUrl: '',
      message: '',
    })).toEqual({ error: 'La valeur du champ « Suralimentation » est invalide.' });
  });

  it('rejects missing required fields, malformed numbers, and unknown fields', () => {
    expect(parseSuggestionDraft({
      category: 'circuit',
      details: { name: '' },
      submitterName: '',
      sourceUrl: '',
      message: '',
    })).toEqual({ error: 'Le champ « Nom du circuit » est obligatoire.' });

    expect(parseSuggestionDraft({
      category: 'vehicle',
      details: { make: 'Apex', model: 'One', year: '2025', power_hp: 'fast' },
      submitterName: '',
      sourceUrl: '',
      message: '',
    })).toEqual({ error: 'Les champs numériques doivent contenir des nombres positifs ou nuls.' });

    expect(parseSuggestionDraft({
      category: 'driver',
      details: { name: 'Alex Driver', year: '2025', country: 'France', admin: 'true' },
      submitterName: '',
      sourceUrl: '',
      message: '',
    })).toEqual({ error: 'Un ou plusieurs champs de la suggestion sont invalides.' });
  });

  it('accepts a comma decimal mass and validates competition type and record fields', () => {
    const result = parseSuggestionDraft({
      category: 'vehicle',
      details: {
        make: 'Apex',
        model: 'GT',
        year: '2025',
        weight_t: '1,230',
        transmission: 'FR',
        competition_type: 'GT3',
        is_record: 'true',
        record_description: 'Record du tour en catégorie GT3',
      },
      submitterName: '',
      sourceUrl: '',
      message: '',
    }, ['GT3']);

    expect('data' in result && result.data.details).toEqual({
      make: 'Apex',
      model: 'GT',
      year: '2025',
      weight_t: '1.230',
      transmission: 'FR',
      competition_type: 'GT3',
      is_record: 'true',
      record_description: 'Record du tour en catégorie GT3',
    });

    expect(parseSuggestionDraft({
      category: 'vehicle',
      details: { make: 'Apex', model: 'GT', year: '2025', competition_type: 'Unknown' },
      submitterName: '',
      sourceUrl: '',
      message: '',
    }, ['GT3'])).toEqual({ error: 'La valeur du champ « Type de compétition » est invalide.' });
  });

  it('accepts non-negative integer podium and race-win counts for driver suggestions', () => {
    const result = parseSuggestionDraft({
      category: 'driver',
      details: { name: 'Alex Driver', year: '2025', country: 'France', podiums: '42', race_wins: '17' },
      submitterName: '',
      sourceUrl: '',
      message: '',
    });

    expect('data' in result && result.data.details).toEqual({
      name: 'Alex Driver',
      year: '2025',
      country: 'France',
      podiums: '42',
      race_wins: '17',
    });
    expect(parseSuggestionDraft({
      category: 'driver',
      details: { name: 'Alex Driver', year: '2025', country: 'France', podiums: '-1' },
      submitterName: '',
      sourceUrl: '',
      message: '',
    })).toEqual({ error: 'Les champs numériques doivent contenir des nombres positifs ou nuls.' });
  });

  it('requires a record description when a vehicle suggestion is marked as a record', () => {
    expect(parseSuggestionDraft({
      category: 'vehicle',
      details: { make: 'Apex', model: 'GT', year: '2025', is_record: 'true' },
      submitterName: '',
      sourceUrl: '',
      message: '',
    })).toEqual({ error: 'Décris le record proposé.' });
  });
});
