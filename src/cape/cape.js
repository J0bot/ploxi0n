// 🥼 LABO-CAPE DANS PLOXI0N (0.50, lot L1 de J0bot/labo-cape ; RS-7 : « je veux la contrôler avec l'application ploxion »). Un ploxion
// interne qui pilote la blouse chauffante RS-7 : vue live (température, duty, état de chaque zone ; puissance, budget, autonomie ; la
// couleur des LEDs), commandes (consigne, marche/arrêt par zone, LEDs), journal, enregistrement de la session.
//   SOURCES : la vraie blouse en BLE (le contrat : labo-cape docs/BLE.md, repris ci-dessous) — ou la SIMULATION, faite avec le moteur de
//   cape-core (cape-engine.js, vérifié contre la trace du Rust) : utilisable dès aujourd'hui, sans blouse.
//   SÉCURITÉ (labo-cape docs/SECURITE.md, contractuel) : consigne max 42 °C (écrêtée ici ET par le firmware), coupure 45 °C verrouillée
//   jusqu'à 40 °C (dans le régulateur). L'app ne fait que demander : la blouse décide.
//   BUS : chaque message est republié sur jOSPorts (« cape », topic complet cape.<id>.…) pour les autres ploxions (santé, avatar…).
//   SILENCE (le manifeste) : démonté = BLE fermé, simulation arrêtée, aucune tâche de fond ; la blouse continue seule.
import E from './cape-engine.js';
import { BLOUSE_RS7 } from './blouse-rs7.js';

// ---- le contrat BLE (labo-cape docs/BLE.md) ----
export const BLE = {
  SERVICE: 'c4be0001-0b10-4a5e-8c4e-3a7e1ab0c4be',
  BUS: 'c4be0002-0b10-4a5e-8c4e-3a7e1ab0c4be',   // notify : blouse → app
  CMD: 'c4be0003-0b10-4a5e-8c4e-3a7e1ab0c4be',   // write : app → blouse
  PREFIXE: 'labo-cape',                            // le nom annoncé : labo-cape-<id>
};
/** une ligne du bus BLE : {"t":"zone.c1.temp","p":{"c":37.9}} (sans le préfixe cape.<id>.) */
export const ligne = (t, p) => JSON.stringify({ t, p }) + '\n';
/** découpe un flux de fragments en lignes complètes ; rend [lignes, reste] */
export function decouper(tampon) { const l = tampon.split('\n'); const reste = l.pop(); return [l.filter(Boolean), reste]; }

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PILE_WH = 37, EFFICACITE = 0.85, ALIM_W = 10, AMBIANTE = 12, VENT = 0.2;   // 10 000 mAh × 3,7 V ; une batterie USB 5 V 2 A

/** la blouse simulée : le régulateur et la thermique de cape-core, en accéléré */
export function creerSimulation({ layout = BLOUSE_RS7, vitesse = 20 } = {}) {
  const chauffes = layout.components.filter(c => c.kind === 'heater').map(c => ({ ...c, node: new E.Node('panel', 20), pi: new E.Pi(), sp: 38, on: true, duty: 0, state: 'idle' }));
  const capteurs = layout.components.filter(c => c.kind === 'ntc').map(c => ({ ...c, node: new E.Node('exposed', 20) }));
  const leds = layout.components.filter(c => c.kind === 'led');
  let led = { mode: 'temp', bright: 0.25 }, wh = 0;
  const tout = () => [...chauffes, ...capteurs];
  return {
    id: 'sim', nom: 'blouse simulée',
    /** dt secondes simulées ; rend les messages du bus [[topic, payload]] */
    pas(dt = 0.5) {
      const out = [], n = Math.round(vitesse / dt) || 1;
      let w = 0, k = 1;
      for (let i = 0; i < n; i++) {
        const duty = chauffes.map(z => { const [d, st] = z.on ? z.pi.step(E.adcToC(E.cToAdc(z.node.t)), z.sp, dt) : [0, 'off']; z.state = st; return d; });
        const budget = E.heatBudget(ALIM_W, led.mode === 'off' ? 0 : leds.length, led.bright);
        k = E.allocate(duty, chauffes.map(z => z.p_w), budget);
        chauffes.forEach((z, j) => { z.duty = duty[j]; z.node.step(duty[j] * z.p_w, AMBIANTE, VENT, dt); });
        capteurs.forEach(c => c.node.step(0, AMBIANTE, VENT, dt));
        w = chauffes.reduce((a, z) => a + z.duty * z.p_w, 0) + E.P_MCU_W + (led.mode === 'off' ? 0 : leds.length * E.P_LED_FULL_W * led.bright);
        wh += w * dt / 3600;
      }
      for (const z of tout()) out.push(['zone.' + z.id + '.temp', { c: Math.round(z.node.t * 10) / 10 }]);
      for (const z of chauffes) out.push(['zone.' + z.id + '.duty', { d: Math.round(z.duty * 100) / 100, state: z.state }]);
      out.push(['power', { w: Math.round(w * 10) / 10, budget_w: Math.round(E.heatBudget(ALIM_W, led.mode === 'off' ? 0 : leds.length, led.bright) * 10) / 10, k: Math.round(k * 100) / 100, wh_used: Math.round(wh * 100) / 100 }]);
      return out;
    },
    commande(t, p) {
      if (t === 'cmd.setpoint') { const c = Math.min(E.SETPOINT_MAX_C, Math.max(E.T_SKIN_C - 13, +p.c || 0)); for (const z of chauffes) if (p.zone === '*' || p.zone === z.id) z.sp = c; return ['log', 'consigne ' + (p.zone === '*' ? 'partout' : p.zone) + ' → ' + c + ' °C']; }
      if (t === 'cmd.enable') { for (const z of chauffes) if (p.zone === '*' || p.zone === z.id) z.on = !!p.on; return ['log', (p.zone === '*' ? 'tout' : p.zone) + (p.on ? ' allumé' : ' éteint')]; }
      if (t === 'cmd.led') { led = { mode: p.mode || 'temp', bright: Math.min(1, Math.max(0, +p.bright || 0)) }; return ['log', 'LEDs : ' + led.mode + ' ' + Math.round(led.bright * 100) + ' %']; }
      return null;
    },
    fermer() {},
  };
}

