// @bion genome — une peau = un génome (des nombres entre 0 et 1) ; muter, croiser, la grille fractale autour d'un point, vers une variante | api: GENES, PALETTE, aleatoire, genomeDe, versVariante, muter, croiser, grille, couleursDe
// (0.96) LA FRACTALE DES UI. RS-7 (23.10) : « il faut découvrir la fractale des UI, avoir des knobs pour modifier le UI selon un générateur
// fractal, genre c'est des formules au final le UI ; dans organique, le but c'est de trouver le UI qui est parfait pour toi : moi j'ai ma
// vision, mais tout le monde a une vision différente ». Une peau (src/bions/membrane.js) est déjà une formule : quelques nombres. Ici ils
// deviennent un GÉNOME, chaque gène ramené entre 0 et 1 :
//   - les knobs le tournent gène par gène (src/app/knob.js) ;
//   - la GRILLE est la fractale : 3 × 3 peaux autour du point où tu es, le long de deux directions tirées au sort ; en toucher une, c'est
//     zoomer dedans (l'écart se resserre) ; dézoomer l'élargit. Comme un Mandelbrot, où chaque point est une interface ;
//   - muter / croiser : l'évolution (choisir l'enfant qui te parle).
// Pur (aucun DOM) et déterministe : un hasard à graine (le même chemin redonne les mêmes peaux).
const C = (x) => Math.max(0, Math.min(1, x));
/** [clé, nom, min, max, genre] ; genre : '' (continu), 'log', 'entier', 'oui' (≥ 0,5), 'palette' (un indice dans PALETTE), 'liste' (une police) */
export const GENES = [
  ['flou', 'le goo', 0.8, 9, ''], ['onde', 'l\'onde', 0, 20, ''], ['freq', 'la vague', 0.005, 0.1, 'log'], ['epais', 'la paroi', 1, 8, ''],
  ['paroi', 'la peau', 0.3, 1, ''], ['ame', 'l\'âme', 0, 1, ''], ['clair', 'la lumière', 0, 1, ''], ['halo', 'le halo', 0, 1, ''],
  ['contour', 'le contour', 0, 4, ''], ['glitch', 'le glitch', 0, 20, ''], ['faisceau', 'les fibres', 1, 4, 'entier'],
  ['cils', 'les cils', 0, 1, ''], ['epines', 'les épines', 0, 1, ''], ['vertebres', 'les vertèbres', 0, 1, ''], ['ventouses', 'les ventouses', 0, 1, ''],
  ['coulures', 'les coulures', 0, 1, ''], ['gouttes', 'les gouttes', 0, 1, 'oui'], ['chanfrein', 'les coins coupés', 0, 1, 'oui'],
  ['photophores', 'les photophores', 0, 1, 'oui'], ['scan', 'le balayage', 0, 1, 'oui'], ['verre', 'le verre', 0.4, 1, ''],
  ['memb', 'la couleur', 0, 1, 'palette'], ['memb2', 'l\'autre couleur', 0, 1, 'palette'], ['police', 'la police', 0, 1, 'liste'],
];
/** les polices que le gène « police » parcourt (src/bions/polices.js) */
export const LISTE_POLICES = ['mixte', 'chilltekk', 'rond', 'mono', 'serif', 'condensee'];
/** la palette de RS-7 (ses planches chill-tekk_ui) : les couleurs que les gènes de couleur parcourent */
export const PALETTE = ['#007d28', '#014116', '#004817', '#029402', '#0cdb0c', '#00fe44', '#8bc88b', '#37008a', '#1d0048', '#310573', '#20024d', '#191919', '#3f3e3e', '#4d4d4d', '#5d5d5d', '#b0b0b0', '#d9d9d9', '#f0f0f0', '#a90707', '#ffff00'];
const SEUIL_POUSSE = 0.08;   // en dessous, rien ne pousse

