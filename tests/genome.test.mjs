// ◈ (0.96) la fractale des UI : une peau = un génome ; la grille autour d'un point (le centre est le point lui-même) ; zoomer resserre ;
// une variante de membrane.js fait l'aller-retour ; tout est déterministe
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GENES, PALETTE, genomeDe, versVariante, muter, grille, croiser, couleursDe } from '../src/bions/genome.js';
import { VARIANTES } from '../src/bions/membrane.js';

const dist = (a, b) => Math.sqrt(GENES.reduce((s, [k]) => s + (a[k] - b[k]) ** 2, 0));
test('◈ le génome : entre 0 et 1, l\'aller-retour d\'une peau, ses couleurs dans la palette de RS-7', () => {
  const g = genomeDe(VARIANTES.xeno, { memb: '#37008a', memb2: '#4d4d4d' });
  for (const [k] of GENES) assert.ok(g[k] >= 0 && g[k] <= 1, k);
  const v = versVariante(g);
  assert.ok(Math.abs(v.epais - VARIANTES.xeno.epais) < 0.01 && Math.abs(v.flou - VARIANTES.xeno.flou) < 0.01, 'les nombres reviennent');
  assert.ok(v.geo.epines && v.geo.vertebres, 'ce qui pousse revient');
  assert.equal(v.couleurs.memb, '#37008a');
  assert.ok(PALETTE.includes(couleursDe(muter(g, 0.5, 9)).memb2), 'une mutation reste dans la palette');
});
test('◈ la grille fractale : 9 peaux, le centre est le point, zoomer resserre ; déterministe', () => {
  const g = genomeDe(VARIANTES.cyberpunk, { memb: '#00fe44', memb2: '#37008a' });
  const large = grille(g, 0.3, 5), serre = grille(g, 0.075, 5);
  assert.equal(large.length, 9); assert.ok(dist(large[4], g) < 1e-9, 'le centre');
  const moy = (l) => l.filter((_, i) => i !== 4).reduce((s, x) => s + dist(x, g), 0) / 8;
  assert.ok(moy(serre) < moy(large) * 0.5, 'zoomer : les voisines se rapprochent');
  assert.deepEqual(grille(g, 0.3, 5), large, 'le même chemin, les mêmes peaux');
  assert.ok(dist(muter(g, 0.05, 3), g) < dist(muter(g, 0.4, 3), g));
  const c = croiser(large[0], large[8], 2); for (const [k] of GENES) assert.ok(c[k] >= 0 && c[k] <= 1);
});
