// ◇ LES GLYPHES (0.54, RS-7 : « les emoji, ça rend l'UI dégueu ; des glyphes plus pros, en raccord avec le système xerboxion »).
// Le trait du sprite du labo (my_website2 public/glyphs/xerboxion_glyphs.svg : viewBox 100, des formes simples au trait, currentColor) :
// ses glyphes (ion, koin, trion, cubion, xerboxion, wormion, portion, tsoin, bion, spherion, kion, coeur, xeroction) repris tels quels,
// et ceux de l'interface dessinés dans la même grammaire (cercle = ion, triangle = koin, carré = portion, pointillé = l'intérieur).
// Un ploxion : son glyphe par son nom (un dictionnaire de mots) ; sinon un glyphe GÉNÉRÉ, stable, tiré de son id : une forme du xerboxion
// (ion, koin, portion, losange, hexagone) et une marque intérieure (point, pointillé, croix, trait, trois points).
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const P = (d) => '<path d="' + d + '"/>';
const C = (x, y, r, plein) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"' + (plein ? ' class="f"' : '') + '/>';
const R = (x, y, w, h, rx = 0, plein) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"' + (rx ? ' rx="' + rx + '"' : '') + (plein ? ' class="f"' : '') + '/>';
const L = (x1, y1, x2, y2, cls) => '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"' + (cls ? ' class="' + cls + '"' : '') + '/>';
const POLY = (pts, plein) => '<polygon points="' + pts + '"' + (plein ? ' class="f"' : '') + '/>';

