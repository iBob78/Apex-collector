# Apex Battle — Palmarès du pilote V1

## Objectif

Intégrer une carrière de joueur dans `/profile` et le showroom public `/showroom/[username]`. Ce palmarès réutilise **exclusivement les batailles terminées et validées côté Supabase** dans `battle_training_matches`, depuis l'activation du mode entraînement. Pas de reconstitution fictive de matches locaux ou antérieurs.

## Éléments affichés

- Statistiques : batailles terminées, victoires, défaites, nuls, taux de victoire (victoires / parties terminées), meilleure série, série en cours, meilleur score sur 10 et nombre de victoires 10–0.
- Records automobiles : voiture ayant **gagné le plus de manches**, voiture la **plus utilisée** en nombre de batailles jouées, avec modèle et photo du catalogue si disponible. Une voiture vendue ou retirée reste comptée dans l'historique ; le compteur ne suppose pas une possession actuelle.
- Six trophées permanents **calculés** : Première victoire (1), Combattant (10), Vétéran (25), Champion (50), Légende (100) et Imbattable (une victoire 10–0). Les trophées ne nécessitent pas d'écriture et ne donnent **aucun AC ni booster supplémentaire**.
- Propriétaire seulement : total des AC **effectivement attribués** en entraînement, boosters offerts et historique des 20 derniers matchs terminés. Les dix manches de chaque match sont consultables : statistique choisie, valeurs brutes HP/Nm/km/h/s/kg/IP et gagnant. L'historique et les AC gagnés ne sont pas affichés aux visiteurs.
- Showroom public : récapitulatif, voitures marquantes et trophées. Le contenu est invisible si `showroom_public = false`. Respect de la visibilité du showroom déjà gérée par l'application.

## Données et confidentialité

- SQL **appliqué** : `supabase/migrations/051_battle_pilot_palmares.sql`, migration Supabase `20261113122535_battle_pilot_palmares` (13 novembre 2026). Ne pas réappliquer.
- RPC `get_battle_pilot_palmares(p_username TEXT DEFAULT NULL)`, uniquement `authenticated`, avec `auth.uid()` et `search_path=''`. `p_username=NULL` retourne les données privées du joueur connecté. Un pseudo non privé retourne les agrégats publics seulement, sans dernier match, cartes adverses ou solde AC. Le pseudo d'un showroom privé renvoie `{available:false}`.
- Pas de `GRANT SELECT` sur `battle_training_matches`. Les agrégations sont calculées côté PostgreSQL avec `SECURITY DEFINER`, et l'historique est limité à 20 en SQL.
- Le nombre de boosters compte les cadeaux offerts via les victoires gagnantes (`awarded_booster_slug`), même si déjà ouverts.
- Pas de changement à la logique d'attribution de 250 AC ou de booster Common/Uncommon toutes les dix victoires ; la migration est en lecture uniquement.
- Pas de compteurs PvP dans la V1 ; les futurs résultats PvP doivent disposer de statistiques séparées.

## Compatibilité et déploiement

- L'interface affiche un message si la RPC n'existe pas encore (migration 051 absente) ; ne pas afficher des zéros trompeurs.
- **Migration appliquée sur Supabase** avec accord explicite. Avant installation, le SQL avait été vérifié dans une transaction `ROLLBACK`. Après installation : RPC présente, droits `authenticated` accordés, droits `anon` refusés, aucune lecture directe de `battle_training_matches`, RLS conservée. Aucun AC, booster ou match n'a été modifié par cette migration de lecture.
- Tests SQL après application : sur un compte ayant déjà une bataille validée, retour de **1 victoire, 250 AC cumulés**, historique des dix manches et deux voitures record. Pour un autre utilisateur consultant un showroom public, aucun historique privé ni AC remporté n'est renvoyé. Un showroom privé retourne `available:false`. Fonction `SECURITY DEFINER` volontairement exposée seulement aux joueurs authentifiés, sous contrôle de `auth.uid()` et de la visibilité du showroom.
- La preview Vercel du commit `b6c272b` a été vérifiée `READY`, et les workflows CI, Tests, Pull Request Checks ont réussi. Le workflow externe Dependency Review/Snyk était en échec et reste à examiner indépendamment. Le contrôle visuel réel sur smartphone et PC (badges, voitures record, historique) reste à faire après fusion.
- Tests : `src/lib/battle/__tests__/palmares.test.ts` couvre les six trophées, la sélection de 20 matchs, la séparation public/privé et l'état sans historique.

## Points de recette

1. Profil avec zéro bataille : statistiques à zéro, aucun trophée débloqué, historique vide.
2. Après une vraie victoire : +1 victoire et +250 AC dans le total personnel ; comptage correct des manches et de la voiture la plus victorieuse.
3. Showroom public : n'afficher que le résumé, les trophées et les deux voitures ; jamais les AC gagnés ni la liste des 20 parties.
4. Basculer le showroom en privé : visiteurs ne doivent plus accéder à son palmarès via la RPC ni la page showroom.
5. Matchs nuls/défaites : fin de série ; un 10–0 débloque Imbattable. Aucun trophée ne rajoute des AC.
6. Envisager de tester le palmarès sous charge si l'historique atteint plusieurs milliers de parties ; le RPC agrège des données historiques sans matérialisation.
