// @bion autour — ce qu'il y a autour de moi, en continu : les lieux d'OpenStreetMap (toilettes, fontaines, bars, cafés, restos, art, vues,
// parcs…), la distance et la direction, des propositions selon l'heure et le vecteur xerion | api: CATEGORIES, cellule, requete, lire, distance, cap, fleche, trier, proposer, plansLien, capBoussole, requeteVehicules, lireVehicules
// (0.99.9, RS-7 23.10 à Zurich : « dès que je sais ma position, ça fait tous les trucs qui sont autour de moi ; au fur et à mesure que je me
// déplace, ça se met à jour ; des toilettes direct ; fetch tout ce qui existe ; propositions selon mon vecteur xerion » ; docs/MAPION.md).
// Pur, sans DOM ni réseau : le ploxion « Autour » (src/lot/autour.js) fait les requêtes ; le mappion du labo peut le composer.
// Ne pas nuire : la requête part du CENTRE d'une case d'environ 1 km, jamais de ta position exacte (OpenStreetMap ne sait pas où tu es).

/** [genre, glyphe, nom, filtre OSM] — les glyphes passent partout (pas d'emoji) ; l'ordre = l'ordre des puces */
export const CATEGORIES = [
  ['toilettes', 'WC', 'toilettes', ['amenity', 'toilets']],
  ['eau', '≈', 'eau potable', ['amenity', 'drinking_water']],
  ['cafe', '◡', 'cafés', ['amenity', 'cafe']],
  ['manger', '⊓', 'manger', ['amenity', 'restaurant|fast_food|food_court']],
  ['bar', '⊻', 'bars', ['amenity', 'bar|pub|biergarten']],
  ['nuit', '⍟', 'la nuit', ['amenity', 'nightclub']],
  ['glace', '◇', 'glaces', ['amenity', 'ice_cream']],
  ['courses', '⊏', 'courses', ['shop', 'supermarket|convenience|bakery']],
  ['art', '✶', 'art', ['tourism', 'artwork|gallery']],
  ['vue', '◬', 'points de vue', ['tourism', 'viewpoint']],
  ['culture', '⊞', 'musées, ciné, théâtre', ['tourism|amenity', 'museum|attraction|cinema|theatre|library|arts_centre']],
  ['parc', '⊚', 'parcs', ['leisure', 'park|garden|playground']],
  ['velo', '⋈', 'vélos, trottinettes', ['amenity', 'bicycle_rental|kick-scooter_rental|charging_station']],
];
const PAR_GENRE = Object.fromEntries(CATEGORIES.map(c => [c[0], c]));

/** la case (≈ 1,1 km × 0,75 km à Zurich) d'une position : la clé du cache et le centre de la requête */
export function cellule(lat, lng, pas = 0.01) {
  const i = Math.floor(lat / pas), j = Math.floor(lng / pas);
  return { cle: i + ':' + j, lat: Math.round(((i + 0.5) * pas) * 1e5) / 1e5, lng: Math.round(((j + 0.5) * pas) * 1e5) / 1e5, rayon: Math.round(pas * 111320 * 0.75) };
}

/** la requête Overpass (OpenStreetMap) d'une case : tous les genres d'un coup, 400 lieux au plus */
export function requete(c, genres = CATEGORIES.map(x => x[0])) {
  const parties = [];
  for (const g of genres) {
    const cat = PAR_GENRE[g]; if (!cat) continue; const [cles, vals] = cat[3];
    for (const k of cles.split('|')) parties.push('nwr["' + k + '"~"^(' + vals + ')$"](around:' + c.rayon + ',' + c.lat + ',' + c.lng + ');');
  }
  return '[out:json][timeout:20];(' + parties.join('') + ');out center 400;';
}

/** la réponse d'Overpass → des lieux { id, genre, glyphe, nom, lat, lng, tags } (ce qui vient du réseau est vérifié) */
export function lire(json) {
  const out = [], vus = new Set();
  for (const e of (json && Array.isArray(json.elements) ? json.elements : []).slice(0, 2000)) {
    const lat = +(e.lat != null ? e.lat : e.center && e.center.lat), lng = +(e.lon != null ? e.lon : e.center && e.center.lon), t = e.tags || {};
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const cat = CATEGORIES.find(([, , , [cles, vals]]) => cles.split('|').some(k => t[k] && new RegExp('^(' + vals + ')$').test(t[k])));
    if (!cat) continue;
    const id = (e.type || 'n')[0] + e.id; if (vus.has(id)) continue; vus.add(id);
    out.push({ id, genre: cat[0], glyphe: cat[1], nom: String(t.name || t['name:fr'] || t.operator || cat[2]).slice(0, 60), lat, lng,
      gratuit: t.fee === 'no' || t.fee === undefined && cat[0] === 'eau', acces: t.wheelchair === 'yes', horaires: String(t.opening_hours || '').slice(0, 80) });
  }
  return out;
}

