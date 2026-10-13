// ⧉ LA FRACTALE DES PLOXIONS (0.59). RS-7 : « la transition entre app précédente et suivante encore plus stylée. Quand on garde longtemps
// à droite, un aperçu de l'app d'après à droite, et l'inverse à gauche. Des degrés de longtemps et de pression : presser fort = comme
// Windows + Tab, notre app au milieu en plus petit, les apps à droite et à gauche, une fractale symétrique ; laisser presser longtemps = la
// même chose en plus petit, qui défile toute seule, et au relâché on s'arrête sur l'app visée : un slider d'apps. »
// Depuis n'importe quelle zone d'un bord (gauche ou droit), le doigt posé :
//   0. GLISSER vite          → le geste de la zone (⚙ › Gestes des bords) ; passer d'app en app se fait par le GLISSEMENT (glisser()) :
//                              l'app part en biais, l'autre arrive en 3D, un trait de lumière balaie l'écran
//   1. APERÇU (tenu 0,3 s)    → l'app d'à côté passe la tête (bord droit = la suivante, gauche = la précédente) ; tirer vers l'intérieur
//                              l'amène (au-delà de 30 %, lâcher = y aller ; en deçà, tout revient)
//   2. FRACTALE (tenu 0,9 s, ou pressé fort) → l'app au milieu, en petit ; les autres de chaque côté, de plus en plus petites, de plus en
//                              plus serrées (une fractale symétrique) ; le doigt fait défiler ; lâché sur une autre : elle s'ouvre ;
//                              lâché sans bouger : la fractale reste (toucher une app pour l'ouvrir, à côté pour revenir)
//   3. SLIDER (tenu 1,9 s, ou pressé très fort) → plus petit, et ça défile tout seul vers le bord tenu ; le doigt vers le centre ralentit,
//                              au-delà ça repart dans l'autre sens ; lâcher = ouvrir l'app visée
// La pression : PointerEvent.pressure n'existe que sur les iPhone à 3D Touch (6s à XS) ; ailleurs elle vaut 0,5 et la durée fait tout.
// Les cartes : un ploxion vivant est LUI-MÊME (son hôte, figé par le gel, transformé sur place : rien n'est déplacé, aucune iframe ne
// recharge) ; l'accueil, les endormis et les verrouillés (Face ID : jamais leur contenu) sont une carte à leur icône. Que du composé
// (translate, rotateY, scale, opacity).
export const ETAPES = { apercu: 300, fractale: 900, slider: 1900 };
const BOUGE = 14;   // le doigt bouge de plus avant l'aperçu : c'est un glissement, pas un appui
const RESSORT = 'cubic-bezier(.16,1,.3,1)';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const borne = (x, a, b) => Math.max(a, Math.min(b, x));
function animer(el, kf, ms, easing, fin) {
  if (!el || typeof el.animate !== 'function') { if (fin) fin(); return null; }
  const a = el.animate(kf, { duration: ms, easing }); if (fin) { a.onfinish = fin; a.oncancel = fin; } return a;
}

/** le GLISSEMENT d'une app à l'autre : sens +1 = vers la suivante (tout part à gauche), -1 = vers la précédente */
export function glisser({ W = globalThis.window, sortant = null, entrant = null, ecran = null, scene, sens = 1, calme = false } = {}) {
  if (calme || !sens || !scene) return;
  const D = W.document;
  if (sortant) {
    sortant.classList.add('px-fx-sortant'); scene.classList.add('px-transit');
    animer(sortant, [{ transform: 'none', opacity: 1 }, { transform: 'perspective(1400px) translate3d(' + (-sens * 34) + '%,0,0) rotateY(' + (sens * 22) + 'deg) scale(.8)', opacity: 0 }],
      380, 'cubic-bezier(.4,0,.2,1)', () => { sortant.classList.remove('px-fx-sortant'); scene.classList.remove('px-transit'); });
  }
  if (entrant) animer(entrant, [{ transform: 'perspective(1400px) translate3d(' + (sens * 62) + '%,0,0) rotateY(' + (-sens * 24) + 'deg) scale(.84)', opacity: .15 }, { transform: 'none', opacity: 1 }], 460, RESSORT);
  else if (ecran) animer(ecran, [{ transform: 'translate3d(' + (sens * 10) + '%,0,0) scale(.94)', opacity: 0 }, { transform: 'none', opacity: 1 }], 420, RESSORT);
  // la trace : un trait de lumière balaie l'écran dans le sens du passage
  const t = D.createElement('div'); t.className = 'px-fx-trace'; (scene.parentNode || D.body).appendChild(t);
  const w = W.innerWidth || 390, de = sens > 0 ? w : 0, vers = sens > 0 ? 0 : w;
  animer(t, [{ transform: 'translateX(' + de + 'px)', opacity: 0 }, { opacity: 1, offset: 0.25 }, { transform: 'translateX(' + vers + 'px)', opacity: 0 }], 440, 'cubic-bezier(.4,0,.2,1)', () => t.remove());
}

