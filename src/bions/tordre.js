// @bion tordre — tourner un knob avec les doigts, comme un vrai bouton : un doigt tourne AUTOUR du knob, deux doigts le TORDENT, un doigt
// posé au centre glisse de haut en bas ; appuyé, il grossit ; deux touchers rapides le remettent à sa valeur de départ ; chaque cran vibre
// | api: deltaAngle, valeurApres, tordre, brancherPanneau
// (0.99.5, RS-7 24.10 : « il faut pouvoir appuyer sur les knobs et les twister avec les doigts »). Compose jOSKnob (le bion du labo, embarqué :
// public/bions/jOSKnob.js) sans le réécrire : ses knobs gardent leur dessin, leur molette, leur clavier ; tordre prend le toucher avant lui.

export const ARC = Math.PI * 1.5;   // l'arc d'un jOSKnob : 270° = toute la plage
const DEUX_PI = Math.PI * 2;

/** la plus courte différence d'angle de a vers b (radians, entre -π et π) */
export function deltaAngle(a, b) { let d = (b - a) % DEUX_PI; if (d > Math.PI) d -= DEUX_PI; if (d < -Math.PI) d += DEUX_PI; return d; }

/** la valeur après un tour de dθ radians (un tour de 270° parcourt toute la plage), bornée, au pas */
export function valeurApres(v, dTheta, { min = 0, max = 1, pas = 0 } = {}) {
  let x = v + dTheta / ARC * (max - min);
  x = Math.max(min, Math.min(max, x));
  if (pas > 0) x = Math.round((x - min) / pas) * pas + min;
  return Math.round(x * 1e6) / 1e6;
}

/**
 * el : l'élément du knob (.jkn) ; o = { get, set(v), min, max, pas, defaut, vibrer, W }
 * rend detacher()
 */
export function tordre(el, { get, set, min = 0, max = 1, pas = 0, defaut = null, vibrer = () => {}, W = globalThis.window } = {}) {
  const doigts = new Map(); let brut = 0, dernierCran = null, dernierVib = 0, toucher = null, dernierTap = 0;
  const centre = () => { const k = el.querySelector('[data-k]') || el, r = k.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  const appliquer = (v) => {
    const x = valeurApres(v, 0, { min, max, pas });
    if (x !== get()) { set(x); const cran = pas > 0 ? Math.round((x - min) / pas) : Math.round(x * 100);
      const t = Date.now(); if (cran !== dernierCran && t - dernierVib > 28) { dernierVib = t; vibrer('fx-cran'); } dernierCran = cran; }
  };
  function bas(e) {
    e.stopPropagation(); e.preventDefault();   // avant jOSKnob (son glisser vertical) et avant le clic droit du routeur
    try { el.setPointerCapture(e.pointerId); } catch (x) { /* */ }
    doigts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (doigts.size === 1) { brut = get(); toucher = { t: Date.now(), x: e.clientX, y: e.clientY, bouge: false }; }
    else { brut = get(); toucher = null; }
    el.classList.add('px-tord'); el.classList.toggle('px-tord-deux', doigts.size >= 2);
  }
  function bouge(e) {
    const d = doigts.get(e.pointerId); if (!d) return; e.stopPropagation(); e.preventDefault();
    const avant = { x: d.x, y: d.y }; d.x = e.clientX; d.y = e.clientY;
    if (toucher && Math.hypot(e.clientX - toucher.x, e.clientY - toucher.y) > 6) toucher.bouge = true;
    if (doigts.size >= 2) {   // deux doigts : l'angle entre eux tourne → le knob tourne d'autant
      const [a, b] = [...doigts.entries()], autre = a[0] === e.pointerId ? b[1] : a[1];
      const th0 = Math.atan2(avant.y - autre.y, avant.x - autre.x), th1 = Math.atan2(d.y - autre.y, d.x - autre.x);
      brut = Math.max(min, Math.min(max, brut + deltaAngle(th0, th1) / ARC * (max - min) * (a[0] === e.pointerId ? 1 : 1)));
    } else {
      const c = centre(), r0 = Math.hypot(avant.x - c.x, avant.y - c.y), r1 = Math.hypot(d.x - c.x, d.y - c.y);
      if (r0 > 16 && r1 > 16) brut = Math.max(min, Math.min(max, brut + deltaAngle(Math.atan2(avant.y - c.y, avant.x - c.x), Math.atan2(d.y - c.y, d.x - c.x)) / ARC * (max - min)));   // autour : comme un vrai bouton
      else brut = Math.max(min, Math.min(max, brut + (avant.y - d.y) / 140 * (max - min)));   // au centre : glisser de haut en bas
    }
    appliquer(brut);
  }
  function haut(e) {
    if (!doigts.has(e.pointerId)) return;   // pas de stopPropagation : « au lâcher » reste visible des autres (l'atelier refait sa grille)
    doigts.delete(e.pointerId);
    if (!doigts.size) {
      el.classList.remove('px-tord', 'px-tord-deux');
      if (toucher && !toucher.bouge && Date.now() - toucher.t < 260) {   // un toucher sans tourner : deux de suite = la valeur de départ
        if (Date.now() - dernierTap < 320 && defaut != null) { appliquer(defaut); vibrer('selection'); dernierTap = 0; } else dernierTap = Date.now();
      }
      toucher = null;
    } else { brut = get(); el.classList.toggle('px-tord-deux', doigts.size >= 2); }
  }
  el.addEventListener('pointerdown', bas, true); el.addEventListener('pointermove', bouge, true);
  el.addEventListener('pointerup', haut, true); el.addEventListener('pointercancel', haut, true);
  el.style.touchAction = 'none';
  return () => { el.removeEventListener('pointerdown', bas, true); el.removeEventListener('pointermove', bouge, true); el.removeEventListener('pointerup', haut, true); el.removeEventListener('pointercancel', haut, true); };
}

/** tordre chaque knob d'un panneau jOSKnob : spec = [{ key, min, max, step, value }], onChange(vals, cle) comme jOSKnob */
export function brancherPanneau(panneau, spec, onChange, { vibrer = () => {}, W = globalThis.window } = {}) {
  const detacher = [];
  for (const s of spec) {
    const k = panneau.knobs[s.key]; if (!k || !k.el) continue;
    detacher.push(tordre(k.el, { W, vibrer, min: s.min, max: s.max, pas: s.step || 0, defaut: s.defaut != null ? s.defaut : s.value,
      get: () => (panneau.values[s.key] != null ? panneau.values[s.key] : k.get()),
      set: (v) => { panneau.set(s.key, v); if (onChange) onChange(panneau.values, s.key); } }));
  }
  return () => detacher.forEach(f => f());
}
