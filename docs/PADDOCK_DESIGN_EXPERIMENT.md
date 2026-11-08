# APEX / PADDOCK — Expérience graphique expérimentale

Cette branche est un **bac à sable visuel**, isolé de `main`. Ne pas fusionner ou déployer sans validation explicite du créateur.

## Direction artistique

- Univers : garage de collection automobile, instrumentation de compétition, paddock premium.
- Palette : fond bleu-noir graphite (`#080c13`), panneaux pétrole (`#17283a`), bleu clair électrique (`#89e5f7`), champagne métallique (`#e8c38e`) et texte ivoire.
- Typographie : `Bebas Neue` pour les grands titres, chiffres d'instrumentation et sections ; polices existantes ailleurs. Pas de dépendance npm supplémentaire.
- Détails : grille technique à faible contraste, lignes micrométriques, coins coupés par l'éclairage, halos discrets, repères `APEX /...`, lecture des métriques, effets de profondeur et transitions contrôlées.
- Système CSS : `src/app/globals.css`, classes `apex-paddock`, `paddock-*`, appliquées aux pages sélectionnées pour ne pas transformer silencieusement les ateliers admin.

## Surfaces retravaillées

| Zone | Intervention |
| --- | --- |
| Landing `/` | Hero editorial asymétrique et visuel existant `/showcase-card.png`, titres plus expressifs et cartes d'explication premium |
| Navigation | Sidebar PC raffinée, marque, pictogrammes et menu mobile sombre translucide |
| Dashboard `/dashboard` | Panneau de commande, progression écurie factuelle, statistiques conservées et raccourcis à haute lisibilité |
| Collection `/collection` | En-tête, résumé de catalogue, filtres, recherche, séries par constructeur, compteurs |
| Boutique `/boosters` | Packs numérotés, images valorisées, catalogue et boosters gratuits mis en scène |
| Ouverture `/open` | Mise en scène du pack et en-tête de révélation, contrôles existants conservés |
| Marketplace | Présentation boursière, panneaux des annonces, actions et fenêtre de vente |
| Profil | Identité de pilote, statistiques, progression et showroom |
| Connexion | Vue scindée grand écran, visuel du jeu, champs et CTA premium |
| Classement, réglages, guide | Uniformisation des panneaux, titres et contrôles |

## Règles non négociables conservées

- **Mobile :** quatre cartes par rangée dans la collection et trois cartes révélées par rangée dans les boosters ; deux packs par rangée dans la boutique.
- **Desktop :** sidebar visible dès le breakpoint `md`, mise en page des cartes et navigation desktop maintenues.
- **Économie :** solde AP compact en haut à droite du dashboard, prix et tirages inchangés, pas d'AP fictifs.
- **Tirage :** niveaux masqués, premier exemplaire `NEW!`, halo de la rareté et déchirure du booster conservés ; boosters offerts toujours accessibles.
- **Sécurité :** logique RLS, accès admin, données personnelles et état public/privé des showrooms inchangés.
- **Accessibilité :** focus visible et réglage `prefers-reduced-motion` pris en compte dans les nouvelles classes CSS.
- L'encart profil de la sidebar ne montre plus une **progression 65 % fictive** ; il affiche à la place l'adresse du compte et un accès au profil.

## Vérifications avant validation

1. Ouvrir en **360, 390, 430 px** puis tablette et PC ; contrôler les zones fixes, le scroll horizontal, les grilles, les tailles de textes et l'accès à tous les boutons.
2. Tester le parcours connexion → dashboard → collection, recherche, filtres, favoris, détails, progression et achats de niveaux.
3. Tester le booster payant, le booster quotidien gratuit, sa déchirure, le flip, `NEW!`, le halo et l'absence de niveaux sur le tirage.
4. Tester les annonces marketplace, le showroom privé/public, le classement, langue et unités.
5. Exécuter `npm run lint`, `npm test`, `npm run build`, vérifier le Preview Vercel si disponible.
6. Vérifier les trois langues FR/EN/ES et la réduction des animations.

**Statut :** proposition visuelle à approuver après tests et essai mobile/PC. Aucun déploiement demandé.
