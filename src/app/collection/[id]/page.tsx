'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import SafeImage from '@/components/SafeImage';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeftIcon,
    ZapIcon,
    GaugeIcon,
    ActivityIcon,
    WeightIcon,
    FlagIcon,
    WindIcon,
    FuelIcon
} from 'lucide-react';
import { IMAGE_PATHS, resolveBrandLogo } from '@/lib/images';
import { Rarity } from '@/types/game';
import { getRarityColor } from '@/lib/rarity';
import { formatPower, formatSpeed, formatWeight } from '@/lib/preferences';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

export default function CardShowcasePage() {
    const { id } = useParams();
    const router = useRouter();
    const { language, units, t } = useSitePreferences();
    const [card, setCard] = useState<any>(null);
    const [ownedCount, setOwnedCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            // Fetch Card
            const { data: cardData } = await supabase
                .from('cards')
                .select('*')
                .eq('id', id)
                .eq('is_active', true)
                .single();

            if (cardData) {
                setCard(cardData);

                // Fetch Ownership
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: userCard } = await supabase
                        .from('user_cards')
                        .select('count')
                        .eq('user_id', user.id)
                        .eq('card_id', id)
                        .maybeSingle();

                    if (userCard) setOwnedCount(userCard.count);
                }
            }
            setLoading(false);
        };

        fetchData();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#555D65] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!card) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
            <h1 className="text-2xl font-black uppercase italic">{t('Carte introuvable')}</h1>
            <button onClick={() => router.back()} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl uppercase text-xs font-bold tracking-widest">
                {t('Retour au garage')}
            </button>
        </div>
    );

    const brandLogo = resolveBrandLogo(card.make);

    return (
        <div className="apex-paddock flex min-h-screen text-white">
            <Sidebar />
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Cinematic Background Glow */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[150px] opacity-20 rounded-full z-0"
                    style={{ backgroundColor: getRarityColor(card.rarity) }}
                />

                <div className="paddock-shell z-10 flex flex-1 flex-col px-4 py-7 sm:px-8 sm:py-10 lg:px-12">
                    <button
                        onClick={() => router.back()}
                        className="paddock-ghost mb-8 flex min-h-10 w-fit items-center gap-3 rounded-lg px-4 text-[10px] font-black uppercase tracking-[0.2em] transition"
                    >
                        <ArrowLeftIcon size={16} /> {t('Retour au garage')}
                    </button>

                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
                        {/* Left Col: Hero Image */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative aspect-[63/88] w-full max-w-md mx-auto group"
                        >
                            <div
                                className="absolute -inset-1 rounded-[32px] blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"
                                style={{ backgroundColor: getRarityColor(card.rarity) }}
                            />

                            <div className="relative h-full w-full overflow-hidden rounded-[24px] border border-[#555D65]/20 shadow-[0_30px_90px_rgba(0,0,0,.5)]">
                                <SafeImage
                                    src={card.image_url}
                                    fallback={IMAGE_PATHS.PLACEHOLDERS.VEHICLE_CARD}
                                    alt={card.model}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Owned Badge */}
                            <div className="absolute -bottom-5 -right-2 rounded-xl border-2 border-[#101215] bg-gradient-to-br from-[#555D65] to-[#232930] px-4 py-3 shadow-2xl sm:-right-6 sm:px-6 sm:py-4">
                                <div className="text-[10px] font-black uppercase tracking-widest text-[#F0EFEB]">{t('Exemplaires')}</div>
                                <div className="text-3xl font-black italic tracking-tighter">x{ownedCount}</div>
                            </div>
                        </motion.div>

                        {/* Right Col: Stats & Details */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="paddock-panel flex flex-col p-5 sm:p-7"
                        >
                            <div className="flex items-center gap-6 mb-4">
                                <SafeImage src={brandLogo} width={60} height={60} alt="" className="object-contain opacity-50" />
                                <div>
                                    <h1 className="paddock-title mb-3">
                                        {card.make} <span className="text-transparent border-text block md:inline" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>{card.model}</span>
                                    </h1>
                                    <div className="flex items-center gap-4">
                                        <span
                                            className="px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border"
                                            style={{
                                                backgroundColor: `${getRarityColor(card.rarity)}1A`,
                                                borderColor: getRarityColor(card.rarity),
                                                color: getRarityColor(card.rarity),
                                            }}
                                        >
                                            {card.rarity}
                                        </span>
                                        <span className="text-gray-500 font-mono text-xs uppercase tracking-widest">{card.year} · {card.country_code}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm italic font-medium max-w-xl mb-12 leading-relaxed">
                                {card.description || "Un chef-d'œuvre technologique conçu pour repousser les limites de la performance et du design. Alliant précision ingéniérique et esthétique visionnaire."}
                            </p>

                            {/* Technical Grid */}
                            <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
                                <SpecItem icon={<ZapIcon size={16} />} label={t('Puissance')} value={formatPower(Number(card.power_hp), units, language, Number(card.power_kw) || undefined)} />
                                <SpecItem icon={<GaugeIcon size={16} />} label={t('Vitesse Max')} value={formatSpeed(Number(card.max_speed_kmh), units, language)} />
                                <SpecItem icon={<ActivityIcon size={16} />} label={t('0 à 100 km/h')} value={card.acceleration_0_100 ? `${card.acceleration_0_100}s` : '--'} />
                                <SpecItem icon={<WeightIcon size={16} />} label={t('Poids')} value={formatWeight(Number(card.weight_t), units, language)} />
                                <SpecItem icon={<ActivityIcon size={16} />} label={t('Moteur')} value={card.engine_size ? card.engine_size : '--'} sub={card.cylinder} />
                                <SpecItem icon={<WindIcon size={16} />} label={t('Induction')} value={card.boost || t('Atmosphérique')} />
                                <SpecItem icon={<FlagIcon size={16} />} label={t('Pays')} value={card.country_code || '--'} />
                                <SpecItem icon={<FuelIcon size={16} />} label={t('Position moteur / transmission')} value={card.transmission || '—'} />
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-4">
                                <button className="paddock-action px-6 py-4 text-xs shadow-xl">
                                    Mettre en vente
                                </button>
                                <button className="paddock-ghost rounded-xl px-6 py-4 text-xs font-black uppercase tracking-widest transition-all">
                                    Ajouter aux favoris
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function SpecItem({ icon, label, value, sub }: { icon: any, label: string, value: string | number, sub?: string }) {
    return (
        <div className="paddock-tile group p-3 transition-all sm:p-4">
            <div className="text-[#F0EFEB] mb-3 group-hover:scale-110 transition-transform origin-left">{icon}</div>
            <div className="text-[9px] uppercase font-black tracking-widest text-gray-600 mb-1">{label}</div>
            <div className="text-sm font-black italic tracking-tighter">{value}</div>
            {sub && <div className="text-[9px] font-mono text-gray-500 mt-1 uppercase">{sub}</div>}
        </div>
    );
}
