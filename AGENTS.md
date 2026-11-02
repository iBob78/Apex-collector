# AGENTS.md — Apex Collector

> Instructions de travail pour les agents IA et les contributeurs qui modifient ce dépôt.
> Portée : tout le dépôt, sauf consignes plus spécifiques dans un sous-dossier.
> Le README reste la présentation du projet ; ce fichier décrit comment intervenir sans régression.

## 1. Objectif et façon de collaborer

Apex Collector est un jeu de collection de cartes automobiles : véhicules et circuits, garage/album, boosters, marché, profil, succès et contrats. Son univers associe sport automobile, collection haut de gamme et esthétique « gentleman driver ». Inspirations : Gran Turismo, Test Drive Unlimited, Colin McRae Rally, anciens Need for Speed, Pokémon et jeux de cartes automobiles historiques.

Le créateur du projet n'est pas développeur. Être concret et compréhensible, expliquer les résultats sans jargon inutile, et surtout **résoudre la demande précise sans dégrader ce qui marche déjà**.

**Règles prioritaires :**
1. Modifier seulement ce qui est demandé ; conserver le comportement, la mise en page, les données et les fonctionnalités non concernés.
2. Préserver **l'interface ordinateur** lors de toute amélioration mobile, et réciproquement. Une évolution « mobile first » n'autorise jamais à supprimer la sidebar sur PC.
3. Ne pas « nettoyer », réécrire, reformater ou renommer des composants sans lien direct avec la demande.
4. Ne pas modifier la logique économique, les données des joueurs, les accès administrateur, la rareté, les probabilités ni les migrations Supabase sans besoin explicite et autorisation adaptée.
5. Traiter chaque ajustement visuel comme une modification mesurable : petits changements ciblés, vérification des sélecteurs responsive et des éléments voisins.
6. Ne **jamais fusionner une PR, déployer, modifier la production ou appliquer une migration** sans accord explicite.
7. Ne jamais prétendre avoir testé visuellement, exécuté des tests ou déployé si ce n'est pas réellement le cas. Expliquer les contrôles réussis, encore en cours ou en échec.

## 2. Sources de vérité et limites de la documentation

- Lire ce fichier et les fichiers concernés avant de modifier quoi que ce soit.
- Pour le fonctionnement réel, **le code, les migrations et package.json priment** sur les descriptions du README ou les anciennes réponses d'agents.
- Le `README.md` est une présentation publique simplifiée ; ce fichier `AGENTS.md` regroupe les consignes de travail. Les autres docs peuvent contenir des informations historiques : vérifier le code avant de les appliquer.
- `package.json` déclare **Next.js ^15.5.27**. Vérifier la version déclarée avant toute mise à jour ; ne pas suivre un numéro de version provenant d'une ancienne documentation.
- Les effets, taux de boosters et prix sont définis dans le code et/ou Supabase ; les textes promotionnels ne font pas autorité.
- Avant un changement d'architecture, inspecter les routes, les actions serveur, les tests et les migrations existants.
- Mettre à jour le README et/ou ce fichier lorsqu'une modification change durablement une règle du projet ; ne pas ajouter de descriptions spéculatives.

## 3. Stack, environnement et commandes

- **Next.js 15 (App Router), React 18, TypeScript**, Tailwind CSS 3, Framer Motion et Lucide React.
- **Supabase** : Auth, PostgreSQL, RLS, RPC, Storage, profils et données des joueurs.
- **Jest + Testing Library**, ESLint, Husky, GitHub Actions ; déploiement prévu sur **Vercel**.
- Prérequis documenté : Node.js 18+ et npm 9+ ; les workflows actuels utilisent surtout Node 18, avec un audit Node 20.
- Installation : `npm ci` (préférable pour une vérification reproductible), puis `npm run dev`.
- Vérifications : `npm run lint`, `npm test` et `npm run build`.
- Ne pas modifier package-lock.json ni les dépendances pour une simple retouche visuelle.
- Les workflows GitHub sont dans `.github/workflows/`. La commande `format:check` apparaît dans un workflow avec un échec ignoré, mais **n'existe pas actuellement** dans package.json : ne pas la présenter comme un contrôle fiable.

## 4. Carte du code : où intervenir

