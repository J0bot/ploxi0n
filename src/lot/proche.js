// ◉ PROCHE : L'ULTIMATE BLUETOOTH (0.99.1, RS-7 23.10 : « envoyer des messages en Bluetooth, partager du son ou une basse, avoir un téléphone
// qui host le son et tous les autres qui répliquent, pour avoir plein de gens avec le même son » ; « je te laisse extrapoler et implémenter »).
// Les téléphones autour, sans internet (src/natif/proche-natif.js : MultipeerConnectivity sur l'iPhone). Trois choses :
//   ✉ les messages : des mots, ou des glyphes d'un geste (le mode humain : lisibles dans toutes les langues) ;
//   ♫ la basse : l'hôte envoie la PARTITION (tempo, motif, tonique, l'heure du début) ; chaque téléphone la joue lui-même, calé sur l'horloge
//     de l'hôte (src/bions/proche.js : ping / pong à la NTP, les plus rapides disent vrai) ;
//   ▶ le son : l'hôte donne un RENDEZ-VOUS (une adresse https, une position, une heure) ; chacun joue sa copie et se recale s'il dérive.
// 〰 (0.99.21, RS-7 : « ça doit être comme bitchat mesh ») les messages passent par le MAILLAGE (src/bions/maille.js) : relayés de téléphone
// en téléphone (sans limite de sauts depuis 0.99.36), gardés pour ceux qui arrivent après, des salons #, des messages privés chiffrés de bout en bout, bloquer, tout
// effacer (trois touchers sur « ◉ proche »), les commandes /j /m /w. La basse et le son restent d'un hôte à ses voisins directs (l'horloge).
// Ne pas nuire : rien n'est annoncé avant « démarrer » ; aucun son ne part chez quelqu'un sans son « rejoindre » ; ce qui vient d'à côté est
// lu comme suspect (paquets bornés, textes échappés, adresses https seulement). La session tient quand on change de ploxion ; ‹ ne la coupe pas.
import { paquet, lire, ecart, meilleurEcart, partition, notesEntre, kicksEntre, freq, positionA, nomDe, GLYPHES_MSG, NOMS_GLYPHES, MOTIFS } from '../bions/proche.js';
import { normaliser } from '../bions/son.js';   // (0.99.10) la basse peut porter le son du synthé (ses 33 réglages)
import { creerMoteur } from './synthe.js';
import { creerMaille, commande, PUBLIC } from '../bions/maille.js';
import { relatif, echelle, ECHELLES, aiguille, tourner, fraicheur, tuilesAutour, ATTRIBUTION, lisserCap, tourCourt, guidage, tendance, minutesAPied, tuilesZone, ajouterTrace } from '../bions/potes.js';
import { creerCacheTuiles } from '../app/carte-tuiles.js';   // ◫ (0.99.29) la carte hors ligne
import { capBoussole, metres, fleche, distance as distanceM } from '../bions/autour.js';
import { qrSvg } from '../bions/qr.js';   // ▣ (0.99.35) la carte d'un pote en QR
import { scannerQr } from '../natif/scanner-qr.js';
import { lireCarte } from '../bions/maille.js';

// (0.99.35, RS-7 : « l'UI de ce ploxion, encore ultra bloat : des sections distinctes, des pages différentes ») cinq pages, une à la fois
export const PAGES = [['autour', '◉', 'autour'], ['messages', '≡', 'messages'], ['potes', '⌖', 'potes'], ['son', '∿', 'son'], ['carte', '▣', 'carte']];

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const httpsSeul = (u) => { try { const x = new URL(String(u)); return x.protocol === 'https:' ? x.href : null; } catch (e) { return null; } };

