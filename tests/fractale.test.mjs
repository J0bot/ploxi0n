// ⧉ LA FRACTALE (0.59) : tenir un bord → l'aperçu de l'app d'à côté (la tirer l'amène), la fractale (lâchée sans bouger, elle reste ;
// toucher une app l'ouvre), le slider (ça défile tout seul, lâcher ouvre l'app visée). Glisser vite = le geste de la zone, avec le glissement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, attendre } from './aide.mjs';

async function monter(p, ids) {
  const { creerRouteur } = await import('../src/app/routeur.js');
  const W = p.w; W.jOSApps = W.jOSApps || {};
  for (const id of ids) W.jOSApps[id] = { manifest: { id }, mount(h) { h.innerHTML = '<p>' + id + '</p>'; return { unmount() {} }; } };
  const racine = W.document.createElement('div'); W.document.body.appendChild(racine);
  const r = creerRouteur({ fenetre: W, racine, catalogue: ids.map(id => ({ id, nom: id.toUpperCase(), icone: '◇' })) });
  await r.accueil();
  for (const id of ids) await r.ouvrir(id);
  return { r, racine, W };
}
const ev = (W, el, type, x, y = 400) => el.dispatchEvent(new W.MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true }));

test('glisser vite depuis le bord droit : l\'app suivante (le geste de la zone), sans fractale', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, racine, W } = await monter(p, ['a', 'b', 'c']);
    await r.ouvrir('b');
    const bd = racine.querySelector('.px-bord-d'), w = W.innerWidth;
    ev(W, bd, 'pointerdown', w - 4); ev(W, bd, 'pointermove', w - 60); ev(W, bd, 'pointermove', w - 120); ev(W, bd, 'pointerup', w - 120);
    await attendre(20);
    assert.equal(r.courant(), 'c', 'la suivante');
    assert.ok(!racine.classList.contains('px-fx'), 'pas de fractale pour un glissement');
  } finally { p.fin(); }
});

test('tenir le bord droit : l\'aperçu de la suivante ; la tirer à plus de 30 % puis lâcher = y aller ; moins = tout revient', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, racine, W } = await monter(p, ['a', 'b', 'c']);
    await r.ouvrir('a');
    const bd = racine.querySelector('.px-bord-d'), w = W.innerWidth;
    ev(W, bd, 'pointerdown', w - 4); await attendre(380);
    assert.ok(racine.classList.contains('px-fx'), 'l\'aperçu est là');
    const hb = racine.querySelector('.px-hote[data-ploxion="b"]');
    assert.ok(hb.classList.contains('px-fx-carte'), 'la suivante est elle-même (son hôte vivant), pas une copie');
    ev(W, bd, 'pointermove', w - 4 - w * 0.1); ev(W, bd, 'pointerup', w - 4 - w * 0.1);
    await attendre(360);
    assert.equal(r.courant(), 'a', 'pas assez tirée : on reste');
    assert.ok(!racine.classList.contains('px-fx') && !hb.classList.contains('px-fx-carte'), 'tout est rangé');
    ev(W, bd, 'pointerdown', w - 4); await attendre(380);
    ev(W, bd, 'pointermove', w - 4 - w * 0.3); ev(W, bd, 'pointerup', w - 4 - w * 0.3);
    await attendre(360);
    assert.equal(r.courant(), 'b', 'tirée : on y va');
    assert.ok(!hb.hidden && hb.style.transform === '', 'l\'hôte est rendu tel quel');
  } finally { p.fin(); }
});

test('tenir 0,9 s : la fractale, lâchée sans bouger elle reste ; toucher une app l\'ouvre ; l\'accueil et les endormis sont des cartes', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, racine, W } = await monter(p, ['a', 'b', 'c']);
    await r.ouvrir('b');
    const bg = racine.querySelector('.px-bord-g');
    ev(W, bg, 'pointerdown', 4); await attendre(980);
    assert.ok(racine.querySelector('.px-fx-calque'), 'la fractale');
    assert.equal(racine.querySelectorAll('.px-fx-cible').length, 4, 'l\'accueil + a, b, c');
    assert.ok(racine.querySelector('.px-fx-icone'), 'l\'accueil, en carte');
    ev(W, bg, 'pointerup', 4); await attendre(30);
    assert.ok(racine.classList.contains('px-fx-ouverte'), 'lâchée sans bouger : elle reste ouverte');
    assert.equal(r.courant(), 'b');
    // les cartes de chaque côté rapetissent (la fractale symétrique)
    const sc = (i) => +/scale\(([\d.]+)\)/.exec(racine.querySelector('.px-fx-cible[data-i="' + i + '"]').style.transform)[1];
    assert.ok(sc(2) > sc(1) && sc(1) > sc(0) && Math.abs(sc(1) - sc(3)) < 1e-9, 'au milieu la plus grande, symétrique');
    const cible = racine.querySelector('.px-fx-cible[data-i="3"]');
    W.document.elementFromPoint = () => cible;
    ev(W, racine.querySelector('.px-fx-calque'), 'pointerdown', 300); ev(W, racine.querySelector('.px-fx-calque'), 'pointerup', 300);
    await attendre(360);
    assert.equal(r.courant(), 'c', 'touchée : ouverte');
    assert.ok(!racine.querySelector('.px-fx-calque'));
  } finally { p.fin(); }
});

test('tenir 1,9 s : le slider défile tout seul vers le bord tenu ; lâcher ouvre l\'app visée', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, racine, W } = await monter(p, ['a', 'b', 'c', 'd', 'e']);
    await r.ouvrir('a');
    const bd = racine.querySelector('.px-bord-d'), w = W.innerWidth;
    ev(W, bd, 'pointerdown', w - 4); await attendre(2000);
    assert.ok(racine.classList.contains('px-fx-suit'), 'le slider (il suit, sans transition)');
    await attendre(500);
    ev(W, bd, 'pointerup', w - 4); await attendre(360);
    assert.notEqual(r.courant(), 'a', 'ça a défilé vers la droite : une app plus loin s\'ouvre');
    assert.ok(['b', 'c', 'd', 'e'].includes(r.courant()));
  } finally { p.fin(); }
});
