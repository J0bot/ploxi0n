// 🫧 L'HAPTIQUE SELON L'USAGE (0.63, RS-7 : « il faut que ça soit plus smooth et plein haptics selon l'utilisation ») : le niveau, les classes
// (tic · marque · acte), le débit à l'horloge truquée, les motifs de l'app, la migration « page = rien », la densité, la signature par fx-ouvrir,
// la session de crans de jOSNatif (le module des Haptics gardé, UN selectionChanged par cran) et navigator.vibrate qui passe par jOSNatif.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { creerHaptique, creerDebit, creerFenetre, EVENEMENTS, CLASSES, MOTIFS_APP } from '../src/natif/haptique.js';
import { installerJosNatif } from '../src/natif/jos-natif.js';
import { installerWebNatif } from '../src/natif/web-natif.js';

/** une haptique à l'horloge truquée : h.t = le temps (ms), joue = les styles envoyés au natif */
async function banc({ boxion = creerMemoire(), natif, actif = () => true, attendre = async () => {} } = {}) {
  const joue = [], horloge = { t: 1000 };
  const n = natif || { vibrer: async (s) => { joue.push(s); } };
  const h = creerHaptique({ boxion, natif: () => n, actif, attendre, maintenant: () => horloge.t });
  await h.pret;
  const apres = (ms) => { horloge.t += ms; };
  return { h, joue, horloge, apres, boxion };
}

test('les événements de la fractale : groupe, classe, défaut ; les anciens ont leur classe', async () => {
  const fx = EVENEMENTS.filter(e => e[2] === 'fractale').map(e => e[0]);
  assert.equal(fx.length, 28);
  assert.ok(fx.every(k => k.startsWith('fx-')), 'le groupe fractale = les fx-*');
  assert.ok(EVENEMENTS.filter(e => e[2] === 'fractale').every(e => typeof e[3] === 'string' && e[3]), 'chacun a sa famille');
  for (const k of fx) assert.ok(['tic', 'marque', 'acte'].includes(CLASSES[k]), k);
  assert.equal(CLASSES['fx-carte'], 'tic'); assert.equal(CLASSES['fx-engage'], 'marque'); assert.equal(CLASSES['fx-cube'], 'acte');
  assert.equal(CLASSES.page, 'tic'); assert.equal(CLASSES['bord-seuil'], 'marque'); assert.equal(CLASSES.bord, 'acte'); assert.equal(CLASSES.vue, 'marque');
  const { h } = await banc();
  const ev = h.config().evenements;
  for (const k of fx) assert.ok(ev[k], 'un défaut pour ' + k);
  assert.equal(ev['fx-slider'], 'motif:fx-slider'); assert.equal(ev['fx-face'], 'moyen'); assert.equal(ev['fx-ouvrir'], 'leger');
});

test('le niveau décale le style résolu sur selection · leger · moyen · fort (borné) ; succès, erreur et motifs intacts', async () => {
  const { h, joue, apres } = await banc();
  const essai = (x, niveau) => { apres(200); h.jouer(x, { niveau }); };
  essai('fx-face', 1); essai('fx-face', -1); essai('fx-face', 0);
  essai('fx-carte', -1); essai('fx-carte', 1);
  essai('fort', 1); essai('leger', 5); essai('succes', 1); essai('erreur', -1);
  assert.deepEqual(joue, ['fort', 'leger', 'moyen', 'selection', 'leger', 'fort', 'fort', 'succes', 'erreur']);
  joue.length = 0; apres(200); await h.jouer('fx-cube', { niveau: 1 });
  assert.deepEqual(joue, MOTIFS_APP['fx-cube'].map(p => p[0]), 'un motif ne bouge pas');
});

