// ↻ (0.80) les mises à jour des ploxions : sans cache, avec les bions de la nouvelle version, le pack qui suit le labo, l'ancien code qui quitte
// la page (tout de suite, ou à la fermeture d'un ploxion ouvert), l'automatique (par défaut) et ⚙ › Ploxions
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { creerDepot } from '../src/marketplace/depot.js';
import { creerMisesAJour, MAJ_DEFAUT } from '../src/marketplace/mises-a-jour.js';
import { page, attendre } from './aide.mjs';

const BUNDLE = (id, txt) => `window.jOSApps=window.jOSApps||{};window.jOSApps[${JSON.stringify(id)}]={manifest:{id:${JSON.stringify(id)}},mount(h){h.innerHTML='<b>${txt}</b>';return{unmount(){h.innerHTML=''}}}};`;
function serveur() {
  const s = { appels: [], js: {}, bions: {} };
  s.http = { async get(url, { headers = {} } = {}) {
    s.appels.push([url, headers]);
    let m = url.match(/\/px\/bion-app\/([^/?]+)\.js/); if (m) return s.bions[m[1]] ? { status: 200, texte: s.bions[m[1]], entetes: {} } : { status: 404, texte: '<!doctype html>404', entetes: {} };
    m = url.match(/\/px\/([^/?]+)\/app\.js(?:\?|$)/); const id = m && m[1];
    return s.js[id] ? { status: 200, texte: s.js[id], entetes: {} } : { status: 404, texte: '<!doctype html>404', entetes: {} };
  } };
  return s;
}

test('↻ aJour : sans cache, les bions de la nouvelle version, le pack qui suit le labo (s\'il a mieux), 6 à la fois', async () => {
  const s = serveur(), boxion = creerMemoire(), vus = [];
  const d = creerDepot({ boxion, http: s.http, surMisAJour: (id) => vus.push(id) });
  s.js.a = BUNDLE('a', 'v1'); await d.installer('a');
  await boxion.put('ploxions', 'p', { id: 'p', nom: 'pack', js: BUNDLE('p', 'pack'), hash: 'h0', origine: 'pack', bions: [] });
  await boxion.put('ploxions', 'q', { id: 'q', nom: 'pack seul', js: BUNDLE('q', 'pack'), hash: 'h1', origine: 'pack', bions: [] });
  s.js.a = BUNDLE('a', 'v2') + ';window.jOSNouveau&&jOSNouveau.x();'; s.bions.jOSNouveau = 'window.jOSNouveau={x(){}};';
  s.js.p = BUNDLE('p', 'labo');
  const r = await d.aJour({ ids: ['a', 'p', 'q'] });
  assert.deepEqual(Object.fromEntries(r.map(x => [x.id, x.etat])), { a: 'mis-a-jour', p: 'mis-a-jour', q: 'a-jour' });
  const a = await boxion.get('ploxions', 'a');
  assert.match(a.js, /v2/); assert.ok(a.bions.includes('jOSNouveau'), 'le bion de la nouvelle version est là');
  assert.ok(await boxion.get('bions', 'jOSNouveau'));
  const p = await boxion.get('ploxions', 'p'); assert.match(p.js, /labo/); assert.notEqual(p.origine, 'pack', 'il suit le labo désormais');
  assert.equal((await boxion.get('ploxions', 'q')).origine, 'pack', 'le labo n\'en a pas : il reste celui du pack, sans erreur');
  const req = s.appels.filter(([u]) => /\/a\/app\.js/.test(u)).pop();
  assert.match(req[0], /\?maj=/); assert.equal(req[1]['Cache-Control'], 'no-cache');
  assert.deepEqual(vus.sort(), ['a', 'p']);
});

