// Le CONTRAT du shim jOS (brief, « Shim jOS » et pyramide « contrat shim ») en jsdom : bus, tsoins, miroir du localStorage, identité,
// fetch local, jOSBoxion, isDesktop, routeur ; et le test hors ligne de référence, simulé (écrire → tuer → relancer → tout est là).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, attendre } from './aide.mjs';
import { creerMemoire } from '../src/boxion-local/memoire.js';

test('jOSPorts : le bus local livre tout de suite (topic exact et « * ») et journalise dans boxion_local « xion »', async () => {
  const p = await page();
  const recu = [], tous = [];
  const off = p.w.jOSPorts.on('ploxion.a.sortie', (d, t) => recu.push([d, t]));
  p.w.jOSPorts.on('*', (d, t) => tous.push(t));
  assert.equal(p.w.jOSPorts.emit('a', 'sortie', { n: 1 }), 'ploxion.a.sortie');
  assert.deepEqual(recu, [[{ n: 1 }, 'ploxion.a.sortie']], 'livré de façon synchrone');
  off(); p.w.jOSPorts.emit('a', 'sortie', { n: 2 });
  assert.equal(recu.length, 1, 'off() désabonne');
  assert.deepEqual(tous, ['ploxion.a.sortie', 'ploxion.a.sortie']);
  await attendre();
  const j = await p.boxion.lire('xion');
  assert.deepEqual(j.map(e => e.entry), [{ topic: 'ploxion.a.sortie', data: { n: 1 } }, { topic: 'ploxion.a.sortie', data: { n: 2 } }]);
  p.w.jOSPorts.emit('a', 'gros', { secret: 'x' }, 'résumé');
  await attendre();
  assert.equal((await p.boxion.lire('xion')).at(-1).entry.data, 'résumé', 'versXion remplace ce qui est journalisé');
  p.fin();
});

test('jOSTsoin.mark → boxion_local « tsoins », et list() les rend ; POST /chat {kind:tsoin} aussi', async () => {
  const p = await page();
  p.w.jOSTsoin.mark('clic', 'bouton', { x: 1 });
  await attendre();
  const t = await p.boxion.lire('tsoins');
  assert.equal(t.length, 1); assert.deepEqual([t[0].entry.kind, t[0].entry.k, t[0].entry.d, t[0].entry.x], ['action', 'clic', 'bouton', 1]);
  assert.equal(p.w.jOSTsoin.list().length, 1);
  const r = await p.w.fetch('/chat', { method: 'POST', body: JSON.stringify({ kind: 'tsoin', texte: 'note' }) });
  assert.equal(r.status, 200);
  assert.equal((await p.boxion.lire('tsoins')).at(-1).entry.texte, 'note');
  assert.equal(p.w.jOSTsoin.isOn(), true);
  p.fin();
});

test('/xion/snapshot reconstruit l\'état depuis le journal ; POST /xion/emit diffuse et journalise', async () => {
  const p = await page();
  const vu = [];
  p.w.jOSPorts.on('ploxion.b.x', (d) => vu.push(d));
  await p.w.fetch('/xion/emit', { method: 'POST', body: JSON.stringify({ topic: 'ploxion.b.x', payload: '{"v":2}' }) });
  p.w.jOSPorts.emit('c', 'y', 3);
  await attendre();
  assert.deepEqual(vu, [{ v: 2 }]);
  const s = await (await p.w.fetch('/xion/snapshot')).json();
  assert.equal(s.ok, true); assert.deepEqual(s.topics['ploxion.b.x'].data, { v: 2 }); assert.equal(s.topics['ploxion.c.y'].data, 3);
  p.fin();
});

test('les autres routes du serveur : 503 hors ligne SANS réseau, notées dans « manques » ; l\'externe part sur le réseau (compté)', async () => {
  const p = await page();
  const r = await p.w.fetch('/px/wiki/papiers');
  assert.equal(r.status, 503); assert.equal((await r.json()).horsLigne, true);
  assert.deepEqual(p.shim.manques(), ['GET /px/wiki/papiers']);
  assert.deepEqual(p.tentatives, [], 'aucune requête réseau');
  await assert.rejects(() => p.w.fetch('https://api.open-meteo.com/v1/forecast'), /mode avion/);
  assert.deepEqual(p.shim.sortants(), ['https://api.open-meteo.com/v1/forecast']);
  p.fin();
});

