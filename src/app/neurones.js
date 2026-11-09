// @bion neurones — la couche vivante : les groupes data-neurones / data-neurone dessinés en cellules collées (compose synapses + membrane) | api: creerNeurones, installer, tout
// 〰 LES BORDS ORGANIQUES ET LES NEURONES (0.93). RS-7 (22.10) : « je veux que les bords soient plus épais, et plus organiques, genre ondulé,
// mais que les éléments du UI se collent entre eux comme des neurones ».
// Un groupe se déclare : data-neurones sur le conteneur, data-neurone sur ses cellules (à n'importe quelle profondeur ; un groupe peut en
// contenir un autre : la map, ses hubs, et dans chaque hub ses koins). Derrière les cellules, UNE couche SVG dessine leurs corps :
//   - deux calques : la membrane (la couleur du bord) et le dedans (le fond, rétréci de l'épaisseur du bord : un bord épais, 3 px) ;
//   - une SYNAPSE (un pont étroit) entre deux cellules voisines proches (côte à côte, l'écart sous le seuil) ;
//   - le filtre « goo » : un flou, une turbulence fixe qui fait onduler, puis un seuil sur l'alpha. Les jonctions s'arrondissent comme deux
//     cellules qui se touchent ; les bords ondulent. La graine est fixe : RIEN ne bouge (le Pi 4, la batterie ; aucune animation continue).
// Les cellules deviennent transparentes (leur grain reste) : le texte reste net, posé sur son corps. Couleurs : --n-fond et --n-bord sur la
// cellule (le CSS les donne ; un pad actif passe au lilas). On ne redessine que si la géométrie ou les couleurs changent (le système se
// repeint chaque seconde : rien ne bouge, rien n'est refait). html.px-organique (⚙ › Apparence › Bords organiques) ; sinon rien n'est dessiné.
//   data-neurones="fin"          un flou court, pour les grilles serrées (la map : 5 px entre les koins)
//   data-neurones-seuil="60"     l'écart maximal d'une synapse (26 px par défaut)
//   data-neurones-cellules="button" (0.95) les cellules par un sélecteur (sans marquer chaque élément) : elles reçoivent la classe px-neurone
import { synapses, koinsDe, SEUIL } from '../bions/synapses.js';
import { VARIANTES, filtres, idFiltre, variante } from '../bions/membrane.js';
import { faisceau, vertebres, cils, ventouses, epines, coulures, ogives, rayures, formeSvg } from '../bions/excroissances.js';
export { VARIANTES };
export { synapses, koinsDe, SEUIL };
const NS = 'http://www.w3.org/2000/svg';

