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
  let reglage = { coord: false, dernierCoord: 0, proche: true }, minuterie = null, ecoute = false;   // (0.99.40) proche : les messages du maillage
  const pret = boxion.get('reglages', 'notifs').then(v => { if (v && typeof v === 'object') reglage = { ...reglage, ...v }; }).catch(() => {});
  const garder = () => boxion.put('reglages', 'notifs', reglage).catch(() => {});
  async function LN() { return surPromesse((await charger()).LocalNotifications); }
  // ↩ (0.99.45) répondre depuis la notification : un privé de Proche porte « Répondre » (on tape la réponse sur l'écran verrouillé, elle part
  // par le maillage sans ouvrir l'app) et « Lu ». reponse(salon, texte) et lu(salon) : branchés par main.js sur Proche.
  let reponse = null, lu = null, typesPoses = false;
  function ecouter(L) {
    if (ecoute) return; ecoute = true;
    L.addListener('localNotificationActionPerformed', (e) => {
      const x = (e && e.notification && e.notification.extra) || {}, a = e && e.actionId;
      if (a === 'repondre') { const t = String((e && e.inputValue) || '').trim(); if (t && reponse && x.params && x.params.salon) { try { reponse(x.params.salon, t.slice(0, 1000)); } catch (er) { /* */ } } return; }
      if (a === 'lu') { if (lu && x.params && x.params.salon) { try { lu(x.params.salon); } catch (er) { /* */ } } return; }
      if (x.ouvrir) ouvrir(x.ouvrir, x.params || null);
    }).catch(() => {});
  }
  async function poserTypes(L) {
    if (typesPoses) return; typesPoses = true;
    try { await L.registerActionTypes({ types: [{ id: 'proche-prive', actions: [{ id: 'repondre', title: '↩ Répondre', input: true, inputButtonTitle: 'Envoyer', inputPlaceholder: 'ta réponse, par le maillage' }, { id: 'lu', title: '✓ Lu' }] }] }); } catch (e) { typesPoses = false; }
  }
  async function permission() {
    const L = await LN(); const p = await L.requestPermissions();
    if (p.display !== 'granted') throw new Error('notifications refusées : Réglages iOS › ploxi0n › Notifications');
    ecouter(L);
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
    brancherReponse: (f, g) => { reponse = f; lu = g || null; },
    async tester() {
      if (!natif()) throw new Error('seulement sur l\'iPhone');
      const L = await permission();
      await L.schedule({ notifications: [{ id: 4243, title: '◇ ploxi0n', body: 'Une notification de test : verrouille ton téléphone, elle arrive dans 5 secondes.', schedule: { at: new Date(Date.now() + 5000) }, extra: { ouvrir: 'reglages-app' } }] });
    },
    /** ◉ (0.99.40) un message du maillage (Proche), app en arrière-plan ou Proche fermé : jamais de fenêtre de permission ici (on peut être
     *  en arrière-plan) ; seulement si les notifications sont déjà permises (la notification de test, coord, ou le push l'ont demandé) */
    async proche({ titre, texte, salon, cle, genre = 'message' }) {
      if (!natif() || reglage.proche === false) return false;
      const L = await LN(); const p = await L.checkPermissions().catch(() => null); if (!p || p.display !== 'granted') return false;
      ecouter(L);
      let h = 0; for (const c of String(cle || salon || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      const prive = String(salon || '')[0] === '@' && genre !== 'evenement'; if (prive) await poserTypes(L);
      await L.schedule({ notifications: [{ id: 710000 + (h % 80000), title: String(titre || '◉ proche').slice(0, 80), body: String(texte || '').slice(0, 220), threadIdentifier: 'proche:' + String(salon || ''), ...(prive ? { actionTypeId: 'proche-prive' } : {}), extra: { ouvrir: 'proche', params: { salon: String(salon || '') } } }] });
      vibrer('notification'); return true;
    },
    async regler(o) { reglage = { ...reglage, ...o }; await garder(); return { ...reglage }; },
    async coord(actif) {
      reglage.coord = !!actif; if (!actif) reglage.dernierCoord = 0;
      await garder();
      if (actif) { if (natif()) await permission(); demarrer(); } else arreter();
    },
  };
}
