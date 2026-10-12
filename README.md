# Apex Collector

French version below

Last update : 2026-10-08


**About me**: I’m a huge car enthusiast, but I hate coding and know absolutely nothing except “npm run dev.” I have tons of ideas but it’s the technical side that holds me back. I’ve tried four different AIs to help me, but each time it goes in circles and never solves concrete bugs.

---

## 🚀 The Project

**About**
Apex Collector – Collect cards in an automotive-themed game. Unlock achievements, manage your collection, and trade your cards!

* The design will be heavily inspired by existing collectibles (Pokémon, early Initial D card games, trumps, Top Gear, Top Maxx)
* Card collection management
* Display cards in an album layout like Pokémon
* Built-in marketplace for trading/buying cards
* Profile stats and achievements to unlock (e.g. achievement for owning 10 cards)
* Responsive and animated interface

---

## 🛠️ Tech Stack

After 958 AI-assisted attempts, here’s what’s currently on the repo… I’m not sure all of it is actually useful:

* Next.js 14
* TypeScript
* Tailwind CSS
* Husky
* Framer Motion
* Jest & Testing Library
* Supabase
* Vercel

---

## 🎨 Design

The overall design is centered around motorsports and the gentleman driver aesthetic. More themes can be unlocked later as players progress.

I’m inspired by these game styles:

* Gran Turismo
* Test Drive Unlimited
* Colin McRae Rally (2000)
* Need for Speed 3 & 4

---

## 🔖 Cards

The card design is still undecided, but possible styles include:

* Holographic
* Carbon effect
* Kevlar effect
* Forged carbon
* Brushed titanium
* Blue titanium
* Matte white exhaust effect?
* Gold insulating foil
* Monochrome
* Blueprint
* Design sketch
* Retro-style cards
* Brushed steel

### Profile preferences and vehicle specifications

The profile settings page lets signed-in players choose French, English, or Spanish and select metric or imperial units. Language and unit preferences are saved to the Supabase profile and cached in the browser; the selected language is also reflected in the document language. Translations cover the main player-facing pages and navigation. Some admin screens and content loaded dynamically from the database may remain in French.

Vehicle and circuit specifications are displayed using the selected unit system without changing their stored source values:

| Specification | Metric | Imperial |
| --- | --- | --- |
| Power | CV | HP |
| Torque | Nm | lb-ft |
| Vehicle weight | kg | lb |
| Speed | km/h | mph |
| Circuit distance | km | mi |

The card admin studio supports vehicle specification fields, including power in HP and kW, torque, maximum speed, and weight. Vehicle performance index is calculated from horsepower and weight. Vehicle cards also display a drivetrain-layout icon; hover over it to see the full engine-position and drivetrain description for its code (MR, FF, FR, MF, FA, RR, RA, or MA).

Vehicle cards also support transmission, new price in euros, fuel type, maximum RPM, and units sold. Migration `007_vehicle_card_specs.sql` adds these optional columns to `public.cards`.

Circuit images use the same Supabase Storage image resolver as vehicle cards. Enter a storage key such as `assets/cards/circuit/spa-francorchamps-2012.jpg`, a full public URL, or a local path beginning with `/`; the Card Studio preview resolves the storage key and shows a country flag for a country code such as `BE`. Supabase URLs with the truncated `/storage/v1/object/publi/` segment are normalized to `/storage/v1/object/public/` for image display.

The Card Studio fuel selector supports the acronyms ES, GO, EL, EE, EH, GL, GH, E85, ET, GP, GN, H2, EG, EN, FG, and FL. Recognized fuel types appear as a compact badge below the vehicle's performance-index badge; existing common values such as “Diesel” and “Essence” are recognized too.

For a fresh Supabase setup, apply migrations `007_vehicle_card_specs.sql` through `015_align_circuit_rarities.sql` in order, in addition to the admin access migrations described below. These add vehicle specifications, profile preferences, card numbering and availability controls, purchasable player card upgrades, manageable contracts and achievements, and aligned circuit rarity constraints.

New sign-ups send `language: 'fr'` as Supabase Auth user metadata. Migration `008_profiles_language_default.sql` also sets `public.profiles.language` to `fr` when an insert omits the column. Apply the migration in the Supabase SQL Editor or through the project's migration workflow; it does not replace an explicit `NULL` inserted by a database trigger.

Email confirmation and delivery are controlled by the Supabase Auth email settings. A successful sign-up response does not guarantee that the confirmation email was delivered or that the address is confirmed. Check the user's status under **Authentication → Users**, and review Auth logs and SMTP settings if the email does not arrive. The login page currently redirects after a successful sign-up response, including when email confirmation is still pending.

