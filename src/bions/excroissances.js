// @bion excroissances — ce qui pousse sur les cellules et les synapses : cils, ventouses, épines, vertèbres, faisceaux (de la géométrie pure, sans DOM) | api: faisceau, vertebres, cils, ventouses, epines, coulures, ogives, rayures, formeSvg
// (0.95, le deuxième lot de peaux. RS-7 22.10 : « j'aime bien l'organisation de câble et la texture de gelée, mais donne-moi d'autres trucs
// bien plus alien »). Une forme = { t: 'rect' | 'poly' | 'rond', … } dans les coordonnées des cellules ; neurones.js les pose dans la membrane,
// où le goo les fond dans la paroi (un cil sort du mur, une vertèbre gonfle le tube). Tout est FIXE : un hasard tiré des positions (le même
// dessin à chaque fois, rien ne bouge). Composé avec src/bions/synapses.js et src/bions/membrane.js (les variantes disent quoi faire pousser).

/** un hasard fixe dans [0, 1[ (tiré de nombres : le même à chaque dessin) */
export const hasard = (...xs) => { let h = 2166136261; for (const x of xs) { h ^= Math.round(x * 10) | 0; h = Math.imul(h, 16777619); } return ((h >>> 0) % 10007) / 10007; };

/** un pont → n fibres parallèles et fines (le faisceau, la fibre optique) */
export function faisceau(p, n = 3) {
  if (n <= 1) return [p];
  const horiz = p.w > p.h, large = horiz ? p.h : p.w, f = Math.max(4.5, large / (n * 1.4)), pas = large * 1.6 / n;   // 4,5 px au moins : le goo efface plus fin
  return Array.from({ length: n }, (_, i) => {
    const d = (i - (n - 1) / 2) * pas;
    return horiz ? { ...p, y: p.y + p.h / 2 + d - f / 2, h: f } : { ...p, x: p.x + p.w / 2 + d - f / 2, w: f };
  });
}
/** les vertèbres d'un pont : des renflements réguliers le long de l'axe (le tube biomécanique) */
export function vertebres(p, { pas = 9, gonfle = 1.5 } = {}) {
  const horiz = p.w > p.h, long = horiz ? p.w : p.h, large = horiz ? p.h : p.w, r = large * gonfle / 2, out = [];
  for (let s = pas / 2; s < long; s += pas) out.push({ t: 'rond', cx: horiz ? p.x + s : p.x + p.w / 2, cy: horiz ? p.y + p.h / 2 : p.y + s, r });
  return out;
}
/** les cils d'une cellule : des pointes fines qui sortent de ses bords, perpendiculaires, effilées (le mycélium, la paramécie) */
export function cils(q, { densite = 0.07, long = 9, large = 3 } = {}) {
  const out = [], bords = [[q.x, q.y, 1, 0, 0, -1, q.w], [q.x + q.w, q.y, 0, 1, 1, 0, q.h], [q.x + q.w, q.y + q.h, -1, 0, 0, 1, q.w], [q.x, q.y + q.h, 0, -1, -1, 0, q.h]];
  for (const [x0, y0, dx, dy, nx, ny, L] of bords) {
    const n = Math.max(2, Math.round(L * densite));
    for (let i = 0; i < n; i++) {
      const u = (i + 0.2 + hasard(x0, y0, i) * 0.6) / n, l = long * (0.5 + hasard(i, L, x0) * 0.9);
      if (u < 0.08 || u > 0.92) continue;   // pas dans les coins
      const bx = x0 + dx * u * L, by = y0 + dy * u * L, px = dx, py = dy;   // la base (le long du bord : la largeur du cil)
      out.push({ t: 'poly', pts: [[bx + px * large / 2 - nx * 2, by + py * large / 2 - ny * 2], [bx - px * large / 2 - nx * 2, by - py * large / 2 - ny * 2], [bx + nx * l + px * (hasard(i, bx) - 0.5) * 4, by + ny * l + py * (hasard(by, i) - 0.5) * 4]] });
    }
  }
  return out;
}
/** les ventouses : des renflements ronds tout le long du bord (le tentacule, la pieuvre des abysses) */
export function ventouses(q, { pas = 26, r = 4.5 } = {}) {
  const out = [];
  for (let x = q.x + pas / 2; x < q.x + q.w - 4; x += pas) out.push({ t: 'rond', cx: x, cy: q.y, r }, { t: 'rond', cx: x, cy: q.y + q.h, r });
  for (let y = q.y + pas / 2; y < q.y + q.h - 4; y += pas) out.push({ t: 'rond', cx: q.x, cy: y, r }, { t: 'rond', cx: q.x + q.w, cy: y, r });
  return out;
}
/** les épines : une pointe à chaque coin, vers l'extérieur (la carapace, le xénomorphe) */
export function epines(q, { long = 14, large = 7 } = {}) {
  return [[q.x, q.y, -1, -1], [q.x + q.w, q.y, 1, -1], [q.x, q.y + q.h, -1, 1], [q.x + q.w, q.y + q.h, 1, 1]].map(([x, y, sx, sy]) => ({
    t: 'poly', pts: [[x + sx * -large, y], [x, y + sy * -large], [x + sx * long * 0.72, y + sy * long * 0.72]],
  }));
}
/** les coulures : de la slime qui pend sous une cellule, une goutte au bout (Rick et Morty) */
export function coulures(q, { n = 3, long = 16, large = 6 } = {}) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const u = (i + 0.25 + hasard(q.x, q.y, i) * 0.5) / n, l = long * (0.45 + hasard(i, q.w, q.y) * 1.1), x = q.x + q.w * u, y = q.y + q.h - 3, w = large * (0.7 + hasard(q.h, i) * 0.6);
    out.push({ t: 'rect', x: x - w / 2, y, w, h: l }, { t: 'rond', cx: x, cy: y + l, r: w * 0.85 });
  }
  return out;
}
/** les ogives : une arche brisée sur le haut d'une cellule (la cathédrale) */
export function ogives(q, { haut = 22 } = {}) {
  if (q.w < 50) return [];
  const h = Math.min(haut, q.w * 0.22), l = Math.min(q.w * 0.5, 120);
  return [{ t: 'poly', pts: [[q.x + q.w / 2 - l / 2, q.y + 4], [q.x + q.w / 2 - l * 0.18, q.y - h * 0.55], [q.x + q.w / 2, q.y - h], [q.x + q.w / 2 + l * 0.18, q.y - h * 0.55], [q.x + q.w / 2 + l / 2, q.y + 4]] }];
}
/** les bandes d'alerte d'une liaison : des parallélogrammes en biais, une couleur à eux (NERV) */
export function rayures(p, { pas = 8, couleur = '#ffff00' } = {}) {
  const horiz = p.w > p.h, long = horiz ? p.w : p.h, out = [];
  for (let s = 2; s + pas / 2 < long; s += pas) {
    const a = s, b = s + pas / 2;
    out.push({ t: 'poly', couleur, pts: horiz ? [[p.x + a, p.y + p.h], [p.x + b, p.y + p.h], [p.x + b + p.h * 0.6, p.y], [p.x + a + p.h * 0.6, p.y]]
      : [[p.x, p.y + a], [p.x, p.y + b], [p.x + p.w, p.y + b + p.w * 0.6], [p.x + p.w, p.y + a + p.w * 0.6]] });
  }
  return out;
}
/** une forme → du SVG (décalée de x0, y0) */
export function formeSvg(f, x0, y0, couleur) {
  const r1 = (x) => Math.round(x * 2) / 2; couleur = f.couleur || couleur;
  if (f.t === 'rond') return '<circle cx="' + r1(f.cx - x0) + '" cy="' + r1(f.cy - y0) + '" r="' + r1(f.r) + '" fill="' + couleur + '"/>';
  if (f.t === 'poly') return '<polygon points="' + f.pts.map(([x, y]) => r1(x - x0) + ',' + r1(y - y0)).join(' ') + '" fill="' + couleur + '"/>';
  return '<rect x="' + r1(f.x - x0) + '" y="' + r1(f.y - y0) + '" width="' + r1(f.w) + '" height="' + r1(f.h) + '" rx="' + r1(Math.min(f.w, f.h) / 2) + '" fill="' + couleur + '"/>';
}
