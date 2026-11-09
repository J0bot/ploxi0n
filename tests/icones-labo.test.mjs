// ⬡ (0.82) les icônes du labo (/px/icones.json) : les glyphes dessinés NETTOYÉS puis ajoutés, les retouches du labo et les tiennes,
// gardées hors ligne ; rien ne casse si le labo ne répond pas
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerIconesLabo, nettoyerCorps } from '../src/app/icones-labo.js';
import { glyphe } from '../src/app/glyphes.js';
import { specXerkion } from '../src/app/xerkion-icone.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { page } from './aide.mjs';

test('⬡ un glyphe dessiné : seulement ses formes et leur géométrie (ni script, ni lien, ni on…=, ni style)', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w;
    assert.equal(nettoyerCorps('<circle cx="50" cy="50" r="30" class="f"/><path d="M10 10L90 90" class="p x"/>', W), '<circle cx="50" cy="50" r="30" class="f"/><path d="M10 10L90 90" class="p"/>');
    const sale = nettoyerCorps('<script>alert(1)</script><circle cx="50" cy="50" r="9" onload="alert(2)" style="fill:url(javascript:x)"/><a href="javascript:alert(3)"><rect x="1" y="1" width="9" height="9"/></a><image href="https://x/y.png"/><g transform="rotate(45 50 50)"><line x1="0" y1="0" x2="1" y2="1"/><foreignObject/></g>', W);
    assert.doesNotMatch(sale, /script|alert|onload|style|href|image|foreignObject|<a/i);
    assert.match(sale, /<circle cx="50" cy="50" r="9"\/>/); assert.match(sale, /<g transform="rotate\(45 50 50\)"><line/);
    assert.equal(nettoyerCorps('<circle cx="50" cy="50" r="9"', W), '', 'mal formé : rien');
    assert.equal(nettoyerCorps('<text x="1">salut</text>', W), '');
  } finally { p.fin(); }
});

test('⬡ /px/icones.json : les glyphes dessinés rejoignent ceux de l\'app ; tous et mien ; gardé hors ligne', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, boxion = creerMemoire(); let enLigne = true, demandes = 0;
    const json = { ok: true, tous: { wiki: { pal: 3, glyphe: 'livre-rs7' } }, mien: { social: { centre: 'kion' } }, glyphes: [{ nom: 'livre-rs7', corps: '<rect x="20" y="20" width="60" height="60"/><script>alert(1)</script>' }, { nom: '../x', corps: '<circle cx="1" cy="1" r="1"/>' }], avis: {}, admin: false };
    const http = { get: async (u) => { demandes++; assert.match(u, /\/px\/icones\.json$/); return { status: 200, texte: JSON.stringify(json) }; } };
    const ic = creerIconesLabo({ W, http, boxion, enLigne: () => enLigne });
    assert.equal(await ic.recharger(), true);
    assert.equal(await ic.recharger(), false, 'rien de neuf : pas de redessin');
    assert.match(glyphe('livre-rs7'), /<rect x="20" y="20" width="60" height="60"\/>/); assert.doesNotMatch(glyphe('livre-rs7'), /script/);
    assert.deepEqual(ic.glyphes(), ['livre-rs7'], 'un nom invalide est refusé');
    assert.deepEqual(ic.tous('wiki'), { pal: 3, glyphe: 'livre-rs7' }); assert.deepEqual(ic.mien('social'), { centre: 'kion' }); assert.equal(ic.tous('autre'), null);
    const s = specXerkion({ id: 'wiki', nom: 'Wiki', xerkion: ic.tous('wiki') });
    assert.equal(s.glyphe, 'livre-rs7', 'l\'icône du wiki prend le glyphe dessiné au labo'); assert.equal(s.pal, 3);
    // hors ligne, une autre fois : le cache
    enLigne = false;
    const ic2 = creerIconesLabo({ W, http, boxion, enLigne: () => enLigne }); await ic2.pret;
    assert.deepEqual(ic2.tous('wiki'), { pal: 3, glyphe: 'livre-rs7' }); assert.equal(await ic2.recharger(), false); assert.equal(demandes, 2);
    // le labo en panne : rien ne casse
    enLigne = true;
    const ic3 = creerIconesLabo({ W, http: { get: async () => { throw new Error('503'); } }, boxion }); assert.equal(await ic3.recharger(), false);
  } finally { p.fin(); }
});
