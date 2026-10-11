// Les SONDES du banc iPhone 🧪 : chaque possibilité de l'appareil, essayée pour de vrai.
// Une sonde = { id, groupe, nom, quand: 'auto' | 'toucher', fn(ctx) → { etat, detail } }
//   etat : 'ok' (ça marche) · 'partiel' · 'non' (absent de cet appareil / de la WebView) · 'refuse' (permission refusée) · 'erreur'
//   'auto'    tourne au lancement du banc : jamais de réseau, jamais de permission (le mode avion reste propre)
//   'toucher' ne tourne que si on la touche : permissions (caméra, micro, position, mouvement, notifications) ou réseau
// ctx = { W, boxion, natif: () => Capacitor natif ?, plugin(nom) → le module @capacitor/<nom> chargé à la demande }

const ok = (detail = '') => ({ etat: 'ok', detail: String(detail) });
const non = (detail = 'absent') => ({ etat: 'non', detail: String(detail) });
const partiel = (detail) => ({ etat: 'partiel', detail: String(detail) });
const a = (W, chemin) => chemin.split('.').reduce((o, k) => (o == null ? undefined : o[k]), W);
const existe = (W, chemin, nom) => ({ id: 'api-' + chemin.replace(/\W+/g, '-'), groupe: 'système', nom: nom || chemin, quand: 'auto', fn: () => (a(W, chemin) !== undefined ? ok('présent') : non()) });
const ms = (t0) => Math.round(performance.now() - t0) + ' ms';

