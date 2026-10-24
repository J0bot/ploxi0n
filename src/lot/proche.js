// ◉ PROCHE : L'ULTIMATE BLUETOOTH (0.99.1, RS-7 23.10 : « envoyer des messages en Bluetooth, partager du son ou une basse, avoir un téléphone
// qui host le son et tous les autres qui répliquent, pour avoir plein de gens avec le même son » ; « je te laisse extrapoler et implémenter »).
// Les téléphones autour, sans internet (src/natif/proche-natif.js : MultipeerConnectivity sur l'iPhone). Trois choses :
//   ✉ les messages : des mots, ou des glyphes d'un geste (le mode humain : lisibles dans toutes les langues) ;
//   ♫ la basse : l'hôte envoie la PARTITION (tempo, motif, tonique, l'heure du début) ; chaque téléphone la joue lui-même, calé sur l'horloge
//     de l'hôte (src/bions/proche.js : ping / pong à la NTP, les plus rapides disent vrai) ;
//   ▶ le son : l'hôte donne un RENDEZ-VOUS (une adresse https, une position, une heure) ; chacun joue sa copie et se recale s'il dérive.
// 〰 (0.99.21, RS-7 : « ça doit être comme bitchat mesh ») les messages passent par le MAILLAGE (src/bions/maille.js) : relayés de téléphone
// en téléphone (7 sauts), gardés pour ceux qui arrivent après, des salons #, des messages privés chiffrés de bout en bout, bloquer, tout
// effacer (trois touchers sur « ◉ proche »), les commandes /j /m /w. La basse et le son restent d'un hôte à ses voisins directs (l'horloge).
// Ne pas nuire : rien n'est annoncé avant « démarrer » ; aucun son ne part chez quelqu'un sans son « rejoindre » ; ce qui vient d'à côté est
// lu comme suspect (paquets bornés, textes échappés, adresses https seulement). La session tient quand on change de ploxion ; ‹ ne la coupe pas.
import { paquet, lire, ecart, meilleurEcart, partition, notesEntre, kicksEntre, freq, positionA, nomDe, GLYPHES_MSG, MOTIFS } from '../bions/proche.js';
import { normaliser } from '../bions/son.js';   // (0.99.10) la basse peut porter le son du synthé (ses 33 réglages)
import { creerMoteur } from './synthe.js';
import { creerMaille, commande, PUBLIC } from '../bions/maille.js';
import { relatif, echelle, aiguille, tourner, fraicheur, tuilesAutour, ATTRIBUTION } from '../bions/potes.js';
import { capBoussole, metres, fleche } from '../bions/autour.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const httpsSeul = (u) => { try { const x = new URL(String(u)); return x.protocol === 'https:' ? x.href : null; } catch (e) { return null; } };

