// ≋ (0.99.4) faire du son avec des knobs : les réglages (bornés), les presets, les pads, le moteur (un faux Web Audio), la boucle
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PARAMS, GROUPES, PRESETS, normaliser, noteDePad, hasard, freq } from '../src/bions/son.js';
import { creerMoteur, creerSynthe } from '../src/lot/synthe.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';

// un faux Web Audio : assez pour suivre les nœuds, les notes qui démarrent et s'arrêtent
function fauxContexte() {
  const journal = { demarres: [], arretes: [], connexions: 0 };
  const param = (v = 0) => ({ value: v, setValueAtTime(x) { this.value = x; }, linearRampToValueAtTime(x) { this.value = x; }, exponentialRampToValueAtTime(x) { this.value = x; }, setTargetAtTime(x) { this.value = x; }, cancelScheduledValues() {} });
  const noeud = (extra = {}) => ({ connect() { journal.connexions++; }, disconnect() {}, ...extra });
  const ctx = { currentTime: 0, state: 'running', destination: noeud(), journal,
    createGain: () => noeud({ gain: param(1) }), createDelay: () => noeud({ delayTime: param(0) }), createBiquadFilter: () => noeud({ type: 'lowpass', Q: param(1), frequency: param(350) }),
    createAnalyser: () => noeud({ fftSize: 2048, getByteTimeDomainData(t) { t.fill(128); } }),
    createOscillator: () => { const o = noeud({ type: 'sine', frequency: param(440), detune: param(0), onended: null, start(t) { journal.demarres.push({ f: o.frequency.value, t, type: o.type }); }, stop(t) { journal.arretes.push(t); setTimeout(() => o.onended && o.onended(), 0); } }); return o; } };
  return ctx;
}

test('≋ les réglages : chaque knob a ses bornes, son groupe ; normaliser borne, arrondit, complète', () => {
  for (const p of PARAMS) { assert.ok(p.min < p.max && p.pas > 0 && p.depart >= p.min && p.depart <= p.max, p.cle); assert.ok(GROUPES.includes(p.groupe)); assert.equal(typeof p.fmt(p.depart), 'string'); }
  const n = normaliser({ coupure: 99999, onde: 2.4, resonance: 'x', inconnu: 3 });
  assert.equal(n.coupure, 8000); assert.equal(n.onde, 2); assert.equal(n.resonance, 4); assert.equal('inconnu' in n, false);
  for (const [nom, pr] of Object.entries(PRESETS)) assert.deepEqual(normaliser(pr), normaliser(normaliser(pr)), nom);
  assert.deepEqual(hasard(42), hasard(42), 'la même graine, le même son'); assert.notDeepEqual(hasard(1), hasard(2));
  for (const p of PARAMS) assert.ok(hasard(7)[p.cle] >= p.min && hasard(7)[p.cle] <= p.max);
});

test('≋ les pads suivent la gamme, grave d\'abord', () => {
  assert.equal(noteDePad(0), 48); assert.equal(noteDePad(1), 50); assert.equal(noteDePad(7), 60, 'une octave plus haut');
  assert.equal(noteDePad(5, { gamme: 'penta', tonique: 40 }), 52);
  assert.equal(Math.round(freq(69)), 440);
});

test('≋ le moteur : une note tenue, deux oscillateurs + un sub, la relâche l\'arrête ; un knob change le son en direct', async () => {
  const ctx = fauxContexte(); let p = normaliser(PRESETS['basse tekk']);
  const m = creerMoteur(ctx, () => p);
  const id = m.debut(48);
  assert.equal(ctx.journal.demarres.filter(x => x.f).length, 4, 'le lfo + deux oscillateurs + le sub');
  assert.equal(m.actives(), 1);
  p = normaliser({ ...p, onde: 0 }); m.appliquer();
  assert.equal(ctx.journal.demarres.length, 4);
  m.fin(id); assert.equal(m.actives(), 0); assert.equal(ctx.journal.arretes.length, 3);
  await new Promise(r => setTimeout(r, 5)); assert.equal(m.voix(), 0, 'débranchée à la fin');
});

test('≋ le synthé : régler, garder, la boucle joue la partition au tempo, couper', async () => {
  const ctx = fauxContexte(), boxion = creerMemoire(); let tic = null;
  const W = { setInterval: (f) => { tic = f; return 1; }, clearInterval: () => { tic = null; }, setTimeout: (f) => setTimeout(f, 0), clearTimeout: () => {} };
  const s = creerSynthe({ W, boxion, Contexte: function () { return ctx; } });
  await s.pret;
  assert.equal(s.ploxion.id, 'synthe'); assert.ok(W.jOSApps.synthe);
  s.regler({ coupure: 500, tempo: 140 }); assert.equal(s.reglages().coupure, 500);
  await new Promise(r => setTimeout(r, 450)); assert.equal((await boxion.get('reglages', 'synthe')).p.tempo, 140, 'gardé');
  s.choisir({ motif: 'pulse', gamme: 'majeur' }); assert.equal(s.etat().motif, 'pulse');
  assert.ok(s.lancerBoucle()); assert.ok(s.etat().boucle);
  tic();   // le premier tic, avant la première note (comme l'intervalle de 60 ms)
  assert.ok(ctx.journal.demarres.length > 1, 'la boucle a joué : ' + ctx.journal.demarres.length);
  s.couper(); assert.equal(s.etat().boucle, false); assert.equal(tic, null);
});
