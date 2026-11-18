// ◷ LA VEILLE (0.99.20, 05.11 ; RS-7 : « la localisation en arrière-plan ») : window.jOSVeille, pour mappion (le temps passé à chaque endroit)
// et tout ploxion du labo. Sur l'iPhone : PloxiVeille (CoreLocation : les visites + un point tous les 5 m quand tu bouges, écrits sur le
// téléphone même app fermée). Ailleurs : null (le navigateur n'a pas d'arrière-plan ; mappion garde sa veille « page ouverte »).
//   demarrer({ fine }) → { etat }   arreter()   etat()   lire(depuis) → { points:[{t,la,lo,acc,v}], visites:[{a,d?,la,lo,acc}] }   sur(ev, f)
// 🏝 (0.99.43, RS-7 : « une activité pour le ploxion mappion ») la balade : une Live Activity (écran verrouillé, Dynamic Island) que le Swift
// met à jour lui-même à chaque position, app en arrière-plan : le chrono, la distance parcourue, et une cible (des toilettes, un pote, le
// rendez-vous) avec sa distance et sa direction ; « ◎ tu y es » à 25 m. L'app doit être à l'écran pour la lancer (une règle d'iOS).
//   balade.debut({ titre?, ploxion?, cible?: { nom, lat, lng }, notifier? }) → { id }   balade.cible({ nom, lat, lng } | null)
//   balade.fin() → { metres, secondes }   (ploxion : celui qu'ouvre le toucher sur l'activité ; mappion par défaut)
// 👣 (0.99.58, RS-7 : « ça me suit partout où je vais et ça prend mes pas, ma vitesse, gyroscope et accéléromètre ») :
//   demarrer({ fine, capteurs }) : chaque point gagne m (l'activité : pied, course, velo, voiture, immobile), c (pas/s), et avec capteurs
//   x (l'agitation moyenne, g) et r (la rotation moyenne, rad/s) ; v reste la vitesse (m/s).
//   pas({ depuis, jusqua }) → { pas, metres, etages, descendus }   activites({ depuis }) → [{ t, m, sur }]   (iOS les garde 7 jours)
import { surPromesse } from './plugin-sur.js';

/** une cible propre ({ nom, lat, lng }) ou null */
export function cibleBalade(c) {
  if (!c || typeof c !== 'object') return null;
  const lat = +c.lat, lng = +c.lng;
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { nom: String(c.nom || 'là-bas').slice(0, 40), lat, lng };
}

export function creerVeille({ plugin = null, activites = () => true, quand = () => {}, quandVeille = () => {} } = {}) {
  if (!plugin) return null;
  const P = surPromesse(plugin);
  const coupees = () => Promise.reject(new Error('activités en direct coupées dans ⚙ › Réglages'));
  const balade = {
    debut: (o = {}) => {
      if (!activites()) return coupees();
      const c = cibleBalade(o.cible);
      return P.baladeDebut({ titre: String(o.titre || 'balade').slice(0, 40), ploxion: String(o.ploxion || 'mappion'), notifier: o.notifier !== false, ...(c ? { cible: c } : {}) })
        .then(r => { try { quand(true); } catch (e) { /* */ } return r; });
    },
    cible: (c) => { const x = cibleBalade(c); return P.baladeCible(x ? { cible: x } : {}); },
    fin: () => P.baladeFin().then(r => { try { quand(false); } catch (e) { /* */ } return r; }),
  };
  return {
    balade,
    natif: true,
    demarrer: (o = {}) => P.demarrer({ fine: o.fine !== false, capteurs: !!o.capteurs }).then(r => { try { quandVeille(true); } catch (e) { /* */ } return r; }),
    arreter: () => P.arreter().then(r => { try { quandVeille(false); } catch (e) { /* */ } return r; }),
    pas: (o = {}) => P.pas({ ...(Number.isFinite(+o.depuis) && o.depuis != null ? { depuis: +o.depuis } : {}), ...(Number.isFinite(+o.jusqua) && o.jusqua != null ? { jusqua: +o.jusqua } : {}) }),
    activites: (o = {}) => P.activites(Number.isFinite(+o.depuis) && o.depuis != null ? { depuis: +o.depuis } : {}).then(r => (r && r.activites) || []),
    etat: () => P.etat(),
    lire: (depuis = 0) => P.lire({ depuis: +depuis || 0 }).then(r => ({ points: (r && r.points) || [], visites: (r && r.visites) || [] })),
    vider: () => P.vider(),
    sur: (ev, f) => { const h = P.addListener(ev, f); return () => { Promise.resolve(h).then(x => x && x.remove && x.remove()).catch(() => {}); }; },
  };
}
