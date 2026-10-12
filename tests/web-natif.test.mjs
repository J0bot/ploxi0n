// ⚡ LE WEB DEVIENT NATIF (0.47) : les API web des ploxions arrivent bien au natif de l'iPhone (plugins simulés), et rien hors de l'iPhone.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { installerWebNatif, decoderNdef, encoderNdef, uuidBle } from '../src/natif/web-natif.js';

function fenetre({ natif = true } = {}) {
  const { window: W } = new JSDOM('<!doctype html><body></body>', { url: 'capacitor://localhost/' });
  W.Capacitor = { isNativePlatform: () => natif };
  return W;
}
const attendre = (ms = 10) => new Promise(r => setTimeout(r, ms));

test('NDEF : un texte et un lien s\'encodent puis se relisent à l\'identique', () => {
  const [t, u] = encoderNdef({ records: [{ recordType: 'text', data: 'salut ploxion' }, { recordType: 'url', data: 'https://xerboxion.org/px/horloge' }] });
  assert.equal(t.payload[0], 2, 'la longueur de la langue (fr)');
  assert.equal(u.payload[0], 4, 'le préfixe « https:// »');
  const rt = decoderNdef(t), ru = decoderNdef(u);
  assert.equal(rt.recordType, 'text'); assert.equal(rt.lang, 'fr');
  assert.equal(new TextDecoder().decode(rt.data), 'salut ploxion');
  assert.equal(ru.recordType, 'url'); assert.equal(new TextDecoder().decode(ru.data), 'https://xerboxion.org/px/horloge');
  assert.equal(decoderNdef(encoderNdef('juste un texte')[0]).recordType, 'text');
});

test('Bluetooth : les noms et les nombres du web deviennent des UUID complets', () => {
  assert.equal(uuidBle('heart_rate'), '0000180d-0000-1000-8000-00805f9b34fb');
  assert.equal(uuidBle(0x2a37), '00002a37-0000-1000-8000-00805f9b34fb');
  assert.equal(uuidBle('180F'), '0000180f-0000-1000-8000-00805f9b34fb');
  assert.equal(uuidBle('6e400001-b5a3-f393-e0a9-e50e24dcca9e'), '6e400001-b5a3-f393-e0a9-e50e24dcca9e');
});

test('hors de l\'iPhone : rien n\'est remplacé (sauf BarcodeDetector, absent du navigateur)', () => {
  const W = fenetre({ natif: false }); const vib = W.navigator.vibrate;
  const r = installerWebNatif({ W });
  assert.deepEqual(r.faits, W.BarcodeDetector ? ['barcode'] : []);
  assert.equal(W.navigator.vibrate, vib);
});

test('sur l\'iPhone : vibrate, partage, presse-papiers, position, notification, batterie passent par les plugins', async () => {
  const W = fenetre(); const appels = []; let presse = '';
  const note = (n) => (o) => { appels.push([n, o]); return Promise.resolve({}); };
  const charger = {
    haptics: async () => ({ Haptics: { impact: note('impact') } }),
    share: async () => ({ Share: { share: note('share') } }),
    clipboard: async () => ({ Clipboard: { write: async (o) => { presse = o.string; }, read: async () => ({ value: presse }) } }),
    geolocation: async () => ({ Geolocation: { getCurrentPosition: async () => ({ timestamp: 1, coords: { latitude: 46.5, longitude: 6.6, accuracy: 5 } }) } }),
    notifs: async () => ({ LocalNotifications: { checkPermissions: async () => ({ display: 'granted' }), requestPermissions: async () => ({ display: 'granted' }), addListener: async () => ({ remove() {} }), schedule: note('schedule') } }),
    device: async () => ({ Device: { getBatteryInfo: async () => ({ batteryLevel: 0.42, isCharging: true }) } }),
  };
  const r = installerWebNatif({ W, charger, courant: () => 'horloge', prefs: () => ({ haptique: true }) });
  for (const k of ['vibrate', 'share', 'clipboard', 'geolocation', 'notification', 'battery', 'speech', 'motion', 'wakelock', 'bluetooth', 'nfc', 'liens']) assert.ok(r.faits.includes(k), k);
  W.navigator.vibrate([10, 20, 80]); await attendre(150);
  assert.deepEqual(appels.filter(a => a[0] === 'impact').map(a => a[1].style), ['LIGHT', 'HEAVY']);
  await W.navigator.share({ title: 't', text: 'x' }); assert.ok(appels.some(a => a[0] === 'share'));
  await W.navigator.clipboard.writeText('coucou'); assert.equal(await W.navigator.clipboard.readText(), 'coucou');
  const lat = await new Promise((ok, ko) => W.navigator.geolocation.getCurrentPosition(p => ok(p.coords.latitude), ko)); assert.equal(lat, 46.5);
  assert.equal(await W.Notification.requestPermission(), 'granted');
  new W.Notification('bonjour', { body: 'un ploxion' }); await attendre();
  const n = appels.find(a => a[0] === 'schedule'); assert.equal(n[1].notifications[0].title, 'bonjour'); assert.equal(n[1].notifications[0].extra.ploxion, 'horloge');
  const b = await W.navigator.getBattery(); assert.equal(b.level, 0.42); assert.equal(b.charging, true);
});

test('vibrate se tait quand l\'haptique de l\'app est coupée ; ⚙ › Natif coupé = rien n\'est remplacé', async () => {
  const W = fenetre(); const chocs = [];
  installerWebNatif({ W, prefs: () => ({ haptique: false }), charger: { haptics: async () => ({ Haptics: { impact: async (o) => chocs.push(o) } }) } });
  W.navigator.vibrate(200); await attendre(30); assert.equal(chocs.length, 0);
  const W2 = fenetre(); const v2 = W2.navigator.vibrate;
  const r = installerWebNatif({ W: W2, prefs: () => ({ webNatif: false }) });
  assert.deepEqual(r.faits, []); assert.equal(W2.navigator.vibrate, v2);
});

test('devicemotion : un ploxion qui écoute démarre CoreMotion et reçoit des m/s² ; le dernier parti l\'arrête', async () => {
  const W = fenetre(); const appels = []; let emettre = null;
  const apple = { addListener: async (n, f) => { emettre = f; return { remove: async () => { emettre = null; } }; }, mouvementDebut: async (o) => appels.push(['debut', o.hz]), mouvementFin: async () => appels.push(['fin']), ecranEveille: async () => ({}) };
  installerWebNatif({ W, apple });
  assert.equal(await W.DeviceMotionEvent.requestPermission(), 'granted');
  const recus = []; const f = (e) => recus.push(e);
  W.addEventListener('devicemotion', f); await attendre();
  assert.deepEqual(appels, [['debut', 30]]);
  emettre({ gx: 0, gy: -1, gz: 0, ax: 0, ay: 0, az: 0, rx: 0, ry: 0, rz: 0, roll: 0, pitch: Math.PI / 2, yaw: 0 });
  assert.equal(recus.length, 1); assert.ok(Math.abs(recus[0].accelerationIncludingGravity.y + 9.80665) < 1e-6);
  W.removeEventListener('devicemotion', f); await attendre();
  assert.deepEqual(appels.at(-1), ['fin']);
});
