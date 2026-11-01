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
  for (const n of ['B', 'C']) { const fp = R.T[n].moi().fp; assert.equal(R.T.A.trouver(fp.slice(0, 6)), fp, 'un début d\'empreinte'); assert.equal(R.T.A.trouver(fp.slice(0, 3)), null, 'trois lettres ne suffisent pas'); }
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

test('★ (0.99.22) favoris gardés 72 h, « lu », le code de sécurité (le même des deux côtés), les mentions', async () => {
  const L = [['A', 'B']], R = reseau(['A', 'B', 'C'], L); await allumer(R, L);
  assert.deepEqual(commande('/fav @Tom'), { genre: 'favori', a: 'Tom', oui: true }); assert.equal(commande('/code @Tom').genre, 'code');
  const fpB = R.T.B.moi().fp, fpA = R.T.A.moi().fp;
  assert.equal(R.T.A.favori('B'), fpB); assert.ok(R.T.A.pairs().find(p => p.fp === fpB).favori); assert.equal(R.T.A.favoris()[0].nom, 'B');
  // lu : B ouvre la conversation, l'accusé de lecture revient
  await R.T.A.prive(fpB, 'tu es où ?'); await attendre(80);
  assert.equal(R.T.A.fil('@' + fpB)[0].etat, 'recu');
  assert.equal(R.T.B.lire('@' + fpA), 1); await attendre(60);
  assert.equal(R.T.A.fil('@' + fpB)[0].etat, 'lu'); assert.equal(R.T.B.lire('@' + fpA), 0, 'une fois');
  // le code de sécurité : le même chez les deux, 6 groupes de 5 chiffres
  const ca = await R.T.A.codeSecurite(fpB), cb = await R.T.B.codeSecurite(fpA);
  assert.match(ca, /^(\d{5} ){5}\d{5}$/); assert.equal(ca, cb);
  R.T.A.verifier(fpB); assert.ok(R.T.A.favoris()[0].verifie);
  // les mentions
  let mention = 0; R.T.B.surChange(q => { if (q === 'mention') mention++; });
  await R.T.A.dire('@Bob tu viens ?'); await attendre(60); assert.ok(!R.T.B.fil().at(-1).mention, '@Bob n\'est pas @B');
  await R.T.A.dire('hé @B viens'); await attendre(60);
  assert.ok(R.T.B.fil().at(-1).mention); assert.equal(mention, 1);
});

test('⌖ (0.99.22) la position : chiffrée pour un pote ou un salon fermé, relayée, jamais lisible ailleurs ; « fin » l\'efface', async () => {
  const L = [['A', 'B'], ['B', 'C']], R = reseau(['A', 'B', 'C'], L);
  const espion = []; const r0 = R.T.B.recevoir; R.T.B.recevoir = (de, t) => { espion.push(t); return r0(de, t); };
  await allumer(R, L);
  const fpC = R.T.C.moi().fp, fpA = R.T.A.moi().fp;
  assert.equal(await R.T.A.partagerPosition({ lat: 46.5199971, lng: 6.6312345, precision: 8, cap: 90 }, { a: [fpC] }), 1);
  await attendre(120);
  const pc = R.T.C.positions(); assert.equal(pc.length, 1);
  assert.deepEqual([pc[0].fp, pc[0].lat, pc[0].lng, pc[0].precision, pc[0].cap, pc[0].sauts], [fpA, 46.52, 6.63123, 8, 90, 1]);
  assert.equal(R.T.B.positions().length, 0, 'le relais ne la lit pas'); assert.ok(espion.every(t => !t.includes('46.5')), 'rien en clair');
  // un salon ouvert : refusé ; un salon fermé : ceux qui ont le mot de passe
  await R.T.A.rejoindre('#fete'); assert.equal(await R.T.A.partagerPosition({ lat: 1, lng: 2 }, { salon: '#fete' }), 0, 'jamais dans un salon ouvert');
  await R.T.A.rejoindre('#soiree', 'disco'); await R.T.C.rejoindre('#soiree', 'disco'); await R.T.B.rejoindre('#soiree', 'autre');
  await R.T.A.partagerPosition({ lat: 46.6, lng: 6.7 }, { salon: '#soiree' }); await attendre(300);
  assert.equal(R.T.C.positions()[0].lat, 46.6); assert.equal(R.T.C.positions()[0].salon, '#soiree'); assert.equal(R.T.B.positions().length, 0);
  // fin
  await R.T.A.partagerPosition({ fin: true }, { a: [fpC] }); await attendre(120);
  assert.equal(R.T.C.positions().length, 0);
  assert.equal(await R.T.A.partagerPosition({ lat: 999, lng: 0 }, { a: [fpC] }), 0, 'une position impossible ne part pas');
  // (0.99.29) le rendez-vous voyage avec la position, chiffré ; un rendez-vous impossible est ignoré
  await R.T.A.partagerPosition({ lat: 46.5, lng: 6.6, rdv: { lat: 46.51, lng: 6.61, nom: 'la fontaine' } }, { a: [fpC] }); await attendre(150);
  assert.deepEqual(R.T.C.positions()[0].rdv, { lat: 46.51, lng: 6.61, nom: 'la fontaine' }); assert.ok(espion.every(t => !t.includes('fontaine')), 'le rendez-vous n\'est pas en clair');
  await R.T.A.partagerPosition({ lat: 46.5, lng: 6.6, rdv: { lat: 500, lng: 0 } }, { a: [fpC] }); await attendre(150); assert.equal(R.T.C.positions()[0].rdv, null);
});
