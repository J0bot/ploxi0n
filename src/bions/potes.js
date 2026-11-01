// @bion potes — retrouver tes potes (en soirée, sans connexion) : où ils sont par rapport à toi, une boussole, un radar à l'échelle, et les tuiles d'une carte quand il y a du réseau | api: relatif, echelle, ECHELLES, aiguille, tourner, fraicheur, tuile, metresParPixel, zoomPour, tuilesAutour, URL_TUILE, ATTRIBUTION, lisserCap, tourCourt, guidage, tendance, minutesAPied, tuilesZone, ajouterTrace, rdvValide
// (0.99.22, RS-7 24.10 : « il faut avoir une map : si t'es en soirée tu peux savoir où sont tes potes, et t'as une boussole pour les retrouver
// s'il n'y a pas de connexion, ou soit une map directement »). Les positions arrivent par le maillage (src/bions/maille.js : chiffrées pour
// chaque pote, ou pour un salon fermé) ; le GPS marche sans réseau. Donc :
//   - le RADAR (toujours) : toi au centre, tes potes à l'échelle (des anneaux de 25 m à 50 km), nord en haut ou ce que tu regardes en haut ;
//   - la BOUSSOLE vers un pote : une flèche qui tourne avec l'iPhone (le cap vers lui moins le cap de l'iPhone), la distance, la fraîcheur ;
//   - la CARTE (quand il y a du réseau) : les tuiles sombres de CARTO (OpenStreetMap) sous le radar, à la même échelle.
// Pur, sans DOM : le ploxion Proche (src/lot/proche.js) dessine.
import { distance, cap } from './autour.js';

const RAD = Math.PI / 180;
/** où est ami par rapport à moi : la distance (m), le cap (degrés depuis le nord), x vers l'est et y vers le nord (m) */
export function relatif(moi, ami) {
  const d = distance(moi, ami), c = cap(moi, ami);
  return { d, cap: c, x: d * Math.sin(c * RAD), y: d * Math.cos(c * RAD) };
}
export const ECHELLES = [25, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000];
/** le rayon du radar (m) : le plus petit palier où tout le monde tient (avec un peu de marge) */
export function echelle(distances, marge = 1.15) {
  const m = Math.max(0, ...(distances || []).filter(Number.isFinite)) * marge;
  return ECHELLES.find(e => e >= m) || ECHELLES[ECHELLES.length - 1];
}
/** la flèche de la boussole : le cap vers le pote, vu depuis ce que l'iPhone regarde (null = pas de boussole : nord en haut) */
export const aiguille = (capVers, capTelephone) => (capTelephone == null ? ((capVers % 360) + 360) % 360 : (((capVers - capTelephone) % 360) + 360) % 360);
/** un point (x est, y nord) tourné pour que la direction `cap0` soit en haut */
export function tourner(x, y, cap0) {
  if (!cap0) return { x, y };
  const a = cap0 * RAD; return { x: x * Math.cos(a) - y * Math.sin(a), y: x * Math.sin(a) + y * Math.cos(a) };
}
/** depuis quand on sait : « à l'instant », « il y a 40 s », « il y a 3 min » ; vieux au-delà de 2 min */
export function fraicheur(t, maintenant = Date.now()) {
  const s = Math.max(0, Math.round((maintenant - t) / 1000));
  return { texte: s < 8 ? 'à l\'instant' : s < 60 ? 'il y a ' + s + ' s' : 'il y a ' + Math.round(s / 60) + ' min', vieux: s > 120 };
}

// ---- la carte : les tuiles « web mercator » (256 px), comme toutes les cartes du web ----
export const URL_TUILE = (z, x, y) => 'https://basemaps.cartocdn.com/dark_all/' + z + '/' + x + '/' + y + '.png';
export const ATTRIBUTION = '© OpenStreetMap · © CARTO';
/** la tuile (fractionnaire) qui contient un point, au zoom z */
export function tuile(lat, lng, z) {
  const n = 2 ** z, l = Math.max(-85.05112878, Math.min(85.05112878, lat)) * RAD;
  return { x: (lng + 180) / 360 * n, y: (1 - Math.log(Math.tan(l) + 1 / Math.cos(l)) / Math.PI) / 2 * n };
}
/** combien de mètres fait un pixel d'une tuile, à cette latitude et ce zoom */
export const metresParPixel = (lat, z) => 156543.03392 * Math.cos(lat * RAD) / 2 ** z;
/** le zoom dont les pixels sont juste un peu plus fins que voulu (les tuiles sont ensuite agrandies, jamais floues de plus de ×2) */
export function zoomPour(lat, metresParPixelVoulus) {
  const z = Math.floor(Math.log2(156543.03392 * Math.cos(lat * RAD) / Math.max(0.05, metresParPixelVoulus)));
  return Math.max(2, Math.min(19, z));
}
/** les tuiles qui couvrent un rectangle de w × h px centré sur (lat, lng), à l'échelle voulue (m par pixel) : { z, x, y, url, gauche, haut, cote } */
export function tuilesAutour(lat, lng, mpp, w, h) {
  const z = zoomPour(lat, mpp), t = tuile(lat, lng, z), cote = 256 * metresParPixel(lat, z) / mpp, n = 2 ** z, out = [];
  const x0 = Math.floor(t.x - w / 2 / cote), x1 = Math.floor(t.x + w / 2 / cote), y0 = Math.floor(t.y - h / 2 / cote), y1 = Math.floor(t.y + h / 2 / cote);
  for (let y = Math.max(0, y0); y <= Math.min(n - 1, y1); y++) for (let x = x0; x <= x1; x++) {
    const xx = ((x % n) + n) % n;
    out.push({ z, x: xx, y, url: URL_TUILE(z, xx, y), gauche: Math.round(w / 2 + (x - t.x) * cote), haut: Math.round(h / 2 + (y - t.y) * cote), cote: Math.ceil(cote) + 1 });
    if (out.length > 64) return out;
  }
  return out;
}

