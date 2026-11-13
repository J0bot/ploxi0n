// 🔍 OUVRIR DEPUIS L'ICÔNE, REFERMER DANS L'ICÔNE (0.99.48, RS-7 : « les animations c'est le plus important, ça montre d'où ça vient quand ça
// s'ouvre ou se ferme ; quand on ouvre un ploxion, il s'agrandit et s'ouvre à partir de l'icône ; prendre exemple sur l'UI iPhone »).
// Comme l'écran d'accueil d'iOS : le ploxion part du carré de son icône (même place, même taille, coins arrondis) et grandit jusqu'à l'écran ;
// au retour, il rapetisse jusque dans son icône (ou, si elle n'est pas à l'écran, vers le milieu, en s'effaçant). Une mise à l'échelle UNIFORME
// (le contenu ne se déforme pas) + un clip-path qui découpe le carré de l'icône dans l'écran mis à l'échelle. La courbe : rapide au départ,
// un atterrissage doux (un ressort sans rebond, comme iOS). « Réduire les animations » d'iOS / le mode Calme : rien, l'ouverture directe.

export const DUREE_OUVRIR = 420, DUREE_FERMER = 360;
export const COURBE = 'cubic-bezier(.2,.88,.24,1)';
export const RAYON = 0.225;   // l'arrondi d'une icône d'iOS, en fraction de son côté

/**
 * la clé de départ (ou d'arrivée) : l'élément (L × H, posé en ox, oy à l'écran) ramené sur le carré de l'icône r = { x, y, width, height }
 * → { transform, clipPath } (l'élément a transform-origin 0 0)
 */
export function cleIcone(r, L, H, ox = 0, oy = 0) {
  const cote = Math.max(1, Math.min(r.width, r.height));
  const s = cote / L;   // uniforme : la largeur de l'écran devient le côté de l'icône
  const haut = Math.max(0, (H - L) / 2);   // on découpe un carré L × L au milieu de l'écran (dans les coordonnées du hôte)
  const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
  const tx = cx - ox - (L * s) / 2, ty = cy - oy - (H * s) / 2;
  const R = Math.round(L * RAYON);
  return {
    transform: 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) scale(' + s.toFixed(5) + ')',
    clipPath: 'inset(' + haut.toFixed(1) + 'px 0px ' + haut.toFixed(1) + 'px 0px round ' + R + 'px)',
  };
}
export const CLE_PLEIN = { transform: 'translate(0px,0px) scale(1)', clipPath: 'inset(0px 0px 0px 0px round 0px)' };
/** quand l'icône n'est pas à l'écran : un petit carré au milieu, un peu plus bas (là où iOS fait disparaître une app sans icône visible) */
export const carreMilieu = (L, H) => ({ x: L / 2 - 30, y: H * 0.56 - 30, width: 60, height: 60 });

/** un rectangle utilisable (à l'écran, pas vide) ou null */
export function rectVisible(r, L, H) {
  if (!r || !(r.width > 4) || !(r.height > 4)) return null;
  if (r.x + r.width < 0 || r.y + r.height < 0 || r.x > L || r.y > H) return null;
  return { x: r.x, y: r.y, width: r.width, height: r.height };
}

