// 🤖 XERB0T · LE CONTRÔLEUR (0.75). RS-7 (16.10) : « améliore la partie xerbot pour vraiment pouvoir se connecter avec Home Assistant, WLED,
// tous les trucs genre ESP, Arduino, Raspberry Pi : il faut un controller pour que je puisse checker tout ça et contrôler tout ça ».
// Un ploxion natif de l'app (« controleur ») : ses pages sont aussi les faces de son cube (▣).
//   appareils  tout ce que tu as, son état (en ligne, ce qu'il dit), et ses commandes : interrupteurs, luminosité, couleur, effets, presets,
//              volets, thermostats, scènes, boutons ; les serrures et portes de garage demandent « sûr ? » (ne pas nuire)
//   ajouter    chercher sur le réseau (Bonjour : Home Assistant, WLED, ESPHome, Tasmota/Shelly, les Pi, les cartes Arduino), ou une adresse
//              (la famille se reconnaît seule) ; un Arduino / ESP en Bluetooth (UART : Nordic ou HM-10)
//   bus        le bus xerbot v1 du labo (ploxion.xerbot.<appareil>.cmd|ack|state|telemetry) : son journal, et une commande à la main
// COMPOSER (le contrat xerbot v1 du labo, /xerbot-contract.json) : chaque lumière, prise ou interrupteur devient un device du bus —
// « ha-<entity_id> » (comme jOSHome), « wled-<id> », « esphome-<id>-<entité> »… — qui répond aux verbes set { on, bri 0..255, color, fx } et
// preset { n } par un ack { id, ok, err? }, et publie son state { online, on, bri } : le centre xerbot, cublumiere et les scripts du labo pilotent
// donc le vrai matériel, sans changer une ligne. Les appareils sensibles ne sont jamais atteignables par le bus.
// Ce qui est gardé : la liste dans boxion_local « xerbot/appareils » ; les jetons (Home Assistant, un boxion) dans le trousseau d'iOS
// (jOSVerrou, Face ID), lus une fois par séance et gardés en mémoire seulement. Le contrôleur ne parle au réseau que quand il est à l'écran.
import { ADAPTATEURS, TYPES, sonder, familleBonjour, rgb, hex } from './adaptateurs.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slug = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'x';
export const NUS = { svc: '6e400001-b5a3-f393-e0a9-e50e24dcca9e', rx: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', tx: '6e400003-b5a3-f393-e0a9-e50e24dcca9e' };
export const HM10 = { svc: '0000ffe0-0000-1000-8000-00805f9b34fb', rx: '0000ffe1-0000-1000-8000-00805f9b34fb', tx: '0000ffe1-0000-1000-8000-00805f9b34fb' };
const DOMAINES = { light: 'lumières', switch: 'prises et interrupteurs', fan: 'ventilateurs', cover: 'volets et portes', climate: 'chauffage, clim', lock: 'serrures', media_player: 'son et écrans', scene: 'scènes', script: 'scripts', button: 'boutons', input_button: 'boutons', input_boolean: 'interrupteurs', automation: 'automatismes', siren: 'sirènes', humidifier: 'humidificateurs', binary_sensor: 'détecteurs', sensor: 'capteurs', weather: 'météo', person: 'personnes', device_tracker: 'où sont les appareils', sun: 'le soleil', uart: 'la ligne série', bus: 'le bus' };
const LIBELLES = { revenir: '⌂ revenir (RTL)', atterrir: '↓ atterrir', basculer: '⏻', ouvrir: '▲ ouvrir', fermer: '▼ fermer', stop: '■', plus: '+', moins: '−', lancer: '▶ lancer', appuyer: '● appuyer', verrouiller: '🔒 verrouiller', deverrouiller: '🔓 ouvrir', lecture: '⏯' };

/** l'id d'un device xerbot v1 pour une entité (null : pas sur le bus) */
export function idBus(a, e) {
  if (!e || e.sensible || !e.actions.some(x => x === 'basculer' || x === 'luminosite' || x === 'couleur')) return null;
  if (a.type === 'ha') return 'ha-' + e.id;
  if (a.type === 'wled') return 'wled-' + slug(a.id);
  return a.type + '-' + slug(a.id) + '-' + slug(e.id);
}
/** un cmd v1 { cmd, args } → les actions de l'entité : [[action, valeur], …] */
export function versActions(e, { cmd, args = {} } = {}) {
  const l = [];
  if (cmd === 'preset' && e.actions.includes('preset')) l.push(['preset', +(args.n != null ? args.n : args.ps) || 1]);
  if (cmd !== 'set') return l;
  if (args.on != null && e.actions.includes('basculer') && (!!args.on) !== !!e.on) l.push(['basculer']);
  if (args.bri != null && e.actions.includes('luminosite')) l.push(['luminosite', Math.max(1, Math.round(+args.bri / 2.55))]);
  if (args.color != null && e.actions.includes('couleur')) { const c = Array.isArray(args.color) ? hex(args.color) : String(args.color); if (rgb(c)) l.push(['couleur', c]); }
  if (args.fx != null && e.actions.includes('effet')) l.push(['effet', +args.fx || 0]);
  return l;
}

export function creerControleur({ W = globalThis.window, boxion = null, reseau, verrou = () => W.jOSVerrou, maison = () => (W.jOSNatif || {}).maison, ports = () => W.jOSPorts, ble = () => import('@capacitor-community/bluetooth-le').then(m => m.BleClient), vibrer = () => {} } = {}) {
  const D = W.document;
  let appareils = null;                 // [{ id, type, nom, adresse, options }]
  const etats = new Map();              // id → { en_ligne, resume, entites, erreur, le }
  const secrets = new Map();            // id → jeton (mémoire de la séance)
  const bles = new Map();               // id → { B, deviceId, cible, lignes[], tampon }
  const journal = [];                   // le bus xerbot v1 vu d'ici
  const ecouteurs = new Set();
  const signaler = () => { for (const f of ecouteurs) try { f(); } catch (e) { /* */ } };
  const P = () => ports();

  async function liste() {
    if (appareils) return appareils;
    const v = boxion ? await boxion.get('xerbot', 'appareils').catch(() => null) : null;
    appareils = Array.isArray(v) ? v.filter(a => a && a.id && a.type) : [];
    return appareils;
  }
  const garder = () => { if (boxion) boxion.put('xerbot', 'appareils', appareils).catch(() => {}); };
  const tsoin = (action, a, e) => { if (boxion && boxion.append) boxion.append('tsoins', { kind: 'xerbot', action, appareil: a.nom, type: a.type, entite: e ? e.nom : null }).catch(() => {}); };

  // les jetons : le trousseau d'iOS (Face ID) ; hors iPhone, la mémoire de la séance seulement (jamais boxion_local)
  async function secret(a) {
    if (!(TYPES[a.type] || {}).jeton) return null;
    if (secrets.has(a.id)) return secrets.get(a.id);
    if (!a.options || !a.options.jeton) return null;   // aucun jeton gardé : pas de Face ID pour rien
    const v = verrou(); let s = null;
    if (v && v.lire) { try { s = await v.lire('xerbot.' + a.id, a.nom + ' : ton jeton'); } catch (e) { s = null; } }
    if (s) secrets.set(a.id, s);
    return s;
  }
  async function poserSecret(a, jeton) {
    if (!jeton) return;
    secrets.set(a.id, jeton);
    if (!a.options || !a.options.jeton) { a.options = { ...(a.options || {}), jeton: true }; garder(); }   // seulement le fait qu'il existe
    const v = verrou(); if (v && v.garder) { try { await v.garder('xerbot.' + a.id, jeton); } catch (e) { /* hors iPhone : la séance seulement */ } }
  }
  const ctx = { req: (o) => reseau.requete(o), flux: (o) => reseau.flux(o), secret };

  // ---- HomeKit (déjà dans l'app : jOSNatif.maison) : un appareil de plus, sans rien ajouter ----
  const HOMEKIT = { id: 'homekit', type: 'homekit', nom: 'La maison (HomeKit)', adresse: '' };
  async function lireHomeKit() {
    const m = maison(); if (!m || !m.liste) throw new Error('HomeKit : sur l\'iPhone');
    const l = await m.liste();
    return { en_ligne: true, resume: l.length + ' accessoires', entites: l.map(x => ({ id: x.id, nom: x.nom, domaine: 'switch', etat: x.allume ? 'on' : 'off', on: !!x.allume, bri: null, couleur: null, valeur: null, unite: x.piece || x.maison || '', actions: x.basculable && x.joignable ? ['basculer'] : [], sensible: false, options: {} })) };
  }

  /** relit un appareil (son état, ses entités) */
  async function lire(id) {
    const a = id === 'homekit' ? HOMEKIT : (await liste()).find(x => x.id === id); if (!a) return null;
    let r;
    try {
      if (a.type === 'homekit') r = await lireHomeKit();
      else if (a.type === 'ble') r = lireBle(a);
      else r = await ADAPTATEURS[a.type].lire(ctx, a);
      r.erreur = null;
    } catch (e) { const p = etats.get(id) || {}; r = { ...p, en_ligne: false, erreur: String((e && e.message) || e).slice(0, 160), entites: p.entites || [] }; }
    r.le = Date.now(); etats.set(id, r);
    publierEtats(a, r); signaler();
    return r;
  }
  async function toutLire() { const l = await liste(); await Promise.all(l.filter(a => a.type !== 'ble').map(a => lire(a.id))); if (maison() && maison().liste) await lire('homekit').catch(() => {}); }

  /** une commande sur une entité (le geste de la personne, ou un cmd du bus) */
  async function agir(id, entiteId, action, val) {
    const a = id === 'homekit' ? HOMEKIT : (await liste()).find(x => x.id === id); if (!a) throw new Error('appareil inconnu');
    const e = ((etats.get(id) || {}).entites || []).find(x => x.id === entiteId); if (!e) throw new Error('entité inconnue');
    if (a.type === 'homekit') { const m = maison(); const r = await m.basculer(e.id); e.on = !!(r && r.allume); }
    else if (a.type === 'ble') await ecrireBle(a, String(val || ''));
    else await ADAPTATEURS[a.type].agir(ctx, a, e, action, val);
    tsoin(action, a, e);
    if (a.type !== 'ble') setTimeout(() => { lire(id).catch(() => {}); }, a.type === 'ha' ? 400 : 250);   // le nouvel état, tel que l'appareil le dit
  }

  // ---- le bus xerbot v1 ----
  const parBus = new Map();   // devId → { a, e }
  function publierEtats(a, r) {
    const p = P(); if (!p || !p.emit) return;
    for (const e of r.entites || []) {
      const dev = idBus(a, e); if (!dev) continue;
      parBus.set(dev, { a, e });
      p.emit('xerbot', dev + '.state', { online: !!r.en_ligne && !e.horsLigne, on: e.on, bri: e.bri != null ? Math.round(e.bri * 2.55) : undefined, color: e.couleur ? rgb(e.couleur) : undefined, transport: a.type === 'ha' ? 'ha' : 'http', ts: Date.now() });
    }
  }
  /** les devices réels dans la forme du registre du labo (/xerbot-devices.json) */
  function devices() {
    return [...parBus.entries()].map(([id, { a, e }]) => ({ id, name: e.nom, type: e.domaine === 'light' ? 'led' : 'switch', icon: e.domaine === 'light' ? '💡' : '⏻', transport: a.type === 'ha' ? 'ha' : 'http', caps: ['set'].concat(e.actions.includes('preset') ? ['preset'] : []), src: 'ploxi0n' }));
  }
  let pontBranche = false;
  function brancherPont() {
    const p = P(); if (pontBranche || !p || !p.on) return; pontBranche = true;
    p.on('*', (payload, topic) => {
      const m = /^ploxion\.xerbot\.(.+)\.(cmd|ack|state|telemetry)$/.exec(topic || ''); if (!m && !/^ploxion\.xerbot\./.test(topic || '')) return;
      journal.unshift({ le: Date.now(), topic: String(topic).slice(15), p: payload }); journal.length = Math.min(journal.length, 60); signaler();
      if (!m || m[2] !== 'cmd') return;
      const cible = parBus.get(m[1]); if (!cible) return;
      const c = payload && typeof payload === 'object' ? payload : { cmd: String(payload || '') };
      const actions = versActions(cible.e, c);
      const ack = (okv, err) => p.emit('xerbot', m[1] + '.ack', { id: c.id || null, ok: okv, ...(okv ? {} : { err }), ts: Date.now() });
      if (!actions.length) { ack(false, 'verbe inconnu pour ' + cible.e.nom + ' : ' + c.cmd); return; }
      (async () => { try { for (const [act, v] of actions) await agir(cible.a.id, cible.e.id, act, v); ack(true); } catch (er) { ack(false, String((er && er.message) || er).slice(0, 120)); } })();
    });
  }

  // ---- Bluetooth UART (Arduino + HM-10, ESP32 Nordic UART) ----
  function lireBle(a) {
    const b = bles.get(a.id);
    return { en_ligne: !!b, resume: b ? (b.cible === NUS ? 'Nordic UART' : 'HM-10') + ' · connecté' : 'pas connecté', entites: [{ id: 'uart', nom: 'terminal', domaine: 'uart', etat: '', on: null, bri: null, couleur: null, valeur: null, unite: '', actions: ['envoyer'], sensible: false, options: { lignes: b ? b.lignes.slice(-40) : [] } }] };
  }
  async function connecterBle(a) {
    const B = await ble(); await B.initialize();
    const id = a.options && a.options.deviceId;
    const dev = id ? { deviceId: id } : await B.requestDevice({ optionalServices: [NUS.svc, HM10.svc] });
    await B.connect(dev.deviceId, () => { bles.delete(a.id); lire(a.id); });
    const svcs = (await B.getServices(dev.deviceId)).map(s => String(s.uuid).toLowerCase());
    const cible = svcs.includes(NUS.svc) ? NUS : svcs.includes(HM10.svc) ? HM10 : null;
    if (!cible) { await B.disconnect(dev.deviceId).catch(() => {}); throw new Error('ni Nordic UART ni HM-10 sur cet appareil'); }
    const b = { B, deviceId: dev.deviceId, cible, lignes: [], tampon: '' };
    bles.set(a.id, b);
    await B.startNotifications(dev.deviceId, cible.svc, cible.tx, (dv) => {
      b.tampon += new TextDecoder().decode(dv.buffer.slice(dv.byteOffset, dv.byteOffset + dv.byteLength));
      const l = b.tampon.split('\n'); b.tampon = l.pop();
      for (const x of l.map(s => s.replace(/\r$/, '')).filter(Boolean)) {
        b.lignes.push('← ' + x); if (b.lignes.length > 200) b.lignes.shift();
        const p = P(); if (p && p.emit) p.emit('xerbot', 'ble-' + slug(a.id) + '.telemetry', { ligne: x, ts: Date.now() });
      }
      lire(a.id);
    });
    if (!id) { a.options = { ...(a.options || {}), deviceId: dev.deviceId }; garder(); }
    return lire(a.id);
  }
  async function ecrireBle(a, texte) {
    const b = bles.get(a.id); if (!b) throw new Error('pas connecté');
    const o = new TextEncoder().encode(texte + '\n'), pas = b.cible === HM10 ? 20 : 180;
    for (let i = 0; i < o.length; i += pas) { const m = o.slice(i, i + pas); await b.B.write(b.deviceId, b.cible.svc, b.cible.rx, new DataView(m.buffer, m.byteOffset, m.byteLength)); }
    b.lignes.push('→ ' + texte); lire(a.id);
  }

  /** ajouter un appareil : la famille (auto : sondée), l'adresse, un jeton (HA, boxion) */
  async function ajouter({ type = 'auto', nom = '', adresse = '', jeton = '', options = {} }) {
    await liste();
    let t = type, ad = adresse;
    if (t === 'auto') { const s = await sonder(ctx, adresse); t = s.type; ad = s.adresse; }
    if (t !== 'ble' && !ADAPTATEURS[t]) throw new Error('famille inconnue : ' + t);
    const id = slug((nom || t) + '-' + Date.now().toString(36));
    const a = { id, type: t, nom: (nom || (TYPES[t] || { nom: 'Bluetooth' }).nom).slice(0, 60), adresse: ad, options };
    appareils.push(a); garder();
    await poserSecret(a, jeton);
    tsoin('ajouter', a);
    if (t === 'ble') await connecterBle(a).catch((e) => { etats.set(a.id, { en_ligne: false, erreur: String(e.message || e), entites: [], le: Date.now() }); });
    else await lire(a.id);
    return a;
  }
  async function retirer(id) {
    await liste(); appareils = appareils.filter(a => a.id !== id); etats.delete(id); secrets.delete(id); garder();
    const b = bles.get(id); if (b) { b.B.disconnect(b.deviceId).catch(() => {}); bles.delete(id); }
    const v = verrou(); if (v && v.oublier) Promise.resolve().then(() => v.oublier('xerbot.' + id)).catch(() => {});
    signaler();
  }

  /** Bonjour : ce qui s'annonce, avec sa famille ; résolu en adresse au moment d'ajouter */
  async function decouvrir() {
    if (!reseau.natif()) throw new Error('chercher sur le réseau : sur l\'iPhone (Bonjour)');
    const l = await reseau.chercher({ duree: 4000 });
    // un broker MQTT s'annonce aussi, mais ne se pilote pas d'ici (Home Assistant le fait) ; Home Assistant donne son adresse dans son TXT
    return l.map(s => ({ ...s, famille: familleBonjour(s), txtUrl: (s.txt && (s.txt.internal_url || s.txt.base_url)) || '' })).filter(s => s.famille !== 'mqtt');
  }
  async function ajouterBonjour(s) {
    let adresse = s.txtUrl || '';
    if (!adresse) {
      const r = await reseau.resoudre(s);
      const garderPort = !['esphome', 'pi'].includes(s.famille);   // ESPHome : 6053 = l'API native, son web_server est sur 80 ; un Pi : Glances est sur 61208
      adresse = r.hote + (garderPort && r.port && r.port !== 80 ? ':' + r.port : '');
    }
    return ajouter({ type: s.famille, nom: s.nom, adresse });
  }

  // ================= l'interface : le ploxion « controleur » =================
  function mount(hote) {
    let vivant = true, page = 'appareils', ouvert = null, minuteur = 0, sur = null;
    const PAGES = [['appareils', '🤖 appareils'], ['ajouter', '＋ ajouter'], ['bus', '⇄ le bus']];
    hote.innerHTML = '<div class="xb">'
      + '<nav class="tx-onglets">' + PAGES.map(([k, n], i) => '<button type="button" data-page-cube="' + k + '" class="' + (i ? '' : 'on') + '">' + n + '</button>').join('') + '</nav>'
      + '<section data-page-cube-panneau="appareils" class="xb-p"></section><section data-page-cube-panneau="ajouter" class="xb-p" hidden></section><section data-page-cube-panneau="bus" class="xb-p" hidden></section></div>';
    const $ = (s) => hote.querySelector(s);
    const point = (r) => '<i class="xb-point ' + (!r ? '' : r.erreur ? 'ko' : r.en_ligne ? 'ok' : '') + '"></i>';

    function controles(a, e) {
      const k = 'data-xb-a="' + esc(a.id) + '" data-xb-e="' + esc(e.id) + '"';
      let h = '';
      for (const act of e.actions) {
        if (act === 'basculer') h += '<button type="button" class="xb-int ' + (e.on ? 'on' : '') + '" ' + k + ' data-xb-act="basculer" aria-pressed="' + !!e.on + '">' + (e.on ? 'allumé' : 'éteint') + '</button>';
        else if (act === 'luminosite') h += '<input type="range" min="1" max="100" value="' + (e.bri || 50) + '" ' + k + ' data-xb-act="luminosite" aria-label="luminosité">';
        else if (act === 'couleur') h += '<input type="color" value="' + esc(e.couleur || '#ffaa44') + '" ' + k + ' data-xb-act="couleur" aria-label="couleur">';
        else if (act === 'effet' || act === 'palette' || act === 'preset') {
          const l = (e.options[act === 'effet' ? 'effets' : act === 'palette' ? 'palettes' : 'presets'] || []), cur = e.options[act];
          h += '<select ' + k + ' data-xb-act="' + act + '" aria-label="' + act + '">' + (act === 'preset' ? '<option value="">preset…</option>' : '') + l.map(([i, n]) => '<option value="' + i + '"' + (i === cur ? ' selected' : '') + '>' + esc(n) + '</option>').join('') + '</select>';
        } else if (act === 'envoyer') h += '<span class="xb-ligne"><input data-xb-texte="' + esc(a.id) + '" placeholder="une ligne pour la carte" autocomplete="off" autocapitalize="off"><button type="button" ' + k + ' data-xb-act="envoyer">envoyer</button></span>';
        else if (act === 'emettre') h += '<span class="xb-ligne"><input data-xb-topic="' + esc(a.id) + '" placeholder="topic (ex. chillout.led.set)" autocomplete="off" autocapitalize="off"><input data-xb-charge="' + esc(a.id) + '" placeholder=\'{"mode":"rainbow"}\' autocomplete="off" autocapitalize="off"><button type="button" ' + k + ' data-xb-act="emettre">émettre</button><button type="button" data-xb-ecouter="' + esc(a.id) + '">écouter</button></span>';
        else h += '<button type="button" class="' + (e.sensible ? 'xb-sensible' : '') + '" ' + k + ' data-xb-act="' + act + '">' + esc(LIBELLES[act] || act) + '</button>';
      }
      return h;
    }
    function detail(a) {
      const r = etats.get(a.id) || {};
      const valeur = (e) => (e.valeur != null && e.valeur !== '' ? esc(e.valeur) + (e.unite ? ' ' + esc(e.unite) : '') : (e.options && e.options.consigne != null ? '→ ' + esc(e.options.consigne) + '°' : ''));
      let h = '<div class="xb-tete"><button type="button" data-xb-fermer>‹</button><b>' + esc(a.nom) + '</b>' + point(r) + '<button type="button" data-xb-relire="' + esc(a.id) + '">↻</button></div>'
        + '<p class="xb-sous">' + esc((TYPES[a.type] || {}).nom || a.type) + (a.adresse ? ' · ' + esc(a.adresse) : '') + (r.resume ? ' · ' + esc(r.resume) : '') + '</p>'
        + (r.erreur ? '<p class="xb-err">' + esc(r.erreur) + '</p>' : '');
      if (a.type === 'ble' && !bles.has(a.id)) h += '<button type="button" class="tx-plus" data-xb-ble="' + esc(a.id) + '">ᛒ connecter</button>';
      if ((TYPES[a.type] || {}).jeton && (r.erreur || !(a.options && a.options.jeton))) h += '<div class="xb-form"><input data-xb-jeton-de="' + esc(a.id) + '" type="password" placeholder="' + (a.type === 'ha' ? 'jeton longue durée (ton profil Home Assistant › Sécurité)' : 'jeton du bus (si ce boxion en demande un)') + '" autocomplete="off" autocapitalize="off"><button type="button" data-xb-garder-jeton="' + esc(a.id) + '">garder (trousseau, Face ID)</button></div>';
      let dom = null;
      for (const e of r.entites || []) {
        if (e.domaine !== dom) { dom = e.domaine; h += '<p class="xb-dom">' + esc(DOMAINES[dom] || dom) + '</p>'; }
        h += '<div class="xb-e' + (e.horsLigne ? ' xb-hl' : '') + '"><span><b>' + esc(e.nom) + '</b><small>' + valeur(e) + '</small></span><span class="xb-c">' + controles(a, e) + '</span></div>';
        if (e.domaine === 'uart') h += '<pre class="xb-log">' + esc((e.options.lignes || []).join('\n') || 'rien encore') + '</pre>';
      }
      if (a.type === 'boxion' && sur && sur.id === a.id) h += '<pre class="xb-log">' + esc(sur.l.map(x => x.topic + '  ' + String(x.payload).slice(0, 80)).join('\n') || 'rien sur le bus pendant 2,5 s') + '</pre>';
      h += a.type === 'homekit' ? '' : '<button type="button" class="xb-retirer" data-xb-retirer="' + esc(a.id) + '">retirer cet appareil</button>';
      return h;
    }
    async function peindreAppareils() {
      const l = await liste(); if (!vivant) return;
      const tous = (maison() && maison().liste ? [HOMEKIT] : []).concat(l);
      const p = $('[data-page-cube-panneau="appareils"]');
      if (ouvert) { const a = tous.find(x => x.id === ouvert); if (a) { p.innerHTML = detail(a); return; } ouvert = null; }
      p.innerHTML = '<p class="tx-titre">🤖 XERB0T · le monde physique</p>'
        + (l.length ? '' : '<p class="tx-vide">Rien encore. ＋ ajouter : Home Assistant, WLED, ESPHome, Tasmota, un Raspberry Pi, un boxion, un Arduino en Bluetooth… Ils se trouvent souvent seuls (chercher sur le réseau).</p>')
        + '<div class="xb-liste">' + tous.map(a => { const r = etats.get(a.id); const g = a.type === 'homekit' ? '⌂' : a.type === 'ble' ? 'ᛒ' : (TYPES[a.type] || {}).glyphe || '◇'; return '<button type="button" class="xb-app" data-xb-ouvrir="' + esc(a.id) + '"><span class="g">' + g + '</span><span><b>' + esc(a.nom) + '</b><small>' + esc(r ? (r.erreur || r.resume || '') : '…') + '</small></span>' + point(r) + '</button>'; }).join('') + '</div>'
        + '<p class="tx-vide">Les lumières et les prises sont aussi sur le bus xerbot (ha-…, wled-…) : le centre xerbot et cublumiere du labo les pilotent.</p>';
    }
    function peindreAjouter(trouves = null, msg = '') {
      const p = $('[data-page-cube-panneau="ajouter"]');
      p.innerHTML = '<p class="tx-titre">＋ ajouter un appareil</p>'
        + '<button type="button" class="tx-plus" data-xb-chercher>🔍 chercher sur le réseau</button>'
        + (trouves ? (trouves.length ? '<div class="xb-liste">' + trouves.map((s, i) => '<button type="button" class="xb-app" data-xb-trouve="' + i + '"><span class="g">' + ((TYPES[s.famille] || {}).glyphe || '◇') + '</span><span><b>' + esc(s.nom) + '</b><small>' + esc((TYPES[s.famille] || { nom: s.famille }).nom + ' · ' + s.type) + '</small></span><i>＋</i></button>').join('') + '</div>' : '<p class="tx-vide">Rien ne s\'annonce (même Wi-Fi ? iOS › Réglages › ploxi0n › Réseau local).</p>') : '')
        + '<p class="xb-dom">à la main</p><div class="xb-form">'
        + '<input data-xb-adresse placeholder="adresse : 192.168.1.42, wled.local, homeassistant.local:8123" autocomplete="off" autocapitalize="off" inputmode="url">'
        + '<select data-xb-type><option value="auto">la famille : je devine</option>' + Object.entries(TYPES).map(([k, t]) => '<option value="' + k + '">' + esc(t.nom) + '</option>').join('') + '</select>'
        + '<input data-xb-nom placeholder="un nom (facultatif)" autocomplete="off">'
        + '<input data-xb-jeton type="password" placeholder="jeton (Home Assistant : ton profil › Sécurité › jeton longue durée)" autocomplete="off" autocapitalize="off">'
        + '<button type="button" class="tx-plus" data-xb-ajouter>ajouter</button></div>'
        + '<p class="xb-dom">en Bluetooth</p><button type="button" data-xb-ajouter-ble>ᛒ un Arduino ou un ESP (UART : HM-10, Nordic)</button>'
        + '<p class="tx-vide" data-xb-msg>' + esc(msg || 'Le jeton est gardé dans le trousseau d\'iOS (Face ID), jamais ailleurs.') + '</p>';
      p._trouves = trouves;
    }
    function peindreBus() {
      const p = $('[data-page-cube-panneau="bus"]'), devs = devices();
      p.innerHTML = '<p class="tx-titre">⇄ le bus xerbot v1</p>'
        + '<div class="xb-form"><select data-xb-dev>' + devs.map(d => '<option value="' + esc(d.id) + '">' + esc(d.name + ' · ' + d.id) + '</option>').join('') + '<option value="xerbot">xerbot (le rover par défaut)</option></select>'
        + '<input data-xb-cmd placeholder=\'set {"on":true,"bri":128,"color":[255,120,0]} · preset {"n":1} · avance {"d":1}\' autocomplete="off" autocapitalize="off"><button type="button" class="tx-plus" data-xb-envoyer-cmd>envoyer</button></div>'
        + '<pre class="xb-log">' + esc(journal.map(x => new Date(x.le).toLocaleTimeString('fr-CH') + '  ' + x.topic + '  ' + (typeof x.p === 'string' ? x.p : JSON.stringify(x.p))).join('\n') || 'rien encore') + '</pre>';
    }
    function peindre() { if (!vivant) return; if (page === 'appareils') peindreAppareils(); else if (page === 'bus') peindreBus(); }
    // pas de repeinture pendant qu'un doigt règle un curseur ou tape dans un champ du contrôleur
    const ecouteur = () => { const f = D.activeElement; if (page === 'ajouter' || (f && hote.contains(f) && /^(INPUT|SELECT|TEXTAREA)$/.test(f.tagName))) return; peindre(); }; ecouteurs.add(ecouteur);

    function surveiller() {
      if (minuteur) return;
      const tic = async () => {
        minuteur = 0; if (!vivant) return;
        if (!hote.closest('[hidden]') && !D.hidden) { try { if (ouvert) await lire(ouvert); else await toutLire(); } catch (e) { /* */ } }
        if (vivant) minuteur = W.setTimeout(tic, ouvert ? 5000 : 20000);
      };
      tic();
    }
    function allerPage(k) {
      if (!PAGES.some(x => x[0] === k)) return; page = k;
      hote.querySelectorAll('[data-page-cube]').forEach(b => b.classList.toggle('on', b.getAttribute('data-page-cube') === k));
      hote.querySelectorAll('[data-page-cube-panneau]').forEach(s => { s.hidden = s.getAttribute('data-page-cube-panneau') !== k; });
      if (k === 'ajouter') peindreAjouter(); else peindre();
    }
    const msg = (t) => { const m = hote.querySelector('[data-xb-msg]'); if (m) m.textContent = t; };
    async function geste(b) {
      const aid = b.getAttribute('data-xb-a'), eid = b.getAttribute('data-xb-e'), act = b.getAttribute('data-xb-act');
      if (b.classList.contains('xb-sensible') && b.dataset.sur !== '1') { b.dataset.sur = '1'; b.textContent = 'sûr ?'; vibrer('fx-tension'); setTimeout(() => { if (b.isConnected) { b.dataset.sur = ''; b.textContent = LIBELLES[act] || act; } }, 3000); return; }
      let val = b.value;
      if (act === 'envoyer') { const i = hote.querySelector('[data-xb-texte="' + aid + '"]'); val = i ? i.value : ''; if (!val) return; i.value = ''; }
      if (act === 'emettre') { const t = hote.querySelector('[data-xb-topic="' + aid + '"]'), c = hote.querySelector('[data-xb-charge="' + aid + '"]'); let charge = c ? c.value : ''; try { charge = JSON.parse(charge); } catch (e) { /* texte */ } val = { topic: t ? t.value.trim() : '', payload: charge }; }
      if (act === 'preset' && !val) return;
      b.disabled = true;
      try { await agir(aid, eid, act, val); vibrer(act === 'basculer' ? 'fx-case' : 'succes'); }
      catch (er) { vibrer('erreur'); const r = etats.get(aid); if (r) { r.erreur = String((er && er.message) || er).slice(0, 160); peindre(); } }
      b.disabled = false;
    }
    hote.addEventListener('click', async (e) => {
      const b = e.target.closest('button'); if (!b || !hote.contains(b)) return;
      if (b.hasAttribute('data-page-cube')) { vibrer('selection'); return allerPage(b.getAttribute('data-page-cube')); }
      if (b.hasAttribute('data-xb-ouvrir')) { ouvert = b.getAttribute('data-xb-ouvrir'); vibrer('selection'); peindre(); lire(ouvert); return; }
      if (b.hasAttribute('data-xb-fermer')) { ouvert = null; sur = null; peindre(); return; }
      if (b.hasAttribute('data-xb-relire')) { vibrer('selection'); lire(b.getAttribute('data-xb-relire')); return; }
      if (b.hasAttribute('data-xb-retirer')) { if (b.dataset.sur !== '1') { b.dataset.sur = '1'; b.textContent = 'sûr ?'; return; } await retirer(b.getAttribute('data-xb-retirer')); ouvert = null; peindre(); return; }
      if (b.hasAttribute('data-xb-garder-jeton')) { const id = b.getAttribute('data-xb-garder-jeton'), a = (await liste()).find(x => x.id === id), i = hote.querySelector('[data-xb-jeton-de="' + id + '"]'); if (!a || !i || !i.value.trim()) return; await poserSecret(a, i.value.trim()); i.value = ''; vibrer('succes'); lire(id); return; }
      if (b.hasAttribute('data-xb-ble')) { const a = (await liste()).find(x => x.id === b.getAttribute('data-xb-ble')); b.disabled = true; try { await connecterBle(a); } catch (er) { const r = etats.get(a.id) || {}; etats.set(a.id, { ...r, erreur: String(er.message || er), entites: r.entites || [] }); } peindre(); return; }
      if (b.hasAttribute('data-xb-ecouter')) { const a = (await liste()).find(x => x.id === b.getAttribute('data-xb-ecouter')); b.disabled = true; try { sur = { id: a.id, l: await ADAPTATEURS.boxion.evenements(ctx, a) }; } catch (er) { sur = { id: a.id, l: [] }; } peindre(); return; }
      if (b.hasAttribute('data-xb-act') && !b.matches('select,input')) return geste(b);
      if (b.hasAttribute('data-xb-chercher')) { b.disabled = true; b.textContent = '🔍 j\'écoute le réseau…'; try { const t = await decouvrir(); if (vivant) peindreAjouter(t); } catch (er) { peindreAjouter([], 'Bonjour : ' + (er.message || er)); } return; }
      if (b.hasAttribute('data-xb-trouve')) { const s = ($('[data-page-cube-panneau="ajouter"]')._trouves || [])[+b.getAttribute('data-xb-trouve')]; if (!s) return; b.disabled = true; msg('j\'ajoute ' + s.nom + '…'); try { const a = await ajouterBonjour(s); vibrer('succes'); ouvert = a.id; allerPage('appareils'); } catch (er) { b.disabled = false; vibrer('erreur'); msg(String(er.message || er)); } return; }
      if (b.hasAttribute('data-xb-ajouter')) {
        const v = (s) => (hote.querySelector(s) || {}).value || '';
        if (!v('[data-xb-adresse]').trim()) { msg('il me faut une adresse'); return; }
        b.disabled = true; msg('je regarde ce qui répond à cette adresse…');
        try { const a = await ajouter({ type: v('[data-xb-type]'), nom: v('[data-xb-nom]').trim(), adresse: v('[data-xb-adresse]').trim(), jeton: v('[data-xb-jeton]').trim() }); vibrer('succes'); ouvert = a.id; allerPage('appareils'); }
        catch (er) { b.disabled = false; vibrer('erreur'); msg(String(er.message || er)); }
        return;
      }
      if (b.hasAttribute('data-xb-ajouter-ble')) { b.disabled = true; try { const a = await ajouter({ type: 'ble', nom: 'Bluetooth', options: {} }); ouvert = a.id; allerPage('appareils'); } catch (er) { b.disabled = false; msg(String(er.message || er)); } return; }
      if (b.hasAttribute('data-xb-envoyer-cmd')) {
        const dev = (hote.querySelector('[data-xb-dev]') || {}).value, t = ((hote.querySelector('[data-xb-cmd]') || {}).value || '').trim(); if (!dev || !t) return;
        const i = t.indexOf(' '), cmd = i < 0 ? t : t.slice(0, i); let args = {}; if (i >= 0) { try { args = JSON.parse(t.slice(i + 1)); } catch (er) { args = { texte: t.slice(i + 1) }; } }
        const p = P(); if (p && p.emit) p.emit('xerbot', dev + '.cmd', { id: (W.crypto && W.crypto.randomUUID ? W.crypto.randomUUID() : String(Date.now())), cmd, args, src: 'ploxi0n', ts: Date.now() });
        vibrer('succes'); return;
      }
    });
    hote.addEventListener('change', (e) => { const x = e.target; if (x && x.matches && x.matches('input[data-xb-act],select[data-xb-act]')) geste(x); });
    liste().then(() => { if (vivant) { allerPage('appareils'); surveiller(); } });
    return {
      unmount() { vivant = false; ecouteurs.delete(ecouteur); if (minuteur) W.clearTimeout(minuteur); hote.innerHTML = ''; },
      page: () => page, allerPage,
    };
  }

  brancherPont();
  W.jOSApps = W.jOSApps || {};
  W.jOSApps.controleur = { manifest: { id: 'controleur', name: 'XERB0T', icon: '🤖' }, mount };
  const api = { liste, lire, toutLire, agir, ajouter, retirer, decouvrir, ajouterBonjour, devices, etat: (id) => etats.get(id) || null, journal: () => journal.slice(), surChangement: (f) => { ecouteurs.add(f); return () => ecouteurs.delete(f); }, connecterBle };
  return { api, ploxion: { id: 'controleur', nom: 'XERB0T · le contrôleur', icone: '🤖', interne: true, cat: 'maison', type: 'ploxion', description: 'Le monde physique : Home Assistant, WLED, ESPHome, Tasmota, les Raspberry Pi, les boxions, les Arduino et ESP (HTTP, Bluetooth), HomeKit — les voir et les piloter', bions: ['jOSNatif'] } };
}
