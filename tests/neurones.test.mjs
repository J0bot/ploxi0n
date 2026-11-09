// 〰 (0.93) les bords organiques et les neurones : les synapses relient chaque cellule à au moins une voisine (un arbre, pas un treillis) ;
// la couche SVG ne se dessine qu'avec html.px-organique, ignore les cellules d'un groupe imbriqué, et ne se refait pas si rien n'a bougé
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { synapses, creerNeurones } from '../src/app/neurones.js';

const grille = (n, m, t = 50, g = 8) => { const cs = []; for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) cs.push({ x: j * (t + g), y: i * (t + g), w: t, h: t }); return cs; };
function relies(cs, ponts) {   // les morceaux qui restent après les synapses
  const chef = cs.map((_, i) => i), f = (i) => (chef[i] === i ? i : (chef[i] = f(chef[i])));
  const centre = (p) => [p.x + p.w / 2, p.y + p.h / 2];
  for (const p of ponts) {   // un pont touche les deux cellules qu'il relie
    const [cx, cy] = centre(p), touche = cs.map((c, i) => [c, i]).filter(([c]) => p.x < c.x + c.w && p.x + p.w > c.x && p.y < c.y + c.h && p.y + p.h > c.y).map(([, i]) => i);
    assert.equal(touche.length, 2, 'un pont entre deux cellules (' + cx + ',' + cy + ')');
    chef[f(touche[0])] = f(touche[1]);
  }
  return new Set(cs.map((_, i) => f(i))).size;
}

test('〰 les synapses : tout est relié, sans treillis ; loin, rien ; en diagonale, rien', () => {
  const cs = grille(3, 4), toutes = synapses(cs, { autres: 1 }), arbre = synapses(cs, { autres: 0 });
  assert.equal(toutes.length, 3 * 3 + 2 * 4, 'autres: 1 → toutes les paires voisines');
  assert.equal(arbre.length, cs.length - 1, 'autres: 0 → un arbre');
  assert.equal(relies(cs, arbre), 1); assert.equal(relies(cs, synapses(cs)), 1);
  assert.deepEqual(synapses(cs), synapses(cs), 'fixe : le même à chaque dessin');
  assert.equal(synapses([{ x: 0, y: 0, w: 50, h: 50 }, { x: 90, y: 0, w: 50, h: 50 }]).length, 0, 'au-delà du seuil');
  assert.equal(synapses([{ x: 0, y: 0, w: 50, h: 50 }, { x: 90, y: 0, w: 50, h: 50 }], { seuil: 64 }).length, 1, 'un seuil plus large (la map)');
  assert.equal(synapses([{ x: 0, y: 0, w: 50, h: 50 }, { x: 58, y: 58, w: 50, h: 50 }]).length, 0, 'en diagonale');
  const [p] = synapses([{ x: 0, y: 0, w: 200, h: 40 }, { x: 0, y: 50, w: 200, h: 40 }]);
  assert.ok(p.w >= 10 && p.w <= 26 && p.h === 18, 'un pont étroit, qui mord dans les deux corps : ' + JSON.stringify(p));
});

