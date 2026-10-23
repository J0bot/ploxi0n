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
  const osm = () => demandes.filter(u => !u.includes('sharedmobility'));
  assert.ok(osm().length >= 1 && osm().every(u => u.startsWith('https://overpass-api.de/api/interpreter?data=')));
  assert.equal(demandes.filter(u => u.includes('sharedmobility')).length, 1, 'à Zurich : les trottinettes de la case (0.99.15)');
  assert.ok(demandes.every(u => !decodeURIComponent(u).includes('47.3722')), 'jamais la position exacte');
  assert.equal(a.etat().lieux.length, 7);
  const n = osm().length;
  const b = creerAutour({ W, boxion, http, position: async () => ICI }); await b.situer();
  assert.equal(osm().length, n, 'la case est en cache (3 jours)');
  const m = await a.poser('mien', 'le banc du lac'); assert.equal(m.nom, 'le banc du lac'); assert.ok((await boxion.get('reglages', 'autour-miens')).length === 1);
});

// ---- (0.99.15) la boussole et les trottinettes en direct (sharedmobility.ch) ----
import { capBoussole, lireVehicules, requeteVehicules, enSuisse, cellule as celluleSm, fleche as flecheSm } from '../src/bions/autour.js';

test('⌖ la boussole : WebKit (ou CoreMotion), sinon alpha absolu ; la flèche devient relative', () => {
  assert.equal(capBoussole({ webkitCompassHeading: 90 }), 90);
  assert.equal(capBoussole({ webkitCompassHeading: -1, absolute: true, alpha: 30 }), 330);
  assert.equal(capBoussole({ alpha: 30 }), null);
  assert.equal(capBoussole(null), null);
  assert.equal(flecheSm(0, 90), '←');   // le nord, quand on regarde l'est : à gauche
  assert.equal(flecheSm(90, 90), '↑');
});

test('⌖ sharedmobility.ch : lu avec tolérance ; les voitures et ce qui est pris sont laissés ; la case, pas la position', () => {
  const c = celluleSm(47.3769, 8.5417);
  assert.equal(requeteVehicules(c), 'https://api.sharedmobility.ch/v1/sharedmobility/identify?Geometry=' + c.lng + ',' + c.lat + '&Tolerance=' + c.rayon + '&offset=0&geometryFormat=esrijson');
  assert.ok(enSuisse({ lat: 47.37, lng: 8.54 })); assert.ok(!enSuisse({ lat: 48.85, lng: 2.35 }));
  const l = lireVehicules({ results: [
    { id: 'a', geometry: { x: 8.54, y: 47.37 }, attributes: { provider_id: 'tier', vehicle_type: ['E-Scooter'], available: true } },
    { featureId: 'b', geometry: { x: 8.541, y: 47.371 }, attributes: { 'ch.bfe.sharedmobility.provider.id': 'publibike', 'ch.bfe.sharedmobility.vehicle_type': 'E-Bike', station_name: 'Central' } },
    { id: 'c', geometry: { type: 'Point', coordinates: [8.542, 47.372] }, properties: { provider_name: 'Donkey', vehicle_type: 'Bike' } },
    { id: 'd', geometry: { x: 8.54, y: 47.37 }, attributes: { provider_id: 'mobility', vehicle_type: ['Car'], available: true } },
    { id: 'e', geometry: { x: 8.54, y: 47.37 }, attributes: { provider_id: 'tier', vehicle_type: ['E-Scooter'], available: false } },
    { id: 'f', geometry: {}, attributes: { vehicle_type: ['E-Scooter'] } },
  ] });
  assert.deepEqual(l.map(x => [x.id, x.sorte, x.nom]), [['sm-a', 'trottinette', 'trottinette · tier'], ['sm-b', 'vélo électrique', 'Central'], ['sm-c', 'vélo', 'vélo · Donkey']]);
  assert.ok(l.every(x => x.genre === 'velo' && x.direct));
  assert.deepEqual(lireVehicules(null), []); assert.deepEqual(lireVehicules({ results: 'x' }), []);
});
