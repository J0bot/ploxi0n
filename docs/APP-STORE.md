# Publier ploxi0n sur l'App Store (pour plus tard)

RS-7 (12.10.2026), capture d'App Store Connect « Unable to Add for Review » — ce qu'Apple exige avant la revue :

| Exigé | Où | Proposition |
|---|---|---|
| Copyright | Informations sur l'app | « 2026 XERB0XI0N » (pas de nom de personne) |
| URL de politique de confidentialité | App Privacy | une page sur xerboxion.org (`/confidentialite`) : rien ne quitte le téléphone sans le mode connecté ; Santé jamais envoyée |
| Droits sur le contenu | Informations sur l'app | « ne contient pas de contenu tiers » ou le déclarer (YouTube, archive.org passent par leurs sites) |
| Catégorie principale | Informations sur l'app | Productivité (secondaire : Utilitaires) |
| Capture iPad 13 pouces | la version | 2064 × 2752 (iPad Pro 13") — à faire sur l'iPad de RS-7 |
| Mots-clés (français) | la version | ploxion, xerboxion, tsoin, apps, widgets, raccourcis, carnet, santé, vocal |
| URL d'assistance (français) | la version | https://xerboxion.org/px/bother (bother me) |
| Nom d'utilisateur (contact / connexion de démo) | Informations de revue | un compte de démo **bion** créé pour Apple (jamais celui de RS-7) |

## Fait (0.47)

- **Les métadonnées** : `fastlane/metadata/` (nom, sous-titre, description, mots-clés, URLs, notes de version, copyright, catégories,
  notes de revue) ; la lane `metadonnees` les envoie sans binaire — GitHub › Actions › « TestFlight testeurs et infos » › lane
  `metadonnees` (Linux : quelques secondes, pas de minutes macOS).
- **Le manifeste de confidentialité** (`ios/App/App/PrivacyInfo.xcprivacy`, exigé depuis mai 2024) : UserDefaults (CA92.1, 1C8F.1),
  espace disque (E174.1, 85F4.1) ; aucun pistage ; données collectées : identifiant, e-mail, santé (opt-in), contenu — liées au
  compte, fonctionnement de l'app. Ajouté au build par la CI (`ajouter_confidentialite`). Les réponses « App Privacy » d'App Store
  Connect doivent dire la même chose.
- `UIRequiredDeviceCapabilities` : `arm64` (au lieu de `armv7`, 32 bits, hérité du gabarit).
- Le texte de la politique : `docs/CONFIDENTIALITE.md`.

## Reste à faire (avant « Soumettre pour la revue »)

1. **Publier `docs/CONFIDENTIALITE.md`** sur https://xerboxion.org/confidentialite (côté labo).
2. **La suppression du compte DANS l'app** (règle 5.1.1(v) : une app qui crée des comptes — Sign in with Apple crée un « bion » — doit
   permettre de le supprimer depuis l'app). Il faut une route labo (ex. `POST /app/compte/supprimer` avec le jeton) ; le bouton
   ⚙ › Compte › « supprimer mon compte » s'y branche en une ligne. **Bloquant pour la revue.**
3. Le compte de démo **bion** pour Apple (jamais celui de RS-7) → `fastlane/metadata/review_information/` (demo_user, demo_password).
4. Les captures : iPhone 6,9" (1320 × 2868) et iPad 13" (2064 × 2752) — depuis le téléphone et l'iPad de RS-7.
5. Le questionnaire App Privacy d'App Store Connect (le même contenu que le manifeste).
