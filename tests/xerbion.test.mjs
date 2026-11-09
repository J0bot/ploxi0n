// ⧈ (0.66) le xerbion (les données des bions du ploxion) ; ◈ le xerploxion (sa version holographique)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lireXerbion, htmlXerbion } from '../src/app/xerbion.js';
import { page, attendre } from './aide.mjs';

test('⧈ lireXerbion : ses espaces, ceux de chacun de ses bions, ses tsoins', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const b = p.boxion;
    const ranger = async (ns, k, data) => { await b.put('box:' + ns, k, { ns, key: k, data, savedAt: new Date().toISOString() }); await b.put('box-index', ns, 1); };
    await ranger('pourriture', 'etat', { a: 1 }); await ranger('pourriture-4', 'x', [1, 2]); await ranger('gpg-cles', 'moi', 'clé'); await ranger('autre', 'z', 1);
    await b.append('tsoins', { kind: 'tsoin', ploxion: 'pourriture', d: 'x' });
    const x = await lireXerbion({ boxion: b, id: 'pourriture', bions: ['jOSGpg', 'jOSBug'] });
    assert.deepEqual(x.propre.map(e => e.ns).sort(), ['pourriture', 'pourriture-4']);
    assert.deepEqual(x.bions.map(y => [y.nom, y.espaces.map(e => e.ns)]), [['jOSGpg', ['gpg-cles']], ['jOSBug', []]]);
    assert.equal(x.tsoins, 1);
    const h = htmlXerbion(x); assert.match(h, /le xerbion/); assert.match(h, /gpg-cles · 1 clé/); assert.match(h, /rien de gardé/);
  } finally { p.fin(); }
});

test('◈ le xerploxion : le ploxion à l\'écran devient un hologramme (vivant), un bord le remet à plat', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { creerRouteur } = await import('../src/app/routeur.js');
    const W = p.w; W.jOSApps = W.jOSApps || {}; W.jOSApps.a = { manifest: { id: 'a' }, mount(h) { h.innerHTML = '<p>a</p>'; return { unmount() {} }; } };
    const racine = W.document.createElement('div'); W.document.body.appendChild(racine);
    const r = creerRouteur({ fenetre: W, racine, catalogue: [{ id: 'a', nom: 'A' }] });
    await r.accueil(); await r.ouvrir('a');
    racine.querySelector('[data-holo]').click();
    const h = racine.querySelector('.px-hote[data-ploxion="a"]');
    assert.ok(r.holoActif() && h.classList.contains('px-holo') && racine.querySelector('.px-holo-socle'));
    assert.match(h.style.transform, /rotateX\(14\.00deg\)/);
    racine.querySelector('.px-bord-d').dispatchEvent(new W.MouseEvent('pointerdown', { clientX: W.innerWidth - 4, clientY: 400, bubbles: true, cancelable: true }));
    assert.ok(!r.holoActif() && !h.classList.contains('px-holo') && h.style.transform === '' && !racine.querySelector('.px-holo-socle'));
    await attendre(5);
  } finally { p.fin(); }
});
