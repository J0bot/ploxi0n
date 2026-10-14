// ⧉ LA FRACTALE DES PLOXIONS (0.59). RS-7 : « la transition entre app précédente et suivante encore plus stylée. Quand on garde longtemps
// à droite, un aperçu de l'app d'après à droite, et l'inverse à gauche. Des degrés de longtemps et de pression : presser fort = comme
// Windows + Tab, notre app au milieu en plus petit, les apps à droite et à gauche, une fractale symétrique ; laisser presser longtemps = la
// même chose en plus petit, qui défile toute seule, et au relâché on s'arrête sur l'app visée : un slider d'apps. »
// Depuis n'importe quelle zone d'un bord (gauche ou droit), le doigt posé :
//   0. GLISSER vite          → le geste de la zone (⚙ › Gestes des bords) ; passer d'app en app se fait par le GLISSEMENT (glisser()) :
//                              l'app part en biais, l'autre arrive en 3D, un trait de lumière balaie l'écran
//   1. APERÇU (tenu 0,3 s)    → l'app d'à côté passe la tête (bord droit = la suivante, gauche = la précédente ; la file fait le tour) ;
//                              tirer vers l'intérieur l'amène (au-delà de 30 %, ou lancée : lâcher = y aller ; en deçà, tout revient)
//   2. FRACTALE (tenu 0,9 s, ou pressé fort) → l'app au milieu, en petit ; les autres de chaque côté, de plus en plus petites, de plus en
//                              plus serrées (une fractale symétrique) ; le doigt fait défiler ; lâché sur une autre : elle s'ouvre ;
//                              lâché sans bouger : la fractale reste (toucher une app pour l'ouvrir, à côté pour revenir)
//   3. SLIDER (tenu 1,9 s, ou pressé très fort) → plus petit, et ça défile tout seul vers le bord tenu ; le doigt vers le centre ralentit,
//                              au-delà ça repart dans l'autre sens ; lâcher = ouvrir l'app visée
// La pression : PointerEvent.pressure n'existe que sur les iPhone à 3D Touch (6s à XS) ; ailleurs elle vaut 0,5 et la durée fait tout.
// Les cartes : un ploxion vivant est LUI-MÊME (son hôte, figé par le gel, transformé sur place : rien n'est déplacé, aucune iframe ne
// recharge) ; l'accueil, les endormis et les verrouillés (Face ID : jamais leur contenu) sont une carte à leur icône. Que du composé
// (translate, rotateY, scale, opacity).
// (0.63, RS-7 : « tellement buggé et pas du tout smooth » ; « plus smooth et plein haptics selon l'utilisation ») LE MOTEUR :
//   - UNE seule boucle d'images (requestAnimationFrame) : le doigt et le gyroscope ne font que poser des cibles ; la boucle lisse (par le
//     temps, pas par mesure), avance le slider, le ressort, le freefall, puis écrit — seulement ce qui a changé ;
//   - l'inclinaison du gyroscope est posée sur la scène et le calque (deux transforms), plus sur chaque carte : les cartes ne bougent
//     qu'avec le focus, leurs transitions ne sont plus relancées 30 fois par seconde (le tremblement élastique) ;
//   - un RESSORT qui garde l'élan du doigt : lancer le paquet, il file, ralentit, se pose — un cran haptique par carte qui passe ;
//   - l'assombrissement des cartes est une couche d'opacité (plus un repeint par image) ; les hôtes lointains perdent coins et ombre ;
//   - la fractale se PRÉPARE invisible pendant que le doigt tient (0,14 s) : le gros du travail avant l'aperçu, pas pendant ;
//   - l'haptique suit l'usage (src/natif/haptique.js, les événements fx-*) : la profondeur se sent (aperçu léger → fractale moyen →
//     slider, le moteur → cube, le verrou), la vitesse règle la densité des crans, chaque seuil a son retour, chaque app sa signature.
export const ETAPES = { apercu: 300, fractale: 900, slider: 1900, cube: 1200 };   // cube : immobile dans le slider
const PREP = 140;   // (0.63) la préparation invisible
const BOUGE = 14;   // le doigt bouge de plus avant l'aperçu : c'est un glissement, pas un appui
const RESSORT = 'cubic-bezier(.16,1,.3,1)';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const borne = (x, a, b) => Math.max(a, Math.min(b, x));
function animer(el, kf, ms, easing, fin, W = null) {
  if (!el || typeof el.animate !== 'function') { if (fin) fin(); return null; }
  const a = el.animate(kf, { duration: ms, easing, fill: 'backwards' }); if (fin) { a.onfinish = fin; a.oncancel = fin; }
  // (0.63) DIFFÉRÉE : l'animation part après la première peinture (sinon le travail d'allerA — démasquer l'hôte, refaire la barre — mangeait
  // ses premières images : elle apparaissait déjà en cours) ; d'ici là, figée sur sa première image
  if (W && W.requestAnimationFrame) { try { a.pause(); } catch (e) { /* */ } W.requestAnimationFrame(() => W.requestAnimationFrame(() => { try { a.play(); } catch (e) { /* */ } })); }
  return a;
}

/** le GLISSEMENT d'une app à l'autre : sens +1 = vers la suivante (tout part à gauche), -1 = vers la précédente ; vitesse (px/ms) du lâcher */
export function glisser({ W = globalThis.window, sortant = null, entrant = null, ecran = null, scene, sens = 1, calme = false, vitesse = 0 } = {}) {
  if (calme || !sens || !scene) return;
  const D = W.document, f = borne(1 - Math.max(0, vitesse - 0.5) * 0.25, 0.62, 1);   // lancé vite : ça passe plus vite
  if (sortant) {
    sortant.classList.add('px-fx-sortant'); scene.classList.add('px-transit');
    animer(sortant, [{ transform: 'none', opacity: 1 }, { transform: 'perspective(1400px) translate3d(' + (-sens * 34) + '%,0,0) rotateY(' + (sens * 22) + 'deg) scale(.8)', opacity: 0 }],
      380 * f, 'cubic-bezier(.4,0,.2,1)', () => { sortant.classList.remove('px-fx-sortant'); scene.classList.remove('px-transit'); }, W);
  }
  if (entrant) animer(entrant, [{ transform: 'perspective(1400px) translate3d(' + (sens * 62) + '%,0,0) rotateY(' + (-sens * 24) + 'deg) scale(.84)', opacity: .15 }, { transform: 'none', opacity: 1 }], 460 * f, RESSORT, null, W);
  else if (ecran) animer(ecran, [{ transform: 'translate3d(' + (sens * 10) + '%,0,0) scale(.94)', opacity: 0 }, { transform: 'none', opacity: 1 }], 420 * f, RESSORT, null, W);
  // la trace : un trait de lumière balaie l'écran dans le sens du passage
  const t = D.createElement('div'); t.className = 'px-fx-trace'; (scene.parentNode || D.body).appendChild(t);
  const w = W.innerWidth || 390, de = sens > 0 ? w : 0, vers = sens > 0 ? 0 : w;
  animer(t, [{ transform: 'translateX(' + de + 'px)', opacity: 0 }, { opacity: 1, offset: 0.25 }, { transform: 'translateX(' + vers + 'px)', opacity: 0 }], 440 * f, 'cubic-bezier(.4,0,.2,1)', () => t.remove(), W);
}

/**
 * @param {object} o
 *   file()          [{ id (null = l'accueil), nom, hote (l'hôte vivant à montrer, sinon null), icone (html), sous, bions }] dans l'ordre des bords
 *   origine()       l'index de ce qui est à l'écran
 *   aller(id)       y aller (sans glissement : la fractale a déjà fait le mouvement)
 *   fermer(id)      (0.60) fermer ce ploxion (la carte jetée vers le haut) ; l'accueil ne se ferme pas
 *   vibrer(ev, id, { niveau })   l'haptique (src/natif/haptique.js) ; niveau −1 / +1 décale le style sur l'échelle cran < léger < moyen < fort
 *   crans()         (0.63) la session de crans du Taptic Engine (jOSNatif.crans : debut, fin) tant que la fractale est montée
 *   surVide()       (0.63) tenir un bord sans rien d'autre que l'accueil
 *   carte({})       (0.63) « voir tout son xerboxion » : la carte (src/app/carte-xer.js) — pincer la fractale ouverte, ou ⊞
 */
