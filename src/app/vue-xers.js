// ⊡ LA VUE DES XERS (0.70). RS-7 (14.10) : « la map c'est pas encore ça : le but c'est d'avoir le preview des applis et pouvoir swipe en bas,
// à droite, à gauche, en haut pour changer d'appli, genre comme le wormion » ; et « faire la manœuvre des screenshots, avoir l'impression de
// faire un screenshot sur l'app, mais ça fait comme une image : on peut dézoomer notre xer et voir les autres xers à côté ».
//   - LE XER EN IMAGE : la capture d'écran d'iOS (AppDelegate.swift → « ploxi0n-capture » sur window), le geste des bords « xers », ou ⊡
//     sur la carte : l'écran devient une photo (un éclair, l'image qui recule), au centre ; autour, ses VOISINS en aperçu, qui dépassent
//     des bords : en haut, en bas, à gauche, à droite.
//   - LES VOISINS, ce sont ceux de la carte du xerboxion (src/app/carte-xer.js, placer : chaque ploxion a SA case, l'accueil au centre) :
//     le plus proche dans chaque direction (un cône de 45°, la distance d'abord) — la même mémoire musculaire que la carte (le chemin →×2 ↑).
//   - GLISSER dans une direction : le voisin vient au centre (un cran à chaque case, une butée s'il n'y a rien par là) ; TOUCHER le centre :
//     on y entre (l'image grandit jusqu'à l'écran) ; PINCER : on dézoome encore, la carte entière ; toucher le fond : on revient.
//   - LES APERÇUS : un ploxion vivant, sa photo (le clone inerte de cube-pages, photographier) ; les autres, leur icône et leur nom.
// Perf : un plan, un transform par image pendant le glisser ; les photos prises une fois par ouverture, seulement pour les cases montrées.
// 💭 (extrapolations, à valider avec RS-7) glisser en continu de case en case sans lâcher (le wormion pur) ; les xers d'autres boxions (le
// nexus) aux bords de la carte ; la capture gardée comme un tsoin (la photo du xer à ce moment-là).
import { photographier } from './cube-pages.js';

export const DIRECTIONS = { haut: [0, -1], bas: [0, 1], gauche: [-1, 0], droite: [1, 0] };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ACCUEIL = '·';

/** le voisin d'une case dans une direction : le plus proche dans un cône de 45° (la distance le long de la direction, puis l'écart) */
export function voisin(places, de, dir, exclus = null) {
  const [dx, dy] = DIRECTIONS[dir] || dir, o = places[de] || [0, 0];
  let mieux = null, score = Infinity;
  for (const [id, p] of Object.entries(places)) {
    if (id === de || (exclus && exclus.has(id))) continue;
    const vx = p[0] - o[0], vy = p[1] - o[1], le = vx * dx + vy * dy, ecart = Math.abs(vx * dy - vy * dx);
    if (le <= 0 || ecart > le) continue;
    const s = le + ecart * 1.5;
    if (s < score || (s === score && id < mieux)) { score = s; mieux = id; }
  }
  return mieux;
}

const ecartDe = (places, de, id, dir) => { const [dx, dy] = DIRECTIONS[dir], o = places[de] || [0, 0], p = places[id]; return Math.abs((p[0] - o[0]) * dy - (p[1] - o[1]) * dx); };
const OPPOSE = { haut: 'bas', bas: 'haut', gauche: 'droite', droite: 'gauche' };
/** les quatre voisins : un ploxion n'est que dans UNE direction (la plus alignée) ; et d'où l'on vient est toujours derrière soi
 *  (`venu` : { id, dir } — glisser à droite puis à gauche ramène là où l'on était : la mémoire musculaire) */
export function voisins(places, de, venu = null) {
  const r = {}, pris = new Set();
  if (venu && venu.id != null && places[venu.id]) { r[OPPOSE[venu.dir]] = venu.id; pris.add(venu.id); }
  const restent = Object.keys(DIRECTIONS).filter(d => !(d in r));
  for (let tour = 0; tour < 4 && restent.length; tour++) {
    const c = restent.map(d => ({ d, id: voisin(places, de, d, pris) })).filter(x => x.id);
    if (!c.length) break;
    c.sort((a, b) => ecartDe(places, de, a.id, a.d) - ecartDe(places, de, b.id, b.d));
    const { d, id } = c[0]; r[d] = id; pris.add(id); restent.splice(restent.indexOf(d), 1);
  }
  for (const d of Object.keys(DIRECTIONS)) if (!(d in r)) r[d] = null;
  return r;
}

