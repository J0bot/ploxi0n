// ▣ DANS LE CUBE (0.67). RS-7 (14.10) : « un ploxion avec un format différent : c'est comme si on était à l'intérieur d'un cube, que notre
// téléphone c'est une face du cube, et qu'on peut voir les autres faces à l'intérieur avec l'effet gyroscope ; il faut pouvoir peupler
// l'intérieur du cube avec ce qu'on veut, et changer les faces du cube vers d'autres xers ».
//   - L'ÉCRAN EST LA FACE OUVERTE : derrière lui, une salle en vraie 3D (CSS, preserve-3d) — le fond, les deux murs, le plafond, le sol.
//     Pencher l'iPhone déplace le point de vue (perspective-origin, relatif à la tenue du début) : on voit les murs comme par une fenêtre.
//   - CHAQUE FACE EST UN XER : l'accueil (tes ploxions), un koin (une famille), ce qui vit, tes tsoins, une image, le trait (vide).
//     Toucher l'étiquette d'une face : en choisir un autre. Toucher un ploxion sur une face : y aller.
//   - L'INTÉRIEUR SE PEUPLE : ＋ un ploxion, un mot, une image, un glyphe — ils flottent dans la salle, à une profondeur. Glisser :
//     les déplacer ; deux touchers : plus loin / plus près ; appui long : les retirer.
// boxion_local « reglages/cube-interieur » = { faces: { fond, gauche, droite, plafond, sol }, objets: [{ id, type, ref, x, y, z }] }.
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

