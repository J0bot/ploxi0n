// ⌂ LES APPLIS DU TÉLÉPHONE (0.99.32, Android, RS-7 : « un android sans rien et juste l'appli ploxion »). Quand ploxion est l'écran d'accueil,
// c'est par ici qu'on rejoint ce qui n'est pas (encore) un ploxion : le téléphone, l'appareil photo, les réglages d'Android. Un ploxion interne
// qui compose jOSAccueil (src/natif/accueil-natif.js) : chercher, toucher pour ouvrir, appui long pour les réglages de l'appli.
// En tête : l'état « écran d'accueil » et le bouton qui ouvre la fenêtre d'Android pour le choisir. Démonté : rien ne tourne.
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** sans accents, en minuscules : « Réglages » se trouve avec « regl » */
export const plat = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const filtrer = (l, q) => { const k = plat(q).trim(); return k ? l.filter(a => plat(a.nom).includes(k) || plat(a.paquet).includes(k)) : l; };

export function creerApplis({ W = globalThis.window, accueil, vibrer = () => {}, appui = 520 } = {}) {
  function mount(hote) {
    let vivant = true, liste = [], q = '';
    hote.innerHTML = '<div class="px-page px-ap"><p class="px-grave">⌂ les applis du téléphone</p>'
      + '<div class="px-ap-tete" data-ap-tete></div>'
      + '<input type="search" class="px-ap-q" data-ap-q placeholder="chercher une appli" autocomplete="off" enterkeyhint="go">'
      + '<div class="px-ap-g" data-ap-g><p class="px-ap-vide">…</p></div></div>';
    const tete = hote.querySelector('[data-ap-tete]'), grille = hote.querySelector('[data-ap-g]'), champ = hote.querySelector('[data-ap-q]');
    function peindreTete(r) {
      tete.innerHTML = r.accueil
        ? '<span class="ok">ploxion est ton écran d\'accueil</span><button type="button" data-ap-choisir>changer</button>'
        : '<span>ploxion n\'est pas ton écran d\'accueil</span><button type="button" class="px-gros" data-ap-choisir><b>⌂ en faire l\'écran d\'accueil</b></button>';
    }
    function peindre() {
      if (!vivant) return;
      const l = filtrer(liste, q);
      grille.innerHTML = l.length ? l.map((a, i) => '<button type="button" class="px-ap-a" data-ap-i="' + liste.indexOf(a) + '" title="' + esc(a.paquet) + '">'
        + (a.icone ? '<img alt="" src="' + esc(a.icone) + '" width="48" height="48" loading="' + (i < 24 ? 'eager' : 'lazy') + '">' : '<span class="px-ap-x">' + esc(a.nom.slice(0, 1).toUpperCase()) + '</span>')
        + '<span class="n">' + esc(a.nom) + '</span></button>').join('')
        : '<p class="px-ap-vide">' + (liste.length ? 'rien pour « ' + esc(q) + ' »' : 'aucune appli lue') + '</p>';
    }
    function charger(frais) { return accueil.applis({ frais }).then((l) => { liste = l; peindre(); }).catch((e) => { if (vivant) grille.innerHTML = '<p class="px-ap-vide">' + esc(e.message || e) + '</p>'; }); }
    accueil.estAccueil().then(peindreTete).catch(() => {});
    charger(false);
    champ.addEventListener('input', () => { q = champ.value; peindre(); });
    champ.addEventListener('keydown', (e) => { if (e.key !== 'Enter') return; const l = filtrer(liste, q); if (l.length === 1) { vibrer('ouvrir'); accueil.lancer(l[0]).catch(() => {}); } });
    tete.addEventListener('click', (e) => { if (!e.target.closest('[data-ap-choisir]')) return; vibrer('interrupteur'); accueil.choisir().then(peindreTete).catch(() => {}); });
    // toucher : ouvrir ; appui long : les réglages Android de l'appli
    let minuteur = 0, long = false;
    grille.addEventListener('pointerdown', (e) => { const b = e.target.closest('[data-ap-i]'); if (!b) return; long = false; W.clearTimeout(minuteur);
      minuteur = W.setTimeout(() => { long = true; const a = liste[+b.getAttribute('data-ap-i')]; if (a) { vibrer('appui'); accueil.reglages(a.paquet).catch(() => {}); } }, appui); });
    const annuler = () => W.clearTimeout(minuteur);
    grille.addEventListener('pointerup', annuler); grille.addEventListener('pointercancel', annuler); grille.addEventListener('pointerleave', annuler);
    grille.addEventListener('click', (e) => { const b = e.target.closest('[data-ap-i]'); if (!b) return; if (long) { long = false; return; }
      const a = liste[+b.getAttribute('data-ap-i')]; if (a) { vibrer('ouvrir'); accueil.lancer(a).catch(() => {}); } });
    // revenu d'une appli Android : une appli installée ou enlevée entre-temps apparaît
    const revenu = () => { if (!W.document.hidden && vivant) { accueil.estAccueil().then(peindreTete).catch(() => {}); charger(true); } };
    W.document.addEventListener('visibilitychange', revenu);
    return { unmount() { vivant = false; W.clearTimeout(minuteur); W.document.removeEventListener('visibilitychange', revenu); hote.innerHTML = ''; } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps.applis = { manifest: { id: 'applis', name: 'Applis', icon: '⌂' }, mount };
  return { mount, ploxion: { id: 'applis', nom: 'Applis', icone: '⌂', interne: true } };
}
