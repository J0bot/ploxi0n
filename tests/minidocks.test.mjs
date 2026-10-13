// ▤ (0.51) LES MINI DOCKS : un ploxion minimisé en devient un ; les publiés (la musique, la blouse…) avec leurs actions ; ▤ la page de
// tous ; ✕ ferme (le ploxion est démonté, le « fermer » de la publiée appelé) ; un ploxion fermé emporte ses mini docks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, attendre } from './aide.mjs';
import { normaliser } from '../src/app/minidocks.js';

function apps(W, ids) {
  W.jOSApps = W.jOSApps || {};
  for (const id of ids) W.jOSApps[id] = { manifest: { id }, mount(h) { h.innerHTML = '<b data-app="' + id + '">' + id + '</b>'; return { unmount() { h.innerHTML = ''; W['__demonte_' + id] = true; } }; } };
  return ids.map(id => ({ id, nom: id.toUpperCase(), icone: id === 'b' ? '♫' : '▣', interne: true }));
}
async function monter(prefs = {}) {
  const { creerRouteur } = await import('../src/app/routeur.js');
  const { creerMiniDocks } = await import('../src/app/minidocks.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w, D = W.document;
  const cat = apps(W, ['a', 'b', 'c']);
  const racine = D.createElement('div'); D.body.appendChild(racine);
  let r = null; const vib = [];
  const md = creerMiniDocks({ W, routeur: () => r, prefs: () => prefs, vibrer: (x) => vib.push(x) });
  W.jOSMiniDock = md.api;
  r = creerRouteur({ fenetre: W, racine, catalogue: cat, boxion: p.boxion, miniDocks: { surVivants: () => md.planifier(), surFermeture: (id) => md.surFermeture(id), page: () => md.ouvrirPage() } });
  return { p, W, D, r, md, vib, racine };
}
const cartes = (D) => [...D.querySelectorAll('.px-md > .px-md-c')].map(c => c.getAttribute('data-md'));

test('normaliser : une entrée de ploxion nettoyée (actions, image sûre, progression bornée)', () => {
  const m = normaliser({ titre: 'x', image: 'javascript:alert(1)', progression: 7, actions: [{ id: 'a', icone: '⏯' }, { nom: 'sans id' }, null] }, 'stremio');
  assert.equal(m.cle, 'stremio'); assert.equal(m.ploxion, 'stremio'); assert.equal(m.image, ''); assert.equal(m.progression, 1);
  assert.deepEqual(m.actions.map(a => a.id), ['a']);
  assert.equal(normaliser(null), null); assert.equal(normaliser({}), null);
});

test('▁ minimiser : le ploxion devient un mini dock au-dessus du dock ; le toucher le reprend ; « en arrière-plan » a disparu', async () => {
  const { p, W, D, r, md } = await monter();
  try {
    await r.ouvrir('a'); r.minimiser(); await attendre(80);
    assert.deepEqual(cartes(D), ['px:a']);
    assert.equal(D.querySelector('.px-arriere'), null, 'la rangée « en arrière-plan » est remplacée');
    assert.match(D.querySelector('.px-md-c b').textContent, /A/);
    assert.match(D.documentElement.style.getPropertyValue('--px-md'), /^\d+px$/);
    D.querySelector('.px-md-c[data-md="px:a"] .px-md-t').click(); await attendre(30);
    assert.equal(r.courant(), 'a', 'toucher = reprendre');
    assert.ok(D.querySelector('[data-app="a"]'), 'toujours monté (pas rechargé)');
    md.dessiner();
    assert.deepEqual(cartes(D), [], 'celui qu\'on regarde n\'est pas dans la pile');
  } finally { p.fin(); }
});

test('une publiée (la musique) : ses actions reviennent, elle passe devant, ✕ appelle « fermer » ; ploxion fermé → ses mini docks partent', async () => {
  const { p, W, D, r, md } = await monter();
  try {
    const faits = []; let ferme = 0;
    await r.ouvrir('a'); r.minimiser(); await attendre(20);
    await r.ouvrir('b'); r.minimiser(); await attendre(20);
    W.jOSMiniDock.publier({ cle: 'musique', ploxion: 'b', titre: 'Keep It Psychedelic', sous: 'GMS', enCours: true, actions: [{ id: 'toggle', icone: '⏸', faire: () => faits.push('toggle') }], fermer: () => { ferme++; } });
    await attendre(80);
    assert.deepEqual(cartes(D), ['musique', 'px:a'], 'ce qui joue d\'abord ; b est fondu dans sa musique');
    D.querySelector('.px-md-c[data-md="musique"] [data-md-a="toggle"]').click();
    assert.deepEqual(faits, ['toggle']);
    // l'action sans « faire » : le bus et surAction
    const bus = []; W.jOSPorts = { emit: (id, port, x) => bus.push([id, port, x]) };
    const recu = []; W.jOSMiniDock.surAction('cape', (a) => recu.push(a));
    W.jOSMiniDock.publier({ cle: 'cape', ploxion: 'c', titre: 'blouse', actions: [{ id: 'eteindre', icone: '⏻' }] });
    md.agir('cape', 'eteindre');
    assert.deepEqual(recu, ['eteindre']); assert.deepEqual(bus[0], ['c', 'minidock', { cle: 'cape', action: 'eteindre' }]);
    // ✕ sur la musique (dans la page) : fermer() appelé, le ploxion b démonté
    md.ouvrirPage(); await attendre(10);
    assert.ok(D.querySelector('.px-md-page'), 'la page de tous les mini docks');
    D.querySelector('.px-md-page [data-md="musique"] [data-md-x]').click(); await attendre(60);
    assert.equal(ferme, 1); assert.ok(W.__demonte_b, 'le droit au silence'); assert.ok(!r.vivants().includes('b'));
    // le ploxion a ferme : un mini dock publié pour lui part avec lui
    W.jOSMiniDock.publier({ cle: 'a-info', ploxion: 'a', titre: 'info de a' });
    r.fermerPloxion('a'); await attendre(60);
    assert.ok(!W.jOSMiniDock.liste().some(m => m.cle === 'a-info' || m.cle === 'px:a'));
  } finally { p.fin(); }
});

test('au plus N au-dessus du dock, puis « ▤ +N » ; ⧉ ouvre la page ; les endormis y sont, ✕ les oublie ; « tout fermer »', async () => {
  const { p, W, D, r, md } = await monter({ miniDocks: 1 });
  try {
    await r.ouvrir('a'); r.minimiser(); await attendre(10);
    await r.ouvrir('b'); r.minimiser(); await attendre(80);
    assert.equal(cartes(D).length, 1);
    assert.match(D.querySelector('.px-md-tous').textContent, /\+1/); assert.ok(D.querySelector('.px-md-tous svg.px-g'), '(0.54) le glyphe, plus le ▤');
    await r.ouvrir('c'); await attendre(10);
    await r.restaurer({ vivants: [{ id: 'a' }, { id: 'b' }, { id: 'c' }], courant: null }, { devant: false });
    // (restaurer ne touche pas aux vivants : il ajoute les endormis absents)
    r.faire('basculer'); await attendre(30);
    const page = D.querySelector('.px-md-page');
    assert.ok(page, '⧉ / « basculer » = la page des mini docks');
    D.querySelector('[data-md-tout]').click(); await attendre(60);
    assert.equal(D.querySelector('.px-md-page'), null);
    assert.deepEqual(r.vivants(), [], 'tout fermé');
  } finally { p.fin(); }
});

test('✥ (0.54) glisser-déposer : une tuile soulevée se range ailleurs ; lâchée sur un dossier, elle y entre', async () => {
  const { creerRouteur } = await import('../src/app/routeur.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w, D = W.document;
  try {
    W.jOSApps = W.jOSApps || {}; for (const id of ['a', 'b', 'c']) W.jOSApps[id] = { mount() { return {}; } };
    await p.boxion.put('reglages', 'accueil', { dossiers: [{ nom: 'Outils', ids: ['d'] }], pages: [] });
    const racine = D.createElement('div'); D.body.appendChild(racine);
    const r = creerRouteur({ fenetre: W, racine, boxion: p.boxion, catalogue: ['a', 'b', 'c', 'd'].map(id => ({ id, nom: id.toUpperCase() })) });
    await r.accueil();
    const ordre = () => [...racine.querySelectorAll('.px-page:not([data-special]) .px-tuile[data-id]')].map(b => b.getAttribute('data-id'));   // (0.61) la bibliothèque les montre toutes, à part
    assert.deepEqual(ordre(), ['a', 'b', 'c']);
    const ev = (n, t, type, x) => n.dispatchEvent(new W.MouseEvent(type, { bubbles: true, clientX: x, clientY: 10 }));
    // jsdom n'a pas de mise en page : elementFromPoint dit où est le doigt
    let sous = null; D.elementFromPoint = () => sous;
    const a = racine.querySelector('[data-id="a"]'), c = racine.querySelector('[data-id="c"]');
    ev(a, a, 'pointerdown', 5); await attendre(480);
    assert.ok(racine.classList.contains('px-tri'), 'soulevée : les autres tremblent');
    sous = c; ev(racine, null, 'pointermove', 60); ev(racine, null, 'pointermove', 70);   // c.getBoundingClientRect() = 0 → après c
    ev(racine, null, 'pointerup', 70); await attendre(40);
    assert.deepEqual(ordre(), ['b', 'c', 'a'], 'rangée après c, et gardée');
    assert.deepEqual((await p.boxion.get('reglages', 'accueil')).ordre, ['b', 'c', 'a']);
    // sur le dossier
    const b = racine.querySelector('[data-id="b"]'); ev(b, b, 'pointerdown', 5); await attendre(480);
    sous = racine.querySelector('.px-dossier'); ev(racine, null, 'pointermove', 60); ev(racine, null, 'pointerup', 60); await attendre(40);
    assert.deepEqual((await p.boxion.get('reglages', 'accueil')).dossiers[0].ids.sort(), ['b', 'd']);
  } finally { p.fin(); }
});
