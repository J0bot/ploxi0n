// @bion maille — le maillage façon bitchat : des messages qui sautent de téléphone en téléphone, sans internet ni serveur ni compte | api: creerMaille, creerVus, commande, remplir, vider, lireMaille, TTL_MAX, PUBLIC (et du maillage : favori, lire, codeSecurite, verifier, partagerPosition, positions)
// (0.99.21, RS-7 24.10 : « ça doit être comme bitchat mesh pour le truc Bluetooth »). Ce que bitchat fait, et ce qu'on en garde :
//   - le MAILLAGE : chaque téléphone relaie ce qu'il reçoit à ses autres voisins ; (0.99.36) sans limite pratique (255 relais) ; un petit
//     délai au hasard avant de relayer (moins de collisions, et on devine moins qui a écrit le premier) ;
//   - le DÉDOUBLONNAGE : chaque paquet a un id ; un filtre de Bloom (deux, qui tournent) se souvient de ceux déjà vus, en peu de place ;
//   - STOCKER ET RELAYER : les paquets récents (12 h) sont gardés ; quand un voisin arrive, on échange la liste de ce qu'on a vu, chacun
//     envoie à l'autre ce qui lui manque (les messages pour quelqu'un qui n'était pas là l'attendent) ;
//   - pas de compte : une IDENTITÉ = une paire de clés ECDH P-256, son EMPREINTE (les 8 premiers octets du SHA-256 de la clé publique) ;
//     le nom est libre (pas vérifié : c'est l'empreinte qui fait foi, comme dans bitchat) ;
//   - les MESSAGES PRIVÉS chiffrés de bout en bout : ECDH → HKDF-SHA256 → AES-GCM 256 (l'en-tête lié : un relais ne peut ni lire ni
//     détourner) ; un accusé « reçu » revient par le maillage. ⚠ Pas de confidentialité persistante (bitchat : le protocole Noise) ;
//   - les SALONS « #nom », ouverts, ou fermés par un mot de passe (PBKDF2-SHA256 → AES-GCM : sans le mot, on voit qu'il y a un message) ;
//   - le REMBOURRAGE : ce qui est chiffré est complété jusqu'à 256, 512, 1024… octets (la taille ne trahit pas le message) ;
//   - BLOQUER une empreinte (ses messages ne s'affichent plus ; on relaie quand même : le maillage tient) ; TOUT EFFACER d'un geste
//     (l'identité, les messages, les salons : bitchat, trois touchers sur le logo) ; les commandes /j /m /w /bloquer /effacer.
// (0.99.22, RS-7 : « améliore le bitchat ; en soirée, savoir où sont tes potes, une boussole pour les retrouver sans connexion ») :
//   - les FAVORIS (★, comme bitchat) : ce qui leur est adressé est gardé 72 h pour eux (ils le reçoivent en revenant) ;
//   - « LU » : l'accusé de lecture d'un message privé (✓ envoyé, ✓✓ reçu, ◉ lu), seulement quand la conversation est ouverte ;
//   - le CODE DE SÉCURITÉ d'une paire (30 chiffres, le même chez les deux) : le comparer en vrai prouve qu'aucun relais ne s'est glissé au
//     milieu ; « vérifié » est gardé ;
//   - les MENTIONS : « @ton nom » dans un salon te fait vibrer ;
//   - la POSITION : chiffrée pour chaque pote (sa clé) ou pour un salon fermé (sa clé de mot de passe), jamais en clair ; relayée comme le
//     reste ; « fin » l'efface chez les autres ; rien n'est gardé en cache (une vieille position ne sert à rien).
// Le tuyau (src/natif/proche-natif.js) : MultipeerConnectivity, le Bluetooth et le Wi-Fi direct ensemble ; 7 voisins directs au plus,
// le maillage porte au-delà. Pur, sans DOM : la cryptographie (subtle), le hasard, l'heure, l'envoi et l'attente sont donnés.
import { rdvValide } from './potes.js';   // (0.99.29) un rendez-vous reçu : validé comme tout ce qui vient d'à côté

// (0.99.36, RS-7 : « la limite à 7 c'est zgeg, il nous faut de l'infini ») 255 relais : l'infini en pratique (un festival, un quartier).
// Ce qui arrête les boucles, c'est le dédoublonnage (chaque paquet a un id : déjà vu = jeté, jamais relayé deux fois), pas ce compteur ;
// et l'ÂGE : un paquet de plus de 72 h (ou venu du futur) n'est plus relayé, même si le filtre de Bloom l'a oublié.
export const TTL_MAX = 255, PUBLIC = '#', TAILLE_MAX = 16000, AGE_MAX = 72 * 3600e3, AVANCE_MAX = 10 * 60e3;
const GENRES = new Set(['ann', 'pub', 'mp', 'ack', 'sync', 'pos']);
const HEX16 = /^[0-9a-f]{16}$/;
const SALON = /^#[\p{L}\p{N}_-]{0,32}$/u;
const GARDE = 12 * 3600e3, CACHE_MAX = 150, MESSAGES_MAX = 400, GARDE_FAVORI = 72 * 3600e3, FAVORIS_MAX = 100, POSITION_VIVE = 15 * 60e3;
const enc = new TextEncoder(), dec = new TextDecoder();

