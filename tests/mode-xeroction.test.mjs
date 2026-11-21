// ✕ (0.99.67, RS-7 coord #2221) « le mode xerbot de ploxi0n c'est le mode xeroction » : un seul mode, nommé xeroction, qui garde ce que faisait
// xerbot (le monde physique : le contrôleur, la blouse, le Bluetooth, la maison, la lampe, le NFC, le Wi-Fi, le bus xerbot du labo) ; un réglage
// « xerbot » rangé chez quelqu'un passe tout seul à « xeroction » (les préférences, un xer d'avant, un vieux widget, un vieux lien).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { MODES, creerModes, modeNormal } from '../src/app/modes.js';
import { creerPrefs } from '../src/app/prefs.js';
import { MODELES, nettoyerPrefs } from '../src/app/xers.js';
import { XERS_WIDGET } from '../src/natif/widgets-ploxions.js';
import { GLYPHES } from '../src/app/glyphes.js';

const fenetre = () => new JSDOM('<!doctype html><html><body><div class="px-accueil"></div></body></html>', { url: 'https://localhost/' }).window;
const fauxPrefs = (mode) => { let p = { mode }; const ab = new Set(); return { lire: () => p, regler: async (x) => { p = { ...p, ...x }; for (const f of ab) f(p); }, surChangement: (f) => { ab.add(f); return () => ab.delete(f); } }; };

test('✕ un seul mode : xeroction (son glyphe, son nom) ; plus de xerbot dans les modes', () => {
  assert.deepEqual(MODES.map(m => m[0]), ['organique', 'chill-tekk', 'xerboxion', 'xeroction']);
  const x = MODES.find(m => m[0] === 'xeroction'); assert.deepEqual(x, ['xeroction', 'xeroction', 'xeroction']); assert.ok(GLYPHES.xeroction, 'le glyphe du xeroction');
  assert.equal(modeNormal('xerbot'), 'xeroction'); for (const m of ['organique', 'chill-tekk', 'xerboxion', 'xeroction', '']) assert.equal(modeNormal(m), m);
});

test('✕ le mode xeroction garde ce que faisait xerbot : le panneau du monde physique, le bus xerbot du labo ; un « xerbot » pas encore migré l\'ouvre aussi', async () => {
  for (const rangé of ['xeroction', 'xerbot']) {
    const W = fenetre(), emis = [];
    W.jOSPorts = { on() {}, emit: (...a) => emis.push(a) };
    const m = creerModes({ W, prefs: fauxPrefs(rangé), controleur: null });
    assert.equal(m.mode(), 'xeroction', rangé + ' → xeroction');
    assert.ok(W.document.documentElement.classList.contains('px-m-xeroction'), 'html.px-m-xeroction'); assert.ok(!W.document.documentElement.classList.contains('px-m-xerbot'));
    const acc = W.document.querySelector('.px-accueil'); acc.innerHTML = m.panneau(); m.attacher(acc);
    const p = acc.querySelector('.px-mode-p.px-xeroction'); assert.ok(p, 'le panneau');
    assert.match(p.querySelector('.px-grave').textContent, /^✕ xeroction · le monde physique$/);
    for (const k of ['cape', 'ble', 'maison', 'lampe', 'nfc', 'wifi', 'envoyer']) assert.ok(p.querySelector('[data-xb="' + k + '"]'), 'garde ' + k);
    assert.doesNotMatch(p.innerHTML, /\p{Extended_Pictographic}/u, 'pas un emoji dans le panneau');
    // le bus du labo garde son nom (le contrat xerbot v1) : une commande part sur « xerbot »
    p.querySelector('[data-xb-cmd]').value = 'avance 1'; p.querySelector('[data-xb="envoyer"]').click(); await new Promise(r => setTimeout(r, 10));
    assert.equal(emis.length, 1); assert.deepEqual([emis[0][0], emis[0][1], emis[0][2].cmd, emis[0][2].d], ['xerbot', 'command', 'avance', 1]);
  }
});

test('✕ la migration douce : les réglages rangés, un réglage reçu, un xer d\'avant, un modèle, un widget, un lien', async () => {
  // les préférences rangées en « xerbot » passent à « xeroction », une fois, et sont réécrites
  const m = new Map([['reglages/app', { mode: 'xerbot', organiqueVu: true, barreClavierVue: true, iconesAppleVu: true }]]);
  const boxion = { get: async (s, k) => m.get(s + '/' + k), put: async (s, k, v) => { m.set(s + '/' + k, v); } };
  const pr = creerPrefs({ W: fenetre(), boxion }); await pr.pret;
  assert.equal(pr.lire().mode, 'xeroction'); assert.equal(m.get('reglages/app').mode, 'xeroction', 'réécrit');
  // un réglage qui arrive encore en « xerbot » (un vieux lien, un vieux widget, un parcours) : xeroction
  await pr.regler({ mode: 'xerbot' }); assert.equal(pr.lire().mode, 'xeroction'); assert.equal(m.get('reglages/app').mode, 'xeroction');
  // un xer d'avant (mes xers, un lien partagé) : son mode suit ; le modèle s'appelle xeroction (l'ancien nom marche encore, xers.test)
  assert.deepEqual(nettoyerPrefs({ mode: 'xerbot' }), { mode: 'xeroction' });
  assert.ok(MODELES.some(x => x.id === 'xeroction' && x.prefs.mode === 'xeroction')); assert.ok(!MODELES.some(x => x.id === 'xerbot'));
  assert.doesNotMatch(JSON.stringify(MODELES.find(x => x.id === 'xeroction')), /\p{Extended_Pictographic}/u, 'le modèle en glyphes (plus le robot emoji)');
  // le widget « xer » et le lien ploxi0n://xer/<mode>
  assert.ok(XERS_WIDGET.some(x => x[0] === 'xeroction')); assert.ok(!XERS_WIDGET.some(x => x[0] === 'xerbot'));
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.match(main, /xer: \(u\) => \{ const m = modeNormal\(decodeURIComponent\(/, 'ploxi0n://xer/xerbot mène au xeroction');
  // le CSS : la grille cède la place au panneau en xeroction ; plus aucun px-m-xerbot
  const css = readFileSync(new URL('../src/app/app.css', import.meta.url), 'utf8');
  assert.match(css, /html\.px-m-xeroction \.px-accueil>\.px-vues,html\.px-m-xeroction \.px-accueil>\.px-pages/); assert.doesNotMatch(css, /px-m-xerbot/);
});
