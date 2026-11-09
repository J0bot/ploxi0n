// ⧉ (0.63) la fractale fluide : la boucle d'images, le ressort (l'élan, un cran par carte), l'haptique selon l'usage, la préparation
// invisible, rien de coincé (pointercancel, un ploxion fermé d'ailleurs), la carte (pincer).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, attendre } from './aide.mjs';

async function monter(p, ids, o = {}) {
  const { creerRouteur } = await import('../src/app/routeur.js');
  const W = p.w; W.jOSApps = W.jOSApps || {};
  const abonnes = new Set(), sons = [];
  W.jOSNatif = Object.assign(W.jOSNatif || {}, { mouvement: { ecouter(cb) { abonnes.add(cb); return () => abonnes.delete(cb); } } });
  for (const id of ids) W.jOSApps[id] = { manifest: { id }, mount(h) { h.innerHTML = '<p>' + id + '</p>'; return { unmount() {} }; } };
  const racine = W.document.createElement('div'); W.document.body.appendChild(racine);
  const r = creerRouteur({ fenetre: W, racine, catalogue: ids.map(id => ({ id, nom: id.toUpperCase(), icone: '◇' })), vibrer: (ev, id, op) => sons.push([ev, id == null ? null : id, (op && op.niveau) || 0]), ...o });
  await r.accueil();
  for (const id of ids) await r.ouvrir(id);
  sons.length = 0;
  return { r, racine, W, sons, abonnes };
}
const ev = (W, el, type, x, y = 400, o = {}) => {
  const e = new W.MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true });
  if (o.pointerId != null) Object.defineProperty(e, 'pointerId', { value: o.pointerId });
  return el.dispatchEvent(e);
};
const noms = (sons) => sons.map(s => s[0]);

test('la profondeur se sent : aperçu (léger) → fractale → slider (le moteur) → cube (le verrou), chacun son haptique', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, racine, W, sons } = await monter(p, ['a', 'b', 'c']);
    await r.ouvrir('b'); sons.length = 0;
    const bd = racine.querySelector('.px-bord-d'), w = W.innerWidth;
    ev(W, bd, 'pointerdown', w - 4); await attendre(200);
    assert.ok(racine.classList.contains('px-fx-prep'), 'à 0,14 s : la fractale se prépare, invisible');
    assert.deepEqual(noms(sons), [], 'rien ne vibre pendant la préparation');
    await attendre(1750);
    ev(W, bd, 'pointermove', w / 2, 400); await attendre(1400);
    assert.ok(racine.classList.contains('px-fx-cube'));
    const n = noms(sons);
    for (const e of ['fx-apercu', 'fx-fractale', 'fx-slider', 'fx-cube']) assert.ok(n.includes(e), e);
    assert.ok(n.indexOf('fx-apercu') < n.indexOf('fx-fractale') && n.indexOf('fx-fractale') < n.indexOf('fx-slider') && n.indexOf('fx-slider') < n.indexOf('fx-cube'), 'dans l\'ordre de la profondeur');
    assert.ok(n.filter(e => e === 'fx-recharge').length >= 3, 'le curseur se charge vers le cube : des crans de plus en plus serrés');
    assert.ok(!n.includes('page') && !n.includes('appui') && !n.includes('portion'), 'plus les anciens événements génériques');
    ev(W, bd, 'pointerup', w / 2, 400);
  } finally { p.fin(); }
});

test('un glissement rapide après la préparation : elle s\'efface sans bruit, le geste de la zone part', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, racine, W, sons } = await monter(p, ['a', 'b', 'c']);
    await r.ouvrir('b'); sons.length = 0;
    const bd = racine.querySelector('.px-bord-d'), w = W.innerWidth;
    ev(W, bd, 'pointerdown', w - 4); await attendre(180);
    assert.ok(racine.classList.contains('px-fx'));
    ev(W, bd, 'pointermove', w - 60); ev(W, bd, 'pointermove', w - 140); ev(W, bd, 'pointerup', w - 140);
    await attendre(250);
    assert.ok(!racine.classList.contains('px-fx') && !racine.querySelector('.px-fx-calque'), 'la préparation rangée');
    assert.equal(r.courant(), 'c', 'la suivante');
    assert.ok(noms(sons).includes('bord'), 'le geste du bord');
    assert.ok(noms(sons).includes('fx-arrivee'), 'l\'app arrive : sa signature');
  } finally { p.fin(); }
});

test('la fractale ouverte : lancer le paquet, il file sur son élan (un cran par carte qui passe) et se pose (fx-pose)', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const { r, racine, W, sons } = await monter(p, ids);
    await r.ouvrir('a'); sons.length = 0;
    assert.equal(r.courant(), 'a');
    const bd = racine.querySelector('.px-bord-d'), w = W.innerWidth;
    ev(W, bd, 'pointerdown', w - 4); await attendre(980); ev(W, bd, 'pointerup', w - 4); await attendre(60);
    assert.ok(racine.classList.contains('px-fx-ouverte'));
    sons.length = 0;
    const calque = racine.querySelector('.px-fx-calque');
    // un lancer vers la gauche : 3 pointermove espacés de ~16 ms, vite
    ev(W, calque, 'pointerdown', 700, 400);
    for (let i = 1; i <= 4; i++) { await attendre(16); ev(W, calque, 'pointermove', 700 - i * 60, 400); }
    ev(W, calque, 'pointerup', 700 - 4 * 60, 400);
    await attendre(900);
    const f = racine.querySelector('.px-fx-cible.on');
    assert.ok(f && +f.dataset.i >= 3, 'le paquet a filé plus loin que le doigt (élan) : ' + (f && f.dataset.i));
    assert.ok(noms(sons).filter(e => e === 'fx-carte').length >= 2, 'des crans : ' + noms(sons).join(','));
    assert.ok(noms(sons).includes('fx-pose'), 'il se pose');
    assert.ok(!racine.classList.contains('px-fx-suit'), 'posé : la boucle rend la main');
  } finally { p.fin(); }
});

