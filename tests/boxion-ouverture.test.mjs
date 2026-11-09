// (0.69) RS-7 : « ploxi0n n'a pas pu démarrer : … rc: 14 unable to open database file » — l'ouverture de SQLite se réessaie, attend le
// premier plan (l'iPhone déverrouillé), et l'erreur finale dit que la base est fermée par iOS.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ouvrirSqliteResilient, VERROUILLE } from '../src/boxion-local/index.js';

const rc14 = () => new Error('Run: Failed in runSQL : Error: prepareSQL finalize failed rc: 14 message: unable to open database file');

test('SQLite refusé deux fois (rc 14), ouvert au troisième essai', async () => {
  let n = 0; const essais = [];
  const b = await ouvrirSqliteResilient({ ouvrir: async () => { n++; if (n < 3) throw rc14(); return { impl: 'sqlite' }; }, attendre: async () => {}, D: null, surEssai: (k) => essais.push(k) });
  assert.equal(b.impl, 'sqlite'); assert.equal(n, 3); assert.deepEqual(essais, [1, 2]);
});

test('toujours refusé : une erreur qui dit « verrouillé », pas un écran mort', async () => {
  await assert.rejects(ouvrirSqliteResilient({ ouvrir: async () => { throw rc14(); }, essais: 3, attendre: async () => {}, D: null }),
    (e) => e.verrouille === true && /fermée par iOS/.test(e.message));
  assert.ok(VERROUILLE.test('SQLITE_CANTOPEN')); assert.ok(!VERROUILLE.test('rc: 140'));
});

test('en arrière-plan, le nouvel essai attend le retour au premier plan', async () => {
  const ecoutes = new Map(); const D = { hidden: true, addEventListener: (t, f) => ecoutes.set(t, f), removeEventListener: (t) => ecoutes.delete(t) };
  let n = 0;
  const p = ouvrirSqliteResilient({ ouvrir: async () => { n++; if (n < 2) throw rc14(); return { ok: 1 }; }, attendre: async () => {}, D });
  await new Promise(r => setTimeout(r, 20));
  assert.equal(n, 1, 'il attend : l\'iPhone est verrouillé');
  D.hidden = false; ecoutes.get('visibilitychange')();
  assert.deepEqual(await p, { ok: 1 }); assert.equal(n, 2);
});
