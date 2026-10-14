// ▣ DANS LE CUBE (0.67). RS-7 (14.10) : « un ploxion avec un format différent : c'est comme si on était à l'intérieur d'un cube, que notre
// téléphone c'est une face du cube, et qu'on peut voir les autres faces à l'intérieur avec l'effet gyroscope ; il faut pouvoir peupler
// l'intérieur du cube avec ce qu'on veut, et changer les faces du cube vers d'autres xers ».
//   - L'ÉCRAN EST LA FACE OUVERTE : derrière lui, une salle en vraie 3D (CSS, preserve-3d) — le fond, les deux murs, le plafond, le sol.
//     Pencher l'iPhone déplace le point de vue (perspective-origin, relatif à la tenue du début) : on voit les murs comme par une fenêtre.
//   - CHAQUE FACE EST UN XER : l'accueil (tes ploxions), un koin (une famille), ce qui vit, tes tsoins, une image, le trait (vide).
//     Toucher l'étiquette d'une face : en choisir un autre. Toucher un ploxion sur une face : y aller.
//   - L'INTÉRIEUR SE PEUPLE : ＋ un ploxion, un mot, une image, un glyphe — ils flottent dans la salle, à une profondeur. Glisser :
//     les déplacer ; deux touchers : plus loin / plus près ; appui long : les retirer.
// (0.68) RS-7 : « mais surtout, le cube c'est une vue pour les ploxions qui ont plusieurs pages ». La salle est partagée (monterSalle) :
//   - ce ploxion « dans le cube » : les faces sont des xers (boxion_local « reglages/cube-interieur ») ;
//   - le cube DES PAGES d'un ploxion (src/app/cube-pages.js, ▣ dans sa barre) : `pages` donné → la page où l'on est au fond, la suivante à
//     droite, la précédente à gauche, +2 au plafond, −2 au sol (facesDesPages, sans doublon) ; les faces sans page restent des xers au choix.
//     Glisser : le cube TOURNE (la face d'à côté vient au fond) ; toucher une face : elle vient au fond ; toucher le fond : on y entre.
// Perf : cinq faces et quelques objets, un seul style écrit par image (perspective-origin), la boucle s'arrête au repos.
import { categorieDe } from './xerkion-icone.js';

export const FACES = ['fond', 'gauche', 'droite', 'plafond', 'sol'];
const DEFAUT = { faces: { fond: 'accueil', gauche: 'vivants', droite: 'tsoins', plafond: 'trait', sol: 'trait' }, objets: [] };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const borne = (x, a, b) => Math.max(a, Math.min(b, x));
/** les xers qu'une face peut montrer */
export function xersPossibles(liste) {
  const cats = [...new Set(liste.map(p => p.cat || categorieDe(p)))];
  return [['accueil', 'l\'accueil'], ['vivants', 'ce qui vit'], ['tsoins', 'tes tsoins'], ...cats.map(c => ['koin:' + c, 'le koin ' + c]), ['image', 'une image'], ['trait', 'le trait (vide)']];
}
// l'anneau des pages : au fond la page i, à droite i+1, à gauche i−1, au plafond i+2, au sol i−2
const ANNEAU = [['fond', 0], ['droite', 1], ['gauche', -1], ['plafond', 2], ['sol', -2]];
/** quelle page sur quelle face (n pages, la page i au fond) : { fond: i, droite: …, … } ; une page n'est montrée qu'une fois */
export function facesDesPages(n, i) {
  const r = {}, pris = new Set(); if (!(n > 0)) return r;
  for (const [f, d] of ANNEAU) { const k = (((i + d) % n) + n) % n; if (pris.has(k)) continue; pris.add(k); r[f] = k; }
  return r;
}
// tourner le cube pour qu'une face vienne au fond (autour du centre de la salle)
const ROTATION = { droite: 'rotateY(90deg)', gauche: 'rotateY(-90deg)', plafond: 'rotateX(90deg)', sol: 'rotateX(-90deg)' };

/** la salle : monte un cube dans `hote`. o.lire() → l'état { faces, objets, images } (gardé par o.garder()) ; o.pages (facultatif) :
 *  { n(), i, nom(k), photo(k) → un nœud ou null, entrer(k), sortir() } ; o.profondeur : la profondeur de la salle (× sa largeur) */
