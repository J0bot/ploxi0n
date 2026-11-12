// 🎞 LE BANC DES ANIMATIONS (0.99.51). RS-7 : « je voudrais un meilleur ploxion banc de test : que tu me fasses tester toutes les animations
// ou les trucs possibles, et que tu utilises le jOSSwipe pour que je choisisse ce qui me plaît ». docs/ANIMATIONS.md (le vocabulaire).
// Une carte = une VARIANTE d'une animation, jouée en boucle dans un petit téléphone ; on swipe : ✕ (non), ♥ (oui), ★ (c'est celle-là).
// Compose : jOSSwipe (le bion du labo, embarqué : public/bions/jOSSwipe.js ; il garde les choix dans « jsw:banc-anim », reprend où on
// s'était arrêté, et les synchronise par jOSBoxion si on est connecté). Les choix vont aussi dans boxion_local « banc/animations ». À la
// fin : le récapitulatif par famille, et « copier pour Claude » (un texte court à coller dans la conversation).
// Les animations sont des Web Animations (transform, opacity, clip-path, filter : le GPU) ; Calme ne coupe pas ce banc (on vient le voir).

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const C = { entre: 'cubic-bezier(.2,.88,.24,1)', sort: 'cubic-bezier(.4,0,.2,1)', ressort: 'cubic-bezier(.16,1,.3,1)', vivant: 'cubic-bezier(.3,1.6,.4,1)', lent: 'cubic-bezier(.45,.05,.25,1)', sec: 'cubic-bezier(.6,0,.4,1)' };
export const FAMILLES = [
  ['ouvrir', 'Ouvrir un ploxion', 'toucher une icône de l\'accueil'],
  ['fermer', 'Fermer un ploxion', '▁ minimiser, ‹ revenir à l\'accueil'],
  ['passer', 'Passer d\'une app à l\'autre', 'glisser depuis un bord'],
  ['koin', 'Ouvrir un koin', 'toucher le koin d\'un coin'],
  ['feuille', 'Une feuille, un tiroir', 'un bouton qui ouvre un panneau'],
  ['xer', 'Changer de xer', 'organique, chill-tekk, xerboxion, xerbot'],
  ['cascade', 'Arriver sur l\'accueil', 'les icônes qui se posent'],
  ['courbe', 'Le caractère du mouvement', 'la même ouverture, quatre courbes'],
  ['wormion', 'Le wormion qui tourne', 'tourner le doigt : le temps'],
];

// ---- la petite scène : un téléphone, un accueil (9 icônes, un dock), un ploxion (une barre, des lignes), deux koins ----
function scene(el) {
  el.innerHTML = '<div class="ba-tel"><div class="ba-acc">' + Array.from({ length: 9 }, (_, i) => '<i class="ba-ic" data-i="' + i + '"></i>').join('')
    + '<b class="ba-dock"></b></div><div class="ba-px"><u></u><s></s><s></s><s class="c"></s><s></s></div>'
    + '<div class="ba-px ba-px2"><u></u><s class="c"></s><s></s><s></s></div>'
    + '<em class="ba-koin ba-koin-g"></em><em class="ba-koin ba-koin-d"></em><div class="ba-cases"><i></i><i></i><i></i><i></i></div>'
    + '<div class="ba-voile"></div><div class="ba-feuille"><u></u><s></s><s></s></div><button class="ba-btn" tabindex="-1"></button>'
    + '<div class="ba-worm"><i></i><i></i><i></i><i></i><i></i></div></div>';
  const T = el.firstChild, q = (s) => T.querySelector(s), qa = (s) => [...T.querySelectorAll(s)];
  return { T, acc: q('.ba-acc'), ics: qa('.ba-ic'), px: q('.ba-px'), px2: q('.ba-px2'), koin: q('.ba-koin-g'), cases: q('.ba-cases'), voile: q('.ba-voile'),
    feuille: q('.ba-feuille'), btn: q('.ba-btn'), worm: q('.ba-worm'), cercles: qa('.ba-worm i'), L: T.clientWidth || 180, H: T.clientHeight || 320 };
}
/** une animation (Web Animations), sa fin en promesse ; pas d'animate (un vieux moteur) : on saute */
function A(el, kf, o) { if (!el || !el.animate) return Promise.resolve(); const a = el.animate(kf, { fill: 'both', ...o }); return a.finished.then(() => a, () => a); }
const attendre = (ms) => new Promise(r => setTimeout(r, ms));
/** l'icône n°4 (au milieu) : son carré dans la scène, et la transformation qui ramène le ploxion sur elle (comme src/app/zoom-icone.js) */
function versIcone(S, i = 4) {
  const ic = S.ics[i], tr = S.T.getBoundingClientRect(), r = ic.getBoundingClientRect();
  const L = tr.width || S.L, H = tr.height || S.H, x = r.left - tr.left, y = r.top - tr.top, c = r.width || 26, s = c / L, haut = (H - L) / 2;
  return { x, y, c, transform: 'translate(' + (x + c / 2 - L * s / 2).toFixed(1) + 'px,' + (y + c / 2 - H * s / 2).toFixed(1) + 'px) scale(' + s.toFixed(4) + ')',
    clip: 'inset(' + haut.toFixed(1) + 'px 0px ' + haut.toFixed(1) + 'px 0px round ' + Math.round(L * 0.225) + 'px)', cx: x + c / 2, cy: y + c / 2, L, H };
}
const PLEIN = { transform: 'translate(0px,0px) scale(1)', clipPath: 'inset(0px 0px 0px 0px round 0px)' };
function ouvrirIcone(S, courbe = C.entre, duree = 420) {
  const v = versIcone(S); S.px.style.transformOrigin = '0 0';
  return A(S.px, [{ transform: v.transform, clipPath: v.clip, opacity: .55 }, { opacity: 1, offset: .3 }, { ...PLEIN, opacity: 1 }], { duration: duree, easing: courbe });
}
const touche = (S, i = 4) => A(S.ics[i], [{ transform: 'scale(1)' }, { transform: 'scale(.86)' }, { transform: 'scale(1)' }], { duration: 160 });

