// ◺ LE TROU ENTRE LES DEUX KOINS DU BAS, EN MODE XERBOXION (20.11.2026). RS-7, coord #2120 : « intégrer tout le xer des koins dans le mode
// xerboxion de ploxi0n, pck chill-tekk c'est pour chiller, xerboxion pour essayer d'arriver aussi loin que moi ».
// Le trou est toujours comblé, avec le dessin du bion jOSTsoins du labo (trou: true | 'koins', le Figma trikion écran 157) : un trapèze
// renversé (en haut toute la largeur, en bas l'espace entre les deux koins), des trapèzes emboîtés (le wormion adapté à la forme du trou),
// la hauteur des koins.
//   - le ploxion ouvert pose déjà sa bande dans le trou (jOSTsoins, coord) : la sienne fait foi, rien de plus. Elle ne se montre que koins
//     fermés et à leur taille : ouverts, les koins grandissent (transform) et jOSTsoins, qui mesure le koin, redessinerait un trou géant ;
//   - sinon, la bande AUTO du ploxion ouvert (jOSXerkoin.pour : les actions de son describe() dans les triangles) ; un toucher sur un
//     triangle lance l'action (jOSXerkoin.lancer) ; ailleurs dans le trou, les koins s'ouvrent ;
//   - à l'accueil : le wormion adapté seul ; un toucher ouvre les koins.
// Les koins ouverts passent par-dessus (le trou s'efface). La bande reste au-dessus de l'indicateur d'accueil de l'iPhone. Un ploxion qui
// reçoit la bande auto garde la place du trou (html.px-trou-bande, --px-trou). Aucun requestAnimationFrame (le Pi) : il se redessine quand le
// ploxion change, quand la taille change, quand les koins s'ouvrent, quand la bande d'un ploxion arrive ou s'en va (un MutationObserver).
const S2 = Math.SQRT2;
const f1 = (n) => n.toFixed(1);

/** le dessin de jOSTsoins (dessinerTrou) : K = la hauteur des koins, l = la largeur de l'écran ; les trapèzes emboîtés à 1,5 · 0,2 K · 0,34 K */
export function dessinTrou(K, l) {
  const tr = (t) => [[t + t * S2, t], [l - t - t * S2, t], [l - (K - t) - t * S2, K - t], [K - t + t * S2, K - t]].map((q) => f1(q[0]) + ',' + f1(q[1])).join(' ');
  return '<svg viewBox="0 0 ' + l + ' ' + K + '" preserveAspectRatio="none" aria-hidden="true"><polygon class="o" points="' + tr(1.5) + '"/><polygon class="i" points="' + tr(K * 0.2) + '"/>'
    + '<polygon class="i" points="' + tr(K * 0.34) + '"/><circle class="pt" cx="' + f1(l / 2) + '" cy="' + f1(K * 0.66) + '" r="5"/></svg>';
}
/** la découpe du trou (le trapèze renversé entre les deux triangles des koins) */
export const decoupe = (K) => 'polygon(0 0,100% 0,calc(100% - ' + K + 'px) 100%,' + K + 'px 100%)';
/** où poser la bande : au-dessus de l'indicateur d'accueil (sb = env(safe-area-inset-bottom)), toujours dans le trou (au moins 30 px de koin) */
export const basBande = (K, sb = 0, kb = 0) => Math.max(4, Math.min(Math.round(sb) - 6 - kb, K - 40));
/** la taille d'un koin de la bande : comme jOSTsoins (au plus 60, la largeur entre les koins), et sous le haut du trou */
export const tailleBande = (l, K, n, bas = 4) => Math.max(30, Math.min(60, Math.floor((l - 2 * K - 6) / Math.max(1, n)), K - bas - 10));

/**
 * actif() : le mode xerboxion, koins posés ; courant() : l'id du ploxion ouvert (null à l'accueil) ; xerkoin() : Promise du bion jOSXerkoin ;
 * ouvrirKoins() ; glyphes() : les réglages de l'alien (src/app/koins.js glyphesAlien) ou null ; surNav() : le ploxion a changé
 */
