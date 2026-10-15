// 👁 (0.73) l'AR native : la géométrie du monde de l'AR (versAR ↔ depuisAR), le terrax qui ouvre PloxiAR et garde ce qu'on y pose, la chambre
// et sa carte, le scan de la pièce vu en AR Quick Look ; le plugin (un Proxy sur iOS) jamais rendu d'une fonction async ; les liens 3D.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { versAR, depuisAR, distanceCap, decaler, creerTerrax, LOIN_AR, PRES_MODELE, modelesDe } from '../src/terrax/terrax.js';
import { creerArNatif, estLienAR, brancherLiensAR } from '../src/natif/ar-natif.js';
import { creerFichiersNatif } from '../src/natif/fichiers-natif.js';
import { page, attendre } from './aide.mjs';

const MOI = { lat: 46.5197, lon: 6.6323 };

test('🧭 versAR : x = est, z = sud ; loin, rapproché mais dans la vraie direction ; depuisAR en est l\'inverse', () => {
  const nord = versAR(MOI, { id: 'n', ...decaler(MOI, 20, 0), emoji: '🌳', texte: 'un arbre' });
  assert.ok(Math.abs(nord.x) < 0.01 && Math.abs(nord.z + 20) < 0.05, 'au nord : z négatif ' + JSON.stringify(nord));
  assert.match(nord.texte, /un arbre · 20 m/);
  const est = versAR(MOI, { id: 'e', ...decaler(MOI, 30, 90) });
  assert.ok(Math.abs(est.x - 30) < 0.05 && Math.abs(est.z) < 0.05, 'à l\'est : x positif');
  const loin = versAR(MOI, { id: 'l', ...decaler(MOI, 5000, 225) });
  assert.ok(Math.abs(Math.hypot(loin.x, loin.z) - LOIN_AR) < 0.01, 'rapproché à ' + LOIN_AR + ' m');
  assert.ok(loin.x < 0 && loin.z > 0, 'toujours au sud-ouest'); assert.match(loin.texte, /5\.0 km/); assert.equal(loin.taille, 10);
  for (const [x, z] of [[3, -4], [-12, 7], [0.5, 0.2]]) {
    const p = depuisAR(MOI, { x, y: 0.42, z }), r = distanceCap(MOI, p), v = versAR(MOI, { id: 'r', ...p });
    assert.ok(Math.abs(r.d - Math.hypot(x, z)) < 0.01, 'la distance'); assert.ok(Math.abs(v.x - x) < 0.01 && Math.abs(v.z - z) < 0.01, 'aller-retour');
    assert.equal(p.h, 0.42);
  }
  assert.equal(versAR(MOI, { id: 'h', ...depuisAR(MOI, { x: 2, y: 1.3, z: -2 }), h: 1.3 }).y, 1.3, 'près : sa hauteur posée');
});

// un faux PloxiAR côté page (l'API de src/natif/ar-natif.js)
function fauxAR({ chambre = false } = {}) {
  const ouverts = [], vus = []; let fn = null;
  return {
    ouverts, vus, emettre: (e) => fn && fn(e),
    disponible: async () => ({ ar: true, lidar: true, piece: true, chambre, objet: true, pieces: '/D/terrax/pieces', objets: '/D/terrax/objets' }),
    ouvrir: async (o) => { ouverts.push(o); return { ok: true }; },
    fermer: async () => ({}), ecouter: (f) => { fn = f; return () => { fn = null; }; },
    scannerPiece: async () => ({ nom: 'piece-2026-10-15-120000.usdz', chemin: '/D/terrax/pieces/piece-2026-10-15-120000.usdz' }),
    voirPiece: async (nom) => { vus.push(nom); return { ok: true }; },
    capturerObjet: async () => ({ nom: 'objet-2026-10-15-121500.usdz', chemin: '/D/terrax/objets/objet-2026-10-15-121500.usdz' }),
    voirObjet: async (nom) => { vus.push('objet:' + nom); return { ok: true }; },
  };
}

