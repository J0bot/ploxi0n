// @bion neurone-vue — la vue d'un neurone (un ploxion, un bion) : ses entrées (des récepteurs, en haut), le soma (son glyphe, ses bions dedans),
// ses sorties (des terminaisons, en bas), les axones dessinés de chaque canal au soma, et les synapses vers les autres | api: neuroneHtml, poserAxones
// (0.98, RS-7 23.10 : « chaque bion et ploxion, il faut les input et output » ; ses planches : la terminaison verte face au récepteur violet,
// la synapse). Le zoom de fractale y descend : la map (un hub) → un ploxion (son neurone) → un bion (le sien). Compose src/bions/flux.js.
import { court } from '../bions/flux.js';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NS = 'http://www.w3.org/2000/svg';

/** n = { genre: 'ploxion' | 'bion', id, titre, glyphe (html), sous, entrees: [{ canal, doc, sur }], sorties, bions: [{ nom, glyphe }], liens: [{ id, nom, sens: 'vers' | 'de', canal }], actions: [[cle, texte]] } */
export function neuroneHtml(n) {
  const canal = (c, sens) => '<div class="px-nv-c px-nv-' + sens + (c.sur === 'core' ? ' px-nv-core' : '') + '" data-neurone data-nv-canal="' + esc(c.canal) + '"><b>' + esc(court(c.canal)) + '</b>' + (c.doc ? '<small>' + esc(c.doc) + '</small>' : '') + '</div>';
  const vide = (t) => '<p class="px-nv-vide">' + t + '</p>';
  return '<div class="px-nv" data-nv="' + esc(n.genre + ':' + n.id) + '">'
    + '<p class="px-nv-g">' + (n.genre === 'bion' ? '◎ un bion' : '◇ un ploxion') + ' · entrées ' + n.entrees.length + ' · sorties ' + n.sorties.length + '</p>'
    + '<div class="px-nv-e" data-neurones="fin">' + (n.entrees.length ? n.entrees.map(c => canal(c, 'e')).join('') : vide('rien n\'entre (qu\'on voie)')) + '</div>'
    + '<div class="px-nv-soma" data-neurones><div class="px-nv-noyau" data-neurone><span class="px-nv-gl">' + (n.glyphe || '') + '</span><b>' + esc(n.titre) + '</b>' + (n.sous ? '<small>' + esc(n.sous) + '</small>' : '')
    + (n.bions && n.bions.length ? '<div class="px-nv-b" data-neurones="fin">' + n.bions.slice(0, 40).map(b => '<button type="button" class="px-nv-o' + (b.coeur ? ' px-nv-coeur' : '') + '" data-neurone data-nv-bion="' + esc(b.nom) + '" aria-label="' + (b.coeur ? 'son cœur, ' : 'le bion ') + esc(b.nom) + '">' + (b.glyphe || '◎') + '<i>' + (b.coeur ? '◎ cœur' : esc(b.nom.replace(/^jOS/, ''))) + '</i></button>').join('') + '</div>' : '')
    + '<div class="px-nv-a">' + (n.actions || []).map(([k, t]) => '<button type="button" data-nv-action="' + esc(k) + '">' + esc(t) + '</button>').join('') + '</div></div></div>'
    + '<div class="px-nv-s" data-neurones="fin">' + (n.sorties.length ? n.sorties.map(c => canal(c, 's')).join('') : vide('rien ne sort (qu\'on voie)')) + '</div>'
    + (n.liens && n.liens.length ? '<p class="px-nv-g">synapses</p><div class="px-nv-l" data-neurones="fin">' + n.liens.slice(0, 30).map(l => '<button type="button" class="px-nv-lien" data-neurone data-nv-vers="' + esc(l.id) + '"><b>' + (l.sens === 'vers' ? '→ ' : '← ') + esc(l.nom) + '</b><small>' + esc(court(l.canal)) + '</small></button>').join('') + '</div>' : '')
    + '<svg class="px-nv-ax" aria-hidden="true"></svg></div>';
}

/** la boîte d'un élément DANS la racine, par la mise en page (offsetLeft/Top) : juste même pendant la plongée animée (un scale ne la fausse pas) */
function boite(el, racine) {
  let x = 0, y = 0, e = el;
  while (e && e !== racine) { x += e.offsetLeft || 0; y += e.offsetTop || 0; e = e.offsetParent; }
  return { left: x, top: y, width: el.offsetWidth || 0, height: el.offsetHeight || 0, right: x + (el.offsetWidth || 0), bottom: y + (el.offsetHeight || 0) };
}
/** les axones : de chaque canal au soma (une courbe, une terminaison évasée au bout) ; à refaire quand la taille change */
export function poserAxones(racine) {
  const svg = racine && racine.querySelector('.px-nv-ax'), noyau = racine && racine.querySelector('.px-nv-noyau'); if (!svg || !noyau) return;
  const L = racine.offsetWidth, H = racine.offsetHeight, N = boite(noyau, racine); if (!L) return;
  svg.setAttribute('width', L); svg.setAttribute('height', H); svg.setAttribute('viewBox', '0 0 ' + L + ' ' + H);
  const cx = N.left + N.width / 2, haut = N.top, bas = N.bottom; let d = '';
  for (const el of racine.querySelectorAll('.px-nv-c')) {
    const r = boite(el, racine), x = r.left + r.width / 2, entree = el.classList.contains('px-nv-e');
    const y = entree ? r.bottom : r.top, y2 = entree ? haut : bas, xm = cx + (x - cx) * 0.25;
    const cl = entree ? 'e' : 's';
    d += '<path class="px-nv-ax-' + cl + '" d="M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' C' + x.toFixed(1) + ' ' + ((y + y2) / 2).toFixed(1) + ' ' + xm.toFixed(1) + ' ' + ((y + y2) / 2).toFixed(1) + ' ' + xm.toFixed(1) + ' ' + y2.toFixed(1) + '"/>'
      // la terminaison : un bouton évasé côté canal (la synapse des planches)
      + '<path class="px-nv-term-' + cl + '" d="M' + (x - 7).toFixed(1) + ' ' + y.toFixed(1) + ' Q' + x.toFixed(1) + ' ' + (y + (entree ? 9 : -9)).toFixed(1) + ' ' + (x + 7).toFixed(1) + ' ' + y.toFixed(1) + ' Z"/>';
  }
  svg.innerHTML = d;
}
