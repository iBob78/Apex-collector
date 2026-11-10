'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, CircleOff, ClipboardList, Plus, Save, Trophy } from 'lucide-react';
import { PACKS } from '@/lib/boosters';
import {
  type ObjectiveCardCategory,
  type ObjectiveCategory,
  type ObjectiveDefinition,
  type ObjectiveRequirementOperator,
  type ObjectiveType,
  type ObjectiveRewardMode,
  describeObjectiveReward,
} from '@/lib/actions/objectives';
import {
  createObjective,
  setObjectiveActive,
  updateObjective,
  type ObjectiveDraft,
  type ObjectiveRequirementDraft,
} from './actions';

const rarities = ['Common', 'Uncommon', 'Atypique', 'Rare', 'Very rare', 'Epic', 'Legend', 'Mythic', 'Icon'];
const objectiveTypeLabels: Record<ObjectiveType, string> = {
  booster_open: 'Ouvrir des boosters',
  collection_count: 'Collectionner des cartes',
  rarity_card: 'Obtenir une carte d’une rareté',
  marketplace_listing: 'Créer une annonce Marketplace',
  circuit_collection: 'Collectionner des circuits',
  daily_login: 'Se connecter des jours différents',
  collection_requirement: 'Posséder des cartes selon des conditions',
  showroom_first: 'Exposer sa première carte dans le showroom',
};
export type ObjectiveCatalogs = {
  vehicles: { card_id: string; make: string; model: string; year: number; rarity: string; fuel_type: string | null; transmission: string | null; collection_number: number }[];
  circuits: { circuit_id: string; name: string; country: string | null; year: number | null; rarity: string; type: string | null; collection_number: number }[];
  drivers: { driver_id: string; name: string; year: number; country: string; rarity: string; collection_number: number }[];
};

const emptyRequirement = (category: ObjectiveCardCategory = 'vehicle'): ObjectiveRequirementDraft => ({
  category,
  card_id: '',
  item_label: '',
  make: '',
  model: '',
  year: '',
  rarity: '',
  country: '',
  type: '',
  fuel_type: '',
  transmission: '',
  count_mode: 'copies',
  target_count: 1,
});

const blankDraft: ObjectiveDraft = {
  category: 'contract',
  title: '',
  description: '',
  objective_type: 'booster_open',
  target_count: 1,
  required_rarity: 'Icon',
  requirements: [],
  requirement_operator: 'all',
  reward_ap: 100,
  reward_mode: 'ac',
  reward_booster_slug: 'random',
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
    requirements: objective.requirements ?? [],
    requirement_operator: objective.requirement_operator ?? 'all',
    reward_ap: objective.reward_ap,
    reward_mode: objective.reward_mode ?? 'ac',
    reward_booster_slug: objective.reward_booster_slug ?? 'random',
    is_active: objective.is_active,
  };
}

function uniqueOptions(values: (string | number | null | undefined)[]) {
  return Array.from(new Set(values.filter((value): value is string | number => value !== null && value !== undefined && String(value).trim() !== '').map(String)))
    .sort((left, right) => left.localeCompare(right, 'fr', { numeric: true }));
}

function requirementLabel(requirement: ObjectiveRequirementDraft) {
  const category = requirement.category === 'vehicle' ? 'Véhicules' : requirement.category === 'circuit' ? 'Circuits' : 'Pilotes';
  const details = [
    requirement.item_label,
    requirement.make,
    requirement.model,
    requirement.year,
    requirement.country,
    requirement.type,
    requirement.fuel_type,
    requirement.transmission,
    requirement.rarity,
  ].filter(Boolean);
  return `${category} · ${details.join(' · ') || 'Toutes les cartes correspondantes'}`;
}

