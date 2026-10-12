// La session reprise après une fermeture ou un plantage, les tsoins natifs, notre barre du haut (jsdom, boxion_local en mémoire).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, attendre } from './aide.mjs';

function apps(W, ids) {
  W.jOSApps = W.jOSApps || {};
  for (const id of ids) W.jOSApps[id] = { manifest: { id }, mount(h, ctx) { h.innerHTML = '<b data-app="' + id + '">' + id + ' ' + JSON.stringify(ctx.params || null) + '</b>'; return { unmount() { h.innerHTML = ''; } }; } };
  return ids.map(id => ({ id, nom: id.toUpperCase(), icone: '▣', interne: true }));
}

test('la session : notée à chaque changement ; reprise → le ploxion de devant rouvert (avec ses paramètres), les autres endormis 💤', async () => {
  const { creerRouteur } = await import('../src/app/routeur.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w;
  try {
    const cat = apps(W, ['a', 'b', 'c']);
    let sess = null;
    const racine = W.document.createElement('div'); W.document.body.appendChild(racine);
    const r = creerRouteur({ fenetre: W, racine, catalogue: cat, boxion: p.boxion, surSession: (s) => { sess = s; } });
    await r.ouvrir('a'); await r.ouvrir('b', { onglet: 'x' }); r.minimiser(); await r.ouvrir('c');
    await attendre(320);
    assert.deepEqual(sess.vivants.map(v => v.id), ['a', 'b', 'c']);
    assert.equal(sess.courant, 'c');
    assert.deepEqual(sess.vivants.find(v => v.id === 'b').params, { onglet: 'x' });
    // l'app est tuée : un nouveau routeur, la même session
    const racine2 = W.document.createElement('div'); W.document.body.appendChild(racine2);
    const r2 = creerRouteur({ fenetre: W, racine: racine2, catalogue: cat, boxion: p.boxion });
    await r2.restaurer({ ...sess, courant: 'b' });
    assert.equal(r2.courant(), 'b');
    assert.match(racine2.querySelector('[data-app="b"]').textContent, /onglet/, 'les paramètres reviennent');
    assert.deepEqual(r2.vivants(), ['b'], 'un seul monté');
    assert.deepEqual(r2.endormis().sort(), ['a', 'c']);
    assert.match(racine2.querySelector('[data-basculer]').textContent, /3/, '⧉ compte les endormis');
    // un bord → l'endormi suivant se réveille
    r2.aCote(1); await attendre(30);
    assert.ok(r2.vivants().includes('a') || r2.vivants().includes('c'));
    assert.equal(r2.endormis().length, 1);
    // après un plantage au lancement : rien devant, tout dort
    const racine3 = W.document.createElement('div'); W.document.body.appendChild(racine3);
    const r3 = creerRouteur({ fenetre: W, racine: racine3, catalogue: cat, boxion: p.boxion });
    await r3.restaurer(sess, { devant: false });
    assert.equal(r3.courant(), null); assert.equal(r3.endormis().length, 3);
    // ⧉ : les endormis listés, « oublier »
    r3.faire('basculer');
    const f = racine3.querySelector('.px-voile'); assert.equal(f.querySelectorAll('.px-endormi').length, 3);
    f.querySelector('[data-oublier]').click(); assert.equal(r3.endormis().length, 0);
  } finally { p.fin(); }
});

test('⧗ les tsoins natifs : composer (genre, ploxion), enregistrer, le journal, au boxion quand connecté', async () => {
  const { creerTsoinNatif } = await import('../src/natif/tsoin-natif.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w;
  try {
    const envoyes = [], vib = [];
    const t = creerTsoinNatif({ W, boxion: p.boxion, vibrer: (x) => vib.push(x), contexte: () => 'pomo', distant: () => ({ set: async (ns, k, d) => envoyes.push([ns, k, d]) }) });
    await assert.rejects(() => t.enregistrer({ texte: '  ' }), /vide/);
    const ouvert = t.ouvrir({ texte: 'premier café' });
    const f = W.document.querySelector('.px-tsoin'); assert.ok(f);
    f.querySelector('[data-genre="humeur"]').click();
    assert.ok(f.querySelector('[data-genre="humeur"]').classList.contains('on'));
    assert.equal(f.querySelector('[data-texte]').value, 'premier café', 'le texte survit au repeint');
    f.querySelector('[data-j="ok"]').click();
    const e = await ouvert;
    assert.equal(e.genre, 'humeur'); assert.equal(e.ploxion, 'pomo'); assert.equal(e.source, 'natif');
    assert.equal(envoyes[0][0], 'tsoins-natifs'); assert.equal(envoyes[0][2].d, 'premier café');
    assert.ok(vib.includes('succes'));
    const l = await t.liste(); assert.equal(l.length, 1);
    const h = W.document.createElement('div'); W.document.body.appendChild(h);
    W.jOSApps['journal-tsoins'].mount(h); await attendre(30);
    assert.match(h.textContent, /premier café/); assert.match(h.textContent, /journal des tsoins · 1/);
  } finally { p.fin(); }
});

test('▔ la barre du haut : visible seulement en plein écran, composée gauche/droite, gardée', async () => {
  const { creerBarreHaut, HAUT_DEFAUT } = await import('../src/app/barre-haut.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w;
  try {
    let plein = false;
    await p.boxion.append('tsoins', { kind: 'tsoin', d: 'x' });
    const b = creerBarreHaut({ W, boxion: p.boxion, actif: () => plein, courant: () => 'Pomodoro', ouverts: () => 2 });
    b.installer(W.document.body); await b.pret; await b.mesurer();
    const el = W.document.querySelector('.px-haut');
    assert.equal(el.hidden, true, 'caché hors plein écran');
    plein = true; await b.mesurer();
    assert.equal(el.hidden, false);
    assert.ok(W.document.documentElement.classList.contains('px-haut-on'));
    assert.match(el.querySelector('.g').textContent, /Pomodoro/);
    assert.match(el.querySelector('.d').textContent, /⧗1/, 'les tsoins du jour');
    await b.regler({ gauche: ['date'], droite: ['ouverts', 'inconnu', 'ouverts'] });
    assert.deepEqual(await p.boxion.get('reglages', 'barre-haut'), { gauche: ['date'], droite: ['ouverts'] });
    assert.match(el.querySelector('.d').textContent, /⧉2/);
    b.composer();
    const f = W.document.querySelector('.px-voile'); f.querySelector('[data-k="heure"][data-p="d"]').click(); await attendre(20);
    assert.deepEqual(b.config().droite, ['ouverts', 'heure']);
    f.querySelector('[data-defaut]').click(); await attendre(20);
    assert.deepEqual(b.config(), HAUT_DEFAUT);
  } finally { p.fin(); }
});

test('✦ les nouveautés : rien au premier lancement, ce qui a changé après une mise à jour, une seule fois', async () => {
  const { creerNouveautes } = await import('../src/app/nouveautes.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w;
  try {
    const L = [{ v: '0.32.0', titre: 'futur', points: ['pas encore'] }, { v: '0.31.0', titre: 'c', points: ['trois'] }, { v: '0.30.0', titre: 'b', points: ['deux'] }, { v: '0.29.0', titre: 'a', points: ['un'] }];
    const n0 = creerNouveautes({ W, boxion: p.boxion, version: '0.29.0', liste: L });
    assert.equal(await n0.auDemarrage({ premierLancement: true }), null, 'premier lancement : le tuto, pas le changelog');
    assert.equal(await p.boxion.get('reglages', 'version-vue'), '0.29.0');
    // deux versions plus tard : 0.30 et 0.31, pas 0.29 ni la future 0.32
    const n1 = creerNouveautes({ W, boxion: p.boxion, version: '0.31.0', liste: L });
    const f = await n1.auDemarrage();
    assert.ok(f); assert.match(f.textContent, /trois/); assert.match(f.textContent, /deux/); assert.doesNotMatch(f.textContent, /\bun\b|pas encore/);
    assert.ok(f.textContent.indexOf('trois') < f.textContent.indexOf('deux'), 'la plus récente en haut');
    f.querySelector('[data-nv]').click(); assert.equal(W.document.querySelector('.px-nouveautes'), null);
    assert.equal(await creerNouveautes({ W, boxion: p.boxion, version: '0.31.0', liste: L }).auDemarrage(), null, 'une seule fois');
    // une installation d'avant la feuille (rien de noté, tuto déjà vu) : seulement la version installée
    await p.boxion.del('reglages', 'version-vue');
    const g = await creerNouveautes({ W, boxion: p.boxion, version: '0.31.0', liste: L }).auDemarrage();
    assert.match(g.textContent, /trois/); assert.doesNotMatch(g.textContent, /deux/);
    g.remove();
    const t = creerNouveautes({ W, boxion: p.boxion, version: '0.31.0', liste: L }).tout();
    assert.equal(t.querySelectorAll('section').length, 3, 'l\'historique, sans le futur');
  } finally { p.fin(); }
});
