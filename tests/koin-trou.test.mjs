// ◺ (20.11, RS-7 coord #2120 : « intégrer tout le xer des koins dans le mode xerboxion de ploxi0n ») le trou entre les deux koins du bas, toujours
// comblé en mode xerboxion : le dessin de jOSTsoins, la bande auto du ploxion ouvert (le VRAI bion jOSXerkoin), le wormion adapté à l'accueil, la
// bande d'un ploxion (jOSTsoins, coord) qui fait foi ; les koins dessinés avec les glyphes de l'alien ; le panneau du mode en une ligne
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { creerKoins, glyphesAlien, TRI } from '../src/app/koins.js';
import { creerTrou, dessinTrou, decoupe, basBande, tailleBande } from '../src/app/koin-trou.js';
import { creerModes, LIGNE_XB } from '../src/app/modes.js';
import { page, attendre } from './aide.mjs';

const XK = readFileSync(new URL('./donnees/jOSXerkoin.labo.js', import.meta.url), 'utf8');
const lire = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
/** jsdom ne met rien en page : la taille d'un koin dessiné (76 px, app.css) */
const taille = (el, l, h = l) => { Object.defineProperty(el, 'offsetWidth', { configurable: true, get: () => l }); Object.defineProperty(el, 'offsetHeight', { configurable: true, get: () => h }); };

async function monter(p, o = {}) {
  const W = p.w, D = W.document;
  let mode = o.mode || 'xerboxion', id = o.id || null, appels = 0; const faits = [];
  const koins = creerKoins({ W, actif: () => mode === 'xerboxion' || mode === 'organique', actions: {}, glyphes: () => (mode === 'xerboxion' ? glyphesAlien(W) : null) });
  koins.poser(); for (const k of D.querySelectorAll('.px-koin')) taille(k, 76);
  if (o.xerkoin) W.eval(XK);
  const trou = creerTrou({ W, actif: () => mode === 'xerboxion' && koins.actif(), courant: () => { appels++; return id; }, xerkoin: o.xerkoin ? () => Promise.resolve(W.jOSXerkoin) : null,
    ouvrirKoins: () => { faits.push('ouvrir'); koins.ouvrir('gauche', 1); }, vibrer: (x) => faits.push('vibrer:' + x), glyphes: () => glyphesAlien(W), surNav: (x) => { faits.push('nav:' + x); koins.poser(); }, attente: 30 });
  trou.maj();
  return {
    W, D, koins, trou, faits, appels: () => appels,
    el: () => D.querySelector('.px-trou'),
    // une navigation du routeur : la classe de #ploxi0n change (le trou l'observe)
    aller: async (x) => { id = x; const r = D.getElementById('ploxi0n'); r.classList.toggle('px-mode-ploxion', !!x); r.classList.toggle('px-mode-accueil', !x); await attendre(5); },
    mode: async (m) => { mode = m; koins.poser(); for (const k of D.querySelectorAll('.px-koin')) taille(k, 76); trou.maj(); await attendre(5); },
  };
}

