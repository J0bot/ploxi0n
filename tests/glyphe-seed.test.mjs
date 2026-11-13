// ◇ (0.99.56) jOSGlyphe : un glyphe à graine, stable, le même partout ; plus aucun emoji dans l'app (même ceux hors du dictionnaire)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { graine, specGlyphe, glypheSeed, glypheEmoji, PALETTES, CENTRES, FORMES } from '../src/bions/glyphe-seed.js';
import { glyphePloxion, versGlyphe } from '../src/app/glyphes.js';
import { envelopper } from '../tools/bion-glyphe.mjs';
import { installerSansEmoji } from '../src/app/sans-emoji.js';
import { page } from './aide.mjs';

test('◇ la même graine, le même glyphe ; des graines différentes, des glyphes variés', () => {
  assert.equal(glypheSeed('mappion'), glypheSeed('mappion'));
  assert.equal(graine(42), 42); assert.equal(graine('a'), graine('a')); assert.notEqual(graine('a'), graine('b'));
  const vus = new Set(), pal = new Set(), cen = new Set(), for_ = new Set();
  for (let i = 0; i < 300; i++) { const s = specGlyphe('px-' + i); vus.add(s.forme + s.centre + s.niveaux + s.palette); pal.add(s.palette); cen.add(s.centre); for_.add(s.forme); }
  assert.equal(pal.size, PALETTES.length); assert.equal(cen.size, CENTRES.length); assert.equal(for_.size, FORMES.length);
  assert.ok(vus.size > 120, 'beaucoup de combinaisons : ' + vus.size);
});

test('◇ tiré comme un xerkion du labo : une graine numérique donne la couleur et le centre de jOSXerkion', () => {
  // le générateur de jOSXerkion (labo, /px/bion-app/jOSXerkion.js) recopié ici pour figer l'accord
  const rng = (seed) => { let s = seed >>> 0 || 1; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; };
  for (const seed of [1, 4200, 77777, 123456789]) {
    const r = rng(seed), col = PALETTES[Math.floor(r() * 6)][0], centre = CENTRES[Math.floor(r() * 3)];
    const s = specGlyphe(seed); assert.equal(s.couleur, col, 'couleur ' + seed); assert.equal(s.centre, centre, 'centre ' + seed);
  }
});

test('◇ le SVG : viewBox 100, le trait en currentColor, la couleur de sa palette sur demande, un titre lisible', () => {
  const g = glypheSeed('x');
  assert.match(g, /^<svg class="px-g px-g-seed" viewBox="0 0 100 100"/); assert.match(g, /aria-hidden="true"/); assert.ok(!/style=/.test(g));
  assert.match(glypheSeed('x', { couleur: true }), new RegExp('style="color:' + specGlyphe('x').couleur + '"'));
  assert.match(glypheSeed('x', { titre: 'mappion' }), /role="img" aria-label="mappion"/);
  assert.equal(glypheEmoji('🦄️'), glypheEmoji('🦄'), 'le sélecteur de variante ne change rien');
  assert.notEqual(glypheEmoji('🦄'), glypheEmoji('🐙'));
});

test('◇ glyphePloxion et versGlyphe passent par le bion commun ; un emoji inconnu ne redevient jamais le point', () => {
  assert.equal(glyphePloxion({ id: 'zq-xx-inconnu' }), glypheSeed('zq-xx-inconnu'));
  assert.match(glyphePloxion({ id: 'spotify' }), /class="px-g"/, 'un ploxion connu par ses mots garde son glyphe');
  assert.equal(versGlyphe('🦄'), glypheEmoji('🦄'));
});

test('◇ servi seul pour le labo : public/bions/jOSGlyphe.js est à jour avec src/bions/glyphe-seed.js', () => {
  const src = readFileSync(new URL('../src/bions/glyphe-seed.js', import.meta.url), 'utf8');
  const pub = readFileSync(new URL('../public/bions/jOSGlyphe.js', import.meta.url), 'utf8');
  assert.equal(pub, envelopper(src), 'relancer : node tools/bion-glyphe.mjs');
  const w = {}; new Function('window', 'module', pub)(w, undefined);
  assert.equal(w.jOSGlyphe.glypheSeed('mappion'), glypheSeed('mappion'), 'le même glyphe au labo');
});

test('◇ sans-emoji : dans tous les ploxions (le labo aussi), un emoji inconnu devient son glyphe ; ce qu\'on écrit garde ses signes', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document;
    const h = D.createElement('div'); h.className = 'px-hote'; h.dataset.ploxion = 'un-ploxion-du-labo';
    h.innerHTML = '<p data-t>salut 🦄 ici</p><p data-ecrit>🦄 à moi</p>'; D.body.appendChild(h);
    installerSansEmoji({ W, interne: () => true });
    const t = D.querySelector('[data-t]');
    assert.ok(!/🦄/.test(t.textContent), 'l\'emoji est parti'); assert.ok(t.querySelector('svg.px-g-seed'), 'son glyphe à graine est là');
    assert.match(D.querySelector('[data-ecrit]').textContent, /🦄/);
  } finally { p.fin(); }
});
