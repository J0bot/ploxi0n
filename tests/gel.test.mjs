// ❄ (0.53) le gel : les images (requestAnimationFrame) d'un ploxion vivant mais caché attendent qu'on le revoie.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installerGel, auteur } from '../src/app/gel.js';

test('auteur : le nom du ploxion dans la pile (sourceURL du routeur ou le pack)', () => {
  assert.equal(auteur('boucle@ploxi0n/jeu.js:12:3\nx@capacitor://localhost/assets/index.js:1:1'), 'jeu');
  assert.equal(auteur('at boucle (capacitor://localhost/ploxions/horloge/app.js:4:2)'), 'horloge');
  assert.equal(auteur('at f (capacitor://localhost/assets/index-abc.js:1:1)'), null);
});

test('caché → mis de côté ; revu → rendu ; fermé → oublié ; l\'app et celui qu\'on regarde ne sont jamais gelés', () => {
  const appels = [];
  const W = { requestAnimationFrame: (f) => { appels.push(f); return appels.length; }, cancelAnimationFrame: () => {} };
  let devant = null; const viv = ['jeu', 'horloge'];
  const g = installerGel({ W, courant: () => devant, vivants: () => viv });
  // on simule la pile : la boucle d'un ploxion porte son nom
  const boucleJeu = new Function('W', 'return function boucle(){ return W.requestAnimationFrame(boucle); }\n//# sourceURL=ploxi0n/jeu.js')(W);
  const k = boucleJeu();
  assert.equal(appels.length, 0, 'jeu caché (l\'accueil devant) : mis de côté');
  assert.ok(k > 1e6, 'un identifiant à part');
  devant = 'jeu'; g.degeler('jeu');
  assert.equal(appels.length, 1, 'revu : rendu');
  boucleJeu(); assert.equal(appels.length, 2, 'devant : normal');
  devant = 'horloge'; boucleJeu(); g.liberer('jeu'); g.degeler('jeu');
  assert.equal(appels.length, 2, 'fermé : oublié');
  W.requestAnimationFrame(() => {}); assert.equal(appels.length, 3, 'l\'app elle-même : jamais gelée');
});
