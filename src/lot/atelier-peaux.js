// ◈ L'ATELIER DES PEAUX (0.96). RS-7 (23.10) : « il faut découvrir la fractale des UI, avoir des knobs pour modifier le UI selon un générateur
// fractal ; c'est des formules au final, le UI ; dans organique, le but c'est de trouver le UI qui est parfait pour toi — moi j'ai ma vision,
// mais tout le monde a une vision différente ». Un ploxion interne, composé de bions :
//   src/bions/genome.js      la peau = un génome ; la grille fractale ; muter
//   src/bions/membrane.js    redefinir (en direct), appliquerCouleurs
//   jOSKnob (le bion du labo, embarqué : public/bions/jOSKnob.js)   un knob par gène, son corps un kion (un koin pour les couleurs)
//   src/app/neurones.js      chaque tuile est un petit xer qui a SA peau (data-neurones-variante)
// LA FRACTALE : 3 × 3 peaux autour de la tienne (au centre). En toucher une : elle devient le centre et l'écart se resserre — tu zoomes dans
// l'espace des UI. ⊖ dézoome (l'écart s'élargit), ⚂ saute ailleurs, ‹ revient sur tes pas. Les knobs tournent la peau gène par gène, et
// TOUTE l'app change en direct (la peau « perso »). ✓ garder : elle prend un nom, rejoint ⚙ › Apparence, et devient un tsoin.
// boxion_local « reglages/atelier » = { g, ecart, graine, chemin } ; « reglages/peaux » = [{ id, nom, g, le }].
import { GENES, PALETTE, genomeDe, versVariante, grille, aleatoire } from '../bions/genome.js';
import { VARIANTES, redefinir, appliquerCouleurs } from '../bions/membrane.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ECART0 = 0.3;
const texteGene = ([k, , min, max, genre], u) => {
  if (genre === 'palette') return PALETTE[Math.min(PALETTE.length - 1, Math.floor(u * PALETTE.length))];
  if (genre === 'oui') return u >= 0.5 ? 'oui' : 'non';
  const x = genre === 'log' ? min * Math.pow(max / min, u) : min + (max - min) * u;
  return genre === 'entier' ? String(Math.round(x)) : (Math.abs(x) < 1 ? x.toFixed(2) : x.toFixed(1));
};

