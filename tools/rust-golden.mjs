// 🦀 LA PREUVE (0.99.17) : le cœur Rust (rust/ploxi-coeur, en WASM) rend EXACTEMENT ce que rendent les bions JS, sur les données réelles des tests
// et sur des milliers d'entrées tirées au hasard (graine fixe). Comme le golden de labo-cape : une seule logique, deux langues, aucune dérive.
//   node tools/rust-golden.mjs [chemin.wasm]     (par défaut public/coeur/ploxi_coeur.wasm) ; sort en erreur au premier écart (avec ses exemples)
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerCoeur } from '../src/coeur/rust.js';
import * as P from '../src/bions/proche.js';
import * as A from '../src/bions/autour.js';
import { creerDire, langueDe } from '../src/bions/dire.js';
import { DICOS, LIGNES } from '../src/app/langues.js';
import { OVERPASS_ZURICH } from '../tests/donnees/overpass-zurich.mjs';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** égal à la JS, les nombres à 1e-9 près (sin, cos, atan2 peuvent différer d'un ulp entre V8 et la libm de Rust) */
function egal(a, b, chemin = '') {
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a) && Number.isNaN(b)) return null;
    return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)) ? null : chemin + ' : ' + a + ' ≠ ' + b;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return chemin + ' : longueurs ' + JSON.stringify(a)?.slice(0, 120) + ' ≠ ' + JSON.stringify(b)?.slice(0, 120);
    for (let i = 0; i < a.length; i++) { const e = egal(a[i], b[i], chemin + '[' + i + ']'); if (e) return e; }
    return null;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ks = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of ks) { const e = egal(a[k] === undefined ? null : a[k], b[k] === undefined ? null : b[k], chemin + '.' + k); if (e) return e; }
    return null;
  }
  return (a === undefined ? null : a) === (b === undefined ? null : b) ? null : chemin + ' : ' + JSON.stringify(a) + ' ≠ ' + JSON.stringify(b);
}

