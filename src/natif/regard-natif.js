// 👁 (0.99.46) le pont vers PloxiRegard (AppDelegate.swift : ARKit, la caméra TrueDepth, sans image gardée). Jamais le plugin rendu par une
// fonction async (le piège du proxy) : surPromesse.
import { surPromesse } from './plugin-sur.js';
export function creerRegardNatif({ plugin = null } = {}) {
  if (!plugin) return null;
  const P = surPromesse(plugin);
  return {
    dispo: () => P.dispo().then(r => !!(r && r.dispo)).catch(() => false),
    demarrer: () => P.demarrer(),
    arreter: () => P.arreter(),
    sur: (ev, f) => { const h = P.addListener(ev, f); return () => { Promise.resolve(h).then(x => x && x.remove && x.remove()).catch(() => {}); }; },
  };
}
