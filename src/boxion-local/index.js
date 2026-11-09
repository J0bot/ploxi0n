// choisit l'implémentation de boxion_local selon l'endroit où tourne l'app
import { creerMemoire } from './memoire.js';
import { creerIdb } from './idb.js';
import { creerSqlite, executeurCapacitor } from './sqlite.js';

// (0.69, RS-7 14.10 : « ploxi0n n'a pas pu démarrer : Run: Failed in runSQL : … rc: 14 message: unable to open database file ») : SQLITE_CANTOPEN,
// la base chiffrée par iOS tant que l'iPhone est verrouillé (un démarrage en arrière-plan : le son, un raccourci « dodo »). On ne s'arrête plus
// au premier refus : la connexion est refermée et rouverte, et on attend que l'app soit au premier plan (déverrouillée) avant chaque nouvel
// essai. Côté iOS, le dossier de la base passe en « jusqu'au premier déverrouillage » (AppDelegate.swift).
export const VERROUILLE = /rc:\s*14\b|unable to open database|SQLITE_CANTOPEN/i;
const attendreMs = (ms) => new Promise(r => setTimeout(r, ms));
function auPremierPlan(D, max) {
  if (!D || !D.hidden) return Promise.resolve();
  return new Promise((r) => { const fin = () => { D.removeEventListener('visibilitychange', voir); clearTimeout(t); r(); }; const voir = () => { if (!D.hidden) fin(); }; const t = setTimeout(fin, max); D.addEventListener('visibilitychange', voir); });
}
/** ouvre SQLite en réessayant : rend le boxion, ou lève la dernière erreur (err.verrouille : l'iPhone semblait verrouillé) */
export async function ouvrirSqliteResilient({ ouvrir = async () => { const ex = await executeurCapacitor(); try { return await creerSqlite(ex); } catch (e) { try { await ex.fermer(); } catch (er) { /* */ } throw e; } },
  essais = 5, pause = (k) => 400 * k * k, attendre = attendreMs, D = globalThis.document, surEssai = () => {} } = {}) {
  let derniere = null;
  for (let k = 1; k <= essais; k++) {
    try { return await ouvrir(); }
    catch (e) {
      derniere = e; try { surEssai(k, e); } catch (er) { /* */ }
      if (k < essais) { await attendre(pause(k)); await auPremierPlan(D, 60000); }
    }
  }
  const m = String((derniere && derniere.message) || derniere);
  const err = new Error(VERROUILLE.test(m) ? 'la base de ploxi0n est fermée par iOS (iPhone verrouillé ?) : ' + m : m);
  err.verrouille = VERROUILLE.test(m);
  throw err;
}

export async function ouvrirBoxionLocal({ surEssai } = {}) {
  const cap = globalThis.Capacitor;
  if (cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) {
    return ouvrirSqliteResilient({ surEssai });            // l'iPhone : SQLite (chiffré par iOS), non purgeable
  }
  if (globalThis.indexedDB) {
    try { return await creerIdb(); } catch (e) { /* navigation privée, quota : on retombe en mémoire */ }
  }
  console.warn('[ploxi0n] boxion_local en mémoire : rien ne survivra au rechargement');
  return creerMemoire();
}
export { creerMemoire, creerIdb, creerSqlite };
