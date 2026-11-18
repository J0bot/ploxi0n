// 🏝 (0.99.43) les Live Activities de la balade (mappion, Autour, la boussole des potes) et de Proche ; l'état des boutons du Centre de contrôle
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { creerVeille, cibleBalade } from '../src/natif/veille-natif.js';
import { creerActivites } from '../src/natif/activites.js';
import { creerProche } from '../src/lot/proche.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { attendre } from './aide.mjs';

test('🏝 une cible de balade est propre ou absente', () => {
  assert.deepEqual(cibleBalade({ nom: 'WC', lat: 46.52, lng: '6.63' }), { nom: 'WC', lat: 46.52, lng: 6.63 });
  assert.equal(cibleBalade({ lat: 91, lng: 0 }), null); assert.equal(cibleBalade({ lat: 'x', lng: 0 }), null); assert.equal(cibleBalade(null), null);
  assert.equal(cibleBalade({ lat: 1, lng: 2 }).nom, 'là-bas'); assert.equal(cibleBalade({ nom: 'x'.repeat(99), lat: 1, lng: 2 }).nom.length, 40);
});

test('🏝 jOSVeille.balade : le natif reçoit titre, ploxion, cible ; coupée dans les réglages → refus ; l\'état suit (les contrôles)', async () => {
  const appels = [], etats = []; let on = true;
  const plugin = { baladeDebut: async (o) => { appels.push(['debut', o]); return { id: 'a1' }; }, baladeCible: async (o) => { appels.push(['cible', o]); return {}; }, baladeFin: async () => { appels.push(['fin']); return { metres: 420, secondes: 600 }; } };
  const V = creerVeille({ plugin, activites: () => on, quand: (x) => etats.push(x) });
  assert.deepEqual(await V.balade.debut({ cible: { nom: '🚻 WC', lat: 46.5, lng: 6.6 } }), { id: 'a1' });
  assert.deepEqual(appels[0], ['debut', { titre: 'balade', ploxion: 'mappion', notifier: true, cible: { nom: '🚻 WC', lat: 46.5, lng: 6.6 } }]);
  await V.balade.cible(null); assert.deepEqual(appels[1], ['cible', {}]);
  await V.balade.cible({ nom: 'RS-3', lat: 1, lng: 2 }); assert.deepEqual(appels[2][1], { cible: { nom: 'RS-3', lat: 1, lng: 2 } });
  assert.equal((await V.balade.fin()).metres, 420);
  assert.deepEqual(etats, [true, false]);
  on = false; await assert.rejects(V.balade.debut({}), /coupées/); assert.equal(appels.filter(a => a[0] === 'debut').length, 1);
});

test('🏝 l\'activité porte un compte (les voisins de Proche), borné', async () => {
  const vus = [];
  const A = creerActivites({ plugin: { activiteDebut: async (o) => { vus.push(o); return { id: 'x' }; }, activiteMaj: async (o) => { vus.push(o); } }, natif: () => true });
  await A.debut('proche', { titre: 'proche', compte: 3 }); await A.maj('proche', { compte: -1 }); await A.maj('proche', { compte: 1e9 });
  assert.equal(vus[0].compte, 3); assert.equal(vus[1].compte, undefined); assert.equal(vus[2].compte, 9999);
});

test('🏝 Proche : l\'activité démarre avec le maillage, dit les voisins sans jamais le texte des messages, s\'arrête avec lui', async () => {
  const tuyaux = new Map();
  const tuyau = () => { const pair = new Set(), msg = new Set(); let moi = null;
    const t = { demarrer({ nom }) { moi = nom + '·' + (tuyaux.size + 1); tuyaux.set(moi, t); queueMicrotask(() => { for (const [id, x] of tuyaux) if (id !== moi) { x._pair({ id: moi, etat: 'connecte' }); t._pair({ id, etat: 'connecte' }); } }); return Promise.resolve({ moi }); },
      arreter() { tuyaux.delete(moi); return Promise.resolve(); },
      envoyer(donnees, a) { const de = moi; for (const [id, x] of tuyaux) if (id !== de && (!a || a.includes(id))) setTimeout(() => x._msg({ de, donnees }), 2); return Promise.resolve({ envoyes: 1 }); },
      pairs: () => Promise.resolve([...tuyaux.keys()].filter(k => k !== moi)), surPair: (f) => pair.add(f), surMessage: (f) => msg.add(f),
      _pair: (e) => { for (const f of pair) f(e); }, _msg: (e) => { for (const f of msg) f(e); } };
    return t; };
  const W = { setInterval: () => 0, clearInterval: () => {}, setTimeout: (f, ms) => setTimeout(f, Math.min(ms || 0, 5)), clearTimeout: (x) => clearTimeout(x), crypto: globalThis.crypto };
  const journal = [];
  const activite = { debut: async (o) => { journal.push(['debut', o]); }, maj: async (o) => { journal.push(['maj', o]); }, fin: async () => { journal.push(['fin']); } };
  const A = creerProche({ W, boxion: creerMemoire(), tuyau: tuyau(), Contexte: null, activite }), B = creerProche({ W: { ...W }, boxion: creerMemoire(), tuyau: tuyau(), Contexte: null });
  await A.demarrer({ nom: 'RS-4' });
  assert.equal(journal[0][0], 'debut'); assert.match(journal[0][1].sous, /personne autour/); assert.ok(journal[0][1].debut > 0);
  await B.demarrer({ nom: 'RS-3' }); await attendre(300);
  await B.maille().prive(A.maille().moi().fp, 'mon code secret 1234'); await attendre(300);
  const majs = journal.filter(j => j[0] === 'maj');
  assert.ok(majs.length >= 1, JSON.stringify(journal));
  const der = majs.at(-1)[1];
  assert.match(der.sous, /1 voisin/); assert.equal(der.compte, 1); assert.equal(der.glyphe, 'antenna.radiowaves.left.and.right');
  assert.ok(!JSON.stringify(journal).includes('1234'), 'le texte d\'un message ne va jamais sur l\'écran verrouillé');
  await A.arreter(); assert.deepEqual(journal.at(-1), ['fin']); await B.arreter();
});

test('🎛 les contrôles du Centre de contrôle : déclarés dans le bundle, reçus par l\'app, l\'état copié dans l\'App Group', () => {
  const ext = readFileSync(new URL('../ios/App/PloxionWidgets/PloxionWidgets.swift', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../ios/App/App/AppDelegate.swift', import.meta.url), 'utf8');
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  for (const [s, hote] of [['ControleProche', 'proche'], ['ControleBalade', 'balade'], ['ControleToilettes', 'toilettes']]) {
    assert.ok(ext.includes('struct ' + s + ': ControlWidget') && ext.includes('            ' + s + '()'), s);
    assert.ok(ext.includes('"ploxi0n://' + hote + '"'), hote); assert.match(main, new RegExp('\\n\\s+' + hote + ': \\(\\) =>'), 'l\'action ' + hote);
  }
  assert.ok(app.includes('"ploxi0n.controles"') && app.includes('ControlCenter.shared.reloadAllControls()'));
  // le même ContentState des deux côtés (ActivityKit les apparie au caractère près)
  const etat = (s) => s.slice(s.indexOf('struct PloxiActivite: ActivityAttributes'), s.indexOf('var ploxion: String', s.indexOf('struct PloxiActivite: ActivityAttributes'))).replace(/\/\/.*$/gm, '').replace(/\s+/g, ' ');
  assert.equal(etat(app), etat(ext));
});
