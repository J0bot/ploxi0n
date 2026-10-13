// ◈ LE CUBE (0.48) : six faces = six valeurs des bions ; publié vers les widgets avec la dernière inclinaison, seulement s'il a changé.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { creerCube, faces, FACES_DEFAUT } from '../src/app/cube.js';

test('les faces : la valeur publiée, un glyphe, « — » si rien encore ; ⬡ pour la valeur d\'un bion', () => {
  const f = faces(['tsoins-jour', 'px.clicker', 'pas'], { 'tsoins-jour': { titre: 'Tsoins aujourd\'hui', valeur: 3 }, 'px.clicker': { titre: 'Clicker', valeur: '1e24' } });
  assert.deepEqual(f.map(x => [x.g, x.v]), [['⧗', '3'], ['⬡', '1e24'], ['∷', '—']]);
});

test('publier : ploxi0n.cube avec l\'inclinaison du téléphone ; choisir une face la remplace et republie ; rien si inchangé', async () => {
  const { window: W } = new JSDOM('<!doctype html><html><body></body></html>', { url: 'capacitor://localhost/' });
  W.Capacitor = { isNativePlatform: () => true };
  W.document.documentElement.style.setProperty('--mx', '0.42'); W.document.documentElement.style.setProperty('--my', '-0.17');
  const ecrits = [];
  const c = creerCube({ W, boxion: creerMemoire(), valeurs: () => ({ 'tsoins-jour': { titre: 'Tsoins', valeur: 2 }, ploxions: { titre: 'Ploxions', valeur: 130 } }),
    preferences: async () => ({ Preferences: { set: async (o) => ecrits.push(o) } }) });
  await c.publier(); await c.publier();
  assert.equal(ecrits.length, 1, 'une seule écriture tant que rien ne change');
  const p = JSON.parse(ecrits[0].value);
  assert.deepEqual(p.incl, { x: 0.4, y: -0.2 }); assert.equal(p.faces.length, 6); assert.equal(p.faces[0].v, '2');
  await c.choisir(1, 'ploxions');
  assert.equal(JSON.parse(ecrits.at(-1).value).faces[1].v, '130');
  assert.deepEqual(c.choix(), ['tsoins-jour', 'ploxions', ...FACES_DEFAUT.slice(2)]);
  assert.match(c.apercu(), /px-cube-avant/);
  W.close();
});
