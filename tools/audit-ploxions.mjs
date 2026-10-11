#!/usr/bin/env node
// tools/audit-ploxions.mjs — LE TRI AUTOMATIQUE des ploxions du labo pour ploxi0n v1 (brief « ploxi0n — brief agents v1 iOS », 11.10.2026,
// piste 2). Déterministe, sans réseau, lecture seule du dépôt du labo.
//
// Pour chaque ploxion de config/ploxions.php :
//   type    url | ecran | absent      url = la config pointe une page (config.url / base_url) ; absent = aucun app.blade.php
//   degre   D0 | D1 | D3 | D4         D4 = un module WASM dans xerboxion-rt/ploxions/<id> ; D3 = des assets web-<id> servis par le core ;
//                                     D1 = un ploxion client jOSApps servi par Laravel ; D0 = rien de tout ça (page Laravel)
//   blade   oui | non                 reste-t-il du Blade ({{ }}, {!! !!}, @csrf, @auth, @if…) ? (les commentaires {{-- --}} ne comptent pas)
//   reseau  les appels trouvés : routes du serveur, URL externes, primitives (fetch, XHR, WebSocket, EventSource, sendBeacon)
//           en excluant ce que le shim couvre : /xion/emit, /xion/snapshot, POST /chat
//   xion    oui | non                 utilise jOSPorts (le bus) ?
//   classe  A  écran + aucun autre appel réseau        → hors ligne direct, v1
//           B  écran + d'autres routes du serveur       → à rediriger vers boxion_local
//           C  à URL, ou service externe obligatoire    → marqué « online only »
// Sorties : ploxions-audit.csv (id, type, degre, blade, classe, xion, bions, appels, admin, enabled, octets) + ploxions-audit.md (résumé,
// top des routes appelées par les B, top des bions, candidats A à embarquer).
// Usage : node tools/audit-ploxions.mjs [--labo /home/debian/labo/my_website2] [--rt /home/debian/xerboxion-rt] [--sortie .]
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const LABO = arg('--labo', process.env.LABO || '/home/debian/labo/my_website2');
const RT = arg('--rt', '/home/debian/xerboxion-rt');
const SORTIE = arg('--sortie', path.resolve(ICI, '..'));

// le registre : config/ploxions.php évalué par PHP (helpers Laravel remplacés par leurs valeurs par défaut)
const registre = JSON.parse(execFileSync('php', [path.join(ICI, 'registre-ploxions.php')], { env: { ...process.env, LABO }, maxBuffer: 64 << 20 }).toString());

