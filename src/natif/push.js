// 🔔 LES NOTIFICATIONS PUSH (0.91, RS-7 22.10 : « la clé APNs sur le labo »). Avant : les notifications locales, seulement app ouverte
// (src/natif/notifs.js). Maintenant, app fermée aussi : l'iPhone donne un JETON à l'app (APNs, @capacitor/push-notifications ; l'AppDelegate le
// relaie), l'app l'envoie au labo avec le compte (POST /api/app/push, le jeton du compte en en-tête, JAMAIS dans une adresse) ; le labo, qui
// détient la clé .p8 d'APNs, envoie les notifications (coord, messages, bother…). Toucher une notification ouvre le ploxion de son « ouvrir ».
// Le contrat du labo : docs/PUSH.md. ⚙ › Notifications › « Même app fermée » : on choisit les sujets ; couper retire le jeton du labo.
// boxion_local « reglages/push » = { actif, sujets, jeton, envoye, erreur }.
import { surPromesse } from './plugin-sur.js';
export const SUJETS = [['coord', 'coord (les messages des agents)'], ['messages', 'tes messages (le social, le chat)'], ['bother', 'bother me (les réponses)'], ['ploxions', 'tes ploxions (ce qu\'ils te signalent)']];

/** envoyer(q) : le HTTP natif AVEC le jeton du compte ; connecte() : un compte dans l'app */
export function creerPush({ W = globalThis.window, boxion, envoyer, source = 'https://labo.j0bot.ch', ouvrir = () => {}, signaler = () => {}, vibrer = () => {}, connecte = () => false,
  natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform()), charger = () => import('@capacitor/push-notifications') }) {
  let r = { actif: false, sujets: ['coord', 'messages', 'bother'], jeton: null, envoye: 0, erreur: null }, ecoute = false;
  const pret = boxion.get('reglages', 'push').then(v => { if (v && typeof v === 'object') r = { ...r, ...v }; }).catch(() => {});
  const garder = () => boxion.put('reglages', 'push', r).catch(() => {});
  async function PN() { return surPromesse((await charger()).PushNotifications); }   // le plugin est un Proxy : jamais rendu tel quel d'un async

  async function declarer(jeton) {
    const q = await envoyer({ methode: 'POST', url: source + '/api/app/push', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      corps: JSON.stringify({ jeton, plateforme: 'ios', environnement: 'production', app: 'ch.j0bot.ploxi0n', sujets: r.sujets }) });
    if (q.status === 404 || q.status === 405) throw new Error('le labo n\'a pas encore la route des notifications (docs/PUSH.md)');
    if (q.status === 401 || q.status === 403) throw new Error('connecte-toi d\'abord (⚙ › Compte)');
    if (q.status < 200 || q.status >= 300) throw new Error('le labo répond ' + q.status);
    r = { ...r, jeton, envoye: Date.now(), erreur: null }; await garder();
  }
  async function brancher(P) {
    if (ecoute) return; ecoute = true;
    // (0.99.28) le jeton est gardé DÈS qu'iOS le donne, même si le labo le refuse (sa route n'existait pas : le jeton était perdu, et
    // impossible de tester un envoi) ; ⚙ › Notifications le montre et le copie
    await P.addListener('registration', (t) => { const j = t && t.value; if (!j) return; r = { ...r, jeton: j }; garder(); declarer(j).catch((e) => { r.erreur = e.message; garder(); }); });
    await P.addListener('registrationError', (e) => { r.erreur = 'iOS refuse : ' + ((e && e.error) || 'inconnu'); garder(); });
    // reçue app ouverte : un signal discret (iOS ne l'affiche pas lui-même)
    await P.addListener('pushNotificationReceived', (n) => { vibrer('notification'); signaler('🔔 ' + ((n && n.title) || '') + (n && n.body ? ' · ' + n.body : '')); });
    // touchée : le ploxion de son « ouvrir » (ou ce que le labo a mis dans data)
    await P.addListener('pushNotificationActionPerformed', (a) => { const d = (a && a.notification && a.notification.data) || {}; const id = d.ouvrir || d.ploxion; if (id) ouvrir(String(id), d.params && typeof d.params === 'object' ? d.params : null); });
  }
  /** allumer : la permission d'iOS, puis le jeton → le labo */
  async function activer(sujets = null) {
    await pret;
    if (!natif()) throw new Error('les notifications push : sur l\'iPhone');
    if (!connecte()) throw new Error('connecte-toi d\'abord (⚙ › Compte) : le labo envoie à ton compte');
    if (Array.isArray(sujets)) r.sujets = sujets.filter(s => SUJETS.some(x => x[0] === s));
    const P = await PN();
    const p = await P.requestPermissions();
    if (p.receive !== 'granted') throw new Error('notifications refusées : Réglages iOS › ploxi0n › Notifications');
    await brancher(P);
    r = { ...r, actif: true }; await garder();
    await P.register();   // le jeton arrive par « registration »
    return { ...r };
  }
  async function couper() {
    await pret;
    const jeton = r.jeton; r = { ...r, actif: false, jeton: null }; await garder();
    if (jeton) { try { await envoyer({ methode: 'DELETE', url: source + '/api/app/push', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, corps: JSON.stringify({ jeton }) }); } catch (e) { /* hors ligne : le labo l'oubliera au premier refus d'Apple */ } }
    if (natif()) { try { const P = await PN(); await P.unregister(); } catch (e) { /* */ } }
    return { ...r };
  }
  async function sujets(l) { await pret; r.sujets = l.filter(s => SUJETS.some(x => x[0] === s)); await garder(); if (r.actif && r.jeton) await declarer(r.jeton).catch((e) => { r.erreur = e.message; garder(); }); return { ...r }; }
  /** au lancement : allumé → les écoutes, et le jeton redemandé (il peut changer) */
  async function demarrer() {
    await pret; if (!r.actif || !natif()) return;
    try { const P = await PN(); await brancher(P); if (connecte()) await P.register(); } catch (e) { r.erreur = e.message; garder(); }
  }
  return { pret, activer, couper, sujets, demarrer, reglage: () => ({ ...r }) };
}
