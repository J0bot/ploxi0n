// Le SHIM jOS (brief ploxi0n v1, section « Shim jOS ») : injecté avant tout ploxion. Le contrat d'un ploxion (papier anatomie-ploxion)
// ne dépend que de quelques globals et de trois routes serveur ; on les remplace toutes, en local, sur boxion_local.
//
//   jOSPorts.emit/on            bus local immédiat + boxion_local.append('xion', {topic, data})  (→ /xion/emit du Boxion distant plus tard)
//   GET  /xion/snapshot         l'état reconstruit depuis le journal 'xion'
//   POST /xion/emit             idem jOSPorts.emit
//   jOSTsoin.mark(…)            boxion_local.append('tsoins', …)
//   POST /chat {kind:'tsoin'}   idem
//   <meta> user-* / csrf-token  l'identité locale (clé matérielle du Secure Enclave : piste native, plus tard)
//   localStorage                miroir dans boxion_local (iOS peut purger le localStorage de la WebView) ; restauré au démarrage
//   jOS.openPloxion(id)         le routeur de l'app ; jOSXerPrefs.ouvrir et jOSMobile.open aussi
//   isDesktop()                 false : un ploxion écran n'est jamais bloqué
//   jOSBoxion (111 ploxions)    la même API que le labo (save, saveSoon, load, lire, get, set, list, del), sur boxion_local
//   /px/boxion/save|load|list|del  idem pour les ploxions qui appellent la route directement
//   les autres moteurs window.jOS*  absents : les ploxions testent déjà leur existence
// Toute autre route du serveur répond 503 {horsLigne:true} SANS toucher le réseau, et s'inscrit dans le journal 'manques' (ce qu'il faudra
// réimplémenter) ; une URL externe part sur le réseau (les ploxions « online only »), comptée dans shim.sortants.
// relais = { routes: [{ prefixe, vers(chemin) → url }], general() → bool, vers(chemin) → url, envoyer({methode, url, headers, corps}) →
// {status, texte, entetes} } : les routes nommées (ex. /bother → https://xerboxion.org/api/app/bother) et, en MODE CONNECTÉ (general()),
// toute autre route du serveur partent sur le réseau ; un GET réussi est gardé (boxion_local « routes ») et resservi hors ligne.

const NS_LS = 'localStorage';
const NS_BOX = (ns) => 'box:' + ns;
const ASSETS = /^\/(ploxions|assets|vendor|icons|fonts|img|data)\//;

