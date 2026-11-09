/* ploxion ultimate-social — app à la demande (/px/ultimate-social/app.js, format 2, 1 script) */
void 0;
(function(){try{var B=window.__PLOXIONS_BIONS__=window.__PLOXIONS_BIONS__||{};B["ultimate-social"]=["jOSGame","jOSPartage","jOSProfil","jOSRepoverse","jOSShare","jOSSocial"];}catch(e){}})();
(function(){try{if(document.querySelector('style[data-px-css="'+"ultimate-social"+'"]'))return;var s=document.createElement('style');s.setAttribute('data-px-css',"ultimate-social");s.textContent="\n  .us{display:flex;flex-direction:column;height:100%;min-height:0;position:relative;background:var(--xr-bg,#0b1220);color:var(--xr-text,#e7f0ff);font-family:var(--xr-font-ui,system-ui);font-size:.86rem}\n  .us *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}\n  .us [hidden]{display:none!important}\n  .us__top{flex:0 0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;padding:8px 10px;border-bottom:1px solid var(--xr-border,#22324f);background:var(--xr-surface,#0c1320)}\n  .us__title{font-weight:800;white-space:nowrap}\n  .us__q{flex:1 1 160px;min-width:0;min-height:40px;border:1px solid var(--xr-border,#22324f);background:var(--xr-bg,#0b1220);color:inherit;border-radius:12px;padding:6px 12px;font-size:16px}\n  .us__btn{min-height:40px;padding:0 12px;border-radius:12px;border:1px solid var(--xr-border,#22324f);background:none;color:inherit;font:700 .8rem var(--xr-font-ui,system-ui);cursor:pointer;white-space:nowrap}\n  .us__btn--go{border:0;background:linear-gradient(135deg,var(--xr-accent,#3fe0d0),var(--xr-accent2,#8a7dff));color:#04120e}\n  .us__btn:disabled{opacity:.45;cursor:default}\n  .us__tabs{flex:0 0 auto;display:flex;gap:4px;overflow-x:auto;padding:6px 8px;border-bottom:1px solid var(--xr-border,#22324f);scrollbar-width:none;background:var(--xr-surface,#0c1320)}\n  .us__tabs::-webkit-scrollbar{display:none}\n  .us__tab{flex:0 0 auto;min-height:40px;padding:0 12px;border-radius:20px;border:1px solid transparent;background:none;color:var(--xr-muted,#8aa0c0);font:700 .8rem var(--xr-font-ui,system-ui);cursor:pointer}\n  .us__tab.on{background:color-mix(in srgb,var(--xr-accent,#3fe0d0) 18%,transparent);border-color:var(--xr-border,#22324f);color:var(--xr-text,#e7f0ff)}\n  .us__tab .dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--xr-accent,#3fe0d0);margin-left:5px;vertical-align:middle;opacity:.8}\n  .us__stage{flex:1;min-height:0;position:relative}\n  .us__host{position:absolute;inset:0;overflow:auto;-webkit-overflow-scrolling:touch}\n  .us__tout{position:absolute;inset:0;overflow:auto;padding:10px 10px 24px}\n  .us__sec{margin:0 0 14px}\n  .us__sec h3{margin:0 0 6px;font-size:.78rem;letter-spacing:.04em;text-transform:uppercase;color:var(--xr-muted,#8aa0c0)}\n  .us__row{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;padding:9px 10px;border:1px solid var(--xr-border,#22324f);border-radius:12px;margin-bottom:6px;background:rgba(255,255,255,.02)}\n  .us__row .n{flex:1 1 160px;min-width:0;word-wrap:break-word}\n  .us__row .s{color:var(--xr-muted,#8aa0c0);font-size:.74rem}\n  .us__row .a{display:flex;gap:6px;flex-wrap:wrap}\n  .us__row .a .us__btn{min-height:36px;padding:0 10px}\n  .us__row .ptg-p,.us__row .ptg-c{flex:1 1 100%;margin:4px 0 0}\n  .us__muted{color:var(--xr-muted,#8aa0c0);padding:6px 2px;font-size:.8rem}\n  .us__miss{padding:18px 14px;display:flex;flex-direction:column;gap:8px}\n  .us__miss .us__btn{align-self:flex-start;text-decoration:none;display:inline-flex;align-items:center}\n";var a=document.getElementById('px-apps-css');if(a&&a.parentNode)a.parentNode.insertBefore(s,a.nextSibling);else document.head.appendChild(s);}catch(e){}})();

