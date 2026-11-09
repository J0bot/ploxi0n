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
// Un toucher sur un koin : il grandit (une étape par toucher, comme sur le carnet) ; à la dernière, les cases. Glisser vers le haut : tout de
// suite les cases. Toucher ailleurs, ou une case : il se replie. Rien n'est caché sans retour : ‹ et ▁ sont dans la barre des glyphes.
import { glyphe as G } from './glyphes.js';
import { creerPadWormion, creerPadPortion } from './pads.js';   // ○ □ (0.92) le wormion et le portion : des trackpads
export const PADS = { wormion: true, portion: true };   // (0.92) ces cases-là sont des trackpads
export const ETAPES = 4;   // 0 replié (petit) · 1 moyen · 2 grand · 3 les cases
export const CASES = { gauche: [['trion', 'koins'], ['wormion', 'temps']], droite: [['xer', 'xers'], ['portion', 'carte']] };
export const BARRE = [['retour', 'retour', '‹'], ['tsoin', 'tsoin', ''], ['wormion', 'temps', ''], ['trion', 'koins', ''], ['portion', 'carte', ''], ['ploxion', 'accueil', ''], ['xeroction', 'toi', ''], ['quoi', 'quoi', 'ⓘ'], ['minimiser', 'minimiser', '▁']];
const NOMS = { koins: 'le koin du ion', temps: 'le temps (ce que tu avais ouvert)', xers: 'mes xers', carte: 'tout le xerboxion', tsoin: 'noter un tsoin', accueil: 'les ploxions', toi: 'toi (compte, réglages)', retour: 'retour', minimiser: 'minimiser', quoi: 'c\'est quoi ça ? (touche quelque chose)' };
// un koin de coin : un triangle rectangle (l'angle droit dans le coin de l'écran) et ses triangles emboîtés.
// (0.99.7, RS-7 : « les koins bien collés aux coins de l'écran, ça gobe les coins ») : l'angle droit tombe PILE dans le coin de l'écran ;
// c'est l'arrondi de l'iPhone qui le découpe (le koin gobe le coin) ; les triangles intérieurs rentrent pour rester dans l'arrondi (~55 px)
const TRI = (g) => '<svg viewBox="0 0 100 100" aria-hidden="true">' + (g ? '<g transform="translate(100 0) scale(-1 1)">' : '<g>')
  + '<polygon points="0,100 0,0 100,100"/><polygon points="26,74 26,42 58,74"/><polygon points="34,66 34,55 45,66" class="f"/></g></svg>';

/** actions = { koins, temps, xers, carte, tsoin, accueil, toi, retour, minimiser, journal } → fonctions ; actif() : l'option est choisie */
export function creerKoins({ W = globalThis.window, actif = () => false, actions = {}, vibrer = () => {}, calme = () => false }) {
  const D = W.document;
  let racine = null, etape = { gauche: 0, droite: 0 };
  function faire(k) { const f = actions[k]; replier(); if (f) { vibrer('selection'); try { f(); } catch (e) { /* */ } } }
  function poser() {
    const on = !!actif();
    D.documentElement.classList.toggle('px-koins', on);
    if (!on) { if (racine) { racine.remove(); racine = null; } return; }
    if (racine) return;
    racine = D.createElement('div'); racine.className = 'px-koins-r'; racine.setAttribute('data-neurones', '');   // 〰 (0.93) les cases et la barre : des neurones
    racine.innerHTML = ['gauche', 'droite'].map(c => '<button type="button" class="px-koin px-koin-' + c + '" data-koin="' + c + '" data-etape="0" aria-label="koin ' + c + '">' + TRI(c === 'droite') + '</button>'
      + '<div class="px-koin-cases px-koin-cases-' + c + '" data-cases="' + c + '" hidden>' + CASES[c].map(([g, k]) => (PADS[g]
        ? '<div class="px-koin-pad px-koin-pad-' + g + '" data-pad="' + g + '" data-neurone role="slider" aria-label="' + NOMS[k] + ' (trackpad)"><span class="px-pad-g">' + G(g) + '</span>' + (g === 'wormion' ? '<i data-pad-a></i>' : '<i data-pad-p></i>') + '<b data-pad-l></b><small data-pad-s></small></div>'
        : '<button type="button" data-koin-a="' + k + '" data-neurone aria-label="' + NOMS[k] + '">' + G(g) + '<small>' + NOMS[k].split(' (')[0] + '</small></button>')).join('') + '</div>').join('')
      + '<nav class="px-koin-barre" data-neurone hidden>' + BARRE.map(([g, k, t]) => '<button type="button" data-koin-a="' + k + '" data-court="' + ({ koins: 'koin', carte: 'map', quoi: 'quoi ?', minimiser: '▁' }[k] || k) + '" aria-label="' + NOMS[k] + '">' + (t || G(g)) + '</button>').join('') + '</nav>'
      + '<div class="px-koin-voile" hidden></div>';
    D.body.appendChild(racine);
    // toucher : une étape de plus ; glisser vers le haut : les cases
    for (const b of racine.querySelectorAll('[data-koin]')) {
      let y0 = null, glisse = false;
      b.addEventListener('pointerdown', (e) => { y0 = e.clientY; glisse = false; });
      b.addEventListener('pointermove', (e) => { if (y0 != null && y0 - e.clientY > 40 && !glisse) { glisse = true; ouvrir(b.getAttribute('data-koin'), ETAPES - 1); } });
      b.addEventListener('pointerup', () => { y0 = null; });
      b.addEventListener('click', (e) => { e.stopPropagation(); if (glisse) { glisse = false; return; } const c = b.getAttribute('data-koin'); ouvrir(c, etape[c] >= ETAPES - 1 ? 0 : etape[c] + 1); });
    }
    racine.addEventListener('click', (e) => { const a = e.target.closest('[data-koin-a]'); if (a) { e.stopPropagation(); faire(a.getAttribute('data-koin-a')); } });
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
  /** un koin à une étape (0 replié … 3 les cases) ; l'autre suit aux cases (les deux carrés du bas) */
  function ouvrir(c, n) {
    if (!racine) return;
    n = Math.max(0, Math.min(ETAPES - 1, n));
    etape[c] = n; if (n === ETAPES - 1 || n === 0) { const o = c === 'gauche' ? 'droite' : 'gauche'; etape[o] = n; }
    for (const k of ['gauche', 'droite']) racine.querySelector('[data-koin="' + k + '"]').setAttribute('data-etape', String(etape[k]));
    const cases = etape.gauche === ETAPES - 1;
    for (const x of racine.querySelectorAll('[data-cases]')) x.hidden = !cases;
    racine.querySelector('.px-koin-barre').hidden = !cases;
    racine.querySelector('.px-koin-voile').hidden = etape.gauche === 0 && etape.droite === 0;
    racine.classList.toggle('px-koins-ouverts', cases);
    vibrer(n ? 'fx-cran' : 'selection');
  }
  function replier() { if (racine && (etape.gauche || etape.droite)) ouvrir('gauche', 0); }
  return { poser, ouvrir, replier, etape: () => ({ ...etape }), actif: () => !!racine };
}
