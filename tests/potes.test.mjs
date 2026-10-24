// ⌖ (0.99.22) retrouver ses potes : la position relative, l'échelle du radar, la boussole, la carte (les tuiles à la même échelle)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { relatif, echelle, aiguille, tourner, fraicheur, tuile, metresParPixel, zoomPour, tuilesAutour } from '../src/bions/potes.js';

const moi = { lat: 46.52, lng: 6.63 };
test('⌖ où est mon pote : la distance, le cap, x à l\'est, y au nord', () => {
  const nord = relatif(moi, { lat: 46.521, lng: 6.63 });   // ~111 m au nord
  assert.ok(Math.abs(nord.d - 111.2) < 1 && nord.cap < 0.5 && Math.abs(nord.x) < 0.5 && Math.abs(nord.y - 111.2) < 1);
  const est = relatif(moi, { lat: 46.52, lng: 6.6313 });   // ~100 m à l'est
  assert.ok(Math.abs(est.cap - 90) < 0.5 && est.x > 95 && Math.abs(est.y) < 1);
});

test('⌖ le radar et la boussole', () => {
  assert.equal(echelle([12]), 25); assert.equal(echelle([90, 30]), 200, '90 m + la marge → 200 m'); assert.equal(echelle([]), 25); assert.equal(echelle([9e9]), 50000);
  assert.equal(aiguille(90, null), 90, 'sans boussole : nord en haut'); assert.equal(aiguille(90, 90), 0, 'je regarde vers lui : tout droit');
  assert.equal(aiguille(10, 350), 20); assert.equal(aiguille(350, 10), 340);
  const p = tourner(0, 100, 90);   // un pote au nord, je regarde l'est : il est à ma gauche
  assert.ok(Math.abs(p.x + 100) < 1e-9 && Math.abs(p.y) < 1e-9);
  assert.deepEqual(tourner(3, 4, 0), { x: 3, y: 4 });
  assert.equal(fraicheur(1000, 3000).texte, 'à l\'instant'); assert.equal(fraicheur(0, 40000).texte, 'il y a 40 s');
  assert.equal(fraicheur(0, 200000).texte, 'il y a 3 min'); assert.ok(fraicheur(0, 200000).vieux);
});

test('⌖ la carte : les tuiles couvrent le radar, à la même échelle', () => {
  const t = tuile(46.52, 6.63, 16); assert.equal(Math.floor(t.x), 33974); assert.equal(Math.floor(t.y), 23178);   /* (186,63 / 360) × 2^16 ; Lausanne au zoom 16 */
  assert.ok(Math.abs(metresParPixel(0, 0) - 156543.03) < 0.1);
  const mpp = 200 / 160;   // 200 m sur 160 px de rayon
  const z = zoomPour(46.52, mpp); assert.ok(metresParPixel(46.52, z) >= mpp && metresParPixel(46.52, z + 1) < mpp, 'le zoom juste au-dessus');
  const l = tuilesAutour(46.52, 6.63, mpp, 320, 320);
  assert.ok(l.length >= 1 && l.length <= 16); assert.ok(l.every(x => x.url.startsWith('https://basemaps.cartocdn.com/dark_all/' + x.z + '/')));
  const couvre = (px, py) => l.some(x => px >= x.gauche && px < x.gauche + x.cote && py >= x.haut && py < x.haut + x.cote);
  for (const [px, py] of [[0, 0], [319, 0], [0, 319], [319, 319], [160, 160]]) assert.ok(couvre(px, py), 'le point ' + px + ',' + py + ' est couvert');
});
