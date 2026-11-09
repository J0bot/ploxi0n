// ▔ LA BARRE DU HAUT (RS-7 12.10 : « pour le plein écran complet sur iPhone, il faut qu'on ait nos propres infos en haut aussi, et qu'on
// puisse customiser ça »). En plein écran, iOS cache sa barre d'état mais garde la place (l'encoche, la Dynamic Island) : une bande vide.
// Elle devient NOTRE barre : à gauche et à droite de l'île (le centre reste libre), les éléments choisis, gravés en mono.
//   éléments : heure · date · batterie · réseau · ploxion (celui qui est ouvert) · ouverts (combien vivent) · tsoins (du jour) · compte · météo
//   composée dans boxion_local « reglages/barre-haut » = { gauche: [k…], droite: [k…] } ; appui long sur la barre (ou ⚙ › Apparence) → la
//   composer ; un toucher → remonter en haut du ploxion ouvert (comme la barre d'iOS).
// Aucune animation, aucune boucle d'images : une minuterie à la minute, en pause quand l'app n'est pas visible (le xer tourne sur un Pi 4).
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const ELEMENTS_HAUT = [['heure', '🕐 heure'], ['date', '📅 date'], ['batterie', '🔋 batterie'], ['reseau', '📶 réseau'], ['ploxion', '◇ ploxion ouvert'],
  ['ouverts', '⧉ ploxions ouverts'], ['tsoins', '⧗ tsoins du jour'], ['compte', '👤 compte'], ['meteo', '☁ météo (WeatherKit)']];
export const HAUT_DEFAUT = { gauche: ['heure', 'ploxion'], droite: ['tsoins', 'reseau', 'batterie'] };

// ▔ (0.63) L'IMMERSION (RS-7 13.10 : « y a toujours une bordure noire en haut qui remplit pas l'écran pour une vraie immersion, il faut
// remplir ça »). La bande noire, c'était CETTE barre : un aplat var(--bg) en z60, et peinte même cachée (son display:flex battait [hidden]),
// donc là aussi sans plein écran. Maintenant elle est transparente (un voile doux pour l'heure) et toujours posée : pleine (plein écran +
// notre barre) ou vide (.px-haut-vide : le voile seul sous la barre d'iOS, aucun toucher). Un ploxion prolonge SON fond dans la bande :
// la racine qu'il monte est lue (sa couleur, ou son dégradé) et posée sur son hôte (--px-hote-fond, --px-hote-image ; le CSS donne à
// l'hôte une bordure haute transparente de la hauteur de la bande, que son fond remplit) ; un fond clair passe l'encre en sombre (la nôtre,
// et celle d'iOS : SystemBars.setStyle LIGHT), un fond sombre la remet claire (DARK).
const MUETS = /^(STYLE|LINK|SCRIPT|TEMPLATE|META|NOSCRIPT|TITLE|BASE)$/;
/** « rgb(1, 2, 3) » / « rgba(1, 2, 3, .5) » / « rgb(1 2 3 / 50%) » → { r, g, b, a } (null sinon : transparent, un mot-clé…) */
export function rgba(s) {
  const m = /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+)(%?))?\s*\)/.exec(String(s || ''));
  if (!m) return null;
  return { r: +m[1], g: +m[2], b: +m[3], a: m[4] == null ? 1 : +m[4] / (m[5] ? 100 : 1) };
}
/** la luminance relative (WCAG) : 0 = noir, 1 = blanc */
export function luminance(c) {
  if (!c) return 0;
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}
/** au-dessus : l'encre fonce (avec le voile sombre de la bande, une encre claire reste lisible jusque-là) */
export const SEUIL_CLAIR = 0.35;
/** le fond d'un ploxion monté dans `hote` : sa racine (le premier élément qui se voit), ou l'enveloppe unique qu'elle est, sur 3 niveaux.
 *  → { couleur, image, clair } | null (transparent, une image url(), une iframe : on ne devine pas, la bande montre ce qui est derrière). */