test('◺ le dessin du trou : celui de jOSTsoins (trapèzes emboîtés à 1,5 · 0,2 K · 0,34 K, le point à 0,66 K), la bande au-dessus de l\'indicateur d\'accueil', () => {
  const K = 76, l = 390, s2 = Math.SQRT2;
  // la formule de jOSTsoins (dessinerTrou), recopiée telle quelle
  const tr = (t) => [[t + t * s2, t], [l - t - t * s2, t], [l - (K - t) - t * s2, K - t], [K - t + t * s2, K - t]].map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ');
  const svg = dessinTrou(K, l);
  assert.ok(svg.includes('viewBox="0 0 390 76"') && svg.includes('preserveAspectRatio="none"'));
  assert.ok(svg.includes('<polygon class="o" points="' + tr(1.5) + '"/>'), 'le contour');
  assert.ok(svg.includes('<polygon class="i" points="' + tr(K * 0.2) + '"/>') && svg.includes('<polygon class="i" points="' + tr(K * 0.34) + '"/>'), 'les deux trapèzes emboîtés');
  assert.ok(svg.includes('<circle class="pt" cx="195.0" cy="50.2" r="5"/>'), 'le point du présent');
  assert.equal(decoupe(K), 'polygon(0 0,100% 0,calc(100% - 76px) 100%,76px 100%)', 'la découpe de jOSTsoins');
  // la bande : au ras du trou sans indicateur (4 px, comme jOSTsoins), au-dessus avec (34 px de marge : 28), jamais hors du trou
  assert.equal(basBande(K, 0), 4); assert.equal(basBande(K, 34), 28); assert.equal(basBande(K, 80), 36, 'au moins 30 px de koin dans le trou');
  assert.equal(basBande(K, 34, 20), 8, 'des koins relevés : moins à relever');
  // la taille d'un koin : jOSTsoins sans indicateur (60 au plus, 46 pour les 5 cellules de coord), sous le haut du trou avec
  assert.equal(tailleBande(l, K, 3, 4), 60); assert.equal(tailleBande(l, K, 5, 4), 46);
  assert.equal(tailleBande(l, K, 3, 28), 38, 'relevée de 28 : 38 + 8 de cadre tiennent dans les 76 px');
  assert.ok(28 + tailleBande(l, K, 3, 28) + 8 <= K, 'la bande reste dans le trou');
  assert.equal(tailleBande(300, K, 9, 4), 30, 'jamais moins de 30 px');
});

test('◺ à l\'accueil : le wormion adapté seul, à la hauteur des koins ; un toucher ouvre les koins, ouverts ils passent par-dessus (le trou s\'efface)', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const avant = p.compte.photo();   // ce que la page (shim, routeur) fait déjà tourner
    const t = await monter(p);
    const el = t.el();
    assert.ok(el, 'le trou est là'); assert.equal(el.hidden, false); assert.equal(el.getAttribute('role'), 'button');
    assert.equal(el.style.height, '76px', 'la hauteur des koins'); assert.equal(el.style.bottom, '0px', 'au ras de l\'écran, comme les koins');
    assert.equal(el.querySelectorAll('.px-trou-f polygon').length, 3); assert.ok(el.querySelector('.px-trou-f .pt'));
    assert.ok(!el.hasAttribute('data-bande') && !el.querySelector('.xk__b'), 'pas de bande à l\'accueil');
    assert.ok(!p.w.document.documentElement.classList.contains('px-trou-bande'), 'l\'accueil garde sa mise en page');
    el.click();
    assert.deepEqual(t.faits.filter((f) => f === 'ouvrir'), ['ouvrir']); assert.deepEqual(t.koins.etape(), { gauche: 1, droite: 1 });
    await attendre(40);
    assert.ok(el.hasAttribute('data-ouvert'), 'koins ouverts : le trou s\'efface (ils passent par-dessus)');
    t.koins.replier(); await attendre(5);
    assert.ok(!el.hasAttribute('data-ouvert'), 'refermés : il revient');
    const apres = p.compte.photo();
    assert.equal(apres.raf, avant.raf, 'aucun requestAnimationFrame (le Pi)'); assert.equal(apres.interval, avant.interval, 'aucun intervalle');
    t.trou.arreter(); t.koins.replier();
    assert.equal(p.w.document.querySelector('.px-trou'), null, 'arrêté : il s\'en va');
  } finally { p.fin(); }
});

