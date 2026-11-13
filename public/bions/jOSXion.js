/* bion jOSXion — servi seul pour ploxi0n (/px/bion-app/jOSXion.js) */
void 0;

;
(function () {
  'use strict';
  if (window.jOSAppareil && window.jOSXion) return;

  
  var ON = 'xb:xion.on', BASE = 'xb:xion.base', HZ = 'xb:xion.healthz', DEFAUT = 'http://127.0.0.1:8730';
  var memo = null, dernier = null;

  function estLocal(h) { return h === '127.0.0.1' || h === 'localhost' || h === '[::1]' || h === '::1'; }
  
  var LABO_LOCAL = false;
  
  
  
  function natif() { try { var x = window.xerboxion; return !!(x && x.natif && typeof x.xion === 'string' && /^https?:\/\//.test(x.xion)); } catch (e) { return false; } }
  function enabled() {
    if (natif()) return true;
    try { if (estLocal(location.hostname) && !LABO_LOCAL) return true; } catch (e0) {}
    try { if (/[?&]xion=1(?:&|$)/.test(location.search)) { localStorage.setItem(ON, '1'); return true; } } catch (e1) {}
    try { return localStorage.getItem(ON) === '1'; } catch (e2) { return false; }
  }
  function activer(on) { try { if (on) localStorage.setItem(ON, '1'); else localStorage.removeItem(ON); } catch (e) {} memo = null; return enabled(); }
  function base() {
    if (natif()) { try { return String(window.xerboxion.xion).replace(/\/+$/, ''); } catch (eN) {} }
    try { var b = localStorage.getItem(BASE); if (b && /^https?:\/\//.test(b)) return b.replace(/\/+$/, ''); } catch (e0) {}
    try { if (estLocal(location.hostname) && !LABO_LOCAL && /^https?:$/.test(location.protocol)) return location.origin; } catch (e1) {}
    return DEFAUT;
  }
  function fichiersBase() { return base() + '/fichiers'; }
  function etat() {
    if (dernier) return dernier;
    try { var s = sessionStorage.getItem(HZ); if (s) { var v = JSON.parse(s); if (v && typeof v.ok === 'boolean') { dernier = v; return v; } } } catch (e) {}
    return null;
  }
  function local(o) {
    o = o || {};
    if (!enabled()) return Promise.resolve({ ok: false, base: base(), raison: 'desactive' });
    if (!o.force) {
      if (memo) return memo;
      var connu = etat();
      if (connu) { memo = Promise.resolve(connu); return memo; }
    }
    var b = base();
    memo = new Promise(function (resolve) {
      var ctl = null, timer = null, fini = false;
      function done(r) {
        if (fini) return; fini = true;
        if (timer) clearTimeout(timer);
        dernier = r;
        try { sessionStorage.setItem(HZ, JSON.stringify(r)); } catch (e0) {}
        try { window.dispatchEvent(new CustomEvent('xb:xion', { detail: r })); } catch (e1) {}
        resolve(r);
      }
      try {
        var init = { mode: 'cors', cache: 'no-store', credentials: 'omit' };
        try { if (typeof AbortController === 'function') { ctl = new AbortController(); init.signal = ctl.signal; } } catch (eA) {}
        
        try { if (/^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:|\/|$)/.test(b)) init.targetAddressSpace = 'loopback'; } catch (eT) {}
        timer = setTimeout(function () { try { if (ctl) ctl.abort(); } catch (e) {} done({ ok: false, base: b, raison: 'timeout' }); }, 800);
        fetch(b + '/healthz', init).then(function (r) {
          if (!r || !r.ok) { done({ ok: false, base: b, raison: 'http ' + (r && r.status) }); return null; }
          return r.json().then(function (j) { done({ ok: true, base: b, healthz: (j && typeof j === 'object') ? j : {} }); },
                               function () { done({ ok: true, base: b, healthz: {} }); });
        }).catch(function (e) { done({ ok: false, base: b, raison: String((e && e.message) || e) }); });
      } catch (e) { done({ ok: false, base: b, raison: String((e && e.message) || e) }); }
    });
    return memo;
  }
  window.jOSXion = { enabled: enabled, activer: activer, base: base, local: local, fichiersBase: fichiersBase, etat: etat, natif: natif, version: '1.1' };
  
  
  
  
  (function () {
    function resonder() { memo = null; try { sessionStorage.removeItem(HZ); } catch (e0) {} return local({ force: true }); }
    try { window.addEventListener('xb:xion:pret', function () { resonder(); }); } catch (e1) {}
    try { window.addEventListener('xb:xion:arret', function () { memo = null; dernier = null; try { sessionStorage.removeItem(HZ); } catch (e2) {} try { window.dispatchEvent(new CustomEvent('xb:xion', { detail: { ok: false, base: base(), raison: 'arret' } })); } catch (e3) {} }); } catch (e4) {}
    if (!natif()) return;
    var essais = 0;
    function boucle() {
      if (essais++ >= 18) return;
      var e = etat();
      if (e && e.ok) return;
      if (e && e.raison && !/timeout|fetch|refus|network|connect|10061|abort|desactive/i.test(String(e.raison))) return;
      setTimeout(function () { resonder().then(function (v) { if (!(v && v.ok)) boucle(); }, boucle); }, 5000);
    }
    try { if (window.xerboxion && window.xerboxion.xionPret) { setTimeout(resonder, 0); } else { setTimeout(boucle, 2500); } } catch (e5) {}
  })();
  window.jOSXion.version = '1.2';

  
  var TYPES = ['pc', 'telephone', 'tablette', 'montre', 'kion', 'cubion', 'esp', 'raspberry', 'tv', 'borne'];
  var SURFACES = { montre: 1, tv: 1, borne: 1 };
  var KEY = 'xb:appareil', KSURF = 'xb:appareil.surface';

  function valide(t) { return typeof t === 'string' && TYPES.indexOf(t) > -1; }
  function ua() { try { return navigator.userAgent || ''; } catch (e) { return ''; } }
  function tactile() {
    if (/Mobi|Android|iPhone|iPad|iPod|Windows Phone|Tablet|Silk|Kindle/i.test(ua())) return true;
    try { if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return true; } catch (e0) {}
    try { if (navigator.maxTouchPoints > 0) return true; } catch (e1) {}
    return false;
  }
  function tier() {
    try { if (window.jOSui && jOSui.tier) { var t = jOSui.tier(); if (t) return t; } } catch (e0) {}
    var w = 0; try { w = window.innerWidth || document.documentElement.clientWidth || 0; } catch (e1) {}
    return w <= 768 ? 'mobile' : (w <= 1024 ? 'tablette' : 'desktop');
  }
  
  function heuristique() {
    if (!tactile()) return 'pc';
    var t = tier();
    if (t === 'mobile') return 'telephone';
    if (t === 'tablette') return 'tablette';
    
    if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua())) return 'tablette';
    return 'pc';
  }
  function get() {
    try { var s = localStorage.getItem(KEY); if (valide(s)) return s; } catch (e) {}
    return heuristique();
  }
  function poser(type) { try { document.documentElement.setAttribute('data-appareil', type); } catch (e) {} }
  function xerChoisi() { try { return !!localStorage.getItem('xer.active'); } catch (e) { return false; } }
  function annoncer(type, source) {
    var d = { type: type, source: source, nom: nom(), id: id() };   
    try { window.dispatchEvent(new CustomEvent('xb:appareil', { detail: d })); } catch (e0) {}
    try { if (window.jOSPorts && jOSPorts.emit) jOSPorts.emit('appareil', 'change', d); } catch (e1) {}
  }
  function set(type, source) {
    if (!valide(type)) return false;
    source = source || 'utilisateur';
    try { localStorage.setItem(KEY, type); } catch (e0) {}
    poser(type);
    
    try { if (SURFACES[type] && !xerChoisi()) localStorage.setItem(KSURF, type); else localStorage.removeItem(KSURF); } catch (e1) {}
    try {
      if (SURFACES[type] && !xerChoisi() && window.jOSXer && jOSXer.apply && jOSXer.get) {
        var bx = jOSXer.get(type); if (bx && bx.id === type && bx.famille === 'surface') jOSXer.apply(type);
      }
    } catch (e2) {}
    annoncer(type, source);
    return true;
  }
  function auto() {
    try { localStorage.removeItem(KEY); localStorage.removeItem(KSURF); } catch (e) {}
    var t = heuristique(); poser(t); annoncer(t, 'auto'); return t;
  }
  function is(type) { return get() === type; }
  function types() { return TYPES.slice(); }
  
  function node() {
    var v = null; try { v = window.jOSXion && jOSXion.etat(); } catch (e) {}
    if (!v || !v.ok || !v.healthz) return null;
    var h = v.healthz;
    return { node_id: h.node_id || null, mode: h.mode || null, home: h.home || null, type: valide(h.type) ? h.type : null, xerion: h.xerion || null, base: v.base || null };
  }

  
  var KDEV = 'jos:devid', KNOM = 'xb:appareil.nom', KNOMM = 'xb:appareil.nomM', NS = 'appareils', NOM_MAX = 40, CACHE_MS = 30000, HB_MS = 300000;
  var idMem = '', nomBoxion = '', cacheL = null, cacheT = 0, cacheP = null, battant = null, dernierHB = 0;

  
  function B() { try { var b = window.jOSBoxion; return (b && b.authed && b.authed()) ? b : null; } catch (e) { return null; } }
  
  function id() {
    if (idMem) return idMem;
    try { var v = localStorage.getItem(KDEV); if (!v) { v = 'd' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); localStorage.setItem(KDEV, v); } idMem = String(v); }
    catch (e) { idMem = 'd' + Math.floor(Math.random() * 1e9).toString(36); }
    return idMem;
  }
  
  function os() {
    var u = ua(), p = '', mt = 0; try { p = navigator.platform || ''; mt = navigator.maxTouchPoints || 0; } catch (e) {}
    if (/iPhone/.test(u)) return 'iPhone';
    if (/iPad/.test(u) || (p === 'MacIntel' && mt > 1)) return 'iPad';
    if (/Android/.test(u)) return 'Android'; if (/Macintosh/.test(u)) return 'Mac'; if (/Windows/.test(u)) return 'Windows'; if (/Linux/i.test(u)) return 'Linux';
    return 'appareil';
  }
  function propre(n) { return String(n == null ? '' : n).replace(/\s+/g, ' ').trim().slice(0, NOM_MAX).trim(); }
  function nomLocal() { try { return propre(localStorage.getItem(KNOM) || ''); } catch (e) { return ''; } }
  function nomM() { try { return +localStorage.getItem(KNOMM) || 0; } catch (e) { return 0; } }
  function nom() { return nomLocal() || nomBoxion || os(); }
  function tag() { return { id: id(), nom: nom(), type: get() }; }
  function natifApp() { try { if (window.jOSiOS && jOSiOS.isNative && jOSiOS.isNative()) return true; } catch (e) {} return natif(); }
  function standalone() {
    try { if (window.jOSiOS && jOSiOS.isStandalone && jOSiOS.isStandalone()) return true; } catch (e0) {}
    try { if (navigator.standalone === true) return true; } catch (e1) {}
    try { if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true; } catch (e2) {}
    return false;
  }
  
  function doc() { return { v: 1, id: id(), nom: nomLocal(), nomM: nomM(), type: get(), os: os(), ua: ua().slice(0, 200), vu: Date.now(), natif: natifApp(), standalone: standalone() }; }
  function poserNom(n, m, source) {
    n = propre(n);
    try { if (n) localStorage.setItem(KNOM, n); else localStorage.removeItem(KNOM); localStorage.setItem(KNOMM, String(m)); } catch (e) {}
    nomBoxion = n;
    annoncer(get(), source);
  }
  
  function battre(raison) {
    var b = B(); if (!b) return Promise.resolve(false);
    if (battant) return battant;
    var moi = id();
    battant = b.load(NS, moi).then(function (r) {
      var remote = (r && r.data && typeof r.data === 'object') ? r.data : null;
      var local = doc();
      if (remote) {
        var rM = +remote.nomM || 0, rNom = propre(remote.nom || '');
        if (rM > local.nomM || (!local.nom && rNom && rM >= local.nomM)) {
          if (rNom !== local.nom) poserNom(rNom, rM, 'boxion'); else { try { localStorage.setItem(KNOMM, String(rM)); } catch (e) {} }
          local = doc();
        }
      }
      b.saveSoon(NS, moi, local, local.nom || local.os, 1500);
      dernierHB = Date.now();
      return true;
    }, function () { return false; }).then(function (ok) { battant = null; return ok; }, function () { battant = null; return false; });
    return battant;
  }
  function moiL() { var t = tag(); return { id: t.id, nom: t.nom, type: t.type, os: os(), vu: Date.now(), ici: true, vivant: true, natif: natifApp(), standalone: standalone() }; }
  
  function vivants() { var v = {}; try { if (window.jOSSessions && jOSSessions.devices) jOSSessions.devices().forEach(function (d) { if (!d || !d.dev) return; var m = 0; (d.sessions || []).forEach(function (s) { if (s && s.m > m) m = s.m; }); v[d.dev] = m || Date.now(); }); } catch (e) {} return v; }
  
  function fraiche() {
    var v = vivants(), monId = id();
    var out = (cacheL || []).map(function (a) {
      if (a.id === monId) return moiL();
      var c = {}; for (var k in a) if (Object.prototype.hasOwnProperty.call(a, k)) c[k] = a[k];
      c.vivant = !!v[a.id]; if (c.vivant && v[a.id] > c.vu) c.vu = v[a.id];
      return c;
    });
    out.sort(function (a, b) { return ((b.ici ? 1 : 0) - (a.ici ? 1 : 0)) || ((b.vivant ? 1 : 0) - (a.vivant ? 1 : 0)) || ((b.vu || 0) - (a.vu || 0)); });
    return out;
  }
  function liste(o) {
    o = o || {};
    var b = B(); if (!b) return Promise.resolve([moiL()]);
    if (!o.force && cacheL && (Date.now() - cacheT) < CACHE_MS) return Promise.resolve(fraiche());
    if (cacheP) return cacheP;
    cacheP = b.list(NS).then(function (items) {
      items = (Array.isArray(items) ? items : []).filter(function (it) { return it && it.key; }).slice(0, 40);
      return Promise.all(items.map(function (it) { return b.load(NS, it.key).then(function (d) { return { it: it, doc: d }; }, function () { return { it: it, doc: null }; }); }));
    }).then(function (rows) {
      var out = [], vuMoi = false, monId = id();
      rows.forEach(function (r) {
        var it = r.it, d = (r.doc && r.doc.data && typeof r.doc.data === 'object') ? r.doc.data : {}, aid = String(it.key);
        if (aid === monId) { vuMoi = true; out.push(moiL()); return; }
        var vu = Math.max(+d.vu || 0, Date.parse(it.savedAt || (r.doc && r.doc.savedAt) || '') || 0);
        out.push({ id: aid, nom: propre(d.nom || '') || propre(it.name || '') || String(d.os || '') || 'appareil', type: valide(d.type) ? d.type : '', os: String(d.os || ''), vu: vu, ici: false, vivant: false, natif: !!d.natif, standalone: !!d.standalone });
      });
      if (!vuMoi) out.unshift(moiL());
      cacheL = out; cacheT = Date.now(); cacheP = null;
      return fraiche();
    }, function () { cacheP = null; return [moiL()]; });
    return cacheP;
  }
  function connus() { return cacheL ? fraiche() : [moiL()]; }
  function renommer(n, cible) {
    n = propre(n); var monId = id();
    if (!cible || String(cible) === monId) {
      poserNom(n, Date.now(), 'renommer');
      return battre('renommer').then(function () { return true; }, function () { return true; });
    }
    var b = B(); if (!b) return Promise.resolve(false);
    cible = String(cible);
    return b.load(NS, cible).then(function (r) {
      var d = (r && r.data && typeof r.data === 'object') ? r.data : {};
      d.v = 1; d.id = cible; d.nom = n; d.nomM = Date.now();
      return b.save(NS, cible, d, n || d.os || cible);
    }).then(function (r) {
      var ok = !!(r && r.ok);
      if (ok && cacheL) cacheL.forEach(function (a) { if (a.id === cible) a.nom = n || a.os || 'appareil'; });
      try { window.dispatchEvent(new CustomEvent('xb:appareils', { detail: { id: cible, nom: n, source: 'renommer', ok: ok } })); } catch (e) {}
      return ok;
    }, function () { return false; });
  }

  
  var PUIS = ['faible', 'moyenne', 'forte'], KPUIS = 'xb:puissance', FAIBLE = { raspberry: 1, esp: 1, lcd: 1, montre: 1 }, MOYEN = { telephone: 1, tablette: 1, kion: 1, cubion: 1 };
  function auPlus(p, max) { return PUIS.indexOf(p) > PUIS.indexOf(max) ? max : p; }
  function puissanceAuto() {
    var t = get(), p = FAIBLE[t] ? 'faible' : (MOYEN[t] ? 'moyenne' : 'forte'), hc = 0, dm = 0;
    try { hc = +navigator.hardwareConcurrency || 0; } catch (e0) {}
    try { dm = +navigator.deviceMemory || 0; } catch (e1) {}
    if (hc && hc <= 2) p = 'faible'; else if (hc && hc <= 4) p = auPlus(p, 'moyenne');
    if (dm && dm <= 4) p = auPlus(p, 'moyenne');
    try { if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) p = 'faible'; } catch (e2) {}
    try { if (navigator.connection && navigator.connection.saveData) p = 'faible'; } catch (e3) {}
    return p;
  }
  function puissance() { try { var s = localStorage.getItem(KPUIS); if (PUIS.indexOf(s) > -1) return s; } catch (e) {} return puissanceAuto(); }
  var puisCur = '';
  function poserPuissance(source) {
    var p = puissance(); if (p === puisCur) return p; puisCur = p;
    try { document.documentElement.setAttribute('data-puissance', p); } catch (e0) {}
    if (source) { try { window.dispatchEvent(new CustomEvent('xb:puissance', { detail: { puissance: p, source: source } })); } catch (e1) {} }
    return p;
  }
  function setPuissance(p, source) {
    if (p === 'auto' || p == null || p === '') { try { localStorage.removeItem(KPUIS); } catch (e0) {} }
    else if (PUIS.indexOf(p) < 0) return false;
    else { try { localStorage.setItem(KPUIS, p); } catch (e1) {} }
    poserPuissance(source || 'utilisateur'); return true;
  }

  
  var initial = get();
  poser(initial);
  poserPuissance('');   
  try { id(); } catch (eI) {}   
  
  try { if (SURFACES[initial] && !xerChoisi()) localStorage.setItem(KSURF, initial); else localStorage.removeItem(KSURF); } catch (eS) {}

  window.jOSAppareil = { get: get, set: set, is: is, types: types, node: node, auto: auto, heuristique: heuristique,
    id: id, os: os, nom: nom, renommer: renommer, tag: tag, liste: liste, connus: connus, heartbeat: battre,
    puissance: puissance, puissanceAuto: puissanceAuto, setPuissance: setPuissance, PUISSANCES: PUIS.slice(),
    TYPES: TYPES.slice(), SURFACES: ['montre', 'tv', 'borne'], version: '1.2' };
  
  try { window.addEventListener('xb:appareil', function () { poserPuissance('appareil'); }); } catch (eP0) {}
  try { var mqRM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)'); if (mqRM && mqRM.addEventListener) mqRM.addEventListener('change', function () { poserPuissance('reduced-motion'); }); } catch (eP1) {}

  
  function sonder() {
    var on = false; try { on = !!(window.jOSXion && jOSXion.enabled()); } catch (e0) {}
    if (!on) return;
    try {
      jOSXion.local().then(function (r) {
        try { if (r && r.ok && r.healthz && valide(r.healthz.type) && r.healthz.type !== get()) set(r.healthz.type, 'xion'); } catch (e1) {}
      });
    } catch (e2) {}
  }
  try { setTimeout(sonder, 0); } catch (e3) {}

  
  function armer() {
    var tries = 0;
    (function boot0() {
      if (!window.jOSBoxion) { if (tries++ < 20) setTimeout(boot0, 500); return; }
      if (!B()) return;   
      battre('boot');
      setInterval(function () { battre('interval'); }, HB_MS);
    })();
  }
  try { window.addEventListener('xb:appareil', function (e) { var s = e && e.detail && e.detail.source; if (s !== 'boxion' && s !== 'renommer') battre('appareil'); }); } catch (e4) {}
  try { document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && Date.now() - dernierHB > 30000) battre('visible'); }); } catch (e5) {}
  try { setTimeout(armer, 0); } catch (e6) {}
})();
;

