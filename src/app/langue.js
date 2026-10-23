// ⟡ LA LANGUE DE L'APP (0.99.14, RS-7 : « faut que ça fonctionne avec toutes les langues »). Comme le filtre sans-emoji (src/app/sans-emoji.js) :
// dans l'interface de l'APP (ses écrans, ses ploxions internes), chaque texte, placeholder, aria-label ou title que le dictionnaire connaît
// (src/app/langues.js) passe dans la langue choisie ; ce qu'il ne connaît pas reste en français. Les ploxions du labo gardent leurs textes ;
// ce que les gens écrivent ([data-ecrit]) aussi. Le français d'origine est gardé : changer de langue, ou revenir au français, se fait à chaud.
// En français, rien ne tourne (pas un seul balayage).
import { creerDire } from '../bions/dire.js';
import { DICOS } from './langues.js';

const IGNORER = 'svg,script,style,textarea,select,option,[contenteditable],.px-g-e,[data-ecrit],[translate="no"]';
const ATTRS = ['placeholder', 'aria-label', 'title'];

export function installerLangue({ W = globalThis.window, interne = () => true } = {}) {
  const D = W.document;
  let code = 'fr', dire = null, touche = false;   // touche : on a déjà traduit quelque chose (il faudra pouvoir revenir)
  const textes = new WeakMap(), attributs = new WeakMap();   // nœud → { fr, ecrit } ; élément → { attr: { fr, ecrit } }
  const dansApp = (el) => { const h = el.closest('.px-hote'); return !h || interne(h.dataset.ploxion || ''); };
  const vers = (el, fr) => (dire && !el.closest(IGNORER) && dansApp(el) ? dire(fr) : null);

  function texte(t) {
    const el = t.parentElement; if (!el) return;
    const r = textes.get(t); if (!dire && !r) return;
    const fr = r && t.data === r.ecrit ? r.fr : t.data;   // notre propre écriture, ou un nouveau texte (français) posé par le code
    const v = vers(el, fr), cible = v == null ? fr : v;
    if (v != null || r) { textes.set(t, { fr, ecrit: cible }); touche = true; }
    if (t.data !== cible) t.data = cible;
  }
  function attribut(el, a) {
    const val = el.getAttribute(a); if (val == null) return;
    const rs = attributs.get(el), r = rs && rs[a]; if (!dire && !r) return;
    const fr = r && val === r.ecrit ? r.fr : val;
    const v = el.closest('[data-ecrit],[translate="no"]') || !dansApp(el) || !dire ? null : dire(fr), cible = v == null ? fr : v;
    if (v != null || r) { const o = rs || {}; o[a] = { fr, ecrit: cible }; attributs.set(el, o); touche = true; }
    if (val !== cible) el.setAttribute(a, cible);
  }
  function balayer(n) {
    if (!n || (!dire && !touche)) return;
    if (n.nodeType === 3) return texte(n);
    if (n.nodeType !== 1) return;
    const w = D.createTreeWalker(n, 4); const l = []; let t; while ((t = w.nextNode())) l.push(t); l.forEach(texte);
    for (const a of ATTRS) { if (n.hasAttribute && n.hasAttribute(a)) attribut(n, a); for (const e of n.querySelectorAll('[' + a + ']')) attribut(e, a); }
  }
  let o = null;
  function observer() {
    if (o || !D.body) return;
    o = new W.MutationObserver((rs) => {
      if (!dire && !touche) return;
      for (const r of rs) {
        if (r.type === 'characterData') texte(r.target);
        else if (r.type === 'attributes') attribut(r.target, r.attributeName);
        else for (const n of r.addedNodes) balayer(n);
      }
    });
    o.observe(D.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  /** passer dans une langue ('fr', 'en', 'de', 'it', 'es') : tout ce qui est à l'écran suit tout de suite */
  function appliquer(c) {
    const nouveau = DICOS[c] ? c : 'fr'; if (nouveau === code && (dire || nouveau === 'fr')) return code;
    code = nouveau; dire = code === 'fr' ? null : creerDire(DICOS[code]);
    D.documentElement.lang = code;
    if (dire) observer();
    balayer(D.body);
    if (!dire) touche = false;   // tout est revenu en français : plus rien à suivre
    return code;
  }
  return { appliquer, langue: () => code, balayer, arreter: () => o && o.disconnect() };
}
