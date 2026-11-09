import { hasValidPlayerDeleteRequest, playerDeleteConfirmation } from './playerDeletion';

const id = 'c65f545a-08eb-473f-b301-4ec5add76cf1';

describe('permanent player deletion confirmation', () => {
  it('requires the exact username, including case', () => {
    expect(playerDeleteConfirmation('pilot76')).toBe('SUPPRIMER pilot76');
    expect(hasValidPlayerDeleteRequest(id, 'pilot76', 'pilot@example.org', 'SUPPRIMER pilot76')).toBe(true);
    expect(hasValidPlayerDeleteRequest(id, 'pilot76', 'pilot@example.org', 'SUPPRIMER PILOT76')).toBe(false);
  });

  it('rejects missing confirmation or a different target', () => {
    expect(hasValidPlayerDeleteRequest(id, 'pilot76', 'pilot@example.org', 'SUPPRIMER other')).toBe(false);
    expect(hasValidPlayerDeleteRequest(id, 'pilot76', 'pilot@example.org', '')).toBe(false);
    expect(hasValidPlayerDeleteRequest(id, '', '', 'SUPPRIMER ')).toBe(false);
  });

  it('rejects invalid identifiers and oversized input', () => {
    expect(hasValidPlayerDeleteRequest('not-an-id', 'pilot76', '', 'SUPPRIMER pilot76')).toBe(false);
    expect(hasValidPlayerDeleteRequest(id, 'a'.repeat(101), '', 'SUPPRIMER ' + 'a'.repeat(101))).toBe(false);
    expect(hasValidPlayerDeleteRequest(id, 'pilot76', 'x'.repeat(321), 'SUPPRIMER pilot76')).toBe(false);
  });

  it('accepts an empty email for an old Auth account without an email', () => {
    expect(hasValidPlayerDeleteRequest(id, 'pilot76', '', 'SUPPRIMER pilot76')).toBe(true);
  });
});
