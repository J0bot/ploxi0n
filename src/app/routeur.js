// Le ROUTEUR de ploxi0n : l'accueil (les ploxions installés, rangés en DOSSIERS), ouvrir un ploxion (charger son bundle, mount), revenir
// (unmount : le droit au silence — un ploxion démonté libère tout). Un seul ploxion monté à la fois.
//
// Le catalogue est DYNAMIQUE (le marketplace installe et retire) : majCatalogue(liste). Un bundle vient, dans l'ordre, de
//   1. window.jOSApps[id] déjà là (les ploxions intégrés : banc, marketplace)
//   2. bundleLocal(id) → le JS installé dans boxion_local (le marketplace)
//   3. public/ploxions/<id>/app.js (le pack hors ligne embarqué)
// L'accueil : boxion_local « reglages/accueil » = { dossiers: [{ nom, ids }], pages: [{ nom, ids }] } ; des PAGES qu'on fait glisser comme
// l'écran d'accueil de l'iPhone (la première : les dossiers et tout ce qui n'est rangé nulle part). En édition, toucher un ploxion ouvre ses
// actions : le ranger dans un dossier, le mettre sur une page, l'ajouter à l'écran d'accueil de l'iPhone (ecranAccueil(id), main.js).
// Face ID : « reglages/verrous » = [ids] ; un ploxion verrouillé ne s'ouvre qu'avec jOSVerrou.ouvrir().

const R = [440, 400, 360, 320, 280, 240, 200, 160, 120, 80];
// le logo (losanges concentriques), transparent : les espaces entre les losanges sont des trous
const LOGO = '<svg class="px-logo" viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="'
  + R.map(r => `M512 ${512 - r}L${512 + r} 512L512 ${512 + r}L${512 - r} 512Z`).join('') + '"/></svg>';

