# Passation — la session du 12–13.10.2026 (0.46 → 0.51)

*La sauvegarde du contexte demandée par RS-7 avant de fermer la conversation. À lire en premier dans la session suivante.*

## 1. Où en est tout

| Dépôt | Branche | État |
|---|---|---|
| **J0bot/ploxi0n** | `glob/youthful-noether-v9xlop` | 0.47 → 0.51 poussées, **pas fusionnées dans `main`**, pas encore construites. Dernier build TestFlight : **0.45**. |
| **J0bot/labo-cape** | `ploxi0n-l1` | `docs/BLE.md` (le contrat BLE), lot L1 marqué présent, tsoin 31, le correctif golden.json sous Windows. Pas fusionnée. |
| J0bot/ploxi0n-certificats | — | les certificats fastlane match (chiffrés ; `MATCH_PASSWORD` absent de la session). Lecture seule. |
| J0bot/my_website2 | `main`, `labo`, `labo-ploxmobile`… | le labo Laravel (xerboxion.org) **figé en juin** : le vrai labo n'est plus sur GitHub. |
| J0bot/boxion-rt | `main` (juillet) | `BIONS.md` (jOSplayer, jOScube, jOSsso…), `XERBOXION-PRIMER.md`, `book/themes/*.json` (le lexique : XERB0T, cubion…). |

**0.51 : le labo est lisible** sur `https://labo.j0bot.ch` (`/px/registry.json` : 593 ploxions ; `/px/<id>/app.js` ; `/px/bion-app/<jOSNom>.js` ;
un 404 y est une page HTML de 3,5 Mo). Une copie du vrai bion `jOSPlayer` est dans `tests/donnees/jOSPlayer.labo.js`. Pièges relevés
contre le vrai code : le bion lecteur du labo est **`jOSPlayer.play(url, opts)`** (pas `jOSplayer.open/embed`) ; **Spotify n'a pas d'app.js**
(code dans la page `/px/spotify`, comme wiki, notes, calendar : `bundleDeLaPage` dans `src/marketplace/depot.js`) ; aucun ploxion du labo
n'utilise `navigator.mediaSession` : le contrat commun des lecteurs est le bus **`jOSSound`** (register/list/subscribe).

**Le « zbeul » (RS-7, avant la 0.51)** : la session 0.46–0.50 n'avait pas accès aux ploxions. `xerboxion.org` était refusé par le proxy de l'environnement
(et WebFetch n'avait aucun DNS) ; RS-7 a élargi la politique réseau, elle vaut pour une NOUVELLE session. **Premier geste de la session
suivante** : `curl -sS -o /dev/null -w "%{http_code}" https://xerboxion.org/px/registry.json` — si 200 : lire la doc du labo, le code
des ploxions (Stremio, Spotify, le hub 🌸 Santé, xerkion-sante, jOSplayer/jOSPlayer, la route de connexion), puis lancer le faux iPhone
sur tous les ploxions publics (`tools/diagnostic-iphone.mjs` existe aussi, en jsdom).

## 2. Ce qui a été fait (par version)

- **0.47 — le natif partout.** Le piège du proxy (Raccourcis/Siri, widgets, Face ID, notifications, Santé ne marchaient JAMAIS sur
  iPhone) ; `src/natif/web-natif.js` (les API web standard des ploxions → le natif : vibrate, share, clipboard, geolocation,
  Notification, getBattery, SpeechRecognition, BarcodeDetector, devicemotion, orientation, wakeLock, Web Bluetooth, Web NFC,
  window.open) ; Santé connecté (opt-in, `jOSSante`, `docs/SANTE.md`) ; la mise en page cassée par le thème vivant ; les réglages en
  pages et sous-pages ; PrivacyInfo.xcprivacy, arm64, `fastlane/metadata`, `docs/CONFIDENTIALITE.md` ; le faux iPhone.
- **0.48 — à l'écoute et le cube.** `src/natif/maintenant.js` : le Spotify Web Playback SDK (et toute Media Session d'un iframe) →
  l'écran verrouillé (PloxiApple.lecture : MPNowPlayingInfoCenter + MPRemoteCommandCenter), **le mini-lecteur au-dessus du dock**
  (RS-7 : « magnifique »), widget À l'écoute ; `src/app/cube.js` + widget Cube (six valeurs des bions, ⟲) ; ⚙ › Widgets (le cube 3D
  qui suit le gyroscope dans l'app — un widget ne peut pas lire le gyroscope).
