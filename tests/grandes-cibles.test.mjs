// ♿ (0.99.44) les grandes cibles : auto (seulement quand une aide motrice d'iOS tourne), oui, non ; le CSS (44 points) ; le Swift (assistance)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { creerPrefs, PREFS_DEFAUT } from '../src/app/prefs.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';

function Wfaux() {
  const cl = new Set(), attrs = {};
  const h = { classList: { toggle: (c, on) => { if (on) cl.add(c); else cl.delete(c); }, contains: (c) => cl.has(c), add: (c) => cl.add(c), remove: (c) => cl.delete(c) }, style: { setProperty() {}, removeProperty() {} },
    setAttribute: (k, v) => { attrs[k] = v; }, getAttribute: (k) => attrs[k], removeAttribute: (k) => { delete attrs[k]; }, dataset: {} };
  return { document: { documentElement: h, body: h, querySelector: () => null, querySelectorAll: () => [], head: { appendChild() {} }, createElement: () => ({ style: {}, setAttribute() {} }) }, matchMedia: () => ({ matches: false }), navigator: { userAgent: 'node' }, cl };
}

test('♿ grandes cibles : auto suit iOS, oui force, non coupe', async () => {
  assert.equal(PREFS_DEFAUT.cibles, 'auto');
  const W = Wfaux(); const p = creerPrefs({ boxion: creerMemoire(), W }); await p.pret;
  p.appliquer(); assert.equal(W.cl.has('px-grandes-cibles'), false, 'auto, sans aide : rien');
  W.__ploxiAssistance = true; p.appliquer(); assert.equal(W.cl.has('px-grandes-cibles'), true, 'auto, le regard ou la tête tournent : grandes');
  await p.regler({ cibles: 'non' }); p.appliquer(); assert.equal(W.cl.has('px-grandes-cibles'), false, 'non : jamais');
  W.__ploxiAssistance = false; await p.regler({ cibles: 'oui' }); p.appliquer(); assert.equal(W.cl.has('px-grandes-cibles'), true, 'oui : toujours');
});

test('♿ le CSS donne 44 points aux cibles ; le Swift dit les aides qui tournent ; main.js les écoute', () => {
  const css = readFileSync(new URL('../src/app/app.css', import.meta.url), 'utf8');
  assert.match(css, /\.px-grandes-cibles :is\(button,a\[href\],\[role=button\][^{]*\)\{min-height:44px;min-width:44px/);
  const app = readFileSync(new URL('../ios/App/App/AppDelegate.swift', import.meta.url), 'utf8');
  assert.ok(app.includes('CAPPluginMethod(name: "assistance"') && app.includes('UIAccessibility.isAssistiveTouchRunning') && app.includes('UIAccessibility.isSwitchControlRunning'));
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.ok(main.includes('PloxiApple.assistance()') && main.includes('window.__ploxiAssistance = on'));
});