test('↻ le routeur : l\'ancien code quitte la page ; un ploxion ouvert garde le sien jusqu\'à sa fermeture', async () => {
  const { creerRouteur } = await import('../src/app/routeur.js');
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document; let js = BUNDLE('t', 'v1');
    const racine = D.createElement('div'); D.body.appendChild(racine);
    const r = creerRouteur({ fenetre: W, racine, catalogue: [{ id: 't', nom: 't' }, { id: 'reglages-app', nom: 'r', interne: true }], bundleLocal: async () => js });
    await r.ouvrir('t'); assert.match(racine.textContent, /v1/);
    js = BUNDLE('t', 'v2');
    assert.equal(r.oublier('t'), 'a-la-fermeture'); assert.deepEqual(r.enAttenteDeMaj(), ['t']);
    assert.match(racine.textContent, /v1/, 'il tourne encore');
    r.tuer ? r.tuer('t') : r.fermer(); await attendre(20);
    assert.equal(W.jOSApps.t, undefined, 'déchargé à sa fermeture');
    await r.ouvrir('t'); assert.match(racine.textContent, /v2/, 'la nouvelle version, sans redémarrer l\'app');
    assert.equal(r.oublier('reglages-app'), 'interne');
  } finally { p.fin(); }
});

test('↻ l\'automatique (par défaut) : au lancement, puis à la fréquence ; dit ce qui a changé ; rien hors ligne', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, boxion = creerMemoire(), dits = []; let appels = 0, enLigne = true, t = 1e12;
    const depot = { aJour: async () => { appels++; return [{ id: 'a', etat: 'mis-a-jour' }, { id: 'b', etat: 'a-jour' }, { id: 'c', etat: 'erreur' }]; }, bions: async () => [{ nom: 'jOSX' }], majBion: async () => 'mis-a-jour' };
    const m = creerMisesAJour({ W, depot, boxion, signaler: (x) => dits.push(x), enLigne: () => enLigne, maintenant: () => t });
    assert.deepEqual(m.reglage(), MAJ_DEFAUT); assert.equal(MAJ_DEFAUT.auto, true, 'automatique par défaut');
    m.demarrer({ attente: 10 }); await attendre(60);
    assert.equal(appels, 1);
    assert.match(dits[0], /^↻ 1 ploxion à jour \(a\) · 1 bion au prochain lancement/);
    const e = m.etat(); assert.deepEqual([e.mis, e.erreurs, e.bions], [['a'], ['c'], 1]);
    t += 3600e3; W.document.dispatchEvent(new W.Event('visibilitychange')); await attendre(50);
    assert.equal(appels, 1, 'pas encore l\'heure (6 h)');
    enLigne = false; const x = await m.verifier(); assert.equal(x.horsLigne, true); assert.equal(appels, 1);
    m.arreter();
  } finally { p.fin(); }
});

test('⚙ › Ploxions : l\'interrupteur, la fréquence, vérifier maintenant avec la progression', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, boxion = creerMemoire();
    const depot = { aJour: async ({ progres }) => { progres({ fait: 1, total: 2 }); return [{ id: 'a', etat: 'mis-a-jour' }, { id: 'b', etat: 'a-jour' }]; }, bions: async () => [], majBion: async () => 'a-jour' };
    const m = creerMisesAJour({ W, depot, boxion, enLigne: () => true }); await m.pret;
    const z = D.createElement('div'); z.innerHTML = m.html(); D.body.appendChild(z); m.brancher(z.firstChild);
    const auto = z.querySelector('[data-maj-auto]'); assert.equal(auto.checked, true);
    auto.checked = false; auto.dispatchEvent(new W.Event('change', { bubbles: true })); await attendre(10);
    assert.equal((await boxion.get('reglages', 'maj')).auto, false);
    z.querySelector('[data-maj-heures="24"]').click(); await attendre(10);
    assert.equal(m.reglage().heures, 24);
    z.querySelector('[data-maj-maintenant]').click(); await attendre(30);
    assert.match(z.querySelector('[data-maj-etat]').textContent, /^✓ 1 mis à jour : a/);
  } finally { p.fin(); }
});

test('↻ un ploxion introuvable au labo : l\'automatique ne retélécharge pas son 404 pendant 7 jours, « vérifier » si', async () => {
  const s = serveur(), boxion = creerMemoire();
  const d = creerDepot({ boxion, http: s.http });
  s.js.z = BUNDLE('z', 'v1'); await d.installer('z'); delete s.js.z;
  assert.equal((await d.aJour({ auto: true }))[0].etat, 'erreur');
  const n = s.appels.length;
  assert.deepEqual(await d.aJour({ auto: true }), [], 'en pause');
  assert.equal(s.appels.length, n, 'rien téléchargé');
  assert.equal((await d.aJour())[0].etat, 'erreur', 'à la main : vérifié quand même');
});
