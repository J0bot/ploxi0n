// @bion son — un son = des knobs : la source, le filtre, l'enveloppe, le mouvement, l'espace ; des presets ; les notes des pads | api: PARAMS, PRESETS, STYLES, normaliser, noteDePad, hasard, ONDES, sonPartage, codeDuSon, lireCodeSon
// (0.99.4, RS-7 24.10 : « et qu'on puisse commencer à faire du son avec des knobs »). Pur, sans Web Audio : le moteur est dans src/lot/synthe.js,
// les knobs sont le bion du labo jOSKnob (public/bions/jOSKnob.js). Chaque paramètre est un knob : sa clé, son nom, ses bornes, son pas, sa
// valeur de départ, sa forme (kion pour le continu, koin pour un choix), son groupe. La boucle compose src/bions/proche.js (MOTIFS, GAMMES).
import { GAMMES } from './proche.js';

export const ONDES = ['sine', 'triangle', 'sawtooth', 'square'];
const NOMS_ONDES = ['∿ sinus', '△ triangle', '⩘ scie', '⊓ carré'];
const ms = (v) => (v < 1 ? Math.round(v * 1000) + ' ms' : v.toFixed(2) + ' s');
const hz = (v) => (v >= 1000 ? (v / 1000).toFixed(1) + ' kHz' : Math.round(v) + ' Hz');
const pct = (v) => Math.round(v * 100) + ' %';

