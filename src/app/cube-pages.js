// ▣ LE CUBE DES PAGES (0.68). RS-7 (14.10) : « mais surtout, le cube c'est une vue pour les ploxions qui ont plusieurs pages ».
// ▣ dans la barre d'un ploxion (ou le geste des bords « cube ») : le ploxion devient l'intérieur d'un cube (la salle de
// src/app/cube-interieur.js, monterSalle). La page où l'on est au fond ; la suivante à droite, la précédente à gauche, +2 au plafond,
// −2 au sol. Penche l'iPhone : on voit les murs. Glisser : le cube tourne (la face d'à côté vient au fond). Toucher une face : elle vient
// au fond. Toucher le fond : on y entre (le vrai ploxion, vivant, sur cette page). ⤢ ou ▣ : on revient comme on était.
// Les faces sans page restent à toi (un xer au choix, comme « dans le cube ») ; l'intérieur se peuple ; gardé par ploxion, boxion_local
// « cubes/<id> ».
// TROUVER LES PAGES (trouverPages), dans l'ordre :
//   1. le contrat : l'instance montée (ce que mount() rend) a pages() → [{ cle, nom, actif }] et allerPage(cle, { muet }) ; et, si elle
//      veut, garderEtat() → restaurer() (sa recherche, ses filtres : remis à la sortie). Le marketplace et les réglages l'ont ;
//   2. le DOM du ploxion, une LISTE BLANCHE d'onglets (ONGLETS) : [data-page-cube] (pour les auteurs de ploxions), [role=tab],
//      [data-tab] (bother), [data-onglet], button[data-panel] (couleurs), button[data-vue], button[data-mode] (minuteur : jamais
//      photographié tout seul, changer de mode y remet le chrono à zéro) ; la page actuelle : .on, .is-on, .active, aria-selected… ;
//   3. sinon une seule page : le cube la montre, les autres faces sont des xers.
// NE PAS NUIRE : on ne clique jamais ce qui agit (DANGER : .danger, désactivé, installer, retirer, envoyer, partager, synchroniser…) ;
// certains ploxions ne sont jamais feuilletés (EXCLUS : la blouse chauffante, pomodoro qui s'en va) ; à la sortie, le ploxion revient à
// sa page, à son défilement, à son état.
// LES PHOTOS (photographier) : la page clonée, inerte (inert, sans name, sans scripts ni médias ni styles en double, canvas recopiés),
// prises une à une DERRIÈRE la salle (l'hôte reste dessous, caché par elle) : d'abord le fond et ses voisines, puis le reste (≤ 12
// pages ; au-delà, celles qui arrivent quand le cube tourne). Gardées pour la session : rouvrir le cube les montre tout de suite.
// 💭 (extrapolations, à valider avec RS-7) des faces VIVANTES (une instance par page) ; le cube des pages dans la fractale (chaque ploxion
// a son cube) ; une page tirée hors du cube devient un ploxion à elle (la mitose) ; des pages venues d'autres ploxions (le craft) ;
// les pages d'un xer du labo (/px/<id>/*.html) comme faces.
import { monterSalle, facesDesPages } from './cube-interieur.js';

export const ONGLETS = [['[data-page-cube]', 'data-page-cube'], ['[role="tab"]', 'role'], ['[data-tab]', 'data-tab'], ['[data-onglet]', 'data-onglet'],
  ['button[data-panel]', 'data-panel'], ['button[data-vue]', 'data-vue'], ['button[data-mode]', 'data-mode', { photo: false }]];
const ACTIF = '.on,.is-on,.active,.actif,.selected,.is-active,[aria-selected="true"],[aria-pressed="true"],[aria-current]:not([aria-current="false"])';
export const DANGER = '.danger,.px-danger,[disabled],[aria-disabled="true"],[data-installer],[data-retirer],[data-garder],[data-passer],[data-ajour],[data-maj],'
  + '[data-orphelins],[data-a],[data-go],[data-init],[data-sr],[data-partage],[data-synchro],[data-autoriser],[data-ouvrir],[data-plus],[data-vite],[data-pin],[data-pv],[data-accueil],[data-p]';
