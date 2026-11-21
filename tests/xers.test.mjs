// § (0.77) mes xers : capturer l'interface, basculer (l'actif gardé d'abord), un modèle, partager (le lien compressé), recevoir (nettoyé)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerXers, encoderXer, decoderXer, nettoyerXer, nettoyerPrefs, lienXer } from '../src/app/xers.js';
import { lienRecu } from '../src/app/liens-publics.js';
import { PREFS_DEFAUT } from '../src/app/prefs.js';
import { page, attendre } from './aide.mjs';

function monde(W) {
  const store = new Map(), k = (a, b) => a + '/' + b;
  const boxion = { get: async (a, b) => (store.has(k(a, b)) ? JSON.parse(store.get(k(a, b))) : null), put: async (a, b, v) => { store.set(k(a, b), JSON.stringify(v)); }, del: async (a, b) => { store.delete(k(a, b)); } };
  let p = { ...PREFS_DEFAUT, mode: 'chill-tekk', haptique: true }, h = { elements: [{ k: 'compte', on: true }], epingles: ['social'] }, b = { gauche: ['heure'], droite: ['batterie'] }, f = { type: 'motif', motif: 'grille', sombre: 45, flou: 0, partout: false }, img = null;
  let acc = { pages: [{ nom: 'jeux', ids: ['xp'] }], dossiers: [] }, accueils = 0;
  const prefs = { lire: () => ({ ...p }), regler: async (x) => { p = { ...p, ...x }; return p; } };
  const routeur = { docAccueil: () => JSON.parse(JSON.stringify(acc)), chargerAccueil: (d) => { acc = d; }, accueil: () => { accueils++; }, connait: (id) => ['social', 'xp', 'controleur'].includes(id),
    catalogue: () => [{ id: 'social' }, { id: 'xp' }, { id: 'controleur', interne: true }] };
  const fond = { reglage: () => ({ ...f }), regler: async (x) => { f = { ...f, ...x }; return f; }, image: () => img, poserImage: async (u) => { img = u; } };
  const x = creerXers({ W, boxion, prefs, defautPrefs: PREFS_DEFAUT, routeur: () => routeur, fond, hud: { config: () => h, regler: async (c) => { h = c; } }, barre: { config: () => b, regler: async (c) => { b = c; } } });
  return { x, store, etat: () => ({ p, h, b, f, acc, img, accueils }), regler: (o) => { if (o.p) p = { ...p, ...o.p }; if (o.acc) acc = o.acc; if (o.f) f = { ...f, ...o.f }; if ('img' in o) img = o.img; } };
}

test('§ le premier xer, un modèle, basculer : l\'actif est gardé tel qu\'il était, puis l\'autre posé', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const m = monde(p.w);
    assert.deepEqual(await m.x.liste(), [{ id: 'x1', nom: 'mon xer', icone: '◇', actif: true }]);
    const bot = await m.x.nouveau({ modele: 'xerbot' });   // (0.99.67) l'ancien nom du modèle mène au mode xeroction
    assert.equal(m.etat().p.mode, 'xeroction', 'le modèle posé');
    assert.equal(m.etat().h.epingles[0], 'controleur', 'le contrôleur épinglé');
    m.regler({ acc: { pages: [{ nom: 'robots', ids: ['controleur'] }], dossiers: [] }, p: { dock: false } });   // on le change
    await m.x.basculer('x1');
    assert.equal(m.etat().p.mode, 'chill-tekk'); assert.equal(m.etat().p.dock, true); assert.deepEqual(m.etat().acc.pages[0].ids, ['xp']); assert.deepEqual(m.etat().h.epingles, ['social']);
    await m.x.basculer(bot.id);
    assert.equal(m.etat().p.mode, 'xeroction'); assert.equal(m.etat().p.dock, false, 'ses changements gardés'); assert.equal(m.etat().acc.pages[0].nom, 'robots');
    assert.equal(m.etat().p.haptique, true, 'un réglage de l\'iPhone ne bouge jamais');
    assert.equal(await m.x.retirer(bot.id), false, 'pas l\'actif');
    assert.ok(m.etat().accueils >= 3);
  } finally { p.fin(); }
});

