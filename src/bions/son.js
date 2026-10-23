// @bion son — un son = des knobs : la source, le filtre, l'enveloppe, le mouvement, l'espace ; des presets ; les notes des pads | api: PARAMS, PRESETS, normaliser, noteDePad, hasard, ONDES
// (0.99.4, RS-7 24.10 : « et qu'on puisse commencer à faire du son avec des knobs »). Pur, sans Web Audio : le moteur est dans src/lot/synthe.js,
// les knobs sont le bion du labo jOSKnob (public/bions/jOSKnob.js). Chaque paramètre est un knob : sa clé, son nom, ses bornes, son pas, sa
// valeur de départ, sa forme (kion pour le continu, koin pour un choix), son groupe. La boucle compose src/bions/proche.js (MOTIFS, GAMMES).
import { GAMMES } from './proche.js';

export const ONDES = ['sine', 'triangle', 'sawtooth', 'square'];
const NOMS_ONDES = ['∿ sinus', '△ triangle', '⩘ scie', '⊓ carré'];
const ms = (v) => (v < 1 ? Math.round(v * 1000) + ' ms' : v.toFixed(2) + ' s');
const hz = (v) => (v >= 1000 ? (v / 1000).toFixed(1) + ' kHz' : Math.round(v) + ' Hz');
const pct = (v) => Math.round(v * 100) + ' %';

/** [clé, nom, min, max, pas, départ, format, forme, groupe] */
export const PARAMS = [
  ['onde', 'onde', 0, 3, 1, 2, (v) => NOMS_ONDES[Math.round(v)] || '', 'koin', 'source'],
  ['desaccord', 'désaccord', 0, 50, 1, 8, (v) => Math.round(v) + ' ct', 'kion', 'source'],
  ['sub', 'sub', 0, 1, 0.05, 0.4, pct, 'kion', 'source'],
  ['coupure', 'coupure', 60, 8000, 10, 1400, hz, 'kion', 'filtre'],
  ['resonance', 'résonance', 0.1, 20, 0.1, 4, (v) => v.toFixed(1), 'kion', 'filtre'],
  ['enveloppe', 'env. filtre', 0, 1, 0.05, 0.5, pct, 'kion', 'filtre'],
  ['attaque', 'attaque', 0.002, 2, 0.002, 0.01, ms, 'kion', 'enveloppe'],
  ['declin', 'déclin', 0.02, 2, 0.01, 0.25, ms, 'kion', 'enveloppe'],
  ['maintien', 'maintien', 0, 1, 0.05, 0.5, pct, 'kion', 'enveloppe'],
  ['relache', 'relâche', 0.02, 4, 0.01, 0.4, ms, 'kion', 'enveloppe'],
  ['lfo', 'lfo', 0.05, 12, 0.05, 0.6, (v) => v.toFixed(2) + ' Hz', 'kion', 'mouvement'],
  ['lfoProf', 'lfo → filtre', 0, 1, 0.05, 0.2, pct, 'kion', 'mouvement'],
  ['echo', 'écho', 0.02, 1.2, 0.01, 0.32, ms, 'kion', 'espace'],
  ['retour', 'retour', 0, 0.9, 0.05, 0.35, pct, 'kion', 'espace'],
  ['mix', 'mix écho', 0, 1, 0.05, 0.25, pct, 'kion', 'espace'],
  ['volume', 'volume', 0, 1, 0.05, 0.7, pct, 'kion', 'sortie'],
  ['tempo', 'tempo', 50, 200, 1, 122, (v) => Math.round(v) + ' bpm', 'kion', 'sortie'],
].map(([cle, nom, min, max, pas, depart, fmt, forme, groupe]) => ({ cle, nom, min, max, pas, depart, fmt, forme, groupe }));
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
  'basse tekk': { onde: 2, desaccord: 6, sub: 0.6, coupure: 380, resonance: 9, enveloppe: 0.7, attaque: 0.004, declin: 0.18, maintien: 0.2, relache: 0.12, lfo: 0.3, lfoProf: 0.1, echo: 0.24, retour: 0.2, mix: 0.12, volume: 0.75, tempo: 128 },
  nappe: { onde: 1, desaccord: 22, sub: 0.2, coupure: 2400, resonance: 1.2, enveloppe: 0.2, attaque: 1.2, declin: 1.4, maintien: 0.8, relache: 2.8, lfo: 0.18, lfoProf: 0.35, echo: 0.62, retour: 0.55, mix: 0.45, volume: 0.6, tempo: 84 },
  acide: { onde: 2, desaccord: 0, sub: 0.15, coupure: 260, resonance: 18, enveloppe: 0.95, attaque: 0.002, declin: 0.14, maintien: 0.05, relache: 0.08, lfo: 4, lfoProf: 0.25, echo: 0.18, retour: 0.4, mix: 0.2, volume: 0.65, tempo: 136 },
  cloche: { onde: 0, desaccord: 12, sub: 0, coupure: 6000, resonance: 0.6, enveloppe: 0.1, attaque: 0.002, declin: 0.9, maintien: 0, relache: 1.6, lfo: 5.5, lfoProf: 0.05, echo: 0.42, retour: 0.45, mix: 0.4, volume: 0.6, tempo: 100 },
  brume: { onde: 3, desaccord: 40, sub: 0.3, coupure: 700, resonance: 3, enveloppe: 0.3, attaque: 0.6, declin: 1, maintien: 0.6, relache: 3, lfo: 0.08, lfoProf: 0.6, echo: 1, retour: 0.7, mix: 0.6, volume: 0.55, tempo: 70 },
};

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
    const u = r(), v = p.cle === 'coupure' || p.cle === 'lfo' || p.cle === 'attaque' || p.cle === 'relache' || p.cle === 'declin' ? p.min * Math.pow(p.max / p.min, u) : p.min + (p.max - p.min) * u;
    out[p.cle] = v;
  }
  return normaliser(out);
}
