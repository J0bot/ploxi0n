// 🌍 LE TERRAX (0.71). RS-7 (14.10) : « le Pokémon Go du nexus : un ploxion qui mappe des trucs en 3D en AR dans le monde, dans le réel ;
// un parc chiant, on y ajoute des trucs en AR ; un robot, un meuble IKEA, on mappe nos objets en AR ; la convergence du ploxion chambre,
// mapping, mapion, 3d, cad, nexus : le ploxion terrax ». Le braindump entier, les paliers du réel et les quêtes : docs/TERRAX.md.
//   terrion  = la terre dans le réel : la carte calquée sur le réel, l'état actuel du réel (la page « terrion »)
//   terrax   = l'interface à la terre, notre Pokémon Go : l'AR par-dessus la caméra (la page « terrax »)
//   xerion   = nous ; le Xerax (1 : clavier, souris, haptics — maintenant) pour utiliser le terrax
// NATIF ET LÉGER (« le plus possible propre de la machine, du vrai codage optimisé au max pour iPhone ») : aucune bibliothèque.
//   - la carte : un plan de tuiles (des <img>), UN transform pendant le geste, les tuiles posées seulement quand elles changent ;
//   - l'AR : la caméra (getUserMedia, seulement quand la page est à l'écran, coupée dès qu'on la quitte) ; chaque objet posé est projeté
//     par sa vraie direction et sa distance (GPS → cap, distance ; boussole → où regarde l'iPhone ; inclinaison → la hauteur) ;
//   - les capteurs ne tournent que sur leur page, la boucle d'images seulement dans l'AR.
// À TOI PAR DÉFAUT : ce que tu poses reste dans boxion_local (« terrax/objets ») ; partager au nexus est un geste explicite, par objet
// (la chambre jamais). Chaque pose est un tsoin (« tsoins », kind terrax).
// Les pages ([data-page-cube]) sont aussi les faces de son cube (▣, src/app/cube-pages.js) : photographiées sans rien toucher.
// COMPOSER (« toujours commencer par les bions et ploxions déjà dans le nexus ») :
//   - mappion (labo) : ses souvenirs 🧿 (jOSBoxion « mappion/souvenirs » → boxion_local « box:mappion », ou son localStorage) sont une couche
//     du terrion et du terrax, en lecture ; le même fond satellite (ArcGIS World_Imagery) ;
//   - jOSNexus (labo) : le même protocole — partager = POST /nexus/push { kind: 'ancre', payload }, les ancres des autres = GET
//     /nexus/pull?kind=ancre (le shim les relaie au labo en mode connecté ; hors ligne : 503, rien ne casse) ;
//   - l'ancre (la forme proposée pour le bion d'ancres du nexus) : { id, lat, lng, alt, cap, ion (emoji, puis glTF/USDZ), txt, portee, ts }.
//   - le lexique du labo : « terrion = le réel de la Terre » ; « terraxion = la Terre copiée dans le xion en temps réel, somme des tsoins
//     des capteurs » (terrax en est l'abréviation).
// 👁 (0.73) L'AR NATIVE (RS-7 15.10 : « le plus important de tout, c'est l'AR ; utiliser au max les fonctions natives ; et AR Quick Look ») :
// sur l'iPhone, « ouvrir les yeux » ouvre PloxiAR (ARKit + RealityKit, src/natif/ar-natif.js) : le monde aligné sur la gravité et le nord,
// chaque objet à sa vraie direction et sa distance (versAR), caché par le réel derrière lui (LiDAR) ; toucher le réel y pose quelque chose
// (depuisAR → lat, lon). La chambre en AR garde sa carte (ARWorldMap) : tes objets reviennent à leur place exacte. Le scan de la pièce
// (RoomPlan, LiDAR) → un USDZ, ouvert en AR Quick Look à l'échelle 1. Sans elle (le web, un build PLOXI0N_AR=0) : l'AR web ci-dessous.
// 💭 (spéculatif, docs/TERRAX.md §3) ARGeoAnchor là où Apple a la VPS ; glTF en WebGPU ou Metal ; le terrion partagé du nexus ;
// marsion, solax, solion, galaxion ; Xerax 2 (un bion EEG).

export const R_TERRE = 6371008.8;
const rad = (d) => d * Math.PI / 180, deg = (r) => r * 180 / Math.PI;
const borne = (x, a, b) => Math.max(a, Math.min(b, x));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** l'angle ramené dans (−180, 180] */
export const autour = (a) => { let x = ((a + 180) % 360 + 360) % 360 - 180; return x === -180 ? 180 : x; };

/** la distance (m) et le cap (degrés depuis le nord, sens horaire) de a vers b */
export function distanceCap(a, b) {
  const p1 = rad(a.lat), p2 = rad(b.lat), dp = p2 - p1, dl = rad(b.lon - a.lon);
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  const d = 2 * R_TERRE * Math.asin(Math.min(1, Math.sqrt(h)));
  const cap = (deg(Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl))) + 360) % 360;
  return { d, cap };
}
/** le point à `metres` de p, dans la direction `cap` */
export function decaler(p, metres, cap) {
  const d = metres / R_TERRE, t = rad(cap), p1 = rad(p.lat), l1 = rad(p.lon);
  const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(t));
  const l2 = l1 + Math.atan2(Math.sin(t) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
  return { lat: deg(p2), lon: ((deg(l2) + 540) % 360) - 180 };
}
/** web mercator : lat/lon → coordonnées de tuile (fractionnaires) au zoom z, et l'inverse */
export function versTuile(lat, lon, z) {
  const n = 2 ** z, l = rad(borne(lat, -85.05112878, 85.05112878));
  return { x: (lon + 180) / 360 * n, y: (1 - Math.log(Math.tan(l) + 1 / Math.cos(l)) / Math.PI) / 2 * n };
}
export function depuisTuile(x, y, z) {
  const n = 2 ** z;
  return { lat: deg(Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)))), lon: x / n * 360 - 180 };
}
/** L'AR : où un objet (à la distance d, au cap capObjet, à la hauteur dz par rapport aux yeux) tombe sur l'écran, quand l'iPhone regarde
 *  au cap `cap` avec l'inclinaison `tangage` (0 = l'horizon, + = vers le haut) ; champ = l'angle horizontal de la caméra. Rend null hors champ. */
