// 🌍 (0.71) le terrax : la géométrie (distance, cap, projection AR, tuiles), les quêtes, poser un objet ; ses pages font son cube
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distanceCap, decaler, versTuile, depuisTuile, projeter, avancee, creerTerrax, autour, depuisAncre, versAncre } from '../src/terrax/terrax.js';
import { trouverPages } from '../src/app/cube-pages.js';
import { page, attendre } from './aide.mjs';

const LAUSANNE = { lat: 46.5197, lon: 6.6323 }, GENEVE = { lat: 46.2044, lon: 6.1432 };

test('🌍 distance et cap, décaler, les tuiles (aller-retour)', () => {
  const { d, cap } = distanceCap(LAUSANNE, GENEVE);
  assert.ok(d > 49000 && d < 53000, 'Lausanne → Genève ≈ 51 km : ' + d);
  assert.ok(cap > 220 && cap < 240, 'vers le sud-ouest : ' + cap);
  const p = decaler(LAUSANNE, 1000, 90), r = distanceCap(LAUSANNE, p);
  assert.ok(Math.abs(r.d - 1000) < 0.5 && Math.abs(r.cap - 90) < 0.1);
  const t = versTuile(LAUSANNE.lat, LAUSANNE.lon, 16), b = depuisTuile(t.x, t.y, 16);
  assert.ok(Math.abs(b.lat - LAUSANNE.lat) < 1e-9 && Math.abs(b.lon - LAUSANNE.lon) < 1e-9);
  assert.equal(autour(350 - 10), -20); assert.equal(autour(-190), 170);
});

test('👁 projeter : devant au centre, à droite à droite, derrière nulle part, plus haut plus haut', () => {
  const vue = { cap: 0, tangage: 0, w: 400, h: 800 };
  const devant = projeter(vue, 10, 0);
  assert.equal(Math.round(devant.x), 200); assert.equal(Math.round(devant.y), 400);
  assert.ok(projeter(vue, 10, 20).x > 300, '20° à droite');
  assert.equal(projeter(vue, 10, 180), null, 'derrière');
  assert.ok(projeter(vue, 10, 0, 3).y < 400, 'un objet plus haut que les yeux');
  assert.ok(projeter({ ...vue, tangage: 20 }, 10, 0).y > 400, 'l\'iPhone levé : l\'horizon descend');
  assert.ok(projeter(vue, 5, 0).s > projeter(vue, 50, 0).s, 'plus près, plus grand');
  assert.ok(projeter({ ...vue, cap: 350 }, 10, 5), 'autour du nord');
});

test('⚑ les quêtes avancent avec ce qu\'on pose', () => {
  const o = (lat, lon, x = {}) => ({ lat, lon, lieu: 'terre', ...x });
  const a = avancee([o(46.5, 6.6), o(46.5001, 6.6), o(46.51, 6.6, { partage: 1 }), { lieu: 'chambre' }], { regard: 1 });
  assert.deepEqual(a['premier-pas'], [1, 1]); assert.deepEqual(a['parc-chiant'], [2, 5]); assert.deepEqual(a.marcheur, [1, 1], '1,1 km');
  assert.deepEqual(a.chambre, [1, 3]); assert.deepEqual(a.nexus, [1, 1]); assert.deepEqual(a.regard, [1, 1]);
});

