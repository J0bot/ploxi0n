// ≋ LE SYNTHÉ : FAIRE DU SON AVEC DES KNOBS (0.99.4, RS-7 24.10 : « et qu'on puisse commencer à faire du son avec des knobs »).
// Compose : les knobs du labo (jOSKnob, embarqué : public/bions/jOSKnob.js), le son en réglages (src/bions/son.js), la boucle de la basse
// de Proche (src/bions/proche.js : MOTIFS, GAMMES, partition, notesEntre). Rien à télécharger, tout est fabriqué sur place (Web Audio) :
//   deux oscillateurs désaccordés + un sub → un filtre passe-bas (son enveloppe, un lfo) → l'enveloppe du volume → l'écho → la sortie ;
//   16 pads dans la gamme (plusieurs doigts à la fois), une boucle au tempo, un oscilloscope qui montre le son ; tes sons gardés.
// Tourner un knob change le son EN DIRECT, même d'une note tenue. Le son continue quand on change de ploxion ; ‹ le coupe.
import { PARAMS, GROUPES, PRESETS, normaliser, noteDePad, hasard, freq, ONDES } from '../bions/son.js';
import { MOTIFS, GAMMES, partition, notesEntre } from '../bions/proche.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NOMS_GROUPES = { source: '∿ la source', filtre: '◇ le filtre', enveloppe: '△ l\'enveloppe', mouvement: '○ le mouvement', espace: '□ l\'espace', sortie: '◉ la sortie' };

/** le moteur : un graphe Web Audio vivant ; p = les réglages (normalisés), relus à chaque note et à chaque knob */
export function creerMoteur(ctx, lire) {
  const sortie = ctx.createGain(), bus = ctx.createGain(), sec = ctx.createGain(), mouille = ctx.createGain(), echo = ctx.createDelay(2), retour = ctx.createGain();
  const analyse = ctx.createAnalyser ? ctx.createAnalyser() : null;
  bus.connect(sec); sec.connect(sortie); bus.connect(echo); echo.connect(retour); retour.connect(echo); echo.connect(mouille); mouille.connect(sortie);
  if (analyse) { analyse.fftSize = 1024; sortie.connect(analyse); }
  sortie.connect(ctx.destination);
  const lfo = ctx.createOscillator(), lfoG = ctx.createGain(); lfo.connect(lfoG); lfo.start();
  const voix = new Map(); let n = 0;
  function appliquer() {
    const p = lire(), t = ctx.currentTime;
    sortie.gain.setTargetAtTime(p.volume * 0.8, t, 0.02); echo.delayTime.setTargetAtTime(p.echo, t, 0.05);
    retour.gain.setTargetAtTime(p.retour, t, 0.03); mouille.gain.setTargetAtTime(p.mix, t, 0.03); sec.gain.setTargetAtTime(1 - p.mix * 0.5, t, 0.03);
    lfo.frequency.setTargetAtTime(p.lfo, t, 0.05); lfoG.gain.setTargetAtTime(p.lfoProf * p.coupure, t, 0.05);
    for (const v of voix.values()) {   // en direct, même une note tenue
      v.fl.Q.setTargetAtTime(p.resonance, t, 0.02);
      if (!v.lache) v.fl.frequency.setTargetAtTime(p.coupure, t, 0.03);
      for (const o of v.os) { o.type = ONDES[Math.round(p.onde)] || 'sawtooth'; }
      v.os[0].detune.setTargetAtTime(p.desaccord, t, 0.02); v.os[1].detune.setTargetAtTime(-p.desaccord, t, 0.02); v.subG.gain.setTargetAtTime(p.sub * 0.6, t, 0.03);
    }
  }
  /** une note qui commence à quand (secondes du contexte) ; rend son id */
  function debut(midi, quand = ctx.currentTime) {
    const p = lire(), f = freq(midi), t = Math.max(ctx.currentTime, quand), onde = ONDES[Math.round(p.onde)] || 'sawtooth';
    const os = [ctx.createOscillator(), ctx.createOscillator()], sub = ctx.createOscillator(), subG = ctx.createGain(), fl = ctx.createBiquadFilter(), vca = ctx.createGain(), mixO = ctx.createGain();
    os.forEach((o, i) => { o.type = onde; o.frequency.value = f; o.detune.value = i ? -p.desaccord : p.desaccord; o.connect(mixO); });
    sub.type = 'sine'; sub.frequency.value = f / 2; subG.gain.value = p.sub * 0.6; sub.connect(subG); subG.connect(fl);
    mixO.gain.value = 0.35; mixO.connect(fl);
    fl.type = 'lowpass'; fl.Q.value = p.resonance; lfoG.connect(fl.frequency);
    const haut = Math.min(18000, p.coupure * (1 + p.enveloppe * 7));
    fl.frequency.setValueAtTime(haut, t); fl.frequency.setTargetAtTime(p.coupure, t + p.attaque, Math.max(0.01, p.declin / 3));
    vca.gain.setValueAtTime(0.0001, t); vca.gain.linearRampToValueAtTime(0.5, t + p.attaque);
    vca.gain.setTargetAtTime(0.5 * Math.max(0.0001, p.maintien), t + p.attaque, Math.max(0.01, p.declin / 3));
    fl.connect(vca); vca.connect(bus);
    for (const o of [...os, sub]) o.start(t);
    const id = ++n; voix.set(id, { os, sub, subG, fl, vca, lache: false, debut: t }); return id;
  }
  /** relâcher (à quand) : la relâche, puis tout s'arrête et se débranche */
  function fin(id, quand = ctx.currentTime) {
    const v = voix.get(id); if (!v || v.lache) return; v.lache = true;
    const p = lire(), t = Math.max(ctx.currentTime, quand, v.debut + 0.005);
    v.vca.gain.cancelScheduledValues(t); v.vca.gain.setTargetAtTime(0.0001, t, Math.max(0.01, p.relache / 4));
    const stop = t + p.relache * 1.6 + 0.05;
    for (const o of [...v.os, v.sub]) { try { o.stop(stop); } catch (e) { /* déjà */ } }
    v.os[0].onended = () => { voix.delete(id); try { lfoG.disconnect(v.fl.frequency); } catch (e) { /* */ } try { v.vca.disconnect(); } catch (e) { /* */ } };
  }
  function toutCouper() { for (const id of [...voix.keys()]) fin(id); }
  appliquer();
  return { debut, fin, appliquer, toutCouper, analyse, actives: () => [...voix.values()].filter(v => !v.lache).length, voix: () => voix.size,
    fermer() { toutCouper(); try { lfo.stop(); } catch (e) { /* */ } } };
}

