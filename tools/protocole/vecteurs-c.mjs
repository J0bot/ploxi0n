// Écrit ref/c/test/vecteurs.h depuis docs/protocole/vecteurs-v1.json (pour le test du C, qui n'a pas de lecteur JSON complet).
// node tools/protocole/vecteurs-c.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
export const CHEMIN_H = new URL('../../ref/c/test/vecteurs.h', import.meta.url);
export function enteteC() {
const v = JSON.parse(readFileSync(new URL('../../docs/protocole/vecteurs-v1.json', import.meta.url), 'utf8'));
const c = (s) => '"' + [...Buffer.from(s, 'utf8')].map(b => b === 0x22 ? '\\"' : b === 0x5c ? '\\\\' : b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : '\\x' + b.toString(16).padStart(2, '0') + '""').join('') + '"';
const lignes = ['/* Généré par tools/protocole/vecteurs-c.mjs depuis docs/protocole/vecteurs-v1.json : ne pas modifier à la main. */',
  '#define V_HORLOGE ' + v.horloge + 'ULL',
  '#define V_ALICE ' + c(v.identites[0].empreinte), '#define V_BOB ' + c(v.identites[1].empreinte),
  'static const char *V_PAQUETS[] = {'];
const noms = Object.keys(v.paquets);
for (const n of noms) lignes.push('  ' + c(v.paquets[n]) + ', /* ' + n + ' */');
lignes.push('};', 'static const char *V_NOMS[] = {' + noms.map(n => c(n)).join(', ') + '};', '#define V_NB ' + noms.length);
lignes.push('#define V_MORCEAUX_ID 0x' + v.morceaux_ble.id + 'u', '#define V_MORCEAUX_PAQUET ' + noms.indexOf(v.morceaux_ble.paquet));
lignes.push('static const char *V_MORCEAUX_HEX[] = {' + v.morceaux_ble.hex.map(h => c(h)).join(',\n  ') + '};', '#define V_NB_MORCEAUX ' + v.morceaux_ble.hex.length, '');
return lignes.join('\n');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) { writeFileSync(CHEMIN_H, enteteC()); console.log('ref/c/test/vecteurs.h écrit'); }
