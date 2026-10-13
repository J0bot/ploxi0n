// LES NOTIFICATIONS de ploxi0n (RS-7 12.10 : « je veux voir si les notifs fonctionnent, genre quand il y a un message de coord »).
//   tester()        une notification locale dans 5 s (verrouille le téléphone pour la voir arriver)
//   coord           les nouveaux messages de /coord (labo : /coord/feed.json, admin ; le jeton de l'app ouvre la route, mode connecté) ;
//                   vérifiés à l'ouverture, au retour au premier plan, puis chaque minute TANT QUE l'app est au premier plan
//                   (iOS endort une app en arrière-plan : la vraie notification « app fermée » demande APNs, voir docs/FEUILLE-DE-ROUTE.md)
//   toucher une notification de coord ouvre le ploxion 📡 coord
// Réglages : boxion_local « reglages/notifs » = { coord: bool, dernierCoord: id }. Rien au premier passage (on ne réveille pas l'historique).
import { surPromesse } from './plugin-sur.js';
export function creerNotifs({ W = globalThis.window, boxion, vibrer = () => {}, envoyer, source = 'https://labo.j0bot.ch', ouvrir = () => {}, charger = () => import('@capacitor/local-notifications') }) {
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  let reglage = { coord: false, dernierCoord: 0 }, minuterie = null, ecoute = false;
  const pret = boxion.get('reglages', 'notifs').then(v => { if (v && typeof v === 'object') reglage = { ...reglage, ...v }; }).catch(() => {});
  const garder = () => boxion.put('reglages', 'notifs', reglage).catch(() => {});
  async function LN() { return surPromesse((await charger()).LocalNotifications); }
  async function permission() {
    const L = await LN(); const p = await L.requestPermissions();
    if (p.display !== 'granted') throw new Error('notifications refusées : Réglages iOS › ploxi0n › Notifications');
    if (!ecoute) { ecoute = true; L.addListener('localNotificationActionPerformed', (e) => { const x = e && e.notification && e.notification.extra; if (x && x.ouvrir) ouvrir(x.ouvrir); }).catch(() => {}); }
    return L;
  }
  async function verifierCoord() {
    if (!reglage.coord) return [];
    const r = await envoyer({ methode: 'GET', url: source + '/coord/feed.json?since=' + (reglage.dernierCoord || 0), headers: { Accept: 'application/json' } });
    if (r.status === 401 || r.status === 403) throw new Error('coord : il faut être connecté avec le compte admin');
    if (r.status !== 200) throw new Error('coord : HTTP ' + r.status);
    const d = JSON.parse(r.texte || '{}'), l = Array.isArray(d.messages) ? d.messages : [];
    const premier = !reglage.dernierCoord;
    if (l.length) { reglage.dernierCoord = Math.max(reglage.dernierCoord || 0, ...l.map(m => +m.id || 0)); await garder(); }
    if (premier || !l.length) return [];
    const L = await permission();
    vibrer('notification');   // le motif « notification » (inventable, ⚙ › Haptique)
    const montrer = l.length > 3 ? [...l.slice(-2), null] : l;
    await L.schedule({ notifications: montrer.map((m, i) => m ? {
      id: 700000 + (m.id % 100000), title: '📡 ' + String(m.agent || 'coord') + (m.topic ? ' · #' + m.topic : ''), body: String(m.content || '').slice(0, 220), extra: { ouvrir: 'coord' },
    } : { id: 699999, title: '📡 coord', body: (l.length - 2) + ' autres messages', extra: { ouvrir: 'coord' } }) });
    return l;
  }
  function arreter() { if (minuterie) { W.clearInterval(minuterie); minuterie = null; } }
  function demarrer() { arreter(); if (!reglage.coord) return; verifierCoord().catch(() => {}); minuterie = W.setInterval(() => verifierCoord().catch(() => {}), 60000); }
  return {
    pret, reglage: () => ({ ...reglage }), verifierCoord, demarrer, arreter,
    async tester() {
      if (!natif()) throw new Error('seulement sur l\'iPhone');
      const L = await permission();
      await L.schedule({ notifications: [{ id: 4243, title: '◇ ploxi0n', body: 'Une notification de test : verrouille ton téléphone, elle arrive dans 5 secondes.', schedule: { at: new Date(Date.now() + 5000) }, extra: { ouvrir: 'reglages-app' } }] });
    },
    async coord(actif) {
      reglage.coord = !!actif; if (!actif) reglage.dernierCoord = 0;
      await garder();
      if (actif) { if (natif()) await permission(); demarrer(); } else arreter();
    },
  };
}
