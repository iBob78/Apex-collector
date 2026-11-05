# Apex Collector

**Apex Collector** est un jeu de collection de cartes consacré à l'automobile, aux circuits et aux pilotes. Construisez votre garage, ouvrez des boosters, collectionnez des véhicules et des pilotes emblématiques, et progressez au fil des contrats et des succès.

L'univers visuel s'inspire du sport automobile, de l'esthétique *gentleman driver* et des jeux de collection, avec des cartes aux raretés et aux effets distinctifs.

> **Projet en développement** — Certaines fonctionnalités et interfaces peuvent encore évoluer.

## Fonctionnalités

- **Collection automobile** : cartes de véhicules, de circuits et de pilotes à retrouver dans un garage personnel.
- **Cartes détaillées** : caractéristiques techniques, indice de performance, rareté, badges et effets visuels, ainsi que le pseudo du joueur qui en possède le plus d'exemplaires.
- **Boosters** : packs permettant d'enrichir sa collection.
- **Favoris et filtres** : recherche, tri et consultation des cartes possédées.
- **Amélioration des cartes** : les exemplaires en double débloquent des niveaux achetables en Apex Points (AP).
- **Marketplace** : achat et vente de cartes entre joueurs.
- **Contrats et succès** : objectifs à accomplir et récompenses à réclamer.
- **Profil et tableau de bord** : consultation du garage, de la progression et du solde AP.
- **Showroom joueur** : exposition publique facultative de trois véhicules choisis, statistiques de collection, boosters ouverts depuis l’activation du suivi, véhicules améliorés et succès réclamés.
- **Classement des joueurs** : classement de tous les joueurs par nombre de cartes ; les showrooms privés ne révèlent pas leurs voitures ni leurs statistiques détaillées.
- **Interface responsive** : navigation adaptée au smartphone et à l'ordinateur.
- **Langues et unités** : français, anglais, espagnol ; système métrique ou impérial.

### L'univers des cartes

Les cartes de véhicule peuvent présenter la puissance, le couple, la vitesse, le poids, la transmission et d'autres données selon le modèle. Les circuits disposent de leurs propres informations et visuels. Les cartes de pilotes présentent leur année, leur âge pour cette saison, leur pays, leurs titres mondiaux et leurs victoires aux trois épreuves de la Triple Couronne.

Les raretés se distinguent par leurs couleurs, matières et effets. Les cartes les plus prestigieuses et les améliorations de haut niveau peuvent bénéficier d'effets holographiques ou cristallins.

## Technologies

| Domaine | Technologies |
| --- | --- |
| Application web | Next.js 15, React 18, TypeScript |
| Interface | Tailwind CSS, Framer Motion, Lucide React |
| Backend et données | Supabase (PostgreSQL, Auth, Storage) |
| Tests et qualité | Jest, Testing Library, ESLint, Husky |
| Hébergement | Vercel |

## Installation locale

### Prérequis

- Node.js 18 ou version ultérieure ;
- npm 9 ou version ultérieure ;
- un projet Supabase configuré pour l'application.

### Démarrage

```bash
git clone https://github.com/iBob78/Apex-collector.git
cd Apex-collector
npm ci
cp .env.example .env.local
```

Renseignez au minimum les variables suivantes dans `.env.local` :

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=assets
```

Les autres paramètres disponibles sont décrits dans [`.env.example`](.env.example). Ne publiez pas vos secrets ou votre fichier `.env.local`.

La base de données et le stockage Supabase doivent également être préparés. Les scripts SQL sont disponibles dans [`supabase/migrations/`](supabase/migrations/) ; leur application dépend de l'état de votre base.

Lancez ensuite le serveur de développement :

```bash
npm run dev
```

L'application est accessible sur **http://localhost:3000**.

Pour les étapes de configuration détaillées, consultez le [guide d'installation](docs/SETUP.md).

## Commandes utiles

| Commande | Description |
| --- | --- |
| `npm run dev` | Démarrer le serveur de développement |
| `npm run build` | Compiler l'application |
| `npm run start` | Démarrer la version compilée |
| `npm run lint` | Exécuter les vérifications ESLint |
| `npm test` | Lancer les tests Jest |
| `npm run test:coverage` | Générer le rapport de couverture |

## Structure du projet

```text
src/
├── app/          # Pages et routes Next.js
├── components/   # Composants d'interface et cartes
├── contexts/     # Préférences utilisateur
└── lib/          # Logique du jeu, utilitaires et actions
supabase/
└── migrations/   # Scripts SQL de la base de données
public/           # Ressources statiques
docs/             # Documentation complémentaire
```

### Documentation

- [Installation et configuration](docs/SETUP.md)
- [Organisation des images dans Supabase Storage](SUPABASE_STORAGE_STRUCTURE.md)
- [Migrations de la base de données](supabase/migrations/)

## Contribuer

Les contributions et les retours sont les bienvenus. Pour proposer une modification, créez une branche dédiée, effectuez vos changements et ouvrez une **pull request** décrivant le problème ou l'amélioration.

Avant de proposer du code, vérifiez si possible la compilation et les tests avec `npm run build` et `npm test`.

## Licence

Projet distribué sous licence **MIT**. Voir [LICENSE.MD](LICENSE.MD).

## Auteur

Créé par **[@iBob78](https://github.com/iBob78)**, passionné d'automobile et de jeux de collection.
