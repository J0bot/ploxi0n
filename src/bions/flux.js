// @bion flux — les ENTRÉES et les SORTIES d'un ploxion ou d'un bion : lues dans son code, dans les ports de son core (le labo), et les synapses entre deux ploxions qui partagent un canal | api: lireCode, fluxDe, synapsesEntre, court
// (0.98, RS-7 23.10 : « chaque bion et ploxion, il faut les input et output ; ça a été fait dans le xer du labo, copie un peu de là »). Le
// contrat du labo (boxion-rt docs/CORE-UI-BINDING-v0.md) : un core publie ses PORTS (in / out : des topics du bus) ; la vérité vit dans le core,
// le UI n'est qu'une vue. Ici, trois sources, de la plus sûre à la plus devinée :
//   1. les ports du core (src/app/registre-labo.js, un instantané du labo) — déclarés ;
//   2. ce que le code TOUCHE (jOSPorts.emit / on, jOSBoxion, fetch, jOSNatif, jOSTsoin) — lus dans le bundle, sans l'exécuter ;
//   3. ses bions (ce qu'il compose).
// Un canal = « genre:nom » : bus:<topic>, boxion:<ns>, reseau:<hôte>, route:<chemin>, natif:<api>, tsoin:journal. Pur, sans DOM.
const CAPTEURS = /^(gyro|mouvement|orientation|boussole|position|geo|batterie|reseau|sante|pas|photos?|camera|micro|scanner|nfc|ble|bluetooth|maison|lumiere|lire|liste|etat|info|appareil|systeme|meteo|contacts|calendrier|fichiers)/i;

/** ce que le code touche → { entrees: [canal], sorties: [canal] } (sans doublon, 40 au plus de chaque) */
export function lireCode(js = '') {
  const e = new Set(), s = new Set(), t = String(js || '');
  const tous = (re, f) => { re.lastIndex = 0; let m; let n = 0; while ((m = re.exec(t)) && n++ < 400) f(m); };
  tous(/jOSPorts\s*\.\s*emit\(\s*['"`]([\w.-]+)['"`]\s*,\s*['"`]([\w.*-]*)['"`]/g, (m) => s.add('bus:ploxion.' + m[1] + (m[2] ? '.' + m[2] : '')));
  tous(/jOSPorts\s*\.\s*on\(\s*['"`]([\w.*-]+)['"`]/g, (m) => e.add('bus:' + m[1]));
  tous(/jOSBoxion\s*\.\s*(save|saveSoon|set|del)\(\s*['"`]([\w.:-]+)['"`]/g, (m) => s.add('boxion:' + m[2]));
  tous(/jOSBoxion\s*\.\s*(load|lire|get|list)\(\s*['"`]([\w.:-]+)['"`]/g, (m) => e.add('boxion:' + m[2]));
  tous(/fetch\(\s*['"`](https?:\/\/([^/'"`]+))/g, (m) => e.add('reseau:' + m[2]));
  tous(/fetch\(\s*['"`](\/(?:api|px|xion|chat|fs)\/[\w./-]*)/g, (m) => e.add('route:' + m[1].replace(/\/+$/, '')));
  tous(/jOSNatif\s*\.\s*(\w+)/g, (m) => (CAPTEURS.test(m[1]) ? e : s).add('natif:' + m[1]));
  if (/jOSTsoin\s*\.\s*mark\(/.test(t)) s.add('tsoin:journal');
  const l = (x) => [...x].slice(0, 40);
  return { entrees: l(e), sorties: l(s) };
}

/** le flux d'un ploxion : son code, les ports de son core (CORES[id]), ses bions → { entrees: [{ canal, doc, sur }], sorties, bions } ; sur = 'core' | 'code' */
export function fluxDe({ id = '', code = '', bions = [], cores = {} } = {}) {
  const lu = lireCode(code), c = cores[id] || null, vus = new Set();
  const un = (canal, doc, sur) => { const k = canal; if (vus.has(sur[0] + k)) return null; vus.add(sur[0] + k); return { canal, doc: doc || '', sur }; };
  const entrees = [...(c ? c.in.map(([t, d]) => un('bus:' + t, d, 'core')) : []), ...lu.entrees.map(x => un(x, '', 'code'))].filter(Boolean);
  const sorties = [...(c ? c.out.map(([t, d]) => un('bus:' + t, d, 'core')) : []), ...lu.sorties.map(x => un(x, '', 'code'))].filter(Boolean);
  return { id, entrees, sorties, bions: [...new Set(bions || [])] };
}

const corresp = (sortie, entree) => {
  if (sortie === entree) return true;
  const [gs, ns] = sortie.split(/:(.*)/s), [ge, ne] = entree.split(/:(.*)/s);
  if (gs !== ge) return false;
  if (gs === 'bus') { if (ne === '*') return true; if (ne.endsWith('*')) return ns.startsWith(ne.slice(0, -1)); return false; }
  return false;
};
/** les synapses de A vers B : ce que A écrit et que B lit (le bus, le même rangement du boxion) → [{ canal, de, vers }] */
export function synapsesEntre(a, b) {
  const out = [];
  for (const s of a.sorties) for (const e of b.entrees) if (corresp(s.canal, e.canal)) out.push({ canal: s.canal, de: a.id, vers: b.id });
  return out;
}
/** un canal en mots courts : « bus · compteur.inc », « boxion · notes » */
export const court = (canal) => { const [g, n] = String(canal).split(/:(.*)/s); return ({ bus: '⇄', boxion: '▣', reseau: '◎', route: '↗', natif: '◆', tsoin: '⧗' }[g] || '·') + ' ' + (n || g); };
