// ◬ LE KOIN DU ION ET LA BALADE ENTRE LES RÉELS (0.71). RS-7 (14.10, sur le hub « Primitives » du labo : centre « ion », kion, trion, koin,
// wormion, portion, spherion, ion, fractale) : « c'est le koin du ion ; je veux qu'il y ait les dossiers ion, 3ion, seption, nexus, et pouvoir
// se balader dedans avec le portion : une balade entre les réels ». Les paliers du réel : docs/TERRAX.md §1.
// COMPOSER, PAS REBÂTIR : les hubs du labo (bion jOSXerkionHub, /px/xerkions.json) acceptent des hubs PERSO, rangés par jOSStore
// (« xerkions-persos » : localStorage « store:xerkions-persos:items » + jOSBoxion « xerkions-persos/items ») ; un koin dont le ploxion
// commence par « xerkion- » ouvre ce hub (un DOSSIER), et les portails se suivent au glisser : portals[0] à droite, [1] à gauche,
// [2] en haut, [3] en bas. On sème donc ces hubs-là dans l'app (semerKoinIon, au démarrage) :
//   - « le koin du ion » : les 8 primitives + les 4 dossiers ;
//   - ion → 3ion → seption → (l'infini : on revient au ion) : glisser à droite monte d'un palier, à gauche on redescend ;
//     en haut, on ressort au koin du ion ; en bas, le nexus (le commun).
// Les hubs semés portent « seme: 'ploxi0n' » et une version. Une nouvelle version ne remplace un hub semé que s'il est encore tel qu'on
// l'avait semé (gardé dans « reglages/koin-ion ») : retouché dans l'éditeur, il est à RS-7, on n'y touche plus. Ses hubs à lui : jamais.
// À OFFICIALISER au labo (la quête koin-ion) : les mêmes hubs dans xerkion-hubs.spec.json, et les 4 koins dans « xerkion-primitives ».
export const VERSION_KOIN = 1;
const H = (id, nom, icone, center, essence, koins, portals, pal) => ({ id: 'xerkion-perso-' + id, nom, icone, template: 'hub', perso: true, center, essence, pal, koins, portals, seme: 'ploxi0n', version: VERSION_KOIN });
const k = (label, ploxion, icon) => ({ label, ploxion, icon });
const KOIN = 'xerkion-perso-koin-ion', ION = 'xerkion-perso-r-ion', TROIS = 'xerkion-perso-r-3ion', SEPT = 'xerkion-perso-r-seption', NEXUS = 'xerkion-perso-r-nexus';

export const HUBS_DU_REEL = [
  H('koin-ion', 'le koin du ion', '◬', 'portion', 'ion', [
    k('ion', ION, '◇'), k('3ion', TROIS, '▣'), k('seption', SEPT, '✳️'), k('nexus', NEXUS, '⛰'),
    k('kion', 'kion', '▢'), k('koin', 'koin', '△'), k('wormion', 'wormion', '🌀'), k('portion', 'portion', '▣'),
    k('spherion', 'spherion', '🧊'), k('fractale', 'fractale', '✳️'), k('trion', 'trion', '△'), k('l\'objet ion', 'ion', '🧊')],
    [TROIS, ION, 'xerkion-primitives', NEXUS], 2),
  // le ion : ON + I = ION, le réel ; le point de départ de la balade
  H('r-ion', 'ion', '◇', 'kion', 'ion', [k('ion', 'ion', '🧊'), k('kion', 'kion', '▢'), k('koin', 'koin', '△'), k('trion', 'trion', '△'), k('spherion', 'spherion', '🧊'), k('fractale', 'fractale', '✳️')],
    [TROIS, SEPT, KOIN, NEXUS], 0),
  // le 3ion : le réel en trois dimensions — le terrion (la carte du réel), le terrax (l'AR), les mondes 3D
  H('r-3ion', '3ion', '▣', 'portion', '3ion', [k('terrax', 'terrax', '🌍'), k('mappion', 'mappion', '🧿'), k('globe', 'globe', '🌍'), k('scan-reel', 'scan-reel', '🌐'),
    k('monde', 'monde', '🧊'), k('vue 3d', 'vue-3d', '🧊'), k('freecad', 'freecad', '🛠'), k('chambre', 'room-map', '🗺️')],
    [SEPT, ION, KOIN, NEXUS], 3),
  // le seption : le 7ion, le maximum possible comme dimensions ; les abords du réel (le chaos) au-delà ; le Xerax pour y aller
  H('r-seption', 'seption', '✳️', 'wormion', 'seption', [k('xerax', 'xerax', '🧠'), k('wormion', 'wormion', '🌀'), k('portion', 'portion', '▣'), k('fractale', 'fractale', '✳️'), k('spherion', 'spherion', '🧊')],
    [ION, TROIS, KOIN, NEXUS], 4),
  // le nexus : le commun à tout le monde (ce qu'on partage du terrax y va)
  H('r-nexus', 'nexus', '⛰', 'portion', 'nexus', [k('nexus', 'nexus', '⛰'), k('nexus 3d', 'nexus3d', '🟩'), k('terrax', 'terrax', '🌍'), k('présence', 'presence', '👁'), k('avatar', 'avatar', '🧑‍🚀'), k('quêtes', 'quetes', '🗺️')],
    [TROIS, ION, KOIN, SEPT], 5),
];

const pareil = (a, b) => JSON.stringify(a) === JSON.stringify(b);
/** fusionne les hubs semés dans une liste de hubs perso : ajoute ceux qui manquent ; remplace un semé seulement s'il n'a pas été retouché */
export function fusionner(liste, semence = HUBS_DU_REEL, avant = []) {
  const l = Array.isArray(liste) ? liste.slice() : [], parId = new Map(l.map((x, i) => [x && x.id, i])), anciens = new Map((avant || []).map(x => [x.id, x]));
  let n = 0;
  for (const h of semence) {
    const i = parId.get(h.id);
    if (i == null) { l.push(h); n++; continue; }
    const x = l[i];
    if (x && x.seme === 'ploxi0n' && (x.version || 0) < h.version && (!anciens.has(h.id) || pareil(x, anciens.get(h.id)))) { l[i] = h; n++; }
  }
  return { liste: l, n };
}

/** sème le koin du ion dans les hubs perso du labo (là où jOSStore les lit dans l'app) ; rend le nombre de hubs ajoutés ou mis à jour */
export async function semerKoinIon({ W = globalThis.window, boxion = null } = {}) {
  const CLE = 'store:xerkions-persos:items';
  let local = null; try { local = JSON.parse(W.localStorage.getItem(CLE) || 'null'); } catch (e) { local = null; }
  const doc = boxion ? await boxion.get('box:xerkions-persos', 'items').catch(() => null) : null;
  const avant = (boxion ? await boxion.get('reglages', 'koin-ion').catch(() => null) : null) || [];
  const base = Array.isArray(local) ? local : (doc && Array.isArray(doc.data) ? doc.data : []);
  const { liste, n } = fusionner(base, HUBS_DU_REEL, avant);
  if (!n) return 0;
  try { W.localStorage.setItem(CLE, JSON.stringify(liste)); } catch (e) { /* */ }
  if (boxion) {
    await boxion.put('box:xerkions-persos', 'items', { ns: 'xerkions-persos', key: 'items', name: 'store xerkions-persos', data: liste, savedAt: new Date().toISOString() }).catch(() => {});
    await boxion.put('reglages', 'koin-ion', HUBS_DU_REEL).catch(() => {});
  }
  return n;
}