test('creerDebit : tic (35 ms, 90 ms après un acte, jamais pendant un motif ni 2 appels en vol), marque (25 ms), acte toujours', () => {
  let t = 0; const d = creerDebit({ maintenant: () => t });
  assert.equal(d.passe('acte'), true);
  t = 50; assert.equal(d.passe('tic'), false, '< 90 ms après un acte');
  t = 95; assert.equal(d.passe('tic'), true);
  t = 120; assert.equal(d.passe('tic'), false, '< 35 ms après le dernier');
  t = 131; assert.equal(d.passe('tic'), true);
  t = 150; assert.equal(d.passe('marque'), false, '< 25 ms');
  t = 157; assert.equal(d.passe('marque'), true);
  t = 158; assert.equal(d.passe('acte'), true, 'un acte passe toujours');
  t = 159; assert.equal(d.passe('acte'), true);
  t = 400; assert.equal(d.passe('tic', { motif: true }), false, 'pendant un motif');
  t = 401; assert.equal(d.passe('tic', { enVol: 2 }), false, '2 appels natifs en vol');
  t = 402; assert.equal(d.passe('tic', { enVol: 1 }), true);
  t = 403; assert.equal(d.passe('marque'), false); t = 430; d.noter(); t = 440; assert.equal(d.passe('marque'), false, 'un pas de motif compte comme le dernier haptique');
});

test('creerDebit : 30/s au plus en fenêtre glissante, les actes exceptés', () => {
  let t = 0; const d = creerDebit({ maintenant: () => t });
  const r = [];
  for (let i = 0; i < 40; i++) { t = i * 26; r.push(d.passe('marque')); }
  assert.equal(r.slice(0, 30).every(Boolean), true, 'les 30 premiers');
  assert.equal(r.slice(30, 39).some(Boolean), false, 'puis sautés (jamais en file)');
  assert.equal(r[39], true, 'la fenêtre a glissé (t = 1014 : le premier est sorti)');
  t = 1015; assert.equal(d.passe('acte'), true, 'fenêtre pleine : l\'acte passe quand même');
  const f = creerFenetre({ plafond: 2, maintenant: () => t });
  assert.equal(f.passe(), true); assert.equal(f.passe(), true); assert.equal(f.passe(), false); assert.equal(f.compte(), 2);
  t += 1000; assert.equal(f.compte(), 0);
});

test('l\'haptique applique le débit : les tics trop serrés sautent, un acte ouvre 90 ms de silence, un acte coupe le motif en cours', async () => {
  let reveil = null; const attendre = () => new Promise(r => { reveil = r; });
  const { h, joue, apres } = await banc({ attendre });
  h.jouer('fx-carte'); apres(10); h.jouer('fx-carte'); apres(40); h.jouer('fx-carte');
  assert.deepEqual(joue, ['selection', 'selection'], 'le 2e tic (10 ms) saute, le 3e (50 ms) passe');
  joue.length = 0; apres(100); h.jouer('fx-apercu'); apres(50); h.jouer('fx-tension'); apres(45); h.jouer('fx-tension');
  assert.deepEqual(joue, ['leger', 'selection'], 'acte, puis le tic à 50 ms saute, celui à 95 ms passe');
  joue.length = 0; apres(200); h.jouer('fx-cube');   // fort … (55 ms) moyen … selection
  assert.deepEqual(joue, ['fort']);
  apres(200); h.jouer('fx-defile'); assert.deepEqual(joue, ['fort'], 'pas de tic pendant un motif');
  apres(5); h.jouer('fx-engage'); assert.deepEqual(joue, ['fort', 'moyen'], 'une marque passe pendant le motif');
  apres(30); h.jouer('fx-fractale'); assert.deepEqual(joue, ['fort', 'moyen', 'moyen'], 'un acte…');
  reveil(); await new Promise(r => setTimeout(r, 5));
  assert.deepEqual(joue, ['fort', 'moyen', 'moyen'], '… a coupé le motif : il ne reprend pas');
  apres(200); h.jouer('fx-defile'); assert.deepEqual(joue.at(-1), 'selection', 'le motif coupé ne bloque plus les tics');
  joue.length = 0; apres(200); h.jouer('fx-carte', { classe: 'acte' }); apres(1); h.jouer('fx-carte', { classe: 'acte' });
  assert.deepEqual(joue, ['selection', 'selection'], 'classe forcée : acte, jamais sauté');
});

test('les tics sautent quand le pont traîne (vibrer.enVol() ≥ 2)', async () => {
  const joue = []; let vol = 0;
  const n = { vibrer: Object.assign(async (s) => { joue.push(s); }, { enVol: () => vol }) };
  const { h, apres } = await banc({ natif: n });
  apres(200); vol = 2; h.jouer('fx-zoom'); assert.deepEqual(joue, []);
  apres(200); vol = 1; h.jouer('fx-zoom'); assert.deepEqual(joue, ['selection']);
  apres(200); vol = 5; h.jouer('fx-koin'); assert.deepEqual(joue, ['selection', 'leger'], 'une marque ne regarde pas le pont');
});

