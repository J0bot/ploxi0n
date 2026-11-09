// ▣ LE CUBE DES PAGES (0.68). RS-7 (14.10) : « mais surtout, le cube c'est une vue pour les ploxions qui ont plusieurs pages ».
// ▣ dans la barre d'un ploxion (ou le geste des bords « cube ») : le ploxion devient l'intérieur d'un cube (la salle de
// src/app/cube-interieur.js, monterSalle). La page où l'on est au fond ; la suivante à droite, la précédente à gauche, +2 au plafond,
// −2 au sol. Penche l'iPhone : on voit les murs. Glisser : le cube tourne (la face d'à côté vient au fond). Toucher une face : elle vient
// au fond. Toucher le fond : on y entre (le vrai ploxion, vivant, sur cette page). ⤢ ou ▣ : on revient comme on était.
// Les faces sans page restent à toi (un xer au choix, comme « dans le cube ») ; l'intérieur se peuple ; gardé par ploxion, boxion_local
// « cubes/<id> ».
// TROUVER LES PAGES (trouverPages), dans l'ordre :
//   1. le contrat : l'instance montée (ce que mount() rend) a pages() → [{ cle, nom, actif }] et allerPage(cle, { muet }) (sans effet de
//      bord : il ne fait que montrer) ; et, si elle veut, garderEtat() → restaurer() (sa recherche, ses filtres : remis à la sortie). Le
//      marketplace et les réglages l'ont ;
//   2. le DOM du ploxion, une LISTE BLANCHE d'onglets (ONGLETS) : [data-page-cube] (pour les auteurs de ploxions, son panneau :
//      [data-page-cube-panneau]), [role=tab] (aria-controls), [data-tab] ↔ [data-pane] (bother), [data-onglet] ↔ [data-panneau],
//      button[data-panel] ↔ [data-panel-c] (couleurs), button[data-vue], button[data-mode] (minuteur) ; la page actuelle : .on, .is-on…
//   3. sinon une seule page : le cube la montre, les autres faces sont des xers.
// NE PAS NUIRE — LE CUBE NE FAIT QUE REGARDER : il ne clique JAMAIS pour photographier. Une page d'onglets se photographie dans le clone
// (son panneau montré, les autres cachés, comme l'onglet le ferait) : le vrai ploxion n'est pas feuilleté (revue 0.68 : bother rechargeait
// sa boîte et perdait la phrase tapée ; le minuteur remettait son chrono à zéro). Un onglet sans panneau connu : pas de photo, son nom.
// Seul le contrat (allerPage, écrit pour ça) change de page derrière la salle ; à la sortie, le ploxion revient à sa page, à son
// défilement, à son état — la salle reste (vide) tant qu'il n'y est pas revenu. On ne clique que pour ENTRER (ton geste, comme toucher
// l'onglet), jamais ce qui agit (DANGER : .danger, désactivé, installer, retirer, envoyer, partager, synchroniser…) ; certains ploxions ne
// sont jamais feuilletés (EXCLUS : la blouse chauffante, pomodoro qui s'en va).
// LES PHOTOS (photographier) : la page clonée, inerte (inert, sans name, sans scripts ni médias ni styles en double, canvas recopiés) ;
// une page n'est que sur une face : la face reçoit LE nœud gardé (pas une copie : un canvas copié perd son dessin). Gardées pour la
// session : rouvrir le cube montre tout de suite les dernières, refaites derrière.
// 💭 (extrapolations, à valider avec RS-7) des faces VIVANTES (une instance par page) ; le cube des pages dans la fractale (chaque ploxion
// a son cube) ; une page tirée hors du cube devient un ploxion à elle (la mitose) ; des pages venues d'autres ploxions (le craft) ;
// les pages d'un xer du labo (/px/<id>/*.html) comme faces.
import { monterSalle, facesDesPages } from './cube-interieur.js';

