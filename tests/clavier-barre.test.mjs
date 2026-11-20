// ⌨ (20.11, RS-7 #2128 : « je ne peux pas utiliser les koins là ») la barre ∧ ∨ ✓ du clavier d'iOS : coupée de base ; elle flottait sur
// les koins du bas (iOS 26). Natif seulement, jamais d'erreur ; une bascule unique pour les réglages déjà rangés ; le redimensionnement
// natif écrit en clair (le bas de la page reste au-dessus du clavier).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { barreClavier } from '../src/natif/clavier-ios.js';
import { creerPrefs, PREFS_DEFAUT } from '../src/app/prefs.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';

const natif = (on) => ({ Capacitor: { isNativePlatform: () => on } });
function faux(erreur = null) {
  const appels = []; let charges = 0;
  const charger = async () => { charges++; return { Keyboard: { setAccessoryBarVisible: async (o) => { if (erreur) throw erreur; appels.push(o); } } }; };
  return { appels, charger, charges: () => charges };
}
const Wprefs = () => ({ matchMedia: () => ({ matches: false }), document: { documentElement: { classList: { toggle() {} }, setAttribute() {}, getAttribute: () => null } } });

test('⌨ la barre ∧ ∨ ✓ : rien hors iPhone, coupée de base sur l\'iPhone, rallumée seulement si on le demande', async () => {
  const web = faux();
  assert.equal(await barreClavier(false, { W: natif(false), charger: web.charger }), false);
  assert.equal(await barreClavier(true, { W: {}, charger: web.charger }), false);
  assert.equal(web.charges(), 0, 'hors iPhone, le plugin n\'est même pas chargé');
  const f = faux();
  assert.equal(await barreClavier(undefined, { W: natif(true), charger: f.charger }), true);
  assert.equal(await barreClavier(PREFS_DEFAUT.barreClavier !== false, { W: natif(true), charger: f.charger }), true, 'comme main.js, avec les réglages de base');
  assert.equal(await barreClavier(true, { W: natif(true), charger: f.charger }), true);
  assert.deepEqual(f.appels, [{ isVisible: false }, { isVisible: false }, { isVisible: true }]);
  const ko = faux(new Error('"Keyboard" plugin is not implemented on ios'));
  assert.equal(await barreClavier(false, { W: natif(true), charger: ko.charger }), false, 'un plugin absent : pas d\'erreur');
  assert.equal(await barreClavier(false, { W: natif(true), charger: async () => { throw new Error('import'); } }), false);
});

test('⌨ les réglages : coupée de base ; les réglages rangés avec l\'ancienne valeur basculent une fois ; un choix fait après reste', async () => {
  assert.equal(PREFS_DEFAUT.barreClavier, false);
  assert.equal(PREFS_DEFAUT.barreClavierVue, true, 'la marque est dans les défauts : un réglage rangé par une installation neuve ne rebascule jamais');
  // une installation neuve
  const neuf = creerPrefs({ W: Wprefs(), boxion: creerMemoire() }); await neuf.pret;
  assert.equal(neuf.lire().barreClavier, false);
  // les réglages d'avant le 20.11 (tous les défauts y sont rangés, la barre allumée)
  const b = creerMemoire();
  const avant = { ...PREFS_DEFAUT, barreClavier: true }; delete avant.barreClavierVue;
  await b.put('reglages', 'app', avant);
  const p = creerPrefs({ W: Wprefs(), boxion: b }); await p.pret;
  assert.equal(p.lire().barreClavier, false, 'la barre repasse à coupée');
  const range = await b.get('reglages', 'app');
  assert.equal(range.barreClavier, false); assert.equal(range.barreClavierVue, true); assert.equal(range.mode, PREFS_DEFAUT.mode, 'le reste est gardé');
  // rallumée dans ⚙ › Navigation : elle reste allumée aux lancements suivants
  await p.regler({ barreClavier: true });
  const ecrits = []; const put = b.put.bind(b); b.put = async (...a) => { ecrits.push(a); return put(...a); };
  const p2 = creerPrefs({ W: Wprefs(), boxion: b }); await p2.pret;
  assert.equal(p2.lire().barreClavier, true);
  assert.equal(ecrits.length, 0, 'rien n\'est réécrit');
});

test('⌨ le redimensionnement natif est écrit en clair ; personne d\'autre ne rallume la barre ; ⚙ dit ce qu\'elle est', () => {
  const conf = JSON.parse(readFileSync(new URL('../capacitor.config.json', import.meta.url), 'utf8'));
  assert.equal(conf.plugins.Keyboard.resize, 'native', 'la vue web rétrécit au-dessus du clavier : la bande de koins reste visible');
  const reglages = readFileSync(new URL('../src/app/reglages.js', import.meta.url), 'utf8');
  assert.ok(reglages.includes('data-pb="barreClavier"\', P.barreClavier === true, \'La barre ∧ ∨ ✓ du clavier\''));
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.ok(!/setAccessoryBarVisible/.test(main), 'main.js passe par barreClavier()');
});
