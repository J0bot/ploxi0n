# ploxi0n : règles pour les agents

L'app iOS (Capacitor 8) qui fait tourner les ploxions du xerboxion sur l'iPhone, en natif. RS-7 écrit en français ; répondre en
français, dans le vocabulaire du xerboxion (ploxion, bion, tsoin, boxion, xer, kion, chill-tekk…).

**Lire d'abord `docs/CONTEXTE.md`** (la passation de la dernière session : ce qui est fait, où, ce qui reste, les pièges) puis
`docs/FEUILLE-DE-ROUTE.md` (tenue à jour à chaque version).

## Avant chaque commit

- `npm ci` (une fois) · `npm test` (≈ 100 tests, jsdom) · `npm run build`.
- Ce qui touche le chemin iPhone : **le faux iPhone** (`npm run build && npx vite preview --port 4173 &` puis
  `node tools/faux-iphone/faux-iphone.mjs http://localhost:4173/ build/fi --script tools/faux-iphone/parcours-<x>.mjs`) — le vrai
  `native-bridge.js` de Capacitor + les plugins tels que le Swift les déclare. Le navigateur et jsdom ne voient PAS les bugs du pont natif.
- Une version = `package.json` + `VERSION` de `src/main.js` + une entrée de `src/app/nouveautes.js` + la feuille de route
  + `node tools/tsoins-nexus.mjs` (les commits = les tsoins du nexus, embarqués dans le passé).

## Les pièges déjà payés

- **Un plugin Capacitor est un Proxy sur iOS** : ne JAMAIS le rendre depuis une fonction `async` (`await` appelle `.then()` →
  « not implemented on ios »). Utiliser `surPromesse()` (`src/natif/plugin-sur.js`). Un plugin de l'app ne s'enregistre qu'une fois
  (`src/natif/plugins-app.js`).
- **Le Swift ne se compile pas ici** (pas de Mac) : du Swift minimal, relu ligne par ligne ; ce qui dépend d'un paquet optionnel entre
  `#if canImport(…)` ; les gros morceaux derrière une option de build (`PLOXI0N_WIDGETS`, `PLOXI0N_VLC`). Le .pbxproj se modifie par
  fastlane (gem xcodeproj), jamais à la main. Un nouveau fichier Swift de l'app : dans `AppDelegate.swift` (sinon le projet ne le voit pas).
- **Les noms partagés avec le routeur** : `data-retour` et `data-aller` sont interceptés par `src/app/routeur.js` (les réglages utilisent
  `data-rg-retour`, `data-rg-aller`) ; une classe posée sur `<html>` ne doit pas être celle d'un composant (`px-vivant` → `px-anime`).
- Vite + Capacitor : pas de `this` global dans un module ; pas d'`import … .json` (les tests Node ne le lisent pas : exporter un objet JS).
- PowerShell 5 (Windows de RS-7) : `>` écrit en UTF-16.
- **Pas de prénoms** (RS-7, 13.11) : voisins simulés, tests, exemples de doc, textes de l'app → des identifiants neutres (RS-3, RS-4,
  xerion-1, xerion-2), jamais « Tom » ou « Léa ».

## Git

Travail sur la branche donnée par la session ; jamais de push sur `main` sans accord. Pas de PR sans demande.
