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

test('❤ la santé : autoriser d\'abord, puis les tuiles, la nuit, les séries, les appareils ; jOSNatif.sante sur accord par ploxion', async () => {
  const { creerSante, sommeil } = await import('../src/natif/sante.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w;
  try {
    const iso = (h) => new Date(Date.now() - h * 3600e3).toISOString();
    const demandes = [];
    const H = {
      isAvailable: async () => ({ available: true }),
      requestAuthorization: async (o) => { demandes.push(o); return { readAuthorized: o.read, readDenied: [] }; },
      readSamples: async ({ dataType }) => ({ samples: {
        steps: [{ value: 4000, endDate: iso(1), startDate: iso(2), sourceName: 'iPhone', deviceType: 'iPhone' }, { value: 2500, endDate: iso(0.5), startDate: iso(1), sourceName: 'Apple Watch', deviceType: 'Watch' }],
        heartRate: [{ value: 62, endDate: iso(0.2), startDate: iso(0.2), sourceName: 'Apple Watch', deviceType: 'Watch' }],
        sleep: [{ startDate: iso(9), endDate: iso(2), sourceName: 'Apple Watch', stages: [{ stage: 'deep', durationMinutes: 90 }, { stage: 'rem', durationMinutes: 100 }, { stage: 'light', durationMinutes: 200 }, { stage: 'awake', durationMinutes: 20 }] }],
      }[dataType] || [] }),
      queryAggregated: async ({ dataType }) => ({ samples: dataType === 'steps' ? [{ startDate: iso(30), endDate: iso(6), value: 8000, values: { sum: 8000 } }] : [] }),
      queryWorkouts: async () => ({ workouts: [{ workoutType: 'running', duration: 1800, totalDistance: 5200, totalEnergyBurned: 310, startDate: iso(20), endDate: iso(19.5), sourceName: 'Apple Watch' }] }),
    };
    assert.equal(sommeil([{ stages: [{ stage: 'deep', durationMinutes: 60 }, { stage: 'awake', durationMinutes: 10 }] }]).total, 60, 'éveillé ne compte pas');
    let ici = 'sante';
    const s = creerSante({ W, boxion: p.boxion, plugin: H, courant: () => ici });
    const h = W.document.createElement('div'); W.document.body.appendChild(h);
    W.jOSApps.sante.mount(h); await attendre(30);
    assert.ok(h.querySelector('[data-autoriser]'), 'd\'abord : autoriser');
    h.querySelector('[data-autoriser]').click(); await attendre(80);
    assert.ok(demandes[0].read.includes('sleep') && demandes[0].read.includes('workouts'));
    assert.match(h.textContent, /6 ?500|6.500|6 500/, 'les pas du jour, additionnés');
    assert.match(h.textContent, /62 bpm/);
    assert.match(h.textContent, /6 h 30/, 'la nuit : 390 min endormi');
    assert.match(h.textContent, /course/); assert.match(h.textContent, /5\.2 km/);
    assert.match(h.textContent, /Apple Watch/); assert.match(h.textContent, /iPhone/);
    // un autre ploxion : il demande, une fois
    ici = 'xp';
    const lu = s.api.lire('steps');
    await attendre(10); W.document.querySelector('.px-voile [data-ok]').click();
    assert.equal((await lu).length, 2);
    assert.deepEqual(await p.boxion.get('reglages', 'sante-ploxions'), { xp: true });
    ici = 'espion'; const non = s.api.lire('steps'); await attendre(10); W.document.querySelector('.px-voile [data-non]').click();
    await assert.rejects(non, /refusée/);
  } finally { p.fin(); }
});

test('🧭 jOSUsage dans l\'app : le téléphone + le web (lu, jamais écrasé), top, jours, vecteur par catégorie', async () => {
  const { creerUsage, fusionner, jourCle } = await import('../src/natif/usage.js');
  const p = await page({ avion: true, ploxions: [] });
  try {
    const k = jourCle();
    await p.boxion.put('usage', 'stats', { px: { xp: { opens: 2, seconds: 600, lastAt: 1 } }, days: { [k]: { opens: 2, seconds: 600, px: { xp: { o: 2, s: 600 } } } } });
    const ecrits = [];
    const web = { px: { xp: { opens: 1, seconds: 400, lastAt: 2 }, notes: { opens: 3, seconds: 3000, lastAt: 3 } }, days: { [k]: { opens: 4, seconds: 3400, px: { notes: { o: 3, s: 3000 } } } } };
    const u = creerUsage({ boxion: p.boxion, distant: () => ({ get: async () => web, set: async (...a) => ecrits.push(a) }), registre: async () => ({ xp: { c: 'jeu' }, notes: { c: 'creation' } }) });
    await u.pret;
    assert.equal(u.stats().px.xp.seconds, 1000, 'additionnés');
    assert.deepEqual(u.top(1).map(x => x.id), ['notes']);
    assert.equal(u.days(7).at(-1).seconds, 4000);
    const v = await u.vecteur(); assert.ok(v.creation > v.jeu && Math.abs(v.creation + v.jeu - 1) < 0.01);
    assert.equal(ecrits.length, 0, 'le web n\'est jamais écrasé');
    assert.deepEqual(fusionner(null, { px: {} }), { px: {}, days: {} });
  } finally { p.fin(); }
});

test('⬇ la barre d\'installation suit le ploxion puis ses bions ; 📦 le gestionnaire : place, dépendances, retirer libère', async () => {
  const { installerAvecBarre } = await import('../src/app/installation.js');
  const { enregistrerGestion } = await import('../src/app/gestion.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w;
  try {
    const vus = [];
    const depot = {
      async installer(id, meta, progres) { progres({ etape: 'ploxion' }); progres({ etape: 'recu', octets: 120000 }); vus.push(W.document.querySelector('.px-installation [data-etape]').textContent);
        progres({ etape: 'bion', nom: 'jOSStore', fait: 1, connus: 2 }); vus.push(W.document.querySelector('.px-installation [data-barre]').style.width); return { octets: 120000, bions: ['jOSStore', 'jOSZone'], manquants: [] }; },
    };
    const r = await installerAvecBarre({ W, depot, id: 'zone', meta: { nom: 'Zone', icone: '🫧' } });
    assert.equal(r.bions.length, 2);
    assert.match(vus[0], /120 ko/); assert.equal(vus[1], '63%');
    assert.match(W.document.querySelector('.px-installation').textContent, /prêt · 120 ko · 2 bions/);
    await assert.rejects(installerAvecBarre({ W, depot: { installer: async () => { throw new Error('HTTP 404'); } }, id: 'x' }), /404/);
    assert.ok(W.document.querySelector('.px-installation.ko'), 'l\'erreur reste lisible');
    // le gestionnaire
    const retires = [], bionsRetires = [];
    const inv = { ploxions: [{ id: 'zone', nom: 'Zone', icone: '🫧', bundle: 100000, liberable: 150000, total: 400000, deps: [{ nom: 'jOSZone', octets: 50000, partage: 1 }, { nom: 'jOSStore', octets: 250000, partage: 3 }] }, { id: 'notes', nom: 'Notes', bundle: 20000, liberable: 20000, total: 270000, deps: [{ nom: 'jOSStore', octets: 250000, partage: 3 }] }],
      bions: [], totaux: { bundles: 120000, bions: 300000, tout: 420000, orphelins: [{ nom: 'jOSVieux', octets: 9000 }] } };
    const gd = { inventaire: async () => inv, retirerBion: async (n) => bionsRetires.push(n), aJour: async () => [] };
    enregistrerGestion({ W, depot: gd, retirer: async (id) => retires.push(id) });
    const h = W.document.createElement('div'); W.document.body.appendChild(h);
    W.jOSApps.gestion.mount(h); await attendre(20);
    assert.match(h.textContent, /420 ko/); assert.match(h.textContent, /orphelins · 1/);
    assert.ok(h.textContent.indexOf('Zone') < h.textContent.indexOf('Notes'), 'le plus lourd d\'abord');
    h.querySelector('[data-p="zone"]').click(); await attendre(20);
    assert.match(h.textContent, /jOSZone · 50 ko · à lui seul/); assert.match(h.textContent, /jOSStore · 250 ko · ×3/);
    const b = h.querySelector('[data-retirer="zone"]'); b.click(); await attendre(10);
    assert.equal(retires.length, 0, 'un premier toucher demande « sûr ? »');
    h.querySelector('[data-retirer="zone"]').click(); await attendre(30);
    assert.deepEqual(retires, ['zone']); assert.deepEqual(bionsRetires, ['jOSZone'], 'seuls ses bions à lui partent');
    h.querySelector('[data-orphelins]').click(); await attendre(30);
    assert.ok(bionsRetires.includes('jOSVieux'));
  } finally { p.fin(); }
});

test('🖼 le fond d\'écran : motif gravé, photo (gardée), assombrir, l\'accueil ou partout, retirer', async () => {
  const { creerFond, MOTIFS } = await import('../src/app/fond.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w, h = W.document.documentElement;
  try {
    const f = creerFond({ W, boxion: p.boxion }); await f.pret;
    assert.ok(!h.classList.contains('px-a-fond'), 'aucun par défaut');
    await f.regler({ type: 'motif', motif: 'hex' });
    assert.ok(h.classList.contains('px-a-fond'));
    assert.equal(W.document.querySelector('.px-fond i').style.backgroundImage.includes('svg'), true);
    assert.doesNotMatch(Object.values(MOTIFS).map(m => decodeURIComponent(m.css)).join(''), /Gradient/i, 'aucun dégradé');
    // une photo (hors iPhone : jOSNatif.photo), gardée d'un lancement à l'autre
    W.jOSNatif = { photo: async () => 'data:image/png;base64,iVBORw0KGgo=' };
    await f.choisirPhoto('galerie');
    assert.equal(f.reglage().type, 'photo');
    await f.regler({ sombre: 60, partout: true });
    assert.equal(W.document.querySelector('.px-fond b').style.opacity, '0.6');
    assert.ok(h.classList.contains('px-fond-partout'));
    const f2 = creerFond({ W, boxion: p.boxion }); await f2.pret;
    assert.match(f2.image(), /^data:image/); assert.equal(f2.reglage().sombre, 60);
    f2.composer(); const s = W.document.querySelector('.px-fond-feuille');
    assert.ok(s.querySelector('[data-r="sombre"]') && s.querySelector('[data-motif="cubes"]'));
    s.querySelector('[data-f="aucun"]').click(); await attendre(30);
    assert.equal(await p.boxion.get('reglages', 'fond-image'), null); assert.ok(!h.classList.contains('px-a-fond'));
  } finally { p.fin(); }
});

test('📁 le dossier Fichiers : Lisez-moi, journal des tsoins par mois, vocaux une fois, Dépôt ; jamais hors du dossier', async () => {
  const { creerDossier, sur, journalMois } = await import('../src/natif/dossier.js');
  const p = await page({ avion: true, ploxions: [] });
  try {
    const disque = new Map(); let ecritures = 0;
    const fs = { Directory: { Documents: 'DOCUMENTS' }, Encoding: { UTF8: 'utf8' }, Filesystem: {
      writeFile: async ({ path, data, encoding }) => { ecritures++; disque.set(path, { data, texte: !!encoding }); },
      readdir: async ({ path }) => ({ files: [...disque.keys()].filter(k => k.startsWith(path + '/')).map(k => ({ name: k.slice(path.length + 1), type: 'file', size: disque.get(k).data.length })) }),
      readFile: async ({ path }) => ({ data: disque.get(path).data }) } };
    await p.boxion.append('tsoins', { kind: 'tsoin', genre: 'idee', d: 'un dossier dans Fichiers', ploxion: 'zone' });
    await p.boxion.append('tsoins', { kind: 'marketplace', action: 'installer' });
    await p.boxion.put('vocaux', 'v1', { id: 'v1', le: '2026-10-12T17:30:00Z', texte: 'bonjour le xerboxion', audio: 'data:audio/mp4;base64,AAAA' });
    const d = creerDossier({ boxion: p.boxion, fs, depot: { inventaire: async () => ({ ploxions: [{ id: 'zone', nom: 'Zone', total: 5, deps: [{ nom: 'jOSZone' }] }] }) } });
    const l = await d.synchroniser();
    assert.ok(disque.has('Lisez-moi.txt') && disque.has('Dépôt/.ploxi0n'));
    const m = [...disque.keys()].find(k => /^Tsoins\/\d{4}-\d{2}\.md$/.test(k));
    assert.match(disque.get(m).data, /idée|idee/); assert.match(disque.get(m).data, /un dossier dans Fichiers \(⧉ zone\)/);
    assert.doesNotMatch(disque.get(m).data, /installer/, 'seulement les tsoins natifs');
    const voc = [...disque.keys()].filter(k => k.startsWith('Vocaux/'));
    assert.equal(voc.length, 2); assert.ok(voc.some(k => k.endsWith('.m4a') && !disque.get(k).texte), 'le son en binaire');
    assert.ok(disque.has('Ploxions/installés.json'));
    const n = ecritures; await d.synchroniser();
    assert.equal([...disque.keys()].filter(k => k.startsWith('Vocaux/')).length, 2); assert.ok(ecritures - n < l.length, 'un vocal déjà copié ne l\'est plus');
    // les ploxions : lire le Dépôt, y écrire ; jamais en dehors
    assert.equal(await d.api.ecrire('../../etc/passwd', 'x'), 'Dépôt/passwd');
    assert.deepEqual((await d.api.lister()).map(f => f.nom), ['passwd'], 'les fichiers cachés ne sont pas listés');
    assert.throws(() => sur('Dépôt/../../x'), /interdit/);
    assert.match(journalMois('2026-10', []), /# Tsoins · 2026-10/);
  } finally { p.fin(); }
});

test('🌀 le thème vivant : la gravité → --mx/--my (neutre recentré, lissé, borné), un choc fait tressauter, éteint en Calme / hors accueil', async () => {
  const { creerMouvement } = await import('../src/app/mouvement.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w, h = W.document.documentElement;
  try {
    let P = { calme: false, themeVivant: true }; const abonnes = [];
    const prefs = { lire: () => P, surChangement: (f) => abonnes.push(f) };
    const appels = []; let ecouteur = null;
    const plugin = { addListener: async (n, f) => { ecouteur = f; return { remove: async () => { ecouteur = null; } }; }, mouvementDebut: async (o) => appels.push(['debut', o.hz]), mouvementFin: async () => appels.push(['fin']) };
    const racine = W.document.getElementById('ploxi0n'); racine.classList.add('px-mode-accueil');
    const m = creerMouvement({ W, prefs, plugin, racine }); await attendre(20);
    assert.ok(m.actif() && h.classList.contains('px-anime')); assert.deepEqual(appels[0], ['debut', 30]);
    ecouteur({ gx: 0, gy: -0.7 });                                  // tenu debout : le neutre
    for (let i = 0; i < 20; i++) ecouteur({ gx: 0.3, gy: -0.7 });  // incliné à droite
    await attendre(40);                                              // (0.53) appliqué à l'image suivante
    const mx = +h.style.getPropertyValue('--mx'); assert.ok(mx > 0.5 && mx <= 1, 'incliné → --mx ' + mx);
    for (let i = 0; i < 2000; i++) ecouteur({ gx: 0.3, gy: -0.7 });  // gardé longtemps : devient le neutre
    await attendre(160); ecouteur({ gx: 0.3, gy: -0.7 }); await attendre(40);   // (0.53) les variables : au plus 8 fois par seconde
    assert.ok(Math.abs(+h.style.getPropertyValue('--mx')) < 0.05, 'le neutre se recentre');
    ecouteur({ gx: 0.3, gy: -0.7, ax: 1.2 }); assert.ok(h.classList.contains('px-choc'), 'un choc');
    racine.classList.replace('px-mode-accueil', 'px-mode-ploxion'); await attendre(20);
    assert.ok(!m.actif(), '(0.53) dans un ploxion, rien ne bouge (30 événements/s pour une ombre : le lag)');
    const vus = []; const off = m.ecouter(e => vus.push(e)); await attendre(20);
    assert.ok(m.actif(), '… sauf si un ploxion écoute');
    ecouteur({ gx: 0.5, gy: -0.7 });
    assert.ok(vus.length === 1 && vus[0].x > 0, 'les ploxions reçoivent le mouvement');
    assert.equal(W.jOSNatif.mouvement.etat().source, 'CoreMotion');
    off(); await attendre(20); assert.ok(!m.actif(), 'plus personne n\'écoute : arrêté');
    racine.classList.replace('px-mode-ploxion', 'px-mode-accueil'); await attendre(20);
    P = { calme: true }; abonnes.forEach(f => f(P)); await attendre(10); assert.ok(!m.actif(), 'Calme coupe');
    assert.ok(appels.some(a => a[0] === 'fin')); assert.equal(h.style.getPropertyValue('--mx'), '0');
  } finally { p.fin(); }
});

test('◇ l\'index léger des ploxions installés : installes() ne relit plus les bundles ; invalidé à chaque installation', async () => {
  const { creerDepot } = await import('../src/marketplace/depot.js');
  const { creerMemoire } = await import('../src/boxion-local/memoire.js');
  const boxion = creerMemoire(); let lectures = 0; const get = boxion.get.bind(boxion);
  boxion.get = async (ns, k) => { if (ns === 'ploxions') lectures++; return get(ns, k); };
  const js = (id) => `window.jOSApps=window.jOSApps||{};window.jOSApps[${JSON.stringify(id)}]={manifest:{id:${JSON.stringify(id)}},mount(){return{}}};`;
  const http = { get: async (u) => { const m = u.match(/\/px\/([^/]+)\/app\.js$/); return m ? { status: 200, texte: js(m[1]), entetes: {} } : { status: 404, texte: '' }; } };
  const d = creerDepot({ boxion, http });
  await d.installer('a', { nom: 'A' }); await d.installer('b', { nom: 'B' });
  assert.deepEqual((await d.installes()).map(x => x.nom), ['A', 'B']);
  const n = lectures; await d.installes(); await d.installes();
  assert.equal(lectures, n, 'deux lectures de plus : aucun bundle relu');
  await d.installer('c', { nom: 'C' }); assert.deepEqual((await d.installes()).map(x => x.id), ['a', 'b', 'c'], 'invalidé à l\'installation');
  await d.retirer('a'); assert.deepEqual((await d.installes()).map(x => x.id), ['b', 'c']);
});

test('📶 un ploxion caché arrête ses vidéos (7 Go en un jour : des vidéos invisibles en lecture)', async () => {
  const { creerRouteur } = await import('../src/app/routeur.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w;
  try {
    W.jOSApps = W.jOSApps || {};
    for (const id of ['film', 'notes']) W.jOSApps[id] = { manifest: { id }, mount(h) { h.innerHTML = id === 'film' ? '<video src="x.mp4"></video>' : '<b>n</b>'; return {}; } };
    const racine = W.document.createElement('div'); W.document.body.appendChild(racine);
    const r = creerRouteur({ fenetre: W, racine, catalogue: [{ id: 'film', nom: 'Film', interne: true }, { id: 'notes', nom: 'Notes', interne: true }], boxion: p.boxion });
    await r.ouvrir('film');
    const v = racine.querySelector('video'); let pauses = 0;
    Object.defineProperty(v, 'paused', { get: () => pauses > 0, configurable: true }); v.pause = () => { pauses++; };   // en lecture au départ
    await r.ouvrir('notes');                         // film passe dessous, vivant
    assert.equal(pauses, 1, 'la vidéo cachée s\'arrête'); assert.equal(v.preload, 'none');
  } finally { p.fin(); }
});

test('🛟 la garde du boxion local : un appel qui ne répond plus ne fige rien (défaut après le délai, puis délai court)', async () => {
  const { garderBoxion } = await import('../src/boxion-local/garde.js');
  const { creerMemoire } = await import('../src/boxion-local/memoire.js');
  const vrai = creerMemoire(); await vrai.put('a', 'k', 1);
  let coince = false; const lents = [];
  const b = Object.create(vrai); for (const n of ['get', 'list', 'put', 'lire']) b[n] = (...a) => coince ? new Promise(() => {}) : vrai[n](...a);
  const g = garderBoxion(b, { delai: 60, surLent: (i) => lents.push(i.appel) });
  assert.equal(await g.get('a', 'k'), 1, 'normal : la vraie valeur');
  coince = true;
  const t0 = Date.now();
  assert.equal(await g.get('a', 'k'), null); assert.deepEqual(await g.list('a'), []); assert.deepEqual(await g.lire('tsoins'), []);
  assert.equal(await g.put('a', 'k', 2), undefined);
  assert.ok(Date.now() - t0 < 60 * 2 + 40 * 2 + 200, 'après 2 lents, les suivants vont plus vite');
  assert.equal(g.lents().length, 4); assert.match(lents[0], /get a\/k/);
});

test('🧊 le gel du démarrage (0.37→0.43) : CoreMotion refusé ne boucle plus (les minuteurs tournent, une seule tentative)', async () => {
  const { creerMouvement } = await import('../src/app/mouvement.js');
  const p = await page({ avion: true, ploxions: [] }), W = p.w;
  try {
    let n = 0;
    const plugin = { addListener: async () => { n++; return { remove: async () => {} }; }, mouvementDebut: async () => { throw new Error('refusé'); }, mouvementFin: async () => {} };
    const racine = W.document.getElementById('ploxi0n'); racine.classList.add('px-mode-accueil');
    const m = creerMouvement({ W, prefs: { lire: () => ({}), surChangement: () => {} }, plugin, racine });
    await new Promise(ok => setTimeout(ok, 100));   // ce minuteur ne tournait JAMAIS (boucle de micro-tâches)
    assert.equal(n, 1, 'une seule tentative native');
    assert.match(m.etat().erreur, /natif : refusé/, 'la raison est gardée (⚙ › Apparence)'); assert.notEqual(m.etat().source, 'CoreMotion');
    racine.classList.replace('px-mode-accueil', 'px-mode-ploxion'); racine.classList.replace('px-mode-ploxion', 'px-mode-accueil');
    await new Promise(ok => setTimeout(ok, 30)); assert.equal(n, 1, 'un échec est définitif pour la session');
  } finally { p.fin(); }
});
