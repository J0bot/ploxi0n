// ≋ LE SYNTHÉ : FAIRE DU SON AVEC DES KNOBS (0.99.4, RS-7 24.10 : « et qu'on puisse commencer à faire du son avec des knobs »).
// Compose : les knobs du labo (jOSKnob, embarqué : public/bions/jOSKnob.js), le son en réglages (src/bions/son.js), la boucle de la basse
// de Proche (src/bions/proche.js : MOTIFS, GAMMES, partition, notesEntre). Rien à télécharger, tout est fabriqué sur place (Web Audio) :
//   deux oscillateurs désaccordés + un sub → un filtre passe-bas (son enveloppe, un lfo) → l'enveloppe du volume → l'écho → la sortie ;
//   16 pads dans la gamme (plusieurs doigts à la fois), une boucle au tempo, un oscilloscope qui montre le son ; tes sons gardés.
// Tourner un knob change le son EN DIRECT, même d'une note tenue. Le son continue quand on change de ploxion ; ‹ le coupe.
import { PARAMS, GROUPES, PRESETS, normaliser, noteDePad, hasard, freq, ONDES } from '../bions/son.js';
import { MOTIFS, GAMMES, partition, notesEntre, pasValides } from '../bions/proche.js';
import { brancherPanneau } from '../bions/tordre.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NOMS_GROUPES = { source: '∿ la source', filtre: '◇ le filtre', enveloppe: '△ l\'enveloppe', mouvement: '○ le mouvement', espace: '□ l\'espace', sortie: '◉ la sortie' };

/** le moteur : un graphe Web Audio vivant ; p = les réglages (normalisés), relus à chaque note et à chaque knob.
 *  voix : osc 1 + osc 2 (intervalle, désaccord, vibrato) + sub + bruit → filtre (type, enveloppe, lfo) → ADSR → panoramique (stéréo)
 *  → bus → saturation → trémolo → [sec | écho (retour) | réverb (taille)] → sortie → (analyse) → les haut-parleurs */
