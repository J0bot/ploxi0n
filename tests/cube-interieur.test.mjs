// ▣ (0.67) dans le cube : cinq faces (des xers), l'intérieur se peuple, tout est gardé
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerCubeInterieur, xersPossibles, FACES } from '../src/app/cube-interieur.js';
import { page, attendre } from './aide.mjs';

test('▣ les faces montrent des xers ; on change un xer ; on peuple ; un ploxion touché y va ; gardé dans boxion_local', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, allees = [];
    const liste = () => [{ id: 'a', nom: 'A', cat: 'jeux' }, { id: 'b', nom: 'B', cat: 'son' }];
    const c = creerCubeInterieur({ W, boxion: p.boxion, liste, vivants: () => ['b'], tsoins: async () => [{ d: 'un tsoin', le: new Date().toISOString() }], aller: (id) => allees.push(id) });
    assert.deepEqual(xersPossibles(liste()).map(x => x[0]).slice(0, 5), ['accueil', 'vivants', 'tsoins', 'koin:jeux', 'koin:son']);
    const h = W.document.createElement('div'); W.document.body.appendChild(h);
    const inst = W.jOSApps['cube-interieur'].mount(h); await attendre(30);
    assert.equal(h.querySelectorAll('.ci-face').length, FACES.length, 'cinq faces derrière l\'écran');
    assert.ok(h.querySelector('.ci-fond [data-ci-aller="a"]'), 'le fond : l\'accueil');
    assert.ok(h.querySelector('.ci-gauche [data-ci-aller="b"]') && !h.querySelector('.ci-gauche [data-ci-aller="a"]'), 'la gauche : ce qui vit');
    assert.match(h.querySelector('.ci-droite').textContent, /un tsoin/);
    await inst.choisir('plafond', 'koin:jeux'); assert.ok(h.querySelector('.ci-plafond [data-ci-aller="a"]'));
    inst.ajouter('texte', 'xerboxion'); await attendre(20);
    assert.match(h.querySelector('.ci-objet').textContent, /xerboxion/);
    h.querySelector('.ci-fond [data-ci-aller="a"]').click(); assert.deepEqual(allees, ['a']);
    const g = await p.boxion.get('reglages', 'cube-interieur');
    assert.equal(g.faces.plafond, 'koin:jeux'); assert.equal(g.objets[0].ref, 'xerboxion');
    inst.unmount();
  } finally { p.fin(); }
});
