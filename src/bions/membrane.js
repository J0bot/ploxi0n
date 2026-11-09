// @bion membrane — la peau des neurones : les filtres SVG (goo, onde, paroi translucide, âme claire, halo), une recette par variante | api: VARIANTES, filtres, idFiltre, variante, redefinir, appliquerCouleurs
// (0.95, RS-7 : « fais-en des bions » ; « donne-moi plusieurs versions en même temps, je veux pouvoir comparer et te dire laquelle se rapproche
// le plus de ce qu'il y a dans mon cerveau »). Une variante = des nombres, pas du code : en ajouter une, c'est une ligne. Composé par
// src/app/neurones.js ; <html data-px-variante="…"> choisit (prefs.variante, ⚙ › Apparence › Organique).
//   flou   le goo (σ) : plus grand, des jonctions plus rondes, molles      onde/freq  l'ondulation (amplitude, longueur d'onde)
//   epais  la paroi (px)      paroi/ame/halo  leur opacité      clair  l'âme : combien elle tire vers le blanc      gouttes  les koins des coins
//   chanfrein  les coins coupés en biais (le terminal) au lieu d'arrondis      photophores  des points de lumière (--bio) piqués dans la paroi
//   contour  un trait autour (--n-contour, noir par défaut), en px : le cartoon (Rick et Morty), le néon double (cyberpunk)
//   scan  le halo en lignes de balayage      glitch  l'amplitude des bandes décalées + le dédoublement vert / violet (cyberglysm)
//   couleurs  { memb, memb2, verre, contour } : une peau qui porte ses couleurs (le lot 3, les tiennes) ; sinon celles du CSS
//   geo  ce qui pousse : { faisceau: n, vertebres, cils, ventouses, epines } (src/bions/excroissances.js)      lot  2 = le deuxième lot à comparer
export const VARIANTES = {
  nerfs: { nom: 'nerfs', desc: 'paroi translucide, une lumière au milieu', flou: 5, onde: 10, freq: 0.016, epais: 4, paroi: 0.62, ame: 0.5, clair: 0.55, halo: 0.4, gouttes: true },
  vaisseaux: { nom: 'vaisseaux', desc: 'parois épaisses et molles, des jonctions rondes', flou: 7.5, onde: 14, freq: 0.011, epais: 6, paroi: 0.5, ame: 0.28, clair: 0.3, halo: 0.3, gouttes: true },
  cables: { nom: 'câbles', desc: 'fins, une âme néon, presque droits', flou: 2.5, onde: 3, freq: 0.02, epais: 3, paroi: 0.55, ame: 0.95, clair: 0.85, halo: 0.6, gouttes: false },
  gelee: { nom: 'gelée', desc: 'les blobs lumineux des planches : opaques, gouttes rondes', flou: 6, onde: 10, freq: 0.016, epais: 6, paroi: 1, ame: 0.35, clair: 0.4, halo: 0.7, gouttes: true },
  // le hand terminal de The Expanse (RS-7 22.10, l'image : une plaque de verre, ses arêtes qui luisent ambre, les coins coupés en biais — ses
  // vieux koins de la planche 1 ; un terminal « bête » qui parle au réseau du lieu : le boxion)
  // ---- LE DEUXIÈME LOT (RS-7 22.10 : « j'aime l'organisation de câble et la texture de gelée ; donne-moi des trucs bien plus alien ») :
  // tous partent de câbles (fins, presque droits, une âme) × gelée (opaque, le halo) ; geo = ce qui pousse (src/bions/excroissances.js)
  cablegel: { lot: 2, nom: 'câble-gelée', desc: 'la base : l\'organisation des câbles, la texture de la gelée', flou: 3, onde: 3, freq: 0.02, epais: 4.5, paroi: 1, ame: 0.8, clair: 0.6, halo: 0.7, gouttes: true },
  faisceaux: { lot: 2, nom: 'faisceaux', desc: 'chaque synapse est une gerbe de trois fibres (la fibre optique)', flou: 2, onde: 2, freq: 0.02, epais: 3.5, paroi: 1, ame: 0.95, clair: 0.8, halo: 0.75, gouttes: true, geo: { faisceau: 3 } },
  mycelium: { lot: 2, nom: 'mycélium', desc: 'des cils poussent tout autour, des filaments relient', flou: 1.8, onde: 4, freq: 0.03, epais: 3.5, paroi: 0.95, ame: 0.7, clair: 0.55, halo: 0.75, gouttes: false, geo: { faisceau: 2, cils: { densite: 0.08, long: 18, large: 7 } } },
  xeno: { lot: 2, nom: 'xéno', desc: 'biomécanique (Giger) : des tubes à vertèbres, des épines aux coins', flou: 2.2, onde: 2, freq: 0.02, epais: 5, paroi: 1, ame: 0.45, clair: 0.35, halo: 0.5, gouttes: false, geo: { vertebres: { pas: 9, gonfle: 1.7 }, epines: { long: 24, large: 10 } } },
  abysses: { lot: 2, nom: 'abysses', desc: 'les grands fonds : des photophores dans la paroi, des ventouses sur le bord', flou: 3.5, onde: 6, freq: 0.018, epais: 5, paroi: 0.9, ame: 0, clair: 0, halo: 0.55, gouttes: true, photophores: true, geo: { ventouses: { pas: 24, r: 4.5 } } },
  cristal: { lot: 2, nom: 'cristal', desc: 'un minéral alien : des arêtes déchiquetées, les coins coupés, des pointes', flou: 1.2, onde: 7, freq: 0.09, epais: 3, paroi: 1, ame: 0.7, clair: 0.7, halo: 0.65, gouttes: false, chanfrein: true, geo: { epines: { long: 11, large: 5 } } },
  // RS-7 22.10 : « inspiration alien de Giger, ou Rick et Morty ; en fait un mélange complet de tout »
  portail: { lot: 2, nom: 'portail', desc: 'Rick et Morty : la slime verte, un gros contour noir cartoon, des coulures', flou: 4, onde: 16, freq: 0.012, epais: 4, paroi: 1, ame: 0.6, clair: 0.5, halo: 0.6, gouttes: true, contour: 3, geo: { coulures: { n: 3, long: 16, large: 6 } } },
  melange: { lot: 2, nom: 'mélange', desc: 'tout : les vertèbres de Giger, les cils, les photophores, le contour et les coulures de Rick et Morty', flou: 2.2, onde: 8, freq: 0.015, epais: 4.5, paroi: 1, ame: 0.55, clair: 0.5, halo: 0.6, gouttes: true, contour: 2.5, photophores: true, geo: { vertebres: { pas: 10, gonfle: 1.5 }, cils: { densite: 0.05, long: 16, large: 7 }, coulures: { n: 2, long: 14, large: 6 } } },
  // RS-7 22.10 : « et il en faut un cyberpunk, un cyberglysm, un autre tribal tekkno »
  cyberpunk: { lot: 2, nom: 'cyberpunk', desc: 'coins coupés, double trait néon (vert, jaune), des fibres, le halo en lignes de balayage', flou: 1.2, onde: 0, freq: 0.02, epais: 2.5, paroi: 1, ame: 0.9, clair: 0.75, halo: 0.8, gouttes: false, chanfrein: true, contour: 1.5, scan: true, geo: { faisceau: 2 } },
  cyberglysm: { lot: 2, nom: 'cyberglysm', desc: 'l\'organique qui bugge : tranché en bandes décalées, dédoublé vert / violet', flou: 2.5, onde: 3, freq: 0.02, epais: 3.5, paroi: 1, ame: 0.8, clair: 0.6, halo: 0.6, gouttes: true, glitch: 14 },
  tribal: { lot: 2, nom: 'tribal tekkno', desc: 'des lames épaisses, de longues épines, un gros contour noir : un tatouage tribal sur une machine', flou: 2, onde: 9, freq: 0.01, epais: 6, paroi: 1, ame: 0.3, clair: 0.3, halo: 0.45, gouttes: false, contour: 3.5, geo: { epines: { long: 28, large: 11 }, cils: { densite: 0.025, long: 26, large: 12 } } },
  // ---- LE TROISIÈME LOT : d'autres DA (RS-7 23.10 : « un aspect alternatif, genre gothique, alien, evangelion : il faut des UI pour tous
  // les types de DA »). Leurs couleurs voyagent avec elles (couleurs : appliquerCouleurs), toujours dans la palette de RS-7
  gothique: { lot: 3, nom: 'gothique', desc: 'la cathédrale : des ogives, des épines de fer, des filigranes, le sang', flou: 1.6, onde: 3, freq: 0.03, epais: 4, paroi: 1, ame: 0.25, clair: 0.2, halo: 0.35, gouttes: false, contour: 2, geo: { ogives: { haut: 22 }, epines: { long: 18, large: 7 }, cils: { densite: 0.035, long: 12, large: 4 } }, couleurs: { memb: '#4d4d4d', memb2: '#a90707', verre: 0.97, contour: '#191919' } },
  evangelion: { lot: 3, nom: 'evangelion', desc: 'NERV, l\'EVA-01 : violet et vert, les coins coupés, des bandes d\'alerte sur les liaisons, le balayage', flou: 1.1, onde: 0, freq: 0.02, epais: 2.5, paroi: 1, ame: 0.85, clair: 0.6, halo: 0.6, gouttes: false, chanfrein: true, scan: true, contour: 1.2, geo: { rayures: { pas: 8, couleur: '#ffff00' }, faisceau: 2 }, couleurs: { memb: '#37008a', memb2: '#0cdb0c', verre: 0.92, contour: '#ffff00' } },
  eldritch: { lot: 3, nom: 'eldritch', desc: 'Lovecraft : des tentacules, des ventouses, des yeux de lumière dans la paroi, rien de droit', flou: 3.5, onde: 18, freq: 0.014, epais: 5, paroi: 0.95, ame: 0.2, clair: 0.3, halo: 0.55, gouttes: true, photophores: true, geo: { cils: { densite: 0.03, long: 32, large: 10 }, ventouses: { pas: 22, r: 4 } }, couleurs: { memb: '#1d0048', memb2: '#014116', verre: 0.94 } },
  terminal: { nom: 'terminal', desc: 'le hand terminal de The Expanse : du verre, des arêtes ambre, les coins coupés', flou: 1, onde: 0, freq: 0.02, epais: 1.6, paroi: 0.9, ame: 0.6, clair: 0.5, halo: 0.55, gouttes: false, chanfrein: true },
};
import { poserPolice } from './polices.js';
const NS = 'http://www.w3.org/2000/svg';
/** la variante active (celle de <html>, sinon nerfs) */
export const variante = (D) => { const v = D && D.documentElement && D.documentElement.getAttribute('data-px-variante'); return VARIANTES[v] ? v : 'nerfs'; };
// (0.99.19, RS-7 sur l'iPhone : « le changement de peau fonctionne pas » ; les tuiles de l'atelier vides) WebKit ne refait pas le lien d'un
// filter="url(#id)" quand le <filter> est remplacé sous le MÊME id, et un élément dont le filtre manque n'est pas dessiné du tout. Chaque
// redéfinition d'une peau prend donc un id NEUF (sa génération) ; les anciens filtres partent plus tard, une fois les membranes redessinées.
const GEN = Object.create(null);
export const generation = (v) => GEN[v] || 0;
export const idFiltre = (v, couche, fin) => 'px-f-' + v + (GEN[v] ? '-g' + GEN[v] : '') + '-' + couche + (fin ? '-fin' : '');
const n = (x) => Math.round(x * 1000) / 1000;

