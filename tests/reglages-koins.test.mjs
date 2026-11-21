// ⊞ (0.99.67, RS-7 coord #2203) « transformer les réglages en koins de réglages accessibles partout depuis le koin gauche de partout », avec la
// capture des réglages de ploxi0n (PLOXIONS : mises à jour, fréquence, les bions aussi, vérifier, installés). Une case réglages dans le koin
// gauche ouvre une grille de koins qu'un toucher bascule (comme le labo : montrerReglages / basculerReglage) ; « ⊞ tous les réglages » au bout.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { creerReglagesKoins, KOINS_REGLAGES } from '../src/app/reglages-koins.js';
import { creerKoins, CASES } from '../src/app/koins.js';
import { GLYPHES } from '../src/app/glyphes.js';
import { page } from './aide.mjs';

const fauxPrefs = (p0 = {}) => { let p = { haptique: true, grain: true, themeVivant: true, telecommande: true, barreClavier: false, calme: false, ...p0 }; return { lire: () => ({ ...p }), regler: async (x) => { p = { ...p, ...x }; return { ...p }; } }; };
const fauxMaj = (r0 = {}, verifier = async () => ({ mis: ['wiki', 'xp'], erreurs: [] })) => { let r = { auto: true, bions: true, heures: 6, ...r0 }; return { reglage: () => ({ ...r }), regler: async (x) => { r = { ...r, ...x }; return { ...r }; }, verifier }; };

test('⊞ les koins de réglages : les mises à jour de la capture d\'abord, puis l\'app, puis installés et tous les réglages', async () => {
  for (const [, g] of KOINS_REGLAGES) assert.ok(GLYPHES[g], 'le glyphe ' + g);
  const prefs = fauxPrefs(), maj = fauxMaj(), ouverts = [];
  const r = creerReglagesKoins({ prefs, maj, ouvrir: (id) => ouverts.push(id) });
  const l = r.liste();
  assert.deepEqual(l.map(x => x.id), ['maj-auto', 'maj-heures', 'maj-bions', 'maj-verifier', 'haptique', 'calme', 'grain', 'themeVivant', 'telecommande', 'barreClavier', 'installes', 'tout']);
  const e = Object.fromEntries(l.map(x => [x.id, x.etat]));
  assert.deepEqual([e['maj-auto'], e['maj-heures'], e['maj-bions'], e['maj-verifier'], e.haptique, e.calme, e.barreClavier, e.tout], ['oui', '6 h', 'oui', 'maintenant', 'oui', 'non', 'non', '']);
  assert.equal(l.find(x => x.id === 'tout').nom, 'tous les réglages');
  for (const x of l) assert.doesNotMatch(x.nom + x.etat, /\p{Extended_Pictographic}|—/u, 'des mots courts, sans emoji ni tiret long');
  // un toucher bascule : les mises à jour
  assert.equal(await r.basculer('maj-auto'), 'ok'); assert.equal(maj.reglage().auto, false);
  assert.equal(await r.basculer('maj-bions'), 'ok'); assert.equal(maj.reglage().bions, false);
  const h = []; for (let i = 0; i < 3; i++) { await r.basculer('maj-heures'); h.push(maj.reglage().heures); }
  assert.deepEqual(h, [24, 1, 6], 'la fréquence tourne : 6 h → 24 h → 1 h → 6 h');
  const v = r.basculer('maj-verifier'); assert.equal(r.liste().find(x => x.id === 'maj-verifier').etat, '…', 'pendant la vérification');
  assert.equal(await v, 'ok'); assert.equal(r.liste().find(x => x.id === 'maj-verifier').etat, '2 à jour');
  // l'app
  for (const [id, avant] of [['haptique', true], ['calme', false], ['grain', true], ['themeVivant', true], ['telecommande', true], ['barreClavier', false]]) {
    assert.equal(await r.basculer(id), 'ok'); assert.equal(prefs.lire()[id], !avant, id);
  }
  // les deux portes : la page entière, le gestionnaire ; les koins se referment
  assert.equal(await r.basculer('tout'), 'fermer'); assert.equal(await r.basculer('installes'), 'fermer'); assert.deepEqual(ouverts, ['reglages-app', 'gestion']);
  assert.equal(await r.basculer('rien'), null);
  // hors ligne, ou sans module des mises à jour
  const r2 = creerReglagesKoins({ prefs, maj: fauxMaj({}, async () => ({ horsLigne: true, mis: [], erreurs: [] })) }); await r2.basculer('maj-verifier');
  assert.equal(r2.liste().find(x => x.id === 'maj-verifier').etat, 'hors ligne');
  assert.ok(!creerReglagesKoins({ prefs }).liste().some(x => x.id.startsWith('maj-')), 'sans maj : pas de koins des mises à jour');
});

