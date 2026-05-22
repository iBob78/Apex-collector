import { supabase } from '@/lib/supabaseClient';

/**
 * Récupère le profil complet d'un utilisateur, y compris son solde AP.
 */
export async function getUserProfile(userId: string) {
    if (!userId) return { data: null, error: 'UserId manquant' };

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('[getUserProfile] Erreur:', error.message);
        return { data: null, error: error.message };
    }

    return { data, error: null };
}

/**
 * Déduit un montant d'AP du solde de l'utilisateur.
 * Vérifie d'abord si le solde est suffisant.
 */
export async function deductAP(userId: string, amount: number) {
    if (!userId || amount <= 0) return { success: false, error: 'Paramètres invalides' };

    try {
        // 1. Récupérer le solde actuel
        const { data: profile, error: fetchError } = await getUserProfile(userId);

        if (fetchError || !profile) {
            return { success: false, error: 'Impossible de récupérer le profil' };
        }

        const currentAP = profile.ap || 0;

        if (currentAP < amount) {
            return { success: false, error: 'Solde AP insuffisant' };
        }

        // 2. Déduire le montant
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ ap: currentAP - amount })
            .eq('id', userId);

        if (updateError) {
            console.error('[deductAP] Erreur update:', updateError.message);
            return { success: false, error: updateError.message };
        }

        return { success: true, newBalance: currentAP - amount };
    } catch (err: any) {
        console.error('[deductAP] Erreur critique:', err.message);
        return { success: false, error: err.message };
    }
}
