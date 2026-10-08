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

The card admin studio supports vehicle specification fields, including power in HP and kW, torque, maximum speed, and weight. Vehicle performance index is calculated from horsepower and weight.

For a fresh Supabase setup, apply migrations `007_vehicle_card_specs.sql`, `008_profiles_language_default.sql`, and `009_profiles_unit_preference.sql` in addition to the admin access migrations described below.

Jest tests cover preference translations, unit conversions, and vehicle performance-index calculations.

### Card levels, badges, and visual effects

A card's level is based on the number of copies owned. The level badge is displayed below the card when enabled; level 0 has no material overlay, while levels 1–9 apply a distinct finish as a border-like overlay inside the card, up to the rarity outline.

| Level | Copies owned | Visual effect |
| --- | ---: | --- |
| 0 | 1 | No visual effect |
| 1 | 2 | Aluminium |
| 2 | 5 | Brushed aluminium |
| 3 | 10 | Carbon |
| 4 | 25 | Forged carbon |
| 5 | 50 | Carbon Kevlar |
| 6 | 100 | Exhaust-manifold thermal wrap |
| 7 | 200 | Polished metal |
| 8 | 500 | Shiny gold foil |
| 9 | 1,000 | Heat-blued titanium |

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

L’atelier d’administration des cartes prend en charge les caractéristiques des véhicules, notamment la puissance en HP et en kW, le couple, la vitesse maximale et le poids. L’indice de performance du véhicule est calculé à partir de la puissance en chevaux et du poids.

Pour une nouvelle installation Supabase, appliquer les migrations `007_vehicle_card_specs.sql`, `008_profiles_language_default.sql` et `009_profiles_unit_preference.sql`, en plus des migrations de droits d’administration décrites ci-dessus.

Les tests Jest couvrent les traductions des préférences, les conversions d’unités et le calcul de l’indice de performance des véhicules.


Le design des cartes est encore a determiner, 
- Holographique
- Effet carbone
- Effet Kevlar
- Effet carbone forgé
- Titane brossé
- Titane bleu
- echappement blanc mat ?
- Feuille d’isolant or
- Monochrome
- Blueprint
- Croquis design
- Carte rétros
- Acier brossé

### Niveaux, badges et effets visuels des cartes

Le niveau d’une carte dépend du nombre d’exemplaires possédés. Lorsque son affichage est activé, le badge « Niveau X » apparaît sous la carte. Le niveau 0 n’a pas d’effet de matière ; du niveau 1 au niveau 9, chaque palier applique une finition distincte sous forme de liseré à l’intérieur de la carte, jusqu’au contour de rareté.

| Niveau | Exemplaires possédés | Effet visuel |
| --- | ---: | --- |
| 0 | 1 | Aucun effet visuel |
| 1 | 2 | Aluminium |
| 2 | 5 | Aluminium brossé |
| 3 | 10 | Carbone |
| 4 | 25 | Carbone forgé |
| 5 | 50 | Carbone kevlar |
| 6 | 100 | Bandes thermiques de collecteur d’échappement |
| 7 | 200 | Métal poli brillant |
| 8 | 500 | Feuilles d’isolant doré brillant |
| 9 | 1 000 | Titane bleui par la chaleur |



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