test('⊞ la case réglages du koin gauche ouvre la grille, un toucher bascule sur place, tous les réglages referme les koins', async () => {
  assert.deepEqual(CASES.gauche.map(c => c[1]), ['koins', 'temps', 'reglages'], 'sous le trion et le wormion');
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, prefs = fauxPrefs(), ouverts = [];
    const r = creerReglagesKoins({ prefs, maj: fauxMaj(), ouvrir: (id) => ouverts.push(id) });
    const k = creerKoins({ W, actif: () => true, calme: () => true, actions: { reglages: () => r.liste(), basculerReglage: (id) => r.basculer(id) } });
    k.poser();
    D.querySelector('[data-koin="gauche"]').click();
    const c = D.querySelector('[data-cases="gauche"] [data-koin-a="reglages"]'); assert.ok(c, 'la case ⊞'); assert.ok(c.querySelector('svg.px-g'));
    c.click();
    const z = D.querySelector('.px-koin-reglages'), R = D.querySelector('.px-koins-r');
    assert.equal(z.hidden, false); assert.ok(R.classList.contains('px-koins-reglages'), 'les cases s\'effacent derrière la grille');
    assert.deepEqual(k.etape(), { gauche: 1, droite: 1 }, 'les koins restent ouverts');
    assert.equal(z.querySelectorAll('[data-koin-reg]').length, 12);
    const hap = () => z.querySelector('[data-koin-reg="haptique"]');
    assert.ok(hap().classList.contains('on')); assert.equal(hap().querySelector('em').textContent, 'oui');
    hap().click(); await new Promise(f => setTimeout(f, 10));
    assert.equal(prefs.lire().haptique, false); assert.ok(!hap().classList.contains('on'), 'redessiné sur place'); assert.equal(hap().querySelector('em').textContent, 'non');
    assert.equal(z.hidden, false, 'la grille reste : on peut en basculer plusieurs');
    // la case ⊞ encore : la grille se range ; rouverte, ⊞ tous les réglages ouvre la page et referme tout
    c.click(); assert.equal(z.hidden, true); c.click(); assert.equal(z.hidden, false);
    z.querySelector('[data-koin-reg="tout"]').click(); await new Promise(f => setTimeout(f, 10));
    assert.deepEqual(ouverts, ['reglages-app']); assert.deepEqual(k.etape(), { gauche: 0, droite: 0 }); assert.equal(z.hidden, true);
  } finally { p.fin(); }
  // branché dans l'app, et dessiné
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), css = readFileSync(new URL('../src/app/app.css', import.meta.url), 'utf8');
  assert.match(main, /reglages: \(\) => reglagesKoins\.liste\(\), basculerReglage: \(id\) => reglagesKoins\.basculer\(id\),/);
  assert.match(main, /const reglagesKoins = creerReglagesKoins\(\{ prefs, maj, ouvrir: \(id\) => routeurProxy\.ouvrir\(id\) \}\);/);
  assert.match(css, /\.px-koin-reglages\{position:fixed;left:12px;right:12px;bottom:calc\(var\(--kbande\) \+ 8px\);z-index:43;display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /\.px-koins-reglages \.px-koin-cases\{visibility:hidden\}/);
});
