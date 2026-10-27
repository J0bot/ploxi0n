// 🫧 L'HAPTIQUE de ploxi0n (RS-7 12.10 : « jouer avec les haptics » ; « qu'on puisse inventer ses propres haptics, et des haptics pour les
// notifications » ; les jeux du xerboxion, le clicker). Trois couches :
//   - les STYLES natifs : leger · moyen · fort · selection (un cran) · succes · erreur (jOSNatif.vibrer)
//   - les MOTIFS : des suites [style, pause ms] qu'on invente (le studio, ⚙ › Haptique) et qu'on nomme ; ceux de l'app (MOTIFS_APP) en plus
//   - les ÉVÉNEMENTS de l'app (ouvrir, revenir, bords, notification, la fractale…) : chacun joue un style ou un motif, au choix
// jouer(x, { niveau, classe }) : x = un événement, un style, ou « motif:<nom> ». Les ploxions : jOSNatif.haptique(x).
// (0.63, RS-7 : « il faut que ça soit plus smooth et plein haptics selon l'utilisation ») : chaque événement a une CLASSE —
//   tic     le grain (une carte, un cran, la jauge) : jamais en file, sauté s'il gêne
//   marque  un seuil franchi (le bord engage, la butée, un koin)
//   acte    ce qui arrive (ouvrir, le cube, freefall) : passe toujours, coupe le motif en cours, 90 ms de silence pour les tics
// et un DÉBIT (creerDebit) qui tient le Taptic Engine net : 30/s au plus hors actes ; la DENSITÉ (sobre · normale · pleine) choisit les classes.
// boxion_local « reglages/haptique » = { motifs: { nom: [[style, pause], …] }, evenements: { ev: cible }, ploxions: { id: cible }, densite }.
export const STYLES = [['leger', 'léger'], ['moyen', 'moyen'], ['fort', 'fort'], ['selection', 'cran'], ['succes', 'succès'], ['erreur', 'erreur']];
// [événement, nom, groupe, famille] : le groupe « fractale » a sa sous-page (⚙ › Haptique › La fractale et les bords), rangée par famille
export const EVENEMENTS = [['ouvrir', 'ouvrir un ploxion'], ['reprendre', 'reprendre un ploxion'], ['revenir', '‹ revenir'], ['minimiser', '▁ minimiser'],
  ['bord', 'changer d\'app par un bord'], ['bord-seuil', 'le seuil du bord'], ['portion', 'les deux bords : portion'], ['appui', 'appui long'], ['page', 'changer de page'], ['vue', 'changer de vue'],
  ['interrupteur', 'interrupteur'], ['installe', 'ploxion installé'], ['erreur', 'erreur'], ['garder', 'découvrir : garder'], ['passer', 'découvrir : passer'],
  ['notification', 'notification'],
  ['fx-apercu', 'l\'aperçu s\'ouvre (tenir un bord)', 'fractale', 'l\'aperçu'], ['fx-tension', 'tirer : la tension', 'fractale', 'l\'aperçu'],
  ['fx-engage', 'ça part (le seuil)', 'fractale', 'l\'aperçu'], ['fx-degage', 'on renonce (sous le seuil)', 'fractale', 'l\'aperçu'],
  ['fx-fractale', 'la fractale s\'ouvre', 'fractale', 'la fractale et le slider'], ['fx-slider', 'le slider', 'fractale', 'la fractale et le slider'],
  ['fx-carte', 'passer une carte', 'fractale', 'la fractale et le slider'], ['fx-defile', 'défiler (chaque tranche)', 'fractale', 'la fractale et le slider'],
  ['fx-pose', 'poser (lâcher sans bouger)', 'fractale', 'la fractale et le slider'], ['fx-butee', 'la butée (premier, dernier)', 'fractale', 'la fractale et le slider'],
  ['fx-cube', 'le xer devient un cube', 'fractale', 'le cube'], ['fx-face', 'une face du cube', 'fractale', 'le cube'],
  ['fx-dessus', 'le dessus s\'ouvre', 'fractale', 'le cube'], ['fx-dessus-ferme', 'le dessus se referme', 'fractale', 'le cube'],
  ['fx-ouvrir', 'ouvrir un ploxion (sa signature)', 'fractale', 'ouvrir, jeter'], ['fx-arrivee', 'arriver dans un ploxion (sa signature)', 'fractale', 'ouvrir, jeter'],
  ['fx-revenir', 'revenir à la fractale', 'fractale', 'ouvrir, jeter'], ['fx-jet-arme', 'le jet armé (lancer pour fermer)', 'fractale', 'ouvrir, jeter'],
  ['fx-ferme', 'jeté : le ploxion se ferme', 'fractale', 'ouvrir, jeter'], ['fx-refus', 'refus (pas possible ici)', 'fractale', 'ouvrir, jeter'],
  ['fx-jauge', 'la jauge (la pression monte)', 'fractale', 'ouvrir, jeter'], ['fx-recharge', 'la jauge se recharge', 'fractale', 'ouvrir, jeter'],
  ['fx-freefall-on', 'freefall : on lâche tout', 'fractale', 'freefall'], ['fx-freefall-off', 'freefall : on se pose', 'fractale', 'freefall'],
  ['fx-carte-xer', 'la carte du xerboxion s\'ouvre', 'fractale', 'la carte du xerboxion'], ['fx-zoom', 'zoomer (chaque cran)', 'fractale', 'la carte du xerboxion'],
  ['fx-case', 'passer une case', 'fractale', 'la carte du xerboxion'], ['fx-koin', 'entrer dans un koin', 'fractale', 'la carte du xerboxion'],
  // (0.99.26, RS-7 : « les haptics du wormion et des portions fonctionnent pas ») fx-cran était appelé partout (le temps, la portion, la map, le synthé,
  // le passé, l'atelier) mais n'existait pas ici : aucun style, aucun motif, rien ne vibrait
  ['fx-cran', 'un cran (le temps, la portion, la map, le synthé)', 'fractale', 'les koins']];
