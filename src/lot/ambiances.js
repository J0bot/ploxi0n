// ≈ LES AMBIANCES, FAÇON BLANKET (0.88, le lot de ploxions de RS-7, 13.10 : « Blanket (ambiances) »). Pluie, vent, vagues, feu, orage,
// ruisseau, bruits rose et brun : chacun son curseur, on les mélange. Rien à télécharger : chaque son est FABRIQUÉ sur place (Web Audio :
// des bruits filtrés et modulés), donc il marche hors ligne et ne pèse rien.
// Le son sort par un <audio> (MediaStreamDestination) : iOS le traite comme une lecture (le mode audio d'arrière-plan de l'app) et le routeur
// ne l'endort pas (un <audio> qui joue). Un minuteur (15, 30, 60 min) baisse le volume doucement puis coupe.
// boxion_local « reglages/ambiances » = { volumes: { pluie: 0.4, … }, maitre } : le mélange revient à la prochaine ouverture.
export const SONS = [
  ['pluie', 'pluie', '⁝'], ['vent', 'vent', '≋'], ['vagues', 'vagues', '∿'], ['feu', 'feu', '△'],
  ['orage', 'orage', 'ϟ'], ['ruisseau', 'ruisseau', '≈'], ['rose', 'bruit rose', '░'], ['brun', 'bruit brun', '▒'],
];
export const MINUTEURS = [0, 15, 30, 60];
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** des tampons de bruit (4 s, en boucle) : blanc, rose (Paul Kellet), brun (intégré) */
export function bruits(ctx, secondes = 4) {
  const n = Math.floor(ctx.sampleRate * secondes), f = (remplir) => { const b = ctx.createBuffer(1, n, ctx.sampleRate); remplir(b.getChannelData(0)); return b; };
  return {
    blanc: f((d) => { for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; }),
    rose: f((d) => { let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0; for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898; d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926; } }),
    brun: f((d) => { let l = 0; for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; l = (l + 0.02 * w) / 1.02; d[i] = l * 3.5; } }),
  };
}

/** un son = une petite chaîne : source de bruit → filtres (→ modulation lente) → son gain ; rend { sortie, arreter } */
export function fabriquer(ctx, nom, b) {
  const src = (buf) => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(); return s; };
  const filtre = (type, f, q = 0.7) => { const x = ctx.createBiquadFilter(); x.type = type; x.frequency.value = f; x.Q.value = q; return x; };
  const lfo = (hz, ampleur, param) => { const o = ctx.createOscillator(); o.frequency.value = hz; const g = ctx.createGain(); g.gain.value = ampleur; o.connect(g); g.connect(param); o.start(); return o; };
  const sortie = ctx.createGain(); sortie.gain.value = 0;
  const arrets = [];
  const chaine = (s, ...noeuds) => { let x = s; for (const n of noeuds) { x.connect(n); x = n; } x.connect(sortie); arrets.push(s); return x; };
  if (nom === 'pluie') { chaine(src(b.blanc), filtre('highpass', 500), filtre('lowpass', 6500), ctx.createGain()); chaine(src(b.rose), filtre('bandpass', 1400, 0.4)); }
  else if (nom === 'vent') { const bp = filtre('bandpass', 420, 1.2); const g = ctx.createGain(); g.gain.value = 0.7; chaine(src(b.brun), bp, g); arrets.push(lfo(0.07, 260, bp.frequency), lfo(0.11, 0.3, g.gain)); }
  else if (nom === 'vagues') { const lp = filtre('lowpass', 1100); const g = ctx.createGain(); g.gain.value = 0.55; chaine(src(b.rose), lp, g); arrets.push(lfo(0.09, 0.45, g.gain), lfo(0.09, 500, lp.frequency)); }
  else if (nom === 'feu') { chaine(src(b.brun), filtre('lowpass', 420)); const cr = filtre('bandpass', 2800, 2); const g = ctx.createGain(); g.gain.value = 0; chaine(src(b.blanc), cr, g); arrets.push(lfo(5.3, 0.25, g.gain), lfo(1.7, 0.2, g.gain)); }
  else if (nom === 'orage') { const g = ctx.createGain(); g.gain.value = 0.6; chaine(src(b.brun), filtre('lowpass', 140), g); arrets.push(lfo(0.031, 0.5, g.gain)); }
  else if (nom === 'ruisseau') { const bp = filtre('bandpass', 2400, 0.9); chaine(src(b.blanc), bp, filtre('lowpass', 5000)); arrets.push(lfo(0.6, 700, bp.frequency), lfo(2.3, 300, bp.frequency)); }
  else if (nom === 'rose') chaine(src(b.rose));
  else if (nom === 'brun') chaine(src(b.brun));
  return { sortie, arreter() { for (const a of arrets) { try { a.stop(); } catch (e) { /* déjà arrêté */ } try { a.disconnect(); } catch (e) { /* */ } } try { sortie.disconnect(); } catch (e) { /* */ } } };
}