export function creerTrou({ W = globalThis.window, actif = () => false, courant = () => null, xerkoin = null, ouvrirKoins = () => {}, vibrer = () => {}, glyphes = () => null, surNav = null, attente = 450 }) {
  const D = W.document, H = D.documentElement;
  let el = null, mo = null, minR = 0, minA = 0, geo = null, dessin = '', sb = 0, idB = null, bandeX = null, sigB = '', dernier, branche = false;
  const propres = new Set();   // les ploxions qui posent leur propre bande dans le trou (jOSTsoins) : jamais de bande auto pour eux

  function safeBas() {   // env(safe-area-inset-bottom) en px (0 sans indicateur d'accueil, et dans jsdom) ; la sonde vit dans le trou (body n'en voit rien)
    try { const d = D.createElement('i'); d.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;padding-bottom:env(safe-area-inset-bottom,0px)'; el.appendChild(d); const v = parseFloat(W.getComputedStyle(d).paddingBottom) || 0; d.remove(); return v; } catch (e) { return 0; }
  }
  function creer() {
    el = D.createElement('div'); el.className = 'px-trou'; el.setAttribute('role', 'button'); el.setAttribute('aria-label', 'le trou entre les koins : touche pour ouvrir les koins');
    el.innerHTML = '<div class="px-trou-f"></div><div class="px-trou-b"></div>';
    el.addEventListener('click', (e) => {
      const a = e.target && e.target.closest ? e.target.closest('[data-a]') : null;
      if (a && bandeX && el.contains(a)) { const act = bandeX.acts[+a.getAttribute('data-a')]; if (act) { vibrer('selection'); try { bandeX.X.lancer(bandeX.id, act); } catch (er) { /* */ } return; } }
      ouvrirKoins();
    });
    D.body.appendChild(el);
  }
  /** la place que le ploxion laisse en bas : de la fin de sa scène (avec ou sans la marge de l'indicateur d'accueil) jusqu'au haut du trou */
  function place() {
    const sc = D.querySelector('#ploxi0n .px-scene'), H0 = W.innerHeight || H.clientHeight || 0, b = sc ? sc.getBoundingClientRect().bottom : H0;
    return Math.max(0, Math.round(b - (H0 - geo.K - geo.kb)));
  }
  function viderBande() { bandeX = null; sigB = ''; if (el) { el.removeAttribute('data-bande'); const b = el.querySelector('.px-trou-b'); if (b) b.innerHTML = ''; } }
  function sansPlace() { H.classList.remove('px-trou-bande'); H.style.removeProperty('--px-trou'); }
  function cacher() {
    if (minA) { W.clearTimeout(minA); minA = 0; }
    idB = null; viderBande(); sansPlace(); if (el) el.hidden = true;
  }
  function peindreBande() {
    if (!el || !bandeX || !geo) return;
    const t = tailleBande(geo.l, geo.K, bandeX.cells.length, geo.bas), sig = t + '|' + geo.bas + '|' + bandeX.cells.join() + '|' + bandeX.acts.length;
    if (sig === sigB) return; sigB = sig;
    const b = el.querySelector('.px-trou-b'); b.style.bottom = geo.bas + 'px';
    b.innerHTML = bandeX.X.bande(bandeX.cells, { t, acts: bandeX.acts.map((a) => (a ? { label: String(a.label || '') } : null)) });
    el.setAttribute('data-bande', '');
  }
  function chargerBande(id) {
    if (!xerkoin) return;
    Promise.resolve().then(() => xerkoin()).then((X) => {
      if (!X || !X.pour || !X.bande || idB !== id || !el) return;
      const x = X.pour(id) || {};
      bandeX = { X, id, cells: Array.isArray(x.cells) && x.cells.length ? x.cells : ['wormion', 'portion'], acts: Array.isArray(x.acts) ? x.acts : [] };
      peindreBande();
    }).catch(() => { /* hors ligne : le trou reste le wormion adapté */ });
  }
  /** le trou à sa place, à la taille des koins (sans dessiner de nouveau ce qui n'a pas changé) */
  function poser(K, kb, l, ouvert) {
    if (!el) creer();
    el.hidden = false;
    const d = K + '/' + kb + '/' + l;
    if (d !== dessin) {
      dessin = d; sb = safeBas();   // l'indicateur d'accueil : relu quand la taille change (la rotation)
      el.style.bottom = kb + 'px'; el.style.height = K + 'px';
      el.style.setProperty('clip-path', decoupe(K)); el.style.setProperty('-webkit-clip-path', decoupe(K));
      el.querySelector('.px-trou-f').innerHTML = dessinTrou(K, l);
    }
    geo = { K, kb, l, bas: basBande(K, sb, kb) };
    const g = glyphes();   // les traits réglés dans l'alien (les mêmes contours partout)
    el.style.setProperty('--px-trait', String(g ? g.trait : 2.2)); el.style.setProperty('--px-trait-i', String(g ? g.traitI : 1.4));
    el.toggleAttribute('data-ouvert', !!ouvert);
  }
  function maj() {
    if (!actif()) { arreter(); return; }
    brancher();
    const koin = D.querySelector('.px-koins-r .px-koin-gauche');
    if (!koin) { cacher(); return; }
    const K = Math.round(Math.min(koin.offsetWidth, koin.offsetHeight));   // la taille en page : la transformation de l'ouverture n'y compte pas
    if (!K) { cacher(); return; }   // pas dessiné
    const racine = koin.closest('.px-koins-r');
    const ouvert = racine.classList.contains('px-koins-ouverts') || racine.classList.contains('px-koins-glisse') || koin.getAttribute('data-etape') === '1';
    const r = koin.getBoundingClientRect(), H0 = W.innerHeight || H.clientHeight || 0, kb = r.height > 0 ? Math.max(0, Math.round(H0 - r.bottom)) : 0;
    const l = W.innerWidth || H.clientWidth || 390;
    const id = courant() || null;
    if (id !== dernier) { dernier = id; if (surNav) { try { surNav(id); } catch (e) { /* */ } } }
    // la bande d'un ploxion (jOSTsoins) dans le trou : elle fait foi, koins fermés et à leur taille ; sinon elle attend, cachée
    let siennes = 0, bonne = false;
    for (const t of D.querySelectorAll('.tsk-trou')) {
      if (t.style.display === 'none') continue;   // un ploxion passé derrière (le routeur cache ce qu'il accroche)
      siennes++;
      const h = t.offsetHeight || parseFloat(t.style.height) || 0, ok = !ouvert && Math.abs(h - K) <= 1;
      if (ok) bonne = true;
      t.toggleAttribute('data-px-attend', !ok);
    }
    if (siennes && id) propres.add(id);
    if (bonne) { cacher(); return; }
    poser(K, kb, l, ouvert);
    const veut = id && !siennes && !propres.has(id) ? id : null;   // le ploxion qui reçoit la bande auto
    if (veut !== idB) {
      idB = veut; viderBande(); sansPlace(); if (minA) { W.clearTimeout(minA); minA = 0; }
      // un temps de grâce : la bande d'un ploxion (jOSTsoins) arrive ~300 ms après son ouverture ; pas de bande auto qui clignote avant elle
      if (veut) minA = W.setTimeout(() => { minA = 0; if (idB !== veut || !el) return; H.classList.add('px-trou-bande'); H.style.setProperty('--px-trou', place() + 'px'); chargerBande(veut); }, attente);
    } else if (veut) {
      if (H.classList.contains('px-trou-bande')) H.style.setProperty('--px-trou', place() + 'px');
      peindreBande();
    }
  }
  function surMutations(l) {
    // les mutations faites par le trou lui-même (son insertion dans body) ne comptent pas
    if (l.every((m) => m.type === 'childList' && [...m.addedNodes, ...m.removedNodes].every((n) => n === el))) return;
    maj();
  }
  /** observer : les enfants de body (la bande d'un ploxion qui arrive, les koins reposés), la classe de #ploxi0n (un ploxion, l'accueil),
   *  la classe des koins (ouverts, glissés), le style de chaque trou de ploxion (jOSTsoins le redessine) */
  function brancher() {
    if (!W.MutationObserver) return;
    if (!mo) mo = new W.MutationObserver(surMutations);
    mo.observe(D.body, { childList: true });
    const app = D.getElementById('ploxi0n'); if (app) mo.observe(app, { attributes: true, attributeFilter: ['class'] });
    const racine = D.querySelector('.px-koins-r'); if (racine) mo.observe(racine, { attributes: true, attributeFilter: ['class'] });
    for (const t of D.querySelectorAll('.tsk-trou')) mo.observe(t, { attributes: true, attributeFilter: ['style'] });
    if (!branche) { branche = true; W.addEventListener('resize', surTaille); }
  }
  function surTaille() { if (minR) W.clearTimeout(minR); minR = W.setTimeout(() => { minR = 0; maj(); }, 120); }
  function arreter() {
    if (mo) { mo.disconnect(); mo = null; }
    if (branche) { branche = false; W.removeEventListener('resize', surTaille); }
    if (minR) { W.clearTimeout(minR); minR = 0; }
    cacher();
    if (el) { el.remove(); el = null; dessin = ''; geo = null; }
    for (const t of D.querySelectorAll('.tsk-trou[data-px-attend]')) t.removeAttribute('data-px-attend');
    dernier = undefined;
  }
  return {
    maj, arreter,
    etat: () => ({ visible: !!(el && !el.hidden), bande: !!bandeX, id: idB, ouvert: !!(el && el.hasAttribute('data-ouvert')), place: H.classList.contains('px-trou-bande') }),
    el: () => el,
  };
}
