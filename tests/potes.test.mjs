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

import { lisserCap, tourCourt, guidage, tendance, minutesAPied, tuilesZone, ajouterTrace, rdvValide } from '../src/bions/potes.js';
test('⌖ (0.99.29) la boussole : le cap lissé sur le cercle, le plus court chemin, le guidage aux vibrations', () => {
  assert.equal(lisserCap(null, 370), 10); assert.equal(lisserCap(350, null), 350);
  const l = lisserCap(350, 10, 0.5); assert.ok(Math.abs(l - 0) < 1e-9 || Math.abs(l - 360) < 1e-9, '350 et 10 : le milieu est 0, pas 180');
  assert.equal(tourCourt(350, 10), 370); assert.equal(tourCourt(10, 350), -10); assert.equal(tourCourt(720, 90), 810);
  assert.equal(guidage(100, 45), null, 'hors du cône'); assert.equal(guidage(100, 10).intervalle, 900);
  assert.equal(guidage(5, 0).intervalle, 350, 'tout près : vite'); assert.equal(guidage(5000, -5).intervalle, 2500, 'loin : lent'); assert.ok(guidage(100, 355), '355° = 5° à gauche');
});
test('⌖ (0.99.29) tendance, minutes à pied, la trace, le rendez-vous', () => {
  const t = 100000;
  assert.equal(tendance([{ t: t - 20000, d: 200 }, { t, d: 150 }], t), 'rapproche'); assert.equal(tendance([{ t: t - 20000, d: 150 }, { t, d: 200 }], t), 'eloigne');
  assert.equal(tendance([{ t: t - 20000, d: 200 }, { t, d: 198 }], t), null); assert.equal(tendance([{ t: t - 60000, d: 500 }, { t, d: 100 }], t), null, 'trop vieux : un seul point');
  assert.equal(minutesAPied(20), 1); assert.equal(minutesAPied(800), 10);
  let tr = ajouterTrace([], { lat: 46.52, lng: 6.63, t: 1 }); tr = ajouterTrace(tr, { lat: 46.52001, lng: 6.63, t: 2 }); assert.equal(tr.length, 1, 'à 1 m : remplace');
  tr = ajouterTrace(tr, { lat: 46.5203, lng: 6.63, t: 3 }); assert.equal(tr.length, 2); for (let i = 0; i < 20; i++) tr = ajouterTrace(tr, { lat: 46.53 + i * 0.001, lng: 6.63, t: 10 + i }); assert.equal(tr.length, 12);
  assert.deepEqual(rdvValide({ lat: 46.520001234, lng: 6.63, nom: 'la fontaine\u0007 de la place du marché' }), { lat: 46.52, lng: 6.63, nom: 'la fontaine de la place ' });
  assert.equal(rdvValide({ lat: 999, lng: 0 }), null); assert.equal(rdvValide('x'), null);
});
test('⌖ (0.99.29) la carte hors ligne : les tuiles d\'un disque, bornées, les zooms fins coupés d\'abord', () => {
  const l = tuilesZone(46.52, 6.63, 1500);
  assert.ok(l.length > 20 && l.length <= 450, String(l.length)); assert.ok(l.every(t => t.url === 'https://basemaps.cartocdn.com/dark_all/' + t.z + '/' + t.x + '/' + t.y + '.png'));
  const zs = [...new Set(l.map(t => t.z))]; assert.deepEqual(zs, zs.slice().sort((a, b) => a - b)); assert.equal(zs[0], 13);
  assert.ok(tuilesZone(46.52, 6.63, 1500, [13, 14, 15, 16, 17, 18, 19], 100).length <= 100);
  const c = tuile(46.52, 6.63, 16); assert.ok(l.some(t => t.z === 16 && t.x === Math.floor(c.x) && t.y === Math.floor(c.y)), 'la tuile où je suis');
});
