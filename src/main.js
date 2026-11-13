// ploxi0n — le démarrage : boxion_local d'abord, puis le shim jOS (avant tout ploxion), puis le routeur.
// L'accueil = les ploxions intégrés (banc, marketplace, mon xer en ligne) + ceux que la personne a installés (marketplace).
import { ouvrirBoxionLocal } from './boxion-local/index.js';
import { installerShim } from './shim/jos.js';
import { creerRouteur } from './app/routeur.js';
import { enregistrerBanc } from './banc/banc.js';
import { enregistrerTrackpad } from './banc/trackpad.js';
import { enregistrerBancAnim } from './lot/banc-anim.js';   // 🎞 (0.99.51) le banc des animations (jOSSwipe)
import { creerVerrou } from './natif/verrou.js';
import { creerDepot, creerHttp, SOURCE } from './marketplace/depot.js';
import { enregistrerMarketplace } from './marketplace/marketplace.js';
import { enregistrerXerEnLigne } from './app/xer-en-ligne.js';
import { brancherLiens } from './natif/liens.js';
import { creerRaccourcis, glyphePng } from './natif/raccourcis.js';
import { creerActivites } from './natif/activites.js';
import { creerWidgetsPloxions } from './natif/widgets-ploxions.js';
import { creerPush, SUJETS as SUJETS_PUSH } from './natif/push.js';
import { creerCompte } from './natif/compte.js';
import { creerEcranAccueil, specPerso } from './natif/ecran-accueil.js';
import { creerNotifs } from './natif/notifs.js';
import { creerHud } from './app/hud.js';
import { enregistrerReglages } from './app/reglages.js';
import { creerPrefs, PREFS_DEFAUT } from './app/prefs.js';
import { installerJosNatif } from './natif/jos-natif.js';
import { brancherPlugions } from './natif/plugions.js';
import { installerLecteur } from './natif/lecteur.js';
import { creerHaptique } from './natif/haptique.js';
import { installerImages } from './natif/images.js';
import { installerClavierIos, barreClavier, comprendre } from './natif/clavier-ios.js';
import { trouverPloxion } from './natif/vocabulaire.js';
import { creerVocal } from './natif/vocal.js';
import { creerGuide } from './app/guide.js';   // 🧭 (0.95) le guide remplace les neuf cartes (onboarding.js)
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
import { creerModes, MODES } from './app/modes.js';
import { creerMiniDocks } from './app/minidocks.js';
import { creerCadresLabo } from './natif/cadres-labo.js';
import { installerGel } from './app/gel.js';
import { installerSansEmoji } from './app/sans-emoji.js';
import { installerLangue } from './app/langue.js';
import { langueDe } from './bions/dire.js';
import { creerDemo } from './app/demo.js';
import { creerCarteXer } from './app/carte-xer.js';
import { creerCubeInterieur } from './app/cube-interieur.js';
import { creerCubePages } from './app/cube-pages.js';
import { creerChercherLocal } from './app/chercher-local.js';
import { creerVueXers } from './app/vue-xers.js';
import { creerApercus } from './natif/apercus.js';
import { SOCIAUX, surveillerSocial, invitationDuLien, sessionSocial, supprimerCompteSocial } from './natif/social-apple.js';
import { PloxiApple, PloxiProche, PloxiBLE, PloxiVeille, PloxiOndes, PloxiCarPlay, PloxiAccueil, PloxiRegard, ploxiIci, plateforme } from './natif/plugins-app.js';
import { creerRegardNatif } from './natif/regard-natif.js';
import { creerRegard } from './app/regard.js';
import { creerAccueil, brancherRetourAndroid } from './natif/accueil-natif.js';
import { creerApplis } from './lot/applis.js';
import { creerAgentXb } from './bions/xb-agent.js';
import { creerCommandesXb } from './natif/xb-commandes.js';
import { creerAppareilXb } from './lot/appareil-xb.js';
import { XERS_PLOXIONS } from './app/xer-spotify.js';
import { creerCarPlay, ambiancesSansEcran } from './natif/carplay-natif.js';   // 🚗 (0.99.31) CarPlay
import { modeleCarPlay } from './bions/carplay.js';
import { creerVeille } from './natif/veille-natif.js';
import { creerOndes } from './natif/ondes-natif.js';
import { creerTuyauProche } from './natif/proche-natif.js';   // ◉ (0.99.1) l'ultimate Bluetooth
import { creerProche } from './lot/proche.js';
import { creerSynthe } from './lot/synthe.js';
import { creerAutour } from './lot/autour.js';
import { installerTelVivant } from './app/tel-vivant.js';   // ◌ (0.99.11)   // ⌖ (0.99.9) ce qu'il y a autour de moi   // ≋ (0.99.4) faire du son avec des knobs
import { creerTerrax } from './terrax/terrax.js';
import { creerArNatif, brancherLiensAR } from './natif/ar-natif.js';
import { creerReseauLocal } from './xerbot/reseau.js';
import { envelopperQR, reparerAffichage } from './app/liens-publics.js';
import { creerPartage } from './app/partage.js';
import { creerXers } from './app/xers.js';
import { creerClickerNatif, toucherRapide } from './jeu/clicker-natif.js';
import { creerMisesAJour } from './marketplace/mises-a-jour.js';
import { creerRemontee } from './app/remontee-tsoins.js';
import { creerSysteme } from './lot/systeme.js';
import { creerKoins } from './app/koins.js';
import { creerNeurones } from './app/neurones.js';
import { creerAtelier } from './lot/atelier-peaux.js';
import { creerPasse } from './lot/passe.js';   // ○ (0.97) le passé : le zoom de temps
import { fluxDe, synapsesEntre } from './bions/flux.js';   // ⇄ (0.98) les entrées et les sorties
import { neuroneHtml, poserAxones } from './app/neurone-vue.js';
import { CORES, BIONS_LABO } from './app/registre-labo.js';
// ⇄ (0.98) les ploxions de l'app n'ont pas de bundle à lire : leurs canaux, déclarés (ils se relient ainsi aux autres par les synapses)
const FLUX_INTERNES = {
  'journal-tsoins': { e: ['tsoin:journal'], s: ['tsoin:journal', 'boxion:tsoins-iphone'] }, passe: { e: ['tsoin:journal', 'boxion:passe', 'boxion:xer', 'boxion:usage'], s: [] },
  map: { e: ['reseau:labo.j0bot.ch', 'boxion:xerkions-persos', 'boxion:usage'], s: ['boxion:xerkions-persos'] }, systeme: { e: ['natif:systeme', 'natif:batterie', 'natif:reseau', 'route:/favicon.ico'], s: [] },
  ambiances: { e: [], s: ['natif:audio', 'natif:activite'] }, proche: { e: ['natif:proche'], s: ['natif:proche', 'natif:audio'] }, synthe: { e: ['boxion:reglages'], s: ['natif:audio', 'boxion:reglages'] }, autour: { e: ['natif:position', 'reseau:overpass-api.de', 'boxion:usage'], s: ['boxion:autour'] }, 'atelier-peaux': { e: ['boxion:peaux', 'boxion:atelier'], s: ['boxion:peaux', 'tsoin:journal'] },
  reglages: { e: ['boxion:reglages'], s: ['boxion:reglages', 'boxion:xer'] }, marketplace: { e: ['reseau:labo.j0bot.ch'], s: ['boxion:ploxions'] },
};   // ◈ (0.96) l'atelier des peaux : la fractale des UI, les knobs
import { appliquerCouleurs } from './bions/membrane.js';   // 〰 (0.93) les bords organiques, les neurones
import { creerMap } from './app/map-hubs.js';
import { creerAmbiances, SONS as SONS_AMB } from './lot/ambiances.js';
import { installerAppsALaDemande } from './shim/apps-a-la-demande.js';
import { creerWikiNatif } from './app/wiki-natif.js';
import { creerIconesLabo } from './app/icones-labo.js';
import { creerConnexionLabo } from './natif/connexion-labo.js';
import { creerControleur } from './xerbot/controleur.js';
import { semerKoinIon } from './terrax/koin-ion.js';
import { svgXerkion } from './app/xerkion-icone.js';
import { creerChillSynth } from './chill/chill-synth.js';
import { creerTutoHud } from './app/tuto-hud.js';
import { glyphe as G, glyphePloxion } from './app/glyphes.js';

const VERSION = '0.99.57';

// plus de zooms bizarres : la balise viewport est fixée (index.html) ; un bion qui la réécrit est remis en place aussitôt
// (0.99.26) la taille de tout passe ici : à ×z, la page est mise en page à (largeur de l'écran / z) puis agrandie ×z par la balise viewport,
// comme n'importe quelle page mobile (voir zoomViewport plus bas)
let zoomPage = 1;
const largeurEcran = () => { const s = window.screen || {}, a = s.width || window.innerWidth, b = s.height || window.innerHeight; return window.matchMedia && window.matchMedia('(orientation: landscape)').matches ? Math.max(a, b) : Math.min(a, b); };
const viewportVoulu = () => (zoomPage === 1 ? 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
  : 'width=' + Math.round(largeurEcran() / zoomPage) + ', initial-scale=' + zoomPage + ', minimum-scale=' + zoomPage + ', maximum-scale=' + zoomPage + ', user-scalable=no, viewport-fit=cover');
