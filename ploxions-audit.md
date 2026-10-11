# Audit des ploxions pour ploxi0n v1

Généré par `tools/audit-ploxions.mjs` depuis `config/ploxions.php` du labo. 563 entrées, dont 538 activées.

| | toutes | activées |
| --- | --- | --- |
| classe A | 418 | 403 |
| classe B | 94 | 91 |
| classe C | 51 | 44 |
| écran | 562 | 537 |
| à URL | 1 | 1 |
| sans app.blade.php | 0 | 0 |
| degré D0 | 4 | 4 |
| degré D1 | 497 | 476 |
| degré D3 | 55 | 51 |
| degré D4 | 7 | 7 |
| Blade restant | 45 | 43 |
| A sans aucun bion réseau (hors ligne tel quel) | 295 | 284 |
| A avec un bion réseau (le shim le branche sur boxion_local) | 123 | 119 |
| utilise le bus (jOSPorts) | 236 | 227 |

## Les routes les plus appelées par les ploxions B

Si quelques routes reviennent dans la majorité des B, les réimplémenter dans le shim fait basculer un gros paquet en A.

| route (2 premiers segments) | ploxions B |
| --- | --- |
| `/px/os` | 8 |
| `/px` | 7 |
| `/local` | 7 |
| `/` | 7 |
| `/px/repoverse` | 6 |
| `/home` | 6 |
| `/openscad/render` | 6 |
| `/px/jetons` | 4 |
| `/px/boxion` | 4 |
| `/repos/slug` | 4 |
| `/repos` | 4 |
| `/coord` | 3 |
| `/px/tsoins` | 3 |
| `/px/nexus` | 3 |
| `/wiki/paper` | 3 |
| `/share-media` | 3 |
| `/links` | 3 |
| `/identity/switch` | 2 |
| `/api/identity` | 2 |
| `/api/identities` | 2 |
| `/px/dashboard` | 2 |
| `/ploxions` | 2 |
| `/toggle` | 2 |
| `/px/xion` | 2 |
| `/xer` | 2 |
| `/px/space-cubion` | 2 |
| `/px/telexion` | 2 |
| `/join` | 2 |
| `/px/tsoin-images` | 2 |
| `/px/vision` | 2 |

## Les bions les plus utilisés

| bion | ploxions |
| --- | --- |
| `jOSApps` | 562 |
| `jOSPorts` | 236 |
| `jOSBoxion` | 111 |
| `jOSMobile` | 106 |
| `jOSXerkionHub` | 93 |
| `jOSStore` | 49 |
| `jOSGame` | 44 |
| `jOSWire` | 40 |
| `jOSOp` | 37 |
| `jOSTsoin` | 37 |
| `jOSXui` | 33 |
| `jOSFiles` | 21 |
| `jOSForge` | 16 |
| `jOSXerPrefs` | 14 |
| `jOSPorte` | 13 |
| `jOSCarte` | 13 |
| `jOSChart` | 12 |
| `jOSEngine` | 12 |
| `jOSTheme` | 11 |
| `jOSVeille` | 11 |
| `jOSZone` | 11 |
| `jOSSound` | 10 |
| `jOSApi` | 10 |
| `jOSQR` | 9 |
| `jOSPlug` | 9 |
| `jOSPulse` | 9 |
| `jOSCiv` | 9 |
| `jOSSocial` | 8 |
| `jOSPartage` | 8 |
| `jOSWikiLink` | 8 |

## Candidats à embarquer (classe A, écran, sans Blade, pas admin) : 351

Du plus léger au plus lourd ; RS-7 en choisit 3 à 5.

