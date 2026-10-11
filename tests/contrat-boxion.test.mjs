// Le CONTRAT de boxion_local (brief, pyramide de tests « contrat shim ») : la même suite sur les trois implémentations.
//   memoire · idb (fake-indexeddb) · sqlite (le code SQL de l'iPhone, exécuté par node:sqlite)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import 'fake-indexeddb/auto';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { creerIdb } from '../src/boxion-local/idb.js';
import { creerSqlite } from '../src/boxion-local/sqlite.js';

function executeurNode() {
  const db = new DatabaseSync(':memory:');
  return {
    async run(sql, p) { const r = db.prepare(sql).run(...p); return { lastId: Number(r.lastInsertRowid) }; },
    async query(sql, p) { return db.prepare(sql).all(...p); },
    async fermer() { db.close(); },
  };
}
let n = 0;
const IMPLS = {
  memoire: () => creerMemoire(),
  idb: () => creerIdb({ nom: 'test-' + (++n) }),
  sqlite: () => creerSqlite(executeurNode()),
};

for (const [nom, creer] of Object.entries(IMPLS)) {
  test(`${nom} : get / put / del, une valeur est une copie`, async () => {
    const b = await creer();
    assert.equal(await b.get('ns', 'k'), null);
    const v = { a: 1, l: [1, 2], s: 'é ' };
    await b.put('ns', 'k', v);
    v.a = 99;
    const lu = await b.get('ns', 'k');
    assert.deepEqual(lu, { a: 1, l: [1, 2], s: 'é ' }, 'muter l\'objet après put ne change pas le stocké');
    lu.a = 42;
    assert.equal((await b.get('ns', 'k')).a, 1, 'muter le lu ne change pas le stocké');
    await b.put('ns', 'k', 'remplacé');
    assert.equal(await b.get('ns', 'k'), 'remplacé');
    await b.put('ns', 'k', null);
    assert.equal(await b.get('ns', 'k'), null, 'put(null) efface');
    await b.put('ns', 'x', 0); await b.del('ns', 'x');
    assert.equal(await b.get('ns', 'x'), null);
    await b.fermer();
  });
  test(`${nom} : list par espace de noms et par préfixe, triée ; les jokers SQL ne sont pas des jokers`, async () => {
    const b = await creer();
    for (const k of ['b', 'a', 'a%', 'a_b', 'zz', 'ab']) await b.put('n1', k, k);
    await b.put('n2', 'a', 1);
    assert.deepEqual((await b.list('n1')).map(x => x.key), ['a', 'a%', 'a_b', 'ab', 'b', 'zz']);
    assert.deepEqual((await b.list('n1', { prefix: 'a_' })).map(x => x.key), ['a_b']);
    assert.deepEqual((await b.list('n1', { prefix: 'a%' })).map(x => x.key), ['a%']);
    assert.ok((await b.list('n1'))[0].maj > 0, 'une date de mise à jour');
    assert.deepEqual(await b.list('vide'), []);
    await b.fermer();
  });
  test(`${nom} : watch voit put et del de son espace (et « * » tout), off() désabonne`, async () => {
    const b = await creer();
    const vus = [], tous = [];
    const off = b.watch('w', (e) => vus.push([e.key, e.valeur]));
    const off2 = b.watch('*', (e) => tous.push(e.ns));
    await b.put('w', 'k', 1); await b.put('autre', 'k', 2); await b.del('w', 'k'); await b.del('w', 'absent');
    off();
    await b.put('w', 'k', 3);
    assert.deepEqual(vus, [['k', 1], ['k', null]], 'un del d\'une clé absente ne notifie pas');
    assert.deepEqual(tous, ['w', 'autre', 'w', 'w']);
    off2();
    await b.fermer();
  });
  test(`${nom} : append est un journal ordonné, horodaté, filtrable ; lire depuis une séquence`, async () => {
    const b = await creer();
    const r1 = await b.append('tsoins', { kind: 'action', k: 'a' });
    const r2 = await b.append('xion', { topic: 't', data: 1 });
    const r3 = await b.append('tsoins', { kind: 'sommeil', k: 'b' });
    assert.ok(r1.seq < r2.seq && r2.seq < r3.seq, 'séquences croissantes');
    assert.ok(r1.t > 0);
    const t = await b.lire('tsoins');
    assert.deepEqual(t.map(x => x.entry.k), ['a', 'b']);
    assert.deepEqual((await b.lire('tsoins', { depuis: r1.seq })).map(x => x.entry.k), ['b']);
    assert.deepEqual((await b.lire('tsoins', { kind: 'sommeil' })).map(x => x.entry.k), ['b']);
    assert.deepEqual((await b.lire('tsoins', { limite: 1 })).length, 1);
    assert.deepEqual(await b.lire('vide'), []);
    // deux append dans la même milliseconde gardent des séquences distinctes
    const [x, y] = await Promise.all([b.append('xion', { i: 1 }), b.append('xion', { i: 2 })]);
    assert.notEqual(x.seq, y.seq);
    await b.fermer();
  });
  test(`${nom} : entrées invalides refusées (espace, clé, nom de journal)`, async () => {
    const b = await creer();
    await assert.rejects(() => b.put('', 'k', 1), TypeError);
    await assert.rejects(() => b.get('ns', ''), TypeError);
    await assert.rejects(() => b.append('Mauvais Nom', {}), TypeError);
    await assert.rejects(() => b.lire('../x'), TypeError);
    await b.fermer();
  });
}

test('sqlite : les données survivent à une réouverture sur la même base (le fichier de l\'app)', async () => {
  const db = new DatabaseSync(':memory:');
  const ex = { async run(s, p) { const r = db.prepare(s).run(...p); return { lastId: Number(r.lastInsertRowid) }; }, async query(s, p) { return db.prepare(s).all(...p); } };
  const a = await creerSqlite(ex);
  await a.put('jos', 'x', { v: 1 }); await a.append('tsoins', { kind: 'action' });
  const b = await creerSqlite(ex);   // le schéma est idempotent
  assert.deepEqual(await b.get('jos', 'x'), { v: 1 });
  assert.equal((await b.lire('tsoins')).length, 1);
});
