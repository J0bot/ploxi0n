// LE FAUX IPHONE (0.47) : Chromium à la taille d'un iPhone + le VRAI native-bridge.js de Capacitor + les en-têtes des plugins iOS RÉELS
// (extraits du Swift par extraire-plugins.cjs : un plugin ou une méthode absents du Swift répondent « not implemented on ios », comme sur
// le téléphone) + un « natif » simulé en Node (Preferences, SQLite réel via node:sqlite, CoreMotion, Santé…). L'app y prend le chemin
// iPhone (isNativePlatform) : ce que le navigateur et jsdom ne voient jamais (le piège du proxy, 0.47) apparaît ici.
// Usage : npm run build && npx vite preview --port 4173 &
//         node tools/faux-iphone/faux-iphone.mjs http://localhost:4173/ <dossier-sortie> [--sans-plugions] [--web] [--script parcours-app.mjs]
// Sortie : <dossier>/resume.json (appels natifs, erreurs, journal) + des captures PNG.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { execFileSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = (() => { for (const p of ['playwright', '/opt/node-tools/node_modules/playwright']) { try { return require(p); } catch (e) { /* suivant */ } } throw new Error('Playwright introuvable : npm i -g playwright'); })();

const [url, sortie, ...opts] = process.argv.slice(2);
mkdirSync(sortie, { recursive: true });
const ICI = path.dirname(new URL(import.meta.url).pathname);
const RACINE = path.resolve(ICI, '../..');
execFileSync(process.execPath, [path.join(ICI, 'extraire-plugins.cjs'), path.join(sortie, 'plugins-ios.json')], { cwd: RACINE });   // toujours le Swift du moment
let plugins = JSON.parse(readFileSync(path.join(sortie, 'plugins-ios.json'), 'utf8'));
if (opts.includes('--sans-plugions')) { delete plugins.PloxiApple; delete plugins.PloxiVocal; }
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
  NativeBiometric: { isAvailable: () => ({ isAvailable: true, biometryType: 2 }), verifyIdentity: () => ({}) },
  Clipboard: { read: () => ({ type: 'text/plain', value: presse }), write: (o) => { presse = o.string; return {}; } },
  TextToSpeech: { speak: () => ({}), stop: () => ({}), getSupportedLanguages: () => ({ languages: ['fr-FR', 'en-US'] }) },
  ScreenOrientation: { orientation: () => ({ type: 'portrait-primary' }), lock: () => ({}), unlock: () => ({}) },
  Geolocation: { checkPermissions: () => ({ location: 'granted', coarseLocation: 'granted' }), getCurrentPosition: () => ({ timestamp: Date.now(), coords: { latitude: 46.52, longitude: 6.63, accuracy: 10 } }), watchPosition: () => ({ timestamp: Date.now(), coords: { latitude: 46.52, longitude: 6.63, accuracy: 10 } }), clearWatch: () => ({}) },
  PloxiApple: {
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
  PloxiLecteur: { moteurs: () => ({ apple: true, vlc: false }), ouvrir: (o) => ({ moteur: /\.mkv/.test(o.url) ? 'vlc' : 'apple' }), fermer: () => ({}) },
  PloxiVocal: { commencer: () => ({ chemin: '/tmp/vocal.m4a' }), arreter: () => ({ chemin: '/tmp/vocal.m4a', duree: 2, base64: '', type: 'audio/mp4' }), transcrire: (o) => ({ texte: 'ouvre le ploxion horloge', langue: o.langue, surLeTelephone: true }) },
  Share: { share: () => ({ activityType: 'com.apple.UIKit.activity.CopyToPasteboard' }), canShare: () => ({ value: true }) },
  Browser: { open: (o) => { ouvertsBrowser.push(o.url); return {}; }, close: () => ({}) },
  ScreenOrientation: { orientation: () => ({ type: 'portrait-primary' }), lock: (o) => { verrous.push(o.orientation); return {}; }, unlock: () => ({}) },
  BluetoothLe: { initialize: () => ({}), requestDevice: () => ({ deviceId: 'AA:BB', name: 'Polar H10' }), connect: () => ({}), disconnect: () => ({}), read: () => ({ value: '5a' }), write: () => ({}), startNotifications: () => ({}), getServices: () => ({ services: [] }) },
  // 🤖 (0.75) le réseau local du contrôleur XERB0T : un WLED (10.0.0.7) et un Home Assistant (10.0.0.9:8123, jeton « bon ») simulés
  // (0.80) les mises à jour : le labo répond « 304, pas changé » pour un app.js
  CapacitorHttp: { get: (o) => (/labo\.j0bot\.ch\/px\/[^/]+\/app\.js/.test(o.url) ? { status: 304, data: '', headers: {}, url: o.url } : (() => { throw new Error('Could not connect to the server.'); })()),
    request: (o) => { const u = new URL(o.url); const j = (status, data) => ({ status, data: JSON.stringify(data), headers: { 'Content-Type': 'application/json' }, url: o.url });
    if (u.hostname === '10.0.0.7') { const st = wledFaux.state;
      if (u.pathname === '/json/info') return j(200, wledFaux.info);
      if (u.pathname === '/json') return j(200, wledFaux);
      if (u.pathname === '/presets.json') return j(200, { 0: {}, 1: { n: 'Soirée' } });
      if (u.pathname === '/json/state' && o.method === 'POST') { const c = typeof o.data === 'string' ? JSON.parse(o.data) : o.data; if (c.on === 't') st.on = !st.on; else Object.assign(st, c); return j(200, { success: true }); } }
    if (u.hostname === '10.0.0.9' && u.port === '8123') { if ((o.headers || {}).Authorization !== 'Bearer bon') return j(401, {}); if (u.pathname === '/api/states') return j(200, [{ entity_id: 'light.salon', state: 'on', attributes: { friendly_name: 'Salon', brightness: 200, supported_color_modes: ['brightness'] } }, { entity_id: 'sensor.temp', state: '21.5', attributes: { unit_of_measurement: '°C', friendly_name: 'Température' } }]); return j(200, []); }
    // (0.76) l'invite du social : le jeton « bon » a droit à un code
    if (u.hostname === 'api.j0bot.ch' && u.pathname === '/api/v1/invites' && o.method === 'POST') return (o.headers || {}).Authorization === 'Bearer bon' ? j(201, { code: 'FAUX42' }) : j(401, { message: 'Unauthenticated.' });
    throw new Error('Could not connect to the server.'); } },
  CapacitorCookies: {}, WebView: { getServerBasePath: () => ({ path: '' }) }, Console: { log: () => ({}) },
};

function repondre({ pluginId, methodName, options, callbackId }) {
  appels.push({ t: Date.now(), p: pluginId, m: methodName, o: options });
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
if (scriptEtapes) { const m = await import(path.resolve(scriptEtapes)); try { resultatsEtapes = await m.default({ page, ecrire, journal, appels, prefs, emettre, ouvertsBrowser, verrous, eveil }); } catch (e) { journal.push('PARCOURS INTERROMPU · ' + e.message.split('\n')[0]); } }
clearInterval(mouvementMinuteur);
const resume = { url, mode: web ? 'web' : (opts.includes('--sans-plugions') ? 'ios-sans-plugions' : 'ios'), demarre, dureeBoot, etat,
  appelsNatifs: Object.entries(appels.reduce((a, x) => { const k = x.p + '.' + x.m; a[k] = (a[k] || 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]),
  nonSimules: [...nonSimules], journal, resultatsEtapes };
writeFileSync(path.join(sortie, 'resume.json'), JSON.stringify(resume, null, 1));
console.log(JSON.stringify({ ...resume, appelsNatifs: resume.appelsNatifs.slice(0, 40) }, null, 1).slice(0, 9000));
await navigateur.close();
