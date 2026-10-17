// Le ROUTEUR de ploxi0n : l'accueil (les ploxions installés, rangés en DOSSIERS), ouvrir un ploxion (charger son bundle, mount), revenir
// (unmount : le droit au silence — un ploxion démonté libère tout). Un seul ploxion monté à la fois.
//
// Le catalogue est DYNAMIQUE (le marketplace installe et retire) : majCatalogue(liste). Un bundle vient, dans l'ordre, de
//   1. window.jOSApps[id] déjà là (les ploxions intégrés : banc, marketplace)
//   2. bundleLocal(id) → le JS installé dans boxion_local (le marketplace)
//   3. public/ploxions/<id>/app.js (le pack hors ligne embarqué)
// L'accueil : boxion_local « reglages/accueil » = { dossiers: [{ nom, ids }], pages: [{ nom, ids }] } ; des PAGES qu'on fait glisser comme
// l'écran d'accueil de l'iPhone (la première : les dossiers et tout ce qui n'est rangé nulle part). En édition, toucher un ploxion ouvre ses
// actions : le ranger dans un dossier, le mettre sur une page, l'ajouter à l'écran d'accueil de l'iPhone (ecranAccueil(id), main.js).
// Face ID : « reglages/verrous » = [ids] ; un ploxion verrouillé ne s'ouvre qu'avec jOSVerrou.ouvrir().

import { glyphe, glyphePloxion } from './glyphes.js';
import { svgXerkion, glypheCategorie } from './xerkion-icone.js';
import { creerFractale, glisser } from './fractale.js';
import { lireXerbion, htmlXerbion } from './xerbion.js';
const R = [440, 400, 360, 320, 280, 240, 200, 160, 120, 80];
// le logo (losanges concentriques), transparent : les espaces entre les losanges sont des trous
const LOGO = '<svg class="px-logo" viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="'
  + R.map(r => `M512 ${512 - r}L${512 + r} 512L512 ${512 + r}L${512 - r} 512Z`).join('') + '"/></svg>';

/** (0.63) ce qu'un geste des bords peut faire (⚙ › Gestes des bords, le HUD de tuto) */
export const ACTIONS_BORDS = [['precedente', '← app précédente'], ['suivante', 'app suivante →'], ['accueil', '⌂ accueil'], ['minimiser', '▁ minimiser'], ['basculer', '⧉ basculer'],
  ['chercher', 'chercher'], ['reglages', 'réglages'], ['portion', '◈ portion'], ['tsoin', '⧗ noter un tsoin'], ['freefall', '◇ freefall (gyroscope)'],
  ['etat', '▣ l\'état : plein écran, pip, cadre'], ['tuto', '◎ le tuto ici'], ['carte', '⊞ tout le xerboxion'], ['holo', '◈ le xerploxion (l\'hologramme)'], ['cube', '▣ ses pages, dans le cube'], ['xers', '⊡ les xers à côté (aperçus, 4 directions)'], ['rien', '— rien']];
