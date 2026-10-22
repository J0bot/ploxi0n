// ⧗ (0.86) les tsoins de l'iPhone remontent au boxion : rien par défaut ; « tsoins » (les notés) ou « tout » partent tout seuls, connecté ;
// « tampon » seulement quand on l'envoie ; un document par jour et par appareil, relu puis fusionné (renvoyer ne double rien)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { creerRemontee, retenue, jourDe, NS_REMONTEE } from '../src/app/remontee-tsoins.js';

function boxionDistant() {
  const docs = new Map(); const appels = []; let actif = true, panne = false;
  const distant = {
    actif: () => actif,
    async appel(m, chemin, corps) {
      appels.push(m + ' ' + chemin.split('?')[0]);
      if (panne) return { status: 503, data: null };
      if (m === 'GET') { const k = decodeURIComponent(/key=([^&]+)/.exec(chemin)[1]); const d = docs.get(k); return { status: 200, data: d ? { ns: NS_REMONTEE, key: k, data: d } : { item: null } }; }
      docs.set(corps.key, corps.data); return { status: 200, data: { ok: true } };
    },
  };
  return { distant, docs, appels, couper: (v) => { actif = !v; }, panne: (v) => { panne = v; } };
}
const W = { setTimeout, setInterval, clearInterval, addEventListener() {}, document: { hidden: false, addEventListener() {} } };

test('⧗ le filtre et le jour', () => {
  assert.equal(retenue('non', { kind: 'tsoin' }), false);
  assert.equal(retenue('tsoins', { kind: 'tsoin' }), true); assert.equal(retenue('tsoins', { kind: 'vocal' }), true);
  assert.equal(retenue('tsoins', { kind: 'action', k: 'x' }), false);
  assert.equal(retenue('tout', { kind: 'action' }), true); assert.equal(retenue('tampon', { kind: 'marketplace' }), true);
  assert.equal(jourDe(new Date(2026, 9, 22, 23, 59).getTime()), '2026-10-22');
});

test('⧗ rien ne part par défaut ; « tsoins » part de maintenant, les notés seulement, un document par jour et par appareil ; renvoyer ne double rien', async () => {
  const boxion = creerMemoire(); const d = boxionDistant();
  await boxion.append('tsoins', { kind: 'tsoin', id: 'avant', d: 'noté avant de choisir' });
  const r = creerRemontee({ W, boxion, distant: d.distant });
  assert.deepEqual(await r.remonter(), { mode: 'non', envoyes: 0 }); assert.equal(d.appels.length, 0, 'par défaut, rien ne part');
  await r.regler({ mode: 'tsoins' });
  await boxion.append('tsoins', { kind: 'tsoin', id: 'a', d: 'un tsoin' });
  await boxion.append('tsoins', { kind: 'action', k: 'clic', d: 'un geste' });
  await boxion.append('tsoins', { kind: 'vocal', id: 'v', d: 'un vocal' });
  const x = await r.remonter();
  assert.equal(x.envoyes, 2);
  assert.equal(d.docs.size, 1); const [cle, doc] = [...d.docs][0];
  assert.match(cle, /^\d{4}-\d\d-\d\d\.iphone-[a-z0-9]{4}$/);
  assert.deepEqual(doc.tsoins.map(t => t.id), ['a', 'v'], 'ni le passé d\'avant le choix, ni les gestes');
  assert.equal(doc.appareil, r.appareil());
  assert.equal((await r.remonter()).envoyes, 0, 'déjà parti');
  await r.depuisLeDebut();
  assert.deepEqual(d.docs.get(cle).tsoins.map(t => t.id), ['avant', 'a', 'v'], 'tout depuis le début : fusionné, sans doublon');
});

test('⧗ « tampon » : gardé ici, il part quand on l\'envoie ; hors ligne ou en panne, le curseur ne bouge pas', async () => {
  const boxion = creerMemoire(); const d = boxionDistant();
  const r = creerRemontee({ W, boxion, distant: d.distant });
  await r.regler({ mode: 'tampon' });
  await boxion.append('tsoins', { kind: 'action', k: 'ouvrir', d: 'wiki' });
  await boxion.append('tsoins', { kind: 'tsoin', d: 'idée' });
  assert.deepEqual(await r.remonter(), { mode: 'tampon', envoyes: 0, enAttente: 2 }); assert.equal(d.appels.length, 0);
  d.couper(true);
  const h = await r.remonter({ force: true }); assert.equal(h.horsLigne, true); assert.equal(h.enAttente, 2);
  d.couper(false); d.panne(true);
  const p = await r.remonter({ force: true }); assert.match(p.erreur, /ne répond pas/); assert.equal(r.etat().curseur > 0, false, 'rien de perdu');
  d.panne(false);
  assert.equal((await r.remonter({ force: true })).envoyes, 2);
  assert.equal([...d.docs.values()][0].n, 2);
});

test('⧗ « me demander un tsoin » : une vraie session puis une vraie pause → une proposition ; sinon rien', async () => {
  const boxion = creerMemoire(); let t = 0; const ecoutes = {}; const propositions = [];
  const Wf = { setTimeout() {}, setInterval() { return 1; }, clearInterval() {}, addEventListener() {}, document: { hidden: false, addEventListener: (k, f) => { ecoutes[k] = f; } } };
  const r = creerRemontee({ W: Wf, boxion, distant: null, maintenant: () => t, proposer: (p) => propositions.push(p) });
  await r.regler({ demander: true }); r.demarrer();
  const cacher = () => { Wf.document.hidden = true; ecoutes.visibilitychange(); }, montrer = () => { Wf.document.hidden = false; ecoutes.visibilitychange(); };
  t = 10 * 60e3; cacher(); t += 30 * 60e3; montrer();
  assert.deepEqual(propositions, [{ minutes: 10, finie: 10 * 60e3 }]);
  t += 30e3; cacher(); t += 60 * 60e3; montrer(); assert.equal(propositions.length, 1, 'une session de 30 s : rien');
  t += 5 * 60e3; cacher(); t += 60e3; montrer(); assert.equal(propositions.length, 1, 'une pause d\'une minute : rien');
});
