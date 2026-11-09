// 🦀 le banc (0.99.17) : le même travail en JS et dans le cœur Rust (WASM), mesuré. Pour décider où le Rust GAGNE dans la WebView
// (passer la porte coûte : copier le texte, le relire en JSON) ; en natif (iOS), il n'y a ni WebView ni porte.
import { readFileSync } from 'node:fs';
import { chargerCoeur } from '../src/coeur/rust.js';
import * as P from '../src/bions/proche.js';
import * as A from '../src/bions/autour.js';
import { creerDire } from '../src/bions/dire.js';
import { DICOS, LIGNES } from '../src/app/langues.js';

const C = await chargerCoeur(readFileSync(process.argv[2] || 'public/coeur/ploxi_coeur.wasm'));
const mesurer = (f, n) => { for (let i = 0; i < Math.min(n, 20); i++) f(); const t = performance.now(); for (let i = 0; i < n; i++) f(); return (performance.now() - t) / n; };
const els = []; for (let i = 0; i < 400; i++) els.push({ type: 'node', id: i, lat: 47.37 + i * 1e-5, lon: 8.54 + i * 1e-5, tags: { amenity: ['cafe', 'bar', 'restaurant', 'toilets'][i % 4], name: 'Lieu ' + i, opening_hours: 'Mo-Fr 08:00-18:00' } });
const texteOsm = JSON.stringify({ elements: els }), lieux = A.lire(JSON.parse(texteOsm)), pos = { lat: 47.372, lng: 8.541 };
const de = creerDire(DICOS.de), h = C.appel('dire.charger', DICOS.de), textes = LIGNES.map(l => '▦ ' + l[0].replace('{n}', '3'));
const pa = P.partition({ tempo: 128, motif: 'tekk' });
const lignes = [
  ['OpenStreetMap : lire une case (400 lieux, depuis le texte)', () => A.lire(JSON.parse(texteOsm)), () => C.appel('autour.lireTexte', texteOsm), 200],
  ['trier 400 lieux autour de moi', () => A.trier(lieux, pos, { max: 80 }), () => C.appel('autour.trier', { lieux, pos, max: 80 }), 200],
  ['proposer (heure × vecteur xerion × distance)', () => A.proposer(lieux, pos, { heure: 18, usage: { synthe: { seconds: 900 } } }), () => C.appel('autour.proposer', { lieux, pos, heure: 18, usage: { synthe: { seconds: 900 } }, max: 5 }), 200],
  ['traduire ' + textes.length + ' textes (allemand, en un appel)', () => textes.map(t => de(t)), () => C.appel('dire.dire', { dico: h, textes }), 300],
  ['les notes de la basse (220 ms, un tic du synthé)', () => P.notesEntre(pa, 1000, 1220), () => C.appel('proche.notesEntre', { p: pa, de: 1000, a: 1220 }), 5000],
];
console.log('travail'.padEnd(58) + 'JS'.padStart(10) + 'Rust/WASM'.padStart(12) + '   rapport');
for (const [nom, js, rs, n] of lignes) { const a = mesurer(js, n), b = mesurer(rs, n); console.log(nom.padEnd(58) + (a.toFixed(3) + ' ms').padStart(10) + (b.toFixed(3) + ' ms').padStart(12) + '   ' + (a > b ? '×' + (a / b).toFixed(1) + ' Rust' : '×' + (b / a).toFixed(1) + ' JS')); }