export function creerAmbiances({ W = globalThis.window, boxion, Contexte = W.AudioContext || W.webkitAudioContext, vibrer = () => {}, activite = null }) {
  const D = W.document;
  let etat = { volumes: {}, maitre: 0.8 };
  const pret = boxion.get('reglages', 'ambiances').then(v => { if (v && typeof v === 'object') etat = { volumes: {}, maitre: 0.8, ...v }; }).catch(() => {});
  let garde = 0; const garder = () => { W.clearTimeout(garde); garde = W.setTimeout(() => boxion.put('reglages', 'ambiances', etat).catch(() => {}), 400); };

  function mount(hote) {
    let vivant = true, ctx = null, maitre = null, audio = null, tampons = null, fin = 0, finA = 0;
    const sons = new Map();
    hote.innerHTML = '<div class="px-page px-ambiances"><p class="px-grave">≈ ambiances</p><p class="px-sous">mélange les sons ; ils continuent quand tu passes à un autre ploxion ou que tu minimises (▁) ; ‹ les coupe</p><div data-amb-sons></div>'
      + '<div class="px-amb-b"><label>volume <input type="range" min="0" max="1" step="0.01" data-amb-maitre></label><div class="seg" data-amb-min>' + MINUTEURS.map(m => '<button type="button" data-amb-min="' + m + '">' + (m ? m + ' min' : '∞') + '</button>').join('') + '</div>'
      + '<button type="button" data-amb-tout>■ tout couper</button></div></div>';
    const liste = hote.querySelector('[data-amb-sons]');
    liste.innerHTML = SONS.map(([k, n, g]) => '<label class="px-amb-l"><span class="g">' + esc(g) + '</span><span class="n">' + esc(n) + '</span><input type="range" min="0" max="1" step="0.01" value="0" data-amb="' + k + '"></label>').join('');
    const demarrer = () => {
      if (ctx || !Contexte) return !!ctx;
      ctx = new Contexte(); tampons = bruits(ctx);
      maitre = ctx.createGain(); maitre.gain.value = etat.maitre;
      if (ctx.createMediaStreamDestination) {   // par un <audio> : iOS le lit en arrière-plan, le routeur voit qu'il joue
        const dest = ctx.createMediaStreamDestination(); maitre.connect(dest);
        audio = D.createElement('audio'); audio.setAttribute('playsinline', ''); audio.srcObject = dest.stream; audio.style.display = 'none'; hote.appendChild(audio);
        const p = audio.play(); if (p && p.catch) p.catch(() => {});
      } else maitre.connect(ctx.destination);
      try { if (W.navigator.mediaSession && W.MediaMetadata) W.navigator.mediaSession.metadata = new W.MediaMetadata({ title: 'Ambiances', artist: 'ploxi0n' }); } catch (e) { /* */ }
      return true;
    };
    const regler = (k, v) => {
      etat.volumes[k] = v; garder();
      const lg = hote.querySelector('[data-amb="' + k + '"]'); if (lg && lg.closest('label')) lg.closest('label').classList.toggle('px-amb-on', v > 0);   // (0.92) la veilleuse : ce qui joue
      if (v > 0 && !demarrer()) return;
      if (!ctx) return;
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume().catch(() => {});
      let s = sons.get(k);
      if (!s && v > 0) { s = fabriquer(ctx, k, tampons); s.sortie.connect(maitre); sons.set(k, s); }
      if (s) s.sortie.gain.setTargetAtTime(v * v, ctx.currentTime, 0.15);   // la courbe de l'oreille : v²
      if (s && v === 0) W.setTimeout(() => { if (sons.get(k) === s && !(etat.volumes[k] > 0)) { s.arreter(); sons.delete(k); } }, 900);
    };
    // le minuteur : 20 s de fondu, puis tout s'arrête
    const minuter = (m) => {
      W.clearTimeout(fin); W.clearTimeout(finA); hote.querySelectorAll('[data-amb-min] button').forEach(b => b.classList.toggle('on', +b.getAttribute('data-amb-min') === m));
      if (activite) { try { if (m) { const n = [...sons.keys()].map(k => (SONS.find(x => x[0] === k) || [k, k])[1]).join(' · '); activite.debut({ titre: 'ambiances', sous: n || 'le minuteur', fin: Date.now() + m * 60e3 }); } else activite.fin(); } catch (e) { /* 🏝 (0.91) jamais bloquant */ } }
      if (!m) return;
      fin = W.setTimeout(() => { if (maitre && ctx) maitre.gain.setTargetAtTime(0, ctx.currentTime, 6); finA = W.setTimeout(() => toutCouper(true), 20000); }, Math.max(0, m * 60e3 - 20000));
    };
    const toutCouper = (garderVolumes = false) => {
      if (activite) { try { activite.fin(); } catch (e) { /* */ } }
      for (const s of sons.values()) s.arreter(); sons.clear();
      if (!garderVolumes) { etat.volumes = {}; garder(); hote.querySelectorAll('[data-amb]').forEach(i => { i.value = 0; i.closest('label').classList.remove('px-amb-on'); }); }
      if (audio) { try { audio.pause(); } catch (e) { /* */ } audio.srcObject = null; audio.remove(); audio = null; }
      if (ctx) { try { ctx.close(); } catch (e) { /* */ } ctx = null; maitre = null; }
    };
    hote.addEventListener('input', (e) => {
      const t = e.target;
      if (t.matches('[data-amb]')) regler(t.getAttribute('data-amb'), +t.value);
      if (t.matches('[data-amb-maitre]')) { etat.maitre = +t.value; garder(); if (maitre && ctx) maitre.gain.setTargetAtTime(etat.maitre, ctx.currentTime, 0.1); }
    });
    hote.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-amb-tout')) { vibrer('selection'); minuter(0); toutCouper(); }
      else if (b.hasAttribute('data-amb-min')) { vibrer('selection'); minuter(+b.getAttribute('data-amb-min')); }
    });
    pret.then(() => {
      if (!vivant) return;
      hote.querySelector('[data-amb-maitre]').value = etat.maitre;
      for (const [k] of SONS) { const v = +etat.volumes[k] || 0, i = hote.querySelector('[data-amb="' + k + '"]'); i.value = v; i.closest('label').classList.toggle('px-amb-on', v > 0); }
      // le mélange d'avant revient affiché ; il ne joue qu'au premier geste (iOS veut un geste pour lancer un son)
    });
    hote.addEventListener('pointerdown', function premier() {
      hote.removeEventListener('pointerdown', premier);
      for (const [k] of SONS) if (+etat.volumes[k] > 0 && !sons.has(k)) regler(k, +etat.volumes[k]);
    });
    return { unmount() { vivant = false; W.clearTimeout(fin); W.clearTimeout(finA); toutCouper(true); hote.innerHTML = ''; }, joue: () => sons.size > 0 };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps.ambiances = { manifest: { id: 'ambiances', name: 'Ambiances', icon: '≈' }, mount };
  return { mount, pret, etat: () => ({ ...etat, volumes: { ...etat.volumes } }), ploxion: { id: 'ambiances', nom: 'Ambiances', icone: '≈', interne: true } };
}
