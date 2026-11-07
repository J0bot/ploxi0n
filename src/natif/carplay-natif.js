// 🚗 CARPLAY (0.99.31, RS-7 07.11 : « ploxion sur CarPlay »). Le pont : le modèle (src/bions/carplay.js) part au Swift (PloxiCarPlay, option
// de build PLOXI0N_CARPLAY), qui le dessine avec les gabarits d'Apple et le GARDE (une voiture qui démarre avant la page a déjà quelque
// chose à montrer). Un toucher revient ici (« choix » { id }) : un son des Ambiances se lance ou se coupe ; un pote ou un rendez-vous, le Swift
// ouvre lui-même Plans (pas besoin de la page). Toutes les 8 s quand CarPlay est branché (les distances bougent), sinon toutes les minutes ;
// rien ne part si rien n'a changé.
import { surPromesse } from './plugin-sur.js';

export function creerCarPlay({ W = globalThis.window, plugin = null, modele = () => ({ onglets: [] }), agir = () => {}, periode = 8000, repos = 60000 } = {}) {
  if (!plugin) return null;
  const P = surPromesse(plugin);
  let connecte = false, minuteur = 0, dernier = '';
  const pousser = (force = false) => { let m; try { m = modele(); } catch (e) { return; } const s = JSON.stringify(m); if (!force && s === dernier) return; dernier = s; P.poser(m).catch(() => {}); };
  const rythme = () => { W.clearInterval(minuteur); minuteur = W.setInterval(() => pousser(false), connecte ? periode : repos); };
  P.addListener('connexion', (e) => { connecte = !!(e && e.connecte); if (connecte) pousser(true); rythme(); });
  P.addListener('choix', (e) => { if (!e || !e.id) return; Promise.resolve().then(() => agir(String(e.id))).catch(() => {}).then(() => W.setTimeout(() => pousser(true), 300)); });
  P.etat().then((r) => { connecte = !!(r && r.connecte); rythme(); }).catch(() => rythme());
  pousser(true);
  return { pousser, connecte: () => connecte, arreter: () => W.clearInterval(minuteur) };
}

/** les ambiances sans leur écran : montées une fois dans un hôte caché, puis pilotées (un son, tout couper) */
export function ambiancesSansEcran({ W = globalThis.window } = {}) {
  let inst = null;
  const monter = () => { if (inst) return inst; const A = W.jOSApps && W.jOSApps.ambiances; if (!A) return null; const h = W.document.createElement('div'); h.hidden = true; h.setAttribute('data-carplay', ''); W.document.body.appendChild(h); inst = A.mount(h); return inst; };
  return {
    basculer(k, volumes) { const i = monter(); if (!i || !i.regler) return false; i.regler(k, +volumes[k] > 0 ? 0 : 0.6); return true; },
    couper() { if (inst && inst.couper) inst.couper(); },
  };
}
