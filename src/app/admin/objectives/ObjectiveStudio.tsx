'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, CircleOff, ClipboardList, Plus, Save, Trophy } from 'lucide-react';
import {
  type ObjectiveCategory,
  type ObjectiveDefinition,
  type ObjectiveType,
} from '@/lib/actions/objectives';
import {
  createObjective,
  setObjectiveActive,
  updateObjective,
  type ObjectiveDraft,
} from './actions';

const rarities = ['Common', 'Uncommon', 'Atypique', 'Rare', 'Very rare', 'Epic', 'Legend', 'Mythic', 'Icon'];
const objectiveTypeLabels: Record<ObjectiveType, string> = {
  booster_open: 'Ouvrir des boosters',
  collection_count: 'Collectionner des véhicules',
  rarity_card: 'Obtenir une carte d’une rareté',
  marketplace_listing: 'Créer une annonce Marketplace',
  circuit_collection: 'Collectionner des circuits',
  daily_login: 'Se connecter des jours différents',
};
const blankDraft: ObjectiveDraft = {
  category: 'contract',
  title: '',
  description: '',
  objective_type: 'booster_open',
  target_count: 1,
  required_rarity: 'Icon',
  reward_ap: 100,
  is_active: true,
};

function toDraft(objective: ObjectiveDefinition): ObjectiveDraft {
  return {
    category: objective.category,
    title: objective.title,
    description: objective.description,
    objective_type: objective.objective_type,
    target_count: objective.target_count,
    required_rarity: objective.required_rarity ?? 'Icon',
    reward_ap: objective.reward_ap,
    is_active: objective.is_active,
  };
}

