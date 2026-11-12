// 🎞 (0.99.51) le banc des animations : le catalogue (des familles, un « actuel » par famille), le texte pour Claude, jOSSwipe embarqué
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { FAMILLES, VARIANTES, resume, actives, BRANCHEES } from '../src/lot/banc-anim.js';
import { OUVRIR, FERMER, COURBES, clesOuvrir, clesFermer } from '../src/app/zoom-icone.js';

test('🎞 chaque famille a ses variantes, et exactement une « actuelle » (ce que l\'app fait aujourd\'hui) ; les id sont uniques', () => {
  const ids = new Set(VARIANTES.map(v => v.id)); assert.equal(ids.size, VARIANTES.length);
  for (const [f] of FAMILLES) {
    const l = VARIANTES.filter(v => v.famille === f);
    assert.ok(l.length >= 3, f + ' : au moins trois choix'); assert.equal(l.filter(v => v.actuel).length, 1, f + ' : une actuelle');
    for (const v of l) { assert.match(v.id, new RegExp('^' + f + '-')); assert.equal(typeof v.jouer, 'function'); assert.ok(v.nom && v.sous); }
  }
  assert.ok(VARIANTES.every(v => FAMILLES.some(f => f[0] === v.famille)));
});

test('🎞 le texte pour Claude : les ★ puis les ♥ par famille, « rien ne plaît » si tout est ✕', () => {
  const t = resume({ 'ouvrir-cercle': 'love', 'ouvrir-ios': 'like', 'fermer-ios': 'pass', 'fermer-bas': 'pass', 'fermer-dissout': 'pass', 'fermer-point': 'pass' }, '0.99.51');
  assert.equal(t, 'Banc des animations 0.99.51 :\n- Ouvrir un ploxion : ★ ouvrir-cercle, ♥ ouvrir-ios\n- Fermer un ploxion : rien ne plaît');
});

test('🎞 jOSSwipe est embarqué (le pack de l\'app), et le banc est enregistré dans main.js', () => {
  assert.ok(existsSync(new URL('../public/bions/jOSSwipe.js', import.meta.url)));
  const j = readFileSync(new URL('../public/bions/jOSSwipe.js', import.meta.url), 'utf8');
  assert.ok(j.includes('window.jOSSwipe = {') && j.includes('mount: mount'));
  assert.ok(!/fetch\(|XMLHttpRequest|eval\(|new Function/.test(j), 'pas de réseau ni de code dynamique dans le bion');
  const m = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'); assert.ok(m.includes('enregistrerBancAnim({ boxion, version: VERSION'));
  const b = readFileSync(new URL('../src/lot/banc-anim.js', import.meta.url), 'utf8'); assert.ok(b.includes('<div class="ba" data-ecrit>'), '(0.99.52) sans-emoji.js ne retire pas le ♥ ni le ↩ de jOSSwipe');
});

test('⚙ (0.99.52) les animations de l\'app : le choix réglé, sinon la dernière ★, sinon l\'actuelle ; une ✕ ne peut pas être active', () => {
  const a = actives({}, {}); assert.equal(a.ouvrir, 'ouvrir-ios'); assert.equal(a.cascade, 'cascade-une');
  assert.equal(actives({ 'ouvrir-cercle': 'love' }, {}).ouvrir, 'ouvrir-cercle');
  assert.equal(actives({ 'ouvrir-cercle': 'love', 'ouvrir-genie': 'like' }, { ouvrir: 'ouvrir-genie' }).ouvrir, 'ouvrir-genie', 'le choix réglé passe devant');
  assert.equal(actives({ 'ouvrir-genie': 'pass' }, { ouvrir: 'ouvrir-genie' }).ouvrir, 'ouvrir-ios', 'écartée : on revient à l\'actuelle');
});

test('⚙ (0.99.52) ce que l\'app sait jouer : chaque variante d\'ouverture, de fermeture, de courbe du banc existe dans zoom-icone ; les familles branchées', () => {
  for (const v of VARIANTES.filter(x => x.famille === 'ouvrir')) assert.ok(OUVRIR.includes(v.id), v.id);
  for (const v of VARIANTES.filter(x => x.famille === 'fermer')) assert.ok(FERMER.includes(v.id), v.id);
  for (const v of VARIANTES.filter(x => x.famille === 'courbe')) assert.ok(COURBES[v.id], v.id);
  const r = { x: 40, y: 500, width: 60, height: 60 };
  assert.equal(clesOuvrir('ouvrir-fondu', r, 390, 844, 0, 0), null, 'le fondu : le CSS s\'en charge');
  assert.match(clesOuvrir('ouvrir-cercle', r, 390, 844, 0, 0).kf[0].clipPath, /^circle\(30\.0px at 70\.0px 530\.0px\)$/, 'le cercle part du centre de l\'icône');
  assert.equal(clesFermer('fermer-point', null, true, 390, 844, 0, 0, 390, 844).kf.at(-1).transform, 'scale(0)');
  assert.deepEqual(BRANCHEES, ['ouvrir', 'fermer', 'courbe', 'cascade']);
  const css = readFileSync(new URL('../src/app/app.css', import.meta.url), 'utf8');
  for (const k of ['aucune', 'centre', 'vague']) assert.ok(css.includes('html.px-cascade-' + k), k);
});
