// ▶ (0.63) les démos : un doigt fantôme fait le geste pour de vrai ; les nouveautés se jouent (« le jeu c'est le tuto »).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, attendre } from './aide.mjs';

async function monter(p, ids) {
  const { creerRouteur } = await import('../src/app/routeur.js');
  const W = p.w; W.jOSApps = W.jOSApps || {};
  for (const id of ids) W.jOSApps[id] = { manifest: { id }, mount(h) { h.innerHTML = '<p>' + id + '</p>'; return { unmount() {} }; } };
  const racine = W.document.createElement('div'); racine.id = 'ploxi0n'; W.document.body.appendChild(racine);
  const r = creerRouteur({ fenetre: W, racine, catalogue: ids.map(id => ({ id, nom: id.toUpperCase(), icone: '◇' })) });
  await r.accueil();
  for (const id of ids) await r.ouvrir(id);
  return { r, racine, W };
}

test('▶ la démo « glisser » : le doigt fantôme passe à l\'app suivante, pour de vrai, puis disparaît', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, W, racine } = await monter(p, ['a', 'b', 'c']);
    await r.ouvrir('a');
    const { creerDemo } = await import('../src/app/demo.js');
    const demo = creerDemo({ W, routeur: () => r, racine });
    const fin = demo.jouer('glisser');
    await attendre(60);
    assert.ok(W.document.querySelector('.px-demo-doigt') && W.document.querySelector('.px-demo-badge'), 'le doigt et le badge');
    assert.equal(await fin, true);
    assert.equal(r.courant(), 'b', 'la suivante');
    assert.ok(!W.document.querySelector('.px-demo-doigt') && !demo.enCours(), 'rangé');
  } finally { p.fin(); }
});

test('▶ la démo « aperçu » : tenir, tirer au-delà de 30 %, lâcher → l\'app d\'à côté', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, W, racine } = await monter(p, ['a', 'b', 'c']);
    await r.ouvrir('b');
    const { creerDemo } = await import('../src/app/demo.js');
    const demo = creerDemo({ W, routeur: () => r, racine });
    await demo.jouer('apercu');
    await attendre(400);
    assert.equal(r.courant(), 'c');
  } finally { p.fin(); }
});

test('▶ sans autre app que l\'accueil : la démo le dit au lieu de mimer dans le vide ; arreter() coupe tout', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, W, racine } = await monter(p, []);
    const { creerDemo } = await import('../src/app/demo.js');
    const dits = []; const demo = creerDemo({ W, routeur: () => r, racine, signaler: (t) => dits.push(t) });
    assert.equal(await demo.jouer('fractale'), false);
    assert.equal(dits.length, 1);
    assert.equal(await demo.jouer('inconnue'), false);
  } finally { p.fin(); }
});

test('✦ les nouveautés se jouent : ▶ essayer ferme la feuille et lance la démo du point', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, joues = [];
    const { creerNouveautes, NOUVEAUTES } = await import('../src/app/nouveautes.js');
    const boxion = { get: async () => null, put: async () => {} };
    const n = creerNouveautes({ W, boxion, version: NOUVEAUTES[0].v, essayer: (nom) => joues.push(nom) });
    const f = n.tout();
    const b = f.querySelector('[data-essayer="cube"]');
    assert.ok(b, 'le cube a son ▶ essayer');
    assert.ok(f.querySelectorAll('[data-essayer]').length >= 6, 'plusieurs fonctions se jouent, jusque dans les anciennes versions');
    b.click(); await attendre(320);
    assert.ok(!f.isConnected, 'la feuille se ferme');
    assert.deepEqual(joues, ['cube']);
  } finally { p.fin(); }
});
