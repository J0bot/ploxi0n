// 〰 (0.99.21, RS-7 : « ça doit être comme bitchat mesh ») le maillage : des téléphones EN LIGNE (chacun n'entend que ses voisins), les
// messages sautent de proche en proche, une seule fois chacun ; les messages privés chiffrés (un relais ne lit rien) ; stocker et relayer
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerMaille, creerVus, commande, remplir, vider, lireMaille, TTL_MAX, PUBLIC } from '../src/bions/maille.js';
import { attendre } from './aide.mjs';

const alea = (n) => globalThis.crypto.getRandomValues(new Uint8Array(n));

/** des téléphones et des liens : liens = [['A','B'], ['B','C']…] ; chacun n'entend que ceux auxquels il est lié */
function reseau(noms, liens, { magasins = {} } = {}) {
  const T = {}, recus = {}, cables = new Set(liens.map(([a, b]) => a + '|' + b).concat(liens.map(([a, b]) => b + '|' + a)));
  for (const n of noms) {
    recus[n] = 0;
    T[n] = creerMaille({ subtle: globalThis.crypto.subtle, alea, nom: n, attente: (ms, f) => setTimeout(f, 1), repeter: () => () => {}, magasin: magasins[n] || null,
      envoyer: (texte, vers) => { for (const v of vers || T[n].voisins()) if (cables.has(n + '|' + v)) setTimeout(() => { recus[v]++; T[v].recevoir(n, texte); }, 1); } });
  }
  return { T, recus, async lier(a, b) { cables.add(a + '|' + b); cables.add(b + '|' + a); T[a].voisin(b, 'connecte'); T[b].voisin(a, 'connecte'); },
    couper(a, b) { cables.delete(a + '|' + b); cables.delete(b + '|' + a); T[a].voisin(b, 'perdu'); T[b].voisin(a, 'perdu'); } };
}
async function allumer(R, liens) { for (const t of Object.values(R.T)) await t.demarrer(); for (const [a, b] of liens) await R.lier(a, b); await attendre(120); }

test('〰 les petits bouts : Bloom, rembourrage, commandes, paquets suspects', () => {
  const v = creerVus({ bits: 4096, tour: 50 });
  v.ajouter('a1'); assert.ok(v.a('a1')); assert.ok(!v.a('b2'));
  for (let i = 0; i < 60; i++) v.ajouter('x' + i);
  assert.ok(v.a('x59') && v.a('x20'), 'le filtre d\'avant reste interrogé un tour de plus');
  const r = remplir(new TextEncoder().encode('salut'), alea);
  assert.equal(r.length, 256, 'la taille ne trahit pas le message'); assert.equal(new TextDecoder().decode(vider(r)), 'salut');
  assert.equal(remplir(new Uint8Array(300)).length, 512); assert.equal(vider(new Uint8Array(2)), null);
  assert.deepEqual(commande('/j #Zurich secret'), { genre: 'rejoindre', salon: '#zurich', mdp: 'secret' });
  assert.deepEqual(commande('/join lac'), { genre: 'rejoindre', salon: '#lac', mdp: null });
  assert.deepEqual(commande('/m @Tom on se voit ?'), { genre: 'mp', a: 'Tom', texte: 'on se voit ?' });
  assert.equal(commande('/w').genre, 'qui'); assert.equal(commande('/bloquer @x').genre, 'bloquer'); assert.equal(commande('/clear').genre, 'effacer');
  assert.equal(commande('/j').genre, 'erreur'); assert.equal(commande('/nimporte').genre, 'erreur'); assert.deepEqual(commande('  coucou '), { genre: 'texte', texte: 'coucou' });
  const bon = { m: 1, i: '0123456789abcdef', o: 'fedcba9876543210', n: 'A', h: 7, t: 1, k: 'pub', s: '#', d: { x: 'y' } };
  assert.equal(lireMaille(JSON.stringify(bon)).d.x, 'y');
  for (const mal of [{ ...bon, h: 9 }, { ...bon, h: -1 }, { ...bon, i: 'court' }, { ...bon, k: 'virus' }, { ...bon, s: 'pas-un-salon' }, { ...bon, a: 'xyz' }, { ...bon, m: 2 }])
    assert.equal(lireMaille(JSON.stringify(mal)), null, JSON.stringify(mal));
  assert.equal(lireMaille('{"m":1'), null); assert.equal(lireMaille(JSON.stringify({ v: 1, g: 'msg' })), null, 'un paquet de l\'ancienne Proche n\'est pas du maillage');
});

