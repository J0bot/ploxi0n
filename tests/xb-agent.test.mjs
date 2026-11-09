// ▸ (0.99.33) l'agent xb : l'appairage par code, le battement, l'appareil qui juge, les sorties, le jeton refusé ; les commandes du téléphone ; le ploxion
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { creerAgentXb, juger, DROITS } from '../src/bions/xb-agent.js';
import { creerCommandesXb } from '../src/natif/xb-commandes.js';
import { creerAppareilXb } from '../src/lot/appareil-xb.js';

const JETON = 'xj_' + 'ab'.repeat(24);
function fauxLabo({ approuverApres = 2, demandes = [] } = {}) {
  const L = { recus: [], sorties: [], battements: 0, sondages: 0, statutBattement: 200, demandes: demandes.slice() };
  L.requete = async ({ methode, url, headers, corps }) => {
    const u = new URL(url), c = corps ? JSON.parse(corps) : null; L.recus.push({ methode, chemin: u.pathname + u.search, headers, corps: c });
    if (methode === 'POST' && u.pathname === '/px/miroir/enroler') { L.enrole = c; return { status: 201, texte: JSON.stringify({ id: 'e1', code: 'K7Q-42' }) }; }
    if (methode === 'GET' && u.pathname === '/px/miroir/enroler/e1') { L.sondages++; assert.equal(u.searchParams.get('secret'), L.enrole.secret);
      return { status: 200, texte: JSON.stringify(L.sondages >= approuverApres ? { statut: 'approuve', jeton: JETON, nom_compte: 'RS-7' } : { statut: 'attente' }) }; }
    if (u.pathname === '/xb/appareil/battement') { L.battements++; L.dernier = c; L.jetonVu = headers['X-Xer-Jeton']; if (L.statutBattement !== 200) return { status: L.statutBattement, texte: '{}' };
      const d = L.demandes.splice(0); return { status: 200, texte: JSON.stringify({ demandes: d }) }; }
    if (u.pathname.startsWith('/xb/appareil/sortie/')) { L.sorties.push({ uid: decodeURIComponent(u.pathname.split('/').pop()), ...c }); return { status: 200, texte: '{}' }; }
    return { status: 404, texte: '{}' };
  };
  return L;
}
const coffreMemoire = () => { const c = { v: null, lire: async () => c.v, garder: async (j) => { c.v = j; }, oublier: async () => { c.v = null; } }; return c; };
const vite = () => new Promise(r => setTimeout(r, 0));
const cmdsTest = (faits) => ({
  infos: { args: [], async faire(a, e) { e('modele iPhone\n'); return 0; } },
  ouvrir: { args: [/^[a-z0-9-]{1,60}$/], async faire(a, e) { faits.push(a[0]); e('✓\n'); return 0; } },
  casse: { args: [], async faire() { throw new Error('boum'); } },
});

test('▸ l\'appareil juge : la commande doit être dans sa liste, ses arguments coller à leurs motifs', () => {
  const c = cmdsTest([]);
  assert.equal(juger(c, { cmd: 'infos', args: [] }), null);
  assert.equal(juger(c, { cmd: 'ouvrir', args: ['xion'] }), null);
  assert.match(juger(c, { cmd: 'rm', args: [] }), /pas dans la liste/);
  assert.match(juger(c, { cmd: 'ouvrir', args: ['../../etc'] }), /argument 1/);
  assert.match(juger(c, { cmd: 'infos', args: ['x'] }), /trop/);
  assert.deepEqual(DROITS, ['atelier'], 'le moindre droit : pas le miroir du compte');
});

test('▸ l\'appairage : le code, la page d\'approbation, le jeton au trousseau', async () => {
  const L = fauxLabo(), coffre = coffreMemoire(), liens = [];
  const a = creerAgentXb({ requete: L.requete, coffre, cmds: cmdsTest([]), nom: () => 'ploxi0n · iPhone', attendre: vite, ouvrirLien: (u) => liens.push(u) });
  const r = await a.appairer();
  assert.equal(r.compte, 'RS-7'); assert.equal(coffre.v, JETON);
  assert.deepEqual(L.enrole.droits, ['atelier']); assert.equal(L.enrole.nom, 'ploxi0n · iPhone'); assert.match(L.enrole.secret, /^[0-9a-f]{64}$/);
  assert.equal(liens[0], 'https://labo.j0bot.ch/px/miroir/ok?code=K7Q-42');
  assert.ok(!L.recus.some(x => /xj_/.test(x.chemin)), 'le jeton ne passe jamais dans une URL');
  assert.equal(a.etat().appaire, true);
});