/** la classe de chaque événement (un événement absent, un style, un motif = acte) */
export const CLASSES = {
  ouvrir: 'acte', reprendre: 'acte', revenir: 'acte', minimiser: 'acte', bord: 'acte', 'bord-seuil': 'marque', portion: 'acte', appui: 'acte', page: 'tic', vue: 'marque', interrupteur: 'marque',
  'fx-apercu': 'acte', 'fx-tension': 'tic', 'fx-engage': 'marque', 'fx-degage': 'marque', 'fx-fractale': 'acte', 'fx-slider': 'acte', 'fx-cube': 'acte', 'fx-carte': 'tic', 'fx-defile': 'tic',
  'fx-face': 'tic', 'fx-pose': 'marque', 'fx-butee': 'marque', 'fx-dessus': 'marque', 'fx-dessus-ferme': 'marque', 'fx-ouvrir': 'acte', 'fx-revenir': 'acte', 'fx-jet-arme': 'marque',
  'fx-refus': 'marque', 'fx-ferme': 'acte', 'fx-recharge': 'tic', 'fx-jauge': 'tic', 'fx-freefall-on': 'acte', 'fx-freefall-off': 'acte', 'fx-arrivee': 'acte', 'fx-carte-xer': 'acte',
  'fx-case': 'tic', 'fx-koin': 'marque', 'fx-zoom': 'tic', 'fx-cran': 'tic',
};
/** les motifs de l'app : jamais supprimés, pas dans « Tes motifs », mais proposés partout (un motif à toi du même nom passe devant) */
export const MOTIFS_APP = {
  'fx-slider': [['leger', 40], ['leger', 0]], 'fx-cube': [['fort', 55], ['moyen', 45], ['selection', 0]], 'fx-dessus': [['leger', 60], ['selection', 0]],
  'fx-refus': [['leger', 60], ['leger', 0]], 'fx-ferme': [['fort', 35], ['leger', 0]], 'fx-freefall-on': [['leger', 45], ['moyen', 45], ['fort', 0]],
  'fx-freefall-off': [['fort', 45], ['moyen', 45], ['leger', 0]], 'fx-carte-xer': [['leger', 40], ['moyen', 50], ['fort', 0]],
};
export const DENSITES = [['sobre', 'sobre'], ['normale', 'normale'], ['pleine', 'pleine']];
const DEFAUT = {
  motifs: { notification: [['moyen', 90], ['leger', 70], ['leger', 0]], battement: [['fort', 140], ['moyen', 0]], vague: [['leger', 60], ['moyen', 60], ['fort', 60], ['moyen', 60], ['leger', 0]] },
  evenements: { ouvrir: 'leger', reprendre: 'leger', revenir: 'leger', minimiser: 'moyen', bord: 'moyen', 'bord-seuil': 'selection', portion: 'motif:vague', appui: 'moyen', page: 'selection', vue: 'selection',
    interrupteur: 'selection', installe: 'succes', erreur: 'erreur', garder: 'moyen', passer: 'leger', notification: 'motif:notification',
    'fx-apercu': 'leger', 'fx-tension': 'selection', 'fx-engage': 'moyen', 'fx-degage': 'selection', 'fx-fractale': 'moyen', 'fx-slider': 'motif:fx-slider', 'fx-cube': 'motif:fx-cube',
    'fx-carte': 'selection', 'fx-defile': 'selection', 'fx-face': 'moyen', 'fx-pose': 'leger', 'fx-butee': 'moyen', 'fx-dessus': 'motif:fx-dessus', 'fx-dessus-ferme': 'selection',
    'fx-ouvrir': 'leger', 'fx-revenir': 'selection', 'fx-jet-arme': 'moyen', 'fx-refus': 'motif:fx-refus', 'fx-ferme': 'motif:fx-ferme', 'fx-recharge': 'selection', 'fx-jauge': 'selection',
    'fx-freefall-on': 'motif:fx-freefall-on', 'fx-freefall-off': 'motif:fx-freefall-off', 'fx-arrivee': 'leger', 'fx-carte-xer': 'motif:fx-carte-xer', 'fx-case': 'selection', 'fx-koin': 'leger', 'fx-zoom': 'selection', 'fx-cran': 'selection' },
  densite: 'pleine',
};
const STYLE = new Set(STYLES.map(s => s[0]));
const ECHELLE = ['selection', 'leger', 'moyen', 'fort'];   // niveau -1 / +1 : un cran plus doux / plus franc (succès, erreur, motifs : intacts)
const RANG = { acte: 0, marque: 1, tic: 2 }, JUSQUA = { sobre: 0, normale: 1, pleine: 2 };   // la densité : sobre = les actes, normale = + les marques, pleine = tout
const propre = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);

