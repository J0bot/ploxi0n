# ploxi0n

**Le xerboxion dans ta poche.** ploxi0n est l'app iPhone (et Android) qui fait tourner les ploxions du xerboxion en natif, hors ligne d'abord :
tes données vivent sur le téléphone, le labo (labo.j0bot.ch) s'ajoute quand tu es connecté. Version : voir `package.json` (0.99.65 au 14.11.2026).

Ce fichier est la carte. Le détail de chaque chantier vit dans `docs/` ; l'historique, dans `docs/FEUILLE-DE-ROUTE.md` (une entrée par
version) et dans les commits (chaque commit est un tsoin du nexus).

---

## 1. Le vocabulaire en trente secondes

| mot | dans l'app |
|---|---|
| **ploxion** | une app du xerboxion (mappion, coord, Proche, Autour…) : un module JS monté dans l'app (`mount` / `unmount`) |
| **bion** | un bloc réutilisable, pur quand c'est possible (`src/bions/`, ceux du labo dans `public/bions/`) |
| **xer** | une façon d'habiter l'app : organique, chill-tekk (par défaut), xerboxion, xerbot (`src/app/modes.js`) |
| **koin** | les triangles des coins du bas : un toucher les ouvre en quatre cases (trion, hypercube, wormion, portion) ; entre eux, la bande des glyphes `‹ › ⧗ ○ △ □ ◇ ✕ ⓘ ▁` (`src/app/koins.js`, `docs/KOINS.md`) |
| **tsoin** | une trace : ce que tu fais, ce que tu notes ; le journal (`docs/TSOINS.md`) |
| **boxion** | le stockage : `boxion_local` sur le téléphone (SQLite chiffré), ton boxion au labo en mode connecté |
| **Proche / le maillage** | les téléphones autour, sans internet (Bluetooth), le protocole public Maille v1 (`docs/protocole/MAILLE-v1.md`) |
| **xerion** | une personne, un compte (RS-7, RS-3…) ; jamais de prénoms dans le code ni les docs |

## 2. Comment c'est construit

```
iPhone / Android · Capacitor 8 · une WebView
  ├── l'app (src/main.js)            le démarrage : prefs, boxion, routeur, koins, modes, natif, ploxions internes
  ├── le routeur (src/app/routeur.js) ouvrir, minimiser, basculer les ploxions ; les animations (zoom depuis l'icône)
  ├── le shim jOS (src/shim/)        ce qu'un ploxion du labo attend (jOSApps, jOSPorts, jOSBoxion, fetch…) ; en mode connecté,
  │                                  ses appels serveur partent au labo par le relais HTTP natif (src/marketplace/depot.js)
  ├── boxion_local (src/boxion-local/) get / put / del / list / append : SQLite chiffré sur l'iPhone, IndexedDB en dev, mémoire en test
  └── le natif (src/natif/ + ios/App/App/AppDelegate.swift)
        plugins maison : PloxiApple (Live Activities, Siri…), PloxiVeille (position, pas, capteurs), PloxiProche / PloxiBLE (maillage),
        PloxiRegard (suivi de la tête), PloxiOndes… ; extensions : PloxionWidgets (widgets, Live Activities, Centre de contrôle),
        PloxionNotifs (notifications riches)
```

Les ploxions viennent de trois endroits : **internes** (écrits ici, `src/lot/`, `src/app/…` : Proche, Autour, Notifs, réglages…),
**embarqués** (`public/ploxions/` : coord, bother, clickion… copiés du labo, marchent hors ligne), et **installés** depuis le catalogue du
labo (le marketplace, gardés sur le téléphone).

## 3. Où est quoi

