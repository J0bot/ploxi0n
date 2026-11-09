// @bion synapses — la géométrie des neurones : qui se colle à qui (un arbre + quelques liens), et les koins (gouttes) des coins | api: synapses, koinsDe, SEUIL
// (0.95, RS-7 : « divise bien le travail et fais-en des bions, pour qu'ensuite ce soit plus facile ») : des calculs purs, sans DOM. Composé par
// src/app/neurones.js (la couche) ; un ploxion peut s'en servir pour dessiner son propre réseau.
export const SEUIL = 26;

/** les synapses entre des cellules { x, y, w, h } : les paires côte à côte (l'écart sous le seuil, assez en face l'une de l'autre) ; pas un
 *  treillis : un arbre qui relie chaque cellule à au moins une autre (les plus proches d'abord), et quelques liens de plus (part ≈ autres) */
export function synapses(cs, { seuil = SEUIL, autres = 0.35 } = {}) {
  const cands = [];
  for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
    const a = cs[i], b = cs[j];
    const gx = Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w)), gy = Math.max(b.y - (a.y + a.h), a.y - (b.y + b.h));
    const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    const h = ((i * 7 + j * 13) % 5 - 2) / 2 * 0.3;   // un décalage fixe, propre à la paire : les ponts ne sont pas tous au milieu (organique)
    if (gx >= 0 && gx <= seuil && oy >= 12) {   // côte à côte
      const l = Math.max(10, Math.min(26, oy * 0.12)), c = Math.max(a.y, b.y) + oy / 2 + h * (oy - l) / 2, x0 = Math.min(a.x + a.w, b.x + b.w) - 4;
      cands.push({ x: x0, y: c - l / 2, w: gx + 8, h: l, de: i, a: j, ecart: gx });
    } else if (gy >= 0 && gy <= seuil && ox >= 12) {   // l'un sur l'autre
      const l = Math.max(10, Math.min(26, ox * 0.12)), c = Math.max(a.x, b.x) + ox / 2 + h * (ox - l) / 2, y0 = Math.min(a.y + a.h, b.y + b.h) - 4;
      cands.push({ x: c - l / 2, y: y0, w: l, h: gy + 8, de: i, a: j, ecart: gy });
    }
  }
  cands.sort((p, q) => p.ecart - q.ecart || p.de - q.de || p.a - q.a);
  const chef = cs.map((_, i) => i), trouver = (i) => (chef[i] === i ? i : (chef[i] = trouver(chef[i])));
  return cands.filter(p => {
    const r1 = trouver(p.de), r2 = trouver(p.a);
    if (r1 !== r2) { chef[r1] = r2; return true; }   // relie deux morceaux : toujours
    return ((p.de * 31 + p.a * 17) % 20) / 20 < autres;   // un lien de plus, ou pas (fixe : le même à chaque dessin)
  }).map(({ ecart, a, ...p }) => p);
}

/** les KOINS d'une cellule (0.94 : les gouttes des coins, sur les planches de RS-7) : aux quatre coins d'une grande cellule, une goutte de
 *  membrane (le goo la fond dans le bord : un coin bombé). Les petites cellules n'en ont pas (le koin d'un koin serait du bruit). */
export function koinsDe(q, { min = 120 } = {}) {
  if (q.w < min || q.h < min) return [];
  const r = Math.max(6, Math.min(13, Math.min(q.w, q.h) / 14)), d = r * 0.55;
  return [[q.x + d, q.y + d], [q.x + q.w - d, q.y + d], [q.x + d, q.y + q.h - d], [q.x + q.w - d, q.y + q.h - d]].map(([cx, cy], i) => ({ cx, cy, r, coin: i }));
}