export const GLYPHES = {
  // ---- le lexique du xerboxion (le sprite du labo) ----
  ion: C(50, 50, 36) + C(50, 50, 6, 1),
  koin: POLY('50,14 88,82 12,82') + C(50, 60, 5, 1),
  trion: POLY('50,14 88,82 12,82') + L(50, 30, 50, 74, 'p') + L(26, 58, 74, 58, 'p'),
  cubion: R(18, 32, 50, 50) + P('M18 32 34 16h50v50L68 82M68 32 84 16'),
  xerboxion: R(18, 32, 50, 50) + P('M18 32 34 16h50v50L68 82M68 32 84 16') + P('M30 44l20 26M50 44 30 70'),
  wormion: C(50, 50, 36) + '<circle cx="50" cy="50" r="22" class="p"/>' + C(50, 50, 8, 1),
  portion: R(16, 16, 68, 68) + '<rect x="32" y="32" width="36" height="36" class="p"/>' + R(44, 44, 12, 12, 0, 1),
  tsoin: POLY('24,14 76,14 24,86 76,86') + C(50, 50, 5, 1),
  bion: C(50, 50, 6, 1) + '<ellipse cx="50" cy="50" rx="36" ry="13"/><ellipse cx="50" cy="50" rx="36" ry="13" transform="rotate(60 50 50)"/><ellipse cx="50" cy="50" rx="36" ry="13" transform="rotate(120 50 50)"/>',
  spherion: C(50, 50, 36) + '<ellipse cx="50" cy="50" rx="36" ry="14"/><ellipse cx="50" cy="50" rx="14" ry="36"/>',
  kion: POLY('50,10 90,50 50,90 10,50') + L(50, 10, 50, 90) + L(10, 50, 90, 50),
  coeur: P('M50 84 16 50a17 17 0 0 1 34-24 17 17 0 0 1 34 24z'),
  xeroction: C(50, 50, 7, 1) + '<circle cx="50" cy="50" r="22" class="p"/><circle cx="50" cy="50" r="38" class="p"/>',
  // ---- l'interface ----
  chercher: C(44, 44, 26) + L(63, 63, 86, 86),
  reglages: POLY('50,12 83,31 83,69 50,88 17,69 17,31') + C(50, 50, 13),
  vocal: R(38, 14, 24, 44, 12) + P('M24 46a26 26 0 0 0 52 0M50 72v14M36 86h28'),
  compte: C(50, 36, 16) + P('M18 86a32 26 0 0 1 64 0'),
  reseau: L(22, 80, 22, 66) + L(40, 80, 40, 52) + L(58, 80, 58, 38) + L(76, 80, 76, 22),
  horsligne: L(22, 80, 22, 66) + L(40, 80, 40, 52) + L(58, 80, 58, 38) + L(76, 80, 76, 22) + L(14, 18, 86, 86),
  editer: P('M22 78l6-20 40-40 14 14-40 40z') + L(60, 26, 74, 40),
  retour: P('M62 18 30 50l32 32'),
  minimiser: L(24, 74, 76, 74),
  basculer: R(16, 30, 46, 46) + P('M38 30V16h46v46H62'),
  fermer: L(26, 26, 74, 74) + L(74, 26, 26, 74),
  verrou: R(22, 44, 56, 42, 6) + P('M34 44V32a16 16 0 0 1 32 0v12') + C(50, 64, 4, 1),
  deverrou: R(22, 44, 56, 42, 6) + P('M34 44V32a16 16 0 0 1 31-6') + C(50, 64, 4, 1),
  lecture: POLY('30,18 80,50 30,82', 1),
  pause: R(26, 18, 14, 64, 3, 1) + R(60, 18, 14, 64, 3, 1),
  suivant: POLY('20,20 58,50 20,80', 1) + R(64, 20, 12, 60, 3, 1),
  precedent: POLY('80,20 42,50 80,80', 1) + R(24, 20, 12, 60, 3, 1),
  grille: R(18, 18, 26, 26) + R(56, 18, 26, 26) + R(18, 56, 26, 26) + R(56, 56, 26, 26),
  compacte: R(22, 22, 56, 56) + R(38, 38, 24, 24, 0, 1),
  liste: L(20, 28, 80, 28) + L(20, 50, 80, 50) + L(20, 72, 80, 72),
  usage: C(50, 54, 32) + P('M50 54V34M40 12h20'),
  recents: P('M22 50a28 28 0 1 0 8-20') + P('M18 18v14h14') + P('M50 36v16l10 8'),
  categories: R(16, 16, 68, 68) + L(50, 16, 50, 84) + L(16, 50, 50, 50),
  dossier: P('M14 28h26l8 10h38v42H14z'),
  minidocks: R(16, 18, 68, 18, 5) + R(16, 44, 68, 18, 5) + L(16, 76, 84, 76),
  musique: C(30, 72, 10) + C(70, 64, 10) + P('M40 72V24l40-8v48'),
  video: R(14, 22, 72, 56, 6) + POLY('42,38 64,50 42,62', 1),
  cape: P('M34 16h32l18 70H16zM34 16l16 22 16-22M50 38v48'),
  lampe: P('M36 14h28l-6 30v38H42V44z') + L(50, 52, 50, 64),
  nfc: P('M30 30a28 28 0 0 1 0 40M44 22a40 40 0 0 1 0 56M58 14a52 52 0 0 1 0 72') + C(20, 50, 5, 1),
  wifi: P('M14 40a52 52 0 0 1 72 0M26 54a34 34 0 0 1 48 0M38 68a16 16 0 0 1 24 0') + C(50, 80, 5, 1),
  bluetooth: P('M30 32l40 36-20 18V14l20 18-40 36'),
  maison: P('M14 50 50 18l36 32M24 42v42h52V42') + R(42, 60, 16, 24),
  widgets: R(16, 16, 30, 30, 6) + R(54, 16, 30, 30, 6) + R(16, 54, 30, 30, 6) + R(54, 54, 30, 30, 6),
  notifs: P('M28 66V44a22 22 0 0 1 44 0v22l8 8H20zM42 82a8 8 0 0 0 16 0'),
  iphone: R(28, 10, 44, 80, 9) + L(44, 80, 56, 80),
  palette: C(50, 50, 36) + C(36, 38, 5, 1) + C(58, 32, 5, 1) + C(66, 52, 5, 1),
  haptique: C(50, 50, 10, 1) + P('M28 28a30 30 0 0 0 0 44M72 28a30 30 0 0 1 0 44M16 18a46 46 0 0 0 0 64M84 18a46 46 0 0 1 0 64'),
  navigation: C(50, 50, 36) + POLY('50,22 60,50 50,78 40,50') + C(50, 50, 4, 1),
  dock: R(12, 58, 76, 26, 8) + R(22, 66, 10, 10, 2, 1) + R(45, 66, 10, 10, 2, 1) + R(68, 66, 10, 10, 2, 1) + L(30, 30, 70, 30, 'p'),
  donnees: '<ellipse cx="50" cy="24" rx="30" ry="10"/>' + P('M20 24v52c0 6 13 10 30 10s30-4 30-10V24M20 50c0 6 13 10 30 10s30-4 30-10'),
  livre: P('M50 26C40 18 26 18 14 22v56c12-4 26-4 36 4 10-8 24-8 36-4V22c-12-4-26-4-36 4zM50 26v56'),
  horloge: C(50, 50, 36) + P('M50 26v24l16 10'),
  bulle: P('M16 22h68v44H46L28 82V66H16z'),
  terminal: R(12, 18, 76, 64, 6) + P('M26 40l12 10-12 10M46 62h20'),
  manette: P('M30 32h40a18 18 0 0 1 18 20l-4 18a10 10 0 0 1-18 2l-6-10H40l-6 10a10 10 0 0 1-18-2l-4-18a18 18 0 0 1 18-20z') + L(30, 44, 30, 56) + L(24, 50, 36, 50) + C(66, 46, 3, 1) + C(72, 54, 3, 1),
  clavier: R(12, 26, 76, 48, 4) + L(31, 26, 31, 58) + L(50, 26, 50, 58) + L(69, 26, 69, 58),
  flacon: P('M38 14h24M42 14v26L18 80a6 6 0 0 0 5 8h54a6 6 0 0 0 5-8L58 40V14') + L(26, 64, 74, 64, 'p'),
  boite: P('M14 32 50 16l36 16v40L50 88 14 72zM14 32l36 16 36-16M50 48v40'),
  photo: R(12, 28, 76, 52, 8) + C(50, 54, 15) + P('M34 28l6-10h20l6 10'),
  lieu: P('M50 88S22 58 22 40a28 28 0 0 1 56 0c0 18-28 48-28 48z') + C(50, 40, 9),
  partager: P('M50 60V14M34 30 50 14l16 16M24 46v40h52V46'),
  plus: L(50, 20, 50, 80) + L(20, 50, 80, 50),
  moins: L(20, 50, 80, 50),
  allumer: P('M34 26a30 30 0 1 0 32 0') + L(50, 12, 50, 50),
  relire: P('M78 50a28 28 0 1 1-8-20') + P('M82 18v14H68'),
  valider: P('M18 52l20 20 44-44'),
  stop: R(26, 26, 48, 48, 5, 1),
  xerbot: R(22, 34, 56, 46, 8) + L(50, 34, 50, 18) + C(50, 15, 4, 1) + C(38, 54, 5, 1) + C(62, 54, 5, 1) + L(40, 68, 60, 68),
  chilltekk: POLY('50,10 90,50 50,90 10,50') + POLY('50,30 70,50 50,70 30,50'),
  globe: C(50, 50, 36) + '<ellipse cx="50" cy="50" rx="15" ry="36"/>' + L(14, 50, 86, 50),
  marche: P('M18 36h64l-6 46H24zM36 36V28a14 14 0 0 1 28 0v8'),
};

