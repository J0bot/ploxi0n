// ⊞ (0.64) la carte du xerboxion : chaque ploxion a sa place (stable, gardée), le chemin des swipes, ouverte sur « ici », toucher = y aller
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { placer, chemin, creerCarteXer } from '../src/app/carte-xer.js';
import { page, attendre } from './aide.mjs';

test('⊞ les places : uniques, jamais sur le cube, par koin ; une place gardée ne bouge pas ; un nouveau venu ne déplace personne', () => {
  const l = Array.from({ length: 60 }, (_, i) => ({ id: 'p' + i, nom: 'p' + i, cat: ['jeux', 'social', 'son'][i % 3] }));
  const a = placer(l, {}), vals = Object.values(a).map(v => v.join(','));
  assert.equal(new Set(vals).size, 60); assert.ok(!vals.includes('0,0'));
  const b = placer([...l, { id: 'neuf', nom: 'neuf', cat: 'jeux' }], a);
  for (const p of l) assert.deepEqual(b[p.id], a[p.id], 'personne ne bouge');
  assert.deepEqual(placer(l, { p3: [9, 9] }).p3, [9, 9]);
  assert.equal(chemin([0, 0], [2, -1]), '→×2 ↑'); assert.equal(chemin([1, 1], [1, 1]), '');
});

test('⊞ ouverte centrée sur « ici » ; toucher une app y va (sans rejouer sa signature) ; ✕ ferme', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, allees = [], sons = [];
    const liste = () => [{ id: 'a', nom: 'A', cat: 'jeux', bions: ['jOSGpg'] }, { id: 'b', nom: 'B', cat: 'jeux', bions: ['jOSGpg'] }, { id: 'c', nom: 'C', cat: 'son' }];
    const k = creerCarteXer({ W, racine: W.document.body, liste, courant: () => 'b', aller: (id) => allees.push(id), vibrer: (e, id) => sons.push(id ? e + ':' + id : e), boxion: p.boxion, calme: () => true });
    await k.ouvrir();
    const el = W.document.querySelector('.px-carte'); assert.ok(el, 'la carte');
    assert.deepEqual([k.camera().x, k.camera().y], k.places().b, 'centrée sur ici');
    assert.ok(el.querySelector('.px-carte-case.ici[data-carte-id="b"]')); assert.ok(el.querySelector('.px-carte-fils line'), 'a et b partagent un bion rare : un fil (vu de près)');
    assert.deepEqual((await p.boxion.get('reglages', 'carte')).places, k.places(), 'les places sont gardées');
    assert.equal(sons[0], 'fx-carte-xer');
    const c = el.querySelector('[data-carte-id="c"]');
    c.dispatchEvent(new W.MouseEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 10 })); c.dispatchEvent(new W.MouseEvent('pointerup', { bubbles: true, clientX: 10, clientY: 10 }));
    await attendre(10);
    assert.deepEqual(allees, ['c']); assert.ok(sons.includes('fx-ouvrir:c')); assert.ok(!W.document.querySelector('.px-carte'), 'fermée en y allant');
    await k.ouvrir(); W.document.querySelector('[data-carte-fermer]').dispatchEvent(new W.MouseEvent('pointerdown', { bubbles: true })); W.document.querySelector('[data-carte-fermer]').dispatchEvent(new W.MouseEvent('pointerup', { bubbles: true }));
    assert.ok(!k.ouverte());
  } finally { p.fin(); }
});