- **0.49 — le lecteur intégré et la liste de bions.** PloxiLecteur (AVPlayerViewController ; VLC en repli derrière `PLOXI0N_VLC`) ;
  `src/natif/lecteur-natif.js` (plugion jOSplayer, vidéo illisible → natif, muette → bulle, vlc:// infuse://, `ploxi0n://lire`,
  reprise ; `docs/LECTEUR.md` pour le bouton « ▶ ploxi0n » côté labo) ; `src/natif/fichiers-natif.js` (envoyer vers avec fichiers,
  aperçu QuickLook, zip/dezipper avec fflate, galerie + import dans Fichiers, sélecteur de fichiers, Plans, Mail, lampe) ; contrôles du
  Centre de contrôle (iOS 18) ; **Codemagic** (`codemagic.yaml`, `docs/TESTFLIGHT.md`) ; numéro de build = dernier TestFlight + 1.
- **0.50 — la blouse et les modes.** `src/cape/` : 🥼 labo-cape (BLE selon labo-cape `docs/BLE.md`, ou simulation avec la copie de
  cape-engine vérifiée contre la trace du Rust) ; `src/app/modes.js` : ◇ chill-tekk · ⬡ xerboxion (l'UI du labo dans l'accueil) ·
  🤖 xerbot (le monde physique : blouse, Bluetooth, HomeKit, lampe, NFC, Wi-Fi, bus `xerbot.cmd`).

- **0.51 — les mini docks.** `src/app/minidocks.js` (la pile au-dessus du dock, « ▤ +N », la page de tous, glisser = fermer, `jOSMiniDock`) ;
  le routeur (`miniDocks`, `etatVivants`, `fermerPloxion`, `reveiller`, `oublierEndormi` ; ⧉ = la page) ; musique, blouse, Santé, vidéo à
  reprendre, vocal, brouillon de tsoin. Stremio branché sur le vrai `jOSPlayer` ; Spotify installable et accroche robuste ; bions absents notés.
