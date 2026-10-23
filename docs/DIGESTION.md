# La digestion des ploxions : tout natif ou en Rust (RS-7, 23.10)

> « Le plus de truc en Rust possible pour plus opti, et tu codes mieux en Rust. »
> « Le but, c'est de prendre tous les ploxions et de les rendre natifs le plus possible. Tout doit être natif ou en Rust : une digestion
> automatique des ploxions. »

C'est **voulu** par RS-7. Ce qui suit est **mesuré** (0.99.17), sauf ce qui est marqué *proposé*.

## Ce que la mesure dit (avant de choisir)

**1. Où l'app passe son temps.** Le profileur de Chromium a tourné pendant un démarrage à froid et un tour de l'app : la map et ses zooms,
le neurone, les réglages, le marketplace, Autour, le synthé, une autre langue. Le parcours est `tools/faux-iphone/parcours-profil.mjs`.

| | tour normal | 120 ploxions de 600 Ko |
|---|---|---|
| le JS de l'app (temps propre) | ~0,4 s | ~0,6 s |
| WebKit / Chromium lui-même (mise en page, style, peinture : « program ») | 3,5 s | 7,2 s |
| octets à travers le pont natif | | 171 Mo, puis **71 Mo** après les corrections du 0.99.17 |

Le JS de l'app ne pèse presque rien. Le coût vient de deux endroits :
- **le pont natif** : chaque lecture du stockage traverse le pont en JSON sur le fil principal. C'était le gel de la 0.99.6, et c'était
  encore 30 relectures de l'index et 2 à 3 relectures complètes de chaque ploxion pendant le tour (corrigé en 0.99.17 : 0 relecture) ;
- **le rendu de la vue web**.

**2. Le Rust dans la vue web ne va PAS plus vite.** `tools/rust-banc.mjs` fait le même travail en JS et dans le cœur Rust
(`rust/ploxi-coeur`, en WASM) :

| travail | JS | Rust (WASM) |
|---|---|---|
| lire une case d'OpenStreetMap (400 lieux) | 0,56 ms | 3,8 ms |
| trier 400 lieux | 0,07 ms | 2,2 ms |
| proposer | 0,13 ms | 1,7 ms |
| traduire 175 textes | 0,17 ms | 0,20 ms |

Le travail lui-même est minuscule ; c'est la **porte** qui coûte (copier le texte vers le WASM, le relire en JSON, et le retour). Conclusion :
le Rust ne gagne que là où il n'y a **plus de vue web du tout**. C'est exactement « tout natif ».

**3. De quoi les ploxions sont faits.** Le digesteur (`rust/ploxi-digest`) lit le code de chaque ploxion public du labo, sans l'exécuter.
La récolte est faite par `tools/digestion/recolter.mjs`. L'état complet est dans `docs/DIGESTION-ETAT.md`, régénéré par `npm run digerer`.
Résumé dans la section « L'état » plus bas.

## Les quatre voies (ce que le digesteur décide pour chaque ploxion)

- **compose** : son interface vient de bions. Un rendu natif des bions suffit : les bions les plus composés d'abord, et chaque bion natif
  libère d'un coup tous les ploxions qui le composent.
- **dessin** : il dessine lui-même (canvas 2D, WebGL, three.js). Un canvas natif (wgpu → Metal) sous sa logique, qui reste du JS.
- **dom** : il fabrique son interface en HTML (`innerHTML`, `createElement`). C'est la grande majorité. Un **moteur de rendu natif** du
  sous-ensemble de HTML et de CSS qu'ils utilisent, sous leur JS inchangé. Le digesteur mesure ce sous-ensemble : quelles balises, quelles
  API du DOM, quel CSS (flex, grid, absolute, transform…).
- **web** : il embarque le web (iframe) ou fabrique du code à la volée (eval). Il reste dans une vue web, dans une coquille native.

## La forme proposée (*proposé*, pas décidé)

Un ploxion = son JS (la logique) + ce qu'il touche (le DOM, le canvas, les bions, le stockage). La digestion automatique ne réécrit pas le
JS. Elle remplace **tout ce que le JS touche** par du natif :

1. **Le cœur natif** : le stockage, le bus, les bions de service (boxion, ports, tsoins) en Rust. Ils vivent dans le même processus que le
   JS, sans pont JSON. C'est le palier 1 de docs/RUST.md : le cœur boxion-rt pour `aarch64-apple-ios`. La bibliothèque iOS du cœur se
   compile déjà ici (`rust/ploxi-coeur`, 6 Mo, sans Mac).
2. **Le JS dans JavaScriptCore** : le moteur JS d'iOS, embarqué, sans vue web. ⚠ Sans JIT : iOS ne l'autorise qu'aux vues web. Le JS des
   ploxions ira plus lentement, mais il ne pèse presque rien (point 1 de la mesure).
