// ⚡ LE WEB DEVIENT NATIF (0.47, RS-7 12.10 : « il faut que le plus de fonctionnalités soient natives, c'est le but de l'app ploxi0n »).
// Les ploxions du labo parlent le web standard (navigator.vibrate, geolocation, Notification, SpeechRecognition, BarcodeDetector,
// devicemotion, Web Bluetooth, Web NFC, wakeLock…). Dans la WebView d'iOS, la moitié n'existe pas (vibrate, Notification, la dictée,
// BarcodeDetector, Bluetooth, NFC) ou passe mal (la position demande « localhost » à chaque fois, le gyroscope exige un geste).
// Ici, sur l'iPhone, chacune de ces API est rebranchée sur le natif — tous les ploxions deviennent natifs SANS être réécrits.
//   navigator.vibrate          → Haptics (Taptic Engine), coupé avec l'haptique de l'app
//   navigator.share/canShare   → la feuille de partage d'iOS
//   navigator.clipboard        → le presse-papiers d'iOS (texte)
//   navigator.geolocation      → CoreLocation (Geolocation)
//   Notification               → notifications locales ; la toucher rouvre le ploxion qui l'a créée
//   navigator.getBattery       → Device
//   SpeechRecognition          → la reconnaissance vocale d'iOS (PloxiVocal : enregistrer puis transcrire, vocabulaire du xerboxion)
//   BarcodeDetector            → codes QR (jsQR, sur le téléphone)
//   devicemotion / orientation → CoreMotion (PloxiApple), sans permission à demander
//   screen.orientation.lock    → ScreenOrientation
//   navigator.wakeLock         → l'écran reste allumé (PloxiApple.ecranEveille)
//   navigator.bluetooth        → Bluetooth LE (requestDevice, GATT : lire, écrire, notifications)
//   NDEFReader                 → Core NFC (lire et écrire des tags : texte, lien)
//   window.open / liens _blank → Safari DANS l'app (SFSafariViewController) au lieu de quitter ploxi0n
// Chaque branchement est indépendant (un échec n'empêche pas les autres) ; ⚙ › Natif les montre et peut tout couper.
import { MOTS } from './vocabulaire.js';
import { PloxiApple, PloxiVocal } from './plugins-app.js';
import { publierTexte } from '../app/liens-publics.js';   // (0.76) un lien de l'app (capacitor://localhost…) qui sort devient celui du labo

export const BRANCHEMENTS = [
  ['vibrate', '📳', 'navigator.vibrate', 'le Taptic Engine'],
  ['share', '↗', 'navigator.share', 'la feuille de partage d\'iOS'],
  ['clipboard', '📋', 'navigator.clipboard', 'le presse-papiers d\'iOS'],
  ['geolocation', '📍', 'navigator.geolocation', 'CoreLocation'],
  ['notification', '🔔', 'Notification', 'les notifications d\'iOS'],
  ['battery', '🔋', 'navigator.getBattery', 'la batterie'],
  ['speech', '🎙', 'SpeechRecognition', 'la reconnaissance vocale d\'iOS'],
  ['barcode', '▣', 'BarcodeDetector', 'les codes QR'],
  ['motion', '🌀', 'devicemotion · deviceorientation', 'CoreMotion'],
  ['orientation', '⟲', 'screen.orientation.lock', 'la rotation d\'iOS'],
  ['wakelock', '☀', 'navigator.wakeLock', 'l\'écran reste allumé'],
  ['bluetooth', 'ᛒ', 'navigator.bluetooth', 'Bluetooth LE'],
  ['nfc', '◉', 'NDEFReader', 'Core NFC'],
  ['liens', '🧭', 'window.open · liens externes', 'Safari dans l\'app ; geo: et Google Maps → Plans'],
];

const definir = (o, k, v) => { try { Object.defineProperty(o, k, { value: v, configurable: true, writable: true }); return true; } catch (e) { try { o[k] = v; return o[k] === v; } catch (e2) { return false; } } };
const exception = (nom, message) => { try { return new DOMException(message, nom); } catch (e) { return Object.assign(new Error(message), { name: nom }); } };

/** un petit EventTarget avec les propriétés on<type> (onresult, onreading…) */
class Cible {
  constructor() { this._l = {}; }
  addEventListener(t, f) { if (typeof f === 'function' || (f && f.handleEvent)) (this._l[t] = this._l[t] || new Set()).add(f); }
  removeEventListener(t, f) { if (this._l[t]) this._l[t].delete(f); }
  dispatchEvent(ev) {
    const h = this['on' + ev.type]; if (typeof h === 'function') { try { h.call(this, ev); } catch (e) { console.error(e); } }
    for (const f of [...(this._l[ev.type] || [])]) { try { typeof f === 'function' ? f.call(this, ev) : f.handleEvent(ev); } catch (e) { console.error(e); } }
    return true;
  }
}
const evenement = (type, props = {}, cible = null) => { const e = { type, target: cible, currentTarget: cible, timeStamp: Date.now(), preventDefault() {}, stopPropagation() {} }; return Object.assign(e, props); };

