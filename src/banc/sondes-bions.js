// Les SONDES DES NOUVEAUX BIONS (0.99.24, RS-7 26.10 : « utilise le banc de test natif pour me faire tout tester les nouveaux bions, comme
// ça je peux te passer le log après »). Chaque bion arrivé de la 0.99.19 à la 0.99.23, essayé POUR DE VRAI sur l'iPhone : le WebCrypto de la
// WebView (le maillage chiffré), le WASM (le cœur Rust), les plugins Swift (PloxiProche, PloxiBLE, PloxiApple), la radio, le GPS, la boussole.
// Même forme que src/banc/sondes.js : { id, groupe, nom, quand, fn(ctx) → { etat, detail } }.
//   'auto'    : rien qui sorte du téléphone, aucune permission (tout se passe en mémoire ou dans les fichiers de l'app)
//   'toucher' : la radio, le GPS, la boussole, le réseau
// Le log ne contient JAMAIS de coordonnées ni de nom de pair : seulement des précisions, des nombres, des durées (il est fait pour être collé).
// extras (src/main.js) : { tuyau: () => le tuyau de Proche, systeme: () => PloxiApple.systeme() | null, position: () => { lat, lng, precision } }
import { creerMaille, remplir, vider } from '../bions/maille.js';
import { decouper, creerRecolleur } from '../bions/fragments.js';
import { relatif, echelle, aiguille, tuilesAutour, URL_TUILE } from '../bions/potes.js';
import { PRESETS, STYLES, codeDuSon, lireCodeSon } from '../bions/son.js';
import { etatVivant } from '../bions/vivant.js';
import { distance, capBoussole } from '../bions/autour.js';
import { chargerCoeur } from '../coeur/rust.js';
import { nomDepuisEmoji } from '../app/glyphes.js';
import { LIGNES } from '../app/langues.js';
import { estBle } from '../natif/proche-natif.js';

/** la permission du mouvement (iOS) : demandée PENDANT le toucher (src/banc/banc.js l'appelle avant tout await), sinon iOS la refuse */
let mouvement = null;
export function demanderMouvement(W) {
  const DOE = W.DeviceOrientationEvent;
  if (!mouvement) mouvement = DOE && typeof DOE.requestPermission === 'function' ? Promise.resolve(DOE.requestPermission()).catch(e => String(e && (e.message || e))) : Promise.resolve('granted');
  return mouvement;
}

export const GROUPE_NOUVEAUX = 'nouveaux bions · 0.99.19 → 0.99.23';
const G = GROUPE_NOUVEAUX;
const ok = (detail = '') => ({ etat: 'ok', detail: String(detail) });
const non = (detail = 'absent') => ({ etat: 'non', detail: String(detail) });
const partiel = (detail) => ({ etat: 'partiel', detail: String(detail) });
const erreur = (detail) => ({ etat: 'erreur', detail: String(detail) });
const ms = (t0) => Math.round(performance.now() - t0) + ' ms';
const dormir = (t) => new Promise(r => setTimeout(r, t));
/** attendre qu'une condition soit vraie (toutes les 20 ms), au plus `max` ms ; rend vrai si elle l'est devenue */
async function jusqua(cond, max = 3000) { const t0 = performance.now(); while (performance.now() - t0 < max) { try { if (cond()) return true; } catch (e) { /* */ } await dormir(20); } return false; }

/** des téléphones simulés, reliés en ligne (A–B–C–D), avec le VRAI maillage et le vrai WebCrypto de l'appareil */
async function reseauSimule(W, noms) {
  const subtle = W.crypto && W.crypto.subtle; if (!subtle) throw new Error('WebCrypto absent');
  const alea = (n) => W.crypto.getRandomValues(new Uint8Array(n)), T = {}, cables = new Set(), relayes = {};
  for (const n of noms) {
    relayes[n] = [];
    T[n] = creerMaille({ subtle, alea, nom: n, attente: (t, f) => setTimeout(f, 1), repeter: () => () => {},
      envoyer: (texte, vers) => { for (const v of vers || T[n].voisins()) if (cables.has(n + '|' + v)) setTimeout(() => { relayes[v].push(texte); T[v].recevoir(n, texte); }, 1); } });
  }
  for (const n of noms) await T[n].demarrer();
  for (let i = 1; i < noms.length; i++) { const a = noms[i - 1], b = noms[i]; cables.add(a + '|' + b); cables.add(b + '|' + a); T[a].voisin(b, 'connecte'); T[b].voisin(a, 'connecte'); }
  return { T, relayes, arreter: () => { for (const n of noms) { try { T[n].arreter(); } catch (e) { /* */ } } } };
}

