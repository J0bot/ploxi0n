// ◇ SANS EMOJI (0.54, RS-7 : « les emoji, ça rend l'UI dégueu »). Dans l'interface de l'APP (le dock, les feuilles, les mini docks, et
// ses ploxions internes : réglages, Santé, tsoins, marketplace, la blouse…), chaque emoji d'un texte devient son glyphe du xerboxion
// (src/app/glyphes.js), ou disparaît s'il n'en a pas. Les ploxions du labo gardent leur contenu tel quel. Un seul passage au départ, puis
// seulement ce qui change. ⚙ › Apparence › « Les emoji du labo » coupe tout (prefs.glyphes === false).
import { glyphe, nomDepuisEmoji } from './glyphes.js';

const EMOJI = /(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier})*)(\s?)/gu;
const IGNORER = 'svg,script,style,textarea,input,select,option,[contenteditable],.px-g-e';

// (19.10, le labo) ignorer : un sélecteur de plus à laisser tel quel — ce que les gens ÉCRIVENT (posts, messages, bios) garde ses emojis
// (19.10, le labo) inconnu(emoji) → un SVG pour un emoji hors du dictionnaire (le labo : un glyphe généré, stable) ; sans lui, il disparaît (l'app)
export function installerSansEmoji({ W = globalThis.window, interne = () => true, actif = () => true, ignorer = '', inconnu = null } = {}) {
  const D = W.document, IGN = IGNORER + (ignorer ? ',' + ignorer : '');
  const dansApp = (el) => { const h = el.closest('.px-hote'); return !h || interne(h.dataset.ploxion || ''); };
  function traiter(t) {
    const el = t.parentElement; if (!el || !actif()) return;
    const v = t.data; EMOJI.lastIndex = 0; if (!EMOJI.test(v)) return;
    if (el.closest(IGN) || !dansApp(el)) return;
    const frag = D.createDocumentFragment(); let dernier = 0, m; EMOJI.lastIndex = 0;
    while ((m = EMOJI.exec(v))) {
      frag.append(v.slice(dernier, m.index));
      const n = nomDepuisEmoji(m[1]);
      const g = n ? glyphe(n) : (inconnu ? inconnu(m[1]) : null);
      if (g) { const s = D.createElement('span'); s.className = 'px-g-e'; s.innerHTML = g; frag.append(s); if (m[2]) frag.append(' '); }
      dernier = m.index + m[0].length;
    }
    frag.append(v.slice(dernier));
    t.replaceWith(frag);
  }
  function balayer(n) {
    if (!n) return;
    if (n.nodeType === 3) return traiter(n);
    if (n.nodeType !== 1 || n.matches(IGN)) return;
    const w = D.createTreeWalker(n, 4); const l = []; let t; while ((t = w.nextNode())) l.push(t); l.forEach(traiter);
  }
  if (!D.body) return null;
  balayer(D.body);
  const o = new W.MutationObserver((rs) => { if (!actif()) return; for (const r of rs) { if (r.type === 'characterData') traiter(r.target); else for (const n of r.addedNodes) balayer(n); } });
  o.observe(D.body, { childList: true, subtree: true, characterData: true });
  return { balayer, arreter: () => o.disconnect() };
}
