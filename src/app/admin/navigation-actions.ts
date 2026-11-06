'use server';

import { getAdminAccess } from '@/lib/admin';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function getAdminNavigationAccess() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('[getAdminNavigationAccess] Impossible de vérifier la session:', error.message);
    throw new Error(`Impossible de vérifier les accès administrateur : ${error.message}`);
  }

  const access = await getAdminAccess(supabase);
  if (access.error) throw new Error(access.error);

  return {
    userId: user?.id ?? null,
    isAdmin: access.isAdmin,
    isOwner: access.isOwner,
  };
}
