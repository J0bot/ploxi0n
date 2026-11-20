// § MES XERS (0.77). RS-7 (17.10) : « partager des xer, et avoir des xer différents aussi ».
// Le xer, c'est l'interface ENTIÈRE sur les MÊMES ploxions (le contrat du labo : le ploxion xer-switch, le bion jOSXer) : tu changes de xer, la
// donnée dessous ne bouge pas, et c'est réversible. Dans ploxi0n, un xer garde ce qui fait l'interface :
//   l'accueil (pages, dossiers, ordre, vue) · le dock (HUD : éléments, épinglés) · la barre du haut · le fond · le mode (chill-tekk, xerboxion,
//   xerbot) et l'apparence (icônes, glyphes, gestes des bords, fractale, pages de côté…) — et la liste de ses ploxions.
// Pas les réglages de l'iPhone (haptique, Calme, vivants, sommeil) : ils restent les tiens dans tous les xers.
//   basculer   le xer actif est d'abord gardé tel qu'il est, puis l'autre est posé ; le labo est prévenu (jos:xer, le bus xer.change)
//   nouveau    une copie de celui-ci, ou un modèle (épuré, xerbot, xerboxion) posé par-dessus
//   partager   la feuille de 0.76 : https://labo.j0bot.ch/app/ouvrir/mes-xers?app=1&x=<le xer compressé> (un lien universel) + le QR
//              si le lien tient dans un QR ; jamais la photo du fond (elle reste chez toi)
//   recevoir   le lien ouvre ce ploxion avec ?x= : l'aperçu, ses ploxions (ceux qui manquent s'installent si tu le demandes), l'ajouter
// boxion_local « xers/liste » = [xer…] (sans images), « xers/actif » = id, « xers/fond:<id> » = la photo du fond de ce xer.
import { ACTIONS_BORDS } from './routeur.js';
import { PUBLIC } from './liens-publics.js';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** les préférences qui sont l'interface (un xer les porte) ; les autres restent celles de l'iPhone */
export const PREFS_XER = ['mode', 'ecriture', 'variante', 'police', 'styleIcones', 'glyphes', 'icones', 'contraste', 'dock', 'plaque', 'barreHaut', 'pleinEcran', 'pxChill', 'themeVivant', 'fractale', 'pagesCote', 'gestes', 'grain', 'miniDocks', 'bords', 'telecommande'];
const MODES = ['organique', 'chill-tekk', 'xerboxion', 'xerbot'];
const ACTIONS = new Set(ACTIONS_BORDS.map(a => a[0]));
const ID = /^[A-Za-z0-9._-]{1,80}$/;
/** des modèles, posés par-dessus une copie de ton xer */
export const MODELES = [
  { id: 'epure', nom: 'Épuré', icone: '▢', desc: 'une seule barre, rien qui bouge : l\'essentiel', prefs: { plaque: false, themeVivant: false, fractale: false, pagesCote: false, grain: false, miniDocks: 0, pxChill: false } },
  { id: 'xerbot', nom: 'XERB0T', icone: '🤖', desc: 'le poste de pilotage du monde physique', prefs: { mode: 'xerbot' }, epingler: ['controleur'] },
  { id: 'xerboxion', nom: 'xerboxion', icone: '⬡', desc: 'l\'UI du labo comme accueil et tout le xer des koins', prefs: { mode: 'xerboxion' } },
  { id: 'organique', nom: 'organique', icone: '〰', desc: 'le xer vivant : des membranes, des neurones, tout se zoome', prefs: { mode: 'organique', themeVivant: true, grain: true } },
  { id: 'chill-tekk', nom: 'chill-tekk', icone: '◇', desc: 'le xer classique, calme (celui d\'avant la 0.94)', prefs: { mode: 'chill-tekk', themeVivant: true, grain: true } },
];

