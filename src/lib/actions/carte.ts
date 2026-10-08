import { supabase } from '@/lib/supabaseClient';

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

      return { success: true, action: 'insertion (via users_cards)' };
    }

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

    return { success: true, action: 'insertion' };
  } catch (err: any) {
    console.error('[ajouterCircuitAuJoueur] Erreur critique:', err.message);
    return { success: false, error: err.message };
  }
}
