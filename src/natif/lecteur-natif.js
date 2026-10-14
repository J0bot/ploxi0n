// 🎞 LE LECTEUR INTÉGRÉ, côté page (0.49, RS-7 : « pour le ploxion stremio, il faut lui donner un lecteur intégré »). Le lecteur natif de
// l'app (PloxiLecteur : Apple d'abord — PiP, AirPlay, écran verrouillé —, VLC en repli pour MKV, DTS, sous-titres) pour tous les ploxions,
// sans les réécrire :
//   - jOSNatif.lecteur.ouvrir(url, { titre, position, moteur, entetes, sousTitres }) ; il reprend où on s'était arrêté (par adresse) ;
//   - le PLUGION jOSPlayer (0.51 : le VRAI bion lecteur du labo — Stremio, Ciné, Ouvrir, le Lecteur, la forge) : play(url, { title, key,
//     onNext, subs, pos }) d'un flux → le lecteur natif ; la reprise partagée avec Stremio (localStorage xb:resume:<key>, jOSPlayer.mark),
//     l'épisode suivant (onNext) à la fin, les sous-titres de Stremio, et le lecteur du web en repli si l'iPhone ne sait pas le lire ;
//     jOSPlayer.natif dit au labo ce que l'iPhone lit (Stremio peut cesser de masquer l'AC3/DTS). (jOSplayer, minuscule : celui de
//     boxion-rt, open/embed — le labo ne le sert pas) ;
//   - une <video> que la WebView ne sait pas lire (MKV, codec) → le lecteur natif, tout seul ; une vidéo SANS SON (AC3/DTS que la WebView
//     décode mal) → une bulle « pas de son ? ▶ lecteur natif » ;
//   - les liens vers les lecteurs externes (vlc://, infuse://, outplayer://, nplayer-…) restent dans l'app ;
//   - ploxi0n://lire?url=…&titre=…&position=… (le bouton « ▶ ploxi0n » d'un ploxion SEUL, dans Safari : docs/LECTEUR.md).
// Réglages : boxion_local « reglages/lecteur-natif » = { moteur: auto|apple|vlc, auto: true } ; « lecteur-positions/<clé> » = { position, duree, le }.
//
// 🛡 LA GARDE (0.63, RS-7 sur les builds 0.60.1/0.62 : « des fois y a un lecteur vidéo random qui pop et ça crash » ; « ou soit ça s'ouvre en
// boucle et ça reste bloqué, ça marche jamais »). creerLecteurNatif({ garde: true }) (main.js) : le lecteur natif ne se présente que
//   - sur un TOUCHER récent (navigator.userActivation, ou un pointerup / Entrée de la page il y a moins de 1,5 s) — et un toucher = UNE
//     présentation (le natif qui échoue → le web qui échoue → le natif… : la boucle n'a plus de geste pour repartir) ;
//   - pour le ploxion À L'ÉCRAN : pas un hôte [hidden], pas une carte de la fractale (#ploxi0n.px-fx), pas la page cachée ni l'app inactive ;
//   - un seul à la fois : rien tant qu'un autre est en vol ou à l'écran (UIKit : présenter pendant une présentation = le plantage), sauf un
//     nouveau toucher de la page après coup (le PiP) ;
//   - un DISJONCTEUR par adresse : 2 échecs natifs, ou 3 ouvertures en 30 s → plus de natif pour elle jusqu'au prochain lancement ;
//   sinon : la bulle « ▶ » (un toucher de plus), jamais une réouverture toute seule — ni la reprise (xb:resume) au lancement, ni un ploxion
//   caché qui lance sa vidéo, ni un câble de la forge. Seule exception : l'épisode suivant (onNext), la suite d'une lecture déjà à l'écran.
import { PloxiLecteur } from './plugins-app.js';

