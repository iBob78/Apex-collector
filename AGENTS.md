# AGENTS.md — Apex Collector

> Instructions de travail pour les agents IA et les contributeurs qui modifient ce dépôt.
> Portée : tout le dépôt, sauf consignes plus spécifiques dans un sous-dossier.
> Le README reste la présentation du projet ; ce fichier décrit comment intervenir sans régression.

## 1. Objectif et façon de collaborer

Apex Collector est un jeu de collection de cartes automobiles : véhicules, circuits et pilotes, garage/album, boosters, marché, profil, succès et contrats. Son univers associe sport automobile, collection haut de gamme et esthétique « gentleman driver ». Inspirations : Gran Turismo, Test Drive Unlimited, Colin McRae Rally, anciens Need for Speed, Pokémon et jeux de cartes automobiles historiques.

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
- **La refonte mobile et les ajustements boosters validés ont été fusionnés dans `main` via la PR #8 le 2 novembre 2026.** Pour toute nouvelle intervention, repartir de la tête actuelle de `main`, et non de l'ancienne branche `feat/mobile-first-navigation-20261030`.
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
| Market, ventes et achats | `src/app/marketplace/page.tsx`, `src/lib/actions/marketplace.ts` et SQL 044 (en préparation) |
| Rendu des cartes | `src/components/Card.tsx` |
| Détails d'une carte | `src/components/Collection/CardDetailsModal.tsx` |
| Badge IP | `src/components/IPBadge.tsx` |
| Couleurs et styles de rareté | `src/lib/rarity.ts` |
| Niveaux et seuils d'amélioration | `src/lib/level.ts` |
| Achat des améliorations | `src/lib/actions/card-upgrades.ts` |
| Boutique de boosters (cartes, grille, prix affichés) | `src/app/boosters/page.tsx` |
| Ouverture et révélation des cartes des boosters | `src/app/open/page.tsx` |
| Catalogue et atelier des pilotes | `src/app/admin/drivers/` |
| Gestion des rôles administrateur | `src/app/admin/access/` |
| Suppression des comptes (propriétaire) | `src/app/admin/players/` |
| Suggestions publiques et boîte de réception admin | `src/app/suggestions/` ; `src/app/admin/suggestions/` |
| Validation et sauvegarde des fiches pilote | `src/app/admin/drivers/actions.ts` |
| Calcul de l'âge d'une fiche pilote | `src/lib/driverCards.ts` |
| Animations et halo de révélation | `src/app/globals.css` (`.booster-reveal-halo`) |
| Configuration, prix et probabilités des packs | `src/lib/boosters.ts` |
| Contrats et succès | `src/lib/actions/objectives.ts` |
| Images et icônes | `src/lib/images/` ; `src/components/SafeImage.tsx` |
| Conversions et statistiques véhicules | `src/lib/vehicleStats.ts` |
| Langues et unités | `src/lib/preferences.ts` ; `src/contexts/SitePreferencesContext.tsx` |
| Auto-suppression du compte joueur | `src/app/settings/` (`SelfAccountDeletion.tsx`, `actions.ts`) |
| Autorisation admin | `src/lib/admin.ts` et gardes/permissions des pages/actions admin |
| Scripts SQL | `supabase/migrations/` |

Le dossier `src/app/` définit les autres routes : `/boosters`, `/open`, `/marketplace`, `/missions`, `/achievements`, `/profile`, `/settings` et `/admin/*`.

## 5. Interface et règles responsive

**Direction artistique :** noir/anthracite, accents bleus, matériaux premium, automobiles et sport mécanique. Les textures (holographique, carbone, Kevlar, titane, etc.) décrites dans le README sont une inspiration ; certaines existent déjà et d'autres restent des idées.

**Toujours contrôler :**
- **Smartphone (< 768 px)** : navigation fixe en bas et menu « Plus ». La collection (`/collection`) doit conserver **4 cartes par ligne** sur les petits écrans ; **ne pas confondre** avec les grilles de boosters, qui suivent d'autres règles.
- Dans la collection, l'inclinaison 3D au pointeur est réservée aux cartes possédées (`owned`) via `pointerTilt` de `Card.tsx`. Les cartes non possédées utilisent `hideUnownedContent` : elles gardent leur place dans la grille, mais leur identité, leur image et leur rareté sont masquées ; elles ne réagissent pas au pointeur et n'ouvrent pas la modale. L'effet pointeur ne s'active pas au toucher et doit respecter `prefers-reduced-motion`.
- Une nouvelle carte obtenue avec succès dans un booster reste marquée `NEW!` dans la collection jusqu'à l'ouverture de sa modale. Le statut est enregistré par joueur et par catégorie dans `user_card_discoveries` ; le dos mystère se retourne à l'arrivée dans la collection, puis le badge agrandi et le halo vert animé mettent la carte en évidence. Préserver la synchronisation Supabase, l'accès réservé au propriétaire par RLS et le halo statique en mode `prefers-reduced-motion`.
- **À partir de 768 px** : sidebar latérale visible ; la navigation mobile est masquée. Ne pas faire disparaître la sidebar lorsque la fenêtre PC est réduite.
- Les règles de cartes mobiles utilisent notamment `mobileGrid` et des classes Tailwind `sm:`. **Ne pas modifier leurs équivalents desktop par accident**.
- Dans `/collection`, les tris « Marques, A à Z » et « Marques, Z à A » regroupent d'abord les véhicules et affichent avant chaque marque un séparateur pleine largeur avec logo (ou initiales de repli) et trait décoratif. Les circuits et pilotes restent après les véhicules ; aucun séparateur de marque n'est affiché pour les autres tris. Préserver les 4 colonnes de cartes sur smartphone.
- Les cartes possédées de véhicules, circuits et pilotes doivent conserver leur logo/drapeau, rareté, données lisibles et comportements d'ouverture de détail. Les cartes non possédées de la collection restent des cartes mystère sans détail identifiable. L'IP concerne les véhicules uniquement.
- Sur mobile, l'interaction avec une carte ouvre les détails ; favoris et amélioration restent accessibles. Préserver aussi les interactions de bureau.
- Respecter les zones de sécurité et la barre de navigation inférieure ; éviter le débordement horizontal, les textes tronqués et les recouvrements d'icônes.
- Tester les états vides, les valeurs numériques longues, les textes traduits, les différents niveaux de carte et l'absence d'image.
- Respecter `prefers-reduced-motion` pour les effets animés.

**Polices spécifiques :**
- **Exo**, chargée via Google Fonts en CSS, est utilisée pour le badge IP dans `src/components/IPBadge.tsx`. Ne pas la remplacer.
- **Bebas Neue** est utilisée pour le titre « Tableau de bord » dans `src/app/dashboard/page.tsx` **et les noms des packs** dans `src/app/boosters/page.tsx`. Ne pas l'appliquer globalement sans demande.
- Les polices sont importées dans `src/app/globals.css` ; préserver les solutions de repli.

**Tableau de bord connecté :**
- Conserver le **solde AC compact en haut à droite**, avec le bouton d'accès au profil juste à côté.
- Conserver une présentation concise des modèles uniques, exemplaires, doublons et niveau de l'écurie.
- Le bloc « Boosters populaires » a été volontairement retiré du tableau de bord : ne pas le réintroduire sans demande.
- La progression d'écurie affichée est une présentation calculée à partir des modèles uniques ; ne pas la transformer implicitement en règle économique ou en récompense réelle.
- Le niveau d'écurie du tableau de bord est calculé dans `src/lib/garage-level.ts` à partir du nombre de véhicules uniques : niveau `floor(nombre / 10) + 1`, progression sur 10 véhicules et paliers de présentation débutante (1), amateur (5), confirmée (10), professionnelle (20), légendaire (50). Ce niveau n'est ni un niveau de carte, ni une récompense, ni un avantage économique.