// ---- NDEF (Web NFC) : décoder / encoder les enregistrements texte et lien ---------------------------------------------------------------
const PREFIXES_URI = ['', 'http://www.', 'https://www.', 'http://', 'https://', 'tel:', 'mailto:', 'ftp://anonymous:anonymous@', 'ftp://ftp.', 'ftps://', 'sftp://', 'smb://', 'nfs://', 'ftp://', 'dav://', 'news:', 'telnet://', 'imap:', 'rtsp://', 'urn:', 'pop:', 'sip:', 'sips:', 'tftp:', 'btspp://', 'btl2cap://', 'btgoep://', 'tcpobex://', 'irdaobex://', 'file://', 'urn:epc:id:', 'urn:epc:tag:', 'urn:epc:pat:', 'urn:epc:raw:', 'urn:epc:', 'urn:nfc:'];
const octets = (s) => Array.from(new TextEncoder().encode(String(s)));
export function decoderNdef(r) {
  const type = String.fromCharCode(...(r.type || [])), p = r.payload || [];
  const vue = (debut) => new DataView(new Uint8Array(p.slice(debut)).buffer);
  if (r.tnf === 1 && type === 'T' && p.length) {
    const nl = p[0] & 0x3f, utf16 = !!(p[0] & 0x80);
    return { recordType: 'text', lang: String.fromCharCode(...p.slice(1, 1 + nl)), encoding: utf16 ? 'utf-16' : 'utf-8', data: vue(1 + nl), mediaType: null, id: '' };
  }
  if (r.tnf === 1 && type === 'U' && p.length) {
    const url = (PREFIXES_URI[p[0]] || '') + new TextDecoder().decode(new Uint8Array(p.slice(1)));
    return { recordType: 'url', data: new DataView(new Uint8Array(octets(url)).buffer), encoding: null, lang: null, mediaType: null, id: '' };
  }
  if (r.tnf === 2) return { recordType: 'mime', mediaType: type, data: vue(0), encoding: null, lang: null, id: '' };
  if (r.tnf === 4) return { recordType: type, data: vue(0), mediaType: null, encoding: null, lang: null, id: '' };
  return { recordType: 'unknown', data: vue(0), mediaType: null, encoding: null, lang: null, id: '' };
}
export function encoderNdef(message) {
  const recs = typeof message === 'string' ? [{ recordType: 'text', data: message }] : (message && message.records) || [];
  return recs.map((x) => {
    const donnees = typeof x.data === 'string' ? x.data : x.data ? new TextDecoder().decode(x.data.buffer ? new Uint8Array(x.data.buffer, x.data.byteOffset || 0, x.data.byteLength) : new Uint8Array(x.data)) : '';
    if (x.recordType === 'url' || x.recordType === 'absolute-url') {
      let i = PREFIXES_URI.findIndex((pre, k) => k > 0 && donnees.startsWith(pre) && !PREFIXES_URI.some((q, j) => j > 0 && q.length > pre.length && donnees.startsWith(q)));
      if (i < 0) i = 0;
      return { tnf: 1, type: octets('U'), id: [], payload: [i, ...octets(donnees.slice(PREFIXES_URI[i].length))] };
    }
    if (x.recordType === 'mime') return { tnf: 2, type: octets(x.mediaType || 'application/octet-stream'), id: [], payload: octets(donnees) };
    const lang = String(x.lang || 'fr').slice(0, 63);
    return { tnf: 1, type: octets('T'), id: [], payload: [lang.length, ...octets(lang), ...octets(donnees)] };
  });
}

// ---- Bluetooth : les noms des services / caractéristiques les plus courants (Web Bluetooth les accepte par leur nom) ----------------------
const NOMS_BLE = { heart_rate: 0x180d, battery_service: 0x180f, device_information: 0x180a, generic_access: 0x1800, generic_attribute: 0x1801, environmental_sensing: 0x181a,
  cycling_speed_and_cadence: 0x1816, cycling_power: 0x1818, running_speed_and_cadence: 0x1814, health_thermometer: 0x1809, blood_pressure: 0x1810, weight_scale: 0x181d,
  heart_rate_measurement: 0x2a37, body_sensor_location: 0x2a38, heart_rate_control_point: 0x2a39, battery_level: 0x2a19, manufacturer_name_string: 0x2a29,
  model_number_string: 0x2a24, serial_number_string: 0x2a25, firmware_revision_string: 0x2a26, temperature: 0x2a6e, humidity: 0x2a6f, temperature_measurement: 0x2a1c, device_name: 0x2a00 };
