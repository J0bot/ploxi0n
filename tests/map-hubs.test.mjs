// ▦ (0.90) la map du xerboxion en carrés : les hubs du labo et les tiens ; les voisins par les portails (et leur retour) ; la balade ;
// créer un hub posé à côté, le retrouver depuis l'autre bout ; le même store que le labo
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assembler, voisins, nouveauHub, creerMap } from '../src/app/map-hubs.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { page, attendre, RACINE } from './aide.mjs';

const LABO = JSON.parse(readFileSync(RACINE + '/tests/donnees/xerkions.labo.json', 'utf8')).items;

test('▦ les voisins : portals[0] droite, [1] gauche, [2] haut, [3] bas ; le retour calculé ; les autres portails', () => {
  const hubs = assembler(LABO, []);
  const v = voisins(hubs, 'xerkion-xerboxion');
  assert.deepEqual([v.droite, v.gauche, v.haut, v.bas], ['xerkion-decouverte', 'xerkion-core', 'xerkion-vie', 'xerkion-connaissance']);
  const perso = nouveauHub({ nom: 'Mes jeux', centre: 'trion', koins: [{ label: 'Jeu', ploxion: 'xp' }], depuis: 'xerkion-vie', cote: 'droite', maintenant: 1e12 });
  assert.match(perso.id, /^xerkion-perso-mes-jeux-/); assert.deepEqual(perso.portals, ['', 'xerkion-vie', '', '']);
  const h2 = assembler(LABO, [perso]);
  assert.equal(voisins(h2, perso.id).gauche, 'xerkion-vie');
  const dv = voisins(h2, 'xerkion-vie');
  assert.ok(dv.droite === perso.id || dv.autres.includes(perso.id) || Object.values(dv).includes(perso.id), 'vu depuis l\'autre bout');
  assert.equal(nouveauHub({ nom: 'x', centre: 'pas-un-glyphe' }).center, 'ion');
});

test('▦ la balade : le hub au centre (ses koins, son glyphe), les voisins aux bords ; glisser ou toucher un voisin y va ; ‹ revient ; un koin ouvre son ploxion', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, boxion = creerMemoire(), ouverts = [];
    const m = creerMap({ W, boxion, charger: async () => LABO, ploxions: () => [{ id: 'xp', nom: 'Jeu' }, { id: 'wiki', nom: 'Wiki' }], ouvrir: (id) => ouverts.push(id) });
    assert.equal(m.ploxion.id, 'map'); assert.ok(W.jOSApps.map);
    const h = W.document.createElement('div'); W.document.body.appendChild(h);
    const v = h; Object.defineProperty(W.HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return 390; } }); Object.defineProperty(W.HTMLElement.prototype, 'clientHeight', { configurable: true, get() { return 700; } });
    const inst = m.mount(h); await attendre(60);
    assert.equal(inst.ici(), 'xerkion-xerboxion');
    const ici = h.querySelector('.px-map-ici'); assert.ok(ici); assert.match(ici.textContent, /Xerboxion/i);
    assert.ok(ici.querySelectorAll('[data-k]').length >= 4, 'ses koins'); assert.ok(ici.querySelector('.px-map-centre svg'), 'son glyphe');
    for (const c of ['droite', 'gauche', 'haut', 'bas']) assert.ok(h.querySelector('.px-map-' + c), c);
    // toucher le voisin de droite
    h.querySelector('.px-map-droite').click(); await attendre(260);
    assert.equal(inst.ici(), 'xerkion-decouverte');
    h.querySelector('[data-map="pas"]').click(); await attendre(60);
    assert.equal(inst.ici(), 'xerkion-xerboxion', '‹ revient sur tes pas');
    // glisser vers la gauche : le voisin de droite vient au centre
    const vue = h.querySelector('[data-map-v]');
    vue.dispatchEvent(new W.PointerEvent('pointerdown', { clientX: 300, clientY: 300, bubbles: true }));
    vue.dispatchEvent(new W.PointerEvent('pointermove', { clientX: 120, clientY: 305, bubbles: true }));
    vue.dispatchEvent(new W.PointerEvent('pointerup', { clientX: 120, clientY: 305, bubbles: true })); await attendre(260);
    assert.equal(inst.ici(), 'xerkion-decouverte');
    // un koin qui est un ploxion : il s'ouvre
    const k = [...h.querySelectorAll('.px-map-ici [data-k]')].find(b => !b.getAttribute('data-k').startsWith('xerkion-'));
    k.click(); assert.deepEqual(ouverts, [k.getAttribute('data-k')]);
    inst.unmount(); assert.equal(h.innerHTML, '');
  } finally { p.fin(); }
});

test('▦ créer un hub à côté : il est gardé dans le store du labo (xerkions-persos), on y arrive, on le modifie, on l\'efface', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, boxion = creerMemoire();
    const sauves = []; W.jOSBoxion = { save: async (ns, key, data) => { sauves.push({ ns, key, n: data.length }); return { ok: true }; } };
    const m = creerMap({ W, boxion, charger: async () => LABO, ploxions: () => [{ id: 'xp', nom: 'Jeu' }, { id: 'clickion', nom: 'Clickion' }] });
    const h = W.document.createElement('div'); W.document.body.appendChild(h);
    const inst = m.mount(h); await attendre(60);
    h.querySelector('[data-map="creer"]').click();
    const f = W.document.querySelector('.px-map-ed'); assert.ok(f);
    f.querySelector('[data-ed-nom]').value = 'Mes jeux';
    f.querySelector('[data-ed-centre="trion"]').click();
    f.querySelector('[data-ed-k="xp"]').checked = true; f.querySelector('[data-ed-k="clickion"]').checked = true;
    f.querySelector('[data-ed="garder"]').click(); await attendre(320);
    const id = inst.ici(); assert.match(id, /^xerkion-perso-mes-jeux-/);
    const store = JSON.parse(W.localStorage.getItem('store:xerkions-persos:items'));
    assert.equal(store.length, 1); assert.equal(store[0].center, 'trion'); assert.deepEqual(store[0].koins.map(k => k.ploxion), ['xp', 'clickion']);
    assert.deepEqual(sauves.at(-1), { ns: 'xerkions-persos', key: 'items', n: 1 }, 'jOSBoxion : le labo le voit en mode connecté');
    assert.ok(h.querySelector('.px-map-ici [data-map="modifier"]'), 'à toi : ✎');
    h.querySelector('.px-map-ici [data-map="modifier"]').click();
    const f2 = W.document.querySelector('.px-map-ed'); f2.querySelector('[data-ed-nom]').value = 'Mes jeux du soir'; f2.querySelector('[data-ed="garder"]').click(); await attendre(40);
    assert.match(h.querySelector('.px-map-ici').textContent, /Mes jeux du soir/);
    h.querySelector('.px-map-ici [data-map="modifier"]').click();
    const f3 = W.document.querySelector('.px-map-ed'); const ef = f3.querySelector('[data-ed="effacer"]'); ef.click(); ef.click(); await attendre(40);
    assert.equal(JSON.parse(W.localStorage.getItem('store:xerkions-persos:items')).length, 0);
    inst.unmount();
  } finally { p.fin(); }
});
