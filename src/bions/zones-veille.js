// @bion zonesVeille — les zones où tu vis, tirées de la veille (les visites de l'iPhone) : regroupées, pondérées par le temps, à quatre niveaux | api: zonesVeille, niveauZone, NIVEAUX
// 🗺 (0.99.59, RS-7 : « pour le mappion, je veux la mini map pour voir les zones autour ») : le widget de mappion dessine ces zones sur une carte
// (MKMapSnapshotter, dans l'extension). Les visites (CLVisit : arrivée, départ, position) sont regroupées quand elles tombent à moins de
// `rayon` mètres d'une zone ; une zone = un centre pondéré par le temps, un rayon (l'étalement, 40 m au moins), le temps total, le nombre de
// visites, et un niveau (les paliers de mappion : lieu, zone, zone habituelle, vraie zone). Pur : pas de DOM, pas d'horloge (maintenant passé).
import { distance } from './carte-noeuds.js';

export const NIVEAUX = [[0, 'lieu'], [3600, 'zone'], [5 * 3600, 'zone habituelle'], [20 * 3600, 'vraie zone']];
/** le niveau (0…3) d'un temps passé (secondes) */
export function niveauZone(s) { let n = 0; NIVEAUX.forEach(([seuil], i) => { if (s >= seuil) n = i; }); return n; }

/**
 * visites : [{ a, d?, la, lo, acc? }] (ms ; sans d = tu y es encore) ; points : [{ t, la, lo }] (pour « moi », le dernier)
 * → { zones: [{ lat, lng, rayon, s, n, niveau, nom }], moi: { lat, lng } | null }
 */
export function zonesVeille({ visites = [], points = [], maintenant, rayon = 80, max = 30, minS = 300 } = {}) {
  const vs = (visites || []).filter(v => v && Number.isFinite(+v.la) && Number.isFinite(+v.lo) && Number.isFinite(+v.a) && !(+v.acc > 250))
    .map(v => ({ lat: +v.la, lng: +v.lo, s: Math.max(0, ((Number.isFinite(+v.d) ? +v.d : maintenant) - +v.a) / 1000) }))
    .filter(v => v.s >= 60 && v.s < 30 * 86400)
    .sort((a, b) => b.s - a.s);
  const zs = [];
  for (const v of vs) {
    let z = null, dz = Infinity;
    for (const x of zs) { const d = distance(x, v); if (d < rayon && d < dz) { z = x; dz = d; } }
    if (!z) { zs.push({ lat: v.lat, lng: v.lng, s: v.s, n: 1, membres: [v] }); continue; }
    const S = z.s + v.s; z.lat = (z.lat * z.s + v.lat * v.s) / S; z.lng = (z.lng * z.s + v.lng * v.s) / S; z.s = S; z.n++; z.membres.push(v);
  }
  const zones = zs.filter(z => z.s >= minS).sort((a, b) => b.s - a.s).slice(0, max).map(z => ({
    lat: +z.lat.toFixed(5), lng: +z.lng.toFixed(5), rayon: Math.round(Math.max(40, ...z.membres.map(m => distance(z, m) + 25))),
    s: Math.round(z.s), n: z.n, niveau: niveauZone(z.s), nom: NIVEAUX[niveauZone(z.s)][1],
  }));
  const tous = [...(points || []).filter(p => p && Number.isFinite(+p.t) && Number.isFinite(+p.la)).map(p => ({ t: +p.t, lat: +p.la, lng: +p.lo })),
    ...(visites || []).filter(v => v && Number.isFinite(+v.a) && Number.isFinite(+v.la)).map(v => ({ t: Number.isFinite(+v.d) ? +v.d : maintenant, lat: +v.la, lng: +v.lo }))];
  const der = tous.reduce((a, p) => (!a || p.t > a.t ? p : a), null);
  return { zones, moi: der ? { lat: +der.lat.toFixed(5), lng: +der.lng.toFixed(5) } : null };
}
