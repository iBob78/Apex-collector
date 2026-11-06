'use server';

import { revalidatePath } from 'next/cache';
import { getAdminAccess } from '@/lib/admin';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export type AdminManagementResult =
  | { success: true; username?: string }
  | { success: false; error: string };

async function getOwnerClient() {
  const client = await createServerSupabaseClient();
  const { data: { user }, error } = await client.auth.getUser();

  if (error) return { client: null, error: `Impossible de vérifier la session : ${error.message}` };
  if (!user) return { client: null, error: 'Connecte-toi pour gérer les administrateurs.' };

  const access = await getAdminAccess(client);
  if (access.error) {
    return {
      client: null,
      error: `${access.error}. Vérifie que la migration 034_managed_admin_users.sql a été appliquée.`,
    };
  }
  if (!access.isOwner) return { client: null, error: 'Seul le propriétaire du site peut gérer les administrateurs.' };

  return { client, error: null };
}

export async function addAdminByUsername(username: string): Promise<AdminManagementResult> {
  if (typeof username !== 'string' || !username.trim() || username.trim().length > 100) {
    return { success: false, error: 'Saisis un pseudo valide.' };
  }

  const authorization = await getOwnerClient();
  if (!authorization.client) return { success: false, error: authorization.error };

  const { data, error } = await authorization.client.rpc('set_admin_by_username', {
    p_username: username.trim(),
  });
  if (error) {
    return { success: false, error: `Le rôle administrateur n’a pas pu être attribué : ${error.message}` };
  }

  const admin = Array.isArray(data) ? data[0] as { username?: string } | undefined : undefined;
  if (!admin?.username) {
    return { success: false, error: 'Le compte correspondant au pseudo n’a pas été trouvé.' };
  }

  revalidatePath('/admin/access');
  revalidatePath('/admin/navigation-actions');
  return { success: true, username: admin.username };
}

export async function removeAdminByUserId(userId: string): Promise<AdminManagementResult> {
  if (typeof userId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    return { success: false, error: 'Compte administrateur invalide.' };
  }

  const authorization = await getOwnerClient();
  if (!authorization.client) return { success: false, error: authorization.error };

  const { data, error } = await authorization.client.rpc('remove_admin_by_user_id', {
    p_user_id: userId,
  });
  if (error) {
    return { success: false, error: `Le rôle administrateur n’a pas pu être retiré : ${error.message}` };
  }
  if (data !== true) return { success: false, error: 'Ce compte n’est plus administrateur.' };

  revalidatePath('/admin/access');
  revalidatePath('/admin/navigation-actions');
  return { success: true };
}