export function creerRouteur({ fenetre = globalThis.window, racine, catalogue = [], base = '/ploxions/', delai = 10000, boxion = null, verrou = null, bundleLocal = null, hud = null, surUsage = null, ecranAccueil = null } = {}) {
  const W = fenetre, D = W.document;
  let parId = new Map(catalogue.map(p => [p.id, p]));
  let courant = null;     // { id, inst, hote }
  let edition = false, dossierOuvert = null;
  let verrous = new Set(), accueilDoc = { dossiers: [], pages: [] }, pageCourante = 0;
  const charges = new Map();
  const pret = boxion ? Promise.all([
    boxion.get('reglages', 'verrous').then(v => { verrous = new Set(Array.isArray(v) ? v : []); }),
    boxion.get('reglages', 'accueil').then(v => { if (v && Array.isArray(v.dossiers)) accueilDoc = { pages: [], ...v }; if (!Array.isArray(accueilDoc.pages)) accueilDoc.pages = []; }),
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
  // la teinte d'un ploxion (chill-tekk : chaque icône de verre a sa couleur, stable, tirée de son id)
  const teinte = (id) => { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return 160 + (h % 160); };
  const tuile = (p) => '<button class="px-tuile' + (edition && !p.interne ? ' px-edite' : '') + '" data-id="' + texte(p.id) + '"><span class="px-ic" style="--t:' + teinte(p.id) + '">' + texte(p.icone || '▣') + '</span><span>' + (verrous.has(p.id) ? '🔒 ' : '') + texte(p.nom || p.id) + '</span></button>';
  const dansDossier = () => new Set([...accueilDoc.dossiers.flatMap(d => d.ids), ...accueilDoc.pages.flatMap(pg => pg.ids)]);

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
    const pages = [
      accueilDoc.dossiers.map((d, i) => '<button class="px-tuile px-dossier" data-dossier="' + i + '"><span class="px-ic">📁</span><span>' + texte(d.nom) + ' (' + d.ids.filter(id => parId.has(id)).length + ')</span></button>').join('')
        + tous.filter(p => !ranges.has(p.id)).map(tuile).join(''),
      ...accueilDoc.pages.map(pg => pg.ids.map(id => parId.get(id)).filter(Boolean).map(tuile).join('')),
    ];
    const noms = ['accueil', ...accueilDoc.pages.map(pg => pg.nom)];
    pageCourante = Math.min(pageCourante, pages.length - 1);
    racine.innerHTML = '<div class="px-accueil"><header class="px-tete"><h1>' + LOGO + '<b>ploxi0n</b></h1><button class="px-modif" data-edition>' + (edition ? 'terminé' : '✎') + '</button></header>'
      + '<div class="px-hud px-visiere"><span class="px-hud-c">' + (hud ? hud.html() : '') + '</span></div>'
      + '<p class="px-sous px-grave">' + (edition ? 'Touche un ploxion : le ranger dans un dossier, sur une page, ou l\'ajouter à l\'écran d\'accueil de l\'iPhone.' : ('◇ cycle ' + (new Date().getFullYear() + 5000) + ' · ' + tous.length + ' ploxions · hors ligne')) + '</p>'
      + '<div class="px-pages">' + pages.map((h, i) => '<section class="px-page" data-page="' + i + '">' + (i ? '<h2 class="px-titre-page">' + texte(noms[i]) + '</h2>' : '') + '<div class="px-grille">' + (h || '<p class="px-sous">page vide</p>') + '</div></section>').join('') + '</div>'
      + (pages.length > 1 ? '<div class="px-points">' + pages.map((_, i) => '<button class="px-point' + (i === pageCourante ? ' on' : '') + '" data-aller="' + i + '" aria-label="' + texte(noms[i]) + '"></button>').join('') + '</div>' : '') + '</div>';
    const conteneur = racine.querySelector('.px-pages');
    if (pageCourante && conteneur.children[pageCourante]) conteneur.scrollLeft = conteneur.children[pageCourante].offsetLeft;
    conteneur.addEventListener('scroll', () => {
      const i = Math.round(conteneur.scrollLeft / Math.max(1, conteneur.clientWidth)); if (i === pageCourante) return;
      pageCourante = i; racine.querySelectorAll('.px-point').forEach((b, k) => b.classList.toggle('on', k === i));
    }, { passive: true });
  }
  function demander(question, defaut) { try { return W.prompt(question, defaut); } catch (er) { return null; } }
  function ranger(id, quoi) {
    const liste = quoi === 'page' ? 'pages' : 'dossiers';
    const actuel = accueilDoc[liste].findIndex(d => d.ids.includes(id));
    let nom = demander(quoi === 'page' ? (actuel >= 0 ? 'Sur quelle page ? (vide = la remettre sur l\'accueil)' : 'Sur quelle page ? (un nom existant ou nouveau)') : (actuel >= 0 ? 'Dossier de ce ploxion (vide = le sortir du dossier)' : 'Ranger dans quel dossier ? (un nom existant ou nouveau)'), actuel >= 0 ? accueilDoc[liste][actuel].nom : '');
    if (nom === null) return;
    nom = String(nom).trim().slice(0, 40);
    // un ploxion vit à un seul endroit : un dossier OU une page (ou l'accueil)
    for (const l of ['dossiers', 'pages']) accueilDoc[l].forEach(d => { d.ids = d.ids.filter(x => x !== id); });
    if (nom) { let d = accueilDoc[liste].find(x => x.nom === nom); if (!d) { d = { nom, ids: [] }; accueilDoc[liste].push(d); } d.ids.push(id); if (quoi === 'page') pageCourante = accueilDoc.pages.indexOf(d) + 1; }
    accueilDoc.dossiers = accueilDoc.dossiers.filter(d => d.ids.length); accueilDoc.pages = accueilDoc.pages.filter(d => d.ids.length);
    if (dossierOuvert !== null && !accueilDoc.dossiers[dossierOuvert]) dossierOuvert = null;
    garder(); accueil();
  }
  function actions(id) {
    const p = parId.get(id); if (!p) return;
    const f = D.createElement('div'); f.className = 'px-voile';
    f.innerHTML = '<div class="px-tiroir"><p class="px-ft"><span class="px-ic">' + texte(p.icone || '▣') + '</span> ' + texte(p.nom || id) + '</p>'
      + (p.interne ? '' : '<button data-ranger="dossier">📁 ranger dans un dossier</button><button data-ranger="page">📄 mettre sur une page</button>')
      + (ecranAccueil ? '<button data-ranger="iphone">⌂ ajouter à l\'écran d\'accueil de l\'iPhone</button>' : '') + '<button data-ranger="">annuler</button></div>';
    racine.appendChild(f);
    f.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ranger]'); if (!b && e.target !== f) return;
      e.stopPropagation(); f.remove();
      const quoi = b ? b.getAttribute('data-ranger') : '';
      if (quoi === 'iphone') ecranAccueil(id); else if (quoi) ranger(id, quoi);
    });
  }
  racine.addEventListener('click', async (e) => {
    const b = e.target.closest('button'); if (!b || !racine.contains(b) || b.closest('.px-hote') || b.closest('.px-voile')) return;
    if (b.hasAttribute('data-compte')) { if (hud) hud.ouvrir(); return; }
    if (b.hasAttribute('data-reglages')) return ouvrir('reglages-app');
    if (b.hasAttribute('data-chercher')) return ouvrir('marketplace', { chercher: '1' });
    if (b.hasAttribute('data-hud-px')) return ouvrir(b.getAttribute('data-hud-px'));
    if (b.hasAttribute('data-edition')) { edition = !edition; return accueil(); }
    if (b.hasAttribute('data-sortir')) { dossierOuvert = null; return accueil(); }
    if (b.hasAttribute('data-dossier')) { dossierOuvert = +b.getAttribute('data-dossier'); return accueil(); }
    if (b.hasAttribute('data-retour')) return accueil();
    if (b.hasAttribute('data-aller')) { const c = racine.querySelector('.px-pages'), i = +b.getAttribute('data-aller'); if (c && c.children[i]) c.scrollTo ? c.scrollTo({ left: c.children[i].offsetLeft, behavior: 'smooth' }) : (c.scrollLeft = c.children[i].offsetLeft); return; }
    const id = b.getAttribute('data-id'); if (!id) return;
    if (!edition) return ouvrir(id);
    actions(id);
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
      + '<span class="px-hud"><span class="px-hud-c">' + (hud ? hud.html(true) : '') + '</span>' + (verrou && !p.interne ? '<button class="px-verrou" data-verrou aria-label="verrou Face ID">' + (verrous.has(id) ? '🔒' : '🔓') + '</button>' : '') + '</span></div><div class="px-hote"></div>';
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
    rafraichirHud() { racine.querySelectorAll('.px-hud-c').forEach(c => { c.innerHTML = hud ? hud.html(!!courant) : ''; }); },
    catalogue: () => [...parId.values()],
    verrous: () => [...verrous],
    /** retirer un verrou Face ID (il faut le visage) */
    async deverrouiller(id) { if (!verrous.has(id)) return true; if (!(verrou && await verrou.ouvrir('Retirer le verrou de ' + ((parId.get(id) || {}).nom || id)))) return false; verrous.delete(id); garder(); return true; },
    /** l'accueil d'origine : plus de dossiers ni de pages */
    reinitialiserAccueil() { accueilDoc = { dossiers: [], pages: [] }; pageCourante = 0; dossierOuvert = null; garder(); },
  };
}