/** [clé, nom, min, max, pas, départ, format, forme, groupe] — (0.99.5, RS-7 : « il faut tous les knobs possibles ») 33 knobs */
const FILTRES = ['passe-bas', 'passe-bande', 'passe-haut'];
const signe = (u) => (v) => (v > 0 ? '+' : '') + Math.round(v) + u;
export const PARAMS = [
  ['onde', 'onde 1', 0, 3, 1, 2, (v) => NOMS_ONDES[Math.round(v)] || '', 'koin', 'source'],
  ['onde2', 'onde 2', 0, 3, 1, 2, (v) => NOMS_ONDES[Math.round(v)] || '', 'koin', 'source'],
  ['intervalle', 'intervalle', -12, 12, 1, 0, signe(' dt'), 'kion', 'source'],
  ['desaccord', 'désaccord', 0, 50, 1, 8, (v) => Math.round(v) + ' ct', 'kion', 'source'],
  ['sub', 'sub', 0, 1, 0.05, 0.4, pct, 'kion', 'source'],
  ['bruit', 'bruit', 0, 1, 0.05, 0, pct, 'kion', 'source'],
  ['octave', 'octave', -2, 2, 1, 0, signe(''), 'koin', 'source'],
  ['transpose', 'transpose', -12, 12, 1, 0, signe(' dt'), 'kion', 'source'],
  ['glisse', 'glisse', 0, 0.6, 0.01, 0, ms, 'kion', 'source'],
  ['filtre', 'filtre', 0, 2, 1, 0, (v) => FILTRES[Math.round(v)] || '', 'koin', 'filtre'],
  ['coupure', 'coupure', 60, 8000, 10, 1400, hz, 'kion', 'filtre'],
  ['resonance', 'résonance', 0.1, 20, 0.1, 4, (v) => v.toFixed(1), 'kion', 'filtre'],
  ['enveloppe', 'env. filtre', 0, 1, 0.05, 0.5, pct, 'kion', 'filtre'],
  ['attaque', 'attaque', 0.002, 2, 0.002, 0.01, ms, 'kion', 'enveloppe'],
  ['declin', 'déclin', 0.02, 2, 0.01, 0.25, ms, 'kion', 'enveloppe'],
  ['maintien', 'maintien', 0, 1, 0.05, 0.5, pct, 'kion', 'enveloppe'],
  ['relache', 'relâche', 0.02, 4, 0.01, 0.4, ms, 'kion', 'enveloppe'],
  ['lfoOnde', 'onde lfo', 0, 3, 1, 1, (v) => NOMS_ONDES[Math.round(v)] || '', 'koin', 'mouvement'],
  ['lfo', 'lfo', 0.05, 12, 0.05, 0.6, (v) => v.toFixed(2) + ' Hz', 'kion', 'mouvement'],
  ['lfoProf', 'lfo → filtre', 0, 1, 0.05, 0.2, pct, 'kion', 'mouvement'],
  ['vibrato', 'vibrato', 0, 1, 0.05, 0, pct, 'kion', 'mouvement'],
  ['tremolo', 'trémolo', 0, 1, 0.05, 0, pct, 'kion', 'mouvement'],
  ['saturation', 'saturation', 0, 1, 0.05, 0, pct, 'kion', 'espace'],
  ['echo', 'écho', 0.02, 1.2, 0.01, 0.32, ms, 'kion', 'espace'],
  ['retour', 'retour', 0, 0.9, 0.05, 0.35, pct, 'kion', 'espace'],
  ['mix', 'mix écho', 0, 1, 0.05, 0.25, pct, 'kion', 'espace'],
  ['reverb', 'réverb', 0, 1, 0.05, 0.15, pct, 'kion', 'espace'],
  ['taille', 'taille', 0.3, 6, 0.1, 1.8, (v) => v.toFixed(1) + ' s', 'kion', 'espace'],
  ['stereo', 'stéréo', 0, 1, 0.05, 0.3, pct, 'kion', 'espace'],
  ['volume', 'volume', 0, 1, 0.05, 0.7, pct, 'kion', 'sortie'],
  ['tempo', 'tempo', 50, 240, 1, 122, (v) => Math.round(v) + ' bpm', 'kion', 'sortie'],
  ['swing', 'swing', 0, 0.6, 0.05, 0, pct, 'kion', 'sortie'],
  ['gate', 'durée', 0.1, 1, 0.05, 0.6, pct, 'kion', 'sortie'],
  ['kick', 'kick', 0, 1, 0.05, 0, pct, 'kion', 'sortie'],   // (0.99.21) la grosse caisse, sur chaque temps de la boucle
].map(([cle, nom, min, max, pas, depart, fmt, forme, groupe]) => ({ cle, nom, min, max, pas, depart, fmt, forme, groupe }));
export { FILTRES };
export const GROUPES = ['source', 'filtre', 'enveloppe', 'mouvement', 'espace', 'sortie'];
const PAR = Object.fromEntries(PARAMS.map(p => [p.cle, p]));

/** des réglages sûrs : chaque valeur bornée, arrondie à son pas ; ce qui manque prend sa valeur de départ ; l'inconnu tombe */
export function normaliser(r = {}) {
  const out = {};
  for (const p of PARAMS) {
    let v = Number(r && r[p.cle]); if (!Number.isFinite(v)) v = p.depart;
    v = Math.max(p.min, Math.min(p.max, v)); v = Math.round((v - p.min) / p.pas) * p.pas + p.min;
    out[p.cle] = Math.round(v * 1e6) / 1e6;
  }
  return out;
}

