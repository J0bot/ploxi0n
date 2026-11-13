/* bion jOSCapturesXion — servi seul pour ploxi0n (/px/bion-app/jOSCapturesXion.js) */
void 0;

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
