// ◺◿ (0.89) les koins remplacent le dock et le HUD (le carnet de RS-7) : ils grandissent d'un toucher à l'autre jusqu'aux cases ; une case agit
// et replie ; la barre des glyphes ; l'option coupée, rien ne reste
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerKoins, ETAPES } from '../src/app/koins.js';
import { GLYPHES } from '../src/app/glyphes.js';
import { page } from './aide.mjs';

test('◇ les glyphes du carnet : xeroction, tsoin, wormion, trion, portion, ploxion, xer', () => {
  for (const n of ['xeroction', 'tsoin', 'wormion', 'trion', 'portion', 'ploxion', 'xer']) assert.ok(GLYPHES[n] && GLYPHES[n].length > 20, n);
  assert.equal((GLYPHES.trion.match(/<polygon/g) || []).length, 3, 'trois triangles emboîtés');
  assert.equal((GLYPHES.ploxion.match(/<polygon/g) || []).length, 3, 'trois losanges emboîtés');
});

test('◺◿ (0.99.47) un toucher : le koin s\'ouvre (une seule animation) ; les quatre cases et la barre ; une case agit et referme', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document; let on = true; const faits = [];
    const actions = Object.fromEntries(['koins', 'temps', 'xers', 'carte', 'tsoin', 'accueil', 'toi', 'retour', 'minimiser', 'journal'].map(k => [k, () => faits.push(k)]));
    const k = creerKoins({ W, actif: () => on, actions });
    k.poser();
    assert.ok(D.documentElement.classList.contains('px-koins'), 'le dock et la barre laissent la place');
    const g = D.querySelector('[data-koin="gauche"]');
    assert.equal(ETAPES, 2, 'plus de tailles intermédiaires : fermé, ouvert');
    g.click(); assert.equal(g.getAttribute('data-etape'), '1'); assert.equal(D.querySelector('[data-koin="droite"]').getAttribute('data-etape'), '1', 'les deux s\'ouvrent ensemble');
    await new Promise(r => setTimeout(r, 40)); assert.ok(D.querySelector('.px-koins-r').classList.contains('px-koins-ouverts'), 'la classe qui lance l\'animation');
    assert.equal(D.querySelector('[data-cases="gauche"]').hidden, false); assert.equal(D.querySelector('[data-cases="droite"]').hidden, false);
    assert.deepEqual([...D.querySelectorAll('[data-cases] [data-koin-a]')].map(b => b.getAttribute('data-koin-a')), ['koins', 'xer']);
    assert.deepEqual([...D.querySelectorAll('[data-cases] [data-pad]')].map(b => b.getAttribute('data-pad')), ['wormion', 'portion'], '(0.92) des trackpads');
    assert.equal(D.querySelectorAll('.px-koin-barre [data-koin-a]').length, 10, '‹ › ⧗ ○ △ □ ◇ ✕ ⓘ ▁ (0.95 : ⓘ c\'est quoi ça ? ; 0.99.57 : ›)');
    // un toucher sur le portion (sans glisser) : la carte (la map)
    const pad = D.querySelector('[data-pad="portion"]');
    pad.dispatchEvent(new W.PointerEvent('pointerdown', { clientX: 50, clientY: 50, bubbles: true })); pad.dispatchEvent(new W.PointerEvent('pointerup', { clientX: 51, clientY: 50, bubbles: true }));
    assert.deepEqual(faits, ['carte']); assert.deepEqual(k.etape(), { gauche: 0, droite: 0 }, 'replié');
    assert.equal(D.querySelector('[data-cases="gauche"]').hidden, false, 'encore là pendant l\'animation de fermeture');
    await new Promise(r => setTimeout(r, 480)); assert.equal(D.querySelector('[data-cases="gauche"]').hidden, true, 'puis caché');
    // sans le choix des modes, la case xer ouvre « mes xers »
    g.click(); D.querySelector('[data-cases] [data-koin-a="xer"]').click(); assert.deepEqual(faits, ['carte', 'xers']);
    // le voile replie
    D.querySelector('[data-koin="droite"]').click(); assert.equal(D.querySelector('.px-koin-voile').hidden, false);
    D.querySelector('.px-koin-voile').click(); assert.deepEqual(k.etape(), { gauche: 0, droite: 0 });
    on = false; k.poser();
    assert.ok(!D.documentElement.classList.contains('px-koins')); assert.equal(D.querySelector('.px-koins-r'), null);
  } finally { p.fin(); }
});

