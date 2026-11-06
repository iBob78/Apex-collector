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
});
