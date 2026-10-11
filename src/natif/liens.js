// Les LIENS vers un ploxion : ploxi0n://px/<id> (schéma de l'app : avec l'app Raccourcis d'iOS, « Ouvrir l'URL » + « Ajouter à l'écran
// d'accueil » = une icône par ploxion sur l'écran d'accueil de l'iPhone) et les raccourcis de l'icône (appui long sur ploxi0n).
export function brancherLiens({ W = globalThis.window, routeur, compte = null }) {
  const natif = !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  if (!natif) return;
  const aller = (id) => { if (!id || id === 'accueil') return routeur.accueil(); if (routeur.connait(id)) routeur.ouvrir(id); else routeur.accueil(); };
  import('@capacitor/app').then(({ App }) => App.addListener('appUrlOpen', (e) => {
    try {
      const u = new URL(e.url);
      if (u.host === 'connexion') {   // le retour du login (docs/dev/57 du labo) : ploxi0n://connexion?code=… ou ?refus=1
        const code = u.searchParams.get('code');
        if (compte && code) compte.recevoirCode(code).then(() => routeur.accueil()).catch((er) => { try { W.alert('Connexion : ' + er.message); } catch (x) { /* */ } });
        return;
      }
      const m = (u.host === 'px' ? u.pathname : u.pathname.replace(/^\/px/, '')).replace(/^\/+/, ''); aller(decodeURIComponent(m.split('/')[0]));
    } catch (er) { /* lien illisible */ }
  })).catch(() => {});
  import('@capawesome/capacitor-app-shortcuts').then(({ AppShortcuts }) => AppShortcuts.addListener('click', (e) => aller(e.shortcutId))).catch(() => {});
}
