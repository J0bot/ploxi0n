// 🌐 LES VECTEURS DE TEST DU PROTOCOLE MAILLE v1 (0.99.42, docs/protocole/MAILLE-v1.md). Deux identités FIXES (des clés de TEST, publiques,
// qui ne servent qu'ici) font tourner le VRAI maillage (src/bions/maille.js) avec un hasard déterministe et une horloge fixe : on capture ce
// qu'il émet (l'annonce, un message public, un salon fermé, un privé, son accusé, une position) et les valeurs intermédiaires (l'empreinte,
// le secret ECDH, la clé AES dérivée, la clé du salon, le rembourrage, les morceaux BLE). Qui implémente le protocole (un ESP32, un PC, une
// autre app) compare ses résultats à docs/protocole/vecteurs-v1.json. Régénérer : node tools/protocole/vecteurs.mjs
//   (tests/protocole-v1.test.mjs vérifie que l'implémentation de référence produit toujours exactement ce fichier)
import { writeFileSync } from 'node:fs';
import { creerMaille, remplir, PROTOCOLE } from '../../src/bions/maille.js';
import { decouper } from '../../src/bions/fragments.js';

export const CLES_DE_TEST = [{"kty":"EC","crv":"P-256","x":"idVo4iZcypVHThXdL2gtb93s4-sTd3w6qmtviYu6zrU","y":"ZGrEex-bjT1L4ePnhAx0FOhsJNwStkl2hVQEdMprHk8","d":"aL1nARBD-hFNDIZr3LlwPQl2UFit46g-Q6Mt4wqh7Yg"},{"kty":"EC","crv":"P-256","x":"WN1WxUnpIxSPC5aMxJHI4QrKgDO6QtbSQVV_LwlzIlY","y":"lxcd_-rjU6ia9D96Cwc9greglWnsv5B39v8l47AORn4","d":"x25LxVaI5jJknU-dRrwYpRdkXA76_rBweG0fe6gaJfg"}];
export const HORLOGE = 1790000000000;   // 2026-09-21T13:33:20Z : les paquets portent cette heure
const s = globalThis.crypto.subtle, enc = new TextEncoder();
const hex = (u8) => [...new Uint8Array(u8)].map(x => x.toString(16).padStart(2, '0')).join('');
const b64u = (s2) => { const b = Buffer.from(s2.replace(/-/g, '+').replace(/_/g, '/'), 'base64'); return new Uint8Array(b); };

/** un hasard déterministe (xorshift32), pour que les vecteurs soient les mêmes à chaque fois */
export function hasard(graine = 0x9e3779b9) { let x = graine >>> 0; return (n) => { const o = new Uint8Array(n); for (let i = 0; i < n; i++) { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; o[i] = x & 255; } return o; }; }

