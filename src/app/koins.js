// ◺◿ LES KOINS REMPLACENT LE DOCK ET LE HUD (0.89, prototype). RS-7 (22.10, son carnet : docs/KOINS.md, docs/look/references/koins-0*.jpg) :
// « la base des koins sur téléphone » : deux koins (des triangles emboîtés) dans les coins du bas de l'écran ; ils GRANDISSENT (petits, moyens,
// grands) jusqu'à devenir, en bas, deux carrés de deux cases : à gauche le trion (au-dessus) et le wormion, à droite le xer et le portion ;
// « les koins remplacent les dock/hud ». Et la barre des glyphes du carnet, ⧗ ○ △ □ ◇, avec le ✕ du xeroction.
// Le lexique, tel que noté sur la page (à confirmer par RS-7, docs/KOINS.md) :
//   xeroction ✕  user, params              → toi : le compte et les réglages
//   tsoin ⧗      record, rejouer, play     → noter un tsoin (le journal à l'appui long)
//   wormion ○    émotionnel, temps, niveau de réel → le temps : ce que tu avais ouvert (⧉)
//   trion △      les koins                 → le koin du ion
//   portion □    rationnel, fractale, types de réel → la carte de tout le xerboxion
//   ploxion ◇    les ploxions              → l'accueil
//   xer ⊠        (« xer ? » sur le carnet) → mes xers
// (0.99.47, RS-7 : « je veux pas trois tailles de koin, je veux une animation du koin qui s'agrandit et qui se transforme en koin ouvert pour
// avoir l'écran avec le portion et le wormion ») UN toucher : le triangle du coin grandit et S'OUVRE en carré, les cases apparaissent dans son
// ouverture (un clip-path : triangle → carré, réglé par --k de 0 à 1), la barre descend. Glisser vers le haut suit le doigt (--k au doigt) ;
// lâcher après 40 % ouvre, avant referme. Toucher ailleurs, ou une case : il se referme (l'animation à l'envers). ‹ et ▁ sont dans la barre.
// (0.99.47) LE XER : la case ⊠ change de xer (organique, chill-tekk, xerboxion, xerbot : les modes ; en mode koin, l'en-tête de l'accueil et
// ses onglets de modes s'effacent) ; appui long : mes xers. LE TRION (le koin du ion) : « ici, maintenant » (proposition, docs/KOINS.md).
import { glyphe as G } from './glyphes.js';
import { creerPadWormion, creerPadPortion } from './pads.js';   // ○ □ (0.92) le wormion et le portion : des trackpads
export const PADS = { wormion: true, portion: true };   // (0.92) ces cases-là sont des trackpads
export const ETAPES = 2;   // (0.99.47) 0 fermé · 1 ouvert (une seule animation entre les deux, plus de tailles intermédiaires)
export const OUVRIR_A = 0.4;   // glisser : au-delà de 40 % du chemin, lâcher ouvre
export const CASES = { gauche: [['trion', 'koins'], ['wormion', 'temps']], droite: [['xer', 'xer'], ['portion', 'carte']] };
export const BARRE = [['retour', 'retour', '‹'], ['tsoin', 'tsoin', ''], ['wormion', 'temps', ''], ['trion', 'koins', ''], ['portion', 'carte', ''], ['ploxion', 'accueil', ''], ['xeroction', 'toi', ''], ['quoi', 'quoi', 'ⓘ'], ['minimiser', 'minimiser', '▁']];
const NOMS = { xer: 'ton xer (appui long : mes xers)', koins: 'le koin du ion', temps: 'le temps (ce que tu avais ouvert)', xers: 'mes xers', carte: 'tout le xerboxion', tsoin: 'noter un tsoin', accueil: 'les ploxions', toi: 'toi (compte, réglages)', retour: 'retour', minimiser: 'minimiser', quoi: 'c\'est quoi ça ? (touche quelque chose)' };
// un koin de coin : un triangle rectangle (l'angle droit dans le coin de l'écran) et ses triangles emboîtés.
// (0.99.7, RS-7 : « les koins bien collés aux coins de l'écran, ça gobe les coins ») : l'angle droit tombe PILE dans le coin de l'écran ;
// c'est l'arrondi de l'iPhone qui le découpe (le koin gobe le coin) ; les triangles intérieurs rentrent pour rester dans l'arrondi (~55 px)
const TRI = (g) => '<svg viewBox="0 0 100 100" aria-hidden="true">' + (g ? '<g transform="translate(100 0) scale(-1 1)">' : '<g>')
  + '<polygon points="0,100 0,0 100,100"/><polygon points="26,74 26,42 58,74"/><polygon points="34,66 34,55 45,66" class="f"/></g></svg>';

