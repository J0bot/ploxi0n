# Toutes les langues, et le mode humain (braindump de RS-7, 23.10)

*Capture fidèle. Rien n'est construit. Ce qui est **voulu**, ce qui **existe déjà**, ce qui **coince**, et une proposition.*

## Ce que RS-7 a dit

- **Que ça fonctionne avec toutes les langues.**
- **Un mode humain** : **zéro texte**, que des **glyphes lisibles par un humain** et des **fonctions mathématiques**.

## Ce qui existe déjà

- L'écriture (0.96, `prefs.ecriture`, `src/app/prefs.js` ECRITURES) : xerboxion, texte + glyphes, **glyphes** (plus un mot sur les tuiles,
  les koins, la map ; les noms restent dans `aria-label`), texte, emoji, minimal. Le mode « glyphes » est le brouillon du mode humain.
- Le lexique des glyphes (`G()`, docs/KOINS.md), la police ChillTekk (0.96), la grammaire des 9 lettres (O I N B T S X E R).
- Le zoom (0.99) : de loin le glyphe seul. Le mode humain, c'est le « de loin » partout, à tous les niveaux.
- La règle du xerboxion : les néologismes (tsoin, koin, kion, ion, bion…) **ne se traduisent pas**, dans aucune langue.

## Ce qui coince

- **L'app n'a pas de couche de langues** : tous les textes sont écrits en français, en dur, dans des centaines de fichiers (le HUD, les
  réglages, le guide, les nouveautés, les feuilles). Les traduire, c'est d'abord les sortir dans un dictionnaire : un gros chantier, à faire
  par morceaux.
- Les textes d'iOS (les demandes de permission d'Info.plist) sont en français, sous une région de développement `en` : un iPhone en
  allemand ou en anglais les voit en français. Les traduire = des `InfoPlist.strings` par langue (ajoutés au projet par fastlane, jamais à la main).
- Les ploxions du labo portent leurs propres textes : l'app ne peut traduire que les siens.
- Le mode « glyphes » d'aujourd'hui cache les étiquettes, mais pas les titres, les feuilles, les phrases du guide, les compteurs.

## Une forme possible (proposition, pas décidée)

**Le mode humain, une septième écriture** (`humain`) : aucun mot nulle part, et c'est lui la langue universelle (il n'y a rien à traduire).
- Tout ce qui est un nom → son glyphe. Ce qui n'a pas de glyphe en reçoit un (le lexique grandit).
- Tout ce qui est une quantité ou une relation → une notation mathématique :
  - `8 koins · 4 portails` → `8◇ · 4⊡` ;
  - `il y a 2 semaines` → `Δt −14` ;
  - `rien n'entre` → `∅` ;
  - les entrées et les sorties d'un neurone → `→●` et `●→` ;
  - un réglage → sa courbe (le knob montre sa fonction, pas son nom) ;
  - « ouvrir », « revenir », « tout » → `▶`, `↶`, `∀`.
- La seule porte vers les mots : « c'est quoi ça ? » (déjà dans le guide), qui dit le sens d'un glyphe dans la langue de l'iPhone.

**Toutes les langues** : un bion `dire(cle)` (un dictionnaire, le français comme base, la langue lue sur l'iPhone), migré écran par écran
en commençant par ce que tout le monde voit (le guide, le HUD, la map). Les néologismes restent tels quels.

## Construit (0.99.8)

La 7e écriture `humain` (prefs.ECRITURES) : tout ce que fait « glyphes », plus `src/bions/humain.js` (`compte` → 8◇, `duree` → Δt −2 d,
`fenetre` → ∀t / Δt ∈ [7, 20] d, `flux` → →3 · 2→, `rien` → ∅) posé en `data-h` (la map, le neurone) et affiché par le CSS (`html.px-e-humain`).
Les phrases (`.px-sous`), les noms des hubs et des koins disparaissent ; « c'est quoi ça ? » dit les mots. ⏭ les autres écrans, le guide.

## Construit (0.99.14) : toutes les langues, le début

- `src/bions/dire.js` : la phrase française **est** la clé (comme gettext) ; un nombre passe par `{n}` ; « a · b » se traduit morceau par morceau ;
  les glyphes autour des mots restent ; une phrase inconnue reste en français. `langueDe` : le réglage, sinon la première langue de l'iPhone
  connue, sinon le français. `NEOLOGISMES` : jamais traduits (un test le vérifie sur chaque ligne).
- `src/app/langues.js` : une ligne = `[fr, en, de, it, es]` (l'allemand de Suisse : Velo, Glace, gross). D'abord ce que tout le monde voit :
  l'accueil et la map, les réglages, le marketplace, Autour, Proche.
- `src/app/langue.js` : posé sur l'interface de l'app comme le filtre sans-emoji (textes, placeholder, aria-label, title), jamais sur les
  ploxions du labo ni sur ce que les gens écrivent ; le français d'origine est gardé, la langue change à chaud ; en français, rien ne tourne.
- ⚙ › Apparence › Langue (auto par défaut : un iPhone en allemand voit l'app en allemand ; on peut forcer le français).
- ⏭ les autres écrans (le guide, les nouveautés, les feuilles), et les demandes de permission d'iOS : des `InfoPlist.strings` par langue,
  ajoutés au projet par fastlane.

## Questions ouvertes (à RS-7, quand il en aura envie)

- « Que ça fonctionne avec toutes les langues » : toute l'app, ou les messages de l'ultimate Bluetooth (des gens de langues différentes
  qui se parlent), ou les deux ?
- Le mode humain remplace le mode « glyphes », ou vient en plus ?
- « Des fonctions mathématiques » : une notation (Δt, ∑, ∈, ∅), ou des courbes qui montrent l'état (le temps, la charge, le son), ou les deux ?