const guil = (v) => String(v).replace(/["\\]/g, '\\$&');
// [onglets, attribut, (valeur) → le sélecteur de son panneau, ou null]
export const ONGLETS = [
  ['[data-page-cube]', 'data-page-cube', (v) => '[data-page-cube-panneau="' + guil(v) + '"]'],
  ['[role="tab"]', 'role', null],   // le panneau : son aria-controls (voir panneauDe)
  ['[data-tab]', 'data-tab', (v) => '[data-pane="' + guil(v) + '"]'],
  ['[data-onglet]', 'data-onglet', (v) => '[data-panneau="' + guil(v) + '"]'],
  ['button[data-panel]', 'data-panel', (v) => '[data-panel-c="' + guil(v) + '"]'],
  ['button[data-vue]', 'data-vue', null], ['button[data-mode]', 'data-mode', null]];
const CLASSES = ['on', 'is-on', 'active', 'actif', 'selected', 'is-active'];
const ACTIF = CLASSES.map(c => '.' + c).join(',') + ',[aria-selected="true"],[aria-pressed="true"],[aria-current]:not([aria-current="false"])';
export const DANGER = '.danger,.px-danger,[disabled],[aria-disabled="true"],[data-installer],[data-retirer],[data-garder],[data-passer],[data-ajour],[data-maj],'
  + '[data-orphelins],[data-a],[data-go],[data-init],[data-sr],[data-partage],[data-synchro],[data-autoriser],[data-ouvrir],[data-plus],[data-vite],[data-pin],[data-pv],[data-accueil],[data-p]';
export const EXCLUS = new Set(['cape', 'labo-cape', 'pomodoro', 'cube-interieur']);
const nomDe = (e) => (e.getAttribute('aria-label') || e.getAttribute('title') || e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 32);
const valeur = (e, attr) => (attr === 'role' ? (e.getAttribute('aria-controls') || e.id || nomDe(e)) : e.getAttribute(attr));
const panneauDe = (e, attr, f, v) => (attr === 'role' ? (e.getAttribute('aria-controls') ? '[id="' + guil(e.getAttribute('aria-controls')) + '"]' : null) : f ? f(v) : null);

/** les pages d'un ploxion monté : { source: 'api'|'dom'|'seule', pages: [{ cle, nom, sel?, attr?, val?, panneau? }], i, photo } */
export function trouverPages(hote, inst, id) {
  const seule = { source: 'seule', pages: [{ cle: '', nom: 'cette page' }], i: 0, photo: false };
  if (!hote || EXCLUS.has(id)) return seule;
  if (inst && typeof inst.pages === 'function' && typeof inst.allerPage === 'function') {
    try { const l = inst.pages(); if (Array.isArray(l) && l.length > 1) return { source: 'api', pages: l.map(p => ({ cle: String(p.cle), nom: String(p.nom || p.cle) })), i: Math.max(0, l.findIndex(p => p.actif)), photo: true }; } catch (e) { /* le contrat cassé : on regarde le DOM */ }
  }
  for (const [sel, attr, f] of ONGLETS) {
    const vus = new Map();
    for (const e of hote.querySelectorAll(sel)) {
      if (e.closest('[hidden]') || e.matches(DANGER) || (e.style && e.style.display === 'none')) continue;
      if ((e.textContent || '').trim().length > 40) continue;   // un panneau, pas un onglet
      const v = valeur(e, attr); if (!v || vus.has(v)) continue; vus.set(v, e);
    }
    if (vus.size < 2 || vus.size > 24) continue;
    const pages = [...vus].map(([v, e]) => { const pn = panneauDe(e, attr, f, v); return { cle: attr + '=' + v, nom: nomDe(e) || v, sel, attr, val: v, panneau: pn && hote.querySelector(pn) ? pn : null }; });
    // une photo seulement si CHAQUE onglet a son panneau dans le DOM (on la prend dans le clone, sans rien cliquer)
    return { source: 'dom', pages, i: Math.max(0, pages.findIndex(p => vus.get(p.val).matches(ACTIF))), photo: pages.every(p => p.panneau) };
  }
  return seule;
}

/** aller à une page : le contrat, ou toucher son onglet (seulement pour y ENTRER — jamais ce qui agit) */
export async function allerPage(hote, inst, p, o = {}) {
  if (!p || p.cle === '') return true;
  if (!p.sel) { if (inst && typeof inst.allerPage === 'function') { await inst.allerPage(p.cle, o); return true; } return false; }
  const e = [...hote.querySelectorAll(p.sel)].find(x => valeur(x, p.attr) === p.val && !x.matches(DANGER)); if (!e) return false;
  e.click(); return true;
}

/** le DOM se pose : plus de mutation depuis `silence` ms (au plus `max` ms) */
export function calme(W, el, { silence = 90, max = 700 } = {}) {
  return new Promise((r) => {
    let fini = false, t = 0, ob = null;
    const fin = () => { if (fini) return; fini = true; W.clearTimeout(t); W.clearTimeout(m); if (ob) ob.disconnect(); r(); };
    const m = W.setTimeout(fin, max); t = W.setTimeout(fin, silence);
    if (W.MutationObserver) { ob = new W.MutationObserver(() => { W.clearTimeout(t); t = W.setTimeout(fin, silence); }); ob.observe(el, { subtree: true, childList: true, attributes: true, characterData: true }); }
  });
}

/** recopier le dessin des canvas (un canvas cloné est vide) */
export function copierCanvas(src, dst) {
  const a = src.querySelectorAll('canvas'), b = dst.querySelectorAll('canvas'); if (a.length !== b.length) return;
  b.forEach((d, i) => { const s = a[i]; try { if (!s.width || !s.height) return; d.width = s.width; d.height = s.height; const c = d.getContext && d.getContext('2d'); if (c && c.drawImage) c.drawImage(s, 0, 0); } catch (e) { /* */ } });
}
/** la photo d'une page : son DOM cloné, inerte ; ses valeurs et ses canvas recopiés ; `avant(z)` la retouche avant le ménage */
export function photographier(W, hote, avant = null) {
  // px-hote : le thème de l'app habille le contenu des ploxions sous .px-hote (pas enfant direct de la scène : ni le routeur ni la
  // fractale ne la prennent pour un hôte, ils cherchent .px-scene>.px-hote ou le premier dans l'ordre, le vrai)
  const D = W.document, z = D.createElement('div'); z.className = 'px-hote ci-cliche';
  try { const cs = W.getComputedStyle(hote); if (cs && cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') z.style.backgroundColor = cs.backgroundColor; } catch (e) { /* */ }
  for (const n of hote.childNodes) z.appendChild(n.cloneNode(true));
  const src = hote.querySelectorAll('input,textarea,select'), dst = z.querySelectorAll('input,textarea,select');
  if (src.length === dst.length) dst.forEach((d, k) => { const s = src[k]; try { if (d.type === 'checkbox' || d.type === 'radio') d.checked = s.checked; else if (d.type !== 'file') d.value = s.value; } catch (e) { /* */ } });
  copierCanvas(hote, z);
  if (avant) { try { avant(z); } catch (e) { /* */ } }
  z.querySelectorAll('[hidden],script,style,link,template,noscript').forEach(x => x.remove());
  z.querySelectorAll('iframe,video,audio,object,embed').forEach(x => { const r = D.createElement('div'); r.className = 'ci-media'; r.textContent = x.tagName === 'IFRAME' ? '▣' : '▶'; x.replaceWith(r); });
  z.querySelectorAll('[name],[autofocus]').forEach(x => { x.removeAttribute('name'); x.removeAttribute('autofocus'); });
  z.setAttribute('inert', ''); z.setAttribute('aria-hidden', 'true');
  return z;
}
/** la page k d'onglets, photographiée SANS rien cliquer : dans le clone, son onglet et son panneau prennent la marque de l'actuel */
export function photoDuPanneau(W, hote, t, k) {
  const cur = t.pages[t.i], ongletCur = [...hote.querySelectorAll(cur.sel)].find(x => valeur(x, cur.attr) === cur.val), panCur = hote.querySelector(cur.panneau);
  const marque = (el) => (el ? CLASSES.filter(c => el.classList.contains(c)) : []);
  const mo = marque(ongletCur), mp = marque(panCur);
  const autre = t.pages.find((p, j) => j !== t.i), panAutre = autre && hote.querySelector(autre.panneau);
  const parHidden = !!(panAutre && panAutre.hidden && panCur && !panCur.hidden), affCur = panCur ? panCur.style.display : '', affAutre = panAutre ? panAutre.style.display : '';
  return photographier(W, hote, (z) => t.pages.forEach((p, j) => {
    const on = j === k;
    for (const o of z.querySelectorAll(p.sel)) if (valeur(o, p.attr) === p.val) { mo.forEach(c => o.classList.toggle(c, on)); if (o.hasAttribute('aria-selected')) o.setAttribute('aria-selected', String(on)); }
    for (const q of z.querySelectorAll(p.panneau)) {
      mp.forEach(c => q.classList.toggle(c, on));
      if (parHidden) q.hidden = !on;
      if (affAutre === 'none') q.style.display = on ? affCur : 'none';
    }
  }));
}

export function creerCubePages({ W = globalThis.window, boxion = null, vibrer = () => {}, liste = () => [], vivants = () => [], tsoins = async () => [], aller = () => {}, icone, glyphe } = {}) {
  const D = W.document, cache = new Map();   // id → Map(cle → photo) : pour la session
  let ici = null, seq = 0, attente = null, retour = Promise.resolve();
  const lire = async (id) => { const v = boxion ? await boxion.get('cubes', id).catch(() => null) : null;
    return { faces: { fond: 'trait', gauche: 'trait', droite: 'trait', plafond: 'trait', sol: 'trait', ...((v && v.faces) || {}) }, objets: Array.isArray(v && v.objets) ? v.objets : [], images: (v && v.images) || {} }; };
  const attendreMs = (ms) => new Promise(r => W.setTimeout(r, ms));
  const nommer = (k, t) => { const c = D.createElement('div'); c.className = 'ci-cliche ci-sans-photo'; c.innerHTML = '<p>▤</p><b></b><small>touche le fond pour y aller</small>'; c.querySelector('b').textContent = t.pages[k].nom; return c; };

  // le contrat seulement (le DOM se photographie sans rien toucher) : allerPage derrière la salle, une page à la fois
  function photographierAutour(moi, i) {
    if (moi.t.source !== 'api') return moi.file;
    const n = moi.t.pages.length, ordre = [...new Set([...Object.values(facesDesPages(n, i)), ...(n <= 12 ? [...Array(n).keys()] : [])])];
    for (const k of ordre) {
      if (moi.frais.has(k)) continue; moi.frais.add(k);
      moi.file = moi.file.then(async () => {
        if (moi.stop) return;
        if (!(await allerPage(moi.hote, moi.inst, moi.t.pages[k], { muet: true }))) return;
        moi.surPage = k; await calme(W, moi.hote); if (moi.stop) return;
        moi.photos.set(moi.t.pages[k].cle, photographier(W, moi.hote)); moi.salle.majPhoto(k);
      }).catch(() => {});
    }
    return moi.file;
  }
  // revenir comme on était : sa page (ou son état entier, par le contrat), son défilement
  async function remettre(moi) {
    if (moi.restaurer) { try { await moi.restaurer(); } catch (e) { /* */ } }
    else if (moi.surPage !== moi.t.i) await allerPage(moi.hote, moi.inst, moi.t.pages[moi.t.i], { muet: true });
    try { moi.hote.scrollTop = moi.defile; } catch (e) { /* */ }
  }
  const visible = (h) => h && h.isConnected !== false && !h.hidden;
  /** ▣ : le ploxion { id, hote, inst } devient son cube (dans `dans`, par-dessus l'hôte) ; rend l'id, ou false */
  async function ouvrir({ id, hote, inst = null, dans = null }) {
    if (ici || attente) fermer();
    if (!hote) return false;
    const j = ++seq; attente = id;   // ouvert() le dit déjà : un second ▣, un bord, changer d'app l'annulent (seq)
    if (inst && inst.ready && typeof inst.ready.then === 'function') await Promise.race([inst.ready.catch(() => {}), attendreMs(1500)]);
    await Promise.race([retour, attendreMs(1500)]);   // le cube d'avant a fini de remettre le ploxion en place
    if (j !== seq) return false;
    attente = null; if (!visible(hote)) return false;
    const t = trouverPages(hote, inst, id);
    const photos = cache.get(id) || new Map(); cache.set(id, photos);
    const moi = { id, hote, inst, t, photos, file: Promise.resolve(), stop: false, entre: false, surPage: t.i, frais: new Set([t.i]), defile: hote.scrollTop || 0, restaurer: null, aria: hote.getAttribute('aria-hidden') };
    if (t.source === 'api') { try { if (typeof inst.garderEtat === 'function') moi.restaurer = inst.garderEtat(); } catch (e) { /* */ } }
    photos.set(t.pages[t.i].cle, photographier(W, hote));
    const el = D.createElement('div'); el.className = 'px-cube-pages'; el.dataset.cube = id;
    (dans || hote.parentNode).appendChild(el); moi.el = el;
    hote.setAttribute('aria-hidden', 'true');   // VoiceOver : le ploxion dessous ne se lit pas pendant le cube
    const ctl = { n: () => t.pages.length, i: t.i, nom: (k) => t.pages[k].nom,
      photo: (k) => {
        if (t.source === 'dom' && t.photo && !moi.frais.has(k)) { moi.frais.add(k); photos.set(t.pages[k].cle, photoDuPanneau(W, hote, t, k)); }
        return photos.get(t.pages[k].cle) || (t.photo ? null : nommer(k, t));
      },
      entrer: (k) => entrer(moi, k), sortir: () => fermer(), tourne: (k) => photographierAutour(moi, k) };
    ici = moi;
    moi.salle = monterSalle(el, { W, lire: () => lire(id), garder: (e) => { if (boxion) boxion.put('cubes', id, e).catch(() => {}); }, liste, vivants, tsoins,
      aller: (x) => { fermer(); aller(x); }, vibrer, icone, glyphe, pages: ctl, profondeur: 1,
      aide: t.pages.length > 1 ? 'glisse : le cube tourne · touche le fond : tu y entres' : 'une seule page ici : les autres faces sont à toi (touche une étiquette)' });
    vibrer('fx-cube');
    moi.salle.pret.then(() => { if (ici === moi) photographierAutour(moi, t.i); });
    return id;
  }
  async function entrer(moi, k) {
    if (ici !== moi) return;
    moi.entre = true; moi.stop = true; await moi.file;
    if (ici !== moi) return;
    if (k === moi.t.i) await remettre(moi);
    else { await allerPage(moi.hote, moi.inst, moi.t.pages[k], { muet: true }); try { moi.hote.scrollTop = 0; } catch (e) { /* */ } }
    if (ici === moi) fermer();
  }
  /** referme le cube (ou annule une ouverture en attente) ; le ploxion revient comme il était, sauf si l'on est entré dans une page.
   *  La salle (vidée) reste par-dessus tant qu'il n'y est pas revenu ; cachée ou fermée, l'app ne la montre pas : partie tout de suite. */
  function fermer() {
    seq++; attente = null;
    const moi = ici; if (!moi) return false; ici = null; moi.stop = true;
    try { moi.salle.unmount(); } catch (e) { /* */ }
    const fin = () => { moi.el.remove(); if (moi.aria == null) moi.hote.removeAttribute('aria-hidden'); else moi.hote.setAttribute('aria-hidden', moi.aria); };
    if (moi.entre || !visible(moi.hote)) { fin(); retour = moi.entre ? Promise.resolve() : moi.file.then(() => remettre(moi)).catch(() => {}); return true; }
    retour = moi.file.then(() => remettre(moi)).catch(() => {}).then(fin);
    return true;
  }
  return {
    ouvrir, fermer, ouvert: () => (ici ? ici.id : attente),
    /** pour les essais : la salle et les pages du cube ouvert ; la remise en place */
    salle: () => (ici ? ici.salle : null), pages: () => (ici ? ici.t : null), photos: () => (ici ? ici.file : Promise.resolve()), retour: () => retour,
  };
}
