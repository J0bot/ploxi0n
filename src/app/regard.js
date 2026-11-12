// 👁 PILOTER DE LA TÊTE OU DU REGARD (0.99.46, RS-7 : « intégrer » le Suivi du regard et de la tête d'iOS → aussi le nôtre). ⚙ › Piloter de la
// tête : non | tête (la tête pointe : fixer ou cligner longtemps = toucher) | regard (le regard calibré pointe ; la tête : un coup à gauche ou à
// droite = le ploxion d'à côté, secouer = minimiser, hocher = oui pour les ploxions). Le bion : src/bions/tete.js ; le natif : PloxiRegard.
// Les ploxions : window.jOSRegard.sur('fixer' | 'cligner' | 'oui' | 'non' | 'gauche' | 'droite', f) → désabonner ; etat() ; recentrer().
// Rien ne quitte le téléphone : ARKit donne des angles et des nombres, aucune image n'est gardée ni envoyée.
import { creerTete, ajusterAffine } from '../bions/tete.js';

const CIBLES = 'button,a[href],[role=button],input:not([type=hidden]),select,textarea,label,summary,[data-neurone],[tabindex]:not([tabindex="-1"])';

export function creerRegard({ W = globalThis.window, natif = null, boxion, vibrer = () => {}, routeur = null, signaler = () => {}, inverse = () => false }) {
  const D = W.document;
  let dernierTouche = null, mode = 'non', T = null, off = null, offEtat = null, calque = null, rafPrevu = false, calib = null, collecte = null;
  const abonnes = new Map();
  const pret = boxion.get('reglages', 'regard-calibrage').then(v => { if (v && v.ax && v.ay) calib = v; }).catch(() => {});

  function dessiner() {
    rafPrevu = false; if (!calque || !T) return;
    const p = T.pointeur(); calque.hidden = !p; if (!p) return;
    calque.style.transform = 'translate(' + Math.round(p.x * W.innerWidth) + 'px,' + Math.round(p.y * W.innerHeight) + 'px)';
    calque.style.setProperty('--px-regard-progres', String(T.progres()));
  }
  function toucherEn(x, y) {
    // toute la pile sous le point (les bords de l'écran, des calques transparents, couvrent parfois un bouton) : la première vraie cible
    const X = x * W.innerWidth, Y = y * W.innerHeight, pile = D.elementsFromPoint ? D.elementsFromPoint(X, Y) : [D.elementFromPoint(X, Y)];
    let c = null; for (const el of pile) { c = el && el.closest && el.closest(CIBLES); if (c) break; }
    dernierTouche = c ? (c.getAttribute('aria-label') || c.textContent || c.tagName).trim().slice(0, 40) : null;
    if (!c) return null;
    try { if (c.focus) c.focus({ preventScroll: true }); } catch (e) { /* */ }
    c.click(); vibrer('selection');
    if (calque) { calque.classList.add('px-regard-toc'); W.setTimeout(() => calque && calque.classList.remove('px-regard-toc'), 250); }
    return c;
  }
  function geste(g) {
    if (collecte) return;   // pendant le calibrage, rien ne se touche
    if (g.geste === 'fixer' || g.geste === 'cligner') { if (g.x != null) toucherEn(g.x, g.y); }
    else if (routeur && (g.geste === 'gauche' || g.geste === 'droite')) routeur.faire(g.geste === 'gauche' ? 'precedente' : 'suivante');
    else if (routeur && g.geste === 'non') routeur.faire('minimiser');
    for (const f of abonnes.get(g.geste) || []) { try { f({ ...g }); } catch (e) { /* un ploxion qui plante ne casse rien */ } }
    try { W.dispatchEvent(new W.CustomEvent('jos-regard', { detail: { ...g } })); } catch (e) { /* */ }
  }
  function mesure(m) {
    if (!T) return;
    if (collecte && m.x != null && m.y != null) collecte.push({ t: m.t, x: m.x, y: m.y });
    for (const g of T.pousser(m)) geste(g);
    if (!rafPrevu) { rafPrevu = true; (W.requestAnimationFrame || ((f) => W.setTimeout(f, 16)))(dessiner); }
  }
  async function demarrer(m) {
    await pret;
    if (!natif) throw new Error('le pilotage de la tête : sur l\'iPhone seulement');
    if (!(await natif.dispo())) throw new Error('il faut la caméra TrueDepth (celle de Face ID)');
    arreterSeul();
    mode = m; T = creerTete({ mode: m, inverser: { lacet: !!inverse() } }); if (m === 'regard' && calib) T.calibration(calib);   // inverse : le point part du mauvais côté (⚙)
    calque = D.createElement('div'); calque.className = 'px-regard'; calque.setAttribute('aria-hidden', 'true'); calque.hidden = true;
    calque.innerHTML = '<svg viewBox="-20 -20 40 40"><circle class="px-regard-anneau" r="16" pathLength="1"/><circle class="px-regard-point" r="4"/></svg>';
    D.body.appendChild(calque);
    off = natif.sur('visage', mesure);
    offEtat = natif.sur('etat', (e) => { if (e && e.erreur) signaler('👁 ' + e.erreur); });
    await natif.demarrer();
    if (m === 'regard' && !calib) signaler('👁 regarde les points pour calibrer le regard'), calibrer().catch(() => {});
  }
  function arreterSeul() {
    if (off) { off(); off = null; } if (offEtat) { offEtat(); offEtat = null; }
    if (calque) { calque.remove(); calque = null; } T = null; mode = 'non';
  }
  async function arreter() { const etait = !!T; arreterSeul(); if (etait && natif) await natif.arreter().catch(() => {}); }
  /** le calibrage du regard : 4 points, 1,4 s chacun (la moyenne des 0,7 dernières secondes) → l'affine gardée */
  async function calibrer({ duree = 1400 } = {}) {
    if (!T || mode !== 'regard') throw new Error('le calibrage : en mode regard');
    const points = [{ x: 0.5, y: 0.5 }, { x: 0.15, y: 0.15 }, { x: 0.85, y: 0.15 }, { x: 0.5, y: 0.85 }], paires = [];
    const cible = D.createElement('div'); cible.className = 'px-regard-cible'; cible.setAttribute('aria-hidden', 'true'); D.body.appendChild(cible);
    try {
      for (const p of points) {
        cible.style.left = (p.x * 100) + '%'; cible.style.top = (p.y * 100) + '%';
        collecte = []; await new Promise(r => W.setTimeout(r, duree));
        const fin = collecte.length ? collecte[collecte.length - 1].t : 0, l = collecte.filter(q => fin - q.t <= duree / 2);
        if (l.length) paires.push({ brut: { x: l.reduce((a, q) => a + q.x, 0) / l.length, y: l.reduce((a, q) => a + q.y, 0) / l.length }, vise: p });
      }
    } finally { collecte = null; cible.remove(); }
    const A = ajusterAffine(paires); if (!A) throw new Error('le calibrage n\'a pas pris (le visage bien en face ?)');
    calib = A; if (T) T.calibration(A); await boxion.put('reglages', 'regard-calibrage', A).catch(() => {});
    signaler('👁 le regard est calibré'); return A;
  }
  return {
    demarrer, arreter, calibrer, mode: () => mode, dispo: !!natif,   // (0.99.49) Android, le navigateur : pas de PloxiRegard, pas de réglage
    regler: (m) => (m === 'tete' || m === 'regard' ? demarrer(m) : arreter()),
    recentrer: () => { if (T) T.recentrer(); },
    api: {
      sur: (g, f) => { if (!abonnes.has(g)) abonnes.set(g, new Set()); abonnes.get(g).add(f); return () => abonnes.get(g).delete(f); },
      etat: () => ({ mode, pointeur: T ? T.pointeur() : null, calibre: !!calib, touche: dernierTouche }),
      recentrer: () => { if (T) T.recentrer(); },
    },
  };
}