export async function genererVecteurs() {
  const emis = [], magasins = CLES_DE_TEST.map(j => ({ lire: async (k) => (k === 'maille-identite' ? { ...j } : null), ecrire: async () => {} }));
  const noms = ['Alice', 'Bob'], M = {};
  const attente = (ms, f) => { attentes.push(f); }, attentes = [];
  const vider = async () => { for (let k = 0; k < 20 && attentes.length; k++) { const l = attentes.splice(0); for (const f of l) f(); await new Promise(r => setTimeout(r, 0)); } };
  noms.forEach((n, i) => {
    M[n] = creerMaille({ subtle: s, alea: hasard(0x1000 + i), maintenant: () => HORLOGE, nom: n, magasin: magasins[i], attente, repeter: () => () => {},
      envoyer: (texte, vers) => { emis.push({ de: n, texte }); const autre = n === 'Alice' ? 'Bob' : 'Alice'; if (!vers || vers.includes(autre)) attentes.push(() => M[autre].recevoir(n, texte)); } });
  });
  await M.Alice.demarrer({ nom: 'Alice' }); await M.Bob.demarrer({ nom: 'Bob' });
  M.Alice.voisin('Bob', 'connecte'); M.Bob.voisin('Alice', 'connecte'); await vider();
  await M.Alice.dire('bonjour le maillage'); await vider();
  await M.Alice.rejoindre('#soiree', 'lac'); await M.Bob.rejoindre('#soiree', 'lac');
  await M.Alice.dire('dans le salon fermé', '#soiree'); await vider();
  await M.Alice.prive(M.Bob.moi().fp, 'message privé pour Bob'); await vider();
  await M.Alice.partagerPosition({ lat: 46.52, lng: 6.63, precision: 8 }, { a: [M.Bob.moi().fp] }); await vider();
  const trouver = (de, k) => { const e = emis.find(x => x.de === de && JSON.parse(x.texte).k === k && (k !== 'ann' || true)); return e ? e.texte : null; };
  const pubClair = emis.find(x => x.de === 'Alice' && /"k":"pub"/.test(x.texte) && /bonjour le maillage/.test(x.texte)).texte;
  const pubFerme = emis.find(x => x.de === 'Alice' && /"k":"pub"/.test(x.texte) && /"s":"#soiree"/.test(x.texte)).texte;

  // les valeurs intermédiaires, calculées À PART (WebCrypto seul, d'après la spec) : si elles déchiffrent les paquets du maillage, la spec dit vrai
  const brut = async (j) => new Uint8Array(await s.exportKey('raw', await s.importKey('jwk', { kty: j.kty, crv: j.crv, x: j.x, y: j.y, ext: true }, { name: 'ECDH', namedCurve: 'P-256' }, true, [])));
  const pubA = await brut(CLES_DE_TEST[0]), pubB = await brut(CLES_DE_TEST[1]);
  const fp = async (pub) => hex(new Uint8Array(await s.digest('SHA-256', pub)).slice(0, 8));
  const fpA = await fp(pubA), fpB = await fp(pubB);
  const privA = await s.importKey('jwk', { ...CLES_DE_TEST[0], ext: true }, { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
  const secret = new Uint8Array(await s.deriveBits({ name: 'ECDH', public: await s.importKey('raw', pubB, { name: 'ECDH', namedCurve: 'P-256' }, false, []) }, privA, 256));
  const base = await s.importKey('raw', secret, 'HKDF', false, ['deriveBits']);
  const cleAB = new Uint8Array(await s.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: enc.encode('ploxi-maille-v1'), info: enc.encode([fpA, fpB].sort().join('|')) }, base, 256));
  const mdp = await s.importKey('raw', enc.encode('lac'), 'PBKDF2', false, ['deriveBits']);
  const cleSalon = new Uint8Array(await s.deriveBits({ name: 'PBKDF2', salt: enc.encode('ploxi-salon:#soiree'), iterations: 100000, hash: 'SHA-256' }, mdp, 256));
  const morceaux = decouper(pubClair, 0x01020304).map(hex);
  return {
    protocole: PROTOCOLE, horloge: HORLOGE,
    note: 'clés de TEST, publiques : ne jamais les utiliser pour de vrai',
    identites: [{ nom: 'Alice', jwk: CLES_DE_TEST[0], cle_publique_hex: hex(pubA), empreinte: fpA }, { nom: 'Bob', jwk: CLES_DE_TEST[1], cle_publique_hex: hex(pubB), empreinte: fpB }],
    derivation: { secret_ecdh_hex: hex(secret), hkdf_sel: 'ploxi-maille-v1', hkdf_info: [fpA, fpB].sort().join('|'), cle_aes_alice_bob_hex: hex(cleAB),
      salon: '#soiree', mot_de_passe: 'lac', pbkdf2_sel: 'ploxi-salon:#soiree', pbkdf2_iterations: 100000, cle_salon_hex: hex(cleSalon) },
    rembourrage: { clair_hex: hex(enc.encode('salut')), rembourre_prefixe_hex: hex(remplir(enc.encode('salut'), (n) => new Uint8Array(n)).slice(0, 12)), longueur: 256 },
    paquets: {
      ann_alice: trouver('Alice', 'ann'), pub_clair: pubClair, pub_salon_ferme: pubFerme, mp_alice_bob: trouver('Alice', 'mp'), ack_bob: trouver('Bob', 'ack'), pos_alice_bob: trouver('Alice', 'pos'),
    },
    clairs: { pub_salon_ferme: { x: 'dans le salon fermé' }, mp_alice_bob: { x: 'message privé pour Bob' }, pos_alice_bob: { lat: 46.52, lng: 6.63, precision: 8, cap: null } },
    morceaux_ble: { id: '01020304', taille: 180, paquet: 'pub_clair', hex: morceaux },
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const v = await genererVecteurs();
  writeFileSync(new URL('../../docs/protocole/vecteurs-v1.json', import.meta.url), JSON.stringify(v, null, 2) + '\n');
  console.log('docs/protocole/vecteurs-v1.json : ' + Object.keys(v.paquets).length + ' paquets, ' + v.morceaux_ble.hex.length + ' morceaux');
}