export const PRESETS = {
  'basse tekk': { onde: 2, onde2: 3, intervalle: 0, saturation: 0.3, gate: 0.5, desaccord: 6, sub: 0.6, coupure: 380, resonance: 9, enveloppe: 0.7, attaque: 0.004, declin: 0.18, maintien: 0.2, relache: 0.12, lfo: 0.3, lfoProf: 0.1, echo: 0.24, retour: 0.2, mix: 0.12, volume: 0.75, tempo: 128 },
  nappe: { onde: 1, onde2: 0, intervalle: 7, reverb: 0.6, taille: 4.5, stereo: 0.8, vibrato: 0.15, gate: 1, desaccord: 22, sub: 0.2, coupure: 2400, resonance: 1.2, enveloppe: 0.2, attaque: 1.2, declin: 1.4, maintien: 0.8, relache: 2.8, lfo: 0.18, lfoProf: 0.35, echo: 0.62, retour: 0.55, mix: 0.45, volume: 0.6, tempo: 84 },
  acide: { onde: 2, onde2: 2, saturation: 0.45, glisse: 0.06, gate: 0.45, swing: 0.15, desaccord: 0, sub: 0.15, coupure: 260, resonance: 18, enveloppe: 0.95, attaque: 0.002, declin: 0.14, maintien: 0.05, relache: 0.08, lfo: 4, lfoProf: 0.25, echo: 0.18, retour: 0.4, mix: 0.2, volume: 0.65, tempo: 136 },
  cloche: { onde: 0, onde2: 0, intervalle: 12, reverb: 0.45, taille: 3, stereo: 0.6, tremolo: 0.1, desaccord: 12, sub: 0, coupure: 6000, resonance: 0.6, enveloppe: 0.1, attaque: 0.002, declin: 0.9, maintien: 0, relache: 1.6, lfo: 5.5, lfoProf: 0.05, echo: 0.42, retour: 0.45, mix: 0.4, volume: 0.6, tempo: 100 },
  // (0.99.21, RS-7 : « pour le synthé je veux un max de psy : psytrance, tribe, acidcore, mentalcore ») ; le style (STYLES) pose aussi le
  // motif, la gamme et le tempo
  psytrance: { onde: 2, onde2: 2, intervalle: 0, desaccord: 4, sub: 0.55, saturation: 0.25, coupure: 520, resonance: 7, enveloppe: 0.85, attaque: 0.002, declin: 0.09, maintien: 0.05, relache: 0.05, gate: 0.4, lfo: 0.25, lfoProf: 0.08, echo: 0.31, retour: 0.25, mix: 0.08, reverb: 0.05, stereo: 0.1, kick: 0.9, volume: 0.75, tempo: 145, swing: 0 },
  tribe: { onde: 3, onde2: 2, intervalle: -12, desaccord: 10, sub: 0.7, saturation: 0.7, coupure: 900, resonance: 5, enveloppe: 0.6, attaque: 0.002, declin: 0.16, maintien: 0.3, relache: 0.08, gate: 0.55, lfo: 2.3, lfoProf: 0.15, echo: 0.25, retour: 0.3, mix: 0.12, reverb: 0.1, kick: 1, volume: 0.72, tempo: 178, swing: 0.1 },
  acidcore: { onde: 2, onde2: 3, intervalle: 0, desaccord: 2, sub: 0.25, saturation: 0.8, glisse: 0.05, coupure: 300, resonance: 19, enveloppe: 1, attaque: 0.002, declin: 0.12, maintien: 0.02, relache: 0.06, gate: 0.5, lfo: 6, lfoProf: 0.3, echo: 0.17, retour: 0.45, mix: 0.18, kick: 1, volume: 0.68, tempo: 190, swing: 0.05 },
  mentalcore: { onde: 3, onde2: 3, intervalle: 7, desaccord: 18, sub: 0.6, saturation: 1, bruit: 0.1, coupure: 1500, resonance: 6, enveloppe: 0.5, attaque: 0.002, declin: 0.07, maintien: 0.4, relache: 0.04, gate: 0.6, lfo: 8, lfoProf: 0.2, tremolo: 0.15, echo: 0.15, retour: 0.2, mix: 0.1, kick: 1, volume: 0.7, tempo: 220, swing: 0 },
  brume: { onde: 3, onde2: 1, intervalle: -5, bruit: 0.35, reverb: 0.7, taille: 5.5, stereo: 1, tremolo: 0.25, lfoOnde: 0, desaccord: 40, sub: 0.3, coupure: 700, resonance: 3, enveloppe: 0.3, attaque: 0.6, declin: 1, maintien: 0.6, relache: 3, lfo: 0.08, lfoProf: 0.6, echo: 1, retour: 0.7, mix: 0.6, volume: 0.55, tempo: 70 },
};