// 🎞 (0.99.52) LES ANIMATIONS CHOISIES (le Banc des animations, src/lot/banc-anim.js : « nos paramètres, en ajoutant ou supprimant des
// animations ») : prefs.animations = { ouvrir, fermer, courbe, … } → l'id d'une variante. La courbe règle la durée et l'easing des deux.
export const COURBES = { 'courbe-ios': [COURBE, DUREE_OUVRIR], 'courbe-rebond': ['cubic-bezier(.3,1.6,.4,1)', 520], 'courbe-lente': ['cubic-bezier(.45,.05,.25,1)', 650], 'courbe-seche': ['cubic-bezier(.6,0,.4,1)', 240] };
export const OUVRIR = ['ouvrir-ios', 'ouvrir-ios-rebond', 'ouvrir-fondu', 'ouvrir-cercle', 'ouvrir-genie', 'ouvrir-couloir', 'ouvrir-ion'];
export const FERMER = ['fermer-ios', 'fermer-bas', 'fermer-dissout', 'fermer-point'];
/** les clés d'une ouverture (de → plein) ; null = pas d'animation ici (le fondu du CSS prend le relais) */
export function clesOuvrir(id, v, L, H, ox, oy) {
  const cx = v.x + v.width / 2 - ox, cy = v.y + v.height / 2 - oy;
  switch (id) {
    case 'ouvrir-fondu': return null;
    case 'ouvrir-cercle': return { kf: [{ clipPath: 'circle(' + (v.width / 2).toFixed(1) + 'px at ' + cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px)' }, { clipPath: 'circle(' + Math.ceil(Math.hypot(L, H)) + 'px at ' + cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px)' }], origine: '0 0' };
    case 'ouvrir-genie': return { kf: [{ transform: 'scale(.12,.04)', opacity: 0.3 }, { transform: 'scale(.5,1.05)', opacity: 1, offset: 0.45 }, { transform: 'scale(1,1)', opacity: 1 }], origine: cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px' };
    case 'ouvrir-couloir': return { kf: [{ transform: 'perspective(900px) rotateX(70deg) scale(.15)', opacity: 0 }, { transform: 'perspective(900px) rotateX(0deg) scale(1)', opacity: 1 }], origine: cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px' };
    case 'ouvrir-ion': return { kf: [{ filter: 'blur(14px)', transform: 'scale(1.18)', opacity: 0 }, { filter: 'blur(0px)', transform: 'scale(1)', opacity: 1 }], origine: '50% 50%' };
    default: return { kf: [{ ...cleIcone(v, L, H, ox, oy), opacity: 0.55 }, { opacity: 1, offset: 0.3 }, { ...CLE_PLEIN, opacity: 1 }], origine: '0 0' };   // ouvrir-ios (et le rebond : la courbe)
  }
}
/** les clés d'une fermeture (plein → fin) */
export function clesFermer(id, v, sansIcone, L, H, ox, oy, L0, H0) {
  switch (id) {
    case 'fermer-bas': return { kf: [{ transform: 'none', opacity: 1 }, { transform: 'translateY(105%) scale(.92)', opacity: 0.6 }], origine: '50% 50%' };
    case 'fermer-dissout': return { kf: [{ filter: 'blur(0px)', transform: 'scale(1)', opacity: 1 }, { filter: 'blur(14px)', transform: 'scale(1.12)', opacity: 0 }], origine: '50% 50%' };
    case 'fermer-point': return { kf: [{ transform: 'scale(1)', opacity: 1, borderRadius: '0px' }, { transform: 'scale(.06)', opacity: 0.9, borderRadius: '50%', offset: 0.85 }, { transform: 'scale(0)', opacity: 0, borderRadius: '50%' }], origine: '50% 50%' };
    default: return { kf: [{ ...CLE_PLEIN, opacity: 1 }, { ...cleIcone(v || carreMilieu(L0, H0), L, H, ox, oy), opacity: sansIcone ? 0 : 0.35 }], origine: '0 0' };
  }
}

/**
 * le zoom, sur un élément plein écran (le hôte d'un ploxion).
 * → { ouvrir(el, r) → Animation|null, fermer(el, r|null) → Promise (résolue à la fin, ou tout de suite sans animation) }
 */
export function creerZoomIcone({ W = globalThis.window, calme = () => false, choix = () => ({}) } = {}) {
  const peut = (el) => !calme() && el && typeof el.animate === 'function';
  const ecran = () => [W.innerWidth || 390, W.innerHeight || 844];
  /** le cadre réel de l'élément (le hôte d'un ploxion n'est pas toujours tout l'écran : la barre du haut) */
  const cadre = (el) => { const [L, H] = ecran(); try { const b = el.getBoundingClientRect(); if (b.width > 10 && b.height > 10) return [b.width, b.height, b.left, b.top]; } catch (e) { /* */ } return [L, H, 0, 0]; };
  function ouvrir(el, r) {
    const [L0, H0] = ecran(), v = rectVisible(r, L0, H0);
    if (!peut(el) || !v) return null;
    const [L, H, ox, oy] = cadre(el), c = choix() || {}, id = OUVRIR.includes(c.ouvrir) ? c.ouvrir : 'ouvrir-ios';
    const k = clesOuvrir(id, v, L, H, ox, oy); if (!k) return null;
    const [easing, duree] = id === 'ouvrir-ios-rebond' ? COURBES['courbe-rebond'] : (COURBES[c.courbe] || COURBES['courbe-ios']);
    el.style.transformOrigin = k.origine;
    // l'opacité arrive vite (le contenu se lit dès le premier tiers), la forme suit la courbe jusqu'au bout
    const a = el.animate(k.kf, { duration: duree, easing });
    a.onfinish = a.oncancel = () => { el.style.transformOrigin = ''; };
    return a;
  }
  function fermer(el, r) {
    const [L0, H0] = ecran(), v = rectVisible(r, L0, H0), sansIcone = !v;
    if (!peut(el)) return Promise.resolve(false);
    const [L, H, ox, oy] = cadre(el), c = choix() || {}, id = FERMER.includes(c.fermer) ? c.fermer : 'fermer-ios';
    const k = clesFermer(id, v, sansIcone, L, H, ox, oy, L0, H0), [easing, d] = COURBES[c.courbe] || COURBES['courbe-ios'];
    el.style.transformOrigin = k.origine;
    const a = el.animate(k.kf, { duration: Math.round(d * DUREE_FERMER / DUREE_OUVRIR), easing: id === 'fermer-ios' ? easing : 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    return new Promise((res) => {
      // l'appelant cache le hôte dans la foulée (même tâche) ; l'état final tient jusque-là (fill), puis on libère l'élément
      const finir = (ok) => { res(ok); (W.setTimeout || setTimeout)(() => { try { a.cancel(); } catch (e) { /* */ } el.style.transformOrigin = ''; el.__pxSortie = null; }, 60); };
      a.onfinish = () => finir(true); a.oncancel = () => { el.style.transformOrigin = ''; res(false); };
      el.__pxSortie = a;
    });
  }
  return { ouvrir, fermer };
}
