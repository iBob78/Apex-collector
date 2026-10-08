'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabaseBrowser';
import { SiteLanguage, translate, UnitSystem } from '@/lib/preferences';

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
  const activeUserId = useRef<string | null>(null);

  useEffect(() => {
    const storedLanguage = localStorage.getItem(languageKey);
    const storedUnits = localStorage.getItem(unitsKey);
    if (isSiteLanguage(storedLanguage)) setLanguage(storedLanguage);
    if (isUnitSystem(storedUnits)) setUnits(storedUnits);

    let mounted = true;
    let authEventReceived = false;
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
      if (id) void loadProfilePreferences(id);
    });

    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (!mounted || authEventReceived) return;
      if (error) {
        console.error('[SitePreferencesProvider] Unable to identify current user:', error.message);
      } else if (user) {
        activeUserId.current = user.id;
        setUserId(user.id);
        void loadProfilePreferences(user.id);
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
