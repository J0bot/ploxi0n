// ⬡ LES ICÔNES (0.55) : la forme = le type, la couleur et le glyphe = la catégorie ; un xerkion a autant de côtés que de koins.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { typeDe, specXerkion, svgXerkion, glypheCategorie, hHash } from '../src/app/xerkion-icone.js';

test('le type se lit dans le registre, sinon dans l\'id ; tout le reste est un ploxion (losange)', () => {
  const t = (id, x = {}) => typeDe({ id, ...x });
  assert.deepEqual(['xerkion-son', 'xerkions', 'xer', 'xer-launcher', 'cubion', 'space-cubion', 'cube', 'kion', 'kion-3d', 'koin', 'wormion', 'spherion', 'portion', 'bion', 'boxion', 'nouveau-boxion', 'pomodoro', 'xerbot', 'maison'].map(id => t(id)),
    ['xerkion', 'xerkion', 'xer', 'xer', 'cubion', 'cubion', 'cubion', 'kion', 'kion', 'koin', 'wormion', 'spherion', 'portion', 'bion', 'boxion', 'boxion', 'ploxion', 'ploxion', 'ploxion']);
  assert.equal(t('pomodoro', { type: 'cubion' }), 'cubion', 'le labo a le dernier mot');
  assert.equal(t('n-importe', { koins: 3 }), 'xerkion', 'des koins : un xerkion');
});

test('un xerkion a autant de côtés que de koins (3 à 12), sans koins l\'octogone-xer ; son glyphe vient de son thème', () => {
  assert.equal(specXerkion({ id: 'xerkion-son', koins: 5 }).cotes, 5);
  assert.equal(specXerkion({ id: 'xerkion-x', koins: 16 }).cotes, 12);
  assert.equal(specXerkion({ id: 'xerkion-01', koins: 0 }).cotes, 8);
  assert.equal(specXerkion({ id: 'xerkion-son', koins: 5 }).glyphe, 'musique', 'xerkion-son → musique, pas « kion »');
  const svg = svgXerkion({ id: 'xerkion-son', koins: 5 }, { style: 'xerboxion' });
  assert.match(svg, /data-type="xerkion"/); assert.equal((svg.match(/<line /g) || []).length, 5, 'un rayon par koin');
  assert.equal(specXerkion({ id: 'xerkion-son' }).pal, hHash('xerkion-son') % 6, 'la palette du labo (son id)');
});

test('la catégorie donne la couleur et le glyphe de secours ; « maison » n\'est pas du son', () => {
  const s = specXerkion({ id: 'zzz', cat: 'son' });
  assert.deepEqual([s.type, s.glyphe, s.pal], ['ploxion', 'musique', 2]);
  assert.equal(specXerkion({ id: 'zzz', categorie: 'Maison & Vie' }).glyphe, 'maison', 'par le libellé aussi');
  assert.equal(specXerkion({ id: 'ma-maison', nom: 'Maison' }).glyphe, 'maison');
  assert.equal(glypheCategorie('Savoir & Wiki'), 'livre');
  assert.deepEqual(specXerkion({ id: 'zzz', cat: 'son' }, { pal: 4, glyphe: 'lampe' }).pal, 4, 'la perso passe devant');
});

test('le SVG se suffit (ni classe à styler, ni id, ni filtre) et se met en cache', () => {
  const svg = svgXerkion({ id: 'pomodoro', nom: 'Pomodoro' }, { style: 'xerboxion' });
  assert.ok(!/ class="(f|p)"/.test(svg)); assert.ok(!/ id=/.test(svg)); assert.ok(!/filter/.test(svg));
  assert.match(svg, /data-type="ploxion"/); assert.match(svg, /points="50.0,6.0 94.0,50.0 50.0,94.0 6.0,50.0"/, "le losange");
  assert.equal(svgXerkion({ id: 'pomodoro', nom: 'Pomodoro' }, { style: 'xerboxion' }), svg);
});

test('(0.56) le glyphe seul, en grand ; le style d\'une app passe devant celui de l\'app', () => {
  const x = svgXerkion({ id: 'pomodoro', nom: 'Pomodoro' }, { style: 'xerboxion' }), g = svgXerkion({ id: 'pomodoro', nom: 'Pomodoro' }, { seul: true });
  assert.match(x, /data-style="xerboxion"/); assert.match(g, /data-style="glyphe"/);
  assert.match(g, /<polygon points="50,4 96,50 50,96 4,50" fill="#59a69e"/, '(0.57) le losange, plein'); assert.match(g, /scale\(0\.480\)/, 'le glyphe, en grand');
  assert.match(g, /stroke="#0a0f13" stroke-width="9"/, 'le glyphe découpé (sombre) sur la forme pleine');
  assert.match(svgXerkion({ id: 'cubion' }, { seul: true }), /data-type="cubion"/); assert.match(svgXerkion({ id: 'xerkion-a', koins: 5 }, { seul: true }), /<polygon points="[^"]+" fill="#/);
  assert.match(x, /scale\(0\.437\)/, 'dans la forme, le glyphe est plus grand qu\'en 0.55 (0.344)');
  assert.match(svgXerkion({ id: 'pomodoro' }, { seul: true, perso: { style: 'xerboxion' } }), /data-style="xerboxion"/);
  assert.match(svgXerkion({ id: 'pomodoro' }, { perso: { style: 'glyphe' } }), /data-style="glyphe"/);
});