test('◺ un ploxion ouvert : sa bande AUTO (le vrai jOSXerkoin : ses actions dans les triangles) ; un triangle lance son action, ailleurs les koins s\'ouvrent', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document;
    W.jOSApps = W.jOSApps || {};
    W.jOSApps.p1 = { describe: () => ({ v: 1, id: 'p1', items: [{ p: 1, kind: 'action', label: 'lancer', act: { port: 'ploxion.p1.go', payload: { x: 1 } } }, { p: 2, kind: 'action', label: 'arrêter', act: { port: 'ploxion.p1.stop' } }] }) };
    const recus = []; W.jOSPorts.on('ploxion.p1.go', (d) => recus.push(d));
    const t = await monter(p, { xerkoin: true });
    await t.aller('p1');
    assert.ok(t.faits.includes('nav:p1'), 'le ploxion a changé (les glyphes de l\'alien sont relus)');
    assert.equal(t.el().hidden, false); assert.ok(!t.el().querySelector('.xk__b'), 'un temps de grâce : la bande d\'un ploxion arrive peut-être');
    await attendre(60);
    const el = t.el(), b = el.querySelector('.px-trou-b .xk__b');
    assert.ok(el.hasAttribute('data-bande') && b, 'la bande auto');
    assert.ok(b.getAttribute('style').includes('--t:60px'), 'la taille de jOSTsoins (pas d\'indicateur d\'accueil dans jsdom)');
    assert.equal(el.querySelector('.px-trou-b').style.bottom, '4px');
    const tris = [...el.querySelectorAll('[data-a]')]; assert.equal(tris.length, 2, 'deux actions, deux triangles');
    assert.equal(tris[0].querySelector('title').textContent, 'lancer');
    assert.ok(D.documentElement.classList.contains('px-trou-bande'), 'le ploxion s\'arrête au-dessus du trou'); assert.match(D.documentElement.style.getPropertyValue('--px-trou'), /^\d+px$/);
    tris[0].dispatchEvent(new W.MouseEvent('click', { bubbles: true }));
    assert.deepEqual(recus, [{ x: 1 }], 'jOSXerkoin.lancer : l\'action part sur le bus du ploxion'); assert.ok(t.faits.includes('vibrer:selection'));
    assert.ok(!t.faits.includes('ouvrir'), 'un triangle ne déplie pas les koins');
    el.querySelector('.px-trou-f').dispatchEvent(new W.MouseEvent('click', { bubbles: true }));
    assert.ok(t.faits.includes('ouvrir'), 'ailleurs dans le trou : les koins');
    t.koins.replier(); await attendre(5);
    // retour à l'accueil : la bande s'en va, la mise en page aussi
    await t.aller(null);
    assert.ok(!t.el().hasAttribute('data-bande') && !t.el().querySelector('.xk__b')); assert.ok(!D.documentElement.classList.contains('px-trou-bande'));
    // l'observateur ne tourne pas en rond (le trou qui se pose ne relance pas le trou)
    const n0 = t.appels(); await attendre(60); assert.equal(t.appels(), n0, 'au repos, plus rien ne se recalcule');
  } finally { p.fin(); }
});

test('◺ coord pose sa bande dans le trou (jOSTsoins) : elle fait foi ; cachée tant que les koins s\'ouvrent et qu\'elle n\'a pas repris leur taille', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document;
    const t = await monter(p, { xerkoin: true });
    await t.aller('coord');
    // ~300 ms après l'ouverture : le trou de jOSTsoins, posé dans body (comme dessinerTrou)
    const tsk = D.createElement('div'); tsk.className = 'tsk-trou'; tsk.style.cssText = 'position:fixed;left:0;right:0;bottom:0px;height:76px;z-index:2147482980'; D.body.appendChild(tsk);
    await attendre(5);
    assert.equal(t.el().hidden, true, 'rien de plus : la bande de coord fait foi'); assert.ok(!tsk.hasAttribute('data-px-attend'));
    await attendre(60); assert.ok(!t.el().querySelector('.xk__b'), 'jamais de bande auto par-dessus');
    // les koins s'ouvrent : la bande de coord se cache, le trou de l'app (vide) s'efface avec eux
    t.koins.ouvrir('gauche', 1); await attendre(40);
    assert.ok(tsk.hasAttribute('data-px-attend')); assert.equal(t.el().hidden, false); assert.ok(t.el().hasAttribute('data-ouvert'));
    // jOSTsoins mesure le koin agrandi (transform) : il redessine un trou géant ; refermés, elle attend sa vraie taille
    tsk.style.height = '243px'; t.koins.replier(); await attendre(5);
    assert.ok(tsk.hasAttribute('data-px-attend'), 'pas un trou géant à l\'écran'); assert.ok(!t.el().hasAttribute('data-ouvert')); assert.ok(!t.el().hasAttribute('data-bande'), 'le trou reste comblé, sans bande auto');
    tsk.style.height = '76px'; await attendre(5);
    assert.ok(!tsk.hasAttribute('data-px-attend'), 'sa taille reprise : elle revient'); assert.equal(t.el().hidden, true);
    // coord passe derrière (le routeur cache ce qu'il accroche) : l'accueil reprend le trou ; il revient : sa bande, pas la bande auto
    await t.aller(null); tsk.style.display = 'none'; await attendre(5);
    assert.equal(t.el().hidden, false);
    await t.aller('coord'); await attendre(60);
    assert.ok(!t.el().querySelector('.xk__b'), 'coord connu : sa propre bande, même avant qu\'elle revienne');
    tsk.style.display = ''; await attendre(5);
    assert.equal(t.el().hidden, true);
    // hors du mode xerboxion : le trou s'en va, rien ne reste
    await t.mode('organique');
    assert.equal(D.querySelector('.px-trou'), null); assert.ok(!tsk.hasAttribute('data-px-attend')); assert.ok(!D.documentElement.classList.contains('px-trou-bande'));
    tsk.remove();
  } finally { p.fin(); }
});

