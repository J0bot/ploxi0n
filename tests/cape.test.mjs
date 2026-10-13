// 🥼 (0.50) labo-cape dans ploxi0n : la copie du moteur reproduit la trace du Rust (la règle de labo-cape), la sécurité tient,
// la simulation chauffe vers la consigne, le bus BLE se découpe en lignes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import E from '../src/cape/cape-engine.js';
import { creerSimulation, decouper, ligne } from '../src/cape/cape.js';

test('la copie de cape-engine reproduit la trace dorée de cape-core (tools/check-golden.js de labo-cape)', () => {
  const g = JSON.parse(readFileSync(new URL('./donnees/cape-golden.json', import.meta.url), 'utf8'));
  const s = g.scenario, n = new E.Node(s.node, 2.0), pi = new E.Pi();
  let k = 0, pire = 0, couleurs = 0;
  for (let i = 0; i < 3600; i++) {
    const [duty] = pi.step(E.adcToC(E.cToAdc(n.t)), s.setpoint, s.dt);
    n.step(duty * s.p_w, s.t_amb, s.wind, s.dt);
    if (i % 120 === 119) { const r = g.trace[k++]; pire = Math.max(pire, Math.abs(r.temp - n.t), Math.abs(r.duty - duty)); if (E.rgbFor(n.t, 0.25).some((c, j) => Math.abs(c - r.rgb[j]) > 1)) couleurs++; }
  }
  assert.ok(pire < 0.05, 'écart ' + pire); assert.equal(couleurs, 0);
});

test('sécurité : jamais plus de 42 °C demandés, coupure à 45 °C verrouillée jusqu\'à 40 °C', () => {
  const sim = creerSimulation();
  sim.commande('cmd.setpoint', { zone: '*', c: 60 });
  const pi = new E.Pi();
  assert.deepEqual(pi.step(45.2, 38, 0.5), [0, 'tripped']);
  assert.equal(pi.step(41, 38, 0.5)[1], 'tripped', 'toujours coupé au-dessus de 40');
  assert.notEqual(pi.step(39, 38, 0.5)[1], 'tripped', 'réarmé sous 40');
  for (let i = 0; i < 120; i++) sim.pas();   // 40 min simulées
  const temps = sim.pas().filter(([t]) => /^zone\.c[1-4]\.temp$/.test(t)).map(([, p]) => p.c);
  assert.ok(temps.every(t => t <= E.SETPOINT_MAX_C + 0.5), 'jamais au-delà de 42 : ' + temps);
});

test('la simulation chauffe vers la consigne et publie les topics du bus', () => {
  const sim = creerSimulation();
  const avant = sim.pas().find(([t]) => t === 'zone.c1.temp')[1].c;
  for (let i = 0; i < 60; i++) sim.pas();
  const m = sim.pas(), t1 = m.find(([t]) => t === 'zone.c1.temp')[1].c, pw = m.find(([t]) => t === 'power')[1];
  assert.ok(t1 > avant + 5, avant + ' → ' + t1);
  assert.ok(pw.w > 0 && pw.budget_w > 0 && pw.wh_used > 0);
  assert.ok(m.some(([t]) => t === 'zone.c5.temp'), 'les capteurs aussi');
  assert.deepEqual(sim.commande('cmd.enable', { zone: 'c3', on: false }), ['log', 'c3 éteint']);
});

test('le bus BLE : des lignes JSON, recollées depuis des fragments', () => {
  const flux = ligne('zone.c1.temp', { c: 37.9 }) + ligne('power', { w: 8.9 });
  const [l1, r1] = decouper(flux.slice(0, 20)); assert.deepEqual(l1, []);
  const [l2, r2] = decouper(r1 + flux.slice(20)); assert.equal(r2, '');
  assert.deepEqual(l2.map(x => JSON.parse(x)), [{ t: 'zone.c1.temp', p: { c: 37.9 } }, { t: 'power', p: { w: 8.9 } }]);
});