/** une FENÊTRE GLISSANTE : au plus `plafond` coups par `duree` ms (le PLAFOND du banc trackpad, 0.60, devenu un bion : haptique et jOSNatif) */
export function creerFenetre({ plafond = 60, duree = 1000, maintenant = () => Date.now() } = {}) {
  const l = [];
  const vider = (t) => { while (l.length && t - l[0] >= duree) l.shift(); };
  return {
    /** vrai = le coup passe (et compte) ; faux = au-delà du plafond, sauté */
    passe(t = maintenant()) { vider(t); if (l.length >= plafond) return false; l.push(t); return true; },
    compte(t = maintenant()) { vider(t); return l.length; },
  };
}

/** LE DÉBIT (0.63, pur, testable) : décide si un haptique de classe tic | marque | acte se joue maintenant. Jamais de file d'attente :
 *  tic     ≥ 35 ms depuis le dernier haptique ET ≥ 90 ms depuis le dernier acte ; sauté pendant un motif ou si 2 appels natifs sont en vol
 *  marque  ≥ 25 ms depuis le dernier haptique
 *  acte    passe toujours (et ouvre 90 ms de silence aux tics)
 *  plafond 30/s en fenêtre glissante, les actes exceptés. o = { motif: un motif joue, enVol: appels natifs pas encore rendus } */
export function creerDebit({ maintenant = () => Date.now(), plafond = 30 } = {}) {
  let dernier = -Infinity, dernierActe = -Infinity;
  const fenetre = creerFenetre({ plafond, maintenant });
  return {
    passe(classe = 'acte', { motif = false, enVol = 0 } = {}) {
      const t = maintenant();
      if (classe !== 'tic' && classe !== 'marque') { dernier = dernierActe = t; return true; }
      if (classe === 'tic' && (motif || enVol >= 2 || t - dernier < 35 || t - dernierActe < 90)) return false;
      if (classe === 'marque' && t - dernier < 25) return false;
      if (!fenetre.passe(t)) return false;
      dernier = t; return true;
    },
    /** un pas de motif vient de jouer : il compte comme « le dernier haptique » */
    noter() { dernier = maintenant(); },
  };
}

