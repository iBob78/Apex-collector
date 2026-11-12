# Apex Battle — Récompenses d’entraînement (PR #27)

## Règles
- Victoire contre ordinateur : +250 AC dans profiles.ap.
- Défaite ou nul : 0 AC et aucune progression vers le palier.
- Toutes les 10 victoires cumulées : exactement un booster Common ou Uncommon, 50 % / 50 %, de 6 cartes.
- Le cadeau est conservé dans user_gift_boosters sous la clé unique battle_training_10_N et apparaît dans Boosters > Vos cadeaux offerts.
- Aucune rétroactivité pour les entraînements terminés avant activation.

## Autorité serveur, confidentialité et anti-doublon
- Migration en attente : supabase/migrations/048_apex_battle_training_rewards.sql (NE PAS appliquer sans validation).
- battle_training_matches conserve les dix snapshots de chaque équipe, les manches, le vainqueur et les montants. Table RLS sans SELECT/INSERT/UPDATE/DELETE client.
- start_training_battle(uuid[]) vérifie les dix cartes réellement possédées, la validité des statistiques, l’activité du catalogue et les modèles canoniques distincts. Le serveur prépare l’équipe adverse de façon variable et ne retourne aucun identifiant adverse à la création.
- play_training_battle_round(uuid,text) contrôle l’identité du joueur, son tour, les usages limités à deux par caractéristique et calcule les points depuis les snapshots figés. Le bot choisit ses critères uniquement à partir de sa carte courante.
- La dixième manche termine la partie et accorde les 250 AC et l’éventuel booster dans UNE transaction PostgreSQL. Le verrouillage des parties/profils, l’unicité de la clé de cadeau et le statut terminé protègent contre les doubles récompenses.
- Les RPC SECURITY DEFINER utilisent search_path vide, vérifient auth.uid(), retirent EXECUTE à PUBLIC et anon, et ne donnent EXECUTE qu’à authenticated. Vérification de la migration obligatoire avant son activation.

## Comportement de preview sans migration
- Le mode d’entraînement reste jouable en local si la RPC n’existe pas (PGRST202/42883), mais ne crédite AUCUN AC et ne distribue AUCUN booster ; le message utilisateur le précise.
- Une erreur d’autorisation ou une incohérence de serveur bloque le gain plutôt que de permettre au navigateur de fabriquer un résultat.
- READY sur Vercel signifie build réussi, pas validation des RPC ou des écritures Supabase.

## Recette après validation explicite de SQL 048
1. Appliquer la migration selon la procédure existante de gestion des changements Supabase ; contrôler les politiques RLS, droits EXECUTE et index.
2. Tester dix cartes possédées et dix manches, choix alternés, bot non divulgué, victoire/défaite/nul, abandon, doublons et stats incomplètes.
3. Préparer neuf victoires sur un compte de test puis atteindre la dixième : +250 AC une seule fois, cadeau Common ou Uncommon de 6 cartes une seule fois.
4. Retenter la dernière RPC, en concurrentiel, depuis un autre compte et en anon : aucune attribution supplémentaire.
5. Vérifier le cadeau dans Boosters et son ouverture, puis le prochain palier à vingt victoires ; contrôler le solde et le compteur après reconnexion.
6. Tester sur smartphone et PC avant toute fusion sur main.

## Limites
- Pas de plafond quotidien ajouté : ce besoin n’en mentionne pas. Le farm automatisé de matchs et les gains AC restent un sujet à encadrer avant une ouverture large.
- L’ouverture des boosters offerts est gérée par le flux existant ; les limites de transaction entre tirage et sauvegarde de cartes ne changent pas.
- Aucune migration exécutée sur Supabase dans cette PR. Aucun AC existant n’est modifié avant validation et installation.
