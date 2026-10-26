// ◉ LE TUYAU DE L'ULTIMATE BLUETOOTH (0.99.1, docs/ULTIMATE-BLUETOOTH.md) : des téléphones proches qui se parlent, sans internet.
// Sur l'iPhone : PloxiProche (AppDelegate.swift, MultipeerConnectivity : le Bluetooth et le Wi-Fi direct ensemble, comme AirDrop ; chiffré).
// Ailleurs (le navigateur, les tests) : un BroadcastChannel, pour essayer avec deux onglets. Le même contrat des deux côtés :
//   demarrer({ nom, salle }) → { moi }   arreter()   envoyer(texte, [ids]?)   pairs() → [id]
//   surPair(({ id, etat: 'connexion' | 'connecte' | 'perdu' }) => …)   surMessage(({ de, donnees }) => …)
// Rien ne part tant que la personne n'a pas démarré (ne pas nuire : on n'annonce pas son téléphone sans qu'elle le veuille).
import { surPromesse } from './plugin-sur.js';
import { decouper, creerRecolleur } from '../bions/fragments.js';
// 〰 (0.99.23, RS-7 : « comme bitchat ») sur l'iPhone, un second tuyau s'ajoute s'il est compilé (PLOXI0N_BLE) : PloxiBLE, le Bluetooth basse
// consommation, qui marche aussi app en arrière-plan. Ses voisins s'appellent « p:… » ou « c:… » ; ses paquets voyagent en morceaux de 180
// octets (src/bions/fragments.js), en base64 sur le pont. Les deux tuyaux portent les mêmes paquets ; le maillage dédoublonne.
const b64 = (u8) => { let s = ''; for (const x of u8) s += String.fromCharCode(x); return btoa(s); };
const deb64 = (s) => { const b = atob(String(s || '')); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
export const estBle = (id) => /^[pc]:/.test(String(id || ''));

const suffixe = () => Math.random().toString(36).slice(2, 6);
// le nom d'un pair : 50 octets au plus (MCPeerID tombe au-delà de 63 avec le suffixe « ·a3f2 »), jamais vide
const octets = (x) => (typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(x).length : unescape(encodeURIComponent(x)).length);
export function court(nom) { let l = [...String(nom || '').replace(/·/g, '-').trim()]; while (l.length && octets(l.join('')) > 50) l.pop(); return l.join('') || 'ploxion'; }

export function creerTuyauProche({ W = globalThis.window, plugin = null, ble = null } = {}) {
  const auditeursPair = new Set(), auditeursMsg = new Set();
  const pair = (e) => { for (const f of auditeursPair) { try { f(e); } catch (x) { /* un auditeur cassé ne casse pas les autres */ } } };
  const msg = (e) => { for (const f of auditeursMsg) { try { f(e); } catch (x) { /* */ } } };
  let actif = false, moi = null;

  if (plugin) {   // l'iPhone
    const P = surPromesse(plugin), B = ble ? surPromesse(ble) : null; let poignees = [], bleActif = false, n = (Math.random() * 2 ** 32) >>> 0;
    const recolleur = creerRecolleur(), voisinsBle = new Set();
    const surMorceau = (e) => { if (!e || !e.de) return; let o = null; try { o = deb64(e.donnees); } catch (x) { return; } const t = recolleur.ajouter(e.de, o); if (t != null) msg({ de: e.de, donnees: t }); };
    const surPairBle = (e) => { if (e && e.id) { if (e.etat === 'connecte') voisinsBle.add(e.id); else if (e.etat === 'perdu') voisinsBle.delete(e.id); } pair(e); };
    function envoyerBle(texte, a) {
      const vers = a && a.length ? a.filter(estBle) : null; if (!bleActif || (vers && !vers.length) || !voisinsBle.size) return Promise.resolve(0);
      let m; try { m = decouper(texte, n = (n + 1) >>> 0); } catch (x) { return Promise.resolve(0); }
      return m.reduce((p, x) => p.then(() => B.envoyer({ donnees: b64(x), ...(vers ? { a: vers } : {}) }).catch(() => null)), Promise.resolve()).then(() => (vers ? vers.length : voisinsBle.size));
    }
    return {
      natif: true,
      demarrer({ nom = 'ploxion', salle = 'xerboxion' } = {}) {
        moi = court(nom) + '·' + suffixe();
        if (!poignees.length) { poignees = [P.addListener('pair', pair), P.addListener('message', msg)]; if (B) poignees.push(B.addListener('pair', surPairBle), B.addListener('message', surMorceau)); }
        if (B) B.demarrer().then(() => { bleActif = true; }, () => { bleActif = false; });   // pas compilé (sans PLOXI0N_BLE) : rien ne change
        return P.demarrer({ nom: moi, salle: String(salle).slice(0, 40) }).then(() => { actif = true; return { moi }; });
      },
      arreter() { actif = false; if (B && bleActif) { bleActif = false; voisinsBle.clear(); B.arreter().catch(() => {}); } return P.arreter().catch(() => {}); },
      envoyer(texte, a) {
        if (!actif) return Promise.resolve({ envoyes: 0 });
        const mc = a && a.length ? a.filter(x => !estBle(x)) : null;
        const un = mc && !mc.length ? Promise.resolve({ envoyes: 0 }) : P.envoyer({ donnees: texte, ...(mc ? { a: mc } : {}) });
        return Promise.all([un, envoyerBle(texte, a)]).then(([r, nb]) => ({ envoyes: ((r && r.envoyes) || 0) + nb }));
      },
      pairs() { return P.pairs().then(r => [...(r && Array.isArray(r.pairs) ? r.pairs : []), ...voisinsBle]); },
      ble: () => bleActif,
      surPair(f) { auditeursPair.add(f); return () => auditeursPair.delete(f); },
      surMessage(f) { auditeursMsg.add(f); return () => auditeursMsg.delete(f); },
      actif: () => actif, moi: () => moi,
    };
  }

  // ailleurs : un BroadcastChannel par salle (deux onglets du même navigateur = deux téléphones)
  let canal = null; const vus = new Map();
  const poster = (o) => { try { canal && canal.postMessage(o); } catch (e) { /* */ } };
  return {
    natif: false,
    demarrer({ nom = 'ploxion', salle = 'xerboxion' } = {}) {
      if (!W || !W.BroadcastChannel) return Promise.reject(new Error('pas de téléphones proches ici'));
      moi = court(nom) + '·' + suffixe();
      canal = new W.BroadcastChannel('ploxi-proche:' + String(salle).slice(0, 40)); actif = true;
      canal.onmessage = (ev) => { const o = ev.data || {}; if (!o.de || o.de === moi) return;
        if (o.k === 'la') { if (!vus.has(o.de)) { vus.set(o.de, 1); pair({ id: o.de, etat: 'connecte' }); poster({ k: 'la', de: moi }); } return; }
        if (o.k === 'parti') { if (vus.delete(o.de)) pair({ id: o.de, etat: 'perdu' }); return; }
        if (o.k === 'msg' && (!o.a || o.a.includes(moi))) msg({ de: o.de, donnees: o.donnees }); };
      poster({ k: 'la', de: moi });
      return Promise.resolve({ moi });
    },
    arreter() { poster({ k: 'parti', de: moi }); actif = false; if (canal) { try { canal.close(); } catch (e) { /* */ } } canal = null; vus.clear(); return Promise.resolve(); },
    envoyer(texte, a) { if (!actif) return Promise.resolve({ envoyes: 0 }); poster({ k: 'msg', de: moi, donnees: texte, a: a && a.length ? a : null }); return Promise.resolve({ envoyes: a && a.length ? a.length : vus.size }); },
    pairs() { return Promise.resolve([...vus.keys()]); },
    surPair(f) { auditeursPair.add(f); return () => auditeursPair.delete(f); },
    surMessage(f) { auditeursMsg.add(f); return () => auditeursMsg.delete(f); },
    actif: () => actif, moi: () => moi,
  };
}