/**
 * @param {object} o
 *   file()          [{ id (null = l'accueil), nom, hote (l'hôte vivant à montrer, sinon null), icone (html), sous }] dans l'ordre des bords
 *   origine()       l'index de ce qui est à l'écran
 *   aller(id)       y aller (sans glissement : la fractale a déjà fait le mouvement)
 */
export function creerFractale({ W = globalThis.window, racine, scene, file, origine, aller, vibrer = () => {}, calme = () => false, actif = () => true }) {
  const D = W.document;
  let etat = 'repos', g = null, cartes = [], focus = 0, depart = 0, fond = null, calque = null, indice = null, image = 0, minuteurs = [], pressionVue = false, cran = 0;
  const boite = () => { const r = scene.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width || W.innerWidth || 390, h: r.height || W.innerHeight || 844 }; };
  const arreterMinuteurs = () => { for (const m of minuteurs) W.clearTimeout(m); minuteurs = []; };

  function monter() {
    const l = file(); if (l.length < 2) return false;
    racine.classList.add('px-fx');
    fond = D.createElement('div'); fond.className = 'px-fx-fond'; racine.appendChild(fond);
    calque = D.createElement('div'); calque.className = 'px-fx-calque'; racine.appendChild(calque);
    indice = D.createElement('div'); indice.className = 'px-fx-indice'; racine.appendChild(indice);
    const b = boite(); Object.assign(calque.style, { left: b.l + 'px', top: b.t + 'px', width: b.w + 'px', height: b.h + 'px' });
    cartes = l.map((e, i) => {
      let el = e.hote, cree = false;
      if (el) el.classList.add('px-fx-carte');
      else { el = D.createElement('div'); el.className = 'px-fx-icone'; el.innerHTML = '<span class="px-fx-ic">' + (e.icone || '') + '</span><b>' + esc(e.nom) + '</b>' + (e.sous ? '<small>' + esc(e.sous) + '</small>' : ''); scene.appendChild(el); cree = true; }
      const c = D.createElement('button'); c.type = 'button'; c.className = 'px-fx-cible'; c.dataset.i = String(i); c.innerHTML = '<span>' + esc(e.nom) + '</span>'; c.setAttribute('aria-label', e.nom);
      calque.appendChild(c);
      return { e, el, cree, c };
    });
    depart = borne(origine(), 0, cartes.length - 1); focus = depart; cran = depart;
    // la pose de départ, sans transition (l'app à l'écran telle quelle, les autres hors champ), puis les transitions jouent
    racine.classList.add('px-fx-suit'); etat = 'depart'; placer(); void racine.offsetWidth; racine.classList.remove('px-fx-suit');
    // le calque reste là après le geste (la fractale ouverte) : toucher une app, glisser pour défiler, toucher à côté pour revenir
    calque.addEventListener('pointerdown', surCalqueBas); calque.addEventListener('pointermove', surCalqueBouge); calque.addEventListener('pointerup', surCalqueHaut);
    return true;
  }
  function demonter() {
    W.cancelAnimationFrame(image); image = 0; arreterMinuteurs();
    for (const k of cartes) { if (k.cree) k.el.remove(); else { k.el.classList.remove('px-fx-carte'); k.el.style.transform = ''; k.el.style.opacity = ''; k.el.style.zIndex = ''; } }
    cartes = [];
    for (const n of [fond, calque, indice]) if (n) n.remove();
    fond = calque = indice = null;
    racine.classList.remove('px-fx', 'px-fx-suit', 'px-fx-ouverte', 'px-fx-apercu');
    etat = 'repos';
  }

  // ---- où va chaque carte ----
  /** l'écart entre deux cartes voisines (px) : la fractale, le slider */
  const unite = (w, sl = etat === 'slider') => w * (sl ? 0.34 * 0.92 : 0.56 * 0.8);
  function pose(i) {
    const { w } = boite(), d = i - focus, a = Math.abs(d), s = Math.sign(d);
    if (etat === 'apercu') {
      const sens = g ? g.sens : 1, p = g ? g.p : 0;
      if (i === depart) return { t: 'perspective(1400px) translate3d(' + (-sens * w * (0.07 + 0.72 * p)) + 'px,0,0) rotateY(' + (sens * (7 + 14 * p)) + 'deg) scale(' + (0.93 - 0.12 * p) + ')', o: 1 - 0.45 * p, z: 50 };
      if (i === depart + sens) return { t: 'perspective(1400px) translate3d(' + (sens * w * 0.72 * (1 - p)) + 'px,0,0) rotateY(' + (-sens * 18 * (1 - p)) + 'deg) scale(' + (0.82 + 0.18 * p) + ')', o: 1, z: 60 };
      return { t: 'perspective(1400px) translate3d(' + (Math.sign(i - depart) * w) + 'px,0,0) scale(.6)', o: 0, z: 1 };
    }
    if (etat === 'depart') return i === depart ? { t: 'none', o: 1, z: 50 } : { t: 'perspective(1400px) translate3d(' + (Math.sign(i - depart) * w) + 'px,0,0) scale(.6)', o: 0, z: 1 };
    if (etat === 'zoom') return i === Math.round(focus) ? { t: 'none', o: 1, z: 90 } : { t: 'perspective(1400px) translate3d(' + (s * w * 0.9) + 'px,0,0) scale(.4)', o: 0, z: 1 };
    const sl = etat === 'slider', s0 = sl ? 0.34 : 0.56, k = sl ? 0.8 : 0.62, u = unite(w, sl);
    const x = s * u * (1 - Math.pow(k, a)) / (1 - k), sc = s0 * Math.pow(k, a), r = -s * Math.min(a, 1.4) * 15;
    return { t: 'perspective(1400px) translate3d(' + x.toFixed(1) + 'px,0,0) rotateY(' + r.toFixed(1) + 'deg) scale(' + sc.toFixed(3) + ')', o: Math.max(0, 1 - a * (sl ? 0.1 : 0.2)), z: 80 - Math.round(a * 10) };
  }
  function placer() {
    const f = Math.round(focus);
    racine.classList.toggle('px-fx-apercu', etat === 'apercu' || etat === 'depart' || etat === 'zoom');
    cartes.forEach((k, i) => {
      const q = pose(i);
      k.el.style.transform = q.t; k.el.style.opacity = String(q.o); k.el.style.zIndex = String(q.z);
      k.c.style.transform = q.t; k.c.style.opacity = String(q.o); k.c.style.zIndex = String(q.z);
      k.c.classList.toggle('on', i === f && etat !== 'apercu');
    });
    if (indice) indice.textContent = etat === 'apercu' ? (g && g.p > 0.3 ? 'lâche pour y aller' : 'tire vers le centre') : etat === 'fractale' ? 'glisse · lâche sur une app' : etat === 'slider' ? 'ça défile · lâche pour ouvrir' : etat === 'ouverte' ? 'touche une app · à côté pour revenir' : '';
    if (f !== cran && (etat === 'fractale' || etat === 'slider' || etat === 'ouverte')) { cran = f; vibrer('page'); }
  }

  function entrer(e) {
    if (!actif()) return;
    if (etat === 'repos' && !monter()) return;
    if (e === 'apercu' && !cartes[depart + (g ? g.sens : 1)]) { e = 'fractale'; }   // rien de ce côté : directement la fractale
    etat = e; vibrer(e === 'apercu' ? 'bord-seuil' : 'appui');
    racine.classList.toggle('px-fx-suit', e === 'slider');
    if (e !== 'apercu' && g) { g.ox = g.x; g.of = focus; }
    if (e === 'slider') { let t0 = 0; const tic = (t) => { if (etat !== 'slider') return; const dt = t0 ? Math.min(0.05, (t - t0) / 1000) : 0; t0 = t; const { w } = boite(); const r = g ? borne((g.x - w / 2) / (w / 2), -1, 1) : 0; const v = Math.abs(r) < 0.15 ? 0 : r * 7; focus = borne(focus + v * dt, 0, cartes.length - 1); placer(); image = W.requestAnimationFrame(tic); }; image = W.requestAnimationFrame(tic); }
    placer();
  }
  function ouvrirIndex(i) {
    const k = cartes[i]; if (!k) return demonter();
    focus = i; etat = 'zoom'; racine.classList.remove('px-fx-suit'); vibrer('ouvrir'); placer();
    const id = k.e.id, meme = i === depart;
    W.setTimeout(() => { demonter(); if (!meme) aller(id); }, calme() ? 0 : 300);
  }
  function revenir() {
    if (etat === 'repos') return;
    focus = depart; ouvrirIndex(depart);
  }

  // ---- le geste, depuis un bord (routeur) ----
  function appui(cote, e) {
    if (!actif() || etat !== 'repos') return;
    g = { sens: cote === 'd' ? 1 : -1, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, bouge: false, p: 0 };
    pressionVue = false;
    minuteurs.push(W.setTimeout(() => { if (g && !g.bouge && etat === 'repos') entrer('apercu'); }, ETAPES.apercu));
    minuteurs.push(W.setTimeout(() => { if (g && !g.tire && (etat === 'repos' || etat === 'apercu') && !g.bouge) entrer('fractale'); }, ETAPES.fractale));
    minuteurs.push(W.setTimeout(() => { if (g && etat === 'fractale' && !g.choisi) entrer('slider'); }, ETAPES.slider));
  }
  function deplace(e) {
    if (!g) return;
    g.x = e.clientX; g.y = e.clientY;
    const pr = typeof e.pressure === 'number' ? e.pressure : 0.5;
    if (pr > 0 && pr < 1 && Math.abs(pr - 0.5) > 0.01) pressionVue = true;   // une vraie pression (3D Touch)
    if (etat === 'repos') {
      if (Math.hypot(g.x - g.x0, g.y - g.y0) > BOUGE) { g.bouge = true; arreterMinuteurs(); return; }
      if (pressionVue && pr > 0.55) entrer('fractale');
      return;
    }
    if (pressionVue && pr > 0.85 && etat === 'fractale') entrer('slider');
    else if (pressionVue && pr > 0.55 && etat === 'apercu') entrer('fractale');
    const { w } = boite();
    if (etat === 'apercu') {
      g.p = borne(((g.x0 - g.x) * g.sens) / (w * 0.6), 0, 1);
      if (g.p > 0.08) g.tire = true;   // il tire : la fractale ne vient plus d'elle-même
      racine.classList.add('px-fx-suit'); placer();
    } else if (etat === 'fractale' || etat === 'ouverte') {
      const u = unite(w, false), f = borne(g.of - (g.x - g.ox) / u, 0, cartes.length - 1);
      if (Math.round(f) !== Math.round(focus)) g.choisi = true;
      focus = Math.round(f); placer();
    }
  }
  /** rend true si la fractale a pris le geste (le routeur ne fait alors pas l'action de la zone) */
  function relache() {
    arreterMinuteurs();
    const e = etat, gg = g; g = null;
    if (e === 'repos') return false;
    racine.classList.remove('px-fx-suit');
    if (e === 'apercu') { if (gg && gg.p >= 0.3) ouvrirIndex(depart + gg.sens); else revenir(); }
    else if (e === 'slider') ouvrirIndex(Math.round(focus));
    else if (e === 'fractale') { if (gg && gg.choisi) ouvrirIndex(Math.round(focus)); else { etat = 'ouverte'; racine.classList.add('px-fx-ouverte'); placer(); } }
    return true;
  }
  function annule() { arreterMinuteurs(); g = null; if (etat !== 'repos' && etat !== 'ouverte') revenir(); }

  // ---- la fractale ouverte : toucher, glisser ----
  let cg = null;
  function surCalqueBas(e) { if (etat !== 'ouverte') return; cg = { x: e.clientX, y: e.clientY, f: focus, bouge: false }; try { calque.setPointerCapture(e.pointerId); } catch (er) { /* */ } }
  function surCalqueBouge(e) {
    if (!cg || etat !== 'ouverte') return;
    if (Math.abs(e.clientX - cg.x) > 8) cg.bouge = true;
    if (cg.bouge) { const u = unite(boite().w, false); focus = Math.round(borne(cg.f - (e.clientX - cg.x) / u, 0, cartes.length - 1)); placer(); }
  }
  function surCalqueHaut(e) {
    if (!cg || etat !== 'ouverte') return; const c = cg; cg = null;
    if (c.bouge) return;
    const cible = D.elementFromPoint ? D.elementFromPoint(e.clientX, e.clientY) : e.target;
    const b = cible && cible.closest ? cible.closest('.px-fx-cible') : null;
    if (b) ouvrirIndex(+b.dataset.i); else revenir();
  }

  return { appui, deplace, relache, annule, etat: () => etat, focus: () => focus, entrer, revenir, ouvrirIndex };
}
