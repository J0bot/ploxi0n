// 👁 L'AR NATIVE, CÔTÉ PAGE (0.73). RS-7 (15.10) : « le plus important de tout, c'est l'AR ; utiliser au max les fonctions natives ; et AR
// Quick Look ». PloxiAR (AppDelegate.swift : ARKit + RealityKit, RoomPlan) et AR Quick Look (PloxiApple.apercu). Pour le terrax et, par
// jOSNatif.ar, pour tous les ploxions :
//   disponible()  → { ar, lidar, piece, chambre, pieces }, ou null (hors iPhone ; un appareil sans AR ; un build sans elle : PLOXI0N_AR=0)
//   ouvrir({ mode: terre | chambre, objets: [{ id, x, y, z, taille, emoji, texte }], emojis, maillage })   l'AR en plein écran
//   ecouter(fn) → arrêter    fn({ type: pose | touche | chambre-neuve | ferme, … })
//   fermer() · scannerPiece() → { nom, chemin } · voirPiece(nom) : la pièce scannée en AR Quick Look, à l'échelle 1
//   (0.74) capturerObjet() → { nom, chemin } : Object Capture (iOS 17, LiDAR), ton objet réel en modèle 3D · voirObjet(nom) : en AR Quick Look ;
//   ouvrir({ …, modeles: [{ nom, texte }] }) : tes objets 3D proposés quand on pose ; objets[].modele (+ rot) : le vrai modèle dans l'AR
// Les liens 3D des ploxions : un lien .usdz / .reality (ou rel="ar") ne s'ouvre pas dans une page d'app (WKWebView) ; brancherLiensAR le
// donne à AR Quick Look (le fichier est téléchargé par iOS, sans CORS).
// Le plugin est un Proxy sur iOS : on n'en lit aucune propriété, on ne le rend jamais d'une fonction async (CLAUDE.md).
import { PloxiAR, PloxiApple } from './plugins-app.js';

export function creerArNatif({ W = globalThis.window, plugin = PloxiAR, apple = PloxiApple } = {}) {
  const natif = () => !!(plugin && W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  const disponible = () => (natif() ? plugin.disponible().then((d) => (d && d.ar ? d : null)).catch(() => null) : Promise.resolve(null));
  return {
    disponible,
    ouvrir: (o = {}) => plugin.ouvrir({ mode: o.mode === 'chambre' ? 'chambre' : 'terre', objets: o.objets || [], emojis: o.emojis || [], modeles: o.modeles || [], maillage: !!o.maillage }),
    fermer: () => (natif() ? plugin.fermer().catch(() => null) : Promise.resolve(null)),
    ecouter(fn) {
      if (!natif()) return () => {};
      let h = null, fini = false;
      Promise.resolve(plugin.addListener('ar', (e) => { if (!fini) fn(e || {}); })).then((x) => { h = x; if (fini && h) h.remove(); }).catch(() => {});
      return () => { fini = true; if (h) h.remove(); };
    },
    scannerPiece: () => plugin.scannerPiece(),
    capturerObjet: () => plugin.capturerObjet(),
    voirPiece: (nom) => voir(nom, 'pieces'),
    voirObjet: (nom) => voir(nom, 'objets'),
  };
  // un USDZ de l'iPhone (une pièce scannée, un objet capturé) en AR Quick Look, à l'échelle 1 ; jamais hors de son dossier
  async function voir(nom, ou) {
    const d = await disponible();
    const n = String(nom == null ? '' : nom).replace(/[/\\]/g, '');
    if (!d || !d[ou] || !n || /^\.+$/.test(n)) throw new Error(ou === 'pieces' ? 'pas de pièce scannée sur cet appareil' : 'pas d\'objet 3D sur cet appareil');
    return apple.apercu({ chemin: d[ou] + '/' + n, echelleReelle: true });
  }
}

/** un lien vers un modèle 3D pour AR Quick Look : .usdz, .reality, ou rel="ar" (la convention de Safari) */
export const estLienAR = (a) => !!a && (/\.(usdz|reality)(?:[?#]|$)/i.test(a.getAttribute('href') || '') || /(?:^|\s)ar(?:\s|$)/i.test(a.getAttribute('rel') || ''));

/** chaque lien 3D d'un ploxion → AR Quick Look (apercu reçoit l'adresse absolue) */
export function brancherLiensAR({ D = globalThis.document, apercu }) {
  const f = (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || !estLienAR(a)) return;
    e.preventDefault(); e.stopPropagation();
    Promise.resolve().then(() => apercu(a.href)).catch(() => {});
  };
  D.addEventListener('click', f, true);
  return () => D.removeEventListener('click', f, true);
}