/** un hasard à graine (mulberry32) */
export function aleatoire(graine = 1) { let a = graine >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const versReel = ([, , min, max, genre], u) => (genre === 'log' ? min * Math.pow(max / min, u) : genre === 'entier' ? Math.round(min + (max - min) * u) : min + (max - min) * u);
const versUnit = ([, , min, max, genre], x) => C(genre === 'log' ? Math.log(x / min) / Math.log(max / min) : (x - min) / (max - min));
const indice = (u) => Math.min(PALETTE.length - 1, Math.floor(C(u) * PALETTE.length));
const unitDe = (hex) => { const i = PALETTE.indexOf(String(hex || '').toLowerCase()); return i < 0 ? 0 : (i + 0.5) / PALETTE.length; };

/** le génome d'une variante de membrane.js (ses couleurs : celles qu'on lui donne, sinon les siennes) */
export function genomeDe(p = {}, couleurs = {}) {
  const g = {}, geo = p.geo || {};
  for (const gene of GENES) {
    const [k, , , , genre] = gene;
    if (genre === 'palette') { g[k] = unitDe((couleurs[k] || (p.couleurs || {})[k])); continue; }
    if (genre === 'oui') { g[k] = p[k] ? 0.75 : 0.25; continue; }
    if (genre === 'liste') { const i = LISTE_POLICES.indexOf((couleurs.police || (p.couleurs || {}).police) || 'mixte'); g[k] = (Math.max(0, i) + 0.5) / LISTE_POLICES.length; continue; }
    if (k === 'faisceau') { g[k] = versUnit(gene, geo.faisceau || 1); continue; }
    if (k === 'cils') { g[k] = geo.cils ? C(geo.cils.long / 30) : 0; continue; }
    if (k === 'epines') { g[k] = geo.epines ? C(geo.epines.long / 30) : 0; continue; }
    if (k === 'vertebres') { g[k] = geo.vertebres ? C(geo.vertebres.gonfle / 2) : 0; continue; }
    if (k === 'ventouses') { g[k] = geo.ventouses ? C(geo.ventouses.r / 6) : 0; continue; }
    if (k === 'coulures') { g[k] = geo.coulures ? C(geo.coulures.n / 4) : 0; continue; }
    if (k === 'verre') { g[k] = versUnit(gene, (couleurs.verre != null ? couleurs.verre : (p.couleurs || {}).verre) || 0.8); continue; }
    g[k] = versUnit(gene, p[k] != null ? p[k] : (gene[2] + gene[3]) / 2);
  }
  return g;
}

/** le génome → une variante (les nombres de membrane.js, ce qui pousse, ses couleurs) */
export function versVariante(g, { nom = 'ta peau', lot = 'perso' } = {}) {
  const r = (k) => versReel(GENES.find(x => x[0] === k), C(g[k] != null ? g[k] : 0.5));
  const oui = (k) => C(g[k]) >= 0.5, pousse = (k) => C(g[k]) >= SEUIL_POUSSE;
  const geo = {};
  if (r('faisceau') > 1) geo.faisceau = r('faisceau');
  if (pousse('cils')) geo.cils = { densite: 0.03 + 0.06 * g.cils, long: 8 + 22 * g.cils, large: 5 + 4 * g.cils };
  if (pousse('epines')) geo.epines = { long: 8 + 22 * g.epines, large: 5 + 6 * g.epines };
  if (pousse('vertebres')) geo.vertebres = { pas: 9, gonfle: 1.1 + 0.9 * g.vertebres };
  if (pousse('ventouses')) geo.ventouses = { pas: 24, r: 2.5 + 4 * g.ventouses };
  if (pousse('coulures')) geo.coulures = { n: Math.max(1, Math.round(4 * g.coulures)), long: 8 + 16 * g.coulures, large: 6 };
  const v = { lot, nom, flou: r('flou'), onde: r('onde'), freq: r('freq'), epais: r('epais'), paroi: r('paroi'), ame: r('ame'), clair: r('clair'), halo: r('halo'),
    contour: r('contour') >= 0.4 ? r('contour') : 0, glitch: r('glitch') >= 1.5 ? r('glitch') : 0, gouttes: oui('gouttes'), chanfrein: oui('chanfrein'),
    photophores: oui('photophores'), scan: oui('scan'), geo, couleurs: couleursDe(g) };
  return v;
}
/** les couleurs d'un génome : les deux membranes et le verre du dedans */
export const couleursDe = (g) => ({ memb: PALETTE[indice(g.memb)], memb2: PALETTE[indice(g.memb2)], verre: Math.round(versReel(GENES.find(x => x[0] === 'verre'), C(g.verre)) * 100) / 100,
  police: g.police == null ? undefined : LISTE_POLICES[Math.min(LISTE_POLICES.length - 1, Math.floor(C(g.police) * LISTE_POLICES.length))] });

/** un enfant : chaque gène bouge d'au plus « rayon » (les couleurs sautent parfois d'une case) */
export function muter(g, rayon = 0.2, graine = 1) {
  const h = aleatoire(graine), e = {};
  for (const [k, , , , genre] of GENES) {
    const d = (h() * 2 - 1) * rayon;
    e[k] = genre === 'palette' || genre === 'liste' ? (h() < rayon ? C(g[k] + (h() * 2 - 1) * rayon * 2) : g[k]) : C((g[k] != null ? g[k] : 0.5) + d);
  }
  return e;
}
/** deux parents → un enfant (gène par gène, l'un ou l'autre, ou entre les deux) */
export function croiser(a, b, graine = 1) { const h = aleatoire(graine), e = {}; for (const [k] of GENES) { const t = h(); e[k] = t < 0.4 ? a[k] : t < 0.8 ? b[k] : (a[k] + b[k]) / 2; } return e; }

/** LA FRACTALE : 3 × 3 génomes autour de g, le long de deux directions (tirées de la graine), écartés de « ecart ». Toucher l'une = zoomer
 *  (l'appelant la prend pour centre et resserre l'écart) ; l'indice 4 est le centre lui-même */
export function grille(g, ecart = 0.3, graine = 1) {
  const h = aleatoire(graine), dir = () => { const d = {}; for (const [k] of GENES) d[k] = h() * 2 - 1; return d; };
  const u = dir(), v = dir(), out = [];
  for (const j of [-1, 0, 1]) for (const i of [-1, 0, 1]) { const e = {}; for (const [k, , , , genre] of GENES) e[k] = genre === 'palette' && (i || j) ? C(g[k] + (i * u[k] + j * v[k]) * ecart * 0.6) : C(g[k] + (i * u[k] + j * v[k]) * ecart); out.push(e); }
  return out;
}
