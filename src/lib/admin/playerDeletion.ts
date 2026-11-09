export type PlayerAccount = {
  user_id: string;
  username: string;
  email: string | null;
  ac_balance: number | null;
  joined_at: string | null;
  protected: boolean;
};

export const PLAYER_DELETE_PREFIX = 'SUPPRIMER ';

export function playerDeleteConfirmation(username: string): string {
  return PLAYER_DELETE_PREFIX + username;
}

export function hasValidPlayerDeleteRequest(
  userId: unknown,
  username: unknown,
  email: unknown,
  confirmation: unknown,
): boolean {
  return (
    typeof userId === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)
    && typeof username === 'string'
    && username.length >= 1
    && username.length <= 100
    && typeof email === 'string'
    && email.length <= 320
    && typeof confirmation === 'string'
    && confirmation === playerDeleteConfirmation(username)
  );
}
