// ▢ (0.99.67, RS-7 coord #2227-2229, 21.11) LES ICÔNES À L'APPLE : « quand on installe des ploxions avec ploxi0n, ils ont le logo à l'Apple comme
// celui du xeroction ou du tsoin » ; « ça doit donner feeling comme si c'était l'OS de base d'Apple d'un iPhone ». Le carré arrondi d'Apple (la
// super-ellipse, rayon 22,37 % du côté), un fond sombre, le glyphe au trait des xers du Figma (traits fins et pâles, contours emboîtés), centré,
// dans sa couleur ; la grille et les noms comme l'écran d'accueil d'un iPhone. Le style de base ; xerboxion et glyphe seul restent au choix.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { svgXerkion, specXerkion, SQUIRCLE, cheminSquircle, IOS, GPAL, STYLES, STYLE_BASE, traitFigma, glypheFerme } from '../src/app/xerkion-icone.js';
import { GLYPHES } from '../src/app/glyphes.js';
import { PREFS_DEFAUT, creerPrefs } from '../src/app/prefs.js';
import { JSDOM } from 'jsdom';
import { page } from './aide.mjs';

test('▢ le style de base : apple ; le carré d\'Apple (la super-ellipse), le fond sombre, le glyphe pâle au centre, rien de rempli', () => {
  assert.equal(STYLE_BASE, 'apple'); assert.deepEqual(STYLES, ['apple', 'xerboxion', 'glyphe'], 'les deux autres restent au choix');
  assert.equal(PREFS_DEFAUT.styleIcones, 'apple');
  const p = { id: 'spotify', nom: 'Spotify', cat: 'son' }, s = specXerkion(p), C = IOS[s.pal], svg = svgXerkion(p);
  assert.match(svg, /data-style="apple"/); assert.match(svg, /data-type="ploxion"/);
  assert.ok(svg.includes('<path d="' + SQUIRCLE + '" fill="' + C.fond + '"/>'), 'la super-ellipse, pleine du fond sombre');
  assert.ok(!/<rect width="100" height="100"/.test(svg), 'pas de carré plein : les coins restent transparents');
  // le fond : sombre ; le trait : la couleur de la palette, pâlie
  const lum = (h) => { const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
  for (const [i, c] of IOS.entries()) { assert.ok(lum(c.fond) < 0.16, 'un fond sombre (' + c.fond + ')'); assert.ok(lum(c.trait) > lum(GPAL[i].a), 'un trait plus pâle que la palette (' + c.trait + ')'); }
  assert.match(svg, new RegExp('<g transform="translate\\([\\d.]+ [\\d.]+\\) scale\\(0\\.66?\\)" fill="none" stroke="' + C.trait + '"'), 'le glyphe au centre, réduit, au trait');
  // jamais de remplissage : le seul fill (hors none) est le fond ; ni id, ni filtre, ni classe à styler (le même SVG au DOM et au canvas)
  assert.deepEqual((svg.match(/ fill="(?!none)[^"]*"/g) || []), [' fill="' + C.fond + '"']);
  assert.ok(!/ id=|filter| class="[fp]"/.test(svg));
  assert.equal(svgXerkion(p), svg, 'en cache');
  // chaque ploxion de l'app a son glyphe (plus six téléphones de la catégorie ploxi0n)
  assert.deepEqual(['passe', 'systeme', 'proche', 'autour', 'ambiances', 'inviter'].map(id => specXerkion({ id, cat: 'ploxi0n' }).glyphe), ['wormion', 'terminal', 'proche', 'lieu', 'vague', 'partager']);
  // une perso garde son style ; l'ancien « glyphe seul » aussi
  assert.match(svgXerkion(p, { perso: { style: 'xerboxion' } }), /data-style="xerboxion"/);
  assert.match(svgXerkion(p, { seul: true }), /data-style="glyphe"/);
  assert.match(svgXerkion(p, { style: 'glyphe', perso: { style: 'apple' } }), /data-style="apple"/, 'la perso passe devant le style de l\'app');
  // un clip de l'écran d'accueil d'iOS : le carré plein (iOS pose son masque lui-même)
  const clip = svgXerkion(p, { masque: false });
  assert.match(clip, /<rect width="100" height="100" fill="#[0-9a-f]{6}"\/>/); assert.ok(!clip.includes(SQUIRCLE));
  // une photo remplit la super-ellipse
  assert.match(svgXerkion(p, { photo: 'data:image/jpeg;base64,AAAA' }), /<clipPath id="xkq"><path d="M[^"]+Z"\/><\/clipPath><image href="data:image\/jpeg;base64,AAAA"/);
});

test('▢ la super-ellipse d\'Apple : rayon 22,37 % du côté, les coins continus (le lissage de Figma, 0,6)', () => {
  // p = (1 + lissage) × R : là où la courbe quitte le côté droit ; l'arc au milieu du coin a le rayon R
  assert.ok(SQUIRCLE.startsWith('M64.21 0c'), SQUIRCLE.slice(0, 20)); assert.equal((SQUIRCLE.match(/a22\.37 22\.37 0 0 1 /g) || []).length, 4, 'quatre coins, un arc chacun');
  assert.match(SQUIRCLE, /L100 64\.21.*L35\.79 100.*L0 35\.79.*Z$/, 'les quatre côtés droits, symétriques');
  assert.equal(cheminSquircle(100), SQUIRCLE); assert.ok(cheminSquircle(1024).startsWith('M657.49 0c'), 'à toutes les tailles (une icône 1024 : rayon 229)'); assert.match(cheminSquircle(1024), /a229\.07 229\.07 /);
});

test('▢ le trait du Figma : des contours emboîtés pour une forme fermée, deux contours parallèles pour un trait ouvert', () => {
  assert.ok(glypheFerme(GLYPHES.coeur)); assert.ok(glypheFerme(GLYPHES.portion)); assert.ok(!glypheFerme(GLYPHES.musique)); assert.ok(!glypheFerme(GLYPHES.globe), 'une ligne : ouvert');
  // le cœur (une forme) : cinq cœurs emboîtés vers le centre, le trait gardé fin à chaque échelle
  const c = traitFigma(GLYPHES.coeur, { trait: 2, fond: '#111111' });
  assert.deepEqual([...c.matchAll(/scale\(([\d.]+)\)/g)].map(m => +m[1]), [0.8, 0.62, 0.46, 0.32]);
  assert.match(c, /scale\(0\.32\) translate\(-50 -50\)" stroke-width="6\.25"/, '2 / 0,32 : le même trait fin');
  // le wormion (cinq cercles) a déjà ses contours : il reste tel quel ; le portion (quatre carrés) en gagne un
  assert.equal((traitFigma(GLYPHES.wormion).match(/<g/g) || []).length, 1); assert.equal((traitFigma(GLYPHES.portion).match(/<g/g) || []).length, 2);
  // la note : son trait, et deux contours autour (l'union des traits élargie puis recreusée au fond)
  const n = traitFigma(GLYPHES.musique, { trait: 2, fond: '#111111', ecart: 3.5 });
  assert.match(n, /<g stroke-width="16\.0" stroke-opacity="0\.5">.*<g stroke="#111111" stroke-width="12\.0">.*<g stroke-width="9\.0" stroke-opacity="0\.75">.*<g stroke="#111111" stroke-width="5\.0">.*<g stroke-width="2">/s);
  // jamais de remplissage, même pour un point plein (class="f") ou un glyphe du labo qui porte un fill
  assert.ok(!/class="f"|fill="#/.test(traitFigma(GLYPHES.koin + '<circle cx="50" cy="50" r="4" fill="#fff"/>')));
});

test('▢ les réglages d\'avant passent une fois à l\'Apple (l\'ancienne base) ; « glyphe seul » choisi exprès reste ; <html> le dit pour la grille', async () => {
  const boxion = (v) => { const m = new Map([['reglages/app', v]]); return { m, get: async (s, k) => m.get(s + '/' + k), put: async (s, k, x) => { m.set(s + '/' + k, x); } }; };
  const doc = () => { const W = new JSDOM('<!doctype html><html><body></body></html>').window; W.cls = { has: (c) => W.document.documentElement.classList.contains(c) }; return W; };
  for (const [avant, apres] of [[{ styleIcones: 'xerboxion' }, 'apple'], [{}, 'apple'], [{ styleIcones: 'glyphe' }, 'glyphe'], [{ styleIcones: 'xerboxion', iconesAppleVu: true }, 'xerboxion']]) {
    const b = boxion({ ...avant, organiqueVu: true, barreClavierVue: true }), W = doc(), pr = creerPrefs({ W, boxion: b });
    await pr.pret; assert.equal(pr.lire().styleIcones, apres, JSON.stringify(avant));
    assert.equal(b.m.get('reglages/app').iconesAppleVu, true, 'la marque posée : la bascule ne revient plus');
    pr.appliquer(); assert.equal(W.cls.has('px-icones-apple'), apres === 'apple', 'html.px-icones-apple : ' + apres);
  }
  // une écriture qui impose le glyphe seul (glyphes) : pas la grille à l'Apple
  const b = boxion({ ecriture: 'glyphes', organiqueVu: true, barreClavierVue: true, iconesAppleVu: true }), W = doc(), pr = creerPrefs({ W, boxion: b });
  await pr.pret; pr.appliquer(); assert.equal(W.cls.has('px-icones-apple'), false);
});

test('▢ partout dans l\'app : l\'accueil, les docks, le marketplace, les réglages, les installés ; la grille et les noms d\'un iPhone', async () => {
  // l'accueil (le routeur) : le style de l'app, apple de base
  const p = await page({ avion: true, ploxions: ['xp', 'clickion'] });
  try {
    p.routeur.accueil(); await new Promise(r => setTimeout(r, 30));
    const ic = p.w.document.querySelector('.px-tuile .px-ic svg.xki');
    assert.ok(ic, 'une tuile de l\'accueil'); assert.equal(ic.getAttribute('data-style'), 'apple');
  } finally { p.fin(); }
  // chaque appel suit le réglage (plus de « glyphe seul » en dur) : main.js (marketplace, gestion, cube, carte…), le routeur, le HUD, les mini docks
  const lire = (f) => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');
  const main = lire('main.js');
  assert.doesNotMatch(main + lire('app/routeur.js') + lire('app/hud.js') + lire('app/minidocks.js'), /styleIcones === 'glyphe'/);
  assert.ok((main.match(/svgXerkion\([px], \{ style: prefs\.lire\(\)\.styleIcones \}\)/g) || []).length >= 7, 'marketplace, gestion, cube, chill, carte…');
  assert.match(main, /enregistrerMarketplace\(\{ depot, vibrer, icone: \(x\) => svgXerkion\(x, \{ style: prefs\.lire\(\)\.styleIcones \}\)/);
  // les réglages : les ploxions installés, les signatures, les épinglés, Face ID ont leur icône (plus l'emoji du labo ni le glyphe nu)
  const rg = lire('app/reglages.js');
  assert.doesNotMatch(rg, /glyphePloxion|esc\(p\.icone \|\| '▣'\)|esc\(p\.icone \+ ' ' \+ p\.nom\)/);
  assert.equal((rg.match(/<span class="ic ic-x">' \+ icone\(p\)/g) || []).length, 3); assert.match(rg, /title="' \+ esc\(p\.nom\) \+ '" aria-label="' \+ esc\(p\.nom \|\| p\.id\) \+ '">' \+ icone\(p\)/);
  assert.match(rg, /seg\('styleIcones', STYLES_ICONES\.map\(v => \[v, nomStyle\(v\)\]\), P\.styleIcones \|\| STYLE_BASE/);
  // le CSS : les cadres s'effacent autour du carré d'Apple ; la grille, la taille, la police du système, une ligne de nom
  const css = lire('app/app.css');
  assert.match(css, /:root :is\(\.px-ic,\.px-h-b,\.px-md-ic,\.px-at-apercu,\.px-fx-tete i\):has\(\.xki\[data-style="apple"\]\)\{background:none;border:0;box-shadow:none;border-radius:0;overflow:visible\}/);
  assert.match(css, /html\.px-icones-apple \.px-grille\{grid-template-columns:repeat\(auto-fill,minmax\(72px,1fr\)\);gap:22px 4px\}/);
  assert.match(css, /html\.px-icones-apple \.px-tuile \.px-ic\{width:60px;height:60px\}/);
  assert.match(css, /html\.px-icones-apple \.px-tuile>span:last-child\{display:block;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font:400 12px\/1\.25 -apple-system,BlinkMacSystemFont/);
  assert.match(lire('marketplace/marketplace.js'), /\.mk-tuile\.mk-xk\{background:none !important;box-shadow:none !important;border-radius:0 !important\}\.mk-tuile\.mk-xk:has\(\.xki\[data-style="apple"\]\)\{border:0 !important\}/, 'le marketplace pose l\'icône sans cadre (ni le carré autour du carré d\'Apple)');
});