export function uuidBle(x) {
  if (typeof x === 'string' && NOMS_BLE[x] !== undefined) x = NOMS_BLE[x];
  if (typeof x === 'number') return '0000' + x.toString(16).padStart(4, '0') + '-0000-1000-8000-00805f9b34fb';
  const s = String(x).toLowerCase();
  if (/^[0-9a-f]{4}$/.test(s)) return '0000' + s + '-0000-1000-8000-00805f9b34fb';
  if (/^[0-9a-f]{8}$/.test(s)) return s + '-0000-1000-8000-00805f9b34fb';
  return s;
}
const enVue = (v) => v instanceof DataView ? v : ArrayBuffer.isView(v) ? new DataView(v.buffer, v.byteOffset, v.byteLength) : new DataView(v);

/**
 * Installe les branchements. o : { W, prefs: () => ({ webNatif, haptique }), courant: () => id du ploxion au premier plan,
 *   ouvrirPloxion(id), mouvementActif: () => bool (le thème vivant tourne déjà), charger: { module: () => import(...) } (tests) }
 * Rend { faits: [cle], etat() } ; ne fait rien hors de l'iPhone (sauf BarcodeDetector, utile partout).
 */
export function installerWebNatif({ W = globalThis.window, prefs = () => ({}), courant = () => null, ouvrirPloxion = () => {}, mouvementActif = () => false, apple = PloxiApple, vocal = PloxiVocal, charger = {}, lienPublic = 'https://labo.j0bot.ch' } = {}) {
  const natif = !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  const nav = W.navigator, faits = [], erreurs = {};
  const imp = (nom, f) => (charger[nom] || f)();
  const m = {
    haptics: () => imp('haptics', () => import('@capacitor/haptics')), share: () => imp('share', () => import('@capacitor/share')),
    clipboard: () => imp('clipboard', () => import('@capacitor/clipboard')), geolocation: () => imp('geolocation', () => import('@capacitor/geolocation')),
    notifs: () => imp('notifs', () => import('@capacitor/local-notifications')), device: () => imp('device', () => import('@capacitor/device')),
    orientation: () => imp('orientation', () => import('@capacitor/screen-orientation')), browser: () => imp('browser', () => import('@capacitor/browser')),
    ble: () => imp('ble', () => import('@capacitor-community/bluetooth-le')), nfc: () => imp('nfc', () => import('@capgo/capacitor-nfc')),
    jsqr: () => imp('jsqr', () => import('jsqr')),
  };
  const brancher = (cle, f) => { try { if (f() !== false) faits.push(cle); } catch (e) { erreurs[cle] = String((e && e.message) || e); } };
  const coupe = () => prefs().webNatif === false;

  if (natif && !coupe()) {
    // 📳 vibrate : chaque pulsation du motif → un choc du Taptic Engine (court = léger, long = fort). (0.63) Par jOSNatif.vibrer : le module
    // déjà chargé, les appels en vol comptés, 60/s au plus (un ploxion qui mitraille vibrate ne noie plus les crans de l'app)
    brancher('vibrate', () => definir(nav, 'vibrate', (motif) => {
      if (prefs().haptique === false) return true;
      const l = Array.isArray(motif) ? motif : [motif]; let t = 0;
      l.forEach((d, i) => {
        d = Math.max(0, +d || 0);
        if (i % 2 === 0 && d > 0) W.setTimeout(() => {
          const j = W.jOSNatif;
          if (j && typeof j.vibrer === 'function') { Promise.resolve(j.vibrer(d >= 60 ? 'fort' : d >= 25 ? 'moyen' : 'leger')).catch(() => {}); return; }
          m.haptics().then(h => h.Haptics.impact({ style: d >= 60 ? 'HEAVY' : d >= 25 ? 'MEDIUM' : 'LIGHT' })).catch(() => {});   // sans jOSNatif (les tests, un démarrage partiel)
        }, t);
        t += d;
      });
      return true;
    }));
    // ↗ share : texte, titre, lien (les fichiers restent au partage du web)
    brancher('share', () => {
      const avant = nav.share && nav.share.bind(nav);
      definir(nav, 'share', async (d = {}) => {
        if (d.files && d.files.length) { if (W.jOSNatif && W.jOSNatif.envoyer) return W.jOSNatif.envoyer([...d.files], { titre: d.title, texte: d.text }); if (avant) return avant(d); }   // (0.49) les fichiers aussi
        // (0.51) un lien vers l'app elle-même (capacitor://localhost/local#stremio=…) n'ouvre rien chez l'autre : il devient celui du labo
        // (0.76) et /local?px=<id> → /px/<id> (le lien universel : il ouvre ploxi0n chez qui l'a), src/app/liens-publics.js
        const pub = (x) => (typeof x === 'string' && lienPublic ? publierTexte(x.split(W.location.origin + '/').join('capacitor://localhost/'), lienPublic.replace(/\/$/, '')) : x);
        await m.share().then(s => s.Share.share({ title: d.title, text: pub(d.text), url: pub(d.url), dialogTitle: d.title }));
      });
      definir(nav, 'canShare', () => true);
    });
    // 📋 clipboard : le texte par iOS (sans geste requis), le reste au web
    brancher('clipboard', () => {
      const avant = nav.clipboard || {};
      const presse = {
        writeText: (t) => m.clipboard().then(c => c.Clipboard.write({ string: publierTexte(String(t)) })).then(() => {}),
        readText: () => m.clipboard().then(c => c.Clipboard.read()).then(r => (r && r.value) || ''),
        write: (items) => avant.write ? avant.write.call(avant, items) : Promise.reject(exception('NotAllowedError', 'presse-papiers : texte seulement')),
        read: () => avant.read ? avant.read.call(avant) : Promise.reject(exception('NotAllowedError', 'presse-papiers : texte seulement')),
      };
      definir(nav, 'clipboard', presse);
    });
    // 📍 geolocation : CoreLocation, l'API du web à l'identique
    brancher('geolocation', () => {
      const pos = (p) => ({ coords: { latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: p.coords.accuracy, altitude: p.coords.altitude ?? null,
        altitudeAccuracy: p.coords.altitudeAccuracy ?? null, heading: p.coords.heading ?? null, speed: p.coords.speed ?? null }, timestamp: p.timestamp || Date.now() });
      const err = (e) => { const s = String((e && e.message) || e); const code = /denied|refus|permission/i.test(s) ? 1 : /timeout|délai/i.test(s) ? 3 : 2; return { code, message: s, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 }; };
      const opts = (o = {}) => ({ enableHighAccuracy: !!o.enableHighAccuracy, timeout: o.timeout ?? 15000, maximumAge: o.maximumAge ?? 0 });
      const suivis = new Map(); let n = 0;
      definir(nav, 'geolocation', {
        getCurrentPosition(ok, ko, o) { m.geolocation().then(g => g.Geolocation.getCurrentPosition(opts(o))).then(p => ok && ok(pos(p)), e => ko && ko(err(e))); },
        watchPosition(ok, ko, o) {
          const id = ++n;
          suivis.set(id, m.geolocation().then(g => g.Geolocation.watchPosition(opts(o), (p, e) => { if (!suivis.has(id)) return; if (e) { if (ko) ko(err(e)); } else if (p && p.coords && ok) ok(pos(p)); })).then(cid => String(cid)).catch(e => { if (ko) ko(err(e)); return null; }));
          return id;
        },
        clearWatch(id) { const c = suivis.get(id); suivis.delete(id); if (c) c.then(cid => cid && m.geolocation().then(g => g.Geolocation.clearWatch({ id: cid }))).catch(() => {}); },
      });
    });
    // 🔔 Notification : une notification locale d'iOS ; la toucher ramène au ploxion qui l'a créée
    brancher('notification', () => {
      const vivantes = new Map(); let n = 0, ecoute = false;
      const ecouter = () => {
        if (ecoute) return; ecoute = true;
        m.notifs().then(L => L.LocalNotifications.addListener('localNotificationActionPerformed', (e) => {
          const x = e && e.notification && e.notification.extra; if (!x || !x.webNatif) return;
          if (x.ploxion) ouvrirPloxion(x.ploxion);
          const v = vivantes.get(x.webNatif); if (v) v.dispatchEvent(evenement('click', {}, v));
        })).catch(() => {});
      };
      class NotificationNatif extends Cible {
        constructor(titre, o = {}) {
          super(); this.title = String(titre); this.body = o.body || ''; this.tag = o.tag || ''; this.data = o.data ?? null; this.icon = o.icon || '';
          const id = 800000 + (++n % 100000); this._id = id; vivantes.set(id, this); ecouter();
          m.notifs().then(L => L.LocalNotifications.schedule({ notifications: [{ id, title: this.title, body: String(this.body).slice(0, 400), extra: { webNatif: id, ploxion: courant() || null } }] }))
            .then(() => this.dispatchEvent(evenement('show', {}, this)), (e) => this.dispatchEvent(evenement('error', { message: String((e && e.message) || e) }, this)));
        }
        close() { vivantes.delete(this._id); m.notifs().then(L => L.LocalNotifications.cancel({ notifications: [{ id: this._id }] })).catch(() => {}); this.dispatchEvent(evenement('close', {}, this)); }
        static async requestPermission(cb) {
          let p = 'denied'; try { const r = await m.notifs().then(L => L.LocalNotifications.requestPermissions()); p = r.display === 'granted' ? 'granted' : r.display === 'denied' ? 'denied' : 'default'; } catch (e) { /* */ }
          NotificationNatif.permission = p; if (typeof cb === 'function') cb(p); return p;
        }
      }
      NotificationNatif.permission = 'default';
      NotificationNatif.maxActions = 0;
      m.notifs().then(L => L.LocalNotifications.checkPermissions()).then(r => { NotificationNatif.permission = r.display === 'granted' ? 'granted' : r.display === 'denied' ? 'denied' : 'default'; }).catch(() => {});
      definir(W, 'Notification', NotificationNatif);
    });
    // 🔋 getBattery
    brancher('battery', () => definir(nav, 'getBattery', async () => {
      const b = new Cible(); const lire = async () => { const i = await m.device().then(d => d.Device.getBatteryInfo()); b.level = i.batteryLevel ?? 1; b.charging = !!i.isCharging; };
      b.chargingTime = Infinity; b.dischargingTime = Infinity; await lire(); return b;
    }));
    // 🎙 SpeechRecognition : enregistrer (PloxiVocal) puis transcrire (iOS, sur le téléphone quand il le peut)
    brancher('speech', () => {
      class Dictee extends Cible {
        constructor() { super(); this.lang = ''; this.continuous = false; this.interimResults = false; this.maxAlternatives = 1; this._actif = false; this._minuteur = null; }
        start() {
          if (this._actif) throw exception('InvalidStateError', 'la dictée écoute déjà');
          this._actif = true;
          vocal.commencer().then(() => {
            this.dispatchEvent(evenement('start', {}, this)); this.dispatchEvent(evenement('audiostart', {}, this));
            // le web s'arrête seul au silence ; ici : 7 s (une phrase), 60 s en continu — ou stop()
            this._minuteur = W.setTimeout(() => this.stop(), this.continuous ? 60000 : 7000);
          }, (e) => { this._actif = false; this._erreur(/refus|denied/i.test(String(e && e.message)) ? 'not-allowed' : 'audio-capture', e); });
        }
        stop() {
          if (!this._actif) return; this._actif = false; W.clearTimeout(this._minuteur);
          vocal.arreter().then((r) => { this.dispatchEvent(evenement('audioend', {}, this)); return vocal.transcrire({ chemin: r.chemin, langue: this.lang || (nav.language || 'fr-FR'), vocabulaire: Object.keys(MOTS) }); })
            .then((t) => {
              const texte = (t && t.texte) || '';
              if (texte) { const alt = { transcript: texte, confidence: 0.9 }, res = Object.assign([alt], { isFinal: true, length: 1, item: (i) => [alt][i] }); const liste = Object.assign([res], { item: (i) => [res][i] }); this.dispatchEvent(evenement('result', { resultIndex: 0, results: liste }, this)); }
              else this.dispatchEvent(evenement('nomatch', {}, this));
              this.dispatchEvent(evenement('end', {}, this));
            }, (e) => this._erreur('network', e));
        }
        abort() { if (!this._actif) return; this._actif = false; W.clearTimeout(this._minuteur); vocal.arreter().catch(() => {}); this.dispatchEvent(evenement('end', {}, this)); }
        _erreur(code, e) { this.dispatchEvent(evenement('error', { error: code, message: String((e && e.message) || e) }, this)); this.dispatchEvent(evenement('end', {}, this)); }
      }
      definir(W, 'SpeechRecognition', Dictee); definir(W, 'webkitSpeechRecognition', Dictee);
    });
    // 🌀 devicemotion / deviceorientation : CoreMotion, sans la permission que le web exige sur un geste
    brancher('motion', () => {
      const types = new Set(['devicemotion', 'deviceorientation']), compte = { devicemotion: 0, deviceorientation: 0 };
      let ecoute = null, demarre = false, dernier = 0;
      const total = () => compte.devicemotion + compte.deviceorientation + (W.ondevicemotion ? 1 : 0) + (W.ondeviceorientation ? 1 : 0);
      const deg = 180 / Math.PI, G = 9.80665;
      const recevoir = (s) => {
        const t = Date.now(), intervalle = dernier ? (t - dernier) : 33; dernier = t;
        const mo = { acceleration: { x: (+s.ax || 0) * G, y: (+s.ay || 0) * G, z: (+s.az || 0) * G },
          accelerationIncludingGravity: { x: ((+s.gx || 0) + (+s.ax || 0)) * G, y: ((+s.gy || 0) + (+s.ay || 0)) * G, z: ((+s.gz || 0) + (+s.az || 0)) * G },
          rotationRate: { alpha: (+s.rz || 0) * deg, beta: (+s.rx || 0) * deg, gamma: (+s.ry || 0) * deg }, interval: intervalle };
        const or = { alpha: (((+s.yaw || 0) * deg) + 360) % 360, beta: (+s.pitch || 0) * deg, gamma: (+s.roll || 0) * deg, absolute: false };
        // (0.71, le terrax) la boussole de CoreMotion (le repère du nord magnétique), comme celle de WebKit : webkitCompassHeading
        if (s.cap != null && +s.cap >= 0) { or.webkitCompassHeading = +s.cap; or.webkitCompassAccuracy = 10; }
        if (compte.devicemotion || W.ondevicemotion) envoyer('devicemotion', mo);
        if (compte.deviceorientation || W.ondeviceorientation) envoyer('deviceorientation', or);
      };
      const envoyer = (type, props) => {
        let e; try { e = new W.Event(type); } catch (er) { return; }
        for (const [k, v] of Object.entries(props)) { try { Object.defineProperty(e, k, { value: v, enumerable: true }); } catch (er) { /* */ } }
        W.dispatchEvent(e);
      };
      const suivre = async () => {
        W.__pxMouvementWeb = total();
        if (total() > 0 && !demarre) {
          demarre = true;
          try { ecoute = await apple.addListener('mouvement', recevoir); await apple.mouvementDebut({ hz: 30 }); } catch (e) { demarre = false; erreurs.motion = String((e && e.message) || e); }
        } else if (total() === 0 && demarre) {
          demarre = false;
          try { if (ecoute) await ecoute.remove(); ecoute = null; if (!mouvementActif()) await apple.mouvementFin(); } catch (e) { /* */ }
        }
      };
      const ajouter = W.addEventListener.bind(W), retirer = W.removeEventListener.bind(W);
      const vus = new Map();   // (type, fonction) déjà comptés : addEventListener deux fois la même fonction n'en ajoute qu'une
      definir(W, 'addEventListener', function (type, f, o) {
        if (types.has(type) && f) { const k = vus.get(f) || new Set(); if (!k.has(type)) { k.add(type); vus.set(f, k); compte[type]++; suivre(); } }
        return ajouter(type, f, o);
      });
      definir(W, 'removeEventListener', function (type, f, o) {
        if (types.has(type) && f) { const k = vus.get(f); if (k && k.delete(type)) { compte[type]--; suivre(); } }
        return retirer(type, f, o);
      });
      for (const t of types) {
        let h = null;
        try { Object.defineProperty(W, 'on' + t, { configurable: true, get: () => h, set: (f) => { if (h) retirer(t, h); h = typeof f === 'function' ? f : null; if (h) ajouter(t, h); suivre(); } }); } catch (e) { /* */ }
      }
      // la permission du web n'est plus nécessaire ; si CoreMotion a échoué, la vraie demande (le repli du web) reste possible
      for (const C of ['DeviceMotionEvent', 'DeviceOrientationEvent']) {
        const reelle = W[C] && W[C].requestPermission && W[C].requestPermission.bind(W[C]);
        const demande = async () => (erreurs.motion && reelle ? reelle() : 'granted');
        if (W[C]) definir(W[C], 'requestPermission', demande); else definir(W, C, Object.assign(function () {}, { requestPermission: demande }));
      }
    });
    // ⟲ screen.orientation.lock / unlock
    brancher('orientation', () => {
      const so = W.screen && W.screen.orientation; if (!so) return false;
      definir(so, 'lock', (type) => m.orientation().then(o => o.ScreenOrientation.lock({ orientation: String(type || 'any') })).then(() => {}));
      definir(so, 'unlock', () => { m.orientation().then(o => o.ScreenOrientation.unlock()).catch(() => {}); });
    });
    // ☀ wakeLock : l'écran ne se met plus en veille tant qu'un ploxion le demande
    brancher('wakelock', () => {
      const tenus = new Set();
      const regler = () => apple.ecranEveille({ actif: tenus.size > 0 }).catch(() => {});
      definir(nav, 'wakeLock', {
        async request(type = 'screen') {
          if (type !== 'screen') throw exception('NotSupportedError', 'wakeLock : « screen » seulement');
          const s = new Cible(); s.type = 'screen'; s.released = false;
          s.release = async () => { if (s.released) return; s.released = true; tenus.delete(s); await regler(); s.dispatchEvent(evenement('release', {}, s)); };
          tenus.add(s); await regler(); return s;
        },
      });
      W.document.addEventListener('visibilitychange', () => { if (W.document.visibilityState === 'hidden') tenus.clear(); });
    });
    // ᛒ Web Bluetooth (le sous-ensemble que les ploxions utilisent) → Bluetooth LE natif
    brancher('bluetooth', () => {
      let pret = null;
      const ble = () => (pret = pret || m.ble().then(async (b) => { await b.BleClient.initialize({ androidNeverForLocation: true }); return b.BleClient; }));
      const caracteristique = (dev, service, uuid) => {
        const c = new Cible(); c.uuid = uuid; c.service = service; c.value = null; c.properties = {};
        const recu = (v) => { c.value = v; c.dispatchEvent(evenement('characteristicvaluechanged', {}, c)); };
        c.readValue = async () => { const v = await (await ble()).read(dev.id, service.uuid, uuid); c.value = v; return v; };
        c.writeValue = c.writeValueWithResponse = async (v) => { await (await ble()).write(dev.id, service.uuid, uuid, enVue(v)); };
        c.writeValueWithoutResponse = async (v) => { await (await ble()).writeWithoutResponse(dev.id, service.uuid, uuid, enVue(v)); };
        c.startNotifications = async () => { await (await ble()).startNotifications(dev.id, service.uuid, uuid, recu); return c; };
        c.stopNotifications = async () => { await (await ble()).stopNotifications(dev.id, service.uuid, uuid); return c; };
        return c;
      };
      const appareil = (d) => {
        const dev = new Cible(); dev.id = d.deviceId; dev.name = d.name || '';
        const gatt = { device: dev, connected: false,
          async connect() { await (await ble()).connect(dev.id, () => { gatt.connected = false; dev.dispatchEvent(evenement('gattserverdisconnected', {}, dev)); }); gatt.connected = true; return gatt; },
          disconnect() { gatt.connected = false; ble().then(b => b.disconnect(dev.id)).catch(() => {}); },
          async getPrimaryService(s) {
            const uuid = uuidBle(s), srv = { uuid, device: dev, isPrimary: true };
            srv.getCharacteristic = async (c) => caracteristique(dev, srv, uuidBle(c));
            srv.getCharacteristics = async () => { const l = await (await ble()).getServices(dev.id); const x = (l || []).find(v => v.uuid === uuid); return x ? x.characteristics.map(c => caracteristique(dev, srv, c.uuid)) : []; };
            return srv;
          },
          async getPrimaryServices() { const l = await (await ble()).getServices(dev.id); return Promise.all((l || []).map(v => gatt.getPrimaryService(v.uuid))); },
        };
        dev.gatt = gatt; return dev;
      };
      definir(nav, 'bluetooth', {
        async getAvailability() { try { await ble(); return true; } catch (e) { return false; } },
        async requestDevice(o = {}) {
          const f = (o.filters || [])[0] || {};
          const services = (f.services || []).map(uuidBle), optionalServices = [...(o.optionalServices || []), ...(o.filters || []).slice(1).flatMap(x => x.services || [])].map(uuidBle);
          const d = await (await ble()).requestDevice({ services: o.acceptAllDevices ? [] : services, name: f.name, namePrefix: f.namePrefix, optionalServices });
          return appareil(d);
        },
      });
    });
    // ◉ Web NFC : NDEFReader (scan, write) → Core NFC
    brancher('nfc', () => {
      class LecteurNfc extends Cible {
        async scan(o = {}) {
          const { CapacitorNfc } = await m.nfc();
          this._h = await CapacitorNfc.addListener('nfcEvent', (e) => {
            const tag = (e && e.tag) || {};
            const serialNumber = (tag.id || []).map(b => (b & 255).toString(16).padStart(2, '0')).join(':');
            this.dispatchEvent(evenement('reading', { serialNumber, message: { records: (tag.ndefMessage || []).map(decoderNdef) } }, this));
          });
          if (o.signal) o.signal.addEventListener('abort', () => { CapacitorNfc.stopScanning().catch(() => {}); if (this._h) this._h.remove(); });
          await CapacitorNfc.startScanning({ invalidateAfterFirstRead: false, alertMessage: 'Approche un tag NFC du haut de l\'iPhone' });
        }
        async write(message) {
          // Core NFC écrit sur le tag DÉCOUVERT : on ouvre la session, on attend le tag, puis on écrit
          const { CapacitorNfc } = await m.nfc(); let h = null;
          const tag = new Promise((ok) => { CapacitorNfc.addListener('nfcEvent', () => ok()).then(x => { h = x; }); });
          await CapacitorNfc.startScanning({ invalidateAfterFirstRead: false, alertMessage: 'Approche le tag à écrire' });
          try { await tag; await CapacitorNfc.write({ records: encoderNdef(message), allowFormat: true }); }
          finally { if (h) h.remove(); CapacitorNfc.stopScanning().catch(() => {}); }
        }
        async makeReadOnly() { const { CapacitorNfc } = await m.nfc(); await CapacitorNfc.makeReadOnly(); }
      }
      definir(W, 'NDEFReader', LecteurNfc);
    });
    // 🧭 window.open et les liens _blank vers un autre site : Safari DANS l'app (on reste dans ploxi0n)
    brancher('liens', () => {
      // (0.49) les cartes : geo:, Google Maps → Plans d'Apple
      const plans = (u) => { const s = String(u || ''); let m = /^geo:([-\d.]+),([-\d.]+)/i.exec(s); if (m) return 'maps://?ll=' + m[1] + ',' + m[2];
        if (/^https?:\/\/(www\.)?(maps\.google\.[a-z.]+|google\.[a-z.]+\/maps)/i.test(s)) { try { const x = new URL(s); const qq = x.searchParams.get('q') || x.searchParams.get('query') || x.searchParams.get('daddr'); m = /@([-\d.]+),([-\d.]+)/.exec(x.pathname); return 'maps://?' + (m ? 'll=' + m[1] + ',' + m[2] : '') + (qq ? (m ? '&' : '') + 'q=' + encodeURIComponent(qq) : ''); } catch (e) { return null; } } return null; };
      const versPlans = (u) => { const p = plans(u); if (!p) return false; import('@capacitor/app-launcher').then(m => m.AppLauncher.openUrl({ url: p })).catch(() => {}); return true; };
      const externe = (u) => { try { const x = new URL(u, W.location.href); return /^https?:$/.test(x.protocol) && x.origin !== W.location.origin ? x.href : null; } catch (e) { return null; } };
      const ouvrir = (href) => m.browser().then(b => b.Browser.open({ url: href, presentationStyle: 'popover' })).catch(() => {});
      const avant = W.open && W.open.bind(W);
      // (0.51) une route de connexion du SERVEUR (window.open('/auth/spotify') : « Connecter Spotify ») mène à capacitor://localhost/auth/…,
      // nulle part : elle part vers le labo, dans Safari (la session du labo y est ; le jeton revient ensuite par le relais)
      const serveur = (u) => (lienPublic && /^\/(?!\/)/.test(u) && /^\/(auth|oauth|login|connect)\b|^\/[a-z0-9-]+\/(auth|oauth|login|connect)\b/i.test(u) ? lienPublic.replace(/\/$/, '') + u : null);
      definir(W, 'open', (u, cible, f) => { if (u && versPlans(u)) return null; const href = u && (externe(String(u)) || serveur(String(u))); if (href && cible !== '_self') { ouvrir(href); return null; } return avant ? avant(u, cible, f) : null; });
      W.document.addEventListener('click', (e) => {
        const a = e.target && e.target.closest && e.target.closest('a[href]'); if (!a || e.defaultPrevented) return;
        if (versPlans(a.getAttribute('href'))) { e.preventDefault(); return; }
        const href = externe(a.getAttribute('href')); if (!href || (a.target !== '_blank' && !a.hasAttribute('download') && a.target !== '_new')) return;
        e.preventDefault(); ouvrir(href);
      });
    });
  }
  // ▣ BarcodeDetector (QR) : partout où il manque (la WebView d'iOS ne l'a pas)
  if (!W.BarcodeDetector && !coupe()) brancher('barcode', () => {
    class DetecteurQr {
      constructor(o = {}) { this.formats = o.formats || ['qr_code']; }
      static async getSupportedFormats() { return ['qr_code']; }
      async detect(source) {
        const jsQR = (await m.jsqr()).default;
        let w = source.naturalWidth || source.videoWidth || source.width, h = source.naturalHeight || source.videoHeight || source.height, data;
        if (source.data && source.width) data = source.data;   // ImageData
        else {
          const c = W.document.createElement('canvas'), k = Math.min(1, 1024 / Math.max(w, h)); w = Math.round(w * k); h = Math.round(h * k); c.width = w; c.height = h;
          const x = c.getContext('2d'); x.drawImage(source, 0, 0, w, h); data = x.getImageData(0, 0, w, h).data;
        }
        const r = jsQR(data, w, h); if (!r) return [];
        const L = r.location, pts = [L.topLeftCorner, L.topRightCorner, L.bottomRightCorner, L.bottomLeftCorner];
        const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
        return [{ rawValue: r.data, format: 'qr_code', cornerPoints: pts, boundingBox: { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) } }];
      }
    }
    definir(W, 'BarcodeDetector', DetecteurQr);
  });
  const etat = () => ({ natif, coupe: coupe(), faits: [...faits], erreurs: { ...erreurs } });
  W.ploxi0nWebNatif = { etat, BRANCHEMENTS };
  return { faits, etat };
}
