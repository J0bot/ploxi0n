// ◈ LE CLICKER EN NATIF (0.78). RS-7 (17.10) : « je veux que le clicker et le clickion soient intégrés en natif sur l'app, pck l'app c'est le
// cœur du xerboxion ; c'est le mobile le plus utile dans la vie de tous les jours ».
// On COMPOSE les vrais ploxions du labo (🎮 Jeu = xp, ◈ Clickion = clickion : un seul moteur, jOSXerClicker, une seule partie, xb:xpclick),
// sans en réécrire une ligne. Ce que l'app ajoute autour :
//   - DANS L'APP DÈS LE PREMIER LANCEMENT : les deux sont dans le pack hors ligne (et installés d'office), avec jOSGame (la progression de
//     🎮 Jeu attendait ce bion pour toujours) ; ils restent à jour depuis le labo (« labo »: true dans public/ploxions/index.json).
//   - LE TOUCHER NATIF : le cœur (la cité de 🎮 Jeu, le Cube du Clickion) compte dès que le doigt se pose, un toucher par doigt (plusieurs à la
//     fois), sans le délai du clic d'iOS ; l'appui long n'y est jamais un clic droit (il avalait le toucher suivant).
//   - LE TEMPS D'ABSENCE : le Clickion ne rattrape qu'à son ouverture ; resté ouvert pendant que l'iPhone dormait, il perdait tout ce temps.
//     Au retour dans l'app, ce que la partie a produit pendant l'absence est ajouté (par le moteur lui-même : rattraper) et dit.
//   - LE WIDGET : ta partie est une valeur de l'app (px.clicker : « ◈ 4,56·10^45 ») : le widget Cube et tout widget de valeurs la montrent.
// La partie se garde déjà toute seule dans boxion_local (le shim de jOSBoxion : xp/idle toutes les 15 s), donc jamais perdue si iOS vide le
// stockage de la WebView.
export const CLICKERS = ['xp', 'clickion'];
const RAPIDE = '.xc-coeur,[data-orb],.ck-cube,[data-cube]';
const CLE = 'xb:xpclick';

/** ce toucher est-il sur le cœur d'un clicker ? (le routeur n'en fait jamais un clic droit) */
export function toucherRapide(t) {
  const el = t && t.closest && t.closest(RAPIDE), h = el && el.closest('.px-hote');
  return !!(h && CLICKERS.includes(h.dataset.ploxion));
}

/** chaque doigt posé sur le cœur = un clic, tout de suite ; le clic d'iOS qui suit est avalé */
export function installerToucherRapide(W, vrai = (e) => e.isTrusted) {
  const D = W.document; let enCours = 0, dernierLeve = 0;
  const actifs = new Set();
  D.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || e.button > 0 || !toucherRapide(e.target)) return;
    const el = e.target.closest(RAPIDE);
    actifs.add(e.pointerId); enCours = actifs.size;
    el.dispatchEvent(new W.MouseEvent('click', { bubbles: true, cancelable: true, clientX: e.clientX, clientY: e.clientY, screenX: e.screenX, screenY: e.screenY, view: W }));
  }, true);
  const lever = (e) => { if (actifs.delete(e.pointerId)) { enCours = actifs.size; dernierLeve = Date.now(); } };
  D.addEventListener('pointerup', lever, true); D.addEventListener('pointercancel', lever, true);
  D.addEventListener('click', (e) => {
    if (!vrai(e) || !toucherRapide(e.target)) return;
    if (enCours > 0 || Date.now() - dernierLeve < 700) { e.stopImmediatePropagation(); e.preventDefault(); }   // déjà compté au toucher
  }, true);
}

/** le résumé d'une partie (localStorage xb:xpclick) : { L, texte } ou null */
export function resumePartie(texte, C) {
  let st; try { st = JSON.parse(texte || 'null'); } catch (e) { return null; }
  if (!st || typeof st !== 'object' || st.L == null || !C || !C.fmtL) return null;
  const n = C.normaliser ? C.normaliser(st) : st;
  return { L: n.L, dims: +n.dims || 0, texte: '◈ ' + C.fmtL(n.L) + (n.dims ? ' · ∞' + (n.dims < 1e6 ? n.dims : C.fmtL(Math.log10(n.dims))) : '') };
}

export function creerClickerNatif({ W = globalThis.window, routeur = () => null, publier = null, signaler = null, vibrer = () => {}, intervalle = 60000, vrai } = {}) {
  const D = W.document;
  // le moteur, dès qu'un des deux le pose : on note le contexte qu'il reçoit (les découverts, les tsoins, les heures) pour rattraper avec
  let ctx = null;
  const envelopper = (C) => {
    if (!C || typeof C !== 'object' || C.__natif || typeof C.production !== 'function') return C;
    const prod = C.production;
    C.production = function (c, st) { if (c && typeof c === 'object') ctx = c; return prod.apply(this, arguments); };
    C.__natif = true; return C;
  };
  let moteur = envelopper(W.jOSXerClicker);
  try { Object.defineProperty(W, 'jOSXerClicker', { configurable: true, enumerable: true, get: () => moteur, set: (v) => { moteur = envelopper(v); } }); } catch (e) { /* */ }

  const monte = (id) => !!D.querySelector('.px-hote[data-ploxion="' + id + '"]');
  const lireCle = () => { try { return W.localStorage.getItem(CLE); } catch (e) { return null; } };
  // ---- le temps d'absence ----
  let cache = 0;
  function auRetour() {
    const P = W.__xpPartie, C = moteur;
    if (!cache || Date.now() - cache < 30000) { cache = 0; return null; }
    const depuis = cache; cache = 0;
    // 🎮 Jeu rattrape seul à son retour (son visibilitychange) ; le Clickion seul, non
    if (!monte('clickion') || monte('xp') || !P || !P.st || !C || !C.rattraper || !ctx) return null;
    P.st.t = Math.min(+P.st.t || depuis, depuis);   // le tic du Clickion a pu réécrire t au réveil : l'absence commence au départ
    let r = null; try { r = C.rattraper(ctx, P.st, Date.now()); } catch (e) { return null; }
    if (r && r.L != null && r.s > 60) {
      const h = r.s >= 3600 ? Math.round(r.s / 360) / 10 + ' h' : Math.round(r.s / 60) + ' min';
      if (signaler) signaler('◈ pendant ton absence (' + h + ') : +' + C.fmtL(r.L));
      vibrer('succes');
      try { W.localStorage.setItem(CLE, JSON.stringify(P.st)); } catch (e) { /* */ }
    }
    return r;
  }
  D.addEventListener('visibilitychange', () => { if (D.hidden) { cache = Date.now(); publierPartie(); } else auRetour(); });

  // ---- le widget : la partie comme valeur de l'app ----
  let derniere = '';
  function publierPartie() {
    const r = resumePartie(lireCle(), moteur);
    if (!r || r.texte === derniere || !publier) return r;
    derniere = r.texte;
    try { publier('px.clicker', 'clicker du xerboxion', r.texte); } catch (e) { /* */ }
    return r;
  }
  const t = W.setInterval(() => { if (!D.hidden && (monte('xp') || monte('clickion'))) publierPartie(); }, intervalle);
  installerToucherRapide(W, vrai);
  return { publierPartie, auRetour, contexte: () => ctx, arreter: () => W.clearInterval(t), _cache: (v) => { cache = v; } };
}
