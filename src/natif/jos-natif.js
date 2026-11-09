// ⚡ jOSNatif — LE bion natif de ploxi0n (RS-7 12.10 : « un seul bion pour tout quand on peut, toujours la version la plus optimisée » ;
// « c'est ça le but d'une app native : pouvoir tout utiliser les choses natives pour plus de vitesse »).
// Un seul bion, toutes les capacités de l'iPhone, pour tous les ploxions : chaque fonction passe par le natif (plugins Capacitor) sur l'iPhone,
// et par le web ailleurs (le xer de labo.j0bot.ch n'a pas jOSNatif : un ploxion teste « if (window.jOSNatif) »).
//   jOSNatif.natif                     vrai sur l'iPhone
//   partager({ texte, url, titre })    la feuille de partage d'iOS
//   vibrer('leger'|'moyen'|'fort'|'selection'|'succes'|'erreur')   (0.63) sans attente, 60/s au plus ; vibrer.enVol() · vibrer.stats()
//   crans.debut() · crans.tic() · crans.fin()   une session de crans (un slider, une molette) : chaque tic = UN aller-retour natif
//   copier(texte) · coller() → texte
//   photo({ source: 'camera'|'galerie' }) → dataURL (jpeg)
//   position() → { lat, lng, precision }
//   notifier({ titre, texte, dans: secondes })
//   ouvrirLien(url)                    Safari (hors de l'app)
//   appareil() → { modele, systeme, version, nom } · batterie() → { niveau, enCharge } · reseau() → { connecte, type }
//   parler(texte, { langue })          la synthèse vocale d'iOS
//   meteo() WeatherKit · shazam() ShazamKit · musique.chercher/jouer/pause MusicKit (Apple Music)
//   capacites() → la liste de ce qui est disponible ici
import { PloxiApple, PloxiVocal } from './plugins-app.js';
import { MOTS } from './vocabulaire.js';
import { creerFenetre } from './haptique.js';
import { publierTexte } from '../app/liens-publics.js';

