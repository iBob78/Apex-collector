import { supabase } from '@/lib/supabaseClient';
import { updateQuestProgress } from './objectives';

/**
 * Ajoute une carte à la collection du joueur.
 * Si le joueur l'a déjà, on incrémente la quantité.
 */
export async function ajouterCarteAuJoueur(user_id: string, card_id: string, source = 'booster') {
  if (!user_id || !card_id) {
    console.error('[ajouterCarteAuJoueur] Paramètres manquants:', { user_id, card_id });
    return { success: false, error: 'Paramètres manquants' };
  }

  try {
    let { data: card, error: cardError } = await supabase
      .from('cards')
      .select('is_active, booster_enabled, rarity')
      .eq('card_id', card_id)
      .maybeSingle();

    if (!card && !cardError) {
      const fallback = await supabase
        .from('cards')
        .select('is_active, booster_enabled, rarity')
        .eq('id', card_id)
        .maybeSingle();
      card = fallback.data;
      cardError = fallback.error;
    }

    if (cardError) {
      console.error('[ajouterCarteAuJoueur] Erreur de vérification de carte:', cardError.message);
      return { success: false, error: cardError.message };
    }
    if (!card || !card.is_active) {
      return { success: false, error: 'Cette carte est désactivée ou introuvable.' };
    }
    if (source.startsWith('pack_') && !card.booster_enabled) {
      return { success: false, error: 'Cette carte ne peut plus être obtenue dans les boosters.' };
    }

    const { data: existingRows, error: selectError } = await supabase
      .from('user_cards')
      .select('id, count')
      .eq('user_id', user_id)
      .eq('card_id', card_id);

    if (selectError) {
      console.error('[ajouterCarteAuJoueur] Erreur de lecture user_cards:', selectError.message);
    }

    if (existingRows && existingRows.length > 0) {
      const totalCount = existingRows.reduce((acc, row) => acc + (row.count || 1), 0);
      const newCount = totalCount + 1;

      const { error: updateError } = await supabase
        .from('user_cards')
        .update({ count: newCount })
        .eq('id', existingRows[0].id);

      if (updateError) {
        console.error('[ajouterCarteAuJoueur] Erreur update:', updateError.message);
        return { success: false, error: updateError.message };
      }

      if (existingRows.length > 1) {
        const extraIds = existingRows.slice(1).map(r => r.id);
        await supabase.from('user_cards').delete().in('id', extraIds);
      }

      await updateQuestProgress(user_id, 'collection_count');
      await updateQuestProgress(user_id, 'rarity_card', 1, { rarity: card.rarity ?? undefined });
      return { success: true, action: 'incrément', count: newCount };
    }

    const { error: insertError } = await supabase
      .from('user_cards')
      .insert({
        user_id,
        card_id,
        count: 1,
        source
      });

    if (insertError) {
      console.error('[ajouterCarteAuJoueur] Erreur insert:', insertError.message);

      const { error: secondAttemptError } = await supabase
        .from('users_cards')
        .insert({
          user_id,
          card_id,
          quantity: 1,
          source
        });

      if (secondAttemptError) {
        console.error('[ajouterCarteAuJoueur] Échec final:', secondAttemptError.message);
        return { success: false, error: secondAttemptError.message };
      }

      await updateQuestProgress(user_id, 'collection_count');
      await updateQuestProgress(user_id, 'rarity_card', 1, { rarity: card.rarity ?? undefined });
      return { success: true, action: 'insertion (via users_cards)' };
    }

    await updateQuestProgress(user_id, 'collection_count');
    await updateQuestProgress(user_id, 'rarity_card', 1, { rarity: card.rarity ?? undefined });
    return { success: true, action: 'insertion' };
  } catch (err: any) {
    console.error('[ajouterCarteAuJoueur] Erreur critique:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Ajoute un circuit à la collection du joueur.
 * L’algorithme est identique à celui des cartes pour garder une collection homogène.
 */
export async function ajouterCircuitAuJoueur(user_id: string, circuit_id: string) {
  if (!user_id || !circuit_id) {
    console.error('[ajouterCircuitAuJoueur] Paramètres manquants:', { user_id, circuit_id });
    return { success: false, error: 'Paramètres manquants' };
  }

  try {
    const { data: existingRows, error: selectError } = await supabase
      .from('user_circuits')
      .select('id, count')
      .eq('user_id', user_id)
      .eq('circuit_id', circuit_id);

    if (selectError) {
      console.error('[ajouterCircuitAuJoueur] Erreur de lecture user_circuits:', selectError.message);
    }

    if (existingRows && existingRows.length > 0) {
      const totalCount = existingRows.reduce((acc, row) => acc + (row.count || 1), 0);
      const newCount = totalCount + 1;

      const { error: updateError } = await supabase
        .from('user_circuits')
        .update({ count: newCount })
        .eq('id', existingRows[0].id);

      if (updateError) {
        console.error('[ajouterCircuitAuJoueur] Erreur update:', updateError.message);
        return { success: false, error: updateError.message };
      }

      if (existingRows.length > 1) {
        const extraIds = existingRows.slice(1).map(r => r.id);
        await supabase.from('user_circuits').delete().in('id', extraIds);
      }

      await updateQuestProgress(user_id, 'circuit_collection');
      return { success: true, action: 'incrément', count: newCount };
    }

    const { error: insertError } = await supabase
      .from('user_circuits')
      .insert({
        user_id,
        circuit_id,
        count: 1
      });

    if (insertError) {
      console.error('[ajouterCircuitAuJoueur] Erreur insert user_circuits:', insertError.message);
      return { success: false, error: insertError.message };
    }

    await updateQuestProgress(user_id, 'circuit_collection');
    return { success: true, action: 'insertion' };
  } catch (err: any) {
    console.error('[ajouterCircuitAuJoueur] Erreur critique:', err.message);
    return { success: false, error: err.message };
  }
}

export async function ajouterPiloteAuJoueur(user_id: string, driver_id: string, source = 'booster') {
  if (!user_id || !driver_id) {
    console.error('[ajouterPiloteAuJoueur] Paramètres manquants:', { user_id, driver_id });
    return { success: false, error: 'Paramètres manquants' };
  }

  try {
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('is_active, booster_enabled, rarity')
      .eq('driver_id', driver_id)
      .maybeSingle();

    if (driverError) {
      console.error('[ajouterPiloteAuJoueur] Erreur de vérification du pilote:', driverError.message);
      return { success: false, error: driverError.message };
    }
    if (!driver || !driver.is_active) {
      return { success: false, error: 'Ce pilote est désactivé ou introuvable.' };
    }
    if (source.startsWith('pack_') && !driver.booster_enabled) {
      return { success: false, error: 'Ce pilote ne peut plus être obtenu dans les boosters.' };
    }

    const { data: existing, error: selectError } = await supabase
      .from('user_drivers')
      .select('id, count')
      .eq('user_id', user_id)
      .eq('driver_id', driver_id)
      .maybeSingle();

    if (selectError) {
      console.error('[ajouterPiloteAuJoueur] Erreur de lecture user_drivers:', selectError.message);
      return { success: false, error: selectError.message };
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('user_drivers')
        .update({ count: (Number(existing.count) || 0) + 1 })
        .eq('id', existing.id)
        .eq('user_id', user_id);

      if (updateError) {
        console.error('[ajouterPiloteAuJoueur] Erreur update:', updateError.message);
        return { success: false, error: updateError.message };
      }
    } else {
      const { error: insertError } = await supabase
        .from('user_drivers')
        .insert({ user_id, driver_id, count: 1, source });

      if (insertError) {
        console.error('[ajouterPiloteAuJoueur] Erreur insert user_drivers:', insertError.message);
        return { success: false, error: insertError.message };
      }
    }

    await updateQuestProgress(user_id, 'collection_count');
    await updateQuestProgress(user_id, 'rarity_card', 1, { rarity: driver.rarity ?? undefined });
    return { success: true };
  } catch (error) {
    console.error('[ajouterPiloteAuJoueur] Erreur critique:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue pendant l’ajout du pilote.',
    };
  }
}