test('⊠ (0.99.47) la case xer change de xer (les modes) sur place ; l\'appui long : mes xers ; le trion dit « ici, maintenant »', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document; let mode = 'chill-tekk'; const faits = [];
    const k = creerKoins({ W, actif: () => true, actions: {
      xers: () => faits.push('xers'),
      modes: () => [['organique', 'neurone'], ['chill-tekk', 'chilltekk'], ['xerboxion', 'xerboxion'], ['xerbot', 'xerbot']].map(([id, g]) => ({ id, glyphe: g, nom: id, on: id === mode })),
      choisirMode: (id) => { mode = id; faits.push('mode:' + id); }, sous_koins: () => '3 vivants · 2 voisins' } });
    k.poser();
    D.querySelector('[data-koin="gauche"]').click();
    assert.equal(D.querySelector('[data-koin-sous="koins"]').textContent, '3 vivants · 2 voisins');
    D.querySelector('[data-cases] [data-koin-a="xer"]').click();
    const z = D.querySelector('.px-koin-modes'); assert.equal(z.hidden, false);
    assert.deepEqual([...z.querySelectorAll('[data-koin-mode]')].map(b => b.getAttribute('data-koin-mode')), ['organique', 'chill-tekk', 'xerboxion', 'xerbot']);
    assert.equal(z.querySelector('.on').getAttribute('data-koin-mode'), 'chill-tekk');
    z.querySelector('[data-koin-mode="organique"]').click();
    assert.deepEqual(faits, ['mode:organique']); assert.deepEqual(k.etape(), { gauche: 0, droite: 0 }, 'le xer choisi, les koins se referment');
    // l'appui long
    D.querySelector('[data-koin="gauche"]').click();
    const x = D.querySelector('[data-cases] [data-koin-a="xer"]');
    x.dispatchEvent(new W.PointerEvent('pointerdown', { bubbles: true })); await new Promise(r => setTimeout(r, 600)); x.dispatchEvent(new W.PointerEvent('pointerup', { bubbles: true })); x.click();
    assert.deepEqual(faits, ['mode:organique', 'xers'], 'l\'appui long : mes xers, et pas les modes en plus');
  } finally { p.fin(); }
});

test('🏁 (0.99.47) chill-tekk est le mode de base à l\'installation ; en mode koin, l\'en-tête de l\'accueil s\'efface', async () => {
  const { PREFS_DEFAUT } = await import('../src/app/prefs.js');
  assert.equal(PREFS_DEFAUT.mode, 'chill-tekk');
  const { readFileSync } = await import('node:fs');
  const css = readFileSync(new URL('../src/app/app.css', import.meta.url), 'utf8');
  assert.ok(css.includes('html.px-koins .px-tete h1,html.px-koins .px-modes{display:none}'));
  assert.match(css, /\.px-koin-cases\{--s0:64px;[^}]*clip-path:polygon\(0 100%,0 calc\(\(1 - var\(--k\)\)/, 'le triangle qui s\'ouvre en carré');
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.match(main, /\n\s+xers: \(\) => routeur\.faire\('mes-xers'\), carte: \(\) => routeur\.faire\('map'\)/, 'les actions xers et carte ne sont plus dans un commentaire');
});

test('▭ (0.99.57) la bande entre les koins = la barre des glyphes, toujours là (fermé aussi) ; › le ploxion suivant ; le xer : l\'hypercube', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document; const faits = [];
    const k = creerKoins({ W, actif: () => true, actions: { suivante: () => faits.push('suivante'), retour: () => faits.push('retour'), minimiser: () => faits.push('minimiser') } });
    k.poser();
    const b = D.querySelector('.px-koin-barre');
    assert.equal(b.hidden, false, 'visible, koins fermés');
    assert.deepEqual([...b.querySelectorAll('[data-koin-a]')].map(x => x.getAttribute('data-koin-a')), ['retour', 'suivante', 'tsoin', 'temps', 'koins', 'carte', 'accueil', 'toi', 'quoi', 'minimiser']);
    b.querySelector('[data-koin-a="suivante"]').click(); b.querySelector('[data-koin-a="minimiser"]').click();
    assert.deepEqual(faits, ['suivante', 'minimiser']); assert.deepEqual(k.etape(), { gauche: 0, droite: 0 });
    D.querySelector('[data-koin="gauche"]').click(); await new Promise(r => setTimeout(r, 30));
    assert.ok(D.querySelector('[data-cases] [data-koin-a="xer"] svg polygon'), 'la case xer : l\'hypercube');
    D.querySelector('[data-koin="gauche"]').click(); await new Promise(r => setTimeout(r, 500));
    assert.equal(b.hidden, false, 'refermé, la bande reste');
  } finally { p.fin(); }
});

