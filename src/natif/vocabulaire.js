// 📖 LE VOCABULAIRE DU XERBOXION (RS-7 12.10 : « que Siri ait le vocabulaire de xerboxion, comme un dictionnaire à installer : quand je parle,
// ça comprend jamais — et mon téléphone est en anglais »). iOS ne laisse aucune app ajouter des mots à la reconnaissance de Siri ; on corrige
// donc CE QUE SIRI A CRU ENTENDRE : chaque mot du xerboxion avec ses déformations (en français ET en anglais), puis les noms des ploxions
// rapprochés phonétiquement. La reconnaissance avec vocabulaire perso (iOS 17, SFSpeechRecognizer) viendra avec l'écoute dans l'app.
export const MOTS = {
  ploxion: ['ploxion', 'plaxion', 'plexion', 'flexion', 'plotion', 'ploshion', 'plo xion', 'plock sion', 'blocks ion', 'plosion', 'plax ion', 'plucks ion', 'ploxi0n', 'ploxi on', 'plaxi on'],
  ploxions: ['ploxions', 'plaxions', 'plexions', 'flexions', 'plosions'],
  xerboxion: ['xerboxion', 'zerboxion', 'zero box ion', 'zero boxion', 'xer box ion', 'serboxion', 'cerboxion', 'zer box ion', 'zero box', 'sir boxion', 'sur boxion'],
  boxion: ['boxion', 'box ion', 'boxing', 'box yon', 'boxian', 'boxeon'],
  bion: ['bion', 'b ion', 'be on', 'bee on', 'bian', 'byon'],
  bions: ['bions', 'b ions', 'bee ons', 'beyonce'],
  tsoin: ['tsoin', 'soin', 'swan', 'twin', 'tswan', 'ts wan', 'choi', 'swen', 'tsoine', 'swing'],
  tsoins: ['tsoins', 'soins', 'swans', 'twins'],
  koin: ['koin', 'coin', 'coins', 'quoin', 'kwan', 'koine'],
  kion: ['kion', 'key on', 'kyon', 'keon', 'quillon'],
  xer: ['xer', 'zer', 'czar', 'sir', 'zare'],
  xerion: ['xerion', 'zerion', 'serion', 'zirion', 'sirion', 'xer ion', 'syrian'],
  xeroction: ['xeroction', 'zeroction', 'zero action', 'xer oction', 'sero action', 'zero auction', 'zeraction'],
  zion: ['zion', 'xion', 'scion', 'sion', 'zayon'],
  xion: ['xion', 'zion', 'ksion'],
  nexus: ['nexus', 'nexis', 'next us'],
  portion: ['portion', 'porsion', 'potion'],
  stremio: ['stremio', 'streamio', 'stream io', 'stremeo', 'streamyo'],
  marketplace: ['marketplace', 'market place', 'marché', 'magasin', 'store', 'app store'],
  reglages: ['reglages', 'réglages', 'settings', 'parametres', 'paramètres', 'preferences'],
  coord: ['coord', 'cord', 'chord', 'core', 'kord'],
  'pourriture-4': ['pourriture 4', 'pourriture quatre', 'rot four', 'pourriture-4'],
  chaoxion: ['chaoxion', 'chaos ion', 'cow xion', 'kaoxion'],
  'chill-tekk': ['chill tekk', 'chill tech', 'chilltech', 'chill tek'],
};
const sansAccents = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** remplace les déformations par les vrais mots du xerboxion (la plus longue d'abord) */
export function corriger(texte) {
  let t = ' ' + sansAccents(texte).replace(/[^a-z0-9' -]/g, ' ').replace(/\s+/g, ' ') + ' ';
  const paires = [];
  for (const [mot, l] of Object.entries(MOTS)) for (const v of l) paires.push([sansAccents(v), mot]);
  paires.sort((a, b) => b[0].length - a[0].length);
  for (const [v, mot] of paires) t = t.split(' ' + v + ' ').join(' ' + mot + ' ');
  return t.trim();
}

// un rapprochement phonétique grossier (un « soundex » à la française et à l'anglaise) : on garde les consonnes utiles, on fusionne les sons proches
function son(s) {
  return sansAccents(s).replace(/[^a-z0-9]/g, '').replace(/ph/g, 'f').replace(/qu|ck|c(?=[aou])|k/g, 'k').replace(/c/g, 's').replace(/x/g, 'ks').replace(/z/g, 's')
    .replace(/[aeiouy]+/g, 'a').replace(/(.)\1+/g, '$1');
}
function distance(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let p = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; }
  return p[n];
}
/** le ploxion le plus proche de ce qui a été dit (nom ou id, exact, préfixe, contenu, puis phonétique) ; null si rien d'assez proche */
export function trouverPloxion(dit, liste) {
  const q = corriger(dit), qs = q.replace(/[\s-]/g, ''), qson = son(q);
  const cand = liste.map(p => ({ p, n: corriger(p.nom || p.id), i: sansAccents(p.id) }));
  const exact = cand.find(c => c.n === q || c.i === q || c.n.replace(/[\s-]/g, '') === qs || c.i.replace(/-/g, '') === qs); if (exact) return exact.p;
  const pre = cand.find(c => c.n.startsWith(q) || c.i.startsWith(qs)); if (pre) return pre.p;
  const dans = cand.find(c => q.length >= 3 && (c.n.includes(q) || c.i.includes(qs))); if (dans) return dans.p;
  let meilleur = null, score = Infinity;
  for (const c of cand) { const d = Math.min(distance(qson, son(c.n)), distance(qson, son(c.i))) / Math.max(3, qson.length); if (d < score) { score = d; meilleur = c.p; } }
  return score <= 0.34 ? meilleur : null;
}