/** (0.99.21) un style = un son + son motif, sa gamme, son tempo (le tempo est dans le son) */
export const STYLES = {
  psytrance: { motif: 'psy', gamme: 'phrygien' },
  tribe: { motif: 'tribe', gamme: 'mineur' },
  acidcore: { motif: 'acide', gamme: 'phrygien' },
  mentalcore: { motif: 'mental', gamme: 'harmonique' },
};

// ---- (0.99.21) partager un son : un code à copier-coller (« ploxi-son: » + du base64url), et ce que le maillage transporte ----
/** { nom, p, motif, gamme, pas } → un objet sûr (tout borné : ce qui vient d'ailleurs est suspect), ou null */
export function sonPartage(o, { motifs = null, gammes = GAMMES, pasValides = null } = {}) {
  if (!o || typeof o !== 'object' || !o.p || typeof o.p !== 'object') return null;
  const motif = typeof o.motif === 'string' && (!motifs || motifs[o.motif] || o.motif === 'mien') ? o.motif : null;
  const pas = o.motif === 'mien' && pasValides ? pasValides(o.pas) : null;
  return { nom: String(o.nom || 'un son').slice(0, 30), p: normaliser(o.p), motif: motif === 'mien' && !pas ? null : motif, gamme: gammes[o.gamme] ? o.gamme : null, pas };
}
/** le code d'un son : seulement ce qui diffère du départ (court), en base64url */
export function codeDuSon({ nom, p, motif, gamme, pas }) {
  const d = {}; for (const x of PARAMS) if (p && p[x.cle] !== x.depart) d[x.cle] = p[x.cle];
  const json = JSON.stringify({ v: 1, nom: String(nom || '').slice(0, 30), p: d, motif, gamme, pas: motif === 'mien' ? pas : undefined });
  const b = typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(json))) : Buffer.from(json).toString('base64');
  return 'ploxi-son:' + b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
/** un code collé (même au milieu d'un texte) → { nom, p, motif, gamme, pas } brut (à passer par sonPartage), ou null */
export function lireCodeSon(texte) {
  const m = /ploxi-son:([A-Za-z0-9_-]{4,6000})/.exec(String(texte || '')); if (!m) return null;
  try { const b = m[1].replace(/-/g, '+').replace(/_/g, '/'); const s = typeof atob === 'function' ? decodeURIComponent(escape(atob(b))) : Buffer.from(b, 'base64').toString('utf8'); const o = JSON.parse(s); return o && o.v === 1 ? o : null; } catch (e) { return null; }
}

/** la note MIDI d'un pad : les pads suivent la gamme depuis la tonique, de bas en haut (16 pads = un peu plus de deux octaves) */
export function noteDePad(i, { gamme = 'mineur', tonique = 48 } = {}) {
  const g = GAMMES[gamme] || GAMMES.mineur, k = Math.max(0, Math.floor(+i) || 0);
  return tonique + g[k % g.length] + 12 * Math.floor(k / g.length);
}
export const freq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

/** un son au hasard, stable pour une graine (le même chiffre redonne le même son) */
export function hasard(graine = 1) {
  let s = (Math.floor(+graine) || 1) >>> 0;
  const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const out = {};
  for (const p of PARAMS) {
    if (p.cle === 'volume') { out.volume = 0.65; continue; }
    if (p.cle === 'octave' || p.cle === 'transpose') { out[p.cle] = 0; continue; }   // le hasard change le son, pas la hauteur des pads
    const u = r(), v = p.cle === 'coupure' || p.cle === 'lfo' || p.cle === 'attaque' || p.cle === 'relache' || p.cle === 'declin' ? p.min * Math.pow(p.max / p.min, u) : p.min + (p.max - p.min) * u;
    out[p.cle] = v;
  }
  return normaliser(out);
}
