// ▦ UN WIDGET PAR PLOXION (0.91, RS-7 22.10 : « parfait, live activités et widget »). Le widget « Un ploxion » de l'écran d'accueil d'iOS : on y
// choisit un ploxion (appui long › Modifier le widget) ; il montre ce que ce ploxion PUBLIE :
//   jOSWidget.publier({ valeur, unite, sous, serie: [nombres], bouton: { titre, params } }) — depuis le ploxion lui-même (son id est
//   celui qui est devant ; ou { id }) ; une valeur, son unité, une ligne, une courbe (24 points au plus), un bouton qui rouvre le ploxion
//   avec ses paramètres (ploxi0n://px/<id>?…). Sans publication : son glyphe et son nom, il ouvre le ploxion.
// Le chemin (celui des autres widgets) : les Préférences « ploxi0n.px-widgets » → l'AppDelegate les copie dans l'App Group (au passage en
// arrière-plan) → l'extension (WidgetUnPloxion) les lit. Gardé aussi dans boxion_local « reglages/px-widgets ».
const MAX_PX = 40;
const propre = (s, n) => String(s == null ? '' : s).slice(0, n);

/** ecrire(cle, texte) : les Préférences (natif) ; glyphePng(p) → base64 ; catalogue() → [{ id, nom, interne }] ; courant() → id */
export function creerWidgetsPloxions({ boxion, ecrire = async () => {}, glyphePng = async () => null, catalogue = () => [], courant = () => null, maintenant = () => Date.now() }) {
  let px = {};
  const pret = boxion.get('reglages', 'px-widgets').then(v => { if (v && typeof v === 'object') px = v; }).catch(() => {});
  let attente = null;
  /** la liste que le widget propose : les ploxions qui publient d'abord, puis les installés */
  function doc() {
    const cat = catalogue().filter(p => p && p.id && (!p.interne || px[p.id]));
    const ids = [...new Set([...Object.keys(px), ...cat.map(p => p.id)])].slice(0, 120);
    const nom = (id) => (px[id] && px[id].nom) || ((cat.find(p => p.id === id) || {}).nom) || id;
    return { liste: ids.map(id => ({ id, nom: nom(id) })), px };
  }
  function planifier() { if (attente) clearTimeout(attente); attente = setTimeout(() => { attente = null; ecrire('ploxi0n.px-widgets', JSON.stringify(doc())).catch(() => {}); }, 400); }
  async function publier(d = {}, id = null) {
    await pret;
    const ident = String(id || d.id || courant() || '').replace(/[^A-Za-z0-9._-]/g, '').slice(0, 60); if (!ident) throw new Error('jOSWidget.publier : quel ploxion ?');
    const p = catalogue().find(x => x.id === ident) || {};
    const serie = Array.isArray(d.serie) ? d.serie.map(Number).filter(isFinite).slice(-24) : [];
    let bouton = null;
    if (d.bouton && d.bouton.titre) { const q = new URLSearchParams(Object.entries(d.bouton.params || {}).slice(0, 8).map(([k, v]) => [String(k).slice(0, 30), String(v).slice(0, 200)])).toString(); bouton = { titre: propre(d.bouton.titre, 24), lien: 'ploxi0n://px/' + encodeURIComponent(ident) + (q ? '?' + q : '') }; }
    const avant = px[ident] || {};
    px[ident] = { nom: propre(d.nom || p.nom || ident, 40), valeur: propre(d.valeur, 24), unite: propre(d.unite, 12), sous: propre(d.sous, 60), serie, bouton, g64: avant.g64 || null, le: maintenant() };
    if (!px[ident].g64) { try { px[ident].g64 = await glyphePng(p.id ? p : { id: ident, nom: px[ident].nom }); } catch (e) { /* le symbole par défaut */ } }
    const cles = Object.keys(px); if (cles.length > MAX_PX) for (const k of cles.sort((a, b) => (px[a].le || 0) - (px[b].le || 0)).slice(0, cles.length - MAX_PX)) delete px[k];
    await boxion.put('reglages', 'px-widgets', px).catch(() => {});
    planifier();
    return { ...px[ident] };
  }
  async function retirer(id) { await pret; delete px[id]; await boxion.put('reglages', 'px-widgets', px).catch(() => {}); planifier(); }
  return { pret, publier, retirer, doc, rafraichir: () => { pret.then(planifier); }, tous: () => ({ ...px }) };
}
