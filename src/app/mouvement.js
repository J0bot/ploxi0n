// 🌀 LE THÈME VIVANT (RS-7 12.10 : « des effets avec le gyroscope et l'accéléromètre — juste ça, pas plus » ; « merger le thème avec
// le gyroscope et l'accéléromètre »). Pas une fonction à part : le THÈME chill-tekk lui-même suit le téléphone.
//   - la gravité (gyroscope + accéléromètre, CoreMotion natif via PloxiApple) → deux variables du thème, --mx et --my (−1…1, lissées) :
//     le fond glisse à l'opposé (parallaxe), les icônes flottent au-dessus de la plaque, leur ombre suit, la patine glisse, l'arête du
//     haut des icônes attrape la lumière, les inscriptions gravées se creusent ;
//   - l'angle où tu tiens le téléphone devient le neutre (le repère se recentre en ~3 s) : couché, debout, peu importe ;
//   - un choc (l'accéléromètre > 0,9 g) → les icônes tressautent une fois (html.px-choc, 320 ms).
// Seulement visible : à l'accueil (ou partout si le fond est « partout »), app au premier plan, ⚙ › Apparence › Thème vivant,
// jamais en Calme. 30 Hz, aucune boucle d'images : chaque mesure pose deux variables, c'est tout.
const borne = (x) => Math.max(-1, Math.min(1, x));

