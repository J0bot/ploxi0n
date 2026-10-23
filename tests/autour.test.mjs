// ⌖ (0.99.9) autour de moi : les cases (la vie privée), la requête Overpass, la lecture (vérifiée), distance / cap, les propositions, le ploxion
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIES, cellule, requete, lire, distance, cap, fleche, trier, proposer, vecteurGenres, plansLien } from '../src/bions/autour.js';
import { creerAutour } from '../src/lot/autour.js';
import { creerMemoire } from '../src/boxion-local/memoire.js';
import { OVERPASS_ZURICH } from './donnees/overpass-zurich.mjs';

const ICI = { lat: 47.3722, lng: 8.5392 };   // la Bahnhofstrasse

test('⌖ la case : la requête part de son centre, jamais de la position exacte', () => {
  const c = cellule(ICI.lat, ICI.lng);
  assert.equal(c.cle, '4737:853'); assert.equal(c.lat, 47.375); assert.equal(c.lng, 8.535);
  assert.deepEqual(cellule(47.3729, 8.5381).cle, c.cle, 'deux positions de la même case = la même requête');
  const q = requete(c);
  assert.ok(q.includes('around:' + c.rayon + ',47.375,8.535')); assert.ok(!q.includes('47.3722'), 'la position exacte ne part pas');
  assert.ok(q.includes('"amenity"~"^(toilets)$"')); assert.ok(q.startsWith('[out:json]'));
});

test('⌖ lire Overpass : les genres, les ways par leur centre, ce qui est abîmé tombe', () => {
  const l = lire(OVERPASS_ZURICH);
  assert.deepEqual(l.map(x => x.genre), ['toilettes', 'eau', 'cafe', 'bar', 'art', 'parc', 'manger'], 'le banc (hors catégories) et le lieu sans coordonnées tombent');
  const wc = l[0]; assert.equal(wc.nom, 'Züri WC'); assert.equal(wc.glyphe, 'WC'); assert.equal(wc.acces, true); assert.equal(wc.gratuit, true);
  assert.equal(l.find(x => x.genre === 'parc').lat, 47.376);
  assert.equal(l.find(x => x.genre === 'eau').nom, 'eau potable', 'sans nom : le nom de sa catégorie');
  assert.deepEqual(lire(null), []); assert.deepEqual(lire({ elements: 'x' }), []);
  for (const c of CATEGORIES) assert.ok(!/\p{Extended_Pictographic}/u.test(c[1]), 'le glyphe ' + c[1] + ' passe le filtre anti-emoji');
});

test('⌖ distance, cap, flèche ; trier du plus proche au plus loin', () => {
  const d = distance(ICI, { lat: 47.3812, lng: 8.5392 }); assert.ok(Math.abs(d - 1000) < 5, 'un centième de degré de latitude ≈ 1 km : ' + d);
  assert.ok(Math.abs(cap(ICI, { lat: 47.38, lng: ICI.lng }) - 0) < 1); assert.ok(Math.abs(cap(ICI, { lat: ICI.lat, lng: 8.55 }) - 90) < 1);
  assert.equal(fleche(0), '↑'); assert.equal(fleche(90), '→'); assert.equal(fleche(200), '↓'); assert.equal(fleche(90, 90), '↑', 'relatif à ta direction');
  for (let d = 0; d < 360; d += 45) assert.ok(!/\p{Extended_Pictographic}/u.test(fleche(d)), 'la flèche passe le filtre : ' + fleche(d));
  const t = trier(lire(OVERPASS_ZURICH), ICI); assert.equal(t[0].genre, 'toilettes'); assert.ok(t.every((x, i) => !i || x.d >= t[i - 1].d));
  assert.deepEqual(trier(lire(OVERPASS_ZURICH), ICI, { genres: ['bar'] }).map(x => x.nom), ['Kronenhalle Bar']);
  assert.match(plansLien(t[0]), /^https:\/\/maps\.apple\.com\/\?daddr=47\.372,8\.539&dirflg=w/);
});

test('⌖ proposer : l\'heure et le vecteur xerion ; jamais deux fois le même genre, ni les toilettes', () => {
  const l = lire(OVERPASS_ZURICH);
  const matin = proposer(l, ICI, { heure: 8 }); assert.equal(matin[0].genre, 'cafe');
  const soir = proposer(l, ICI, { heure: 21, usage: { synthe: { opens: 30, seconds: 9000 } } }); assert.equal(soir[0].genre, 'bar', 'le soir, et tu fais de la musique');
  assert.ok(soir.every(x => x.genre !== 'toilettes')); assert.equal(new Set(soir.map(x => x.genre)).size, soir.length);
  assert.ok(vecteurGenres({ cuisine: { seconds: 100 } }).manger === 1);
});

test('⌖ le ploxion : situer, charger la case (puis le cache), poser son lieu', async () => {
  const boxion = creerMemoire(), demandes = [];
  const http = { async get(u) { demandes.push(u); return { status: 200, texte: JSON.stringify(OVERPASS_ZURICH) }; } };
  const W = { setInterval: () => 1, clearInterval: () => {}, open: () => {} };
  const a = creerAutour({ W, boxion, http, position: async () => ({ ...ICI, precision: 12 }) });
  await a.pret; await a.situer();
  assert.ok(demandes.length >= 1 && demandes.every(u => u.startsWith('https://overpass-api.de/api/interpreter?data=')));
  assert.ok(demandes.every(u => !decodeURIComponent(u).includes('47.3722')), 'jamais la position exacte');
  assert.equal(a.etat().lieux.length, 7);
  const n = demandes.length;
  const b = creerAutour({ W, boxion, http, position: async () => ICI }); await b.situer();
  assert.equal(demandes.length, n, 'la case est en cache (3 jours)');
  const m = await a.poser('mien', 'le banc du lac'); assert.equal(m.nom, 'le banc du lac'); assert.ok((await boxion.get('reglages', 'autour-miens')).length === 1);
});