3. **Le rendu natif** : un DOM et un CSS en Rust (Stylo pour le CSS, Taffy pour flex et grid, Parley pour le texte, Vello / wgpu pour
   dessiner, Metal sur l'iPhone), avec un canvas 2D natif pour la voie « dessin ». Composer, ne pas rebâtir :
   - **Servo** (crates.io, 0.1 LTS en 2026) est un vrai moteur, mais iOS n'est pas dans ses plateformes ;
   - **Blitz** (DioxusLabs : Stylo + Taffy + Parley + Vello) est taillé pour ça, mais encore pré-alpha.
   Il faut l'un des deux, ou leurs briques.
4. **Le digesteur dans l'app** : à l'installation, il décide de la voie de chaque ploxion. Un ploxion dont tout ce qu'il touche existe en
   natif tourne en natif ; sinon il reste dans la vue web, avec la liste de ce qui lui manque. La part native grandit à chaque brique, pour
   tous les ploxions d'un coup.

## Le désaccord à trancher (challenge, pas flagornerie)

- **« Natif = plus opti » n'est pas automatique pour la voie « dom ».** WebKit est un moteur de rendu C++ très optimisé, accéléré par le
  GPU. Un moteur Rust jeune ne le battra pas tout de suite sur le rendu. Le gain sûr est ailleurs :
  - plus de pont (le stockage dans le même processus) ;
  - la maîtrise totale (Bevy, Metal, l'arrière-plan) ;
  - une seule pile Rust partout (labo, boxion-rt, iPhone, Android).
- **C'est un chantier de plusieurs mois**, par paliers livrables : le cœur natif, puis la voie « compose », puis « dessin », puis « dom ».
- **L'autre chemin** : la traduction ploxion par ploxion (des agents qui réécrivent chaque ploxion en Rust, vérifiés par des parcours
  comparés au faux iPhone). Il est automatique lui aussi, mais coûteux pour chaque ploxion, et un ploxion traduit ne suit plus son original
  du labo. Le moteur natif, lui, garde les ploxions du labo tels quels.

## Construit (0.99.17)

- `rust/ploxi-coeur` : les bions purs (proche, autour, dire) en Rust. Une seule porte (`px_appel(nom, json)`), la même pour le WASM et le
  C d'iOS. `cargo test` ; la preuve `tools/rust-golden.mjs` (6 818 cas : le Rust rend exactement ce que rendent les bions JS, le cap au
  11ᵉ chiffre près) dans `npm test`. Elle a déjà trouvé un vrai bug JS : un `null` du réseau faisait planter `lireVehicules`.
- `rust/ploxi-digest` : le digesteur (un lexeur JS, les relevés, la voie, la part native). Il digère tous les ploxions du labo en quelques
  centièmes de seconde.
- `tools/rust-banc.mjs` (JS contre Rust), `tools/faux-iphone/parcours-profil.mjs` (où va le temps, qui lit quoi à travers le pont),
  `npm run rust`.

## L'état (la récolte du 23.10 : les 551 ploxions publics du labo, 10,8 Mo de code, digérés en 0,07 s)

| voie | ploxions | part | couvert par un rendu natif générique |
|---|---|---|---|
| compose | 32 | 6 % | 95 % |
| dessin | 26 | 5 % | 79 % |
| dom | 453 | **82 %** | 74 % |
| web | 40 | 7 % | 29 % |

- **Le sous-ensemble à rendre en natif est étroit et net.**
  - Balises : `div` (542), `b`, `button`, `span`, `input`, `a`, `small`, `canvas` (100), `textarea`, `select`, `label`, `img`, `svg` (49).
  - CSS : `display:flex` (531), `position:absolute` (272), `display:grid` (181), `transform` (299), des variables CSS (315), `@media` (131).
  - Plus rares, donc plus tard : `filter` (70), `backdrop-filter` (19), `clip-path` (7).
  - API du DOM : `innerHTML` (547), `querySelector`, `createElement`, `addEventListener`, `classList`, `style`.
- **Les bions à rendre natifs d'abord** : jOSPorts (104 ploxions), jOSBoxion (78), jOSMobile (23), jOSEngine (11). Les 5 premiers
  suffisent à 23 des 32 ploxions « compose ».
- **Le stockage hors bions** : localStorage (225), sessionStorage (112). Le cœur natif doit les fournir (le shim le fait déjà dans la vue web).
- **Le natif demandé** : caméra et micro (18), vibration (12), géolocalisation (10), mouvement (6), Bluetooth (5).
- **Restent web (40)** : ceux qui embarquent une page (youtube, archive, wayback, vscode, stremio, wiki…) ou fabriquent du code (eval).

Le détail de chaque ploxion est dans `build/digestion/digestion.json`. Le résumé complet est dans `docs/DIGESTION-ETAT.md`. Les deux sont
régénérés par `npm run digerer`.

## Questions à RS-7

- Le moteur natif (la forme proposée, des mois, garde les ploxions du labo intacts) ou la traduction ploxion par ploxion (des agents,
  coûteux, des ploxions qui divergent) ? Ou les deux : le moteur pour la masse, la traduction pour les ploxions phares (le clicker, le synthé…) ?
- Servo (complet, sans iOS) ou les briques de Blitz (taillées pour, jeunes) ?
- La voie « web » (les iframes : youtube, code, files…) : elle reste web, d'accord ?