export async function installerShim({ boxion, fenetre = globalThis.window, routeur = null, journalSortant = null, relais = null, distant = null } = {}) {
  if (!boxion) throw new Error('shim jOS : boxion_local manquant');
  const W = fenetre, D = W.document;
  const etat = { sortants: [], manques: [], tsoins: [], subs: new Map() };

  // ---- l'identité locale ----------------------------------------------------------------------------------------------------------------
  let moi = await boxion.get('identite', 'moi');
  if (!moi) {
    const a = new Uint8Array(16); (W.crypto || globalThis.crypto).getRandomValues(a);
    moi = { id: Array.from(a, b => b.toString(16).padStart(2, '0')).join(''), nom: 'moi', cree: Date.now() };
    await boxion.put('identite', 'moi', moi);
  }
  function meta(nom, valeur) { let m = D.querySelector('meta[name="' + nom + '"]'); if (!m) { m = D.createElement('meta'); m.setAttribute('name', nom); D.head.appendChild(m); } m.setAttribute('content', valeur); }
  meta('csrf-token', 'ploxi0n-local'); meta('user-authenticated', '1'); meta('user-name', moi.nom); meta('user-admin', '0'); meta('user-id', moi.id);

  // ---- le miroir du localStorage (restaurer d'abord, puis suivre chaque écriture) ------------------------------------------------------------
  const LS = W.localStorage;
  if (LS) {
    for (const { key } of await boxion.list(NS_LS)) {
      try { if (LS.getItem(key) === null) { const v = await boxion.get(NS_LS, key); if (typeof v === 'string') W.Storage.prototype.setItem.call(LS, key, v); } } catch (e) { /* quota : tant pis pour cette clé */ }
    }
    const P = W.Storage.prototype, setItem = P.setItem, removeItem = P.removeItem, clear = P.clear;
    P.setItem = function (k, v) { setItem.call(this, k, v); if (this === LS) boxion.put(NS_LS, String(k), String(v)).catch(() => {}); };
    P.removeItem = function (k) { removeItem.call(this, k); if (this === LS) boxion.del(NS_LS, String(k)).catch(() => {}); };
    P.clear = function () { const cles = this === LS ? Object.keys(this) : []; clear.call(this); for (const k of cles) boxion.del(NS_LS, k).catch(() => {}); };
  }

  // ---- le bus ---------------------------------------------------------------------------------------------------------------------------
  function diffuser(topic, payload) {
    for (const t of [topic, '*']) for (const cb of [...(etat.subs.get(t) || [])]) { try { cb(payload, topic); } catch (e) { /* un abonné ne casse pas le bus */ } }
  }
  function emit(id, port, payload, versXion) {
    const topic = 'ploxion.' + id + (port ? '.' + port : '');
    diffuser(topic, payload);
    let data = versXion !== undefined ? versXion : payload;
    try { data = JSON.parse(JSON.stringify(data === undefined ? null : data)); } catch (e) { data = String(data); }
    boxion.append('xion', { topic, data }).catch(() => {});
    return topic;
  }
  function on(topic, cb) {
    if (!etat.subs.has(topic)) etat.subs.set(topic, new Set());
    etat.subs.get(topic).add(cb);
    return () => { const s = etat.subs.get(topic); if (s) { s.delete(cb); if (!s.size) etat.subs.delete(topic); } };
  }
  W.jOSPorts = { emit, on, io: () => null, xion: false, list: () => [], topics: () => [...etat.subs.keys()] };

  // ---- les tsoins -----------------------------------------------------------------------------------------------------------------------
  etat.tsoins = (await boxion.lire('tsoins', { limite: 5000 })).map(e => ({ seq: e.seq, t: e.t, ...e.entry }));
  function marquer(entry) {
    const e = { kind: 'action', ...entry };
    const local = { t: Date.now(), ...e };
    etat.tsoins.push(local);
    return boxion.append('tsoins', e).then(r => { local.seq = r.seq; return r; });
  }
  W.jOSTsoin = Object.assign(W.jOSTsoin || {}, {
    mark(k, detail, extra) { const e = { k: String(k == null ? '' : k).slice(0, 80), d: detail == null ? '' : String(detail).slice(0, 120) }; if (extra && typeof extra === 'object') for (const kk in extra) if (!(kk in e)) e[kk] = extra[kk]; marquer(e).catch(() => {}); },
    isOn: () => true, start() {}, stop() { return null; },
    list: () => etat.tsoins.slice(), get: (id) => etat.tsoins.find(t => t.id === id || t.seq === id) || null,
    badge: (icon) => '<span>' + (icon || '⧗') + '</span>', svg: () => '',
  });

  // ---- jOSBoxion : la même API que le labo, sur boxion_local ------------------------------------------------------------------------------
  const minuteurs = new Map();
  const valide = (ns, key) => typeof ns === 'string' && typeof key === 'string' && ns && key && ns.length <= 40 && key.length <= 80;
  const jb = {
    authed: () => true, compte: '', local: (k) => k, entetes: (h) => h || {},
    async save(ns, key, data, name) {
      ns = ns == null ? '' : String(ns); key = key == null ? '' : String(key);
      if (!valide(ns, key)) return { ok: false, invalid: true };
      const doc = { ns, key, name: String(name || key).slice(0, 160), data: data === undefined ? null : data, savedAt: new Date().toISOString() };
      await boxion.put(NS_BOX(ns), key, doc);
      return { ok: true, item: doc };
    },
    saveSoon(ns, key, data, name, ms) {
      const id = ns + '\u0000' + key;
      if (minuteurs.has(id)) W.clearTimeout(minuteurs.get(id));
      minuteurs.set(id, W.setTimeout(() => { minuteurs.delete(id); jb.save(ns, key, data, name); }, ms || 1200));
    },
    async load(ns, key) { return valide(String(ns), String(key)) ? boxion.get(NS_BOX(String(ns)), String(key)) : null; },
    async lire(ns, key) {
      ns = ns == null ? '' : String(ns); key = key == null ? '' : String(key);
      if (!valide(ns, key)) return { ok: false, status: 0, horsLigne: false, raison: 'invalide' };
      const item = await boxion.get(NS_BOX(ns), key);
      return item ? { ok: true, existe: true, item } : { ok: true, existe: false, item: null };
    },
    async get(ns, key) { const d = await jb.load(ns, key); return d && d.data !== undefined ? d.data : d; },
    set(ns, key, data, name) { return jb.save(ns, key, data, name); },
    async list(ns) {
      const espaces = ns ? [String(ns)] : [...new Set((await boxion.list('box-index')).map(x => x.key))];
      const out = [];
      for (const n of espaces) for (const { key } of await boxion.list(NS_BOX(n))) { const d = await boxion.get(NS_BOX(n), key); if (d) out.push({ ns: n, key, name: d.name, size: JSON.stringify(d.data).length, savedAt: d.savedAt }); }
      return out;
    },
    async del(ns, key) { await boxion.del(NS_BOX(String(ns)), String(key)); return { ok: true }; },
    async uploadFile() { return null; }, async listFiles() { return []; }, fileUrl: (id) => '#fichier-' + id, async delFile() { return { ok: false }; }, async recatFile() { return { ok: false }; },
    toast(m) { try { const t = D.createElement('div'); t.textContent = m; t.style.cssText = 'position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9999;padding:8px 14px;border-radius:18px;background:rgba(20,80,60,.96);color:#fff;font:13px system-ui'; D.body.appendChild(t); W.setTimeout(() => t.remove(), 2200); } catch (e) { /* pas de DOM */ } },
  };
  // l'index des espaces de noms de jOSBoxion (pour list() sans ns)
  const saveBrut = jb.save;
  jb.save = async (ns, key, data, name) => { const r = await saveBrut(ns, key, data, name); if (r.ok) boxion.put('box-index', String(ns), 1).catch(() => {}); return r; };
  // ---- jOSBoxion CONNECTÉ (RS-7 12.10 : « j'ai pas l'historique de pourriture-4 ») : connecté et en ligne, LE BOXION fait foi (les mêmes routes
  // /px/boxion/* que le xer, avec le jeton) et chaque lecture rafraîchit la copie locale ; hors ligne, la copie locale ; ce qu'on y écrit
  // est mis en file (boxion_local « boxion-a-pousser ») et repart au boxion au retour (jOSBoxion.pousser()). distant = { actif(), appel(m, chemin, corps) }
  if (distant) {
    const local = { save: jb.save, load: jb.load, list: jb.list, del: jb.del };
    const enc = encodeURIComponent, cle = (ns, key) => enc(String(ns)) + '/' + enc(String(key));   // jamais \u0000 : le séparateur interne de boxion_local
    const tenter = async (f) => { if (!distant.actif()) return null; try { const r = await f(); return r && r.status >= 200 && r.status < 300 ? r : null; } catch (e) { return null; } };
    const enAttente = async (ns, key) => !!(await boxion.get('boxion-a-pousser', cle(ns, key)).catch(() => null));
    // (12.10, RS-7 : « le ploxion zone n'est pas connecté au boxion ») la réponse de GET /px/boxion/load (BoxionKvController, Rust ou PHP) :
    // une clé ABSENTE → { item: null } ; une clé PRÉSENTE → le DOCUMENT LUI-MÊME { ns, key, name, data, savedAt } (le fichier tel quel).
    // Avant, seule la forme { item } était reconnue : tout ce que le boxion avait vraiment était ignoré, l'app relisait sa copie locale.
    const docDe = (d) => { if (!d || typeof d !== 'object') return undefined; if ('item' in d) return d.item || null; if ('data' in d || 'savedAt' in d) return d; return undefined; };
    jb.load = async (ns, key) => {
      ns = String(ns); key = String(key); if (!valide(ns, key)) return null;
      if (!(await enAttente(ns, key))) {
        const r = await tenter(() => distant.appel('GET', '/px/boxion/load?ns=' + enc(ns) + '&key=' + enc(key)));
        const it = r ? docDe(r.data) : undefined;
        if (it !== undefined) { if (it) await boxion.put(NS_BOX(ns), key, it).catch(() => {}); return it; }
      }
      return local.load(ns, key);
    };
    jb.lire = async (ns, key) => { ns = ns == null ? '' : String(ns); key = key == null ? '' : String(key); if (!valide(ns, key)) return { ok: false, status: 0, horsLigne: false, raison: 'invalide' }; const it = await jb.load(ns, key); return { ok: true, existe: !!it, item: it || null }; };
    jb.save = async (ns, key, data, name) => {
      const r0 = await local.save(ns, key, data, name); if (!r0.ok) return r0;
      const r = await tenter(() => distant.appel('POST', '/px/boxion/save', { ns: String(ns), key: String(key), data: data === undefined ? null : data, name: name || String(key) }));
      if (r) { await boxion.del('boxion-a-pousser', cle(ns, key)).catch(() => {}); return (r.data && r.data.ok !== undefined) ? r.data : r0; }
      // en file SEULEMENT pour un compte connecté (hors ligne, mode connecté coupé) : ce qu'on écrit sans compte reste sur le téléphone,
      // il ne se déverse jamais dans le boxion d'un compte qui se connecte ensuite
      if (distant.connecte && !distant.connecte()) return r0;
      await boxion.put('boxion-a-pousser', cle(ns, key), { ns: String(ns), key: String(key), le: Date.now() }).catch(() => {});
      return { ...r0, enAttente: true };
    };
    jb.list = async (ns) => {
      const r = await tenter(() => distant.appel('GET', '/px/boxion/list' + (ns ? '?ns=' + enc(ns) : '')));
      if (r && r.data && Array.isArray(r.data.items)) return r.data.items;
      return local.list(ns);
    };
    jb.del = async (ns, key) => {
      await local.del(ns, key);
      const r = await tenter(() => distant.appel('POST', '/px/boxion/del', { ns: String(ns), key: String(key) }));
      return r && r.data ? r.data : { ok: true, local: true };
    };
    jb.pousser = async () => {
      let n = 0;
      for (const { key } of await boxion.list('boxion-a-pousser').catch(() => [])) {
        const a = await boxion.get('boxion-a-pousser', key); if (!a) continue;
        const doc = await local.load(a.ns, a.key);
        // jamais par-dessus plus récent : si le boxion a été écrit APRÈS la mise en file (le web, un autre appareil), il gagne
        const dist = await tenter(() => distant.appel('GET', '/px/boxion/load?ns=' + enc(a.ns) + '&key=' + enc(a.key)));
        const dd = dist ? docDe(dist.data) : undefined;
        if (dd && dd.savedAt && Date.parse(dd.savedAt) > (a.le || 0)) { await boxion.put(NS_BOX(a.ns), a.key, dd).catch(() => {}); await boxion.del('boxion-a-pousser', key); continue; }
        const r = doc ? await tenter(() => distant.appel('POST', '/px/boxion/save', { ns: a.ns, key: a.key, data: doc.data, name: doc.name })) : { status: 200 };
        if (r) { await boxion.del('boxion-a-pousser', key); n++; }
      }
      return n;
    };
  }
  W.jOSBoxion = jb;

  // ---- le routeur et l'écran ------------------------------------------------------------------------------------------------------------
  const ouvrir = (id, params) => (routeur ? routeur.ouvrir(String(id), params || null) : false);
  W.jOS = Object.assign(W.jOS || {}, { openPloxion: (id, o) => ouvrir(id, o && o.params), isDesktop: () => false });
  W.isDesktop = () => false;
  // jOSXerPrefs : la même API que le bion du labo (partials/_xerprefs_bion) ; ici, ouvrir = le routeur (une page plein écran, toujours)
  const DEMANDES = {}, JOURNAL = [];
  const lirePrefs = () => { try { return Object.assign({ start: '', open: 'page', boot: [] }, JSON.parse(W.localStorage.getItem('xb:xer') || '{}')); } catch (e) { return { start: '', open: 'page', boot: [] }; } };
  const demande = (id) => { const d = DEMANDES[id]; if (!d) return null; delete DEMANDES[id]; return Date.now() - d.t < 30000 ? d.params : null; };
  W.jOSXerPrefs = Object.assign(W.jOSXerPrefs || {}, {
    get: () => lirePrefs(),
    set(patch) { const P = Object.assign(lirePrefs(), patch || {}); try { W.localStorage.setItem('xb:xer', JSON.stringify(P)); } catch (e) { /* */ } try { W.jOSPorts.emit('xerprefs', 'update', P); } catch (e) { /* */ } return lirePrefs(); },
    reset() { try { W.localStorage.removeItem('xb:xer'); } catch (e) { /* */ } },
    ouvrir(x, o) {
      const id = String(x && typeof x === 'object' ? x.id : x), p = o && o.params;
      if (p && typeof p === 'object') DEMANDES[id] = { params: p, t: Date.now() };
      JOURNAL.unshift({ id, t: Date.now(), hote: 'page' }); JOURNAL.length = Math.min(JOURNAL.length, 20);
      return ouvrir(id, p);
    },
    ouvrable: (x) => !!(routeur && routeur.connait(String(x && typeof x === 'object' ? x.id : x))),
    mode: () => ({ voulu: 'page', resolu: 'page' }), central: () => false,
    demande, params: (id, ctx) => (ctx && ctx.params && typeof ctx.params === 'object' ? ctx.params : null) || demande(id) || {},
    journal: () => JOURNAL.slice(),
  });
  W.jOSMobile = Object.assign(W.jOSMobile || {}, { open: (id, x) => ouvrir(id, x && x.params), close: () => routeur && routeur.fermer() });

  // ---- fetch : les routes du serveur, en local ; le réseau seulement pour l'externe -----------------------------------------------------------
  const fetchReseau = W.fetch ? W.fetch.bind(W) : null;
  const json = (corps, status = 200) => new W.Response(JSON.stringify(corps), { status, headers: { 'Content-Type': 'application/json' } });
  async function corpsDe(init) { try { return init && typeof init.body === 'string' ? JSON.parse(init.body) : {}; } catch (e) { return {}; } }
  W.fetch = async function (entree, init) {
    const url = new W.URL(typeof entree === 'string' ? entree : (entree && entree.url) || String(entree), W.location.href);
    const methode = String((init && init.method) || (entree && entree.method) || 'GET').toUpperCase();
    if (url.origin !== W.location.origin) {
      etat.sortants.push(url.origin + url.pathname);
      if (journalSortant) journalSortant(url.href);
      if (!fetchReseau) throw new TypeError('hors ligne');
      return fetchReseau(entree, init);
    }
    const p = url.pathname;
    if (ASSETS.test(p) || p === '/' || p === '/index.html') return fetchReseau(entree, init);
    if (p === '/xion/snapshot') {
      const ev = await boxion.lire('xion', { limite: 100000 });
      const topics = {}; for (const e of ev) topics[e.entry.topic] = { data: e.entry.data, t: e.t, seq: e.seq };
      return json({ ok: true, local: true, topics, derniers: ev.slice(-200).map(e => ({ seq: e.seq, t: e.t, ...e.entry })) });
    }
    if (p === '/xion/emit' && methode === 'POST') {
      const b = await corpsDe(init); if (!b.topic) return json({ ok: false, message: 'topic manquant' }, 422);
      let data = b.payload; try { data = typeof data === 'string' ? JSON.parse(data) : data; } catch (e) { /* une chaîne reste une chaîne */ }
      diffuser(String(b.topic), data); await boxion.append('xion', { topic: String(b.topic), data }); return json({ ok: true });
    }
    if (p === '/chat' && methode === 'POST') {
      const b = await corpsDe(init);
      if (b && b.kind === 'tsoin') { const r = await marquer({ ...b, kind: 'tsoin' }); return json({ ok: true, seq: r.seq }); }
    }
    if (p.startsWith('/px/boxion/') && !(distant && distant.actif())) {   // connecté : la route part au boxion (le relais, plus bas)
      const q = url.searchParams, b = methode === 'POST' ? await corpsDe(init) : {};
      if (p === '/px/boxion/save') return json(await jb.save(b.ns, b.key, b.data, b.name));
      if (p === '/px/boxion/load') { const d = await jb.load(q.get('ns'), q.get('key')); return json(d || { item: null }); }
      if (p === '/px/boxion/list') return json({ items: await jb.list(q.get('ns')) });
      if (p === '/px/boxion/del') return json(await jb.del(b.ns, b.key));
    }
    // le relais : les routes nommées (ex. /bother → l'API sans session), puis, en MODE CONNECTÉ, toute route du serveur → xerboxion.org
    // (le jeton de la personne si elle est connectée) ; un GET réussi est gardé dans boxion_local « routes » : le mode avion le resservira
    const rel = relais && ((relais.routes || []).find(r => p === r.prefixe || p.startsWith(r.prefixe + '/')) || (relais.general && relais.general() ? { vers: relais.vers } : null));
    const cle = methode + ' ' + p + url.search;
    if (rel) {
      const cible = rel.vers(p) + url.search;
      etat.sortants.push(cible);
      try {
        const corps = init && init.body != null ? (typeof init.body === 'string' ? init.body : init.body instanceof W.URLSearchParams ? init.body.toString() : null) : undefined;
        if (corps === null) throw new Error('corps non texte (fichier) : pas encore relayé');
        const h = {}; const hi = (init && init.headers) || {};
        if (hi instanceof W.Headers) hi.forEach((v, k) => { h[k] = v; }); else Object.assign(h, hi);
        delete h['X-CSRF-TOKEN']; delete h['x-csrf-token'];
        const r = await relais.envoyer({ methode, url: cible, headers: { Accept: 'application/json', ...h }, corps });
        const type = (r.entetes && (r.entetes['content-type'] || r.entetes['Content-Type'])) || 'application/json';
        if (methode === 'GET' && r.status === 200 && r.texte && r.texte.length < 2e6) boxion.put('routes', cle, { texte: r.texte, type, le: Date.now() }).catch(() => {});
        return new W.Response(r.status === 204 || r.status === 304 ? null : r.texte, { status: r.status, headers: { 'Content-Type': type } });
      } catch (e) {
        const c = methode === 'GET' ? await boxion.get('routes', cle).catch(() => null) : null;
        if (c) return new W.Response(c.texte, { status: 200, headers: { 'Content-Type': c.type, 'X-Ploxi0n-Cache': new Date(c.le).toISOString() } });
        etat.manques.push(methode + ' ' + p);
        return json({ ok: false, horsLigne: true, route: p, message: 'hors ligne : ' + e.message }, 503);
      }
    }
    if (methode === 'GET') {   // mode connecté coupé ou hors ligne : la dernière réponse connue
      const c = await boxion.get('routes', cle).catch(() => null);
      if (c) return new W.Response(c.texte, { status: 200, headers: { 'Content-Type': c.type, 'X-Ploxi0n-Cache': new Date(c.le).toISOString() } });
    }
    etat.manques.push(methode + ' ' + p);
    boxion.append('manques', { methode, route: p }).catch(() => {});
    return json({ ok: false, horsLigne: true, route: p, message: 'pas encore dans ploxi0n hors ligne' }, 503);
  };

  return {
    moi,
    sortants: () => etat.sortants.slice(),
    manques: () => etat.manques.slice(),
    abonnes: () => [...etat.subs.values()].reduce((n, s) => n + s.size, 0),
    minuteurs: () => minuteurs.size,
  };
}