// les glyphes des emoji que l'app employait (un ploxion ou un réglage qui donne encore un emoji)
const DEPUIS_EMOJI = { '🔎': 'chercher', '⚙': 'reglages', '⚙️': 'reglages', '🎙': 'vocal', '🎙️': 'vocal', '⧗': 'tsoin', '👤': 'compte', '📶': 'reseau', '📴': 'horsligne',
  '✎': 'editer', '▁': 'minimiser', '⧉': 'basculer', '✕': 'fermer', '🔒': 'verrou', '🔓': 'deverrou', '▶': 'lecture', '⏸': 'pause', '⏭': 'suivant', '⏮': 'precedent',
  '▦': 'grille', '▪': 'compacte', '☰': 'liste', '⏱': 'usage', '↺': 'recents', '◫': 'categories', '📁': 'dossier', '▤': 'minidocks', '♫': 'musique', '🎞': 'video',
  '🥼': 'cape', '❤': 'coeur', '❤️': 'coeur', '🔦': 'lampe', '◉': 'nfc', 'ᛒ': 'bluetooth', '🏠': 'maison', '🔔': 'notifs', '📲': 'iphone', '🎨': 'palette', '🫧': 'haptique',
  '🧭': 'navigation', '🧩': 'dock', '▣': 'portion', '⬡': 'xerboxion', '💾': 'donnees', '◇': 'chilltekk', '🤖': 'xerbot', '🌐': 'globe', '🛍': 'marche', '🧪': 'flacon',
  '📦': 'boite', '📷': 'photo', '📍': 'lieu', '↗': 'partager', '⚡': 'bion', '🔌': 'bion', '⏻': 'allumer', '↻': 'relire', '✓': 'valider', '＋': 'plus', '+': 'plus', '−': 'moins', '🗯': 'bulle', '■': 'stop', '📳': 'haptique', '📋': 'liste', '🔔': 'notifs', '🔋': 'reseau', '📡': 'wifi', '🗣': 'vocal',
  '🧲': 'navigation', '🔐': 'verrou', '🎵': 'musique', '📚': 'livre', '📖': 'livre', '🎮': 'manette', '💬': 'bulle', '🗂': 'dossier', '📄': 'dossier', '🖥': 'terminal', '⌨': 'clavier', '🎧': 'musique', '🎬': 'video', '🕐': 'horloge', '⏲': 'horloge', '🗺': 'globe', '🔑': 'verrou', '☁': 'spherion', '🌸': 'coeur', '⌚': 'horloge', '📱': 'iphone', '🏃': 'coeur', '☾': 'horloge' };

