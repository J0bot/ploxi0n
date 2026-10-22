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
const NS = 'http://www.w3.org/2000/svg';
export const SEUIL = 26, EPAIS = 4;

/** les synapses entre des cellules { x, y, w, h } : les paires côte à côte (l'écart sous le seuil, assez en face l'une de l'autre) ; pas un
 *  treillis : un arbre qui relie chaque cellule à au moins une autre (les plus proches d'abord), et quelques liens de plus (part ≈ autres) */
export function synapses(cs, { seuil = SEUIL, autres = 0.35 } = {}) {
  const cands = [];
  for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
    const a = cs[i], b = cs[j];
    const gx = Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w)), gy = Math.max(b.y - (a.y + a.h), a.y - (b.y + b.h));
    const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    const h = ((i * 7 + j * 13) % 5 - 2) / 2 * 0.3;   // un décalage fixe, propre à la paire : les ponts ne sont pas tous au milieu (organique)
    if (gx >= 0 && gx <= seuil && oy >= 12) {   // côte à côte
      const l = Math.max(10, Math.min(26, oy * 0.12)), c = Math.max(a.y, b.y) + oy / 2 + h * (oy - l) / 2, x0 = Math.min(a.x + a.w, b.x + b.w) - 4;
      cands.push({ x: x0, y: c - l / 2, w: gx + 8, h: l, de: i, a: j, ecart: gx });
    } else if (gy >= 0 && gy <= seuil && ox >= 12) {   // l'un sur l'autre
      const l = Math.max(10, Math.min(26, ox * 0.12)), c = Math.max(a.x, b.x) + ox / 2 + h * (ox - l) / 2, y0 = Math.min(a.y + a.h, b.y + b.h) - 4;
      cands.push({ x: c - l / 2, y: y0, w: l, h: gy + 8, de: i, a: j, ecart: gy });
    }
  }
  cands.sort((p, q) => p.ecart - q.ecart || p.de - q.de || p.a - q.a);
  const chef = cs.map((_, i) => i), trouver = (i) => (chef[i] === i ? i : (chef[i] = trouver(chef[i])));
  return cands.filter(p => {
    const r1 = trouver(p.de), r2 = trouver(p.a);
    if (r1 !== r2) { chef[r1] = r2; return true; }   // relie deux morceaux : toujours
    return ((p.de * 31 + p.a * 17) % 20) / 20 < autres;   // un lien de plus, ou pas (fixe : le même à chaque dessin)
  }).map(({ ecart, a, ...p }) => p);
}

/** les filtres, une fois : la membrane (et son halo) et le dedans, normaux et fins (même turbulence, même graine : les calques restent alignés).
 *  (0.94, le xer organique, d'après les planches de RS-7 : des membranes qui luisent, vert biolumineux et violet) le halo = la membrane floutée,
 *  posée dessous, à demi */
