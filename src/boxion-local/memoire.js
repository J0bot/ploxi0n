// boxion_local en mémoire : pour les tests (même contrat que idb.js et sqlite.js)
import { verifierNs, verifierCle, verifierLog, copie, abonnes } from './contrat.js';

export function creerMemoire({ horloge = () => Date.now() } = {}) {
  const kv = new Map();      // `${ns}\u0000${key}` → { valeur, maj }
  const logs = [];           // { seq, log, t, entry }
  const subs = abonnes();
  let seq = 0;
  return {
    impl: 'memoire',
    async get(ns, key) { verifierNs(ns); verifierCle(key); const x = kv.get(ns + '\u0000' + key); return x ? copie(x.valeur) : null; },
    async put(ns, key, valeur) {
      verifierNs(ns); verifierCle(key);
      if (valeur === null || valeur === undefined) return this.del(ns, key);
      kv.set(ns + '\u0000' + key, { valeur: copie(valeur), maj: horloge() });
      subs.emettre(ns, key, valeur);
    },
    async del(ns, key) { verifierNs(ns); verifierCle(key); if (kv.delete(ns + '\u0000' + key)) subs.emettre(ns, key, null); },
    async list(ns, { prefix = '' } = {}) {
      verifierNs(ns);
      const out = [];
      for (const [k, v] of kv) { const [n, key] = k.split('\u0000'); if (n === ns && key.startsWith(prefix)) out.push({ key, maj: v.maj }); }
      return out.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    },
    watch(ns, fn) { return subs.on(ns, fn); },
    async append(log, entry) { verifierLog(log); const e = { seq: ++seq, log, t: horloge(), entry: copie(entry) }; logs.push(e); return { seq: e.seq, t: e.t }; },
    async lire(log, { depuis = 0, limite = 1000, kind } = {}) {
      verifierLog(log);
      return logs.filter(e => e.log === log && e.seq > depuis && (!kind || (e.entry && e.entry.kind === kind)))
        .slice(0, Math.max(0, limite)).map(e => ({ seq: e.seq, t: e.t, entry: copie(e.entry) }));
    },
    async fermer() { subs.vider(); },
    _abonnes: () => subs.taille(),
  };
}
