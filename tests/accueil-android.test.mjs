// ⌂ (0.99.32) Android : ploxion comme écran d'accueil (jOSAccueil), les applis du téléphone, le bouton retour
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { creerAccueil, brancherRetourAndroid } from '../src/natif/accueil-natif.js';
import { creerApplis, filtrer, plat } from '../src/lot/applis.js';
import { ploxiIci, plateforme } from '../src/natif/plugins-app.js';

const PNG = 'data:image/png;base64,iVBORw0KGgo=';
function fauxPlugin({ accueil = false } = {}) {
  const appels = [];
  const p = { appels, accueil,
    estAccueil: async () => ({ accueil: p.accueil, peut: true }),
    choisir: async () => { appels.push(['choisir']); p.accueil = true; return { accueil: true }; },
    applis: async (o) => { appels.push(['applis', o]); return { applis: [{ paquet: 'org.zeta', nom: 'Zêta' }, { paquet: 'com.android.settings', activite: 'S', nom: 'Réglages', icone: PNG }, { paquet: 'x.mal', nom: 'Mal', icone: 'javascript:alert(1)' }, { nom: 'sans paquet' }] }; },
    lancer: async (o) => { appels.push(['lancer', o]); },
    reglages: async (o) => { appels.push(['reglages', o]); },
  };
  return p;
}

test('⌂ plateforme et plugins : demander avant d\'appeler (Android n\'a pas les plugins Swift)', () => {
  assert.equal(plateforme({}), 'web');
  assert.equal(plateforme({ Capacitor: { getPlatform: () => 'android' } }), 'android');
  const W = { Capacitor: { isPluginAvailable: (n) => n === 'PloxiAccueil' } };
  assert.equal(ploxiIci('PloxiAccueil', W), true); assert.equal(ploxiIci('PloxiProche', W), false); assert.equal(ploxiIci('PloxiApple', {}), false);
});

test('⌂ jOSAccueil : les applis triées, sans paquet ni icône douteuse ; lancer, réglages, choisir', async () => {
  const p = fauxPlugin(), a = creerAccueil({ plugin: p });
  assert.equal(a.dispo(), true);
  const l = await a.applis();
  assert.deepEqual(l.map(x => x.nom), ['Mal', 'Réglages', 'Zêta']);
  assert.equal(l.find(x => x.nom === 'Mal').icone, '', 'une icône qui n\'est pas un PNG en data: est jetée');
  assert.equal(l.find(x => x.nom === 'Réglages').icone, PNG);
  await a.applis(); assert.equal(p.appels.filter(x => x[0] === 'applis').length, 1, 'gardées 5 min');
  await a.applis({ frais: true }); assert.equal(p.appels.filter(x => x[0] === 'applis').length, 2);
  await a.lancer(l[1]); assert.deepEqual(p.appels.at(-1), ['lancer', { paquet: 'com.android.settings', activite: 'S' }]);
  await a.lancer('org.zeta'); assert.deepEqual(p.appels.at(-1), ['lancer', { paquet: 'org.zeta' }]);
  await a.reglages('org.zeta'); assert.deepEqual(p.appels.at(-1), ['reglages', { paquet: 'org.zeta' }]);
  assert.deepEqual(await a.estAccueil(), { accueil: false, peut: true });
  assert.deepEqual(await a.choisir(), { accueil: true });
});

test('⌂ jOSAccueil sans plugin (iPhone, navigateur) : rien ne casse', async () => {
  const a = creerAccueil({});
  assert.equal(a.dispo(), false); assert.deepEqual(await a.applis(), []); assert.deepEqual(await a.estAccueil(), { accueil: false, peut: false });
  await assert.rejects(a.lancer('x'), /Android/); await assert.rejects(a.choisir(), /Android/);
});

test('⌂ chercher une appli : sans accents, dans le nom ou le paquet', () => {
  const l = [{ nom: 'Réglages', paquet: 'com.android.settings' }, { nom: 'Téléphone', paquet: 'com.google.dialer' }];
  assert.equal(plat('Réglages'), 'reglages');
  assert.deepEqual(filtrer(l, 'regl').map(a => a.nom), ['Réglages']);
  assert.deepEqual(filtrer(l, 'DIALER').map(a => a.nom), ['Téléphone']);
  assert.equal(filtrer(l, '  ').length, 2);
});

