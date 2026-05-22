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
    // 1. Récupérer toutes les occurrences de la carte (pour gérer les doublons de lignes)
    const { data: existingRows, error: selectError } = await supabase
      .from('user_cards')
      .select('id, count')
      .eq('user_id', user_id)
      .eq('card_id', card_id);

    if (selectError) {
      console.error('[ajouterCarteAuJoueur] Erreur de lecture user_cards:', selectError.message);
    }

    if (existingRows && existingRows.length > 0) {
      // Calculer le total actuel
      const totalCount = existingRows.reduce((acc, row) => acc + (row.count || 1), 0);
      const newCount = totalCount + 1;

      // 2. Mettre à jour la première ligne
      const { error: updateError } = await supabase
        .from('user_cards')
        .update({ count: newCount })
        .eq('id', existingRows[0].id);

      if (updateError) {
        console.error('[ajouterCarteAuJoueur] Erreur update:', updateError.message);
        return { success: false, error: updateError.message };
      }

      // 3. Nettoyer les lignes superflues s'il y en avait
      if (existingRows.length > 1) {
        const extraIds = existingRows.slice(1).map(r => r.id);
        await supabase.from('user_cards').delete().in('id', extraIds);
      }

      return { success: true, action: 'incrément', count: newCount };
    } else {
      // 3. Première acquisition
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

        // Tentative de secours : peut-être que la table s'appelle 'users_cards' ?
        console.log('[ajouterCarteAuJoueur] Tentative sur users_cards...');
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
    }
  } catch (err: any) {
    console.error('[ajouterCarteAuJoueur] Erreur critique:', err.message);
    return { success: false, error: err.message };
  }
}