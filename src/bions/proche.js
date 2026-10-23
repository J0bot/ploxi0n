// @bion proche — l'ultimate Bluetooth, sa part pure : les paquets entre téléphones proches, l'horloge partagée (un hôte, des répliques),
// la partition de la basse, la position d'un son partagé | api: paquet, lire, ecart, meilleurEcart, partition, notesEntre, freq, positionA, nomDe, GLYPHES_MSG
// (0.99.1, RS-7 23.10 : « ultimate Bluetooth : envoyer des messages en Bluetooth, partager du son ou une basse, un téléphone qui host le son et
// tous les autres qui répliquent, plein de gens avec le même son » ; « je te laisse extrapoler et implémenter toi-même »). docs/ULTIMATE-BLUETOOTH.md.
// Un iPhone n'est jamais une enceinte Bluetooth : on n'envoie pas le SON, on envoie la PARTITION (la basse : tempo, motif, tonique) ou le
// RENDEZ-VOUS (tel son, à telle position, à telle heure de l'hôte), et chaque téléphone joue lui-même, calé sur l'horloge de l'hôte.
// Le tuyau (src/natif/proche-natif.js) : MultipeerConnectivity sur l'iPhone (Bluetooth + Wi-Fi direct, sans internet). Pur, sans DOM.

export const VERSION_PAQUET = 1;
export const TAILLE_MAX = 16000;   // un paquet reste petit : des mots, une partition, un rendez-vous ; jamais du son
const GENRES = new Set(['msg', 'ping', 'pong', 'basse', 'son', 'salut']);

/** un paquet à envoyer : { v, g, d, t } en texte (t = l'heure locale de l'envoi, en ms) */
export function paquet(genre, donnees, t = Date.now()) {
  if (!GENRES.has(genre)) throw new Error('proche : genre inconnu ' + genre);
  const s = JSON.stringify({ v: VERSION_PAQUET, g: genre, d: donnees == null ? null : donnees, t });
  if (s.length > TAILLE_MAX) throw new Error('proche : paquet trop gros (' + s.length + ')');
  return s;
}
/** un paquet reçu → { g, d, t } ou null (abîmé, trop gros, d'une autre version, genre inconnu) : ce qui vient d'à côté n'est pas de confiance */
export function lire(texte) {
  if (typeof texte !== 'string' || texte.length > TAILLE_MAX) return null;
  let o; try { o = JSON.parse(texte); } catch (e) { return null; }
  if (!o || typeof o !== 'object' || o.v !== VERSION_PAQUET || !GENRES.has(o.g)) return null;
  return { g: o.g, d: o.d == null ? null : o.d, t: Number.isFinite(o.t) ? o.t : 0 };
}

/** le nom affiché d'un pair : son identifiant sans le suffixe qui le rend unique (« RS-7·a3f2 » → « RS-7 ») */
export const nomDe = (id) => String(id || '').replace(/·[0-9a-z]{2,8}$/i, '') || '·';

// ---- L'HORLOGE PARTAGÉE (à la NTP) : A envoie ping(t0) ; B le reçoit à t1 et répond pong(t0, t1, t2) ; A le reçoit à t3.
// décalage = ce qu'il faut ajouter à l'heure de A pour avoir celle de B ; aller-retour = le temps du voyage (sans l'attente chez B) ----
export function ecart(t0, t1, t2, t3) {
  return { decalage: ((t1 - t0) + (t2 - t3)) / 2, allerRetour: Math.max(0, (t3 - t0) - (t2 - t1)) };
}
/** parmi les mesures, les plus rapides disent vrai (l'attente du réseau ne fausse qu'un aller-retour long) : la médiane des 3 plus courtes */
export function meilleurEcart(mesures) {
  const l = (mesures || []).filter(m => m && Number.isFinite(m.decalage) && Number.isFinite(m.allerRetour)).sort((a, b) => a.allerRetour - b.allerRetour).slice(0, 3);
  if (!l.length) return null;
  const d = l.map(m => m.decalage).sort((a, b) => a - b);
  return { decalage: d[Math.floor(d.length / 2)], allerRetour: l[0].allerRetour, n: (mesures || []).length };
}

// ---- LA BASSE : une partition, pas du son. Un motif = 16 pas (des doubles croches) ; chaque pas : un degré de la gamme, ou rien ----
export const GAMMES = { mineur: [0, 2, 3, 5, 7, 8, 10], majeur: [0, 2, 4, 5, 7, 9, 11], phrygien: [0, 1, 3, 5, 7, 8, 10], penta: [0, 3, 5, 7, 10] };
// null = silence ; un nombre = un degré (0 = la tonique) ; '+' devant = l'octave du dessus
export const MOTIFS = {
  pulse: [0, null, null, null, 0, null, null, null, 0, null, null, null, 0, null, null, null],
  roule: [0, null, 0, null, 0, null, 0, 2, 0, null, 0, null, 4, null, 3, null],
  tekk: [0, null, null, 0, null, null, 0, null, null, 0, null, null, 4, null, 3, null],
  marche: [0, null, 2, null, 4, null, 2, null, 0, null, 2, null, 4, null, 6, null],
  dub: [0, null, null, null, null, null, 0, null, '+0', null, null, null, 4, null, null, null],
};
/** une partition = { tempo, motif, tonique (midi), gamme, debut (heure de l'HÔTE, ms) } → nettoyée et bornée */
export function partition({ tempo = 120, motif = 'pulse', tonique = 36, gamme = 'mineur', debut = 0, volume = 0.8 } = {}) {
  return { tempo: Math.max(50, Math.min(200, Math.round(+tempo) || 120)), motif: MOTIFS[motif] ? motif : 'pulse', tonique: Math.max(24, Math.min(52, Math.round(+tonique) || 36)),
    gamme: GAMMES[gamme] ? gamme : 'mineur', debut: +debut || 0, volume: Math.max(0, Math.min(1, +volume || 0)) };
}
export const freq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const noteDu = (p, pas) => {
  const x = MOTIFS[p.motif][pas]; if (x == null) return null;
  const haut = typeof x === 'string' && x[0] === '+', deg = haut ? +x.slice(1) : +x, g = GAMMES[p.gamme];
  return p.tonique + (haut ? 12 : 0) + g[deg % g.length] + 12 * Math.floor(deg / g.length);
};
/** les notes à jouer entre de et a (heures de l'HÔTE, ms) : [{ t, midi, duree }] ; la partition tourne en boucle depuis son début */
export function notesEntre(p, de, a) {
  const pas = 60000 / p.tempo / 4, out = [];
  if (!(a > de)) return out;
  let k = Math.max(0, Math.ceil((de - p.debut) / pas - 1e-9));
  for (let t = p.debut + k * pas; t < a && out.length < 256; k++, t = p.debut + k * pas) {
    const m = noteDu(p, k % 16); if (m != null) out.push({ t, midi: m, duree: pas * 0.9 });
  }
  return out;
}

// ---- LE SON PARTAGÉ : un rendez-vous { url, position (s), a (heure de l'HÔTE, ms), joue } → la position où il faut être maintenant ----
export function positionA(r, tHote) {
  if (!r) return 0;
  return Math.max(0, (+r.position || 0) + (r.joue === false ? 0 : (tHote - (+r.a || 0)) / 1000));
}

// les messages d'un geste (le mode humain : des glyphes lisibles par tout le monde, dans toutes les langues)
export const GLYPHES_MSG = ['◉', '○', '△', '♡', '→', '←', '?', '!', '✓', '✕', '♫', '∞'];