test('▭ (0.99.57) le CSS : la bande en trapèze entre les koins, le ploxion s\'arrête au-dessus, ◇ encadré dans un ploxion, les cases en tunnel', async () => {
  const { readFileSync } = await import('node:fs');
  const css = readFileSync(new URL('../src/app/app.css', import.meta.url), 'utf8');
  assert.match(css, /html\.px-koins \.px-mode-ploxion \.px-ecran>\.px-barre\{display:none\}/);
  assert.match(css, /html\.px-koins #ploxi0n\.px-mode-ploxion\{padding-bottom:var\(--kbande\)\}/); assert.match(css, /--kbande:calc\(56px \+ env\(safe-area-inset-bottom,0px\) \* \.35\)/, '(0.99.61) une bande fine');
  assert.match(css, /\.px-koin-barre\{--kb:var\(--kbande\);[^}]*clip-path:polygon\(var\(--kg\) 0,calc\(100% - var\(--kg\)\) 0,calc\(100% - var\(--kb\) - var\(--kg\)\) 100%/);
  assert.match(css, /#ploxi0n\.px-mode-ploxion~\.px-koins-r \.px-koin-barre \[data-koin-a="accueil"\],\.px-koin-barre \.px-kb-dans\{box-shadow/);
  assert.match(css, /html:not\(\.px-organique\) :is\(\.px-koin-cases>button,\.px-koin-pad\)\{border-radius:0;border:1\.5px solid var\(--acc\)/);
});

test('▭ (0.99.60) la bande, barre d\'accueil : ◇ prend le glyphe du ploxion où tu es ; glisser vers le haut minimise, de côté change de ploxion', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document; const faits = []; let cour = null;
    const k = creerKoins({ W, actif: () => true, actions: { minimiser: () => faits.push('minimiser'), precedente: () => faits.push('precedente'), suivante: () => faits.push('suivante'),
      accueil: () => faits.push('accueil'), courant: () => cour } });
    k.poser();
    const ac = () => D.querySelector('.px-koin-barre [data-koin-a="accueil"]');
    assert.ok(!ac().classList.contains('px-kb-dans'));
    cour = { id: 'mappion', nom: 'mappion', svg: '<svg class="px-g" data-test="mappion"></svg>' }; W.dispatchEvent(new W.CustomEvent('ploxi0n:courant'));
    assert.ok(ac().classList.contains('px-kb-dans') && ac().querySelector('[data-test="mappion"]'), 'le glyphe du ploxion, encadré'); assert.match(ac().getAttribute('aria-label'), /^mappion/);
    const b = D.querySelector('.px-koin-barre [data-koin-a="tsoin"]');
    const geste = (x0, y0, x1, y1) => { b.dispatchEvent(new W.PointerEvent('pointerdown', { bubbles: true, clientX: x0, clientY: y0 })); W.dispatchEvent(new W.PointerEvent('pointerup', { bubbles: true, clientX: x1, clientY: y1 })); b.click(); };
    geste(200, 800, 205, 740); assert.deepEqual(faits, ['minimiser'], 'vers le haut : minimiser, et le toucher du bouton est avalé');
    geste(100, 800, 200, 805); geste(250, 800, 150, 798); assert.deepEqual(faits, ['minimiser', 'precedente', 'suivante']);
    cour = null; W.dispatchEvent(new W.CustomEvent('ploxi0n:courant')); assert.ok(!ac().classList.contains('px-kb-dans'), 'revenu à l\'accueil : ◇');
  } finally { p.fin(); }
});