test('👁 le terrax ouvre l\'AR native : les objets à leur place ; ce qu\'on y pose est gardé à sa vraie position', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, ar = fauxAR();
    await p.boxion.put('terrax', 'objets', [{ id: 'a', emoji: '🗿', texte: 'le menhir', lieu: 'terre', ...decaler(MOI, 25, 90), le: 1 }, { id: 'c', emoji: '🤖', lieu: 'chambre', lat: null, lon: null, le: 2 }]);
    creerTerrax({ W, boxion: p.boxion, ar });
    const h = D.createElement('div'); D.body.appendChild(h);
    const inst = W.jOSApps.terrax.mount(h); await attendre(60);
    inst.position(MOI); inst.allerPage('terrax');
    assert.match(h.querySelector('[data-tx="yeux"]').textContent, /ARKit \+ LiDAR/);
    h.querySelector('[data-tx="yeux"]').click(); await attendre(40);
    assert.equal(ar.ouverts.length, 1); assert.equal(ar.ouverts[0].mode, 'terre');
    assert.equal(ar.ouverts[0].objets.length, 1, 'la chambre ne va pas sur la terre');
    const m = ar.ouverts[0].objets[0]; assert.ok(Math.abs(m.x - 25) < 0.1 && Math.abs(m.z) < 0.1, 'le menhir à l\'est'); assert.equal(m.d, undefined, 'rien de plus que le contrat');
    ar.emettre({ type: 'pose', id: 'txar1', x: 0, y: -1.2, z: -8, emoji: '🍄', texte: 'un champignon' }); await attendre(40);
    const o = (await p.boxion.get('terrax', 'objets')).find(x => x.id === 'txar1');
    assert.ok(o && o.lieu === 'terre' && o.ar, 'gardé'); assert.ok(Math.abs(distanceCap(MOI, o).d - 8) < 0.05 && Math.min(distanceCap(MOI, o).cap, 360 - distanceCap(MOI, o).cap) < 1, '8 m au nord'); assert.equal(o.h, -1.2);
    ar.emettre({ type: 'pose', id: 'txar1', x: 0, y: 0, z: -8, emoji: '🍄' }); await attendre(30);
    assert.equal((await p.boxion.get('terrax', 'objets')).filter(x => x.id === 'txar1').length, 1, 'une pose, une fois');
    ar.emettre({ type: 'touche', id: 'a' }); await attendre(20);
    assert.ok((await p.boxion.get('terrax', 'etat')).regard, 'la quête regard : un objet à toi, trouvé dans l\'AR');
    ar.emettre({ type: 'ferme' }); await attendre(20);
    ar.emettre({ type: 'pose', id: 'tard', x: 1, z: 1 }); await attendre(20);
    assert.ok(!(await p.boxion.get('terrax', 'objets')).some(x => x.id === 'tard'), 'fermée : plus rien n\'est pris');
    inst.unmount();
  } finally { p.fin(); }
});

test('🛏 la chambre en AR (sa carte, ses places) ; 📐 le scan de la pièce s\'ouvre en AR Quick Look', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, ar = fauxAR({ chambre: true });
    await p.boxion.put('terrax', 'objets', [{ id: 'r', emoji: '🤖', texte: 'mon robot', lieu: 'chambre', lat: null, lon: null, le: 1, place: { x: 1, y: 0.2, z: -0.5 } }]);
    creerTerrax({ W, boxion: p.boxion, ar });
    const h = D.createElement('div'); D.body.appendChild(h);
    const inst = W.jOSApps.terrax.mount(h); await attendre(60);
    inst.allerPage('chambre'); await attendre(20);
    assert.match(h.querySelector('[data-tx="ar-chambre"]').textContent, /à leur place/);
    h.querySelector('[data-tx="ar-chambre"]').click(); await attendre(30);
    assert.equal(ar.ouverts[0].mode, 'chambre'); assert.deepEqual(ar.ouverts[0].objets.map(x => [x.id, x.x, x.z]), [['r', 1, -0.5]]);
    ar.emettre({ type: 'pose', id: 'pl', x: -0.4, y: 0.7, z: 1.1, emoji: '🪑', texte: 'la chaise' }); await attendre(30);
    let l = await p.boxion.get('terrax', 'objets');
    assert.deepEqual(l.find(x => x.id === 'pl').place, { x: -0.4, y: 0.7, z: 1.1 }); assert.equal(l.find(x => x.id === 'pl').lat, null, 'jamais sur la carte');
    ar.emettre({ type: 'chambre-neuve' }); await attendre(20);
    l = await p.boxion.get('terrax', 'objets'); assert.ok(l.every(x => !x.place), 'nouvelle chambre : les places oubliées, les objets restent'); assert.equal(l.length, 2);
    ar.emettre({ type: 'ferme' }); await attendre(20);
    h.querySelector('[data-tx="scanner"]').click(); await attendre(40);
    const piece = (await p.boxion.get('terrax', 'objets')).find(x => x.piece);
    assert.ok(piece && piece.lieu === 'chambre' && piece.emoji === '📐', 'la pièce, dans ta chambre');
    const voir = h.querySelector('[data-tx="voir-piece"]'); assert.ok(voir, 'sa feuille s\'ouvre : voir en AR');
    voir.click(); await attendre(20);
    assert.deepEqual(ar.vus, [piece.piece]);
    inst.unmount();
  } finally { p.fin(); }
});