export const EXCLUS = new Set(['cape', 'labo-cape', 'pomodoro', 'cube-interieur']);
const nomDe = (e) => (e.getAttribute('aria-label') || e.getAttribute('title') || e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 32);
const valeur = (e, attr) => (attr === 'role' ? (e.getAttribute('aria-controls') || e.id || nomDe(e)) : e.getAttribute(attr));

/** les pages d'un ploxion monté : { source: 'api'|'dom'|'seule', pages: [{ cle, nom, sel?, attr?, val? }], i (la page actuelle), photo } */
export function trouverPages(hote, inst, id) {
  const seule = { source: 'seule', pages: [{ cle: '', nom: 'cette page' }], i: 0, photo: false };
  if (!hote || EXCLUS.has(id)) return seule;
  if (inst && typeof inst.pages === 'function' && typeof inst.allerPage === 'function') {
    try { const l = inst.pages(); if (Array.isArray(l) && l.length > 1) return { source: 'api', pages: l.map(p => ({ cle: String(p.cle), nom: String(p.nom || p.cle) })), i: Math.max(0, l.findIndex(p => p.actif)), photo: true }; } catch (e) { /* le contrat cassé : on regarde le DOM */ }
  }
  for (const [sel, attr, o] of ONGLETS) {
    const vus = new Map();
    for (const e of hote.querySelectorAll(sel)) {
      if (e.closest('[hidden]') || e.matches(DANGER) || (e.style && e.style.display === 'none')) continue;
      if ((e.textContent || '').trim().length > 40) continue;   // un panneau, pas un onglet
      const v = valeur(e, attr); if (!v || vus.has(v)) continue; vus.set(v, e);
    }
    if (vus.size < 2 || vus.size > 24) continue;
    const pages = [...vus].map(([v, e]) => ({ cle: attr + '=' + v, nom: nomDe(e) || v, sel, attr, val: v }));
    return { source: 'dom', pages, i: Math.max(0, pages.findIndex(p => vus.get(p.val).matches(ACTIF))), photo: !(o && o.photo === false) };
  }
  return seule;
}

/** aller à une page (le contrat, ou toucher son onglet — jamais ce qui agit) */
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

