#!/usr/bin/env node
// tools/extraire-ploxions.mjs — du ploxion du labo (app.blade.php, degré D1) au BUNDLE statique de ploxi0n (degré D3) :
//   public/ploxions/<id>/app.js + app.css + les scripts locaux qu'il charge (copiés depuis public/ du labo), et public/ploxions/index.json.
// Refuse un ploxion qui contient encore du Blade ({{ }}, @csrf, @auth…) : il ne tourne pas sans Laravel (brief, « Compatibilité »).
// Copie aussi le vrai jOSb du labo (resources/views/ploxions/_bions.blade.php) dans public/vendor/jOSb.js : réutiliser, pas réécrire.
// Usage : node tools/extraire-ploxions.mjs [--labo …] [ids…]   (sans ids : la liste de ploxions.embarques.json)
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BLADE, decouper } from './bundle.mjs';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const iL = args.indexOf('--labo');
const LABO = iL >= 0 ? args.splice(iL, 2)[1] : (process.env.LABO || '/home/debian/labo/my_website2');
const ids = args.length ? args : JSON.parse(readFileSync(path.join(RACINE, 'ploxions.embarques.json'), 'utf8')).ploxions;
const PUB = path.join(RACINE, 'public');
const registre = JSON.parse(execFileSync('php', [path.join(RACINE, 'tools/registre-ploxions.php')], { env: { ...process.env, LABO }, maxBuffer: 64 << 20 }).toString());
const parId = new Map(registre.map(p => [p.id, p]));
const sha = (s) => createHash('sha256').update(s).digest('hex');

// jOSb : le runtime partagé des ploxions, tel quel
mkdirSync(path.join(PUB, 'vendor'), { recursive: true });
const bions = decouper(readFileSync(path.join(LABO, 'resources/views/ploxions/_bions.blade.php'), 'utf8'));
if (BLADE.test(bions.js)) throw new Error('_bions contient du Blade : à revoir');
writeFileSync(path.join(PUB, 'vendor/jOSb.js'), '/* jOSb — copié du labo (resources/views/ploxions/_bions.blade.php) par tools/extraire-ploxions.mjs */\n' + bions.js);

const index = [], refus = [];
for (const id of ids) {
  const p = parId.get(id);
  if (!p) { refus.push([id, 'absent du registre']); continue; }
  const f = path.join(LABO, 'resources/views/ploxions', p.app || id, 'app.blade.php');
  if (!existsSync(f)) { refus.push([id, 'pas de app.blade.php']); continue; }
  const d = decouper(readFileSync(f, 'utf8'));
  if (BLADE.test(d.js) || BLADE.test(d.css) || BLADE.test(d.html)) { refus.push([id, 'reste du Blade (à extraire côté labo d\'abord)']); continue; }
  if (d.html) { refus.push([id, 'du HTML hors <script>/<style> (le contrat jOSApps rend tout depuis mount)']); continue; }
  const dossier = path.join(PUB, 'ploxions', id);
  rmSync(dossier, { recursive: true, force: true }); mkdirSync(dossier, { recursive: true });
  const deps = [];
  for (const u of d.deps) {
    if (/^https?:\/\//i.test(u)) { deps.push(u); continue; }
    const local = u.split(/[?#]/)[0];
    if (!local.startsWith('/') || !existsSync(path.join(LABO, 'public', local))) { refus.push([id, 'dépendance introuvable ' + u]); continue; }
    mkdirSync(path.dirname(path.join(PUB, local)), { recursive: true });
    copyFileSync(path.join(LABO, 'public', local), path.join(PUB, local));
    deps.push(local);
  }
  writeFileSync(path.join(dossier, 'app.js'), d.js);
  writeFileSync(path.join(dossier, 'app.css'), d.css);
  index.push({ id, nom: p.name || id, icone: p.icon || '▣', hash: sha(d.js + '\n' + d.css), deps, octets: d.js.length + d.css.length });
}
mkdirSync(path.join(PUB, 'ploxions'), { recursive: true });
writeFileSync(path.join(PUB, 'ploxions/index.json'), JSON.stringify({ v: 1, source: 'labo', ploxions: index }, null, 1) + '\n');
console.log(`${index.length} ploxion(s) extrait(s) : ${index.map(x => x.id).join(', ') || '—'}`);
for (const [id, r] of refus) console.log(`  refusé ${id} : ${r}`);
if (refus.length && !args.length) process.exitCode = 1;
