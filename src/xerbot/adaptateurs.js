// 🤖 LES ADAPTATEURS DU CONTRÔLEUR XERB0T (0.75) : chaque famille d'appareils parlée dans sa propre langue, rendue dans UNE forme commune.
// Composé avec ce qui existe (« toujours commencer par les bions et ploxions du nexus ») :
//   - Home Assistant : la REST de web-maison (boxion-rt : GET /api/states, POST /api/services/<domaine>/<service>, Bearer) — le bion jOSHome du
//     labo parle la même maison en WebSocket ; ses ids de device « ha-<entity_id> » sont repris pour le bus xerbot ;
//   - WLED : l'état de jOSWled (labo : { on, bri, seg:[{ col:[[r,g,b]], fx }] }, ps pour un preset) sur POST /json/state, lu par GET /json ;
//   - ESPHome : le flux /events du composant web_server (événements « state » : id « domaine/nom », ou « domaine-objet » avant) et ses actions
//     POST /<domaine>/<nom>/<toggle|turn_on|turn_off|press|open|close|stop> ;
//   - Tasmota : /cm?cmnd=Status%200 et Power<n> TOGGLE ;
//   - Raspberry Pi : Glances (:61208, /api/4|5|3/quicklook, sensors, system) ; un boxion (boxion-rt :8730 /healthz, /px, /events, /emit) ;
//   - n'importe quel ESP, Arduino ou Pi qui sert du JSON en HTTP : ses clés, et ses actions à soi.
// Une ENTITÉ : { id, nom, domaine, etat, on (vrai/faux/null), bri (0..100|null), couleur ('#rrggbb'|null), valeur, unite, actions[], sensible,
// options } ; actions ⊂ basculer, luminosite, couleur, effet, palette, preset, ouvrir, fermer, stop, plus, moins, lancer, appuyer, verrouiller,
// deverrouiller, lecture. « sensible » (une serrure, une porte de garage) : l'app demande « sûr ? » avant (ne pas nuire) et le bus ne l'atteint pas.
import { normaliser, lireSSE } from './reseau.js';

export const TYPES = {
  ha: { nom: 'Home Assistant', glyphe: '⌂', port: 8123, jeton: true },
  wled: { nom: 'WLED', glyphe: '✺', port: 80 },
  esphome: { nom: 'ESPHome', glyphe: '◉', port: 80 },
  tasmota: { nom: 'Tasmota', glyphe: '⏻', port: 80 },
  pi: { nom: 'Raspberry Pi (Glances)', glyphe: '▦', port: 61208 },
  boxion: { nom: 'boxion (boxion-rt)', glyphe: '⬡', port: 8730, jeton: true },
  http: { nom: 'ESP · Arduino · Pi (HTTP JSON)', glyphe: '⌁', port: 80 },
};

export const hex = (c) => (Array.isArray(c) && c.length >= 3 ? '#' + c.slice(0, 3).map(x => Math.max(0, Math.min(255, Math.round(+x || 0))).toString(16).padStart(2, '0')).join('') : null);
export const rgb = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(String(h || '')); if (!m) return null; const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const pct = (x) => (x == null || isNaN(+x) ? null : Math.round(+x * 100 / 255));
const octet = (p) => Math.max(1, Math.min(255, Math.round((+p || 0) * 255 / 100)));
const base = (a) => normaliser(a.adresse, (TYPES[a.type] || {}).port);
const ok = (r, quoi) => { if (!r || r.status < 200 || r.status >= 300) throw new Error(quoi + ' : ' + (r ? 'HTTP ' + r.status : 'pas de réponse')); return r; };

