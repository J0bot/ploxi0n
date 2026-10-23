// 🦀 la digestion : les bions que composent les ploxions récoltés (build/digestion/digestion.json), depuis le labo (/px/bion-app/<nom>.js),
// rangés tels quels (données). Pour monter les ploxions avec leurs vrais bions (tools/faux-iphone/parcours-tous.mjs).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
const DOSSIER = 'build/digestion/bions', dormir = (ms) => new Promise(r => setTimeout(r, ms));
mkdirSync(DOSSIER, { recursive: true });
import { bionsTouches } from '../../src/marketplace/depot.js';
// (0.99.19) comme l'app (depot.js : visiter) : les bions que les bions touchent aussi (jOSEngine → jOS3D), jusqu'au bout
const file = [...new Set(JSON.parse(readFileSync('build/digestion/digestion.json', 'utf8')).flatMap(d => Object.keys(d.bions)))].sort(), vus = new Set();
let ok = 0, absents = [];
while (file.length) {
  const n = file.shift(); if (vus.has(n)) continue; vus.add(n);
  const f = DOSSIER + '/' + n + '.js';
  if (!existsSync(f)) for (let i = 0; i < 5; i++) {
    const r = await fetch('https://labo.j0bot.ch/px/bion-app/' + encodeURIComponent(n) + '.js', { headers: { 'User-Agent': 'ploxi0n-digestion' } });
    if (r.status === 429) { await dormir(800 * 2 ** i); continue; }
    const t = await r.text();
    if (r.status === 200 && t.includes(n) && !/^\s*<(!doctype|html)/i.test(t)) writeFileSync(f, t); else absents.push(n + ' (' + r.status + ')');
    await dormir(120);
    break;
  }
  if (existsSync(f)) { ok++; for (const b of bionsTouches(readFileSync(f, 'utf8'), n)) if (!vus.has(b)) file.push(b); }
}
const noms = [...vus];
console.log(JSON.stringify({ bions: noms.length, recoltes: ok, absents }));
