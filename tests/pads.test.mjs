// ○ □ (0.92) le wormion et le portion, des trackpads : tourner fait défiler le temps (un cran tous les 30°), lâcher ouvre ; glisser le portion
// donne une direction (← → ↑ ↓), avec le grain du banc trackpad ; un toucher garde l'action d'avant
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ecartAngle, directionDe, creerPadWormion, creerPadPortion, CRAN_ANGLE } from '../src/app/pads.js';
import { page } from './aide.mjs';

test('○ □ les petites règles : l\'écart d\'angle, la direction d\'un glisser', () => {
  assert.ok(Math.abs(ecartAngle(Math.PI - 0.1, -Math.PI + 0.1) - 0.2) < 1e-9, 'passer par ±π');
  assert.equal(directionDe(5, 3), null); assert.equal(directionDe(-60, 10), 'gauche'); assert.equal(directionDe(10, -50), 'haut'); assert.equal(directionDe(0, 40), 'bas');
});

function pad(W, html) {
  const el = W.document.createElement('div'); el.innerHTML = html; W.document.body.appendChild(el);
  el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 200 });
  const ev = (t, x, y) => el.dispatchEvent(new W.PointerEvent(t, { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
  return { el, ev };
}

test('○ le wormion : tourner (horaire) avance dans le temps, l\'autre sens revient ; lâcher ouvre ; un toucher : ⧉', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, { el, ev } = pad(W, '<b data-pad-l></b><small data-pad-s></small><i data-pad-a></i>');
    const choix = [], touches = [], vib = [];
    creerPadWormion({ W, el, vibrer: (x) => vib.push(x), liste: () => [{ id: 'a', nom: 'A' }, { id: 'b', nom: 'B' }, { id: 'c', nom: 'C' }], choisir: (id) => choix.push(id), toucher: () => touches.push(1) });
    // autour du centre (100, 100), à 80 px : un cran tous les 30° (horaire à l'écran) ; au-delà de la liste, borné au dernier
    const pt = (deg) => [100 + 80 * Math.cos(deg * Math.PI / 180), 100 + 80 * Math.sin(deg * Math.PI / 180)];
    ev('pointerdown', ...pt(0));
    for (let d = 10; d <= 50; d += 10) ev('pointermove', ...pt(d));
    assert.equal(el.querySelector('[data-pad-l]').textContent, 'A', '30° à 59° : le premier');
    for (let d = 80; d <= 130; d += 10) ev('pointermove', ...pt(d));
    assert.equal(el.querySelector('[data-pad-l]').textContent, 'C');
    for (let d = 120; d >= 40; d -= 10) ev('pointermove', ...pt(d));
    assert.equal(el.querySelector('[data-pad-l]').textContent, 'A', 'l\'autre sens revient');
    ev('pointerup', ...pt(40));
    assert.deepEqual(choix, ['a']); assert.ok(vib.includes('fx-cran'));
    ev('pointerdown', 150, 100); ev('pointerup', 150, 100);
    assert.deepEqual(touches, [1], 'un toucher sans tourner : ⧉');
    assert.ok(CRAN_ANGLE > 0.5 && CRAN_ANGLE < 0.53);
  } finally { p.fin(); }
});

test('□ le portion : glisser → une direction (dite pendant le geste), avec le grain ; lâcher la fait ; un toucher : la map', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, { el, ev } = pad(W, '<b data-pad-l></b><small data-pad-s></small><i data-pad-p></i>');
    const faits = [], touches = [], vib = [];
    creerPadPortion({ W, el, vibrer: (x) => vib.push(x), faire: (d) => faits.push(d), toucher: () => touches.push(1) });
    ev('pointerdown', 100, 100); for (let x = 95; x >= 30; x -= 5) ev('pointermove', x, 102);
    assert.match(el.querySelector('[data-pad-l]').textContent, /l'app d'avant/); assert.equal(el.getAttribute('data-dir'), 'gauche');
    ev('pointerup', 30, 102);
    assert.deepEqual(faits, ['gauche']); assert.ok(vib.filter(x => x === 'fx-cran').length >= 3, 'le grain : un cran tous les 14 px');
    ev('pointerdown', 100, 100); for (let y = 95; y >= 40; y -= 5) ev('pointermove', 101, y); ev('pointerup', 101, 40);
    assert.deepEqual(faits, ['gauche', 'haut']);
    ev('pointerdown', 100, 100); ev('pointerup', 102, 101);
    assert.deepEqual(touches, [1]);
  } finally { p.fin(); }
});
