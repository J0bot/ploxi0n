// Le banc iPhone 🧪 en jsdom (pas de Capacitor : les sondes natives répondent « natif seulement ») : chaque sonde automatique aboutit,
// aucune ne touche le réseau (le banc respecte le mode avion), le rapport est gardé dans boxion_local, et l'unmount ne laisse rien.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, attendre } from './aide.mjs';
import { enregistrerBanc } from '../src/banc/banc.js';
import { sondes } from '../src/banc/sondes.js';

test('banc : les sondes auto aboutissent sans réseau, le rapport est gardé, rien ne reste', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    enregistrerBanc({ W: p.w, boxion: p.boxion, version: 'test' });
    const avant = p.compte.photo();
    const hote = p.w.document.createElement('div'); p.w.document.body.appendChild(hote);
    const inst = p.w.jOSApps.banc.mount(hote, {});
    for (let i = 0; i < 100 && !(await p.boxion.get('banc', 'dernier')); i++) await attendre(100);
    const r = await p.boxion.get('banc', 'dernier');
    assert.ok(r, 'rapport gardé dans boxion_local');
    const auto = sondes(p.w).filter(s => s.quand === 'auto').map(s => s.id);
    for (const id of auto) {
      const x = r.resultats.find(y => y.id === id);
      assert.ok(x && ['ok', 'partiel', 'non', 'refuse', 'erreur'].includes(x.etat), `sonde ${id} : ${x && x.etat}`);
    }
    assert.equal(r.resultats.find(y => y.id === 'sto-boxion').etat, 'ok', 'boxion_local marche');
    assert.equal(r.resultats.find(y => y.id === 'cal-wasm').etat, 'ok', 'WebAssembly marche');
    assert.ok(r.resultats.filter(y => y.etat === 'pas essayé').every(y => sondes(p.w).find(s => s.id === y.id).quand === 'toucher'), 'seules les sondes « toucher » attendent');
    assert.deepEqual(p.tentatives, [], 'aucune requête sortante');
    assert.equal((await p.boxion.lire('tsoins', { kind: 'banc' })).length, 1, 'un tsoin « banc »');
    inst.unmount();
    await attendre(300);
    const apres = p.compte.photo();
    for (const k of ['interval', 'raf', 'ecoute', 'blob']) assert.equal(apres[k] - avant[k], 0, k);
  } finally { p.w.close(); }
});
