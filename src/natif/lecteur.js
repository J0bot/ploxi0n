// 🎞 LE LECTEUR NATIF (RS-7 12.10 : « améliorer le lecteur sur iPhone, utiliser les trucs natifs ; actuellement c'est pas très fonctionnel,
// surtout avec Stremio ou YouTube » ; « un retour haptique du son qu'on écoute »). Le shim améliore CHAQUE <video>/<audio> que les ploxions
// créent, sans les réécrire :
//   - lecture dans la page (playsinline), AirPlay, Picture in Picture permis ; plein écran = le lecteur natif d'iOS (webkitEnterFullscreen)
//   - l'écran verrouillé et le Centre de contrôle : titre, icône, ▶︎ ⏸ ±15 s, la barre de temps (Media Session) ; le son continue écran
//     verrouillé et en mode silencieux (AppDelegate : AVAudioSession .playback + UIBackgroundModes audio)
//   - YouTube : un <iframe> youtube(-nocookie).com/embed passe par https://labo.j0bot.ch/app/yt/<id> (une page https : YouTube refuse les
//     intégrations sans référent https — erreur 152/153 depuis capacitor://)
//   - l'HAPTIQUE DU SON : l'énergie des basses → des vibrations (un toc par attaque, plus fort quand ça cogne). Seulement pour un son
//     lisible par WebAudio (même origine, blob, ou crossOrigin) : sinon WebAudio rendrait le son MUET — donc rien (YouTube, la plupart des flux).
// Réglages : boxion_local « reglages/lecteur » = { yt: true, haptiqueSon: true }.
export function installerLecteur({ W = globalThis.window, boxion, vibrer = () => {}, source = 'https://labo.j0bot.ch', titre = () => 'ploxi0n', surMedia = null }) {
  const D = W.document;
  let reglage = { yt: true, haptiqueSon: true };
  const pret = boxion.get('reglages', 'lecteur').then(v => { if (v && typeof v === 'object') reglage = { ...reglage, ...v }; }).catch(() => {});
  const vus = new WeakSet();
  // (0.54, RS-7 : « une app avec un lecteur vidéo prend tout l'écran et ça crash ; il faudrait le PiP automatique ») une vidéo lancée AVANT
  // que l'observateur ne pose playsinline partait dans le plein écran de WebKit : posé au moment même de play(), avec le PiP automatique
  try {
    const P = W.HTMLMediaElement && W.HTMLMediaElement.prototype, jouer = P && P.play;
    if (jouer && !jouer.__ploxi0n) {
      const nouveau = function (...a) { if (this.tagName === 'VIDEO') { this.setAttribute('playsinline', ''); this.setAttribute('webkit-playsinline', ''); this.setAttribute('autopictureinpicture', ''); } return jouer.apply(this, a); };
      nouveau.__ploxi0n = true; P.play = nouveau;
    }
  } catch (e) { /* */ }

  // ---- YouTube : par une page https du labo ----
  const ytId = (src) => { const m = /(?:youtube(?:-nocookie)?\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/.exec(src || ''); return m ? m[1] : null; };
  function iframe(f) {
    if (!reglage.yt || vus.has(f)) return; const id = ytId(f.getAttribute('src')); if (!id) return;
    vus.add(f);
    let q = ''; try { const u = new W.URL(f.getAttribute('src'), 'https://www.youtube.com'); const garde = ['start', 'autoplay', 'list', 'loop', 'mute']; q = garde.filter(k => u.searchParams.has(k)).map(k => k + '=' + encodeURIComponent(u.searchParams.get(k))).join('&'); } catch (e) { /* */ }
    f.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
    f.setAttribute('allowfullscreen', '');
    f.setAttribute('src', source + '/app/yt/' + id + (q ? '?' + q : ''));
  }

  // ---- un <video>/<audio> : natif autant que possible ----
  function media(m) {
    if (vus.has(m)) return; vus.add(m);
    if (m.tagName === 'VIDEO') { m.setAttribute('playsinline', ''); m.setAttribute('webkit-playsinline', ''); m.setAttribute('x-webkit-airplay', 'allow'); try { m.disablePictureInPicture = false; } catch (e) { /* */ } }
    m.addEventListener('play', () => { session(m); if (reglage.haptiqueSon) haptiqueSon(m); });
    if (surMedia) { try { surMedia(m); } catch (e) { /* */ } }   // 🎞 (0.49) le lecteur intégré : illisible ou muette → natif
  }
  // l'écran verrouillé, le Centre de contrôle
  function session(m) {
    const ms = W.navigator.mediaSession; if (!ms) return;
    try {
      ms.metadata = new W.MediaMetadata({ title: m.getAttribute('title') || m.dataset.titre || D.title || titre(), artist: titre(), artwork: [{ src: '/icons/ploxi0n-1024.png', sizes: '1024x1024', type: 'image/png' }] });
      const a = (k, f) => { try { ms.setActionHandler(k, f); } catch (e) { /* action inconnue ici */ } };
      a('play', () => m.play()); a('pause', () => m.pause());
      a('seekbackward', (d) => { m.currentTime = Math.max(0, m.currentTime - ((d && d.seekOffset) || 15)); });
      a('seekforward', (d) => { m.currentTime = Math.min(m.duration || Infinity, m.currentTime + ((d && d.seekOffset) || 15)); });
      a('seekto', (d) => { if (d && d.seekTime != null) m.currentTime = d.seekTime; });
      const pos = () => { try { if (isFinite(m.duration)) ms.setPositionState({ duration: m.duration, playbackRate: m.playbackRate, position: Math.min(m.currentTime, m.duration) }); } catch (e) { /* */ } };
      m.addEventListener('timeupdate', pos); m.addEventListener('ratechange', pos); pos();
      ms.playbackState = 'playing'; m.addEventListener('pause', () => { ms.playbackState = 'paused'; }, { once: true });
    } catch (e) { /* Media Session absente */ }
  }

  // ---- l'haptique du son ----
  let ctx = null; const sources = new WeakMap();
  const fractale = () => { const r = D.getElementById('ploxi0n'); return !!(r && r.classList.contains('px-fx')); };
  function lisible(m) {
    const s = m.currentSrc || m.src || ''; if (!s) return false;
    if (/^(blob|data):/.test(s)) return true;
    try { return new W.URL(s, W.location.href).origin === W.location.origin || m.crossOrigin != null; } catch (e) { return false; }
  }
  function haptiqueSon(m) {
    if (!lisible(m)) return;   // sinon WebAudio le rendrait muet : jamais
    try {
      const AC = W.AudioContext || W.webkitAudioContext; if (!AC) return;
      ctx = ctx || new AC(); if (ctx.state === 'suspended') ctx.resume();
      let a = sources.get(m);
      if (!a) { const src = ctx.createMediaElementSource(m), an = ctx.createAnalyser(); an.fftSize = 512; src.connect(an); an.connect(ctx.destination); a = { an, buf: new Uint8Array(an.frequencyBinCount), moyenne: 0, dernier: 0 }; sources.set(m, a); }
      const n = a.tour = (a.tour || 0) + 1;   // un seul battement par élément (pause → lecture pendant l'attente de la fractale : pas deux boucles)
      const boucle = () => {
        if (a.tour !== n || m.paused || m.ended || D.hidden || !reglage.haptiqueSon) return;   // rien quand rien ne joue ou que l'écran est caché (Pi 4 : jamais de rAF invisible)
        // (0.63) la fractale (#ploxi0n.px-fx) a ses crans : le son se tait, un regard par battement, et plus de rAF pendant le geste
        if (fractale()) { W.setTimeout(boucle, 250); return; }
        a.an.getByteFrequencyData(a.buf);
        let e = 0; for (let i = 1; i < 12; i++) e += a.buf[i]; e /= 11;   // les basses (≈ 40–500 Hz)
        const t = W.performance.now();
        if (e > 90 && e > a.moyenne * 1.35 && t - a.dernier > 110) { a.dernier = t; vibrer(e > 200 ? 'fort' : e > 150 ? 'moyen' : 'leger'); }
        a.moyenne = a.moyenne * 0.9 + e * 0.1;
        W.requestAnimationFrame(boucle);
      };
      W.requestAnimationFrame(boucle);
    } catch (e) { /* un élément déjà relié ailleurs : on laisse le son tranquille */ }
  }

  // ---- tout ce que les ploxions créent ----
  function balayer(n) {
    if (!n || n.nodeType !== 1) return;
    if (n.tagName === 'VIDEO' || n.tagName === 'AUDIO') media(n); else if (n.tagName === 'IFRAME') iframe(n);
    if (n.querySelectorAll) for (const x of n.querySelectorAll('video,audio,iframe')) balayer(x);
  }
  pret.then(() => {
    balayer(D.body);
    new W.MutationObserver((l) => { for (const r of l) { for (const n of r.addedNodes) balayer(n); if (r.type === 'attributes' && r.target.tagName === 'IFRAME') { vus.delete(r.target); iframe(r.target); } } })
      .observe(D.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
  });
  return {
    pret, reglage: () => ({ ...reglage }),
    async regler(patch) { reglage = { ...reglage, ...patch }; await boxion.put('reglages', 'lecteur', reglage); },
    pip(m) { if (m && m.webkitSetPresentationMode) m.webkitSetPresentationMode('picture-in-picture'); else if (m && m.requestPictureInPicture) return m.requestPictureInPicture(); },
    pleinEcran(m) { if (m && m.webkitEnterFullscreen) m.webkitEnterFullscreen(); },
    airplay(m) { if (m && m.webkitShowPlaybackTargetPicker) m.webkitShowPlaybackTargetPicker(); },
  };
}
