/* bion jOSSession — servi seul pour ploxi0n (/px/bion-app/jOSSession.js) */
void 0;

;
(function () {
  'use strict';
  if (window.jOSSession) return;
  var cur = null;
  function now() { return Date.now(); }
  function boxion() { try { return window.jOSBoxion; } catch (e) { return null; } }
  // 25.09 (relectures de la machine à tsoins) : jOSBoxion.load rend une PROMESSE — l'ancien code la lisait comme un tableau et
  // retombait toujours sur le localStorage (le boxion n'était jamais lu). L'API reste synchrone (des appelants en dépendent) :
  // une mémoire vive, amorcée par le local, se synchronise UNE fois avec le boxion au premier usage (fusion par id : le boxion
  // fait foi, les sessions scellées hors ligne, absentes du boxion, sont gardées) ; événement bus session.synced.
  var memo = null, sync = false;
  function cle() { var b = boxion(); return b && b.local ? b.local('tsm:sessions', 'session') : 'tsm:sessions'; }   
  function lireLocal() { try { return JSON.parse(localStorage.getItem(cle())) || []; } catch (e) { return []; } }
  function synchroniser() {
    if (sync) return; sync = true;
    try {
      var b = boxion(); if (!b || !b.load || (b.authed && !b.authed())) return;
      Promise.resolve(b.load('tsoins', 'sessions')).then(function (v) {
        var dist = Array.isArray(v) ? v : (v && Array.isArray(v.data) ? v.data : null);
        if (!dist) return;
        var ids = {}; dist.forEach(function (x) { if (x && x.id) ids[x.id] = 1; });
        var locales = (memo || lireLocal()).filter(function (x) { return x && x.id && !ids[x.id]; });
        memo = dist.concat(locales); if (memo.length > 200) memo = memo.slice(-200);
        try { localStorage.setItem(cle(), JSON.stringify(memo)); } catch (e) {}
        if (locales.length) { try { b.saveSoon('tsoins', 'sessions', memo, 'tsoin sessions'); } catch (e) {} }
        emit('synced', { n: memo.length });
      }).catch(function () {});
    } catch (e) {}
  }
  function loadSessions() {
    if (!memo) memo = lireLocal();
    synchroniser();
    return memo.slice();
  }
  function saveSessions(list) {
    memo = list.slice();
    try { var b = boxion(); if (b && b.saveSoon) b.saveSoon('tsoins', 'sessions', list, 'tsoin sessions'); } catch (e) {}
    try { localStorage.setItem(cle(), JSON.stringify(list)); } catch (e) {}
  }
  function emit(topic, pl) { try { if (window.jOSPorts) window.jOSPorts.emit('session', topic, pl); } catch (e) {} }

  window.jOSSession = {
    isOn: function () { return !!cur; },
    current: function () { return cur; },
    // start(label, {media:true}) — media = capture écran webm (opt-in : demande une permission, donc off par défaut)
    start: function (label, opts) {
      if (cur) return cur; opts = opts || {};
      var id = 'ses-' + now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
      cur = { id: id, label: (label || ('session ' + new Date().toLocaleTimeString())), t0: now(), media: false };
      try { if (window.jOSTsoin && window.jOSTsoin.start) window.jOSTsoin.start(cur.label); } catch (e) {}   // piste ACTIONS + scène
      if (opts.media) { try { if (window.jOSRecorder && window.jOSRecorder.start) { window.jOSRecorder.start('screen', cur.label); cur.media = true; } } catch (e) {} }
      emit('start', { id: id, label: cur.label });
      return cur;
    },
    stop: function () {
      if (!cur) return null; var s = cur; cur = null;
      var actions = [];
      try { var ts = window.jOSTsoin && window.jOSTsoin.stop && window.jOSTsoin.stop(); if (ts && ts.events) actions = ts.events; } catch (e) {}
      var xerkions = [];
      try { xerkions = (window.jOSWireshark && window.jOSWireshark.list ? window.jOSWireshark.list() : [])
        .filter(function (e) { return (e.ts || 0) >= s.t0; })
        .map(function (e) { return { dt: (e.ts - s.t0), k: e.kind, label: e.label, detail: e.detail }; }); } catch (e) {}
      var clips = [];
      if (s.media) { try { var r = window.jOSRecorder && window.jOSRecorder.stop && window.jOSRecorder.stop(); if (r) clips.push((r && (r.id || r.key)) || r); } catch (e) {} }
      // scène = les snapshots visuels dans les actions (RS-7 : « voir les fractales = le preview de ce qu'on voyait » = la RÉTROCOMPAT)
      var scene0 = null, sceneFinal = null;
      try { for (var i = 0; i < actions.length; i++) { if (actions[i] && actions[i].scene) { if (!scene0) scene0 = actions[i].scene; sceneFinal = actions[i].scene; } } } catch (e) {}
      var dur = now() - s.t0;
      var session = { id: s.id, label: s.label, t0: s.t0, at: new Date(s.t0).toISOString(), dur: dur,
        actions: actions, xerkions: xerkions, clips: clips, scene0: scene0, sceneFinal: sceneFinal,
        counts: { actions: actions.length, xerkions: xerkions.length, clips: clips.length } };
      var list = loadSessions(); list.push(session); if (list.length > 200) list = list.slice(-200); saveSessions(list);
      emit('sealed', { id: session.id, dur: dur, actions: actions.length, xerkions: xerkions.length });
      return session;
    },
    list: loadSessions,
    get: function (id) { return loadSessions().filter(function (x) { return x.id === id; })[0] || null; },
    last: function () { var l = loadSessions(); return l.length ? l[l.length - 1] : null; },
    remove: function (id) { var l = loadSessions().filter(function (x) { return x.id !== id; }); saveSessions(l); return l; }
  };
})();
;