| Besoin | Emplacement principal |
| --- | --- |
| Accueil public (visiteur) | `src/app/page.tsx` |
| Tableau de bord connecté | `src/app/dashboard/page.tsx` |
| Sidebar PC et navigation mobile | `src/components/Sidebar.tsx` |
| Collection, filtres et favoris | `src/app/collection/page.tsx` |
| Rendu des cartes | `src/components/Card.tsx` |
| Détails d'une carte | `src/components/Collection/CardDetailsModal.tsx` |
| Badge IP | `src/components/IPBadge.tsx` |
| Couleurs et styles de rareté | `src/lib/rarity.ts` |
| Niveaux et seuils d'amélioration | `src/lib/level.ts` |
| Achat des améliorations | `src/lib/actions/card-upgrades.ts` |
| Boutique de boosters (cartes, grille, prix affichés) | `src/app/boosters/page.tsx` |
| Ouverture et révélation des cartes des boosters | `src/app/open/page.tsx` |
| Animations et halo de révélation | `src/app/globals.css` (`.booster-reveal-halo`) |
| Configuration, prix et probabilités des packs | `src/lib/boosters.ts` |
| Contrats et succès | `src/lib/actions/objectives.ts` |
| Images et icônes | `src/lib/images/` ; `src/components/SafeImage.tsx` |
| Conversions et statistiques véhicules | `src/lib/vehicleStats.ts` |
| Langues et unités | `src/lib/preferences.ts` ; `src/contexts/SitePreferencesContext.tsx` |
| Autorisation admin | `src/lib/admin.ts` et gardes/permissions des pages/actions admin |
| Scripts SQL | `supabase/migrations/` |

Le dossier `src/app/` définit les autres routes : `/boosters`, `/open`, `/marketplace`, `/missions`, `/achievements`, `/profile`, `/settings` et `/admin/*`.

## 5. Interface et règles responsive

**Direction artistique :** noir/anthracite, accents bleus, matériaux premium, automobiles et sport mécanique. Les textures (holographique, carbone, Kevlar, titane, etc.) décrites dans le README sont une inspiration ; certaines existent déjà et d'autres restent des idées.

**Toujours contrôler :**
- **Smartphone (< 768 px)** : navigation fixe en bas et menu « Plus ». La collection (`/collection`) doit conserver **4 cartes par ligne** sur les petits écrans ; **ne pas confondre** avec les grilles de boosters, qui suivent d'autres règles.
- **À partir de 768 px** : sidebar latérale visible ; la navigation mobile est masquée. Ne pas faire disparaître la sidebar lorsque la fenêtre PC est réduite.
- Les règles de cartes mobiles utilisent notamment `mobileGrid` et des classes Tailwind `sm:`. **Ne pas modifier leurs équivalents desktop par accident**.
- Les cartes véhicules et circuits doivent conserver leur logo/drapeau, badge IP, rareté, données lisibles et comportements d'ouverture de détail.
- Sur mobile, l'interaction avec une carte ouvre les détails ; favoris et amélioration restent accessibles. Préserver aussi les interactions de bureau.
- Respecter les zones de sécurité et la barre de navigation inférieure ; éviter le débordement horizontal, les textes tronqués et les recouvrements d'icônes.
- Tester les états vides, les valeurs numériques longues, les textes traduits, les différents niveaux de carte et l'absence d'image.
- Respecter `prefers-reduced-motion` pour les effets animés.

**Polices spécifiques :**
- **Exo**, chargée via Google Fonts en CSS, est utilisée pour le badge IP dans `src/components/IPBadge.tsx`. Ne pas la remplacer.
- **Bebas Neue** est utilisée pour le titre « Tableau de bord » dans `src/app/dashboard/page.tsx` **et les noms des packs** dans `src/app/boosters/page.tsx`. Ne pas l'appliquer globalement sans demande.
- Les polices sont importées dans `src/app/globals.css` ; préserver les solutions de repli.

**Tableau de bord connecté :**
- Conserver le **solde AP compact en haut à droite**, avec le bouton d'accès au profil juste à côté.
- Conserver une présentation concise des modèles uniques, exemplaires, doublons et niveau de l'écurie.
- Le bloc « Boosters populaires » a été volontairement retiré du tableau de bord : ne pas le réintroduire sans demande.
- La progression d'écurie affichée est une présentation calculée à partir des modèles uniques ; ne pas la transformer implicitement en règle économique ou en récompense réelle.