test('◺ hors du mode xerboxion (chill-tekk, organique, xerbot) : pas de trou', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    for (const m of ['organique', 'chill-tekk', 'xerbot']) { const t = await monter(p, { mode: m }); assert.equal(p.w.document.querySelector('.px-trou'), null, m); t.trou.arreter(); }
  } finally { p.fin(); }
});

test('▣ les koins natifs prennent les glyphes de l\'alien (xb:alien:glyphes) en mode xerboxion : les contours imbriqués de jOSXerkoin', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document;
    assert.equal(glyphesAlien(W), null, 'rien de réglé : le dessin d\'avant');
    W.localStorage.setItem('xb:alien:glyphes', JSON.stringify({ k1: 0.8, k2: 0.5, k3: 0, trait: 3, traitI: 1 }));
    assert.deepEqual(glyphesAlien(W), { k1: 0.8, k2: 0.5, k3: 0, rond: 3, trait: 3, traitI: 1 }, 'les défauts pour ce qui manque');
    W.localStorage.setItem('xb:alien:glyphes', JSON.stringify({ k1: 5, k2: 'x', traitI: -2 }));
    assert.deepEqual(glyphesAlien(W), { k1: 0.99, k2: 0.55, k3: 0.2, rond: 3, trait: 2.2, traitI: 0.3 }, 'les bornes de jOSXerkoin.regler');
    W.localStorage.setItem('xb:alien:glyphes', '{pas du json'); assert.equal(glyphesAlien(W), null);
    // le koin : réduit vers le centre du triangle (comme le koin d'une cellule du bion)
    const gl = { k1: 0.8, k2: 0.5, k3: 0.2, rond: 3, trait: 3, traitI: 1 };
    const s = TRI(false, gl);
    assert.ok(s.includes('points="6.67,93.33 6.67,13.33 86.67,93.33" stroke-width="3"'), 'le contour du koin (k1), le trait');
    assert.ok(s.includes('class="i" points="16.67,83.33 16.67,33.33 66.67,83.33" stroke-width="1"'), 'l\'intérieur (k2), le trait dedans');
    assert.ok(s.includes('points="26.67,73.33 26.67,53.33 46.67,73.33" class="f"'), 'le centre (k3)');
    assert.ok(!TRI(false, { ...gl, k3: 0 }).includes('class="f"'), 'k3 = 0 : pas de centre');
    assert.ok(TRI(true, gl).includes('scale(-1 1)'), 'le koin droit : le même, en miroir');
    // dans les koins : en xerboxion seulement, relus à chaque poser()
    W.localStorage.setItem('xb:alien:glyphes', JSON.stringify(gl));
    let mode = 'xerboxion';
    const k = creerKoins({ W, actif: () => true, actions: {}, glyphes: () => (mode === 'xerboxion' ? glyphesAlien(W) : null) });
    k.poser();
    const g = () => D.querySelector('[data-koin="gauche"] svg').innerHTML;
    assert.ok(g().includes('6.67,93.33'), 'xerboxion : les glyphes de l\'alien');
    W.localStorage.setItem('xb:alien:glyphes', JSON.stringify({ ...gl, k1: 0.9 })); k.poser();
    assert.ok(g().includes('3.33,96.67'), 'réglés de nouveau dans l\'alien : redessinés au retour');
    mode = 'organique'; k.poser();
    assert.ok(g().includes('26,74 26,42 58,74') && !g().includes('stroke-width'), 'les autres modes ne changent pas');
  } finally { p.fin(); }
});

