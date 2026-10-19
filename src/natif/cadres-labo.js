// ⬡ LES CADRES DU LABO (0.53, RS-7 : « le wiki ne fonctionne toujours pas »). Plusieurs ploxions du labo ne sont qu'un <iframe> vers une
// page du SERVEUR (wiki : <iframe src="/wiki">, et ses semblables) : dans l'app, « /wiki » pointait sur capacitor://localhost/wiki — nulle
// part. L'adresse devient celle du labo. Et le labo n'accepte d'être encadré que par lui-même (CSP « frame-ancestors 'self'
// https://*.j0bot.ch » ; au 13.10 seule /app/yt ajoute « capacitor: ») : s'il refuse l'app, une carte remplace le grand blanc et ouvre la
// page dans le navigateur intégré. Le jour où le labo ajoute « capacitor: » à frame-ancestors, les pages s'affichent dans l'app, sans rien
// changer ici. La règle est lue une fois par préfixe (/wiki, /home…) par un HEAD natif.
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ACTIFS = /^\/(ploxions|vendor|assets|marketplace|public|index\.html)(\/|$)/;   // les fichiers de l'app elle-même

/** « frame-ancestors » d'une CSP autorise-t-il l'app (capacitor:, ou *) ? Sans frame-ancestors : oui */
export function cadreAutorise(csp) {
  const m = /frame-ancestors([^;]*)/i.exec(String(csp || '')); if (!m) return true;
  return /(^|\s)(capacitor:|capacitor:\/\/localhost|\*)(\s|$)/i.test(m[1]);
}

// (0.81) lecteur = { cheminWiki(p), remplacerCadre(f, p) } : un cadre vers le wiki n'est plus une carte, il se LIT dans l'app (src/app/wiki-natif.js)
export function creerCadresLabo({ W = globalThis.window, source = 'https://labo.j0bot.ch', tete = null, navigateur = (u) => W.open(u, '_blank'), lecteur = null, connecter = null } = {}) {
  const D = W.document, regles = new Map();
  const prefixe = (p) => '/' + (String(p).split(/[?#]/)[0].split('/')[1] || '');
  /** 'oui' | 'non' | 'injoignable' : le labo se laisse-t-il encadrer pour ce chemin ? */
  function permis(chemin) {
    const k = prefixe(chemin);
    if (!regles.has(k)) {
      regles.set(k, (tete ? tete(source + chemin) : Promise.reject(new Error('pas de HEAD')))
        .then(r => (r && r.status < 400 ? (cadreAutorise(r.entetes && r.entetes['content-security-policy']) ? 'oui' : 'non') : 'injoignable'))
        .catch(() => { W.setTimeout(() => regles.delete(k), 30000); return 'injoignable'; }));   // hors ligne : on réessaiera
    }
    return regles.get(k);
  }
  /** un src qui vise le SERVEUR (« /wiki », ou capacitor://localhost/wiki) → son chemin ; sinon null */
  function cheminServeur(src) {
    if (!src) return null; let p = null;
    if (/^\/(?!\/)/.test(src)) p = src;
    else if (!/^(about|data|blob|javascript):/i.test(src)) { try { const u = new W.URL(src, W.location.href); if (u.origin === W.location.origin && /^capacitor:|^https?:\/\/localhost/i.test(u.href)) p = u.pathname + u.search + u.hash; } catch (e) { /* */ } }
    if (!p || p === '/' || ACTIFS.test(p)) return null;
    return p;
  }
  function carte(f, p) {
    let c = f.__pxCarte;
    if (!c) { c = D.createElement('div'); c.className = 'px-cadre-labo'; f.__pxCarte = c; if (f.parentNode) f.parentNode.insertBefore(c, f); }
    c.innerHTML = '<span class="g">⬡</span><b>Cette page du labo ne s\'affiche pas encore dans l\'app</b><small>' + esc(p) + ' · le labo n\'accepte d\'être encadré que par lui-même</small><button type="button">ouvrir</button>';
    c.querySelector('button').onclick = () => navigateur(source + p);
    f.style.display = 'none';
  }
  function traiter(f) {
    if (!f || f.tagName !== 'IFRAME' || !f.closest || !f.closest('.px-hote')) return;   // seulement dans les ploxions
    const src = f.getAttribute('src');
    // 📖 (0.81) le wiki (« /wiki/x », ou déjà réécrit en https://labo.j0bot.ch/wiki/x par le shim) : lu dans l'app, sans charger les 3,6 Mo
    // de la page du labo dans un cadre qu'il refuse ; un nouveau src (ploxion.wiki.goto) fait naviguer le lecteur
    const w = lecteur && src && src !== 'about:blank' ? lecteur.cheminWiki(src) : null;
    if (w) { f.setAttribute('src', 'about:blank'); lecteur.remplacerCadre(f, w); return; }
    const p = cheminServeur(src); if (!p) return;
    // 🔑 (0.83) connecté tout seul : l'adresse avec un passe à usage unique (src/natif/connexion-labo.js) ; le temps de le demander, rien
    if (connecter) { f.setAttribute('src', 'about:blank'); connecter(p).catch(() => source + p).then((u) => { if (f.isConnected && f.getAttribute('src') === 'about:blank') f.setAttribute('src', u); }); }
    else f.setAttribute('src', source + p);
    permis(p).then(r => { if (r === 'non' && f.isConnected) carte(f, p); else if (f.__pxCarte && r === 'oui') { f.__pxCarte.remove(); f.__pxCarte = null; f.style.display = ''; } });
  }
  function balayer(n) { if (!n || n.nodeType !== 1) return; if (n.tagName === 'IFRAME') traiter(n); else if (n.querySelectorAll) for (const f of n.querySelectorAll('iframe')) traiter(f); }
  if (W.MutationObserver && D.body) new W.MutationObserver((l) => {
    for (const r of l) { if (r.type === 'attributes') traiter(r.target); else for (const n of r.addedNodes) balayer(n); }
  }).observe(D.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
  return { permis, cheminServeur, traiter };
}
