
(function () {
  "use strict";

  // (relecture adverse, 26.09) TOUJOURS celui-ci, jamais jOSb.esc : son mode diagnostic (localStorage xb:esc.ancien = 1) n'échappe ni " ni ',
  // et ce ploxion met des noms et des liens venus d'ailleurs (un glisser depuis une autre page) DANS des attributs (title, alt, href)
  function esc(s) {
    return (s == null ? '' : String(s)).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function linkify(s) {
    return esc(s).replace(/(https?:\/\/[^\s]+)/g, function (u) {
      return '<a href="' + u + '" target="_blank" rel="noopener">' + u + '</a>';
    });
  }
  function fmtTime(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return p(d.getDate()) + '/' + p(d.getMonth() + 1) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function agentColor(name) {
    name = name || '?';
    var h = 0;
    for (var i = 0; i < name.length; i++) { h = (h * 31 + name.charCodeAt(i)) >>> 0; }
    return 'hsl(' + (h % 360) + ',62%,60%)';
  }
  // ── les pièces (26.09) : utilitaires sans état ──
  function lisible(o) { o = +o || 0; return o < 1024 ? o + ' o' : o < 1048576 ? Math.round(o / 1024) + ' Ko' : (o / 1048576).toFixed(o < 10485760 ? 1 : 0).replace('.', ',') + ' Mo'; }   // (relecture d'usage) « 3,0 Mo », à la française
  function piecesOn() { try { var v = localStorage.getItem('xb:coord.pieces'); return !(v === 'off' || v === '0' || v === 'false'); } catch (e) { return true; } }
  var RE_PX = /^[a-z0-9][a-z0-9-]{0,63}$/;
  // un lien : comme CoordPieces::lienPropre (ni contrôle C0/C1, ni direction, ni invisible, ni " < > \\ `)
  function lienOk(u) { u = String(u || '').trim(); if (!u || u.length > 2000 || /[\u0000- \u007f-\u009f\u061c\u200b-\u200f\u2028-\u202e\u2060-\u2069\ufeff"<>\\`]/.test(u)) return ''; if (/^\/(?![\/\\])/.test(u)) return u; return /^https?:\/\/[^\/\s]/i.test(u) ? u : ''; }
  // les icônes en SVG (trait currentColor) : un Pi n'a pas toujours de police emoji (un 📎 y serait un carré vide)
  var SVG0 = '<svg class="crd__ico" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">';
  var ICO = {
    clip: 'M20.5 11.5l-8.2 8.2a5.2 5.2 0 0 1-7.4-7.4l8.8-8.8a3.5 3.5 0 0 1 5 5l-8.8 8.8a1.7 1.7 0 0 1-2.5-2.5l8.1-8.1',
    doc: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5',
    image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15.5 9.5h.01',
    texte: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M8.5 13h7M8.5 17h5',
    tsoin: 'M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9',
    lien: 'M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1',
    video: 'M4 6h11v12H4zM15 10l5-3v10l-5-3',
    audio: 'M9 18V6l10-2v12M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM19 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3',
    ploxion: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    archive: 'M4 7h16v13H4zM3 4h18v3H3zM10 11h4',
    tel: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2'
  };
  function ico(k) { return SVG0 + '<path d="' + (ICO[k] || ICO.doc) + '"/></svg>'; }
  function iconeDe(genre, mime) {
    mime = String(mime || '');
    if (genre === 'ploxion' || genre === 'lien' || genre === 'tsoin' || genre === 'texte') return ico(genre);
    return ico(/^image\//.test(mime) ? 'image' : /^video\//.test(mime) ? 'video' : /^audio\//.test(mime) ? 'audio' : /zip|tar|gzip|7z|rar/.test(mime) ? 'archive' : 'doc');
  }
  function nomPx(id) { try { var l = window.__PLOXIONS__ || [], m = l.filter(function (p) { return p && p.id === id; })[0]; return (m && m.name) || id; } catch (e) { return id; } }
  function csrf() { var m = document.querySelector('meta[name=csrf-token]'); return m ? (m.getAttribute('content') || '') : ''; }

  var LIVE = null; // posé au mount : { messages, attente }
  function describe() {
    var msgs = LIVE ? LIVE.messages() : [];
    var last = msgs.length ? msgs[msgs.length - 1] : null;
    var items = [{ p: 1, kind: 'stat', label: 'messages flotte', value: msgs.length }];
    if (LIVE && LIVE.attente()) items.push({ p: 1, kind: 'stat', label: 'pièces prêtes pour RS-1', value: LIVE.attente() });
    if (last) items.push({ p: 2, kind: 'text', label: last.agent || '?', value: (last.content || '').slice(0, 80) });
    if (piecesOn()) items.push({ p: 3, kind: 'text', label: 'glisse, colle ou joins un truc ici : il part à RS-1' });
    return { v: 1, id: 'coord', title: 'Xerxion Coord', icon: '🛰', items: items };
  }
  function mount(container, ctx) {
    var alive = true, timer = null, busRetry = null, offs = [];
    var messages = [], seen = {}, maxId = 0;
    var atBottom = true, gated = false;
    var POLL_MS = 30000, INIT_BEFORE = 2000000000, MAX_KEEP = 400;
    var feedUrl = (ctx && ctx.config && (ctx.config.feed
                    || (ctx.config.url ? String(ctx.config.url).replace(/\/+$/, '') + '/feed.json' : '')))
                    || '/coord/feed.json';
    var BASE = String(feedUrl).replace(/\/feed\.json(\?.*)?$/, '') || '/coord';
    var PIECES = piecesOn();                     // kill-switch page : xb:coord.pieces=off → le ploxion d'avant
    var srvActif = false;                         // le fil dit « pieces_actif » (serveur COORD_PIECES) : 📎, ＋, le dépôt
    var racActif = false;                         // (26.09) le fil dit « raccourci_actif » (serveur COORD_RACCOURCI) : la section « 📱 »
    var LIM = { max_ko: 25600, par_message: 12, mo_par_message: 100 };

    // ---- filtre agent persistant : jOSStore('coord') si dispo (guard), sinon localStorage ----
    function storeObj() { try { return window.jOSStore ? window.jOSStore('coord', { key: 'filter', title: 'Coord' }) : null; } catch (e) { return null; } }
    function loadFilter() {
      var v = '';
      try { var S = storeObj(); if (S && S.find) { var it = S.find(function (x) { return x && x.k === 'filter'; }); if (it && typeof it.agent === 'string') v = it.agent; } } catch (e) {}
      if (!v) { try { v = localStorage.getItem('coord:filter') || ''; } catch (e) {} }
      return v || '';
    }
    function saveFilter(a) {
      try { var S = storeObj(); if (S && S.upsert) { S.upsert(function (x) { return x && x.k === 'filter'; }, { k: 'filter', agent: a || '' }); return; } } catch (e) {}
      try { localStorage.setItem('coord:filter', a || ''); } catch (e) {}
    }
    var currentAgent = loadFilter();
    var racId = 'crd-rac-' + Math.random().toString(36).slice(2, 9);   // (26.09) la section « 📱 » : un id par fenêtre (aria-controls)

    container.innerHTML =
        // (relecture d'usage, 26.09) la bulle du bureau au-dessus de la fenêtre : « ⇪ », pas « 🛰 » (sans police emoji, un carré vide)
        '<div class="crd"' + (PIECES ? ' tabindex="-1" data-xb-recoit="⇪ envoyer à RS-1"' : '') + '>'
      + '  <div class="crd__bar">'
      + '    <span class="crd__t">🛰 <span>Xerxion Coord</span></span>'
      + '    <span class="crd__live" data-live></span>'
      // (26.09) « 📱 depuis ton iPhone » : montré seulement quand le fil dit « raccourci_actif » (admin, pièces ouvertes, COORD_RACCOURCI)
      + (PIECES ? '    <button type="button" class="crd__tel" data-tel aria-expanded="false" aria-controls="' + racId + '" aria-label="depuis ton iPhone : envoyer tes captures à RS-1" title="envoyer tes captures depuis ton iPhone (et ton Mac)" hidden>' + ico('tel') + '<span>iPhone</span></button>' : '')
      + '    <span class="crd__sel"><label>agent</label><select data-sel><option value="">tous</option></select></span>'
      + '  </div>'
      + (PIECES ? '  <div class="crd__rac" id="' + racId + '" data-rac role="region" aria-label="depuis ton iPhone" hidden></div>' : '')
      + '  <div class="crd__stream" data-stream><div class="crd__empty">Connexion au canal de la flotte…</div></div>'
      + (PIECES
        ? '  <div class="crd__compo" data-compo hidden>'
        // (26.09) les captures du Mac : la bande du dossier surveillé par le xion local (rendue par la section « LES CAPTURES DU MAC »)
        + '    <div class="crd__cap" data-capmac role="group" aria-label="les captures d\'écran de cet appareil" hidden></div>'
        + '    <div class="crd__chips" data-chips aria-label="pièces prêtes"></div>'
        + '    <div class="crd__prog" data-prog role="progressbar" aria-label="envoi à RS-1" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" hidden><i data-prog-bar></i><span data-prog-t></span></div>'
        + '    <div class="crd__cerr" data-cerr role="status" aria-live="polite"></div>'
        + '    <div class="crd__row">'
        // (relecture d'usage, 26.09) l'entrée n'est plus « hidden » (display:none la sortait du Tab : le 📎 était injoignable au clavier) : cachée
        // à l'œil seulement (.crd__fin), elle prend le focus, Entrée / Espace ouvrent le choix des fichiers, le 📎 montre le focus
        + '      <label class="crd__clip" data-clip title="joindre des fichiers (plusieurs)" hidden>' + ico('clip') + '<input type="file" multiple data-file class="crd__fin" aria-label="joindre des fichiers (plusieurs)"></label>'
        + '      <button type="button" class="crd__plus" data-plus title="un truc du xerboxion : fichier, ploxion, tsoin, lien" aria-haspopup="true" aria-expanded="false" hidden>＋</button>'
        + '      <textarea class="crd__in" data-in rows="1" maxlength="4000" placeholder="pour RS-1… (optionnel)" aria-label="message pour RS-1"></textarea>'
        + '      <button type="button" class="crd__go" data-go title="envoyer à RS-1 (Entrée)" aria-label="envoyer à RS-1">➤</button>'
        + '    </div>'
        + '    <div class="crd__pop" data-pop hidden></div>'
        + '  </div>'
        + '  <div class="crd__voile" data-voile hidden><b>⬇ lâche ici : pour RS-1</b><small>fichiers, ploxions, liens, textes — ils partent à ton ➤</small></div>'
        : '')
      + '  <div class="crd__foot"><span data-note>' + (PIECES ? 'glisse, colle ou joins : pour RS-1' : 'lecture seule · le post = CLI') + '</span><span class="crd__ferr" data-err></span><span class="crd__fmaj">màj auto 30 s</span></div>'
      + '</div>';

    var root = container.querySelector('.crd');
    var stream = root.querySelector('[data-stream]');
    var liveEl = root.querySelector('[data-live]');
    var sel = root.querySelector('[data-sel]');
    var footErr = root.querySelector('[data-err]');
    var noteEl = root.querySelector('[data-note]');

    function distinctCount() { var s = {}; messages.forEach(function (m) { if (m && m.agent) s[m.agent] = true; }); return Object.keys(s).length; }

    function updateLive(locked) {
      if (locked) { liveEl.innerHTML = '<span class="crd__dot" style="background:var(--xr-muted,#8aa0c0);box-shadow:none"></span>verrouillé'; return; }
      var n = distinctCount();
      liveEl.innerHTML = '<span class="crd__dot" data-dot></span>' + (n ? (n + ' agent' + (n > 1 ? 's' : '')) : 'en attente…');
    }
    function pulse() {
      var d = liveEl.querySelector('[data-dot]'); if (!d) return;
      try { d.style.transform = 'scale(1.7)'; requestAnimationFrame(function () { requestAnimationFrame(function () { d.style.transform = 'scale(1)'; }); }); } catch (e) {}
    }

    function rebuildAgents() {
      var set = {}; messages.forEach(function (m) { if (m && m.agent) set[m.agent] = true; });
      if (currentAgent) set[currentAgent] = true;   // garder le filtre courant même si 0 msg pour l'instant
      var list = Object.keys(set).sort();
      var html = '<option value="">tous (' + distinctCount() + ')</option>';
      list.forEach(function (a) { html += '<option value="' + esc(a) + '"' + (a === currentAgent ? ' selected' : '') + '>' + esc(a) + '</option>'; });
      sel.innerHTML = html;
      try { sel.value = currentAgent; } catch (e) {}
    }

    function matches(m) { return !currentAgent || (m && m.agent === currentAgent); }

    function mediaHtml(m) {
      if (!m.image_url) return '';
      var u = esc(m.image_url), k = m.media_kind || 'image';
      if (k === 'image') return '<div class="crd__media"><img class="crd__thumb" src="' + u + '" alt="tsoin" loading="lazy"></div>';
      var label = k === 'video' ? '🎬 tsoin vidéo' : k === 'audio' ? '🔊 tsoin audio' : '📎 tsoin';
      return '<div class="crd__media"><a class="crd__mlink" href="' + u + '" target="_blank" rel="noopener">' + label + '</a></div>';
    }

    // les pièces d'un message (26.09) : l'url refaite depuis l'id (jamais celle du fil telle quelle), tout échappé ; un lien n'est un lien
    // que s'il est http(s) ou une adresse du site ; un ploxion s'ouvre par jOS (sinon sa page /px/<id>)
    function piecesHtml(list) {
      if (!PIECES || !Array.isArray(list) || !list.length) return '';
      var h = '';
      list.slice(0, 20).forEach(function (p) {
        if (!p || !/^\d{1,12}$/.test(String(p.id))) return;
        var g = String(p.genre || 'fichier'), mime = String(p.mime || ''), ref = (p.ref && typeof p.ref === 'object') ? p.ref : {};
        var url = BASE + '/piece/' + p.id, nom = String(p.nom || '');
        h += '<div class="crd__pc" data-piece="' + esc(p.id) + '">';
        if (p.vignette && g !== 'ploxion' && g !== 'lien') h += '<img src="' + esc(url) + '" alt="' + esc(nom) + '" loading="lazy" data-ouvre="' + esc(url) + '">';
        h += '<span class="crd__pcn">' + iconeDe(g, mime) + ' ' + esc(nom) + '</span>';
        if (g === 'ploxion') {
          var px = RE_PX.test(String(ref.px || '')) ? String(ref.px) : '';
          h += '<span class="crd__pcm">ploxion · ' + esc(px) + '</span>' + (px ? '<span class="crd__pca"><button type="button" data-px="' + esc(px) + '">ouvrir</button></span>' : '');
        } else if (g === 'lien') {
          var u = lienOk(ref.url);
          h += '<span class="crd__pcm">' + esc(ref.url || '') + '</span>' + (u ? '<span class="crd__pca"><a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">ouvrir</a></span>' : '');
        } else {
          h += '<span class="crd__pcm">' + esc(mime || 'type inconnu') + ' · ' + esc(lisible(p.taille)) + ' · #' + esc(p.id) + '</span>'
            + '<span class="crd__pca"><a href="' + esc(url) + '" target="_blank" rel="noopener">ouvrir</a><a href="' + esc(url) + '?dl=1" download>⬇ télécharger</a></span>';
        }
        h += '</div>';
      });
      return h ? '<div class="crd__pcs">' + h + '</div>' : '';
    }

    function rowEl(m) {
      var el = document.createElement('div');
      el.className = 'crd__m' + (m.level === 'ping' ? ' ping' : '');
      var col = agentColor(m.agent);
      el.style.borderLeftColor = col;
      var head = '<span class="crd__agent"><span class="crd__adot" style="background:' + col + '"></span>' + esc(m.agent || '?') + '</span>';
      if (m.topic) head += '<span class="crd__topic">#' + esc(m.topic) + '</span>';
      if (m.level === 'ping') head += '<span class="crd__ping" title="ping — action/décision RS-7">🔔 ping</span>';
      head += '<span class="crd__time" title="' + esc(m.created_h || '') + '">' + esc(fmtTime(m.created_at)) + '</span>';
      var body = m.content ? ('<div class="crd__c">' + linkify(m.content) + '</div>') : '';
      el.innerHTML = '<div class="crd__h">' + head + '</div>' + body + mediaHtml(m) + piecesHtml(m.pieces);
      // (relecture d'usage, 26.09) une vignette arrive APRÈS le défilement vers le bas : le fil restait coupé (la fin du message, ses autres
      // pièces sous le bord). Chaque image chargée recolle le fil en bas s'il y était
      [].forEach.call(el.querySelectorAll('img'), function (im) { im.addEventListener('load', function () { if (alive && atBottom) stream.scrollTop = stream.scrollHeight; }); });
      var img = el.querySelector('.crd__thumb');
      if (img) {
        img.addEventListener('click', function () { try { window.open(img.src, '_blank', 'noopener'); } catch (e) {} });
        img.addEventListener('error', function () { var w = img.closest('.crd__media'); if (w) w.style.display = 'none'; });
      }
      return el;
    }

    function emptyHtml() {
      return '<div class="crd__empty">' + (currentAgent
        ? ('Aucun message de « ' + esc(currentAgent) +' » dans le récent.')
        : 'Le canal est vide pour l\'instant.') + '</div>';
    }

    function fullRender(forceScroll) {
      stream.innerHTML = '';
      var view = messages.filter(matches);
      if (!view.length) { stream.innerHTML = emptyHtml(); updateLive(); return; }
      var frag = document.createDocumentFragment();
      view.forEach(function (m) { frag.appendChild(rowEl(m)); });
      stream.appendChild(frag);
      if (forceScroll || atBottom) { stream.scrollTop = stream.scrollHeight; atBottom = true; }
      updateLive();
    }
    function appendNew(list) {
      var wasBottom = atBottom, any = false;
      var ph = stream.querySelector('.crd__empty'); if (ph) stream.innerHTML = '';
      list.forEach(function (m) { if (matches(m)) { stream.appendChild(rowEl(m)); any = true; } });
      if (!stream.childNodes.length) stream.innerHTML = emptyHtml();
      if (any && wasBottom) { stream.scrollTop = stream.scrollHeight; atBottom = true; }
      updateLive();
    }

    function ingest(list) {
      var added = [];
      (list || []).forEach(function (m) {
        if (!m || m.id == null || seen[m.id]) return;
        seen[m.id] = true; messages.push(m); added.push(m);
        if (m.id > maxId) maxId = m.id;
      });
      if (messages.length > MAX_KEEP) messages.splice(0, messages.length - MAX_KEEP);
      return added;
    }

    function byId(a, b) { return (a.id || 0) - (b.id || 0); }

    function clearError() { footErr.textContent = ''; }

    function gate() {
      gated = true;
      if (timer) { clearInterval(timer); timer = null; }
      stream.innerHTML =
          '<div class="crd__gate"><div class="em">🛰</div>'
        + '<b>Canal réservé</b>'
        + '<span>Le canal <b>/coord</b> est <b>admin only</b>. Connecte-toi en admin (RS-7) pour voir le flux de la flotte d\'agents.</span>'
        + '<div><button class="crd__retry" data-retry>réessayer</button></div></div>';
      var rb = stream.querySelector('[data-retry]');
      if (rb) rb.addEventListener('click', function () { start(); });
      clearError();
      updateLive(true);
      majCompo();
      // (ploxi0n 0.99.61, RS-7 : « des fois ça verrouille alors que je suis connecté ») un refus peut n'être qu'un passage : le jeton qui se
      // renouvelle, le relais de l'app qui renvoie la page de connexion le temps d'un réseau faible. Le verrou se réessaie tout seul (4 s,
      // 12 s, 30 s, puis chaque minute) et au retour dans l'app ; dès que le fil répond, il s'ouvre.
      if (regateT) clearTimeout(regateT);
      var d = [4000, 12000, 30000][Math.min(regateN, 2)] || 60000; regateN++;
      regateT = setTimeout(function () { regateT = null; if (alive && gated) load('init'); }, regateN > 3 ? 60000 : d);
    }
    var regateT = null, regateN = 0;
    function surVisible() { if (alive && gated && !document.hidden) load('init'); }
    document.addEventListener('visibilitychange', surVisible);

    function load(mode) {   // mode : 'init' (derniers ~50) | 'poll' (delta depuis maxId)
      if (!alive) return;
      var url = feedUrl + (mode === 'init' ? ('?before=' + INIT_BEFORE) : ('?since=' + maxId));
      fetch(url, { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
        .then(function (r) {
          // Anonyme (redirigé vers login) ou non-admin (403 ; 404 : la garde admin du labo) : canal réservé.
          if (r.status === 401 || r.status === 403 || r.status === 404) { gate(); return null; }
          if (r.redirected && /\/login|\/auth|\/connexion/i.test(r.url || '')) { gate(); return null; }
          var ct = (r.headers.get('content-type') || '');
          if (ct.indexOf('json') === -1) { gate(); return null; }   // page HTML (login) au lieu du JSON
          if (!r.ok) throw new Error('http ' + r.status);
          return r.json();
        })
        .then(function (d) {
          if (!alive || !d) return;
          if (gated) { gated = false; regateN = 0; if (regateT) { clearTimeout(regateT); regateT = null; } if (!timer) timer = setInterval(function () { if (alive && !gated) load(maxId ? 'poll' : 'init'); }, POLL_MS); updateLive(false); }
          gated = false;
          // (26.09) le serveur dit si l'envoi de pièces est ouvert, et ses bornes
          srvActif = !!d.pieces_actif;
          racActif = d.raccourci_actif === true;   // (26.09) la section « 📱 depuis ton iPhone » (COORD_RACCOURCI)
          if (d.pieces_limites && typeof d.pieces_limites === 'object') ['max_ko', 'par_message', 'mo_par_message'].forEach(function (k) { var v = +d.pieces_limites[k]; if (v > 0) LIM[k] = v; });
          majCompo();
          if (capMac) capMac.tic();   // (26.09) les captures du Mac : relues à chaque réponse du fil (30 s), sans minuteur de plus
          var arr = (d && d.messages) ? d.messages : [];
          if (mode === 'init') {
            messages = []; seen = {}; maxId = 0;
            arr = arr.slice().sort(byId);
            ingest(arr);
            rebuildAgents();
            fullRender(true);
          } else {
            var added = ingest(arr);
            if (added.length) { rebuildAgents(); appendNew(added); pulse(); }
          }
          clearError();
        })
        .catch(function () {
          if (!alive || gated) return;
          footErr.textContent = 'hors-ligne — nouvelle tentative…';
          if (!messages.length) stream.innerHTML = '<div class="crd__empty">Canal injoignable. Nouvelle tentative dans 30 s…</div>';
        });
    }

    function start() {
      gated = false; clearError();
      if (!timer) timer = setInterval(function () { if (alive && !gated) load(maxId ? 'poll' : 'init'); }, POLL_MS);
      load('init');
    }

    // ---- bus (jOSPorts) : IN `message` <- xerminal.coord / tsoin.coord ----
    // Un message vient d'être posté sur /coord : on rafraîchit depuis le serveur
    // (source de vérité). Payloads invalides / clés de câblage (__wired,__via) ignorés :
    // on ne LIT pas le payload, on re-tire le feed. 2e passe courte (write-lag du POST).
    function onBusMessage(payload) {
      if (!payload || typeof payload !== 'object') return;
      if (gated || !alive) return;
      load(maxId ? 'poll' : 'init');
      if (busRetry) clearTimeout(busRetry);
      busRetry = setTimeout(function () { if (alive && !gated) load(maxId ? 'poll' : 'init'); }, 1600);
    }
    if (window.jOSPorts && window.jOSPorts.on) {
      try { offs.push(window.jOSPorts.on('ploxion.coord.message', function (p) { try { onBusMessage(p); } catch (e) {} })); } catch (e) {}
    }

    stream.addEventListener('scroll', function () {
      atBottom = (stream.scrollHeight - stream.scrollTop - stream.clientHeight) < 40;
    });
    sel.addEventListener('change', function () {
      currentAgent = sel.value || ''; saveFilter(currentAgent); atBottom = true; fullRender(true);
    });
    // les boutons des pièces : ouvrir un ploxion, agrandir une vignette (délégué : un écouteur pour tout le fil)
    stream.addEventListener('click', function (e) {
      var t = e.target; if (!t || !t.closest) return;
      var b = t.closest('[data-px]');
      if (b) { var px = b.getAttribute('data-px'); if (RE_PX.test(px)) { e.preventDefault(); ouvrirPx(px); } return; }
      var im = t.closest('[data-ouvre]');
      if (im) { var u = im.getAttribute('data-ouvre'); if (/^\/[a-z0-9\/-]+$/i.test(u)) { try { window.open(u, '_blank', 'noopener'); } catch (x) {} } }
    });
    function ouvrirPx(px) {
      try { if (window.jOS && window.jOS.openPloxion && window.jOS.openPloxion(px)) return; } catch (e) {}
      try { if (window.jOSMobile && window.jOSMobile.open && window.jOSMobile.open(px, nomPx(px))) return; } catch (e) {}
      try { window.open('/px/' + px, '_blank', 'noopener'); } catch (e) {}
    }

    // ═════════════════════ ENVOYER DES TRUCS À RS-1 (26.09) — rien de ceci si xb:coord.pieces=off ═════════════════════
    var pend = [], seq = 0, busy = false, voileT = 0, urls = [], premier = null, coinT = 0;
    var REFUS = '';   // (27.09) pourquoi le dernier ajouter() a dit non : l'ACCUSÉ de la boîte aux lettres (le portail vers RS-1 du bureau, viderBoite)
    var compo = root.querySelector('[data-compo]'), chipsEl = root.querySelector('[data-chips]'), progEl = root.querySelector('[data-prog]');
    var progBar = root.querySelector('[data-prog-bar]'), progT = root.querySelector('[data-prog-t]'), cerr = root.querySelector('[data-cerr]');
    var clip = root.querySelector('[data-clip]'), fileIn = root.querySelector('[data-file]'), plus = root.querySelector('[data-plus]');
    var inEl = root.querySelector('[data-in]'), go = root.querySelector('[data-go]'), pop = root.querySelector('[data-pop]'), voile = root.querySelector('[data-voile]');
    function dire(t, ok) { if (!cerr) return; cerr.textContent = t || ''; cerr.className = 'crd__cerr' + (ok ? ' ok' : ''); }
    function prendDepot() { return PIECES && !gated && srvActif; }
    // le composer se montre quand le canal est ouvert ; 📎 / ＋ / le dépôt seulement si le serveur prend des pièces
    function majCompo() {
      if (!compo) return;
      compo.hidden = gated;
      if (clip) clip.hidden = !srvActif; if (plus) plus.hidden = !srvActif;
      if (inEl) inEl.placeholder = srvActif ? 'pour RS-1… (optionnel)' : 'un message pour la flotte…';
      if (noteEl) noteEl.textContent = gated ? 'lecture seule' : (srvActif ? 'glisse, colle ou joins : pour RS-1' : 'les pièces sont coupées côté serveur');
      if (!srvActif && pend.length) { vider(); }
      majTel();
      majGo();
      eviterCoin();   // (à chaque réponse du fil : revu toutes les 30 s au plus, sans minuteur de plus)
      // l'hôte qui s'ouvre (page pleine) glisse encore à la première réponse : un 2e regard, une fois, quand il est posé
      if (!coinT && compo && !compo.hidden) coinT = setTimeout(function () { if (alive) eviterCoin(); }, 700);
      if (premier && srvActif && !gated) premier();   // ce qui attendait la première réponse du fil (la demande, la poignée, la boîte)
    }
    // (relecture d'usage, 26.09) en page pleine au bureau (l'hôte des ploxions, plein écran), l'orbe du HUD (#xhud-fab : fixe, en bas à gauche,
    // au-dessus de tout) couvrait le 📎 : un clic ouvrait le HUD. Si quelque chose d'étranger à la coord couvre le 📎, la ligne se décale
    // juste assez (au plus 120 px) ; revu quand le composer se montre et au redimensionnement de la fenêtre. Rien si rien ne couvre.
    function eviterCoin() {
      if (!compo || compo.hidden || !clip || clip.hidden || !document.elementFromPoint) return;
      var row = compo.querySelector('.crd__row'); if (!row) return;
      row.style.paddingLeft = '';
      var r = clip.getBoundingClientRect(); if (!r.width || r.bottom <= 0 || r.top >= (window.innerHeight || 0)) return;
      var e = null; try { e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); } catch (x) { e = null; }
      if (!e || root.contains(e) || e.contains(root)) return;
      var o = e.getBoundingClientRect(), dx = Math.round(o.right - r.left + 6);
      if (o.width > 160 || o.height > 160) return;   // un voile ou une page entière par-dessus : pas un bouton flottant, on ne bouge pas
      if (dx > 0 && dx <= 120) row.style.paddingLeft = dx + 'px';
    }
    function majGo() { if (go) go.disabled = busy || (!pend.length && !(inEl && inEl.value.trim())); }
    function renderChips() {
      if (!chipsEl) return;
      urls.forEach(function (u) { try { URL.revokeObjectURL(u); } catch (e) {} }); urls = [];
      chipsEl.innerHTML = pend.map(function (p) {
        var th = '';
        if (p.fichier && /^image\/(png|jpe?g|gif|webp|avif|bmp)$/.test(p.mime || '') && (p.taille || 0) <= 8 * 1048576 && typeof URL !== 'undefined' && URL.createObjectURL) {
          try { var u = URL.createObjectURL(p.fichier); urls.push(u); th = '<img src="' + esc(u) + '" alt="">'; } catch (e) {}
        }
        return '<span class="crd__chip" data-k="' + esc(p.k) + '" title="' + esc(p.titre || p.nom) + '">' + (th || '<i aria-hidden="true">' + iconeDe(p.genre, p.mime) + '</i>')
          + '<b>' + esc(p.nom) + '</b>' + (p.taille ? '<small>' + esc(lisible(p.taille)) + '</small>' : (p.genre === 'ploxion' ? '<small>ploxion</small>' : ''))
          + '<button type="button" data-x aria-label="retirer ' + esc(p.nom) + '"' + (busy ? ' disabled' : '') + '>✕</button></span>';
      }).join('');
      majGo();
    }
    function vider() { pend = []; renderChips(); }
    // ajouter UNE pièce en attente ; les bornes connues (le serveur revérifie tout) : dit, jamais silencieux
    // (27.09) chaque « non » pose REFUS (coupe, occupe, plein, trop-gros, doublon) : l'accusé de la boîte aux lettres le rend au bureau
    function ajouter(p) {
      REFUS = '';
      if (!PIECES || !p) { REFUS = 'coupe'; return false; }
      if (busy) { REFUS = 'occupe'; dire('un envoi est en cours : attends qu\'il parte'); return false; }
      if (!srvActif) { REFUS = 'coupe'; dire('les pièces sont coupées côté serveur (COORD_PIECES)'); return false; }
      if (pend.length >= LIM.par_message) { REFUS = 'plein'; dire('au plus ' + LIM.par_message + ' pièces par message : envoie celles-ci d\'abord'); return false; }
      // (27.09) la taille CONNUE d'un fichier lu au ➤ (une icône du bureau : p.taille) est bornée MAINTENANT — avant, seulement au ➤, et tout le message tombait
      var tt = p.fichier ? (p.fichier.size || 0) : (typeof p.lire === 'function' ? (+p.taille || 0) : 0);
      if (tt > LIM.max_ko * 1024) { REFUS = 'trop-gros'; dire('trop gros : ' + (p.nom || 'fichier') + ' (' + lisible(tt) + ' > ' + lisible(LIM.max_ko * 1024) + ')'); return false; }
      if (p.fichier && pend.some(function (q) { return q.fichier && q.nom === p.nom && q.taille === (p.fichier.size || 0) && q.lm === (p.fichier.lastModified || 0); })) { REFUS = 'doublon'; return false; }   // le même, deux fois
      if (typeof p.lire === 'function' && p.chemin && pend.some(function (q) { return q.chemin === p.chemin && q.nom === p.nom; })) { REFUS = 'doublon'; return false; }   // (27.09) la même icône, deux fois
      if (p.genre === 'ploxion' && pend.some(function (q) { return q.genre === 'ploxion' && q.px === p.px; })) { REFUS = 'doublon'; return false; }
      if (p.genre === 'lien' && pend.some(function (q) { return q.genre === 'lien' && q.url === p.url; })) { REFUS = 'doublon'; return false; }
      p.k = 'p' + (++seq);
      p.nom = String(p.nom || 'fichier').replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 160) || 'fichier';
      if (p.fichier) { p.taille = p.fichier.size || 0; p.mime = p.mime || p.fichier.type || ''; p.lm = p.fichier.lastModified || 0; }
      pend.push(p); renderChips(); dire('');
      return true;
    }
    // (relecture d'usage, 26.09) l'heure que RS-7 lit sur son écran (toISOString était l'heure UTC : 15 h pour une capture de 17 h)
    function heureLocale(d) { var p = function (x) { return (x < 10 ? '0' : '') + x; }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '-' + p(d.getHours()) + '-' + p(d.getMinutes()) + '-' + p(d.getSeconds()); }
    // (relecture d'usage, 26.09) un DOSSIER glissé du système arrive comme un « fichier » sans type : le navigateur ne sait pas l'envoyer
    // (l'envoi échouait en « réseau coupé », à chaque ➤, les pièces gardées). On le repère pendant le dépôt (webkitGetAsEntry, lisible
    // seulement dans l'événement) : il n'est pas une pièce, c'est dit, ses voisins restent
    function dossiersDe(dt) {
      var n = {};
      try { var it = dt && dt.items ? dt.items : []; for (var i = 0; i < it.length; i++) { var e = it[i] && it[i].kind === 'file' && typeof it[i].webkitGetAsEntry === 'function' ? it[i].webkitGetAsEntry() : null; if (e && e.isDirectory && e.name) n[e.name] = 1; } } catch (x) {}
      return n;
    }
    function ajouterFichiers(list, source, dossiers) {
      var n = 0, refus = [];
      Array.prototype.slice.call(list || [], 0, 40).forEach(function (f) {
        if (!f) return;
        var nom = f.name || '';
        if (dossiers && dossiers[nom] && !f.type) { refus.push(nom); return; }
        // une image collée arrive souvent en « image.png » : un nom qui dit quand
        if (source === 'colle' && (!nom || /^image\.(png|jpe?g|gif|webp)$/i.test(nom))) { nom = 'capture-' + heureLocale(new Date()) + '.' + ((/\/(\w+)$/.exec(f.type || '') || [0, 'png'])[1]); }
        if (ajouter({ genre: 'fichier', fichier: f, nom: nom || 'fichier', source: source || 'systeme' })) n++;
      });
      if (refus.length) dire('un dossier ne part pas tel quel (' + refus.slice(0, 3).join(', ') + (refus.length > 3 ? '…' : '') + ') : glisse ses fichiers, ou zippe-le');
      return n;
    }
    function ajouterPx(px, source) { px = String(px || ''); if (!RE_PX.test(px)) return false; return ajouter({ genre: 'ploxion', px: px, nom: nomPx(px), source: source || 'lanceur' }); }
    function ajouterLien(u, nom) { u = lienOk(u); if (!u) { dire('un lien http(s) ou une adresse du site'); return false; } var h = ''; try { h = /^https?:/i.test(u) ? new URL(u).host : u; } catch (e) { h = u; } return ajouter({ genre: 'lien', url: u, nom: nom || h, titre: u }); }
    // (27.09) nom : celui que le dépôt propose (la liste d'un dossier du bureau : « photos (liste).txt »), nettoyé ; sinon texte-N.txt
    function nomTexte(n) { n = typeof n === 'string' ? n.replace(/[\u0000-\u001f\u007f\/\\:*?"<>|]/g, '').replace(/^[.\s]+/, '').trim().slice(0, 100) : ''; return n ? (/\.txt$/i.test(n) ? n : n + '.txt') : ''; }
    function ajouterTexte(t, source, nom) { t = String(t == null ? '' : t); if (!t.trim()) return false; nom = nomTexte(nom) || ('texte-' + (seq + 1) + '.txt'); var b = new Blob([t], { type: 'text/plain' }); try { b = new File([t], nom, { type: 'text/plain' }); } catch (e) {} return ajouter({ genre: 'texte', fichier: b, nom: nom, titre: t.slice(0, 200), source: source || 'texte' }); }
    // une pièce qu'on lit plus tard (un fichier de jOSFiles, une icône du bureau) : lue au ➤, jamais au dépôt (le Pi)
    function ajouterLecture(nom, lire, o) { o = o || {}; if (typeof lire !== 'function') return false; return ajouter({ genre: 'fichier', lire: lire, nom: nom, taille: +o.taille || 0, mime: o.mime || '', chemin: o.chemin && !/^idb:/.test(o.chemin) ? String(o.chemin).slice(0, 700) : '', source: o.source || 'xerboxion' }); }
    function ajouterTsoin(src) {
      var P = window.jOSPartage, t = null;
      try { t = P && typeof P.tsoinDe === 'function' ? P.tsoinDe(src) : null; } catch (e) { t = null; }
      if (!t || !t.payload) { dire('ce tsoin ne se lit pas ici (jOSPartage absent ?)'); return false; }
      var json = JSON.stringify(t.payload), lab = String(t.payload.label || 'tsoin').replace(/[^\wÀ-ɏ -]+/g, '').trim().slice(0, 40) || 'tsoin';
      var f = null; try { f = new File([json], 'tsoin-' + lab.replace(/\s+/g, '-') + '.json', { type: 'application/json' }); } catch (e) { f = new Blob([json], { type: 'application/json' }); }
      return ajouter({ genre: 'tsoin', fichier: f, nom: (f && f.name) || 'tsoin.json', source: 'tsoin' });
    }
    // ce qu'on lâche ou colle : fichiers > ploxion > fichier du xerboxion > lien > texte
    function depuisTransfert(dt, source) {
      if (!dt) return 0;
      var types = []; try { types = Array.prototype.slice.call(dt.types || []); } catch (e) {}
      if (dt.files && dt.files.length) return ajouterFichiers(dt.files, source, dossiersDe(dt));
      var g = function (t) { try { return types.indexOf(t) >= 0 ? (dt.getData(t) || '') : ''; } catch (e) { return ''; } };
      var px = g('text/ploxion'); if (px) return ajouterPx(px.trim(), 'lanceur') ? 1 : 0;
      var xf = g('text/x-xerboxion-fichier');
      if (xf) { var it = null; try { it = JSON.parse(xf); } catch (e) {} var ch = it && typeof it.path === 'string' ? it.path : '';
        if (ch && window.jOSFiles && window.jOSFiles.readBlob) return ajouterLecture(it.name || ch.split('/').pop(), function () { return window.jOSFiles.readBlob(ch); }, { taille: it.size, mime: it.mime, chemin: ch, source: 'xerboxion' }) ? 1 : 0; }
      var ul = g('text/uri-list');
      if (ul) { var l = ul.split(/\r?\n/).filter(function (x) { return x && x.charAt(0) !== '#'; })[0]; if (l && ajouterLien(l.trim())) return 1; }
      var tx = g('text/plain');
      if (tx) { var t = tx.trim(); if (/^https?:\/\/\S+$/i.test(t) && t.length <= 2000) return ajouterLien(t) ? 1 : 0; return ajouterTexte(tx, 'texte') ? 1 : 0; }
      return 0;
    }
    // un texte lâché DANS le champ y reste (le navigateur l'insère) ; ailleurs sur la fenêtre, tout devient une pièce
    function accepte(dt, cible) {
      if (!dt) return false;
      var ty = []; try { ty = Array.prototype.slice.call(dt.types || []); } catch (e) {}
      var fort = ty.indexOf('Files') >= 0 || ty.indexOf('text/ploxion') >= 0 || ty.indexOf('text/x-xerboxion-fichier') >= 0 || !!(dt.files && dt.files.length);
      if (fort) return true;
      if (cible && cible === inEl) return false;
      return ty.indexOf('text/uri-list') >= 0 || ty.indexOf('text/plain') >= 0;
    }
    // le dépôt de jOSFiles s'efface : c'est nous qui prenons (son voile, montré par son dragenter en capture, part dans le même tour)
    function finDepotGlobal() { try { if (window.jOSFiles && typeof window.jOSFiles.finDepot === 'function') window.jOSFiles.finDepot(); } catch (e) {} }
    function montrerVoile() { if (!voile) return; voile.hidden = false; if (voileT) clearTimeout(voileT); voileT = setTimeout(cacherVoile, 1500); }   // filet : un glisser annulé n'envoie rien
    function cacherVoile() { if (voileT) { clearTimeout(voileT); voileT = 0; } if (voile) voile.hidden = true; }
    function surDrag(e) {
      if (!prendDepot() || !accepte(e.dataTransfer, e.target)) { if (e.type === 'dragover' && e.target === inEl) cacherVoile(); return; }
      e.preventDefault(); e.stopPropagation();
      try { e.dataTransfer.dropEffect = 'copy'; } catch (x) {}
      finDepotGlobal(); montrerVoile();
    }
    function surQuitte(e) { var r = e.relatedTarget; if (!r || !root.contains(r)) cacherVoile(); }
    function surDepot(e) {
      if (!prendDepot() || !accepte(e.dataTransfer, e.target)) { cacherVoile(); return; }
      e.preventDefault(); e.stopPropagation();
      cacherVoile(); finDepotGlobal();
      if (depuisTransfert(e.dataTransfer, 'systeme')) { try { inEl.focus({ preventScroll: true }); } catch (x) {} }
    }
    // coller : des fichiers (une capture d'écran) → des pièces ; un lien collé HORS du champ → une pièce ; un texte hors du champ → dans le champ
    function surColler(e) {
      if (!prendDepot() || e.defaultPrevented || !e.clipboardData) return;
      var cd = e.clipboardData, fs = [], its = cd.items || [];
      for (var i = 0; i < its.length; i++) { if (its[i].kind === 'file') { var f = its[i].getAsFile && its[i].getAsFile(); if (f) fs.push(f); } }
      if (!fs.length && cd.files && cd.files.length) fs = Array.prototype.slice.call(cd.files);
      if (fs.length) { e.preventDefault(); e.stopPropagation(); ajouterFichiers(fs, 'colle'); return; }
      var t = ''; try { t = cd.getData('text/plain') || ''; } catch (x) {}
      // (07.11) un LONG texte collé (un run du clicker, un tsoin, un log) devient une pièce entière : avant, le champ le coupait à 4000
      // caractères sans le dire (RS-7 a envoyé sa run de clickion : coupée en plein milieu)
      if (t.length > 3000) { e.preventDefault(); e.stopPropagation(); ajouterTexte(t, 'colle', /^\s*[\[{]/.test(t) ? 'collé.json' : 'collé.txt'); return; }
      if (e.target === inEl) return;   // du texte court dans le champ : le navigateur le colle
      if (!t) return;
      e.preventDefault(); e.stopPropagation();
      if (/^\s*https?:\/\/\S+\s*$/i.test(t)) { ajouterLien(t.trim()); return; }
      inEl.value = (inEl.value ? inEl.value + ' ' : '') + t.slice(0, 4000 - inEl.value.length); majGo(); try { inEl.focus(); } catch (x) {}
    }
    // une icône du bureau v2 lâchée sur la fenêtre (son glisser au pointeur : « xb:recoit » sur [data-xb-recoit])
    function surRecoit(e) {
      var d = e && e.detail; if (!prendDepot() || !d || typeof d !== 'object') return;
      if (d.genre === 'ploxion' || d.px) { ajouterPx(d.px, 'bureau'); return; }
      if (typeof d.lire === 'function') { ajouterLecture(d.nom || 'fichier', d.lire, { taille: d.taille, mime: d.mime, chemin: d.chemin, source: 'bureau' }); return; }
      if (typeof d.texte === 'string') { ajouterTexte(d.texte, 'bureau', typeof d.nom === 'string' && d.nom ? d.nom + ' (liste)' : ''); return; }   // (27.09) la chip d'un dossier porte son nom
      if (typeof d.url === 'string') ajouterLien(d.url);
    }
    // la boîte aux lettres (le bureau « envoyer à RS-1 », jOSShare « 🛰 RS-1 ») : vidée ici, jamais relue ; au-delà de 60 s, périmée
    // (27.09) L'ACCUSÉ (le portail vers RS-1 du bureau, docs/dev/33 « Le portail vers RS-1 ») : un dépôt qui porte x.recu apprend s'il est devenu
    // une chip — x.recu(true) — ou pourquoi pas — x.recu(false, REFUS : coupe | occupe | plein | trop-gros | doublon | perime) ; son x.parti
    // est gardé sur la chip et appelé quand LE ➤ qui l'emporte a réussi (envoyer). Des fonctions de la page : jamais sur le bus, jamais un nom.
    function prendre(x, now) {
      REFUS = '';
      if (x.t && now - x.t > 60000) { REFUS = 'perime'; return false; }
      var s = typeof x.source === 'string' ? x.source : 'partage';
      if (typeof x.message === 'string') { if (inEl && !inEl.value) { inEl.value = x.message.slice(0, 4000); majGo(); } return false; }
      if (x.genre === 'ploxion') return ajouterPx(x.px, s);
      if (x.genre === 'lien') return ajouterLien(x.url, x.nom);
      if (x.genre === 'texte') return ajouterTexte(x.texte, s, x.nom);
      if (x.genre === 'tsoin') return ajouterTsoin(x.tsoin);
      if (x.fichier && typeof Blob !== 'undefined' && x.fichier instanceof Blob) return ajouter({ genre: 'fichier', fichier: x.fichier, nom: x.nom || x.fichier.name || 'fichier', source: s });
      if (typeof x.lire === 'function') return ajouterLecture(x.nom || 'fichier', x.lire, { taille: x.taille, mime: x.mime, chemin: x.chemin, source: s });
      return false;
    }
    function viderBoite() {
      var B = window.__coordAJoindre; if (!Array.isArray(B) || !B.length) return 0;
      var l = B.splice(0, B.length), n = 0, now = Date.now();
      l.forEach(function (x) {
        if (!x || typeof x !== 'object') return;
        var k0 = pend.length, pris = !!prendre(x, now);
        if (pris) { n++; if (typeof x.parti === 'function' && pend[k0]) pend[k0].parti = x.parti; }
        if (typeof x.recu === 'function') { try { x.recu(pris, pris ? '' : (REFUS || 'refus')); } catch (e) {} }
      });
      if (n) try { root.focus({ preventScroll: true }); } catch (e) {}
      return n;
    }
    // la demande de jOSXerPrefs (params.joindre : « px:<id> », « lien:<url> », « texte:<…> ») et la poignée de jOSFiles.fichier
    function joindreParams(p) {
      var j = p && typeof p.joindre === 'string' ? p.joindre : ''; if (!j) return;
      if (/^px:/.test(j)) ajouterPx(j.slice(3), 'bureau'); else if (/^lien:/.test(j)) ajouterLien(j.slice(5)); else if (/^texte:/.test(j)) ajouterTexte(j.slice(6), 'bureau');
    }
    function ajouterPoignee(h) { if (!h || typeof h.lire !== 'function') return; ajouterLecture(h.nom || 'fichier', h.lire, { taille: h.taille, mime: h.mime, chemin: h.chemin, source: 'xerboxion' }); }

    // ── l'envoi : UN XHR multipart (la progression), tout ou rien côté serveur ; les pièces restent tant que ça n'est pas parti ──
    function progres(pct, txt) {
      if (!progEl) return;
      if (pct == null) { progEl.hidden = true; progEl.setAttribute('aria-valuenow', '0'); return; }
      progEl.hidden = false; pct = Math.max(0, Math.min(100, Math.round(pct)));
      progEl.setAttribute('aria-valuenow', String(pct)); progBar.style.width = pct + '%'; progT.textContent = txt || (pct + ' %');
    }
    function agentDe() { var a = ''; try { a = (localStorage.getItem('coord-agent') || '').trim(); } catch (e) {} return /^[a-z0-9-]{1,80}$/.test(a) ? a : 'rs-7'; }
    function lireTout(list) {
      return Promise.all(list.map(function (p) {
        if (p.fichier || typeof p.lire !== 'function') return Promise.resolve(p);
        return Promise.resolve().then(function () { return p.lire(); }).then(function (b) {
          if (!b || typeof b.size !== 'number') throw new Error('illisible : ' + p.nom);
          if (b.size > LIM.max_ko * 1024) throw new Error('trop gros : ' + p.nom + ' (' + lisible(b.size) + ')');
          var f = b; try { if (!(typeof File !== 'undefined' && b instanceof File && b.name)) f = new File([b], p.nom, { type: p.mime || b.type || '' }); } catch (e) {}
          p.fichier = f; p.taille = b.size; p.mime = p.mime || b.type || ''; p.lire = null; renderChips();
          return p;
        }, function (e) { throw new Error(e && /^(illisible|trop gros)/.test(e.message) ? e.message : 'illisible : ' + p.nom); });
      }));
    }
    function envoyer() {
      if (busy || !alive || gated) return;
      var texte = inEl ? inEl.value.trim() : '';
      if (!pend.length && !texte) return;
      if (!srvActif) return envoyerTexteAvant(texte);
      busy = true; majGo(); renderChips(); dire(''); progres(0, 'préparation…');
      var list = pend.slice();
      lireTout(list).then(function () {
        var octets = 0, fd = new FormData(), desc = [], n = 0;
        fd.append('agent', agentDe()); if (texte) fd.append('content', texte);
        list.forEach(function (p) {
          if (p.fichier) {
            octets += p.fichier.size || 0;
            fd.append('fichiers[]', p.fichier, p.nom);
            var d = { genre: p.genre, fichier: n++, source: p.source || 'systeme' }; if (p.chemin) d.chemin = p.chemin; desc.push(d);
          } else if (p.genre === 'ploxion') desc.push({ genre: 'ploxion', px: p.px, nom: p.nom, source: p.source || 'lanceur' });
          else if (p.genre === 'lien') desc.push({ genre: 'lien', url: p.url, nom: p.nom });
        });
        if (octets > LIM.mo_par_message * 1048576) throw new Error('au plus ' + LIM.mo_par_message + ' Mo par message (' + lisible(octets) + ')');
        fd.append('pieces', JSON.stringify(desc));
        return new Promise(function (res, rej) {
          var x = new XMLHttpRequest();
          x.open('POST', BASE + '/pieces');
          x.setRequestHeader('Accept', 'application/json'); x.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); x.setRequestHeader('X-CSRF-TOKEN', csrf());
          if (x.upload) x.upload.onprogress = function (ev) { if (ev && ev.lengthComputable && ev.total) progres(ev.loaded * 100 / ev.total, Math.round(ev.loaded * 100 / ev.total) + ' % · ' + list.length + ' pièce' + (list.length > 1 ? 's' : '') + (octets ? ' · ' + lisible(octets) : '')); };
          x.onload = function () {
            var j = null; try { j = JSON.parse(x.responseText || 'null'); } catch (e) {}
            if (x.status >= 200 && x.status < 300 && j && j.ok) return res(j);
            var m = (j && (j.message || j.error)) || '';
            if (j && j.errors && typeof j.errors === 'object') { var k0 = Object.keys(j.errors)[0]; if (k0 && j.errors[k0] && j.errors[k0][0]) m = j.errors[k0][0]; }
            rej(new Error(x.status === 404 ? 'l\'envoi de pièces est coupé côté serveur (ou tu n\'es plus admin)' : x.status === 419 ? 'session expirée : recharge la page' : x.status === 413 ? 'trop lourd pour le serveur' : (m || ('refusé (' + x.status + ')'))));
          };
          x.onerror = function () { rej(new Error('réseau coupé : rien n\'est parti, réessaie')); };
          x.send(fd);
        });
      }).then(function () {
        // (27.09) l'accusé « parti » : chaque pièce venue du portail vers RS-1 le dit au bureau (une fois ; « N envoyés » y compte ce qui est PARTI)
        list.forEach(function (p) { var f = p.parti; if (typeof f === 'function') { p.parti = null; try { f(); } catch (e) {} } });
        busy = false; pend = []; renderChips(); progres(null);
        if (inEl) { inEl.value = ''; auto(); }
        dire('✓ parti à RS-1', true);
        setTimeout(function () { if (alive && cerr && cerr.classList.contains('ok')) dire(''); }, 4000);
        load(maxId ? 'poll' : 'init');
      }).catch(function (e) {
        busy = false; progres(null); renderChips();
        dire('⚠ ' + (e && e.message ? e.message : 'échec') + (pend.length ? ' — les pièces sont gardées' : ''));
      });
    }
    // serveur sans pièces (COORD_PIECES=false) : la ligne de texte part par POST /coord, le chemin d'avant
    function envoyerTexteAvant(texte) {
      if (!texte) return;
      busy = true; majGo();
      var fd = new FormData(); fd.append('agent', agentDe()); fd.append('content', texte);
      fetch(BASE, { method: 'POST', body: fd, credentials: 'same-origin', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': csrf() } })
        .then(function (r) { if (!r.ok) throw new Error('refusé (' + r.status + ')'); inEl.value = ''; auto(); dire('✓ posté', true); load(maxId ? 'poll' : 'init'); })
        .catch(function (e) { dire('⚠ ' + e.message); })
        .then(function () { busy = false; majGo(); });
    }
    function auto() { if (!inEl) return; inEl.style.height = 'auto'; inEl.style.height = Math.min(120, Math.max(40, inEl.scrollHeight)) + 'px'; }

    // ── ＋ : un truc du xerboxion ──
    // (relecture d'usage, 26.09) le focus était DANS le menu : il revient à la ligne (Entrée envoie), jamais perdu sur la page (Échap, lui, le rend à ＋)
    function fermerPop() { if (pop && !pop.hidden) { var dedans = pop.contains(document.activeElement); pop.hidden = true; pop.innerHTML = ''; if (plus) plus.setAttribute('aria-expanded', 'false'); if (dedans && inEl) { try { inEl.focus({ preventScroll: true }); } catch (e) {} } } }
    function ouvrirPop(vue) {
      if (!pop) return; pop.hidden = false; if (plus) plus.setAttribute('aria-expanded', 'true');
      var F = window.jOSFiles, S = window.jOSSession, P = window.jOSPartage;
      if (vue === 'px') {
        pop.innerHTML = '<input type="search" data-q placeholder="un ploxion…" aria-label="chercher un ploxion"><div data-l></div>';
        var q = pop.querySelector('[data-q]'), l = pop.querySelector('[data-l]');
        var lister = function () { var s = String(q.value || '').toLowerCase().trim(), all = (window.__PLOXIONS__ || []).filter(function (p) { return p && RE_PX.test(String(p.id)) && (!s || String(p.id).indexOf(s) >= 0 || String(p.name || '').toLowerCase().indexOf(s) >= 0); }).slice(0, 30);
          l.innerHTML = all.length ? all.map(function (p) { return '<button type="button" data-pxa="' + esc(p.id) + '">' + esc(p.icon || '▦') + ' ' + esc(p.name || p.id) + ' <small>' + esc(p.id) + '</small></button>'; }).join('') : '<small>aucun ploxion</small>'; };
        q.addEventListener('input', lister); lister(); try { q.focus(); } catch (e) {}
        return;
      }
      if (vue === 'tsoin') {
        var ses = []; try { ses = (S && S.list ? S.list() : []).slice(-8).reverse(); } catch (e) { ses = []; }
        pop.innerHTML = ses.length ? ses.map(function (s, i) { return '<button type="button" data-ts="' + i + '">⧗ ' + esc(s.label || s.id) + ' <small>' + esc((s.counts && s.counts.actions) || 0) + ' gestes</small></button>'; }).join('') : '<small>aucun tsoin enregistré sur cet appareil</small>';
        pop.__ses = ses;
        return;
      }
      if (vue === 'lien') {
        pop.innerHTML = '<input type="url" data-u placeholder="https://…" aria-label="un lien"><button type="button" data-ua>🔗 joindre ce lien</button>';
        try { pop.querySelector('[data-u]').focus(); } catch (e) {}
        return;
      }
      pop.innerHTML =
          // (relecture d'usage, 26.09) le 📎 aussi, en tête : au clavier (Tab est pris par le bureau), c'est le chemin vers les fichiers de l'appareil
          '<button type="button" data-v="appareil">📎 des fichiers de l\'appareil…</button>'
        + '<button type="button" data-v="fichier"' + (F && F.pick ? '' : ' disabled') + '>🗂 un fichier du xerboxion</button>'
        + '<button type="button" data-v="px">▦ un ploxion…</button>'
        + '<button type="button" data-v="tsoin"' + (S && S.list && P && P.tsoinDe ? '' : ' disabled') + '>⧗ un tsoin…</button>'
        + '<button type="button" data-v="lien">🔗 un lien…</button>'
        + '<small>ou glisse-les sur la fenêtre, ou colle-les (Ctrl+V)</small>';
      // (relecture d'usage, 26.09) au clavier, le menu était injoignable : le focus restait sur ＋ et Tab ouvre le sélecteur de fenêtres du
      // bureau. Ouvert, il prend le focus (son 1er choix) ; ↓ ↑ s'y déplacent (popTouche), Échap le ferme
      var b0 = pop.querySelector('button:not([disabled])'); if (b0) { try { b0.focus({ preventScroll: true }); } catch (e) {} }
    }
    // ↓ ↑ Début Fin dans le menu ＋ (ses choix et ses champs, dans l'ordre) ; vrai si la touche a servi
    function popTouche(e) {
      var k = e.key; if (k !== 'ArrowDown' && k !== 'ArrowUp' && k !== 'Home' && k !== 'End') return false;
      var l = [].slice.call(pop.querySelectorAll('button:not([disabled]),input')); if (!l.length) return false;
      var i = l.indexOf(document.activeElement), j = k === 'Home' ? 0 : k === 'End' ? l.length - 1 : k === 'ArrowDown' ? (i + 1) % l.length : (i <= 0 ? l.length - 1 : i - 1);
      if ((k === 'Home' || k === 'End') && document.activeElement && document.activeElement.tagName === 'INPUT') return false;   // dans un champ : le curseur
      e.preventDefault(); try { l[j].focus({ preventScroll: true }); } catch (x) {}
      return true;
    }

    // ═══════════ « 📱 DEPUIS TON iPHONE » (26.09, RS-7 : « pour le ploxion coord … il faut un moyen de détecter les screenshot ») ═══════════
    // Safari ne sait pas être une cible de partage (Android, lui, l'est : le share_target du manifeste → POST /coord/partage, la session
    // suffit). Pour l'iPhone et le Mac : un RACCOURCI (app Raccourcis) « Envoyer à RS-1 », dans la feuille de partage, POSTe la capture sur
    // /coord/pieces avec un jeton X-Xer-Jeton au seul droit « coord.envoyer » (App\Support\Jetons : il ne lit rien ; compte admin). Ici : le
    // créer (POST /px/jetons ; le clair montré UNE fois et jamais gardé — ni localStorage, ni bus, ni describe —, effacé à la fermeture et à
    // l'unmount), le révoquer, et les étapes exactes du raccourci, avec « copier » pour l'URL, l'en-tête, le champ et le jeton. Rien n'est
    // demandé au serveur avant d'ouvrir la section, aucun minuteur au repos. Pas de fichier .shortcut : il faut l'app d'Apple pour en signer un.
    var tel = root.querySelector('[data-tel]'), rac = root.querySelector('[data-rac]'), clair = '', clairId = '';
    var RAC_SCOPE = 'coord.envoyer', RAC_CHAMP = 'fichiers[]', RAC_EN_TETE = 'X-Xer-Jeton';
    function racUrl() { var o = ''; try { o = window.location.origin || ''; } catch (e) {} return o + BASE + '/pieces'; }
    function racHote() { var h = ''; try { h = window.location.host || ''; } catch (e) {} return h || 'ce site'; }
    function majTel() {
      if (!tel) return;
      var voir = PIECES && !gated && srvActif && racActif;
      tel.hidden = !voir;
      if (!voir && rac && !rac.hidden) fermerRac();
    }
    function racDire(t, ok) { var e = rac && rac.querySelector('[data-rac-err]'); if (e) { e.textContent = t || ''; e.className = 'crd__race' + (ok ? ' ok' : ''); } }
    function jFetch(u, corps) {
      var init = { credentials: 'same-origin', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } };
      if (corps) { init.method = 'POST'; init.headers['Content-Type'] = 'application/json'; init.headers['X-CSRF-TOKEN'] = csrf(); init.body = JSON.stringify(corps); }
      return fetch(u, init);
    }
    function copier(v, b) {
      if (!v) return;
      var fait = function (ok) {
        if (!b || !alive) return;
        var t0 = b.getAttribute('data-t0') || b.textContent; b.setAttribute('data-t0', t0);
        // (relecture adverse, 26.09) le nom accessible dit QUOI (« copier l'URL »…) et suit le retour (« copié : l'URL »)
        var a0 = b.getAttribute('data-a0') || b.getAttribute('aria-label') || ''; if (a0) b.setAttribute('data-a0', a0);
        b.textContent = ok ? 'copié ✓' : 'sélectionne-le et copie-le';
        if (a0) b.setAttribute('aria-label', (ok ? 'copié : ' : 'copie impossible, sélectionne-le : ') + a0.replace(/^copier /, ''));
        setTimeout(function () { if (alive && b.isConnected) { b.textContent = t0; if (a0) b.setAttribute('aria-label', a0); } }, 1600);
      };
      var repli = function () {
        try { var ta = document.createElement('textarea'); ta.value = v; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; rac.appendChild(ta); ta.select(); var ok = !!(document.execCommand && document.execCommand('copy')); ta.remove(); return ok; } catch (e) { return false; }
      };
      try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(v).then(function () { fait(true); }, function () { fait(repli()); }); return; } } catch (e) {}
      fait(repli());
    }
    function renderRac() {
      if (!rac) return;
      rac.innerHTML =
          '<h3>' + ico('tel') + ' depuis ton iPhone (et ton Mac) <button type="button" data-rac-x aria-label="fermer">✕</button></h3>'
        + '<p>Safari ne sait pas être une cible de partage. Un <b>raccourci</b> (app Raccourcis) « Envoyer à RS-1 », dans la feuille de partage, envoie ta capture ici avec un <b>jeton</b> : il ne sert qu\'à envoyer à RS-1 (il ne lit rien), et il se révoque ici. Rien ne part sans ton geste.</p>'
        + '<div class="crd__racl" data-rac-liste><small class="crd__racm">lecture des jetons…</small></div>'
        + '<div class="crd__racn"><input type="text" data-rac-nom maxlength="60" value="raccourci iPhone" aria-label="nom du jeton (l\'appareil)"><button type="button" data-rac-creer>créer le jeton</button></div>'
        + '<div class="crd__racc" data-rac-clair hidden><b>ton jeton, montré une seule fois :</b><div class="crd__racn"><code data-rac-jeton></code><button type="button" data-copie="jeton" aria-label="copier le jeton">copier</button></div>'
        + '<small class="crd__racm">colle-le maintenant dans le raccourci (étape 4). Perdu ? révoque-le et crée-en un autre. Il n\'est gardé nulle part ici : il s\'efface quand tu fermes cette section. <b>Ne partage jamais ce raccourci</b> (lien iCloud, AirDrop) : ton jeton est dedans.</small></div>'
        + '<div class="crd__racv"><span>URL</span><code data-rac-url>' + esc(racUrl()) + '</code><button type="button" data-copie="url" aria-label="copier l\'URL">copier</button>'
        + '<span>en-tête</span><code>' + esc(RAC_EN_TETE) + '</code><button type="button" data-copie="entete" aria-label="copier le nom de l\'en-tête ' + esc(RAC_EN_TETE) + '">copier</button>'
        + '<span>champ</span><code>' + esc(RAC_CHAMP) + '</code><button type="button" data-copie="champ" aria-label="copier le nom du champ ' + esc(RAC_CHAMP) + '">copier</button></div>'
        + '<ol data-rac-etapes>'
        + '<li>Ouvre l\'app <b>Raccourcis</b> › <b>＋</b>, nomme le raccourci <b>Envoyer à RS-1</b>.</li>'
        // (26.09) « (i) » et « Contrôle+Maj+Cmd+4 » en texte : sans police de symboles (un Pi, chromium headless), ⓘ et ⌃⇧⌘ étaient des carrés vides
        // (relecture adverse, 26.09) les libellés d'iOS en français (« S'il n'y a pas d'entrée » › « Arrêter et répondre ») ; la notification DANS
        // la boucle, avec le « message » de la réponse (un refus le dit : jamais un « parti à RS-1 » fixe) ; « Toujours autoriser » au 1er envoi
        + '<li>Touche <b>(i)</b> (les détails du raccourci) › active <b>Afficher dans la feuille de partage</b>. En haut, « Recevoir … depuis Feuille de partage » : garde <b>Images</b> (et <b>Fichiers</b> pour le reste) ; « S\'il n\'y a pas d\'entrée » : <b>Arrêter et répondre</b> (les libellés bougent un peu d\'une version d\'iOS à l\'autre).</li>'
        + '<li>Ajoute <b>Répéter avec chaque élément</b> de « <b>Entrée du raccourci</b> » : une capture = un envoi.</li>'
        + '<li>Dedans, ajoute <b>Obtenir le contenu de l\'URL</b> : l\'URL ci-dessus ; touche <b>›</b> : <b>Méthode</b> POST ; <b>En-têtes</b> : <code>' + esc(RAC_EN_TETE) + '</code> = ton jeton, et <code>Accept</code> = <code>application/json</code> ; <b>Corps de la requête</b> : <b>Formulaire</b>, un champ <b>Fichier</b> : clé <code>' + esc(RAC_CHAMP) + '</code>, valeur <b>Élément répété</b>.</li>'
        + '<li data-rac-notif>Toujours <b>dans la boucle</b>, sous l\'envoi : <b>Obtenir la valeur du dictionnaire</b> <code>message</code> dans « <b>Contenu de l\'URL</b> », puis <b>Afficher la notification</b> avec « <b>Valeur du dictionnaire</b> ». Elle dit « parti à RS-1 : 1 pièce », ou pourquoi rien n\'est parti (jeton refusé, trop gros, quota). Pas de notification fixe : Raccourcis peut continuer même quand le serveur refuse.</li>'
        + '<li>Essaie : une capture › touche sa vignette › <b>Partager</b> › <b>Envoyer à RS-1</b>. Au premier envoi, Raccourcis demande s\'il peut envoyer à « ' + esc(racHote()) + ' » : <b>Toujours autoriser</b> (sinon la question revient à chaque capture). Elle arrive dans ce fil, <b>#raccourci</b>.</li>'
        + '</ol>'
        + '<p class="crd__racm" data-rac-partage><b>Ne partage jamais ce raccourci</b> (lien iCloud, AirDrop, fichier) : le jeton est enregistré dedans, et qui l\'a peut envoyer à RS-1 en ton nom jusqu\'à ce que tu le révoques ici.</p>'
        + '<p class="crd__racm" data-rac-mac><b>Mac</b> : si iCloud synchronise tes raccourcis, celui-ci est déjà sur le Mac, <b>avec le jeton de l\'iPhone</b>. Pour un jeton propre au Mac : duplique-le (« Envoyer à RS-1 (Mac) »), crée ici un jeton « raccourci Mac » et colle-le dans <b>la copie</b> ; dans ses détails, coche <b>Utiliser comme action rapide</b> (la copie seulement) : clic droit sur une capture › <b>Actions rapides</b> › Envoyer à RS-1 (Mac). Révoquer l\'un coupe seulement son raccourci. Plus court, sans jeton : Contrôle+Maj+Cmd+4 met la capture dans le presse-papiers, puis Cmd+V ici.</p>'
        + '<p class="crd__racm"><b>Android</b> : installe le xerboxion (Chrome › Installer l\'application) : il apparaît dans la feuille de partage, ta session suffit, sans jeton.</p>'
        + '<p class="crd__racm">Pas de fichier <code>.shortcut</code> à télécharger : un raccourci signé ne se fabrique qu\'avec l\'app Raccourcis d\'Apple, pas ici. Tu le construis une fois.</p>'
        + '<div class="crd__race" data-rac-err role="status" aria-live="polite"></div>';
    }
    // les jetons « coord.envoyer » du compte (GET /px/jetons ; jamais le hash, jamais le clair) : nom · créé · dernier usage · révoquer
    function listerRac() {
      var l = rac && rac.querySelector('[data-rac-liste]'); if (!l) return;
      jFetch('/px/jetons').then(function (r) {
        if (r.status === 401) throw new Error('session expirée : recharge la page');
        if (!r.ok) throw new Error('jetons illisibles (' + r.status + ')');
        return r.json();
      }).then(function (d) {
        if (!alive || !rac || rac.hidden || !l.isConnected) return;
        var js = ((d && d.jetons) || []).filter(function (j) { return j && Array.isArray(j.scopes) && j.scopes.indexOf(RAC_SCOPE) >= 0 && /^[a-f0-9]{16}$/.test(String(j.id)); });
        l.innerHTML = js.length ? js.map(function (j) {
          return '<div class="crd__racj" data-jid="' + esc(j.id) + '"><b>' + esc(j.nom || 'appareil') + '</b><small>créé ' + esc(fmtTime(j.cree) || '—') + ' · '
            + (j.dernier ? 'dernier usage ' + esc(fmtTime(j.dernier) || '—') : 'jamais utilisé') + '</small><button type="button" data-rac-rev="' + esc(j.id) + '" aria-label="révoquer ' + esc(j.nom || 'appareil') + '">révoquer</button></div>';
        }).join('') : '<small class="crd__racm">aucun jeton de raccourci pour l\'instant</small>';
      }).catch(function (e) { if (alive && l.isConnected) { l.innerHTML = ''; racDire('⚠ ' + ((e && e.message) || 'jetons illisibles')); } });
    }
    function creerRac(b) {
      var ni = rac.querySelector('[data-rac-nom]');
      var nom = String((ni && ni.value) || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 60) || 'raccourci iPhone';
      b.disabled = true; racDire('');
      jFetch('/px/jetons', { nom: nom, scopes: [RAC_SCOPE] }).then(function (r) {
        return r.json().catch(function () { return null; }).then(function (j) {
          if (r.status === 401 || r.status === 419) throw new Error('session expirée : recharge la page');
          if (!r.ok) throw new Error((j && j.error) || ('création impossible (' + r.status + ')'));
          return j;
        });
      }).then(function (j) {
        if (!alive || !rac || rac.hidden) return;
        if (!j || typeof j.jeton !== 'string' || !/^xj_[a-f0-9]{16,200}$/.test(j.jeton)) throw new Error('réponse inattendue du serveur : rien à coller');
        if (!Array.isArray(j.scopes) || j.scopes.indexOf(RAC_SCOPE) < 0) {
          // un serveur qui ne connaît pas encore « coord.envoyer » l'a retiré : un jeton sans droit ne sert à rien, il repart tout de suite
          if (j.id) jFetch('/px/jetons/revoquer', { id: j.id }).catch(function () {});
          throw new Error('le serveur ne connaît pas encore le droit « ' + RAC_SCOPE + ' » : rien de créé');
        }
        clair = j.jeton; clairId = String(j.id || '');
        var c = rac.querySelector('[data-rac-clair]'), k = rac.querySelector('[data-rac-jeton]');
        if (k) k.textContent = clair;
        if (c) c.hidden = false;
        racDire('✓ jeton « ' + (j.nom || nom) + ' » créé', true);
        listerRac();
      }).catch(function (e) { racDire('⚠ ' + ((e && e.message) || 'création impossible')); })
        .then(function () { b.disabled = false; });
    }
    function revoquerRac(id, b) {
      if (!/^[a-f0-9]{16}$/.test(id)) return;
      b.disabled = true;
      jFetch('/px/jetons/revoquer', { id: id }).then(function (r) {
        if (!r.ok) throw new Error(r.status === 404 ? 'ce jeton n\'existe plus' : 'révocation impossible (' + r.status + ')');
        if (id === clairId) { clair = ''; clairId = ''; var c = rac.querySelector('[data-rac-clair]'); if (c) { c.hidden = true; var k = c.querySelector('[data-rac-jeton]'); if (k) k.textContent = ''; } }
        racDire('✓ jeton révoqué : ce raccourci n\'envoie plus rien', true);
        listerRac();
      }).catch(function (e) { b.disabled = false; racDire('⚠ ' + ((e && e.message) || 'révocation impossible')); });
    }
    function ouvrirRac() {
      if (!rac || !tel) return;
      renderRac(); rac.hidden = false; tel.setAttribute('aria-expanded', 'true');
      listerRac();
      var b = rac.querySelector('[data-rac-creer]'); if (b) { try { b.focus({ preventScroll: true }); } catch (e) {} }
    }
    function fermerRac() {
      clair = ''; clairId = '';
      if (!rac) return;
      rac.hidden = true; rac.innerHTML = '';
      if (tel) tel.setAttribute('aria-expanded', 'false');
    }
    if (tel && rac) {
      tel.addEventListener('click', function () { if (rac.hidden) ouvrirRac(); else fermerRac(); });
      rac.addEventListener('click', function (e) {
        var b = e.target && e.target.closest ? e.target.closest('button') : null; if (!b || b.disabled) return;
        if (b.hasAttribute('data-rac-x')) { fermerRac(); try { tel.focus(); } catch (x) {} return; }
        if (b.hasAttribute('data-rac-creer')) { creerRac(b); return; }
        if (b.hasAttribute('data-rac-rev')) { revoquerRac(b.getAttribute('data-rac-rev') || '', b); return; }
        var c = b.getAttribute('data-copie');
        if (c) copier(c === 'jeton' ? clair : c === 'url' ? racUrl() : c === 'entete' ? RAC_EN_TETE : RAC_CHAMP, b);
      });
      rac.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fermerRac(); try { tel.focus(); } catch (x) {} }
        else if (e.key === 'Enter' && e.target && e.target.hasAttribute && e.target.hasAttribute('data-rac-nom')) { e.preventDefault(); var b = rac.querySelector('[data-rac-creer]'); if (b && !b.disabled) creerRac(b); }
      });
    }

    if (PIECES && compo) {
      root.addEventListener('dragenter', surDrag);
      root.addEventListener('dragover', surDrag);
      root.addEventListener('dragleave', surQuitte);
      root.addEventListener('drop', surDepot);
      root.addEventListener('paste', surColler);
      root.addEventListener('xb:recoit', surRecoit);
      window.addEventListener('resize', eviterCoin); offs.push(function () { window.removeEventListener('resize', eviterCoin); });
      fileIn.addEventListener('change', function () { ajouterFichiers(fileIn.files, 'systeme'); try { fileIn.value = ''; } catch (e) {} });
      chipsEl.addEventListener('click', function (e) {
        var b = e.target && e.target.closest && e.target.closest('[data-x]'); if (!b || busy) return;
        var c = b.closest('[data-k]'), k = c && c.getAttribute('data-k');
        pend = pend.filter(function (p) { return p.k !== k; }); renderChips(); dire('');
      });
      inEl.addEventListener('input', function () { auto(); majGo(); });
      inEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); envoyer(); }   // une seule boucle d'envoi : Entrée pendant un envoi ne relance rien
      });
      go.addEventListener('click', function () { envoyer(); });
      plus.addEventListener('click', function () { if (pop.hidden) ouvrirPop(''); else fermerPop(); });
      pop.addEventListener('click', function (e) {
        var t = e.target && e.target.closest ? e.target.closest('button') : null; if (!t || t.disabled) return;
        var v = t.getAttribute('data-v');
        if (v === 'appareil') { fermerPop(); try { fileIn.click(); } catch (x) {} return; }
        if (v === 'fichier') { fermerPop(); var F = window.jOSFiles; if (F && F.pick) Promise.resolve(F.pick({ mode: 'open' })).then(function (ch) { if (ch && typeof ch === 'string') ajouterLecture(ch.split('/').pop(), function () { return F.readBlob(ch); }, { chemin: ch, source: 'xerboxion' }); }).catch(function () {}); return; }
        if (v) { ouvrirPop(v); return; }
        if (t.hasAttribute('data-pxa')) { ajouterPx(t.getAttribute('data-pxa'), 'lanceur'); fermerPop(); return; }
        if (t.hasAttribute('data-ts')) { var s = (pop.__ses || [])[+t.getAttribute('data-ts')]; if (s) ajouterTsoin(s); fermerPop(); return; }
        if (t.hasAttribute('data-ua')) { var u = pop.querySelector('[data-u]'); if (u && ajouterLien(u.value)) fermerPop(); }
      });
      pop.addEventListener('keydown', function (e) { if (popTouche(e)) return; if (e.key === 'Escape') { e.preventDefault(); fermerPop(); try { plus.focus(); } catch (x) {} } if (e.key === 'Enter' && e.target && e.target.hasAttribute && e.target.hasAttribute('data-u')) { e.preventDefault(); if (ajouterLien(e.target.value)) fermerPop(); } });
      root.addEventListener('pointerdown', function (e) { if (pop && !pop.hidden && !pop.contains(e.target) && e.target !== plus) fermerPop(); });
      // ce que le xerboxion envoie ici : la demande (jOSXerPrefs), la poignée (jOSFiles.fichier), la boîte aux lettres, le bus
      var X = window.jOSXerPrefs, FX = window.jOSFiles && window.jOSFiles.fichier, prm = {};
      try { if (X && typeof X.params === 'function') prm = X.params('coord', ctx) || {}; } catch (e) { prm = {}; }
      var enAttente = { prm: prm, h: null };
      try { if (FX && typeof FX.de === 'function') enAttente.h = FX.de('coord', Object.assign({}, ctx || {}, { params: prm })); } catch (e) {}
      try { if (FX && typeof FX.ecouter === 'function') offs.push(FX.ecouter('coord', function (h) { if (srvActif) ajouterPoignee(h); else enAttente.h = h; }, ctx)); } catch (e) {}
      if (window.jOSPorts && window.jOSPorts.on) {
        try { offs.push(window.jOSPorts.on('ploxion.coord.cmd', function (p) {
          if (typeof p === 'string') { try { p = JSON.parse(p); } catch (e) { return; } }
          if (!p || typeof p !== 'object') return;
          if (p.cmd === 'joindre') { if (srvActif) viderBoite(); else enAttente.boite = true; }
          else if (p.cmd === 'params' && p.params && typeof p.params === 'object') { if (srvActif) joindreParams(p.params); else enAttente.prm = p.params; }
        })); } catch (e) {}
      }
      // la première réponse du fil dit si le serveur prend des pièces : ce qui attendait entre alors (une fois)
      premier = function () {
        premier = null;
        if (!alive) return;
        joindreParams(enAttente.prm); enAttente.prm = null;
        if (enAttente.h) { ajouterPoignee(enAttente.h); enAttente.h = null; }
        viderBoite();
      };
    }

    // ═══════ LES CAPTURES DU MAC (26.09) — le dossier surveillé par le xion local (xerboxion-rt, crates/xerboxion-host/src/captures.rs) ═══════
    // RS-7 : « pour le ploxion coord … il faut un moyen de détecter les screenshot ». Le xion PROPOSE (partials/_captures_xion_bion :
    // jOSCapturesXion), la coord MONTRE : « 2 nouvelles captures sur ce Mac · voir · envoyer · ignorer ». Envoyer = prendre au xion (les
    // autres pages ne les voient plus), lire les octets, des pièces du composer (source « xion », chemin « xion:captures/<nom> »), puis ➤ :
    // le POST /coord/pieces existant ; si l'envoi échoue, les pièces restent dans le composer (et le fichier sur le Mac). Ignorer = retirées
    // de la liste du xion, jamais du disque. Surveillance éteinte au xion : une proposition (« pas maintenant » la range pour ce navigateur) ;
    // (relecture adverse, 26.09) « comment allumer » montre LA COMMANDE à taper sur la machine (xerboxion-rt captures allumer) : le xion
    // refuse d'être allumé par une page (403) — ni une page locale quelconque, ni la coord, ni un XSS du labo. Allumée : une ligne discrète
    // (surveillées · envoyer tout seul (décochable ; « tout seul ? » = la commande auto on) · couper) — on voit toujours que ça tourne.
    // « Envoyer tout seul » : c'est jOSCapturesXion qui envoie (un seul envoyeur, la coord ouverte ou non) ; la coord le dit et relit son fil.
    // Rien sans xion local (jOSXion.enabled()), sans composer, ou avec xb:coord.captures-mac = off ; au repos, aucun minuteur (tic() suit le
    // poll de 30 s du fil ; le bion écoute le retour sur la fenêtre et, en accès direct, le flux du xion) ; tout part à l'unmount.
    var capMac = null;
    (function () {
      var CX = window.jOSCapturesXion, band = root.querySelector('[data-capmac]');
      if (!PIECES || !compo || !band || !CX || typeof CX.on !== 'function' || !CX.on()) return;
      var E = null, voir = false, occupe = false, msg = '', msgOk = false, msgT = 0, vign = {}, PROP = 'xb:coord.captures-mac.propose';
      // (relecture adverse, 26.09) allumer et « tout seul » = un geste SUR LA MACHINE (le xion refuse une page : 403) ; la bande montre la commande
      var CMD_ON = 'xerboxion-rt captures allumer', CMD_AUTO = 'xerboxion-rt captures auto on', cmd = '';
      var ECRAN = SVG0 + '<path d="M3 4h18v12H3zM8 20h8M12 16v4"/></svg>';
      function propose() { try { return localStorage.getItem(PROP) !== 'non'; } catch (e) { return true; } }
      function msgDe(x) { return (x && x.message) || 'le xion ne répond pas'; }
      function liberer(garder) { Object.keys(vign).forEach(function (id) { if (garder && garder[id]) return; try { URL.revokeObjectURL(vign[id]); } catch (e) {} delete vign[id]; }); }
      function dit(t, ok) {
        msg = t || ''; msgOk = !!ok; if (msgT) { clearTimeout(msgT); msgT = 0; }
        if (t && ok) msgT = setTimeout(function () { msgT = 0; if (alive) { msg = ''; rendre(); } }, 6000);
        rendre();
      }
      function rendre() {
        var e = E, l = (e && e.captures) || [], h = '';
        if (!e || gated || !srvActif || (!e.actif && !propose() && !msg && !cmd)) { band.hidden = true; band.innerHTML = ''; liberer(); return; }
        var ici = CX.ici();
        if (!e.actif) {
          // (relecture adverse, 26.09) « comment allumer » : la commande de la machine — le xion refuse d'être allumé par une page (403)
          if (propose()) h = '<span class="crd__capt">' + ECRAN + '<span>Tes captures d\'écran de ' + esc(ici) + ', proposées ici ?</span><small>dossier ' + esc(e.dossier || e.dossier_propose || '') + '</small></span>'
            + '<span class="crd__capa"><button type="button" data-cap="allumer" aria-expanded="' + (cmd === CMD_ON ? 'true' : 'false') + '">comment allumer</button><button type="button" data-cap="plustard">pas maintenant</button></span>';
        } else if (l.length) {
          var s = l.length > 1 ? 's' : '';
          h = '<span class="crd__capt">' + ECRAN + '<span><b>' + l.length + '</b> nouvelle' + s + ' capture' + s + ' sur ' + esc(ici) + '</span></span>'
            + '<span class="crd__capa"><button type="button" data-cap="voir" aria-expanded="' + (voir ? 'true' : 'false') + '">' + (voir ? 'cacher' : 'voir') + '</button>'
            + '<button type="button" data-cap="envoyer"' + (occupe || busy ? ' disabled' : '') + '>envoyer</button>'
            + '<button type="button" data-cap="ignorer"' + (occupe ? ' disabled' : '') + '>ignorer</button></span>';
          if (voir) h += '<div class="crd__capv" data-capv>' + l.map(function (c) { return '<figure data-capid="' + esc(c.id) + '"><span class="crd__capi"></span><figcaption>' + esc(c.nom) + ' · ' + esc(lisible(c.taille)) + '</figcaption></figure>'; }).join('') + '</div>';
        } else {
          h = '<span class="crd__capt crd__capdoux">' + ECRAN + '<span>captures de ' + esc(ici) + ' surveillées</span><small>' + esc(e.dossier || '') + '</small></span>';
        }
        // « envoyer tout seul » : cochée (allumé par la CLI), la page peut la DÉCOCHER ; éteint, « tout seul ? » montre la commande
        if (e.actif) h += '<span class="crd__capa crd__capr">' + (e.auto
          ? '<label><input type="checkbox" data-cap="auto" checked' + (occupe ? ' disabled' : '') + '> envoyer tout seul</label>'
          : '<button type="button" data-cap="toutseul" aria-expanded="' + (cmd === CMD_AUTO ? 'true' : 'false') + '">tout seul ?</button>')
          + '<button type="button" data-cap="couper"' + (occupe ? ' disabled' : '') + '>couper</button></span>';
        if (cmd) h += '<span class="crd__capcmd" data-capcmd>' + esc(cmd === CMD_ON ? 'allumer se fait sur ' + ici + ', jamais depuis une page (elle ne peut que couper) : dans un terminal,' : '« envoyer tout seul » s\'allume sur ' + ici + ' : dans un terminal,')
          + ' <code>' + esc(cmd) + '</code><button type="button" data-cap="copier" aria-label="copier la commande">copier</button></span>';
        if (e.actif && e.erreur) h += '<span class="crd__caperr">⚠ ' + esc(e.erreur) + '</span>';
        if (msg) h += '<span class="crd__capm' + (msgOk ? ' ok' : '') + '" role="status">' + esc(msg) + '</span>';
        band.innerHTML = h; band.hidden = !h;
        var gard = {}; if (voir) l.forEach(function (c) { gard[c.id] = 1; }); liberer(gard);
        if (voir) vignettes(l);
      }
      // les vignettes : lues au xion au « voir » seulement (jamais avant), gardées tant que la capture est là
      function vignettes(l) {
        l.forEach(function (c) {
          var f = band.querySelector('[data-capid="' + c.id + '"] .crd__capi'); if (!f) return;
          var pose = function (u) { var g = band.querySelector('[data-capid="' + c.id + '"] .crd__capi'); if (g && !g.firstChild) { var im = document.createElement('img'); im.alt = c.nom; im.src = u; g.appendChild(im); } };
          if (vign[c.id]) { pose(vign[c.id]); return; }
          CX.lire(c).then(function (fi) { if (!alive || vign[c.id]) return; try { vign[c.id] = URL.createObjectURL(fi); pose(vign[c.id]); } catch (x) {} }, function () {});
        });
      }
      function regler(p) {
        occupe = true; rendre();
        CX.reglage(p).then(function (e) {
          occupe = false; if (!alive) return; if (e && e.v === 1) E = e;
          // (relecture adverse, 26.09) une page ne fait plus que couper ; couper coupe aussi « tout seul » (le xion le remet à non)
          if (p.actif === false) dit('coupé : plus rien n\'est surveillé, « tout seul » compris (pour rallumer : ' + CMD_ON + ', sur ' + CX.ici() + ')', true);
          else if (p.auto === false) dit('« tout seul » coupé : chaque capture attend ton « envoyer »', true);
          else rendre();
        }, function (x) { occupe = false; if (alive) dit('⚠ ' + msgDe(x)); });
      }
      function ignorer() {
        var l = (E && E.captures) || []; if (!l.length) return;
        occupe = true; rendre();
        CX.oublier(l).then(function () { occupe = false; voir = false; if (alive) dit(l.length > 1 ? 'ignorées (elles restent dans le dossier)' : 'ignorée (elle reste dans le dossier)', true); return CX.etat({ force: true }); },
          function (x) { occupe = false; if (alive) dit('⚠ ' + msgDe(x)); });
      }
      // envoyer : prendre (le bail), lire, des pièces du composer (les bornes du composer disent ce qui ne passe pas), oublier au xion, ➤
      function envoyerCaps() {
        if (busy) { dire('un envoi est en cours : attends qu\'il parte'); return; }
        var place = Math.max(0, LIM.par_message - pend.length), l = ((E && E.captures) || []).slice(0, place);
        if (!l.length) { dire('au plus ' + LIM.par_message + ' pièces par message : envoie celles-ci d\'abord'); return; }
        occupe = true; rendre();
        CX.prendre(l, 120).then(function (pris) {
          var mes = l.filter(function (c) { return pris.indexOf(c.id) >= 0; });
          return Promise.all(mes.map(function (c) { return CX.lire(c).then(function (f) { return { c: c, f: f }; }, function () { return null; }); }));
        }).then(function (lus) {
          if (!alive) return 0;
          var n = 0, faits = [];
          lus.forEach(function (x) { if (x && ajouter({ genre: 'fichier', fichier: x.f, nom: x.c.nom, source: 'xion', chemin: 'xion:captures/' + x.c.nom })) { n++; faits.push(x.c.id); } });
          return (faits.length ? CX.oublier(faits) : Promise.resolve([])).then(function () { return n; }, function () { return n; });
        }).then(function (n) {
          occupe = false; voir = false; if (!alive) return;
          CX.etat({ force: true });
          if (n) { dit(''); envoyer(); } else dit('⚠ rien n\'a pu être lu au xion (une autre page les envoie peut-être déjà)');
        }, function (x) { occupe = false; if (alive) dit('⚠ ' + msgDe(x)); });
      }
      band.addEventListener('click', function (ev) {
        var b = ev.target && ev.target.closest ? ev.target.closest('button[data-cap]') : null; if (!b || b.disabled) return;
        var a = b.getAttribute('data-cap');
        if (a === 'plustard') { try { localStorage.setItem(PROP, 'non'); } catch (e) {} rendre(); return; }
        if (a === 'voir') { voir = !voir; rendre(); return; }
        // (relecture adverse, 26.09) allumer / « tout seul » : la commande (le xion refuse une page) ; couper : la page le peut
        if (a === 'allumer') { cmd = cmd === CMD_ON ? '' : CMD_ON; rendre(); return; }
        if (a === 'toutseul') { cmd = cmd === CMD_AUTO ? '' : CMD_AUTO; rendre(); return; }
        if (a === 'copier') { copier(cmd, b); return; }
        if (a === 'couper') { cmd = ''; regler({ actif: false }); return; }
        if (a === 'ignorer') { ignorer(); return; }
        if (a === 'envoyer') envoyerCaps();
      });
      band.addEventListener('change', function (ev) {
        var t = ev.target; if (!(t && t.getAttribute && t.getAttribute('data-cap') === 'auto')) return;
        if (t.checked) { t.checked = false; cmd = CMD_AUTO; rendre(); return; }   // cocher : jamais depuis la page (la commande)
        regler({ auto: false });
      });
      // « tout seul » : le bion a envoyé (ou échoué) — la coord le dit et relit son fil
      function surEnvoyees(ev) { var d = (ev && ev.detail) || {}; if (!alive || !d.auto || !d.n) return; dit('✓ ' + d.n + ' capture' + (d.n > 1 ? 's' : '') + ' partie' + (d.n > 1 ? 's' : '') + ' à RS-1 (toute' + (d.n > 1 ? 's' : '') + ' seule' + (d.n > 1 ? 's' : '') + ')', true); load(maxId ? 'poll' : 'init'); }
      function surErreur(ev) { var d = (ev && ev.detail) || {}; if (!alive || !d.auto) return; dit('⚠ envoi tout seul : ' + (d.message || 'échec') + ' — elles restent ici (« envoyer » pour réessayer)'); }
      window.addEventListener('xb:captures:envoyees', surEnvoyees);
      window.addEventListener('xb:captures:erreur', surErreur);
      offs.push(CX.ecouter(function (e) {
        if (!alive) return; E = e; if (!(e && e.captures && e.captures.length)) voir = false;
        // la commande tapée sur la machine : le xion le dit, la bande aussi (et la commande s'efface)
        if (e && e.actif && cmd === CMD_ON) { cmd = ''; dit('✓ surveillé : tes nouvelles captures apparaîtront ici (rien d\'ancien n\'est lu)', true); return; }
        if (e && e.auto && cmd === CMD_AUTO) { cmd = ''; dit('✓ « tout seul » : tes nouvelles captures partent à RS-1 sans demander', true); return; }
        if (!(e && e.actif) && cmd === CMD_AUTO) cmd = '';
        rendre();
      }));
      offs.push(function () {
        window.removeEventListener('xb:captures:envoyees', surEnvoyees); window.removeEventListener('xb:captures:erreur', surErreur);
        if (msgT) clearTimeout(msgT); liberer(); capMac = null;
      });
      // à chaque réponse du fil : le xion relu (s'il surveille) ; la bande refaite seulement si la garde ou les pièces du serveur ont changé
      // (jamais un rendu de plus sous le doigt ou le focus de RS-7)
      var ouvert = null;
      // (relecture adverse, 26.09) une commande montrée (RS-7 allume sur sa machine) : le xion est relu à chaque poll du fil même éteint
      capMac = { tic: function () { try { if (cmd) CX.etat(); else CX.tic(); } catch (e) {} var o = !gated && srvActif; if (alive && o !== ouvert) { ouvert = o; rendre(); } } };
      CX.etat({ force: true });
    })();

    updateLive();
    start();

    LIVE = { messages: function () { return messages; }, attente: function () { return pend.length; } };
    return {
      unmount: function () {
        try { document.removeEventListener('visibilitychange', surVisible); if (regateT) clearTimeout(regateT); } catch (e) {}
        LIVE = null;
        alive = false;
        if (timer) clearInterval(timer);
        if (busRetry) clearTimeout(busRetry);
        if (coinT) clearTimeout(coinT);
        clair = ''; clairId = '';   // (26.09) le jeton du raccourci, montré une fois : jamais au-delà de la fenêtre
        cacherVoile();
        urls.forEach(function (u) { try { URL.revokeObjectURL(u); } catch (e) {} }); urls = [];
        offs.forEach(function (o) { try { if (o) o(); } catch (e) {} });
        offs = [];
        container.innerHTML = '';
      }
    };
  }

  window.jOSApps = window.jOSApps || {};
  window.jOSApps['coord'] = { manifest: { id: 'coord', name: 'Xerxion Coord', icon: '🛰' }, mount: mount, describe: describe };
})();
