// ⧈ LE XERBION (0.66). RS-7 (14.10) : « le xerbion, c'est les données des bions du ploxion ». Ce que chaque bion d'un ploxion garde,
// lu dans boxion_local, là où jOSBoxion les range (src/shim/jos.js : « box:<ns> », l'index « box-index ») :
//   - les espaces du ploxion lui-même (ns = son id, ou qui commence par son id) ;
//   - les espaces de chacun de ses bions (jOSGpg → un ns qui contient « gpg ») ;
//   - ses tsoins (un tsoin noté depuis lui : ploxion = son id).
// lireXerbion({ boxion, id, bions }) → { propre: [espace], bions: [{ nom, espaces: [espace] }], tsoins }
//   espace = { ns, cles, octets, maj } (au plus 40 clés lues par espace : c'est un aperçu, pas un inventaire)
// Montré sur la face du dessus du cube (src/app/fractale.js), à côté de la liste des bions.
const nomCourt = (b) => String(b || '').replace(/^jOS/i, '').toLowerCase();

async function espace(boxion, ns) {
  const l = await boxion.list('box:' + ns).catch(() => []);
  let octets = 0, maj = null;
  for (const { key } of l.slice(0, 40)) {
    const d = await boxion.get('box:' + ns, key).catch(() => null); if (!d) continue;
    try { octets += JSON.stringify(d.data == null ? null : d.data).length; } catch (e) { /* */ }
    if (d.savedAt && (!maj || d.savedAt > maj)) maj = d.savedAt;
  }
  return { ns, cles: l.length, octets, maj };
}
export async function lireXerbion({ boxion, id, bions = [] }) {
  if (!boxion || id == null) return { propre: [], bions: [], tsoins: 0 };
  const tous = [...new Set((await boxion.list('box-index').catch(() => [])).map(x => x.key))];
  const lid = String(id).toLowerCase(), pris = new Set();
  const propres = tous.filter(ns => { const n = ns.toLowerCase(); return n === lid || n.startsWith(lid + '-') || n.startsWith(lid + '.') || n.startsWith(lid + ':'); });
  propres.forEach(n => pris.add(n));
  const parBion = (bions || []).map(b => { const c = nomCourt(b); const e = c.length >= 3 ? tous.filter(ns => !pris.has(ns) && ns.toLowerCase().includes(c)) : []; e.forEach(n => pris.add(n)); return { nom: b, ns: e }; });
  const tsoins = (await boxion.lire('tsoins', { limite: 5000 }).catch(() => [])).filter(x => x && x.entry && x.entry.ploxion === id).length;
  return {
    propre: await Promise.all(propres.map(ns => espace(boxion, ns))),
    bions: await Promise.all(parBion.map(async b => ({ nom: b.nom, espaces: await Promise.all(b.ns.map(ns => espace(boxion, ns))) }))),
    tsoins,
  };
}
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ko = (o) => (o < 1024 ? o + ' o' : o < 1048576 ? Math.round(o / 1024) + ' ko' : (o / 1048576).toFixed(1) + ' Mo');
const depuis = (iso) => { if (!iso) return ''; const j = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5); return j <= 0 ? "aujourd'hui" : j === 1 ? 'hier' : 'il y a ' + j + ' j'; };
const ligne = (e) => esc(e.ns) + ' · ' + e.cles + ' clé' + (e.cles > 1 ? 's' : '') + (e.octets ? ' · ' + ko(e.octets) : '') + (e.maj ? ' · ' + depuis(e.maj) : '');
/** le xerbion, en lignes (la face du dessus du cube) */
export function htmlXerbion(x) {
  const l = [];
  for (const e of x.propre) l.push('<li class="px-xb-propre">' + ligne(e) + '</li>');
  for (const b of x.bions) l.push('<li><b>' + esc(b.nom) + '</b> ' + (b.espaces.length ? b.espaces.map(ligne).join(' ; ') : '<i>rien de gardé</i>') + '</li>');
  if (x.tsoins) l.push('<li class="px-xb-tsoins">⧗ ' + x.tsoins + ' tsoin' + (x.tsoins > 1 ? 's' : '') + '</li>');
  return l.length ? '<p class="px-xb-titre">⧈ le xerbion · ses données</p><ul class="px-xb">' + l.join('') + '</ul>' : '<p class="px-xb-titre">⧈ le xerbion · rien de gardé pour l\'instant</p>';
}