// ---- les variantes : { id, famille, nom, sous, actuel?, jouer(S) } ----
export const VARIANTES = [
  // ouvrir
  { id: 'ouvrir-ios', famille: 'ouvrir', actuel: true, nom: 'Sortir de l\'icône (iOS)', sous: 'le ploxion part du carré de son icône et grandit ; rapide puis doux', jouer: async (S) => { await touche(S); await ouvrirIcone(S); } },
  { id: 'ouvrir-ios-rebond', famille: 'ouvrir', nom: 'Sortir de l\'icône, avec un rebond', sous: 'la même, qui dépasse un peu et revient', jouer: async (S) => { await touche(S); await ouvrirIcone(S, C.vivant, 520); } },
  { id: 'ouvrir-fondu', famille: 'ouvrir', nom: 'Un fondu qui monte (l\'ancien)', sous: 'sans provenance : il apparaît au milieu', jouer: async (S) => { await touche(S); await A(S.px, [{ opacity: 0, transform: 'translateY(14px) scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: C.entre }); } },
  { id: 'ouvrir-cercle', famille: 'ouvrir', nom: 'Un cercle qui s\'ouvre depuis l\'icône', sous: 'le ploxion est déjà là, révélé par un cercle qui part de l\'icône', jouer: async (S) => { await touche(S); const v = versIcone(S); await A(S.px, [{ clipPath: 'circle(' + (v.c / 2) + 'px at ' + v.cx + 'px ' + v.cy + 'px)' }, { clipPath: 'circle(' + Math.hypot(v.L, v.H) + 'px at ' + v.cx + 'px ' + v.cy + 'px)' }], { duration: 480, easing: C.entre }); } },
  { id: 'ouvrir-genie', famille: 'ouvrir', nom: 'Le génie', sous: 'il s\'étire hors de l\'icône comme aspiré à l\'envers (macOS)', jouer: async (S) => { await touche(S); const v = versIcone(S); S.px.style.transformOrigin = v.cx + 'px ' + v.cy + 'px'; await A(S.px, [{ transform: 'scale(.12,.04)', opacity: .3 }, { transform: 'scale(.5,1.05)', opacity: 1, offset: .45 }, { transform: 'scale(1)', opacity: 1 }], { duration: 500, easing: C.entre }); } },
  { id: 'ouvrir-couloir', famille: 'ouvrir', nom: 'Le couloir (3D)', sous: 'il sort de l\'icône en basculant vers toi, comme une porte', jouer: async (S) => { await touche(S); const v = versIcone(S); S.px.style.transformOrigin = v.cx + 'px ' + v.cy + 'px'; await A(S.px, [{ transform: 'perspective(500px) rotateX(70deg) scale(.15)', opacity: 0 }, { transform: 'perspective(500px) rotateX(0) scale(1)', opacity: 1 }], { duration: 520, easing: C.entre }); } },
  { id: 'ouvrir-ion', famille: 'ouvrir', nom: 'ON → ION (le nuage qui se condense)', sous: 'il naît flou et trop grand, et se condense net sous ton regard', jouer: async (S) => { await touche(S); await A(S.px, [{ filter: 'blur(14px)', transform: 'scale(1.18)', opacity: 0 }, { filter: 'blur(0px)', transform: 'scale(1)', opacity: 1 }], { duration: 560, easing: C.entre }); } },
  // fermer
  { id: 'fermer-ios', famille: 'fermer', actuel: true, nom: 'Rentrer dans l\'icône (iOS)', sous: 'le chemin inverse de l\'ouverture', avant: 'ouvert', jouer: async (S) => { const v = versIcone(S); S.px.style.transformOrigin = '0 0'; await A(S.px, [{ ...PLEIN, opacity: 1 }, { transform: v.transform, clipPath: v.clip, opacity: .35 }], { duration: 360, easing: C.entre }); } },
  { id: 'fermer-bas', famille: 'fermer', nom: 'Glisser vers le bas', sous: 'comme une carte qu\'on jette en bas', avant: 'ouvert', jouer: async (S) => { await A(S.px, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(105%) scale(.92)', opacity: .6 }], { duration: 360, easing: C.sort }); } },
  { id: 'fermer-dissout', famille: 'fermer', nom: 'Se dissoudre (ION → ON)', sous: 'il redevient nuage et s\'efface', avant: 'ouvert', jouer: async (S) => { await A(S.px, [{ filter: 'blur(0px)', transform: 'scale(1)', opacity: 1 }, { filter: 'blur(14px)', transform: 'scale(1.12)', opacity: 0 }], { duration: 420, easing: C.sort }); } },
  { id: 'fermer-point', famille: 'fermer', nom: 'Aspiré en un point', sous: 'il se tasse jusqu\'à un point au milieu, puis disparaît', avant: 'ouvert', jouer: async (S) => { S.px.style.transformOrigin = '50% 50%'; await A(S.px, [{ transform: 'scale(1)', opacity: 1, borderRadius: '0px' }, { transform: 'scale(.06)', opacity: .9, borderRadius: '50%', offset: .85 }, { transform: 'scale(0)', opacity: 0, borderRadius: '50%' }], { duration: 420, easing: C.sort }); } },
  // passer
  { id: 'passer-3d', famille: 'passer', actuel: true, nom: 'Le glissement en 3D (actuel)', sous: 'l\'app part en tournant, la suivante arrive de l\'autre côté', avant: 'ouvert', jouer: async (S) => { S.px2.style.opacity = 1; await Promise.all([A(S.px, [{ transform: 'none', opacity: 1 }, { transform: 'perspective(700px) translate3d(-34%,0,0) rotateY(22deg) scale(.8)', opacity: 0 }], { duration: 380, easing: C.sort }), A(S.px2, [{ transform: 'perspective(700px) translate3d(62%,0,0) rotateY(-24deg) scale(.84)', opacity: .15 }, { transform: 'none', opacity: 1 }], { duration: 460, easing: C.ressort })]); } },
  { id: 'passer-plat', famille: 'passer', nom: 'Le glissement à plat (iOS)', sous: 'les deux apps côte à côte, comme une bande', avant: 'ouvert', jouer: async (S) => { S.px2.style.opacity = 1; await Promise.all([A(S.px, [{ transform: 'translateX(0)' }, { transform: 'translateX(-100%)' }], { duration: 380, easing: C.ressort }), A(S.px2, [{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }], { duration: 380, easing: C.ressort })]); } },
  { id: 'passer-cube', famille: 'passer', nom: 'Le cube', sous: 'les deux apps sont deux faces d\'un cube qui tourne', avant: 'ouvert', jouer: async (S) => { S.px2.style.opacity = 1; S.px.style.transformOrigin = '100% 50%'; S.px2.style.transformOrigin = '0% 50%'; await Promise.all([A(S.px, [{ transform: 'perspective(600px) translateX(0) rotateY(0)' }, { transform: 'perspective(600px) translateX(-100%) rotateY(-90deg)' }], { duration: 520, easing: C.entre }), A(S.px2, [{ transform: 'perspective(600px) translateX(100%) rotateY(90deg)' }, { transform: 'perspective(600px) translateX(0) rotateY(0)' }], { duration: 520, easing: C.entre })]); } },
  { id: 'passer-fondu', famille: 'passer', nom: 'Le fondu enchaîné', sous: 'l\'une disparaît pendant que l\'autre apparaît, sur place', avant: 'ouvert', jouer: async (S) => { await Promise.all([A(S.px, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }), A(S.px2, [{ opacity: 0, transform: 'scale(.98)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 300 })]); } },
  { id: 'passer-pile', famille: 'passer', nom: 'La pile de cartes', sous: 'l\'app recule dans la pile, la suivante passe devant', avant: 'ouvert', jouer: async (S) => { S.px2.style.opacity = 1; await Promise.all([A(S.px, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-6%) scale(.86)', opacity: .5 }], { duration: 420, easing: C.entre }), A(S.px2, [{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 420, easing: C.ressort })]); } },
  // koin
  { id: 'koin-ouvre', famille: 'koin', actuel: true, nom: 'Le triangle qui s\'ouvre en carré (actuel)', sous: 'le koin grandit et s\'ouvre ; les cases sont dans l\'ouverture', jouer: async (S) => { S.voile.style.opacity = 0; const tri = 'polygon(0 100%,0 calc(100% - 40px),0 calc(100% - 40px),40px 100%)', car = 'polygon(0 100%,0 0,100% 0,100% 100%)'; await Promise.all([A(S.koin, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(3)', opacity: 0 }], { duration: 460, easing: C.entre }), A(S.cases, [{ clipPath: tri, opacity: 0 }, { opacity: 1, offset: .25 }, { clipPath: car, opacity: 1 }], { duration: 460, easing: C.entre }), A(S.voile, [{ opacity: 0 }, { opacity: 1 }], { duration: 350 })]); } },
  { id: 'koin-eventail', famille: 'koin', nom: 'L\'éventail', sous: 'les quatre cases se déplient en tournant depuis le coin', jouer: async (S) => { S.cases.style.opacity = 1; const cs = [...S.cases.children]; await Promise.all(cs.map((c, i) => A(c, [{ transform: 'rotate(' + (-60 + i * 12) + 'deg) scale(.2)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, delay: i * 50, easing: C.ressort }))); } },
  { id: 'koin-bulle', famille: 'koin', nom: 'La bulle depuis le coin', sous: 'un cercle part du coin et révèle les cases', jouer: async (S) => { await A(S.cases, [{ clipPath: 'circle(10px at 0% 100%)', opacity: 1 }, { clipPath: 'circle(150% at 0% 100%)', opacity: 1 }], { duration: 480, easing: C.entre }); } },
  { id: 'koin-tiroir', famille: 'koin', nom: 'Le tiroir', sous: 'les cases montent du bas comme un tiroir', jouer: async (S) => { await A(S.cases, [{ transform: 'translateY(100%)', opacity: 1 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: C.ressort }); } },
  // feuille
  { id: 'feuille-bas', famille: 'feuille', actuel: true, nom: 'Elle monte du bas (actuel)', sous: 'le voile fonce, la feuille monte', jouer: async (S) => { await A(S.btn, [{ transform: 'scale(1)' }, { transform: 'scale(.88)' }, { transform: 'scale(1)' }], { duration: 160 }); await Promise.all([A(S.voile, [{ opacity: 0 }, { opacity: 1 }], { duration: 160 }), A(S.feuille, [{ transform: 'translateY(100%)', opacity: .4 }, { transform: 'none', opacity: 1 }], { duration: 260, easing: C.ressort })]); } },
  { id: 'feuille-bouton', famille: 'feuille', nom: 'Elle sort de son bouton', sous: 'la provenance : la feuille grandit depuis le bouton touché', jouer: async (S) => { await A(S.btn, [{ transform: 'scale(1)' }, { transform: 'scale(.88)' }, { transform: 'scale(1)' }], { duration: 160 }); const tr = S.T.getBoundingClientRect(), b = S.btn.getBoundingClientRect(), f = S.feuille.getBoundingClientRect(); S.feuille.style.transformOrigin = ((b.left + b.width / 2) - f.left) + 'px ' + ((b.top + b.height / 2) - f.top) + 'px'; void tr; await Promise.all([A(S.voile, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 }), A(S.feuille, [{ transform: 'scale(.08)', opacity: 0, borderRadius: '30px' }, { transform: 'none', opacity: 1, borderRadius: '16px' }], { duration: 400, easing: C.entre })]); } },
  { id: 'feuille-pop', famille: 'feuille', nom: 'Elle apparaît au centre', sous: 'un petit « pop » sur place', jouer: async (S) => { await Promise.all([A(S.voile, [{ opacity: 0 }, { opacity: 1 }], { duration: 160 }), A(S.feuille, [{ transform: 'scale(.9)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 240, easing: C.vivant })]); } },
  // xer
  { id: 'xer-instant', famille: 'xer', actuel: true, nom: 'Instantané (actuel)', sous: 'l\'accueil change d\'un coup', jouer: async (S) => { await attendre(400); S.T.classList.toggle('ba-autre'); } },
  { id: 'xer-fondu', famille: 'xer', nom: 'Le fondu croisé', sous: 'l\'ancien xer s\'efface dans le nouveau', jouer: async (S) => { await A(S.acc, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 }); S.T.classList.toggle('ba-autre'); await A(S.acc, [{ opacity: 0 }, { opacity: 1 }], { duration: 260 }); } },
  { id: 'xer-cube', famille: 'xer', nom: 'Le cube qui tourne', sous: 'l\'interface est une face ; le cube tourne vers le nouveau xer', jouer: async (S) => { S.acc.style.transformOrigin = '50% 50% -90px'; await A(S.acc, [{ transform: 'perspective(600px) rotateY(0)' }, { transform: 'perspective(600px) rotateY(-90deg)' }], { duration: 260, easing: C.sort }); S.T.classList.toggle('ba-autre'); await A(S.acc, [{ transform: 'perspective(600px) rotateY(90deg)' }, { transform: 'perspective(600px) rotateY(0)' }], { duration: 320, easing: C.entre }); } },
  { id: 'xer-flip', famille: 'xer', nom: 'La peau qui se retourne', sous: 'l\'accueil se retourne comme une carte', jouer: async (S) => { await A(S.acc, [{ transform: 'perspective(600px) rotateX(0)' }, { transform: 'perspective(600px) rotateX(90deg)' }], { duration: 220, easing: C.sort }); S.T.classList.toggle('ba-autre'); await A(S.acc, [{ transform: 'perspective(600px) rotateX(-90deg)' }, { transform: 'perspective(600px) rotateX(0)' }], { duration: 280, easing: C.entre }); } },
  { id: 'xer-onde', famille: 'xer', nom: 'L\'onde depuis la case', sous: 'le nouveau xer se répand depuis là où tu as touché (un cercle qui grandit)', jouer: async (S) => { const c = S.acc.cloneNode(true); c.classList.add('ba-clone'); S.T.appendChild(c); S.T.classList.toggle('ba-autre'); c.classList.toggle('ba-autre-fixe', !S.T.classList.contains('ba-autre')); await A(S.acc, [{ clipPath: 'circle(0px at 80% 90%)' }, { clipPath: 'circle(150% at 80% 90%)' }], { duration: 520, easing: C.entre }); c.remove(); } },
  // cascade
  { id: 'cascade-une', famille: 'cascade', actuel: true, nom: 'Une à une (actuel)', sous: 'les icônes se posent dans l\'ordre, un léger rebond', jouer: async (S) => { await Promise.all(S.ics.map((e, i) => A(e, [{ opacity: 0, transform: 'translateY(10px) scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 280, delay: i * 30, easing: 'cubic-bezier(.2,.9,.3,1.25)' }))); } },
  { id: 'cascade-centre', famille: 'cascade', nom: 'Depuis le centre', sous: 'elles naissent du milieu, en anneaux', jouer: async (S) => { await Promise.all(S.ics.map((e, i) => { const d = Math.max(Math.abs((i % 3) - 1), Math.abs(Math.floor(i / 3) - 1)); return A(e, [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: d * 70, easing: C.ressort }); })); } },
  { id: 'cascade-vague', famille: 'cascade', nom: 'La vague en diagonale', sous: 'une vague qui traverse la grille', jouer: async (S) => { await Promise.all(S.ics.map((e, i) => A(e, [{ opacity: 0, transform: 'translate(-8px,-8px) rotate(-8deg)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: ((i % 3) + Math.floor(i / 3)) * 55, easing: C.entre }))); } },
  { id: 'cascade-aucune', famille: 'cascade', nom: 'Aucune', sous: 'tout est là tout de suite', jouer: async () => { await attendre(300); } },
  // courbe : la même ouverture
  { id: 'courbe-ios', famille: 'courbe', actuel: true, nom: 'iOS (rapide, puis doux)', sous: 'cubic-bezier(.2,.88,.24,1), 420 ms', jouer: async (S) => { await touche(S); await ouvrirIcone(S, C.entre, 420); } },
  { id: 'courbe-rebond', famille: 'courbe', nom: 'Vivant (un rebond)', sous: 'cubic-bezier(.3,1.6,.4,1), 520 ms', jouer: async (S) => { await touche(S); await ouvrirIcone(S, C.vivant, 520); } },
  { id: 'courbe-lente', famille: 'courbe', nom: 'Lent, posé', sous: 'cubic-bezier(.45,.05,.25,1), 650 ms', jouer: async (S) => { await touche(S); await ouvrirIcone(S, C.lent, 650); } },
  { id: 'courbe-seche', famille: 'courbe', nom: 'Sec, rapide', sous: 'cubic-bezier(.6,0,.4,1), 240 ms', jouer: async (S) => { await touche(S); await ouvrirIcone(S, C.sec, 240); } },
  // wormion
  { id: 'wormion-tunnel', famille: 'wormion', actuel: true, nom: 'Le tunnel du temps (actuel)', sous: 'chaque cercle tourne à sa vitesse', avant: 'worm', jouer: async (S) => { await Promise.all(S.cercles.map((c, i) => A(c, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(' + (60 + i * 70) + 'deg)' }, { transform: 'rotate(0deg)' }], { duration: 1600, easing: C.entre }))); } },
  { id: 'wormion-ondes', famille: 'wormion', nom: 'Des ondes à chaque cran', sous: 'les cercles restent ; une onde part du centre à chaque cran', avant: 'worm', jouer: async (S) => { for (let k = 0; k < 4; k++) { await Promise.all(S.cercles.map((c, i) => A(c, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(' + (1 + 0.12 * (5 - i)) + ')', opacity: .4 }, { transform: 'scale(1)', opacity: 1 }], { duration: 340, delay: i * 40 }))); } } },
  { id: 'wormion-spirale', famille: 'wormion', nom: 'La spirale', sous: 'les cercles s\'enroulent vers le centre, comme un trou de ver', avant: 'worm', jouer: async (S) => { await Promise.all(S.cercles.map((c, i) => A(c, [{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(' + (180 + i * 40) + 'deg) scale(' + (0.6 + i * 0.05) + ')' }, { transform: 'rotate(360deg) scale(1)' }], { duration: 1800, easing: C.lent }))); } },
];

/** le texte à coller dans la conversation : les ★ et les ♥ par famille */
export function resume(choix, version = '') {
  const lignes = ['Banc des animations' + (version ? ' ' + version : '') + ' :'];
  for (const [f, nom] of FAMILLES) {
    const l = VARIANTES.filter(v => v.famille === f), et = (k) => l.filter(v => choix[v.id] === k).map(v => v.id);
    const love = et('love'), like = et('like'); if (!love.length && !like.length) { if (l.some(v => choix[v.id])) lignes.push('- ' + nom + ' : rien ne plaît'); continue; }
    lignes.push('- ' + nom + ' : ' + [...love.map(x => '★ ' + x), ...like.map(x => '♥ ' + x)].join(', '));
  }
  return lignes.join('\n');
}

const CSS = '.ba{height:100%;box-sizing:border-box;display:flex;flex-direction:column}.ba [data-deck]{flex:1;min-height:420px;display:flex;flex-direction:column}.ba [data-deck]>*{flex:1;min-height:0}'
  + '.ba{padding:4px 8px 30px;color:var(--txt,#e6e9f2);font-size:14px}.ba h2{margin:2px 0;font-size:1.15rem}.ba .n{color:var(--muted,#8aa0c0);font-size:.82rem;margin:0 0 8px}'
  + '.ba-carte{display:flex;flex-direction:column;align-items:center;gap:4px;padding:4px 4px 2px;text-align:center}'
  + '.ba-carte .f{font:600 10px ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;color:var(--muted,#8aa0c0)}.ba-carte .t{font-weight:700;font-size:15px}'
  + '.ba-carte .s{font-size:11.5px;line-height:1.3;color:var(--muted,#8aa0c0);max-width:260px;min-height:2.6em}.ba-carte .a{font:700 9px ui-monospace,monospace;letter-spacing:.12em;color:#7dbfb8;border:1px solid #7dbfb8;border-radius:6px;padding:1px 6px}'
  + '.ba-tel{position:relative;width:132px;height:236px;border-radius:22px;background:#0b0d14;box-shadow:inset 0 0 0 2px rgba(255,255,255,.1);overflow:hidden;--ac:#9a86ff;--ac2:#7dbfb8}'
  + '.ba-tel.ba-autre,.ba-clone.ba-autre-fixe{--ac:#ffb35a;--ac2:#ff6b8b}.ba-tel.ba-autre .ba-acc,.ba-clone.ba-autre-fixe{background:#1a1110}'
  + '.ba-acc{position:absolute;inset:0;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:32px 15px 52px;align-content:start;background:#0b0d14}.ba-clone{z-index:0}'
  + '.ba-ic{display:block;aspect-ratio:1/1;border-radius:22%;background:linear-gradient(145deg,var(--ac),var(--ac2));opacity:.85}'
  + '.ba-dock{position:absolute;left:16px;right:16px;bottom:14px;height:34px;border-radius:14px;background:rgba(255,255,255,.07)}'
  + '.ba-px{position:absolute;inset:0;background:#141826;opacity:0;padding:34px 14px;z-index:2}.ba-px u{display:block;height:20px;border-radius:6px;background:var(--ac);opacity:.8;margin-bottom:14px}'
  + '.ba-px s{display:block;height:9px;border-radius:5px;background:rgba(255,255,255,.14);margin:9px 0}.ba-px s.c{width:60%}.ba-px2{background:#1d1426;z-index:3}.ba-px2 u{background:var(--ac2)}'
  + '.ba-koin{position:absolute;bottom:0;width:40px;height:40px;background:linear-gradient(45deg,var(--ac) 50%,transparent 50%);transform-origin:0 100%;z-index:5;opacity:0}.ba-koin-g{left:0}.ba-koin-d{right:0;transform:scaleX(-1)}'
  + '.ba-cases{position:absolute;left:7px;right:7px;bottom:7px;height:108px;display:grid;grid-template-columns:1fr 1fr;gap:6px;opacity:0;z-index:6}.ba-cases i{border-radius:12px;background:#1b2030;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}'
  + '.ba-voile{position:absolute;inset:0;background:rgba(5,5,10,.6);opacity:0;z-index:4}'
  + '.ba-feuille{position:absolute;left:6px;right:6px;bottom:6px;height:108px;border-radius:16px;background:#1b2030;padding:18px 14px;opacity:0;z-index:6}.ba-feuille u{display:block;height:14px;width:50%;border-radius:5px;background:var(--ac)}.ba-feuille s{display:block;height:9px;border-radius:5px;background:rgba(255,255,255,.14);margin:12px 0}'
  + '.ba-btn{position:absolute;right:16px;top:14px;width:34px;height:20px;border-radius:10px;border:0;background:var(--ac2);opacity:0;z-index:3;padding:0}'
  + '.ba-worm{position:absolute;inset:0;display:none;z-index:2;background:#0b0d14}.ba-worm i{position:absolute;left:50%;top:50%;border-radius:50%;border:2px solid var(--ac)}'
  + '.ba-worm i:nth-child(1){width:104px;height:104px;margin:-52px 0 0 -52px}.ba-worm i:nth-child(2){width:104px;height:104px;margin:-50px 0 0 -54px}.ba-worm i:nth-child(3){width:70px;height:70px;margin:-33px 0 0 -37px}.ba-worm i:nth-child(4){width:38px;height:38px;margin:-17px 0 0 -21px}.ba-worm i:nth-child(5){width:10px;height:10px;margin:-4px 0 0 -6px;background:var(--ac)}'
  + '.ba-rec{white-space:pre-wrap;font:12px/1.5 ui-monospace,monospace;background:#0d1016;border-radius:12px;padding:12px;margin:10px 0}.ba-b{display:flex;gap:8px;flex-wrap:wrap}.ba-b button{flex:1;min-height:40px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:#151a24;color:inherit;font-weight:600}';

/** prépare la scène pour une variante (ce qui doit être visible avant qu'elle joue) */
function poser(S, v) {
  for (const el of [S.px, S.px2, S.koin, S.cases, S.voile, S.feuille, S.btn, S.acc, ...S.ics, ...S.cases.children, ...S.cercles]) { if (el.getAnimations) for (const a of el.getAnimations()) a.cancel(); el.style.transformOrigin = ''; }
  S.px.style.opacity = v.avant === 'ouvert' ? 1 : 0; S.px2.style.opacity = 0; S.worm.style.display = v.avant === 'worm' ? 'block' : 'none';
  S.koin.style.opacity = v.famille === 'koin' ? 1 : 0; S.cases.style.opacity = 0; S.voile.style.opacity = 0; S.feuille.style.opacity = 0; S.btn.style.opacity = v.famille === 'feuille' ? 1 : 0;
  for (const c of S.T.querySelectorAll('.ba-clone')) c.remove();
}

/** vibrer : (motif) → Promise ; charger() : jOSSwipe (le pack de l'app) */
export function enregistrerBancAnim({ W = globalThis.window, boxion = null, version = '', vibrer = () => Promise.resolve(), charger = null } = {}) {
  const D = W.document;
  const swipe = () => (W.jOSSwipe ? Promise.resolve(W.jOSSwipe) : charger ? charger() : new Promise((ok, ko) => {
    const s = D.createElement('script'); s.src = 'bions/jOSSwipe.js'; s.dataset.bion = 'jOSSwipe';
    s.onload = () => (W.jOSSwipe ? ok(W.jOSSwipe) : ko(new Error('jOSSwipe'))); s.onerror = () => ko(new Error('jOSSwipe introuvable')); D.head.appendChild(s);
  }));
  function mount(hote) {
    let vivant = true, deck = null; const choix = {};
    hote.innerHTML = '<div class="ba"><style>' + CSS + '</style><div data-deck></div><div data-fin></div></div>';
    const zone = hote.querySelector('[data-deck]'), fin = hote.querySelector('[data-fin]');
    const garder = () => { if (boxion) boxion.put('banc', 'animations', { choix, le: Date.now(), version }).catch(() => {}); };
    if (boxion) boxion.get('banc', 'animations').then(v => { if (v && v.choix) Object.assign(choix, v.choix, { ...choix }); }).catch(() => {});
    function recap() {
      const t = resume(choix, version);
      fin.innerHTML = '<div class="ba-rec" data-rec>' + esc(t) + '</div><div class="ba-b"><button data-ba="copier">copier pour Claude</button><button data-ba="partager">partager</button><button data-ba="refaire">tout revoir</button></div>';
    }
    fin.addEventListener('click', async (e) => {
      const a = e.target.closest('[data-ba]'); if (!a) return; const t = resume(choix, version), k = a.getAttribute('data-ba');
      if (k === 'copier') { try { if (W.jOSNatif && W.jOSNatif.copier) await W.jOSNatif.copier(t); else await W.navigator.clipboard.writeText(t); a.textContent = '✓ copié'; } catch (er) { a.textContent = 'copie impossible'; } }
      if (k === 'partager') { try { if (W.jOSNatif && W.jOSNatif.partager) await W.jOSNatif.partager({ texte: t }); else if (W.navigator.share) await W.navigator.share({ text: t }); } catch (er) { /* annulé */ } }
      if (k === 'refaire') { try { W.localStorage.removeItem('jsw:banc-anim'); W.localStorage.removeItem('jsw:banc-anim:hist'); } catch (er) { /* */ } for (const x of Object.keys(choix)) delete choix[x]; garder(); fin.innerHTML = ''; if (deck && deck.destroy) deck.destroy(); lancer(); }
    });
    const items = VARIANTES.map(v => ({ id: v.id, render: (body) => {
      const nf = (FAMILLES.find(f => f[0] === v.famille) || [])[1] || v.famille;
      body.innerHTML = '<div class="ba-carte"><span class="f">' + esc(nf) + '</span><span class="t">' + esc(v.nom) + '</span>' + (v.actuel ? '<span class="a">ACTUEL</span>' : '') + '<span class="s">' + esc(v.sous) + '</span><div data-sc></div></div>';
      const sc = body.querySelector('[data-sc]'), S = scene(sc);
      (async () => {   // la boucle : tant que la carte est dans la page
        await attendre(60);
        while (vivant && sc.isConnected) { poser(S, v); await attendre(450); if (!vivant || !sc.isConnected) break; try { await v.jouer(S); } catch (e) { /* une variante qui plante ne casse pas le banc */ } await attendre(900); }
      })();
    } }));
    function lancer() {
      swipe().then((J) => {
        if (!vivant) return;
        deck = J.mount(zone, { items, persistNs: 'banc-anim', title: '🎞 Banc des animations', hint: VARIANTES.length + ' variantes en boucle · ← non · → oui · ↑ c\'est celle-là',
          onVerdict: (item, verdict) => { choix[item.id] = verdict; garder(); vibrer(verdict === 'love' ? 'succes' : 'selection'); },
          onDone: (res) => { if (res && typeof res === 'object') Object.assign(choix, res); garder(); recap(); } });
      }).catch((e) => { zone.innerHTML = '<p class="n">jOSSwipe n\'est pas là (' + esc(e.message) + ').</p>'; });
    }
    lancer();
    return { unmount() { vivant = false; try { if (deck && deck.destroy) deck.destroy(); } catch (e) { /* */ } hote.innerHTML = ''; } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps['banc-anim'] = { manifest: { id: 'banc-anim', name: 'Banc des animations', icon: '🎞' }, mount };
  return { id: 'banc-anim', nom: 'Banc des animations', icone: '🎞', interne: true };
}
