// ⊙ (0.99.8) le mode humain : zéro texte, des glyphes et des maths (src/bions/humain.js)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compte, duree, fenetre, rien, flux } from '../src/bions/humain.js';
import { ECRITURES } from '../src/app/prefs.js';
import { FENETRES } from '../src/app/map-hubs.js';

test('⊙ compter, dater, dire l\'absence : sans un mot', () => {
  assert.equal(compte(8, '◇'), '8◇'); assert.equal(compte(-3), '0'); assert.equal(compte(12345, '◎'), '12k◎');
  assert.equal(duree(20e3), 'Δt ≈ 0'); assert.equal(duree(40 * 60e3), 'Δt −40 min'); assert.equal(duree(3 * 3600e3), 'Δt −3 h'); assert.equal(duree(14 * 864e5), 'Δt −14 d');
  assert.equal(rien, '∅'); assert.equal(flux(3, 2), '→3 · 2→');
  for (const [nom, de, a] of FENETRES) assert.ok(!/[a-zà-ÿ]{3,}/i.test(fenetre(de, a)), nom + ' → ' + fenetre(de, a));
  assert.equal(fenetre(null), '∀t'); assert.equal(fenetre(7, 20), 'Δt ∈ [7, 20] d'); assert.equal(fenetre(31, 9999), 'Δt > 31 d');
});

test('⊙ « humain » est une écriture', () => { assert.ok(ECRITURES.some(e => e[0] === 'humain')); });
