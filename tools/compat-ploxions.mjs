#!/usr/bin/env node
// tools/compat-ploxions.mjs — le niveau « mount/unmount » de la pyramide de tests, sur TOUS les candidats de l'audit, en mode avion :
// pour chaque ploxion (par défaut : classe A, écran, sans Blade, activé, pas admin), dans une page jsdom neuve avec le shim jOS :
//   monter → interagir (le premier bouton, le premier champ) → démonter → attendre 1,5 s → mesurer.
// Mesures : erreurs (évaluation, montage, console), intervalles / rAF / écouteurs window+document / blobs restés après l'unmount
// (le droit au silence), requêtes réseau tentées, routes du serveur manquantes (503 du shim).
// Verdict : « pret » = monte et démonte sans erreur, ne laisse rien derrière lui, ne touche pas le réseau.
// Sorties : ploxions-compat.csv + ploxions-compat.md. Usage : node tools/compat-ploxions.mjs [--tous] [--labo …] [ids…]
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { decouper, BLADE } from './bundle.mjs';
import { page, attendre, RACINE } from '../tests/aide.mjs';

const args = process.argv.slice(2);
const iL = args.indexOf('--labo'); const LABO = iL >= 0 ? args.splice(iL, 2)[1] : (process.env.LABO || '/home/debian/labo/my_website2');
const tous = args.includes('--tous'); const ids = args.filter(a => !a.startsWith('--'));
const audit = readFileSync(path.join(RACINE, 'ploxions-audit.csv'), 'utf8').trim().split('\n');
const entetes = audit.shift().split(',');
const lignes = audit.map(l => { const v = []; let c = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === ',' && !q) { v.push(c); c = ''; } else c += ch; } v.push(c); return Object.fromEntries(entetes.map((h, i) => [h, v[i]])); });
const cibles = ids.length ? lignes.filter(l => ids.includes(l.id)) : lignes.filter(l => l.enabled === 'oui' && l.type === 'ecran' && l.blade === 'non' && (tous || (l.classe === 'A' && l.admin === 'non')));
const registre = JSON.parse(readFileSync(path.join(RACINE, 'ploxions-audit.csv'), 'utf8') ? '[]' : '[]');
void registre;

// les bions que le shim fournit ; les autres sont « absents » (le ploxion doit tester leur existence, et il perd la fonction)
const FOURNIS = new Set(['jOSApps', 'jOSPorts', 'jOSTsoin', 'jOSBoxion', 'jOS', 'jOSXerPrefs', 'jOSMobile', 'jOSb']);
const res = [];
let courant = null;   // une exception échappée (une promesse, un écouteur) est attribuée au ploxion en cours, jamais fatale
process.on('uncaughtException', (e) => { if (courant) courant.push('non rattrapée : ' + (e && e.message)); });
process.on('unhandledRejection', (e) => { if (courant) courant.push('promesse rejetée : ' + (e && e.message)); });
let i = 0;
for (const c of cibles) {
  i++;
  const r = { id: c.id, classe: c.classe, octets: c.octets, monte: 'non', erreurs: '', interval: 0, raf: 0, ecoute: 0, blob: 0, timeout: 0, reseau: 0, manques: '', verdict: 'casse', rendu: 0, absents: (c.bions || '').split(' ').filter(b => b && !FOURNIS.has(b)).join(' '), complet: 'non' };
  let p = null;
  try {
    const app = (JSON.parse(readFileSync(path.join(RACINE, 'tools/.registre-cache.json'), 'utf8'))[c.id] || {}).app || c.id;
    const d = decouper(readFileSync(path.join(LABO, 'resources/views/ploxions', app, 'app.blade.php'), 'utf8'));
    if (BLADE.test(d.js) || d.deps.length) { r.erreurs = d.deps.length ? 'dépendances : ' + d.deps.join(' ') : 'Blade'; res.push(r); continue; }
    p = await page({ avion: true, bundles: [{ id: c.id, js: d.js }] });
    courant = p.erreurs;
    const avant = p.compte.photo();
    if (!p.w.jOSApps || !p.w.jOSApps[c.id]) throw new Error('ne s\'enregistre pas dans jOSApps');
    await p.routeur.ouvrir(c.id);
    await attendre(120);
    const hote = p.w.document.querySelector('.px-hote');
    if (hote && /n'a pas pu s'ouvrir/.test(hote.textContent)) throw new Error(hote.textContent.trim().slice(0, 160));
    r.monte = 'oui';
    r.rendu = hote ? hote.textContent.replace(/\s+/g, ' ').trim().length : 0;
    try { const b = hote && hote.querySelector('button, [role=button]'); if (b) b.click(); const ch = hote && hote.querySelector('input[type=text], input:not([type]), textarea'); if (ch) { ch.value = 'test'; ch.dispatchEvent(new p.w.Event('input', { bubbles: true })); } } catch (e) { p.erreurs.push('interaction : ' + e.message); }
    await attendre(120);
    p.routeur.accueil();
    await attendre(1500);
    const apres = p.compte.photo();
    for (const k of ['interval', 'raf', 'ecoute', 'blob', 'timeout']) r[k] = Math.max(0, apres[k] - avant[k]);
    r.reseau = p.tentatives.length; r.manques = [...new Set(p.shim.manques())].join(' ');
    r.erreurs = p.erreurs.slice(0, 3).join(' | ').slice(0, 300);
  } catch (e) { r.erreurs = (e.message || String(e)).slice(0, 300); }
  finally { courant = null; try { if (p) p.w.close(); } catch (e) { /* */ } }
  r.verdict = r.monte !== 'oui' ? 'casse' : (r.erreurs || r.interval || r.raf || r.ecoute || r.blob || r.reseau) ? 'a-revoir' : 'pret';
  r.complet = r.verdict === 'pret' && !r.absents ? 'oui' : 'non';
  res.push(r);
  if (i % 25 === 0) process.stderr.write(`${i}/${cibles.length}\n`);
}

