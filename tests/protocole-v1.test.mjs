// 🌐 (0.99.42) le protocole public MAILLE v1 (docs/protocole/MAILLE-v1.md) : les vecteurs de test (docs/protocole/vecteurs-v1.json) ;
// 1) l'implémentation de référence les produit toujours à l'identique ; 2) un implémenteur qui ne lit QUE la spec (WebCrypto seul, ici)
// déchiffre chaque paquet ; 3) le vrai maillage les lit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { genererVecteurs, HORLOGE } from '../tools/protocole/vecteurs.mjs';
import { creerMaille, lireMaille } from '../src/bions/maille.js';
import { creerRecolleur } from '../src/bions/fragments.js';

const V = JSON.parse(readFileSync(new URL('../docs/protocole/vecteurs-v1.json', import.meta.url), 'utf8'));
const s = globalThis.crypto.subtle, enc = new TextEncoder(), dec = new TextDecoder();
const hex = (u8) => [...new Uint8Array(u8)].map(x => x.toString(16).padStart(2, '0')).join('');
const deHex = (h) => new Uint8Array(h.match(/../g).map(x => parseInt(x, 16)));
const b64 = (t) => new Uint8Array(Buffer.from(t, 'base64'));
const EC = { name: 'ECDH', namedCurve: 'P-256' };

test('🌐 l\'implémentation de référence produit toujours exactement les vecteurs publiés', async () => {
  assert.deepEqual(await genererVecteurs(), V);
});

test('🌐 d\'après la spec seule : l\'identité, l\'empreinte, l\'annonce', async () => {
  for (const id of V.identites) {
    const pub = new Uint8Array(await s.exportKey('raw', await s.importKey('jwk', { kty: 'EC', crv: 'P-256', x: id.jwk.x, y: id.jwk.y, ext: true }, EC, true, [])));
    assert.equal(pub.length, 65); assert.equal(pub[0], 4); assert.equal(hex(pub), id.cle_publique_hex);
    assert.equal(hex(new Uint8Array(await s.digest('SHA-256', pub)).slice(0, 8)), id.empreinte, 'empreinte = SHA-256(clé brute)[0..8]');
  }
  const ann = JSON.parse(V.paquets.ann_alice);
  assert.equal(ann.m, 1); assert.equal(ann.k, 'ann'); assert.equal(ann.o, V.identites[0].empreinte); assert.equal(ann.h, 255);
  assert.equal(hex(b64(ann.d.cle)), V.identites[0].cle_publique_hex);
  assert.equal(ann.d.r, 'noeud'); assert.equal(ann.d.p, 1); assert.ok(ann.d.cap.includes('relais'));
});

async function cleAES(brut) { return s.importKey('raw', brut, 'AES-GCM', false, ['decrypt']); }
async function ouvrir(cle, p) {
  const aad = enc.encode(p.o + '>' + (p.a || p.s || '') + ':' + p.i);
  const clair = new Uint8Array(await s.decrypt({ name: 'AES-GCM', iv: b64(p.d.v), additionalData: aad }, cle, b64(p.d.c)));
  assert.ok([256, 512, 1024, 2048, 4096, 8192].includes(clair.length), 'rembourré à un palier');
  const n = new DataView(clair.buffer).getUint32(0); return JSON.parse(dec.decode(clair.slice(4, 4 + n)));
}

test('🌐 d\'après la spec seule : ECDH → HKDF → AES-GCM (le privé, la position), PBKDF2 (le salon fermé), le rembourrage', async () => {
  const [A, B] = V.identites;
  const privA = await s.importKey('jwk', { ...A.jwk, ext: true }, EC, false, ['deriveBits']);
  const secret = new Uint8Array(await s.deriveBits({ name: 'ECDH', public: await s.importKey('raw', deHex(B.cle_publique_hex), EC, false, []) }, privA, 256));
  assert.equal(hex(secret), V.derivation.secret_ecdh_hex);
  const hk = await s.importKey('raw', secret, 'HKDF', false, ['deriveBits']);
  const cle = new Uint8Array(await s.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: enc.encode('ploxi-maille-v1'), info: enc.encode([A.empreinte, B.empreinte].sort().join('|')) }, hk, 256));
  assert.equal(hex(cle), V.derivation.cle_aes_alice_bob_hex);
  const mp = JSON.parse(V.paquets.mp_alice_bob); assert.equal(mp.a, B.empreinte); assert.equal(mp.c, 8);
  assert.deepEqual(await ouvrir(await cleAES(cle), mp), V.clairs.mp_alice_bob);
  const pos = await ouvrir(await cleAES(cle), JSON.parse(V.paquets.pos_alice_bob));
  for (const k of Object.keys(V.clairs.pos_alice_bob)) assert.deepEqual(pos[k], V.clairs.pos_alice_bob[k]);
  const ack = JSON.parse(V.paquets.ack_bob); assert.equal(ack.d.r, mp.i, 'l\'accusé cite l\'id du message');
  const mdp = await s.importKey('raw', enc.encode('lac'), 'PBKDF2', false, ['deriveBits']);
  const cs = new Uint8Array(await s.deriveBits({ name: 'PBKDF2', salt: enc.encode('ploxi-salon:#soiree'), iterations: 100000, hash: 'SHA-256' }, mdp, 256));
  assert.equal(hex(cs), V.derivation.cle_salon_hex);
  assert.deepEqual(await ouvrir(await cleAES(cs), JSON.parse(V.paquets.pub_salon_ferme)), V.clairs.pub_salon_ferme);
  assert.equal(V.rembourrage.rembourre_prefixe_hex.slice(0, 8), '00000005', 'la longueur sur 4 octets, gros-boutiste');
});

test('🌐 d\'après la spec seule : les morceaux BLE se recollent en le paquet', () => {
  const m = V.morceaux_ble.hex.map(deHex);
  assert.equal(m[0][0], 0xB1); assert.equal(hex(m[0].slice(1, 5)), V.morceaux_ble.id); assert.equal(m[0][5], 0); assert.equal(m[0][6], m.length);
  assert.ok(m.every(x => x.length <= 180));
  const r = creerRecolleur(); let t = null; for (const x of m) t = r.ajouter('voisin', x) || t;
  assert.equal(t, V.paquets.pub_clair);
});

test('🌐 le vrai maillage (Bob) lit tous les paquets publiés', async () => {
  const mag = { lire: async (k) => (k === 'maille-identite' ? { ...V.identites[1].jwk } : null), ecrire: async () => {} };
  const bob = creerMaille({ subtle: s, alea: (n) => globalThis.crypto.getRandomValues(new Uint8Array(n)), maintenant: () => HORLOGE, magasin: mag, envoyer: () => {}, attente: (ms, f) => setTimeout(f, 0), repeter: () => () => {} });
  await bob.demarrer({ nom: 'Bob' }); await bob.rejoindre('#soiree', 'lac'); bob.voisin('Alice', 'connecte');
  for (const k of ['ann_alice', 'pub_clair', 'pub_salon_ferme', 'mp_alice_bob', 'pos_alice_bob']) { assert.ok(lireMaille(V.paquets[k]), k); bob.recevoir('Alice', V.paquets[k]); await new Promise(r => setTimeout(r, 20)); }
  assert.equal(bob.fil('#').at(-1).texte, 'bonjour le maillage');
  assert.equal(bob.fil('#soiree').at(-1).texte, 'dans le salon fermé');
  assert.equal(bob.fil('@' + V.identites[0].empreinte).at(-1).texte, 'message privé pour Bob');
  assert.equal(bob.positions()[0].lat, 46.52);
});
