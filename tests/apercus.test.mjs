// 📸 (0.72) la capture d'écran garde la photo du xer (le cache du téléphone) ; la vue des xers la montre pour une app fermée
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerApercus } from '../src/natif/apercus.js';
import { creerVueXers } from '../src/app/vue-xers.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { page } from './aide.mjs';

test('📸 capturer : le natif rend le chemin, l\'index le garde ; src passe par convertFileSrc ; hors iPhone, rien', async () => {
  const boxion = creerMemoire(), appels = [];
  const W = { Capacitor: { isNativePlatform: () => true, convertFileSrc: (c) => 'capacitor://localhost/_capacitor_file_' + c } };
  const plugin = { capturerXer: async (o) => { appels.push(o.id); return { chemin: '/caches/xers/' + o.id + '.jpg' }; } };
  const a = creerApercus({ W, boxion, plugin });
  await a.capturer('bother'); await a.capturer('·');
  assert.deepEqual(appels, ['bother', 'accueil']);
  assert.match(a.src('bother'), /^capacitor:\/\/localhost\/_capacitor_file_\/caches\/xers\/bother\.jpg\?v=\d+$/);
  assert.ok((await boxion.get('reglages', 'apercus'))['·'], 'l\'accueil aussi');
  a.oublier('bother'); assert.equal(a.src('bother'), null);
  const web = creerApercus({ W: {}, boxion, plugin });
  assert.equal(await web.capturer('x'), null);
});

test('📸 la vue des xers montre la photo gardée d\'une app fermée (et l\'oublie si iOS l\'a effacée)', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, racine = W.document.createElement('div'); W.document.body.appendChild(racine); const oublies = [];
    const v = creerVueXers({ W, racine, liste: () => [{ id: 'a', nom: 'A' }], places: async () => ({ a: [2, 0] }), courant: () => null,
      photo: (id) => (id === 'a' ? 'capacitor://localhost/a.jpg?v=1' : null), oublierPhoto: (id) => oublies.push(id), calme: () => true });
    const el = await v.ouvrir();
    const img = el.querySelector('.px-vx-droite .px-vx-photo img');
    assert.ok(img, 'la photo de a, à droite de l\'accueil'); assert.equal(img.getAttribute('src'), 'capacitor://localhost/a.jpg?v=1');
    img.onerror(); assert.deepEqual(oublies, ['a']);
    v.fermer();
  } finally { p.fin(); }
});