test('MOTIFS_APP : jouables, proposés mais pas « à toi », jamais supprimés ; un motif à toi du même nom passe devant', async () => {
  const { h, joue, apres } = await banc();
  assert.ok(!('fx-cube' in h.config().motifs), 'pas dans « Tes motifs »');
  await h.jouer('fx-freefall-on'); assert.deepEqual(joue, ['leger', 'moyen', 'fort']);
  joue.length = 0; apres(200); await h.jouer('motif:fx-ferme'); assert.deepEqual(joue, ['fort', 'leger'], 'motif:<nom> aussi');
  await h.supprimer('fx-ferme'); joue.length = 0; apres(200); await h.jouer('fx-ferme'); assert.deepEqual(joue, ['fort', 'leger'], 'indélébile');
  await h.assigner('bord', 'motif:fx-carte-xer'); await h.supprimer('fx-carte-xer'); assert.equal(h.config().evenements.bord, 'motif:fx-carte-xer', 'un motif de l\'app assigné reste assigné');
  await h.sauver('fx-cube', [['erreur', 0]]); joue.length = 0; apres(200); await h.jouer('fx-cube'); assert.deepEqual(joue, ['erreur'], 'le tien d\'abord');
  await h.supprimer('fx-cube'); joue.length = 0; apres(200); await h.jouer('fx-cube'); assert.deepEqual(joue, ['fort', 'moyen', 'selection'], 'puis celui de l\'app revient');
  assert.equal(h.config().evenements['fx-cube'], 'motif:fx-cube');
});

test('migration : « changer de page = rien » coupe aussi les crans de la fractale (fx-carte, fx-defile, fx-face), sauf choix explicite', async () => {
  const b1 = creerMemoire(); await b1.put('reglages', 'haptique', { evenements: { page: 'aucun', 'fx-face': 'fort' } });
  const { h } = await banc({ boxion: b1 });
  const e = h.config().evenements;
  assert.equal(e['fx-carte'], 'aucun'); assert.equal(e['fx-defile'], 'aucun'); assert.equal(e['fx-face'], 'fort', 'le choix explicite reste');
  assert.equal(e['fx-zoom'], 'selection', 'les autres crans gardent leur défaut');
  const b2 = creerMemoire(); await b2.put('reglages', 'haptique', { evenements: { page: 'moyen' } });
  const { h: h2 } = await banc({ boxion: b2 });
  assert.equal(h2.config().evenements['fx-carte'], 'selection'); assert.equal(h2.densite(), 'pleine', 'densité par défaut');
});

test('la densité : sobre = les actes, normale = + les marques, pleine = tout ; gardée ; force passe outre', async () => {
  const { h, joue, apres, boxion } = await banc();
  const tour = () => { joue.length = 0; for (const ev of ['fx-apercu', 'fx-engage', 'fx-carte']) { apres(200); h.jouer(ev); } return [...joue]; };
  assert.deepEqual(tour(), ['leger', 'moyen', 'selection'], 'pleine');
  await h.assignerDensite('normale'); assert.deepEqual(tour(), ['leger', 'moyen'], 'normale');
  await h.assignerDensite('sobre'); assert.deepEqual(tour(), ['leger'], 'sobre');
  joue.length = 0; apres(200); h.jouer('fx-carte', { force: true }); assert.deepEqual(joue, ['selection'], 'force (les réglages, ▶)');
  await assert.rejects(() => h.assignerDensite('dense'), /sobre, normale ou pleine/);
  assert.equal((await boxion.get('reglages', 'haptique')).densite, 'sobre');
  const { h: h2 } = await banc({ boxion }); assert.equal(h2.densite(), 'sobre', 'relue');
});

