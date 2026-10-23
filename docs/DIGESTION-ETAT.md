# L'état de la digestion des ploxions

*Généré par `npm run digerer` (rust/ploxi-digest) : ne pas éditer à la main. Le sens : docs/DIGESTION.md.*

551 ploxions digérés (10.8 Mo de code) en 1.51 s.

| voie | ploxions | part | couvert par un rendu natif générique (moyenne) |
|---|---|---|---|
| compose | 179 | 32 % | 95 % |
| dessin | 26 | 5 % | 79 % |
| dom | 306 | 56 % | 74 % |
| web | 40 | 7 % | 29 % |

En tout : un rendu natif générique couvrirait en moyenne **78 %** de chaque ploxion sans travail propre à lui.

**Les bions, par nombre de ploxions qui les composent (les rendre natifs d'abord)** : jOSApps (551) · jOSPorts (245) · jOSBoxion (130) · jOSMobile (100) · jOSXerkionHub (93) · jOSGame (43) · jOSStore (41) · jOSTsoin (38) · jOSOp (37) · jOSSound (33) · jOSFiles (21) · jOSForge (14) · jOSXerPrefs (14) · jOSPorte (13) · jOS3D (11) · jOSEngine (11) · jOSTheme (11) · jOSVeille (11) · jOSZone (11) · jOSCarte (10) · jOSAppareil (9) · jOSChart (9) · jOSCiv (9) · jOSPartage (9) · jOSPulse (8) · jOSQR (8) · jOSWikiLink (8) · jOSKnob (7) · jOSPlug (7) · jOSWindows (7)

**Couverture** : 5 bions → 136 / 179 ploxions « compose » entièrement natifs ; 10 bions → 146 / 179 ploxions « compose » entièrement natifs ; 20 bions → 160 / 179 ploxions « compose » entièrement natifs ; 40 bions → 168 / 179 ploxions « compose » entièrement natifs 

**Les balises qu'un rendu natif doit savoir faire** : div (542) · b (451) · style (416) · button (399) · span (398) · input (263) · a (162) · small (144) · i (103) · canvas (100) · textarea (99) · option (92) · select (90) · label (84) · p (79) · h3 (65) · img (62) · h4 (51) · svg (49) · code (48) · iframe (33) · h2 (30) · li (30) · video (27) · ul (25) · pre (24) · table (23) · td (23) · tr (23) · form (13) · ol (13) · details (11) · summary (11) · audio (7) · h1 (4) · (élément perso) (1)

**Les API du DOM** : innerHTML (547) · querySelector (428) · createElement (423) · appendChild (419) · textContent (418) · addEventListener (378) · setAttribute (372) · getElementById (351) · classList (277) · querySelectorAll (249) · style (224) · focus (101) · dataset (87) · getBoundingClientRect (85) · removeChild (38) · append (16) · scrollIntoView (14) · insertAdjacentHTML (11) · createElementNS (4) · outerHTML (3) · prepend (2) · scrollTo (1)

**Le CSS** : display:flex (531) · overflow (404) · var(-- (315) · transform (299) · position:absolute (272) · display:grid (181) · box-shadow (173) · gradient (162) · transition (154) · @media (131) · animation (74) · filter (70) · @keyframes (67) · position:sticky (26) · position:fixed (23) · backdrop-filter (19) · clip-path (7) · mask (1)

**Le dessin** : requestAnimationFrame (85) · canvas2d (80) · webgl (11) · three.js (7)

**Le réseau** : fetch (216) · XHR (3) · EventSource (2) · WebSocket (1)

**Les hôtes appelés** : labo.j0bot.ch (15) · repoverse.j0bot.ch (11) · www.w3.org (7) · doi.org (6) · fr.wikipedia.org (4) · git.j0bot.ch (4) · api.j0bot.ch (3) · maps.apple.com (3) · web.archive.org (3) · www.youtube-nocookie.com (3) · 127.0.0.1:8730 (2) · antoinedaniel.bandcamp.com (2) · api.crossref.org (2) · api.open-meteo.com (2) · archive.org (2)

**Le stockage hors bions** : localStorage (225) · sessionStorage (112) · indexedDB (2)

**Le natif demandé** : caméra / micro (18) · vibration (12) · géolocalisation (10) · mouvement (6) · Bluetooth (5) · Worker (1)

**Du son** : 34 ploxions · **de la vidéo** : 27 · **pas d'enregistrement jOSApps** : 0

**Restent web** (40) : 3d, archive, archive-org, atelier, auberge, calendar, code, cubions, explorateur, files, filesystem, finance, flow, html, ideas, instagram, knowledge, labo, makelab, math, miroir, nexusmap, notes, phone-test, player, plugions, premier-ploxion, reglages, spherion, spiderion-sim, stremio, strudel-live, ultimate-files, universal-suit, viewer, vscode, wayback, web, wiki, xerkions

## La bionisation : que des bions

**4 / 551 ploxions** sont déjà faits que de bions. **9 %** du code de tous les ploxions est une fonction copiée telle quelle d'un autre ploxion (2216960 jetons en tout).

**Ce qui manque pour qu'ils soient purs** (nombre de ploxions) : des bions d'interface (547) · jOSBoxion (328) · un bion réseau (jOSPorts, ou un bion de service) (216) · un bion de scène (86) · jOSNatif (43) · reste web (40) · un bion de son (34)

### Les plus répandues : des familles de fonctions recopiées (toutes variantes réunies) → un bion chacune

| fonction | ploxions | variantes | jetons |
|---|---|---|---|
| `esc` | 254 | 21 | 87 |
| `escA` | 48 | 2 | 53 |
| `esc2` | 29 | 2 | 51 |
| `csrf` | 25 | 1 | 64 |
| `e2` | 21 | 2 | 49 |
| `escq` | 21 | 2 | 49 |
| `openPx` | 20 | 5 | 130 |
| `toast` | 16 | 5 | 46 |
| `P` | 14 | 1 | 41 |
| `SINKget` | 14 | 1 | 41 |
| `blocById` | 14 | 1 | 41 |
| `blockColor` | 14 | 1 | 41 |
| `byId` | 14 | 1 | 41 |
| `tabById` | 14 | 2 | 41 |
| `openApp` | 8 | 2 | 105 |
| `flash` | 7 | 1 | 44 |
| `note` | 7 | 1 | 44 |
| `say` | 7 | 1 | 44 |
| `ytSearch` | 5 | 1 | 73 |
| `onclick` | 5 | 2 | 47 |
| `open` | 5 | 1 | 44 |
| `tst` | 5 | 1 | 43 |
| `toStremio` | 4 | 1 | 172 |
| `evaluate` | 4 | 1 | 152 |
| `publish` | 4 | 1 | 145 |

### Les plus grosses : du code recopié en bloc (un moteur entier → un bion, ou un cubion)

| fonction | jetons | ploxions | copie | viennent avec | aussi nommée | exemples |
|---|---|---|---|---|---|---|
| `Machine` | 30070 | 3 | telle quelle | 249 |  | machine-a-tsoins, tsoin-4d, ultimate-tsoin |
| `esc` | 63 | 91 | telle quelle | 0 |  | analyse, antoine-daniel, apparence, appel, asd, atlas |
| `esc` | 53 | 48 | renommée | 0 | escA | admin-boxion, agora, alternatives, amis, archive-org, auberge |
| `esc` | 53 | 44 | telle quelle | 0 | escA | agora, alternatives, amis, archive-org, auberge, banc-test |
| `esc` | 87 | 26 | telle quelle | 0 |  | amis, analyse, appel, asd, bord, capsule |
| `csrf` | 64 | 25 | telle quelle | 0 |  | blocs, caisson, carte, chat, dedup, files3d |
| `esc` | 51 | 29 | telle quelle | 1 | esc2 | audio-convert, bouffe, branches, cablage, courses, cuisine |
| `esc` | 49 | 21 | telle quelle | 1 | e2, escq | apis, cahier-rs7, cluster, discord, films, git |
| `openApp` | 105 | 8 | telle quelle | 1 | openPx | ask, bouffe, cuisine, forge, frigo, galaxion |
| `api` | 260 | 3 | telle quelle | 0 |  | invite, social, socialion |
| `toStremio` | 172 | 4 | telle quelle | 0 |  | asimov, jules-verne, naruto, one-piece |
| `mergeInto` | 221 | 3 | telle quelle | 0 |  | excel, powerpoint, word |
| `esc` | 55 | 12 | telle quelle | 0 |  | ask, claude, code, coord, dj, murion |
| `openPx` | 130 | 5 | telle quelle | 0 |  | blocs, digestion, phares, shipyard, word-import |
| `evaluate` | 152 | 4 | telle quelle | 4 |  | bord, iobions, mesures, xerfarm |
| `byId` | 41 | 14 | renommée | 0 | tabById, P, SINKget, blocById, blockColor | blocs, connexions, graphe, lanceur, logique, nexus |
| `roundRect` | 101 | 4 | renommée | 0 | rr | jeux, logique, planete-bowl, surfaces |
| `ytSearch` | 73 | 5 | telle quelle | 1 |  | bob-lennon, fuzeiii, pink-guy, squeezie, vald |
| `when` | 121 | 3 | telle quelle | 0 |  | ask, claude, murion |
| `openPx` | 116 | 3 | telle quelle | 3 |  | rv-chat, rv-code, rv-issues |
| `openPlx` | 86 | 4 | telle quelle | 1 |  | antoine-daniel, clyde-vanilla, saga-mp3, survivaure |
| `jAdd` | 85 | 4 | renommée | 1 | journalAdd | attracteurs, enhance, logique, physique |
| `esc` | 83 | 4 | telle quelle | 0 |  | dashboard, enrolements, nexus-live, speedrun |
| `openPx` | 81 | 4 | telle quelle | 0 |  | boxions, contribuer, dev-ploxions, histoire |
| `esc` | 45 | 7 | telle quelle | 0 |  | flo, foot, mots, onboarding, rosa, traduction |

### Les bions d'interface : des gabarits HTML répétés (la même ossature de balises et de classes)

| ossature | ploxions | exemples |
|---|---|---|
| `b>b>b` | 7 | dj, higgs, invitation, math, rocq, squeezie |
| `button.lnk>span>span>b>small>span.arr` | 3 | antoine-daniel, clyde-vanilla, survivaure |
| `div.hd>b>span.sub` | 6 | asimov, jules-verne, naruto, nolan, one-piece, sillage |
| `div.mat__diffbox>table>tr>th>th>th` | 3 | machine-a-tsoins, tsoin-4d, ultimate-tsoin |
| `select.mat-sel>option>option>option>option>option` | 3 | machine-a-tsoins, tsoin-4d, ultimate-tsoin |
| `aside.mat__tiroir>div.mat__tir-tete>b>span.mat-voix>button.mat-b` | 3 | machine-a-tsoins, tsoin-4d, ultimate-tsoin |
| `button>button>button` | 5 | compositeur, cuisine, musee, musique, zone |
| `div.cv__sec>span>span` | 5 | civ, compteurs, documents, finances, taches |
| `section>h3>div.grid` | 5 | asimov, jules-verne, naruto, one-piece, sillage |
| `div.cv__jg>div>small>b` | 3 | compteurs, demenagement, finances |
| `div.mat__confirme>span>div.mat-btns>button.mat-b` | 3 | machine-a-tsoins, tsoin-4d, ultimate-tsoin |
| `div.mat__diff>div.mat__ligne>span.mat-k>span.mat-v` | 3 | machine-a-tsoins, tsoin-4d, ultimate-tsoin |
| `div.mat__min>div.mat__titre>b>span` | 3 | machine-a-tsoins, tsoin-4d, ultimate-tsoin |
| `div>div.mat__ligne>span.mat-k>span.mat-v` | 3 | machine-a-tsoins, tsoin-4d, ultimate-tsoin |
| `p>code>div.mat-btns>a.mat-b` | 3 | machine-a-tsoins, tsoin-4d, ultimate-tsoin |
| `p>code>div.mat-btns>button.mat-b.mat-b--plein` | 3 | machine-a-tsoins, tsoin-4d, ultimate-tsoin |
| `section>h3>div.stats` | 4 | jules-verne, naruto, one-piece, sillage |
| `svg>path.m-tes.m-tes--in>path.m-tes.m-tes--lien>path.m-tes.m-tes--out` | 3 | machine-a-tsoins, tsoin-4d, ultimate-tsoin |
| `svg>path>circle>span` | 3 | machine-a-tsoins, tsoin-4d, ultimate-tsoin |
| `tr>td>b` | 4 | asd, ultimate-boxion, universal-suit, xerax |
| `div.fact>b>small` | 3 | antoine-daniel, clyde-vanilla, survivaure |
| `div.mat-btns>button.mat-b.mat-b--plein>button.mat-b` | 3 | machine-a-tsoins, tsoin-4d, ultimate-tsoin |
| `div.mat__carte.mat__combi>div.mat__ligne>span.mat-k` | 3 | machine-a-tsoins, tsoin-4d, ultimate-tsoin |
| `div.mat__hublot>div.mat__hub-tete>div.mat__hub-host` | 3 | machine-a-tsoins, tsoin-4d, ultimate-tsoin |
| `div.mat__ligne>b>button.mat-b` | 3 | machine-a-tsoins, tsoin-4d, ultimate-tsoin |
| `div.mat__titre>b>span` | 3 | machine-a-tsoins, tsoin-4d, ultimate-tsoin |
| `div.stat>b>span` | 3 | jules-verne, naruto, sillage |
| `div>div.mat__prog>i` | 3 | machine-a-tsoins, tsoin-4d, ultimate-tsoin |
| `div>div>div` | 3 | carte, symbiose, veille |
| `div>h3>div.row` | 3 | antoine-daniel, clyde-vanilla, survivaure |
