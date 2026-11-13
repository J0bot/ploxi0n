/* jOSGlyphe — généré depuis ploxi0n src/bions/glyphe-seed.js par tools/bion-glyphe.mjs : ne pas modifier à la main. */
(function () {
  'use strict';
  if (typeof window !== 'undefined' && window.jOSGlyphe) return;
  // @bion jOSGlyphe — un glyphe du xerboxion tiré d'une graine (un id, un mot, un emoji) : stable, le même partout (l'app, le labo, le xer) | api: graine, specGlyphe, glypheSeed, glypheEmoji
  // ◇ (0.99.56, RS-7 via xerxion1 : « plus aucun emoji : des glyphes à seed déterministes, ton glyphePloxion + le jOSXerkion du labo → un bion
  // commun »). La même graine donne le même glyphe sur tous les appareils, sans réseau ni dictionnaire. La couleur et le centre sont tirés comme
  // ceux d'un xerkion du labo (jOSXerkion : ses six palettes, ses trois centres, le même générateur), la forme dans la grammaire des glyphes de
  // l'app (src/app/glyphes.js : cercle = ion, triangle = koin, carré = portion, losange = ploxion, hexagone). Pur : pas de DOM, testable.
  // Ce fichier est aussi servi seul pour le labo : public/bions/jOSGlyphe.js (généré par tools/bion-glyphe.mjs, window.jOSGlyphe).

  const PALETTES = [['#3fe0d0', 'teal'], ['#ff40d8', 'magenta'], ['#ffb454', 'ambre'], ['#5ee6a0', 'vert'], ['#8fb6ff', 'glace'], ['#b06fff', 'violet']];
  const CENTRES = ['wormion', 'portion', 'kion'];
  const FORMES = ['ion', 'koin', 'portion', 'ploxion', 'hexagone'];

  /** la graine d'une chose : un nombre tel quel, un texte haché (FNV-1a sur ses unités UTF-16, comme hHash des xerkions) */
  function graine(x) {
    if (typeof x === 'number' && Number.isFinite(x)) return x >>> 0;
    let h = 2166136261 >>> 0; const s = String(x == null ? '' : x);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  // le générateur de jOSXerkion (même constantes) : une graine numérique donne la même couleur et le même centre qu'un xerkion du labo
  function rng(seed) { let s = (seed >>> 0) || 1; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }

  /** ce que la graine tire : { graine, couleur, palette, centre, forme, niveaux (1…3) } */
  function specGlyphe(x) {
    const g = graine(x), r = rng(g), p = Math.floor(r() * PALETTES.length);
    const centre = CENTRES[Math.floor(r() * CENTRES.length)];
    r();   // jOSXerkion tire ici son nombre de koins : on le saute, pour garder la suite alignée
    return { graine: g, couleur: PALETTES[p][0], palette: PALETTES[p][1], centre, forme: FORMES[Math.floor(r() * FORMES.length)], niveaux: 1 + Math.floor(r() * 3) };
  }

  const POINTS = {
    koin: (k) => { const a = 12 + k, b = 86 - k * 0.6; return (50) + ',' + a + ' ' + (100 - a + k * 0.2) + ',' + b + ' ' + (a - k * 0.2) + ',' + b; },
    ploxion: (k) => '50,' + (10 + k) + ' ' + (90 - k) + ',50 50,' + (90 - k) + ' ' + (10 + k) + ',50',
    hexagone: (k) => { const r = 39 - k; return [0, 1, 2, 3, 4, 5].map(i => { const a = Math.PI / 3 * i - Math.PI / 2; return (50 + r * Math.cos(a)).toFixed(1) + ',' + (50 + r * Math.sin(a)).toFixed(1); }).join(' '); },
  };
  function contour(forme) {
    if (forme === 'ion') return '<circle cx="50" cy="50" r="38"/>';
    if (forme === 'portion') return '<rect x="14" y="14" width="72" height="72" rx="4"/>';
    return '<polygon points="' + POINTS[forme](0) + '"/>';
  }
  /** le cœur, au centre : des anneaux (wormion), des carrés emboîtés (portion), des triangles emboîtés (kion) ; niveaux = combien */
  function coeur(centre, n, forme) {
    const y = forme === 'koin' ? 58 : 50, l = [];
    for (let i = 0; i < n; i++) {
      const t = 18 - i * 6;   // 18, 12, 6
      if (centre === 'wormion') l.push('<circle cx="50" cy="' + y + '" r="' + t + '"/>');
      else if (centre === 'portion') l.push('<rect x="' + (50 - t) + '" y="' + (y - t) + '" width="' + (2 * t) + '" height="' + (2 * t) + '"/>');
      else l.push('<polygon points="50,' + (y - t) + ' ' + (50 + t) + ',' + (y + t * 0.8) + ' ' + (50 - t) + ',' + (y + t * 0.8) + '"/>');
    }
    l.push('<circle cx="50" cy="' + y + '" r="3.2" class="f"/>');
    return l.join('');
  }

  /**
   * le glyphe d'une graine, en SVG inline (viewBox 100, le trait en currentColor : il prend la couleur du texte, comme les autres glyphes).
   * couleur: true → le glyphe porte la couleur de sa palette (style color) ; cls → classes en plus de px-g
   */
  function glypheSeed(x, { cls = '', couleur = false, titre = '' } = {}) {
    const s = specGlyphe(x);
    return '<svg class="px-g px-g-seed' + (cls ? ' ' + cls : '') + '" viewBox="0 0 100 100" data-graine="' + s.graine + '"'
      + (couleur ? ' style="color:' + s.couleur + '"' : '') + (titre ? ' role="img" aria-label="' + String(titre).replace(/[&<>"]/g, '') + '"' : ' aria-hidden="true"') + ' focusable="false">'
      + contour(s.forme) + coeur(s.centre, s.niveaux, s.forme) + '</svg>';
  }

  /** le glyphe d'un emoji (hors du dictionnaire des glyphes) : sa graine = ses caractères, sans les sélecteurs de variante ni les joints */
  function glypheEmoji(e, opts = {}) { return glypheSeed('emoji:' + String(e || '').replace(/[︎️]/g, ''), opts); }

  var api = { PALETTES: PALETTES, CENTRES: CENTRES, FORMES: FORMES, graine: graine, specGlyphe: specGlyphe, glypheSeed: glypheSeed, glypheEmoji: glypheEmoji };
  if (typeof window !== 'undefined') window.jOSGlyphe = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
