// Le ROUTEUR de ploxi0n : l'accueil (les ploxions installés), ouvrir un ploxion (charger son bundle, mount), revenir (unmount : le droit
// au silence — un ploxion démonté libère tout). Un seul ploxion monté à la fois : c'est un téléphone, et ça garde le Pi-esprit.
//
// Un ploxion installé = public/ploxions/<id>/app.js (+ app.css) et une entrée de public/ploxions/index.json { id, nom, icone, hash }.
// Le bundle vient du labo (tools/extraire-ploxions.mjs) : il pose window.jOSApps[id] = { manifest, mount(container, ctx) → { unmount } }.

// le logo (losanges concentriques), en clair sur le fond sombre
const LOGO = '<svg class="px-logo" viewBox="0 0 1024 1024" aria-hidden="true"><polygon points="512,72 952,512 512,952 72,512" fill="currentColor"/><polygon points="512,112 912,512 512,912 112,512" fill="var(--bg,#0b1220)"/><polygon points="512,152 872,512 512,872 152,512" fill="currentColor"/><polygon points="512,192 832,512 512,832 192,512" fill="var(--bg,#0b1220)"/><polygon points="512,232 792,512 512,792 232,512" fill="currentColor"/><polygon points="512,272 752,512 512,752 272,512" fill="var(--bg,#0b1220)"/><polygon points="512,312 712,512 512,712 312,512" fill="currentColor"/><polygon points="512,352 672,512 512,672 352,512" fill="var(--bg,#0b1220)"/><polygon points="512,392 632,512 512,632 392,512" fill="currentColor"/><polygon points="512,432 592,512 512,592 432,512" fill="var(--bg,#0b1220)"/></svg>';

export function creerRouteur({ fenetre = globalThis.window, racine, catalogue = [], base = '/ploxions/', delai = 10000 } = {}) {
  const W = fenetre, D = W.document;
  const parId = new Map(catalogue.map(p => [p.id, p]));
  let courant = null;     // { id, inst, hote }
  const charges = new Map();

  function charger(id) {
    if (W.jOSApps && W.jOSApps[id]) return Promise.resolve(W.jOSApps[id]);
    if (charges.has(id)) return charges.get(id);
    const p = new Promise((ok, ko) => {
      const css = D.createElement('link'); css.rel = 'stylesheet'; css.href = base + encodeURIComponent(id) + '/app.css'; css.dataset.ploxion = id; D.head.appendChild(css);
      const s = D.createElement('script'); s.src = base + encodeURIComponent(id) + '/app.js'; s.dataset.ploxion = id;
      const fin = W.setTimeout(() => ko(new Error('le ploxion ' + id + ' ne s\'est pas enregistré')), delai);
      s.onload = () => { W.clearTimeout(fin); W.jOSApps && W.jOSApps[id] ? ok(W.jOSApps[id]) : ko(new Error('le ploxion ' + id + ' ne s\'est pas enregistré')); };
      s.onerror = () => { W.clearTimeout(fin); ko(new Error('bundle introuvable : ' + id)); };
      D.head.appendChild(s);
    });
    charges.set(id, p);
    p.catch(() => charges.delete(id));
    return p;
  }

  function accueil() {
    fermer();
    racine.innerHTML = '<div class="px-accueil"><h1>' + LOGO + 'ploxi0n</h1><p class="px-sous">tes ploxions, sur ton téléphone, même sans réseau</p><div class="px-grille">'
      + catalogue.map(p => '<button class="px-tuile" data-id="' + attr(p.id) + '"><span class="px-ic">' + texte(p.icone || '▣') + '</span><span>' + texte(p.nom || p.id) + '</span></button>').join('')
      + '</div></div>';
    racine.querySelectorAll('[data-id]').forEach(b => b.addEventListener('click', () => ouvrir(b.getAttribute('data-id'))));
  }

  async function ouvrir(id, params) {
    if (!parId.has(id)) return false;
    fermer();
    racine.innerHTML = '<div class="px-barre"><button class="px-retour" aria-label="retour">‹</button><span>' + texte((parId.get(id).icone || '') + ' ' + (parId.get(id).nom || id)) + '</span></div><div class="px-hote"></div>';
    racine.querySelector('.px-retour').addEventListener('click', accueil);
    const hote = racine.querySelector('.px-hote');
    try {
      const app = await charger(id);
      const inst = app.mount(hote, { embed: false, standalone: true, host: 'ploxi0n', params: params || null, onglet: params && params.onglet }) || {};
      courant = { id, inst, hote };
      W.history && W.history.replaceState && W.history.replaceState(null, '', '#/' + encodeURIComponent(id));
    } catch (e) {
      hote.innerHTML = '<p class="px-erreur">Ce ploxion n\'a pas pu s\'ouvrir : ' + texte(e.message) + '</p>';
    }
    return true;
  }

  function fermer() {
    if (!courant) return;
    const c = courant; courant = null;
    try { if (c.inst && typeof c.inst.unmount === 'function') c.inst.unmount(); } catch (e) { console.warn('[ploxi0n] unmount', c.id, e); }
    c.hote.innerHTML = '';
  }

  function texte(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function attr(s) { return texte(s); }

  return { accueil, ouvrir, fermer, connait: (id) => parId.has(id), courant: () => (courant ? courant.id : null), charger };
}
