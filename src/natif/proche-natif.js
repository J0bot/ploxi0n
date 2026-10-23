// ◉ LE TUYAU DE L'ULTIMATE BLUETOOTH (0.99.1, docs/ULTIMATE-BLUETOOTH.md) : des téléphones proches qui se parlent, sans internet.
// Sur l'iPhone : PloxiProche (AppDelegate.swift, MultipeerConnectivity : le Bluetooth et le Wi-Fi direct ensemble, comme AirDrop ; chiffré).
// Ailleurs (le navigateur, les tests) : un BroadcastChannel, pour essayer avec deux onglets. Le même contrat des deux côtés :
//   demarrer({ nom, salle }) → { moi }   arreter()   envoyer(texte, [ids]?)   pairs() → [id]
//   surPair(({ id, etat: 'connexion' | 'connecte' | 'perdu' }) => …)   surMessage(({ de, donnees }) => …)
// Rien ne part tant que la personne n'a pas démarré (ne pas nuire : on n'annonce pas son téléphone sans qu'elle le veuille).
import { surPromesse } from './plugin-sur.js';

const suffixe = () => Math.random().toString(36).slice(2, 6);
// le nom d'un pair : 50 octets au plus (MCPeerID tombe au-delà de 63 avec le suffixe « ·a3f2 »), jamais vide
const octets = (x) => (typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(x).length : unescape(encodeURIComponent(x)).length);
export function court(nom) { let l = [...String(nom || '').replace(/·/g, '-').trim()]; while (l.length && octets(l.join('')) > 50) l.pop(); return l.join('') || 'ploxion'; }

export function creerTuyauProche({ W = globalThis.window, plugin = null } = {}) {
  const auditeursPair = new Set(), auditeursMsg = new Set();
  const pair = (e) => { for (const f of auditeursPair) { try { f(e); } catch (x) { /* un auditeur cassé ne casse pas les autres */ } } };
  const msg = (e) => { for (const f of auditeursMsg) { try { f(e); } catch (x) { /* */ } } };
  let actif = false, moi = null;

  if (plugin) {   // l'iPhone
    const P = surPromesse(plugin); let poignees = [];
    return {
      natif: true,
      demarrer({ nom = 'ploxion', salle = 'xerboxion' } = {}) {
        moi = court(nom) + '·' + suffixe();
        if (!poignees.length) poignees = [P.addListener('pair', pair), P.addListener('message', msg)];
        return P.demarrer({ nom: moi, salle: String(salle).slice(0, 40) }).then(() => { actif = true; return { moi }; });
      },
      arreter() { actif = false; return P.arreter().catch(() => {}); },
      envoyer(texte, a) { if (!actif) return Promise.resolve({ envoyes: 0 }); return P.envoyer({ donnees: texte, ...(a && a.length ? { a } : {}) }); },
      pairs() { return P.pairs().then(r => (r && Array.isArray(r.pairs) ? r.pairs : [])); },
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