export function creerProche({ W = globalThis.window, boxion, tuyau, vibrer = () => {}, Contexte = W && (W.AudioContext || W.webkitAudioContext), maintenant = () => Date.now(), position = null, ouvrirLien = null }) {
  const e = { nom: '', salle: 'xerboxion', actif: false, moi: null, pairs: new Map(), messages: [],
    basse: null, basseHote: null, son: null, sonHote: null, ecoute: { basse: false, son: false }, erreur: '', salon: PUBLIC, info: '' };
  let moteurSon = null, hote = null, ping = 0, annonce = 0, calage = 0, ordo = 0, ctx = null, audio = null, jusque = 0, peindre = () => {};
  const pret = boxion.get('reglages', 'proche').then(v => { if (v && typeof v === 'object') { e.nom = String(v.nom || ''); e.salle = String(v.salle || 'xerboxion'); } }).catch(() => {});

  // ---- 〰 le maillage : les messages ----
  const C = (W && W.crypto && W.crypto.subtle) ? W.crypto : globalThis.crypto;
  const maille = C && C.subtle ? creerMaille({ subtle: C.subtle, alea: (n) => C.getRandomValues(new Uint8Array(n)), maintenant,
    envoyer: (texte, vers) => { tuyau.envoyer(texte, vers || undefined).catch(() => {}); },
    attente: (ms, f) => W.setTimeout(f, ms), repeter: (ms, f) => { const x = W.setInterval(f, ms); return () => W.clearInterval(x); },
    magasin: { lire: (k) => boxion.get('reglages', 'proche-' + k), ecrire: (k, v) => boxion.put('reglages', 'proche-' + k, v) } }) : null;
  if (maille) maille.surChange((q) => {
    if (q === 'mention') { vibrer('fx-arrivee'); return; }   // (0.99.22) « @ton nom »
    if (q === 'positions') { peindre('potes'); return; }
    if (q === 'messages') { const m = maille.fil(e.salon).at(-1); if (m && !m.moi) vibrer('selection'); if (e.salon[0] === '@' && vue) maille.lire(e.salon); }
    peindre(q === 'messages' || q === 'pairs' ? q : undefined);
  });
  let vue = false;   // la page est à l'écran (les « lu » ne partent que si la conversation est vraiment ouverte)

  // ---- ⌖ (0.99.22) LES POTES : partager sa position (chiffrée pour ses potes ✦, ou un salon fermé), le radar, la boussole, la carte ----
  // Ne pas nuire : rien ne part sans « partager » ; jamais dans un salon ouvert ; ça s'arrête tout seul (1 h, 4 h) ; « ■ arrêter » efface la
  // position chez les autres ; le bandeau le dit tant que ça dure ; rien n'est gardé sur le disque.
  const P = { partage: null, moi: null, cap: null, cible: null, carte: true, devant: false, duree: 4, erreur: '', dernier: null, envoye: 0 };
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
      await maille.partagerPosition({ ...p, cap: P.cap }, { a: P.partage.a, salon: P.partage.salon }); P.dernier = p; P.envoye = maintenant();
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
  let derCap = 0; const surCap = (ev) => { const c = capBoussole(ev); if (c == null) return; P.cap = c; const t = maintenant(); if (t - derCap > 180) { derCap = t; peindre('potes'); } };

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

  async function demarrer({ nom, salle } = {}) {
    if (nom != null) e.nom = String(nom).slice(0, 24); if (salle != null) e.salle = String(salle).slice(0, 40) || 'xerboxion';
    boxion.put('reglages', 'proche', { nom: e.nom, salle: e.salle }).catch(() => {});
    e.erreur = '';
    if (maille) { try { await maille.demarrer({ nom: e.nom || 'ploxion' }); } catch (x) { e.erreur = 'le maillage ne démarre pas : ' + ((x && x.message) || x); } }
    try { const r = await tuyau.demarrer({ nom: e.nom || 'ploxion', salle: e.salle }); e.moi = r.moi; e.actif = true; }
    catch (x) { e.erreur = (x && x.message) || 'impossible de démarrer'; e.actif = false; peindre(); return false; }
    W.clearInterval(ping); ping = W.setInterval(sonder, 4000);
    vibrer('fx-arrivee'); peindre(); return true;
  }
  async function arreter() {
    if (hote === 'basse') arreterBasse(); if (hote === 'son') arreterSon();
    W.clearInterval(ping); couperBasse(); couperSon(); e.ecoute = { basse: false, son: false };
    arreterPartage();
    if (maille) maille.arreter();
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
  function mount(hoteEl) {
    let vivant = true;
    const directs = () => [...e.pairs].map(([id, p]) => '<span class="px-pr-pair' + (p.etat === 'connecte' ? ' on' : '') + '" data-neurone>◉ ' + esc(nomDe(id))
      + (p.ecart ? ' <small>' + (p.ecart.allerRetour < 1 ? '<1' : Math.round(p.ecart.allerRetour)) + ' ms</small>' : p.etat === 'connexion' ? ' <small>…</small>' : '') + '</span>').join('');
    // 〰 le maillage : qui est là, à combien de sauts ; ✉ lui écrire en privé, ⊘ le bloquer
    const loin = () => (maille ? maille.pairs().filter(p => !p.direct).map(p => '<span class="px-pr-pair px-pr-loin' + (p.bloque ? ' bloque' : '') + '" data-neurone>○ ' + esc(p.nom || '?') + '<small>#' + p.fp.slice(0, 4) + ' · ' + p.sauts + ' saut' + (p.sauts > 1 ? 's' : '') + '</small></span>').join('') : '');
    const pairsHtml = () => ((e.pairs.size || (maille && maille.pairs().length)) ? directs() + loin()
      + (maille ? '<div class="px-pr-qui">' + maille.pairs().map(p => '<button type="button" data-pr-fav="' + p.fp + '" aria-label="pote">' + (p.favori ? '✦' : '✧') + '</button><button type="button" data-pr-mp="' + p.fp + '"' + (p.cle ? '' : ' disabled') + '>@' + esc(p.nom || p.fp.slice(0, 4)) + (p.verifie ? ' ✓' : '') + '</button><button type="button" data-pr-bloq="' + p.fp + '" aria-label="' + (p.bloque ? 'débloquer' : 'bloquer') + '">' + (p.bloque ? '↺' : '⊘') + '</button>').join('') + '</div>' : '')
      : '<p class="px-sous">' + (e.actif ? 'personne autour pour l\'instant, dans la salle « ' + esc(e.salle) + ' » ; les autres ouvrent Proche, même salle, et démarrent' : 'éteint : personne ne te voit') + '</p>');
    const qui = (m) => (m.moi ? 'toi' : (m.nom || nomDe(m.de)) + (m.de && /^[0-9a-f]{16}$/.test(m.de) ? '#' + m.de.slice(0, 4) : ''));
    const messagesHtml = () => fil().slice(-60).map(m => '<p class="px-pr-m' + (m.moi ? ' moi' : '') + (m.texte == null ? ' ferme' : '') + (m.mention ? ' mention' : '') + '"><b>' + esc(qui(m)) + '</b> '
      + (m.texte == null ? '<i>◈ message fermé (pas le bon mot de passe, ou pas pour toi)</i>' : esc(m.texte))
      + (m.son && m.id ? ' <button type="button" class="px-pr-sonb" data-pr-son="' + esc(m.id) + '">▷ dans le synthé</button>' : '')
      + (m.sauts ? ' <small class="px-pr-sauts">↝' + m.sauts + '</small>' : '') + (m.moi && m.prive ? ' <small>' + (m.etat === 'lu' ? '◉ lu' : m.etat === 'recu' ? '✓✓' : '✓') + '</small>' : '') + '</p>').join('') || '<p class="px-sous">aucun message' + (e.salon === PUBLIC ? '' : ' ici') + '</p>';
    const salonsHtml = () => (maille ? [...maille.salons().map(s => [s.salon, s.salon === PUBLIC ? '# tout le monde' : s.salon + (s.ferme ? ' ◈' : '')]), ...maille.conversations().map(c => [c.salon, '@' + (c.nom || c.fp.slice(0, 4))])]
      .map(([k, n]) => '<button type="button" data-pr-salon="' + esc(k) + '"' + (k === e.salon ? ' class="on"' : '') + '>' + esc(n) + '</button>').join('') : '');
    const moiHtml = () => { const m = maille && maille.moi(); return m ? 'ton empreinte : <b>' + m.fp.match(/.{4}/g).join(' ') + '</b> <small>(c\'est elle qui dit qui tu es, pas ton nom)</small>' : ''; };
    // ---- ⌖ (0.99.22) les potes ----
    const hhmm = (t) => new Date(t).toTimeString().slice(0, 5);
    const enLigne = () => !W.navigator || W.navigator.onLine !== false;
    const ctlHtml = () => {
      if (!maille) return '';
      if (P.partage) return '<p class="px-pr-partage">⌖ tu partages ta position avec ' + (P.partage.salon ? esc(P.partage.salon) : 'tes potes ✦ (' + P.partage.a.length + ')') + (P.partage.heures ? ' · jusqu\'à ' + hhmm(P.partage.jusqua) : ' · jusqu\'à ce que tu arrêtes') + '</p><button type="button" class="px-pr-b" data-pr-pos-stop>■ arrêter de partager (ta position s\'efface chez eux)</button>';
      return '<div class="px-pr-seg"><button type="button" data-pr-pos-partager="potes"' + (e.actif ? '' : ' disabled') + '>⌖ partager avec mes potes ✦</button>' + (salonFerme() ? '<button type="button" data-pr-pos-partager="salon">⌖ dans ' + esc(e.salon) + '</button>' : '') + '</div>'
        + '<div class="px-pr-seg px-pr-duree">' + [[1, '1 h'], [4, '4 h'], [0, 'jusqu\'à ce que j\'arrête']].map(([v, n]) => '<button type="button" data-pr-pos-duree="' + v + '"' + (P.duree === v ? ' class="on"' : '') + '>' + n + '</button>').join('') + '</div>';
    };
    const lesPotes = () => (maille && P.moi ? maille.positions().map(x => ({ ...x, r: relatif(P.moi, x) })).sort((a, b) => a.r.d - b.r.d) : []);
    let cleTuiles = '';
    function peindreRadar() {
      const zone = $('[data-pr-radar]'); if (!zone) return;
      const l = lesPotes(), n = maille ? maille.positions().length : 0;
      $('[data-pr-pos-ctl]').innerHTML = ctlHtml();
      const etat = $('[data-pr-pos-etat]'); etat.textContent = P.erreur || (!n ? (e.actif ? 'personne ne partage sa position avec toi pour l\'instant ; ✦ tes potes, et demande-leur de partager' : '') : !P.moi ? n + ' pote' + (n > 1 ? 's' : '') + ' partage' + (n > 1 ? 'nt' : '') + ' sa position ; la tienne arrive…' : '');
      const b = $('[data-pr-boussole]'), cible = P.cible && l.find(x => x.fp === P.cible);
      zone.hidden = !l.length || !!cible; b.hidden = !cible;
      $('[data-pr-potes-l]').innerHTML = cible ? '' : l.map(x => { const f = fraicheur(x.t, maintenant()); return '<button type="button" class="px-pr-pote' + (f.vieux ? ' vieux' : '') + '" data-pr-pote="' + x.fp + '"><b>' + esc(x.nom || x.fp.slice(0, 4)) + '</b> ' + metres(x.r.d) + ' <i>' + fleche(x.r.cap, P.cap || 0) + '</i><small>' + f.texte + (x.precision ? ' · ± ' + Math.round(x.precision) + ' m' : '') + (x.salon ? ' · ' + esc(x.salon) : '') + (x.sauts ? ' · ↝' + x.sauts : '') + '</small></button>'; }).join('');
      if (cible) { peindreBoussole(cible); return; }
      if (!l.length) return;
      $('[data-pr-carte]').classList.toggle('on', P.carte); $('[data-pr-devant]').textContent = P.devant ? '↑ devant en haut' : 'N nord en haut'; $('[data-pr-devant]').classList.toggle('on', P.devant);
      const disque = $('[data-pr-disque]'), S = Math.max(200, Math.min(520, disque.clientWidth || zone.clientWidth || 320)), c = S / 2, R = c - 16, cap0 = P.devant && P.cap != null ? P.cap : 0;
      const ech = echelle([...l.map(x => x.r.d), P.moi.precision || 0]), mpp = ech / R;
      // la carte : les tuiles (dans le repère nord en haut), tournées d'un bloc ; refaites seulement si la vue change
      const tu = $('[data-pr-tuiles]'), carte = P.carte && enLigne(), D2 = Math.ceil(S * 1.42), k = carte ? [S, ech, P.moi.lat.toFixed(4), P.moi.lng.toFixed(4)].join('|') : '';
      if (k !== cleTuiles) { cleTuiles = k; tu.innerHTML = carte ? tuilesAutour(P.moi.lat, P.moi.lng, mpp, D2, D2).map(t => '<img alt="" draggable="false" onerror="this.style.display=\'none\'" src="' + t.url + '" style="left:' + t.gauche + 'px;top:' + t.haut + 'px;width:' + t.cote + 'px;height:' + t.cote + 'px">').join('') : ''; }
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
      $('[data-pr-boussole]').innerHTML = '<svg viewBox="-100 -100 200 200" class="px-pr-bsvg" aria-hidden="true"><circle class="anneau" r="92"/>'
        + (P.cap != null ? '<text class="nord" x="' + Math.round(-78 * Math.sin(P.cap * Math.PI / 180)) + '" y="' + Math.round(-78 * Math.cos(P.cap * Math.PI / 180) + 4) + '" text-anchor="middle">N</text>' : '')   /* le nord, debout, là où il est */
        + '<g transform="rotate(' + Math.round(a) + ')"><path class="aiguille" d="M0,-74 L24,14 L0,0 L-24,14 Z"/></g><circle class="moi" r="5"/></svg>'
        + '<p class="px-pr-bd">' + (pres ? 'tu y es' : metres(x.r.d)) + '</p><p class="px-pr-bn"><b>' + esc(x.nom || '?') + '</b> · ' + f.texte + (x.precision ? ' · ± ' + Math.round(x.precision) + ' m' : '') + '</p>'
        + (P.cap == null ? '<p class="px-sous">pas de boussole : la flèche suppose que tu regardes le nord</p>' : '')
        + '<div class="px-pr-seg"><button type="button" data-pr-boussole-fermer>‹ le radar</button>' + (enLigne() ? '<button type="button" data-pr-plans="' + x.lat + ',' + x.lng + '">à pied (Plans)</button>' : '') + '</div>';
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
      return '<div class="px-pr-envoi"><input type="url" inputmode="url" placeholder="https://… un son (mp3, m4a)" data-pr-url' + (e.actif ? '' : ' disabled') + '><button type="button" data-pr="son-heberger"' + (e.actif ? '' : ' disabled') + '>▷</button></div>';
    };
    hoteEl.innerHTML = '<div class="px-page px-proche" data-neurones="fin"><p class="px-grave" data-pr-titre>◉ proche</p>'
      + '<p class="px-sous">les téléphones autour de toi, sans internet : un maillage, comme bitchat. Chaque téléphone relaie les messages des autres (jusqu\'à 7 sauts), les garde pour ceux qui arrivent après ; les messages privés sont chiffrés de bout en bout. Et une basse, un son, partagés. Trois touchers sur « ◉ proche » : tout effacer.</p>'
      + '<div class="px-pr-id" data-neurone><input type="text" maxlength="24" placeholder="ton nom" data-pr-nom><input type="text" maxlength="40" placeholder="la salle" data-pr-salle><button type="button" data-pr="allumer"></button></div>'
      + '<p class="px-pr-err" data-pr-err hidden></p><div class="px-pr-pairs" data-pr-pairs></div>'
      + '<p class="px-pr-moi" data-pr-moi></p>'
      + '<h3 class="px-pr-t">≡ messages</h3><div class="px-pr-salons" data-pr-salons></div><p class="px-pr-dm" data-pr-dm hidden></p><div class="px-pr-fil" data-pr-fil data-neurone data-ecrit></div>'
      + '<div class="px-pr-glyphes" data-ecrit>' + GLYPHES_MSG.map(g => '<button type="button" data-pr-glyphe="' + esc(g) + '">' + esc(g) + '</button>').join('') + '</div>'
      + '<div class="px-pr-envoi"><input type="text" maxlength="1000" placeholder="un message · /j #salon · /m @nom · /w" data-pr-msg><button type="button" data-pr="envoyer">→</button></div><p class="px-pr-info" data-pr-info hidden></p>'
      + '<h3 class="px-pr-t">⌖ mes potes</h3><div class="px-pr-potes" data-neurone><div data-pr-pos-ctl></div><p class="px-sous" data-pr-pos-etat></p>'
      + '<div data-pr-radar hidden><div class="px-pr-radar" data-pr-disque><div class="px-pr-tuiles" data-pr-tuiles></div><div data-pr-radar-svg></div></div><div class="px-pr-rbtn"><button type="button" data-pr-carte>◫ carte</button><button type="button" data-pr-devant></button><small class="px-pr-attrib" data-pr-attrib hidden>' + ATTRIBUTION + '</small></div></div>'
      + '<div class="px-pr-boussole" data-pr-boussole hidden></div><div class="px-pr-potes-l" data-pr-potes-l></div></div>'
      + '<h3 class="px-pr-t">∿ la basse</h3><div data-pr-basse data-neurone></div><h3 class="px-pr-t">▷ le son</h3><div data-pr-son data-neurone></div></div>';
    const $ = (s) => hoteEl.querySelector(s);
    pret.then(() => { if (!vivant) return; $('[data-pr-nom]').value = e.nom; $('[data-pr-salle]').value = e.salle; });
    peindre = (quoi) => {
      if (!vivant) return;
      if (!quoi || quoi === 'pairs') $('[data-pr-pairs]').innerHTML = pairsHtml();
      if (!quoi || quoi === 'messages') { const f = $('[data-pr-fil]'); f.innerHTML = messagesHtml(); f.scrollTop = f.scrollHeight; $('[data-pr-salons]').innerHTML = salonsHtml(); }
      if (!quoi || quoi === 'potes') peindreRadar();
      if (quoi) return;
      const dm = $('[data-pr-dm]'); if (dm) { if (maille && e.salon[0] === '@') { const fp = e.salon.slice(1), pr = maille.pairs().find(x => x.fp === fp) || maille.favoris().find(x => x.fp === fp) || {};
        dm.hidden = false; dm.innerHTML = '◈ <span data-pr-code>…</span> ' + (pr.verifie ? '<b>✓ vérifié</b>' : '<button type="button" data-pr-verif="' + fp + '">✓ c\'est le même code</button>') + ' <button type="button" data-pr-fav="' + fp + '">' + (pr.favori || maille.favoris().some(x => x.fp === fp) ? '✦' : '✧') + '</button>';
        maille.codeSecurite(fp).then(cd => { const x = $('[data-pr-code]'); if (x) x.textContent = cd ? 'le code avec lui : ' + cd + ' (compare-le en vrai)' : 'pas encore sa clé'; }); maille.lire(e.salon); } else dm.hidden = true; }
      const b = $('[data-pr="allumer"]'); b.textContent = e.actif ? '■ éteindre' : '◉ démarrer'; b.classList.toggle('on', e.actif);
      for (const s of ['[data-pr-nom]', '[data-pr-salle]']) $(s).disabled = e.actif;
      const er = $('[data-pr-err]'); er.hidden = !e.erreur; er.textContent = e.erreur;
      const inf = $('[data-pr-info]'); inf.hidden = !e.info; inf.textContent = e.info; $('[data-pr-moi]').innerHTML = e.actif ? moiHtml() : '';
      $('[data-pr-msg]').placeholder = e.salon[0] === '@' ? 'en privé, chiffré' : e.salon === PUBLIC ? 'un message · /j #salon · /m @nom · /w' : 'dans ' + e.salon;
      $('[data-pr-basse]').innerHTML = basseHtml(); $('[data-pr-son]').innerHTML = sonHtml();
      for (const x of hoteEl.querySelectorAll('[data-pr-glyphe],[data-pr="envoyer"],[data-pr-msg]')) x.disabled = !e.actif;
    };
    peindre();
    vue = true; W.addEventListener('deviceorientation', surCap);
    boxion.get('reglages', 'proche-carte').then(v => { if (typeof v === 'boolean') { P.carte = v; peindre('potes'); } }).catch(() => {});
    // ma position pour le radar : toutes les 10 s, seulement si quelqu'un partage la sienne avec moi (ou si je partage)
    const rafraichir = () => { if (!vivant) return; if (maille && (maille.positions().length || P.partage)) maPosition().then(() => peindre('potes')); };
    rafraichir(); W.clearInterval(minuteurMoi); minuteurMoi = W.setInterval(rafraichir, 10000);
    const desabo = maille ? maille.surChange((q) => { if (q === 'positions' && !P.moi) rafraichir(); }) : () => {};
    let touchers = [];
    hoteEl.addEventListener('click', (ev) => {
      // trois touchers sur le titre en moins d'une seconde : tout effacer (comme bitchat)
      if (ev.target.closest('[data-pr-titre]')) { const t = Date.now(); touchers = [...touchers.filter(x => t - x < 1000), t]; if (touchers.length >= 3) { touchers = []; effacerTout(); } return; }
      // ♫ un son reçu : il part dans le synthé (gardé dans « tes sons »), et le synthé s'ouvre
      const so = ev.target.closest('[data-pr-son]'); if (so) { const m = fil().find(x => x.id === so.getAttribute('data-pr-son')); if (m && m.son) { try { W.dispatchEvent(new W.CustomEvent('px-synthe-charger', { detail: { ...m.son, nom: m.son.nom || ('de ' + (m.nom || '?')) } })); } catch (x) { /* */ } vibrer('fx-arrivee'); if (W.ploxi0n && W.ploxi0n.routeur) W.ploxi0n.routeur.ouvrir('synthe'); } return; }
      // ⌖ les potes
      const pp = ev.target.closest('[data-pr-pos-partager]'); if (pp) { partagerPosition(pp.getAttribute('data-pr-pos-partager'), P.duree); return; }
      const du = ev.target.closest('[data-pr-pos-duree]'); if (du) { P.duree = +du.getAttribute('data-pr-pos-duree'); vibrer('selection'); peindre('potes'); return; }
      if (ev.target.closest('[data-pr-pos-stop]')) { arreterPartage(); vibrer('selection'); return; }
      const po = ev.target.closest('[data-pr-pote]'); if (po) { P.cible = po.getAttribute('data-pr-pote'); vibrer('fx-arrivee'); try { const DO = W.DeviceOrientationEvent; if (DO && DO.requestPermission) DO.requestPermission().catch(() => {}); } catch (x) { /* */ } peindre('potes'); return; }
      if (ev.target.closest('[data-pr-boussole-fermer]')) { P.cible = null; peindre('potes'); return; }
      if (ev.target.closest('[data-pr-carte]')) { P.carte = !P.carte; boxion.put('reglages', 'proche-carte', P.carte).catch(() => {}); peindre('potes'); return; }
      if (ev.target.closest('[data-pr-devant]')) { P.devant = !P.devant; peindre('potes'); return; }
      const pl = ev.target.closest('[data-pr-plans]'); if (pl) { const u = 'https://maps.apple.com/?daddr=' + pl.getAttribute('data-pr-plans') + '&dirflg=w'; if (ouvrirLien) ouvrirLien(u); else if (W.open) W.open(u, '_blank', 'noopener'); return; }
      const fa = ev.target.closest('[data-pr-fav]'); if (fa && maille) { const fp = fa.getAttribute('data-pr-fav'), est = maille.favoris().some(x => x.fp === fp); maille.favori(fp, !est); vibrer('selection'); if (!est && P.partage && P.partage.potes) envoyerPosition(true); peindre(); return; }
      const ve = ev.target.closest('[data-pr-verif]'); if (ve && maille) { maille.verifier(ve.getAttribute('data-pr-verif')); vibrer('succes'); peindre(); return; }
      const sa = ev.target.closest('[data-pr-salon]'); if (sa) { e.salon = sa.getAttribute('data-pr-salon'); e.info = ''; vibrer('selection'); peindre(); return; }
      const mp = ev.target.closest('[data-pr-mp]'); if (mp) { e.salon = '@' + mp.getAttribute('data-pr-mp'); vibrer('selection'); peindre(); const i = $('[data-pr-msg]'); if (i) i.focus(); return; }
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
    return { unmount() { vivant = false; vue = false; W.removeEventListener('deviceorientation', surCap); W.clearInterval(minuteurMoi); desabo(); peindre = () => {}; hoteEl.innerHTML = ''; }, joue: () => !!(hote || e.ecoute.basse || e.ecoute.son || P.partage) };
  }

  const api = { demarrer, arreter, envoyerMessage, effacerTout, partagerSon, partagerPosition, arreterPartage, potes: () => ({ partage: P.partage, moi: P.moi, cap: P.cap, positions: maille ? maille.positions() : [] }), fil, voir: (salon) => { e.salon = salon || PUBLIC; peindre(); }, maille: () => maille, hebergerBasse, arreterBasse, hebergerSon, pauseSon, arreterSon, rejoindre, quitter, heureDe,
    etat: () => ({ actif: e.actif, moi: e.moi, salle: e.salle, hote, pairs: [...e.pairs].map(([id, p]) => ({ id, etat: p.etat, ecart: p.ecart })), messages: fil(), salon: e.salon, info: e.info, maille: maille ? { moi: maille.moi(), pairs: maille.pairs(), salons: maille.salons(), conversations: maille.conversations() } : null, basse: e.basse, basseHote: e.basseHote, son: e.son, sonHote: e.sonHote, ecoute: { ...e.ecoute }, erreur: e.erreur }) };
  if (W) { W.jOSApps = W.jOSApps || {}; W.jOSApps.proche = { manifest: { id: 'proche', name: 'Proche', icon: '◉' }, mount }; }
  return { mount, pret, ...api, ploxion: { id: 'proche', nom: 'Proche', icone: '◉', interne: true } };
}
