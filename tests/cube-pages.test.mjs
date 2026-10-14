// ▣ (0.68) le cube des pages : trouver les pages d'un ploxion (le contrat, les onglets du DOM, jamais ce qui agit), les photographier,
// tourner, entrer dans une page, revenir comme on était ; ▣ dans la barre du routeur.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trouverPages, photographier, allerPage, creerCubePages, EXCLUS } from '../src/app/cube-pages.js';
import { facesDesPages } from '../src/app/cube-interieur.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { creerDepot } from '../src/marketplace/depot.js';
import { page, attendre } from './aide.mjs';

// un ploxion à onglets, comme bother (data-tab ↔ data-pane, .on)
const ONGLETS = '<div class="t"><button class="on" data-tab="send">Envoyer</button><button data-tab="mine">Les miens</button><button data-tab="x" data-retirer>Retirer</button></div>'
  + '<div class="p on" data-pane="send">page envoyer</div><div class="p" data-pane="mine">page miens</div><button data-go>Envoyer le message</button>';
function brancherOnglets(h) {
  h.querySelectorAll('[data-tab]').forEach(t => { t.onclick = () => { const k = t.getAttribute('data-tab'); h.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('on', x === t)); h.querySelectorAll('[data-pane]').forEach(p => p.classList.toggle('on', p.getAttribute('data-pane') === k)); }; });
}
const actif = (h) => h.querySelector('[data-pane].on').getAttribute('data-pane');

test('▣ facesDesPages : le fond, la suivante à droite, la précédente à gauche, ±2 en haut et en bas, sans doublon', () => {
  assert.deepEqual(facesDesPages(1, 0), { fond: 0 });
  assert.deepEqual(facesDesPages(2, 0), { fond: 0, droite: 1 });
  assert.deepEqual(facesDesPages(3, 0), { fond: 0, droite: 1, gauche: 2 });
  assert.deepEqual(facesDesPages(7, 3), { fond: 3, droite: 4, gauche: 2, plafond: 5, sol: 1 });
  assert.deepEqual(facesDesPages(0, 0), {});
});

test('▣ trouverPages : le contrat, puis les onglets de la liste blanche ; jamais ce qui agit ; certains ploxions jamais feuilletés', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const D = p.w.document, h = D.createElement('div'); D.body.appendChild(h);
    h.innerHTML = ONGLETS;
    let t = trouverPages(h, {}, 'bother');
    assert.equal(t.source, 'dom'); assert.deepEqual(t.pages.map(x => x.nom), ['Envoyer', 'Les miens'], 'ni « Retirer » (data-retirer) ni « Envoyer le message »');
    assert.equal(t.i, 0); assert.equal(t.photo, true);
    h.innerHTML = '<div role="tablist"><button role="tab" aria-controls="a">A</button><button role="tab" aria-controls="b" aria-selected="true">B</button></div>';
    t = trouverPages(h, null, 'x'); assert.equal(t.i, 1); assert.deepEqual(t.pages.map(x => x.nom), ['A', 'B']);
    h.innerHTML = '<div><button data-mode="chrono" class="on">chrono</button><button data-mode="cd">minuteur</button></div>';
    t = trouverPages(h, null, 'minuteur'); assert.equal(t.photo, false, 'changer de mode remet le chrono à zéro : pas de photo toute seule');
    h.innerHTML = '<section data-tab="a">' + 'un long panneau, pas un onglet du tout, '.repeat(3) + '</section><section data-tab="b">' + 'idem '.repeat(20) + '</section>';
    assert.equal(trouverPages(h, null, 'x').source, 'seule', 'des panneaux, pas des onglets');
    h.innerHTML = ONGLETS;
    assert.ok(EXCLUS.has('cape')); assert.equal(trouverPages(h, null, 'cape').source, 'seule', 'la blouse : jamais feuilletée');
    const appels = [];
    const inst = { pages: () => [{ cle: 'v', nom: 'vitrine' }, { cle: 'g', nom: 'grille', actif: true }], allerPage: (k, o) => appels.push([k, o.muet]) };
    t = trouverPages(h, inst, 'mk'); assert.equal(t.source, 'api'); assert.equal(t.i, 1);
    await allerPage(h, inst, t.pages[0], { muet: true }); assert.deepEqual(appels, [['v', true]]);
  } finally { p.fin(); }
});

test('▣ photographier : un clone inerte (sans name, scripts, médias, styles, cachés), les valeurs recopiées', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, h = D.createElement('div'); D.body.appendChild(h);
    h.innerHTML = '<style>.x{}</style><p class="x">bonjour</p><input name="n" value=""><input type="radio" name="r" checked><video src="v.mp4" autoplay></video><div hidden>caché</div><script>window.mal=1</script>';
    h.querySelector('input').value = 'tapé';
    const z = photographier(W, h);
    assert.ok(z.hasAttribute('inert')); assert.match(z.textContent, /bonjour/); assert.doesNotMatch(z.textContent, /caché/);
    assert.equal(z.querySelectorAll('script,style,video,[name]').length, 0); assert.ok(z.querySelector('.ci-media'));
    assert.equal(z.querySelector('input').value, 'tapé');
    D.body.appendChild(z); assert.ok(h.querySelector('input[type=radio]').checked, 'la radio du vrai ploxion reste cochée');
  } finally { p.fin(); }
});