test('〰 en ligne A–B–C–D : le message de A arrive chez D (3 sauts), une seule fois, et chacun sait à combien de sauts sont les autres', async () => {
  const L = [['A', 'B'], ['B', 'C'], ['C', 'D']], R = reseau(['A', 'B', 'C', 'D'], L);
  await allumer(R, L);
  await R.T.A.dire('salut le maillage');
  await attendre(150);
  for (const n of ['B', 'C', 'D']) { const f = R.T[n].fil(PUBLIC); assert.equal(f.length, 1, n); assert.equal(f[0].texte, 'salut le maillage'); assert.equal(f[0].nom, 'A'); }
  assert.equal(R.T.D.fil()[0].sauts, 2, 'deux relais entre A et D');
  assert.equal(R.T.A.fil()[0].moi, true);
  const pD = R.T.D.pairs(), a = pD.find(p => p.nom === 'A');
  assert.ok(a && a.sauts === 2 && !a.direct && a.cle, 'D connaît A (sa clé aussi, par son annonce relayée)');
  assert.ok(pD.find(p => p.nom === 'C').direct);
  const avant = { ...R.recus };
  await R.T.D.dire('reçu');
  await attendre(150);
  assert.equal(R.T.A.fil().at(-1).texte, 'reçu');
  assert.ok(R.recus.A - avant.A <= 2 && R.recus.D - avant.D <= 2, 'pas de tempête : chacun reçoit le paquet une fois par voisin, au plus');
});

test('〰 le compteur de sauts arrête le paquet : au-delà de 7 relais, plus rien', async () => {
  const N = Array.from({ length: 10 }, (_, i) => 'P' + i), L = N.slice(1).map((n, i) => [N[i], n]);
  const R = reseau(N, L); await allumer(R, L);
  await R.T.P0.dire('loin'); await attendre(250);
  assert.equal(R.T.P8.fil().length, 1, '7 relais : P8 l\'entend'); assert.equal(R.T.P8.fil()[0].sauts, TTL_MAX);
  assert.equal(R.T.P9.fil().length, 0, 'P9 est trop loin');
});

test('〰 les messages privés : chiffrés de bout en bout ; B et C relaient sans rien lire ; l\'accusé revient chez A', async () => {
  const L = [['A', 'B'], ['B', 'C'], ['C', 'D']], R = reseau(['A', 'B', 'C', 'D'], L);
  const espion = []; const envoyer0 = R.T.B.recevoir; R.T.B.recevoir = (de, t) => { espion.push(t); return envoyer0(de, t); };
  await allumer(R, L);
  const fpD = R.T.D.moi().fp;
  assert.equal(R.T.A.trouver('D'), fpD, 'un nom → son empreinte');
  const id = await R.T.A.prive(fpD, 'le code du casier : 4417');
  assert.ok(id); await attendre(200);
  const conv = R.T.D.fil('@' + R.T.A.moi().fp);
  assert.equal(conv.length, 1); assert.equal(conv[0].texte, 'le code du casier : 4417'); assert.equal(conv[0].prive, true);
  assert.ok(espion.length && espion.every(t => !t.includes('4417')), 'rien de lisible chez le relais');
  assert.equal(R.T.B.fil('@' + R.T.A.moi().fp).length, 0); assert.equal(R.T.C.conversations().length, 0, 'les relais n\'ont pas de conversation');
  assert.equal(R.T.A.fil('@' + fpD)[0].etat, 'recu', '✓✓ : l\'accusé est revenu par le maillage');
  // un relais qui trafique le chiffré ou l'en-tête : D ne l'affiche pas comme lisible
  const p = JSON.parse(espion.find(t => t.includes('"k":"mp"')));
  const faux = JSON.stringify({ ...p, i: 'aaaaaaaaaaaaaaaa', o: R.T.B.moi().fp });
  R.T.D.recevoir('C', faux); await attendre(30);
  assert.equal(R.T.D.fil('@' + R.T.B.moi().fp)[0].texte, null, 'un en-tête détourné ne se déchiffre pas');
});