// ---- (0.99.29, RS-7 01.11 : « améliore la map pour le Bluetooth et la boussole à amis ») ----
/** le cap lissé (degrés) : la boussole de l'iPhone tremble ; un filtre sur le cercle (359° et 1° sont voisins) */
export function lisserCap(prec, nouveau, alpha = 0.25) {
  if (prec == null || !Number.isFinite(+prec)) return nouveau == null ? null : ((+nouveau % 360) + 360) % 360;
  if (nouveau == null || !Number.isFinite(+nouveau)) return prec;
  const d = ((+nouveau - prec + 540) % 360) - 180;
  return ((prec + alpha * d) % 360 + 360) % 360;
}
/** l'angle à afficher, sans jamais faire le tour par le grand côté (350° → 10° = +20°, pas −340°) : on garde un angle cumulé */
export const tourCourt = (affiche, cible) => affiche + (((cible - affiche) % 360 + 540) % 360 - 180);
/** le guidage aux vibrations : la flèche pointe devant toi (± 20°) → un tic, d'autant plus souvent que tu es près ; sinon rien.
 *  → { intervalle (ms) } ou null */
export function guidage(distance, ecart, { cone = 20 } = {}) {
  const e = Math.abs(((ecart % 360) + 540) % 360 - 180);
  if (!Number.isFinite(distance) || e > cone) return null;
  return { intervalle: Math.round(Math.max(350, Math.min(2500, 300 + distance * 6))) };
}
/** tu te rapproches ou tu t'éloignes : sur les 30 dernières secondes, au moins 5 m ou 10 % d'écart. histo = [{ t, d }] → 'rapproche' | 'eloigne' | null */
export function tendance(histo, maintenant = Date.now()) {
  const l = (histo || []).filter(x => maintenant - x.t <= 30000); if (l.length < 2) return null;
  const d0 = l[0].d, d1 = l[l.length - 1].d, seuil = Math.max(5, d0 * 0.1);
  return d1 < d0 - seuil ? 'rapproche' : d1 > d0 + seuil ? 'eloigne' : null;
}
/** combien de minutes à pied (80 m par minute, la marche en ville) */
export const minutesAPied = (d) => Math.max(1, Math.round(d / 80));
/** les tuiles à garder pour la carte hors ligne : un disque de `rayon` m autour du point, aux zooms voulus, au plus `max` (les zooms
 *  les plus fins sont coupés d'abord) → [{ z, x, y, url }] */
export function tuilesZone(lat, lng, rayon = 1500, zooms = [13, 14, 15, 16, 17], max = 450) {
  const dLat = rayon / 111320, dLng = rayon / (111320 * Math.max(0.2, Math.cos(lat * RAD))), out = [];
  for (const z of zooms) {
    const a = tuile(lat + dLat, lng - dLng, z), b = tuile(lat - dLat, lng + dLng, z), n = 2 ** z, l = [];
    for (let y = Math.max(0, Math.floor(a.y)); y <= Math.min(n - 1, Math.floor(b.y)); y++) for (let x = Math.floor(a.x); x <= Math.floor(b.x); x++) { const xx = ((x % n) + n) % n; l.push({ z, x: xx, y, url: URL_TUILE(z, xx, y) }); }
    if (out.length + l.length > max) break;
    out.push(...l);
  }
  return out;
}
/** la trace d'un pote : ses derniers points (pas deux à moins de 3 m l'un de l'autre), `max` au plus */
export function ajouterTrace(trace, p, max = 12) {
  const l = (trace || []).slice(), der = l[l.length - 1];
  if (!p || !Number.isFinite(+p.lat) || !Number.isFinite(+p.lng)) return l;
  if (der && der.t === p.t) return l;
  if (der && relatif(der, p).d < 3) { l[l.length - 1] = { lat: +p.lat, lng: +p.lng, t: p.t }; return l; }
  l.push({ lat: +p.lat, lng: +p.lng, t: p.t }); return l.slice(-max);
}
/** un rendez-vous reçu du maillage (ce qui vient d'à côté est suspect) : { lat, lng, nom (24 car.) } ou null */
export function rdvValide(r) {
  if (!r || typeof r !== 'object') return null;
  const lat = +r.lat, lng = +r.lng; if (!(Math.abs(lat) <= 90 && Math.abs(lng) <= 180)) return null;
  return { lat: Math.round(lat * 1e5) / 1e5, lng: Math.round(lng * 1e5) / 1e5, nom: String(r.nom || 'rendez-vous').replace(/[\u0000-\u001f]/g, '').slice(0, 24) };
}
