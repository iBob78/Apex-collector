type AdminAccessClient = {
  rpc: (name: 'is_admin' | 'is_site_owner') => PromiseLike<{
    data: unknown;
    error: { message: string } | null;
  }>;
};

export async function getAdminAccess(client: AdminAccessClient) {
  const [{ data: isAdmin, error: adminError }, { data: isOwner, error: ownerError }] = await Promise.all([
    client.rpc('is_admin'),
    client.rpc('is_site_owner'),
  ]);

  const error = adminError ?? ownerError;
  if (error) {
    return {
      isAdmin: false,
      isOwner: false,
      error: `Impossible de vérifier les droits administrateur : ${error.message}`,
    };
  }

  return {
    isAdmin: isAdmin === true,
    isOwner: isOwner === true,
    error: null,
  };
}
