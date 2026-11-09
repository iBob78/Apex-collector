'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { PACKS } from '@/lib/boosters';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

type GiftNotice = {
  id: string;
  title: string;
  cardCount: number;
  destination: string;
};

function getSeenIds(key: string): Set<string> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || '[]');
    return new Set(Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string') : []);
  } catch {
    return new Set();
  }
}

/** Acknowledge a gift notification without consuming its booster. */
export default function DashboardGiftNotice({ userId }: { userId: string | null }) {
  const router = useRouter();
  const { t } = useSitePreferences();
  const [notices, setNotices] = useState<GiftNotice[]>([]);

  useEffect(() => {
    if (!userId) {
      setNotices([]);
      return;
    }
    let active = true;
    const load = async () => {
      // This is idempotent and also called by the preferences provider.
      // Await it so brand-new players see their daily gift on first dashboard visit.
      const { error: claimError } = await supabase.rpc('claim_daily_login_booster');
      if (claimError) {
        console.error('[DashboardGiftNotice] Daily reward:', claimError.message);
      }

      const [daily, welcome] = await Promise.all([
        supabase.from('user_daily_boosters')
          .select('id, pack_slug')
          .eq('user_id', userId)
          .is('opened_at', null)
          .order('created_at', { ascending: true }),
        supabase.from('user_gift_boosters')
          .select('id, gift_key, pack_slug, card_count')
          .eq('user_id', userId)
          .is('opened_at', null)
          .order('granted_at', { ascending: true }),
      ]);

      if (!active) return;
      if (daily.error) console.error('[DashboardGiftNotice] Daily boosters:', daily.error.message);
      // No welcome gift table exists until migration 042 is applied.
      if (welcome.error && !['PGRST205', '42P01'].includes(welcome.error.code)) {
        console.error('[DashboardGiftNotice] Welcome gifts:', welcome.error.message);
      }

      const available: GiftNotice[] = [
        ...(daily.data ?? [])
          .filter(item => Boolean(PACKS[item.pack_slug]))
          .map(item => ({
            id: 'daily:' + item.id,
            title: t('Booster quotidien offert'),
            cardCount: PACKS[item.pack_slug].cardCount,
            destination: '/open?daily_booster=' + encodeURIComponent(item.id),
          })),
        ...(welcome.data ?? [])
          .filter(item => Boolean(PACKS[item.pack_slug]))
          .map(item => ({
            id: 'welcome:' + item.id,
            title: t(item.gift_key === 'welcome_2026' ? 'Booster de bienvenue' : 'Cadeau spécial'),
            cardCount: item.card_count,
            destination: '/open?gift_booster=' + encodeURIComponent(item.id),
          })),
      ];

      const seen = getSeenIds('apex-gift-seen:' + userId);
      setNotices(available.filter(item => !seen.has(item.id)));
    };

    void load();
    return () => { active = false; };
  }, [userId, t]);

  if (!notices.length || !userId) return null;

  const acknowledge = () => {
    const key = 'apex-gift-seen:' + userId;
    const seen = getSeenIds(key);
    notices.forEach(item => seen.add(item.id));
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(seen)));
    } catch {
      // Local storage can be disabled; the gifts still work.
    }
    setNotices([]);
  };

  const open = (destination: string) => {
    acknowledge();
    router.push(destination);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <section role="dialog" aria-modal="true" aria-labelledby="gift-notice-heading"
        className="relative w-full max-w-md rounded-3xl border border-amber-300/35 bg-[#101722] p-5 text-white shadow-2xl sm:p-7">
        <button type="button" onClick={acknowledge} aria-label={t('Fermer')}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-300 hover:bg-white/10">
          <X size={20} />
        </button>
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-300">
          <Gift size={26} />
        </span>
        <h2 id="gift-notice-heading" className="pr-8 text-2xl font-black uppercase tracking-tight">
          {t('Vos cadeaux sont arrivés !')}
        </h2>
        <p className="mb-5 mt-2 text-sm text-slate-300">
          {t('Vos boosters gratuits vous attendent. Ils restent disponibles jusqu’à leur ouverture.')}
        </p>
        <div className="space-y-3">
          {notices.map(item => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="min-w-0">
                <p className="text-sm font-bold">{item.title}</p>
                <p className="mt-1 text-xs text-amber-200">{t('{count} cartes offertes', { count: item.cardCount })}</p>
              </div>
              <button type="button" onClick={() => open(item.destination)}
                className="min-h-10 shrink-0 rounded-lg bg-amber-300 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-200">
                {t('Ouvrir')}
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => { acknowledge(); router.push('/boosters'); }}
          className="mt-5 w-full rounded-xl border border-white/20 px-4 py-3 text-sm font-bold text-slate-100 hover:bg-white/10">
          {t('Voir tous mes boosters')}
        </button>
        <p className="mt-3 text-center text-xs text-slate-400">
          {t('Fermer cette fenêtre ne consomme aucun booster.')}
        </p>
      </section>
    </div>
  );
}
