// 🌀 LE THÈME VIVANT (RS-7 12.10 : « des effets avec le gyroscope et l'accéléromètre — juste ça, pas plus » ; « merger le thème avec
// le gyroscope et l'accéléromètre »). Pas une fonction à part : le THÈME chill-tekk lui-même suit le téléphone.
//   - la gravité (gyroscope + accéléromètre, CoreMotion natif via PloxiApple) → deux variables du thème, --mx et --my (−1…1, lissées) :
//     le fond glisse à l'opposé (parallaxe), les icônes flottent au-dessus de la plaque, leur ombre suit, la patine glisse, l'arête du
//     haut des icônes attrape la lumière, les inscriptions gravées se creusent ;
//   - l'angle où tu tiens le téléphone devient le neutre (le repère se recentre en ~3 s) : couché, debout, peu importe ;
//   - un choc (l'accéléromètre > 0,9 g) → les icônes tressautent une fois (html.px-choc, 320 ms).
// Seulement visible : à l'accueil (ou partout si le fond est « partout »), app au premier plan, ⚙ › Apparence › Thème vivant,
// jamais en Calme. 30 Hz, aucune boucle d'images : chaque mesure pose deux variables, c'est tout.
const borne = (x) => Math.max(-1, Math.min(1, x));

export function creerMouvement({ W = globalThis.window, prefs, plugin = null, racine = null }) {
  const D = W.document, h = D.documentElement;
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  let P = plugin, ecoute = null, actif = false, echec = false, enCours = false, b = null, s = { x: 0, y: 0 }, dernier = { x: 0, y: 0 }, chocT = 0;
  const veut = () => {
    const p = prefs.lire();
    if (echec || p.themeVivant === false || p.calme || D.hidden) return false;
    if (!P && !natif()) return false;
    const R = racine || D.getElementById('ploxi0n');
    return !R || R.classList.contains('px-mode-accueil') || h.classList.contains('px-fond-partout');
  };
  /** une mesure : la gravité (gx, gy) → --mx, --my ; l'accélération propre (ax, ay, az) → un choc */
  function mesure(m) {
    if (!m) return;
    const gx = +m.gx || 0, gy = +m.gy || 0;
    if (!b) b = { x: gx, y: gy };
    b.x += (gx - b.x) * 0.012; b.y += (gy - b.y) * 0.012;           // le neutre suit lentement (≈ 3 s à 30 Hz)
    s.x += (borne((gx - b.x) / 0.32) - s.x) * 0.28;                     // lissé : pas de tremblement
    s.y += (borne((gy - b.y) / 0.32) - s.y) * 0.28;
    if (Math.abs(s.x - dernier.x) > 0.004 || Math.abs(s.y - dernier.y) > 0.004) {
      dernier = { x: s.x, y: s.y };
      h.style.setProperty('--mx', s.x.toFixed(3)); h.style.setProperty('--my', (-s.y).toFixed(3));
    }
    const a = Math.hypot(+m.ax || 0, +m.ay || 0, +m.az || 0), t = Date.now();
    if (a > 0.9 && t - chocT > 900) { chocT = t; h.classList.remove('px-choc'); void h.offsetWidth; h.classList.add('px-choc'); W.setTimeout(() => h.classList.remove('px-choc'), 320); }
  }
  // (0.44) LE GEL DU DÉMARRAGE (0.37 → 0.43, RS-7 sur iPhone ET iPad) : un échec ici retirait px-vivant de <html>, que ce module observait
  // lui-même → suivre() → redémarrer → échouer → retirer… une boucle de micro-tâches infinie : plus aucun dessin, plus aucun minuteur.
  // Désormais : <html> n'est plus observé, un échec est définitif pour la session, jamais deux démarrages en même temps.
  async function demarrer() {
    if (actif || enCours || echec) return; enCours = true; b = null;
    try {
      if (!P) P = (await import('@capacitor/core')).registerPlugin('PloxiApple');
      ecoute = await P.addListener('mouvement', mesure);
      await P.mouvementDebut({ hz: 30 });
      actif = true; h.classList.add('px-vivant');
    } catch (e) { echec = true; try { if (ecoute) await ecoute.remove(); } catch (e2) { /* */ } ecoute = null; }
    finally { enCours = false; }
  }
  async function arreter() {
    if (!actif) return; actif = false;
    h.classList.remove('px-vivant'); h.style.setProperty('--mx', '0'); h.style.setProperty('--my', '0');
    try { if (ecoute) await ecoute.remove(); ecoute = null; if (P) await P.mouvementFin(); } catch (e) { /* */ }
  }
  const suivre = () => (veut() ? demarrer() : arreter());
  D.addEventListener('visibilitychange', suivre);
  prefs.surChangement(suivre);
  const R = racine || D.getElementById('ploxi0n');
  if (R) new W.MutationObserver(suivre).observe(R, { attributes: true, attributeFilter: ['class'] });
  suivre();
  return { mesure, demarrer, arreter, actif: () => actif, suivre };
}