export function creerRouteur({ fenetre = globalThis.window, sonDe = () => false, surChercher = null, surXers = null, racine, catalogue = [], base = '/ploxions/', delai = 10000, boxion = null, verrou = null, bundleLocal = null, hud = null, surUsage = null, ecranAccueil = null, usage = null, retirer = null, prefs = () => ({}), apresChargement = null, vibrer = () => {}, doubleBord = null, ouvrirExterne = null, surVocal = null, surSession = null, tsoin = null, panneau = null, miniDocks = null, surMontrer = null, surTuto = null } = {}) {
  // ▤ (0.51) les mini docks : miniDocks = { surVivants(), surFermeture(id), page() } — ⧉ ouvre leur page, ils remplacent « en arrière-plan »
  const W = fenetre, D = W.document;
  let parId = new Map(catalogue.map(p => [p.id, p]));
  // PLUSIEURS PLOXIONS VIVANTS (RS-7 12.10 : « pouvoir ouvrir des ploxions depuis des ploxions, et pouvoir minimiser un ploxion ») :
  //   vivants  id → { id, inst, hote, debut }  chacun son hôte dans la scène ; un seul visible, les autres restent montés (cachés)
  //   pile     les ploxions d'où l'on vient : ouvrir un ploxion DEPUIS un ploxion empile le premier ; « ‹ » ferme le second et y revient
  //   minimiser : le ploxion reste vivant, l'accueil revient ; la rangée « en arrière-plan » le reprend d'un geste
  // Au plus MAX_VIVANTS : au-delà, le plus anciennement vu (hors celui qu'on regarde) est fermé (le droit au silence).
  const maxVivants = () => { const n = +prefs().maxVivants; return n === 0 ? Infinity : Math.max(1, Math.min(99, n || 12)); };   // 0 = sans limite (0.56)
  // (0.69, RS-7 : « le lag quand on a plein de ploxions ouverts », 26 au compteur) LE SOMMEIL DES CACHÉS : un ploxion caché depuis plus de
  // `sommeil` minutes (5 par défaut ; 0 = jamais) s'endort — démonté, gardé dans les mini docks, un toucher le réveille — sauf s'il fait du
  // son (<audio>/<video> qui joue, ou Web Audio : sonDe, src/app/gel.js), s'il flotte (pip, cadre) ou s'il est sous le cube. Ses minuteurs,
  // sa mémoire et ses requêtes s'arrêtent avec lui : les cachés ne coûtent plus rien.
  const sommeilMs = () => { const m = prefs().sommeil; return m === 0 || m === '0' ? Infinity : Math.max(1, +m || 5) * 60000; };
  let courant = null;     // l'instance visible
  const vivants = new Map(); let pile = [];
  // LA SESSION (RS-7 12.10 : « quand on ferme l'app ou qu'elle crash, on ne retrouve jamais les apps ouvertes avant ») : à chaque changement,
  // { vivants: [{ id, params }], courant, pile } part à surSession (boxion_local « reglages/session ») ; au lancement, restaurer() rouvre le
  // ploxion qui était devant, et les autres reviennent ENDORMIS : dans ⧉ et sous les bords, montés seulement quand on y va (la mémoire).
  let endormis = [], minuteSession = null;
  function noterSession() {
    if (!surSession) return;
    if (minuteSession) W.clearTimeout(minuteSession);
    minuteSession = W.setTimeout(() => {
      minuteSession = null;
      const petit = (x) => { try { return x && JSON.stringify(x).length < 4000 ? x : null; } catch (e) { return null; } };
      try { surSession({ vivants: [...[...vivants.values()].map(v => ({ id: v.id, params: petit(v.params) })), ...endormis.map(e => ({ id: e.id, params: e.params }))], courant: courant ? courant.id : null, pile: pile.slice(), le: Date.now() }); } catch (e) { /* */ }
    }, 250);
  }
  racine.innerHTML = ''; racine.classList.add('px-mode-accueil');
  const ecran = D.createElement('div'); ecran.className = 'px-ecran';
  const scene = D.createElement('div'); scene.className = 'px-scene';
  racine.appendChild(ecran); racine.appendChild(scene);
  // LES BORDS (RS-7 : « on peut utiliser le bord droit et le bord gauche pour se balader entre les apps ») : deux bandes fines au-dessus
  // de tout ; glisser depuis le bord droit vers la gauche = l'app suivante, depuis le bord gauche vers la droite = la précédente.
  // L'ordre : l'accueil, puis les ploxions vivants dans l'ordre où ils ont été ouverts. Pointer events seulement, aucune minuterie.
  const SEUIL = 64;
  // LES DEUX BORDS EN MÊME TEMPS (RS-7 12.10 : « quand on swipe bord droit et gauche en même temps, ça ouvre le portion ») : doubleBord()
  // LES GESTES DES BORDS (RS-7 12.10 : « pas seulement sur le milieu, mais sur les bords aussi, pour des actions différentes ») : chaque bord a
  // trois zones (haut, milieu, bas) ; les deux bords ensemble aussi — chaque geste fait l'action choisie (⚙ › Navigation, prefs().gestes)
  // (0.63, RS-7 : « haut gauche, le HUD de tuto ; en bas à gauche, cycler l'état du ploxion (plein écran, normal, pip, frame) ; à droite en
  // bas, accueil ou minimiser ; les deux côtés en même temps, c'est le portion »)
  // (0.75, RS-7 17.10, sa capture des réglages : « je veux que ça soit par défaut avec ces settings ») : à droite en bas l'accueil ; les deux
  // bords : en haut le portion, au milieu les xers à côté, en bas tout le xerboxion
  const GESTES_DEFAUT = { 'g-haut': 'tuto', 'g-milieu': 'precedente', 'g-bas': 'etat', 'd-haut': 'chercher', 'd-milieu': 'suivante', 'd-bas': 'accueil',
    'deux-haut': 'portion', 'deux-milieu': 'xers', 'deux-bas': 'carte' };
  const geste = (k) => { const g = prefs().gestes || {}; return g[k] || GESTES_DEFAUT[k]; };
  function faire(action, { vitesse = 0, cubeFerme = false } = {}) {
    if (!action || action === 'rien') return;
    if (action === 'precedente' || action === 'suivante') { if (vivants.size) aCote(action === 'suivante' ? 1 : -1, { vitesse }); return; }
    if (action === 'accueil') { if (courant) { cacher(courant); courant = null; } pile = []; vibrer('bord'); return accueil(); }
    if (action === 'minimiser') return courant ? minimiser() : (flottant ? null : vibrer('fx-refus'));   // à l'accueil : déjà là
    if (action === 'etat') return cyclerEtat();
    if (action === 'holo') return basculerHolo();
    if (action === 'cube') return cubeFerme ? false : basculerCube();   // le bord l'a déjà refermé (à son pointerdown) : ne pas le rouvrir
    if (action === 'tuto') return surTuto ? surTuto(courant ? courant.id : null) : null;
    if (action === 'basculer') return vivants.size + endormis.length ? basculer() : null;
    if (action === 'freefall') return fractale.freefall();   // (0.60) l'appli au gyroscope (il a sa montée, pas de 'bord' en plus)
    if (action === 'carte') return ouvrirCarte();   // (0.63) tout le xerboxion
    if (action === 'xers') return surXers ? surXers() : ouvrirCarte();   // (0.70) le xer en image, ses voisins autour
    vibrer(action === 'portion' ? 'portion' : 'bord');
    if (action === 'tsoin') return tsoin ? tsoin() : null;
    if (action === 'chercher') return surChercher ? surChercher() : ouvrir('marketplace', { chercher: '1' });   // (0.69) d'abord chez soi
    if (action === 'reglages') return ouvrir('reglages-app');
    if (action === 'portion') return doubleBord ? doubleBord() : (ouvrirExterne && ouvrirExterne('portion'));
    if (action.startsWith('ouvrir:')) { const id = action.slice(7); return parId.has(id) ? ouvrir(id) : (ouvrirExterne && ouvrirExterne(id)); }
  }
  const tenus = { g: false, d: false }, zones = { g: 'milieu', d: 'milieu' }; let lesDeux = false;
  /** la vitesse du doigt sur un bord (px/ms, vers l'intérieur ou pas : sa valeur absolue) sur les 80 dernières ms */
  const vitesseBord = (h, t, x) => { let s = h[0]; for (const q of h) if (t - q[0] <= 80 && t - q[0] >= 8) { s = q; break; } return s ? Math.abs(x - s[1]) / Math.max(8, t - s[0]) : 0; };
  const lachers = [];   // (0.63) un pointerup perdu (arrière-plan, une vue native, la capture perdue) ne colle plus l'état des bords
  // (0.63) plus de règle « .px-tire-bord * » (tout le DOM recalculé à chaque toucher de bord) : une sélection qui fuit est effacée
  D.addEventListener('selectionchange', () => { if (!tenus.g && !tenus.d) return; try { const sel = W.getSelection && W.getSelection(); if (sel && sel.rangeCount) sel.removeAllRanges(); } catch (er) { /* */ } });
  D.addEventListener('visibilitychange', () => { if (D.hidden) for (const l of lachers) l({ type: 'pointercancel', clientX: null }); });
  for (const cote of ['g', 'd']) {
    const b = D.createElement('div'); b.className = 'px-bord px-bord-' + cote; b.setAttribute('aria-hidden', 'true'); racine.appendChild(b);
    // (0.60.1, RS-7 sur l'iPhone : « ça sélectionne le texte et ça bug de malade ») tenir un bord, c'était pour iOS un appui long : la
    // sélection de texte, la loupe, le menu — et iOS volait le toucher (pointercancel), le geste cassait. Le touchstart des bords est
    // refusé à iOS (les pointer events, eux, arrivent toujours) ; et toute sélection en cours est effacée.
    // RS-7 : « c'est quand on TIRE sur les bords » : le doigt traverse le texte du ploxion → le touchmove aussi, et tant que le doigt est
    // sur un bord, plus aucune sélection dans toute l'app (px-tire-bord)
    for (const t of ['touchstart', 'touchmove']) b.addEventListener(t, (e) => { if (prefs().bords !== false && e.cancelable) e.preventDefault(); }, { passive: false });
    let x0 = null, id0 = null, arme = false, armeT = 0, pEcrit = 0, hist = [], cubeAuDebut = false;
    b.addEventListener('pointerdown', (e) => {
      if (prefs().bords === false) return; tenus[cote] = true; if (tenus.g && tenus.d) lesDeux = true;
      annulerAppui(); annulerDroit();   // une tuile tenue ou un clic droit sous l'autre doigt ne partent pas pendant la fractale
      quitterHolo(); cubeAuDebut = !!(cubeP && cubeP.ouvert()); fermerCube();   // ◈ ▣ toucher un bord : l'hologramme redevient plat, le cube se referme (la fractale prend l'hôte tel quel)
      arme = false; pEcrit = 0; hist = [[e.timeStamp || Date.now(), e.clientX]];
      try { const sel = W.getSelection && W.getSelection(); if (sel && sel.rangeCount) sel.removeAllRanges(); } catch (er) { /* */ }
      racine.classList.add('px-tire-bord');
      const r = b.getBoundingClientRect(), f = r.height ? (e.clientY - r.top) / r.height : 0.5; zones[cote] = f < 0.33 ? 'haut' : f > 0.66 ? 'bas' : 'milieu';
      b.dataset.zone = zones[cote]; x0 = e.clientX; id0 = e.pointerId; try { b.setPointerCapture(e.pointerId); } catch (er) { /* */ } b.classList.add('px-tire'); e.preventDefault();
      if (lesDeux) fractale.annule(); else fractale.appui(cote, e); });   // ⧉ tenir : aperçu, fractale, slider
    b.addEventListener('pointermove', (e) => {
      if (x0 == null || e.pointerId !== id0) return;
      const t = e.timeStamp || Date.now(); hist.push([t, e.clientX]); while (hist.length > 2 && t - hist[0][0] > 100) hist.shift();
      if (!lesDeux) fractale.deplace(e);
      if (fractale.etat() !== 'repos' && fractale.etat() !== 'depart') { if (pEcrit) { pEcrit = 0; b.style.removeProperty('--p'); } return; }
      const dx = (e.clientX - x0) * (cote === 'g' ? 1 : -1), v = vitesseBord(hist, t, e.clientX);
      // (0.63) le seuil avec une hystérésis (armé à 64 px, désarmé sous 52) ; franchi en flick : plus léger, le lâcher suit tout de suite
      if (!arme && dx >= SEUIL) { arme = true; armeT = t; vibrer('bord-seuil', null, { niveau: v > 1.5 ? -1 : 0 }); }
      else if (arme && dx < SEUIL - 12 && t - armeT > 120) { arme = false; armeT = t; vibrer('fx-degage'); }
      const p = Math.max(0, Math.min(1, dx / SEUIL)); if (Math.abs(p - pEcrit) >= 0.02 || (p === 1) !== (pEcrit === 1)) { pEcrit = p; b.style.setProperty('--p', String(p)); }
    });
    const lacher = (e) => {
      if (x0 == null) return;
      const dx = ((e.clientX == null ? x0 : e.clientX) - x0) * (cote === 'g' ? 1 : -1), v = e.clientX == null ? 0 : vitesseBord(hist, e.timeStamp || Date.now(), e.clientX);
      x0 = null; tenus[cote] = false; b.classList.remove('px-tire'); if (pEcrit) { pEcrit = 0; b.style.removeProperty('--p'); } if (!tenus.g && !tenus.d) racine.classList.remove('px-tire-bord');
      if (e.type !== 'pointerup') { fractale.annule(); if (!tenus.g && !tenus.d) lesDeux = false; return; }   // annulé, perdu : rien ne part
      if (!lesDeux && fractale.relache(e)) return;   // la fractale a pris le geste
      if (lesDeux) { if (!tenus.g && !tenus.d) { lesDeux = false; faire(geste('deux-' + zones.g), { cubeFerme: cubeAuDebut }); } return; }
      if (dx > SEUIL) faire(geste(cote + '-' + zones[cote]), { vitesse: v, cubeFerme: cubeAuDebut });
    };
    lachers.push(lacher);
    b.addEventListener('pointerup', lacher); b.addEventListener('pointercancel', lacher);
    b.addEventListener('lostpointercapture', lacher);   // la capture perdue sans pointerup (après un pointerup, x0 == null : sans effet)
  }
  // ▣ (0.63, RS-7 : « il faut pouvoir ouvrir les ploxions en plein écran ; en bas à gauche on peut cycler entre les différents états : plein
  // écran, normal, pip, frame comme sur wayland ») LES ÉTATS D'UN PLOXION — normal → plein → pip → cadre → normal :
  //   plein  : sa barre s'efface, il prend tout l'écran, jusque sous l'île (gardé pour lui : on le retrouve plein en y revenant)
  //   pip    : il flotte en petit dans un coin, VIVANT (une vraie miniature : son hôte, réduit, rien n'est recréé), par-dessus l'accueil ou
  //            un autre ploxion ; le glisser le déplace (il s'aimante au coin le plus proche), le toucher le ramène, deux touchers : un cadre
  //   cadre  : une fenêtre, comme sur Wayland : sa barre (la déplacer ; ⤢ en grand, ▁ en pip, ✕ fermer), son coin (la redimensionner) ;
  //            on s'en sert pendant que le reste vit dessous
  // Un seul flottant à la fois ; le style vit dans des variables (--fx, --fy, --fs, --fw, --fh) : la fractale peut le prendre en carte et
  // le rendre tel quel.
  let flottant = null; const pleins = new Set();
  let poigne = null, barreCadre = null;
  function appliquerFlottant() {
    if (!flottant) return; const f = flottant, h = f.v.hote.style;
    h.setProperty('--fx', f.x.toFixed(1) + 'px'); h.setProperty('--fy', f.y.toFixed(1) + 'px'); h.setProperty('--fs', String(f.s)); h.setProperty('--fw', f.w + 'px'); h.setProperty('--fh', f.h + 'px');
    const l = f.w * f.s, t = f.h * f.s;
    if (poigne) Object.assign(poigne.style, { transform: 'translate3d(' + f.x.toFixed(1) + 'px,' + f.y.toFixed(1) + 'px,0)', width: l + 'px', height: t + 'px' });
    if (barreCadre) { Object.assign(barreCadre.style, { transform: 'translate3d(' + f.x.toFixed(1) + 'px,' + (f.y - 38).toFixed(1) + 'px,0)', width: l + 'px' }); barreCadre.style.setProperty('--ch', t + 'px'); }
  }
  /** poser (ou retirer : null) le flottant */
  function poserFlottant(v, mode = 'pip') {
    if (flottant && (!v || flottant.v !== v)) {
      const a = flottant.v; flottant = null;
      a.hote.classList.remove('px-flottant', 'px-pip', 'px-cadre'); for (const k of ['--fx', '--fy', '--fs', '--fw', '--fh']) a.hote.style.removeProperty(k);
      if (a !== courant) a.hote.hidden = true;
    }
    if (poigne) { poigne.remove(); poigne = null; } if (barreCadre) { barreCadre.remove(); barreCadre = null; }
    racine.classList.toggle('px-a-flottant', !!v);
    if (!v) return;
    const Wd = W.innerWidth || 390, Hd = W.innerHeight || 844, ancien = flottant;
    if (mode === 'pip') { const s = 0.34; flottant = { v, mode, s, w: Wd, h: Hd, x: ancien && ancien.mode === 'pip' ? ancien.x : Wd - Wd * s - 14, y: ancien && ancien.mode === 'pip' ? ancien.y : Hd - Hd * s - 118 }; }
    else flottant = { v, mode, s: 1, w: Math.round(Wd * 0.9), h: Math.round(Hd * 0.56), x: Math.round(Wd * 0.05), y: Math.round(Hd * 0.2) };
    v.hote.hidden = false; v.hote.classList.add('px-flottant'); v.hote.classList.toggle('px-pip', mode === 'pip'); v.hote.classList.toggle('px-cadre', mode === 'cadre');
    if (mode === 'pip') { poigne = D.createElement('div'); poigne.className = 'px-pip-poigne'; poigne.setAttribute('aria-label', (parId.get(v.id) || {}).nom || v.id); racine.appendChild(poigne); brancherPoigne(poigne); }
    else {
      const p = parId.get(v.id) || { nom: v.id };
      barreCadre = D.createElement('div'); barreCadre.className = 'px-cadre-barre';
      barreCadre.innerHTML = '<span>' + icone(p) + '<b>' + texte(p.nom || v.id) + '</b></span><button type="button" data-cadre="grand" aria-label="en grand">⤢</button><button type="button" data-cadre="pip" aria-label="en pip">▁</button><button type="button" data-cadre="fermer" aria-label="fermer">✕</button><i class="px-cadre-coin"></i>';
      racine.appendChild(barreCadre); brancherCadre(barreCadre);
    }
    appliquerFlottant();
  }
  /** le pip : glisser = le déplacer (aimanté au coin le plus proche), toucher = le ramener en grand, deux touchers = un cadre */
  function brancherPoigne(el) {
    let d = null, dernierTap = 0;
    el.addEventListener('touchstart', (e) => { if (e.cancelable) e.preventDefault(); }, { passive: false });
    el.addEventListener('pointerdown', (e) => { if (!flottant) return; d = { x: e.clientX, y: e.clientY, fx: flottant.x, fy: flottant.y, bouge: false }; try { el.setPointerCapture(e.pointerId); } catch (er) { /* */ } racine.classList.add('px-pip-tenu'); });
    el.addEventListener('pointermove', (e) => { if (!d || !flottant) return; const dx = e.clientX - d.x, dy = e.clientY - d.y; if (!d.bouge && Math.hypot(dx, dy) > 8) d.bouge = true; if (!d.bouge) return; flottant.x = d.fx + dx; flottant.y = d.fy + dy; appliquerFlottant(); });
    const fin = (e) => {
      if (!d || !flottant) return; const dd = d; d = null; racine.classList.remove('px-pip-tenu');
      if (e.type === 'pointercancel') return aimanter();
      if (dd.bouge) return aimanter();
      const t = Date.now(); if (t - dernierTap < 320) { dernierTap = 0; W.clearTimeout(el._tap); vibrer('vue', null, { niveau: 1 }); return poserFlottant(flottant.v, 'cadre'); }
      dernierTap = t; el._tap = W.setTimeout(() => { if (flottant && flottant.mode === 'pip') { const id = flottant.v.id; vibrer('fx-ouvrir', id); allerA(id, { muet: true }); } }, 330);
    };
    el.addEventListener('pointerup', fin); el.addEventListener('pointercancel', fin);
  }
  function aimanter() {
    if (!flottant) return; const f = flottant, Wd = W.innerWidth || 390, Hd = W.innerHeight || 844, l = f.w * f.s, t = f.h * f.s, m = 14;
    f.x = f.x + l / 2 < Wd / 2 ? m : Wd - l - m; f.y = f.y + t / 2 < Hd / 2 ? 104 : Hd - t - 118;   // sous l'île ; au-dessus du dock
    racine.classList.add('px-pip-aimante'); appliquerFlottant(); vibrer('fx-pose');
    W.setTimeout(() => racine.classList.remove('px-pip-aimante'), 320);
  }
  /** le cadre : sa barre le déplace ; ⤢ ▁ ✕ ; le coin le redimensionne */
  function brancherCadre(el) {
    let d = null;
    el.addEventListener('click', (e) => {
      const b = e.target.closest && e.target.closest('[data-cadre]'); if (!b || !flottant) return; e.stopPropagation();
      const a = b.getAttribute('data-cadre'), id = flottant.v.id;
      if (a === 'grand') { vibrer('fx-ouvrir', id); allerA(id, { muet: true }); }
      else if (a === 'pip') { vibrer('vue'); poserFlottant(flottant.v, 'pip'); }
      else if (a === 'fermer') { vibrer('fx-ferme'); poserFlottant(null); tuer(id); }
    });
    el.addEventListener('touchstart', (e) => { if (e.cancelable && !(e.target.closest && e.target.closest('button'))) e.preventDefault(); }, { passive: false });
    el.addEventListener('pointerdown', (e) => {
      if (!flottant || (e.target.closest && e.target.closest('button'))) return;
      const coin = !!(e.target.closest && e.target.closest('.px-cadre-coin'));
      d = { x: e.clientX, y: e.clientY, f: { ...flottant }, coin }; try { el.setPointerCapture(e.pointerId); } catch (er) { /* */ }
    });
    el.addEventListener('pointermove', (e) => {
      if (!d || !flottant) return; const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (d.coin) { flottant.w = Math.max(200, d.f.w + dx); flottant.h = Math.max(160, d.f.h + dy); }
      else { flottant.x = d.f.x + dx; flottant.y = Math.max(40, d.f.y + dy); }
      appliquerFlottant();
    });
    const fin = () => { if (d) { d = null; vibrer('fx-pose'); } };
    el.addEventListener('pointerup', fin); el.addEventListener('pointercancel', fin);
  }
  /** ▣ le bord bas gauche : l'état suivant (le ploxion à l'écran, sinon le flottant) */
  function cyclerEtat() {
    if (courant) {
      const v = courant;
      if (!pleins.has(v.id)) { pleins.add(v.id); racine.classList.add('px-plein-ploxion'); vibrer('vue', null, { niveau: 1 }); signaler('plein écran · bord bas gauche : l\'état suivant'); return 'plein'; }
      pleins.delete(v.id); racine.classList.remove('px-plein-ploxion');
      courant = null; poserFlottant(v, 'pip'); vibrer('fx-ferme'); accueil(); return 'pip';
    }
    if (flottant) {
      if (flottant.mode === 'pip') { vibrer('vue', null, { niveau: 1 }); poserFlottant(flottant.v, 'cadre'); return 'cadre'; }
      const id = flottant.v.id; vibrer('fx-ouvrir', id); allerA(id, { muet: true }); return 'normal';
    }
    vibrer('fx-refus'); signaler('ouvre un ploxion : bord bas gauche = plein écran, pip, cadre'); return null;
  }
  // ◈ (0.66) LE XERPLOXION — RS-7 (14.10) : « le xerploxion, c'est la version holographique d'un ploxion ». Le ploxion à l'écran, VIVANT
  // (on s'en sert toujours), devient un hologramme : il flotte au-dessus d'un socle de projection, penché par le gyroscope (relatif à la
  // tenue du début), des lignes de balayage passent. Un transform posé à la main par image (pas de variable héritée : tout l'hôte serait
  // recalculé), seulement quand il change. ◈ dans sa barre, ou un geste des bords (« holo ») ; toucher un bord, changer d'app : il redevient plat.
  let holoV = null, holoOff = null, holoImage = 0, holoSocle = null;
  const holo = { x: 0, y: 0, cx: 0, cy: 0, base: null, ecrit: '' };
  function poserHolo() {
    holoImage = 0; if (!holoV) return;
    holo.x += (holo.cx - holo.x) * 0.18; holo.y += (holo.cy - holo.y) * 0.18;
    const t = 'perspective(1100px) translate3d(0,-2%,0) rotateX(' + (14 + holo.y * 10).toFixed(2) + 'deg) rotateY(' + (holo.x * 16).toFixed(2) + 'deg) scale(.82)';
    if (t !== holo.ecrit) { holo.ecrit = t; holoV.hote.style.transform = t; }
    if (Math.abs(holo.cx - holo.x) + Math.abs(holo.cy - holo.y) > 0.002) holoImage = W.requestAnimationFrame(poserHolo);
  }
  // (0.67, RS-7 : « il y a déjà un ploxion xerploxion qui montre ça ») COMPOSER : le labo a les consoles holographiques (xerploxion-<domaine>,
  // hébergées par le ploxion « xerploxions », ?xerploxion=<id>) — un xerkion qui a la sienne l'ouvre ; les autres ploxions : l'hologramme
  // d'ici, avec ◈ consoles pour la galerie du labo.
  const CONSOLES = { dev: 'atelier', atelier: 'atelier', bouffe: 'bouffe', ferme: 'ferme', pont: 'pont', veille: 'veille' };
  const consoleDe = (id) => { const d = String(id || '').replace(/^xerkion-/, ''); return /^xerkion-/.test(String(id || '')) && CONSOLES[d] ? 'xerploxion-' + CONSOLES[d] : null; };
  function basculerHolo(on) {
    if (on !== false && !holoV && courant && consoleDe(courant.id) && ouvrirExterne) { vibrer('fx-ouvrir', 'xerploxions'); ouvrirExterne('xerploxions', { xerploxion: consoleDe(courant.id) }); return 'console'; }
    if (on !== false) fermerCube();
    const v = on === false ? null : courant; if (!v && !holoV) { vibrer('fx-refus'); signaler('ouvre un ploxion : ◈ en fait un hologramme'); return false; }
    if (holoV && (on === false || holoV === v || on == null)) { quitterHolo(); return false; }
    holoV = v; v.hote.classList.add('px-holo'); racine.classList.add('px-holo-on');
    holoSocle = D.createElement('div'); holoSocle.className = 'px-holo-socle'; holoSocle.innerHTML = '<i></i><b></b>' + (ouvrirExterne ? '<button type="button" data-holo-consoles>◈ consoles du labo</button>' : ''); racine.appendChild(holoSocle);
    const bc = holoSocle.querySelector('[data-holo-consoles]'); if (bc) bc.onclick = (e) => { e.stopPropagation(); quitterHolo(); ouvrirExterne('xerploxions'); };
    holo.x = holo.y = holo.cx = holo.cy = 0; holo.base = null; holo.ecrit = '';
    const M = W.jOSNatif && W.jOSNatif.mouvement;
    if (M && M.ecouter) holoOff = M.ecouter((e) => {
      const b = { x: +e.x || 0, y: +e.y || 0 }; if (!holo.base) holo.base = b;
      holo.cx = Math.max(-1, Math.min(1, b.x - holo.base.x)); holo.cy = Math.max(-1, Math.min(1, b.y - holo.base.y));
      if (!holoImage) holoImage = W.requestAnimationFrame(poserHolo);
    }, { theme: false });
    poserHolo(); vibrer('motif:fx-carte-xer');
    return true;
  }
  function quitterHolo() {
    if (!holoV) return; const v = holoV; holoV = null;
    if (holoOff) { try { holoOff(); } catch (e) { /* */ } holoOff = null; } if (holoImage) { W.cancelAnimationFrame(holoImage); holoImage = 0; }
    v.hote.classList.remove('px-holo'); v.hote.style.transform = ''; racine.classList.remove('px-holo-on');
    if (holoSocle) { holoSocle.remove(); holoSocle = null; }
  }
  // ▣ (0.68) LE CUBE DES PAGES — RS-7 (14.10) : « surtout, le cube c'est une vue pour les ploxions qui ont plusieurs pages ». Le ploxion à
  // l'écran devient l'intérieur d'un cube : sa page au fond, ses autres pages sur les murs (src/app/cube-pages.js, branché par main.js).
  // ▣ dans sa barre, ou un geste des bords (« cube ») ; toucher un bord, changer d'app, l'hologramme : il se referme.
  let cubeP = null;
  function basculerCube(on) {
    if (!cubeP) return false;
    if (cubeP.ouvert() || on === false) { fermerCube(); return false; }
    if (!courant) { vibrer('fx-refus'); signaler('ouvre un ploxion : ▣ montre ses pages dans un cube'); return false; }
    quitterHolo();
    return cubeP.ouvrir({ id: courant.id, hote: courant.hote, inst: courant.inst, dans: scene });
  }
  function fermerCube(id) { if (cubeP && cubeP.ouvert() && (id == null || cubeP.ouvert() === id)) cubeP.fermer(); }
  // LE DROIT AU SILENCE, appliqué : ce qu'un ploxion (ou ses bions) accroche directement à la page (une bulle flottante, un panneau…)
  // lui appartient ; caché quand il passe en arrière-plan, rendu quand on le reprend, retiré quand on le ferme. (RS-7 12.10 : un carré
  // flottait sur l'accueil, laissé par un ploxion fermé.) Ce que l'app accroche elle-même (px-*, mk-*) et les scripts ne comptent pas.
  const accroches = new Map();   // élément → id du ploxion
  const ignorer = (n) => n.nodeType !== 1 || /^(SCRIPT|STYLE|LINK|META|TEMPLATE)$/.test(n.tagName) || n === racine || /(^|\s)(px|mk)-/.test(n.className || '') || n.id === 'ploxi0n';
  if (W.MutationObserver && D.body) new W.MutationObserver((l) => {
    for (const m of l) for (const n of m.addedNodes) if (!ignorer(n) && courant) accroches.set(n, courant.id);
  }).observe(D.body, { childList: true });
  function accrochesDe(id, f) { for (const [n, x] of accroches) if (x === id) f(n); }
  /** passer à l'app d'à côté : sens +1 (suivante), -1 (précédente) ; l'accueil est au bout de la file */
  const fileBords = () => [null, ...vivants.keys(), ...endormis.map(e => e.id)];
  let rafale = 0, arrivee = 0;
  function aCote(sens, { vitesse = 0 } = {}) {
    const file = fileBords();
    const i = file.indexOf(courant ? courant.id : null);
    const cible = file[(i + sens + file.length) % file.length];
    if (cible === (courant ? courant.id : null)) return false;
    // (0.63) l'énergie du geste : lent = léger, lancé = fort ; une rafale (deux en moins de 0,6 s) : plus léger
    const t = Date.now(), niveau = t - rafale < 600 ? -1 : vitesse > 1.5 ? 1 : vitesse && vitesse < 0.5 ? -1 : 0; rafale = t;
    if (cible == null || (vivants.has(cible) && !bloque(cible))) vibrer('bord', null, { niveau });   // un endormi, un verrouillé : ouvrir() joue déjà sa signature
    allerA(cible, { sens, vitesse, arrivee: true });
    return true;
  }
  /** aller à un ploxion de la file (null = l'accueil) ; sens : le GLISSEMENT (0.59, src/app/fractale.js), 0 = sans */
  function allerA(cible, { sens = 0, vitesse = 0, arrivee: signer = false, muet = false } = {}) {
    const sortant = courant && courant.id !== cible ? courant : null;
    if (sortant) { cacher(sortant); courant = null; }
    pile = [];
    let entrant = null;
    if (muet && cible != null && (!vivants.has(cible) || bloque(cible))) muets.add(cible);   // la signature est déjà jouée : ouvrir() reste muet
    if (cible == null) accueil();
    else if (!vivants.has(cible) || bloque(cible)) { if (vivants.has(cible)) ouvrir(cible); else reveiller(cible); }
    else { montrer(vivants.get(cible)); entrant = courant ? courant.hote : null; }
    if (sens && !prefs().calme) glisser({ W, sortant: sortant ? sortant.hote : null, entrant, ecran: cible == null ? ecran : null, scene, sens, vitesse });
    // (0.63) l'app d'à côté ARRIVE : sa signature, à la fin du glissement — chaque app se reconnaît sans regarder ; seule la dernière d'une rafale
    if (arrivee) { W.clearTimeout(arrivee); arrivee = 0; }
    if (signer && (cible == null || entrant)) arrivee = W.setTimeout(() => { arrivee = 0; vibrer('fx-arrivee', cible); }, prefs().calme ? 0 : 185);
  }
  // ⧉ (0.59) tenir un bord : l'aperçu, la fractale, le slider (src/app/fractale.js)
  // (0.63) jamais sous une feuille, pendant un tri de tuiles ou pendant une demande Face ID (tri et verifEnCours : lus à l'exécution)
  const fractale = creerFractale({ W, racine, scene, vibrer, glyphe: (n) => G(n), calme: () => !!prefs().calme,
    actif: () => prefs().fractale !== false && prefs().bords !== false && !tri && !verifEnCours && !D.querySelector('.px-voile,.px-feuille,.px-tuto'),
    surVide: () => signaler('ouvre d\'abord un ploxion'), carte: (o) => ouvrirCarte(o),
    xerbion: (e) => lireXerbion({ boxion, id: e.id, bions: e.bions }).then(htmlXerbion),   // ⧈ (0.66) les données de ses bions, sur le dessus du cube
    // jeter une carte vers le haut (0.60) : un vivant se ferme, un endormi est oublié
    fermer: (id) => { if (vivants.has(id)) tuer(id); else { endormis = endormis.filter(e => e.id !== id); } majBords(); },
    file: () => fileBords().map(id => {
      if (id == null) return { id: null, nom: 'accueil', hote: null, icone: G('maison'), sous: '', bions: [] };
      const p = parId.get(id) || { id, nom: id }, v = vivants.get(id), ferme = verrous.has(id) && !deverrouilles.has(id);
      return { id, nom: p.nom || id, hote: v && !ferme ? v.hote : null, icone: ferme ? G('verrou') : icone(p), sous: ferme ? 'verrouillé' : v ? '' : 'endormi', bions: ferme ? [] : (p.bions || []) };
    }),
    origine: () => fileBords().indexOf(courant ? courant.id : null),
    aller: (id) => allerA(id, { muet: true }) });
  // (0.63) « voir tout son xerboxion » : la carte (src/app/carte-xer.js), branchée par main.js (carte : { ouvrir })
  let carteXer = null;
  function ouvrirCarte(o = {}) { if (!carteXer) return signaler('la carte arrive'); return carteXer.ouvrir(o); }
  const muets = new Set();   // (0.63) les ploxions dont la fractale vient de jouer la signature
  let edition = false, dossierOuvert = null;
  // (0.55, RS-7 : « un ploxion en Face ID… plus besoin de Face ID ») déverrouillé = pour CETTE séance seulement : l'app passe en arrière-plan,
  // tout se reverrouille (reverrouiller), et un ploxion vivant mais verrouillé ne se remontre plus sans le visage (montrer, aCote, la pile).
  const deverrouilles = new Set(); let verifEnCours = 0;
  const bloque = (id) => verrous.has(id) && !deverrouilles.has(id);
  async function demanderVisage(id, p) {
    if (!verrou) return false;
    verifEnCours++;
    try { const ok = await verrou.ouvrir('Ouvrir ' + ((p && p.nom) || id)); if (ok) deverrouilles.add(id); return !!ok; } finally { verifEnCours--; }
  }
  function ecranVerrou(id, p) {
    if (fractale.etat() !== 'repos') fractale.effacer();
    racine.classList.add('px-mode-ploxion'); racine.classList.remove('px-mode-accueil');
    ecran.innerHTML = '<div class="px-barre"><button class="px-retour" data-retour aria-label="retour">' + G('retour') + '</button><span>' + G('verrou') + ' ' + texte((p && p.nom) || id) + '</span></div><p class="px-erreur">Ce ploxion ne s\'ouvre qu\'avec ton visage.' + (verrou && verrou.derniereErreur && verrou.derniereErreur() ? '<br><small>' + texte(raisonFaceId()) + '</small>' : '') + '</p><p class="px-pad"><button class="px-modif" data-reessayer="' + texte(id) + '">déverrouiller</button></p>';
  }
  let verrous = new Set(), accueilDoc = { dossiers: [], pages: [] }, pageCourante = 0;
  const charges = new Map();
  const pret = boxion ? Promise.all([
    boxion.get('reglages', 'verrous').then(v => { verrous = new Set(Array.isArray(v) ? v : []); }),
    boxion.get('reglages', 'accueil').then(v => { if (v && Array.isArray(v.dossiers)) accueilDoc = { pages: [], ...v }; if (!Array.isArray(accueilDoc.pages)) accueilDoc.pages = []; }),
  ]).catch(() => {}) : Promise.resolve();
  const garder = () => { if (boxion) { boxion.put('reglages', 'verrous', [...verrous]).catch(() => {}); boxion.put('reglages', 'accueil', accueilDoc).catch(() => {}); } };

  function executer(id, js) {
    const s = D.createElement('script'); s.dataset.ploxion = id; s.textContent = js + '\n//# sourceURL=ploxi0n/' + id + '.js'; D.head.appendChild(s);
    if (!(W.jOSApps && W.jOSApps[id])) { try { W.eval(js); } catch (e) { /* le ploxion se signalera « pas enregistré » */ } }   // une page qui n'exécute pas les scripts insérés
  }
  function charger(id) {
    if (W.jOSApps && W.jOSApps[id]) return Promise.resolve(W.jOSApps[id]);
    if (charges.has(id)) return charges.get(id);
    const p = (async () => {
      const js = bundleLocal ? await bundleLocal(id) : null;
      if (js) { executer(id, js); if (W.jOSApps && W.jOSApps[id]) return W.jOSApps[id]; throw new Error('le ploxion ' + id + ' ne s\'est pas enregistré'); }
      return new Promise((ok, ko) => {
        const css = D.createElement('link'); css.rel = 'stylesheet'; css.href = base + encodeURIComponent(id) + '/app.css'; css.dataset.ploxion = id; D.head.appendChild(css);
        const s = D.createElement('script'); s.src = base + encodeURIComponent(id) + '/app.js'; s.dataset.ploxion = id;
        const fin = W.setTimeout(() => ko(new Error('le ploxion ' + id + ' ne s\'est pas enregistré')), delai);
        s.onload = () => { W.clearTimeout(fin); W.jOSApps && W.jOSApps[id] ? ok(W.jOSApps[id]) : ko(new Error('le ploxion ' + id + ' ne s\'est pas enregistré')); };
        s.onerror = () => { W.clearTimeout(fin); ko(new Error('bundle introuvable : ' + id)); };
        D.head.appendChild(s);
      });
    })();
    charges.set(id, p);
    p.catch(() => charges.delete(id));
    return p;
  }

  const texte = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // ◇ (0.54) un ploxion a son GLYPHE (src/app/glyphes.js : le trait du xerboxion) ; ⚙ › Apparence › « Les emoji du labo » pour les garder
  // ⬡ (0.55) l'icône d'un ploxion = son xerkion (src/app/xerkion-icone.js) ; ⚙ › Apparence peut revenir au glyphe seul, ou aux emoji du labo
  const icone = (p) => (prefs().glyphes === false ? texte((p && p.icone) || '▣') : svgXerkion(p, { seul: prefs().styleIcones === 'glyphe' }));
  const G = (n) => glyphe(n);
  // la teinte d'un ploxion (chill-tekk : chaque icône de verre a sa couleur, stable, tirée de son id)
  const teinte = (id) => { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return 160 + (h % 160); };
  const tuile = (p) => '<button class="px-tuile' + (edition && !p.interne ? ' px-edite' : '') + '" data-id="' + texte(p.id) + '"><span class="px-ic" style="--t:' + teinte(p.id) + '">' + icone(p) + '</span><span>' + (verrous.has(p.id) ? G('verrou') + ' ' : '') + texte(p.nom || p.id) + '</span></button>';
  // ✥ (0.54) l'ordre choisi au glisser-déposer : accueilDoc.ordre (la première page) ; les autres pages : l'ordre de leurs ids
  const rangerSelonOrdre = (l) => { const o = new Map((accueilDoc.ordre || []).map((id, i) => [id, i])); return l.map((p, i) => [p, o.has(p.id) ? o.get(p.id) : 1e6 + i]).sort((a, b) => a[1] - b[1]).map(x => x[0]); };
  const dansDossier = () => new Set([...accueilDoc.dossiers.flatMap(d => d.ids), ...accueilDoc.pages.flatMap(pg => pg.ids)]);

  // la cascade des tuiles (app.css « snappy et vivant ») : seulement quand on ARRIVE sur l'accueil (lancement, retour d'un ploxion), pas à
  // chaque redessin (édition, glisser une tuile)
  let surAccueil = false, minuteEntree = null;
  function vueAccueil() {
    if (!surAccueil) { racine.classList.add('px-entree'); if (minuteEntree) W.clearTimeout(minuteEntree); minuteEntree = W.setTimeout(() => racine.classList.remove('px-entree'), 800); }
    surAccueil = true;
    racine.classList.add('px-mode-accueil'); racine.classList.remove('px-mode-ploxion', 'px-plein-ploxion'); majBords();
  }
  function majBords() { racine.classList.toggle('px-a-vivants', vivants.size + endormis.length > 0); noterSession(); if (miniDocks) { try { miniDocks.surVivants(); } catch (e) { /* */ } } }
  /** un endormi (restauré de la dernière session) : monté maintenant, avec ses paramètres */
  function reveiller(id) { const e = endormis.find(x => x.id === id); endormis = endormis.filter(x => x.id !== id); return ouvrir(id, e ? e.params : null); }
  function arriere() {
    if (miniDocks) return '';   // ▤ les mini docks, au-dessus du dock
    const l = [...vivants.values()].filter(v => v !== courant);
    if (!l.length) return '';
    return '<div class="px-arriere"><span class="px-grave">en arrière-plan</span><div class="px-arriere-l">' + l.map(v => { const p = parId.get(v.id) || { nom: v.id };
      return '<span class="px-vivant"><button data-reprendre="' + texte(v.id) + '"><span class="px-ic" style="--t:' + teinte(v.id) + '">' + icone(p) + '</span>' + texte(p.nom || v.id) + '</button><button class="px-x" data-tuer="' + texte(v.id) + '" aria-label="fermer">✕</button></span>'; }).join('') + '</div></div>';
  }
  // PLUSIEURS FAÇONS DE VOIR SES PLOXIONS (RS-7 12.10) : grille (dossiers et pages) · compacte · liste · usage (ses heures) · récents ·
  // catégories. Gardée dans « reglages/accueil ».vue. Hors grille et compacte, tout est à plat (dossiers et pages ignorés, pas perdus).
  const VUES_ACCUEIL = [['grille', 'grille', 'grille'], ['compacte', 'compacte', 'compacte'], ['liste', 'liste', 'liste'], ['usage', 'usage', 'usage'], ['recents', 'recents', 'récents'], ['categories', 'categories', 'catégories']];
  const duree = (s) => !s ? '' : s < 3600 ? Math.max(1, Math.round(s / 60)) + ' min' : (Math.round(s / 360) / 10).toLocaleString('fr-CH') + ' h';
  const ilYa = (t) => { if (!t) return 'jamais ouvert'; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'à l\'instant' : m < 60 ? 'il y a ' + m + ' min' : m < 1440 ? 'il y a ' + Math.round(m / 60) + ' h' : 'il y a ' + Math.round(m / 1440) + ' j'; };
  const ligne = (p, meta, part) => '<button class="px-ligne" data-id="' + texte(p.id) + '"><span class="px-ic" style="--t:' + teinte(p.id) + '">' + icone(p) + '</span><span class="px-ligne-t"><b>' + (verrous.has(p.id) ? G('verrou') + ' ' : '') + texte(p.nom || p.id) + '</b><small>' + texte(meta || '') + '</small>'
    + (part != null ? '<i class="px-jauge"><i style="width:' + Math.round(part * 100) + '%"></i></i>' : '') + '</span></button>';
  function dock() {
    return '<nav class="px-dock px-hud px-visiere"><span class="px-hud-c">' + (hud ? hud.html() : '') + '</span></nav>';
  }
  async function aPlat(vue, tous) {
    const u = vue === 'usage' || vue === 'recents' ? (((usage && await usage().catch(() => null)) || {}).px || {}) : {};
    if (vue === 'liste') return [...tous].sort((a, b) => String(a.nom).localeCompare(String(b.nom))).map(p => ligne(p, p.categorie || '')).join('');
    if (vue === 'usage') {
      const l = [...tous].sort((a, b) => ((u[b.id] || {}).seconds || 0) - ((u[a.id] || {}).seconds || 0) || String(a.nom).localeCompare(String(b.nom)));
      const max = Math.max(1, ...l.map(p => (u[p.id] || {}).seconds || 0));
      return l.map(p => { const x = u[p.id] || {}; return ligne(p, x.seconds ? duree(x.seconds) + ' · ' + (x.opens || 0) + ' ouverture' + ((x.opens || 0) > 1 ? 's' : '') : 'zéro heure', (x.seconds || 0) / max); }).join('');
    }
    if (vue === 'recents') return [...tous].sort((a, b) => ((u[b.id] || {}).lastAt || 0) - ((u[a.id] || {}).lastAt || 0)).map(p => ligne(p, ilYa((u[p.id] || {}).lastAt))).join('');
    const groupes = new Map(); for (const p of tous) { const k = p.categorie || 'Autres'; if (!groupes.has(k)) groupes.set(k, { icone: p.cat_icone || '📦', l: [] }); groupes.get(k).l.push(p); }
    return [...groupes.entries()].sort((a, b) => b[1].l.length - a[1].l.length).map(([k, g]) => '<h2 class="px-titre-page">' + (prefs().glyphes === false ? '' : glyphe(glypheCategorie(g.l[0].cat || k)) + ' ') + texte(k) + ' · ' + g.l.length + '</h2><div class="px-grille px-cat">' + g.l.map(tuile).join('') + '</div>').join('');
  }
  /** (0.61) la page de gauche : aujourd'hui — ce qui vit (vivants, endormis, la musique, les vidéos à reprendre), et la fractale, freefall */
  function pageAujourdhui() {
    const md = (W.jOSMiniDock && W.jOSMiniDock.liste) ? (() => { try { return W.jOSMiniDock.liste(); } catch (e) { return []; } })() : [];
    let jour = ''; try { jour = new Date().toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' }); } catch (e) { /* */ }
    return '<h2 class="px-titre-page">' + G('recents') + ' aujourd\'hui</h2><p class="px-sous px-auj-date">' + texte(jour) + '</p>'
      + '<div class="px-auj-actions"><button data-auj="fractale">' + G('basculer') + '<span>la fractale</span></button><button data-auj="freefall">' + G('iphone') + '<span>freefall</span></button>'
      + '<button data-auj="tsoin">' + G('tsoin') + '<span>un tsoin</span></button><button data-auj="carte">' + G('xerboxion') + '<span>tout</span></button></div>'
      + '<h3 class="px-auj-t">ce qui vit</h3>'
      + (md.length ? '<div class="px-auj-liste">' + md.slice(0, 12).map(m => '<button class="px-auj-l" ' + (m.ploxion ? 'data-reprendre="' + texte(m.ploxion) + '"' : 'data-md="' + texte(m.cle) + '"') + '><span class="px-ic">' + (m.ploxion ? icone(parId.get(m.ploxion) || { id: m.ploxion, nom: m.titre }) : G('musique')) + '</span><span class="px-auj-tx"><b>' + texte(m.titre || '') + '</b><small>' + texte(m.sous || '') + '</small></span></button>').join('') + '</div>'
        : '<p class="px-sous">Rien d\'ouvert. Tes ploxions vivants, la musique, les vidéos à reprendre viendront ici.</p>');
  }
  async function accueil() {
    fermer(); noterSession();
    vueAccueil();
    await pret;
    const tous = [...parId.values()];
    const vue = VUES_ACCUEIL.some(v => v[0] === accueilDoc.vue) ? accueilDoc.vue : 'grille';
    if (dossierOuvert !== null && accueilDoc.dossiers[dossierOuvert]) {
      const d = accueilDoc.dossiers[dossierOuvert];
      ecran.innerHTML = '<div class="px-barre"><button class="px-retour" data-sortir aria-label="retour">' + G('retour') + '</button><span>' + G('dossier') + ' ' + texte(d.nom) + '</span></div><div class="px-grille px-pad">'
        + d.ids.map(id => parId.get(id)).filter(Boolean).map(tuile).join('') + '</div>';
      return;
    }
    const ranges = dansDossier();
    const pages = [
      accueilDoc.dossiers.map((d, i) => '<button class="px-tuile px-dossier" data-dossier="' + i + '"><span class="px-ic">' + G('dossier') + '</span><span>' + texte(d.nom) + ' (' + d.ids.filter(id => parId.has(id)).length + ')</span></button>').join('')
        + rangerSelonOrdre(tous.filter(p => !ranges.has(p.id))).map(tuile).join(''),
      ...accueilDoc.pages.map(pg => pg.ids.map(id => parId.get(id)).filter(Boolean).map(tuile).join('')),
    ];
    const noms = ['accueil', ...accueilDoc.pages.map(pg => pg.nom)];
    // (0.61, RS-7 : « faut qu'il y ait des pages à gauche et à droite ») à gauche « aujourd'hui » (ce qui vit, la fractale, freefall), à
    // droite « bibliothèque » (tout, par catégorie) ; pageCourante reste l'index LOGIQUE (0 = la page principale), le DOM est décalé de sp
    const sp = prefs().pagesCote !== false ? 1 : 0;
    pageCourante = Math.max(-sp, Math.min(pageCourante, pages.length - 1 + sp));
    const vues = '<div class="px-vues">' + VUES_ACCUEIL.map(([k, i, n]) => '<button data-vue-accueil="' + k + '"' + (k === vue ? ' class="on"' : '') + '>' + G(i) + ' ' + n + '</button>').join('') + '</div>';
    const plat = vue !== 'grille' && vue !== 'compacte';
    ecran.innerHTML = '<div class="px-accueil px-vue-' + vue + '"><header class="px-tete"><h1>' + LOGO + '<b>ploxi0n</b></h1><button class="px-modif" data-edition>' + (edition ? 'terminé' : G('editer')) + '</button></header>'
      + (panneau ? panneau() : '')   // ◈ (0.50) les modes : chill-tekk, xerboxion (l'UI du labo), xerbot
      + arriere()
      + '<p class="px-sous px-grave">' + (edition ? 'Touche un ploxion : le ranger dans un dossier, sur une page, ou l\'ajouter à l\'écran d\'accueil de l\'iPhone.' : ('◇ cycle ' + (new Date().getFullYear() + 5000) + ' · ' + tous.length + ' ploxions · hors ligne')) + '</p>'
      + vues
      + (plat ? '<div class="px-plat">' + await aPlat(vue, tous) + '</div></div>' + dock() : '')
      + (plat ? '' : '<div class="px-pages">' + (sp ? '<section class="px-page px-page-sp" data-special="aujourdhui">' + pageAujourdhui() + '</section>' : '')
        + pages.map((h, i) => '<section class="px-page" data-page="' + i + '">' + (i ? '<h2 class="px-titre-page">' + texte(noms[i]) + '</h2>' : '') + '<div class="px-grille">' + (h || '<p class="px-sous">page vide</p>') + '</div></section>').join('')
        + (sp ? '<section class="px-page px-page-sp" data-special="bibliotheque"><h2 class="px-titre-page">' + G('categories') + ' bibliothèque · ' + tous.length + '</h2>' + await aPlat('categories', tous) + '</section>' : '') + '</div>'
      + ((pages.length > 1 || sp) ? '<div class="px-points">' + (sp ? '<button class="px-point px-point-g' + (pageCourante === -1 ? ' on' : '') + '" data-aller="0" aria-label="aujourd\'hui">' + G('recents') + '</button>' : '') + pages.map((_, i) => '<button class="px-point' + (i === pageCourante ? ' on' : '') + '" data-aller="' + (i + sp) + '" aria-label="' + texte(noms[i]) + '"></button>').join('') + (sp ? '<button class="px-point px-point-g' + (pageCourante === pages.length ? ' on' : '') + '" data-aller="' + (pages.length + 1) + '" aria-label="bibliothèque">' + G('categories') + '</button>' : '') + '</div>' : '') + '</div>' + dock());
    const conteneur = racine.querySelector('.px-pages');
    if (!conteneur) return;
    if ((pageCourante + sp) && conteneur.children[pageCourante + sp]) conteneur.scrollLeft = conteneur.children[pageCourante + sp].offsetLeft;
    conteneur.addEventListener('scroll', () => {
      const i = Math.round(conteneur.scrollLeft / Math.max(1, conteneur.clientWidth)); if (i - sp === pageCourante) return;
      pageCourante = i - sp; vibrer('page'); racine.querySelectorAll('.px-point').forEach((b, k) => b.classList.toggle('on', k === i));
    }, { passive: true });
  }
  /** une bulle de message, quelques secondes (Face ID qui échoue, etc.) */
  function signaler(texteMsg) {
    let b = racine.querySelector('.px-bulle'); if (!b) { b = D.createElement('div'); b.className = 'px-bulle'; racine.appendChild(b); }
    b.textContent = texteMsg; b.hidden = false; W.clearTimeout(b._t); b._t = W.setTimeout(() => { b.hidden = true; }, 4500);
  }
  const raisonFaceId = () => (verrou && verrou.derniereErreur && verrou.derniereErreur()) || 'raison inconnue';
  function demander(question, defaut) { try { return W.prompt(question, defaut); } catch (er) { return null; } }
  function ranger(id, quoi, donne) {
    const liste = quoi === 'page' ? 'pages' : 'dossiers';
    const actuel = accueilDoc[liste].findIndex(d => d.ids.includes(id));
    let nom = donne !== undefined ? donne : demander(quoi === 'page' ? (actuel >= 0 ? 'Sur quelle page ? (vide = la remettre sur l\'accueil)' : 'Sur quelle page ? (un nom existant ou nouveau)') : (actuel >= 0 ? 'Dossier de ce ploxion (vide = le sortir du dossier)' : 'Ranger dans quel dossier ? (un nom existant ou nouveau)'), actuel >= 0 ? accueilDoc[liste][actuel].nom : '');
    if (nom === null) return;
    nom = String(nom).trim().slice(0, 40);
    // un ploxion vit à un seul endroit : un dossier OU une page (ou l'accueil)
    for (const l of ['dossiers', 'pages']) accueilDoc[l].forEach(d => { d.ids = d.ids.filter(x => x !== id); });
    if (nom) { let d = accueilDoc[liste].find(x => x.nom === nom); if (!d) { d = { nom, ids: [] }; accueilDoc[liste].push(d); } d.ids.push(id); if (quoi === 'page') pageCourante = accueilDoc.pages.indexOf(d) + 1; }
    accueilDoc.dossiers = accueilDoc.dossiers.filter(d => d.ids.length); accueilDoc.pages = accueilDoc.pages.filter(d => d.ids.length);
    if (dossierOuvert !== null && !accueilDoc.dossiers[dossierOuvert]) dossierOuvert = null;
    garder(); accueil();
  }
  // LE MENU D'UN PLOXION (appui long n'importe où, ou ✎ puis toucher) : tout ce qu'on peut en faire, en un geste ; les pages et les
  // dossiers existants se choisissent directement (la saisie seulement pour en créer un)
  function actions(id) {
    const p = parId.get(id); if (!p) return;
    const ep = hud ? hud.config().epingles : [];
    const dans = (l) => accueilDoc[l].findIndex(d => d.ids.includes(id));
    const iPage = dans('pages'), iDossier = dans('dossiers');
    const puce = (attr, val, nom, on) => '<button class="px-puce' + (on ? ' on' : '') + '" ' + attr + '="' + texte(val) + '">' + texte(nom) + '</button>';
    const f = D.createElement('div'); f.className = 'px-voile';
    f.innerHTML = '<div class="px-tiroir px-menu"><p class="px-ft"><span class="px-ic" style="--t:' + teinte(id) + '">' + icone(p) + '</span> ' + texte(p.nom || id) + '</p>'
      + '<button data-m="ouvrir">▶ ouvrir</button>'
      + (hud ? '<button data-m="epingler">' + (ep.includes(id) ? 'retirer du dock' : 'épingler au dock') + '<small>et dans le widget « Ploxions épinglés »</small></button>' : '')
      + (ecranAccueil ? '<button data-m="iphone">sur l\'écran d\'accueil de l\'iPhone</button>' : '')
      + (ecranAccueil && ecranAccueil.atelier && !p.interne ? '<button data-m="icone">son icône : la changer, la proposer au labo</button>' : '')
      + (p.interne ? '' : '<p class="px-grave">déplacer vers une page</p><div class="px-puces">' + puce('data-vers-page', '', 'accueil', iPage < 0 && iDossier < 0)
        + accueilDoc.pages.map((pg, k) => puce('data-vers-page', pg.nom, pg.nom, k === iPage)).join('') + '<button class="px-puce" data-ranger="page">＋ nouvelle</button></div>'
        + '<p class="px-grave">ranger dans un dossier</p><div class="px-puces">' + accueilDoc.dossiers.map((d, k) => puce('data-vers-dossier', d.nom, d.nom, k === iDossier)).join('')
        + (iDossier >= 0 ? puce('data-vers-dossier', '', 'sortir du dossier', false) : '') + '<button class="px-puce" data-ranger="dossier">＋ nouveau</button></div>')
      + (verrou && !p.interne ? '<button data-m="verrou">' + (verrous.has(id) ? 'retirer le verrou Face ID' : 'verrouiller avec Face ID') + '</button>' : '')
      + (retirer && !p.interne ? '<button data-m="retirer" class="px-danger">retirer de ploxi0n</button>' : '')
      + '<button data-m="">annuler</button></div>';
    racine.appendChild(f);
    f.addEventListener('click', async (e) => {
      const b = e.target.closest('button'); if (!b && e.target !== f) return;
      e.stopPropagation();
      if (b && b.getAttribute('data-m') === 'retirer' && !b.classList.contains('sur')) { b.classList.add('sur'); b.textContent = 'sûr ? touche encore pour retirer'; return; }
      f.remove();
      if (!b) return;
      const m = b.getAttribute('data-m');
      if (b.hasAttribute('data-vers-page')) return ranger(id, 'page', b.getAttribute('data-vers-page'));
      if (b.hasAttribute('data-vers-dossier')) return ranger(id, 'dossier', b.getAttribute('data-vers-dossier'));
      if (b.hasAttribute('data-ranger')) return ranger(id, b.getAttribute('data-ranger'));
      if (m === 'ouvrir') return ouvrir(id);
      if (m === 'iphone') return ecranAccueil(id);
      if (m === 'icone') return ecranAccueil.atelier(id);   // ⬡ (0.55) l'atelier de son xerkion
      if (m === 'epingler') { const c = hud.config(); c.epingles = c.epingles.includes(id) ? c.epingles.filter(x => x !== id) : [...c.epingles, id].slice(-4); const el = c.elements.find(x => x.k === 'epingles'); if (el) el.on = true; await hud.regler(c); return accueil(); }
      if (m === 'verrou') {
        if (verrous.has(id)) { if (!(await verrou.ouvrir('Retirer le verrou de ' + (p.nom || id)))) return signaler('Face ID : ' + raisonFaceId()); verrous.delete(id); }
        else { const dsp = await verrou.dispo(); if (!dsp.ok) return signaler('Face ID indisponible : ' + (dsp.erreur || raisonFaceId())); if (!(await verrou.ouvrir('Verrouiller ' + (p.nom || id)))) return signaler('Face ID : ' + raisonFaceId()); verrous.add(id); signaler('' + (p.nom || id) + ' ne s\'ouvre plus qu\'avec ton visage'); }
        garder(); return accueil();
      }
      if (m === 'retirer') { tuer(id); await retirer(id); return accueil(); }
    });
  }
  // l'APPUI LONG (450 ms sans bouger) sur une tuile ou une ligne : le menu ; le clic qui suit est avalé
  // ✥ (0.54, RS-7 : « que les apps on puisse les drag and drop et les organiser plus facilement ») : comme l'écran d'accueil de l'iPhone —
  // l'appui long SOULÈVE la tuile (les autres tremblent) ; glissée entre les autres elle se range là, lâchée sur un dossier elle y entre, tenue
  // au bord de l'écran elle passe à la page d'à côté ; lâchée sans avoir bougé : le menu d'avant. Grille et compacte seulement.
  let appui = null, avaler = 0, tri = null;
  racine.addEventListener('pointerdown', (e) => {
    const t = e.target.closest('[data-id]'); if (!t || !racine.contains(t) || t.closest('.px-hote,.px-voile') || prefs().appuiLong === false) return;
    const x0 = e.clientX, y0 = e.clientY, id = t.getAttribute('data-id');
    appui = { x0, y0, t: W.setTimeout(() => { appui = null; avaler = Date.now(); vibrer('appui');
      if (t.classList.contains('px-tuile') && t.closest('.px-pages') && !t.closest('[data-special]') && !t.classList.contains('px-dossier')) soulever(t, id, x0, y0, e.pointerId); else actions(id); }, 450) };
  });
  function soulever(t, id, x, y, pointeur) {
    const r = t.getBoundingClientRect(), fantome = t.querySelector('.px-ic').cloneNode(true);
    fantome.className += ' px-fantome'; fantome.style.left = r.left + r.width / 2 + 'px'; fantome.style.top = r.top + 30 + 'px';
    D.body.appendChild(fantome); t.classList.add('px-souleve'); racine.classList.add('px-tri');
    tri = { t, id, x0: x, y0: y, bouge: false, fantome, pointeur, bord: null, dossier: null, survol: null };
    // (0.61, RS-7 : « quand on tient longtemps n'importe quoi, il bouge avec le gyroscope ; penché en avant, on voit déjà les bions de koin
    // du ploxion ») l'icône soulevée suit l'inclinaison (relative à la tenue du début) ; penchée en avant, une bulle montre ses bions
    const M = W.jOSNatif && W.jOSNatif.mouvement && W.jOSNatif.mouvement.ecouter ? W.jOSNatif.mouvement : null;
    if (M) { const z = tri; let base = null, montre = false; const bions = (parId.get(id) || {}).bions || [];
      z.offGyro = M.ecouter((e) => {
        if (tri !== z) return; if (!base) base = { x: +e.x || 0, y: +e.y || 0 };
        const ix = (+e.x || 0) - base.x, iy = (+e.y || 0) - base.y;
        z.fantome.style.setProperty('--rx', (-iy * 40).toFixed(1) + 'deg'); z.fantome.style.setProperty('--ry', (ix * 40).toFixed(1) + 'deg');
        const veut = iy > 0.3;
        if (veut !== montre) { montre = veut; vibrer(veut ? 'bord-seuil' : 'page');
          if (veut) { z.bulle = D.createElement('div'); z.bulle.className = 'px-fantome-bions'; z.bulle.innerHTML = '<b>' + texte((parId.get(id) || {}).nom || id) + '</b>' + (bions.length ? bions.slice(0, 12).map(n => '<span>' + G('bion') + texte(n) + '</span>').join('') : '<small>aucun bion déclaré</small>'); D.body.appendChild(z.bulle); }
          else if (z.bulle) { z.bulle.remove(); z.bulle = null; } }
        if (z.bulle) { z.bulle.style.left = z.fantome.style.left; z.bulle.style.top = z.fantome.style.top; }
      }); }
  }
  function lacherTri(annule) {
    const z = tri; tri = null; if (!z) return;
    W.clearTimeout(z.bord); z.fantome.remove(); racine.classList.remove('px-tri'); z.t.classList.remove('px-souleve');
    if (z.offGyro) { try { z.offGyro(); } catch (e) { /* */ } } if (z.bulle) z.bulle.remove();
    racine.querySelectorAll('.px-cible').forEach(n => n.classList.remove('px-cible'));
    if (annule) return accueil();
    if (!z.bouge) return actions(z.id);   // un appui long sans bouger : le menu
    if (z.dossier != null && accueilDoc.dossiers[z.dossier]) { vibrer('succes'); return ranger(z.id, 'dossier', accueilDoc.dossiers[z.dossier].nom); }
    // l'ordre = celui des tuiles à l'écran, page par page (la page où elle a été lâchée la garde)
    const pagesDom = [...racine.querySelectorAll('.px-pages > .px-page:not([data-special])')];
    pagesDom.forEach((pg, i) => {
      const ids = [...pg.querySelectorAll('.px-tuile[data-id]')].map(b => b.getAttribute('data-id'));
      if (i === 0) { accueilDoc.ordre = ids; for (const l of ['dossiers', 'pages']) accueilDoc[l].forEach(d => { if (ids.includes(z.id)) d.ids = d.ids.filter(x => x !== z.id); }); }
      else if (accueilDoc.pages[i - 1]) accueilDoc.pages[i - 1].ids = ids;
    });
    accueilDoc.pages = accueilDoc.pages.filter(d => d.ids.length); accueilDoc.dossiers = accueilDoc.dossiers.filter(d => d.ids.length);
    vibrer('page'); garder(); accueil();
  }
  racine.addEventListener('pointermove', (e) => {
    if (!tri || e.pointerId !== tri.pointeur) return;
    const z = tri; if (!z.bouge && Math.hypot(e.clientX - z.x0, e.clientY - z.y0) > 8) z.bouge = true;
    z.fantome.style.left = e.clientX + 'px'; z.fantome.style.top = e.clientY + 'px';
    const sous = D.elementFromPoint(e.clientX, e.clientY), cible = sous && sous.closest('.px-tuile');
    racine.querySelectorAll('.px-cible').forEach(n => n.classList.remove('px-cible')); z.dossier = null;
    if (cible && cible !== z.t) {
      if (cible.classList.contains('px-dossier')) { cible.classList.add('px-cible'); z.dossier = +cible.getAttribute('data-dossier'); }
      else if (cible.parentNode && z.survol !== cible) {   // la tuile se glisse à sa place, les autres s'écartent
        const rc = cible.getBoundingClientRect(); z.survol = cible;
        cible.parentNode.insertBefore(z.t, e.clientX < rc.left + rc.width / 2 ? cible : cible.nextSibling); vibrer('selection');
      }
    } else if (!cible) z.survol = null;
    // tenue au bord : la page d'à côté
    const c = racine.querySelector('.px-pages'), bord = e.clientX < 26 ? -1 : e.clientX > W.innerWidth - 26 ? 1 : 0;
    if (!bord) { W.clearTimeout(z.bord); z.bord = null; } else if (!z.bord && c) z.bord = W.setTimeout(() => { if (!tri) return; tri.bord = null;
      const sp0 = c.querySelector('[data-special]') ? 1 : 0, i = Math.max(sp0, Math.min(c.children.length - 1 - sp0, Math.round(c.scrollLeft / Math.max(1, c.clientWidth)) + bord));
      if (c.children[i]) { c.scrollLeft = c.children[i].offsetLeft; const g = c.children[i].querySelector('.px-grille'); if (g && !g.contains(z.t)) g.appendChild(z.t); vibrer('page'); } }, 650);
  });
  racine.addEventListener('pointerup', (e) => { if (tri && e.pointerId === tri.pointeur) lacherTri(false); });
  racine.addEventListener('pointercancel', (e) => { if (tri && e.pointerId === tri.pointeur) lacherTri(!tri.bouge); });
  // pendant le tri, le doigt ne fait pas défiler la page (le premier touchmove annulé : WebKit ne démarre pas le défilement)
  racine.addEventListener('touchmove', (e) => { if (tri) e.preventDefault(); }, { passive: false });
  const annulerAppui = () => { if (appui) { W.clearTimeout(appui.t); appui = null; } };
  // L'APPUI LONG = LE CLIC DROIT dans les ploxions (RS-7 12.10 : « quand on presse longtemps quelque part, ça fait comme un clic droit ») :
  // 500 ms sans bouger → un vrai « contextmenu » à l'élément sous le doigt (les menus du labo s'ouvrent) ; jamais sur un champ (l'appui
  // long d'iOS y reste : sélection, loupe) ; le clic qui suit est avalé. Interrupteur : prefs().clicDroit === false.
  let droit = null, avalerDroit = 0;
  racine.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || prefs().clicDroit === false) return;
    const t = e.target; if (!t.closest || !t.closest('.px-hote') || t.closest('input,textarea,select,[contenteditable]:not([contenteditable=false])')) return;
    const x0 = e.clientX, y0 = e.clientY;
    droit = { x0, y0, t: W.setTimeout(() => {
      droit = null;
      const ev = new W.MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: x0, clientY: y0, screenX: x0, screenY: y0, button: 2, buttons: 2, view: W });
      t.dispatchEvent(ev); vibrer('appui'); avalerDroit = Date.now();
    }, 500) };
  }, true);
  const annulerDroit = () => { if (droit) { W.clearTimeout(droit.t); droit = null; } };
  racine.addEventListener('pointermove', (e) => { if (droit && Math.hypot(e.clientX - droit.x0, e.clientY - droit.y0) > 10) annulerDroit(); }, true);
  racine.addEventListener('pointerup', annulerDroit, true); racine.addEventListener('pointercancel', annulerDroit, true);
  racine.addEventListener('click', (e) => { if (avalerDroit && Date.now() - avalerDroit < 800) { avalerDroit = 0; e.stopPropagation(); e.preventDefault(); } }, true);
  racine.addEventListener('pointermove', (e) => { if (appui && Math.hypot(e.clientX - appui.x0, e.clientY - appui.y0) > 10) annulerAppui(); });
  racine.addEventListener('pointerup', annulerAppui); racine.addEventListener('pointercancel', annulerAppui);
  racine.addEventListener('click', (e) => { if (avaler && Date.now() - avaler < 800 && e.target.closest('[data-id]') && !e.target.closest('.px-voile')) { avaler = 0; e.stopPropagation(); e.preventDefault(); } }, true);
  racine.addEventListener('contextmenu', (e) => { if (e.target.closest('[data-id]')) e.preventDefault(); });
  racine.addEventListener('click', async (e) => {
    const b = e.target.closest('button'); if (!b || !racine.contains(b) || b.closest('.px-hote') || b.closest('.px-voile')) return;
    if (b.hasAttribute('data-compte')) { if (hud) hud.ouvrir(); return; }
    if (b.hasAttribute('data-reglages')) return ouvrir('reglages-app');
    if (b.hasAttribute('data-chercher')) return surChercher ? surChercher() : ouvrir('marketplace', { chercher: '1' });
    if (b.hasAttribute('data-vocal')) return surVocal ? surVocal() : null;
    if (b.hasAttribute('data-tsoin')) return tsoin ? tsoin() : null;
    if (b.hasAttribute('data-hud-px')) return ouvrir(b.getAttribute('data-hud-px'));
    if (b.hasAttribute('data-edition')) { edition = !edition; return accueil(); }
    if (b.hasAttribute('data-vue-accueil')) { vibrer('vue'); accueilDoc.vue = b.getAttribute('data-vue-accueil'); garder(); return accueil(); }
    if (b.hasAttribute('data-sortir')) { dossierOuvert = null; return accueil(); }
    if (b.hasAttribute('data-dossier')) { dossierOuvert = +b.getAttribute('data-dossier'); return accueil(); }
    if (b.hasAttribute('data-retour')) return retour();
    if (b.hasAttribute('data-reessayer')) return ouvrir(b.getAttribute('data-reessayer'));
    if (b.hasAttribute('data-minimiser')) return minimiser();
    if (b.hasAttribute('data-holo')) return basculerHolo();
    if (b.hasAttribute('data-cube')) return basculerCube();
    if (b.hasAttribute('data-reprendre')) return ouvrir(b.getAttribute('data-reprendre'));
    if (b.hasAttribute('data-tuer')) { tuer(b.getAttribute('data-tuer')); return courant ? null : accueil(); }
    if (b.hasAttribute('data-basculer')) return basculer();
    if (b.hasAttribute('data-auj')) { const a = b.getAttribute('data-auj'); if (a === 'fractale') return fractale.ouverte() || signaler('ouvre d\'abord un ploxion'); if (a === 'freefall') return fractale.freefall(); if (a === 'tsoin') return tsoin ? tsoin() : null; if (a === 'carte') return ouvrirCarte(); if (a === 'minidocks') return miniDocks ? miniDocks.page() : null; return; }
    if (b.hasAttribute('data-md')) return miniDocks ? miniDocks.page() : null;
    if (b.hasAttribute('data-aller')) { const c = racine.querySelector('.px-pages'), i = +b.getAttribute('data-aller'); if (c && c.children[i]) c.scrollTo ? c.scrollTo({ left: c.children[i].offsetLeft, behavior: 'smooth' }) : (c.scrollLeft = c.children[i].offsetLeft); return; }
    const id = b.getAttribute('data-id'); if (!id) return;
    if (!edition) return ouvrir(id);
    actions(id);
  });

  // le temps passé dans un ploxion (le vecteur xerion, comme jOSUsage du labo) : compté quand il cesse d'être visible ; au-delà de 4 h
  // d'affilée, l'écran était sans doute oublié
  function compter(v) {
    if (surUsage && v && v.debut) { const sec = Math.min(4 * 3600, Math.round((Date.now() - v.debut) / 1000)); if (sec > 0) surUsage(v.id, sec); }
    if (v) v.debut = 0;
  }
  // (12.10, RS-7 : « ploxi0n a utilisé 7 Go de données en un jour ») un ploxion caché (▁, ⧉, un autre ouvert par-dessus) gardait ses
  // vidéos EN LECTURE, invisibles — et le mode audio d'arrière-plan gardait l'app éveillée : un flux continu toute la journée.
  // Caché → ses vidéos s'arrêtent et ne préchargent plus ; le son (la musique) continue, c'est voulu.
  function couperVideos(hote) { try { for (const m of hote.querySelectorAll('video')) { if (!m.paused) m.pause(); m.preload = 'none'; } } catch (e) { /* */ } }
  function cacher(v) { if (!v) return; if (holoV === v) quitterHolo(); compter(v); couperVideos(v.hote); v.hote.hidden = true; fermerCube(v.id); v.hote.classList.remove('px-sans-entree'); v.vu = Date.now(); accrochesDe(v.id, n => { if (!n.hasAttribute('data-px-cache')) { n.setAttribute('data-px-cache', n.style.display || ''); n.style.display = 'none'; } }); }
  const joue = (v) => { try { if ([...v.hote.querySelectorAll('audio,video')].some(m => !m.paused && !m.ended)) return true; } catch (e) { /* */ } try { return !!sonDe(v.id); } catch (e) { return false; } };
  function endormirVieux(maintenant = Date.now()) {
    const lim = sommeilMs(); if (!isFinite(lim)) return 0;
    const l = [...vivants.values()].filter(v => v !== courant && !(flottant && flottant.v === v) && !(cubeP && cubeP.ouvert() === v.id) && maintenant - (v.vu || 0) > lim && !joue(v));
    for (const v of l) { endormis = [{ id: v.id, params: v.params || null }, ...endormis.filter(e => e.id !== v.id)].slice(0, 12); tuer(v.id); }
    if (l.length) { majBords(); if (courant) barre(parId.get(courant.id) || { nom: courant.id }, courant.id); noterSession(); }
    return l.length;
  }
  if (W.setInterval) W.setInterval(() => { try { endormirVieux(); } catch (e) { /* */ } }, 60000);
  function tuer(id) {
    const v = vivants.get(id); if (!v) return;
    if (v === courant) { compter(v); courant = null; }
    if (flottant && flottant.v === v) poserFlottant(null);
    if (holoV === v) quitterHolo();
    vivants.delete(id); pile = pile.filter(x => x !== id); fractale.oublier(id); pleins.delete(id);   // (0.63) sa carte part (sinon la toucher le faisait revivre)
    try { if (v.inst && typeof v.inst.unmount === 'function') v.inst.unmount(); } catch (e) { console.warn('[ploxi0n] unmount', id, e); }
    v.hote.innerHTML = ''; v.hote.remove(); fermerCube(id); majBords();   // ▣ après : hôte parti, sa salle part tout de suite
    accrochesDe(id, n => { accroches.delete(n); try { n.remove(); } catch (e) { /* */ } });
    if (miniDocks) { try { miniDocks.surFermeture(id); } catch (e) { /* */ } }
  }
  function barre(p, id) {
    const autres = vivants.size - 1 + endormis.length;
    ecran.innerHTML = '<div class="px-barre"><button class="px-retour" data-retour aria-label="retour">' + G('retour') + '</button><span>' + (prefs().glyphes === false ? icone(p) : glyphePloxion(p)) + ' ' + texte(p.nom || id) + '</span>'
      + '<span class="px-hud"><span class="px-hud-c">' + (hud ? hud.html(true) : '') + '</span>'
      + (autres > 0 ? '<button class="px-mini" data-basculer aria-label="basculer entre les ploxions ouverts">' + G('basculer') + '<b>' + (autres + 1) + '</b></button>' : '')
      + (id !== 'cube-interieur' ? '<button class="px-mini" data-cube aria-label="ses pages, dans le cube">▣</button>' : '')
      + '<button class="px-mini" data-holo aria-label="xerploxion, l\'hologramme">◈</button>'
      + '<button class="px-mini" data-minimiser aria-label="minimiser">' + G('minimiser') + '</button>'
      + (verrou && !p.interne ? '<button class="px-verrou" data-verrou aria-label="verrou Face ID">' + (verrous.has(id) ? G('verrou') : G('deverrou')) + '</button>' : '') + '</span></div>';
    const bv = ecran.querySelector('[data-verrou]');
    if (bv) bv.onclick = async (e) => {
      e.stopPropagation();
      if (verrous.has(id)) { if (!(await verrou.ouvrir('Retirer le verrou de ' + (p.nom || id)))) return signaler('Face ID : ' + raisonFaceId()); verrous.delete(id); }
      else { const dsp = await verrou.dispo(); if (!dsp.ok) { bv.textContent = '⚠'; return signaler('Face ID indisponible : ' + (dsp.erreur || raisonFaceId())); } verrous.add(id); }
      garder(); bv.innerHTML = verrous.has(id) ? G('verrou') : G('deverrou');
    };
  }
  function montrer(v) {
    if (fractale.etat() !== 'repos') fractale.effacer();   // (0.63) une navigation venue d'ailleurs (mini dock, Siri, un lien) : la fractale se range
    if (bloque(v.id)) { for (const x of vivants.values()) if (!x.hote.hidden) cacher(x); courant = null; ecranVerrou(v.id, parId.get(v.id)); ouvrir(v.id); return; }
    if (flottant && flottant.v === v) poserFlottant(null);   // le flottant revient en grand
    for (const x of vivants.values()) if (x !== v && !(flottant && flottant.v === x)) x.hote.hidden = true;
    if (cubeP && cubeP.ouvert() && cubeP.ouvert() !== v.id) fermerCube();   // ▣ le cube d'un autre ploxion (caché à l'instant) se referme
    v.hote.hidden = false; v.debut = Date.now(); v.vu = Date.now(); courant = v; majBords();
    racine.classList.toggle('px-plein-ploxion', pleins.has(v.id));
    if (surMontrer) { try { surMontrer(v.id); } catch (e) { /* */ } }   // ❄ (0.53) ses images reprennent (src/app/gel.js)
    accrochesDe(v.id, n => { if (n.hasAttribute('data-px-cache')) { n.style.display = n.getAttribute('data-px-cache'); n.removeAttribute('data-px-cache'); } });
    surAccueil = false;
    racine.classList.add('px-mode-ploxion'); racine.classList.remove('px-mode-accueil');
    barre(parId.get(v.id) || { nom: v.id }, v.id);
    try { W.history.replaceState(null, '', '#/' + encodeURIComponent(v.id)); } catch (er) { /* */ }
  }

  async function ouvrir(id, params) {
    if (!parId.has(id)) return false;
    await pret;
    const p = parId.get(id);
    if (courant && courant.id === id && !params) return true;
    endormis = endormis.filter(x => x.id !== id);
    if (bloque(id)) {
      if (verifEnCours) return false;   // une demande est déjà à l'écran
      if (!(await demanderVisage(id, p))) { if (!courant) ecranVerrou(id, p); return false; }
    }
    // ouvert DEPUIS un ploxion : celui-ci reste vivant, en dessous (la pile) ; « ‹ » y reviendra
    if (courant && courant.id !== id) { pile = pile.filter(x => x !== courant.id && x !== id); pile.push(courant.id); cacher(courant); courant = null; }
    // déjà vivant (minimisé, ou dans la pile) : on le reprend tel quel ; avec une demande (params), on le remonte frais
    const muet = muets.delete(id);
    if (vivants.has(id)) { if (!params) { pile = pile.filter(x => x !== id); if (!muet) vibrer('reprendre', id); montrer(vivants.get(id)); return true; } tuer(id); }
    // la place : au-delà de MAX_VIVANTS, le plus anciennement vu s'endort pour de bon
    while (vivants.size >= maxVivants()) { const vieux = [...vivants.values()].sort((a, b) => a.vu - b.vu)[0]; tuer(vieux.id); }
    if (!muet) vibrer('ouvrir', id);
    const hote = D.createElement('div'); hote.className = 'px-hote'; hote.dataset.ploxion = id; scene.appendChild(hote);
    const v = { id, inst: {}, hote, debut: 0, vu: Date.now(), params: params || null };
    vivants.set(id, v); montrer(v);
    try {
      const app = await charger(id);
      if (!vivants.has(id)) return false;   // fermé pendant le chargement
      // standalone:false : dans le labo, un ploxion « seul » (/px/<id>) fait parfois location.replace('/px/autre?tab=…') — dans l'app, ça
      // rechargerait tout ploxi0n ; non seul, il passe par jOS.openPloxion, c'est-à-dire par ce routeur
      if (apresChargement) { try { apresChargement(id); } catch (er) { /* un plugion ne casse pas l'ouverture */ } }
      v.inst = app.mount(hote, { embed: false, standalone: false, plein: true, host: 'ploxi0n', params: params || null, onglet: params && params.onglet }) || {};
    } catch (er) {
      hote.innerHTML = '<p class="px-erreur">Ce ploxion n\'a pas pu s\'ouvrir : ' + texte(er.message) + '</p>';
    }
    return true;
  }

  /** ferme le ploxion visible (il est démonté : le droit au silence) */
  function fermer() { if (courant) tuer(courant.id); }
  /** « ‹ » : ferme le ploxion visible ; revient à celui d'où l'on venait (la pile), sinon à l'accueil */
  function retour() {
    vibrer('revenir');
    fermer();
    while (pile.length) { const id = pile.pop(); if (vivants.has(id)) { montrer(vivants.get(id)); return true; } }
    return accueil();
  }
  /** ▁ : le ploxion visible reste vivant, en arrière-plan ; l'accueil revient */
  function minimiser() { vibrer('minimiser'); if (courant) { cacher(courant); courant = null; } pile = []; noterSession(); return accueil(); }
  /** ⧉ : la liste des ploxions vivants, pour passer de l'un à l'autre */
  function basculer() {
    if (miniDocks) return miniDocks.page();
    const f = D.createElement('div'); f.className = 'px-voile';
    f.innerHTML = '<div class="px-tiroir"><p class="px-ft">' + G('basculer') + ' ouverts</p>' + [...vivants.values()].sort((a, b) => b.vu - a.vu).map(v => { const p = parId.get(v.id) || { nom: v.id };
      return '<button data-b="' + texte(v.id) + '"' + (v === courant ? ' class="on"' : '') + '><span class="px-ic" style="--t:' + teinte(v.id) + '">' + icone(p) + '</span> ' + texte(p.nom || v.id) + (v === courant ? ' · ici' : '') + '</button>'; }).join('')
      + endormis.map(e => { const p = parId.get(e.id) || { nom: e.id }; return '<button data-b="' + texte(e.id) + '" class="px-endormi"><span class="px-ic" style="--t:' + teinte(e.id) + '">' + icone(p) + '</span> ' + texte(p.nom || e.id) + ' · endormi</button>'; }).join('')
      + (endormis.length ? '<button data-oublier>oublier les endormis</button>' : '')
      + '<button data-b="">fermer</button></div>';
    racine.appendChild(f);
    f.addEventListener('click', (e) => {
      if (e.target.closest('[data-oublier]')) { e.stopPropagation(); f.remove(); endormis = []; majBords(); return courant ? barre(parId.get(courant.id) || { nom: courant.id }, courant.id) : accueil(); }
      const b = e.target.closest('[data-b]'); if (!b && e.target !== f) return;
      e.stopPropagation(); f.remove();
      const id = b && b.getAttribute('data-b'); if (id && (!courant || courant.id !== id)) { if (endormis.some(x => x.id === id)) reveiller(id); else ouvrir(id); }
    });
  }

  return {
    accueil, ouvrir, fermer, charger, retour, minimiser, aCote, faire, GESTES_DEFAUT,
    /** (0.60) freefall : l'appli au gyroscope (sans argument : bascule) */
    freefall: (on) => fractale.freefall(on),
    /** (0.63) la carte du xerboxion : brancher (main.js), ouvrir */
    brancherCarte(c) { carteXer = c || null; }, carte: (o) => ouvrirCarte(o), signaler: (t) => signaler(t),
    /** (0.64) pour la carte du xerboxion : chaque ploxion, son icône, son état ; y aller sans rejouer la signature (la carte l'a jouée) */
    listeCarte: () => [...parId.values()].map(p => ({ id: p.id, nom: p.nom || p.id, icone: icone(p), cat: p.cat, type: p.type, bions: p.bions || [],
      etat: verrous.has(p.id) && !deverrouilles.has(p.id) ? 'verrou' : vivants.has(p.id) ? 'vivant' : endormis.some(e => e.id === p.id) ? 'endormi' : 'installe' })),
    aller: (id) => allerA(id, { muet: true }),
    /** (0.63) l'état du ploxion à l'écran (normal → plein → pip → cadre) ; ce qui flotte */
    holo: (on) => basculerHolo(on), holoActif: () => !!holoV,
    /** (0.68) ▣ le cube des pages : brancher (main.js), ouvrir / fermer (sans argument : bascule), lequel est ouvert */
    brancherCube(c) { cubeP = c || null; }, cube: (on) => basculerCube(on), cubeActif: () => (cubeP ? cubeP.ouvert() : null),
    etat: () => cyclerEtat(), flottant: () => (flottant ? { id: flottant.v.id, mode: flottant.mode } : null), plein: () => !!(courant && pleins.has(courant.id)),
    /** (0.63) pour la carte : tout ce qui vit, dort ou est installé, et l'état de chacun */
    etatsCarte: () => ({ courant: courant ? courant.id : null, vivants: [...vivants.keys()], endormis: endormis.map(e => e.id), verrous: [...verrous].filter(id => !deverrouilles.has(id)) }),
    endormis: () => endormis.map(e => e.id),
    /** (0.69) endormir maintenant ceux qui sont cachés depuis trop longtemps (rend combien) */
    endormirVieux: (t) => endormirVieux(t),
    /** ▤ les ploxions vivants, pour les mini docks : { id, vu, ici, son } (son : un <audio>/<video> qui joue encore) */
    etatVivants: () => [...vivants.values()].map(v => ({ id: v.id, vu: v.vu || 0, ici: v === courant, son: (() => { try { return [...v.hote.querySelectorAll('audio,video')].some(m => !m.paused && !m.ended); } catch (e) { return false; } })() })),
    /** fermer un ploxion précis (✕ d'un mini dock) : celui qu'on regarde → comme « ‹ » ; un autre → démonté, la barre suit */
    fermerPloxion(id) { if (courant && courant.id === id) return retour(); tuer(id); if (courant) barre(parId.get(courant.id) || { nom: courant.id }, courant.id); return true; },
    reveiller: (id) => (endormis.some(e => e.id === id) ? reveiller(id) : ouvrir(id)),
    /** (0.54) la mémoire : les ploxions vivants mais cachés s'ENDORMENT (démontés, gardés comme 💤 : un toucher les réveille) — avant
     *  une vidéo plein écran, iOS tuait sinon la page entière (« ça crash ») */
    endormirCaches() {
      const l = [...vivants.values()].filter(v => v !== courant); if (!l.length) return 0;
      for (const v of l) { endormis = [{ id: v.id, params: v.params || null }, ...endormis.filter(e => e.id !== v.id)].slice(0, 12); tuer(v.id); }
      majBords(); if (courant) barre(parId.get(courant.id) || { nom: courant.id }, courant.id);
      return l.length;
    },
    oublierEndormi(id) { endormis = endormis.filter(e => e.id !== id); fractale.oublier(id); majBords(); if (courant) barre(parId.get(courant.id) || { nom: courant.id }, courant.id); },
    /** la dernière session : le ploxion de devant rouvert, les autres endormis (montés quand on y va) */
    async restaurer(sess, { devant = true } = {}) {
      const l = (sess && Array.isArray(sess.vivants) ? sess.vivants : []).filter(x => x && parId.has(x.id));
      endormis = l.filter(x => !devant || x.id !== sess.courant).slice(0, 12).map(x => ({ id: x.id, params: x.params || null }));
      majBords();
      if (devant && sess.courant && parId.has(sess.courant)) { const e = l.find(x => x.id === sess.courant); return ouvrir(sess.courant, e && e.params); }
      return accueil();
    },
    vivants: () => [...vivants.keys()], pile: () => pile.slice(),
    connait: (id) => parId.has(id), courant: () => (courant ? courant.id : null),
    /** redessiner : l'accueil à l'écran se redessine (une icône retouchée, 0.55) */
    majCatalogue(liste, { redessiner = false } = {}) { parId = new Map(liste.map(p => [p.id, p])); if (redessiner && surAccueil && !courant) accueil(); },
    rafraichirHud() { ecran.querySelectorAll('.px-hud-c').forEach(c => { c.innerHTML = hud ? hud.html(!!courant) : ''; }); },
    catalogue: () => [...parId.values()],
    verrous: () => [...verrous],
    /** l'app passe en arrière-plan : tout se reverrouille ; un ploxion verrouillé à l'écran est caché tout de suite (l'aperçu du sélecteur
     *  d'apps ne le montre pas). Ignoré pendant une demande Face ID (la feuille du visage met l'app en pause chez certains iOS). */
    reverrouiller() {
      if (verifEnCours) return null;
      fractale.effacer(); fractale.freefall(false);   // (0.63) jamais une carte vivante dans l'aperçu du sélecteur d'iOS ; le gyroscope se tait
      if (flottant && verrous.has(flottant.v.id)) { const v = flottant.v; poserFlottant(null); cacher(v); }   // ni en PiP
      deverrouilles.clear();
      if (courant && verrous.has(courant.id)) { const v = courant; cacher(v); courant = null; ecranVerrou(v.id, parId.get(v.id)); return v.id; }
      return null;
    },
    /** au retour : le ploxion verrouillé qui était à l'écran redemande le visage */
    redemander(id) { if (id && vivants.has(id) && bloque(id)) return ouvrir(id); return Promise.resolve(false); },
    /** retirer un verrou Face ID (il faut le visage) */
    async deverrouiller(id) { if (!verrous.has(id)) return true; if (!(verrou && await verrou.ouvrir('Retirer le verrou de ' + ((parId.get(id) || {}).nom || id)))) return false; verrous.delete(id); garder(); return true; },
    /** l'accueil d'origine : plus de dossiers ni de pages */
    /** la vue de l'accueil (sans argument : la lire) */
    vueAccueil(v) { if (v === undefined) return accueilDoc.vue || 'grille'; accueilDoc.vue = v; garder(); return v; },
    async retirerPloxion(id) { tuer(id); if (retirer) await retirer(id); },
    reinitialiserAccueil() { accueilDoc = { dossiers: [], pages: [] }; pageCourante = 0; dossierOuvert = null; garder(); },
  };
}
