// 📖 LE WIKI NATIF (0.81). RS-7 (19.10) : « il y a pas mal de ploxions, genre le wiki, qui ne fonctionnent pas encore sur ploxi0n ».
// Le ploxion wiki du labo n'est qu'un <iframe src="/wiki">, et le labo refuse d'être encadré par l'app (CSP frame-ancestors 'self'
// https://*.j0bot.ch) : depuis la 0.53, une carte « ouvrir » à la place. Maintenant le wiki se LIT dans l'app :
//   la page du terme (…/wiki/<slug>) est lue en HTTP natif (sans CORS, sans le jeton : elle est publique), et on n'en garde que l'article
//   (.wiki-app : ~30 Ko sur les 3,6 Mo de la page, la coquille du labo en entier) — nettoyé (ni script, ni formulaire, ni on…=), avec les
//   styles de l'app ; un lien vers un autre terme reste ICI (← pour revenir), tout autre lien s'ouvre dans le navigateur intégré ;
//   chaque page lue est gardée (boxion_local « wiki/<chemin> ») : le wiki se relit hors ligne, et s'ouvre tout de suite.
// Le ploxion du labo reste le même : cadres-labo.js remplace son iframe /wiki… par ce lecteur (et suit ploxion.wiki.goto, qui change le src).
// 💡 pour le labo : une page /wiki/<slug>?fragment=1 qui ne rend que l'article diviserait le poids par cent (le lecteur la demande déjà).
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const RETIRER = 'script,style,link,meta,iframe,object,embed,form,input,button,select,textarea,noscript,template,.wiki-tabs,.wiki-search';
const CHEMIN_WIKI = /^\/wiki(?:\/(?:paper\/)?[a-z0-9][a-z0-9-]{0,80}|\/papiers|\/aleatoire)?\/?$/;

/** un chemin du wiki (« /wiki », « /wiki/tsoin », « /wiki/paper/cubion »…) ou null */
export function cheminWiki(href, source = 'https://labo.j0bot.ch') {
  let u; try { u = new URL(String(href || ''), source + '/'); } catch (e) { return null; }
  if (u.origin !== source && !/^(capacitor:|https?:\/\/localhost)/i.test(u.href)) return null;
  const p = u.pathname.replace(/\/+$/, '') || '/';
  return CHEMIN_WIKI.test(p) ? p : null;
}
/** « Ion de la tsoin » → « ion-de-la-tsoin » (le slug du labo) */
export const slugifier = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

