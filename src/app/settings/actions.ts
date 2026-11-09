'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { hasValidPlayerDeleteRequest } from '@/lib/admin/playerDeletion';

export type SelfDeleteResult = { success: true } | { success: false; error: string };

export async function permanentlyDeleteMyAccount(
  expectedUsername: string,
  expectedEmail: string,
  confirmation: string,
  password: string,
): Promise<SelfDeleteResult> {
  if (typeof password !== 'string' || !password || password.length > 1024) {
    return { success: false, error: 'Saisis ton mot de passe actuel.' };
  }

  const client = await createServerSupabaseClient();
  const { data: { user }, error: sessionError } = await client.auth.getUser();
  if (sessionError || !user) {
    return { success: false, error: 'Ta session a expiré. Reconnecte-toi avant la suppression.' };
  }
  if (!user.email || expectedEmail !== user.email ||
      !hasValidPlayerDeleteRequest(user.id, expectedUsername, expectedEmail, confirmation)) {
    return { success: false, error: 'Les informations de confirmation sont invalides.' };
  }

  // Verify the current password independently of the authenticated request.
  // Use a disposable server-side anon client that does not persist credentials.
  // Never log, store or return the password or verified session.
  const verificationClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
  const { data: verification, error: passwordError } = await verificationClient.auth.signInWithPassword({
    email: user.email,
    password,
  });
  if (passwordError || verification.user?.id !== user.id) {
    return { success: false, error: 'Mot de passe incorrect ou vérification impossible.' };
  }

  // This RPC can only delete auth.uid() itself (unless the caller is the site
  // owner), and rechecks exact email, username and the typed phrase.
  const { data, error } = await client.rpc('permanently_delete_player_account', {
    p_user_id: user.id,
    p_expected_username: expectedUsername,
    p_expected_email: expectedEmail,
    p_confirmation: confirmation,
  });
  if (error) {
    console.error('[Settings] Erreur suppression du compte:', error.code, error.message);
    return { success: false, error: error.message };
  }
  if (!data?.success) {
    return { success: false, error: 'Supabase n’a pas confirmé la suppression du compte.' };
  }

  revalidatePath('/leaderboard');
  revalidatePath('/marketplace');
  return { success: true };
}