// ---- le filtre de Bloom : « déjà vu ? » en 4 Ko, deux filtres qui tournent (le vieux oublie) ----
function fnv(s, graine) { let h = 2166136261 ^ graine; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function bloom(bits) {
  const t = new Uint8Array(bits >> 3);
  const pos = (s) => [0x9e37, 0x85eb, 0xc2b2, 0x27d4].map(g => fnv(s, g) % bits);
  return { ajouter(s) { for (const p of pos(s)) t[p >> 3] |= 1 << (p & 7); }, a(s) { return pos(s).every(p => t[p >> 3] & (1 << (p & 7))); } };
}
/** ce qu'on a déjà vu : un filtre de Bloom qui tourne tous les `tour` ajouts (le précédent reste interrogé un tour de plus) */
export function creerVus({ bits = 32768, tour = 3000 } = {}) {
  let neuf = bloom(bits), vieux = bloom(bits), n = 0;
  return {
    a: (s) => neuf.a(s) || vieux.a(s),
    ajouter(s) { neuf.ajouter(s); if (++n >= tour) { vieux = neuf; neuf = bloom(bits); n = 0; } },
  };
}

// ---- le rembourrage : [longueur sur 4 octets][les octets][du hasard] jusqu'à la taille suivante ----
const PALIERS = [256, 512, 1024, 2048, 4096, 8192];
export function remplir(octets, alea = (n) => new Uint8Array(n)) {
  const n = octets.length + 4, cible = PALIERS.find(p => p >= n) || n;
  const out = new Uint8Array(cible); new DataView(out.buffer).setUint32(0, octets.length); out.set(octets, 4);
  if (cible > n) out.set(alea(cible - n), n);
  return out;
}
export function vider(octets) {
  if (!(octets instanceof Uint8Array) || octets.length < 4) return null;
  const l = new DataView(octets.buffer, octets.byteOffset, octets.byteLength).getUint32(0);
  return l <= octets.length - 4 ? octets.slice(4, 4 + l) : null;
}

// ---- les commandes (comme bitchat, et en français) ----
/** le texte tapé → { genre, … } : rejoindre (#salon, mot de passe ?), quitter, mp (@nom, texte), qui, bloquer, debloquer, effacer, texte */
export function commande(texte) {
  const t = String(texte || '').trim();
  if (!t.startsWith('/')) return { genre: 'texte', texte: t };
  const [c, ...r] = t.split(/\s+/), mot = c.slice(1).toLowerCase(), arg = r[0] || '';
  const salon = (x) => { const s = x.startsWith('#') ? x : '#' + x; return SALON.test(s) && s.length > 1 ? s.toLowerCase() : null; };
  if (['j', 'join', 'rejoindre'].includes(mot)) return salon(arg) ? { genre: 'rejoindre', salon: salon(arg), mdp: r.slice(1).join(' ') || null } : { genre: 'erreur', texte: '/j #salon [mot de passe]' };
  if (['leave', 'quitter', 'q'].includes(mot)) return { genre: 'quitter', salon: arg ? salon(arg) : null };
  if (['m', 'msg', 'mp'].includes(mot)) return arg && r.length > 1 ? { genre: 'mp', a: arg.replace(/^@/, ''), texte: r.slice(1).join(' ') } : { genre: 'erreur', texte: '/m @nom ton message' };
  if (['w', 'who', 'qui'].includes(mot)) return { genre: 'qui' };
  if (['block', 'bloquer'].includes(mot)) return arg ? { genre: 'bloquer', a: arg.replace(/^@/, '') } : { genre: 'bloques' };
  if (['unblock', 'debloquer', 'débloquer'].includes(mot)) return { genre: 'debloquer', a: arg.replace(/^@/, '') };
  if (['clear', 'effacer'].includes(mot)) return { genre: 'effacer' };
  if (['fav', 'favori', 'pote'].includes(mot)) return arg ? { genre: 'favori', a: arg.replace(/^@/, ''), oui: true } : { genre: 'favoris' };
  if (['unfav', 'defavori', 'plus-pote'].includes(mot)) return { genre: 'favori', a: arg.replace(/^@/, ''), oui: false };
  if (['code', 'verifier', 'vérifier', 'verify'].includes(mot)) return arg ? { genre: 'code', a: arg.replace(/^@/, '') } : { genre: 'erreur', texte: '/code @nom : le code de sécurité à comparer' };
  return { genre: 'erreur', texte: 'commandes : /j #salon · /m @nom texte · /w · /fav @nom · /code @nom · /bloquer @nom · /debloquer @nom · /quitter · /effacer' };
}

// ---- le paquet du maillage : { m: 1, i, o, n, h, t, k, s?, a?, d } en texte ; ce qui vient d'à côté est suspect ----
// ▣ (0.99.35) la carte d'un pote dans un lien (le QR) : ploxi0n://pote?k=<clé publique, base64url>&f=<empreinte>&n=<nom>
const b64url = (u8) => b64(u8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const deb64url = (s) => deb64(String(s || '').replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((String(s || '').length + 3) % 4));
export function lienCarte({ cle, nom = '', fp = '' }) { return 'ploxi0n://pote?k=' + b64url(cle) + (fp ? '&f=' + fp : '') + (nom ? '&n=' + encodeURIComponent(String(nom).slice(0, 24)) : ''); }
/** → { cle: Uint8Array(65), fp?: string, nom } ou null (ce qui vient d'un QR est suspect : tout est borné) */
export function lireCarte(texte) {
  const t = String(texte || '').trim(); if (t.length > 400 || !/^ploxi0n:\/\/pote\?/.test(t)) return null;
  let q; try { q = new URLSearchParams(t.slice(t.indexOf('?') + 1)); } catch (e) { return null; }
  const cle = deb64url(q.get('k')); if (!cle || cle.length !== 65 || cle[0] !== 4) return null;
  const fp = String(q.get('f') || '').toLowerCase(); if (fp && !HEX16.test(fp)) return null;
  return { cle, fp: fp || null, nom: String(q.get('n') || '').replace(/[\u0000-\u001f]/g, '').slice(0, 24) };
}
export function lireMaille(texte) {
  if (typeof texte !== 'string' || texte.length > TAILLE_MAX || texte.indexOf('"m":1') < 0) return null;
  let o; try { o = JSON.parse(texte); } catch (e) { return null; }
  if (!o || o.m !== 1 || !GENRES.has(o.k) || !HEX16.test(o.i) || !HEX16.test(o.o)) return null;
  if (!Number.isInteger(o.h) || o.h < 0 || o.h > TTL_MAX || !Number.isFinite(o.t)) return null;
  if (o.s != null && !(typeof o.s === 'string' && SALON.test(o.s))) return null;
  if (o.a != null && !HEX16.test(o.a)) return null;
  return { i: o.i, o: o.o, n: typeof o.n === 'string' ? o.n.slice(0, 24) : '', h: o.h, t: o.t, k: o.k, s: o.s || null, a: o.a || null, d: o.d && typeof o.d === 'object' ? o.d : null };
}
const ecrire = (p) => JSON.stringify({ m: 1, ...p });

const b64 = (u8) => { let s = ''; for (const x of u8) s += String.fromCharCode(x); return btoa(s); };
const deb64 = (s) => { try { const b = atob(String(s)); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; } catch (e) { return null; } };
const hex = (u8) => [...u8].map(x => x.toString(16).padStart(2, '0')).join('');

/**
 * le maillage d'un téléphone.
 *   subtle (WebCrypto), alea(n) → Uint8Array, maintenant() → ms, envoyer(texte, [voisins]?) (le tuyau), attente(ms, f) (le délai des relais),
 *   repeter(ms, f) → arrêter (l'annonce toutes les minutes),
 *   magasin { lire(cle) → Promise, ecrire(cle, valeur) } (l'identité, les messages, les salons, les bloqués), nom
 * → { demarrer, voisin(id, etat), recevoir(de, texte) → bool, dire(texte, salon?), prive(fp, texte), rejoindre, quitter, bloquer, debloquer,
 *     effacerTout, fil(salon), salons(), pairs(), moi(), surChange(f) }
 */
export function creerMaille({ subtle, alea, maintenant = () => Date.now(), envoyer, attente = (ms, f) => setTimeout(f, ms), repeter = (ms, f) => { const x = setInterval(f, ms); return () => clearInterval(x); }, magasin = null, nom = '' }) {
  const vus = creerVus(), voisins = new Set(), cache = [], cacheFav = [], pairs = new Map(), clesPartagees = new Map(), clesSalons = new Map(), debits = new Map(), positions = new Map();
  let id = null, messages = [], salons = [PUBLIC], bloques = new Set(), auditeurs = new Set(), monNom = String(nom || '').slice(0, 24);
  let favoris = new Map(), verifies = new Set();   // (0.99.22) empreinte → nom ; les paires dont le code a été comparé
  let contacts = new Map();   // (0.99.35) empreinte → clé publique (base64) : les potes ajoutés par leur QR, connus avant même qu'ils s'annoncent
  const changer = (quoi) => { for (const f of auditeurs) { try { f(quoi); } catch (e) { /* */ } } };
  const garder = () => { if (magasin) magasin.ecrire('maille', { messages: messages.slice(-MESSAGES_MAX), salons, bloques: [...bloques], favoris: [...favoris], verifies: [...verifies], contacts: [...contacts] }).catch(() => {}); };
  const nouvelId = () => hex(alea(8));

  // ---- l'identité ----
  const ECDH = { name: 'ECDH', namedCurve: 'P-256' };
  async function empreinte(brute) { return hex(new Uint8Array(await subtle.digest('SHA-256', brute)).slice(0, 8)); }
  async function identite(jwk) {
    let prive = null, publique = null;
    if (jwk && jwk.d) { try { prive = await subtle.importKey('jwk', jwk, ECDH, true, ['deriveBits']); publique = await subtle.importKey('jwk', { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y, ext: true }, ECDH, true, []); } catch (e) { prive = null; } }
    if (!prive) { const p = await subtle.generateKey(ECDH, true, ['deriveBits']); prive = p.privateKey; publique = p.publicKey; jwk = await subtle.exportKey('jwk', prive); }
    const brute = new Uint8Array(await subtle.exportKey('raw', publique));
    return { prive, brute, fp: await empreinte(brute), jwk };
  }
  async function clePour(fp) {
    if (clesPartagees.has(fp)) return clesPartagees.get(fp);
    const p = pairs.get(fp); if (!p || !p.cle) return null;
    const pub = await subtle.importKey('raw', p.cle, ECDH, false, []);
    const bits = await subtle.deriveBits({ name: 'ECDH', public: pub }, id.prive, 256);
    const base = await subtle.importKey('raw', bits, 'HKDF', false, ['deriveKey']);
    const k = await subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: enc.encode('ploxi-maille-v1'), info: enc.encode([id.fp, fp].sort().join('|')) }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    clesPartagees.set(fp, k); return k;
  }
  async function cleSalon(salon, mdp) {
    const base = await subtle.importKey('raw', enc.encode(mdp), 'PBKDF2', false, ['deriveKey']);
    return subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode('ploxi-salon:' + salon), iterations: 100000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  const lie = (p) => enc.encode(p.o + '>' + (p.a || p.s || '') + ':' + p.i);   // l'en-tête lié au chiffré : un relais ne peut pas le détourner
  async function chiffrer(cle, objet, p) {
    const iv = alea(12), clair = remplir(enc.encode(JSON.stringify(objet)), alea);
    return { c: b64(new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv, additionalData: lie(p) }, cle, clair))), v: b64(iv) };
  }
  async function dechiffrer(cle, d, p) {
    const c = deb64(d && d.c), iv = deb64(d && d.v); if (!c || !iv || iv.length !== 12) return null;
    try { const o = vider(new Uint8Array(await subtle.decrypt({ name: 'AES-GCM', iv, additionalData: lie(p) }, cle, c))); return o ? JSON.parse(dec.decode(o)) : null; } catch (e) { return null; }
  }

  // ---- les messages (un fil par salon ; « @empreinte » = une conversation privée) ----
  function poser(m) {
    if (messages.some(x => x.id === m.id)) return;
    messages.push(m); if (messages.length > MESSAGES_MAX) messages.splice(0, messages.length - MESSAGES_MAX);
    garder(); changer('messages');
  }
  const nomPair = (fp) => (fp === (id && id.fp) ? monNom : (pairs.get(fp) || {}).nom || '');

  // ---- l'envoi, le relais, le cache ----
  function cacher(i, texte, p) {
    if (p.k === 'pos' || p.k === 'sync') return;   // une vieille position ne sert à rien
    const t = maintenant();
    if (p.a && favoris.has(p.a)) {   // (0.99.22) pour un favori : 72 h, à part (le déluge des autres ne le chasse pas)
      while (cacheFav.length && (cacheFav.length >= FAVORIS_MAX || t - cacheFav[0].t > GARDE_FAVORI)) cacheFav.shift();
      cacheFav.push({ i, texte, t, k: p.k, garde: GARDE_FAVORI }); return;
    }
    while (cache.length && (cache.length >= CACHE_MAX || t - cache[0].t > GARDE)) cache.shift();
    cache.push({ i, texte, t, k: p.k, garde: GARDE });
  }
  const recents = () => [...cache, ...cacheFav].map(c => c.i).slice(-160);
  function emettre(p, vers) {
    const texte = ecrire(p); if (texte.length > TAILLE_MAX) throw new Error('maille : paquet trop gros');
    vus.ajouter(p.i); cacher(p.i, texte, p);
    const l = vers || [...voisins]; if (l.length) envoyer(texte, vers || null); return p;
  }
  const paquetDe = (k, extra) => ({ i: nouvelId(), o: id.fp, n: monNom, h: TTL_MAX, t: maintenant(), k, ...extra });
  function relayer(p, de) {
    if (p.h <= 0) return;
    const autres = [...voisins].filter(v => v !== de); if (!autres.length) return;
    const texte = ecrire({ ...p, h: p.h - 1 });
    attente(10 + (alea(1)[0] % 140), () => envoyer(texte, autres.filter(v => voisins.has(v))));
  }
  // anti-déluge : 40 paquets par empreinte et par 10 s
  function tropBavard(o) { const t = maintenant(), d = debits.get(o) || { t, n: 0 }; if (t - d.t > 10000) { d.t = t; d.n = 0; } d.n++; debits.set(o, d); return d.n > 40; }

  function annoncer(vers) { if (id) emettre(paquetDe('ann', { d: { cle: b64(id.brute) } }), vers); }
  let finAnnonce = () => {};

  async function demarrer({ nom: n } = {}) {
    if (n != null) monNom = String(n).slice(0, 24);
    const sauve = magasin ? await magasin.lire('maille').catch(() => null) : null, jwk = magasin ? await magasin.lire('maille-identite').catch(() => null) : null;
    id = await identite(jwk);
    if (magasin && (!jwk || jwk.d !== id.jwk.d)) await magasin.ecrire('maille-identite', id.jwk).catch(() => {});
    if (sauve) { messages = Array.isArray(sauve.messages) ? sauve.messages.slice(-MESSAGES_MAX) : []; salons = Array.isArray(sauve.salons) && sauve.salons.length ? [...new Set([PUBLIC, ...sauve.salons.filter(s => SALON.test(s))])] : [PUBLIC]; bloques = new Set(Array.isArray(sauve.bloques) ? sauve.bloques.filter(x => HEX16.test(x)) : []);
      favoris = new Map(Array.isArray(sauve.favoris) ? sauve.favoris.filter(x => Array.isArray(x) && HEX16.test(x[0])).map(([f, n]) => [f, String(n || '').slice(0, 24)]) : []); verifies = new Set(Array.isArray(sauve.verifies) ? sauve.verifies.filter(x => HEX16.test(x)) : []); }
    if (sauve && Array.isArray(sauve.contacts)) for (const [f, k] of sauve.contacts) { const brute = deb64(k); if (HEX16.test(f) && brute && brute.length === 65 && await empreinte(brute) === f) { contacts.set(f, k); const pr = pairs.get(f) || { nom: favoris.get(f) || '', cle: null, vu: 0, sauts: 9, voisin: null }; pr.cle = pr.cle || brute; pairs.set(f, pr); } }
    finAnnonce(); finAnnonce = repeter(60000, () => annoncer());   // les pairs lointains apprennent notre clé, et qu'on est là
    for (const v of voisins) { annoncer([v]); emettre(paquetDe('sync', { h: 0, d: { ids: recents() } }), [v]); }   // des voisins arrivés avant l'identité
    changer('tout'); return { fp: id.fp };
  }
  function arreter() { finAnnonce(); finAnnonce = () => {}; voisins.clear(); }

  /** un voisin direct arrive ou part (le tuyau) : on s'annonce, on échange ce qu'on a vu (stocker et relayer) */
  function voisin(v, etat) {
    if (etat === 'connecte') { if (voisins.has(v)) return; voisins.add(v); if (!id) return; annoncer([v]); emettre(paquetDe('sync', { h: 0, d: { ids: recents() } }), [v]); changer('pairs'); }
    else if (etat === 'perdu') { if (voisins.delete(v)) { for (const [fp, p] of pairs) if (p.voisin === v) p.voisin = null; changer('pairs'); } }
  }

  /** un paquet arrive d'un voisin direct : true s'il était du maillage (lu, peut-être affiché, relayé) */
  function recevoir(de, texte) {
    const p = lireMaille(texte); if (!p) return false;
    if (!id) return true;
    if (p.k === 'sync') {   // d'un voisin seulement : on lui envoie ce qu'il n'a pas vu
      const ses = new Set(Array.isArray(p.d && p.d.ids) ? p.d.ids.filter(x => HEX16.test(x)).slice(0, 200) : []), t = maintenant();
      for (const c of [...cache, ...cacheFav]) if (!ses.has(c.i) && t - c.t < c.garde) { let q = null; try { q = JSON.parse(c.texte); } catch (e) { continue; } envoyer(ecrire({ ...q, h: Math.max(0, q.h - 1) }), [de]); }
      return true;
    }
    if (vus.a(p.i)) return true;
    vus.ajouter(p.i);
    if (p.t > maintenant() + AVANCE_MAX || maintenant() - p.t > AGE_MAX) return true;   // (0.99.36) trop vieux, ou d'une horloge folle : ni lu ni relayé
    if (p.o === id.fp) return true;   // notre propre écho
    if (tropBavard(p.o)) return true;
    cacher(p.i, texte, p);
    const sauts = TTL_MAX - p.h;
    const pr = pairs.get(p.o) || { nom: '', cle: null, vu: 0, sauts: 9, voisin: null }, avant = pr.nom + '|' + pr.sauts;
    pr.nom = p.n || pr.nom; pr.vu = maintenant(); pr.sauts = sauts; if (sauts === 0) pr.voisin = de; pairs.set(p.o, pr);
    if (avant !== pr.nom + '|' + pr.sauts && p.k !== 'ann') changer('pairs');   // un pair nouveau, ou qui s'est rapproché
    traiter(p, sauts).catch(() => {});
    if (!(p.a && p.a === id.fp)) relayer(p, de);   // ce qui m'est adressé s'arrête chez moi
    return true;
  }
  async function traiter(p, sauts) {
    const pr = pairs.get(p.o), bloque = bloques.has(p.o); p.d = p.d || {};
    if (p.k === 'ann') {
      const brute = deb64(p.d && p.d.cle); if (!brute || brute.length !== 65) return;
      if (await empreinte(brute) !== p.o) return;   // une clé qui ne donne pas son empreinte : un imposteur
      if (!pr.cle || hex(pr.cle) !== hex(brute)) { pr.cle = brute; clesPartagees.delete(p.o); }
      changer('pairs'); return;
    }
    if (p.k === 'pub') {
      const salon = p.s || PUBLIC; if (salon !== PUBLIC && !salons.includes(salon)) return;   // un salon qu'on n'a pas rejoint : on relaie seulement
      if (bloque) return;
      let texte = typeof p.d.x === 'string' ? p.d.x : null, ferme = false, son = p.d.son;
      if (texte == null && p.d.c) { ferme = true; const k = clesSalons.get(salon); const o = k ? await dechiffrer(k, p.d, p) : null; texte = o && typeof o.x === 'string' ? o.x : null; son = o && o.son; }
      const mention = texte != null && !!monNom && new RegExp('@' + monNom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}\\p{N}_-])', 'iu').test(texte);   // (0.99.22) « @ton nom » (pas « @tonnom2 »)
      poser({ id: p.i, salon, de: p.o, nom: p.n, texte: texte == null ? null : texte.slice(0, 1000), ferme, son: texte != null && son && typeof son === 'object' ? son : null, mention, t: maintenant(), sauts });
      if (mention) changer('mention');
      return;
    }
    if (p.k === 'mp' && p.a === id.fp) {
      if (bloque) return;
      const k = await clePour(p.o); const o = k ? await dechiffrer(k, p.d, p) : null;
      if (!o || typeof o.x !== 'string') { poser({ id: p.i, salon: '@' + p.o, de: p.o, nom: p.n, texte: null, ferme: true, t: maintenant(), sauts }); return; }
      poser({ id: p.i, salon: '@' + p.o, de: p.o, nom: p.n, texte: o.x.slice(0, 1000), prive: true, son: o.son && typeof o.son === 'object' ? o.son : null, t: maintenant(), sauts });
      emettre(paquetDe('ack', { a: p.o, d: { r: p.i } }));   // l'accusé repart par le maillage
      return;
    }
    if (p.k === 'ack' && p.a === id.fp && p.d && HEX16.test(p.d.r)) {
      const m = messages.find(x => x.id === p.d.r && x.moi), e = p.d.l === 1 ? 'lu' : 'recu';
      if (m && m.etat !== e && m.etat !== 'lu') { m.etat = e; garder(); changer('messages'); }
      return;
    }
    if (p.k === 'pos') {   // (0.99.22) une position : pour moi (sa clé), ou pour un salon fermé que j'ai rejoint
      if (bloque) return;
      const k = p.a === id.fp ? await clePour(p.o) : (p.s && clesSalons.get(p.s)) || null; if (!k) return;
      const o = await dechiffrer(k, p.d, p); if (!o) return;
      if (o.fin) { if (positions.delete(p.o)) changer('positions'); return; }
      const lat = +o.lat, lng = +o.lng; if (!(Math.abs(lat) <= 90 && Math.abs(lng) <= 180)) return;
      positions.set(p.o, { fp: p.o, nom: p.n, lat, lng, precision: Math.max(0, Math.min(5000, +o.precision || 0)), cap: Number.isFinite(+o.cap) ? +o.cap : null, t: maintenant(), sauts, salon: p.a === id.fp ? null : p.s, rdv: rdvValide(o.rdv) });
      changer('positions');
    }
  }

  // ---- ce que la personne fait ----
  /** extra.son : un son du synthé qui voyage avec le message (src/bions/son.js sonPartage le vérifie à l'arrivée) */
  async function dire(texte, salon = PUBLIC, extra = null) {
    const t = String(texte || '').trim().slice(0, 1000); if (!t || !id) return null;
    const s = salons.includes(salon) ? salon : PUBLIC, k = clesSalons.get(s), son = extra && extra.son && typeof extra.son === 'object' ? extra.son : null;
    const p = paquetDe('pub', { s }), charge = son ? { x: t, son } : { x: t };
    p.d = k ? await chiffrer(k, charge, p) : charge;
    emettre(p); poser({ id: p.i, salon: s, de: id.fp, nom: monNom, texte: t, moi: true, ferme: !!k, son, t: maintenant(), sauts: 0 });
    return p.i;
  }
  async function prive(fp, texte, extra = null) {
    const t = String(texte || '').trim().slice(0, 1000); if (!t || !id || !HEX16.test(fp)) return null;
    const k = await clePour(fp); if (!k) return null;   // pas encore sa clé : il ne s'est pas annoncé
    const son = extra && extra.son && typeof extra.son === 'object' ? extra.son : null;
    const p = paquetDe('mp', { a: fp }); p.d = await chiffrer(k, son ? { x: t, son } : { x: t }, p);
    const pr = pairs.get(fp), direct = pr && pr.voisin && voisins.has(pr.voisin) ? [pr.voisin] : null;   // un voisin direct : à lui seul
    emettre(p, direct); poser({ id: p.i, salon: '@' + fp, de: id.fp, nom: monNom, texte: t, moi: true, prive: true, son, etat: 'envoye', t: maintenant(), sauts: 0 });
    return p.i;
  }
  async function rejoindre(salon, mdp = null) {
    const s = String(salon || '').toLowerCase(); if (!SALON.test(s) || s === PUBLIC) return false;
    if (!salons.includes(s)) salons.push(s);
    if (mdp) clesSalons.set(s, await cleSalon(s, String(mdp))); else clesSalons.delete(s);
    garder(); changer('salons'); return true;
  }
  function quitter(salon) { if (salon === PUBLIC) return; salons = salons.filter(s => s !== salon); clesSalons.delete(salon); garder(); changer('salons'); }
  /** une empreinte (16 hex) ou un nom (le premier pair qui le porte) → l'empreinte */
  /* un nom exact d'abord ; un début d'empreinte seulement s'il fait 4 caractères hex au moins (« d » n'est pas « d63e… ») */
  function trouver(x) {
    const s = String(x || '').toLowerCase(); if (HEX16.test(s)) return s; if (!s) return null;
    for (const [fp, p] of pairs) if ((p.nom || '').toLowerCase() === s) return fp;
    if (/^[0-9a-f]{4,}$/.test(s)) for (const fp of pairs.keys()) if (fp.startsWith(s)) return fp;
    return null;
  }
  function bloquer(x) { const fp = trouver(x); if (!fp || fp === (id && id.fp)) return null; bloques.add(fp); garder(); changer('pairs'); return fp; }
  function debloquer(x) { const fp = trouver(x); if (fp && bloques.delete(fp)) { garder(); changer('pairs'); } return fp; }
  // ---- (0.99.22) les favoris, « lu », le code de sécurité, la position ----
  function favori(x, oui = true) { const fp = trouver(x); if (!fp || fp === (id && id.fp)) return null; if (oui) favoris.set(fp, nomPair(fp) || favoris.get(fp) || ''); else favoris.delete(fp); garder(); changer('pairs'); return fp; }
  /** la conversation est ouverte : ses messages reçus deviennent « lus », l'accusé part (une fois chacun) */
  function lire(salon) {
    if (!id || !salon || salon[0] !== '@') return 0; const fp = salon.slice(1); let n = 0;
    for (const m of messages) if (m.salon === salon && !m.moi && !m.lu && m.texte != null) { m.lu = true; n++; emettre(paquetDe('ack', { a: fp, d: { r: m.id, l: 1 } })); }
    if (n) garder(); return n;
  }
  /** 30 chiffres, les mêmes chez les deux : les comparer en vrai prouve que personne ne s'est glissé entre vous */
  async function codeSecurite(x) {
    const fp = trouver(x), pr = fp && pairs.get(fp); if (!id || !pr || !pr.cle) return null;
    const [a, b] = [hex(id.brute), hex(pr.cle)].sort(), h = new Uint8Array(await subtle.digest('SHA-256', enc.encode('ploxi-code-v1|' + a + '|' + b)));
    const v = new DataView(h.buffer); return Array.from({ length: 6 }, (_, i) => String(v.getUint32(i * 4) % 100000).padStart(5, '0')).join(' ');
  }
  function verifier(x, oui = true) { const fp = trouver(x); if (!fp) return null; if (oui) verifies.add(fp); else verifies.delete(fp); garder(); changer('pairs'); return fp; }
  /** partager sa position : pour des potes (leurs empreintes ; chiffrée pour chacun) et/ou un salon FERMÉ (jamais un salon ouvert) ; pos.fin = arrêter */
  async function partagerPosition(pos, { a = [], salon = null } = {}) {
    if (!id || !pos) return 0;
    const charge = pos.fin ? { fin: 1 } : { lat: Math.round(+pos.lat * 1e5) / 1e5, lng: Math.round(+pos.lng * 1e5) / 1e5, precision: Math.round(+pos.precision || 0), cap: Number.isFinite(+pos.cap) ? Math.round(+pos.cap) : null, t: maintenant() };
    if (!pos.fin && pos.rdv) { const r = rdvValide(pos.rdv); if (r) charge.rdv = r; }   // (0.99.29) le rendez-vous voyage avec la position, chiffré pareil
    if (!pos.fin && !(Math.abs(charge.lat) <= 90 && Math.abs(charge.lng) <= 180)) return 0;
    let n = 0;
    for (const fp of new Set(a)) { const k = HEX16.test(fp) ? await clePour(fp) : null; if (!k) continue; const p = paquetDe('pos', { a: fp }); p.d = await chiffrer(k, charge, p); const pr = pairs.get(fp); emettre(p, pr && pr.voisin && voisins.has(pr.voisin) ? [pr.voisin] : null); n++; }
    const ks = salon && clesSalons.get(salon); if (ks) { const p = paquetDe('pos', { s: salon }); p.d = await chiffrer(ks, charge, p); emettre(p); n++; }
    return n;
  }

  /** tout effacer, d'un geste : une nouvelle identité, plus aucun message, salon, bloqué, favori, position, ni rien en cache */
  // ---- ▣ (0.99.35, RS-7 : « de meshlink, seulement le code QR ») LA CARTE D'UN POTE : ma clé publique et mon nom dans un QR ----
  // Le scanner en vrai = le voir en face : il devient un pote ✦ VÉRIFIÉ (comme si on avait comparé le code de sécurité), sa clé est gardée,
  // les messages privés et la position chiffrée marchent tout de suite, même avant qu'il s'annonce dans le maillage. L'empreinte se recalcule
  // depuis la clé : une carte trafiquée (une clé qui ne donne pas son empreinte) est refusée.
  function carte() { return id ? lienCarte({ cle: id.brute, nom: monNom, fp: id.fp }) : null; }
  async function ajouterCarte(texte) {
    if (!id) return { erreur: 'démarre Proche d\'abord' };
    const c = lireCarte(texte); if (!c) return { erreur: 'ce QR n\'est pas une carte de pote ploxi0n' };
    const fp = await empreinte(c.cle);
    if (c.fp && c.fp !== fp) return { erreur: 'carte trafiquée : la clé ne donne pas cette empreinte' };
    if (fp === id.fp) return { erreur: 'c\'est ta propre carte' };
    const pr = pairs.get(fp) || { nom: '', cle: null, vu: 0, sauts: 9, voisin: null };
    if (pr.cle && hex(pr.cle) !== hex(c.cle)) clesPartagees.delete(fp);
    pr.cle = c.cle; pr.nom = pr.nom || c.nom; pairs.set(fp, pr);
    contacts.set(fp, b64(c.cle)); favoris.set(fp, pr.nom || c.nom); verifies.add(fp); bloques.delete(fp);
    garder(); changer('pairs'); return { fp, nom: pr.nom || c.nom };
  }

  async function effacerTout() {
    messages = []; salons = [PUBLIC]; bloques = new Set(); favoris = new Map(); verifies = new Set(); contacts = new Map(); pairs.clear(); clesPartagees.clear(); clesSalons.clear(); cache.length = 0; cacheFav.length = 0; positions.clear();
    id = await identite(null);
    if (magasin) { await magasin.ecrire('maille-identite', id.jwk).catch(() => {}); await magasin.ecrire('maille', { messages: [], salons: [PUBLIC], bloques: [], favoris: [], verifies: [], contacts: [] }).catch(() => {}); }
    if (voisins.size) annoncer();
    changer('tout'); return id.fp;
  }

  return {
    demarrer, arreter, voisin, recevoir, dire, prive, rejoindre, quitter, bloquer, debloquer, effacerTout, trouver,
    favori, lire, codeSecurite, verifier, partagerPosition, carte, ajouterCarte,
    favoris: () => [...favoris].map(([fp, n]) => { const p = pairs.get(fp); return { fp, nom: (p && p.nom) || n, la: !!(p && maintenant() - p.vu < 5 * 60e3), sauts: p ? p.sauts : null, cle: !!(p && p.cle), verifie: verifies.has(fp) }; }),
    positions: () => [...positions.values()].filter(x => maintenant() - x.t < POSITION_VIVE).sort((a, b) => b.t - a.t),
    fil: (salon = PUBLIC) => messages.filter(m => m.salon === salon),
    salons: () => salons.map(s => ({ salon: s, ferme: clesSalons.has(s) })),
    conversations: () => [...new Set(messages.filter(m => m.salon[0] === '@').map(m => m.salon))].map(s => ({ salon: s, fp: s.slice(1), nom: nomPair(s.slice(1)) })),
    pairs: () => [...pairs].filter(([, p]) => maintenant() - p.vu < 5 * 60e3).map(([fp, p]) => ({ fp, nom: p.nom, sauts: p.sauts, direct: !!(p.voisin && voisins.has(p.voisin)), cle: !!p.cle, bloque: bloques.has(fp), favori: favoris.has(fp), verifie: verifies.has(fp) })).sort((a, b) => a.sauts - b.sauts),
    voisins: () => [...voisins], moi: () => (id ? { fp: id.fp, nom: monNom } : null), nommer: (n) => { monNom = String(n || '').slice(0, 24); },
    surChange(f) { auditeurs.add(f); return () => auditeurs.delete(f); },
  };
}
