'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ajouterCarteAuJoueur, ajouterCircuitAuJoueur, ajouterPiloteAuJoueur } from '@/lib/actions/carte';
import { deductAP } from '@/lib/actions/profile';
import { drawBoosterCards, getBoosterCardIdentity, getFirstTimeBoosterCardIndices, isPurchasablePackSlug, PACKS, WELCOME_GIFT_KEY } from '@/lib/boosters';
import { fetchAllPages } from '@/lib/fetchAllPages';
import ClassicBoosterOpening from '@/components/Boosters/ClassicBoosterOpening';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

function OpenContent() {
  const { t } = useSitePreferences();
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedPackSlug = searchParams.get('pack') || 'common';
  const dailyBoosterId = searchParams.get('daily_booster');
  const giftBoosterId = searchParams.get('gift_booster');
  const [giftBooster, setGiftBooster] = useState<{ packSlug: string; cardCount: number; giftKey: string } | null>(null);
  const [giftBoosterError, setGiftBoosterError] = useState<string | null>(null);
  const [dailyPackSlug, setDailyPackSlug] = useState<string | null>(null);
  const [dailyBoosterError, setDailyBoosterError] = useState<string | null>(null);
  const packSlug = giftBoosterId ? giftBooster?.packSlug || 'common'
    : dailyBoosterId ? dailyPackSlug || 'common' : requestedPackSlug;
  const pack = PACKS[packSlug] || PACKS.common;
  const cardCount = giftBoosterId ? (giftBooster?.cardCount ?? 0) : pack.cardCount;
  const packDisplayName = giftBoosterId && giftBooster?.giftKey === WELCOME_GIFT_KEY ? t('Booster de bienvenue') : t(pack.name);
  const purchaseError = !dailyBoosterId && !giftBoosterId && !isPurchasablePackSlug(requestedPackSlug)
    ? t('Ce booster est réservé aux cadeaux et ne peut pas être acheté.') : null;
  const freeBoosterError = giftBoosterError || dailyBoosterError || purchaseError;

  const [userId, setUserId] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [isPrepared, setIsPrepared] = useState(false);
  const [drawnCards, setDrawnCards] = useState<any[]>([]);
  const [firstTimeCardIndices, setFirstTimeCardIndices] = useState<Set<number>>(() => new Set());
  const [discoverySaveError, setDiscoverySaveError] = useState<string | null>(null);
  const [boosterStatsSaveError, setBoosterStatsSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Check authentication and load the owned daily booster, if requested.
  useEffect(() => {
    let active = true;
    const loadOpeningContext = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) {
          router.push('/login');
          return;
        }

        if (dailyBoosterId && giftBoosterId) {
          if (active) setGiftBoosterError(t('Un seul booster offert peut être ouvert à la fois.'));
        } else if (giftBoosterId) {
          const { data, error } = await supabase
            .from('user_gift_boosters')
            .select('gift_key, pack_slug, card_count')
            .eq('id', giftBoosterId)
            .eq('user_id', user.id)
            .is('opened_at', null)
            .maybeSingle();
          if (error) throw error;
          if (!data || !PACKS[data.pack_slug] || !Number.isInteger(data.card_count)
            || data.card_count < 1 || data.card_count > 20) {
            if (active) setGiftBoosterError(t('Ce cadeau est indisponible ou a déjà été ouvert.'));
          } else if (active) {
            setGiftBooster({ packSlug: data.pack_slug, cardCount: data.card_count, giftKey: data.gift_key });
          }
        } else if (dailyBoosterId) {
          const { data, error } = await supabase
            .from('user_daily_boosters')
            .select('pack_slug')
            .eq('id', dailyBoosterId)
            .eq('user_id', user.id)
            .is('opened_at', null)
            .maybeSingle();
          if (error) throw error;
          if (!data || !PACKS[data.pack_slug]) {
            if (active) setDailyBoosterError(t('Ce booster offert est indisponible ou a déjà été ouvert.'));
          } else if (active) {
            setDailyPackSlug(data.pack_slug);
          }
        }

        if (active) {
          setUserId(user.id);
          setLoading(false);
        }
      } catch (error) {
        console.error('[OpenBoosterPage] Impossible de charger le booster:', error);
        if (active) {
          if (giftBoosterId) setGiftBoosterError(t('Impossible de vérifier ce cadeau.'));
          else setDailyBoosterError(t('Impossible de vérifier ce booster offert.'));
          setLoading(false);
        }
      }
    };
    void loadOpeningContext();
    return () => { active = false; };
  }, [router, dailyBoosterId, giftBoosterId, t]);

  // 2. Logic to Open Pack
  const handleOpenPack = async () => {
    if (!userId || isOpening || isPrepared) return;
    if (dailyBoosterId && giftBoosterId) return;
    if (dailyBoosterId && (!dailyPackSlug || dailyBoosterError)) return;
    if (giftBoosterId && (!giftBooster || giftBoosterError)) return;
    if (purchaseError) return;

    setIsOpening(true);
    setDiscoverySaveError(null);
    setBoosterStatsSaveError(null);

    try {
      // Charger les catalogues avant paiement évite de débiter si le tirage est impossible.
      const [vehicleCards, circuitCards, driverCards] = await Promise.all([
        fetchAllPages((from, to) => supabase.from('cards')
          .select('*')
          .eq('is_active', true)
          .order('id')
          .range(from, to)),
        fetchAllPages((from, to) => supabase.from('circuits')
          .select('*')
          .order('id')
          .range(from, to)),
        fetchAllPages((from, to) => supabase.from('drivers')
          .select('*')
          .eq('is_active', true)
          .order('id')
          .range(from, to)),
      ]);

      const results = drawBoosterCards(
        packSlug,
        vehicleCards,
        circuitCards,
        cardCount,
        Math.random,
        driverCards
      );

      // Read ownership BEFORE saving: "NEW!" must mean absent from the original collection.
      // If a read fails, suppress the cosmetic badge without blocking the booster opening.
      const vehicleIds = results.filter((card) => card.category !== 'circuit' && card.category !== 'driver')
        .map((card) => String(card.card_id || card.id));
      const circuitIds = results.filter((card) => card.category === 'circuit')
        .map((card) => String(card.circuit_id || card.id));
      const driverIds = results.filter((card) => card.category === 'driver')
        .map((card) => String(card.driver_id || card.id));
      const [ownedVehiclesResult, ownedCircuitsResult, ownedDriversResult] = await Promise.all([
        vehicleIds.length
          ? supabase.from('user_cards').select('card_id, count').eq('user_id', userId).in('card_id', vehicleIds)
          : Promise.resolve({ data: [], error: null }),
        circuitIds.length
          ? supabase.from('user_circuits').select('circuit_id, count').eq('user_id', userId).in('circuit_id', circuitIds)
          : Promise.resolve({ data: [], error: null }),
        driverIds.length
          ? supabase.from('user_drivers').select('driver_id, count').eq('user_id', userId).in('driver_id', driverIds)
          : Promise.resolve({ data: [], error: null }),
      ]);
      const ownershipVerified = !ownedVehiclesResult.error && !ownedCircuitsResult.error && !ownedDriversResult.error;
      if (!ownershipVerified) {
        console.warn('[Booster] Impossible de vérifier les premières découvertes.', ownedVehiclesResult.error || ownedCircuitsResult.error || ownedDriversResult.error);
      }

      if (giftBoosterId) {
        const { data, error } = await supabase.rpc('consume_player_gift_booster', {
          p_booster_id: giftBoosterId,
        });
        if (error || !data?.success || data.pack_slug !== packSlug || data.card_count !== cardCount) {
          console.error('[Booster] Impossible de consommer le cadeau:', error?.message ?? data?.error);
          setGiftBoosterError(t('Impossible d’ouvrir ce cadeau.'));
          setIsOpening(false);
          return;
        }
      } else if (dailyBoosterId) {
        const { data, error } = await supabase.rpc('consume_daily_login_booster', {
          p_booster_id: dailyBoosterId,
        });
        if (error) {
          console.error('[Booster] Impossible de consommer le booster quotidien:', error.message);
          setDailyBoosterError(t('Impossible d’ouvrir ce booster offert.'));
          setIsOpening(false);
          return;
        }
        if (!data?.success || data.pack_slug !== packSlug) {
          setDailyBoosterError(t(data?.error || 'Ce booster offert est indisponible ou a déjà été ouvert.'));
          setIsOpening(false);
          return;
        }
      } else {
        // 1. Deduct AC only for a pack bought from the shop.
        const deduction = await deductAP(userId, pack.price);
        if (!deduction.success) {
          alert(`${t('Erreur')}: ${deduction.error}`);
          setIsOpening(false);
          return;
        }
      }

      // 2. Sauvegarde dans la collection du joueur
      let pendingDriverAddition: Promise<void> = Promise.resolve();
      const additions = await Promise.all(
        results.map(async (card) => {
          const isDriver = card.category === 'driver';
          const isCircuit = (card.category === 'circuit') || (card.type === 'Circuit') || (card.track_name != null);
          const uniqueId = String(isDriver
            ? card.driver_id || card.id
            : isCircuit
              ? card.circuit_id || card.id
              : card.card_id || card.id);

          if (isDriver) {
            const addition = pendingDriverAddition.then(() =>
              ajouterPiloteAuJoueur(userId, uniqueId, `pack_${packSlug}`),
            );
            pendingDriverAddition = addition.then(() => undefined);
            return addition;
          }
          if (isCircuit) {
            return ajouterCircuitAuJoueur(userId, uniqueId);
          }

          return ajouterCarteAuJoueur(userId, uniqueId, `pack_${packSlug}`);
        })
      );

      const firstTimeIndices = ownershipVerified
        ? getFirstTimeBoosterCardIndices(
            results,
            ownedVehiclesResult.data || [],
            ownedCircuitsResult.data || [],
            additions.map((addition) => addition.success),
            ownedDriversResult.data || [],
          )
        : new Set<number>();
      setFirstTimeCardIndices(firstTimeIndices);
      if (firstTimeIndices.size > 0) {
        const discoveries = Array.from(firstTimeIndices).flatMap((index) => {
          const identity = getBoosterCardIdentity(results[index]);
          return identity
            ? [{ user_id: userId, category: identity.category, card_id: identity.cardId }]
            : [];
        });

        if (discoveries.length > 0) {
          const { error } = await supabase
            .from('user_card_discoveries')
            .upsert(discoveries, {
              onConflict: 'user_id,category,card_id',
              ignoreDuplicates: true,
            });
          if (error) {
            console.error('[Booster] Impossible d’enregistrer les nouvelles cartes:', error);
            setDiscoverySaveError(t('Impossible de sauvegarder les nouvelles cartes du tirage.'));
          }
        }
      }
      setDrawnCards(results);

      // 3. Mettre à jour la progression des quêtes
      const { error: boosterProgressError } = await supabase.rpc('record_objective_progress', {
        p_objective_type: 'booster_open',
        p_amount: 1,
        p_rarity: null,
      });
      if (boosterProgressError) {
        console.error('[Booster] Impossible d’enregistrer le tirage du booster:', boosterProgressError.message);
        setBoosterStatsSaveError(t('Impossible d’enregistrer ce tirage dans les statistiques du showroom.'));
      }

      // Délai pour l'animation de "déchirure" du pack
      setIsPrepared(true);
      setIsOpening(false);

    } catch (err) {
      console.error('Erreur lors de l\'ouverture du pack:', err);
      alert(t('Une erreur est survenue lors de l\'ouverture.'));
      setIsOpening(false);
    }
  };

  if (loading) return null;

  return (
    <ClassicBoosterOpening
      key={[packSlug, dailyBoosterId || '', giftBoosterId || ''].join(':')}
      pack={pack}
      packDisplayName={packDisplayName}
      cardCount={cardCount}
      isPrepared={isPrepared}
      isOpening={isOpening}
      isFreeBooster={Boolean(dailyBoosterId || giftBoosterId)}
      freeBoosterError={freeBoosterError}
      purchaseDisabled={Boolean(
        (dailyBoosterId && (!dailyPackSlug || dailyBoosterError))
        || (giftBoosterId && (!giftBooster || giftBoosterError))
        || purchaseError
      )}
      drawnCards={drawnCards}
      firstTimeCardIndices={firstTimeCardIndices}
      discoverySaveError={discoverySaveError}
      boosterStatsSaveError={boosterStatsSaveError}
      onOpen={handleOpenPack}
      onBack={() => router.push('/boosters')}
    />
  );
}

export default function OpenBoosterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <OpenContent />
    </Suspense>
  );
}