test('identité locale (stable entre deux démarrages), méta du labo, isDesktop() faux', async () => {
  const boxion = creerMemoire();
  const a = await page({ boxion });
  const id = a.shim.moi.id;
  assert.match(id, /^[0-9a-f]{32}$/);
  assert.equal(a.w.document.querySelector('meta[name="user-authenticated"]').content, '1');
  assert.equal(a.w.document.querySelector('meta[name="csrf-token"]').content, 'ploxi0n-local');
  assert.equal(a.w.isDesktop(), false); assert.equal(a.w.jOS.isDesktop(), false);
  a.fin();
  const b = await page({ boxion });
  assert.equal(b.shim.moi.id, id, 'la même identité au redémarrage');
  b.fin();
});

test('jOSBoxion : save / load / get / lire / list / del et saveSoon, au format du labo ; et les routes /px/boxion/*', async () => {
  const p = await page();
  const B = p.w.jOSBoxion;
  assert.equal(B.authed(), true);
  assert.deepEqual(await B.save('', 'k', 1), { ok: false, invalid: true });
  const r = await B.save('notes', 'n1', { texte: 'salut' }, 'Ma note');
  assert.equal(r.ok, true);
  const d = await B.load('notes', 'n1');
  assert.deepEqual([d.ns, d.key, d.name, d.data.texte], ['notes', 'n1', 'Ma note', 'salut']);
  assert.match(d.savedAt, /^\d{4}-\d\d-\d\dT/);
  assert.deepEqual(await B.get('notes', 'n1'), { texte: 'salut' });
  assert.deepEqual(await B.lire('notes', 'absent'), { ok: true, existe: false, item: null });
  assert.equal((await B.lire('notes', 'n1')).existe, true);
  assert.deepEqual((await B.list('notes')).map(x => x.key), ['n1']);
  assert.deepEqual((await B.list()).map(x => x.ns + '/' + x.key), ['notes/n1'], 'list() sans ns : tous les espaces');
  B.saveSoon('notes', 'n2', 'plus tard', null, 10);
  await attendre(40);
  assert.equal(await B.get('notes', 'n2'), 'plus tard');
  const v = await (await p.w.fetch('/px/boxion/load?ns=notes&key=n1')).json();
  assert.equal(v.data.texte, 'salut');
  await p.w.fetch('/px/boxion/save', { method: 'POST', body: JSON.stringify({ ns: 'n', key: 'k', data: 7 }) });
  assert.equal(await B.get('n', 'k'), 7);
  await B.del('notes', 'n1');
  assert.equal(await B.load('notes', 'n1'), null);
  assert.deepEqual(p.tentatives, []);
  p.fin();
});

test('le TEST HORS LIGNE DE RÉFÉRENCE (simulé) : mode avion, écrire (localStorage + tsoin), tuer, relancer → tout est là', async () => {
  const boxion = creerMemoire();               // le fichier SQLite de l'app, qui survit à l'app tuée
  const a = await page({ boxion, avion: true });
  a.w.localStorage.setItem('jos:compteur', '41');
  a.w.localStorage.setItem('xb:reglage', '{"x":1}');
  a.w.jOSTsoin.mark('ecrit', 'compteur');
  await attendre();
  a.fin();                                       // l'app est tuée ; et iOS purge le localStorage de la WebView
  const b = await page({ boxion, avion: true }); // une page neuve : localStorage vide
  assert.equal(b.w.localStorage.getItem('jos:compteur'), '41', 'restauré depuis boxion_local');
  assert.equal(b.w.localStorage.getItem('xb:reglage'), '{"x":1}');
  assert.equal(b.w.jOSTsoin.list().at(-1).k, 'ecrit', 'le tsoin est là');
  const vu = [];
  b.w.jOSPorts.on('ploxion.p1.out', (d) => vu.push(d));
  b.w.jOSPorts.emit('p1', 'out', 'bonjour p2');
  assert.deepEqual(vu, ['bonjour p2'], 'le bus entre deux ploxions fonctionne');
  b.w.localStorage.removeItem('jos:compteur');
  await attendre();
  assert.equal(await boxion.get('localStorage', 'jos:compteur'), null, 'un removeItem efface aussi le miroir');
  assert.deepEqual([...a.tentatives, ...b.tentatives], [], 'aucune requête sortante');
  b.fin();
});