test('⌂ le bouton retour : ce qui flotte, puis le ploxion, puis rien si ploxion est l\'écran d\'accueil, sinon l\'arrière-plan', async () => {
  const dom = new JSDOM('<!doctype html><body></body>'); const W = dom.window;
  const auditeurs = {}; let minimise = 0;
  const app = { addListener: (n, f) => { auditeurs[n] = f; return Promise.resolve({ remove() {} }); }, minimizeApp: async () => { minimise++; } };
  let courant = 'synthe', retours = 0, accueils = 0, minis = 0;
  const routeur = { courant: () => courant, retour: () => { retours++; courant = null; }, accueil: () => { accueils++; }, minimiser: () => { minis++; courant = null; } };
  const p = fauxPlugin({ accueil: false });
  let feuille = W.document.createElement('div'); feuille.addEventListener('click', () => { feuille.remove(); feuille = null; }); W.document.body.appendChild(feuille);
  const r = brancherRetourAndroid({ W, app, routeur, accueil: creerAccueil({ plugin: p }), flottant: () => feuille });
  await new Promise(res => setTimeout(res, 0));
  assert.equal(W.document.documentElement.getAttribute('data-px-launcher'), '0');
  assert.equal(auditeurs.backButton(), 'flottant'); assert.equal(feuille, null);
  assert.equal(auditeurs.backButton(), 'ploxion'); assert.equal(retours, 1);
  assert.equal(auditeurs.backButton(), 'arriere-plan'); assert.equal(minimise, 1);
  p.accueil = true; auditeurs.resume(); await new Promise(res => setTimeout(res, 0));
  assert.equal(r.estAccueil(), true); assert.equal(W.document.documentElement.getAttribute('data-px-launcher'), '1');
  assert.equal(auditeurs.backButton(), 'accueil'); assert.equal(minimise, 1, 'on ne quitte jamais l\'écran d\'accueil');
  // le bouton maison d'Android (MainActivity → « ploxiAccueil »)
  courant = 'autour'; W.dispatchEvent(new W.Event('ploxiAccueil')); assert.equal(minis, 1);
  W.dispatchEvent(new W.Event('ploxiAccueil')); assert.equal(accueils, 1);
  r.couper(); W.dispatchEvent(new W.Event('ploxiAccueil')); assert.equal(accueils, 1);
});

test('⌂ le ploxion Applis : la grille, chercher, toucher pour ouvrir, appui long pour les réglages, en faire l\'écran d\'accueil', async () => {
  const dom = new JSDOM('<!doctype html><body><div id="h"></div></body>'); const W = dom.window;
  const p = fauxPlugin(), vib = [];
  const px = creerApplis({ W, accueil: creerAccueil({ plugin: p }), vibrer: (x) => vib.push(x), appui: 30 });
  assert.equal(px.ploxion.id, 'applis'); assert.ok(W.jOSApps.applis);
  const h = W.document.getElementById('h'); const m = px.mount(h);
  await new Promise(res => setTimeout(res, 5));
  const noms = () => [...h.querySelectorAll('.px-ap-a .n')].map(x => x.textContent);
  assert.deepEqual(noms(), ['Mal', 'Réglages', 'Zêta']);
  assert.equal(h.querySelectorAll('.px-ap-a img').length, 1);
  assert.match(h.querySelector('[data-ap-tete]').textContent, /pas ton écran d'accueil/);
  const q = h.querySelector('[data-ap-q]'); q.value = 'zet'; q.dispatchEvent(new W.Event('input'));
  assert.deepEqual(noms(), ['Zêta']);
  h.querySelector('.px-ap-a').click(); await new Promise(res => setTimeout(res, 0));
  assert.deepEqual(p.appels.at(-1), ['lancer', { paquet: 'org.zeta' }]); assert.ok(vib.includes('ouvrir'));
  q.value = 'rien du tout'; q.dispatchEvent(new W.Event('input')); assert.match(h.querySelector('.px-ap-vide').textContent, /rien pour/);
  q.value = ''; q.dispatchEvent(new W.Event('input'));
  const b = h.querySelectorAll('.px-ap-a')[1];
  b.dispatchEvent(new W.Event('pointerdown', { bubbles: true })); await new Promise(res => setTimeout(res, 50));
  assert.deepEqual(p.appels.at(-1), ['reglages', { paquet: 'com.android.settings' }]);
  b.click(); assert.notDeepEqual(p.appels.at(-1)[0], 'lancer', 'le clic qui suit un appui long n\'ouvre pas');
  h.querySelector('[data-ap-choisir]').click(); await new Promise(res => setTimeout(res, 0));
  assert.ok(p.appels.some(x => x[0] === 'choisir')); assert.match(h.querySelector('[data-ap-tete]').textContent, /est ton écran d'accueil/);
  m.unmount(); assert.equal(h.innerHTML, '');
});
