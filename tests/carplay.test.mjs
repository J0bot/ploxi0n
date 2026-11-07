// 🚗 (0.99.31) le modèle CarPlay : les potes triés par distance avec leur direction, les rendez-vous, l'itinéraire dans Plans, les sons
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { modeleCarPlay, cardinal, URL_PLANS } from '../src/bions/carplay.js';

test('🚗 la direction en mots, l\'itinéraire en voiture', () => {
  assert.equal(cardinal(0), 'au nord'); assert.equal(cardinal(44), 'au nord-est'); assert.equal(cardinal(-90), 'à l\'ouest'); assert.equal(cardinal(359), 'au nord');
  assert.equal(URL_PLANS(46.5, 6.6), 'maps://?daddr=46.50000,6.60000&dirflg=d');
});
test('🚗 les potes (les plus proches d\'abord), les rendez-vous dédoublonnés, les sons', () => {
  const t = 1000000, moi = { lat: 46.52, lng: 6.63 };
  const m = modeleCarPlay({ maintenant: t, potes: { moi, rdv: { lat: 46.53, lng: 6.63, nom: 'ici' }, positions: [
    { fp: 'b', nom: 'Léa', lat: 46.5, lng: 6.63, t: t - 200000, rdv: { lat: 46.519, lng: 6.629, nom: 'la fontaine' } },
    { fp: 'a', nom: 'Tom', lat: 46.521, lng: 6.631, t: t - 1000, rdv: { lat: 46.519, lng: 6.629, nom: 'la fontaine' } } ] },
    sons: [['pluie', 'pluie', '⁝'], ['feu', 'feu', '△']], volumes: { feu: 0.6 } });
  const [potes, amb] = m.onglets;
  assert.deepEqual(potes.sections.map(s => s.titre), ['rendez-vous', 'mes potes']);
  assert.deepEqual(potes.sections[1].items.map(i => i.texte), ['Tom', 'Léa']);
  assert.match(potes.sections[1].items[0].detail, /^1\d0 m au nord-est · à l'instant$/);
  assert.match(potes.sections[1].items[1].detail, /^2,2 km au sud · il y a 3 min$/);
  assert.equal(potes.sections[0].items.length, 2, 'le mien + la fontaine une seule fois'); assert.equal(potes.sections[0].items[0].id, 'rdv:moi');
  assert.ok(potes.sections[1].items.every(i => i.url.startsWith('maps://?daddr=')));
  assert.deepEqual(amb.sections.map(s => s.titre), ['en cours', 'les sons']); assert.equal(amb.sections[1].items[1].detail, 'joue · 60 %');
  const vide = modeleCarPlay({});
  assert.deepEqual(vide.onglets[0].sections, []); assert.ok(vide.onglets[0].vide);
});
