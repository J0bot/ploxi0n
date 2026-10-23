// 🦀 LA DIGESTION, étape 1 (0.99.17) : récolter le code de tous les ploxions publics du labo, par le même chemin que l'app (app.js, sinon le
// bundle extrait de la page : bundleDeLaPage). Rien n'est exécuté : le code est rangé tel quel (données, pas de confiance), puis lu comme du
// texte par le digesteur Rust (rust/ploxi-digest).
//   NODE_USE_ENV_PROXY=1 node tools/digestion/recolter.mjs [dossier=build/digestion/ploxions] [--max N]
import { mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { bundleDeLaPage } from '../../src/marketplace/depot.js';

const SOURCE = 'https://labo.j0bot.ch', DOSSIER = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'build/digestion/ploxions';
const MAX = +(process.argv[process.argv.indexOf('--max') + 1] || 0) || Infinity;
const dormir = (ms) => new Promise(r => setTimeout(r, ms));
async function patient(url, accept) {
  for (let i = 0; ; i++) {
    const r = await fetch(url, { headers: { Accept: accept, 'User-Agent': 'ploxi0n-digestion' } });
    if (r.status !== 429 || i >= 5) return { status: r.status, texte: await r.text() };
    const ra = +(r.headers.get('retry-after') || 0); await dormir(Math.min(10000, ra > 0 ? ra * 1000 : 800 * 2 ** i));
  }
}
mkdirSync(DOSSIER, { recursive: true });
const reg = JSON.parse((await patient(SOURCE + '/px/registry.json', 'application/json')).texte);
const ids = (Array.isArray(reg) ? reg : reg.items || reg.ploxions || []).filter(p => p && p.id && p.enabled !== false && p.hasScreen !== false).map(p => p.id).slice(0, MAX);
let ok = 0, refus = 0, deja = 0; const echecs = [];
for (const id of ids) {
  const f = path.join(DOSSIER, id.replace(/[^\w.-]/g, '_') + '.js');
  if (existsSync(f) && statSync(f).size > 0) { deja++; continue; }
  try {
    let r = await patient(SOURCE + '/px/' + encodeURIComponent(id) + '/app.js', 'application/javascript');
    let js = r.status === 200 && !/^\s*<(!doctype|html)/i.test(r.texte) ? r.texte : null;
    if (!js) { const pg = await patient(SOURCE + '/px/' + encodeURIComponent(id), 'text/html'); js = pg.status === 200 ? bundleDeLaPage(pg.texte, id) : null; }
    if (js) { writeFileSync(f, js); ok++; } else { refus++; echecs.push(id); }
  } catch (e) { refus++; echecs.push(id + ' (' + e.message + ')'); }
  await dormir(150);
}
console.log(JSON.stringify({ registre: ids.length, recoltes: ok, deja, refus, echecs: echecs.slice(0, 20) }));