export default function ObjectiveStudio({ initialObjectives }: { initialObjectives: ObjectiveDefinition[] }) {
  const [objectives, setObjectives] = useState(initialObjectives);
  const [category, setCategory] = useState<ObjectiveCategory>('contract');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ObjectiveDraft>(blankDraft);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const visibleObjectives = useMemo(
    () => objectives.filter((objective) => objective.category === category),
    [objectives, category],
  );
  const selected = objectives.find((objective) => objective.id === selectedId) ?? null;

  const beginCreate = (nextCategory: ObjectiveCategory = category) => {
    setCategory(nextCategory);
    setSelectedId(null);
    setDraft({ ...blankDraft, category: nextCategory });
    setFeedback(null);
  };

  const selectObjective = (objective: ObjectiveDefinition) => {
    setCategory(objective.category);
    setSelectedId(objective.id);
    setDraft(toDraft(objective));
    setFeedback(null);
  };

  const updateDraft = <K extends keyof ObjectiveDraft>(field: K, value: ObjectiveDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setFeedback(null);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    const result = selectedId
      ? await updateObjective(selectedId, draft)
      : await createObjective(draft);
    setSaving(false);

    if (!result.success) {
      setFeedback({ type: 'error', text: result.error });
      return;
    }

    setObjectives((current) => current.some((objective) => objective.id === result.objective.id)
      ? current.map((objective) => objective.id === result.objective.id ? result.objective : objective)
      : [result.objective, ...current]);
    setCategory(result.objective.category);
    setSelectedId(result.objective.id);
    setDraft(toDraft(result.objective));
    setFeedback({
      type: 'success',
      text: result.objective.is_active
        ? 'Objectif enregistré. Il est attribué aux joueurs existants et nouveaux.'
        : 'Objectif enregistré comme brouillon ; il sera attribué aux joueurs lors de son activation.',
    });
  };

  const handleToggle = async (objective: ObjectiveDefinition) => {
    const result = await setObjectiveActive(objective.id, !objective.is_active);
    if (!result.success) {
      setFeedback({ type: 'error', text: result.error });
      return;
    }
    setObjectives((current) => current.map((item) => item.id === objective.id
      ? { ...item, is_active: !item.is_active }
      : item));
    if (selectedId === objective.id) {
      setDraft((current) => ({ ...current, is_active: !objective.is_active }));
    }
    setFeedback({ type: 'success', text: objective.is_active ? 'Objectif désactivé ; sa progression est conservée.' : 'Objectif activé.' });
  };

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      <div className="mx-auto max-w-[1400px] px-4 pb-14 sm:px-6 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] py-5">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-white">
            <ArrowLeft size={16} /> Retour au garage
          </Link>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-300">
            Atelier administrateur
          </span>
        </header>

        <section className="py-8">
          <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">
            <Trophy size={14} /> Gestion du jeu
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Succès & contrats</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Crée et modifie les objectifs, leur progression et leur récompense en AP. Désactive un objectif pour le retirer du jeu sans effacer l’historique des joueurs.
          </p>
        </section>

        <nav className="mb-6 flex flex-wrap gap-2">
          <Link href="/admin/cards" className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-white">Cartes véhicule</Link>
          <Link href="/admin/circuits" className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-white">Cartes circuit</Link>
          <span className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2.5 text-xs font-bold text-cyan-200">Succès & contrats</span>
        </nav>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2" role="tablist" aria-label="Type d’objectif">
            {(['contract', 'achievement'] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={category === item}
                onClick={() => beginCreate(item)}
                className={`rounded-xl border px-4 py-2.5 text-xs font-black uppercase tracking-wide transition ${
                  category === item ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-200' : 'border-white/10 text-slate-400 hover:bg-white/5'
                }`}
              >
                {item === 'contract' ? 'Contrats' : 'Succès'}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => beginCreate()} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-cyan-200">
            <Plus size={15} /> Créer {category === 'contract' ? 'un contrat' : 'un succès'}
          </button>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
          <section className="rounded-3xl border border-white/[0.08] bg-[#0d1118]/90 p-4">
            <div className="mb-3 flex items-center justify-between px-2">
              <h2 className="font-black">Objectifs existants</h2>
              <span className="rounded-lg bg-white/5 px-2 py-1 text-xs font-bold text-slate-400">{visibleObjectives.length}</span>
            </div>
            <div className="max-h-[650px] space-y-2 overflow-y-auto pr-1">
              {visibleObjectives.length ? visibleObjectives.map((objective) => (
                <div key={objective.id} className={`rounded-2xl border p-3 ${selectedId === objective.id ? 'border-cyan-300/30 bg-cyan-300/[0.06]' : 'border-white/[0.06] bg-black/20'}`}>
                  <button type="button" onClick={() => selectObjective(objective)} className="block w-full text-left">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-bold">{objective.title}</span>
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${objective.is_active ? 'bg-emerald-400/10 text-emerald-300' : 'bg-slate-500/10 text-slate-400'}`}>
                        {objective.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </span>
                    <span className="mt-1 block text-[10px] text-slate-500">
                      {objectiveTypeLabels[objective.objective_type]} · cible {objective.target_count} · {objective.reward_ap} AP
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleToggle(objective)}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2 py-1.5 text-[10px] font-bold text-slate-400 hover:bg-white/5 hover:text-white"
                  >
                    {objective.is_active ? <CircleOff size={12} /> : <Check size={12} />}
                    {objective.is_active ? 'Désactiver' : 'Réactiver'}
                  </button>
                </div>
              )) : (
                <p className="px-3 py-8 text-center text-xs text-slate-500">Aucun objectif dans cette catégorie.</p>
              )}
            </div>
          </section>

          <form onSubmit={handleSave} className="space-y-5 rounded-3xl border border-white/[0.08] bg-[#0d1118]/90 p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-300/10 p-2.5 text-cyan-200"><ClipboardList size={19} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{selected ? 'Modifier' : 'Nouvel objectif'}</p>
                <h2 className="text-lg font-black">{selected?.title || (category === 'contract' ? 'Créer un contrat' : 'Créer un succès')}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Titre</span>
                <input required maxLength={100} value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm outline-none focus:border-cyan-400/70" />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Description</span>
                <textarea maxLength={500} rows={3} value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} className="w-full resize-y rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm outline-none focus:border-cyan-400/70" />
              </label>
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Objectif de progression</span>
                <select value={draft.objective_type} onChange={(event) => updateDraft('objective_type', event.target.value as ObjectiveType)} className="w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm outline-none focus:border-cyan-400/70">
                  {Object.entries(objectiveTypeLabels).map(([type, label]) => <option key={type} value={type}>{label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Nombre à atteindre</span>
                <input type="number" min={1} max={1000000} step={1} required value={draft.target_count} onChange={(event) => updateDraft('target_count', Number(event.target.value))} className="w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm outline-none focus:border-cyan-400/70" />
              </label>
              {draft.objective_type === 'rarity_card' && (
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Rareté requise</span>
                  <select value={draft.required_rarity} onChange={(event) => updateDraft('required_rarity', event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm outline-none focus:border-cyan-400/70">
                    {rarities.map((rarity) => <option key={rarity} value={rarity}>{rarity}</option>)}
                  </select>
                </label>
              )}
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Récompense AP</span>
                <input type="number" min={0} max={1000000} step={1} required value={draft.reward_ap} onChange={(event) => updateDraft('reward_ap', Number(event.target.value))} className="w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm outline-none focus:border-cyan-400/70" />
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 sm:col-span-2">
                <input type="checkbox" checked={draft.is_active} onChange={(event) => updateDraft('is_active', event.target.checked)} className="h-4 w-4 accent-cyan-300" />
                <span className="text-sm text-slate-200">Publier cet objectif immédiatement</span>
              </label>
            </div>

            <p className="rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-3 text-xs leading-5 text-amber-100/70">
              Les nouvelles définitions s’appliquent aux joueurs à partir de leur création. Une désactivation conserve les progressions déjà enregistrées ; une récompense ne peut être réclamée qu’une seule fois.
            </p>
            {feedback && (
              <p role={feedback.type === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${feedback.type === 'error' ? 'border-red-400/20 bg-red-400/10 text-red-200' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'}`}>
                {feedback.text}
              </p>
            )}
            <div className="flex justify-end border-t border-white/[0.07] pt-5">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60">
                <Save size={16} /> {saving ? 'Enregistrement…' : selected ? 'Enregistrer les modifications' : 'Créer l’objectif'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