// un faux plugin Capacitor : un Proxy, comme sur iOS — lire une propriété inconnue (then, ...) est une faute
function fauxPlugin(methodes) {
  const lues = [];
  const p = new Proxy({}, { get(t, k) { if (typeof k === 'string' && !(k in methodes)) lues.push(k); return methodes[k]; } });
  return { p, lues };
}

test('🔌 creerArNatif : null hors iPhone ; sur iPhone, jamais une propriété du Proxy ; la pièce à l\'échelle 1', async () => {
  const web = creerArNatif({ W: {}, plugin: {} });
  assert.equal(await web.disponible(), null); assert.equal(typeof web.ecouter(() => {}), 'function');
  const W = { Capacitor: { isNativePlatform: () => true } }, apercus = [], ecoutes = [];
  const { p, lues } = fauxPlugin({
    disponible: async () => ({ ar: true, lidar: false, piece: false, chambre: false, pieces: '/D/terrax/pieces' }), ouvrir: async (o) => ({ ok: true, o }),
    addListener: async (n, f) => { ecoutes.push([n, f]); return { remove: () => ecoutes.splice(0) }; }, fermer: async () => ({}), scannerPiece: async () => ({ nom: 'x.usdz' }),
  });
  const a = creerArNatif({ W, plugin: p, apple: { apercu: async (o) => { apercus.push(o); return { ok: true }; } } });
  assert.equal((await a.disponible()).ar, true);
  assert.equal((await a.ouvrir({ mode: 'chambre', objets: [{ id: 1 }] })).o.mode, 'chambre');
  const recu = []; const stop = a.ecouter((e) => recu.push(e)); await attendre(5);
  ecoutes[0][1]({ type: 'pose' }); assert.deepEqual(recu, [{ type: 'pose' }]);
  stop(); assert.equal(ecoutes.length, 0, 'arrêter retire l\'écoute');
  await a.voirPiece('../piece.usdz');
  assert.deepEqual(apercus, [{ chemin: '/D/terrax/pieces/..piece.usdz', echelleReelle: true }], 'dans le dossier des pièces, rien au-dessus');
  assert.deepEqual(lues, [], 'aucune propriété lue au hasard (then…) : le piège du Proxy');
  const sansAR = creerArNatif({ W, plugin: fauxPlugin({ disponible: async () => ({ ar: false }) }).p });
  assert.equal(await sansAR.disponible(), null, 'un appareil sans AR');
  const absent = creerArNatif({ W, plugin: fauxPlugin({ disponible: async () => { throw new Error('"PloxiAR" plugin is not implemented on ios'); } }).p });
  assert.equal(await absent.disponible(), null, 'un build sans AR (PLOXI0N_AR=0)');
});

