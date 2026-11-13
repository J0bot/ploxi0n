// LE FAUX IPHONE (0.47) : Chromium à la taille d'un iPhone + le VRAI native-bridge.js de Capacitor + les en-têtes des plugins iOS RÉELS
// (extraits du Swift par extraire-plugins.cjs : un plugin ou une méthode absents du Swift répondent « not implemented on ios », comme sur
// le téléphone) + un « natif » simulé en Node (Preferences, SQLite réel via node:sqlite, CoreMotion, Santé…). L'app y prend le chemin
// iPhone (isNativePlatform) : ce que le navigateur et jsdom ne voient jamais (le piège du proxy, 0.47) apparaît ici.
// Usage : npm run build && npx vite preview --port 4173 &
//         node tools/faux-iphone/faux-iphone.mjs http://localhost:4173/ <dossier-sortie> [--sans-plugions] [--sans-ploxi] [--android] [--web] [--script parcours-app.mjs]
// Sortie : <dossier>/resume.json (appels natifs, erreurs, journal) + des captures PNG.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { execFileSync } from 'node:child_process';
import { creerMaille } from '../../src/bions/maille.js';   // (0.99.22) RS-3 et RS-4 : de vrais maillages, avec de vraies clés
import { decouper, creerRecolleur } from '../../src/bions/fragments.js';   // (0.99.48) le faux Android : les morceaux BLE de PloxiBLE.java
const require = createRequire(import.meta.url);
const { chromium } = (() => { for (const p of ['playwright', '/opt/node-tools/node_modules/playwright']) { try { return require(p); } catch (e) { /* suivant */ } } throw new Error('Playwright introuvable : npm i -g playwright'); })();

const [url, sortie, ...opts] = process.argv.slice(2);
mkdirSync(sortie, { recursive: true });
const ICI = path.dirname(new URL(import.meta.url).pathname);
const RACINE = path.resolve(ICI, '../..');
execFileSync(process.execPath, [path.join(ICI, 'extraire-plugins.cjs'), path.join(sortie, 'plugins-ios.json')], { cwd: RACINE });   // toujours le Swift du moment
let plugins = JSON.parse(readFileSync(path.join(sortie, 'plugins-ios.json'), 'utf8'));
if (opts.includes('--sans-plugions')) { delete plugins.PloxiApple; delete plugins.PloxiVocal; }
// (0.99.31) --sans-ploxi : AUCUN plugin Swift de l'app (PloxiApple, PloxiProche, PloxiLecteur…) : ce que verrait l'app sur Android (seuls les
// plugins Capacitor y existent) ; pour savoir si l'app tient debout sans eux
if (opts.includes('--sans-ploxi')) for (const k of Object.keys(plugins)) if (/^Ploxi/.test(k)) delete plugins[k];
// (0.99.32) --android : le faux ANDROID. Aucun plugin Swift, mais PloxiAccueil (le Java de l'écran d'accueil) ; Capacitor.getPlatform() → 'android'.
// Le pont reste celui d'iOS (le contrat JS des plugins est le même) : ce qu'on vérifie, c'est le JS de l'app quand elle se croit sur Android.
const android = opts.includes('--android');
if (android) { for (const k of Object.keys(plugins)) if (/^Ploxi/.test(k)) delete plugins[k];
  plugins.PloxiAccueil = ['estAccueil', 'choisir', 'applis', 'lancer', 'reglages'].map(name => ({ name, rtype: 'promise' }));
  // (0.99.48) PloxiBLE.java (0.99.41) : le maillage d'Android, déclaré comme le Java le déclare (demarrer, arreter, envoyer ; « pair », « message »)
  plugins.PloxiBLE = ['demarrer', 'arreter', 'envoyer'].map(name => ({ name, rtype: 'promise' })); }
const web = opts.includes('--web');
const iScript = opts.indexOf('--script'); const scriptEtapes = iScript >= 0 ? opts[iScript + 1] : null;
const bridge = readFileSync(path.join(RACINE, 'node_modules/@capacitor/ios/Capacitor/Capacitor/assets/native-bridge.js'), 'utf8');

