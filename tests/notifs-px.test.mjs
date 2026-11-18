// 🔔 (0.99.64) le ploxion Notifs : le journal, les mots à voir ou à cacher, les push relevées, un nouveau build
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerNotifsPx, passe, jourDe } from '../src/lot/notifs-px.js';
import { creerNotifs } from '../src/natif/notifs.js';
import { creerPush, SUJETS } from '../src/natif/push.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { page } from './aide.mjs';

test('🔔 les mots : cacher l\'emporte, voir restreint ; sans casse ni accents', () => {
  const n = { titre: '📡 rs-1', texte: 'Build TERMINÉ pour ploxi0n' };
  assert.equal(passe(n, {}), true);
  assert.equal(passe(n, { cacher: ['termine'] }), false, 'accents et casse ignorés');
  assert.equal(passe(n, { voir: ['ploxi0n'] }), true); assert.equal(passe(n, { voir: ['mappion'] }), false);
  assert.equal(passe(n, { voir: ['ploxi0n'], cacher: ['build'] }), false);
  const T = new Date(2026, 10, 14, 12).getTime();
  assert.equal(jourDe(T - 3600e3, T), 'aujourd\'hui'); assert.equal(jourDe(T - 24 * 3600e3, T), 'hier');
});

test('🔔 le journal : une entrée par notification (cle : pas de doublon), gardé ; une notif de coord au mot caché n\'est pas posée', async () => {
  const boxion = creerMemoire(), W = { Capacitor: { isNativePlatform: () => true }, setInterval: () => 1, clearInterval() {} }, planifiees = [];
  const J = creerNotifsPx({ W: null, boxion });
  assert.ok(await J.noter({ titre: 'a', cle: 'x' })); assert.equal(await J.noter({ titre: 'a', cle: 'x' }), null);
  await J.reglerMots({ cacher: ['spam'] });
  let msgs = [{ id: 1, agent: 'rs-1', content: 'vieux' }];
  const LocalNotifications = { requestPermissions: async () => ({ display: 'granted' }), schedule: async ({ notifications }) => { planifiees.push(...notifications); }, addListener: async () => {} };
  const n = creerNotifs({ W, boxion, journal: J, charger: async () => ({ LocalNotifications }), envoyer: async (q) => { const since = +new URL(q.url).searchParams.get('since'); return { status: 200, texte: JSON.stringify({ messages: msgs.filter(m => m.id > since) }) }; } });
  await n.pret; await n.coord(true); await n.verifierCoord();
  msgs.push({ id: 2, agent: 'rs-1', content: 'du spam' }, { id: 3, agent: 'rs-3', content: 'le build est prêt' });
  await n.verifierCoord();
  assert.deepEqual(planifiees.map(x => x.body), ['le build est prêt'], 'le spam n\'est pas posé');
  assert.deepEqual(J.liste().filter(x => x.sujet === 'coord').map(x => x.texte), ['le build est prêt'], 'le journal ne le montre pas non plus');
  await J.reglerMots({ cacher: [] }); assert.equal(J.liste().length, 3, 'les mots retirés : il revient (le journal garde tout)');
  const garde = await boxion.get('notifs', 'journal'); assert.equal(garde.length, 3); assert.equal(garde[1].ouvrir, 'coord');
});

test('🔔 le push : les reçues et les livrées pendant le sommeil vont au journal, une fois ; les mots partent au labo ; le sujet build', async () => {
  assert.equal(SUJETS[0][0], 'build');
  const boxion = creerMemoire(), J = creerNotifsPx({ W: null, boxion }), envois = [], ecoutes = {};
  await J.reglerMots({ voir: ['ploxi0n'] });
  const P = { requestPermissions: async () => ({ receive: 'granted' }), register: async () => { ecoutes.registration({ value: 'jeton-apns' }); }, addListener: async (ev, f) => { ecoutes[ev] = f; },
    getDeliveredNotifications: async () => ({ notifications: [{ id: 'n1', title: '◇ ploxi0n 0.99.64', body: 'nouveau build', data: { sujet: 'build' } }] }) };
  const push = creerPush({ boxion, journal: J, natif: () => true, connecte: () => true, charger: async () => ({ PushNotifications: P }), envoyer: async (q) => { envois.push(JSON.parse(q.corps || 'null')); return { status: 201 }; } });
  await push.activer(); await new Promise(r => setTimeout(r, 10));
  assert.deepEqual(envois[0].mots, { voir: ['ploxi0n'], cacher: [] }, 'les mots partent avec le jeton');
  assert.equal(await push.releverLivrees(), 1); await push.releverLivrees(); await new Promise(r => setTimeout(r, 10));
  assert.equal(J.liste().length, 1, 'une seule fois'); assert.equal(J.liste()[0].sujet, 'build');
  ecoutes.pushNotificationReceived({ id: 'n2', title: 'coord', body: 'rien à voir' }); await new Promise(r => setTimeout(r, 10));
  assert.equal(J.liste().length, 1, 'reçue mais cachée par « voir seulement ploxi0n »');
});

test('🔔 la page : les mots s\'ajoutent et s\'ôtent, toucher une notif l\'ouvre et la marque lue', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, h = D.createElement('div'); D.body.appendChild(h); const ouverts = [];
    const J = creerNotifsPx({ W, boxion: creerMemoire(), ouvrir: (id) => ouverts.push(id) });
    await J.noter({ titre: 'coord · rs-1', texte: 'salut', sujet: 'coord', ouvrir: 'coord' });
    J.mount(h); await J.pret; await new Promise(r => setTimeout(r, 10));
    assert.equal(h.querySelectorAll('.px-nt-n.neuve').length, 1);
    h.querySelector('[data-nt-id]').click(); assert.deepEqual(ouverts, ['coord']); assert.equal(h.querySelectorAll('.px-nt-n.neuve').length, 0);
    const i = h.querySelector('[data-nt-in="cacher"]'); i.value = 'Salut'; i.dispatchEvent(new W.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await new Promise(r => setTimeout(r, 10));
    assert.deepEqual(J.mots().cacher, ['salut']); assert.equal(h.querySelectorAll('.px-nt-n').length, 0);
    h.querySelector('[data-nt-ote="cacher"]').click(); await new Promise(r => setTimeout(r, 10)); assert.equal(h.querySelectorAll('.px-nt-n').length, 1);
  } finally { p.fin(); }
});
