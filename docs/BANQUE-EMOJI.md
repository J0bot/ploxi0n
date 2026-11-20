# La banque d'emoji du xerboxion (à construire avec xerxion1)

*14.11.2026, écrit depuis ploxi0n (0.99.59). RS-7 : « on a notre propre banque d'emoji à faire, faut voir avec xerxion1 pour ça ». Ce document
pose les chiffres et une proposition. Rien n'est poussé dans le labo : c'est à xerxion1 (et à RS-7) de dire oui, non, ou autrement.*

## Où on en est

- **Dans l'app (0.99.56)** : sans-emoji passe sur tous les ploxions, ceux du labo compris. Un emoji du dictionnaire (`DEPUIS_EMOJI`,
  `src/app/glyphes.js`) devient son glyphe ; un emoji inconnu devient un **glyphe à graine** (jOSGlyphe, `src/bions/glyphe-seed.js`). Il est
  stable et tiré comme un xerkion (les six palettes, les trois centres), mais il ne veut rien dire. Ce que les gens écrivent (`[data-ecrit]`, les
  champs) garde ses signes.
- **Le labo** : l'atelier des glyphes (`glyphed` : revue au jOSSwipe, corriger, dessiner au trait), le sprite `public/glyphs/xerboxion_glyphs.svg`,
  les icônes `/px/icones.json` que l'app lit déjà (`src/app/icones-labo.js`).

## Les chiffres (les ploxions du labo, branche `feat/ploxion-theme` du 12.11)

`node tools/compter-emoji.mjs <resources/views/ploxions + resources/data> docs/banque-emoji/labo.json` :

- **657 emoji différents**, **12 265 occurrences** ;
- **64** ont déjà un glyphe dans le dictionnaire de l'app : **34 %** des occurrences ;
- les **50** plus fréquents sans glyphe en plus → 65 % ; **100** → 77 % ; **150** → 84 % ; **300** → 94 %.

Les plus fréquents sans glyphe : ⚠ 324 · 🌀 175 · ↔ 172 · 🧊 132 · 🛰 130 · ⬇ 122 · 🧠 117 · 👁 108 · 🛠 103 · 🔊 102 · 🎛 101 · 🚀 99 · 🔷 96 ·
⏳ 93 · 💡 90 · ↩ 88 · 🌌 87 · 🔗 84 · ✅ 84 · ⚒ 82 · 🖼 76 · 🎯 74 · 📊 72 · 🔬 67 · ✨ 66 · 🗑 65 · 🧬 63 · 🌱 63 · ⭐ 59 · 💧 58 · 🔮 58 · ❓ 57…
La liste entière, triée, avec les ploxions où chacun apparaît : `docs/banque-emoji/labo.json`.

Dessiner 150 glyphes suffit donc à couvrir plus de 8 occurrences sur 10. Le reste peut garder son glyphe à graine.

## La proposition

1. **Un seul fichier, servi par le labo** : `/px/emojis.json` = `{ "<emoji>": { "glyphe": "<nom>", "corps": "<svg viewBox 100>"?, "source":
   "lexique" | "dessin" | "graine", "valide": true | false } }`. Le nom renvoie au lexique (`ion`, `koin`, `portion`…) ou à un glyphe dessiné
   dans l'atelier (son corps SVG, au trait, `currentColor`, comme ceux de `/px/icones.json`).
2. **La revue dans l'atelier des glyphes** (un onglet « emoji » dans `glyphed`) : les emoji de `labo.json`, du plus fréquent au moins fréquent,
   un par carte jOSSwipe :
   - **→ ♥** : le glyphe proposé va ;
   - **← ✎** : en choisir un autre dans le lexique, ou le dessiner sur la grille ;
   - **↑ ★** : parfait, on le garde tel quel.

   Le premier glyphe proposé : un mot du lexique quand c'est évident (🔗 → `partager`, 🔍 → `chercher`, ⏳ → `tsoin`, 🧠 → `neurone`,
   🌀 → `wormion`), sinon la graine.
3. **La graine est la même partout** : `public/bions/jOSGlyphe.js` (ploxi0n, généré depuis `src/bions/glyphe-seed.js`, `window.jOSGlyphe`) à
   servir au labo par `/px/bion-app/jOSGlyphe.js`. Le labo, le xer et l'app tirent alors le même glyphe pour un emoji encore sans dessin.
4. **L'app lit la banque** comme elle lit déjà `/px/icones.json` : au démarrage, gardée hors ligne. Chaque entrée validée rejoint
   `DEPUIS_EMOJI` ; sans réseau, le dictionnaire embarqué et la graine suffisent.
5. **Le labo aussi** : son propre « sans emoji » (le hook `inconnu` de `sans-emoji.js` existe déjà pour lui) lit le même fichier.

## Ce qu'il faut à xerxion1 pour décider

- Le format de `/px/emojis.json` (ci-dessus) : il va, ou il préfère étendre `/px/icones.json` ?
- Qui dessine les 150 premiers : RS-7 dans `glyphed`, un agent qui propose et RS-7 qui valide au swipe, ou les deux ?
- Servir `jOSGlyphe.js` depuis `/px/bion-app/` (comme jOSKnob, jOSSwipe, jOSXerkion).