Jest tests cover preference translations, unit conversions, and vehicle performance-index calculations.

### Card levels, badges, and visual effects

A vehicle card's upgrade level is purchased by the player and applies to all copies of that vehicle in their collection. Duplicate-copy thresholds unlock the next purchase but are not consumed. The level badge below owned cards shows the next level and its AP price when that level is unlocked. Card detail views show the current level and duplicate progress.

| Level to purchase | Copies required | Price (AP) | Visual effect |
| --- | ---: | ---: | --- |
| 1 | 2 | 250 | Base level |
| 2 | 5 | 500 | Subtle crystal sparkle |
| 3 | 10 | 1,000 | Brighter crystal sparkle |
| 4 | 25 | 2,000 | Intense crystal shine |
| 5 | 50 | 3,000 | Holographic |
| 6 | 100 | 5,000 | Stronger holographic |
| 7 | 200 | 10,000 | Stronger holographic |
| 8 | 500 | 20,000 | Stronger holographic |
| 9 | 1,000 | 50,000 | Strongest holographic |

The purchase is validated and processed atomically in Supabase: the player must own the card, meet its duplicate threshold, and have enough AP. Reduced-motion preferences disable the animated parts of the card effects.

The Card Studio can assign each vehicle a permanent collection number, deactivate it in the game without deleting it, and independently exclude it from booster draws. Deactivated vehicles are hidden from player-facing game surfaces; booster-excluded vehicles remain in the catalog and game but cannot be drawn from packs.

Apply Supabase migrations `010_card_catalog_status_and_numbering.sql`, `011_card_booster_eligibility.sql`, `012_user_card_upgrade_levels.sql`, and `013_purchase_card_upgrades.sql` in order to enable these catalog controls and upgrades.

### Contracts and achievements

Admins manage contracts and achievements in `/admin/objectives`. Each objective has a title, description, progress target, optional rarity requirement, AP reward, and active state. Supported events are opening boosters, collecting vehicles, collecting a specified rarity, creating marketplace listings, collecting circuits, and logging in on distinct days. Completed objectives award AP when the player claims the reward. Disabling an objective hides it from players while preserving their progress.

Migration `014_manage_objectives.sql` creates the objective definitions and per-player progress, imports existing contracts and progress, and provides the database functions used to track progress and claim rewards atomically.

Migration `015_align_circuit_rarities.sql` aligns the circuit rarity constraints with the rarities available in the Card Studio. Apply it if editing a circuit fails with a rarity check-constraint error.

---

## 🤝 How to Contribute

We welcome all contributions! Here's how you can help:

1. Fork the project
2. Create your branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'Add: New Feature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

For more details, see our contribution guide.

---

## 📝 License

This project is licensed under the MIT License – see LICENSE.md for details.

---

## 👥 Authors & Contributors

**@iBob78** – Creator

⭐ Show your support!



#FRENCH VERSION :


About me : Je suis un gros passioné d'automobile, mais je déteste le code, la programmation et j'y connais absolument rien a part 'npm run dev'.
J'ai pleins d'idées mais c'est la technique qui me freine, j'ai essayer 4 IA pour m'aider mais a chaque fois ca tourne en rond et y'a plus de bugs de concret.



## 🚀 Le projet : 

About
Apex Collector - Collectez les cartes de jeu basé sur le monde automobile. Débloquez des succès, gérez votre collection et échangez vos cartes !

- Le schéma sera beaucoup inspiré de qui ce fait déja (Pokémon, Anciens jeu de carte initial D, trumps, top gear, top maxx)
- Gestion de collection de cartes
- Affichage des cartes sous forme d'un album comme pokémon 
- Système de marketplace d'échanges/achat de carte intégré
- Statistiques de profil, succès a débloquer (ex: succès au bout de 10 cartes possédées)
- Interface réactive et animée

## 🛠️ Stack Technique

Avec mes 958 tentatives de IA, voici tout ce qui à été mis en place sur le git... Je suis pas persuadé de l'utilitée de toutes.

- Next.js 14
- TypeScript
- Tailwind CSS
- Husky
- Framer Motion
- Jest & Testing Library
- Supabase
- Vercel


## Design

Le désign global est axé sur le sport automobile et le gentleman driver. D'autres themes pourront se débloquer plus tard au fur a mesure de la progression dans le jeu.

J'aime les inspirations tirés des jeux :
- Gran turismo
- Test drive unlimited
- Colin Mc rae rally 2000
- Need for speed 3 & 4


