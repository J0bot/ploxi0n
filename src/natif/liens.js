// Les LIENS vers un ploxion : ploxi0n://px/<id> (schéma de l'app : avec l'app Raccourcis d'iOS, « Ouvrir l'URL » + « Ajouter à l'écran
// d'accueil » = une icône par ploxion sur l'écran d'accueil de l'iPhone) et les raccourcis de l'icône (appui long sur ploxi0n).
export function brancherLiens({ W = globalThis.window, routeur, compte = null, installer = null, lecture = null }) {
  const natif = !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  if (!natif) return;
  const aller = (id) => {
    if (!id || id === 'accueil') return routeur.accueil();
    if (routeur.connait(id)) return routeur.ouvrir(id);
    if (installer) return Promise.resolve(installer(id)).then(ok => ok || routeur.accueil()).catch(() => routeur.accueil());
    routeur.accueil();
  };
  import('@capacitor/app').then(({ App }) => App.addListener('appUrlOpen', (e) => {
    try {
      const u = new URL(e.url);
      if (u.host === 'connexion') {   // le retour du login (docs/dev/57 du labo) : ploxi0n://connexion?code=… ou ?refus=1
        const code = u.searchParams.get('code');
        if (compte && code) compte.recevoirCode(code).then(() => routeur.accueil()).catch((er) => { try { W.alert('Connexion : ' + er.message); } catch (x) { /* */ } });
        return;
      }
      if (u.host === 'lecture') { if (lecture) lecture(u.pathname.replace(/^\/+/, '').split('/')[0]); return; }   // ♫ les boutons du widget « À l'écoute » (0.48)
      // les liens universels (Associated Domains, 0.27) : https://xerboxion.org/px/<id>… et /app/ouvrir/<id>
      if (/^https?:$/.test(u.protocol)) { const r = /^\/(?:px|app\/ouvrir)\/([^/?#]+)/.exec(u.pathname); if (r) aller(decodeURIComponent(r[1])); else routeur.accueil(); return; }
      const m = (u.host === 'px' ? u.pathname : u.pathname.replace(/^\/px/, '')).replace(/^\/+/, ''); aller(decodeURIComponent(m.split('/')[0]));
    } catch (er) { /* lien illisible */ }
  })).catch(() => {});
  import('@capawesome/capacitor-app-shortcuts').then(({ AppShortcuts }) => AppShortcuts.addListener('click', (e) => aller(e.shortcutId))).catch(() => {});
}
