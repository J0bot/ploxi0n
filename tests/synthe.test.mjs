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

// (0.99.5) tordre les knobs avec les doigts
import { deltaAngle, valeurApres, tordre } from '../src/bions/tordre.js';
import { JSDOM } from 'jsdom';
test('◎ tordre : l\'angle le plus court, un tour de 270° = toute la plage, borné, au pas', () => {
  assert.ok(Math.abs(deltaAngle(3, -3) - (2 * Math.PI - 6)) < 1e-9, 'traverse ±π par le court chemin');
  assert.equal(deltaAngle(0, Math.PI / 2), Math.PI / 2);
  assert.equal(valeurApres(0, Math.PI * 1.5, { min: 0, max: 1 }), 1);
  assert.equal(valeurApres(0.5, -Math.PI * 0.75, { min: 0, max: 1 }), 0);
  assert.equal(valeurApres(100, Math.PI * 0.15, { min: 60, max: 8000, pas: 10 }), 890);
  assert.equal(valeurApres(1, 1, { min: 0, max: 1 }), 1, 'borné');
});

test('◎ tordre : un doigt qui tourne autour du knob le tourne, deux doigts le tordent, deux touchers le remettent au départ', () => {
  const dom = new JSDOM('<div class="jkn"><div data-k></div></div>'), W = dom.window, el = W.document.querySelector('.jkn');
  el.querySelector('[data-k]').getBoundingClientRect = () => ({ left: 0, top: 0, width: 64, height: 64 });   // centre (32, 32)
  let v = 0.5; const crans = [];
  tordre(el, { W, get: () => v, set: (x) => { v = x; }, min: 0, max: 1, pas: 0.01, defaut: 0.25, vibrer: (k) => crans.push(k) });
  const pe = (type, id, x, y) => { const e = new W.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y }); Object.defineProperty(e, 'pointerId', { value: id }); el.dispatchEvent(e); };
  // un doigt à droite du centre (64, 32) qui tourne d'un quart de tour dans le sens horaire (vers le bas : (32, 64))
  pe('pointerdown', 1, 64, 32); for (let a = 0; a <= 90; a += 10) pe('pointermove', 1, 32 + 32 * Math.cos(a * Math.PI / 180), 32 + 32 * Math.sin(a * Math.PI / 180)); pe('pointerup', 1, 32, 64);
  assert.ok(Math.abs(v - (0.5 + 1 / 3)) < 0.02, 'un quart de tour = un tiers de la plage : ' + v);
  assert.ok(crans.length >= 1, 'ça vibre (au plus un cran toutes les 28 ms)');
  // deux doigts : l'un fixe (0, 32), l'autre tourne autour de lui d'un quart de tour à rebours
  v = 0.5; pe('pointerdown', 2, 0, 32); pe('pointerdown', 3, 64, 32);
  for (let a = 0; a >= -90; a -= 10) pe('pointermove', 3, 64 * Math.cos(a * Math.PI / 180), 32 + 64 * Math.sin(a * Math.PI / 180));
  pe('pointerup', 3, 0, 0); pe('pointerup', 2, 0, 0);
  assert.ok(Math.abs(v - (0.5 - 1 / 3)) < 0.02, 'deux doigts : tordu à rebours : ' + v);
  // deux touchers rapides sans tourner : la valeur de départ
  pe('pointerdown', 4, 32, 10); pe('pointerup', 4, 32, 10); pe('pointerdown', 5, 32, 10); pe('pointerup', 5, 32, 10);
  assert.equal(v, 0.25);
});

