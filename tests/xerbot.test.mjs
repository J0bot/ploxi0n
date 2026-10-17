// 🤖 (0.75) XERB0T · le contrôleur : les adaptateurs (Home Assistant, WLED, ESPHome, Tasmota, Glances, boxion), la découverte, le pont vers le
// bus xerbot v1 du labo (cmd → ack, state), les jetons jamais dans boxion_local, les actions sensibles qui demandent « sûr ? »
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normaliser, lireSSE } from '../src/xerbot/reseau.js';
import { entiteHA, cheminESPHome, entitesESPHome, ADAPTATEURS, familleBonjour, sonder, hex, rgb } from '../src/xerbot/adaptateurs.js';
import { creerControleur, idBus, versActions } from '../src/xerbot/controleur.js';
import { commandeLegacy } from '../src/app/modes.js';
import { page, attendre } from './aide.mjs';

test('⌁ les formes : adresses, SSE, couleurs, la commande legacy du contrat v1', () => {
  assert.equal(normaliser('192.168.1.5', 8123), 'http://192.168.1.5:8123');
  assert.equal(normaliser('http://wled.local/', 80), 'http://wled.local');
  assert.equal(normaliser('homeassistant.local:8123', 8123), 'http://homeassistant.local:8123');
  assert.equal(normaliser('https://ha.exemple.ch', 8123), 'https://ha.exemple.ch', 'https : pas de port ajouté');
  assert.deepEqual(lireSSE(['event: ping', 'data: {"title":"x"}', 'event: state', 'data: {"id":"switch/Relais","value":true}']).map(x => x.event), ['ping', 'state']);
  assert.equal(hex([255, 128, 0]), '#ff8000'); assert.deepEqual(rgb('#ff8000'), [255, 128, 0]);
  assert.deepEqual(commandeLegacy('avance 1.5'), { cmd: 'avance', d: 1.5, src: 'ploxi0n', ts: commandeLegacy('avance 1.5').ts });
  assert.equal(commandeLegacy('tourne 90').deg, 90); assert.equal(commandeLegacy('stop').d, undefined);
});

test('⌂ Home Assistant : une lumière, une serrure (sensible), un thermostat, un capteur', () => {
  const l = entiteHA({ entity_id: 'light.salon', state: 'on', attributes: { friendly_name: 'Salon', brightness: 128, rgb_color: [255, 120, 0], supported_color_modes: ['rgb'] } });
  assert.deepEqual([l.on, l.bri, l.couleur], [true, 50, '#ff7800']); assert.deepEqual(l.actions, ['basculer', 'luminosite', 'couleur']);
  const s = entiteHA({ entity_id: 'lock.porte', state: 'locked', attributes: {} });
  assert.ok(s.sensible); assert.deepEqual(s.actions, ['deverrouiller']);
  const c = entiteHA({ entity_id: 'climate.bureau', state: 'heat', attributes: { current_temperature: 19.5, temperature: 21 } });
  assert.equal(c.valeur, 19.5); assert.equal(c.options.consigne, 21);
  const t = entiteHA({ entity_id: 'sensor.temp', state: '22.4', attributes: { unit_of_measurement: '°C' } });
  assert.deepEqual([t.valeur, t.unite, t.actions.length], ['22.4', '°C', 0]);
  const g = entiteHA({ entity_id: 'cover.garage', state: 'closed', attributes: { device_class: 'garage' } }); assert.ok(g.sensible, 'une porte de garage');
});

