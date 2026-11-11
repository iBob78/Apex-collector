# Apex Battle — entraînement jouable (PR 2)

## Objectif
La route /battle ajoute une interface jouable d'Apex Battle. Cette branche repose sur la PR #26 (moteur V1) ; sa preview doit donc inclure les deux étapes.

## Parcours
1. Se connecter et ouvrir Apex Battle depuis le menu PC ou sous Plus sur mobile.
2. Choisir dix voitures actives, possédées et éligibles. La sélection utilise les champs existants dans cards et user_cards. Les données du catalogue sont chargées par pages de 500 via fetchAllPages.
3. Définir leur ordre par les boutons monter/descendre. Deux versions graphiques du même modèle ne peuvent pas être prises simultanément.
4. Lancer l'entraînement : le jeu compose dix adversaires distincts, proches en IP des voitures choisies.
5. Le joueur sélectionne une caractéristique aux manches impaires, l'ordinateur aux manches paires. Deux usages maximum par joueur et par statistique.
6. La carte adverse est masquée visuellement jusqu'à la sélection du critère, puis la valeur comparée et les points apparaissent.
7. À la dixième manche, le score final et l'historique des manches sont présentés ; le joueur peut recommencer.

## Fichiers
- src/app/battle/page.tsx : interface responsive et lecture de la collection.
- src/lib/battle/training.ts : adversaire et choix automatique équitable, sans regarder les valeurs de la carte du joueur.
- src/lib/battle/__tests__/training.test.ts : tests de sélection, des tours et d'une partie complète.
- src/components/Sidebar.tsx : nouveau lien sur ordinateur et sous Plus sur smartphone ; les 4 raccourcis mobiles existants sont préservés.
- src/lib/battle/engine.ts : moteur existant de la PR #26, inchangé.

## Limites et sécurité
- Entraînement uniquement, calculé dans le navigateur ; aucune écriture Supabase, aucun débit, gain AC ou classement. Une actualisation de la page réinitialise la partie.
- Les cartes de l'ordinateur viennent du catalogue public et ne sont pas les possessions d'un autre joueur.
- Dans cette version solo seulement, les decks sont présents en mémoire du navigateur. Cette approche est **interdite pour les futurs duels PvP** : la PR multijoueur devra cacher les cartes adverses côté serveur avec des politiques RLS adaptées.
- Les statistiques sont les caractéristiques existantes, sans bonus de rareté, doublon ou niveau.
- Les premiers libellés sont en français ; traduction détaillée anglaise/espagnole à prévoir.

## Vérifications
npm test -- --runInBand src/lib/battle/__tests__/engine.test.ts src/lib/battle/__tests__/training.test.ts
npx tsc --noEmit
npm run build

Recette sur preview : ouvrir /battle en étant connecté, ajouter puis retirer dix cartes, les ordonner, tenter une variante de modèle, choisir et vérifier les statistiques, observer la carte adverse et le décompte des dix manches, recommencer sur mobile et PC.

Ne pas fusionner dans main ni modifier Supabase sans validation explicite.
