// ⧉ (0.99.24) le Bluetooth basse consommation : un paquet du maillage coupé en morceaux de 180 octets, recollé dans n'importe quel ordre
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decouper, creerRecolleur, MORCEAU, ENTETE } from '../src/bions/fragments.js';
test('⧉ couper, recoller (dans le désordre, avec des doublons), oublier l\'incomplet, refuser le suspect', () => {
  const texte = JSON.stringify({ m: 1, d: 'é🦀'.repeat(900) }), m = decouper(texte, 0xdeadbeef);
  assert.ok(m.length > 10 && m.every(x => x.length <= MORCEAU));
  const r = creerRecolleur(), melange = [...m].reverse(); melange.splice(3, 0, m[2]);   // un doublon au milieu
  let fin = null; for (const x of melange) { const t = r.ajouter('tom', x); if (t) fin = t; }
  assert.equal(fin, texte, 'le même texte, octet pour octet (UTF-8 coupé au milieu d\'un caractère compris)');
  assert.equal(r.enCours(), 0);
  assert.equal(r.ajouter('a', decouper('court', 1)[0]), 'court', 'un seul morceau : tout de suite');
  // deux voisins qui envoient le même id ne se mélangent pas
  const a = decouper('A'.repeat(500), 7), b = decouper('B'.repeat(500), 7); let ra = null, rb = null;
  for (let i = 0; i < a.length; i++) { ra = r.ajouter('x', a[i]) || ra; rb = r.ajouter('y', b[i]) || rb; }
  assert.equal(ra, 'A'.repeat(500)); assert.equal(rb, 'B'.repeat(500));
  // l'incomplet est oublié au bout de 30 s
  let t = 0; const r2 = creerRecolleur({ maintenant: () => t }); r2.ajouter('z', decouper('C'.repeat(500), 9)[0]); t = 31000; r2.ajouter('z', decouper('D'.repeat(500), 10)[0]);
  assert.equal(r2.enCours(), 1);
  // le suspect
  assert.equal(r.ajouter('q', new Uint8Array([1, 2, 3])), null); assert.equal(r.ajouter('q', new Uint8Array(ENTETE)), null);
  const faux = decouper('x'.repeat(400), 3)[0]; faux[6] = 250; assert.equal(r.ajouter('q', faux), null, 'plus de 100 morceaux annoncés');
  assert.throws(() => decouper('x'.repeat(30000), 1), /trop gros/);
});

import { creerTuyauProche, estBle } from '../src/natif/proche-natif.js';
// un faux plugin : addListener, et des méthodes qui rendent des promesses (comme Capacitor)
function fauxPlugin(impl = {}) { const l = new Map(); return { _l: l, _emettre: (n, d) => (l.get(n) || []).forEach(f => f(d)), addListener(n, f) { if (!l.has(n)) l.set(n, []); l.get(n).push(f); return Promise.resolve({ remove() {} }); }, ...impl }; }
test('〰 le tuyau mixte : Multipeer + BLE ; un paquet de 3 Ko traverse le BLE en morceaux ; sans BLE compilé, rien ne change', async () => {
  const mp = () => fauxPlugin({ demarrer: async (o) => ({ moi: o.nom }), arreter: async () => {}, envoyer: async () => ({ envoyes: 0 }), pairs: async () => ({ pairs: [] }) });
  const bleA = fauxPlugin({ demarrer: async () => ({ morceau: 180 }), arreter: async () => {} }), bleB = fauxPlugin({ demarrer: async () => ({ morceau: 180 }), arreter: async () => {} });
  const morceaux = [];
  bleA.envoyer = async (o) => { morceaux.push(o.donnees.length); setTimeout(() => bleB._emettre('message', { de: 'p:A', donnees: o.donnees }), 1); return { envoyes: 1 }; };
  bleB.envoyer = async (o) => { setTimeout(() => bleA._emettre('message', { de: 'c:B', donnees: o.donnees }), 1); return { envoyes: 1 }; };
  const A = creerTuyauProche({ W: {}, plugin: mp(), ble: bleA }), B = creerTuyauProche({ W: {}, plugin: mp(), ble: bleB });
  const recusB = []; B.surMessage(m => recusB.push(m));
  await A.demarrer({ nom: 'A' }); await B.demarrer({ nom: 'B' }); await new Promise(r => setTimeout(r, 5));
  assert.equal(A.ble(), true);
  bleA._emettre('pair', { id: 'c:B', etat: 'connecte' }); bleB._emettre('pair', { id: 'p:A', etat: 'connecte' });
  assert.deepEqual(await A.pairs(), ['c:B']); assert.ok(estBle('c:B') && !estBle('Tom·a1'));
  const gros = JSON.stringify({ m: 1, d: 'x'.repeat(3000) });
  await A.envoyer(gros); await new Promise(r => setTimeout(r, 40));
  assert.equal(recusB.at(-1).donnees, gros); assert.equal(recusB.at(-1).de, 'p:A');
  assert.ok(morceaux.length >= 17, morceaux.length + ' morceaux');
  // sans BLE compilé : demarrer refuse ; tout passe par Multipeer, sans erreur
  const sans = fauxPlugin({ demarrer: async () => { throw new Error('"PloxiBLE" plugin is not implemented on ios'); } });
  let mpEnvois = 0; const mp2 = mp(); mp2.envoyer = async () => { mpEnvois++; return { envoyes: 1 }; };
  const C = creerTuyauProche({ W: {}, plugin: mp2, ble: sans }); await C.demarrer({ nom: 'C' }); await new Promise(r => setTimeout(r, 5));
  assert.equal(C.ble(), false); assert.equal((await C.envoyer('salut')).envoyes, 1); assert.equal(mpEnvois, 1);
});