// ---------------- Home Assistant ----------------
export const HA_ORDRE = ['light', 'switch', 'fan', 'cover', 'climate', 'lock', 'media_player', 'scene', 'script', 'button', 'input_button', 'input_boolean', 'automation', 'siren', 'humidifier', 'binary_sensor', 'sensor', 'weather', 'person', 'device_tracker', 'sun'];
const HA_BASCULE = new Set(['light', 'switch', 'input_boolean', 'fan', 'automation', 'siren', 'humidifier']);
const HA_CACHE = new Set(['zone', 'persistent_notification', 'update', 'tts', 'conversation', 'event', 'stt', 'wake_word', 'todo', 'calendar', 'image', 'camera', 'notify', 'assist_satellite']);
export function entiteHA(st) {
  const id = st.entity_id, dom = id.split('.')[0], a = st.attributes || {};
  const e = { id, nom: a.friendly_name || id, domaine: dom, etat: st.state, on: HA_BASCULE.has(dom) ? st.state === 'on' : null, bri: null, couleur: null, valeur: null, unite: a.unit_of_measurement || '', actions: [], sensible: false, options: {} };
  if (st.state === 'unavailable') e.horsLigne = true;
  if (HA_BASCULE.has(dom)) e.actions.push('basculer');
  if (dom === 'light') {
    if (a.brightness != null) e.bri = pct(a.brightness);
    if (a.rgb_color) e.couleur = hex(a.rgb_color);
    const modes = a.supported_color_modes || [];
    if (modes.some(m => m !== 'onoff')) e.actions.push('luminosite');
    if (modes.some(m => /rgb|hs|xy/.test(m))) e.actions.push('couleur');
  }
  if (dom === 'cover') { e.actions.push('ouvrir', 'stop', 'fermer'); e.sensible = /garage|gate|door/.test(a.device_class || '') || /garage|portail/i.test(e.nom); }
  if (dom === 'lock') { e.actions.push(st.state === 'locked' ? 'deverrouiller' : 'verrouiller'); e.sensible = true; }
  if (dom === 'climate') { e.valeur = a.current_temperature; e.unite = '°'; e.options.consigne = a.temperature; e.actions.push('moins', 'plus'); }
  if (dom === 'scene' || dom === 'script') e.actions.push('lancer');
  if (dom === 'button' || dom === 'input_button') e.actions.push('appuyer');
  if (dom === 'media_player') { e.actions.push('lecture'); e.on = st.state === 'playing'; }
  if (dom === 'sensor' || dom === 'binary_sensor' || dom === 'weather' || dom === 'sun' || dom === 'person' || dom === 'device_tracker') e.valeur = st.state;
  return e;
}
const ha = {
  entetes: (jeton) => ({ Authorization: 'Bearer ' + jeton }),
  async lire(ctx, a) {
    const jeton = await ctx.secret(a); if (!jeton) throw new Error('il me faut le jeton longue durée de Home Assistant (ton profil › Sécurité)');
    const r = await ctx.req({ url: base(a) + '/api/states', entetes: ha.entetes(jeton), delai: 6000 });
    if (r.status === 401 || r.status === 403) throw new Error('Home Assistant refuse ce jeton');
    ok(r, 'Home Assistant');
    const l = (Array.isArray(r.json) ? r.json : []).filter(s => s && s.entity_id && !HA_CACHE.has(s.entity_id.split('.')[0])).map(entiteHA);
    const rang = (d) => { const i = HA_ORDRE.indexOf(d); return i < 0 ? 99 : i; };
    l.sort((x, y) => rang(x.domaine) - rang(y.domaine) || String(x.nom).localeCompare(String(y.nom), 'fr'));
    return { en_ligne: true, resume: l.length + ' entités', entites: l.slice(0, 400) };
  },
  async agir(ctx, a, e, action, val) {
    const jeton = await ctx.secret(a); if (!jeton) throw new Error('jeton Home Assistant manquant');
    const d = e.domaine, ent = { entity_id: e.id };
    const appel = {
      basculer: [d, 'toggle', ent], luminosite: ['light', 'turn_on', { ...ent, brightness_pct: Math.max(1, Math.min(100, Math.round(+val || 0))) }],
      couleur: ['light', 'turn_on', { ...ent, rgb_color: rgb(val) || [255, 255, 255] }],
      ouvrir: ['cover', 'open_cover', ent], fermer: ['cover', 'close_cover', ent], stop: ['cover', 'stop_cover', ent],
      plus: ['climate', 'set_temperature', { ...ent, temperature: (+e.options.consigne || 20) + 0.5 }], moins: ['climate', 'set_temperature', { ...ent, temperature: (+e.options.consigne || 20) - 0.5 }],
      lancer: [d, 'turn_on', ent], appuyer: [d, 'press', ent], verrouiller: ['lock', 'lock', ent], deverrouiller: ['lock', 'unlock', ent],
      lecture: ['media_player', 'media_play_pause', ent],
    }[action];
    if (!appel) throw new Error('action inconnue : ' + action);
    ok(await ctx.req({ methode: 'POST', url: base(a) + '/api/services/' + appel[0] + '/' + appel[1], entetes: ha.entetes(jeton), corps: appel[2], essais: 1 }), 'Home Assistant');
  },
  async sonder(ctx, url) { const r = await ctx.req({ url: url + '/api/', delai: 2500, essais: 1 }); return r.status === 401 || (r.json && /API running/i.test(r.json.message || '')); },
};

