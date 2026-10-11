// Le ROUTEUR de ploxi0n : l'accueil (les ploxions installés, rangés en DOSSIERS), ouvrir un ploxion (charger son bundle, mount), revenir
// (unmount : le droit au silence — un ploxion démonté libère tout). Un seul ploxion monté à la fois.
//
// Le catalogue est DYNAMIQUE (le marketplace installe et retire) : majCatalogue(liste). Un bundle vient, dans l'ordre, de
//   1. window.jOSApps[id] déjà là (les ploxions intégrés : banc, marketplace)
//   2. bundleLocal(id) → le JS installé dans boxion_local (le marketplace)
//   3. public/ploxions/<id>/app.js (le pack hors ligne embarqué)
// L'accueil : boxion_local « reglages/accueil » = { dossiers: [{ nom, ids }] } ; un ploxion hors dossier reste à la racine.
// Face ID : « reglages/verrous » = [ids] ; un ploxion verrouillé ne s'ouvre qu'avec jOSVerrou.ouvrir().

const R = [440, 400, 360, 320, 280, 240, 200, 160, 120, 80];
// le logo (losanges concentriques), transparent : les espaces entre les losanges sont des trous
const LOGO = '<svg class="px-logo" viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="'
  + R.map(r => `M512 ${512 - r}L${512 + r} 512L512 ${512 + r}L${512 - r} 512Z`).join('') + '"/></svg>';

