// 👁 (0.99.46) piloter de la tête : la couche de l'app (src/app/regard.js) avec un faux natif et un faux DOM ; le Swift déclaré
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { creerRegard } from '../src/app/regard.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';

function monde() {
  const ecoute = {}, touches = [], ajoutes = [];
  const bouton = { closest: (s) => bouton, click: () => touches.push('bouton'), focus() {}, getAttribute: (k) => (k === 'aria-label' ? 'ouvrir Proche' : null), textContent: 'Proche', tagName: 'BUTTON' };
  const el = () => ({ className: '', setAttribute() {}, style: { setProperty() {} }, classList: { add() {}, remove() {} }, remove() { ajoutes.splice(ajoutes.indexOf(this), 1); }, set innerHTML(v) {}, hidden: false });
  const D = { createElement: () => el(), body: { appendChild: (e) => ajoutes.push(e) }, elementsFromPoint: () => [{ closest: () => null }, bouton] };
  const W = { document: D, innerWidth: 400, innerHeight: 800, setTimeout: (f, ms) => setTimeout(f, Math.min(ms, 5)), requestAnimationFrame: (f) => setTimeout(f, 0), CustomEvent: class { constructor(n, o) { this.detail = o.detail; } }, dispatchEvent() {} };
  const natif = { dispo: async () => true, demarrer: async () => ({}), arreter: async () => ({}), sur: (ev, f) => { ecoute[ev] = f; return () => { delete ecoute[ev]; }; } };
  return { W, natif, ecoute, touches, ajoutes };
}

test('👁 mode tête : fixer touche ce qui est sous le point (à travers un calque) ; arrêter nettoie', async () => {
  const M = monde(); const fait = [];
  const R = creerRegard({ W: M.W, natif: M.natif, boxion: creerMemoire(), routeur: { faire: (a) => fait.push(a) } });
  await R.regler('tete'); assert.equal(R.mode(), 'tete'); assert.equal(M.ajoutes.length, 1, 'le point');
  for (let i = 0; i < 40; i++) M.ecoute.visage({ t: i * 33, lacet: 0, tangage: 0 });
  assert.deepEqual(M.touches, ['bouton']); assert.equal(R.api.etat().touche, 'ouvrir Proche');
  await R.regler('non'); assert.equal(R.mode(), 'non'); assert.equal(M.ajoutes.length, 0); assert.equal(M.ecoute.visage, undefined);
});

test('👁 mode regard : un coup de tête change de ploxion, secouer minimise, les ploxions sont prévenus', async () => {
  const M = monde(); const fait = [], recus = [];
  const R = creerRegard({ W: M.W, natif: M.natif, boxion: creerMemoire(), routeur: { faire: (a) => fait.push(a) } });
  await R.regler('regard'); await new Promise(r => setTimeout(r, 80));   // le calibrage automatique (pas de regard ici : il échoue vite) : rien ne se touche pendant
  R.api.sur('gauche', (g) => recus.push(g.geste));
  let t = 10000; for (const l of [0, 0, 0.2, 0.4, 0.45, 0.3, 0.1, 0, 0]) { M.ecoute.visage({ t, lacet: l, tangage: 0 }); t += 66; }
  assert.deepEqual(fait, ['precedente']); assert.deepEqual(recus, ['gauche']);
  t += 1000; for (let i = 0; i < 30; i++) { M.ecoute.visage({ t, lacet: 0.2 * Math.sin(i / 30 * 4 * Math.PI), tangage: 0 }); t += 33; }
  assert.ok(fait.includes('minimiser'), JSON.stringify(fait));
  await R.regler('non');
});

test('👁 sans caméra TrueDepth ou hors iPhone : un refus clair ; le Swift : PloxiRegard déclaré, enregistré derrière l\'AR', async () => {
  const M = monde();
  await assert.rejects(creerRegard({ W: M.W, natif: null, boxion: creerMemoire() }).regler('tete'), /iPhone/);
  await assert.rejects(creerRegard({ W: M.W, natif: { ...M.natif, dispo: async () => false }, boxion: creerMemoire() }).regler('tete'), /TrueDepth/);
  const app = readFileSync(new URL('../ios/App/App/AppDelegate.swift', import.meta.url), 'utf8');
  assert.ok(app.includes('@objc(PloxiRegard)') && app.includes('ARFaceTrackingConfiguration()') && app.includes('notifyListeners("visage"'));
  assert.match(app, /#if !PLOXI0N_SANS_AR\n\s+bridge\?\.registerPluginInstance\(PloxiAR\(\)\)\n\s+bridge\?\.registerPluginInstance\(PloxiRegard\(\)\)/);
  const js = readFileSync(new URL('../src/natif/plugins-app.js', import.meta.url), 'utf8'); assert.ok(js.includes("registerPlugin('PloxiRegard')"));
});
