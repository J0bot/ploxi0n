# Les missions admin (ce que seul RS-7 peut faire)

*09.11, depuis ploxi0n 0.99.39. Pour l'agent du xerboxion : à ajouter à la feuille de route et au ploxion « missions admin ». Chaque mission :
ce qu'il faut faire, où, et ce qu'elle débloque. Aucun secret ici : les clés et jetons restent chez RS-7 (secrets GitHub, Keychain, serveur).*

## A. Apple (iPhone)

- **A1 · Build avec `ble`** — GitHub › Actions › iOS TestFlight › Run workflow › cocher `ble`. Débloque : Proche ↔ le Pi / les PC (`xb proche`) ;
  sans elle l'iPhone ne parle que Multipeer (Apple seulement). Il faut au moins la 0.99.37 (la carte du maillage, 255 sauts).
- **A2 · CarPlay** — developer.apple.com/contact/carplay, catégorie **Audio** ; une fois accordé : Identifiers › `ch.j0bot.ploxi0n` › cocher
  CarPlay ; build avec `regenerer_profil` + `carplay`. Débloque : les potes et les ambiances dans la voiture (docs/CARPLAY.md).
- **A3 · La clé APNs** — Certificates, IDs & Profiles › Keys › + › Apple Push Notifications service → télécharger `AuthKey_XXXX.p8`, noter le Key ID
  et le Team ID. Premier test sans labo : `node tools/push/envoyer-push.mjs --cle AuthKey_XXXX.p8 --kid … --team … --jeton <copié dans ⚙ ›
  Notifications>`. La clé ne va jamais dans git, une URL ou un agent. Débloque : les notifications app fermée (docs/PUSH.md).
- **A4 · Les widgets** — Identifiers › `ch.j0bot.ploxi0n.widgets` › App Groups › `group.ch.j0bot.ploxi0n` (le même que l'app) ; build avec `widgets`.
- **A5 · La soumission App Store** (docs/APP-STORE.md) :
  - publier `docs/CONFIDENTIALITE.md` sur https://xerboxion.org/confidentialite (exigée aussi par Health Connect sur Android) ;
  - vérifier que « Supprimer mon compte » (⚙ › Compte, qui ouvre la page du compte) va vraiment jusqu'au bout (règle 5.1.1(v)) ;
  - créer le compte de démo « bion » pour Apple (jamais le tien) → `fastlane/metadata/review_information/` ;
  - les captures iPhone 6,9" (1320 × 2868) et iPad 13" (2064 × 2752) ;
  - le questionnaire App Privacy d'App Store Connect.

## B. Android

- **B1 · Le push Android** — un projet Firebase (console.firebase.google.com), une app Android `ch.j0bot.ploxi0n` → `google-services.json`,
  à poser en secret GitHub (`GOOGLE_SERVICES_JSON`, en base64) ; l'agent de ploxi0n le branche dans la CI et rallume le push sur Android.
  Côté labo : l'envoi FCM à côté d'APNs.
- **B2 · Le Play Store** (plus tard) — un compte développeur Google Play ; une clé de signature (keystore) → secrets `ANDROID_KEYSTORE` (base64),
  `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` ; l'agent ajoute l'AAB signé à la CI.
- **B3 · Le mode kiosque** (décision) — un téléphone qui n'a QUE ploxion, sans sortie (Device Owner, posé une fois par `adb`). Oui / non.

## C. GitHub

- **C1 · Fusionner la branche dans `main`** — `glob/youthful-noether-v9xlop` (0.99.24 → 0.99.39, tout ce qui précède). Débloque aussi le bouton
  « Run workflow » d'Android APK (GitHub ne le montre que pour un workflow présent sur `main`).

## D. Le labo (labo.j0bot.ch) — rien n'y est poussé sans ton accord

- **D1 · Le push** — `docs/labo-push/` (le service APNs, la route `/api/app/push`, la migration `appareils_push`, `php artisan push:test`) ; la clé
  `.p8` (A3) en variable d'environnement du serveur.
- **D2 · Le benchmark : le droit au silence** — `docs/labo-push/benchmark-silence.md` (5 lignes dans `/px/benchmark/app.js` : les mesures et les
  workers s'arrêtent quand on quitte le ploxion).
- **D3 · L'agent xb contre le vrai labo** — vérifier que `/px/miroir/enroler` accepte un jeton au seul droit `atelier`, et que
  `/xb/appareil/battement` accepte ce jeton ; mieux : le secret du sondage d'appairage en en-tête plutôt que dans l'URL (labo + CLI xb + app).
- **D4 · Les icônes et l'accueil** — `/api/app/icones` (recevoir les icônes proposées par l'app), `/api/app/accueil` (respecter `verrou`/`url`),
  `type` dans le registre, `frame-ancestors capacitor:` (le wiki dans l'app). (docs/CONTEXTE.md)
- **D5 · Le HUD du labo dans l'app** — un ploxion du labo charge `jOSHud` et son calque reste sur l'app (masqué côté app en 0.99.39) ; côté labo :
  ne pas monter `#xhud-layer` quand le ploxion tourne dans ploxi0n (`host: 'ploxi0n'` dans le contexte de montage).

## E. boxion-rt (le xion)

- **E1 · Le jeton du bus** — `XION_BUS_TOKEN` (audit sécu, finding #1) : le poser sur le daemon et dans les clients ; sinon `/emit` reste ouvert.
- **E2 · `xion.j0bot.ch` répond 401 sur `/px`** (vu le 07.11) : voulu ? Les ploxions servis par le xion ne s'ouvrent plus sans authentification.

## F. Les essais sur les vrais appareils (personne d'autre ne peut)

- **F1** Proche avec le Pi : la carte du maillage (◈ autour), « maillé », les ↝ relayés.
- **F2** La carte de pote : deux téléphones, ▣ carte, chacun scanne l'autre, puis « écrire » (le privé chiffré, avant même d'être reliés).
- **F3** Les coursiers : A écrit à C absent, B passe de l'un à l'autre (le message arrive chez C, « ⚠ pas remis » sinon).
- **F4** Le xer Spotify ; l'Appareil xb (l'appairage, puis `xb ouvrir` depuis le terminal du labo).
- **F5** L'APK Android : l'installer, « en faire l'écran d'accueil », le ploxion Applis, le bouton retour.
- **F6** Le banc des nouveaux bions (« ▶ les nouveaux bions, tout ») et le benchmark : envoyer le journal.

## G. Les décisions qui t'attendent

- **G1** Les koins : le wormion et le portion (quelles vues), la case en haut à droite, les koins du haut, le mot en miroir (docs/KOINS.md).
- **G2** La peau (les couleurs tirées de tes SVG) ; la vue des xers en carrés ou la map à la place.
- **G3** La soirée (docs/SOIREE.md, chez l'agent du nexus) : où vivent les cartes de pote des amis (le profil j0bot ? le boxion du compte ?) et
  qui les voit.
- **G4** Le reste de bitchat : Noise (le secret persistant des sessions directes) ? le TTL qui baisse quand le maillage est dense ?
- **G5** Le lot de ploxions : Zotero (une clé API), LocalSend (l'autorisation multicast d'Apple), AppFlowy (web).