test('◉ ESPHome : le flux /events (nouveau et ancien format), les chemins d\'action', () => {
  const l = entitesESPHome(['event: ping', 'data: {"title":"atelier"}',
    'event: state', 'data: {"id":"switch/Relais 1","domain":"switch","name":"Relais 1","state":"ON","value":true}',
    'event: state', 'data: {"id":"sensor-temperature","name":"Température","state":"21.5 °C","value":21.5}',
    'event: state', 'data: {"id":"light/Ruban","domain":"light","name":"Ruban","state":"OFF","brightness":200}',
    'event: state', 'data: {"id":"switch/Relais 1","state":"OFF","value":false}']);
  const r = l.find(x => x.id === 'switch/Relais 1');
  assert.equal(r.on, false, 'le dernier état l\'emporte'); assert.deepEqual(r.actions, ['basculer']);
  assert.equal(l.find(x => x.id === 'sensor-temperature').domaine, 'sensor');
  assert.deepEqual(l.find(x => x.id === 'light/Ruban').actions, ['basculer', 'luminosite']);
  assert.equal(cheminESPHome('switch/Relais 1'), '/switch/Relais%201');
  assert.equal(cheminESPHome('switch-relais_1', 'switch'), '/switch/relais_1');
});

test('✺ WLED, le bus v1 : les états envoyés, les verbes traduits, ce qui va sur le bus', () => {
  assert.deepEqual(ADAPTATEURS.wled.etat('couleur', '#00ff80'), { on: true, seg: [{ col: [[0, 255, 128]] }] });
  assert.deepEqual(ADAPTATEURS.wled.etat('luminosite', 50), { on: true, bri: 128 });
  assert.deepEqual(ADAPTATEURS.wled.etat('basculer'), { on: 't' });
  const e = { id: 'wled', actions: ['basculer', 'luminosite', 'couleur', 'effet', 'preset'], on: true };
  assert.deepEqual(versActions(e, { cmd: 'set', args: { on: false, bri: 255, color: [255, 0, 0], fx: 9 } }), [['basculer'], ['luminosite', 100], ['couleur', '#ff0000'], ['effet', 9]]);
  assert.deepEqual(versActions(e, { cmd: 'set', args: { on: true } }), [], 'déjà allumé : rien');
  assert.deepEqual(versActions(e, { cmd: 'preset', args: { n: 3 } }), [['preset', 3]]);
  assert.equal(idBus({ type: 'ha', id: 'x' }, { id: 'light.salon', actions: ['basculer'] }), 'ha-light.salon');
  assert.equal(idBus({ type: 'ha', id: 'x' }, { id: 'lock.porte', actions: ['basculer'], sensible: true }), null, 'une serrure : jamais sur le bus');
  assert.equal(idBus({ type: 'ha', id: 'x' }, { id: 'sensor.t', actions: [] }), null);
  assert.equal(familleBonjour({ type: '_wled._tcp.', nom: 'WLED-salon' }), 'wled');
  assert.equal(familleBonjour({ type: '_http._tcp.', nom: 'tasmota-1234' }), 'tasmota');
  assert.equal(familleBonjour({ type: '_esphomelib._tcp', nom: 'atelier' }), 'esphome');
});