// ---------------- WLED ----------------
const wled = {
  async lire(ctx, a) {
    const r = ok(await ctx.req({ url: base(a) + '/json', delai: 4000 }), 'WLED'), j = r.json || {};
    const st = j.state || {}, info = j.info || {}, seg = (st.seg || [])[0] || {};
    const effets = (j.effects || []).map((n, i) => [i, n]).filter(([, n]) => n && n !== 'RSVD' && n !== '-');
    const palettes = (j.palettes || []).map((n, i) => [i, n]);
    let presets = [];
    try { const p = await ctx.req({ url: base(a) + '/presets.json', delai: 2500, essais: 1 }); if (p.json && typeof p.json === 'object') presets = Object.entries(p.json).filter(([k, v]) => +k > 0 && v && v.n).map(([k, v]) => [+k, v.n]).slice(0, 30); } catch (e) { /* pas de presets */ }
    const e = { id: 'wled', nom: info.name || a.nom || 'WLED', domaine: 'light', etat: st.on ? 'on' : 'off', on: !!st.on, bri: pct(st.bri), couleur: hex((seg.col || [])[0]), valeur: null, unite: '', actions: ['basculer', 'luminosite', 'couleur', 'effet', 'palette'].concat(presets.length ? ['preset'] : []), sensible: false, options: { effet: seg.fx, palette: seg.pal, effets, palettes, presets } };
    const pwr = info.leds && info.leds.pwr ? ' · ' + info.leds.pwr + ' mA' : '';
    return { en_ligne: true, resume: (info.leds ? info.leds.count + ' LED' : 'WLED') + (info.ver ? ' · ' + info.ver : '') + pwr, entites: [e] };
  },
  etat(action, val) {
    return { basculer: { on: 't' }, luminosite: { on: true, bri: octet(val) }, couleur: { on: true, seg: [{ col: [rgb(val) || [255, 255, 255]] }] }, effet: { on: true, seg: [{ fx: +val || 0 }] }, palette: { seg: [{ pal: +val || 0 }] }, preset: { ps: +val || 1 } }[action];
  },
  async agir(ctx, a, e, action, val) {
    const st = wled.etat(action, val); if (!st) throw new Error('action inconnue : ' + action);
    ok(await ctx.req({ methode: 'POST', url: base(a) + '/json/state', corps: st, essais: 1 }), 'WLED');
  },
  async sonder(ctx, url) { const r = await ctx.req({ url: url + '/json/info', delai: 2500, essais: 1 }); return !!(r.json && r.json.ver && r.json.leds); },
};