## 6. Cartes, raretés et statistiques

- Deux familles de collection : **véhicules et circuits** ; ne pas supposer que leurs champs ou identifiants sont identiques.
- Les badges et effets visuels dépendent des raretés. Utiliser **`RARITY_CONFIG`, `getRarityColor` et `getRarityBorderClass`** dans `src/lib/rarity.ts` ; ne pas inventer une nouvelle correspondance de couleurs dans chaque composant.
- Les cartes Icon, Mythic et Legend ont des effets visuels distinctifs. Les niveaux supérieurs ajoutent cristal/holographie, conformément aux classes CSS existantes.
- L'indice de performance (IP) d'un véhicule est fondé sur puissance et masse : réutiliser les fonctions de `src/lib/vehicleStats.ts`, ne pas recalculer localement selon une autre formule.
- Les cartes véhicules comportent notamment puissance HP/kW, couple, vitesse maximale, masse, transmission, prix neuf (€), carburant, régime moteur et exemplaires vendus, selon la disponibilité des données.
- Les codes de configuration moteur/transmission sont **MR, FF, FR, MF, FA, RR, RA, MA** ; descriptions dans `src/lib/drivetrain.ts` et icônes via les résolveurs d'images.
- Le sélecteur carburant admin reconnaît notamment **ES, GO, EL, EE, EH, GL, GH, E85, ET, GP, GN, H2, EG, EN, FG, FL** ainsi que les anciennes valeurs courantes comme Essence et Diesel. Réutiliser `src/lib/fuelTypes.ts`.
- Ne pas masquer les caractéristiques par défaut ou écraser les données lorsqu'une propriété optionnelle manque : prévoir une valeur de repli honnête.
- Les drapeaux de pays et logos de marques doivent fonctionner sur les cartes et dans leurs vues de détail.

## 7. Niveaux de carte, doublons et AP

L'amélioration des cartes véhicule est **achetée**, concerne tous les exemplaires du même véhicule, et nécessite un seuil de copies. **Les doublons servent de condition de déblocage, ils ne sont pas consommés.**

| Niveau à acheter | Copies nécessaires | Coût AP | Effet présenté dans le README |
| --- | ---: | ---: | --- |
| 1 | 2 | 250 | Base |
| 2 | 5 | 500 | Cristal léger |
| 3 | 10 | 1 000 | Cristal renforcé |
| 4 | 25 | 2 000 | Cristal brillant |
| 5 | 50 | 3 000 | Holographique |
| 6 | 100 | 5 000 | Holographique renforcé |
| 7 | 200 | 10 000 | Holographique renforcé |
| 8 | 500 | 20 000 | Holographique renforcé |
| 9 | 1 000 | 50 000 | Holographique maximal |

**Toujours vérifier `src/lib/level.ts` et la logique RPC Supabase en cas de modification.** L'achat est contrôlé côté serveur via `purchase_card_upgrade` (appartenance, copies requises, AP disponibles) et traité de manière atomique. Ne jamais débiter les AP, incrémenter les niveaux, ni décider du prix uniquement dans React.

Les vues de collection affichent quantité, niveau, possibilité d'amélioration et progression ; le détail complet doit rester disponible.

## 8. Favoris, catalogue, boosters, contrats et succès

- Les favoris de **véhicules et circuits** sont personnels. La migration `016_card_favorites.sql` crée `card_favorites` avec RLS : lecture/suppression propres à l'utilisateur ; insertion pour les cartes possédées uniquement.
- Un éventuel **showroom public** est une idée future, **pas une permission de rendre tous les favoris ou inventaires publics**. Prévoir une sélection explicite, des données filtrées et une autorisation adaptée avant toute implémentation.
- Dans Card Studio, un véhicule peut avoir un numéro permanent, être **désactivé** sans être supprimé, ou être **exclu des tirages de boosters**. « Désactivé » et « exclu des boosters » ne sont pas synonymes.
- Les probabilités, coûts, quantités et exclusions des packs sont à vérifier dans `src/lib/boosters.ts` et les fonctions réelles d'ouverture ; ne pas déduire des taux à partir de textes marketing.

