# Bêta Apex Collector : inscription et Apex Crédits (AC)

## Déploiement (hors GitHub)
1. Après validation de la PR, appliquer la migration \`041_signup_profile_preferences_and_ac.sql\` **uniquement** sur la base Supabase choisie. Elle conserve le solde de tout profil existant et le nom technique \`ap\`.
2. Dans Supabase **Authentication > URL Configuration**, remplacer **Site URL** localhost par la véritable URL HTTPS de l'application. Ajouter \`https://votre-domaine.tld/auth/callback\` aux **Redirect URLs** autorisées. Autoriser aussi les URL de preview testées.
3. Dans **Authentication > Email Templates > Confirm signup**, personnaliser le modèle pour Apex Collector. Le modèle proposé est \`supabase/email-templates/confirmation.html\` et doit être copié dans Supabase. Configurer le SMTP selon les besoins de la bêta.
4. Déployer le code sur le même domaine autorisé, puis créer un compte test.

## Comportement
- Le formulaire suggère la partie avant @ de l'e-mail, mais le joueur choisit un pseudo (3-24 caractères : lettres ASCII, chiffres, underscore, tiret).
- Le profil enregistre le pseudo, l'e-mail, la langue (fr/en/es) et les unités (metric/imperial).
- Un index unique insensible à la casse protège les pseudos ; un conflit empêche l'inscription.
- Nouveau profil : 20 000 AC. Les soldes existants ne changent pas. Les utilisateurs Auth sans profil sont réparés.
- \`ap\` et \`reward_ap\` restent les noms techniques, pour ne pas casser boosters, marché et achats.
- Tant que le joueur n'a pas de session, l'interface lui demande de valider son e-mail au lieu d'ouvrir le tableau de bord.
- L'envoi des e-mails, la Site URL et la liste des Redirect URLs sont des paramètres hébergés Supabase qui ne sont pas modifiés par une PR.

## Recette
- \`npm ci\`, \`npm test -- --runInBand\`, \`npm run build\`.
- Test : choisir un pseudo, espagnol, impérial, recevoir et valider le mail puis ouvrir le tableau de bord.
- Vérifier en base : e-mail non NULL, pseudo choisi, bonnes préférences, 20 000 AC.
- Essayer un pseudo identique à un compte existant avec une casse différente : la création doit être refusée.
- Vérifier qu'un compte existant conserve son solde. Tester achat de booster, marché et niveaux de carte.

## Cadeaux de bienvenue (migration 042)

- Après 041, appliquer `042_player_welcome_gift_boosters.sql` sur la base choisie avec accord explicite.
- À l'insertion d'un nouveau profil, le trigger ajoute un **booster de bienvenue** (`gift_key='welcome_2026'`) contenant **10 cartes** avec la distribution du pack commun (dont le circuit garanti). Les boosters standards restent à 6 ou 8 cartes.
- Le cadeau reste dans la rubrique "Boosters offerts à ouvrir" jusqu'à ouverture. Unicité `(user_id,gift_key)` et RPC propriétaire `consume_player_gift_booster` évitent les cadeaux répétés.
- Pas de cadeau rétroactif : un compte déjà créé avant l'application de 042, comme les comptes de test, n'en recevra pas automatiquement. Un octroi spécifique doit être validé séparément.
- Le dashboard annonce les boosters quotidiens et cadeaux en attente via une modale consultable une seule fois par cadeau et par navigateur ; fermer la modale ne consomme pas le booster.
- Tests après déploiement : première inscription et premier accès à /dashboard, présence d'un quotidien et d'un cadeau distincts, ouverture 10 cartes sans débit AC, plusieurs rafraîchissements, seconde connexion, absence de doublons, essais de consommation d'un cadeau appartenant à un autre joueur.
- Comme les boosters quotidiens actuels, l'ouverture consomme le droit avant d'enregistrer les cartes dans les possessions. La sauvegarde n'est pas une seule transaction SQL : si le réseau échoue entre ces opérations, une intervention de support peut être nécessaire. Ne pas prétendre à une atomicité absente.


## Gestion des comptes — migration 043 (à valider)
- Admin > Gestion des joueurs : recherche par pseudo/e-mail et suppression d'un autre compte, administrateurs inclus. Protection du propriétaire du site. Confirmation par case et texte SUPPRIMER <pseudo exact>.
- Réglages > Zone de danger : chacun peut supprimer son propre compte en confirmant avec son mot de passe, une case de compréhension et la phrase requise.
- Le serveur et les fonctions SQL recontrôlent les droits et les identités. Tout échec entraîne un rollback de la transaction.
- Nettoyage : compte Auth et profil, cartes possédées, circuits et pilotes, historique de découverte, favoris, boosts quotidiens et cadeaux, progression/contrats, anciennes lignes market/users, rôle admin et sessions. Catalogues communs préservés.
- Si l'utilisateur détient un objet Storage, aucun effacement ne démarre avant nettoyage des fichiers via l'API Storage. Les sauvegardes Supabase et JWT existants sont soumis à leur propre rétention/expiration.
- Vérifier avant déploiement : accès propriétaire/autrui, refus délégué, mot de passe erroné, texte incorrect, protection propriétaire, suppression admin délégué, intégrité des catalogues, blocage Storage, disparition des lignes personnelles.
