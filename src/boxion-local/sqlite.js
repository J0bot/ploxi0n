// boxion_local sur SQLite : iOS (brief : « impl ios → @capacitor-community/sqlite, chiffré, fichier dans le conteneur de l'app, non purgeable »).
// La logique SQL ne parle qu'à un EXÉCUTEUR { run(sql, params) → { lastId }, query(sql, params) → lignes } :
//   - executeurCapacitor()  la base chiffrée du plugin sur l'iPhone
//   - les tests passent le même code sur node:sqlite (tests/contrat-boxion.test.mjs)
// Même contrat que memoire.js et idb.js.
import { verifierNs, verifierCle, verifierLog, copie, abonnes } from './contrat.js';

export const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS kv (ns TEXT NOT NULL, key TEXT NOT NULL, valeur TEXT NOT NULL, maj INTEGER NOT NULL, PRIMARY KEY (ns, key))',
  'CREATE TABLE IF NOT EXISTS logs (seq INTEGER PRIMARY KEY AUTOINCREMENT, log TEXT NOT NULL, t INTEGER NOT NULL, kind TEXT, entry TEXT NOT NULL)',
  'CREATE INDEX IF NOT EXISTS logs_log_seq ON logs (log, seq)',
];

export async function creerSqlite(ex, { horloge = () => Date.now() } = {}) {
  for (const s of SCHEMA) await ex.run(s, []);
  const subs = abonnes();
  return {
    impl: 'sqlite',
    async get(ns, key) {
      verifierNs(ns); verifierCle(key);
      const r = await ex.query('SELECT valeur FROM kv WHERE ns = ? AND key = ?', [ns, key]);
      return r.length ? JSON.parse(r[0].valeur) : null;
    },
    async put(ns, key, valeur) {
      verifierNs(ns); verifierCle(key);
      if (valeur === null || valeur === undefined) return this.del(ns, key);
      await ex.run('INSERT INTO kv (ns, key, valeur, maj) VALUES (?, ?, ?, ?) ON CONFLICT(ns, key) DO UPDATE SET valeur = excluded.valeur, maj = excluded.maj',
        [ns, key, JSON.stringify(copie(valeur)), horloge()]);
      subs.emettre(ns, key, valeur);
    },
    async del(ns, key) {
      verifierNs(ns); verifierCle(key);
      const avant = await ex.query('SELECT 1 AS x FROM kv WHERE ns = ? AND key = ?', [ns, key]);
      if (!avant.length) return;
      await ex.run('DELETE FROM kv WHERE ns = ? AND key = ?', [ns, key]);
      subs.emettre(ns, key, null);
    },
    async list(ns, { prefix = '' } = {}) {
      verifierNs(ns);
      // pas de LIKE (les % et _ d'une clé seraient des jokers) : un intervalle de chaînes
      const r = await ex.query('SELECT key, maj FROM kv WHERE ns = ? AND key >= ? AND key < ? ORDER BY key', [ns, prefix, prefix + '￿']);
      return r.map(x => ({ key: x.key, maj: Number(x.maj) }));
    },
    watch(ns, fn) { return subs.on(ns, fn); },
    async append(log, entry) {
      verifierLog(log);
      const t = horloge(), e = copie(entry), kind = e && typeof e === 'object' && typeof e.kind === 'string' ? e.kind : null;
      const r = await ex.run('INSERT INTO logs (log, t, kind, entry) VALUES (?, ?, ?, ?)', [log, t, kind, JSON.stringify(e)]);
      return { seq: Number(r.lastId), t };   // l'id d'insertion (pas un MAX : deux append dans la même milliseconde)
    },
    async lire(log, { depuis = 0, limite = 1000, kind } = {}) {
      verifierLog(log);
      const r = kind
        ? await ex.query('SELECT seq, t, entry FROM logs WHERE log = ? AND seq > ? AND kind = ? ORDER BY seq LIMIT ?', [log, depuis, kind, limite])
        : await ex.query('SELECT seq, t, entry FROM logs WHERE log = ? AND seq > ? ORDER BY seq LIMIT ?', [log, depuis, limite]);
      return r.map(x => ({ seq: Number(x.seq), t: Number(x.t), entry: JSON.parse(x.entry) }));
    },
    async fermer() { subs.vider(); if (ex.fermer) await ex.fermer(); },
  };
}

// l'exécuteur de l'iPhone : @capacitor-community/sqlite, base chiffrée (SQLCipher ; le secret vit dans le trousseau iOS, géré par le plugin)
export async function executeurCapacitor({ base = 'ploxi0n-boxion' } = {}) {
  const { CapacitorSQLite, SQLiteConnection } = await import('@capacitor-community/sqlite');
  const sqlite = new SQLiteConnection(CapacitorSQLite);
  const secret = await sqlite.isSecretStored();
  if (!secret.result) {
    // un secret aléatoire par installation, stocké par le plugin dans le trousseau (jamais dans le code ni dans la WebView)
    const a = new Uint8Array(32); crypto.getRandomValues(a);
    await sqlite.setEncryptionSecret(Array.from(a, b => b.toString(16).padStart(2, '0')).join(''));
  }
  const cohérent = (await sqlite.checkConnectionsConsistency()).result;
  const existe = (await sqlite.isConnection(base, false)).result;
  const db = cohérent && existe ? await sqlite.retrieveConnection(base, false) : await sqlite.createConnection(base, true, 'secret', 1, false);
  await db.open();
  return {
    async run(sql, params) { const r = await db.run(sql, params, false); return { lastId: r && r.changes ? r.changes.lastId : undefined }; },
    async query(sql, params) { return (await db.query(sql, params)).values || []; },
    async fermer() { await sqlite.closeConnection(base, false); },
  };
}