const VIDEO = /\.(mp4|m4v|mov|mkv|avi|webm|wmv|flv|ts|m2ts|m3u8|mpd|ogv|vob|divx)(\?|#|$)/i;
/** l'adresse du flux derrière un lien vers un lecteur externe (vlc://, infuse://x-callback-url/play?url=…, nplayer-https://…) — ou null */
export function fluxDuLienExterne(href) {
  const h = String(href || '').trim();
  const m = /^(vlc|vlc-x-callback|infuse|outplayer|nplayer-https?|nplayer|vidhub|senplayer|playerxtreme|kmplayer)(:\/\/|:)(.*)$/i.exec(h); if (!m) return null;
  if (/^nplayer-https?$/i.test(m[1])) return m[1].slice(8) + '://' + m[3];
  const q = /[?&]url=([^&]+)/i.exec(h); if (q) { try { return decodeURIComponent(q[1]); } catch (e) { return q[1]; } }
  const reste = m[3].replace(/^\/+/, '');
  if (/^https?:\/\//i.test(reste)) return reste;
  if (/^https?%3A/i.test(reste)) { try { return decodeURIComponent(reste); } catch (e) { /* */ } }
  return null;
}
const cleDe = (url) => { let h = 0; const s = String(url).replace(/[?#].*$/, ''); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return 'p' + (h >>> 0).toString(36); };
const hms = (s) => { s = Math.round(+s || 0); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s % 60).padStart(2, '0'); };
// 🛡 les seuils de la garde : un toucher vaut 1,5 s ; l'activation du navigateur (WebKit : ≤ 5 s) n'est pas réutilisée ; l'entrée d'un lecteur
// (l'animation d'UIKit) ; une rafale pointerup + click = un seul toucher ; un lecteur jamais vu « en lecture » est oublié après 15 s
const FENETRE = 1500, FENETRE_UA = 5000, ENTREE = 800, RAFALE = 600, OUBLI = 15000, ECHECS = 2, OUVERTURES = 3, TRENTE = 30000;

export function creerLecteurNatif({ W = globalThis.window, boxion, plugin = PloxiLecteur, vibrer = () => {}, titre = () => '', garde = false } = {}) {
  const D = W.document, natif = !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  let reglage = { moteur: 'auto', auto: true }, moteurs = null, ecoute = false, courant = null;
  const pret = boxion.get('reglages', 'lecteur-natif').then(v => { if (v && typeof v === 'object') reglage = { ...reglage, ...v }; }).catch(() => {});
  const abonnes = new Set();

  // ---- 🛡 (0.63) la garde ------------------------------------------------------------------------------------------------------------------
  // garde : true, ou { maintenant, activation, fiable } (les tests : une horloge, une activation, des événements jsdom tenus pour vrais)
  const G = garde ? (typeof garde === 'object' ? garde : {}) : null;
  const maintenant = (G && G.maintenant) || (() => Date.now());
  const activation = (G && G.activation) || (() => { try { const ua = W.navigator.userActivation; return !!(ua && ua.isActive); } catch (e) { return false; } });
  const fiable = (G && G.fiable) || ((e) => e.isTrusted !== false);
  let geste = { t: -Infinity, cible: null, pris: false }, prisA = -Infinity, scene = null, inactif = false, suite = 0;
  const disjoncteur = new Map(), attente = new Set();
  /** à l'écran ? la page visible, l'app active, pas la fractale ; l'élément d'un ploxion : connecté, sous aucun [hidden], pas une carte */
  function surScene(el) {
    if (D.hidden || inactif) return false;
    const r = D.getElementById('ploxi0n'); if (r && r.classList.contains('px-fx')) return false;
    if (!el || !el.closest) return true;
    if (!el.isConnected || el.closest('[hidden]')) return false;
    const h = el.closest('.px-hote'); return !h || !h.classList.contains('px-fx-carte');
  }
  /** un toucher disponible ? le nôtre (pas encore pris), l'épisode suivant, ou l'activation du navigateur (un toucher dans un iframe) */
  function gesteDispo() {
    const t = maintenant();
    if (suite && t < suite) return true;
    if (t - geste.t < FENETRE) return !geste.pris;
    return activation() && t - prisA > FENETRE_UA;
  }
  function prendre() { geste.pris = true; prisA = maintenant(); suite = 0; }
  const enScene = () => { if (scene && !scene.vu && maintenant() - scene.t > OUBLI) scene = null; return scene; };
  const fiche = (url) => { const k = cleDe(url); let d = disjoncteur.get(k); if (!d) disjoncteur.set(k, d = { echecs: 0, ouvertures: [], coupe: false }); return d; };
  const coupe = (url) => { const d = disjoncteur.get(cleDe(url)); return !!(d && d.coupe); };
  const echecsDe = (url) => { const d = disjoncteur.get(cleDe(url)); return d ? d.echecs : 0; };
  function echec(url) { const d = fiche(url); if (++d.echecs >= ECHECS) d.coupe = true; }
  function ouverture(url) { const d = fiche(url), t = maintenant(); d.ouvertures = d.ouvertures.filter(x => t - x < TRENTE).concat(t); if (d.ouvertures.length >= OUVERTURES) d.coupe = true; }
  /** null (on peut présenter) ou la raison : 'cache' (pas à l'écran) · 'coupe' (le disjoncteur) · 'vol' (un autre en cours) · 'geste' (aucun toucher) */
  function refus(url, el) {
    if (!G) return null;
    const ctx = el || (maintenant() - geste.t < FENETRE && geste.cible && geste.cible.isConnected ? geste.cible : null);   // le ploxion qu'on vient de toucher
    if (!surScene(ctx)) return 'cache';
    if (url && coupe(url)) return 'coupe';
    const sc = enScene(); if (sc && !(geste.t > sc.t + ENTREE && gesteDispo())) return 'vol';
    return gesteDispo() ? null : 'geste';
  }
  if (G) {
    const toucher = (e) => {
      if (!fiable(e) || (e.type === 'keyup' && e.key !== 'Enter' && e.key !== ' ')) return;
      const t = maintenant(), meme = t - geste.t < RAFALE;
      geste = { t, cible: e.target, pris: meme ? geste.pris : false }; inactif = false;
      // une vidéo illisible d'un ploxion caché : la bulle quand on revient la toucher (jamais le lecteur tout seul)
      if (attente.size) for (const x of [...attente]) { if (!x.m.isConnected) { attente.delete(x); continue; } const zone = x.m.parentElement || x.m; if (e.target && zone.contains(e.target) && surScene(x.m)) { attente.delete(x); proposer('geste', x.s, { titre: x.titre, el: x.m }); } }
    };
    for (const type of ['pointerup', 'keyup', 'click']) D.addEventListener(type, toucher, true);
    D.addEventListener('visibilitychange', () => { if (!D.hidden) inactif = false; });
  }

  async function lesMoteurs() { if (moteurs) return moteurs; if (!natif) return { apple: false, vlc: false }; try { moteurs = await plugin.moteurs(); } catch (e) { moteurs = { apple: false, vlc: false }; } return moteurs; }
  function ecouter() {
    if (ecoute || !natif) return; ecoute = true;
    plugin.addListener('lecteur', async (e) => {
      if (!e) return;
      if (G) {   // 🛡 la scène : en vol → à l'écran (lecture) → libre (fermé, fini, échoué) ; un échec compte pour le disjoncteur
        if (e.etat === 'lecture' && scene) scene.vu = true;
        if (e.etat === 'erreur' && courant) echec(courant.url);
        if (e.etat === 'ferme' || e.etat === 'fin' || e.etat === 'erreur') scene = null;
      }
      if (!courant) return;
      if (e.etat === 'position' || e.etat === 'ferme') {
        if (e.position > 5) await boxion.put('lecteur-positions', courant.cle, { position: e.position, duree: e.duree || 0, titre: courant.titre, url: courant.url, le: Date.now() }).catch(() => {});
      }
      if (e.etat === 'fin') await boxion.del('lecteur-positions', courant.cle).catch(() => {});
      if (e.etat === 'erreur') vibrer('erreur');
      try { if (W.jOSPorts && W.jOSPorts.emit) W.jOSPorts.emit('natif', 'lecteur', { ...e, url: courant.url, titre: courant.titre }); } catch (er) { /* */ }
      for (const f of abonnes) { try { f({ ...e, url: courant.url, titre: courant.titre }); } catch (er) { /* */ } }
      if (e.etat === 'ferme' || e.etat === 'fin') courant = null;
    }).catch(() => { ecoute = false; });
  }
  /** ouvrir une vidéo dans le lecteur natif ; il reprend où on s'était arrêté (sauf position donnée). Avec la garde, un refus rejette
   *  (erreur.garde = la raison) après avoir proposé la bulle (ou o.surRefus(raison) : le repli de l'appelant). o.el : l'élément d'où ça vient. */
  async function ouvrir(url, o = {}) {
    if (!natif) throw new Error('le lecteur natif : sur l\'iPhone');
    const adresse = String(url || ''); if (!/^https?:\/\//i.test(adresse) && !/^file:/i.test(adresse)) throw new Error('adresse de vidéo illisible');
    if (G) {   // avant tout await : le toucher se lit MAINTENANT
      const r = refus(adresse, o.el);
      if (r) { try { (o.surRefus || proposer)(r, adresse, o); } catch (er) { /* */ } const er = new Error('🛡 lecteur natif retenu : ' + r); er.garde = r; throw er; }
      prendre(); scene = { url: adresse, t: maintenant(), vu: false }; ouverture(adresse);
    }
    const sc = scene;
    await pret; ecouter();
    const cle = o.cle || cleDe(adresse);
    let position = o.position;
    if (position == null) { const p = await boxion.get('lecteur-positions', cle).catch(() => null); position = p && p.position > 30 && (!p.duree || p.position < p.duree - 60) ? p.position : 0; }
    courant = { cle, url: adresse, titre: o.titre || titre() || '' };
    vibrer('ouvrir');
    // les sous-titres : des adresses, ou les objets de Stremio { url, lang, label }
    const sous = (Array.isArray(o.sousTitres) ? o.sousTitres : []).map(x => (typeof x === 'string' ? x : x && x.url)).filter(x => /^https?:\/\//i.test(String(x || ''))).slice(0, 12);
    try { return await plugin.ouvrir({ url: adresse, titre: courant.titre, position: +position || 0, moteur: o.moteur || reglage.moteur, entetes: o.entetes || {}, sousTitres: sous }); }
    catch (e) { if (G) { if (scene === sc) scene = null; echec(adresse); } throw e; }
  }
  /** 🛡 la bulle à la place du lecteur : un toucher dessus = le geste qui manquait. 'cache' et 'vol' sans toucher : rien (pas de surprise) */
  function proposer(r, url, o = {}) {
    if (r === 'geste' || (r === 'vol' && gesteDispo())) bulle('🎞 ' + (o.titre || 'une vidéo') + (o.position > 30 ? ' · reprendre à ' + hms(o.position) : ''), '▶ lecteur de l\'iPhone', () => ouvrir(url, o).catch(() => {}), null, 'p' + cleDe(url));
    else if (r === 'coupe') bulle('🎞 l\'iPhone n\'arrive pas à lire ce flux', null, null, null, 'p' + cleDe(url));
    else if (r === 'cache' && !o.el && (D.hidden || inactif)) {   // l'app revient (ploxi0n://lire depuis Safari) : la bulle quand la page est là
      const f = () => { if (!surScene(null)) return; D.removeEventListener('visibilitychange', f); proposer('geste', url, o); };
      D.addEventListener('visibilitychange', f); W.setTimeout(f, 1200);
    }
  }
  /** 🛡 le repli web d'un flux coupé : tout de suite sur un toucher, sinon par la bulle */
  function versWeb(texte, web, cle) { if (gesteDispo()) { prendre(); web(); } else bulle(texte, '▶ lecteur web', () => { prendre(); web(); }, null, cle); }

  // ---- le PLUGION jOSPlayer (le bion lecteur du labo) / jOSplayer (boxion-rt) -------------------------------------------------------------
  const WEB = /(youtu\.?be|youtube(-nocookie)?\.com|twitch\.tv)/i, fluxConnus = new Set();
  /** un flux pour le lecteur natif ? (pas YouTube, Twitch, une playlist .m3u, un blob: ; le réglage « tout seul ») */
  const pourNatif = (u, o = {}) => natif && reglage.auto !== false && /^https?:\/\//i.test(u) && !o.ytid && !o.channel && !o.list && !WEB.test(u) && !/\.m3u(\?|#|$)/i.test(u);
  /** VLC d'emblée pour ce que l'Apple ne lit pas (MKV, AVI, DTS, TrueHD), si VLC est dans l'app ; sinon le réglage décide */
  const indiceMoteur = (u) => { let d = String(u); try { d = decodeURIComponent(d); } catch (e) { /* */ } return moteurs && moteurs.vlc && /\.(mkv|avi|webm|wmv|flv)\b|\bdts\b|truehd/i.test(d) ? 'vlc' : undefined; };
  /** la suite d'une lecture lancée par jOSPlayer : la reprise (partagée avec Stremio), l'épisode suivant, le repli web sur une erreur */
  function suivre(u, o, b, web) {
    const off = () => abonnes.delete(f);
    const f = (e) => {
      if (!e || e.url !== u) return;
      if ((e.etat === 'position' || e.etat === 'ferme') && e.position > 5) {
        if (o.key) { try { W.localStorage.setItem('xb:resume:' + o.key, String(Math.round(e.position))); } catch (er) { /* */ } }
        try { if (b.mark) b.mark(u, e.position); } catch (er) { /* */ }
      }
      if (e.etat === 'fin') {
        off(); if (o.key) { try { W.localStorage.removeItem('xb:resume:' + o.key); } catch (er) { /* */ } }
        // l'épisode suivant — 🛡 la seule présentation sans toucher : la suite de celle qui vient de finir, à l'écran
        if (typeof o.onNext === 'function') W.setTimeout(() => { if (G) suite = maintenant() + 4000; try { o.onNext(); } catch (er) { /* */ } }, 700);
        return;
      }
      if (e.etat === 'erreur') { off(); bulle('🎞 ' + (e.raison || 'l\'iPhone ne lit pas ce flux'), '▶ lecteur web', () => { if (G) prendre(); web(); }, null, 'j' + cleDe(u)); return; }
      if (e.etat === 'ferme') off();
    };
    abonnes.add(f); return off;
  }
  const estVideo = (b, url) => { try { const r = b.resolve ? b.resolve(url) : null; return (r && r.kind === 'video') || VIDEO.test(String(url || '')); } catch (e) { return VIDEO.test(String(url || '')); } };
  function brancherJosPlayer(b) {
    if (!b || b.__lecteurNatif) return false;
    let fait = false;
    // jOSPlayer (le labo) : play(url, opts) — le seul passage de chaque flux de Stremio, Ciné, Ouvrir, le Lecteur
    if (typeof b.play === 'function') {
      const play = b.play.bind(b); fait = true;
      b.play = (url, o) => {
        o = o || {}; const u = String(url || '');
        if (!pourNatif(u, o)) return play(url, o);
        try { if (b._record) b._record(u, o); } catch (e) { /* l'historique du Lecteur */ }
        fluxConnus.add(u);
        let pos = o.pos;
        if (pos == null && o.key) { try { pos = +W.localStorage.getItem('xb:resume:' + o.key) || undefined; } catch (e) { /* */ } }
        if (pos == null && b.resumeAt) { try { pos = +b.resumeAt(u) || undefined; } catch (e) { /* */ } }
        const web = () => play(url, o), off = suivre(u, o, b, web), cle = 'j' + cleDe(u), webPris = () => { if (G) prendre(); web(); };   // choisir le web = ce toucher n'ira pas au natif
        // 🛡 un refus : la reprise, un ploxion qui monte, la forge — la bulle (▶ iPhone, ou le web), jamais le lecteur tout seul
        const surRefus = (r) => {
          off();
          if (r === 'coupe') versWeb('🎞 ' + (o.title || 'ce flux') + ' : l\'iPhone ne le lit pas', web, cle);
          else if (r === 'geste' || (r === 'vol' && gesteDispo())) bulle('🎞 ' + (o.title || 'une vidéo') + (pos > 30 ? ' · reprendre à ' + hms(pos) : ''), '▶ lecteur de l\'iPhone', () => b.play(url, o), ['web', webPris], cle);
        };
        ouvrir(u, { titre: o.title || '', cle: o.key ? 'jOSPlayer:' + o.key : undefined, position: pos > 30 ? pos : undefined, sousTitres: o.subs || [], moteur: indiceMoteur(u), surRefus })
          .catch((e) => { if (e && e.garde) return; off(); web(); });   // le toucher est déjà pris : si le web échoue, il ne relancera pas le natif
      };
      // ce que l'iPhone lit, pour le labo (Stremio : ne plus masquer l'AC3 ; avec VLC, ni le DTS ni le MKV)
      lesMoteurs().then(m => { try { b.natif = capacites(m); } catch (e) { /* */ } }).catch(() => {});
    }
    const open = b.open && b.open.bind(b), embed = b.embed && b.embed.bind(b);
    if (open || embed) fait = true;
    if (!fait) return false;
    try { Object.defineProperty(b, '__lecteurNatif', { value: true, enumerable: false }); } catch (e) { /* */ }
    if (open) b.open = (url, ...a) => (natif && reglage.auto !== false && url && estVideo(b, url)
      ? ouvrir(url, { surRefus: (r) => (r === 'coupe' ? versWeb('🎞 l\'iPhone ne lit pas ce flux', () => open(url, ...a), 'o' + cleDe(url)) : proposer(r, url)) })
        .catch((e) => (e && e.garde ? null : open(url, ...a)))
      : open(url, ...a));
    if (embed) b.embed = (cible, url, ...a) => {
      if (!(natif && reglage.auto !== false && url && estVideo(b, url))) return embed(cible, url, ...a);
      const el = typeof cible === 'string' ? D.getElementById(cible) : cible;
      if (el) { el.innerHTML = '<button type="button" style="position:absolute;inset:0;width:100%;border:0;background:#000;color:#ddd6ea;font:600 14px system-ui">▶ lecture dans le lecteur de l\'iPhone</button>'; const bt = el.firstChild; bt.onclick = () => ouvrir(url, { el: bt }).catch(() => {}); }
      // 🛡 sans toucher (un embed au montage), le bouton reste : c'est lui, le « ▶ »
      ouvrir(url, { el: el || undefined, surRefus: (r) => { if (r === 'coupe') embed(cible, url, ...a); } }).catch((e) => { if (!(e && e.garde)) embed(cible, url, ...a); });
      return { kind: 'video', src: url, who: 'lecteur natif' };
    };
    return true;
  }
  /** ce que le lecteur de l'iPhone lit (jOSPlayer.natif, jOSNatif.lecteur.capacites) */
  function capacites(m) {
    m = m || {};
    return { lecteur: 'ploxi0n', apple: !!m.apple, vlc: !!m.vlc, son: ['aac', 'mp3', 'ac3', 'eac3', 'flac', 'alac'].concat(m.vlc ? ['dts', 'truehd', 'opus', 'vorbis'] : []),
      conteneurs: ['mp4', 'm4v', 'mov', 'm3u8'].concat(m.vlc ? ['mkv', 'avi', 'webm', 'ts'] : []), video: ['h264', 'hevc'].concat(m.vlc ? ['av1', 'vp9', 'mpeg2'] : []) };
  }

  // ---- une <video> de la page : illisible → natif ; muette → la bulle ------------------------------------------------------------------
  const vus = new WeakSet();
  function surMedia(m) {
    if (!natif || vus.has(m) || m.tagName !== 'VIDEO') return; vus.add(m);
    const src = () => m.currentSrc || m.src || (m.querySelector('source') || {}).src || '';
    m.addEventListener('error', () => {
      const e = m.error, s = src();
      if (reglage.auto === false || !e || (e.code !== 4 && e.code !== 3) || !/^https?:/i.test(s)) return;
      const t = m.getAttribute('title') || '';
      if (G) {
        // 🛡 le natif a déjà échoué pour ce flux : ni la page ni l'iPhone ne le lisent — on le dit, on ne relance rien (LA boucle)
        if (echecsDe(s) || coupe(s)) { if (surScene(m)) bulle('🎞 ni la page ni l\'iPhone ne lisent cette vidéo', null, null, null, 'm' + cleDe(s)); return; }
        if (!surScene(m)) { attente.add({ m, s, titre: t }); return; }   // un ploxion caché, la fractale : la bulle quand on reviendra la toucher
      }
      ouvrir(s, { titre: t, el: m }).catch(() => {});   // 🛡 sans toucher : la bulle « ▶ lecteur de l'iPhone »
    });
    let verifie = false;
    m.addEventListener('timeupdate', () => {
      if (verifie || m.currentTime < 4) return; verifie = true;
      if (m.muted || m.volume === 0 || typeof m.webkitAudioDecodedByteCount !== 'number' || m.webkitAudioDecodedByteCount > 0) return;
      const s = src(); if (!/^https?:/i.test(s) || (G && !surScene(m))) return;
      bulle('🔇 pas de son ? (AC3/DTS)', '▶ lecteur natif', () => { m.pause(); ouvrir(s, { titre: m.getAttribute('title') || '', position: m.currentTime, el: m }).catch(() => {}); }, null, 's' + cleDe(s));
    });
  }
  /** une bulle : un texte, une action (et une seconde : [nom, f]), ✕ ; une seule par clé */
  function bulle(texte, action, f, autre, cle) {
    if (cle) for (const x of D.querySelectorAll('.px-bulle-lecteur')) if (x.dataset.cle === cle) x.remove();
    const b = D.createElement('div'); b.className = 'px-bulle px-bulle-lecteur'; if (cle) b.dataset.cle = cle;
    const s = D.createElement('span'); s.textContent = texte; b.appendChild(s);
    // l'action AVANT de retirer la bulle : son bouton est encore là, à l'écran — c'est le toucher que la garde lit
    const bouton = (nom, g) => { const x = D.createElement('button'); x.type = 'button'; x.textContent = nom; x.onclick = () => { try { g(); } finally { b.remove(); } }; b.appendChild(x); };
    if (action && f) bouton(action, f);
    if (autre) bouton(autre[0], autre[1]);
    const x = D.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'fermer'); x.textContent = '✕'; x.onclick = () => b.remove(); b.appendChild(x);
    (D.getElementById('ploxi0n') || D.body).appendChild(b);
    W.setTimeout(() => b.remove(), 15000);
    return b;
  }

  // ---- les liens vers les lecteurs externes, et window.open d'un flux vidéo -------------------------------------------------------------
  if (natif) {
    D.addEventListener('click', (e) => {
      if (reglage.auto === false) return;
      const a = e.target && e.target.closest && e.target.closest('a[href]'); if (!a) return;
      const flux = fluxDuLienExterne(a.getAttribute('href')); if (!flux) return;
      e.preventDefault(); e.stopPropagation(); ouvrir(flux, { titre: a.textContent.trim().slice(0, 120), el: a }).catch(() => {});
    }, true);
  }
  /** window.open d'un flux (vlc://, une vidéo, un flux que jOSPlayer a déjà donné) → le lecteur natif. À poser APRÈS installerWebNatif (main.js) :
   *  web-natif envoie toute adresse https à Safari (SFSafariViewController) ; ce patch passe devant. */
  function brancherOuvrir() {
    if (!natif || W.open && W.open.__lecteurNatif) return false;
    const avant = W.open && W.open.bind(W);
    const o = (u, ...a) => {
      const s = String(u || '');
      const flux = reglage.auto !== false && s ? (fluxDuLienExterne(s) || (/^https?:/i.test(s) && (VIDEO.test(s) || fluxConnus.has(s)) ? s : null)) : null;
      if (flux) { ouvrir(flux).catch(() => {}); return null; }
      return avant ? avant(u, ...a) : null;
    };
    try { Object.defineProperty(o, '__lecteurNatif', { value: true }); } catch (e) { /* */ }
    try { W.open = o; } catch (e) { try { Object.defineProperty(W, 'open', { configurable: true, writable: true, value: o }); } catch (er) { return false; } }
    return true;
  }
  if (natif) pret.then(() => lesMoteurs()).catch(() => {});

  const api = {
    ouvrir, moteurs: lesMoteurs, fermer: () => { scene = null; return natif ? plugin.fermer() : Promise.resolve(); },
    reprises: async () => (await boxion.list('lecteur-positions').catch(() => [])).length,
    capacites: async () => capacites(await lesMoteurs()),
    surEvenement: (f) => { abonnes.add(f); return () => abonnes.delete(f); },
  };
  /** 🛡 la garde, pour main.js : permis(el) (un plein écran du web : à l'écran, sur un toucher récent — pris ou non —, pas par-dessus le lecteur
   *  natif), aLEcran(el), toucheRecent() (un toucher il y a moins de 1,5 s), occupe() (le lecteur natif en vol ou à l'écran), arrierePlan()
   *  (l'app devient inactive : plus rien jusqu'au prochain toucher ou au retour de la page), etat() (les tests) */
  const gardeApi = {
    actif: !!G,
    permis: (el) => !G || (surScene(el) && !enScene() && (maintenant() - geste.t < FENETRE || activation())),
    aLEcran: (el) => !G || surScene(el),
    toucheRecent: () => !!G && maintenant() - geste.t < FENETRE,
    occupe: () => !!(G && enScene()),
    arrierePlan: () => { if (G) inactif = true; },
    etat: () => ({ scene: scene ? { ...scene } : null, coupes: [...disjoncteur].filter(([, d]) => d.coupe).map(([k]) => k), echecs: (u) => echecsDe(u), coupe: (u) => coupe(u) }),
  };
  return {
    api, pret, surMedia, brancherJosPlayer, brancherOuvrir, ouvrir, moteurs: lesMoteurs, garde: gardeApi,
    reglage: () => ({ ...reglage }),
    async regler(patch) { reglage = { ...reglage, ...patch }; await boxion.put('reglages', 'lecteur-natif', reglage); },
  };
}
