// Le marketplace (dépôt) avec un faux serveur et boxion_local en mémoire, puis un ploxion installé ouvert pour de vrai par le routeur (jsdom).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { creerDepot } from '../src/marketplace/depot.js';
import { page, attendre } from './aide.mjs';

const BUNDLE = (id, txt = 'v1') => `window.jOSApps=window.jOSApps||{};window.jOSApps[${JSON.stringify(id)}]={manifest:{id:${JSON.stringify(id)}},mount(h){h.innerHTML='<b>${txt}</b>';return{unmount(){h.innerHTML=''}}}};`;
function serveur() {
  const s = { enLigne: true, appels: [], js: { 'pomo': BUNDLE('pomo') }, etag: { 'pomo': '"e1"' } };
  s.http = { async get(url, { headers = {} } = {}) {
    s.appels.push(url); if (!s.enLigne) throw new Error('hors ligne');
    if (url.endsWith('/px/registry.json')) return { status: 200, texte: JSON.stringify([
      { id: 'pomo', name: 'Pomodoro', icon: '🍅', hasScreen: true, enabled: true, admin: false, status: 'live', description: 'minuteur', cat_label: 'Temps' },
      { id: 'secret', name: 'Admin', hasScreen: true, enabled: true, admin: true, status: 'live' },
      { id: 'idee', name: 'Idée', hasScreen: false, enabled: true, status: 'idea' } ]), entetes: {} };
    const m = url.match(/\/px\/([^/]+)\/app\.js$/); const id = m && decodeURIComponent(m[1]);
    if (!s.js[id]) return { status: 404, texte: '', entetes: {} };
    if (headers['If-None-Match'] && headers['If-None-Match'] === s.etag[id]) return { status: 304, texte: '', entetes: {} };
    return { status: 200, texte: s.js[id], entetes: { etag: s.etag[id] } };
  } };
  return s;
}

test('catalogue : filtré (écrans publics), badges de compat, en cache pour le mode avion', async () => {
  const s = serveur(), boxion = creerMemoire();
  const d = creerDepot({ boxion, http: s.http, compat: { pomo: { verdict: 'pret', complet: 'oui' } } });
  const c = await d.catalogue();
  assert.deepEqual(c.items.map(x => x.id), ['pomo'], 'ni admin, ni idée');
  assert.equal(c.items[0].compat.complet, 'oui'); assert.equal(c.horsLigne, false);
  s.enLigne = false;
  const c2 = await d.catalogue();
  assert.equal(c2.horsLigne, true); assert.deepEqual(c2.items.map(x => x.id), ['pomo'], 'le catalogue du dernier passage en ligne');
});

test('installer : vérifié, haché, rangé dans boxion_local ; refus d\'un faux bundle ; mise à jour par ETag ; retirer', async () => {
  const s = serveur(), boxion = creerMemoire(), d = creerDepot({ boxion, http: s.http });
  const r = await d.installer('pomo', { nom: 'Pomodoro', icone: '🍅' });
  assert.match(r.hash, /^[0-9a-f]{64}$/);
  assert.ok((await d.bundle('pomo')).endsWith(BUNDLE('pomo')));
  assert.deepEqual((await d.installes()).map(x => x.id), ['pomo']);
  s.js.faux = '<html>pas un ploxion</html>';
  await assert.rejects(() => d.installer('faux'), /pas un ploxion installable/);
  await assert.rejects(() => d.installer('absent'), /HTTP 404/);
  assert.deepEqual(await d.aJour(), [{ id: 'pomo', etat: 'a-jour' }], '304 : à jour');
  s.js.pomo = BUNDLE('pomo', 'v2'); s.etag.pomo = '"e2"';
  assert.deepEqual(await d.aJour(), [{ id: 'pomo', etat: 'mis-a-jour' }]);
  assert.match(await d.bundle('pomo'), /v2/);
  s.enLigne = false;
  assert.equal(await d.bundle('pomo') !== null, true, 'le bundle reste disponible hors ligne');
  await d.retirer('pomo');
  assert.equal(await d.bundle('pomo'), null); assert.deepEqual(await d.installes(), []);
  assert.ok((await boxion.lire('tsoins', { kind: 'marketplace' })).length >= 3, 'chaque geste est un tsoin');
});

test('pack hors ligne : installable sans réseau', async () => {
  const s = serveur(); s.enLigne = false;
  const boxion = creerMemoire();
  const d = creerDepot({ boxion, http: s.http, packLocal: [{ id: 'local', nom: 'Local', icone: '📦' }], lireLocal: async () => BUNDLE('local') });
  await d.installerLocal('local');
  assert.deepEqual((await d.installes()).map(x => [x.id, x.origine]), [['local', 'pack']]);
  assert.deepEqual(s.appels, [], 'aucun appel réseau');
});

test('routeur : un ploxion installé s\'ouvre depuis boxion_local (jamais depuis le réseau), se démonte, et les dossiers se rangent', async () => {
  const s = serveur(), p = await page({ avion: true, ploxions: [] });
  try {
    const d = creerDepot({ boxion: p.boxion, http: s.http });
    await d.installer('pomo', { nom: 'Pomodoro', icone: '🍅' });
    const { creerRouteur } = await import('../src/app/routeur.js');
    const racine = p.w.document.createElement('div'); p.w.document.body.appendChild(racine);
    const r = creerRouteur({ fenetre: p.w, racine, catalogue: [{ id: 'pomo', nom: 'Pomodoro', icone: '🍅' }], boxion: p.boxion, bundleLocal: (id) => d.bundle(id) });
    s.enLigne = false;
    assert.equal(await r.ouvrir('pomo'), true);
    assert.match(racine.querySelector('.px-hote').innerHTML, /v1/, 'monté depuis le bundle installé');
    await r.accueil();
    assert.equal(racine.querySelector('.px-hote'), null);
    p.w.prompt = () => 'Outils';
    racine.querySelector('[data-edition]').click(); await attendre(30);
    racine.querySelector('[data-id="pomo"]').click(); await attendre(30);
    assert.deepEqual((await p.boxion.get('reglages', 'accueil')).dossiers, [{ nom: 'Outils', ids: ['pomo'] }]);
    assert.ok(racine.querySelector('[data-dossier="0"]'), 'le dossier apparaît sur l\'accueil');
  } finally { p.w.close(); }
});

test('dépendances : les bions déclarés par le bundle s\'installent avec lui (sauf ceux du shim), et passent avant lui', async () => {
  const s = serveur(), boxion = creerMemoire();
  s.js.galerie = '(function(){var B=window.__PLOXIONS_BIONS__=window.__PLOXIONS_BIONS__||{};B["galerie"]=["jOSXerkionHub","jOSPorts","jOSAbsent"];})();\n' + BUNDLE('galerie');
  const get = s.http.get;
  s.http.get = async (url, o) => url.endsWith('/px/bion-app/jOSXerkionHub.js') ? { status: 200, texte: 'window.jOSXerkionHub=window.jOSXerkionHub||{};', entetes: {} } : url.includes('/px/bion-app/') ? { status: 404, texte: '', entetes: {} } : get(url, o);
  const d = creerDepot({ boxion, http: s.http });
  const r = await d.installer('galerie');
  assert.deepEqual(r.bions, ['jOSXerkionHub']); assert.deepEqual(r.manquants, ['jOSAbsent'], 'jOSPorts vient du shim, jOSAbsent est introuvable');
  const b = await d.bundle('galerie');
  assert.ok(b.indexOf('window.jOSXerkionHub') < b.indexOf('jOSApps'), 'le bion passe avant le ploxion');
});
