// Un « ploxion » qui parle le web standard : chaque API doit arriver au natif.
export default async function ({ page, appels, ouvertsBrowser, verrous, eveil }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  const avant = appels.length;
  const r = await page.evaluate(async () => {
    const out = {}; const essai = async (k, f) => { try { const v = await f(); out[k] = v === undefined ? 'ok' : JSON.stringify(v).slice(0, 160); } catch (e) { out[k] = 'ERREUR ' + (e && (e.message || e.name)); } };
    out.etat = JSON.stringify(window.ploxi0nWebNatif.etat());
    await essai('vibrate', () => navigator.vibrate([30, 50, 80]));
    await essai('share', () => navigator.share({ title: 't', text: 'x', url: 'https://xerboxion.org' }));
    await essai('clipboard', async () => { await navigator.clipboard.writeText('salut'); return navigator.clipboard.readText(); });
    await essai('geoloc', () => new Promise((ok, ko) => navigator.geolocation.getCurrentPosition(p => ok(p.coords.latitude), e => ko(new Error(e.message)))));
    await essai('geowatch', () => new Promise((ok) => { const id = navigator.geolocation.watchPosition(p => { navigator.geolocation.clearWatch(id); ok(p.coords.longitude); }, () => ok('erreur')); setTimeout(() => ok('rien reçu'), 2000); }));
    await essai('notification', async () => { const p = await Notification.requestPermission(); const n = new Notification('coucou', { body: 'depuis un ploxion' }); await new Promise(r => setTimeout(r, 200)); return [p, Notification.permission, n.title]; });
    await essai('battery', async () => { const b = await navigator.getBattery(); return [b.level, b.charging]; });
    await essai('speech', () => new Promise((ok, ko) => { const R = window.SpeechRecognition || window.webkitSpeechRecognition; const s = new R(); s.lang = 'fr-FR'; s.onresult = (e) => ok(e.results[0][0].transcript); s.onerror = (e) => ko(new Error(e.error)); s.start(); setTimeout(() => s.stop(), 300); }));
    await essai('motion', () => new Promise((ok) => { DeviceMotionEvent.requestPermission().then(p => { const f = (e) => { window.removeEventListener('devicemotion', f); ok([p, Math.round(e.accelerationIncludingGravity.y * 10) / 10, typeof e.rotationRate.alpha]); }; window.addEventListener('devicemotion', f); }); setTimeout(() => ok('rien reçu'), 2000); }));
    await essai('orientationEvt', () => new Promise((ok) => { window.ondeviceorientation = (e) => { window.ondeviceorientation = null; ok([Math.round(e.beta), Math.round(e.gamma)]); }; setTimeout(() => ok('rien reçu'), 2000); }));
    await essai('lock', () => screen.orientation.lock('landscape'));
    await essai('wakelock', async () => { const s = await navigator.wakeLock.request('screen'); await s.release(); return s.released; });
    await essai('bluetooth', async () => { const d = await navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] }); const g = await d.gatt.connect(); const s = await g.getPrimaryService('heart_rate'); const c = await s.getCharacteristic('heart_rate_measurement'); const v = await c.readValue(); return [d.name, g.connected, s.uuid, v.getUint8(0)]; });
    await essai('barcode', async () => [typeof window.BarcodeDetector, await BarcodeDetector.getSupportedFormats()]);
    await essai('nfc', () => typeof window.NDEFReader);
    await essai('open', () => String(window.open('https://example.org/x', '_blank')));
    await essai('lien', () => { const a = document.createElement('a'); a.href = 'https://example.org/lien'; a.target = '_blank'; document.body.appendChild(a); a.click(); a.remove(); });
    return out;
  });
  await page.waitForTimeout(500);
  r.natifsAppeles = [...new Set(appels.slice(avant).map(x => x.p + '.' + x.m))];
  r.browser = ouvertsBrowser; r.verrous = verrous; r.eveil = eveil;
  return r;
}
