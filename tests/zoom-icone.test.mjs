// 🔍 (0.99.48) ouvrir depuis l'icône, refermer dans l'icône (comme iOS) : la géométrie, et le routeur qui s'en sert
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cleIcone, rectVisible, carreMilieu, creerZoomIcone } from '../src/app/zoom-icone.js';

const lire = (t) => { const m = t.match(/translate\(([-\d.]+)px,([-\d.]+)px\) scale\(([\d.]+)\)/); return { tx: +m[1], ty: +m[2], s: +m[3] }; };

test('🔍 le carré découpé au milieu de l\'écran, mis à l\'échelle, tombe pile sur l\'icône', () => {
  const L = 390, H = 844, r = { x: 40, y: 500, width: 60, height: 60 };
  const k = cleIcone(r, L, H), { tx, ty, s } = lire(k.transform);
  assert.ok(Math.abs(s - 60 / 390) < 1e-4, 'une échelle uniforme : le contenu ne se déforme pas');
  const haut = (H - L) / 2;   // le haut du carré découpé, dans le hôte
  assert.ok(Math.abs(tx - 40) < 0.01 && Math.abs(ty + haut * s - 500) < 0.01, 'son coin = celui de l\'icône');
  assert.ok(Math.abs(tx + L * s - 100) < 0.01 && Math.abs(ty + (haut + L) * s - 560) < 0.01, 'l\'autre coin aussi');
  assert.match(k.clipPath, /^inset\(227\.0px 0px 227\.0px 0px round 88px\)$/, 'le carré, aux coins d\'icône d\'iOS');
  // un hôte qui commence sous la barre (oy = 56) : la même icône, le même endroit
  const k2 = lire(cleIcone(r, L, H - 56, 0, 56).transform); assert.ok(Math.abs(k2.ty + 56 + ((H - 56 - L) / 2) * k2.s - 500) < 0.01);
});

test('🔍 une icône hors de l\'écran ou vide : pas de zoom à l\'ouverture ; au retour, le milieu ; le mode calme : rien', async () => {
  assert.equal(rectVisible({ x: 10, y: 900, width: 60, height: 60 }, 390, 844), null);
  assert.equal(rectVisible({ x: 10, y: 10, width: 0, height: 0 }, 390, 844), null);
  const m = carreMilieu(390, 844); assert.equal(m.x, 165); assert.ok(Math.abs(m.y - 442.64) < 1e-9); assert.equal(m.width, 60);
  const anims = []; const el = { style: {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 390, height: 844 }), animate: (k, o) => { const a = { k, o, cancel() {}, onfinish: null }; anims.push(a); setTimeout(() => a.onfinish && a.onfinish(), 5); return a; } };
  const Z = creerZoomIcone({ W: { innerWidth: 390, innerHeight: 844, setTimeout } });
  assert.equal(Z.ouvrir(el, { x: 0, y: 2000, width: 60, height: 60 }), null, 'l\'icône n\'est pas à l\'écran : l\'ouverture normale');
  assert.ok(Z.ouvrir(el, { x: 40, y: 500, width: 60, height: 60 })); assert.equal(anims[0].k[0].opacity, 0.55);
  assert.equal(await Z.fermer(el, null), true); assert.equal(anims[1].k[1].opacity, 0, 'sans icône : il s\'efface au milieu');
  const calme = creerZoomIcone({ W: { innerWidth: 390, innerHeight: 844 }, calme: () => true });
  assert.equal(calme.ouvrir(el, { x: 40, y: 500, width: 60, height: 60 }), null); assert.equal(await calme.fermer(el, null), false);
});

test('🔍 le routeur : l\'icône touchée est gardée ; ouvrir en sort ; minimiser, ‹ vers l\'accueil et l\'accueil y rentrent', () => {
  const r = readFileSync(new URL('../src/app/routeur.js', import.meta.url), 'utf8');
  assert.ok(r.includes("origine = { id: t.getAttribute('data-id'), rect: ic.getBoundingClientRect(), t: Date.now() }"));
  assert.ok(r.includes('if (zoomIcone.ouvrir(v.hote, r)) v.hote.classList.add(\'px-sans-entree\')'));
  assert.ok(r.includes('return versAccueil(v, () => cacher(v)); }   // 🔍 (0.99.48) dans son icône, il reste vivant'));
  assert.ok(r.includes('return versAccueil(v, () => tuer(v.id)); }'));
  assert.ok(r.includes("if (action === 'accueil') { const v = courant; courant = null; pile = []; vibrer('bord'); return versAccueil(v, () => cacher(v)); }"));
  assert.ok(r.includes('if (courant !== v) fin();'), 'rouvert pendant qu\'il se refermait : on ne le cache pas');
});
