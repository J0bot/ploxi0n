// 👁 (0.99.46) notre suivi tête / regard : le bion pur (src/bions/tete.js) sur des visages de synthèse
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerTete, ajusterAffine, appliquerAffine } from '../src/bions/tete.js';

const suite = (T, n, f, t0 = 0, pas = 33) => { const g = []; for (let i = 0; i < n; i++) g.push(...T.pousser({ t: t0 + i * pas, ...f(i) })); return g; };

test('👁 la tête pointe : centre au départ, tourner déplace le pointeur, le lissage suit', () => {
  const T = creerTete();
  suite(T, 5, () => ({ lacet: 0.1, tangage: -0.05 }));
  assert.deepEqual(T.pointeur(), { x: 0.5, y: 0.5 }, 'la première position est le neutre');
  suite(T, 40, () => ({ lacet: 0.1 - 0.35, tangage: -0.05 }), 200);
  assert.ok(T.pointeur().x > 0.95, 'tourner de la portée = le bord : ' + T.pointeur().x);
  T.recentrer(); suite(T, 2, () => ({ lacet: 1, tangage: 1 }), 2000); assert.deepEqual(T.pointeur(), { x: 0.5, y: 0.5 });
});

test('👁 fixer 0,9 s = toucher, une fois ; bouger relance', () => {
  const T = creerTete();
  const g = suite(T, 60, () => ({ lacet: 0, tangage: 0 }));
  assert.equal(g.filter(x => x.geste === 'fixer').length, 1, JSON.stringify(g));
  assert.equal(g[0].x, 0.5);
  const g2 = suite(T, 60, (i) => ({ lacet: i < 10 ? -0.2 : -0.2, tangage: 0 }), 3000);
  assert.equal(g2.filter(x => x.geste === 'fixer').length, 1, 'un nouveau point fixé');
});

test('👁 cligner longtemps (les deux yeux) = toucher ; un clignement réflexe, non', () => {
  const T = creerTete({ reglages: { fixerMs: 1e9 } });
  const reflexe = suite(T, 10, (i) => ({ lacet: 0, tangage: 0, cligneG: i >= 3 && i < 7 ? 0.9 : 0, cligneD: i >= 3 && i < 7 ? 0.9 : 0 }));
  assert.equal(reflexe.length, 0, '~130 ms : un réflexe');
  const voulu = suite(T, 40, (i) => ({ lacet: 0, tangage: 0, cligneG: i >= 5 && i < 25 ? 0.9 : 0, cligneD: i >= 5 && i < 25 ? 0.9 : 0 }), 1000);
  assert.deepEqual(voulu.map(x => x.geste), ['cligner']);
  const unOeil = suite(T, 40, (i) => ({ lacet: 0, tangage: 0, cligneG: i >= 5 && i < 25 ? 0.9 : 0, cligneD: 0 }), 4000);
  assert.equal(unOeil.length, 0, 'un clin d\'œil n\'est pas un toucher');
});

test('👁 en mode regard, la tête parle : hocher = oui, secouer = non, un coup = gauche / droite', () => {
  const R = { fixerMs: 1e9 };
  const oui = creerTete({ mode: 'regard', reglages: R });
  const go = suite(oui, 30, (i) => ({ lacet: 0, tangage: 0.18 * Math.sin(i / 30 * 2 * Math.PI * 2) }));
  assert.deepEqual(go.map(x => x.geste), ['oui'], JSON.stringify(go));
  const non = creerTete({ mode: 'regard', reglages: R });
  const gn = suite(non, 30, (i) => ({ lacet: 0.2 * Math.sin(i / 30 * 2 * Math.PI * 2), tangage: 0 }));
  assert.deepEqual(gn.map(x => x.geste), ['non'], JSON.stringify(gn));
  const coup = creerTete({ mode: 'regard', reglages: R });
  const gc = suite(coup, 20, (i) => ({ lacet: [0, 0.2, 0.4, 0.45, 0.3, 0.1, 0][Math.min(i, 6)], tangage: 0 }));
  assert.deepEqual(gc.map(x => x.geste), ['gauche'], JSON.stringify(gc));
  const droite = creerTete({ mode: 'regard', reglages: R, inverser: { lacet: false } });
  assert.deepEqual(suite(droite, 20, (i) => ({ lacet: -[0, 0.2, 0.4, 0.45, 0.3, 0.1, 0][Math.min(i, 6)], tangage: 0 })).map(x => x.geste), ['droite']);
  const tete = creerTete({ mode: 'tete', reglages: R });
  assert.equal(suite(tete, 30, (i) => ({ lacet: 0, tangage: 0.18 * Math.sin(i / 30 * 2 * Math.PI * 2) })).length, 0, 'quand la tête pointe, elle ne fait pas de gestes');
});

test('👁 le calibrage du regard : une affine des points bruts vers l\'écran, même avec les axes tournés', () => {
  // la caméra en paysage : x brut = -y écran, y brut = x écran (et en mètres)
  const vrai = (p) => ({ x: 0.5 + p.y / 0.07, y: 0.5 - p.x / 0.15 });
  const bruts = [{ x: 0, y: 0 }, { x: 0.05, y: -0.02 }, { x: -0.06, y: 0.03 }, { x: 0.02, y: 0.025 }];
  const A = ajusterAffine(bruts.map(b => ({ brut: b, vise: vrai(b) })));
  for (const b of bruts) { const p = appliquerAffine(A, b), v = vrai(b); assert.ok(Math.abs(p.x - v.x) < 1e-6 && Math.abs(p.y - v.y) < 1e-6); }
  assert.equal(ajusterAffine([{ brut: { x: 0, y: 0 }, vise: { x: 0, y: 0 } }]), null);
  assert.equal(ajusterAffine([0, 1, 2].map(i => ({ brut: { x: i, y: i }, vise: { x: i, y: i } }))), null, 'alignés : pas de solution');
  const T = creerTete({ mode: 'regard' }); T.calibration(A);
  T.pousser({ t: 0, lacet: 0, tangage: 0, x: 0.05, y: -0.02 });
  const p = T.pointeur(), v = vrai({ x: 0.05, y: -0.02 }); assert.ok(Math.abs(p.x - Math.max(0, Math.min(1, v.x))) < 1e-6);
});