## Cartes

### Atelier d’administration

Les ateliers `/admin/cards` et `/admin/circuits` permettent aux administrateurs de créer et modifier les catalogues de véhicules et de circuits dans Supabase. Ils sont accessibles depuis la navigation quand un utilisateur est connecté et vérifient son adresse côté serveur. Les modifications restent également soumises aux règles RLS de Supabase.

Configure `ADMIN_EMAILS` dans `.env.local` et dans les variables d’environnement de déploiement. La variable accepte plusieurs adresses séparées par des virgules. Exemple : `ADMIN_EMAILS="admin@example.com"`. L’adresse doit aussi correspondre à celle autorisée par les migrations `005_cards_admin_write_policies.sql` et `006_circuits_admin_write_policies.sql` ; mets à jour ces policies si tu changes d’administrateur. Dans Codespaces, l’origine du port courant est automatiquement autorisée pour les actions Next.js ; pour un autre proxy, indique ses noms d’hôtes exacts dans `SERVER_ACTIONS_ALLOWED_ORIGINS`, séparés par des virgules. Applique les migrations Supabase pour activer l’image, les spécifications véhicule et les droits d’écriture des ateliers.

### Préférences du profil et caractéristiques des véhicules

Dans les réglages du profil, les joueurs connectés peuvent choisir le français, l’anglais ou l’espagnol, ainsi que le système métrique ou impérial. La langue et les unités sont enregistrées sur le profil Supabase et mises en cache dans le navigateur ; la langue sélectionnée est également indiquée au document HTML. Les traductions couvrent les principales pages et la navigation destinées aux joueurs. Certains écrans d’administration et contenus chargés depuis la base de données peuvent rester en français.

Les caractéristiques des véhicules et des circuits sont affichées selon le système choisi, sans modifier les valeurs enregistrées :

| Caractéristique | Métrique | Impérial |
| --- | --- | --- |
| Puissance | CV | HP |
| Couple | Nm | lb-ft |
| Poids du véhicule | kg | lb |
| Vitesse | km/h | mph |
| Distance du circuit | km | mi |

L’atelier d’administration des cartes prend en charge les caractéristiques des véhicules, notamment la puissance en HP et en kW, le couple, la vitesse maximale et le poids. L’indice de performance du véhicule est calculé à partir de la puissance en chevaux et du poids. L’icône de configuration moteur/transmission de chaque carte affiche sa description complète au survol (codes MR, FF, FR, MF, FA, RR, RA et MA).

Les cartes de véhicules prennent aussi en charge la transmission, le prix neuf en euros, le type de carburant, le régime maximal et le nombre d’exemplaires vendus. La migration `007_vehicle_card_specs.sql` ajoute ces colonnes facultatives à `public.cards`.

Les images de circuit utilisent le même résolveur d’images Supabase Storage que les cartes véhicule. Renseigne une clé de stockage comme `assets/cards/circuit/spa-francorchamps-2012.jpg`, une URL publique complète ou un chemin local commençant par `/` ; l’aperçu du Card Studio résout la clé et affiche le drapeau du pays à partir d’un code comme `BE`. Les URL Supabase comportant le segment tronqué `/storage/v1/object/publi/` sont normalisées en `/storage/v1/object/public/` pour l’affichage des images.

Le sélecteur de carburant du Card Studio propose les acronymes ES, GO, EL, EE, EH, GL, GH, E85, ET, GP, GN, H2, EG, EN, FG et FL. Les carburants reconnus apparaissent dans un petit badge sous le badge d’indice de performance ; les anciennes valeurs courantes comme « Diesel » et « Essence » sont également reconnues.

Pour une nouvelle installation Supabase, appliquer dans l’ordre les migrations `007_vehicle_card_specs.sql` à `015_align_circuit_rarities.sql`, en plus des migrations de droits d’administration décrites ci-dessus. Elles ajoutent les caractéristiques véhicule, les préférences de profil, la numérotation et les contrôles de disponibilité des cartes, les améliorations achetables, la gestion des contrats et succès, ainsi que l’alignement des raretés de circuits.

Lors d’une nouvelle inscription, l’application transmet `language: 'fr'` dans les métadonnées utilisateur de Supabase Auth. La migration `008_profiles_language_default.sql` définit également `fr` comme valeur par défaut de `public.profiles.language` lorsqu’une insertion omet cette colonne. Appliquer la migration dans le SQL Editor de Supabase ou via le processus de migrations du projet ; cette valeur par défaut ne remplace pas un `NULL` explicitement inséré par un trigger.