**Présentation des boosters et révélation des cartes (règles validées) :**
- **Boutique `/boosters` : 2 packs par ligne sur smartphone**. Les visuels, titres, descriptions, prix AP et boutons d'achat sont compacts sur mobile ; l'affichage ordinateur conserve jusqu'à **3 packs par ligne**. Les noms de packs utilisent **Bebas Neue**. Ne pas confondre la boutique avec l'écran de tirage.
- **Après ouverture `/open` : 3 cartes par ligne uniquement sur smartphone** (grille `grid-cols-3` avant le breakpoint `sm` à 640 px). Sur les écrans plus larges, préserver la disposition `sm:flex sm:flex-wrap` et les dimensions desktop existantes.
- Les cartes révélées sont rendues par `src/components/Card.tsx` avec `compact`, `showLevel={false}`, et `mobileGrid={useCompactPhoneCards}` pour le petit écran. Le mode `mobileGrid` est activé par `matchMedia('(max-width: 639px)')` ; ne pas l'appliquer à la version PC.
- **Un tirage de booster ne doit jamais afficher de niveau, ni de badge « Niveau 0 », ni de badge d'exemplaires/niveau sous la carte.** Dans `Card.tsx`, les badges de niveau desktop **et** le badge mobile de collection sont conditionnés par `showLevel` (`mobileGrid && showLevel`). Préserver ce garde-fou : le badge reste utile dans la **collection** mais pas dans un tirage.
- **Au retournement d'une carte**, afficher immédiatement un **halo extérieur discret** correspondant à sa rareté, sur **smartphone et PC**. Utiliser `getRarityColor()` de `src/lib/rarity.ts` plutôt qu'une liste de couleurs dupliquée. L'élément `.booster-reveal-halo` est un frère du conteneur rotatif, derrière la carte, pour ne pas recouvrir l'image et les statistiques.
- **Aucune latence dans le halo** : l'animation CSS `booster-reveal-glow` de `src/app/globals.css` démarre **sans délai** et avec une opacité non nulle dès que l'état `flippedCards` passe à révélé. Préserver l'animation de retournement 3D et l'action « Retourner toutes les cartes ».
- Respecter `prefers-reduced-motion` : le halo reste visible mais immobile. Conserver les effets holographiques de rareté préexistants ; ne pas les remplacer par l'aura de révélation.
- Ne modifier **ni la dépense AP, ni les tirages, ni l'enregistrement des cartes** pour une demande de changement visuel sur `/boosters` ou `/open`.
- Les contrats et succès sont administrés dans `/admin/objectives` : objectifs, cibles, rareté éventuelle, AP à réclamer, activation et progression.
- Événements connus : ouverture de boosters, collection de véhicules ou circuits, rareté, annonce de marché, connexion sur différents jours.
- Une récompense n'est pas acquise avant la réclamation prévue par le système ; respecter les fonctions RPC atomiques et la progression sauvegardée.

## 9. Supabase, administration et sécurité

