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

## Les écrans d'App Store Connect (RS-7, 14.10 : « ultra important ») — quoi répondre

*Apple peut vérifier : ne cocher que ce qui marche VRAIMENT sur l'iPhone. Les règles citées sont à relire dans les App Review
Guidelines à jour avant de soumettre.*

### Accessibilité (« Ajouter la prise en charge sur iPhone »)

| Fonction | Déclarer | Pourquoi / ce qui manque |
|---|---|---|
| Interface sombre | ✅ | l'app est sombre de base (`color-scheme: dark`) |
| Différencier sans couleur seule | ✅ | les xerkions : la FORME dit le type, le glyphe la catégorie ; les états sont écrits (endormi, verrouillé) |
| Animations réduites | ✅ (0.64) | « Réduire les animations » d'iOS = le mode Calme (`src/app/prefs.js`) : plus de transitions de geste, thème vivant coupé |
| Sous-titres | ✅ si la vidéo compte | le lecteur natif (AVPlayer) affiche les pistes de sous-titres (`sousTitres`, `src/natif/lecteur-natif.js`) |
| Contraste suffisant | ⚠ | ⚙ › Apparence › Contraste « fort » existe ; vérifier 4,5:1 sur les gris (`--muted`) avant de cocher |
| VoiceOver | ❌ pas encore | la fractale, les bords, le cube sont des gestes sans équivalent ; à faire : actions personnalisées (le rotor) et un mode liste |
| Police plus grande | ❌ pas encore | les tailles sont en px ; `@capacitor/text-zoom` suivrait la taille de texte d'iOS (un plugin : à ajouter avec un build) |
| Contrôle vocal | ❌ non testé | il faut un nom (aria-label) à chaque bouton |
| Descriptions audio | — | pas de contenu vidéo propre |

### Confidentialité de l'app

- **URL de la politique** : le texte est `docs/CONFIDENTIALITE.md`. Il faut une adresse qui ne bouge pas : `https://labo.j0bot.ch/confidentialite`
  (côté labo). En attendant, tant que le dépôt est public : `https://github.com/J0bot/ploxi0n/blob/main/docs/CONFIDENTIALITE.md`
  (une fois fusionné dans `main`).
- **« Démarrer »** (le questionnaire) : les mêmes réponses que `ios/App/App/PrivacyInfo.xcprivacy` — identifiant, e-mail (le compte),
  santé (seulement si « envoyer à mon boxion » est activé), contenu de l'utilisateur ; liés au compte ; fonctionnement de l'app ; aucun pistage.

### Game Center : le classement « Xeroctions » (ID 001)

- Temps écoulé au centième, **croissant**, meilleur score : *le temps pour boucler une xeroction* (plus court = mieux).
- Côté app, l'appel existe : `jOSNatif.jeu.score('001', centiemes)` (PloxiApple.gameCenterScore) ; à brancher quand la session
  « xeroction » existe (Compte › sessions, demandé le 13.10).
- **Langue du classement** (obligatoire) : français, nom affiché « Xeroctions » (un néologisme : il ne se traduit pas).
- Activités, défis : plus tard, par un lien profond (`ploxi0n://xeroction?…`).

### Achats intégrés et abonnements : la Milky Way Foundation (milkywayhub.org)

Les idées de RS-7 (payer l'électricité de quelqu'un, financer des missions, des bières par drone, récupérer des colis, des missions de
minage d'astéroïdes, un mandat pour un poste ; un abonnement pour soutenir le projet ou louer du compute) tombent dans trois cases :

| Ce qu'on vend | Comment Apple l'exige |
|---|---|
| du **numérique utilisé dans l'app** : le compute du nexus « de qualité, h24 », un abonnement de soutien qui débloque quelque chose | achat intégré / abonnement (règle 3.1.1) ; un groupe d'abonnements « nexus » |
| des **biens ou services du monde réel** : l'électricité, une bière livrée, des colis, une mission physique | JAMAIS d'achat intégré : Apple Pay ou un autre paiement (règle 3.1.3(e)) |
| un **don** à la fondation | pas en achat intégré ; dans l'app seulement si la fondation est une association à but non lucratif approuvée par Apple (avec Apple Pay), sinon hors de l'app : Safari vers milkywayhub.org (règles 3.2.1(vi), 3.2.2(iv)) |

La moitié du boxion pour le xerboxion, l'autre pour le nexus (RS-7) : l'abonnement paie le compute garanti, le reste est le compute
gratuit du nexus. **Notifications du serveur App Store** et **secret partagé** : seulement quand les achats intégrés existent (une route
du labo les reçoit, par ex. `https://labo.j0bot.ch/api/app/appstore`).

### Chiffrement, réglementations

- `ITSAppUsesNonExemptEncryption = false` est déjà dans `Info.plist` : l'app n'utilise que le chiffrement d'iOS (HTTPS, trousseau, Face ID).
  ⚠ Un ploxion du labo qui embarque son propre chiffrement (jOSGpg : OpenPGP en JS) change la réponse : en parler avant de soumettre.
- **Législation sur les services numériques (DSA)** : « pas un commerçant » tant que rien n'est vendu (sinon adresse et téléphone publics).
- **Dispositifs médicaux** : la Santé de ploxi0n affiche les données d'Apple Santé (bien-être), ne diagnostique rien : « pas un dispositif
  médical réglementé ».

### Informations de vérification : « leur xer à eux » (RS-7 : « ce compte-là, ça va être une pépite »)

Un bion pour Apple (jamais celui de RS-7), et SON xer préparé : quelques ploxions (marketplace, tsoins, santé, réglages, un lecteur), le
tuto au premier lancement, les nouveautés jouables (▶). Les notes de revue disent : « ◎ en haut à gauche de l'écran montre tous les
gestes, chacun avec sa démo » ; et où supprimer le compte. C'est la même mécanique que « la session de test qui part de zéro » (Compte ›
sessions) : un xer qu'on prépare et qu'on rejoue.

### Mise en vedette (le pitch, quand ce sera prêt)

« ploxi0n, un OS dans ton téléphone : un seul geste pour toutes tes apps (la fractale, le cube), des ploxions libres qui partagent une
même bibliothèque, le nexus. » Et la demande de RS-7 : qu'Apple soutienne l'open source sur iPhone (une bibliothèque commune entre
les apps du nexus).
