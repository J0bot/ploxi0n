// ⬡ LES ICÔNES DU XERBOXION (0.55). RS-7 : « un icon set précis, réutiliser la génération d'icône des xerkions », puis « il faut faire la
// différence entre un ploxion qui est un losange, un xerkion qui peut être un pentagone, un hexagone ou plus selon le nombre de ploxions à
// l'intérieur, les cubions… savoir si c'est un xerkion, un koin, un kion, un cubion, un wormion, un spherion, une portion, un ploxion, un xer,
// et des glyphes pour chaque catégorie ».
// Une icône se lit en trois couches :
//   la FORME   = le TYPE (typeDe) : ploxion = losange · xerkion = polygone à N côtés, N = ses koins (3 à 12, sinon l'octogone-xer), avec ses
//                rayons et ses nœuds, comme les hubs du labo · xer = octogone double · cubion = cube · kion = carré tenu par ses 4 koins ·
//                koin = triangle · wormion = anneaux · spherion = sphère et méridiens · portion = carrés emboîtés · bion = membrane · boxion = boîte
//   la COULEUR = la catégorie (les six palettes des xerkions du labo, GPAL) ; un xerkion garde la sienne (son id, comme au labo)
//   le GLYPHE  = ce qu'il fait (ses mots, src/app/glyphes.js), sinon celui de sa catégorie, sinon un glyphe généré de son id
// Le labo peut tout fixer dans le registre (« type », « xerkion »: { pal, centre, glyphe }) ; une personne retouche la couleur, le cœur et le
// glyphe pour elle (l'atelier de l'écran d'accueil) et peut PROPOSER son icône au labo. La forme, elle, ne se retouche pas : c'est un fait.
// Rien que des attributs (pas de CSS, pas d'id, pas de filtre) : le même SVG sert au DOM et au canvas (PNG des clips), et quarante tuiles
// restent légères.
import { GLYPHES, nomGlyphe, glyphePloxion } from './glyphes.js';

/** les six palettes des xerkions du labo (jOSXerkionHub : bg, a = le trait, b = le cœur) */
export const GPAL = [
  { bg: '#070b12', a: '#3fe0d0', b: '#7fd7ff', n: 'teal' },
  { bg: '#0a0510', a: '#c14bff', b: '#ff5fd0', n: 'magenta' },
  { bg: '#0c0a04', a: '#ffc857', b: '#ff8a3d', n: 'ambre' },
  { bg: '#050e07', a: '#7ee081', b: '#c9ff6e', n: 'vert' },
  { bg: '#060a14', a: '#6ee7ff', b: '#a78bfa', n: 'glace' },
  { bg: '#0a0714', a: '#a78bfa', b: '#ff9ecb', n: 'violet' },
];
export const CENTRES = ['wormion', 'portion', 'kion'];
/** (0.56, RS-7 : « avoir que le glyphe de base, et aussi le glyphe xerboxion ») le style : la forme du type, ou le glyphe seul, en grand */
export const STYLES = ['xerboxion', 'glyphe'];
export const TYPES = ['ploxion', 'xerkion', 'xer', 'cubion', 'kion', 'koin', 'wormion', 'spherion', 'portion', 'bion', 'boxion'];
/** la forme de chaque type, en mots (la légende) */
export const FORMES = { ploxion: 'losange', xerkion: 'polygone à N koins', xer: 'octogone double', cubion: 'cube', kion: 'carré à 4 koins', koin: 'triangle',
  wormion: 'anneaux', spherion: 'sphère', portion: 'carrés emboîtés', bion: 'membrane', boxion: 'boîte' };
/** les catégories du registre (category) → [glyphe, palette] */
export const CATEGORIES = {
  blocs: ['bion', 0], systeme: ['terminal', 4], espace: ['spherion', 5], creer: ['palette', 1], meta: ['xerboxion', 0], media: ['video', 1],
  cartes: ['lieu', 3], son: ['musique', 2], notes: ['editer', 4], social: ['bulle', 5], maison: ['maison', 3], savoir: ['livre', 2],
  jeux: ['manette', 1], outils: ['boite', 2], autres: ['ion', 4], ploxi0n: ['iphone', 0],
};
const PAR_LIBELLE = { 'blocs & bions': 'blocs', 'système & dev': 'systeme', 'espace & science': 'espace', 'créer & design': 'creer', 'le xerboxion': 'meta',
  'média': 'media', 'cartes & monde': 'cartes', 'son & musique': 'son', 'notes & docs': 'notes', 'social & comm': 'social', 'maison & vie': 'maison',
  'savoir & wiki': 'savoir', 'jeux & fun': 'jeux', 'outils': 'outils', 'autres': 'autres', 'ploxi0n': 'ploxi0n' };
