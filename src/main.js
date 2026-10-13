// ploxi0n — le démarrage : boxion_local d'abord, puis le shim jOS (avant tout ploxion), puis le routeur.
// L'accueil = les ploxions intégrés (banc, marketplace, mon xer en ligne) + ceux que la personne a installés (marketplace).
import { ouvrirBoxionLocal } from './boxion-local/index.js';
import { installerShim } from './shim/jos.js';
import { creerRouteur } from './app/routeur.js';
import { enregistrerBanc } from './banc/banc.js';
import { creerVerrou } from './natif/verrou.js';
import { creerDepot, creerHttp, SOURCE } from './marketplace/depot.js';
import { enregistrerMarketplace } from './marketplace/marketplace.js';
import { enregistrerXerEnLigne } from './app/xer-en-ligne.js';
import { brancherLiens } from './natif/liens.js';
import { creerRaccourcis } from './natif/raccourcis.js';
import { creerCompte } from './natif/compte.js';
import { creerEcranAccueil } from './natif/ecran-accueil.js';
import { creerNotifs } from './natif/notifs.js';
import { creerHud } from './app/hud.js';
import { enregistrerReglages } from './app/reglages.js';
import { creerPrefs } from './app/prefs.js';
import { installerJosNatif } from './natif/jos-natif.js';
import { brancherPlugions } from './natif/plugions.js';
import { installerLecteur } from './natif/lecteur.js';
import { creerHaptique } from './natif/haptique.js';
import { installerImages } from './natif/images.js';
import { installerClavierIos, barreClavier, comprendre } from './natif/clavier-ios.js';
import { trouverPloxion } from './natif/vocabulaire.js';
import { creerVocal } from './natif/vocal.js';
import { creerOnboarding } from './app/onboarding.js';
import { creerNouveautes } from './app/nouveautes.js';
import { creerTsoinNatif } from './natif/tsoin-natif.js';
import { creerBarreHaut } from './app/barre-haut.js';
import { creerSante } from './natif/sante.js';
import { creerUsage, jourCle } from './natif/usage.js';
import { installerAvecBarre } from './app/installation.js';
import { enregistrerGestion } from './app/gestion.js';
import { creerFond } from './app/fond.js';
import { creerDossier } from './natif/dossier.js';
import { creerMouvement } from './app/mouvement.js';
import { garderBoxion } from './boxion-local/garde.js';
import { installerWebNatif } from './natif/web-natif.js';
import { creerMaintenant } from './natif/maintenant.js';
import { creerCube } from './app/cube.js';
import { creerLecteurNatif } from './natif/lecteur-natif.js';
import { creerFichiersNatif } from './natif/fichiers-natif.js';
import { creerCape } from './cape/cape.js';
import { creerModes } from './app/modes.js';
import { creerMiniDocks } from './app/minidocks.js';

const VERSION = '0.52.0';

// plus de zooms bizarres : la balise viewport est fixée (index.html) ; un bion qui la réécrit est remis en place aussitôt
function garderViewport() {
  const BON = 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
  const fixer = () => { for (const m of document.querySelectorAll('meta[name="viewport"]')) if (m.getAttribute('content') !== BON) m.setAttribute('content', BON); };
  try { new MutationObserver(fixer).observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ['content'] }); } catch (e) { /* */ }
  fixer();
}

// le clavier : toucher un champ lui donne le focus PENDANT le geste (en capture, avant qu'un bion n'annule le toucher) ; iOS n'ouvre le
// clavier que dans ce cas. Complète le correctif natif (AppDelegate.clavierSansGeste).
// LE CLAVIER NATIF GAGNE (RS-7 12.10, le rapport du test : focus pris puis perdu, pas de clavier) : le bion du labo jOSKeyboard (le clavier
// maison du xer) pose inputmode="none" sur tous les champs pour REMPLACER le clavier d'iOS — servi seul, sans sa partie HTML, il n'y a
// plus aucun clavier. Dans ploxi0n : jOSKeyboard est fourni par l'app (même API, il laisse faire iOS ; la version web n'est jamais chargée)
// et tout inputmode="none" posé par un bion est retiré aussitôt.
function clavierNatif() {
  window.jOSKeyboard = { v: 'ploxi0n', natif: true, attach() {}, show() {}, hide() { try { document.activeElement && document.activeElement.blur(); } catch (e) { /* */ } }, isMobile: () => true };
  const nettoyer = (el) => { if (el && el.getAttribute && el.getAttribute('inputmode') === 'none' && !el.hasAttribute('data-inputmode-voulu')) el.removeAttribute('inputmode'); };
  try {
    new MutationObserver((l) => { for (const m of l) { if (m.type === 'attributes') nettoyer(m.target); else for (const n of m.addedNodes) { if (n.nodeType === 1) { nettoyer(n); if (n.querySelectorAll) n.querySelectorAll('[inputmode="none"]').forEach(nettoyer); } } } })
      .observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['inputmode'] });
  } catch (e) { /* */ }
  document.querySelectorAll('[inputmode="none"]').forEach(nettoyer);
}

function clavierAuToucher() {
  const champ = (t) => t && t.closest && t.closest('input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=button]):not([type=submit]):not([disabled]):not([readonly]),textarea:not([disabled]):not([readonly]),[contenteditable]:not([contenteditable=false])');
  document.addEventListener('touchend', (e) => { const c = champ(e.target); if (c && document.activeElement !== c) { try { c.focus(); } catch (er) { /* */ } } }, { capture: true, passive: true });
}

