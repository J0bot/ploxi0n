// ◫ (0.99.29) la carte hors ligne : garder les tuiles (sans Cache API : boxion_local), les relire, sauter celles déjà là, compter les échecs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { creerCacheTuiles } from '../src/app/carte-tuiles.js';

test('◫ garder la carte du coin, puis la relire hors ligne', async () => {
  const boxion = creerMemoire(), appels = [];
  const charger = async (u) => { appels.push(u); if (u.endsWith('/casse.png')) return new Response('', { status: 404 }); return new Response(new Blob([new Uint8Array([137, 80, 78, 71, 1, 2, 3])], { type: 'image/png' })); };
  const c = creerCacheTuiles({ W: { btoa: globalThis.btoa }, boxion, charger, parallele: 2 });
  const l = ['https://t/a.png', 'https://t/b.png', 'https://t/casse.png'].map(url => ({ url })), prog = [];
  const r = await c.garder(l, { surProgres: (p) => prog.push(p.fait) });
  assert.deepEqual(r, { fait: 3, total: 3, echecs: 1 }); assert.deepEqual(prog.sort(), [1, 2, 3]);
  assert.match(await c.src('https://t/a.png'), /^data:image\/png;base64,iVBORw/); assert.equal(await c.src('https://t/inconnue.png'), null);
  assert.equal(await c.combien(l), 2);
  await c.garder(l); assert.equal(appels.filter(u => u.endsWith('a.png')).length, 1, 'déjà là : pas retéléchargée');
});
