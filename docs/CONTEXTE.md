# Passation — la session du 12–13.10.2026 (0.46 → 0.51)

*La sauvegarde du contexte demandée par RS-7 avant de fermer la conversation. À lire en premier dans la session suivante.*

*(13.10) Lire aussi `docs/VISION-ORIGINELLE.md` : la vision d'origine de RS-7 (la map des apps, le cube, les modes, le mesh).*

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
- **0.61 — des pages de côté, la salle du cube.** RS-7 : « des pages à gauche et à droite », « quand on tient longtemps n'importe quoi,
  il bouge avec le gyroscope ; penché en avant, on voit les bions ». Routeur : `pageAujourdhui()` (DOM index 0, data-special) et la
  bibliothèque (`aPlat('categories')`, dernier) ; `pageCourante` reste LOGIQUE (0 = la principale), le DOM est décalé de `sp`
  (prefs.pagesCote) ; le glisser-déposer ignore `[data-special]`. `soulever()` : l'icône suit le gyroscope (relatif), penchée en avant
  → `.px-fantome-bions`. Fractale : `.px-fx-salle` (le kion 4D, SVG), `portail()` à l'ouverture, cube de trois quarts (RX0, RY0),
  `ouverte()` (la fractale d'un toucher). Faux iPhone : `parcours-pages.mjs` ; `parcours-tri.mjs` vise `[data-page="0"]`.
- **0.62 — freefall fait défiler ; la fractale légère.** `surLibre()` : penché en avant / en arrière (hors zone morte), l'hôte visible
  (sinon `.px-ecran`) défile ; `placer()` ne garde `px-fx-carte` (donc mise en page + peinture) que pour les vivants à ≤ 3 crans du
  focus (≤ 1,6 dans le cube, ≤ 1 autour du départ pendant l'aperçu) : avec « vivants ∞ », la fractale ne peint pas 20 ploxions.

## 3. Ce qui reste, par ordre

**0.75 (17.10)** — 🤖 XERB0T · le contrôleur (docs/XERBOT.md). `src/xerbot/reseau.js` (CapacitorHttp sans le jeton du labo, délai court,
2 essais ; `PloxiApple.httpFlux` pour le SSE ; Bonjour `reseauChercher` / `reseauResoudre` en NWBrowser / NWConnection IPv4, `import Network`
dans AppDelegate — ne jamais nommer NWEndpoint/NWPath, NetworkExtension a les mêmes) ; `adaptateurs.js` (ha, wled, esphome, tasmota, pi =
Glances, boxion, http ; une forme d'entité commune ; `sonder` en parallèle) ; `controleur.js` (registre `xerbot/appareils`, jetons via jOSVerrou,
BLE UART, HomeKit, le pont du bus xerbot v1 : `idBus`, `versActions`, ack/state ; le ploxion `controleur`). Le mode xerbot : la carte du
contrôleur, la commande legacy du contrat (`commandeLegacy`), « ultimate » → l'id `bluetooth`. Info.plist : NSAllowsLocalNetworking,
NSLocalNetworkUsageDescription, NSBonjourServices. Les bords par défaut de RS-7 (d-bas accueil, deux-milieu xers, deux-bas carte).
Inventaire du nexus pour le physique : scratchpad (rapports labo/boxion/natif) résumé dans docs/XERBOT.md.

**0.74.1 (15.10)** — Revue adverse de l'AR (3 angles + 3 sceptiques, avec la doc d'Apple en JSON) ; corrigé : `TerraxVC` délégué du guide
(`coachingOverlayViewDidRequestSessionReset` → fermer sans carte), `sessionWasInterrupted` → `retrouvee = false`,
`sessionShouldAttemptRelocalization` → true ; la carte de la chambre enregistrée seulement si `worldMappingStatus` est `.mapped` ou `.extending`,
une carte illisible effacée (+ « chambre-neuve ») ; l'étiquette posée par son bas (`position.y = 0,6·t`) ; `poserModele` en
`Entity.loadModelAsync` (repli : l'étiquette 📦) ; `fermer()` → `(presentingViewController ?? self).dismiss` ; PieceVC ignore un `didPresent`
après annulation ; `apercu({ url })` : statut HTTP, `suggestedFilename` ; page : `uneFois` (une ouverture AR / scan / capture à la fois, « déjà
ouverte » ne perd plus la session), fichiers-natif (sans #fragment, extension du type pour blob:/data:, `r.ok`). Restent (non bloquants,
notés par la revue) : reprendre un calcul Object Capture interrompu (le checkpoint le permet), refuser une 2e présentation native.

**0.74 (15.10)** — 📦 Object Capture (RS-7 montre la vidéo « AR Quick Look, meet Object Capture » : « ça pour l'AR »). `AppDelegate.swift` :
`PloxiAR.capturerObjet` → **`ObjetVC`** (iOS 17 : `ObjectCaptureSession` + `ObjectCaptureView` dans un `UIHostingController` — d'où
`import SwiftUI` ; `stateUpdates` → les boutons viser / capturer / terminer ; à `.completed`, la capture est libérée puis
`PhotogrammetrySession(input:configuration:)` + `.modelFile(url:)` (détail `.reduced` par défaut sur iOS) → Documents/terrax/objets/*.usdz ;
photos dans un dossier temporaire effacé). `disponible` rend `objet` (lu sur l'acteur principal : `ObjectCaptureSession.isSupported` est
`@MainActor` sans `@preconcurrency`) et `objets`. `TerraxVC.poserModele` : `Entity.loadModel(contentsOf:)`, posé par le bas
(`visualBounds`), tourné (`rot`) ; `modeles` = les objets capturés proposés dans la feuille de pose (événement pose : `modele`, `rot`).
Page : `ar.capturerObjet` / `voirObjet`, terrax `capturerObjet`, `modelesDe`, `versAR` (le modèle jusqu'à 30 m, `PRES_MODELE`).
**Méthode** : la doc d'Apple se lit d'ici en JSON (`https://developer.apple.com/tutorials/data/documentation/<framework>/<symbole>.json` :
déclaration exacte, plateformes, membres) ; chaque API Swift ajoutée y a été vérifiée (pièges trouvés : `TextureResource.generate` a une
jumelle `async` → `withName: nil` explicite ; `ARQuickLookPreviewItem` est dans QuickLook). Faux iPhone : `parcours-ar.mjs` (capture comprise).

**0.73 (15.10)** — 👁 l'AR native, RS-7 : « le plus important de tout, c'est l'AR ; utiliser au max les fonctions natives ; et AR Quick Look ».
`AppDelegate.swift` : le plugin **`PloxiAR`** (disponible, ouvrir, fermer, scannerPiece ; événement « ar » : pose, touche, chambre-neuve,
ferme), **`TerraxVC`** (ARView de RealityKit sans configuration automatique, `ARCoachingOverlayView` ; terre = `.gravityAndHeading`, x est,
z sud ; chambre = `.gravity` + `initialWorldMap` gardée dans Documents/terrax/chambre ; LiDAR : `sceneReconstruction = .mesh` +
occlusion, `.personSegmentationWithDepth` ; les objets = une image emoji + texte sur un plan qui pivote vers la caméra à chaque image ;
toucher = `entity(at:)` sinon `raycast(.estimatedPlane)` → `UIAlertController`) et **`PieceVC`** (RoomPlan, iOS 16, `#if canImport` :
`RoomCaptureView` → `CapturedRoom.export` → Documents/terrax/pieces/*.usdz). `PloxiApple.apercu` : `url` (téléchargé par iOS) et
`echelleReelle` (`ARQuickLookPreviewItem`, `allowsContentScaling = false`). Tout l'AR est entre `#if !PLOXI0N_SANS_AR` : **secours =
la variable PLOXI0N_AR=0** (GitHub › Settings › Variables, ou Codemagic) → fastlane `retirer_ar`. Page : `src/natif/ar-natif.js`
(`creerArNatif`, `brancherLiensAR` : un lien .usdz / .reality / rel="ar" → AR Quick Look), `src/terrax/terrax.js` (`versAR` / `depuisAR`,
« ouvrir les yeux » natif d'abord, l'AR web en repli ; la chambre : `place` {x,y,z} dans la carte de la chambre ; `piece` = le nom du USDZ).
Le Swift n'est pas compilé ici : relu ligne par ligne + revue adverse. Faux iPhone : `parcours-ar.mjs`. Les widgets : la pochette réduite
(`preparingThumbnail`), `Text` interpolé au lieu de `Text + Text`.

**0.72 (15.10)** — ▦ `ios/App/PloxionWidgets/PloxionWidgets.swift` : le kit HUD (`Peau` .chill/.mono, `PEAU`, `FondHUD`, `Tete`,
`Etat`, `Ligne`, `Kion`, `Portion`), valeurs (tsoins-jour en héros, `.accessoryCircular`), cube (`surFace` : le texte imprimé sur les faces ;
`.contentMarginsDisabled()`), lecture (`Disque`, `source`), épinglés (`g64` : le glyphe PNG rendu par `glyphePng`, src/natif/raccourcis.js).
Le Swift n'est pas compilé ici : relu ligne par ligne + un vérificateur. 📸 `PloxiApple.capturerXer` (WKWebView.takeSnapshot → Caches/xers)
+ `src/natif/apercus.js` (index « reglages/apercus ») ; main.js photographie AVANT d'ouvrir la vue des xers. 🍏 `src/natif/social-apple.js` :
bouton sur `#so-f-login` des ploxions social / socialion / ultimate-social (via `apresChargement`), POST api.j0bot.ch/api/v1/auth/apple
(404 au 15.10 : docs/SOCIAL-APPLE.md, le contrat serveur), session dans `jos_social_token` / `jos_social_user`.

**0.71 (14.10)** — 🌍 `src/terrax/terrax.js` (ploxion interne `terrax`, pages `[data-page-cube]` : terrion / terrax / chambre / quêtes ;
géométrie pure testée : distanceCap, decaler, versTuile, projeter ; couches en lecture : mappion `box:mappion/souvenirs`, nexus `pull`).
Le nexus : `nexus.push/pull` dans main.js = le protocole de jOSNexus (`/nexus/push|pull`, relayés par le shim). Le vrai nord : AppDelegate
`mouvementDebut` en `.xMagneticNorthZVertical` + `cap` = m.heading → shim `webkitCompassHeading`. ◬ `src/terrax/koin-ion.js` sème les hubs
perso (`store:xerkions-persos:items` + `box:xerkions-persos/items`). Le braindump et les quêtes : `docs/TERRAX.md`. Inventaire du nexus pour
la suite (jOSCarte, jOSZone, jOSObjets, scan-reel, cubmap, SkyView) : docs/TERRAX.md §2.

**0.70 (14.10)** — ⊡ `src/app/vue-xers.js` : `voisins(places, de, venu)` (cône 45°, un ploxion par direction, d'où l'on vient derrière soi),
aperçus = `photographier` des hôtes vivants, sinon icône + nom ; places = `carteXer.placesAJour()` (sans ouvrir la carte). La capture d'écran :
AppDelegate.swift (PloxionVC.viewDidLoad) observe `userDidTakeScreenshotNotification` → `bridge.triggerWindowJSEvent("ploxi0n-capture")` → main.js.
Action des bords « xers » (option `surXers`). Faux iPhone : `parcours-vue-xers.mjs`.

**0.69 (14.10)** — Le démarrage : `ouvrirSqliteResilient` (`src/boxion-local/index.js`, 5 essais, attend le premier plan ; err.verrouille) +
AppDelegate.swift passe Library/CapacitorDatabase en `completeUntilFirstUserAuthentication` (l'entitlement reste « Complete » : sa valeur doit
suivre le profil d'Apple, ne pas la changer sans le portail). L'écran d'erreur a ↻ réessayer et se recharge au retour au premier plan.
La barre : `.px-barre .px-hud` défile dans elle-même ; `html,body,#ploxi0n{overflow-x:clip}`. Le sommeil des cachés : `endormirVieux` (routeur,
pref `sommeil` en minutes, 0 = jamais), jamais s'il joue (`<audio>/<video>`, ou Web Audio : `gel.aDuSon`, l'AudioContext attribué par sa pile).
🔍 : `src/app/chercher-local.js` (option `surChercher` du routeur). Faux iPhone : `parcours-069.mjs`.

**0.68 (14.10)** — RS-7 : « surtout, le cube c'est une vue pour les ploxions qui ont plusieurs pages ». `src/app/cube-interieur.js` est devenu
la SALLE partagée (`monterSalle`, `facesDesPages` : fond = page i, droite i+1, gauche i−1, plafond i+2, sol i−2) ; `src/app/cube-pages.js` en
fait le cube DES PAGES d'un ploxion (▣ `data-cube` dans la barre, action des bords « cube », `routeur.cube()`/`cubeActif()`). Les pages :
1. le contrat de l'instance montée `pages()`/`allerPage(cle,{muet})`/`garderEtat()` (marketplace, réglages) ; 2. une liste blanche d'onglets
du DOM (`ONGLETS`, chacun avec son panneau) ; jamais `DANGER`, jamais les `EXCLUS` (cape, pomodoro). Photos = clones inertes : les onglets
se photographient DANS le clone (`photoDuPanneau`, aucun clic : le ploxion ne bouge pas) ; seul le contrat feuillette derrière la salle,
et le ploxion revient à sa page/son défilement/son état (la salle vide reste tant que ce n'est pas fait ; `ouvrir` attend ce `retour`).
0.68.1 (revue adverse, 6 agents) : ouverture annulable (`seq`, `ouvert()` dit aussi l'attente), le geste « cube » (`cubeFerme`), les
canvas (la face reçoit LE nœud gardé), plafond/sol en fondu ; `src/app/modes.js` ne capture plus les `data-mode` d'un ploxion (le minuteur). Piège : l'enveloppe des photos porte `px-hote` (le thème chill
habille sous .px-hote) mais n'est pas enfant direct de la scène — ne pas chercher les hôtes autrement que `.px-scene>.px-hote` ou par
`data-ploxion`. Faux iPhone : `tools/faux-iphone/parcours-cube-pages.mjs` (bother, réglages, marketplace).

**0.66 → 0.67 (14.10)** — 0.66 : ⧈ le xerbion (`src/app/xerbion.js`, sur la face du dessus du cube de la fractale), ◈ le xerploxion (le
ploxion en hologramme : « LE XERPLOXION » dans `src/app/routeur.js`, `tools/faux-iphone/parcours-holo.mjs`). 0.67 : ◈ sur un xerkion
dev/bouffe/ferme/pont/veille ouvre le ploxion du labo `xerploxions` avec `{ xerploxion: 'xerploxion-<d>' }` (`CONSOLES`/`consoleDe`) ;
⚠ pas vérifié que `xerploxions` lise ce paramètre passé au montage (son code vit au labo). ▣ « dans le cube » (`src/app/cube-interieur.js`,
ploxion interne, gardé dans boxion_local « reglages/cube-interieur » ; `tools/faux-iphone/parcours-cube-interieur.mjs`). Le marketplace :
`PORTEES`/`porteeDe` (depuis `compat` de `tools/audit-ploxions.mjs` : A prêt = partout, B = nexus, C = externe ; interne = natif), icônes
xerkion (`icone`), ploxions internes (`internes`). Les puces de portée ne s'affichent qu'en grille/liste ; la vitrine a le rayon ◇ Partout.

**0.63.1 → 0.65 (14.10)** — 0.63.1 : la lenteur, c'était le thème vivant (--mx sur <html>, tout le document recalculé 8×/s : 2 i/s à
l'accueil de RS-7 au faux iPhone ×4 → 50 i/s ; `tools/faux-iphone/parcours-perf.mjs`). 0.64 : ☾ dodo/réveil (tsoin, ploxi0n://dodo,
`comparerNuit` dans Santé), « Réduire les animations » = Calme, ≋ chill-synth phase 1 (`src/chill/chill-synth.js` : à valider sur
l'iPhone, 10 min verrouillé, essais A et B), `docs/APP-STORE.md` (chaque écran d'App Store Connect), les extrapolations en commentaires
(`src/natif/compte.js`). 0.65 : ⊞ la carte du xerboxion (`src/app/carte-xer.js`, `tools/faux-iphone/parcours-carte.mjs`).

**0.63 (14.10)** — voir `src/app/nouveautes.js` 0.63 et les commentaires d'en-tête de `src/app/fractale.js` (le moteur), `src/natif/haptique.js`
(fx-*, creerDebit, densité), `src/natif/jos-natif.js` (module Haptics gardé, crans), `src/app/demo.js`, `src/app/tuto-hud.js`, `src/app/routeur.js`
(« LES ÉTATS D'UN PLOXION », ACTIONS_BORDS, GESTES_DEFAUT remappés), `src/app/barre-haut.js` (l'immersion), `src/natif/lecteur-natif.js` (la garde).
Pièges : `tools/faux-iphone/parcours-lecteur.mjs` est cassé par la garde du lecteur (Playwright compte comme un geste ; neutraliser
`navigator.userActivation` et présenter par `page.tap`) ; le Swift du lecteur (presenter → Bool, renvoyer après l'entrée) n'est pas compilé.
RS-7 (14.10) : « on optimise tout au max, on n'a pas beaucoup d'usage » ; « la limite : il faudra commit » ; **il lance le build lui-même** (pas de
`[build]` dans les messages). Ensuite, dans l'ordre : la LENTEUR (« ultra important, là c'est ultra lent ») ; le « dodo » (tsoin santé/sommeil,
comparé au sommeil de la Garmin via Santé) ; l'accessibilité (VoiceOver, police plus grande, contraste, sans couleur seule, animations réduites)
et la fiche App Store (URL de confidentialité, classement Game Center « Xeroctions », achats intégrés / abonnements pour la Milky Way Foundation
— milkywayhub.org —, le compte de vérification d'Apple = « leur xer à eux ») ; le mode CHILL-SYNTH (brief du 14.10 : phase 1 = le lecteur en
arrière-plan, valider sur l'iPhone avant la suite ; les extrapolations en commentaires seulement) ; la carte du xerboxion ; voir son xerbion et
son xerploxion.

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
