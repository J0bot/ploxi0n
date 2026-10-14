// ≋ CHILL-SYNTH (0.64). Le brief de RS-7 (14.10) : un mode ambiance audio qui tourne en arrière-plan sur l'iPhone, des visuels qui
// réagissent au son (fractales, Butterchurn) et des haptiques synchronisées. Sources 100 % libres de droits (CC0 d'abord, CC-BY accepté
// avec le crédit affiché ; jamais NC ni ND : on remixe, on sample) ; aucune dépendance à un service tiers à l'exécution ; pas de Spotify
// (son SDK ne donne pas le signal audio, et l'analyse est fermée aux nouvelles apps).
//
// PHASES — une à la fois, validée sur le vrai iPhone avant la suivante :
//   1. LE LECTEUR EN ARRIÈRE-PLAN (ce fichier) : Background Modes « audio » (Info.plist ✓), session .playback. Critère : le son tient
//      10 min écran verrouillé. Deux essais, pour trancher le risque du brief :
//        A = <audio> seul ;   B = <audio> → MediaElementSource → AnalyserNode → la sortie (iOS peut suspendre l'AudioContext).
//      Le ploxion VÉRIFIE lui-même : en revenant, il dit si la piste a avancé pendant que l'écran était verrouillé (bilanArrierePlan).
//      Si B coupe le son : plan B, un plugin natif AVAudioEngine qui joue ET analyse (la FFT côté natif), les bandes envoyées au JS.
//   2. le catalogue (hébergé chez nous : id, titre, url, auteur, licence, preuve_licence_url ; 10 à 20 pistes d'Openverse
//      license=cc0,pdm et de Freesound CC0 pour les ambiances ; la licence et l'auteur copiés au moment du choix) + « garder » hors ligne
//   3. le visuel : Butterchurn d'abord (branché sur l'AnalyserNode), la fractale ensuite ; le rendu se coupe en arrière-plan
//   4. l'haptique : un plugin Swift (CHHapticEngine, ~40 lignes : update({ intensity, sharpness }), pulse()) ; graves → intensité continue,
//      aigus → netteté, onset → une impulsion ; ~30 Hz, lissé ; coupé en économie d'énergie ; inactif en arrière-plan (normal, à ne pas corriger)
//
// LE BUS « audio:bands » { bandes[64], niveau, onset, graves, aigus } ~30 Hz : jOSPorts (si un ploxion s'y abonne) et
// window.ploxi0nAudio.ecouter(cb). Les consommateurs (visuel, haptique, demain les LEDs) s'abonnent, le lecteur ne les connaît pas.
//
// 💭 EXTRAPOLATIONS DU BRIEF (à valider avec RS-7 AVANT de les construire — posées ici pour le braindump) :
//   - le SYNTHÉ GÉNÉRATIF Web Audio : oscillateurs + filtres + réverbération → des nappes chill-synth sans aucun fichier (zéro licence,
//     zéro réseau, le signal déjà dans l'AudioContext) ; en repli hors ligne, voire le mode principal ;
//   - le BUS réutilisable par tout l'écosystème : le même « audio:bands » pour des LEDs, des modules (le Cubion), sans toucher au lecteur ;
//   - des PRESETS visuels : un preset = couleurs + paramètres de la fractale + mapping haptique, choisi par piste ;
//   - le MINUTEUR DE SOMMEIL : un fondu puis l'arrêt (la nuit ; il se marie avec ☾ dodo du tsoin : dire dodo lance le minuteur ?) ;
//   - le CACHE : une taille limite, les pistes les moins écoutées partent d'abord ;
//   - le MODE ÉCONOMIE : batterie basse → visuel à 30 i/s, haptique coupée.
// 💭 RS-7 (14.10) : « il faut qu'on voie aussi son XERBION, et son XERPLOXION » — le chill-synth en est une face ? (à préciser avec lui :
//   le xerbion = le bion du xer, ce qu'il compose ; le xerploxion = le xer vu comme un ploxion) ; questions ouvertes du brief : l'haptique
//   sur le kick (le rythme) ou sur la texture (la nappe) ? le synthé en complément ou à la place ? les fichiers chez Supabase, S3 ou
//   api.j0bot.ch ?

const BANDES = 64;
/** LES BANDES d'une trame de fréquences (Uint8Array 0..255, ≥ 64 cases) ; onset = un coup dans les graves (énergie > 1,45 × sa moyenne
 *  glissante, au-dessus d'un plancher, pas deux à moins de 150 ms). etat : { moy, dernier } gardé d'une trame à l'autre. */
