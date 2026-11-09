// ▣ (0.63) les états d'un ploxion (RS-7 : « plein écran, normal, pip, frame comme sur wayland ; en bas à gauche on cycle ») et les bords
// remappés (haut gauche : le tuto ; bas gauche : l'état ; bas droite : accueil / minimiser ; les deux : portion).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, attendre } from './aide.mjs';

async function monter(p, ids, o = {}) {
  const { creerRouteur } = await import('../src/app/routeur.js');
  const W = p.w; W.jOSApps = W.jOSApps || {};
  for (const id of ids) W.jOSApps[id] = { manifest: { id }, mount(h) { h.innerHTML = '<p>' + id + '</p>'; return { unmount() {} }; } };
  const racine = W.document.createElement('div'); W.document.body.appendChild(racine);
  const r = creerRouteur({ fenetre: W, racine, catalogue: ids.map(id => ({ id, nom: id.toUpperCase(), icone: '◇' })), ...o });
  await r.accueil();
  for (const id of ids) await r.ouvrir(id);
  return { r, racine, W };
}
const hote = (racine, id) => racine.querySelector('.px-hote[data-ploxion="' + id + '"]');

test('▣ normal → plein → pip → cadre → normal, au bord bas gauche', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, racine, W } = await monter(p, ['a', 'b']);
    await r.ouvrir('a');
    assert.equal(r.GESTES_DEFAUT['g-bas'], 'etat'); assert.equal(r.GESTES_DEFAUT['g-haut'], 'tuto'); assert.equal(r.GESTES_DEFAUT['deux-milieu'], 'xers');
    assert.deepEqual(r.GESTES_DEFAUT, { 'g-haut': 'tuto', 'g-milieu': 'precedente', 'g-bas': 'etat', 'd-haut': 'chercher', 'd-milieu': 'suivante', 'd-bas': 'accueil', 'deux-haut': 'portion', 'deux-milieu': 'xers', 'deux-bas': 'carte' }, 'les réglages de RS-7 (17.10)');
    assert.equal(r.etat(), 'plein');
    assert.ok(racine.classList.contains('px-plein-ploxion') && r.plein(), 'plein écran : la barre s\'efface');
    assert.equal(r.etat(), 'pip');
    await attendre(30);
    assert.deepEqual(r.flottant(), { id: 'a', mode: 'pip' });
    assert.equal(r.courant(), null, 'l\'accueil dessous');
    const h = hote(racine, 'a');
    assert.ok(!h.hidden && h.classList.contains('px-pip') && h.style.getPropertyValue('--fs') === '0.34', 'une vraie miniature, vivante');
    assert.ok(racine.querySelector('.px-pip-poigne'), 'la poignée');
    assert.ok(!racine.classList.contains('px-plein-ploxion'));
    assert.equal(r.etat(), 'cadre');
    assert.deepEqual(r.flottant(), { id: 'a', mode: 'cadre' });
    assert.ok(racine.querySelector('.px-cadre-barre') && !racine.querySelector('.px-pip-poigne'), 'la barre du cadre');
    assert.equal(r.etat(), 'normal');
    assert.equal(r.courant(), 'a'); assert.equal(r.flottant(), null);
    assert.ok(!h.classList.contains('px-flottant') && h.style.getPropertyValue('--fs') === '', 'rendu tel quel');
    void W;
  } finally { p.fin(); }
});

test('▣ le pip reste par-dessus un autre ploxion ; le toucher le ramène ; fermé, il disparaît proprement', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, racine, W } = await monter(p, ['a', 'b', 'c']);
    await r.ouvrir('a'); r.etat(); r.etat();   // plein, puis pip
    await r.ouvrir('b');
    assert.equal(r.courant(), 'b');
    assert.ok(!hote(racine, 'a').hidden, 'a flotte toujours au-dessus de b');
    const pg = racine.querySelector('.px-pip-poigne');
    pg.dispatchEvent(new W.MouseEvent('pointerdown', { clientX: 300, clientY: 600, bubbles: true }));
    pg.dispatchEvent(new W.MouseEvent('pointerup', { clientX: 300, clientY: 600, bubbles: true }));
    await attendre(380);
    assert.equal(r.courant(), 'a', 'touché : il revient en grand');
    assert.ok(hote(racine, 'b').hidden && r.flottant() === null);
    r.etat(); r.etat();   // de nouveau en pip
    r.fermerPloxion('a');
    assert.equal(r.flottant(), null); assert.ok(!racine.querySelector('.px-pip-poigne'));
  } finally { p.fin(); }
});