;
(function () {
  'use strict';
  if (window.jOSCapturesXion) return;
  var OFF = 'xb:coord.captures-mac', MAX_OCTETS = 25 * 1048576, BAIL_S = 120, TOPIC = 'captures.nouvelles';
  var RE_ID = /^[0-9a-f]{32}$/;
  function on() { try { var v = localStorage.getItem(OFF); return !(v === 'off' || v === '0' || v === 'false'); } catch (e) { return true; } }
  function X() { return window.jOSXion; }
  function xionOn() { try { var x = X(); return !!(x && x.enabled && x.enabled()); } catch (e) { return false; } }
  function base() { try { return String(X().base() || '').replace(/\/+$/, ''); } catch (e) { return ''; } }
  function natif() { try { return !!(X().natif && X().natif()); } catch (e) { return false; } }
  function meta(n) { try { var m = document.querySelector('meta[name="' + n + '"]'); return m ? (m.getAttribute('content') || '') : null; } catch (e) { return null; } }
  // comme jOSXion : déclarer la cible loopback (Chrome, Private/Local Network Access) seulement quand la base EST loopback
  function init(o) {
    o = o || {}; o.mode = 'cors'; o.cache = 'no-store'; o.credentials = 'omit';
    try { if (/^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:|\/|$)/.test(base())) o.targetAddressSpace = 'loopback'; } catch (e) {}
    return o;
  }
  function envoyerEvt(nom, d) { try { window.dispatchEvent(new CustomEvent(nom, { detail: d })); } catch (e) {} }

  var dernier = null, ecouteurs = [], es = null, esEssai = 0, pose = false, retourT = 0, envoiEnCours = false, autoPanne = false;

  function publier(e) {
    dernier = e;
    ecouteurs.slice().forEach(function (f) { try { f(e); } catch (x) {} });
    envoyerEvt('xb:captures', e);
  }
  function oublie() { if (dernier) { dernier = null; publier(null); } majEcoute(); return null; }

  // l'état du xion : {v, actif, auto, veille, dossier, dossier_propose, gen, captures:[{id, nom, taille, mime, date}], prises, erreur, …}
  function etat(o) {
    o = o || {};
    if (!on() || !xionOn()) return Promise.resolve(oublie());
    var b = base(); if (!b) return Promise.resolve(oublie());
    var p;
    try { p = fetch(b + '/captures', init({ headers: { Accept: 'application/json' } })); } catch (e) { return Promise.resolve(oublie()); }
    return p.then(function (r) { return r && r.ok ? r.json() : null; })   // 404 : un xion sans captures (plus ancien, ou XION_CAPTURES=off)
      .then(function (e) {
        if (!e || typeof e !== 'object' || e.v !== 1) return oublie();
        e.captures = (Array.isArray(e.captures) ? e.captures : []).filter(function (c) { return c && RE_ID.test(String(c.id)) && typeof c.nom === 'string'; }).slice(0, 20);
        var d = dernier;
        var change = !d || e.gen !== d.gen || e.actif !== d.actif || e.auto !== d.auto || e.veille !== d.veille || e.erreur !== d.erreur
          || e.dossier !== d.dossier || e.captures.map(function (c) { return c.id; }).join() !== d.captures.map(function (c) { return c.id; }).join();
        if (change || o.force) publier(e); else dernier = e;
        majEcoute();
        if (e.actif && e.auto && e.captures.length) auto();
        return e;
      }, function () { return oublie(); });
  }
  function poster(chemin, corps) {
    var b = base(); if (!b || !on() || !xionOn()) return Promise.reject(new Error('pas de xion local'));
    return fetch(b + chemin, init({ method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(corps || {}) }))
      .then(function (r) {
        return r.json().catch(function () { return null; }).then(function (j) {
          if (!r.ok) throw new Error((j && j.error) || ('le xion refuse (' + r.status + ')'));
          return j || {};
        });
      }, function () { throw new Error('le xion ne répond pas'); });
  }
  function ids(l) { return (l || []).map(function (x) { return typeof x === 'string' ? x : (x && x.id); }).filter(function (i) { return RE_ID.test(String(i)); }).slice(0, 50); }
  function prendre(l, bail) { return poster('/captures/prendre', { ids: ids(l), bail_s: bail || BAIL_S }).then(function (j) { return Array.isArray(j.pris) ? j.pris : []; }); }
  function oublier(l) { return poster('/captures/oublier', { ids: ids(l) }).then(function (j) { return Array.isArray(j.oubliees) ? j.oubliees : []; }); }
  function reglage(patch) {
    return poster('/captures/reglage', patch || {}).then(function (e) {
      if (e && e.v === 1) { e.captures = (Array.isArray(e.captures) ? e.captures : []).filter(function (c) { return c && RE_ID.test(String(c.id)); }).slice(0, 20); if (patch && patch.auto) autoPanne = false; publier(e); majEcoute(); }
      return e;
    });
  }
  // les octets d'une capture (revérifiés par le xion : dans le dossier, une image, 25 Mio au plus) → un File au vrai nom
  function lire(c) {
    var b = base();
    if (!b || !c || !RE_ID.test(String(c.id))) return Promise.reject(new Error('capture inconnue'));
    return fetch(b + '/captures/' + c.id, init({})).then(function (r) {
      if (!r || !r.ok) throw new Error(r && r.status === 404 ? 'cette capture n\'est plus là' : 'le xion refuse (' + (r && r.status) + ')');
      return r.blob();
    }).then(function (bl) {
      if (!bl || !bl.size || bl.size > MAX_OCTETS) throw new Error('capture vide ou trop grosse');
      var nom = String(c.nom || 'capture.png').replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 160) || 'capture.png';
      try { return new File([bl], nom, { type: bl.type || c.mime || 'image/png', lastModified: +c.date || Date.now() }); } catch (e) { try { bl.name = nom; } catch (x) {} return bl; }
    });
  }
  function ici() {
    var os = ''; try { os = window.jOSAppareil && window.jOSAppareil.os ? window.jOSAppareil.os() : ''; } catch (e) {}
    return os === 'Mac' ? 'ce Mac' : (os === 'Windows' || os === 'Linux') ? 'ce PC' : 'cet appareil';
  }

  // ── l'envoi (le mode « tout seul », et quiconque l'appelle) : prendre → lire → POST /coord/pieces → oublier ──
  function agent() { var a = ''; try { a = (localStorage.getItem('coord-agent') || '').trim(); } catch (e) {} return /^[a-z0-9-]{1,80}$/.test(a) ? a : 'rs-7'; }
  function peutEnvoyer() { return meta('user-admin') !== '0' && !!meta('csrf-token'); }
  function posterPieces(lus) {
    var fd = new FormData(), desc = [];
    fd.append('agent', agent());
    lus.forEach(function (x, i) { fd.append('fichiers[]', x.f, x.f.name || x.c.nom); desc.push({ genre: 'fichier', fichier: i, source: 'xion', chemin: 'xion:captures/' + x.c.nom }); });
    fd.append('pieces', JSON.stringify(desc));
    return fetch('/coord/pieces', { method: 'POST', body: fd, credentials: 'same-origin', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': meta('csrf-token') || '' } })
      .then(function (r) {
        return r.json().catch(function () { return null; }).then(function (j) {
          if (r.status >= 200 && r.status < 300 && j && j.ok) return j;
          var m = (j && (j.message || j.error)) || '';
          if (j && j.errors && typeof j.errors === 'object') { var k0 = Object.keys(j.errors)[0]; if (k0 && j.errors[k0] && j.errors[k0][0]) m = j.errors[k0][0]; }
          throw new Error(r.status === 404 ? 'l\'envoi de pièces est coupé côté serveur (ou tu n\'es pas admin)' : r.status === 419 ? 'session expirée : recharge la page' : (m || ('refusé (' + r.status + ')')));
        });
      }, function () { throw new Error('réseau coupé : rien n\'est parti'); });
  }
  // les bornes du labo : 12 pièces, 100 Mo par message (le serveur revérifie tout)
  function borner(caps) {
    var l = [], total = 0;
    (caps || []).forEach(function (c) { if (c && RE_ID.test(String(c.id)) && l.length < 12 && total + (+c.taille || 0) <= 100 * 1048576) { l.push(c); total += +c.taille || 0; } });
    return l;
  }
  function envoyer(caps, o) {
    o = o || {};
    if (envoiEnCours) return Promise.reject(new Error('un envoi de captures est déjà en cours'));
    var l = borner(caps);
    if (!l.length) return Promise.resolve({ n: 0 });
    envoiEnCours = true;
    return prendre(l, BAIL_S).then(function (pris) {
      var mes = l.filter(function (c) { return pris.indexOf(c.id) >= 0; });
      if (!mes.length) return { n: 0 };   // une autre page les envoie déjà
      return Promise.all(mes.map(function (c) { return lire(c).then(function (f) { return { c: c, f: f }; }); }))
        .then(posterPieces)
        .then(function () { return oublier(mes).then(function () { return { n: mes.length }; }, function () { return { n: mes.length }; }); });
    }).then(function (r) {
      envoiEnCours = false;
      if (r.n) envoyerEvt('xb:captures:envoyees', { n: r.n, auto: !!o.auto });
      etat({ force: true });
      return r;
    }, function (e) {
      envoiEnCours = false;
      var m = (e && e.message) || 'échec';
      envoyerEvt('xb:captures:erreur', { message: m, auto: !!o.auto });
      throw e;
    });
  }
  // « tout seul » : chaque capture n'est TENTÉE qu'une fois par page (prise ailleurs entre-temps : pas de boucle ; jamais deux envois) ;
  // un échec l'arrête pour cette page (plus de tentative) — la bande de la coord le dit, « envoyer » réessaie à la main
  var tentees = {};
  function auto() {
    if (autoPanne || envoiEnCours || !peutEnvoyer() || !dernier) return;
    var l = borner(dernier.captures.filter(function (c) { return !tentees[c.id]; }));
    if (!l.length) return;
    l.forEach(function (c) { tentees[c.id] = 1; });
    envoyer(l, { auto: true }).catch(function () { autoPanne = true; majEcoute(); });
  }

  // ── l'écoute : seulement quand quelqu'un écoute (la coord) ou en « tout seul » ──
  function doitEcouter() { return on() && xionOn() && !!(dernier && dernier.actif) && (ecouteurs.length > 0 || (dernier.auto && !autoPanne)); }
  function surRetour() {
    try { if (document.visibilityState === 'hidden') return; } catch (e) {}
    var t = Date.now(); if (t - retourT < 3000) return; retourT = t;
    etat(); ouvrirFlux();
  }
  function surNouvelles() { etat(); }
  function fermerFlux() { if (es) { try { es.close(); } catch (e) {} es = null; } }
  // le flux du bus du xion, filtré (/events?topic=captures.) : en accès DIRECT seulement (le proxy du lanceur natif refuse les flux : 501)
  function ouvrirFlux() {
    if (es || natif() || typeof EventSource !== 'function' || !doitEcouter()) return;
    if (esEssai && Date.now() - esEssai < 60000) return;
    esEssai = Date.now();
    try {
      var s = new EventSource(base() + '/events?topic=captures.');
      var surEv = function (ev) { var d = null; try { d = JSON.parse(ev.data); } catch (x) { return; } if (d && d.topic === TOPIC) etat(); };
      s.addEventListener('emit', surEv); s.onmessage = surEv;
      s.onopen = function () { esEssai = 0; };
      s.onerror = function () { if (es === s) { es = null; esEssai = Date.now(); } try { s.close(); } catch (x) {} };
      es = s;
    } catch (e) { es = null; }
  }
  function majEcoute() {
    var oui = doitEcouter();
    if (oui && !pose) {
      pose = true;
      try { window.addEventListener('focus', surRetour); document.addEventListener('visibilitychange', surRetour); window.addEventListener('xb:captures:nouvelles', surNouvelles); } catch (e) {}
      ouvrirFlux();
    } else if (!oui && pose) {
      pose = false;
      try { window.removeEventListener('focus', surRetour); document.removeEventListener('visibilitychange', surRetour); window.removeEventListener('xb:captures:nouvelles', surNouvelles); } catch (e) {}
      fermerFlux();
    } else if (oui && !es) ouvrirFlux();
  }
  function ecouter(fn) {
    if (typeof fn !== 'function') return function () {};
    ecouteurs.push(fn); majEcoute();
    return function () { ecouteurs = ecouteurs.filter(function (f) { return f !== fn; }); majEcoute(); };
  }
  function tic() { if (dernier && dernier.actif && on() && xionOn()) etat(); }

  window.jOSCapturesXion = {
    on: on, etat: etat, dernier: function () { return dernier; }, lire: lire, prendre: prendre, oublier: oublier, reglage: reglage,
    ecouter: ecouter, tic: tic, ici: ici, envoyer: envoyer, version: '1.0'
  };

  // au chargement : RIEN sans xion local ni avec le kill-switch ; sinon un seul écouteur, la sonde de jOSXion (xb:xion) — le xion prêt → l'état
  // (qui ne pose l'écoute que si la surveillance est allumée ET que quelqu'un écoute ou que « tout seul » est allumé)
  if (!on() || !xionOn()) return;
  try {
    window.addEventListener('xb:xion', function (ev) { var d = ev && ev.detail; if (d && d.ok) etat(); else if (d && d.ok === false) oublie(); });
    var e0 = null; try { e0 = X().etat ? X().etat() : null; } catch (x) {}
    if (e0 && e0.ok) setTimeout(function () { etat(); }, 0);
  } catch (e) {}
})();
;
