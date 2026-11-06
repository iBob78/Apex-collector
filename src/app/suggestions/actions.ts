'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { parseSuggestionDraft } from '@/lib/suggestions';

export type SuggestionSubmissionResult =
  | { success: true }
  | { success: false; error: string };

export async function submitSuggestion(input: unknown): Promise<SuggestionSubmissionResult> {
  const parsed = parseSuggestionDraft(input);
  if (!('data' in parsed)) return { success: false, error: parsed.error };

  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { success: false, error: `Impossible de vérifier la session : ${authError.message}` };
  }
  if (!user) return { success: false, error: 'Connecte-toi pour envoyer une suggestion.' };

  const { error } = await supabase.from('card_suggestions').insert({
    user_id: user.id,
    category: parsed.data.category,
    title: parsed.title,
    details: parsed.data.details,
    submitter_name: parsed.data.submitterName || null,
    source_url: parsed.data.sourceUrl || null,
    message: parsed.data.message || null,
  });

  if (error) {
    console.error('[submitSuggestion] Enregistrement impossible:', error.message);
    return { success: false, error: `La suggestion n’a pas pu être envoyée : ${error.message}` };
  }

  revalidatePath('/admin/suggestions');
  return { success: true };
}
