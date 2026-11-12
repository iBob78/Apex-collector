# Apex Battle — moteur V1 (PR 1)

## Périmètre de la PR

Cette première étape introduit **uniquement un moteur TypeScript pur et ses tests Jest**. Elle ne crée aucune page, aucune table Supabase et ne modifie ni AC, ni collection, ni showroom, ni booster. Le mode n'est pas encore jouable depuis l'interface.

## Règles retenues

- **10 voitures contre 10**, dans un ordre fixé avant le début ; 10 manches.
- Chaque joueur possède ses cartes et l'adversaire ne voit pas ses cartes à venir. Le contrôle de possession et la confidentialité sont du ressort de la future couche serveur, **pas du moteur**.
- Le premier joueur est déterminé par le serveur. Le choix de caractéristique **alterne à chaque manche**, même si le joueur précédent a gagné.
- Six caractéristiques : puissance (plus = mieux), couple (plus), vitesse maximale (plus), 0–100 (moins), masse (moins), IP (plus).
- **Maximum deux choix d'une même caractéristique par joueur et par bataille**, les compteurs étant indépendants.
- Victoire de manche = 1 point ; égalité parfaite de valeur = 0,5 point chacun ; défaite = 0 point. Plus grand total après dix manches gagne ; égalité finale = match nul.
- Les cartes de variantes visuelles ne constituent pas des modèles supplémentaires. `variant_of_card_id ?? card_id` identifie le modèle source (sans confondre de véritables générations différentes).
- Pas de bonus lié à la rareté, au niveau d'amélioration ou au nombre de doublons. Aucune carte consommée.

## Compatibilité avec les fiches existantes

Le moteur prend les six valeurs depuis `cards` et **ne stocke pas de grip**. Il accepte les chaînes décimales françaises (virgules) et normalise les masses stockées en tonnes ou historiquement en kilogrammes. Les valeurs ambiguës ou manquantes bloquent la sélection ; le véhicule ne reçoit pas de statistique par défaut.

L'IP passe par `calculateVehicleIP` dans `src/lib/vehicleStats.ts`, avec un poids normalisé. Cela conserve la formule de la collection.

Un véhicule dont la vitesse maximale est inférieure à 100 km/h n'est pas admissible avec le critère 0–100. Ce choix V1 pourra évoluer dans un mode thématique ultérieur.

## API et fichiers

| Fichier | Responsabilité |
|---|---|
| `src/lib/battle/engine.ts` | Validation des dix cartes, instantanés, tours alternés, comparaison, résultats et score |
| `src/lib/battle/__tests__/engine.test.ts` | Tests Jest des unités, égalités, limites, duplications, résultats et fins de partie |

Fonctions exportées : `normalizeBattleVehicle`, `validateBattleDeck`, `createBattleMatch`, `getNextBattleChooser`, `getAvailableBattleStats`, `playBattleRound`, `getBattleScore`.

## ATTENTION — confidentialité multijoueur

`BattleMatchState` **contient les vingt cartes et leurs statistiques**. Ne jamais retourner cet objet brut à un navigateur tant que les cartes adverses ne sont pas dévoilées. La PR multijoueur devra :

1. Faire choisir les `card_id` puis vérifier côté serveur l'identité du joueur, les possessions dans `user_cards`, `cards.is_active`, le nombre de cartes et les variantes.
2. Sauvegarder côté serveur l'ordre et les caractéristiques figées **des deux** decks, inaccessibles directement par RLS à l'adversaire.
3. Enregistrer atomiquement chaque choix de stat après vérification de `auth.uid()`, du bon tour et du plafond de deux choix.
4. Fournir au client une **vue filtrée** : cartes du propriétaire, uniquement la carte adverse déjà dévoilée et les résultats des manches terminées.
5. Contrôler la concurrence et la répétition des requêtes avec une version de match / un verrou serveur, afin qu'un tour ne puisse pas être joué deux fois.
6. Garder la monnaie AC complètement hors du moteur ; décider d'éventuelles récompenses via des transactions idempotentes après validation de l'équilibre économique.

## Prochaines PR, sous validation

- **PR 2** : interface de sélection, tutoriel et entraînement (fixtures locales / adversaire logiciel).
- **PR 3** : invitations, decks secrets, actions serveur, Supabase RLS et tours asynchrones.
- **PR 4** : palmarès, showroom et récompenses éventuelles, avec garde-fous anti-farming.

## Vérification locale

```bash
npm test -- --runInBand src/lib/battle/__tests__/engine.test.ts
npx tsc --noEmit
```

Ne pas déployer ni appliquer de migration sans accord explicite.
