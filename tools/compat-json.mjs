#!/usr/bin/env node
// tools/compat-json.mjs — les badges du marketplace : ploxions-audit.csv + ploxions-compat.csv → public/marketplace/compat.json
// { id: { classe, verdict, complet, absents } } (lu par le marketplace dans l'app : jamais de réseau pour ça)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const R = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function csv(f) {
  if (!existsSync(f)) return [];
  const [h, ...l] = readFileSync(f, 'utf8').trim().split('\n'); const H = h.split(',');
  return l.map(x => { const v = []; let c = '', q = false; for (const ch of x) { if (ch === '"') q = !q; else if (ch === ',' && !q) { v.push(c); c = ''; } else c += ch; } v.push(c); return Object.fromEntries(H.map((k, i) => [k, v[i]])); });
}
const out = {};
for (const a of csv(path.join(R, 'ploxions-audit.csv'))) out[a.id] = { classe: a.classe };
for (const c of csv(path.join(R, 'ploxions-compat.csv'))) out[c.id] = { ...(out[c.id] || {}), verdict: c.verdict, complet: c.complet, absents: c.absents || '' };
mkdirSync(path.join(R, 'public/marketplace'), { recursive: true });
writeFileSync(path.join(R, 'public/marketplace/compat.json'), JSON.stringify(out));
console.log(Object.keys(out).length + ' ploxions → public/marketplace/compat.json');