## 6. Cartes, raretés et statistiques

- Trois familles de collection : **véhicules, circuits et pilotes** ; ne pas supposer que leurs champs, identifiants ou tables de possession sont identiques.
- **Numéros de collection** : les véhicules (`cards`), circuits (`circuits`) et pilotes (`drivers`) ont chacun leur propre série de `collection_number`, unique dans leur catalogue ; les numéros peuvent donc se répéter d'une catégorie à l'autre. Le backfill suit `created_at` croissant (NULL d'abord), puis `id`, comme la migration 010 pour les véhicules. Depuis la migration `035_reuse_collection_number_gaps.sql`, toute nouvelle fiche prend le plus petit numéro positif libre de sa catégorie, ce qui réutilise les trous sans renuméroter les fiches existantes. Ce champ n'est pas saisi dans l'atelier, ne change pas lors d'une modification et ne dépend ni de la rareté, ni du rang du pilote, ni de la possession du joueur. Ne pas recalculer les numéros depuis l'ordre d'affichage, les filtres ou les possessions.
- **Cartes pilotes** : une fiche représente un pilote pour une année donnée ; une même personne peut donc apparaître plusieurs fois avec des années différentes. `drivers.id` est l'identifiant technique de ligne et `drivers.driver_id` l'identifiant métier utilisé pour la carte, les possessions, les favoris et les tirages. La migration ne déclare pas de contrainte unique sur le couple nom/année : éviter de créer manuellement deux fiches du même pilote pour la même année.
- Les données métier d'une fiche pilote sont son nom, son année, sa date de naissance, son pays d'origine et un code pays facultatif. `world_championships`, `podiums` et `race_wins` sont des compteurs entiers saisis manuellement et non calculés depuis des résultats de championnat. `won_monaco_gp`, `won_indy_500` et `won_24h_le_mans` sont trois booléens indépendants : ils indiquent si le pilote a remporté chaque épreuve au moins une fois, pas le nombre de victoires. L'interface n'en déduit pas automatiquement une « Triple Couronne complète ».
- L'âge d'une carte pilote est calculé dans `src/lib/driverCards.ts` par **année de la carte moins année de naissance**. Le calcul n'ajuste pas selon le mois et le jour de naissance ; ne pas le présenter comme l'âge exact à une date précise. La date de naissance et l'année de carte restent les données sources.
- Le rendu pilote dans `src/components/Card.tsx` affiche le nom, l'année et l'âge disponible, le drapeau, les compteurs de titres mondiaux, podiums et courses gagnées, ainsi que les indicateurs Monaco/Indy 500/Le Mans ; le détail dans `src/components/Collection/CardDetailsModal.tsx` expose également la date de naissance, l'âge calculé, le pays et le palmarès. L'IP, les spécifications moteur et les améliorations achetables restent propres aux véhicules.
- L'atelier `/admin/drivers` est réservé aux administrateurs et permet de rechercher dans le catalogue, créer ou modifier une fiche et prévisualiser son rendu. Les champs modifiables sont les données pilote/saison et palmarès, la rareté, l'image, la description, l'activation du catalogue et l'éligibilité aux boosters. Il n'y a pas d'action de suppression : désactiver une fiche la retire des affichages/tirages concernés sans effacer les possessions ni l'historique.
- Les badges et effets visuels dépendent des raretés. Utiliser **`RARITY_CONFIG`, `getRarityColor` et `getRarityBorderClass`** dans `src/lib/rarity.ts` ; ne pas inventer une nouvelle correspondance de couleurs dans chaque composant.
- Les cartes Icon, Mythic et Legend ont des effets visuels distinctifs. Le niveau d'amélioration 1 ajoute une finition acier poli translucide : conserver l'image visible, ajouter un grain brossé fin et un reflet spéculaire guidé par le pointeur sur ordinateur, sans vidéo, webcam ni WebGL. Les niveaux 2 à 4 ajoutent des effets cristallins progressifs et les niveaux 5 à 9 des effets holographiques. Les couches sont définies dans `src/app/globals.css`, appliquées par `src/components/Card.tsx` et doivent respecter `prefers-reduced-motion` sans masquer l'illustration ou les informations.
- L'indice de performance (IP) d'un véhicule est fondé sur puissance et masse : réutiliser les fonctions de `src/lib/vehicleStats.ts`, ne pas recalculer localement selon une autre formule.
- Les cartes véhicules comportent notamment puissance HP/kW, couple, vitesse maximale, masse, transmission, prix neuf (€), carburant, type de compétition, records, régime moteur et exemplaires vendus, selon la disponibilité des données. Le type choisi dans la liste administrable et sa précision libre éventuelle apparaissent sous le badge de carburant. Un véhicule record affiche un badge « R » et la description du record dans la modale.
- Le champ source `weight_t` est une masse en tonnes : `1,230` signifie 1 tonne et 230 kg. Dans les formulaires qui acceptent une virgule décimale, normaliser la valeur avant validation/enregistrement ; les unités métriques/impériales sont converties uniquement à l'affichage.
- La transmission véhicule utilise les codes définis par `drivetrainLayouts` dans `src/lib/drivetrain.ts` : `MR`, `FF`, `FR`, `MF`, `FA`, `RR`, `RA`, `MA`. Réutiliser les libellés de `drivetrainLayoutDescriptions` et ne pas introduire des valeurs libres incompatibles avec le sélecteur de l'atelier.
- La catégorie de compétition est stockée dans `cards.competition_type` et provient de la table administrable `competition_types` ; `competition_type_custom` est un complément facultatif libre. Réutiliser cette liste, vérifier ses erreurs de chargement et ne pas figer localement les catégories initiales. L'atelier conserve également un indicateur booléen `is_record` et un `record_description` (500 caractères au plus, requis si le record est activé). Dans la validation serveur de Card Studio, garder les booléens hors de la liste des champs texte et couvrir la création d'une carte avec un test.
- Les alternatives art reprennent aussi les champs de compétition et de record. Les triggers des migrations `032` et `033` synchronisent ces champs depuis la carte d'origine vers ses alternatives ; ne pas modifier une alternative comme source de référence.
- Les alternative arts de véhicules sont des lignes distinctes dans `cards`, reliées à la carte d'origine par `variant_of_card_id`. Elles ont un `card_id`, un numéro de collection et une possession propres, reprennent et synchronisent les caractéristiques de la carte d'origine et sont hors boosters par défaut. Ne pas les fusionner dans les compteurs ou favoris de la carte originale.
- Les codes de configuration moteur/transmission sont **MR, FF, FR, MF, FA, RR, RA, MA** ; descriptions dans `src/lib/drivetrain.ts` et icônes via les résolveurs d'images.
- Le sélecteur carburant admin reconnaît notamment **ES, GO, EL, EE, EH, GL, GH, E85, ET, GP, GN, H2, EG, EN, FG, FL** ainsi que les anciennes valeurs courantes comme Essence et Diesel. Réutiliser `src/lib/fuelTypes.ts`.
- Ne pas masquer les caractéristiques par défaut ou écraser les données lorsqu'une propriété optionnelle manque : prévoir une valeur de repli honnête.
- Les drapeaux de pays et logos de marques doivent fonctionner sur les cartes et dans leurs vues de détail.

## 7. Niveaux de carte, doublons et AC

L'amélioration des cartes véhicule est **achetée**, concerne tous les exemplaires du même véhicule, et nécessite un seuil de copies. **Les doublons servent de condition de déblocage, ils ne sont pas consommés.**

| Niveau à acheter | Copies nécessaires | Coût AC | Effet présenté dans le README |
| --- | ---: | ---: | --- |
| 1 | 2 | 250 | Métal / acier poli |
| 2 | 5 | 500 | Cristal léger |
| 3 | 10 | 1 000 | Cristal renforcé |
| 4 | 25 | 2 000 | Cristal brillant |
| 5 | 50 | 3 000 | Holographique |
| 6 | 100 | 5 000 | Holographique renforcé |
| 7 | 200 | 10 000 | Holographique renforcé |
| 8 | 500 | 20 000 | Holographique renforcé |
| 9 | 1 000 | 50 000 | Holographique maximal |

**Toujours vérifier `src/lib/level.ts` et la logique RPC Supabase en cas de modification.** L'achat est contrôlé côté serveur via `purchase_card_upgrade` (appartenance, copies requises, AC disponibles) et traité de manière atomique. Ne jamais débiter les AC, incrémenter les niveaux, ni décider du prix uniquement dans React.

Les vues de collection affichent quantité, niveau, possibilité d'amélioration et progression ; le détail complet doit rester disponible.

## 8. Favoris, catalogue, boosters, contrats et succès

- Les favoris de **véhicules, circuits et pilotes** sont personnels. `card_favorites` utilise RLS : lecture/suppression propres à l'utilisateur ; insertion uniquement pour les cartes possédées.
- La clé de favori reste un triplet catégorie + identifiant (`vehicle`, `circuit` ou `driver`) ; ne pas comparer seulement des UUID, car ils peuvent coïncider entre familles. Pour les pilotes, `category = 'driver'` et `card_id` stocke `drivers.driver_id` (malgré le nom historique de la colonne).
- Le showroom de `/profile` utilise `user_garage_showcase` pour sélectionner jusqu'à **3 véhicules** ; l'emplacement 1 est la voiture vedette. L'enregistrement passe par `save_personal_garage_showcase`, qui vérifie côté base que chaque véhicule appartient au joueur. La visibilité publique reste désactivée par défaut ; seul le joueur peut l'activer. `/showroom/[username]` ne révèle, que lorsque le showroom est public, que les voitures choisies, des statistiques agrégées, les trois meilleurs niveaux d'amélioration véhicule et les succès réclamés. Ne jamais exposer l'inventaire complet, le solde AC ou d'autres informations privées.
- Le nombre de boosters ouverts dans le showroom est comptabilisé par `record_objective_progress` à partir de la migration `026_public_showroom_collection_highlights.sql`. L'historique complet antérieur à l'activation n'existe pas : afficher clairement que le compteur commence avec cette migration. « Cartes en collection » compte les exemplaires actuellement détenus dans `user_cards`, `user_circuits` et `user_drivers`, pas les acquisitions historiques ni les cartes revendues. Les succès présentés sont uniquement ceux dont le joueur a réclamé la récompense (`status = 'claimed'`). Les niveaux publics sont réservés aux véhicules, car c'est la seule famille disposant du système d'amélioration. Si les nouveaux champs RPC sont absents avant application de 026, garder le showroom public existant utilisable et signaler explicitement la migration manquante plutôt que d'afficher des valeurs inventées.
- `/leaderboard` inclut tous les profils ayant un pseudo, y compris les showrooms privés, et classe les joueurs selon le total des exemplaires dans `user_cards`, `user_circuits` et `user_drivers` ; les égalités sont départagées par pseudo. La migration `025_player_leaderboard.sql` expose uniquement le pseudo et ce compte agrégé via RPC authentifiée. Un clic mène au showroom : si celui-ci est privé, il ne révèle ni véhicules exposés ni statistiques détaillées.
- La modale de collection identifie le joueur qui possède le plus d'exemplaires de la carte courante, toutes catégories confondues dans leurs tables de possession dédiées. Le RPC authentifié `get_top_card_owner` (migration `027_top_owner_per_card.sql`) ne renvoie que le pseudo et le nombre associé ; le pseudo mène au showroom et respecte sa visibilité.
- Le niveau collectionneur affiché dans `/profile` est une progression de présentation distincte des compétitions : 1 point par véhicule/circuit/pilote unique et 5 par succès réclamé, 10 points par niveau. Ne pas le traiter comme une récompense ou un avantage de jeu. Aucun résultat de championnat n'est encore enregistré.
- Les objectifs « Posséder des cartes selon des conditions » utilisent `objective_type = 'collection_requirement'` et un tableau `requirements` (au plus 20 conditions). Chaque condition porte une famille, des filtres catalogue facultatifs, un nombre cible et un mode de comptage (`copies` ou `unique`) ; `requirement_operator` vaut `all` ou `any`. La progression reflète les possessions actuellement détenues et est recalculée côté Supabase par `refresh_collection_objective_progress`, pas par le client. Les récompenses restent réclamées via les RPC habituelles. Voir `src/lib/actions/objectives.ts` et migration `029`.
- Les suggestions de cartes sont accessibles aux joueurs authentifiés via `/suggestions` ; le formulaire n'est pas l'atelier et ne crée jamais directement une entrée de catalogue. Il accepte voitures, circuits et pilotes, leurs informations disponibles, un lien et un commentaire ; les types de compétition sont chargés depuis `competition_types` et doivent être validés côté serveur. Les propositions sont conservées dans `card_suggestions` avec un statut (`pending`, `reviewing`, `accepted`, `rejected`) et une note interne ; `/admin/suggestions` est réservé aux administrateurs et l'acceptation n'ajoute pas automatiquement la carte. Conserver RLS : insertion limitée à la suggestion du joueur authentifié, lecture/mise à jour administrateur. Voir `src/lib/suggestions.ts`, les actions des routes et migration `030`.
- **Chargement complet de `/collection`** : les tableaux `cards` (véhicules actifs), `circuits`, `drivers` (pilotes actifs), `user_cards`, `user_circuits`, `user_drivers` et `card_favorites` sont lus via `fetchAllPages` de `src/lib/fetchAllPages.ts` par lots de **500** lignes et avec un tri stable, jusqu'à la dernière page. Ne pas les remplacer par une seule requête `select()` sans pagination : Supabase limite le nombre de résultats par réponse (souvent 1 000), ce qui tronquerait la collection et les compteurs. Les favoris doivent rester facultatifs si leur chargement échoue ; ne pas masquer le catalogue pour cette seule erreur. Le bouton « Afficher plus » n'affiche que **24 cartes supplémentaires** parmi les données déjà chargées : il ne remplace pas la pagination réseau. Tests : `src/lib/__tests__/fetchAllPages.test.ts`.
- Dans `/collection`, l'identifiant interne utilisé pour quantité, sélection, niveau de collection et favoris est préfixé par catégorie afin d'isoler les familles. Les pilotes actifs sont visibles dans l'onglet « Pilotes » et dans « Tous » ; les pilotes inactifs ne sont pas dans le catalogue public, même si une possession historique existe. Les cartes gardent la grille mobile de quatre colonnes existante. Les pilotes ne sont pas améliorables avec le système de niveaux véhicules.
- Lorsque `/collection` est triée par marque (A à Z ou Z à A), les véhicules restent regroupés par marque et chaque groupe est précédé d'un séparateur pleine largeur avec logo (ou initiales de repli) et trait décoratif. Les circuits et pilotes restent à part après les véhicules ; les autres tris ne doivent pas afficher ces séparateurs. Préserver la grille mobile de quatre colonnes.
- **Possessions pilotes** : `user_drivers` conserve une ligne par joueur et par `driver_id`, avec un compteur `count`, une source et une date d'acquisition. La contrainte `UNIQUE (user_id, driver_id)` empêche plusieurs lignes de possession pour le même exemplaire logique ; les copies augmentent `count`. Toute nouvelle mutation doit rester limitée au joueur authentifié par RLS.
- Le profil compte les copies et les pilotes uniques pour ses statistiques. Chaque pilote unique ajoute un point au niveau collectionneur, comme un véhicule ou un circuit ; les doublons ne donnent pas de point supplémentaire. Les constructeurs collectionnés restent calculés uniquement à partir des véhicules. Le garage personnel existant reste une vitrine privée de véhicules, pas un emplacement d'exposition des pilotes.
- **Migration `020_driver_cards.sql`** : crée `drivers` (catalogue public en lecture, écriture réservée à l'administration) et `user_drivers` (possessions RLS propres au joueur), plus index et grants. Elle étend la contrainte de catégorie de `card_favorites` à `driver` et remplace la politique d'insertion pour vérifier la possession correspondante. Le catalogue stocke `id`, `driver_id`, `name`, `year`, `birth_date`, `country`, `country_code`, `world_championships`, les trois booléens de victoire, `rarity`, `image_url`, `description`, `is_active`, `booster_enabled` et `created_at`. Le schéma vérifie les bornes d'année (1880–2200), les titres positifs ou nuls et une date de naissance au plus tard au 31 décembre de l'année de carte. L'action serveur impose en plus une année au plus deux ans dans le futur, une date réelle, un pays et un nom non vides, une rareté connue et un nombre de titres entier positif ou nul.
- **Migration `021_circuit_driver_collection_numbers.sql`** : ajoute `collection_number` aux catalogues `circuits` et `drivers`, corrige l'ancienne valeur exacte `Atypic` en `Atypique` (valeur canonique acceptée par le catalogue), remplit les numéros manquants de manière stable, impose l'unicité/non-nullité et configure une séquence indépendante par famille. Pour les circuits, l'ordre de backfill utilise le `created_at` présent dans la ligne lorsqu'il existe, puis `id`, et reste compatible avec un catalogue ancien sans cette colonne. Elle doit être appliquée après la migration 020 pour numéroter les pilotes. Ne pas appliquer de migration sans accord explicite et confirmation de la cible.
- Dans le résultat SQL de 021, une ligne `setval` contenant `2` est le retour normal de la configuration de la séquence, pas un nombre de lignes mises à jour ni une erreur. La séquence est réglée sur `MAX(collection_number) + 1` avec le troisième argument `FALSE`, donc le prochain `nextval()` attribue exactement cette valeur ; par exemple, un maximum existant de 1 prépare le prochain numéro 2. Un résultat `setval` seul ne prouve pas que toutes les instructions suivantes du script ont réussi : vérifier l'absence d'erreur finale et contrôler séparément les numéros des catalogues.
- **Important avant test** : cette migration n'est qu'un fichier du dépôt, elle n'est pas appliquée automatiquement. Le nouveau code de `/collection` et `/open` interroge `drivers` (et selon l'utilisateur `user_drivers`) pendant le chargement : appliquer la migration à la base de test autorisée avant d'exécuter cette version, sinon ces parcours peuvent échouer. La page `/admin/drivers` affiche également une erreur invitant à appliquer la migration. Ne jamais l'appliquer à Supabase sans accord explicite et confirmation de la cible.
- Les ateliers, contrats/succès et la boîte de réception vérifient les droits avec les RPC `is_admin` / `is_site_owner`. La migration `034_managed_admin_users.sql` ancre le propriétaire au compte existant `bobwatercooling@gmail.com` et permet à ce compte seul d'attribuer ou retirer le rôle via un pseudo ; les administrateurs délégués ne peuvent pas gérer les rôles. Ne pas appliquer cette migration sans accord explicite et confirmation de la cible. La migration n'ajoute pas de policy de suppression pour `drivers`; ne pas ajouter un bouton de suppression sans définir explicitement les règles d'historique et de possessions.
- La migration 020 ne préremplit aucun pilote : après son application, le catalogue est vide jusqu'à ce qu'un administrateur crée ses fiches. Ne pas inventer ni importer automatiquement des données de pilotes.
- Un éventuel **showroom public** est une idée future, **pas une permission de rendre tous les favoris ou inventaires publics**. Prévoir une sélection explicite, des données filtrées et une autorisation adaptée avant toute implémentation.
- Dans Card Studio, un véhicule peut avoir un numéro permanent, être **désactivé** sans être supprimé, ou être **exclu des tirages de boosters**. « Désactivé » et « exclu des boosters » ne sont pas synonymes.
- Les probabilités, coûts, quantités et exclusions des packs sont à vérifier dans `src/lib/boosters.ts` et les fonctions réelles d'ouverture ; ne pas déduire des taux à partir de textes marketing.
- Dans les boosters, les véhicules actifs et éligibles et les pilotes actifs et éligibles (`is_active !== false`, `booster_enabled !== false`) sans rareté reconnue reçoivent chacun une seule rareté virtuelle par pack, tirée selon les poids configurés ; ils ne doivent pas être dupliqués dans plusieurs pools. Les circuits non classés suivent la même règle. Les doublons restent possibles dans un même pack.
- Les boosters garantissent toujours **un circuit** ; les pilotes ne remplacent pas cette garantie. Pour chaque emplacement restant et sa rareté déjà tirée, le pool pilote a le même poids de source que le pool de circuit supplémentaire du pack (`circuitDropRate`). Si les trois catégories existent pour cette rareté, les poids sont circuit `p`, pilote `p`, véhicule `1 - 2p`; les options indisponibles sont écartées puis les poids restants sont normalisés. Les valeurs de `PACKS[slug].probabilities` et `circuitDropRate` ne sont pas éditées par l'ajout des pilotes, mais les raretés effectivement disponibles peuvent évoluer si le nouveau catalogue introduit une rareté jusque-là absente des véhicules/circuits.
- À l'ouverture d'un booster, les trois catalogues sont chargés complètement avant le débit des AC. Les possessions des véhicules, circuits et pilotes sont lues avant l'enregistrement pour calculer `NEW!` ; si la lecture échoue, aucun badge de première découverte n'est affiché. Une découverte n'est signalée que si l'enregistrement de la carte correspondante a réussi, et une seule fois par carte logique dans le pack.
- Pour les pilotes, la clé à utiliser dans les tirages, la possession, le comptage `NEW!` et l'enregistrement est `driver_id`, jamais `id` (identifiant technique de la ligne). L'ajout d'un pilote est effectué par `ajouterPiloteAuJoueur` de `src/lib/actions/carte.ts`, qui vérifie que la fiche existe, est active et, pour une source de pack, est éligible aux boosters, puis incrémente ou crée la possession et met à jour les événements de progression existants.
- Les circuits n'ont pas de filtre `is_active` / `booster_enabled` dans l'ouverture actuelle. Pour leurs possessions, utiliser `circuit_id` (et non l'`id` technique de la ligne) dans le tirage, l'enregistrement, les contrôles d'appartenance et le badge de première découverte.
- En pré-alpha, la migration `019_prealpha_enable_active_boosters.sql` rend éligibles aux boosters les cartes déjà actives exclues des boosters, sans réactiver les cartes désactivées. Card Studio signale les fiches véhicule auxquelles il manque des informations de base, une source explicite d’image ou des données techniques.
- Le catalogue de Card Studio doit lui aussi être chargé avec `fetchAllPages` et un tri stable : ne pas plafonner sa liste aux 1 000 lignes par défaut de Supabase.

**Présentation des boosters et révélation des cartes (règles validées) :**
- **Boutique `/boosters` : 2 packs par ligne sur smartphone**. Les visuels, titres, descriptions, prix AC et boutons d'achat sont compacts sur mobile ; l'affichage ordinateur conserve jusqu'à **3 packs par ligne**. Les noms de packs utilisent **Bebas Neue**. Ne pas confondre la boutique avec l'écran de tirage.
- **Après ouverture `/open` : 3 cartes par ligne uniquement sur smartphone** (grille `grid-cols-3` avant le breakpoint `sm` à 640 px). Sur les écrans plus larges, préserver la disposition `sm:flex sm:flex-wrap` et les dimensions desktop existantes.
- Les cartes révélées sont rendues par `src/components/Card.tsx` avec `compact`, `showLevel={false}`, `boosterReveal` et `mobileGrid={useCompactPhoneCards}` pour le petit écran. Le mode `mobileGrid` est activé par `matchMedia('(max-width: 639px)')` ; ne pas l'appliquer à la version PC.
- **Alignement des titres :** `boosterReveal` dans `Card.tsx` décale légèrement vers le haut le groupe **marque + modèle** des véhicules (`-translate-y-1`, soit 4 px) **uniquement pendant la révélation**. La collection emploie le même composant mais **sans** cette option : préserver la position de ses textes, ses statistiques, ses 4 colonnes mobiles et ses niveaux. Ne pas appliquer ce décalage à toutes les cartes.
- **Nouvelle découverte** : afficher le petit badge `NEW!` **en haut de la face révélée** d'une carte absente de la collection avant le tirage, pour véhicules, circuits et pilotes, sur mobile et PC. Un seul `NEW!` par fiche au sein du même pack, uniquement si son enregistrement a réussi. Vérifier les possessions dans `user_cards`, `user_circuits` et `user_drivers` **avant l'enregistrement**, avec les identifiants des bonnes catégories ; en cas d'échec de lecture, ne pas afficher ce badge. La détection est dans `getFirstTimeBoosterCardIndices()` de `src/lib/boosters.ts` et des tests de non-régression existent dans `src/lib/__tests__/boosters.test.ts`.
- Dans `/collection`, un badge `NEW!` persiste après le tirage jusqu'à l'ouverture de la modale. `user_card_discoveries` conserve `user_id`, catégorie, identifiant de carte et date de consultation ; l'insertion ne se fait que pour une première acquisition effectivement sauvegardée. La migration `022_user_card_discoveries.sql` définit les policies RLS pour véhicules, circuits et pilotes. Le composant `Card` reçoit `newlyAcquired` uniquement dans la collection ; il anime un dos mystère qui se retourne vers la face de la carte, puis conserve un badge NEW animé. Respecter `prefers-reduced-motion`.
- **Un tirage de booster ne doit jamais afficher de niveau, ni de badge « Niveau 0 », ni de badge d'exemplaires/niveau sous la carte.** Dans `Card.tsx`, les badges de niveau desktop **et** le badge mobile de collection sont conditionnés par `showLevel` (`mobileGrid && showLevel`). Préserver ce garde-fou : le badge reste utile dans la **collection** mais pas dans un tirage.
- **Au retournement d'une carte**, afficher immédiatement un **halo extérieur discret** correspondant à sa rareté, sur **smartphone et PC**. Utiliser `getRarityColor()` de `src/lib/rarity.ts` plutôt qu'une liste de couleurs dupliquée. L'élément `.booster-reveal-halo` est un frère du conteneur rotatif, derrière la carte, pour ne pas recouvrir l'image et les statistiques.
- **Aucune latence dans le halo** : l'animation CSS `booster-reveal-glow` de `src/app/globals.css` démarre **sans délai** et avec une opacité non nulle dès que l'état `flippedCards` passe à révélé. Préserver l'animation de retournement 3D et l'action « Retourner toutes les cartes ».
- Respecter `prefers-reduced-motion` : le halo reste visible mais immobile. Conserver les effets holographiques de rareté préexistants ; ne pas les remplacer par l'aura de révélation.
- Ne modifier **ni la dépense AC, ni les tirages, ni l'enregistrement des cartes** pour une demande de changement visuel sur `/boosters` ou `/open`.
- Les contrats et succès sont administrés dans `/admin/objectives` : objectifs, cibles, rareté éventuelle, AC à réclamer, activation et progression. Le type « Posséder des cartes selon des conditions » accepte plusieurs conditions reliées par ET/OU sur véhicules, circuits et pilotes, avec une carte précise ou des filtres catalogue, et un comptage en exemplaires ou en cartes distinctes. La progression se base sur l'inventaire actuel ; la migration `029_objective_collection_requirements.sql` doit être appliquée à la base autorisée avant d'utiliser cette fonction.
- Dans l'atelier des contrats et succès, les champs numériques de cible, de récompense AC et de quantité par condition peuvent rester temporairement vides pendant la saisie ; la validation serveur refuse une valeur obligatoire vide ou hors limites avant l'enregistrement.
- **Récompenses de connexion quotidienne** : à la première connexion de chaque date de la base, `claim_daily_login_booster()` accorde un booster non ouvert une seule fois par joueur et par date. Le cycle consécutif dure 7 jours et revient au jour 1 au jour 8 ou après une date manquée : `common`, `uncommon`, `rare`, `ultrarare`, `prototype`, `mythic`, `carbon`. Les boosters restent dans `user_daily_boosters` jusqu'à leur ouverture ; `/boosters` les liste, et leur ouverture utilise `consume_daily_login_booster()` sans dépense d'AC. La date de référence est `CURRENT_DATE` côté Supabase. Migration `039_daily_login_boosters.sql` requise. Ne jamais autoriser le client à attribuer un booster, choisir son palier ou ouvrir le booster d'un autre joueur.
- Événements connus : ouverture de boosters, collection de véhicules, circuits ou pilotes, rareté, annonce de marché, connexion sur différents jours.
- Une récompense n'est pas acquise avant la réclamation prévue par le système ; respecter les fonctions RPC atomiques et la progression sauvegardée.

## Correctif Market — SQL 044 appliquée le 09/11/2026 (PR #21 encore en brouillon)

- Diagnostic du 09/11/2026 : `src/app/marketplace/page.tsx` utilisait `marketplace_listings`, absente de la base active, tandis que la table historique `market` est vide et liée à l'ancien `public.users`. Le clic direct sur une carte du sélecteur « Vendre » utilisait également le comportement par défaut de `Card` et renvoyait vers `/collection/[card_id]`, alors que la page de détail recherchait seulement `cards.id` : affichage « Carte introuvable ».
- La migration `supabase/migrations/044_marketplace_transactional_listings.sql`, **appliquée à Supabase Apex Collector** sous la version `20261109145815`, crée : table `marketplace_listings` dédiée aux **véhicules** (`cards.card_id` et `user_cards.card_id`), RLS en lecture, RPC authentifiées `get_marketplace_listings`, `create_market_listing`, `buy_market_listing` et `cancel_market_listing`. Les crédits AC, le transfert d'un exemplaire et l'état de vente sont modifiés dans **une même transaction SQL** ; le vendeur ne peut pas réserver plus d'exemplaires que ceux qu'il détient. Ne pas revenir aux mises à jour client séparées de `profiles.ap` et `user_cards`.
- L'interface lance la fixation du prix au clic sur la carte dans le sélecteur ; le détail véhicule accepte `cards.card_id` et l'ancien `cards.id` et lit la possession depuis le `card_id` canonique. « Mes Ventes » distingue actives/vendues/annulées et permet l'annulation des actives.
- **SQL 044 déjà appliquée en production** : contrôles réalisés après exécution — table créée, RLS activé, quatre fonctions présentes et en `SECURITY DEFINER`, `authenticated` peut les exécuter, `anon` ne peut pas exécuter l'achat, insertion directe refusée, zéro annonce à l'installation et 97 lignes de possession de véhicules conservées. **La PR #21 n'est pas fusionnée et l'application n'a pas été déployée** : ne pas réappliquer SQL 044 ; ne pas fusionner/déployer sans accord explicite. Après fusion/déploiement autorisés, tester avec deux comptes de recette : création, réservation de doublons, auto-achat interdit, achat concurrent, paiement/quantités, annulation, absence d'achat répété et détail des cartes.
- Le Market de ce correctif concerne les **véhicules** seulement, comme le sélecteur actuel qui lit `user_cards` ; étendre aux circuits et aux pilotes nécessiterait un modèle de listing distinct et les trois inventaires. Les policies existantes de `profiles` et `user_cards` restent une préoccupation économique générale hors de cette correction.
- Les tests Jest ajoutés vérifient la délégation aux RPC et le traitement des erreurs, mais ne remplacent **pas** les tests transactionnels Postgres ni une validation sur l'application déployée.

## 9. Supabase, administration et sécurité

- Séparer clairement **client navigateur**, **actions serveur** et **fonctions SQL/RPC**. Le contrôle d'accès final doit être côté serveur / base, pas seulement dans l'interface.
- Les actions qui touchent les AC, aux collections, aux achats, au marché et aux récompenses demandent une vérification d'identité et des contrôles côté base.
- Respecter et vérifier les **policies RLS** avant toute requête ou migration. Ne jamais désactiver RLS « pour débloquer » une fonctionnalité.
- Les ateliers admin `/admin/cards`, `/admin/circuits`, `/admin/drivers` et `/admin/objectives` demandent une autorisation réelle, pas simplement la présence d'un lien dans la sidebar.
- La sidebar regroupe les ateliers, les contrats/succès et la boîte de réception sous « ADMIN ». Le lien « Gestion des accès » est réservé au propriétaire, mais les pages et actions serveur doivent toujours refaire le contrôle d'accès.
- L'administration est contrôlée côté serveur et par les policies RLS via `is_admin()` après application de `034_managed_admin_users.sql`. La migration initialise le propriétaire avec le compte existant `bobwatercooling@gmail.com`; cette identité est enregistrée en base et ne peut pas être changée par un administrateur délégué. Seul le propriétaire peut rechercher un joueur par pseudo, lui attribuer ou retirer le rôle ; un administrateur délégué ne peut pas gérer les rôles. Les ateliers, contrats/succès, types de compétition, types de tracé et suggestions sont accessibles aux administrateurs. Les migrations SQL précédentes restent l'historique de l'état initial et leurs politiques sont remplacées par cette migration. Ne pas appliquer la migration sans accord explicite et confirmation de la cible Supabase.
- `ADMIN_EMAILS` n'est plus utilisé pour déterminer les droits ; les rôles sont gérés en base. Ne pas réintroduire de contrôle d'accès fondé uniquement sur l'adresse e-mail ou sur la visibilité d'un lien.
- Les nouvelles inscriptions utilisent normalement la langue française par défaut ; la confirmation d'e-mail dépend de Supabase Auth et SMTP. Un succès de sign-up ne garantit pas la réception de l'e-mail.
- Variables documentées dans `.env.example` : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`, `NEXT_PUBLIC_APP_URL`, `SERVER_ACTIONS_ALLOWED_ORIGINS`. Les secrets vont dans `.env.local` / le gestionnaire d'environnement, **jamais** dans Git ou une réponse.
- Les migrations numérotées du dépôt vont actuellement de `002_quests_system.sql` à `040_driver_podiums_and_wins.sql` (avec un ancien fichier additionnel non numéroté). Repères :
  - `005` / `006` : politiques d'administration cartes et circuits ;
  - `007` : caractéristiques des véhicules ;
  - `008` / `009` : langue et unités du profil ;
  - `010` / `011` : numérotation, disponibilité et éligibilité aux boosters ;
  - `012` / `013` : niveaux de cartes et achats ;
  - `014` : contrats/succès et récompenses ;
  - `015` : contraintes de rareté des circuits ;
  - `016` : favoris privés des cartes.
  - `017` : sélection privée des véhicules exposés dans le garage personnel.
  - `018` : validation de propriété du garage compatible avec `cards.id` et `cards.card_id`.
  - `019` : activation booster des cartes déjà actives exclues des tirages, pour les tests pré-alpha.
  - `020` : catalogue des pilotes, possessions privées `user_drivers` et favoris de pilotes.
  - `021` : numérotation permanente des catalogues circuits et pilotes.
  - `022` : statut privé des nouvelles découvertes de cartes, avec RLS ; ne pas appliquer sans autorisation explicite.
  - `023` : publication facultative des showrooms de joueurs ; les données exposées sont limitées par une fonction RPC et la publication reste désactivée par défaut.
  - `024` : correction des compteurs d'inventaire utilisés par le RPC de showroom public.
  - `025` : classement authentifié de tous les joueurs par total de cartes et présentation privée des showrooms non publics.
  - `026` : statistiques complémentaires du showroom public : compteur des boosters ouverts à partir de son activation, meilleurs niveaux de véhicules et succès réclamés.
  - `027` : RPC authentifiée pour identifier le détenteur principal d'une carte sans exposer la liste des propriétaires.
  - `028` : lien entre une carte véhicule alternative et sa carte d'origine pour permettre des exemplaires collectionnables séparément.
  - `034` : rôles administrateurs attribuables par pseudo ; seul le propriétaire initial peut les gérer et les policies RLS utilisent le rôle en base.
  - `029` : conditions cumulatives de collection pour les contrats et succès, avec progression par cartes actuellement possédées.
  - `030` : suggestions de cartes de joueurs authentifiés, statuts de traitement, notes administratives et RLS.
  - `031` : premier champ de compétition des véhicules, synchronisé entre une carte d'origine et ses alternatives art.
  - `032` : liste des types de compétition administrable et précision libre, avec RLS ; la migration conserve les anciennes valeurs déjà saisies.
  - `033` : indicateur de record des véhicules et description, synchronisés entre une carte d'origine et ses alternatives art.
  - `034` : propriétaire initial et rôles administrateurs gérés par pseudo, RPC protégées et remplacement des policies d'administration par `is_admin()`.
  - `035` : attribution du plus petit numéro de collection libre à chaque nouvelle fiche véhicule, circuit ou pilote.
  - `036` : catalogue administrable des types de tracé, préservation des types déjà enregistrés, mise à jour des circuits lors d'un renommage et retrait du type lors d'une suppression ; accès protégé par `is_admin()` et RLS.
  - `037` : synchronisation des types de tracé de `user_circuits` avec le catalogue, remplacement de la contrainte de valeurs historiques par une clé étrangère avec cascade de renommage ; les données de possession restent intactes.
  - `038` : suppression des contraintes `CHECK` historiques portant sur les colonnes `type` des circuits et possessions, y compris si leur nom est incorrect, et rattachement des deux champs au catalogue administrable pour permettre les renommages.
  - `039` : suivi serveur des connexions journalières consécutives et attribution idempotente d'un booster gratuit par jour, stock privé des boosters non ouverts et RPC authentifiées pour la récompense et la consommation.
  - `040` : compteurs de podiums et de courses gagnées (entiers non négatifs) pour les fiches pilotes, initialisés à zéro pour les fiches existantes.
- **Ne pas supposer** qu'une migration est absente ou non appliquée parce qu'elle existe dans le dépôt. Inspecter l'état réel de la base et demander l'autorisation avant toute migration, modification de schéma ou backfill.
- Ne pas supprimer, réinitialiser ou modifier des données de joueurs pour résoudre un problème d'affichage.

## 10. Langues, unités et images

- Langues proposées : **français, anglais et espagnol** ; choix sauvegardés dans le profil et mis en cache côté navigateur. Mettre à jour `src/lib/preferences.ts` lors de l'ajout d'un texte visible.
- Systèmes : **métrique / impérial**. Affichages : CV/HP, Nm/lb-ft, kg/lb, km/h/mph, km/mi.
- Convertir **uniquement l'affichage**, jamais les valeurs sources en base. Réutiliser les fonctions de conversion existantes.
- Certains textes d'administration ou champs dynamiques peuvent rester en français ; ne pas présumer qu'une traduction existe.
- Images : bucket public Supabase Storage **assets**, avec notamment `cards/vehicle/`, `cards/circuit/`, `cards/driver/`, `assets/placeholders/pilot-default.jpg`, `logos/brand/`, `icons/` et `placeholders/`.
- Réutiliser `src/lib/images/` et `SafeImage`, qui acceptent clé Storage, URL publique ou chemin local selon le contexte ; ne pas concaténer manuellement les URLs.
- Les cartes pilotes utilisent la convention `cards/driver/{nom}-{année}.jpg`, le résolveur centralisé `resolveCardImage` et le placeholder configuré `assets/placeholders/pilot-default.jpg` (`IMAGE_PATHS.PLACEHOLDERS.PILOT_CARD`). `image_url` peut remplacer le chemin conventionnel. Vérifier la présence réelle de l'objet dans le bucket `assets` avant de conclure que le placeholder s'affichera.
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


## Parcours bêta, inscription et monnaie AC

- La monnaie visible est **Apex Crédits (AC)** ; conserver les noms techniques historiques `ap` et `reward_ap`, et les RPC de paiement et de récompense. Ne pas convertir ni créditer les soldes existants.
- Après application de la migration `041_signup_profile_preferences_and_ac.sql`, les nouveaux profils reçoivent 20 000 AC, et enregistrent e-mail, pseudo choisi, langue (`fr`, `en`, `es`) et unités (`metric`, `imperial`). Le pseudo est unique sans distinction de casse.
- Les e-mails de confirmation doivent revenir à `/auth/callback` sur le domaine HTTPS réel. Modifier **Site URL** et **Redirect URLs** dans Supabase Auth ; un commit GitHub ne les configure pas. Voir `docs/beta-registration.md`.


## Cadeaux de bienvenue et alertes dashboard (migration 042)
- La migration `042_player_welcome_gift_boosters.sql` ajoute un cadeau de bienvenue unique par nouveau profil `gift_key=welcome_2026`, pack commun 10 cartes. Ne pas réattribuer rétroactivement aux comptes existants sans accord.
- La disponibilité du cadeau est contrôlée par RLS et la consommation unique `consume_player_gift_booster`; l'ouverture suit le tirage et l'enregistrement existants (circuit garanti, badges NEW, statistiques). Ne jamais exposer un chemin qui évite la consommation du cadeau ou débite des AC pour un cadeau.
- La modale de `/dashboard` détecte les boosters offerts non ouverts depuis Supabase et mémorise la prise de connaissance, sans les consommer. Les quotidiennes restent séparées des cadeaux de bienvenue.


## Suppression définitive des comptes (migration 043)
- /admin/players : réservé au propriétaire, recherche par e-mail/pseudo, suppression de tout autre utilisateur, y compris un administrateur délégué.
- /settings : tout joueur peut supprimer son propre compte après saisie de son mot de passe actuel, phrase de confirmation exacte et case de compréhension. Mot de passe validé via Auth et à nouveau dans la fonction SQL.
- Le compte propriétaire du site est protégé contre la suppression tant que sa propriété n'a pas été transférée (protection anti-verrouillage).
- Migration 043_owner_permanent_player_deletion.sql : RPC owner_search_player_accounts (owner only) et permanently_delete_player_account (owner pour autrui, joueur pour soi), contrôles d'autorisation en SECURITY DEFINER, rôles/grants restrictifs. La migration ne supprime aucun utilisateur.
- Suppression en transaction SQL : confirmation cible Auth ID+pseudo+email, verrouillage Auth, transfert de toute attribution de rôle admin vers le propriétaire, retrait du rôle du compte visé, nettoyage des anciennes tables market/users, suppression de profiles et auth.users avec cascades. Les circuits du catalogue commun sont préservés en détachant leur user_id facultatif.
- Si le compte possède des fichiers Storage, la suppression entière est refusée jusqu'à un nettoyage via les API Storage (jamais supprimer seulement les métadonnées SQL). Les catalogues partagés sont conservés.
- Les JWT émis peuvent rester valides jusqu'à expiration ; déconnexion locale après suppression personnelle. Les sauvegardes suivent la rétention Supabase.
- **Statut vérifié le 9 novembre 2026 : la migration 043 a été appliquée à Supabase et inscrite dans l’historique.** Aucun compte n’a été supprimé lors de son application. Les fonctions sont réservées au rôle `authenticated`, puis vérifient les droits dans leur corps ; `anon` n’a pas EXECUTE.
- Après le déploiement de l’interface, tester les protections avant toute suppression réelle ; ne jamais déclencher une suppression d’utilisateur sans confirmation explicite dans l’interface. Tout nouveau changement de schéma nécessite une autorisation adaptée.

## Journal consolidé — inscriptions, cadeaux et gestion des comptes (9 novembre 2026)

> Cette section récapitule les changements effectifs de ce fil de travail, les interventions directes sur la base et les étapes de livraison. Les règles ci-dessus restent la référence technique ; ne pas déduire qu'une PR fusionnée configure automatiquement Supabase Auth, SMTP ou Vercel.

### 1. Inscription bêta, compte joueur, 20 000 AC — PR #18 / SQL 041
- Fichiers principaux : `src/app/login/page.tsx`, `src/app/auth/callback/page.tsx`, `src/lib/signup.ts`, `src/lib/preferences.ts`, `supabase/email-templates/confirmation.html`, `supabase/migrations/041_signup_profile_preferences_and_ac.sql`, `docs/beta-registration.md`, tests et `AGENTS.md`.
- Le formulaire d'inscription accepte un pseudo modifiable (3 à 24 caractères ASCII, lettres/chiffres/`_`/`-`), la langue FR/EN/ES et les unités métriques/impériales. La confirmation e-mail utilise `/auth/callback` et un retour contrôlé vers la route interne voulue.
- SQL 041 : valeur par défaut de `public.profiles.ap` portée de 1 000 à **20 000 AC** (nom SQL `ap` conservé) ; trigger `handle_new_user()` créant le profil avec pseudo, e-mail et préférences ; index de pseudo unique indépendamment de la casse ; backfill des e-mails absents et création des profils Auth manquants.
- La migration n'écrase **pas** les soldes des profils déjà créés. Les URLs de redirection de Supabase Auth, Site URL, le modèle e-mail et le SMTP restent des réglages hébergés à configurer et à tester indépendamment du dépôt.
- Incident diagnostiqué : un compte Auth confirmé n'avait aucun profil et son dashboard affichait à tort 0 AC. Réparation ciblée en production du profil du compte de test `leav7878` avec **20 000 AC**, e-mail et préférences ; aucun solde d'un autre joueur n'a été changé par cette réparation.
- Un autre compte de test, `topgerard76`, avait été créé avant SQL 041 avec **1 000 AC** et un pseudo calculé depuis l'e-mail : le passage à SQL 041 ne revalorise pas rétroactivement son solde.
- **Statut : PR #18 fusionnée dans `main` ; SQL 041 appliquée et enregistrée dans l'historique Supabase le 09/11/2026.**

### 2. Booster quotidien, cadeau de bienvenue de dix cartes et alertes — PR #19 / SQL 042
- Le booster de connexion quotidienne existait déjà (migration 039, RPC `claim_daily_login_booster`, `consume_daily_login_booster`, `user_daily_boosters`). Vérification des comptes de test : les boosters du jour avaient été attribués et étaient non ouverts ; le souci signalé était l'absence de notification sur le dashboard, pas une absence de crédit de booster.
- Fichiers touchés : `src/components/DashboardGiftNotice.tsx`, `src/app/dashboard/page.tsx`, `src/app/boosters/page.tsx`, `src/app/open/page.tsx`, `src/lib/boosters.ts`, `src/lib/preferences.ts`, tests, `supabase/migrations/042_player_welcome_gift_boosters.sql` et documentation.
- SQL 042 : table `user_gift_boosters` sous RLS, unicité `(user_id, gift_key)`, trigger sur insertion du profil, clé `welcome_2026`, pack `common`, **10 cartes**, et RPC authentifiée `consume_player_gift_booster` qui vérifie la propriété et n'autorise qu'une consommation.
- `/boosters` affiche les cadeaux en attente séparément des quotidiens ; `/open?gift_booster=<uuid>` réutilise le tirage, les probabilités du pack commun et la garantie d'un circuit, avec **10 cartes**, sans dépense d'AC. Les packs payants et quotidiens ne changent pas de quantité.
- Une modale sur `/dashboard` annonce les cadeaux quotidiens ou de bienvenue non ouverts. La prise de connaissance est stockée par cadeau et par joueur dans le navigateur (`localStorage`) ; fermer la modale **ne consomme jamais** le booster. Le joueur le retrouve dans la boutique ; le composant supporte l'absence temporaire de la table tant que 042 n'est pas déployée.
- SQL 042 **n'accorde pas rétroactivement** un cadeau aux comptes créés auparavant. L'ouverture du booster et l'enregistrement des cartes **ne sont pas une transaction unique** : une panne entre les deux peut demander une réparation manuelle.
- **Statut : PR #19 fusionnée dans `main` ; SQL 042 appliquée et enregistrée dans l'historique Supabase le 09/11/2026.**

### 3. Suppression définitive : côté joueur et côté propriétaire — PR #20 / SQL 043
- Fichiers : `src/app/settings/SelfAccountDeletion.tsx`, `src/app/settings/actions.ts`, `src/app/settings/page.tsx`, `src/app/admin/players/{page.tsx,PlayerAccountManager.tsx,actions.ts}`, `src/lib/admin/playerDeletion.ts`, ses tests, `src/components/Sidebar.tsx`, `src/lib/preferences.ts`, SQL 043 et documentation.
- Dans Réglages, le joueur peut demander **uniquement sa propre suppression** ; la page exige une case de compréhension, la phrase exacte `SUPPRIMER <pseudo>` et son mot de passe actuel. La session est nettoyée côté navigateur après succès. Le serveur vérifie le mot de passe via Supabase Auth et la fonction SQL le revérifie via `extensions.crypt` pour protéger également l'appel RPC direct.
- Dans Admin → Gestion des joueurs (menu PC et mobile), **seul le propriétaire du site** peut rechercher par pseudo/e-mail et supprimer **tout autre compte**, y compris un administrateur délégué. Un admin délégué ne peut pas supprimer autrui. Le compte propriétaire n'est pas supprimable tant que la propriété du site n'a pas été transférée.
- SQL 043 : `owner_search_player_accounts` et `permanently_delete_player_account` sont exécutables par `authenticated` uniquement et recontrôlent l'identité `auth.uid()` et les droits côté base ; `anon` n'a pas EXECUTE. Suppression sur UUID + pseudo + e-mail + phrase de confirmation, verrouillage de la ligne Auth, transaction atomique avec retour arrière sur erreur.
- Nettoyage : anciens `market` et `users`, rôle administrateur supprimé, réattribution des rôles qu'il avait attribués au propriétaire, puis profil et utilisateur Auth avec cascades de leurs possessions, cartes, pilotes, boosters, cadeaux, découvertes, favoris, progression, statistiques et sessions. Le `user_id` facultatif des circuits du **catalogue partagé** est d'abord mis à NULL pour préserver ces fiches et les cartes des autres joueurs.
- Si l'utilisateur possède un fichier, bucket ou upload dans Supabase Storage, la fonction refuse **toute suppression** : supprimer les blobs via les API Storage avant de recommencer, jamais seulement les métadonnées SQL. Les JWT déjà délivrés peuvent rester valides jusqu'à expiration et les sauvegardes Supabase suivent leur politique de rétention.
- **Statut base : SQL 043 appliquée et enregistrée dans l'historique Supabase le 09/11/2026.** Contrôle post-migration : 5 utilisateurs Auth et 5 profils avant/après, 0 profil orphelin, 1 propriétaire reconnu ; aucune suppression déclenchée par l'installation. Les parcours de suppression réels restent à tester avec des comptes de recette.

### 4. Discipline de déploiement et vérifications
- L'ordre SQL sur la base de production a été **041 → 042 → 043**. Les PR applicatives associées sont **#18 → #19 → #20**. Fusionner un fichier de migration dans GitHub ne le déploie pas automatiquement dans Supabase ; ici, les trois migrations ont été exécutées explicitement via Supabase.
- **Statut GitHub vérifié le 09/11/2026 : PR #18, PR #19 et PR #20 toutes fusionnées dans `main`.** PR #20 fusionnée via commit `cf69671cf4aa4a78a0a604033ba42a116396d38f`. Les migrations SQL 041, 042, 043 sont déjà appliquées ; aucun compte n'a été effacé pendant la mise en place.
- PR #18 et #19 : tests et build GitHub réussis avant fusion. PR #20 : tests et build GitHub réussis sur la version contrôlée ; le contrôle externe `Dependency Review` échoue du fait de la configuration du dépôt et doit être distingué des tests applicatifs. Relancer/contrôler la CI si le commit HEAD change.
- Ne jamais tester une suppression définitive sur un compte réel sans action explicite du propriétaire ou du joueur concerné. Un déploiement Vercel doit être vérifié séparément de l'état GitHub `main`.

## 2026-11-10 — Récompenses mixtes et paliers d’écurie (PR à valider)
- Migration `045_objective_booster_rewards_and_garage_levels.sql` : **ne pas l'appliquer en production sans validation**. Le schéma accepte les objectifs `showroom_first` et les récompenses `ac`, `booster`, `both` (ET) et `either` (OU : 50/50 à la réclamation).
- Nouveaux succès : première carte exposée dans le showroom (1 500 AC), véhicule électrique (code EL, 1 500 AC), diesel (GO, 250 AC), essence (ES, 2 500 AC). La collection actuelle sert de source de vérité pour la motorisation ; première exposition confirmée côté serveur après sauvegarde du showroom.
- Écurie : niveau de départ 1, puis +1 niveau tous les 10 véhicules différents. Chaque niveau franchi à partir du niveau 2 donne un booster tiré au sort parmi les huit packs et attribué une seule fois via `user_gift_boosters.gift_key = garage_level_N`. Un rattrapage unique est prévu pour les niveaux déjà franchis lors de l’application.
- Dans l’atelier admin : AC seuls, booster seul, AC ET booster, AC OU booster, pack fixe ou aléatoire. La fonction SQL de réclamation verrouille la progression et attribue le gain atomiquement, sans double réclamation.
- Les boosters issus d’objectifs et de niveaux sont conservés dans `user_gift_boosters`, ouverts via `/open?gift_booster=...` et affichés sur la boutique ainsi que dans l’alerte du dashboard.
- Tests à mener après migration : création/édition des quatre modes, succès de possession et exposition, paliers 2/3, non-duplication après recharge/retrait/réacquisition, réclamation concurrente, ouverture des boosters et absence de régression des contrats AC.