| ploxion | octets | bus | bions réseau | autres bions |
| --- | --- | --- | --- | --- |
| 🍅 `pomodoro` (Pomodoro) | 1419 | non | — | jOSApps |
| ✈ `veille-avions` (Avions) | 1666 | non | jOSVeille | jOSApps |
| 📻 `veille-radios` (Radios) | 1668 | non | jOSVeille | jOSApps |
| 🌍 `veille-seismes` (Séismes) | 1678 | non | jOSVeille | jOSApps |
| 🪖 `veille-bases-mil` (Bases mil) | 1695 | non | jOSVeille | jOSApps |
| 🪖 `veille-avions-mil` (Avions mil) | 1704 | non | jOSVeille | jOSApps |
| 🛰 `veille-satellites` (Satellites) | 1704 | non | jOSVeille | jOSApps |
| 🚀 `veille-lancements` (Lancements) | 1704 | non | jOSVeille | jOSApps |
| ⚡ `trouver` (Trouver) | 1744 | non | — | jOSApps jOSMobile |
| ⬢ `xerbions` (Xerbions) | 1760 | non | — | jOSApps jOSMobile |
| 🎮 `xerworld` (Xerworld) | 1770 | non | — | jOSApps jOSMobile |
| 📺 `tv` (TV) | 1788 | non | — | jOSApps jOSMobile |
| ▦ `xerkion-ui` (UI) | 1827 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-jeu` (Jeu) | 1830 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-vie` (Vie) | 1830 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-code` (Code) | 1833 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-jeux` (Jeux) | 1833 | non | — | jOSApps jOSXerkionHub |
| 🧊 `xerkion-3d` (Monde 3D) | 1833 | non | — | jOSApps jOSXerkionHub |
| 🔬 `xerkion-labo` (Labo) | 1833 | non | — | jOSApps jOSXerkionHub |
| 📖 `xerkion-lore` (Lore) | 1833 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-crea` (Créa) | 1834 | non | — | jOSApps jOSXerkionHub |
| 🍻 `xerkion-fete` (Fête) | 1834 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-agent` (Agent) | 1836 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-audio` (Audio) | 1836 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-ferme` (Ferme) | 1836 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-rendu` (Rendu) | 1836 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-robot` (Robot) | 1836 | non | — | jOSApps jOSXerkionHub |
| 🧬 `xerkion-bions` (Bions) | 1836 | non | — | jOSApps jOSXerkionHub |
| ⚒ `xerkion-forge` (Forge) | 1836 | non | — | jOSApps jOSXerkionHub |
| ⧗ `xerkion-temps` (Temps) | 1836 | non | — | jOSApps jOSXerkionHub |
| 🌍 `xerkion-terre` (Terre) | 1836 | non | — | jOSApps jOSXerkionHub |
| 🌸 `xerkion-sante` (Santé) | 1837 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-01` (Xerkion 01) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-02` (Xerkion 02) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-03` (Xerkion 03) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-04` (Xerkion 04) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-05` (Xerkion 05) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-06` (Xerkion 06) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-07` (Xerkion 07) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-08` (Xerkion 08) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-09` (Xerkion 09) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-10` (Xerkion 10) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-11` (Xerkion 11) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-12` (Xerkion 12) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-13` (Xerkion 13) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-14` (Xerkion 14) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-15` (Xerkion 15) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-16` (Xerkion 16) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-17` (Xerkion 17) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-18` (Xerkion 18) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-19` (Xerkion 19) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-20` (Xerkion 20) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-21` (Xerkion 21) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-22` (Xerkion 22) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-23` (Xerkion 23) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-24` (Xerkion 24) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-25` (Xerkion 25) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-26` (Xerkion 26) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-27` (Xerkion 27) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-28` (Xerkion 28) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-29` (Xerkion 29) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-30` (Xerkion 30) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-31` (Xerkion 31) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-32` (Xerkion 32) | 1838 | non | — | jOSApps jOSXerkionHub |
| 🛠 `xerkion-dev` (Atelier dev) | 1838 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-bouffe` (Bouffe) | 1839 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-boxion` (Boxion) | 1839 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-outils` (Outils) | 1839 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-profil` (Profil) | 1839 | non | — | jOSApps jOSXerkionHub |
| ▦ `xerkion-son` (Arbre à son) | 1839 | non | — | jOSApps jOSXerkionHub |
| 🕹 `xerkion-arcade` (Arcade) | 1839 | non | — | jOSApps jOSXerkionHub |
| 🗂 `xerkion-bureau` (Bureau) | 1839 | non | — | jOSApps jOSXerkionHub |
| 🚀 `xerkion-espace` (Espace) | 1839 | non | — | jOSApps jOSXerkionHub |
| 🎚 `xerkion-io` (Capteurs & I/O) | 1839 | non | — | jOSApps jOSXerkionHub |
| 〰️ `xerkion-signal` (Signal) | 1839 | non | — | jOSApps jOSXerkionHub |
| 🎉 `xerkion-social` (Social) | 1839 | non | — | jOSApps jOSXerkionHub |
| 🎞️ `xerkion-cinema` (Cinéma) | 1840 | non | — | jOSApps jOSXerkionHub |
| 🎓 `xerkion-etudes` (Études) | 1840 | non | — | jOSApps jOSXerkionHub |
| 🎒 `hotbar` (Inventaire) | 1840 | non | — | jOSApps jOSMobile |
| ▦ `xerkion-data` (Pipeline data) | 1842 | non | — | jOSApps jOSXerkionHub |
