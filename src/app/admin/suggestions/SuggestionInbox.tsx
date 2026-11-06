'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Inbox, LoaderCircle, Save, ShieldCheck } from 'lucide-react';
import {
  getSuggestionFieldLabel,
  type SuggestionCategory,
  type SuggestionRecord,
  type SuggestionStatus,
} from '@/lib/suggestions';
import { updateSuggestion } from './actions';

const categoryLabels: Record<SuggestionCategory, string> = {
  vehicle: 'Voiture',
  circuit: 'Circuit',
  driver: 'Pilote',
};

const statusLabels: Record<SuggestionStatus, string> = {
  pending: 'À examiner',
  reviewing: 'En cours',
  accepted: 'Acceptée',
  rejected: 'Refusée',
};

const atelierPaths: Record<SuggestionCategory, string> = {
  vehicle: '/admin/cards',
  circuit: '/admin/circuits',
  driver: '/admin/drivers',
};

export default function SuggestionInbox({ initialSuggestions }: { initialSuggestions: SuggestionRecord[] }) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [selectedId, setSelectedId] = useState(initialSuggestions[0]?.id ?? null);
  const [status, setStatus] = useState<SuggestionStatus>(initialSuggestions[0]?.status ?? 'pending');
  const [adminNote, setAdminNote] = useState(initialSuggestions[0]?.admin_note ?? '');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);

  const selected = suggestions.find((suggestion) => suggestion.id === selectedId) ?? null;

  const selectSuggestion = (suggestion: SuggestionRecord) => {
    setSelectedId(suggestion.id);
    setStatus(suggestion.status);
    setAdminNote(suggestion.admin_note ?? '');
    setFeedback(null);
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || saving) return;
    setSaving(true);
    setFeedback(null);
    try {
      const result = await updateSuggestion(selected.id, status, adminNote);
      if (!result.success) {
        setFeedback({ success: false, text: result.error });
        return;
      }
      setSuggestions((current) => current.map((item) =>
        item.id === selected.id
          ? { ...item, status, admin_note: adminNote.trim() || null, updated_at: new Date().toISOString() }
          : item,
      ));
      setFeedback({ success: true, text: 'Traitement enregistré.' });
    } catch (error) {
      console.error('[SuggestionInbox] Enregistrement impossible:', error);
      setFeedback({
        success: false,
        text: error instanceof Error ? `Enregistrement impossible : ${error.message}` : 'Une erreur inattendue a empêché l’enregistrement.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#07090d] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_72%_0%,rgba(14,165,233,0.12),transparent_40%),radial-gradient(ellipse_at_0%_40%,rgba(30,64,175,0.08),transparent_36%)]" />
      <div className="relative mx-auto max-w-[1500px] px-4 pb-20 sm:px-6 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] py-5">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-white">
            <ArrowLeft size={16} /> Retour au garage
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-300">
            <ShieldCheck size={14} /> Atelier administrateur
          </div>
        </header>

        <section className="py-8 sm:py-10">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">
            <Inbox size={14} /> Apex Collector · Contributions
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Suggestions des joueurs</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Examine les informations proposées, ajoute une note interne et marque chaque idée comme en cours, acceptée ou refusée. L’ajout définitif au catalogue reste à faire dans l’atelier correspondant.
          </p>
        </section>

        {suggestions.length === 0 ? (
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center text-sm text-slate-400">
            Aucune suggestion pour le moment.
          </section>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.5fr)]">
            <nav aria-label="Liste des suggestions" className="max-h-[70vh] space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-3">
              {suggestions.map((suggestion) => (
                <button
                  type="button"
                  key={suggestion.id}
                  onClick={() => selectSuggestion(suggestion)}
                  aria-current={suggestion.id === selectedId ? 'true' : undefined}
                  className={`w-full rounded-xl border p-4 text-left transition ${suggestion.id === selectedId ? 'border-cyan-300/40 bg-cyan-300/[0.08]' : 'border-white/[0.06] bg-[#090c11] hover:border-white/20'}`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-white">{suggestion.title}</span>
                      <span className="mt-1 block text-xs text-slate-500">{categoryLabels[suggestion.category]}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-1 text-[9px] font-bold text-slate-300">{statusLabels[suggestion.status]}</span>
                  </span>
                  <span className="mt-3 block text-[10px] text-slate-500">
                    {new Date(suggestion.created_at).toLocaleDateString('fr-FR')}
                    {suggestion.submitter_name ? ` · ${suggestion.submitter_name}` : ''}
                  </span>
                </button>
              ))}
            </nav>

            {selected && (
              <section className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">{categoryLabels[selected.category]}</span>
                    <h2 className="mt-2 text-2xl font-black">{selected.title}</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Reçue le {new Date(selected.created_at).toLocaleString('fr-FR')}
                      {selected.submitter_name ? ` · proposée par ${selected.submitter_name}` : ''}
                    </p>
                  </div>
                  <Link href={atelierPaths[selected.category]} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-bold text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-200">
                    Ouvrir l’atelier <ExternalLink size={14} />
                  </Link>
                </div>

                <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                  {Object.entries(selected.details).map(([key, value]) => (
                    <div key={key} className="min-w-0 rounded-xl border border-white/[0.06] bg-[#090c11] px-4 py-3">
                      <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{getSuggestionFieldLabel(selected.category, key)}</dt>
                      <dd className="mt-1 break-words text-sm text-slate-200">{value}</dd>
                    </div>
                  ))}
                </dl>

                {selected.source_url && (
                  <a href={selected.source_url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 break-all text-sm text-cyan-200 underline decoration-cyan-200/30 underline-offset-4">
                    Référence fournie <ExternalLink size={14} />
                  </a>
                )}
                {selected.message && (
                  <div className="mt-5 rounded-xl border border-white/[0.06] bg-[#090c11] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Commentaire</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{selected.message}</p>
                  </div>
                )}

                <form onSubmit={save} className="mt-7 space-y-4 border-t border-white/[0.08] pt-6">
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Décision</span>
                    <select className="w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-400/70 sm:max-w-xs" value={status} onChange={(event) => setStatus(event.target.value as SuggestionStatus)}>
                      {(Object.keys(statusLabels) as SuggestionStatus[]).map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Note interne (facultative)</span>
                    <textarea className="min-h-24 w-full resize-y rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-400/70" maxLength={2000} value={adminNote} onChange={(event) => setAdminNote(event.target.value)} />
                  </label>
                  {feedback && <p role={feedback.success ? 'status' : 'alert'} className={`text-sm ${feedback.success ? 'text-emerald-300' : 'text-red-300'}`}>{feedback.text}</p>}
                  <button type="submit" disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60">
                    {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Enregistrement…' : 'Enregistrer le traitement'}
                  </button>
                </form>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
