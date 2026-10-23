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

## La direction de RS-7 : que des bions

> « Des fois il faut rebâtir certaines choses, quand il y a assez de bions pour que le ploxion soit uniquement fait de bions et pas d'autre
> chose. C'est là le challenge : que les ploxions soient faits que de bions. » « Il faut que l'entièreté du projet devienne de plus en plus
> optimisée, pour que ça tourne partout ultra smooth. »

Ça tranche la question. **Natif = chaque bion a sa version native (Rust).** Un ploxion fait **uniquement** de bions tourne donc en natif
d'office, partout (iPhone, Android, labo, boxion-rt), sans moteur HTML à bâtir. Le chemin :

1. **Mesurer la pureté** : ce qui, dans chaque ploxion, n'est pas un bion. C'est le digesteur (section « La bionisation » de
   docs/DIGESTION-ETAT.md).
2. **Extraire les bions déguisés** : le code recopié d'un ploxion à l'autre est déjà un bion qui s'ignore. Le digesteur les trouve tout
   seul, même recopiés en changeant les noms. Chacun devient un bion du labo, une seule fois.
3. **Rebâtir les ploxions** pour qu'ils composent ces bions. C'est une réécriture automatique quand c'est mécanique : la définition locale
   remplacée par le bion. À la main, ou par des agents vérifiés, quand c'est une interface.
4. **Un ploxion pur = une définition** (des données qui disent quels bions, câblés comment), comme les bions déclaratifs que boxion-rt a
   déjà en Rust (`sdk::block`, `sdk::house`, `sdk::port` : « depuis une seule Def const, il génère… »). Composer ceux-là, ne pas les
   rebâtir. La définition se rend en natif sur l'iPhone, dans la vue web ailleurs : le même ploxion, deux rendus.
5. **Les bions natifs d'abord, ceux qui libèrent le plus de ploxions** : jOSPorts (104), jOSBoxion (78), jOSMobile (23)…

Les quatre voies (compose, dessin, dom, web) restent la mesure de la distance qui sépare chaque ploxion de la pureté.

### Les premiers bions à extraire (la récolte du 23.10)

| bion à créer | ce qu'il remplace | ploxions |
|---|---|---|
| échapper le HTML (`esc`, `escA`, `esc2`, `e2`, `escq`…) | 21 variantes de la même ligne | **254** |
| ouvrir un autre ploxion (`openPx`, `openApp`, `openPlx`) | des variantes de jOSMobile.open | ~35 |
| le jeton CSRF (`csrf`) | la même fonction | 25 |
| un message bref (`toast`, `flash`, `note`, `say`) | | ~30 |
| `byId` et ses alias (`tabById`, `blocById`…) | | 14 |
| **un cubion** : le moteur de la machine à tsoins (`Machine` et 249 fonctions) | recopié en bloc | 3 (machine-a-tsoins, tsoin-4d, ultimate-tsoin) |
| `mergeInto` | le même code dans excel, powerpoint, word | 3 |

9 % de tout le code des ploxions est une fonction copiée telle quelle d'un autre ploxion. Ce n'est que le **début** de la bionisation :
- **le reste à confier à des bions** :
  - l'interface (547 ploxions) : les bions d'interface, à tirer des gabarits répétés ;
  - localStorage (328) → jOSBoxion ;
  - le réseau (216) → jOSPorts ou un bion de service ;
  - le dessin (86) → un bion de scène ;
  - le son (34) → un bion de son ;
- **4 ploxions sur 551** sont déjà faits que de bions.

### « Ultra smooth partout » : la règle

Mesurer, puis corriger ce que la mesure montre (`parcours-profil.mjs`, `parcours-lourd.mjs`, `rust-banc.mjs`, le digesteur), jamais à
l'intuition. Le 0.99.17 l'a montré : on croyait le JS lent, c'étaient le pont et les relectures. Chaque version garde ces mesures au vert.

## Construit (0.99.17)

- `rust/ploxi-coeur` : les bions purs (proche, autour, dire) en Rust. Une seule porte (`px_appel(nom, json)`), la même pour le WASM et le
  C d'iOS. `cargo test` ; la preuve `tools/rust-golden.mjs` (6 818 cas : le Rust rend exactement ce que rendent les bions JS, le cap au
  11ᵉ chiffre près) dans `npm test`. Elle a déjà trouvé un vrai bug JS : un `null` du réseau faisait planter `lireVehicules`.
- `rust/ploxi-digest` : le digesteur (un lexeur JS, les relevés, la voie, la part native). Il digère tous les ploxions du labo en quelques
  centièmes de seconde.
- La bionisation (`rust/ploxi-digest/src/bionisation.rs`), sur tous les ploxions à la fois, en 0,5 s : les fonctions recopiées d'un ploxion
  à l'autre (même renommées), regroupées en familles et en moteurs entiers ; les gabarits HTML répétés ; le reste de chaque ploxion
  (`reste`, `pur`). Sorties : `build/digestion/bionisation.json` et la section « La bionisation » de docs/DIGESTION-ETAT.md.
- `tools/rust-banc.mjs` (JS contre Rust), `tools/faux-iphone/parcours-profil.mjs` (où va le temps, qui lit quoi à travers le pont),
  `npm run rust`.

## Le bilan de santé (0.99.20)

`tools/faux-iphone/parcours-tous.mjs` ouvre les 551 ploxions publics du labo, un par un, dans le faux iPhone, avec leur vrai code et
leurs vrais bions (`tools/digestion/recolter.mjs`, `recolter-bions.mjs` : 160 bions, en suivant les bions des bions). Pour chacun : a-t-il
planté au montage, ses erreurs, est-il resté vide, une vignette. En 3 morceaux : `PX_TOUS_DE=0 PX_TOUS_N=190` ; quelques-uns, avec la pile
des erreurs : `PX_TOUS_IDS=chill,tsoin`.

**530 / 551 sains.** Corrigé dans l'app, parce que ça touchait beaucoup de ploxions d'un coup :
- `jOS3D` n'était pas reconnu comme un bion (un chiffre après « jOS ») : 11 ploxions sans leur 3D ;
- `jOSApps.rs.mount(…)` (un ploxion qui en monte un autre) : ni installé comme dépendance, ni chargé avant ;
- `jOSTsoin` : l'enregistreur du labo (sessions) manquait ;
- les données publiques du labo (`/px/*.json`) ne partaient pas au labo hors mode connecté.

Le reste :
- **du côté du labo** : `mesures` (son `jOSLedger` porte le nom d'un autre bion), `iobions` (`describe()` au chargement) ;
- **ils attendent quelque chose** : 8 ploxions attendent une zone (« ouvre 🫧 zone ») ; notes, calendar, ideas sont des pages du labo
  (le mode connecté) ;
- **le réseau de la session de test** : leaflet (cdnjs), quetes et cubionlink (le faux labo ne les connaît pas).

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

- Extraire les premiers bions dans le labo (esc, ouvrir un ploxion, csrf, toast), puis réécrire automatiquement les ploxions qui les
  recopient : c'est un autre dépôt (my_website2), donc rien n'y sera poussé sans ton accord. D'abord un essai à blanc, qui montre les
  changements sans rien écrire ?
- La forme d'un ploxion pur : une définition comme les `Def const` de boxion-rt (en Rust), ou un JSON que le labo, l'app et boxion-rt lisent ?
- La voie « web » (les iframes : youtube, code, files…) : elle reste web, d'accord ?
