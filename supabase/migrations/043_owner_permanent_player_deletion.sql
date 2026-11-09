-- Permanent deletion of a player's own account or owner-managed deletion,
-- in one database transaction.
-- Apply this migration only after review/approval. NO USER IS DELETED BY THIS MIGRATION.
-- Deliberately use server-side ownership and identity checks in each
-- SECURITY DEFINER function, in addition to application authorization.
-- Supabase Auth user deletion may not instantly invalidate an already issued JWT.
-- Storage-owned objects must be cleaned with the Storage API first: direct SQL
-- deletion of storage.objects metadata would leave the underlying blobs orphaned.

CREATE OR REPLACE FUNCTION public.owner_search_player_accounts(
  p_search TEXT DEFAULT '',
  p_limit INT DEFAULT 40
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  email TEXT,
  ac_balance INTEGER,
  joined_at TIMESTAMPTZ,
  protected BOOLEAN
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_query TEXT := lower(btrim(coalesce(p_search, '')));
BEGIN
  IF (SELECT auth.uid()) IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.admin_control c
    WHERE c.singleton IS TRUE AND c.owner_user_id = (SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'Accès réservé au propriétaire.' USING ERRCODE = '42501';
  END IF;

  IF length(v_query) > 100 THEN
    RAISE EXCEPTION 'Recherche trop longue.' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT
    a.id,
    COALESCE(p.username, split_part(a.email, '@', 1), 'Compte sans pseudo')::TEXT,
    a.email::TEXT,
    p.ap,
    a.created_at,
    (
      EXISTS (SELECT 1 FROM public.admin_control c WHERE c.owner_user_id = a.id)
    ) AS protected
  FROM auth.users a
  LEFT JOIN public.profiles p ON p.id = a.id
  WHERE v_query = ''
    OR position(v_query IN lower(coalesce(p.username, ''))) > 0
    OR position(v_query IN lower(coalesce(a.email, ''))) > 0
  ORDER BY a.created_at DESC, a.id
  LIMIT least(greatest(coalesce(p_limit, 40), 1), 100);
END;
$function$;

CREATE OR REPLACE FUNCTION public.permanently_delete_player_account(
  p_user_id UUID,
  p_expected_username TEXT,
  p_expected_email TEXT,
  p_confirmation TEXT
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_actor UUID := (SELECT auth.uid());
  v_site_owner UUID;
  v_email TEXT;
  v_username TEXT;
  v_deleted UUID;
BEGIN
  IF v_actor IS NULL OR p_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentification requise.' USING ERRCODE = '42501';
  END IF;

  SELECT c.owner_user_id INTO v_site_owner
    FROM public.admin_control c WHERE c.singleton IS TRUE;
  IF v_site_owner IS NULL THEN
    RAISE EXCEPTION 'Le propriétaire du site est introuvable.'
      USING ERRCODE = '42501';
  END IF;

  -- Players can erase only themselves. Only the owner can erase another user.
  IF v_actor <> p_user_id AND v_actor <> v_site_owner THEN
    RAISE EXCEPTION 'Seul le propriétaire peut supprimer un autre compte.'
      USING ERRCODE = '42501';
  END IF;

  -- Never leave Apex Collector without its configured owner.
  IF p_user_id = v_site_owner THEN
    RAISE EXCEPTION 'Transfère la propriété du site avant de supprimer ce compte.'
      USING ERRCODE = '42501';
  END IF;

  -- Lock the target Auth row until all related deletes have committed.
  SELECT a.email,
         COALESCE(p.username, split_part(a.email, '@', 1), 'Compte sans pseudo')
  INTO v_email, v_username
  FROM auth.users a
  LEFT JOIN public.profiles p ON p.id = a.id
  WHERE a.id = p_user_id
  FOR UPDATE OF a;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Compte introuvable.' USING ERRCODE = 'P0002';
  END IF;

  -- Exact identity and second explicit confirmation, revalidated in database.
  IF p_expected_username IS DISTINCT FROM v_username
     OR p_expected_email IS DISTINCT FROM coalesce(v_email, '')
     OR p_confirmation IS DISTINCT FROM ('SUPPRIMER ' || v_username) THEN
    RAISE EXCEPTION 'La confirmation ne correspond pas au compte sélectionné.'
      USING ERRCODE = '22023';
  END IF;

  -- The owner may delete another admin. Preserve grants assigned by that
  -- admin by transferring their attribution to the site's current owner.
  -- Remove the target's own role so restrictive foreign keys do not block.
  UPDATE public.admin_users
  SET assigned_by = v_site_owner
  WHERE assigned_by = p_user_id AND user_id <> p_user_id;
  DELETE FROM public.admin_users WHERE user_id = p_user_id;

  -- Supabase Storage files must be removed via the Storage API, not raw SQL.
  -- Fail without modifying anything, rather than leave files or break shared media.
  IF EXISTS (SELECT 1 FROM storage.objects
             WHERE owner = p_user_id OR owner_id = p_user_id::TEXT)
     OR EXISTS (SELECT 1 FROM storage.buckets
                WHERE owner = p_user_id OR owner_id = p_user_id::TEXT)
     OR EXISTS (SELECT 1 FROM storage.s3_multipart_uploads
                WHERE owner_id = p_user_id::TEXT)
     OR EXISTS (SELECT 1 FROM storage.s3_multipart_uploads_parts
                WHERE owner_id = p_user_id::TEXT) THEN
    RAISE EXCEPTION 'Ce compte possède des fichiers Storage. Nettoyage sécurisé requis avant suppression.'
      USING ERRCODE = 'P0001';
  END IF;

  -- Legacy marketplace user rows are independent from auth.users;
  -- their FK is NO ACTION rather than CASCADE.
  DELETE FROM public.market WHERE seller_id = p_user_id;
  DELETE FROM public.users WHERE user_id = p_user_id;
  -- Profile-dependent quests, daily/welcome gifts, objectives, stats cascade.
  DELETE FROM public.profiles WHERE id = p_user_id;
  -- Auth dependents (cards, circuits, drivers, favorites, discoveries,
  -- suggestions, sessions, identities, etc.) cascade from auth.users.
  DELETE FROM auth.users WHERE id = p_user_id RETURNING id INTO v_deleted;

  IF v_deleted IS NULL THEN
    RAISE EXCEPTION 'La suppression du compte Auth a échoué.';
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$function$;

REVOKE ALL ON FUNCTION public.owner_search_player_accounts(TEXT, INT)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.permanently_delete_player_account(UUID, TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.owner_search_player_accounts(TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.permanently_delete_player_account(UUID, TEXT, TEXT, TEXT) TO authenticated;
