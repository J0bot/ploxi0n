// ◷ LA VEILLE (0.99.20, 05.11 ; RS-7 : « la localisation en arrière-plan ») : window.jOSVeille, pour mappion (le temps passé à chaque endroit)
// et tout ploxion du labo. Sur l'iPhone : PloxiVeille (CoreLocation : les visites + un point tous les 5 m quand tu bouges, écrits sur le
// téléphone même app fermée). Ailleurs : null (le navigateur n'a pas d'arrière-plan ; mappion garde sa veille « page ouverte »).
//   demarrer({ fine }) → { etat }   arreter()   etat()   lire(depuis) → { points:[{t,la,lo,acc,v}], visites:[{a,d?,la,lo,acc}] }   sur(ev, f)
import { surPromesse } from './plugin-sur.js';

export function creerVeille({ plugin = null } = {}) {
  if (!plugin) return null;
  const P = surPromesse(plugin);
  return {
    natif: true,
    demarrer: (o = {}) => P.demarrer({ fine: o.fine !== false }),
    arreter: () => P.arreter(),
    etat: () => P.etat(),
    lire: (depuis = 0) => P.lire({ depuis: +depuis || 0 }).then(r => ({ points: (r && r.points) || [], visites: (r && r.visites) || [] })),
    vider: () => P.vider(),
    sur: (ev, f) => { const h = P.addListener(ev, f); return () => { Promise.resolve(h).then(x => x && x.remove && x.remove()).catch(() => {}); }; },
  };
}
