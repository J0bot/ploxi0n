/* bion jOSStore — servi seul pour ploxi0n (/px/bion-app/jOSStore.js) */
void 0;

;
(function () {
  "use strict";
  if (window.jOSStore) return;
  var registry = {};

  function make(ns, opts) {
    opts = opts || {};
    var key = opts.key || 'items';
    var items = [], subs = [], loaded = false, _c = 0, applying = false, echo = false;
    var vus = null, suppr = {};   
    function uid() { _c++; return 's' + Date.now().toString(36) + '_' + _c.toString(36); }
    function lsKey() { return 'store:' + ns + ':' + key; }
    var etranger = false, moi = null;   
    (function () {   
      var b = window.jOSBoxion, L, k = lsKey(), u, q, v;
      try { L = localStorage; if (!b || L.getItem('xb:store.par-compte') === 'off') return; u = b.compte || ''; q = L.getItem(k + ':qui') || ''; } catch (e) { return; }
      
      if (window.jOSComptes && window.jOSComptes.actif) { if (q !== u) try { if (u) L.setItem(k + ':qui', u); else L.removeItem(k + ':qui'); } catch (e) {} return; }
      moi = u;
      if (q === u) return;
      try {
        v = L.getItem(k); if (v != null) L.setItem(k + '@' + (q || 'anonyme'), v);
        v = L.getItem(k + '@' + (u || 'anonyme'));
        if (v != null) { L.setItem(k, v); L.removeItem(k + '@' + (u || 'anonyme')); } else L.removeItem(k);
        if (u) L.setItem(k + ':qui', u); else L.removeItem(k + ':qui');
      } catch (e) { etranger = true; }
    })();
    
    function cle() { var k = lsKey(); if (moi === null) return k; try { var L = localStorage; return L.getItem('xb:par-compte.onglet') === 'off' || (L.getItem(k + ':qui') || '') === moi ? k : k + '@' + (moi || 'anonyme'); } catch (e) { return k; } }
    function localSave() { if (etranger) return; try { localStorage.setItem(cle(), JSON.stringify(items)); } catch (e) {} }
    function localLoad() { if (etranger) return null; try { var r = JSON.parse(localStorage.getItem(cle())); if (Array.isArray(r)) return r; } catch (e) {} return null; }
    function boxSave() { try { if (window.jOSBoxion && window.jOSBoxion.saveSoon) window.jOSBoxion.saveSoon(ns, key, items, opts.title || ('store ' + ns), 800); } catch (e) {} }

    function notify(reason) {
      // les subs locaux seulement — ni bus, ni persistance (rechargement silencieux)
      subs.forEach(function (cb) { try { cb(items, reason || 'bus'); } catch (e) {} });
    }
    function emit(reason) {
      localSave(); boxSave();
      subs.forEach(function (cb) { try { cb(items, reason); } catch (e) {} });
      // bus xion : les AUTRES ploxions (et fenêtres) apprennent le changement. jOSPorts.emit rappelle les abonnés locaux EN
      // SYNCHRONE, dont notre propre écouteur ci-dessous : sans le drapeau `echo`, chaque mutation relisait le boxion AVANT que le
      // saveSoon (800 ms) n'y soit → la mémoire revenait à l'état d'avant, et la mutation suivante écrasait la précédente dans le
      // KV réel (relecture adverse de la machine à tsoins, 25.09 : ajouter A, puis B, puis retirer A → KV [] au lieu de [B]).
      try { if (window.jOSPorts && window.jOSPorts.emit && !applying) { echo = true; try { window.jOSPorts.emit('store.' + ns, 'changed', { n: items.length, reason: reason || '' }); } finally { echo = false; } } } catch (e) {}
      try { window.dispatchEvent(new CustomEvent('store:' + ns + ':changed', { detail: { ns: ns, reason: reason || '' } })); } catch (e) {}
    }
    function seedIfEmpty() { if (!items.length && opts.seed && opts.seed.length) { items = opts.seed.map(function (s) { return Object.assign({ id: uid() }, s); }); emit('seed'); } }
    function load(silent) {
      // silent=true : rechargement déclenché PAR le bus → on notifie les subs locaux
      // mais on ne RÉ-ÉMET pas sur le bus. Fix post-mortem 16.08 : l'ancien garde
      // « applying=true; load(); applying=false » retombait avant le .then async →
      // chaque changed re-déclenchait un changed dans l'autre onglet = boucle de
      // feedback (~31 ev/min de store.*.changed, farm d'XP, bus saturé).
      var l = localLoad(); if (l) items = l;
      try {
        if (window.jOSBoxion && window.jOSBoxion.load) {
          Promise.resolve(window.jOSBoxion.load(ns, key)).then(function (v) { loaded = true;
            if (v && !Array.isArray(v) && Array.isArray(v.data)) v = v.data;   // load() rend le wrapper {data:[…]}
            if (Array.isArray(v)) vus = v.map(function (x) { return x && x.id; });
            if (Array.isArray(v) && v.length) { items = v; if (silent) { notify(); } else { emit('load'); } } else if (!silent) seedIfEmpty();
          }).catch(function () { loaded = true; if (!silent) seedIfEmpty(); });
        } else { loaded = true; if (!silent) seedIfEmpty(); }
      } catch (e) { loaded = true; if (!silent) seedIfEmpty(); }
      if (l) { if (silent) { notify(); } else { emit('local'); } }
    }

    var api = {
      ns: ns, key: key,
      ready: function () { return loaded; },
      all: function () { return items.slice(); },
      count: function () { return items.length; },
      get: function (id) { for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i]; return null; },
      find: function (pred) { for (var i = 0; i < items.length; i++) if (pred(items[i], i)) return items[i]; return null; },
      filter: function (pred) { return items.filter(pred); },
      add: function (item) { var it = Object.assign({ id: uid() }, item || {}); items.push(it); emit('add'); return it; },
      // upsert par prédicat de correspondance : fusionne (merge(existant, item)) sinon ajoute
      upsert: function (match, item, merge) { var ex = api.find(match);
        if (ex) { Object.assign(ex, merge ? merge(ex, item) : item); emit('upsert'); return ex; }
        return api.add(item); },
      set: function (id, patch) { var it = api.get(id); if (!it) return null; Object.assign(it, patch); emit('set'); return it; },
      remove: function (id) { var n = items.length; items = items.filter(function (x) { return x.id !== id; }); if (items.length !== n) { suppr[id] = Date.now(); emit('remove'); } },
      replace: function (arr) { var av = items; items = (arr || []).map(function (x) { return (x && x.id) ? x : Object.assign({ id: uid() }, x || {}); }); var ici = {}; items.forEach(function (x) { ici[x.id] = 1; }); av.forEach(function (x) { if (x && x.id && !ici[x.id]) suppr[x.id] = Date.now(); }); emit('replace'); },
      
      fusionner: function () {
        var B = window.jOSBoxion;
        if (!B || !B.lire || !(B.authed ? B.authed() : true)) return Promise.resolve({ change: false });
        return Promise.resolve(B.lire(ns, key)).then(function (r) {
          if (!r || !r.ok) return { change: false, panne: true };
          var R = r.existe && r.item ? r.item.data : []; if (R && !Array.isArray(R) && Array.isArray(R.data)) R = R.data; if (!Array.isArray(R)) R = [];
          var la = {}, av = vus ? {} : null, t = Date.now(), out = [], vu = {};
          R.forEach(function (x) { if (x && x.id) la[x.id] = x; });
          if (vus) vus.forEach(function (id) { if (id) av[id] = 1; });
          Object.keys(suppr).forEach(function (id) { if (t - suppr[id] > 600000) delete suppr[id]; });
          function nf(x) { return Array.isArray(x && x.fait) ? x.fait.length : 0; }
          items.forEach(function (x) {
            if (!x || !x.id) { out.push(x); return; }
            var y = la[x.id]; vu[x.id] = 1;
            if (!y) { if (!(av && av[x.id])) out.push(x); return; }
            var mx = +x.m || 0, my = +y.m || 0;
            out.push(my > mx || (my === mx && nf(y) > nf(x)) ? y : x);
          });
          R.forEach(function (y) { if (y && y.id && !vu[y.id] && !suppr[y.id]) out.push(y); });
          vus = R.map(function (x) { return x && x.id; });
          if (JSON.stringify(out) === JSON.stringify(items)) return { change: false };
          items = out; emit('fusion'); return { change: true };
        }).catch(function () { return { change: false, panne: true }; });
      },
      clear: function () { if (items.length) { items = []; emit('clear'); } },
      on: function (cb) { subs.push(cb); return function () { subs = subs.filter(function (x) { return x !== cb; }); }; },
      reload: load,
      uid: uid
    };

    // écoute le bus : un autre ploxion/fenêtre a changé CE store → rechargement SILENCIEUX
    // (subs locaux notifiés, zéro ré-émission — sinon boucle de feedback inter-fenêtres)
    try { if (window.jOSPorts && window.jOSPorts.on) window.jOSPorts.on('ploxion.store.' + ns + '.changed', function () { if (echo) return; load(true); }); } catch (e) {}   // pas notre propre écho

    load();
    return api;
  }

  window.jOSStore = function (ns, opts) { if (!ns) return null; if (registry[ns]) return registry[ns]; registry[ns] = make(ns, opts); return registry[ns]; };
  window.jOSStore.list = function () { return Object.keys(registry); };
  window.jOSStore.has = function (ns) { return !!registry[ns]; };
})();
;
