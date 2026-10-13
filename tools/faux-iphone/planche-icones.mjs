// ⬡ LA PLANCHE DES ICÔNES (0.55) : chaque ploxion en icône xerkion (src/app/xerkion-icone.js), rendue par le vrai Chromium, par planches.
//   node tools/faux-iphone/planche-icones.mjs <sortie> [registry.json du labo] [xerkions.json du labo]
// Sans registre : les ploxions de l'app (internes + pack) et le jeu de glyphes. Avec : aussi tous les ploxions du labo, 150 par planche.
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { svgXerkion, GPAL, TYPES, FORMES, CATEGORIES } from '../../src/app/xerkion-icone.js';
import { GLYPHES, glyphe } from '../../src/app/glyphes.js';
const require = createRequire(import.meta.url);
const { chromium } = (() => { for (const p of ['playwright', '/opt/node-tools/node_modules/playwright']) { try { return require(p); } catch (e) { /* suivant */ } } throw new Error('Playwright introuvable'); })();

const [sortie = 'build/icones', registre, xerkions] = process.argv.slice(2);
mkdirSync(sortie, { recursive: true });
const ICI = path.dirname(new URL(import.meta.url).pathname);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pack = JSON.parse(readFileSync(path.join(ICI, '../../public/ploxions/index.json'), 'utf8')).ploxions || [];
const internes = [['marketplace', 'Marketplace'], ['xer-en-ligne', 'Le xer en ligne'], ['banc', 'Banc d\'essai'], ['cape', 'La blouse'], ['sante', 'Santé'],
  ['journal-tsoins', 'Journal des tsoins'], ['reglages-app', 'Réglages'], ['portion', 'Portion'], ['gestion', 'Gestion']].map(([id, nom]) => ({ id, nom }));
const xk = new Map(xerkions ? (JSON.parse(readFileSync(xerkions, 'utf8')).items || []).map(x => [x.id, x]) : []);
const labo = registre ? (JSON.parse(readFileSync(registre, 'utf8')).ploxions || []).map(p => { const x = xk.get(p.id); return { id: p.id, nom: p.name, categorie: p.cat_label, cat: p.category, ...(x ? { koins: (x.koins || []).length, centre: x.center } : {}) }; }) : [];
const internesCat = internes.map(p => ({ ...p, categorie: 'ploxi0n' }));

const css = 'body{margin:0;background:#05070c;color:#cfd8ea;font:12px ui-monospace,monospace;padding:18px;width:1100px}h1{font:700 15px system-ui;letter-spacing:.08em;text-transform:uppercase;color:#3fe0d0;margin:0 0 4px}p{margin:0 0 14px;color:#7d8aa5}'
  + '.g{display:grid;grid-template-columns:repeat(10,1fr);gap:14px 8px}.c{display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center}.c svg.xki{width:72px;height:72px;border-radius:17px;display:block}'
  + '.c span{max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10.5px}.gl .c svg{width:44px;height:44px;fill:none;stroke:#3fe0d0;stroke-width:6;stroke-linecap:round;stroke-linejoin:round}.gl .c svg .f{fill:#3fe0d0;stroke:none}.gl .c svg .p{stroke-dasharray:7 7;stroke-width:4.5}'
  + '.pal{display:flex;gap:10px;margin:0 0 14px}.pal i{display:inline-flex;align-items:center;gap:6px;font-style:normal}.pal b{width:18px;height:18px;border-radius:5px;display:inline-block}';
const cellule = (p) => '<div class="c">' + svgXerkion(p) + '<span>' + esc(p.nom || p.id) + '</span></div>';
const planches = [];
planches.push({ nom: '01-app', html: '<h1>ploxi0n · les icônes xerkion</h1><p>le polygone-xer (5 à 8 côtés), ses koins, le cœur (wormion · portion · kion), le disque et le glyphe du ploxion — palettes des hubs du labo</p>'
  + '<div class="g">' + [...internesCat, ...pack].map(cellule).join('') + '</div>' });
const exemple = { ploxion: { id: 'exemple' }, xerkion: { id: 'xerkion-ex', koins: 6, centre: 'wormion' }, xer: { id: 'xer' }, cubion: { id: 'cubion' }, kion: { id: 'kion' }, koin: { id: 'koin' },
  wormion: { id: 'wormion' }, spherion: { id: 'spherion' }, portion: { id: 'portion' }, bion: { id: 'bion' }, boxion: { id: 'boxion' } };
const xks = [3, 4, 5, 6, 7, 8, 9, 10, 12].map(n => ({ id: 'xerkion-n' + n, nom: n + ' koins', koins: n, centre: ['wormion', 'portion', 'kion'][n % 3] }));
planches.unshift({ nom: '00-legende', html: '<h1>la forme = le type</h1><p>' + TYPES.map(t => t + ' : ' + FORMES[t]).join(' · ') + '</p><div class="g">' + TYPES.map(t => '<div class="c">' + svgXerkion(exemple[t]) + '<span>' + t + '</span></div>').join('') + '</div>'
  + '<h1 style="margin-top:22px">un xerkion a autant de côtés que de koins</h1><p>ses ploxions (labo.j0bot.ch/px/xerkions.json), de 3 à 12 ; sans koins : l\'octogone-xer</p><div class="g">' + xks.map(cellule).join('') + '</div>'
  + '<h1 style="margin-top:22px">la couleur et le glyphe = la catégorie</h1><p>quand le ploxion n\'a pas de glyphe à lui (ses mots), il prend celui de sa catégorie</p><div class="g">' + Object.keys(CATEGORIES).map((c, i) => '<div class="c">' + svgXerkion({ id: 'z' + i, cat: c }) + '<span>' + c + '</span></div>').join('') + '</div>' });
planches.push({ nom: '02-glyphes', html: '<h1>le jeu de glyphes</h1><p>' + Object.keys(GLYPHES).length + ' glyphes au trait (src/app/glyphes.js) : le lexique, puis l\'interface</p><div class="g gl">'
  + Object.keys(GLYPHES).map(n => '<div class="c">' + glyphe(n) + '<span>' + esc(n) + '</span></div>').join('') + '</div>' });
for (let i = 0; i < labo.length; i += 150) planches.push({ nom: '03-labo-' + (i / 150 + 1), html: '<h1>les ploxions du labo · ' + (i + 1) + '–' + Math.min(i + 150, labo.length) + ' / ' + labo.length + '</h1><p>labo.j0bot.ch/px/registry.json</p><div class="g">' + labo.slice(i, i + 150).map(cellule).join('') + '</div>' });

const nav = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const page = await nav.newPage({ viewport: { width: 1136, height: 800 }, deviceScaleFactor: 1 });
for (const pl of planches) {
  await page.setContent('<!doctype html><meta charset="utf-8"><style>' + css + '</style>' + pl.html);
  await page.screenshot({ path: path.join(sortie, pl.nom + '.png'), fullPage: true });
  console.log(path.join(sortie, pl.nom + '.png'));
}
await nav.close();