// le hasard à graine (mulberry32) : les mêmes cas à chaque fois
function hasard(graine) { let a = graine >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export async function golden(cheminWasm = path.join(RACINE, 'public/coeur/ploxi_coeur.wasm'), { n = 400 } = {}) {
  const C = await chargerCoeur(readFileSync(cheminWasm));
  const r = hasard(7026), choix = (l) => l[Math.floor(r() * l.length)], entre = (a, b) => a + r() * (b - a);
  const ecarts = [], compte = {};
  const verifier = (nom, js, rust) => { compte[nom] = (compte[nom] || 0) + 1; const e = egal(js, rust, nom); if (e && ecarts.length < 12) ecarts.push(e); };
  const jsonPropre = (x) => JSON.parse(JSON.stringify(x === undefined ? null : x));   // ce qui traverse la porte : du JSON

  // ---- proche ----
  const MOTIFS = [...Object.keys(P.MOTIFS), 'mien', 'rien', undefined, 5];
  const unPas = () => choix([null, null, 0, 1, 2, 3, 4, 5, 6, 7, 14, '+0', '+3', 15, -1, 1.5, '+99', 'x']);
  for (let i = 0; i < n; i++) {
    const pas = r() < 0.15 ? Array.from({ length: choix([15, 16, 16, 16, 17]) }, unPas) : Array.from({ length: 16 }, () => choix([null, null, 0, 2, 4, 7, 14, '+0', '+5']));
    const o = { tempo: choix([undefined, 0, 49, 120, 133.6, 250, '90', null]), motif: choix(MOTIFS), pas, tonique: choix([undefined, 20, 36, 36.4, 60, null]), gamme: choix([...Object.keys(P.GAMMES), 'x', undefined]), debut: choix([undefined, 0, entre(0, 1e12)]), volume: choix([undefined, 0.5, 2, -1, null]) };
    const pj = P.partition(o), pr = C.appel('proche.partition', jsonPropre(o));
    verifier('proche.partition', jsonPropre(pj), pr);
    verifier('proche.pasValides', jsonPropre(P.pasValides(pas)), C.appel('proche.pasValides', jsonPropre(pas)));
    const de = pj.debut + entre(-2000, 20000), a = de + entre(0, 4000);
    verifier('proche.notesEntre', P.notesEntre(pj, de, a), C.appel('proche.notesEntre', { p: jsonPropre(o), de, a }));
    verifier('proche.kicksEntre', P.kicksEntre(pj, de, a), C.appel('proche.kicksEntre', { p: jsonPropre(o), de, a }));
    const t = [entre(0, 1e6), entre(0, 1e6), entre(0, 1e6), entre(0, 1e6)].sort((x, y) => x - y);
    verifier('proche.ecart', P.ecart(...t), C.appel('proche.ecart', { t0: t[0], t1: t[1], t2: t[2], t3: t[3] }));
    const ms = Array.from({ length: Math.floor(entre(0, 7)) }, () => ({ decalage: entre(-500, 500), allerRetour: entre(0, 300) }));
    verifier('proche.meilleurEcart', P.meilleurEcart(ms), C.appel('proche.meilleurEcart', ms));
  }

  // ---- autour ----
  const lieux = A.lire(OVERPASS_ZURICH);
  verifier('autour.lire', lieux, C.appel('autour.lire', OVERPASS_ZURICH));
  verifier('autour.lireTexte', lieux, C.appel('autour.lireTexte', JSON.stringify(OVERPASS_ZURICH)));
  const elements = [];
  for (let i = 0; i < 300; i++) {   // une case inventée : tous les genres, des noms, des ways avec center, des tags cassés
    const c = choix(A.CATEGORIES), k = c[3][0].split('|')[0], v = choix(c[3][1].split('|')), lat = 47.37 + entre(-0.01, 0.01), lon = 8.54 + entre(-0.01, 0.01);
    const tags = { [k]: r() < 0.95 ? v : 'autre', ...(r() < 0.6 ? { name: choix(['Züri', 'Café 😀 Ünd', 'x'.repeat(90), '']) } : {}), ...(r() < 0.3 ? { fee: choix(['no', 'yes']) } : {}), ...(r() < 0.3 ? { opening_hours: 'Mo-Fr 08:00-' + 'y'.repeat(entre(0, 100)) } : {}), ...(r() < 0.2 ? { wheelchair: 'yes' } : {}) };
    elements.push(r() < 0.3 ? { type: 'way', id: 1000 + i, center: { lat, lon }, tags } : r() < 0.05 ? { type: 'node', id: 'x' + i, tags } : { type: 'node', id: 2000 + i, lat, lon, tags });
    if (r() < 0.05) elements.push(elements[elements.length - 1]);   // un doublon
  }
  const grand = { elements };
  const lieux2 = A.lire(grand);
  verifier('autour.lire(case inventée)', lieux2, C.appel('autour.lire', grand));
  const tous = [...lieux, ...lieux2];
  for (let i = 0; i < n; i++) {
    const pos = { lat: 47.37 + entre(-0.02, 0.02), lng: 8.54 + entre(-0.02, 0.02) }, b = { lat: entre(-80, 80), lng: entre(-179, 179) };
    verifier('autour.distance', A.distance(pos, b), C.appel('autour.distance', { a: pos, b }));
    verifier('autour.cap', A.cap(pos, b), C.appel('autour.cap', { a: pos, b }));
    const deg = entre(-720, 720), c0 = entre(0, 360);
    verifier('autour.fleche', A.fleche(deg, c0), C.appel('autour.fleche', { deg, cap0: c0 }));
    const lat2 = pos.lat + entre(-30, 30), lng2 = pos.lng + entre(-60, 60), c = A.cellule(lat2, lng2);
    verifier('autour.cellule', c, C.appel('autour.cellule', { lat: lat2, lng: lng2 }));
    verifier('autour.cellule(brut)', A.cellule(pos.lat, pos.lng), C.appel('autour.cellule', { lat: pos.lat, lng: pos.lng }));
    const genres = r() < 0.5 ? null : A.CATEGORIES.filter(() => r() < 0.3).map(x => x[0]);
    verifier('autour.requete', A.requete(c, genres || undefined), C.appel('autour.requete', { c, genres }));
    const max = choix([1, 5, 60, 400]);
    verifier('autour.trier', A.trier(tous, pos, { genres, max }), C.appel('autour.trier', { lieux: tous, pos, genres, max }));
    const usage = Object.fromEntries(Array.from({ length: Math.floor(entre(0, 6)) }, () => [choix(['synthe', 'spotify-chill', 'cuisine', 'art-3d', 'podo-pas', 'passe', 'wiki', 'terrax', 'map', 'clicker']), choix([{ seconds: entre(0, 9000) }, { opens: Math.floor(entre(0, 20)) }, { n: 3 }, {}, null, { temps: '40' }])]));
    verifier('autour.vecteurGenres', A.vecteurGenres(usage), C.appel('autour.vecteurGenres', jsonPropre(usage)));
    const heure = Math.floor(entre(0, 24));
    verifier('autour.proposer', A.proposer(tous, pos, { heure, usage, max: 5 }), C.appel('autour.proposer', { lieux: tous, pos, heure, usage: jsonPropre(usage), max: 5 }));
    const ev = choix([{ webkitCompassHeading: entre(-10, 720) }, { webkitCompassHeading: -1, absolute: true, alpha: entre(0, 360) }, { alpha: 30 }, { absolute: true, alpha: null }, null, {}]);
    verifier('autour.capBoussole', A.capBoussole(ev), C.appel('autour.capBoussole', ev));
    verifier('autour.requeteVehicules', A.requeteVehicules(c), C.appel('autour.requeteVehicules', { c }));
    const l = choix(tous); verifier('autour.plansLien', A.plansLien(l), C.appel('autour.plansLien', l));
  }
  const VEH = { results: [
    { id: 'tier:1', geometry: { x: 6.63, y: 46.52 }, attributes: { provider_id: 'tier', vehicle_type: ['E-Scooter'], available: true, pickup_type: 'free_floating' } },
    { featureId: 'b', geometry: { x: 8.541, y: 47.371 }, attributes: { 'ch.bfe.sharedmobility.provider.id': 'publibike', 'ch.bfe.sharedmobility.vehicle_type': 'E-Bike', station_name: 'Central' } },
    { id: 'c', geometry: { type: 'Point', coordinates: [8.542, 47.372] }, properties: { provider_name: 'Donkey', vehicle_type: 'Bike' } },
    { id: 'd', geometry: { x: 8.54, y: 47.37 }, attributes: { provider_id: 'mobility', vehicle_type: ['Car'], available: true } },
    { id: 'e', geometry: { x: 8.54, y: 47.37 }, attributes: { provider_id: 'tier', vehicle_type: ['E-Scooter'], available: 'false' } },
    { geometry: { x: '8.55', y: '47.38' }, attributes: { vehicle_type: ['kick scooter', null], provider_name: 'Vöi' + 'z'.repeat(40) } },
    { id: 7, geometry: {}, attributes: { lat: 47.1, lon: 8.1, vehicle_type: 'Cargo bike' } },
    { id: 'f', geometry: {}, attributes: { vehicle_type: ['E-Scooter'] } },
    { id: 'g', geometry: { x: 8, y: 95 }, attributes: { vehicle_type: ['E-Scooter'] } }, null, 'x',
  ] };
  for (const j of [VEH, VEH.results, { features: VEH.results }, { results: 'x' }, null, {}]) verifier('autour.lireVehicules', A.lireVehicules(j), C.appel('autour.lireVehicules', jsonPropre(j)));

  // ---- dire ----
  for (const [code, dico] of Object.entries(DICOS)) {
    const js = creerDire(dico), h = C.appel('dire.charger', dico);
    const textes = [];
    for (const l of LIGNES) {
      const fr = l[0].replace(/\{n\}/g, () => String(Math.floor(entre(0, 999))) + (r() < 0.3 ? ',5' : ''));
      textes.push(fr, '▦ ' + fr, '  ' + fr + ' ›', fr + ' · ↻ à jour tout seul', fr.toUpperCase(), fr + 'x');
    }
    textes.push('', '   ', '⇗ 70 m', 'Café du Grütli', '9 lieux autour', '12,5 lieux autour', '3 installé(s) · ↻ à jour tout seul', 'iPhone · Android · web, hors ligne ›');
    verifier('dire.' + code, textes.map(t => js(t)), C.appel('dire.dire', { dico: h, textes }));
  }
  for (const [reg, pref] of [['auto', ['de-CH']], ['de', ['en']], ['xx', ['ja-JP', 'it_CH']], [null, []], ['auto', ['ES-es']]]) verifier('dire.langueDe', langueDe(reg, pref), C.appel('dire.langueDe', { reglage: reg, preferees: pref }));

  return { version: C.version, cas: Object.values(compte).reduce((a, b) => a + b, 0), compte, ecarts };
}

if (import.meta.url === 'file://' + process.argv[1] || process.argv[1]?.endsWith('rust-golden.mjs')) {
  const r = await golden(process.argv[2] || undefined);
  console.log('ploxi-coeur ' + r.version + ' : ' + r.cas + ' cas comparés au JS');
  if (r.ecarts.length) { console.log('ÉCARTS :\n  ' + r.ecarts.join('\n  ')); process.exit(1); }
  console.log('aucun écart');
}
