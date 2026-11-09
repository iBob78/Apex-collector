'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, LoaderCircle, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { playerDeleteConfirmation } from '@/lib/admin/playerDeletion';
import { permanentlyDeleteMyAccount } from './actions';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

type Identity = { username: string; email: string; isOwner: boolean };

export default function SelfAccountDeletion() {
  const { t } = useSitePreferences();
  const router = useRouter();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loadingIdentity, setLoadingIdentity] = useState(true);
  const [open, setOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user?.email) return;
        const [{ data: profile }, { data: isOwner, error: ownerError }] = await Promise.all([
          supabase.from('profiles').select('username').eq('id', user.id).maybeSingle(),
          supabase.rpc('is_site_owner'),
        ]);
        if (ownerError) throw ownerError;
        if (!active) return;
        setIdentity({
          username: profile?.username || user.email.split('@')[0],
          email: user.email,
          isOwner: isOwner === true,
        });
      } catch (err) {
        console.error('[SelfAccountDeletion] Vérification impossible:', err);
      } finally {
        if (active) setLoadingIdentity(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const close = () => {
    if (deleting) return;
    setOpen(false);
    setPassword('');
    setConfirmation('');
    setAcknowledged(false);
    setError(null);
  };

  const deleteAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!identity || identity.isOwner || deleting || !acknowledged || !password ||
      confirmation !== playerDeleteConfirmation(identity.username)) return;

    setDeleting(true);
    setError(null);
    try {
      const result = await permanentlyDeleteMyAccount(
        identity.username,
        identity.email,
        confirmation,
        password,
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      // Account no longer exists. Drop the browser-side session and leave
      // authenticated screens even when the server has invalidated its user.
      await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
      router.replace('/');
      window.location.replace('/');
    } catch {
      setError(t('Impossible de supprimer votre compte. Réessayez plus tard.'));
    } finally {
      setDeleting(false);
      setPassword('');
    }
  };

  return (
    <section className="max-w-2xl space-y-4 rounded-2xl border border-red-400/20 bg-red-400/[0.035] p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="text-red-300" size={20} />
        <h2 className="text-lg font-black text-red-200">{t('Zone de danger')}</h2>
      </div>
      <p className="text-sm leading-6 text-slate-400">
        {t('Supprimer définitivement mon compte Apex Collector, mes cartes, mes crédits, mes boosters et mes progrès. Cette action est irréversible.')}
      </p>
      {loadingIdentity ? (
        <p className="text-sm text-slate-500">{t('Vérification du compte…')}</p>
      ) : identity?.isOwner ? (
        <p role="status" className="text-sm text-amber-200">
          {t('Ce compte est propriétaire du site. Transfère la propriété avant de pouvoir le supprimer.')}
        </p>
      ) : identity ? (
        <button type="button" onClick={() => { setError(null); setOpen(true); }}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-red-400/40 px-4 py-2 text-sm font-bold text-red-200 hover:bg-red-400/10">
          <Trash2 size={17} /> {t('Supprimer mon compte')}
        </button>
      ) : (
        <p role="alert" className="text-sm text-red-200">
          {t('Connecte-toi pour gérer ton compte.')}
        </p>
      )}

      {open && identity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="delete-my-account-heading"
            className="relative w-full max-w-lg rounded-3xl border border-red-500/30 bg-[#11151c] p-5 text-white shadow-2xl sm:p-7">
            <button type="button" disabled={deleting} aria-label={t('Fermer')} onClick={close}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white">
              <X size={20} />
            </button>
            <p className="text-xs font-black uppercase tracking-wider text-red-300">{t('Suppression définitive')}</p>
            <h3 id="delete-my-account-heading" className="mt-2 pr-8 text-xl font-black">
              {t('Supprimer mon compte')} @{identity.username} ?
            </h3>
            <p className="mt-4 break-all text-sm text-slate-300">{identity.email}</p>
            <p className="mt-4 text-sm leading-6 text-red-200">
              {t('Vos cartes, crédits AC, récompenses et votre compte de connexion seront supprimés. Cette opération ne peut pas être annulée.')}
            </p>

            <form onSubmit={deleteAccount} className="mt-5 space-y-4">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-200">
                <input type="checkbox" checked={acknowledged}
                  onChange={e => setAcknowledged(e.target.checked)} disabled={deleting}
                  className="mt-1 h-4 w-4 accent-red-500" />
                <span>{t('Je comprends que cette suppression est définitive.')}</span>
              </label>
              <label className="block text-sm text-slate-300">
                {t('Recopie exactement')} <strong className="select-all font-mono text-red-200">
                  {playerDeleteConfirmation(identity.username)}
                </strong>
                <input value={confirmation} onChange={e => setConfirmation(e.target.value)}
                  disabled={deleting} autoComplete="off"
                  aria-label={t('Confirmation de suppression')}
                  className="mt-2 w-full rounded-lg border border-red-400/30 bg-black/30 px-3 py-3 font-mono text-sm text-white outline-none focus:border-red-400" />
              </label>
              <label className="block text-sm text-slate-300">
                {t('Confirme avec ton mot de passe actuel')}
                <input value={password} onChange={e => setPassword(e.target.value)}
                  type="password" autoComplete="current-password" disabled={deleting}
                  className="mt-2 w-full rounded-lg border border-red-400/30 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-red-400" />
              </label>
              {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={close} disabled={deleting}
                  className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white">
                  {t('Annuler')}
                </button>
                <button type="submit" disabled={deleting || !acknowledged || !password ||
                    confirmation !== playerDeleteConfirmation(identity.username)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">
                  {deleting ? <LoaderCircle size={17} className="animate-spin" /> : <Trash2 size={17} />}
                  {t('Supprimer définitivement')}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
