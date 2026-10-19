// ⧉📖 (0.81) les ploxions composés (le contrat jOSApps.monter / peut / ensure du labo, avec le VRAI ultimate-social), leurs dépendances
// installées toutes seules, et le wiki lu dans l'app (le VRAI article « xerboxion » du labo)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { installerAppsALaDemande, ploxionsComposes } from '../src/shim/apps-a-la-demande.js';
import { creerWikiNatif, extraireArticle, cheminWiki, slugifier } from '../src/app/wiki-natif.js';
import { creerCadresLabo } from '../src/natif/cadres-labo.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { creerDepot } from '../src/marketplace/depot.js';
import { page, attendre, RACINE } from './aide.mjs';

const US = readFileSync(path.join(RACINE, 'tests/donnees/ultimate-social.labo.js'), 'utf8');
const WIKI = readFileSync(path.join(RACINE, 'tests/donnees/wiki-xerboxion.labo.html'), 'utf8');
const BUNDLE = (id, txt) => `window.jOSApps=window.jOSApps||{};window.jOSApps[${JSON.stringify(id)}]={manifest:{id:${JSON.stringify(id)}},mount(h){h.innerHTML='<b class="sous">${txt}</b>';return{unmount(){h.innerHTML=''}}}};`;

test('⧉ les dépendances d\'un ploxion : ce qu\'il compose (les onglets du vrai ultimate-social), pas ce qu\'il enregistre lui-même', () => {
  const d = ploxionsComposes(US, 'ultimate-social');
  for (const id of ['social', 'chat', 'carte', 'amis', 'profil', 'idee', 'atelier']) assert.ok(d.includes(id), id + ' : ' + d.join(','));
  assert.ok(!d.includes('ultimate-social'));
  assert.deepEqual(ploxionsComposes("jOSApps['quests'] = jOSApps['xp']; jOSApps.monter('carte', h)", 'xp'), ['carte'], 'un alias posé par le code n\'est pas une dépendance');
});

test('⧉ le vrai ultimate-social : ses onglets s\'installent et se montent tout seuls (avant : « indisponible ici »)', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, installes = [];
    installerAppsALaDemande({ W, connu: (id) => ['social', 'chat', 'carte'].includes(id), enLigne: () => true,
      ensureApp: async (id) => { await attendre(20); installes.push(id); W.eval(BUNDLE(id, 'le vrai ' + id)); return W.jOSApps[id]; } });
    assert.equal(Object.keys(W.jOSApps).includes('monter'), false, 'pas énumérable : la liste des ploxions ne change pas');
    W.eval(US);
    const h = D.createElement('div'); h.style.height = '600px'; D.body.appendChild(h);
    const inst = W.jOSApps['ultimate-social'].mount(h, { embed: false });
    await attendre(120);
    assert.doesNotMatch(h.textContent, /indisponible ici/);
    assert.ok(installes.includes('social'), 'l\'onglet Fil (social) installé à la demande : ' + installes);
    assert.match(h.textContent, /le vrai social/);
    const salons = [...h.querySelectorAll('[data-us-tab]')].find(b => /Salons/.test(b.textContent)); salons.click(); await attendre(120);
    assert.match(h.textContent, /le vrai chat/);
    inst.unmount();
  } finally { p.fin(); }
});

test('⧉ monter : hors ligne et pas installé → peut() faux (le ploxion le dit) ; une erreur se montre avec ↻ réessayer', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document; let enLigne = false, essais = 0;
    installerAppsALaDemande({ W, connu: () => false, enLigne: () => enLigne, ensureApp: async (id) => { essais++; if (essais === 1) throw new Error('le labo répond 503'); W.eval(BUNDLE(id, 'enfin')); return W.jOSApps[id]; } });
    assert.equal(W.jOSApps.peut('chat'), false);
    enLigne = true;
    const h = D.createElement('div'); D.body.appendChild(h);
    const m = W.jOSApps.monter('chat', h, {}); await attendre(30);
    assert.match(h.textContent, /indisponible.*503/s);
    h.querySelector('[data-ald-reessayer]').click(); await attendre(30);
    assert.match(h.textContent, /enfin/); assert.equal(m.instance() !== null, true);
    m.unmount(); assert.equal(h.textContent, '');
  } finally { p.fin(); }
});