function zoomViewport(z) {
  zoomPage = z; const v = viewportVoulu();
  for (const m of document.querySelectorAll('meta[name="viewport"]')) if (m.getAttribute('content') !== v) m.setAttribute('content', v);
}
function garderViewport() {
  const fixer = () => { const BON = viewportVoulu(); for (const m of document.querySelectorAll('meta[name="viewport"]')) if (m.getAttribute('content') !== BON) m.setAttribute('content', BON); };
  window.addEventListener('orientationchange', () => setTimeout(fixer, 50));   // la largeur de mise en page suit l'orientation
  try { new MutationObserver(fixer).observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ['content'] }); } catch (e) { /* */ }
  fixer();
  // (0.99.25, RS-7 : une capture où TOUTE la page est décalée de 140 px à gauche, en-tête compris) rien dans l'app ne défile de côté : si la
  // vue s'est décalée quand même (iOS, un geste à deux doigts), elle revient aussitôt
  window.addEventListener('scroll', () => { if (window.scrollX) window.scrollTo(0, window.scrollY); }, { passive: true });
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
  // ↗ (0.76) les liens qui sortent de l'app : jOSQR (le bion QR du labo, chargé plus tard) enveloppé dès maintenant ; les champs qui montrent un lien
  envelopperQR(window); reparerAffichage(racine);
  boot(14, 'boxion local');
  // la garde : un appel au boxion local ne fige plus jamais l'app (5 s au plus, puis la valeur par défaut, noté)
  const boxion = garderBoxion(await ouvrirBoxionLocal({ surEssai: (k, e) => { boot(14, 'boxion local : essai ' + (k + 1)); bootLog('⚠ boxion local, essai ' + k + ' refusé : ' + String(e && e.message).slice(0, 120)); } }), { delai: 5000, surLent: (i) => bootLog('⚠ boxion lent : ' + i.appel + ' > 5 s') });
  boot(12, 'boxion local ouvert');
  // l'espace libre du téléphone (AppDelegate) : au journal ; un disque presque plein fige tout
  try { const { Preferences } = await import('@capacitor/preferences'); const l = +((await sous3sPre(Preferences.get({ key: 'ploxi0n.espace-libre' }))).value || 0), v = (await sous3sPre(Preferences.get({ key: 'ploxi0n.caches-vides' }))).value;
    if (l) bootLog('espace libre : ' + (l / 1e9).toFixed(1) + ' Go' + (l < 1.5e9 ? ' ⚠ presque plein' : '') + (v ? ' · caches vidés (' + v + ')' : '')); } catch (e) { /* */ }
  const prefs = creerPrefs({ boxion }); await prefs.pret; prefs.appliquer();   // l'apparence avant le premier dessin
  // ◈ (0.96) tes peaux (l'atelier) rejoignent les variantes AVANT le premier dessin ; une peau qui porte ses couleurs les pose sur <html>
  const atelier = creerAtelier({ W: window, boxion, prefs, vibrer: (x) => { try { window.jOSNatif && window.jOSNatif.haptique && window.jOSNatif.haptique(x); } catch (e) { /* */ } } });
  await atelier.charger().catch(() => {});
  // les couleurs suivent la peau AFFICHÉE (<html data-px-variante>), d'où qu'elle vienne : les réglages, l'atelier, un parcours
  const couleursPeau = () => appliquerCouleurs(document.documentElement, document.documentElement.getAttribute('data-px-variante'));
  // § (0.97) LES TSOINS DE XER : l'état de l'interface, à chaque changement (le premier = le lancement) — le passé › les miens › « revenir »
  const CLES_XER = ['mode', 'variante', 'police', 'ecriture', 'themeVivant', 'grain', 'glyphes', 'styleIcones', 'icones', 'contraste', 'fractale', 'pagesCote', 'bande'];
  let xerAvant = null, xerT = 0;
  const xerEtat = () => { const p = prefs.lire(), o = {}; for (const k of CLES_XER) if (k in p) o[k] = p[k]; return o; };
  boxion.lire('xer', { limite: 1 }).then((l) => { if (!l.length) boxion.append('xer', { etat: xerEtat(), debut: true }).catch(() => {}); xerAvant = JSON.stringify(xerEtat()); }).catch(() => {});
  prefs.surChangement(() => { clearTimeout(xerT); xerT = setTimeout(() => { const e = xerEtat(), j = JSON.stringify(e); if (xerAvant !== null && j !== xerAvant) { xerAvant = j; boxion.append('xer', { etat: e }).catch(() => {}); } }, 1500); });
  couleursPeau(); new MutationObserver(couleursPeau).observe(document.documentElement, { attributes: true, attributeFilter: ['data-px-variante'] });
  creerNeurones().installer();   // 〰 (0.93) data-neurones / data-neurone : les cellules collées comme des neurones (html.px-organique)
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
  // 🛡 (0.63, RS-7 : « un lecteur vidéo random qui pop et ça crash », « ça s'ouvre en boucle ») la garde : sur un toucher, le ploxion à l'écran, un à la fois, un disjoncteur
  const lecteurNatif = creerLecteurNatif({ boxion, vibrer: (x) => vibrer(x), titre: titrePx, garde: true });
  window.ploxi0nLecteurNatif = lecteurNatif;
  const lecteur = installerLecteur({ boxion, vibrer: (s) => vibrer(s), titre: titrePx, surMedia: (m) => lecteurNatif.surMedia(m) });
  window.jOSNatif.lecteur = { pip: (m) => lecteur.pip(m), pleinEcran: (m) => lecteur.pleinEcran(m), airplay: (m) => lecteur.airplay(m), ...lecteurNatif.api };
  const haptique = creerHaptique({ boxion, actif: () => prefs.lire().haptique !== false && !!(window.jOSNatif && window.jOSNatif.natif) }); await haptique.pret;
  // un événement de l'app, un style, ou un motif inventé ; ouvrir/reprendre un ploxion = SA signature (ou son choix, ou son manifeste)
  // (0.63) vibrer(ev, id, { niveau, classe, force }) ; fx-ouvrir / fx-arrivee avec un id = la signature aussi ; vibrer.crans = la session de crans
  const OUVRE_PX = new Set(['ouvrir', 'reprendre', 'fx-ouvrir', 'fx-arrivee']);
  const vibrer = Object.assign((ev, id, o) => (id && OUVRE_PX.has(ev)
    ? haptique.jouerPloxion(id, ev, window.jOSApps && window.jOSApps[id] && window.jOSApps[id].manifest && window.jOSApps[id].manifest.haptique, o)
    : haptique.jouer(ev, o)), { crans: haptique.crans });
  window.jOSNatif.haptique = (x) => haptique.jouer(x);   // les ploxions (le clicker…) jouent un style, un motif ou un événement
  const bionsCharges = new Set();   // un seul chargement par bion, pour toute l'app
  let routeur = null, gel = null, tutoHud = null, chercheur = null, vueXers = null;
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
  let photosVersBoxion = null;   // 📤 (0.85) posé plus bas, quand le mode connecté est connu
  { const fx = creerFichiersNatif({ versBoxion: (f, c) => (photosVersBoxion ? photosVersBoxion(f, c) : null) }); Object.assign(window.jOSNatif, { envoyer: fx.envoyer, apercu: fx.apercu, zip: fx.zip, dezipper: fx.dezipper, photos: fx.photos, choisirFichiers: fx.ouvrir, carte: fx.carte, mail: fx.mail, lampe: fx.lampe });
    // 👁 (0.73) un lien 3D d'un ploxion (.usdz, .reality, rel="ar") → AR Quick Look : une page d'app (WKWebView) ne sait pas l'ouvrir seule
    if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) brancherLiensAR({ D: document, apercu: (u) => fx.apercu(u) }); }
  // 👁 (0.73) l'AR native (PloxiAR : ARKit, RealityKit, RoomPlan) : le terrax, et tous les ploxions par jOSNatif.ar
  const arNatif = creerArNatif({ W: window });
  window.jOSNatif.ar = { disponible: arNatif.disponible, ouvrir: arNatif.ouvrir, fermer: arNatif.fermer, ecouter: arNatif.ecouter, scannerPiece: arNatif.scannerPiece, voirPiece: arNatif.voirPiece,
    capturerObjet: arNatif.capturerObjet, voirObjet: arNatif.voirObjet };   // (0.74) Object Capture
  // ♫ à l'écoute : ce que jouent les ploxions (Spotify, Media Session) → l'écran verrouillé, le widget, le mini-lecteur (avant tout ploxion)
  const maintenant = creerMaintenant({ miniDock: miniDocks, courant: () => routeur && routeur.courant(), ouvrir: (id) => { if (routeur && routeur.connait(id)) routeur.ouvrir(id); },
    valeur: (k, t, v) => { try { return raccourcis ? raccourcis.valeur(k, t, v) : Promise.resolve(); } catch (e) { return Promise.resolve(); } } });   // raccourcis : déclaré plus bas
  window.jOSNatif.lecture = maintenant.api;
  // un ploxion en ouvre un autre (jOSXerPrefs.ouvrir, jOS.openPloxion) : s'il n'est pas installé et qu'il y a du réseau, on l'installe à la volée
  // un ploxion absent : installé (le pack hors ligne d'abord, puis le labo) ; rend vrai s'il est là ensuite
  // ⬡ (0.99.5) les bions d'un code : ceux notés + tous les jOSNom qu'il touche (sans ceux qu'il définit lui-même), 40 au plus
  const bionsDuCode = (js, notes = []) => { const s = String(js || ''), def = new Set([...s.matchAll(/\bwindow\.(jOS[A-Z0-9][A-Za-z0-9]{0,47})\s*=(?!=)/g)].map(m => m[1])); return [...new Set([...notes, ...(s.match(/\bjOS[A-Z0-9][A-Za-z0-9]{0,47}\b/g) || [])])].filter(b => !def.has(b) || notes.includes(b)).slice(0, 40); };
  const estBion = (id) => /^jOS[A-Z0-9]/.test(String(id || ''));   // jOSChemin, jOSKnob… : le nom d'un bion
  async function installerAbsent(id) {
    if (routeur.connait(id)) return true;
    if (estBion(id)) return false;
    try {
      if (depot.packLocal().some(p => p.id === id)) { await depot.installerLocal(id); await majAccueil(); }   // (0.52) le pack hors ligne d'abord (Pomodoro → Minuteur, sans réseau)
      else { const c = await depot.catalogue({ reseau: false }); const m = (c.items || []).find(x => x.id === id) || {}; await installerAvecBarre({ depot, id, meta: { nom: m.nom, icone: m.icone }, vibrer: (x) => vibrer(x) }); await majAccueil(); }   // ⬇ la barre (un xerkion, un lien…)
    } catch (e) { return false; }
    return routeur.connait(id);
  }
  // ⧉ (0.81) sans barre ni ouverture : un sous-ploxion (jOSApps.monter) ou une dépendance ; le pack d'abord, puis le labo
  async function installerSilencieux(id) {
    if (routeur.connait(id)) return true;
    try {
      if (depot.packLocal().some(p => p.id === id)) await depot.installerLocal(id);
      else { const c = await depot.catalogue({ reseau: false }).catch(() => ({ items: [] })); const m = (c.items || []).find(x => x.id === id) || {}; await depot.installer(id, { nom: m.nom, icone: m.icone }); }
      await majAccueil();
    } catch (e) { return false; }
    return routeur.connait(id);
  }
  // ⧉ (0.81) les dépendances : ce qu'un ploxion installé compose (ses onglets, jOSApps.monter…) s'installe en fond, une fois, en ligne
  const depVus = new Set();
  async function installerDependances(ids) {
    const faits = [];
    for (const id of (ids || []).slice(0, 12)) {
      if (depVus.has(id) || routeur.connait(id) || navigator.onLine === false) continue;
      depVus.add(id);
      if (await installerSilencieux(id)) faits.push(id);
    }
    return faits;
  }
  const routeurProxy = {
    async ouvrir(id, params) {
      // (0.99.3) un BION n'est pas un ploxion (« le chemin » ouvre ses étapes jOSChemin, jOSForge… par jOS.openPloxion) : on ne l'installe pas
      // (« le serveur refuse jOSChemin »), on descend dans son neurone, le palier « bion » de la map
      if (estBion(id) && !routeur.connait(id)) return routeur.ouvrir('map', { palier: 'bion', bion: id });
      if (!routeur.connait(id) && !(await installerAbsent(id))) return false;
      return routeur.ouvrir(id, params);
    },
    connait: (id) => routeur.connait(id), fermer: () => routeur.fermer(),
  };
  // LE MODE CONNECTÉ (RS-7 : « les utiliser tous seuls, mais connectés ») : en ligne, toute route du serveur qu'un ploxion appelle part sur
  // labo.j0bot.ch, avec X-Ploxi0n et le jeton de la personne (labo : JetonAppWeb, docs/dev/57) ; hors ligne, la dernière réponse connue.
  // Les routes nommées d'abord : /bother → l'API sans session (bother me, le ploxion des testeurs). Kill-switch : reglages/mode-connecte = false.
  const enTetes = async () => { const c = await boxion.get('compte', 'courant').catch(() => null); return c && c.jeton ? { 'X-Ploxi0n': '1', Authorization: 'Bearer ' + c.jeton } : { 'X-Ploxi0n': '1' }; };
  let modeConnecte = (await boxion.get('reglages', 'mode-connecte')) !== false;
  const fetchOrigine = window.fetch.bind(window), httpRelais = creerHttp(window, enTetes);
  // (0.99.19, le bilan de santé : quetes lisait /px/quetes.json, la page de l'app) les lectures publiques du labo sous /px (ses données, les
  // fichiers .json de ses ploxions) partent au labo même hors mode connecté : GET de JSON seulement (le relais rend du texte) ; gardées pour le mode avion
  const relais = { routes: [{ prefixe: '/bother', vers: (p) => SOURCE + '/api/app' + p }, { prefixe: '/px', get: true, filtre: (p) => /\.json$/i.test(p), vers: (p) => SOURCE + p }], general: () => modeConnecte && navigator.onLine !== false, vers: (p) => SOURCE + p,
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
  // 📤 (0.85) les photos importées partent aussi dans ton boxion (le FS du labo, /fs/write, en multipart) : connecté et en ligne seulement
  photosVersBoxion = async (f, chemin) => {
    if (!distant.actif()) return null;
    const fd = new FormData(); fd.append('path', '/' + chemin); fd.append('file', f, f.name || 'photo.jpg');
    const r = await window.fetch('/fs/write', { method: 'POST', headers: { Accept: 'application/json' }, body: fd });   // le shim relaie
    return r.ok;
  };
  boot(30, 'le shim jOS · tsoins');
  const shim = await installerShim({ boxion, routeur: routeurProxy, relais, distant });
  maintenant.brancherBus();   // ♫ (0.51) le bus des lecteurs du labo (jOSSound, ploxion.spotify.track) : le son sans SDK ni Media Session
  boot(40, 'shim jOS · ' + ((window.jOSTsoin && window.jOSTsoin.list) ? window.jOSTsoin.list().length : 0) + ' tsoins relus');
  boot(45, 'les ploxions de base');
  window.addEventListener('online', () => { if (window.jOSBoxion && window.jOSBoxion.pousser) window.jOSBoxion.pousser().catch(() => {}); });
  // les images des ploxions en chemins du site → labo.j0bot.ch ; celles qui exigent le compte → récupérées avec le jeton (data: URL)
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
  // ⬡ (0.53) les cadres du labo : un <iframe src="/wiki"> d'un ploxion vise le labo ; refusé par sa CSP → une carte « ouvrir »
  // 📖 (0.81) le wiki se lit dans l'app (src/app/wiki-natif.js) : l'article seul, gardé pour le hors ligne, les liens entre termes restent ici
  // 🔑 (0.83) le labo connecté tout seul : un passe à usage unique (POST /api/app/passe, ton jeton) → /app/entrer?passe=…&vers=… ;
  // le cadre du mode xerboxion, les cadres des ploxions et le navigateur intégré y passent (src/natif/connexion-labo.js)
  const connexionLabo = creerConnexionLabo({ source: SOURCE, requete: (o) => httpRelais.requete(o), connecte: () => !!(compteRef && compteRef.etat().connecte), enLigne: () => navigator.onLine !== false });
  { const nav0 = window.jOSNatif.navigateur.bind(window.jOSNatif); window.jOSNatif.navigateur = async (u, ...r) => nav0(await connexionLabo.emballer(u), ...r); }
  const wikiNatif = creerWikiNatif({ source: SOURCE, http: creerHttp(window, async () => ({})), boxion, navigateur: (u) => window.jOSNatif.navigateur(u), vibrer: (x) => vibrer(x) });
  const cadres = creerCadresLabo({ source: SOURCE, tete: (u) => creerHttp(window, async () => ({})).tete(u), navigateur: (u) => window.jOSNatif.navigateur(u), lecteur: wikiNatif, connecter: (c) => connexionLabo.adresse(c) });
  const depot = creerDepot({ boxion, http: creerHttp(window, enTetes), estAdmin: () => !!(compteRef && compteRef.etat().admin), compat, packLocal: pack, lireLocal: async (id) => (await fetch('/ploxions/' + encodeURIComponent(id) + '/app.js')).text(),
    lireBionLocal: async (b) => { const r = await fetchOrigine('/bions/' + encodeURIComponent(b) + '.js'); if (!r.ok) throw new Error('bion absent'); return r.text(); },
    surMisAJour: (id) => { if (routeur) routeur.oublier(id); },
    surInstalle: (id, composes) => { if (routeur && composes && composes.length) setTimeout(() => installerDependances(composes).catch(() => {}), 500); } });   // ⧉ (0.81)   // ↻ (0.80) l'ancien code quitte la page : la prochaine ouverture lit le nouveau
  // ⬡ (0.82) les icônes du labo (/px/icones.json : retouches pour tous, les tiennes, les glyphes dessinés), avec ton jeton ; gardées hors ligne
  const iconesLabo = creerIconesLabo({ source: SOURCE, http: httpRelais, boxion });
  await iconesLabo.pret;
  // ↻ (0.80) les mises à jour des ploxions : automatiques (par défaut), et ⚙ › Ploxions
  const maj = creerMisesAJour({ depot, boxion, routeur: () => routeur, signaler: (t) => routeur && routeur.signaler(t), apres: () => majAccueil(),
    completer: async () => { if (await iconesLabo.recharger().catch(() => false)) await majAccueil().catch(() => {}); return installerDependances((await depot.dependances()).map(x => x.id)); } });   // ⧉ (0.81) les dépendances qui manquent, à chaque vérification
  window.ploxi0nMaj = maj;
  // les ploxions de base (index.json « base » : bother me pour les testeurs) : installés une fois, au premier lancement ; retirables ensuite
  const deja = (await boxion.get('reglages', 'base-installes')) || [];
  for (const id of (indexPack.base || []).filter(b => !deja.includes(b))) {
    try { await depot.installerLocal(id); deja.push(id); } catch (e) { console.warn('ploxion de base', id, e); }
  }
  await boxion.put('reglages', 'base-installes', deja);
  boot(50, deja.length + ' ploxions de base');
  // 0.8 : les bions TOUCHÉS (pas seulement déclarés) ; les ploxions installés avant sont complétés une fois, en ligne, sans bloquer le démarrage
  // (0.99.3) une seconde fois : les bions bannis par un 429 du labo (notés « absents » 7 jours) reviennent dans les ploxions installés sans eux
  // (0.99.6, RS-7 : « quand j'ouvre l'app ça freeze ») : plus jamais au démarrage ; 25 s après, en douceur (8 ploxions, une pause entre
  // chacun, seulement ceux à qui il manque des bions), et ainsi à chaque lancement tant qu'il en reste
  // (0.99.19, le bilan de santé) une troisième fois : jOS3D n'était pas reconnu comme un bion (un chiffre après « jOS ») et jOSApps.rs.mount pas
  // comme une dépendance ; tout l'index passe « à revoir » une fois (sans relire aucun code), la réparation fait le reste, 8 par lancement
  if (!(await boxion.get('reglages', 'bions-v4-revoir'))) { await depot.aRevoir().catch(() => 0); await boxion.put('reglages', 'bions-v4-revoir', { le: new Date().toISOString() }).catch(() => {}); }
  if (!(await boxion.get('reglages', 'bions-v4')) && navigator.onLine !== false) {
    window.setTimeout(() => depot.completerBions({ max: 8, pause: 400 }).then(r => { if (!r.reste) boxion.put('reglages', 'bions-v4', { le: new Date().toISOString(), n: r.length }); }).catch(() => {}), 25000);
  }
  let tuyauProche = null;   // (0.99.24) le tuyau de Proche, partagé avec le banc (sa sonde « Proche en vrai »)
  const internes = [
    // (0.67) les icônes comme dans le xer (le xerkion), et les ploxions natifs de l'app dans le marketplace (leur portée : natif)
    enregistrerMarketplace({ depot, vibrer, icone: (x) => svgXerkion(x, { seul: prefs.lire().styleIcones === 'glyphe' }), internes: () => (routeur ? routeur.catalogue().filter(p => p.interne) : []), surChangement: () => majAccueil(), usage: () => boxion.get('usage', 'stats'), prefs: { lire: () => boxion.get('reglages', 'marketplace'), ecrire: (v) => boxion.put('reglages', 'marketplace', v) } }),
    enregistrerXerEnLigne({}),
    enregistrerBanc({ boxion, version: VERSION, extras: {   // (0.99.24) les sondes des nouveaux bions : la radio, le vrai état de l'iPhone, le GPS
      tuyau: () => tuyauProche,
      systeme: () => (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform() ? PloxiApple.systeme() : null),
      position: () => window.jOSNatif.position() } }),
    enregistrerTrackpad({}),   // ◇ (0.60) les essais du trackpad haptique
    enregistrerBancAnim({ boxion, version: VERSION, vibrer: (x) => vibrer(x), prefs }),   // 🎞 (0.99.51) toutes les animations, à choisir au swipe
  ];
  let raccourcis = null;
  async function majAccueil(o) {
    const installes = await depot.installes();
    // la catégorie vient du catalogue en cache (la vue « par catégorie » de l'accueil)
    const cat = new Map(((await depot.catalogue({ reseau: false }).catch(() => null)) || { items: [] }).items.map(x => [x.id, x]));
    // ⬡ (0.55) le xerkion d'un ploxion : celui du labo (registre), retouché par l'atelier de la personne (palette, cœur, koins, glyphe)
    const perso = (await boxion.get('reglages', 'apps-accueil-perso').catch(() => null)) || {};
    // ⬡ (0.82) le registre, puis les retouches du labo pour tous, puis les tiennes au labo, puis celles de l'atelier de l'app (src/app/icones-labo.js)
    const xk = (id) => { const o = Object.assign({}, (cat.get(id) || {}).xerkion, iconesLabo.tous(id), specPerso(iconesLabo.mien(id)), specPerso(perso[id])); return Object.keys(o).length ? o : null; };
    const liste = [...installes.map(p => ({ id: p.id, nom: p.nom, icone: p.icone, categorie: (cat.get(p.id) || {}).categorie || 'Autres', cat_icone: (cat.get(p.id) || {}).cat_icone || '📦', bions: p.bions || [], cat: (cat.get(p.id) || {}).cat || null, type: (cat.get(p.id) || {}).type || null, koins: (cat.get(p.id) || {}).koins, centre: (cat.get(p.id) || {}).centre || null, xerkion: xk(p.id) })),
      ...internes.map(p => ({ categorie: 'ploxi0n', cat_icone: '◇', ...p }))];
    routeur.majCatalogue(liste, o);
    if (raccourcis) raccourcis.publier(liste).catch(() => {});   // l'app Raccourcis et Siri proposent les ploxions installés
  }
  const compte = creerCompte({ boxion, http: creerHttp(window) });
  // 🍏 (0.72) le social avec l'Apple ID (src/natif/social-apple.js) : « Continuer avec Apple » sur son écran de connexion, comptes j0bot
  const surveilles = new Map();
  // (0.84) ses appels à api.j0bot.ch passent par le HTTP natif : l'api ne répond pas en CORS à capacitor://localhost (jusqu'à son redéploiement)
  const reseauSocial = creerReseauLocal({ W: window });
  const fetchSocial = async (url, o = {}) => {
    const r = await reseauSocial.requete({ methode: o.method || 'GET', url, entetes: o.headers || {}, corps: o.body ? JSON.parse(o.body) : undefined, delai: 15000, essais: 1 });
    return { status: r.status, ok: r.status >= 200 && r.status < 300, json: async () => r.json };
  };
  // (0.84) l'invitation du social qui a ouvert l'app (…?px=invite&code=…) : gardée 30 jours, pour « Continuer avec Apple »
  const invitationSocial = async () => { const g = await boxion.get('social', 'invitation').catch(() => null); return g && g.code && Date.now() - (g.le || 0) < 30 * 864e5 ? g.code : ''; };
  const social = { etat: () => sessionSocial(window), supprimer: () => supprimerCompteSocial({ W: window, fetch: fetchSocial }) };
  function socialApple(id) {
    if (!SOCIAUX.has(id)) return;
    const avant = surveilles.get(id); if (avant) avant();
    const hote = document.querySelector('.px-scene>.px-hote[data-ploxion="' + CSS.escape(id) + '"]'); if (!hote) return;
    surveilles.set(id, surveillerSocial({ W: window, hote, jetonApple: () => compte.jetonApple(), vibrer: (x) => vibrer(x), natif: () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()),
      fetch: fetchSocial, invitation: invitationSocial, oublier: () => boxion.del('social', 'invitation'),
      remonter: () => { if (routeur) routeur.ouvrir(id, { apple: String(Date.now()) }); } }));
  }
  boot(62, 'ton compte');
  await compte.pret; compteRef = compte;
  { const e = compte.etat(); boot(64, e.connecte ? 'compte : ' + e.nom + ' · ' + e.palier : 'sans compte (tout reste ici)'); }
  if (navigator.onLine !== false) { compte.rafraichir().catch(() => {}); if (window.jOSBoxion.pousser) window.jOSBoxion.pousser().catch(() => {}); }   // le rang et « admin » à jour (un jeton expiré → déconnecté)
  const reglerModeConnecte = (v) => { if (v != null) { modeConnecte = !!v; boxion.put('reglages', 'mode-connecte', modeConnecte); } return modeConnecte; };
  // 🎙 les vocaux : enregistrer, transcrire (iOS, le vocabulaire du xerboxion), garder ; jOSNatif.vocal pour les ploxions
  // 🏝 (0.91) les Live Activities : ce qui est en cours sur l'écran verrouillé et la Dynamic Island (src/natif/activites.js)
  const activites = creerActivites({ plugin: PloxiApple, boxion, natif: () => ploxiIci('PloxiApple'), actif: () => prefs.lire().activites !== false });
  window.jOSNatif.activite = { debut: (o) => activites.pour((routeur && routeur.courant()) || 'accueil').debut(o), maj: (o) => activites.pour((routeur && routeur.courant()) || 'accueil').maj(o), fin: () => activites.pour((routeur && routeur.courant()) || 'accueil').fin() };
  // ▦ (0.91) un widget par ploxion : jOSWidget.publier({ valeur, unite, sous, serie, bouton }) (src/natif/widgets-ploxions.js)
  const widgetsPx = creerWidgetsPloxions({ boxion, catalogue: () => (routeur ? routeur.catalogue() : []), courant: () => (routeur ? routeur.courant() : null),
    glyphePng: (p) => glyphePng(window, p),
    ecrire: async (k, v) => { if (!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())) return; const { Preferences } = await import('@capacitor/preferences'); await Preferences.set({ key: k, value: v }); } });
  // 🎛 (0.99.43) l'état des boutons du Centre de contrôle (Proche allumé, une balade en cours) : les Préférences « ploxi0n.controles » →
  // l'AppDelegate les copie dans l'App Group et recharge les contrôles (ControlCenter) → l'extension affiche « allumé » comme le Wi-Fi
  const etatCtl = { proche: false, balade: false };
  const controles = (patch) => { Object.assign(etatCtl, patch); widgetsPx.ecrireBrut('ploxi0n.controles', JSON.stringify(etatCtl)); };
  window.jOSWidget = { publier: (d, id) => widgetsPx.publier(d, id), retirer: (id) => widgetsPx.retirer(id) };
  const vocal = creerVocal({ boxion, catalogue: () => (routeur ? routeur.catalogue() : []), vibrer: (x) => vibrer(x), ouvrir: (id, p) => routeurProxy.ouvrir(id, p),
    surEtat: (on) => { if (routeur) routeur.rafraichirHud(); if (on) activites.debut('vocal', { genre: 'vocal', titre: 'vocal', sous: 'j\'enregistre', glyphe: 'vocal', debut: Date.now() }); else activites.fin('vocal');
      if (!on) return miniDocks.retirer('vocal');   // ▤ 🎙 le vocal qui enregistre : ■ depuis l'accueil
      miniDocks.publier({ cle: 'vocal', titre: 'j\'enregistre…', icone: '🎙', enCours: true, fermable: false, sous: '■ pour arrêter et transcrire', ouvrir: () => vocal.basculer(), actions: [{ id: 'stop', icone: '■', nom: 'arrêter', faire: () => vocal.basculer() }] }); } });
  window.jOSNatif.vocal = vocal.api;
  // ⧗ les tsoins natifs : le composeur (dock, geste, Siri, jOSNatif.tsoin) et le journal ; connecté, ils partent aussi au boxion
  // 🏝 ☾ (0.91) dodo lance le chrono de la nuit sur l'écran verrouillé, réveil l'arrête ; ▦ le widget du journal : les tsoins du jour
  const surTsoin = async (e) => {
    if (e.genre === 'dodo') activites.debut('dodo', { genre: 'tsoin', ploxion: 'journal-tsoins', titre: 'dodo', sous: 'bonne nuit · réveil pour l\'arrêter', glyphe: 'dodo', debut: Date.now() });
    if (e.genre === 'reveil') activites.fin('dodo');
    const jour = new Date().toDateString(), l = await tsoinNatif.liste(500).catch(() => []), n = l.filter(t => new Date(t.le || t.t).toDateString() === jour).length;
    widgetsPx.publier({ valeur: String(n), unite: 'tsoin' + (n > 1 ? 's' : ''), sous: 'aujourd\'hui · ' + String(e.d || e.genre).slice(0, 40), bouton: { titre: '+ tsoin', params: { nouveau: '1' } } }, 'journal-tsoins').catch(() => {});
  };
  const tsoinNatif = creerTsoinNatif({ boxion, vibrer: (x) => vibrer(x), vocal, contexte: () => (routeur ? routeur.courant() : null), surTsoin: (e) => { surTsoin(e).catch(() => {}); },
    distant: () => (compte.etat().connecte && modeConnecte && navigator.onLine !== false ? window.jOSBoxion : null) });
  internes.push(tsoinNatif.ploxion);
  // ▤ ≈ (0.88) le lot de ploxions de RS-7 : le système (btop) et les ambiances (Blanket), dans l'app, hors ligne
  const natifLot = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  // (0.99.32) Android : aucun plugin Swift ; chaque plugin de l'app se demande avant d'être appelé (ploxiIci), sinon le ploxion vit sans
  const appleIci = natifLot && ploxiIci('PloxiApple');
  internes.push(atelier.ploxion);
  internes.push(creerPasse({ W: window, boxion, vibrer: (x) => vibrer(x), ouvrir: (id) => routeurProxy.ouvrir(id), catalogue: () => (routeur ? routeur.catalogue() : []), glyphe: (p) => glyphePloxion(p),
    revenir: (etat) => prefs.regler(etat),   // § revenir à un instant du xer
    xerboxion: async () => { const r = await httpRelais.requete({ methode: 'GET', url: SOURCE + '/api/app/tsoins?portee=xerboxion', headers: { Accept: 'application/json' } }, fetchOrigine); if (r.status !== 200) return []; const d = JSON.parse(r.texte || '{}'); return Array.isArray(d.tsoins) ? d.tsoins : []; } }).ploxion);
  internes.push(creerSysteme({ W: window,
    systeme: appleIci ? () => PloxiApple.systeme() : null,
    appareil: natifLot ? async () => { const { Device } = await import('@capacitor/device'); const i = await Device.getInfo(); return { model: i.model, operatingSystem: i.operatingSystem, osVersion: i.osVersion, memUsed: i.memUsed }; } : null,
    batterie: natifLot ? () => window.jOSNatif.batterie() : null, reseau: natifLot ? () => window.jOSNatif.reseau() : async () => ({ connecte: navigator.onLine !== false }),
    sonder: () => httpRelais.tete(SOURCE + '/favicon.ico'),
    ploxions: () => ({ vivants: routeur ? routeur.vivants() : [], endormis: routeur && routeur.endormis ? routeur.endormis() : [] }),
    ouvrir: (id) => routeurProxy.ouvrir(id) }).ploxion);
  // ◷ ᛒ (0.99.20) la veille en arrière-plan et le Bluetooth bas niveau, pour les ploxions internes ET ceux du labo (mappion, Autour, Proche)
  if (natifLot) { try { if (ploxiIci('PloxiVeille')) window.jOSVeille = creerVeille({ plugin: PloxiVeille, activites: () => prefs.lire().activites !== false, quand: (on) => controles({ balade: on }) }); if (ploxiIci('PloxiOndes')) window.jOSOndes = creerOndes({ plugin: PloxiOndes }); } catch (e) { /* le reste de l'app vit sans */ } }
  // ◉ (0.99.1) Proche, l'ultimate Bluetooth : les téléphones autour, sans internet (MultipeerConnectivity sur l'iPhone, un BroadcastChannel ailleurs)
  tuyauProche = creerTuyauProche({ W: window, plugin: natifLot && ploxiIci('PloxiProche') ? PloxiProche : null, ble: natifLot && ploxiIci('PloxiBLE') ? PloxiBLE : null });
  const proche = creerProche({ W: window, boxion, vibrer: (x) => vibrer(x), tuyau: tuyauProche, position: () => window.jOSNatif.position(), ouvrirLien: (u) => window.jOSNatif.ouvrirLien(u),
    activite: { debut: (o) => { controles({ proche: true }); return activites.debut('proche', { ...o, genre: 'proche', ploxion: 'proche' }); }, maj: (o) => activites.maj('proche', o), fin: () => { controles({ proche: false }); return activites.fin('proche'); } } });   // 🏝 (0.99.43)
  if (window.jOSVeille) window.jOSVeille.etat().then(r => controles({ balade: !!(r && r.balade) })).catch(() => {}); else controles({});   // 🎛 l'état réel au lancement (une balade survit à l'app tuée)
  internes.push(proche.ploxion);
  // ≋ (0.99.4) le synthé : des jOSKnob, des pads, une boucle (RS-7 : « qu'on puisse commencer à faire du son avec des knobs »)
  internes.push(creerSynthe({ W: window, boxion, vibrer: (x) => vibrer(x), proche }).ploxion);   // (0.99.10) jouer à plusieurs : le son part dans Proche
  // ⌖ (0.99.9) Autour : les lieux d'OpenStreetMap autour de toi, en continu (RS-7 à Zurich : « des toilettes direct ; propositions selon mon vecteur xerion »)
  const autour = creerAutour({ W: window, boxion, vibrer: (x) => vibrer(x), http: { get: (u, o) => httpRelais.get(u, o) }, position: () => window.jOSNatif.position(),
    ouvrirLien: (u) => (window.jOSNatif && window.jOSNatif.ouvrirLien ? window.jOSNatif.ouvrirLien(u) : window.open(u, '_blank')), usage: () => boxion.get('usage', 'stats') });   // 🎛 (0.99.43) gardé : le bouton « Toilettes » du Centre de contrôle
  internes.push(autour.ploxion);
  const ambiancesApi = creerAmbiances({ W: window, boxion, vibrer: (x) => vibrer(x), activite: { debut: (o) => activites.debut('ambiances', { genre: 'minuteur', ploxion: 'ambiances', glyphe: 'ambiances', ...o }), fin: () => activites.fin('ambiances') } });
  internes.push(ambiancesApi.ploxion);
  // ⌂ (0.99.32, RS-7 : « sur Android, ploxion utilisable comme launcher ») l'écran d'accueil d'Android et les applis du téléphone (PloxiAccueil.java)
  document.documentElement.setAttribute('data-px-plateforme', plateforme());
  const accueilAndroid = creerAccueil({ plugin: natifLot && ploxiIci('PloxiAccueil') ? PloxiAccueil : null });
  if (accueilAndroid.dispo()) { window.jOSAccueil = accueilAndroid; internes.push(creerApplis({ W: window, accueil: accueilAndroid, vibrer: (x) => vibrer(x) }).ploxion); }
  // ▸ (0.99.33, RS-7 : « le xerboxion en entier, avec xb ») l'agent xb : ce téléphone devient un appareil du labo (src/bions/xb-agent.js)
  let nomXb = 'ploxi0n · ' + plateforme();
  if (natifLot) window.jOSNatif.appareil().then((i) => { nomXb = 'ploxi0n · ' + (i.modele || plateforme()); }).catch(() => {});
  const coffreXb = { lire: () => (window.jOSVerrou ? window.jOSVerrou.lire('xb.jeton', 'allumer l\'agent xb') : null), garder: (j) => window.jOSVerrou.garder('xb.jeton', j), oublier: () => window.jOSVerrou.oublier('xb.jeton') };
  const infosXb = async () => { const [a, b, r] = await Promise.all([natifLot ? window.jOSNatif.appareil().catch(() => ({})) : {}, natifLot ? window.jOSNatif.batterie().catch(() => ({})) : {}, window.jOSNatif.reseau ? window.jOSNatif.reseau().catch(() => ({})) : {}]);
      return { systeme: [a.systeme, a.version].filter(Boolean).join(' '), modele: a.modele || '', batterie: b.niveau != null ? Math.round(b.niveau * 100) + ' %' + (b.enCharge ? ' (en charge)' : '') : '', wifi: r.type || '', mode: 'ploxi0n ' + VERSION, ploxion: (routeur && routeur.courant()) || 'accueil' }; };
  const agentXb = creerAgentXb({ requete: (q) => httpRelais.requete(q, fetchOrigine), coffre: coffreXb, source: SOURCE, nom: () => nomXb, version: VERSION, os: plateforme(),
    ouvrirLien: (u) => window.jOSNatif.ouvrirLien(u),
    infos: infosXb,
    cmds: creerCommandesXb({ ouvrir: (id) => routeurProxy.ouvrir(id), ouvrirLien: (u) => window.jOSNatif.ouvrirLien(u), accueil: () => routeur.accueil(),
      plein: (on) => { if (routeur && routeur.courant() && !!routeur.plein() !== !!on) routeur.etat(); },
      notifier: (t) => window.jOSNatif.notifier({ titre: 'xerboxion', texte: t }), signaler: (t) => routeur && routeur.signaler(t), etat: () => agentXb.etat(),
      infos: infosXb,
      scanner: window.jOSOndes ? async (sec) => { await window.jOSOndes.scanner(); await new Promise(r => setTimeout(r, sec * 1000)); window.jOSOndes.arreter(); return window.jOSOndes.appareils(); } : null }) });
  window.jOSXb = agentXb;
  const appareilXb = creerAppareilXb({ W: window, agent: agentXb, boxion, vibrer: (x) => vibrer(x) });
  internes.push(appareilXb.ploxion);
  // 🚗 (0.99.31, RS-7 : « ploxion sur CarPlay ») seulement si le Swift est compilé (option PLOXI0N_CARPLAY) : sinon rien ne change
  if (natifLot && window.Capacitor && window.Capacitor.isPluginAvailable && window.Capacitor.isPluginAvailable('PloxiCarPlay')) {
    const ambCar = ambiancesSansEcran({ W: window });
    window.ploxi0n_carplay = creerCarPlay({ W: window, plugin: PloxiCarPlay,
      modele: () => modeleCarPlay({ potes: proche.potes(), sons: SONS_AMB, volumes: ambiancesApi.etat().volumes }),
      agir: (id) => { if (id === 'sons:couper') ambCar.couper(); else if (id.startsWith('son:')) ambCar.basculer(id.slice(4), ambiancesApi.etat().volumes); } });
  }
  // ◈ (0.98) un ploxion vu de près : son code, ses bions ; son flux (entrées, sorties) ; (0.99.17) le flux gardé par version (memoFlux)
  const inspecteur = async (id) => { const p = await boxion.get('ploxions', id).catch(() => null), c = routeur ? routeur.catalogue().find(x => x.id === id) : null, code = (p && p.js) || '';
    return { id, nom: (p && p.nom) || (c && c.nom) || id, code, bions: bionsDuCode(code, (p && p.bions) || []) }; };
  const fluxCalcule = (i) => { const f = fluxDe({ id: i.id, code: i.code, bions: i.bions, cores: CORES }), d = FLUX_INTERNES[i.id]; if (d) { f.entrees.push(...d.e.map(canal => ({ canal, doc: '', sur: 'core' }))); f.sorties.push(...d.s.map(canal => ({ canal, doc: '', sur: 'core' }))); } return f; };
  const memoFlux = new Map();
  const cleFlux = (p) => String(p.hash || '') + '|' + String(p.maj || p.installe || '');
  depot.surEcrit = (id, p) => { const code = p.js || '', f = fluxCalcule({ id, code, bions: bionsDuCode(code, p.bions || []) }); f.nom = p.nom || id;
    const rec = { h: cleFlux(p), f: JSON.parse(JSON.stringify(f)) }; memoFlux.set(id, rec); boxion.put('flux', id, rec).catch(() => {}); };
  // ▦ (0.90) la map du xerboxion en carrés : les hubs du labo (/px/xerkions.json) et les tiens, une balade de portail en portail ; en créer
  internes.push(creerMap({ boxion, vibrer: (x) => vibrer(x), enLigne: () => navigator.onLine !== false,
    charger: async () => { const r = await httpRelais.get(SOURCE + '/px/xerkions.json', { headers: { Accept: 'application/json' } }); if (r.status !== 200) throw new Error('map : ' + r.status); const d = JSON.parse(r.texte || '{}'); return Array.isArray(d.items) ? d.items : []; },
    ploxions: () => (routeur ? routeur.catalogue().filter(p => !p.interne || p.id === 'journal-tsoins') : []), ouvrir: (id) => routeurProxy.ouvrir(id), usage: () => boxion.get('usage', 'stats'),
    // ◈ (0.98) le zoom de fractale jusqu'aux neurones : un ploxion (son code, ses bions), un bion (son API, qui l'appelle)
    // (0.99.5, RS-7 : « quand on zoome sur un ploxion, il faut qu'on puisse voir son bion ») : ses bions = ceux notés à l'installation + tous ceux
    // que son code touche (jOSBoxion, jOSNatif… compris : l'app les fournit, ce sont des bions aussi)
    inspecter: inspecteur,
    flux: fluxCalcule,
    bionInfo: async (nom) => {
      if (!/^jOS/.test(nom)) {   // (0.99.5) le CŒUR d'un ploxion : son propre code est son bion
        const p = await boxion.get('ploxions', nom).catch(() => null), c = routeur ? routeur.catalogue().find(x => x.id === nom) : null, js = (p && p.js) || '';
        const api = [...new Set([...js.matchAll(/\b(manifest|mount|unmount|describe|shareParams|onParams|ready|reprendre|commande|params)\s*[:(]/g)].map(m => m[1]))];
        return { nom, js, coeur: true, utilisePar: [nom], api, role: (c && c.description) || 'le cœur de ' + ((c && c.nom) || nom) + ' : son code, ce qu\'il enregistre, ce qu\'il touche', glyphe: '', bions: bionsDuCode(js, (p && p.bions) || []) };
      }
      const x = await boxion.get('bions', nom).catch(() => null), l = await depot.bions().catch(() => []), r = BIONS_LABO[nom] || {}, js = (x && x.js) || '';
      return { nom, js, utilisePar: (l.find(b => b.nom === nom) || {}).utilisePar || [], api: r.api || [], role: r.role || '', glyphe: r.glyphe || '', bions: bionsDuCode(js, []).filter(b => b !== nom) };
    },
    neurone: { html: neuroneHtml, axones: poserAxones, synapses: synapsesEntre }, tous: () => (routeur ? routeur.catalogue().filter(p => p.id !== 'map') : []),
    // (0.99.17) le flux d'un ploxion (ses entrées, ses sorties) ne change qu'avec sa version : calculé UNE fois, gardé (mémoire + boxion « flux »).
    // Mesuré au faux iPhone (120 ploxions de 600 Ko) : la map relisait en fond le code entier de 60 ploxions à chaque retour à l'accueil.
    fluxGarde: async (id) => {
      const e = (await depot.installes().catch(() => [])).find(x => x.id === id), h = e ? cleFlux(e) : 'interne|' + VERSION;
      const m = memoFlux.get(id); if (m && m.h === h) return m.f;
      const g = await boxion.get('flux', id).catch(() => null); if (g && g.h === h) { memoFlux.set(id, g); return g.f; }
      const i = await inspecteur(id), f = fluxCalcule(i); f.nom = i.nom; const rec = { h, f: JSON.parse(JSON.stringify(f)) }; memoFlux.set(id, rec); boxion.put('flux', id, rec).catch(() => {}); return rec.f;
    } }).ploxion);
  // ⧗ (0.86) les tsoins de l'iPhone remontent à ton boxion (si tu le choisis : ⚙ › Réseau) ; « me demander un tsoin » après une session
  const remontee = creerRemontee({ boxion, distant, signaler: (t) => routeur && routeur.signaler(t),
    proposer: ({ minutes }) => miniDocks.publier({ cle: 'tsoin-session', titre: 'un tsoin de ta session ?', icone: '⧗', sous: minutes + ' min dans l\'app, juste avant ta pause', ouvrir: () => { miniDocks.retirer('tsoin-session'); tsoinNatif.ouvrir({ texte: '' }); },
      actions: [{ id: 'noter', icone: '⧗', nom: 'noter', faire: () => { miniDocks.retirer('tsoin-session'); tsoinNatif.ouvrir({ texte: '' }); } }] }) });
  // 📦 le gestionnaire : les ploxions installés, leur place, leurs bions
  internes.push(enregistrerGestion({ depot, vibrer: (x) => vibrer(x), ouvrir: (id) => routeurProxy.ouvrir(id), retirer: async (id) => { await routeur.retirerPloxion(id); await majAccueil(); } }));
  // ❤ la santé : Apple Santé lue sur le téléphone (le ploxion « Santé ») ; jOSNatif.sante pour les ploxions, sur accord
  const sante = creerSante({ boxion, vibrer: (x) => vibrer(x), courant: () => (routeur ? routeur.courant() : null),
    distant: () => (compte.etat().connecte && modeConnecte && navigator.onLine !== false ? window.jOSBoxion : null),   // ☁ le résumé sur ton boxion (si activé)
    valeur: (k, t, v) => (raccourcis ? raccourcis.valeur(k, t, v) : Promise.resolve()) });
  // ◈ le cube des widgets : six infos des bions (les valeurs), et la dernière inclinaison du téléphone
  const cube = creerCube({ boxion, valeurs: () => (raccourcis ? raccourcis.toutes() : {}) });
  internes.push(sante.ploxion);
  internes.push(creerChillSynth({ boxion, vibrer: (x) => vibrer(x) }).ploxion);
  // ▣ (0.67) dans le cube : l'écran est la face ouverte ; les cinq autres, des xers ; l'intérieur, à peupler
  internes.push(creerCubeInterieur({ boxion, vibrer: (x) => vibrer(x), liste: () => (routeur ? routeur.listeCarte() : []), vivants: () => (routeur ? routeur.vivants() : []), tsoins: () => tsoinNatif.liste(8),
    aller: (id) => routeurProxy.ouvrir(id), icone: (p) => p.icone || svgXerkion(p, { seul: prefs.lire().styleIcones === 'glyphe' }), glyphe: (n) => G(n) }).ploxion);   // ≋ (0.64) chill-synth, phase 1 : le son en arrière-plan
  // 🥼 labo-cape (0.50, lot L1) : la blouse RS-7 en BLE, ou sa simulation (le moteur de cape-core)
  internes.push(creerCape({ boxion, vibrer: (x) => vibrer(x) }).ploxion);
  // ◬ (0.71) le koin du ion : ses dossiers (ion, 3ion, seption, nexus) semés dans les hubs perso du labo, la balade entre les réels
  semerKoinIon({ W: window, boxion }).catch(() => {});
  // 🌍 (0.71) le terrax : le Pokémon Go du nexus (le terrion, l'AR, ta chambre, les quêtes) — docs/TERRAX.md
  // le nexus : le protocole de jOSNexus (labo), relayé par le shim en mode connecté ; hors ligne, 503 et le terrax le dit
  // 🤖 (0.75) XERB0T · le contrôleur : Home Assistant, WLED, ESPHome, Tasmota, les Pi, les boxions, les Arduino/ESP (HTTP, Bluetooth), HomeKit ;
  // le réseau local en natif (CapacitorHttp sans le jeton du labo, Bonjour) ; chaque lumière, chaque prise sur le bus xerbot v1 du labo
  const reseauLocal = creerReseauLocal({ W: window, plugin: PloxiApple });
  const controleur = creerControleur({ W: window, boxion, reseau: reseauLocal, vibrer: (x) => vibrer(x) });
  internes.push(controleur.ploxion);
  window.jOSXerbotReel = { devices: () => controleur.api.devices(), etat: (id) => controleur.api.etat(id) };
  // ✉ (0.76) inviter · partager : l'invitation du social (lien universel + QR natif), un palier, un ploxion, un lien reçu
  const estNatif = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  const partage = creerPartage({ W: window, routeur: () => routeur, qr: estNatif ? (o) => PloxiApple.qr(o) : null, requete: (o) => reseauLocal.requete(o), vibrer: (x) => vibrer(x), racine });
  internes.push(partage.ploxion);
  // § (0.77) mes xers : l'interface entière (accueil, dock, barre du haut, fond, mode, apparence) sur les mêmes ploxions ; en changer, les partager
  const xers = creerXers({ boxion, prefs, defautPrefs: PREFS_DEFAUT, routeur: () => routeur, partage, vibrer: (x) => vibrer(x), installer: (id) => installerAbsent(id), fond,
    hud: { config: () => hud.config(), regler: (c) => hud.regler(c) }, barre: { config: () => barreHaut.config(), regler: (c) => barreHaut.regler(c) } });
  internes.push(xers.ploxion);
  window.ploxi0nXers = xers;
  // ◈ (0.78) le clicker et le clickion en natif : le toucher instantané, le temps d'absence rattrapé, la partie dans les widgets
  // 🏆 (0.79) Game Center : le classement du clicker, trouvé parmi ceux de l'app ; le record envoyé ; 🏆 dans leur barre
  const clickerNatif = creerClickerNatif({ W: window, publier: (k, t, v) => (raccourcis ? raccourcis.valeur(k, t, v) : null), signaler: (t) => routeur && routeur.signaler(t), vibrer: (x) => vibrer(x),
    jeu: estNatif ? { connecter: () => window.jOSNatif.jeu.connecter(), classements: () => window.jOSNatif.jeu.classements(), score: (c, s) => window.jOSNatif.jeu.score(c, s), ouvrir: (c) => window.jOSNatif.jeu.ouvrir(c) } : null,
    garder: { lire: () => boxion.get('reglages', 'game-center'), ecrire: (v) => boxion.put('reglages', 'game-center', v) } });
  window.ploxi0nClicker = clickerNatif;
  internes.push(creerTerrax({ boxion, vibrer: (x) => vibrer(x), ar: arNatif, nexus: {
    push: async (kind, payload) => { const r = await fetch('/nexus/push', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ kind, payload }) }); const j = await r.json().catch(() => ({})); if (!(r.ok && j.ok)) throw new Error(j.message || 'le nexus ne répond pas (' + r.status + ')'); return true; },
    pull: async (kind) => { const r = await fetch('/nexus/pull?kind=' + encodeURIComponent(kind)); if (!r.ok) return []; const j = await r.json().catch(() => ({})); return Array.isArray(j.items) ? j.items : []; } } }).ploxion);
  window.jOSNatif.sante = sante.api;
  setTimeout(() => sante.synchroniser().catch(() => {}), 5000);   // ☁ hors du chemin critique : le résumé santé (si activé et connecté)
  if (!modeSurJs) { maj.demarrer(); remontee.demarrer(); }   // ↻ (0.80) la première vérification 20 s après le lancement, puis à la fréquence choisie
  setTimeout(() => iconesLabo.recharger().then(c => (c ? majAccueil() : null)).catch(() => {}), 3000);   // ⬡ (0.82) tes glyphes dessinés au labo
  window.jOSNatif.tsoin = (o) => tsoinNatif.ouvrir(o || {});
  const hud = creerHud({ compte, boxion, vocalEnCours: () => vocal.enCours(), trouver: (id) => routeur && routeur.catalogue().find(p => p.id === id), modeConnecte: () => modeConnecte, prefs: () => prefs.lire() });
  await hud.pret;
  boot(70, 'HUD · dock');
  // ⚙ les réglages : un ploxion interne, au bout du ⚙ de l'accueil (jamais retirable)
  // les notifications (test, et les messages de coord tant que l'app est au premier plan ; la vraie « app fermée » demande APNs)
  const notifs = creerNotifs({ boxion, vibrer, envoyer: (q) => httpRelais.requete(q, fetchOrigine),
    ouvrir: (id, p) => { routeurProxy.ouvrir(id); if (id === 'proche' && p && p.salon) { proche.page('messages'); proche.voir(p.salon); } } });   // ◉ (0.99.40) une notification de Proche : la conversation
  proche.brancherNotifier((o) => notifs.proche(o).catch(() => false));
  notifs.brancherReponse((salon, texte) => { proche.repondre(salon, texte).catch(() => {}); }, (salon) => proche.marquerLu(salon));   // ↩ (0.99.45) répondre depuis la notification
  // 🔔 (0.91) les notifications push, app fermée aussi (la clé APNs vit sur le labo : docs/PUSH.md)
  const push = creerPush({ boxion, envoyer: (q) => httpRelais.requete(q, fetchOrigine), ouvrir: (id, p) => routeurProxy.ouvrir(id, p || undefined), vibrer: (x) => vibrer(x),
    signaler: (t) => routeur && routeur.signaler(t), connecte: () => !!(compteRef && compteRef.etat().connecte),
    natif: () => plateforme() === 'ios' });   // (0.99.32) Android : le push passe par Firebase (google-services.json) ; sans lui, register() tue l'app
  notifs.push = push;
  await notifs.pret;
  boot(73, 'notifications');
  internes.push(enregistrerReglages({ compte, social, remontee, hud, routeur: () => routeur, depot, boxion, modeConnecte: reglerModeConnecte, notifs, prefs, vibrer, haptique, lecteur, lecteurNatif, sante, cube, valeurs: () => (raccourcis ? raccourcis.toutes() : {}), version: VERSION, maj }));
  // le vecteur xerion de ce téléphone : le temps passé par ploxion (même forme que jOSUsage du labo : { px: { id: { opens, seconds, lastAt } } })
  async function surUsage(id, sec) {
    const u = (await boxion.get('usage', 'stats')) || { px: {} };
    const p = u.px[id] = u.px[id] || { opens: 0, seconds: 0, lastAt: 0 };
    p.opens++; p.seconds += sec; p.lastAt = Date.now();
    boxion.append('passe', { id, sec }).catch(() => {});   // ○ (0.97) le fil du passé : chaque visite, dans l'ordre (src/lot/passe.js)
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
  // (0.55) les verrous Face ID (un ploxion verrouillé passe par l'app), le jeton du compte (les propositions d'icônes), l'atelier → l'accueil
  const ecranAccueil = creerEcranAccueil({ trouver: (id) => routeur.catalogue().find(p => p.id === id), liste: () => routeur.catalogue(), boxion, envoyer: (q) => httpRelais.requete(q, fetchOrigine), source: SOURCE,
    verrous: () => (routeur ? routeur.verrous() : []), jeton: () => boxion.get('compte', 'courant').then(c => (c && c.jeton) || null), surPerso: () => { majAccueil({ redessiner: true }).catch(() => {}); }, seul: () => prefs.lire().styleIcones === 'glyphe' });
  window.jOSEcranAccueil = ecranAccueil;
  boot(78, 'l\'accueil');
  // ◈ (0.50) les modes : chill-tekk, xerboxion (l'UI du labo), xerbot (le monde physique)
  const modes = creerModes({ cadres, connecter: (c) => connexionLabo.adresse(c), prefs, ouvrir: (id) => routeurProxy.ouvrir(id), connait: (id) => !!(routeur && routeur.connait(id)), source: SOURCE, chemin: '/xer/chill-tekk', vibrer: (x) => vibrer(x), controleur: controleur.api });   // ⬡ (0.99.55) le xer xerboxion = le xer chill-tekk du labo
  modes.attacher(racine);
  let coupesConnues = new Set();   // les bions coupés (⚙ › Bions), relus à chaque ouverture ; gardés pour brancher les plugions sans attendre
  routeur = creerRouteur({ habiller: (id, hote) => (XERS_PLOXIONS[id] && prefs.lire().xerPloxions !== false ? XERS_PLOXIONS[id](hote, { W: window, vibrer: (x) => vibrer(x) }) : null), sonDe: (id) => (gel ? gel.aDuSon(id) : false), surChercher: () => (chercheur ? chercheur.ouvrir() : routeur.ouvrir('marketplace', { chercher: '1' })), surXers: () => (vueXers ? vueXers.ouvrir() : routeur.carte()), panneau: () => modes.panneau(), racine, catalogue: internes, boxion, vibrer, doubleBord: () => routeurProxy.ouvrir('portion'), surVocal: () => vocal.basculer(), ouvrirExterne: (id, p) => routeurProxy.ouvrir(id, p), prefs: () => prefs.lire(), usage: () => boxion.get('usage', 'stats'), retirer: async (id) => { await depot.retirer(id); await majAccueil(); }, verrou: window.jOSVerrou, bundleLocal: (id) => depot.bundle(id, { deja: bionsCharges, present: (b) => window[b] != null }), apresChargement: (id) => { brancherPlugions(window, coupesConnues); /* (0.99.21) avant le montage : jOSZone a sa zone dès la première ouverture */ boxion.get('reglages', 'bions-coupes').then(c => { coupesConnues = new Set(c || []); brancherPlugions(window, coupesConnues); }).catch(() => {}); socialApple(id); }, hud, ecranAccueil, surUsage: (id, s) => surUsage(id, s).catch(() => {}),
    miniDocks: { surVivants: () => miniDocks.planifier(), surFermeture: (id) => { miniDocks.surFermeture(id); if (gel) gel.liberer(id); }, page: () => miniDocks.ouvrirPage() },
    surMontrer: (id) => { if (gel) gel.degeler(id); },
    surTuto: (id) => (tutoHud ? tutoHud.ouvrir(id) : null),   // ◎ (0.63) haut gauche : le HUD de tuto
    partager: (id) => partage.partagerPloxion(id),   // ↗ (0.76) le menu d'un ploxion › le partager
    toucherRapide,   // ◈ (0.78) le cœur d'un clicker n'est jamais un clic droit
    boutonsBarre: (id) => clickerNatif.boutonsBarre(id),   // 🏆 (0.79)
    tsoin: () => tsoinNatif.ouvrir(), surSession: (x) => { boxion.put('reglages', 'session', x).catch(() => {}); barreHaut.peindre(); usage.track(x.courant); } });
  window.ploxi0nRouteur = routeur;
  // ▶ (0.63) les démos (un doigt fantôme fait le geste pour de vrai) et le HUD de tuto (haut gauche) : « le jeu, c'est le tuto »
  const demo = creerDemo({ routeur: () => routeur, signaler: (t) => routeur.signaler(t) });
  tutoHud = creerTutoHud({ boxion, routeur: () => routeur, demo, prefs: () => prefs.lire(), vibrer, glyphe: (n) => G(n), tsoin: (x) => tsoinNatif.enregistrer(x) });
  window.ploxi0nDemo = demo;
  // ⊞ (0.64) la carte du xerboxion : pincer la fractale, ⊞, le bord « tout le xerboxion »
  // 🔍 (0.69) chercher d'abord chez soi : les ploxions installés, puis le marketplace ; ↻ tout mettre à jour (src/app/chercher-local.js)
  chercheur = creerChercherLocal({ racine, liste: () => routeur.catalogue(), vivants: () => routeur.vivants(), ouvrir: (id) => routeurProxy.ouvrir(id), vibrer: (x, i) => vibrer(x, i),
    marketplace: (q) => routeur.ouvrir('marketplace', q ? { chercher: '1', q } : { chercher: '1' }), majTout: async () => { const r = await depot.aJour(); await majAccueil().catch(() => {}); return r; },
    icone: (p) => p.icone || svgXerkion(p, { seul: prefs.lire().styleIcones === 'glyphe' }) });
  // ▣ (0.68) le cube des pages : ▣ dans la barre d'un ploxion (src/app/cube-pages.js)
  routeur.brancherCube(creerCubePages({ W: window, boxion, vibrer: (x) => vibrer(x), liste: () => routeur.listeCarte(), vivants: () => routeur.vivants(), tsoins: () => tsoinNatif.liste(8),
    aller: (id) => routeurProxy.ouvrir(id), icone: (p) => p.icone || svgXerkion(p, { seul: prefs.lire().styleIcones === 'glyphe' }), glyphe: (n) => G(n) }));
  const carteXer = creerCarteXer({ racine: document.body, liste: () => routeur.listeCarte(), courant: () => routeur.courant(), aller: (id) => routeur.aller(id), vibrer, boxion, calme: () => !!prefs.lire().calme, glyphe: (n) => G(n) });
  routeur.brancherCarte(carteXer);
  // ⊡ (0.70) la vue des xers : le xer en image, ses voisins de la carte autour (glisser dans 4 directions) ; la capture d'écran d'iOS l'ouvre
  const apercus = creerApercus({ W: window, boxion, plugin: PloxiApple }); apercus.lire().catch(() => {});
  vueXers = creerVueXers({ racine, photo: (id) => apercus.src(id), oublierPhoto: (id) => apercus.oublier(id), liste: () => routeur.listeCarte(), places: () => carteXer.placesAJour(), courant: () => routeur.courant(),
    hoteDe: (id) => document.querySelector('.px-scene>.px-hote[data-ploxion="' + CSS.escape(id) + '"]'), aller: (id) => routeur.aller(id), accueil: () => routeur.accueil(),
    carte: () => routeur.carte(), vibrer: (x, i) => vibrer(x, i), calme: () => !!prefs.lire().calme, icone: (p) => p.icone || svgXerkion(p, { seul: prefs.lire().styleIcones === 'glyphe' }) });
  // 📸 (0.72) la capture d'écran : d'abord la photo du xer, gardée par le téléphone (Caches/xers) ; ensuite seulement la vue (sinon on la photographierait)
  window.addEventListener('ploxi0n-capture', async () => {
    if (vueXers.ouverte()) return;
    try { await apercus.capturer(routeur.courant() || '·'); } catch (e) { /* pas de photo : la vue s'ouvre quand même */ }
    try { if (!vueXers.ouverte()) vueXers.ouvrir({ capture: true }); } catch (e) { /* */ }
  });
  // ❄ (0.53) le gel : un ploxion vivant mais caché n'anime plus (requestAnimationFrame mis de côté jusqu'à ce qu'on le revoie)
  gel = installerGel({ courant: () => routeur.courant(), vivants: () => routeur.vivants() });
  // ◇ (0.54) plus d'emoji dans l'interface de l'app : des glyphes du xerboxion (les ploxions du labo gardent leur contenu)
  // (0.54) une vidéo passe en plein écran : les ploxions cachés s'endorment (la mémoire ; iOS tuait la page : « ça crash »)
  // 🛡 (0.63) un plein écran SANS toucher, d'un ploxion caché, pendant la fractale ou par-dessus le lecteur natif (« un lecteur random qui pop ») :
  // refermé aussitôt (playsinline, et en pause s'il n'est pas à l'écran) — et on n'endort rien pour lui (endormir son propre hôte = le plantage)
  document.addEventListener('webkitbeginfullscreen', (e) => {
    const v = e.target;
    if (v && v.tagName === 'VIDEO' && !lecteurNatif.garde.permis(v)) {
      try { v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', ''); if (!lecteurNatif.garde.aLEcran(v)) v.pause(); } catch (er) { /* */ }
      const sortir = () => { try { if (v.webkitDisplayingFullscreen && v.webkitExitFullscreen) v.webkitExitFullscreen(); } catch (er) { /* */ } };
      setTimeout(sortir, 0); setTimeout(sortir, 700);   // pendant l'entrée, WebKit ignore parfois la sortie : une seconde fois après l'animation
      return;
    }
    try { routeur.endormirCaches(); } catch (er) { /* */ }
  }, true);
  // ◇ (0.99.56, RS-7 via xerxion1 : « plus aucun emoji ») : tous les ploxions, ceux du labo aussi ; ce que les gens écrivent ([data-ecrit], les champs) garde ses signes
  installerSansEmoji({ interne: () => true, actif: () => prefs.lire().glyphes !== false });
  // ⟡ (0.99.14) la langue de l'app : ⚙ › Apparence › Langue, ou celle de l'iPhone ; les néologismes restent (src/bions/dire.js)
  // ⊕ (0.99.19, RS-7 : « l'entièreté du truc est trop petite ») la taille de tout. ⚙ › Apparence › Taille de tout.
  // (0.99.26, RS-7 27.10 : « aucune action avec le bord droit ne fonctionne, les menus se perdent ») le zoom de page de WebKit (pageZoom ×1,15,
  // la taille « grande » par défaut) posait ce qui est fixé à droite 393 × 0,15 ≈ 59 pt AU-DELÀ de l'écran — le bord droit, ▤, la fin du dock —
  // et la vue glissait de côté d'autant. Maintenant : la balise viewport (mise en page à largeur / z, agrandie ×z), sur l'iPhone et partout
  // où elle compte ; le zoom natif est remis à 1. Le zoom CSS ne reste que pour un navigateur de bureau (il ignore la balise).
  { let avant = null; const poser = (p) => { const z = Math.min(1.6, Math.max(0.8, +p.taille || 1)); if (z === avant) return; avant = z;
      const apres = () => window.dispatchEvent(new Event('resize'));   /* la map, les membranes : tout se remesure */
      const mobile = natifLot || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
      if (appleIci) PloxiApple.taille({ zoom: 1 }).catch(() => {});   // un ancien zoom natif (avant 0.99.26) ne reste jamais
      if (mobile) { document.documentElement.style.zoom = ''; zoomViewport(z); window.setTimeout(apres, 60); } else { document.documentElement.style.zoom = z === 1 ? '' : String(z); apres(); } };
    poser(prefs.lire()); prefs.surChangement(poser); }
  const langueApp = installerLangue({ W: window, interne: (id) => !!(routeur.catalogue().find(p => p.id === id) || {}).interne });
  { const choisie = (p) => langueDe(p.langue, navigator.languages || [navigator.language]);
    langueApp.appliquer(choisie(prefs.lire())); prefs.surChangement((p) => langueApp.appliquer(choisie(p))); }
  { const cle = (p) => p.glyphes + '|' + p.styleIcones; let g = cle(prefs.lire()); prefs.surChangement((p) => { if (cle(p) === g) return; g = cle(p); if (routeur.courant()) routeur.rafraichirHud(); else routeur.accueil(); }); }
  // ▔ notre barre du haut, en plein écran (la place de la barre d'état d'iOS) : composable, appui long dessus
  const barreHaut = creerBarreHaut({ boxion, compte, vibrer: (x) => vibrer(x), actif: () => { const q = prefs.lire(); return !!q.pleinEcran && q.barreHaut !== false; },
    courant: () => { const c = routeur.courant(); return c ? ((routeur.catalogue().find(p => p.id === c) || {}).nom || c) : null; },
    ouverts: () => routeur.vivants().length + routeur.endormis().length });
  if (!modeSurJs) barreHaut.installer(document.body);
  // 🌀 le thème vivant : il suit le gyroscope et l'accéléromètre (seulement à l'accueil, visible, hors Calme)
  if (!modeSurJs) creerMouvement({ prefs, racine });
  // ◌ (0.99.11) le téléphone vivant : la chaleur, la batterie, le son, au bord de l'écran (RS-7 : « on aura l'impression que le téléphone est vivant »)
  // (0.99.19) la peau « auto » : légère dès que l'iPhone passe en économie d'énergie (relu toutes les 60 s et au retour dans l'app)
  if (appleIci) { const economie = () => { if (prefs.lire().peau !== 'auto' || document.hidden) return; PloxiApple.systeme().then((x) => { const e = x && x.economie ? '1' : '0'; if (document.documentElement.getAttribute('data-px-economie') !== e) { document.documentElement.setAttribute('data-px-economie', e); prefs.appliquer(); } }).catch(() => {}); };
    economie(); setInterval(economie, 60000); document.addEventListener('visibilitychange', economie); prefs.surChangement(economie); }
  // ♿ (0.99.44) les aides motrices d'iOS (regard, tête, contrôle de sélection, AssistiveTouch, VoiceOver) : les grandes cibles en « auto » ;
  // au lancement et à chaque retour dans l'app (on les allume dans Réglages iOS, puis on revient). jOSNatif.assistance() pour les ploxions.
  if (appleIci) { const assistance = () => { if (document.hidden) return; PloxiApple.assistance().then((a) => { const on = !!(a && (a.assistiveTouch || a.selection || a.voiceOver)); if (!!window.__ploxiAssistance !== on) { window.__ploxiAssistance = on; prefs.appliquer(); } }).catch(() => {}); };
    assistance(); document.addEventListener('visibilitychange', assistance); window.jOSNatif.assistance = () => PloxiApple.assistance(); }
  if (!modeSurJs) installerTelVivant({ W: window, prefs, systeme: appleIci ? () => PloxiApple.systeme() : null, batterie: natifLot ? () => window.jOSNatif.batterie() : null });
  prefs.surChangement(() => barreHaut.mesurer());
  window.ploxi0nBarreHaut = barreHaut;
  const rafraichir = () => { if (routeur.courant()) routeur.rafraichirHud(); else routeur.accueil(); };
  compte.surChangement(rafraichir);
  hud.surChangement(() => routeur.rafraichirHud());
  window.addEventListener('online', () => routeur.rafraichirHud()); window.addEventListener('offline', () => routeur.rafraichirHud());
  await majAccueil();
  boot(86, routeur.catalogue().length + ' ploxions à l\'accueil');
  // ⧉ (0.81) jOSApps.monter / peut / ensure / charge, le contrat de la coquille du labo : un ploxion en compose d'autres (ultimate-social :
  // social, chat, carte…). Avant, peut() = « installé » → « indisponible ici » ; maintenant le sous-ploxion s'installe tout seul (src/shim/apps-a-la-demande.js)
  let catalogueIds = new Set();
  const lireCatalogueIds = () => depot.catalogue({ reseau: false }).then(c => { catalogueIds = new Set((c.items || []).map(x => x.id)); }).catch(() => {});
  lireCatalogueIds();
  installerAppsALaDemande({ W: window, connu: (id) => routeur.connait(id) || depot.packLocal().some(p => p.id === id) || catalogueIds.has(id) || (!catalogueIds.size && navigator.onLine !== false),
    ensureApp: async (id) => { if (!routeur.connait(id) && !(await installerSilencieux(id))) throw new Error('ploxion « ' + id + ' » : introuvable au labo'); return routeur.chargerApp(id); } });
  // ◺◿ (0.89) les koins remplacent le dock et le HUD (le carnet de RS-7, docs/KOINS.md) : ⚙ › HUD et dock › Les koins
  // ◺◿ (0.97, RS-7 : « pourquoi besoin d'un dock quand on a des koins » — « mais la suppression du dock, c'est pour le mode organique ») :
  // en organique, les koins toujours (plus de dock) ; ailleurs, le réglage d'avant
  const koins = creerKoins({ actif: () => prefs.lire().mode === 'organique' || !!prefs.lire().koins, vibrer: (x) => vibrer(x), calme: () => !!prefs.lire().calme, actions: {
    koins: () => (routeur.connait('xerkion-perso-koin-ion') ? routeur.ouvrir('xerkion-perso-koin-ion') : routeur.signaler('le koin du ion n\'est pas encore semé ici')),
    temps: () => routeurProxy.ouvrir('passe'),   // ○ (0.97) le wormion : se balader dans le temps (le passé)
    xers: () => routeur.faire('mes-xers'), carte: () => routeur.faire('map'),   // □ portion : la map (0.90) ; (0.99.47) ces deux-là étaient avalés par le commentaire d'au-dessus
    // ⊠ (0.99.47) la case xer : les quatre modes, sur place ; en choisir un change le xer de l'accueil
    modes: () => MODES.map(([id, glyphe, nom]) => ({ id, glyphe, nom, on: (prefs.lire().mode || 'chill-tekk') === id })),
    choisirMode: (id) => prefs.regler({ mode: id }).then(() => { if (!routeur.courant()) routeur.faire('accueil'); }).catch(() => {}),
    // △ (0.99.47) le koin du ion, « ici, maintenant » (une proposition, docs/KOINS.md) : ce qui vit, qui est autour
    sous_koins: () => { const v = routeur.vivants().length, p = (proche && proche.etat().actif && proche.maille && proche.maille()) ? proche.maille().pairs().filter(x => x.direct).length : null;
      return [v ? v + ' vivant' + (v > 1 ? 's' : '') : 'rien ne vit', p != null ? p + ' voisin' + (p > 1 ? 's' : '') : null].filter(Boolean).join(' · '); },
    tsoin: () => tsoinNatif.ouvrir(), journal: () => routeurProxy.ouvrir('journal-tsoins'), accueil: () => routeur.faire('accueil'),
    quoi: () => { if (window.ploxi0nTuto && window.ploxi0nTuto.cestQuoi) window.ploxi0nTuto.cestQuoi(); },   // ⓘ (0.95) c'est quoi ça ?
    toi: () => routeurProxy.ouvrir('reglages-app'), retour: () => (routeur.courant() ? routeur.retour() : null), minimiser: () => routeur.faire('minimiser'),
    // ○ □ (0.92) les trackpads : le temps (le plus récent d'abord), et les directions du portion
    listeTemps: () => { const cat = routeur.catalogue(), nom = (id) => ((cat.find(p => p.id === id) || {}).nom || id); return [...routeur.vivants().slice().reverse(), ...routeur.endormis()].filter((id, i, l) => id !== routeur.courant() && l.indexOf(id) === i).slice(0, 12).map(id => ({ id, nom: nom(id) })); },
    aller: (id) => routeurProxy.ouvrir(id), precedente: () => routeur.faire('precedente'), suivante: () => routeur.faire('suivante') } });
  koins.poser(); prefs.surChangement(() => koins.poser());
  window.ploxi0n = { boxion, shim, routeur, prefs, depot, compte, version: VERSION, modeConnecte: reglerModeConnecte, koins, langue: langueApp };
  // 👁 (0.99.46) piloter de la tête ou du regard (⚙ › Piloter de la tête) : notre suivi, PloxiRegard (ARKit) + src/bions/tete.js
  const regard = creerRegard({ W: window, boxion, vibrer: (x) => vibrer(x), routeur, signaler: (t) => routeur.signaler(t), inverse: () => !!prefs.lire().regardInverse,
    natif: natifLot && ploxiIci('PloxiRegard') ? creerRegardNatif({ plugin: PloxiRegard }) : null });
  window.jOSRegard = regard.api; window.ploxi0nRegard = regard;
  { let avant = 'non'; const suivre = () => { const m = prefs.lire().regard || 'non'; if (m === avant) return; avant = m; regard.regler(m).catch((e) => { routeur.signaler('👁 ' + ((e && e.message) || 'impossible')); avant = 'non'; prefs.regler({ regard: 'non' }).catch(() => {}); }); };
    suivre(); prefs.surChangement(suivre); }
  { let inv = !!prefs.lire().regardInverse; prefs.surChangement(() => { const n = !!prefs.lire().regardInverse; if (n !== inv) { inv = n; if (regard.mode() !== 'non') regard.regler(regard.mode()).catch(() => {}); } }); }
  brancherLiens({ routeur, compte, surLien: (r) => { const c = invitationDuLien(r); if (c) boxion.put('social', 'invitation', { code: c, le: Date.now() }).catch(() => {}); }, installer: (id) => routeurProxy.ouvrir(id), lecture: (c) => maintenant.commander(c), lire: (o) => lecteurNatif.ouvrir(o.url, o).catch(() => {}),
    // ☾ (0.64) ploxi0n://dodo et ploxi0n://reveil : un raccourci, le Toucher au dos, ou l'automatisation « quand Sommeil s'active » d'iOS le notent seuls
    actions: { dodo: () => tsoinNatif.dodo().then(() => routeur.signaler('☾ dodo noté')).catch(() => {}), reveil: () => tsoinNatif.reveil().catch(() => {}),
      tsoin: () => tsoinNatif.ouvrir({}), vocal: () => vocal.basculer().catch(() => {}), lampe: () => window.jOSNatif.lampe().catch(() => {}),
      // 🎛 (0.99.43) Proche (allumer / éteindre, comme le Bluetooth), la balade (la Live Activity de mappion), les toilettes guidées
      proche: () => { if (proche.etat().actif) { proche.arreter().then(() => routeur.signaler('◉ Proche éteint')).catch(() => {}); return; } routeur.ouvrir('proche'); proche.demarrer().catch(() => {}); },
      balade: () => { const B = window.jOSVeille && window.jOSVeille.balade; if (!B) return routeur.signaler('🏝 la balade : sur l\'iPhone seulement');
        (etatCtl.balade ? B.fin().then(r => routeur.signaler('🏝 balade finie · ' + Math.round((r && r.metres) || 0) + ' m')) : B.debut({ titre: 'balade', ploxion: 'mappion' }).then(() => routeur.signaler('🏝 la balade est sur l\'écran verrouillé')))
          .catch((er) => routeur.signaler('🏝 ' + ((er && er.message) || 'impossible'))); },
      toilettes: () => { routeur.ouvrir('autour'); autour.toilettes().catch(() => {}); } } });   // une icône de l'écran d'accueil vers un ploxion absent : installé à la volée
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
  // 🧭 (0.95) le guide : apprendre en faisant (une fois par version du guide), les astuces au bon moment, « c'est quoi ça ? » ;
  // ⚙ › À propos › « revoir le guide »
  const tuto = creerGuide({ boxion, routeur: () => routeur, vibrer: (x) => vibrer(x), demo, connecter: () => compte.connecter() });
  window.ploxi0nTuto = tuto;
  // ✦ après une mise à jour : ce qui a changé (pas au tout premier lancement : le tuto)
  const nouveautes = creerNouveautes({ boxion, version: VERSION, vibrer: (x) => vibrer(x), essayer: (nom) => demo.jouer(nom) });
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
  // (0.54, RS-7 : « il faudrait avoir le PiP automatique ») la vidéo qu'on regarde passe en PiP en quittant l'app ; les autres (cachées) s'arrêtent
  // 🛡 (0.63) inactive n'est pas partie : pas de PiP par-dessus le lecteur natif, ni pendant la fractale, ni juste après un toucher (l'inactivité vient
  // alors de ce qu'il a ouvert — Face ID, une alerte d'autorisation — : le PiP y sautait au visage, « un lecteur vidéo random qui pop ») ; un hôte visible
  function pipAuto() { try { const g = lecteurNatif.garde; if (g.occupe() || g.toucheRecent() || document.querySelector('#ploxi0n.px-fx')) return;
    const c = routeur && routeur.courant(), h = c && document.querySelector('.px-hote[data-ploxion="' + CSS.escape(c) + '"]'); const m = h && !h.hidden && [...h.querySelectorAll('video')].find(v => !v.paused && !v.ended);
    if (m && m.webkitSupportsPresentationMode && m.webkitSupportsPresentationMode('picture-in-picture') && m.webkitPresentationMode !== 'picture-in-picture') m.webkitSetPresentationMode('picture-in-picture'); } catch (e) { /* refusé : elle s'arrête */ } }
  function couperVideosArrierePlan() { lecteurNatif.garde.arrierePlan(); pipAuto(); try { for (const m of document.querySelectorAll('video')) { if (!m.paused && document.pictureInPictureElement !== m && !m.webkitPresentationMode?.startsWith?.('picture')) m.pause(); } } catch (e) { /* */ } }
  if (!modeSurJs) { notifs.demarrer(); push.demarrer().catch(() => {}); widgetsPx.rafraichir(); }
  else { const b = document.createElement('div'); b.className = 'px-bulle'; b.textContent = '🛟 mode sûr pour ce lancement (le prochain réessaie tout). S\'il s\'est ouvert : le coupable est le fond photo, le thème vivant ou la session — dis-le à bother me.'; racine.appendChild(b); setTimeout(() => b.remove(), 9000); }
  // ⌂ (0.99.32) le bouton retour d'Android : ce qui flotte, puis le ploxion, puis rien si ploxion est l'écran d'accueil ; le bouton maison → l'accueil
  if (plateforme() === 'android') import('@capacitor/app').then(({ App }) => { window.ploxi0n_retour = brancherRetourAndroid({ W: window, app: App, routeur, accueil: accueilAndroid,
    flottant: () => { const l = document.querySelectorAll('.px-feuille,.px-voile'); return l.length ? l[l.length - 1] : null; } }); }).catch(() => {});
  appareilXb.auLancement().catch(() => {});   // ▸ (0.99.33) l'agent xb, seulement si « allumé au lancement »
  if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
    // Face ID (0.55) : en arrière-plan, les ploxions verrouillés se referment ; au retour, celui qui était à l'écran redemande le visage
    import('@capacitor/app').then(({ App }) => { let aReprendre = null; App.addListener('pause', () => { aReprendre = routeur.reverrouiller(); }); App.addListener('resume', () => { const id = aReprendre; aReprendre = null; if (id) routeur.redemander(id).catch(() => {}); }); }).catch(() => {});
    import('@capacitor/app').then(({ App }) => App.addListener('appStateChange', (e) => { if (e.isActive) { raccourcis.recevoir().catch(() => {}); notifs.demarrer(); sante.synchroniser().catch(() => {}); } else { notifs.arreter(); publierValeurs().catch(() => {}); dossier.synchroniser().catch(() => {}); couperVideosArrierePlan(); } })).catch(() => {});
  }
}
// (0.69) jamais un écran mort : la raison, ce qu'on peut y faire, et « réessayer » (la base fermée par iOS se rouvre une fois l'iPhone déverrouillé)
demarrer().catch((e) => {
  try { window.__bootFin && window.__bootFin(); } catch (er) { /* */ }
  const r = document.getElementById('ploxi0n'), m = String(e && e.message).replace(/[<&]/g, '');
  r.innerHTML = '<div class="px-erreur px-erreur-boot"><p>ploxi0n n\'a pas pu démarrer : ' + m + '</p>' + (e && e.verrouille ? '<p>Tes données sont chiffrées par iOS tant que l\'iPhone est verrouillé : déverrouille-le, puis réessaie.</p>' : '') + '<button type="button" data-reessayer-boot>↻ réessayer</button></div>';
  const b = r.querySelector('[data-reessayer-boot]'); if (b) b.onclick = () => location.reload();
  if (e && e.verrouille) document.addEventListener('visibilitychange', () => { if (!document.hidden) location.reload(); });   // revenu, déverrouillé : on repart
});
