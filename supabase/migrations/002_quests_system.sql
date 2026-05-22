-- Migration : Système de Missions & Contrats

-- 1. Table des Quêtes disponibles
CREATE TABLE IF NOT EXISTS public.quests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    reward_ap INTEGER NOT NULL DEFAULT 100,
    required_count INTEGER DEFAULT 1,
    quest_type TEXT NOT NULL, -- 'booster_open', 'marketplace_sell', 'collection_target', 'daily_login'
    rarity_requirement TEXT, -- Optionnel: 'Epic', 'Legend', 'Icon'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table de progression utilisateur
CREATE TABLE IF NOT EXISTS public.user_quests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE,
    current_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'claimed')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, quest_id)
);

-- Activer RLS
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;

-- Politiques
CREATE POLICY "Quests are viewable by all" ON public.quests FOR SELECT USING (true);
CREATE POLICY "Users can view their own quest progress" ON public.user_quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can update progress" ON public.user_quests FOR ALL USING (auth.uid() = user_id);

-- Initial Data (Exemples)
INSERT INTO public.quests (title, description, reward_ap, required_count, quest_type)
VALUES 
('Apprenti Collectionneur', 'Ouvrez votre premier pack de boosters.', 250, 1, 'booster_open'),
('Vendeur Agile', 'Listez une carte sur le Marketplace.', 150, 1, 'marketplace_sell'),
('Chasseur d''Icônes', 'Possédez une carte de rareté Icon.', 1000, 1, 'collection_target');
