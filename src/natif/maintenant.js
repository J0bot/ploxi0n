// ♫ À L'ÉCOUTE (0.48, RS-7 : l'écran verrouillé disait « Spotify Embedded Player », sans pochette, avec ±10 s au lieu de ⏮ ⏭ — « faut
// extrapoler et améliorer ça au max »). Le son des ploxions joue souvent dans un IFRAME d'un autre site (le Spotify Web Playback SDK :
// sdk.scdn.co ; YouTube…) : iOS n'y voit que le titre de cet iframe. L'app reprend la main, sans réécrire un seul ploxion :
//   - SPOTIFY : le Web Playback SDK est branché dès qu'un ploxion le charge (onSpotifyWebPlaybackSDKReady) — titre, artistes, pochette,
//     position, pause ; ⏮ ⏭ ⏯ et la barre de temps pilotent le lecteur du ploxion ;
//   - MEDIA SESSION : un ploxion qui renseigne navigator.mediaSession (metadata, setActionHandler) alors que le son est dans un iframe est
//     relayé de même (quand le son est un <audio>/<video> de la page, iOS le fait déjà : on ne s'en mêle pas) ;
//   - jOSNatif.lecture : publier({ titre, artiste, album, image, duree, position, enLecture }), fin(), surCommande(f) pour les autres.
// Où ça va : l'écran verrouillé et le Centre de contrôle (PloxiApple.lecture : MPNowPlayingInfoCenter + MPRemoteCommandCenter), le
// widget « À l'écoute » (Préférences ploxi0n.lecture → App Group ; la pochette est copiée par l'app), la valeur « musique » (Siri,
// Raccourcis), le bus jOSPorts (natif/lecture), et le mini-lecteur de l'accueil, au-dessus du dock.
import { PloxiApple } from './plugins-app.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** l'état Spotify (player_state_changed) → ce que l'app publie */
export function depuisSpotify(st) {
  const t = st && st.track_window && st.track_window.current_track; if (!t) return null;
  const images = ((t.album && t.album.images) || []).slice().sort((a, b) => (b.width || 0) - (a.width || 0));
  const interdit = (st.disallows || {});
  return { source: 'spotify', titre: t.name || '', artiste: (t.artists || []).map(a => a.name).filter(Boolean).join(', '), album: (t.album && t.album.name) || '',
    image: (images[0] && images[0].url) || '', duree: Math.round((st.duration || t.duration_ms || 0) / 100) / 10, position: Math.round((st.position || 0) / 100) / 10,
    enLecture: !st.paused, suivant: !interdit.skipping_next, precedent: !interdit.skipping_prev, uri: t.uri || '' };
}

