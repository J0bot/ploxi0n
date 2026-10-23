// ❄ (0.99) le zoom libre ou par paliers figés : l'échelle, le niveau, l'écriture qui suit, figer un palier, sauter au suivant
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MIN, MAX, PLONGE, RECULE, borner, niveau, detailDe, versScene, figer, prochainFige } from '../src/bions/zoom.js';

test('❄ l\'échelle reste bornée ; les seuils de plongée sont dedans', () => {
  assert.equal(borner(0.1), MIN); assert.equal(borner(9), MAX); assert.equal(borner(1.2), 1.2);
  assert.ok(MIN < RECULE && RECULE < 1 && 1 < PLONGE && PLONGE < MAX);
});

test('❄ l\'écriture suit l\'échelle : de loin le glyphe, au milieu les deux, de près le texte', () => {
  assert.equal(detailDe(0.6), 'glyphe'); assert.equal(detailDe(1), 'deux'); assert.equal(detailDe(1.5), 'texte');
});

test('❄ un niveau = la scène + l\'échelle, et on en revient', () => {
  assert.equal(niveau(2, 1), 2); assert.equal(niveau(2, 1.4), 2.2); assert.equal(niveau(1, 0.8), 0.9);
  assert.deepEqual(versScene(2.2), { i: 2, s: 1.4 }); assert.deepEqual(versScene(0.9), { i: 1, s: 0.8 });
  assert.equal(versScene(9).i, 4); assert.equal(versScene(-3).i, 0);
});

test('❄ figer : trié, sans doublon proche, nommé', () => {
  let f = figer([], 2.2); f = figer(f, 0.9); f = figer(f, 2.21, 'le mien');
  assert.deepEqual(f.map(x => x.g), [0.9, 2.21]); assert.equal(f[1].nom, 'le mien');
});

test('❄ le palier figé suivant, dans le sens du geste', () => {
  const f = [{ g: 0.9 }, { g: 2 }, { g: 3.3 }];
  assert.equal(prochainFige(f, 2, 1).g, 3.3); assert.equal(prochainFige(f, 2, -1).g, 0.9);
  assert.equal(prochainFige(f, 3.3, 1), null); assert.equal(prochainFige([], 1, -1), null);
});
