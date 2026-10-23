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

**0.96 (23.10)** — RS-7 : « on garde tout, il faut pouvoir choisir entre toutes ces possibilités ; mes préférées : xéno et cyberpunk ; il faut
découvrir la fractale des UI, avoir des knobs pour modifier le UI selon un générateur fractal, c'est des formules au final le UI ; dans
organique, le but c'est de trouver le UI qui est parfait pour toi ; tout le monde a une vision différente ; des UI pour tous les types de DA ».
- `src/bions/genome.js` : GENES (23 gènes, 0..1 : le goo, l'onde, la paroi… les excroissances, deux couleurs de la PALETTE de RS-7) ;
  `genomeDe(variante)`, `versVariante(g)`, `muter`, `croiser`, `grille(g, ecart, graine)` (3 × 3 le long de deux directions tirées : la fractale).
- `src/lot/atelier-peaux.js` (ploxion interne « atelier-peaux ») : la grille (chaque tuile = un petit xer, `data-neurones-variante="_at<i>"`),
  toucher = zoomer (l'écart × 0,5), ⊖ dézoomer (× 2), hasard, ‹ revenir ; les knobs = **jOSKnob du labo** (RS-7 : « on a déjà les jOSKnob » —
  composé, pas refait ; embarqué dans `public/bions/jOSKnob.js` tel que le labo le sert : ça complète aussi beats, spiderion-sim, bras, noyau,
  qfractale, forge-flow) ; la peau « perso » suit en direct ; ✓ garder → `reglages/peaux`, un tsoin « peau ».
- `membrane.js` : `redefinir` (en direct), `appliquerCouleurs` (une peau qui porte ses couleurs ; main.js les suit sur `data-px-variante`) ;
  le dedans en `--n-verre`. `neurones.js` : une peau par groupe, ce qui pousse seulement sur les cellules ≥ 56 px.
- Lot 3 : gothique (ogives), evangelion (bandes d'alerte), eldritch. Faux iPhone : `parcours-atelier.mjs`, `parcours-variantes.mjs` (PX_VARIANTES).
- ⏭ RS-7 : « bientôt réactif au son ; le téléphone vivant : la RAM, la température, le stockage, le calcul, dans les membranes, sans avoir
  besoin de lire l'info » → brancher des gènes sur des signaux (le rapide sur ce qui ne coûte rien : le halo, la respiration ; le lent sur la forme).

**0.95 en cours (22.10, poussé : `b27eaa6`)** — le guide (`src/app/guide.js` : 4 étapes sur la vraie interface, les astuces une fois,
« ⓘ c'est quoi ça ? ») ; l'organique translucide (nerfs, vaisseaux, câbles) ; tous les ploxions (--xr-*) et le HUD (barre, dock, modes, vues)
en membranes ; les bions `src/bions/synapses.js` et `src/bions/membrane.js` ; CINQ PEAUX à comparer (nerfs, vaisseaux, câbles, gelée,
terminal — le hand terminal de The Expanse) : `parcours-variantes.mjs` → `build/fi-var/comparer-5-peaux.png` ; **uniquement la palette de
RS-7** (extraite de ses SVG : #007d28 #37008a #0cdb0c #8bc88b #191919 #222222…). ❓ RS-7 choisit une peau (ou un mélange).
⏭ demandé le 22.10, pas encore fait : les tsoins de xer (le CSS d'un xer figé à un instant, l'historique) ; les koins = des mini trackpads
de zoom ; la map fractale (tout se zoome) ; les vues entrées/sorties des ploxions et des bions (le shim + la pile, `gel.js` `auteur` ;
exécuter chaque bion dans son propre script `bion/<nom>.js` pour les reconnaître) ; 🐛 **le ploxion musique ne joue pas Spotify** ;
la visualisation musicale (avseoul particleEqualizer, dataarts webgl-globe, Chrome Experiments) ; le ploxion morse (googlecreativelab
morse-learn) ; Rust → WASM là où ça calcule vraiment (pas le dessin : WebKit le fait déjà en natif).

**0.94 (22.10)** — le xer organique, le mode de base. RS-7 : « avant on avait le xer ploxi0n, maintenant c'est le xer chill-tekk, l'ancien
thème est gardé tel qu'il était ; le truc de base, c'est que tout le UI entier ait l'air vivant ». Ses planches : `chill-tekk_ui` (des SVG
Figma + des rendus : membranes vert biolumineux / violet qui luisent, gouttes aux coins, verre sombre, tubes entre les cellules, synapses).
- `modes.js` : `organique` en tête de MODES (glyphe `neurone`), le défaut. `prefs.js` : `mode: 'organique'` par défaut ; une fois
  (`organiqueVu`), un chill-tekk enregistré passe à l'organique ; `html.px-organique` ⇔ mode organique (la bascule 0.93 des réglages s'en va).
- `xers.js` : modèle « organique » ; une fois (`xers/snapshot-chill-tekk`), chez qui avait déjà ses xers, une copie du xer actif au mode
  chill-tekk, rangée dans mes xers. ⚠ RS-7 précise ensuite : le snapshot d'un xer = **l'état de son CSS à un moment** (« les tsoins de xer ») :
  à faire (⏭ ci-dessous).
- `neurones.js` : la membrane a son halo (feGaussianBlur posé dessous), 4 px d'épaisseur, des gouttes aux coins des grandes cellules
  (`koinsDe`). app.css : les jetons de l'organique sous `html.px-organique` (--memb vert, --memb2 violet).
- ⏭ (demandé le 22.10, dans l'ordre) : les tsoins de xer (figer le CSS d'un xer, revenir à un instant) ; les koins = des mini trackpads
  pour zoomer / dézoomer le ploxion ; la map fractale (tout se zoome : réseau des hubs → hub → koin/ploxion → ses bions) ; les vues
  entrées/sorties de chaque ploxion et bion (observées par le shim + lues dans le code ; la pile dit qui appelle, `gel.js` `auteur`) ;
  le tuto amélioré au maximum (« les gens me disent que c'est trop compliqué »).

**0.93 (22.10)** — RS-7 : « je veux que les bords soient plus épais, et plus organiques, genre ondulé, mais que les éléments du UI se collent
entre eux comme des neurones ».
- 〰 `src/app/neurones.js` : un groupe `[data-neurones]` (« fin » : un flou court pour les grilles serrées ; `data-neurones-seuil`), ses
  cellules `[data-neurone]` à toute profondeur (un groupe imbriqué garde les siennes). Derrière, une couche SVG `.px-neurones` : la membrane
  (couleur `--n-bord`) et le dedans (`--n-fond`, rétréci de 3 px par feMorphology), passés dans un filtre flou → turbulence FIXE → seuil
  d'alpha (« goo ») ; les synapses = `synapses()` : un arbre (union-find, les plus proches d'abord) + une part fixe de liens en plus. Rien
  n'est redessiné si la géométrie et les couleurs n'ont pas changé (une clé) ; MutationObserver + ResizeObserver, un rAF.
- Les cellules deviennent transparentes (le grain reste). `html.px-organique` (`prefs.organique`, vrai par défaut ; ⚙ › Apparence ›
  Bords organiques) : `--trait` passe à 3 px partout.
- Branché : les koins (la racine, 4 cases + la barre ; la couche à z 40, entre le voile et les cases), la map (la barre du haut, le plan :
  les hubs collés par leurs portails, seuil 64 ; dans chaque hub, ses koins et le centre, « fin »), le système, les ambiances.
- ⚠ les filtres SVG coûtent au dessin, pas à l'affichage : à vérifier sur l'iPhone (la map, le plus gros : ≈ 900 × 900 px). Pas sur
  l'accueil : le thème vivant y fait flotter les icônes par transform, la couche ne les suivrait pas (💭 à faire en les dessinant dans la
  même boucle rAF que le thème vivant).

**0.92 (22.10)** — RS-7 : « une meilleure allure chill-tekk à ces nouveaux changements ; le but c'est que le wormion et le portion soient
comme des trackpads ».
- ○ □ `src/app/pads.js` : `creerPadWormion` (rotation signée autour du centre, un cran tous les 30° = `CRAN_ANGLE`, horaire = plus loin dans
  le passé ; lâcher ouvre, un toucher = l'action `temps`) et `creerPadPortion` (le grain de `creerTexture` du banc trackpad, `directionDe` :
  ← `precedente`, → `suivante`, ↑ `carte`, ↓ `accueil` ; un toucher = la map). `koins.js` : `PADS` rend ces deux cases en surfaces
  (`[data-pad]`) ; main.js fournit `listeTemps` (vivants récents puis endormis, sans l'actuel, 12 max) et `aller`.
- ◇ app.css, du bloc 0.87 à la fin : bande, btop, ambiances (`.px-amb-on` posé par ambiances.js sur le son qui joue), koins, pads, map
  (plaques, `--blob*`, `.px-map-ici` en `--acc2`, la feuille « ＋ un hub »). Que les jetons du thème : les modes suivent.
- Faux iPhone : `parcours-koins.mjs` (tourne le wormion, glisse le portion → la map), `parcours-map.mjs`, `parcours-lot.mjs`, `parcours-bande-niri.mjs`.
- ❓ la vue des xers en carrés aussi ? l'échelle des rangs pour l'icône (toujours au labo).

**0.91 (22.10)** — RS-7 : « la clé APNs sur le labo, les glyphes [pour l'icône du rang], parfait, live activités et widget ».
- 🏝 **Live Activities** : `PloxiActivite` (ActivityAttributes) défini À L'IDENTIQUE dans AppDelegate.swift (`#if canImport(ActivityKit)`) et
  PloxionWidgets.swift ; PloxiApple `activiteDebut/Maj/Fin` (iOS 16.2+) ; la vue `ActivitePloxi0n` (écran verrouillé, Dynamic Island) dans
  l'extension ; Info.plist `NSSupportsLiveActivities`. JS : `src/natif/activites.js` (une activité par clé : dodo, vocal, ambiances, px:<id>) ;
  dodo/réveil passent par le nouveau `surTsoin` de tsoin-natif. ⚙ › Notifications › Activités en direct (`prefs.activites`).
- ▦ **Un ploxion** (widget configurable, AppIntentConfiguration + `PxWidgetEntite`) : Préférences `ploxi0n.px-widgets` → l'AppDelegate copie
  dans l'App Group (ajouté à la liste des clés copiées) → l'extension. JS : `src/natif/widgets-ploxions.js`, `window.jOSWidget.publier`.
  Le journal des tsoins publie « N tsoins aujourd'hui » et un bouton « + tsoin » (`?nouveau=1` ouvre le composeur).
- 🔔 **Push** : `@capacitor/push-notifications` (8.1.3, `cap sync`), l'AppDelegate relaie le jeton
  (`.capacitorDidRegisterForRemoteNotifications`) ; `src/natif/push.js` (POST/DELETE /api/app/push avec le jeton du compte ; les sujets ;
  toucher → `data.ouvrir`). `aps-environment` et la capability étaient déjà là. ⏭ côté labo : **docs/PUSH.md** (la clé .p8, les routes, l'envoi).
- Les Live Activities et le widget ne se voient qu'avec l'extension : un build « widgets » (Codemagic l'a toujours ; GitHub : l'entrée widgets).
- ⏭ l'icône selon le rang, avec les glyphes : il manque l'échelle des rangs (bion → … → xeroction, au labo).
Faux iPhone : `parcours-natif-091.mjs`.

**0.90 (22.10)** — ▦ la map en carrés (RS-7, sur une capture de la vue des xers : « je veux pouvoir me balader comme ça plutôt, avec des
carrés, et faut remplir avec les infos de la map ; je kiffe la map du labo, de pouvoir en créer »). `src/app/map-hubs.js`, ploxion interne
`map` (action des bords `map`, la case portion des koins). Les hubs du labo : `/px/xerkions.json` (template `hub` : center, koins, portals),
par le HTTP natif, gardés dans boxion « map/xerkions ». Les tiens : jOSStore `xerkions-persos` (localStorage `store:xerkions-persos:items` +
`jOSBoxion.save('xerkions-persos','items')`, qui part au labo en mode connecté). `voisins()` : portals[0..3] = droite, gauche, haut, bas,
complétés par le retour des portails des autres, le reste en « d'autres portails ». Un hub = un carré : son glyphe au centre (2×2 d'une
grille 4×4), ses koins dans l'anneau (12 au plus). Faux iPhone : `parcours-map.mjs` (fixture `tests/donnees/xerkions.labo.json`, 12 hubs).
❓ RS-7 : la vue des xers (0.70) passe-t-elle aussi aux carrés, ou la map la remplace-t-elle ?

**0.89 (22.10)** — ◺◿ les koins du carnet de RS-7 (deux pages : `docs/look/references/koins-0*.jpg`, transcrites dans **docs/KOINS.md**,
avec ce qui est posé, ma lecture, et les maillons qui manquent). `glyphes.js` : xeroction, tsoin, wormion, trion, portion redessinés d'après
le carnet, `ploxion` et `xer` ajoutés. `src/app/koins.js` (`prefs.koins`, coupé par défaut) : html.px-koins efface `.px-dock` et la
`.px-barre` d'un ploxion ; deux koins de coin, 4 étapes (`data-etape`), à la dernière deux carrés de deux cases (trion, wormion | xer,
portion) et la barre des glyphes ; les actions passent par le routeur (`faire('carte'|'basculer'|'mes-xers'|'accueil'|'minimiser')`,
`retour()`). Faux iPhone : `parcours-koins.mjs`.

**0.88 (22.10)** — 📚 le lot de ploxions, premier sous-lot (composer d'abord : le registre du labo a déjà `web`, `math`, `xerminal`, `notes`,
`pdf` ; mpv = le lecteur intégré de la 0.49). Nouveaux, internes, hors ligne : `src/lot/systeme.js` (▤ btop : fps mesurés au rAF, Device.getInfo
`memUsed`, `navigator.storage.estimate`, batterie, réseau, latence HEAD jusqu'au labo, et le Swift `PloxiApple.systeme` : thermalState,
isLowPowerModeEnabled, physicalMemory, volumeAvailableCapacityForImportantUsage) ; `src/lot/ambiances.js` (≈ Blanket : 8 sons en Web Audio,
bruits blanc/rose/brun filtrés et modulés ; sortie par un `<audio>` MediaStreamDestination → le routeur voit qu'il joue et ne l'endort pas ;
‹ coupe, ▁ garde). Reste du lot : Foliate (EPUB), coffre Obsidian ; ❓ Zotero (clé), LocalSend (entitlement multicast), AppFlowy (web).
Faux iPhone : `parcours-lot.mjs`.

**0.87 (22.10)** — ▥ la bande façon niri (`src/app/bande.js`, `prefs.bande`, coupée par défaut). Le routeur garde tout (montrer, cacher,
sommeil, pile) et appelle `bande.poser()` à la fin de `montrer()` ; la bande ne pose que `width`/`transform` sur les `.px-hote` (jamais de
déplacement DOM : un iframe se rechargerait). L'ordre : `ordreBande` + `placerDansOrdre` (à droite de `depuis`, le courant au moment
d'`ouvrir`) ; `fileBords` le suit quand la bande est là. Le voisin visible (`.px-bande-voisin`) ne s'endort pas. `glisser()` (l'animation des
bords) est coupé en bande : la transition CSS des colonnes la remplace. La vue d'ensemble : `ouvrirVue()` (échelle 0,34, une ligne qui se
glisse, les endormis en pointillés). Action des bords `bande`. Faux iPhone : `parcours-bande-niri.mjs`.

**0.86 (22.10)** — ⧗ les tsoins remontent au boxion. Le journal boxion_local « tsoins » (tsoins notés, jOSTsoin.mark des ploxions, marketplace,
terrax, xerbot, compte…) restait sur le téléphone. `src/app/remontee-tsoins.js` : modes `non` (défaut), `tsoins` (kind tsoin et vocal), `tout`,
`tampon` (part seulement sur « envoyer ») ; passer de « non » à un mode part de MAINTENANT (« tout depuis le début » pour le passé) ; jOSBoxion
du compte par `distant.appel` (GET /px/boxion/load puis POST save), ns `tsoins-iphone`, clé `<jour>.<appareil>` (`reglages/appareil-id`),
fusion par `seq`, 3000 par document ; curseur dans `reglages/tsoins-remontee-etat`, avancé seulement après un save réussi. « Me demander un
tsoin » : session ≥ 2 min puis pause ≥ 20 min → un mini dock « un tsoin de ta session ? ». ❓ pour RS-7 : partager le journal d'un ploxion au
Nexus ou au chaoxion (où, quel format). Faux iPhone : `parcours-remontee-tsoins.mjs`.

**0.85 (22.10)** — 📤 l'envoi de fichiers par le mode connecté (RS-7 a choisi 8 chantiers de la feuille de route : celui-ci d'abord). Le relais
du shim (`jos.js`) passe maintenant FormData, Blob, ArrayBuffer : `src/shim/corps-fichier.js` → `{ dataType: 'formData' | 'file', data }`, que
`creerHttp().requete` (depot.js) donne à `CapacitorHttp.request` (iOS pose le boundary ; ⚠ le Swift force-déballe `fileName` et `contentType`
d'un fichier : toujours fournis). `src/shim/xhr-relais.js` : un XMLHttpRequest asynchrone vers une route du serveur passe par le fetch du shim
(le FS du labo envoie par XHR pour la progression). `photos.importer` envoie aussi au boxion (`/fs/write`, Photos/) quand `distant.actif()`.
Faux iPhone : `parcours-envoi-fichiers.mjs`. Les 7 autres chantiers choisis (22.10) : tsoins → boxion + journal du mode test, la bande niri,
le lot de ploxions, Live Activities, un widget par ploxion, l'icône selon le rang, les notifications push (APNs : la clé, décision de RS-7).

**0.84 (22.10)** — 🍏🎟 le social avec Apple, pour de vrai. api.j0bot.ch (dépôt J0bot/api-j0bot, `main`) a la porte depuis le 22.10 :
`POST /api/v1/auth/apple` (Apple ID lié → 200 ; nouveau + `code` d'invitation valide → 201, un compte pseudonyme ami de l'inviteur ; nouveau sans
code → 403 `invitation_requise`), `POST /auth/apple/lier` (Bearer), `DELETE /me` `{ confirmer: "supprimer" }`. Côté app (`src/natif/social-apple.js`) :
le code d'un lien `…?px=invite&code=…` qui ouvre l'app est gardé (`liens.js` → `surLien` → boxion « social/invitation ») et part tout seul ; sinon un
panneau sous le bouton (coller le lien ; ou lier avec l'identifiant et le mot de passe de l'écran du social), sans remontrer la feuille d'Apple ;
⚙ › Compte : supprimer le compte du social. ⚠ **CORS** : l'api ne répondait qu'à `*.j0bot.ch`, pas à `capacitor://localhost` → le social du labo
ne pouvait pas lire l'api dans l'app. Corrigé côté api (`config/cors.php`, commit `787b072`, **à redéployer**) ; les appels Apple de l'app passent
déjà par le HTTP natif. Faux iPhone : `parcours-social-apple.mjs` (lien → code gardé → Apple → compte → suppression).

**0.83 (19.10)** — 🔑 le labo connecté tout seul (RS-7, capture du mode xerboxion : « j'ai un code »). Le contrat complet et ce que le labo
doit faire : **docs/CONNEXION-LABO.md**. Côté app : `src/natif/connexion-labo.js` (`adresse(chemin)`, `emballer(url)`) ; `modes.js` : le cadre
naît en `about:blank` avec `data-vers`, la règle du labo (HEAD) puis l'adresse connectée ; `cadres-labo.js` : `connecter(p)` ; main.js enveloppe
`jOSNatif.navigateur` (une adresse du labo → connectée). Un 404 de `/api/app/passe` = la route pas encore là : l'adresse simple jusqu'au
prochain lancement. iOS bloque les cookies tiers d'un cadre : seuls les cookies `Partitioned` (WebKit 26.2+) tiennent → le labo doit poser sa
session ainsi quand `Sec-Fetch-Dest: iframe`. Faux iPhone : `parcours-connexion-labo.mjs` (HEAD avec la nouvelle CSP, le passe simulé).

**0.82 (19.10)** — Le labo a fait les deux corrections demandées (déployées, vérifiées en ligne ici) : la CSP vaut `frame-ancestors 'self'
https://*.j0bot.ch capacitor://localhost` (les cadres du labo s'affichent dans l'app ; une autre app iOS pourrait aussi les encadrer, mais sans
la session de RS-7 : chaque app a ses cookies) ; `/wiki/<slug>?fragment=1` ne rend que `<article class="wiki-app">` (sans `<head>`, donc sans
canonical : le lecteur garde le chemin demandé). ⬡ `/px/icones.json` (l'atelier des glyphes du labo, lu par la coquille avec la session) :
`src/app/icones-labo.js` le lit par `httpRelais` (X-Ploxi0n + Bearer), garde `reglages/icones-labo`, relit au lancement (3 s) et à chaque
vérification des mises à jour (`maj.completer`). `glyphes[{nom, corps}]` → `nettoyerCorps` (DOMParser SVG : path/circle/rect/line/polyline/
polygon/ellipse/g, la géométrie seulement, `class` f/p) → `ajouterGlyphe` (glyphes.js) ; l'icône d'un ploxion = registre ← `tous[id]` ←
`specPerso(mien[id])` ← l'atelier de l'app (main.js `xk`).

**0.81 (19.10)** — ⧉ les ploxions composés et 📖 le wiki. Les captures de RS-7 (Ultimate social : « carte / social / chat indisponible
ici ») : ultimate-social (et socialion, space, stockage, theme, dl) montent leurs sous-ploxions par `jOSApps.monter(id, hôte, ctx)` si
`jOSApps.peut(id)` — le contrat de la coquille du labo (monde.html : charge, peut, ensure, monter → `{ unmount, ready, lazy, robuste, instance }`).
ploxi0n avait `peut = routeur.connait` (installé seulement) → `src/shim/apps-a-la-demande.js` : non énumérables sur jOSApps ; `ensureApp` (main) =
`installerSilencieux` (pack, puis `depot.installer`, sans barre) + `routeur.chargerApp`. Les dépendances : `ploxionsComposes(js)` (les `app: 'x'`,
`jOSApps.monter/ensure('x')`, `jOSApps['x']` lus, pas assignés) ; `depot.installer` rend `composes` et appelle `surInstalle` → installées en fond ;
`depot.dependances()` + `maj.completer` : ce qui manque, à chaque vérification. Le wiki (`src/app/wiki-natif.js`) : la page `/wiki/<slug>`
(3,6 Mo, 1,1 Mo gzippé : toute la coquille du labo) lue en HTTP natif, on garde `.wiki-app` (~30 Ko), nettoyée (`RETIRER`, on*, style,
javascript:) ; `data-wiki` pour les liens internes, `data-externe` pour le reste ; boxion « wiki/<chemin> » (frais 24 h, hors ligne : le cache) ;
`cadres-labo.js` remplace l'iframe /wiki… (même réécrite en https://labo… par le shim) par le lecteur, suit `ploxion.wiki.goto`. Le sommaire
(#ancres) défile sans toucher au # du routeur. Faux iPhone : `parcours-composes.mjs` (le labo simulé : le vrai ultimate-social et le vrai article,
`tests/donnees/`).
**✅ Fait par le labo le 19.10 (voir 0.82)** — demandé alors : (1) la CSP du labo (`frame-ancestors 'self' https://*.j0bot.ch`, config/csp.php) : ajouter
`capacitor://localhost` — alors ideas (/ideas), makelab (/objets/), files et ultimate-files (/boxions), xerkions, universal-suit et phone-test
s'affichent DANS l'app sans rien changer ici (cadres-labo.js le détecte par un HEAD) ; (2) `/wiki/{slug}?fragment=1` qui ne rend que
`.wiki-app` (le lecteur le demande déjà) : 30 Ko au lieu de 1,1 Mo par page.

**0.80 (19.10)** — ↻ les mises à jour des ploxions. Pourquoi « pas à jour directement » : (1) une fois monté, un ploxion restait dans la page
(`W.jOSApps[id]`) : le nouveau code n'était lu qu'au redémarrage → `routeur.oublier(id)` (jOSApps, `script[data-ploxion]`, `style[data-px-css]`),
tout de suite, ou à sa fermeture s'il est vivant (`aOublier`, dans `tuer`) ; le dépôt l'appelle par `surMisAJour` ; (2) une nouvelle version ne
téléchargeait pas ses nouveaux bions → `resoudreBions` dans `aJour` ; (3) iOS pouvait servir une copie en cache → `?maj=<t>` + `Cache-Control:
no-cache` ; (4) le pack restait figé → il suit le labo s'il a mieux (sinon `a-jour` sans erreur). `aJour({ concurrence: 6, ids, progres, auto })` ;
un 404 (`maj-introuvables`) attend 7 jours en automatique. `src/marketplace/mises-a-jour.js` : `reglages/maj` = { auto: true, bions: true, heures: 6 },
`reglages/maj-etat` ; `demarrer()` (20 s après le lancement, un tic toutes les 15 min, au retour dans l'app) ; la section de ⚙ › Ploxions
(`html`/`brancher`). Les bions mis à jour se chargent au prochain lancement (garde `if (window.jOSX) return`, et le moteur partagé du clicker
aussi). Le faux iPhone simule maintenant `CapacitorHttp.get` (304 pour un app.js du labo). Faux iPhone : `parcours-maj.mjs`.

**0.79 (18.10)** — 🏆 Game Center pour le clicker (RS-7 : « j'ai déjà ajouté ça sur le truc Apple »). L'ID du classement n'est écrit nulle
part : `PloxiApple.gameCenterClassements` (`GKLeaderboard.loadLeaderboards(IDs: nil)`) les liste, `choisirClassements` prend celui qui parle
de clicker/xer/score/record (sinon le seul qui n'est pas « Xeroctions » 001 ; « dim » = celui des dimensions). Le score = `floor(max(stats.meilleur,
L) × 100)` (le record en exposant, au centième : il faut « décimal, 2 décimales, plus haut = mieux » dans App Store Connect). Envoyé au plus
toutes les 2 min quand il monte, et en partant ; les derniers envoyés sont dans boxion « reglages/game-center ». `gameCenterOuvrir` :
`GKAccessPoint.shared.trigger(leaderboardID:playerScope:timeScope:)` (iOS 18), sinon `trigger(state: .leaderboards)`. Le routeur a
`boutonsBarre(id)` (🏆 pour xp et clickion). Signatures vérifiées contre la doc d'Apple (JSON). **🦀 Décision de RS-7 : plus tard, Rust
uniquement (Bevy…) : `docs/RUST.md`.**

**0.78 (18.10)** — ◈ le clicker et le Clickion en natif. Les VRAIS bundles du labo (`/px/xp/app.js`, `/px/clickion/app.js`, format 2) sont
copiés tels quels dans `public/ploxions/{xp,clickion}/app.js` (+ `public/bions/jOSGame.js`, sans réseau) ; `index.json` : `"labo": true` →
`installerLocal` garde `origine` = le labo, donc ↻ tout mettre à jour les suit (sinon `pack` reste figé). Les deux embarquent le même moteur
`jOSXerClicker` (script 1, identique) et partagent `xb:xpclick` + boxion `xp/idle` (le shim : boxion_local) + `window.__xpPartie`.
`src/jeu/clicker-natif.js` : `toucherRapide` (le routeur ne fait jamais de clic droit sur `.xc-coeur/[data-orb]/.ck-cube/[data-cube]` d'un hôte
xp/clickion) ; `installerToucherRapide` (pointerdown → un click synthétique par doigt, le click d'iOS qui suit avalé) ; le moteur enveloppé par
un `defineProperty` sur window (son `production(ctx)` donne le contexte) → `auRetour()` rattrape l'absence quand seul le Clickion est monté ;
`px.clicker` publié (jOSRaccourcis.valeur, toutes les 60 s et en partant). `src/app/silence.js` : pour `PLOXIONS_QUI_FUIENT` (xp), les écouteurs
window/document posés pendant le mount sont décrochés à l'unmount. `bionsTouches` ignore un bion que le code définit lui-même
(jOSXerClicker : 404 de 3,5 Mo évité). Faux iPhone : `parcours-clicker.mjs` (7 touchers à 3, 2, 1, 1 doigts = 7).
**À corriger dans le labo (RS-7, pas d'accès ici)** : xp L1044 le `visibilitychange` jamais retiré ; xp `vueDefis` et clickion ck-verrou
utilisent `data-aller` (réservé au routeur de l'app, sans effet tant qu'ils sont dans `.px-hote`) ; clickion ne rattrape qu'au mount (ajouter
`C.rattraper` sur visibilitychange visible) et n'affiche jamais le gain d'absence ; clickion › ferme : `dessiner()` complet chaque seconde tant
qu'une parcelle est mûre ; l'élan (watchPosition haute précision) continue quand l'app est cachée ; le textarea d'export en 11 px (iOS zoome) ;
le tic de xp tourne et écrit le localStorage chaque seconde même caché.

**0.77 (18.10)** — § mes xers (`src/app/xers.js`, ploxion interne `mes-xers`). Un xer = `{ prefs (PREFS_XER seulement : pas haptique,
Calme, vivants, sommeil), hud, accueil (routeur.docAccueil / chargerAccueil), fond (sa photo à part : boxion « xers/fond:<id> », fond.poserImage),
barre, ploxions }` ; boxion « xers/liste », « xers/actif ». Basculer : garderActif() puis poser() puis `jos:xer` + bus `ploxion.xer.change`
(le contrat du ploxion xer-switch du labo). Partager : JSON → deflate-raw (CompressionStream) → base64url, `…/app/ouvrir/mes-xers?app=1&x=z…`
(≈ 600 caractères, QR jusqu'à 2000) ; recevoir : `nettoyerXer` (clés et types connus, actions des bords connues), jamais posé sans toucher.
`installerAbsent(id)` dans main.js (partagé avec routeurProxy). Faux iPhone : `parcours-xers.mjs`. Corrigé : `.px-h-b:has(>.xki)` sans taille
hors du dock (un épinglé géant dans la barre d'un ploxion).

**0.76 (18.10)** — ✉ inviter · partager. La cause du zbeul : les ploxions du labo font leurs liens avec `location.origin`
(`capacitor://localhost` dans l'app). `src/app/liens-publics.js` répare à chaque SORTIE (feuille de partage, presse-papiers, jOSNatif.partager/
copier, le bion jOSQR enveloppé par un `defineProperty` sur window, les champs readonly observés) : `…/local?px=<id>&…` → `https://labo.j0bot.ch/px/<id>?…`
(lien universel, l'AASA couvre `/px/*`). Et à l'ENTRÉE : `lienRecu` (`/px/`, `/app/ouvrir/`, `?px=`, `/join?inv=` → le ploxion invitation,
`ploxi0n://px/`) ; le routeur pose `params.lien` dans `location.search` le temps du montage (là où les ploxions lisent `code`, `join`, `cur`).
`src/app/partage.js` : `creerInvitation` (POST /api/v1/invites, Bearer `jos_social_token`, HTTP natif), la feuille (QR `PloxiApple.qr`,
CIQRCodeGenerator), le ploxion interne `inviter`. Faux iPhone : `parcours-partage.mjs`.

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

- **(18.10) Plus tard, du Rust uniquement**, « avec du Bevy ou autre truc » : le code neuf vise Rust (WASM et natif) ; le chemin est dans `docs/RUST.md`.

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