export function creerProche({ W = globalThis.window, boxion, tuyau, vibrer = () => {}, Contexte = W && (W.AudioContext || W.webkitAudioContext), maintenant = () => Date.now(), position = null, ouvrirLien = null, activite = null }) {
  const e = { nom: '', salle: 'xerboxion', actif: false, moi: null, pairs: new Map(), messages: [],
    basse: null, basseHote: null, son: null, sonHote: null, ecoute: { basse: false, son: false }, erreur: '', salon: PUBLIC, info: '',
    page: null, nonLus: 0, carteEnAttente: null, scan: null };   // (0.99.35) la page ouverte (null : autour si éteint, messages sinon), ce qui est arrivé ailleurs, une carte reçue par un lien
  let moteurSon = null, hote = null, ping = 0, annonce = 0, calage = 0, ordo = 0, ctx = null, audio = null, jusque = 0, peindre = () => {};
  const pret = boxion.get('reglages', 'proche').then(v => { if (v && typeof v === 'object') { e.nom = String(v.nom || ''); e.salle = String(v.salle || 'xerboxion'); } }).catch(() => {});

  // ---- 〰 le maillage : les messages ----
  const C = (W && W.crypto && W.crypto.subtle) ? W.crypto : globalThis.crypto;
  const maille = C && C.subtle ? creerMaille({ subtle: C.subtle, alea: (n) => C.getRandomValues(new Uint8Array(n)), maintenant,
    envoyer: (texte, vers) => { tuyau.envoyer(texte, vers || undefined).catch(() => {}); },
    attente: (ms, f) => W.setTimeout(f, ms), repeter: (ms, f) => { const x = W.setInterval(f, ms); return () => W.clearInterval(x); },
    magasin: { lire: (k) => boxion.get('reglages', 'proche-' + k), ecrire: (k, v) => boxion.put('reglages', 'proche-' + k, v) } }) : null;
  if (maille) maille.surChange((q) => {
    if (q === 'mention' || q === 'messages') notifierNouveaux();   // ◉ (0.99.40) Proche pas à l'écran : une notification (privé, mention)
    if (q === 'mention') { vibrer('fx-arrivee'); return; }   // (0.99.22) « @ton nom »
    if (q === 'positions') { peindre('potes'); return; }
    if (q === 'messages') { const m = maille.fil(e.salon).at(-1); if (m && !m.moi) { vibrer('selection'); if (pageDe() !== 'messages') { e.nonLus++; peindre('onglets'); } } if (e.salon[0] === '@' && vue && pageDe() === 'messages') maille.lire(e.salon); }
    peindre(q === 'messages' || q === 'pairs' ? q : undefined);
    activiteBientot();
  });
  // 🏝 (0.99.43, RS-7 : « pour le ploxion proche, je veux aussi la partie live activity, c'est important ») tant que Proche tourne : l'écran
  // verrouillé et la Dynamic Island disent combien de voisins, si c'est maillé, ce qui est relayé, les non-lus. JAMAIS le texte d'un message
  // (l'écran verrouillé se lit par-dessus l'épaule). activite = { debut(o), maj(o), fin() } (main.js → src/natif/activites.js, clé « proche »).
  let actTexte = '', actMinuteur = 0, actDebut = 0;
  function resumeActivite() {
    const p = maille ? maille.pairs().filter(x => !x.bloque) : [...e.pairs.values()];
    const directs = maille ? p.filter(x => x.direct).length : p.length, loin = p.length - directs;
    let maille2 = false;
    if (maille) { try { const T = maille.topologie(), me = maille.moi().fp; maille2 = T.liens.some(([a, b]) => a !== me && b !== me); } catch (x) { /* */ } }
    const bouts = [directs ? directs + ' voisin' + (directs > 1 ? 's' : '') : 'personne autour'];
    if (loin) bouts.push('+' + loin + ' plus loin');
    if (maille2) bouts.push('maillé');
    if (e.nonLus) bouts.push(e.nonLus + ' non lu' + (e.nonLus > 1 ? 's' : ''));
    if (P.partage) bouts.push('⌖ partagée');
    return { titre: !e.salon || e.salon === '#' ? 'proche' : 'proche · ' + (e.salon[0] === '#' ? e.salon : 'privé'), sous: bouts.join(' · '), glyphe: directs ? 'antenna.radiowaves.left.and.right' : 'antenna.radiowaves.left.and.right.slash',
      debut: actDebut || undefined, compte: directs + loin };
  }
  function activiteBientot() {
    if (!activite || !e.actif || actMinuteur) return;
    actMinuteur = W.setTimeout(() => { actMinuteur = 0; if (!e.actif) return; const r = resumeActivite(); const t = r.titre + '|' + r.sous + '|' + r.glyphe; if (t === actTexte) return; actTexte = t; activite.maj(r).catch(() => {}); }, 3000);   // au plus une mise à jour toutes les 3 s
  }
  let vue = false;   // la page est à l'écran (les « lu » ne partent que si la conversation est vraiment ouverte)
  // ◉ (0.99.40) les notifications : un message privé ou une mention, reçus quand Proche n'est pas à l'écran (ou l'app en arrière-plan) ; une
  // fois chacun ; jamais les miens, ni un message fermé, ni le flot des salons ouverts. Le branchement : api.notifier (main.js → notifs.proche)
  const dejaNotifies = new Set(); let notifierF = null;
  function notifierNouveaux() {
    if (!maille || typeof notifierF !== 'function') return;
    const cache = vue && !(W.document && W.document.hidden) && pageDe() === 'messages';
    for (const m of maille.derniers(10)) {
      if (m.moi || m.texte == null || dejaNotifies.has(m.id) || (Date.now() - m.t > 120000)) continue;
      dejaNotifies.add(m.id); if (dejaNotifies.size > 500) dejaNotifies.delete(dejaNotifies.values().next().value);
      if (cache && e.salon === m.salon) continue;
      const prive = m.salon[0] === '@'; if (!prive && !m.mention) continue;
      notifierF({ titre: (prive ? '◉ ' : '@ ') + (m.nom || 'quelqu\'un') + (prive ? '' : ' · ' + m.salon), texte: m.texte, salon: m.salon, cle: m.id });
    }
  }
  const pageDe = () => e.page || (e.actif ? 'messages' : 'autour');
  /** ▣ (0.99.35) une carte de pote (scannée, ou reçue par ploxi0n://pote…) : ajoutée tout de suite si Proche tourne, sinon au démarrage */
  async function ajouterCarte(texte) {
    if (!maille) return { erreur: 'pas de maillage ici' };
    if (!lireCarte(texte)) { e.info = 'ce QR n\'est pas une carte de pote ploxi0n'; peindre(); return { erreur: e.info }; }
    if (!maille.moi()) { e.carteEnAttente = texte; e.info = '▣ une carte de pote attend : démarre Proche pour l\'ajouter'; peindre(); return { attente: true }; }
    const r = await maille.ajouterCarte(texte);
    e.info = r.erreur ? '▣ ' + r.erreur : '✦ ' + (r.nom || r.fp.slice(0, 4)) + ' est ton pote, vérifié en vrai : messages privés et position chiffrée, même avant qu\'il soit autour';
    vibrer(r.erreur ? 'erreur' : 'succes'); if (!r.erreur && P.partage && P.partage.potes) envoyerPosition(true); peindre(); return r;
  }

  // ---- ⌖ (0.99.22) LES POTES : partager sa position (chiffrée pour ses potes ✦, ou un salon fermé), le radar, la boussole, la carte ----
  // Ne pas nuire : rien ne part sans « partager » ; jamais dans un salon ouvert ; ça s'arrête tout seul (1 h, 4 h) ; « ■ arrêter » efface la
  // position chez les autres ; le bandeau le dit tant que ça dure ; rien n'est gardé sur le disque.
  const P = { partage: null, moi: null, cap: null, cible: null, carte: true, devant: false, duree: 4, erreur: '', dernier: null, envoye: 0,
    rdv: null, zoom: null, guide: true, garde: null, balade: null, baladeVers: null };   // 🏝 (0.99.43) balade : l'empreinte suivie sur l'écran verrouillé ; baladeVers : la dernière position envoyée   // (0.99.29) mon rendez-vous, le zoom du radar à la main (null = auto), le guidage aux vibrations, la carte qu'on garde
  // (0.99.29, RS-7 01.11 : « améliore la map pour le Bluetooth et la boussole à amis ») : les traces des potes (leurs derniers pas, en mémoire
  // seulement), l'historique des distances (« tu te rapproches »), l'aiguille qui tourne par le plus court, le cache des tuiles
  const traces = new Map(), histos = new Map(), tuilesC = creerCacheTuiles({ W, boxion });
  let aigAff = 0, minuteurGuide = 0, derGarde = 0, cleTuiles = '';
  const hhmm = (t) => new Date(t).toTimeString().slice(0, 5);
  const lesPotes = () => (maille && P.moi ? maille.positions().map(x => ({ ...x, r: relatif(P.moi, x) })).sort((a, b) => a.r.d - b.r.d) : []);
  let minuteurPartage = 0, minuteurMoi = 0;
  async function maPosition() {
    if (!position) { P.erreur = 'pas de position ici'; return null; }
    try { const p = await position(); if (!p || !Number.isFinite(+p.lat)) throw new Error('pas de position'); P.moi = { lat: +p.lat, lng: +p.lng, precision: +p.precision || 0 }; P.erreur = ''; return P.moi; }
    catch (x) { P.erreur = 'la position ne vient pas : ' + ((x && x.message) || x) + ' (Réglages iOS › ploxi0n › Position)'; return null; }
  }
  const potesAvecCle = () => (maille ? maille.favoris().filter(f => f.cle).map(f => f.fp) : []);
  const salonFerme = () => (maille && e.salon[0] === '#' && (maille.salons().find(s => s.salon === e.salon) || {}).ferme ? e.salon : null);
  async function envoyerPosition(force = false) {
    if (!P.partage || !maille) return;
    if (maintenant() > P.partage.jusqua) { arreterPartage(); return; }
    const p = await maPosition(); if (!p) { peindre('potes'); return; }
    const bouge = !P.dernier || relatif(P.dernier, p).d > 8;
    if (force || bouge || maintenant() - P.envoye > 60000) {
      P.partage.a = [...new Set([...P.partage.a, ...(P.partage.potes ? potesAvecCle() : [])])];   // un pote ✦ qui s'est annoncé entre-temps
      await maille.partagerPosition({ ...p, cap: P.cap == null ? null : Math.round(P.cap), rdv: P.rdv }, { a: P.partage.a, salon: P.partage.salon }); P.dernier = p; P.envoye = maintenant();
    }
    peindre('potes');
  }
  /** avec : 'potes' (✦, chiffrée pour chacun) ou 'salon' (le salon fermé ouvert) ; heures : 1, 4, ou 0 = jusqu'à ce que j'arrête (12 h au plus) */
  function partagerPosition(avec = 'potes', heures = P.duree) {
    if (!maille || !e.actif) { e.info = 'démarre Proche d\'abord'; peindre(); return false; }
    const salon = avec === 'salon' ? salonFerme() : null, a = avec === 'potes' ? potesAvecCle() : [];
    if (avec === 'salon' && !salon) { e.info = 'un salon FERMÉ d\'abord (/j #soiree un-mot-de-passe) : ta position n\'est jamais partagée dans un salon ouvert'; peindre(); return false; }
    if (avec === 'potes' && !a.length) { e.info = 'aucun pote ✦ allumé pour l\'instant : ✦ quelqu\'un dans la liste (ou /fav @nom), il recevra ta position dès qu\'il s\'annonce'; }
    P.partage = { a, salon, potes: avec === 'potes', jusqua: maintenant() + (heures ? heures : 12) * 3600e3, heures };
    W.clearInterval(minuteurPartage); minuteurPartage = W.setInterval(() => envoyerPosition(false), 15000);
    vibrer('fx-arrivee'); envoyerPosition(true); peindre(); return true;
  }
  function arreterPartage() {
    if (!P.partage) return; const { a, salon } = P.partage; P.partage = null; W.clearInterval(minuteurPartage); minuteurPartage = 0;
    if (maille) maille.partagerPosition({ fin: true }, { a, salon }); P.dernier = null; peindre();
  }
  // le cap de l'iPhone (la boussole) : seulement quand la page est là
  /** (0.99.29) la cible de la boussole : un pote (son empreinte) ou un rendez-vous (« rdv:moi », « rdv:<empreinte> ») */
  function lesRdv() {
    if (!P.moi) return [];
    const l = [], vus = new Set(), ajout = (fp, r, nom, t) => { const k = r.lat.toFixed(4) + ',' + r.lng.toFixed(4); if (vus.has(k)) return; vus.add(k); l.push({ fp, nom, lat: r.lat, lng: r.lng, t, precision: 0, rdv: true, r: relatif(P.moi, r) }); };
    if (P.rdv) ajout('rdv:moi', P.rdv, P.rdv.nom, maintenant());
    for (const x of (maille ? maille.positions() : [])) if (x.rdv) ajout('rdv:' + x.fp, x.rdv, x.rdv.nom + ' · ' + (x.nom || '?'), x.t);
    return l;
  }
  const laCible = () => { if (!P.cible || !P.moi) return null; const l = [...lesPotes(), ...lesRdv()]; return l.find(x => x.fp === P.cible) || null; };
  /** le guidage aux vibrations : la flèche droit devant (± 20°) → un tic, plus serré à mesure qu'on approche ; les yeux libres */
  function guider() {
    W.clearTimeout(minuteurGuide); minuteurGuide = 0;
    if (!vue || !P.cible || !P.guide) return;
    const x = laCible(), g = x && P.cap != null && x.r.d >= Math.max(15, x.precision || 0) ? guidage(x.r.d, aiguille(x.r.cap, P.cap)) : null;
    if (g) vibrer('fx-cran');
    minuteurGuide = W.setTimeout(guider, g ? g.intervalle : 500);
  }
  /** ⤓ garder la carte du coin (1,5 km) : pour l'avoir sans réseau, en soirée */
  async function garderCarte() {
    if (P.garde) return;
    const m = P.moi || await maPosition(); if (!m) { peindre('potes'); return; }
    const l = tuilesZone(m.lat, m.lng); P.garde = { fait: 0, total: l.length, echecs: 0 }; peindre('potes');
    const r = await tuilesC.garder(l, { surProgres: (q) => { P.garde = q; const t = maintenant(); if (t - derGarde > 250) { derGarde = t; peindre('potes'); } }, arreter: () => !vue });
    P.garde = null; cleTuiles = '';
    e.info = r.echecs >= r.total ? '◫ la carte ne vient pas (pas de réseau ?)' : '◫ la carte du coin est gardée (' + (r.total - r.echecs) + ' tuiles) : elle s\'affiche aussi sans réseau';
    vibrer(r.echecs >= r.total ? 'erreur' : 'succes'); peindre();
  }
  /** 🏝 (0.99.43) la boussole sur l'écran verrouillé et la Dynamic Island (la balade de PloxiVeille) : vers le pote ou le rendez-vous choisi */
  async function baladePote() {
    const B = W.jOSVeille && W.jOSVeille.balade; if (!B) return;
    const x = P.cible && [...lesPotes(), ...lesRdv()].find(y => y.fp === P.cible);
    try {
      if (P.balade && (!x || P.balade === x.fp)) { await B.fin(); P.balade = null; P.baladeVers = null; }
      else if (x) {
        const cible = { nom: (x.rdv ? '◎ ' : '') + (x.nom || '?'), lat: x.lat, lng: x.lng };
        if (P.balade) await B.cible(cible); else await B.debut({ titre: x.rdv ? 'rendez-vous' : 'vers un pote', ploxion: 'proche', cible });
        P.balade = x.fp; P.baladeVers = { lat: x.lat, lng: x.lng }; P.info = '';
      }
      vibrer('selection');
    } catch (err) { P.erreur = '🏝 ' + ((err && err.message) || 'impossible'); W.setTimeout(() => { P.erreur = ''; peindre('potes'); }, 4000); }
    peindre('potes');
  }
  /** ◎ un rendez-vous là où je suis : il part avec ma position, chiffré, à ceux avec qui je la partage */
  async function poserRdv() {
    if (P.rdv) { P.rdv = null; vibrer('selection'); envoyerPosition(true); peindre('potes'); return; }
    if (!P.partage) { e.info = 'partage ta position d\'abord : le rendez-vous part avec elle, seulement à tes potes ✦ (ou ton salon fermé)'; peindre(); return; }
    const m = await maPosition(); if (!m) { peindre('potes'); return; }
    P.rdv = { lat: m.lat, lng: m.lng, nom: 'ici · ' + hhmm(maintenant()) }; vibrer('fx-arrivee'); envoyerPosition(true); peindre('potes');
  }
  // (0.99.29) lissé : la boussole d'iOS tremble, l'aiguille ne doit pas
  let derCap = 0; const surCap = (ev) => { const c = capBoussole(ev); if (c == null) return; P.cap = lisserCap(P.cap, c); const t = maintenant(); if (t - derCap > 120) { derCap = t; peindre('potes'); } };

  // ---- l'horloge : l'heure de l'hôte, vue d'ici ----
  const decalage = (id) => { const p = e.pairs.get(id); return p && p.ecart ? p.ecart.decalage : 0; };
  const heureDe = (id) => (id && id !== e.moi ? maintenant() + decalage(id) : maintenant());
  const envoyer = (g, d, a) => tuyau.envoyer(paquet(g, d, maintenant()), a).catch(() => ({ envoyes: 0 }));
  const sonder = () => { for (const [id, p] of e.pairs) if (p.etat === 'connecte') envoyer('ping', { t0: maintenant() }, [id]); };

  function surPaquet({ de, donnees }) {
    if (maille && de && maille.recevoir(de, donnees)) return;   // 〰 un paquet du maillage
    const m = lire(donnees); if (!m || !de) return;
    const t = maintenant();
    if (!e.pairs.has(de)) e.pairs.set(de, { etat: 'connecte', mesures: [], ecart: null });
    const p = e.pairs.get(de);
    if (m.g === 'ping' && m.d && Number.isFinite(m.d.t0)) { envoyer('pong', { t0: m.d.t0, t1: t, t2: maintenant() }, [de]); return; }
    if (m.g === 'pong' && m.d && [m.d.t0, m.d.t1, m.d.t2].every(Number.isFinite)) {
      p.mesures.push(ecart(m.d.t0, m.d.t1, m.d.t2, t)); if (p.mesures.length > 12) p.mesures.shift(); p.ecart = meilleurEcart(p.mesures); peindre('pairs'); return; }
    if (m.g === 'msg' && m.d && typeof m.d.texte === 'string') { ajouterMessage({ de, texte: m.d.texte.slice(0, 500), t }); vibrer('selection'); return; }
    if (m.g === 'basse') {
      if (m.d == null) { if (e.basseHote === de) { e.basse = null; e.basseHote = null; couperBasse(); peindre(); } return; }
      if (hote === 'basse') return;   // on joue déjà la nôtre
      const neuf = !e.basse || e.basseHote !== de; e.basse = { ...partition(m.d), son: m.d.son && typeof m.d.son === 'object' ? normaliser(m.d.son) : null }; e.basseHote = de; if (neuf) { vibrer('fx-arrivee'); peindre(); } return; }
    if (m.g === 'son') {
      if (m.d == null) { if (e.sonHote === de) { e.son = null; e.sonHote = null; couperSon(); peindre(); } return; }
      if (hote === 'son') return;
      const url = httpsSeul(m.d.url); if (!url) return;
      const neuf = !e.son || e.sonHote !== de || e.son.url !== url;
      e.son = { url, position: +m.d.position || 0, a: +m.d.a || 0, joue: m.d.joue !== false }; e.sonHote = de; if (neuf) { vibrer('fx-arrivee'); peindre(); } return; }
  }
  function surPair({ id, etat, message }) {
    if (etat === 'erreur') { e.erreur = message || 'le Bluetooth ne répond pas'; peindre(); return; }
    if (!id || id === e.moi) return;
    if (maille && (etat === 'connecte' || etat === 'perdu')) maille.voisin(id, etat);
    if (etat === 'perdu') { e.pairs.delete(id); if (e.basseHote === id) { e.basse = null; e.basseHote = null; couperBasse(); } if (e.sonHote === id) { e.son = null; e.sonHote = null; couperSon(); } }
    else { const p = e.pairs.get(id) || { mesures: [], ecart: null }; p.etat = etat; e.pairs.set(id, p);
      if (etat === 'connecte') { vibrer('selection'); envoyer('ping', { t0: maintenant() }, [id]); W.setTimeout(() => { annoncer(); sonder(); }, 300); } }
    peindre();
  }
  tuyau.surMessage(surPaquet); tuyau.surPair(surPair);

  function ajouterMessage(m) { e.messages.push(m); if (e.messages.length > 80) e.messages.shift(); boxion.put('reglages', 'proche-messages', e.messages.slice(-40)).catch(() => {}); peindre('messages'); }
  boxion.get('reglages', 'proche-messages').then(l => { if (Array.isArray(l) && !e.messages.length) e.messages = l.slice(-40); }).catch(() => {});

  let offOndes = null;
  async function demarrer({ nom, salle } = {}) {
    if (nom != null) e.nom = String(nom).slice(0, 24); if (salle != null) e.salle = String(salle).slice(0, 40) || 'xerboxion';
    boxion.put('reglages', 'proche', { nom: e.nom, salle: e.salle }).catch(() => {});
    e.erreur = '';
    if (maille) { try { await maille.demarrer({ nom: e.nom || 'ploxion' }); } catch (x) { e.erreur = 'le maillage ne démarre pas : ' + ((x && x.message) || x); } }
    try { const r = await tuyau.demarrer({ nom: e.nom || 'ploxion', salle: e.salle }); e.moi = r.moi; e.actif = true; if (activite) { actDebut = maintenant(); const a = resumeActivite(); actTexte = a.titre + '|' + a.sous + '|' + a.glyphe; activite.debut(a).catch(() => {}); } }
    catch (x) { e.erreur = (x && x.message) || 'impossible de démarrer'; e.actif = false; peindre(); return false; }
    W.clearInterval(ping); ping = W.setInterval(sonder, 4000);
    // ᛒ (0.99.20) le Bluetooth bas niveau : ce téléphone s'annonce comme un ploxi, et voit les ploxis à portée AVANT qu'ils soient connectés
    const O = W && W.jOSOndes;
    if (O) { try { await O.annoncer(e.nom || 'ploxion'); await O.scanner(); if (!offOndes) offOndes = O.sur((v) => { if (v.ploxi) peindre('pairs'); }); } catch (x) { /* Proche vit sans */ } }
    if (e.carteEnAttente) { const c = e.carteEnAttente; e.carteEnAttente = null; ajouterCarte(c); }
    vibrer('fx-arrivee'); peindre(); return true;
  }
  async function arreter() {
    if (hote === 'basse') arreterBasse(); if (hote === 'son') arreterSon();
    W.clearInterval(ping); couperBasse(); couperSon(); e.ecoute = { basse: false, son: false };
    arreterPartage();
    if (maille) maille.arreter();
    if (W && W.jOSOndes) { W.jOSOndes.arreterAnnonce(); W.jOSOndes.arreter(); } if (offOndes) { offOndes(); offOndes = null; }
    if (activite) { W.clearTimeout(actMinuteur); actMinuteur = 0; actTexte = ''; activite.fin().catch(() => {}); }
    await tuyau.arreter(); e.actif = false; e.pairs.clear(); e.basse = e.son = e.basseHote = e.sonHote = null; peindre();
  }
  // 〰 un message, ou une commande (/j #salon [mot de passe] · /m @nom texte · /w · /bloquer @nom · /debloquer · /quitter · /effacer)
  function envoyerMessage(texte) {
    const t = String(texte || '').trim().slice(0, 1000); if (!t || !e.actif) return false;
    if (!maille) { envoyer('msg', { texte: t }); ajouterMessage({ de: e.moi, texte: t, t: maintenant(), moi: true }); return true; }
    const c = commande(t); e.info = '';
    if (c.genre === 'texte') { if (e.salon[0] === '@') { maille.prive(e.salon.slice(1), c.texte).then(id => { if (!id) { e.info = 'pas encore sa clé : il doit être allumé, quelque part dans le maillage'; peindre(); } }); } else maille.dire(c.texte, e.salon); return true; }
    if (c.genre === 'mp') { const fp = maille.trouver(c.a); if (!fp) { e.info = 'personne ne s\'appelle « ' + c.a + ' » autour'; peindre(); return false; } e.salon = '@' + fp; maille.prive(fp, c.texte); peindre(); return true; }
    if (c.genre === 'rejoindre') { maille.rejoindre(c.salon, c.mdp).then(() => { e.salon = c.salon; e.info = c.mdp ? c.salon + ' : fermé par un mot de passe' : ''; peindre(); }); return true; }
    if (c.genre === 'quitter') { maille.quitter(c.salon || e.salon); e.salon = PUBLIC; peindre(); return true; }
    if (c.genre === 'qui') { const l = maille.pairs(); e.info = l.length ? l.map(p => p.nom + '#' + p.fp.slice(0, 4) + (p.direct ? ' (direct)' : ' (' + p.sauts + ' saut' + (p.sauts > 1 ? 's' : '') + ')')).join(' · ') : 'personne dans le maillage'; peindre(); return true; }
    if (c.genre === 'bloquer') { const fp = maille.bloquer(c.a); e.info = fp ? '⊘ ' + c.a + ' bloqué' : 'personne de ce nom'; peindre(); return !!fp; }
    if (c.genre === 'bloques') { e.info = 'bloqués : ' + (maille.pairs().filter(p => p.bloque).map(p => p.nom).join(', ') || 'personne'); peindre(); return true; }
    if (c.genre === 'debloquer') { maille.debloquer(c.a); e.info = c.a + ' débloqué'; peindre(); return true; }
    if (c.genre === 'effacer') { effacerTout(); return true; }
    if (c.genre === 'favori') { const fp = maille.favori(c.a, c.oui); e.info = fp ? (c.oui ? '✦ ' + c.a + ' est un pote : il voit ta position quand tu la partages avec tes potes' : c.a + ' n\'est plus un pote') : 'personne de ce nom'; peindre(); return !!fp; }
    if (c.genre === 'favoris') { e.info = 'tes potes ✦ : ' + (maille.favoris().map(f => f.nom + (f.la ? '' : ' (pas là)')).join(', ') || 'personne'); peindre(); return true; }
    if (c.genre === 'code') { const fp = maille.trouver(c.a); if (!fp) { e.info = 'personne de ce nom'; peindre(); return false; } maille.codeSecurite(fp).then(code => { e.info = code ? 'le code avec ' + c.a + ' : ' + code + ' — le même chez lui ? alors personne ne s\'est glissé entre vous' : 'pas encore sa clé'; peindre(); }); return true; }
    e.info = c.texte; peindre(); return false;
  }
  /** (0.99.21) partager un son du synthé dans le maillage (le salon ou la conversation ouverts) */
  function partagerSon(son) {
    if (!maille || !e.actif || !son || !son.p) return false;
    const texte = '♫ ' + String(son.nom || 'un son').slice(0, 30) + (son.motif ? ' · ' + son.motif : '') + ' · ' + Math.round(son.p.tempo || 0) + ' bpm';
    if (e.salon[0] === '@') maille.prive(e.salon.slice(1), texte, { son }); else maille.dire(texte, e.salon, { son });
    return true;
  }
  async function effacerTout() { if (!maille) return; arreterPartage(); e.messages = []; boxion.put('reglages', 'proche-messages', []).catch(() => {}); await maille.effacerTout(); e.salon = PUBLIC; e.info = 'tout effacé : une nouvelle empreinte, plus aucun message'; vibrer('fx-butee'); peindre(); }
  /** le fil affiché : le maillage, et sur le public les messages des Proche d'avant (un seul saut) */
  const fil = (salon = e.salon) => {
    const l = maille ? maille.fil(salon).map(m => ({ id: m.id, de: m.de, nom: m.nom, texte: m.texte, t: m.t, moi: !!m.moi, sauts: m.sauts, etat: m.etat, ferme: m.ferme, prive: m.prive, son: m.son || null, mention: !!m.mention })) : [];
    return salon === PUBLIC ? [...e.messages.map(m => ({ ...m, nom: nomDe(m.de) })), ...l].sort((a, b) => a.t - b.t) : l;
  };

  // ---- héberger : une annonce répétée (les retardataires la reçoivent aussi) ----
  function annoncer() {
    if (hote === 'basse' && e.basse) envoyer('basse', e.basse);
    if (hote === 'son' && e.son) envoyer('son', e.son);
  }
  const relancerAnnonce = () => { W.clearInterval(annonce); if (hote) annonce = W.setInterval(annoncer, 3000); };
  function hebergerBasse(o = {}) {
    if (!e.actif) return null;
    if (hote === 'son') arreterSon();
    const garder = hote === 'basse' && e.basse;   // changer le tempo ou le motif garde le début : tout le monde reste calé
    const son = o.son ? normaliser(o.son) : (garder ? e.basse.son : null) || null;   /* (0.99.10) le son du synthé, partagé */
    e.basse = { ...partition({ ...(garder ? e.basse : {}), ...o, debut: garder ? e.basse.debut : maintenant() + 600 }), son };
    hote = 'basse'; e.basseHote = e.moi; annoncer(); relancerAnnonce(); jouerBasse(); peindre(); return e.basse;
  }
  function arreterBasse() { if (hote !== 'basse') return; hote = null; envoyer('basse', null); W.clearInterval(annonce); e.basse = null; e.basseHote = null; couperBasse(); peindre(); }
  function hebergerSon(url) {
    const u = httpsSeul(url); if (!e.actif || !u) return null;
    if (hote === 'basse') arreterBasse();
    e.son = { url: u, position: 0, a: maintenant() + 1200, joue: true }; hote = 'son'; e.sonHote = e.moi;
    annoncer(); relancerAnnonce(); jouerSon(); peindre(); return e.son;
  }
  function pauseSon() {   // l'hôte met en pause ou relance : un nouveau rendez-vous
    if (hote !== 'son' || !e.son) return;
    const t = maintenant(), pos = positionA(e.son, t);
    e.son = e.son.joue ? { ...e.son, position: pos, a: t, joue: false } : { ...e.son, position: pos, a: t + 600, joue: true };
    annoncer(); peindre();
  }
  function arreterSon() { if (hote !== 'son') return; hote = null; envoyer('son', null); W.clearInterval(annonce); e.son = null; e.sonHote = null; couperSon(); peindre(); }
  function rejoindre(quoi) { if (quoi === 'basse' && e.basse) { e.ecoute.basse = true; jouerBasse(); } if (quoi === 'son' && e.son) { e.ecoute.son = true; jouerSon(); } peindre(); }
  function quitter(quoi) { if (quoi === 'basse') { e.ecoute.basse = false; couperBasse(); } if (quoi === 'son') { e.ecoute.son = false; couperSon(); } peindre(); }

  // ---- la basse jouée ici : un ordonnanceur à fenêtre (250 ms d'avance), deux oscillateurs, un filtre qui claque ----
  function contexte() { if (!ctx && Contexte) { try { ctx = new Contexte(); } catch (x) { ctx = null; } } if (ctx && ctx.state === 'suspended' && ctx.resume) ctx.resume().catch(() => {}); return ctx; }
  function note(c, quand, f, duree, vol) {
    const o = c.createOscillator(), s = c.createOscillator(), fl = c.createBiquadFilter(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.value = f; s.type = 'sine'; s.frequency.value = f / 2;
    fl.type = 'lowpass'; fl.Q.value = 6; fl.frequency.setValueAtTime(1400, quand); fl.frequency.exponentialRampToValueAtTime(120, quand + duree);
    g.gain.setValueAtTime(0.0001, quand); g.gain.exponentialRampToValueAtTime(0.5 * vol, quand + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, quand + duree);
    o.connect(fl); s.connect(fl); fl.connect(g); g.connect(c.destination);
    o.start(quand); s.start(quand); o.stop(quand + duree + 0.02); s.stop(quand + duree + 0.02);
  }
  function jouerBasse() {
    const c = contexte(); if (!c) return; W.clearInterval(ordo); jusque = 0;
    ordo = W.setInterval(() => {
      const ici = hote === 'basse' || e.ecoute.basse; if (!e.basse || !ici) return;
      const tH = heureDe(e.basseHote), de = Math.max(tH, jusque), a = tH + 250;
      // (0.99.10) le son du synthé s'il est partagé (le même moteur, les mêmes 33 réglages, chez tout le monde) ; sinon la petite basse
      if (e.basse.son && !moteurSon) moteurSon = creerMoteur(c, () => (e.basse && e.basse.son) || normaliser({}));
      for (const n of notesEntre(e.basse, de, a)) {
        const q = c.currentTime + Math.max(0, (n.t - tH) / 1000);
        if (e.basse.son && moteurSon) { const id = moteurSon.debut(n.midi, q); moteurSon.fin(id, q + Math.max(0.03, (60 / e.basse.tempo / 4) * (e.basse.son.gate || 0.6))); }
        else note(c, q, freq(n.midi), n.duree / 1000, e.basse.volume);
      }
      if (e.basse.son && moteurSon && e.basse.son.kick > 0.01) for (const tk of kicksEntre(e.basse, de, a)) moteurSon.kick(c.currentTime + Math.max(0, (tk - tH) / 1000));   // (0.99.21) le kick partagé
      jusque = a;
    }, 60);
  }
  function couperBasse() { W.clearInterval(ordo); ordo = 0; jusque = 0; if (moteurSon) moteurSon.toutCouper(); }

  // ---- le son joué ici : chacun sa copie, recalée toutes les 250 ms (au-delà de 80 ms de dérive) ----
  function jouerSon() {
    if (!e.son || !W.document) return;
    if (!audio) { audio = W.document.createElement('audio'); audio.preload = 'auto'; audio.setAttribute('playsinline', ''); }
    if (audio.getAttribute('src') !== e.son.url) audio.src = e.son.url;
    W.clearInterval(calage);
    calage = W.setInterval(() => {
      const ici = hote === 'son' || e.ecoute.son; if (!e.son || !ici || !audio) return;
      if (audio.getAttribute('src') !== e.son.url) audio.src = e.son.url;
      const tH = heureDe(e.sonHote), cible = positionA(e.son, tH);
      if (!e.son.joue || tH < e.son.a) { if (!audio.paused) audio.pause(); if (Math.abs((audio.currentTime || 0) - cible) > 0.08) { try { audio.currentTime = cible; } catch (x) { /* pas encore chargé */ } } return; }
      if (Math.abs((audio.currentTime || 0) - cible) > 0.08) { try { audio.currentTime = cible; } catch (x) { /* */ } }
      if (audio.paused) { const p = audio.play(); if (p && p.catch) p.catch(() => {}); }
    }, 250);
  }
  function couperSon() { W.clearInterval(calage); calage = 0; if (audio) { try { audio.pause(); } catch (x) { /* */ } } }

  // ---- la page ----
  function mount(hoteEl, o) {
    let vivant = true;
    const directs = () => [...e.pairs].map(([id, p]) => '<span class="px-pr-pair' + (p.etat === 'connecte' ? ' on' : '') + '" data-neurone>◉ ' + esc(nomDe(id))
      + (p.ecart ? ' <small>' + (p.ecart.allerRetour < 1 ? '<1' : Math.round(p.ecart.allerRetour)) + ' ms</small>' : p.etat === 'connexion' ? ' <small>…</small>' : '') + '</span>').join('');
    // 〰 le maillage : qui est là, à combien de sauts ; ✉ lui écrire en privé, ⊘ le bloquer
    const loin = () => (maille ? maille.pairs().filter(p => !p.direct).map(p => '<span class="px-pr-pair px-pr-loin' + (p.bloque ? ' bloque' : '') + '" data-neurone>○ ' + esc(p.nom || '?') + '<small>#' + p.fp.slice(0, 4) + ' · ' + p.sauts + ' saut' + (p.sauts > 1 ? 's' : '') + '</small></span>').join('') : '');
    // ᛒ (0.99.20, la branche xerbot-ledfx) les ploxis vus en Bluetooth bas niveau, à portée, avant même d'être reliés
    const ondes = () => ((W && W.jOSOndes) ? W.jOSOndes.appareils().filter(v => v.ploxi).slice(0, 12).map(v => '<span class="px-pr-pair">ᛒ ' + esc(v.nom || 'ploxi') + ' <small>~' + v.distance + ' m</small></span>').join('') : '');
    // ◈ (0.99.37) LA CARTE DU MAILLAGE : moi au centre, mes voisins directs autour, les autres plus loin (un anneau par saut, 3 au plus) ;
    // un trait = un lien direct (le mien, ou celui qu'un nœud annonce) ; ◌ = un relais qui ne s'annonce pas ; sous chaque voisin direct,
    // les paquets qu'il m'a fait passer pour d'autres (la preuve qu'il route)
    const carteMailleHtml = () => {
      if (!maille || !maille.moi()) return '';
      const T = maille.topologie(); if (T.noeuds.length < 2) return '';
      const S = 320, c = S / 2, R = [0, 62, 108, 146], pos = new Map(), anneaux = [[], [], [], []];
      for (const n of T.noeuds) { if (n.moi) { pos.set(n.id, [c, c]); continue; } anneaux[n.direct ? 1 : Math.min(3, 1 + Math.max(1, n.sauts || 1))].push(n); }
      anneaux.forEach((l, k) => l.forEach((n, i) => { const a = (i / l.length) * 2 * Math.PI - Math.PI / 2 + k * 0.4; pos.set(n.id, [Math.round(c + R[k] * Math.cos(a)), Math.round(c + R[k] * Math.sin(a))]); }));
      let svg = '<svg viewBox="0 0 ' + S + ' ' + S + '" class="px-pr-maille-svg" role="img" aria-label="la carte du maillage">';
      for (let k = 1; k < 4; k++) if (anneaux[k].length) svg += '<circle class="anneau" cx="' + c + '" cy="' + c + '" r="' + R[k] + '"/>';
      for (const [a, b] of T.liens) { const p1 = pos.get(a), p2 = pos.get(b); if (p1 && p2) svg += '<line class="lien" x1="' + p1[0] + '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] + '"/>'; }
      for (const n of T.noeuds) { const [x, y] = pos.get(n.id); const cl = n.moi ? 'moi' : n.muet ? 'muet' : n.direct ? 'direct' : 'loin';
        const nom = n.moi ? 'toi' : n.muet ? 'relais' : (n.nom || n.id.slice(0, 4));
        svg += '<g class="noeud ' + cl + '"><circle cx="' + x + '" cy="' + y + '" r="' + (n.moi ? 9 : 7) + '"/><text x="' + x + '" y="' + (y - 12) + '" text-anchor="middle">' + esc(nom.slice(0, 12)) + '</text>'
          + (n.stats && n.stats.relayes ? '<text class="relais" x="' + x + '" y="' + (y + 19) + '" text-anchor="middle">↝' + n.stats.relayes + '</text>' : '') + '</g>'; }
      const me = maille.moi().fp, nb = T.noeuds.length - 1, maille2 = T.liens.some(([a, b]) => a !== me && b !== me);
      const tr = maille.transit(), enRoute = tr.boite || tr.sacoche ? '<p class="px-pr-transit">✉ en route : ' + [tr.boite ? tr.boite + ' de tes messages pas encore remis' : '', tr.sacoche ? tr.sacoche + ' porté' + (tr.sacoche > 1 ? 's' : '') + ' pour d\'autres (tu les remets en les croisant)' : ''].filter(Boolean).join(' · ') + '</p>' : '';
      return '<div class="px-pr-maille" data-neurone>' + svg + '</svg>' + enRoute + '<p class="px-sous">' + nb + ' nœud' + (nb > 1 ? 's' : '') + ' · ' + T.liens.length + ' lien' + (T.liens.length > 1 ? 's' : '')
        + (maille2 ? ' · maillé : des nœuds sont reliés entre eux, pas seulement à toi' : T.liens.length ? ' · en étoile : tout passe par toi' : '') + ' · ↝ = paquets relayés pour d\'autres</p></div>';
    };
    // (0.99.35) une ligne par personne, ses actions dessus : ✦ pote, écrire (en privé, chiffré), ⊘ bloquer ; ce qui est vu en ᛒ mais pas encore relié en dessous
    const pairsHtml = () => {
      const ond = (W && W.jOSOndes) ? W.jOSOndes.appareils().filter(v => v.ploxi).slice(0, 12) : [];
      const l = maille ? maille.pairs() : [];
      const muets = maille ? maille.topologie().noeuds.filter(n => n.muet).length : 0;
      if (!l.length && !e.pairs.size && !ond.length && !muets) return '<p class="px-sous">' + (e.actif ? 'personne autour pour l\'instant, dans la salle « ' + esc(e.salle) + ' » ; les autres ouvrent Proche, même salle, et démarrent' : 'éteint : personne ne te voit') + '</p>';
      if (!maille) return directs() + ond.map(v => '<span class="px-pr-pair">ᛒ ' + esc(v.nom || 'ploxi') + ' <small>~' + v.distance + ' m</small></span>').join('');
      const ms = (p) => { const d = [...e.pairs].find(([id]) => nomDe(id) === p.nom); return d && d[1].ecart ? (d[1].ecart.allerRetour < 1 ? '<1' : Math.round(d[1].ecart.allerRetour)) + ' ms' : 'direct'; };
      return '<ul class="px-pr-liste px-pr-gens">' + l.map(p => { const o = ond.find(v => v.nom === p.nom);
        return '<li class="' + (p.direct ? 'on' : 'loin') + (p.bloque ? ' bloque' : '') + '"><b>' + (p.direct ? '◉ ' : '○ ') + esc(p.nom || '?') + '</b><small>#' + p.fp.slice(0, 4) + ' · ' + (p.direct ? ms(p) : p.sauts + ' saut' + (p.sauts > 1 ? 's' : '')) + (o ? ' · ~' + o.distance + ' m' : '') + (p.verifie ? ' · ✓' : '') + '</small>'
          + '<button type="button" data-pr-fav="' + p.fp + '" aria-label="' + (p.favori ? 'retirer des potes' : 'ajouter aux potes') + '"' + (p.favori ? ' class="on"' : '') + '>' + (p.favori ? '✦' : '✧') + '</button>'
          + '<button type="button" data-pr-mp="' + p.fp + '"' + (p.cle ? '' : ' disabled') + '>écrire</button>'
          + '<button type="button" data-pr-bloq="' + p.fp + '" aria-label="' + (p.bloque ? 'débloquer' : 'bloquer') + '">' + (p.bloque ? '↺' : '⊘') + '</button></li>'; }).join('')
        + maille.topologie().noeuds.filter(n => n.muet).map(n => '<li class="muet"><b>◌ relais</b><small>sans nom (il ne s\'annonce pas) · ' + (n.stats ? n.stats.recus + ' reçus · ' + n.stats.relayes + ' relayés' : 'relié') + '</small></li>').join('')
        + ond.filter(v => !l.some(p => p.nom === v.nom)).map(v => '<li class="loin"><b>ᛒ ' + esc(v.nom || 'ploxi') + '</b><small>~' + v.distance + ' m · pas encore relié</small></li>').join('') + '</ul>';
    };
    const qui = (m) => (m.moi ? 'toi' : (m.nom || nomDe(m.de)) + (m.de && /^[0-9a-f]{16}$/.test(m.de) ? '#' + m.de.slice(0, 4) : ''));
    const messagesHtml = () => fil().slice(-60).map(m => '<p class="px-pr-m' + (m.moi ? ' moi' : '') + (m.texte == null ? ' ferme' : '') + (m.mention ? ' mention' : '') + '"><b>' + esc(qui(m)) + '</b> '
      + (m.texte == null ? '<i>◈ message fermé (pas le bon mot de passe, ou pas pour toi)</i>' : esc(m.texte))
      + (m.son && m.id ? ' <button type="button" class="px-pr-sonb" data-pr-son="' + esc(m.id) + '">▷ dans le synthé</button>' : '')
      + (m.sauts ? ' <small class="px-pr-sauts">↝' + m.sauts + '</small>' : '') + (m.moi && m.prive ? ' <small' + (m.etat === 'echec' ? ' class="px-pr-echec"' : '') + '>' + (m.etat === 'lu' ? '◉ lu' : m.etat === 'recu' ? '✓✓' : m.etat === 'echec' ? '⚠ pas remis' : '✓') + '</small>' : '') + '</p>').join('') || '<p class="px-sous">aucun message' + (e.salon === PUBLIC ? '' : ' ici') + '</p>';
    const salonsHtml = () => (maille ? [...maille.salons().map(s => [s.salon, s.salon === PUBLIC ? '# tout le monde' : s.salon + (s.ferme ? ' ◈' : '')]), ...maille.conversations().map(c => [c.salon, '@' + (c.nom || c.fp.slice(0, 4))])]
      .map(([k, n]) => '<button type="button" data-pr-salon="' + esc(k) + '"' + (k === e.salon ? ' class="on"' : '') + '>' + esc(n) + '</button>').join('') : '');
    const moiHtml = () => { const m = maille && maille.moi(); return m ? 'ton empreinte : <b>' + m.fp.match(/.{4}/g).join(' ') + '</b> <small>(c\'est elle qui dit qui tu es, pas ton nom)</small>' : ''; };
    // ---- ⌖ (0.99.22) les potes ----
    const enLigne = () => !W.navigator || W.navigator.onLine !== false;
    // (0.99.29) les outils de la soirée : garder la carte du coin (avant de partir, avec du réseau) ; un rendez-vous là où je suis
    const outilsHtml = () => '<div class="px-pr-seg px-pr-outils">'
      + '<button type="button" data-pr-garder' + (P.garde || !enLigne() ? ' disabled' : '') + '>' + (P.garde ? '⤓ ' + P.garde.fait + ' / ' + P.garde.total : '⤓ garder la carte du coin') + '</button>'
      + (P.partage ? '<button type="button" data-pr-rdv' + (P.rdv ? ' class="on"' : '') + '>' + (P.rdv ? '× le rendez-vous' : '◎ rendez-vous ici') + '</button>' : '') + '</div>';
    const ctlHtml = () => outilsHtml() + ctlBase();
    const ctlBase = () => {
      if (!maille) return '';
      if (P.partage) return '<p class="px-pr-partage">⌖ tu partages ta position avec ' + (P.partage.salon ? esc(P.partage.salon) : 'tes potes ✦ (' + P.partage.a.length + ')') + (P.partage.heures ? ' · jusqu\'à ' + hhmm(P.partage.jusqua) : ' · jusqu\'à ce que tu arrêtes') + '</p><button type="button" class="px-pr-b" data-pr-pos-stop>■ arrêter de partager (ta position s\'efface chez eux)</button>';
      return '<div class="px-pr-seg"><button type="button" data-pr-pos-partager="potes"' + (e.actif ? '' : ' disabled') + '>⌖ partager avec mes potes ✦</button>' + (salonFerme() ? '<button type="button" data-pr-pos-partager="salon">⌖ dans ' + esc(e.salon) + '</button>' : '') + '</div>'
        + '<div class="px-pr-seg px-pr-duree">' + [[1, '1 h'], [4, '4 h'], [0, 'jusqu\'à ce que j\'arrête']].map(([v, n]) => '<button type="button" data-pr-pos-duree="' + v + '"' + (P.duree === v ? ' class="on"' : '') + '>' + n + '</button>').join('') + '</div>';
    };
    function peindreRadar() {
      const zone = $('[data-pr-radar]'); if (!zone) return;
      const l = lesPotes(), rdvs = lesRdv(), n = maille ? maille.positions().length : 0;
      for (const x of l) traces.set(x.fp, ajouterTrace(traces.get(x.fp), x));   // (0.99.29) leurs derniers pas
      $('[data-pr-pos-ctl]').innerHTML = ctlHtml();
      const etat = $('[data-pr-pos-etat]'); etat.textContent = P.erreur || (!n ? (e.actif ? 'personne ne partage sa position avec toi pour l\'instant ; ✦ tes potes, et demande-leur de partager' : '') : !P.moi ? n + ' pote' + (n > 1 ? 's' : '') + ' partage' + (n > 1 ? 'nt' : '') + ' sa position ; la tienne arrive…' : '');
      const b = $('[data-pr-boussole]'), cible = P.cible && [...l, ...rdvs].find(x => x.fp === P.cible);
      zone.hidden = !(l.length || rdvs.length) || !!cible; b.hidden = !cible;
      if (!cible && minuteurGuide) { W.clearTimeout(minuteurGuide); minuteurGuide = 0; }
      $('[data-pr-potes-l]').innerHTML = cible ? '' : rdvs.map(x => '<button type="button" class="px-pr-pote px-pr-rdv" data-pr-pote="' + x.fp + '"><b>◎ ' + esc(x.nom) + '</b> ' + metres(x.r.d) + ' <i>' + fleche(x.r.cap, P.cap || 0) + '</i><small>rendez-vous</small></button>').join('') + l.map(x => { const f = fraicheur(x.t, maintenant()); return '<button type="button" class="px-pr-pote' + (f.vieux ? ' vieux' : '') + '" data-pr-pote="' + x.fp + '"><b>' + esc(x.nom || x.fp.slice(0, 4)) + '</b> ' + metres(x.r.d) + ' <i>' + fleche(x.r.cap, P.cap || 0) + '</i><small>' + f.texte + (x.precision ? ' · ± ' + Math.round(x.precision) + ' m' : '') + (x.salon ? ' · ' + esc(x.salon) : '') + (x.sauts ? ' · ↝' + x.sauts : '') + '</small></button>'; }).join('');
      if (cible) { peindreBoussole(cible); return; }
      if (!l.length && !rdvs.length) return;
      $('[data-pr-carte]').classList.toggle('on', P.carte); $('[data-pr-devant]').textContent = P.devant ? '↑ devant en haut' : 'N nord en haut'; $('[data-pr-devant]').classList.toggle('on', P.devant);
      const disque = $('[data-pr-disque]'), S = Math.max(200, Math.min(520, disque.clientWidth || zone.clientWidth || 320)), c = S / 2, R = c - 16, cap0 = P.devant && P.cap != null ? P.cap : 0;
      const ech = P.zoom != null ? ECHELLES[P.zoom] : echelle([...l.map(x => x.r.d), ...rdvs.map(x => x.r.d), P.moi.precision || 0]), mpp = ech / R;   // (0.99.29) + / − : le zoom à la main
      $('[data-pr-zoom-auto]').classList.toggle('on', P.zoom == null);
      // la carte : les tuiles (dans le repère nord en haut), tournées d'un bloc ; refaites seulement si la vue change
      const tu = $('[data-pr-tuiles]'), carte = P.carte, D2 = Math.ceil(S * 1.42), k = carte ? [S, ech, P.moi.lat.toFixed(4), P.moi.lng.toFixed(4)].join('|') : '';
      // (0.99.29) une tuile gardée d'abord (la carte hors ligne), sinon le réseau s'il y en a ; ni l'un ni l'autre : le radar seul
      if (k !== cleTuiles) { cleTuiles = k; tu.innerHTML = carte ? tuilesAutour(P.moi.lat, P.moi.lng, mpp, D2, D2).map(t => '<img alt="" draggable="false" onerror="this.style.display=\'none\'" data-tu="' + t.url + '" style="left:' + t.gauche + 'px;top:' + t.haut + 'px;width:' + t.cote + 'px;height:' + t.cote + 'px">').join('') : '';
        for (const im of tu.querySelectorAll('img[data-tu]')) { const u = im.getAttribute('data-tu'); tuilesC.src(u).then(loc => { if (loc) im.src = loc; else if (enLigne()) im.src = u; else im.style.display = 'none'; }).catch(() => { if (enLigne()) im.src = u; }); } }
      tu.style.cssText = 'width:' + D2 + 'px;height:' + D2 + 'px;left:' + Math.round((S - D2) / 2) + 'px;top:' + Math.round((S - D2) / 2) + 'px;transform:rotate(' + (-cap0) + 'deg)';
      $('[data-pr-attrib]').hidden = !carte;
      disque.style.height = S + 'px';
      const pt = (x, y) => { const q = tourner(x, y, cap0); let px = q.x / mpp, py = q.y / mpp; const d = Math.hypot(px, py); if (d > R) { px *= R / d; py *= R / d; } return [Math.round((c + px) * 10) / 10, Math.round((c - py) * 10) / 10, d > R]; };
      let svg = '<svg viewBox="0 0 ' + S + ' ' + S + '" width="' + S + '" height="' + S + '" aria-hidden="true">';
      for (let k2 = 1; k2 <= 4; k2++) svg += '<circle class="anneau" cx="' + c + '" cy="' + c + '" r="' + (R * k2 / 4) + '"/>';
      svg += '<text class="ech" x="' + (c + 4) + '" y="' + (c - R + 12) + '">' + metres(ech) + '</text><text class="ech" x="' + (c + 4) + '" y="' + (c - R / 2 + 12) + '">' + metres(ech / 2) + '</text>';
      const [nx, ny] = pt(0, (R + 10) * mpp); svg += '<text class="nord" x="' + nx + '" y="' + (ny + 4) + '" text-anchor="middle">N</text>';
      if (P.cap != null) { const [hx, hy] = pt(Math.sin(P.cap * Math.PI / 180) * R * 0.3 * mpp, Math.cos(P.cap * Math.PI / 180) * R * 0.3 * mpp); svg += '<line class="regard" x1="' + c + '" y1="' + c + '" x2="' + hx + '" y2="' + hy + '"/>'; }
      if (P.moi.precision && P.moi.precision / mpp > 6) svg += '<circle class="flou" cx="' + c + '" cy="' + c + '" r="' + Math.min(R, P.moi.precision / mpp) + '"/>';
      svg += '<circle class="moi" cx="' + c + '" cy="' + c + '" r="6"/>';
      // (0.99.29) les traces (leurs derniers pas), puis les rendez-vous (◆), puis les potes
      for (const x of l) { const tr = traces.get(x.fp) || []; if (tr.length < 2) continue; svg += '<polyline class="trace" points="' + tr.map(q => { const r2 = relatif(P.moi, q), [qx, qy] = pt(r2.x, r2.y); return qx + ',' + qy; }).join(' ') + '"/>'; }
      for (const x of rdvs) { const [px, py, bord] = pt(x.r.x, x.r.y); svg += '<g class="rdv" data-pr-pote="' + x.fp + '"><path d="M' + px + ',' + (py - 10) + ' L' + (px + 10) + ',' + py + ' L' + px + ',' + (py + 10) + ' L' + (px - 10) + ',' + py + ' Z"/><text x="' + (px + 14) + '" y="' + (py + 4) + '" text-anchor="' + (px > c ? 'end' : 'start') + '" dx="' + (px > c ? -28 : 0) + '">' + esc(x.nom.slice(0, 14)) + (bord ? ' ' + metres(x.r.d) : '') + '</text></g>'; }   /* à côté du losange, du côté du centre : il ne couvre plus le nom du pote */
      for (const x of l) {
        const [px, py, bord] = pt(x.r.x, x.r.y), f = fraicheur(x.t, maintenant());
        svg += '<g class="pote' + (f.vieux ? ' vieux' : '') + (bord ? ' bord' : '') + '" data-pr-pote="' + x.fp + '">' + (x.precision && x.precision / mpp > 8 && !bord ? '<circle class="flou" cx="' + px + '" cy="' + py + '" r="' + Math.min(R, x.precision / mpp) + '"/>' : '')
          + '<circle cx="' + px + '" cy="' + py + '" r="' + (bord ? 6 : 9) + '"/><text x="' + px + '" y="' + (py - 13) + '" text-anchor="middle">' + esc((x.nom || '?').slice(0, 12)) + (bord ? ' ' + metres(x.r.d) : '') + '</text></g>';
      }
      $('[data-pr-radar-svg]').innerHTML = svg + '</svg>';
    }
    let tuY = false;
    function peindreBoussole(x) {
      const a = aiguille(x.r.cap, P.cap), f = fraicheur(x.t, maintenant()), pres = x.r.d < Math.max(15, x.precision || 0);
      if (pres && !tuY) { tuY = true; vibrer('succes'); } if (!pres) tuY = false;
      // (0.99.29) l'aiguille tourne par le plus court (jamais un tour complet), la distance a une tendance, le guidage tourne en fond
      aigAff = tourCourt(aigAff, a);
      const h = (histos.get(x.fp) || []).filter(q => maintenant() - q.t < 30000); if (!h.length || maintenant() - h[h.length - 1].t > 1500) h.push({ t: maintenant(), d: x.r.d }); histos.set(x.fp, h);
      const td = tendance(h, maintenant());
      if (P.guide && !minuteurGuide) guider();
      // 🏝 (0.99.43) suivi sur l'écran verrouillé : la cible native suit sa position quand elle bouge de plus de 10 m (quand l'app est réveillée)
      if (P.balade === x.fp && W.jOSVeille && W.jOSVeille.balade && (!P.baladeVers || distanceM(P.baladeVers, x) > 10)) {
        P.baladeVers = { lat: x.lat, lng: x.lng }; W.jOSVeille.balade.cible({ nom: (x.rdv ? '◎ ' : '') + (x.nom || '?'), lat: x.lat, lng: x.lng }).catch(() => {});
      }
      $('[data-pr-boussole]').innerHTML = '<svg viewBox="-100 -100 200 200" class="px-pr-bsvg" aria-hidden="true"><circle class="anneau" r="92"/>'
        + (P.cap != null ? '<text class="nord" x="' + Math.round(-78 * Math.sin(P.cap * Math.PI / 180)) + '" y="' + Math.round(-78 * Math.cos(P.cap * Math.PI / 180) + 4) + '" text-anchor="middle">N</text>' : '')   /* le nord, debout, là où il est */
        + '<g class="rot" style="transform:rotate(' + Math.round(aigAff) + 'deg)"><path class="aiguille" d="M0,-74 L24,14 L0,0 L-24,14 Z"/></g><circle class="moi" r="5"/></svg>'
        + '<p class="px-pr-bd">' + (pres ? 'tu y es' : metres(x.r.d)) + '</p>'
        + (!pres ? '<p class="px-pr-tend">' + (x.r.d > 60 ? '≈ ' + minutesAPied(x.r.d) + ' min à pied' : '') + (td ? (x.r.d > 60 ? ' · ' : '') + (td === 'rapproche' ? 'tu te rapproches' : 'tu t\'éloignes') : '') + '</p>' : '')
        + '<p class="px-pr-bn"><b>' + esc(x.nom || '?') + '</b>' + (x.rdv ? ' · rendez-vous' : ' · ' + f.texte + (x.precision ? ' · ± ' + Math.round(x.precision) + ' m' : '')) + '</p>'
        + (f.vieux && !x.rdv ? '<p class="px-sous">sa position date un peu : il a peut-être bougé (elle se met à jour quand vous êtes reliés)</p>' : '')
        + (P.cap == null ? '<p class="px-sous">pas de boussole : la flèche suppose que tu regardes le nord</p>' : '')
        + '<div class="px-pr-seg"><button type="button" data-pr-boussole-fermer>‹ le radar</button><button type="button" data-pr-guide' + (P.guide ? ' class="on"' : '') + '>≋ guidé aux vibrations</button>' + (enLigne() ? '<button type="button" data-pr-plans="' + x.lat + ',' + x.lng + '">à pied (Plans)</button>' : '') + (W.jOSVeille && W.jOSVeille.balade ? '<button type="button" data-pr-balade' + (P.balade === x.fp ? ' class="on"' : '') + '>' + (P.balade === x.fp ? '■ écran verrouillé' : '🏝 écran verrouillé') + '</button>' : '') + '</div>';
    }
    const basseHtml = () => {
      if (hote === 'basse') return '<p class="px-pr-l">tu héberges la basse · ' + e.basse.tempo + ' bpm · tout le monde se cale sur toi</p>'
        + '<label class="px-pr-r">tempo <input type="range" min="60" max="180" step="1" value="' + e.basse.tempo + '" data-pr-tempo></label>'
        + '<div class="px-pr-seg">' + Object.keys(MOTIFS).map(k => '<button type="button" data-pr-motif="' + k + '"' + (e.basse.motif === k ? ' class="on"' : '') + '>' + k + '</button>').join('') + '</div>'
        + '<div class="px-pr-seg">' + [['grave', 31], ['bas', 36], ['milieu', 43]].map(([n, v]) => '<button type="button" data-pr-ton="' + v + '"' + (e.basse.tonique === v ? ' class="on"' : '') + '>' + n + '</button>').join('') + '</div>'
        + '<button type="button" class="px-pr-b" data-pr="basse-stop">■ arrêter la basse</button>';
      if (e.basse) return e.ecoute.basse ? '<p class="px-pr-l">∿ tu joues la basse de ' + esc(nomDe(e.basseHote)) + ' · ' + e.basse.tempo + ' bpm</p><button type="button" class="px-pr-b" data-pr="basse-quitter">■ la quitter</button>'
        : '<button type="button" class="px-pr-b px-pr-go" data-pr="basse-rejoindre">▷ rejoindre la basse de ' + esc(nomDe(e.basseHote)) + '</button>';
      return '<button type="button" class="px-pr-b" data-pr="basse-heberger"' + (e.actif ? '' : ' disabled') + '>∿ héberger une basse</button>';
    };
    const sonHtml = () => {
      if (hote === 'son') return '<p class="px-pr-l">tu héberges : ' + esc(e.son.url.replace(/^https:\/\//, '').slice(0, 60)) + '</p><div class="px-pr-seg"><button type="button" data-pr="son-pause">' + (e.son.joue ? '‖ pause pour tous' : '▷ relancer pour tous') + '</button><button type="button" data-pr="son-stop">■ arrêter</button></div>';
      if (e.son) return e.ecoute.son ? '<p class="px-pr-l">▷ tu joues le son de ' + esc(nomDe(e.sonHote)) + '</p><button type="button" class="px-pr-b" data-pr="son-quitter">■ le quitter</button>'
        : '<button type="button" class="px-pr-b px-pr-go" data-pr="son-rejoindre">▷ rejoindre le son de ' + esc(nomDe(e.sonHote)) + '</button><p class="px-sous">' + esc(e.son.url.replace(/^https:\/\//, '').slice(0, 60)) + '</p>';
      return '<div class="px-pr-envoi"><input type="url" inputmode="url" placeholder="https://… un son (mp3, m4a)" data-pr-url' + (e.actif ? '' : ' disabled') + '><button type="button" data-pr="son-heberger" aria-label="héberger ce son"' + (e.actif ? '' : ' disabled') + '>▷</button></div>';
    };
    // ▣ (0.99.35) la page « carte » : ma carte en QR (on me scanne), scanner celle d'un pote, mes potes ✦, mon empreinte, tout effacer
    const carteHtml = () => {
      if (!maille) return '<p class="px-sous">pas de maillage ici (il faut la cryptographie du téléphone)</p>';
      const m = maille.moi(), c = maille.carte(), potes = maille.favoris();
      let h = '';
      if (e.scan) h += '<div class="px-pr-scan"><video data-pr-video playsinline muted></video><p class="px-sous">vise la carte de ton pote (dans son Proche › ▣ carte)</p><button type="button" class="px-pr-b" data-pr-scan-fin>× arrêter</button></div>';
      else h += '<button type="button" class="px-pr-b px-pr-go" data-pr-scan' + (m ? '' : ' disabled') + '>▣ scanner la carte d\'un pote</button>';
      if (e.carteEnAttente) h += '<p class="px-pr-l">▣ une carte de pote attend : démarre Proche (page autour) pour l\'ajouter</p>';
      if (c && !e.scan) h += '<div class="px-pr-qr" data-neurone>' + qrSvg(c, { titre: 'ma carte de pote ploxi0n' }) + '</div>'
        + '<p class="px-pr-carte-n"><b>' + esc(m.nom || 'sans nom') + '</b> · ' + esc(m.fp.match(/.{4}/g).join(' ')) + '</p>'
        + '<p class="px-sous">ta carte : ta clé publique et ton nom, rien d\'autre. Qui la scanne en face de toi t\'ajoute comme pote vérifié ; fais pareil avec la sienne.</p>';
      else if (!m) h += '<p class="px-sous">démarre Proche (page autour) : ta carte apparaît ici.</p>';
      h += '<h3 class="px-pr-t">✦ mes potes</h3>' + (potes.length ? '<ul class="px-pr-liste">' + potes.map(f => '<li><b>' + esc(f.nom || f.fp.slice(0, 4)) + '</b><small>#' + f.fp.slice(0, 4) + (f.verifie ? ' · ✓ vérifié' : '') + (f.la ? ' · là' : '') + '</small><button type="button" data-pr-mp="' + f.fp + '"' + (f.cle ? '' : ' disabled') + '>écrire</button><button type="button" data-pr-fav="' + f.fp + '" aria-label="retirer des potes">×</button></li>').join('') + '</ul>' : '<p class="px-sous">aucun pote pour l\'instant : scanne leur carte, ou ✦ quelqu\'un dans la page autour</p>');
      if (m) h += '<p class="px-pr-moi">' + moiHtml() + '</p><button type="button" class="px-pr-b px-pr-danger" data-pr-effacer>tout effacer (une nouvelle empreinte, plus aucun message)</button>';
      return h;
    };
    const onglets = () => PAGES.map(([k, g, n]) => '<button type="button" role="tab" data-pr-page="' + k + '" aria-selected="' + (pageDe() === k) + '"' + (pageDe() === k ? ' class="on"' : '') + '><span>' + g + '</span><b>' + n + '</b>' + (k === 'messages' && e.nonLus ? '<i>' + Math.min(99, e.nonLus) + '</i>' : '') + (k === 'son' && (hote || e.basse || e.son) ? '<i>•</i>' : '') + '</button>').join('');
    hoteEl.innerHTML = '<div class="px-page px-proche" data-neurones="fin">'
      + '<div class="px-pr-tete"><p class="px-grave" data-pr-titre>◉ proche</p><span class="px-pr-etat" data-pr-etat></span></div>'
      + '<nav class="px-pr-onglets" role="tablist" data-pr-onglets></nav>'
      + '<p class="px-pr-err" data-pr-err hidden></p><p class="px-pr-info" data-pr-info hidden></p>'
      // ◉ autour : qui je suis, démarrer, qui est là
      + '<section data-pr-section="autour"><div class="px-pr-id" data-neurone><input type="text" maxlength="24" placeholder="ton nom" data-pr-nom><input type="text" maxlength="40" placeholder="la salle" data-pr-salle><button type="button" data-pr="allumer"></button></div>'
      + '<p class="px-sous">les téléphones autour, sans internet : chacun relaie les messages des autres, aussi loin que le maillage va ; les privés sont chiffrés de bout en bout. Rien n\'est annoncé avant « démarrer ».</p>'
      + '<h3 class="px-pr-t">qui est là</h3><div class="px-pr-pairs" data-pr-pairs></div><h3 class="px-pr-t">◈ la carte du maillage</h3><div data-pr-carte-maille><p class="px-sous">elle se dessine dès qu\'un voisin est relié</p></div></section>'
      // ≡ messages
      + '<section data-pr-section="messages"><div class="px-pr-salons" data-pr-salons></div><p class="px-pr-dm" data-pr-dm hidden></p><div class="px-pr-fil" data-pr-fil data-neurone data-ecrit></div>'
      + '<div class="px-pr-glyphes" data-ecrit>' + GLYPHES_MSG.map(g => '<button type="button" data-pr-glyphe="' + esc(g) + '" aria-label="envoyer : ' + esc(NOMS_GLYPHES[g] || g) + '">' + esc(g) + '</button>').join('') + '</div>'
      + '<div class="px-pr-envoi"><input type="text" maxlength="1000" placeholder="un message · /j #salon · /m @nom · /w" data-pr-msg><button type="button" data-pr="envoyer" aria-label="envoyer">→</button></div></section>'
      // ⌖ potes : la position, le radar, la boussole
      + '<section data-pr-section="potes"><div class="px-pr-potes" data-neurone><div data-pr-pos-ctl></div><p class="px-sous" data-pr-pos-etat></p>'
      + '<div data-pr-radar hidden><div class="px-pr-radar" data-pr-disque><div class="px-pr-tuiles" data-pr-tuiles></div><div data-pr-radar-svg></div></div><div class="px-pr-rbtn"><button type="button" data-pr-carte>◫ carte</button><button type="button" data-pr-devant></button><button type="button" data-pr-zoom="1" aria-label="zoomer">＋</button><button type="button" data-pr-zoom="-1" aria-label="dézoomer">－</button><button type="button" data-pr-zoom-auto>auto</button><small class="px-pr-attrib" data-pr-attrib hidden>' + ATTRIBUTION + '</small></div></div>'
      + '<div class="px-pr-boussole" data-pr-boussole hidden></div><div class="px-pr-potes-l" data-pr-potes-l></div></div></section>'
      // ∿ son : la basse, le son
      + '<section data-pr-section="son"><h3 class="px-pr-t">∿ la basse</h3><div data-pr-basse data-neurone></div><h3 class="px-pr-t">▷ le son</h3><div data-pr-son data-neurone></div></section>'
      // ▣ carte
      + '<section data-pr-section="carte"><div data-pr-carte-page></div></section></div>';
    const $ = (s) => hoteEl.querySelector(s);
    pret.then(() => { if (!vivant) return; $('[data-pr-nom]').value = e.nom; $('[data-pr-salle]').value = e.salle; });
    let scanneur = null;
    const fermerScan = () => { if (scanneur) { scanneur.arreter(); scanneur = null; } e.scan = null; };
    function lancerScan() {
      fermerScan(); e.scan = true; peindre('carte');
      const v = $('[data-pr-video]'); if (!v) return;
      scanneur = scannerQr({ W, video: v, accepter: (t) => !!lireCarte(t), surCode: (t) => { scanneur = null; e.scan = null; ajouterCarte(t).then(() => peindre('carte')); },
        surErreur: (x) => { scanneur = null; e.scan = null; e.info = '▣ ' + ((x && x.message) || x); peindre(); } });
    }
    const montrerPage = () => {
      const k = pageDe();
      for (const sct of hoteEl.querySelectorAll('[data-pr-section]')) sct.hidden = sct.getAttribute('data-pr-section') !== k;
      $('[data-pr-onglets]').innerHTML = onglets();
    };
    peindre = (quoi) => {
      if (!vivant) return;
      if (quoi === 'onglets') { $('[data-pr-onglets]').innerHTML = onglets(); return; }
      if (!quoi || quoi === 'carte' || quoi === 'pairs') { if (!e.scan || quoi === 'carte' && !$('[data-pr-video]')) $('[data-pr-carte-page]').innerHTML = carteHtml(); if (quoi === 'carte') return; }
      if (!quoi || quoi === 'pairs' || quoi === 'messages') { $('[data-pr-pairs]').innerHTML = pairsHtml(); const cm = carteMailleHtml(); $('[data-pr-carte-maille]').innerHTML = cm || '<p class="px-sous">elle se dessine dès qu\'un voisin est relié</p>'; }
      if (!quoi || quoi === 'messages') { const f = $('[data-pr-fil]'); f.innerHTML = messagesHtml(); f.scrollTop = f.scrollHeight; $('[data-pr-salons]').innerHTML = salonsHtml(); }
      if (!quoi || quoi === 'potes') peindreRadar();
      if (quoi) return;
      const dm = $('[data-pr-dm]'); if (dm) { if (maille && e.salon[0] === '@') { const fp = e.salon.slice(1), pr = maille.pairs().find(x => x.fp === fp) || maille.favoris().find(x => x.fp === fp) || {};
        dm.hidden = false; dm.innerHTML = '◈ <span data-pr-code>…</span> ' + (pr.verifie ? '<b>✓ vérifié</b>' : '<button type="button" data-pr-verif="' + fp + '">✓ c\'est le même code</button>') + ' <button type="button" data-pr-fav="' + fp + '">' + (pr.favori || maille.favoris().some(x => x.fp === fp) ? '✦' : '✧') + '</button>';
        maille.codeSecurite(fp).then(cd => { const x = $('[data-pr-code]'); if (x) x.textContent = cd ? 'le code avec lui : ' + cd + ' (compare-le en vrai)' : 'pas encore sa clé'; }); maille.lire(e.salon); } else dm.hidden = true; }
      const b = $('[data-pr="allumer"]'); b.textContent = e.actif ? '■ éteindre' : '◉ démarrer'; b.classList.toggle('on', e.actif);
      const et = $('[data-pr-etat]'); et.textContent = e.actif ? '● ' + (e.nom || 'ploxion') + ' · ' + e.salle + ' · ' + ((maille ? maille.pairs().length : 0) || e.pairs.size) + ' autour' : '○ éteint'; et.classList.toggle('on', e.actif);
      montrerPage();
      for (const s of ['[data-pr-nom]', '[data-pr-salle]']) $(s).disabled = e.actif;
      const er = $('[data-pr-err]'); er.hidden = !e.erreur; er.textContent = e.erreur;
      const inf = $('[data-pr-info]'); inf.hidden = !e.info; inf.textContent = e.info;
      $('[data-pr-msg]').placeholder = e.salon[0] === '@' ? 'en privé, chiffré' : e.salon === PUBLIC ? 'un message · /j #salon · /m @nom · /w' : 'dans ' + e.salon;
      $('[data-pr-basse]').innerHTML = basseHtml(); $('[data-pr-son]').innerHTML = sonHtml();
      for (const x of hoteEl.querySelectorAll('[data-pr-glyphe],[data-pr="envoyer"],[data-pr-msg]')) x.disabled = !e.actif;
    };
    peindre();
    // ▣ (0.99.35) ouvert par un lien ploxi0n://pote… (la caméra d'iOS sur un QR de pote) : la carte s'ajoute
    { const l = o && o.params && typeof o.params.lien === 'string' ? o.params.lien : ''; let c = null; try { c = l ? new URLSearchParams(l.replace(/^\?/, '')).get('carte') : null; } catch (x) { c = null; } if (c) { e.page = 'carte'; ajouterCarte(c); } }
    vue = true; W.addEventListener('deviceorientation', surCap);
    boxion.get('reglages', 'proche-carte').then(v => { if (typeof v === 'boolean') { P.carte = v; peindre('potes'); } }).catch(() => {});
    // ma position pour le radar : toutes les 10 s, seulement si quelqu'un partage la sienne avec moi (ou si je partage)
    const rafraichir = () => { if (!vivant) return; if (maille && (maille.positions().length || P.partage)) maPosition().then(() => peindre('potes')); };
    rafraichir(); W.clearInterval(minuteurMoi); minuteurMoi = W.setInterval(rafraichir, 10000);
    const desabo = maille ? maille.surChange((q) => { if (q === 'positions' && !P.moi) rafraichir(); }) : () => {};
    let touchers = [];
    hoteEl.addEventListener('click', (ev) => {
      // (0.99.35) les pages
      const og = ev.target.closest('[data-pr-page]'); if (og) { const k = og.getAttribute('data-pr-page'); if (k !== pageDe()) { if (k !== 'carte') fermerScan(); e.page = k; if (k === 'messages') { e.nonLus = 0; if (maille && e.salon[0] === '@') maille.lire(e.salon); } vibrer('selection'); peindre(); if (k === 'potes') peindre('potes'); if (k === 'messages') { const f = $('[data-pr-fil]'); f.scrollTop = f.scrollHeight; } } return; }
      if (ev.target.closest('[data-pr-scan]')) { vibrer('selection'); lancerScan(); return; }
      if (ev.target.closest('[data-pr-scan-fin]')) { fermerScan(); peindre('carte'); return; }
      if (ev.target.closest('[data-pr-effacer]')) { effacerTout(); return; }
      // trois touchers sur le titre en moins d'une seconde : tout effacer (comme bitchat)
      if (ev.target.closest('[data-pr-titre]')) { const t = Date.now(); touchers = [...touchers.filter(x => t - x < 1000), t]; if (touchers.length >= 3) { touchers = []; effacerTout(); } return; }
      // ♫ un son reçu : il part dans le synthé (gardé dans « tes sons »), et le synthé s'ouvre
      const so = ev.target.closest('[data-pr-son]'); if (so) { const m = fil().find(x => x.id === so.getAttribute('data-pr-son')); if (m && m.son) { try { W.dispatchEvent(new W.CustomEvent('px-synthe-charger', { detail: { ...m.son, nom: m.son.nom || ('de ' + (m.nom || '?')) } })); } catch (x) { /* */ } vibrer('fx-arrivee'); if (W.ploxi0n && W.ploxi0n.routeur) W.ploxi0n.routeur.ouvrir('synthe'); } return; }
      // ⌖ les potes
      const pp = ev.target.closest('[data-pr-pos-partager]'); if (pp) { partagerPosition(pp.getAttribute('data-pr-pos-partager'), P.duree); return; }
      const du = ev.target.closest('[data-pr-pos-duree]'); if (du) { P.duree = +du.getAttribute('data-pr-pos-duree'); vibrer('selection'); peindre('potes'); return; }
      if (ev.target.closest('[data-pr-pos-stop]')) { arreterPartage(); vibrer('selection'); return; }
      const po = ev.target.closest('[data-pr-pote]'); if (po) { P.cible = po.getAttribute('data-pr-pote'); vibrer('fx-arrivee'); try { const DO = W.DeviceOrientationEvent; if (DO && DO.requestPermission) DO.requestPermission().catch(() => {}); } catch (x) { /* */ } peindre('potes'); return; }
      if (ev.target.closest('[data-pr-boussole-fermer]')) { P.cible = null; W.clearTimeout(minuteurGuide); minuteurGuide = 0; peindre('potes'); return; }
      // (0.99.29) le zoom du radar, la carte gardée, le rendez-vous, le guidage
      const zo = ev.target.closest('[data-pr-zoom]'); if (zo) { const l2 = [...lesPotes(), ...lesRdv()], cur = P.zoom != null ? P.zoom : ECHELLES.indexOf(echelle([...l2.map(x => x.r.d), (P.moi && P.moi.precision) || 0])); P.zoom = Math.max(0, Math.min(ECHELLES.length - 1, cur - +zo.getAttribute('data-pr-zoom'))); cleTuiles = ''; vibrer('fx-cran'); peindre('potes'); return; }
      if (ev.target.closest('[data-pr-zoom-auto]')) { P.zoom = null; cleTuiles = ''; vibrer('selection'); peindre('potes'); return; }
      if (ev.target.closest('[data-pr-garder]')) { garderCarte(); return; }
      if (ev.target.closest('[data-pr-rdv]')) { poserRdv(); return; }
      if (ev.target.closest('[data-pr-balade]')) { baladePote(); return; }
      if (ev.target.closest('[data-pr-guide]')) { P.guide = !P.guide; if (!P.guide) { W.clearTimeout(minuteurGuide); minuteurGuide = 0; } vibrer('selection'); peindre('potes'); return; }
      if (ev.target.closest('[data-pr-carte]')) { P.carte = !P.carte; boxion.put('reglages', 'proche-carte', P.carte).catch(() => {}); peindre('potes'); return; }
      if (ev.target.closest('[data-pr-devant]')) { P.devant = !P.devant; peindre('potes'); return; }
      const pl = ev.target.closest('[data-pr-plans]'); if (pl) { const u = 'https://maps.apple.com/?daddr=' + pl.getAttribute('data-pr-plans') + '&dirflg=w'; if (ouvrirLien) ouvrirLien(u); else if (W.open) W.open(u, '_blank', 'noopener'); return; }
      const fa = ev.target.closest('[data-pr-fav]'); if (fa && maille) { const fp = fa.getAttribute('data-pr-fav'), est = maille.favoris().some(x => x.fp === fp); maille.favori(fp, !est); vibrer('selection'); if (!est && P.partage && P.partage.potes) envoyerPosition(true); peindre(); return; }
      const ve = ev.target.closest('[data-pr-verif]'); if (ve && maille) { maille.verifier(ve.getAttribute('data-pr-verif')); vibrer('succes'); peindre(); return; }
      const sa = ev.target.closest('[data-pr-salon]'); if (sa) { e.salon = sa.getAttribute('data-pr-salon'); e.info = ''; vibrer('selection'); peindre(); return; }
      const mp = ev.target.closest('[data-pr-mp]'); if (mp) { fermerScan(); e.salon = '@' + mp.getAttribute('data-pr-mp'); e.page = 'messages'; e.nonLus = 0; vibrer('selection'); peindre(); const i = $('[data-pr-msg]'); if (i) i.focus(); return; }
      const bq = ev.target.closest('[data-pr-bloq]'); if (bq && maille) { const fp = bq.getAttribute('data-pr-bloq'); if (maille.pairs().find(p => p.fp === fp && p.bloque)) maille.debloquer(fp); else maille.bloquer(fp); vibrer('selection'); peindre(); return; }
      const g = ev.target.closest('[data-pr-glyphe]'); if (g) { envoyerMessage(g.getAttribute('data-pr-glyphe')); return; }
      const mo = ev.target.closest('[data-pr-motif]'); if (mo) { hebergerBasse({ motif: mo.getAttribute('data-pr-motif') }); vibrer('selection'); return; }
      const to = ev.target.closest('[data-pr-ton]'); if (to) { hebergerBasse({ tonique: +to.getAttribute('data-pr-ton') }); vibrer('selection'); return; }
      const b = ev.target.closest('[data-pr]'); if (!b) return; const a = b.getAttribute('data-pr');
      if (a === 'allumer') { if (e.actif) arreter(); else demarrer({ nom: $('[data-pr-nom]').value, salle: $('[data-pr-salle]').value }); }
      else if (a === 'envoyer') { const i = $('[data-pr-msg]'); if (envoyerMessage(i.value)) i.value = ''; }
      else if (a === 'basse-heberger') hebergerBasse({});
      else if (a === 'basse-stop') arreterBasse();
      else if (a === 'basse-rejoindre' || a === 'son-rejoindre') rejoindre(a.split('-')[0]);
      else if (a === 'basse-quitter' || a === 'son-quitter') quitter(a.split('-')[0]);
      else if (a === 'son-heberger') { if (!hebergerSon($('[data-pr-url]').value)) { e.erreur = 'une adresse https:// vers un son'; peindre(); } }
      else if (a === 'son-pause') pauseSon();
      else if (a === 'son-stop') arreterSon();
    });
    hoteEl.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target.matches('[data-pr-msg]')) { if (envoyerMessage(ev.target.value)) ev.target.value = ''; } });
    hoteEl.addEventListener('change', (ev) => { if (ev.target.matches('[data-pr-tempo]')) hebergerBasse({ tempo: +ev.target.value }); });
    return { unmount() { fermerScan(); vivant = false; vue = false; W.clearTimeout(minuteurGuide); minuteurGuide = 0; W.removeEventListener('deviceorientation', surCap); W.clearInterval(minuteurMoi); desabo(); peindre = () => {}; hoteEl.innerHTML = ''; }, joue: () => !!(hote || e.ecoute.basse || e.ecoute.son || P.partage) };
  }

  const api = { brancherNotifier: (f) => { notifierF = f; }, ajouterCarte, page: (k) => { if (k) { e.page = k; peindre(); } return pageDe(); }, demarrer, arreter, envoyerMessage, effacerTout, partagerSon, partagerPosition, arreterPartage, potes: () => ({ partage: P.partage, moi: P.moi, cap: P.cap, rdv: P.rdv, positions: maille ? maille.positions() : [] }), fil, voir: (salon) => { e.salon = salon || PUBLIC; peindre(); }, maille: () => maille, hebergerBasse, arreterBasse, hebergerSon, pauseSon, arreterSon, rejoindre, quitter, heureDe,
    etat: () => ({ actif: e.actif, moi: e.moi, salle: e.salle, hote, pairs: [...e.pairs].map(([id, p]) => ({ id, etat: p.etat, ecart: p.ecart })), messages: fil(), salon: e.salon, info: e.info, maille: maille ? { moi: maille.moi(), pairs: maille.pairs(), salons: maille.salons(), conversations: maille.conversations() } : null, basse: e.basse, basseHote: e.basseHote, son: e.son, sonHote: e.sonHote, ecoute: { ...e.ecoute }, erreur: e.erreur }) };
  if (W) { W.jOSApps = W.jOSApps || {}; W.jOSApps.proche = { manifest: { id: 'proche', name: 'Proche', icon: '◉' }, mount }; }
  return { mount, pret, ...api, ploxion: { id: 'proche', nom: 'Proche', icone: '◉', interne: true } };
}
