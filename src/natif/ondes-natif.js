// ᛒ LES ONDES (0.99.20, 05.11 ; RS-7 : « le Bluetooth low level aussi, pour Proche et Autour ») : window.jOSOndes. Tout ce qui émet en
// Bluetooth autour de toi, brut : nom, force du signal, distance estimée, fabricant, et les ploxis (les téléphones qui s'annoncent
// avec le service xerboxion). Sur l'iPhone : PloxiOndes (CoreBluetooth). Ailleurs : null (le navigateur ne sait pas scanner).
//   scanner() · arreter() · annoncer(nom) · arreterAnnonce() · appareils() → [{id, nom, rssi, distance, fabricant, ploxi, vu}] · sur(f)
import { surPromesse } from './plugin-sur.js';

export const SERVICE_XB = '6E1D0000-0000-4000-8000-0000000C0DE0';
// les identifiants de fabricant (Bluetooth SIG), les plus courants autour de soi
export const FABRICANTS = { 0x004c: 'Apple', 0x0006: 'Microsoft', 0x0075: 'Samsung', 0x00e0: 'Google', 0x02e5: 'Espressif (ESP32)', 0x0059: 'Nordic',
  0x038f: 'Xiaomi', 0x0157: 'Huami', 0x0087: 'Garmin', 0x0499: 'Ruuvi', 0x0171: 'Amazon', 0x00d2: 'Bose', 0x012d: 'Sony', 0x0310: 'Tile', 0x0822: 'Govee' };

/** le fabricant : les 2 premiers octets des données, petit-boutiste */
export function fabricant(hex) {
  if (!hex || hex.length < 4) return '';
  const id = parseInt(hex.slice(2, 4) + hex.slice(0, 2), 16);
  return FABRICANTS[id] || ('0x' + id.toString(16).padStart(4, '0'));
}
/** la distance (m) d'après le signal : le modèle log-distance, la puissance à 1 m annoncée (sinon -59 dBm), n = 2,2 (une pièce) */
export function distance(rssi, tx) {
  const a = Number.isFinite(tx) && tx < 0 ? tx : -59;
  return Math.round(Math.pow(10, (a - rssi) / 22) * 10) / 10;
}

export function creerOndes({ plugin = null, maintenant = () => Date.now() } = {}) {
  if (!plugin) return null;
  const P = surPromesse(plugin), vus = new Map(), auditeurs = new Set();
  let poignee = null;
  const recu = (o) => {
    if (!o || !o.id) return;
    const v = vus.get(o.id) || { id: o.id, rssi: o.rssi };
    v.rssi = Math.round(v.rssi * 0.6 + o.rssi * 0.4);   // lissé : le signal saute de ±6 dB
    v.nom = o.nom || v.nom || ''; v.tx = o.tx; v.connectable = !!o.connectable;
    v.fabricant = fabricant(o.fabricant) || v.fabricant || '';
    v.ploxi = (o.services || []).some(s => String(s).toUpperCase() === SERVICE_XB);
    v.distance = distance(v.rssi, v.tx); v.vu = maintenant();
    vus.set(o.id, v);
    for (const f of auditeurs) { try { f(v); } catch (e) { /* */ } }
  };
  return {
    natif: true,
    scanner() { if (!poignee) poignee = P.addListener('appareil', recu); return P.scanner({ doublons: true }); },
    arreter() { return P.arreterScan().catch(() => {}); },
    annoncer: (nom) => P.annoncer({ nom: String(nom || 'ploxion').slice(0, 20) }),
    arreterAnnonce: () => P.arreterAnnonce().catch(() => {}),
    /** ce qui a émis dans les 30 dernières secondes, du plus proche au plus loin */
    appareils() { const t = maintenant(); return [...vus.values()].filter(v => t - v.vu < 30000).sort((a, b) => b.rssi - a.rssi); },
    sur(f) { auditeurs.add(f); return () => auditeurs.delete(f); },
    _recu: recu,
  };
}
