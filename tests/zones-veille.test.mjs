// 🗺 (0.99.59) les zones de la veille, pour la mini-carte du widget mappion
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zonesVeille, niveauZone } from '../src/bions/zones-veille.js';

test('🗺 les visites proches se regroupent en une zone pondérée par le temps ; les niveaux de mappion', () => {
  const h = 3600e3, T = 1e12;
  const visites = [
    { a: T, d: T + 8 * h, la: 46.5200, lo: 6.6300 }, { a: T + 10 * h, d: T + 12 * h, la: 46.5203, lo: 6.6302 },   // la maison (10 h)
    { a: T + 13 * h, d: T + 13.5 * h, la: 46.5300, lo: 6.6400 },   // un café (30 min)
    { a: T + 14 * h, la: 46.5400, lo: 6.6500 },   // tu y es encore (2 h, maintenant)
    { a: T + 15 * h, d: T + 15 * h + 30e3, la: 46.55, lo: 6.66 },   // 30 s : ignorée
  ];
  const r = zonesVeille({ visites, points: [{ t: T + 15.9 * h, la: 46.5401, lo: 6.6501 }], maintenant: T + 16 * h });
  assert.equal(r.zones.length, 3);
  assert.equal(r.zones[0].n, 2); assert.equal(r.zones[0].s, 10 * 3600); assert.equal(r.zones[0].niveau, 2); assert.equal(r.zones[0].nom, 'zone habituelle');
  assert.ok(r.zones[0].lat > 46.52 && r.zones[0].lat < 46.5203, 'le centre, entre les deux visites');
  assert.equal(r.zones[1].s, 7200, 'en cours : jusqu\'à maintenant'); assert.equal(r.zones[2].niveau, 0);
  assert.ok(r.zones.every(z => z.rayon >= 40));
  assert.deepEqual(r.moi, { lat: 46.54, lng: 6.65 }, 'la visite en cours : tu y es maintenant');
  assert.equal(niveauZone(0), 0); assert.equal(niveauZone(3600), 1); assert.equal(niveauZone(20 * 3600), 3);
  assert.deepEqual(zonesVeille({ maintenant: 1 }), { zones: [], moi: null });
});

test('🗺 le chemin jusqu\'au widget : l\'app écrit « ploxi0n.carte », l\'AppDelegate la copie, l\'extension la dessine (MapKit) pour mappion', async () => {
  const { readFileSync } = await import('node:fs');
  const lire = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
  const m = lire('src/main.js'), a = lire('ios/App/App/AppDelegate.swift'), w = lire('ios/App/PloxionWidgets/PloxionWidgets.swift');
  assert.match(m, /widgetsPx\.ecrireBrut\('ploxi0n\.carte', JSON\.stringify\(\{ \.\.\.r, le: Date\.now\(\) \}\)\)/);
  assert.match(a, /"ploxi0n\.controles", "ploxi0n\.carte"\] \{/);
  assert.match(w, /^import MapKit/m); assert.match(w, /func miniCarte\(_ taille: CGSize\) async -> \(UIImage\?, String\)/);
  assert.match(w, /\["mappion", "mapion"\]\.contains\(e\.id\)/); assert.match(w, /containerBackground\(for: \.widget\) \{ FondPx\(e: e\) \}/);
  assert.match(w, /e\.fiche = \(f\["d"\] as\? String\)/, '◈ la fiche du xerploxion');
  assert.match(w, /URL\(string: "ploxi0n:\/\/xer\/" \+ id\.dropFirst\(4\)\)/, 'un xer ouvre ploxi0n://xer/<mode>');
});