/** la vraie blouse, en BLE (Bluetooth LE natif de l'iPhone) */
async function connecterBle({ ble, surMessage, surFin }) {
  const B = await ble();
  await B.initialize({ androidNeverForLocation: true });
  const d = await B.requestDevice({ services: [BLE.SERVICE], namePrefix: BLE.PREFIXE });
  await B.connect(d.deviceId, () => surFin && surFin());
  let tampon = '';
  const dec = new TextDecoder();
  await B.startNotifications(d.deviceId, BLE.SERVICE, BLE.BUS, (v) => {
    tampon += dec.decode(v);
    const [l, reste] = decouper(tampon); tampon = reste;
    for (const x of l) { try { const m = JSON.parse(x); if (m && m.t) surMessage(m.t, m.p); } catch (e) { /* une ligne abîmée : ignorée */ } }
  });
  const id = (d.name || '').replace(/^labo-cape-?/, '') || d.deviceId.slice(-4);
  return {
    id, nom: d.name || 'labo-cape',
    async commande(t, p) {
      const o = new TextEncoder().encode(ligne(t, p));
      for (let i = 0; i < o.length; i += 180) { const x = o.slice(i, i + 180); await B.write(d.deviceId, BLE.SERVICE, BLE.CMD, new DataView(x.buffer, x.byteOffset, x.byteLength)); }
      return null;
    },
    fermer() { B.stopNotifications(d.deviceId, BLE.SERVICE, BLE.BUS).catch(() => {}); B.disconnect(d.deviceId).catch(() => {}); },
  };
}

