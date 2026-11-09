// ◎ LE DIAGNOSTIC DE L'ÉCRAN (0.99.18, RS-7 sur l'iPhone : « y a quelques bugs » : un rond qui flotte partout, du contenu coupé net au
// milieu de l'écran). Ce que le faux iPhone ne voit pas (un ploxion du labo qui accroche un élément à la page, une inclinaison 3D du
// gyroscope) se relève ici, sur le vrai téléphone : ce qui flotte par-dessus, ce qui est incliné en 3D, ce qui déborde. Lecture seule.
const sig = (e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
const proprio = (e) => { const h = e.closest && e.closest('.px-hote'); return h ? 'dans « ' + (h.dataset.ploxion || '?') + ' »' : 'posé sur l\'app'; };
const boite = (r) => Math.round(r.left) + ',' + Math.round(r.top) + ' ' + Math.round(r.width) + '×' + Math.round(r.height);

/** la signature d'un élément : ce qu'il est, d'où il vient (pour « c'est quoi ça ? ») */
export const signature = (e) => (e && e.tagName ? sig(e) + ' (' + proprio(e) + ')' : '');

let dernier = null;
/** relever plus tard (le temps d'aller sur l'écran qui cloche) : le relevé est gardé, la promesse le rend */
export function diagnosticDans(ms, W = globalThis.window) { return new Promise(ok => W.setTimeout(() => { dernier = diagnostic(W); ok(dernier); }, ms)); }
export const dernierDiagnostic = () => dernier;

export function diagnostic(W = globalThis.window) {
  const D = W.document, L = [], Wd = W.innerWidth, Hd = W.innerHeight;
  L.push('écran ' + Wd + '×' + Hd + ' · ' + (W.ploxi0n && W.ploxi0n.version ? 'ploxi0n ' + W.ploxi0n.version : '') + ' · ' + new Date().toISOString());
  // (0.99.25, RS-7 : toute la page décalée de côté) la vue de l'iPhone elle-même : décalée, zoomée ?
  const vv = W.visualViewport; L.push('la vue : défilée ' + Math.round(W.scrollX || 0) + ',' + Math.round(W.scrollY || 0) + (vv ? ' · visible ×' + (+vv.scale).toFixed(2) + ' décalée ' + Math.round(vv.offsetLeft) + ',' + Math.round(vv.offsetTop) + ' ' + Math.round(vv.width) + '×' + Math.round(vv.height) : ''));
  const tous = [...D.querySelectorAll('body *')];
  const flottants = [], troisD = [], larges = [], rouges = [];
  const rouge = (t) => { const m = String(t || '').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/g); return !!(m && m.some(x => { const [r, g, b, a = 1] = x.match(/[\d.]+/g).map(Number); return r > 140 && g < 90 && b < 90 && a > 0.15; })); };
  for (const e of tous) {
    const cs = W.getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = e.getBoundingClientRect();
    if ((cs.position === 'fixed' || cs.position === 'sticky') && r.width > 0 && r.height > 0 && +cs.opacity > 0.05 && r.bottom > 0 && r.top < Hd && r.right > 0 && r.left < Wd)
      flottants.push(sig(e) + ' · ' + cs.position + ' z' + cs.zIndex + ' · ' + boite(r) + ' · ' + proprio(e) + (e.getAttribute('aria-label') ? ' · « ' + e.getAttribute('aria-label') + ' »' : ''));
    const t = cs.transform || '';
    if (t.startsWith('matrix3d') || cs.transformStyle === 'preserve-3d' || (cs.perspective && cs.perspective !== 'none'))
      troisD.push(sig(e) + ' · ' + boite(r) + ' · ' + proprio(e) + ' · ' + (t.startsWith('matrix3d') ? 'incliné' : cs.transformStyle === 'preserve-3d' ? 'preserve-3d' : 'perspective'));
    if (r.right > Wd + 1 && r.width > 0 && cs.position !== 'fixed') larges.push(sig(e) + ' · ' + boite(r) + ' · ' + proprio(e));
    // (0.99.25, RS-7 : un rond rouge flou sur l'accueil) ce qui peint du rouge, en grand (fond, ombre, filtre, remplissage SVG)
    if (r.width >= 40 && r.height >= 40 && r.bottom > 0 && r.top < Hd && (rouge(cs.backgroundColor) || rouge(cs.backgroundImage) || rouge(cs.boxShadow) || rouge(cs.filter) || rouge(cs.fill) || rouge(cs.floodColor) || rouge(cs.stopColor) || rouge(cs.color) && r.width > 120))
      rouges.push(sig(e) + ' · ' + boite(r) + ' · ' + proprio(e));
  }
  L.push('', 'CE QUI FLOTTE (' + flottants.length + ')', ...flottants.slice(0, 40));
  L.push('', 'CE QUI EST EN 3D (' + troisD.length + ')', ...troisD.slice(0, 20));
  // une inclinaison restée collée (la fractale, le cube, un zoom) se voit aussi sur une page cachée : par son style posé
  const colles = tous.filter(e => { const t = (e.style && e.style.transform) || ''; return /rotate|perspective|translateZ|matrix3d|scale\(/.test(t) || (/translate/.test(t) && !/translate\(0(px)?, ?0(px)?\)/.test(t)); }).map(e => sig(e) + ' · ' + proprio(e) + ' · ' + e.style.transform.slice(0, 90));
  L.push('', 'LES TRANSFORMATIONS POSÉES (' + colles.length + ')', ...colles.slice(0, 20));
  L.push('', 'CE QUI DÉBORDE À DROITE (' + larges.length + ')', ...larges.slice(0, 10));
  L.push('', 'CE QUI PEINT DU ROUGE (' + rouges.length + ')', ...rouges.slice(0, 15));
  return L.join('\n');
}
