// ⊞ LA CARTE DU XERBOXION (0.64). RS-7 : « la priorité, c'est les mouvements dans l'app avec les haptics, pouvoir voir tout son
// xerboxion » ; la vision originelle (docs/VISION-ORIGINELLE.md) : « l'OS, c'est une map géante où il y a toutes les applications ; je peux
// dézoomer l'app pour aller dans d'autres apps ; chaque app a sa place ; on y va par des swipes dans quatre directions, par mémoire
// musculaire ». C'est le cran de dézoom au-delà de la fractale (pincer le paquet, ⊞, le bord « tout le xerboxion », la page aujourd'hui).
//   - au centre, LE XERBOXION (l'accueil) : un cube ; autour, chaque catégorie est un KOIN dans une des huit directions, ses ploxions en
//     spirale autour de son centre. Chaque ploxion a SA place, stable (boxion_local « reglages/carte » : { places: { id: [x, y] } }) ; un
//     appui long le soulève, on le pose ailleurs (il garde la nouvelle place).
//   - ÉGOCENTRIQUE : elle s'ouvre centrée sur l'app où tu es (« ici »). Le doigt la promène (avec son élan), deux doigts zooment ;
//     toucher une app y va, toucher le cube revient à l'accueil.
//   - trois niveaux (une seule classe change, aux frontières) : LOIN, les koins et leurs glyphes ; MILIEU, les icônes ; PRÈS, les noms,
//     l'état (vivant, endormi, verrouillé) et LE CHEMIN : les swipes pour y aller depuis « ici » (→×2 ↑) — la mémoire musculaire.
//   - LES CONNEXIONS, la seule couleur (« le trait », docs/LOOK.md §3) : un fil entre deux ploxions qui partagent un bion.
//   - l'haptique : un cran à chaque case qui passe sous le centre (hystérésis), une marque à chaque koin, un cran par niveau, une butée
//     aux limites du zoom ; l'ouverture, la signature de l'app.
// Perf (iOS) : UN plan, déplacé par UN transform par image (le doigt ne fait que poser des cibles) ; les cases posées une fois ; aucune
// mesure dans la boucle ; la boucle s'arrête quand tout est immobile.
import { categorieDe, glypheCategorie, CATEGORIES } from './xerkion-icone.js';

export const C = 96;   // la taille d'une case (px, à l'échelle 1)
const DIRS = [[1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1]];   // E, NE, N, NO, O, SO, S, SE
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const borne = (x, a, b) => Math.max(a, Math.min(b, x));
const cle = (x, y) => x + ',' + y;

/** LES PLACES : celles gardées d'abord, puis chaque nouveau ploxion dans le koin de sa catégorie (une spirale autour de son centre) ;
 *  jamais deux sur la même case, jamais sur le cube (0,0). Déterministe : les mêmes entrées → les mêmes places. */