export function monterSalle(hote, { W = globalThis.window, lire, garder = () => {}, liste = () => [], vivants = () => [], tsoins = async () => [], aller = () => {}, vibrer = () => {},
  icone = (p) => esc(p.icone || '▣'), glyphe = () => '', pages = null, profondeur = 1.3, aide = 'penche l\'iPhone · touche une étiquette pour changer de xer' } = {}) {
  const D = W.document;
  let vivant = true, image = 0, base = null, vue = { x: 0, y: 0 }, cible = { x: 0, y: 0 }, ecrit = '', off = null, etat = null, anim = false, place = {};
  hote.innerHTML = '<div class="ci-salle' + (pages ? ' ci-des-pages' : '') + '"><div class="ci-boite"></div></div><div class="ci-barre"><button type="button" data-ci-plus>＋ peupler</button>'
    + (pages ? '<button type="button" data-ci-sortir aria-label="revenir à la page">⤢</button>' : '') + '<small>' + esc(aide) + '</small></div>';
  const salle = hote.querySelector('.ci-salle'), boite = hote.querySelector('.ci-boite');
  const dims = () => { const r = salle.getBoundingClientRect(); const w = r.width || W.innerWidth || 390, h = r.height || W.innerHeight || 700; return { w, h, d: Math.round(w * profondeur) }; };
  async function contenu(face, xer) {
    const l = liste();
    const grille = (ps) => '<div class="ci-grille">' + ps.slice(0, 24).map(p => '<button type="button" data-ci-aller="' + esc(p.id) + '"><span>' + icone(p) + '</span><b>' + esc(p.nom || p.id) + '</b></button>').join('') + '</div>';
    if (xer === 'accueil') return grille(l);
    if (xer === 'vivants') { const v = new Set(vivants()); const ps = l.filter(p => v.has(p.id)); return ps.length ? grille(ps) : '<p class="ci-vide">rien d\'ouvert</p>'; }
    if (xer.startsWith('koin:')) { const c = xer.slice(5); return grille(l.filter(p => (p.cat || categorieDe(p)) === c)); }
    if (xer === 'tsoins') { const t = (await tsoins()).slice(0, 8); return t.length ? '<ul class="ci-tsoins">' + t.map(x => '<li><small>' + esc(new Date(x.le || x.t || Date.now()).toLocaleDateString('fr-CH')) + '</small> ' + esc(x.d || x.genre) + '</li>').join('') + '</ul>' : '<p class="ci-vide">pas encore de tsoin</p>'; }
    if (xer === 'image') { const im = etat.images[face]; return im ? '<img class="ci-img" src="' + esc(im) + '" alt="">' : '<p class="ci-vide">touche l\'étiquette : choisir une image</p>'; }
    return '';
  }
  const nomXer = (x) => { const p = xersPossibles(liste()).find(y => y[0] === x); return p ? p[1] : x; };
  function rendreObjet(o) {
    if (o.type === 'ploxion') { const p = liste().find(x => x.id === o.ref) || { id: o.ref, nom: o.ref }; return '<span>' + icone(p) + '</span><b>' + esc(p.nom || p.id) + '</b>'; }
    if (o.type === 'image') return '<img src="' + esc(o.ref) + '" alt="">';
    if (o.type === 'glyphe') return glyphe(o.ref);
    return '<p>' + esc(o.ref) + '</p>';
  }
  function remplirPhoto(z, k) { const n = pages && pages.photo(k); z.textContent = ''; if (n) z.appendChild(n); else z.innerHTML = '<p class="ci-vide ci-prise">la page se photographie…</p>'; }
  async function peindre() {
    if (!vivant) return; etat = etat || await lire(); if (!vivant) return;
    const { w, h, d } = dims();
    const n = pages ? pages.n() : 0; place = pages ? facesDesPages(n, pages.i) : {};
    const pose = { fond: [w, h, 'translateZ(' + -d + 'px)'], gauche: [d, h, 'translateX(' + -w / 2 + 'px) translateZ(' + -d / 2 + 'px) rotateY(90deg)'], droite: [d, h, 'translateX(' + w / 2 + 'px) translateZ(' + -d / 2 + 'px) rotateY(-90deg)'],
      plafond: [w, d, 'translateY(' + -h / 2 + 'px) translateZ(' + -d / 2 + 'px) rotateX(-90deg)'], sol: [w, d, 'translateY(' + h / 2 + 'px) translateZ(' + -d / 2 + 'px) rotateX(90deg)'] };
    const faces = await Promise.all(FACES.map(async f => { const [fw, fh, t] = pose[f], st = ' style="width:' + fw + 'px;height:' + fh + 'px;transform:translate(-50%,-50%) ' + t + '"';
      if (place[f] != null) { const k = place[f];
        return '<div class="ci-face ci-page ci-' + f + '" data-ci-page="' + k + '"' + st + '><div class="ci-photo" data-ci-photo="' + k + '" style="width:' + w + 'px;height:' + h + 'px"></div>'
          + '<span class="ci-etiquette ci-et-page">' + (f === 'fond' ? '▣ ' : '▤ ') + esc(pages.nom(k)) + ' · ' + (k + 1) + '/' + n + '</span></div>'; }
      const x = (etat.faces[f] || 'trait');
      return '<div class="ci-face ci-' + f + (x === 'trait' ? ' ci-trait' : '') + '"' + st + '><button type="button" class="ci-etiquette" data-ci-face="' + f + '">' + esc(f) + ' · ' + esc(nomXer(x)) + ' ⌄</button>' + await contenu(f, x) + '</div>'; }));
    const objets = etat.objets.map(o => '<div class="ci-objet ci-' + o.type + '" data-ci-objet="' + esc(o.id) + '" style="transform:translate(-50%,-50%) translate3d(' + (o.x * w * 0.4).toFixed(0) + 'px,' + (o.y * h * 0.4).toFixed(0) + 'px,' + (-o.z * d).toFixed(0) + 'px)">' + rendreObjet(o) + '</div>');
    if (!vivant) return;
    // d'un seul coup (pas d'image entre deux) : le cube tourné revient droit avec ses nouvelles faces
    boite.style.transition = 'none'; boite.style.transform = '';
    boite.innerHTML = faces.join('') + objets.join('');
    for (const z of boite.querySelectorAll('[data-ci-photo]')) remplirPhoto(z, +z.getAttribute('data-ci-photo'));
  }
  /** la photo de la page k est prête : les faces qui la montrent la reprennent */
  function majPhoto(k) { for (const z of boite.querySelectorAll('[data-ci-photo="' + k + '"]')) remplirPhoto(z, k); }
  // le point de vue suit la main (perspective-origin), lissé, écrit seulement s'il change
  function boucle() {
    image = 0; if (!vivant) return;
    vue.x += (cible.x - vue.x) * 0.16; vue.y += (cible.y - vue.y) * 0.16;
    const po = (50 - vue.x * 38).toFixed(1) + '% ' + (50 - vue.y * 38).toFixed(1) + '%';
    if (po !== ecrit) { ecrit = po; salle.style.perspectiveOrigin = po; }
    if (Math.abs(cible.x - vue.x) + Math.abs(cible.y - vue.y) > 0.002) image = W.requestAnimationFrame(boucle);
  }
  const M = W.jOSNatif && W.jOSNatif.mouvement;
  if (M && M.ecouter) off = M.ecouter((e) => { const b = { x: +e.x || 0, y: +e.y || 0 }; if (!base) base = b; cible = { x: borne(b.x - base.x, -1, 1), y: borne(b.y - base.y, -1, 1) }; if (!image) image = W.requestAnimationFrame(boucle); }, { theme: false });

  // ---- le cube des pages : tourner, entrer ----
  /** la face f vient au fond (le cube tourne) ; sa page devient celle du fond */
  function tourner(f) {
    if (!pages || anim || !vivant) return false;
    const k = place[f]; if (f === 'fond' || k == null) { vibrer('fx-butee'); return false; }
    anim = true; vibrer('fx-face'); salle.classList.add('ci-tourne');
    const { d } = dims();
    boite.style.transformOrigin = '0 0 ' + (-d / 2) + 'px';
    boite.style.transition = 'transform .38s cubic-bezier(.3,.7,.2,1)';
    void boite.offsetWidth; boite.style.transform = ROTATION[f];
    W.setTimeout(async () => { pages.i = k; if (pages.tourne) pages.tourne(k); try { await peindre(); } finally { anim = false; salle.classList.remove('ci-tourne'); } }, 400);
    return true;
  }
  /** on entre dans la page du fond : les murs s'effacent, le fond vient à l'écran (il y est déjà dessiné tel quel) */
  function entrer() {
    if (!pages || anim || !vivant) return false;
    anim = true; vibrer('fx-arrivee');
    const { d } = dims();
    salle.classList.add('ci-entre'); boite.style.transformOrigin = '';
    boite.style.transition = 'transform .32s cubic-bezier(.5,0,.75,.4)';
    void boite.offsetWidth; boite.style.transform = 'translateZ(' + d + 'px)';
    W.setTimeout(() => { anim = false; if (vivant) pages.entrer(pages.i); }, 340);
    return true;
  }
  /** l'ouverture : on recule depuis la page (le fond part de l'écran, les murs apparaissent) */
  function reculer() {
    if (!pages) return; const { d } = dims();
    salle.classList.add('ci-entre'); boite.style.transition = 'none'; boite.style.transform = 'translateZ(' + d + 'px)';
    void boite.offsetWidth;
    boite.style.transition = 'transform .36s cubic-bezier(.2,.7,.2,1)'; boite.style.transform = ''; salle.classList.remove('ci-entre');
  }

  // ---- toucher : aller, changer de xer, peupler, déplacer ; glisser / toucher une page ----
  let g = null, dernierTap = { id: null, t: 0 }, s = null;
  hote.addEventListener('pointerdown', (e) => {
    const o = e.target.closest && e.target.closest('[data-ci-objet]');
    if (!o) { if (pages && !anim && e.target.closest && e.target.closest('.ci-salle') && !e.target.closest('button')) s = { x: e.clientX, y: e.clientY, face: e.target.closest('.ci-page') }; return; }
    g = { o, id: o.getAttribute('data-ci-objet'), x: e.clientX, y: e.clientY, bouge: false, long: W.setTimeout(() => { if (g && !g.bouge) { g.long = null; retirer(g.id); g = null; } }, 600) };
    try { hote.setPointerCapture(e.pointerId); } catch (er) { /* */ }
  });
  hote.addEventListener('pointermove', (e) => {
    if (!g) return; const dx = e.clientX - g.x, dy = e.clientY - g.y; if (!g.bouge && Math.hypot(dx, dy) > 8) { g.bouge = true; W.clearTimeout(g.long); }
    if (g.bouge) g.o.style.translate = dx + 'px ' + dy + 'px';
  });
  hote.addEventListener('pointercancel', () => { s = null; });
  hote.addEventListener('pointerup', (e) => {
    if (s) { const ss = s; s = null; const dx = e.clientX - ss.x, dy = e.clientY - ss.y;
      // glisser vers la gauche : la face de droite vient au fond (la page suivante) ; vers le bas : le plafond (+2)
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 40) return void tourner(Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 'droite' : 'gauche') : (dy > 0 ? 'plafond' : 'sol'));
      if (ss.face) { const f = FACES.find(x => ss.face.classList.contains('ci-' + x)); return void (f === 'fond' ? entrer() : tourner(f)); }
      return;
    }
    if (!g) return; const gg = g; g = null; W.clearTimeout(gg.long);
    const ob = etat.objets.find(x => x.id === gg.id); if (!ob) return;
    if (gg.bouge) { const { w, h, d } = dims(), k = 1 + ob.z * d / (w * 0.95); ob.x = borne(ob.x + (e.clientX - gg.x) * k / (w * 0.4), -1.2, 1.2); ob.y = borne(ob.y + (e.clientY - gg.y) * k / (h * 0.4), -1.2, 1.2); garder(etat); vibrer('fx-pose'); peindre(); return; }
    const t = Date.now();
    if (dernierTap.id === gg.id && t - dernierTap.t < 320) { ob.z = ob.z >= 0.8 ? 0.2 : ob.z >= 0.5 ? 0.85 : 0.55; garder(etat); vibrer('fx-tension'); peindre(); dernierTap = { id: null, t: 0 }; return; }
    dernierTap = { id: gg.id, t };
    if (ob.type === 'ploxion') W.setTimeout(() => { if (dernierTap.id === gg.id && dernierTap.t === t) { vibrer('fx-ouvrir', ob.ref); aller(ob.ref); } }, 330);
  });
  hote.addEventListener('click', async (e) => {
    const a = e.target.closest && e.target.closest('[data-ci-aller]'); if (a) { vibrer('fx-ouvrir', a.getAttribute('data-ci-aller')); return aller(a.getAttribute('data-ci-aller')); }
    const f = e.target.closest && e.target.closest('[data-ci-face]'); if (f) return choisirXer(f.getAttribute('data-ci-face'));
    if (e.target.closest && e.target.closest('[data-ci-plus]')) return peupler();
    if (e.target.closest && e.target.closest('[data-ci-sortir]')) { vibrer('fx-revenir'); return pages && pages.sortir(); }
    const c = e.target.closest && e.target.closest('[data-ci-choix]'); if (c) { e.stopPropagation(); const fn = feuilleChoix; fermerFeuille(); if (fn) await fn(c.getAttribute('data-ci-choix')); }
    if (e.target.classList && e.target.classList.contains('ci-feuille')) fermerFeuille();
  });
  let feuilleChoix = null;
  const fermerFeuille = () => { const x = hote.querySelector('.ci-feuille'); if (x) x.remove(); feuilleChoix = null; };
  function feuille(titre, choix, fn) {
    fermerFeuille(); feuilleChoix = fn;
    const el = D.createElement('div'); el.className = 'ci-feuille';
    el.innerHTML = '<div><p>' + esc(titre) + '</p>' + choix.map(([k, t]) => '<button type="button" data-ci-choix="' + esc(k) + '">' + esc(t) + '</button>').join('') + '</div>';
    hote.appendChild(el);
  }
  function choisirXer(face) {
    feuille('la face « ' + face + ' » montre…', xersPossibles(liste()), async (x) => {
      etat.faces[face] = x;
      if (x === 'image' && W.jOSNatif && W.jOSNatif.photo) { try { const ph = await W.jOSNatif.photo({ source: 'galerie' }); if (ph) etat.images[face] = ph; } catch (er) { /* */ } }
      garder(etat); vibrer('vue'); peindre();
    });
  }
  function peupler() {
    feuille('peupler l\'intérieur avec…', [['ploxion', 'un ploxion'], ['texte', 'un mot'], ['image', 'une image'], ['glyphe', 'un glyphe du xerboxion']], async (type) => {
      if (type === 'ploxion') return feuille('quel ploxion ?', liste().slice(0, 60).map(p => [p.id, p.nom || p.id]), (id) => ajouter('ploxion', id));
      if (type === 'glyphe') return feuille('quel glyphe ?', ['xerboxion', 'kion', 'koin', 'wormion', 'portion', 'cubion', 'spherion', 'bion', 'tsoin'].map(n => [n, n]), (n) => ajouter('glyphe', n));
      if (type === 'texte') { const t = W.prompt ? W.prompt('un mot dans le cube') : ''; if (t && t.trim()) ajouter('texte', t.trim().slice(0, 80)); return; }
      if (type === 'image' && W.jOSNatif && W.jOSNatif.photo) { try { const ph = await W.jOSNatif.photo({ source: 'galerie' }); if (ph) ajouter('image', ph); } catch (er) { /* */ } }
    });
  }
  async function ajouter(type, ref) { etat = etat || await lire(); const n = etat.objets.length; etat.objets.push({ id: 'o' + Date.now().toString(36) + n, type, ref, x: ((n % 3) - 1) * 0.5, y: ((Math.floor(n / 3) % 3) - 1) * 0.4, z: 0.5 }); garder(etat); vibrer('fx-pose'); return peindre(); }
  function retirer(id) { etat.objets = etat.objets.filter(o => o.id !== id); garder(etat); vibrer('fx-ferme'); peindre(); }
  const pret = peindre().then(() => { if (pages && vivant) reculer(); });
  return {
    pret, peindre, ajouter, tourner, entrer, majPhoto,
    choisir: async (f, x) => { etat = etat || await lire(); etat.faces[f] = x; garder(etat); return peindre(); },
    unmount() { vivant = false; if (image) W.cancelAnimationFrame(image); if (off) { try { off(); } catch (e) { /* */ } } hote.innerHTML = ''; },
  };
}

export function creerCubeInterieur({ W = globalThis.window, boxion = null, liste = () => [], vivants = () => [], tsoins = async () => [], aller = () => {}, vibrer = () => {}, icone = (p) => esc(p.icone || '▣'), glyphe = () => '' } = {}) {
  let etat = null;
  const lire = async () => { if (etat) return etat; const v = boxion ? await boxion.get('reglages', 'cube-interieur').catch(() => null) : null; etat = { faces: { ...DEFAUT.faces, ...((v && v.faces) || {}) }, objets: Array.isArray(v && v.objets) ? v.objets : [], images: (v && v.images) || {} }; return etat; };
  const garder = () => { if (boxion && etat) boxion.put('reglages', 'cube-interieur', etat).catch(() => {}); };
  const mount = (hote) => monterSalle(hote, { W, lire, garder, liste, vivants, tsoins, aller, vibrer, icone, glyphe });
  W.jOSApps = W.jOSApps || {};
  W.jOSApps['cube-interieur'] = { manifest: { id: 'cube-interieur', name: 'dans le cube', icon: '▣' }, mount };
  return { ploxion: { id: 'cube-interieur', nom: 'dans le cube', icone: '▣', interne: true, cat: 'meta', type: 'cubion' }, lire };
}
