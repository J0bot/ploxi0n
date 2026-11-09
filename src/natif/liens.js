// Les LIENS vers un ploxion : ploxi0n://px/<id> (schéma de l'app : avec l'app Raccourcis d'iOS, « Ouvrir l'URL » + « Ajouter à l'écran
// d'accueil » = une icône par ploxion sur l'écran d'accueil de l'iPhone) et les raccourcis de l'icône (appui long sur ploxi0n).
import { lienRecu } from '../app/liens-publics.js';
export function brancherLiens({ W = globalThis.window, routeur, compte = null, surLien = () => {}, installer = null, lecture = null, lire = null, actions = {} }) {
  const natif = !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  if (!natif) return;
  // (0.76) lien : les paramètres du lien (?code=…&join=…), rendus au ploxion dans location.search (src/app/liens-publics.js)
  const aller = (id, lien = '') => {
    if (!id || id === 'accueil') return routeur.accueil();
    const p = lien && lien.length > 1 ? { lien } : undefined;
    if (routeur.connait(id)) return routeur.ouvrir(id, p);
    if (installer) return Promise.resolve(installer(id)).then(ok => (ok ? routeur.ouvrir(id, p) : routeur.accueil())).catch(() => routeur.accueil());
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
      // 🎞 (0.49) ploxi0n://lire?url=…&titre=…&position=… : le bouton « ▶ ploxi0n » d'un ploxion seul (docs/LECTEUR.md)
      // (0.49) les contrôles du Centre de contrôle et de l'écran verrouillé : ploxi0n://tsoin · ploxi0n://vocal · ploxi0n://lampe
      if (actions[u.host]) { try { actions[u.host](u); } catch (er) { /* */ } return; }
      if (u.host === 'lire') { const p = u.searchParams; if (lire && p.get('url')) lire({ url: p.get('url'), titre: p.get('titre') || '', position: p.has('position') ? +p.get('position') : undefined, sousTitres: p.getAll('sous') }); return; }
      if (u.host === 'lecture') { if (lecture) lecture(u.pathname.replace(/^\/+/, '').split('/')[0]); return; }   // ♫ les boutons du widget « À l'écoute » (0.48)
      // les liens universels (Associated Domains, 0.27) : https://labo.j0bot.ch/px/<id>… et /app/ouvrir/<id>
      const r = lienRecu(e.url);   // (0.76) …/px/<id>?…, /app/ouvrir/<id>, ?px=<id>, /join?inv=…, ploxi0n://px/<id>?…
      if (r) { try { surLien(r); } catch (er) { /* */ } aller(r.id, r.lien); return; }   // (0.84) surLien : une invitation du social est gardée
      if (/^https?:$/.test(u.protocol)) { routeur.accueil(); return; }
      const m = (u.host === 'px' ? u.pathname : u.pathname.replace(/^\/px/, '')).replace(/^\/+/, ''); aller(decodeURIComponent(m.split('/')[0]));
    } catch (er) { /* lien illisible */ }
  })).catch(() => {});
  import('@capawesome/capacitor-app-shortcuts').then(({ AppShortcuts }) => AppShortcuts.addListener('click', (e) => aller(e.shortcutId))).catch(() => {});
}
