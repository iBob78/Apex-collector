'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LoaderCircle, ShieldCheck, UserMinus, UserPlus } from 'lucide-react';
import { addAdminByUsername, removeAdminByUserId } from './actions';

export type ManagedAdmin = {
  user_id: string;
  username: string | null;
  assigned_at: string;
};

export default function AdminAccessManager({
  initialAdmins,
  ownerId,
}: {
  initialAdmins: ManagedAdmin[];
  ownerId: string;
}) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);

  const addAdmin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || !username.trim()) return;
    setSaving(true);
    setFeedback(null);

    try {
      const result = await addAdminByUsername(username);
      if (!result.success) {
        setFeedback({ success: false, text: result.error });
        return;
      }
      setUsername('');
      setFeedback({ success: true, text: `@${result.username} peut maintenant accéder aux outils administrateur.` });
      window.location.reload();
    } catch (error) {
      console.error('[AdminAccessManager] Attribution du rôle impossible:', error);
      setFeedback({
        success: false,
        text: error instanceof Error ? `Attribution impossible : ${error.message}` : 'Une erreur inattendue a empêché l’attribution.',
      });
    } finally {
      setSaving(false);
    }
  };

  const removeAdmin = async (admin: ManagedAdmin) => {
    if (removingId || admin.user_id === ownerId) return;
    setRemovingId(admin.user_id);
    setFeedback(null);

    try {
      const result = await removeAdminByUserId(admin.user_id);
      if (!result.success) {
        setFeedback({ success: false, text: result.error });
        return;
      }
      setAdmins((current) => current.filter((entry) => entry.user_id !== admin.user_id));
      setFeedback({ success: true, text: `Le rôle administrateur de @${admin.username ?? 'ce compte'} a été retiré.` });
    } catch (error) {
      console.error('[AdminAccessManager] Retrait du rôle impossible:', error);
      setFeedback({
        success: false,
        text: error instanceof Error ? `Retrait impossible : ${error.message}` : 'Une erreur inattendue a empêché le retrait.',
      });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#07090d] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_72%_0%,rgba(14,165,233,0.12),transparent_40%),radial-gradient(ellipse_at_0%_40%,rgba(30,64,175,0.08),transparent_36%)]" />
      <div className="relative mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between gap-4 border-b border-white/[0.08] py-5">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-white">
            <ArrowLeft size={16} /> Retour au garage
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-300">
            <ShieldCheck size={14} /> Propriétaire du site
          </span>
        </header>

        <section className="mt-8 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 sm:mt-12 sm:p-8 lg:p-10">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">Apex Collector · Accès</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Administrateurs</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Seul ton compte propriétaire peut attribuer ou retirer ces accès. Les personnes ajoutées peuvent gérer les ateliers, les objectifs et les suggestions, mais pas les rôles administrateur.
          </p>

          <form onSubmit={addAdmin} className="mt-7 flex flex-col gap-3 sm:flex-row">
            <label className="min-w-0 flex-1">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Pseudo du joueur</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                maxLength={100}
                required
                placeholder="Pseudo exact du compte"
              />
            </label>
            <button type="submit" disabled={saving || !username.trim()} className="inline-flex min-h-12 items-center justify-center gap-2 self-end rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60">
              {saving ? <LoaderCircle size={16} className="animate-spin" /> : <UserPlus size={16} />}
              Ajouter administrateur
            </button>
          </form>

          {feedback && (
            <p role={feedback.success ? 'status' : 'alert'} className={`mt-4 rounded-xl border px-4 py-3 text-sm ${feedback.success ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-red-400/20 bg-red-400/10 text-red-200'}`}>
              {feedback.text}
            </p>
          )}

          <div className="mt-8 border-t border-white/[0.08] pt-6">
            <h2 className="text-lg font-black">Comptes autorisés</h2>
            <ul className="mt-4 space-y-2">
              {admins.map((admin) => {
                const isOwner = admin.user_id === ownerId;
                return (
                  <li key={admin.user_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#090c11] px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{admin.username ? `@${admin.username}` : 'Pseudo non défini'}</p>
                      <p className="mt-1 text-[10px] text-slate-500">{isOwner ? 'Propriétaire — rôle permanent' : `Ajouté le ${new Date(admin.assigned_at).toLocaleDateString('fr-FR')}`}</p>
                    </div>
                    {isOwner ? (
                      <span className="rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-amber-200">Propriétaire</span>
                    ) : (
                      <button
                        type="button"
                        disabled={removingId !== null}
                        onClick={() => void removeAdmin(admin)}
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-400/20 px-3 py-2 text-xs font-bold text-red-200 transition hover:bg-red-400/10 disabled:opacity-50"
                      >
                        {removingId === admin.user_id ? <LoaderCircle size={14} className="animate-spin" /> : <UserMinus size={14} />}
                        Retirer
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
