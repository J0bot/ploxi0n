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

test('pack hors ligne : les bions du ploxion (bother → jOSGpg, jOSBug) viennent du pack aussi, une seule fois', async () => {
  const s = serveur(); s.enLigne = false;
  const boxion = creerMemoire(), lus = [];
  const d = creerDepot({ boxion, http: s.http, packLocal: [{ id: 'local', nom: 'Local', icone: '📦', bions: ['jOSGpg', 'jOSAbsent'] }], lireLocal: async () => BUNDLE('local'),
    lireBionLocal: async (b) => { lus.push(b); if (b === 'jOSAbsent') throw new Error('absent'); return 'window.' + b + '={};'; } });
  await d.installerLocal('local');
  assert.deepEqual((await boxion.get('ploxions', 'local')).bions, ['jOSGpg']);
  assert.match(await d.bundle('local'), /window\.jOSGpg=\{\};[\s\S]*local/);
  await d.installerLocal('local');
  assert.deepEqual(lus, ['jOSGpg', 'jOSAbsent', 'jOSAbsent'], 'un bion déjà là ne se relit pas');
  assert.deepEqual(s.appels, []);
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
    racine.querySelector('[data-ranger="dossier"]').click(); await attendre(30);
    assert.deepEqual((await p.boxion.get('reglages', 'accueil')).dossiers, [{ nom: 'Outils', ids: ['pomo'] }]);
    assert.ok(racine.querySelector('[data-dossier="0"]'), 'le dossier apparaît sur l\'accueil');
    // une PAGE : le ploxion quitte son dossier (un seul endroit), la page apparaît, avec ses points
    p.w.prompt = () => 'Travail';
    r.majCatalogue([{ id: 'pomo', nom: 'Pomodoro', icone: '🍅' }, { id: 'autre', nom: 'Autre', icone: '◇' }]); await r.accueil();
    racine.querySelector('[data-dossier="0"]').click(); await attendre(10);
    racine.querySelector('[data-id="pomo"]').click(); await attendre(10);   // depuis l'intérieur du dossier
    racine.querySelector('[data-ranger="page"]').click(); await attendre(30);
    const doc = await p.boxion.get('reglages', 'accueil');
    assert.deepEqual([doc.dossiers, doc.pages], [[], [{ nom: 'Travail', ids: ['pomo'] }]]);
    assert.equal(racine.querySelectorAll('.px-page').length, 2); assert.equal(racine.querySelectorAll('.px-point').length, 2);
    assert.ok(racine.querySelector('.px-page[data-page="1"] [data-id="pomo"]') && racine.querySelector('.px-page[data-page="0"] [data-id="autre"]'));
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

test('l\'interface du marketplace : cache d\'abord, recherche en mémoire (sans accents), cinq vues, fiche, installer depuis la fiche, découvrir', async () => {
  const { chercher, enregistrerMarketplace, VUES } = await import('../src/marketplace/marketplace.js');
  const items = [{ id: 'meteo', nom: 'Météo', description: 'le temps qu\'il fait', categorie: 'Maison & Vie', fournit: ['weather'] }, { id: 'pomo', nom: 'Pomodoro', description: 'minuteur', categorie: 'Temps', fournit: [] },
    { id: 'carte', nom: 'Carte du monde', description: 'avec la météo', categorie: 'Cartes', fournit: [] }];
  assert.deepEqual(chercher(items, 'meteo').map(x => x.id), ['meteo', 'carte'], 'le nom avant la description, sans accents');
  assert.deepEqual(chercher(items, 'xyz car').map(x => x.id), [], 'un mot introuvable suffit à écarter');
  assert.deepEqual(chercher(items, 'car mon').map(x => x.id), ['carte'], 'tous les mots, dans n\'importe quel ordre');
  assert.deepEqual(chercher(items, 'weather').map(x => x.id), ['meteo'], 'ce qu\'il fournit');

  const s = serveur(), boxion = creerMemoire(), p = await page({ avion: true, ploxions: [] }), W = p.w;
  const d = creerDepot({ boxion, http: s.http, packLocal: [{ id: 'local', nom: 'Local', icone: '📦' }], lireLocal: async () => BUNDLE('local') });
  await d.catalogue();   // le cache
  s.enLigne = false; s.appels.length = 0;
  let pref = null; const ouverts = [];
  W.jOS.openPloxion = (id) => ouverts.push(id);
  enregistrerMarketplace({ W, depot: d, prefs: { lire: async () => pref, ecrire: async (v) => { pref = v; } } });
  const hote = W.document.createElement('div'); W.document.body.appendChild(hote);
  const inst = W.jOSApps.marketplace.mount(hote, {});
  await inst.ready;
  assert.ok(hote.querySelector('.mk-rayon'), 'la vitrine, depuis le cache, en mode avion');
  assert.match(hote.textContent, /Pomodoro/); assert.match(hote.textContent, /Local/, 'le pack est dans la vitrine');
  for (const [v] of VUES) { hote.querySelector('[data-vue="' + v + '"]').click(); await attendre(10); assert.ok(hote.querySelector('[data-vue="' + v + '"]').classList.contains('on'), v); }
  assert.equal(pref.vue, 'moi', 'la vue est gardée');
  hote.querySelector('[data-vue="liste"]').click(); await attendre(10);
  assert.ok(hote.querySelector('.mk-az [data-az="P"]'), 'la barre de lettres');
  const champ = hote.querySelector('[data-q]'); champ.value = 'pomo'; champ.dispatchEvent(new W.Event('input')); 
  assert.equal(hote.querySelectorAll('.mk-it').length, 1, 'recherche instantanée');
  const appelsAvant = s.appels.length;
  champ.value = 'po'; champ.dispatchEvent(new W.Event('input')); champ.value = 'pom'; champ.dispatchEvent(new W.Event('input'));
  assert.equal(s.appels.length, appelsAvant, 'chercher ne touche jamais le réseau');
  champ.value = ''; champ.dispatchEvent(new W.Event('input'));
  hote.querySelector('[data-vue="grille"]').click(); await attendre(10);
  hote.querySelector('.mk-carte[data-fiche="local"]').click(); await attendre(10);
  const f = hote.querySelector('.mk-feuille'); assert.ok(f, 'la fiche');
  f.querySelector('[data-installer="local"]').click(); await attendre(40);
  assert.deepEqual((await d.installes()).map(x => x.id), ['local'], 'installé depuis le pack, sans réseau');
  hote.querySelector('.mk-feuille [data-ouvrir="local"]').click(); await attendre(10);
  assert.deepEqual(ouverts, ['local']); assert.equal(hote.querySelector('.mk-feuille'), null);
  hote.querySelector('[data-vue="decouvrir"]').click(); await attendre(10);
  assert.equal(hote.querySelector('.mk-dc').getAttribute('data-carte'), 'pomo', 'découvrir : le seul pas encore installé');
  hote.querySelector('[data-passer="pomo"]').click(); await attendre(20);
  assert.match(hote.textContent, /tout vu/); assert.deepEqual(pref.passes, ['pomo']);
  inst.unmount(); p.fin();
});

test('dépendances 0.8 : les bions TOUCHÉS (non déclarés) aussi, récursivement, dépendances d\'abord ; completerBions rattrape les anciens', async () => {
  const s = serveur(), boxion = creerMemoire();
  s.js.xk = BUNDLE('xk') + '\nif (window.jOSXerkion) jOSXerkion.ouvrir();';
  const BIONS = { jOSXerkion: 'window.jOSXerkion={ouvrir(){ if (window.jOSStore) jOSStore.get(); }};', jOSStore: 'window.jOSStore={get(){}};' };
  const get = s.http.get; const demandes = [];
  s.http.get = async (url, o) => { const m = url.match(/\/px\/bion-app\/(\w+)\.js$/); if (m) { demandes.push(m[1]); return BIONS[m[1]] ? { status: 200, texte: BIONS[m[1]], entetes: {} } : { status: 404, texte: '', entetes: {} }; } return get(url, o); };
  const d = creerDepot({ boxion, http: s.http });
  const r = await d.installer('xk');
  assert.deepEqual(r.bions, ['jOSStore', 'jOSXerkion'], 'jOSStore (touché par jOSXerkion) passe avant lui');
  assert.deepEqual(r.manquants, [], 'un bion seulement touché et introuvable n\'est pas « manquant »');
  const b = await d.bundle('xk');
  assert.ok(b.indexOf('window.jOSStore') < b.indexOf('window.jOSXerkion=') && b.indexOf('window.jOSXerkion=') < b.indexOf('jOSApps'));
  // un ploxion installé à l'ancienne (sans ses bions touchés) est complété
  await boxion.put('ploxions', 'xk', { ...(await boxion.get('ploxions', 'xk')), bions: [] });
  const n = demandes.length;
  assert.deepEqual(await d.completerBions(), [{ id: 'xk', avant: 0, apres: 2 }]);
  assert.equal(demandes.length, n, 'les bions déjà là ne se retéléchargent pas');
  assert.deepEqual(await d.completerBions(), [], 'idempotent');
});