export function creerMouvement({ W = globalThis.window, prefs, plugin = null, racine = null }) {
  const D = W.document, h = D.documentElement;
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  let P = plugin, ecoute = null, actif = false, echec = false, enCours = false, erreur = null, web = false, b = null, abonnes = new Set(), bruts = new Set(), envoiT = 0, s = { x: 0, y: 0 }, dernier = { x: 0, y: 0 }, chocT = 0;
  // (0.63) bruts : les abonnés qui veulent le CAPTEUR seul (la fractale, le freefall, la tuile soulevée) — le thème vivant ne se rallume pas
  // pour eux dans un ploxion (--mx/--my sur <html> 8 fois par seconde : tout le document recalculé, hôtes lourds compris)
  const veut = () => {
    const p = prefs.lire();
    if (echec || p.calme || D.hidden) return false;
    if (!P && !natif()) return false;
    if (bruts.size) return true;   // (0.63) le capteur seul (la fractale, le freefall) : même sans le thème vivant
    if (p.themeVivant === false) return false;
    // (0.53, RS-7 : « l'app lag de malade ») dans un ploxion, rien ne bouge sauf si un ploxion écoute (jOSNatif.mouvement.ecouter, devicemotion) :
    // 30 événements natifs par seconde et le style de toute la page recalculé, pour une ombre de barre
    const Rr = racine || D.getElementById('ploxi0n');
    if (Rr && !Rr.classList.contains('px-mode-accueil') && !abonnes.size && !bruts.size && !(W.__pxMouvementWeb > 0)) return false;
    return true;
  };
  /** le thème lui-même (le fond, les icônes, --mx/--my) : à l'accueil, ou si un ploxion l'écoute ; jamais sous la fractale */
  const themeVeut = () => {
    const p = prefs.lire(), Rr = racine || D.getElementById('ploxi0n');
    if (p.themeVivant === false || p.calme || (Rr && Rr.classList.contains('px-fx'))) return false;
    return !Rr || Rr.classList.contains('px-mode-accueil') || abonnes.size > 0 || W.__pxMouvementWeb > 0;
  };
  /** une mesure : la gravité (gx, gy) → --mx, --my ; l'accélération propre (ax, ay, az) → un choc */
  function mesure(m) {
    if (!m) return;
    const gx = +m.gx || 0, gy = +m.gy || 0;
    if (!b) b = { x: gx, y: gy };
    b.x += (gx - b.x) * 0.012; b.y += (gy - b.y) * 0.012;           // le neutre suit lentement (≈ 3 s à 30 Hz)
    s.x += (borne((gx - b.x) / 0.32) - s.x) * 0.28;                     // lissé : pas de tremblement
    s.y += (borne((gy - b.y) / 0.32) - s.y) * 0.28;
    const th = themeVeut(); if (th !== h.classList.contains('px-anime')) h.classList.toggle('px-anime', th);
    if (th && (Math.abs(s.x - dernier.x) > 0.004 || Math.abs(s.y - dernier.y) > 0.004)) { dernier = { x: s.x, y: s.y }; planifier(); }
    // les ploxions s'abonnent (jOSNatif.mouvement.ecouter) ; le bus jOSPorts reçoit « natif/mouvement » à 10 Hz
    const ev = { x: s.x, y: -s.y, gx, gy, gz: +m.gz || 0, ax: +m.ax || 0, ay: +m.ay || 0, az: +m.az || 0 };
    for (const f of abonnes) { try { f(ev); } catch (e) { /* */ } }
    for (const f of bruts) { try { f(ev); } catch (e) { /* */ } }
    // (0.53) sur le bus seulement si un ploxion y est abonné (chaque emit passait aussi par le journal)
    if (Date.now() - envoiT > 100 && W.jOSPorts && W.jOSPorts.emit && W.jOSPorts.topics && W.jOSPorts.topics().includes('ploxion.natif.mouvement')) { envoiT = Date.now(); try { W.jOSPorts.emit('natif', 'mouvement', ev); } catch (e) { /* */ } }
    const a = Math.hypot(+m.ax || 0, +m.ay || 0, +m.az || 0), t = Date.now();
    if (a > 0.9 && t - chocT > 900) { chocT = t; h.classList.remove('px-choc'); void h.offsetWidth; h.classList.add('px-choc'); W.setTimeout(() => h.classList.remove('px-choc'), 320); }
  }
  // (0.53) APPLIQUER, une fois par image : le fond et la grille glissent par un transform (composité : aucun recalcul de style) ; les
  // variables --mx/--my de <html> (le dock, le cube, les feuilles, les ploxions qui les lisent) au plus 8 fois par seconde
  let image = 0, varsT = 0, varsMinute = 0, cibles = null, ciblesT = 0;
  function planifier() { if (!image) image = (W.requestAnimationFrame || ((f) => W.setTimeout(f, 16)))(appliquer); }
  function appliquer() {
    image = 0; const t = Date.now();
    if (!themeVeut()) return;   // (0.63) sous la fractale : rien à faire bouger (--mx/--my reprennent à la mesure suivante)
    if (!cibles || t - ciblesT > 600) { ciblesT = t; cibles = [...D.querySelectorAll('.px-fond i')].map(e => [e, -16, 1.07]).concat([...D.querySelectorAll('.px-accueil>.px-pages,.px-accueil>.px-plat')].map(e => [e, 3, 1])); }
    for (const [e, k, z] of cibles) e.style.transform = 'translate3d(' + (s.x * k).toFixed(2) + 'px,' + (-s.y * k).toFixed(2) + 'px,0)' + (z !== 1 ? ' scale(' + z + ')' : '');
    if (t - varsT > 125) vars();
    else if (!varsMinute) varsMinute = W.setTimeout(() => { varsMinute = 0; vars(); }, 126 - (t - varsT));   // la dernière valeur arrive toujours
  }
  function vars() { varsT = Date.now(); h.style.setProperty('--mx', s.x.toFixed(3)); h.style.setProperty('--my', (-s.y).toFixed(3)); }
  // (0.44) LE GEL DU DÉMARRAGE (0.37 → 0.43, RS-7 sur iPhone ET iPad) : un échec ici retirait px-vivant de <html>, que ce module observait
  // lui-même → suivre() → redémarrer → échouer → retirer… une boucle de micro-tâches infinie : plus aucun dessin, plus aucun minuteur.
  // Désormais : <html> n'est plus observé, un échec est définitif pour la session, jamais deux démarrages en même temps.
  async function demarrer() {
    if (actif || enCours || echec) return; enCours = true; b = null;
    try {
      if (!P) P = (await import('../natif/plugins-app.js')).PloxiApple;
      ecoute = await P.addListener('mouvement', mesure);
      await P.mouvementDebut({ hz: 30 });
      actif = true; if (themeVeut()) h.classList.add('px-anime');
    } catch (e) {
      erreur = 'natif : ' + String((e && e.message) || e).slice(0, 160);
      try { if (ecoute) await ecoute.remove(); } catch (e2) { /* */ } ecoute = null;
      // le repli : DeviceMotion du web (iOS demande la permission sur un geste : le premier toucher)
      if (W.DeviceMotionEvent) { enCours = false; return repliWeb(); }
      echec = true;
    } finally { enCours = false; }
  }
  function surWeb(e) {
    const g = e.accelerationIncludingGravity || {}, a = e.acceleration || {};
    // iOS : m/s², gravité vers le bas → les mêmes unités (g) et le même sens que CoreMotion
    mesure({ gx: -(g.x || 0) / 9.81, gy: -(g.y || 0) / 9.81, gz: -(g.z || 0) / 9.81, ax: (a.x || 0) / 9.81, ay: (a.y || 0) / 9.81, az: (a.z || 0) / 9.81 });
  }
  function repliWeb() {
    const brancher = () => { W.addEventListener('devicemotion', surWeb); web = true; actif = true; if (themeVeut()) h.classList.add('px-anime'); };
    const demander = W.DeviceMotionEvent && W.DeviceMotionEvent.requestPermission;
    if (!demander) return brancher();
    const unGeste = () => {
      W.removeEventListener('pointerdown', unGeste, true);
      Promise.resolve(W.DeviceMotionEvent.requestPermission()).then((r) => { if (r === 'granted') brancher(); else { echec = true; erreur += ' · web : ' + r; } }).catch((e) => { echec = true; erreur += ' · web : ' + (e && e.message); });
    };
    W.addEventListener('pointerdown', unGeste, true);
  }
  async function arreter() {
    if (!actif) return; actif = false;
    h.classList.remove('px-anime'); h.style.setProperty('--mx', '0'); h.style.setProperty('--my', '0');
    for (const [e] of cibles || []) e.style.transform = ''; cibles = null; if (varsMinute) { W.clearTimeout(varsMinute); varsMinute = 0; }
    if (web) { W.removeEventListener('devicemotion', surWeb); web = false; return; }
    try { if (ecoute) await ecoute.remove(); ecoute = null; if (P && !(W.__pxMouvementWeb > 0)) await P.mouvementFin(); } catch (e) { /* */ }   // (0.47) pas si un ploxion écoute encore devicemotion (web-natif.js)
  }
  const suivre = () => (veut() ? demarrer() : arreter());
  D.addEventListener('visibilitychange', suivre);
  prefs.surChangement(suivre);
  const R = racine || D.getElementById('ploxi0n');
  if (R) new W.MutationObserver(suivre).observe(R, { attributes: true, attributeFilter: ['class'] });
  suivre();
  const api = {
    /** un ploxion suit le téléphone : cb({ x, y (−1…1, lissés), gx, gy, gz, ax, ay, az }) → off() */
    ecouter(cb, { theme = true } = {}) { const l = theme ? abonnes : bruts; l.add(cb); suivre(); return () => { l.delete(cb); suivre(); }; },
    etat: () => ({ actif, source: web ? 'web' : actif ? 'CoreMotion' : null, erreur }),
  };
  W.jOSNatif = W.jOSNatif || {}; W.jOSNatif.mouvement = api;
  W.ploxi0nMouvement = api;
  return { mesure, demarrer, arreter, actif: () => actif, suivre, ...api };
}