export function creerMoteur(ctx, lire, { vers = null } = {}) {   /* vers : où va le son (un <audio> pour l'arrière-plan) ; sinon les haut-parleurs */
  const sortie = ctx.createGain(), bus = ctx.createGain(), sat = ctx.createWaveShaper ? ctx.createWaveShaper() : ctx.createGain(), trem = ctx.createGain();
  const sec = ctx.createGain(), mouille = ctx.createGain(), echo = ctx.createDelay(2), retour = ctx.createGain();
  const verb = ctx.createConvolver ? ctx.createConvolver() : null, verbG = ctx.createGain();
  const analyse = ctx.createAnalyser ? ctx.createAnalyser() : null;
  bus.connect(sat); sat.connect(trem);
  trem.connect(sec); sec.connect(sortie);
  trem.connect(echo); echo.connect(retour); retour.connect(echo); echo.connect(mouille); mouille.connect(sortie);
  if (verb) { trem.connect(verb); verb.connect(verbG); verbG.connect(sortie); }
  if (analyse) { analyse.fftSize = 1024; sortie.connect(analyse); }
  sortie.connect(vers || ctx.destination);
  const lfo = ctx.createOscillator(), lfoG = ctx.createGain(), vibG = ctx.createGain(), tremG = ctx.createGain();
  lfo.connect(lfoG); lfo.connect(vibG); lfo.connect(tremG); tremG.connect(trem.gain); lfo.start();
  // le bruit : un tampon blanc de 2 s, partagé
  let bruitT = null; const bruit = () => { if (!bruitT && ctx.createBuffer) { const n = Math.floor((ctx.sampleRate || 44100) * 2); bruitT = ctx.createBuffer(1, n, ctx.sampleRate || 44100); const d = bruitT.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; } return bruitT; };
  // la saturation : une courbe douce (tanh), refaite seulement quand le knob bouge
  let satK = -1; const courbe = (k) => { const n = 1024, c = new Float32Array(n), a = 1 + k * 24; for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; c[i] = Math.tanh(a * x) / Math.tanh(a); } return c; };
  // la réverb : une réponse fabriquée (du bruit qui s'éteint en `taille` secondes), refaite quand la taille change
  let verbT = -1, verbAttente = 0; const reponse = (t) => { if (!ctx.createBuffer) return null; const sr = ctx.sampleRate || 44100, n = Math.floor(sr * t), b = ctx.createBuffer(2, n, sr);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); } return b; };
  const voix = new Map(); let n = 0, derniere = 0, cote = 1;
  const filtreType = (v) => ['lowpass', 'bandpass', 'highpass'][Math.round(v)] || 'lowpass';
  function appliquer() {
    const p = lire(), t = ctx.currentTime;
    sortie.gain.setTargetAtTime(p.volume * 0.8, t, 0.02); echo.delayTime.setTargetAtTime(p.echo, t, 0.05);
    retour.gain.setTargetAtTime(p.retour, t, 0.03); mouille.gain.setTargetAtTime(p.mix, t, 0.03); sec.gain.setTargetAtTime(1 - p.mix * 0.5, t, 0.03);
    lfo.type = ONDES[Math.round(p.lfoOnde)] || 'triangle';
    lfo.frequency.setTargetAtTime(p.lfo, t, 0.05); lfoG.gain.setTargetAtTime(p.lfoProf * p.coupure, t, 0.05);
    vibG.gain.setTargetAtTime(p.vibrato * 40, t, 0.05);   // en cents
    trem.gain.setTargetAtTime(1 - p.tremolo * 0.5, t, 0.03); tremG.gain.setTargetAtTime(p.tremolo * 0.5, t, 0.03);
    verbG.gain.setTargetAtTime(p.reverb * 0.9, t, 0.05);
    if (sat.curve !== undefined && Math.abs(satK - p.saturation) > 0.01) { satK = p.saturation; sat.curve = p.saturation > 0.01 ? courbe(p.saturation) : null; }
    if (verb && Math.abs(verbT - p.taille) > 0.05) { verbT = p.taille; clearTimeout(verbAttente); verbAttente = setTimeout(() => { try { verb.buffer = reponse(p.taille); } catch (e) { /* */ } }, 120); }
    for (const v of voix.values()) {   // en direct, même une note tenue
      v.fl.type = filtreType(p.filtre); v.fl.Q.setTargetAtTime(p.resonance, t, 0.02);
      if (!v.lache) v.fl.frequency.setTargetAtTime(p.coupure, t, 0.03);
      v.os[0].type = ONDES[Math.round(p.onde)] || 'sawtooth'; v.os[1].type = ONDES[Math.round(p.onde2)] || 'sawtooth';
      v.os[0].detune.setTargetAtTime(p.desaccord, t, 0.02); v.os[1].detune.setTargetAtTime(p.intervalle * 100 - p.desaccord, t, 0.02);
      v.subG.gain.setTargetAtTime(p.sub * 0.6, t, 0.03); if (v.bruitG) v.bruitG.gain.setTargetAtTime(p.bruit * 0.5, t, 0.03);
      if (v.pan) v.pan.pan.setTargetAtTime(v.cote * p.stereo * 0.8, t, 0.05);
    }
  }
  /** une note qui commence à quand (secondes du contexte) ; rend son id */
  function debut(midi, quand = ctx.currentTime) {
    const p = lire(), f = freq(midi), t = Math.max(ctx.currentTime, quand);
    const os = [ctx.createOscillator(), ctx.createOscillator()], sub = ctx.createOscillator(), subG = ctx.createGain(), fl = ctx.createBiquadFilter(), vca = ctx.createGain(), mixO = ctx.createGain();
    os[0].type = ONDES[Math.round(p.onde)] || 'sawtooth'; os[1].type = ONDES[Math.round(p.onde2)] || 'sawtooth';
    os.forEach((o, i) => {
      if (p.glisse > 0.005 && derniere) { o.frequency.setValueAtTime(derniere, t); o.frequency.exponentialRampToValueAtTime(f, t + p.glisse); } else o.frequency.value = f;
      o.detune.value = i ? p.intervalle * 100 - p.desaccord : p.desaccord; vibG.connect(o.detune); o.connect(mixO);
    });
    sub.type = 'sine'; sub.frequency.value = f / 2; subG.gain.value = p.sub * 0.6; sub.connect(subG); subG.connect(fl);
    let src = null, bruitG = null;
    if (p.bruit > 0.01 && bruit() && ctx.createBufferSource) { src = ctx.createBufferSource(); src.buffer = bruit(); src.loop = true; bruitG = ctx.createGain(); bruitG.gain.value = p.bruit * 0.5; src.connect(bruitG); bruitG.connect(fl); }
    mixO.gain.value = 0.3; mixO.connect(fl);
    fl.type = filtreType(p.filtre); fl.Q.value = p.resonance; lfoG.connect(fl.frequency);
    const haut = Math.min(18000, p.coupure * (1 + p.enveloppe * 7));
    fl.frequency.setValueAtTime(haut, t); fl.frequency.setTargetAtTime(p.coupure, t + p.attaque, Math.max(0.01, p.declin / 3));
    vca.gain.setValueAtTime(0.0001, t); vca.gain.linearRampToValueAtTime(0.5, t + p.attaque);
    vca.gain.setTargetAtTime(0.5 * Math.max(0.0001, p.maintien), t + p.attaque, Math.max(0.01, p.declin / 3));
    fl.connect(vca);
    cote = -cote; let pan = null;
    if (ctx.createStereoPanner) { pan = ctx.createStereoPanner(); pan.pan.value = cote * p.stereo * 0.8; vca.connect(pan); pan.connect(bus); } else vca.connect(bus);
    for (const o of [...os, sub]) o.start(t); if (src) src.start(t);
    derniere = f;
    const id = ++n; voix.set(id, { os, sub, subG, src, bruitG, fl, vca, pan, cote, lache: false, debut: t }); return id;
  }
  /** relâcher (à quand) : la relâche, puis tout s'arrête et se débranche */
  function fin(id, quand = ctx.currentTime) {
    const v = voix.get(id); if (!v || v.lache) return; v.lache = true;
    const p = lire(), t = Math.max(ctx.currentTime, quand, v.debut + 0.005);
    v.vca.gain.cancelScheduledValues(t); v.vca.gain.setTargetAtTime(0.0001, t, Math.max(0.01, p.relache / 4));
    const stop = t + p.relache * 1.6 + 0.05;
    for (const o of [...v.os, v.sub, ...(v.src ? [v.src] : [])]) { try { o.stop(stop); } catch (e) { /* déjà */ } }
    v.os[0].onended = () => { voix.delete(id); for (const o of v.os) { try { vibG.disconnect(o.detune); } catch (e) { /* */ } } try { lfoG.disconnect(v.fl.frequency); } catch (e) { /* */ } try { (v.pan || v.vca).disconnect(); } catch (e) { /* */ } };
  }
  function toutCouper() { for (const id of [...voix.keys()]) fin(id); }
  appliquer();
  return { debut, fin, appliquer, toutCouper, analyse, actives: () => [...voix.values()].filter(v => !v.lache).length, voix: () => voix.size,
    fermer() { toutCouper(); try { lfo.stop(); } catch (e) { /* */ } } };
}

