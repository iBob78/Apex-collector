/** Pure signup helpers. Profile trigger validates names on the server too. */
export function defaultSignupUsername(email: string): string {
  return email.split('@')[0].replace(/[^A-Za-z0-9_-]/g, '').slice(0, 24);
}
export function isValidSignupUsername(username: string): boolean {
  return /^[A-Za-z0-9_-]{3,24}$/.test(username.trim());
}
export function safeInternalRedirect(candidate: string | null): string {
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')
    || candidate.includes('\\') || /[\r\n]/.test(candidate)) {
    return '/dashboard';
  }
  return candidate;
}
