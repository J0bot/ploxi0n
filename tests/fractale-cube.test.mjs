// ⧉ (0.60) le jeu de cartes, le cube, le gyroscope, le freefall ; ◇ le banc du trackpad haptique.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, attendre } from './aide.mjs';
import { creerTexture } from '../src/banc/trackpad.js';

async function monter(p, ids, { bions = {} } = {}) {
  const { creerRouteur } = await import('../src/app/routeur.js');
  const W = p.w; W.jOSApps = W.jOSApps || {};
  const abonnes = new Set();
  W.jOSNatif = Object.assign(W.jOSNatif || {}, { mouvement: { ecouter(cb) { abonnes.add(cb); return () => abonnes.delete(cb); } } });
  const pencher = (x, y = 0) => { for (const cb of abonnes) cb({ x, y }); };
  for (const id of ids) W.jOSApps[id] = { manifest: { id }, mount(h) { h.innerHTML = '<p>' + id + '</p>'; return { unmount() {} }; } };
  const racine = W.document.createElement('div'); W.document.body.appendChild(racine);
  const r = creerRouteur({ fenetre: W, racine, catalogue: ids.map(id => ({ id, nom: id.toUpperCase(), icone: '◇', bions: bions[id] || [] })) });
  await r.accueil();
  for (const id of ids) await r.ouvrir(id);
  return { r, racine, W, pencher, abonnes };
}
const ev = (W, el, type, x, y = 400) => el.dispatchEvent(new W.MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true }));

test('le cube : arrêté dans le slider et tenu 1,2 s, le xer devient un cube ; glisser vers le haut montre la face du dessus, les bions du ploxion ; il reste dans la main', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, racine, W } = await monter(p, ['a', 'b', 'c'], { bions: { b: ['jOSGpg', 'jOSBug'], c: ['jOSGpg', 'jOSBug'] } });
    await r.ouvrir('b');
    const bd = racine.querySelector('.px-bord-d'), w = W.innerWidth;
    ev(W, bd, 'pointerdown', w - 4, 400); await attendre(1930);
    ev(W, bd, 'pointermove', w / 2, 400);   // dans le slider, le doigt ramené au centre : arrêté sur b
    await attendre(1500);
    assert.ok(racine.classList.contains('px-fx-cube'), 'le cube');
    ev(W, bd, 'pointermove', w / 2, 400);
    ev(W, bd, 'pointermove', w / 2, 220);   // glisser vers le haut : pencher le cube
    await attendre(50);   // (0.63) tout passe par la boucle d'images
    const dessus = racine.querySelector('.px-fx-dessus');
    assert.match(dessus.textContent, /jOSGpg/); assert.match(dessus.textContent, /2 bions/);
    assert.ok(+dessus.style.opacity > 0.5, 'la face du dessus se voit');
    ev(W, bd, 'pointerup', w / 2, 220); await attendre(30);
    assert.ok(racine.classList.contains('px-fx-cube') && racine.classList.contains('px-fx-ouverte'), 'lâché : le cube reste');
  } finally { p.fin(); }
});

test('la fractale ouverte : jeter une carte vers le haut ferme le ploxion, les autres se resserrent', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, racine, W } = await monter(p, ['a', 'b', 'c']);
    await r.ouvrir('b');
    const bd = racine.querySelector('.px-bord-d'), w = W.innerWidth;
    ev(W, bd, 'pointerdown', w - 4); await attendre(980); ev(W, bd, 'pointerup', w - 4); await attendre(30);
    const calque = racine.querySelector('.px-fx-calque'), carteC = racine.querySelector('.px-fx-cible[aria-label="C"]');
    carteC.dispatchEvent(new W.MouseEvent('pointerdown', { clientX: 300, clientY: 500, bubbles: true }));
    ev(W, calque, 'pointermove', 300, 420); ev(W, calque, 'pointermove', 300, 100); ev(W, calque, 'pointerup', 300, 100);
    await attendre(420);   // (0.63) les voisines se resserrent d'abord, le démontage suit
    assert.ok(!r.vivants().includes('c'), 'c est fermé');
    assert.equal(racine.querySelectorAll('.px-fx-cible').length, 3, 'l\'accueil, a, b');
    assert.ok(racine.classList.contains('px-fx-ouverte'), 'la fractale reste ouverte');
  } finally { p.fin(); }
});

