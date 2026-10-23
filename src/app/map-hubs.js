// ▦ LA MAP DU XERBOXION, EN CARRÉS (0.90). RS-7 (22.10, une capture de la vue des xers : un ploxion au centre, ses voisins qui dépassent en
// haut, en bas, à gauche, à droite) : « ça c'est trop stylé, je veux pouvoir me balader comme ça plutôt, avec des carrés, et faut remplir avec
// les infos de la map ; d'ailleurs je kiffe la map du labo, de pouvoir en créer, je veux avoir ça sur ce xerboxion ».
// COMPOSER : la map du labo, ce sont ses HUBS (/px/xerkions.json, le bion jOSXerkionHub : 61 hubs au 22.10) — un hub = un centre (un glyphe),
// des KOINS (des ploxions, ou d'autres hubs : « xerkion-… ») et des PORTAILS vers d'autres hubs : portals[0] à droite, [1] à gauche,
// [2] en haut, [3] en bas (le contrat de src/terrax/koin-ion.js) ; au-delà de quatre, « d'autres portails ». Les hubs PERSO (les tiens) vivent
// dans le même store que le labo : jOSStore « xerkions-persos » (localStorage « store:xerkions-persos:items » + jOSBoxion « xerkions-persos/
// items », qui part au labo en mode connecté) : un hub créé ici apparaît dans la map du labo, et inversement.
//   La balade : le hub où tu es, un CARRÉ au centre (son glyphe au milieu, ses koins autour) ; ses voisins, des carrés qui dépassent des bords ;
//   glisser amène le voisin au centre (un cran) ; toucher un koin ouvre son ploxion (ou entre dans son hub) ; ‹ revient sur tes pas.
//   Un portail est aussi vu depuis l'autre bout : un hub perso posé à droite du Xerboxion apparaît à droite du Xerboxion (le retour est calculé).
//   Créer : « + un hub » : un nom, un glyphe central, des koins (tes ploxions), le côté où il se pose ; le modifier, l'effacer (les tiens).
// boxion_local « map/xerkions » : la dernière map du labo (hors ligne, elle revient) ; « reglages/map » : { ici } (le hub où tu étais).
import * as H from '../bions/humain.js';   // (0.99.8) le mode humain : les comptes et le temps en maths
import { MIN, MAX, PLONGE, RECULE, borner, niveau, detailDe, figer, prochainFige, versScene } from '../bions/zoom.js';
import { glyphe as G, glyphePloxion, nomDepuisEmoji } from './glyphes.js';

export const COTES = ['droite', 'gauche', 'haut', 'bas'];
const OPPOSE = { droite: 'gauche', gauche: 'droite', haut: 'bas', bas: 'haut' };
const DEPART = 'xerkion-xerboxion';
const CLE_STORE = 'store:xerkions-persos:items';
export const CENTRES = ['ion', 'kion', 'koin', 'trion', 'wormion', 'portion', 'spherion', 'ploxion', 'tsoin', 'xer', 'xeroction', 'cubion', 'bion'];
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nomDe = (h) => (h && (h.nom || h.name || h.id)) || '?';

/** les hubs du labo (xerkions.json) + les tiens (les tiens gagnent à id égal) → Map id → hub */
export function assembler(labo = [], persos = []) {
  const m = new Map();
  for (const h of labo || []) if (h && h.template === 'hub' && h.id) m.set(h.id, h);
  for (const h of persos || []) if (h && h.template === 'hub' && h.id) m.set(h.id, { ...h, perso: true });
  return m;
}
/** les voisins d'un hub : ses portails (0 droite, 1 gauche, 2 haut, 3 bas), complétés par le retour des portails des autres ; et les autres portails */
export function voisins(hubs, id) {
  const h = hubs.get(id), v = { droite: null, gauche: null, haut: null, bas: null }, autres = [];
  if (!h) return { ...v, autres };
  (h.portals || []).forEach((p, i) => { if (!hubs.has(p)) return; if (i < 4 && !v[COTES[i]]) v[COTES[i]] = p; else if (!Object.values(v).includes(p) && !autres.includes(p)) autres.push(p); });
  for (const [oid, o] of hubs) {
    if (oid === id) continue;
    (o.portals || []).forEach((p, i) => { if (p !== id || Object.values(v).includes(oid)) return; const c = i < 4 ? OPPOSE[COTES[i]] : null; if (c && !v[c]) v[c] = oid; else if (!autres.includes(oid)) autres.push(oid); });
  }
  return { ...v, autres: autres.filter(a => !Object.values(v).includes(a)) };
}
/** (0.97) LES DIAGONALES (RS-7 23.10 : « y a que gauche droite haut bas, mais en diagonale ? quand on ira à gauche, on aura des ploxions en
 *  haut et en bas aussi : il faut déjà les voir dans la vue de base ; sur l'écran il n'y a pas 5 hubs, il y en a 9 ») : le coin d'en haut à
 *  gauche, c'est le gauche de mon haut (sinon le haut de mon gauche) ; jamais un hub déjà à l'écran */
