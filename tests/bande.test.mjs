// ▥ (0.87) la bande façon niri : le nouveau s'ouvre à DROITE de celui d'où on l'ouvre ; la suivante dépasse, vivante, et un toucher l'amène
// devant ; les bords suivent l'ordre de la bande ; la vue d'ensemble ; sans la bande, rien ne change
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { placerDansOrdre } from '../src/app/bande.js';
import { page, attendre } from './aide.mjs';

test('▥ l\'ordre : à droite de celui d\'où on ouvre (bande), à la fin sinon', () => {
  assert.deepEqual(placerDansOrdre(['a', 'b', 'c'], 'n', 'a', true), ['a', 'n', 'b', 'c']);
  assert.deepEqual(placerDansOrdre(['a', 'b', 'c'], 'n', 'a', false), ['a', 'b', 'c', 'n']);
  assert.deepEqual(placerDansOrdre(['a', 'b', 'c'], 'b', 'c', true), ['a', 'c', 'b'], 'rouvert : déplacé');
  assert.deepEqual(placerDansOrdre([], 'a', null, true), ['a']);
});

async function routeurBande(prefs) {
  const p = await page({ avion: true, ploxions: [] });
  const { creerRouteur } = await import('../src/app/routeur.js');
  const W = p.w; W.jOSApps = W.jOSApps || {};
  for (const id of ['a', 'b', 'c']) W.jOSApps[id] = { manifest: { id }, mount(h) { h.innerHTML = '<p>' + id + '</p>'; return { unmount() {} }; } };
  const racine = W.document.createElement('div'); W.document.body.appendChild(racine);
  const r = creerRouteur({ fenetre: W, racine, prefs: () => prefs, catalogue: ['a', 'b', 'c'].map(id => ({ id, nom: id.toUpperCase(), icone: '◇' })) });
  const scene = racine.querySelector('.px-scene'); Object.defineProperty(scene, 'clientWidth', { value: 400 }); Object.defineProperty(scene, 'clientHeight', { value: 800 });
  return { p, W, r, racine, scene, hote: (id) => racine.querySelector('.px-hote[data-ploxion="' + id + '"]') };
}

test('▥ avec la bande : colonnes, la suivante dépasse à droite (vivante, ni cachée ni endormie), un toucher l\'amène devant ; les bords suivent la bande', async () => {
  const { p, r, scene, hote } = await routeurBande({ bande: true, calme: true });
  try {
    await r.accueil(); await r.ouvrir('a'); await r.ouvrir('c'); await attendre(10);
    await r.aller('a'); await attendre(10);
    await r.ouvrir('b'); await attendre(10);   // ouvert depuis a : entre a et c
    r.faire('precedente'); await attendre(10);
    assert.equal(r.courant(), 'a', 'à gauche de b : a (pas c)');
    assert.ok(scene.classList.contains('px-bande'));
    assert.equal(hote('a').style.transform, 'translateX(0px)'); assert.equal(hote('a').style.width, '344px', '86 % de 400');
    assert.equal(hote('b').hidden, false, 'la suivante se voit'); assert.ok(hote('b').classList.contains('px-bande-voisin'));
    assert.equal(hote('b').style.transform, 'translateX(352px)');
    assert.equal(hote('c').hidden, true, 'au-delà : caché');
    const suite = scene.querySelector('.px-bande-suite'); assert.equal(suite.getAttribute('data-id'), 'b'); assert.equal(suite.style.left, '352px');
    suite.click(); await attendre(10);
    assert.equal(r.courant(), 'b'); assert.equal(hote('b').style.transform, 'translateX(0px)'); assert.equal(hote('a').style.transform, 'translateX(-352px)');
    assert.equal(hote('c').hidden, false, 'c dépasse maintenant');
    r.faire('suivante'); await attendre(10); assert.equal(r.courant(), 'c');
    assert.equal(scene.querySelector('.px-bande-suite'), null, 'la dernière : rien ne dépasse');
  } finally { p.fin(); }
});

test('▥ la vue d\'ensemble : toutes les colonnes en petit, toucher en ramène une devant ; sans la bande, le geste le dit', async () => {
  const { p, r, scene, hote } = await routeurBande({ bande: true, calme: true });
  try {
    await r.accueil(); await r.ouvrir('a'); await r.ouvrir('b'); await r.ouvrir('c'); await attendre(10);
    r.faire('bande'); await attendre(10);
    assert.ok(scene.classList.contains('px-bande-vue'));
    const et = [...scene.querySelectorAll('.px-bande-etiquette')].map(b => b.getAttribute('data-bande-id'));
    assert.deepEqual(et, ['a', 'b', 'c']);
    for (const id of ['a', 'b', 'c']) { assert.equal(hote(id).hidden, false); assert.match(hote(id).style.transform, /scale\(0\.34\)/); }
    scene.querySelector('[data-bande-id="a"]').click(); await attendre(10);
    assert.equal(r.courant(), 'a'); assert.ok(!scene.classList.contains('px-bande-vue')); assert.equal(hote('a').style.transform, 'translateX(0px)');
  } finally { p.fin(); }
  const s = await routeurBande({ bande: false, calme: true });
  try {
    await s.r.accueil(); await s.r.ouvrir('a'); await s.r.ouvrir('b'); await attendre(10);
    assert.ok(!s.scene.classList.contains('px-bande')); assert.equal(s.hote('a').style.transform, ''); assert.equal(s.hote('a').hidden, true);
    s.r.faire('bande'); assert.ok(!s.scene.querySelector('.px-bande-calque'));
  } finally { s.p.fin(); }
});