// ---- nettoyer ce qui vient d'ailleurs (un lien reçu) : seulement des clés connues, des types connus ----
const chaine = (v, n = 60) => (typeof v === 'string' ? v.slice(0, n) : '');
const ids = (l, n = 400) => (Array.isArray(l) ? l.filter(x => typeof x === 'string' && ID.test(x)).slice(0, n) : []);
export function nettoyerPrefs(p, defaut = {}) {
  const r = {};
  if (!p || typeof p !== 'object') return r;
  for (const k of PREFS_XER) {
    if (!(k in p)) continue;
    const v = p[k];
    if (k === 'gestes') { if (v && typeof v === 'object') { r.gestes = {}; for (const [c, a] of Object.entries(v)) if (/^[a-z-]{1,20}$/.test(c) && ACTIONS.has(a)) r.gestes[c] = a; } continue; }
    if (k === 'mode') { if (MODES.includes(v)) r.mode = v; continue; }
    const d = defaut[k];
    if (typeof d === 'boolean' || typeof v === 'boolean') { if (typeof v === 'boolean') r[k] = v; }
    else if (typeof d === 'number' || typeof v === 'number') { if (typeof v === 'number' && isFinite(v)) r[k] = Math.max(0, Math.min(99, v)); }
    else if (typeof v === 'string' && /^[a-z-]{1,24}$/.test(v)) r[k] = v;
  }
  return r;
}
export function nettoyerXer(x, defaut = {}) {
  if (!x || typeof x !== 'object') return null;
  const acc = x.accueil && typeof x.accueil === 'object' ? x.accueil : {};
  const groupes = (l) => (Array.isArray(l) ? l.slice(0, 40).map(g => ({ nom: chaine(g && g.nom, 40) || '…', ids: ids(g && g.ids, 200) })).filter(g => g.ids.length) : []);
  const f = x.fond && typeof x.fond === 'object' ? x.fond : null;
  const b = x.barre && typeof x.barre === 'object' ? x.barre : null;
  return {
    v: 1, id: ID.test(x.id || '') ? x.id : 'x' + Math.random().toString(36).slice(2, 8),
    nom: chaine(x.nom, 40) || 'un xer', icone: chaine(x.icone, 8) || '§', desc: chaine(x.desc, 140),
    prefs: nettoyerPrefs(x.prefs, defaut),
    hud: x.hud && typeof x.hud === 'object' ? { elements: Array.isArray(x.hud.elements) ? x.hud.elements.slice(0, 20).filter(e => e && typeof e.k === 'string').map(e => ({ k: e.k.slice(0, 20), on: !!e.on })) : [], epingles: ids(x.hud.epingles, 4) } : null,
    accueil: { pages: groupes(acc.pages), dossiers: groupes(acc.dossiers), ordre: ids(acc.ordre), vue: chaine(acc.vue, 20) || undefined },
    fond: f ? { type: ['aucun', 'motif', 'photo'].includes(f.type) ? f.type : 'aucun', motif: chaine(f.motif, 20) || 'grille', sombre: +f.sombre || 0, flou: +f.flou || 0, partout: !!f.partout } : null,
    barre: b ? { gauche: (Array.isArray(b.gauche) ? b.gauche : []).filter(k => typeof k === 'string').slice(0, 6), droite: (Array.isArray(b.droite) ? b.droite : []).filter(k => typeof k === 'string').slice(0, 6) } : null,
    ploxions: ids(x.ploxions),
  };
}

// ---- le lien : JSON → (deflate) → base64url ; « z » compressé, « j » sinon ----
const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const deb64 = (s) => { const t = atob(s.replace(/-/g, '+').replace(/_/g, '/')); const u = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i); return u; };
async function passer(u8, Flux) { const r = new Response(new Blob([u8]).stream().pipeThrough(Flux)); return new Uint8Array(await r.arrayBuffer()); }
/** un xer → le texte du lien (sans la photo du fond ni l'id local) */
export async function encoderXer(x) {
  const { id, fondImage, ...pur } = x || {};
  if (pur.fond && pur.fond.type === 'photo') pur.fond = { ...pur.fond, type: 'motif' };
  const brut = new TextEncoder().encode(JSON.stringify(pur));
  if (typeof CompressionStream === 'function') { try { return 'z' + b64(await passer(brut, new CompressionStream('deflate-raw'))); } catch (e) { /* */ } }
  return 'j' + b64(brut);
}
export async function decoderXer(t) {
  const s = String(t || ''); if (s.length < 2 || s.length > 20000) throw new Error('ce lien de xer est illisible');
  let u = deb64(s.slice(1));
  if (s[0] === 'z') { if (typeof DecompressionStream !== 'function') throw new Error('cet iPhone ne sait pas lire ce xer (iOS 16.4 au moins)'); u = await passer(u, new DecompressionStream('deflate-raw')); }
  else if (s[0] !== 'j') throw new Error('ce lien de xer est illisible');
  if (u.length > 200000) throw new Error('ce xer est trop gros');
  return JSON.parse(new TextDecoder().decode(u));
}
export const lienXer = (code, source = PUBLIC) => source + '/app/ouvrir/mes-xers?app=1&x=' + code;

