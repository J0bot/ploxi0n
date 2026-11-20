// @bion carteNoeuds — la carte du maillage sur la vraie carte : la qualité d'un lien, les rencontres (où j'entendais quel nœud), les zones de
// nœud, la liste à dessiner (positions annoncées, zones, potes) | api: qualite, couleurQualite, rencontre, zones, noeudsCarte, cadrer
// 🗺 (0.99.53, RS-7 : « une vraie map de Proche mêlée au mappion, pour voir les positions des nodes, ou les zones de nodes avec leur vitesse
// de connexion s'ils font partie du xion »). Un nœud du maillage ne dit PAS où il est (ne pas nuire) : sa ZONE, c'est là où MON téléphone
// l'entendait, pondérée par la qualité du lien. Seuls les nœuds fixes qui l'annoncent eux-mêmes (ann.d.pos : un Pi, un ESP32 relais) ont une
// position. Pur : pas de DOM, pas d'horloge, testable.

const R = 6371000, rad = (d) => d * Math.PI / 180;
export function distance(a, b) {
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * la qualité d'un lien, 0 (mauvais) … 1 (excellent), d'après ce qu'on sait : l'aller-retour (ms, le ping de Proche), la distance estimée
 * par le Bluetooth (m), le débit (paquets reçus par minute), les sauts (0 = direct). Ce qu'on ignore ne compte pas.
 */
export function qualite({ rtt = null, distanceM = null, debit = null, sauts = 0 } = {}) {
  const parts = [];
  if (Number.isFinite(rtt)) parts.push(rtt <= 30 ? 1 : rtt >= 800 ? 0 : 1 - Math.log(rtt / 30) / Math.log(800 / 30));
  if (Number.isFinite(distanceM)) parts.push(distanceM <= 1 ? 1 : distanceM >= 40 ? 0 : 1 - Math.log(distanceM) / Math.log(40));
  if (Number.isFinite(debit)) parts.push(Math.min(1, debit / 30));
  let q = parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 0.5;
  if (sauts > 0) q *= Math.pow(0.6, sauts);   // chaque saut divise ce qui passe
  return Math.max(0, Math.min(1, q));
}
/** la couleur d'une qualité : rouge (lent) → orange → jaune → vert (rapide) ; et son mot */
export function couleurQualite(q) {
  const paliers = [[0, '#ff4d6d', 'lent'], [0.35, '#ffa24d', 'moyen'], [0.6, '#ffe14d', 'bon'], [0.8, '#4dff9a', 'rapide']];
  let c = paliers[0]; for (const p of paliers) if (q >= p[0]) c = p;
  return { couleur: c[1], mot: c[2] };
}

/** une rencontre : où j'étais (ma position, sa précision), qui j'entendais, à quelle qualité, quand ; null si elle ne vaut rien */
export function rencontre({ fp, nom = '', role = 'noeud', xion = false, moi, t, rtt = null, distanceM = null, debit = null, sauts = 0 }) {
  if (!fp || !moi || !Number.isFinite(+moi.lat) || !Number.isFinite(+moi.lng) || !Number.isFinite(t)) return null;
  if (Number.isFinite(+moi.precision) && +moi.precision > 150) return null;   // une position trop floue ne place rien
  return { fp: String(fp), nom: String(nom || '').slice(0, 24), role, xion: !!xion, lat: +moi.lat, lng: +moi.lng, acc: Number.isFinite(+moi.precision) ? +moi.precision : null,
    t, q: qualite({ rtt, distanceM, debit, sauts }), sauts };
}

/**
 * les zones de nœud : pour chaque nœud, le centre de mes positions quand je l'entendais (pondéré par la qualité : là où le lien est bon,
 * le nœud est probablement plus près), un rayon (l'étalement, au moins 15 m), la qualité moyenne, la meilleure, le nombre, le dernier vu.
 * depuis : ne garder que les rencontres plus récentes (ms) ; 0 = toutes.
 */
export function zones(rencontres, { depuis = 0 } = {}) {
  const par = new Map();
  for (const r of rencontres || []) { if (!r || r.t < depuis) continue; if (!par.has(r.fp)) par.set(r.fp, []); par.get(r.fp).push(r); }
  const out = [];
  for (const [fp, l] of par) {
    const poids = l.map(r => 0.15 + r.q), P = poids.reduce((a, b) => a + b, 0);
    const lat = l.reduce((a, r, i) => a + r.lat * poids[i], 0) / P, lng = l.reduce((a, r, i) => a + r.lng * poids[i], 0) / P, c = { lat, lng };
    const ecarts = l.map(r => distance(c, r)).sort((a, b) => a - b);
    const rayon = Math.max(15, ecarts[Math.min(ecarts.length - 1, Math.floor(ecarts.length * 0.8))] || 0);
    const der = l.reduce((a, r) => (r.t > a.t ? r : a), l[0]);
    out.push({ fp, nom: der.nom, role: der.role, xion: l.some(r => r.xion), lat, lng, rayon: Math.round(rayon), q: l.reduce((a, r) => a + r.q, 0) / l.length,
      qMax: Math.max(...l.map(r => r.q)), n: l.length, vu: der.t });
  }
  return out.sort((a, b) => b.vu - a.vu);
}

/**
 * ce qu'on dessine : chaque nœud connu (la topologie du maillage) avec sa position annoncée s'il en a une (pos), sinon sa zone ; les potes
 * (leurs positions partagées) ; moi. topologie : maille.topologie() ; positions : maille.positions() ; zs : zones(...)
 */
export function noeudsCarte({ topologie = { noeuds: [], liens: [] }, positions = [], zs = [], moi = null } = {}) {
  const parFp = new Map(zs.map(z => [z.fp, z])), parPos = new Map((positions || []).map(p => [p.fp || p.o, p]));
  const l = [];
  for (const n of topologie.noeuds || []) {
    if (n.moi || n.muet) continue;
    const z = parFp.get(n.id), pote = parPos.get(n.id);
    const pos = n.pos && Number.isFinite(+n.pos.lat) && Number.isFinite(+n.pos.lng) ? { lat: +n.pos.lat, lng: +n.pos.lng, precision: +n.pos.precision || null, source: 'annoncee' }
      : pote && Number.isFinite(+pote.lat) ? { lat: +pote.lat, lng: +pote.lng, precision: +pote.precision || null, source: 'pote' } : null;
    l.push({ fp: n.id, nom: n.nom || '', role: n.role || 'noeud', xion: !!(n.xion || (n.cap && n.cap.includes('xion'))), direct: !!n.direct, sauts: n.sauts,
      pos, zone: z ? { lat: z.lat, lng: z.lng, rayon: z.rayon } : null, q: z ? z.q : null, n: z ? z.n : 0, vu: z ? z.vu : null });
    parFp.delete(n.id);
  }
  // les zones de nœuds qu'on n'entend plus en ce moment : gardées (la carte se souvient), marquées « absent »
  for (const z of parFp.values()) l.push({ fp: z.fp, nom: z.nom, role: z.role, xion: z.xion, direct: false, sauts: null, absent: true, pos: null, zone: { lat: z.lat, lng: z.lng, rayon: z.rayon }, q: z.q, n: z.n, vu: z.vu });
  return { noeuds: l, moi: moi && Number.isFinite(+moi.lat) ? { lat: +moi.lat, lng: +moi.lng } : null };
}

/** le cadre qui contient tout (centre, et le rayon en mètres à montrer), pour choisir le zoom des tuiles */
export function cadrer(carte, { min = 120 } = {}) {
  const pts = [];
  if (carte.moi) pts.push({ ...carte.moi, r: 0 });
  for (const n of carte.noeuds) { if (n.pos) pts.push({ ...n.pos, r: 0 }); else if (n.zone) pts.push({ ...n.zone, r: n.zone.rayon }); }
  if (!pts.length) return null;
  const c = carte.moi || { lat: pts.reduce((a, p) => a + p.lat, 0) / pts.length, lng: pts.reduce((a, p) => a + p.lng, 0) / pts.length };
  const rayon = Math.max(min, ...pts.map(p => distance(c, p) + (p.r || 0)));
  return { lat: c.lat, lng: c.lng, rayon: Math.round(rayon * 1.15) };
}
