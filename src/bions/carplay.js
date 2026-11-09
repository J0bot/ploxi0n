// @bion carplay — ce que ploxi0n montre sur l'écran de la voiture (CarPlay) : des onglets de listes, fabriqués depuis l'état de l'app | api: modeleCarPlay, cardinal, URL_PLANS
// (0.99.31, RS-7 07.11 : « ploxion sur CarPlay », une photo de CarPlay dans sa voiture). CarPlay n'affiche JAMAIS de page web : une app
// n'y a droit qu'aux gabarits d'Apple (listes, onglets, alertes ; selon l'autorisation qu'Apple donne). Ce bion fabrique le MODÈLE (pur,
// sans DOM) ; PloxiCarPlay (Swift, option PLOXI0N_CARPLAY) le dessine et renvoie les touchers. Deux onglets :
//   ⌖ potes      : les potes de Proche qui partagent leur position, et les rendez-vous ; toucher = l'itinéraire dans Plans, sur CarPlay
//   ≈ ambiances  : lancer / couper un son des Ambiances (pluie, vagues, feu…)
// Rien de plus sur la route : peu de texte, de gros éléments, pas de clavier (les règles d'Apple, et ne pas nuire).
import { relatif, fraicheur } from './potes.js';

const DIRS = ['au nord', 'au nord-est', 'à l\'est', 'au sud-est', 'au sud', 'au sud-ouest', 'à l\'ouest', 'au nord-ouest'];
/** un cap (degrés) → « au nord-est » */
export const cardinal = (cap) => DIRS[Math.round((((+cap % 360) + 360) % 360) / 45) % 8];
/** l'itinéraire en voiture dans Plans (sur CarPlay, Plans s'ouvre sur l'écran de la voiture) */
export const URL_PLANS = (lat, lng) => 'maps://?daddr=' + (+lat).toFixed(5) + ',' + (+lng).toFixed(5) + '&dirflg=d';
const km = (d) => (d < 950 ? Math.round(d / 10) * 10 + ' m' : (d / 1000).toFixed(d < 9950 ? 1 : 0).replace('.', ',') + ' km');

/** potes : { moi, positions: [{ fp, nom, lat, lng, t, rdv? }], rdv? (le mien) } ; sons : [[k, nom, glyphe]] ; volumes : { k: 0..1 } */
export function modeleCarPlay({ potes = {}, sons = [], volumes = {}, maintenant = Date.now() } = {}) {
  const moi = potes.moi || null, pos = potes.positions || [], items = [], rdvs = [], vus = new Set();
  const ou = (p) => (moi ? (() => { const r = relatif(moi, p); return km(r.d) + ' ' + cardinal(r.cap); })() : 'ta position arrive…');
  for (const x of pos.slice().sort((a, b) => (moi ? relatif(moi, a).d - relatif(moi, b).d : 0))) {
    items.push({ id: 'pote:' + x.fp, texte: x.nom || 'un pote', detail: ou(x) + ' · ' + fraicheur(x.t, maintenant).texte, url: URL_PLANS(x.lat, x.lng) });
    if (x.rdv) { const k = x.rdv.lat.toFixed(4) + ',' + x.rdv.lng.toFixed(4); if (!vus.has(k)) { vus.add(k); rdvs.push({ id: 'rdv:' + x.fp, texte: '◎ ' + (x.rdv.nom || 'rendez-vous'), detail: ou(x.rdv) + ' · de ' + (x.nom || '?'), url: URL_PLANS(x.rdv.lat, x.rdv.lng) }); } }
  }
  if (potes.rdv) rdvs.unshift({ id: 'rdv:moi', texte: '◎ ' + (potes.rdv.nom || 'mon rendez-vous'), detail: ou(potes.rdv), url: URL_PLANS(potes.rdv.lat, potes.rdv.lng) });
  const joue = sons.filter(([k]) => +volumes[k] > 0);
  const sonsItems = sons.map(([k, nom, g]) => ({ id: 'son:' + k, texte: g + ' ' + nom, detail: +volumes[k] > 0 ? 'joue · ' + Math.round(+volumes[k] * 100) + ' %' : 'toucher pour lancer' }));
  return {
    v: 1,
    onglets: [
      { id: 'potes', titre: 'Potes', icone: 'location.circle', vide: 'Personne ne partage sa position · Proche, sur l\'iPhone',
        sections: [rdvs.length ? { titre: 'rendez-vous', items: rdvs } : null, items.length ? { titre: 'mes potes', items } : null].filter(Boolean) },
      { id: 'ambiances', titre: 'Ambiances', icone: 'waveform',
        sections: [joue.length ? { titre: 'en cours', items: [{ id: 'sons:couper', texte: '■ tout couper', detail: joue.map(([, n]) => n).join(' · ') }] } : null, { titre: 'les sons', items: sonsItems }].filter(Boolean) },
    ],
  };
}
