// 🧪 (0.99.24) les sondes des nouveaux bions du banc : celles qui tournent sans iPhone passent ici (le vrai maillage, le WASM, les codes de son…)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { sondesBions, GROUPE_NOUVEAUX } from '../src/banc/sondes-bions.js';

const publicFetch = async (u) => { try { return new Response(await readFile(new URL('../public/' + String(u), import.meta.url))); } catch (e) { return new Response('', { status: 404 }); } };

test('🧪 les nouveaux bions : les sondes auto, sans iPhone', async () => {
  const fetch0 = globalThis.fetch; globalThis.fetch = publicFetch;   /* chargerCoeur lit le WASM par le fetch global */
  try {
    const W = { crypto: globalThis.crypto, navigator: { language: 'fr-CH', languages: ['fr-CH', 'en'] }, fetch: publicFetch };
    const l = sondesBions(W, {}), ctx = { natif: () => false };
    assert.ok(l.every(s => s.groupe === GROUPE_NOUVEAUX && /^nb-/.test(s.id)));
    assert.equal(new Set(l.map(s => s.id)).size, l.length, 'des id uniques');
    const res = {};
    for (const s of l.filter(x => x.quand === 'auto')) res[s.id] = await s.fn(ctx);
    for (const id of ['nb-maille', 'nb-rembourrage', 'nb-fragments', 'nb-potes', 'nb-son-codes', 'nb-coeur', 'nb-langues', 'nb-compat', 'nb-vendor', 'nb-glyphes'])
      assert.equal(res[id].etat, 'ok', id + ' : ' + res[id].detail);
    assert.match(res['nb-maille'].detail, /privé chiffré ✓.*salon fermé ✓.*position chiffrée ✓.*code de sécurité ✓/);
    assert.equal(res['nb-plugins'].etat, 'non'); assert.equal(res['nb-vivant'].etat, 'partiel');
    assert.ok(!/46\.5/.test(JSON.stringify(res)), 'aucune coordonnée dans le log');
  } finally { globalThis.fetch = fetch0; }
});