export function creerNeurones({ W = globalThis.window } = {}) {
  const D = W.document, groupes = new Map();   // conteneur → { svg, cle, mo, ro }
  let prevu = false, scanPrevu = false;
  const actif = () => D.documentElement.classList.contains('px-organique');
  // (0.99.19) la peau légère : pas de couche SVG, sauf les tuiles de l'atelier (elles montrent les membranes : c'est leur rôle)
  const actifPour = (c) => actif() && (!D.documentElement.classList.contains('px-leger') || c.hasAttribute('data-neurones-variante'));
  const nombre = (x, d) => { const n = parseFloat(x); return isFinite(n) ? n : d; };
  const r1 = (x) => Math.round(x * 2) / 2;

  function dessiner(c, g) {
    const fin = c.getAttribute('data-neurones') === 'fin', seuil = nombre(c.getAttribute('data-neurones-seuil'), SEUIL);
    const cr = c.getBoundingClientRect(), s = cr.width && c.offsetWidth ? cr.width / c.offsetWidth : 1;
    const cs = [];
    const sel = c.getAttribute('data-neurones-cellules');
    for (const el of c.querySelectorAll(sel ? ':scope ' + sel : '[data-neurone]')) {
      if (!el.parentElement || el.parentElement.closest('[data-neurones]') !== c) continue;   // la cellule d'un groupe imbriqué
      if (sel && !el.classList.contains('px-neurone')) el.classList.add('px-neurone');
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;   // caché
      const st = W.getComputedStyle(el);
      cs.push({ x: r1((r.left - cr.left) / s + c.scrollLeft - c.clientLeft), y: r1((r.top - cr.top) / s + c.scrollTop - c.clientTop), w: r1(r.width / s), h: r1(r.height / s),
        rx: Math.min(nombre(st.borderTopLeftRadius, 12), Math.min(r.width, r.height) / s / 2), fond: st.getPropertyValue('--n-fond').trim() || '#0f0b18', bord: st.getPropertyValue('--n-bord').trim() || '#3a3050' });
    }
    const vg = c.getAttribute('data-neurones-variante'), v = vg && VARIANTES[vg] ? vg : variante(D), pv = VARIANTES[v];   // (0.96) une tuile de l'atelier : sa propre peau
    const cle = JSON.stringify([v, pv, fin, seuil, cs]);
    if (cle === g.cle) return; g.cle = cle;
    if (!cs.length) { if (g.svg) g.svg.innerHTML = ''; return; }
    if (!g.svg || !g.svg.isConnected) { g.svg = D.createElementNS(NS, 'svg'); g.svg.setAttribute('class', 'px-neurones'); g.svg.setAttribute('aria-hidden', 'true'); c.insertBefore(g.svg, c.firstChild); }
    const M = 30, x0 = Math.min(...cs.map(q => q.x)) - M, y0 = Math.min(...cs.map(q => q.y)) - M;
    const L = Math.max(...cs.map(q => q.x + q.w)) + M - x0, H = Math.max(...cs.map(q => q.y + q.h)) + M - y0;
    filtres(D, v);
    const geo = pv.geo || {};
    // (0.95, le deuxième lot) ce qui pousse : les ponts en faisceaux ; sur les ponts, des vertèbres ; sur les cellules, cils, ventouses, épines
    const ponts = synapses(cs, { seuil, autres: fin ? 0.2 : 0.5 }).flatMap(p => faisceau(p, geo.faisceau || 1));
    const pousses = [
      ...(geo.vertebres ? ponts.flatMap(p => vertebres(p, geo.vertebres)) : []),
      ...(geo.rayures ? ponts.flatMap(p => rayures(p, geo.rayures)) : []),
      // ce qui pousse sur les cellules : seulement les assez grandes (une épine sur un bouton de 40 px, c'est du bruit)
      ...(fin ? [] : cs.filter(q => Math.min(q.w, q.h) >= 56).flatMap(q => [...(geo.cils ? cils(q, geo.cils) : []).map(f => [f, q]), ...(geo.ventouses ? ventouses(q, geo.ventouses) : []).map(f => [f, q]), ...(geo.epines ? epines(q, geo.epines) : []).map(f => [f, q]), ...(geo.coulures ? coulures(q, geo.coulures) : []).map(f => [f, q]), ...(geo.ogives ? ogives(q, geo.ogives) : []).map(f => [f, q])])),
    ];
    // (0.95) le terminal : les coins coupés en biais (un octogone), comme le verre du hand terminal et les vieux koins de RS-7
    const cellule = (q, f) => {
      if (!pv.chanfrein) return '<rect x="' + (q.x - x0) + '" y="' + (q.y - y0) + '" width="' + q.w + '" height="' + q.h + '" rx="' + r1(q.rx) + '" fill="' + f + '"/>';
      const x = q.x - x0, y = q.y - y0, k = r1(Math.min(18, q.w / 5, q.h / 5));
      return '<polygon points="' + [[x + k, y], [x + q.w - k, y], [x + q.w, y + k], [x + q.w, y + q.h - k], [x + q.w - k, y + q.h], [x + k, y + q.h], [x, y + q.h - k], [x, y + k]].map(p => p.join(',')).join(' ') + '" fill="' + f + '"/>';
    };
    const corps = (cle2) => cs.map(q => cellule(q, q[cle2])).join('')
      + ponts.map(p => '<rect x="' + r1(p.x - x0) + '" y="' + r1(p.y - y0) + '" width="' + r1(p.w) + '" height="' + r1(p.h) + '" rx="' + r1(Math.min(p.w, p.h) / 2) + '" fill="' + cs[p.de][cle2] + '"/>').join('');
    g.svg.setAttribute('width', L); g.svg.setAttribute('height', H); g.svg.setAttribute('viewBox', '0 0 ' + L + ' ' + H);
    g.svg.style.left = x0 + 'px'; g.svg.style.top = y0 + 'px';
    const gouttes = fin || !pv.gouttes ? '' : cs.map(q => koinsDe(q).map(k => '<circle cx="' + r1(k.cx - x0) + '" cy="' + r1(k.cy - y0) + '" r="' + r1(k.r) + '" fill="' + q.bord + '"/>').join('')).join('');
    const excr = pousses.map(x => (Array.isArray(x) ? formeSvg(x[0], x0, y0, x[1].bord) : formeSvg(x, x0, y0, cs[0].bord))).join('');
    g.svg.innerHTML = '<g filter="url(#' + idFiltre(v, 'mb', fin) + ')">' + corps('bord') + gouttes + excr + '</g><g class="px-neurones-dd" filter="url(#' + idFiltre(v, 'dd', fin) + ')">' + corps('fond') + '</g>';
    if (g.ro) { g.ro.disconnect(); g.ro.observe(c); for (const el of c.querySelectorAll('[data-neurone],.px-neurone')) g.ro.observe(el); }
  }
  function tout() {
    prevu = false;
    for (const [c, g] of groupes) {
      if (!c.isConnected || !actifPour(c)) { if (g.svg) g.svg.remove(); if (g.mo) g.mo.disconnect(); if (g.ro) g.ro.disconnect(); groupes.delete(c); continue; }
      try { dessiner(c, g); } catch (e) { /* une cellule partie entre-temps */ }
    }
  }
  const prevoir = () => { if (prevu) return; prevu = true; (W.requestAnimationFrame || ((f) => W.setTimeout(f, 16)))(tout); };
  function scanner() {
    scanPrevu = false;
    if (!actif()) { if (groupes.size) prevoir(); return; }
    for (const c of D.querySelectorAll('[data-neurones]')) {
      if (groupes.has(c) || !actifPour(c)) continue;
      const g = { svg: null, cle: null, mo: null, ro: null };
      if (W.MutationObserver) { g.mo = new W.MutationObserver(prevoir); g.mo.observe(c, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'data-dir'] }); }
      if (W.ResizeObserver) g.ro = new W.ResizeObserver(prevoir);
      groupes.set(c, g);
    }
    prevoir();
  }
  const scan = () => { if (scanPrevu) return; scanPrevu = true; (W.requestAnimationFrame || ((f) => W.setTimeout(f, 16)))(scanner); };
  function installer() {
    if (W.MutationObserver) {
      new W.MutationObserver(scan).observe(D.body, { childList: true, subtree: true });
      // seulement ce qui change les couleurs (le mode, le contraste) ou allume / éteint : <html> change souvent de classe pendant les gestes
      const theme = () => [...D.documentElement.classList].filter(k => /^px-(organique|leger|m-|contraste|sans-grain)/.test(k)).sort().join(' ') + '|' + variante(D);
      let avant = theme();
      D.addEventListener('px-peau', () => { for (const g of groupes.values()) g.cle = null; scan(); });   // (0.99.19) une peau redéfinie : ses filtres ont un id neuf
      new W.MutationObserver(() => { const t = theme(); if (t === avant) return; avant = t; for (const g of groupes.values()) g.cle = null; scan(); }).observe(D.documentElement, { attributes: true, attributeFilter: ['class', 'data-px-variante'] });
    }
    W.addEventListener('resize', () => { for (const g of groupes.values()) g.cle = null; prevoir(); });
    // (0.99.19, RS-7 « What ? » : des membranes restées à l'ancienne place) une mise en page qui bouge SANS changer le DOM ni la taille des
    // cellules (une transition, une animation, une police chargée, le retour dans l'app) : on remesure ; dessiner() ne refait rien si rien n'a bougé
    for (const t of ['transitionend', 'animationend']) D.addEventListener(t, (e) => { if (groupes.size && e.target && e.target.nodeType === 1 && !e.target.closest('.px-neurones')) prevoir(); }, true);
    D.addEventListener('visibilitychange', () => { if (!D.hidden && groupes.size) prevoir(); });
    if (D.fonts && D.fonts.addEventListener) D.fonts.addEventListener('loadingdone', () => { if (groupes.size) prevoir(); });
    scan();
  }
  return { installer, scanner, tout, groupes: () => groupes.size };
}