export function sondes(W) {
  const N = W.navigator || {};
  return [
    // ---- l'appareil -------------------------------------------------------------------------------------------------------------------------
    { id: 'env-appareil', groupe: 'appareil', nom: 'Appareil et système', quand: 'auto', fn: async (c) => {
      if (c.natif()) { const { Device } = await c.plugin('device'); const i = await Device.getInfo(); return ok(`${i.manufacturer} ${i.model} · ${i.operatingSystem} ${i.osVersion} · WebView ${i.webViewVersion}${i.isVirtual ? ' (simulateur)' : ''}`); }
      return partiel('web : ' + (N.userAgent || '?').slice(0, 120));
    } },
    { id: 'env-batterie', groupe: 'appareil', nom: 'Batterie', quand: 'auto', fn: async (c) => {
      if (!c.natif()) return non('natif seulement');
      const { Device } = await c.plugin('device'); const b = await Device.getBatteryInfo();
      return ok(`${Math.round((b.batteryLevel ?? 0) * 100)} %${b.isCharging ? ', en charge' : ''}`);
    } },
    { id: 'env-ecran', groupe: 'appareil', nom: 'Écran', quand: 'auto', fn: () => {
      const s = W.screen || {}, cs = W.getComputedStyle ? W.getComputedStyle(W.document.documentElement) : null;
      return ok(`${s.width}×${s.height} pt · ×${W.devicePixelRatio} · fenêtre ${W.innerWidth}×${W.innerHeight}${cs ? ' · encoche ' + (cs.getPropertyValue('--sat') || 'safe-area via CSS') : ''}`);
    } },
    { id: 'env-langue', groupe: 'appareil', nom: 'Langue, fuseau, format', quand: 'auto', fn: () => ok(`${N.language} · ${Intl.DateTimeFormat().resolvedOptions().timeZone} · ${new Intl.NumberFormat().format(1234.5)}`) },
    { id: 'env-reseau', groupe: 'appareil', nom: 'État du réseau', quand: 'auto', fn: async (c) => {
      if (c.natif()) { const { Network } = await c.plugin('network'); const s = await Network.getStatus(); return ok(`${s.connected ? 'connecté' : 'hors ligne'} (${s.connectionType})`); }
      return ok(N.onLine ? 'en ligne' : 'hors ligne');
    } },

    // ---- le stockage --------------------------------------------------------------------------------------------------------------------------
    { id: 'sto-boxion', groupe: 'stockage', nom: 'boxion_local (le stockage de l\'app)', quand: 'auto', fn: async (c) => {
      const t0 = performance.now(), k = 'sonde-' + Date.now();
      await c.boxion.put('banc', k, { v: 1 }); const lu = await c.boxion.get('banc', k); await c.boxion.del('banc', k);
      const r = await c.boxion.append('banc', { kind: 'sonde' });
      return lu && lu.v === 1 && r.seq > 0 ? ok(`${c.boxion.impl} · écrire, lire, effacer, journaliser en ${ms(t0)}`) : { etat: 'erreur', detail: 'lecture différente de l\'écriture' };
    } },
    { id: 'sto-volume', groupe: 'stockage', nom: 'boxion_local : 1 000 écritures', quand: 'toucher', fn: async (c) => {
      const t0 = performance.now(); for (let i = 0; i < 1000; i++) await c.boxion.put('banc-volume', 'k' + i, { i, x: 'x'.repeat(100) });
      const t1 = performance.now(); for (let i = 0; i < 1000; i++) await c.boxion.del('banc-volume', 'k' + i);
      return ok(`1 000 écritures en ${Math.round(t1 - t0)} ms, effacées en ${ms(t1)}`);
    } },
    { id: 'sto-localstorage', groupe: 'stockage', nom: 'localStorage (miroir dans boxion_local)', quand: 'auto', fn: async (c) => {
      W.localStorage.setItem('jos:banc', '1'); await new Promise(r => setTimeout(r, 30));
      const m = await c.boxion.get('localStorage', 'jos:banc'); W.localStorage.removeItem('jos:banc');
      return m === '1' ? ok('écrit et recopié') : partiel('écrit, mais pas recopié');
    } },
    { id: 'sto-indexeddb', groupe: 'stockage', nom: 'IndexedDB', quand: 'auto', fn: () => (W.indexedDB ? ok('présent') : non()) },
    { id: 'sto-estimation', groupe: 'stockage', nom: 'Quota et persistance du stockage web', quand: 'auto', fn: async () => {
      if (!N.storage || !N.storage.estimate) return non();
      const e = await N.storage.estimate(); const p = N.storage.persisted ? await N.storage.persisted() : null;
      return ok(`${Math.round((e.usage || 0) / 1024)} Ko utilisés sur ${Math.round((e.quota || 0) / 1048576)} Mo${p === null ? '' : p ? ', persistant' : ', purgeable'}`);
    } },
    { id: 'sto-fichiers', groupe: 'stockage', nom: 'Fichiers natifs (dossier Documents)', quand: 'auto', fn: async (c) => {
      if (!c.natif()) return non('natif seulement');
      const { Filesystem, Directory, Encoding } = await c.plugin('filesystem');
      await Filesystem.writeFile({ path: 'banc.txt', data: 'ploxi0n', directory: Directory.Documents, encoding: Encoding.UTF8 });
      const r = await Filesystem.readFile({ path: 'banc.txt', directory: Directory.Documents, encoding: Encoding.UTF8 });
      await Filesystem.deleteFile({ path: 'banc.txt', directory: Directory.Documents });
      return r.data === 'ploxi0n' ? ok('écrire, lire, effacer') : { etat: 'erreur', detail: 'contenu différent' };
    } },
    { id: 'sto-preferences', groupe: 'stockage', nom: 'Préférences natives', quand: 'auto', fn: async (c) => {
      if (!c.natif()) return non('natif seulement');
      const { Preferences } = await c.plugin('preferences'); await Preferences.set({ key: 'banc', value: '1' });
      const v = (await Preferences.get({ key: 'banc' })).value; await Preferences.remove({ key: 'banc' });
      return v === '1' ? ok('écrire, lire') : { etat: 'erreur', detail: 'lecture vide' };
    } },

    // ---- le calcul ----------------------------------------------------------------------------------------------------------------------------
    { id: 'cal-wasm', groupe: 'calcul', nom: 'WebAssembly (les ploxions WASM, plus tard)', quand: 'auto', fn: async () => {
      if (!W.WebAssembly) return non();
      // (module) (func (export "add") (param i32 i32) (result i32) local.get 0 local.get 1 i32.add)
      const octets = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 7, 1, 96, 2, 127, 127, 1, 127, 3, 2, 1, 0, 7, 7, 1, 3, 97, 100, 100, 0, 0, 10, 9, 1, 7, 0, 32, 0, 32, 1, 106, 11]);
      const { instance } = await W.WebAssembly.instantiate(octets);
      return instance.exports.add(20, 22) === 42 ? ok('compilé et exécuté (20 + 22 = 42)') : { etat: 'erreur', detail: 'mauvais résultat' };
    } },
    { id: 'cal-wasm-simd', groupe: 'calcul', nom: 'WebAssembly SIMD', quand: 'auto', fn: () => {
      // (module (func (result v128) i32.const 0 i8x16.splat))
      const o = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 8, 1, 6, 0, 65, 0, 253, 15, 11]);   // (corrigé 11.10 : l'ancien « drop » rendait le module invalide partout)
      try { return W.WebAssembly && W.WebAssembly.validate(o) ? ok('validé') : non(); } catch (e) { return non(e.message); }
    } },
    { id: 'cal-threads', groupe: 'calcul', nom: 'Mémoire partagée (threads WASM)', quand: 'auto', fn: () => (W.crossOriginIsolated && typeof SharedArrayBuffer !== 'undefined' ? ok('isolé, SharedArrayBuffer') : non('pas d\'isolation cross-origin')) },
    { id: 'cal-worker', groupe: 'calcul', nom: 'Web Workers', quand: 'auto', fn: () => new Promise((res) => {
      try {
        const u = URL.createObjectURL(new Blob(['onmessage=e=>postMessage(e.data*2)'], { type: 'text/javascript' }));
        const w = new W.Worker(u); const fin = setTimeout(() => { w.terminate(); URL.revokeObjectURL(u); res(non('pas de réponse')); }, 2000);
        w.onmessage = (e) => { clearTimeout(fin); w.terminate(); URL.revokeObjectURL(u); res(e.data === 42 ? ok('aller-retour') : partiel('réponse inattendue')); };
        w.postMessage(21);
      } catch (e) { res(non(e.message)); }
    }) },
    { id: 'cal-webgl2', groupe: 'calcul', nom: 'WebGL 2 (3D)', quand: 'auto', fn: () => {
      const cv = W.document.createElement('canvas'), g = cv.getContext && cv.getContext('webgl2');
      if (!g || !g.getParameter) return non();
      const dbg = g.getExtension && g.getExtension('WEBGL_debug_renderer_info');
      return ok(dbg ? g.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'présent');
    } },
    { id: 'cal-webgpu', groupe: 'calcul', nom: 'WebGPU (Bevy web, calcul GPU)', quand: 'auto', fn: async () => {
      if (!N.gpu) return non();
      const ad = await N.gpu.requestAdapter(); return ad ? ok('adaptateur ' + ((ad.info && (ad.info.vendor || ad.info.architecture)) || 'disponible')) : partiel('API présente, aucun adaptateur');
    } },
    { id: 'cal-offscreen', groupe: 'calcul', nom: 'OffscreenCanvas', quand: 'auto', fn: () => (W.OffscreenCanvas ? ok('présent') : non()) },
    { id: 'cal-crypto', groupe: 'calcul', nom: 'Crypto (SHA-256, clés)', quand: 'auto', fn: async () => {
      const h = await W.crypto.subtle.digest('SHA-256', new TextEncoder().encode('ploxi0n'));
      const k = await W.crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
      let ed = 'non'; try { await W.crypto.subtle.generateKey({ name: 'Ed25519' }, false, ['sign']); ed = 'oui'; } catch (e) { /* */ }
      return ok(`SHA-256 ${new Uint8Array(h)[0].toString(16)}… · ECDSA P-256 ${k.privateKey ? 'oui' : '?'} · Ed25519 ${ed}`);
    } },
    { id: 'cal-perf', groupe: 'calcul', nom: 'Vitesse JS (1 M d\'opérations)', quand: 'auto', fn: () => { const t0 = performance.now(); let s = 0; for (let i = 0; i < 1e6; i++) s += Math.sqrt(i); return ok(`${ms(t0)} (${Math.round(s)})`); } },

    // ---- les médias ---------------------------------------------------------------------------------------------------------------------------
    { id: 'med-audio', groupe: 'médias', nom: 'Web Audio (synthèse, musique)', quand: 'auto', fn: async () => {
      const C = W.AudioContext || W.webkitAudioContext; if (!C) return non();
      const ctx = new C(); const r = ctx.sampleRate; await ctx.close(); return ok(`${r} Hz`);
    } },
    { id: 'med-son', groupe: 'médias', nom: 'Jouer un son', quand: 'toucher', fn: async () => {
      const C = W.AudioContext || W.webkitAudioContext; if (!C) return non();
      const ctx = new C(), o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 440; g.gain.value = 0.15;
      o.connect(g).connect(ctx.destination); o.start(); await new Promise(r => setTimeout(r, 400)); o.stop(); await ctx.close();
      return ok('la 440 Hz, 0,4 s (l\'as-tu entendu ? le bouton silencieux coupe le son)');
    } },
    { id: 'med-voix', groupe: 'médias', nom: 'Synthèse vocale', quand: 'toucher', fn: () => new Promise((res) => {
      if (!W.speechSynthesis) return res(non());
      const v = W.speechSynthesis.getVoices().filter(x => /^fr/.test(x.lang));
      const u = new W.SpeechSynthesisUtterance('ploxi0n parle.'); u.lang = 'fr-FR';
      u.onend = () => res(ok(`${v.length} voix françaises`)); u.onerror = (e) => res({ etat: 'erreur', detail: e.error });
      W.speechSynthesis.speak(u); setTimeout(() => res(partiel('pas de fin signalée')), 5000);
    }) },
    { id: 'med-reconnaissance', groupe: 'médias', nom: 'Reconnaissance vocale', quand: 'auto', fn: () => (W.SpeechRecognition || W.webkitSpeechRecognition ? partiel('API présente (à essayer : demande le micro)') : non()) },
    { id: 'med-micro', groupe: 'médias', nom: 'Microphone', quand: 'toucher', fn: async () => {
      if (!N.mediaDevices || !N.mediaDevices.getUserMedia) return non();
      try { const s = await N.mediaDevices.getUserMedia({ audio: true }); const t = s.getAudioTracks()[0]; const l = t.label; s.getTracks().forEach(x => x.stop()); return ok(l || 'micro ouvert puis fermé'); }
      catch (e) { return { etat: /NotAllowed/.test(e.name) ? 'refuse' : 'erreur', detail: e.name + ' ' + e.message }; }
    } },
    { id: 'med-camera-web', groupe: 'médias', nom: 'Caméra en direct (getUserMedia)', quand: 'toucher', fn: async () => {
      if (!N.mediaDevices || !N.mediaDevices.getUserMedia) return non();
      try { const s = await N.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); const st = s.getVideoTracks()[0].getSettings(); s.getTracks().forEach(x => x.stop()); return ok(`${st.width}×${st.height}`); }
      catch (e) { return { etat: /NotAllowed/.test(e.name) ? 'refuse' : 'erreur', detail: e.name + ' ' + e.message }; }
    } },
    { id: 'med-photo', groupe: 'médias', nom: 'Prendre une photo (natif)', quand: 'toucher', fn: async (c) => {
      if (!c.natif()) return non('natif seulement');
      const { Camera, CameraResultType, CameraSource } = await c.plugin('camera');
      try { const p = await Camera.getPhoto({ resultType: CameraResultType.Uri, source: CameraSource.Prompt, quality: 70 }); return ok(`photo ${p.format}`); }
      catch (e) { return { etat: /denied|permission/i.test(e.message) ? 'refuse' : 'erreur', detail: e.message }; }
    } },
    { id: 'med-enregistreur', groupe: 'médias', nom: 'MediaRecorder (enregistrer audio/vidéo)', quand: 'auto', fn: () => {
      if (!W.MediaRecorder) return non();
      const t = ['audio/mp4', 'audio/webm', 'video/mp4', 'video/webm'].filter(x => W.MediaRecorder.isTypeSupported && W.MediaRecorder.isTypeSupported(x));
      return t.length ? ok(t.join(', ')) : partiel('aucun format annoncé');
    } },

    // ---- les capteurs -------------------------------------------------------------------------------------------------------------------------
    { id: 'cap-position', groupe: 'capteurs', nom: 'Position (GPS)', quand: 'toucher', fn: async (c) => {
      if (c.natif()) {
        const { Geolocation } = await c.plugin('geolocation');
        try { const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 }); return ok(`précision ${Math.round(p.coords.accuracy)} m`); }
        catch (e) { return { etat: /denied|permission/i.test(e.message) ? 'refuse' : 'erreur', detail: e.message }; }
      }
      if (!N.geolocation) return non();
      return new Promise((res) => N.geolocation.getCurrentPosition((p) => res(ok(`précision ${Math.round(p.coords.accuracy)} m`)), (e) => res({ etat: e.code === 1 ? 'refuse' : 'erreur', detail: e.message }), { timeout: 15000 }));
    } },
    { id: 'cap-mouvement', groupe: 'capteurs', nom: 'Accéléromètre et gyroscope', quand: 'toucher', fn: async () => {
      const D = W.DeviceMotionEvent; if (!D) return non();
      if (typeof D.requestPermission === 'function') { const p = await D.requestPermission(); if (p !== 'granted') return { etat: 'refuse', detail: p }; }
      return new Promise((res) => {
        const h = (e) => { W.removeEventListener('devicemotion', h); const g = e.accelerationIncludingGravity || {}; res(ok(`a = ${[g.x, g.y, g.z].map(v => (v || 0).toFixed(1)).join(', ')} m/s²${e.rotationRate ? ' · gyroscope' : ''}`)); };
        W.addEventListener('devicemotion', h); setTimeout(() => { W.removeEventListener('devicemotion', h); res(partiel('aucune mesure en 2 s')); }, 2000);
      });
    } },
    { id: 'cap-orientation', groupe: 'capteurs', nom: 'Boussole et orientation', quand: 'toucher', fn: async () => {
      const D = W.DeviceOrientationEvent; if (!D) return non();
      if (typeof D.requestPermission === 'function') { const p = await D.requestPermission(); if (p !== 'granted') return { etat: 'refuse', detail: p }; }
      return new Promise((res) => {
        const h = (e) => { W.removeEventListener('deviceorientation', h); res(ok(`cap ${e.webkitCompassHeading != null ? Math.round(e.webkitCompassHeading) + '°' : '?'} · inclinaison ${Math.round(e.beta || 0)}°`)); };
        W.addEventListener('deviceorientation', h); setTimeout(() => { W.removeEventListener('deviceorientation', h); res(partiel('aucune mesure en 2 s')); }, 2000);
      });
    } },
    { id: 'cap-vibration', groupe: 'capteurs', nom: 'Vibration (haptique natif)', quand: 'toucher', fn: async (c) => {
      if (c.natif()) { const { Haptics, ImpactStyle } = await c.plugin('haptics'); await Haptics.impact({ style: ImpactStyle.Heavy }); await Haptics.notification({ type: 'SUCCESS' }); return ok('impact + notification (l\'as-tu senti ?)'); }
      return N.vibrate ? (N.vibrate(200) ? ok('navigator.vibrate') : partiel('refusé')) : non();
    } },
    { id: 'cap-lumiere', groupe: 'capteurs', nom: 'Capteur de lumière', quand: 'auto', fn: () => (W.AmbientLightSensor ? ok('présent') : non('pas d\'accès public sur iOS (bion.lux reste une estimation)')) },
    { id: 'cap-nfc', groupe: 'capteurs', nom: 'NFC', quand: 'auto', fn: () => (W.NDEFReader ? ok('Web NFC') : non('pas dans la WebView : capability « NFC Tag Reading » + plugin natif')) },
    { id: 'cap-bluetooth', groupe: 'capteurs', nom: 'Bluetooth', quand: 'auto', fn: () => (N.bluetooth ? ok('Web Bluetooth') : non('pas dans la WebView : plugin natif (ex. capacitor-community/bluetooth-le)')) },

    // ---- le système ---------------------------------------------------------------------------------------------------------------------------
    { id: 'sys-notif', groupe: 'système', nom: 'Notifications locales (réveil, rappels, hors ligne)', quand: 'toucher', fn: async (c) => {
      if (!c.natif()) return W.Notification ? partiel('API web ' + W.Notification.permission) : non();
      const { LocalNotifications } = await c.plugin('local-notifications');
      const p = await LocalNotifications.requestPermissions(); if (p.display !== 'granted') return { etat: 'refuse', detail: p.display };
      await LocalNotifications.schedule({ notifications: [{ id: 4242, title: 'ploxi0n', body: 'Le banc t\'envoie une notification, réseau coupé ou pas.', schedule: { at: new Date(Date.now() + 5000) } }] });
      return ok('programmée dans 5 s : verrouille le téléphone pour la voir');
    } },
    { id: 'sys-partage', groupe: 'système', nom: 'Partager (feuille de partage iOS)', quand: 'toucher', fn: async (c) => {
      if (c.natif()) { const { Share } = await c.plugin('share'); const r = await Share.canShare(); if (!r.value) return non(); await Share.share({ title: 'ploxi0n', text: 'Partagé depuis le banc ploxi0n' }); return ok('feuille ouverte'); }
      return N.share ? (await N.share({ text: 'ploxi0n' }), ok('Web Share')) : non();
    } },
    { id: 'sys-presse-papier', groupe: 'système', nom: 'Presse-papier', quand: 'toucher', fn: async (c) => {
      if (c.natif()) { const { Clipboard } = await c.plugin('clipboard'); await Clipboard.write({ string: 'ploxi0n' }); const r = await Clipboard.read(); return r.value === 'ploxi0n' ? ok('écrire et relire') : partiel('relu : ' + r.type); }
      return N.clipboard ? (await N.clipboard.writeText('ploxi0n'), ok('écriture')) : non();
    } },
    { id: 'sys-app', groupe: 'système', nom: 'Infos de l\'app et cycle de vie', quand: 'auto', fn: async (c) => {
      if (!c.natif()) return non('natif seulement');
      const { App } = await c.plugin('app'); const i = await App.getInfo(); return ok(`${i.name} ${i.version} (build ${i.build})`);
    } },
    { id: 'sys-orientation', groupe: 'système', nom: 'Verrouiller l\'orientation', quand: 'auto', fn: async (c) => {
      if (!c.natif()) return W.screen && W.screen.orientation ? partiel(W.screen.orientation.type) : non();
      const { ScreenOrientation } = await c.plugin('screen-orientation'); const o = await ScreenOrientation.orientation(); return ok(o.type);
    } },
    { id: 'sys-statut', groupe: 'système', nom: 'Barre d\'état', quand: 'auto', fn: async (c) => {
      if (!c.natif()) return non('natif seulement');
      const { StatusBar } = await c.plugin('status-bar'); const i = await StatusBar.getInfo(); return ok(`${i.visible ? 'visible' : 'cachée'}, style ${i.style}`);
    } },
    { id: 'sys-webauthn', groupe: 'système', nom: 'Passkeys / Face ID (WebAuthn)', quand: 'auto', fn: async () => {
      if (!W.PublicKeyCredential) return non();
      const p = W.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable ? await W.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable() : false;
      return p ? partiel('API présente (dans une app : exige un domaine associé)') : partiel('API présente, pas d\'authentificateur');
    } },
    { id: 'sys-wakelock', groupe: 'système', nom: 'Garder l\'écran allumé', quand: 'auto', fn: () => (N.wakeLock ? ok('Wake Lock') : non()) },
    existe(W, 'navigator.serviceWorker', 'Service Worker'),
    existe(W, 'PaymentRequest', 'Paiements (Payment Request)'),
    existe(W, 'BroadcastChannel', 'BroadcastChannel (entre fenêtres)'),
    existe(W, 'ResizeObserver', 'ResizeObserver'),
    existe(W, 'BarcodeDetector', 'Lecture de QR codes (BarcodeDetector)'),
    existe(W, 'EyeDropper', 'Pipette de couleur'),
    existe(W, 'showOpenFilePicker', 'Accès aux fichiers (File System Access)'),
    existe(W, 'navigator.usb', 'USB'),
    existe(W, 'navigator.serial', 'Port série'),
    { id: 'sys-midi', groupe: 'système', nom: 'MIDI (claviers, contrôleurs)', quand: 'auto', fn: () => (N.requestMIDIAccess ? ok('Web MIDI') : non()) },

    // ---- banc v2 : les capabilities natives (11.10) --------------------------------------------------------------------------------------------
    { id: 'nat-bluetooth', groupe: 'natif', nom: 'Bluetooth LE : appareils autour (ultimate-bluetooth)', quand: 'toucher', fn: async (c) => {
      if (!c.natif()) return non('natif seulement');
      const { BleClient } = await c.plugin('bluetooth-le');
      await BleClient.initialize({ androidNeverForLocation: true });
      const vus = new Map();
      await BleClient.requestLEScan({ allowDuplicates: false }, (r) => { vus.set(r.device.deviceId, (r.localName || r.device.name || '?') + (r.rssi != null ? ' ' + r.rssi + ' dBm' : '')); });
      await new Promise(r => setTimeout(r, 5000)); await BleClient.stopLEScan();
      return vus.size ? ok(`${vus.size} appareils en 5 s : ${[...vus.values()].slice(0, 6).join(' · ')}`) : partiel('aucun appareil en 5 s');
    } },
    { id: 'nat-sante', groupe: 'natif', nom: 'HealthKit : pas du jour et sommeil (lecture seule)', quand: 'toucher', fn: async (c) => {
      if (!c.natif()) return non('natif seulement');
      const { Health } = await c.plugin('health');
      const dispo = await Health.isAvailable(); if (!dispo.available) return non(dispo.reason || 'HealthKit indisponible');
      await Health.requestAuthorization({ read: ['steps', 'heartRate', 'sleep'] });
      const debut = new Date(); debut.setHours(0, 0, 0, 0);
      const a = await Health.queryAggregated({ dataType: 'steps', startDate: debut.toISOString(), endDate: new Date().toISOString(), bucket: 'day', aggregation: 'sum' });
      const pas = (a.samples || []).reduce((t, x) => t + (x.value ?? (x.values && x.values.sum) ?? 0), 0);
      return ok(`${Math.round(pas)} pas aujourd'hui (Apple Santé ne dit pas si la lecture est refusée : 0 peut vouloir dire « refusé »)`);
    } },
    { id: 'nat-nfc', groupe: 'natif', nom: 'NFC : lire un tag (approche un tag NFC du haut de l\'iPhone)', quand: 'toucher', fn: async (c) => {
      if (!c.natif()) return non('natif seulement');
      const { CapacitorNfc } = await c.plugin('nfc');
      const sup = await CapacitorNfc.isSupported(); if (!sup.supported) return non('NFC non supporté');
      return new Promise(async (res) => {
        const h = []; const fin = (r) => { h.forEach(x => x.remove()); CapacitorNfc.stopScanning().catch(() => {}); res(r); };
        h.push(await CapacitorNfc.addListener('nfcEvent', (e) => fin(ok('tag lu : ' + JSON.stringify(e.tag || e).slice(0, 140)))));
        h.push(await CapacitorNfc.addListener('nfcSessionEnd', () => fin(partiel('session fermée sans tag'))));
        await CapacitorNfc.startScanning({ alertMessage: 'Approche un tag NFC du haut de l\'iPhone' });
        setTimeout(() => fin(partiel('aucun tag en 30 s')), 30000);
      });
    } },
    { id: 'nat-wifi', groupe: 'natif', nom: 'Nom du réseau Wi-Fi (demande la position)', quand: 'toucher', fn: async (c) => {
      if (!c.natif()) return non('natif seulement');
      const { Geolocation } = await c.plugin('geolocation'); await Geolocation.requestPermissions();
      const { CapacitorWifi } = await c.plugin('wifi');
      const r = await CapacitorWifi.getSsid(); return r && r.ssid ? ok('réseau : ' + r.ssid) : partiel('pas de Wi-Fi (ou nom masqué)');
    } },
    { id: 'nat-voix', groupe: 'natif', nom: 'Voix native (synthèse iOS)', quand: 'toucher', fn: async (c) => {
      if (!c.natif()) return non('natif seulement');
      const { TextToSpeech } = await c.plugin('text-to-speech');
      const l = (await TextToSpeech.getSupportedLanguages()).languages || [];
      await TextToSpeech.speak({ text: 'ploxi0n parle, même sans réseau.', lang: 'fr-FR', rate: 1.0 });
      return ok(`${l.filter(x => /^fr/.test(x)).length} langues françaises sur ${l.length}`);
    } },
    { id: 'nat-raccourcis', groupe: 'natif', nom: 'Raccourcis sur l\'icône (appui long sur ploxi0n)', quand: 'toucher', fn: async (c) => {
      if (!c.natif()) return non('natif seulement');
      const { AppShortcuts } = await c.plugin('app-shortcuts');
      await AppShortcuts.set({ shortcuts: [{ id: 'banc', title: 'Banc iPhone', description: 'tester l\'appareil' }, { id: 'accueil', title: 'Mes ploxions', description: 'l\'accueil' }] });
      return ok('posés : appuie longuement sur l\'icône de ploxi0n');
    } },
    { id: 'nat-qr', groupe: 'natif', nom: 'Lire un QR code (caméra + jsQR, hors ligne)', quand: 'toucher', fn: async (c) => {
      const N = W.navigator; if (!N.mediaDevices || !N.mediaDevices.getUserMedia) return non();
      const jsQR = (await c.plugin('jsqr')).default;
      const flux = await N.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const v = W.document.createElement('video'); v.playsInline = true; v.muted = true; v.srcObject = flux; await v.play();
      const cv = W.document.createElement('canvas'), g = cv.getContext('2d', { willReadFrequently: true });
      const t0 = Date.now();
      try {
        while (Date.now() - t0 < 15000) {
          await new Promise(r => setTimeout(r, 200));
          cv.width = v.videoWidth; cv.height = v.videoHeight; if (!cv.width) continue;
          g.drawImage(v, 0, 0); const img = g.getImageData(0, 0, cv.width, cv.height);
          const code = jsQR(img.data, img.width, img.height); if (code) return ok('QR : ' + code.data.slice(0, 140));
        }
        return partiel('aucun QR vu en 15 s (vise un QR code avec la caméra arrière)');
      } finally { flux.getTracks().forEach(x => x.stop()); }
    } },
    { id: 'fid-dispo', groupe: 'natif', nom: 'Face ID disponible', quand: 'auto', fn: async () => {
      const v = W.jOSVerrou; if (!v) return non('jOSVerrou absent'); const d = await v.dispo();
      return d.ok ? ok(d.type === 'faceid' ? 'Face ID' : d.type === 'touchid' ? 'Touch ID' : 'code de l\'iPhone') : non(d.type ? 'biométrie non configurée' : 'natif seulement');
    } },
    { id: 'fid-ouvrir', groupe: 'natif', nom: 'Face ID : te reconnaître', quand: 'toucher', fn: async () => (W.jOSVerrou && await W.jOSVerrou.ouvrir('Le banc vérifie Face ID') ? ok('reconnu') : { etat: 'refuse', detail: 'non reconnu ou annulé' }) },
    { id: 'fid-coffre', groupe: 'natif', nom: 'Face ID : un secret qui ne sort qu\'avec ton visage', quand: 'toucher', fn: async () => {
      const v = W.jOSVerrou; if (!v || !(await v.dispo()).ok) return non('Face ID indisponible');
      const a = new Uint8Array(8); W.crypto.getRandomValues(a); const secret = Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
      await v.garder('banc', secret);
      const lu = await v.lire('banc', 'Le banc relit un secret protégé par Face ID');
      await v.oublier('banc');
      return lu === secret ? ok('rangé dans le trousseau, relu après Face ID, puis effacé') : { etat: 'refuse', detail: lu === null ? 'Face ID refusé : le secret reste fermé' : 'secret différent' };
    } },
    { id: 'nat-protection', groupe: 'natif', nom: 'Data Protection (base chiffrée par iOS)', quand: 'auto', fn: async (c) => (c.natif() ? ok('entitlement « Complete » : boxion_local est chiffré quand l\'iPhone est verrouillé') : non('natif seulement')) },
    // ---- le réseau (seulement si on touche : le banc respecte le mode avion) ---------------------------------------------------------------------
    { id: 'res-https', groupe: 'réseau', nom: 'Joindre Internet (HTTPS)', quand: 'toucher', fn: async () => {
      const t0 = performance.now(); try { const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=46.7&longitude=6.4&current=temperature_2m'); const d = await r.json(); return ok(`open-meteo : ${d.current && d.current.temperature_2m} °C en ${ms(t0)}`); }
      catch (e) { return { etat: 'erreur', detail: e.message }; }
    } },
    { id: 'res-ws', groupe: 'réseau', nom: 'WebSocket', quand: 'toucher', fn: () => new Promise((res) => {
      try { const ws = new W.WebSocket('wss://echo.websocket.org'); const fin = setTimeout(() => { try { ws.close(); } catch (e) { /* */ } res(partiel('pas d\'écho en 5 s')); }, 5000); ws.onmessage = (m) => { if (String(m.data).includes('ploxi0n')) { clearTimeout(fin); ws.close(); res(ok('écho reçu')); } }; ws.onopen = () => ws.send('ploxi0n'); ws.onerror = () => { clearTimeout(fin); res({ etat: 'erreur', detail: 'connexion refusée' }); }; }
      catch (e) { res(non(e.message)); }
    }) },
    { id: 'res-webrtc', groupe: 'réseau', nom: 'WebRTC (appels, pair à pair)', quand: 'auto', fn: () => (W.RTCPeerConnection ? ok('présent') : non()) },
  ];
}