L’envoi et la confirmation des e-mails dépendent des réglages e-mail de Supabase Auth. Une réponse positive à l’inscription ne garantit pas que le mail de confirmation a été livré ni que l’adresse est confirmée. Vérifier le statut du compte dans **Authentication → Users** et consulter les journaux Auth ainsi que les réglages SMTP si le mail n’arrive pas. La page de connexion redirige actuellement après une réponse positive, même si la confirmation par e-mail est encore en attente.

Les tests Jest couvrent les traductions des préférences, les conversions d’unités et le calcul de l’indice de performance des véhicules.


Les cartes Icon, Mythic et Legend disposent d’effets holographiques spécifiques. Les améliorations achetées apportent progressivement un effet cristal scintillant (niveaux 2 à 4), puis un effet holographique plus intense (niveaux 5 à 9).

### Niveaux, badges et effets visuels des cartes

Le niveau d’amélioration d’une carte véhicule est acheté par le joueur et s’applique à tous les exemplaires de ce véhicule dans sa collection. Les doublons débloquent l’achat du niveau suivant, mais ne sont pas consommés. Le badge sous une carte possédée indique le prochain niveau et son prix en AP lorsqu’il est débloqué. La fenêtre de détails affiche le niveau actuel et la progression en doublons.

| Niveau à acheter | Exemplaires requis | Prix (AP) | Effet visuel |
| --- | ---: | ---: | --- |
| 1 | 2 | 250 | Niveau de base |
| 2 | 5 | 500 | Scintillement cristal léger |
| 3 | 10 | 1 000 | Scintillement cristal renforcé |
| 4 | 25 | 2 000 | Effet cristal brillant |
| 5 | 50 | 3 000 | Holographique |
| 6 | 100 | 5 000 | Holographique renforcé |
| 7 | 200 | 10 000 | Holographique renforcé |
| 8 | 500 | 20 000 | Holographique renforcé |
| 9 | 1 000 | 50 000 | Holographique maximal |

L’achat est vérifié et traité de façon atomique dans Supabase : le joueur doit posséder la carte, avoir assez de doublons et disposer des AP nécessaires. La préférence de réduction des animations désactive les parties animées des effets.

L’atelier Card Studio permet d’attribuer un numéro permanent à chaque carte véhicule, de la désactiver dans le jeu sans la supprimer et, indépendamment, de l’exclure des boosters. Une carte désactivée est masquée dans les surfaces destinées aux joueurs ; une carte exclue des boosters reste visible et disponible dans le jeu, mais ne peut plus être tirée dans un pack.

Pour activer ces contrôles et améliorations dans Supabase, appliquer dans l’ordre les migrations `010_card_catalog_status_and_numbering.sql`, `011_card_booster_eligibility.sql`, `012_user_card_upgrade_levels.sql` et `013_purchase_card_upgrades.sql`.

### Contrats et succès

Les administrateurs gèrent les contrats et les succès dans `/admin/objectives`. Chaque objectif possède un titre, une description, une cible de progression, une rareté facultative, une récompense en AP et un statut actif. Les événements disponibles sont l’ouverture de boosters, la collection de véhicules, l’obtention d’une rareté donnée, la création d’annonces Marketplace, la collection de circuits et les connexions sur des jours différents. Une fois l’objectif terminé, le joueur réclame sa récompense en AP. La désactivation masque l’objectif sans supprimer la progression des joueurs.

La migration `014_manage_objectives.sql` crée les définitions et progressions par joueur, importe les contrats et leurs progressions existants, et ajoute les fonctions SQL de suivi et de réclamation atomique des récompenses.

La migration `015_align_circuit_rarities.sql` aligne les contraintes de rareté des circuits sur les raretés proposées dans le Card Studio. Applique-la si la modification d’un circuit échoue avec une erreur de contrainte de rareté.
🤝 Comment contribuer
Nous accueillons toutes les contributions ! Voici comment vous pouvez nous aider :

Forkez le projet
Créez votre branche (git checkout -b feature/NouvelleFeature)
Committez vos changements (git commit -m 'Add: Nouvelle Feature')
Poussez vers la branche (git push origin feature/NouvelleFeature)
Ouvrez une Pull Request
Pour plus de détails, consultez notre guide de contribution.

📝 Licence
Ce projet est sous licence MIT - voir le fichier LICENSE.md pour plus de détails.

👥 Auteurs et contributeurs
@iBob78 - Créateur
⭐ Montrez votre soutien !