test('▣ le cadre : ✕ ferme le ploxion ; ⤢ le remet en grand', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, racine } = await monter(p, ['a', 'b']);
    await r.ouvrir('a'); r.etat(); r.etat(); r.etat();
    assert.deepEqual(r.flottant(), { id: 'a', mode: 'cadre' });
    racine.querySelector('[data-cadre="grand"]').click();
    assert.equal(r.courant(), 'a');
    r.etat(); r.etat(); r.etat();
    racine.querySelector('[data-cadre="fermer"]').click();
    assert.ok(!r.vivants().includes('a') && r.flottant() === null);
  } finally { p.fin(); }
});

test('bord bas droit à l\'accueil : rien à minimiser, un refus ; haut gauche : le tuto du contexte', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const sons = [], tutos = [];
    const { r } = await monter(p, ['a'], { vibrer: (ev) => sons.push(ev), surTuto: (id) => tutos.push(id) });
    await r.accueil(); sons.length = 0;
    r.faire('minimiser'); assert.deepEqual(sons, ['fx-refus']);
    r.faire('tuto'); await r.ouvrir('a'); r.faire('tuto');
    assert.deepEqual(tutos, [null, 'a'], 'l\'accueil, puis le ploxion');
  } finally { p.fin(); }
});

test('◎ le HUD de tuto : les neuf zones telles que réglées, tenir (▶ démos), et dans un ploxion son tuto, ou ＋ pour l\'écrire', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const { r, racine, W } = await monter(p, ['a']);
    const { creerTutoHud } = await import('../src/app/tuto-hud.js');
    const store = new Map(), joues = [], notes = [];
    const boxion = { get: async (c, k) => store.get(c + '/' + k) || null, put: async (c, k, v) => { store.set(c + '/' + k, v); } };
    const hud = creerTutoHud({ W, boxion, routeur: () => r, demo: { jouer: (n) => joues.push(n) }, tsoin: async (x) => notes.push(x) });
    let f = await hud.ouvrir(null);
    assert.match(f.textContent, /◎ le tuto ici/, 'haut gauche, tel que réglé');
    assert.match(f.textContent, /▣ l'état/, 'bas gauche');
    assert.ok(f.querySelector('[data-th-demo="cube"]') && f.querySelector('[data-th-demo="glisser"]'), 'les démos');
    f.querySelector('[data-th-demo="cube"]').click(); await attendre(300);
    assert.deepEqual(joues, ['cube']); assert.ok(!hud.ouverte());
    f = await hud.ouvrir('a');
    assert.match(f.querySelector('.px-th-ici').textContent, /Pas encore de tuto/);
    f.querySelector('[data-th="ecrire"]').click();
    f.querySelector('[data-th-texte]').value = '1. ouvre a\n2. touche le bouton';
    f.querySelector('[data-th-garder]').click(); await attendre(30);
    assert.deepEqual(store.get('tutos/a').etapes, ['ouvre a', 'touche le bouton']);
    assert.match(notes[0].texte, /^tuto · A/, 'noté comme un tsoin');
    const f2 = W.document.querySelector('.px-tuto-hud');
    assert.equal(f2.querySelectorAll('.px-th-ici li').length, 2, 'le tien s\'affiche');
    void racine;
  } finally { p.fin(); }
});

test('(0.69) le sommeil des cachés : caché depuis plus de 5 min, il s\'endort ; pas s\'il joue du son ; jamais si « jamais »', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    let prefs = {}; const sons = new Set();
    const { r, racine } = await monter(p, ['a', 'b', 'c'], { prefs: () => prefs, sonDe: (id) => sons.has(id) });
    await r.ouvrir('c');
    const t = Date.now() + 6 * 60000;
    sons.add('b');
    assert.equal(r.endormirVieux(t), 1, 'a dort ; b fait du son : il reste');
    assert.deepEqual(r.vivants().sort(), ['b', 'c']); assert.ok(r.endormis().includes('a'));
    assert.ok(!racine.querySelector('.px-hote[data-ploxion="a"]'), 'démonté : il ne coûte plus rien');
    sons.delete('b'); prefs = { sommeil: 0 };
    assert.equal(r.endormirVieux(t), 0, 'jamais');
    prefs = {}; assert.equal(r.endormirVieux(Date.now()), 0, 'caché depuis moins de 5 min');
    assert.equal(r.endormirVieux(t), 1); assert.equal(r.courant(), 'c', 'celui qu\'on regarde reste');
  } finally { p.fin(); }
});