// (0.99.10) jouer à plusieurs (Proche), pencher l'iPhone
import { creerProche } from '../src/lot/proche.js';
import { PAIRES, valeurInclinee } from '../src/lot/synthe.js';
test('≋ pencher : la bonne échelle (log pour la coupure), bornée ; deux knobs bougent', async () => {
  assert.equal(valeurInclinee('coupure', 0), 60); assert.equal(valeurInclinee('coupure', 1), 8000);
  assert.ok(Math.abs(valeurInclinee('coupure', 0.5) - Math.sqrt(60 * 8000)) < 1, 'au milieu : la moyenne géométrique');
  assert.equal(valeurInclinee('resonance', 2), 20); assert.equal(valeurInclinee('inconnu', 0.5), null);
  const W = { setInterval: () => 1, clearInterval: () => {}, setTimeout: (f) => setTimeout(f, 0), clearTimeout: () => {}, addEventListener: () => {}, removeEventListener: () => {} };
  const s = creerSynthe({ W, boxion: creerMemoire(), Contexte: null }); await s.pret;
  assert.equal(s.pencher(true), true); assert.deepEqual(s.etat().paire, PAIRES[0]);
  s.surPenche({ gamma: 45, beta: 10 }); assert.equal(s.reglages().coupure, 8000); assert.equal(s.reglages().resonance, 0.1);
  s.surPenche({ gamma: -45, beta: 80 }); assert.equal(s.reglages().coupure, 60); assert.equal(s.reglages().resonance, 20);
});

test('≋ jouer à plusieurs : le son du synthé part dans la basse de Proche ; un knob tordu repart ; les autres reçoivent ses réglages', async () => {
  const sent = [];
  const tuyau = { demarrer: async ({ nom }) => ({ moi: nom + '·a1' }), arreter: async () => {}, envoyer: async (t) => { sent.push(JSON.parse(t)); return { envoyes: 1 }; }, pairs: async () => [], surPair: () => {}, surMessage: () => {} };
  const W = { setInterval: () => 1, clearInterval: () => {}, setTimeout: (f, ms) => setTimeout(f, Math.min(ms || 0, 5)), clearTimeout: (t) => clearTimeout(t) };
  const proche = creerProche({ W, boxion: creerMemoire(), tuyau, Contexte: null });
  const s = creerSynthe({ W, boxion: creerMemoire(), Contexte: null, proche }); await s.pret;
  assert.equal(s.partager(true), false, 'Proche éteint : rien ne part');
  await proche.demarrer({ nom: 'RS-7', salle: 'zurich' });
  assert.equal(s.partager(true), true); assert.equal(s.etat().partage, true);
  const b = proche.etat().basse; assert.equal(b.son.coupure, s.reglages().coupure); assert.equal(b.tempo, s.reglages().tempo);
  s.regler({ coupure: 333 }); await new Promise(r => setTimeout(r, 30));
  assert.equal(proche.etat().basse.son.coupure, 330, 'le knob tordu repart (au pas de 10 Hz)');
  assert.ok(sent.some(x => x.g === 'basse' && x.d && x.d.son && x.d.son.coupure === 330), 'et part sur le réseau');
  s.partager(false); assert.equal(proche.etat().basse, null);
});

// ---- (0.99.16) le pas à pas : 16 pas × un degré de la gamme ; il passe par la partition de Proche ----
import { pasValides, partition, notesEntre, GAMMES } from '../src/bions/proche.js';
test('⊞ le pas à pas : vérifié case par case ; la partition le joue ; un motif nommé l\'oublie', () => {
  const pas = [0, null, 2, null, 4, null, '+0', null, null, null, null, null, 7, null, null, null];
  assert.deepEqual(pasValides(pas), pas);
  assert.equal(pasValides(pas.slice(0, 15)), null); assert.equal(pasValides([...pas.slice(0, 15), 15]), null); assert.equal(pasValides([...pas.slice(0, 15), '+99']), null); assert.equal(pasValides([...pas.slice(0, 15), 1.5]), null);
  const pa = partition({ tempo: 120, motif: 'mien', pas, tonique: 36, gamme: 'mineur', debut: 0 });
  assert.equal(pa.motif, 'mien'); assert.deepEqual(pa.pas, pas);
  const g = GAMMES.mineur, n = notesEntre(pa, 0, 2000);   // un tour = 16 pas de 125 ms
  assert.deepEqual(n.map(x => x.midi), [36, 36 + g[2], 36 + g[4], 48, 36 + g[7 % g.length] + 12 * Math.floor(7 / g.length)]);
  assert.deepEqual(n.map(x => x.t), [0, 250, 500, 750, 1500]);
  assert.equal(partition({ motif: 'mien', pas: 'n\'importe' }).motif, 'pulse');
  assert.equal(partition({ motif: 'tekk', pas }).pas, null);
});