export function creerAtelier({ W = globalThis.window, boxion, prefs = null, vibrer = () => {} } = {}) {
  const D = W.document;
  let etat = null, peaux = [];
  const garderEtat = () => boxion.put('reglages', 'atelier', etat).catch(() => {});
  /** au lancement : la peau « perso » et les tiennes rejoignent les variantes (avant le premier dessin) */
  async function charger() {
    const [a, l] = await Promise.all([boxion.get('reglages', 'atelier').catch(() => null), boxion.get('reglages', 'peaux').catch(() => null)]);
    if (a && a.g) { etat = a; redefinir(D, 'perso', versVariante(a.g, { nom: 'ta peau (l\'atelier)' })); }
    peaux = Array.isArray(l) ? l.filter(x => x && x.id && x.g) : [];
    for (const p of peaux) redefinir(D, p.id, versVariante(p.g, { nom: p.nom, lot: 'tiennes' }));
    return { perso: !!etat, peaux: peaux.length };
  }
  const variantePrefs = () => (prefs ? prefs.lire().variante : D.documentElement.getAttribute('data-px-variante')) || 'nerfs';
  function depart() {
    const v = variantePrefs(), p = VARIANTES[v] || VARIANTES.nerfs, cs = W.getComputedStyle(D.documentElement);
    const g = genomeDe(p, { memb: (p.couleurs || {}).memb || cs.getPropertyValue('--memb').trim(), memb2: (p.couleurs || {}).memb2 || cs.getPropertyValue('--memb2').trim() });
    return { g, ecart: ECART0, graine: 1, chemin: [] };
  }
  /** la peau perso, posée sur toute l'app */
  async function vivre(g) {
    redefinir(D, 'perso', versVariante(g, { nom: 'ta peau (l\'atelier)' }));
    D.documentElement.setAttribute('data-px-variante', 'perso'); appliquerCouleurs(D.documentElement, 'perso');
    if (prefs && prefs.lire().variante !== 'perso') await prefs.regler({ variante: 'perso' });
  }

  /** jOSKnob, le bion du labo : déjà là (un ploxion l'a chargé), sinon depuis le pack de l'app */
  function knobs() {
    if (W.jOSKnob) return Promise.resolve(W.jOSKnob);
    return new Promise((ok, ko) => { const s = D.createElement('script'); s.src = 'bions/jOSKnob.js'; s.dataset.bion = 'jOSKnob'; s.onload = () => (W.jOSKnob ? ok(W.jOSKnob) : ko(new Error('jOSKnob'))); s.onerror = ko; D.head.appendChild(s); });
  }
  function mount(hote) {
    let vivant = true, tuiles = [], panneau = null, attente = 0;
    if (!etat) etat = depart();
    const organique = () => D.documentElement.classList.contains('px-organique');
    hote.innerHTML = '<div class="px-page px-atelier"><p class="px-grave">◈ l\'atelier des peaux</p>'
      + '<p class="px-sous">Touche une peau : tu zoomes dedans. Tourne les knobs : toute l\'app suit. Garde celle qui est toi.</p>'
      + (organique() ? '' : '<p class="px-sous">⚠ les peaux vivent dans le mode organique : <button type="button" data-at="organique">passer en organique</button></p>')
      + '<div class="px-at-g" data-at-g></div><p class="px-at-z" data-at-z></p>'
      + '<div class="px-at-b" data-neurones="fin" data-neurones-cellules="button"><button type="button" data-at="revenir" aria-label="revenir sur tes pas">‹</button><button type="button" data-at="dezoomer" aria-label="dézoomer : des peaux plus loin">⊖</button>'
      + '<button type="button" data-at="hasard" aria-label="un saut au hasard">hasard</button><button type="button" data-at="garder" class="p">✓ garder</button></div>'
      + '<div class="px-at-k" data-at-k></div>'
      + '<p class="px-grave">partir d\'une peau</p><div class="px-at-d" data-at-d></div>'
      + '<p class="px-grave">tes peaux</p><div class="px-at-m" data-at-m></div></div>';
    const $ = (s) => hote.querySelector(s);
    function peindreGrille() {
      tuiles = grille(etat.g, etat.ecart, etat.graine);
      $('[data-at-g]').innerHTML = tuiles.map((_, i) => '<button type="button" class="px-at-t' + (i === 4 ? ' px-at-ici' : '') + '" data-t="' + i + '" data-neurones="fin" data-neurones-variante="_at' + i + '" aria-label="' + (i === 4 ? 'ta peau' : 'une peau voisine : zoomer dedans') + '"><i data-neurone class="px-at-barre"></i><i data-neurone></i><i data-neurone></i><i data-neurone></i><i data-neurone></i></button>').join('');
      tuiles.forEach((g, i) => { redefinir(D, '_at' + i, versVariante(g, { nom: 'tuile' })); appliquerCouleurs($('[data-t="' + i + '"]'), '_at' + i); });
      const niveau = Math.round(Math.log(ECART0 / etat.ecart) / Math.log(2) * 10) / 10;
      $('[data-at-z]').textContent = 'zoom ' + (niveau >= 0 ? '×' + Math.pow(2, niveau).toFixed(1) : '÷' + Math.pow(2, -niveau).toFixed(1)) + ' · ' + etat.chemin.length + ' pas';
    }
    async function peindreKnobs() {
      const K = await knobs().catch(() => null), zone = $('[data-at-k]'); if (!vivant || !zone) return;
      if (!K) { zone.innerHTML = '<small>les knobs (jOSKnob) ne sont pas là</small>'; return; }
      zone.innerHTML = '';
      panneau = K.panel(zone, GENES.map(gn => ({ key: gn[0], label: gn[1], min: 0, max: 1, step: 0.05, value: etat.g[gn[0]] != null ? etat.g[gn[0]] : 0.5, fmt: (u) => texteGene(gn, u), shape: gn[4] === 'palette' ? 'koin' : 'kion' })),
        (vals, cle) => { etat.g = { ...etat.g, [cle]: vals[cle] }; vibrer('fx-cran'); W.clearTimeout(attente); attente = W.setTimeout(() => vivre(etat.g), 90); });   // l'app suit, un peu lissé
      // au lâcher : la grille se refait autour de la nouvelle peau
      panneau.el.addEventListener('pointerup', () => { garderEtat(); peindreGrille(); });
    }
    function peindreListes() {
      $('[data-at-d]').innerHTML = Object.entries(VARIANTES).filter(([k, v]) => !k.startsWith('_at') && k !== 'perso').map(([k, v]) => '<button type="button" data-at-depuis="' + esc(k) + '">' + esc(v.nom || k) + '</button>').join('');
      $('[data-at-m]').innerHTML = peaux.length ? peaux.map(p => '<span class="px-at-mp"><button type="button" data-at-porter="' + esc(p.id) + '">' + esc(p.nom) + '</button><button type="button" data-at-oublier="' + esc(p.id) + '" aria-label="oublier ' + esc(p.nom) + '">✕</button></span>').join('') : '<small>rien encore : trouve-la, puis ✓ garder</small>';
    }
    async function aller(g, { zoom = 1, pas = true } = {}) {
      if (pas) etat.chemin = [...etat.chemin, { g: etat.g, ecart: etat.ecart, graine: etat.graine }].slice(-40);
      etat.g = g; etat.ecart = Math.max(0.01, Math.min(0.6, etat.ecart * zoom)); etat.graine = (etat.graine * 31 + 7) % 100003;
      await vivre(g); garderEtat(); peindreGrille(); if (panneau) for (const gn of GENES) panneau.set(gn[0], g[gn[0]]);
    }
    hote.addEventListener('click', async (e) => {
      const t = e.target.closest('[data-t]');
      if (t) { const i = +t.getAttribute('data-t'); vibrer(i === 4 ? 'selection' : 'fx-arrivee'); if (i !== 4) await aller(tuiles[i], { zoom: 0.5 }); return; }   // zoomer dans la peau touchée
      const b = e.target.closest('[data-at],[data-at-depuis],[data-at-porter],[data-at-oublier]'); if (!b) return;
      const a = b.getAttribute('data-at');
      if (a === 'organique' && prefs) { await prefs.regler({ mode: 'organique' }); return mount(hote); }
      if (a === 'dezoomer') { vibrer('fx-cran'); return aller(etat.g, { zoom: 2, pas: false }); }
      if (a === 'hasard') { const h = aleatoire(Date.now() % 1e9), g = {}; for (const [k] of GENES) g[k] = h(); vibrer('fx-arrivee'); etat.ecart = ECART0; return aller(g); }
      if (a === 'revenir') { const p = etat.chemin.pop(); if (!p) return vibrer('fx-refus'); etat.g = p.g; etat.ecart = p.ecart; etat.graine = p.graine; await vivre(p.g); garderEtat(); peindreGrille(); peindreKnobs(); return; }
      if (a === 'garder') {
        const nom = (W.prompt ? W.prompt('Le nom de ta peau ?', 'ma peau ' + (peaux.length + 1)) : null) || 'ma peau ' + (peaux.length + 1);
        const p = { id: 'p-' + Date.now().toString(36), nom: String(nom).slice(0, 40), g: { ...etat.g }, le: Date.now(), pas: etat.chemin.length };
        peaux = [...peaux, p]; await boxion.put('reglages', 'peaux', peaux).catch(() => {});
        redefinir(D, p.id, versVariante(p.g, { nom: p.nom, lot: 'tiennes' }));
        if (prefs) await prefs.regler({ variante: p.id });
        try { if (W.jOSTsoin && W.jOSTsoin.mark) W.jOSTsoin.mark('peau', p.nom, { genome: p.g, pas: p.pas }); } catch (er) { /* */ }   // le chemin devient un tsoin
        vibrer('succes'); peindreListes(); return;
      }
      if (b.hasAttribute('data-at-depuis')) { const v = VARIANTES[b.getAttribute('data-at-depuis')]; if (!v) return; const cs = W.getComputedStyle(D.documentElement); etat.ecart = ECART0; await aller(genomeDe(v, { memb: (v.couleurs || {}).memb || cs.getPropertyValue('--memb').trim(), memb2: (v.couleurs || {}).memb2 || cs.getPropertyValue('--memb2').trim() })); peindreKnobs(); return; }
      if (b.hasAttribute('data-at-porter')) { const id = b.getAttribute('data-at-porter'); if (prefs) await prefs.regler({ variante: id }); vibrer('selection'); return; }
      if (b.hasAttribute('data-at-oublier')) { const id = b.getAttribute('data-at-oublier'); peaux = peaux.filter(p => p.id !== id); await boxion.put('reglages', 'peaux', peaux).catch(() => {}); if (prefs && prefs.lire().variante === id) await prefs.regler({ variante: 'perso' }); peindreListes(); }
    });
    peindreGrille(); peindreKnobs(); peindreListes();
    return { unmount() { vivant = false; W.clearTimeout(attente); hote.innerHTML = ''; } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps['atelier-peaux'] = { manifest: { id: 'atelier-peaux', name: 'L\'atelier des peaux', icon: '◈' }, mount };
  return { charger, mount, peaux: () => peaux.slice(), ploxion: { id: 'atelier-peaux', nom: 'L\'atelier des peaux', icone: '◈', interne: true } };
}
