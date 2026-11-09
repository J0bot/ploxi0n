// ⟡ (0.99.14) toutes les langues : le bion dire (src/bions/dire.js), le dictionnaire (src/app/langues.js), la langue posée sur l'app (src/app/langue.js)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { LANGUES, NEOLOGISMES, langueDe, creerDire } from '../src/bions/dire.js';
import { LIGNES, DICOS } from '../src/app/langues.js';
import { installerLangue } from '../src/app/langue.js';

const attendre = (ms = 20) => new Promise(r => setTimeout(r, ms));

test('⟡ la langue : le réglage, sinon celle de l\'iPhone, sinon le français', () => {
  assert.equal(langueDe('de', ['en-US']), 'de');
  assert.equal(langueDe('auto', ['de-CH', 'fr-CH']), 'de');
  assert.equal(langueDe('auto', ['ja-JP', 'it-CH']), 'it');
  assert.equal(langueDe('auto', ['ja-JP']), 'fr');
  assert.equal(langueDe('klingon', []), 'fr');
  assert.equal(langueDe(undefined, ['es_ES']), 'es');
});

test('⟡ dire : exact, {n}, morceaux « · », glyphes autour ; l\'inconnu reste', () => {
  const d = creerDire({ 'vitrine': 'showcase', '{n} lieux autour': '{n} places around', '{n} installé(s)': '{n} installed', 'à jour tout seul': 'updates itself', 'web, hors ligne': 'web, offline' });
  assert.equal(d('vitrine'), 'showcase');
  assert.equal(d('▦ vitrine'), '▦ showcase');
  assert.equal(d('  vitrine '), '  showcase ');
  assert.equal(d('9 lieux autour'), '9 places around');
  assert.equal(d('3 installé(s) · ↻ à jour tout seul'), '3 installed · ↻ updates itself');
  assert.equal(d('iPhone · Android · web, hors ligne ›'), 'iPhone · Android · web, offline ›');
  assert.equal(d('Café du Grütli'), null);
  assert.equal(d('⇗ 70 m'), null);
  assert.equal(d(''), null);
  assert.equal(d('installé(s)'), null);
});

test('⟡ le dictionnaire : cinq langues par ligne, une clé une fois, les mêmes {n}, les néologismes gardés', () => {
  assert.deepEqual(LANGUES.map(l => l[0]), ['fr', 'en', 'de', 'it', 'es']);
  const vus = new Set();
  for (const l of LIGNES) {
    assert.equal(l.length, 5, l[0]); assert.ok(l.every(x => typeof x === 'string' && x.trim()), l[0]);
    assert.ok(!vus.has(l[0]), 'en double : ' + l[0]); vus.add(l[0]);
    const n = (l[0].match(/\{n\}/g) || []).length;
    for (const t of l.slice(1)) assert.equal((t.match(/\{n\}/g) || []).length, n, l[0] + ' → ' + t);
    for (const mot of NEOLOGISMES) {
      if (!new RegExp('(^|[^\\p{L}])' + mot, 'iu').test(l[0])) continue;
      for (const t of l.slice(1)) assert.ok(t.toLowerCase().includes(mot), mot + ' doit rester dans « ' + t + ' »');
    }
  }
  assert.equal(Object.keys(DICOS).length, 4);
  for (const c of ['en', 'de', 'it', 'es']) assert.equal(Object.keys(DICOS[c]).length, LIGNES.length);
});

function page() {
  const { window: W } = new JSDOM('<!doctype html><html><body>'
    + '<div class="px-hote" data-ploxion="reglages-app"><h3>toi</h3><button>▦ vitrine</button><input placeholder="chercher un réglage"><small>3 installé(s) · ↻ à jour tout seul</small>'
    + '<p data-ecrit>retour</p></div>'
    + '<div class="px-hote" data-ploxion="wiki-du-labo"><b>retour</b></div>'
    + '<nav aria-label="koin gauche">Café du Grütli</nav></body></html>', { url: 'capacitor://localhost/' });
  return W;
}

test('⟡ la langue posée sur l\'app : à chaud, et retour au français ; le labo et ce qu\'on écrit ne bougent pas', async () => {
  const W = page(), D = W.document;
  const L = installerLangue({ W, interne: (id) => id !== 'wiki-du-labo' });
  assert.equal(L.appliquer('fr'), 'fr');
  assert.equal(D.querySelector('h3').textContent, 'toi');
  L.appliquer('de');
  assert.equal(D.documentElement.lang, 'de');
  assert.equal(D.querySelector('h3').textContent, 'du');
  assert.equal(D.querySelector('button').textContent, '▦ Schaufenster');
  assert.equal(D.querySelector('input').placeholder, 'Einstellung suchen');
  assert.equal(D.querySelector('small').textContent, '3 installiert · ↻ aktualisiert sich selbst');
  assert.equal(D.querySelector('[data-ecrit]').textContent, 'retour');
  assert.equal(D.querySelector('[data-ploxion="wiki-du-labo"] b').textContent, 'retour');
  assert.equal(D.querySelector('nav').getAttribute('aria-label'), 'linker koin');
  assert.equal(D.querySelector('nav').textContent, 'Café du Grütli');
  // ce que le code pose ensuite (en français) passe aussi
  const n = D.createElement('span'); n.textContent = '9 lieux autour'; D.querySelector('.px-hote').append(n);
  D.querySelector('h3').textContent = 'le look';
  await attendre();
  assert.equal(n.textContent, '9 Orte in der Nähe');
  assert.equal(D.querySelector('h3').textContent, 'der Look');
  // une autre langue, puis le retour au français : le français d'origine revient
  L.appliquer('it');
  assert.equal(D.querySelector('h3').textContent, 'il look');
  assert.equal(D.querySelector('input').placeholder, 'cerca un\'impostazione');
  L.appliquer('fr');
  assert.equal(D.querySelector('h3').textContent, 'le look');
  assert.equal(D.querySelector('button').textContent, '▦ vitrine');
  assert.equal(D.querySelector('input').placeholder, 'chercher un réglage');
  assert.equal(n.textContent, '9 lieux autour');
  L.arreter();
});
