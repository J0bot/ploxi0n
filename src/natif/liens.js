// Les LIENS vers un ploxion : ploxi0n://px/<id> (schéma de l'app : avec l'app Raccourcis d'iOS, « Ouvrir l'URL » + « Ajouter à l'écran
// d'accueil » = une icône par ploxion sur l'écran d'accueil de l'iPhone) et les raccourcis de l'icône (appui long sur ploxi0n).
export function brancherLiens({ W = globalThis.window, routeur }) {
  const natif = !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  if (!natif) return;
  const aller = (id) => { if (!id || id === 'accueil') return routeur.accueil(); if (routeur.connait(id)) routeur.ouvrir(id); else routeur.accueil(); };
  import('@capacitor/app').then(({ App }) => App.addListener('appUrlOpen', (e) => {
    try { const u = new URL(e.url); const m = (u.host === 'px' ? u.pathname : u.pathname.replace(/^\/px/, '')).replace(/^\/+/, ''); aller(decodeURIComponent(m.split('/')[0])); } catch (er) { /* lien illisible */ }
  })).catch(() => {});
  import('@capawesome/capacitor-app-shortcuts').then(({ AppShortcuts }) => AppShortcuts.addListener('click', (e) => aller(e.shortcutId))).catch(() => {});
}
