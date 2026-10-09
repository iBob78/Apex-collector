'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Image as ImageIcon,
  LoaderCircle,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import Card from '@/components/Card';
import { drivetrainLayoutDescriptions, drivetrainLayouts } from '@/lib/drivetrain';
import { getRarityColor } from '@/lib/rarity';
import { createCard, updateCard, type CardData, type CardDraft } from './actions';

const rarities = ['Common', 'Uncommon', 'Atypique', 'Rare', 'Very rare', 'Epic', 'Legend', 'Mythic', 'Icon'];
const CUSTOM_MAKE = '__custom_make__';

const emptyDraft: CardDraft = {
  make: '',
  model: '',
  year: String(new Date().getFullYear()),
  rarity: 'Common',
  image_url: '',
  description: '',
  power_hp: '',
  power_kw: '',
  torque_nm: '',
  max_speed_kmh: '',
  weight_t: '',
  acceleration_0_100: '',
  engine_size: '',
  cylinder: '',
  boost: '',
  country_code: '',
  transmission: '',
  new_price_eur: '',
  fuel_type: '',
  max_rpm: '',
  units_sold: '',
};

function toDraft(card: CardData): CardDraft {
  return {
    make: card.make ?? '',
    model: card.model ?? '',
    year: String(card.year ?? ''),
    rarity: card.rarity ?? 'Common',
    image_url: card.image_url ?? '',
    description: card.description ?? '',
    power_hp: String(card.power_hp ?? ''),
    power_kw: String(card.power_kw ?? ''),
    torque_nm: String(card.torque_nm ?? ''),
    max_speed_kmh: String(card.max_speed_kmh ?? ''),
    weight_t: String(card.weight_t ?? ''),
    acceleration_0_100: String(card.acceleration_0_100 ?? ''),
    engine_size: card.engine_size ?? '',
    cylinder: card.cylinder ?? '',
    boost: card.boost ?? '',
    country_code: card.country_code ?? '',
    transmission: card.transmission ?? '',
    new_price_eur: String(card.new_price_eur ?? ''),
    fuel_type: card.fuel_type ?? '',
    max_rpm: String(card.max_rpm ?? ''),
    units_sold: String(card.units_sold ?? ''),
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

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">{eyebrow}</p>
        <h2 className="mt-1 text-lg font-black text-white">{title}</h2>
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
}

export default function CardStudio({ initialCards }: { initialCards: CardData[] }) {
  const [cards, setCards] = useState(initialCards);
  const [draft, setDraft] = useState<CardDraft>(emptyDraft);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCustomMake, setIsCustomMake] = useState(false);
  const [filter, setFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => setCards(initialCards), [initialCards]);

  const selectedCard = cards.find((card) => card.id === selectedId) ?? null;
  const makes = useMemo(
    () => Array.from(new Set(cards.map((card) => card.make.trim()).filter(Boolean)))
      .sort((first, second) => first.localeCompare(second, 'fr')),
    [cards],
  );
  const filteredCards = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return cards;
    return cards.filter((card) =>
      `${card.make} ${card.model} ${card.year} ${card.rarity}`.toLowerCase().includes(query),
    );
  }, [cards, filter]);

  const setField = (field: keyof CardDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setFeedback(null);
  };

  const startNewCard = () => {
    setSelectedId(null);
    setDraft(emptyDraft);
    setIsCustomMake(false);
    setFeedback(null);
  };

  const selectCard = (card: CardData) => {
    setSelectedId(card.id);
    setDraft(toDraft(card));
    setIsCustomMake(false);
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    const result = selectedId
      ? await updateCard(selectedId, draft)
      : await createCard(draft);

    setSaving(false);
    if (!result.success) {
      setFeedback({ type: 'error', text: result.error });
      return;
    }

    setCards((current) => {
      const exists = current.some((card) => card.id === result.card.id);
      return exists
        ? current.map((card) => card.id === result.card.id ? result.card : card)
        : [result.card, ...current];
    });
    setSelectedId(result.card.id);
    setDraft(toDraft(result.card));
    setFeedback({ type: 'success', text: selectedId ? 'Modifications enregistrées.' : 'Carte créée dans le catalogue.' });
  };

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

        <section className="py-8 sm:py-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">
                <Sparkles size={14} /> Apex Collector · Catalogue
              </p>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Atelier <span className="text-cyan-300">cartes</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                Crée une nouvelle carte ou ajuste les performances, la rareté et le visuel d’un véhicule existant.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
              <div className="text-2xl font-black tabular-nums">{cards.length}</div>
              <div className="text-[10px] font-bold uppercase leading-4 tracking-[0.16em] text-slate-500">cartes<br />au catalogue</div>
            </div>
          </div>
        </section>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="/admin/cards" className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2.5 text-xs font-bold text-cyan-200">Cartes véhicule</Link>
          <Link href="/admin/circuits" className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-slate-400 transition hover:bg-white/5 hover:text-white">Cartes circuit</Link>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <form onSubmit={handleSubmit} className="min-w-0 space-y-5">
            <section className="rounded-3xl border border-white/[0.08] bg-[#0d1118]/90 p-5 shadow-2xl shadow-black/20 sm:p-7">
              <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    {selectedCard ? `Édition · ${selectedCard.id.slice(0, 8)}` : 'Nouvelle fiche'}
                  </p>
                  <h2 className="mt-1 text-xl font-black">{selectedCard ? 'Modifier la carte' : 'Identité du véhicule'}</h2>
                </div>
                {selectedCard && (
                  <button type="button" onClick={startNewCard} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-white">
                    <Plus size={14} /> Nouvelle carte
                  </button>
                )}
              </div>

              <SectionHeading eyebrow="01 — identité" title="Informations générales" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block min-w-0">
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Marque<span className="ml-1 text-cyan-300">*</span>
                  </span>
                  <select
                    value={isCustomMake ? CUSTOM_MAKE : draft.make}
                    onChange={(event) => {
                      if (event.target.value === CUSTOM_MAKE) {
                        setIsCustomMake(true);
                      } else {
                        setIsCustomMake(false);
                        setField('make', event.target.value);
                      }
                    }}
                    className="w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10"
                    required
                  >
                    <option value="">Sélectionner une marque</option>
                    {makes.map((make) => <option key={make} value={make}>{make}</option>)}
                    <option value={CUSTOM_MAKE}>Autre marque…</option>
                  </select>
                  {isCustomMake && (
                    <input
                      autoFocus
                      className="mt-3 w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10"
                      type="text"
                      value={draft.make}
                      onChange={(event) => setField('make', event.target.value)}
                      placeholder="Saisir une nouvelle marque"
                      required
                    />
                  )}
                </label>
                <TextField label="Modèle" value={draft.model} onChange={(value) => setField('model', value)} placeholder="911 GT3 RS" required />
                <TextField label="Année" value={draft.year} onChange={(value) => setField('year', value)} type="number" min="1886" step="1" required />
                <label className="block min-w-0">
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Rareté</span>
                  <select
                    value={draft.rarity}
                    onChange={(event) => setField('rarity', event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10"
                  >
                    {rarities.map((rarity) => <option key={rarity} value={rarity}>{rarity}</option>)}
                  </select>
                </label>
                <TextField label="Pays / drapeau" value={draft.country_code} onChange={(value) => setField('country_code', value)} placeholder="🇩🇪 ou DE" />
                <TextField label="URL de l’image" value={draft.image_url} onChange={(value) => setField('image_url', value)} placeholder="/images/vehicles/911.jpg" hint="URL publique ou chemin commençant par /" />
                <label className="block sm:col-span-2 lg:col-span-3">
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Description</span>
                  <textarea
                    value={draft.description}
                    onChange={(event) => setField('description', event.target.value)}
                    rows={3}
                    placeholder="Quelques mots sur cette voiture..."
                    className="w-full resize-y rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10"
                  />
                </label>
              </div>

              <div className="mb-7 mt-9">
                <SectionHeading eyebrow="02 — performances" title="Fiche technique" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <TextField label="Puissance" value={draft.power_hp} onChange={(value) => setField('power_hp', value)} type="number" min="0" step="any" placeholder="525" hint="Chevaux (HP)" />
                  <TextField label="Puissance" value={draft.power_kw} onChange={(value) => setField('power_kw', value)} type="number" min="0" step="any" placeholder="386" hint="Kilowatts (kW)" />
                  <TextField label="Couple" value={draft.torque_nm} onChange={(value) => setField('torque_nm', value)} type="number" min="0" step="any" placeholder="465" hint="Newton-mètres (Nm)" />
                  <TextField label="Vitesse maximale" value={draft.max_speed_kmh} onChange={(value) => setField('max_speed_kmh', value)} type="number" min="0" step="any" placeholder="296" hint="Kilomètres par heure" />
                  <TextField label="0–100 km/h" value={draft.acceleration_0_100} onChange={(value) => setField('acceleration_0_100', value)} type="number" min="0" step="any" placeholder="3.2" hint="Secondes" />
                  <TextField label="Poids" value={draft.weight_t} onChange={(value) => setField('weight_t', value)} type="number" min="0" step="any" placeholder="1.45" hint="Tonnes" />
                  <TextField label="Motorisation" value={draft.engine_size} onChange={(value) => setField('engine_size', value)} placeholder="4.0L flat-six" />
                  <TextField label="Cylindres" value={draft.cylinder} onChange={(value) => setField('cylinder', value)} placeholder="6" />
                  <TextField label="Suralimentation" value={draft.boost} onChange={(value) => setField('boost', value)} placeholder="Atmosphérique" />
                  <label className="block min-w-0">
                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Position moteur / transmission</span>
                    <select
                      value={draft.transmission}
                      onChange={(event) => setField('transmission', event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#090c11] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10"
                    >
                      <option value="">Non renseignée</option>
                      {!drivetrainLayouts.some((layout) => layout === draft.transmission) && draft.transmission && (
                        <option value={draft.transmission}>Ancienne valeur : {draft.transmission}</option>
                      )}
                      {drivetrainLayouts.map((layout) => (
                        <option key={layout} value={layout}>
                          {layout} - {drivetrainLayoutDescriptions[layout]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <TextField label="Prix neuf" value={draft.new_price_eur} onChange={(value) => setField('new_price_eur', value)} type="number" min="0" step="any" placeholder="245000" hint="Euros (€)" />
                  <TextField label="Carburant" value={draft.fuel_type} onChange={(value) => setField('fuel_type', value)} placeholder="Essence, Diesel, Électrique…" />
                  <TextField label="Régime maximal" value={draft.max_rpm} onChange={(value) => setField('max_rpm', value)} type="number" min="0" step="1" placeholder="9000" hint="Tours par minute (tr/min)" />
                  <TextField label="Exemplaires vendus" value={draft.units_sold} onChange={(value) => setField('units_sold', value)} type="number" min="0" step="1" placeholder="9181" hint="Production réelle du modèle" />
                </div>
              </div>

              {feedback && (
                <p
                  role={feedback.type === 'error' ? 'alert' : 'status'}
                  className={`mb-5 rounded-xl border px-4 py-3 text-sm ${feedback.type === 'error' ? 'border-red-400/20 bg-red-400/10 text-red-200' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'}`}
                >
                  {feedback.text}
                </p>
              )}
              <div className="flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500"><span className="text-cyan-300">*</span> Champs obligatoires</p>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60"
                >
                  {saving ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />}
                  {saving ? 'Enregistrement…' : selectedCard ? 'Enregistrer les modifications' : 'Créer la carte'}
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

              <div className="mx-auto w-full max-w-[250px]">
                <Card
                  id={selectedId ?? 'card-preview'}
                  category="vehicle"
                  make={draft.make || 'Marque'}
                  model={draft.model || 'Modèle'}
                  year={Number(draft.year) || new Date().getFullYear()}
                  rarity={draft.rarity}
                  image_url={draft.image_url || undefined}
                  description={draft.description}
                  power_hp={draft.power_hp || 0}
                  torque_nm={draft.torque_nm || 0}
                  max_speed_kmh={draft.max_speed_kmh || 0}
                  acceleration_0_100={draft.acceleration_0_100 || 0}
                  weight_t={draft.weight_t || 0}
                  transmission={draft.transmission || undefined}
                  country_code={draft.country_code}
                  compact
                  showLevel={false}
                  onCardClick={() => {}}
                />
              </div>
              {!(Number(draft.power_hp) > 0 && Number(draft.weight_t) > 0) && (
                <p className="mx-auto mt-3 max-w-[250px] text-center text-xs text-slate-500">
                  Renseigne la puissance et le poids pour afficher l’IP.
                </p>
              )}
              <p className="mt-4 text-center text-xs text-slate-500">L’aperçu se met à jour pendant la saisie.</p>
            </section>

            <section className="rounded-3xl border border-white/[0.08] bg-[#0d1118]/90 p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Catalogue</p>
                  <h2 className="mt-1 text-lg font-black">Cartes existantes</h2>
                </div>
                <span className="rounded-lg bg-white/5 px-2 py-1 text-xs font-bold text-slate-400">{filteredCards.length}</span>
              </div>
              <label className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-[#090c11] px-3">
                <Search size={15} className="shrink-0 text-slate-500" />
                <input
                  aria-label="Rechercher une carte"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  placeholder="Marque, modèle, année…"
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-xs text-white outline-none placeholder:text-slate-600"
                />
                {filter && <button type="button" aria-label="Effacer la recherche" onClick={() => setFilter('')}><X size={14} className="text-slate-500 hover:text-white" /></button>}
              </label>
              <div className="max-h-[390px] space-y-1 overflow-y-auto pr-1">
                {filteredCards.length ? filteredCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => selectCard(card)}
                    className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${selectedId === card.id ? 'border-cyan-400/30 bg-cyan-400/[0.07]' : 'border-transparent hover:border-white/[0.08] hover:bg-white/[0.03]'}`}
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: getRarityColor(card.rarity) }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-slate-100">{card.make} {card.model}</span>
                      <span className="mt-1 block text-[10px] text-slate-500">{card.year} · {card.rarity}</span>
                    </span>
                    {selectedId === card.id ? <Check size={15} className="text-cyan-300" /> : <ChevronRight size={15} className="text-slate-600 transition group-hover:text-slate-300" />}
                  </button>
                )) : (
                  <p className="px-3 py-6 text-center text-xs text-slate-500">Aucune carte ne correspond à cette recherche.</p>
                )}
              </div>
              {!selectedId && cards.length === 0 && (
                <button type="button" onClick={startNewCard} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-3 text-xs font-bold text-slate-400 hover:border-cyan-300/40 hover:text-cyan-200">
                  <Plus size={15} /> Créer la première carte
                </button>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