export function analyser(freq, etat = { moy: 0, dernier: -1e9 }, t = 0) {
  const n = freq.length, pas = Math.max(1, Math.floor(n / BANDES)), bandes = new Array(BANDES);
  let somme = 0;
  for (let i = 0; i < BANDES; i++) { let s = 0; for (let j = 0; j < pas; j++) s += freq[i * pas + j] || 0; bandes[i] = s / pas / 255; somme += bandes[i]; }
  const graves = (bandes[0] + bandes[1] + bandes[2] + bandes[3] + bandes[4] + bandes[5]) / 6;
  const aigus = bandes.slice(40).reduce((a, b) => a + b, 0) / (BANDES - 40);
  const onset = graves > 0.18 && graves > etat.moy * 1.45 && t - etat.dernier > 150;
  if (onset) etat.dernier = t;
  etat.moy += (graves - etat.moy) * 0.08;
  return { bandes, niveau: somme / BANDES, onset, graves, aigus };
}
/** LE CRITÈRE DE LA PHASE 1 : pendant que l'écran était caché (verrouillé), la piste a-t-elle avancé ? cache = { t, pos }, retour = { t, pos }
 *  (ms, s) → { duree (s), avance (s), tenu (bool) } */
export function bilanArrierePlan(cache, retour) {
  const duree = Math.max(0, (retour.t - cache.t) / 1000), avance = Math.max(0, retour.pos - cache.pos);
  return { duree: Math.round(duree), avance: Math.round(avance), tenu: duree > 5 && avance >= duree * 0.8 };
}
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mmss = (s) => Math.floor(s / 60) + ' min ' + String(Math.round(s % 60)).padStart(2, '0');

