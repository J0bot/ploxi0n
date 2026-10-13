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
export const ETAPES = { apercu: 300, fractale: 900, slider: 1900, cube: 1200 };   // cube : immobile dans le slider
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
 *   fermer(id)      (0.60) fermer ce ploxion (la carte jetée vers le haut) ; l'accueil ne se ferme pas
 */
// (0.60, RS-7, une capture du sélecteur d'apps d'iOS : « ça, mais en mille fois mieux » ; puis ses croquis : « pas besoin de coins, que
// des carrés », « le curseur de réel », « filtrage de photons », « kion 3D, kion 4D », « le but : que le xer devienne un cube ; au bout
// d'un moment c'est comme manipuler un cube, avec les haptics » ; « avec le gyroscope on peut contrôler ça aussi » ; « le mode freefall »).
//   FRACTALE : de grandes cartes en jeu de cartes, l'icône et le nom au-dessus de chacune ; le doigt les fait défiler et elles filent sur
//              leur élan ; jeter une carte vers le haut ferme le ploxion. Symétrique (le passé à gauche, la suite à droite), en profondeur.
//   SLIDER   : le FILTRAGE DE PHOTONS — autour du CURSEUR DE RÉEL (le trait vertical au milieu, ses deux barres en T), les cartes sont
//              pleines ; en s'éloignant elles tournent sur la tranche et deviennent des lignes verticales de plus en plus serrées.
//   CUBE     : dans le slider, arrêté sur une app (le doigt ramené au centre, ou le bout de la file atteint) et tenu encore 1,2 s :
//              le xer devient un CUBE autour d'elle. L'app sur la face avant, ses voisines sur les côtés ; le tourner (doigt, ou
//              gyroscope penché) fait un cran haptique à chaque face ; le pencher en avant (ou glisser vers le haut) montre la face du
//              dessus : les BIONS du ploxion (ce qu'il compose). Toucher la face avant l'ouvre.
//   GYROSCOPE: tenu (fractale, slider, cube), l'iPhone penché incline tout et, dans le slider, accélère ou freine le défilement.
//   FREEFALL : l'appli entière au gyroscope (freefall()) : pencher à gauche ou à droite (un instant) ouvre la fractale et fait défiler ;
//              rester droit 1,4 s sur une app l'ouvre ; pencher en avant ou en arrière fait défiler l'écran ; le badge en haut l'arrête.
const DISPO = {
  fractale: { s0: 0.66, k: 0.84, pas: 0.6, rot: 13, rotMax: 17, fond: 0.3 },
  slider: { s0: 0.44, k: 0.9, pas: 0.46, rot: 26, rotMax: 76, fond: 0.1 },
};
const CUBE = 0.58, RX0 = -12, RY0 = -22;   // la taille du cube (fraction de l'écran) ; son angle de repos (trois quarts)
export function creerFractale({ W = globalThis.window, racine, scene, file, origine, aller, fermer = null, vibrer = () => {}, calme = () => false, actif = () => true,
  gyro = () => (W.jOSNatif && W.jOSNatif.mouvement && W.jOSNatif.mouvement.ecouter ? W.jOSNatif.mouvement : null), glyphe = () => '' }) {
  const D = W.document;
  let etat = 'repos', g = null, cartes = [], focus = 0, depart = 0, departId, fond = null, calque = null, indice = null, curseur = null, dessus = null, image = 0, minuteurs = [], pressionVue = false, cran = 0;
  let salle = null, inc = { x: 0, y: 0 }, base = null, offGyro = null, penche = 0, libre = false, offLibre = null, badge = null;   // inc : l'inclinaison lissée ; penche : la face du dessus (0..1)
  const boite = () => { const r = scene.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width || W.innerWidth || 390, h: r.height || W.innerHeight || 844 }; };
  const arreterMinuteurs = () => { for (const m of minuteurs) W.clearTimeout(m); minuteurs = []; };
  const dispo = () => DISPO[etat === 'slider' ? 'slider' : 'fractale'];
  /** l'écart entre deux cartes voisines (px) */
  const unite = (w, sl = etat === 'slider') => { const d = DISPO[sl ? 'slider' : 'fractale']; return w * d.s0 * d.pas; };
  const uniteCube = (w) => w * 0.55;   // le doigt : une face par 55 % de largeur

  // ---- le gyroscope : écouté seulement pendant la fractale (et le freefall) ; RELATIF à la tenue du début (on tient rarement l'iPhone
  //      parfaitement à plat : la première mesure est le zéro), avec une zone morte (la main tremble) ----
  const MORTE = 0.15;
  function ecouterGyro() {
    if (offGyro) return; const M = gyro(); if (!M) return;
    offGyro = M.ecouter((e) => {
      if (!base) base = { x: +e.x || 0, y: +e.y || 0 };
      inc.x += ((+e.x || 0) - base.x - inc.x) * 0.35; inc.y += ((+e.y || 0) - base.y - inc.y) * 0.35;
      if (etat === 'cube' && !cg) penche = borne((inc.y - 0.25) / 0.35, 0, 1);
      if (etat !== 'repos' && etat !== 'zoom' && etat !== 'slider') placer();   // le slider se redessine à chaque image
      if (libre) surLibre();
    });
  }
  function couperGyro() { if (offGyro && !libre) { try { offGyro(); } catch (e) { /* */ } offGyro = null; inc = { x: 0, y: 0 }; base = null; } }

  function monter() {
    const l = file(); if (l.length < 2) return false;
    racine.classList.add('px-fx');
    fond = D.createElement('div'); fond.className = 'px-fx-fond'; racine.appendChild(fond);
    calque = D.createElement('div'); calque.className = 'px-fx-calque'; racine.appendChild(calque);
    indice = D.createElement('div'); indice.className = 'px-fx-indice'; racine.appendChild(indice);
    // le CURSEUR DE RÉEL (le croquis) : un trait vertical au milieu, une barre en T en haut et en bas
    curseur = D.createElement('div'); curseur.className = 'px-fx-curseur'; curseur.innerHTML = '<i></i><b></b><i></i>'; racine.appendChild(curseur);
    const b = boite(); Object.assign(calque.style, { left: b.l + 'px', top: b.t + 'px', width: b.w + 'px', height: b.h + 'px' });
    cartes = l.map((e) => {
      let el = e.hote, cree = false;
      if (el) el.classList.add('px-fx-carte');
      else { el = D.createElement('div'); el.className = 'px-fx-icone'; el.innerHTML = '<span class="px-fx-ic">' + (e.icone || '') + '</span><b>' + esc(e.nom) + '</b>' + (e.sous ? '<small>' + esc(e.sous) + '</small>' : ''); scene.appendChild(el); cree = true; }
      const c = D.createElement('button'); c.type = 'button'; c.className = 'px-fx-cible'; c.setAttribute('aria-label', e.nom);
      c.innerHTML = '<span class="px-fx-tete"><i>' + (e.icone || '') + '</i><b>' + esc(e.nom) + '</b>' + (e.sous ? '<small>' + esc(e.sous) + '</small>' : '') + '</span>';
      calque.appendChild(c);
      return { e, el, cree, c };
    });
    // la SALLE du kion 4D (le croquis de RS-7) : le cadre de l'écran, des cadres qui reculent, et les arêtes qui descendent vers le cube
    const sv = 'http://www.w3.org/2000/svg', vw = W.innerWidth || b.w, vh = W.innerHeight || b.h, c = CUBE, ix = b.l + b.w * (1 - c) / 2, iy = b.t + b.h * (1 - c) / 2, iw = b.w * c, ih = b.h * c;
    const cadre = (k) => { const x = 10 + (ix - 10) * k, y = 10 + (iy - 10) * k, x2 = vw - 10 + (ix + iw - vw + 10) * k, y2 = vh - 10 + (iy + ih - vh + 10) * k; return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (x2 - x).toFixed(1) + '" height="' + (y2 - y).toFixed(1) + '" stroke-opacity="' + (0.5 - k * 0.3).toFixed(2) + '"/>'; };
    salle = D.createElement('div'); salle.className = 'px-fx-salle';
    salle.innerHTML = '<svg xmlns="' + sv + '" viewBox="0 0 ' + vw + ' ' + vh + '" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="1.2">' + [0, 0.3, 0.55, 0.78].map(cadre).join('')
      + [[10, 10, ix, iy], [vw - 10, 10, ix + iw, iy], [vw - 10, vh - 10, ix + iw, iy + ih], [10, vh - 10, ix, iy + ih]].map(([a, b2, x2, y2]) => '<line x1="' + a + '" y1="' + b2 + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke-opacity=".45"/>').join('') + '</svg>';
    racine.appendChild(salle);
    // la face du dessus du cube : les bions du ploxion de devant (remplie quand le cube vient)
    dessus = D.createElement('div'); dessus.className = 'px-fx-dessus'; Object.assign(dessus.style, { top: ((b.h - b.w) / 2) + 'px', height: b.w + 'px' }); scene.appendChild(dessus);
    renumeroter();
    depart = borne(origine(), 0, cartes.length - 1); departId = cartes[depart].e.id; focus = depart; cran = depart;
    racine.classList.add('px-fx-suit'); etat = 'depart'; placer(); void racine.offsetWidth; racine.classList.remove('px-fx-suit');
    // pas de sélection, de loupe ni de menu d'iOS sur la fractale ouverte (le toucher reste à elle)
    calque.addEventListener('touchstart', (e) => { if (e.cancelable) e.preventDefault(); }, { passive: false });
    calque.addEventListener('pointerdown', surCalqueBas); calque.addEventListener('pointermove', surCalqueBouge); calque.addEventListener('pointerup', surCalqueHaut); calque.addEventListener('pointercancel', surCalqueHaut);
    return true;
  }
  function renumeroter() { cartes.forEach((k, i) => { k.c.dataset.i = String(i); }); }
  function demonter() {
    W.cancelAnimationFrame(image); image = 0; arreterMinuteurs();
    for (const k of cartes) { if (k.cree) k.el.remove(); else { k.el.classList.remove('px-fx-carte'); k.el.style.transform = ''; k.el.style.opacity = ''; k.el.style.zIndex = ''; } }
    cartes = [];
    for (const n of [fond, calque, indice, curseur, dessus, salle]) if (n) n.remove();
    fond = calque = indice = curseur = dessus = salle = null;
    racine.classList.remove('px-fx', 'px-fx-suit', 'px-fx-ouverte', 'px-fx-apercu', 'px-fx-cube', 'px-fx-slider');
    etat = 'repos'; penche = 0; couperGyro();
  }

  // ---- où va chaque carte ----
  const P0 = 'perspective(1500px) ';
  function pose(i) {
    const { w } = boite(), d = i - focus, a = Math.abs(d), s = Math.sign(d);
    if (etat === 'depart') return i === depart ? { t: 'none', o: 1, z: 50, v: 0 } : { t: P0 + 'translate3d(' + (Math.sign(i - depart) * w) + 'px,0,0) scale(.6)', o: 0, z: 1, v: 0 };
    if (etat === 'apercu') {
      const sens = g ? g.sens : 1, p = g ? g.p : 0;
      if (i === depart) return { t: P0 + 'translate3d(' + (-sens * w * (0.07 + 0.72 * p)) + 'px,0,0) rotateY(' + (sens * (7 + 14 * p)) + 'deg) scale(' + (0.93 - 0.12 * p) + ')', o: 1 - 0.45 * p, z: 50, v: 0.25 * p };
      if (i === depart + sens) return { t: P0 + 'translate3d(' + (sens * w * 0.72 * (1 - p)) + 'px,0,0) rotateY(' + (-sens * 18 * (1 - p)) + 'deg) scale(' + (0.82 + 0.18 * p) + ')', o: 1, z: 60, v: 0 };
      return { t: P0 + 'translate3d(' + (Math.sign(i - depart) * w) + 'px,0,0) scale(.6)', o: 0, z: 1, v: 0 };
    }
    if (etat === 'zoom') return i === Math.round(focus) ? { t: 'none', o: 1, z: 90, v: 0 } : { t: P0 + 'translate3d(' + (s * w * 0.9) + 'px,0,0) scale(.4)', o: 0, z: 1, v: 0 };
    const tx = (-inc.y * 7).toFixed(1), ty = (inc.x * 10).toFixed(1);   // le gyroscope incline tout
    if (etat === 'cube') {
      // une face par carte, à 90° l'une de l'autre autour de l'axe vertical ; penché en avant, le dessus (les bions) vient
      const ang = d * 90, h = (w * CUBE) / 2, vu = a <= 1.5;
      // au repos, le cube est vu de trois quarts (RX0, RY0) : on voit que c'est un cube, et sa face du dessus affleure
      return { t: P0 + 'rotateX(' + (RX0 - 38 * penche - inc.y * 8).toFixed(1) + 'deg) rotateY(' + (RY0 + ang - inc.x * 14).toFixed(1) + 'deg) translateZ(' + h.toFixed(1) + 'px) scale(' + CUBE + ')', o: vu ? 1 : 0, z: 80 - Math.round(a * 10), v: Math.min(0.5, a * 0.35) };
    }
    const P = dispo(), u = unite(w);
    // la fractale : chaque pas vers l'extérieur rapetisse (k) et se rapproche (la suite géométrique)
    const x = s * u * (1 - Math.pow(P.k, a)) / (1 - P.k), sc = P.s0 * Math.pow(P.k, a), r = -s * Math.min(a * P.rot, P.rotMax);
    const y = cartes[i] && cartes[i].jet ? cartes[i].jet : 0;
    return { t: P0 + 'rotateX(' + tx + 'deg) translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotateY(' + (r + +ty).toFixed(1) + 'deg) scale(' + sc.toFixed(3) + ')',
      o: Math.max(0, 1 - a * (etat === 'slider' ? 0.07 : 0.16)) * (y < 0 ? Math.max(0, 1 + y / 500) : 1), z: 80 - Math.round(a * 10), v: Math.min(0.55, a * P.fond) };
  }
  function placer() {
    const f = Math.round(focus);
    racine.classList.toggle('px-fx-apercu', etat === 'apercu' || etat === 'depart' || etat === 'zoom');
    racine.classList.toggle('px-fx-cube', etat === 'cube');
    racine.classList.toggle('px-fx-slider', etat === 'slider');
    cartes.forEach((k, i) => {
      const q = pose(i);
      // (0.62) la mémoire : avec beaucoup de vivants, seuls les proches du focus (≤ 3 crans) sont dessinés en direct ; les autres restent
      // cachés (ni mise en page, ni peinture) jusqu'à ce que le défilement les rapproche
      if (!k.cree) { const debut = etat === 'apercu' || etat === 'depart', ref = debut ? depart : focus, lim = debut ? 1 : etat === 'cube' ? 1.6 : 3.2; k.el.classList.toggle('px-fx-carte', Math.abs(i - ref) <= lim); }
      k.el.style.transform = q.t; k.el.style.opacity = String(q.o); k.el.style.zIndex = String(q.z);
      k.c.style.transform = q.t; k.c.style.opacity = String(q.o); k.c.style.zIndex = String(q.z); k.c.style.setProperty('--voile', q.v.toFixed(2));
      k.c.classList.toggle('on', i === f && etat !== 'apercu');
    });
    if (dessus) {
      if (etat === 'cube') {
        const { w, h } = boite(), k = cartes[f];
        if (k && dessus.dataset.pour !== String(k.e.id)) { dessus.dataset.pour = String(k.e.id); dessus.innerHTML = faceDessus(k.e); }
        dessus.style.transform = P0 + 'rotateX(' + (RX0 - 38 * penche - inc.y * 8).toFixed(1) + 'deg) rotateY(' + (RY0 - inc.x * 14).toFixed(1) + 'deg) translateY(' + (-(h * CUBE) / 2).toFixed(1) + 'px) rotateX(90deg) scale(' + CUBE + ')';
        dessus.style.opacity = String(Math.min(1, 0.35 + penche * 1.3)); void w;
      } else { dessus.style.opacity = '0'; }
    }
    if (indice) indice.textContent = libre && etat === 'ouverte' ? 'freefall · penche pour défiler · reste droit pour ouvrir'
      : etat === 'apercu' ? (g && g.p > 0.3 ? 'lâche pour y aller' : 'tire vers le centre') : etat === 'fractale' ? 'glisse · lâche sur une app'
        : etat === 'slider' ? 'ça défile · penche pour accélérer · lâche pour ouvrir' : etat === 'cube' ? (penche > 0.5 ? 'ses bions · redresse pour revenir' : 'tourne le cube · penche en avant : ses bions · touche la face')
          : etat === 'ouverte' ? 'touche une app · jette-la en haut pour la fermer' : '';
    if (f !== cran && (etat === 'fractale' || etat === 'slider' || etat === 'ouverte' || etat === 'cube')) { cran = f; vibrer(etat === 'cube' ? 'bord' : 'page'); }
  }
  /** la face du dessus du cube : ce que le ploxion compose (ses bions), son type et sa famille */
  function faceDessus(e) {
    const l = Array.isArray(e.bions) ? e.bions : [];
    return '<div class="px-fx-dessus-in"><p><b>' + esc(e.nom) + '</b><small>' + (l.length ? l.length + ' bion' + (l.length > 1 ? 's' : '') : (e.id == null ? 'l\'accueil' : 'aucun bion déclaré')) + '</small></p>'
      + '<ul>' + l.slice(0, 18).map(n => '<li>' + glyphe('bion') + esc(n) + '</li>').join('') + '</ul></div>';
  }

  function entrer(e) {
    if (!actif()) return;
    if (etat === 'repos' && !monter()) return;
    if (e === 'apercu' && !cartes[depart + (g ? g.sens : 1)]) { e = 'fractale'; }   // rien de ce côté : directement la fractale
    etat = e; vibrer(e === 'apercu' ? 'bord-seuil' : e === 'cube' ? 'portion' : 'appui');
    racine.classList.toggle('px-fx-suit', e === 'slider');
    if (e !== 'apercu' && g) { g.ox = g.x; g.of = focus; }
    if (e !== 'apercu') ecouterGyro();
    if (e === 'cube') focus = Math.round(focus);
    if (e === 'slider') {
      let t0 = 0, arret = 0;
      const tic = (t) => {
        if (etat !== 'slider') return;
        const dt = t0 ? Math.min(0.05, (t - t0) / 1000) : 0; t0 = t; const { w } = boite();
        // le doigt au bord : une vitesse fixe vers ce bord (vers le centre : ralentit ; au-delà : repart dans l'autre sens) ; le gyroscope
        // penché ajoute ou retire (jusqu'à ±9 cartes/s)
        const r = g ? borne((g.x - w / 2) / (w / 2), -1, 1) : 0, vd = Math.abs(r) < 0.15 ? 0 : r * 7, vg = Math.abs(inc.x) < MORTE ? 0 : (inc.x - Math.sign(inc.x) * MORTE) * 11;
        const avant = focus; focus = borne(focus + (vd + vg) * dt, 0, cartes.length - 1);
        // arrêté (le doigt au centre, ou le bout de la file) : tenu 1,2 s de plus, le xer devient un cube autour de l'app visée
        arret = Math.abs(focus - avant) < 1e-6 ? arret + dt : 0;
        if (arret * 1000 >= ETAPES.cube && g) { arret = 0; focus = Math.round(focus); W.cancelAnimationFrame(image); image = 0; entrer('cube'); return; }
        placer(); image = W.requestAnimationFrame(tic);
      };
      image = W.requestAnimationFrame(tic);
    }
    placer();
  }
  /** le PORTAIL (le croquis « portail ») : des carrés emboîtés jaillissent de la carte choisie, en s'ouvrant */
  function portail() {
    if (calme()) return; const p = D.createElement('div'); p.className = 'px-fx-portail'; p.innerHTML = '<i></i><i></i><i></i><i></i>'; racine.appendChild(p);
    [...p.children].forEach((n, j) => animer(n, [{ transform: 'translate(-50%,-50%) scale(' + (0.2 + j * 0.12) + ') rotate(45deg)', opacity: 0.9 }, { transform: 'translate(-50%,-50%) scale(' + (2.6 + j * 0.5) + ') rotate(45deg)', opacity: 0 }], 520 + j * 70, 'cubic-bezier(.2,.7,.2,1)'));
    W.setTimeout(() => p.remove(), 900);
  }
  function ouvrirIndex(i) {
    const k = cartes[i]; if (!k) return demonter();
    if (!(k.e.id === departId && i === depart)) portail();
    focus = i; etat = 'zoom'; penche = 0; racine.classList.remove('px-fx-suit'); vibrer('ouvrir'); placer();
    const id = k.e.id, meme = id === departId && i === depart;
    W.setTimeout(() => { demonter(); if (!meme) aller(id); }, calme() ? 0 : 300);
  }
  /** revenir là d'où l'on vient (s'il a été fermé entre-temps : l'accueil) */
  function revenir() {
    if (etat === 'repos') return;
    let i = cartes.findIndex(k => k.e.id === departId); if (i < 0) i = Math.max(0, cartes.findIndex(k => k.e.id == null));
    depart = i; focus = i; ouvrirIndex(i);
  }
  /** jeter une carte vers le haut : le ploxion se ferme, les autres se resserrent */
  function jeter(i) {
    const k = cartes[i]; if (!k || k.e.id == null || !fermer) { if (k) { k.jet = 0; placer(); } return; }
    k.jet = -boite().h * 1.1; racine.classList.remove('px-fx-suit'); vibrer('minimiser'); placer();
    W.setTimeout(() => {
      const id = k.e.id; cartes.splice(cartes.indexOf(k), 1); k.c.remove();
      if (k.cree) k.el.remove(); else { k.el.classList.remove('px-fx-carte'); k.el.style.transform = ''; k.el.style.opacity = ''; k.el.style.zIndex = ''; }
      try { fermer(id); } catch (e) { /* */ }
      renumeroter();
      if (cartes.length < 2) { revenir(); return; }
      focus = borne(Math.round(focus > i ? focus - 1 : focus), 0, cartes.length - 1); cran = focus; placer();
    }, calme() ? 0 : 260);
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
    } else if (etat === 'fractale') {
      const f = borne(g.of - (g.x - g.ox) / unite(w, false), 0, cartes.length - 1);   // le doigt tenu : de cran en cran
      if (Math.round(f) !== Math.round(focus)) g.choisi = true;
      focus = Math.round(f); placer();
    } else if (etat === 'cube') {
      racine.classList.add('px-fx-suit');
      focus = borne(g.of - (g.x - g.ox) / uniteCube(w), 0, cartes.length - 1); penche = borne((g.y0 - g.y) / 160, 0, 1); placer();
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
    else if (e === 'cube') { focus = Math.round(focus); racine.classList.add('px-fx-ouverte'); placer(); }   // le cube reste, dans la main
    return true;
  }
  function annule() { arreterMinuteurs(); g = null; if (etat !== 'repos' && etat !== 'ouverte' && etat !== 'cube') revenir(); }

  // ---- ouverte (fractale ou cube) : le doigt fait défiler ou tourner, file sur son élan ; jeter vers le haut ferme ; toucher ouvre ----
  let cg = null;
  function surCalqueBas(e) {
    if (etat !== 'ouverte' && etat !== 'cube') return;
    const b = e.target && e.target.closest ? e.target.closest('.px-fx-cible') : null;
    cg = { x: e.clientX, y: e.clientY, f: focus, p: penche, sens: null, i: b ? +b.dataset.i : -1, hist: [[Date.now(), e.clientX, e.clientY]] };
    try { calque.setPointerCapture(e.pointerId); } catch (er) { /* */ }
  }
  function surCalqueBouge(e) {
    if (!cg || (etat !== 'ouverte' && etat !== 'cube')) return;
    const dx = e.clientX - cg.x, dy = e.clientY - cg.y;
    cg.hist.push([Date.now(), e.clientX, e.clientY]); if (cg.hist.length > 6) cg.hist.shift();
    if (!cg.sens && Math.hypot(dx, dy) > 8) cg.sens = etat === 'cube' ? 'tourne' : (Math.abs(dy) > Math.abs(dx) && dy < 0 && cg.i >= 0) ? 'jet' : 'defile';
    racine.classList.add('px-fx-suit');
    if (cg.sens === 'defile') { focus = borne(cg.f - dx / unite(boite().w, false), -0.35, cartes.length - 0.65); placer(); }
    else if (cg.sens === 'jet') { const k = cartes[cg.i]; if (k) { k.jet = Math.min(0, dy); placer(); } }
    else if (cg.sens === 'tourne') { focus = borne(cg.f - dx / uniteCube(boite().w), -0.3, cartes.length - 0.7); penche = borne(cg.p - dy / 200, 0, 1); placer(); }
  }
  function surCalqueHaut(e) {
    if (!cg || (etat !== 'ouverte' && etat !== 'cube')) return; const c = cg; cg = null;
    racine.classList.remove('px-fx-suit');
    const [t0, x0, y0] = c.hist[0], dt = Math.max(16, Date.now() - t0), vx = (e.clientX - x0) / dt, vy = (e.clientY - y0) / dt;   // px/ms
    if (c.sens === 'defile') { focus = borne(Math.round(c.f - (e.clientX - c.x + vx * 220) / unite(boite().w, false)), 0, cartes.length - 1); placer(); return; }
    if (c.sens === 'tourne') { focus = borne(Math.round(c.f - (e.clientX - c.x + vx * 160) / uniteCube(boite().w)), 0, cartes.length - 1); penche = penche > 0.5 ? 1 : 0; placer(); return; }
    if (c.sens === 'jet') { const k = cartes[c.i]; if (k && ((e.clientY - c.y) < -boite().h * 0.22 || vy < -0.9)) jeter(c.i); else if (k) { k.jet = 0; placer(); } return; }
    if (e.type === 'pointercancel') return;
    const cible = D.elementFromPoint ? D.elementFromPoint(e.clientX, e.clientY) : e.target;
    const b = cible && cible.closest ? cible.closest('.px-fx-cible') : null;
    if (b && (etat !== 'cube' || +b.dataset.i === Math.round(focus))) ouvrirIndex(+b.dataset.i); else revenir();
  }

  // ---- FREEFALL : l'appli au gyroscope ----
  let penchee = 0, immobile = 0, dernier = 0;
  function surLibre() {
    const t = Date.now(), dt = dernier ? Math.min(0.2, (t - dernier) / 1000) : 0; dernier = t;
    const x = Math.abs(inc.x) < MORTE ? 0 : inc.x;
    if (etat === 'repos') {
      // (0.62) pencher en avant ou en arrière : ce qui est à l'écran (le ploxion, sinon l'accueil) défile — l'appli entière au gyroscope
      const y = Math.abs(inc.y) < MORTE ? 0 : inc.y - Math.sign(inc.y) * MORTE;
      if (y && dt) { const h = scene.querySelector('.px-hote:not([hidden])') || racine.querySelector('.px-ecran'); if (h) h.scrollTop = Math.max(0, (h.scrollTop || 0) + y * 1600 * dt); }
      // penché franchement (≥ 0,45) un demi-instant : la fractale s'ouvre, en freefall
      penchee = Math.abs(inc.x) > 0.45 ? penchee + dt : 0;
      if (penchee > 0.45 && actif() && monter()) { etat = 'ouverte'; racine.classList.add('px-fx-ouverte', 'px-fx-suit'); vibrer('appui'); immobile = 0; placer(); }
      return;
    }
    if (etat !== 'ouverte') return;
    focus = borne(focus + x * 6 * dt, 0, cartes.length - 1);
    // droit (dans la zone morte) 1,4 s sur une carte : elle s'ouvre (la jauge --tenu sur la carte visée)
    immobile = x === 0 ? immobile + dt : 0;
    const f = Math.round(focus); cartes.forEach((k, i) => k.c.style.setProperty('--tenu', i === f ? String(Math.min(1, immobile / 1.4)) : '0'));
    if (x === 0) focus += (f - focus) * 0.3;
    placer();
    if (immobile >= 1.4) { immobile = 0; penchee = 0; racine.classList.remove('px-fx-suit'); ouvrirIndex(f); }
  }
  /** freefall : on / off (sans argument : bascule) ; rend l'état */
  function freefall(on) {
    const v = on == null ? !libre : !!on; if (v === libre) return libre;
    libre = v;
    if (libre) {
      badge = D.createElement('button'); badge.type = 'button'; badge.className = 'px-freefall'; badge.innerHTML = glyphe('iphone') + '<span>freefall</span><b>×</b>';
      badge.onclick = () => freefall(false); racine.appendChild(badge);
      penchee = 0; immobile = 0; dernier = 0; vibrer('portion'); ecouterGyro();
    } else {
      if (badge) { badge.remove(); badge = null; }
      if (etat === 'ouverte') revenir();
      couperGyro(); vibrer('revenir');
    }
    return libre;
  }

  /** la fractale ouverte d'un toucher (la page « aujourd'hui », un bouton) */
  function ouverte() { if (etat !== 'repos' || !actif() || !monter()) return false; etat = 'ouverte'; racine.classList.add('px-fx-ouverte'); ecouterGyro(); vibrer('appui'); placer(); return true; }

  return { appui, deplace, relache, annule, etat: () => etat, focus: () => focus, entrer, revenir, ouvrirIndex, jeter, freefall, libre: () => libre, ouverte };
}