// un faux réseau local : Home Assistant (jeton « bon »), un WLED, une prise Tasmota, un Pi (Glances), un boxion
function fauxReseau() {
  const appels = [];
  const wled = { state: { on: true, bri: 128, seg: [{ col: [[255, 0, 0]], fx: 0, pal: 0 }] }, info: { name: 'Ruban salon', ver: '0.15.0', leds: { count: 60, pwr: 420 } }, effects: ['Solid', 'Blink', 'RSVD'], palettes: ['Default'] };
  const ha = [{ entity_id: 'light.salon', state: 'on', attributes: { friendly_name: 'Salon', brightness: 255, supported_color_modes: ['brightness'] } }, { entity_id: 'lock.porte', state: 'locked', attributes: { friendly_name: 'Porte' } }, { entity_id: 'sensor.temp', state: '21', attributes: { unit_of_measurement: '°C' } }];
  return {
    appels, wled, natif: () => false,
    async requete({ methode = 'GET', url, entetes = {}, corps }) {
      appels.push({ methode, url, auth: entetes.Authorization, corps });
      const u = new URL(url);
      if (u.port === '8123' && u.hostname === '192.168.1.10') {
        if (u.pathname === '/api/') return { status: entetes.Authorization ? 200 : 401, json: { message: 'API running.' } };
        if (entetes.Authorization !== 'Bearer bon') return { status: 401, json: null };
        if (u.pathname === '/api/states') return { status: 200, json: ha };
        if (u.pathname.startsWith('/api/services/')) { if (u.pathname.endsWith('/toggle')) ha[0].state = ha[0].state === 'on' ? 'off' : 'on'; return { status: 200, json: [] }; }
      }
      if (u.hostname === '10.0.0.7') {
        if (u.pathname === '/json/info') return { status: 200, json: wled.info };
        if (u.pathname === '/json') return { status: 200, json: wled };
        if (u.pathname === '/presets.json') return { status: 200, json: { 0: {}, 1: { n: 'Soirée' } } };
        if (u.pathname === '/json/state' && methode === 'POST') { Object.assign(wled.state, corps.on === 't' ? { on: !wled.state.on } : corps); return { status: 200, json: { success: true } }; }
      }
      if (u.hostname === '10.0.0.8' && u.pathname === '/cm') return { status: 200, json: { Status: { DeviceName: 'Prise', FriendlyName: ['Prise café'] }, StatusSTS: { POWER: 'ON' }, StatusSNS: { ENERGY: { Power: 12 } }, StatusFWR: { Version: '14.0' } } };
      throw new Error('injoignable');
    },
    async flux() { return { lignes: [], statut: 0 }; },
    async chercher() { return []; },
  };
}
function fauxPorts() {
  const ab = [], emis = [];
  return { emis, on: (t, f) => ab.push(f), emit: (id, port, p) => { const topic = 'ploxion.' + id + '.' + port; emis.push([topic, p]); for (const f of ab) f(p, topic); } };
}

