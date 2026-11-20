// ⬡ (0.99.63) le xer xerboxion natif : les onglets, les sections, le filtre, une tuile ouvre, un xer change de mode
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerXerXerboxion, sections, filtrer, ONGLETS } from '../src/app/xer-xerboxion.js';
import { page } from './aide.mjs';

const INST = [{ id: 'mappion', nom: 'Mappion', categorie: 'outils' }, { id: 'proche', nom: 'Proche', interne: true, bions: ['jOSNatif'] }, { id: 'quetes', nom: 'Quêtes', categorie: 'jeux' }, { id: 'xer-en-ligne', nom: 'Mon xer en ligne', interne: true }];
const LABO = [{ id: 'a', nom: 'Alpha', categorie: 'outils' }, { id: 'b', nom: 'Beta', categorie: 'outils' }, { id: 'c', nom: 'Gamma', categorie: 'jeux', description: 'un jeu de cartes' }];

test('⬡ les sections : bureau (par usage), labo (par catégorie, la plus grande d\'abord), capteurs (le natif), quêtes, xers', () => {
  assert.deepEqual(ONGLETS.map(o => o[0]), ['bureau', 'labo', 'capteurs', 'quetes', 'xers']);
  assert.equal(sections('bureau', { installes: INST, usage: { quetes: { seconds: 99 } } })[0].items[0].id, 'quetes', 'le plus utilisé d\'abord');
  assert.deepEqual(sections('labo', { installes: INST, labo: LABO }).map(s => [s.titre, s.items.length]), [['outils', 2], ['jeux', 1]]);
  assert.deepEqual(sections('capteurs', { installes: INST })[0].items.map(p => p.id), ['proche']);
  assert.deepEqual(sections('quetes', { installes: INST, labo: LABO })[0].items.map(p => p.id), ['quetes']);
  const x = sections('xers', { installes: INST, modes: [{ id: 'chill-tekk', nom: 'chill-tekk', on: true }, { id: 'xerbot', nom: 'xerbot' }] })[0].items;
  assert.deepEqual(x.map(p => p.id), ['xer:chill-tekk', 'xer:xerbot', 'xer-en-ligne']);
  assert.deepEqual(filtrer(LABO, 'cartes').map(p => p.id), ['c'], 'la description aussi');
});

test('⬡ le panneau : en-tête du labo, onglets, une tuile ouvre son ploxion, un xer change de mode, la page du labo à un toucher', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, place = D.createElement('div'); D.body.appendChild(place);
    const ouverts = [], modes = []; let enLigne = 0;
    const x = creerXerXerboxion({ W, installes: () => INST, labo: async () => LABO, ouvrir: (id) => ouverts.push(id), choisirMode: (m) => modes.push(m),
      modes: () => [{ id: 'xerbot', nom: 'xerbot' }], enLigne: () => enLigne++ });
    x.monter(place); await new Promise(r => setTimeout(r, 20));
    assert.match(place.querySelector('[data-xbx-compte]').textContent, /^3 ploxions · 2 cubions$/);
    place.querySelector('[data-xbx-onglet="labo"]').click();
    assert.equal(place.querySelectorAll('.px-xbx-s').length, 2);
    place.querySelector('[data-xbx-id="b"]').click(); assert.deepEqual(ouverts, ['b']);
    const q = place.querySelector('[data-xbx-q]'); q.value = 'gam'; q.dispatchEvent(new W.Event('input', { bubbles: true }));
    assert.deepEqual([...place.querySelectorAll('[data-xbx-id]')].map(b => b.getAttribute('data-xbx-id')), ['c']);
    x.filtre(''); place.querySelector('[data-xbx-onglet="xers"]').click();
    place.querySelector('[data-xbx-xer="xerbot"]').click(); assert.deepEqual(modes, ['xerbot']);
    place.querySelector('[data-xbx-enligne]').click(); assert.equal(enLigne, 1);
    // gardé d'un dessin de l'accueil à l'autre : le même panneau, le même onglet
    const autre = D.createElement('div'); D.body.appendChild(autre); x.monter(autre); assert.equal(x.onglet(), 'xers'); assert.ok(autre.querySelector('.px-xbx'));
  } finally { p.fin(); }
});