// ---------------- ESPHome (web_server) ----------------
/** le chemin d'action d'une entité ESPHome : « domaine/nom » (depuis 2025) ou « domaine-objet » (avant) */
export function cheminESPHome(id, domaine) {
  const s = String(id || '');
  if (s.includes('/')) return '/' + s.split('/').map(encodeURIComponent).join('/');
  const i = s.indexOf('-'); return '/' + (domaine || s.slice(0, i)) + '/' + encodeURIComponent(s.slice(i + 1));
}
export function entitesESPHome(lignes) {
  const parId = new Map();
  for (const ev of lireSSE(lignes)) {
    if (ev.event !== 'state' && ev.event !== 'state_detail_all') continue;
    const d = ev.data; if (!d || typeof d !== 'object' || !d.id) continue;
    const prev = parId.get(d.id) || {}; parId.set(d.id, { ...prev, ...d });
  }
  return [...parId.values()].map((d) => {
    const dom = d.domain || String(d.id).split(/[/-]/)[0];
    const etat = d.state != null ? String(d.state) : '';
    const e = { id: d.id, nom: d.name || String(d.id).replace(/^[^/-]+[/-]/, ''), domaine: dom, etat, on: null, bri: null, couleur: null, valeur: d.value != null ? d.value : etat, unite: '', actions: [], sensible: false, options: {} };
    if (dom === 'switch' || dom === 'light' || dom === 'fan') { e.on = d.value === true || /^on$/i.test(etat); e.actions.push('basculer'); }
    if (dom === 'light' && d.brightness != null) { e.bri = pct(d.brightness); e.actions.push('luminosite'); }
    if (dom === 'button') e.actions.push('appuyer');
    if (dom === 'cover') { e.actions.push('ouvrir', 'stop', 'fermer'); e.sensible = true; }
    if (dom === 'lock') { e.actions.push(/locked/i.test(etat) && !/unlocked/i.test(etat) ? 'deverrouiller' : 'verrouiller'); e.sensible = true; }
    if (dom === 'binary_sensor') e.on = d.value === true || /^on$/i.test(etat);
    return e;
  });
}
const esphome = {
  async lire(ctx, a) {
    const { lignes, statut } = await ctx.flux({ url: base(a) + '/events', duree: 1600 });
    const l = entitesESPHome(lignes);
    if (!l.length) throw new Error(statut === 401 ? 'ESPHome demande un mot de passe (web_server auth)' : 'pas de réponse de web_server (ajoute « web_server: » dans son YAML)');
    return { en_ligne: true, resume: l.length + ' entités', entites: l };
  },
  async agir(ctx, a, e, action, val) {
    const m = { basculer: 'toggle', appuyer: 'press', ouvrir: 'open', fermer: 'close', stop: 'stop', verrouiller: 'lock', deverrouiller: 'unlock', luminosite: 'turn_on' }[action];
    if (!m) throw new Error('action inconnue : ' + action);
    const q = action === 'luminosite' ? '?brightness=' + octet(val) : '';
    ok(await ctx.req({ methode: 'POST', url: base(a) + cheminESPHome(e.id, e.domaine) + '/' + m + q, essais: 1 }), 'ESPHome');
  },
  async sonder(ctx, url) { const { lignes } = await ctx.flux({ url: url + '/events', duree: 900 }); return lireSSE(lignes).some(x => x.event === 'ping' || x.event === 'state'); },
};

// ---------------- Tasmota ----------------
const aplatir = (o, pre = '', out = [], prof = 0) => { if (prof > 4 || out.length > 60) return out; for (const [k, v] of Object.entries(o || {})) { if (v && typeof v === 'object' && !Array.isArray(v)) aplatir(v, pre + k + '.', out, prof + 1); else out.push([pre + k, Array.isArray(v) ? v.join(', ') : v]); } return out; };
const tasmota = {
  async lire(ctx, a) {
    const j = ok(await ctx.req({ url: base(a) + '/cm?cmnd=Status%200', delai: 4000 }), 'Tasmota').json || {};
    const sts = j.StatusSTS || {}, nom = (j.Status && ((j.Status.FriendlyName || [])[0] || j.Status.DeviceName)) || a.nom || 'Tasmota';
    const prises = Object.keys(sts).filter(k => /^POWER\d*$/.test(k)).sort();
    const l = prises.map(k => ({ id: k, nom: prises.length > 1 ? nom + ' · ' + k.replace('POWER', 'relais ') : nom, domaine: 'switch', etat: sts[k], on: sts[k] === 'ON', bri: null, couleur: null, valeur: null, unite: '', actions: ['basculer'], sensible: false, options: {} }));
    for (const [k, v] of aplatir(j.StatusSNS || {}).filter(([k]) => k !== 'Time').slice(0, 20)) l.push({ id: 'sns:' + k, nom: k, domaine: 'sensor', etat: String(v), on: null, bri: null, couleur: null, valeur: v, unite: '', actions: [], sensible: false, options: {} });
    return { en_ligne: true, resume: (j.StatusFWR && j.StatusFWR.Version) ? 'Tasmota ' + j.StatusFWR.Version : 'Tasmota', entites: l };
  },
  async agir(ctx, a, e, action) {
    if (action !== 'basculer') throw new Error('action inconnue : ' + action);
    ok(await ctx.req({ url: base(a) + '/cm?cmnd=' + encodeURIComponent((e.id === 'POWER' ? 'Power' : e.id.replace('POWER', 'Power')) + ' TOGGLE'), essais: 1 }), 'Tasmota');
  },
  async sonder(ctx, url) { const r = await ctx.req({ url: url + '/cm?cmnd=Status', delai: 2500, essais: 1 }); return !!(r.json && r.json.Status); },
};