// (0.99.10) l'inclinaison de l'iPhone tourne deux knobs (gauche-droite, avant-arrière) ; ces paires-là, au choix
export const PAIRES = [['coupure', 'resonance'], ['lfo', 'lfoProf'], ['echo', 'retour'], ['vibrato', 'tremolo'], ['saturation', 'reverb'], ['desaccord', 'sub']];
const LOG = new Set(['coupure', 'lfo', 'attaque', 'declin', 'relache', 'echo', 'taille']);
/** une inclinaison (u ∈ [0, 1]) → la valeur d'un knob (les fréquences et les temps en échelle logarithmique, comme l'oreille) */
export function valeurInclinee(cle, u) {
  const x = PARAMS.find(q => q.cle === cle); if (!x) return null; u = Math.max(0, Math.min(1, u));
  const v = LOG.has(cle) && x.min > 0 ? x.min * Math.pow(x.max / x.min, u) : x.min + (x.max - x.min) * u; return Math.round(v * 1e6) / 1e6;
}

export function creerSynthe({ W = globalThis.window, boxion, vibrer = () => {}, Contexte = W && (W.AudioContext || W.webkitAudioContext), proche = null }) {
  const D = W.document;
  let sortieAudio = null, partage = false, partageAttente = 0, penche = null, paire = 0, pencheRaf = 0, pencheDer = null;
  let pas = MOTIFS.tekk.slice();   // (0.99.16) le pas à pas : 16 cases, un degré de la gamme ou rien (motif 'mien')
  let p = normaliser(PRESETS['basse tekk']), sons = [], gamme = 'mineur', motif = 'tekk', ctx = null, m = null, boucle = null, ordo = 0, jusque = 0, garde = 0, peindre = () => {};
  const pret = Promise.all([boxion.get('reglages', 'synthe').catch(() => null), boxion.get('reglages', 'synthe-sons').catch(() => null)]).then(([r, s]) => {
    if (r && typeof r === 'object') { p = normaliser(r.p || r); if (GAMMES[r.gamme]) gamme = r.gamme; const pv = pasValides(r.pas); if (pv) pas = pv; if (MOTIFS[r.motif] || (r.motif === 'mien' && pv)) motif = r.motif; }
    if (Array.isArray(s)) sons = s.filter(x => x && x.nom).slice(0, 40).map(x => ({ nom: String(x.nom).slice(0, 30), p: normaliser(x.p) }));
  });
  const garder = () => { W.clearTimeout(garde); garde = W.setTimeout(() => boxion.put('reglages', 'synthe', { p, gamme, motif, pas }).catch(() => {}), 400); };
  function moteur() {   // créé au premier geste (iOS n'ouvre le son qu'après un toucher)
    if (!ctx && Contexte) { try { ctx = new Contexte(); } catch (e) { ctx = null; } }
    if (!ctx) return null;
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume().catch(() => {});
    if (!m) {   // (0.99.10) par un <audio> : iOS le joue en arrière-plan (écran verrouillé), le routeur voit qu'il joue
      let vers = null;
      if (ctx.createMediaStreamDestination && D && D.createElement) {
        try { const dest = ctx.createMediaStreamDestination(); const au = D.createElement('audio'); au.setAttribute('playsinline', ''); au.srcObject = dest.stream; au.style.display = 'none'; (D.body || D.documentElement).appendChild(au);
          const pl = au.play(); if (pl && pl.catch) pl.catch(() => {}); vers = dest; sortieAudio = au;
          if (W.navigator && W.navigator.mediaSession && W.MediaMetadata) W.navigator.mediaSession.metadata = new W.MediaMetadata({ title: 'Synthé', artist: 'ploxi0n' }); } catch (e) { vers = null; }
      }
      m = creerMoteur(ctx, () => p, { vers });
      if (m.analyse) { W.__pxSon = W.__pxSon || new Set(); W.__pxSon.add(m.analyse); }   /* (0.99.11) le téléphone vivant bat avec ce son */
    }
    if (W.__pxSonReveil) W.__pxSonReveil();   // une note part : le bord écoute
    return m;
  }
  function regler(nouveaux, { doux = true } = {}) {
    p = normaliser({ ...p, ...nouveaux }); if (m) m.appliquer(); garder(); if (doux) peindre('knobs');
    if (partage) { W.clearTimeout(partageAttente); partageAttente = W.setTimeout(envoyerProche, 200); }   // tordre un knob : tout le monde l'entend
  }
  // ---- (0.99.10) jouer à plusieurs : le son du synthé part dans Proche (la basse partagée porte ses 33 réglages) ----
  const tonique = () => Math.max(24, Math.min(52, 36 + p.transpose + 12 * p.octave));
  function envoyerProche() { if (!partage || !proche) return; const r = proche.hebergerBasse({ tempo: p.tempo, motif, pas, gamme, tonique: tonique(), volume: p.volume, son: { ...p } }); if (!r) { partage = false; peindre(); } }
  function partager(oui) {
    if (!oui) { if (partage && proche) proche.arreterBasse(); partage = false; peindre(); return true; }
    if (!proche || !proche.etat().actif) return false;   // Proche d'abord : la salle, les autres
    arreterBoucle(); partage = true; envoyerProche(); peindre(); return true;
  }
  // ---- (0.99.10) pencher l'iPhone : deux knobs ----
  function surPenche(ev) { pencheDer = ev; if (!pencheRaf) pencheRaf = (W.requestAnimationFrame || ((f) => W.setTimeout(f, 33)))(() => { pencheRaf = 0; const e = pencheDer; if (!e || !penche) return;
    const [kx, ky] = PAIRES[paire], ux = ((+e.gamma || 0) + 45) / 90, uy = ((+e.beta || 0) - 10) / 70;
    regler({ [kx]: valeurInclinee(kx, ux), [ky]: valeurInclinee(ky, uy) }); }); }
  function pencher(oui) {
    if (oui && !penche) { penche = true; W.addEventListener('deviceorientation', surPenche); vibrer('selection'); }
    else if (!oui && penche) { penche = null; W.removeEventListener('deviceorientation', surPenche); }
    peindre(); return !!penche;
  }
  // ---- la boucle : la partition de la basse de Proche, jouée par ce son-ci ----
  function lancerBoucle() {
    const mo = moteur(); if (!mo) return false;
    boucle = { debut: Date.now() + 120 }; jusque = 0; W.clearInterval(ordo);
    ordo = W.setInterval(() => {
      if (!boucle) return;
      const pa = partition({ tempo: p.tempo, motif, pas, tonique: 36, gamme, debut: boucle.debut, volume: 1 }), maintenant = Date.now(), de = Math.max(maintenant, jusque), a = maintenant + 220;
      const unPas = 60000 / p.tempo / 4;
      for (const nt of notesEntre(pa, de, a)) {   // le swing retarde les contretemps ; la durée = le gate
        const k = Math.round((nt.t - boucle.debut) / unPas), sw = k % 2 ? p.swing * unPas * 0.5 : 0;
        const q = ctx.currentTime + Math.max(0, (nt.t + sw - maintenant) / 1000), id = mo.debut(nt.midi + p.transpose, q); mo.fin(id, q + Math.max(0.03, unPas * p.gate / 1000));
      }
      jusque = a;
    }, 60);
    peindre(); return true;
  }
  function arreterBoucle() { boucle = null; W.clearInterval(ordo); ordo = 0; peindre(); }

  /** jOSKnob, le bion du labo : déjà là, sinon depuis le pack de l'app (comme l'atelier des peaux) */
  function knobs() {
    if (W.jOSKnob) return Promise.resolve(W.jOSKnob);
    return new Promise((ok, ko) => { const s = D.createElement('script'); s.src = 'bions/jOSKnob.js'; s.dataset.bion = 'jOSKnob'; s.onload = () => (W.jOSKnob ? ok(W.jOSKnob) : ko(new Error('jOSKnob'))); s.onerror = ko; D.head.appendChild(s); });
  }

  function mount(hote) {
    let vivant = true, panneaux = [], raf = 0; const detacher = [];
    const doigts = new Map();
    hote.innerHTML = '<div class="px-page px-synthe" data-neurones="fin"><p class="px-grave">≋ synthé</p>'
      + '<p class="px-sous">Tourne les knobs, touche les pads : le son change en direct. Plusieurs doigts à la fois.</p>'
      + '<div class="px-sy-jouer"><canvas class="px-sy-scope" data-sy-scope height="70" aria-hidden="true"></canvas>'
      + '<div class="px-sy-pads" data-sy-pads data-neurones="fin" data-instrument></div>'
      + '<div class="px-sy-l"><button type="button" data-sy="boucle"></button><div class="px-sy-seg" data-sy-motifs></div></div>'
      + '<div class="px-sy-seq" data-sy-seq data-instrument hidden></div>'   /* (0.99.16) le pas à pas : 16 pas × 8 degrés de la gamme */
      + '<div class="px-sy-seg px-sy-plus"><button type="button" data-sy="pencher"></button><button type="button" data-sy="paire"></button><button type="button" data-sy="proche"></button></div><p class="px-sy-msg" data-sy-msg hidden></p>'
      + '<div class="px-sy-seg" data-sy-gammes></div></div>'   /* (0.99.5) deux colonnes en paysage : jouer à gauche, régler à droite */
      + '<div class="px-sy-regler"><div data-sy-k data-instrument></div>'
      + '<h3 class="px-sy-t">◈ les sons</h3><div class="px-sy-seg" data-sy-presets></div><div class="px-sy-seg" data-sy-sons data-ecrit></div>'
      + '<div class="px-sy-garder"><input type="text" maxlength="30" placeholder="le nom de ce son" data-sy-nom><button type="button" data-sy="garder">＋ garder</button></div></div></div>';
    const $ = (s) => hote.querySelector(s);
    function peindrePads() {
      $('[data-sy-pads]').innerHTML = Array.from({ length: 16 }, (_, i) => { const idx = (3 - Math.floor(i / 4)) * 4 + (i % 4);   // grave en bas à gauche, aigu en haut à droite
        return '<button type="button" class="px-sy-pad" data-neurone data-sy-pad="' + idx + '" aria-label="note ' + (idx + 1) + '"><i></i></button>'; }).join('');
    }
    function peindreChoix() {
      const b = $('[data-sy="boucle"]'); b.textContent = boucle ? '■ la boucle' : '▷ la boucle'; b.classList.toggle('on', !!boucle);
      const pe = $('[data-sy="pencher"]'), pa2 = $('[data-sy="paire"]'), pr = $('[data-sy="proche"]'), nom = (k) => (PARAMS.find(q => q.cle === k) || {}).nom || k;
      pe.textContent = penche ? '⟲ penché' : '⟲ pencher'; pe.classList.toggle('on', !!penche);
      pa2.textContent = nom(PAIRES[paire][0]) + ' × ' + nom(PAIRES[paire][1]);
      pr.textContent = partage ? '◉ partagé dans Proche' : '◉ dans Proche'; pr.classList.toggle('on', partage);
      $('[data-sy-motifs]').innerHTML = Object.keys(MOTIFS).map(k => '<button type="button" data-sy-motif="' + k + '"' + (k === motif ? ' class="on"' : '') + '>' + k + '</button>').join('')
        + '<button type="button" data-sy-motif="mien"' + (motif === 'mien' ? ' class="on"' : '') + '>⊞ à moi</button>';
      peindreSeq();
      $('[data-sy-gammes]').innerHTML = Object.keys(GAMMES).map(k => '<button type="button" data-sy-gamme="' + k + '"' + (k === gamme ? ' class="on"' : '') + '>' + k + '</button>').join('');
      $('[data-sy-presets]').innerHTML = Object.keys(PRESETS).map(k => '<button type="button" data-sy-preset="' + esc(k) + '">' + esc(k) + '</button>').join('') + '<button type="button" data-sy="hasard">⁂ hasard</button>';
      $('[data-sy-sons]').innerHTML = sons.map((s, i) => '<button type="button" data-sy-son="' + i + '">' + esc(s.nom) + '</button>').join('');
    }
    // le pas à pas : une colonne par pas (16), une ligne par degré (le grave en bas) ; une note par pas ; toucher = poser / enlever
    let ici = -1;
    function peindreSeq() {
      const z = $('[data-sy-seq]'); z.hidden = motif !== 'mien'; if (z.hidden) return;
      let h = '<div class="px-sy-grille">';
      for (let d = 7; d >= 0; d--) for (let k = 0; k < 16; k++) h += '<button type="button" class="px-sy-c' + (pas[k] === d ? ' on' : '') + (k % 4 === 0 ? ' px-sy-temps' : '') + '" data-sy-c="' + k + ':' + d + '" data-k="' + k + '" aria-label="pas ' + (k + 1) + ', degré ' + (d + 1) + '"></button>';
      z.innerHTML = h + '</div><div class="px-sy-seg"><button type="button" data-sy="seq-motif">⇣ partir du motif</button><button type="button" data-sy="seq-hasard">⁂ hasard</button><button type="button" data-sy="seq-vider">∅ effacer</button></div>';
      ici = -1;
    }
    function teteDeLecture() {   // la colonne qui joue (dans la boucle d'affichage, seulement quand elle change)
      const z = $('[data-sy-seq]'); if (!z || z.hidden || !boucle) return;
      const k = Math.floor((Date.now() - boucle.debut) / (60000 / p.tempo / 4)); const c = ((k % 16) + 16) % 16; if (k < 0 || c === ici) return;
      for (const x of z.querySelectorAll('.ici')) x.classList.remove('ici');
      for (const x of z.querySelectorAll('[data-k="' + c + '"]')) x.classList.add('ici'); ici = c;
    }
    const seqChange = () => { garder(); if (partage) envoyerProche(); };
    async function peindreKnobs() {
      const K = await knobs().catch(() => null), zone = $('[data-sy-k]'); if (!vivant || !zone) return;
      if (!K) { zone.innerHTML = '<p class="px-sous">les knobs (jOSKnob) ne sont pas là</p>'; return; }
      zone.innerHTML = ''; panneaux = []; detacher.splice(0).forEach(f => f());
      for (const g of GROUPES) {
        const bloc = D.createElement('div'); bloc.className = 'px-sy-g'; bloc.setAttribute('data-neurone', ''); bloc.innerHTML = '<h3 class="px-sy-t">' + esc(NOMS_GROUPES[g] || g) + '</h3>'; zone.appendChild(bloc);
        const spec = PARAMS.filter(x => x.groupe === g).map(x => ({ key: x.cle, label: x.nom, min: x.min, max: x.max, step: x.pas, value: p[x.cle], defaut: x.depart, fmt: x.fmt, shape: x.forme }));
        const surKnob = (vals, cle) => regler({ [cle]: vals[cle] }, { doux: false });
        const pa = K.panel(bloc, spec, surKnob); panneaux.push(pa);
        detacher.push(brancherPanneau(pa, spec, surKnob, { vibrer, W }));   // (0.99.5) appuyer, tourner autour, tordre à deux doigts, double toucher = départ
      }
    }
    peindre = (quoi) => {
      if (!vivant) return;
      if (quoi === 'knobs') { for (const pa of panneaux) for (const k of Object.keys(pa.knobs)) pa.set(k, p[k]); return; }
      peindreChoix();
    };
    // l'oscilloscope : seulement quand ça sonne (rien ne tourne pour rien)
    const cv = $('[data-sy-scope]'), c2 = cv.getContext ? cv.getContext('2d') : null; let tampon = null;
    function dessiner() {
      raf = 0; if (!vivant || !c2 || !m || !m.analyse) return;
      const w = cv.clientWidth || 300; if (cv.width !== w * 2) cv.width = w * 2;
      tampon = tampon || new Uint8Array(m.analyse.fftSize); m.analyse.getByteTimeDomainData(tampon);
      const H = cv.height, L = cv.width, st = W.getComputedStyle ? W.getComputedStyle(cv) : null;
      c2.clearRect(0, 0, L, H); c2.lineWidth = 3; c2.strokeStyle = (st && st.color) || '#7cff9b'; c2.beginPath();
      for (let i = 0; i < tampon.length; i++) { const x = i / (tampon.length - 1) * L, y = tampon[i] / 255 * H; if (i) c2.lineTo(x, y); else c2.moveTo(x, y); }
      c2.stroke(); teteDeLecture();
      if (m.voix() > 0 || boucle) raf = W.requestAnimationFrame(dessiner);
    }
    const reveiller = () => { if (!raf && W.requestAnimationFrame) raf = W.requestAnimationFrame(dessiner); };
    peindrePads(); peindreChoix(); peindreKnobs();
    pret.then(() => { if (!vivant) return; peindreChoix(); peindre('knobs'); });
    // les pads : pointer events (plusieurs doigts), on tient = la note tient
    const pads = $('[data-sy-pads]');
    pads.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('[data-sy-pad]'); if (!b) return; e.preventDefault();
      const mo = moteur(); if (!mo) return;
      try { b.setPointerCapture(e.pointerId); } catch (x) { /* */ }
      const id = mo.debut(noteDePad(+b.getAttribute('data-sy-pad'), { gamme, tonique: 48 + 12 * p.octave + p.transpose }));
      doigts.set(e.pointerId, { id, b }); b.classList.add('on'); vibrer('fx-cran'); reveiller();
    });
    const lacher = (e) => { const d = doigts.get(e.pointerId); if (!d) return; doigts.delete(e.pointerId); d.b.classList.remove('on'); if (m) m.fin(d.id); };
    pads.addEventListener('pointerup', lacher); pads.addEventListener('pointercancel', lacher); pads.addEventListener('lostpointercapture', lacher);
    hote.addEventListener('click', (e) => {
      const mo = e.target.closest('[data-sy-motif]'); if (mo) { motif = mo.getAttribute('data-sy-motif'); garder(); if (partage) envoyerProche(); peindreChoix(); vibrer('selection'); return; }
      const ce = e.target.closest('[data-sy-c]'); if (ce) { const [k, d] = ce.getAttribute('data-sy-c').split(':').map(Number); pas[k] = pas[k] === d ? null : d; pas = pas.slice();
        for (const x of hote.querySelectorAll('[data-sy-c^="' + k + ':"]')) x.classList.toggle('on', x === ce && pas[k] === d);
        vibrer('fx-cran'); seqChange();
        if (pas[k] != null) { const mo2 = moteur(); if (mo2) { const g = GAMMES[gamme], q = ctx.currentTime, id = mo2.debut(36 + p.transpose + g[d % g.length] + 12 * Math.floor(d / g.length), q); mo2.fin(id, q + 0.18); reveiller(); } }   /* on entend la note posée */
        return; }
      const ga = e.target.closest('[data-sy-gamme]'); if (ga) { gamme = ga.getAttribute('data-sy-gamme'); garder(); peindreChoix(); vibrer('selection'); return; }
      const pr = e.target.closest('[data-sy-preset]'); if (pr) { regler(PRESETS[pr.getAttribute('data-sy-preset')] || {}); vibrer('fx-arrivee'); return; }
      const so = e.target.closest('[data-sy-son]'); if (so) { const s = sons[+so.getAttribute('data-sy-son')]; if (s) { regler(s.p); vibrer('fx-arrivee'); } return; }
      const b = e.target.closest('[data-sy]'); if (!b) return; const a = b.getAttribute('data-sy');
      if (a === 'boucle') { if (boucle) arreterBoucle(); else if (lancerBoucle()) reveiller(); vibrer('selection'); }
      else if (a === 'pencher') pencher(!penche);
      else if (a === 'paire') { paire = (paire + 1) % PAIRES.length; vibrer('selection'); peindreChoix(); }
      else if (a === 'proche') { moteur(); const ok = partager(!partage), msg = $('[data-sy-msg]'); msg.hidden = ok; if (!ok) msg.textContent = 'Démarre Proche d\'abord (◉ proche : ton nom, la salle) : ceux de la salle entendront ce son, et chaque knob tordu.'; vibrer(ok ? 'fx-arrivee' : 'erreur'); }
      else if (a === 'hasard') { regler(hasard(Date.now() % 100000)); vibrer('fx-arrivee'); }
      else if (a === 'seq-motif') { pas = (MOTIFS[motif] || MOTIFS.tekk).map(x => (typeof x === 'string' ? Math.min(7, +x.slice(1) + GAMMES[gamme].length) : x));   /* '+n' : l'octave du dessus (un degré de plus que la gamme) */ peindreSeq(); seqChange(); vibrer('selection'); }
      else if (a === 'seq-vider') { pas = Array(16).fill(null); peindreSeq(); seqChange(); vibrer('selection'); }
      else if (a === 'seq-hasard') { let g = (Date.now() % 100000) || 1; const r = () => ((g = (g * 16807) % 2147483647) / 2147483647);
        pas = Array.from({ length: 16 }, (_, k) => (k % 4 === 0 || r() < 0.35 ? (k % 8 === 0 ? 0 : Math.floor(r() * 8)) : null)); peindreSeq(); seqChange(); vibrer('fx-arrivee'); }
      else if (a === 'garder') { const i = $('[data-sy-nom]'), nom = (i.value || '').trim().slice(0, 30) || ('son ' + (sons.length + 1));
        sons = [...sons.filter(s => s.nom !== nom), { nom, p: { ...p } }].slice(-40); boxion.put('reglages', 'synthe-sons', sons).catch(() => {}); i.value = ''; peindreChoix(); vibrer('succes'); }
    });
    return { unmount() { vivant = false; pencher(false); detacher.forEach(f => f()); W.cancelAnimationFrame && W.cancelAnimationFrame(raf); for (const d of doigts.values()) if (m) m.fin(d.id); peindre = () => {}; hote.innerHTML = ''; },
      joue: () => !!(boucle || partage || (m && m.actives() > 0)) };
  }

  const api = { regler, lancerBoucle, arreterBoucle, partager, pencher, surPenche: (e) => { pencheDer = e; if (penche) { const [kx, ky] = PAIRES[paire]; regler({ [kx]: valeurInclinee(kx, ((+e.gamma || 0) + 45) / 90), [ky]: valeurInclinee(ky, ((+e.beta || 0) - 10) / 70) }); } }, reglages: () => ({ ...p }), choisir: (o = {}) => { if (GAMMES[o.gamme]) gamme = o.gamme; const pv = pasValides(o.pas); if (pv) pas = pv; if (MOTIFS[o.motif] || (o.motif === 'mien' && pas)) motif = o.motif; garder(); },
    moteur, etat: () => ({ p: { ...p }, gamme, motif, pas: pas.slice(), boucle: !!boucle, sons: sons.map(s => s.nom), partage, penche: !!penche, paire: PAIRES[paire] }),
    couper() { arreterBoucle(); if (m) m.toutCouper(); } };
  if (W) { W.jOSApps = W.jOSApps || {}; W.jOSApps.synthe = { manifest: { id: 'synthe', name: 'Synthé', icon: '≋' }, mount }; }
  return { mount, pret, ...api, ploxion: { id: 'synthe', nom: 'Synthé', icone: '≋', interne: true } };
}