export function creerCubeInterieur({ W = globalThis.window, boxion = null, liste = () => [], vivants = () => [], tsoins = async () => [], aller = () => {}, vibrer = () => {}, icone = (p) => esc(p.icone || '▣'), glyphe = () => '' } = {}) {
  const D = W.document;
  let etat = null;
  const lire = async () => { if (etat) return etat; const v = boxion ? await boxion.get('reglages', 'cube-interieur').catch(() => null) : null; etat = { faces: { ...DEFAUT.faces, ...((v && v.faces) || {}) }, objets: Array.isArray(v && v.objets) ? v.objets : [], images: (v && v.images) || {} }; return etat; };
  const garder = () => { if (boxion && etat) boxion.put('reglages', 'cube-interieur', etat).catch(() => {}); };

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

  function mount(hote) {
    let vivant = true, image = 0, base = null, vue = { x: 0, y: 0 }, cible = { x: 0, y: 0 }, ecrit = '', off = null;
    hote.innerHTML = '<div class="ci-salle"><div class="ci-boite"></div></div><div class="ci-barre"><button type="button" data-ci-plus>＋ peupler</button><small>penche l\'iPhone · touche une étiquette pour changer de xer</small></div>';
    const salle = hote.querySelector('.ci-salle'), boite = hote.querySelector('.ci-boite');
    const dims = () => { const r = salle.getBoundingClientRect(); const w = r.width || W.innerWidth || 390, h = r.height || W.innerHeight || 700; return { w, h, d: Math.round(w * 1.3) }; };
    async function peindre() {
      if (!vivant) return; await lire();
      const { w, h, d } = dims();
      salle.style.perspective = Math.round(w * 0.95) + 'px';
      const pose = { fond: [w, h, 'translateZ(' + -d + 'px)'], gauche: [d, h, 'translateX(' + -w / 2 + 'px) translateZ(' + -d / 2 + 'px) rotateY(90deg)'], droite: [d, h, 'translateX(' + w / 2 + 'px) translateZ(' + -d / 2 + 'px) rotateY(-90deg)'],
        plafond: [w, d, 'translateY(' + -h / 2 + 'px) translateZ(' + -d / 2 + 'px) rotateX(-90deg)'], sol: [w, d, 'translateY(' + h / 2 + 'px) translateZ(' + -d / 2 + 'px) rotateX(90deg)'] };
      const faces = await Promise.all(FACES.map(async f => { const [fw, fh, t] = pose[f], x = etat.faces[f];
        return '<div class="ci-face ci-' + f + (x === 'trait' ? ' ci-trait' : '') + '" style="width:' + fw + 'px;height:' + fh + 'px;transform:translate(-50%,-50%) ' + t + '"><button type="button" class="ci-etiquette" data-ci-face="' + f + '">' + esc(f) + ' · ' + esc(nomXer(x)) + ' ⌄</button>' + await contenu(f, x) + '</div>'; }));
      const objets = etat.objets.map(o => '<div class="ci-objet ci-' + o.type + '" data-ci-objet="' + esc(o.id) + '" style="transform:translate(-50%,-50%) translate3d(' + (o.x * w * 0.4).toFixed(0) + 'px,' + (o.y * h * 0.4).toFixed(0) + 'px,' + (-o.z * d).toFixed(0) + 'px)">' + rendreObjet(o) + '</div>');
      boite.innerHTML = faces.join('') + objets.join('');
    }
    function rendreObjet(o) {
      if (o.type === 'ploxion') { const p = liste().find(x => x.id === o.ref) || { id: o.ref, nom: o.ref }; return '<span>' + icone(p) + '</span><b>' + esc(p.nom || p.id) + '</b>'; }
      if (o.type === 'image') return '<img src="' + esc(o.ref) + '" alt="">';
      if (o.type === 'glyphe') return glyphe(o.ref);
      return '<p>' + esc(o.ref) + '</p>';
    }
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
    // ---- toucher : aller, changer de xer, peupler, déplacer ----
    let g = null, dernierTap = { id: null, t: 0 };
    hote.addEventListener('pointerdown', (e) => {
      const o = e.target.closest && e.target.closest('[data-ci-objet]'); if (!o) return;
      g = { o, id: o.getAttribute('data-ci-objet'), x: e.clientX, y: e.clientY, bouge: false, long: W.setTimeout(() => { if (g && !g.bouge) { g.long = null; retirer(g.id); g = null; } }, 600) };
      try { hote.setPointerCapture(e.pointerId); } catch (er) { /* */ }
    });
    hote.addEventListener('pointermove', (e) => {
      if (!g) return; const dx = e.clientX - g.x, dy = e.clientY - g.y; if (!g.bouge && Math.hypot(dx, dy) > 8) { g.bouge = true; W.clearTimeout(g.long); }
      if (g.bouge) g.o.style.translate = dx + 'px ' + dy + 'px';
    });
    hote.addEventListener('pointerup', (e) => {
      if (!g) return; const gg = g; g = null; W.clearTimeout(gg.long);
      const ob = etat.objets.find(x => x.id === gg.id); if (!ob) return;
      if (gg.bouge) { const { w, h, d } = dims(), k = 1 + ob.z * d / (w * 0.95); ob.x = borne(ob.x + (e.clientX - gg.x) * k / (w * 0.4), -1.2, 1.2); ob.y = borne(ob.y + (e.clientY - gg.y) * k / (h * 0.4), -1.2, 1.2); garder(); vibrer('fx-pose'); peindre(); return; }
      const t = Date.now();
      if (dernierTap.id === gg.id && t - dernierTap.t < 320) { ob.z = ob.z >= 0.8 ? 0.2 : ob.z >= 0.5 ? 0.85 : 0.55; garder(); vibrer('fx-tension'); peindre(); dernierTap = { id: null, t: 0 }; return; }
      dernierTap = { id: gg.id, t };
      if (ob.type === 'ploxion') W.setTimeout(() => { if (dernierTap.id === gg.id && dernierTap.t === t) { vibrer('fx-ouvrir', ob.ref); aller(ob.ref); } }, 330);
    });
    hote.addEventListener('click', async (e) => {
      const a = e.target.closest && e.target.closest('[data-ci-aller]'); if (a) { vibrer('fx-ouvrir', a.getAttribute('data-ci-aller')); return aller(a.getAttribute('data-ci-aller')); }
      const f = e.target.closest && e.target.closest('[data-ci-face]'); if (f) return choisirXer(f.getAttribute('data-ci-face'));
      if (e.target.closest && e.target.closest('[data-ci-plus]')) return peupler();
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
        garder(); vibrer('vue'); peindre();
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
    function ajouter(type, ref) { const n = etat.objets.length; etat.objets.push({ id: 'o' + Date.now().toString(36) + n, type, ref, x: ((n % 3) - 1) * 0.5, y: ((Math.floor(n / 3) % 3) - 1) * 0.4, z: 0.5 }); garder(); vibrer('fx-pose'); peindre(); }
    function retirer(id) { etat.objets = etat.objets.filter(o => o.id !== id); garder(); vibrer('fx-ferme'); peindre(); }
    peindre();
    return { unmount() { vivant = false; if (image) W.cancelAnimationFrame(image); if (off) { try { off(); } catch (e) { /* */ } } hote.innerHTML = ''; }, peindre, ajouter, choisir: (f, x) => { etat.faces[f] = x; garder(); return peindre(); } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps['cube-interieur'] = { manifest: { id: 'cube-interieur', name: 'dans le cube', icon: '▣' }, mount };
  return { ploxion: { id: 'cube-interieur', nom: 'dans le cube', icone: '▣', interne: true, cat: 'meta', type: 'cubion' }, lire };
}