export function creerCape({ W = globalThis.window, boxion, vibrer = () => {}, ble = () => import('@capacitor-community/bluetooth-le').then(m => m.BleClient), layout = BLOUSE_RS7 } = {}) {
  const D = W.document;
  const noms = Object.fromEntries(layout.components.map(c => [c.id, c.name]));
  const chauffes = layout.components.filter(c => c.kind === 'heater'), capteurs = layout.components.filter(c => c.kind === 'ntc'), leds = layout.components.filter(c => c.kind === 'led');

  function mount(hote) {
    let source = null, minuteur = null, vivant = true, enreg = null, peint = 0;
    const etat = { temp: {}, duty: {}, power: null, logs: [], sp: 38, on: {}, led: { mode: 'temp', bright: 0.25 }, maxT: 0 };
    const topic = (t) => 'cape.' + (source ? source.id : '?') + '.' + t;
    function recevoir(t, p) {
      let m;
      if ((m = /^zone\.(\w+)\.temp$/.exec(t))) { etat.temp[m[1]] = p.c; etat.maxT = Math.max(etat.maxT, +p.c || 0); }
      else if ((m = /^zone\.(\w+)\.duty$/.exec(t))) etat.duty[m[1]] = p;
      else if (t === 'power') etat.power = p;
      else if (t === 'log') { etat.logs.unshift(new Date().toLocaleTimeString('fr-CH') + '  ' + (typeof p === 'string' ? p : JSON.stringify(p))); etat.logs.length = Math.min(etat.logs.length, 40); }
      try { if (W.jOSPorts && W.jOSPorts.emit) W.jOSPorts.emit('cape', topic(t), p); } catch (e) { /* */ }
      if (enreg) { enreg.n++; boxion.append('cape', { session: enreg.id, t: topic(t), p }).catch(() => {}); }
      if (Date.now() - peint > 250) { peint = Date.now(); W.requestAnimationFrame(dessiner); }
    }
    async function commander(t, p) {
      if (!source) return;
      if (t === 'cmd.setpoint') p = { ...p, c: Math.min(E.SETPOINT_MAX_C, +p.c) };   // SECURITE.md : jamais plus de 42 °C
      vibrer('selection');
      try { const r = await source.commande(t, p); if (r) recevoir(r[0], r[1]); else recevoir('log', t + ' ' + JSON.stringify(p)); }
      catch (e) { recevoir('log', '⚠ ' + (e.message || e)); }
    }
    function arreter() { W.clearInterval(minuteur); minuteur = null; if (source) source.fermer(); source = null; }
    function simuler() {
      arreter(); source = creerSimulation({ layout });
      recevoir('log', 'simulation : le moteur de cape-core, ×20');
      minuteur = W.setInterval(() => { if (!vivant || !source || !source.pas) return; for (const [t, p] of source.pas()) recevoir(t, p); }, 1000);
      dessiner();
    }
    async function connecter() {
      arreter();
      try { source = await connecterBle({ ble, surMessage: recevoir, surFin: () => { recevoir('log', 'ᛒ blouse déconnectée'); source = null; dessiner(); } }); vibrer('succes'); recevoir('log', 'ᛒ connecté à ' + source.nom); }
      catch (e) { recevoir('log', '⚠ BLE : ' + (e.message || e) + ' — la simulation en attendant'); simuler(); }
      dessiner();
    }
    async function enregistrer() {
      if (!enreg) { enreg = { id: 's' + Date.now().toString(36), debut: Date.now(), n: 0 }; vibrer('moyen'); }
      else {
        const min = Math.round((Date.now() - enreg.debut) / 60000), p = etat.power || {};
        await boxion.append('tsoins', { kind: 'tsoin', id: enreg.id, genre: 'fait', source: 'labo-cape', d: 'session blouse ' + min + ' min · max ' + etat.maxT + ' °C · ' + (p.wh_used || 0) + ' Wh · ' + enreg.n + ' messages', le: new Date().toISOString() }).catch(() => {});
        recevoir('log', '⏺ session enregistrée (' + enreg.n + ' messages, en tsoin)'); enreg = null; vibrer('succes');
      }
      dessiner();
    }
    const couleur = (t) => { if (t == null) return '#3a3050'; const [r, g, b] = E.rgbFor(t, 1); return 'rgb(' + r + ',' + g + ',' + b + ')'; };
    function dessiner() {
      if (!vivant) return;
      const p = etat.power, auto = p ? E.autonomyH(PILE_WH, EFFICACITE, p.wh_used || 0, p.w || 0) : null;
      hote.innerHTML = '<div class="px-page px-cape"><p class="px-grave">🥼 labo-cape · ' + esc(source ? source.nom : 'pas connectée') + '</p>'
        + (!source ? '<p>La blouse RS-7 : 4 chauffes, 3 capteurs, ' + leds.length + ' LEDs. Connecte-la en Bluetooth, ou essaie la simulation (le vrai moteur de cape-core).</p>' : '')
        + (p ? '<div class="px-cape-puiss"><div><b>' + p.w + ' W</b><small>puissance</small></div><div><b>' + p.budget_w + ' W</b><small>budget' + (p.k < 1 ? ' · ×' + p.k : '') + '</small></div><div><b>' + (auto === Infinity ? '∞' : auto == null ? '—' : auto.toFixed(1) + ' h') + '</b><small>autonomie</small></div><div><b>' + (p.wh_used || 0) + ' Wh</b><small>utilisés</small></div></div>' : '')
        + (source ? '<h3>chauffes · consigne ' + etat.sp + ' °C (max ' + E.SETPOINT_MAX_C + ')</h3><div class="px-cape-zones">' + chauffes.map(z => { const t = etat.temp[z.id], d = etat.duty[z.id] || {}, on = etat.on[z.id] !== false;
            return '<div class="px-cape-z' + (on ? '' : ' off') + '"><i style="background:' + couleur(t) + '"></i><span><b>' + esc(z.name) + '</b><small>' + (t == null ? '—' : t + ' °C') + ' · ' + esc(d.state || '—') + '</small><em style="width:' + Math.round((d.d || 0) * 100) + '%"></em></span><button data-zone="' + z.id + '">' + (on ? 'allumée' : 'éteinte') + '</button></div>'; }).join('') + '</div>'
          + '<div class="px-cape-sp"><button data-sp="-1">−</button><b>' + etat.sp + ' °C</b><button data-sp="1">+</button><button data-tout="0">tout éteindre</button></div>'
          + '<h3>capteurs</h3><div class="px-cape-zones">' + capteurs.map(c => '<div class="px-cape-z"><i style="background:' + couleur(etat.temp[c.id]) + '"></i><span><b>' + esc(c.name) + '</b><small>' + (etat.temp[c.id] == null ? '—' : etat.temp[c.id] + ' °C') + '</small></span></div>').join('') + '</div>'
          + '<h3>LEDs · ' + esc(etat.led.mode) + ' · ' + Math.round(etat.led.bright * 100) + ' %</h3><div class="px-cape-leds">' + leds.map(l => '<i title="' + esc(l.name) + '" style="background:' + (etat.led.mode === 'off' ? '#1a1426' : couleur(etat.temp[l.src])) + '"></i>').join('') + '</div>'
          + '<div class="px-puces"><button class="px-puce' + (etat.led.mode === 'temp' ? ' on' : '') + '" data-led="temp">température</button><button class="px-puce' + (etat.led.mode === 'off' ? ' on' : '') + '" data-led="off">éteintes</button><button class="px-puce" data-lum="-0.1">☀−</button><button class="px-puce" data-lum="0.1">☀+</button></div>'
          + '<h3>journal</h3><pre class="px-cape-log">' + esc(etat.logs.join('\n') || '—') + '</pre>' : '')
        + '<p class="px-sous">Sécurité (contractuelle) : consigne max ' + E.SETPOINT_MAX_C + ' °C, coupure ' + E.T_CUTOFF_C + ' °C verrouillée jusqu\'à ' + E.T_REARM_C + ' °C, dans la blouse elle-même.</p></div>'
        + '<div class="px-journal-bas px-puces"><button class="px-puce" data-a="ble">ᛒ la blouse</button><button class="px-puce' + (source && source.id === 'sim' ? ' on' : '') + '" data-a="sim">simulation</button>'
        + (source ? '<button class="px-puce' + (enreg ? ' on' : '') + '" data-a="enreg">' + (enreg ? '⏹ ' + enreg.n : '⏺ enregistrer') + '</button><button class="px-puce" data-a="stop">✕</button>' : '') + '</div>';
    }
    hote.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const a = b.getAttribute('data-a');
      if (a === 'sim') return simuler(); if (a === 'ble') return connecter(); if (a === 'enreg') return enregistrer(); if (a === 'stop') { arreter(); recevoir('log', 'arrêté'); return dessiner(); }
      if (b.hasAttribute('data-sp')) { etat.sp = Math.min(E.SETPOINT_MAX_C, Math.max(20, etat.sp + +b.getAttribute('data-sp'))); return commander('cmd.setpoint', { zone: '*', c: etat.sp }); }
      if (b.hasAttribute('data-zone')) { const z = b.getAttribute('data-zone'); etat.on[z] = etat.on[z] === false; return commander('cmd.enable', { zone: z, on: etat.on[z] }); }
      if (b.hasAttribute('data-tout')) { for (const z of chauffes) etat.on[z.id] = false; return commander('cmd.enable', { zone: '*', on: false }); }
      if (b.hasAttribute('data-led')) { etat.led.mode = b.getAttribute('data-led'); return commander('cmd.led', { ...etat.led }); }
      if (b.hasAttribute('data-lum')) { etat.led.bright = Math.round(Math.min(1, Math.max(0, etat.led.bright + +b.getAttribute('data-lum'))) * 100) / 100; return commander('cmd.led', { ...etat.led }); }
    });
    dessiner();
    return { unmount() { vivant = false; arreter(); hote.innerHTML = ''; } };   // le silence : BLE fermé, simulation arrêtée
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps.cape = { manifest: { id: 'cape', name: 'labo-cape', icon: '🥼' }, mount };
  return { ploxion: { id: 'cape', nom: 'labo-cape', icone: '🥼', interne: true }, noms };
}