test('⊞ le synthé garde ton pas à pas, et l\'envoie dans la basse de Proche', async () => {
  const tuyau = { demarrer: async ({ nom }) => ({ moi: nom + '·a1' }), arreter: async () => {}, envoyer: async () => ({ envoyes: 1 }), pairs: async () => [], surPair: () => {}, surMessage: () => {} };
  const W = { setInterval: () => 1, clearInterval: () => {}, setTimeout: (f, ms) => setTimeout(f, Math.min(ms || 0, 5)), clearTimeout: (t) => clearTimeout(t) };
  const boxion = creerMemoire(), proche = creerProche({ W, boxion: creerMemoire(), tuyau, Contexte: null });
  const s = creerSynthe({ W, boxion, Contexte: null, proche }); await s.pret;
  const pas = [0, null, null, 3, null, null, 5, null, 0, null, null, 3, null, null, 6, null];
  s.choisir({ motif: 'mien', pas }); assert.equal(s.etat().motif, 'mien'); assert.deepEqual(s.etat().pas, pas);
  await new Promise(r => setTimeout(r, 30));
  assert.deepEqual((await boxion.get('reglages', 'synthe')).pas, pas);
  await proche.demarrer({ nom: 'RS-7', salle: 'zurich' }); s.partager(true);
  assert.equal(proche.etat().basse.motif, 'mien'); assert.deepEqual(proche.etat().basse.pas, pas);
  const t = creerSynthe({ W, boxion, Contexte: null }); await t.pret;
  assert.equal(t.etat().motif, 'mien'); assert.deepEqual(t.etat().pas, pas, 'relu au lancement suivant');
});

// ---- (0.99.21) un max de psy : psytrance, tribe, acidcore, mentalcore ; le kick ; partager un son ----
import { STYLES, sonPartage, codeDuSon, lireCodeSon } from '../src/bions/son.js';
import { kicksEntre, MOTIFS } from '../src/bions/proche.js';
test('≋ psy : quatre styles (son, motif, gamme, tempo) ; le kick sur chaque temps ; un code de son qui fait l\'aller-retour', async () => {
  for (const k of ['psytrance', 'tribe', 'acidcore', 'mentalcore']) {
    assert.ok(PRESETS[k] && STYLES[k], k); assert.ok(MOTIFS[STYLES[k].motif], k + ' : son motif'); assert.ok(GAMMES[STYLES[k].gamme], k + ' : sa gamme');
    const n = normaliser(PRESETS[k]); assert.ok(n.kick > 0.5, k + ' : un kick'); assert.equal(n.tempo, PRESETS[k].tempo, k + ' : le tempo tient (240 au plus)');
  }
  assert.ok(PRESETS.psytrance.tempo >= 140 && PRESETS.mentalcore.tempo >= 200);
  assert.deepEqual(MOTIFS.psy.filter((x, i) => i % 4 === 0), [null, null, null, null], 'psytrance : la basse se tait sur le kick');
  const pa = partition({ tempo: 120, motif: 'psy', debut: 0 });   // un temps = 500 ms
  assert.deepEqual(kicksEntre(pa, 0, 2000), [0, 500, 1000, 1500]); assert.deepEqual(kicksEntre(pa, 600, 1100), [1000]);
  // le moteur a son kick : un sinus de plus, seulement si le knob est monté
  const ctx = fauxContexte(); let p = normaliser({ kick: 0 }); const mo = creerMoteur(ctx, () => p);
  const avant = ctx.journal.demarres.length; mo.kick(0); assert.equal(ctx.journal.demarres.length, avant);
  p = normaliser({ kick: 1 }); mo.kick(0); assert.equal(ctx.journal.demarres.length, avant + 1);
  // le synthé : choisir un style pose son motif et sa gamme
  const W = { setInterval: () => 1, clearInterval: () => {}, setTimeout: (f) => setTimeout(f, 0), clearTimeout: () => {} };
  const s = creerSynthe({ W, boxion: creerMemoire(), Contexte: null }); await s.pret;
  assert.ok(s.style('mentalcore')); assert.equal(s.etat().motif, 'mental'); assert.equal(s.etat().gamme, 'harmonique'); assert.equal(s.reglages().tempo, 220);
  // le code : court (seulement ce qui change), et ce qui revient est vérifié
  const code = codeDuSon(s.etatSon('ma mental'));
  assert.match(code, /^ploxi-son:[A-Za-z0-9_-]+$/); assert.ok(code.length < 600, 'court : ' + code.length);
  const r = sonPartage(lireCodeSon('regarde ça : ' + code + ' !'), { motifs: MOTIFS, gammes: GAMMES, pasValides });
  assert.equal(r.nom, 'ma mental'); assert.equal(r.p.tempo, 220); assert.equal(r.motif, 'mental');
  assert.equal(lireCodeSon('ploxi-son:@@@'), null); assert.equal(sonPartage({ p: 'x' }), null);
  assert.equal(sonPartage({ nom: 'x', p: { tempo: 9999, coupure: -5 }, motif: 'virus', gamme: 'virus' }, { motifs: MOTIFS }).p.tempo, 240, 'borné');
  // charger un son venu d'ailleurs : joué, gardé dans tes sons
  const s2 = creerSynthe({ W, boxion: creerMemoire(), Contexte: null }); await s2.pret;
  assert.ok(s2.charger(lireCodeSon(code))); assert.equal(s2.reglages().tempo, 220); assert.ok(s2.etat().sons.includes('ma mental')); assert.equal(s2.etat().motif, 'mental');
});