export function creerRouteur({ fenetre = globalThis.window, racine, catalogue = [], base = '/ploxions/', delai = 10000, boxion = null, verrou = null, bundleLocal = null, hud = null, surUsage = null } = {}) {
  const W = fenetre, D = W.document;
  let parId = new Map(catalogue.map(p => [p.id, p]));
  let courant = null;     // { id, inst, hote }
  let edition = false, dossierOuvert = null;
  let verrous = new Set(), accueilDoc = { dossiers: [] };
  const charges = new Map();
  const pret = boxion ? Promise.all([
    boxion.get('reglages', 'verrous').then(v => { verrous = new Set(Array.isArray(v) ? v : []); }),
    boxion.get('reglages', 'accueil').then(v => { if (v && Array.isArray(v.dossiers)) accueilDoc = v; }),
  ]).catch(() => {}) : Promise.resolve();
  const garder = () => { if (boxion) { boxion.put('reglages', 'verrous', [...verrous]).catch(() => {}); boxion.put('reglages', 'accueil', accueilDoc).catch(() => {}); } };

  function executer(id, js) {
    const s = D.createElement('script'); s.dataset.ploxion = id; s.textContent = js + '\n//# sourceURL=ploxi0n/' + id + '.js'; D.head.appendChild(s);
    if (!(W.jOSApps && W.jOSApps[id])) { try { W.eval(js); } catch (e) { /* le ploxion se signalera « pas enregistré » */ } }   // une page qui n'exécute pas les scripts insérés
  }
  function charger(id) {
    if (W.jOSApps && W.jOSApps[id]) return Promise.resolve(W.jOSApps[id]);
    if (charges.has(id)) return charges.get(id);
    const p = (async () => {
      const js = bundleLocal ? await bundleLocal(id) : null;
      if (js) { executer(id, js); if (W.jOSApps && W.jOSApps[id]) return W.jOSApps[id]; throw new Error('le ploxion ' + id + ' ne s\'est pas enregistré'); }
      return new Promise((ok, ko) => {
        const css = D.createElement('link'); css.rel = 'stylesheet'; css.href = base + encodeURIComponent(id) + '/app.css'; css.dataset.ploxion = id; D.head.appendChild(css);
        const s = D.createElement('script'); s.src = base + encodeURIComponent(id) + '/app.js'; s.dataset.ploxion = id;
        const fin = W.setTimeout(() => ko(new Error('le ploxion ' + id + ' ne s\'est pas enregistré')), delai);
        s.onload = () => { W.clearTimeout(fin); W.jOSApps && W.jOSApps[id] ? ok(W.jOSApps[id]) : ko(new Error('le ploxion ' + id + ' ne s\'est pas enregistré')); };
        s.onerror = () => { W.clearTimeout(fin); ko(new Error('bundle introuvable : ' + id)); };
        D.head.appendChild(s);
      });
    })();
    charges.set(id, p);
    p.catch(() => charges.delete(id));
    return p;
  }

  const texte = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tuile = (p) => '<button class="px-tuile' + (edition && !p.interne ? ' px-edite' : '') + '" data-id="' + texte(p.id) + '"><span class="px-ic">' + texte(p.icone || '▣') + '</span><span>' + (verrous.has(p.id) ? '🔒 ' : '') + texte(p.nom || p.id) + '</span></button>';
  const dansDossier = () => new Set(accueilDoc.dossiers.flatMap(d => d.ids));

  async function accueil() {
    fermer();
    await pret;
    const tous = [...parId.values()];
    if (dossierOuvert !== null && accueilDoc.dossiers[dossierOuvert]) {
      const d = accueilDoc.dossiers[dossierOuvert];
      racine.innerHTML = '<div class="px-barre"><button class="px-retour" data-sortir aria-label="retour">‹</button><span>📁 ' + texte(d.nom) + '</span></div><div class="px-grille px-pad">'
        + d.ids.map(id => parId.get(id)).filter(Boolean).map(tuile).join('') + '</div>';
      return;
    }
    const ranges = dansDossier();
    racine.innerHTML = '<div class="px-accueil"><h1>' + LOGO + 'ploxi0n<span class="px-hud">' + (hud ? hud.html() : '') + '<button class="px-modif" data-edition>' + (edition ? 'terminé' : '✎') + '</button></span></h1>'
      + '<p class="px-sous">' + (edition ? 'Touche un ploxion pour le ranger dans un dossier, ou l\'en sortir.' : 'tes ploxions, sur ton téléphone, même sans réseau') + '</p><div class="px-grille">'
      + accueilDoc.dossiers.map((d, i) => '<button class="px-tuile px-dossier" data-dossier="' + i + '"><span class="px-ic">📁</span><span>' + texte(d.nom) + ' (' + d.ids.filter(id => parId.has(id)).length + ')</span></button>').join('')
      + tous.filter(p => !ranges.has(p.id)).map(tuile).join('') + '</div></div>';
  }
  racine.addEventListener('click', async (e) => {
    const b = e.target.closest('button'); if (!b || !racine.contains(b) || b.closest('.px-hote')) return;
    if (b.hasAttribute('data-compte')) { if (hud) hud.ouvrir(); return; }
    if (b.hasAttribute('data-edition')) { edition = !edition; return accueil(); }
    if (b.hasAttribute('data-sortir')) { dossierOuvert = null; return accueil(); }
    if (b.hasAttribute('data-dossier')) { dossierOuvert = +b.getAttribute('data-dossier'); return accueil(); }
    if (b.hasAttribute('data-retour')) return accueil();
    const id = b.getAttribute('data-id'); if (!id) return;
    if (!edition) return ouvrir(id);
    if (parId.get(id) && parId.get(id).interne) return;
    // édition : ranger dans un dossier (nouveau ou existant), ou l'en sortir
    const actuel = accueilDoc.dossiers.findIndex(d => d.ids.includes(id));
    let nom = null; try { nom = W.prompt(actuel >= 0 ? 'Dossier de ce ploxion (vide = le sortir du dossier)' : 'Ranger dans quel dossier ? (un nom existant ou nouveau)', actuel >= 0 ? accueilDoc.dossiers[actuel].nom : ''); } catch (er) { /* pas de prompt */ }
    if (nom === null) return;
    nom = String(nom).trim().slice(0, 40);
    accueilDoc.dossiers.forEach(d => { d.ids = d.ids.filter(x => x !== id); });
    if (nom) { let d = accueilDoc.dossiers.find(x => x.nom === nom); if (!d) { d = { nom, ids: [] }; accueilDoc.dossiers.push(d); } d.ids.push(id); }
    accueilDoc.dossiers = accueilDoc.dossiers.filter(d => d.ids.length);
    if (dossierOuvert !== null && !accueilDoc.dossiers[dossierOuvert]) dossierOuvert = null;
    garder(); accueil();
  });

  async function ouvrir(id, params) {
    if (!parId.has(id)) return false;
    fermer();
    await pret;
    const p = parId.get(id);
    if (verrous.has(id) && !(verrou && await verrou.ouvrir('Ouvrir ' + (p.nom || id)))) {
      racine.innerHTML = '<div class="px-barre"><button class="px-retour" data-retour aria-label="retour">‹</button><span>🔒 ' + texte(p.nom || id) + '</span></div><p class="px-erreur">Ce ploxion ne s\'ouvre qu\'avec ton visage.</p>';
      return false;
    }
    racine.innerHTML = '<div class="px-barre"><button class="px-retour" data-retour aria-label="retour">‹</button><span>' + texte((p.icone || '') + ' ' + (p.nom || id)) + '</span>'
      + '<span class="px-hud">' + (hud ? hud.html(true) : '') + (verrou && !p.interne ? '<button class="px-verrou" data-verrou aria-label="verrou Face ID">' + (verrous.has(id) ? '🔒' : '🔓') + '</button>' : '') + '</span></div><div class="px-hote"></div>';
    const bv = racine.querySelector('[data-verrou]');
    if (bv) bv.onclick = async (e) => {
      e.stopPropagation();
      if (verrous.has(id)) { if (!(await verrou.ouvrir('Retirer le verrou de ' + (p.nom || id)))) return; verrous.delete(id); }
      else { if (!(await verrou.dispo()).ok) { bv.textContent = '⚠'; return; } verrous.add(id); }
      garder(); bv.textContent = verrous.has(id) ? '🔒' : '🔓';
    };
    const hote = racine.querySelector('.px-hote');
    try {
      const app = await charger(id);
      const inst = app.mount(hote, { embed: false, standalone: true, host: 'ploxi0n', params: params || null, onglet: params && params.onglet }) || {};
      courant = { id, inst, hote, debut: Date.now() };
      try { W.history.replaceState(null, '', '#/' + encodeURIComponent(id)); } catch (er) { /* */ }
    } catch (er) {
      hote.innerHTML = '<p class="px-erreur">Ce ploxion n\'a pas pu s\'ouvrir : ' + texte(er.message) + '</p>';
    }
    return true;
  }

  function fermer() {
    if (!courant) return;
    const c = courant; courant = null;
    try { if (c.inst && typeof c.inst.unmount === 'function') c.inst.unmount(); } catch (e) { console.warn('[ploxi0n] unmount', c.id, e); }
    // le temps passé dans ce ploxion (le vecteur xerion, comme jOSUsage du labo) ; au-delà de 4 h d'affilée, l'écran était sans doute oublié
    if (surUsage && c.debut) { const sec = Math.min(4 * 3600, Math.round((Date.now() - c.debut) / 1000)); if (sec > 0) surUsage(c.id, sec); }
    c.hote.innerHTML = '';
  }

  return {
    accueil, ouvrir, fermer, charger,
    connait: (id) => parId.has(id), courant: () => (courant ? courant.id : null),
    majCatalogue(liste) { parId = new Map(liste.map(p => [p.id, p])); },
    rafraichirHud() { racine.querySelectorAll('.px-hud [data-compte]').forEach(b => { const t = D.createElement('div'); t.innerHTML = hud ? hud.html(!!courant) : ''; if (t.firstElementChild) b.replaceWith(t.firstElementChild); }); },
    catalogue: () => [...parId.values()],
  };
}
