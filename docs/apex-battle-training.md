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

## Sélection : parité avec la collection (11 novembre 2026)
- Sur smartphone, la grille de préparation affiche **quatre cartes par ligne** comme la collection, avec le rendu `Card.mobileGrid`, une touche directe sur la carte et un bouton compact d'ajout/retrait. Les cartes des duels restent au format original.
- La liste propose les filtres **favoris**, recherche par marque/modèle/nom/année, **rareté** et les tris **nom**, **marque A–Z/Z–A**, **IP croissant/décroissant**, **niveau croissant/décroissant**, **rareté** et **date d'ajout**.
- Seules les **voitures possédées, actives et éligibles** sont listées : les onglets Circuits/Pilotes et « Masquer les cartes non déverrouillées » n'ont pas de sens dans ce contexte.
- Les favoris et les niveaux proviennent des tables existantes ; un chargement des favoris en échec n'empêche pas d'afficher la collection. Les tris de niveaux n'affectent jamais les résultats des duels.
- Tout changement de filtre remet le compteur visuel à 24 cartes, sans réinitialiser les 10 cartes déjà sélectionnées. Tests de logique dans `src/lib/battle/__tests__/selection.test.ts`.

## Correctifs responsive et fin de partie (12 novembre 2026)
- Les deux cartes du duel réutilisent le composant de la collection avec le mode responsive `mobileGrid`. Elles restent sur deux colonnes dans l'arène mais se rétractent à la largeur disponible sur smartphone, avec `min-w-0` et `w-full`, sans toucher aux cartes de collection ou aux quatre colonnes de sélection.
- Le contenu chiffré de ces cartes est construit depuis les `BattleVehicleSnapshot` du match, pas depuis des valeurs recalculées séparément. L'apparence (image, rareté, structure) continue d'utiliser `Card`.
- **Cause du décalage de puissance** : `cards.power_hp` représente des HP ; `Card` de la collection utilise `formatPower` et affiche des CV métriques. Les choix de caractéristiques utilisaient les HP bruts. `src/lib/battle/display.ts` réutilise les convertisseurs de `src/lib/preferences.ts` pour les choix et résultats, alors que les comparaisons restent sur les valeurs d'origine. Exemple : 740 HP = 750 CV affichés dans le contexte métrique ; les 740 HP restent la référence du moteur, sans changement de puissance ni d'IP.
- Fin de partie : **Rejouer avec mon équipe** relance directement un nouveau match avec les dix mêmes cartes, dans le même ordre. **Changer d'équipe** retourne à la composition des dix cartes en conservant la sélection pour l'ajuster. Quitter un duel retourne également à la sélection.
- Tests : `src/lib/battle/__tests__/display.test.ts` vérifie la cohérence HP/CV, poids, couple, 0–100 et IP.

Aucune migration, aucune modification des profils ou des crédits AC. Vérifier les contrôles GitHub et la preview Vercel avant fusion dans main.

## Rendu des cartes de duel identique à la collection (12 novembre 2026)
- Le catalogue de véhicules Apex Battle utilise désormais `cards.select('*')` avec `fetchAllPages`, comme la collection : les cartes du duel reçoivent tous les champs visuels de `Card`, notamment `country_code` / `country` pour le drapeau, `fuel_type`, `collection_number`, et `power_kw` pour la valeur CV précise.
- Le composant `Card` reste commun à la collection et à Apex Battle. **Sélection des dix cartes** : `mobileGrid` (4 colonnes sur téléphone). **Duel** : `compact` sans `mobileGrid` (2 cartes par ligne), pour éviter de rapetisser l'IP et le logo comme s'il s'agissait de mini-cartes. Les deux restent dans une grille responsive `min-w-0` / `w-full`, donc sans débordement voulu.
- Les statistiques de combat restent issues de `BattleVehicleSnapshot` ; les conversions d'affichage suivent `formatPower` du composant `Card`, y compris le champ `power_kw` lorsqu'il est renseigné. Les valeurs HP utilisées pour comparer les performances sont inchangées.
- À vérifier en preview sur smartphone : badge IP en haut à gauche, logo constructeur puis drapeau national à droite, superposition avec les éventuels badges, et correspondance CV dans les boutons, sur Ferrari, Lamborghini et Mercedes.
- Aucune modification de la collection, de la monnaie AC ou du schéma Supabase.

## Duel cadré dans le viewport mobile (12 novembre 2026)
- Pendant les dix manches uniquement, l'écran mobile masque le grand en-tête et le bloc d'information générale (conservés dans l'écran de composition et sur ordinateur).
- La barre de manche/score, les deux cartes et les six critères ont des espacements plus compacts. Largeur des cartes mobiles bornée à `clamp(118px,36vw,148px)` ; largeur ordinateur et aspect ratio original inchangés. Les cartes utilisent toujours `Card` en mode normal/compact, avec drapeaux, marques et badge IP.
- Les six critères restent **visibles et actionnables** ; leurs boutons passent à une hauteur minimale de 66 px sur mobile seulement, en gardant la grille 2 colonnes.
- L'ouverture d'un duel et le passage d'une manche ou d'un résultat à l'autre réinitialisent le défilement en haut de page : pas de reprise au milieu de la liste de sélection.
- Les petits écrans ou les préférences de police agrandie peuvent nécessiter un défilement supplémentaire : ne jamais verrouiller la hauteur avec `overflow-hidden`.
- Recette : sur téléphone, faire défiler la sélection jusqu'en bas, lancer le duel, confirmer que score + deux cartes + six boutons sont visibles sans grand scroll ; choisir une stat, afficher le résultat, passer à la manche suivante, rejouer et changer d'équipe. Vérifier aussi la présentation sur ordinateur.

## Mise à l'échelle des détails internes (12 novembre 2026)
- Après réduction de la largeur des cartes mobiles à `clamp(118px, 36vw, 148px)`, l'intérieur du composant `Card` gardait ses dimensions fixes (IP, logos, titres, stats), provoquant des chevauchements.
- `ScaledDuelCard` dans `src/app/battle/page.tsx` mesure la largeur réellement disponible via `ResizeObserver` (avec repli sur l'événement `resize`) et affiche la **carte entière** à une largeur de référence de 180 px, réduite proportionnellement au besoin, avec un emplacement `aspect-[2/3]` pour préserver la mise en page.
- Les duels reçoivent `Card` avec la typographie de collection (`compact=false` pour les snapshots), puis l'ensemble est réduit : drapeau, logo, IP, texte et icônes conservent leur position relative. Les cartes mystères utilisent la même échelle.
- Au-delà de 180 px, la carte remplit normalement le conteneur sans zoom. La grille de quatre cartes du sélecteur n'est **pas** modifiée.
- Vérifier le rendu sur écran étroit, pendant la révélation des cartes et sur ordinateur. Ne pas toucher au composant `Card` partagé.
