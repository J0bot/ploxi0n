// LES IMAGES DES PLOXIONS (RS-7 12.10 : « les images ne s'affichent jamais »). Un ploxion du labo écrit ses images en chemins du site
// (/img/…, /storage/…, /px/<id>/…, /coord/img/…) : sur labo.j0bot.ch, c'est le serveur ; dans l'app, c'est capacitor://localhost, où ces
// fichiers n'existent pas — et le shim ne reprend que fetch(), pas les <img>. Ici, à l'endroit où elles apparaissent :
//   <img src|srcset>, <source>, <video poster>, style="background-image:url(/…)" en chemin du site → https://labo.j0bot.ch/… ;
//   une image qui refuse quand même (une route qui exige le compte : 401/403/404 sans cookie) → récupérée AVEC le jeton (CapacitorHttp)
//   et posée en data: URL. Les fichiers de l'app (/assets, /ploxions, /bions, /vendor, /icons, /marketplace) ne bougent pas.
const LOCAL = /^\/(assets|ploxions|bions|vendor|icons|marketplace|fonts)\//;
// (12.10) les MÉDIAS DU BOXION (/fs/read, /chaoxion/read, /coord/img|piece) : une adresse SIGNÉE (signer(chemins) → { chemin: url }, labo
// AppMediaController) — une vidéo se lit en flux dans le lecteur natif d'iOS, une image sans détour ; gardée 90 min.
const SIGNABLE = /^\/(fs\/read\?path=|chaoxion\/read\?path=|coord\/img\/\d+$|coord\/piece\/\d+$)/;
export function installerImages({ W = globalThis.window, source = 'https://labo.j0bot.ch', avecJeton = null, signer = null } = {}) {
  const signees = new Map();   // chemin → { url, t }
  async function signee(chemin) {
    const c = signees.get(chemin); if (c && Date.now() - c.t < 90 * 60000) return c.url;
    const r = await signer([chemin]); const url = r && r[chemin]; if (url) signees.set(chemin, { url, t: Date.now() }); return url || null;
  }
  const D = W.document;
  const distant = (u) => typeof u === 'string' && u.startsWith('/') && !u.startsWith('//') && !LOCAL.test(u);
  const abs = (u) => source + u;
  const essaye = new WeakSet();
  function img(el) {
    // (12.10, RS-7 : « le wiki s'ouvre pas ») un ploxion qui ENCADRE une page du site (<iframe src="/wiki">, calendar, notes, player…) :
    // dans l'app, « /wiki » = capacitor://localhost/wiki, qui n'existe pas → une page blanche. Même règle que les images : le site.
    if (el.tagName === 'IFRAME') { const v = el.getAttribute('src'); if (distant(v)) el.setAttribute('src', abs(v)); return; }
    for (const a of ['src', 'poster']) {
      const v = el.getAttribute(a);
      if (!distant(v)) continue;
      if (signer && SIGNABLE.test(v)) {
        el.setAttribute('data-px-signe', v);
        const poser = (u) => { if (el.getAttribute('data-px-signe') !== v) return; el.setAttribute(a, u); if (el.tagName === 'SOURCE' && el.parentElement && el.parentElement.load) el.parentElement.load(); };
        signee(v).then(u => poser(u || abs(v))).catch(() => poser(abs(v)));
        if (el.tagName !== 'SOURCE') el.removeAttribute(a);   // pas de requête vouée à l'échec en attendant l'adresse signée
        continue;
      }
      el.setAttribute(a, abs(v));
    }
    const ss = el.getAttribute('srcset');
    if (ss && /(^|,)\s*\/[^/]/.test(ss)) el.setAttribute('srcset', ss.split(',').map(p => { const t = p.trim(); return distant(t) ? abs(t) : t; }).join(', '));
    const st = el.getAttribute('style');
    if (st && /url\(\s*['"]?\/[^/]/.test(st)) el.setAttribute('style', st.replace(/url\(\s*(['"]?)(\/[^/'")][^'")]*)\1\s*\)/g, (m, q, p) => LOCAL.test(p) ? m : 'url(' + q + abs(p) + q + ')'));
    if (el.tagName === 'IMG' && avecJeton && !essaye.has(el)) {
      el.addEventListener('error', async () => {
        if (essaye.has(el)) return; essaye.add(el);
        const s = el.getAttribute('src') || ''; if (!s.startsWith(source)) return;
        try { const d = await avecJeton(s); if (d) el.setAttribute('src', d); } catch (e) { /* introuvable pour de vrai */ }
      });
    }
  }
  function balayer(n) {
    if (!n || n.nodeType !== 1) return;
    if (/^(IMG|SOURCE|VIDEO|AUDIO|IFRAME)$/.test(n.tagName) || n.hasAttribute('style')) img(n);
    if (n.querySelectorAll) for (const x of n.querySelectorAll('img,source,video,audio,iframe,[style*="url("]')) img(x);
  }
  balayer(D.body);
  // (0.63) les styles écrits par l'app à chaque image (la fractale, les bords, le fantôme, le parallaxe) ne sont plus relus : un
  // style ne compte que s'il porte une url(…) ; un élément vu une fois par lot ; getPropertyValue lit une propriété sans tout sérialiser
  const APP = '.px-hote,.px-fx-icone,.px-fx-cible,.px-fx-voile,.px-fx-dessus,.px-fantome,.px-bord,.px-fond i,.px-pages,.px-plat,.px-scene,.px-fx-calque,.px-fx-curseur';
  new W.MutationObserver((l) => {
    const vus = new Set();
    for (const r of l) {
      if (r.type === 'childList') { for (const n of r.addedNodes) balayer(n); continue; }
      const t = r.target; if (t.nodeType !== 1 || vus.has(t)) continue; vus.add(t);
      if (r.attributeName === 'style') {
        if (t.matches && t.matches(APP)) continue;
        const st = t.style; if (!st || !/url\(/.test(st.getPropertyValue('background-image') + st.getPropertyValue('background'))) continue;
      }
      img(t);
    }
  }).observe(D.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'srcset', 'poster', 'style'] });
  return { abs, distant };
}
