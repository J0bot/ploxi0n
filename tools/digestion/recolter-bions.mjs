// 🦀 la digestion : les bions que composent les ploxions récoltés (build/digestion/digestion.json), depuis le labo (/px/bion-app/<nom>.js),
// rangés tels quels (données). Pour monter les ploxions avec leurs vrais bions (tools/faux-iphone/parcours-tous.mjs).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
const DOSSIER = 'build/digestion/bions', dormir = (ms) => new Promise(r => setTimeout(r, ms));
mkdirSync(DOSSIER, { recursive: true });
const noms = [...new Set(JSON.parse(readFileSync('build/digestion/digestion.json', 'utf8')).flatMap(d => Object.keys(d.bions)))].sort();
let ok = 0, absents = [];
for (const n of noms) {
  const f = DOSSIER + '/' + n + '.js'; if (existsSync(f)) { ok++; continue; }
  for (let i = 0; i < 5; i++) {
    const r = await fetch('https://labo.j0bot.ch/px/bion-app/' + encodeURIComponent(n) + '.js', { headers: { 'User-Agent': 'ploxi0n-digestion' } });
    if (r.status === 429) { await dormir(800 * 2 ** i); continue; }
    const t = await r.text();
    if (r.status === 200 && t.includes(n) && !/^\s*<(!doctype|html)/i.test(t)) { writeFileSync(f, t); ok++; } else absents.push(n + ' (' + r.status + ')');
    break;
  }
  await dormir(120);
}
console.log(JSON.stringify({ bions: noms.length, recoltes: ok, absents }));