/** le filtre d'une couche : « mb » la membrane (paroi + âme + halo), « dd » le dedans (la forme rétrécie de la paroi) */
export function filtre(id, p, couche) {
  return '<filter id="' + id + '" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">'
    + '<feGaussianBlur in="SourceGraphic" stdDeviation="' + n(p.flou) + '" result="b"/>'
    + (p.onde ? '<feTurbulence type="fractalNoise" baseFrequency="' + n(p.freq) + '" numOctaves="1" seed="7" result="n"/>'
      + '<feDisplacementMap in="b" in2="n" scale="' + n(p.onde) + '" xChannelSelector="R" yChannelSelector="G" result="d0"/>' : '<feOffset in="b" result="d0"/>')
    + (p.glitch ? '<feTurbulence type="turbulence" baseFrequency="0 0.07" numOctaves="1" seed="11" result="gn"/><feDisplacementMap in="d0" in2="gn" scale="' + n(p.glitch) + '" xChannelSelector="R" yChannelSelector="A" result="d"/>' : '<feOffset in="d0" result="d"/>')
    + '<feColorMatrix in="d" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -11" result="m"/>'
    + (couche === 'dd' ? '<feMorphology in="m" operator="erode" radius="' + n(p.epais) + '"/>'
      : '<feMorphology in="m" operator="erode" radius="' + n(p.epais) + '" result="e"/><feComposite in="m" in2="e" operator="out" result="paroi0"/>'
        + '<feColorMatrix in="paroi0" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 ' + n(p.paroi) + ' 0" result="paroi"/>'
        + (p.ame ? '<feMorphology in="m" operator="erode" radius="' + n(p.epais * 0.3) + '" result="e1"/><feMorphology in="m" operator="erode" radius="' + n(p.epais * 0.65) + '" result="e2"/>'
          + '<feComposite in="e1" in2="e2" operator="out" result="ame0"/>'
          + '<feColorMatrix in="ame0" type="matrix" values="' + n(1 - p.clair) + ' 0 0 0 ' + n(p.clair) + ' 0 ' + n(1 - p.clair) + ' 0 0 ' + n(p.clair) + ' 0 0 ' + n(1 - p.clair) + ' 0 ' + n(p.clair) + ' 0 0 0 ' + n(p.ame) + ' 0" result="ame"/>' : '')
        + '<feGaussianBlur in="m" stdDeviation="' + n(p.flou + 2) + '" result="h"/><feColorMatrix in="h" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 ' + n(p.halo) + ' 0" result="halo"/>'
        // les photophores : un bruit fin, seuillé → des points ; seulement dans la paroi ; la couleur de .px-f-photo (--bio)
        + (p.photophores ? '<feTurbulence type="fractalNoise" baseFrequency=".32" numOctaves="1" seed="3" result="pn"/>'
          + '<feColorMatrix in="pn" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 14 0 0 0 -8.4" result="pm"/>'
          + '<feComposite in="pm" in2="paroi0" operator="in" result="pz"/><feFlood class="px-f-photo" result="pc"/><feComposite in="pc" in2="pz" operator="in" result="photo"/>' : '')
        + (p.contour ? '<feMorphology in="m" operator="dilate" radius="' + n(p.contour) + '" result="dil"/><feComposite in="dil" in2="m" operator="out" result="ct0"/><feFlood class="px-f-contour" result="cc"/><feComposite in="cc" in2="ct0" operator="in" result="contour"/>' : '')
        + (p.scan ? '<feTurbulence type="fractalNoise" baseFrequency="0 0.5" numOctaves="1" seed="5" result="sn"/><feColorMatrix in="sn" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 9 0 0 0 -4" result="sl"/><feComposite in="halo" in2="sl" operator="in" result="halo2"/>' : '')
        + (p.glitch ? '<feOffset in="paroi0" dx="3" dy="0" result="g1"/><feFlood class="px-f-glitch1" result="gc1"/><feComposite in="gc1" in2="g1" operator="in" result="glA"/>'
          + '<feOffset in="paroi0" dx="-3" dy="1" result="g2"/><feFlood class="px-f-glitch2" result="gc2"/><feComposite in="gc2" in2="g2" operator="in" result="glB"/>' : '')
        + '<feMerge><feMergeNode in="' + (p.scan ? 'halo2' : 'halo') + '"/>' + (p.glitch ? '<feMergeNode in="glA"/><feMergeNode in="glB"/>' : '') + (p.contour ? '<feMergeNode in="contour"/>' : '') + '<feMergeNode in="paroi"/>' + (p.ame ? '<feMergeNode in="ame"/>' : '') + (p.photophores ? '<feMergeNode in="photo"/>' : '') + '</feMerge>')
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

/** (0.96) redéfinir une peau EN DIRECT (les knobs de l'atelier, une peau à toi) : ses nombres changent, ses anciens filtres s'en vont */
export function redefinir(D, v, p) {
  VARIANTES[v] = p;
  const vieux = [false, true].flatMap(fin => ['mb', 'dd'].map(c => idFiltre(v, c, fin)));
  GEN[v] = (GEN[v] || 0) + 1;
  if (!D || !D.getElementById) return;
  // les membranes se redessinent avec les nouveaux filtres (src/app/neurones.js écoute « px-peau ») ; les anciens partent ensuite
  const Wd = D.defaultView;
  try { if (Wd && Wd.CustomEvent) D.dispatchEvent(new Wd.CustomEvent('px-peau', { detail: { v } })); } catch (e) { /* */ }
  const purger = () => { for (const id of vieux) { const f = D.getElementById(id); if (f) f.remove(); } };
  if (Wd && Wd.setTimeout) Wd.setTimeout(purger, 2500); else purger();
}
/** les couleurs d'une peau qui les porte, posées sur un élément (<html> pour toute l'app, une tuile de l'atelier pour elle seule) */
export function appliquerCouleurs(el, v) {
  const p = VARIANTES[v], c = p && p.couleurs, st = el && el.style; if (!st) return;
  for (const [k, css] of [['memb', '--memb'], ['memb2', '--memb2'], ['contour', '--n-contour']]) { if (c && c[k]) st.setProperty(css, c[k]); else st.removeProperty(css); }
  if (c && c.verre != null) st.setProperty('--n-verre', String(c.verre)); else st.removeProperty('--n-verre');
  poserPolice(el, c && c.police ? c.police : null, '-peau');   // (0.96) une peau qui porte sa police
}