export function projeter({ cap, tangage = 0, champ = 62, w, h }, d, capObjet, dz = 0) {
  const rb = autour(capObjet - cap), demi = champ / 2;
  if (Math.abs(rb) > demi + 6 || d < 0.5) return null;
  const f = (w / 2) / Math.tan(rad(demi)), el = deg(Math.atan2(dz, d));
  const x = w / 2 + f * Math.tan(rad(rb)), y = h / 2 - f * Math.tan(rad(borne(el - tangage, -80, 80)));
  return { x, y, s: borne(14 / Math.max(d, 1), 0.35, 2.4), rb };
}

// ---- l'AR native (0.73) : le monde de l'AR (x = est, z = sud, en mètres depuis l'iPhone à l'ouverture ; y = la hauteur) ----
export const LOIN_AR = 150;   // au-delà, l'objet est rapproché à cette distance (et grandi) : la direction reste vraie, le rendu reste net
/** un objet du terrion → sa place dans l'AR native, vu depuis `moi` ; son texte porte la vraie distance */
export function versAR(moi, o, loin = LOIN_AR) {
  const { d, cap } = distanceCap(moi, o), r = Math.min(d, loin);
  const dist = d < 1000 ? Math.round(d) + ' m' : (d / 1000).toFixed(1) + ' km';
  return { id: o.id, x: r * Math.sin(rad(cap)), y: o.h != null && d < 60 ? +o.h : (d < 10 ? -0.5 : 0), z: -r * Math.cos(rad(cap)),
    taille: borne(r * 0.07, 0.35, 10), emoji: o.emoji || '✨', texte: [(o.texte || '').slice(0, 40), dist].filter(Boolean).join(' · '), d };
}
/** l'inverse : un point posé dans l'AR native → { lat, lon, h } (h : sa hauteur par rapport à l'iPhone) */
export function depuisAR(moi, { x = 0, y = 0, z = 0 } = {}) {
  const d = Math.hypot(x, z), p = d < 0.01 ? { lat: moi.lat, lon: moi.lon } : decaler(moi, d, (deg(Math.atan2(x, -z)) + 360) % 360);
  return { lat: p.lat, lon: p.lon, h: Math.round(y * 100) / 100 };
}

// ---- les quêtes (docs/TERRAX.md §4) ----
export const QUETES_JEU = [
  ['premier-pas', 'Pose ton premier objet sur le terrion.', 1],
  ['parc-chiant', 'Pose 5 objets dans un même endroit vide : un parc qui ne l\'est plus.', 5],
  ['regard', 'Ouvre le terrax (l\'AR) et trouve un objet que tu as posé.', 1],
  ['chambre', 'Mappe 3 objets de ta chambre (à toi seul).', 3],
  ['nexus', 'Partage un objet au nexus.', 1],
  ['marcheur', 'Pose des objets à 1 km l\'un de l\'autre.', 1],
];
export const QUETES_CODE = [
  ['ar-arkit', '✓ (0.73) PloxiAR : ARKit + RealityKit, le monde aligné sur le nord, le LiDAR qui cache, la chambre gardée (ARWorldMap).'],
  ['chambre-lidar', '✓ (0.73) Scanner une pièce au LiDAR (RoomPlan) → un USDZ, ouvert en AR Quick Look à l\'échelle 1.'],
  ['ar-geo', 'Les ancres géographiques d\'ARKit (ARGeoAnchor) là où Apple a sa VPS : la place au mètre près, au lieu du GPS.'],
  ['ar-partage', 'L\'AR à plusieurs (une session collaborative d\'ARKit) : voir les mêmes objets, au même endroit, en même temps.'],
  ['usdz-ion', 'Un modèle USDZ comme ion d\'une ancre : en 3D dans l\'AR, et en AR Quick Look.'],
  ['gltf', 'Afficher un modèle glTF à sa place GPS, le plus léger possible (WebGPU, sinon Metal).'],
  ['tuiles-hors-ligne', 'Garder les tuiles du terrion pour jouer sans réseau (un cache borné, par zone).'],
  ['nexus-commun', 'L\'API du nexus pour les objets partagés (boxion-rt /store, jamais de jeton dans l\'app).'],
  ['rust-moteur', 'Le moteur de projection (GPS, boussole → écran) en Rust → WASM, mesuré contre le JS.'],
  ['koin-ion', 'Le koin du ion : les dossiers ion, 3ion, seption, nexus ; la balade entre les réels au portion.'],
  ['cad', 'Importer une pièce FreeCAD ou KiCad (STEP, glTF) et la poser dans le terrax.'],
];
/** l'avancée de chaque quête du jeu : { id: [fait, but] } */
export function avancee(objets, etat = {}) {
  const terre = objets.filter(o => o.lieu !== 'chambre' && o.lat != null), chambre = objets.filter(o => o.lieu === 'chambre');
  let amas = 0; for (const o of terre) amas = Math.max(amas, terre.filter(x => distanceCap(o, x).d <= 60).length);
  let loin = 0; for (let i = 0; i < terre.length; i++) for (let j = i + 1; j < terre.length; j++) if (distanceCap(terre[i], terre[j]).d >= 1000) loin = 1;
  return { 'premier-pas': [Math.min(1, terre.length), 1], 'parc-chiant': [Math.min(5, amas), 5], regard: [etat.regard ? 1 : 0, 1],
    chambre: [Math.min(3, chambre.length), 3], nexus: [objets.some(o => o.partage) ? 1 : 0, 1], marcheur: [loin, 1] };
}

