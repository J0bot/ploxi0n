// LES PLUGIONS entre les bions (RS-7 12.10 : « il faut les meilleurs plugions entre les bions ») : un plugion BRANCHE un bion du labo (web)
// sur la meilleure implémentation disponible ici — le natif de l'iPhone (jOSNatif) — sans réécrire le bion. Appliqués après chaque
// chargement de ploxion (de nouveaux bions ont pu arriver) ; chacun idempotent (marqué __plugion) ; réversibles (un bion coupé n'est pas branché).
//   jOSAppareil   le type vient du natif (téléphone / tablette) au lieu de l'heuristique — jamais par-dessus le choix de la personne
//   jOSShare      .natif(payload) : la feuille de partage d'iOS, à côté de son « envoyer à un ami du xer »
export const PLUGIONS = [
  { bion: 'jOSAppareil', quoi: 'le type d\'appareil vient du natif',
    async brancher(W, b) {
      let choisi = null; try { choisi = W.localStorage.getItem('xb:appareil'); } catch (e) { /* */ }
      if (choisi || !W.jOSNatif || !W.jOSNatif.natif) return;
      const i = await W.jOSNatif.appareil(); const type = /ipad/i.test(i.modele) ? 'tablette' : 'telephone';
      if (b.get && b.get() !== type && b.set) b.set(type, 'natif');
    } },
  // 🎞 (0.49) le bion lecteur du labo (Stremio…) : une vidéo s'ouvre dans le lecteur intégré de l'iPhone (Apple, VLC en repli)
  { bion: 'jOSplayer', quoi: 'ses vidéos → le lecteur intégré de l\'iPhone', async brancher(W, b) { if (W.ploxi0nLecteurNatif) W.ploxi0nLecteurNatif.brancherJosPlayer(b); } },
  { bion: 'jOSPlayer', quoi: 'ses vidéos → le lecteur intégré de l\'iPhone', async brancher(W, b) { if (W.ploxi0nLecteurNatif) W.ploxi0nLecteurNatif.brancherJosPlayer(b); } },
  { bion: 'jOSShare', quoi: 'jOSShare.natif : la feuille de partage d\'iOS',
    async brancher(W, b) { if (W.jOSNatif && !b.natif) b.natif = (p) => W.jOSNatif.partager({ texte: p && (p.text || p.texte), url: p && p.url, titre: p && (p.title || p.titre) }); } },
];

export function brancherPlugions(W = globalThis.window, coupes = new Set()) {
  const faits = [];
  for (const p of PLUGIONS) {
    const b = W[p.bion]; if (!b || b.__plugion || coupes.has(p.bion)) continue;
    try { Object.defineProperty(b, '__plugion', { value: true, enumerable: false }); } catch (e) { /* objet gelé : on le branche quand même */ }
    Promise.resolve(p.brancher(W, b)).catch(() => {}); faits.push(p.bion);
  }
  return faits;
}