- Séparer clairement **client navigateur**, **actions serveur** et **fonctions SQL/RPC**. Le contrôle d'accès final doit être côté serveur / base, pas seulement dans l'interface.
- Les actions qui touchent les AP, aux collections, aux achats, au marché et aux récompenses demandent une vérification d'identité et des contrôles côté base.
- Respecter et vérifier les **policies RLS** avant toute requête ou migration. Ne jamais désactiver RLS « pour débloquer » une fonctionnalité.
- Les ateliers admin `/admin/cards`, `/admin/circuits` et `/admin/objectives` demandent une autorisation réelle, pas simplement la présence d'un lien dans la sidebar.
- L'administration dépend notamment de `ADMIN_EMAILS` et des policies SQL d'écriture (`005` / `006`). La configuration doit rester cohérente côté environnement, serveur et base.
- Les nouvelles inscriptions utilisent normalement la langue française par défaut ; la confirmation d'e-mail dépend de Supabase Auth et SMTP. Un succès de sign-up ne garantit pas la réception de l'e-mail.
- Variables documentées dans `.env.example` : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`, `NEXT_PUBLIC_APP_URL`, `ADMIN_EMAILS`, `SERVER_ACTIONS_ALLOWED_ORIGINS`. Les secrets vont dans `.env.local` / le gestionnaire d'environnement, **jamais** dans Git ou une réponse.
- Les migrations du dépôt vont actuellement de `002_quests_system.sql` à `016_card_favorites.sql` (avec un ancien fichier additionnel non numéroté). Repères :
  - `005` / `006` : politiques d'administration cartes et circuits ;
  - `007` : caractéristiques des véhicules ;
  - `008` / `009` : langue et unités du profil ;
  - `010` / `011` : numérotation, disponibilité et éligibilité aux boosters ;
  - `012` / `013` : niveaux de cartes et achats ;
  - `014` : contrats/succès et récompenses ;
  - `015` : contraintes de rareté des circuits ;
  - `016` : favoris privés des cartes.
- **Ne pas supposer** qu'une migration est absente ou non appliquée parce qu'elle existe dans le dépôt. Inspecter l'état réel de la base et demander l'autorisation avant toute migration, modification de schéma ou backfill.
- Ne pas supprimer, réinitialiser ou modifier des données de joueurs pour résoudre un problème d'affichage.

## 10. Langues, unités et images

- Langues proposées : **français, anglais et espagnol** ; choix sauvegardés dans le profil et mis en cache côté navigateur. Mettre à jour `src/lib/preferences.ts` lors de l'ajout d'un texte visible.
- Systèmes : **métrique / impérial**. Affichages : CV/HP, Nm/lb-ft, kg/lb, km/h/mph, km/mi.
- Convertir **uniquement l'affichage**, jamais les valeurs sources en base. Réutiliser les fonctions de conversion existantes.
- Certains textes d'administration ou champs dynamiques peuvent rester en français ; ne pas présumer qu'une traduction existe.
- Images : bucket public Supabase Storage **assets**, avec notamment `cards/vehicle/`, `cards/circuit/`, `logos/brand/`, `icons/` et `placeholders/`.
- Réutiliser `src/lib/images/` et `SafeImage`, qui acceptent clé Storage, URL publique ou chemin local selon le contexte ; ne pas concaténer manuellement les URLs.
- Le résolveur normalise certaines URLs Supabase Storage tronquées (segment `/storage/v1/object/publi/`). Préserver ce comportement.
- Convention historique conseillée : cartes JPG environ **800 × 1120 px**, logos PNG transparents, icônes SVG, avec placeholders si l'image manque. Voir `SUPABASE_STORAGE_STRUCTURE.md`.

## 11. Workflow de modification et validation

1. Vérifier la branche, l'état de la PR et le code actuel ; ne pas travailler aveuglément sur un ancien commit.
2. Comprendre le besoin ; changer le **plus petit nombre possible de fichiers et de lignes**. Conserver les conventions du fichier.
3. Pour une retouche d'interface, limiter les classes CSS au bon breakpoint ; tester au moins smartphone et ordinateur si un environnement visuel est disponible.
4. Pour la logique, ajouter ou adapter les tests Jest pertinents (voir `src/lib/__tests__/`, `src/lib/images/__tests__/` et `src/components/__tests__/`).
5. Exécuter si possible `npm run lint`, `npm test` et `npm run build`. Contrôler les statuts de la PR GitHub ; signaler séparément les échecs éventuels de Dependency Review / sécurité.
6. Ne pas qualifier un changement de « vérifié visuellement » sans capture ou véritable test dans un navigateur.
7. Créer un commit ciblé sur une **branche dédiée** et laisser une **pull request en brouillon** pour validation, sauf instruction contraire.
8. **Ne pas merger, déployer ni intervenir sur Supabase en production sans feu vert explicite.**
9. À la fin, expliquer en français : **ce qui a changé**, **ce qui est préservé**, **les tests réellement effectués** et **où se trouve la PR**.

## 12. Documentation complémentaire

- `README.md` : présentation publique simplifiée du jeu, fonctionnalités, installation, technologies, licence et contribution. Les règles destinées aux agents sont ici, dans `AGENTS.md`.
- `docs/SETUP.md` : installation locale, variables d'environnement et Supabase (certaines sections sont anciennes : vérifier le dépôt).
- `SUPABASE_STORAGE_STRUCTURE.md` : structure du bucket, chemins et conventions d'images.
- `supabase/migrations/` : historique SQL réel ; vérifier l'état de la base avant de l'utiliser.
- `.github/workflows/` : commandes exécutées par l'intégration continue.

**Principe directeur : préserver tout ce qui n'est pas explicitement demandé, particulièrement la version PC et les données des joueurs.**