const R = 6371008.8, rad = (x) => x * Math.PI / 180;
/** la distance en mètres (haversine) */
export function distance(a, b) {
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
/** le cap de a vers b, en degrés depuis le nord (0 = nord, 90 = est) */
export function cap(a, b) {
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat)), x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng));
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
/** une flèche pour un cap (relatif au nord, ou à ta direction si on connaît la boussole) */
export const fleche = (deg, cap0 = 0) => ['↑', '⇗', '→', '⇘', '↓', '⇙', '←', '⇖']   /* les diagonales doubles : ↗ ↘ ↙ ↖ sont « pictographiques » (le filtre anti-emoji les effaçait) */[Math.round((((deg - cap0) % 360) + 360) % 360 / 45) % 8];
export const metres = (m) => (m < 1000 ? Math.round(m / 10) * 10 + ' m' : (m / 1000).toFixed(m < 10000 ? 1 : 0) + ' km');

/** les lieux triés du plus proche au plus loin, avec leur distance et leur cap */
export function trier(lieux, pos, { genres = null, max = 60 } = {}) {
  return lieux.filter(l => !genres || genres.includes(l.genre)).map(l => ({ ...l, d: distance(pos, l), cap: cap(pos, l) })).sort((a, b) => a.d - b.d).slice(0, max);
}

// ---- les propositions : l'heure, ton vecteur xerion (le temps passé dans tes ploxions), la distance ----
const HEURES = { cafe: [6, 11], courses: [7, 20], manger: [11, 14], glace: [13, 19], parc: [9, 19], art: [10, 19], culture: [10, 20], vue: [7, 21], bar: [17, 2], nuit: [22, 5] };
const ouvertA = (g, h) => { const x = HEURES[g]; if (!x) return 0.4; const [a, b] = x; return (a <= b ? h >= a && h < b : h >= a || h < b) ? 1 : 0.1; };
// un ploxion très utilisé pousse vers un genre de lieu (ex. : la musique → les bars, la cuisine → manger, l'art → l'art)
const AFFINITES = [[/music|son|synth|chill|dj|spotify/i, ['bar', 'nuit']], [/cuisine|bouffe|frigo|stock|courses/i, ['manger', 'courses']], [/art|cre|palette|3d|dessin|galerie/i, ['art', 'culture']],
  [/sant|sport|marche|pas\b/i, ['parc', 'vue']], [/wiki|livre|savoir|lecture|dico/i, ['culture', 'cafe']], [/terrax|map|carte|nexus/i, ['vue', 'art']]];
export function vecteurGenres(usage = {}) {
  const v = {};
  for (const [id, x] of Object.entries(usage || {})) { const t = +(x && (x.seconds || x.temps || x.opens * 60 || x.n)) || 0;   /* usage/stats : { opens, seconds, lastAt } */ for (const [re, gs] of AFFINITES) if (re.test(id)) for (const g of gs) v[g] = (v[g] || 0) + t; }
  const m = Math.max(1, ...Object.values(v)); for (const k of Object.keys(v)) v[k] /= m; return v;
}
/** 5 propositions : ce qui est ouvert à cette heure, ce qui te ressemble, pas trop loin ; jamais deux fois le même genre */
export function proposer(lieux, pos, { heure = new Date().getHours(), usage = {}, max = 5 } = {}) {
  const v = vecteurGenres(usage), vus = new Set(), out = [];
  const sc = trier(lieux, pos, { max: 400 }).filter(l => l.genre !== 'toilettes' && l.genre !== 'eau' && l.genre !== 'velo')
    .map(l => ({ ...l, score: ouvertA(l.genre, heure) * (0.5 + (v[l.genre] || 0)) / (1 + l.d / 350) })).sort((a, b) => b.score - a.score);
  for (const l of sc) { if (vus.has(l.genre)) continue; vus.add(l.genre); out.push(l); if (out.length >= max) break; }
  return out;
}

/** y aller à pied dans Plans (Apple) */
export const plansLien = (l) => 'https://maps.apple.com/?daddr=' + l.lat + ',' + l.lng + '&dirflg=w&q=' + encodeURIComponent(l.nom || '');

// ---- (0.99.15) la boussole : les flèches tournent avec toi ----
/** le cap de l'iPhone (0 = nord) d'un événement deviceorientation : la boussole de WebKit (ou celle de CoreMotion via web-natif), sinon alpha absolu */
export function capBoussole(e) {
  if (!e) return null;
  if (e.webkitCompassHeading != null && Number.isFinite(+e.webkitCompassHeading) && +e.webkitCompassHeading >= 0) return ((+e.webkitCompassHeading % 360) + 360) % 360;
  if (e.absolute && e.alpha != null && Number.isFinite(+e.alpha)) return ((360 - +e.alpha) % 360 + 360) % 360;
  return null;
}

