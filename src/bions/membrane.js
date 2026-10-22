// @bion membrane — la peau des neurones : les filtres SVG (goo, onde, paroi translucide, âme claire, halo), une recette par variante | api: VARIANTES, filtres, idFiltre, variante
// (0.95, RS-7 : « fais-en des bions » ; « donne-moi plusieurs versions en même temps, je veux pouvoir comparer et te dire laquelle se rapproche
// le plus de ce qu'il y a dans mon cerveau »). Une variante = des nombres, pas du code : en ajouter une, c'est une ligne. Composé par
// src/app/neurones.js ; <html data-px-variante="…"> choisit (prefs.variante, ⚙ › Apparence › Organique).
//   flou   le goo (σ) : plus grand, des jonctions plus rondes, molles      onde/freq  l'ondulation (amplitude, longueur d'onde)
//   epais  la paroi (px)      paroi/ame/halo  leur opacité      clair  l'âme : combien elle tire vers le blanc      gouttes  les koins des coins
//   chanfrein  les coins coupés en biais (le terminal) au lieu d'arrondis
export const VARIANTES = {
  nerfs: { nom: 'nerfs', desc: 'paroi translucide, une lumière au milieu', flou: 5, onde: 10, freq: 0.016, epais: 4, paroi: 0.62, ame: 0.5, clair: 0.55, halo: 0.4, gouttes: true },
  vaisseaux: { nom: 'vaisseaux', desc: 'parois épaisses et molles, des jonctions rondes', flou: 7.5, onde: 14, freq: 0.011, epais: 6, paroi: 0.5, ame: 0.28, clair: 0.3, halo: 0.3, gouttes: true },
  cables: { nom: 'câbles', desc: 'fins, une âme néon, presque droits', flou: 2.5, onde: 3, freq: 0.02, epais: 3, paroi: 0.55, ame: 0.95, clair: 0.85, halo: 0.6, gouttes: false },
  gelee: { nom: 'gelée', desc: 'les blobs lumineux des planches : opaques, gouttes rondes', flou: 6, onde: 10, freq: 0.016, epais: 6, paroi: 1, ame: 0.35, clair: 0.4, halo: 0.7, gouttes: true },
  // le hand terminal de The Expanse (RS-7 22.10, l'image : une plaque de verre, ses arêtes qui luisent ambre, les coins coupés en biais — ses
  // vieux koins de la planche 1 ; un terminal « bête » qui parle au réseau du lieu : le boxion)
  terminal: { nom: 'terminal', desc: 'le hand terminal de The Expanse : du verre, des arêtes ambre, les coins coupés', flou: 1, onde: 0, freq: 0.02, epais: 1.6, paroi: 0.9, ame: 0.6, clair: 0.5, halo: 0.55, gouttes: false, chanfrein: true },
};
const NS = 'http://www.w3.org/2000/svg';
/** la variante active (celle de <html>, sinon nerfs) */
export const variante = (D) => { const v = D && D.documentElement && D.documentElement.getAttribute('data-px-variante'); return VARIANTES[v] ? v : 'nerfs'; };
export const idFiltre = (v, couche, fin) => 'px-f-' + v + '-' + couche + (fin ? '-fin' : '');
const n = (x) => Math.round(x * 1000) / 1000;

/** le filtre d'une couche : « mb » la membrane (paroi + âme + halo), « dd » le dedans (la forme rétrécie de la paroi) */
export function filtre(id, p, couche) {
  return '<filter id="' + id + '" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">'
    + '<feGaussianBlur in="SourceGraphic" stdDeviation="' + n(p.flou) + '" result="b"/>'
    + (p.onde ? '<feTurbulence type="fractalNoise" baseFrequency="' + n(p.freq) + '" numOctaves="1" seed="7" result="n"/>'
      + '<feDisplacementMap in="b" in2="n" scale="' + n(p.onde) + '" xChannelSelector="R" yChannelSelector="G" result="d"/>' : '<feOffset in="b" result="d"/>')
    + '<feColorMatrix in="d" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -11" result="m"/>'
    + (couche === 'dd' ? '<feMorphology in="m" operator="erode" radius="' + n(p.epais) + '"/>'
      : '<feMorphology in="m" operator="erode" radius="' + n(p.epais) + '" result="e"/><feComposite in="m" in2="e" operator="out" result="paroi0"/>'
        + '<feColorMatrix in="paroi0" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 ' + n(p.paroi) + ' 0" result="paroi"/>'
        + (p.ame ? '<feMorphology in="m" operator="erode" radius="' + n(p.epais * 0.3) + '" result="e1"/><feMorphology in="m" operator="erode" radius="' + n(p.epais * 0.65) + '" result="e2"/>'
          + '<feComposite in="e1" in2="e2" operator="out" result="ame0"/>'
          + '<feColorMatrix in="ame0" type="matrix" values="' + n(1 - p.clair) + ' 0 0 0 ' + n(p.clair) + ' 0 ' + n(1 - p.clair) + ' 0 0 ' + n(p.clair) + ' 0 0 ' + n(1 - p.clair) + ' 0 ' + n(p.clair) + ' 0 0 0 ' + n(p.ame) + ' 0" result="ame"/>' : '')
        + '<feGaussianBlur in="m" stdDeviation="' + n(p.flou + 2) + '" result="h"/><feColorMatrix in="h" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 ' + n(p.halo) + ' 0" result="halo"/>'
        + '<feMerge><feMergeNode in="halo"/><feMergeNode in="paroi"/>' + (p.ame ? '<feMergeNode in="ame"/>' : '') + '</feMerge>')
    + '</filter>';
}
/** les grilles serrées (data-neurones="fin") : tout plus petit */
const finDe = (p) => ({ ...p, flou: p.flou * 0.6, onde: p.onde * 0.6, freq: p.freq * 1.6, epais: Math.max(1.2, p.epais * 0.75) });

/** les filtres d'une variante, une fois (dans un <svg> caché sur body) */
export function filtres(D, v = 'nerfs') {
  const p = VARIANTES[v] || VARIANTES.nerfs;
  if (D.getElementById(idFiltre(v, 'mb', false))) return;
  let s = D.querySelector('svg.px-neurones-defs');
  if (!s) {
    s = D.createElementNS(NS, 'svg'); s.setAttribute('class', 'px-neurones-defs'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('width', '0'); s.setAttribute('height', '0');
    s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none'; s.innerHTML = '<defs></defs>'; D.body.appendChild(s);
  }
  s.querySelector('defs').insertAdjacentHTML('beforeend', filtre(idFiltre(v, 'mb', false), p, 'mb') + filtre(idFiltre(v, 'dd', false), p, 'dd')
    + filtre(idFiltre(v, 'mb', true), finDe(p), 'mb') + filtre(idFiltre(v, 'dd', true), finDe(p), 'dd'));
}
