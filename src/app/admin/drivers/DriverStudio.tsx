'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Crown,
  Image as ImageIcon,
  LoaderCircle,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { getRarityColor } from '@/lib/rarity';
import { resolveCardImage, resolveCountryFlag, IMAGE_PATHS } from '@/lib/images';
import SafeImage from '@/components/SafeImage';
import { getDriverAgeAtCardYear } from '@/lib/driverCards';
import { createDriver, updateDriver, type DriverData, type DriverDraft } from './actions';

const rarities = ['Common', 'Uncommon', 'Atypique', 'Rare', 'Very rare', 'Epic', 'Legend', 'Mythic', 'Icon'];

const emptyDraft: DriverDraft = {
  name: '',
  year: String(new Date().getFullYear()),
  birth_date: '',
  country: '',
  country_code: '',
  world_championships: '0',
  won_monaco_gp: false,
  won_indy_500: false,
  won_24h_le_mans: false,
  rarity: 'Common',
  image_url: '',
  description: '',
  is_active: true,
  booster_enabled: true,
};

function toDraft(driver: DriverData): DriverDraft {
  return {
    name: driver.name ?? '',
    year: String(driver.year),
    birth_date: driver.birth_date ?? '',
    country: driver.country ?? '',
    country_code: driver.country_code ?? '',
    world_championships: String(driver.world_championships ?? 0),
    won_monaco_gp: driver.won_monaco_gp,
    won_indy_500: driver.won_indy_500,
    won_24h_le_mans: driver.won_24h_le_mans,
    rarity: driver.rarity ?? 'Common',
    image_url: driver.image_url ?? '',
    description: driver.description ?? '',
    is_active: driver.is_active,
    booster_enabled: driver.booster_enabled,
  };
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  readOnly = false,
  type = 'text',
  min,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  type?: 'text' | 'number' | 'date' | 'url';
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
        readOnly={readOnly}
        min={min}
        step={type === 'number' ? '1' : undefined}
      />
      {hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm text-slate-200">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-cyan-300"
      />
    </label>
  );
}