// ---- l'état du faux natif ----
const prefs = new Map([['ploxi0n.lancement', 'en-cours'], ['ploxi0n.plantages', '0'], ['ploxi0n.espace-libre', '12000000000'], ['ploxi0n.mode-sur', '0']]);
const bases = new Map();
const appels = [];            // chaque appel natif
const nonSimules = new Map(); // plugin.methode → n
const auditeurs = []; let presse = ''; const eveil = []; const ouvertsBrowser = [], verrous = [];         // { plugin, evenement, callbackId }
let page = null, mouvementMinuteur = null;
const DONNEES = path.join(RACINE, 'tests/donnees');
const SOUS = ['social', 'chat', 'carte', 'amis', 'profil', 'idee', 'atelier'];
const sousBundle = (id) => `window.jOSApps=window.jOSApps||{};window.jOSApps[${JSON.stringify(id)}]={manifest:{id:${JSON.stringify(id)},name:${JSON.stringify(id)}},mount(h){h.innerHTML='<div style="padding:16px;color:#cfe">◇ le ploxion <b>${id}</b>, installé à la demande</div>';return{unmount(){h.innerHTML=''}}}};`;
function laboFaux(url) {
  const r = (status, data, type = 'text/html') => ({ status, data, headers: { 'Content-Type': type }, url });
  const u = new URL(url);
  // (0.99.9) OpenStreetMap (Overpass) autour de la position simulée (46.52, 6.63) : de quoi remplir « Autour »
    if (u.hostname === 'overpass-api.de') { const L = (dl, dg, tags, id, way) => (way ? { type: 'way', id, center: { lat: 46.52 + dl, lon: 6.63 + dg }, tags } : { type: 'node', id, lat: 46.52 + dl, lon: 6.63 + dg, tags });
      return r(200, JSON.stringify({ elements: [L(0.0006, 0.0004, { amenity: 'toilets', fee: 'no', name: 'WC de la place' }, 1), L(-0.001, 0.0012, { amenity: 'drinking_water' }, 2), L(0.0011, -0.0008, { amenity: 'cafe', name: 'Café du Grütli', opening_hours: '07:00-19:00' }, 3),
        L(-0.0015, -0.0005, { amenity: 'bar', name: 'Le Bourg' }, 4), L(0.002, 0.002, { tourism: 'artwork', name: 'La fontaine de la Justice' }, 5), L(0.003, -0.002, { leisure: 'park', name: 'Parc de Mon-Repos' }, 6, true),
        L(-0.0007, 0.0021, { amenity: 'restaurant', name: 'Pinte Besson' }, 7), L(0.0025, 0.001, { tourism: 'viewpoint', name: 'Esplanade de la cathédrale' }, 8), L(-0.0022, 0.0016, { amenity: 'bicycle_rental', name: 'PubliBike' }, 9)] }), 'application/json'); }
  // (0.99.15) sharedmobility.ch (identify, à la geo.admin) : deux trottinettes et un vélo libres, une voiture et une trottinette prise (laissées)
  if (u.hostname === 'api.sharedmobility.ch') { const V = (id, dl, dg, attributes) => ({ featureId: id, id, layerBodId: 'ch.bfe.sharedmobility', geometry: { x: 6.63 + dg, y: 46.52 + dl }, attributes });
    return r(200, JSON.stringify({ results: [V('tier:1', 0.0004, -0.0003, { provider_id: 'tier', vehicle_type: ['E-Scooter'], available: true, pickup_type: 'free_floating' }),
      V('voi:2', -0.0012, 0.0009, { provider_id: 'voi', vehicle_type: ['E-Scooter'], available: true }), V('publibike:3', 0.0009, 0.0011, { provider_id: 'publibike', vehicle_type: ['E-Bike'], available: true, station_name: 'Riponne' }),
      V('mobility:4', 0.0002, 0.0001, { provider_id: 'mobility', vehicle_type: ['Car'], available: true }), V('tier:5', 0.0001, 0.0001, { provider_id: 'tier', vehicle_type: ['E-Scooter'], available: false })] }), 'application/json'); }
  if (u.hostname !== 'labo.j0bot.ch') throw new Error('Could not connect to the server.');
  if (u.pathname === '/px/changelog.json') return r(200, JSON.stringify({ head: 'faux', par_ploxion: {} }), 'application/json');   // (0.99.6) rien n'a changé
  // (0.82) l'atelier des glyphes du labo : un glyphe dessiné, posé sur l'icône de « social » pour tous
  if (u.pathname === '/px/icones.json') return r(200, JSON.stringify({ ok: true, tous: { social: { glyphe: 'dessine-rs7', pal: 2 } }, mien: {}, glyphes: [{ nom: 'dessine-rs7', corps: '<polygon points="50,8 92,92 8,92"/><circle cx="50" cy="64" r="11" class="f"/><script>alert(1)</script>' }], avis: {}, admin: false }), 'application/json');
  if (u.pathname === '/px/xerkions.json') return r(200, readFileSync(path.join(DONNEES, 'xerkions.labo.json'), 'utf8'), 'application/json');   // (0.90) la map : les hubs du labo
  if (u.pathname === '/px/registry.json') return r(200, JSON.stringify(['ultimate-social', ...SOUS].map(id => ({ id, name: id, hasScreen: true, enabled: true, status: 'live', cat_label: 'Social' }))), 'application/json');
  const m = /^\/px\/([^/]+)\/app\.js$/.exec(u.pathname);
  // 🎧 (0.99.34) le ploxion spotify du labo : pas d'app.js, son code est dans sa page (tests/donnees/spotify.labo.html)
  if (m && m[1] === 'spotify') return r(404, '<!doctype html>404');
  if (/^\/px\/spotify\/?$/.test(u.pathname)) return r(200, readFileSync(path.join(DONNEES, 'spotify.labo.html'), 'utf8'));
  if (m && m[1] === 'ultimate-social') return r(200, readFileSync(path.join(DONNEES, 'ultimate-social.labo.js'), 'utf8'), 'application/javascript');
  if (m && SOUS.includes(m[1])) return r(200, sousBundle(m[1]), 'application/javascript');
  if (m) return r(304, '');
  if (/^\/wiki\/xerboxion\b/.test(u.pathname)) return r(200, readFileSync(path.join(DONNEES, 'wiki-xerboxion.labo.html'), 'utf8'));
  if (/^\/wiki/.test(u.pathname)) return r(404, '<!doctype html>404');
  return r(404, '<!doctype html>404');
}
const boxionFaux = new Map();
const activitesFaux = [];   // (0.91) les Live Activities lancées
const procheEnvoyes = [], droneFaux = [], tailles = [];   /* (0.99.19) les zooms de page demandés */   // (0.99.12) les commandes reçues par le drone simulé   // (0.99.1) ce que Proche a envoyé aux voisins
const trousseauFaux = {};   // (0.99.33) le trousseau d'iOS simulé
// ▸ (0.99.33) le labo de xb : l'enrôlement par code (approuvé au 2e sondage), le battement, les sorties ; demander(cmd, args) = le terminal xb du labo
const xbFaux = { battements: 0, sorties: [], file: [], enrole: null, sondages: 0, jeton: 'xj_' + '5e'.repeat(24), n: 0, demander(cmd, args = []) { this.file.push({ uid: 'u' + (++this.n), cmd, args }); } };
const pushFaux = [];   // (0.91) les jetons reçus par le faux labo   // (0.86) le boxion du compte, côté labo
const wledFaux = { state: { on: true, bri: 128, seg: [{ col: [[255, 80, 0]], fx: 0, pal: 0 }] }, info: { name: 'Ruban du salon', ver: '0.15.0', leds: { count: 60, pwr: 420 } }, effects: ['Solid', 'Blink', 'Breathe'], palettes: ['Default', 'Lava'] };

