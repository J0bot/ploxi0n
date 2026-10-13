# ploxi0n — la feuille de route complète

*RS-7, 12.10.2026 : « il y a tellement de choses à ajouter à l'app, c'est abusé, il faut que t'aies déjà fait une énorme liste de tout ce qu'on compte faire ».*
*Tout ce qui a été demandé depuis le brief v1 (11.10), rangé par axe. Sources : le brief PDF, `docs/plan-suite.md` (points 1–15), les braindumps du labo (`docs/braindumps/2026-10-1*`), les messages de la session. Tenue à jour à chaque version.*

**Légende** : ✅ fait (version) · 🔨 en cours · ⏭ prochain · 💭 plus tard · ❓ attend une décision de RS-7 · ⚠ fait, mais jamais vu marcher sur l'iPhone

*Dernière mise à jour : 0.61 (13.10) : pages de côté (aujourd'hui, bibliothèque), le cube dans la salle du kion 4D, le portail, l'icône tenue qui flotte au gyroscope et montre ses bions. 0.60.1 : les bords ne sélectionnent plus. 0.60 : le jeu de cartes, le curseur de réel, le filtrage de photons, le cube et ses bions, le gyroscope, freefall, le banc du trackpad haptique. 0.59 : la fractale des ploxions (le glissement, tenir un bord : aperçu, fractale, slider). 0.58 : couleurs des icônes adoucies. 0.57 : le glyphe seul garde la forme du type, pleine. 0.56 : vivants sans plafond (12 par défaut, ∞ possible), glyphes plus grands, style « glyphe seul ». 0.55 : les icônes du xerboxion (la forme = le type, la couleur et le glyphe = la catégorie, l'atelier, proposer au labo), Face ID qui tient (arrière-plan, écran d'accueil), le labo = labo.j0bot.ch.* *Dernière mise à jour : 0.54 (13.10). La 0.52 tourne sur l'iPhone (build Codemagic) : RS-7 « ça lag de malade », « le wiki ne marche toujours pas ». La 0.45 est le dernier build TestFlight ; la 0.46 à la 0.51 attendent les minutes Actions
(1.11) ou un build lancé à la main (`git tag v0.50 && git push origin v0.50`, ou Codemagic : docs/TESTFLIGHT.md, depuis main ; options « widgets » et « vlc » au lancement manuel).*

---

## 00. 0.34 → 0.47 (le 12.10, la nuit)

**Ce que la 0.47 a appris** : un faux iPhone (`tools/faux-iphone/`, `npm run faux-iphone`) — le vrai pont natif de Capacitor et les
plugins tels que le Swift les déclare — a montré que **des pans entiers du natif n'avaient JAMAIS marché sur l'iPhone**, sans que le
navigateur ni les tests le voient : le piège du proxy (`"Preferences.then()" is not implemented on ios`) cassait Raccourcis/Siri, les
widgets, Face ID, les notifications et Santé depuis la 0.5 ; PloxionVC (et donc PloxiApple, PloxiVocal) n'était jamais utilisé
avant la 0.46. Toutes les lignes ⚠ ci-dessous sont à **revérifier sur l'iPhone** avec le build 0.47.

| | | |
|---|---|---|
| ✅ 0.34 | 🖼 Le fond d'écran (photo ou motif gravé, assombrir, flouter, l'accueil ou partout) | |
| ✅ 0.35 | 📁 Le dossier ploxi0n dans l'app Fichiers (tsoins, vocaux, fond, ploxions ; le Dépôt) | |
| ✅ 0.36 | ⚡ Snappy et vivant (boutons, cascades, feuilles) · ⇄ fusionner le compte né d'Apple | |
| ✅ 0.37 | 🌀 Le thème vivant (gyroscope + accéléromètre) | ⚠ jamais vu avant 0.46 |
| ✅ 0.38–0.40 | ◇ L'écran de chargement qui se raconte ; le démarrage ne bloque plus ; le chien de garde (6 s → où, recharger, mode sûr) | |
| ✅ 0.41 | 📶 Les vidéos cachées s'arrêtent (7,88 Go de données en un jour) | |
| ✅ 0.42–0.44 | 🛟 La garde du boxion local ; l'espace libre (caches vidés sous 1,5 Go) ; LE gel du démarrage (la boucle du thème vivant) | |
| ✅ 0.45 | 🌀 Le vivant partout (barre, feuilles, bulles ; jOSNatif.mouvement) ; la raison d'un échec du gyroscope | dernier build TestFlight |
| ✅ 0.46 | 🔌 PloxionVC enfin utilisé : PloxiApple et PloxiVocal branchés (gyroscope, météo, Shazam, MusicKit, HomeKit, Wi-Fi, Game Center, vocaux) | pas encore construit |
| ✅ 0.47 | 🛠 **Le piège du proxy** : Raccourcis/Siri/widgets (Preferences), Face ID, notifications, Santé marchent enfin sur l'iPhone | tests/natif-proxy |
| ✅ 0.47 | ⚡ **Le web devient natif** : vibrate, share, clipboard, geolocation, Notification, getBattery, SpeechRecognition, BarcodeDetector, devicemotion, orientation.lock, wakeLock, Web Bluetooth, Web NFC, window.open → l'iPhone, pour TOUS les ploxions | src/natif/web-natif.js |
| ✅ 0.47 | ❤ **Santé connecté** : bion jOSSante (le hub 🌸 Santé, sur accord) + « ☁ envoyer » un résumé sur ton boxion (opt-in) | docs/SANTE.md |
| ✅ 0.47 | ⚙ **Les réglages en pages et sous-pages** (accueil en 5 groupes ; ⚡ Natif, ❤ Santé ; gestes, haptique en sous-pages) | |
| ✅ 0.47 | 📐 Le thème vivant cassait la mise en page (`px-vivant` = aussi la carte d'un ploxion vivant → `<html>` en flex, 630 px pour 393) | |
| ✅ 0.47 | 📱 La vraie app : PrivacyInfo.xcprivacy, arm64, `fastlane/metadata` + lane `metadonnees`, docs/CONFIDENTIALITE.md | docs/APP-STORE.md |
| ✅ 0.48 | ♫ **À l'écoute** : le Spotify Web Playback SDK (et toute Media Session d'un iframe) → l'écran verrouillé (titre, artistes, pochette, ⏮ ⏯ ⏭ au lieu de « Spotify Embedded Player » ±10 s), le mini-lecteur de l'accueil, la valeur « musique », jOSNatif.lecture | ⚠ WebKit publie aussi le sien : à voir sur l'iPhone qui gagne |
| ✅ 0.48 | ◈ **Le widget Cube** (six valeurs des bions, penché selon la dernière inclinaison, ⟲ interactif, il tourne toutes les 20 min) + ♫ **le widget À l'écoute** (pochette, ⏮ ⏯ ⏭) ; ⚙ › Widgets : le cube 3D qui suit le gyroscope en direct, le choix des faces | build avec l'option « widgets » |
| ✅ 0.49 | 🎞 **Le lecteur intégré** : Apple (AVPlayerViewController : PiP, AirPlay, écran verrouillé) + VLC en repli (MKV, DTS, sous-titres, pistes ; option de build `vlc`) ; plugion jOSplayer (Stremio), vidéo illisible → natif, vidéo muette → bulle, liens vlc:// infuse:// outplayer://, reprise de position, `ploxi0n://lire` pour les ploxions seuls | docs/LECTEUR.md ; ⚠ |
| ✅ 0.49 | 📁 **Les bions de la liste** : envoyer vers (fichiers), aperçu QuickLook, zip/dezipper (fflate), la galerie (plusieurs photos) + import dans Fichiers, le sélecteur de fichiers, Plans (geo:, Google Maps → Plans), Mail, la lampe ; 🎛 contrôles du Centre de contrôle (iOS 18) | ⚠ |
| ⏭ ❓ | Le partage de connexion : **iOS ne laisse aucune app l'allumer** (seulement rejoindre un Wi-Fi, fait) | limite d'Apple |
| ⏭ | Le bouton « ▶ ploxi0n » dans le ploxion Stremio (côté labo, docs/LECTEUR.md) ; l'import des photos DANS le boxion (attend l'envoi de fichiers relayé) | |
| ✅ 0.50 | 🥼 **labo-cape** (lot L1 de J0bot/labo-cape) : la blouse RS-7 en BLE (contrat `docs/BLE.md`, branche `ploxi0n-l1` de labo-cape) ou sa simulation (copie de cape-engine vérifiée contre la trace du Rust) ; vue live, commandes (42 °C max), LEDs, journal, session en tsoin | à essayer avec la vraie blouse (firmware L0) |
| ✅ 0.50 | ◈ **Les modes** : ◇ chill-tekk · ⬡ xerboxion (l'UI du labo, `xerboxion.org/home?app=ploxi0n`, le dock par-dessus ; `postMessage({ ploxi0n: 'ouvrir', id })` ouvre un ploxion en natif) · 🤖 xerbot (la blouse, Bluetooth, HomeKit, la lampe, NFC, Wi-Fi, le bus `xerbot.cmd`) | côté labo : le postMessage, la session dans l'iframe |
| ✅ 0.51 | ▤ **Les mini docks** (RS-7 : « tout doit pouvoir être minimisé en mini dock, et une page de tous les mini docks ») : `src/app/minidocks.js`, `jOSMiniDock.publier/retirer/surAction/liste/page` ; ploxions minimisés, musique, blouse, Santé, vidéo à reprendre, vocal, brouillon de tsoin ; ⧉ = la page ; glisser = fermer | ✅ faux iPhone (parcours-minidocks) |
| ✅ 0.51 | 🎞 **Stremio → natif pour de vrai** : le plugion enveloppe `jOSPlayer.play` (le bion du labo ; 0.49 visait une API inventée) ; reprise `xb:resume:<key>`, `onNext`, sous-titres, repli web par événement, `jOSPlayer.natif` ; `window.open` d'un flux passe devant Safari ; les partages `capacitor://` → le lien du labo | ⚠ iPhone |
| ✅ 0.51 | 🎧 **Spotify** : installable (le code extrait de `/px/spotify`, pas d'app.js au labo — vaut pour wiki, notes, calendar…) ; l'accroche du SDK tient dans tous les ordres, `disconnect` → fin ; la source `jOSSound` (music, Lecteur) ; le mode xerboxion reçoit `postMessage({ ploxi0n: 'lecture' })` ; `/auth/…` du serveur → Safari ; jamais de jeton en cache | ⚠ iPhone (le SDK sur WKWebView : DRM ?) |
| ✅ 0.51 | 📶 Les bions absents (404 HTML de 3,5 Mo) notés 7 jours : ~10 Mo de moins par installation de Stremio | |
| ✅ 0.52 | ◇ **Chill-tekk pour tous les ploxions** : les `--xr-*` du labo (jOSTheme, ×900 usages) redéfinis sur `<body>` avec les jetons de l'app + une base `:where()` (spécificité nulle) pour ce qu'un ploxion ne style pas ; `prefs.pxChill` (⚙ › Apparence). Limite : les couleurs écrites EN DUR restent (Horloge en vert) → côté labo, passer par `--xr-*` | ✅ galerie du faux iPhone |
| ✅ 0.52 | ⬡ Mode xerboxion : l'iframe sondée avant d'être montrée (plus de blanc) ; la barre d'installation en erreur 5 s au lieu de 9 | |
| ✅ 0.53 | ⚡ **Snappy** : le thème vivant posait --mx/--my sur `<html>` à 30 Hz (style de TOUTE la page recalculé ; 131 icônes × ombre floue + fond plein écran repeints) et tournait aussi dans les ploxions → transforms composités sur le fond et la grille (1×/image), variables à 8 Hz, arrêté dans un ploxion sauf abonné ; `will-change` retiré des 131 tuiles ; cascade sur 16 tuiles ; `content-visibility` ; ❄ `src/app/gel.js` (requestAnimationFrame d'un ploxion caché mis de côté) ; le shim n'écrit plus `natif/*` dans le journal xion et au plus 1/s par sujet | ⚠ iPhone |
| ✅ 0.53 | 📖 **Les cadres du labo** (`src/natif/cadres-labo.js`) : `<iframe src="/wiki">` → le labo ; CSP `frame-ancestors` sans `capacitor:` (lue par HEAD) → une carte « ouvrir » ; idem le mode xerboxion. **Côté labo, une ligne** : ajouter `capacitor:` à `frame-ancestors` (comme `/app/yt` le fait déjà) → le wiki et l'UI du labo s'affichent DANS l'app | côté labo |
| ✅ 0.54 | ◇ **Les glyphes** (`src/app/glyphes.js`, le trait du sprite du labo `public/glyphs/xerboxion_glyphs.svg`) : chaque ploxion son glyphe (mots-clés, sinon généré : forme × marque) ; le dock, les modes, les mini docks, les réglages ; `src/app/sans-emoji.js` remplace les emoji restants de l'interface de l'app (pas le contenu des ploxions du labo) ; `prefs.glyphes` | ✅ faux iPhone |
| ✅ 0.54 | ✥ **Glisser-déposer** de l'accueil (appui long = soulever ; réordonner, dossier, page voisine ; sans bouger = le menu) ; `accueilDoc.ordre` | ✅ faux iPhone |
| ✅ 0.54 | ▦ Les widgets dans chaque build Codemagic (`PLOXI0N_WIDGETS=1` dans codemagic.yaml) ; l'aperçu du cube animé (gyroscope via `mouvement.ecouter`, doigt, rotation lente) | ⚠ Swift des widgets jamais compilé depuis 0.48 |
| ✅ 0.54 | 🎞 Vidéo : `playsinline` posé au `play()` ; PiP en quittant l'app (web : `webkitSetPresentationMode` ; natif : `canStartPictureInPictureAutomaticallyFromInline`, session audio active) ; le lecteur natif présenté depuis le contrôleur du dessus, jamais deux fois ; plein écran vidéo → `routeur.endormirCaches()` | ⚠ le plantage : sans journal — partager le rapport depuis TestFlight (lane `crashs`) |
| ⏭ | 🎨 **Les peaux** (docs/LOOK.md : Ryoku d'abord, 43PR, Aperture OS) : une grammaire de panneau HUD, des palettes et des fonds | |
| ✅ 0.52 | ⏱ Minuteur dans le pack hors ligne (Pomodoro l'ouvre) ; `routeurProxy.ouvrir` installe un ploxion du pack depuis le téléphone avant de tenter le réseau | ✅ faux iPhone |
| ✅ 0.52 | 👤 ⚙ › Compte › « Supprimer mon compte » → `labo/profile` (la page de compte du labo, Laravel ; protégée par la connexion) — règle 5.1.1(v) côté app. ⚠ vérifier que `/profile` a bien « supprimer le compte » pour un compte venu de l'OAuth j0bot (sans mot de passe ?) | côté labo |
| ⏭ | 🪟 **La bande façon niri** (RS-7 13.10) : les ploxions vivants en colonnes sur une bande qu'on fait défiler, le nouveau s'ouvre à droite, une vue d'ensemble | |
| ⏭ | 📚 **Le lot de ploxions** (RS-7 13.10) : Zotero, Foliate (EPUB : foliate-js), browser façon Helium (le `web` du labo + natif), Blanket (ambiances), vaults Obsidian, LocalSend (natif, LAN), AppFlowy, Manim (le `math` du labo), mpv (le lecteur intégré), btop (+ le xerminal du labo) | composer avant de créer |
| 💭 | Le mode **xeroction** (voir ce qu'on a fait : la frise des tsoins, le Nexus) ; XERB0T : les gestes de la blouse = ordres au robot (labo-cape EXTRAPOLATION) | |
| ⏭ | **Construire la 0.50 et tout revérifier sur l'iPhone** (les ⚠) : `tools/faux-iphone` dit que c'est branché, seul le téléphone dit que ça marche | |
| ⏭ ❓ | **Supprimer son compte DANS l'app** (règle App Store 5.1.1(v), bloquante) : une route labo, puis un bouton ⚙ › Compte | côté labo |
| ⏭ | Le faux iPhone sur les ploxions du réseau (quand xerboxion.org est joignable depuis l'environnement) : tous les ploxions publics, chemin iPhone | |
| 💭 | Encore plus de natif : Contacts, Calendrier/Rappels (EventKit), Live Activities, contrôles du Centre de contrôle, Apple Pay ? | nouveaux plugins |

## 0. Le 12.10 au soir (0.29 → 0.33) et la direction

**RS-7 : « ton taff c'est d'ajouter la couche iOS à tous les bions ».** Chaque bion du labo garde son API ; dans ploxi0n il reçoit sa
contrepartie native (FOURNIS + src/natif/<bion>.js). Un ploxion qui « charge à l'infini » = un bion global du web qui manque ici.

| | | |
|---|---|---|
| ✅ 0.29 | Boîte noire du lancement, mode sûr après 2 plantages ; lane fastlane `crashs` | |
| ✅ 0.30 | Plantages partagés (build 37) : boucle versLesWidgets ← didChangeNotification → copie planifiée, état sans heure | 3 crash logs |
| ✅ 0.30 | **Reprise de session** (devant rouvert, les autres 💤) · **⧗ tsoins natifs** + journal · **▔ barre du haut** composable · **🧭 tuto** | |
| ✅ 0.31 | **✦ Nouveautés** à la 1re ouverture après une mise à jour (src/app/nouveautes.js, une entrée par version) | |
| ✅ labo | Registre : 33 ploxions sans clé (zone, files, word, excel, rockets…) publiés « 0…32 » en stub → clés = id | 7e8f6f44 |
| ✅ 0.32 | **jOSBoxion connecté lit vraiment le boxion** (le serveur rend le document tel quel, pas `{item}`) ; la file : rien sans compte, jamais par-dessus plus récent | « zone pas connectée » |
| ✅ 0.32 | **Iframes du site** → xerboxion.org (wiki, calendar, notes, player…) · **❤ Santé** (HealthKit) · **🧭 jOSUsage natif** (tél + web) | |
| ✅ labo | **Idle synchronisé** (jOSBoxion xp/idle) + gains pendant l'absence | 76cf1e0f |
| ✅ 0.33 | **⬇ barre d'installation** (ploxion puis bion par bion) · **📦 gestionnaire** (place, dépendances, libérer, orphelins) · **◇ écran de chargement** | |
| ✅ 0.33 | **Lier son Apple ID** au compte xerboxion.org (l'un ou l'autre ouvre le même compte) ; Hotspot, mémoire augmentée, notifications de communication | labo 4f12ba02, banc 91/91 |
| ⏭ | **Les vrais glyphes au lieu des emojis** (koin △ kion ▢, le codec) : dock, HUD, réglages, ploxions internes | RS-7 12.10 |
| ⏭ | **Recensement bions → couche iOS** : chaque bion global du web (jOSToast, jOSComptes, jOSGame, jOSCache, jOSGeo…), fait / à faire | RS-7 12.10 |
| ⏭ | **Le clicker du xerboxion** pour de vrai (l'idle de xp n'en est qu'un jouet : 7 paliers) — voir §1 | RS-7 : « pas autant avancé que la vision » |
| ⏭ | **Le regard (eye tracking)** pour zoomer : ARKit + caméra TrueDepth (ARFaceTrackingConfiguration, lookAtPoint) → là où l'on regarde grossit | RS-7 12.10 « par la suite » |
| ⏭ | Iframes connectées (calendar, notes… ont besoin du compte dans l'iframe : clé de session comme les icônes) | |

## 1. Le socle (ce qui fait tourner les ploxions)

| | Quoi | Notes |
|---|---|---|
| ✅ 0.1 | boxion_local (mémoire, IndexedDB, SQLite) | Data Protection iOS (0.4) au lieu de SQLCipher |
| ✅ 0.1 | Shim jOS : jOSPorts, jOSTsoin, jOSBoxion, miroir localStorage, routes locales | |
| ✅ 0.8 | **Mode connecté** : toute route du serveur → xerboxion.org avec le jeton ; cache hors ligne | labo `JetonAppWeb`, kill-switch |
| ✅ 0.8 | Bions **touchés** résolus récursivement, rattrapage des anciens | xerkions, réglages, ultimate-social |
| ✅ 0.8 | jOSXerPrefs complet (get/set/ouvrir/params/demande) | |
| ⏭ | **Envoi de fichiers** par le mode connecté (FormData / multipart) | aujourd'hui : 503 « pas encore relayé » |
| ✅ 0.18 | **Un seul chargement par bion** pour toute l'app (un bion déjà exécuté n'est plus rechargé par le ploxion suivant) | RS-7 : « un seul bion pour tout » |
| ✅ 0.18 | **⚡ jOSNatif** : LE bion natif (partager, vibrer, copier/coller, photo, position, notifier, ouvrir un lien, appareil, batterie, réseau, parler) | RS-7 : « le but d'une app native, c'est d'utiliser les choses natives » |
| ✅ 0.18 | **Les plugions** : brancher un bion du labo sur le natif sans le réécrire (jOSAppareil, jOSShare.natif) | RS-7 : « les meilleurs plugions entre les bions » |
| ✅ 0.19 | **L'haptique** : ouvrir, revenir, minimiser, les bords (un cran au seuil), l'appui long, les pages, les vues, les interrupteurs, installé (succès) / erreur — coupable dans ⚙ › Apparence | RS-7 : « jouer avec les haptics » |
| ✅ 0.20 | **Le lecteur natif** : le son continue écran verrouillé et en silencieux (AVAudioSession, mode audio), contrôles sur l'écran verrouillé (Media Session), AirPlay, PiP, flux http permis (ATS), YouTube par une page https sandboxée (152/153), les ploxions « seuls » ne font plus sortir l'app | RS-7 : « le lecteur, surtout Stremio ou YouTube » |
| ✅ 0.20 | **L'haptique du son** (les basses → des vibrations, pour les sons lisibles par l'app) | |
| ✅ 0.20 | **🫧 Les haptiques qu'on invente** (le studio, des motifs nommés) et chaque événement → un style ou un motif, dont **notification** ; `jOSNatif.haptique()` pour les ploxions | RS-7 : « inventer ses propres haptics » |
| 💭 | **Le clicker du xerboxion** : découvrir tout le xerboxion, googolplex, 10^24 fps, 10^5 années de Minecraft ; connecté à tous les clickers (leurs sauvegardes) ; la progression passive = le tsoin engine | braindump labo 2026-10-12 |
| ✅ 0.47 | Plus de plugions — au niveau des API WEB : position, QR (BarcodeDetector), notifications, dictée, gyroscope, Bluetooth, NFC… passent par le natif pour tous les bions (web-natif.js) ; reste jOSCache → boxion_local | ⚠ à voir sur l'iPhone |
| ⏭ | « La version la plus optimisée du même bion » : quand plusieurs sources servent un même bion (labo, boxion de chacun, natif), choisir la plus rapide et la plus légère | |
| ⏭ | Les bions qui manquent encore : jOSComptes, jOSToast, jOSXerkionsForge (404 sur /px/bion-app) | côté labo : les servir seuls |
| ✅ 0.15 | **Gérer les bions** (⚙ › Bions) : taille, qui les utilise, couper, mettre à jour, retirer | |
| 💭 | jOSPorts relié au **bus du boxion** (xion en direct, SSE) en mode connecté | le phone devient un nœud du xion |
| 💭 | Le **boxion de chacun** comme source (pas seulement xerboxion.org) : choisir son boxion | topologie 2 boxions |
| 💭 | Fil threads WASM (COOP/COEP) : impossible dans la WebView Capacitor → serveur local natif | seul échec du banc |

## 2. Le compte, les rangs, le Nexus

| | Quoi | Notes |
|---|---|---|
| ✅ 0.6 | Se connecter avec son compte xerboxion.org (PKCE), bouton dans le HUD | |
| ✅ 0.8 | Jetons d'app de 180 j (Sanctum lisait 30 **minutes**) | |
| ✅ 0.21 | **Sign in with Apple** → un compte **bion** (labo : jeton Apple vérifié, signature JWKS, nonce ; mail déjà pris → 409) | |
| ⏭ | Monter de rang : **code d'un xerion** (→ zion) ; **installer son boxion** (→ xeroction) | |
| ⏭ | **L'icône qui évolue avec le rang** (icônes alternatives iOS : bion → … → xeroction) | |
| 💭 | **L'app xeroction** : au rang xeroction, l'accueil montre tous les xers et le Nexus | |
| 💭 | Le **Nexus des xeroctions** : un xeroction demande l'accès TestFlight par e-mail, RS-7 valide, la CI l'ajoute (groupe externe) | revue bêta Apple par version |
| 💭 | Le **speedrun** : de bion à xeroction, annoncé au Nexus (note TestFlight « What to Test ») | |

## 3. Le marketplace

| | Quoi | Notes |
|---|---|---|
| ✅ 0.4 | Installer depuis xerboxion.org, pack hors ligne, mises à jour (ETag) | |
| ✅ 0.6 | Dépendances automatiques (comme les mods sur Prism) | |
| ✅ 0.7 | Popularité = **heures du Nexus** (pas les vues), « zéro heure », « souvent utilisé avec » | |
| ✅ 0.8 | Refait : vitrine, grille, A–Z, découvrir (glisser), à moi, fiche, recherche instantanée | |
| ⏭ | « **Un xer de cette app** » : proposer le xer d'un ploxion (chaque ploxion devient un xerboxion) | |
| ✅ 0.21 | Les ploxions **admin** dans le marketplace quand on est admin (🛡) | pourriture-4 reste personnel |
| ⏭ | Le **marketplace des raccourcis** : des recettes Raccourcis prêtes (liens iCloud) | plan-suite 13 |
| 💭 | **Plusieurs sources** : le boxion de chaque xeroction du Nexus, après le banc de compatibilité | plan-suite 7 |
| 💭 | **Umbrel** : une inspiration d'architecture et le terrain d'une collaboration future (docs/UMBREL.md) ; formats compatibles (7 types de widgets, manifestes) ; CasaOS / Runtipi (licences libres) comme sources possibles | RS-7 : « eux ont les avis des customers, nous un écosystème entier » |
| 💭 | Le **Steam Workshop** comme source (miroir labo `/px/workshop/*.json`, clé Steam sur le boxion) | plan-suite 12 |
| 💭 | Les **ploxions comme joueurs** : rangs, stats, commits, l'usage par feature (pas seulement par ploxion) | braindump machine à tsoin |

## 4. L'écran d'accueil de l'iPhone et iOS lui-même

| | Quoi | Notes |
|---|---|---|
| ✅ 0.4 | Liens `ploxi0n://px/<id>`, raccourcis de l'icône | |
| ✅ 0.5 | **App Intents** : Ouvrir un ploxion, Noter un tsoin | Siri, Spotlight, bouton Action |
| ✅ 0.9 | Envoyer à un ploxion (bus), Lire une valeur, Chercher un ploxion | |
| ✅ 0.9 | **Widgets** : 📌 épinglés, ◇ valeurs (aussi écran verrouillé) | App Group |
| ✅ 0.11 | 📲 **Tes ploxions en vraies apps** (profil de clips fabriqué par le labo) | |
| 🔨 0.48 | Widgets **interactifs** (iOS 17) : ⟲ du cube ; reste : ⏯ du widget À l'écoute sans ouvrir l'app (AudioPlaybackIntent, l'intent dans les deux cibles) | |
| ⏭ | Un widget **par ploxion** (chaque ploxion publie le sien : une valeur, un bouton, un graphe) | |
| 💭 | **Contrôles du Centre de contrôle** (iOS 18) : un bion = un contrôle | |
| 💭 | **Live Activities / Dynamic Island** : un tsoin en cours, un minuteur, la musique (maintenant.js a déjà tout ce qu'il faut) | |
| 💭 | **Un xer = un mode de concentration** avec ses pages d'accueil ; Focus Filter → l'app change d'accueil et de thème | « le vrai mode xerboxion sur le phone » |
| 💭 | Liens universels `https://xerboxion.org/px/<id>` qui ouvrent l'app | Associated Domains coché |
| 💭 | Le **mode xerboxion** de tout l'iPhone : réglages, son, interface pilotés par des ploxions et des bions (Raccourcis + automatisations) | tableau de plan-suite |

## 5. La navigation et le multitâche

| | Quoi | Notes |
|---|---|---|
| ✅ 0.4 | Dossiers | |
| ✅ 0.8 | **Pages** d'accueil qu'on fait glisser | |
| ✅ 0.12 | **Ouvrir un ploxion depuis un ploxion** (pile : « ‹ » y revient vivant) | |
| ✅ 0.12 | **▁ Minimiser**, « en arrière-plan » sur l'accueil, **⧉ basculer** | 5 vivants au plus |
| ✅ 0.12 | **Les bords** gauche/droit : glisser pour passer d'une app à l'autre | |
| ✅ 0.22 | **Les gestes des bords** : 3 zones par bord (haut, milieu, bas) + les deux bords ensemble, chacun son action (⚙ › Navigation) ; les deux bords au milieu = **portion** | RS-7 12.10 |
| ✅ 0.22 | **Appui long = clic droit** dans les ploxions (leurs menus contextuels) | |
| ✅ 0.22 | **Plein écran complet** : sans barre d'état, la barre du bas s'efface, les bords haut/bas d'abord à l'app (PloxionVC) | |
| ✅ 0.22 | **La télécommande** : la barre d'un ploxion, la recherche du marketplace, la tête des réglages en bas (tout au pouce) | « on est tous des flemmards » |
| ✅ 0.22 | **Les images des ploxions** : chemins du site → xerboxion.org ; avec le jeton si la route l'exige | « les images ne s'affichent jamais » |
| ✅ 0.13 | Le **dock en bas** (compte, épinglés, ⚙) | RS-7 : « la barre boxion avec les épinglés en bas » |
| ✅ 0.13 | **Six façons de voir ses ploxions** : grille, compacte, liste, usage (ses heures), récents, catégories | |
| ✅ 0.13 | Le **droit au silence** appliqué : ce qu'un ploxion accroche à la page se cache, revient et part avec lui | le carré lilas flottant |
| ✅ 0.14 | **Appui long** sur un ploxion : ouvrir, épingler au dock (et au widget), sur l'écran d'accueil de l'iPhone, déplacer vers une page ou un dossier d'un toucher, Face ID, retirer | |
| ✅ 0.14 | **Plus de zooms** : viewport fixé (gardé contre les bions), pas de double-tap, champs à 16 px | |
| 💭 | **Le trackpad haptique** : une surface au pouce où l'on SENT les commandes (chaque action, son motif) ; une langue qui s'apprend, l'aide visuelle s'efface à mesure, puis on fait tout sans regarder (plan-suite 16) | RS-7 12.10 |
| ⏭ | Glisser-déposer une tuile (vers le dock, vers une autre page) | |
| ⏭ | Deux ploxions côte à côte (iPad, iPhone en paysage) ; **fill the gaps** dans l'app (jOSGaps) | |
| 💭 | Le **cube** / la carte géante des apps (vision originelle 14.09) comme accueil alternatif | |

## 6. Le look

| | Quoi | Notes |
|---|---|---|
| ✅ 0.15 | **Réglages v2** : recherche, catégories, apparence (patine, contraste, calme, taille des icônes, plaque), navigation (bords, appui long, vivants), dock | |
| ✅ 0.24 | **Le clavier d'iOS à fond** : chaque champ reçoit les bons attributs (majuscules, correction, Entrée « Rechercher/Envoyer », claviers e-mail/URL/chiffres, trousseau des mots de passe, codes SMS) ; la barre au-dessus du clavier visible (QuickType, mots de passe, dictée) | RS-7 12.10 |
| ✅ 0.24 | **« Dis à ploxi0n … »** (Siri) : une phrase dictée → ouvrir, chercher, noter un tsoin, accueil, minimiser | |
| ✅ 0.24 | **Le vocabulaire du xerboxion** pour Siri : ce que Siri a cru entendre est corrigé (ploxion, xerboxion, tsoin, koin…, FR et EN), les ploxions retrouvés phonétiquement ; les phrases Siri en anglais (« Tell ploxi0n », « Open … in ploxi0n ») | iPhone en anglais |
| ✅ 0.28 | **jOSBoxion connecté** : connecté et en ligne, le boxion fait foi (pourriture-4 et les autres retrouvent leur historique) ; copie locale et file d'écritures hors ligne | « j'ai pas l'historique de pourriture-4 » |
| ✅ 0.28 | **Les médias du boxion** (vidéos, images, sons) par adresse signée : en flux dans le lecteur natif | |
| ✅ 0.28 | **L'icône d'écran d'accueil EST le ploxion** (seul, depuis xerboxion.org) ; ou « ouvre ploxi0n dessus », au choix | « utiliser les ploxions ajoutés en app sur eux-mêmes » |
| ✅⚠ 0.27 | **🏠 HomeKit** (jOSNatif.maison : liste, allumer/éteindre — les kions dans le réel), **📶 Wi-Fi** d'un geste, **🎮 Game Center** (connexion, scores) ; **liens universels** et trousseau de xerboxion.org (Associated Domains) ; mémoire augmentée, notifications urgentes/communication, push (préparés) | RS-7 : « j'ai tout activé » |
| ⏭ | Paquet suivant : iCloud (sauvegarde du boxion_local), Matter, Wallet (cartes du Nexus), VPN vers son boxion, App Attest, polices chill-tekk | |
| ✅ 0.26 | **Chaque ploxion a sa signature haptique d'ouverture** (tirée de son nom ; remplaçable dans ⚙ › Haptique ; ou déclarée dans son manifeste `haptique`) | RS-7 12.10 |
| ✅⚠ 0.26 | **🍎 WeatherKit, ShazamKit, MusicKit** : jOSNatif.meteo() (avec l'attribution Apple Weather), shazam(), musique.chercher/jouer/pause | RS-7 12.10 |
| ✅⚠ 0.25 | **🎙 Les vocaux** : le bouton du dock (enregistrer / arrêter), la transcription d'iOS sur le téléphone avec le vocabulaire du xerboxion, la feuille (tsoin, pourriture-4, copier, partager), jOSNatif.vocal pour les ploxions | RS-7 12.10 |
| ✅ 0.47 | La dictée DANS l'app : jOSNatif.dictee et SpeechRecognition des ploxions → la reconnaissance d'iOS (enregistrer puis transcrire) ; reste : les commandes vocales sans Siri, la dictée en direct | ⚠ |
| ✅ 0.23 | **LE vrai coupable du clavier** : le bion jOSKeyboard (clavier maison du xer) posait inputmode="none" partout → fourni par l'app, le clavier d'iOS gagne toujours | le rapport du test clavier |
| ✅ 0.16 | **Le clavier s'ouvre** : correctif natif (tout focus compte comme un toucher, comme Cordova/Ionic) + focus pendant le geste | RS-7 : « le clavier n'apparaît pas quand il faut » |
| ✅ 0.15 | Écrire partout : les champs gagnent toujours contre un user-select:none d'un bion | RS-7 : « je peux jamais écrire nulle part » |
| ✅ 0.11 | **Chill-tekk-7026** : presque noir, violets délavés, aucun dégradé, arrondi chill usé, patine, inscriptions gravées | |
| 🔨 0.50 | Les **modes** : chill-tekk · xerboxion (l'UI du labo) · xerbot (le monde physique) ; reste xeroction (voir ce qu'on a fait) | braindump 11.10, RS-7 13.10 |
| ⏭ | Les ploxions eux-mêmes en chill-tekk-7026 (le thème du labo appliqué dans l'app) | |
| 💭 | Les **xers** (thèmes, dispositions) choisis dans l'app | |
| 💭 | L'UI **organique vivante** : mitose (uncraft), fusion (craft), membranes, tubes | APRÈS le système bions |

## 7. Les notifications

| | Quoi | Notes |
|---|---|---|
| ✅ 0.3 | Notification locale (banc) | |
| ✅ 0.12 | ⚙ « tester une notification » ; **messages de coord** tant que l'app est ouverte | |
| ⏭ ❓ | **Les vraies notifications push (APNs)** : coord, DM, social, bother… même app fermée | une clé APNs (portail Apple) ; le labo l'envoie → décision : où vit la clé |
| 💭 | Chaque ploxion publie ses notifications (jOSNotif) ; les régler par ploxion | |

## 8. Les capacités de l'iPhone (le banc)

| | Quoi | Notes |
|---|---|---|
| ✅ 0.3 | Banc iPhone (~60 sondes : capteurs, caméra, QR, voix, santé, NFC, Wi-Fi, BLE, Face ID…) | tout vert sauf WASM threads |
| ✅ 0.4 | **Face ID** : verrous par ploxion, coffre | |
| ✅ 0.21 | Face ID : chaque échec dit sa raison (iOS), « réessayer » | RS-7 : « Face ID ne fonctionne pas » |
| ⏭ | **Le journal du mode test** : tout logger ; des modes de consentement (xerboxion : demander de faire un tsoin ; chill-tekk : un tampon envoyé seulement si on veut ; par ploxion : partager son journal au Nexus ou au chaoxion) | RS-7 12.10 |
| 🔨 0.47 | **ultimate-bluetooth** sur iPhone : Web Bluetooth (requestDevice, GATT, notifications) → Bluetooth LE natif ; à essayer avec le ploxion | ⚠ |
| ✅ 0.47 | Santé en bion lisible par les ploxions (jOSSante, sur accord) + le résumé sur le boxion (opt-in) | docs/SANTE.md |
| 🔨 0.47 | NFC : Web NFC (NDEFReader : lire, écrire texte/lien) et jOSNatif.nfc → Core NFC ; reste : des tags qui ouvrent des ploxions ou lancent des tsoins (les **kions** dans le réel) | ⚠ |

## 9. Les ploxions à faire vraiment marcher sur l'iPhone

| | Quoi | Notes |
|---|---|---|
| ✅ 0.8 | **bother me** de base (pour les testeurs) | |
| ✅ 0.8 | réglages, xerkions, ultimate-social, social (mode connecté + bions) | à confirmer sur l'iPhone |
| ⏭ | **Fichiers** (jOSFiles) et la connexion au boxion | envoi de fichiers d'abord |
| ⏭ | **Stremio**, **YouTube**, **Instagram** intégrés | |
| ⏭ | **Coord** 📡 dans l'app (lire, écrire, pièces) | |
| ⏭ | **pourriture-4** (admin, personnel) : téléphone d'abord, glisser-déposer fichiers/photos/captures | |
| ⏭ | **Code** : la console xerboxion (xerminal, btop, RAM, paquets, apt sur le boxion) | braindump 11.10 |
| 💭 | **👁 Le vu** : ce qu'on regarde (YouTube, Stremio, Netflix, **Trakt**) — un bion jOSVu, une frise | plan-suite 14 |
| 💭 | La **symbiose 3D** : voir en temps réel ce que fait l'agent, annoter | braindump 11.10 |
| 💭 | Le **robot de la certitude** : le fact-check, « la certitude du Nexus » | braindump 10.10 |

## 10. Les tsoins et la machine à tsoins

| | Quoi | Notes |
|---|---|---|
| ✅ 0.1 | Tsoins locaux (jOSTsoin), Noter un tsoin par Raccourcis (0.5) | |
| ⏭ | Les tsoins de l'iPhone **remontent au boxion** (réplication pull/apply) | |
| 💭 | Le **tsoin engine** sur le phone : détecter les patterns d'usage → proposer une automatisation (deux koins → un koin) | sans LLM |
| 💭 | La **vidéo faite de tsoins** : le processus « fais ton app » rejoué depuis ses tsoins | plan-suite 8 |

## 11. La technique pour tout le monde

| | Quoi | Notes |
|---|---|---|
| ✅ 0.1 | CI GitHub Actions + fastlane + TestFlight sans Mac | |
| ✅ 0.9 | Les widgets ajoutés par la CI (xcodeproj), signés par match | |
| ⏭ | Le **modèle de dépôt** « fais ton app » : la coque, le shim, la CI ; tes ploxions viennent de ton boxion | plan-suite 6 |
| 💭 | Le **banc de compatibilité** comme porte d'entrée au Nexus (contrat jOSApps du xer de xerboxion.org) | |
| 💭 | Android (la même coque Capacitor) | |

## 12. Le jeu

| | Quoi | Notes |
|---|---|---|
| 💭 | **pourriture-4 sur Steam** : construire son vaisseau, depuis la station pourriture-4 du Nexus ; VR ; core Rust | RS-7 a les droits Steam |
| 💭 | Le speedrun du xerboxion : de pourriture-4 au xeroction ; trouver tous les xerboxions et leur machine à tsoins → des kions dans le réel | |

## 13. La qualité

| | Quoi | Notes |
|---|---|---|
| ✅ | 89 tests (jsdom), banc labo 55/55, `tools/diagnostic-iphone.mjs` (le vrai chemin de l'app) | |
| ✅ 0.47 | **Le faux iPhone** (`tools/faux-iphone/`, `npm run faux-iphone`) : le vrai pont de Capacitor + les plugins tels que le Swift les déclare ; parcours de l'app, des API web natives, des réglages, de la largeur | |
| ⏭ | Diagnostic sur **tous** les ploxions publics (un par processus), publié comme compat.json | |
| 🔨 0.47 | Captures automatiques des écrans (Chromium, taille iPhone) à chaque version : le faux iPhone les prend ; reste à les publier à chaque version | |

---

## Les décisions qui t'attendent (❓)

1. **Les notifications push (APNs)** : il faut une clé APNs (developer.apple.com › Keys › + › Apple Push Notifications service). Le serveur qui envoie (le labo) doit la détenir, alors que la règle actuelle dit « les secrets Apple jamais sur le Boxion ». Options : (a) la clé APNs sur le labo, isolée et révocable (elle ne sert QU'À envoyer des notifications, pas à publier l'app) ; (b) un petit relais ailleurs ; (c) pas de push, seulement app ouverte.
2. **Sign in with Apple** : la route labo qui crée un compte **bion** à partir du jeton Apple. À confirmer : l'e-mail masqué d'Apple suffit, pas d'autre donnée.
3. **Testeurs externes** (Nexus des xeroctions) : chaque version passe par une revue bêta d'Apple (≈ 1 jour). On y va maintenant ou on garde des testeurs internes ?
4. **Steam Workshop** : quand le jeu pourriture-4 existe sur Steam (la clé API vivra sur le boxion).
