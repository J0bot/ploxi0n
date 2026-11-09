// ▶ LES DÉMOS (0.63). RS-7 : « pour le changelog, au lieu de mettre du texte dégueu et incompréhensible, il faudrait avoir un aperçu de la
// feature et son utilisation en sandbox ou directement montrée sur l'UI, c'est le meilleur moyen d'apprendre » ; « un tuto constant, mais le
// jeu c'est le tuto, après c'est minecraft ».
// Un DOIGT FANTÔME fait le geste pour de vrai, sur la vraie interface : il se pose sur le bord, tient, tire, lance le paquet, tourne le
// cube… — les vrais événements (pointerdown, pointermove, pointerup) partent vers les vrais éléments, l'app réagit comme sous ton doigt,
// avec ses haptiques. Toucher l'écran arrête la démo. Les nouveautés (src/app/nouveautes.js) ont un « ▶ essayer » par fonction.
//   jouer(nom)  → Promise<bool> ; noms : glisser, apercu, fractale, slider, cube, lancer, jeter, carte, freefall
//   SCENES      → { nom: { titre, ... } } (ce qui existe)
export const SCENES = {
  glisser: { titre: 'passer d\'app en app' },
  apercu: { titre: 'l\'aperçu (tenir un bord)' },
  fractale: { titre: 'la fractale' },
  lancer: { titre: 'lancer le paquet' },
  slider: { titre: 'le slider' },
  cube: { titre: 'le cube et ses bions' },
  carte: { titre: 'tout le xerboxion' },
  freefall: { titre: 'freefall' },
};
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function creerDemo({ W = globalThis.window, routeur, signaler = () => {}, attendreMs = null, racine: R = null } = {}) {
  const D = W.document;
  let enCours = null;   // { stop, doigt, badge }
  const dormir = attendreMs || ((ms) => new Promise(r => W.setTimeout(r, ms)));
  const portee = () => R || D.getElementById('ploxi0n') || D;   // le xer où jouer (ses bords, sa fractale)
  /** un événement de pointeur synthétique (PointerEvent si possible : pointerId, pressure, isPrimary) */
  function envoyer(el, type, x, y) {
    if (!el) return;
    const o = { clientX: x, clientY: y, bubbles: true, cancelable: true, pointerId: 77, pointerType: 'touch', isPrimary: true, pressure: type === 'pointerup' ? 0 : 0.5 };
    let e; try { e = W.PointerEvent ? new W.PointerEvent(type, o) : new W.MouseEvent(type, o); } catch (er) { e = new W.MouseEvent(type, o); }
    if (e.pointerId !== 77) { try { Object.defineProperty(e, 'pointerId', { value: 77 }); } catch (er) { /* */ } }
    el.dispatchEvent(e);
  }
  function arreter() {
    if (!enCours) return; const c = enCours; enCours = null; c.stop = true;
    try { if (c.el && c.pos) envoyer(c.el, 'pointercancel', c.pos[0], c.pos[1]); } catch (e) { /* */ }
    if (c.doigt) c.doigt.remove(); if (c.badge) c.badge.remove();
    D.removeEventListener('pointerdown', c.couper, true);
  }
  /** le doigt fantôme : un rond lumineux qui suit le pointeur synthétique */
  function preparer(nom) {
    arreter();
    const doigt = D.createElement('div'); doigt.className = 'px-demo-doigt'; doigt.hidden = true; D.body.appendChild(doigt);
    const badge = D.createElement('div'); badge.className = 'px-demo-badge'; badge.innerHTML = '<b>▶ démo</b> · ' + (SCENES[nom] ? SCENES[nom].titre : nom) + ' <small>touche pour arrêter</small>'; D.body.appendChild(badge);
    const c = { stop: false, doigt, badge, el: null, pos: null, couper: null };
    // un vrai doigt (isTrusted) arrête tout ; les événements du fantôme, eux, ne sont pas « de confiance »
    c.couper = (e) => { if (e.isTrusted) arreter(); };
    D.addEventListener('pointerdown', c.couper, true);
    enCours = c; return c;
  }
  const poser = (c, x, y) => { c.pos = [x, y]; c.doigt.hidden = false; c.doigt.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,-50%)'; };
  async function bas(c, el, x, y) { if (c.stop) return; c.el = el; poser(c, x, y); c.doigt.classList.add('on'); envoyer(el, 'pointerdown', x, y); }
  async function aller(c, x, y, ms, { el = null } = {}) {
    if (c.stop) return; const [x0, y0] = c.pos, n = Math.max(2, Math.round(ms / 16));
    for (let i = 1; i <= n; i++) { if (c.stop) return; const k = ease(i / n), x1 = x0 + (x - x0) * k, y1 = y0 + (y - y0) * k; poser(c, x1, y1); envoyer(el || c.el, 'pointermove', x1, y1); await dormir(ms / n); }
  }
  async function haut(c, { el = null } = {}) { if (c.stop) return; envoyer(el || c.el, 'pointerup', c.pos[0], c.pos[1]); c.doigt.classList.remove('on'); c.el = null; }
  const pause = async (c, ms) => { if (!c.stop) await dormir(ms); };
  const bord = (cote) => portee().querySelector('.px-bord-' + cote);
  const centreBord = (b) => { const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  const calque = () => portee().querySelector('.px-fx-calque');
  const fond = () => portee().querySelector('.px-fx-fond');
  const w = () => W.innerWidth || 390, h = () => W.innerHeight || 844;
  /** il faut au moins une autre app que l'accueil pour la plupart des démos */
  function assez() { const r = routeur(); const n = r ? r.vivants().length + r.endormis().length : 0; if (n < 1) { signaler('ouvre au moins un ploxion pour voir ça'); return false; } return true; }

  const SCRIPTS = {
    async glisser(c) { const b = bord('d'), [x, y] = centreBord(b); await bas(c, b, x, y); await aller(c, x - 140, y, 140); await haut(c); await pause(c, 700); },
    async apercu(c) {
      const b = bord('d'), [x, y] = centreBord(b);
      await bas(c, b, x, y); await pause(c, 520); await aller(c, x - w() * 0.18, y, 420); await pause(c, 260); await aller(c, x - w() * 0.42, y, 380); await pause(c, 140); await haut(c); await pause(c, 600);
    },
    async fractale(c) {
      const b = bord('d'), [x, y] = centreBord(b);
      await bas(c, b, x, y); await pause(c, 1050); await aller(c, x - 70, y, 420); await aller(c, x, y, 380); await haut(c); await pause(c, 900);
      // à côté : on revient
      const f = fond(); if (f) { poser(c, w() / 2, 40); envoyer(f, 'pointerup', w() / 2, 40); } await pause(c, 500);
    },
    async lancer(c) {
      const b = bord('d'), [x, y] = centreBord(b);
      await bas(c, b, x, y); await pause(c, 1050); await haut(c); await pause(c, 500);
      const k = calque(); if (!k) return;
      const y2 = h() * 0.55;
      await bas(c, k, w() * 0.8, y2); await aller(c, w() * 0.2, y2, 110); await haut(c); await pause(c, 1100);
      await bas(c, k, w() * 0.25, y2); await aller(c, w() * 0.85, y2, 120); await haut(c); await pause(c, 1100);
      const f = fond(); if (f) envoyer(f, 'pointerup', w() / 2, 40); await pause(c, 500);
    },
    async slider(c) { const b = bord('d'), [x, y] = centreBord(b); await bas(c, b, x, y); await pause(c, 2600); await aller(c, w() * 0.2, y, 600); await pause(c, 700); await aller(c, w() * 0.5, y, 300); await pause(c, 300); await haut(c); await pause(c, 600); },
    async cube(c) {
      const b = bord('d'), [x, y] = centreBord(b);
      await bas(c, b, x, y); await pause(c, 2000); await aller(c, w() / 2, y, 280); await pause(c, 1500);
      await aller(c, w() * 0.2, y, 600); await aller(c, w() / 2, y, 500);   // tourner le cube
      await aller(c, w() / 2, y - 190, 600); await pause(c, 1300);   // pencher : ses bions
      await aller(c, w() / 2, y, 400); await haut(c); await pause(c, 600);
      const f = fond(); if (f) envoyer(f, 'pointerup', w() / 2, 40); await pause(c, 500);
    },
    async carte(c) { const r = routeur(); if (r && r.carte) r.carte(); await pause(c, 400); },
    async freefall(c) { const r = routeur(); if (r && r.freefall) { const deja = r.freefall(); if (!deja) r.freefall(true); } signaler('freefall : penche l\'iPhone ; reste droit pour ouvrir ; le badge l\'arrête'); await pause(c, 200); },
  };
  const SANS_APPS = new Set(['carte', 'freefall']);
  return {
    SCENES,
    enCours: () => !!enCours,
    arreter,
    async jouer(nom) {
      const s = SCRIPTS[nom]; if (!s) return false;
      if (!SANS_APPS.has(nom) && !assez()) return false;
      const c = preparer(nom);
      try { await s(c); } catch (e) { /* une démo n'abîme rien */ } finally { if (enCours === c) arreter(); }
      return true;
    },
  };
}
