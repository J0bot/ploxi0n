// ❤ SANTÉ CONNECTÉ (0.47) : rien ne part sans l'interrupteur ; activé et connecté, un RÉSUMÉ (jamais les mesures brutes) va sur le boxion.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { creerSante } from '../src/natif/sante.js';

const W = { Capacitor: { isNativePlatform: () => true }, document: { getElementById: () => null, body: {} } };
const maintenant = new Date();
const Health = {
  isAvailable: async () => ({ available: true }),
  requestAuthorization: async () => ({ readAuthorized: ['steps'], readDenied: [] }),
  readSamples: async ({ dataType }) => ({ samples: dataType === 'steps' ? [{ value: 4200, startDate: maintenant.toISOString(), endDate: maintenant.toISOString(), sourceName: 'iPhone' }]
    : dataType === 'sleep' ? [{ sleepState: 'deep', startDate: new Date(maintenant - 3 * 3600e3).toISOString(), endDate: new Date(maintenant - 3600e3).toISOString(), sourceName: 'Apple Watch' }] : [] }),
  queryAggregated: async () => ({ samples: [] }),
  queryWorkouts: async () => ({ workouts: [{ workoutType: 'running', startDate: maintenant.toISOString(), duration: 1800, totalDistance: 5200, totalEnergyBurned: 310, sourceName: 'Apple Watch' }] }),
};
function boxionDistant() { const docs = new Map(); return { docs, set: async (ns, key, data) => { docs.set(ns + '/' + key, data); return { ok: true }; } }; }

test('éteint par défaut : rien ne part, même connecté', async () => {
  const jb = boxionDistant();
  const s = creerSante({ W, boxion: creerMemoire(), plugin: Health, distant: () => jb });
  await s.autoriser();
  assert.deepEqual(await s.synchroniser(), { ok: false, raison: 'partage éteint' });
  assert.equal(jb.docs.size, 0);
});

test('activé et connecté : le résumé (agrégats) et le jour partent sur le boxion ; pas connecté : rien', async () => {
  const jb = boxionDistant(); let co = false;
  const s = creerSante({ W, boxion: creerMemoire(), plugin: Health, distant: () => (co ? jb : null) });
  await s.autoriser();
  await s.partager(true);
  assert.equal(jb.docs.size, 0, 'pas connecté : rien');
  assert.equal((await s.synchroniser()).raison, 'pas connecté');
  co = true;
  const r = await s.synchroniser({ force: true });
  assert.equal(r.ok, true);
  const res = jb.docs.get('sante/resume');
  assert.equal(res.aujourdhui.steps, 4200);
  assert.equal(res.nuit.minutes, 120);
  assert.equal(res.entrainements[0].km, 5.2);
  assert.ok(!JSON.stringify(res).includes('startDate'), 'jamais les échantillons bruts');
  assert.ok([...jb.docs.keys()].some(k => /^sante\/jour-\d{4}-\d\d-\d\d$/.test(k)));
  assert.equal((await s.synchroniser()).recent, true, 'pas plus d\'une fois par 30 min sans « maintenant »');
  await s.partager(false);
  assert.equal((await s.synchroniser({ force: true })).raison, 'partage éteint');
});