test('🤖 le contrôleur : Home Assistant (jeton au trousseau), WLED trouvé seul, le pont du bus xerbot v1', async () => {
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document, reseau = fauxReseau(), ports = fauxPorts(), coffre = new Map();
    const verrou = { garder: async (k, v) => { coffre.set(k, v); }, lire: async (k) => coffre.get(k) || null, oublier: async (k) => { coffre.delete(k); } };
    const c = creerControleur({ W, boxion: p.boxion, reseau, verrou: () => verrou, ports: () => ports, maison: () => null });
    // Home Assistant
    const ha = await c.api.ajouter({ type: 'ha', nom: 'Maison', adresse: '192.168.1.10', jeton: 'bon' });
    assert.equal(coffre.get('xerbot.' + ha.id), 'bon', 'le jeton : dans le trousseau');
    const garde = JSON.stringify(await p.boxion.get('xerbot', 'appareils'));
    assert.ok(!garde.includes('bon"') && !/Bearer/.test(garde), 'jamais dans boxion_local');
    assert.equal(c.api.etat(ha.id).entites.length, 3);
    await c.api.agir(ha.id, 'light.salon', 'basculer');
    const a = reseau.appels.find(x => x.methode === 'POST');
    assert.equal(a.url, 'http://192.168.1.10:8123/api/services/light/toggle'); assert.equal(a.auth, 'Bearer bon'); assert.deepEqual(a.corps, { entity_id: 'light.salon' });
    // WLED, la famille devinée
    const w = await c.api.ajouter({ type: 'auto', adresse: '10.0.0.7' });
    assert.equal(w.type, 'wled'); const e = c.api.etat(w.id).entites[0];
    assert.deepEqual([e.nom, e.on, e.couleur, e.options.effets.map(x => x[1]), e.options.presets], ['Ruban salon', true, '#ff0000', ['Solid', 'Blink'], [[1, 'Soirée']]]);
    // le bus : le state publié, puis une commande v1 → l'action → l'ack
    const dev = 'wled-' + w.id;
    assert.ok(ports.emis.some(([t, x]) => t === 'ploxion.xerbot.' + dev + '.state' && x.online && x.on === true));
    assert.ok(ports.emis.some(([t]) => t === 'ploxion.xerbot.ha-light.salon.state'));
    assert.ok(!ports.emis.some(([t]) => /lock\.porte/.test(t)), 'la serrure n\'est pas sur le bus');
    ports.emit('xerbot', dev + '.cmd', { id: 'c1', cmd: 'set', args: { color: [0, 0, 255], bri: 255 }, src: 'test', ts: 0 }); await attendre(30);
    assert.deepEqual(reseau.wled.state.seg, [{ col: [[0, 0, 255]] }]); assert.equal(reseau.wled.state.bri, 255);
    assert.ok(ports.emis.some(([t, x]) => t === 'ploxion.xerbot.' + dev + '.ack' && x.id === 'c1' && x.ok === true));
    ports.emit('xerbot', dev + '.cmd', { id: 'c2', cmd: 'avance', args: { d: 1 } }); await attendre(10);
    assert.ok(ports.emis.some(([t, x]) => t === 'ploxion.xerbot.' + dev + '.ack' && x.id === 'c2' && x.ok === false && /verbe inconnu/.test(x.err)), 'un verbe inconnu : ok:false, jamais un ok aveugle');
    assert.ok(c.api.devices().some(d => d.id === dev && d.type === 'led' && d.transport === 'http'), 'au format du registre du labo');
    // l'interface : la liste, le détail, l'interrupteur, la serrure qui demande « sûr ? »
    const h = D.createElement('div'); D.body.appendChild(h);
    const inst = W.jOSApps.controleur.mount(h); await attendre(60);
    assert.equal(h.querySelectorAll('.xb-app').length, 2);
    h.querySelector('[data-xb-ouvrir="' + ha.id + '"]').click(); await attendre(40);
    const avant = reseau.appels.filter(x => x.methode === 'POST').length;
    const porte = h.querySelector('[data-xb-e="lock.porte"][data-xb-act="deverrouiller"]');
    porte.click(); await attendre(20);
    assert.equal(reseau.appels.filter(x => x.methode === 'POST').length, avant, 'pas au premier toucher');
    assert.equal(porte.textContent, 'sûr ?');
    porte.click(); await attendre(30);
    assert.ok(reseau.appels.some(x => x.url.endsWith('/api/services/lock/unlock')), 'au second');
    h.querySelector('[data-xb-fermer]').click(); await attendre(10);
    h.querySelector('[data-xb-ouvrir="' + w.id + '"]').click(); await attendre(40);
    const choix = h.querySelector('select[data-xb-act="effet"]'); choix.value = '1'; choix.dispatchEvent(new W.Event('change', { bubbles: true })); await attendre(30);
    assert.deepEqual(reseau.wled.state.seg, [{ fx: 1 }]);
    inst.unmount();
    await c.api.retirer(ha.id); assert.ok(!coffre.has('xerbot.' + ha.id), 'retiré : le jeton aussi');
  } finally { p.fin(); }
});

test('⏻ Tasmota, un jeton faux, une adresse muette', async () => {
  const reseau = fauxReseau(), ctx = { req: (o) => reseau.requete(o), flux: () => ({ lignes: [] }), secret: async () => 'mauvais' };
  const t = await ADAPTATEURS.tasmota.lire(ctx, { type: 'tasmota', adresse: '10.0.0.8' });
  assert.deepEqual(t.entites.map(e => [e.nom, e.on]), [['Prise café', true], ['ENERGY.Power', null]]);
  await ADAPTATEURS.tasmota.agir(ctx, { type: 'tasmota', adresse: '10.0.0.8' }, t.entites[0], 'basculer');
  assert.ok(reseau.appels.some(x => x.url === 'http://10.0.0.8/cm?cmnd=Power%20TOGGLE'));
  await assert.rejects(ADAPTATEURS.ha.lire(ctx, { type: 'ha', adresse: '192.168.1.10' }), /refuse ce jeton/);
  assert.deepEqual(await sonder({ ...ctx, flux: async () => ({ lignes: [] }) }, '10.9.9.9'), { type: 'http', adresse: 'http://10.9.9.9' }, 'rien ne répond : HTTP générique');
});
