import { supabase } from '@/lib/supabaseClient';

export async function ajouterCarteAuJoueur(user_id: string, card_id: string, source = 'booster') {
  const { data, error } = await supabase
    .from('user_cards')
    .select('id, quantity')
    .eq('user_id', user_id)
    .eq('card_id', card_id)
    .maybeSingle(); // 👈 sécurise même si aucune ligne trouvée

  if (error) {
    console.error('Supabase renvoie une erreur inattendue :', error);
    // Tu peux laisser passer si c’est vide, ou log pour le debug
  }

  if (data) {
    const { error: updateError } = await supabase
      .from('user_cards')
      .update({ quantity: data.quantity + 1 })
      .eq('id', data.id);

    if (updateError) {
      console.error('Erreur update :', updateError);
      return { success: false, error: updateError };
    }

    return { success: true, action: 'incrément' };
  } else {
    const { error: insertError } = await supabase.from('user_cards').insert({
      user_id,
      card_id,
      quantity: 1,
      source,
    });

    if (insertError) {
      console.error('Erreur insert :', insertError);
      return { success: false, error: insertError };
    }

    return { success: true, action: 'insertion' };
  }
}