test('〰 ♫ un son partagé dans le maillage : il voyage avec le message, l\'autre le charge dans son synthé', async () => {
  const tuyaux = new Map();
  const fab = (nom) => { const pair = new Set(), msg = new Set(); const t = { demarrer() { tuyaux.set(nom, t); queueMicrotask(() => { for (const [id, x] of tuyaux) if (id !== nom) { x._pair({ id: nom, etat: 'connecte' }); t._pair({ id, etat: 'connecte' }); } }); return Promise.resolve({ moi: nom }); },
    arreter() { tuyaux.delete(nom); return Promise.resolve(); }, envoyer(d, a) { for (const [id, x] of tuyaux) if (id !== nom && (!a || a.includes(id))) setTimeout(() => x._msg({ de: nom, donnees: d }), 1); return Promise.resolve({ envoyes: 1 }); },
    pairs: () => Promise.resolve([]), surPair: (f) => pair.add(f), surMessage: (f) => msg.add(f), _pair: (e) => { for (const f of pair) f(e); }, _msg: (e) => { for (const f of msg) f(e); } }; return t; };
  const Wf = () => ({ setInterval: () => 0, clearInterval: () => {}, setTimeout: (f) => setTimeout(f, 0), clearTimeout: () => {} });
  const A = creerProche({ W: Wf(), boxion: creerMemoire(), tuyau: fab('A'), Contexte: null }), B = creerProche({ W: Wf(), boxion: creerMemoire(), tuyau: fab('B'), Contexte: null });
  const sA = creerSynthe({ W: Wf(), boxion: creerMemoire(), Contexte: null, proche: A }); await sA.pret;
  await A.demarrer({ nom: 'RS-7' }); await B.demarrer({ nom: 'RS-3' }); await new Promise(r => setTimeout(r, 60));
  sA.style('acidcore');
  assert.ok(A.partagerSon(sA.etatSon('acide du lac')));
  await new Promise(r => setTimeout(r, 60));
  const m = B.etat().messages.at(-1); assert.match(m.texte, /^♫ acide du lac · acide · 190 bpm/); assert.ok(m.son);
  const sB = creerSynthe({ W: Wf(), boxion: creerMemoire(), Contexte: null }); await sB.pret;
  assert.ok(sB.charger(m.son)); assert.equal(sB.reglages().tempo, 190); assert.equal(sB.etat().motif, 'acide');
  await A.arreter(); await B.arreter();
});
