// ◺ (0.99.67) le mode xerboxion du 20.11 (c5fbad1, mis de côté le 21.11) réconcilié avec la bande entre les koins de la 0.99.57 / 0.99.60.
// RS-7 coord #2120 : « intégrer tout le xer des koins dans le mode xerboxion de ploxi0n, pck chill-tekk c'est pour chiller, xerboxion pour essayer
// d'arriver aussi loin que moi » : en xerboxion, les koins toujours, le dock s'efface, les koins dessinés avec les glyphes de l'alien ; UNE SEULE
// bande entre les deux koins du bas (celle de l'app), plus le « trou » de c5fbad1 qui en dessinait une seconde au même endroit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { creerKoins, glyphesAlien, TRI } from '../src/app/koins.js';
import { page } from './aide.mjs';

const lire = (f) => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');

test('◺ en xerboxion, les koins toujours (comme en organique), dessinés avec les glyphes de l\'alien ; le dock s\'efface', () => {
  const main = lire('main.js');
  assert.match(main, /actif: \(\) => prefs\.lire\(\)\.mode === 'organique' \|\| prefs\.lire\(\)\.mode === 'xerboxion' \|\| !!prefs\.lire\(\)\.koins,/);
  assert.match(main, /glyphes: \(\) => \(prefs\.lire\(\)\.mode === 'xerboxion' \? glyphesAlien\(window\) : null\)/, 'les glyphes de l\'alien, en xerboxion seulement');
  assert.match(lire('app/app.css'), /html\.px-koins \.px-dock\{display:none\}/, 'les koins posés : plus de dock');
  // les réglages le disent comme pour l'organique : plus de bascule des koins ni du dock en xerboxion
  const rg = lire('app/reglages.js');
  assert.match(rg, /P && \(P\.mode === 'organique' \|\| P\.mode === 'xerboxion'\) \? '<div class="l"><span>Les koins<small>dans l\\'' \+ P\.mode \+ ', les koins remplacent le dock/);
  assert.match(rg, /P && P\.mode !== 'organique' && P\.mode !== 'xerboxion' \? bascule\('data-pb="dock"'/);
});

test('◺ les glyphes de l\'alien : lus dans xb:alien:glyphes (les bornes de jOSXerkoin), les koins redessinés quand ils changent', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document;
    assert.equal(glyphesAlien(W), null, 'sans réglage : null (le dessin d\'avant)');
    W.localStorage.setItem('xb:alien:glyphes', JSON.stringify({ k1: 0.9, k2: 0.5, k3: 0.25, trait: 3, traitI: 9 }));
    assert.deepEqual(glyphesAlien(W), { k1: 0.9, k2: 0.5, k3: 0.25, rond: 3, trait: 3, traitI: 4 }, 'borné (traitI ≤ 4), les défauts pour le reste');
    W.localStorage.setItem('xb:alien:glyphes', '{pas du json'); assert.equal(glyphesAlien(W), null);
    let gl = { k1: 0.9, k2: 0.5, k3: 0.25, rond: 3, trait: 3, traitI: 1.5 };
    const k = creerKoins({ W, actif: () => true, glyphes: () => gl });
    k.poser();
    const poly = () => [...D.querySelectorAll('[data-koin="gauche"] svg polygon')].map(x => [x.getAttribute('points'), x.getAttribute('stroke-width'), x.getAttribute('class')]);
    // le koin k1 : le triangle du coin réduit à 90 % vers son centre (33,3 ; 66,7) ; l'intérieur k2 ; le centre k3, plein
    assert.deepEqual(poly(), [['3.33,96.67 3.33,6.67 93.33,96.67', '3', null], ['16.67,83.33 16.67,33.33 66.67,83.33', '1.5', 'i'], ['25.00,75.00 25.00,50.00 50.00,75.00', null, 'f']]);
    assert.ok(D.querySelector('[data-koin="droite"] svg g[transform]'), 'le koin de droite, en miroir');
    // l'alien change ses glyphes ; au retour (un changement de ploxion), les koins suivent
    gl = { ...gl, k1: 0.8, k3: 0 };
    W.dispatchEvent(new W.CustomEvent('ploxi0n:courant'));
    assert.equal(poly()[0][0], '6.67,93.33 6.67,13.33 86.67,93.33'); assert.equal(poly().length, 2, 'k3 = 0 : pas de centre');
    // hors xerboxion (glyphes null) : le dessin d'avant
    gl = null; k.poser();
    assert.equal(poly()[0][0], '0,100 0,0 100,100');
    assert.equal(TRI(false), TRI(false, null));
  } finally { p.fin(); }
});

test('◺ une seule bande entre les deux koins du bas : celle de l\'app ; plus de trou dessiné par-dessus, celle d\'un ploxion s\'efface', async () => {
  assert.ok(!existsSync(new URL('../src/app/koin-trou.js', import.meta.url)), 'le trou de c5fbad1 (une seconde bande) n\'est pas revenu');
  assert.doesNotMatch(lire('main.js'), /creerTrou|koin-trou/);
  const css = lire('app/app.css');
  assert.match(css, /html\.px-koins \.tsk-trou\{display:none!important\}/, 'la bande qu\'un ploxion du labo pose dans le trou (jOSTsoins) s\'efface en mode koin');
  assert.doesNotMatch(css, /\.px-trou\{/);
  // dans la page : les koins posés comme en xerboxion, avec la bande d'un ploxion du labo dans le trou → une seule bande visible
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document;
    const st = D.createElement('style'); st.textContent = 'html.px-koins .tsk-trou{display:none!important}'; D.head.appendChild(st);
    const tsk = D.createElement('div'); tsk.className = 'tsk-trou'; D.body.appendChild(tsk);
    const k = creerKoins({ W, actif: () => true, glyphes: () => ({ k1: 0.92, k2: 0.55, k3: 0.2, rond: 3, trait: 2.2, traitI: 1.5 }) });
    k.poser();
    assert.equal(D.querySelectorAll('.px-koin-barre').length, 1, 'la bande de l\'app');
    assert.equal(D.querySelector('.px-koin-barre').hidden, false);
    assert.equal(D.querySelectorAll('.px-trou').length, 0);
    assert.equal(W.getComputedStyle(tsk).display, 'none', 'la bande du ploxion : cachée');
  } finally { p.fin(); }
});