function filtres(D) {
  if (D.getElementById('px-f-mb')) return;
  const f = (id, flou, onde, freq, eroder) => '<filter id="' + id + '" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">'
    + '<feGaussianBlur in="SourceGraphic" stdDeviation="' + flou + '" result="b"/>'
    + '<feTurbulence type="fractalNoise" baseFrequency="' + freq + '" numOctaves="1" seed="7" result="n"/>'
    + '<feDisplacementMap in="b" in2="n" scale="' + onde + '" xChannelSelector="R" yChannelSelector="G" result="d"/>'
    + '<feColorMatrix in="d" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -11" result="m"/>'
    + (eroder ? '<feMorphology in="m" operator="erode" radius="' + EPAIS + '"/>'
      // (0.95, RS-7 : « plus translucide : comme des neurones, des câbles électriques, des vaisseaux sanguins, des nerfs ») la paroi seule,
      // translucide (le fond passe à travers) ; au milieu de la paroi, un filet plus clair (la lumière dans le nerf, l'âme du câble) ; le halo
      : '<feMorphology in="m" operator="erode" radius="' + EPAIS + '" result="e"/><feComposite in="m" in2="e" operator="out" result="paroi"/>'
        + '<feMorphology in="m" operator="erode" radius="' + (EPAIS * 0.3) + '" result="e1"/><feMorphology in="m" operator="erode" radius="' + (EPAIS * 0.65) + '" result="e2"/>'
        + '<feComposite in="e1" in2="e2" operator="out" result="ame0"/>'
        + '<feColorMatrix in="ame0" type="matrix" values=".45 0 0 0 .55 0 .45 0 0 .55 0 0 .45 0 .55 0 0 0 .5 0" result="ame"/>'
        + '<feColorMatrix in="paroi" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .62 0" result="paroiT"/>'
        + '<feGaussianBlur in="m" stdDeviation="' + (flou + 2) + '" result="h"/><feColorMatrix in="h" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .4 0" result="halo"/>'
        + '<feMerge><feMergeNode in="halo"/><feMergeNode in="paroiT"/><feMergeNode in="ame"/></feMerge>') + '</filter>';
  const s = D.createElementNS(NS, 'svg');
  s.setAttribute('class', 'px-neurones-defs'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('width', '0'); s.setAttribute('height', '0');
  s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  s.innerHTML = '<defs>' + f('px-f-mb', 5, 10, 0.016, false) + f('px-f-dd', 5, 10, 0.016, true) + f('px-f-mb-fin', 3, 6, 0.026, false) + f('px-f-dd-fin', 3, 6, 0.026, true) + '</defs>';
  D.body.appendChild(s);
}

/** les KOINS d'une cellule (0.94 : les gouttes des coins, sur les planches de RS-7) : aux quatre coins d'une grande cellule, une goutte de
 *  membrane (le goo la fond dans le bord : un coin bombé). Les petites cellules n'en ont pas (le koin d'un koin serait du bruit). */
export function koinsDe(q, { min = 120 } = {}) {
  if (q.w < min || q.h < min) return [];
  const r = Math.max(6, Math.min(13, Math.min(q.w, q.h) / 14)), d = r * 0.55;
  return [[q.x + d, q.y + d], [q.x + q.w - d, q.y + d], [q.x + d, q.y + q.h - d], [q.x + q.w - d, q.y + q.h - d]].map(([cx, cy], i) => ({ cx, cy, r, coin: i }));
}

export function creerNeurones({ W = globalThis.window } = {}) {
  const D = W.document, groupes = new Map();   // conteneur → { svg, cle, mo, ro }
  let prevu = false, scanPrevu = false;
  const actif = () => D.documentElement.classList.contains('px-organique');
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
    const cle = JSON.stringify([fin, seuil, cs]);
    if (cle === g.cle) return; g.cle = cle;
    if (!cs.length) { if (g.svg) g.svg.innerHTML = ''; return; }
    if (!g.svg || !g.svg.isConnected) { g.svg = D.createElementNS(NS, 'svg'); g.svg.setAttribute('class', 'px-neurones'); g.svg.setAttribute('aria-hidden', 'true'); c.insertBefore(g.svg, c.firstChild); }
    const M = 16, x0 = Math.min(...cs.map(q => q.x)) - M, y0 = Math.min(...cs.map(q => q.y)) - M;
    const L = Math.max(...cs.map(q => q.x + q.w)) + M - x0, H = Math.max(...cs.map(q => q.y + q.h)) + M - y0;
    const ponts = synapses(cs, { seuil, autres: fin ? 0.2 : 0.5 });
    const corps = (cle2) => cs.map(q => '<rect x="' + (q.x - x0) + '" y="' + (q.y - y0) + '" width="' + q.w + '" height="' + q.h + '" rx="' + r1(q.rx) + '" fill="' + q[cle2] + '"/>').join('')
      + ponts.map(p => '<rect x="' + r1(p.x - x0) + '" y="' + r1(p.y - y0) + '" width="' + r1(p.w) + '" height="' + r1(p.h) + '" rx="' + r1(Math.min(p.w, p.h) / 2) + '" fill="' + cs[p.de][cle2] + '"/>').join('');
    g.svg.setAttribute('width', L); g.svg.setAttribute('height', H); g.svg.setAttribute('viewBox', '0 0 ' + L + ' ' + H);
    g.svg.style.left = x0 + 'px'; g.svg.style.top = y0 + 'px';
    const sfx = fin ? '-fin' : '';
    const gouttes = fin ? '' : cs.map(q => koinsDe(q).map(k => '<circle cx="' + r1(k.cx - x0) + '" cy="' + r1(k.cy - y0) + '" r="' + r1(k.r) + '" fill="' + q.bord + '"/>').join('')).join('');
    g.svg.innerHTML = '<g filter="url(#px-f-mb' + sfx + ')">' + corps('bord') + gouttes + '</g><g class="px-neurones-dd" filter="url(#px-f-dd' + sfx + ')">' + corps('fond') + '</g>';
    if (g.ro) { g.ro.disconnect(); g.ro.observe(c); for (const el of c.querySelectorAll('[data-neurone],.px-neurone')) g.ro.observe(el); }
  }
  function tout() {
    prevu = false;
    for (const [c, g] of groupes) {
      if (!c.isConnected || !actif()) { if (g.svg) g.svg.remove(); if (g.mo) g.mo.disconnect(); if (g.ro) g.ro.disconnect(); groupes.delete(c); continue; }
      try { dessiner(c, g); } catch (e) { /* une cellule partie entre-temps */ }
    }
  }
  const prevoir = () => { if (prevu) return; prevu = true; (W.requestAnimationFrame || ((f) => W.setTimeout(f, 16)))(tout); };
  function scanner() {
    scanPrevu = false;
    if (!actif()) { if (groupes.size) prevoir(); return; }
    filtres(D);
    for (const c of D.querySelectorAll('[data-neurones]')) {
      if (groupes.has(c)) continue;
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
      const theme = () => [...D.documentElement.classList].filter(k => /^px-(organique|m-|contraste|sans-grain)/.test(k)).sort().join(' ');
      let avant = theme();
      new W.MutationObserver(() => { const t = theme(); if (t === avant) return; avant = t; for (const g of groupes.values()) g.cle = null; scan(); }).observe(D.documentElement, { attributes: true, attributeFilter: ['class'] });
    }
    W.addEventListener('resize', () => { for (const g of groupes.values()) g.cle = null; prevoir(); });
    scan();
  }
  return { installer, scanner, tout, groupes: () => groupes.size };
}