// ---------------- Raspberry Pi : Glances ----------------
const pi = {
  async lire(ctx, a) {
    let v = a.options && a.options.api, q = null;
    for (const n of v ? [v] : [4, 3, 5]) { try { const r = await ctx.req({ url: base(a) + '/api/' + n + '/quicklook', delai: 3500, essais: 1 }); if (r.status === 200 && r.json) { v = n; q = r.json; break; } } catch (e) { /* suivant */ } }
    if (!q) throw new Error('Glances ne répond pas (glances -w, port 61208)');
    const l = [['cpu', 'processeur', q.cpu, '%'], ['mem', 'mémoire', q.mem, '%'], ['swap', 'swap', q.swap, '%'], ['load', 'charge', q.load, '%']].filter(x => x[2] != null)
      .map(([id, nom, val, u]) => ({ id, nom, domaine: 'sensor', etat: String(val), on: null, bri: null, couleur: null, valeur: Math.round(+val * 10) / 10, unite: u, actions: [], sensible: false, options: {} }));
    try {
      const s = await ctx.req({ url: base(a) + '/api/' + v + '/sensors', delai: 3000, essais: 1 });
      const d = Array.isArray(s.json) ? s.json : (s.json && s.json.data) || [];
      for (const x of d.filter(x => /temperature/.test(x.type || '')).slice(0, 6)) l.push({ id: 'temp:' + x.label, nom: x.label, domaine: 'sensor', etat: String(x.value), on: null, bri: null, couleur: null, valeur: x.value, unite: '°' + (x.unit || 'C').replace('°', ''), actions: [], sensible: false, options: {} });
    } catch (e) { /* pas de capteurs */ }
    let titre = q.cpu_name || 'Raspberry Pi';
    try { const s = await ctx.req({ url: base(a) + '/api/' + v + '/system', delai: 2500, essais: 1 }); if (s.json && s.json.hostname) titre = s.json.hostname + (s.json.linux_distro ? ' · ' + s.json.linux_distro : ''); } catch (e) { /* */ }
    a.options = { ...(a.options || {}), api: v };
    return { en_ligne: true, resume: titre, entites: l };
  },
  async agir() { throw new Error('Glances se lit, il ne se commande pas'); },
  async sonder(ctx, url) { for (const n of [4, 3]) { try { const r = await ctx.req({ url: url + '/api/' + n + '/quicklook', delai: 2500, essais: 1 }); if (r.status === 200 && r.json && r.json.cpu != null) return true; } catch (e) { /* */ } } return false; },
};

// ---------------- un boxion (boxion-rt, un Pi installé par installers/flash.sh pi) ----------------
const boxion = {
  async lire(ctx, a) {
    const h = ok(await ctx.req({ url: base(a) + '/healthz', delai: 3500 }), 'boxion').json || {};
    const l = [{ id: 'healthz', nom: 'le cœur', domaine: 'sensor', etat: h.status || '?', on: null, bri: null, couleur: null, valeur: (h.status || '?') + ' · ' + Math.round((+h.uptime || 0) / 3600) + ' h', unite: '', actions: [], sensible: false, options: {} },
      { id: 'ploxions', nom: 'ploxions', domaine: 'sensor', etat: String(h.ploxions), on: null, bri: null, couleur: null, valeur: h.ploxions, unite: '', actions: [], sensible: false, options: {} },
      { id: 'bus', nom: 'le bus (émettre)', domaine: 'bus', etat: '', on: null, bri: null, couleur: null, valeur: null, unite: '', actions: ['emettre'], sensible: false, options: {} }];
    return { en_ligne: h.status === 'ok', resume: (h.node_id || 'boxion') + (h.commit ? ' · ' + String(h.commit).slice(0, 7) : ''), entites: l };
  },
  /** emettre : { topic, payload } → POST /emit (le payload est une CHAÎNE pour boxion-rt) */
  async agir(ctx, a, e, action, val) {
    if (action !== 'emettre' || !val || !val.topic) throw new Error('émettre : un topic');
    const jeton = await ctx.secret(a);
    const r = await ctx.req({ methode: 'POST', url: base(a) + '/emit', entetes: jeton ? { Authorization: 'Bearer ' + jeton } : {}, corps: { topic: String(val.topic), payload: typeof val.payload === 'string' ? val.payload : JSON.stringify(val.payload == null ? {} : val.payload) }, essais: 1 });
    if (r.status === 401) throw new Error('ce boxion demande un jeton de bus');
    ok(r, 'boxion');
  },
  async evenements(ctx, a) { const { lignes } = await ctx.flux({ url: base(a) + '/events', duree: 2500 }); return lireSSE(lignes).filter(x => x.data && x.data.topic).slice(-30).map(x => x.data); },
  async sonder(ctx, url) { const r = await ctx.req({ url: url + '/healthz', delai: 2500, essais: 1 }); return !!(r.json && r.json.status && r.json.node_id !== undefined); },
};

