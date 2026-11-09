// ⬡ LES ICÔNES DU LABO DANS L'APP (0.82). Le labo (19.10) : « si elle ajoute aussi la lecture de /px/icones.json, tes glyphes dessinés dans
// l'atelier apparaîtront dans l'appli ». /px/icones.json (la coquille du labo le lit avec la session) :
//   tous    { id: xerkion }   les retouches du labo, pour tout le monde (pal, centre, glyphe, style) : par-dessus le registre
//   mien    { id: perso }     tes retouches à toi (même forme que l'atelier de l'app ; celui de l'app passe devant : il est sur l'iPhone)
//   glyphes [{ nom, corps }]  les glyphes dessinés (le corps d'un SVG viewBox 100) : ajoutés aux glyphes de l'app, NETTOYÉS (seulement des
//                             formes et leur géométrie : jamais de script, de lien, de style, d'image, de on…=)
// Lu avec le jeton de la personne (le mode connecté : X-Ploxi0n + Bearer), gardé dans boxion_local « reglages/icones-labo » (hors ligne),
// relu au lancement et à chaque vérification des mises à jour.
import { ajouterGlyphe } from './glyphes.js';
const FORMES = new Set(['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'g']);
const ATTRS = new Set(['d', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'width', 'height', 'x1', 'y1', 'x2', 'y2', 'points', 'transform']);
const VALEUR = /^[-0-9.,\s a-zA-Z()]*$/;   // de la géométrie : nombres, lettres de chemin, rotate(…)/translate(…)

/** le corps d'un glyphe dessiné → seulement ses formes (ou '' s'il n'en reste rien) */
export function nettoyerCorps(corps, W = globalThis.window) {
  const s = String(corps || ''); if (!s || s.length > 12000) return '';
  const doc = new W.DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + s + '</svg>', 'image/svg+xml');
  const racine = doc.documentElement; if (!racine || racine.nodeName !== 'svg' || doc.getElementsByTagName('parsererror').length) return '';
  const sortie = (el) => {
    const nom = String(el.localName || el.nodeName).toLowerCase(); if (!FORMES.has(nom)) return '';
    let a = '';
    for (const at of [...el.attributes]) {
      const k = at.name.toLowerCase(), v = at.value;
      if (ATTRS.has(k) && VALEUR.test(v) && v.length < 4000) a += ' ' + k + '="' + v + '"';
      else if (k === 'class') { const c = v.split(/\s+/).filter(x => x === 'f' || x === 'p'); if (c.length) a += ' class="' + c.join(' ') + '"'; }   // plein, pointillé (la grammaire des glyphes)
    }
    const enfants = nom === 'g' ? [...el.children].map(sortie).join('') : '';
    return nom === 'g' ? (enfants ? '<g' + a + '>' + enfants + '</g>' : '') : '<' + nom + a + '/>';
  };
  return [...racine.children].map(sortie).join('');
}

/** http.get(url, { headers }) → { status, texte } avec le jeton du compte (le relais) ; boxion : le cache */
export function creerIconesLabo({ W = globalThis.window, source = 'https://labo.j0bot.ch', http, boxion, enLigne = () => W.navigator.onLine !== false }) {
  let ico = { tous: {}, mien: {}, glyphes: [] }, sig = '';
  const objet = (o) => (o && typeof o === 'object' && !Array.isArray(o) ? o : {});
  function appliquer(d) {
    if (!d || typeof d !== 'object') return false;
    const glyphes = (Array.isArray(d.glyphes) ? d.glyphes : []).slice(0, 400).map(g => ({ nom: String((g && g.nom) || ''), corps: nettoyerCorps(g && g.corps, W) })).filter(g => g.corps && ajouterGlyphe(g.nom, g.corps));
    ico = { tous: objet(d.tous), mien: objet(d.mien), glyphes };
    const s = JSON.stringify(ico), change = s !== sig; sig = s; return change;
  }
  const pret = boxion.get('reglages', 'icones-labo').then(appliquer).catch(() => {});
  /** relire le labo ; rend vrai si quelque chose a changé (l'accueil se redessine) */
  async function recharger() {
    await pret; if (!enLigne()) return false;
    let r; try { r = await http.get(source + '/px/icones.json', { headers: { Accept: 'application/json' } }); } catch (e) { return false; }
    if (!r || r.status !== 200) return false;
    let d; try { d = JSON.parse(r.texte); } catch (e) { return false; }
    if (!d || d.ok === false) return false;
    const change = appliquer(d);
    if (change) await boxion.put('reglages', 'icones-labo', ico).catch(() => {});
    return change;
  }
  return { pret, recharger, appliquer, tous: (id) => ico.tous[id] || null, mien: (id) => ico.mien[id] || null, glyphes: () => ico.glyphes.map(g => g.nom) };
}
