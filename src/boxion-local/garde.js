// LA GARDE DU BOXION LOCAL (RS-7 12.10 : « ça reste bloqué au chargement — il faut que je puisse utiliser l'appli ») : sur l'iPhone, un appel
// SQLite qui ne répond plus figeait tout le démarrage (bloqué à 14, 23, 45, 62, 64 %). Ici, chaque appel a un délai : passé ce délai, une
// lecture rend sa valeur par défaut (get → null, list/lire → []) et une écriture rend la main (elle finit en arrière-plan). L'app s'ouvre
// toujours ; chaque dépassement est noté (surLent) — le journal de l'écran de chargement et une bulle le disent.
const DEFAUTS = { get: null, list: [], lire: [] };
export function garderBoxion(b, { delai = 5000, surLent = () => {} } = {}) {
  const lents = [];
  const avecDelai = (nom, args, defaut) => {
    let fini = false;
    const p = Promise.resolve().then(() => b[nom](...args)).finally(() => { fini = true; });
    // après 2 appels lents, le boxion est jugé coincé : les suivants n'attendent plus que 0,8 s (sinon 30 appels × 5 s = un démarrage de 2 min)
    const t = new Promise((ok) => setTimeout(() => {
      if (fini) return;
      const info = { appel: nom + ' ' + String(args[0]) + (args[1] && typeof args[1] === 'string' ? '/' + args[1] : ''), le: Date.now() };
      lents.push(info); try { surLent(info); } catch (e) { /* */ }
      ok(defaut);
    }, lents.length >= 2 ? Math.min(800, delai) : delai));
    return Promise.race([p, t]);
  };
  const g = Object.create(b);
  for (const nom of ['get', 'list', 'lire']) g[nom] = (...a) => avecDelai(nom, a, Array.isArray(DEFAUTS[nom]) ? [] : DEFAUTS[nom]);
  for (const nom of ['put', 'del']) g[nom] = (...a) => avecDelai(nom, a, undefined);
  g.append = (...a) => avecDelai('append', a, { seq: 0, t: Date.now(), enRetard: true });
  if (b.watch) g.watch = (...a) => b.watch(...a);
  if (b.fermer) g.fermer = (...a) => b.fermer(...a);
  g.lents = () => lents.slice();
  return g;
}
