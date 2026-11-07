// ✉ (0.99.38) comme bitchat : la boîte d'envoi (un privé sans accusé est renvoyé, puis « pas remis ») et les coursiers (spray-and-wait :
// un téléphone porte le message d'un absent et le lui remet quand il le croise)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerMaille, BOITE_ESSAIS, COPIES } from '../src/bions/maille.js';
import { attendre } from './aide.mjs';

const alea = (n) => globalThis.crypto.getRandomValues(new Uint8Array(n));
function reseau(noms, { ecartBoite = 0 } = {}) {
  const T = {}, cables = new Set(), recus = {};
  for (const n of noms) {
    recus[n] = [];
    T[n] = creerMaille({ subtle: globalThis.crypto.subtle, alea, nom: n, ecartBoite, attente: (ms, f) => setTimeout(f, 1), repeter: () => () => {},
      envoyer: (texte, vers) => { for (const v of vers || T[n].voisins()) if (cables.has(n + '|' + v)) setTimeout(() => { recus[v].push(texte); T[v].recevoir(n, texte); }, 1); } });
  }
  return { T, recus, lier(a, b) { cables.add(a + '|' + b); cables.add(b + '|' + a); T[a].voisin(b, 'connecte'); T[b].voisin(a, 'connecte'); },
    couper(a, b) { cables.delete(a + '|' + b); cables.delete(b + '|' + a); T[a].voisin(b, 'perdu'); T[b].voisin(a, 'perdu'); } };
}
async function trois() {
  const R = reseau(['A', 'B', 'C']); for (const t of Object.values(R.T)) await t.demarrer();
  await R.T.A.ajouterCarte(R.T.C.carte()); await R.T.C.ajouterCarte(R.T.A.carte());   // A connaît la clé de C (et l'inverse), sans s'être jamais vus
  return R;
}
const fil = (R, n, de) => R.T[n].fil('@' + R.T[de].moi().fp);

test('✉ le coursier : A écrit à C absent, B le porte ; A s\'en va, B croise C et lui remet ; l\'accusé vide la sacoche de B', async () => {
  const R = await trois();
  R.lier('A', 'B'); await attendre(60);
  await R.T.A.prive(R.T.C.moi().fp, 'on se voit au lac'); await attendre(60);
  assert.equal(R.T.B.transit().sacoche, 1, 'B porte le message (C n\'est pas là)');
  assert.ok(!R.recus.B.some(t => /au lac/.test(t)), 'B ne porte que du chiffré');
  R.couper('A', 'B'); R.lier('B', 'C'); await attendre(150);
  const c = fil(R, 'C', 'A'); assert.equal(c.length, 1); assert.equal(c[0].texte, 'on se voit au lac');
  assert.equal(R.T.B.transit().sacoche, 0, 'remis : la sacoche est vide (l\'accusé de C est passé par B)');
  assert.equal(R.T.A.transit().boite, 1, 'A ne le sait pas encore (il est parti)');
  R.lier('A', 'B'); await attendre(200);
  assert.equal(R.T.A.transit().boite, 0, 'A revient : il renvoie, C accuse (le doublon est ignoré), la boîte se vide');
  assert.equal(fil(R, 'C', 'A').length, 1, 'jamais deux fois le même message chez C');
  assert.ok(['recu', 'lu'].includes(fil(R, 'A', 'C')[0].etat));
});

test('✉ la boîte d\'envoi : personne autour, puis le chemin s\'ouvre : le message part tout seul et arrive une fois', async () => {
  const R = await trois();
  await R.T.A.prive(R.T.C.moi().fp, 'tu es où ?'); await attendre(30);
  assert.equal(R.T.A.transit().boite, 1); assert.equal(fil(R, 'A', 'C')[0].etat, 'envoye');
  R.lier('B', 'C'); R.lier('A', 'B'); await attendre(250);
  assert.equal(fil(R, 'C', 'A').length, 1); assert.equal(R.T.A.transit().boite, 0); assert.equal(fil(R, 'A', 'C')[0].etat, 'recu');
});

test('✉ « pas remis » : après ' + BOITE_ESSAIS + ' essais sans accusé, le message est abandonné, et ça se voit', async () => {
  const R = await trois();
  R.lier('A', 'B'); await attendre(30);
  await R.T.A.prive(R.T.C.moi().fp, 'allô ?');
  for (let i = 0; i < BOITE_ESSAIS + 1; i++) { await R.T.A.renvoyer(); await attendre(5); }
  assert.equal(R.T.A.transit().boite, 0); assert.equal(fil(R, 'A', 'C')[0].etat, 'echec');
});

test('✉ le spray : un porteur donne la moitié de ses copies à chaque nouveau voisin, pas plus', async () => {
  const R = reseau(['A', 'B', 'C', 'D', 'X']); for (const t of Object.values(R.T)) await t.demarrer();
  await R.T.A.ajouterCarte(R.T.X.carte());
  R.lier('A', 'B'); await attendre(60);
  await R.T.A.prive(R.T.X.moi().fp, 'pour X'); await attendre(60);
  assert.equal(COPIES, 8);
  R.couper('A', 'B'); R.lier('B', 'C'); await attendre(80); R.lier('B', 'D'); await attendre(80);
  assert.equal(R.T.C.transit().sacoche, 1, 'C a reçu une part'); assert.equal(R.T.D.transit().sacoche, 1, 'D aussi');
  const parts = [...R.recus.C, ...R.recus.D].map(t => JSON.parse(t)).filter(p => p.k === 'mp');
  assert.deepEqual(parts.filter(p => p.h === 0).map(p => p.c).sort(), [2, 4], 'B (8) donne 4 à C, puis 2 à D (h = 0 : ils gardent, ils ne diffusent pas)');
  assert.ok(parts.filter(p => p.h > 0).every(p => p.c === 1), 'les rejeux de la synchronisation ne portent qu\'une copie');
});