/** la page HTML du labo → { titre, corps (HTML nettoyé), chemin (canonique) } ou null */
export function extraireArticle(html, { W = globalThis.window, source = 'https://labo.j0bot.ch' } = {}) {
  const doc = new W.DOMParser().parseFromString(String(html || ''), 'text/html');
  const a = doc.querySelector('.wiki-app'); if (!a) return null;
  const canon = doc.querySelector('link[rel="canonical"]');
  for (const n of a.querySelectorAll(RETIRER)) n.remove();
  for (const el of a.querySelectorAll('*')) {
    for (const at of [...el.attributes]) {
      const k = at.name.toLowerCase(), v = at.value;
      if (k.startsWith('on') || k === 'style' || k === 'srcset' || (/^(href|src|xlink:href|action|formaction)$/.test(k) && /^\s*(javascript|data|vbscript):/i.test(v) && !(k === 'src' && /^\s*data:image\//i.test(v)))) el.removeAttribute(at.name);
    }
    if (el.tagName === 'A') {
      const h = el.getAttribute('href') || '', c = cheminWiki(h, source);
      if (c) { el.setAttribute('data-wiki', c); el.setAttribute('href', '#'); }
      else if (h && !h.startsWith('#')) { try { el.setAttribute('data-externe', new URL(h, source + '/').href); el.setAttribute('href', '#'); } catch (e) { el.removeAttribute('href'); } }
    }
    if (el.tagName === 'IMG') { const s = el.getAttribute('src'); if (s) { try { el.setAttribute('src', new URL(s, source + '/').href); } catch (e) { el.remove(); } } el.setAttribute('loading', 'lazy'); }
  }
  const h1 = a.querySelector('h1');
  return { titre: h1 ? h1.textContent.trim().replace(/\s+/g, ' ').slice(0, 120) : 'wiki', corps: a.innerHTML, chemin: canon ? cheminWiki(canon.getAttribute('href'), source) : null };
}

/** http.get(url, { headers }) → { status, texte } (HTTP natif) ; boxion : le cache ; navigateur(url) : un lien hors du wiki */
export function creerWikiNatif({ W = globalThis.window, source = 'https://labo.j0bot.ch', http, boxion = null, navigateur = (u) => W.open(u, '_blank'), vibrer = () => {}, enLigne = () => W.navigator.onLine !== false, frais = 864e5 }) {
  const D = W.document;
  async function lire(chemin, { forcer = false } = {}) {
    const k = chemin, cache = boxion ? await boxion.get('wiki', k).catch(() => null) : null;
    if (cache && !forcer && (Date.now() - (cache.le || 0) < frais || !enLigne())) return { ...cache, cache: true };
    if (!enLigne()) { if (cache) return { ...cache, cache: true }; throw new Error('hors ligne, et cette page n\'a pas encore été lue ici'); }
    let r;
    try { r = await http.get(source + chemin + (chemin.includes('?') ? '&' : '?') + 'fragment=1', { headers: { Accept: 'text/html' } }); }
    catch (e) { if (cache) return { ...cache, cache: true }; throw e; }
    if (r.status === 404) throw new Error('ce terme n\'existe pas (encore) au wiki');
    if (r.status !== 200) { if (cache) return { ...cache, cache: true }; throw new Error('le labo répond ' + r.status); }
    const a = extraireArticle(r.texte, { W, source }); if (!a) throw new Error('page du wiki illisible');
    const doc = { titre: a.titre, corps: a.corps, chemin: a.chemin || chemin, le: Date.now() };
    if (boxion && chemin !== '/wiki/aleatoire') { await boxion.put('wiki', doc.chemin, doc).catch(() => {}); if (doc.chemin !== chemin) await boxion.put('wiki', chemin, doc).catch(() => {}); }
    return doc;
  }
  /** le lecteur dans un hôte ; rend { aller(chemin), unmount() } */
  function monter(hote, chemin = '/wiki') {
    let pile = [], vivant = true, ici = null;
    const el = D.createElement('div'); el.className = 'px-wiki'; hote.appendChild(el);
    el.innerHTML = '<div class="px-wiki-b"><button type="button" data-w="retour" aria-label="page précédente" disabled>←</button><input type="search" data-w-q placeholder="un terme (ion, tsoin, koin…)" enterkeyhint="go" autocomplete="off"><button type="button" data-w="lexique" aria-label="le lexique">≡</button><button type="button" data-w="hasard" aria-label="un terme au hasard">⚄</button><button type="button" data-w="labo" aria-label="ouvrir sur le labo">↗</button></div><div class="px-wiki-p" data-w-p></div>';
    const p = el.querySelector('[data-w-p]'), retour = el.querySelector('[data-w="retour"]');
    async function aller(c, { empiler = true, forcer = false } = {}) {
      if (!c) return;
      if (empiler && ici && ici !== c) pile.push(ici);
      ici = c; retour.disabled = !pile.length;
      p.innerHTML = '<p class="px-wiki-m">⏳ ' + esc(c) + '…</p>';
      try {
        const d = await lire(c, { forcer }); if (!vivant || ici !== c) return;
        if (d.chemin && d.chemin !== c && c === '/wiki/aleatoire') ici = d.chemin;
        p.innerHTML = '<div class="px-wiki-a">' + d.corps + '</div>' + (d.cache ? '<p class="px-wiki-m">gardée le ' + esc(new Date(d.le).toLocaleDateString('fr-CH')) + (enLigne() ? ' · <a href="#" data-w-frais>↻ relire</a>' : ' · hors ligne') + '</p>' : '');
        p.scrollTop = 0;
      } catch (er) { if (vivant && ici === c) p.innerHTML = '<p class="px-wiki-m">⚠ ' + esc(er.message || er) + '</p><p class="px-wiki-m"><a href="#" data-externe="' + esc(source + c) + '">↗ ouvrir sur le labo</a></p>'; }
    }
    el.addEventListener('click', (e) => {
      const a = e.target.closest('a,button'); if (!a || !el.contains(a)) return;
      if (a.hasAttribute('data-wiki')) { e.preventDefault(); vibrer('selection'); aller(a.getAttribute('data-wiki')); return; }
      if (a.hasAttribute('data-externe')) { e.preventDefault(); navigateur(a.getAttribute('data-externe')); return; }
      if (a.hasAttribute('data-w-frais')) { e.preventDefault(); aller(ici, { empiler: false, forcer: true }); return; }
      // le sommaire (#définition) : défiler dans l'article — jamais toucher location.hash, le routeur de l'app y vit
      const h = a.getAttribute('href'); if (h && h.length > 1 && h[0] === '#') { e.preventDefault(); let id = h.slice(1); try { id = decodeURIComponent(id); } catch (er) { /* */ } const cible = [...p.querySelectorAll('[id]')].find(x => x.id === id); if (cible) p.scrollTop += cible.getBoundingClientRect().top - p.getBoundingClientRect().top - 8; return; }
      const w = a.getAttribute('data-w');
      if (w === 'retour' && pile.length) { vibrer('selection'); aller(pile.pop(), { empiler: false }); retour.disabled = !pile.length; }
      if (w === 'lexique') aller('/wiki');
      if (w === 'hasard') aller('/wiki/aleatoire', { forcer: true });
      if (w === 'labo') navigateur(source + (ici || '/wiki'));
    });
    el.querySelector('[data-w-q]').addEventListener('keydown', (e) => { if (e.key !== 'Enter') return; const s = slugifier(e.target.value); if (s) { e.target.blur(); aller('/wiki/' + s); } });
    aller(chemin, { empiler: false });
    return { el, aller: (c) => aller(c), unmount() { vivant = false; el.remove(); } };
  }
  /** cadres-labo : un <iframe> vers le wiki → le lecteur à sa place (une fois ; un nouveau src le fait naviguer) */
  function remplacerCadre(f, chemin) {
    if (f.__pxWiki) { f.__pxWiki.aller(chemin); return true; }
    const h = f.parentNode; if (!h) return false;
    f.style.display = 'none'; f.setAttribute('data-px-wiki', chemin);
    const w = D.createElement('div'); w.className = 'px-wiki-hote'; h.insertBefore(w, f);
    f.__pxWiki = monter(w, chemin);
    return true;
  }
  return { lire, monter, remplacerCadre, cheminWiki: (h) => cheminWiki(h, source) };
}
