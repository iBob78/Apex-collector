import { defaultSignupUsername, isValidSignupUsername, safeInternalRedirect } from '../signup';
describe('beta signup helpers', () => {
  test('suggests a username from the email but can be edited', () => {
    expect(defaultSignupUsername('leav7878@gmail.com')).toBe('leav7878');
    expect(defaultSignupUsername('joe.smith@example.com')).toBe('joesmith');
  });
  test('validates usernames', () => {
    expect(isValidSignupUsername('Etienne_78')).toBe(true);
    expect(isValidSignupUsername('ab')).toBe(false);
    expect(isValidSignupUsername('avec espace')).toBe(false);
    expect(isValidSignupUsername('écurie')).toBe(false);
    expect(isValidSignupUsername('A'.repeat(25))).toBe(false);
  });
  test('rejects off-site redirects', () => {
    expect(safeInternalRedirect('/collection')).toBe('/collection');
    expect(safeInternalRedirect('//other.site')).toBe('/dashboard');
    expect(safeInternalRedirect('https://other.site')).toBe('/dashboard');
    expect(safeInternalRedirect('/\\other.site')).toBe('/dashboard');
    expect(safeInternalRedirect(null)).toBe('/dashboard');
  });
});
