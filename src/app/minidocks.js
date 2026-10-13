// ▤ LES MINI DOCKS (0.51, RS-7 13.10 : « c'est magnifique le mini dock, j'adore tellement ; il faut que tout puisse être minimisé en mini
// dock, et avoir une page de tous les mini docks »). Le mini-lecteur de 0.48 devient un cas d'un système général :
//   - chaque ploxion minimisé (▁, un bord, un autre ouvert par-dessus) devient un mini dock au-dessus du dock : son icône, son nom, une
//     ligne vivante, ses actions ; le toucher le reprend ; le glisser de côté le ferme (le droit au silence) ;
//   - ce qui n'est pas un ploxion se minimise aussi : la musique (♫ ⏮ ⏯ ⏭), la blouse (🥼 températures, consigne, ⏻), la Santé (les pas),
//     la vidéo qu'on reprendra (🎞), le vocal qui enregistre (🎙 ■), le tsoin pas fini (⧗ brouillon) ;
//   - les ploxions et les bions publient le leur : jOSMiniDock.publier({ cle, ploxion, titre, sous, image, icone, progression, enCours,
//     actions: [{ id, icone, nom, faire }], ouvrir, fermer }) ; une action sans « faire » revient au ploxion par le bus
//     (jOSPorts : ploxion.<id>.minidock, { cle, action }) et par jOSMiniDock.surAction(cle, f) ;
//   - au-dessus du dock : prefs.miniDocks au plus (2 par défaut ; 0 = seulement ▤), ce qui joue d'abord, puis le plus récent ; « ▤ +N »
//     ouvre LA PAGE DE TOUS LES MINI DOCKS (une feuille : chacun avec toutes ses actions et ✕, les endormis 💤, « tout fermer »). ⧉ (la
//     barre d'un ploxion, le geste « basculer ») ouvre cette page ; elle remplace la rangée « en arrière-plan » de l'accueil.
// Le DOM : .px-md (dans <body>, après #ploxi0n : caché hors de l'accueil) ; <html> porte --px-md (la hauteur de la pile, pour l'accueil).
import { glyphe, glyphePloxion, versGlyphe } from './glyphes.js';
import { svgXerkion } from './xerkion-icone.js';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const teinte = (id) => { let h = 0; for (const c of String(id || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0; return 160 + (h % 160); };   // comme les tuiles
export const HAUTEUR = 58;   // une rangée de la pile (52 + l'écart), en px
const MAX_ACTIONS_PILE = 3;

/** une entrée publiée, nettoyée (ce qu'un ploxion envoie n'est pas forcément propre) */
export function normaliser(o, ici = null) {
  if (!o || typeof o !== 'object') return null;
  const ploxion = typeof o.ploxion === 'string' ? o.ploxion.slice(0, 80) : (ici || null);
  const cle = String(o.cle || o.id || ploxion || '').slice(0, 80); if (!cle) return null;
  const actions = (Array.isArray(o.actions) ? o.actions : []).filter(a => a && (a.id != null)).slice(0, 6)
    .map(a => ({ id: String(a.id).slice(0, 40), icone: String(a.icone || a.nom || a.id).slice(0, 8), nom: String(a.nom || a.id).slice(0, 40), faire: typeof a.faire === 'function' ? a.faire : null, on: !!a.on }));
  const p = +o.progression;
  return { cle, ploxion, titre: String(o.titre || ploxion || cle).slice(0, 80), sous: o.sous == null ? '' : String(o.sous).slice(0, 140),
    image: typeof o.image === 'string' && /^(https?:|data:image\/|capacitor:|blob:)/i.test(o.image) ? o.image : '', icone: String(o.icone || '').slice(0, 8),
    progression: Number.isFinite(p) ? Math.max(0, Math.min(1, p)) : null, enCours: !!o.enCours, persiste: !!o.persiste, actions,
    ouvrir: typeof o.ouvrir === 'function' ? o.ouvrir : null, fermer: typeof o.fermer === 'function' ? o.fermer : null, fermable: o.fermable !== false };
}

export function creerMiniDocks({ W = globalThis.window, routeur = () => null, prefs = () => ({}), vibrer = () => {} } = {}) {
  const D = W.document;
  const publies = new Map();   // cle → entrée normalisée (+ maj)
  const surActions = new Map(), abonnes = new Set();
  let pile = null, page = null, minute = null, connus = new Set(), glisse = null, avalerClic = 0;
  const R = () => { try { return routeur() || null; } catch (e) { return null; } };
  const infoPx = (id) => { const r = R(); const p = r && r.catalogue ? r.catalogue().find(x => x.id === id) : null; return p || { id, nom: id, icone: '▣' }; };

  // ---- la liste : les publiées, puis les ploxions vivants qui n'en ont pas, puis les endormis ------------------------------------------
  function liste() {
    const r = R(), viv = r && r.etatVivants ? r.etatVivants() : [], ici = r && r.courant ? r.courant() : null;
    const out = [], pris = new Set();
    for (const m of publies.values()) { out.push({ ...m, vivant: !!m.ploxion && viv.some(v => v.id === m.ploxion), ici: !!m.ploxion && m.ploxion === ici }); if (m.ploxion) pris.add(m.ploxion); }
    for (const v of viv) {
      if (pris.has(v.id)) continue; const p = infoPx(v.id);
      out.push({ cle: 'px:' + v.id, ploxion: v.id, auto: true, titre: p.nom || v.id, icone: p.icone || '▣', image: '', sous: v.id === ici ? 'ici' : (v.son ? 'joue en arrière-plan' : 'en arrière-plan'),
        actions: [], enCours: !!v.son, maj: v.vu || 0, vivant: true, ici: v.id === ici, fermable: true, progression: null });
    }
    for (const id of (r && r.endormis ? r.endormis() : [])) {
      if (pris.has(id) || viv.some(v => v.id === id)) continue; const p = infoPx(id);
      out.push({ cle: 'zz:' + id, ploxion: id, auto: true, endormi: true, titre: p.nom || id, icone: p.icone || '▣', image: '', sous: 'endormi · touche pour le réveiller', actions: [], maj: 0, fermable: true, progression: null });
    }
    // ce qui joue d'abord, puis le plus récent ; les endormis au bout
    return out.sort((a, b) => (!!a.endormi - !!b.endormi) || (!!b.enCours - !!a.enCours) || ((b.maj || 0) - (a.maj || 0)));
  }
  const trouver = (cle) => liste().find(m => m.cle === cle) || null;

  // ---- dessiner ------------------------------------------------------------------------------------------------------------------------
  const icone = (m) => (m.image ? '<img alt="" src="' + esc(m.image) + '">' : '<span class="px-md-g">' + (m.auto && m.ploxion ? (prefs().xerkions === false ? glyphePloxion({ id: m.ploxion, nom: m.titre }) : svgXerkion({ id: m.ploxion, nom: m.titre })) : versGlyphe(m.icone || 'ion')) + '</span>');   // ◇ (0.54) des glyphes
  function carte(m, complet) {
    const acts = complet ? m.actions : m.actions.slice(0, MAX_ACTIONS_PILE);
    return '<div class="px-md-c' + (m.enCours ? ' joue' : '') + (m.endormi ? ' dort' : '') + (m.ici ? ' ici' : '') + (!complet && !connus.has(m.cle) ? ' neuf' : '') + '" data-md="' + esc(m.cle) + '" style="--t:' + teinte(m.ploxion || m.cle) + '" role="group" aria-label="' + esc(m.titre) + '">'
      + '<span class="px-md-ic">' + icone(m) + '</span>'
      + '<span class="px-md-t"><b>' + esc(m.titre) + '</b><small>' + esc(m.sous || '') + '</small>' + (m.progression != null ? '<i class="px-md-pr"><i style="width:' + Math.round(m.progression * 100) + '%"></i></i>' : '') + '</span>'
      + acts.map(a => '<button type="button" data-md-a="' + esc(a.id) + '"' + (a.on ? ' class="on"' : '') + ' aria-label="' + esc(a.nom) + '">' + versGlyphe(a.icone) + '</button>').join('')
      + ((complet || !acts.length) && m.fermable !== false ? '<button type="button" class="px-md-x" data-md-x aria-label="' + (m.endormi ? 'oublier' : 'fermer') + '">' + glyphe('fermer') + '</button>' : '')
      + '</div>';
  }
  function max() { const n = +((prefs() || {}).miniDocks); return Number.isFinite(n) ? Math.max(0, Math.min(4, n)) : 2; }
  function dessiner() {
    minute = null;
    if (!D.body) return;
    if (glisse) { planifier(); return; }   // pas sous le doigt
    const l = liste().filter(m => !m.ici), vus = l.filter(m => !m.endormi).slice(0, max()), caches = l.length - vus.length;
    if (!pile) {
      pile = D.createElement('div'); pile.className = 'px-md'; pile.setAttribute('role', 'region'); pile.setAttribute('aria-label', 'mini docks');
      brancher(pile, false); D.body.appendChild(pile);
    }
    pile.hidden = !l.length;
    pile.innerHTML = vus.map(m => carte(m, false)).join('') + (l.length ? '<button type="button" class="px-md-tous" data-md-page aria-label="tous les mini docks">' + glyphe('minidocks') + (caches > 0 ? ' +' + caches : '') + '</button>' : '');
    for (const img of pile.querySelectorAll('img')) img.onerror = () => { const s = D.createElement('span'); s.className = 'px-md-g'; s.innerHTML = glyphe('musique'); img.replaceWith(s); };
    connus = new Set(vus.map(m => m.cle));
    try { D.documentElement.style.setProperty('--px-md', (l.length ? vus.length * HAUTEUR + 34 : 0) + 'px'); } catch (e) { /* */ }
    if (page) peindrePage();
    for (const f of abonnes) { try { f(l); } catch (e) { /* */ } }
  }
  function planifier() { if (!minute) minute = W.setTimeout(dessiner, 40); }

  // ---- les gestes : toucher = reprendre ; une action ; ✕ ; glisser de côté = fermer ---------------------------------------------------
  function brancher(el, dansPage) {
    el.addEventListener('click', (e) => {
      if (avalerClic && Date.now() - avalerClic < 500) { avalerClic = 0; e.stopPropagation(); return; }
      if (e.target.closest('[data-md-page]')) { e.stopPropagation(); vibrer('selection'); return ouvrirPage(); }
      const c = e.target.closest('[data-md]'); if (!c) return;
      e.stopPropagation();
      const m = trouver(c.getAttribute('data-md')); if (!m) return planifier();
      const a = e.target.closest('[data-md-a]');
      if (a) return agir(m, a.getAttribute('data-md-a'));
      if (e.target.closest('[data-md-x]')) { fermerMd(m); if (dansPage && !liste().length) fermerPage(); return; }
      if (dansPage) fermerPage();
      reprendre(m);
    });
    if (dansPage) return;
    // glisser une carte de côté (au-delà de 90 px) : fermée
    el.addEventListener('pointerdown', (e) => {
      const c = e.target.closest('[data-md]'); if (!c || e.target.closest('button')) return;
      glisse = { c, x0: e.clientX, y0: e.clientY, id: e.pointerId, dx: 0 };
    });
    el.addEventListener('pointermove', (e) => {
      if (!glisse || e.pointerId !== glisse.id) return;
      glisse.dx = e.clientX - glisse.x0;
      if (Math.abs(glisse.dx) > 8 && Math.abs(glisse.dx) > Math.abs(e.clientY - glisse.y0)) { glisse.c.style.transform = 'translateX(' + glisse.dx + 'px)'; glisse.c.style.opacity = String(Math.max(0.2, 1 - Math.abs(glisse.dx) / 220)); }
    });
    const lacher = () => {
      if (!glisse) return; const g = glisse; glisse = null;
      if (Math.abs(g.dx) > 90) { avalerClic = Date.now(); const m = trouver(g.c.getAttribute('data-md')); if (m && m.fermable !== false) { vibrer('minimiser'); fermerMd(m); return; } }
      if (Math.abs(g.dx) > 8) avalerClic = Date.now();
      g.c.style.transform = ''; g.c.style.opacity = '';
    };
    el.addEventListener('pointerup', lacher); el.addEventListener('pointercancel', lacher);
  }
  function reprendre(m) {
    const r = R();
    try {
      if (m.ouvrir) return m.ouvrir();
      if (!m.ploxion || !r) return;
      if (m.ici) return;
      if (m.endormi && r.reveiller) return r.reveiller(m.ploxion);
      return r.ouvrir(m.ploxion);
    } catch (e) { /* */ }
  }
  function agir(m, id) {
    const a = (m.actions || []).find(x => x.id === id); if (!a) return;
    vibrer('selection');
    try { if (a.faire) { const r = a.faire(); if (r && r.catch) r.catch(() => {}); } } catch (e) { /* l'action a refusé */ }
    if (!a.faire) {
      for (const f of surActions.get(m.cle) || []) { try { f(id, { ...m }); } catch (e) { /* */ } }
      try { if (W.jOSPorts && W.jOSPorts.emit) W.jOSPorts.emit(m.ploxion || 'minidock', 'minidock', { cle: m.cle, action: id }); } catch (e) { /* */ }
    }
    planifier();
  }
  /** ✕ : un ploxion vivant est fermé (démonté) ; une publiée est retirée (et son « fermer » appelé) ; un endormi est oublié */
  function fermerMd(m) {
    const r = R();
    if (m.endormi) { if (r && r.oublierEndormi) r.oublierEndormi(m.ploxion); planifier(); return; }
    if (publies.has(m.cle)) retirer(m.cle, true);
    if (m.ploxion && r && (m.vivant || m.auto) && r.fermerPloxion) r.fermerPloxion(m.ploxion);
    planifier();
  }

  // ---- la page de tous les mini docks ----------------------------------------------------------------------------------------------
  function peindrePage() {
    if (!page) return;
    const l = liste(), actifs = l.filter(m => !m.endormi), dorment = l.filter(m => m.endormi);
    page.querySelector('.px-md-page').innerHTML = '<p class="px-ft">' + glyphe('minidocks') + ' mini docks · ' + actifs.length + '</p>'
      + (actifs.length ? '<div class="px-md-l">' + actifs.map(m => carte(m, true)).join('') + '</div>' : '<p class="px-sous">Rien en arrière-plan. ▁ dans la barre d\'un ploxion le range ici, vivant.</p>')
      + (dorment.length ? '<p class="px-grave">endormis · la dernière session</p><div class="px-md-l">' + dorment.map(m => carte(m, true)).join('') + '</div>' : '')
      + '<div class="px-md-bas">' + (l.some(m => !m.ici && m.fermable !== false) ? '<button type="button" class="px-md-tout" data-md-tout>tout fermer</button>' : '') + '<button type="button" class="px-md-ok" data-md-ok>fermer</button></div>';
  }
  function ouvrirPage() {
    if (page) return peindrePage();
    page = D.createElement('div'); page.className = 'px-voile px-md-voile';
    page.innerHTML = '<div class="px-tiroir px-md-page" role="dialog" aria-label="tous les mini docks"></div>';
    page.addEventListener('click', (e) => {
      if (e.target === page || e.target.closest('[data-md-ok]')) { e.stopPropagation(); return fermerPage(); }
      if (e.target.closest('[data-md-tout]')) {
        e.stopPropagation(); vibrer('minimiser');
        for (const m of liste()) if (!m.ici && m.fermable !== false) fermerMd(m);
        return fermerPage();
      }
    });
    brancher(page, true);
    D.body.appendChild(page);   // dans <body>, au-dessus de la pile (dans #ploxi0n, son contexte d'empilement la mettait dessous)
    peindrePage();
  }
  function fermerPage() { if (page) { page.remove(); page = null; } }

  // ---- l'API -----------------------------------------------------------------------------------------------------------------------------
  function publier(o) {
    const r = R(), m = normaliser(o, r && r.courant ? r.courant() : null); if (!m) return null;
    const avant = publies.get(m.cle);
    publies.set(m.cle, { ...m, maj: avant && !(m.enCours && !avant.enCours) ? avant.maj : Date.now() });   // se met à jouer : remonte en tête
    planifier(); return m.cle;
  }
  function retirer(cle, appelerFermer = false) {
    const m = publies.get(String(cle)); if (!m) return false;
    publies.delete(String(cle));
    if (appelerFermer && m.fermer) { try { m.fermer(); } catch (e) { /* */ } }
    planifier(); return true;
  }
  /** un ploxion vient d'être fermé (le routeur) : ses mini docks partent avec lui (sauf « persiste ») */
  function surFermeture(id) {
    for (const m of [...publies.values()]) if (m.ploxion === id && !m.persiste) retirer(m.cle, true);
    planifier();
  }

  const api = {
    publier, retirer: (cle) => retirer(cle, false),
    liste: () => liste().map(({ ouvrir, fermer, ...m }) => ({ ...m, actions: m.actions.map(({ faire, ...a }) => a) })),
    surAction: (cle, f) => { const k = String(cle); if (!surActions.has(k)) surActions.set(k, new Set()); surActions.get(k).add(f); return () => surActions.get(k) && surActions.get(k).delete(f); },
    ecouter: (f) => { abonnes.add(f); return () => abonnes.delete(f); },
    page: ouvrirPage,
  };
  return { api, publier, retirer, liste, dessiner, planifier, surFermeture, ouvrirPage, fermerPage, agir: (cle, id) => { const m = trouver(cle); if (m) agir(m, id); } };
}
