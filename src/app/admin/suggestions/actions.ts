'use server';

import { revalidatePath } from 'next/cache';
import { isAdminEmail } from '@/lib/admin';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import type { SuggestionStatus } from '@/lib/suggestions';

export type SuggestionUpdateResult =
  | { success: true }
  | { success: false; error: string };

const statuses: SuggestionStatus[] = ['pending', 'reviewing', 'accepted', 'rejected'];

export async function updateSuggestion(
  id: string,
  status: SuggestionStatus,
  adminNote: string,
): Promise<SuggestionUpdateResult> {
  if (typeof id !== 'string' || !id.trim()) {
    return { success: false, error: 'Suggestion introuvable.' };
  }
  if (!statuses.includes(status) || typeof adminNote !== 'string' || adminNote.length > 2000) {
    return { success: false, error: 'Le statut ou la note interne est invalide.' };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) return { success: false, error: `Impossible de vérifier la session : ${authError.message}` };
  if (!user) return { success: false, error: 'Connecte-toi pour traiter les suggestions.' };
  if (!isAdminEmail(user.email)) return { success: false, error: 'Cette action est réservée aux administrateurs.' };

  const { data, error } = await supabase
    .from('card_suggestions')
    .update({
      status,
      admin_note: adminNote.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[updateSuggestion] Mise à jour impossible:', error.message);
    return { success: false, error: `La suggestion n’a pas pu être mise à jour : ${error.message}` };
  }
  if (!data) return { success: false, error: 'Cette suggestion n’existe plus ou n’est plus accessible.' };

  revalidatePath('/admin/suggestions');
  return { success: true };
}
