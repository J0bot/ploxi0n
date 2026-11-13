// ᛒ ◷ (0.99.20) les ondes (Bluetooth bas niveau) et la veille (position en arrière-plan) : les bions, avec un faux plugin
import test from 'node:test';
import assert from 'node:assert/strict';
import { creerOndes, fabricant, distance, SERVICE_XB } from '../src/natif/ondes-natif.js';
import { creerVeille } from '../src/natif/veille-natif.js';

function fauxPlugin(rep = {}) {
  const ecoutes = {}; const appels = [];
  const p = { addListener: (ev, f) => { ecoutes[ev] = f; return { remove() {} }; }, appels, ecoutes };
  for (const m of ['scanner', 'arreterScan', 'annoncer', 'arreterAnnonce', 'demarrer', 'arreter', 'etat', 'lire', 'vider']) p[m] = async (o) => { appels.push([m, o]); return rep[m] || {}; };
  return p;
}

test('le fabricant : petit-boutiste (Apple = 4c00, Espressif = e502)', () => {
  assert.equal(fabricant('4c000215'), 'Apple');
  assert.equal(fabricant('e502aa'), 'Espressif (ESP32)');
  assert.equal(fabricant('ffff'), '0xffff');
  assert.equal(fabricant(''), '');
});

test('la distance : -59 dBm à 1 m, plus faible = plus loin', () => {
  assert.equal(distance(-59), 1);
  assert.ok(distance(-81) > 8 && distance(-81) < 12);
  assert.equal(distance(-60, -60), 1);
});

test('ondes : lissage, tri du plus proche, les ploxis reconnus, l\'oubli après 30 s', async () => {
  let t = 1000; const p = fauxPlugin(); const O = creerOndes({ plugin: p, maintenant: () => t });
  const vus = []; O.sur(v => vus.push(v.id));
  await O.scanner(); assert.deepEqual(p.appels[0], ['scanner', { doublons: true }]);
  p.ecoutes.appareil({ id: 'a', nom: 'montre', rssi: -70, fabricant: '4c00' });
  p.ecoutes.appareil({ id: 'b', nom: 'ploxi de RS-3', rssi: -50, services: [SERVICE_XB.toLowerCase()] });
  p.ecoutes.appareil({ id: 'a', rssi: -60 });
  const l = O.appareils();
  assert.equal(l[0].id, 'b'); assert.equal(l[0].ploxi, true); assert.equal(l[1].fabricant, 'Apple');
  assert.equal(l[1].rssi, -66, 'lissé (0,6 / 0,4)'); assert.equal(l[1].nom, 'montre', 'le nom reste');
  t += 31000; assert.equal(O.appareils().length, 0);
  assert.equal(vus.length, 3);
});

test('veille : demarrer fine par défaut, lire depuis, null hors iPhone', async () => {
  assert.equal(creerVeille({}), null); assert.equal(creerOndes({}), null);
  const p = fauxPlugin({ lire: { points: [{ t: 5, la: 46.7, lo: 6.6, acc: 5 }], visites: [{ a: 1, d: 9, la: 46.7, lo: 6.6 }] } });
  const V = creerVeille({ plugin: p });
  await V.demarrer(); assert.deepEqual(p.appels[0], ['demarrer', { fine: true }]);
  await V.demarrer({ fine: false }); assert.deepEqual(p.appels[1], ['demarrer', { fine: false }]);
  const r = await V.lire(3); assert.deepEqual(p.appels[2], ['lire', { depuis: 3 }]); assert.equal(r.points.length, 1); assert.equal(r.visites[0].d, 9);
});
