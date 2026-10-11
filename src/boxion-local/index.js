// choisit l'implémentation de boxion_local selon l'endroit où tourne l'app
import { creerMemoire } from './memoire.js';
import { creerIdb } from './idb.js';
import { creerSqlite, executeurCapacitor } from './sqlite.js';

export async function ouvrirBoxionLocal() {
  const cap = globalThis.Capacitor;
  if (cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) {
    return creerSqlite(await executeurCapacitor());            // l'iPhone : SQLite chiffré, non purgeable
  }
  if (globalThis.indexedDB) {
    try { return await creerIdb(); } catch (e) { /* navigation privée, quota : on retombe en mémoire */ }
  }
  console.warn('[ploxi0n] boxion_local en mémoire : rien ne survivra au rechargement');
  return creerMemoire();
}
export { creerMemoire, creerIdb, creerSqlite };
