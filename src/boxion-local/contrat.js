// boxion_local — LE stockage de ploxi0n (brief v1, section « boxion_local »). Tout passe par cette interface : les ploxions (via le shim jOS),
// HealthKit plus tard, et le Boxion distant (sync) ne sont que des producteurs ou des consommateurs derrière elle. Un ploxion ne sait jamais
// où sont ses données.
//
//   get(ns, key)               → valeur | null
//   put(ns, key, valeur)       → void           (valeur = n'importe quel JSON ; null efface)
//   del(ns, key)               → void
//   list(ns, { prefix })       → [{ key, maj }] triées par clé
//   watch(ns, fn)              → off()          fn({ ns, key, valeur }) à chaque put/del de ce ns (« * » = tous)
//   append(log, entry)         → { seq, t }     journal append-only horodaté ('xion', 'tsoins'…) : la file de sync quand un Boxion est appairé
//   lire(log, { depuis, limite, kind }) → [{ seq, t, entry }]   dans l'ordre, après la séquence `depuis`
//   fermer()
//
// Trois implémentations, un seul contrat (tests/contrat-boxion.test.mjs les passe toutes) :
//   memoire.js   les tests
//   idb.js       le dev sur PC (IndexedDB)
//   sqlite.js    iOS (@capacitor-community/sqlite, chiffré, dans le conteneur de l'app : non purgeable)

export const NOMS_LOG = /^[a-z][a-z0-9_.-]{0,39}$/;
export const NOMS_NS = /^[^\u0000-\u001f]{1,80}$/;

export function verifierNs(ns) {
  if (typeof ns !== 'string' || !NOMS_NS.test(ns)) throw new TypeError('boxion_local : espace de noms invalide ' + JSON.stringify(ns));
}
export function verifierCle(key) {
  if (typeof key !== 'string' || key.length < 1 || key.length > 400) throw new TypeError('boxion_local : clé invalide');
}
export function verifierLog(log) {
  if (typeof log !== 'string' || !NOMS_LOG.test(log)) throw new TypeError('boxion_local : nom de journal invalide ' + JSON.stringify(log));
}
// une valeur stockée = du JSON : on la copie à l'entrée et à la sortie (jamais de partage de référence avec l'appelant)
export function copie(v) { return v === undefined ? null : JSON.parse(JSON.stringify(v)); }

/** les abonnés de watch(), communs aux implémentations */
export function abonnes() {
  const subs = new Map();
  return {
    on(ns, fn) { if (!subs.has(ns)) subs.set(ns, new Set()); subs.get(ns).add(fn); return () => { const s = subs.get(ns); if (s) { s.delete(fn); if (!s.size) subs.delete(ns); } }; },
    emettre(ns, key, valeur) {
      for (const cible of [ns, '*']) for (const fn of [...(subs.get(cible) || [])]) { try { fn({ ns, key, valeur: copie(valeur) }); } catch (e) { /* un abonné ne casse pas les autres */ } }
    },
    taille() { let n = 0; for (const s of subs.values()) n += s.size; return n; },
    vider() { subs.clear(); },
  };
}