test('🖼 la photo du fond suit son xer, et ne part jamais dans un lien', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const m = monde(p.w);
    m.regler({ f: { type: 'photo' }, img: 'data:image/jpeg;base64,AAAA' });
    await m.x.charger(); const b = await m.x.nouveau({ modele: 'epure' });
    m.regler({ f: { type: 'motif' }, img: null });
    await m.x.basculer('x1');
    assert.equal(m.etat().f.type, 'photo'); assert.equal(m.etat().img, 'data:image/jpeg;base64,AAAA');
    const code = await encoderXer((await m.x.actif()));
    const x = await decoderXer(code);
    assert.equal(x.fond.type, 'motif'); assert.ok(!JSON.stringify(x).includes('AAAA')); assert.equal(x.id, undefined);
    assert.ok(b.id);
  } finally { p.fin(); }
});

test('↗ partager un xer : un lien universel court, qui revient dans mes-xers', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const m = monde(p.w);
    const { lien } = await m.x.partager('x1');
    assert.match(lien, /^https:\/\/labo\.j0bot\.ch\/app\/ouvrir\/mes-xers\?app=1&x=z[A-Za-z0-9_-]+$/);
    assert.ok(lien.length < 1200, 'il tient dans un QR : ' + lien.length);
    const r = lienRecu(lien);
    assert.equal(r.id, 'mes-xers'); assert.match(r.lien, /^\?x=z/);
    const { xer, manquants } = await m.x.recevoir(new URLSearchParams(r.lien).get('x'));
    assert.equal(xer.nom, 'mon xer'); assert.deepEqual(manquants, []); assert.notEqual(xer.id, 'x1');
  } finally { p.fin(); }
});

test('🧹 un xer reçu est nettoyé : des clés connues, des types connus, pas d\'action inconnue sur les bords', async () => {
  const x = nettoyerXer({ id: '../x', nom: 'A'.repeat(99), prefs: { mode: 'root', dock: 'oui', haptique: false, maxVivants: 99, icones: 'grandes', gestes: { 'd-bas': 'accueil', 'g-haut': 'rm -rf' }, __proto__: { x: 1 } },
    accueil: { pages: [{ nom: 'p', ids: ['ok', '<img>', 3] }], dossiers: 'x' }, ploxions: ['a', 'b c', 'c'], hud: { epingles: ['a', 'b', 'c', 'd', 'e'] } }, PREFS_DEFAUT);
  assert.notEqual(x.id, '../x'); assert.equal(x.nom.length, 40);
  assert.deepEqual(x.prefs, { icones: 'grandes', gestes: { 'd-bas': 'accueil' } });
  assert.deepEqual(x.accueil.pages, [{ nom: 'p', ids: ['ok'] }]); assert.deepEqual(x.accueil.dossiers, []);
  assert.deepEqual(x.ploxions, ['a', 'c']); assert.equal(x.hud.epingles.length, 4);
  assert.deepEqual(nettoyerPrefs({ miniDocks: 1e9, pleinEcran: true }, PREFS_DEFAUT), { miniDocks: 99, pleinEcran: true });
  await assert.rejects(decoderXer('q123'));
  assert.equal(lienXer('jABC'), 'https://labo.j0bot.ch/app/ouvrir/mes-xers?app=1&x=jABC');
});

test('📥 le ploxion « mes xers » ouvert par un lien : l\'aperçu, l\'ajouter et y aller', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const D = p.w.document, autre = monde(p.w);   // le xer de quelqu'un d'autre
    autre.regler({ p: { mode: 'xerboxion' } });
    const { lien } = await autre.x.partager('x1');
    const h = D.createElement('div'); D.body.appendChild(h);
    const m2 = monde(p.w); await m2.x.charger();   // le nôtre (le dernier creerXers tient jOSApps['mes-xers'])
    p.w.jOSApps['mes-xers'].mount(h, { params: { lien: '?x=' + new URL(lien).searchParams.get('x') } });
    await attendre(80);
    assert.ok(h.querySelector('.px-xr-recu'), 'l\'aperçu du xer reçu');
    h.querySelector('[data-xr="recu-aller"]').click(); await attendre(80);
    assert.equal(m2.etat().p.mode, 'xerboxion');
    assert.equal((await m2.x.liste()).length, 2);
  } finally { p.fin(); }
});
