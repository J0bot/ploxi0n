// ◇ (0.99.67, RS-7 coord #2243) « faut améliorer le xer de ploxi0n, pck je suis en mode chill-tekk et j'adore » : le chill-tekk plus fin (le trait
// des xers du Figma, une lueur douce, jamais de gros néon) et plus vivant (une respiration lente, en CSS), son esprit gardé ; rien en mode Calme.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const CSS = readFileSync(new URL('../src/app/app.css', import.meta.url), 'utf8');
const regle = (sel) => { const i = CSS.indexOf(sel + '{'); assert.ok(i >= 0, 'la règle ' + sel); return CSS.slice(i + sel.length + 1, CSS.indexOf('}', i)); };
const nombre = (decl, prop) => { const m = new RegExp('(?:^|;)' + prop + ':([\\d.]+)').exec(decl); return m ? +m[1] : null; };

test('◇ le chill-tekk plus fin : les traits de la bande et des koins affinés, la lueur adoucie (plus fins que la base, seulement en chill-tekk)', () => {
  assert.ok(nombre(regle('html.px-m-chill-tekk .px-koin-barre>button .px-g'), 'stroke-width') < nombre(regle('.px-koin-barre>button .px-g'), 'stroke-width'), 'les glyphes de la bande');
  assert.ok(nombre(regle('html.px-m-chill-tekk .px-koin svg'), 'stroke-width') < nombre(regle('.px-koin svg'), 'stroke-width'), 'les koins');
  assert.ok(nombre(regle('html.px-m-chill-tekk :is(.px-koin-cases>button,.px-koin-pad) .px-g,html.px-m-chill-tekk .px-koin-pad .px-pad-g .px-g'), 'stroke-width') < 3.4, 'les cases du koin ouvert');
  const lueur = regle('html.px-m-chill-tekk:not(.px-calme) .px-koin-barre>button .px-g'), base = regle('html:not(.px-calme) .px-koin-barre>button .px-g');
  const flou = (d) => +/drop-shadow\(0 0 ([\d.]+)px/.exec(d)[1], force = (d) => +/var\(--acc\) (\d+)%/.exec(d)[1];
  assert.ok(flou(lueur) < flou(base) && force(lueur) < force(base), 'une lueur plus douce que la base (pas de gros néon)');
});

test('◇ le chill-tekk plus vivant : une respiration lente (opacité, CSS seul) sur les koins et le ploxion où tu es ; coupée en Calme et avec Réduire les animations', () => {
  const i = CSS.indexOf('@media (prefers-reduced-motion:no-preference){\n  html.px-m-chill-tekk'); assert.ok(i >= 0, 'seulement si iOS ne demande pas de réduire les animations');
  const bloc = CSS.slice(i, CSS.indexOf('\n}', i));
  for (const s of ['html.px-m-chill-tekk:not(.px-calme) .px-koin>svg{animation:px-ct-souffle 6s', 'html.px-m-chill-tekk:not(.px-calme) .px-koin-barre .px-kb-dans>svg{animation:px-ct-souffle 4.5s']) assert.ok(bloc.includes(s), s);
  assert.ok(!/html\.px-m-chill-tekk(?!:not\(\.px-calme\))[^{]*\{animation/.test(bloc), 'jamais en mode Calme');
  const k = /@keyframes px-ct-souffle\{([^]*?)\}\}/.exec(CSS); assert.ok(k, 'la respiration');
  assert.deepEqual([...new Set([...k[1].matchAll(/([a-z-]+):/g)].map(m => m[1]))], ['opacity'], 'de l\'opacité seulement (composée, pas de repeinte)');
  assert.doesNotMatch(readFileSync(new URL('../src/app/koins.js', import.meta.url), 'utf8'), /requestAnimationFrame/, 'aucune boucle JS (le Pi 4)');
});
