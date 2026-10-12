// 🫧 L'HAPTIQUE de ploxi0n (RS-7 12.10 : « jouer avec les haptics » ; « qu'on puisse inventer ses propres haptics, et des haptics pour les
// notifications » ; les jeux du xerboxion, le clicker). Trois couches :
//   - les STYLES natifs : leger · moyen · fort · selection (un cran) · succes · erreur (jOSNatif.vibrer)
//   - les MOTIFS : des suites [style, pause ms] qu'on invente (le studio, ⚙ › Haptique) et qu'on nomme
//   - les ÉVÉNEMENTS de l'app (ouvrir, revenir, bords, notification…) : chacun joue un style ou un motif, au choix
// jouer(x) : x = un événement, un style, ou « motif:<nom> ». Les ploxions : jOSNatif.haptique(x).
// boxion_local « reglages/haptique » = { motifs: { nom: [[style, pause], …] }, evenements: { ev: cible } }.
export const STYLES = [['leger', 'léger'], ['moyen', 'moyen'], ['fort', 'fort'], ['selection', 'cran'], ['succes', 'succès'], ['erreur', 'erreur']];
export const EVENEMENTS = [['ouvrir', 'ouvrir un ploxion'], ['reprendre', 'reprendre un ploxion'], ['revenir', '‹ revenir'], ['minimiser', '▁ minimiser'],
  ['bord', 'changer d\'app par un bord'], ['bord-seuil', 'le seuil du bord'], ['appui', 'appui long'], ['page', 'changer de page'], ['vue', 'changer de vue'],
  ['interrupteur', 'interrupteur'], ['installe', 'ploxion installé'], ['erreur', 'erreur'], ['garder', 'découvrir : garder'], ['passer', 'découvrir : passer'],
  ['notification', 'notification']];
const DEFAUT = {
  motifs: { notification: [['moyen', 90], ['leger', 70], ['leger', 0]], battement: [['fort', 140], ['moyen', 0]], vague: [['leger', 60], ['moyen', 60], ['fort', 60], ['moyen', 60], ['leger', 0]] },
  evenements: { ouvrir: 'leger', reprendre: 'leger', revenir: 'leger', minimiser: 'moyen', bord: 'moyen', 'bord-seuil': 'selection', appui: 'moyen', page: 'selection', vue: 'selection',
    interrupteur: 'selection', installe: 'succes', erreur: 'erreur', garder: 'moyen', passer: 'leger', notification: 'motif:notification' },
};
const STYLE = new Set(STYLES.map(s => s[0]));

export function creerHaptique({ boxion, natif = () => globalThis.window && globalThis.window.jOSNatif, actif = () => true, attendre = (ms) => new Promise(r => setTimeout(r, ms)) }) {
  let c = JSON.parse(JSON.stringify(DEFAUT)), jeton = 0;
  const pret = boxion.get('reglages', 'haptique').then(v => { if (v && typeof v === 'object') c = { motifs: { ...DEFAUT.motifs, ...(v.motifs || {}) }, evenements: { ...DEFAUT.evenements, ...(v.evenements || {}) } }; }).catch(() => {});
  const garder = () => boxion.put('reglages', 'haptique', c).catch(() => {});
  async function motif(pas) {
    const n = natif(); if (!n || !n.vibrer) return;
    const moi = ++jeton;   // un nouveau motif interrompt le précédent
    for (const [style, pause] of pas.slice(0, 40)) {
      if (moi !== jeton) return;
      if (STYLE.has(style)) n.vibrer(style).catch(() => {});
      if (pause > 0) await attendre(Math.min(2000, pause));
    }
  }
  /** jouer un événement, un style ou « motif:<nom> » (ou un nom de motif) */
  function jouer(x, { force = false } = {}) {
    if (!force && !actif()) return;
    let cible = c.evenements[x] !== undefined ? c.evenements[x] : x;
    if (!cible || cible === 'aucun') return;
    if (typeof cible === 'string' && cible.startsWith('motif:')) cible = cible.slice(6);
    if (STYLE.has(cible)) { const n = natif(); if (n && n.vibrer) n.vibrer(cible).catch(() => {}); return; }
    if (c.motifs[cible]) return motif(c.motifs[cible]);
  }
  return {
    pret, jouer,
    /** jouer une suite de pas sans la sauver (le studio) */
    essayer: (pas) => motif((pas || []).filter(p => Array.isArray(p) && STYLE.has(p[0]))),
    config: () => JSON.parse(JSON.stringify(c)),
    async sauver(nom, pas) {
      nom = String(nom || '').trim().toLowerCase().replace(/[^a-z0-9àâäéèêëîïôöùûüç -]/g, '').slice(0, 30); if (!nom) throw new Error('donne-lui un nom');
      const propres = (pas || []).filter(p => Array.isArray(p) && STYLE.has(p[0])).map(([s, ms]) => [s, Math.max(0, Math.min(2000, +ms || 0))]).slice(0, 40);
      if (!propres.length) throw new Error('un motif a au moins un pas');
      c.motifs[nom] = propres; await garder(); return nom;
    },
    async supprimer(nom) { delete c.motifs[nom]; for (const k in c.evenements) if (c.evenements[k] === 'motif:' + nom) c.evenements[k] = DEFAUT.evenements[k] || 'aucun'; await garder(); },
    async assigner(ev, cible) { c.evenements[ev] = cible; await garder(); },
    async reinitialiser() { c = JSON.parse(JSON.stringify(DEFAUT)); await garder(); },
  };
}