export function creerVueXers({ W = globalThis.window, racine, liste = () => [], places = () => ({}), courant = () => null, hoteDe = () => null,
  aller = () => {}, accueil = () => {}, carte = () => {}, vibrer = () => {}, icone = (p) => esc(p.icone || '◇'), calme = () => false } = {}) {
  const D = W.document;
  let el = null, plan = null, centre = null, cases = null, photos = new Map(), geste = null, anim = false, lesPlaces = {}, venu = null;
  const ecran = () => ({ w: W.innerWidth || 390, h: W.innerHeight || 844 });
  const taille = () => { const { w, h } = ecran(); const tw = Math.round(w * 0.62); return { tw, th: Math.round(tw * h / w), gap: Math.round(w * 0.07) }; };
  /** les places, l'accueil compris (au centre de la carte) */
  const toutes = () => ({ [ACCUEIL]: [0, 0], ...lesPlaces });
  const nomDe = (id) => { if (id === ACCUEIL) return 'l\'accueil'; const p = liste().find(x => x.id === id); return p ? (p.nom || p.id) : id; };
  function apercu(id) {
    if (photos.has(id)) return photos.get(id);
    let n = null;
    const h = id === ACCUEIL ? null : hoteDe(id);
    if (h) { try { n = photographier(W, h); } catch (e) { n = null; } }
    if (!n) {
      n = D.createElement('div'); n.className = 'px-vx-carte';
      const p = id === ACCUEIL ? null : liste().find(x => x.id === id);
      n.innerHTML = '<span class="px-vx-ic">' + (p ? icone(p) : '<b>⌂</b>') + '</span><b class="px-vx-n"></b><small></small>';
      n.querySelector('.px-vx-n').textContent = nomDe(id);
      n.querySelector('small').textContent = p && p.etat === 'vivant' ? 'ouvert' : p && p.etat === 'endormi' ? 'endormi' : id === ACCUEIL ? 'tes ploxions' : 'touche pour l\'ouvrir';
    }
    photos.set(id, n); return n;
  }
  function tuile(id, dir) {
    const { w, h } = ecran(), { tw, th } = taille(), t = D.createElement('div');
    t.className = 'px-vx-t' + (dir ? ' px-vx-' + dir : ' px-vx-centre'); t.dataset.vx = id; if (dir) t.dataset.dir = dir;
    t.style.width = tw + 'px'; t.style.height = th + 'px';
    const a = apercu(id), z = D.createElement('div'); z.className = 'px-vx-ap';
    if (a.classList.contains('ci-cliche')) { z.style.width = w + 'px'; z.style.height = h + 'px'; z.style.transform = 'scale(' + (tw / w).toFixed(4) + ')'; }
    else { z.style.width = '100%'; z.style.height = '100%'; }
    const clip = D.createElement('div'); clip.className = 'px-vx-clip';
    z.appendChild(a); clip.appendChild(z); t.appendChild(clip);
    const n = D.createElement('span'); n.className = 'px-vx-nom'; n.textContent = nomDe(id); t.appendChild(n);
    return t;
  }
  function peindre() {
    const P = toutes(), { tw, th, gap } = taille();
    plan.textContent = ''; plan.style.transition = 'none'; plan.style.transform = '';
    cases = { centre, ...voisins(P, centre, venu) };
    plan.appendChild(tuile(centre, null));
    for (const dir of Object.keys(DIRECTIONS)) {
      const v = cases[dir]; if (!v) continue;
      const t = tuile(v, dir), [dx, dy] = DIRECTIONS[dir];
      t.style.setProperty('--vx-x', (dx * (tw + gap)) + 'px'); t.style.setProperty('--vx-y', (dy * (th + gap)) + 'px');
      plan.appendChild(t);
    }
    const ch = el.querySelector('.px-vx-dirs');
    if (ch) ch.innerHTML = Object.keys(DIRECTIONS).map(d => '<i class="px-vx-d px-vx-d-' + d + (cases[d] ? '' : ' px-vx-vide') + '"></i>').join('');
  }
  /** glisser : le voisin dans `dir` vient au centre */
  function aller1(dir) {
    if (!el || anim) return false;
    const v = cases && cases[dir]; if (!v) { vibrer('fx-butee'); return false; }
    const { tw, th, gap } = taille(), [dx, dy] = DIRECTIONS[dir];
    anim = true; vibrer('fx-case');
    const fin = () => { anim = false; venu = { id: centre, dir }; centre = v; peindre(); };
    if (calme()) { fin(); return true; }
    plan.style.transition = 'transform .26s cubic-bezier(.2,.8,.2,1)';
    plan.style.transform = 'translate3d(' + (-dx * (tw + gap)) + 'px,' + (-dy * (th + gap)) + 'px,0)';
    W.setTimeout(fin, 270);
    return true;
  }
  /** entrer dans le xer du centre : son image grandit jusqu'à l'écran */
  function entrer() {
    if (!el || anim) return;
    anim = true; vibrer('fx-arrivee');
    const id = centre, t = plan.querySelector('.px-vx-centre');
    const fin = () => { fermer(); if (id === ACCUEIL) accueil(); else aller(id); };
    if (calme() || !t) return fin();
    el.classList.add('px-vx-entre');
    t.style.transform = 'translate(-50%,-50%) scale(' + (ecran().w / taille().tw).toFixed(4) + ')';
    W.setTimeout(fin, 260);
  }
  function fermer() { if (!el) return; el.remove(); el = plan = null; photos = new Map(); cases = null; geste = null; anim = false; }
  // ---- les doigts : glisser (une direction), toucher (entrer / revenir), pincer (la carte) ----
  const doigts = new Map();
  function bas(e) {
    doigts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { el.setPointerCapture(e.pointerId); } catch (er) { /* */ }
    if (doigts.size === 2) { const [a, b] = [...doigts.values()]; geste = { pince: Math.hypot(a.x - b.x, a.y - b.y) }; return; }
    geste = { x0: e.clientX, y0: e.clientY, t0: e.timeStamp || Date.now(), cible: e.target };
  }
  function bouge(e) {
    if (!doigts.has(e.pointerId) || !geste) return;
    doigts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (geste.pince) { const [a, b] = [...doigts.values()]; if (Math.hypot(a.x - b.x, a.y - b.y) / geste.pince < 0.72) { geste = null; vibrer('fx-zoom'); fermer(); carte(); } return; }
    if (anim) return;
    const dx = e.clientX - geste.x0, dy = e.clientY - geste.y0;
    // le plan suit le doigt sur l'axe dominant (un peu freiné s'il n'y a rien par là)
    const h = Math.abs(dx) >= Math.abs(dy), d = h ? (dx < 0 ? 'droite' : 'gauche') : (dy < 0 ? 'bas' : 'haut'), frein = cases && cases[d] ? 1 : 0.25;
    plan.style.transition = 'none'; plan.style.transform = 'translate3d(' + (h ? dx * frein : 0) + 'px,' + (h ? 0 : dy * frein) + 'px,0)';
  }
  function haut(e) {
    if (!doigts.has(e.pointerId)) return; doigts.delete(e.pointerId);
    const g = geste; if (doigts.size === 0) geste = null;
    if (!g || g.pince || anim) return;
    const dx = e.clientX - g.x0, dy = e.clientY - g.y0, dt = Math.max(1, (e.timeStamp || Date.now()) - g.t0), v = Math.hypot(dx, dy) / dt;
    if (Math.hypot(dx, dy) < 10) {
      plan.style.transform = '';
      if (g.cible && g.cible.closest && g.cible.closest('.px-vx-centre')) return entrer();
      const t = g.cible && g.cible.closest && g.cible.closest('[data-dir]'); if (t) return aller1(t.dataset.dir);
      if (g.cible && g.cible.closest && g.cible.closest('[data-vx-fermer]')) { vibrer('fx-revenir'); return fermer(); }
      return;
    }
    // le doigt va vers la gauche : on va vers la DROITE (le voisin de droite arrive), comme on tourne une page
    const h = Math.abs(dx) >= Math.abs(dy), d = h ? (dx < 0 ? 'droite' : 'gauche') : (dy < 0 ? 'bas' : 'haut');
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 70 || v > 0.45) { if (!aller1(d)) { plan.style.transition = 'transform .2s'; plan.style.transform = ''; } }
    else { plan.style.transition = 'transform .2s'; plan.style.transform = ''; }
  }
  /** ouvre la vue, centrée sur l'app à l'écran ; capture : l'écran devient une image (un éclair, puis il recule) */
  async function ouvrir({ capture = false, depuis = undefined } = {}) {
    if (el) fermer();
    try { lesPlaces = (await places()) || {}; } catch (e) { lesPlaces = {}; }
    if (el) fermer();   // deux ouvertures pendant l'attente : une seule vue
    centre = depuis !== undefined ? (depuis == null ? ACCUEIL : depuis) : (courant() || ACCUEIL); venu = null;
    el = D.createElement('div'); el.className = 'px-vx' + (capture ? ' px-vx-capture' : '');
    el.innerHTML = '<div class="px-vx-plan"></div><div class="px-vx-dirs" aria-hidden="true"></div><button type="button" class="px-vx-x" data-vx-fermer aria-label="revenir">✕</button>'
      + '<p class="px-vx-aide">↔ ↕ l\'app d\'à côté · touche : entre · pince : la carte</p>' + (capture ? '<i class="px-vx-eclair"></i>' : '');
    racine.appendChild(el); plan = el.querySelector('.px-vx-plan');
    el.addEventListener('pointerdown', bas); el.addEventListener('pointermove', bouge); el.addEventListener('pointerup', haut);
    el.addEventListener('pointercancel', (e) => { doigts.delete(e.pointerId); geste = null; if (plan) { plan.style.transition = 'transform .2s'; plan.style.transform = ''; } });
    peindre();
    vibrer(capture ? 'fx-zoom' : 'fx-carte');
    if (capture && !calme()) {   // l'image recule : de l'écran entier à sa tuile
      const t = plan.querySelector('.px-vx-centre');
      if (t) { t.style.transition = 'none'; t.style.transform = 'translate(-50%,-50%) scale(' + (ecran().w / taille().tw).toFixed(4) + ')'; void t.offsetWidth; t.style.transition = ''; t.style.transform = ''; }
    }
    return el;
  }
  return { ouvrir, fermer, ouverte: () => !!el, centre: () => (centre === ACCUEIL ? null : centre), cases: () => ({ ...(cases || {}) }), aller: aller1, entrer };
}