| dossier | contenu |
|---|---|
| `src/main.js` | le démarrage, et le câblage de tout (lire ses commentaires : chaque bloc dit d'où il vient) |
| `src/app/` | l'interface : routeur, koins, modes (les xers), xer xerboxion natif, vue des xers (le dézoom 3 × 3), carte, glyphes, nouveautés, CSS (`app.css`) |
| `src/lot/` | les ploxions internes : Proche, Autour, Notifs, synthé, banc des animations, système, ambiances… |
| `src/bions/` | les bions purs et testés : maille (le protocole), carte des nœuds, zones de la veille, glyphe à graine (jOSGlyphe), potes, autour… |
| `src/natif/` | les ponts vers le natif : veille, activités, notifications, push, raccourcis, widgets… (un plugin Capacitor est un Proxy : `surPromesse`) |
| `src/shim/` | le shim jOS et le relais (fetch, XHR, fichiers) |
| `src/marketplace/` | le dépôt : catalogue du labo, installation, HTTP natif |
| `public/` | les ploxions embarqués et les bions du labo servis tels quels |
| `ios/` | le projet Xcode : `App/App/AppDelegate.swift` (tous les plugins), `PloxionWidgets/`, `PloxionNotifs/`, `Raccourcis.swift` (Siri) |
| `android/` | le projet Android (PloxiBLE.java pour le maillage) |
| `ref/c/` | l'implémentation C de référence du maillage (et un nœud ESP32) |
| `tests/` | ~490 tests (node --test, jsdom) |
| `tools/` | le faux iPhone (`tools/faux-iphone/`), les vecteurs du protocole, le nexus des tsoins, les audits |
| `docs/` | tout le reste (§ 6) |
| `fastlane/`, `.github/workflows/` | la CI : build iOS sur un Mac de GitHub, TestFlight, l'APK Android |

## 4. Travailler dessus

```bash
npm ci                 # une fois
npm test               # les tests (~490), quelques minutes
npm run build          # le bundle (dist/)
npx vite preview --port 4173 &
node tools/faux-iphone/faux-iphone.mjs http://localhost:4173/ build/fi --script tools/faux-iphone/parcours-koins.mjs
```

- **Le faux iPhone** charge l'app avec le vrai `native-bridge.js` de Capacitor et les plugins tels que le Swift les déclare : il voit les bugs
  du pont natif que le navigateur ne voit pas. Un parcours par chantier (`tools/faux-iphone/parcours-*.mjs`), `--android` pour Android.
- **Une version** : `package.json` (+ le lock), `VERSION` dans `src/main.js`, une entrée dans `src/app/nouveautes.js`, la ligne « Dernière mise
  à jour » de `docs/FEUILLE-DE-ROUTE.md`, puis `node tools/tsoins-nexus.mjs`.
- **Le Swift ne se compile pas sans Mac** : du Swift minimal, derrière `#available` / `#if canImport` ; le `.pbxproj` ne se modifie que par
  fastlane ; un nouveau fichier Swift de l'app va dans `AppDelegate.swift`. Les règles complètes : `CLAUDE.md`.

## 5. Lancer un build

- **iOS (TestFlight)** : GitHub › Actions › le workflow iOS › « Run workflow » sur la branche voulue. Les options :
  - `widgets` : widgets, Live Activities, boutons du Centre de contrôle ;
  - `notifs` : notifications riches ;
  - `ble` : le maillage en arrière-plan ;
  - `carplay` ;
  - `vlc` : le lecteur VLC ;
  - `regenerer_profil` : après un changement de capabilities.

  Sans le droit de lancer le workflow, un commit poussé avec `[build]` dans son message le lance aussi (`[widgets]`, `[notifs]` : avec ces
  extensions) ; RS-1 construit un « lot du jour » chaque soir. Le détail : `docs/TESTFLIGHT.md`, `docs/PUBLIER.md`.
- **Android** : l'APK se construit à chaque push (`docs/ANDROID.md`).
- **Les clés** (APNs `.p8`, certificats) ne sont jamais dans le dépôt : secrets de la CI et serveur du labo seulement.

## 6. Les docs, par sujet

| sujet | docs |
|---|---|
| état et passation | `docs/CONTEXTE.md`, `docs/FEUILLE-DE-ROUTE.md`, `docs/plan-suite.md`, `docs/BRAINDUMP.md` |
| vision, look | `docs/VISION-ORIGINELLE.md`, `docs/LOOK.md`, `docs/KOINS.md`, `docs/ANIMATIONS.md` |
| le maillage | `docs/protocole/MAILLE-v1.md`, `docs/PROTOCOLE-MAILLE.md`, `docs/ULTIMATE-BLUETOOTH.md`, `docs/PROCHE-SECTION.md` |
| cartes et lieux | `docs/MAPION.md`, `docs/BRIEF-MAPPION.md`, `docs/TERRAX.md`, `docs/MES-APPAREILS.md` |
| labo, compte, partage | `docs/CONNEXION-LABO.md`, `docs/SOCIAL-APPLE.md`, `docs/CONTACTS-ET-PARTAGE.md`, `docs/MISSIONS-ADMIN.md` |
| notifications | `docs/PUSH.md` (le contrat avec le labo) |
| emoji et glyphes | `docs/BANQUE-EMOJI.md` |
| natif | `docs/SANTE.md`, `docs/CARPLAY.md`, `docs/LECTEUR.md`, `docs/XERBOT.md`, `docs/DRONE.md`, `docs/LANGUES.md` |
| publier | `docs/APP-STORE.md`, `docs/PUBLIER.md`, `docs/TESTFLIGHT.md`, `docs/CONFIDENTIALITE.md` |

## 7. Ce qui attend (au 15.11)

- confirmer sur l'iPhone le Swift des versions 0.99.58 à 0.99.65 (Centre de contrôle, mini-carte, veille), build avec `widgets` ;
- côté labo : la route push « build », le verrou de coord, la banque d'emoji (xerxion1), les droits au rang xerboxion ;
- le ploxion Contacts et l'extension de partage (deux décisions dans `docs/CONTACTS-ET-PARTAGE.md`) ;
- brancher les animations choisies au banc (passer, koin, feuille, xer) et refaire le wormion.

*Ne pas nuire.*
