// 🔑 LE LABO CONNECTÉ TOUT SEUL (0.83). RS-7 (19.10, capture du mode xerboxion : l'UI du labo s'affiche enfin dans l'app, mais « j'ai un code ») :
// « faut aussi que le labo puisse se connecter automatiquement, plus simple ».
// L'app a déjà ton compte du labo (le jeton, docs/dev/57). Mais une page du labo dans un cadre de l'app ne voit pas ta session : iOS bloque les
// cookies d'un autre site dans un cadre ; seuls passent les cookies PARTITIONNÉS (CHIPS, WebKit 26.2+), propres à ce cadre dans cette app.
// Le passage, sans jamais mettre le jeton dans une adresse :
//   1. l'app demande au labo un PASSE à usage unique : POST /api/app/passe (Authorization: Bearer <jeton>) → { passe, expire } (60 s)
//   2. le cadre (ou le navigateur intégré) ouvre /app/entrer?passe=…&vers=<chemin> ; le labo te connecte, pose sa session (partitionnée
//      quand la demande vient d'un cadre de l'app) et redirige vers <chemin> (un chemin du labo, jamais une autre adresse)
// Pas connecté dans l'app, hors ligne, ou le labo sans cette route (404) : l'adresse telle quelle (le labo propose alors de se connecter).
// Le côté labo (les deux routes) : docs/CONTEXTE.md 0.83.

/** requete({ methode, url, headers }) → { status, texte } : le HTTP natif AVEC le jeton (le relais du compte) ; connecte() : l'app a un compte */
export function creerConnexionLabo({ source = 'https://labo.j0bot.ch', requete, connecte = () => false, enLigne = () => true, maintenant = () => Date.now() }) {
  let absente = false;   // le labo n'a pas (encore) la route : on ne redemande pas avant le prochain lancement
  /** un chemin du labo (« /home?app=ploxi0n ») → l'adresse qui t'y connecte (ou l'adresse simple) */
  async function adresse(chemin) {
    const c = String(chemin || '/');
    const simple = source + (c.startsWith('/') ? c : '/' + c);
    if (absente || !connecte() || !enLigne() || !c.startsWith('/') || c.startsWith('//')) return simple;
    try {
      const r = await requete({ methode: 'POST', url: source + '/api/app/passe', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, corps: JSON.stringify({ vers: c }) });
      if (r.status === 404 || r.status === 405) { absente = true; return simple; }
      if (r.status !== 200) return simple;
      const d = JSON.parse(r.texte || '{}');
      if (!d || typeof d.passe !== 'string' || !/^[A-Za-z0-9_-]{16,200}$/.test(d.passe) || (d.expire && Date.parse(d.expire) < maintenant())) return simple;
      return source + '/app/entrer?passe=' + encodeURIComponent(d.passe) + '&vers=' + encodeURIComponent(c);
    } catch (e) { return simple; }
  }
  /** une adresse quelconque : celle du labo → connectée ; les autres, telles quelles */
  async function emballer(url) {
    let u; try { u = new URL(String(url)); } catch (e) { return url; }
    if (u.origin !== source || u.pathname.startsWith('/app/entrer') || u.pathname.startsWith('/api/')) return String(url);
    return adresse(u.pathname + u.search + u.hash);
  }
  return { adresse, emballer, disponible: () => !absente };
}
