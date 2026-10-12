// LES IMAGES DES PLOXIONS (RS-7 12.10 : « les images ne s'affichent jamais »). Un ploxion du labo écrit ses images en chemins du site
// (/img/…, /storage/…, /px/<id>/…, /coord/img/…) : sur xerboxion.org, c'est le serveur ; dans l'app, c'est capacitor://localhost, où ces
// fichiers n'existent pas — et le shim ne reprend que fetch(), pas les <img>. Ici, à l'endroit où elles apparaissent :
//   <img src|srcset>, <source>, <video poster>, style="background-image:url(/…)" en chemin du site → https://xerboxion.org/… ;
//   une image qui refuse quand même (une route qui exige le compte : 401/403/404 sans cookie) → récupérée AVEC le jeton (CapacitorHttp)
//   et posée en data: URL. Les fichiers de l'app (/assets, /ploxions, /bions, /vendor, /icons, /marketplace) ne bougent pas.
const LOCAL = /^\/(assets|ploxions|bions|vendor|icons|marketplace|fonts)\//;
// (12.10) les MÉDIAS DU BOXION (/fs/read, /chaoxion/read, /coord/img|piece) : une adresse SIGNÉE (signer(chemins) → { chemin: url }, labo
// AppMediaController) — une vidéo se lit en flux dans le lecteur natif d'iOS, une image sans détour ; gardée 90 min.
const SIGNABLE = /^\/(fs\/read\?path=|chaoxion\/read\?path=|coord\/img\/\d+$|coord\/piece\/\d+$)/;
export function installerImages({ W = globalThis.window, source = 'https://xerboxion.org', avecJeton = null, signer = null } = {}) {
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
    if (/^(IMG|SOURCE|VIDEO|AUDIO)$/.test(n.tagName) || n.hasAttribute('style')) img(n);
    if (n.querySelectorAll) for (const x of n.querySelectorAll('img,source,video,audio,[style*="url("]')) img(x);
  }
  balayer(D.body);
  new W.MutationObserver((l) => {
    for (const r of l) {
      if (r.type === 'childList') for (const n of r.addedNodes) balayer(n);
      else if (r.target.nodeType === 1) img(r.target);
    }
  }).observe(D.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'srcset', 'poster', 'style'] });
  return { abs, distant };
}