test('jouerPloxion : fx-ouvrir / fx-arrivee = la signature ; « fx-ouvrir = rien » coupe ; c\'est un acte pour le débit', async () => {
  const { h, joue, apres } = await banc();
  await h.jouerPloxion('coord', 'fx-ouvrir'); assert.deepEqual(joue, h.signature('coord').map(p => p[0]));
  joue.length = 0; apres(200); await h.jouerPloxion('coord', 'fx-arrivee'); assert.deepEqual(joue, h.signature('coord').map(p => p[0]));
  apres(30); h.jouer('fx-carte'); assert.equal(joue.length, h.signature('coord').length, 'le tic à 30 ms d\'une ouverture saute');
  await h.assigner('fx-ouvrir', 'aucun'); joue.length = 0; apres(200); await h.jouerPloxion('coord', 'fx-ouvrir'); assert.deepEqual(joue, [], 'coupé');
  apres(200); await h.jouerPloxion('coord', 'ouvrir'); assert.deepEqual(joue, h.signature('coord').map(p => p[0]), '« ouvrir » n\'en dépend pas');
  await h.choisirPloxion('coord', 'fort'); joue.length = 0; apres(200); await h.jouerPloxion('coord', 'fx-arrivee'); assert.deepEqual(joue, ['fort'], 'le choix gagne');
  const coupee = await banc({ actif: () => false }); await coupee.h.jouerPloxion('coord', 'fx-ouvrir'); coupee.h.jouer('fx-cube'); assert.deepEqual(coupee.joue, [], 'haptique coupée');
});

test('haptique.crans : délègue à jOSNatif.crans, équilibré même si l\'haptique est coupée entre-temps', async () => {
  const appels = []; let on = true;
  const n = { vibrer: async () => {}, crans: { debut: () => appels.push('debut'), fin: () => appels.push('fin') } };
  const { h } = await banc({ natif: n, actif: () => on });
  h.crans.debut(); assert.equal(h.crans.ouverte(), true);
  on = false; h.crans.debut(); h.crans.fin(); h.crans.fin();
  assert.deepEqual(appels, ['debut', 'fin'], 'coupée : pas de nouvelle session, mais la fin part');
  assert.equal(h.crans.ouverte(), false);
});