export function fondDe(hote, W = globalThis.window) {
  const visibles = (e) => [...((e && e.children) || [])].filter(x => !MUETS.test(x.tagName));
  let e = visibles(hote)[0];
  for (let n = 0; e && n < 3; n++) {
    const cs = W.getComputedStyle(e), c = rgba(cs.backgroundColor), im = String(cs.backgroundImage || '');
    const plein = c && c.a > 0.95, degrade = /gradient\(/.test(im) && !/url\(/.test(im) ? im : null;
    if (plein || degrade) return { couleur: plein ? cs.backgroundColor : null, image: degrade, clair: luminance(plein ? c : rgba(degrade)) > SEUIL_CLAIR };
    if (/^(IFRAME|VIDEO|CANVAS|IMG|OBJECT|EMBED)$/.test(e.tagName)) return null;
    const enfants = visibles(e); if (enfants.length !== 1) return null;   // une vraie page (plusieurs blocs) : rien à prolonger
    e = enfants[0];
  }
  return null;
}
/** pose le fond lu sur l'hôte (la bande le prend) ; px-hote-clair si l'encre doit foncer */
export function teinter(hote, W = globalThis.window) {
  if (!hote || !hote.style) return null;
  let f = null; try { f = fondDe(hote, W); } catch (e) { f = null; }
  if (f && f.couleur) hote.style.setProperty('--px-hote-fond', f.couleur); else hote.style.removeProperty('--px-hote-fond');
  if (f && f.image) hote.style.setProperty('--px-hote-image', f.image); else hote.style.removeProperty('--px-hote-image');
  hote.classList.toggle('px-hote-clair', !!(f && f.clair));
  return f;
}
// l'encre de la barre d'état d'iOS (le piège du proxy, CLAUDE.md : le module est gardé dans une variable, le plugin appelé directement,
// jamais rendu par une fonction async ni une promesse)
let CORE = null;
function encreIos(clair, W) {
  const C = W.Capacitor; if (!(C && C.isNativePlatform && C.isNativePlatform())) return;
  const poser = () => { try { CORE.SystemBars.setStyle({ style: clair ? 'LIGHT' : 'DARK' }).catch(() => {}); } catch (e) { /* pas de SystemBars */ } };
  if (CORE) poser(); else import('@capacitor/core').then((m) => { CORE = m; poser(); }).catch(() => {});
}

// le symbole SF de WeatherKit (« cloud.sun.fill ») → un glyphe
const ciel = (s) => { s = String(s || ''); return /bolt/.test(s) ? '⚡' : /snow/.test(s) ? '❄' : /rain|drizzle/.test(s) ? '☂' : /fog|haze/.test(s) ? '≋' : /sun|clear/.test(s) && /cloud/.test(s) ? '⛅' : /cloud/.test(s) ? '☁' : /moon/.test(s) ? '☾' : /sun|clear/.test(s) ? '☀' : ''; };
export function creerBarreHaut({ W = globalThis.window, boxion, actif = () => true, courant = () => null, ouverts = () => 0, compte = null, vibrer = () => {}, encre = (clair) => encreIos(clair, W) }) {
  const D = W.document, nj = () => W.jOSNatif || {};
  let config = HAUT_DEFAUT, el = null, minuterie = null, encreMise = null, bandeT = 0;
  const etat = { batterie: null, reseau: null, tsoins: 0, meteo: null, meteoLe: 0 };
  const normaliser = (c) => {
    const ok = new Set(ELEMENTS_HAUT.map(x => x[0])), vus = new Set();
    const f = (l) => (Array.isArray(l) ? l : []).filter(k => ok.has(k) && !vus.has(k) && vus.add(k)).slice(0, 5);
    return c ? { gauche: f(c.gauche), droite: f(c.droite) } : { ...HAUT_DEFAUT };
  };
  const pret = boxion.get('reglages', 'barre-haut').then(c => { config = normaliser(c); }).catch(() => {});
  const utilise = (k) => config.gauche.includes(k) || config.droite.includes(k);
  const morceaux = {
    heure: () => new Date().toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' }),
    date: () => new Date().toLocaleDateString('fr-CH', { weekday: 'short', day: 'numeric', month: 'short' }),
    batterie: () => { const b = etat.batterie; if (!b || b.niveau == null || b.niveau < 0) return ''; const n = Math.round(b.niveau * 100); return '<span class="' + (n <= 20 && !b.enCharge ? 'bas' : '') + '">' + (b.enCharge ? '⚡' : '▮') + n + '%</span>'; },
    reseau: () => { const r = etat.reseau, en = W.navigator.onLine !== false; if (!en) return '<span class="bas">hors ligne</span>'; return r && r.type ? (r.type === 'wifi' ? 'wi-fi' : r.type === 'cellular' ? 'cell' : r.type) : 'en ligne'; },
    ploxion: () => { const c = courant(); return c ? esc(String(c).slice(0, 16)) : 'accueil'; },
    ouverts: () => { const n = ouverts(); return n ? '⧉' + n : ''; },
    tsoins: () => '⧗' + etat.tsoins,
    compte: () => { const e = compte && compte.etat(); return e && e.connecte ? esc(e.glyphe || '·') + ' ' + esc(String(e.nom || '').slice(0, 10)) : '—'; },
    meteo: () => etat.meteo ? esc(etat.meteo) : '',
  };
  const cote = (l) => l.map(k => { const h = morceaux[k](); return h ? '<span data-k="' + k + '">' + h + '</span>' : ''; }).join('');
  function peindre() {
    if (!el) return;
    const on = !!actif();
    // (0.63) jamais [hidden] : sans notre barre, la bande garde son voile (sous la barre d'iOS), vide et sans toucher
    el.hidden = false; el.classList.toggle('px-haut-vide', !on);
    D.documentElement.classList.toggle('px-haut-on', on);
    el.innerHTML = on ? '<span class="g">' + cote(config.gauche) + '</span><span class="ile"></span><span class="d">' + cote(config.droite) + '</span>' : '';
    bande(true);
  }
  /** ce qui est SOUS la bande : en télécommande, le ploxion visible monte jusqu'au bord (son fond, lu par teinter) ; ailleurs (l'accueil,
   *  la barre d'un ploxion en haut, une feuille ouverte) c'est sombre. → html.px-haut-clair, et l'encre d'iOS si elle change. */
  function bande(relire) {
    const h = D.documentElement, R = D.getElementById('ploxi0n');
    let clair = false;
    if (R && h.classList.contains('px-telecommande') && R.classList.contains('px-mode-ploxion') && !D.querySelector('.px-voile,.px-feuille')) {
      const hote = R.querySelector('.px-scene>.px-hote:not([hidden])');
      // pendant la fractale, aucun getComputedStyle (elle anime) : la teinte déjà lue suffit
      if (hote && (relire || !hote.hasAttribute('data-px-teint')) && !R.classList.contains('px-fx')) { teinter(hote, W); hote.setAttribute('data-px-teint', ''); }
      clair = !!(hote && hote.classList.contains('px-hote-clair'));
    }
    h.classList.toggle('px-haut-clair', clair);
    if (clair !== encreMise) { encreMise = clair; try { encre(clair); } catch (e) { /* */ } }
    return clair;
  }
  const bandeBientot = () => { if (bandeT) return; bandeT = W.setTimeout(() => { bandeT = 0; bande(false); }, 40); };
  /** suivre les hôtes : un ploxion qui se monte (sa racine arrive, ses styles parfois après), qui se montre ou se cache ; le mode de
   *  #ploxi0n, une feuille qui s'ouvre. Jamais le sous-arbre d'un ploxion (une horloge muterait chaque seconde). */
  function suivre() {
    const R = D.getElementById('ploxi0n'); if (!R || !W.MutationObserver) return null;
    const suivis = new WeakSet();
    const hote = (h) => { if (!h || suivis.has(h)) return; suivis.add(h); mo.observe(h, { childList: true, attributes: true, attributeFilter: ['hidden'] }); };
    const scene = (s) => { if (!s || suivis.has(s)) return; suivis.add(s); mo.observe(s, { childList: true }); for (const h of s.children) if (h.classList.contains('px-hote')) hote(h); };
    const mo = new W.MutationObserver((muts) => {
      for (const m of muts) {
        const t = m.target;
        if (m.type === 'childList') for (const n of m.addedNodes) if (n.nodeType === 1) { if (n.classList.contains('px-hote')) hote(n); else if (n.classList.contains('px-scene')) scene(n); }
        if (m.type === 'childList' && t.classList && t.classList.contains('px-hote')) {   // un ploxion vient de se monter : relu tout de suite, puis quand ses styles sont là
          t.removeAttribute('data-px-teint');
          W.setTimeout(() => { if (t.isConnected) { t.removeAttribute('data-px-teint'); bandeBientot(); } }, 900);
        }
      }
      bandeBientot();
    });
    mo.observe(R, { childList: true, attributes: true, attributeFilter: ['class'] });
    scene(R.querySelector('.px-scene'));
    return mo;
  }
  async function mesurer() {
    if (D.hidden) return;
    const n = nj();
    if (utilise('batterie') && n.batterie) etat.batterie = await n.batterie().catch(() => null);
    if (utilise('reseau') && n.reseau) etat.reseau = await n.reseau().catch(() => null);
    if (utilise('tsoins')) { const jour = new Date().toDateString(); etat.tsoins = (await boxion.lire('tsoins', { limite: 2000 }).catch(() => [])).filter(x => new Date(x.t).toDateString() === jour).length; }
    if (utilise('meteo') && n.meteo && Date.now() - etat.meteoLe > 30 * 60000) {
      etat.meteoLe = Date.now();
      try { const m = await n.meteo(); if (m) etat.meteo = ciel(m.symbole) + Math.round(m.temperature) + '°'; } catch (e) { etat.meteo = null; }
    }
    peindre();
  }
  function demarrer() {
    arreter(); mesurer();
    // à la minute pile, puis chaque minute
    minuterie = W.setTimeout(function tic() { mesurer(); minuterie = W.setTimeout(tic, 60000); }, 60000 - (Date.now() % 60000) + 50);
  }
  function arreter() { if (minuterie) W.clearTimeout(minuterie); minuterie = null; }

  function installer(racine) {
    el = D.createElement('div'); el.className = 'px-haut px-haut-vide'; el.setAttribute('role', 'status');   // vide jusqu'aux réglages lus
    (racine || D.body).appendChild(el);
    let t0 = 0, long = null;
    el.addEventListener('pointerdown', () => { if (el.classList.contains('px-haut-vide')) return; t0 = Date.now(); long = W.setTimeout(() => { long = null; vibrer('moyen'); composer(); }, 500); });
    el.addEventListener('pointerup', () => {
      if (!long) return; W.clearTimeout(long); long = null;
      if (Date.now() - t0 < 500) {   // remonter en haut de ce qui est ouvert
        const h = D.querySelector('.px-hote:not([hidden])') || D.querySelector('.px-accueil') || D.scrollingElement;
        for (const x of [h, ...(h ? h.querySelectorAll('*') : [])].slice(0, 400)) if (x && x.scrollTop > 0) { try { x.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { x.scrollTop = 0; } }
        vibrer('selection');
      }
    });
    el.addEventListener('pointercancel', () => { if (long) W.clearTimeout(long); long = null; });
    D.addEventListener('visibilitychange', () => { if (D.hidden) arreter(); else demarrer(); });
    W.addEventListener('online', peindre); W.addEventListener('offline', peindre);
    suivre(); bande(false);
    pret.then(demarrer);
  }

  /** la feuille pour composer la barre : chaque élément à gauche, à droite, ou nulle part */
  function composer() {
    const f = D.createElement('div'); f.className = 'px-voile';
    const place = (k) => config.gauche.includes(k) ? 'g' : config.droite.includes(k) ? 'd' : '';
    const dessiner = () => {
      f.innerHTML = '<div class="px-tiroir"><p class="px-ft">▔ la barre du haut</p><p class="px-sous" style="margin:0 2px 8px">À gauche et à droite de l\'île. Visible en plein écran complet (⚙ › Apparence).</p>'
        + ELEMENTS_HAUT.map(([k, n]) => '<div class="l"><span>' + esc(n) + '</span><span class="px-puces">'
          + [['g', '◧ gauche'], ['', '—'], ['d', 'droite ◨']].map(([p, t]) => '<button class="px-puce' + (place(k) === p ? ' on' : '') + '" data-k="' + k + '" data-p="' + p + '">' + t + '</button>').join('') + '</span></div>').join('')
        + '<button data-defaut>par défaut</button><button data-fermer>fermer</button></div>';
    };
    f.addEventListener('click', async (e) => {
      if (e.target === f || e.target.closest('[data-fermer]')) return f.remove();
      if (e.target.closest('[data-defaut]')) { await regler(HAUT_DEFAUT); return dessiner(); }
      const b = e.target.closest('[data-k][data-p]'); if (!b) return;
      const k = b.getAttribute('data-k'), p = b.getAttribute('data-p');
      const c = { gauche: config.gauche.filter(x => x !== k), droite: config.droite.filter(x => x !== k) };
      if (p === 'g') c.gauche.push(k); if (p === 'd') c.droite.push(k);
      await regler(c); vibrer('selection'); dessiner();
    });
    (D.getElementById('ploxi0n') || D.body).appendChild(f);
    dessiner();
  }
  async function regler(c) { config = normaliser(c); await boxion.put('reglages', 'barre-haut', config).catch(() => {}); mesurer(); return config; }
  return { installer, peindre, mesurer, composer, regler, config: () => normaliser(config), pret, bande, teinter: (h) => teinter(h, W) };
}