test('🔗 un lien 3D d\'un ploxion → AR Quick Look ; une adresse http est téléchargée par iOS', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, vus = [];
    D.body.innerHTML = '<a id="u" href="https://exemple.ch/modeles/robot.usdz?v=2"><b>robot</b></a><a id="r" rel="ar" href="/m/x"></a><a id="n" href="https://exemple.ch/page.html">page</a><a id="t" href="/ar/notes.txt">notes</a>';
    const stop = brancherLiensAR({ D, apercu: (u) => vus.push(u) });
    const clic = (id) => { const e = new W.MouseEvent('click', { bubbles: true, cancelable: true }); D.querySelector(id).dispatchEvent(e); return e.defaultPrevented; };
    D.body.addEventListener('click', (e) => e.preventDefault());   // (jsdom : pas de navigation)
    assert.equal(clic('#u b'), true); assert.equal(clic('#r'), true); clic('#n'); clic('#t'); await attendre(5);
    assert.equal(vus.length, 2); assert.equal(vus[0], 'https://exemple.ch/modeles/robot.usdz?v=2'); assert.match(vus[1], /\/m\/x$/);
    assert.equal(estLienAR(D.querySelector('#t')), false, 'un dossier « ar » n\'est pas un modèle');
    stop(); clic('#u'); await attendre(5); assert.equal(vus.length, 2, 'débranché');
    const appels = [];
    const fx = creerFichiersNatif({ W: { Capacitor: { isNativePlatform: () => true } }, apple: { apercu: async (o) => { appels.push(o); return { ok: true }; } } });
    await fx.apercu('https://exemple.ch/modeles/robot.usdz'); await fx.apercu('/D/terrax/pieces/p.usdz', { echelleReelle: true });
    assert.deepEqual(appels, [{ url: 'https://exemple.ch/modeles/robot.usdz' }, { chemin: '/D/terrax/pieces/p.usdz', echelleReelle: true }]);
  } finally { p.fin(); }
});

test('📦 Object Capture : ton objet réel en 3D, vu en AR Quick Look, posé en vrai modèle dans l\'AR', async () => {
  // la géométrie : le vrai modèle de près, son étiquette de loin ; la liste proposée à la pose
  const pres = versAR(MOI, { id: 'm', ...decaler(MOI, 12, 45), modele: 'objet-1.usdz', rot: 1.2 }), loin = versAR(MOI, { id: 'm2', ...decaler(MOI, PRES_MODELE + 5, 45), modele: 'objet-1.usdz' });
  assert.equal(pres.modele, 'objet-1.usdz'); assert.equal(pres.rot, 1.2); assert.equal(loin.modele, undefined, 'trop loin : l\'étiquette');
  assert.deepEqual(modelesDe([{ capture: true, modele: 'a.usdz', texte: 'robot' }, { modele: 'a.usdz', place: {} }, { capture: true, modele: 'b.usdz', texte: 'chaise' }]), [{ nom: 'b.usdz', texte: 'chaise' }, { nom: 'a.usdz', texte: 'robot' }]);
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, ar = fauxAR({ chambre: true });
    creerTerrax({ W, boxion: p.boxion, ar });
    const h = D.createElement('div'); D.body.appendChild(h);
    const inst = W.jOSApps.terrax.mount(h); await attendre(60);
    inst.allerPage('chambre'); await attendre(20);
    h.querySelector('[data-tx="capturer"]').click(); await attendre(40);
    const cap = (await p.boxion.get('terrax', 'objets')).find(x => x.capture);
    assert.ok(cap && cap.modele === 'objet-2026-10-15-121500.usdz' && cap.lieu === 'chambre' && cap.emoji === '📦', 'ton objet 3D, à toi');
    const ts = await p.boxion.lire('tsoins'); assert.ok(ts.some(x => x.entry.kind === 'terrax' && x.entry.action === 'capturer'), 'un tsoin');
    h.querySelector('[data-tx="voir-objet"]').click(); await attendre(20);
    assert.deepEqual(ar.vus, ['objet:' + cap.modele], 'AR Quick Look');
    h.querySelector('[data-tx="annuler"]').click();
    h.querySelector('[data-tx="ar-chambre"]').click(); await attendre(30);
    assert.deepEqual(ar.ouverts[0].modeles, [{ nom: cap.modele, texte: cap.texte.slice(0, 40) }], 'proposé quand on pose');
    ar.emettre({ type: 'pose', id: 'pm', x: 0.5, y: 0, z: -1, emoji: '📦', texte: 'mon robot', modele: cap.modele, rot: 0.7 }); await attendre(30);
    const pose = (await p.boxion.get('terrax', 'objets')).find(x => x.id === 'pm');
    assert.equal(pose.modele, cap.modele); assert.equal(pose.rot, 0.7); assert.ok(pose.place && !pose.capture, 'une instance posée, à sa place');
    ar.emettre({ type: 'ferme' }); await attendre(20);
    h.querySelector('[data-tx="ar-chambre"]').click(); await attendre(30);
    const re = ar.ouverts[1].objets.find(x => x.id === 'pm');
    assert.equal(re.modele, cap.modele); assert.equal(re.rot, 0.7);
    assert.ok(!ar.ouverts[1].objets.some(x => x.id === cap.id), 'l\'objet capturé lui-même n\'a pas de place');
    inst.unmount();
  } finally { p.fin(); }
  const apercus = [];
  const a = creerArNatif({ W: { Capacitor: { isNativePlatform: () => true } }, plugin: { disponible: async () => ({ ar: true, objets: '/D/terrax/objets' }) }, apple: { apercu: async (o) => { apercus.push(o); } } });
  await a.voirObjet('objet-1.usdz'); await assert.rejects(a.voirObjet('..'));
  assert.deepEqual(apercus, [{ chemin: '/D/terrax/objets/objet-1.usdz', echelleReelle: true }]);
});

