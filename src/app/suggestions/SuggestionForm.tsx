'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Lightbulb, LoaderCircle, Send } from 'lucide-react';
import {
  SUGGESTION_CATEGORIES,
  SUGGESTION_FIELDS,
  type SuggestionCategory,
} from '@/lib/suggestions';
import { submitSuggestion } from './actions';

const categoryLabels: Record<SuggestionCategory, string> = {
  vehicle: 'Voiture',
  circuit: 'Circuit',
  driver: 'Pilote',
};

const fieldClass = 'w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10';

export default function SuggestionForm() {
  const [category, setCategory] = useState<SuggestionCategory>('vehicle');
  const [details, setDetails] = useState<Record<string, string>>({});
  const [submitterName, setSubmitterName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);

  const handleCategoryChange = (nextCategory: SuggestionCategory) => {
    setCategory(nextCategory);
    setDetails({});
    setFeedback(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);

    try {
      const result = await submitSuggestion({ category, details, submitterName, sourceUrl, message });
      if (!result.success) {
        setFeedback({ success: false, text: result.error });
        return;
      }
      setDetails({});
      setSubmitterName('');
      setSourceUrl('');
      setMessage('');
      setFeedback({ success: true, text: 'Merci ! Ta suggestion a été transmise à l’équipe.' });
    } catch (error) {
      console.error('[SuggestionForm] Envoi impossible:', error);
      setFeedback({
        success: false,
        text: error instanceof Error ? `Envoi impossible : ${error.message}` : 'Une erreur inattendue a empêché l’envoi.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#07090d] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_72%_0%,rgba(14,165,233,0.12),transparent_40%),radial-gradient(ellipse_at_0%_40%,rgba(30,64,175,0.08),transparent_36%)]" />
      <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-6 sm:px-6 lg:px-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-white">
          <ArrowLeft size={16} /> Retour au garage
        </Link>

        <section className="mt-8 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 sm:mt-12 sm:p-8 lg:p-10">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">
            <Lightbulb size={14} /> Apex Collector · Vos idées
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Suggérer une carte</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Une voiture, un circuit ou un pilote mérite sa place dans la collection ? Partage les informations que tu connais ; l’équipe vérifiera et complétera la fiche.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-7">
            <label className="block">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Type de carte</span>
              <select
                className={fieldClass}
                value={category}
                onChange={(event) => handleCategoryChange(event.target.value as SuggestionCategory)}
              >
                {SUGGESTION_CATEGORIES.map((item) => (
                  <option key={item} value={item}>{categoryLabels[item]}</option>
                ))}
              </select>
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              {SUGGESTION_FIELDS[category].map((field) => (
                <label key={field.name} className={`block min-w-0 ${field.name === 'image_url' ? 'sm:col-span-2' : ''}`}>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    {field.label}{field.required && <span className="ml-1 text-cyan-300">*</span>}
                  </span>
                  {field.type === 'select' ? (
                    <select
                      className={fieldClass}
                      value={details[field.name] ?? ''}
                      onChange={(event) => setDetails((current) => ({ ...current, [field.name]: event.target.value }))}
                    >
                      <option value="">Choisir…</option>
                      {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  ) : (
                    <input
                      className={fieldClass}
                      type={field.type ?? 'text'}
                      value={details[field.name] ?? ''}
                      onChange={(event) => setDetails((current) => ({ ...current, [field.name]: event.target.value }))}
                      required={field.required}
                      maxLength={field.type === 'url' ? 2048 : 200}
                      min={field.type === 'number' ? '0' : undefined}
                      step={field.type === 'number' ? 'any' : undefined}
                      placeholder={field.type === 'url' ? 'https://' : undefined}
                    />
                  )}
                  {field.hint && <span className="mt-1.5 block text-xs text-slate-500">{field.hint}</span>}
                </label>
              ))}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Pseudo (facultatif)</span>
                <input className={fieldClass} value={submitterName} maxLength={60} onChange={(event) => setSubmitterName(event.target.value)} />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Lien de référence</span>
                <input className={fieldClass} type="url" value={sourceUrl} placeholder="https://" onChange={(event) => setSourceUrl(event.target.value)} />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Un détail à ajouter ?</span>
              <textarea
                className={`${fieldClass} min-h-28 resize-y`}
                value={message}
                maxLength={1000}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Explique pourquoi cette carte serait intéressante ou ajoute une précision."
              />
            </label>

            {feedback && (
              <p role={feedback.success ? 'status' : 'alert'} className={`rounded-xl border px-4 py-3 text-sm ${feedback.success ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-red-400/20 bg-red-400/10 text-red-200'}`}>
                {feedback.success && <CheckCircle2 className="mr-2 inline" size={16} />}
                {feedback.text}
              </p>
            )}

            <button type="submit" disabled={busy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60 sm:w-auto">
              {busy ? <LoaderCircle className="animate-spin" size={17} /> : <Send size={16} />}
              {busy ? 'Envoi…' : 'Envoyer la suggestion'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
