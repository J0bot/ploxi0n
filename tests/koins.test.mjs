// ◺◿ (0.89) les koins remplacent le dock et le HUD (le carnet de RS-7) : ils grandissent d'un toucher à l'autre jusqu'aux cases ; une case agit
// et replie ; la barre des glyphes ; l'option coupée, rien ne reste
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerKoins, ETAPES } from '../src/app/koins.js';
import { GLYPHES } from '../src/app/glyphes.js';
import { page } from './aide.mjs';

test('◇ les glyphes du carnet : xeroction, tsoin, wormion, trion, portion, ploxion, xer', () => {
  for (const n of ['xeroction', 'tsoin', 'wormion', 'trion', 'portion', 'ploxion', 'xer']) assert.ok(GLYPHES[n] && GLYPHES[n].length > 20, n);
  assert.equal((GLYPHES.trion.match(/<polygon/g) || []).length, 3, 'trois triangles emboîtés');
  assert.equal((GLYPHES.ploxion.match(/<polygon/g) || []).length, 3, 'trois losanges emboîtés');
});

test('◺◿ un toucher : une étape ; à la dernière, les quatre cases et la barre des glyphes ; une case agit et replie', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document; let on = true; const faits = [];
    const actions = Object.fromEntries(['koins', 'temps', 'xers', 'carte', 'tsoin', 'accueil', 'toi', 'retour', 'minimiser', 'journal'].map(k => [k, () => faits.push(k)]));
    const k = creerKoins({ W, actif: () => on, actions });
    k.poser();
    assert.ok(D.documentElement.classList.contains('px-koins'), 'le dock et la barre laissent la place');
    const g = D.querySelector('[data-koin="gauche"]');
    for (let i = 1; i < ETAPES; i++) { g.click(); assert.equal(g.getAttribute('data-etape'), String(i)); }
    assert.equal(D.querySelector('[data-cases="gauche"]').hidden, false); assert.equal(D.querySelector('[data-cases="droite"]').hidden, false);
    assert.deepEqual([...D.querySelectorAll('[data-cases] [data-koin-a]')].map(b => b.getAttribute('data-koin-a')), ['koins', 'xers']);
    assert.deepEqual([...D.querySelectorAll('[data-cases] [data-pad]')].map(b => b.getAttribute('data-pad')), ['wormion', 'portion'], '(0.92) des trackpads');
    assert.equal(D.querySelectorAll('.px-koin-barre [data-koin-a]').length, 8);
    // un toucher sur le portion (sans glisser) : la carte (la map)
    const pad = D.querySelector('[data-pad="portion"]');
    pad.dispatchEvent(new W.PointerEvent('pointerdown', { clientX: 50, clientY: 50, bubbles: true })); pad.dispatchEvent(new W.PointerEvent('pointerup', { clientX: 51, clientY: 50, bubbles: true }));
    assert.deepEqual(faits, ['carte']); assert.deepEqual(k.etape(), { gauche: 0, droite: 0 }, 'replié');
    assert.equal(D.querySelector('[data-cases="gauche"]').hidden, true);
    // le voile replie
    D.querySelector('[data-koin="droite"]').click(); assert.equal(D.querySelector('.px-koin-voile').hidden, false);
    D.querySelector('.px-koin-voile').click(); assert.deepEqual(k.etape(), { gauche: 0, droite: 0 });
    on = false; k.poser();
    assert.ok(!D.documentElement.classList.contains('px-koins')); assert.equal(D.querySelector('.px-koins-r'), null);
  } finally { p.fin(); }
});
