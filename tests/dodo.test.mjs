// ☾ (0.64) dodo / réveil : un toucher dans le tsoin ; la nuit dite à côté de la nuit mesurée (la Garmin, par Apple Santé)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comparerNuit, ligneNuit } from '../src/natif/sante.js';
import { page, attendre } from './aide.mjs';

test('☾ comparerNuit : la latence d\'endormissement et l\'écart au réveil, la source (la montre)', () => {
  const j = (h, m = 0) => new Date(2026, 9, 14, h, m).toISOString(), v = (h, m = 0) => new Date(2026, 9, 13, h, m).toISOString();
  const tsoins = [{ genre: 'dodo', le: v(23, 41) }, { genre: 'reveil', le: j(7, 30) }, { genre: 'fait', le: j(8) }];
  const samples = [{ sleepState: 'awake', startDate: v(23, 45), endDate: j(0, 12), sourceName: 'Connect' }, { sleepState: 'light', startDate: j(0, 12), endDate: j(3), sourceName: 'Connect' }, { sleepState: 'deep', startDate: j(3), endDate: j(7, 12), sourceName: 'Connect' }];
  const c = comparerNuit(tsoins, samples, new Date(2026, 9, 14, 9).getTime());
  assert.equal(c.latence, 31, '31 min pour s\'endormir');
  assert.equal(c.ecartReveil, 18, 'levé 18 min après la fin du sommeil');
  assert.equal(c.source, 'Connect');
  assert.match(ligneNuit(c), /31 min pour t'endormir/);
  assert.equal(comparerNuit([{ genre: 'dodo', le: v(23) }], [], new Date(2026, 9, 15, 12).getTime()), null, 'un dodo vieux de plus de 20 h ne compte plus');
});

test('☾ le composeur : ☾ dodo note l\'heure d\'un toucher, sans rien écrire, et se ferme', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { creerTsoinNatif } = await import('../src/natif/tsoin-natif.js');
    const t = creerTsoinNatif({ W: p.w, boxion: p.boxion });
    const fin = t.ouvrir();
    await attendre(10);
    const b = p.w.document.querySelector('[data-vite="dodo"]'); assert.ok(b, 'la rangée santé');
    b.click();
    const e = await fin;
    assert.equal(e.genre, 'dodo'); assert.equal(e.d, 'dodo');
    assert.ok(!p.w.document.querySelector('.px-tsoin'), 'fermé');
    assert.equal((await t.liste())[0].genre, 'dodo');
  } finally { p.fin(); }
});