export function creerHaptique({ boxion, natif = () => globalThis.window && globalThis.window.jOSNatif, actif = () => true, attendre = (ms) => new Promise(r => setTimeout(r, ms)), maintenant = () => Date.now() }) {
  let c = JSON.parse(JSON.stringify(DEFAUT)), jeton = 0, enMotif = 0, mesCrans = 0;
  const debit = creerDebit({ maintenant });
  const pret = boxion.get('reglages', 'haptique').then(v => {
    if (!v || typeof v !== 'object') return;
    const ev = { ...DEFAUT.evenements, ...(v.evenements || {}) };
    // (0.63) « changer de page = rien » voulait dire « pas de crans » : les crans de la fractale aussi, tant qu'on n'a rien choisi pour eux
    if (v.evenements && v.evenements.page === 'aucun') for (const k of ['fx-carte', 'fx-defile', 'fx-face']) if (v.evenements[k] === undefined) ev[k] = 'aucun';
    c = { motifs: { ...DEFAUT.motifs, ...(v.motifs || {}) }, evenements: ev, ploxions: v.ploxions || {}, densite: JUSQUA[v.densite] !== undefined ? v.densite : DEFAUT.densite };
  }).catch(() => {});
  const garder = () => boxion.put('reglages', 'haptique', c).catch(() => {});
  const enVol = () => { const n = natif(), f = n && n.vibrer && n.vibrer.enVol; try { return typeof f === 'function' ? (+f() || 0) : 0; } catch (e) { return 0; } };
  const passe = (classe) => debit.passe(classe, { motif: enMotif !== 0 && enMotif === jeton, enVol: enVol() });
  const dense = (classe) => RANG[classe] <= JUSQUA[c.densite || 'pleine'];
  const classeDe = (x, classe) => (RANG[classe] !== undefined ? classe : RANG[CLASSES[x]] !== undefined ? CLASSES[x] : 'acte');
  const frapper = (style) => { const n = natif(); if (!n || !n.vibrer) return; try { const p = n.vibrer(style); if (p && p.catch) p.catch(() => {}); } catch (e) { /* */ } };
  const pasDe = (nom) => (propre(c.motifs, nom) ? c.motifs[nom] : propre(MOTIFS_APP, nom) ? MOTIFS_APP[nom] : null);   // tes motifs d'abord, puis ceux de l'app
  async function motif(pas) {
    const n = natif(); if (!n || !n.vibrer) return;
    const moi = ++jeton; enMotif = moi;   // un nouveau motif interrompt le précédent
    try {
      for (const [style, pause] of pas.slice(0, 40)) {
        if (moi !== jeton) return;
        if (STYLE.has(style)) { frapper(style); debit.noter(); }
        if (pause > 0) await attendre(Math.min(2000, pause));
      }
    } finally { if (enMotif === moi) enMotif = 0; }
  }
  /** jouer un événement, un style ou « motif:<nom> » (ou un nom de motif). o = { force (même coupée, même sobre), niveau -1|0|+1 (le style
   *  résolu, un cran plus doux / plus franc), classe 'tic'|'marque'|'acte' (sinon celle de l'événement) } */
  function jouer(x, o) {
    const { force = false, niveau = 0, classe } = o || {};
    if (!force && !actif()) return;
    const cl = classeDe(x, classe);
    if (!force && !dense(cl)) return;
    let cible = propre(c.evenements, x) ? c.evenements[x] : x;
    if (!cible || cible === 'aucun' || typeof cible !== 'string') return;
    if (cible.startsWith('motif:')) cible = cible.slice(6);
    if (STYLE.has(cible)) {
      if (!passe(cl)) return;
      if (cl === 'acte') jeton++;   // un acte coupe le motif en cours
      const i = ECHELLE.indexOf(cible), d = Math.round(+niveau || 0);
      return frapper(i >= 0 && d ? ECHELLE[Math.max(0, Math.min(ECHELLE.length - 1, i + d))] : cible);
    }
    const pas = pasDe(cible);
    if (pas && passe(cl)) return motif(pas);
  }
  /** LA SIGNATURE d'un ploxion (RS-7 12.10 : « chaque ploxion a une haptique d'ouverture différente ») : 2 à 3 pas tirés de son id —
   *  toujours la même pour lui, différente des autres ; courte (< 300 ms) */
  function signature(id) {
    let h = 2166136261; for (const ch of String(id)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
    const st = ['leger', 'moyen', 'fort', 'selection'], n = 2 + (h % 2), pas = [];
    for (let i = 0; i < n; i++) { pas.push([st[(h >>> (i * 5 + 2)) % 4], i < n - 1 ? 50 + ((h >>> (i * 7 + 3)) % 5) * 15 : 0]); }
    return pas;
  }
  /** l'ouverture d'un ploxion (ouvrir, reprendre, fx-ouvrir, fx-arrivee) : son haptique choisie, sinon celle de son manifeste, sinon sa
   *  signature ; « ev = rien » coupe tout. Toujours un acte (le débit le sait : 90 ms sans tics) */
  function jouerPloxion(id, ev = 'ouvrir', manifeste = null, o) {
    const { force = false } = o || {};
    if (!force && !actif()) return;
    if (c.evenements[ev] === 'aucun') return;
    const choisi = (c.ploxions || {})[id];
    if (choisi && choisi !== 'signature') return jouer(choisi, { force: true, classe: 'acte' });
    passe('acte');
    if (manifeste && Array.isArray(manifeste)) return motif(manifeste.filter(p => Array.isArray(p) && STYLE.has(p[0])));
    return motif(signature(id));
  }
  /** une SESSION DE CRANS (le slider, la carte, la jauge) : debut() garde le cran natif prêt, chaque « selection » = UN aller-retour ; fin() */
  const crans = {
    debut() { if (!actif()) return; const n = natif(); if (n && n.crans && n.crans.debut) { mesCrans++; try { n.crans.debut(); } catch (e) { /* */ } } },
    fin() { if (!mesCrans) return; mesCrans--; const n = natif(); if (n && n.crans && n.crans.fin) { try { n.crans.fin(); } catch (e) { /* */ } } },
    ouverte: () => mesCrans > 0,
  };
  return {
    pret, jouer, signature, jouerPloxion, crans,
    async choisirPloxion(id, cible) { c.ploxions = { ...(c.ploxions || {}), [id]: cible }; await garder(); },
    /** jouer une suite de pas sans la sauver (le studio) */
    essayer: (pas) => motif((pas || []).filter(p => Array.isArray(p) && STYLE.has(p[0]))),
    config: () => JSON.parse(JSON.stringify(c)),
    densite: () => c.densite || 'pleine',
    async assignerDensite(d) { if (JUSQUA[d] === undefined) throw new Error('densité : sobre, normale ou pleine'); c.densite = d; await garder(); },
    async sauver(nom, pas) {
      nom = String(nom || '').trim().toLowerCase().replace(/[^a-z0-9àâäéèêëîïôöùûüç -]/g, '').slice(0, 30); if (!nom) throw new Error('donne-lui un nom');
      const propres = (pas || []).filter(p => Array.isArray(p) && STYLE.has(p[0])).map(([s, ms]) => [s, Math.max(0, Math.min(2000, +ms || 0))]).slice(0, 40);
      if (!propres.length) throw new Error('un motif a au moins un pas');
      c.motifs[nom] = propres; await garder(); return nom;
    },
    async supprimer(nom) {
      if (!propre(c.motifs, nom)) return;   // les motifs de l'app ne se suppriment pas
      delete c.motifs[nom];
      if (!propre(MOTIFS_APP, nom)) for (const k in c.evenements) if (c.evenements[k] === 'motif:' + nom) c.evenements[k] = DEFAUT.evenements[k] || 'aucun';
      await garder();
    },
    async assigner(ev, cible) { c.evenements[ev] = cible; await garder(); },
    async reinitialiser() { c = JSON.parse(JSON.stringify(DEFAUT)); await garder(); },
  };
}