/** le nom du glyphe d'un emoji (ou null) */
export function nomDepuisEmoji(e) { const k = String(e || '').replace(/[\uFE0F\u200D]/g, ''); return DEPUIS_EMOJI[k] || DEPUIS_EMOJI[e] || null; }
/** un glyphe en SVG inline (hérite la couleur du texte) ; nom inconnu → le point (ion) */
export function glyphe(nom, cls = '') {
  const g = GLYPHES[nom] || GLYPHES[DEPUIS_EMOJI[nom]] || null;
  return '<svg class="px-g' + (cls ? ' ' + cls : '') + '" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' + (g || GLYPHES.ion) + '</svg>';
}
/** l'emoji (ou le glyphe) d'un réglage, d'un mini dock… → un glyphe s'il est connu, sinon le texte tel quel */
export function versGlyphe(x, cls = '') {
  const s = String(x == null ? '' : x).trim();
  if (GLYPHES[s] || DEPUIS_EMOJI[s] || DEPUIS_EMOJI[s.replace(/\uFE0F/g, '')]) return glyphe(DEPUIS_EMOJI[s.replace(/\uFE0F/g, '')] || s, cls);
  if (/\p{Extended_Pictographic}/u.test(s)) return glyphe('ion', cls);   // un emoji inconnu : le point du xerboxion, jamais l'emoji
  return '<span class="px-g-t">' + esc(s) + '</span>';
}