const boot = (p, t) => { try { window.__boot && window.__boot(p, t); } catch (e) { /* */ } };
const bootLog = (t) => { try { window.__bootLog && window.__bootLog(t); } catch (e) { /* */ } };
// LE MODE SÛR DU DÉMARRAGE (RS-7 12.10 : « ça reste systématiquement bloqué ») : demandé par l'écran de chargement (bloqué 6 s → « mode sûr »)
// → ce lancement-ci SANS le fond photo, le thème vivant, la reprise de session, la barre du haut, le dossier Fichiers ni les notifications
// (les ajouts récents et lourds) ; une seule fois : le lancement suivant réessaie tout.
const sous3sPre = (pr) => Promise.race([pr, new Promise((_, ko) => setTimeout(() => ko(new Error('délai')), 3000))]);
let modeSurJs = false;
try { modeSurJs = localStorage.getItem('ploxi0n.mode-sur-js') === '1'; localStorage.removeItem('ploxi0n.mode-sur-js'); } catch (e) { /* */ }
async function demarrer() {
  if (modeSurJs) bootLog('🛟 mode sûr : sans fond photo, thème vivant, session, barre du haut, dossier, notifications');
  boot(8, 'le clavier, l\'écran');
  try { document.getElementById('px-boot-v').textContent = 'v' + VERSION.replace(/\.0$/, ''); } catch (e) { /* */ }
  let compteRef = null;   // le compte (plus bas) : admin → les ploxions admin du marketplace ; connecté → jOSBoxion sur le boxion
  garderViewport();
  clavierNatif();
  clavierAuToucher();
  installerClavierIos({ W: window });   // les bons attributs pour le clavier d'iOS (dictée, trousseau, codes SMS, Entrée)
  const racine = document.getElementById('ploxi0n');
  boot(14, 'boxion local');
  // la garde : un appel au boxion local ne fige plus jamais l'app (5 s au plus, puis la valeur par défaut, noté)
  const boxion = garderBoxion(await ouvrirBoxionLocal(), { delai: 5000, surLent: (i) => bootLog('⚠ boxion lent : ' + i.appel + ' > 5 s') });
  boot(12, 'boxion local ouvert');
  // l'espace libre du téléphone (AppDelegate) : au journal ; un disque presque plein fige tout
  try { const { Preferences } = await import('@capacitor/preferences'); const l = +((await sous3sPre(Preferences.get({ key: 'ploxi0n.espace-libre' }))).value || 0), v = (await sous3sPre(Preferences.get({ key: 'ploxi0n.caches-vides' }))).value;
    if (l) bootLog('espace libre : ' + (l / 1e9).toFixed(1) + ' Go' + (l < 1.5e9 ? ' ⚠ presque plein' : '') + (v ? ' · caches vidés (' + v + ')' : '')); } catch (e) { /* */ }
  const prefs = creerPrefs({ boxion }); await prefs.pret; prefs.appliquer();   // l'apparence avant le premier dessin
  boot(16, 'réglages · apparence');
  // 🖼 le fond d'écran (photo ou motif gravé), avant le premier dessin aussi
  const fond = modeSurJs ? null : creerFond({ boxion, vibrer: (x) => { try { window.jOSNatif && window.jOSNatif.vibrer && window.jOSNatif.vibrer(x); } catch (e) { /* */ } } }); if (fond) { await fond.pret; window.ploxi0nFond = fond; }
  boot(19, 'fond : ' + (fond ? fond.reglage().type : 'sauté (mode sûr)'));
  // le plein écran complet : la barre d'état cachée (StatusBar) ; l'indicateur d'accueil et les bords haut/bas (PloxionVC, natif, lit la préférence)
  async function pleinEcran(p) {
    if (!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())) return;
    try { const { Preferences } = await import('@capacitor/preferences'); await Preferences.set({ key: 'ploxi0n.plein-ecran', value: p.pleinEcran ? '1' : '0' }); } catch (e) { /* */ }
    // la barre d'état et l'indicateur d'accueil : SystemBars (Capacitor 8)
    try { const { SystemBars, SystemBarType } = await import('@capacitor/core');
      for (const bar of [SystemBarType.StatusBar, SystemBarType.NavigationBar]) { if (p.pleinEcran) await SystemBars.hide({ bar }); else await SystemBars.show({ bar }); } } catch (e) { /* */ }
  }
  pleinEcran(prefs.lire()); prefs.surChangement(pleinEcran);
  barreClavier(prefs.lire().barreClavier !== false); prefs.surChangement((p) => barreClavier(p.barreClavier !== false));
  installerJosNatif(window); boot(23, 'jOSNatif · ' + (window.jOSNatif.natif ? 'iPhone' : 'navigateur'));   // ⚡ le bion natif : toutes les capacités de l'iPhone, pour tous les ploxions
  // l'haptique de l'app (ouvrir, revenir, minimiser, les bords, les pages…) : par jOSNatif, coupée dans ⚙ › Apparence
  // 🎞 le lecteur natif : chaque <video>/<audio>/<iframe YouTube> des ploxions (écran verrouillé, AirPlay, PiP, YouTube par https, haptique du son)
  const titrePx = () => (routeur && routeur.courant() && (routeur.catalogue().find(p => p.id === routeur.courant()) || {}).nom) || 'ploxi0n';
  // 🎞 (0.49) le lecteur intégré natif : Apple, VLC en repli ; jOSplayer, les vidéos illisibles ou muettes, vlc://, ploxi0n://lire
  const lecteurNatif = creerLecteurNatif({ boxion, vibrer: (x) => vibrer(x), titre: titrePx });
  window.ploxi0nLecteurNatif = lecteurNatif;
  const lecteur = installerLecteur({ boxion, vibrer: (s) => vibrer(s), titre: titrePx, surMedia: (m) => lecteurNatif.surMedia(m) });
  window.jOSNatif.lecteur = { pip: (m) => lecteur.pip(m), pleinEcran: (m) => lecteur.pleinEcran(m), airplay: (m) => lecteur.airplay(m), ...lecteurNatif.api };
  const haptique = creerHaptique({ boxion, actif: () => prefs.lire().haptique !== false && !!(window.jOSNatif && window.jOSNatif.natif) }); await haptique.pret;
  // un événement de l'app, un style, ou un motif inventé ; ouvrir/reprendre un ploxion = SA signature (ou son choix, ou son manifeste)
  const vibrer = (ev, id) => ((ev === 'ouvrir' || ev === 'reprendre') && id
    ? haptique.jouerPloxion(id, ev, window.jOSApps && window.jOSApps[id] && window.jOSApps[id].manifest && window.jOSApps[id].manifest.haptique)
    : haptique.jouer(ev));
  window.jOSNatif.haptique = (x) => haptique.jouer(x);   // les ploxions (le clicker…) jouent un style, un motif ou un événement
  const bionsCharges = new Set();   // un seul chargement par bion, pour toute l'app
  let routeur = null;
  // ▤ (0.51) les mini docks : tout ce qui vit en arrière-plan (ploxions minimisés, musique, blouse, Santé, vidéo, vocal, brouillon), au-dessus du dock
  const miniDocks = creerMiniDocks({ routeur: () => routeur, prefs: () => prefs.lire(), vibrer: (x) => vibrer(x) });
  window.jOSMiniDock = miniDocks.api; prefs.surChangement(() => miniDocks.planifier());
  // 🎞 une vidéo fermée en cours de route : un mini dock pour la reprendre là où elle en était
  const hms = (s) => { s = Math.round(+s || 0); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s % 60).padStart(2, '0'); };
  lecteurNatif.api.surEvenement((e) => {
    if (e.etat === 'ferme' && e.position > 30 && (!e.duree || e.position < e.duree - 60)) {
      const reprendre = () => lecteurNatif.ouvrir(e.url, { titre: e.titre }).catch(() => {});
      miniDocks.publier({ cle: 'video', titre: e.titre || 'la vidéo', icone: '🎞', sous: 'reprendre à ' + hms(e.position) + (e.duree ? ' / ' + hms(e.duree) : ''), progression: e.duree ? e.position / e.duree : null,
        ouvrir: reprendre, actions: [{ id: 'reprendre', icone: '▶', nom: 'reprendre', faire: reprendre }] });
    } else if (e.etat === 'lecture' || e.etat === 'fin') miniDocks.retirer('video');
  });
  // ⚡ le web devient natif : vibrate, geolocation, Notification, la dictée, les QR, le gyroscope, Bluetooth, NFC, wakeLock… de TOUS les ploxions
  try {
    installerWebNatif({ W: window, prefs: () => prefs.lire(), courant: () => routeur && routeur.courant(), ouvrirPloxion: (id) => { if (routeur && routeur.connait(id)) routeur.ouvrir(id); },
      mouvementActif: () => document.documentElement.classList.contains('px-anime'), lienPublic: SOURCE });
  } catch (e) { bootLog('⚠ web natif : ' + (e && e.message)); }
  lecteurNatif.brancherOuvrir();   // (0.51) APRÈS web-natif : window.open d'un flux → le lecteur natif, pas Safari
  boot(24, 'le web devient natif');
  // 📁 (0.49) envoyer vers, aperçu (QuickLook), zip, la galerie, le sélecteur de fichiers, Plans, Mail, la lampe
  { const fx = creerFichiersNatif(); Object.assign(window.jOSNatif, { envoyer: fx.envoyer, apercu: fx.apercu, zip: fx.zip, dezipper: fx.dezipper, photos: fx.photos, choisirFichiers: fx.ouvrir, carte: fx.carte, mail: fx.mail, lampe: fx.lampe }); }
  // ♫ à l'écoute : ce que jouent les ploxions (Spotify, Media Session) → l'écran verrouillé, le widget, le mini-lecteur (avant tout ploxion)
  const maintenant = creerMaintenant({ miniDock: miniDocks, courant: () => routeur && routeur.courant(), ouvrir: (id) => { if (routeur && routeur.connait(id)) routeur.ouvrir(id); },
    valeur: (k, t, v) => { try { return raccourcis ? raccourcis.valeur(k, t, v) : Promise.resolve(); } catch (e) { return Promise.resolve(); } } });   // raccourcis : déclaré plus bas
  window.jOSNatif.lecture = maintenant.api;
  // un ploxion en ouvre un autre (jOSXerPrefs.ouvrir, jOS.openPloxion) : s'il n'est pas installé et qu'il y a du réseau, on l'installe à la volée
  const routeurProxy = {
    async ouvrir(id, params) {
      if (!routeur.connait(id)) {
        try { const c = await depot.catalogue({ reseau: false }); const m = (c.items || []).find(x => x.id === id) || {}; await installerAvecBarre({ depot, id, meta: { nom: m.nom, icone: m.icone }, vibrer: (x) => vibrer(x) }); await majAccueil(); }   // ⬇ la barre (un xerkion, un lien…)
        catch (e) { return false; }
      }
      return routeur.ouvrir(id, params);
    },
    connait: (id) => routeur.connait(id), fermer: () => routeur.fermer(),
  };
  // LE MODE CONNECTÉ (RS-7 : « les utiliser tous seuls, mais connectés ») : en ligne, toute route du serveur qu'un ploxion appelle part sur
  // xerboxion.org, avec X-Ploxi0n et le jeton de la personne (labo : JetonAppWeb, docs/dev/57) ; hors ligne, la dernière réponse connue.
  // Les routes nommées d'abord : /bother → l'API sans session (bother me, le ploxion des testeurs). Kill-switch : reglages/mode-connecte = false.
  const enTetes = async () => { const c = await boxion.get('compte', 'courant').catch(() => null); return c && c.jeton ? { 'X-Ploxi0n': '1', Authorization: 'Bearer ' + c.jeton } : { 'X-Ploxi0n': '1' }; };
  let modeConnecte = (await boxion.get('reglages', 'mode-connecte')) !== false;
  const fetchOrigine = window.fetch.bind(window), httpRelais = creerHttp(window, enTetes);
  const relais = { routes: [{ prefixe: '/bother', vers: (p) => SOURCE + '/api/app' + p }], general: () => modeConnecte && navigator.onLine !== false, vers: (p) => SOURCE + p,
    envoyer: (q) => httpRelais.requete(q, fetchOrigine) };
  // jOSBoxion connecté : le boxion fait foi quand on est connecté et en ligne (pourriture-4, les notes… retrouvent leur historique)
  const distant = {
    actif: () => modeConnecte && navigator.onLine !== false && !!(compteRef && compteRef.etat().connecte),
    connecte: () => !!(compteRef && compteRef.etat().connecte),
    appel: async (methode, chemin, corps) => {
      const r = await httpRelais.requete({ methode, url: SOURCE + chemin, headers: { Accept: 'application/json', ...(corps ? { 'Content-Type': 'application/json' } : {}) }, corps: corps ? JSON.stringify(corps) : undefined }, fetchOrigine);
      let data = null; try { data = JSON.parse(r.texte || 'null'); } catch (e) { /* */ }
      return { status: r.status, data };
    },
  };
  boot(30, 'le shim jOS · tsoins');
  const shim = await installerShim({ boxion, routeur: routeurProxy, relais, distant });
  maintenant.brancherBus();   // ♫ (0.51) le bus des lecteurs du labo (jOSSound, ploxion.spotify.track) : le son sans SDK ni Media Session
  boot(40, 'shim jOS · ' + ((window.jOSTsoin && window.jOSTsoin.list) ? window.jOSTsoin.list().length : 0) + ' tsoins relus');
  boot(45, 'les ploxions de base');
  window.addEventListener('online', () => { if (window.jOSBoxion && window.jOSBoxion.pousser) window.jOSBoxion.pousser().catch(() => {}); });
  // les images des ploxions en chemins du site → xerboxion.org ; celles qui exigent le compte → récupérées avec le jeton (data: URL)
  installerImages({ W: window, source: SOURCE, signer: async (chemins) => {
    if (!(compteRef && compteRef.etat().connecte)) return {};
    const r = await httpRelais.requete({ methode: 'POST', url: SOURCE + '/api/app/media', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, corps: JSON.stringify({ chemins }) }, fetchOrigine);
    try { return r.status === 200 ? (JSON.parse(r.texte).urls || {}) : {}; } catch (e) { return {}; }
  }, avecJeton: async (url) => {
    const h = await enTetes();
    if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
      const { CapacitorHttp } = await import('@capacitor/core');
      const r = await CapacitorHttp.get({ url, headers: h, responseType: 'blob' });
      if (r.status !== 200 || !r.data) return null;
      const type = (r.headers && (r.headers['Content-Type'] || r.headers['content-type'])) || 'image/png';
      return 'data:' + String(type).split(';')[0] + ';base64,' + r.data;
    }
    const r = await fetchOrigine(url, { headers: h }); if (!r.ok) return null;
    return URL.createObjectURL(await r.blob());
  } });
  window.jOSVerrou = creerVerrou();   // Face ID pour les ploxions
  // les fichiers de l'app : le fetch d'origine (jamais le relais) et jamais plus de 3 s (le démarrage n'attend jamais le réseau)
  const sous3s = (pr) => Promise.race([pr, new Promise((_, ko) => setTimeout(() => ko(new Error('délai')), 3000))]);
  const lireJson = async (u, defaut) => { try { return await sous3s(fetchOrigine(u).then(r => r.json())); } catch (e) { bootLog('⚠ ' + u + ' : ' + e.message); return defaut; } };
  const indexPack = await lireJson('/ploxions/index.json', { ploxions: [] }), pack = indexPack.ploxions || [];
  const compat = await lireJson('/marketplace/compat.json', {});
  const depot = creerDepot({ boxion, http: creerHttp(window, enTetes), estAdmin: () => !!(compteRef && compteRef.etat().admin), compat, packLocal: pack, lireLocal: async (id) => (await fetch('/ploxions/' + encodeURIComponent(id) + '/app.js')).text(),
    lireBionLocal: async (b) => { const r = await fetchOrigine('/bions/' + encodeURIComponent(b) + '.js'); if (!r.ok) throw new Error('bion absent'); return r.text(); } });
  // les ploxions de base (index.json « base » : bother me pour les testeurs) : installés une fois, au premier lancement ; retirables ensuite
  const deja = (await boxion.get('reglages', 'base-installes')) || [];
  for (const id of (indexPack.base || []).filter(b => !deja.includes(b))) {
    try { await depot.installerLocal(id); deja.push(id); } catch (e) { console.warn('ploxion de base', id, e); }
  }
  await boxion.put('reglages', 'base-installes', deja);
  boot(50, deja.length + ' ploxions de base');
  // 0.8 : les bions TOUCHÉS (pas seulement déclarés) ; les ploxions installés avant sont complétés une fois, en ligne, sans bloquer le démarrage
  if (!(await boxion.get('reglages', 'bions-v2')) && navigator.onLine !== false) {
    depot.completerBions().then(r => { boxion.put('reglages', 'bions-v2', { le: new Date().toISOString(), r }); }).catch(() => {});
  }
  const internes = [
    enregistrerMarketplace({ depot, vibrer, surChangement: () => majAccueil(), usage: () => boxion.get('usage', 'stats'), prefs: { lire: () => boxion.get('reglages', 'marketplace'), ecrire: (v) => boxion.put('reglages', 'marketplace', v) } }),
    enregistrerXerEnLigne({}),
    enregistrerBanc({ boxion, version: VERSION }),
  ];
  let raccourcis = null;
  async function majAccueil() {
    const installes = await depot.installes();
    // la catégorie vient du catalogue en cache (la vue « par catégorie » de l'accueil)
    const cat = new Map(((await depot.catalogue({ reseau: false }).catch(() => null)) || { items: [] }).items.map(x => [x.id, x]));
    const liste = [...installes.map(p => ({ id: p.id, nom: p.nom, icone: p.icone, categorie: (cat.get(p.id) || {}).categorie || 'Autres', cat_icone: (cat.get(p.id) || {}).cat_icone || '📦' })),
      ...internes.map(p => ({ categorie: 'ploxi0n', cat_icone: '◇', ...p }))];
    routeur.majCatalogue(liste);
    if (raccourcis) raccourcis.publier(liste).catch(() => {});   // l'app Raccourcis et Siri proposent les ploxions installés
  }
  const compte = creerCompte({ boxion, http: creerHttp(window) });
  boot(62, 'ton compte');
  await compte.pret; compteRef = compte;
  { const e = compte.etat(); boot(64, e.connecte ? 'compte : ' + e.nom + ' · ' + e.palier : 'sans compte (tout reste ici)'); }
  if (navigator.onLine !== false) { compte.rafraichir().catch(() => {}); if (window.jOSBoxion.pousser) window.jOSBoxion.pousser().catch(() => {}); }   // le rang et « admin » à jour (un jeton expiré → déconnecté)
  const reglerModeConnecte = (v) => { if (v != null) { modeConnecte = !!v; boxion.put('reglages', 'mode-connecte', modeConnecte); } return modeConnecte; };
  // 🎙 les vocaux : enregistrer, transcrire (iOS, le vocabulaire du xerboxion), garder ; jOSNatif.vocal pour les ploxions
  const vocal = creerVocal({ boxion, catalogue: () => (routeur ? routeur.catalogue() : []), vibrer: (x) => vibrer(x), ouvrir: (id, p) => routeurProxy.ouvrir(id, p),
    surEtat: (on) => { if (routeur) routeur.rafraichirHud(); if (!on) return miniDocks.retirer('vocal');   // ▤ 🎙 le vocal qui enregistre : ■ depuis l'accueil
      miniDocks.publier({ cle: 'vocal', titre: 'j\'enregistre…', icone: '🎙', enCours: true, fermable: false, sous: '■ pour arrêter et transcrire', ouvrir: () => vocal.basculer(), actions: [{ id: 'stop', icone: '■', nom: 'arrêter', faire: () => vocal.basculer() }] }); } });
  window.jOSNatif.vocal = vocal.api;
  // ⧗ les tsoins natifs : le composeur (dock, geste, Siri, jOSNatif.tsoin) et le journal ; connecté, ils partent aussi au boxion
  const tsoinNatif = creerTsoinNatif({ boxion, vibrer: (x) => vibrer(x), vocal, contexte: () => (routeur ? routeur.courant() : null),
    distant: () => (compte.etat().connecte && modeConnecte && navigator.onLine !== false ? window.jOSBoxion : null) });
  internes.push(tsoinNatif.ploxion);
  // 📦 le gestionnaire : les ploxions installés, leur place, leurs bions
  internes.push(enregistrerGestion({ depot, vibrer: (x) => vibrer(x), ouvrir: (id) => routeurProxy.ouvrir(id), retirer: async (id) => { await routeur.retirerPloxion(id); await majAccueil(); } }));
  // ❤ la santé : Apple Santé lue sur le téléphone (le ploxion « Santé ») ; jOSNatif.sante pour les ploxions, sur accord
  const sante = creerSante({ boxion, vibrer: (x) => vibrer(x), courant: () => (routeur ? routeur.courant() : null),
    distant: () => (compte.etat().connecte && modeConnecte && navigator.onLine !== false ? window.jOSBoxion : null),   // ☁ le résumé sur ton boxion (si activé)
    valeur: (k, t, v) => (raccourcis ? raccourcis.valeur(k, t, v) : Promise.resolve()) });
  // ◈ le cube des widgets : six infos des bions (les valeurs), et la dernière inclinaison du téléphone
  const cube = creerCube({ boxion, valeurs: () => (raccourcis ? raccourcis.toutes() : {}) });
  internes.push(sante.ploxion);
  // 🥼 labo-cape (0.50, lot L1) : la blouse RS-7 en BLE, ou sa simulation (le moteur de cape-core)
  internes.push(creerCape({ boxion, vibrer: (x) => vibrer(x) }).ploxion);
  window.jOSNatif.sante = sante.api;
  setTimeout(() => sante.synchroniser().catch(() => {}), 5000);   // ☁ hors du chemin critique : le résumé santé (si activé et connecté)
  window.jOSNatif.tsoin = (o) => tsoinNatif.ouvrir(o || {});
  const hud = creerHud({ compte, boxion, vocalEnCours: () => vocal.enCours(), trouver: (id) => routeur && routeur.catalogue().find(p => p.id === id), modeConnecte: () => modeConnecte });
  await hud.pret;
  boot(70, 'HUD · dock');
  // ⚙ les réglages : un ploxion interne, au bout du ⚙ de l'accueil (jamais retirable)
  // les notifications (test, et les messages de coord tant que l'app est au premier plan ; la vraie « app fermée » demande APNs)
  const notifs = creerNotifs({ boxion, vibrer, envoyer: (q) => httpRelais.requete(q, fetchOrigine), ouvrir: (id) => routeurProxy.ouvrir(id) });
  await notifs.pret;
  boot(73, 'notifications');
  internes.push(enregistrerReglages({ compte, hud, routeur: () => routeur, depot, boxion, modeConnecte: reglerModeConnecte, notifs, prefs, vibrer, haptique, lecteur, lecteurNatif, sante, cube, valeurs: () => (raccourcis ? raccourcis.toutes() : {}), version: VERSION }));
  // le vecteur xerion de ce téléphone : le temps passé par ploxion (même forme que jOSUsage du labo : { px: { id: { opens, seconds, lastAt } } })
  async function surUsage(id, sec) {
    const u = (await boxion.get('usage', 'stats')) || { px: {} };
    const p = u.px[id] = u.px[id] || { opens: 0, seconds: 0, lastAt: 0 };
    p.opens++; p.seconds += sec; p.lastAt = Date.now();
    // les jours aussi (comme jOSUsage du labo : 60 jours) — xp › Vecteur les montre
    u.days = u.days || {}; const k = jourCle(), d = u.days[k] = u.days[k] || { opens: 0, seconds: 0, px: {} };
    d.opens++; d.seconds += sec; const dp = d.px[id] = d.px[id] || { o: 0, s: 0 }; dp.o++; dp.s += sec;
    const ks = Object.keys(u.days).sort(); while (ks.length > 60) delete u.days[ks.shift()];
    await boxion.put('usage', 'stats', u);
    usage.relire().catch(() => {});
  }
  // 🧭 jOSUsage : le temps de ce téléphone + celui du web (lu sur le boxion, connecté) — xp › Vecteur, les quêtes, l'ultimate-xp
  const usage = creerUsage({ boxion, distant: () => (compte.etat().connecte && modeConnecte ? window.jOSBoxion : null),
    registre: async () => Object.fromEntries((((await depot.catalogue({ reseau: false }).catch(() => null)) || {}).items || []).map(p => [p.id, { c: p.cat || p.categorie || 'autre', l: p.categorie || 'Autre', i: p.cat_icone || '📦', n: p.nom, ic: p.icone }])) });
  window.jOSUsage = usage;
  // un ploxion sur l'écran d'accueil de l'iPhone (via Raccourcis) : depuis l'édition de l'accueil et la fiche du marketplace
  const ecranAccueil = creerEcranAccueil({ trouver: (id) => routeur.catalogue().find(p => p.id === id), liste: () => routeur.catalogue(), boxion, envoyer: (q) => httpRelais.requete(q, fetchOrigine) });
  window.jOSEcranAccueil = ecranAccueil;
  boot(78, 'l\'accueil');
  // ◈ (0.50) les modes : chill-tekk, xerboxion (l'UI du labo), xerbot (le monde physique)
  const modes = creerModes({ prefs, ouvrir: (id) => routeurProxy.ouvrir(id), connait: (id) => !!(routeur && routeur.connait(id)), source: SOURCE, vibrer: (x) => vibrer(x) });
  modes.attacher(racine);
  routeur = creerRouteur({ panneau: () => modes.panneau(), racine, catalogue: internes, boxion, vibrer, doubleBord: () => routeurProxy.ouvrir('portion'), surVocal: () => vocal.basculer(), ouvrirExterne: (id) => routeurProxy.ouvrir(id), prefs: () => prefs.lire(), usage: () => boxion.get('usage', 'stats'), retirer: async (id) => { await depot.retirer(id); await majAccueil(); }, verrou: window.jOSVerrou, bundleLocal: (id) => depot.bundle(id, { deja: bionsCharges }), apresChargement: () => { boxion.get('reglages', 'bions-coupes').then(c => brancherPlugions(window, new Set(c || []))).catch(() => {}); }, hud, ecranAccueil, surUsage: (id, s) => surUsage(id, s).catch(() => {}),
    miniDocks: { surVivants: () => miniDocks.planifier(), surFermeture: (id) => miniDocks.surFermeture(id), page: () => miniDocks.ouvrirPage() },
    tsoin: () => tsoinNatif.ouvrir(), surSession: (x) => { boxion.put('reglages', 'session', x).catch(() => {}); barreHaut.peindre(); usage.track(x.courant); } });
  // ▔ notre barre du haut, en plein écran (la place de la barre d'état d'iOS) : composable, appui long dessus
  const barreHaut = creerBarreHaut({ boxion, compte, vibrer: (x) => vibrer(x), actif: () => { const q = prefs.lire(); return !!q.pleinEcran && q.barreHaut !== false; },
    courant: () => { const c = routeur.courant(); return c ? ((routeur.catalogue().find(p => p.id === c) || {}).nom || c) : null; },
    ouverts: () => routeur.vivants().length + routeur.endormis().length });
  if (!modeSurJs) barreHaut.installer(document.body);
  // 🌀 le thème vivant : il suit le gyroscope et l'accéléromètre (seulement à l'accueil, visible, hors Calme)
  if (!modeSurJs) creerMouvement({ prefs, racine });
  prefs.surChangement(() => barreHaut.mesurer());
  window.ploxi0nBarreHaut = barreHaut;
  const rafraichir = () => { if (routeur.courant()) routeur.rafraichirHud(); else routeur.accueil(); };
  compte.surChangement(rafraichir);
  hud.surChangement(() => routeur.rafraichirHud());
  window.addEventListener('online', () => routeur.rafraichirHud()); window.addEventListener('offline', () => routeur.rafraichirHud());
  await majAccueil();
  boot(86, routeur.catalogue().length + ' ploxions à l\'accueil');
  // jOSApps.monter / peut, comme dans le labo : un ploxion en monte un autre dans un coin (fill the gaps, les « ultimate »). Démontable.
  window.jOSApps.peut = (id) => routeur.connait(id);
  window.jOSApps.monter = (id, hote, ctx) => {
    let inst = null, mort = false;
    const pret = routeur.charger(id).then(app => { if (mort) return null; inst = app.mount(hote, ctx || { embed: true }) || null; return inst; })
      .catch(e => { if (hote) hote.textContent = '⚠ « ' + id + ' » indisponible : ' + (e && e.message); });
    return { ready: pret, unmount() { mort = true; if (inst && inst.unmount) { try { inst.unmount(); } catch (e) { /* */ } } inst = null; } };
  };
  window.ploxi0n = { boxion, shim, routeur, depot, compte, version: VERSION, modeConnecte: reglerModeConnecte };
  brancherLiens({ routeur, compte, installer: (id) => routeurProxy.ouvrir(id), lecture: (c) => maintenant.commander(c), lire: (o) => lecteurNatif.ouvrir(o.url, o).catch(() => {}),
    actions: { tsoin: () => tsoinNatif.ouvrir({}), vocal: () => vocal.basculer().catch(() => {}), lampe: () => window.jOSNatif.lampe().catch(() => {}) } });   // une icône de l'écran d'accueil vers un ploxion absent : installé à la volée
  // « Dis à ploxi0n … » (Siri, la dictée) : une phrase → une action
  async function commande(texte) {
    const c = comprendre(texte);
    await boxion.append('tsoins', { kind: 'action', k: 'siri', d: String(texte).slice(0, 300), action: c.action, source: 'siri' }).catch(() => {});
    if (c.action === 'ouvrir' || c.action === 'ouvrir-ou-chercher') {
      const p = trouverPloxion(c.quoi, routeur.catalogue());   // le vocabulaire du xerboxion + un rapprochement phonétique
      if (p) return routeur.ouvrir(p.id);
      return routeur.ouvrir('marketplace', { chercher: '1', q: c.quoi });
    }
    if (c.action === 'chercher') return routeur.ouvrir('marketplace', { chercher: '1', q: c.quoi });
    if (c.action === 'noter') { await tsoinNatif.enregistrer({ texte: c.quoi, genre: 'note' }); return true; }
    if (c.action === 'accueil') return routeur.accueil();
    if (c.action === 'minimiser') return routeur.minimiser();
  }
  window.ploxi0nCommande = commande;
  raccourcis = creerRaccourcis({ routeur, boxion, commande });
  // les valeurs pour « Lire une valeur de ploxi0n » (Raccourcis, Siri ; les widgets ensuite) ; un ploxion publie les siennes (préfixe px.)
  window.ploxi0nWidgets = { publier: () => publierValeurs(), etat: async () => { try { const { Preferences } = await import('@capacitor/preferences'); return JSON.parse((await Preferences.get({ key: 'ploxi0n.widgets-etat' })).value || 'null'); } catch (e) { return null; } } };
  window.jOSRaccourcis = { publierValeur: (cle, titre, valeur) => raccourcis.valeur('px.' + String(cle), titre, valeur) };
  async function publierValeurs() {
    const jour = new Date().toISOString().slice(0, 10), e = compte.etat();
    const t = await boxion.lire('tsoins', { limite: 2000 }).catch(() => []);
    const duJour = t.filter(x => new Date(x.t).toISOString().slice(0, 10) === jour), dernier = t[t.length - 1];
    await raccourcis.valeur('tsoins-jour', 'Tsoins aujourd\'hui', duJour.length);
    await raccourcis.valeur('dernier-tsoin', 'Dernier tsoin', dernier ? (dernier.entry.d || dernier.entry.action || dernier.entry.kind || '') : '—');
    await raccourcis.valeur('ploxions', 'Ploxions installés', (await depot.installes()).length);
    await raccourcis.valeur('compte', 'Compte', e.connecte ? (e.nom + ' · ' + e.palier) : 'pas connecté');
    await raccourcis.valeur('mode', 'Mode connecté', modeConnecte ? 'oui' : 'non');
    await raccourcis.epingles(hud.config().epingles.map(id => routeur.catalogue().find(p => p.id === id)).filter(Boolean));
    await cube.publier();
  }
  hud.surChangement(() => publierValeurs().catch(() => {}));
  raccourcis.publier(routeur.catalogue()).catch(() => {});   // le catalogue est déjà là : seulement le publier vers Raccourcis
  // 🧭 le tuto d'accueil : une fois (par version du tuto) ; ⚙ › À propos › « revoir le tuto »
  const tuto = creerOnboarding({ boxion, vibrer: (x) => vibrer(x), connecter: () => compte.connecter() });
  window.ploxi0nTuto = tuto;
  // ✦ après une mise à jour : ce qui a changé (pas au tout premier lancement : le tuto)
  const nouveautes = creerNouveautes({ boxion, version: VERSION, vibrer: (x) => vibrer(x) });
  window.ploxi0nNouveautes = nouveautes;
  tuto.auDemarrage().then((premier) => nouveautes.auDemarrage({ premierLancement: premier })).catch(() => {});
  // « ok » pour la boîte noire seulement APRÈS la reprise de la session : un ploxion qui plante en se rouvrant compte comme un plantage
  // au lancement, et la fois suivante il restera endormi
  let plantesAvant = 0;
  const lancementOk = async () => { boot(100, 'prêt'); try { const j = window.__bootJournal && window.__bootJournal(); if (j) boxion.put('reglages', 'demarrage', { ...j, version: VERSION, le: new Date().toISOString() }).catch(() => {}); } catch (e) { /* */ } try { window.__bootFin && window.__bootFin(); } catch (e) { /* */ } try { const { Preferences } = await import('@capacitor/preferences'); await Preferences.set({ key: 'ploxi0n.lancement', value: 'ok' }); } catch (e) { /* hors iPhone */ } };
  // la boîte noire (AppDelegate) : la page a fini de démarrer → « ok » ; un lancement planté avant est signalé (et le mode sûr)
  try {
    const { Preferences } = await import('@capacitor/preferences');
    const n = +((await Preferences.get({ key: 'ploxi0n.plantages' })).value || 0), sur = (await Preferences.get({ key: 'ploxi0n.mode-sur' })).value === '1';
    plantesAvant = n;
    if (n > 0) {
      await boxion.append('tsoins', { kind: 'app', action: 'plantage-au-lancement', n, sur }).catch(() => {});
      const b = document.createElement('div'); b.className = 'px-bulle';
      b.innerHTML = '⚠ ploxi0n a planté ' + n + ' fois au lancement' + (sur ? ' — <b>mode sûr</b> (clavier et widgets en pause)' : '') + '. <u data-rapport>envoyer à bother me</u>';
      racine.appendChild(b); setTimeout(() => b.remove(), 9000);
      b.addEventListener('click', () => { b.remove(); routeurProxy.ouvrir('bother', { texte: 'ploxi0n ' + VERSION + ' : ' + n + ' plantage(s) au lancement' + (sur ? ', mode sûr' : '') + ' — ' + navigator.userAgent }); });
    }
  } catch (e) { /* hors iPhone */ }
  // un ploxion a navigué la page vers /px/<id>?… (labo) : l'app s'est rechargée là — on rouvre CE ploxion, avec ses paramètres
  const chemin = location.pathname.match(/^\/px\/([^/?#]+)/);
  if (chemin) {
    const pid = decodeURIComponent(chemin[1]), params = Object.fromEntries(new URLSearchParams(location.search));
    try { history.replaceState(null, '', '/'); } catch (e) { /* */ }
    if (await routeurProxy.ouvrir(pid, Object.keys(params).length ? params : null)) { lancementOk(); return; }
  }
  const id = decodeURIComponent((location.hash.match(/^#\/(.+)$/) || [])[1] || '');
  // l'écran de chargement s'en va dès que l'accueil est là ; la session d'avant se rouvre ensuite, sous les yeux (le ploxion qui monte)
  await routeur.accueil();
  boot(94, 'accueil prêt');
  try { window.__bootFin && window.__bootFin(); } catch (e) { /* */ }
  if (id && routeur.connait(id)) await routeur.ouvrir(id);
  else {
    // la session d'avant (fermée, tuée par iOS, plantée) : le ploxion de devant revient ; après un plantage au lancement, tout dort 💤
    const sess = !modeSurJs && prefs.lire().reprendre !== false ? await boxion.get('reglages', 'session').catch(() => null) : null;
    if (sess && Array.isArray(sess.vivants) && sess.vivants.length) {
      await routeur.restaurer(sess, { devant: plantesAvant === 0 }).catch(() => routeur.accueil());
      if (plantesAvant > 0) { const b = document.createElement('div'); b.className = 'px-bulle'; b.textContent = '💤 tes ' + sess.vivants.length + ' ploxion(s) d\'avant dorment dans ⧉ (glisse un bord pour y revenir)'; racine.appendChild(b); setTimeout(() => b.remove(), 6000); }
    } else routeur.accueil();
  }
  lancementOk();
  // le boxion local a été lent : le dire ; et, plus tard, ranger le cache des routes (il grossissait sans fin : une clé par sondage)
  if (boxion.lents().length) { const b = document.createElement('div'); b.className = 'px-bulle'; b.textContent = '⚠ le stockage du téléphone a été lent (' + boxion.lents().length + ' appel(s) > 5 s) : l\'app s\'est ouverte quand même ; ⚙ › Données › vider le cache peut aider'; racine.appendChild(b); setTimeout(() => b.remove(), 9000); }
  setTimeout(async () => {
    try {
      const l = await boxion.list('routes'); let n = 0;
      const vieux = l.filter(x => /[?&](since|t|_|after|ts|depuis)=/.test(x.key));
      const reste = l.filter(x => !vieux.includes(x)).sort((a, b) => (b.maj || 0) - (a.maj || 0)).slice(300);
      for (const x of [...vieux, ...reste]) { await boxion.del('routes', x.key); n++; }
      if (n) console.info('[ploxi0n] cache des routes rangé :', n, 'entrées');
    } catch (e) { /* */ }
  }, 15000);
  // un raccourci (Siri, l'app Raccourcis, une automatisation) a pu demander un ploxion ou noter un tsoin
  raccourcis.recevoir().catch(() => {});
  publierValeurs().catch(() => {});
  // 📁 le dossier « Sur mon iPhone › ploxi0n » (l'app Fichiers) : en différé au lancement, puis à chaque passage en arrière-plan
  const dossier = creerDossier({ boxion, depot });
  window.jOSNatif.fichiers = dossier.api;
  if (!modeSurJs && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) setTimeout(() => dossier.synchroniser().catch(() => {}), 4000);
  // l'app passe en arrière-plan : toutes les vidéos s'arrêtent (sauf l'image dans l'image) ; le son continue (le mode audio, voulu)
  function couperVideosArrierePlan() { try { for (const m of document.querySelectorAll('video')) { if (!m.paused && document.pictureInPictureElement !== m && !m.webkitPresentationMode?.startsWith?.('picture')) m.pause(); } } catch (e) { /* */ } }
  if (!modeSurJs) notifs.demarrer();
  else { const b = document.createElement('div'); b.className = 'px-bulle'; b.textContent = '🛟 mode sûr pour ce lancement (le prochain réessaie tout). S\'il s\'est ouvert : le coupable est le fond photo, le thème vivant ou la session — dis-le à bother me.'; racine.appendChild(b); setTimeout(() => b.remove(), 9000); }
  if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
    import('@capacitor/app').then(({ App }) => App.addListener('appStateChange', (e) => { if (e.isActive) { raccourcis.recevoir().catch(() => {}); notifs.demarrer(); sante.synchroniser().catch(() => {}); } else { notifs.arreter(); publierValeurs().catch(() => {}); dossier.synchroniser().catch(() => {}); couperVideosArrierePlan(); } })).catch(() => {});
  }
}
demarrer().catch((e) => { try { window.__bootFin && window.__bootFin(); } catch (er) { /* */ } document.getElementById('ploxi0n').innerHTML = '<p class="px-erreur">ploxi0n n\'a pas pu démarrer : ' + String(e && e.message).replace(/[<&]/g, '') + '</p>'; });