export function sondesBions(W, extras = {}) {
  const tuyau = () => (extras.tuyau ? extras.tuyau() : null);
  return [
    // ---- 〰 le maillage (0.99.21–22) ----------------------------------------------------------------------------------------------------
    { id: 'nb-maille', groupe: G, nom: 'maillage : 4 téléphones simulés (A–B–C–D), le vrai chiffrement de l\'iPhone', quand: 'auto', fn: async () => {
      const t0 = performance.now(), R = await reseauSimule(W, ['A', 'B', 'C', 'D']), { T } = R, etapes = [];
      try {
        if (!(await jusqua(() => T.A.trouver('D'), 3000))) return erreur('A ne voit pas D après 3 s (les annonces ne passent pas)');
        const tAnn = ms(t0);
        await T.A.dire('salut le banc');
        etapes.push((await jusqua(() => T.D.fil().some(m => m.texte === 'salut le banc'))) ? 'public ✓ (3 sauts)' : 'public ✗');
        const fpD = T.D.moi().fp, fpA = T.A.moi().fp;
        await T.A.prive(fpD, 'code 4417');
        const recu = await jusqua(() => T.D.fil('@' + fpA).some(m => m.texte === 'code 4417'));
        const clair = R.relayes.B.concat(R.relayes.C).some(t => t.includes('4417'));
        etapes.push(recu ? (clair ? 'privé ✗ (EN CLAIR chez un relais)' : 'privé chiffré ✓') : 'privé ✗ (pas reçu)');
        await T.A.rejoindre('#banc', 'pomme'); await T.D.rejoindre('#banc', 'pomme'); await T.B.rejoindre('#banc', 'poire');
        await T.A.dire('le mot', '#banc');
        const salonOk = await jusqua(() => T.D.fil('#banc').some(m => m.texte === 'le mot'));
        const fuite = T.B.fil('#banc').some(m => m.texte === 'le mot');
        etapes.push(salonOk && !fuite ? 'salon fermé ✓ (PBKDF2)' : 'salon fermé ✗' + (fuite ? ' (lu avec le mauvais mot de passe)' : ''));
        await T.A.partagerPosition({ lat: 46.52, lng: 6.63, precision: 8 }, { a: [fpD] });
        const pos = await jusqua(() => T.D.positions().length === 1);
        etapes.push(pos && !T.B.positions().length ? 'position chiffrée ✓' : 'position ✗');
        const ca = await T.A.codeSecurite(fpD), cd = await T.D.codeSecurite(fpA);
        etapes.push(ca && ca === cd ? 'code de sécurité ✓' : 'code de sécurité ✗');
        const tout = etapes.every(e => e.includes('✓'));
        return { etat: tout ? 'ok' : 'partiel', detail: `${etapes.join(' · ')} · annonces ${tAnn}, tout ${ms(t0)}` };
      } finally { R.arreter(); }
    } },
    { id: 'nb-rembourrage', groupe: G, nom: 'maillage : rembourrage (la taille ne trahit pas le message)', quand: 'auto', fn: () => {
      const alea = (n) => W.crypto.getRandomValues(new Uint8Array(n)), r = remplir(new TextEncoder().encode('salut'), alea);
      return new TextDecoder().decode(vider(r)) === 'salut' && r.length === 256 ? ok('5 octets → 256, relus') : erreur('remplir/vider ne se répondent pas');
    } },
    // ---- ≈ le Bluetooth basse consommation (0.99.23, option PLOXI0N_BLE) -------------------------------------------------------------------
    { id: 'nb-fragments', groupe: G, nom: 'BLE : un paquet de 16 Ko en morceaux de 180 octets, recollés dans le désordre', quand: 'auto', fn: () => {
      const t0 = performance.now(), texte = 'x'.repeat(8000) + 'é'.repeat(4000), m = decouper(texte, 7);
      const r = creerRecolleur(); let fin = null;
      for (const i of m.map((_, i) => i).sort(() => Math.random() - 0.5)) { const x = r.ajouter('p:banc', m[i]); if (x != null) fin = x; }
      return fin === texte ? ok(`${m.length} morceaux, recollés en ${ms(t0)}`) : erreur('le paquet recollé diffère');
    } },
    { id: 'nb-plugins', groupe: G, nom: 'les plugins Swift de l\'app (compilés dans ce build ?)', quand: 'auto', fn: (c) => {
      if (!c.natif()) return non('natif seulement');
      const C = W.Capacitor, dispo = (n) => !!(C && C.isPluginAvailable && C.isPluginAvailable(n));
      const noms = ['PloxiApple', 'PloxiProche', 'PloxiLecteur', 'PloxiAR', 'PloxiVocal'], manquants = noms.filter(n => !dispo(n));
      const ble = dispo('PloxiBLE') ? 'PloxiBLE ✓ (build avec PLOXI0N_BLE)' : 'PloxiBLE : pas compilé (build sans PLOXI0N_BLE)';
      return manquants.length ? partiel('manquent : ' + manquants.join(', ') + ' · ' + ble) : ok(noms.length + ' ✓ · ' + ble);
    } },
    // ---- ⌖ les potes (0.99.22) -------------------------------------------------------------------------------------------------------
    { id: 'nb-potes', groupe: G, nom: 'potes : radar, boussole, échelle, tuiles (le calcul)', quand: 'auto', fn: () => {
      const moi = { lat: 46.52, lng: 6.63 }, n = relatif(moi, { lat: 46.521, lng: 6.63 }), e = echelle([n.d]);
      const l = tuilesAutour(moi.lat, moi.lng, e / 160, 320, 320);
      const bon = Math.abs(n.d - 111.2) < 1 && n.cap < 0.5 && e === 200 && aiguille(90, 90) === 0 && l.length >= 1 && l.length <= 16;
      return bon ? ok(`111 m au nord → radar ${e} m, ${l.length} tuiles`) : erreur(JSON.stringify({ d: n.d, cap: n.cap, e, tuiles: l.length }));
    } },
    { id: 'nb-gps', groupe: G, nom: 'potes : ta position (GPS, sans réseau)', quand: 'toucher', fn: async () => {
      if (!extras.position) return non('pas de position ici');
      const t0 = performance.now(), p = await extras.position();
      if (!p || !Number.isFinite(p.lat)) return erreur('pas de position');
      const n = relatif(p, { lat: p.lat + 0.001, lng: p.lng });   // un pote fictif à ~111 m au nord de toi
      return ok(`fix en ${ms(t0)} · ± ${Math.round(p.precision || 0)} m · pote fictif à ${Math.round(n.d)} m, cap ${Math.round(n.cap)}°`);
    } },
    { id: 'nb-boussole', groupe: G, nom: 'potes : la boussole (le cap de l\'iPhone)', quand: 'toucher', fn: async () => {
      const DOE = W.DeviceOrientationEvent; if (!DOE) return non('DeviceOrientationEvent absent');
      const r = await demanderMouvement(W); if (r !== 'granted') { mouvement = null; return { etat: 'refuse', detail: 'mouvement : ' + r }; }
      const caps = []; let precision = null;
      const f = (e) => { const c = capBoussole(e); if (c != null) { caps.push(c); if (e.webkitCompassAccuracy != null) precision = e.webkitCompassAccuracy; } };
      W.addEventListener('deviceorientation', f, true);
      try { await jusqua(() => caps.length >= 5, 5000); } finally { W.removeEventListener('deviceorientation', f, true); }
      if (!caps.length) return non('aucun cap en 5 s');
      return ok(`${caps.length} caps · le dernier ${Math.round(caps[caps.length - 1])}°` + (precision != null ? ` · ± ${Math.round(precision)}°` : ''));
    } },
    { id: 'nb-tuiles', groupe: G, nom: 'potes : une tuile de la carte (CARTO, réseau)', quand: 'toucher', fn: async () => {
      const t0 = performance.now(), r = await W.fetch(URL_TUILE(2, 2, 1), { cache: 'no-store' });
      if (!r.ok) return erreur('HTTP ' + r.status);
      const b = await r.blob();
      return ok(`HTTP 200 · ${Math.round(b.size / 1024)} Ko · ${ms(t0)}`);
    } },
    // ---- ◉ Proche en vrai (la radio) ----------------------------------------------------------------------------------------------------
    { id: 'nb-radio', groupe: G, nom: 'Proche en vrai : 15 s d\'écoute (ouvre Proche sur un 2e iPhone à côté)', quand: 'toucher', fn: async (c) => {
      const t = tuyau(); if (!t) return non('pas de tuyau Proche');
      const deja = t.actif(), vus = new Set(), messages = { n: 0 };
      const off1 = t.surPair((e) => { if (e && e.id && e.etat === 'connecte') vus.add(e.id); });
      const off2 = t.surMessage(() => { messages.n++; });
      try {
        if (!deja) await t.demarrer({ nom: 'banc' });
        await dormir(15000);
        const pairs = await t.pairs(), ble = pairs.filter(estBle).length;
        const via = t.ble ? (t.ble() ? 'BLE actif' : 'BLE éteint') : 'BLE —';
        const d = `${pairs.length} voisin(s) (${pairs.length - ble} Multipeer, ${ble} BLE) · ${vus.size} connexion(s) vue(s) · ${messages.n} paquet(s) reçu(s) · ${via}` + (c.natif() ? '' : ' (navigateur : BroadcastChannel)');
        return pairs.length ? ok(d) : partiel(d + ' · personne autour ?');
      } finally { off1(); off2(); if (!deja) { try { await t.arreter(); } catch (e) { /* */ } } }
    } },
    // ---- ≋ le son (0.99.21) -----------------------------------------------------------------------------------------------------------
    { id: 'nb-son-codes', groupe: G, nom: 'synthé : les codes ploxi-son (chaque son, aller-retour)', quand: 'auto', fn: () => {
      const noms = Object.keys(PRESETS), rates = [];
      for (const nom of noms) { const code = codeDuSon({ nom, p: PRESETS[nom] }), lu = lireCodeSon('écoute ça ' + code); if (!lu || lu.nom !== nom) rates.push(nom); }
      return rates.length ? erreur('ratés : ' + rates.join(', ')) : ok(`${noms.length} sons · ${Object.keys(STYLES).length} styles (${Object.keys(STYLES).join(', ')})`);
    } },
    { id: 'nb-son-rendu', groupe: G, nom: 'synthé : le moteur audio (un kick rendu hors ligne, sans bruit)', quand: 'auto', fn: async () => {
      const OAC = W.OfflineAudioContext || W.webkitOfflineAudioContext; if (!OAC) return non('OfflineAudioContext absent');
      const t0 = performance.now(), ctx = new OAC(1, 22050, 44100), o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(150, 0); o.frequency.exponentialRampToValueAtTime(40, 0.15);
      g.gain.setValueAtTime(1, 0); g.gain.exponentialRampToValueAtTime(0.001, 0.4);
      o.connect(g); g.connect(ctx.destination); o.start(0); o.stop(0.45);
      const b = await ctx.startRendering(), d = b.getChannelData(0); let pic = 0; for (let i = 0; i < d.length; i++) pic = Math.max(pic, Math.abs(d[i]));
      return pic > 0.2 ? ok(`0,5 s rendue en ${ms(t0)} · pic ${pic.toFixed(2)}`) : erreur('rendu silencieux (pic ' + pic.toFixed(3) + ')');
    } },
    // ---- 🦀 le cœur Rust (0.99.17, branché dans les bions) --------------------------------------------------------------------------------
    { id: 'nb-coeur', groupe: G, nom: 'cœur Rust (WASM) : chargé, et il répond comme le JS', quand: 'auto', fn: async () => {
      const t0 = performance.now(), c = await chargerCoeur('coeur/ploxi_coeur.wasm'), tCharge = ms(t0);
      const a = { lat: 46.52, lng: 6.63 }, b = { lat: 46.53, lng: 6.65 };
      const rust = c.appel('autour.distance', { a, b }), js = distance(a, b);
      const pareil = Math.abs(rust - js) < 1e-6;
      return pareil ? ok(`v${c.version} · chargé en ${tCharge} · distance ${Math.round(js)} m (Rust = JS)`) : erreur(`Rust ${rust} ≠ JS ${js}`);
    } },
    // ---- ◌ le bord vivant : le disque (0.99.23) --------------------------------------------------------------------------------------
    { id: 'nb-vivant', groupe: G, nom: 'bord vivant : l\'état réel de l\'iPhone (chaleur, économie, disque)', quand: 'auto', fn: async () => {
      const simule = etatVivant({ disqueLibre: 1e9 });
      if (simule.teinte !== 'plein' || !simule.irregulier) return erreur('disque plein simulé : ' + JSON.stringify(simule));
      const s = extras.systeme ? await extras.systeme() : null;
      if (!s) return partiel('disque plein simulé ✓ · le vrai état : natif seulement');
      const e = etatVivant({ thermique: s.thermique, economie: s.economie, disqueLibre: s.disqueLibre });
      const go = s.disqueLibre != null ? (s.disqueLibre / 1e9).toFixed(1) + ' Go libres' : 'disque ?';
      return ok(`disque plein simulé ✓ · maintenant : ${s.thermique} · ${go} · économie ${s.economie ? 'oui' : 'non'} → teinte « ${e.teinte} »${e.irregulier ? ', irrégulier' : ''}`);
    } },
    // ---- Aa les langues, ✓ le marketplace, ⬇ les bibliothèques, 〰 les glyphes ------------------------------------------------------------
    { id: 'nb-langues', groupe: G, nom: 'langues : la table (fr, en, de, it, es) et la langue de l\'iPhone', quand: 'auto', fn: () => {
      const trous = [1, 2, 3, 4].map(i => LIGNES.filter(l => !l[i]).length), N = W.navigator || {};
      return trous.every(x => x === 0) ? ok(`${LIGNES.length} phrases, aucune manquante · l'iPhone : ${N.language || '?'} (${(N.languages || []).slice(0, 3).join(', ')})`)
        : partiel(`manquent en/de/it/es : ${trous.join('/')}`);
    } },
    { id: 'nb-compat', groupe: G, nom: 'marketplace : le bilan iPhone (compat.json, dans l\'app)', quand: 'auto', fn: async () => {
      const r = await W.fetch('marketplace/compat.json'); if (!r.ok) return erreur('compat.json : HTTP ' + r.status);
      const j = await r.json(), l = Array.isArray(j) ? j : Object.values(j.ploxions || j), n = (x) => l.filter(c => c && c.ip === x).length;
      return n('ok') ? ok(`${n('ok')} ✓ · ${n('attend')} attendent · ${n('casse')} cassés`) : partiel('aucun ip dans compat.json');
    } },
    { id: 'nb-vendor', groupe: G, nom: 'bibliothèques des ploxions, dans l\'app (0.99.19 : sans réseau)', quand: 'auto', fn: async () => {
      const fichiers = ['vendor/three.min.js', 'vendor/js/fflate.min.js', 'vendor/js/pdf-lib.min.js', 'vendor/js/qrcode.min.js', 'vendor/js/openpgp.min.js'], manquent = [];
      for (const f of fichiers) { try { const r = await W.fetch(f); if (!r.ok) manquent.push(f); } catch (e) { manquent.push(f); } }
      return manquent.length ? partiel('manquent : ' + manquent.join(', ')) : ok(fichiers.length + ' fichiers présents (three, fflate, pdf-lib, qrcode, openpgp)');
    } },
    { id: 'nb-glyphes', groupe: G, nom: 'glyphes : les signes que le filtre effaçait (〰)', quand: 'auto', fn: () => (nomDepuisEmoji('〰') === 'vague' ? ok('〰 → vague') : erreur('〰 sans glyphe')) },
  ];
}