export default function ObjectiveStudio({
  initialObjectives,
  catalogs,
}: {
  initialObjectives: ObjectiveDefinition[];
  catalogs: ObjectiveCatalogs;
}) {
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
    setDraft((current) => ({
      ...current,
      [field]: value,
      ...(field === 'objective_type' && value === 'collection_requirement' && current.requirements.length === 0
        ? { requirements: [emptyRequirement()] }
        : {}),
    }));
    setFeedback(null);
  };

  const updateRequirement = <K extends keyof ObjectiveRequirementDraft>(
    index: number,
    field: K,
    value: ObjectiveRequirementDraft[K],
  ) => {
    setDraft((current) => ({
      ...current,
      requirements: current.requirements.map((requirement, requirementIndex) => {
        if (requirementIndex !== index) return requirement;
        if (field === 'category') {
          return { ...emptyRequirement(value as ObjectiveCardCategory), target_count: requirement.target_count, count_mode: requirement.count_mode };
        }
        return { ...requirement, [field]: value };
      }),
    }));
    setFeedback(null);
  };

  const catalogEntries = (cardCategory: ObjectiveCardCategory) => {
    if (cardCategory === 'vehicle') {
      return catalogs.vehicles.map((card) => ({
        id: card.card_id,
        label: `#${card.collection_number} · ${card.make} ${card.model} (${card.year})`,
      }));
    }
    if (cardCategory === 'circuit') {
      return catalogs.circuits.map((circuit) => ({
        id: circuit.circuit_id,
        label: `#${circuit.collection_number} · ${circuit.name} (${circuit.country || 'Pays inconnu'})`,
      }));
    }
    return catalogs.drivers.map((driver) => ({
      id: driver.driver_id,
      label: `#${driver.collection_number} · ${driver.name} (${driver.year})`,
    }));
  };

  const requirementOptions = (requirement: ObjectiveRequirementDraft, field: 'make' | 'model' | 'year' | 'rarity' | 'country' | 'type' | 'fuel_type' | 'transmission') => {
    if (requirement.category === 'vehicle') {
      const vehicles = catalogs.vehicles.filter((card) => !requirement.make || card.make === requirement.make);
      if (field === 'make') return uniqueOptions(catalogs.vehicles.map((card) => card.make));
      if (field === 'model') return uniqueOptions(vehicles.map((card) => card.model));
      if (field === 'year') return uniqueOptions(vehicles.map((card) => card.year));
      if (field === 'rarity') return uniqueOptions(vehicles.map((card) => card.rarity));
      if (field === 'fuel_type') return uniqueOptions(catalogs.vehicles.map((card) => card.fuel_type));
      if (field === 'transmission') return uniqueOptions(catalogs.vehicles.map((card) => card.transmission));
      return [];
    }
    if (requirement.category === 'circuit') {
      if (field === 'country') return uniqueOptions(catalogs.circuits.map((circuit) => circuit.country));
      if (field === 'year') return uniqueOptions(catalogs.circuits.map((circuit) => circuit.year));
      if (field === 'type') return uniqueOptions(catalogs.circuits.map((circuit) => circuit.type));
      if (field === 'rarity') return uniqueOptions(catalogs.circuits.map((circuit) => circuit.rarity));
      return [];
    }
    if (field === 'country') return uniqueOptions(catalogs.drivers.map((driver) => driver.country));
    if (field === 'year') return uniqueOptions(catalogs.drivers.map((driver) => driver.year));
    if (field === 'rarity') return uniqueOptions(catalogs.drivers.map((driver) => driver.rarity));
    return [];
  };

  const renderRequirementFilter = (
    index: number,
    requirement: ObjectiveRequirementDraft,
    field: 'make' | 'model' | 'year' | 'rarity' | 'country' | 'type' | 'fuel_type' | 'transmission',
    label: string,
  ) => (
    <label key={field} className="block">
      <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <select
        value={requirement[field]}
        onChange={(event) => updateRequirement(index, field, event.target.value)}
        className="w-full rounded-lg border border-white/10 bg-[#090c11] px-3 py-2.5 text-xs outline-none focus:border-cyan-400/70"
      >
        <option value="">Tous</option>
        {requirementOptions(requirement, field).map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );

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
            Crée et modifie les objectifs, leur progression et leur récompense en AC. Désactive un objectif pour le retirer du jeu sans effacer l’historique des joueurs.
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
                      {objectiveTypeLabels[objective.objective_type]}
                      {objective.objective_type === 'collection_requirement'
                        ? ` · ${objective.requirements?.length ?? 0} conditions · ${objective.requirement_operator === 'any' ? 'OU' : 'ET'}`
                        : ` · cible ${objective.target_count}`}
                      {' · '}{describeObjectiveReward(objective)}
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
              {draft.objective_type !== 'collection_requirement' && <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Nombre à atteindre</span>
                <input type="number" min={1} max={1000000} step={1} required value={draft.target_count} onChange={(event) => updateDraft('target_count', event.target.value === '' ? '' : Number(event.target.value))} className="w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm outline-none focus:border-cyan-400/70" />
              </label>}
              {draft.objective_type === 'rarity_card' && (
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Rareté requise</span>
                  <select value={draft.required_rarity} onChange={(event) => updateDraft('required_rarity', event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm outline-none focus:border-cyan-400/70">
                    {rarities.map((rarity) => <option key={rarity} value={rarity}>{rarity}</option>)}
                  </select>
                </label>
              )}
              {draft.objective_type === 'collection_requirement' && (
                <section className="space-y-4 sm:col-span-2" aria-label="Conditions de collection">
                  <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.04] p-4">
                    <h3 className="text-sm font-black text-cyan-100">Conditions de collection</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      La progression se base sur les cartes actuellement possédées et inclut les véhicules, circuits et pilotes.
                    </p>
                  </div>
                  <label className="block">
                    <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Combinaison des conditions</span>
                    <select
                      value={draft.requirement_operator}
                      onChange={(event) => updateDraft('requirement_operator', event.target.value as ObjectiveRequirementOperator)}
                      className="w-full rounded-lg border border-white/10 bg-[#090c11] px-3 py-2.5 text-xs outline-none focus:border-cyan-400/70 sm:max-w-sm"
                    >
                      <option value="all">Toutes les conditions (ET)</option>
                      <option value="any">Au moins une condition (OU)</option>
                    </select>
                  </label>
                  {draft.requirements.map((requirement, index) => {
                    const categoryCatalog = catalogEntries(requirement.category);
                    const filterFields = requirement.category === 'vehicle'
                      ? [
                          ['make', 'Marque'],
                          ['model', 'Modèle'],
                          ['year', 'Année'],
                          ['rarity', 'Rareté'],
                          ['fuel_type', 'Carburant'],
                          ['transmission', 'Transmission'],
                        ] as const
                      : requirement.category === 'circuit'
                        ? [
                            ['country', 'Pays'],
                            ['year', 'Année'],
                            ['type', 'Type de circuit'],
                            ['rarity', 'Rareté'],
                          ] as const
                        : [
                            ['country', 'Pays'],
                            ['year', 'Saison'],
                            ['rarity', 'Rareté'],
                          ] as const;
                    return (
                      <fieldset key={`requirement-${index}`} className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                        <legend className="px-2 text-xs font-black text-slate-200">Condition {index + 1}</legend>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <label className="block">
                            <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Catégorie</span>
                            <select
                              value={requirement.category}
                              onChange={(event) => updateRequirement(index, 'category', event.target.value as ObjectiveCardCategory)}
                              className="w-full rounded-lg border border-white/10 bg-[#090c11] px-3 py-2.5 text-xs outline-none focus:border-cyan-400/70"
                            >
                              <option value="vehicle">Véhicules</option>
                              <option value="circuit">Circuits</option>
                              <option value="driver">Pilotes</option>
                            </select>
                          </label>
                          <label className="block">
                            <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Carte précise (facultatif)</span>
                            <select
                              value={requirement.card_id}
                              onChange={(event) => {
                                const entry = categoryCatalog.find((item) => item.id === event.target.value);
                                updateRequirement(index, 'card_id', event.target.value);
                                updateRequirement(index, 'item_label', entry?.label ?? '');
                              }}
                              className="w-full rounded-lg border border-white/10 bg-[#090c11] px-3 py-2.5 text-xs outline-none focus:border-cyan-400/70"
                            >
                              <option value="">Toutes les cartes correspondant aux filtres</option>
                              {categoryCatalog.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
                            </select>
                          </label>
                          {filterFields.map(([field, label]) => renderRequirementFilter(index, requirement, field, label))}
                          <label className="block">
                            <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Mode de comptage</span>
                            <select
                              value={requirement.count_mode}
                              onChange={(event) => updateRequirement(index, 'count_mode', event.target.value as ObjectiveRequirementDraft['count_mode'])}
                              className="w-full rounded-lg border border-white/10 bg-[#090c11] px-3 py-2.5 text-xs outline-none focus:border-cyan-400/70"
                            >
                              <option value="copies">Exemplaires (doublons inclus)</option>
                              <option value="unique">Cartes différentes (sans doublons)</option>
                            </select>
                          </label>
                          <label className="block">
                            <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
                              {requirement.count_mode === 'copies' ? 'Nombre d’exemplaires' : 'Nombre de cartes différentes'}
                            </span>
                            <input
                              type="number"
                              min={1}
                              max={1000000}
                              step={1}
                              required
                              value={requirement.target_count}
                              onChange={(event) => updateRequirement(index, 'target_count', event.target.value === '' ? '' : Number(event.target.value))}
                              className="w-full rounded-lg border border-white/10 bg-[#090c11] px-3 py-2.5 text-xs outline-none focus:border-cyan-400/70"
                            />
                          </label>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
                          <p className="text-[10px] leading-4 text-slate-500">{requirementLabel(requirement)}</p>
                          <button
                            type="button"
                            onClick={() => updateDraft('requirements', draft.requirements.filter((_, itemIndex) => itemIndex !== index))}
                            disabled={draft.requirements.length <= 1}
                            className="rounded-lg border border-red-400/15 px-2.5 py-1.5 text-[10px] font-bold text-red-200 disabled:opacity-40"
                          >
                            Supprimer
                          </button>
                        </div>
                      </fieldset>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => updateDraft('requirements', [...draft.requirements, emptyRequirement()])}
                    disabled={draft.requirements.length >= 20}
                    className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 px-4 py-2.5 text-xs font-bold text-cyan-100 hover:bg-cyan-300/5 disabled:opacity-40"
                  >
                    <Plus size={14} /> Ajouter une condition
                  </button>
                </section>
              )}
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Type de récompense</span>
                <select value={draft.reward_mode} onChange={(event) => updateDraft('reward_mode', event.target.value as ObjectiveRewardMode)} className="w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm outline-none focus:border-cyan-400/70">
                  <option value="ac">AC seulement</option>
                  <option value="booster">Booster seulement</option>
                  <option value="both">AC ET booster (les deux)</option>
                  <option value="either">AC OU booster (tirage 50/50)</option>
                </select>
              </label>
              {draft.reward_mode !== 'booster' && (
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Récompense AC</span>
                  <input type="number" min={draft.reward_mode === 'ac' ? 0 : 1} max={1000000} step={1} required value={draft.reward_ap} onChange={(event) => updateDraft('reward_ap', event.target.value === '' ? '' : Number(event.target.value))} className="w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm outline-none focus:border-cyan-400/70" />
                </label>
              )}
              {draft.reward_mode !== 'ac' && (
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Type de booster</span>
                  <select value={draft.reward_booster_slug} onChange={(event) => updateDraft('reward_booster_slug', event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm outline-none focus:border-cyan-400/70">
                    <option value="random">Aléatoire (tous les packs)</option>
                    {Object.values(PACKS).map((pack) => <option key={pack.slug} value={pack.slug}>{pack.name}</option>)}
                  </select>
                </label>
              )}
              {draft.reward_mode === 'either' && (
                <p className="text-xs leading-5 text-slate-400 sm:col-span-2">
                  OU : la réclamation tire au sort soit les AC, soit un booster (50/50). ET : les deux sont offerts.
                </p>
              )}
              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 sm:col-span-2">
                <input type="checkbox" checked={draft.is_active} onChange={(event) => updateDraft('is_active', event.target.checked)} className="h-4 w-4 accent-cyan-300" />
                <span className="text-sm text-slate-200">Publier cet objectif immédiatement</span>
              </label>
            </div>

            <p className="rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-3 text-xs leading-5 text-amber-100/70">
              Les nouveaux objectifs sont attribués aux joueurs existants et futurs. Les conditions de collection se vérifient sur l’inventaire actuel. Les AC et boosters sont crédités ensemble en mode ET, ou tirés au sort en mode OU. Une récompense ne peut être réclamée qu’une seule fois.
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
