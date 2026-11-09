// 🩺 (0.99.23) le bilan du faux iPhone → les badges du marketplace : ok, attend (une zone, le réseau, le mode connecté), casse (et pourquoi)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classer } from '../tools/digestion/compat-iphone.mjs';
test('🩺 classer un bilan', () => {
  const ok = { hote: true, erreur: null, visibles: 12, texte: 200, erreurs: [] };
  assert.deepEqual(classer('a', ok), { ip: 'ok' });
  assert.deepEqual(classer('f', { ...ok, visibles: 1, texte: 27, extrait: 'aucune zone — ouvre 🫧 zone' }), { ip: 'attend', ipr: 'attend une zone' });
  assert.equal(classer('n', { ...ok, visibles: 1, texte: 0, extrait: '' }, "var f = document.createElement('iframe'); f.src = url;").ipr, 'une page du labo : le mode connecté');
  assert.equal(classer('c', { ...ok, erreurs: ['Error: leaflet load failed'] }).ipr, 'a besoin du réseau');
  assert.equal(classer('m', { ...ok, erreur: 'Ce ploxion n\'a pas pu s\'ouvrir : jOSLedger.tail is not a function' }).ip, 'casse');
  assert.match(classer('x', { ...ok, erreur: 'Ce ploxion n\'a pas pu s\'ouvrir : boum' }).ipr, /^ne s'ouvre pas encore : boum$/);
});
