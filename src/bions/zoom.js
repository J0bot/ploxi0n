// @bion zoom — le zoom LIBRE ou par PALIERS FIGÉS, partout : une échelle continue dans chaque scène, plonger / reculer au-delà des seuils ; ce que l'écriture montre selon l'échelle (le glyphe, les deux, le texte) | api: MIN, MAX, PLONGE, RECULE, borner, niveau, detailDe, figer, prochainFige, versScene, grilleAjustee
// (0.99, RS-7 23.10 : « il faut que la police ressorte : selon les niveaux, il n'y a que le glyphe, que le texte, ou les deux ; les niveaux de
// zoom, ça se balade partout ; et on peut FIGER des zooms pour faire nos paliers, au lieu que ce soit zoom libre »). Pur, sans DOM.
// Un niveau GLOBAL g = l'indice de la scène + (échelle − 1) / 2 : tes ploxions 0, le réseau 1, le hub 2, le ploxion 3, le bion 4 ; dans une
// scène, l'échelle va de MIN à MAX ; au-delà de PLONGE on plonge dans ce qui est sous les doigts, en deçà de RECULE on recule d'une scène.
export const MIN = 0.55, MAX = 1.8, PLONGE = 1.55, RECULE = 0.66;
export const borner = (s) => Math.max(MIN, Math.min(MAX, s));
export const niveau = (iScene, s) => Math.round((iScene + (s - 1) / 2) * 1000) / 1000;
/** l'échelle → ce que l'écriture montre : de loin le glyphe, au milieu les deux, de près le texte (en grand) */
export const detailDe = (s) => (s < 0.85 ? 'glyphe' : s > 1.28 ? 'texte' : 'deux');
/** un niveau g → { i (la scène), s (l'échelle) } */
export const versScene = (g, n = 5) => { const i = Math.max(0, Math.min(n - 1, Math.round(g))); return { i, s: Math.round(borner(1 + (g - i) * 2) * 1000) / 1000 }; };
/** figer le niveau g (sans doublon à 0,05 près), triés */
export function figer(figes, g, nom) { const l = (figes || []).filter(f => Math.abs(f.g - g) > 0.05); l.push({ g, nom: nom || ('palier ' + (l.length + 1)) }); return l.sort((a, b) => a.g - b.g); }
/** le palier figé suivant dans un sens (+1 plonger, −1 reculer) depuis g ; null s'il n'y en a pas */
export function prochainFige(figes, g, sens) {
  const l = (figes || []).slice().sort((a, b) => a.g - b.g);
  return sens > 0 ? l.find(f => f.g > g + 0.02) || null : l.slice().reverse().find(f => f.g < g - 0.02) || null;
}
/** (0.99.19, RS-7 : « pourquoi c'est tout petit ; il faut que ça prenne la place maximale possible, automatiquement ») une grille qui REMPLIT
 *  sa place au lieu d'être réduite : à l'échelle 1, les plus grandes cases où tout tient (2 à 6 colonnes ; sinon des cases d'au moins
 *  72 px, et ça défile) ; pincer change le nombre de colonnes (dézoomer = plus de colonnes), jamais la taille de la scène.
 *  n cases, w × h la place (px), → { colonnes, cellule (px) } */
export function grilleAjustee(n, w, h, s = 1, gap = 8) {
  w = Math.max(80, w || 0); h = Math.max(80, h || 0); n = Math.max(1, n | 0);
  const cel = (c) => (w - gap * (c - 1)) / c;
  let base = 0;
  for (let c = 2; c <= 6 && !base; c++) { const r = Math.ceil(n / c); if (r * cel(c) + (r - 1) * gap <= h) base = c; }
  if (!base) base = Math.max(3, Math.min(6, Math.floor((w + gap) / (72 + gap))));
  const colonnes = Math.max(1, Math.min(n < 2 ? 1 : 10, Math.round(base / Math.max(0.3, s))));
  return { colonnes, cellule: Math.floor(cel(colonnes)) };
}