// ---------------- HTTP JSON (un ESP, un Arduino Wi-Fi, un Pi : n'importe quel firmware) ----------------
const http = {
  async lire(ctx, a) {
    const chemin = (a.options && a.options.chemin) || '/';
    const r = ok(await ctx.req({ url: base(a) + (chemin.startsWith('/') ? chemin : '/' + chemin), delai: 4000 }), 'HTTP');
    const l = r.json && typeof r.json === 'object' ? aplatir(r.json).slice(0, 40).map(([k, v]) => ({ id: 'k:' + k, nom: k, domaine: typeof v === 'boolean' ? 'binary_sensor' : 'sensor', etat: String(v), on: typeof v === 'boolean' ? v : null, bri: null, couleur: null, valeur: v, unite: '', actions: [], sensible: false, options: {} }))
      : [{ id: 'texte', nom: 'réponse', domaine: 'sensor', etat: String(r.texte || '').slice(0, 200), on: null, bri: null, couleur: null, valeur: String(r.texte || '').slice(0, 200), unite: '', actions: [], sensible: false, options: {} }];
    for (const [i, act] of ((a.options && a.options.actions) || []).entries()) l.unshift({ id: 'act:' + i, nom: act.nom || act.chemin, domaine: 'button', etat: '', on: null, bri: null, couleur: null, valeur: null, unite: '', actions: ['appuyer'], sensible: !!act.sensible, options: { act } });
    return { en_ligne: true, resume: 'HTTP · ' + chemin, entites: l };
  },
  async agir(ctx, a, e, action) {
    const act = e.options && e.options.act; if (action !== 'appuyer' || !act) throw new Error('action inconnue : ' + action);
    const c = String(act.chemin || '/');
    ok(await ctx.req({ methode: act.methode || 'POST', url: base(a) + (c.startsWith('/') ? c : '/' + c), corps: act.corps == null || act.corps === '' ? undefined : act.corps, essais: 1 }), 'HTTP');
  },
  async sonder() { return true; },
};

export const ADAPTATEURS = { ha, wled, esphome, tasmota, pi, boxion, http };

/** qu'est-ce qui répond à cette adresse ? (les ports par défaut de chaque famille ; le premier qui se reconnaît) */
export async function sonder(ctx, adresse) {
  const essais = [['wled', 80], ['tasmota', 80], ['esphome', 80], ['ha', 8123], ['boxion', 8730], ['pi', 61208]];
  const a0 = normaliser(adresse); if (!a0) throw new Error('adresse invalide');
  const aPort = /:\d+$/.test(new URL(a0).host);
  // toutes les familles en même temps (un appareil éteint ne coûte qu'un délai), la première de la liste qui se reconnaît l'emporte
  const l = essais.filter(([type, port]) => !aPort || port === 80 || a0.endsWith(':' + port)).map(([type, port]) => ({ type, url: aPort ? a0 : normaliser(adresse, port) }));
  const r = await Promise.all(l.map(x => ADAPTATEURS[x.type].sonder(ctx, x.url).catch(() => false)));
  const i = r.findIndex(Boolean);
  return i >= 0 ? { type: l[i].type, adresse: l[i].url } : { type: 'http', adresse: a0 };
}

/** un service Bonjour → la famille probable (et l'adresse une fois résolue) */
export function familleBonjour(s) {
  const t = String(s.type || '').replace(/\.$/, ''), txt = s.txt || {};
  if (/_home-assistant\._tcp/.test(t)) return 'ha';
  if (/_wled\._tcp/.test(t)) return 'wled';
  if (/_esphomelib\._tcp/.test(t)) return 'esphome';
  if (/_shelly\._tcp/.test(t)) return 'http';
  if (/_ssh\._tcp|_workstation\._tcp/.test(t)) return 'pi';
  if (/_arduino\._tcp/.test(t)) return 'http';
  if (/_mqtt\._tcp/.test(t)) return 'mqtt';
  if (/_http\._tcp/.test(t)) return /wled/i.test(s.nom || '') ? 'wled' : /tasmota/i.test(s.nom || '') || txt.tasmota ? 'tasmota' : 'http';
  return 'http';
}
