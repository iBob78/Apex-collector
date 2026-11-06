'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { GiftIcon, XIcon } from 'lucide-react';
import { createClient } from '@/lib/supabaseBrowser';
import { SiteLanguage, translate, UnitSystem } from '@/lib/preferences';
import { PACKS } from '@/lib/boosters';

interface SitePreferences {
  language: SiteLanguage;
  units: UnitSystem;
  t: (message: string, values?: Record<string, string | number>) => string;
  saveLanguage: (language: SiteLanguage) => Promise<string | null>;
  saveUnits: (units: UnitSystem) => Promise<string | null>;
}

const SitePreferencesContext = createContext<SitePreferences | null>(null);
const languageKey = 'apex-lang';
const unitsKey = 'apex-units';

function isSiteLanguage(value: string | null): value is SiteLanguage {
  return value === 'fr' || value === 'en' || value === 'es';
}

function isUnitSystem(value: string | null): value is UnitSystem {
  return value === 'metric' || value === 'imperial';
}

export function SitePreferencesProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [language, setLanguage] = useState<SiteLanguage>('fr');
  const [units, setUnits] = useState<UnitSystem>('metric');
  const [userId, setUserId] = useState<string | null>(null);
  const [dailyBoosterNotice, setDailyBoosterNotice] = useState<{ packSlug: string; streakDay: number } | null>(null);
  const activeUserId = useRef<string | null>(null);

  useEffect(() => {
    const storedLanguage = localStorage.getItem(languageKey);
    const storedUnits = localStorage.getItem(unitsKey);
    if (isSiteLanguage(storedLanguage)) setLanguage(storedLanguage);
    if (isUnitSystem(storedUnits)) setUnits(storedUnits);

    let mounted = true;
    let authEventReceived = false;
    const claimDailyLoginBooster = async () => {
      try {
        const { data, error } = await supabase.rpc('claim_daily_login_booster');
        if (error) {
          console.error('[SitePreferencesProvider] Impossible de réclamer le booster quotidien:', error.message);
          return;
        }
        if (!data?.awarded) return;
        if (!PACKS[data.pack_slug] || !Number.isInteger(data.streak_day)) {
          console.error('[SitePreferencesProvider] Réponse inattendue pour le booster quotidien:', data);
          return;
        }
        if (mounted) setDailyBoosterNotice({ packSlug: data.pack_slug, streakDay: data.streak_day });
      } catch (error) {
        console.error('[SitePreferencesProvider] Impossible de réclamer le booster quotidien:', error);
      }
    };
    const loadProfilePreferences = async (id: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('language, unit_preference')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('[SitePreferencesProvider] Unable to load profile preferences:', error.message);
        return;
      }
      if (!mounted || activeUserId.current !== id || !data) return;

      if (isSiteLanguage(data.language)) {
        setLanguage(data.language);
        localStorage.setItem(languageKey, data.language);
      }
      if (isUnitSystem(data.unit_preference)) {
        setUnits(data.unit_preference);
        localStorage.setItem(unitsKey, data.unit_preference);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      authEventReceived = true;
      const id = session?.user.id ?? null;
      activeUserId.current = id;
      setUserId(id);
      if (id) {
        void loadProfilePreferences(id);
        if (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION') {
          window.setTimeout(() => { void claimDailyLoginBooster(); }, 0);
        }
      } else {
        setDailyBoosterNotice(null);
      }
    });

    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (!mounted || authEventReceived) return;
      if (error) {
        console.error('[SitePreferencesProvider] Unable to identify current user:', error.message);
      } else if (user) {
        activeUserId.current = user.id;
        setUserId(user.id);
        void loadProfilePreferences(user.id);
        void claimDailyLoginBooster();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const savePreference = useCallback(async (
    field: 'language' | 'unit_preference',
    value: SiteLanguage | UnitSystem,
    storageKey: string,
  ) => {
    if (userId) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', userId)
        .select('id')
        .maybeSingle();

      if (error) {
        console.error(`[SitePreferencesProvider] Unable to save ${field}:`, error.message);
        return error.message;
      }
      if (!data) {
        const errorMessage = 'No profile was found for this account.';
        console.error(`[SitePreferencesProvider] Unable to save ${field}:`, errorMessage);
        return errorMessage;
      }
    }

    localStorage.setItem(storageKey, value);
    if (field === 'language') setLanguage(value as SiteLanguage);
    else setUnits(value as UnitSystem);
    return null;
  }, [supabase, userId]);

  const saveLanguage = useCallback(
    (value: SiteLanguage) => savePreference('language', value, languageKey),
    [savePreference],
  );
  const saveUnits = useCallback(
    (value: UnitSystem) => savePreference('unit_preference', value, unitsKey),
    [savePreference],
  );

  const contextValue = useMemo(() => ({
    language,
    units,
    t: (message: string, values?: Record<string, string | number>) => translate(language, message, values),
    saveLanguage,
    saveUnits,
  }), [language, units, saveLanguage, saveUnits]);

  return (
    <SitePreferencesContext.Provider value={contextValue}>
      {children}
      {dailyBoosterNotice && PACKS[dailyBoosterNotice.packSlug] && (
        <div role="status" aria-live="polite" className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[70] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-cyan-300/30 bg-[#0d1722] p-4 text-sm text-cyan-50 shadow-2xl md:inset-x-auto md:bottom-6 md:right-6">
          <GiftIcon size={20} className="shrink-0 text-cyan-300" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            {translate(language, 'Booster offert : {pack} (jour {day}/7).', {
              pack: translate(language, PACKS[dailyBoosterNotice.packSlug].name),
              day: dailyBoosterNotice.streakDay,
            })}
          </span>
          <Link href="/boosters" onClick={() => setDailyBoosterNotice(null)} className="shrink-0 rounded-lg bg-cyan-300 px-3 py-2 text-xs font-black text-slate-950">
            {translate(language, 'Ouvrir')}
          </Link>
          <button type="button" onClick={() => setDailyBoosterNotice(null)} aria-label={translate(language, 'Fermer')} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white">
            <XIcon size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </SitePreferencesContext.Provider>
  );
}

export function useSitePreferences() {
  const context = useContext(SitePreferencesContext);
  if (!context) {
    throw new Error('useSitePreferences must be used within SitePreferencesProvider');
  }
  return context;
}
