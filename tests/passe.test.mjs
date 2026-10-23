// ○ (0.97) le zoom de temps (le passé : les seaux d'un palier, à l'envers) et la map en 3 × 3 (les diagonales), le temps sur la map
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grouper, seau, PALIERS } from '../src/lot/passe.js';
import { diagonales, voisins, ilYa, servi, FENETRES } from '../src/app/map-hubs.js';

test('○ le passé : chaque palier regroupe, à l\'envers ; aux grands paliers un ploxion = une ligne', () => {
  const h = 3600e3, t0 = new Date(2026, 9, 22, 18).getTime();
  const evs = [{ genre: 'ploxion', id: 'map', t: t0, sec: 60 }, { genre: 'ploxion', id: 'map', t: t0 - h, sec: 30 }, { genre: 'tsoin', k: 'idée', t: t0 - 2 * h },
    { genre: 'ploxion', id: 'jeu', t: t0 - 30 * h, sec: 600 }, { genre: 'ploxion', id: 'map', t: t0 - 10 * 24 * h, sec: 5 }];
  assert.deepEqual(PALIERS.map(p => p[0]), ['heure', 'jour', 'semaine', 'mois']);
  const heures = grouper(evs, 'heure'); assert.equal(heures.length, 5); assert.equal(heures[0].l[0].id, 'map');
  const jours = grouper(evs, 'jour'); assert.equal(jours.length, 3);
  const auj = jours[0]; assert.equal(auj.l.find(x => x.id === 'map').n, 2, 'deux visites, une ligne'); assert.equal(auj.l.find(x => x.id === 'map').sec, 90);
  assert.equal(auj.l[0].genre, 'tsoin', 'les tsoins d\'abord');
  assert.ok(grouper(evs, 'mois').length <= 2);
  assert.match(seau(t0, 'jour')[1], /jeudi 22 octobre/);
});

test('▦ la map en 3 × 3 : les coins ; le temps sur les koins', () => {
  const H = (id, p) => [id, { id, template: 'hub', portals: p }];
  // centre C ; haut H, gauche G ; le gauche de H est HG
  const hubs = new Map([H('C', ['', 'G', 'H', '']), H('H', ['', 'HG', '', 'C']), H('G', ['C', '', '', '']), H('HG', ['H', '', '', ''])]);
  assert.equal(voisins(hubs, 'C').haut, 'H');
  const d = diagonales(hubs, 'C');
  assert.equal(d.hg, 'HG'); assert.equal(d.bd, null);
  const t = Date.now();
  assert.equal(ilYa(t - 14 * 86400e3, t), 'il y a 2 sem'); assert.equal(ilYa(t - 3 * 3600e3, t), 'il y a 3 h');
  const jour = (n) => { const x = new Date(t - n * 86400e3); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  const usage = { px: { jeu: { lastAt: t - 9 * 86400e3 } }, days: { [jour(9)]: { px: { jeu: { o: 1 } } } } };
  assert.equal(servi(usage, 'jeu', FENETRES.find(f => f[0] === 'il y a 2 sem'), t), true);
  assert.equal(servi(usage, 'jeu', FENETRES.find(f => f[0] === 'aujourd\'hui'), t), false);
  assert.equal(servi(usage, 'jeu', FENETRES[0], t), true, 'tout le temps');
});
