// ⬡ (0.53) les cadres du labo : <iframe src="/wiki"> d'un ploxion → le labo ; refusé par sa CSP (frame-ancestors) → une carte « ouvrir ».
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { creerCadresLabo, cadreAutorise } from '../src/natif/cadres-labo.js';

const CSP_LABO = "default-src 'self'; frame-ancestors 'self' https://*.j0bot.ch; base-uri 'self';";
const CSP_YT = "frame-ancestors 'self' https://*.j0bot.ch https://xerboxion.org capacitor:";
const pause = (ms = 20) => new Promise(r => setTimeout(r, ms));

test('cadreAutorise : capacitor: ou * dans frame-ancestors ; sans frame-ancestors, oui', () => {
  assert.equal(cadreAutorise(CSP_LABO), false); assert.equal(cadreAutorise(CSP_YT), true);
  assert.equal(cadreAutorise("default-src 'self'"), true); assert.equal(cadreAutorise("frame-ancestors *"), true);
});

test('le wiki du labo : « /wiki » vise le labo ; refusé → la carte « ouvrir » (et elle suit le src) ; autorisé → le cadre', async () => {
  const { window: W } = new JSDOM('<!doctype html><body><div class="px-hote"></div></body>', { url: 'http://localhost/' });
  const ouverts = [], tetes = [];
  let csp = CSP_LABO;
  const c = creerCadresLabo({ W, source: 'https://xerboxion.org', tete: async (u) => { tetes.push(u); return { status: 200, entetes: { 'content-security-policy': csp } }; }, navigateur: (u) => ouverts.push(u) });
  try {
    const f = W.document.createElement('iframe'); f.src = '/wiki'; W.document.querySelector('.px-hote').appendChild(f);
    await pause();
    assert.equal(f.getAttribute('src'), 'https://xerboxion.org/wiki');
    const carte = W.document.querySelector('.px-cadre-labo'); assert.ok(carte, 'la carte au lieu du blanc'); assert.equal(f.style.display, 'none');
    f.src = '/wiki/bion'; await pause();
    assert.equal(f.getAttribute('src'), 'https://xerboxion.org/wiki/bion');
    W.document.querySelector('.px-cadre-labo button').click();
    assert.deepEqual(ouverts, ['https://xerboxion.org/wiki/bion']);
    assert.equal(tetes.length, 1, 'la règle lue une fois par préfixe');
    // les fichiers de l'app et les autres sites : intouchés
    const g = W.document.createElement('iframe'); g.src = '/ploxions/horloge/index.html'; W.document.querySelector('.px-hote').appendChild(g);
    const h = W.document.createElement('iframe'); h.src = 'https://www.youtube-nocookie.com/embed/x'; W.document.querySelector('.px-hote').appendChild(h);
    await pause();
    assert.equal(g.getAttribute('src'), '/ploxions/horloge/index.html'); assert.equal(h.getAttribute('src'), 'https://www.youtube-nocookie.com/embed/x');
    // le labo autorise l'app : le cadre s'affiche
    csp = CSP_YT; const c2 = creerCadresLabo({ W, source: 'https://labo.example', tete: async () => ({ status: 200, entetes: { 'content-security-policy': csp } }) });
    assert.equal(await c2.permis('/home'), 'oui');
  } finally { W.close(); }
});