export const DIAGONALES = { hg: ['haut', 'gauche'], hd: ['haut', 'droite'], bg: ['bas', 'gauche'], bd: ['bas', 'droite'] };
export function diagonales(hubs, id) {
  const v = voisins(hubs, id), deja = new Set([id, v.droite, v.gauche, v.haut, v.bas].filter(Boolean)), d = {};
  for (const [k, [a, b]] of Object.entries(DIAGONALES)) {
    let x = v[a] ? voisins(hubs, v[a])[b] : null;
    if (!x || deja.has(x)) x = v[b] ? voisins(hubs, v[b])[a] : null;
    d[k] = x && !deja.has(x) ? x : null; if (d[k]) deja.add(d[k]);
  }
  return d;
}
/** (0.97) le temps, en mots : « à l'instant », « il y a 3 h », « il y a 2 sem » */
export function ilYa(t, maintenant = Date.now()) {
  if (!t) return ''; const s = Math.max(0, (maintenant - t) / 1000);
  return s < 90 ? 'à l\'instant' : s < 3600 ? 'il y a ' + Math.round(s / 60) + ' min' : s < 86400 ? 'il y a ' + Math.round(s / 3600) + ' h' : s < 86400 * 13 ? 'il y a ' + Math.round(s / 86400) + ' j' : s < 86400 * 60 ? 'il y a ' + Math.round(s / 604800) + ' sem' : 'il y a ' + Math.round(s / 2592000) + ' mois';
}
/** (0.97) les fenêtres du wormion sur la map : [nom, de (jours en arrière), à] */
export const FENETRES = [['tout le temps', null, null], ['aujourd\'hui', 0, 0], ['hier', 1, 1], ['cette semaine', 0, 6], ['il y a 2 sem', 7, 20], ['ce mois', 0, 30], ['avant', 31, 9999]];
/** un ploxion a-t-il servi dans la fenêtre ? (usage.days : 60 jours ; au-delà, son dernier usage) */
export function servi(usage, id, [, de, a], maintenant = Date.now()) {
  if (de == null) return true; if (!usage || !usage.px || !usage.px[id]) return false;
  const jour = (n) => { const d = new Date(maintenant - n * 86400000); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  if (usage.days) for (let n = de; n <= Math.min(a, 60); n++) { const j = usage.days[jour(n)]; if (j && j.px && j.px[id]) return true; }
  const l = usage.px[id].lastAt, age = (maintenant - l) / 86400000; return age >= de && age < a + 1;
}
/** un hub perso neuf, posé d'un côté d'un autre (son portail de retour pointe vers lui) */
export function nouveauHub({ nom, centre = 'ion', koins = [], depuis = null, cote = 'droite', maintenant = Date.now() }) {
  const slug = String(nom || 'hub').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'hub';
  const portals = ['', '', '', ''];
  if (depuis) portals[COTES.indexOf(OPPOSE[cote])] = depuis;
  return { id: 'xerkion-perso-' + slug + '-' + maintenant.toString(36).slice(-4), nom: String(nom || 'mon hub').slice(0, 40), icone: '', template: 'hub', perso: true, center: CENTRES.includes(centre) ? centre : 'ion', essence: slug, koins: koins.slice(0, 24), portals, seme: 'map-ploxi0n', cree: new Date(maintenant).toISOString() };
}

/** charger() → [hubs du labo] (HTTP natif) ; ploxions() → [{ id, nom }] installés ; ouvrir(id) un ploxion */
/** (0.98) LES PALIERS DU ZOOM DE FRACTALE (RS-7 23.10 : « une seule map, tout est fractal » ; « des paliers de zoom ») : du plus loin au plus
 *  près — tes ploxions, le réseau des hubs, un hub (3 × 3), un ploxion (son neurone : entrées, sorties, bions), un bion (le sien) */
export const PALIERS_MAP = [['tout', 'tes ploxions'], ['reseau', 'le réseau'], ['hub', 'le hub'], ['ploxion', 'le ploxion'], ['bion', 'le bion']];
/** le réseau : chaque hub à sa case, depuis « ici », portail par portail (droite x+1, haut y−1…) ; 80 hubs au plus */
export function placerReseau(hubs, ici, max = 80) {
  const pos = new Map(), pris = new Set(), file = [ici];
  if (!hubs.has(ici)) return pos;
  pos.set(ici, [0, 0]); pris.add('0,0');
  const D = { droite: [1, 0], gauche: [-1, 0], haut: [0, -1], bas: [0, 1] };
  while (file.length && pos.size < max) {
    const id = file.shift(), [x, y] = pos.get(id), v = voisins(hubs, id);
    for (const c of COTES) { const n = v[c]; if (!n || pos.has(n)) continue; const k = (x + D[c][0]) + ',' + (y + D[c][1]); if (pris.has(k)) continue; pos.set(n, [x + D[c][0], y + D[c][1]]); pris.add(k); file.push(n); }
  }
  return pos;
}

export function creerMap({ W = globalThis.window, boxion, charger = null, ploxions = () => [], ouvrir = () => {}, vibrer = () => {}, enLigne = () => true, usage = async () => null,
  inspecter = async () => null, bionInfo = async () => null, flux = null, neurone = null, tous = null, fluxGarde = null }) {
  const tousLes = () => (tous ? tous() : ploxions());   // (0.98) tes ploxions : tous, ceux de l'app aussi
  const D = W.document;
  let labo = [], persos = [], hubs = new Map();
  const lirePersos = () => { try { const l = JSON.parse(W.localStorage.getItem(CLE_STORE) || 'null'); if (Array.isArray(l)) return l; } catch (e) { /* */ } return null; };
  async function relire({ reseau = true } = {}) {
    const c = await boxion.get('map', 'xerkions').catch(() => null); if (c && Array.isArray(c.items)) labo = c.items;
    const lp = lirePersos(); if (lp) persos = lp;
    else { const d = await boxion.get('box:xerkions-persos', 'items').catch(() => null); if (d && Array.isArray(d.data)) persos = d.data; }
    if (reseau && charger && enLigne()) {
      try { const l = await charger(); if (Array.isArray(l) && l.length) { labo = l; await boxion.put('map', 'xerkions', { items: l, le: Date.now() }).catch(() => {}); } } catch (e) { /* hors ligne : la dernière map */ }
    }
    hubs = assembler(labo, persos);
    return hubs;
  }
  async function garderPersos(l) {
    persos = l; hubs = assembler(labo, persos);
    try { W.localStorage.setItem(CLE_STORE, JSON.stringify(l)); } catch (e) { /* */ }
    // jOSBoxion : la copie locale, et le boxion du compte en mode connecté (le labo y lit les mêmes hubs)
    if (W.jOSBoxion && W.jOSBoxion.save) await W.jOSBoxion.save('xerkions-persos', 'items', l, 'store xerkions-persos').catch(() => {});
    else await boxion.put('box:xerkions-persos', 'items', { ns: 'xerkions-persos', key: 'items', name: 'store xerkions-persos', data: l, savedAt: new Date().toISOString() }).catch(() => {});
  }
  async function creer(o) { const h = nouveauHub(o); await garderPersos([...persos, h]); return h; }
  async function modifier(id, patch) { const l = persos.map(h => (h.id === id ? { ...h, ...patch, id } : h)); await garderPersos(l); return hubs.get(id); }
  async function effacer(id) { await garderPersos(persos.filter(h => h.id !== id).map(h => ({ ...h, portals: (h.portals || []).map(p => (p === id ? '' : p)) }))); }

  // ---- la balade ----
  function mount(hote, params) {
    if (params && params.params && typeof params.params === 'object') params = { ...params, ...params.params };   // (0.99.3) ouverte par le routeur : ses paramètres sont dans o.params
    let vivant = true, ici = null, pas = [], drag = null, glisse = false, repli = false;   // repli : un hub de secours, faute de la map du labo
    let us = null, fenetre = FENETRES[0];   // (0.97) le temps : l'usage des ploxions, la fenêtre du wormion
    let palier = (params && params.palier) || 'hub', cible = params && (params.bion || params.ploxion) ? { ploxion: params.ploxion || null, bion: params.bion || null } : null, pince = null, appui = 0;   // (0.98) le zoom de fractale ; (0.99.3) ouvert sur un bion ou un ploxion
    let echelle = 1, reglageZoom = { mode: 'libre', figes: [] }, raf = 0;   // (0.99) le zoom libre ou par paliers figés
    hote.innerHTML = '<div class="px-map" data-detail="deux"><div class="px-map-b" data-neurones><button type="button" data-map="pas" data-neurone aria-label="revenir sur tes pas">‹</button><span class="px-map-ou" data-map-ou></span>'
      + '<button type="button" data-map="depart" data-neurone aria-label="le xerboxion">' + G('xerboxion') + '</button><button type="button" data-map="creer" data-neurone aria-label="créer un hub">＋</button></div>'
      + '<div class="px-map-v" data-map-v><div class="px-map-plan" data-map-plan data-neurones data-neurones-seuil="64"></div></div><div class="px-map-autres" data-map-autres></div>'
      // ○ (0.97) le wormion sur la map : glisser remonte le temps ; les koins qui ont servi dans la fenêtre s'allument
      + '<div class="px-map-temps"><span aria-hidden="true">○</span><input type="range" min="0" max="' + (FENETRES.length - 1) + '" step="1" value="0" data-map-temps aria-label="le temps : quand tu les as ouverts"><b data-map-temps-l data-h="∀t">tout le temps</b></div>'
      // ◈ (0.98) les paliers : une autre scène (tes ploxions, le réseau, un neurone) ; la règle du zoom, à droite
      + '<div class="px-map-n" data-map-n hidden></div>'
      + '<nav class="px-map-z" aria-label="le zoom de fractale">' + PALIERS_MAP.map(([k, n]) => '<button type="button" data-map-palier="' + k + '" aria-label="' + n + '"><i></i><span>' + n + '</span></button>').join('')
        + '<div class="px-map-figes" data-map-figes></div><button type="button" class="px-map-zb" data-map-figer aria-label="figer ce zoom : un palier à toi">✻</button><button type="button" class="px-map-zb" data-map-mode aria-label="zoom libre ou par paliers">∿</button><b class="px-map-niv" data-map-niveau>×1.00</b></nav></div>';
    const vue = hote.querySelector('[data-map-v]'), plan = hote.querySelector('[data-map-plan]'), scene = hote.querySelector('[data-map-n]'), carte = hote.querySelector('.px-map');
    const taille = () => { const w = vue.clientWidth || W.innerWidth || 390, h = vue.clientHeight || (W.innerHeight || 800) * 0.7; return Math.round(w > h * 1.2 ? Math.min(w * 0.46, h * 0.84) : Math.min(w * 0.74, h * 0.62)); };   /* (0.99.5) couché : la case prend la hauteur */
    function koinHtml(k) {
      const hub = String(k.ploxion || '').startsWith('xerkion-') && hubs.has(k.ploxion);
      const g = hub ? G(hubs.get(k.ploxion).center || 'portion') : (nomDepuisEmoji(k.icon) ? G(nomDepuisEmoji(k.icon)) : glyphePloxion({ id: k.ploxion, nom: k.label }));
      const u = !hub && us && us.px && us.px[k.ploxion], vu = fenetre[1] != null && !hub && servi(us, k.ploxion, fenetre);
      return '<button type="button" class="px-map-k' + (hub ? ' px-map-k-hub' : '') + (vu ? ' px-map-vu' : '') + '" data-neurone data-quand="' + esc(u ? ilYa(u.lastAt) : '') + '" data-quand-h="' + esc(u && u.lastAt ? H.duree(Date.now() - u.lastAt) : '') + '" data-k="' + esc(k.ploxion || '') + '" title="' + esc(k.label || k.ploxion) + '">' + g + '<small>' + esc(k.label || k.ploxion || '') + '</small></button>';
    }
    function carre(id, role) {
      const h = hubs.get(id); if (!h) return '';
      const ks = (h.koins || []).filter(k => k && k.ploxion), n = ks.length;
      return '<div class="px-map-c px-map-' + role + '" data-neurone data-c="' + esc(id) + '"><div class="px-map-t"><b>' + esc(nomDe(h)) + '</b><span>' + esc(h.essence || '') + (h.perso ? ' · à toi' : '') + '</span>'
        + (role === 'ici' && h.perso ? '<button type="button" data-map="modifier" aria-label="modifier">✎</button>' : '') + '</div>'
        + '<div class="px-map-g" data-neurones="fin">' + ks.slice(0, 12).map(koinHtml).join('') + '<div class="px-map-centre" data-neurone>' + G(h.center || 'ion') + '</div></div>'
        + '<div class="px-map-pied" data-h="' + esc(H.compte(n, '◇') + ' · ' + H.compte((h.portals || []).filter(Boolean).length, '⊡')) + '">' + n + ' koin' + (n > 1 ? 's' : '') + (n > 12 ? ' (+' + (n - 12) + ')' : '') + ' · ' + (h.portals || []).filter(Boolean).length + ' portail' + ((h.portals || []).filter(Boolean).length > 1 ? 's' : '') + '</div></div>';
    }
    function peindre() {
      if (!vivant) return;
      if (us === null) { us = false; usage().then(u => { us = u || false; peindre(); }).catch(() => {}); }   // une fois : quand chaque ploxion a servi
      if (!hubs.has(ici)) { repli = !hubs.has(DEPART); ici = hubs.has(DEPART) ? DEPART : [...hubs.keys()][0] || null; }
      const S = taille(), gap = Math.round(S * 0.08);
      hote.querySelector('[data-map-ou]').textContent = ici ? nomDe(hubs.get(ici)) : 'la map';
      hote.querySelector('[data-map="pas"]').disabled = !pas.length;
      if (!ici) { plan.innerHTML = '<p class="px-sous">la map n\'est pas encore là : connecte-toi une fois, ou crée ton premier hub (＋)</p>'; return; }
      const v = voisins(hubs, ici);
      plan.style.setProperty('--S', S + 'px'); plan.style.setProperty('--P', (S + gap) + 'px');
      plan.style.transition = 'none'; plan.style.transform = 'translate(0,0)';
      const dg = diagonales(hubs, ici);   // (0.97) 3 × 3 : les coins aussi
      plan.classList.toggle('px-map-temps-on', fenetre[1] != null);
      plan.innerHTML = carre(ici, 'ici') + COTES.map(c => (v[c] ? carre(v[c], c) : '')).join('') + Object.keys(DIAGONALES).map(c => (dg[c] ? carre(dg[c], c) : '')).join('');
      hote.querySelector('[data-map-autres]').innerHTML = v.autres.length ? 'd\'autres portails : ' + v.autres.map(a => '<button type="button" data-aller="' + esc(a) + '">' + G((hubs.get(a) || {}).center || 'ion') + esc(nomDe(hubs.get(a))) + '</button>').join('') : '';
      boxion.put('reglages', 'map', { ici }).catch(() => {});
    }
    // ---- (0.98) les paliers : le zoom de fractale ----
    const cacheFlux = new Map();
    async function fluxPloxion(id) {
      if (cacheFlux.has(id)) return cacheFlux.get(id);
      if (fluxGarde) { const f = await fluxGarde(id).catch(() => null); cacheFlux.set(id, f); return f; }   /* (0.99.17) calculé une fois par version, gardé */
      const i = await inspecter(id).catch(() => null); const f = i && flux ? flux(i) : null; if (f) f.nom = i.nom; cacheFlux.set(id, f); return f;
    }
    // en fond, le flux des autres ploxions (pour les synapses) : un à la fois, sans gêner
    let fond = 0; const remplir = () => { if (!vivant || fond) return; const l = tousLes().map(p => p.id).filter(id => !cacheFlux.has(id)).slice(0, 60); let i = 0;
      const un = () => { if (!vivant || i >= l.length) { fond = 0; return; } fluxPloxion(l[i++]).finally(() => { fond = W.setTimeout(un, 40); }); }; fond = W.setTimeout(un, 200); };
    function regle() {
      const fz = hote.querySelector('[data-map-figes]'), md = hote.querySelector('[data-map-mode]');
      if (fz) fz.innerHTML = reglageZoom.figes.map((f, i) => '<button type="button" data-map-fige="' + f.g + '" aria-label="' + esc(f.nom) + '">' + (i + 1) + '</button>').join('');
      // (0.99.2) des glyphes (∿ libre, ≡ paliers) : la règle ne mange plus les koins
      if (md) { md.textContent = reglageZoom.mode === 'paliers' ? '≡' : '∿'; md.setAttribute('aria-label', reglageZoom.mode === 'paliers' ? 'zoom par paliers (toucher : libre)' : 'zoom libre (toucher : par paliers)'); md.classList.toggle('on', reglageZoom.mode === 'paliers'); }
      for (const b of hote.querySelectorAll('[data-map-palier]')) { const k = b.getAttribute('data-map-palier'); b.classList.toggle('on', k === palier); b.disabled = (k === 'ploxion' && !(cible && cible.ploxion)) || (k === 'bion' && !(cible && cible.bion)); } }
    async function zoomer(p, o = {}) {
      const i = PALIERS_MAP.findIndex(x => x[0] === palier), j = PALIERS_MAP.findIndex(x => x[0] === p); if (j < 0) return;
      if (o.ploxion) cible = { ...(cible || {}), ploxion: o.ploxion, bion: null }; if (o.bion) cible = { ...(cible || {}), bion: o.bion }; if (o.hub && hubs.has(o.hub)) { if (ici && o.hub !== ici) pas.push(ici); ici = o.hub; }
      if ((p === 'ploxion' && !(cible && cible.ploxion)) || (p === 'bion' && !(cible && cible.bion))) return vibrer('fx-butee');
      palier = p; vibrer(j > i ? 'fx-arrivee' : 'fx-cran');
      for (const el of [vue, scene]) { el.style.transform = ''; el.style.transition = 'none'; } echelle = 1; carte.setAttribute('data-detail', 'deux');
      carte.classList.remove('px-zoom-in', 'px-zoom-out'); void carte.offsetWidth; carte.classList.add(j > i ? 'px-zoom-in' : 'px-zoom-out');   // la scène plonge ou recule
      await peindreScene();
    }
    async function peindreScene() {
      regle();
      const surLaMap = palier === 'hub';
      vue.hidden = !surLaMap; hote.querySelector('[data-map-autres]').hidden = !surLaMap; scene.hidden = surLaMap; hote.querySelector('.px-map-temps').hidden = !surLaMap;
      carte.setAttribute('data-palier', palier);
      scene.scrollTop = 0; scene.scrollLeft = 0;   // (0.99.2) une scène neuve repart d'en haut à gauche (le réseau se recentre ensuite)
      if (surLaMap) { hote.querySelector('[data-map-ou]').textContent = ici ? nomDe(hubs.get(ici)) : 'la map'; return peindre(); }
      if (palier === 'tout') {
        hote.querySelector('[data-map-ou]').textContent = 'tes ploxions';
        const l = tousLes();
        scene.innerHTML = '<div class="px-map-tt" data-neurones="fin">' + l.map(p => { const u = us && us.px && us.px[p.id]; return '<button type="button" class="px-map-tc" data-neurone data-tt="' + esc(p.id) + '" data-quand="' + esc(u ? ilYa(u.lastAt) : '') + '" data-quand-h="' + esc(u && u.lastAt ? H.duree(Date.now() - u.lastAt) : '') + '">' + glyphePloxion(p) + '<small>' + esc(p.nom || p.id) + '</small></button>'; }).join('') + '</div>';
        return;
      }
      if (palier === 'reseau') {
        hote.querySelector('[data-map-ou]').textContent = 'le réseau · ' + hubs.size + ' hubs';
        const pos = placerReseau(hubs, ici), xs = [...pos.values()].map(v => v[0]), ys = [...pos.values()].map(v => v[1]), x0 = Math.min(0, ...xs), y0 = Math.min(0, ...ys), PAS = 104;
        scene.innerHTML = '<div class="px-map-rs" data-neurones data-neurones-seuil="30" style="width:' + ((Math.max(0, ...xs) - x0 + 1) * PAS) + 'px;height:' + ((Math.max(0, ...ys) - y0 + 1) * PAS) + 'px">'
          + [...pos.entries()].map(([id, [x, y]]) => { const h = hubs.get(id); return '<button type="button" class="px-map-rc' + (id === ici ? ' px-map-rc-ici' : '') + '" data-neurone data-rs="' + esc(id) + '" style="left:' + ((x - x0) * PAS) + 'px;top:' + ((y - y0) * PAS) + 'px">' + G(h.center || 'ion') + '<small>' + esc(nomDe(h)) + '</small></button>'; }).join('') + '</div>';
        const ic = scene.querySelector('.px-map-rc-ici'), rs = scene.querySelector('.px-map-rs');   // centrer la scène seule (scrollIntoView ferait défiler l'accueil aussi)
        if (ic && rs) W.setTimeout(() => { scene.scrollLeft = rs.offsetLeft + ic.offsetLeft + ic.offsetWidth / 2 - scene.clientWidth / 2; scene.scrollTop = rs.offsetTop + ic.offsetTop + ic.offsetHeight / 2 - scene.clientHeight / 2; }, 30);
        return;
      }
      if (palier === 'ploxion') {
        const id = cible.ploxion; scene.innerHTML = '<p class="px-sous">…</p>';
        const f = await fluxPloxion(id), p = tousLes().find(x => x.id === id) || { id, nom: id }; if (!vivant || palier !== 'ploxion') return;
        hote.querySelector('[data-map-ou]').textContent = p.nom || id;
        const liens = [];
        if (f) for (const [oid, of] of cacheFlux) { if (!of || oid === id) continue; for (const l of synapsesDe(f, of)) liens.push({ ...l, id: oid, nom: of.nom || oid }); }
        scene.innerHTML = neurone ? neurone.html({ genre: 'ploxion', id, titre: p.nom || id, glyphe: glyphePloxion(p), sous: f ? '' : 'son code n\'est pas là (pas installé ?)',
          entrees: f ? f.entrees : [], sorties: f ? f.sorties : [], bions: [{ nom: id, glyphe: glyphePloxion(p), coeur: true }, ...(f ? f.bions : []).map(nom => ({ nom, glyphe: G('bion') }))],   /* (0.99.5) son cœur d'abord, puis ses bions */ liens, actions: [['ouvrir', '▷ l\'ouvrir'], ['hub', '⊖ la map']] }) : '';
        W.requestAnimationFrame(suivreAxones); remplir();
        return;
      }
      if (palier === 'bion') {
        const nom = cible.bion; scene.innerHTML = '<p class="px-sous">…</p>';
        const b = await bionInfo(nom).catch(() => null) || { nom }; if (!vivant || palier !== 'bion') return;
        hote.querySelector('[data-map-ou]').textContent = nom;
        const lu = flux ? flux({ id: nom, code: b.js || '', bions: [] }) : { entrees: [], sorties: [] };
        const api = (b.api || []).map(a => ({ canal: 'api:' + a, doc: '', sur: 'core' }));
        scene.innerHTML = neurone ? neurone.html({ genre: 'bion', id: nom, titre: nom, glyphe: b.glyphe || G('bion'), sous: b.role || '',
          entrees: [...(b.utilisePar || []).map(p => ({ canal: 'appel:' + p, doc: b.coeur ? 'son ploxion' : 'l\'appelle', sur: 'code' })), ...lu.entrees], sorties: [...api, ...lu.sorties], bions: (b.bions || []).map(n => ({ nom: n, glyphe: G('bion') })),   /* (0.99.5) un bion a ses bions : on descend encore */
          liens: (b.utilisePar || []).map(p => ({ id: p, nom: (tousLes().find(x => x.id === p) || {}).nom || p, sens: 'de', canal: 'appel:' + nom })), actions: [['ploxion', '⊖ le ploxion']] }) : '';
        W.requestAnimationFrame(suivreAxones);
      }
    }
    const roAx = W.ResizeObserver && neurone ? new W.ResizeObserver(() => { const n = scene.querySelector('.px-nv'); if (n) neurone.axones(n); }) : null;
    const suivreAxones = () => { const n = scene.querySelector('.px-nv'); if (!n || !neurone) return; neurone.axones(n); if (roAx) { roAx.disconnect(); roAx.observe(n); } if (D.fonts && D.fonts.ready) D.fonts.ready.then(() => neurone.axones(n)).catch(() => {}); };
    const synapsesDe = (a, b) => [...(neurone ? neurone.synapses(a, b).map(l => ({ ...l, sens: 'vers' })) : []), ...(neurone ? neurone.synapses(b, a).map(l => ({ ...l, sens: 'de' })) : [])];
    // les gestes des paliers : la règle, toucher dans la scène, pincer (écarter = plonger, resserrer = reculer), l'appui long sur un koin
    hote.addEventListener('click', (e) => {
      const z = e.target.closest('[data-map-palier]'); if (z) { e.stopPropagation(); zoomer(z.getAttribute('data-map-palier')); return; }
      if (e.target.closest('[data-map-figer]')) { e.stopPropagation(); reglageZoom.figes = figer(reglageZoom.figes, niveau(iPalier(), echelle)); garderZoom(); regle(); vibrer('succes'); return; }
      if (e.target.closest('[data-map-mode]')) { e.stopPropagation(); reglageZoom.mode = reglageZoom.mode === 'paliers' ? 'libre' : 'paliers'; garderZoom(); regle(); vibrer('selection'); return; }
      const fg = e.target.closest('[data-map-fige]'); if (fg) { e.stopPropagation(); allerNiveau(+fg.getAttribute('data-map-fige')); return; }
      const t = e.target.closest('[data-tt]'); if (t) { vibrer('selection'); ouvrir(t.getAttribute('data-tt')); return; }
      const r = e.target.closest('[data-rs]'); if (r) { zoomer('hub', { hub: r.getAttribute('data-rs') }); return; }
      const bi = e.target.closest('[data-nv-bion]'); if (bi) { zoomer('bion', { bion: bi.getAttribute('data-nv-bion') }); return; }
      const ve = e.target.closest('[data-nv-vers]'); if (ve) { zoomer('ploxion', { ploxion: ve.getAttribute('data-nv-vers') }); return; }
      const ac = e.target.closest('[data-nv-action]'); if (ac) { const a = ac.getAttribute('data-nv-action'); if (a === 'ouvrir' && cible) { vibrer('fx-arrivee'); ouvrir(cible.ploxion); } else zoomer(a); }
    }, true);
    const sous = (x, y, sel) => { const el = D.elementFromPoint ? D.elementFromPoint(x, y) : null; return el && el.closest(sel); };
    // ---- (0.99) LE ZOOM LIBRE, OU PAR PALIERS FIGÉS (src/bions/zoom.js) : pincer agrandit la scène sous les doigts, en continu ; au-delà
    // d'un seuil on plonge dans ce qui est dessous, en deçà on recule ; l'écriture suit l'échelle (le glyphe, les deux, le texte) ; ❄ fige ----
    boxion.get('reglages', 'zoom').then(z => { if (z && typeof z === 'object') { reglageZoom = { mode: z.mode === 'paliers' ? 'paliers' : 'libre', figes: Array.isArray(z.figes) ? z.figes : [] }; regle(); } }).catch(() => {});
    const garderZoom = () => boxion.put('reglages', 'zoom', reglageZoom).catch(() => {});
    const scenee = () => (palier === 'hub' ? vue : scene);
    function appliquerEchelle(s, ox, oy, anime = false) {
      echelle = borner(s); const el = scenee();
      if (ox != null) { const r = el.getBoundingClientRect(); el.style.transformOrigin = Math.round(ox - r.left) + 'px ' + Math.round(oy - r.top) + 'px'; }
      el.style.transition = anime ? 'transform .28s cubic-bezier(.2,.9,.3,1)' : 'none';
      el.style.transform = Math.abs(echelle - 1) < 0.01 ? '' : 'scale(' + echelle.toFixed(3) + ')';
      el.style.overflow = echelle < 0.99 ? 'visible' : '';   /* (0.99.18, RS-7 : la map coupée net au dézoom) la vue réduite ne coupe plus ses voisins : seul le cadre de la map coupe, en plein */
      carte.setAttribute('data-detail', detailDe(echelle));
      const ni = hote.querySelector('[data-map-niveau]'); if (ni) ni.textContent = '×' + echelle.toFixed(2);
    }
    const iPalier = () => PALIERS_MAP.findIndex(x => x[0] === palier);
    async function plonger(x, y) {
      const k = sous(x, y, '[data-k],[data-tt],[data-rs],[data-nv-bion]'), i = iPalier();
      if (palier === 'hub' && k && k.hasAttribute('data-k') && !k.classList.contains('px-map-k-hub')) await zoomer('ploxion', { ploxion: k.getAttribute('data-k') });
      else if (palier === 'tout' && k && k.hasAttribute('data-tt')) await zoomer('ploxion', { ploxion: k.getAttribute('data-tt') });
      else if (palier === 'reseau') await zoomer('hub', k && k.hasAttribute('data-rs') ? { hub: k.getAttribute('data-rs') } : {});
      else if (palier === 'ploxion' && k && k.hasAttribute('data-nv-bion')) await zoomer('bion', { bion: k.getAttribute('data-nv-bion') });
      else if (i < 2) await zoomer(PALIERS_MAP[i + 1][0]);
      else { appliquerEchelle(1, null, null, true); vibrer('fx-butee'); return false; }
      return true;
    }
    async function allerNiveau(g) {   // un palier figé : sa scène, puis son échelle
      const { i, s } = versScene(g, PALIERS_MAP.length); if (i !== iPalier()) await zoomer(PALIERS_MAP[i][0]);
      if (PALIERS_MAP[iPalier()][0] === PALIERS_MAP[i][0]) appliquerEchelle(s, null, null, true);
    }
    hote.addEventListener('touchstart', (e) => { if (e.touches.length === 2) { const [a, b] = e.touches; pince = { d0: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), s0: echelle, x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2, bouge: false, g0: niveau(iPalier(), echelle) }; drag = null; } }, { passive: true });
    hote.addEventListener('touchmove', (e) => {
      if (!pince || e.touches.length !== 2 || pince.passe) return; const [a, b] = e.touches, d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), s = borner(pince.s0 * d / pince.d0);
      pince.bouge = true; W.cancelAnimationFrame(raf); raf = W.requestAnimationFrame(() => appliquerEchelle(s, pince && pince.x, pince && pince.y));
      if (reglageZoom.mode !== 'libre') return;   // par paliers : on décide au lâcher
      if (s >= PLONGE) { pince.passe = true; plonger(pince.x, pince.y).then(ok => { if (ok) appliquerEchelle(0.8, null, null); W.setTimeout(() => appliquerEchelle(1, null, null, true), 30); }); }
      else if (s <= RECULE && iPalier() > 0) { pince.passe = true; zoomer(PALIERS_MAP[iPalier() - 1][0]).then(() => { appliquerEchelle(1.25, null, null); W.setTimeout(() => appliquerEchelle(1, null, null, true), 30); }); }
    }, { passive: true });
    hote.addEventListener('touchend', () => {
      const p = pince; pince = null; if (!p || !p.bouge || p.passe) return;
      if (reglageZoom.mode === 'paliers') {   // sauter au palier figé suivant, dans le sens du geste (sans palier figé : les scènes, à l'échelle 1)
        const sens = echelle > p.s0 ? 1 : -1, l = reglageZoom.figes.length ? reglageZoom.figes : PALIERS_MAP.map((_, i) => ({ g: i })), f = prochainFige(l, p.g0, sens);
        if (f) allerNiveau(f.g).then(() => vibrer('fx-cran')); else { appliquerEchelle(p.s0, null, null, true); vibrer('fx-butee'); }
      }
    }, { passive: true });
    vue.addEventListener('pointerdown', (e) => { const k = e.target.closest('[data-k]'); W.clearTimeout(appui); if (!k || k.classList.contains('px-map-k-hub')) return;
      appui = W.setTimeout(() => { appui = -1; drag = null; vibrer('appui'); zoomer('ploxion', { ploxion: k.getAttribute('data-k') }); }, 480); });   // l'appui long : son neurone
    vue.addEventListener('pointermove', (e) => { if (appui > 0 && drag && Math.hypot(drag.dx, drag.dy) > 8) { W.clearTimeout(appui); appui = 0; } });
    vue.addEventListener('pointerup', () => { if (appui > 0) { W.clearTimeout(appui); appui = 0; } });
    function aller(id, { cote = null, garder = true } = {}) {
      if (!hubs.has(id) || id === ici) return;
      repli = false;
      if (garder && ici) pas.push(ici);
      vibrer('fx-cran');
      if (cote) {   // le plan glisse jusqu'au voisin, puis la map se recentre
        const P = taille() * 1.08, d = { droite: [-P, 0], gauche: [P, 0], haut: [0, P], bas: [0, -P], hg: [P, P], hd: [-P, P], bg: [P, -P], bd: [-P, -P] }[cote];
        plan.style.transition = 'transform .22s cubic-bezier(.2,.9,.3,1)'; plan.style.transform = 'translate(' + d[0] + 'px,' + d[1] + 'px)';
        W.setTimeout(() => { ici = id; peindre(); }, 220);
      } else { ici = id; peindre(); }
    }
    // glisser : le voisin du côté opposé au doigt vient au centre ; un toucher sans glisser : le koin ou le carré touché
    hote.querySelector('[data-map-temps]').addEventListener('input', (e) => {
      fenetre = FENETRES[+e.target.value] || FENETRES[0]; const tl = hote.querySelector('[data-map-temps-l]'); tl.textContent = fenetre[0]; tl.setAttribute('data-h', H.fenetre(fenetre[1], fenetre[2]));
      us = null;   // l'usage relu : il a pu bouger depuis l'ouverture de la map
      vibrer(+e.target.value ? 'fx-cran' : 'selection'); peindre();
    });
    vue.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, dx: 0, dy: 0 }; glisse = false; });
    vue.addEventListener('pointermove', (e) => { if (!drag) return; drag.dx = e.clientX - drag.x; drag.dy = e.clientY - drag.y; if (Math.hypot(drag.dx, drag.dy) > 8) { plan.style.transition = 'none'; plan.style.transform = 'translate(' + drag.dx + 'px,' + drag.dy + 'px)'; } });
    const lacher = () => {
      if (!drag) return; const { dx, dy } = drag; drag = null;
      glisse = Math.hypot(dx, dy) > 8; const S = taille(); if (!glisse) return;
      W.setTimeout(() => { glisse = false; }, 0);   // le clic qui suit ce glisser (même tâche) est avalé, pas le suivant
      const ax = Math.abs(dx), ay = Math.abs(dy), diag = ax > S * 0.18 && ay > S * 0.18 && ax / ay > 0.5 && ax / ay < 2;   // (0.97) en biais : un coin
      const cote = diag ? (dy < 0 ? 'b' : 'h') + (dx < 0 ? 'd' : 'g') : ax > ay ? (dx < 0 ? 'droite' : 'gauche') : (dy < 0 ? 'bas' : 'haut');
      const cible = diag ? diagonales(hubs, ici)[cote] : voisins(hubs, ici)[cote];
      if (cible && Math.max(Math.abs(dx), Math.abs(dy)) > S * 0.18) { aller(cible, { cote }); return; }
      if (!cible && Math.max(Math.abs(dx), Math.abs(dy)) > S * 0.18) vibrer('fx-butee');
      plan.style.transition = 'transform .2s'; plan.style.transform = 'translate(0,0)';
    };
    vue.addEventListener('pointerup', lacher); vue.addEventListener('pointercancel', lacher);
    vue.addEventListener('click', (e) => {
      if (appui === -1) { appui = 0; return; }   // l'appui long a déjà zoomé
      if (glisse) { glisse = false; return; }
      const c = e.target.closest('[data-c]'); if (!c) return;
      const id = c.getAttribute('data-c');
      if (id !== ici) { const dg = diagonales(hubs, ici), cote = COTES.find(x => voisins(hubs, ici)[x] === id) || Object.keys(dg).find(x => dg[x] === id); aller(id, { cote }); return; }
      const k = e.target.closest('[data-k]'); if (!k) return;
      const p = k.getAttribute('data-k'); if (!p) return;
      if (p.startsWith('xerkion-') && hubs.has(p)) aller(p); else { vibrer('selection'); ouvrir(p); }
    });
    hote.addEventListener('click', (e) => {
      const b = e.target.closest('[data-map],[data-aller]'); if (!b || vue.contains(b)) { if (b && b.getAttribute('data-map') === 'modifier') editeur(hubs.get(ici)); return; }
      if (b.hasAttribute('data-aller')) return aller(b.getAttribute('data-aller'));
      const a = b.getAttribute('data-map');
      if (a === 'pas' && pas.length) { const p = pas.pop(); aller(p, { garder: false }); }
      if (a === 'depart') aller(hubs.has(DEPART) ? DEPART : [...hubs.keys()][0]);
      if (a === 'creer') editeur(null);
    });
    // ---- créer, modifier un hub (une feuille) ----
    function editeur(h) {
      const neuf = !h, l = ploxions().slice(0, 300), choisis = new Set((h ? h.koins : []).map(k => k.ploxion));
      const v = ici ? voisins(hubs, ici) : {}, libres = COTES.filter(c => !v[c]);
      const f = D.createElement('div'); f.className = 'px-feuille px-map-ed';
      f.innerHTML = '<div><h2>' + (neuf ? '＋ un hub' : '✎ ' + esc(nomDe(h))) + '</h2>'
        + '<input data-ed-nom placeholder="son nom (mes jeux, le matin, la musique…)" maxlength="40" value="' + esc(h ? nomDe(h) : '') + '">'
        + '<p class="px-sous">son glyphe</p><div class="px-map-ed-g">' + CENTRES.map(c => '<button type="button" data-ed-centre="' + c + '"' + ((h ? h.center : 'ion') === c ? ' class="on"' : '') + ' aria-label="' + c + '">' + G(c) + '</button>').join('') + '</div>'
        + (neuf && ici ? '<p class="px-sous">où le poser, à côté de « ' + esc(nomDe(hubs.get(ici))) + ' »</p><div class="seg">' + COTES.map(c => '<button type="button" data-ed-cote="' + c + '"' + (c === (libres[0] || 'droite') ? ' class="on"' : '') + (v[c] ? ' title="déjà un voisin : il sera dans « d\'autres portails »"' : '') + '>' + { droite: '→', gauche: '←', haut: '↑', bas: '↓' }[c] + (v[c] ? '·' : '') + '</button>').join('') + '</div>' : '')
        + '<p class="px-sous">ses koins (tes ploxions)</p><div class="px-map-ed-k">' + l.map(p => '<label><input type="checkbox" data-ed-k="' + esc(p.id) + '"' + (choisis.has(p.id) ? ' checked' : '') + '>' + glyphePloxion(p) + esc(p.nom || p.id) + '</label>').join('') + '</div>'
        + '<button class="p" data-ed="garder">' + (neuf ? 'créer' : 'garder') + '</button>' + (neuf ? '' : '<button class="danger" data-ed="effacer">effacer ce hub</button>') + '<button data-ed="fermer">annuler</button></div>';
      D.body.appendChild(f);
      const choix = (sel) => { const b = f.querySelector(sel + '.on'); return b ? b.getAttribute(sel.slice(1, -1)) : null; };
      f.addEventListener('click', async (e) => {
        if (e.target === f) return f.remove();
        const b = e.target.closest('button'); if (!b) return;
        for (const g of ['data-ed-centre', 'data-ed-cote']) if (b.hasAttribute(g)) { f.querySelectorAll('[' + g + ']').forEach(x => x.classList.toggle('on', x === b)); return; }
        const a = b.getAttribute('data-ed'); if (!a) return;
        if (a === 'fermer') return f.remove();
        if (a === 'effacer') { if (!b.classList.contains('sur')) { b.classList.add('sur'); b.textContent = 'sûr ?'; return; } await effacer(h.id); f.remove(); ici = pas.pop() || DEPART; peindre(); return; }
        const nom = f.querySelector('[data-ed-nom]').value.trim(); if (!nom) { f.querySelector('[data-ed-nom]').focus(); return; }
        const koins = [...f.querySelectorAll('[data-ed-k]:checked')].map(x => { const p = l.find(y => y.id === x.getAttribute('data-ed-k')) || {}; return { label: p.nom || p.id, ploxion: p.id, icon: p.icone || '' }; });
        const centre = choix('[data-ed-centre]') || 'ion';
        if (neuf) {
          const cote = choix('[data-ed-cote]') || 'droite';
          const n = await creer({ nom, centre, koins, depuis: ici, cote });
          // le hub d'où on vient, s'il est à toi : son portail de ce côté pointe vers le nouveau
          const de = hubs.get(ici); if (de && de.perso && !(de.portals || [])[COTES.indexOf(cote)]) { const p = (de.portals || ['', '', '', '']).slice(); while (p.length < 4) p.push(''); p[COTES.indexOf(cote)] = n.id; await modifier(de.id, { portals: p }); }
          f.remove(); vibrer('succes'); aller(n.id, { cote });
        } else { await modifier(h.id, { nom, center: centre, koins }); f.remove(); vibrer('succes'); peindre(); }
      });
    }
    (async () => {
      await relire({ reseau: false });
      const r = await boxion.get('reglages', 'map').catch(() => null);
      ici = (params && params.hub) || (r && r.ici) || DEPART; await peindreScene();
      await relire(); if (!vivant) return; if (repli && hubs.has(DEPART)) { repli = false; ici = DEPART; } if (palier === 'hub') peindre(); else if (palier === 'reseau') peindreScene();   // puis le labo, à jour
    })();
    const surTaille = () => { if (palier === 'hub') peindre(); else if (neurone) neurone.axones(scene.querySelector('.px-nv')); }; W.addEventListener('resize', surTaille);
    hote.__map = { zoomer, echelle: (x, ox, oy) => appliquerEchelle(x, ox, oy), niveau: () => niveau(iPalier(), echelle), reglage: () => reglageZoom };   // pour les parcours
    return { unmount() { vivant = false; W.clearTimeout(fond); if (roAx) roAx.disconnect(); W.removeEventListener('resize', surTaille); hote.innerHTML = ''; }, aller: (id) => aller(id), ici: () => ici, zoomer, palier: () => palier };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps.map = { manifest: { id: 'map', name: 'La map', icon: '▦' }, mount };
  return { relire, creer, modifier, effacer, hubs: () => hubs, mount, ploxion: { id: 'map', nom: 'La map', icone: '▦', interne: true } };
}
