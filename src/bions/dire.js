// @bion dire — toutes les langues : la phrase française est la clé (comme gettext), le dictionnaire donne sa traduction ; les nombres passent
// par {n} ; une phrase faite de morceaux « a · b » se traduit morceau par morceau ; les glyphes autour restent ; les néologismes du xerboxion
// ne se traduisent jamais | api: LANGUES, NEOLOGISMES, langueDe, creerDire
// (0.99.14, RS-7 23.10 : « faut que ça fonctionne avec toutes les langues » ; docs/LANGUES.md). Pur, sans DOM : src/app/langue.js le pose
// sur l'interface de l'app (les ploxions du labo gardent leurs textes).

/** [code, nom dans sa langue] ; le français est la base (rien à traduire) */
export const LANGUES = [['fr', 'français'], ['en', 'English'], ['de', 'Deutsch'], ['it', 'italiano'], ['es', 'español']];

/** les mots du xerboxion : comme « logos » en théologie, ils restent tels quels dans toutes les langues */
export const NEOLOGISMES = ['xerboxion', 'ploxion', 'bion', 'cubion', 'koin', 'kion', 'tsoin', 'boxion', 'xer', 'wormion', 'portion', 'terrax', 'mappion', 'nexus', 'chill-tekk', 'xerbot', 'xeroction'];

/** la langue de l'app : le réglage s'il en choisit une, sinon la première langue de l'iPhone qu'on connaît, sinon le français */
export function langueDe(reglage, preferees = []) {
  const ok = new Set(LANGUES.map(l => l[0]));
  if (reglage && reglage !== 'auto' && ok.has(reglage)) return reglage;
  for (const p of preferees || []) { const c = String(p || '').toLowerCase().split(/[-_]/)[0]; if (ok.has(c)) return c; }
  return 'fr';
}

const NOMBRE = '(\\d+(?:[.,]\\d+)?)';
const echapper = (s) => s.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
// ce qui entoure les mots : glyphes, flèches, espaces, ponctuation (« ▦ vitrine », « web, hors ligne › »)
const AUTOUR = /^([^\p{L}\p{N}]*)([\s\S]*?)([^\p{L}\p{N}]*)$/u;

/**
 * dico = { 'phrase française': 'traduction', '{n} lieux autour': '{n} places around', … } (une langue)
 * rend dire(texte) → la traduction, ou null si le texte n'est pas connu (on le laisse tel quel)
 */
export function creerDire(dico = {}) {
  const exact = new Map(), modeles = [];
  for (const [fr, t] of Object.entries(dico || {})) {
    if (typeof t !== 'string' || !t) continue;
    if (fr.includes('{n}')) modeles.push([new RegExp('^' + echapper(fr).replace(/\\?\{n\\?\}/g, NOMBRE) + '$'), t]);
    else exact.set(fr, t);
  }
  const mot = (s) => {
    if (!s) return null;
    if (exact.has(s)) return exact.get(s);
    for (const [re, t] of modeles) { const m = re.exec(s); if (m) { let i = 1; return t.replace(/\{n\}/g, () => m[i++]); } }
    return null;
  };
  const coeur = (s) => {
    const m = AUTOUR.exec(s); if (!m || !m[2]) return null;
    const t = mot(m[2]); return t == null ? null : m[1] + t + m[3];
  };
  return function dire(texte) {
    if (typeof texte !== 'string') return null;
    const s = texte.trim(); if (!s || !/\p{L}/u.test(s)) return null;
    const avant = texte.slice(0, texte.indexOf(s)), apres = texte.slice(texte.indexOf(s) + s.length);
    let t = mot(s) ?? coeur(s);
    if (t == null && s.includes(' · ')) {   // « 3 installé(s) · ↻ à jour tout seul » : morceau par morceau
      let un = false; t = s.split(' · ').map(p => { const x = mot(p) ?? coeur(p); if (x != null) un = true; return x ?? p; }).join(' · ');
      if (!un) t = null;
    }
    return t == null ? null : avant + t + apres;
  };
}