// ---- le glyphe d'un ploxion : son nom, sinon généré ----
const MOTS = [
  [/spotify|music|musique|radio|\bdj\b|mixer|player|lecteur audio|son\b|beats|youtube-music|playlist/i, 'musique'],
  [/stremio|video|vidéo|cin[eé]|film|youtube|twitch|tv\b|stream/i, 'video'],
  [/wiki|dico|dictionnaire|lexique|livre|r[eé]cits|book|lecture|biblio|epub|histoire/i, 'livre'],
  [/horloge|minuteur|pomodoro|temps|calend|agenda|chrono|timer/i, 'horloge'],
  [/carte|map|globe|monde|g[eé]o|lieu/i, 'globe'],
  [/piano|clavier|synth|studio|compositeur|musique-cr/i, 'clavier'],
  [/couleur|palette|th[eè]me|canvas|dessin|peint/i, 'palette'],
  [/social|amis|groupe|invitation|chat|message|appel|bother|post-it|forum/i, 'bulle'],
  [/fichier|files|documents?|pdf|explorateur|dossier|archive/i, 'dossier'],
  [/code|forge|atelier|xerminal|ssh|terminal|console|shell|\bop\b/i, 'terminal'],
  [/jeu|game|doom|arcade|puzzle/i, 'manette'],
  [/bluetooth/i, 'bluetooth'], [/wifi|r[eé]seau|connexion/i, 'wifi'],
  [/sant[eé]|endo|\bflo\b|coeur|c[oœ]ur|sport|forme/i, 'coeur'],
  [/s[eé]curit[eé]|verrou|mot de passe|password|cl[eé]/i, 'verrou'],
  [/photo|cam[eé]ra|image|galerie/i, 'photo'],
  [/r[eé]glage|param[eè]tre|setting/i, 'reglages'],
  [/march[eé]|boutique|shop|store/i, 'marche'],
  [/banc|test|labo|essai|chimie/i, 'flacon'],
  [/boxion|cubion|cube|serveur/i, 'cubion'],
  [/\bbions?\b|atome|i\/o/i, 'bion'], [/tsoin|journal|note/i, 'tsoin'], [/portion|porte/i, 'portion'], [/wormion|chaoxion|spirale/i, 'wormion'],
  [/x?kion|xerkion/i, 'kion'], [/xerbot|robot|bras|blouse|cape/i, 'xerbot'], [/sph[eè]re|spherion|univers|espace/i, 'spherion'],
  [/maison|home|accueil|domotique/i, 'maison'], [/notif|alerte|cloche/i, 'notifs'], [/math|actuariat|calcul|excel|tableur/i, 'grille'],
];
const INTERNES = { cape: 'cape', sante: 'coeur', marketplace: 'marche', banc: 'flacon', 'xer-en-ligne': 'globe', 'journal-tsoins': 'tsoin', gestion: 'boite',
  'reglages-app': 'reglages', bother: 'bulle', portion: 'portion' };
const FORMES = [C(50, 50, 36), POLY('50,12 88,80 12,80'), R(16, 16, 68, 68, 4), POLY('50,10 90,50 50,90 10,50'), POLY('50,12 83,31 83,69 50,88 17,69 17,31')];
const MARQUES = [C(50, 52, 7, 1), '<circle cx="50" cy="52" r="18" class="p"/>', L(38, 40, 62, 64) + L(62, 40, 38, 64), L(30, 52, 70, 52), C(36, 54, 4, 1) + C(50, 54, 4, 1) + C(64, 54, 4, 1), R(42, 44, 16, 16, 0, 1)];
const hache = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };
/** le nom du glyphe d'un ploxion par ses mots (id, nom, catégorie), ou null */
export function nomGlyphe(p) {
  if (!p) return null; if (INTERNES[p.id]) return INTERNES[p.id];
  const t = [p.id, p.nom, p.categorie].filter(Boolean).join(' ');
  for (const [re, n] of MOTS) if (re.test(t)) return n;
  return null;
}
/** le glyphe d'un ploxion (SVG inline) : connu par ses mots, sinon généré de son id (forme × marque, stable) */
export function glyphePloxion(p, cls = '') {
  const n = nomGlyphe(p); if (n) return glyphe(n, cls);
  const h = hache(p && p.id);
  return '<svg class="px-g' + (cls ? ' ' + cls : '') + '" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' + FORMES[h % FORMES.length] + MARQUES[(h >>> 5) % MARQUES.length] + '</svg>';
}
