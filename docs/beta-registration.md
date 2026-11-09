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