const COLS = ['id', 'verdict', 'complet', 'rendu', 'absents', 'classe', 'monte', 'interval', 'raf', 'ecoute', 'blob', 'timeout', 'reseau', 'manques', 'erreurs', 'octets'];
const csv = (v) => /[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v);
writeFileSync(path.join(RACINE, 'ploxions-compat.csv'), COLS.join(',') + '\n' + res.map(r => COLS.map(c => csv(r[c])).join(',')).join('\n') + '\n');
const n = (v) => res.filter(r => r.verdict === v).length;
const prets = res.filter(r => r.verdict === 'pret').sort((a, b) => a.octets - b.octets);
const md = ['# Compatibilité des ploxions avec ploxi0n (mode avion, jsdom)', '',
  `Généré par \`tools/compat-ploxions.mjs\` : ${res.length} ploxions montés, interagis, démontés.`, '',
  '| verdict | ploxions |', '| --- | --- |', `| prêt (aucune erreur, rien ne reste, aucun réseau) | ${n('pret')} |`, `| à revoir | ${n('a-revoir')} |`, `| cassé (ne monte pas) | ${n('casse')} |`, '',
  '## Ce qui reste après l\'unmount (droit au silence)', '',
  `- intervalles : ${res.filter(r => r.interval).length} ploxions · rAF : ${res.filter(r => r.raf).length} · écouteurs window/document : ${res.filter(r => r.ecoute).length} · blobs : ${res.filter(r => r.blob).length}`,
  `- réseau tenté en mode avion : ${res.filter(r => r.reseau).length} ploxions`, '',
  `Dont **complets** (prêts, et tous leurs bions sont fournis par le shim) : ${res.filter(r => r.complet === 'oui').length}.`, '',
  '## Prêts et complets, du plus léger au plus lourd', '', prets.filter(r => r.complet === 'oui').map(r => '`' + r.id + '` (' + r.rendu + ' car.)').join(' · '), '',
  '## Prêts mais avec des bions absents (ils montent, sans la fonction de ces bions)', '', prets.filter(r => r.complet !== 'oui').slice(0, 120).map(r => '`' + r.id + '` [' + r.absents + ']').join(' · '), '',
  '## Cassés', '', '| ploxion | erreur |', '| --- | --- |', ...res.filter(r => r.verdict === 'casse').slice(0, 80).map(r => `| \`${r.id}\` | ${String(r.erreurs).replace(/\|/g, '/').slice(0, 140)} |`), ''];
writeFileSync(path.join(RACINE, 'ploxions-compat.md'), md.join('\n'));
console.log(`${res.length} ploxions · prêts ${n('pret')} · à revoir ${n('a-revoir')} · cassés ${n('casse')} → ploxions-compat.csv, ploxions-compat.md`);
process.exit(0);