/**
 * prefs, hud, barre, fond : les modules de l'app (fond peut manquer en mode sûr) ; routeur() : docAccueil(), chargerAccueil(doc), accueil(),
 * catalogue(), connait(id) ; installer(id) : un ploxion absent, depuis le dépôt ; partage : la feuille de 0.76
 */
export function creerXers({ W = globalThis.window, boxion, prefs, hud = null, barre = null, fond = null, routeur = () => null, installer = null, partage = null, vibrer = () => {}, defautPrefs = {} }) {
  const D = W.document;
  let liste = null, actif = null;
  async function charger() {
    if (liste) return;
    const [l, a] = await Promise.all([boxion.get('xers', 'liste').catch(() => null), boxion.get('xers', 'actif').catch(() => null)]);
    liste = Array.isArray(l) ? l.filter(x => x && x.id) : [];
    actif = typeof a === 'string' && liste.some(x => x.id === a) ? a : null;
    const neuf = !liste.length;   // un tout premier xer : pas de chill-tekk d'avant à garder
    if (neuf) { const x = { ...(await capturer()), id: 'x1', nom: 'mon xer', icone: '◇' }; liste = [x]; actif = x.id; await ecrire(); }
    else if (!actif) { actif = liste[0].id; await ecrire(); }
    // 〰 (0.94) LE SNAPSHOT DU XER CHILL-TEKK. RS-7 (22.10) : « on va faire une snapshot et créer le xer organique ; avant on avait le xer
    // ploxi0n, maintenant c'est le xer chill-tekk, l'ancien thème est gardé tel qu'il était ». Une fois : une copie du xer actif, au mode
    // chill-tekk, rangée dans « mes xers » (on y revient d'un toucher) ; le xer actif, lui, passe à l'organique (prefs.js fait la même bascule)
    if (!(await boxion.get('xers', 'snapshot-chill-tekk').catch(() => null))) {
      const a = liste.find(x => x.id === actif) || liste[0];
      if (!neuf && a && !liste.some(x => x.id === 'chill-tekk')) {
        const snap = JSON.parse(JSON.stringify(a)); snap.id = 'chill-tekk'; snap.nom = 'chill-tekk'; snap.icone = '◇'; snap.desc = 'le xer d\'avant, tel qu\'il était (snapshot 0.94)'; snap.maj = Date.now();
        snap.prefs = { ...(snap.prefs || {}), mode: 'chill-tekk' };
        const im = await boxion.get('xers', 'fond:' + a.id).catch(() => null); if (im) await boxion.put('xers', 'fond:chill-tekk', im).catch(() => {});
        if (a.prefs && (!a.prefs.mode || a.prefs.mode === 'chill-tekk')) a.prefs = { ...a.prefs, mode: 'organique' };
        liste.push(snap); await ecrire();
      }
      await boxion.put('xers', 'snapshot-chill-tekk', { le: Date.now() }).catch(() => {});
    }
  }
  const ecrire = () => Promise.all([boxion.put('xers', 'liste', liste), boxion.put('xers', 'actif', actif)]).catch(() => {});
  /** l'interface telle qu'elle est maintenant */
  async function capturer() {
    const p = prefs.lire(), r = routeur(), pr = {};
    for (const k of PREFS_XER) if (k in p) pr[k] = typeof p[k] === 'object' && p[k] ? JSON.parse(JSON.stringify(p[k])) : p[k];
    const f = fond ? fond.reglage() : null;
    return { v: 1, prefs: pr, hud: hud ? hud.config() : null, accueil: r && r.docAccueil ? r.docAccueil() : { pages: [], dossiers: [] }, fond: f, barre: barre ? barre.config() : null,
      ploxions: r && r.catalogue ? r.catalogue().filter(x => !x.interne).map(x => x.id).filter(x => ID.test(x)) : [] };
  }
  /** garder le xer actif tel qu'il est (sa photo de fond à part) */
  async function garderActif() {
    await charger();
    const i = liste.findIndex(x => x.id === actif); if (i < 0) return;
    const c = await capturer();
    liste[i] = { ...liste[i], ...c, maj: Date.now() };
    if (fond && c.fond && c.fond.type === 'photo' && fond.image()) await boxion.put('xers', 'fond:' + actif, { url: fond.image() }).catch(() => {});
    await ecrire();
  }
  /** poser un xer : chaque module reçoit sa part */
  async function poser(x) {
    const r = routeur();
    await prefs.regler(nettoyerPrefs(x.prefs, defautPrefs));
    if (hud && x.hud) await hud.regler(x.hud);
    if (barre && x.barre) await barre.regler(x.barre);
    if (fond && x.fond) {
      // la photo de ce xer (gardée à part) ; sans photo, un xer « photo » garde celle qui est là, ou rien
      let f = x.fond;
      if (f.type === 'photo') { const im = await boxion.get('xers', 'fond:' + x.id).catch(() => null); if (im && im.url && fond.poserImage) await fond.poserImage(im.url); else if (!fond.image()) f = { ...f, type: 'aucun' }; }
      await fond.regler(f);
    }
    if (r && r.chargerAccueil) r.chargerAccueil(x.accueil || { pages: [], dossiers: [] });
  }
  function prevenir(x) {
    try { W.dispatchEvent(new W.CustomEvent('jos:xer', { detail: { xer: x.id, nom: x.nom, par: 'ploxi0n' } })); } catch (e) { /* */ }
    try { if (W.jOSPorts && W.jOSPorts.emit) W.jOSPorts.emit('xer', 'change', { xer: x.id, nom: x.nom }); } catch (e) { /* */ }
  }
  async function basculer(id) {
    await charger();
    const x = liste.find(v => v.id === id); if (!x) return false;
    if (id !== actif) await garderActif();
    await poser(x); actif = id; await ecrire();
    vibrer('portion'); prevenir(x);
    const r = routeur(); if (r && r.accueil) r.accueil();
    return true;
  }
  /** un nouveau xer : une copie de l'actif, un modèle par-dessus ; il devient l'actif */
  async function nouveau({ nom, icone, modele } = {}) {
    await garderActif();
    const base = liste.find(v => v.id === actif) || (await capturer()), m = MODELES.find(v => v.id === modele);
    const x = JSON.parse(JSON.stringify({ ...base, maj: Date.now() }));
    x.id = 'x' + Date.now().toString(36); x.nom = nom || (m ? m.nom : 'xer ' + (liste.length + 1)); x.icone = icone || (m ? m.icone : '§'); x.desc = m ? m.desc : '';
    if (m) { x.prefs = { ...x.prefs, ...m.prefs }; if (m.epingler && x.hud) x.hud.epingles = [...new Set([...m.epingler, ...(x.hud.epingles || [])])].slice(0, 4); }
    if (x.fond && x.fond.type === 'photo') { const im = await boxion.get('xers', 'fond:' + base.id).catch(() => null); if (im) await boxion.put('xers', 'fond:' + x.id, im).catch(() => {}); }
    liste.push(x); await ecrire();
    await basculer(x.id);
    return x;
  }
  async function renommer(id, nom, icone) { await charger(); const x = liste.find(v => v.id === id); if (!x) return; if (nom) x.nom = String(nom).slice(0, 40); if (icone) x.icone = String(icone).slice(0, 8); await ecrire(); }
  async function retirer(id) { await charger(); if (id === actif || liste.length < 2) return false; liste = liste.filter(v => v.id !== id); await boxion.del('xers', 'fond:' + id).catch(() => {}); await ecrire(); return true; }
  async function partager(id) {
    await charger(); if (id === actif) await garderActif();
    const x = liste.find(v => v.id === id); if (!x) return null;
    const lien = lienXer(await encoderXer(x));
    if (!partage) return { lien };
    return partage.feuille({ titre: '§ le xer ' + x.nom, lien, texte: 'mon xer « ' + x.nom + ' » pour ploxi0n :', sous: 'son accueil, son dock, sa barre, son mode et ses ' + (x.ploxions || []).length + ' ploxions (pas ta photo de fond). Il s\'ouvre dans ploxi0n.', qr: lien.length <= 2000 });
  }
  /** un xer reçu : nettoyé, ajouté (pas posé) ; rend { xer, manquants } */
  async function recevoir(code) {
    await charger();
    const x = nettoyerXer(await decoderXer(code), defautPrefs); x.id = 'x' + Date.now().toString(36); x.recu = Date.now();
    const r = routeur();
    return { xer: x, manquants: x.ploxions.filter(id => !(r && r.connait && r.connait(id))) };
  }
  async function ajouter(x) { await charger(); liste.push(x); await ecrire(); return x; }

  // ---- le ploxion « mes xers » ----
  function mount(hote, o = {}) {
    let vivant = true, recu = null;
    const msg = (t) => { const m = hote.querySelector('[data-xr-msg]'); if (m) m.textContent = t; };
    async function peindre() {
      await charger(); if (!vivant) return;
      const carte = (x) => '<div class="px-xr' + (x.id === actif ? ' on' : '') + '"><button type="button" class="px-xr-b" data-xr-aller="' + esc(x.id) + '"><span class="px-xr-ic">' + esc(x.icone || '§') + '</span><span><b>' + esc(x.nom) + '</b><small>'
        + esc(x.desc || ((x.prefs && x.prefs.mode) || 'chill-tekk') + ' · ' + (x.ploxions || []).length + ' ploxions') + '</small></span>' + (x.id === actif ? '<em>actif</em>' : '') + '</button>'
        + '<div class="px-xr-a"><button type="button" data-xr-partager="' + esc(x.id) + '">↗ partager</button><button type="button" data-xr-nom="' + esc(x.id) + '">✎ renommer</button>'
        + (x.id !== actif ? '<button type="button" data-xr-retirer="' + esc(x.id) + '">✕</button>' : '') + '</div></div>';
      hote.innerHTML = '<div class="px-page px-xers"><p class="px-grave">§ mes xers</p><p class="px-sous">Le xer, c\'est l\'interface entière sur les mêmes ploxions : l\'accueil, le dock, la barre du haut, le fond, le mode. Change de xer : rien ne se perd, c\'est réversible.</p>'
        + (recu ? '<div class="px-xr-recu"><p class="px-ft">📥 un xer reçu : ' + esc(recu.xer.icone) + ' ' + esc(recu.xer.nom) + '</p><p class="px-sous">' + recu.xer.ploxions.length + ' ploxions'
          + (recu.manquants.length ? ', dont ' + recu.manquants.length + ' que tu n\'as pas (' + esc(recu.manquants.slice(0, 6).join(', ')) + (recu.manquants.length > 6 ? '…' : '') + ')' : ', tous chez toi') + '</p>'
          + '<button type="button" class="px-gros p" data-xr="recu-aller"><b>l\'ajouter et y aller</b><small>ton xer actuel est gardé, tu peux y revenir</small></button>'
          + (recu.manquants.length && installer ? '<label class="px-xr-c"><input type="checkbox" data-xr-installer checked> installer aussi les ploxions qui manquent (réseau)</label>' : '')
          + '<button type="button" data-xr="recu-garder">seulement l\'ajouter</button> <button type="button" data-xr="recu-non">non merci</button></div>' : '')
        + liste.map(carte).join('')
        + '<p class="px-grave">un nouveau xer</p><div class="px-xr-n"><button type="button" data-xr-modele="">⧉ une copie de celui-ci</button>' + MODELES.map(m => '<button type="button" data-xr-modele="' + m.id + '">' + esc(m.icone + ' ' + m.nom) + '</button>').join('') + '</div>'
        + (partage ? '<button type="button" class="px-gros" data-xr="coller"><b>📥 ouvrir un xer reçu</b><small>son lien copié dans un message</small></button>' : '')
        + '<p class="px-sous" data-xr-msg></p></div>';
    }
    async function ouvrirRecu(code) { try { recu = await recevoir(code); } catch (er) { recu = null; msg(er.message); } await peindre(); }
    hote.addEventListener('click', async (e) => {
      const b = e.target.closest('button'); if (!b || !hote.contains(b)) return;
      const g = (a) => b.getAttribute(a);
      try {
        if (b.hasAttribute('data-xr-aller')) { if (g('data-xr-aller') !== actif) { msg('…'); await basculer(g('data-xr-aller')); } else vibrer('selection'); return; }
        if (b.hasAttribute('data-xr-partager')) { vibrer('selection'); await partager(g('data-xr-partager')); return; }
        if (b.hasAttribute('data-xr-nom')) { const x = liste.find(v => v.id === g('data-xr-nom')); const n = x && W.prompt('Le nom de ce xer', x.nom); if (n) { await renommer(x.id, n); await peindre(); } return; }
        if (b.hasAttribute('data-xr-retirer')) { const x = liste.find(v => v.id === g('data-xr-retirer')); if (x && W.confirm('Retirer le xer « ' + x.nom + ' » ? (tes ploxions restent)')) { await retirer(x.id); vibrer('succes'); await peindre(); } return; }
        if (b.hasAttribute('data-xr-modele')) { await nouveau({ modele: g('data-xr-modele') || undefined }); return; }
        const a = g('data-xr');
        if (a === 'recu-aller' || a === 'recu-garder') {
          const x = recu.xer, inst = a === 'recu-aller' && installer && hote.querySelector('[data-xr-installer]') && hote.querySelector('[data-xr-installer]').checked ? recu.manquants : [];
          recu = null; await ajouter(x);
          let ok = 0; for (const id of inst) { msg('installer ' + id + '… (' + (ok + 1) + '/' + inst.length + ')'); try { if (await installer(id)) ok++; } catch (er) { /* un ploxion absent du labo : tant pis */ } }
          if (a === 'recu-aller') await basculer(x.id); else { vibrer('succes'); await peindre(); }
          return;
        }
        if (a === 'recu-non') { recu = null; await peindre(); return; }
        if (a === 'coller') {
          let t = ''; try { const n = W.jOSNatif || {}; t = n.coller ? await n.coller() : await W.navigator.clipboard.readText(); } catch (er) { /* */ }
          const m = /[?&]x=([A-Za-z0-9_-]+)/.exec(String(t || ''));
          if (m) await ouvrirRecu(m[1]); else if (!(partage && await partage.ouvrirLien(t))) msg(t ? 'ce n\'est pas le lien d\'un xer' : 'rien dans le presse-papiers');
          return;
        }
      } catch (er) { msg(er.message || String(er)); vibrer('erreur'); }
    });
    const lien = o && o.params && typeof o.params.lien === 'string' ? o.params.lien : '';
    const code = new URLSearchParams(lien.replace(/^\?/, '')).get('x');
    if (code) ouvrirRecu(code); else peindre();
    return { unmount() { vivant = false; hote.innerHTML = ''; } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps['mes-xers'] = { manifest: { id: 'mes-xers', name: 'mes xers', icon: '§' }, mount };
  return {
    charger, capturer, garderActif, basculer, nouveau, renommer, retirer, partager, recevoir, ajouter,
    liste: async () => { await charger(); return liste.map(x => ({ id: x.id, nom: x.nom, icone: x.icone, actif: x.id === actif })); },
    actif: async () => { await charger(); return liste.find(x => x.id === actif) || null; },
    ploxion: { id: 'mes-xers', nom: 'mes xers', icone: '§', interne: true, cat: 'meta', type: 'ploxion', description: 'Plusieurs xers (l\'interface entière sur les mêmes ploxions) : en changer, en créer, les partager par un lien et un QR', bions: ['jOSXer'] },
  };
}
