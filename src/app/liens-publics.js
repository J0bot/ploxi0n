// ↗ LES LIENS QUI SORTENT DE L'APP (0.76). RS-7 (17.10) : « il y a des gros zbeul avec les invitations ».
// La cause : 25 ploxions du labo (invite, invitation, social, curseur…) fabriquent leurs liens avec location.origin. Dans l'app, c'est
// « capacitor://localhost » : une invitation envoyée depuis l'iPhone donnait un lien que personne ne pouvait ouvrir (ni Safari, ni un QR).
// Réparé ICI, une fois pour tous les ploxions, sans en réécrire un seul : à chaque sortie (la feuille de partage, le presse-papiers, le QR de
// jOSQR, le champ qui montre le lien), un lien de l'app devient le lien public du labo —
//   …/local?px=<id>&… et …/?px=<id>&…  →  https://labo.j0bot.ch/px/<id>?…   (un lien universel : il ouvre ploxi0n chez qui l'a, la page
//                                                                          du ploxion chez les autres ; 1 Mo au lieu des 9,5 Mo de /local)
//   tout autre chemin                    →  https://labo.j0bot.ch/<chemin>   (/join?inv=…, /?px=…)
// Et dans l'autre sens : un lien universel reçu (…/px/<id>?code=…) ouvre le ploxion avec ses paramètres dans location.search, là où les
// ploxions du labo les lisent (routeur : params.lien).
export const PUBLIC = 'https://labo.j0bot.ch';
const LOCAL = /^(?:capacitor|ionic):\/\/localhost|^https?:\/\/localhost(?::\d+)?/i;
const LOCAL_G = /(?:capacitor|ionic):\/\/localhost[^\s"'<>)\]]*|https?:\/\/localhost(?::\d+)?[^\s"'<>)\]]*/gi;

/** un lien fait dans l'app → le lien public ; tout autre lien : tel quel */
export function versPublic(url, source = PUBLIC) {
  const s = String(url == null ? '' : url), m = LOCAL.exec(s);
  if (!m) return s;
  const reste = s.slice(m[0].length) || '/';
  try {
    const u = new URL(reste.startsWith('/') ? reste : '/' + reste, source), px = u.searchParams.get('px');
    if (px && (u.pathname === '/local' || u.pathname === '/' || u.pathname === '/index.html')) {
      u.searchParams.delete('px');
      const q = u.searchParams.toString();
      return source + '/px/' + encodeURIComponent(px) + (q ? '?' + q : '') + u.hash;
    }
    return source + u.pathname + u.search + u.hash;
  } catch (e) { return source + (reste.startsWith('/') ? reste : '/' + reste); }
}
/** tous les liens de l'app dans un texte → publics */
export const publierTexte = (t, source = PUBLIC) => (typeof t === 'string' ? t.replace(LOCAL_G, (x) => versPublic(x, source)) : t);

/** le lien d'un ploxion à partager : la page du labo (lien universel) ; un ploxion de l'app seule : /app/ouvrir/<id>?app=1 */
export const lienPloxion = (p, source = PUBLIC) => (p && p.interne ? source + '/app/ouvrir/' + encodeURIComponent(p.id) + '?app=1' : source + '/px/' + encodeURIComponent(p && p.id));

/** jOSQR (le bion QR du labo) est chargé à la demande : chaque fois qu'il est posé sur window, il est enveloppé (son texte devient public) */
export function envelopperQR(W, source = PUBLIC) {
  const env = (f) => (typeof f !== 'function' || f.__public ? f : Object.assign(function (texte, ...r) { return f.call(this, typeof texte === 'string' ? versPublic(publierTexte(texte, source), source) : texte, ...r); }, f, { __public: true }));
  let v = env(W.jOSQR);
  try { Object.defineProperty(W, 'jOSQR', { configurable: true, enumerable: true, get: () => v, set: (f) => { v = env(f); } }); } catch (e) { /* */ }
}

/** les liens montrés dans un champ (input/textarea readonly) d'un ploxion : on les copie souvent à la main */
export function reparerAffichage(racine, source = PUBLIC) {
  const W = racine.ownerDocument && racine.ownerDocument.defaultView; if (!W || !W.MutationObserver) return () => {};
  const voir = (el) => {
    if (!el || el.nodeType !== 1) return;
    const l = el.matches('input,textarea') ? [el] : el.querySelectorAll ? el.querySelectorAll('input[readonly],textarea[readonly],input[type=url]') : [];
    for (const x of l) if (LOCAL.test(x.value || '')) x.value = publierTexte(x.value, source);
  };
  const ob = new W.MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) voir(n); });
  ob.observe(racine, { childList: true, subtree: true });
  return () => ob.disconnect();
}

/** un lien reçu (collé, scanné, universel) → { id, lien } à ouvrir dans l'app, ou null */
export function lienRecu(texte, source = PUBLIC) {
  let u; try { u = new URL(String(texte || '').trim()); } catch (e) { return null; }
  if (u.protocol === 'ploxi0n:') { const id = (u.host === 'px' ? u.pathname : u.pathname.replace(/^\/px/, '')).replace(/^\/+/, '').split('/')[0]; return id ? { id: decodeURIComponent(id), lien: u.search } : null; }
  if (!/^https?:$/.test(u.protocol) || (u.origin !== source && !LOCAL.test(u.origin))) return null;
  let r = /^\/(?:px|app\/ouvrir)\/([^/?#]+)/.exec(u.pathname);
  if (r) { const q = new URLSearchParams(u.search); q.delete('app'); const s = q.toString(); return { id: decodeURIComponent(r[1]), lien: s ? '?' + s : '' }; }
  const px = u.searchParams.get('px');
  if (px) { const q = new URLSearchParams(u.search); q.delete('px'); const s = q.toString(); return { id: px, lien: s ? '?' + s : '' }; }
  if (u.pathname === '/join' && u.searchParams.get('inv')) return { id: 'invitation', lien: '?code=' + encodeURIComponent(u.searchParams.get('inv')) + (u.searchParams.get('niv') ? '&niv=' + encodeURIComponent(u.searchParams.get('niv')) : '') };
  return null;
}
