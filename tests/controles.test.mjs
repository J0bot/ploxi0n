// 🎛 (0.99.58, RS-7 : « les trucs dans ce panel marchent pas ») : les boutons du Centre de contrôle passent par une intention qui OUVRE l'app
// (openAppWhenRun), déclarée dans l'app ET dans l'extension (le même nom), et chaque lien a son action dans l'app. Le Swift ne compile pas ici :
// ce test fige ce qui comptait.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const lire = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

test('🎛 aucun bouton ne pose un OpenURLIntent directement ; tous passent par OuvrirLienPloxi0n', () => {
  const w = lire('ios/App/PloxionWidgets/PloxionWidgets.swift');
  assert.ok(!/ControlWidgetButton\(action: OpenURLIntent/.test(w));
  const liens = [...w.matchAll(/ControlWidgetButton\(action: OuvrirLienPloxi0n\("ploxi0n:\/\/([^"]+)"\)\)/g)].map(m => m[1]);
  assert.deepEqual(liens.sort(), ['balade', 'lampe', 'proche', 'px/accueil', 'toilettes', 'tsoin', 'veille', 'vocal']);
  assert.match(w, /struct ControleVeille: ControlWidget/); assert.match(w, /ControleVeille\(\)/);
});

test('🎛 l\'intention existe dans les deux cibles, au caractère près, et ouvre l\'app ; celle de l\'app passe le lien au pont de Capacitor', () => {
  const w = lire('ios/App/PloxionWidgets/PloxionWidgets.swift'), a = lire('ios/App/App/Raccourcis.swift');
  for (const s of [w, a]) {
    assert.match(s, /struct OuvrirLienPloxi0n: AppIntent \{/); assert.match(s, /static var openAppWhenRun: Bool = true/);
    assert.match(s, /@Parameter\(title: "Lien"\) var lien: String/); assert.match(s, /init\(_ lien: String\) \{ self\.lien = lien \}/);
  }
  assert.match(a, /ApplicationDelegateProxy\.shared\.application\(UIApplication\.shared, open: u, options: \[:\]\)/);
  assert.match(a, /^import Capacitor$/m); assert.match(a, /^import UIKit$/m);
});

test('🎛 chaque lien des boutons a son action dans l\'app (src/main.js)', () => {
  const m = lire('src/main.js'), i = m.indexOf('brancherLiens({'), bloc = m.slice(i, m.indexOf('// « Dis à ploxi0n', i));
  for (const h of ['tsoin', 'vocal', 'lampe', 'proche', 'balade', 'toilettes', 'veille']) assert.match(bloc, new RegExp('\\b' + h + ': \\('), h);
});

test('👣 PloxiVeille déclare pas et activites (le Swift), et le faux iPhone aussi', () => {
  const d = lire('ios/App/App/AppDelegate.swift'), f = lire('tools/faux-iphone/faux-iphone.mjs');
  for (const n of ['pas', 'activites']) { assert.match(d, new RegExp('CAPPluginMethod\\(name: "' + n + '"')); assert.match(d, new RegExp('@objc func ' + n + '\\(_ call: CAPPluginCall\\)')); }
  assert.match(f, /\n  pas: \(\) => \(/); assert.match(f, /\n  activites: \(\) => \{/);
  assert.match(d, /if actif \{ ajoutCorps\(&o\) \}/); assert.match(d, /UserDefaults\.standard\.set\(c, forKey: "ploxi\.veille\.capteurs"\)/);
});

test('◉ (0.99.59) le Swift lit la cible d\'une activité lancée par le JS (Autour en direct)', () => {
  const d = lire('ios/App/App/AppDelegate.swift');
  assert.match(d, /cible: call\.getString\("cible"\)\.map \{ String\(\$0\.prefix\(40\)\) \}, cibleM: call\.getDouble\("cibleM"\)\.map \{ max\(0, \$0\) \},\n\s+cibleCap: call\.getDouble\("cibleCap"\),/);
  assert.ok(!/\bTom\b|Léa/.test(d + lire('ios/App/PloxionWidgets/PloxionWidgets.swift')), 'pas de prénoms');
});