test('▸ le battement : les demandes exécutées, les refus dits au labo, une commande qui casse n\'arrête rien', async () => {
  const faits = [];
  const L = fauxLabo({ demandes: [{ uid: 'u1', cmd: 'infos', args: [] }, { uid: 'u2', cmd: 'ouvrir', args: ['xion'] }, { uid: 'u3', cmd: 'shell', args: ['rm -rf'] }, { uid: 'u4', cmd: 'casse', args: [] }] });
  const coffre = coffreMemoire(); coffre.v = JETON;
  let t = 0; const a = creerAgentXb({ requete: L.requete, coffre, cmds: cmdsTest(faits), version: '0.99.33', os: 'android', attendre: () => new Promise(r => setTimeout(r, 5)), maintenant: () => ++t, infos: async () => ({ modele: 'Pixel' }) });
  assert.equal(await a.demarrer(), true);
  for (let i = 0; i < 50 && L.sorties.length < 4; i++) await new Promise(r => setTimeout(r, 5));
  a.arreter();
  assert.equal(L.jetonVu, JETON); assert.equal(L.dernier.version, 'ploxi0n-0.99.33'); assert.equal(L.dernier.os, 'android');
  assert.deepEqual(L.dernier.cmds, ['infos', 'ouvrir', 'casse']); assert.deepEqual(L.dernier.infos, { modele: 'Pixel' });
  const s = Object.fromEntries(L.sorties.map(x => [x.uid, x]));
  assert.equal(s.u1.texte, 'modele iPhone\n'); assert.deepEqual(s.u1.fin, { code: 0 });
  assert.deepEqual(faits, ['xion']);
  assert.equal(s.u3.fin.etat, 'refuse'); assert.match(s.u3.texte, /refusé par l'appareil/);
  assert.equal(s.u4.fin.code, 1); assert.match(s.u4.texte, /boum/);
  assert.equal(a.etat().commandes, 3);
  assert.ok(a.journal().some(j => /refusé : shell/.test(j.l)));
});

test('▸ jeton refusé (révoqué) : l\'agent s\'arrête et le dit ; sans jeton il ne démarre pas', async () => {
  const L = fauxLabo(); L.statutBattement = 401;
  const coffre = coffreMemoire();
  const a = creerAgentXb({ requete: L.requete, coffre, cmds: cmdsTest([]), attendre: vite });
  assert.equal(await a.demarrer(), false); assert.equal(L.battements, 0, 'rien ne part sans appairage');
  coffre.v = JETON; await a.demarrer(); for (let i = 0; i < 20 && a.etat().statut !== 'refuse'; i++) await vite();
  assert.equal(a.etat().statut, 'refuse'); assert.equal(a.etat().actif, false); assert.equal(L.battements, 1);
  await a.oublier(); assert.equal(coffre.v, null);
});

test('▸ hors ligne : il réessaie en espaçant, sans rien exécuter', async () => {
  const L = fauxLabo(); L.statutBattement = 0; const attentes = [];
  const coffre = coffreMemoire(); coffre.v = JETON;
  const a = creerAgentXb({ requete: async (q) => { if (/battement/.test(q.url)) throw new Error('réseau'); return L.requete(q); }, coffre, cmds: cmdsTest([]), attendre: (ms) => { attentes.push(ms); return vite(); } });
  await a.demarrer(); for (let i = 0; i < 20 && attentes.length < 5; i++) await vite(); a.arreter();
  assert.equal(a.etat().statut, 'eteint'); assert.deepEqual(attentes.slice(0, 5), [6000, 12000, 24000, 30000, 30000]);
});

test('▸ les commandes du téléphone : ouvrir un ploxion du labo, une page, le mode kiosque, notifier, refuser un mode inconnu', async () => {
  const f = { ouverts: [], liens: [], plein: [], notifs: [], accueil: 0 };
  const c = creerCommandesXb({ ouvrir: async (id) => f.ouverts.push(id), ouvrirLien: async (u) => f.liens.push(u), plein: (on) => f.plein.push(on), accueil: async () => f.accueil++,
    notifier: async (t) => f.notifs.push(t), infos: async () => ({ modele: 'iPhone 15', batterie: '80 %', vide: '' }), scanner: async () => [{ nom: 'JBL', rssi: -60, distance: 2.1 }] });
  let out = ''; const e = (t) => { out += t; };
  assert.equal(juger(c, { cmd: 'notifier', args: ['le makelab ferme'] }), null);
  assert.match(juger(c, { cmd: 'notifier', args: ['a\nb'] }), /argument/);
  await c.ouvrir.faire(['https://labo.j0bot.ch/px/mappion/index.html'], e); assert.deepEqual(f.ouverts, ['mappion']);
  await c.ouvrir.faire(['https://exemple.ch/page'], e); assert.deepEqual(f.liens, ['https://exemple.ch/page']);
  await c.ouvrir.faire(['xion'], e); assert.deepEqual(f.ouverts, ['mappion', 'xion']);
  assert.equal(await c.mode.faire(['kiosque', 'https://labo.j0bot.ch/px/homeboard'], e), 0); assert.deepEqual(f.plein, [true]); assert.equal(f.ouverts.at(-1), 'homeboard');
  assert.equal(await c.mode.faire(['aucun'], e), 0); assert.equal(f.accueil, 1); assert.deepEqual(f.plein, [true, false]);
  assert.equal(await c.mode.faire(['ledion'], e), 1);
  out = ''; await c.mode.faire([], e); assert.match(out, /kiosque/);
  await c.notifier.faire(['salut'], e); assert.deepEqual(f.notifs, ['salut']);
  out = ''; await c.infos.faire([], e); assert.match(out, /modele\s+iPhone 15/); assert.doesNotMatch(out, /vide/);
  out = ''; await c.scanner.faire([], e); assert.match(out, /-60 dBm.*JBL/);
  const sans = creerCommandesXb({ ouvrir() {}, ouvrirLien() {}, accueil() {}, notifier() {}, infos: async () => ({}) });
  assert.equal(await sans.scanner.faire([], e), 1);
});

test('▸ le ploxion Appareil xb : appairer, allumer, éteindre, au lancement, oublier', async () => {
  const dom = new JSDOM('<!doctype html><body><div id="h"></div></body>'); const W = dom.window;
  const L = fauxLabo(), coffre = coffreMemoire(), store = new Map();
  const boxion = { get: async (n, k) => store.get(n + '/' + k), put: async (n, k, v) => { store.set(n + '/' + k, v); } };
  const agent = creerAgentXb({ requete: L.requete, coffre, cmds: creerCommandesXb({ ouvrir() {}, ouvrirLien() {}, accueil() {}, notifier() {}, infos: async () => ({}) }), attendre: () => new Promise(r => setTimeout(r, 3)) });
  W.jOSNatif = { ouvrirLien() {} };
  const px = creerAppareilXb({ W, agent, boxion });
  assert.equal(await px.auLancement(), false, 'jamais allumé tout seul sans l\'avoir voulu');
  const h = W.document.getElementById('h'); const m = px.mount(h); await new Promise(r => setTimeout(r, 5));
  assert.match(h.textContent, /appairer ce téléphone/); assert.match(h.textContent, /xb ouvrir/);
  h.querySelector('[data-xba="appairer"]').click();
  for (let i = 0; i < 50 && !(store.get('reglages/xb-agent') || {}).appaire; i++) await new Promise(r => setTimeout(r, 5));
  assert.equal(store.get('reglages/xb-agent').compte, 'RS-7'); assert.match(h.textContent, /allumer l'agent/);
  h.querySelector('[data-xba="allumer"]').click(); for (let i = 0; i < 50 && L.battements < 1; i++) await new Promise(r => setTimeout(r, 5));
  assert.ok(L.battements >= 1); assert.match(h.textContent, /dans le labo/);
  const cb = h.querySelector('[data-xba="demarrage"]'); cb.checked = true; cb.dispatchEvent(new W.Event('change', { bubbles: true }));
  await vite(); assert.equal(store.get('reglages/xb-agent').auDemarrage, true);
  h.querySelector('[data-xba="eteindre"]').click(); await vite(); assert.equal(agent.etat().actif, false);
  h.querySelector('[data-xba="oublier"]').click(); for (let i = 0; i < 20 && (coffre.v || store.get('reglages/xb-agent').appaire); i++) await vite();
  assert.equal(coffre.v, null); assert.equal(store.get('reglages/xb-agent').appaire, false);
  m.unmount(); assert.equal(h.innerHTML, '');
});
