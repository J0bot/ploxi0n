// ○ □ LE WORMION ET LE PORTION, DES TRACKPADS (0.92). RS-7 (22.10) : « le but c'est que le wormion et le portion soient comme des trackpads ».
// Les deux cases du bas des koins (docs/KOINS.md) ne sont plus des boutons mais des SURFACES qu'on sent sous le pouce (le moteur du banc
// trackpad, src/banc/trackpad.js : un cran tous les N px, un choc au bord) :
//   ○ WORMION (le temps)   tourner le doigt autour du centre fait défiler ce que tu avais ouvert, un cran tous les 30° (sens horaire :
//                          plus loin dans le passé ; l'autre sens revient) ; lâcher l'ouvre. Un toucher sans tourner : ⧉ (le temps, comme avant).
//   □ PORTION (la fractale) glisser dans une direction : ← l'app d'avant, → l'app d'après, ↑ dézoomer (la map), ↓ l'accueil ; la surface
//                          a son grain (un cran tous les 14 px) et dit ce qui va se passer ; lâcher le fait. Un toucher : la map.
import { creerTexture } from '../banc/trackpad.js';

export const CRAN_ANGLE = Math.PI / 6;   // 30°
export const DIRECTIONS_PORTION = { gauche: ['←', 'l\'app d\'avant'], droite: ['→', 'l\'app d\'après'], haut: ['↑', 'dézoomer : la map'], bas: ['↓', 'l\'accueil'] };
/** l'écart d'angle, ramené dans ]-π, π] */
export const ecartAngle = (a0, a1) => { let d = a1 - a0; while (d > Math.PI) d -= 2 * Math.PI; while (d <= -Math.PI) d += 2 * Math.PI; return d; };
/** la direction d'un glisser (null en deçà du seuil) */
export const directionDe = (dx, dy, seuil = 24) => (Math.hypot(dx, dy) < seuil ? null : Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'gauche' : 'droite') : (dy < 0 ? 'haut' : 'bas'));

/** ○ le wormion : el (la case), liste() → [{ id, nom }] (le plus récent d'abord), choisir(id), toucher() */
export function creerPadWormion({ W = globalThis.window, el, liste = () => [], choisir = () => {}, toucher = () => {}, vibrer = () => {} }) {
  const lbl = el.querySelector('[data-pad-l]'), sous = el.querySelector('[data-pad-s]'), aiguille = el.querySelector('[data-pad-a]');
  let geste = null;
  const centre = () => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  const peindre = (i, l) => {
    if (lbl) lbl.textContent = i < 0 || !l[i] ? 'le temps' : l[i].nom;
    if (sous) sous.textContent = i < 0 ? 'tourne : ce que tu avais ouvert' : (i + 1) + ' / ' + l.length + ' · lâche pour l\'ouvrir';
    el.classList.toggle('px-pad-actif', i >= 0);
  };
  el.addEventListener('pointerdown', (e) => {
    e.stopPropagation(); try { el.setPointerCapture(e.pointerId); } catch (er) { /* */ }
    const [cx, cy] = centre(); geste = { cx, cy, a: Math.atan2(e.clientY - cy, e.clientX - cx), cumul: 0, i: -1, l: liste(), bouge: false };
  });
  el.addEventListener('pointermove', (e) => {
    if (!geste) return;
    const a = Math.atan2(e.clientY - geste.cy, e.clientX - geste.cx);
    geste.cumul += ecartAngle(geste.a, a); geste.a = a;
    if (aiguille) aiguille.style.transform = 'rotate(' + Math.round(a * 180 / Math.PI + 90) + 'deg)';
    const n = geste.l.length; if (!n) return;
    const i = Math.max(-1, Math.min(n - 1, Math.floor(geste.cumul / CRAN_ANGLE) - 1));   // horaire : plus loin dans le passé ; l'autre sens revient
    if (Math.abs(geste.cumul) > CRAN_ANGLE * 0.5) geste.bouge = true;
    if (i !== geste.i) { vibrer(i === n - 1 || i === -1 ? 'fx-butee' : 'fx-cran'); geste.i = i; peindre(i, geste.l); }
  });
  const fin = (e) => {
    if (!geste) return; const g = geste; geste = null; e.stopPropagation();
    if (aiguille) aiguille.style.transform = '';
    peindre(-1, []);
    if (g.i >= 0 && g.l[g.i]) { vibrer('selection'); choisir(g.l[g.i].id); }
    else if (!g.bouge) toucher();
  };
  el.addEventListener('pointerup', fin); el.addEventListener('pointercancel', (e) => { geste = null; peindre(-1, []); e.stopPropagation(); });
  el.addEventListener('click', (e) => e.stopPropagation());
  peindre(-1, []);
  return { etat: () => (geste ? { i: geste.i, cumul: geste.cumul } : null) };
}

/** □ le portion : el (la case), faire(direction), toucher() ; le grain du banc trackpad */
export function creerPadPortion({ W = globalThis.window, el, faire = () => {}, toucher = () => {}, vibrer = () => {}, pas = 14 }) {
  const lbl = el.querySelector('[data-pad-l]'), sous = el.querySelector('[data-pad-s]'), point = el.querySelector('[data-pad-p]');
  let geste = null;
  const peindre = (d) => {
    if (lbl) lbl.textContent = d ? DIRECTIONS_PORTION[d][0] + ' ' + DIRECTIONS_PORTION[d][1] : 'la fractale';
    if (sous) sous.textContent = d ? 'lâche' : 'glisse : ← → les apps · ↑ la map · ↓ l\'accueil';
    el.setAttribute('data-dir', d || '');
  };
  el.addEventListener('pointerdown', (e) => {
    e.stopPropagation(); try { el.setPointerCapture(e.pointerId); } catch (er) { /* */ }
    const r = el.getBoundingClientRect();
    geste = { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, d: null, tex: creerTexture({ largeur: r.width || 160, hauteur: r.height || 160 }), r };
    geste.tex.placer(e.clientX - r.left, e.clientY - r.top);
  });
  el.addEventListener('pointermove', (e) => {
    if (!geste) return;
    for (const s of geste.tex.bouger(e.clientX - geste.x, e.clientY - geste.y, { texture: 'grille', pas, cran: 'selection' }).slice(0, 2)) vibrer(s === 'fort' ? 'fx-butee' : 'fx-cran');
    geste.x = e.clientX; geste.y = e.clientY;
    if (point) point.style.transform = 'translate(' + Math.round(geste.tex.x - (geste.r.width || 160) / 2) + 'px,' + Math.round(geste.tex.y - (geste.r.height || 160) / 2) + 'px)';
    const d = directionDe(e.clientX - geste.x0, e.clientY - geste.y0);
    if (d !== geste.d) { geste.d = d; peindre(d); if (d) vibrer('selection'); }
  });
  const fin = (e) => {
    if (!geste) return; const g = geste; geste = null; e.stopPropagation();
    if (point) point.style.transform = '';
    peindre(null);
    if (g.d) faire(g.d); else if (Math.hypot(g.x - g.x0, g.y - g.y0) < 10) toucher();
  };
  el.addEventListener('pointerup', fin); el.addEventListener('pointercancel', (e) => { geste = null; peindre(null); e.stopPropagation(); });
  el.addEventListener('click', (e) => e.stopPropagation());
  peindre(null);
  return { etat: () => (geste ? { d: geste.d } : null) };
}
