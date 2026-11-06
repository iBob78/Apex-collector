'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { parseSuggestionDraft } from '@/lib/suggestions';

export type SuggestionSubmissionResult =
  | { success: true }
  | { success: false; error: string };

export async function submitSuggestion(input: unknown): Promise<SuggestionSubmissionResult> {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { success: false, error: `Impossible de vérifier la session : ${authError.message}` };
  }
  if (!user) return { success: false, error: 'Connecte-toi pour envoyer une suggestion.' };

  const category = typeof input === 'object' && input !== null && 'category' in input
    ? input.category
    : null;
  const competitionTypesResult = category === 'vehicle'
    ? await supabase.from('competition_types').select('name')
    : { data: [], error: null };
  if (competitionTypesResult.error) {
    console.error('[submitSuggestion] Chargement des types de compétition impossible:', competitionTypesResult.error.message);
    return {
      success: false,
      error: `Impossible de vérifier le type de compétition : ${competitionTypesResult.error.message}`,
    };
  }
  const parsed = parseSuggestionDraft(
    input,
    competitionTypesResult.data.map(({ name }) => name),
  );
  if (!('data' in parsed)) return { success: false, error: parsed.error };

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
