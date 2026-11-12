// 🎞 (0.99.51) le banc des animations : le catalogue (des familles, un « actuel » par famille), le texte pour Claude, jOSSwipe embarqué
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { FAMILLES, VARIANTES, resume } from '../src/lot/banc-anim.js';

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
});
