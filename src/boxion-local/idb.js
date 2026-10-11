// boxion_local sur IndexedDB : le dev sur PC (brief : « impl web → IndexedDB, dev sur PC uniquement »). Même contrat que memoire.js.
import { verifierNs, verifierCle, verifierLog, copie, abonnes } from './contrat.js';

function req(r) { return new Promise((ok, ko) => { r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); }); }
function fin(tx) { return new Promise((ok, ko) => { tx.oncomplete = () => ok(); tx.onerror = () => ko(tx.error); tx.onabort = () => ko(tx.error); }); }

export async function creerIdb({ nom = 'ploxi0n-boxion', indexedDB = globalThis.indexedDB, horloge = () => Date.now() } = {}) {
  if (!indexedDB) throw new Error('boxion_local : IndexedDB absent');
  const ouv = indexedDB.open(nom, 1);
  ouv.onupgradeneeded = () => {
    const db = ouv.result;
    db.createObjectStore('kv', { keyPath: ['ns', 'key'] });
    const l = db.createObjectStore('logs', { keyPath: 'seq', autoIncrement: true });
    l.createIndex('log_seq', ['log', 'seq']);
  };
  const db = await req(ouv);
  const subs = abonnes();
  return {
    impl: 'idb',
    async get(ns, key) { verifierNs(ns); verifierCle(key); const x = await req(db.transaction('kv').objectStore('kv').get([ns, key])); return x ? copie(x.valeur) : null; },
    async put(ns, key, valeur) {
      verifierNs(ns); verifierCle(key);
      if (valeur === null || valeur === undefined) return this.del(ns, key);
      const tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put({ ns, key, valeur: copie(valeur), maj: horloge() }); await fin(tx);
      subs.emettre(ns, key, valeur);
    },
    async del(ns, key) {
      verifierNs(ns); verifierCle(key);
      const tx = db.transaction('kv', 'readwrite'); const st = tx.objectStore('kv');
      const avant = await req(st.get([ns, key])); if (avant) st.delete([ns, key]); await fin(tx);
      if (avant) subs.emettre(ns, key, null);
    },
    async list(ns, { prefix = '' } = {}) {
      verifierNs(ns);
      const bas = [ns, prefix], haut = [ns, prefix + '￿'];
      const tous = await req(db.transaction('kv').objectStore('kv').getAll(IDBKeyRange.bound(bas, haut)));
      return tous.map(x => ({ key: x.key, maj: x.maj }));
    },
    watch(ns, fn) { return subs.on(ns, fn); },
    async append(log, entry) {
      verifierLog(log);
      const t = horloge(), tx = db.transaction('logs', 'readwrite');
      const seq = await req(tx.objectStore('logs').add({ log, t, entry: copie(entry) })); await fin(tx);
      return { seq, t };
    },
    async lire(log, { depuis = 0, limite = 1000, kind } = {}) {
      verifierLog(log);
      const out = [], idx = db.transaction('logs').objectStore('logs').index('log_seq');
      await new Promise((ok, ko) => {
        const c = idx.openCursor(IDBKeyRange.bound([log, depuis + 1], [log, Number.MAX_SAFE_INTEGER]));
        c.onerror = () => ko(c.error);
        c.onsuccess = () => {
          const cur = c.result;
          if (!cur || out.length >= limite) return ok();
          const v = cur.value;
          if (!kind || (v.entry && v.entry.kind === kind)) out.push({ seq: v.seq, t: v.t, entry: copie(v.entry) });
          cur.continue();
        };
      });
      return out;
    },
    async fermer() { subs.vider(); db.close(); },
  };
}