/** la clé de catégorie d'un ploxion (category du registre, sinon son libellé) */
export function categorieDe(p) {
  const c = p && (p.cat || PAR_LIBELLE[String(p.categorie || '').toLowerCase()]);
  return CATEGORIES[c] ? c : null;
}
/** le glyphe d'une catégorie (clé ou libellé) */
export function glypheCategorie(c) { const k = CATEGORIES[c] ? c : PAR_LIBELLE[String(c || '').toLowerCase()]; return k ? CATEGORIES[k][0] : 'ion'; }

/** le hachage des xerkions du labo (FNV-1a 32 bits) */
export function hHash(s) { let h = 2166136261 >>> 0; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
const entier = (v, n) => (v !== null && v !== '' && Number.isInteger(+v) && +v >= 0 && +v < n ? +v : null);

/** le TYPE : celui du registre (type), sinon lu dans l'id (xerkion-…, cubion, kion-3d…), sinon ploxion */
export function typeDe(p) {
  const t = p && (p.type || p.forme); if (TYPES.includes(t)) return t;
  const id = String((p && p.id) || '').toLowerCase();
  if (/^xerkions?(-|$)/.test(id) || (p && p.koins != null)) return 'xerkion';
  if (/^xers?(-|$)/.test(id)) return 'xer';
  if (/(^|-)cubion|^cubes?$/.test(id)) return 'cubion';
  if (/(^|-)spherion/.test(id)) return 'spherion';
  if (/(^|-)wormion/.test(id)) return 'wormion';
  if (/(^|-)portion/.test(id)) return 'portion';
  if (/(^|-)koins?(-|$)/.test(id)) return 'koin';
  if (/(^|-)kions?(-|$)/.test(id)) return 'kion';
  if (/^bions?$/.test(id)) return 'bion';
  if (/(^|-)boxions?(-|$)/.test(id)) return 'boxion';
  return 'ploxion';
}

/** la spec d'une icône : le labo (p.xerkion), puis la perso, sinon déduite (type, catégorie, id) */
export function specXerkion(p, perso = null) {
  const id = String((p && p.id) || ''), h = hHash(id), lab = (p && p.xerkion && typeof p.xerkion === 'object') ? p.xerkion : {}, m = Object.assign({}, lab, perso || {});
  const type = typeDe(p), cat = categorieDe(p), pal = entier(m.pal, GPAL.length);
  const n = +((p && p.koins) || 0);
  return {
    type,
    pal: pal != null ? pal : (type === 'xerkion' || !cat) ? h % GPAL.length : CATEGORIES[cat][1],
    cotes: type === 'xerkion' ? (n > 0 ? Math.max(3, Math.min(12, n)) : 8) : null,
    centre: CENTRES.includes(m.centre) ? m.centre : CENTRES.includes(p && p.centre) ? p.centre : CENTRES[(h >>> 16) % CENTRES.length],
    // un xerkion porte le mot « xerkion » : son glyphe vient du reste (xerkion-son → musique), pas du mot
    style: STYLES.includes(m.style) ? m.style : null,
    glyphe: (m.glyphe && GLYPHES[m.glyphe]) ? m.glyphe : (nomGlyphe(type === 'xerkion' ? { id: id.replace(/^xerkions?-?/i, ''), nom: String((p && p.nom) || '').replace(/xerkions?/i, ''), categorie: p.categorie } : p) || (cat ? CATEGORIES[cat][0] : null)),
  };
}

const sommets = (n, r, a0 = -90, cx = 50, cy = 50) => Array.from({ length: n }, (_, i) => { const a = (a0 + i * (360 / n)) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
const pts = (l) => l.map(([x, y]) => f1(x) + ',' + f1(y)).join(' ');
const noeuds = (l, c, r = 2.6) => '<g fill="' + c + '">' + l.map(([x, y]) => '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + r + '"/>').join('') + '</g>';
/** une forme tracée deux fois : le halo (large, pâle) puis le trait */
const trace = (el, c, plein = 'rgba(0,0,0,.18)', extra = '') => el.replace('/>', ' fill="none" stroke="' + c + '" stroke-width="6" stroke-opacity=".16" stroke-linejoin="round"/>') + el.replace('/>', ' fill="' + plein + '" stroke="' + c + '" stroke-width="2.2" stroke-linejoin="round"' + extra + '/>');
const fin = (c, op = '.55', w = '1.1') => ' fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-opacity="' + op + '"';

function coeur(kind, c) {
  let g = '';
  if (kind === 'wormion') for (const r of [23, 28.5, 34]) g += '<circle cx="50" cy="50" r="' + r + '"/>';
  else if (kind === 'portion') for (const s of [19, 24, 29]) g += '<rect x="' + f1(50 - s) + '" y="' + f1(50 - s) + '" width="' + s * 2 + '" height="' + s * 2 + '"/>';
  else for (const s of [23, 29.5, 36]) g += '<polygon points="50,' + f1(50 - s) + ' ' + f1(50 + s) + ',50 50,' + f1(50 + s) + ' ' + f1(50 - s) + ',50"/>';
  return '<g' + fin(c) + '>' + g + '</g>';
}
/** la forme du type ; rend [svg, cx, cy, rayon du disque] */
function forme(s, P) {
  const A = P.a, B = P.b;
  switch (s.type) {
    case 'xerkion': {
      const v = sommets(s.cotes, 44);
      return [coeur(s.centre, B) + '<g stroke="' + A + '" stroke-width=".9" stroke-opacity=".45">' + v.map(([x, y]) => '<line x1="50" y1="50" x2="' + f1(x) + '" y2="' + f1(y) + '"/>').join('') + '</g>'
        + trace('<polygon points="' + pts(v) + '"/>', A) + noeuds(v, A), 50, 50, 27];
    }
    case 'xer': return [trace('<polygon points="' + pts(sommets(8, 44, -67.5)) + '"/>', A) + '<polygon points="' + pts(sommets(8, 36, -67.5)) + '"' + fin(B, '.7', '1.4') + '/>', 50, 50, 28];
    case 'cubion': {
      const v = sommets(6, 45);
      return [trace('<polygon points="' + pts(v) + '"/>', A) + '<g stroke="' + A + '" stroke-width="1.6" stroke-opacity=".75">' + [v[1], v[3], v[5]].map(([x, y]) => '<line x1="50" y1="50" x2="' + f1(x) + '" y2="' + f1(y) + '"/>').join('') + '</g>' + noeuds(v, A, 2.2), 50, 50, 25];
    }
    case 'kion': return [trace('<rect x="9" y="9" width="82" height="82"/>', A) + '<g fill="' + A + '" fill-opacity=".8"><polygon points="9,9 25,9 9,25"/><polygon points="91,9 75,9 91,25"/><polygon points="91,91 75,91 91,75"/><polygon points="9,91 25,91 9,75"/></g>', 50, 50, 29];
    case 'koin': return [trace('<polygon points="50,7 94,88 6,88"/>', A) + '<polygon points="50,25 81,80 19,80"' + fin(B, '.6') + '/>' + noeuds([[50, 7], [94, 88], [6, 88]], A), 50, 62, 23];
    case 'wormion': return [trace('<circle cx="50" cy="50" r="44"/>', A) + '<circle cx="50" cy="50" r="37"' + fin(B, '.6', '1.3') + '/><circle cx="50" cy="50" r="30"' + fin(B, '.45') + ' stroke-dasharray="3 3"/>', 50, 50, 28];
    case 'spherion': return [trace('<circle cx="50" cy="50" r="44"/>', A) + '<ellipse cx="50" cy="50" rx="44" ry="15"' + fin(B, '.6', '1.2') + '/><ellipse cx="50" cy="50" rx="15" ry="44"' + fin(B, '.6', '1.2') + '/>', 50, 50, 26];
    case 'portion': return [trace('<rect x="8" y="8" width="84" height="84"/>', A) + '<rect x="16" y="16" width="68" height="68"' + fin(B, '.65', '1.3') + '/><rect x="23" y="23" width="54" height="54"' + fin(B, '.4') + '/>', 50, 50, 26];
    case 'bion': return [trace('<circle cx="50" cy="50" r="43"/>', A, 'rgba(0,0,0,.25)', ' stroke-dasharray="5 3.5"') + '<circle cx="50" cy="50" r="35"' + fin(B, '.55', '1.2') + '/>', 50, 50, 29];
    case 'boxion': return [trace('<rect x="10" y="12" width="80" height="78" rx="9"/>', A) + '<line x1="10" y1="30" x2="90" y2="30"' + fin(A, '.8', '1.6') + '/>' + noeuds([[22, 21], [30, 21]], A, 2.4), 50, 60, 26];
    default: {   // ploxion : le losange
      const v = [[50, 6], [94, 50], [50, 94], [6, 50]];
      return [trace('<polygon points="' + pts(v) + '"/>', A) + '<polygon points="50,17 83,50 50,83 17,50"' + fin(B, '.5') + '/>' + noeuds(v, A), 50, 50, 27];
    }
  }
}
/** l'intérieur du glyphe (sans son <svg>) */
function interieur(p, nom) {
  const s = nom ? '<svg>' + GLYPHES[nom] + '</svg>' : glyphePloxion(p);
  const m = /^<svg[^>]*>([\s\S]*)<\/svg>$/.exec(s); return m ? m[1] : '';
}

const memo = new Map();
/**
 * l'icône d'un ploxion (ou d'un xerkion, d'un cubion…), en SVG.
 * @param {object} p        { id, nom, categorie, cat, type?, koins?, centre?, xerkion? }
 * @param {object} [o]      { perso: { pal, centre, glyphe, style }, fond: true, photo: dataURL (à la place du glyphe), cls,
 *                          seul: le style par défaut est « glyphe seul » (⚙ › Apparence) ; le style d'une perso passe devant }
 */
export function svgXerkion(p, { perso = null, fond = true, photo = null, cls = 'xki', seul = false } = {}) {
  const k = !photo && JSON.stringify([p && p.id, p && p.nom, p && p.categorie, p && p.cat, p && p.type, p && p.koins, p && p.centre, p && p.xerkion, perso, fond, cls, seul]);
  if (k && memo.has(k)) return memo.get(k);
  const s = specXerkion(p, perso), P = GPAL[s.pal], glypheSeul = s.style ? s.style === 'glyphe' : !!seul;
  // glyphe seul : pas de forme, le glyphe occupe la tuile (62 %) ; sinon la forme du type et le glyphe dans son disque
  const [corps, cx, cy, r] = glypheSeul ? ['', 50, 50, 36] : forme(s, P), e = glypheSeul ? 64 : r * 1.62, z = e / 100;
  const centre = photo
    ? '<clipPath id="xkc"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"/></clipPath><image href="' + photo + '" x="' + f1(cx - r) + '" y="' + f1(cy - r) + '" width="' + r * 2 + '" height="' + r * 2 + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#xkc)"/>'
    : '<g transform="translate(' + f1(cx - e / 2) + ' ' + f1(cy - e / 2) + ') scale(' + z.toFixed(3) + ')" fill="none" stroke="' + P.a + '" stroke-width="' + (glypheSeul ? 6.5 : 7.5) + '" stroke-linecap="round" stroke-linejoin="round">' + interieur(p, s.glyphe) + '</g>';
  const svg = '<svg class="' + cls + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false" data-type="' + s.type + '" data-style="' + (glypheSeul ? 'glyphe' : 'xerboxion') + '">'
    // le fond sans dégradé ni id (une tuile cachée qui porterait le dégradé le casserait pour les autres sous WebKit)
    + (fond ? '<rect width="100" height="100" fill="' + P.bg + '"/><circle cx="50" cy="42" r="48" fill="' + P.a + '" fill-opacity=".07"/>' : '')
    + corps
    + (glypheSeul ? '' : '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="rgba(0,0,0,.72)" stroke="' + P.a + '" stroke-width="1.4"/>')
    + centre + '</svg>';
  // les classes des glyphes (.f = plein, .p = pointillé) en attributs : le SVG se suffit (DOM comme canvas)
  const sortie = svg.replace(/ class="f"/g, ' fill="' + P.a + '" stroke="none"').replace(/ class="p"/g, ' stroke-dasharray="7 7" stroke-width="4.5"');
  if (k) { if (memo.size > 800) memo.clear(); memo.set(k, sortie); }
  return sortie;
}

/** le PNG (base64 sans préfixe) d'une icône, pour les clips de l'écran d'accueil ; null sans canvas */
export function pngXerkion(W, p, { taille = 180, perso = null, photo = null, seul = false } = {}) {
  return new Promise((res) => {
    try {
      const c = W.document.createElement('canvas'); c.width = c.height = taille;
      const x = c.getContext && c.getContext('2d'); if (!x) return res(null);
      const img = new W.Image(); let fini = false; const t = W.setTimeout(() => { if (!fini) { fini = true; res(null); } }, 4000);   // une image qui ne vient jamais ne bloque pas le profil
      const rendre = (v) => { if (fini) return; fini = true; W.clearTimeout(t); res(v); };
      img.onload = () => { try { x.drawImage(img, 0, 0, taille, taille); const u = c.toDataURL('image/png'); rendre(u && u.startsWith('data:image/png;base64,') ? u.slice(22) : null); } catch (e) { rendre(null); } };
      img.onerror = () => rendre(null);
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgXerkion(p, { perso, photo, cls: 'xki', seul }));
    } catch (e) { res(null); }
  });
}
