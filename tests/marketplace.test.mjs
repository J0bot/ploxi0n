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

test('⚙ réglages et HUD composé : éléments, ordre, épinglés, ⚙ toujours sur l\'accueil, mode connecté, verrous', async () => {
  const { creerHud } = await import('../src/app/hud.js');
  const { enregistrerReglages } = await import('../src/app/reglages.js');
  const { creerRouteur } = await import('../src/app/routeur.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w;
  try {
    const boxion = p.boxion; let mc = true;
    const compte = { etat: () => ({ connecte: false }), surChangement: () => () => {}, connecter: async () => {}, deconnecter: async () => {} };
    let routeur = null;
    const hud = creerHud({ W, compte, boxion, trouver: (id) => routeur.catalogue().find(x => x.id === id), modeConnecte: () => mc });
    await hud.pret;
    const depot = { completerBions: async () => [], aJour: async () => [], installes: async () => [{ id: 'pomo', nom: 'Pomodoro', icone: '🍅', origine: 'pack' }], bions: async () => [{ nom: 'jOSGpg', octets: 2048, utilisePar: ['pomo'], coupe: false }], taille: async () => 1500, couperBion: async (n, c) => { coupes.push([n, c]); } }; const coupes = [];
    const reg = enregistrerReglages({ W, compte, hud, routeur: () => routeur, depot, boxion, modeConnecte: (v) => { if (v != null) mc = v; return mc; }, version: 't' });
    const racine = W.document.createElement('div'); W.document.body.appendChild(racine);
    routeur = creerRouteur({ fenetre: W, racine, catalogue: [reg, { id: 'pomo', nom: 'Pomodoro', icone: '🍅' }], boxion, hud });
    hud.surChangement(() => routeur.rafraichirHud());
    await routeur.accueil();
    assert.ok(racine.querySelector('.px-hud [data-reglages]'), '⚙ sur l\'accueil');
    racine.querySelector('[data-reglages]').click(); await attendre(40);
    assert.equal(routeur.courant(), 'reglages-app');
    const h = racine.querySelector('.px-hote');
    assert.ok(racine.querySelector('.px-barre [data-compte]'), 'le HUD compact dans la barre');
    // épingler pomo → il apparaît dans le HUD
    h.querySelector('[data-pin="pomo"]').click(); await attendre(30);
    assert.deepEqual((await boxion.get('reglages', 'hud')).epingles, ['pomo']);
    assert.ok(racine.querySelector('.px-barre [data-hud-px="pomo"]'), 'épinglé dans le HUD');
    // l'heure allumée, puis montée en tête
    const iHeure = hud.config().elements.findIndex(x => x.k === 'heure');
    const cb = h.querySelector('[data-el="' + iHeure + '"]'); cb.checked = true; cb.dispatchEvent(new W.Event('change', { bubbles: true })); await attendre(30);
    assert.ok(racine.querySelector('.px-barre .px-heure'));
    for (let i = hud.config().elements.findIndex(x => x.k === 'heure'); i > 0; i--) { h.querySelector('[data-monter="' + i + '"]').click(); await attendre(20); }
    assert.equal(hud.config().elements[0].k, 'heure');
    // tout éteindre : le ⚙ reste sur l'accueil
    for (let i = 0; i < 5; i++) { const c = h.querySelector('[data-el="' + i + '"]'); if (c.checked) { c.checked = false; c.dispatchEvent(new W.Event('change', { bubbles: true })); await attendre(20); } }
    await routeur.accueil();
    assert.equal(racine.querySelector('.px-hud-c').querySelectorAll('button,span').length, 1); assert.ok(racine.querySelector('[data-reglages]'), 'on ne s\'enferme jamais dehors');
    // le mode connecté
    racine.querySelector('[data-reglages]').click(); await attendre(40);
    const m = racine.querySelector('[data-t="mode"]'); m.checked = false; m.dispatchEvent(new W.Event('change', { bubbles: true })); await attendre(20);
    assert.equal(mc, false);
    // les bions : couper un bion depuis les réglages ; la recherche filtre les lignes
    const hb = racine.querySelector('.px-hote:not([hidden])');   // les réglages sont encore ouverts
    const bc = hb.querySelector('[data-bion-on="jOSGpg"]'); bc.checked = false; bc.dispatchEvent(new W.Event('change', { bubbles: true })); await attendre(20);
    assert.deepEqual(coupes, [['jOSGpg', true]]);
    const q = hb.querySelector('[data-q]'); q.value = 'bion'; q.dispatchEvent(new W.Event('input', { bubbles: true }));
    assert.equal(hb.querySelector('[data-s="compte"]').hidden, true, 'la recherche cache les sections sans rapport'); assert.equal(hb.querySelector('[data-s="bions"]').hidden, false);
    // une configuration reprise d'un ancien format, ou abîmée, se répare
    await hud.regler({ elements: [{ k: 'inconnu', on: true }, { k: 'compte', on: true }, { k: 'compte', on: false }], epingles: ['a', 'b', 'c', 'd', 'e', 3] });
    assert.deepEqual(hud.config().elements.map(x => x.k), ['compte', 'reseau', 'heure', 'chercher', 'epingles']); assert.equal(hud.config().epingles.length, 4);
  } finally { p.fin(); }
});

test('raccourcis 0.9 : « Envoyer à un ploxion » ouvre et émet sur le bus, « Chercher un ploxion », les valeurs publiées', async () => {
  const { creerRaccourcis } = await import('../src/natif/raccourcis.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w;
  try {
    const store = {}; W.Capacitor = { isNativePlatform: () => true };
    const Preferences = { get: async ({ key }) => ({ value: store[key] ?? null }), set: async ({ key, value }) => { store[key] = value; }, remove: async ({ key }) => { delete store[key]; } };
    const ouverts = [], recus = [];
    const routeur = { connait: (id) => ['pomo', 'marketplace'].includes(id), ouvrir: async (id, params) => { ouverts.push([id, params]); return true; } };
    W.jOSPorts.on('ploxion.pomo.cmd', (x) => recus.push(x));
    const r = creerRaccourcis({ W, routeur, boxion: p.boxion, charger: async () => ({ Preferences }) });
    store['ploxi0n.envoyer'] = JSON.stringify({ id: 'pomo', port: 'cmd', payload: 'start 25' });
    store['ploxi0n.chercher'] = 'météo';
    await r.recevoir();
    assert.deepEqual(ouverts[0], ['pomo', { port: 'cmd', payload: 'start 25', texte: 'start 25', depuis: 'raccourci' }]);
    assert.deepEqual(recus, ['start 25'], 'reçu sur le bus');
    assert.deepEqual(ouverts[1], ['marketplace', { chercher: '1', q: 'météo' }]);
    assert.equal(store['ploxi0n.envoyer'], undefined, 'consommé une fois');
    await r.valeur('tsoins-jour', 'Tsoins aujourd\'hui', 3); await r.valeur('px.<script>', 'x', 'y');
    const v = JSON.parse(store['ploxi0n.valeurs']);
    assert.equal(v['tsoins-jour'].valeur, '3'); assert.ok(v['px.script'], 'la clé est nettoyée');
  } finally { p.fin(); }
});

test('📲 tes ploxions en apps : la feuille coche, le labo reçoit des PNG et des ids, Safari s\'ouvre sur le profil', async () => {
  const { creerEcranAccueil } = await import('../src/natif/ecran-accueil.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w;
  try {
    const cat = [{ id: 'pomo', nom: 'Pomodoro', icone: '🍅' }, { id: 'marketplace', nom: 'Marketplace', icone: '🛍', interne: true }];
    const envois = [], ouverts = []; W.open = (u) => ouverts.push(u);
    // un faux canvas qui sait rendre un PNG
    const vrai = W.document.createElement.bind(W.document);
    W.document.createElement = (t) => { const e = vrai(t); if (t === 'canvas') { e.getContext = () => ({ createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }), fillRect() {}, strokeRect() {}, fillText() {} }); e.toDataURL = () => 'data:image/png;base64,iVBORw0KGgo='; } return e; };
    const guider = creerEcranAccueil({ W, trouver: (id) => cat.find(x => x.id === id), liste: () => cat, boxion: p.boxion,
      envoyer: async (q) => { envois.push(q); return { status: 200, texte: JSON.stringify({ url: 'https://xerboxion.org/app/accueil/' + 'a'.repeat(40) }) }; } });
    await guider('pomo');
    const f = W.document.querySelector('.px-voile');
    assert.ok(f.querySelector('[data-c="pomo"].on'), 'le ploxion d\'où l\'on vient est coché');
    f.querySelector('[data-c="marketplace"]').click();
    assert.match(f.querySelector('[data-g="installer"]').textContent, /2 apps/);
    f.querySelector('[data-g="installer"]').click(); await attendre(30);
    const corps = JSON.parse(envois[0].corps);
    assert.equal(envois[0].url, 'https://xerboxion.org/api/app/accueil');
    assert.deepEqual(corps.apps.map(a => a.id), ['pomo', 'marketplace']); assert.ok(corps.apps.every(a => a.icone === 'iVBORw0KGgo='));
    assert.deepEqual(ouverts, ['https://xerboxion.org/app/accueil/' + 'a'.repeat(40)], 'Safari s\'ouvre sur le profil');
    assert.deepEqual(await p.boxion.get('reglages', 'apps-accueil'), ['pomo', 'marketplace'], 'le choix est gardé');
  } finally { p.fin(); }
});

test('multitâche : ouvrir un ploxion DEPUIS un ploxion (la pile, « ‹ » y revient vivant), minimiser, reprendre, ⧉, les bords', async () => {
  const { creerRouteur } = await import('../src/app/routeur.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w;
  try {
    const montes = [], demontes = [];
    W.jOSApps = W.jOSApps || {};
    for (const id of ['a', 'b', 'c']) W.jOSApps[id] = { manifest: { id }, mount(h) { montes.push(id); h.innerHTML = '<p>' + id + '</p>'; return { unmount() { demontes.push(id); } }; } };
    const racine = W.document.createElement('div'); W.document.body.appendChild(racine);
    const usage = [];
    const r = creerRouteur({ fenetre: W, racine, catalogue: ['a', 'b', 'c'].map(id => ({ id, nom: id.toUpperCase(), icone: '◇' })), surUsage: (id, s) => usage.push(id) });
    await r.accueil();
    await r.ouvrir('a');
    await r.ouvrir('b');   // depuis a : a reste vivant, en dessous
    assert.deepEqual([r.courant(), r.vivants(), r.pile()], ['b', ['a', 'b'], ['a']]);
    assert.deepEqual(demontes, [], 'a n\'est pas démonté');
    assert.equal(racine.querySelector('[data-ploxion="a"]').hidden, true);
    racine.querySelector('[data-retour]').click(); await attendre(20);
    assert.deepEqual([r.courant(), r.vivants(), demontes], ['a', ['a'], ['b']], '« ‹ » ferme b et revient à a, vivant');
    assert.deepEqual(montes, ['a', 'b'], 'a n\'a pas été remonté');
    // minimiser : a reste vivant, l'accueil montre « en arrière-plan »
    racine.querySelector('[data-minimiser]').click(); await attendre(20);
    assert.equal(r.courant(), null); assert.deepEqual(r.vivants(), ['a']);
    assert.ok(racine.querySelector('.px-arriere [data-reprendre="a"]'));
    racine.querySelector('[data-reprendre="a"]').click(); await attendre(20);
    assert.equal(r.courant(), 'a'); assert.deepEqual(montes, ['a', 'b'], 'repris sans remontage');
    // ⧉ : deux vivants → le bouton apparaît
    await r.ouvrir('c');
    assert.ok(racine.querySelector('[data-basculer]'));
    // les bords : depuis c, le bord gauche → a (la précédente), encore → l'accueil ; le bord droit depuis l'accueil → a
    const tirer = (cote, dx) => { const b = racine.querySelector('.px-bord-' + cote), x = cote === 'g' ? 2 : 380;
      b.getBoundingClientRect = () => ({ top: 0, height: 0, left: 0, width: 16 });   // jsdom : hauteur 0 → la zone du milieu
      b.dispatchEvent(new W.MouseEvent('pointerdown', { clientX: x, bubbles: true })); b.dispatchEvent(new W.MouseEvent('pointermove', { clientX: x + dx, bubbles: true })); b.dispatchEvent(new W.MouseEvent('pointerup', { clientX: x + dx, bubbles: true })); };
    tirer('g', 90); await attendre(20); assert.equal(r.courant(), 'a');
    tirer('g', 90); await attendre(20); assert.equal(r.courant(), null, 'l\'accueil');
    tirer('d', -90); await attendre(20); assert.equal(r.courant(), 'a');
    tirer('d', -30); await attendre(20); assert.equal(r.courant(), 'a', 'un geste trop court ne fait rien');
    assert.deepEqual(r.vivants(), ['a', 'c'], 'les bords ne ferment rien');
    // ✕ dans « en arrière-plan » ferme vraiment ; au plus 5 vivants
    racine.querySelector('[data-minimiser]').click(); await attendre(20);
    racine.querySelector('[data-tuer="c"]').click(); await attendre(20);
    assert.deepEqual(r.vivants(), ['a']); assert.ok(demontes.includes('c'));
  } finally { p.fin(); }
});

test('notifications : coord — rien au premier passage, puis les nouveaux messages deviennent des notifications (3 au plus, puis un résumé)', async () => {
  const { creerNotifs } = await import('../src/natif/notifs.js');
  const boxion = creerMemoire(), planifiees = [], W = { Capacitor: { isNativePlatform: () => true }, setInterval: () => 1, clearInterval() {} };
  let msgs = [{ id: 10, agent: 'rs1', content: 'vieux' }];
  const LocalNotifications = { requestPermissions: async () => ({ display: 'granted' }), schedule: async ({ notifications }) => { planifiees.push(...notifications); }, addListener: async () => {} };
  const n = creerNotifs({ W, boxion, charger: async () => ({ LocalNotifications }), envoyer: async (q) => { const since = +new URL(q.url).searchParams.get('since'); return { status: 200, texte: JSON.stringify({ messages: msgs.filter(m => m.id > since) }) }; } });
  await n.pret; await n.coord(true);
  assert.deepEqual(await n.verifierCoord(), [], 'le premier passage ne réveille pas l\'historique');
  assert.equal(n.reglage().dernierCoord, 10); assert.equal(planifiees.length, 0);
  msgs.push({ id: 11, agent: 'rs1', topic: 'ploxi0n', content: 'build 0.12 prêt' });
  await n.verifierCoord();
  assert.equal(planifiees.length, 1); assert.match(planifiees[0].title, /rs1 · #ploxi0n/); assert.equal(planifiees[0].extra.ouvrir, 'coord');
  for (let i = 12; i < 18; i++) msgs.push({ id: i, agent: 'x', content: 'm' + i });
  await n.verifierCoord();
  assert.equal(planifiees.length, 4, '2 derniers + un résumé'); assert.match(planifiees[3].body, /4 autres/);
  assert.equal((await boxion.get('reglages', 'notifs')).dernierCoord, 17);
});

test('le droit au silence : ce qu\'un ploxion accroche à la page se cache avec lui, revient avec lui, part avec lui', async () => {
  const { creerRouteur } = await import('../src/app/routeur.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w;
  try {
    W.jOSApps = W.jOSApps || {};
    W.jOSApps.bulle = { manifest: { id: 'bulle' }, mount(h) { const b = W.document.createElement('div'); b.className = 'compagnon'; b.style.position = 'fixed'; W.document.body.appendChild(b); h.textContent = 'bulle'; return { unmount() {} }; } };
    const racine = W.document.createElement('div'); W.document.body.appendChild(racine);
    const r = creerRouteur({ fenetre: W, racine, catalogue: [{ id: 'bulle', nom: 'Bulle' }] });
    await r.accueil(); await r.ouvrir('bulle'); await attendre(10);
    const b = W.document.querySelector('body > .compagnon'); assert.ok(b);
    r.minimiser(); await attendre(10);
    assert.equal(b.style.display, 'none', 'caché avec le ploxion minimisé');
    await r.ouvrir('bulle'); await attendre(10);
    assert.equal(b.style.display, '', 'rendu quand on le reprend');
    r.retour(); await attendre(10);
    assert.equal(W.document.querySelector('body > .compagnon'), null, 'retiré quand on le ferme');
  } finally { p.fin(); }
});

test('appui long : le menu d\'un ploxion (épingler au dock, déplacer vers une page existante sans saisie, retirer avec confirmation)', async () => {
  const { creerRouteur } = await import('../src/app/routeur.js');
  const { creerHud } = await import('../src/app/hud.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w;
  try {
    const compte = { etat: () => ({ connecte: false }), surChangement: () => () => {} };
    let r = null; const retires = [];
    const hud = creerHud({ W, compte, boxion: p.boxion, trouver: (id) => r.catalogue().find(x => x.id === id) }); await hud.pret;
    await p.boxion.put('reglages', 'accueil', { dossiers: [], pages: [{ nom: 'Travail', ids: ['b'] }] });
    const racine = W.document.createElement('div'); W.document.body.appendChild(racine);
    r = creerRouteur({ fenetre: W, racine, boxion: p.boxion, hud, catalogue: [{ id: 'a', nom: 'A', icone: '◇' }, { id: 'b', nom: 'B', icone: '◆' }], retirer: async (id) => retires.push(id) });
    await r.accueil();
    const appuyer = async (id) => { racine.querySelector('[data-id="' + id + '"]').dispatchEvent(new W.MouseEvent('pointerdown', { bubbles: true, clientX: 5, clientY: 5 })); await attendre(520); };
    await appuyer('a');
    assert.ok(racine.querySelector('.px-menu'), 'le menu s\'ouvre après 450 ms');
    racine.querySelector('[data-m="epingler"]').click(); await attendre(30);
    assert.deepEqual(hud.config().epingles, ['a']); assert.ok(racine.querySelector('.px-dock [data-hud-px="a"]'), 'dans le dock');
    await appuyer('a');
    racine.querySelector('[data-vers-page="Travail"]').click(); await attendre(30);
    assert.deepEqual((await p.boxion.get('reglages', 'accueil')).pages, [{ nom: 'Travail', ids: ['b', 'a'] }], 'déplacé sans saisie');
    await appuyer('a');
    const ret = racine.querySelector('[data-m="retirer"]'); ret.click(); await attendre(10);
    assert.deepEqual(retires, [], 'le premier toucher demande confirmation'); assert.match(ret.textContent, /sûr/);
    ret.click(); await attendre(30);
    assert.deepEqual(retires, ['a']);
    // un appui court ne fait que cliquer
    racine.querySelector('[data-id="b"]').dispatchEvent(new W.MouseEvent('pointerdown', { bubbles: true, clientX: 5, clientY: 5 }));
    racine.querySelector('[data-id="b"]').dispatchEvent(new W.MouseEvent('pointerup', { bubbles: true })); await attendre(520);
    assert.equal(racine.querySelector('.px-menu'), null, 'pas de menu sur un appui court');
  } finally { p.fin(); }
});

test('un seul chargement par bion : deux ploxions qui partagent un bion ne le réexécutent pas ; un plugion branche jOSShare sur le natif', async () => {
  const s = serveur(), boxion = creerMemoire();
  s.js.un = BUNDLE('un') + '\nif (window.jOSStore) jOSStore.x();'; s.js.deux = BUNDLE('deux') + '\nif (window.jOSStore) jOSStore.y();';
  const get = s.http.get;
  s.http.get = async (url, o) => url.endsWith('/px/bion-app/jOSStore.js') ? { status: 200, texte: 'window.jOSStore={x(){},y(){}};', entetes: {} } : url.includes('/px/bion-app/') ? { status: 404, texte: '', entetes: {} } : get(url, o);
  const d = creerDepot({ boxion, http: s.http });
  await d.installer('un'); await d.installer('deux');
  const deja = new Set();
  const b1 = await d.bundle('un', { deja }), b2 = await d.bundle('deux', { deja });
  assert.match(b1, /window\.jOSStore=/); assert.doesNotMatch(b2, /window\.jOSStore=/, 'le second ne recharge pas le bion');
  assert.deepEqual([...deja], ['jOSStore']);
  const { brancherPlugions } = await import('../src/natif/plugions.js');
  const partages = [];
  const W = { localStorage: { getItem: () => null }, jOSNatif: { natif: false, partager: async (p) => partages.push(p) }, jOSShare: { open() {} } };
  assert.deepEqual(brancherPlugions(W), ['jOSShare']);
  await W.jOSShare.natif({ text: 'salut', url: 'https://x' });
  assert.deepEqual(partages, [{ texte: 'salut', url: 'https://x', titre: undefined }]);
  assert.deepEqual(brancherPlugions(W), [], 'idempotent');
  assert.deepEqual(brancherPlugions({ jOSShare: { open() {} } }, new Set(['jOSShare'])), [], 'un bion coupé n\'est pas branché');
});

test('haptique : ouvrir (léger), minimiser (moyen), revenir (léger), changer de vue (un cran) ; rien quand les bords ne passent pas le seuil', async () => {
  const { creerRouteur } = await import('../src/app/routeur.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w;
  try {
    W.jOSApps = W.jOSApps || {}; W.jOSApps.h = { manifest: { id: 'h' }, mount(x) { x.textContent = 'h'; return { unmount() {} }; } };
    const racine = W.document.createElement('div'); W.document.body.appendChild(racine);
    const vib = [];
    const r = creerRouteur({ fenetre: W, racine, catalogue: [{ id: 'h', nom: 'H' }], vibrer: (s) => vib.push(s) });
    await r.accueil(); await r.ouvrir('h'); r.minimiser(); await attendre(10);
    await r.ouvrir('h'); r.retour(); await attendre(10);
    racine.querySelector('[data-vue-accueil="liste"]').click(); await attendre(20);
    assert.deepEqual(vib, ['ouvrir', 'minimiser', 'reprendre', 'revenir', 'vue']);
  } finally { p.fin(); }
});

test('haptique inventée : un motif sauvé, assigné à un événement, joué pas à pas ; un événement peut jouer « rien »', async () => {
  const { creerHaptique } = await import('../src/natif/haptique.js');
  const boxion = creerMemoire(), joue = [];
  const h = creerHaptique({ boxion, natif: () => ({ vibrer: async (s) => joue.push(s) }), attendre: async () => {} });
  await h.pret;
  h.jouer('ouvrir'); assert.deepEqual(joue, ['leger'], 'défaut : ouvrir = léger');
  const nom = await h.sauver('Coeur !', [['fort', 120], ['leger', 0], ['inconnu', 50]]);
  assert.equal(nom, 'coeur '); assert.deepEqual(h.config().motifs['coeur '], [['fort', 120], ['leger', 0]], 'nettoyé');
  await h.assigner('ouvrir', 'motif:coeur '); joue.length = 0;
  await h.jouer('ouvrir'); assert.deepEqual(joue, ['fort', 'leger']);
  joue.length = 0; await h.jouer('notification'); assert.deepEqual(joue, ['moyen', 'leger', 'leger'], 'le motif « notification » par défaut');
  await h.assigner('page', 'aucun'); joue.length = 0; h.jouer('page'); assert.deepEqual(joue, []);
  await h.supprimer('coeur '); assert.equal(h.config().evenements.ouvrir, 'leger', 'un motif supprimé rend la main au défaut');
  assert.deepEqual((await boxion.get('reglages', 'haptique')).evenements.page, 'aucun', 'gardé');
});

test('les deux bords en même temps ouvrent portion (même depuis l\'accueil vide)', async () => {
  const { creerRouteur } = await import('../src/app/routeur.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w;
  try {
    const racine = W.document.createElement('div'); W.document.body.appendChild(racine);
    const ouverts = [], vib = [];
    const r = creerRouteur({ fenetre: W, racine, catalogue: [], vibrer: (x) => vib.push(x), doubleBord: () => ouverts.push('portion') });
    await r.accueil();
    const g = racine.querySelector('.px-bord-g'), d = racine.querySelector('.px-bord-d');
    g.getBoundingClientRect = d.getBoundingClientRect = () => ({ top: 0, height: 0 });   // le milieu
    const ev = (el, t, x) => el.dispatchEvent(new W.MouseEvent(t, { clientX: x, bubbles: true }));
    ev(g, 'pointerdown', 2); ev(d, 'pointerdown', 380); ev(g, 'pointermove', 80); ev(d, 'pointermove', 300);
    ev(g, 'pointerup', 80); assert.deepEqual(ouverts, [], 'pas avant d\'avoir lâché les deux');
    ev(d, 'pointerup', 300);
    assert.deepEqual(ouverts, ['portion']); assert.ok(vib.includes('portion'));
    ev(d, 'pointerdown', 380); ev(d, 'pointerup', 300); assert.deepEqual(ouverts, ['portion'], 'un seul bord ne l\'ouvre pas');
  } finally { p.fin(); }
});

test('appui long dans un ploxion = clic droit (contextmenu), jamais sur un champ', async () => {
  const { creerRouteur } = await import('../src/app/routeur.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w;
  try {
    W.jOSApps = W.jOSApps || {}; const recus = [];
    W.jOSApps.menu = { manifest: { id: 'menu' }, mount(h) { h.innerHTML = '<div class="zone">x</div><input>'; h.querySelector('.zone').addEventListener('contextmenu', (e) => recus.push([e.button, e.clientX])); return { unmount() {} }; } };
    const racine = W.document.createElement('div'); W.document.body.appendChild(racine);
    const r = creerRouteur({ fenetre: W, racine, catalogue: [{ id: 'menu', nom: 'Menu' }] });
    await r.ouvrir('menu'); await attendre(10);
    const z = racine.querySelector('.zone'), i = racine.querySelector('.px-hote input');
    z.dispatchEvent(new W.MouseEvent('pointerdown', { bubbles: true, clientX: 40, clientY: 50 })); await attendre(560);
    assert.deepEqual(recus, [[2, 40]], 'le menu du clic droit reçoit l\'événement');
    i.dispatchEvent(new W.MouseEvent('pointerdown', { bubbles: true, clientX: 40, clientY: 90 })); await attendre(560);
    assert.equal(recus.length, 1, 'pas sur un champ');
    z.dispatchEvent(new W.MouseEvent('pointerdown', { bubbles: true, clientX: 40, clientY: 50 })); z.dispatchEvent(new W.MouseEvent('pointerup', { bubbles: true })); await attendre(560);
    assert.equal(recus.length, 1, 'un appui court reste un clic');
  } finally { p.fin(); }
});

test('les images des ploxions : les chemins du site vont sur xerboxion.org ; les fichiers de l\'app ne bougent pas', async () => {
  const { installerImages } = await import('../src/natif/images.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w;
  try {
    installerImages({ W, source: 'https://xerboxion.org' });
    const h = W.document.createElement('div');
    h.innerHTML = '<img src="/storage/a.png" srcset="/img/b.png 2x, https://x.org/c.png 3x"><img src="/icons/ploxi0n.svg"><div style="background-image:url(\'/img/fond.jpg\')"></div><video poster="/px/v/p.jpg"></video>';
    W.document.body.appendChild(h); await attendre(10);
    const [a, b] = h.querySelectorAll('img');
    assert.equal(a.getAttribute('src'), 'https://xerboxion.org/storage/a.png');
    assert.equal(a.getAttribute('srcset'), 'https://xerboxion.org/img/b.png 2x, https://x.org/c.png 3x');
    assert.equal(b.getAttribute('src'), '/icons/ploxi0n.svg', 'un fichier de l\'app reste local');
    assert.match(h.querySelector('div').getAttribute('style'), /url\('https:\/\/xerboxion\.org\/img\/fond\.jpg'\)/);
    assert.equal(h.querySelector('video').getAttribute('poster'), 'https://xerboxion.org/px/v/p.jpg');
    a.setAttribute('src', '/coord/img/3'); await attendre(10);
    assert.equal(a.getAttribute('src'), 'https://xerboxion.org/coord/img/3', 'une image changée plus tard aussi');
  } finally { p.fin(); }
});