test('〰 la couche : seulement avec px-organique ; les cellules imbriquées vont à leur groupe ; rien n\'est refait si rien ne bouge', () => {
  const dom = new JSDOM('<!doctype html><body><div id="g" data-neurones><button data-neurone id="a">a</button><button data-neurone id="b">b</button>'
    + '<div data-neurone id="c"><div data-neurones="fin" id="g2"><i data-neurone id="d"></i></div></div></div></body>', { pretendToBeVisual: true });
  const W = dom.window, D = W.document;
  const pos = { g: [0, 0, 300, 300], a: [0, 0, 100, 60], b: [108, 0, 100, 60], c: [0, 68, 208, 100], g2: [10, 78, 100, 60], d: [10, 78, 40, 40] };
  for (const [id, [x, y, w, h]] of Object.entries(pos)) { const el = D.getElementById(id); el.getBoundingClientRect = () => ({ left: x, top: y, width: w, height: h }); Object.defineProperty(el, 'offsetWidth', { value: w }); }
  const n = creerNeurones({ W });
  n.scanner(); n.tout();
  assert.equal(n.groupes(), 0, 'sans px-organique : rien');
  assert.equal(D.querySelector('.px-neurones'), null);
  D.documentElement.classList.add('px-organique');
  n.scanner(); n.tout();
  assert.equal(n.groupes(), 2);
  assert.ok(D.getElementById('px-f-nerfs-mb') && D.getElementById('px-f-nerfs-dd-fin'), 'les filtres de la variante (nerfs par défaut), une fois');
  const s1 = D.getElementById('g').querySelector(':scope>.px-neurones'), s2 = D.getElementById('g2').querySelector(':scope>.px-neurones');
  assert.ok(s1 && s2);
  // g : a, b, c (pas d) → 3 corps par calque, et des ponts ; g2 : d seul, le filtre fin
  const g1 = s1.querySelectorAll('g'); assert.equal(g1.length, 2);
  assert.ok(g1[0].querySelectorAll('rect').length >= 3 + 2, 'a, b, c et au moins deux synapses');
  assert.equal(s2.querySelectorAll('g')[0].querySelectorAll('rect').length, 1);
  assert.match(s2.querySelector('g').getAttribute('filter'), /px-f-nerfs-mb-fin/);
  const avant = s1.innerHTML; s1.setAttribute('data-x', '1');
  n.tout(); assert.equal(s1.innerHTML, avant, 'rien n\'a bougé : rien n\'est refait');
  // (0.95) une autre variante : ses filtres, le dessin refait
  D.documentElement.setAttribute('data-px-variante', 'terminal'); for (const x of [s1, s2]) x.removeAttribute('data-x');
  n.scanner(); n.tout();
  assert.ok(D.getElementById('px-f-terminal-mb'), 'les filtres du terminal');
  assert.match(D.getElementById('g').querySelector(':scope>.px-neurones g').getAttribute('filter'), /px-f-terminal-mb/);
  D.documentElement.classList.remove('px-organique'); n.tout();
  assert.equal(D.querySelector('.px-neurones'), null, 'coupé : la couche s\'en va');
});

test('〰 les variantes : des nombres, chacune complète ; le terminal sans onde', async () => {
  const { VARIANTES } = await import('../src/bions/membrane.js');
  assert.deepEqual(Object.keys(VARIANTES).filter(k => !VARIANTES[k].lot), ['nerfs', 'vaisseaux', 'cables', 'gelee', 'terminal'], 'le premier lot');
  assert.ok(Object.keys(VARIANTES).filter(k => VARIANTES[k].lot === 2).length >= 11, 'le deuxième lot, plus alien');
  for (const [k, v] of Object.entries(VARIANTES)) for (const c of ['flou', 'onde', 'freq', 'epais', 'paroi', 'ame', 'clair', 'halo']) assert.equal(typeof v[c], 'number', k + '.' + c);
  assert.equal(VARIANTES.terminal.onde, 0);
});

test('〰 les excroissances : fixes (le même dessin), dans le bon sens ; un faisceau garde ses fibres visibles', async () => {
  const { cils, faisceau, vertebres, coulures, epines, hasard } = await import('../src/bions/excroissances.js');
  const q = { x: 0, y: 0, w: 200, h: 120 };
  assert.deepEqual(cils(q), cils(q), 'fixe');
  assert.equal(hasard(1, 2, 3), hasard(1, 2, 3));
  for (const c of cils(q, { long: 18, large: 7 })) {   // chaque cil a une base large (le long du bord), pas une ligne plate
    const [[ax, ay], [bx, by]] = c.pts; assert.ok(Math.hypot(ax - bx, ay - by) > 5, 'la base du cil');
  }
  const f = faisceau({ x: 0, y: 0, w: 30, h: 20 }, 3);
  assert.equal(f.length, 3); assert.ok(f.every(x => x.h >= 4.5), 'assez épaisses pour le goo');
  assert.ok(vertebres({ x: 0, y: 0, w: 40, h: 10 }).length >= 4);
  assert.equal(epines(q).length, 4); assert.equal(coulures(q, { n: 3 }).length, 6);
});