test('⧉ le dépôt : installer un ploxion qui en compose d\'autres le dit (surInstalle) ; dependances() liste ce qui manque', async () => {
  const boxion = creerMemoire(), vus = [], js = { us: BUNDLE('us', 'x') + ";var TABS=[{id:'fil',app:'social'},{id:'s',app:'chat'}];" };
  const http = { async get(url) {
    if (url.endsWith('/px/registry.json')) return { status: 200, texte: JSON.stringify([{ id: 'us', hasScreen: true, enabled: true, status: 'live' }, { id: 'social', hasScreen: true, enabled: true, status: 'live' }, { id: 'chat', hasScreen: true, enabled: true, status: 'live' }]), entetes: {} };
    if (/xerkions\.json/.test(url)) return { status: 404, texte: '', entetes: {} };
    const m = url.match(/\/px\/([^/?]+)\/app\.js/); return m && js[m[1]] ? { status: 200, texte: js[m[1]], entetes: {} } : { status: 404, texte: '<!doctype html>', entetes: {} };
  } };
  const d = creerDepot({ boxion, http, surInstalle: (id, c) => vus.push([id, c]) });
  await d.catalogue();
  const r = await d.installer('us');
  assert.deepEqual(r.composes.sort(), ['chat', 'social']); assert.deepEqual(vus, [['us', r.composes]]);
  assert.deepEqual((await d.dependances()).map(x => x.id).sort(), ['chat', 'social']);
});

test('📖 l\'article du vrai wiki : seul, nettoyé, ses liens entre termes restent dans l\'app', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const a = extraireArticle(WIKI, { W: p.w });
    assert.equal(a.chemin, '/wiki/xerboxion'); assert.match(a.titre, /XERBOXION/i);
    assert.doesNotMatch(a.corps, /<script|alert\(1\)|coquille|onclick=/i);
    assert.match(a.corps, /data-wiki="\/wiki\/tsoin"/);
    assert.ok(a.corps.length < 40000, 'l\'article, pas la page : ' + a.corps.length);
    assert.equal(cheminWiki('https://labo.j0bot.ch/wiki/paper/cubion'), '/wiki/paper/cubion');
    assert.equal(cheminWiki('/wiki'), '/wiki'); assert.equal(cheminWiki('https://ailleurs.ch/wiki/x'), null); assert.equal(cheminWiki('/wiki/x/edit'), null);
    assert.equal(slugifier('Écriture du Tsoin'), 'ecriture-du-tsoin');
  } finally { p.fin(); }
});

test('📖 le ploxion wiki (son iframe /wiki) : le lecteur à la place, un lien navigue ici, ← revient, hors ligne : la page gardée', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, boxion = creerMemoire(), demandes = []; let enLigne = true;
    const http = { get: async (u) => { demandes.push(u); return /\/wiki\/xerboxion/.test(u) ? { status: 200, texte: WIKI } : /\/wiki\/tsoin/.test(u) ? { status: 200, texte: WIKI.replace(/XERBOXION/g, 'TSOIN').replace(/\/wiki\/xerboxion/g, '/wiki/tsoin') } : { status: 404, texte: '' }; } };
    const wiki = creerWikiNatif({ W, http, boxion, enLigne: () => enLigne });
    creerCadresLabo({ W, lecteur: wiki, tete: async () => ({ status: 200, entetes: {} }) });
    const hote = D.createElement('div'); hote.className = 'px-hote'; D.body.appendChild(hote);
    hote.innerHTML = '<iframe src="/wiki/xerboxion"></iframe>'; await attendre(60);
    const f = hote.querySelector('iframe');
    assert.equal(f.getAttribute('src'), 'about:blank', 'les 3,6 Mo de la page ne se chargent pas');
    assert.match(hote.querySelector('.px-wiki-a').textContent, /XERBOXION/i);
    assert.match(demandes[0], /\/wiki\/xerboxion\?fragment=1$/);
    const ancre = hote.querySelector('.px-wiki-a a[href^="#"]'), avant = W.location.hash;
    if (ancre) { ancre.click(); assert.equal(W.location.hash, avant, 'le sommaire ne touche pas au # du routeur'); }
    hote.querySelector('a[data-wiki="/wiki/tsoin"]').click(); await attendre(40);
    assert.match(hote.querySelector('.px-wiki-a').textContent, /TSOIN/);
    hote.querySelector('[data-w="retour"]').click(); await attendre(40);
    assert.match(hote.querySelector('.px-wiki-a').textContent, /XERBOXION/i);
    f.setAttribute('src', 'https://labo.j0bot.ch/wiki/tsoin'); await attendre(40);   // ploxion.wiki.goto du labo (déjà réécrit par le shim)
    assert.match(hote.querySelector('.px-wiki-a').textContent, /TSOIN/);
    enLigne = false; const n = demandes.length;
    const d2 = await wiki.lire('/wiki/xerboxion'); assert.equal(d2.cache, true); assert.equal(demandes.length, n, 'hors ligne : la page gardée');
    await assert.rejects(wiki.lire('/wiki/inconnu'), /hors ligne/);
  } finally { p.fin(); }
});
