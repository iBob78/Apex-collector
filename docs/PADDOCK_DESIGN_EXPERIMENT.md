# APEX COLLECTOR — Night Drive / Collection-first UI (sandbox v4)

> Expérimentation graphique **sur la branche `feat/visual-overhaul-paddock-20261108` / PR #17 uniquement**. Ne pas fusionner dans `main` ni déployer en production sans validation explicite.

## Origine du changement

Après des essais « paddock premium », puis motorsport et « GT Endurance », l’utilisateur a fourni **trois captures de référence** d’interfaces de collection automobile. Elles sont des **références visuelles**, pas des données de jeu et ne doivent pas être utilisées comme images de fond : elles montrent principalement :

1. Un **garage en trois colonnes** (filtres à gauche, grille dense au centre, aperçu de carte à droite), sur un grand bandeau automobile panoramique.
2. Un **accueil automobile immersif**, avec accès illustrés à la collection, aux boosters et aux activités ; un tirage à plusieurs cartes éclairé selon la rareté.
3. Un langage **bleu nuit, verre fumé, contours électriques, marque APEX rouge/blanc et fonds automobiles au crépuscule**, sans abandonner la lisibilité ou les effets de collection.

La quatrième itération est désormais intitulée **« Night Drive / Collection-first »**. Elle remplace la présentation « GT Endurance » des surfaces expérimentales. Ce n'est pas une modification du système de raretés.

## Direction graphique et composants

- Palette de l'interface : fond bleu nuit `#070c18`, panneaux `#111a2b`, accents bleu `#59b9ff`, rouge `#ed344f`, violet `#8a66ff` ; texte ivoire et gris lavande. Les couleurs des **raretés** ne sont **pas** remplacées par cette palette.
- `src/app/globals.css` : classes `apex-paddock`, `paddock-*`, `collector-*`, `apx-*`, `race-*` rétrocompatibles pour tous les écrans de la PR. Les effets de rareté et les animations existantes sont conservés **en dehors** du bloc expérimental.
- Navigation `Sidebar.tsx` : logo APEX plus proche des références ; menu et accès admin existants, menu mobile bas, état actif lumineux bleu/violet. L'accès à l'administration reste contrôlé par les permissions existantes.
- Dashboard : bandeau automobile, vrai solde AP, accès illustrés à **boosters / collection / contrats**, statistiques réelles et progression réelle du garage. L'atelier admin n'est pas montré comme accessible à tous.
- Collection : bandeau panoramique + vraie jauge complétion ; filtres de catégories, raretés, recherche et favoris à gauche ; grille au centre ; **aperçu sélectionné à droite dès 1536 px**. L'aperçu ne peut montrer **que des cartes possédées** ; les flèches naviguent uniquement parmi ces cartes. La modale détaillée reste accessible au clic sur mobile/tablette et par un bouton sur grand écran. La grille mobile conserve **4 cartes par rangée**.
- Boutique : bandeau panoramique, solde AP réel, boosters quotidiens réels, packs illustrés et numérotés. La boutique mobile conserve **2 packs par rangée**.
- Ouverture de booster : scène lumineuse bleu/violet, dos de carte repensés ; la grille mobile conserve **3 cartes par rangée** ; la déchirure, le flip, le badge `NEW!`, l'absence de niveau sur un tirage et le halo de rareté sont préservés.
- Marketplace, profil, connexion, accueil public : contenus réorganisés et thème bleu nuit harmonisé ; achats, annonces, showroom privé/public et authentification inchangés.
- Les écrans secondaires restent stylés par les classes expérimentales communes. Aucune route, migration Supabase, permission ou dépendance npm nouvelle.

## Photographie / assets

- Le nouveau bandeau dashboard utilise une **photo Pexels gratuite d'Abdullah Alsaibaie**, « Black Toyota Supra at Sunset », photo #21404862 :
  https://www.pexels.com/photo/black-toyota-supra-at-sunset-21404862/
- Les photos Pexels préexistantes #14905468 et #14905469 sont encore utilisées comme ambiances de fond sur certaines pages :
  https://www.pexels.com/photo/car-on-the-racing-course-at-dusk-14905468/
  https://www.pexels.com/photo/racecar-parked-on-a-pit-stop-14905469/
- Les images d'accès `/showcase-boosters.png`, `/showcase-card.png`, `/showcase-missions.png` sont déjà présentes dans `public/`.
- Les photos externes sont chargées **uniquement comme fond CSS** avec couleur/gradient de secours. Si la politique d'hébergement impose des assets internes, les intégrer après validation des droits et licences ; ne jamais prétendre qu'une voiture décorative est possédée par un joueur.

## Tests manuels avant acceptation

1. Desktop large (1536/1920 px) : valider le garage **filtres / cartes / aperçu**, clic sur une carte, détails, favoris, navigation gauche/droite parmi **les seules cartes possédées**. Vérifier les infos censurées pour les cartes inconnues.
2. Desktop médian (1024/1280 px), tablette et téléphone (360/390/430 px) : aucun débordement, sidebar à `md`, menu mobile, **4 cartes/ligne** dans la collection, modale détails sur mobile.
3. Booster boutique : **2 packs/ligne sur téléphone**, solde AP, achats et booster quotidien. Reveal : **3 cartes/ligne sur téléphone**, badge `NEW!`, halo de la bonne rareté, pas de niveaux, déchirure et retour.
4. Catalogue complet : pagination par chargement progressif toujours fonctionnelle après 2 000 cartes. Recherche, rareté, catégories, tri (notamment marque), mise à niveau, favoris et suppression de l'indicateur `NEW!` après consultation.
5. Autres écrans : marketplace (achat/vente), profil/showroom (privé/public), connexion, classement, réglages, contrats/succès, ateliers admin et multilingue FR/EN/ES.
6. Respect du mode `prefers-reduced-motion`, focus clavier, contraste des textes et images externes.
7. Exécuter CI/lint/tests/build sur la **PR #17** et contrôler le lien de Preview Vercel avant de demander un avis.

**Statut :** prototype v4 en revue. Aucun déploiement de production ni fusion `main` autorisé.
