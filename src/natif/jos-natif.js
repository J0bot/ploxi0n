// ⚡ jOSNatif — LE bion natif de ploxi0n (RS-7 12.10 : « un seul bion pour tout quand on peut, toujours la version la plus optimisée » ;
// « c'est ça le but d'une app native : pouvoir tout utiliser les choses natives pour plus de vitesse »).
// Un seul bion, toutes les capacités de l'iPhone, pour tous les ploxions : chaque fonction passe par le natif (plugins Capacitor) sur l'iPhone,
// et par le web ailleurs (le xer de xerboxion.org n'a pas jOSNatif : un ploxion teste « if (window.jOSNatif) »).
//   jOSNatif.natif                     vrai sur l'iPhone
//   partager({ texte, url, titre })    la feuille de partage d'iOS
//   vibrer('leger'|'moyen'|'fort'|'selection'|'succes'|'erreur')
//   copier(texte) · coller() → texte
//   photo({ source: 'camera'|'galerie' }) → dataURL (jpeg)
//   position() → { lat, lng, precision }
//   notifier({ titre, texte, dans: secondes })
//   ouvrirLien(url)                    Safari (hors de l'app)
//   appareil() → { modele, systeme, version, nom } · batterie() → { niveau, enCharge } · reseau() → { connecte, type }
//   parler(texte, { langue })          la synthèse vocale d'iOS
//   meteo() WeatherKit · shazam() ShazamKit · musique.chercher/jouer/pause MusicKit (Apple Music)
//   capacites() → la liste de ce qui est disponible ici
import { PloxiApple } from './plugins-app.js';

export function installerJosNatif(W = globalThis.window) {
  const natif = !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  const api = {
    v: 1, natif,
    async partager({ texte = '', url, titre } = {}) {
      if (natif) { const { Share } = await import('@capacitor/share'); return Share.share({ title: titre, text: texte, url, dialogTitle: titre }); }
      if (W.navigator.share) return W.navigator.share({ title: titre, text: texte, url });
      throw new Error('partage indisponible');
    },
    async vibrer(style = 'leger') {
      if (natif) {
        const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
        if (style === 'succes' || style === 'erreur') return Haptics.notification({ type: style === 'succes' ? NotificationType.Success : NotificationType.Error });
        if (style === 'selection') { await Haptics.selectionStart(); await Haptics.selectionChanged(); return Haptics.selectionEnd(); }   // un cran, comme une molette
        return Haptics.impact({ style: { leger: ImpactStyle.Light, moyen: ImpactStyle.Medium, fort: ImpactStyle.Heavy }[style] || ImpactStyle.Light });
      }
      if (W.navigator.vibrate) W.navigator.vibrate(style === 'fort' ? 40 : 15);
    },
    async copier(texte) { if (natif) { const { Clipboard } = await import('@capacitor/clipboard'); return Clipboard.write({ string: String(texte) }); } return W.navigator.clipboard.writeText(String(texte)); },
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
    jeu: { connecter: () => PloxiApple.gameCenter(), score: (classement, score) => PloxiApple.gameCenterScore({ classement: String(classement), score: Math.round(+score || 0) }) },   // 🎮 Game Center
    capacites() { return natif ? ['partager', 'vibrer', 'copier', 'coller', 'photo', 'position', 'notifier', 'ouvrirLien', 'appareil', 'batterie', 'reseau', 'parler', 'meteo', 'shazam', 'musique', 'vocal', 'haptique', 'maison', 'wifi', 'jeu'] : ['partager', 'vibrer', 'copier', 'position', 'parler'].filter(k => k !== 'partager' || W.navigator.share); },
  };
  W.jOSNatif = api;
  return api;
}
