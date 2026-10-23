# Les tsoins du xerboxion : la route du labo (0.97)

RS-7, 23.10 : « le but du wormion et du portion, c'est de se balader entre les tsoins : ses propres tsoins, les tsoins du nexus, les tsoins du
xerboxion entier, ou les ultra-tsoins, pour voir les paliers d'existence, voir d'où on vient, l'histoire, comment on a extrapolé depuis le
début ». Et : « les tsoins du nexus, c'est les commits ».

Le passé (`src/lot/passe.js`, ○ dans les koins) a quatre portées :

| portée | d'où ça vient | état |
| --- | --- | --- |
| les miens | l'iPhone : visites (journal `passe`), tsoins, le xer qui change (journal `xer`, « revenir à cet instant »), les ploxions installés et mis à jour | ✅ |
| le nexus | les commits de ploxi0n, embarqués (`src/app/tsoins-nexus.js`, écrit par `node tools/tsoins-nexus.mjs`) | ✅ (ce dépôt seulement) |
| les ultra | les paliers d'existence : les commits de version, depuis la 0.10 | ✅ |
| le xerboxion | le labo : la route ci-dessous | ⏭ côté labo |

Les commits des dépôts privés (boxion-rt, my_website2…) ne voyagent PAS dans l'app (elle est publique) : ils passeront par cette même route,
avec le compte (`portee=nexus`).

## La route

`GET /api/app/tsoins?portee=xerboxion|nexus&avant=<ms>&limite=200` (le garde des routes de l'app : le jeton de `/api/app/moi`, en en-tête)

```json
{ "tsoins": [ { "t": 1761200000000, "qui": "rs-7", "k": "idée", "d": "la map dans le temps", "ploxion": "map" } ] }
```

- `t` en millisecondes ; triés du plus récent au plus ancien ; `avant` pour reculer (le défilement du passé).
- `xerboxion` : les tsoins publics de tout le xerboxion (ce que chacun a choisi de partager).
- `nexus` : les commits des dépôts du xerboxion que le compte peut voir (sujet → `k`, dépôt → `d`, auteur → `qui`).
- Sans compte : `401`. Rien à montrer : `{ "tsoins": [] }`.