export function creerChillSynth({ W = globalThis.window, boxion = null, vibrer = () => {} } = {}) {
  const D = W.document, abonnes = new Set();
  let audio = null, ctx = null, an = null, src = null, mode = 'A', source = null, minuterie = 0, etat = { moy: 0, dernier: -1e9 }, journal = [], cache = null, dernier = null;
  const ecrire = (l) => { journal = [l, ...journal].slice(0, 12); };
  /** émet sur le bus, ~30 Hz, tant que ça joue (en mode B seulement : le mode A n'a pas de signal) */
  function emettre() {
    if (!an || !audio || audio.paused) return;
    const f = new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(f);
    dernier = analyser(f, etat, Date.now());
    for (const cb of abonnes) { try { cb(dernier); } catch (e) { /* */ } }
    if (W.jOSPorts && W.jOSPorts.emit && W.jOSPorts.topics && W.jOSPorts.topics().includes('ploxion.audio.bands')) { try { W.jOSPorts.emit('audio', 'bands', dernier); } catch (e) { /* */ } }
  }
  function brancherAnalyse() {   // essai B : sur un geste (iOS veut un toucher pour l'AudioContext)
    const AC = W.AudioContext || W.webkitAudioContext; if (!AC || !audio) return false;
    if (!ctx) { ctx = new AC(); src = ctx.createMediaElementSource(audio); an = ctx.createAnalyser(); an.fftSize = 256; an.smoothingTimeConstant = 0.7; src.connect(an); an.connect(ctx.destination); }
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume().catch(() => {});
    if (!minuterie) minuterie = W.setInterval(emettre, 33);
    return true;
  }
  function surVisibilite() {
    if (!audio || audio.paused) return;
    if (D.hidden) { cache = { t: Date.now(), pos: audio.currentTime }; ecrire('caché à ' + new Date().toLocaleTimeString('fr-CH')); return; }
    if (!cache) return;
    const b = bilanArrierePlan(cache, { t: Date.now(), pos: audio.currentTime }); cache = null;
    ecrire((b.tenu ? '✓ le son a tenu ' : '✕ le son s\'est coupé : ') + mmss(b.duree) + ' caché, la piste a avancé de ' + mmss(b.avance) + ' (essai ' + mode + ')');
    if (boxion) boxion.append('chill-synth', { kind: 'essai-arriere-plan', mode, ...b, le: new Date().toISOString() }).catch(() => {});
  }
  D.addEventListener('visibilitychange', surVisibilite);
  function poserSource(s) {
    source = s; if (!audio) { audio = new W.Audio(); audio.loop = true; audio.preload = 'auto'; audio.setAttribute('playsinline', ''); }
    audio.src = s.url;
    const ms = W.navigator && W.navigator.mediaSession;
    if (ms && W.MediaMetadata) { try { ms.metadata = new W.MediaMetadata({ title: s.titre || 'chill-synth', artist: s.auteur || 'ploxi0n', album: 'chill-synth' }); } catch (e) { /* */ } }
  }
  function mount(hote) {
    let image = 0;
    const peindre = () => {
      const joue = audio && !audio.paused;
      hote.innerHTML = '<div class="px-page px-chill"><p class="px-grave">≋ chill-synth · phase 1 : le son en arrière-plan</p>'
        + '<p class="px-sous">Choisis une piste (un fichier à toi, ou une adresse CC0), lance, puis verrouille l\'iPhone 10 minutes. Au retour, le résultat s\'écrit ici.</p>'
        + '<div class="px-chill-src"><label class="px-modif">un fichier…<input type="file" accept="audio/*" data-cs-fichier hidden></label>'
        + '<input type="url" data-cs-url placeholder="https://… (CC0)" value="' + esc(source && !source.local ? source.url : '') + '"></div>'
        + (source ? '<p class="px-chill-piste">' + esc(source.titre || source.url) + (source.licence ? ' · ' + esc(source.licence) + (source.auteur ? ' · ' + esc(source.auteur) : '') : '') + '</p>' : '')
        + '<div class="px-chill-modes"><button data-cs-mode="A" class="' + (mode === 'A' ? 'on' : '') + '">essai A · le son seul</button><button data-cs-mode="B" class="' + (mode === 'B' ? 'on' : '') + '">essai B · avec l\'analyse</button></div>'
        + '<button class="p" data-cs-jouer' + (source ? '' : ' disabled') + '>' + (joue ? '■ arrêter' : '▶ lancer') + '</button>'
        + '<canvas class="px-chill-vu" width="320" height="120"></canvas>'
        + (journal.length ? '<ul class="px-chill-journal">' + journal.map(l => '<li>' + esc(l) + '</li>').join('') + '</ul>' : '') + '</div>';
      dessiner();
    };
    const dessiner = () => {
      W.cancelAnimationFrame(image); image = 0;
      const c = hote.querySelector('.px-chill-vu'); if (!c || !c.getContext) return;
      const g = c.getContext('2d'); if (!g) return;
      const tic = () => {
        image = 0; if (D.hidden || hote.closest('[hidden]') || !c.isConnected) return;   // le rendu se coupe en arrière-plan
        g.clearRect(0, 0, c.width, c.height);
        const d = dernier; if (d) { const l = c.width / BANDES; g.fillStyle = d.onset ? '#ecebe9' : '#7dbfb8'; for (let i = 0; i < BANDES; i++) { const h = d.bandes[i] * c.height; g.fillRect(i * l, c.height - h, l - 1, h); } }
        if (audio && !audio.paused && mode === 'B') image = W.requestAnimationFrame(tic);
      };
      image = W.requestAnimationFrame(tic);
    };
    hote.addEventListener('change', (e) => {
      const f = e.target.closest && e.target.closest('[data-cs-fichier]');
      if (f && f.files && f.files[0]) { const x = f.files[0]; poserSource({ url: W.URL.createObjectURL(x), titre: x.name, local: true, licence: 'ton fichier' }); peindre(); return; }
      const u = e.target.closest && e.target.closest('[data-cs-url]');
      if (u && /^https?:\/\//.test(u.value)) { poserSource({ url: u.value, titre: u.value.split('/').pop() }); if (boxion) boxion.put('reglages', 'chill-synth', { url: u.value }).catch(() => {}); peindre(); }
    });
    hote.addEventListener('click', async (e) => {
      const m = e.target.closest && e.target.closest('[data-cs-mode]');
      if (m) { if (ctx && m.getAttribute('data-cs-mode') === 'A') { ecrire('l\'essai A demande de relancer l\'app (l\'analyse ne se débranche pas)'); } else mode = m.getAttribute('data-cs-mode'); vibrer('selection'); peindre(); return; }
      if (!(e.target.closest && e.target.closest('[data-cs-jouer]')) || !audio) return;
      if (!audio.paused) { audio.pause(); vibrer('leger'); peindre(); return; }
      if (mode === 'B') brancherAnalyse();
      try { await audio.play(); ecrire('▶ lancé (essai ' + mode + ') à ' + new Date().toLocaleTimeString('fr-CH')); vibrer('moyen'); } catch (er) { ecrire('✕ ' + (er.message || er)); }
      peindre();
    });
    if (!source && boxion) boxion.get('reglages', 'chill-synth').then(v => { if (v && v.url && !source) { poserSource({ url: v.url, titre: v.url.split('/').pop() }); peindre(); } }).catch(() => {});
    peindre();
    return { unmount() { W.cancelAnimationFrame(image); if (audio) audio.pause(); hote.innerHTML = ''; } };
  }
  W.ploxi0nAudio = { ecouter(cb) { abonnes.add(cb); return () => abonnes.delete(cb); }, dernier: () => dernier };
  W.jOSApps = W.jOSApps || {};
  W.jOSApps['chill-synth'] = { manifest: { id: 'chill-synth', name: 'chill-synth', icon: '≋' }, mount };
  return { ploxion: { id: 'chill-synth', nom: 'chill-synth', icone: '≋', interne: true, cat: 'musique' }, analyser, journal: () => journal.slice() };
}