export default function DriverStudio({ initialDrivers }: { initialDrivers: DriverData[] }) {
  const [drivers, setDrivers] = useState(initialDrivers);
  const [draft, setDraft] = useState(emptyDraft);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => setDrivers(initialDrivers), [initialDrivers]);

  const selectedDriver = drivers.find((driver) => driver.id === selectedId) ?? null;
  const filteredDrivers = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return drivers;
    return drivers.filter((driver) =>
      `${driver.name} ${driver.country} ${driver.country_code ?? ''} ${driver.year}`.toLowerCase().includes(query),
    );
  }, [drivers, filter]);

  const setField = <K extends keyof DriverDraft>(field: K, value: DriverDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setFeedback(null);
  };

  const startNewDriver = () => {
    setSelectedId(null);
    setDraft(emptyDraft);
    setFeedback(null);
  };

  const selectDriver = (driver: DriverData) => {
    setSelectedId(driver.id);
    setDraft(toDraft(driver));
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const result = selectedId
        ? await updateDriver(selectedId, draft)
        : await createDriver(draft);

      if (!result.success) {
        setFeedback({ type: 'error', text: result.error });
        return;
      }

      setDrivers((current) => {
        const exists = current.some((driver) => driver.id === result.driver.id);
        return exists
          ? current.map((driver) => driver.id === result.driver.id ? result.driver : driver)
          : [result.driver, ...current];
      });
      setSelectedId(result.driver.id);
      setDraft(toDraft(result.driver));
      setFeedback({ type: 'success', text: selectedId ? 'Modifications enregistrées.' : 'Pilote ajouté au catalogue.' });
    } catch (error) {
      console.error('[DriverStudio] Enregistrement du pilote impossible:', error);
      setFeedback({
        type: 'error',
        text: error instanceof Error ? `Enregistrement impossible : ${error.message}` : 'Une erreur inattendue a empêché l’enregistrement.',
      });
    } finally {
      setSaving(false);
    }
  };

  const previewImage = resolveCardImage({
    category: 'driver',
    name: draft.name,
    year: draft.year,
    image_url: draft.image_url,
  });
  const previewFlag = resolveCountryFlag(draft.country_code || draft.country);
  const age = getDriverAgeAtCardYear(draft.birth_date, draft.year);

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
              <Sparkles size={14} /> Apex Collector · Pilotes
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Atelier <span className="text-cyan-300">pilotes</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              Crée une fiche par pilote et par année. L’âge est calculé automatiquement depuis la date de naissance.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            <div className="text-2xl font-black tabular-nums">{drivers.length}</div>
            <div className="text-[10px] font-bold uppercase leading-4 tracking-[0.16em] text-slate-500">cartes pilotes<br />au catalogue</div>
          </div>
        </section>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="/admin/cards" className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-slate-400 transition hover:bg-white/5 hover:text-white">Cartes véhicule</Link>
          <Link href="/admin/circuits" className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-slate-400 transition hover:bg-white/5 hover:text-white">Cartes circuit</Link>
          <Link href="/admin/drivers" className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2.5 text-xs font-bold text-cyan-200">Cartes pilote</Link>
          <Link href="/admin/suggestions" className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-2.5 text-xs font-bold text-amber-200 transition hover:bg-amber-300/10">Suggestions joueurs</Link>
          <Link href="/admin/objectives" className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-slate-400 transition hover:bg-white/5 hover:text-white">Succès & contrats</Link>
        </div>

        <div className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3.5 text-amber-100">
          <p className="text-sm font-bold">La Triple Couronne est suivie épreuve par épreuve.</p>
          <p className="mt-1 text-xs leading-5 text-amber-100/70">
            Coche Monaco, les 500 miles d’Indianapolis et les 24 Heures du Mans séparément. Les titres mondiaux sont saisis toutes disciplines confondues.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <form onSubmit={handleSubmit} className="min-w-0 space-y-5">
            <section className="rounded-3xl border border-white/[0.08] bg-[#0d1118]/90 p-5 shadow-2xl shadow-black/20 sm:p-7">
              <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    {selectedDriver ? `#${selectedDriver.collection_number} · Édition` : 'Numéro attribué automatiquement à la création'}
                  </p>
                  <h2 className="mt-1 text-xl font-black">{selectedDriver ? 'Modifier le pilote' : 'Identité du pilote'}</h2>
                </div>
                {selectedDriver && (
                  <button type="button" onClick={startNewDriver} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-white">
                    <Plus size={14} /> Nouveau pilote
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <TextField label="Nom du pilote" value={draft.name} onChange={(value) => setField('name', value)} placeholder="Ayrton Senna" required />
                <TextField label="Année de la carte" value={draft.year} onChange={(value) => setField('year', value)} type="number" min="1880" required />
                <TextField label="Date de naissance" value={draft.birth_date} onChange={(value) => setField('birth_date', value)} type="date" required />
                <TextField label="Pays d’origine" value={draft.country} onChange={(value) => setField('country', value)} placeholder="Brésil" required />
                <TextField label="Code pays (drapeau)" value={draft.country_code} onChange={(value) => setField('country_code', value)} placeholder="BR" />
                <TextField label="Âge pour cette carte" value={age === null ? '' : String(age)} onChange={() => undefined} type="number" readOnly hint="Calculé automatiquement · non modifiable" />
              </div>

              <div className="mb-7 mt-9">
                <p className="mb-5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Palmarès</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <TextField label="Titres de champion du monde" value={draft.world_championships} onChange={(value) => setField('world_championships', value)} type="number" min="0" />
                  <ToggleField label="Grand Prix de Monaco remporté" checked={draft.won_monaco_gp} onChange={(value) => setField('won_monaco_gp', value)} />
                  <ToggleField label="500 miles d’Indianapolis remportés" checked={draft.won_indy_500} onChange={(value) => setField('won_indy_500', value)} />
                  <ToggleField label="24 Heures du Mans remportées" checked={draft.won_24h_le_mans} onChange={(value) => setField('won_24h_le_mans', value)} />
                </div>
              </div>

              <div className="mb-7">
                <p className="mb-5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Collection & visuel</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="block min-w-0">
                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Rareté</span>
                    <select value={draft.rarity} onChange={(event) => setField('rarity', event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10">
                      {rarities.map((rarity) => <option key={rarity} value={rarity}>{rarity}</option>)}
                    </select>
                  </label>
                  <TextField label="URL / chemin de l’image" value={draft.image_url} onChange={(value) => setField('image_url', value)} placeholder="assets/cards/driver/nom-2025.jpg" hint="Clé Storage, URL publique ou chemin local." />
                  <TextField label="Description" value={draft.description} onChange={(value) => setField('description', value)} placeholder="Repères biographiques…" />
                  <ToggleField label="Fiche active dans le jeu" checked={draft.is_active} onChange={(value) => setField('is_active', value)} />
                  <ToggleField label="Éligible aux boosters" checked={draft.booster_enabled} onChange={(value) => setField('booster_enabled', value)} />
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
                  {saving ? 'Enregistrement…' : selectedDriver ? 'Enregistrer les modifications' : 'Créer le pilote'}
                </button>
              </div>
            </section>
          </form>

          <aside className="space-y-5 xl:sticky xl:top-5">
            <section className="rounded-3xl border border-white/[0.08] bg-[#0d1118]/90 p-5 shadow-2xl shadow-black/20">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Aperçu en direct</p>
                  <h2 className="mt-1 text-lg font-black">Carte pilote</h2>
                </div>
                <ImageIcon size={18} className="text-slate-500" />
              </div>
              <div className="relative mx-auto aspect-[2/3] w-full max-w-[240px] overflow-hidden rounded-2xl border-[3px] bg-black" style={{ borderColor: getRarityColor(draft.rarity) }}>
                <SafeImage src={previewImage} fallback={IMAGE_PATHS.PLACEHOLDERS.PILOT_CARD} alt={draft.name || 'Aperçu pilote'} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                {previewFlag && (
                  <span className="absolute right-3 top-3 h-5 w-8 overflow-hidden rounded-sm border border-white/30">
                    <SafeImage src={previewFlag} alt={draft.country} fill showPlaceholderOnError={false} className="object-cover" />
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                  <p className="text-lg font-black uppercase leading-tight">{draft.name || 'Nom du pilote'}</p>
                  <p className="mt-1 text-xs text-slate-200">
                    {draft.year || 'Année'}{age === null ? '' : ` · ${age} ans`}
                  </p>
                  <div className="mt-3 flex justify-center gap-3 text-[10px] font-bold text-slate-100">
                    <span className="inline-flex items-center gap-1"><Crown size={12} /> {draft.world_championships || '0'}</span>
                    <span>MON {draft.won_monaco_gp ? '✓' : '—'}</span>
                    <span>IND {draft.won_indy_500 ? '✓' : '—'}</span>
                    <span>LEM {draft.won_24h_le_mans ? '✓' : '—'}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/[0.08] bg-[#0d1118]/90 p-5 shadow-2xl shadow-black/20">
              <label className="relative block">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Rechercher un pilote…" className="w-full rounded-xl border border-white/10 bg-[#090c11] py-3 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/70" />
              </label>
              <div className="mt-4 max-h-[390px] space-y-1 overflow-y-auto pr-1">
                {filteredDrivers.length ? filteredDrivers.map((driver) => (
                  <button key={driver.id} type="button" onClick={() => selectDriver(driver)} className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${selectedId === driver.id ? 'border-cyan-400/30 bg-cyan-400/[0.07]' : 'border-transparent hover:border-white/[0.08] hover:bg-white/[0.03]'}`}>
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: getRarityColor(driver.rarity) }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-slate-100">{driver.name}</span>
                      <span className="mt-1 block truncate text-[10px] text-slate-500">
                        #{driver.collection_number} · {driver.year} · {driver.country} · {driver.world_championships} titre{driver.world_championships === 1 ? '' : 's'}
                      </span>
                    </span>
                    {selectedId === driver.id ? <Check size={15} className="text-cyan-300" /> : <ChevronRight size={15} className="text-slate-600 transition group-hover:text-slate-300" />}
                  </button>
                )) : (
                  <p className="px-3 py-6 text-center text-xs text-slate-500">Aucun pilote ne correspond à cette recherche.</p>
                )}
              </div>
              {!selectedId && drivers.length === 0 && (
                <button type="button" onClick={startNewDriver} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-3 text-xs font-bold text-slate-400 hover:border-cyan-300/40 hover:text-cyan-200">
                  <Plus size={15} /> Créer le premier pilote
                </button>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