test('rien de coincé : un pointercancel dans le cube le laisse dans la main (le calque prend les touchers)', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, racine, W } = await monter(p, ['a', 'b', 'c']);
    await r.ouvrir('b');
    const bd = racine.querySelector('.px-bord-d'), w = W.innerWidth;
    ev(W, bd, 'pointerdown', w - 4); await attendre(1930); ev(W, bd, 'pointermove', w / 2, 400); await attendre(1400);
    assert.ok(racine.classList.contains('px-fx-cube'));
    ev(W, bd, 'pointercancel', w / 2, 400); await attendre(30);
    assert.ok(racine.classList.contains('px-fx-ouverte'), 'le cube reste, ouvert aux touchers');
    // toucher la bande du haut (le fond) : on revient
    racine.querySelector('.px-fx-fond').dispatchEvent(new W.MouseEvent('pointerup', { bubbles: true }));
    await attendre(360);
    assert.ok(!racine.classList.contains('px-fx'), 'revenu');
    assert.equal(r.courant(), 'b');
  } finally { p.fin(); }
});

test('un ploxion fermé d\'ailleurs pendant la fractale : sa carte part (la toucher ne le fait plus revivre)', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, racine, W } = await monter(p, ['a', 'b', 'c']);
    await r.ouvrir('b');
    const bd = racine.querySelector('.px-bord-d'), w = W.innerWidth;
    ev(W, bd, 'pointerdown', w - 4); await attendre(980); ev(W, bd, 'pointerup', w - 4); await attendre(40);
    assert.equal(racine.querySelectorAll('.px-fx-cible').length, 4);
    r.fermerPloxion('c');
    assert.equal(racine.querySelectorAll('.px-fx-cible').length, 3, 'la carte de c est partie');
    assert.ok(![...racine.querySelectorAll('.px-fx-cible')].some(c => c.getAttribute('aria-label') === 'C'));
    assert.ok(racine.classList.contains('px-fx-ouverte'), 'la fractale reste');
  } finally { p.fin(); }
});

test('ouvrir depuis la fractale : la signature de l\'app (fx-ouvrir + son id), une seule fois ; revenir : un cran doux, pas « ouvrir »', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, racine, W, sons } = await monter(p, ['a', 'b', 'c']);
    await r.ouvrir('b'); sons.length = 0;
    const bd = racine.querySelector('.px-bord-d'), w = W.innerWidth;
    ev(W, bd, 'pointerdown', w - 4); await attendre(380);
    ev(W, bd, 'pointermove', w - 4 - w * 0.3); ev(W, bd, 'pointerup', w - 4 - w * 0.3); await attendre(360);
    assert.equal(r.courant(), 'c');
    const n = noms(sons);
    assert.ok(n.includes('fx-engage'), 'le seuil des 30 % se sent');
    assert.deepEqual(sons.filter(s => /ouvrir|reprendre/.test(s[0])), [['fx-ouvrir', 'c', 0]], 'une seule signature, la sienne');
    sons.length = 0;
    ev(W, bd, 'pointerdown', w - 4); await attendre(380); ev(W, bd, 'pointerup', w - 4); await attendre(360);
    assert.equal(r.courant(), 'c');
    assert.ok(noms(sons).includes('fx-revenir') && !noms(sons).some(e => /ouvrir/.test(e)), 'revenir ≠ ouvrir : ' + noms(sons).join(','));
  } finally { p.fin(); }
});

test('rien que l\'accueil : tenir un bord dit non (un refus), une fois', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { racine, W, sons } = await monter(p, []);
    const bd = racine.querySelector('.px-bord-d'), w = W.innerWidth;
    ev(W, bd, 'pointerdown', w - 4); await attendre(1000); ev(W, bd, 'pointerup', w - 4);
    assert.deepEqual(noms(sons).filter(e => e === 'fx-refus'), ['fx-refus']);
    assert.ok(!racine.classList.contains('px-fx'));
  } finally { p.fin(); }
});

test('pincer la fractale ouverte : la carte du xerboxion s\'ouvre, la fractale se range', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, racine, W } = await monter(p, ['a', 'b', 'c']);
    let ouverte = 0; r.brancherCarte({ ouvrir: () => { ouverte++; return true; } });
    await r.ouvrir('b');
    const bd = racine.querySelector('.px-bord-d'), w = W.innerWidth;
    ev(W, bd, 'pointerdown', w - 4); await attendre(980); ev(W, bd, 'pointerup', w - 4); await attendre(40);
    assert.ok(racine.querySelector('.px-fx-tout'), '⊞ tout le xerboxion');
    const calque = racine.querySelector('.px-fx-calque');
    ev(W, calque, 'pointerdown', 200, 300, { pointerId: 1 }); ev(W, calque, 'pointerdown', 600, 500, { pointerId: 2 });
    ev(W, calque, 'pointermove', 300, 360, { pointerId: 1 }); ev(W, calque, 'pointermove', 420, 420, { pointerId: 2 });
    assert.equal(ouverte, 1, 'la carte');
    await attendre(250);
    assert.ok(!racine.classList.contains('px-fx'), 'la fractale rangée derrière');
    assert.equal(r.courant(), 'b', 'sans avoir navigué');
  } finally { p.fin(); }
});
