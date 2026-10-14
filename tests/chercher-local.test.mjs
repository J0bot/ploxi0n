// 🔍 (0.69) chercher d'abord chez soi ; le marketplace ensuite ; ↻ tout mettre à jour
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerChercherLocal } from '../src/app/chercher-local.js';
import { page, attendre } from './aide.mjs';

test('🔍 tes ploxions (sans accents, ceux qui vivent d\'abord), Entrée ouvre ; le marketplace et ↻ en bas', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, racine = W.document.createElement('div'); W.document.body.appendChild(racine);
    const ouverts = [], mk = [];
    const c = creerChercherLocal({ W, racine, liste: () => [{ id: 'recits', nom: 'Récits' }, { id: 'piano', nom: 'Piano' }, { id: 'recettes', nom: 'Recettes' }], vivants: () => ['recettes'],
      ouvrir: (id) => ouverts.push(id), marketplace: (q) => mk.push(q), majTout: async () => [{ id: 'a', etat: 'mis-a-jour' }, { id: 'b', etat: 'a-jour' }, { id: 'c', etat: 'erreur' }] });
    const f = c.ouvrir();
    const q = f.querySelector('[data-cl-q]'); q.value = 'rec'; q.dispatchEvent(new W.Event('input'));
    assert.deepEqual([...f.querySelectorAll('[data-cl-id]')].map(b => b.getAttribute('data-cl-id')), ['recettes', 'recits'], 'Récits trouvé sans accent ; l\'ouvert d\'abord');
    q.value = 'recits'; q.dispatchEvent(new W.Event('input'));
    q.dispatchEvent(new W.KeyboardEvent('keydown', { key: 'Enter' }));
    assert.deepEqual(ouverts, ['recits']); assert.ok(!c.ouverte());
    const f2 = c.ouvrir('zzz');
    f2.querySelector('[data-cl-q]').dispatchEvent(new W.Event('input'));
    assert.match(f2.querySelector('[data-cl-liste]').textContent, /rien chez toi/);
    f2.querySelector('[data-cl-maj]').click(); await attendre(20);
    assert.match(f2.querySelector('[data-cl-msg]').textContent, /1 mis à jour · 1 déjà à jour · 1 injoignable/);
    f2.querySelector('[data-cl-mk]').click(); assert.deepEqual(mk, ['zzz']);
  } finally { p.fin(); }
});
