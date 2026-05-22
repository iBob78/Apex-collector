import { supabase } from '@/lib/supabaseClient';

/**
 * Récupère les quêtes actives de l'utilisateur.
 */
export async function getUserQuests(userId: string) {
    if (!userId) return { data: [], error: 'Non authentifié' };

    try {
        const { data: userQuests, error } = await supabase
            .from('user_quests')
            .select(`
        *,
        quest:quests(*)
      `)
            .eq('user_id', userId);

        if (error) throw error;

        // Si l'utilisateur n'a pas encore de quêtes assignées, on peut en initialiser
        if (!userQuests || userQuests.length === 0) {
            await initializeUserQuests(userId);
            return getUserQuests(userId);
        }

        return { data: userQuests, error: null };
    } catch (err: any) {
        return { data: [], error: err.message };
    }
}

/**
 * Initialise les quêtes pour un nouvel utilisateur.
 */
async function initializeUserQuests(userId: string) {
    const { data: quests, error: fetchError } = await supabase.from('quests').select('id');

    if (fetchError) return;

    if (quests && quests.length > 0) {
        const inserts = quests.map(q => ({
            user_id: userId,
            quest_id: q.id,
            status: 'active',
            current_count: 0
        }));

        await supabase.from('user_quests').insert(inserts);
    }
}

/**
 * Met à jour la progression d'une quête d'un certain type.
 */
export async function updateQuestProgress(userId: string, questType: string, amount = 1, metadata?: { rarity?: string }) {
    if (!userId) return;

    try {
        const { data: userQuests } = await supabase
            .from('user_quests')
            .select('*, quest:quests(*)')
            .eq('user_id', userId)
            .eq('status', 'active');

        if (!userQuests) return;

        for (const uq of userQuests) {
            if (uq.quest.quest_type === questType) {
                // Check rarity requirement if applicable
                if (uq.quest.rarity_requirement && metadata?.rarity !== uq.quest.rarity_requirement) {
                    continue;
                }

                const newCount = (uq.current_count || 0) + amount;
                const isCompleted = newCount >= uq.quest.required_count;

                await supabase
                    .from('user_quests')
                    .update({
                        current_count: Math.min(newCount, uq.quest.required_count),
                        status: isCompleted ? 'completed' : 'active',
                        completed_at: isCompleted ? new Date().toISOString() : null
                    })
                    .eq('id', uq.id);
            }
        }
    } catch (err) {
        console.error('[updateQuestProgress] Erreur:', err);
    }
}

/**
 * Réclame la récompense d'une quête complétée.
 */
export async function claimQuestReward(userId: string, userQuestId: string) {
    try {
        const { data: uq, error: fetchError } = await supabase
            .from('user_quests')
            .select('*, quest:quests(*)')
            .eq('id', userQuestId)
            .single();

        if (fetchError || !uq || uq.status !== 'completed') {
            return { success: false, error: 'Récompense non disponible.' };
        }

        // 1. Ajouter les AP
        const { data: profile } = await supabase.from('profiles').select('ap').eq('id', userId).single();
        if (profile) {
            await supabase
                .from('profiles')
                .update({ ap: (profile.ap || 0) + uq.quest.reward_ap })
                .eq('id', userId);
        }

        // 2. Marquer comme réclamé
        await supabase
            .from('user_quests')
            .update({ status: 'claimed' })
            .eq('id', userQuestId);

        return { success: true, reward: uq.quest.reward_ap };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
