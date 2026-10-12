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

const VERSION = '0.31.0';

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

async function demarrer() {
  let compteRef = null;   // le compte (plus bas) : admin → les ploxions admin du marketplace ; connecté → jOSBoxion sur le boxion
  garderViewport();
  clavierNatif();
  clavierAuToucher();
  installerClavierIos({ W: window });   // les bons attributs pour le clavier d'iOS (dictée, trousseau, codes SMS, Entrée)
  const racine = document.getElementById('ploxi0n');
  const boxion = await ouvrirBoxionLocal();
  const prefs = creerPrefs({ boxion }); await prefs.pret; prefs.appliquer();   // l'apparence avant le premier dessin
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
  installerJosNatif(window);   // ⚡ le bion natif : toutes les capacités de l'iPhone, pour tous les ploxions
  // l'haptique de l'app (ouvrir, revenir, minimiser, les bords, les pages…) : par jOSNatif, coupée dans ⚙ › Apparence
  // 🎞 le lecteur natif : chaque <video>/<audio>/<iframe YouTube> des ploxions (écran verrouillé, AirPlay, PiP, YouTube par https, haptique du son)
  const lecteur = installerLecteur({ boxion, vibrer: (s) => vibrer(s), titre: () => (routeur && routeur.courant() && (routeur.catalogue().find(p => p.id === routeur.courant()) || {}).nom) || 'ploxi0n' });
  window.jOSNatif.lecteur = { pip: (m) => lecteur.pip(m), pleinEcran: (m) => lecteur.pleinEcran(m), airplay: (m) => lecteur.airplay(m) };
  const haptique = creerHaptique({ boxion, actif: () => prefs.lire().haptique !== false && !!(window.jOSNatif && window.jOSNatif.natif) }); await haptique.pret;
  // un événement de l'app, un style, ou un motif inventé ; ouvrir/reprendre un ploxion = SA signature (ou son choix, ou son manifeste)
  const vibrer = (ev, id) => ((ev === 'ouvrir' || ev === 'reprendre') && id
    ? haptique.jouerPloxion(id, ev, window.jOSApps && window.jOSApps[id] && window.jOSApps[id].manifest && window.jOSApps[id].manifest.haptique)
    : haptique.jouer(ev));
  window.jOSNatif.haptique = (x) => haptique.jouer(x);   // les ploxions (le clicker…) jouent un style, un motif ou un événement
  const bionsCharges = new Set();   // un seul chargement par bion, pour toute l'app
  let routeur = null;
  // un ploxion en ouvre un autre (jOSXerPrefs.ouvrir, jOS.openPloxion) : s'il n'est pas installé et qu'il y a du réseau, on l'installe à la volée
  const routeurProxy = {
    async ouvrir(id, params) {
      if (!routeur.connait(id)) {
        try { const c = await depot.catalogue({ reseau: false }); const m = (c.items || []).find(x => x.id === id) || {}; await depot.installer(id, { nom: m.nom, icone: m.icone }); await majAccueil(); }
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
    appel: async (methode, chemin, corps) => {
      const r = await httpRelais.requete({ methode, url: SOURCE + chemin, headers: { Accept: 'application/json', ...(corps ? { 'Content-Type': 'application/json' } : {}) }, corps: corps ? JSON.stringify(corps) : undefined }, fetchOrigine);
      let data = null; try { data = JSON.parse(r.texte || 'null'); } catch (e) { /* */ }
      return { status: r.status, data };
    },
  };
  const shim = await installerShim({ boxion, routeur: routeurProxy, relais, distant });
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
  const lireJson = async (u, defaut) => { try { return await (await fetch(u)).json(); } catch (e) { return defaut; } };
  const indexPack = await lireJson('/ploxions/index.json', { ploxions: [] }), pack = indexPack.ploxions || [];
  const compat = await lireJson('/marketplace/compat.json', {});
  const depot = creerDepot({ boxion, http: creerHttp(window, enTetes), estAdmin: () => !!(compteRef && compteRef.etat().admin), compat, packLocal: pack, lireLocal: async (id) => (await fetch('/ploxions/' + encodeURIComponent(id) + '/app.js')).text(),
    lireBionLocal: async (b) => { const r = await fetch('/bions/' + encodeURIComponent(b) + '.js'); if (!r.ok) throw new Error('bion absent'); return r.text(); } });
  // les ploxions de base (index.json « base » : bother me pour les testeurs) : installés une fois, au premier lancement ; retirables ensuite
  const deja = (await boxion.get('reglages', 'base-installes')) || [];
  for (const id of (indexPack.base || []).filter(b => !deja.includes(b))) {
    try { await depot.installerLocal(id); deja.push(id); } catch (e) { console.warn('ploxion de base', id, e); }
  }
  await boxion.put('reglages', 'base-installes', deja);
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
  await compte.pret; compteRef = compte;
  if (navigator.onLine !== false) { compte.rafraichir().catch(() => {}); if (window.jOSBoxion.pousser) window.jOSBoxion.pousser().catch(() => {}); }   // le rang et « admin » à jour (un jeton expiré → déconnecté)
  const reglerModeConnecte = (v) => { if (v != null) { modeConnecte = !!v; boxion.put('reglages', 'mode-connecte', modeConnecte); } return modeConnecte; };
  // 🎙 les vocaux : enregistrer, transcrire (iOS, le vocabulaire du xerboxion), garder ; jOSNatif.vocal pour les ploxions
  const vocal = creerVocal({ boxion, catalogue: () => (routeur ? routeur.catalogue() : []), vibrer: (x) => vibrer(x), ouvrir: (id, p) => routeurProxy.ouvrir(id, p), surEtat: () => routeur && routeur.rafraichirHud() });
  window.jOSNatif.vocal = vocal.api;
  // ⧗ les tsoins natifs : le composeur (dock, geste, Siri, jOSNatif.tsoin) et le journal ; connecté, ils partent aussi au boxion
  const tsoinNatif = creerTsoinNatif({ boxion, vibrer: (x) => vibrer(x), vocal, contexte: () => (routeur ? routeur.courant() : null),
    distant: () => (compte.etat().connecte && modeConnecte && navigator.onLine !== false ? window.jOSBoxion : null) });
  internes.push(tsoinNatif.ploxion);
  window.jOSNatif.tsoin = (o) => tsoinNatif.ouvrir(o || {});
  const hud = creerHud({ compte, boxion, vocalEnCours: () => vocal.enCours(), trouver: (id) => routeur && routeur.catalogue().find(p => p.id === id), modeConnecte: () => modeConnecte });
  await hud.pret;
  // ⚙ les réglages : un ploxion interne, au bout du ⚙ de l'accueil (jamais retirable)
  // les notifications (test, et les messages de coord tant que l'app est au premier plan ; la vraie « app fermée » demande APNs)
  const notifs = creerNotifs({ boxion, vibrer, envoyer: (q) => httpRelais.requete(q, fetchOrigine), ouvrir: (id) => routeurProxy.ouvrir(id) });
  await notifs.pret;
  internes.push(enregistrerReglages({ compte, hud, routeur: () => routeur, depot, boxion, modeConnecte: reglerModeConnecte, notifs, prefs, vibrer, haptique, lecteur, version: VERSION }));
  // le vecteur xerion de ce téléphone : le temps passé par ploxion (même forme que jOSUsage du labo : { px: { id: { opens, seconds, lastAt } } })
  async function surUsage(id, sec) {
    const u = (await boxion.get('usage', 'stats')) || { px: {} };
    const p = u.px[id] = u.px[id] || { opens: 0, seconds: 0, lastAt: 0 };
    p.opens++; p.seconds += sec; p.lastAt = Date.now();
    await boxion.put('usage', 'stats', u);
  }
  // un ploxion sur l'écran d'accueil de l'iPhone (via Raccourcis) : depuis l'édition de l'accueil et la fiche du marketplace
  const ecranAccueil = creerEcranAccueil({ trouver: (id) => routeur.catalogue().find(p => p.id === id), liste: () => routeur.catalogue(), boxion, envoyer: (q) => httpRelais.requete(q, fetchOrigine) });
  window.jOSEcranAccueil = ecranAccueil;
  routeur = creerRouteur({ racine, catalogue: internes, boxion, vibrer, doubleBord: () => routeurProxy.ouvrir('portion'), surVocal: () => vocal.basculer(), ouvrirExterne: (id) => routeurProxy.ouvrir(id), prefs: () => prefs.lire(), usage: () => boxion.get('usage', 'stats'), retirer: async (id) => { await depot.retirer(id); await majAccueil(); }, verrou: window.jOSVerrou, bundleLocal: (id) => depot.bundle(id, { deja: bionsCharges }), apresChargement: () => { boxion.get('reglages', 'bions-coupes').then(c => brancherPlugions(window, new Set(c || []))).catch(() => {}); }, hud, ecranAccueil, surUsage: (id, s) => surUsage(id, s).catch(() => {}),
    tsoin: () => tsoinNatif.ouvrir(), surSession: (x) => { boxion.put('reglages', 'session', x).catch(() => {}); barreHaut.peindre(); } });
  // ▔ notre barre du haut, en plein écran (la place de la barre d'état d'iOS) : composable, appui long dessus
  const barreHaut = creerBarreHaut({ boxion, compte, vibrer: (x) => vibrer(x), actif: () => { const q = prefs.lire(); return !!q.pleinEcran && q.barreHaut !== false; },
    courant: () => { const c = routeur.courant(); return c ? ((routeur.catalogue().find(p => p.id === c) || {}).nom || c) : null; },
    ouverts: () => routeur.vivants().length + routeur.endormis().length });
  barreHaut.installer(document.body);
  prefs.surChangement(() => barreHaut.mesurer());
  window.ploxi0nBarreHaut = barreHaut;
  const rafraichir = () => { if (routeur.courant()) routeur.rafraichirHud(); else routeur.accueil(); };
  compte.surChangement(rafraichir);
  hud.surChangement(() => routeur.rafraichirHud());
  window.addEventListener('online', () => routeur.rafraichirHud()); window.addEventListener('offline', () => routeur.rafraichirHud());
  await majAccueil();
  // jOSApps.monter / peut, comme dans le labo : un ploxion en monte un autre dans un coin (fill the gaps, les « ultimate »). Démontable.
  window.jOSApps.peut = (id) => routeur.connait(id);
  window.jOSApps.monter = (id, hote, ctx) => {
    let inst = null, mort = false;
    const pret = routeur.charger(id).then(app => { if (mort) return null; inst = app.mount(hote, ctx || { embed: true }) || null; return inst; })
      .catch(e => { if (hote) hote.textContent = '⚠ « ' + id + ' » indisponible : ' + (e && e.message); });
    return { ready: pret, unmount() { mort = true; if (inst && inst.unmount) { try { inst.unmount(); } catch (e) { /* */ } } inst = null; } };
  };
  window.ploxi0n = { boxion, shim, routeur, depot, compte, version: VERSION, modeConnecte: reglerModeConnecte };
  brancherLiens({ routeur, compte, installer: (id) => routeurProxy.ouvrir(id) });   // une icône de l'écran d'accueil vers un ploxion absent : installé à la volée
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
  }
  hud.surChangement(() => publierValeurs().catch(() => {}));
  await majAccueil();
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
  const lancementOk = async () => { try { const { Preferences } = await import('@capacitor/preferences'); await Preferences.set({ key: 'ploxi0n.lancement', value: 'ok' }); } catch (e) { /* hors iPhone */ } };
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
  if (id && routeur.connait(id)) await routeur.ouvrir(id);
  else {
    // la session d'avant (fermée, tuée par iOS, plantée) : le ploxion de devant revient ; après un plantage au lancement, tout dort 💤
    const sess = prefs.lire().reprendre !== false ? await boxion.get('reglages', 'session').catch(() => null) : null;
    if (sess && Array.isArray(sess.vivants) && sess.vivants.length) {
      await routeur.restaurer(sess, { devant: plantesAvant === 0 }).catch(() => routeur.accueil());
      if (plantesAvant > 0) { const b = document.createElement('div'); b.className = 'px-bulle'; b.textContent = '💤 tes ' + sess.vivants.length + ' ploxion(s) d\'avant dorment dans ⧉ (glisse un bord pour y revenir)'; racine.appendChild(b); setTimeout(() => b.remove(), 6000); }
    } else routeur.accueil();
  }
  lancementOk();
  // un raccourci (Siri, l'app Raccourcis, une automatisation) a pu demander un ploxion ou noter un tsoin
  raccourcis.recevoir().catch(() => {});
  publierValeurs().catch(() => {});
  notifs.demarrer();
  if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
    import('@capacitor/app').then(({ App }) => App.addListener('appStateChange', (e) => { if (e.isActive) { raccourcis.recevoir().catch(() => {}); notifs.demarrer(); } else { notifs.arreter(); publierValeurs().catch(() => {}); } })).catch(() => {});
  }
}
demarrer().catch((e) => { document.getElementById('ploxi0n').innerHTML = '<p class="px-erreur">ploxi0n n\'a pas pu démarrer : ' + String(e && e.message).replace(/[<&]/g, '') + '</p>'; });