// ---- jOSNatif : le module des Haptics gardé, la session de crans, les appels en vol, 60/s --------------------------------------------------
function iPhone({ natif = true } = {}) {
  const pont = [], minuteries = new Map(), attente = []; let id = 0, chargements = 0, retenir = false;
  const rend = (nom) => (o) => { pont.push(o && o.style ? nom + ':' + o.style : o && o.type ? nom + ':' + o.type : nom); if (!retenir) return Promise.resolve(); return new Promise(r => attente.push(r)); };
  const Haptics = { impact: rend('impact'), notification: rend('notification'), selectionStart: rend('start'), selectionChanged: rend('changed'), selectionEnd: rend('end') };
  const W = { Capacitor: { isNativePlatform: () => natif }, navigator: { vibrate: (d) => { pont.push('web:' + d); return true; } },
    setTimeout: (f, ms) => { minuteries.set(++id, { f, ms }); return id; }, clearTimeout: (i) => { minuteries.delete(i); } };
  const api = installerJosNatif(W, { haptics: async () => { chargements++; return { Haptics, ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM', Heavy: 'HEAVY' }, NotificationType: { Success: 'SUCCESS', Error: 'ERROR' } }; } });
  const sonner = () => { const l = [...minuteries.entries()]; minuteries.clear(); for (const [, m] of l) m.f(); return l.map(([, m]) => m.ms); };
  return { W, api, pont, sonner, minuteries, chargements: () => chargements, retenir: (v) => { retenir = v; }, relacher: () => { while (attente.length) attente.shift()(); } };
}
const tic = () => new Promise(r => setTimeout(r, 0));

test('jOSNatif.vibrer : le module chargé une fois, puis le pont part sans attendre ; succès/erreur ; un cran hors session reste tiède 400 ms', async () => {
  const p = iPhone(); await tic();
  assert.equal(p.chargements(), 1, 'chargé dès l\'installation');
  const r = p.api.vibrer('moyen'); assert.ok(r && typeof r.then === 'function', 'toujours une promesse');
  assert.deepEqual(p.pont, ['impact:MEDIUM'], 'parti tout de suite (synchrone)');
  p.api.vibrer('succes'); p.api.vibrer('erreur'); p.api.vibrer('fort'); p.api.vibrer('inconnu');
  assert.deepEqual(p.pont.slice(1), ['notification:SUCCESS', 'notification:ERROR', 'impact:HEAVY', 'impact:LIGHT']);
  p.pont.length = 0; p.api.vibrer('selection'); p.api.vibrer('selection'); p.api.vibrer('selection');
  assert.deepEqual(p.pont, ['start', 'changed', 'changed', 'changed'], 'un seul start, puis UN aller-retour par cran');
  assert.deepEqual(p.sonner(), [400], 'la session tiède se referme seule');
  assert.equal(p.pont.at(-1), 'end'); await tic();
  p.pont.length = 0; p.api.vibrer('selection'); assert.deepEqual(p.pont, ['start', 'changed'], 'refermée : un cran rouvre');
  assert.equal(p.chargements(), 1, 'jamais rechargé');
  await r;
});

test('jOSNatif.crans : debut() une fois start, chaque tic = un changed, fin() = end ; compté ; une session oubliée se referme (8 s)', async () => {
  const p = iPhone(); await tic();
  p.api.crans.debut(); p.api.crans.debut();
  assert.deepEqual(p.pont, ['start'], 'idempotent côté natif');
  p.api.crans.tic(); p.api.vibrer('selection'); p.api.crans.tic();
  assert.deepEqual(p.pont, ['start', 'changed', 'changed', 'changed']);
  assert.equal(p.api.crans.ouverte(), true);
  await p.api.crans.fin(); assert.equal(p.pont.at(-1), 'changed', 'deux debut() → il faut deux fin()');
  await p.api.crans.fin(); assert.equal(p.pont.at(-1), 'end'); assert.equal(p.api.crans.ouverte(), false);
  await p.api.crans.fin(); assert.equal(p.pont.filter(x => x === 'end').length, 1, 'une fin de trop ne fait rien');
  p.pont.length = 0; p.api.crans.debut(); assert.deepEqual(p.sonner(), [8000]); assert.deepEqual(p.pont, ['start', 'end'], 'oubliée : refermée');
  await p.api.crans.fin(); assert.deepEqual(p.pont, ['start', 'end'], 'la fin tardive ne casse rien');
});

test('jOSNatif.vibrer.enVol() compte les appels pas encore rendus ; 60/s au plus ; hors iPhone : navigator.vibrate, crans = rien', async () => {
  const p = iPhone(); await tic();
  p.retenir(true); p.api.vibrer('leger'); p.api.vibrer('moyen');
  assert.equal(p.api.vibrer.enVol(), 2);
  p.relacher(); await tic(); assert.equal(p.api.vibrer.enVol(), 0);
  assert.ok(p.api.vibrer.stats().rtt >= 0);
  p.retenir(false);
  const avant = p.api.vibrer.stats().joues;
  for (let i = 0; i < 70; i++) p.api.vibrer('leger');
  const s = p.api.vibrer.stats(); assert.equal(s.joues - avant, 58, '60 dans la seconde (2 déjà joués)'); assert.equal(s.sautes, 12);
  const w = iPhone({ natif: false }); await tic();
  assert.equal(w.chargements(), 0, 'pas de module natif hors iPhone');
  await w.api.vibrer('fort'); await w.api.crans.debut(); await w.api.crans.tic(); await w.api.crans.fin();
  assert.deepEqual(w.pont, ['web:40'], 'vibrer → navigator.vibrate ; les crans : rien');
});

test('navigator.vibrate des ploxions passe par jOSNatif.vibrer (le débit, le module gardé), plus par Haptics.impact direct', async () => {
  const { window: W } = new JSDOM('<!doctype html><body></body>', { url: 'capacitor://localhost/' });
  W.Capacitor = { isNativePlatform: () => true };
  const vib = [], directs = [];
  W.jOSNatif = { vibrer: (s) => { vib.push(s); return Promise.resolve(); } };
  installerWebNatif({ W, prefs: () => ({ haptique: true }), charger: { haptics: async () => ({ Haptics: { impact: async (o) => directs.push(o) } }) } });
  W.navigator.vibrate([10, 20, 30, 5, 80]); await new Promise(r => setTimeout(r, 200));
  assert.deepEqual(vib, ['leger', 'moyen', 'fort']); assert.deepEqual(directs, []);
});
