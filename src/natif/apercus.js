// 📸 LES PHOTOS DES XERS (0.72). RS-7 (15.10) : « quand tu screenshot vraiment, ça s'enregistre sur l'appli ploxion dans le cache, pour avoir plus
// de vues rapidement sans devoir les fetch, juste nativement du téléphone ».
// À chaque capture d'écran d'iOS (AppDelegate → « ploxi0n-capture »), AVANT que la vue des xers s'ouvre : PloxiApple.capturerXer({ id }) — WebKit
// rend ce que montre la page (takeSnapshot), à demi-largeur, en JPEG dans Caches/xers/<id>.jpg. L'index (boxion_local « reglages/apercus » :
// { id: { chemin, le } }) dit où est la dernière photo de chaque xer ; src(id) la sert à une <img> (Capacitor.convertFileSrc, ?v= pour ne pas
// montrer l'ancienne). La vue des xers (src/app/vue-xers.js) les montre pour les apps fermées : un aperçu sans rien recharger.
// Hors iPhone : rien (pas de capture native) ; le cache d'iOS peut être vidé : une photo absente est simplement oubliée.
// 💭 (extrapolations, à valider avec RS-7) la photo aussi en quittant un ploxion ; les photos dans la fractale et la carte ; la photo gardée
// comme un tsoin (le xer à ce moment-là).
export const ACCUEIL = '·';

export function creerApercus({ W = globalThis.window, boxion = null, plugin = null } = {}) {
  let index = null;
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  const lire = async () => { if (index) return index; const v = boxion ? await boxion.get('reglages', 'apercus').catch(() => null) : null; index = v && typeof v === 'object' ? v : {}; return index; };
  return {
    lire,
    /** photographie l'écran pour le xer `id` (l'accueil : « · ») ; rend { chemin, le } ou null */
    async capturer(id) {
      if (!plugin || !natif()) return null;   // (le plugin est un Proxy sur iOS : on ne lit jamais une de ses propriétés au hasard)
      const r = await plugin.capturerXer({ id: id === ACCUEIL || id == null ? 'accueil' : String(id) });
      if (!r || !r.chemin) return null;
      await lire(); index[id == null ? ACCUEIL : id] = { chemin: r.chemin, le: Date.now() };
      if (boxion) boxion.put('reglages', 'apercus', index).catch(() => {});
      return index[id == null ? ACCUEIL : id];
    },
    /** l'adresse de la dernière photo de ce xer (pour une <img>), ou null */
    src(id) {
      const a = index && index[id]; if (!a) return null;
      const conv = W.Capacitor && typeof W.Capacitor.convertFileSrc === 'function' ? W.Capacitor.convertFileSrc(a.chemin) : a.chemin;
      return conv + (conv.includes('?') ? '&' : '?') + 'v=' + a.le;
    },
    /** une photo a disparu (iOS a vidé son cache) : on l'oublie */
    oublier(id) { if (index && index[id]) { delete index[id]; if (boxion) boxion.put('reglages', 'apercus', index).catch(() => {}); } },
  };
}