// ---- les tuiles du terrion ----
// les sources : la même que mappion d'abord (le satellite) ; le plan d'OpenStreetMap en repli. L'attribution est toujours affichée.
export const SOURCES = {
  satellite: { nom: 'satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', max: 19, credit: 'Esri, Maxar, Earthstar Geographics' },
  plan: { nom: 'plan', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', max: 19, credit: '© OpenStreetMap' },
};
export const EMOJIS = ['✨', '🌳', '🗿', '🤖', '🪑', '🎵', '💡', '🏁', '❤️', '🔮', '🍄', '🛸'];

/** une ancre du nexus (ou un souvenir de mappion) → un objet du terrax (lecture seule) */
export const depuisAncre = (a, source) => (a && a.lat != null && (a.lng != null || a.lon != null) ? { id: source + ':' + (a.id != null ? a.id : a.lat + ',' + (a.lng != null ? a.lng : a.lon)), lat: +a.lat, lon: +(a.lng != null ? a.lng : a.lon), emoji: a.ion || a.e || a.emoji || '✨', texte: a.txt || a.texte || a.nom || '', lieu: 'terre', le: a.ts || a.le || Date.now(), source } : null);
export const versAncre = (o) => ({ id: o.id, lat: o.lat, lng: o.lon, alt: null, cap: null, ion: o.emoji, txt: o.texte || '', portee: 'nexus', ts: o.le });

export function creerTerrax({ W = globalThis.window, boxion = null, vibrer = () => {}, nexus = null, sourceDefaut = 'satellite', ar = null } = {}) {
  const D = W.document;
  let objets = null, etat = null, autres = [];   // autres : les souvenirs de mappion, les ancres du nexus (en lecture)
  const lire = async () => {
    if (objets) return objets;
    const v = boxion ? await boxion.get('terrax', 'objets').catch(() => null) : null; objets = Array.isArray(v) ? v : [];
    etat = (boxion ? await boxion.get('terrax', 'etat').catch(() => null) : null) || {};
    await lireMappion();
    return objets;
  };
  // les souvenirs de mappion : là où mappion les garde dans l'app (jOSBoxion sur boxion_local, ou son localStorage)
  async function lireMappion() {
    const l = [];
    try { const d = boxion ? await boxion.get('box:mappion', 'souvenirs').catch(() => null) : null; if (d && Array.isArray(d.data)) l.push(...d.data); } catch (e) { /* */ }
    try { const s = W.localStorage && W.localStorage.getItem('mappion:souvenirs'); if (s) l.push(...(JSON.parse(s) || [])); } catch (e) { /* */ }
    const vus = new Set(autres.map(o => o.id));
    for (const a of l) { const o = depuisAncre(a, 'mappion'); if (o && !vus.has(o.id)) { vus.add(o.id); autres.push(o); } }
  }
  // les ancres des autres, au nexus (mode connecté) : une fois par ouverture, sans bloquer
  async function lireNexus() {
    if (!nexus || !nexus.pull) return 0;
    try { const items = await nexus.pull('ancre'); const vus = new Set(autres.map(o => o.id)), mes = new Set((objets || []).map(o => o.id)); let n = 0;
      for (const a of items || []) { if (a && mes.has(a.id)) continue; const o = depuisAncre(a, 'nexus'); if (o && !vus.has(o.id)) { vus.add(o.id); autres.push(o); n++; } } return n; } catch (e) { return 0; }
  }
  const tous = () => (objets || []).concat(autres);
  const garder = () => { if (boxion) { boxion.put('terrax', 'objets', objets).catch(() => {}); boxion.put('terrax', 'etat', etat).catch(() => {}); } };
  const tsoin = (action, o) => { if (boxion && boxion.append) boxion.append('tsoins', { kind: 'terrax', action, id: o.id, emoji: o.emoji, texte: o.texte || '', lieu: o.lieu, lat: o.lat, lon: o.lon }).catch(() => {}); };

  function mount(hote) {
    let vivant = true, page = 'terrion', moi = null, suivi = null, cam = null, capt = null, image = 0, garde = 0;
    let dispoAR = null, sessionAR = null;   // l'AR native (0.73) : ce que l'iPhone sait faire ; la session ouverte (terre, depuis moi ; chambre)
    const PAGES = [['terrion', '🗺 terrion'], ['terrax', '👁 terrax'], ['chambre', '🛏 chambre'], ['quetes', '⚑ quêtes']];
    hote.innerHTML = '<div class="tx">'
      + '<nav class="tx-onglets">' + PAGES.map(([k, n], i) => '<button type="button" data-page-cube="' + k + '" class="' + (i ? '' : 'on') + '">' + n + '</button>').join('') + '</nav>'
      + '<section data-page-cube-panneau="terrion" class="tx-p tx-terrion"><div class="tx-carte"><div class="tx-tuiles"></div><div class="tx-marques"></div></div>'
      + '<div class="tx-outils"><button type="button" data-tx="source">◐</button><button type="button" data-tx="moi">⌖</button><button type="button" class="tx-plus" data-tx="poser-centre">＋</button></div><p class="tx-credit"></p><i class="tx-mire"></i></section>'
      + '<section data-page-cube-panneau="terrax" class="tx-p tx-ar" hidden><video class="tx-video" playsinline muted autoplay></video><div class="tx-calque"></div>'
      + '<div class="tx-hud"><b data-tx-cap>—</b><small data-tx-info>les yeux du terrax sont fermés</small></div>'
      + '<div class="tx-ar-bas"><button type="button" data-tx="yeux">▶ ouvrir les yeux du terrax</button><button type="button" class="tx-plus" data-tx="poser-ici" hidden>＋ poser ici</button></div></section>'
      + '<section data-page-cube-panneau="chambre" class="tx-p tx-chambre" hidden></section>'
      + '<section data-page-cube-panneau="quetes" class="tx-p tx-quetes" hidden></section></div>';
    const $ = (s) => hote.querySelector(s);
    const carteEl = $('.tx-carte'), tuilesEl = $('.tx-tuiles'), marquesEl = $('.tx-marques');

    // ================= le terrion : la carte =================
    const vue = { lat: 46.5197, lon: 6.6323, z: 15 };   // en attendant ta position : Lausanne
    let source = SOURCES[sourceDefaut] ? sourceDefaut : 'plan', poses = new Map(), dessinDemande = 0, panne = 0;
    const taille = () => { const r = carteEl.getBoundingClientRect(); return { w: r.width || W.innerWidth || 390, h: r.height || W.innerHeight || 700 }; };
    function dessiner() {
      dessinDemande = 0; if (!vivant || page !== 'terrion') return;
      const { w, h } = taille(), S = SOURCES[source], zi = Math.round(borne(vue.z, 2, S.max)), k = 2 ** (vue.z - zi), c = versTuile(vue.lat, vue.lon, zi);
      const tx0 = Math.floor(c.x - w / 2 / 256 / k), tx1 = Math.floor(c.x + w / 2 / 256 / k), ty0 = Math.floor(c.y - h / 2 / 256 / k), ty1 = Math.floor(c.y + h / 2 / 256 / k), n = 2 ** zi;
      const voulues = new Set();
      for (let x = tx0; x <= tx1; x++) for (let y = ty0; y <= ty1; y++) {
        if (y < 0 || y >= n) continue;
        const xx = ((x % n) + n) % n, cle = source + '/' + zi + '/' + xx + '/' + y; voulues.add(cle);
        let im = poses.get(cle);
        if (!im) { im = D.createElement('img'); im.className = 'tx-t'; im.alt = ''; im.decoding = 'async'; im.draggable = false; im.onerror = () => { panne++; im.style.visibility = 'hidden'; }; im.src = S.url.replace('{z}', zi).replace('{x}', xx).replace('{y}', y); tuilesEl.appendChild(im); poses.set(cle, im); }
        im.style.transform = 'translate3d(' + ((x - c.x) * 256 * k + w / 2).toFixed(1) + 'px,' + ((y - c.y) * 256 * k + h / 2).toFixed(1) + 'px,0) scale(' + k.toFixed(4) + ')';
      }
      for (const [cle, im] of poses) if (!voulues.has(cle)) { im.remove(); poses.delete(cle); }
      // les marques : toi, et ce qui est posé
      const pt = (lat, lon) => { const t = versTuile(lat, lon, zi); return [(t.x - c.x) * 256 * k + w / 2, (t.y - c.y) * 256 * k + h / 2]; };
      let html = '';
      for (const o of tous()) { if (o.lieu === 'chambre' || o.lat == null) continue; const [x, y] = pt(o.lat, o.lon); if (x < -40 || y < -40 || x > w + 40 || y > h + 40) continue; html += '<button type="button" class="tx-m' + (o.partage ? ' tx-partage' : '') + (o.source ? ' tx-' + o.source : '') + '" data-tx-o="' + esc(o.id) + '" style="transform:translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)">' + esc(o.emoji) + '</button>'; }
      if (moi) { const [x, y] = pt(moi.lat, moi.lon); html += '<i class="tx-moi" style="transform:translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)"></i>'; }
      marquesEl.innerHTML = html;
      $('.tx-credit').textContent = S.credit + (panne > 3 ? ' · hors ligne : les tuiles reviendront avec le réseau' : '');
    }
    const redessiner = () => { if (!dessinDemande) dessinDemande = W.requestAnimationFrame(dessiner); };
    // le doigt : glisser, pincer, deux touchers (zoom), toucher une marque, un appui long : poser là
    const doigts = new Map(); let g = null;
    carteEl.addEventListener('pointerdown', (e) => {
      doigts.set(e.pointerId, { x: e.clientX, y: e.clientY }); try { carteEl.setPointerCapture(e.pointerId); } catch (er) { /* */ }
      if (doigts.size === 2) { const [a, b] = [...doigts.values()]; g = { pince: Math.hypot(a.x - b.x, a.y - b.y), z0: vue.z }; return; }
      g = { x: e.clientX, y: e.clientY, lat: vue.lat, lon: vue.lon, bouge: false, t: Date.now(), cible: e.target, long: W.setTimeout(() => { if (g && !g.bouge) { const p = pointEcran(g.x, g.y); g = null; vibrer('fx-tension'); poser({ lat: p.lat, lon: p.lon }); } }, 550) };
    });
    carteEl.addEventListener('pointermove', (e) => {
      if (!doigts.has(e.pointerId) || !g) return; doigts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (g.pince) { const [a, b] = [...doigts.values()]; vue.z = borne(g.z0 + Math.log2(Math.hypot(a.x - b.x, a.y - b.y) / g.pince), 3, SOURCES[source].max); return redessiner(); }
      const dx = e.clientX - g.x, dy = e.clientY - g.y; if (!g.bouge && Math.hypot(dx, dy) > 6) { g.bouge = true; W.clearTimeout(g.long); }
      if (!g.bouge) return;
      const t = versTuile(g.lat, g.lon, vue.z), p = depuisTuile(t.x - dx / 256, t.y - dy / 256, vue.z); vue.lat = p.lat; vue.lon = p.lon; redessiner();
    });
    const lacher = (e) => {
      doigts.delete(e.pointerId); if (!g) return; const gg = g; if (!doigts.size) g = null; if (gg.pince) { if (!doigts.size) { vue.z = Math.round(vue.z * 4) / 4; redessiner(); } return; }
      W.clearTimeout(gg.long); if (gg.bouge || e.type !== 'pointerup') return;
      const m = gg.cible && gg.cible.closest && gg.cible.closest('[data-tx-o]'); if (m) return montrer(m.getAttribute('data-tx-o'));
      const t = Date.now(); if (dernierTap && t - dernierTap < 300) { vue.z = borne(Math.round(vue.z) + 1, 3, SOURCES[source].max); vibrer('fx-zoom'); redessiner(); dernierTap = 0; return; } dernierTap = t;
    };
    let dernierTap = 0;
    carteEl.addEventListener('pointerup', lacher); carteEl.addEventListener('pointercancel', lacher);
    function pointEcran(cx, cy) { const r = carteEl.getBoundingClientRect(), { w, h } = taille(), t = versTuile(vue.lat, vue.lon, vue.z); return depuisTuile(t.x + (cx - r.left - w / 2) / 256, t.y + (cy - r.top - h / 2) / 256, vue.z); }
    // ta position : seulement quand le terrion ou le terrax est à l'écran
    function suivre(on) {
      const geo = W.navigator && W.navigator.geolocation;
      if (!on) { if (suivi != null && geo) geo.clearWatch(suivi); suivi = null; return; }
      if (suivi != null || !geo) return;
      let premier = !moi;
      suivi = geo.watchPosition((p) => { moi = { lat: p.coords.latitude, lon: p.coords.longitude, precision: p.coords.accuracy }; if (premier) { premier = false; vue.lat = moi.lat; vue.lon = moi.lon; vue.z = 17; } redessiner(); },
        () => { $('[data-tx-info]').textContent = 'position refusée : Réglages iOS › ploxi0n › Position'; }, { enableHighAccuracy: true, maximumAge: 3000, timeout: 20000 });
    }

    // ================= poser, montrer =================
    let feuille = null;
    const fermerFeuille = () => { if (feuille) { feuille.remove(); feuille = null; } };
    function poser({ lat = null, lon = null, lieu = 'terre' } = {}) {
      fermerFeuille();
      feuille = D.createElement('div'); feuille.className = 'tx-feuille';
      feuille.innerHTML = '<div><p>' + (lieu === 'chambre' ? '🛏 dans ta chambre (à toi seul)' : '📍 ' + (lat != null ? lat.toFixed(5) + ', ' + lon.toFixed(5) : 'ici')) + '</p>'
        + '<div class="tx-emojis">' + EMOJIS.map((e, i) => '<button type="button" data-tx-e="' + e + '" class="' + (i ? '' : 'on') + '">' + e + '</button>').join('') + '</div>'
        + '<textarea data-tx-texte rows="2" placeholder="' + (lieu === 'chambre' ? 'quoi ? (ton robot, ton meuble…)' : 'qu\'est-ce qu\'il y a ici ?') + '"></textarea>'
        + (lieu === 'chambre' ? '<button type="button" data-tx="photo">📷 une photo</button>' : '<label class="tx-nexus"><input type="checkbox" data-tx-partage' + (nexus ? '' : ' disabled') + '> au nexus, pour tout le monde' + (nexus ? '' : ' <small>(la quête nexus-commun)</small>') + '</label>')
        + '<div class="tx-ligne"><button type="button" class="tx-plus" data-tx="graver">graver ici</button><button type="button" data-tx="annuler">✕</button></div></div>';
      hote.appendChild(feuille);
      feuille.addEventListener('click', async (e) => {
        const b = e.target.closest('button'); if (!b && e.target === feuille) return fermerFeuille(); if (!b) return;
        e.stopPropagation();
        if (b.hasAttribute('data-tx-e')) { feuille.querySelectorAll('[data-tx-e]').forEach(x => x.classList.toggle('on', x === b)); vibrer('selection'); return; }
        const a = b.getAttribute('data-tx');
        if (a === 'annuler') return fermerFeuille();
        if (a === 'photo' && W.jOSNatif && W.jOSNatif.photo) { try { feuille.dataset.photo = await W.jOSNatif.photo({ source: 'camera' }); b.textContent = '📷 ✓'; } catch (er) { /* */ } return; }
        if (a === 'graver') {
          await lire();
          const o = { id: 'tx' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36), emoji: feuille.querySelector('[data-tx-e].on').getAttribute('data-tx-e'),
            texte: feuille.querySelector('[data-tx-texte]').value.trim().slice(0, 280), lieu, lat: lieu === 'chambre' ? null : lat, lon: lieu === 'chambre' ? null : lon, le: Date.now() };
          if (feuille.dataset.photo) o.photo = feuille.dataset.photo;
          const pt = feuille.querySelector('[data-tx-partage]');
          objets.push(o); garder(); tsoin('poser', o); vibrer('fx-pose'); fermerFeuille();
          if (pt && pt.checked && nexus) partager(o);
          peindrePage();
        }
      });
    }
    async function partager(o) {
      if (!nexus || o.lieu === 'chambre') return;
      try { const ok = await nexus.push('ancre', versAncre(o)); if (ok === false) throw new Error('refusé'); o.partage = Date.now(); garder(); tsoin('partager', o); vibrer('succes'); }
      catch (er) { vibrer('erreur'); signalerTx('le nexus : ' + String(er.message || er).slice(0, 80) + ' (il demande le mode connecté)'); }
      peindrePage();
    }
    function montrer(id) {
      const o = tous().find(x => x.id === id); if (!o) return;
      fermerFeuille(); vibrer('selection');
      feuille = D.createElement('div'); feuille.className = 'tx-feuille';
      const d = moi && o.lat != null ? distanceCap(moi, o).d : null;
      feuille.innerHTML = '<div><p class="tx-gros">' + esc(o.emoji) + '</p><p>' + esc(o.texte || '—') + '</p><small>' + new Date(o.le).toLocaleString('fr-CH') + (d != null ? ' · à ' + (d < 1000 ? Math.round(d) + ' m' : (d / 1000).toFixed(1) + ' km') : '') + (o.source === 'mappion' ? ' · 🧿 souvenir de mappion' : o.source === 'nexus' ? ' · au nexus, posé par quelqu\'un' : o.partage ? ' · au nexus' : ' · à toi') + '</small>'
        + (o.photo ? '<img class="tx-photo" alt="" src="' + esc(o.photo) + '">' : '')
        + (o.piece && ar ? '<button type="button" class="tx-plus" data-tx="voir-piece">👁 voir en AR (Quick Look)</button>' : '')
        + '<div class="tx-ligne">' + (!o.source && !o.partage && o.lieu !== 'chambre' && nexus ? '<button type="button" data-tx="partager">au nexus</button>' : '') + (o.source ? '' : '<button type="button" data-tx="retirer">retirer</button>') + '<button type="button" data-tx="annuler">✕</button></div></div>';
      hote.appendChild(feuille);
      feuille.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) { if (e.target === feuille) fermerFeuille(); return; }
        e.stopPropagation(); const a = b.getAttribute('data-tx');
        if (a === 'annuler') return fermerFeuille();
        if (a === 'partager') { fermerFeuille(); return partager(o); }
        if (a === 'voir-piece') { vibrer('fx-ouvrir'); ar.voirPiece(o.piece).catch((er) => { b.textContent = String(er.message || er).slice(0, 60); vibrer('erreur'); }); return; }
        if (a === 'retirer') { if (b.dataset.sur !== '1') { b.dataset.sur = '1'; b.textContent = 'sûr ?'; return; } objets = objets.filter(x => x.id !== o.id); garder(); tsoin('retirer', o); vibrer('fx-ferme'); fermerFeuille(); peindrePage(); }
      });
    }

    // ================= le terrax : l'AR =================
    let cap = null, tangage = 0;
    function orienter(e) {
      let c = e.webkitCompassHeading != null ? e.webkitCompassHeading : (e.absolute && e.alpha != null ? 360 - e.alpha : null);
      if (c == null) return;
      // la boussole lissée sur le cercle ; l'inclinaison : l'iPhone tenu droit (beta 90°) regarde l'horizon
      cap = cap == null ? c : (cap + autour(c - cap) * 0.2 + 360) % 360;
      if (e.beta != null) tangage += ((e.beta - 90) - tangage) * 0.2;
    }
    async function ouvrirYeux() {
      const O = W.DeviceOrientationEvent;
      try { if (O && typeof O.requestPermission === 'function') { const r = await O.requestPermission(); if (r !== 'granted') throw new Error('boussole refusée'); } } catch (er) { $('[data-tx-info]').textContent = 'boussole refusée : Réglages iOS › ploxi0n › Mouvement'; return; }
      W.addEventListener('deviceorientation', orienter, true);
      try {
        const md = W.navigator.mediaDevices; if (!md || !md.getUserMedia) throw new Error('pas de caméra ici');
        capt = await md.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        if (!vivant || page !== 'terrax') { fermerYeux(); return; }
        const v = $('.tx-video'); v.srcObject = capt; v.play && v.play().catch(() => {});
      } catch (er) { $('[data-tx-info]').textContent = 'caméra : ' + String(er.message || er).slice(0, 60) + ' (le terrax marche quand même, sans image)'; }
      cam = true; suivre(true); vibrer('fx-ouvrir');
      $('[data-tx="yeux"]').hidden = true; $('[data-tx="poser-ici"]').hidden = false;
      if (!image) image = W.requestAnimationFrame(boucleAR);
      if (!garde) garde = W.setInterval(() => { if (!hote.isConnected || hote.closest('[hidden]') || D.hidden) fermerYeux(); }, 1000);   // caché, quitté : les yeux se ferment
    }
    function fermerYeux() {
      W.removeEventListener('deviceorientation', orienter, true);
      if (capt) { for (const t of capt.getTracks()) t.stop(); capt = null; }
      const v = hote.querySelector('.tx-video'); if (v) v.srcObject = null;
      if (image) { W.cancelAnimationFrame(image); image = 0; } if (garde) { W.clearInterval(garde); garde = 0; }
      cam = null; const y = hote.querySelector('[data-tx="yeux"]'), p = hote.querySelector('[data-tx="poser-ici"]'); if (y) y.hidden = false; if (p) p.hidden = true;
    }
    let ecritAR = '';
    function boucleAR() {
      image = 0; if (!vivant || !cam) return;
      const calque = $('.tx-calque'), r = calque.getBoundingClientRect(), w = r.width || 390, h = r.height || 700;
      let html = '', derriere = 0, vus = 0;
      if (moi && cap != null) {
        const l = tous().filter(o => o.lieu !== 'chambre' && o.lat != null).map(o => ({ o, ...distanceCap(moi, o) })).filter(x => x.d < 2000).sort((a, b) => b.d - a.d);
        for (const x of l) {
          const p = projeter({ cap, tangage, w, h }, x.d, x.cap, 0);
          if (!p) { derriere++; continue; }
          vus++; if (x.d < 40 && !x.o.source && etat && !etat.regard) { etat.regard = Date.now(); garder(); vibrer('succes'); }
          html += '<div class="tx-objet" style="transform:translate3d(' + p.x.toFixed(0) + 'px,' + p.y.toFixed(0) + 'px,0) translate(-50%,-50%) scale(' + p.s.toFixed(3) + ')"><b>' + esc(x.o.emoji) + '</b><small>' + esc((x.o.texte || '').slice(0, 40)) + ' · ' + (x.d < 1000 ? Math.round(x.d) + ' m' : (x.d / 1000).toFixed(1) + ' km') + '</small></div>';
        }
      }
      if (html !== ecritAR) { ecritAR = html; calque.innerHTML = html; }
      $('[data-tx-cap]').textContent = cap == null ? '—' : Math.round(cap) + '° ' + ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'][Math.round(cap / 45) % 8];
      $('[data-tx-info]').textContent = !moi ? 'je cherche ta position…' : cap == null ? 'je cherche le nord…' : vus + ' devant toi' + (derriere ? ' · ' + derriere + ' autour' : '');
      image = W.requestAnimationFrame(boucleAR);
    }

    // ================= l'AR native (0.73) : PloxiAR =================
    const attendrePosition = (ms) => new Promise((ok) => { const t0 = Date.now(); const f = () => { if (moi || !vivant) return ok(moi); if (Date.now() - t0 > ms) return ok(null); W.setTimeout(f, 250); }; f(); });
    const direAR = (t) => { const i = hote.querySelector('[data-tx-info]'); if (i) i.textContent = t; const m = hote.querySelector('[data-tx-msg]'); if (m && page === 'chambre') m.textContent = t; };
    async function ouvrirARNative() {
      suivre(true); direAR('je cherche ta position…');
      const p = moi || await attendrePosition(8000);
      if (!vivant) return;
      if (!p) { direAR('il me faut ta position pour placer le réel : Réglages iOS › ploxi0n › Position'); return; }
      await lire();
      const l = tous().filter(o => o.lieu !== 'chambre' && o.lat != null).map(o => versAR(p, o)).filter(x => x.d < 2000).sort((a, b) => a.d - b.d).slice(0, 60);
      sessionAR = { mode: 'terre', moi: { lat: p.lat, lon: p.lon } }; vibrer('fx-ouvrir');
      direAR(l.length + ' autour de toi · les yeux du terrax (ARKit' + (dispoAR && dispoAR.lidar ? ' + LiDAR' : '') + ')');
      try { await ar.ouvrir({ mode: 'terre', objets: l.map(({ d, ...x }) => x), emojis: EMOJIS }); }
      catch (er) { sessionAR = null; direAR('l\'AR native : ' + String(er.message || er).slice(0, 60) + ' · l\'AR web prend le relais'); ouvrirYeux(); }
    }
    async function ouvrirChambreAR() {
      await lire();
      const avecCarte = !!(dispoAR && dispoAR.chambre);
      // sans la carte de la chambre, les places gardées ne veulent plus rien dire
      if (!avecCarte && objets.some(o => o.lieu === 'chambre' && o.place)) { for (const o of objets) if (o.lieu === 'chambre') delete o.place; garder(); }
      const l = avecCarte ? objets.filter(o => o.lieu === 'chambre' && o.place).map(o => ({ id: o.id, x: o.place.x, y: o.place.y, z: o.place.z, taille: 0.25, emoji: o.emoji, texte: (o.texte || '').slice(0, 40) })) : [];
      sessionAR = { mode: 'chambre' }; vibrer('fx-ouvrir');
      try { await ar.ouvrir({ mode: 'chambre', objets: l, emojis: EMOJIS }); }
      catch (er) { sessionAR = null; direAR('l\'AR native : ' + String(er.message || er).slice(0, 80)); }
    }
    async function scannerPiece() {
      try {
        const r = await ar.scannerPiece(); await lire();
        if (!r || !r.nom) return;
        const o = { id: 'tx' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36), emoji: '📐', texte: 'ta pièce · ' + new Date().toLocaleDateString('fr-CH'), lieu: 'chambre', lat: null, lon: null, le: Date.now(), piece: r.nom };
        objets.push(o); garder(); tsoin('scanner', o); vibrer('succes'); peindrePage(); if (vivant) montrer(o.id);
      } catch (er) { if (!/annul/i.test(String((er && er.message) || er))) { direAR('le scan : ' + String((er && er.message) || er).slice(0, 80)); vibrer('erreur'); } }
    }
    // ce que l'AR native raconte : une pose (gardée ici, comme une pose sur la carte), un objet touché (la quête regard), la chambre neuve
    function surAR(e) {
      const s = sessionAR; if (!s || !e) return;
      if (e.type === 'pose') {
        const o = { id: e.id || ('tx' + Date.now().toString(36)), emoji: e.emoji || '✨', texte: String(e.texte || '').slice(0, 280), lieu: s.mode === 'chambre' ? 'chambre' : 'terre', le: Date.now(), ar: true };
        if (s.mode === 'chambre') Object.assign(o, { lat: null, lon: null, place: { x: +e.x || 0, y: +e.y || 0, z: +e.z || 0 } });
        else Object.assign(o, depuisAR(s.moi, e));
        lire().then(() => { if (objets.some(x => x.id === o.id)) return; objets.push(o); garder(); tsoin('poser', o); vibrer('fx-pose'); peindrePage(); });
      } else if (e.type === 'touche') {
        const o = (objets || []).find(x => x.id === e.id);
        if (o && etat && !etat.regard) { etat.regard = Date.now(); garder(); vibrer('succes'); }
      } else if (e.type === 'chambre-neuve') {
        for (const o of objets || []) if (o.lieu === 'chambre') delete o.place;
        garder();
      } else if (e.type === 'ferme') {
        sessionAR = null; peindrePage();
        if (ar) ar.disponible().then((d) => { dispoAR = d; if (vivant && page === 'chambre') peindreChambre(); });
      }
    }
    const arreterAR = ar ? ar.ecouter(surAR) : () => {};
    if (ar) ar.disponible().then((d) => {
      dispoAR = d; if (!vivant || !d) return;
      const y = hote.querySelector('[data-tx="yeux"]'); if (y) y.textContent = '▶ ouvrir les yeux du terrax · ARKit' + (d.lidar ? ' + LiDAR' : '');
      if (page === 'chambre') peindreChambre();
    });

    // ================= la chambre, les quêtes =================
    function peindreChambre() {
      const l = (objets || []).filter(o => o.lieu === 'chambre');
      $('.tx-chambre').innerHTML = '<p class="tx-titre">🛏 ta chambre · à toi seul, jamais envoyée</p>'
        + (l.length ? '<div class="tx-liste">' + l.map(o => '<button type="button" data-tx-o="' + esc(o.id) + '"><b>' + esc(o.emoji) + '</b><span>' + esc(o.texte || '—') + '</span>' + (o.photo ? '<img alt="" src="' + esc(o.photo) + '">' : '') + '</button>').join('') + '</div>' : '<p class="tx-vide">Rien encore. Ton robot, ton meuble, ta plante : mappe-les.</p>')
        + '<button type="button" class="tx-plus" data-tx="poser-chambre">＋ un objet de ta chambre</button>'
        + (dispoAR ? '<button type="button" data-tx="ar-chambre">👁 ta chambre en AR' + (dispoAR.chambre ? ' · tes objets à leur place' : '') + '</button>' : '')
        + (dispoAR && dispoAR.piece ? '<button type="button" data-tx="scanner">📐 scanner ta pièce (LiDAR)</button>' : '')
        + '<p class="tx-vide" data-tx-msg>' + (dispoAR ? (dispoAR.piece ? 'La pièce scannée s\'ouvre en AR Quick Look : pose-la à l\'échelle 1 où tu veux.' : 'Le scan de la pièce demande le LiDAR (iPhone Pro).') : '💭 l\'AR native (ARKit) et le scan LiDAR : sur l\'iPhone.') + '</p>';
    }
    function peindreQuetes() {
      const a = avancee(objets || [], etat || {});
      $('.tx-quetes').innerHTML = '<p class="tx-titre">⚑ les quêtes du terrax</p><ul class="tx-q">' + QUETES_JEU.map(([k, t]) => { const [f, b] = a[k]; return '<li class="' + (f >= b ? 'fait' : '') + '"><b>' + (f >= b ? '✓' : f + '/' + b) + '</b><span>' + esc(t) + '</span></li>'; }).join('') + '</ul>'
        + '<p class="tx-titre">⌨ les quêtes du code · pour qui veut aider</p><ul class="tx-q tx-code">' + QUETES_CODE.map(([k, t]) => '<li><b>' + esc(k) + '</b><span>' + esc(t) + '</span></li>').join('') + '</ul>'
        + '<p class="tx-vide">« Le but du jeu, c\'est que tout le monde m\'aide à implémenter tout ça : du code de zinzin ultra optimisé à un rewrite Rust, tout est permis. » — RS-7 · docs/TERRAX.md</p>';
    }
    function peindrePage() { if (page === 'terrion') redessiner(); if (page === 'chambre') peindreChambre(); if (page === 'quetes') peindreQuetes(); }
    function allerPage(k) {
      if (!PAGES.some(p => p[0] === k)) return;
      if (page === 'terrax' && k !== 'terrax') fermerYeux();
      page = k;
      hote.querySelectorAll('[data-page-cube]').forEach(b => b.classList.toggle('on', b.getAttribute('data-page-cube') === k));
      hote.querySelectorAll('[data-page-cube-panneau]').forEach(s => { s.hidden = s.getAttribute('data-page-cube-panneau') !== k; });
      suivre(k === 'terrion' || k === 'terrax');
      peindrePage();
    }
    hote.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b || !hote.contains(b) || (feuille && feuille.contains(b))) return;
      if (b.hasAttribute('data-page-cube')) { vibrer('selection'); return allerPage(b.getAttribute('data-page-cube')); }
      if (b.closest('.tx-chambre') && b.hasAttribute('data-tx-o')) return montrer(b.getAttribute('data-tx-o'));
      const a = b.getAttribute('data-tx');
      if (a === 'source') { source = source === 'satellite' ? 'plan' : 'satellite'; for (const im of poses.values()) im.remove(); poses.clear(); panne = 0; vibrer('selection'); return redessiner(); }
      if (a === 'moi') { if (moi) { vue.lat = moi.lat; vue.lon = moi.lon; vibrer('fx-case'); redessiner(); } else { suivre(true); $('.tx-credit').textContent = 'je cherche ta position…'; } return; }
      if (a === 'poser-centre') return poser({ lat: vue.lat, lon: vue.lon });
      if (a === 'poser-ici') { if (!moi) return vibrer('fx-refus'); const p = cap != null ? decaler(moi, 3, cap) : moi; return poser({ lat: p.lat, lon: p.lon }); }
      if (a === 'poser-chambre') return poser({ lieu: 'chambre' });
      if (a === 'yeux') return dispoAR ? ouvrirARNative() : ouvrirYeux();
      if (a === 'ar-chambre') return ouvrirChambreAR();
      if (a === 'scanner') return scannerPiece();
    });
    const signalerTx = (t) => { const c = hote.querySelector('.tx-credit'); if (c) c.textContent = t; };
    lire().then(() => { if (vivant) { allerPage('terrion'); peindreChambre(); peindreQuetes(); lireNexus().then((n) => { if (n && vivant) redessiner(); }); } });
    return {
      unmount() { vivant = false; arreterAR(); fermerYeux(); suivre(false); if (dessinDemande) W.cancelAnimationFrame(dessinDemande); fermerFeuille(); hote.innerHTML = ''; },
      // le contrat du cube des pages (src/app/cube-pages.js) n'est pas nécessaire : [data-page-cube] le dit déjà ; pour les essais :
      page: () => page, allerPage, vue: () => ({ ...vue }), position: (p, centrer = true) => { moi = p; if (centrer) { vue.lat = p.lat; vue.lon = p.lon; vue.z = 17; } redessiner(); }, cap: (c, t = 0) => { cap = c; tangage = t; },
    };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps.terrax = { manifest: { id: 'terrax', name: 'terrax', icon: '🌍' }, mount };
  return { ploxion: { id: 'terrax', nom: 'terrax', icone: '🌍', interne: true, cat: 'cartes', type: 'ploxion', description: 'le Pokémon Go du nexus : le terrion (la carte du réel), le terrax (l\'AR), ta chambre, les quêtes', bions: ['jOSNatif'] }, lire };
}
