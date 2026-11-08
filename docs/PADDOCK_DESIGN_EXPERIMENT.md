# APEX RACING DEPARTMENT — refonte motorsport, itération 2

> **Prototype uniquement** sur la branche `feat/visual-overhaul-paddock-20261108` / PR #17 (brouillon). La précédente direction « paddock premium » a été jugée trop proche du site d'origine. Cette itération est une **refonte de composition**, pas une simple recoloration. Ne pas fusionner ni toucher à `main` sans validation explicite.

## Nouvelle direction artistique

**Concept :** grille de départ, endurance, affiches de course, paddock de compétition et chronométrage. Moins de « cartes SaaS » : grands blocs éditoriaux, photographies de course nocturne, rangées techniques, grandes données et navigations numérotées.

- **Palette :** noir carbone `#0a0c0c`, graphite `#171c17`, jaune compétition `#dbff35`, rouge drapeau `#f4523d`, blanc cassé `#f4f5ef`.
- **Typographie :** Barlow Condensed (titres/course/télémétrie), Barlow (texte) et Bebas Neue conservée pour les cartes/packs quand elle est spécifiée. Chargement via l'import Google Fonts de `src/app/globals.css`; pas de dépendance npm.
- **Identité :** rubans « starting grid », damiers, bandes diagonales, index 01 / 02 / 03, contenu en blocs asymétriques, séparateurs francs (coins carrés), panneaux de télémétrie et marque APEX très visible.
- **Animations :** ruban de texte horizontal, élévation discrète au survol, transitions courtes. `prefers-reduced-motion` désactive le défilement du ruban et les mouvements non essentiels. Pas de changement des animations de rareté et de retournement des cartes.
- **Photographies de circuit externes :** photos Pexels **de Tom Verdoot** (« Car on the Racing Course at Dusk », photo 14905468 ; « Racecar Parked on a Pit Stop », photo 14905469), sources :
  - https://www.pexels.com/photo/car-on-the-racing-course-at-dusk-14905468/
  - https://www.pexels.com/photo/racecar-parked-on-a-pit-stop-14905469/
  Les URL `images.pexels.com` sont utilisées en **fond CSS uniquement** dans `race-photo` et `race-photo-soft` ; le fond sombre reste lisible si ces ressources sont indisponibles. Si la politique d'assets du projet l'impose à terme, remplacer ces URL par des médias hébergés et crédités. Ne pas réutiliser les images de course pour présenter une voiture comme possédée par le joueur.

## Ruptures de layout développées

| Écran | Nouveau langage motorsport |
| --- | --- |
| `/` | Affiche pleine largeur de course nocturne, titres démesurés, bande animée « race ticker », trois secteurs illustrés, grille de départ jaune et CTA photo |
| Navigation | Branding de team de course en grand ; menus desktop par numéros de secteur, marquage jaune vif, mobile bottom nav « pit lane », admin toujours accessible selon permissions |
| `/dashboard` | Immense visuel de stand, bloc identité garage, jauge circulaire sur les vraies données, chronométrage à quatre chiffres de collection et accès rapides en modules 01–03 |
| `/collection` | En-tête illustré de type affichage de course, indicateur de complétion réel, nouvelles zones de filtres, grille de cartes inchangée |
| `/boosters` | Boutique façon « pit supply », large visuel et vrai solde AP, packs format boîtes d'équipement avec numéros, prix et CTA marqués, boosters gratuits conservés |
| `/open` | Dos des cartes aux couleurs racing, interface de révélation renforcée, sans modifier le mécanisme du tirage |
| `/marketplace` | Trading floor avec grande photo, total réel des annonces et onglets très visibles ; ventes et achats inchangés |
| `/profile` | Carte d'identité de pilote et licence de compétition avec vrai niveau collectionneur, bloc de statistiques et showroom |
| `/login` | Identité racing pour la connexion/inscription avec photographie des stands en grand écran |
| Écrans secondaires | Contrats/succès, guide, showrooms publics/privés, suggestions, classements et détails de véhicule bénéficient du thème global scoped `apex-paddock`/`paddock-*` ; leurs actions métier restent inchangées |

## Protections fonctionnelles

- **Collection mobile : quatre cartes par ligne**, onglets Tous/Véhicules/Circuits/Pilotes, filtres et favoris, détails et niveaux conservés.
- **Booster mobile : deux packs par ligne** dans la boutique et **trois cartes par ligne** pendant le reveal.
- **Tirages :** probabilités, prix AP, débit, boosters quotidiens offerts, code de sauvegarde, déchirure du sachet, flip, scintillement/halo selon rareté et badge `NEW!` préservés. Pas d'affichage de niveaux pendant un tirage.
- **Comptes :** auth Supabase, permissions admin, showroom privé/public, niveau calculé, solde AP réel et règles RLS inchangés. **Aucune migration ni accès aux données de production**.
- **Langues :** contenus fonctionnels traduits par `t()` ; les libellés décoratifs anglais sont le langage d'édition « racing / paddock » et restent purement décoratifs.
- **Accessibilité :** navigation clavier, aria-labels, éléments réactifs et réduction de mouvement. Vérifier notamment la lisibilité du jaune sur le noir et l'absence de défilement horizontal sur 360/390/430 px.
- **Images :** deux images Pexels décoratives externes ; pas de téléchargement ou d'utilisation du compte privé de l'utilisateur.

## Contrôles nécessaires

1. Attendre les checks GitHub (lint, Jest, compilation, revue des dépendances). Séparer un échec antérieur Dependency Review/Snyk d'une erreur introduite par ce code.
2. Inspecter le Preview Vercel sur PC, tablette, mobile 360, 390 et 430 px. Comparer au site actuel **sans toucher à main**.
3. Tester le parcours connexion → dashboard → collection (4 colonnes) → cartes/niveaux/favoris → boosters (2 colonnes, 3 en reveal, halo/NEW!) → marketplace (achat, vente).
4. Tester le booster gratuit, le classement, les langues, réglages, profil, showrooms privé/public et admin.
5. Confirmer la stabilité des photographies externes, l'option de protection du Preview Vercel et l'absence de débordements sur mobile.

**Statut :** design radical « motorsport » prêt pour prévisualisation et feedback utilisateur. Toute fusion vers `main` reste soumise à demande explicite.