function base(nom) { if (!bases.has(nom)) bases.set(nom, new DatabaseSync(':memory:')); return bases.get(nom); }
function emettre(plugin, evenement, data) {
  for (const a of auditeurs) if (a.plugin === plugin && a.evenement === evenement)
    page.evaluate((r) => window.Capacitor.fromNative(r), { callbackId: a.callbackId, pluginId: plugin, methodName: 'addListener', success: true, save: true, data }).catch(() => {});
}
const natif = {
  Preferences: {
    configure: () => ({}), get: (o) => ({ value: prefs.has(o.key) ? prefs.get(o.key) : null }), set: (o) => { prefs.set(o.key, o.value); return {}; },
    remove: (o) => { prefs.delete(o.key); return {}; }, keys: () => ({ keys: [...prefs.keys()] }), clear: () => { prefs.clear(); return {}; },
  },
  CapacitorSQLite: {
    echo: (o) => ({ value: o.value }), checkConnectionsConsistency: () => ({ result: false }), isConnection: () => ({ result: false }),
    createConnection: (o) => { base(o.database); return {}; }, open: () => ({}), close: () => ({}), closeConnection: () => ({}), isDBOpen: () => ({ result: true }),
    isDatabase: () => ({ result: true }), getVersion: () => ({ version: 1 }),
    run: (o) => { const st = base(o.database).prepare(o.statement); const r = st.run(...(o.values || [])); return { changes: { changes: Number(r.changes), lastId: Number(r.lastInsertRowid) } }; },
    execute: (o) => { base(o.database).exec(o.statements); return { changes: { changes: 0 } }; },
    query: (o) => ({ values: base(o.database).prepare(o.statement).all(...(o.values || [])).map(x => ({ ...x })) }),
  },
  Device: {
    getId: () => ({ identifier: 'FAUX-IPHONE' }), getLanguageCode: () => ({ value: 'fr' }), getLanguageTag: () => ({ value: 'fr-CH' }),
    getInfo: () => ({ name: 'iPhone de test', model: 'iPhone14,7', platform: 'ios', operatingSystem: 'ios', osVersion: '26.4.2', manufacturer: 'Apple', isVirtual: true, webViewVersion: '26.4' }),
    getBatteryInfo: () => ({ batteryLevel: 0.8, isCharging: false }),
  },
  Network: { getStatus: () => ({ connected: true, connectionType: 'wifi' }) },
  App: { getInfo: () => ({ name: 'ploxi0n', id: 'ch.j0bot.ploxi0n', build: '60', version: '0.46.0' }), getState: () => ({ isActive: true }), getLaunchUrl: () => ({}), getAppLanguage: () => ({ value: 'fr' }), minimizeApp: () => ({}) },
  Haptics: Object.fromEntries(['impact', 'notification', 'selectionStart', 'selectionChanged', 'selectionEnd', 'vibrate'].map(m => [m, () => ({})])),
  Keyboard: Object.fromEntries(['show', 'hide', 'setAccessoryBarVisible', 'setStyle', 'setResizeMode', 'setScroll'].map(m => [m, () => ({})])),
  SystemBars: { setStyle: () => ({}), setAnimation: () => ({}), show: () => ({}), hide: () => ({}) },
  StatusBar: Object.fromEntries(['setStyle', 'setBackgroundColor', 'show', 'hide', 'setOverlaysWebView'].map(m => [m, () => ({})])),
  AppShortcuts: { get: () => ({ shortcuts: [] }), set: () => ({}), clear: () => ({}) },
  LocalNotifications: { checkPermissions: () => ({ display: 'granted' }), requestPermissions: () => ({ display: 'granted' }), schedule: (o) => ({ notifications: (o.notifications || []).map(n => ({ id: n.id })) }), getPending: () => ({ notifications: [] }), cancel: () => ({}), registerActionTypes: () => ({}), getDeliveredNotifications: () => ({ notifications: [] }), removeAllDeliveredNotifications: () => ({}) },
  Filesystem: {
    mkdir: () => ({}), writeFile: (o) => ({ uri: 'file:///Documents/' + o.path }), readdir: () => ({ files: [] }), stat: () => { throw new Error('File does not exist'); },
    readFile: () => { throw new Error('File does not exist'); }, getUri: (o) => ({ uri: 'file:///Documents/' + o.path }), deleteFile: () => ({}), appendFile: () => ({}),
    checkPermissions: () => ({ publicStorage: 'granted' }), requestPermissions: () => ({ publicStorage: 'granted' }),
  },
  Health: { isAvailable: () => ({ available: true, platform: 'ios' }), checkAuthorization: () => ({ readAuthorized: [], readDenied: [], writeAuthorized: [], writeDenied: [] }), requestAuthorization: () => ({ readAuthorized: [], readDenied: [], writeAuthorized: [], writeDenied: [] }), readSamples: () => ({ samples: [] }) },
  NativeBiometric: { isAvailable: () => ({ isAvailable: true, biometryType: 2 }), verifyIdentity: () => ({}),
    // (0.99.33) le trousseau : ce qui y est rangé (Face ID réussi d'office)
    setCredentials: (o) => { trousseauFaux[o.server] = o.password; return {}; }, getSecureCredentials: (o) => { if (!(o.server in trousseauFaux)) throw new Error('aucun secret'); return { username: o.server, password: trousseauFaux[o.server] }; },
    deleteCredentials: (o) => { delete trousseauFaux[o.server]; return {}; } },
  Clipboard: { read: () => ({ type: 'text/plain', value: presse }), write: (o) => { presse = o.string; return {}; } },
  TextToSpeech: { speak: () => ({}), stop: () => ({}), getSupportedLanguages: () => ({ languages: ['fr-FR', 'en-US'] }) },
  ScreenOrientation: { orientation: () => ({ type: 'portrait-primary' }), lock: () => ({}), unlock: () => ({}) },
  Geolocation: { checkPermissions: () => ({ location: 'granted', coarseLocation: 'granted' }), getCurrentPosition: () => ({ timestamp: Date.now(), coords: { latitude: 46.52, longitude: 6.63, accuracy: 10 } }), watchPosition: () => ({ timestamp: Date.now(), coords: { latitude: 46.52, longitude: 6.63, accuracy: 10 } }), clearWatch: () => ({}) },
  // (0.91) les notifications push : la permission, puis le jeton (l'événement « registration », comme iOS)
  PushNotifications: { requestPermissions: () => ({ receive: 'granted' }), checkPermissions: () => ({ receive: 'granted' }),
    register: () => { setTimeout(() => emettre('PushNotifications', 'registration', { value: 'faux-jeton-apns-0123' }), 60); return {}; }, unregister: () => ({}) },
  PloxiApple: {
    // (0.91) les Live Activities
    assistance: () => ({ voiceOver: false, selection: false, assistiveTouch: !!globalThis.__fauxAssistiveTouch, texteGras: false, mouvementReduit: false, grandTexte: false }),   // ♿ (0.99.44)
    activiteDebut: (o) => { activitesFaux.push({ ...o, id: 'act-' + (activitesFaux.length + 1) }); return { id: 'act-' + activitesFaux.length }; },
    activiteMaj: (o) => { const a = activitesFaux.find(x => x.id === o.id); if (!a) throw new Error('activité inconnue'); Object.assign(a, o); return {}; },
    activiteFin: (o) => { const n = activitesFaux.filter(x => !o.id || x.id === o.id).length; for (const x of activitesFaux) if (!o.id || x.id === o.id) x.finie = true; return { n }; },
    // (0.88) le système (btop) : ce que seul iOS sait
    taille: (o) => { tailles.push(+o.zoom); return { zoom: +o.zoom }; },   // (0.99.19) le zoom de page de WebKit (le parcours simule son effet)
    systeme: () => ({ thermique: 'tiede', economie: false, memoire: 6 * 1073741824, coeurs: 6, depuis: 200000, disqueLibre: 41.5 * 1073741824, disqueTotal: 128 * 1073741824 }),
    reseauChercher: () => ({ services: [{ nom: 'WLED-salon', type: '_wled._tcp.', domaine: 'local.', txt: { mac: 'aabbcc' } }, { nom: 'Maison', type: '_home-assistant._tcp.', domaine: 'local.', txt: { internal_url: 'http://10.0.0.9:8123', location_name: 'Maison' } }] }),
    reseauResoudre: (o) => (o.nom === 'WLED-salon' ? { hote: '10.0.0.7', port: 80 } : { hote: '10.0.0.9', port: 8123 }),
    httpFlux: () => ({ lignes: [], statut: 0 }),
    // (0.76) le QR de CoreImage : un PNG 1×1 (le parcours vérifie le texte demandé, dans appels)
    qr: (o) => { if (!o.texte) throw new Error('qr : un texte'); return { base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGNgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==', cote: 300 }; },
    mouvementDebut: (o) => {
      clearInterval(mouvementMinuteur); let t = 0;
      mouvementMinuteur = setInterval(() => { t += 0.1; emettre('PloxiApple', 'mouvement', { roll: Math.sin(t) * 0.2, pitch: 0.6 + Math.cos(t) * 0.1, yaw: 0, gx: Math.sin(t) * 0.2, gy: -0.8, gz: -0.5, ax: 0, ay: 0, az: 0, rx: 0, ry: 0, rz: 0 }); }, 1000 / Math.max(5, Math.min(30, o.hz || 30)));
      return {};
    },
    mouvementFin: () => { clearInterval(mouvementMinuteur); return {}; },
    meteo: () => ({ temperature: 12.4, ressentie: 11, condition: 'Nuageux', symbole: 'cloud.sun.fill', humidite: 0.7, vent: 9, uv: 2, jours: [], attribution: ' Weather', attributionLien: 'https://weatherkit.apple.com/legal-attribution.html' }),
    maisonListe: () => ({ accessoires: [{ id: 'a1', nom: 'Lampe salon', piece: 'Salon', maison: 'Chez moi', allume: false, basculable: true, joignable: true }, { id: 'a2', nom: 'Prise imprimante 3D', piece: 'Atelier', maison: 'Chez moi', allume: true, basculable: true, joignable: true }] }), maisonBasculer: (o) => ({ allume: o.allume ?? true }), gameCenter: () => ({ connecte: true, nom: 'testeur' }), gameCenterScore: () => ({ ok: true }), gameCenterOuvrir: () => ({ ok: true }),
    gameCenterClassements: () => ({ classements: [{ id: '001', titre: 'Xeroctions' }, { id: 'ploxi0n.clicker', titre: 'Clicker du xerboxion' }] }), ecranEveille: (o) => { eveil.push(o.actif); return { actif: o.actif }; }, lampe: (o) => ({ allume: o.allume ?? true }), apercu: () => ({ ok: true }), lecture: () => ({}), lectureFin: () => ({}),
  },
  // 👁 (0.73) l'AR native : ouvrir rend tout de suite (l'écran d'iOS est par-dessus) ; le parcours émet ensuite pose / touche / ferme
  // (0.75) Bonjour : un WLED et un Home Assistant s'annoncent
  PloxiAR: { disponible: () => ({ ar: true, lidar: true, piece: true, chambre: false, objet: true, pieces: '/var/mobile/Documents/terrax/pieces', objets: '/var/mobile/Documents/terrax/objets' }), ouvrir: () => ({ ok: true }), fermer: () => ({ ok: true }),
    capturerObjet: () => ({ nom: 'objet-2026-10-15-121500.usdz', chemin: '/var/mobile/Documents/terrax/objets/objet-2026-10-15-121500.usdz' }),
    scannerPiece: () => ({ nom: 'piece-2026-10-15-120000.usdz', chemin: '/var/mobile/Documents/terrax/pieces/piece-2026-10-15-120000.usdz' }) },
  // ◉ (0.99.1) l'ultimate Bluetooth : un voisin simulé, « RS-3 », 3 s d'avance d'horloge ; il répond aux pings et accuse les messages
  // 〰 (0.99.22) RS-3 (un voisin direct) et RS-4 (deux sauts plus loin, seulement voisin de RS-3) font tourner le VRAI maillage (src/bions/maille.js) :
  // RS-3 répond « ✓ » sur le même salon, RS-4 dit bonjour, relayé par RS-3 ; tous deux partagent leur position avec moi (chiffrée pour moi)
  PloxiProche: { demarrer: (o) => { setTimeout(() => emettre('PloxiProche', 'pair', { id: 'RS-3·b2c3', etat: 'connecte' }), 300); voisinsFaux().then(() => { rs3.voisin('app', 'connecte'); }); return { moi: o.nom, salle: o.salle }; },
    arreter: () => { setTimeout(() => emettre('PloxiProche', 'pair', { id: 'RS-3·b2c3', etat: 'perdu' }), 50); if (rs3) rs3.voisin('app', 'perdu'); return {}; },
    envoyer: (o) => { procheEnvoyes.push(o); let m = null; try { m = JSON.parse(o.donnees); } catch (e) { throw new Error('paquet illisible'); }
      const rep = (g, d, ms) => setTimeout(() => emettre('PloxiProche', 'message', { de: 'RS-3·b2c3', donnees: JSON.stringify({ v: 1, g, d, t: Date.now() + 3000 }) }), ms);
      if (m.g === 'ping') rep('pong', { t0: m.d.t0, t1: Date.now() + 3000 + 6, t2: Date.now() + 3000 + 6 }, 12);
      if (m.g === 'msg') rep('msg', { texte: '✓ ' + m.d.texte }, 250);
      if (m.m === 1 && rs3 && (!o.a || o.a.includes('RS-3·b2c3'))) setTimeout(() => rs3.recevoir('app', o.donnees), 5);
      return { envoyes: 1 }; },
    pairs: () => ({ pairs: ['RS-3·b2c3'] }) },
  PloxiLecteur: { moteurs: () => ({ apple: true, vlc: false }), ouvrir: (o) => ({ moteur: /\.mkv/.test(o.url) ? 'vlc' : 'apple' }), fermer: () => ({}) },
  PloxiVocal: { commencer: () => ({ chemin: '/tmp/vocal.m4a' }), arreter: () => ({ chemin: '/tmp/vocal.m4a', duree: 2, base64: '', type: 'audio/mp4' }), transcrire: (o) => ({ texte: 'ouvre le ploxion horloge', langue: o.langue, surLeTelephone: true }) },
  Share: { share: () => ({ activityType: 'com.apple.UIKit.activity.CopyToPasteboard' }), canShare: () => ({ value: true }) },
  // (0.84) la feuille « Se connecter avec Apple » : un jeton d'identité (le nonce haché est ignoré ici)
  SignInWithApple: { authorize: () => ({ response: { identityToken: 'jwt.faux-apple', givenName: 'RS-3', familyName: null, email: null, user: 'sub-faux' } }) },
  Browser: { open: (o) => { ouvertsBrowser.push(o.url); return {}; }, close: () => ({}) },
  ScreenOrientation: { orientation: () => ({ type: 'portrait-primary' }), lock: (o) => { verrous.push(o.orientation); return {}; }, unlock: () => ({}) },
  BluetoothLe: { initialize: () => ({}), requestDevice: () => ({ deviceId: 'AA:BB', name: 'Polar H10' }), connect: () => ({}), disconnect: () => ({}), read: () => ({ value: '5a' }), write: () => ({}), startNotifications: () => ({}), getServices: () => ({ services: [] }) },
  // 🤖 (0.75) le réseau local du contrôleur XERB0T : un WLED (10.0.0.7) et un Home Assistant (10.0.0.9:8123, jeton « bon ») simulés
  // (0.80) les mises à jour : le labo répond « 304, pas changé » pour un app.js
  // (0.81) le labo simulé pour les ploxions composés (le vrai ultimate-social, ses onglets) et le wiki (le vrai article « xerboxion »)
  CapacitorHttp: { get: (o) => laboFaux(o.url),
    request: (o) => { const u = new URL(o.url); const j = (status, data) => ({ status, data: JSON.stringify(data), headers: { 'Content-Type': 'application/json' }, url: o.url });
    // (0.99.6) le changelog du labo (rien n'a changé) et un labo qui limite le débit des bions (429) : pour mesurer le démarrage chargé
    if (u.hostname === 'labo.j0bot.ch' && u.pathname === '/px/changelog.json') return j(200, { head: 'faux', par_ploxion: {} });
    if (u.hostname === 'labo.j0bot.ch' && u.pathname.startsWith('/px/bion-app/')) return { status: 429, headers: { 'retry-after': '1' }, data: 'Too Many Requests', url: o.url };
    // (0.83) le labo : la règle d'encadrement (HEAD : il accepte l'app depuis le 19.10) et le passe à usage unique (seulement avec un jeton)
    if (u.hostname === 'labo.j0bot.ch' && o.method === 'HEAD') return { status: 200, data: '', headers: { 'content-security-policy': "frame-ancestors 'self' https://*.j0bot.ch capacitor://localhost" }, url: o.url };
    if (u.hostname === 'labo.j0bot.ch' && u.pathname === '/api/app/passe' && o.method === 'POST') return /^Bearer .+/.test((o.headers || {}).Authorization || '') ? j(200, { passe: 'faux-passe-0123456789abcdef', expire: new Date(Date.now() + 60e3).toISOString() }) : j(401, { message: 'Unauthenticated.' });
    if (u.hostname === '10.0.0.7') { const st = wledFaux.state;
      if (u.pathname === '/json/info') return j(200, wledFaux.info);
      if (u.pathname === '/json') return j(200, wledFaux);
      if (u.pathname === '/presets.json') return j(200, { 0: {}, 1: { n: 'Soirée' } });
      if (u.pathname === '/json/state' && o.method === 'POST') { const c = typeof o.data === 'string' ? JSON.parse(o.data) : o.data; if (c.on === 't') st.on = !st.on; else Object.assign(st, c); return j(200, { success: true }); } }
    // (0.99.12) un drone simulé : mavlink2rest (10.0.0.42:8088) ; les commandes reçues sont gardées
    if (u.hostname === '10.0.0.42' && u.port === '8088') {
      const M = { HEARTBEAT: { custom_mode: 5, base_mode: { bits: 209 } }, SYS_STATUS: { battery_remaining: 73, voltage_battery: 15840 }, GLOBAL_POSITION_INT: { lat: 465200000, lon: 66300000, relative_alt: 12400 }, VFR_HUD: { groundspeed: 3.2 }, GPS_RAW_INT: { fix_type: 3, satellites_visible: 14 } };
      if (u.pathname === '/mavlink' && o.method === 'POST') { droneFaux.push(typeof o.data === 'string' ? JSON.parse(o.data) : o.data); return j(200, {}); }
      if (u.pathname === '/mavlink/vehicles') return j(200, [1]);
      const m = /messages\/(\w+)$/.exec(u.pathname); if (m && M[m[1]]) return j(200, { message: M[m[1]], status: {} }); return j(404, {}); }
    if (u.hostname === '10.0.0.9' && u.port === '8123') { if ((o.headers || {}).Authorization !== 'Bearer bon') return j(401, {}); if (u.pathname === '/api/states') return j(200, [{ entity_id: 'light.salon', state: 'on', attributes: { friendly_name: 'Salon', brightness: 200, supported_color_modes: ['brightness'] } }, { entity_id: 'sensor.temp', state: '21.5', attributes: { unit_of_measurement: '°C', friendly_name: 'Température' } }]); return j(200, []); }
    if (u.hostname === 'labo.j0bot.ch' && u.pathname === '/px/miroir/enroler' && o.method === 'POST') { xbFaux.enrole = typeof o.data === 'string' ? JSON.parse(o.data) : o.data; return j(201, { id: 'e1', code: 'K7Q-42' }); }
    if (u.hostname === 'labo.j0bot.ch' && u.pathname === '/px/miroir/enroler/e1') { if (!xbFaux.enrole || u.searchParams.get('secret') !== xbFaux.enrole.secret) return j(404, {}); xbFaux.sondages++; return j(200, xbFaux.sondages >= 2 ? { statut: 'approuve', jeton: xbFaux.jeton, nom_compte: 'RS-7' } : { statut: 'attente' }); }
    if (u.hostname === 'labo.j0bot.ch' && u.pathname.startsWith('/xb/appareil/')) { if ((o.headers || {})['X-Xer-Jeton'] !== xbFaux.jeton) return j(401, {});
      const b = typeof o.data === 'string' ? JSON.parse(o.data) : (o.data || {});
      if (u.pathname === '/xb/appareil/battement') { xbFaux.battements++; xbFaux.dernier = b; return j(200, { demandes: xbFaux.file.splice(0) }); }
      if (u.pathname.startsWith('/xb/appareil/sortie/')) { xbFaux.sorties.push({ uid: u.pathname.split('/').pop(), ...b }); return j(200, {}); } }
    // (0.91) le push : le labo garde le jeton du compte (seulement avec un jeton de compte)
    if (u.hostname === 'labo.j0bot.ch' && u.pathname === '/api/app/push') { if (!/^Bearer .+/.test((o.headers || {}).Authorization || '')) return j(401, { message: 'Unauthenticated.' });
      const b = typeof o.data === 'string' ? JSON.parse(o.data) : (o.data || {}); pushFaux.push({ methode: o.method, ...b }); return j(o.method === 'DELETE' ? 200 : 201, { ok: true }); }
    // (0.86) jOSBoxion connecté : un boxion en mémoire (load/save), seulement avec un jeton
    if (u.hostname === 'labo.j0bot.ch' && u.pathname.startsWith('/px/boxion/')) { if (!/^Bearer .+/.test((o.headers || {}).Authorization || '')) return j(401, { message: 'Unauthenticated.' });
      const b = typeof o.data === 'string' ? JSON.parse(o.data) : (o.data || {});
      if (u.pathname === '/px/boxion/load') { const k = u.searchParams.get('ns') + '/' + u.searchParams.get('key'); return j(200, boxionFaux.has(k) ? boxionFaux.get(k) : { item: null }); }
      if (u.pathname === '/px/boxion/save' && o.method === 'POST') { boxionFaux.set(b.ns + '/' + b.key, { ns: b.ns, key: b.key, name: b.name, data: b.data, savedAt: new Date().toISOString() }); return j(200, { ok: true }); }
      if (u.pathname === '/px/boxion/list') return j(200, { items: [...boxionFaux.values()].filter(d => !u.searchParams.get('ns') || d.ns === u.searchParams.get('ns')).map(d => ({ ns: d.ns, key: d.key, name: d.name })) }); }
    // (0.85) l'envoi de fichiers : le FS du labo reçoit du multipart (comme le Swift : chaque fichier DOIT avoir fileName et contentType)
    if (u.hostname === 'labo.j0bot.ch' && u.pathname === '/fs/write' && o.method === 'POST') {
      if (o.dataType !== 'formData' || !Array.isArray(o.data)) return j(422, { message: 'pas du multipart : ' + o.dataType });
      const f = o.data.find(x => x.type === 'base64File'); if (!f || !f.fileName || !f.contentType) throw new Error('Swift : fileName ou contentType manquant (force unwrap)');
      return j(200, { ok: true, path: (o.data.find(x => x.key === 'path') || {}).value, octets: Buffer.from(f.value, 'base64').length, contentType: f.contentType, entetes: Object.keys(o.headers || {}) }); }
    // (0.84) « Continuer avec Apple » (api.j0bot.ch) : un Apple ID nouveau sans invitation → 403 ; avec le code FAUX42 → le compte ; DELETE /me
    if (u.hostname === 'api.j0bot.ch' && u.pathname === '/api/v1/auth/apple' && o.method === 'POST') { const b = typeof o.data === 'string' ? JSON.parse(o.data) : (o.data || {});
      if (!b.identity_token || !b.nonce) return j(422, { message: 'jeton manquant' });
      if (!b.code) return j(403, { message: 'Cet Apple ID n\'a pas encore de compte j0bot.', invitation_requise: true });
      return b.code === 'FAUX42' ? j(201, { token: 'bon', user: { id: 'u1', username: 'rs3', identity_level: 'pseudonym' } }) : j(422, { message: 'Invitation invalide, expirée ou épuisée.' }); }
    if (u.hostname === 'api.j0bot.ch' && u.pathname === '/api/v1/me' && o.method === 'DELETE') { const b = typeof o.data === 'string' ? JSON.parse(o.data) : (o.data || {});
      return (o.headers || {}).Authorization === 'Bearer bon' && b.confirmer === 'supprimer' ? j(200, { message: 'Compte supprimé.' }) : j(401, { message: 'Unauthenticated.' }); }
    // (0.76) l'invite du social : le jeton « bon » a droit à un code
    if (u.hostname === 'api.j0bot.ch' && u.pathname === '/api/v1/invites' && o.method === 'POST') return (o.headers || {}).Authorization === 'Bearer bon' ? j(201, { code: 'FAUX42' }) : j(401, { message: 'Unauthenticated.' });
    throw new Error('Could not connect to the server.'); } },
  CapacitorCookies: {}, WebView: { getServerBasePath: () => ({ path: '' }) }, Console: { log: () => ({}) },
};
// ᛒ ◷ (0.99.30, la branche xerbot-ledfx fusionnée) le Bluetooth bas niveau et la veille, simulés : trois appareils émettent (RS-3 s'annonce
// comme un ploxi, une montre Apple, un ESP32) ; la veille rend trois points et une visite
natif.PloxiOndes = {
  scanner: () => { setTimeout(() => {
    emettre('PloxiOndes', 'appareil', { id: 'A1B2-RS3', nom: 'RS-3', rssi: -55, connectable: true, services: ['6E1D0000-0000-4000-8000-0000000C0DE0'] });
    emettre('PloxiOndes', 'appareil', { id: 'C3D4-MONTRE', nom: 'Watch', rssi: -70, connectable: false, services: [], fabricant: '4c000215' });
    emettre('PloxiOndes', 'appareil', { id: 'E5F6-ESP', nom: 'ESP32-LED', rssi: -82, tx: -65, connectable: true, services: [], fabricant: 'e5020102' });
  }, 200); return { etat: 'allume' }; },
  arreterScan: () => ({}), annoncer: () => ({}), arreterAnnonce: () => ({}),
};
// 🚗 (0.99.31) CarPlay, simulé : le dernier modèle reçu est gardé (globalThis.carplayModele) ; le parcours branche la voiture et touche
natif.PloxiCarPlay = { poser: (o) => { globalThis.carplayModele = o; globalThis.carplayPoses = (globalThis.carplayPoses || 0) + 1; return { connecte: !!globalThis.carplayBranche }; }, etat: () => ({ connecte: !!globalThis.carplayBranche }) };
globalThis.carplayBrancher = (oui = true) => { globalThis.carplayBranche = oui; emettre('PloxiCarPlay', 'connexion', { connecte: oui }); };
globalThis.carplayToucher = (id) => emettre('PloxiCarPlay', 'choix', { id });
// ⌂ (0.99.32) le faux Android : trois applis (dont une sans icône), l'écran d'accueil qu'on choisit, ce qu'on lance
const PNG1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const accueilFaux = { accueil: false, lances: [], reglages: [] };
natif.PloxiAccueil = { estAccueil: () => ({ accueil: accueilFaux.accueil, peut: true }), choisir: () => { accueilFaux.accueil = true; return { accueil: true }; },
  applis: () => ({ applis: [{ paquet: 'com.google.android.dialer', activite: 'D', nom: 'Téléphone', icone: PNG1 }, { paquet: 'com.android.settings', activite: 'S', nom: 'Paramètres', icone: PNG1 }, { paquet: 'org.mozilla.firefox', nom: 'Firefox' }] }),
  lancer: (o) => { accueilFaux.lances.push(o); return {}; }, reglages: (o) => { accueilFaux.reglages.push(o); return {}; } };
globalThis.androidRetour = () => emettre('App', 'backButton', { canGoBack: false });
natif.PloxiVeille = {
  demarrer: (o) => ({ etat: 'toujours', fine: o.fine !== false }), arreter: () => ({}),
  etat: () => ({ etat: 'toujours', actif: true, fine: true, points: 3 }),
  lire: () => { const t = Date.now(); return { points: [0, 1, 2].map(i => ({ t: t - (3 - i) * 60000, la: 46.52 + i * 0.0001, lo: 6.63, acc: 8, v: 1.2 })), visites: [{ a: t - 3600e3, d: t - 1800e3, la: 46.5205, lo: 6.6301, acc: 20 }] }; },
  vider: () => ({}),
  // 🏝 (0.99.43) la balade : une Live Activity de plus dans activitesFaux (genre balade)
  baladeDebut: (o) => { const deja = activitesFaux.find(x => x.genre === 'balade' && !x.finie); if (deja) { Object.assign(deja, o); return { id: deja.id, deja: true }; } activitesFaux.push({ ...o, genre: 'balade', id: 'act-' + (activitesFaux.length + 1), metres: 0 }); return { id: 'act-' + activitesFaux.length }; },
  baladeCible: (o) => { const a = activitesFaux.find(x => x.genre === 'balade' && !x.finie); if (!a) throw new Error('pas de balade en cours'); a.cible = o.cible || null; return {}; },
  baladeFin: () => { const a = activitesFaux.find(x => x.genre === 'balade' && !x.finie); if (a) a.finie = true; return { metres: a ? 420 : 0, secondes: a ? 600 : 0 }; },
};

// 👁 (0.99.46) PloxiRegard : un visage de synthèse, 30 mesures par seconde, que le parcours pilote (regardFaux.visage = { lacet, tangage, … })
const regardFaux = { actif: false, demarrages: 0, visage: { lacet: 0, tangage: 0, cligneG: 0, cligneD: 0, x: 0, y: 0 }, minuterie: null };
natif.PloxiRegard = {
  dispo: () => ({ dispo: true }),
  demarrer: () => { regardFaux.actif = true; regardFaux.demarrages++; clearInterval(regardFaux.minuterie); regardFaux.minuterie = setInterval(() => emettre('PloxiRegard', 'visage', { t: Date.now(), ...regardFaux.visage }), 33); return { ok: true }; },
  arreter: () => { regardFaux.actif = false; clearInterval(regardFaux.minuterie); return {}; },
};

// (0.99.48) RS-3 parle à l'app : sur l'iPhone par PloxiProche (le paquet entier) ; sur le faux Android par PloxiBLE (des morceaux de 180 octets, en base64)
let nMorceau = 1; const recolleurBle = creerRecolleur();
function versApp(texte) {
  if (!android) return emettre('PloxiProche', 'message', { de: 'RS-3·b2c3', donnees: texte });
  for (const m of decouper(texte, nMorceau++)) emettre('PloxiBLE', 'message', { de: 'RS-3·b2c3', donnees: Buffer.from(m).toString('base64') });
}
natif.PloxiBLE = {
  demarrer: () => { setTimeout(() => emettre('PloxiBLE', 'pair', { id: 'RS-3·b2c3', etat: 'connecte' }), 300); voisinsFaux().then(() => { rs3.voisin('app', 'connecte'); }); return {}; },
  arreter: () => { setTimeout(() => emettre('PloxiBLE', 'pair', { id: 'RS-3·b2c3', etat: 'perdu' }), 50); if (rs3) rs3.voisin('app', 'perdu'); return {}; },
  envoyer: (o) => { procheEnvoyes.push(o); const t = recolleurBle.ajouter('app', new Uint8Array(Buffer.from(o.donnees, 'base64'))); if (t != null && rs3 && (!o.a || o.a.includes('RS-3·b2c3'))) setTimeout(() => rs3.recevoir('app', t), 5); return {}; },
};

// 〰 (0.99.22) les voisins du maillage : RS-3 (lié à l'app et à RS-4) et RS-4 (lié à RS-3 seulement)
let rs3 = null, rs4 = null, voisinsPrets = null;
function voisinsFaux() {
  if (voisinsPrets) return voisinsPrets;
  const subtle = globalThis.crypto.subtle, alea = (n) => globalThis.crypto.getRandomValues(new Uint8Array(n)), sans = () => () => {};
  rs3 = creerMaille({ subtle, alea, nom: 'RS-3', attente: (ms, f) => setTimeout(f, 5), repeter: sans,
    envoyer: (texte, vers) => { if (!vers || vers.includes('app')) setTimeout(() => versApp(texte), 5); if (!vers || vers.includes('rs4')) setTimeout(() => rs4.recevoir('rs3', texte), 5); } });
  rs4 = creerMaille({ subtle, alea, nom: 'RS-4', attente: (ms, f) => setTimeout(f, 5), repeter: sans, envoyer: (texte) => setTimeout(() => rs3.recevoir('rs4', texte), 5) });
  const repondu = new Set();
  voisinsPrets = (async () => {
    await rs3.demarrer(); await rs4.demarrer(); rs3.voisin('rs4', 'connecte'); rs4.voisin('rs3', 'connecte');
    rs3.surChange((q) => { if (q !== 'messages') return; for (const s of rs3.salons()) for (const m of rs3.fil(s.salon)) if (!m.moi && m.texte && m.nom !== 'RS-4' && !repondu.has(m.id)) { repondu.add(m.id); setTimeout(() => rs3.dire('✓ ' + m.texte, s.salon), 200); } });
    // dès que l'app s'est annoncée : RS-4 dit bonjour (deux sauts) ; les deux partagent leur position avec elle, toutes les 2 s
    let bonjour = false;
    setInterval(() => {
      const app = rs3.pairs().find(p => p.direct && p.nom !== 'RS-4' && p.cle); if (!app) return;
      if (!bonjour) { bonjour = true; rs4.dire('je suis deux sauts plus loin, RS-3 me relaie'); }
      rs3.partagerPosition({ lat: 46.52085, lng: 6.63095, precision: 6 }, { a: [app.fp] });   // ~110 m au nord-est
      if (rs4.pairs().some(p => p.fp === app.fp && p.cle)) rs4.partagerPosition({ lat: 46.51840, lng: 6.62760, precision: 25, rdv: { lat: 46.51900, lng: 6.62900, nom: 'la fontaine' } }, { a: [app.fp] });   // ~300 m au sud-ouest ; (0.99.29) et son rendez-vous
    }, 2000).unref();   // ne retient pas la fin du faux iPhone
  })();
  return voisinsPrets;
}

const pont = { octets: 0, appels: 0, depuis: Date.now() };   // (0.99.6) ce qui traverse le pont natif (sur l'iPhone : sérialisé sur le fil principal)
function repondre(d) { const r = repondre0(d); try { const n = JSON.stringify(d.options || {}).length + JSON.stringify((r && r.data) || {}).length; pont.octets += n; pont.appels++; const o = d.options || {}, k = d.pluginId + '.' + d.methodName + ' ' + String(o.statement || '').replace(/\s+/g, ' ').slice(0, 60) + ' ' + JSON.stringify((o.values || []).slice(0, 2)).slice(0, 50); pont.par = pont.par || {}; pont.par[k] = (pont.par[k] || 0) + n; pont.t = pont.t || []; if (n > 200000) pont.t.push([Date.now() - pont.depuis, k.slice(0, 120), n]); } catch (e) { /* */ } return r; }
function repondre0({ pluginId, methodName, options, callbackId }) {
  { let gros = 0; try { gros = JSON.stringify(options || {}).length; } catch (e) { /* */ } appels.push({ t: Date.now(), p: pluginId, m: methodName, o: gros > 20000 ? { gros } : options }); }   // (0.99.23) un ploxion installé (son code entier) n'est pas gardé : le bilan de 551 ploxions tombait à court de mémoire
  if (methodName === 'addListener') { auditeurs.push({ plugin: pluginId, evenement: options.eventName, callbackId }); return { garder: true }; }
  if (methodName === 'removeListener' || methodName === 'removeAllListeners') return { success: true, data: {} };
  if (!plugins[pluginId]) return { success: false, error: { message: `"${pluginId}" plugin is not implemented on ios`, code: 'UNIMPLEMENTED' } };
  const f = natif[pluginId] && natif[pluginId][methodName];
  if (!f) { const k = pluginId + '.' + methodName; nonSimules.set(k, (nonSimules.get(k) || 0) + 1); return { success: true, data: {} }; }
  try { return { success: true, data: f(options || {}) || {} }; } catch (e) { return { success: false, error: { message: e.message } }; }
}

const navigateur = await chromium.launch().catch(() => chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }));
const ctx = await navigateur.newContext({
  viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'fr-CH',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
});
const journal = [];
page = await ctx.newPage();
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) journal.push(m.type() + ' · ' + m.text().slice(0, 400)); });
page.on('framenavigated', (fr) => { if (fr === page.mainFrame()) journal.push('NAVIGATION · ' + fr.url()); });
page.on('pageerror', (e) => journal.push('EXCEPTION · ' + (e.stack || e.message).slice(0, 600)));
page.on('requestfailed', (r) => journal.push('requête échouée · ' + r.url().slice(0, 200) + ' · ' + (r.failure() || {}).errorText));
page.on('response', (r) => { if (r.status() >= 400) journal.push('HTTP ' + r.status() + ' · ' + r.url().slice(0, 200)); });
if (!web) {
  await page.exposeBinding('__natif', (_src, d) => repondre(d));
  const entetes = Object.entries(plugins).map(([name, methods]) => ({ name, methods: [
    { name: 'addListener', rtype: null }, { name: 'removeListener', rtype: null }, { name: 'removeAllListeners', rtype: 'promise' },
    { name: 'checkPermissions', rtype: 'promise' }, { name: 'requestPermissions', rtype: 'promise' }, ...methods] }));
  await page.addInitScript(({ entetes }) => {
    window.Capacitor = { DEBUG: false, isLoggingEnabled: false, Plugins: {}, PluginHeaders: entetes };
    window.WEBVIEW_SERVER_URL = location.origin;
    window.webkit = { messageHandlers: { bridge: { postMessage: (d) => {
      window.__natif(d).then((r) => { if (r && r.garder) return; if (d.callbackId !== '-1') window.Capacitor.fromNative({ callbackId: d.callbackId, pluginId: d.pluginId, methodName: d.methodName, ...r }); });
    } } } };
  }, { entetes });
  await page.addInitScript({ content: bridge });
  if (android) await page.addInitScript(() => { const C = window.Capacitor; Object.defineProperty(C, 'getPlatform', { configurable: true, get: () => () => 'android', set: () => {} }); });
}
await page.addInitScript(() => { window.__t0 = performance.now(); });

