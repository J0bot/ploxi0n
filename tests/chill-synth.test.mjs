// ≋ (0.64) chill-synth, phase 1 : les bandes du bus, l'onset, le critère « le son a tenu en arrière-plan »
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyser, bilanArrierePlan, creerChillSynth } from '../src/chill/chill-synth.js';
import { page, attendre } from './aide.mjs';

test('≋ analyser : 64 bandes 0..1, le niveau, un onset sur un coup de graves (pas deux à moins de 150 ms)', () => {
  const calme = new Uint8Array(128).fill(20), coup = new Uint8Array(128).fill(20); coup.fill(240, 0, 12);
  const e = { moy: 0, dernier: -1e9 };
  for (let t = 0; t < 400; t += 33) analyser(calme, e, t);
  const a = analyser(coup, e, 500);
  assert.equal(a.bandes.length, 64); assert.ok(a.bandes.every(b => b >= 0 && b <= 1));
  assert.equal(a.onset, true, 'le kick');
  assert.equal(analyser(coup, e, 560).onset, false, 'pas deux de suite');
  assert.ok(a.graves > a.aigus);
});

test('≋ le critère de la phase 1 : caché 10 min, la piste a avancé de 10 min → tenu ; de 3 s → coupé', () => {
  assert.deepEqual(bilanArrierePlan({ t: 0, pos: 12 }, { t: 600000, pos: 612 }), { duree: 600, avance: 600, tenu: true });
  assert.equal(bilanArrierePlan({ t: 0, pos: 12 }, { t: 600000, pos: 15 }).tenu, false);
});

test('≋ le ploxion se monte : la source, les deux essais, ▶ ; le bus est exposé', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, c = creerChillSynth({ W, boxion: p.boxion });
    assert.equal(c.ploxion.id, 'chill-synth');
    const h = W.document.createElement('div'); W.document.body.appendChild(h);
    const inst = W.jOSApps['chill-synth'].mount(h);
    assert.ok(h.querySelector('[data-cs-mode="A"].on') && h.querySelector('[data-cs-jouer][disabled]'), 'essai A par défaut, rien à jouer sans piste');
    const u = h.querySelector('[data-cs-url]'); u.value = 'https://exemple.org/nappe.mp3'; u.dispatchEvent(new W.Event('change', { bubbles: true }));
    assert.ok(!h.querySelector('[data-cs-jouer]').disabled);
    h.querySelector('[data-cs-mode="B"]').click(); assert.ok(h.querySelector('[data-cs-mode="B"].on'));
    assert.equal(typeof W.ploxi0nAudio.ecouter, 'function');
    await attendre(5); inst.unmount();
  } finally { p.fin(); }
});