test('le slider : le gyroscope penché accélère le défilement', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const { r, racine, W, pencher } = await monter(p, ids);
    await r.ouvrir('a');
    const bd = racine.querySelector('.px-bord-d'), w = W.innerWidth;
    ev(W, bd, 'pointerdown', w - 4); await attendre(1950);
    ev(W, bd, 'pointermove', w / 2, 400);   // le doigt au milieu : le doigt seul ne fait plus défiler
    pencher(0);   // la tenue de départ (le zéro du gyroscope)
    for (let i = 0; i < 6; i++) { pencher(-1); await attendre(30); }   // penché à gauche : vers les précédents (l'accueil)
    await attendre(300);
    ev(W, bd, 'pointerup', w / 2, 400); await attendre(360);
    assert.equal(r.courant(), null, 'penché à gauche : le slider est allé jusqu\'à l\'accueil');
  } finally { p.fin(); }
});

test('freefall : penché un instant, la fractale s\'ouvre ; droit 1,4 s sur une app, elle s\'ouvre ; le badge l\'arrête', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, racine, W, pencher, abonnes } = await monter(p, ['a', 'b', 'c']);
    await r.ouvrir('a');
    assert.equal(r.freefall(true), true);
    pencher(0);   // la tenue de départ (le zéro du gyroscope)
    assert.ok(racine.querySelector('.px-freefall'), 'le badge');
    const h = racine.querySelector('.px-hote[data-ploxion="a"]'); h.scrollTop = 0;
    for (let i = 0; i < 5; i++) { pencher(0, 0.6); await attendre(60); }
    assert.ok(h.scrollTop > 0, '(0.62) penché en avant : le ploxion défile');
    for (let i = 0; i < 3; i++) { pencher(0, 0); await attendre(60); }
    for (let i = 0; i < 8; i++) { pencher(0.8); await attendre(100); }
    assert.ok(racine.classList.contains('px-fx-ouverte'), 'penché : la fractale, en freefall');
    for (let i = 0; i < 20; i++) { pencher(0); await attendre(100); }
    await attendre(360);
    assert.ok(!racine.querySelector('.px-fx-calque'), 'droit : une app s\'est ouverte');
    assert.notEqual(r.courant(), 'a', 'penché à droite : une app plus loin');
    racine.querySelector('.px-freefall').click();
    assert.ok(!racine.querySelector('.px-freefall') && abonnes.size === 0, 'arrêté : le gyroscope n\'est plus écouté');
  } finally { p.fin(); }
});

test('◇ le trackpad haptique : la grille fait un cran tous les N px, les bords un choc, une cible une bosse (et l\'aimante)', () => {
  const t = creerTexture({ largeur: 300, hauteur: 190, cibles: [{ x: 200, y: 80, l: 40, h: 30 }] });
  const g = t.bouger(50, 0, { texture: 'grille', pas: 12, cran: 'selection' });
  assert.deepEqual(g, ['selection', 'selection', 'selection', 'selection'], '50 px : 4 crans de 12');
  assert.ok(t.bouger(400, 0, { texture: 'bords', pas: 12, cran: 'selection' }).includes('fort'), 'le bord : un choc');
  assert.deepEqual(t.bouger(-5, 0, { texture: 'bords', pas: 12, cran: 'selection' }), [], 'en quittant le bord : rien');
  t.placer(150, 95);
  assert.deepEqual(t.bouger(60, 0, { texture: 'cibles', pas: 12, cran: 'selection' }), ['leger'], 'entrer dans la cible : une bosse');
  assert.ok(t.x > 210, 'aimanté vers son centre');
  assert.deepEqual(t.bouger(2, 0, { texture: 'aucune', pas: 12, cran: 'selection' }), []);
});

test('◇ le trackpad haptique : le ploxion se monte, un toucher bref = un clic (moyen)', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, joues = [];
    const { enregistrerTrackpad } = await import('../src/banc/trackpad.js');
    const reg = enregistrerTrackpad({ W, vibrer: (s) => { joues.push(s); return Promise.resolve(); } });
    assert.deepEqual([reg.id, reg.interne], ['trackpad', true]);
    const h = W.document.createElement('div'); W.document.body.appendChild(h);
    const inst = W.jOSApps.trackpad.mount(h);
    const pad = h.querySelector('[data-pad]');
    pad.dispatchEvent(new W.MouseEvent('pointerdown', { clientX: 100, clientY: 100, bubbles: true }));
    pad.dispatchEvent(new W.MouseEvent('pointerup', { clientX: 100, clientY: 100, bubbles: true }));
    assert.ok(joues.includes('moyen'), 'le clic');
    pad.dispatchEvent(new W.MouseEvent('pointerdown', { clientX: 100, clientY: 100, bubbles: true }));
    for (let i = 1; i <= 10; i++) pad.dispatchEvent(new W.MouseEvent('pointermove', { clientX: 100 + i * 6, clientY: 100, bubbles: true }));
    assert.ok(joues.filter(s => s === 'selection').length >= 3, 'la grille crante');
    inst.unmount();
  } finally { p.fin(); }
});