/** la photo d'une page : son DOM cloné, inerte ; ses valeurs et ses canvas recopiés */
export function photographier(W, hote) {
  // px-hote : le thème de l'app habille le contenu des ploxions sous .px-hote (pas enfant direct de la scène : ni le routeur ni la
  // fractale ne la prennent pour un hôte, ils cherchent .px-scene>.px-hote ou le premier dans l'ordre, le vrai)
  const D = W.document, z = D.createElement('div'); z.className = 'px-hote ci-cliche';
  try { const cs = W.getComputedStyle(hote); if (cs && cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') z.style.backgroundColor = cs.backgroundColor; } catch (e) { /* */ }
  for (const n of hote.childNodes) z.appendChild(n.cloneNode(true));
  const src = hote.querySelectorAll('input,textarea,select,canvas'), dst = z.querySelectorAll('input,textarea,select,canvas');
  if (src.length === dst.length) dst.forEach((d, k) => { const s = src[k]; try {
    if (d.tagName === 'CANVAS') { if (s.width && s.height) { d.width = s.width; d.height = s.height; const c = d.getContext('2d'); if (c && c.drawImage) c.drawImage(s, 0, 0); } }
    else if (d.type === 'checkbox' || d.type === 'radio') d.checked = s.checked; else if (d.type !== 'file') d.value = s.value;
  } catch (e) { /* */ } });
  z.querySelectorAll('[hidden],script,style,link,template,noscript').forEach(x => x.remove());
  z.querySelectorAll('iframe,video,audio,object,embed').forEach(x => { const r = D.createElement('div'); r.className = 'ci-media'; r.textContent = x.tagName === 'IFRAME' ? '▣' : '▶'; x.replaceWith(r); });
  z.querySelectorAll('[name],[autofocus]').forEach(x => { x.removeAttribute('name'); x.removeAttribute('autofocus'); });
  z.setAttribute('inert', ''); z.setAttribute('aria-hidden', 'true');
  return z;
}

export function creerCubePages({ W = globalThis.window, boxion = null, vibrer = () => {}, liste = () => [], vivants = () => [], tsoins = async () => [], aller = () => {}, icone, glyphe } = {}) {
  const D = W.document, cache = new Map();   // id → Map(cle → photo) : pour la session
  let ici = null;
  const lire = async (id) => { const v = boxion ? await boxion.get('cubes', id).catch(() => null) : null;
    return { faces: { fond: 'trait', gauche: 'trait', droite: 'trait', plafond: 'trait', sol: 'trait', ...((v && v.faces) || {}) }, objets: Array.isArray(v && v.objets) ? v.objets : [], images: (v && v.images) || {} }; };
  const attendreMs = (ms) => new Promise(r => W.setTimeout(r, ms));
  const nommer = (k, t) => { const c = D.createElement('div'); c.className = 'ci-cliche ci-sans-photo'; c.innerHTML = '<p>▤</p><b></b><small>touche le fond pour y aller</small>'; c.querySelector('b').textContent = t.pages[k].nom; return c; };

  function photographierAutour(moi, i) {
    if (!moi.t.photo) return moi.file;
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
  /** ▣ : le ploxion { id, hote, inst } devient son cube (dans `dans`, par-dessus l'hôte) ; rend l'id, ou false */
  async function ouvrir({ id, hote, inst = null, dans = null }) {
    if (ici) fermer();
    if (!hote) return false;
    if (inst && inst.ready && typeof inst.ready.then === 'function') await Promise.race([inst.ready.catch(() => {}), attendreMs(1500)]);
    const t = trouverPages(hote, inst, id);
    const photos = cache.get(id) || new Map(); cache.set(id, photos);
    const moi = { id, hote, inst, t, photos, file: Promise.resolve(), stop: false, entre: false, surPage: t.i, frais: new Set([t.i]), defile: hote.scrollTop || 0, restaurer: null };
    if (t.photo) { try { if (inst && typeof inst.garderEtat === 'function') moi.restaurer = inst.garderEtat(); } catch (e) { /* */ } }
    photos.set(t.pages[t.i].cle, photographier(W, hote));
    const el = D.createElement('div'); el.className = 'px-cube-pages'; el.dataset.cube = id;
    (dans || hote.parentNode).appendChild(el); moi.el = el;
    const ctl = { n: () => t.pages.length, i: t.i, nom: (k) => t.pages[k].nom,
      photo: (k) => { const p = photos.get(t.pages[k].cle); return p ? p.cloneNode(true) : t.photo ? null : nommer(k, t); },
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
    if (k === moi.t.i) await remettre(moi);
    else { await allerPage(moi.hote, moi.inst, moi.t.pages[k], { muet: true }); try { moi.hote.scrollTop = 0; } catch (e) { /* */ } }
    if (ici === moi) fermer();
  }
  /** referme le cube (sans animation) ; le ploxion revient comme il était, sauf si l'on est entré dans une page */
  function fermer() {
    const moi = ici; if (!moi) return false; ici = null; moi.stop = true;
    if (!moi.entre) moi.file.then(() => remettre(moi));
    try { moi.salle.unmount(); } catch (e) { /* */ } moi.el.remove();
    return true;
  }
  return {
    ouvrir, fermer, ouvert: () => (ici ? ici.id : null),
    /** pour les essais : la salle et les pages du cube ouvert */
    salle: () => (ici ? ici.salle : null), pages: () => (ici ? ici.t : null), photos: () => (ici ? ici.file : Promise.resolve()),
  };
}
