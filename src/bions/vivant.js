// @bion vivant — le téléphone vivant : son état (la chaleur, la batterie, l'économie d'énergie, le son qui joue) devient un souffle au bord
// de l'écran ; on voit l'iPhone sans lire un chiffre | api: etatVivant, niveauSon
// (0.99.11, RS-7 23.10 : « on aura l'impression que le téléphone est vivant ; selon la RAM, la température, on peut voir ça dans les
// membranes ; on peut juste visualiser sans avoir besoin de voir l'information »). Pur : l'installateur est src/app/tel-vivant.js.

/** l'état de l'iPhone → le souffle : { actif, periode (s), intensite (0..1), teinte } */
export function etatVivant({ thermique = 'nominal', economie = false, batterie = null, enCharge = false, calme = false } = {}) {
  if (calme || economie) return { actif: false, periode: 0, intensite: 0, teinte: 'bio' };   // réduire les animations, économie d'énergie : il dort
  const chaleur = { nominal: 0, inconnu: 0, tiede: 1, chaud: 2, critique: 3 }[thermique] ?? 0;
  const periode = [6, 4, 2.4, 1.2][chaleur];                                   // il respire plus vite quand il chauffe
  const b = batterie == null ? 1 : Math.max(0, Math.min(1, +batterie));
  const intensite = Math.round(Math.max(0.15, Math.min(1, 0.35 + 0.65 * b)) * 100) / 100;   // la batterie baisse : il pâlit
  const teinte = chaleur >= 2 ? 'chaud' : enCharge ? 'charge' : b < 0.15 ? 'faible' : 'bio';
  return { actif: true, periode, intensite, teinte };
}

/** le niveau d'un son (des échantillons 0..255 autour de 128, AnalyserNode.getByteTimeDomainData) → 0..1 (la racine de la moyenne des carrés) */
export function niveauSon(echantillons) {
  if (!echantillons || !echantillons.length) return 0;
  let s = 0; for (let i = 0; i < echantillons.length; i++) { const x = (echantillons[i] - 128) / 128; s += x * x; }
  const rms = Math.sqrt(s / echantillons.length);
  return rms < 0.002 ? 0 : Math.min(1, Math.sqrt(rms * 6));   // la racine : un son doux se voit déjà (l'oreille aussi est logarithmique)
}