// (0.60, RS-7, une capture du sélecteur d'apps d'iOS : « ça, mais en mille fois mieux » ; puis ses croquis : « pas besoin de coins, que
// des carrés », « le curseur de réel », « filtrage de photons », « kion 3D, kion 4D », « le but : que le xer devienne un cube ; au bout
// d'un moment c'est comme manipuler un cube, avec les haptics » ; « avec le gyroscope on peut contrôler ça aussi » ; « le mode freefall »).
//   FRACTALE : de grandes cartes en jeu de cartes, l'icône et le nom au-dessus de chacune ; le doigt les fait défiler et elles filent sur
//              leur élan ; jeter une carte vers le haut ferme le ploxion. Symétrique (le passé à gauche, la suite à droite), en profondeur.
//   SLIDER   : le FILTRAGE DE PHOTONS — autour du CURSEUR DE RÉEL (le trait vertical au milieu, ses deux barres en T), les cartes sont
//              pleines ; en s'éloignant elles tournent sur la tranche et deviennent des lignes verticales de plus en plus serrées.
//   CUBE     : dans le slider, arrêté sur une app (le doigt ramené au centre, ou le bout de la file atteint) et tenu encore 1,2 s (le
//              curseur de réel se charge, les crans se resserrent) : le xer devient un CUBE autour d'elle. L'app sur la face avant, ses
//              voisines sur les côtés ; le tourner (doigt) fait un cran par face, le gyroscope le fait pivoter dans la main ; le pencher
//              en avant (ou glisser vers le haut) montre la face du dessus : les BIONS du ploxion (ce qu'il compose). Toucher la face l'ouvre.
//   GYROSCOPE: tenu (fractale, slider, cube), l'iPhone penché incline tout et, dans le slider, accélère ou freine le défilement.
//   FREEFALL : l'appli entière au gyroscope (freefall()) : pencher à gauche ou à droite (un instant) ouvre la fractale et fait défiler ;
//              rester droit 1,4 s sur une app l'ouvre ; pencher en avant ou en arrière fait défiler l'écran ; le badge en haut l'arrête.
const DISPO = {
  fractale: { s0: 0.66, k: 0.84, pas: 0.6, rot: 13, rotMax: 17, fond: 0.3 },
  slider: { s0: 0.44, k: 0.9, pas: 0.46, rot: 26, rotMax: 76, fond: 0.1 },
};
const CUBE = 0.58, RX0 = -12, RY0 = -22;   // la taille du cube (fraction de l'écran) ; son angle de repos (trois quarts)
const RECHARGE = [0.35, 0.65, 0.85, 1.0, 1.1];   // (0.63) les crans du curseur qui se charge vers le cube : de plus en plus serrés
const JAUGE = [0.35, 0.7, 0.95, 1.13, 1.27, 1.36];   // (0.63) freefall : la jauge « reste droit » (1,4 s)
const P0 = 'perspective(1500px) ';
export function creerFractale({ W = globalThis.window, racine, scene, file, origine, aller, fermer = null, vibrer = () => {}, calme = () => false, actif = () => true,
  gyro = () => (W.jOSNatif && W.jOSNatif.mouvement && W.jOSNatif.mouvement.ecouter ? W.jOSNatif.mouvement : null), glyphe = () => '',
  crans = () => (W.jOSNatif && W.jOSNatif.crans) || null, surVide = null, carte = null }) {
  const D = W.document;
  const maintenant = () => (W.performance && W.performance.now ? W.performance.now() : Date.now());
  const raf = (f) => (W.requestAnimationFrame ? W.requestAnimationFrame(f) : W.setTimeout(() => f(maintenant()), 16));
  const caf = (n) => (W.cancelAnimationFrame ? W.cancelAnimationFrame(n) : W.clearTimeout(n));
  let etat = 'repos', g = null, cg = null, cartes = [], focus = 0, depart = 0, departId, vois = 0, sensApercu = 1, montage = 0, pressionVue = false;
  let fond = null, calque = null, indice = null, curseur = null, dessus = null, salle = null, badge = null, tout = null;
  let image = 0, t0 = 0, minuteurs = [], B = null, ecrites = {}, tiltEcrit = null, indiceEcrit = null, chargeEcrite = -1, dessusEcrit = { t: null, o: null };
  let inc = { x: 0, y: 0 }, cibleInc = { x: 0, y: 0 }, incFige = { x: 0, y: 0 }, base = null, vuGyro = 0, offGyro = null, couperMinute = 0;
  let penche = 0, pencheMain = null, pencheSnap = 0, dessusOuvert = false, dessusT = 0;
  let res = null, transit = 0, debutSlider = 0, arret = 0, rechargeI = 0, dirSlider = 0;
  let libre = false, penchee = 0, immobile = 0, jaugeI = 0, tenuI = -1, tenuEcrit = 0;
  let sCran = 0, vFocus = 0, nSaut = 0, buteeArmee = true, echelle = 1, pince = null, largeur = 0;
  const doigts = new Map();
  const boite = () => { if (B) return B; const r = scene.getBoundingClientRect(); B = { l: r.left, t: r.top, w: r.width || W.innerWidth || 390, h: r.height || W.innerHeight || 844 }; return B; };
  const arreterMinuteurs = () => { for (const m of minuteurs) W.clearTimeout(m); minuteurs = []; };
  const dispo = () => DISPO[etat === 'slider' ? 'slider' : 'fractale'];
  /** l'écart entre deux cartes voisines (px) */
  const unite = (w, sl = etat === 'slider') => { const d = DISPO[sl ? 'slider' : 'fractale']; return w * d.s0 * d.pas; };
  const uniteCube = (w) => w * 0.55;   // le doigt : une face par 55 % de largeur
  const tempsDe = (e) => (e && typeof e.timeStamp === 'number' && e.timeStamp > 0 ? e.timeStamp : maintenant());
  const classe = (c, on) => { if (ecrites[c] !== on) { ecrites[c] = on; racine.classList.toggle(c, on); } };
  /** la vitesse du doigt (px/ms) sur les 80 dernières ms : [vx, vy] */
  function vitesse(hist, t, x, y) {
    let s = null; for (const h of hist) if (t - h[0] <= 80 && t - h[0] >= 8) { s = h; break; }
    if (!s) s = hist[0]; if (!s) return [0, 0];
    const dt = Math.max(8, t - s[0]); return [(x - s[1]) / dt, (y - s[2]) / dt];
  }
  const noter = (hist, t, x, y) => { hist.push([t, x, y]); while (hist.length > 2 && t - hist[0][0] > 120) hist.shift(); };
  const elastique = (f, m = 0.35) => { const hi = cartes.length - 1; if (f < 0) return -m * (1 - Math.exp(f / m)); if (f > hi) return hi + m * (1 - Math.exp(-(f - hi) / m)); return f; };

  // ---- le gyroscope : écouté seulement pendant la fractale (et le freefall) ; RELATIF à la tenue du début (on tient rarement l'iPhone
  //      parfaitement à plat : la première mesure est le zéro), avec une zone morte (la main tremble). (0.63) Depuis la gravité brute
  //      (gx, gy) : le neutre de mouvement.js se recentre en ≈ 3 s, une inclinaison tenue s'éteignait toute seule. ----
  const MORTE = 0.15;
  function surGyro(e) {
    const t = Date.now(), brut = typeof e.gx === 'number' && typeof e.gy === 'number' ? { x: e.gx / 0.32, y: -e.gy / 0.32 } : { x: +e.x || 0, y: +e.y || 0 };
    if (!base || t - vuGyro > 400) { base = brut; inc = { x: 0, y: 0 }; }   // la tenue de départ ; un trou (arrière-plan, rotation) : le zéro repart
    vuGyro = t;
    cibleInc = { x: borne(brut.x - base.x, -1, 1), y: borne(brut.y - base.y, -1, 1) };
    demander();
  }
  function ecouterGyro() {
    if (couperMinute) { W.clearTimeout(couperMinute); couperMinute = 0; }
    if (offGyro) return; const M = gyro(); if (!M) return;
    offGyro = M.ecouter(surGyro, { theme: false });   // (0.63) le capteur seul : le thème vivant ne se rallume pas dans un ploxion
  }
  /** tout de suite, ou (0.63) dans 1,5 s : le zoom d'ouverture ne paie pas l'arrêt du capteur, une réouverture ne le redémarre pas */
  function couperGyro(vite = false) {
    if (!offGyro || libre) return;
    const couper = () => { couperMinute = 0; if (!offGyro || libre || (etat !== 'repos' && !vite)) return; try { offGyro(); } catch (e) { /* */ } offGyro = null; base = null; inc = { x: 0, y: 0 }; cibleInc = { x: 0, y: 0 }; };
    if (couperMinute) { W.clearTimeout(couperMinute); couperMinute = 0; }
    if (vite) couper(); else couperMinute = W.setTimeout(couper, 1500);
  }

  // ---- LA BOUCLE D'IMAGES ----
  function demander() { if (!image && (etat !== 'repos' || libre)) image = raf(boucle); }
  function boucle(t) {
    image = 0;
    if (etat === 'repos' && !libre) { t0 = 0; return; }
    const dt = t0 ? borne((t - t0) / 1000, 0.001, 0.05) : 1 / 60; t0 = t;
    let encore = false;
    // le gyroscope lissé par le temps (≈ 70 ms) : ni escalier à 30 Hz, ni retard empilé
    const ki = 1 - Math.exp(-dt / 0.07), ci = etat === 'zoom' ? { x: 0, y: 0 } : cibleInc;
    inc.x += (ci.x - inc.x) * ki; inc.y += (ci.y - inc.y) * ki;
    if (Math.abs(ci.x - inc.x) > 1e-3 || Math.abs(ci.y - inc.y) > 1e-3) encore = true;
    const fAvant = focus;
    if (etat === 'slider' && avancerSlider(dt)) encore = true;
    if (res) { pasRessort(dt); if (res) encore = true; }
    if (libre && pasLibre(dt)) encore = true;
    if (etat === 'cube' && pasCube(dt)) encore = true;
    if (etat === 'repos') { if (encore) demander(); else t0 = 0; return; }   // le freefall au repos : le défilement seulement
    vFocus += (Math.abs(focus - fAvant) / dt - vFocus) * 0.35;
    placer();
    sentir();
    if (encore || echelle !== 1) demander(); else t0 = 0;
  }

  // ---- monter / démonter ----
  function monter({ prep = false } = {}) {
    const l = file(); if (l.length < 2) return false;
    montage++; ecrites = {}; tiltEcrit = null; indiceEcrit = null; chargeEcrite = -1; dessusEcrit = { t: null, o: null }; B = null;
    racine.classList.add('px-fx'); classe('px-fx-prep', prep);
    fond = D.createElement('div'); fond.className = 'px-fx-fond'; racine.appendChild(fond);
    fond.addEventListener('pointerup', () => { if (etat === 'ouverte' || etat === 'cube') revenir(); });   // la bande du haut : revenir
    calque = D.createElement('div'); calque.className = 'px-fx-calque'; calque.setAttribute('data-px-app', ''); racine.appendChild(calque);
    indice = D.createElement('div'); indice.className = 'px-fx-indice'; racine.appendChild(indice);
    // le CURSEUR DE RÉEL (le croquis) : un trait vertical au milieu, une barre en T en haut et en bas ; il se charge vers le cube (--charge)
    curseur = D.createElement('div'); curseur.className = 'px-fx-curseur'; curseur.innerHTML = '<i></i><b></b><i></i>'; racine.appendChild(curseur);
    const b = boite(); Object.assign(calque.style, { left: b.l + 'px', top: b.t + 'px', width: b.w + 'px', height: b.h + 'px' });
    cartes = l.map((e) => {
      let el = e.hote, cree = false;
      if (!el) { el = D.createElement('div'); el.className = 'px-fx-icone'; el.innerHTML = '<span class="px-fx-ic">' + (e.icone || '') + '</span><b>' + esc(e.nom) + '</b>' + (e.sous ? '<small>' + esc(e.sous) + '</small>' : ''); scene.appendChild(el); cree = true; }
      const c = D.createElement('button'); c.type = 'button'; c.className = 'px-fx-cible'; c.setAttribute('aria-label', e.nom);
      c.innerHTML = '<i class="px-fx-voile"></i><span class="px-fx-tete"><i>' + (e.icone || '') + '</i><b>' + esc(e.nom) + '</b>' + (e.sous ? '<small>' + esc(e.sous) + '</small>' : '') + '</span>';
      calque.appendChild(c);
      return { e, el, cree, c, vo: c.firstChild, jet: 0, k: {}, vu: false };
    });
    renumeroter();
    // ⊞ « tout le xerboxion » : la carte (aussi en pinçant le paquet)
    if (carte) { tout = D.createElement('button'); tout.type = 'button'; tout.className = 'px-fx-tout'; tout.hidden = true; tout.innerHTML = glyphe('xerboxion') + '<span>tout le xerboxion</span>'; tout.addEventListener('click', () => ouvrirCarte()); racine.appendChild(tout); }
    depart = borne(origine(), 0, cartes.length - 1); departId = cartes[depart].e.id; focus = depart; sCran = depart; vFocus = 0; res = null;
    sensApercu = g ? g.sens : 1; vois = (depart + sensApercu + cartes.length) % cartes.length; largeur = W.innerWidth;
    if (!libre) { base = null; inc = { x: 0, y: 0 }; cibleInc = { x: 0, y: 0 }; }   // en freefall, le zéro reste celui de la tenue du début
    echelle = 1; pince = null; doigts.clear();
    etat = 'depart'; placer();
    if (!prep) void racine.offsetWidth;   // les poses de départ, posées avant la suite (sinon pas de transition)
    // pas de sélection, de loupe ni de menu d'iOS sur la fractale ouverte (le toucher reste à elle)
    calque.addEventListener('touchstart', (e) => { if (e.cancelable) e.preventDefault(); }, { passive: false });
    calque.addEventListener('pointerdown', surCalqueBas); calque.addEventListener('pointermove', surCalqueBouge); calque.addEventListener('pointerup', surCalqueHaut); calque.addEventListener('pointercancel', surCalqueHaut);
    W.addEventListener('resize', surTaille);
    const C = crans(); if (C && C.debut) { try { C.debut(); } catch (e) { /* */ } }   // le Taptic Engine réveillé : le premier cran part à l'heure
    return true;
  }
  function renumeroter() { cartes.forEach((k, i) => { k.c.dataset.i = String(i); }); }
  function rendreHote(el) {
    el.classList.remove('px-fx-carte', 'px-fx-loin', 'px-fx-zoom');
    el.style.transform = ''; el.style.opacity = ''; el.style.zIndex = ''; el.style.visibility = '';
  }
  function demonter() {
    montage++;
    if (image) { caf(image); image = 0; } t0 = 0; arreterMinuteurs(); res = null; cg = null; pince = null; doigts.clear(); echelle = 1;
    for (const k of cartes) { if (k.cree) k.el.remove(); else rendreHote(k.el); }
    cartes = [];
    for (const n of [fond, calque, indice, curseur, dessus, salle, tout]) if (n) n.remove();
    fond = calque = indice = curseur = dessus = salle = tout = null;
    scene.style.transform = ''; tiltEcrit = null;
    racine.classList.remove('px-fx', 'px-fx-prep', 'px-fx-suit', 'px-fx-ouverte', 'px-fx-apercu', 'px-fx-cube', 'px-fx-slider', 'px-fx-zooming');
    ecrites = {};
    W.removeEventListener('resize', surTaille);
    etat = 'repos'; penche = 0; pencheMain = null; pencheSnap = 0; dessusOuvert = false; tenuI = -1;
    couperGyro();
    const C = crans(); if (C && C.fin) { try { C.fin(); } catch (e) { /* */ } }
  }
  /** (0.63) la taille change en pleine fractale (rotation, clavier d'une feuille) : on revient proprement, le zéro du gyroscope repart */
  //      (le clavier qui se range ne change que la hauteur : on remesure, c'est tout)
  function surTaille() {
    B = null; if (calque) { const b = boite(); Object.assign(calque.style, { left: b.l + 'px', top: b.t + 'px', width: b.w + 'px', height: b.h + 'px' }); }
    if (W.innerWidth === largeur) { if (etat !== 'repos') placer(); return; }
    largeur = W.innerWidth; base = null;
    if (etat !== 'repos' && etat !== 'zoom') { arreterMinuteurs(); g = null; cg = null; revenir({ muet: true }); }
  }

  // ---- où va chaque carte ----
  const incCube = () => (maintenant() < transit ? incFige : inc);
  function pose(i, w) {
    const d = i - focus, a = Math.abs(d), s = Math.sign(d) || 1, k = cartes[i];
    const cote = (j) => (j === vois ? sensApercu : Math.sign(j - depart) || 1);
    const ailleurs = { t: P0 + 'translate3d(' + (cote(i) * w) + 'px,0,0) scale(.6)', o: 0, z: 1, v: 0 };
    if (etat === 'depart') return i === depart ? { t: 'none', o: k.cree ? 0 : 1, z: 50, v: 0 } : ailleurs;
    if (etat === 'apercu') {
      const sens = sensApercu, p = g ? g.p : 0;
      if (i === depart) return { t: P0 + 'translate3d(' + (-sens * w * (0.07 + 0.72 * p)).toFixed(1) + 'px,0,0) rotateY(' + (sens * (7 + 14 * p)).toFixed(2) + 'deg) scale(' + (0.93 - 0.12 * p).toFixed(4) + ')', o: 1 - 0.45 * p, z: 50, v: 0.25 * p };
      if (i === vois) return { t: P0 + 'translate3d(' + (sens * w * 0.72 * (1 - p)).toFixed(1) + 'px,0,0) rotateY(' + (-sens * 18 * (1 - p)).toFixed(2) + 'deg) scale(' + (0.82 + 0.18 * p).toFixed(4) + ')', o: 1, z: 60, v: 0 };
      return ailleurs;
    }
    if (etat === 'zoom') return i === Math.round(focus) ? { t: 'none', o: 1, z: 90, v: 0 } : { t: P0 + 'translate3d(' + (s * w * 0.9).toFixed(1) + 'px,0,0) scale(.4)', o: 0, z: 1, v: 0 };
    if (etat === 'cube') {
      // une face par carte, à 90° l'une de l'autre autour de l'axe vertical ; penché en avant, le dessus (les bions) vient ; au repos, le
      // cube est vu de trois quarts (RX0, RY0) : on voit que c'est un cube, et sa face du dessus affleure ; le gyroscope le fait pivoter
      const ang = d * 90, h = (w * CUBE) / 2, ix = incCube();
      return { t: P0 + 'rotateX(' + (RX0 - 38 * penche - ix.y * 8).toFixed(2) + 'deg) rotateY(' + (RY0 + ang - ix.x * 14).toFixed(2) + 'deg) translateZ(' + h.toFixed(1) + 'px) scale(' + CUBE + ')', o: a <= 1.5 ? 1 : 0, z: 80 - Math.min(9, Math.round(a)), v: Math.min(0.5, a * 0.35) };
    }
    const P = dispo(), u = unite(w);
    // la fractale : chaque pas vers l'extérieur rapetisse (k) et se rapproche (la suite géométrique)
    const x = s * u * (1 - Math.pow(P.k, a)) / (1 - P.k), sc = P.s0 * Math.pow(P.k, a), r = -s * Math.min(a * P.rot, P.rotMax);
    const y = k && k.jet ? k.jet : 0;
    return { t: P0 + 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotateY(' + r.toFixed(2) + 'deg) scale(' + sc.toFixed(4) + ')',
      o: Math.max(0, 1 - a * (etat === 'slider' ? 0.07 : 0.16)) * (y < 0 ? Math.max(0, 1 + y / 500) : 1), z: 80 - Math.min(9, Math.round(a)), v: Math.min(0.55, a * P.fond) };
  }
  const continu = () => etat === 'fractale' || etat === 'slider' || etat === 'ouverte' || etat === 'cube';
  /** les transitions CSS coupées (px-fx-suit) quand la boucle mène tout : le doigt, le ressort, le slider, le cube, le freefall */
  const veutSuit = () => etat === 'depart' || (etat === 'slider' && maintenant() >= transit) || (etat === 'cube' && maintenant() >= transit) || !!res || !!(cg && cg.sens) || !!(g && g.suit) || (libre && etat === 'ouverte');
  function placer() {
    if (!cartes.length) return;
    const { w } = boite(), f = Math.round(focus), n = cartes.length;
    classe('px-fx-apercu', etat === 'apercu' || etat === 'depart' || etat === 'zoom');
    classe('px-fx-cube', etat === 'cube'); classe('px-fx-slider', etat === 'slider'); classe('px-fx-zooming', etat === 'zoom');
    classe('px-fx-suit', veutSuit());
    const cont = continu();
    for (let i = 0; i < n; i++) {
      const k = cartes[i], q = pose(i, w), C = k.k;
      // un hôte vivant n'est dessiné que près du focus (la mémoire), avec une hystérésis : pas de clignement à la frontière
      if (!k.cree) {
        let veut;
        if (etat === 'depart') veut = i === vois && i !== depart;
        else if (etat === 'apercu') veut = i === depart || i === vois;
        else if (etat === 'zoom') veut = i === f || k.vu;
        else { const dd = Math.abs(i - focus), lim = etat === 'cube' ? 1.6 : 3.2; veut = k.vu ? dd <= lim + 1.2 : dd <= lim; }
        if (veut !== k.vu) { k.vu = veut; k.el.classList.toggle('px-fx-carte', veut); }
      }
      // un hôte reste opaque (une opacité de groupe sur un hôte composé = une passe hors écran par image) : son assombrissement passe
      // par le voile ; seules les cartes-icônes et les états de passage (départ, zoom) fondent pour de vrai
      let o = q.o, v = q.v;
      if (!k.cree && cont && o > 0.02) { v = 1 - (1 - v) * o; o = 1; }
      o = Math.round(o * 1000) / 1000; v = Math.round(v * 100) / 100;
      if (C.t !== q.t) { C.t = q.t; k.el.style.transform = q.t; k.c.style.transform = q.t; }
      if (C.o !== o) { C.o = o; k.el.style.opacity = o >= 1 ? '' : String(o); k.c.style.opacity = String(o); }
      if (C.z !== q.z) { C.z = q.z; k.el.style.zIndex = String(q.z); k.c.style.zIndex = String(q.z); }
      if (C.v !== v) { C.v = v; k.vo.style.opacity = String(v); }
      const cache = cont && o < 0.02;   // élaguées : plus de couche du tout
      if (C.h !== cache) { C.h = cache; k.c.style.visibility = cache ? 'hidden' : ''; k.el.style.visibility = cache ? 'hidden' : ''; }
      const loin = cont && Math.abs(i - focus) > 1.2;   // sur la tranche, loin du focus : ni coins clippés, ni ombre
      if (C.l !== loin) { C.l = loin; k.el.classList.toggle('px-fx-loin', loin); }
      const on = i === f && cont; if (C.on !== on) { C.on = on; k.c.classList.toggle('on', on); }
    }
    // l'inclinaison : sur la scène et le calque (deux transforms, sans transition), plus sur chaque carte ; le pincement (la carte) rapetisse tout
    const tilte = etat === 'fractale' || etat === 'slider' || etat === 'ouverte' || etat === 'zoom';
    const tl = (tilte && (Math.abs(inc.x) > 0.002 || Math.abs(inc.y) > 0.002)) || echelle !== 1
      ? 'perspective(1500px) rotateX(' + (tilte ? -inc.y * 7 : 0).toFixed(2) + 'deg) rotateY(' + (tilte ? inc.x * 10 : 0).toFixed(2) + 'deg)' + (echelle !== 1 ? ' scale(' + echelle.toFixed(3) + ')' : '') : '';
    if (tl !== tiltEcrit) { tiltEcrit = tl; scene.style.transform = tl; if (calque) calque.style.transform = tl; }
    if (dessus) placerDessus(w, f);
    if (indice) {
      const k = cartes[borne(f, 0, n - 1)];
      const txt = libre && etat === 'ouverte' ? 'freefall · penche · reste droit : ouvrir'
        : etat === 'apercu' ? (g && g.p > 0.3 ? 'lâche : y aller' : 'tire vers le centre') : etat === 'fractale' ? 'glisse · lâche sur une app'
          : etat === 'slider' ? (arret > 0.35 ? 'tiens… le cube' : 'ça défile · penche : plus vite') : etat === 'cube' ? (k ? k.e.nom + ' · ' : '') + (penche > 0.5 ? 'ses bions' : 'tourne · penche : ses bions')
            : etat === 'ouverte' ? (carte ? 'touche · jette en haut · pince : tout' : 'touche une app · jette-la en haut') : '';
      if (txt !== indiceEcrit) { indiceEcrit = txt; indice.textContent = txt; }
    }
    if (curseur) { const ch = etat === 'slider' ? Math.round(borne(arret / (ETAPES.cube / 1000), 0, 1) * 20) / 20 : 0; if (ch !== chargeEcrite) { chargeEcrite = ch; curseur.style.setProperty('--charge', String(ch)); } }
    if (tout && tout.hidden !== (etat !== 'ouverte')) tout.hidden = etat !== 'ouverte';
  }
  /** la face du dessus du cube : elle tourne avec lui ; ses bions (fx-dessus) quand on le penche, avec une hystérésis */
  function placerDessus(w, f) {
    if (etat === 'cube') {
      const { h } = boite(), k = cartes[f], ix = incCube();
      if (k && dessus.dataset.pour !== String(k.e.id)) { dessus.dataset.pour = String(k.e.id); dessus.innerHTML = faceDessus(k.e); }
      const t = P0 + 'rotateX(' + (RX0 - 38 * penche - ix.y * 8).toFixed(2) + 'deg) rotateY(' + (RY0 + (f - focus) * 90 - ix.x * 14).toFixed(2) + 'deg) translateY(' + (-(h * CUBE) / 2).toFixed(1) + 'px) rotateX(90deg) scale(' + CUBE + ')';
      const o = String(Math.round(Math.min(1, 0.35 + penche * 1.3) * 100) / 100);
      if (t !== dessusEcrit.t) { dessusEcrit.t = t; dessus.style.transform = t; }
      if (o !== dessusEcrit.o) { dessusEcrit.o = o; dessus.style.opacity = o; }
      const tt = maintenant();
      if (!dessusOuvert && penche > 0.5 && tt - dessusT > 300) { dessusOuvert = true; dessusT = tt; vibrer('fx-dessus'); }
      else if (dessusOuvert && penche < 0.38 && tt - dessusT > 300) { dessusOuvert = false; dessusT = tt; vibrer('fx-dessus-ferme'); }
    } else if (dessusEcrit.o !== '0') { dessusEcrit.o = '0'; dessus.style.opacity = '0'; }
  }
  /** la face du dessus du cube : ce que le ploxion compose (ses bions), son type et sa famille */
  function faceDessus(e) {
    const l = Array.isArray(e.bions) ? e.bions : [];
    return '<div class="px-fx-dessus-in"><p><b>' + esc(e.nom) + '</b><small>' + (l.length ? l.length + ' bion' + (l.length > 1 ? 's' : '') : (e.id == null ? 'l\'accueil' : 'aucun bion déclaré')) + '</small></p>'
      + '<ul>' + l.slice(0, 18).map(n => '<li>' + glyphe('bion') + esc(n) + '</li>').join('') + '</ul></div>';
  }
  /** (0.63) les crans haptiques, selon l'usage : un par carte qui passe le centre (hystérésis ±0,12 : un doigt posé sur la frontière ne
   *  mitraille plus) ; lent = un cran net (+1), rapide = un sur deux, très rapide = un sur trois — les repères (l'accueil, l'app de
   *  départ) jamais sautés ; le cube : une molette lourde ; les bouts de la file : une butée */
  function sentir() {
    if (!continu()) { sCran = Math.round(focus); return; }
    const n = cartes.length, lo = -0.02, hi = n - 1 + 0.02;
    const dehors = etat === 'slider' ? ((focus <= 0 && dirSlider < 0) || (focus >= n - 1 && dirSlider > 0)) : (focus < lo || focus > hi);
    if (dehors && buteeArmee) { buteeArmee = false; vibrer('fx-butee'); } else if (!dehors && focus > 0.1 && focus < n - 1.1) buteeArmee = true;
    const c = borne(Math.round(focus), 0, n - 1);
    if (c === sCran || (Math.abs(c - sCran) === 1 && Math.abs(focus - sCran) < 0.62)) return;
    sCran = c;
    const k = cartes[c], repere = !!k && (k.e.id == null || k.e.id === departId), v = vFocus;
    if (etat === 'cube') { if (v > 8 && (++nSaut % 2)) return; vibrer('fx-face', null, { niveau: v > 4 ? -1 : 0 }); return; }
    if (!repere && v > 16 && (++nSaut % 3)) return;
    if (!repere && v > 10 && v <= 16 && (++nSaut % 2)) return;
    vibrer(etat === 'slider' ? 'fx-defile' : 'fx-carte', null, { niveau: repere || v < 3 ? 1 : 0 });
  }

  // ---- le ressort (0.63) : il garde l'élan du doigt ; le focus traverse chaque carte (un cran par carte), puis se pose ----
  function ressort(vers, v0 = 0, fin = null) {
    if (calme()) { focus = vers; res = null; placer(); sentir(); if (fin) fin(); return; }
    res = { x: focus - vers, v: v0, vers, de: focus, fin }; demander();
  }
  function pasRessort(dt) {
    const w = 2 * Math.PI / 0.42, z = 0.86;
    let reste = dt; while (reste > 1e-6) { const h = Math.min(reste, 1 / 120); reste -= h; res.v += (-w * w * res.x - 2 * z * w * res.v) * h; res.x += res.v * h; }
    focus = res.vers + res.x;
    if (Math.abs(res.x) < 0.002 && Math.abs(res.v) < 0.02) { const r = res; res = null; focus = r.vers; if (Math.abs(r.de - r.vers) >= 0.15) vibrer('fx-pose'); if (r.fin) r.fin(); }
  }
  /** le cube : la face du dessus suit le doigt, sinon le gyroscope (lissé), sinon sa pose */
  function pasCube(dt) {
    if (pencheMain != null) { penche = pencheMain; return false; }
    const gy = borne((incCube().y - 0.25) / 0.35, 0, 1), cible = Math.max(gy, pencheSnap);
    penche += (cible - penche) * (1 - Math.exp(-dt / 0.06));
    return Math.abs(cible - penche) > 0.002;
  }
  /** le slider : le doigt au bord = une vitesse vers ce bord (vers le centre : ralentit ; au-delà : repart dans l'autre sens) ; le gyroscope
   *  penché ajoute ou retire (jusqu'à ±9 cartes/s) ; arrêté (le doigt au centre, ou le bout de la file) et tenu 1,2 s : le cube */
  function avancerSlider(dt) {
    const { w } = boite(), t = maintenant(), rampe = borne((t - debutSlider) / 300, 0, 1);   // le moteur démarre
    const r = g ? borne((g.x - w / 2) / (w / 2), -1, 1) : 0, vd = Math.abs(r) < 0.15 ? 0 : r * 7 * rampe;
    const vg = Math.abs(inc.x) < MORTE ? 0 : (inc.x - Math.sign(inc.x) * MORTE) * 11;
    dirSlider = Math.sign(vd + vg);
    let fige;
    if (t < transit) fige = !(vd + vg);   // l'entrée : les transitions jouent, rien ne défile encore
    else { const avant = focus; focus = borne(focus + (vd + vg) * dt, 0, cartes.length - 1); fige = Math.abs(focus - avant) < 1e-6; }
    arret = fige ? arret + dt : 0;
    if (!fige) rechargeI = 0;
    while (rechargeI < RECHARGE.length && arret >= RECHARGE[rechargeI]) { vibrer('fx-recharge', null, { niveau: rechargeI === RECHARGE.length - 1 ? 1 : 0 }); rechargeI++; }
    if (arret * 1000 >= ETAPES.cube && g) { arret = 0; rechargeI = 0; focus = Math.round(focus); entrer('cube'); }
    return true;
  }

  function construireCube() {
    if (salle) return;
    const b = boite();
    // la SALLE du kion 4D (le croquis de RS-7) : le cadre de l'écran, des cadres qui reculent, et les arêtes qui descendent vers le cube
    const sv = 'http://www.w3.org/2000/svg', vw = W.innerWidth || b.w, vh = W.innerHeight || b.h, c = CUBE, ix = b.l + b.w * (1 - c) / 2, iy = b.t + b.h * (1 - c) / 2, iw = b.w * c, ih = b.h * c;
    const cadre = (k) => { const x = 10 + (ix - 10) * k, y = 10 + (iy - 10) * k, x2 = vw - 10 + (ix + iw - vw + 10) * k, y2 = vh - 10 + (iy + ih - vh + 10) * k; return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (x2 - x).toFixed(1) + '" height="' + (y2 - y).toFixed(1) + '" stroke-opacity="' + (0.5 - k * 0.3).toFixed(2) + '"/>'; };
    salle = D.createElement('div'); salle.className = 'px-fx-salle';
    salle.innerHTML = '<svg xmlns="' + sv + '" viewBox="0 0 ' + vw + ' ' + vh + '" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="1.2">' + [0, 0.3, 0.55, 0.78].map(cadre).join('')
      + [[10, 10, ix, iy], [vw - 10, 10, ix + iw, iy], [vw - 10, vh - 10, ix + iw, iy + ih], [10, vh - 10, ix, iy + ih]].map(([a, b2, x2, y2]) => '<line x1="' + a + '" y1="' + b2 + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke-opacity=".45"/>').join('') + '</svg>';
    racine.appendChild(salle);
    // la face du dessus du cube : les bions du ploxion de devant
    dessus = D.createElement('div'); dessus.className = 'px-fx-dessus'; Object.assign(dessus.style, { top: ((b.h - b.w) / 2) + 'px', height: b.w + 'px' }); scene.appendChild(dessus);
  }
  /** rien d'autre que l'accueil : un refus (une fois par geste), et le routeur le dit */
  function vide() { if (g && g.vide) return; if (g) g.vide = true; vibrer('fx-refus'); if (surVide) { try { surVide(); } catch (e) { /* */ } } }
  function entrer(e) {
    if (!actif()) return;
    if ((etat === 'repos' && !monter()) || !cartes.length) { if (e === 'apercu' || e === 'fractale') vide(); return; }
    classe('px-fx-prep', false);
    if (e === 'apercu') { const n = cartes.length; sensApercu = g ? g.sens : 1; vois = (depart + sensApercu + n) % n; if (vois === depart) e = 'fractale'; }   // la file fait le tour
    const avant = etat; etat = e;
    if (avant === 'depart' || avant === 'apercu') { try { const a = D.activeElement; if (a && a !== D.body && a.blur) a.blur(); } catch (er) { /* */ } }   // le clavier d'iOS se range
    vibrer(e === 'apercu' ? 'fx-apercu' : e === 'cube' ? 'fx-cube' : e === 'slider' ? 'fx-slider' : 'fx-fractale', null, { niveau: pressionVue && e !== 'apercu' ? 1 : 0 });
    if (e !== 'apercu' && g) { g.ox = g.x; g.of = focus; g.suit = false; }
    if (e !== 'apercu') ecouterGyro();
    if (e === 'fractale') focus = Math.round(focus);
    if (e === 'slider') { transit = maintenant() + 200; debutSlider = transit; arret = 0; rechargeI = 0; }
    if (e === 'cube') { focus = Math.round(focus); res = null; transit = maintenant() + 420; incFige = { x: inc.x, y: inc.y }; pencheSnap = 0; construireCube(); }
    sCran = Math.round(focus);
    placer(); demander();
  }
  /** le PORTAIL (le croquis « portail ») : des carrés emboîtés jaillissent de la carte choisie, en s'ouvrant */
  function portail() {
    if (calme()) return; const p = D.createElement('div'); p.className = 'px-fx-portail'; p.innerHTML = '<i></i><i></i><i></i><i></i>'; racine.appendChild(p);
    [...p.children].forEach((n, j) => animer(n, [{ transform: 'translate(-50%,-50%) scale(' + (0.2 + j * 0.12) + ') rotate(45deg)', opacity: 0.9 }, { transform: 'translate(-50%,-50%) scale(' + (2.6 + j * 0.5) + ') rotate(45deg)', opacity: 0 }], 520 + j * 70, 'cubic-bezier(.2,.7,.2,1)'));
    W.setTimeout(() => p.remove(), 900);
  }
  function ouvrirIndex(i, { muet = false } = {}) {
    const k = cartes[i]; if (!k) return demonter();
    const id = k.e.id, meme = id === departId && i === depart;
    if (!meme) portail();
    res = null; cg = null; pince = null; echelle = 1; focus = i; etat = 'zoom'; penche = 0; pencheMain = null;
    if (!muet) vibrer(meme ? 'fx-revenir' : 'fx-ouvrir', meme ? null : id);   // l'app choisie : sa signature ; revenir : un cran doux
    k.el.classList.add('px-fx-zoom');   // ses coins s'effacent pendant le zoom, pas d'un coup à la fin
    if (!meme && !k.cree) k.el.classList.add('px-sans-entree');   // l'entrée (px-entre) ne se rejoue pas sur l'app qu'on vient d'amener
    placer(); demander();
    const n = montage;
    W.setTimeout(() => { if (n !== montage) return; demonter(); if (!meme) aller(id); }, calme() ? 0 : 300);
  }
  /** revenir là d'où l'on vient (s'il a été fermé entre-temps : l'accueil) */
  function revenir({ muet = false } = {}) {
    if (etat === 'repos' || !cartes.length) return;
    let i = cartes.findIndex(k => k.e.id === departId); if (i < 0) i = Math.max(0, cartes.findIndex(k => k.e.id == null));
    depart = i; ouvrirIndex(i, { muet });
  }
  /** jeter une carte vers le haut : le ploxion se ferme, les autres se resserrent tout de suite ; le démontage suit, après */
  function jeter(i) {
    const k = cartes[i]; if (!k) return;
    if (k.e.id == null || !fermer) { k.jet = 0; vibrer('fx-refus'); placer(); return; }
    k.jet = -boite().h * 1.1; vibrer('fx-ferme'); placer();
    const n = montage;
    W.setTimeout(() => {
      const id = k.e.id, j = n === montage ? cartes.indexOf(k) : -1;
      if (j >= 0) { cartes.splice(j, 1); if (depart > j) depart--; }
      k.c.remove(); if (k.cree) k.el.remove(); else rendreHote(k.el);
      if (j >= 0 && etat !== 'zoom' && etat !== 'repos') {
        renumeroter();
        if (cartes.length < 2) revenir({ muet: true });
        else { focus = borne(Math.round(focus > j ? focus - 1 : focus), 0, cartes.length - 1); sCran = focus; placer(); }
      }
      // le démontage du ploxion (lourd, synchrone) : après que les voisines ont commencé à se resserrer
      W.setTimeout(() => { try { fermer(id); } catch (e) { /* */ } }, calme() ? 0 : 34);
    }, calme() ? 0 : 240);
  }
  /** (0.63) un ploxion fermé d'ailleurs (✕ d'un mini dock, jOSMobile.close, la limite des vivants) : sa carte part, sans rappeler fermer() */
  function oublier(id) {
    if (etat === 'repos' || etat === 'zoom') return;
    const j = cartes.findIndex(k => k.e.id === id); if (j < 0) return;
    const k = cartes.splice(j, 1)[0]; k.c.remove(); if (k.cree) k.el.remove(); else rendreHote(k.el);
    if (depart > j) depart--; renumeroter();
    if (cartes.length < 2) return revenir({ muet: true });
    focus = borne(Math.round(focus > j ? focus - 1 : focus), 0, cartes.length - 1); sCran = focus; placer();
  }
  /** (0.63) tout ranger tout de suite, sans aller nulle part (l'arrière-plan, une navigation venue d'ailleurs, Face ID) */
  function effacer() { arreterMinuteurs(); g = null; cg = null; if (etat !== 'repos') demonter(); }

  // ---- le geste, depuis un bord (routeur) ----
  function appui(cote, e) {
    if (!actif() || etat !== 'repos') return;
    g = { sens: cote === 'd' ? 1 : -1, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, bouge: false, p: 0, hist: [[tempsDe(e), e.clientX, e.clientY]], cranT: 0, engage: false, tEng: 0 };
    pressionVue = false;
    minuteurs.push(W.setTimeout(() => { if (g && !g.bouge && etat === 'repos' && actif()) monter({ prep: true }); }, PREP));
    minuteurs.push(W.setTimeout(() => { if (g && !g.bouge && (etat === 'repos' || etat === 'depart')) entrer('apercu'); }, ETAPES.apercu));
    minuteurs.push(W.setTimeout(() => { if (g && !g.tire && !g.bouge && (etat === 'repos' || etat === 'depart' || etat === 'apercu')) entrer('fractale'); }, ETAPES.fractale));
    minuteurs.push(W.setTimeout(() => { if (g && etat === 'fractale' && !g.choisi) entrer('slider'); }, ETAPES.slider));
  }
  /** l'aperçu : les crans de la tension (0,10 · 0,20), l'engagement (0,30 : « lâche pour y aller »), le dégagement (sous 0,26) */
  function tension(p) {
    const t = maintenant();
    if (!g.engage && p >= 0.3) { g.engage = true; g.tEng = t; vibrer('fx-engage'); return; }
    if (g.engage && p < 0.26 && t - g.tEng > 150) { g.engage = false; g.tEng = t; vibrer('fx-degage'); return; }
    const c = p >= 0.2 ? 2 : p >= 0.1 ? 1 : 0;
    if (!g.engage && c > g.cranT) vibrer('fx-tension');
    g.cranT = c;
  }
  function deplace(e) {
    if (!g) return;
    g.x = e.clientX; g.y = e.clientY; noter(g.hist, tempsDe(e), g.x, g.y);
    const pr = typeof e.pressure === 'number' ? e.pressure : 0.5;
    if (pr > 0 && pr < 1 && Math.abs(pr - 0.5) > 0.01) pressionVue = true;   // une vraie pression (3D Touch)
    if (etat === 'repos' || etat === 'depart') {
      if (Math.hypot(g.x - g.x0, g.y - g.y0) > BOUGE) { g.bouge = true; arreterMinuteurs(); if (etat === 'depart') demonter(); return; }   // un glissement : la préparation s'efface
      if (pressionVue && pr > 0.55) entrer('fractale');
      return;
    }
    if (pressionVue && pr > 0.85 && etat === 'fractale') entrer('slider');
    else if (pressionVue && pr > 0.55 && etat === 'apercu') entrer('fractale');
    const { w } = boite();
    if (etat === 'apercu') {
      const p = borne(((g.x0 - g.x) * g.sens) / (w * 0.6), 0, 1);
      tension(p); g.p = p; g.suit = true;
      if (p > 0.08) g.tire = true;   // il tire : la fractale ne vient plus d'elle-même
    } else if (etat === 'fractale') {
      // le doigt tenu, suivi en continu, avec des crans magnétiques : les cartes se posent d'elles-mêmes entre deux
      const f = borne(g.of - (g.x - g.ox) / unite(w, false), 0, cartes.length - 1), n = Math.round(f), r = f - n;
      focus = n + 4 * r * r * r; g.suit = true;
      if (n !== Math.round(g.of)) g.choisi = true;
    } else if (etat === 'cube') {
      focus = elastique(g.of - (g.x - g.ox) / uniteCube(w), 0.3); pencheMain = borne((g.y0 - g.y) / 160, 0, 1); penche = pencheMain; g.suit = true;
    }
    demander();
  }
  /** rend true si la fractale a pris le geste (le routeur ne fait alors pas l'action de la zone) */
  function relache(e) {
    arreterMinuteurs();
    const et = etat, gg = g; g = null; pencheMain = null;
    if (et === 'repos' || et === 'depart') { if (et === 'depart') demonter(); return false; }
    if (et === 'apercu') {
      // lancée : l'élan compte (une app tirée vite à 25 % y va)
      let p2 = gg ? gg.p : 0;
      if (gg && e && gg.hist.length > 1) { const [vx] = vitesse(gg.hist, tempsDe(e), e.clientX, e.clientY), { w } = boite(); p2 += (-vx * gg.sens / (w * 0.6)) * 1000 * 0.15; }
      if (p2 >= 0.3) ouvrirIndex(vois); else revenir();
    } else if (et === 'slider') ouvrirIndex(Math.round(focus));
    else if (et === 'fractale') {
      if (gg && gg.choisi) ouvrirIndex(Math.round(focus));
      else { etat = 'ouverte'; racine.classList.add('px-fx-ouverte'); ressort(borne(Math.round(focus), 0, cartes.length - 1)); placer(); }
    } else if (et === 'cube') { racine.classList.add('px-fx-ouverte'); pencheSnap = penche > 0.5 ? 1 : 0; ressort(borne(Math.round(focus), 0, cartes.length - 1)); placer(); }   // le cube reste, dans la main
    return true;
  }
  /** iOS vole le toucher (un appel, Face ID, un geste système), ou les deux bords : rien ne reste coincé, et rien ne vibre */
  function annule() {
    arreterMinuteurs(); g = null; pencheMain = null;
    if (etat === 'depart') return demonter();
    if (etat === 'cube' || etat === 'ouverte') { racine.classList.add('px-fx-ouverte'); if (etat === 'cube') pencheSnap = penche > 0.5 ? 1 : 0; ressort(borne(Math.round(focus), 0, cartes.length - 1)); placer(); return; }
    if (etat !== 'repos' && etat !== 'zoom') revenir({ muet: true });
  }

  // ---- ouverte (fractale ou cube) : le doigt fait défiler ou tourner, le paquet file sur son élan (le ressort) ; un doigt le rattrape ;
  //      jeter vers le haut ferme ; toucher ouvre ; PINCER (deux doigts qui se rapprochent) : la carte du xerboxion ----
  function surCalqueBas(e) {
    if (etat !== 'ouverte' && etat !== 'cube') return;
    doigts.set(e.pointerId, [e.clientX, e.clientY]);
    try { calque.setPointerCapture(e.pointerId); } catch (er) { /* */ }
    if (doigts.size === 2 && carte) {
      const [a, b] = [...doigts.values()]; pince = { d0: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1 };
      if (cg && cg.sens === 'jet') { const k = cartes[cg.i]; if (k) k.jet = 0; }
      cg = null; demander(); return;
    }
    if (doigts.size > 1) return;
    const attrape = !!res; res = null;   // le paquet lancé, rattrapé au vol
    const b = e.target && e.target.closest ? e.target.closest('.px-fx-cible') : null;
    cg = { x: e.clientX, y: e.clientY, f: focus, p: penche, sens: null, i: b ? +b.dataset.i : -1, hist: [[tempsDe(e), e.clientX, e.clientY]], attrape, arme: false, cranJ: 0, refus: false, tArme: 0 };
  }
  /** jeter : la tension (crans à 33 et 66 % du seuil), armé au-delà (0,22 de la hauteur), désarmé sous 0,18 ; l'accueil : un refus */
  function sentirJet(k, dy) {
    const h = boite().h, d = -dy, seuil = h * 0.22, t = maintenant();
    if (k.e.id == null || !fermer) { if (!cg.refus && d > seuil) { cg.refus = true; vibrer('fx-refus'); } return; }
    if (!cg.arme && d > seuil) { cg.arme = true; cg.tArme = t; vibrer('fx-jet-arme'); return; }
    if (cg.arme && d < h * 0.18 && t - cg.tArme > 150) { cg.arme = false; cg.tArme = t; vibrer('fx-degage'); return; }
    const c = d > seuil * 0.66 ? 2 : d > seuil * 0.33 ? 1 : 0;
    if (!cg.arme && c > cg.cranJ) vibrer('fx-tension');
    cg.cranJ = c;
  }
  function surCalqueBouge(e) {
    if (etat !== 'ouverte' && etat !== 'cube') return;
    if (doigts.has(e.pointerId)) doigts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pince) {
      const l = [...doigts.values()]; if (l.length < 2) return;
      const r = Math.hypot(l[0][0] - l[1][0], l[0][1] - l[1][1]) / pince.d0;
      echelle = borne(0.4 + 0.6 * r, 0.55, 1.08); demander();
      if (r < 0.72) { pince = null; ouvrirCarte(); }
      return;
    }
    if (!cg) return;
    const dx = e.clientX - cg.x, dy = e.clientY - cg.y;
    noter(cg.hist, tempsDe(e), e.clientX, e.clientY);
    if (!cg.sens && Math.hypot(dx, dy) > 8) cg.sens = etat === 'cube' ? 'tourne' : (Math.abs(dy) > Math.abs(dx) && dy < 0 && cg.i >= 0) ? 'jet' : 'defile';
    if (cg.sens === 'defile') focus = elastique(cg.f - dx / unite(boite().w, false));
    else if (cg.sens === 'jet') { const k = cartes[cg.i]; if (k) { k.jet = Math.min(0, dy); sentirJet(k, dy); } }
    else if (cg.sens === 'tourne') { focus = elastique(cg.f - dx / uniteCube(boite().w), 0.3); pencheMain = borne(cg.p - dy / 200, 0, 1); penche = pencheMain; }
    demander();
  }
  function surCalqueHaut(e) {
    doigts.delete(e.pointerId);
    if (pince || echelle !== 1) { if (doigts.size < 2) { pince = null; echelle = 1; demander(); } return; }
    if (!cg || (etat !== 'ouverte' && etat !== 'cube')) return;
    const c = cg; cg = null; pencheMain = null;
    const [vx, vy] = vitesse(c.hist, tempsDe(e), e.clientX, e.clientY), n = cartes.length;   // px/ms
    if (c.sens === 'defile') { const v0 = -vx * 1000 / unite(boite().w, false); ressort(borne(Math.round(focus + v0 * 0.22), 0, n - 1), v0); return; }
    if (c.sens === 'tourne') { const v0 = -vx * 1000 / uniteCube(boite().w); pencheSnap = penche > 0.5 ? 1 : 0; ressort(borne(Math.round(focus + v0 * 0.16), 0, n - 1), v0); return; }
    if (c.sens === 'jet') {
      const k = cartes[c.i];
      if (k && k.e.id != null && fermer && ((e.clientY - c.y) < -boite().h * 0.22 || vy < -0.9)) jeter(c.i);
      else if (k) { k.jet = 0; if (k.e.id != null && (c.arme || c.cranJ)) vibrer('fx-degage'); placer(); }
      return;
    }
    if (e.type === 'pointercancel') { ressort(borne(Math.round(focus), 0, n - 1)); return; }
    if (c.attrape) { ressort(borne(Math.round(focus), 0, n - 1)); return; }   // rattrapé : il se pose là, rien ne s'ouvre
    const cible = D.elementFromPoint ? D.elementFromPoint(e.clientX, e.clientY) : e.target;
    const b = cible && cible.closest ? cible.closest('.px-fx-cible') : null;
    if (b && (etat !== 'cube' || +b.dataset.i === Math.round(focus))) ouvrirIndex(+b.dataset.i); else revenir();
  }
  /** (0.63) « voir tout son xerboxion » : la carte s'ouvre par-dessus, la fractale se range derrière */
  function ouvrirCarte() {
    if (!carte) return false;
    const n = montage; echelle = 1;
    try { carte({}); } catch (e) { /* */ }
    W.setTimeout(() => { if (n === montage) demonter(); }, calme() ? 0 : 160);
    return true;
  }

  // ---- FREEFALL : l'appli au gyroscope, dans la boucle d'images (le défilement à 60/120 Hz, plus en marches de 30 Hz) ----
  function pasLibre(dt) {
    const x = Math.abs(inc.x) < MORTE ? 0 : inc.x;
    if (etat === 'repos') {
      if (!actif()) { penchee = 0; return false; }   // sous une feuille, pendant un tri, pendant Face ID : rien ne bouge tout seul
      let encore = Math.abs(cibleInc.x - inc.x) > 1e-3 || Math.abs(cibleInc.y - inc.y) > 1e-3;
      // pencher en avant ou en arrière : ce qui est à l'écran (le ploxion, sinon l'accueil) défile — l'appli entière au gyroscope
      const y = Math.abs(inc.y) < MORTE ? 0 : inc.y - Math.sign(inc.y) * MORTE;
      if (y) {
        const h = scene.querySelector('.px-hote:not([hidden])') || racine.querySelector('.px-ecran');
        if (h) { h.scrollTop = Math.max(0, (h.scrollTop || 0) + y * 1600 * dt); }
        encore = true;
      }
      // penché franchement (≥ 0,45) un demi-instant : la fractale s'ouvre, en freefall
      penchee = Math.abs(inc.x) > 0.45 ? penchee + dt : 0;
      if (penchee > 0) encore = true;
      if (penchee > 0.45 && monter()) { etat = 'ouverte'; racine.classList.add('px-fx-ouverte'); vibrer('fx-fractale'); immobile = 0; jaugeI = 0; penchee = 0; placer(); return true; }
      return encore;
    }
    if (etat !== 'ouverte') return false;
    if (!actif()) { immobile = 0; jaugeI = 0; return false; }
    focus = borne(focus + x * 6 * dt, 0, cartes.length - 1);
    // droit (dans la zone morte) 1,4 s sur une carte : elle s'ouvre (la jauge --tenu sur la carte visée, des crans de plus en plus serrés)
    immobile = x === 0 ? immobile + dt : 0;
    if (!immobile) jaugeI = 0;
    while (jaugeI < JAUGE.length && immobile >= JAUGE[jaugeI]) { vibrer('fx-jauge', null, { niveau: jaugeI >= 4 ? 1 : 0 }); jaugeI++; }
    const f = Math.round(focus), tenu = Math.round(Math.min(1, immobile / 1.4) * 50) / 50;
    if (f !== tenuI) { const a = cartes[tenuI]; if (a) a.c.style.setProperty('--tenu', '0'); tenuI = f; tenuEcrit = -1; }
    if (tenu !== tenuEcrit && cartes[f]) { tenuEcrit = tenu; cartes[f].c.style.setProperty('--tenu', String(tenu)); }
    if (x === 0) focus += (f - focus) * (1 - Math.exp(-dt / 0.08));
    if (immobile >= 1.4) { immobile = 0; penchee = 0; jaugeI = 0; ouvrirIndex(f); return false; }
    return true;
  }
  /** freefall : on / off (sans argument : bascule) ; rend l'état */
  function freefall(on) {
    const v = on == null ? !libre : !!on; if (v === libre) return libre;
    libre = v;
    if (libre) {
      badge = D.createElement('button'); badge.type = 'button'; badge.className = 'px-freefall'; badge.innerHTML = glyphe('iphone') + '<span>freefall</span><b>×</b>';
      badge.onclick = () => freefall(false); racine.appendChild(badge);
      penchee = 0; immobile = 0; jaugeI = 0; base = null; vibrer('fx-freefall-on'); ecouterGyro();
    } else {
      if (badge) { badge.remove(); badge = null; }
      if (etat === 'ouverte') revenir({ muet: true });
      couperGyro(true); vibrer('fx-freefall-off');
    }
    return libre;
  }

  /** la fractale ouverte d'un toucher (la page « aujourd'hui », un bouton) */
  function ouverte() { if (etat !== 'repos' || !actif() || !monter()) return false; etat = 'ouverte'; racine.classList.add('px-fx-ouverte'); ecouterGyro(); vibrer('fx-fractale'); placer(); return true; }

  return { appui, deplace, relache, annule, etat: () => etat, focus: () => focus, entrer, revenir, ouvrirIndex, jeter, freefall, libre: () => libre, ouverte, effacer, oublier, carte: ouvrirCarte };
}