test('🌍 le ploxion : poser au centre (un tsoin), la chambre à soi ; ses quatre pages font son cube', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document;
    creerTerrax({ W, boxion: p.boxion });
    const h = D.createElement('div'); D.body.appendChild(h);
    const inst = W.jOSApps.terrax.mount(h); await attendre(40);
    const t = trouverPages(h, inst, 'terrax');
    assert.equal(t.source, 'dom'); assert.deepEqual(t.pages.map(x => x.val), ['terrion', 'terrax', 'chambre', 'quetes']); assert.ok(t.photo, 'ses panneaux : photographiés sans rien toucher');
    h.querySelector('[data-tx="poser-centre"]').click();
    [...h.querySelectorAll('[data-tx-e]')].find(b => b.dataset.txE === '🌳').click();   // (jsdom ne sait pas chercher un emoji dans un sélecteur)
    h.querySelector('[data-tx-texte]').value = 'un arbre dans le parc chiant';
    h.querySelector('[data-tx="graver"]').click();
    // (0.99.67) attendre que l'objet soit gravé et marqué, pas 30 ms fixes (sous la charge de toute la suite, la marque arrivait après)
    for (let t0 = Date.now(); !(h.querySelector('.tx-m') && ((await p.boxion.get('terrax', 'objets')) || []).length) && Date.now() - t0 < 2000;) await attendre(15);
    const objets = await p.boxion.get('terrax', 'objets');
    assert.equal(objets.length, 1); assert.equal(objets[0].emoji, '🌳'); assert.ok(objets[0].lat != null && !objets[0].partage, 'à toi par défaut');
    assert.ok(h.querySelector('.tx-m'), 'sa marque sur la carte');
    const ts = await p.boxion.lire('tsoins'); assert.ok(ts.some(x => x.entry.kind === 'terrax' && x.entry.action === 'poser'));
    inst.allerPage('chambre'); h.querySelector('[data-tx="poser-chambre"]').click();
    assert.ok(!h.querySelector('[data-tx-partage]'), 'la chambre : jamais au nexus');
    h.querySelector('[data-tx-texte]').value = 'mon robot'; h.querySelector('[data-tx="graver"]').click();
    for (let t0 = Date.now(); !/mon robot/.test((h.querySelector('.tx-chambre') || {}).textContent || '') && Date.now() - t0 < 2000;) await attendre(15);
    assert.match(h.querySelector('.tx-chambre').textContent, /mon robot/);
    inst.allerPage('quetes'); assert.match(h.querySelector('.tx-quetes').textContent, /✓Pose ton premier objet/);
    assert.match(h.querySelector('.tx-quetes').textContent, /ar-arkit/);
    inst.unmount();
  } finally { p.fin(); }
});

test('🧿 composer : les souvenirs de mappion et les ancres du nexus sont des couches ; partager pousse une ancre', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, pousses = [];
    await p.boxion.put('box:mappion', 'souvenirs', { data: [{ id: 's1', lat: 46.792, lng: 6.6426, e: '✨', txt: 'Départ du terrax', ts: 1 }] });
    const nexus = { push: async (kind, a) => { pousses.push([kind, a]); return true; }, pull: async () => [{ id: 'n1', lat: 46.7921, lng: 6.6427, ion: '🗿', txt: 'posé par quelqu\'un' }] };
    creerTerrax({ W, boxion: p.boxion, nexus });
    const h = D.createElement('div'); D.body.appendChild(h);
    const inst = W.jOSApps.terrax.mount(h); await attendre(60);
    inst.position({ lat: 46.792, lon: 6.6426 }); await attendre(40);
    const sources = [...h.querySelectorAll('.tx-m')].map(m => m.className);
    assert.ok(sources.some(c => /tx-mappion/.test(c)), 'le souvenir de mappion'); assert.ok(sources.some(c => /tx-nexus/.test(c)), 'l\'ancre du nexus');
    h.querySelector('[data-tx="poser-centre"]').click();
    h.querySelector('[data-tx-partage]').checked = true; h.querySelector('[data-tx-texte]').value = 'pour tout le monde';
    h.querySelector('[data-tx="graver"]').click(); await attendre(40);
    assert.equal(pousses.length, 1); assert.equal(pousses[0][0], 'ancre'); assert.equal(pousses[0][1].portee, 'nexus'); assert.equal(pousses[0][1].txt, 'pour tout le monde');
    assert.ok((await p.boxion.get('terrax', 'objets'))[0].partage, 'marqué partagé');
    assert.deepEqual(depuisAncre({ id: 'x', lat: 1, lng: 2, e: '🎵', txt: 't' }, 'mappion'), { id: 'mappion:x', lat: 1, lon: 2, emoji: '🎵', texte: 't', lieu: 'terre', le: depuisAncre({ id: 'x', lat: 1, lng: 2, e: '🎵', txt: 't' }, 'mappion').le, source: 'mappion' });
    assert.equal(versAncre({ id: 'a', lat: 1, lon: 2, emoji: '🌳', texte: 'x', le: 5 }).lng, 2);
    inst.unmount();
  } finally { p.fin(); }
});