const ecrire = async (nom) => { await page.screenshot({ path: path.join(sortie, nom + '.png') }); };
const t0 = Date.now();
await page.goto(url, { waitUntil: 'load' });
// la fin du démarrage : l'écran de chargement parti
let demarre = false;
for (let i = 0; i < 100; i++) {
  demarre = await page.evaluate(() => { const b = document.getElementById('px-boot'); return !b || b.hidden || getComputedStyle(b).display === 'none' || b.classList.contains('fin'); }).catch(() => false);
  if (demarre) break;
  await page.waitForTimeout(100);
}
const dureeBoot = Date.now() - t0;
await page.waitForTimeout(800);
await ecrire('01-accueil');
await page.waitForLoadState('load').catch(() => {});
const etat = await page.evaluate(() => ({
  natif: !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()), plateforme: window.Capacitor && Capacitor.getPlatform && Capacitor.getPlatform(),
  jOSNatif: !!(window.jOSNatif && window.jOSNatif.natif), journalBoot: (document.querySelector('#px-boot .log') || {}).innerText || '',
  vivant: document.documentElement.classList.contains('px-vivant'), mx: getComputedStyle(document.documentElement).getPropertyValue('--mx'),
  texte: document.body.innerText.slice(0, 600),
}));
let resultatsEtapes = null;
if (scriptEtapes) { const m = await import(path.resolve(scriptEtapes)); try { resultatsEtapes = await m.default({ page, ecrire, journal, appels, prefs, emettre, ouvertsBrowser, verrous, eveil, activitesFaux, pushFaux, regardFaux, parTuyau: versApp, android, procheEnvoyes, pont, droneFaux, tailles, accueilFaux, xbFaux, trousseauFaux }); } catch (e) { journal.push('PARCOURS INTERROMPU · ' + e.message.split('\n')[0]); } }
clearInterval(mouvementMinuteur); clearInterval(regardFaux.minuterie);
const resume = { url, mode: web ? 'web' : android ? 'android' : (opts.includes('--sans-plugions') ? 'ios-sans-plugions' : 'ios'), demarre, dureeBoot, etat,
  appelsNatifs: Object.entries(appels.reduce((a, x) => { const k = x.p + '.' + x.m; a[k] = (a[k] || 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]),
  nonSimules: [...nonSimules], journal, resultatsEtapes };
writeFileSync(path.join(sortie, 'resume.json'), JSON.stringify(resume, null, 1));
console.log(JSON.stringify({ ...resume, appelsNatifs: resume.appelsNatifs.slice(0, 40) }, null, 1).slice(0, 9000));
await navigateur.close();
