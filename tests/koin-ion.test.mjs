// ◬ (0.71) le koin du ion : les dossiers ion, 3ion, seption, nexus semés dans les hubs perso ; la balade entre les réels au glisser
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HUBS_DU_REEL, fusionner, semerKoinIon, VERSION_KOIN } from '../src/terrax/koin-ion.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';

const parId = new Map(HUBS_DU_REEL.map(h => [h.id, h]));

test('◬ le koin du ion : les 4 dossiers + les primitives ; les portails font la balade (droite : le palier d\'après, gauche : d\'avant, haut : le koin)', () => {
  const k = parId.get('xerkion-perso-koin-ion');
  assert.deepEqual(k.koins.slice(0, 4).map(x => x.label), ['ion', '3ion', 'seption', 'nexus']);
  assert.ok(k.koins.length <= 12, 'le cercle des koins : 12 au plus');
  for (const x of k.koins.slice(0, 4)) assert.match(x.ploxion, /^xerkion-/, 'un dossier = un hub');
  const marche = ['xerkion-perso-r-ion', 'xerkion-perso-r-3ion', 'xerkion-perso-r-seption'];
  for (let i = 0; i < 3; i++) {
    const h = parId.get(marche[i]);
    assert.equal(h.portals[0], marche[(i + 1) % 3], marche[i] + ' → à droite, le palier suivant (le seption reboucle au ion)');
    assert.equal(h.portals[2], 'xerkion-perso-koin-ion', 'en haut : on ressort au koin du ion');
    assert.equal(h.portals[3], 'xerkion-perso-r-nexus', 'en bas : le nexus');
  }
  for (const h of HUBS_DU_REEL) { assert.equal(h.template, 'hub'); assert.ok(h.essence.length <= 8); assert.ok(h.portals.length <= 4); }
});

test('◬ semer : ajoute ce qui manque, garde les hubs de RS-7, ne réécrit pas un hub semé qu\'il a retouché', async () => {
  const mien = { id: 'xerkion-perso-a-moi', nom: 'à moi', template: 'hub', koins: [] };
  const r1 = fusionner([mien]); assert.equal(r1.n, HUBS_DU_REEL.length); assert.equal(r1.liste[0], mien);
  assert.equal(fusionner(r1.liste).n, 0, 'déjà semé : rien');
  const retouche = r1.liste.map(h => (h.id === 'xerkion-perso-r-ion' ? { ...h, nom: 'mon ion', version: 0 } : h));
  const neuf = HUBS_DU_REEL.map(h => ({ ...h, version: VERSION_KOIN + 1 }));
  const r2 = fusionner(retouche, neuf, HUBS_DU_REEL);
  assert.equal(r2.liste.find(h => h.id === 'xerkion-perso-r-ion').nom, 'mon ion', 'retouché : il est à RS-7');
  const ls = new Map(), W = { localStorage: { getItem: (k) => (ls.has(k) ? ls.get(k) : null), setItem: (k, v) => ls.set(k, v) } }, boxion = creerMemoire();
  assert.equal(await semerKoinIon({ W, boxion }), HUBS_DU_REEL.length);
  assert.equal(JSON.parse(ls.get('store:xerkions-persos:items')).length, HUBS_DU_REEL.length);
  assert.equal((await boxion.get('box:xerkions-persos', 'items')).data.length, HUBS_DU_REEL.length, 'jOSBoxion le lit aussi');
  assert.equal(await semerKoinIon({ W, boxion }), 0);
});