- **0.55 — les icônes du xerboxion, Face ID qui tient, labo.j0bot.ch.** `src/app/xerkion-icone.js` : l'icône d'un ploxion reprend le
  dessin des hubs xerkion du labo (jOSXerkionHub : GPAL, polygone, rayons, nœuds, cœur wormion/portion/kion, disque) ; la FORME = le type
  (`typeDe` : registre `type`, sinon l'id ; ploxion = losange, xerkion = N côtés = ses koins lus dans `/px/xerkions.json`, xer, cubion,
  kion, koin, wormion, spherion, portion, bion, boxion), la COULEUR et le glyphe de secours = la catégorie (`CATEGORIES`). Tuiles, dock,
  mini docks, clips de l'écran d'accueil (PNG par canvas). L'atelier (`ecran-accueil.js` : nom, palette, cœur, glyphe, photo ; menu
  « son icône ») et `proposer()` → `POST /api/app/icones` (file `reglages/icones-proposees` tant que le labo ne la reçoit pas). Face ID :
  `deverrouilles` par séance dans le routeur, `reverrouiller()` sur App `pause`, `redemander()` sur `resume` ; un ploxion verrouillé mis
  sur l'écran d'accueil part en mode `app` avec `verrou: true` et `url: ploxi0n://px/<id>`. `SOURCE` = https://labo.j0bot.ch partout
  (Associated Domains ajoutés). Planches : `node tools/faux-iphone/planche-icones.mjs build/icones <registry.json> <xerkions.json>`.
  **Côté labo (à faire par RS-7)** : `/api/app/icones` (recevoir, relire, poser `xerkion` dans le registre) ; `/api/app/accueil` doit
  respecter `verrou`/`url` (le clip ouvre `ploxi0n://px/<id>`, jamais `/px/<id>` en ligne) ; `type` dans le registre pour ce que l'id ne
  dit pas ; `frame-ancestors capacitor:` (le wiki dans l'app).
- **0.56 — vivants et lisibilité.** `maxVivants` : 12 par défaut, 0 = ∞ (RS-7 : « le max 8 ploxions ça devient chiant ») ; le disque
  et le glyphe des icônes agrandis (RS-7 : « ultra petit, illisible ») ; `styleIcones` = `xerboxion` | `glyphe` (le glyphe seul, 64 %),
  global (⚙ › Apparence) et par app (perso `style`, l'atelier).
- **0.57 — le glyphe seul garde la forme.** `formePleine()` (src/app/xerkion-icone.js) : la forme du type, pleine (quelques creux pour la
  reconnaître : face claire du cube, koins du kion, couvercle du boxion), le glyphe découpé en sombre (RS-7 : « pas juste des ronds »).
- **0.58 — couleurs douces.** `GPAL` adoucie (mêmes teintes que le labo, saturation ≈ 0.34, lumière ≈ 0.62 ; `f` = l'aplat des formes
  pleines, plus sombre) : RS-7 « moins flashy, là ça explose les yeux ».
- **0.59 — la fractale des ploxions.** `src/app/fractale.js` : `glisser()` (le passage d'app en app : sortant en biais, entrant en 3D,
  la trace) et `creerFractale()` branché sur les deux bords du routeur (`appui`/`deplace`/`relache`/`annule`) : tenir 0,3 s = APERÇU
  (tirer > 30 % = y aller), 0,9 s = FRACTALE (symétrique, échelle 0,56 × 0,62^|d| ; lâchée sans bouger = ouverte, `px-fx-ouverte`),
  1,9 s = SLIDER (0,34 × 0,8^|d|, défile à 7 cartes/s selon le doigt). Les vivants sont leurs hôtes transformés sur place (jamais
  déplacés : pas de rechargement d'iframe) ; accueil, endormis, verrouillés = cartes à icône (Face ID : jamais leur contenu). Pression :
  `PointerEvent.pressure` (3D Touch seulement). `allerA()` dans le routeur. ⚙ › Navigation : « Tenir un bord ». Faux iPhone :
  `parcours-fractale.mjs` (les captures prennent ~0,7 s : photographier des états qui tiennent).
- **0.60 — le xer devient un cube.** RS-7 (une capture du sélecteur d'iOS : « ça, mais en mille fois mieux » ; ses croquis : le curseur de
  réel, le filtrage de photons, kion 3D / 4D, « le xer devient un cube », le gyroscope, freefall, « les tests du trackpad haptique »).
  `src/app/fractale.js` : DISPO (fractale = jeu de cartes s0 0,66 ; slider = tranches, rotY jusqu'à 76°) ; `.px-fx-tete` (icône + nom
  au-dessus) ; défilement continu + élan, `jeter()` (vers le haut = `fermer(id)` du routeur) ; `.px-fx-curseur` (le curseur de réel) ;
  le CUBE (arrêté 1,2 s dans le slider : faces à 90°, `penche` = la face du dessus `.px-fx-dessus` = les bions, depuis l'index des
  installés qui porte maintenant `bions`) ; le gyroscope RELATIF à la tenue du début, zone morte 0,15 ; `freefall()` (geste des bords
  « freefall », badge `.px-freefall`). `src/banc/trackpad.js` : le ploxion interne « Trackpad haptique » (creerTexture testable,
  plafond 60/s, aller-retour natif mesuré). Faux iPhone : `parcours-fractale.mjs` calme le gyroscope simulé (il oscille ±0,2).
  **Côté labo, plus tard** : RS-7 veut que chaque ploxion mis sur l'écran d'accueil « seul » (web) ait aussi ces bords et la fractale :
  il faudra un bion du labo (jOSFractale) qui compose `fractale.js` avec le gestionnaire de fenêtres du labo.
- **0.60.1 — les bords ne sélectionnent plus.** RS-7 sur l'iPhone (0.59) : « quand on tire sur les bords, ça sélectionne le texte et ça
  bug de malade ». Le touchstart ET le touchmove des bords sont refusés à iOS (preventDefault, passive: false), la sélection en cours
  effacée, `px-tire-bord` coupe la sélection dans toute l'app tant qu'un doigt est sur un bord ; pareil sur la fractale (`px-fx`).
  CI : un commit « [build] » sur une branche glob/** lance le build TestFlight (« [widgets] » : avec) — la session ne peut ni pousser
  de tag ni lancer un workflow à la main (403).

## 3. Ce qui reste, par ordre

0. **RS-7 (13.10, fin de session)** : « je veux que l'app soit un peu comme niri » (la bande de colonnes défilantes ; nouveau à droite ;
   vue d'ensemble) ; et un LOT de ploxions : Zotero, Foliate, un browser à la Helium, Blanket (ambiances), vaults Obsidian, LocalSend,
   AppFlowy, Manim (maths), un mpv, un btop, « et intégrer le xerminal dessus ». Au labo existent déjà `web` (Browser), `xerminal`, `ssh`,
   `math`, `player`, `onenote`, `viewer`, `code` : composer d'abord. **RS-7 n'a plus beaucoup de budget de tokens : travailler sobre,
   sans workflow ni sous-agents, une chose livrable à la fois.**
1. ~~Les MINI DOCKS~~ (fait en 0.51 ; le détail ci-dessous reste la spec) (RS-7, 13.10 : « c'est magnifique le mini dock, j'adore ; il faut que tout puisse être minimisé en mini dock, et
   avoir une page de tous les mini docks »). Le mini-lecteur de `maintenant.js` (`.px-maintenant`) devient UN cas d'un système général :
   - chaque ploxion minimisé (▁, les vivants et les endormis du routeur) devient une pastille au-dessus du dock : icône/pochette, nom,
     une ligne vivante, ses actions ; toucher = le rouvrir ;
   - une API pour les ploxions et les bions : `jOSMiniDock.publier({ id, titre, sous, image, actions: [{ id, icone }] })`, `retirer(id)`,
     les actions reviennent au ploxion (jOSPorts) ; les internes en donnent un riche (labo-cape : température · consigne, ⏻ ; Santé : pas ;
     le lecteur, la musique : ⏮ ⏯ ⏭) ;
   - au-dessus du dock : deux pastilles au plus, puis « ▤ N » ; **la page de tous les mini docks** (une feuille, ou un ploxion interne)
     avec leurs actions et ✕ pour fermer ; la section « en arrière-plan » de l'accueil (`arriere()` dans le routeur) se fond dedans.
1b. **13.10 midi : le build Codemagic marche** (RS-7 a reçu un TestFlight). Retours : « ça lag de malade » → 0.53 snappy ; « le wiki ne marche toujours pas » → 0.53 cadres du labo ; **côté labo : ajouter `capacitor:` à `frame-ancestors`** (le wiki, `/home`, comme `/app/yt`).
2. **Le build Codemagic (13.10, 3 essais)** : la clé API marche (build 55 préparé) ; la signature gérée par Apple ne tient pas sur CI
   (pas d'appareil, puis « Revoke certificate » : la clé privée du certificat de dev reste sur la machine jetable) ; avec match, le jeton
   `MATCH_PAT` clone bien ploxi0n-certificats mais **`MATCH_PASSWORD` est faux** (« Couldn't decrypt the repo »). À faire par RS-7, une fois :
   nouvelle phrase dans `MATCH_PASSWORD`, `MATCH_GIT_BRANCH=codemagic`, `MATCH_PAT` en Contents Read and write → match crée certificat et
   profil neufs sur cette branche. Le Swift des 0.46–0.52 n'a toujours PAS été compilé.
3. **Construire et tester sur l'iPhone** (`docs/TESTFLIGHT.md`, la liste à cocher) : rien de 0.46 à 0.50 n'a tourné sur un téléphone ;
   le Swift (lecteur, lampe, aperçu, à l'écoute, widgets, contrôles) n'a jamais été compilé.
3. Fusionner `glob/youthful-noether-v9xlop` dans `main` (une PR, si RS-7 la demande) ; idem `ploxi0n-l1` dans labo-cape.
4. Côté labo (dès que xerboxion.org est joignable) : le bouton « ▶ ploxi0n » de Stremio (`docs/LECTEUR.md`) ; le `postMessage({ ploxi0n:
   'ouvrir', id })` de l'UI du labo (mode xerboxion) et la session dans l'iframe ; **la suppression du compte dans l'app** (règle App
   Store 5.1.1(v), bloquante) ; l'envoi de fichiers relayé (l'import des photos dans le boxion l'attend) ; publier la page de confidentialité.
5. labo-cape : le firmware L0 doit parler `docs/BLE.md` ; ensuite essayer la vraie blouse.
6. Plus tard : le mode xeroction ; Live Activities (la musique : `maintenant.js` a tout) ; ⏯ du widget sans ouvrir l'app.

## 4. Les décisions de RS-7 (à ne pas re-demander)

- Santé « connecté » = **les deux** : `jOSSante` pour le hub, ET un résumé sur le boxion, opt-in, éteint par défaut.
- Lecteur = **Apple d'abord, VLC en repli** ; Stremio seul = **un bouton « ▶ ploxi0n »** (lien `ploxi0n://lire`).
- Modes = chill-tekk, xerboxion (« l'UI du labo »), xerbot (XERB0T : la couche robotique).
- TestFlight sans minutes Actions = Codemagic (RS-7 l'a branché le 13.10).
- RS-7 veut « le plus de fonctionnalités natives possible, c'est le but de l'app ».

## 5. Comment travaille RS-7

En français, des messages courts tapés sur le téléphone, souvent en plein travail (les intégrer sans tout arrêter) ; des captures
d'écran de l'iPhone ; il aime le style chill-tekk (presque noir, violets délavés, aucun dégradé). Il a donné un budget de tokens :
travailler en direct, sans sous-agents inutiles, et vérifier ce qui compte (tests, faux iPhone). Ne pas promettre ce qu'Apple interdit
(gyroscope dans un widget, allumer le partage de connexion) : le dire et proposer mieux.
