// ⊡ (0.70) la vue des xers : les voisins de la carte dans 4 directions ; glisser y va ; toucher le centre y entre ; la capture d'écran l'ouvre
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerVueXers, voisin, voisins } from '../src/app/vue-xers.js';
import { page, attendre } from './aide.mjs';

const PLACES = { '·': [0, 0], a: [2, 0], b: [5, 1], c: [0, -3], d: [-1, 2], e: [-4, -4] };

test('⊡ voisin : le plus proche dans un cône de 45°, la distance d\'abord', () => {
  assert.equal(voisin(PLACES, '·', 'droite'), 'a');
  assert.equal(voisin(PLACES, 'a', 'droite'), 'b');
  assert.equal(voisin(PLACES, '·', 'haut'), 'c');
  assert.equal(voisin(PLACES, '·', 'bas'), 'd');
  assert.equal(voisin(PLACES, '·', 'gauche'), 'e', 'à 45° pile : encore dans le cône');
  assert.equal(voisin(PLACES, 'b', 'droite'), null, 'rien par là');
  const diag = { '·': [0, 0], m: [1, 1] };
  const v = voisins(diag, '·'); assert.equal([v.bas, v.droite].filter(Boolean).length, 1, 'en diagonale : une seule direction');
  assert.equal(voisins(PLACES, 'b', { id: 'a', dir: 'droite' }).gauche, 'a', 'd\'où l\'on vient est derrière soi');
});

test('⊡ la vue : centrée sur l\'app ouverte, ses voisins ; glisser à droite ; toucher le centre y entre ; pincer → la carte', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, racine = D.createElement('div'); D.body.appendChild(racine);
    const h = D.createElement('div'); h.innerHTML = '<p>la page de a</p>'; D.body.appendChild(h);
    const allees = [], sons = []; let carte = 0;
    const places = { a: [2, 0], b: [5, 1], c: [0, -3] };
    const v = creerVueXers({ W, racine, liste: () => [{ id: 'a', nom: 'A', etat: 'vivant' }, { id: 'b', nom: 'B' }, { id: 'c', nom: 'C' }], places: async () => places, courant: () => 'a',
      hoteDe: (id) => (id === 'a' ? h : null), aller: (id) => allees.push(id), carte: () => carte++, vibrer: (e) => sons.push(e), calme: () => true });
    const el = await v.ouvrir({ capture: true });
    assert.equal(v.centre(), 'a'); assert.match(el.querySelector('.px-vx-centre').textContent, /la page de a/, 'son aperçu : la photo de la page');
    assert.equal(v.cases().droite, 'b'); assert.equal(v.cases().gauche, '·', 'l\'accueil, au centre de la carte');
    assert.ok(v.aller('droite')); assert.equal(v.centre(), 'b'); assert.ok(sons.includes('fx-case'));
    assert.equal(v.cases().gauche, 'a', 'à gauche : là d\'où l\'on vient');
    assert.ok(!v.aller('droite')); assert.ok(sons.includes('fx-butee'), 'rien plus à droite : une butée');
    v.entrer(); assert.deepEqual(allees, ['b']); assert.ok(!v.ouverte());
    // la capture d'écran d'iOS (AppDelegate → « ploxi0n-capture ») : la vue s'ouvre comme une image
    await v.ouvrir({ capture: true }); assert.ok(racine.querySelector('.px-vx-capture .px-vx-eclair'));
    v.fermer(); void carte;
  } finally { p.fin(); }
});