export function placer(liste, gardees = {}) {
  const pris = new Set([cle(0, 0)]), places = {};
  for (const p of liste) { const g = gardees[p.id]; if (p.id != null && Array.isArray(g) && !pris.has(cle(g[0], g[1]))) { places[p.id] = [g[0], g[1]]; pris.add(cle(g[0], g[1])); } }
  const cats = [...new Set(liste.filter(p => p.id != null).map(p => p.cat || categorieDe(p)))].sort((a, b) => Object.keys(CATEGORIES).indexOf(a) - Object.keys(CATEGORIES).indexOf(b));
  const centre = (c) => { const i = Math.max(0, cats.indexOf(c)), d = DIRS[i % 8], r = 6 + Math.floor(i / 8) * 6; return [d[0] * r, d[1] * r]; };
  for (const p of liste) {
    if (p.id == null || places[p.id]) continue;
    const [cx, cy] = centre(p.cat || categorieDe(p));
    for (const [x, y] of spirale(cx, cy)) if (!pris.has(cle(x, y))) { places[p.id] = [x, y]; pris.add(cle(x, y)); break; }
  }
  return places;
}
/** les cases autour d'un centre, anneau par anneau (le centre, puis l'anneau 1, 2…) */
function* spirale(cx, cy) {
  yield [cx, cy];
  for (let r = 1; r < 80; r++) {
    for (let i = -r; i <= r; i++) yield [cx + i, cy - r];
    for (let j = -r + 1; j <= r; j++) yield [cx + r, cy + j];
    for (let i = r - 1; i >= -r; i--) yield [cx + i, cy + r];
    for (let j = r - 1; j >= -r + 1; j--) yield [cx - r, cy + j];
  }
}
/** LE CHEMIN de « ici » à une case : des swipes dans quatre directions, d'abord à l'horizontale (→×2 ↑) */
export function chemin(de, vers) {
  const [x0, y0] = de || [0, 0], [x1, y1] = vers || [0, 0], l = [];
  const dx = x1 - x0, dy = y1 - y0;
  if (dx) l.push((dx > 0 ? '→' : '←') + (Math.abs(dx) > 1 ? '×' + Math.abs(dx) : ''));
  if (dy) l.push((dy > 0 ? '↓' : '↑') + (Math.abs(dy) > 1 ? '×' + Math.abs(dy) : ''));
  return l.join(' ');
}

