'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { getUserQuests, claimQuestReward } from '@/lib/actions/quests';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrophyIcon,
    CheckCircle2Icon,
    CircleIcon,
    GiftIcon,
    ZapIcon,
    TimerIcon,
    ChevronRightIcon
} from 'lucide-react';
import clsx from 'clsx';

export default function MissionsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [quests, setQuests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<string | null>(null);

    const fetchQuests = async (userId: string) => {
        const { data } = await getUserQuests(userId);
        if (data) setQuests(data);
        setLoading(false);
    };

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUser(data.user);
                fetchQuests(data.user.id);
            }
        });
    }, [router]);

    const handleClaim = async (userQuestId: string) => {
        if (!user) return;
        setClaimingId(userQuestId);
        const res = await claimQuestReward(user.id, userQuestId);
        if (res.success) {
            alert(`Bravo ! Vous avez récupéré ${res.reward} AP.`);
            fetchQuests(user.id);
        } else {
            alert(`Erreur: ${res.error}`);
        }
        setClaimingId(null);
    };

    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 flex flex-col">
                <div className="p-8 md:p-12 flex-1">
                    {/* Header */}
                    <header className="mb-12">
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                            Contrats de Pilote
                        </h1>
                        <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.3em] mt-2">
                            Remplissez vos objectifs pour financer votre écurie.
                        </p>
                    </header>

                    {loading ? (
                        <div className="flex items-center justify-center h-64 opacity-50">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : quests.length > 0 ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {quests.map((uq, index) => (
                                <motion.div
                                    key={uq.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={clsx(
                                        "relative group bg-[#0a0a0a] border rounded-3xl p-6 transition-all shadow-2xl overflow-hidden",
                                        uq.status === 'completed' ? 'border-yellow-500/30 bg-yellow-500/[0.02]' : 'border-white/5'
                                    )}
                                >
                                    {/* Progress Glow */}
                                    {uq.status === 'completed' && (
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl -mr-16 -mt-16" />
                                    )}

                                    <div className="flex gap-6 items-start relative z-10">
                                        <div className={clsx(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110",
                                            uq.status === 'completed' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500' :
                                                uq.status === 'claimed' ? 'bg-green-500/10 border-green-500/20 text-green-500 opacity-50' :
                                                    'bg-white/5 border-white/10 text-blue-400'
                                        )}>
                                            {uq.status === 'claimed' ? <CheckCircle2Icon size={24} /> : <ZapIcon size={24} />}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className={clsx(
                                                    "font-black uppercase italic tracking-tight text-lg",
                                                    uq.status === 'claimed' ? 'text-gray-600 line-through' : 'text-white'
                                                )}>
                                                    {uq.quest.title}
                                                </h3>
                                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                                    <GiftIcon size={12} className="text-blue-500" />
                                                    <span className="text-[10px] font-black">{uq.quest.reward_ap} AP</span>
                                                </div>
                                            </div>

                                            <p className="text-gray-500 text-xs mb-6 font-medium leading-relaxed">
                                                {uq.quest.description}
                                            </p>

                                            {/* Progress Bar */}
                                            {uq.status !== 'claimed' && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                                                        <span>Progression</span>
                                                        <span className={uq.status === 'completed' ? 'text-yellow-500' : 'text-blue-400'}>
                                                            {uq.current_count} / {uq.quest.required_count}
                                                        </span>
                                                    </div>
                                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(100, (uq.current_count / uq.quest.required_count) * 100)}%` }}
                                                            className={clsx(
                                                                "h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]",
                                                                uq.status === 'completed' ? 'bg-yellow-500 shadow-yellow-500/20' : 'bg-blue-600'
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Claim Button */}
                                            {uq.status === 'completed' && (
                                                <button
                                                    onClick={() => handleClaim(uq.id)}
                                                    disabled={claimingId === uq.id}
                                                    className="mt-6 w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl shadow-yellow-900/20 flex items-center justify-center gap-2"
                                                >
                                                    {claimingId === uq.id ? (
                                                        <TimerIcon size={16} className="animate-spin" />
                                                    ) : (
                                                        <>Réclamer la récompense <ChevronRightIcon size={16} /></>
                                                    )}
                                                </button>
                                            )}

                                            {uq.status === 'claimed' && (
                                                <div className="mt-6 text-center text-[10px] uppercase font-black tracking-widest text-green-500/50 flex items-center justify-center gap-2">
                                                    <CheckCircle2Icon size={14} /> Contrat Honoré
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/5 border-dashed rounded-3xl">
                            <TrophyIcon size={48} className="text-gray-700 mb-4" />
                            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest italic">Aucun contrat disponible pour le moment.</p>
                        </div>
                    )}
                </div>
                <Footer />
            </main>
        </div>
    );
}