export function creerMaintenant({ W = globalThis.window, apple = PloxiApple, courant = () => null, ouvrir = () => {}, valeur = async () => {}, preferences = () => import('@capacitor/preferences'), miniDock = null } = {}) {
  // ▤ (0.51) miniDock : la musique devient UN mini dock (♫ ⏮ ⏯ ⏭) ; sans lui, le mini-lecteur d'avant (.px-maintenant)
  const D = W.document, natif = !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  let etat = null, commandes = {}, ploxion = null, dernierNatif = 0, dernierWidget = '', relance = null, ecoute = false;
  const abonnes = new Set();

  // ---- publier : l'écran verrouillé, le widget, la valeur, le bus, le mini-lecteur ----------------------------------------------------
  const signature = (x) => [x.source, x.titre, x.artiste, x.image, !!x.enLecture, x.suivant, x.precedent].join('|');
  function publier(info, cmds = null) {
    if (!info || !info.titre) return;
    const avant = etat, nouveau = !avant || avant.titre !== info.titre || avant.artiste !== info.artiste;
    if (cmds) commandes = cmds;
    // (0.51) la même chose qui avance : seulement la position (le SDK émet souvent ; chaque emit du bus s'écrit dans le journal xion)
    if (avant && signature(avant) === signature(info)) { avant.position = info.position; avant.duree = info.duree || avant.duree; avant.maj = Date.now(); envoyerNatif(false); return; }
    if (nouveau || !ploxion) ploxion = courant() || ploxion;
    etat = { ...info, ploxion, maj: Date.now() };
    envoyerNatif(nouveau || !avant || !!avant.enLecture !== !!info.enLecture);
    envoyerWidget();
    if (nouveau) valeur('musique', 'À l\'écoute', info.titre + (info.artiste ? ' — ' + info.artiste : '')).catch(() => {});
    try { if (W.jOSPorts && W.jOSPorts.emit) W.jOSPorts.emit('natif', 'lecture', { ...etat }); } catch (e) { /* */ }
    for (const f of abonnes) { try { f({ ...etat }); } catch (e) { /* */ } }
    dessiner();
  }
  function fin() {
    if (!etat) return; etat = null; commandes = {}; ploxion = null;
    if (natif) apple.lectureFin().catch(() => {});
    W.clearInterval(relance); relance = null;
    envoyerWidget(); dessiner();
    for (const f of abonnes) { try { f(null); } catch (e) { /* */ } }
  }
  function envoyerNatif(force) {
    if (!natif || !etat) return;
    const t = Date.now(); if (!force && t - dernierNatif < 4000) return; dernierNatif = t;
    if (!ecoute) { ecoute = true; apple.addListener('lecture', (e) => commander(e && e.commande, e)).catch(() => { ecoute = false; }); }
    apple.lecture({ titre: etat.titre, artiste: etat.artiste || '', album: etat.album || '', image: etat.image || '', duree: +etat.duree || 0, position: +etat.position || 0,
      enLecture: !!etat.enLecture, suivant: etat.suivant !== false, precedent: etat.precedent !== false }).catch(() => {});
    // iOS (et WebKit) peuvent réécrire « À l'écoute » : on le réaffirme toutes les 15 s tant que ça joue
    if (!relance) relance = W.setInterval(() => { if (etat && etat.enLecture) { etat.position = (+etat.position || 0) + 15; envoyerNatif(true); } }, 15000);
  }
  function envoyerWidget() {
    const w = etat ? JSON.stringify({ titre: etat.titre, artiste: etat.artiste || '', album: etat.album || '', image: etat.image || '', enLecture: !!etat.enLecture, ploxion: etat.ploxion || null }) : '';
    if (w === dernierWidget || !natif) return; dernierWidget = w;
    preferences().then(m => (w ? m.Preferences.set({ key: 'ploxi0n.lecture', value: w }) : m.Preferences.remove({ key: 'ploxi0n.lecture' }))).catch(() => {});
  }
  /** une commande (l'écran verrouillé, le Centre de contrôle, les écouteurs, le mini-lecteur, un lien du widget) */
  function commander(c, e = {}) {
    if (!c) return;
    if (c === 'ouvrir') { if (etat && etat.ploxion) ouvrir(etat.ploxion); return; }   // le petit widget « À l'écoute »
    const f = commandes[c] || (c === 'toggle' ? (etat && etat.enLecture ? commandes.pause : commandes.play) : null) || (c === 'play' || c === 'pause' ? commandes.toggle : null);
    if (!f) return;
    try { const r = f(e.position); if (r && r.catch) r.catch(() => {}); } catch (er) { /* le lecteur du ploxion a refusé */ }
    if (etat && (c === 'play' || c === 'pause' || c === 'toggle')) { etat.enLecture = c === 'play' || (c === 'toggle' && !etat.enLecture); envoyerNatif(true); envoyerWidget(); dessiner(); }
  }

  // ---- SPOTIFY : le Web Playback SDK, dès qu'un ploxion le charge -----------------------------------------------------------------------
  // (0.51, d'après le vrai ploxion Spotify du labo) TROIS accroches, pour ne dépendre d'aucun ordre : le rappel onSpotifyWebPlaybackSDKReady,
  // window.Spotify posé (accesseur), et chaque méthode du Player (un Player né avant nous est rattrapé à son prochain appel : le ploxion
  // appelle getCurrentState() chaque seconde). Le démontage (disconnect) et not_ready effacent « à l'écoute ».
  const suivis = new WeakSet(); let spCourant = null;
  function suivreSpotify(p) {
    if (!p || suivis.has(p) || typeof p.addListener !== 'function') return; suivis.add(p);
    try {
      p.addListener('player_state_changed', (st) => {
        if (!st) { if (spCourant === p) { spCourant = null; fin(); } return; }
        const info = depuisSpotify(st); if (!info) return;
        spCourant = p;
        publier(info, { play: () => p.resume(), pause: () => p.pause(), toggle: () => p.togglePlay(), suivant: () => p.nextTrack(), precedent: () => p.previousTrack(),
          seekto: (s) => p.seek(Math.max(0, Math.round((+s || 0) * 1000))) });
      });
      p.addListener('not_ready', () => { if (spCourant === p) { spCourant = null; fin(); } });
      p.addListener('autoplay_failed', () => { if (spCourant === p && etat) { etat.enLecture = false; envoyerNatif(true); envoyerWidget(); dessiner(); } });
    } catch (e) { /* une autre version du SDK */ }
  }
  const METHODES = ['connect', 'addListener', 'getCurrentState', 'togglePlay', 'resume', 'pause', 'nextTrack', 'previousTrack', 'seek'];
  function patcherSpotify() {
    const S = W.Spotify; if (!S || !S.Player) return;
    const P = S.Player.prototype;
    // idempotent méthode par méthode (un SDK peut poser window.Spotify PUIS remplir le prototype : on repasse au rappel « prêt »)
    if (P) {
      try {
        for (const k of METHODES) { const f = P[k]; if (typeof f === 'function' && !f.__ploxi0n) { const g = function (...a) { suivreSpotify(this); return f.apply(this, a); }; g.__ploxi0n = true; P[k] = g; } }
        const dc = P.disconnect;
        if (typeof dc === 'function' && !dc.__ploxi0n) { const g = function (...a) { const r = dc.apply(this, a); if (spCourant === this) { spCourant = null; fin(); } return r; }; g.__ploxi0n = true; P.disconnect = g; }
      } catch (e) { /* prototype gelé */ }
    }
    if (!S.Player.__ploxi0n) {
      try { const Avant = S.Player; class Player extends Avant { constructor(...a) { super(...a); suivreSpotify(this); } } Player.__ploxi0n = true; S.Player = Player; } catch (e) { /* objet gelé : les méthodes suffisent */ }
    }
  }
  try {
    let pret = W.onSpotifyWebPlaybackSDKReady;
    Object.defineProperty(W, 'onSpotifyWebPlaybackSDKReady', { configurable: true,
      get: () => (pret ? (...a) => { patcherSpotify(); return pret(...a); } : pret), set: (f) => { pret = f; } });
  } catch (e) { /* */ }
  try {
    let sp = W.Spotify; if (sp) patcherSpotify();
    Object.defineProperty(W, 'Spotify', { configurable: true, enumerable: true, get: () => sp, set: (v) => { sp = v; patcherSpotify(); } });
  } catch (e) { /* */ }

  // ---- LE BUS DES LECTEURS DU LABO (0.51) : jOSSound (spotify, music, le Lecteur YouTube…) et ploxion.spotify.track — sans le SDK ----------
  let sonSuivi = null, sonMinute = null;
  function depuisSon() {
    const J = W.jOSSound; if (!J || typeof J.list !== 'function') return;
    if (etat && etat.source === 'spotify' && spCourant) return;   // le SDK dit mieux
    let l = []; try { l = J.list() || []; } catch (e) { return; }
    const joue = l.find(x => { try { return x && typeof x.isPaused === 'function' && !x.isPaused(); } catch (e) { return false; } });
    if (!joue) { if (etat && etat.source === 'jossound' && sonSuivi) { const s = l.find(x => x && x.id === sonSuivi); if (!s) fin(); else if (etat.enLecture) { etat.enLecture = false; envoyerNatif(true); envoyerWidget(); dessiner(); } } return; }
    const lire = (f) => { try { return typeof f === 'function' ? String(f() || '') : String(f || ''); } catch (e) { return ''; } };
    const titre = lire(joue.label) || joue.name || joue.id; let sous = lire(joue.sub);
    if (!sous || /^\d+:\d\d( \/ \d+:\d\d)?$|^(lecture|pause)$/i.test(sous)) sous = joue.name || joue.id;
    let image = ''; try { const sn = joue.snapshot && joue.snapshot(); const yt = sn && (sn.ytid || sn.videoId); if (yt) image = 'https://i.ytimg.com/vi/' + encodeURIComponent(yt) + '/hqdefault.jpg'; else if (sn && sn.image) image = String(sn.image); } catch (e) { /* */ }
    sonSuivi = joue.id;
    const f = (k) => () => { try { return joue[k] && joue[k](); } catch (e) { return null; } };
    publier({ source: 'jossound', titre, artiste: sous, image, enLecture: true, suivant: typeof joue.next === 'function', precedent: typeof joue.prev === 'function' },
      { toggle: f('toggle'), play: () => { if (joue.isPaused()) f('toggle')(); }, pause: () => { if (!joue.isPaused()) f('toggle')(); }, suivant: f('next'), precedent: f('prev') });
  }
  const sonDe = (id) => { try { return (W.jOSSound && W.jOSSound.list ? W.jOSSound.list() : []).find(x => x && x.id === id) || null; } catch (e) { return null; } };
  /** à appeler quand jOSPorts et jOSSound existent (main.js, après le shim) : le son des ploxions sans SDK ni Media Session */
  function brancherBus() {
    try { if (W.jOSPorts && W.jOSPorts.on) W.jOSPorts.on('ploxion.spotify.track', (t) => {
      if (!t || !t.title || (etat && etat.source === 'spotify' && spCourant)) return;
      publier({ source: 'bus', titre: String(t.title), artiste: String(t.artist || ''), image: '', duree: (+t.dur || 0) / 1000, position: (+t.pos || 0) / 1000, enLecture: !t.paused, suivant: true, precedent: true },
        // les commandes : sa source jOSSound (toggle, prev, next) ; à défaut, le port transport du ploxion (il ne sait que se mettre en pause)
        { toggle: () => { const x = sonDe('spotify'); return x ? x.toggle() : W.jOSPorts.emit('spotify', 'transport', { paused: false }); }, pause: () => W.jOSPorts.emit('spotify', 'transport', { paused: false }),
          suivant: () => { const x = sonDe('spotify'); return x && x.next && x.next(); }, precedent: () => { const x = sonDe('spotify'); return x && x.prev && x.prev(); } });
    }); } catch (e) { /* */ }
    // jOSSound : un registre sans événements de lecture → un regard toutes les 3 s, seulement tant qu'une source existe
    const regarder = () => { const n = (() => { try { return W.jOSSound && W.jOSSound.list ? W.jOSSound.list().length : 0; } catch (e) { return 0; } })();
      if (n && !sonMinute) sonMinute = W.setInterval(depuisSon, 3000); if (!n && sonMinute) { W.clearInterval(sonMinute); sonMinute = null; depuisSon(); } };
    // le bion jOSSound arrive avec le premier ploxion qui le touche (window.jOSSound = window.jOSSound || …) : on l'attend au passage
    const accrocher = (J) => { try { if (J && J.subscribe && !J.__ploxi0n) { Object.defineProperty(J, '__ploxi0n', { value: true }); J.subscribe(() => { regarder(); W.setTimeout(depuisSon, 50); }); } } catch (e) { /* */ } regarder(); };
    if (W.jOSSound) accrocher(W.jOSSound);
    else { let js; try { Object.defineProperty(W, 'jOSSound', { configurable: true, enumerable: true, get: () => js, set: (v) => { js = v; accrocher(v); } }); } catch (e) { /* */ } }
  }

  // ---- MEDIA SESSION : relayée quand le son vient d'un iframe ---------------------------------------------------------------------------
  const ms = W.navigator && W.navigator.mediaSession;
  if (ms) {
    const proto = Object.getPrototypeOf(ms), d = (k) => Object.getOwnPropertyDescriptor(proto, k);
    const dMeta = d('metadata'), dEtat = d('playbackState'), mains = {}; let pos = null;
    const sonDeLaPage = () => [...D.querySelectorAll('video,audio')].some(m => !m.paused && !m.ended);
    const relayer = () => {
      const m = dMeta && dMeta.get ? dMeta.get.call(ms) : null; if (!m || !m.title || sonDeLaPage()) return;
      if (etat && etat.source === 'spotify') return;   // Spotify a déjà mieux
      const art = (m.artwork || []).slice().sort((a, b) => (parseInt(b.sizes) || 0) - (parseInt(a.sizes) || 0))[0];
      const joue = dEtat && dEtat.get ? dEtat.get.call(ms) !== 'paused' : true;
      publier({ source: 'mediasession', titre: m.title, artiste: m.artist || '', album: m.album || '', image: art ? new W.URL(art.src, W.location.href).href : '',
        duree: pos ? pos.duration : 0, position: pos ? pos.position : 0, enLecture: joue, suivant: !!mains.nexttrack, precedent: !!mains.previoustrack }, {
        play: mains.play && (() => mains.play({ action: 'play' })), pause: mains.pause && (() => mains.pause({ action: 'pause' })),
        suivant: mains.nexttrack && (() => mains.nexttrack({ action: 'nexttrack' })), precedent: mains.previoustrack && (() => mains.previoustrack({ action: 'previoustrack' })),
        seekto: mains.seekto && ((s) => mains.seekto({ action: 'seekto', seekTime: +s || 0 })) });
    };
    try {
      if (dMeta && dMeta.set) Object.defineProperty(ms, 'metadata', { configurable: true, get: () => dMeta.get.call(ms), set: (v) => { dMeta.set.call(ms, v); W.setTimeout(relayer, 0); } });
      if (dEtat && dEtat.set) Object.defineProperty(ms, 'playbackState', { configurable: true, get: () => dEtat.get.call(ms), set: (v) => { dEtat.set.call(ms, v); W.setTimeout(relayer, 0); } });
      const sah = ms.setActionHandler && ms.setActionHandler.bind(ms);
      if (sah) ms.setActionHandler = (k, f) => { mains[k] = f || null; return sah(k, f); };
      const sps = ms.setPositionState && ms.setPositionState.bind(ms);
      if (sps) ms.setPositionState = (p) => { pos = p || null; return sps(p); };
    } catch (e) { /* une Media Session verrouillée : tant pis */ }
  }

  // ---- le mini-lecteur de l'accueil, au-dessus du dock -----------------------------------------------------------------------------------
  let barre = null;
  function dessiner() {
    if (miniDock) return versMiniDock();
    if (!D.body) return;
    if (!etat) { if (barre) barre.hidden = true; return; }
    if (!barre) {
      barre = D.createElement('div'); barre.className = 'px-maintenant'; barre.setAttribute('role', 'region'); barre.setAttribute('aria-label', 'à l\'écoute');
      barre.addEventListener('click', (e) => {
        const b = e.target.closest('[data-lc]'); if (b) { e.stopPropagation(); commander(b.getAttribute('data-lc')); return; }
        if (etat && etat.ploxion) ouvrir(etat.ploxion);
      });
      D.body.appendChild(barre);
    }
    barre.hidden = false;
    barre.innerHTML = (etat.image ? '<img alt="" src="' + esc(etat.image) + '">' : '<span class="px-mt-ic">♫</span>')
      + '<span class="px-mt-t"><b>' + esc(etat.titre) + '</b><small>' + esc(etat.artiste || etat.album || '') + '</small></span>'
      + (etat.precedent !== false && commandes.precedent ? '<button data-lc="precedent" aria-label="précédent">⏮</button>' : '')
      + '<button data-lc="toggle" class="px-mt-p" aria-label="' + (etat.enLecture ? 'pause' : 'lecture') + '">' + (etat.enLecture ? '⏸' : '▶') + '</button>'
      + (etat.suivant !== false && commandes.suivant ? '<button data-lc="suivant" aria-label="suivant">⏭</button>' : '');
    const img = barre.querySelector('img'); if (img) img.onerror = () => { const i = D.createElement('span'); i.className = 'px-mt-ic'; i.textContent = '♫'; img.replaceWith(i); };
  }

  function versMiniDock() {
    if (!etat) { miniDock.retirer('musique'); return; }
    miniDock.publier({ cle: 'musique', ploxion: etat.ploxion || null, titre: etat.titre, sous: etat.artiste || etat.album || '', image: etat.image || '', icone: '♫', enCours: !!etat.enLecture, persiste: !etat.ploxion,
      progression: +etat.duree > 0 ? Math.min(1, (+etat.position || 0) / +etat.duree) : null,
      actions: [...(etat.precedent !== false && commandes.precedent ? [{ id: 'precedent', icone: '⏮', nom: 'précédent', faire: () => commander('precedent') }] : []),
        { id: 'toggle', icone: etat.enLecture ? '⏸' : '▶', nom: etat.enLecture ? 'pause' : 'lecture', on: true, faire: () => commander('toggle') },
        ...(etat.suivant !== false && commandes.suivant ? [{ id: 'suivant', icone: '⏭', nom: 'suivant', faire: () => commander('suivant') }] : [])],
      ouvrir: etat.ploxion ? null : () => {}, fermer: () => { if (commandes.pause) commander('pause'); fin(); } });
  }

  const api = {
    publier: (info) => publier({ source: 'ploxion', ...info }, null),
    fin, etat: () => (etat ? { ...etat } : null),
    surCommande: (f) => { commandes = { play: () => f('play'), pause: () => f('pause'), toggle: () => f('toggle'), suivant: () => f('suivant'), precedent: () => f('precedent'), seekto: (s) => f('seekto', s) }; },
    ecouter: (f) => { abonnes.add(f); return () => abonnes.delete(f); },
  };
  return { api, commander, publier, fin, etat: api.etat, brancherBus, arreter: () => { if (sonMinute) W.clearInterval(sonMinute); sonMinute = null; } };
}
