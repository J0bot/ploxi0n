// @bion fragments — couper un paquet en morceaux qui passent par le Bluetooth basse consommation (≈ 180 octets), et les recoller à l'arrivée | api: decouper, creerRecolleur, ENTETE, MORCEAU
// (0.99.23, RS-7 : « ça doit être comme bitchat ») : bitchat parle en BLE, dont un message fait quelques centaines d'octets au plus ; un paquet
// du maillage (src/bions/maille.js) en fait jusqu'à 16 Ko. Chaque morceau : [0xB1][id sur 4 octets][rang][total][0] puis les octets. À l'arrivée,
// les morceaux d'un même (voisin, id) se recollent dans n'importe quel ordre ; un paquet incomplet est oublié au bout de 30 s ; tout est borné
// (ce qui vient d'à côté est suspect). Pur : le transport (src/natif/proche-natif.js, PloxiBLE en Swift) ne fait que porter des octets.
export const ENTETE = 8, MORCEAU = 180, MAGIQUE = 0xB1, MAX_MORCEAUX = 100;
const enc = new TextEncoder(), dec = new TextDecoder();

/** un texte → des morceaux (Uint8Array) de `taille` octets au plus ; id : 4 octets (un nombre) */
export function decouper(texte, id, taille = MORCEAU) {
  const o = enc.encode(String(texte)), utile = taille - ENTETE, n = Math.max(1, Math.ceil(o.length / utile));
  if (n > MAX_MORCEAUX) throw new Error('fragments : trop gros (' + o.length + ' octets)');
  return Array.from({ length: n }, (_, i) => {
    const corps = o.subarray(i * utile, (i + 1) * utile), m = new Uint8Array(ENTETE + corps.length);
    m[0] = MAGIQUE; new DataView(m.buffer).setUint32(1, id >>> 0); m[5] = i; m[6] = n; m[7] = 0; m.set(corps, ENTETE);
    return m;
  });
}

/** le recolleur d'un téléphone : ajouter(de, octets) → le texte entier quand le dernier morceau arrive, sinon null */
export function creerRecolleur({ maintenant = () => Date.now(), delai = 30000, maxEnCours = 64 } = {}) {
  const enCours = new Map();   // de|id → { t, n, recus, parts[] }
  function nettoyer() { const t = maintenant(); for (const [k, x] of enCours) if (t - x.t > delai) enCours.delete(k); while (enCours.size > maxEnCours) enCours.delete(enCours.keys().next().value); }
  return {
    ajouter(de, octets) {
      if (!(octets instanceof Uint8Array) || octets.length < ENTETE || octets[0] !== MAGIQUE) return null;
      const id = new DataView(octets.buffer, octets.byteOffset).getUint32(1), i = octets[5], n = octets[6];
      if (!n || n > MAX_MORCEAUX || i >= n) return null;
      if (n === 1) return dec.decode(octets.subarray(ENTETE));
      nettoyer();
      const k = de + '|' + id; let x = enCours.get(k);
      if (!x || x.n !== n) { x = { t: maintenant(), n, recus: 0, parts: new Array(n) }; enCours.set(k, x); }
      if (!x.parts[i]) { x.parts[i] = octets.slice(ENTETE); x.recus++; }
      if (x.recus < n) return null;
      enCours.delete(k);
      const tout = new Uint8Array(x.parts.reduce((s, p) => s + p.length, 0)); let o = 0; for (const p of x.parts) { tout.set(p, o); o += p.length; }
      return dec.decode(tout);
    },
    enCours: () => enCours.size,
  };
}
