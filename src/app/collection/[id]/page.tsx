'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
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
import clsx from 'clsx';

export default function CardShowcasePage() {
    const { id } = useParams();
    const router = useRouter();
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
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!card) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
            <h1 className="text-2xl font-black uppercase italic">Carte introuvable</h1>
            <button onClick={() => router.back()} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl uppercase text-xs font-bold tracking-widest">
                Retour au garage
            </button>
        </div>
    );

    const brandLogo = resolveBrandLogo(card.make);

    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Cinematic Background Glow */}
                <div className={clsx(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[150px] opacity-20 rounded-full z-0",
                    card.rarity === 'Icon' ? 'bg-red-500' :
                        card.rarity === 'Legend' ? 'bg-yellow-500' :
                            card.rarity === 'Epic' ? 'bg-purple-500' :
                                card.rarity === 'Rare' ? 'bg-blue-500' :
                                    'bg-gray-500'
                )} />

                <div className="z-10 p-8 md:p-12 flex-1 flex flex-col">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-[0.3em] mb-12"
                    >
                        <ArrowLeftIcon size={16} /> Retour au garage
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left Col: Hero Image */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative aspect-[63/88] w-full max-w-md mx-auto group"
                        >
                            <div className={clsx(
                                "absolute -inset-1 rounded-[32px] blur-2xl opacity-30 group-hover:opacity-50 transition-opacity",
                                card.rarity === 'Icon' ? 'bg-red-500' :
                                    card.rarity === 'Legend' ? 'bg-yellow-500' :
                                        card.rarity === 'Epic' ? 'bg-purple-500' :
                                            'bg-blue-500'
                            )} />

                            <div className="relative h-full w-full rounded-[24px] overflow-hidden border border-white/10 shadow-2xl">
                                <SafeImage
                                    src={card.image_url}
                                    fallback={IMAGE_PATHS.PLACEHOLDERS.VEHICLE_CARD}
                                    alt={card.model}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Owned Badge */}
                            <div className="absolute -bottom-6 -right-6 bg-blue-600 border-4 border-[#050505] px-6 py-4 rounded-3xl shadow-2xl">
                                <div className="text-[10px] font-black uppercase tracking-widest text-blue-100">Exemplaires</div>
                                <div className="text-3xl font-black italic tracking-tighter">x{ownedCount}</div>
                            </div>
                        </motion.div>

                        {/* Right Col: Stats & Details */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col"
                        >
                            <div className="flex items-center gap-6 mb-4">
                                <SafeImage src={brandLogo} width={60} height={60} alt="" className="object-contain opacity-50" />
                                <div>
                                    <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-2">
                                        {card.make} <span className="text-transparent border-text block md:inline" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>{card.model}</span>
                                    </h1>
                                    <div className="flex items-center gap-4">
                                        <span className={clsx(
                                            "px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border",
                                            card.rarity === 'Icon' ? 'bg-red-500/10 border-red-500 text-red-500' :
                                                card.rarity === 'Legend' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' :
                                                    card.rarity === 'Epic' ? 'bg-purple-500/10 border-purple-500 text-purple-500' :
                                                        'bg-blue-500/10 border-blue-500 text-blue-500'
                                        )}>
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                                <SpecItem icon={<ZapIcon size={16} />} label="Puissance" value={`${card.power_hp} HP`} sub={card.power_kw ? `${card.power_kw} KW` : undefined} />
                                <SpecItem icon={<GaugeIcon size={16} />} label="Vitesse Max" value={`${card.max_speed_kmh} KM/H`} />
                                <SpecItem icon={<ActivityIcon size={16} />} label="0-100 KM/H" value={card.acceleration_0_100 ? `${card.acceleration_0_100}s` : '--'} />
                                <SpecItem icon={<WeightIcon size={16} />} label="Poids" value={`${card.weight_t} T`} />
                                <SpecItem icon={<ActivityIcon size={16} />} label="Moteur" value={card.engine_size ? card.engine_size : '--'} sub={card.cylinder} />
                                <SpecItem icon={<WindIcon size={16} />} label="Induction" value={card.boost || 'Atmosphérique'} />
                                <SpecItem icon={<FlagIcon size={16} />} label="Pays" value={card.country_code || '--'} />
                                <SpecItem icon={<FuelIcon size={16} />} label="Transmission" value={card.transmission || 'RWD'} />
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-4">
                                <button className="bg-white text-black px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl">
                                    Mettre en vente
                                </button>
                                <button className="bg-white/5 border border-white/10 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all">
                                    Ajouter aux favoris
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
                <Footer />
            </main>
        </div>
    );
}

function SpecItem({ icon, label, value, sub }: { icon: any, label: string, value: string | number, sub?: string }) {
    return (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 group hover:border-blue-500/30 transition-all">
            <div className="text-blue-500 mb-3 group-hover:scale-110 transition-transform origin-left">{icon}</div>
            <div className="text-[9px] uppercase font-black tracking-widest text-gray-600 mb-1">{label}</div>
            <div className="text-sm font-black italic tracking-tighter">{value}</div>
            {sub && <div className="text-[9px] font-mono text-gray-500 mt-1 uppercase">{sub}</div>}
        </div>
    );
}