// ce que le shim couvre (brief, section « Shim jOS »)
const COUVERT = [/^\/xion\/emit\b/, /^\/xion\/snapshot\b/, /^\/chat\b/];
// des assets statiques (embarquables dans le bundle), pas des routes
const ASSET = /^\/(vendor|js|css|img|images|fonts|icons|sounds|audio|media|models|wasm|bions|downloads|data)\/|\.(js|mjs|css|json|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|wasm|mp3|ogg|wav|glb|gltf|txt|md)(\?|$)/i;
const PRIMITIVES = { fetch: /\bfetch\s*\(/, xhr: /\bXMLHttpRequest\b/, websocket: /\bnew\s+WebSocket\s*\(/, eventsource: /\bnew\s+EventSource\s*\(/, beacon: /\bsendBeacon\s*\(/ };
// des bions qui touchent le réseau eux-mêmes : le shim doit les brancher sur boxion_local (ou le ploxion retombe sur son repli)
const BIONS_RESEAU = new Set(['jOSBoxion', 'jOSStore', 'jOSFiles', 'jOSSocial', 'jOSLive', 'jOSZone', 'jOSPresence', 'jOSPartage', 'jOSShare', 'jOSCarte', 'jOSMusique', 'jOSXion', 'jOSTemps', 'jOSIdee', 'jOSChat', 'jOSVeille', 'jOSApi']);
const BLADE = /\{\{(?!--)|\{!!|@(csrf|auth|guest|endauth|if|elseif|else|endif|foreach|endforeach|include|json|php|endphp|isset|can|env|push|stack|section|yield|vite|method|lang|unless)\b/;

function nettoyer(src) { return src.replace(/\{\{--[\s\S]*?--\}\}/g, ''); }
function scripts(src) { return [...src.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n'); }
// les littéraux de chaîne (sans gérer les échappements exotiques : un audit, pas un parseur)
function litteraux(js) { const out = []; for (const m of js.matchAll(/(['"`])((?:\\.|(?!\1)[^\\\n])*)\1/g)) out.push(m[2]); return out; }

const lignes = [], parRoute = new Map(), parBion = new Map(), parClasse = { A: 0, B: 0, C: 0 };
for (const p of registre) {
  const id = p.id, app = p.app || id, cfg = (p.config && typeof p.config === 'object' && !Array.isArray(p.config)) ? p.config : {};
  const fichier = path.join(LABO, 'resources/views/ploxions', app, 'app.blade.php');
  const existe = existsSync(fichier);
  const brut = existe ? readFileSync(fichier, 'utf8') : '';
  const src = nettoyer(brut), js = scripts(src);
  const urlCfg = [cfg.url, cfg.base_url].find(u => typeof u === 'string' && u.trim() !== '');
  const jOSApps = /jOSApps\s*\[\s*(['"`]|ID\b|id\b)|jOSApps\.[\w$]+\s*=|window\.jOSApps\s*=/.test(js);
  const type = !existe ? (urlCfg ? 'url' : 'absent') : (urlCfg && !jOSApps ? 'url' : 'ecran');
  const d4 = existsSync(path.join(RT, 'ploxions', app)) || existsSync(path.join(RT, 'ploxions', id));
  const d3 = existsSync(path.join(RT, 'web-' + app)) || existsSync(path.join(RT, 'web-' + id));
  const degre = d4 ? 'D4' : d3 ? 'D3' : jOSApps ? 'D1' : 'D0';
  const blade = BLADE.test(src) ? 'oui' : 'non';
  const prims = Object.keys(PRIMITIVES).filter(k => PRIMITIVES[k].test(js));
  const routes = new Set(), externes = new Set();
  if (prims.length || /labo\.j0bot\.ch/.test(js)) {
    for (const s of litteraux(js)) {
      const t = s.trim();
      if (/^https?:\/\//i.test(t)) { if (!/^https?:\/\/(labo\.j0bot\.ch|localhost|127\.0\.0\.1)/i.test(t) && !/\$\{/.test(t.slice(0, 12))) externes.add(t.replace(/^(https?:\/\/[^/?#]+).*/i, '$1')); else routes.add(t.replace(/^https?:\/\/[^/]+/i, '').split(/[?#]/)[0] || '/'); continue; }
      if (/^\/[a-z_]/i.test(t) && !/\s/.test(t) && t.length < 120) {
        const r = t.split(/[?#]/)[0].replace(/\$\{[^}]*\}.*$/, '').replace(/\/+$/, '') || '/';
        if (ASSET.test(r) || COUVERT.some(x => x.test(r)) || r.length < 2 || !/^\/[a-z]/.test(r)) continue;
        routes.add(r);
      }
    }
  }
  if (urlCfg && /^https?:\/\//i.test(urlCfg)) externes.add(urlCfg.replace(/^(https?:\/\/[^/?#]+).*/i, '$1'));
  const bions = [...new Set((js.match(/\bjOS[A-Z][\w]*/g) || []))].sort();
  const xion = /\bjOSPorts\b/.test(js) ? 'oui' : 'non';
  const bionsReseau = bions.filter(b => BIONS_RESEAU.has(b));
  let classe;
  if (type !== 'ecran' || externes.size) classe = 'C';
  else if (routes.size) classe = 'B';
  else classe = 'A';
  parClasse[classe]++;
  if (classe === 'B') for (const r of routes) { const k = r.split('/').slice(0, 3).join('/'); parRoute.set(k, (parRoute.get(k) || 0) + 1); }
  for (const b of bions) parBion.set(b, (parBion.get(b) || 0) + 1);
  lignes.push({ id, type, degre, blade, classe, xion, bions: bions.join(' '), bions_reseau: bionsReseau.join(' '), appels: [...prims.map(x => '#' + x), ...[...routes].sort(), ...[...externes].sort()].join(' '), admin: p.admin ? 'oui' : 'non', enabled: p.enabled === false ? 'non' : 'oui', octets: existe ? statSync(fichier).size : 0, nom: p.name || id, icone: p.icon || '' });
}

const csv = (v) => /[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v);
const COLS = ['id', 'type', 'degre', 'blade', 'classe', 'xion', 'admin', 'enabled', 'octets', 'bions_reseau', 'bions', 'appels'];
writeFileSync(path.join(SORTIE, 'ploxions-audit.csv'), COLS.join(',') + '\n' + lignes.map(l => COLS.map(c => csv(l[c])).join(',')).join('\n') + '\n');

const actifs = lignes.filter(l => l.enabled === 'oui');
const compte = (f) => actifs.filter(f).length;
const top = (m, n) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
const candidats = actifs.filter(l => l.classe === 'A' && l.admin === 'non' && l.blade === 'non' && l.type === 'ecran').sort((a, b) => a.octets - b.octets);
const md = [
  '# Audit des ploxions pour ploxi0n v1',
  '',
  `Généré par \`tools/audit-ploxions.mjs\` depuis \`config/ploxions.php\` du labo. ${lignes.length} entrées, dont ${actifs.length} activées.`,
  '',
  '| | toutes | activées |', '| --- | --- | --- |',
  ...['A', 'B', 'C'].map(c => `| classe ${c} | ${lignes.filter(l => l.classe === c).length} | ${compte(l => l.classe === c)} |`),
  `| écran | ${lignes.filter(l => l.type === 'ecran').length} | ${compte(l => l.type === 'ecran')} |`,
  `| à URL | ${lignes.filter(l => l.type === 'url').length} | ${compte(l => l.type === 'url')} |`,
  `| sans app.blade.php | ${lignes.filter(l => l.type === 'absent').length} | ${compte(l => l.type === 'absent')} |`,
  ...['D0', 'D1', 'D3', 'D4'].map(d => `| degré ${d} | ${lignes.filter(l => l.degre === d).length} | ${compte(l => l.degre === d)} |`),
  `| Blade restant | ${lignes.filter(l => l.blade === 'oui').length} | ${compte(l => l.blade === 'oui')} |`,
  `| A sans aucun bion réseau (hors ligne tel quel) | ${lignes.filter(l => l.classe === 'A' && !l.bions_reseau).length} | ${compte(l => l.classe === 'A' && !l.bions_reseau)} |`,
  `| A avec un bion réseau (le shim le branche sur boxion_local) | ${lignes.filter(l => l.classe === 'A' && l.bions_reseau).length} | ${compte(l => l.classe === 'A' && l.bions_reseau)} |`,
  `| utilise le bus (jOSPorts) | ${lignes.filter(l => l.xion === 'oui').length} | ${compte(l => l.xion === 'oui')} |`,
  '',
  '## Les routes les plus appelées par les ploxions B',
  '',
  'Si quelques routes reviennent dans la majorité des B, les réimplémenter dans le shim fait basculer un gros paquet en A.',
  '',
  '| route (2 premiers segments) | ploxions B |', '| --- | --- |',
  ...top(parRoute, 30).map(([r, n]) => `| \`${r}\` | ${n} |`),
  '',
  '## Les bions les plus utilisés',
  '',
  '| bion | ploxions |', '| --- | --- |',
  ...top(parBion, 30).map(([b, n]) => `| \`${b}\` | ${n} |`),
  '',
  `## Candidats à embarquer (classe A, écran, sans Blade, pas admin) : ${candidats.length}`,
  '',
  'Du plus léger au plus lourd ; RS-7 en choisit 3 à 5.',
  '',
  '| ploxion | octets | bus | bions réseau | autres bions |', '| --- | --- | --- | --- | --- |',
  ...candidats.slice(0, 80).map(l => `| ${l.icone} \`${l.id}\` (${l.nom}) | ${l.octets} | ${l.xion} | ${l.bions_reseau || '—'} | ${l.bions.split(' ').filter(b => !BIONS_RESEAU.has(b)).slice(0, 5).join(' ')} |`),
  '',
];
writeFileSync(path.join(SORTIE, 'ploxions-audit.md'), md.join('\n'));
console.log(`${lignes.length} ploxions · A ${parClasse.A} · B ${parClasse.B} · C ${parClasse.C} · candidats A ${candidats.length} → ploxions-audit.csv, ploxions-audit.md`);
