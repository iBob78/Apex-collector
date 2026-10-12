'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

type UpgradeResult =
  | { success: true; level: number; balance: number }
  | { success: false; error: string };

export async function purchaseCardUpgrade(cardId: string): Promise<UpgradeResult> {
  if (typeof cardId !== 'string' || !cardId.trim()) {
    return { success: false, error: 'Identifiant de carte manquant.' };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) return { success: false, error: `Impossible de vérifier la session : ${authError.message}` };
  if (!user) return { success: false, error: 'Connecte-toi pour améliorer cette carte.' };

  const { data, error } = await supabase.rpc('purchase_card_upgrade', {
    p_card_id: cardId.trim(),
  });

  if (error) return { success: false, error: error.message };
  if (
    !data ||
    typeof data !== 'object' ||
    typeof data.upgrade_level !== 'number' ||
    typeof data.balance !== 'number'
  ) {
    return { success: false, error: 'La réponse d’achat reçue est invalide.' };
  }

  revalidatePath('/collection');
  return { success: true, level: data.upgrade_level, balance: data.balance };
}
