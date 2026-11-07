// @bion jOSAccueil — Android : ploxion comme écran d'accueil (launcher), les applis du téléphone, le bouton retour | api: dispo, estAccueil, choisir, applis, lancer, reglages
// ⌂ (0.99.32, RS-7 : « sur Android il faut que l'appli ploxion soit utilisable comme launcher, comme appli de base ; un android sans rien et juste
// l'appli ploxion »). Le natif : PloxiAccueil.java (android/app/src/main/java/ch/j0bot/ploxi0n/) + l'activity-alias HOME du manifeste.
// Ici, le contrat JS : rien ne s'allume tout seul ; ploxion ne devient l'écran d'accueil que si la personne le choisit dans la fenêtre d'Android.
import { surPromesse } from './plugin-sur.js';

/** plugin : PloxiAccueil (null ailleurs qu'Android : tout rejette proprement, dispo() = false) */
export function creerAccueil({ plugin = null } = {}) {
  const P = plugin ? surPromesse(plugin) : null;
  let cache = null, quand = 0;
  const non = () => Promise.reject(new Error('l\'écran d\'accueil : sur Android'));
  const api = {
    dispo: () => !!P,
    /** → { accueil, peut } */
    estAccueil: () => (P ? P.estAccueil().then(r => ({ accueil: !!(r && r.accueil), peut: !!(r && r.peut) })) : Promise.resolve({ accueil: false, peut: false })),
    /** la fenêtre d'Android « appli d'accueil » → { accueil } */
    choisir: () => (P ? P.choisir().then(r => ({ accueil: !!(r && r.accueil) })) : non()),
    /** les applis lançables, triées par nom ; gardées 5 min (frais : true pour relire) */
    applis({ frais = false, icones = true } = {}) {
      if (!P) return Promise.resolve([]);
      if (cache && !frais && Date.now() - quand < 300000) return Promise.resolve(cache);
      return P.applis({ icones, taille: 96 }).then((r) => {
        const l = (r && Array.isArray(r.applis) ? r.applis : []).filter(a => a && a.paquet)
          .map(a => ({ paquet: String(a.paquet), activite: a.activite ? String(a.activite) : '', nom: String(a.nom || a.paquet), icone: /^data:image\/png;base64,/.test(a.icone || '') ? a.icone : '' }))
          .sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));
        cache = l; quand = Date.now(); return l;
      });
    },
    lancer: (a) => (P ? P.lancer(typeof a === 'string' ? { paquet: a } : { paquet: String(a.paquet), ...(a.activite ? { activite: String(a.activite) } : {}) }) : non()),
    reglages: (paquet) => (P ? P.reglages(paquet ? { paquet: String(paquet) } : {}) : non()),
    oublier() { cache = null; },
  };
  return api;
}

/**
 * Le bouton retour d'Android (et le geste) : d'abord ce qui flotte (Échap), puis le ploxion ouvert (‹), puis à l'accueil :
 * écran d'accueil d'Android → rien (on ne quitte pas l'écran d'accueil) ; sinon l'app passe en arrière-plan.
 * Le bouton maison quand ploxion EST l'écran d'accueil (« ploxiAccueil », MainActivity.java) → l'accueil du xer.
 */
export function brancherRetourAndroid({ W = globalThis.window, app, routeur, accueil, flottant = () => null }) {
  const D = W.document;
  let estAccueil = false;
  const relire = () => accueil.estAccueil().then((r) => { estAccueil = r.accueil; D.documentElement.setAttribute('data-px-launcher', r.accueil ? '1' : '0'); }).catch(() => {});
  relire();
  function retour() {
    const f = flottant();
    if (f) { try { f.click ? f.click() : f.remove(); } catch (e) { /* */ } return 'flottant'; }
    if (routeur.courant()) { routeur.retour(); return 'ploxion'; }
    if (estAccueil) return 'accueil';
    if (app && app.minimizeApp) app.minimizeApp().catch(() => {});
    return 'arriere-plan';
  }
  const poignees = [];
  if (app && app.addListener) {
    poignees.push(app.addListener('backButton', () => retour()));
    poignees.push(app.addListener('resume', () => relire()));
  }
  const maison = () => { if (routeur.courant()) routeur.minimiser(); else routeur.accueil(); };
  W.addEventListener('ploxiAccueil', maison);
  return { retour, maison, relire, estAccueil: () => estAccueil,
    couper() { W.removeEventListener('ploxiAccueil', maison); for (const p of poignees) { Promise.resolve(p).then(h => h && h.remove && h.remove()).catch(() => {}); } } };
}
