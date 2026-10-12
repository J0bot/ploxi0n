// LE PIÈGE DU PROXY DE CAPACITOR (0.47). Sur l'iPhone, un plugin natif est un Proxy : toute propriété devient une méthode native, même
// « then » → un plugin rendu par une fonction async fait échouer `await` (« "X.then()" is not implemented on ios »). Le navigateur et jsdom
// ne le voient jamais (la version web est un objet ordinaire) : ici, chaque module natif reçoit un plugin qui se comporte comme sur l'iPhone.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { surPromesse } from '../src/natif/plugin-sur.js';
import { creerRaccourcis } from '../src/natif/raccourcis.js';
import { creerVerrou } from '../src/natif/verrou.js';
import { creerNotifs } from '../src/natif/notifs.js';
import { creerSante } from '../src/natif/sante.js';

/** un plugin « comme sur l'iPhone » : les méthodes connues répondent, toute autre (dont then) lève UNIMPLEMENTED quand on l'appelle */
function pluginIos(nom, methodes) {
  return new Proxy({}, { get: (_, k) => {
    if (typeof k === 'symbol') return undefined;
    if (k in methodes) return methodes[k];
    return () => { throw Object.assign(new Error(`"${nom}.${k}()" is not implemented on ios`), { code: 'UNIMPLEMENTED' }); };
  } });
}
const W = { Capacitor: { isNativePlatform: () => true }, document: { createElement: () => ({ style: {} }) }, setInterval, clearInterval };

test('le piège existe : un plugin rendu par une fonction async échoue (la raison du correctif)', async () => {
  const P = pluginIos('Preferences', { get: async () => ({ value: null }) });
  await assert.rejects((async () => P)(), /then\(\)" is not implemented on ios/);
  const sur = await (async () => surPromesse(P))();
  assert.deepEqual(await sur.get({ key: 'x' }), { value: null });
});

test('Raccourcis / Siri / widgets : recevoir, publier, épinglés, valeurs passent par Preferences sur l\'iPhone', async () => {
  const store = new Map([['ploxi0n.ouvrir', 'horloge'], ['ploxi0n.tsoins-en-attente', JSON.stringify([{ k: 'eau', d: 'un verre' }])]]);
  const Preferences = pluginIos('Preferences', {
    get: async ({ key }) => ({ value: store.has(key) ? store.get(key) : null }),
    set: async ({ key, value }) => { store.set(key, value); },
    remove: async ({ key }) => { store.delete(key); },
  });
  const ouverts = [];
  const boxion = creerMemoire();
  const routeur = { connait: (id) => id === 'horloge', ouvrir: async (id) => { ouverts.push(id); return true; } };
  const r = creerRaccourcis({ W, routeur, boxion, charger: async () => ({ Preferences }) });
  await r.recevoir();
  assert.deepEqual(ouverts, ['horloge'], '« Ouvrir un ploxion » depuis Raccourcis');
  assert.equal(store.has('ploxi0n.ouvrir'), false);
  const tsoins = await boxion.lire('tsoins');
  assert.ok(tsoins.some(e => (e.entry || e).k === 'eau'), 'le tsoin noté par Raccourcis est versé');
  await r.publier([{ id: 'horloge', nom: 'Horloge', icone: '⏰' }]);
  assert.match(store.get('ploxi0n.ploxions'), /horloge/);
  await r.epingles([{ id: 'horloge', nom: 'Horloge', icone: '⏰' }]);
  assert.match(store.get('ploxi0n.epingles'), /horloge/);
  await r.valeur('pas', 'Pas', 1234);
  assert.match(store.get('ploxi0n.valeurs'), /1234/);
});

test('Face ID : dispo et ouvrir passent par NativeBiometric sur l\'iPhone', async () => {
  const NativeBiometric = pluginIos('NativeBiometric', {
    isAvailable: async () => ({ isAvailable: true, biometryType: 2 }),
    verifyIdentity: async () => {},
  });
  const v = creerVerrou({ W, charger: async () => ({ NativeBiometric }) });
  assert.deepEqual(await v.dispo(), { ok: true, type: 'faceid', erreur: null });
  assert.equal(await v.ouvrir('test'), true);
  assert.equal(v.derniereErreur(), null);
});

test('Notifications : « tester une notification » passe par LocalNotifications sur l\'iPhone', async () => {
  const prevues = [];
  const LocalNotifications = pluginIos('LocalNotifications', {
    requestPermissions: async () => ({ display: 'granted' }),
    addListener: async () => ({ remove: async () => {} }),
    schedule: async ({ notifications }) => { prevues.push(...notifications); return { notifications }; },
  });
  const n = creerNotifs({ W, boxion: creerMemoire(), envoyer: async () => ({ status: 200, texte: '{}' }), charger: async () => ({ LocalNotifications }) });
  await n.pret;
  await n.tester();
  assert.equal(prevues.length, 1);
});

test('Santé : dispo passe par Health sur l\'iPhone', async () => {
  const Health = pluginIos('Health', { isAvailable: async () => ({ available: true }) });
  const s = creerSante({ W, boxion: creerMemoire(), plugin: Health });
  assert.deepEqual(await s.api.dispo(), { ok: true });
});
