#!/usr/bin/env node
// tools/diagnostic-iphone.mjs — ce que vit l'iPhone (RS-7 11.10 : « le ploxion réglages fonctionne pas, en fait presque tous les ploxions ») :
// le VRAI chemin de l'app, sur les ploxions que le Nexus utilise le plus : installer depuis xerboxion.org (depot.installer : app.js + ses
// bions servis par /px/bion-app) → bundle → monter dans une page jsdom avec le shim (mode avion) → relever : erreurs, rendu, routes du
// serveur manquantes (503), bions absents (ni fournis, ni servis), et le premier texte affiché.
// Lit le réseau public (GET seulement). Usage : node tools/diagnostic-iphone.mjs [--n 40] [ids…] → diagnostic-iphone.md
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { page, attendre, RACINE } from '../tests/aide.mjs';
import { creerDepot, bionsDuBundle, FOURNIS } from '../src/marketplace/depot.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';

const args = process.argv.slice(2);
const connecte = args.includes('--connecte'); if (connecte) args.splice(args.indexOf('--connecte'), 1);
const iN = args.indexOf('--n'); const N = iN >= 0 ? +args.splice(iN, 2)[1] : 40;
const http = { async get(url, { headers = {} } = {}) { const r = await fetch(url, { headers }); const h = {}; r.headers.forEach((v, k) => { h[k] = v; }); return { status: r.status, texte: r.status === 304 ? '' : await r.text(), entetes: h }; } };
const depot = creerDepot({ boxion: creerMemoire(), http });
const cat = await depot.catalogue();
const pop = await depot.populaires();
const parId = new Map(cat.items.map(x => [x.id, x]));
const ids = args.length ? args : [...new Set(['reglages', ...(pop.ploxions || []).map(x => x.id)])].filter(id => parId.has(id)).slice(0, N);

let courant = null;
process.on('uncaughtException', (e) => { if (courant) courant.push('non rattrapée : ' + (e && e.message)); });
process.on('unhandledRejection', (e) => { if (courant) courant.push('promesse rejetée : ' + (e && e.message)); });
const res = [];
for (const id of ids) {
  const r = { id, nom: (parId.get(id) || {}).nom || id, heures: Math.round(((pop.ploxions || []).find(x => x.id === id) || {}).secondes / 360 || 0) / 10, etat: 'casse', erreurs: [], manques: [], absents: [], bions: [], rendu: '' };
  let p = null;
  try {
    const ins = await depot.installer(id, {});
    r.bions = ins.bions; r.absents = ins.manquants;
    const js = await depot.bundle(id);
    // les bions que le code touche sans les déclarer (window.jOSX…) : absents eux aussi
    const touches = [...new Set((js.match(/\bjOS[A-Z][A-Za-z0-9]*/g) || []))].filter(b => !FOURNIS.has(b) && !ins.bions.includes(b) && !bionsDuBundle(js).includes(b));
    // --connecte : le mode connecté de l'app (anonyme ici : aucun jeton), les routes du serveur partent sur xerboxion.org
    const relais = connecte ? { routes: [], general: () => true, vers: (c) => 'https://xerboxion.org' + c, envoyer: async (q) => { const r = await fetch(q.url, { method: q.methode, headers: { ...q.headers, 'X-Ploxi0n': '1' }, body: q.corps }); const h = {}; r.headers.forEach((v, k) => { h[k] = v; }); return { status: r.status, texte: await r.text(), entetes: h }; } } : null;
    p = await page({ avion: true, bundles: [{ id, js }], relais });
    courant = p.erreurs;
    if (!p.w.jOSApps || !p.w.jOSApps[id]) throw new Error('ne s\'enregistre pas dans jOSApps');
    await p.routeur.ouvrir(id);
    await attendre(400);
    const hote = p.w.document.querySelector('.px-hote');
    const txt = hote ? hote.textContent.replace(/\s+/g, ' ').trim() : '';
    if (/n'a pas pu s'ouvrir/.test(txt)) throw new Error(txt.slice(0, 200));
    r.rendu = txt.slice(0, 140);
    r.manques = [...new Set(p.shim.manques())];
    r.erreurs = p.erreurs.slice(0, 3);
    r.inconnus = touches.filter(b => !(b in p.w)).slice(0, 12);
    r.etat = r.erreurs.length ? 'erreurs' : !txt ? 'vide' : r.manques.length ? 'serveur' : 'ok';
  } catch (e) { r.erreurs.push((e.message || String(e)).slice(0, 200)); }
  finally { courant = null; try { if (p) p.w.close(); } catch (e) { /* */ } }
  res.push(r);
  process.stderr.write(`${r.etat.padEnd(8)} ${id}\n`);
}
const n = (e) => res.filter(r => r.etat === e).length;
const md = ['# Diagnostic iPhone : les ploxions les plus utilisés, installés comme dans l\'app' + (connecte ? ' (mode connecté, anonyme)' : ' (mode avion)'), '',
  `${res.length} ploxions · ok ${n('ok')} · appellent le serveur (503 hors mode connecté) ${n('serveur')} · vides ${n('vide')} · erreurs ${n('erreurs')} · cassés ${n('casse')}`, '',
  '| ploxion | h Nexus | état | routes du serveur | bions absents | erreur / rendu |', '| --- | --- | --- | --- | --- | --- |',
  ...res.map(r => `| \`${r.id}\` | ${r.heures} | ${r.etat} | ${r.manques.slice(0, 4).join(' ').replace(/\|/g, '/')} | ${[...r.absents, ...(r.inconnus || [])].slice(0, 6).join(' ')} | ${(r.erreurs[0] || r.rendu).replace(/\|/g, '/').slice(0, 120)} |`), '',
  '## Les routes du serveur les plus demandées', '', ...Object.entries(res.flatMap(r => r.manques).reduce((a, m) => (a[m] = (a[m] || 0) + 1, a), {})).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([m, c]) => `- \`${m}\` × ${c}`), '',
  '## Les bions qui manquent le plus', '', ...Object.entries(res.flatMap(r => [...r.absents, ...(r.inconnus || [])]).reduce((a, m) => (a[m] = (a[m] || 0) + 1, a), {})).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([m, c]) => `- \`${m}\` × ${c}`), ''];
writeFileSync(path.join(RACINE, connecte ? 'diagnostic-iphone-connecte.md' : 'diagnostic-iphone.md'), md.join('\n'));
console.log(md[2]);
process.exit(0);
