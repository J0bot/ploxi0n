# ploxi0n

Les ploxions du xerboxion sur iOS, **100 % hors ligne** : les données vivent sur le téléphone (un mini-Boxion embarqué, `boxion_local`), et un Boxion distant s'ajoute en option. La porte d'entrée la plus simple de l'écosystème : on installe l'app, on a ses ploxions.

Le brief de référence est « ploxi0n — brief agents v1 iOS » (11.10.2026). Ce dépôt en suit les décisions actées : Capacitor, CI GitHub Actions sur runner macOS, TestFlight, agents sur le Boxion.

## Comment ça marche

```
iPhone · Capacitor + WKWebView
  ploxions JS (classe A)  ── mount / unmount, droit au silence
        │
  shim jOS                ── jOSApps, jOSPorts, jOSTsoin, jOSBoxion, jOSb, jOS.openPloxion, isDesktop()=false, fetch local
        │
  boxion_local            ── SQLite chiffré sur l'iPhone · IndexedDB en dev · mémoire en test
        ├── HealthKit (jour 2+)          ── tsoin_sante, lecture seule, sur accord
        └── Boxion distant (option)      ── pull/apply signé, plus tard
```

- **`src/boxion-local/`** : l'interface unique `get / put / del / list / watch / append / lire`. Les journaux `xion` et `tsoins` sont append-only et horodatés : ils deviennent la file de sync quand un Boxion est appairé.
- **`src/shim/jos.js`** : ce qu'un ploxion du labo attend, réimplémenté en local. Le bus `jOSPorts` livre tout de suite et journalise dans `xion`. `jOSTsoin.mark` et `POST /chat {kind:tsoin}` écrivent dans `tsoins`. `/xion/snapshot` est reconstruit depuis le journal. `jOSBoxion` garde l'API du labo (111 ploxions s'en servent). Le `localStorage` est recopié dans `boxion_local` et restauré au démarrage, parce qu'iOS peut purger celui de la WebView. L'identité est locale. Toute autre route du serveur répond `503 {horsLigne:true}` **sans toucher le réseau** et s'inscrit dans le journal `manques`. Une URL externe part sur le réseau : ce sont les ploxions « online only ».
- **`src/app/routeur.js`** : l'accueil, ouvrir un ploxion, revenir. Un seul ploxion monté à la fois ; revenir appelle `unmount`.
- **`public/ploxions/<id>/`** : les ploxions embarqués, extraits du labo en bundles statiques (degré D3). **`public/vendor/jOSb.js`** : le vrai runtime partagé des ploxions, copié du labo.

## Les outils (lecture seule du labo)

| Commande | Effet |
| --- | --- |
| `npm run audit` | le tri des ~560 ploxions : type, degré, Blade restant, appels réseau, bions, classe A/B/C → `ploxions-audit.csv`, `ploxions-audit.md` (top des routes appelées par les B, candidats A) |
| `node tools/compat-ploxions.mjs` | monte VRAIMENT chaque candidat dans le shim, en mode avion, puis démonte et mesure : erreurs, fuites (droit au silence), réseau, bions absents → `ploxions-compat.csv`, `ploxions-compat.md` |
| `npm run extraire` | du labo vers `public/ploxions/` : les ploxions de `ploxions.embarques.json` (refuse un ploxion qui contient encore du Blade) |

## Tests

`npm test` (Node 22) :

- **contrat de `boxion_local`** : la même suite sur la mémoire, IndexedDB (`fake-indexeddb`) et SQLite. Le SQL de l'iPhone est exécuté par `node:sqlite`.
- **contrat du shim** (jsdom) : le bus, les tsoins, `/xion/snapshot`, les routes manquantes sans réseau, l'identité, `jOSBoxion`, et le **test hors ligne de référence simulé**. On écrit en mode avion, on tue l'app, iOS purge le localStorage, on relance : la donnée, le tsoin et le bus sont là.
- **montage** : chaque ploxion embarqué monte, vit et se démonte sans rien laisser (intervalles, rAF, écouteurs, blobs), sans aucune requête sortante.

Le test sur appareil (TestFlight, mode avion, HealthKit) se fait sur l'iPhone.

## Développer

```
nvm use 22            # Node 22 (Capacitor 8) ; sur le Boxion : ~/.local/opt/node22/bin
npm ci
npm run dev           # le web dans un navigateur (boxion_local = IndexedDB)
npm test
npm run build && npx cap sync ios
```

## Publier sur TestFlight (CI)

Un push sur `main` lance `.github/workflows/ios.yml`. Les tests tournent sur Linux ; s'ils passent, le build se fait sur macOS et `fastlane beta` envoie sur TestFlight.

À faire une fois, par RS-7 :

1. Dans App Store Connect, créer l'app : bundle id `ch.j0bot.ploxi0n`, nom « ploxi0n ».
2. Créer une clé API App Store Connect (rôle Admin ou App Manager, avec accès aux certificats) et télécharger le `.p8`.
3. Dans les secrets du dépôt GitHub, poser `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8` (le contenu du fichier) et `APPLE_TEAM_ID`. Ces secrets ne vont jamais sur le Boxion ni dans un agent.
4. Option `match` (un dépôt de certificats) : `MATCH_GIT_URL`, `MATCH_PASSWORD`, `MATCH_GIT_BASIC_AUTHORIZATION`. Sans eux, la signature est gérée par Apple à travers la clé API.

En dépôt privé (GitHub Pro), une minute macOS compte pour 10. Il faut compter environ 300 minutes macOS par mois, et un build iOS en prend 10 à 15.

## Points ouverts

- La licence du dépôt (MIT comme anatomie-ploxion, ou AGPL comme la plupart des papiers).
- Les 3 à 5 ploxions à embarquer : RS-7 les choisit dans `ploxions-compat.md`.
- La conformité export de l'app (le chiffrement local de SQLite) : App Store Connect pose la question à chaque build tant que `ITSAppUsesNonExemptEncryption` n'est pas dans l'Info.plist. C'est une déclaration légale : à trancher par RS-7.
- Jour 2 et suivants : la piste santé (HealthKit, `tsoin_sante`), l'installation depuis le marketplace, l'appairage d'un Boxion distant, le shim WASM.