export function creerCarteXer({ W = globalThis.window, racine, liste, courant = () => null, aller = () => {}, vibrer = () => {}, boxion = null, calme = () => false, glyphe = () => '' }) {
  const D = W.document;
  let el = null, plan = null, places = {}, gardees = null, entrees = [], image = 0, t0 = 0;
  let cam = { x: 0, y: 0, z: 1 }, cible = null, vit = { x: 0, y: 0 }, niveau = '', caseSous = null, koinSous = null;
  const doigts = new Map(); let geste = null;
  const lirePlaces = async () => { if (gardees) return gardees; gardees = ((boxion && await boxion.get('reglages', 'carte').catch(() => null)) || {}).places || {}; return gardees; };
  const garder = () => { if (boxion) boxion.put('reglages', 'carte', { places: gardees }).catch(() => {}); };
  const ecran = () => ({ w: W.innerWidth || 390, h: W.innerHeight || 844 });
  const niveauDe = (z) => (z < 0.6 ? 'loin' : z > 1.5 ? 'pres' : 'milieu');
  /** le monde (cases) → l'écran : le centre de l'écran regarde cam.x, cam.y (en cases) */
  function ecrire() {
    const { w, h } = ecran();
    plan.style.transform = 'translate3d(' + (w / 2 - cam.x * C * cam.z).toFixed(1) + 'px,' + (h / 2 - cam.y * C * cam.z).toFixed(1) + 'px,0) scale(' + cam.z.toFixed(4) + ')';
    const n = niveauDe(cam.z); if (n !== niveau) { if (niveau) vibrer('fx-zoom'); niveau = n; el.dataset.niveau = n; }
    // la case sous le centre (hystérésis : à plus de 0,15 case de son bord)
    const cx = Math.round(cam.x), cy = Math.round(cam.y);
    if ((!caseSous || cx !== caseSous[0] || cy !== caseSous[1]) && Math.abs(cam.x - cx) < 0.35 && Math.abs(cam.y - cy) < 0.35) {
      const occupee = entrees.find(e => e.place[0] === cx && e.place[1] === cy);
      if (caseSous && occupee) vibrer('fx-case');
      caseSous = [cx, cy];
      const k = occupee ? occupee.cat : null; if (k && k !== koinSous) { if (koinSous) vibrer('fx-koin'); koinSous = k; }
    }
  }
  function demander() { if (!image && el) image = W.requestAnimationFrame(boucle); }
  function boucle(t) {
    image = 0; if (!el) return;
    const dt = t0 ? borne((t - t0) / 1000, 0.001, 0.05) : 1 / 60; t0 = t; let encore = false;
    if (cible) {   // un vol (ouvrir, revenir ici, zoomer sur une case) : un amorti exponentiel
      const k = 1 - Math.exp(-dt / 0.09);
      cam.x += (cible.x - cam.x) * k; cam.y += (cible.y - cam.y) * k; cam.z += (cible.z - cam.z) * k;
      if (Math.abs(cible.x - cam.x) + Math.abs(cible.y - cam.y) + Math.abs(cible.z - cam.z) < 0.002) { cam = { ...cible }; const f = cible.fin; cible = null; if (f) f(); } else encore = true;
    } else if (!doigts.size && (Math.abs(vit.x) + Math.abs(vit.y)) > 0.02) {   // l'élan
      cam.x += vit.x * dt; cam.y += vit.y * dt; const a = Math.exp(-dt / 0.35); vit.x *= a; vit.y *= a; encore = true;
    }
    ecrire();
    if (encore) demander(); else t0 = 0;
  }
  function voler(x, y, z, fin = null) { if (calme()) { cam = { x, y, z }; ecrire(); if (fin) fin(); return; } cible = { x, y, z, fin }; vit = { x: 0, y: 0 }; demander(); }

  function construire() {
    const ici = courant(), pIci = ici != null && places[ici] ? places[ici] : [0, 0];
    // les fils : deux ploxions qui partagent un bion (la seule couleur)
    const fils = [], parBion = new Map(), COUL = ['#c0504d', '#4677b5', '#d8b04a'];
    for (const e of entrees) for (const b of (e.bions || []).slice(0, 8)) { if (!parBion.has(b)) parBion.set(b, []); parBion.get(b).push(e); }
    let nFils = 0;
    // seulement les bions RARES (2 à 6 ploxions : là, une connexion dit quelque chose ; un bion partout ferait une toile illisible),
    // en chaîne de proche en proche (pas en étoile : pas de longs fils qui traversent tout)
    for (const [b, l0] of parBion) {
      if (l0.length < 2 || l0.length > 6 || nFils > 160) continue; let h = 0; for (const ch of b) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      const l = [l0[0]], reste = l0.slice(1);
      while (reste.length) { const a = l[l.length - 1]; let j = 0, dm = Infinity; reste.forEach((e, k) => { const d = Math.hypot(e.place[0] - a.place[0], e.place[1] - a.place[1]); if (d < dm) { dm = d; j = k; } }); l.push(reste.splice(j, 1)[0]); }
      for (let i = 1; i < l.length && nFils <= 160; i++) if (Math.hypot(l[i].place[0] - l[i - 1].place[0], l[i].place[1] - l[i - 1].place[1]) <= 6) nFils++, fils.push('<line x1="' + l[i - 1].place[0] * C + '" y1="' + l[i - 1].place[1] * C + '" x2="' + l[i].place[0] * C + '" y2="' + l[i].place[1] * C + '" stroke="' + COUL[h % 3] + '"/>');
    }
    const xs = entrees.map(e => e.place[0]), ys = entrees.map(e => e.place[1]);
    const minX = Math.min(-6, ...xs) - 2, minY = Math.min(-6, ...ys) - 2, maxX = Math.max(6, ...xs) + 3, maxY = Math.max(6, ...ys) + 3;
    // les koins : leur nom et leur glyphe, au centre de leurs ploxions
    const koins = new Map(); for (const e of entrees) { const k = koins.get(e.cat) || { x: 0, y: 0, n: 0 }; k.x += e.place[0]; k.y += e.place[1]; k.n++; koins.set(e.cat, k); }
    plan.innerHTML = '<svg class="px-carte-fils" viewBox="' + minX * C + ' ' + minY * C + ' ' + (maxX - minX) * C + ' ' + (maxY - minY) * C + '" style="left:' + minX * C + 'px;top:' + minY * C + 'px;width:' + (maxX - minX) * C + 'px;height:' + (maxY - minY) * C + 'px">' + fils.join('') + '</svg>'
      + [...koins].map(([k, v]) => '<div class="px-carte-koin" style="left:' + (v.x / v.n * C).toFixed(0) + 'px;top:' + (v.y / v.n * C).toFixed(0) + 'px">' + glyphe(glypheCategorie(k)) + '<b>' + esc(k) + '</b></div>').join('')
      + '<button type="button" class="px-carte-cube" data-carte-id="" style="left:0;top:0" aria-label="le xerboxion, l\'accueil"><i></i><i></i><i></i><b>xerboxion</b></button>'
      + entrees.map(e => '<button type="button" class="px-carte-case' + (e.id === ici ? ' ici' : '') + ' px-carte-' + (e.etat || 'installe') + '" data-carte-id="' + esc(e.id) + '" style="left:' + e.place[0] * C + 'px;top:' + e.place[1] * C + 'px" aria-label="' + esc(e.nom) + '">'
        + '<span class="px-carte-ic">' + (e.icone || '') + '</span><b>' + esc(e.nom) + '</b><small>' + esc(chemin(pIci, e.place) || 'ici') + (e.bions && e.bions.length ? ' · ' + e.bions.length + ' bions' : '') + '</small></button>').join('');
  }
  async function ouvrir() {
    if (el) return true;
    const l = (liste() || []).filter(p => p && p.id != null);
    const g = await lirePlaces(); places = placer(l, g);
    let neuf = false; for (const id in places) if (!g[id]) { g[id] = places[id]; neuf = true; } if (neuf) garder();
    entrees = l.map(p => ({ ...p, cat: p.cat || categorieDe(p), place: places[p.id] }));
    el = D.createElement('div'); el.className = 'px-carte'; el.setAttribute('data-px-app', ''); el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'la carte du xerboxion');
    el.innerHTML = '<div class="px-carte-plan"></div><button type="button" class="px-carte-x" data-carte-fermer aria-label="fermer">✕</button><button type="button" class="px-carte-moi" data-carte-ici>⌂ ici</button><p class="px-carte-aide">glisse · pince · touche une app · appui long : la déplacer</p>';
    plan = el.firstChild; construire();
    (racine || D.body).appendChild(el);
    el.addEventListener('touchstart', (e) => { if (e.cancelable) e.preventDefault(); }, { passive: false });
    el.addEventListener('pointerdown', bas); el.addEventListener('pointermove', bouge); el.addEventListener('pointerup', haut); el.addEventListener('pointercancel', haut);
    const ici = courant(), p = ici != null && places[ici] ? places[ici] : [0, 0];
    cam = { x: p[0], y: p[1], z: 2.4 }; niveau = ''; caseSous = null; koinSous = null; ecrire();
    vibrer('fx-carte-xer');
    voler(p[0], p[1], 1);   // l'écran se réduit dans sa case : on dézoome sur tout le xerboxion
    return true;
  }
  function fermer() { if (!el) return; W.cancelAnimationFrame(image); image = 0; el.remove(); el = plan = null; doigts.clear(); geste = null; cible = null; }

  // ---- le doigt : promener (avec élan), deux doigts : zoomer, toucher : y aller, appui long : déplacer ----
  function bas(e) {
    doigts.set(e.pointerId, [e.clientX, e.clientY]); try { el.setPointerCapture(e.pointerId); } catch (er) { /* */ }
    cible = null; vit = { x: 0, y: 0 };
    if (doigts.size === 2) { const [a, b] = [...doigts.values()]; geste = { pince: true, d0: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, z0: cam.z }; return; }
    const c = e.target.closest ? e.target.closest('[data-carte-id],[data-carte-fermer],[data-carte-ici]') : null;
    geste = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y, bouge: false, cible: c, hist: [[e.timeStamp || Date.now(), e.clientX, e.clientY]], long: null, porte: null };
    const id = c && c.getAttribute('data-carte-id');
    if (id) geste.long = W.setTimeout(() => { if (!geste || geste.bouge) return; geste.porte = c; c.classList.add('porte'); vibrer('fx-tension'); }, 450);
  }
  function bouge(e) {
    if (!geste || !doigts.has(e.pointerId)) return; doigts.set(e.pointerId, [e.clientX, e.clientY]);
    if (geste.pince) {
      const l = [...doigts.values()]; if (l.length < 2) return;
      const z = geste.z0 * Math.hypot(l[0][0] - l[1][0], l[0][1] - l[1][1]) / geste.d0, zb = borne(z, 0.3, 3);
      if (zb !== z && !geste.butee) { geste.butee = true; vibrer('fx-butee'); } else if (zb === z) geste.butee = false;
      cam.z = zb; demander(); return;
    }
    const dx = e.clientX - geste.x, dy = e.clientY - geste.y;
    if (!geste.bouge && Math.hypot(dx, dy) > 8) { geste.bouge = true; if (!geste.porte && geste.long) { W.clearTimeout(geste.long); geste.long = null; } }
    const t = e.timeStamp || Date.now(); geste.hist.push([t, e.clientX, e.clientY]); while (geste.hist.length > 2 && t - geste.hist[0][0] > 100) geste.hist.shift();
    if (geste.porte) { geste.porte.style.translate = dx / cam.z + 'px ' + dy / cam.z + 'px'; return; }
    if (geste.bouge) { cam.x = geste.cx - dx / (C * cam.z); cam.y = geste.cy - dy / (C * cam.z); demander(); }
  }
  function haut(e) {
    doigts.delete(e.pointerId); const g = geste; if (!g) return;
    if (g.pince) { if (!doigts.size) { geste = null; if (cam.z < 0.32) fermer(); } return; }
    geste = null; if (g.long) W.clearTimeout(g.long);
    if (e.type === 'pointercancel') return;
    if (g.porte) { poser(g.porte, e.clientX - g.x, e.clientY - g.y); return; }
    if (g.bouge) {   // l'élan : la vitesse des 80 dernières ms, en cases par seconde
      const t = e.timeStamp || Date.now(); let s = g.hist[0]; for (const h of g.hist) if (t - h[0] <= 80 && t - h[0] >= 8) { s = h; break; }
      const d = Math.max(8, t - s[0]); vit = { x: -(e.clientX - s[1]) / d * 1000 / (C * cam.z), y: -(e.clientY - s[2]) / d * 1000 / (C * cam.z) }; demander(); return;
    }
    const c = g.cible; if (!c) return;
    if (c.hasAttribute('data-carte-fermer')) { vibrer('fx-revenir'); fermer(); return; }
    if (c.hasAttribute('data-carte-ici')) { const i = courant(), p = i != null && places[i] ? places[i] : [0, 0]; vibrer('fx-pose'); voler(p[0], p[1], 1); return; }
    const id = c.getAttribute('data-carte-id') || null, p = id ? places[id] : [0, 0];
    vibrer('fx-ouvrir', id);
    voler(p[0], p[1], 3.2, () => { fermer(); aller(id); });   // on plonge dans sa case
  }
  /** appui long puis lâché : la case prend la place la plus proche, libre ; gardée */
  function poser(c, dx, dy) {
    c.classList.remove('porte'); c.style.translate = '';
    const id = c.getAttribute('data-carte-id'), p = places[id]; if (!p) return;
    const nx = p[0] + Math.round(dx / (C * cam.z)), ny = p[1] + Math.round(dy / (C * cam.z));
    const libre = !(nx === 0 && ny === 0) && !Object.entries(places).some(([k, v]) => k !== id && v[0] === nx && v[1] === ny);
    if (!libre || (nx === p[0] && ny === p[1])) { vibrer('fx-refus'); return; }
    places[id] = [nx, ny]; gardees[id] = [nx, ny]; garder();
    const e = entrees.find(x => x.id === id); if (e) e.place = [nx, ny];
    vibrer('fx-pose'); construire();
  }
  return { ouvrir, fermer, ouverte: () => !!el, places: () => ({ ...places }), chemin, camera: () => ({ ...cam }),
    /** (0.70) les places sans ouvrir la carte (la vue des xers, src/app/vue-xers.js) */
    placesAJour: async () => placer(liste(), await lirePlaces()) };
}