test('〰 les salons : # ouverts et fermés par un mot de passe ; seuls ceux qui ont rejoint les voient', async () => {
  const L = [['A', 'B'], ['B', 'C']], R = reseau(['A', 'B', 'C'], L); await allumer(R, L);
  await R.T.A.rejoindre('#lac'); await R.T.C.rejoindre('#lac');
  await R.T.A.dire('baignade à 18 h', '#lac'); await attendre(100);
  assert.equal(R.T.C.fil('#lac')[0].texte, 'baignade à 18 h', 'relayé par B, qui n\'a pas rejoint');
  assert.equal(R.T.B.fil('#lac').length, 0); assert.equal(R.T.C.fil(PUBLIC).length, 0);
  await R.T.A.rejoindre('#secret', 'pomme'); await R.T.C.rejoindre('#secret', 'pomme'); await R.T.B.rejoindre('#secret', 'poire');
  await R.T.A.dire('le mot est pomme', '#secret'); await attendre(300);
  assert.equal(R.T.C.fil('#secret')[0].texte, 'le mot est pomme');
  assert.equal(R.T.B.fil('#secret')[0].texte, null, 'le mauvais mot de passe : on voit qu\'il y a un message, pas ce qu\'il dit');
  assert.ok(R.T.A.salons().find(s => s.salon === '#secret').ferme);
});

test('〰 stocker et relayer : E arrive après coup et reçoit ce qu\'il a manqué ; bloquer ; tout effacer', async () => {
  const L = [['A', 'B']], R = reseau(['A', 'B', 'E'], L); await allumer(R, L);
  await R.T.A.dire('avant que E arrive'); await attendre(60);
  assert.equal(R.T.E.fil().length, 0);
  await R.lier('B', 'E'); await attendre(150);
  assert.equal(R.T.E.fil()[0].texte, 'avant que E arrive', 'B lui a gardé le message');
  // bloquer : E ne voit plus A ; B relaie quand même
  assert.ok(R.T.E.bloquer('A'));
  await R.T.A.dire('tu me vois ?'); await attendre(100);
  assert.equal(R.T.E.fil().length, 1); assert.equal(R.T.B.fil().length, 2);
  // tout effacer : une autre empreinte, plus rien
  const avant = R.T.B.moi().fp, apres = await R.T.B.effacerTout();
  assert.notEqual(apres, avant); assert.equal(R.T.B.fil().length, 0); assert.deepEqual(R.T.B.salons().map(s => s.salon), [PUBLIC]);
});

test('〰 l\'identité et les messages tiennent au redémarrage (le magasin)', async () => {
  const m = new Map(), magasin = { lire: async (k) => m.get(k) ?? null, ecrire: async (k, v) => { m.set(k, JSON.parse(JSON.stringify(v))); } };
  const R = reseau(['A'], [], { magasins: { A: magasin } }); await allumer(R, []);
  const fp = R.T.A.moi().fp; await R.T.A.rejoindre('#lac'); await R.T.A.dire('seul');
  const R2 = reseau(['A'], [], { magasins: { A: magasin } }); await allumer(R2, []);
  assert.equal(R2.T.A.moi().fp, fp); assert.equal(R2.T.A.fil()[0].texte, 'seul'); assert.ok(R2.T.A.salons().some(s => s.salon === '#lac'));
});
