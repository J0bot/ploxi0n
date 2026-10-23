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
  const tous = [...D.querySelectorAll('body *')];
  const flottants = [], troisD = [], larges = [];
  for (const e of tous) {
    const cs = W.getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = e.getBoundingClientRect();
    if ((cs.position === 'fixed' || cs.position === 'sticky') && r.width > 0 && r.height > 0 && +cs.opacity > 0.05 && r.bottom > 0 && r.top < Hd && r.right > 0 && r.left < Wd)
      flottants.push(sig(e) + ' · ' + cs.position + ' z' + cs.zIndex + ' · ' + boite(r) + ' · ' + proprio(e) + (e.getAttribute('aria-label') ? ' · « ' + e.getAttribute('aria-label') + ' »' : ''));
    const t = cs.transform || '';
    if (t.startsWith('matrix3d') || cs.transformStyle === 'preserve-3d' || (cs.perspective && cs.perspective !== 'none'))
      troisD.push(sig(e) + ' · ' + boite(r) + ' · ' + proprio(e) + ' · ' + (t.startsWith('matrix3d') ? 'incliné' : cs.transformStyle === 'preserve-3d' ? 'preserve-3d' : 'perspective'));
    if (r.right > Wd + 1 && r.width > 0 && cs.position !== 'fixed') larges.push(sig(e) + ' · ' + boite(r) + ' · ' + proprio(e));
  }
  L.push('', 'CE QUI FLOTTE (' + flottants.length + ')', ...flottants.slice(0, 40));
  L.push('', 'CE QUI EST EN 3D (' + troisD.length + ')', ...troisD.slice(0, 20));
  // une inclinaison restée collée (la fractale, le cube, un zoom) se voit aussi sur une page cachée : par son style posé
  const colles = tous.filter(e => /rotate|perspective|translateZ|matrix3d|scale\(/.test((e.style && e.style.transform) || '')).map(e => sig(e) + ' · ' + proprio(e) + ' · ' + e.style.transform.slice(0, 90));
  L.push('', 'LES TRANSFORMATIONS POSÉES (' + colles.length + ')', ...colles.slice(0, 20));
  L.push('', 'CE QUI DÉBORDE À DROITE (' + larges.length + ')', ...larges.slice(0, 10));
  return L.join('\n');
}