test('⬡ le panneau du mode xerboxion dit en une ligne ce qu\'il fait ; les autres modes ne changent pas', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w; let mode = 'xerboxion';
    const prefs = { lire: () => ({ mode }), surChangement: () => {}, regler: async () => {} };
    const m = creerModes({ W, prefs });
    const h = m.panneau();
    assert.ok(h.includes(LIGNE_XB), 'la ligne au-dessus de l\'UI du labo');
    const txt = LIGNE_XB.replace(/<[^>]+>/g, '');
    assert.match(txt, /xer des koins/); assert.ok(!txt.includes('—'), 'pas de tiret long'); assert.ok(!/\p{Extended_Pictographic}/u.test(txt), 'des glyphes, pas d\'emoji');
    assert.ok(txt.length < 100, 'une ligne, pas un pavé');
    for (const x of ['chill-tekk', 'organique', 'xerbot']) { mode = x; assert.ok(!m.panneau().includes('px-mode-l'), x); }
  } finally { p.fin(); }
});

test('⬡ le câblage : les koins toujours en xerboxion, le trou sous les koins, la bande de coord sous eux aussi ; ⚙ › HUD et dock le dit', () => {
  const main = lire('src/main.js'), css = lire('src/app/app.css'), rg = lire('src/app/reglages.js');
  assert.ok(main.includes("actif: () => prefs.lire().mode === 'organique' || prefs.lire().mode === 'xerboxion' || !!prefs.lire().koins"), 'les koins en xerboxion');
  assert.ok(main.includes("glyphes: () => (prefs.lire().mode === 'xerboxion' ? glyphesAlien(window) : null)"), 'les glyphes de l\'alien : en xerboxion seulement');
  assert.ok(main.includes("creerTrou({ W: window, actif: () => prefs.lire().mode === 'xerboxion' && koins.actif()"), 'le trou : en xerboxion seulement');
  assert.ok(main.includes('xerkoin: xerkoinBion') && main.includes("ouvrirKoins: () => koins.ouvrir('gauche', 1)"));
  const z = (sel) => { const m = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\{[^}]*?z-index:(\\d+)').exec(css); return m ? +m[1] : null; };
  assert.equal(z('.px-trou'), 39); assert.equal(z('.px-koins-r'), 40);
  assert.ok(z('.px-trou') < z('.px-koins-r'), 'le trou sous les koins : ils s\'ouvrent par-dessus');
  assert.ok(css.includes('html.px-m-xerboxion .tsk-trou{z-index:39!important}'), 'la bande de coord aussi (jOSTsoins la pose au-dessus de tout)');
  assert.ok(css.includes('html.px-m-xerboxion .tsk-trou[data-px-attend]{visibility:hidden}'));
  assert.ok(css.includes('.px-trou[data-ouvert]{opacity:0;pointer-events:none}'));
  assert.ok(css.includes('html.px-trou-bande .px-mode-ploxion .px-scene>.px-hote:not(.px-flottant){bottom:var(--px-trou,0px)}'));
  assert.ok(rg.includes("P && P.mode === 'xerboxion' ? '<div class=\"l\"><span>Les koins<small>dans le xerboxion, les koins remplacent le dock"), 'pas de bascule des koins qui ne ferait rien');
  assert.ok(rg.includes("P.mode !== 'organique' && P.mode !== 'xerboxion' ? bascule('data-pb=\"dock\"'"), 'ni de dock');
});