export function installerJosNatif(W = globalThis.window, { haptics = () => import('@capacitor/haptics') } = {}) {
  const natif = !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  // 🫧 (0.63, RS-7 : « il faut que ça soit plus smooth ») l'haptique SANS ATTENTE : le module des Haptics chargé UNE fois et gardé (le module,
  // jamais le plugin : c'est un Proxy sur iOS, rendu par une promesse il casse, cf. plugin-sur.js), puis chaque vibrer() part au pont tout
  // de suite. Les appels en vol sont comptés (le débit de l'haptique saute un tic si le pont traîne), 60/s au plus (le Taptic Engine n'en
  // rend pas plus, le banc trackpad l'a mesuré). Un cran (« selection ») hors session = start + changed sans attendre, la session reste
  // tiède 400 ms : les crans rapides suivants ne coûtent qu'UN selectionChanged (avant : start → changed → end, trois allers-retours en file).
  let H = null, chargeH = null, enVol = 0, ouverte = false, sessions = 0, minuterie = null;
  const rtt = [], plafond = creerFenetre({ plafond: 60 }), compte = { joues: 0, sautes: 0 };
  const horloge = () => (W.performance && W.performance.now ? W.performance.now() : Date.now());
  const chargerH = () => chargeH || (chargeH = Promise.resolve().then(haptics).then((m) => { H = m; }, (e) => { chargeH = null; throw e; }));
  const quand = (f) => (H ? f() : chargerH().then(f));
  function appel(f) {   // un aller-retour au pont : compté en vol, chronométré
    enVol++; const t0 = horloge(); let p;
    try { p = f(); } catch (e) { enVol--; return Promise.reject(e); }
    return Promise.resolve(p).then(() => { enVol--; rtt.push(horloge() - t0); if (rtt.length > 40) rtt.shift(); }, (e) => { enVol--; throw e; });
  }
  function fermerCrans() {
    if (minuterie) { W.clearTimeout(minuterie); minuterie = null; }
    sessions = 0; if (!ouverte) return Promise.resolve();
    ouverte = false; return quand(() => appel(() => H.Haptics.selectionEnd())).catch(() => {});
  }
  const armer = () => { if (minuterie) W.clearTimeout(minuterie); minuterie = W.setTimeout(() => { minuterie = null; fermerCrans(); }, sessions ? 8000 : 400); };   // 8 s sans cran : une session oubliée se referme
  const ouvrirCrans = () => { if (ouverte) return; ouverte = true; quand(() => appel(() => H.Haptics.selectionStart())).catch(() => {}); };
  function vibrer(style = 'leger') {
    if (!plafond.passe()) { compte.sautes++; return Promise.resolve(false); }
    compte.joues++;
    if (!natif) { if (W.navigator && W.navigator.vibrate) W.navigator.vibrate(style === 'fort' ? 40 : 15); return Promise.resolve(); }
    if (style === 'selection') { ouvrirCrans(); armer(); return quand(() => appel(() => H.Haptics.selectionChanged())); }   // un cran, comme une molette
    return quand(() => {
      const { Haptics, ImpactStyle, NotificationType } = H;
      if (style === 'succes' || style === 'erreur') return appel(() => Haptics.notification({ type: style === 'succes' ? NotificationType.Success : NotificationType.Error }));
      return appel(() => Haptics.impact({ style: { leger: ImpactStyle.Light, moyen: ImpactStyle.Medium, fort: ImpactStyle.Heavy }[style] || ImpactStyle.Light }));
    });
  }
  vibrer.enVol = () => enVol;   // les appels natifs pas encore rendus (le débit de l'haptique : ≥ 2 → un tic saute)
  vibrer.stats = () => ({ enVol, joues: compte.joues, sautes: compte.sautes, rtt: rtt.length ? rtt.reduce((a, b) => a + b, 0) / rtt.length : 0 });   // rtt : moyenne des 40 derniers (ms)
  if (natif) chargerH().catch(() => {});   // chargé dès maintenant : le premier vibrer() part déjà sans attendre
  const api = {
    v: 1, natif,
    async partager({ texte = '', url, titre } = {}) {
      texte = publierTexte(texte); url = url && publierTexte(url);   // (0.76) jamais un lien capacitor://localhost vers l'extérieur
      if (natif) { const { Share } = await import('@capacitor/share'); return Share.share({ title: titre, text: texte, url, dialogTitle: titre }); }
      if (W.navigator.share) return W.navigator.share({ title: titre, text: texte, url });
      throw new Error('partage indisponible');
    },
    vibrer,
    crans: {   // ⚙ une session de crans : debut() ouvre le cran natif (compté : deux debut() = deux fin()), tic() = un selectionChanged, fin()
      debut() { if (!natif) return Promise.resolve(); sessions++; ouvrirCrans(); armer(); return Promise.resolve(); },
      tic: () => (natif ? vibrer('selection') : Promise.resolve()),   // hors iPhone : les crans ne font rien
      fin() { if (!natif) return Promise.resolve(); if (sessions) sessions--; return sessions ? Promise.resolve() : fermerCrans(); },
      ouverte: () => ouverte,
    },
    async copier(texte) { texte = publierTexte(String(texte)); if (natif) { const { Clipboard } = await import('@capacitor/clipboard'); return Clipboard.write({ string: String(texte) }); } return W.navigator.clipboard.writeText(String(texte)); },
    async coller() { if (natif) { const { Clipboard } = await import('@capacitor/clipboard'); return (await Clipboard.read()).value || ''; } return W.navigator.clipboard.readText(); },
    async photo({ source = 'camera' } = {}) {
      if (!natif) throw new Error('photo : seulement sur l\'iPhone');
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const r = await Camera.getPhoto({ resultType: CameraResultType.DataUrl, source: source === 'galerie' ? CameraSource.Photos : CameraSource.Camera, quality: 85 });
      return r.dataUrl;
    },
    async position() {
      if (natif) { const { Geolocation } = await import('@capacitor/geolocation'); const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 }); return { lat: p.coords.latitude, lng: p.coords.longitude, precision: p.coords.accuracy }; }
      return new Promise((ok, ko) => W.navigator.geolocation.getCurrentPosition(p => ok({ lat: p.coords.latitude, lng: p.coords.longitude, precision: p.coords.accuracy }), ko, { enableHighAccuracy: true, timeout: 15000 }));
    },
    async notifier({ titre = 'ploxi0n', texte = '', dans = 0 } = {}) {
      if (!natif) throw new Error('notification : seulement sur l\'iPhone');
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const p = await LocalNotifications.requestPermissions(); if (p.display !== 'granted') throw new Error('notifications refusées');
      return LocalNotifications.schedule({ notifications: [{ id: Math.floor(Math.random() * 1e6) + 1000, title: titre, body: texte, schedule: dans ? { at: new Date(Date.now() + dans * 1000) } : undefined }] });
    },
    async ouvrirLien(url) { if (natif) { const { AppLauncher } = await import('@capacitor/app-launcher'); return AppLauncher.openUrl({ url }); } W.open(url, '_blank', 'noopener'); },
    async appareil() { const { Device } = await import('@capacitor/device'); const i = await Device.getInfo(); return { modele: i.model, systeme: i.operatingSystem, version: i.osVersion, nom: i.name || '' }; },
    async batterie() { const { Device } = await import('@capacitor/device'); const b = await Device.getBatteryInfo(); return { niveau: b.batteryLevel, enCharge: !!b.isCharging }; },
    async reseau() { const { Network } = await import('@capacitor/network'); const s = await Network.getStatus(); return { connecte: s.connected, type: s.connectionType }; },
    async parler(texte, { langue = 'fr-FR' } = {}) {
      if (natif) { const { TextToSpeech } = await import('@capacitor-community/text-to-speech'); return TextToSpeech.speak({ text: String(texte), lang: langue, rate: 1 }); }
      const u = new W.SpeechSynthesisUtterance(String(texte)); u.lang = langue; W.speechSynthesis.speak(u);
    },
    // 🍎 les services d'Apple (AppDelegate.swift, PloxiApple)
    async meteo(pos) { if (!natif) throw new Error('WeatherKit : sur l\'iPhone'); const p = pos || await api.position(); return PloxiApple.meteo({ lat: p.lat, lng: p.lng }); },
    async shazam() { if (!natif) throw new Error('Shazam : sur l\'iPhone'); return PloxiApple.shazam(); },
    musique: {
      chercher: (q) => PloxiApple.musiqueChercher({ q: String(q || '') }),
      jouer: (id) => PloxiApple.musiqueJouer({ id: String(id) }),
      pause: () => PloxiApple.musiquePause(),
    },
    maison: {   // 🏠 HomeKit
      liste: async () => (await PloxiApple.maisonListe()).accessoires || [],
      basculer: (id, allume) => PloxiApple.maisonBasculer(allume === undefined ? { id: String(id) } : { id: String(id), allume: !!allume }),
    },
    wifi: (ssid, mdp) => PloxiApple.wifiRejoindre({ ssid: String(ssid), mdp: mdp ? String(mdp) : '' }),   // 📶 rejoindre un Wi-Fi
    // 🎮 💭 (14.10) le classement « Xeroctions » (App Store Connect, ID 001 : temps écoulé au centième, croissant, meilleur score) = le temps pour
    // boucler une xeroction : jeu.score('001', centiemes) quand la session xeroction existera ; puis les activités et les défis (un lien profond)
    // (0.79) classements() : ceux de l'app dans App Store Connect ; ouvrir(id) : l'écran de Game Center sur ce classement
    jeu: { connecter: () => PloxiApple.gameCenter(), score: (classement, score) => PloxiApple.gameCenterScore({ classement: String(classement), score: Math.round(+score || 0) }),
      classements: () => PloxiApple.gameCenterClassements().then(r => (r && Array.isArray(r.classements) ? r.classements : [])), ouvrir: (classement) => PloxiApple.gameCenterOuvrir({ classement: classement ? String(classement) : '' }) },   // 🎮 Game Center
    // (0.47) le reste du natif, en une ligne chacun
    dictee: {   // 🎙 la dictée DANS l'app : commencer() puis arreter() → le texte (reconnaissance d'iOS, vocabulaire du xerboxion)
      commencer: () => PloxiVocal.commencer(),
      async arreter({ langue } = {}) { const r = await PloxiVocal.arreter(); return ((await PloxiVocal.transcrire({ chemin: r.chemin, langue: langue || W.navigator.language || 'fr-FR', vocabulaire: Object.keys(MOTS) })) || {}).texte || ''; },
    },
    nfc: {   // ◉ un tag NFC : lire() → [{ type, texte }] ; ecrire(texte | { url })
      lire: () => new Promise((ok, ko) => { if (!W.NDEFReader) return ko(new Error('NFC : sur l\'iPhone')); const l = new W.NDEFReader(); l.onreading = (e) => ok((e.message.records || []).map(r => ({ type: r.recordType, texte: r.data ? new TextDecoder(r.encoding || 'utf-8').decode(r.data) : '' }))); l.scan().catch(ko); }),
      ecrire: (x) => { if (!W.NDEFReader) throw new Error('NFC : sur l\'iPhone'); return new W.NDEFReader().write(x && x.url ? { records: [{ recordType: 'url', data: String(x.url) }] } : String(x)); },
    },
    async wifiInfo() { if (!natif) throw new Error('Wi-Fi : sur l\'iPhone'); const { CapacitorWifi } = await import('@capgo/capacitor-wifi'); const r = {}; try { r.ssid = (await CapacitorWifi.getSsid()).ssid; } catch (e) { r.ssid = null; } try { r.ip = (await CapacitorWifi.getIpAddress()).ipAddress; } catch (e) { r.ip = null; } return r; },
    async navigateur(url) { if (natif) { const { Browser } = await import('@capacitor/browser'); return Browser.open({ url: String(url), presentationStyle: 'popover' }); } W.open(url, '_blank', 'noopener'); },   // 🧭 Safari dans l'app
    ecranEveille: (actif = true) => natif ? PloxiApple.ecranEveille({ actif: !!actif }) : Promise.resolve(),   // ☀ l'écran ne s'éteint pas
    async orientation(type) { if (!natif) return; const { ScreenOrientation } = await import('@capacitor/screen-orientation'); return type ? ScreenOrientation.lock({ orientation: type }) : ScreenOrientation.unlock(); },   // ⟲ 'portrait' | 'landscape' | rien = libre
    capacites() { return natif ? ['partager', 'vibrer', 'copier', 'coller', 'photo', 'position', 'notifier', 'ouvrirLien', 'appareil', 'batterie', 'reseau', 'parler', 'meteo', 'shazam', 'musique', 'vocal', 'dictee', 'haptique', 'maison', 'wifi', 'wifiInfo', 'jeu', 'nfc', 'navigateur', 'ecranEveille', 'orientation', 'sante', 'mouvement', 'lecture', 'lecteur', 'envoyer', 'apercu', 'zip', 'dezipper', 'photos', 'choisirFichiers', 'carte', 'mail', 'lampe', 'crans'] : ['partager', 'vibrer', 'copier', 'position', 'parler'].filter(k => k !== 'partager' || W.navigator.share); },
  };
  W.jOSNatif = api;
  return api;
}
