'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, LoaderCircle, Search, ShieldCheck, Trash2, Users, X } from 'lucide-react';
import { permanentlyDeletePlayerAccount, searchPlayerAccounts } from './actions';
import { playerDeleteConfirmation, type PlayerAccount } from '@/lib/admin/playerDeletion';

export default function PlayerAccountManager({ initialPlayers }: { initialPlayers: PlayerAccount[] }) {
  const [players, setPlayers] = useState(initialPlayers);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<PlayerAccount | null>(null);
  const [confirmation, setConfirmation] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);

  const findPlayers = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searching || deleting) return;
    setSearching(true);
    setFeedback(null);
    try {
      const result = await searchPlayerAccounts(search);
      if (!result.success) setFeedback({ success: false, text: result.error });
      else setPlayers(result.players);
    } catch {
      setFeedback({ success: false, text: 'La recherche des joueurs a échoué.' });
    } finally {
      setSearching(false);
    }
  };

  const openConfirmation = (player: PlayerAccount) => {
    if (player.protected || deleting) return;
    setConfirmation('');
    setAcknowledged(false);
    setSelected(player);
    setFeedback(null);
  };

  const closeConfirmation = () => {
    if (deleting) return;
    setSelected(null);
    setConfirmation('');
    setAcknowledged(false);
  };

  const deleteSelected = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || selected.protected || deleting || !acknowledged ||
        confirmation !== playerDeleteConfirmation(selected.username)) return;
    setDeleting(true);
    setFeedback(null);
    try {
      const result = await permanentlyDeletePlayerAccount(
        selected.user_id, selected.username, selected.email ?? '', confirmation,
      );
      if (!result.success) {
        setFeedback({ success: false, text: result.error });
        return;
      }
      const deletedUsername = selected.username;
      setPlayers(current => current.filter(row => row.user_id !== selected.user_id));
      setSelected(null);
      setConfirmation('');
      setAcknowledged(false);
      setFeedback({ success: true, text: 'Le compte @' + deletedUsername + ' a été supprimé de Supabase Auth et des données applicatives.' });
    } catch {
      setFeedback({ success: false, text: 'La suppression a échoué. Vérifie le compte dans Supabase avant de réessayer.' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07090d] pb-24 text-white">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-5">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white">
            <ArrowLeft size={16} /> Retour au garage
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
            <ShieldCheck size={14} /> Propriétaire uniquement
          </span>
        </header>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-8">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300">Apex Collector · Administration</p>
          <div className="mt-2 flex items-center gap-3">
            <Users className="text-cyan-300" size={26} />
            <h1 className="text-2xl font-black sm:text-3xl">Gestion des joueurs</h1>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Recherche un joueur par pseudo ou e-mail. La suppression définitive retire son compte
            Supabase Auth, ses cartes, boosters, crédits, progression et ses données de marché
            associées. Elle ne supprime pas les cartes du catalogue commun.
          </p>

          <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-4 text-sm text-red-200">
            <div className="flex items-center gap-2 font-bold"><AlertTriangle size={17} /> Suppression irréversible</div>
            <p className="mt-2 leading-6 text-red-100/80">
              Le propriétaire et les administrateurs sont protégés. Si le joueur possède des fichiers
              Supabase Storage, la suppression est refusée pour permettre leur nettoyage sécurisé
              préalable. Les sauvegardes techniques Supabase suivent leur propre rétention.
            </p>
          </div>

          <form onSubmit={findPlayers} className="mt-7 flex flex-col gap-3 sm:flex-row">
            <label className="min-w-0 flex-1">
              <span className="mb-2 block text-xs font-bold text-slate-400">Pseudo ou adresse e-mail</span>
              <input value={search} onChange={event => setSearch(event.target.value)}
                maxLength={100} placeholder="Rechercher un compte…"
                className="w-full rounded-xl border border-white/15 bg-[#090d15] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400" />
            </label>
            <button disabled={searching || deleting} type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 self-end rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-50">
              {searching ? <LoaderCircle className="animate-spin" size={17} /> : <Search size={17} />}
              Rechercher
            </button>
          </form>

          {feedback && (
            <p role={feedback.success ? 'status' : 'alert'}
              className={'mt-5 rounded-xl border px-4 py-3 text-sm ' + (feedback.success
                ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
                : 'border-red-400/20 bg-red-400/10 text-red-200')}>
              {feedback.text}
            </p>
          )}

          <div className="mt-7">
            <h2 className="mb-3 text-sm font-bold text-slate-300">
              Comptes trouvés ({players.length} affichés, 40 maximum)
            </h2>
            {players.length === 0 ? (
              <p className="rounded-xl border border-white/10 p-7 text-center text-sm text-slate-400">
                Aucun joueur correspondant.
              </p>
            ) : (
              <ul className="space-y-3">
                {players.map(player => (
                  <li key={player.user_id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#090d15] p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-white">@{player.username}</p>
                      <p className="mt-1 break-all text-xs text-slate-400">{player.email || 'Aucun e-mail'}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {player.ac_balance == null ? 'Solde inconnu' : player.ac_balance.toLocaleString('fr-FR') + ' AC'}
                        {player.joined_at ? ' · Inscrit le ' + new Date(player.joined_at).toLocaleDateString('fr-FR') : ''}
                      </p>
                    </div>
                    {player.protected ? (
                      <span className="rounded-lg border border-amber-400/20 px-3 py-2 text-xs font-bold text-amber-200">
                        Compte protégé
                      </span>
                    ) : (
                      <button type="button" onClick={() => openConfirmation(player)} disabled={deleting}
                        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-red-400/30 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-500/10 disabled:opacity-50">
                        <Trash2 size={16} /> Supprimer le compte
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="player-delete-dialog-title"
            className="w-full max-w-lg rounded-3xl border border-red-500/30 bg-[#11151c] p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-red-300">Zone de danger</p>
                <h2 id="player-delete-dialog-title" className="mt-2 text-xl font-black">
                  Supprimer définitivement @{selected.username} ?
                </h2>
              </div>
              <button type="button" disabled={deleting} onClick={closeConfirmation} aria-label="Annuler et fermer"
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10"><X size={20} /></button>
            </div>
            <p className="mt-4 break-all text-sm text-slate-300">Compte : <strong>{selected.email || 'Sans e-mail'}</strong></p>
            <p className="mt-2 text-xs text-slate-500">Identifiant : {selected.user_id}</p>
            <p className="mt-4 text-sm leading-6 text-red-200">
              Cette opération effacera ses cartes, AC, cadeaux, historique et compte de connexion.
              Elle est irréversible et ne permet pas de récupérer ses progrès.
            </p>

            <form onSubmit={deleteSelected} className="mt-5 space-y-4">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-200">
                <input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)}
                  disabled={deleting} className="mt-1 h-4 w-4 accent-red-500" />
                <span>Je comprends que toutes les données de ce joueur seront définitivement supprimées de l’application.</span>
              </label>
              <label className="block text-sm text-slate-300">
                Recopie exactement <strong className="select-all font-mono text-red-200">{playerDeleteConfirmation(selected.username)}</strong> :
                <input value={confirmation} onChange={event => setConfirmation(event.target.value)}
                  disabled={deleting} autoComplete="off" autoFocus
                  className="mt-2 w-full rounded-xl border border-red-400/25 bg-[#090c11] px-4 py-3 font-mono text-sm text-white outline-none focus:border-red-400"
                  aria-label="Phrase de confirmation de suppression" />
              </label>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" disabled={deleting} onClick={closeConfirmation}
                  className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-slate-200">
                  Annuler
                </button>
                <button type="submit"
                  disabled={!acknowledged || deleting || confirmation !== playerDeleteConfirmation(selected.username)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">
                  {deleting ? <LoaderCircle size={17} className="animate-spin" /> : <Trash2 size={17} />}
                  Supprimer définitivement
                </button>
              </div>
            </form>
            {deleting && <p role="status" className="mt-4 text-center text-xs text-slate-400">Suppression en cours…</p>}
          </section>
        </div>
      )}
    </main>
  );
}