/* script 1/1 */

(function () {
  "use strict";
  var ID = 'ultimate-social', LS = 'xb:ultimate-social', LSG = 'xb:ultimate-social.garder';
  // les onglets : chacun MONTE un ploxion existant (app) ; « tout » = la couche transversale de la coquille
  var TABS = [
    { id: 'fil',     app: 'social',  icon: '📰', nom: 'Fil' },
    { id: 'salons',  app: 'chat',    icon: '💬', nom: 'Salons' },
    { id: 'amis',    app: 'amis',    icon: '👥', nom: 'Amis' },
    { id: 'carte',   app: 'carte',   icon: '🗺', nom: 'Carte' },
    { id: 'idees',   app: 'idee',    icon: '💡', nom: 'Idées' },
    { id: 'atelier', app: 'atelier', icon: '🛠', nom: 'Atelier' },
    { id: 'profil',  app: 'profil',  icon: '👤', nom: 'Profil' },
    { id: 'tout',    app: null,      icon: '🔎', nom: 'Tout' }
  ];
  var ETAPES_COURS = { discute: 1, repo: 1, forge: 1, verifie: 1 };
  // relecture sécurité 25.09 : TOUJOURS l'échappement complet (" et ' compris) — plus de délégation à jOSb.esc (textContent →
  // innerHTML, sans les guillemets) : le nom d'un ami dans data-us-n="…" sortait de l'attribut (nom libre à l'inscription → XSS).
  function esc(s) { return (s == null ? '' : String(s)).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function tabOf(id) { for (var i = 0; i < TABS.length; i++) if (TABS[i].id === id) return TABS[i]; return null; }
  function puissance() { try { return document.documentElement.getAttribute('data-puissance') || 'forte'; } catch (e) { return 'forte'; } }
  // combien d'onglets restent montés (cachés) : faible = 1 (un seul monté à la fois), moyenne = 2, forte = 3 ; surcharge localStorage
  function garder() {
    try { var g = +localStorage.getItem(LSG); if (g >= 1 && g <= 3) return Math.floor(g); } catch (e) {}
    var p = puissance(); return p === 'faible' ? 1 : (p === 'moyenne' ? 2 : 3);
  }
  function toast(container, m) { try { if (window.jOSb && window.jOSb.toast) { window.jOSb.toast(container, m); return; } } catch (e) {} try { if (typeof window.jOSToast === 'function') window.jOSToast(m); } catch (e2) {} }
  function csrf() { var m = document.querySelector('meta[name="csrf-token"]'); return m ? (m.getAttribute('content') || '') : ''; }
  function getJson(url) {
    return fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf() } }).then(function (r) {
      return r.json().catch(function () { return null; }).then(function (d) { if (!r.ok) { var e = new Error((d && (d.message || d.error)) || (r.status === 401 || r.status === 419 ? 'connecte-toi d\'abord' : 'erreur ' + r.status)); e.status = r.status; throw e; } return d; });
    });
  }
  function appOf(id) { var a = window.jOSApps && window.jOSApps[id]; return (a && typeof a.mount === 'function') ? a : null; }
  // page /px/ultimate-social : les entrées de manifeste des sept (posées côté serveur dans #us-subs) → jOSApps.monter les charge à la demande
  (function () {
    var el = document.getElementById('us-subs'), l = null; if (!el) return;
    try { l = JSON.parse(el.textContent || '[]'); } catch (e) { l = null; }
    if (!Array.isArray(l)) return;
    var M = window.__PLOXIONS__ = Array.isArray(window.__PLOXIONS__) ? window.__PLOXIONS__ : [];
    l.forEach(function (e) { if (e && e.id && !M.some(function (x) { return x && x.id === e.id; })) M.push(e); });
  })();

  // ---- bus (XUI) : « partager » / « rechercher » vers la dernière coquille vivante
  var LIVE = null, BUS = false;
  function ensureBus() { if (BUS) return; try { var P = window.jOSPorts; if (P && typeof P.on === 'function') { BUS = true;
    P.on('ploxion.' + ID + '.partager', function () { if (LIVE) LIVE.partager(); });
    P.on('ploxion.' + ID + '.search', function (p) { if (LIVE) LIVE.search((p && p.q) || ''); }); } } catch (e) {} }
  ensureBus();

  function describe() {
    var items = [];
    items.push({ p: 1, kind: 'stat', label: 'onglet', value: LIVE ? LIVE.onglet() : '—' });
    var m = LIVE ? LIVE.mesChoses() : null;
    if (m) items.push({ p: 1, kind: 'stat', label: 'choses en cours', value: m.filter(function (x) { return ETAPES_COURS[x.statut]; }).length });
    items.push({ p: 2, kind: 'action', label: 'partager', act: { port: 'ploxion.' + ID + '.partager', payload: { id: ID } } });
    items.push({ p: 2, kind: 'action', label: 'rechercher', act: { port: 'ploxion.' + ID + '.search', payload: { id: ID, q: '' } } });
    return { v: 1, id: ID, title: 'Ultimate social', icon: '🌐', items: items };
  }

  function mount(container, ctx) {
    ctx = ctx || {}; ensureBus();
    var alive = true, listeners = [], searchT = null, qSeq = 0;
    var MINE = null, MINEP = null;           // mes choses (feed ?mine=1), chargées à la demande
    var ouverts = [];                         // ids d'onglets montés, du plus ancien au plus récent (LRU)
    var S = { tab: 'fil' };
    try { var s0 = localStorage.getItem(LS); if (s0 && tabOf(s0)) S.tab = s0; } catch (e) {}
    try { var qs = new URLSearchParams(location.search).get('us'); if (qs && tabOf(qs)) S.tab = qs; } catch (e) {}
    if (ctx.tab && tabOf(ctx.tab)) S.tab = ctx.tab;
    var T = {}; TABS.forEach(function (t) { T[t.id] = { def: t, inst: null, host: null, extra: null }; });
    function on(el, ev, fn) { el.addEventListener(ev, fn); listeners.push([el, ev, fn]); }
    function say(m) { toast(container, m); }

    container.classList.add('us-root');
    container.innerHTML = '<div class="us">'
      + '<div class="us__top"><span class="us__title">🌐 Social</span>'
      +   '<input class="us__q" data-us-q type="search" enterkeyhint="search" autocomplete="off" placeholder="chercher @quelqu\'un, une chose, un repo…" aria-label="recherche : gens, choses, repos">'
      +   '<button class="us__btn us__btn--go" data-us-partager title="partager n\'importe quoi : texte, lien, photo, fichier, lieu, tsoin, idée, ploxion, objet 3D">➕ partager</button>'
      +   '<button class="us__btn" data-us-pipe title="tes choses et leur étape de pipeline">🚀 mes choses</button>'
      + '</div>'
      + '<nav class="us__tabs" role="tablist">' + TABS.map(function (t) { return '<button class="us__tab" role="tab" data-us-tab="' + t.id + '">' + t.icon + ' ' + esc(t.nom) + '</button>'; }).join('') + '</nav>'
      + '<div class="us__stage" data-us-stage>'
      +   TABS.filter(function (t) { return t.app; }).map(function (t) { return '<div class="us__host" data-us-host="' + t.id + '" hidden></div>'; }).join('')
      +   '<section class="us__tout" data-us-tout hidden>'
      +     '<div class="us__sec" data-us-res hidden><h3>👤 Gens</h3><div data-us-gens></div><h3>📦 Choses</h3><div data-us-choses></div><h3>🗂 Repos</h3><div data-us-repos></div></div>'
      +     '<div class="us__sec" data-us-mine><h3>🚀 Mes choses · leur étape</h3><div data-us-minel><div class="us__muted">…</div></div></div>'
      +   '</section>'
      + '</div></div>';
    var $ = function (s) { return container.querySelector(s); };
    var els = { q: $('[data-us-q]'), pipe: $('[data-us-pipe]'), tout: $('[data-us-tout]'), res: $('[data-us-res]'), gens: $('[data-us-gens]'), choses: $('[data-us-choses]'), repos: $('[data-us-repos]'), minel: $('[data-us-minel]') };
    TABS.forEach(function (t) { if (t.app) T[t.id].host = $('[data-us-host="' + t.id + '"]'); });

    // ---- monter / démonter un sous-ploxion (jOSApps.monter = à la demande + robuste ; sinon mount direct ; sinon « indisponible »)
    function missHtml(t, err) {
      return '<div class="us__miss"><div>' + t.icon + ' <b>' + esc(t.app) + '</b> ' + (err ? '— erreur au montage' : 'indisponible ici') + '</div>'
        + '<div class="us__muted">' + (err ? esc(err) : 'le ploxion n\'est pas sur cette page (débranché, ou réservé) — la coquille compose ce qui est là.') + '</div>'
        + '<a class="us__btn" href="/px/' + esc(t.app) + '">↗ ouvrir /px/' + esc(t.app) + '</a></div>';
    }
    function monterSub(id) {
      var o = T[id], t = o.def; if (!t.app || o.inst) return;
      var host = o.host; host.innerHTML = '';
      var sub = Object.assign({}, ctx, { embed: true, host: ID, ultimate: true }, o.extra || {});
      delete sub.tab;
      var L = window.jOSApps, a = appOf(t.app), h = null;
      try {
        if (L && typeof L.monter === 'function' && (a || (typeof L.peut === 'function' && L.peut(t.app)))) h = L.monter(t.app, host, sub);
        else if (a) h = a.mount(host, sub);
        else { host.innerHTML = missHtml(t); o.inst = { unmount: function () {} }; return; }
      } catch (e) { host.innerHTML = missHtml(t, (e && e.message) || 'erreur'); o.inst = { unmount: function () {} }; return; }
      o.inst = (h && typeof h.unmount === 'function') ? h : { unmount: function () {} };
    }
    function demonterSub(id) {
      ouverts = ouverts.filter(function (x) { return x !== id; });
      var o = T[id]; if (!o || !o.inst) return;
      try { o.inst.unmount(); } catch (e) {}
      o.inst = null; try { o.host.innerHTML = ''; o.host.hidden = true; } catch (e) {}
    }
    function toucher(id) {
      ouverts = ouverts.filter(function (x) { return x !== id; }); ouverts.push(id);
      var max = garder();
      while (ouverts.length > max) demonterSub(ouverts[0]);   // appareil faible : un seul monté à la fois
    }
    function afficher() {
      Array.prototype.forEach.call(container.querySelectorAll('[data-us-tab]'), function (b) {
        var id = b.getAttribute('data-us-tab'); b.classList.toggle('on', id === S.tab); b.setAttribute('aria-selected', id === S.tab ? 'true' : 'false');
      });
      // l'onglet actif toujours visible dans la rangée défilante (relecture 25.09, capture 390 px : onglet mémorisé 👤 Profil / 🔎 Tout
      // hors écran → aucun onglet surligné en vue). scrollLeft seulement : jamais de défilement vertical de la page.
      try { var nav = container.querySelector('.us__tabs'), act = nav && nav.querySelector('.us__tab.on');
        if (act) { var g = act.offsetLeft - nav.offsetLeft, d = g + act.offsetWidth;
          if (g < nav.scrollLeft) nav.scrollLeft = Math.max(0, g - 8); else if (d > nav.scrollLeft + nav.clientWidth) nav.scrollLeft = d - nav.clientWidth + 8; } } catch (e) {}
      TABS.forEach(function (t) { if (t.app) T[t.id].host.hidden = (t.id !== S.tab); });
      els.tout.hidden = (S.tab !== 'tout');
      var t = tabOf(S.tab);
      if (t && t.app) { toucher(t.id); monterSub(t.id); }
      if (S.tab === 'tout') chargerMine(false);
    }
    function ouvrir(id, extra) {
      if (!tabOf(id)) return;
      if (extra !== undefined) { var o = T[id]; var avant = JSON.stringify(o.extra || null), apres = JSON.stringify(extra || null); o.extra = extra || null; if (avant !== apres && o.inst) demonterSub(id); }
      S.tab = id; try { localStorage.setItem(LS, id); } catch (e) {}
      afficher();
    }

    // ---- mes choses : GET /px/xion/feed?mine=1 (une requête, à la demande ; rafraîchi sur xb:partage / développer)
    function chargerMine(force) {
      if (MINEP) return MINEP;   // une seule requête en vol
      if (MINE && !force) { renderMine(); return Promise.resolve(MINE); }
      MINEP = getJson('/px/xion/feed?mine=1').then(function (d) { MINE = (d && Array.isArray(d.posts)) ? d.posts : []; MINEP = null; if (alive) renderMine(); return MINE; },
        function (e) { MINEP = null; if (alive) els.minel.innerHTML = '<div class="us__muted">' + esc(e && e.status === 401 ? 'connecte-toi pour voir tes choses' : ('tes choses sont indisponibles : ' + ((e && e.message) || 'erreur'))) + '</div>'; return null; });
      return MINEP;
    }
    function titreDe(p) { return (p && (p.title || p.caption || (p.payload && (p.payload.pitch || p.payload.url || p.payload.id)))) || ('chose #' + (p && p.id)); }
    // social v1 : le degré (« X potes », « O brouillon »…) quand le serveur le donne ; sinon l'ancienne visibilité (SOCIAL_DEGRES=0)
    function degreTexte(p) {
      var J = window.jOSPartage, d = (J && J.degreDe) ? J.degreDe(p) : null, info = d && J.degres ? J.degres().liste.filter(function (x) { return x.code === d; })[0] : null;
      return info ? info.code + ' ' + info.libelle : (p.visibility || '');
    }
    function ligneChose(p, avecAuteur) {
      var J = window.jOSPartage, row = document.createElement('div'); row.className = 'us__row'; row.setAttribute('data-us-post', String(p.id));
      var ico = p.icon || (J && J.ICONES && J.ICONES[p.kind]) || '📝';
      row.innerHTML = '<span class="n">' + esc(ico) + ' ' + esc(String(titreDe(p)).slice(0, 140))
        + '<br><span class="s">' + esc(p.kind || 'texte') + ' · ' + esc(degreTexte(p)) + (avecAuteur && p.user ? /* window.jOSProfil.carte au survol */ ' · <span data-profil="' + esc(p.user.id || '') + '">' + esc(p.user.name || '?') + '</span>' : '') + (p.zone ? ' · 🗺 ' + esc(p.zone) : '') + '</span></span>'
        + '<span class="a"><button class="us__btn" data-us-voir="' + esc(p.id) + '">👁 voir</button><button class="us__btn" data-us-salon="' + esc(p.id) + '" title="le salon de cette chose">💬 salon</button></span>';
      if (J && typeof J.pipeline === 'function') {
        try { row.appendChild(J.pipeline(p, function (err, np) { if (!alive) return; if (err) { say('⚠ ' + ((err && err.message) || 'développer impossible')); return; } say('📦 repo prêt : ' + (np.repo || '')); chargerMine(true); })); } catch (e) {}
      }
      return row;
    }
    function renderMine() {
      if (!MINE) return;
      var n = MINE.filter(function (x) { return ETAPES_COURS[x.statut]; }).length;
      els.pipe.textContent = '🚀 mes choses' + (MINE.length ? ' · ' + n + ' en cours' : '');
      els.minel.innerHTML = '';
      if (!MINE.length) { els.minel.innerHTML = '<div class="us__muted">rien partagé pour l\'instant — ➕ partager n\'importe quoi, puis 🛠 développer pour en faire un repo.</div>'; return; }
      MINE.forEach(function (p) { els.minel.appendChild(ligneChose(p, false)); });
    }
    function trouverPost(id) {
      id = String(id); var l = (MINE || []).concat(RES.choses || []);
      for (var i = 0; i < l.length; i++) if (String(l[i].id) === id) return l[i];
      return null;
    }

    // ---- recherche unifiée : gens / choses / repos (chaque section échoue seule)
    var RES = { gens: [], choses: [], repos: [] };
    function sec(el, html) { el.innerHTML = html; }
    function chercher(q) {
      q = String(q || '').trim(); var seq = ++qSeq;
      if (q.length < 2) { els.res.hidden = true; return; }
      els.res.hidden = false;
      sec(els.gens, '<div class="us__muted">…</div>'); sec(els.choses, '<div class="us__muted">…</div>'); sec(els.repos, '<div class="us__muted">…</div>');
      var So = window.jOSSocial;
      var local = !!(So && typeof So.search === 'function' && (typeof So.mode !== 'function' || So.mode() === 'local'));
      (local ? Promise.resolve(So.search(q)) : Promise.reject(new Error('graphe local indisponible'))).then(function (l) {
        if (!alive || seq !== qSeq) return; RES.gens = Array.isArray(l) ? l : [];
        if (!RES.gens.length) { sec(els.gens, '<div class="us__muted">personne dans ton cercle (amis, amis d\'amis, zions) — un code d\'ami ? onglet 👥</div>'); return; }
        sec(els.gens, RES.gens.slice(0, 20).map(function (p) {
          var rel = p.relation || '', ami = rel === 'ami';
          return '<div class="us__row"><span class="n">🙂 ' + esc(p.name || p.displayName || '?') + (p.handle ? ' <span class="s">@' + esc(p.handle) + '</span>' : '')
            + '<br><span class="s">' + esc({ ami: 'ami', recu: 'te demande', envoye: 'demande envoyée', ami_d_ami: 'ami d\'ami', fof: 'ami d\'ami', zion: 'zion', code: 'par code' }[rel] || rel) + (p.communs ? ' · ' + esc(p.communs) + ' en commun' : '') + '</span></span>'
            + '<span class="a">' + (ami ? '<button class="us__btn" data-us-dm="' + esc(p.id) + '" data-us-n="' + esc(p.name || '') + '">💬 message</button>' : '')
            + (rel === 'code' && p.code ? '<button class="us__btn" data-us-code="' + esc(p.code) + '">🤝 accepter son code</button>'
              : (!ami && rel !== 'envoye' && rel !== 'recu' ? '<button class="us__btn" data-us-add="' + esc(p.id) + '">➕ ami</button>' : ''))
            + '<button class="us__btn" data-us-tab-go="amis">👥 Amis</button></span></div>';
        }).join(''));
      }).catch(function (e) { if (alive && seq === qSeq) sec(els.gens, '<div class="us__muted">' + esc((e && e.message) || 'recherche de gens indisponible') + '</div>'); });
      getJson('/px/xion/feed?q=' + encodeURIComponent(q)).then(function (d) {
        if (!alive || seq !== qSeq) return; RES.choses = (d && Array.isArray(d.posts)) ? d.posts : [];
        els.choses.innerHTML = '';
        if (!RES.choses.length) { sec(els.choses, '<div class="us__muted">aucune chose que tu vois ne parle de ça</div>'); return; }
        RES.choses.forEach(function (p) { els.choses.appendChild(ligneChose(p, true)); });
      }).catch(function (e) { if (alive && seq === qSeq) sec(els.choses, '<div class="us__muted">' + esc(e && e.status === 401 ? 'connecte-toi pour chercher dans le fil' : ((e && e.message) || 'fil indisponible')) + '</div>'); });
      var R = window.jOSRepoverse;
      (R && typeof R.search === 'function' ? Promise.resolve(R.search(q)) : Promise.reject(new Error('RepoVerse indisponible ici'))).then(function (l) {
        if (!alive || seq !== qSeq) return; RES.repos = Array.isArray(l) ? l : [];
        if (!RES.repos.length) { sec(els.repos, '<div class="us__muted">aucun repo</div>'); return; }
        sec(els.repos, RES.repos.slice(0, 20).map(function (r) {
          var slug = r.slug || r.name || r.id || '', url = (R.webUrl ? R.webUrl(slug) : '');
          return '<div class="us__row"><span class="n">🗂 ' + esc(r.name || slug) + (r.description ? '<br><span class="s">' + esc(String(r.description).slice(0, 160)) + '</span>' : '') + '</span>'
            + (url ? '<span class="a"><a class="us__btn" style="display:inline-flex;align-items:center;text-decoration:none" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">↗ ouvrir</a></span>' : '') + '</div>';
        }).join(''));
      }).catch(function (e) { if (alive && seq === qSeq) sec(els.repos, '<div class="us__muted">' + esc((e && e.message) || 'RepoVerse indisponible') + '</div>'); });
    }

    function partager() {
      var J = window.jOSPartage;
      if (!J || typeof J.composer !== 'function' || (typeof J.actif === 'function' && !J.actif())) { say('⚠ le composeur de partage est coupé ici — passe par l\'onglet 📰 Fil'); ouvrir('fil'); return; }
      Promise.resolve(J.composer({})).then(function (post) { if (!alive || !post) return; say('📤 partagé'); });
    }

    // ---- gestes
    on(container, 'click', function (e) {
      var t = e.target; if (!t || !t.closest) return;
      var b;
      if ((b = t.closest('[data-us-tab]'))) { ouvrir(b.getAttribute('data-us-tab')); return; }
      if ((b = t.closest('[data-us-tab-go]'))) { ouvrir(b.getAttribute('data-us-tab-go')); return; }
      if (t.closest('[data-us-partager]')) { partager(); return; }
      if (t.closest('[data-us-pipe]')) { var deja = !!MINE; ouvrir('tout'); if (deja) chargerMine(true); return; }   // 1er clic = 1 requête ; ensuite = rafraîchir
      if ((b = t.closest('[data-us-salon]'))) { var pid = +b.getAttribute('data-us-salon'); if (pid > 0) ouvrir('salons', { room: 'post-' + pid }); return; }
      if ((b = t.closest('[data-us-voir]'))) {
        var row = b.closest('.us__row'), ex = row && row.querySelector('.ptg-c,[data-us-corps]');
        if (ex) { ex.parentNode.removeChild(ex); return; }
        var p = trouverPost(b.getAttribute('data-us-voir')), J = window.jOSPartage, node = null;
        try { node = (p && J && J.corps) ? J.corps(p) : null; } catch (er) { node = null; }
        if (!node) { node = document.createElement('div'); node.setAttribute('data-us-corps', '1'); node.className = 'us__muted'; node.style.flex = '1 1 100%'; node.textContent = (p && p.caption) || 'rien de plus à montrer'; }
        if (row) row.appendChild(node); return;
      }
      if ((b = t.closest('[data-us-dm]'))) {
        var Sh = window.jOSShare; if (Sh && typeof Sh.to === 'function') Sh.to({ kind: 'friend', id: String(b.getAttribute('data-us-dm')), name: b.getAttribute('data-us-n') || '' }); else ouvrir('amis'); return;
      }
      if ((b = t.closest('[data-us-code]'))) {   // relation « code » : le code d'invitation trouvé → amis direct (même geste que 👥 Amis)
        var Sc = window.jOSSocial; if (!Sc || typeof Sc.acceptCode !== 'function') { ouvrir('amis'); return; }
        b.disabled = true; Promise.resolve(Sc.acceptCode(b.getAttribute('data-us-code'))).then(function () { if (alive) { b.textContent = '🤝 amis'; say('🤝 vous êtes amis'); } }, function (er) { if (alive) { b.disabled = false; say('⚠ ' + ((er && er.message) || 'code refusé')); } });
        return;
      }
      if ((b = t.closest('[data-us-add]'))) {
        var So = window.jOSSocial; if (!So || typeof So.request !== 'function') { ouvrir('amis'); return; }
        b.disabled = true; Promise.resolve(So.request(b.getAttribute('data-us-add'))).then(function () { if (alive) { b.textContent = '✓ demandé'; say('👥 demande envoyée'); } }, function (er) { if (alive) { b.disabled = false; say('⚠ ' + ((er && er.message) || 'demande impossible')); } });
        return;
      }
    });
    on(els.q, 'input', function () { if (searchT) clearTimeout(searchT); var v = els.q.value; searchT = setTimeout(function () { searchT = null; if (!alive) return; if (String(v).trim().length >= 2 && S.tab !== 'tout') ouvrir('tout'); chercher(v); }, 350); });
    on(els.q, 'keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (searchT) { clearTimeout(searchT); searchT = null; } ouvrir('tout'); chercher(els.q.value); } });
    // un nouveau partage (d'où qu'il vienne : la coquille, le fil, le bouton 📤) rejoint « mes choses » sans requête
    on(window, 'xb:partage', function (e) { var p = e && e.detail && e.detail.post; if (!p || !MINE) return; if (!MINE.some(function (x) { return String(x.id) === String(p.id); })) MINE.unshift(p); renderMine(); });
    // la puissance change (réglages) → on ré-applique le plafond d'onglets montés
    on(window, 'xb:puissance', function () { if (!alive) return; var max = garder(); while (ouverts.length > max) { var old = ouverts[0]; if (old === S.tab && ouverts.length > 1) old = ouverts[1]; demonterSub(old); } });

    LIVE = {
      onglet: function () { return S.tab; }, mesChoses: function () { return MINE; },
      partager: function () { if (alive) partager(); },
      search: function (q) { if (!alive) return; ouvrir('tout'); if (q) { els.q.value = q; chercher(q); } try { els.q.focus(); } catch (e) {} }
    };
    afficher();
    try { if (window.jOSGame && window.jOSGame.event) window.jOSGame.event('open', ID); } catch (e) {}
    return {
      unmount: function () {
        alive = false; LIVE = null;
        if (searchT) { clearTimeout(searchT); searchT = null; }
        TABS.forEach(function (t) { if (t.app) demonterSub(t.id); });
        listeners.forEach(function (l) { try { l[0].removeEventListener(l[1], l[2]); } catch (e) {} }); listeners = [];
        container.classList.remove('us-root'); container.innerHTML = '';
      },
      ouvrir: ouvrir
    };
  }
  window.jOSApps = window.jOSApps || {};
  window.jOSApps[ID] = { manifest: { id: ID, name: 'Ultimate social', icon: '🌐', compose: ['social', 'chat', 'amis', 'carte', 'idee', 'atelier', 'profil'] }, mount: mount, describe: describe };
})();
;

try{window.dispatchEvent(new CustomEvent('xb:app:registered',{detail:{id:"ultimate-social"}}));}catch(e){}
