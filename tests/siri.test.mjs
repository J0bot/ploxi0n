// 🗣 (0.99.44, RS-7 : « que ça marche avec Siri et Apple Intelligence, genre ouvre le ploxion mappion ; lui feed notre langage, et que je puisse
// parler en anglais ») : les synonymes des ploxions, la liste publiée (internes compris), les phrases anglaises et françaises, les autres noms
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { synonymes, corriger } from '../src/natif/vocabulaire.js';
import { creerRaccourcis } from '../src/natif/raccourcis.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { fichier, phrases } from '../tools/siri-phrases.mjs';

const lire = (c) => readFileSync(new URL('../' + c, import.meta.url), 'utf8');

test('🗣 les synonymes : nos mots et leurs déformations, sans article, sans mots trop larges', () => {
  const m = synonymes({ id: 'mappion', nom: 'Mappion' });
  for (const x of ['mappion', 'map ion', 'mapion', 'ploxion mappion']) assert.ok(m.includes(x), x);
  assert.ok(!m.includes('map'), '« map » est la carte, pas mappion');
  assert.ok(synonymes({ id: 'journal-tsoins', nom: 'le journal des tsoins' }).includes('journal des tsoins'));
  assert.ok(synonymes({ id: 'x', nom: 'y'.repeat(5) }).length <= 16);
  assert.equal(corriger('open map ion'), 'open mappion'); assert.equal(corriger('la map'), 'la map');
});

test('🗣 la liste pour Siri : les internes aussi (Proche, Autour), avec leurs synonymes ; pas l\'accueil', async () => {
  let ecrit = null;
  const R = creerRaccourcis({ W: { Capacitor: { isNativePlatform: () => true } }, routeur: {}, boxion: creerMemoire(), charger: async () => ({ Preferences: { set: async (o) => { ecrit = o; }, get: async () => ({ value: null }) } }) });
  await R.publier([{ id: 'accueil', nom: 'accueil' }, { id: 'proche', nom: 'Proche', icone: '◉', interne: true }, { id: 'mappion', nom: 'Mappion', icone: '🧿' }]);
  const l = JSON.parse(ecrit.value);
  assert.deepEqual(l.map(p => p.id), ['proche', 'mappion']);
  assert.ok(l[0].syn.includes('nearby') && l[1].syn.includes('map ion'));
});

test('🗣 Swift : l\'entité porte les synonymes ; « open the ploxion … » ; la liste relue quand elle change ; ploxion et xerboxion comme noms de l\'app', () => {
  const r = lire('ios/App/App/Raccourcis.swift'), app = lire('ios/App/App/AppDelegate.swift'), plist = lire('ios/App/App/Info.plist');
  assert.match(r, /synonyms: syn\.map/); assert.match(r, /if #available\(iOS 17\.0, \*\) \{\n\s+return DisplayRepresentation\(title: "\\\(nom\)", subtitle: "\\\(icone\) ploxion", synonyms:/, '(0.99.49) les synonymes : iOS 17 seulement, l\'app va jusqu\'à iOS 15 (le build 0.99.48 a échoué là)'); assert.match(r, /syn: Array\(\(\(p\["syn"\]/);
  assert.ok(r.includes('"Open the ploxion \\(\\.$ploxion) in \\(.applicationName)"'));
  for (const p of phrases(r)) assert.ok(p.includes('${applicationName}'), 'chaque phrase nomme l\'app : ' + p);
  assert.ok(app.includes('if px != ploxionsVus') && app.includes('RaccourcisPloxi0n.updateAppShortcutParameters()'));
  assert.match(plist, /<key>INAlternativeAppNames<\/key>[\s\S]*<string>ploxion<\/string>[\s\S]*<string>xerboxion<\/string>/);
});

test('🗣 le Siri français : fr.lproj/AppShortcuts.strings à jour (node tools/siri-phrases.mjs), chaque phrase une fois, ajouté par fastlane', () => {
  const { texte, manque } = fichier(lire('ios/App/App/Raccourcis.swift'));
  assert.deepEqual(manque, []); assert.equal(lire('ios/App/App/fr.lproj/AppShortcuts.strings'), texte);
  const valeurs = [...texte.matchAll(/= "([^"]+)";/g)].map(x => x[1]); assert.equal(new Set(valeurs).size, valeurs.length);
  const f = lire('fastlane/Fastfile'); assert.ok(f.includes('def ajouter_phrases_siri') && f.includes('      ajouter_phrases_siri\n'));
});
