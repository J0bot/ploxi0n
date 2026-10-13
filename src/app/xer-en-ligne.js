// 🌐 MON XER EN LIGNE — le xer complet de labo.j0bot.ch (login, fichiers, tous les xers, les ploxions connectés au boxion), dans un
// navigateur intégré à l'app (SFSafariViewController : la session reste comme dans Safari). En ligne seulement ; le hors ligne, c'est
// ploxi0n lui-même. Pont en attendant l'appairage du boxion dans l'app.
export const XER = 'https://labo.j0bot.ch';
export function enregistrerXerEnLigne({ W = globalThis.window, url = XER }) {
  async function ouvrirXer(chemin = '/home') {
    if (W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform()) {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: url + chemin, presentationStyle: 'fullscreen' });
    } else W.open(url + chemin, '_blank', 'noopener');
  }
  function mount(hote) {
    hote.innerHTML = '<div style="padding:14px 16px;line-height:1.5"><h2 style="margin:4px 0 8px">🌐 Mon xer en ligne</h2>'
      + '<p style="color:#8aa0c0">Ton xer complet sur labo.j0bot.ch : ton compte, tes fichiers, tes autres xers, les ploxions connectés à ton boxion. Il faut du réseau.</p>'
      + '<p><button data-x="/home" style="font:15px system-ui;padding:10px 16px;border-radius:10px;border:1px solid #3fe0d0;background:transparent;color:#3fe0d0">ouvrir mon xer</button></p>'
      + '<p><button data-x="/login" style="font:14px system-ui;padding:8px 14px;border-radius:10px;border:1px solid #22324f;background:transparent;color:inherit">me connecter</button> '
      + '<button data-x="/px/files" style="font:14px system-ui;padding:8px 14px;border-radius:10px;border:1px solid #22324f;background:transparent;color:inherit">mes fichiers</button></p></div>';
    hote.addEventListener('click', (e) => { const b = e.target.closest('[data-x]'); if (b) ouvrirXer(b.getAttribute('data-x')); });
    return { unmount() { hote.innerHTML = ''; } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps['xer-en-ligne'] = { manifest: { id: 'xer-en-ligne', name: 'Mon xer en ligne', icon: '🌐' }, mount };
  return { id: 'xer-en-ligne', nom: 'Mon xer en ligne', icone: '🌐', interne: true };
}