test('▣ le cube : la page au fond, l\'autre à droite (photographiée derrière) ; tourner ; entrer ; ressortir comme on était', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, scene = D.createElement('div'); D.body.appendChild(scene);
    const h = D.createElement('div'); h.className = 'px-hote'; scene.appendChild(h); h.innerHTML = ONGLETS; brancherOnglets(h);
    const sons = [], c = creerCubePages({ W, boxion: p.boxion, vibrer: (e) => sons.push(e) });
    assert.equal(await c.ouvrir({ id: 'bo', hote: h, inst: {}, dans: scene }), 'bo');
    assert.equal(c.ouvert(), 'bo'); await c.salle().pret; await attendre(20); await c.photos();
    const cube = scene.querySelector('.px-cube-pages');
    assert.match(cube.querySelector('.ci-fond').textContent, /Envoyer · 1\/2/);
    assert.match(cube.querySelector('.ci-droite .ci-photo').textContent, /page miens/, 'la page d\'à côté, photographiée');
    assert.ok(!cube.querySelector('.ci-gauche .ci-photo'), 'deux pages : la gauche reste un xer à toi');
    assert.ok(cube.querySelector('.ci-gauche [data-ci-face="gauche"]'));
    assert.ok(sons.includes('fx-cube'));
    // ressortir sans entrer : le ploxion revient sur sa page
    c.fermer(); await attendre(20);
    assert.ok(!scene.querySelector('.px-cube-pages')); assert.equal(actif(h), 'send', 'revenu comme il était');
    // rouvrir : tourner vers la droite, puis entrer
    await c.ouvrir({ id: 'bo', hote: h, inst: {}, dans: scene }); await c.salle().pret; await c.photos();
    assert.ok(c.salle().tourner('droite')); await attendre(460);
    assert.match(scene.querySelector('.ci-fond').textContent, /Les miens · 2\/2/);
    assert.match(scene.querySelector('.ci-fond .ci-photo').textContent, /page miens/);
    assert.ok(c.salle().entrer()); await attendre(420);
    assert.equal(c.ouvert(), null); assert.ok(!scene.querySelector('.px-cube-pages'));
    assert.equal(actif(h), 'mine', 'entré : le vrai ploxion est sur cette page');
    assert.ok(sons.includes('fx-face') && sons.includes('fx-arrivee'));
    // peupler le cube d'un ploxion : gardé pour lui
    await c.ouvrir({ id: 'bo', hote: h, inst: {}, dans: scene }); await c.salle().pret;
    await c.salle().ajouter('texte', 'xer'); await attendre(20);
    assert.equal((await p.boxion.get('cubes', 'bo')).objets[0].ref, 'xer');
    c.fermer();
  } finally { p.fin(); }
});

test('▣ le marketplace tient le contrat : ses vues sont ses pages ; sa recherche revient à la sortie', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { enregistrerMarketplace } = await import('../src/marketplace/marketplace.js');
    const W = p.w, D = W.document, boxion = creerMemoire();
    const http = { async get() { throw new Error('hors ligne'); } };
    enregistrerMarketplace({ W, depot: creerDepot({ boxion, http }) });
    const scene = D.createElement('div'); D.body.appendChild(scene); const h = D.createElement('div'); scene.appendChild(h);
    const inst = W.jOSApps.marketplace.mount(h, { params: { vue: 'grille', q: 'pom' } }); await inst.ready;
    const t = trouverPages(h, inst, 'marketplace');
    assert.equal(t.source, 'api'); assert.equal(t.pages[t.i].cle, 'grille'); assert.ok(t.pages.length >= 5);
    const c = creerCubePages({ W, boxion });
    await c.ouvrir({ id: 'marketplace', hote: h, inst, dans: scene }); await c.salle().pret; await c.photos();
    assert.ok(scene.querySelector('.ci-droite .ci-photo .mk'), 'la vue d\'à côté, photographiée');
    c.fermer(); await attendre(30);
    assert.equal(h.querySelector('[data-q]').value, 'pom', 'sa recherche revient');
    assert.equal(inst.pages().find(x => x.actif).cle, 'grille', 'et sa vue');
    inst.unmount();
  } finally { p.fin(); }
});

test('▣ dans la barre d\'un ploxion : ouvre son cube ; changer d\'app ou un bord le referme ; le geste « cube » existe', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { creerRouteur, ACTIONS_BORDS } = await import('../src/app/routeur.js');
    const W = p.w; W.jOSApps = W.jOSApps || {};
    W.jOSApps.a = { manifest: { id: 'a' }, mount(h) { h.innerHTML = ONGLETS; brancherOnglets(h); return { unmount() {} }; } };
    W.jOSApps.b = { manifest: { id: 'b' }, mount(h) { h.innerHTML = '<p>b</p>'; return { unmount() {} }; } };
    const racine = W.document.createElement('div'); W.document.body.appendChild(racine);
    const r = creerRouteur({ fenetre: W, racine, catalogue: [{ id: 'a', nom: 'A', icone: '◇' }, { id: 'b', nom: 'B', icone: '◇' }] });
    r.brancherCube(creerCubePages({ W, boxion: p.boxion }));
    assert.ok(ACTIONS_BORDS.some(([k]) => k === 'cube'));
    await r.accueil(); await r.ouvrir('a'); await attendre(20);
    racine.querySelector('[data-cube]').click(); await attendre(40);
    assert.equal(r.cubeActif(), 'a'); assert.ok(racine.querySelector('.px-scene .px-cube-pages'));
    r.faire('cube'); assert.equal(r.cubeActif(), null, 'le geste le referme');
    await r.cube(); await attendre(20); assert.equal(r.cubeActif(), 'a');
    await r.ouvrir('b'); assert.equal(r.cubeActif(), null, 'un autre ploxion : le cube se referme');
    assert.ok(!racine.querySelector('.px-cube-pages'));
  } finally { p.fin(); }
});