// ---- (0.99.15) les trottinettes et les vélos en direct : sharedmobility.ch (l'open data de l'OFEN, « open use », la source citée) ----
// L'API REST ouverte (identify : un point lon,lat et un rayon) ; le flux GBFS 2.3 demande un e-mail dans l'en-tête : pas utilisé.
// Comme pour OpenStreetMap, la requête part du CENTRE de la case, jamais de ta position.
export const SHAREDMOBILITY = 'https://api.sharedmobility.ch/v1/sharedmobility/identify';
export const enSuisse = (p) => !!p && p.lat > 45.8 && p.lat < 47.9 && p.lng > 5.9 && p.lng < 10.6;
export const requeteVehicules = (c, offset = 0) => SHAREDMOBILITY + '?Geometry=' + c.lng + ',' + c.lat + '&Tolerance=' + c.rayon + '&offset=' + offset + '&geometryFormat=esrijson';
const SORTES = [[/scooter|trotti|kick/i, 'trottinette', '⋈'], [/e-?bike|e-?velo|électrique/i, 'vélo électrique', '⋈'], [/bike|velo|vélo|cargo/i, 'vélo', '⋈']];
/** la réponse de sharedmobility.ch → des lieux genre « velo » ; lue avec tolérance (clés courtes ou ch.bfe.sharedmobility.*, geometry x/y ou GeoJSON) ;
 *  les voitures et ce qui n'est pas disponible sont laissés */
export function lireVehicules(json) {
  const res = Array.isArray(json) ? json : (json && (json.results || json.features)) || [], out = [], vus = new Set();
  for (const r of res.slice(0, 1000)) {
    if (!r || typeof r !== 'object') continue;   // (0.99.17, trouvé par le golden Rust) un null du réseau faisait tout planter
    const a = r.attributes || r.properties || r;
    const v = (k, long) => (a[k] != null ? a[k] : a['ch.bfe.sharedmobility.' + long]);
    const g = r.geometry || {}, co = Array.isArray(g.coordinates) ? g.coordinates : null;
    const lng = +(g.x != null ? g.x : co ? co[0] : (a.lon != null ? a.lon : a.lng)), lat = +(g.y != null ? g.y : co ? co[1] : a.lat);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90) continue;
    const dispo = v('available', 'available'); if (dispo === false || dispo === 'false') continue;
    const type = [].concat(v('vehicle_type', 'vehicle_type') || []).join(' ');
    const sorte = SORTES.find(([re]) => re.test(type)); if (!sorte) continue;
    const id = 'sm-' + String(r.id != null ? r.id : (r.featureId != null ? r.featureId : (a.id != null ? a.id : lat + ',' + lng))).slice(0, 80);
    if (vus.has(id)) continue; vus.add(id);
    const fournisseur = String(v('provider_name', 'provider.name') || v('provider_id', 'provider.id') || '').slice(0, 30);
    const station = v('station_name', 'station.name');
    out.push({ id, genre: 'velo', glyphe: sorte[2], sorte: sorte[1], nom: String(station || (sorte[1] + (fournisseur ? ' · ' + fournisseur : ''))).slice(0, 60), lat, lng, fournisseur, direct: true });
  }
  return out;
}

/**
 * ◉ (0.99.59, RS-7 : « pour Autour, le truc live comme Proche : toujours savoir ce qu'il y a autour, voir quand je partage ma position avec mes
 * potes, et la distance de mes potes ») : le résumé de la Live Activity d'Autour.
 *   pos : ma position · lieux : ceux d'Autour · potes : leurs positions partagées [{ nom, lat, lng, t }] · partage : je partage la mienne ?
 * → { titre, sous, glyphe, compte, cible?, cibleM?, cibleCap? } : le pote le plus proche (frais : moins de 15 min) est la cible ; sinon le lieu
 * le plus proche ; « sous » dit les deux lieux les plus proches et si tu partages.
 */
export function resumeAutour({ pos, lieux = [], potes = [], partage = false, maintenant, frais = 15 * 60e3 } = {}) {
  const ok = (x) => x && Number.isFinite(+x.lat) && Number.isFinite(+x.lng);
  const titre = partage ? 'autour · ⌖ partagée' : 'autour';
  if (!ok(pos)) return { titre, sous: partage ? 'tu partages ta position · où es-tu ?' : 'où es-tu ?', glyphe: 'location.circle', compte: 0 };
  const ps = (potes || []).filter(p => ok(p) && (!Number.isFinite(+p.t) || maintenant - +p.t < frais))
    .map(p => ({ nom: String(p.nom || '?').slice(0, 24), d: distance(pos, p), cap: cap(pos, p) })).sort((a, b) => a.d - b.d);
  const ls = trier((lieux || []).filter(ok), pos, { max: 2 });
  const bouts = ls.map(l => String(l.nom || l.genre || 'un lieu').slice(0, 22) + ' ' + metres(l.d));
  if (partage) bouts.unshift('⌖ tu partages');
  if (ps.length > 1) bouts.push(ps.length + ' potes');
  const cible = ps[0] ? { cible: ps[0].nom, cibleM: Math.round(ps[0].d), cibleCap: Math.round(ps[0].cap) }
    : ls[0] ? { cible: String(ls[0].nom || 'un lieu').slice(0, 40), cibleM: Math.round(ls[0].d), cibleCap: Math.round(ls[0].cap) } : {};
  return { titre, sous: bouts.join(' · ') || 'rien de connu autour', glyphe: ps.length ? 'person.2.wave.2' : 'location.circle', compte: ps.length, ...cible };
}