export function creerSynthe({ W = globalThis.window, boxion, vibrer = () => {}, Contexte = W && (W.AudioContext || W.webkitAudioContext) }) {
  const D = W.document;
  let p = normaliser(PRESETS['basse tekk']), sons = [], gamme = 'mineur', motif = 'tekk', ctx = null, m = null, boucle = null, ordo = 0, jusque = 0, garde = 0, peindre = () => {};
  const pret = Promise.all([boxion.get('reglages', 'synthe').catch(() => null), boxion.get('reglages', 'synthe-sons').catch(() => null)]).then(([r, s]) => {
    if (r && typeof r === 'object') { p = normaliser(r.p || r); if (GAMMES[r.gamme]) gamme = r.gamme; if (MOTIFS[r.motif]) motif = r.motif; }
    if (Array.isArray(s)) sons = s.filter(x => x && x.nom).slice(0, 40).map(x => ({ nom: String(x.nom).slice(0, 30), p: normaliser(x.p) }));
  });
  const garder = () => { W.clearTimeout(garde); garde = W.setTimeout(() => boxion.put('reglages', 'synthe', { p, gamme, motif }).catch(() => {}), 400); };
  function moteur() {   // créé au premier geste (iOS n'ouvre le son qu'après un toucher)
    if (!ctx && Contexte) { try { ctx = new Contexte(); } catch (e) { ctx = null; } }
    if (!ctx) return null;
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume().catch(() => {});
    if (!m) m = creerMoteur(ctx, () => p);
    return m;
  }
  function regler(nouveaux, { doux = true } = {}) { p = normaliser({ ...p, ...nouveaux }); if (m) m.appliquer(); garder(); if (doux) peindre('knobs'); }
  // ---- la boucle : la partition de la basse de Proche, jouée par ce son-ci ----
  function lancerBoucle() {
    const mo = moteur(); if (!mo) return false;
    boucle = { debut: Date.now() + 120 }; jusque = 0; W.clearInterval(ordo);
    ordo = W.setInterval(() => {
      if (!boucle) return;
      const pa = partition({ tempo: p.tempo, motif, tonique: 36, gamme, debut: boucle.debut, volume: 1 }), maintenant = Date.now(), de = Math.max(maintenant, jusque), a = maintenant + 220;
      for (const nt of notesEntre(pa, de, a)) { const q = ctx.currentTime + Math.max(0, (nt.t - maintenant) / 1000), id = mo.debut(nt.midi, q); mo.fin(id, q + Math.min(nt.duree / 1000, Math.max(0.04, p.declin))); }
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
    let vivant = true, panneaux = [], raf = 0;
    const doigts = new Map();
    hote.innerHTML = '<div class="px-page px-synthe" data-neurones="fin"><p class="px-grave">≋ synthé</p>'
      + '<p class="px-sous">Tourne les knobs, touche les pads : le son change en direct. Plusieurs doigts à la fois.</p>'
      + '<canvas class="px-sy-scope" data-sy-scope height="70" aria-hidden="true"></canvas>'
      + '<div class="px-sy-pads" data-sy-pads data-neurones="fin" data-instrument></div>'
      + '<div class="px-sy-l"><button type="button" data-sy="boucle"></button><div class="px-sy-seg" data-sy-motifs></div></div>'
      + '<div class="px-sy-seg" data-sy-gammes></div>'
      + '<div data-sy-k data-instrument></div>'
      + '<h3 class="px-sy-t">◈ les sons</h3><div class="px-sy-seg" data-sy-presets></div><div class="px-sy-seg" data-sy-sons data-ecrit></div>'
      + '<div class="px-sy-garder"><input type="text" maxlength="30" placeholder="le nom de ce son" data-sy-nom><button type="button" data-sy="garder">＋ garder</button></div></div>';
    const $ = (s) => hote.querySelector(s);
    function peindrePads() {
      $('[data-sy-pads]').innerHTML = Array.from({ length: 16 }, (_, i) => { const idx = (3 - Math.floor(i / 4)) * 4 + (i % 4);   // grave en bas à gauche, aigu en haut à droite
        return '<button type="button" class="px-sy-pad" data-neurone data-sy-pad="' + idx + '" aria-label="note ' + (idx + 1) + '"><i></i></button>'; }).join('');
    }
    function peindreChoix() {
      const b = $('[data-sy="boucle"]'); b.textContent = boucle ? '■ la boucle' : '▷ la boucle'; b.classList.toggle('on', !!boucle);
      $('[data-sy-motifs]').innerHTML = Object.keys(MOTIFS).map(k => '<button type="button" data-sy-motif="' + k + '"' + (k === motif ? ' class="on"' : '') + '>' + k + '</button>').join('');
      $('[data-sy-gammes]').innerHTML = Object.keys(GAMMES).map(k => '<button type="button" data-sy-gamme="' + k + '"' + (k === gamme ? ' class="on"' : '') + '>' + k + '</button>').join('');
      $('[data-sy-presets]').innerHTML = Object.keys(PRESETS).map(k => '<button type="button" data-sy-preset="' + esc(k) + '">' + esc(k) + '</button>').join('') + '<button type="button" data-sy="hasard">⁂ hasard</button>';
      $('[data-sy-sons]').innerHTML = sons.map((s, i) => '<button type="button" data-sy-son="' + i + '">' + esc(s.nom) + '</button>').join('');
    }
    async function peindreKnobs() {
      const K = await knobs().catch(() => null), zone = $('[data-sy-k]'); if (!vivant || !zone) return;
      if (!K) { zone.innerHTML = '<p class="px-sous">les knobs (jOSKnob) ne sont pas là</p>'; return; }
      zone.innerHTML = ''; panneaux = [];
      for (const g of GROUPES) {
        const bloc = D.createElement('div'); bloc.className = 'px-sy-g'; bloc.setAttribute('data-neurone', ''); bloc.innerHTML = '<h3 class="px-sy-t">' + esc(NOMS_GROUPES[g] || g) + '</h3>'; zone.appendChild(bloc);
        const spec = PARAMS.filter(x => x.groupe === g).map(x => ({ key: x.cle, label: x.nom, min: x.min, max: x.max, step: x.pas, value: p[x.cle], fmt: x.fmt, shape: x.forme }));
        panneaux.push(K.panel(bloc, spec, (vals, cle) => { regler({ [cle]: vals[cle] }, { doux: false }); vibrer('fx-cran'); }));
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
      c2.stroke();
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
      const id = mo.debut(noteDePad(+b.getAttribute('data-sy-pad'), { gamme, tonique: 48 }));
      doigts.set(e.pointerId, { id, b }); b.classList.add('on'); vibrer('fx-cran'); reveiller();
    });
    const lacher = (e) => { const d = doigts.get(e.pointerId); if (!d) return; doigts.delete(e.pointerId); d.b.classList.remove('on'); if (m) m.fin(d.id); };
    pads.addEventListener('pointerup', lacher); pads.addEventListener('pointercancel', lacher); pads.addEventListener('lostpointercapture', lacher);
    hote.addEventListener('click', (e) => {
      const mo = e.target.closest('[data-sy-motif]'); if (mo) { motif = mo.getAttribute('data-sy-motif'); garder(); peindreChoix(); vibrer('selection'); return; }
      const ga = e.target.closest('[data-sy-gamme]'); if (ga) { gamme = ga.getAttribute('data-sy-gamme'); garder(); peindreChoix(); vibrer('selection'); return; }
      const pr = e.target.closest('[data-sy-preset]'); if (pr) { regler(PRESETS[pr.getAttribute('data-sy-preset')] || {}); vibrer('fx-arrivee'); return; }
      const so = e.target.closest('[data-sy-son]'); if (so) { const s = sons[+so.getAttribute('data-sy-son')]; if (s) { regler(s.p); vibrer('fx-arrivee'); } return; }
      const b = e.target.closest('[data-sy]'); if (!b) return; const a = b.getAttribute('data-sy');
      if (a === 'boucle') { if (boucle) arreterBoucle(); else if (lancerBoucle()) reveiller(); vibrer('selection'); }
      else if (a === 'hasard') { regler(hasard(Date.now() % 100000)); vibrer('fx-arrivee'); }
      else if (a === 'garder') { const i = $('[data-sy-nom]'), nom = (i.value || '').trim().slice(0, 30) || ('son ' + (sons.length + 1));
        sons = [...sons.filter(s => s.nom !== nom), { nom, p: { ...p } }].slice(-40); boxion.put('reglages', 'synthe-sons', sons).catch(() => {}); i.value = ''; peindreChoix(); vibrer('succes'); }
    });
    return { unmount() { vivant = false; W.cancelAnimationFrame && W.cancelAnimationFrame(raf); for (const d of doigts.values()) if (m) m.fin(d.id); peindre = () => {}; hote.innerHTML = ''; },
      joue: () => !!(boucle || (m && m.actives() > 0)) };
  }

  const api = { regler, lancerBoucle, arreterBoucle, reglages: () => ({ ...p }), choisir: (o = {}) => { if (GAMMES[o.gamme]) gamme = o.gamme; if (MOTIFS[o.motif]) motif = o.motif; garder(); },
    moteur, etat: () => ({ p: { ...p }, gamme, motif, boucle: !!boucle, sons: sons.map(s => s.nom) }),
    couper() { arreterBoucle(); if (m) m.toutCouper(); } };
  if (W) { W.jOSApps = W.jOSApps || {}; W.jOSApps.synthe = { manifest: { id: 'synthe', name: 'Synthé', icon: '≋' }, mount }; }
  return { mount, pret, ...api, ploxion: { id: 'synthe', nom: 'Synthé', icone: '≋', interne: true } };
}