/** actions = { koins, temps, xers, carte, tsoin, accueil, toi, retour, minimiser, journal } → fonctions ; actif() : l'option est choisie */
export function creerKoins({ W = globalThis.window, actif = () => false, actions = {}, vibrer = () => {}, calme = () => false }) {
  const D = W.document;
  let racine = null, etape = { gauche: 0, droite: 0 }, cacher = 0, modesOuverts = false;
  const attendre = (f, ms) => (W.setTimeout ? W.setTimeout(f, ms) : setTimeout(f, ms));
  function faire(k) {
    if (k === 'xer') { if (actions.modes) { montrerModes(!modesOuverts); return; } k = 'xers'; }   // la case xer : les xers (les modes), sur place ; sinon mes xers
    const f = actions[k]; replier(); if (f) { vibrer('selection'); try { f(); } catch (e) { /* */ } }
  }
  /** ⊠ les xers dans les cases : un toucher change de mode ; la case xer referme */
  function montrerModes(on) {
    if (!racine) return; modesOuverts = !!on;
    const z = racine.querySelector('.px-koin-modes'); if (!z) return;
    if (on) {
      const l = actions.modes() || [];
      z.innerHTML = l.map(m => '<button type="button" data-koin-mode="' + m.id + '" data-neurone' + (m.on ? ' class="on" aria-current="true"' : '') + ' aria-label="xer ' + m.nom + '">' + G(m.glyphe) + '<small>' + m.nom + '</small></button>').join('');
      vibrer('fx-cran');
    }
    z.hidden = !on; racine.classList.toggle('px-koins-modes', !!on);
  }
  function poser() {
    const on = !!actif();
    D.documentElement.classList.toggle('px-koins', on);
    if (!on) { D.documentElement.classList.remove('px-koins-ouv'); if (racine) { racine.remove(); racine = null; } return; }
    if (racine) { peindreBande(); return; }
    racine = D.createElement('div'); racine.className = 'px-koins-r'; racine.setAttribute('data-neurones', '');   // 〰 (0.93) les cases et la barre : des neurones
    racine.innerHTML = ['gauche', 'droite'].map(c => '<button type="button" class="px-koin px-koin-' + c + '" data-koin="' + c + '" data-etape="0" aria-label="koin ' + c + '">' + TRI(c === 'droite') + '</button>'
      + '<div class="px-koin-cases px-koin-cases-' + c + '" data-cases="' + c + '" hidden>' + CASES[c].map(([g, k]) => (PADS[g]
        ? '<div class="px-koin-pad px-koin-pad-' + g + '" data-pad="' + g + '" data-neurone role="slider" aria-label="' + NOMS[k] + ' (trackpad)"><span class="px-pad-g">' + G(g) + '</span>' + (g === 'wormion' ? '<i data-pad-a></i>' : '<i data-pad-p></i>') + '<i data-pad-onde></i><b data-pad-l></b><small data-pad-s></small></div>'
        : '<button type="button" data-koin-a="' + k + '" data-neurone aria-label="' + NOMS[k] + '">' + G(g) + '<small>' + NOMS[k].split(' (')[0] + '</small><em data-koin-sous="' + k + '"></em></button>')).join('') + '</div>').join('')
      + '<div class="px-koin-modes" data-neurone hidden></div>'
      + '<nav class="px-koin-barre" data-neurone hidden>' + BARRE.map(([g, k, t]) => '<button type="button" data-koin-a="' + k + '" data-court="' + ({ koins: 'koin', carte: 'map', quoi: 'quoi ?', minimiser: '▁' }[k] || k) + '" aria-label="' + NOMS[k] + '">' + (t || G(g)) + '</button>').join('') + '</nav>'
      + '<div class="px-koin-voile" hidden></div>'
      + '<button type="button" class="px-koin-bande" data-koin-bande data-neurone></button>';   // ▭ (0.99.55) la bande « xer » entre les koins
    D.body.appendChild(racine); peindreBande();
    racine.querySelector('[data-koin-bande]').addEventListener('click', (e) => { e.stopPropagation(); ouvrir('gauche', 1); if (actions.modes) montrerModes(true); });
    // un toucher : le koin s'ouvre (ou se referme) ; glisser vers le haut : il suit le doigt, lâcher décide
    for (const b of racine.querySelectorAll('[data-koin]')) {
      let y0 = null, glisse = false, k = 0;
      b.addEventListener('pointerdown', (e) => { y0 = e.clientY; glisse = false; k = 0; try { b.setPointerCapture(e.pointerId); } catch (er) { /* */ } });
      b.addEventListener('pointermove', (e) => {
        if (y0 == null) return; const d = y0 - e.clientY; if (!glisse && d < 12) return;
        if (!glisse) { glisse = true; montrer(true); racine.classList.add('px-koins-glisse'); }
        k = Math.max(0, Math.min(1, d / Math.max(120, (W.innerHeight || 800) * 0.4))); racine.style.setProperty('--k', k.toFixed(3));
      });
      const lacher = () => { if (y0 == null) return; y0 = null; if (!glisse) return; racine.classList.remove('px-koins-glisse'); racine.style.removeProperty('--k'); ouvrir(b.getAttribute('data-koin'), k >= OUVRIR_A ? 1 : 0); };
      b.addEventListener('pointerup', lacher); b.addEventListener('pointercancel', lacher);
      b.addEventListener('click', (e) => { e.stopPropagation(); if (glisse) { glisse = false; return; } const c = b.getAttribute('data-koin'); ouvrir(c, etape[c] ? 0 : 1); });
    }
    racine.addEventListener('click', (e) => {
      const m = e.target.closest('[data-koin-mode]'); if (m) { e.stopPropagation(); const id = m.getAttribute('data-koin-mode'); montrerModes(false); replier(); vibrer('selection'); if (actions.choisirMode) { try { actions.choisirMode(id); } catch (er) { /* */ } } return; }
      const a = e.target.closest('[data-koin-a]'); if (a) { e.stopPropagation(); if (a.dataset.appuiLong === '1') { a.dataset.appuiLong = ''; return; } faire(a.getAttribute('data-koin-a')); }
    });
    // ⊠ l'appui long sur la case xer : mes xers
    const cx = racine.querySelector('[data-cases] [data-koin-a="xer"]'); let tx = 0;
    if (cx) {
      cx.addEventListener('pointerdown', () => { tx = attendre(() => { tx = 0; cx.dataset.appuiLong = '1'; montrerModes(false); replier(); vibrer('appui'); if (actions.xers) actions.xers(); }, 520); });
      const stop = () => { if (tx) { W.clearTimeout(tx); tx = 0; } };
      cx.addEventListener('pointerup', stop); cx.addEventListener('pointercancel', stop); cx.addEventListener('pointerleave', stop);
    }
    racine.querySelector('.px-koin-voile').addEventListener('click', () => replier());
    // ○ □ (0.92) les trackpads : le wormion fait défiler le temps (ce que tu avais ouvert), le portion glisse dans la fractale
    creerPadWormion({ W, el: racine.querySelector('[data-pad="wormion"]'), vibrer, liste: () => (actions.listeTemps ? actions.listeTemps() : []),
      choisir: (id) => { replier(); if (actions.aller) actions.aller(id); }, toucher: () => faire('temps') });
    creerPadPortion({ W, el: racine.querySelector('[data-pad="portion"]'), vibrer, toucher: () => faire('carte'),
      faire: (d) => { replier(); const f = { gauche: actions.precedente, droite: actions.suivante, haut: actions.carte, bas: actions.accueil }[d]; if (f) { vibrer('fx-arrivee'); try { f(); } catch (e) { /* */ } } } });
    // l'appui long sur le tsoin de la barre : le journal (record → rejouer)
    const ts = racine.querySelector('.px-koin-barre [data-koin-a="tsoin"]'); let t = 0;
    ts.addEventListener('pointerdown', () => { t = W.setTimeout(() => { t = -1; replier(); vibrer('appui'); if (actions.journal) actions.journal(); }, 520); });
    ts.addEventListener('pointerup', () => { if (t > 0) W.clearTimeout(t); });
    ts.addEventListener('click', (e) => { if (t === -1) { e.stopPropagation(); e.preventDefault(); t = 0; } }, true);
  }
  /** ▭ la bande entre les koins, sur l'accueil : le xer où tu es (son glyphe, son nom) */
  function peindreBande() {
    const b = racine && racine.querySelector('[data-koin-bande]'); if (!b) return;
    let m = null; try { m = (actions.modes ? actions.modes() : []).find(x => x.on) || null; } catch (e) { m = null; }
    b.innerHTML = m ? G(m.glyphe) + '<span>' + m.nom + '</span>' : G('xer') + '<span>xer</span>';
    b.setAttribute('aria-label', 'xer ' + (m ? m.nom : '') + ' : en changer');
  }
  /** les cases, la barre et le voile dans le DOM (cachés à la fin de la fermeture, pour que l'animation se joue dans les deux sens) */
  function montrer(on) {
    if (cacher) { W.clearTimeout(cacher); cacher = 0; }
    const els = [...racine.querySelectorAll('[data-cases]'), racine.querySelector('.px-koin-barre'), racine.querySelector('.px-koin-voile')];
    if (on) { for (const x of els) x.hidden = false; return; }
    const fin = () => { cacher = 0; if (!racine || etape.gauche) return; for (const x of els) x.hidden = true; montrerModes(false); };
    if (calme()) fin(); else cacher = attendre(fin, 420);
  }
  /** ouvrir (1) ou fermer (0) les koins : les deux s'ouvrent ensemble en deux carrés */
  function ouvrir(c, n) {
    if (!racine) return;
    n = n ? 1 : 0;
    etape.gauche = etape.droite = n;
    D.documentElement.classList.toggle('px-koins-ouv', !!n);   // ▭ la bande et la barre du ploxion s'effacent pendant que le koin est ouvert
    for (const k of ['gauche', 'droite']) racine.querySelector('[data-koin="' + k + '"]').setAttribute('data-etape', String(n));
    if (n) {
      montrer(true);
      for (const em of racine.querySelectorAll('[data-koin-sous]')) { const f = actions['sous_' + em.getAttribute('data-koin-sous')]; let t = ''; try { t = f ? String(f() || '') : ''; } catch (e) { t = ''; } em.textContent = t; }
      // la classe au tour suivant : les cases viennent d'apparaître, la transition (triangle → carré) part de --k = 0
      attendre(() => { if (racine && etape.gauche) racine.classList.add('px-koins-ouverts'); }, 16);
    } else { racine.classList.remove('px-koins-ouverts'); montrer(false); }
    vibrer(n ? 'fx-cran' : 'selection');
  }
  function replier() { if (racine && (etape.gauche || etape.droite)) ouvrir('gauche', 0); else if (modesOuverts) montrerModes(false); }
  return { poser, ouvrir, replier, etape: () => ({ ...etape }), actif: () => !!racine };
}
