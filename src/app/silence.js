// 🤫 LE DROIT AU SILENCE, FAIT RESPECTER (0.78). Un ploxion démonté ne doit plus rien écouter (tests/montage.test.mjs le mesure).
// Quelques ploxions du labo oublient un écouteur posé sur window ou document pendant leur montage : 🎮 Jeu (xp) pose un
// « visibilitychange » qu'il ne retire jamais (un de plus à chaque ouverture). Pour EUX seulement (la liste ci-dessous), ce qui est accroché
// à window et document pendant le montage est décroché au démontage. Pas pour tous : un bion du labo peut s'installer pour toute l'app au
// premier montage, il ne faut pas le décrocher. Quand le labo corrige un ploxion, il sort de la liste.
export const PLOXIONS_QUI_FUIENT = new Set(['xp']);

/** monter `app` en notant ce qu'il accroche à window/document ; rend l'instance, dont unmount() décroche aussi ces écouteurs */
export function monterEnSilence(W, app, hote, o) {
  const cibles = [W, W.document], poses = [];
  const avant = cibles.map(c => ({ propre: Object.prototype.hasOwnProperty.call(c, 'addEventListener'), f: c.addEventListener }));
  cibles.forEach((c, i) => { c.addEventListener = function (type, f, op) { poses.push([c, type, f, op]); return avant[i].f.call(this, type, f, op); }; });
  let inst;
  try { inst = app.mount(hote, o) || {}; } finally { cibles.forEach((c, i) => { if (avant[i].propre) c.addEventListener = avant[i].f; else delete c.addEventListener; }); }
  const fin = inst.unmount;
  inst.unmount = function () {
    try { if (fin) return fin.apply(this, arguments); }
    finally { for (const [c, type, f, op] of poses) { try { c.removeEventListener(type, f, op); } catch (e) { /* */ } } poses.length = 0; }
  };
  return inst;
}
