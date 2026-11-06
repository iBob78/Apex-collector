'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Flag,
  Image as ImageIcon,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { getRarityColor } from '@/lib/rarity';
import { resolveCardImage, resolveCountryFlag, IMAGE_PATHS } from '@/lib/images';
import SafeImage from '@/components/SafeImage';
import {
  createCircuit,
  addCircuitType,
  deleteCircuitType,
  renameCircuitType,
  updateCircuit,
  type CircuitData,
  type CircuitDraft,
  type CircuitTypeResult,
} from '../cards/actions';

const rarities = ['Common', 'Uncommon', 'Atypique', 'Rare', 'Very rare', 'Epic', 'Legend', 'Mythic', 'Icon'];

const emptyDraft: CircuitDraft = {
  name: '',
  country: '',
  country_code: '',
  year: '',
  rarity: 'Common',
  type: '',
  length_km: '',
  turns: '',
  straight_km: '',
  image_url: '',
};

function toDraft(circuit: CircuitData): CircuitDraft {
  return {
    name: circuit.name ?? '',
    country: circuit.country ?? '',
    country_code: circuit.country_code ?? '',
    year: circuit.year === null ? '' : String(circuit.year),
    rarity: circuit.rarity ?? 'Common',
    type: circuit.type ?? '',
    length_km: circuit.length_km === null ? '' : String(circuit.length_km),
    turns: circuit.turns === null ? '' : String(circuit.turns),
    straight_km: circuit.straight_km === null ? '' : String(circuit.straight_km),
    image_url: circuit.image_url ?? '',
  };
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  step,
  min,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'number' | 'url';
  step?: string;
  min?: string;
  hint?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}{required && <span className="ml-1 text-cyan-300">*</span>}
      </span>
      <input
        className="w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        step={step}
        min={min}
      />
      {hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export default function CircuitStudio({
  initialCircuits,
  initialCircuitTypes,
}: {
  initialCircuits: CircuitData[];
  initialCircuitTypes: string[];
}) {
  const [circuits, setCircuits] = useState(initialCircuits);
  const [circuitTypes, setCircuitTypes] = useState(initialCircuitTypes);
  const [draft, setDraft] = useState<CircuitDraft>(emptyDraft);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newCircuitType, setNewCircuitType] = useState('');
  const [editingCircuitType, setEditingCircuitType] = useState<string | null>(null);
  const [editedCircuitType, setEditedCircuitType] = useState('');
  const [circuitTypePending, setCircuitTypePending] = useState(false);
  const [circuitTypeFeedback, setCircuitTypeFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => setCircuits(initialCircuits), [initialCircuits]);
  useEffect(() => setCircuitTypes(initialCircuitTypes), [initialCircuitTypes]);

  const selectedCircuit = circuits.find((circuit) => circuit.id === selectedId) ?? null;
  const filteredCircuits = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return circuits;
    return circuits.filter((circuit) =>
      `${circuit.name} ${circuit.country ?? ''} ${circuit.country_code ?? ''} ${circuit.type ?? ''} ${circuit.rarity}`.toLowerCase().includes(query),
    );
  }, [circuits, filter]);

  const setField = (field: keyof CircuitDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setFeedback(null);
  };

  const startNewCircuit = () => {
    setSelectedId(null);
    setDraft(emptyDraft);
    setFeedback(null);
  };

  const selectCircuit = (circuit: CircuitData) => {
    setSelectedId(circuit.id);
    setDraft(toDraft(circuit));
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    const result = selectedId
      ? await updateCircuit(selectedId, draft)
      : await createCircuit(draft);

    setSaving(false);
    if (!result.success) {
      setFeedback({ type: 'error', text: result.error });
      return;
    }

    setCircuits((current) => {
      const exists = current.some((circuit) => circuit.id === result.circuit.id);
      return exists
        ? current.map((circuit) => circuit.id === result.circuit.id ? result.circuit : circuit)
        : [result.circuit, ...current];
    });
    setSelectedId(result.circuit.id);
    setDraft(toDraft(result.circuit));
    setFeedback({ type: 'success', text: selectedId ? 'Modifications enregistrées.' : 'Circuit créé dans le catalogue.' });
  };

  const updateCircuitTypeReferences = (oldName: string, newName: string | null) => {
    setCircuits((current) => current.map((circuit) => circuit.type === oldName
      ? { ...circuit, type: newName }
      : circuit));
    setDraft((current) => current.type === oldName
      ? { ...current, type: newName ?? '' }
      : current);
  };

  const handleAddCircuitType = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (circuitTypePending) return;
    setCircuitTypePending(true);
    setCircuitTypeFeedback(null);
    const result = await addCircuitType(newCircuitType);
    setCircuitTypePending(false);
    if (!result.success) {
      setCircuitTypeFeedback({ type: 'error', text: result.error });
      return;
    }
    setCircuitTypes((current) => [...current, result.name]);
    setNewCircuitType('');
    setCircuitTypeFeedback({ type: 'success', text: `« ${result.name} » a été ajouté.` });
  };

  const handleRenameCircuitType = async (currentName: string) => {
    if (circuitTypePending) return;
    setCircuitTypePending(true);
    setCircuitTypeFeedback(null);
    const result = await renameCircuitType(currentName, editedCircuitType);
    setCircuitTypePending(false);
    if (!result.success) {
      setCircuitTypeFeedback({ type: 'error', text: result.error });
      return;
    }
    setCircuitTypes((current) => current.map((name) => name === currentName ? result.name : name));
    updateCircuitTypeReferences(currentName, result.name);
    setEditingCircuitType(null);
    setEditedCircuitType('');
    setCircuitTypeFeedback({ type: 'success', text: `« ${currentName} » a été renommé en « ${result.name} ».` });
  };

  const handleDeleteCircuitType = async (name: string) => {
    if (circuitTypePending || !window.confirm(`Supprimer « ${name} » de la liste ? Les circuits qui utilisent ce type ne l’afficheront plus.`)) return;
    setCircuitTypePending(true);
    setCircuitTypeFeedback(null);
    const result: CircuitTypeResult = await deleteCircuitType(name);
    setCircuitTypePending(false);
    if (!result.success) {
      setCircuitTypeFeedback({ type: 'error', text: result.error });
      return;
    }
    setCircuitTypes((current) => current.filter((item) => item !== name));
    updateCircuitTypeReferences(name, null);
    setCircuitTypeFeedback({ type: 'success', text: `« ${name} » a été supprimé.` });
  };

  const rarityColor = getRarityColor(draft.rarity);
  const previewImage = resolveCardImage({
    category: 'circuit',
    name: draft.name,
    year: draft.year,
    image_url: draft.image_url,
  });
  const previewCountryFlag = resolveCountryFlag(draft.country_code || draft.country);

  return (
    <main className="min-h-screen overflow-hidden bg-[#07090d] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_72%_0%,rgba(14,165,233,0.12),transparent_40%),radial-gradient(ellipse_at_0%_40%,rgba(30,64,175,0.08),transparent_36%)]" />
      <div className="relative mx-auto max-w-[1500px] px-4 pb-16 sm:px-6 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] py-5">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-white">
            <ArrowLeft size={16} /> Retour au garage
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-300">
            <ShieldCheck size={14} /> Atelier administrateur
          </div>
        </header>

        <section className="flex flex-col justify-between gap-6 py-8 sm:py-10 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">
              <Sparkles size={14} /> Apex Collector · Circuits
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Atelier <span className="text-cyan-300">circuits</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              Crée un tracé ou modifie ses informations, sa rareté et ses caractéristiques.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            <div className="text-2xl font-black tabular-nums">{circuits.length}</div>
            <div className="text-[10px] font-bold uppercase leading-4 tracking-[0.16em] text-slate-500">circuits<br />au catalogue</div>
          </div>
        </section>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="/admin/cards" className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-slate-400 transition hover:bg-white/5 hover:text-white">Cartes véhicule</Link>
          <Link href="/admin/circuits" className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2.5 text-xs font-bold text-cyan-200">Cartes circuit</Link>
          <Link href="/admin/drivers" className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-slate-400 transition hover:bg-white/5 hover:text-white">Cartes pilote</Link>
          <Link href="/admin/suggestions" className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-2.5 text-xs font-bold text-amber-200 transition hover:bg-amber-300/10">Suggestions joueurs</Link>
          <Link href="/admin/objectives" className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-slate-400 transition hover:bg-white/5 hover:text-white">Succès & contrats</Link>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <form onSubmit={handleSubmit} className="min-w-0 space-y-5">
            <section className="rounded-3xl border border-white/[0.08] bg-[#0d1118]/90 p-5 shadow-2xl shadow-black/20 sm:p-7">
              <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    {selectedCircuit ? `#${selectedCircuit.collection_number} · Édition` : 'Numéro attribué automatiquement à la création'}
                  </p>
                  <h2 className="mt-1 text-xl font-black">{selectedCircuit ? 'Modifier le circuit' : 'Identité du circuit'}</h2>
                </div>
                {selectedCircuit && (
                  <button type="button" onClick={startNewCircuit} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-white">
                    <Plus size={14} /> Nouveau circuit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <TextField label="Nom du circuit" value={draft.name} onChange={(value) => setField('name', value)} placeholder="Circuit de Spa-Francorchamps" required />
                <TextField label="Pays" value={draft.country} onChange={(value) => setField('country', value)} placeholder="Belgique" />
                <TextField label="Code pays / drapeau" value={draft.country_code} onChange={(value) => setField('country_code', value)} placeholder="🇧🇪 ou BE" />
                <TextField label="Année" value={draft.year} onChange={(value) => setField('year', value)} type="number" min="1900" step="1" placeholder="1950" />
                <label className="block min-w-0">
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Rareté</span>
                  <select value={draft.rarity} onChange={(event) => setField('rarity', event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10">
                    {rarities.map((rarity) => <option key={rarity} value={rarity}>{rarity}</option>)}
                  </select>
                </label>
                <label className="block min-w-0">
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Type de tracé</span>
                  <select value={draft.type} onChange={(event) => setField('type', event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10">
                    <option value="">Non défini</option>
                    {circuitTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </label>
                <TextField label="URL de l’image" value={draft.image_url} onChange={(value) => setField('image_url', value)} placeholder="assets/cards/circuit/spa-francorchamps-2012.jpg" hint="Clé Supabase (ex. assets/cards/circuit/…), URL publique ou chemin local commençant par /" />
              </div>

              <div className="mb-7 mt-9">
                <p className="mb-5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">01 — caractéristiques du tracé</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <TextField label="Longueur" value={draft.length_km} onChange={(value) => setField('length_km', value)} type="number" min="0" step="any" placeholder="7.004" hint="Kilomètres" />
                  <TextField label="Virages" value={draft.turns} onChange={(value) => setField('turns', value)} type="number" min="0" step="1" placeholder="19" hint="Nombre total" />
                  <TextField label="Ligne droite" value={draft.straight_km} onChange={(value) => setField('straight_km', value)} type="number" min="0" step="any" placeholder="1.8" hint="Kilomètres" />
                </div>
              </div>

              {feedback && (
                <p role={feedback.type === 'error' ? 'alert' : 'status'} className={`mb-5 rounded-xl border px-4 py-3 text-sm ${feedback.type === 'error' ? 'border-red-400/20 bg-red-400/10 text-red-200' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'}`}>
                  {feedback.text}
                </p>
              )}
              <div className="flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500"><span className="text-cyan-300">*</span> Champ obligatoire</p>
                <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60">
                  {saving ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />}
                  {saving ? 'Enregistrement…' : selectedCircuit ? 'Enregistrer les modifications' : 'Créer le circuit'}
                </button>
              </div>
            </section>
          </form>

          <aside className="space-y-5 xl:sticky xl:top-5">
            <section className="rounded-3xl border border-white/[0.08] bg-[#0d1118]/90 p-5 shadow-2xl shadow-black/20">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Aperçu en direct</p>
                  <h2 className="mt-1 text-lg font-black">Face de la carte</h2>
                </div>
                <ImageIcon size={18} className="text-slate-500" />
              </div>
              <div className="relative mx-auto aspect-[2/3] w-full max-w-[250px] overflow-hidden rounded-2xl border-[3px] bg-[#111923] shadow-2xl" style={{ borderColor: rarityColor, boxShadow: `0 0 32px ${rarityColor}24` }}>
                {previewImage ? (
                  <SafeImage
                    src={previewImage}
                    fallback={IMAGE_PATHS.PLACEHOLDERS.CIRCUIT_CARD}
                    alt="Aperçu du circuit"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_50%_35%,rgba(34,211,238,0.2),transparent_50%),linear-gradient(145deg,#172333,#080b10_70%)]">
                    <Flag size={42} className="text-white/20" />
                    <span className="mt-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Visuel circuit</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/10" />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                  <div className="rounded-lg border border-white/10 bg-black/55 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-white backdrop-blur">{draft.rarity}</div>
                  {previewCountryFlag ? (
                    <div className="relative h-6 w-9 overflow-hidden rounded-sm border border-white/40 bg-black/50 shadow-lg">
                      <SafeImage
                        src={previewCountryFlag}
                        alt={`Drapeau ${draft.country || draft.country_code}`}
                        fill
                        showPlaceholderOnError={false}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="text-xl drop-shadow-lg" aria-label="Drapeau non renseigné">🏁</div>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="line-clamp-2 text-lg font-black uppercase tracking-wide">{draft.name || 'NOM DU CIRCUIT'}</p>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-300">{draft.country || 'Pays'}{draft.year ? ` · ${draft.year}` : ''}</p>
                  <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-2 border-t border-white/20 pt-3 text-[10px] font-bold text-slate-100">
                    <span>↻ {draft.length_km || '—'} km</span>
                    <span>⌁ {draft.turns || '—'} virages</span>
                    <span>⇢ {draft.straight_km || '—'} km droit</span>
                    <span>{draft.type || 'Circuit'}</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-slate-500">L’aperçu se met à jour pendant la saisie.</p>
            </section>

            <section className="rounded-3xl border border-white/[0.08] bg-[#0d1118]/90 p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Catalogue</p>
                  <h2 className="mt-1 text-lg font-black">Circuits existants</h2>
                </div>
                <span className="rounded-lg bg-white/5 px-2 py-1 text-xs font-bold text-slate-400">{filteredCircuits.length}</span>
              </div>
              <label className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-[#090c11] px-3">
                <Search size={15} className="shrink-0 text-slate-500" />
                <input aria-label="Rechercher un circuit" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Nom, pays, type…" className="min-w-0 flex-1 bg-transparent py-2.5 text-xs text-white outline-none placeholder:text-slate-600" />
                {filter && <button type="button" aria-label="Effacer la recherche" onClick={() => setFilter('')}><X size={14} className="text-slate-500 hover:text-white" /></button>}
              </label>
              <div className="max-h-[390px] space-y-1 overflow-y-auto pr-1">
                {filteredCircuits.length ? filteredCircuits.map((circuit) => (
                  <button key={circuit.id} type="button" onClick={() => selectCircuit(circuit)} className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${selectedId === circuit.id ? 'border-cyan-400/30 bg-cyan-400/[0.07]' : 'border-transparent hover:border-white/[0.08] hover:bg-white/[0.03]'}`}>
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: getRarityColor(circuit.rarity) }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-slate-100">{circuit.name}</span>
                      <span className="mt-1 block truncate text-[10px] text-slate-500">
                        {[`#${circuit.collection_number}`, circuit.country || circuit.country_code || 'Pays non défini', circuit.year, circuit.type || circuit.rarity]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                    {selectedId === circuit.id ? <Check size={15} className="text-cyan-300" /> : <ChevronRight size={15} className="text-slate-600 transition group-hover:text-slate-300" />}
                  </button>
                )) : (
                  <p className="px-3 py-6 text-center text-xs text-slate-500">Aucun circuit ne correspond à cette recherche.</p>
                )}
              </div>
              {!selectedId && circuits.length === 0 && (
                <button type="button" onClick={startNewCircuit} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-3 text-xs font-bold text-slate-400 hover:border-cyan-300/40 hover:text-cyan-200">
                  <Plus size={15} /> Créer le premier circuit
                </button>
              )}
            </section>
            <section className="rounded-3xl border border-white/[0.08] bg-[#0d1118]/90 p-5 shadow-2xl shadow-black/20">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Liste des types</p>
              <h2 className="mt-1 text-lg font-black">Gérer les types de tracé</h2>
              <p className="mt-2 text-xs leading-5 text-slate-400">Renommer un type met à jour les circuits concernés. Le supprimer retire ce type de ces circuits.</p>
              <form onSubmit={handleAddCircuitType} className="mt-4 flex gap-2">
                <input
                  aria-label="Nouveau type de tracé"
                  value={newCircuitType}
                  onChange={(event) => setNewCircuitType(event.target.value)}
                  maxLength={40}
                  placeholder="Ajouter un type"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#090c11] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/70"
                />
                <button
                  type="submit"
                  disabled={circuitTypePending || !newCircuitType.trim()}
                  aria-label="Ajouter le type de tracé"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200 transition hover:bg-cyan-300/20 disabled:opacity-50"
                >
                  {circuitTypePending ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />}
                </button>
              </form>
              <div className="mt-3 max-h-72 space-y-1 overflow-y-auto pr-1">
                {circuitTypes.map((name) => (
                  <div key={name} className="flex items-center gap-2 rounded-lg border border-white/[0.06] px-2 py-1.5">
                    {editingCircuitType === name ? (
                      <>
                        <input
                          aria-label={`Renommer ${name}`}
                          value={editedCircuitType}
                          onChange={(event) => setEditedCircuitType(event.target.value)}
                          maxLength={40}
                          className="min-w-0 flex-1 rounded-md border border-white/10 bg-[#090c11] px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-400/70"
                        />
                        <button
                          type="button"
                          disabled={circuitTypePending || !editedCircuitType.trim()}
                          onClick={() => void handleRenameCircuitType(name)}
                          aria-label={`Enregistrer le renommage de ${name}`}
                          className="rounded-md p-1.5 text-emerald-300 hover:bg-emerald-300/10 disabled:opacity-50"
                        >
                          {circuitTypePending ? <LoaderCircle size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingCircuitType(null); setEditedCircuitType(''); }}
                          aria-label={`Annuler le renommage de ${name}`}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-200">{name}</span>
                        <button
                          type="button"
                          onClick={() => { setEditingCircuitType(name); setEditedCircuitType(name); }}
                          aria-label={`Renommer ${name}`}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={circuitTypePending}
                          onClick={() => void handleDeleteCircuitType(name)}
                          aria-label={`Supprimer ${name}`}
                          className="rounded-md p-1.5 text-red-300 hover:bg-red-300/10 disabled:opacity-50"
                        >
                          {circuitTypePending ? <LoaderCircle size={14} className="animate-spin" /> : <X size={14} />}
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
              {circuitTypeFeedback && (
                <p role={circuitTypeFeedback.type === 'error' ? 'alert' : 'status'} className={`mt-3 text-xs ${circuitTypeFeedback.type === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>
                  {circuitTypeFeedback.text}
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
