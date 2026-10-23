// ⇄ (0.98) les entrées et les sorties : lues dans le code, les ports du core (le labo), les synapses ; le réseau des hubs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lireCode, fluxDe, synapsesEntre, court } from '../src/bions/flux.js';
import { CORES } from '../src/app/registre-labo.js';
import { placerReseau } from '../src/app/map-hubs.js';

test('⇄ le code lu sans l\'exécuter : bus, boxion, réseau, natif, tsoin', () => {
  const js = "jOSPorts.emit('notes','change',x); jOSPorts.on('ploxion.map.*', f); jOSBoxion.save('notes','k',d); jOSBoxion.load('agenda','k'); fetch('https://api.exemple.ch/x'); jOSNatif.haptique('x'); jOSNatif.position(); jOSTsoin.mark('a')";
  const l = lireCode(js);
  assert.deepEqual(l.sorties.sort(), ['boxion:notes', 'bus:ploxion.notes.change', 'natif:haptique', 'tsoin:journal']);
  assert.deepEqual(l.entrees.sort(), ['boxion:agenda', 'bus:ploxion.map.*', 'natif:position', 'reseau:api.exemple.ch']);
  assert.equal(court('bus:compteur.inc'), '⇄ compteur.inc');
});
test('⇄ les ports du core (le labo) d\'abord ; les synapses : ce que A écrit, B le lit', () => {
  assert.ok(CORES.compteur && CORES.compteur.in.length);
  const c = fluxDe({ id: 'compteur', code: '', cores: CORES });
  assert.ok(c.entrees.some(e => e.canal === 'bus:compteur.inc' && e.sur === 'core'));
  const a = fluxDe({ id: 'notes', code: "jOSPorts.emit('notes','change'); jOSBoxion.save('notes','k')" }), b = fluxDe({ id: 'map', code: "jOSPorts.on('ploxion.notes.*'); jOSBoxion.load('notes','k')" });
  const s = synapsesEntre(a, b);
  assert.ok(s.some(x => x.canal === 'bus:ploxion.notes.change'), 'le bus, avec un joker'); assert.ok(s.some(x => x.canal === 'boxion:notes'), 'le même rangement');
  assert.equal(synapsesEntre(b, a).length, 0, 'une synapse a un sens');
});
test('▦ le réseau : chaque hub à sa case, portail par portail', () => {
  const H = (id, p) => [id, { id, template: 'hub', portals: p }];
  const hubs = new Map([H('C', ['D', '', 'H', '']), H('D', ['', 'C', '', '']), H('H', ['', '', '', 'C'])]);
  const pos = placerReseau(hubs, 'C');
  assert.deepEqual(pos.get('C'), [0, 0]); assert.deepEqual(pos.get('D'), [1, 0]); assert.deepEqual(pos.get('H'), [0, -1]);
});