test('🛡 la revue : une seule ouverture à la fois ; un nom de fichier propre pour AR Quick Look', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, ar = fauxAR();
    let refus = 0; const ouvrir = ar.ouvrir; ar.ouvrir = async (o) => { if (ar.ouverts.length) { refus++; throw new Error('l\'AR est déjà ouverte'); } return ouvrir(o); };
    creerTerrax({ W, boxion: p.boxion, ar });
    const h = D.createElement('div'); D.body.appendChild(h);
    const inst = W.jOSApps.terrax.mount(h); await attendre(60);
    inst.allerPage('terrax'); h.querySelector('[data-tx="yeux"]').click(); h.querySelector('[data-tx="yeux"]').click();   // sans position : il attend
    await attendre(30); inst.position(MOI, false); await attendre(400);
    assert.equal(ar.ouverts.length, 1, 'un double toucher n\'ouvre qu\'une fois'); assert.equal(refus, 0);
    h.querySelector('[data-tx="yeux"]').click(); await attendre(40);   // iOS la refuse (déjà ouverte) : la session de la page reste
    assert.equal(refus, 1);
    ar.emettre({ type: 'pose', id: 'apres-refus', x: 1, z: -1, emoji: '✨' }); await attendre(30);
    assert.ok((await p.boxion.get('terrax', 'objets')).some(x => x.id === 'apres-refus'), 'la pose est toujours gardée');
    assert.ok(!h.querySelector('.tx-video').srcObject, 'pas d\'AR web en dessous');
    inst.unmount();
  } finally { p.fin(); }
  const appels = [];
  const fetch = async (u) => (/404/.test(u) ? { ok: false, status: 404 } : { ok: true, blob: async () => ({ type: /blob/.test(u) ? 'model/vnd.usdz+zip' : '', arrayBuffer: async () => new ArrayBuffer(2) }) });
  const fx = creerFichiersNatif({ W: { Capacitor: { isNativePlatform: () => true }, fetch }, apple: { apercu: async (o) => { appels.push(o); return { ok: true }; } } });
  await fx.apercu('capacitor://localhost/px/m/robot%20bleu.usdz#allowsContentScaling=0');
  await fx.apercu('blob:capacitor://localhost/1b2c-3d');
  await assert.rejects(fx.apercu('capacitor://localhost/404.usdz'), /404/);
  assert.deepEqual(appels.map(a => a.nom), ['robot bleu.usdz', '1b2c-3d.usdz']);
});
