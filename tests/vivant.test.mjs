// ◌ (0.99.11) le téléphone vivant : la chaleur accélère, la batterie pâlit, la charge et la chaleur teintent, l'économie et le calme l'endorment
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { etatVivant, niveauSon } from '../src/bions/vivant.js';

test('◌ l\'état de l\'iPhone devient un souffle', () => {
  assert.deepEqual(etatVivant({}), { actif: true, periode: 6, intensite: 1, teinte: 'bio' });
  assert.equal(etatVivant({ thermique: 'chaud' }).periode, 2.4); assert.equal(etatVivant({ thermique: 'critique' }).teinte, 'chaud');
  assert.ok(etatVivant({ thermique: 'tiede' }).periode < etatVivant({ thermique: 'nominal' }).periode);
  assert.equal(etatVivant({ batterie: 0.1 }).teinte, 'faible'); assert.ok(etatVivant({ batterie: 0.1 }).intensite < 0.5);
  assert.equal(etatVivant({ batterie: 0.5, enCharge: true }).teinte, 'charge');
  assert.equal(etatVivant({ economie: true }).actif, false, 'économie d\'énergie : il dort'); assert.equal(etatVivant({ calme: true }).actif, false);
});
test('◌ le niveau d\'un son', () => {
  assert.equal(niveauSon(new Uint8Array(64).fill(128)), 0, 'le silence');
  const fort = new Uint8Array(64).map((_, i) => (i % 2 ? 255 : 0)); assert.equal(niveauSon(fort), 1);
  assert.equal(niveauSon(null), 0);
});
