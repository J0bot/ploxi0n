/* bion jOSPartage — servi seul pour ploxi0n (/px/bion-app/jOSPartage.js) */
void 0;
(function(){try{if(document.querySelector('style[data-bion-css="'+"jOSPartage"+'"]'))return;var s=document.createElement('style');s.setAttribute('data-bion-css',"jOSPartage");s.textContent="\n  #ptg-ov{position:fixed;inset:0;z-index:100097;display:flex;align-items:flex-end;justify-content:center;background:rgba(4,7,13,.6)}\n  #ptg-ov[hidden]{display:none}\n  .ptg{width:min(520px,100vw);max-height:92vh;overflow:auto;box-sizing:border-box;background:var(--xr-surface,#0c1320);color:var(--xr-text,#e7f0ff);\n    border:1px solid var(--xr-border,#22324f);border-radius:18px 18px 0 0;padding:14px 14px calc(14px + env(safe-area-inset-bottom));font:15px/1.4 var(--xr-font-ui,system-ui)}\n  @media(min-width:620px){#ptg-ov{align-items:center}.ptg{border-radius:18px}}\n  .ptg *{box-sizing:border-box}\n  .ptg__hd{display:flex;align-items:center;gap:10px;margin-bottom:10px}.ptg__hd b{flex:1;color:var(--xr-accent,#3fe0d0)}\n  .ptg__x{width:40px;height:40px;border-radius:11px;border:1px solid var(--xr-border,#22324f);background:none;color:inherit;font-size:18px;cursor:pointer}\n  /* les 9 choix À LA LIGNE (relecture 25.09, capture 390 px : en rangée défilante sans barre, Lieu/Tsoin/Idée/Ploxion/Objet 3D\n     étaient hors écran sans indice, et le choix pré-sélectionné — ex. 💡 Idée — invisible) */\n  .ptg__kinds{display:flex;flex-wrap:wrap;gap:6px;padding-bottom:6px}\n  .ptg__k{flex:0 0 auto;min-height:40px;padding:0 12px;border-radius:20px;border:1px solid var(--xr-border,#22324f);background:none;color:inherit;font:600 .8rem var(--xr-font-ui,system-ui);cursor:pointer}\n  .ptg__k.on{background:var(--xr-accent,#3fe0d0);color:#04120e;border-color:transparent}\n  .ptg input,.ptg textarea,.ptg select{width:100%;margin-top:8px;padding:11px 12px;border-radius:11px;border:1px solid var(--xr-border,#22324f);\n    background:var(--xr-bg,#0b1220);color:inherit;font:16px var(--xr-font-ui,system-ui)}\n  .ptg textarea{resize:vertical;min-height:70px}\n  .ptg__row{display:flex;gap:8px;flex-wrap:wrap}.ptg__row>*{flex:1 1 120px}\n  .ptg__b{min-height:44px;margin-top:8px;padding:0 14px;border-radius:12px;border:1px solid var(--xr-border,#22324f);background:none;color:inherit;font:600 .85rem var(--xr-font-ui,system-ui);cursor:pointer}\n  .ptg__go{width:100%;margin-top:12px;border:0;background:linear-gradient(135deg,var(--xr-accent,#3fe0d0),var(--xr-accent2,#8a7dff));color:#04120e;font-weight:800;font-size:1rem}\n  .ptg__go:disabled{opacity:.5}\n  .ptg__vis{display:flex;gap:4px;margin-top:10px;background:var(--xr-bg,#0b1220);border:1px solid var(--xr-border,#22324f);border-radius:12px;padding:3px}\n  .ptg__vis button{flex:1;min-height:40px;border:0;border-radius:9px;background:none;color:var(--xr-muted,#8aa0c0);font:700 .75rem var(--xr-font-ui,system-ui);cursor:pointer}\n  .ptg__vis button.on{background:color-mix(in srgb,var(--xr-accent,#3fe0d0) 22%,transparent);color:var(--xr-text,#e7f0ff)}\n  .ptg__hint{font-size:.72rem;color:var(--xr-muted,#8aa0c0);margin-top:6px}\n  .ptg__err{color:#ff8a7a;font-size:.8rem;margin-top:8px;min-height:1em}\n  .ptg__list{display:flex;flex-direction:column;gap:5px;margin-top:8px;max-height:30vh;overflow:auto}\n  .ptg__list button{text-align:left;min-height:42px;padding:6px 10px;border-radius:10px;border:1px solid var(--xr-border,#22324f);background:none;color:inherit;cursor:pointer;font:.82rem var(--xr-font-ui,system-ui)}\n  .ptg__list button.on{border-color:var(--xr-accent,#3fe0d0)}\n  /* rendu d'une chose partagée (jOSPartage.corps / pipeline) */\n  .ptg-c{margin:0 12px 10px;padding:10px 12px;border-radius:12px;border:1px solid var(--xr-border,rgba(120,160,230,.18));background:rgba(255,255,255,.03);font-size:.88rem;word-wrap:break-word}\n  .ptg-c a{color:var(--xr-accent,#6ad0ff)}\n  .ptg-c .t{font-weight:700;margin-bottom:3px}.ptg-c .d{color:var(--xr-muted,#8aa0bc);font-size:.8rem}\n  .ptg-c pre{white-space:pre-wrap;max-height:30vh;overflow:auto;font-size:.74rem;background:rgba(0,0,0,.3);padding:8px;border-radius:8px}\n  .ptg-c img,.ptg-c video{max-width:100%;border-radius:8px;display:block;margin-top:6px}\n  .ptg-p{display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin:0 12px 8px;font-size:.66rem}\n  .ptg-p span{padding:3px 7px;border-radius:10px;border:1px solid var(--xr-border,rgba(120,160,230,.18));color:var(--xr-muted,#8aa0bc)}\n  .ptg-p span.fait{color:var(--xr-text,#e7eef7)}.ptg-p span.ici{background:var(--xr-accent,#6ad0ff);color:#08111b;border-color:transparent;font-weight:800}\n  .ptg-p button{min-height:32px;margin-left:auto;padding:0 11px;border-radius:14px;border:1px solid var(--xr-accent,#6ad0ff);background:none;color:var(--xr-accent,#6ad0ff);font:700 .72rem var(--xr-font-ui,system-ui);cursor:pointer}\n  /* social v1 : les degrés O/I/X/N (boutons du composeur à deux lignes, badge du fil) */\n  .ptg__vis button b{display:block;font:800 .95rem/1.1 var(--xr-font-ui,system-ui)}\n  .ptg__vis button small{display:block;font:600 .62rem/1.2 var(--xr-font-ui,system-ui);opacity:.85}\n  .ptg__deg{font-size:.72rem;color:var(--xr-muted,#8aa0c0);margin-top:4px}\n  .ptg__deg summary{cursor:pointer;padding:6px 0}\n  .ptg-d{display:inline-block;font:700 .62rem var(--xr-font-ui,system-ui);padding:1px 6px;border-radius:9px;border:1px solid var(--xr-border,rgba(120,160,230,.25));white-space:nowrap}\n  .ptg-d--O{border-style:dashed;opacity:.85}\n  .ptg-b{min-height:40px;margin-top:6px;padding:0 13px;border-radius:12px;border:1px solid var(--xr-accent,#3fe0d0);background:none;color:var(--xr-accent,#3fe0d0);font:700 .8rem var(--xr-font-ui,system-ui);cursor:pointer}\n  .ptg-b:disabled{opacity:.55}\n  /* le lecteur ⧗ (rejouer un tsoin partagé : LECTURE SEULE) */\n  #ptg-lec{position:fixed;inset:0;z-index:100098;display:flex;align-items:flex-end;justify-content:center;background:rgba(4,7,13,.6)}\n  #ptg-lec[hidden]{display:none}\n  @media(min-width:620px){#ptg-lec{align-items:center}}\n  .ptg-lec__ecran{position:relative;width:100%;aspect-ratio:16/10;border-radius:12px;border:1px solid var(--xr-border,#22324f);background:#070d16;overflow:hidden;margin:4px 0 8px}\n  .ptg-lec__ecran i{position:absolute;box-sizing:border-box;border:1px solid rgba(63,224,208,.55);background:rgba(40,70,110,.45);border-radius:4px;font:600 .58rem/1.3 system-ui,sans-serif;font-style:normal;color:#dfeaff;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:1px 3px}\n  .ptg-lec__ecran b{position:absolute;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:var(--xr-accent,#3fe0d0);box-shadow:0 0 0 2px rgba(0,0,0,.6)}\n  .ptg-lec__vide{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:12px;font-size:.78rem;color:var(--xr-muted,#8aa0c0)}\n  .ptg-lec__ev{font-weight:700;font-size:.88rem;min-height:1.4em;word-wrap:break-word}\n  .ptg-lec__barre{height:4px;border-radius:3px;background:rgba(120,160,230,.18);overflow:hidden;margin:6px 0}\n  .ptg-lec__barre i{display:block;height:100%;width:0;background:var(--xr-accent,#3fe0d0)}\n  .ptg-lec__liste{list-style:none;margin:8px 0 0;padding:0;max-height:26vh;overflow:auto}\n  .ptg-lec__liste button{display:block;width:100%;text-align:left;min-height:40px;margin-top:4px;padding:4px 10px;border-radius:10px;border:1px solid var(--xr-border,#22324f);background:none;color:inherit;font:.76rem var(--xr-font-ui,system-ui);cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n  .ptg-lec__liste li.ici button{border-color:var(--xr-accent,#3fe0d0);color:var(--xr-text,#e7f0ff)}\n  .ptg-lec__bulle{width:100%;height:56vh;border-radius:12px;overflow:hidden;border:1px solid var(--xr-border,#22324f);background:#070d16;margin-top:4px}\n  /* (15.10) les aperçus : Spotify (lecteur intégré) et ploxion (carte du registre + fenêtre vivante à la demande) */\n  .ptg-spotify{display:block;width:100%;border:0;border-radius:12px;margin-top:8px;height:352px}.ptg-spotify.track,.ptg-spotify.episode{height:152px}\n  .ptg-px{display:flex;gap:11px;align-items:center}.ptg-px-ic{width:46px;height:46px;flex:none;display:flex;align-items:center;justify-content:center;font-size:24px;border-radius:13px;background:rgba(165,151,207,.12);border:1.5px solid rgba(165,151,207,.35)}\n  .ptg-px-desc{margin-top:8px;line-height:1.45}.ptg-px-b{display:flex;gap:8px;margin-top:9px}\n  .ptg-px-vue{display:block;width:100%;height:420px;border:1.5px solid rgba(165,151,207,.35);border-radius:12px;margin-top:9px;background:#07050c}\n";document.head.appendChild(s);}catch(e){}})();

;
(function () {
  'use strict';
  if (window.jOSPartage) return;

  var KINDS = ['texte', 'lien', 'image', 'video', 'fichier', 'lieu', 'tsoin', 'idee', 'ploxion', 'bion', 'kion', 'glyphe', 'objet3d', 'postit', 'zone'];
  var VISIBILITES = [['moi', '🔒 moi'], ['amis', '👥 amis'], ['zion', '🌀 zions'], ['public', '🌍 tous']];
  var ETAPES = [['partage', 'partagé'], ['discute', 'discuté'], ['repo', 'repo'], ['forge', 'en forge'], ['verifie', 'vérifié'], ['publie', 'publié']];
  // les choix du composeur (les autres kinds passent par opts.kind, rendu générique)
  var CHOIX = [['texte', '📝 Texte'], ['lien', '🔗 Lien'], ['media', '📷 Photo/vidéo'], ['fichier', '📄 Fichier'], ['lieu', '📍 Lieu'],
    ['tsoin', '⧗ Tsoin'], ['idee', '💡 Idée'], ['ploxion', '🧩 Ploxion'], ['objet3d', '🧊 Objet 3D']];
  var ICONES = { texte: '📝', lien: '🔗', image: '📷', video: '🎥', fichier: '📄', lieu: '📍', tsoin: '⧗', idee: '💡', ploxion: '🧩', bion: '🧬', kion: '◇', glyphe: '✴', objet3d: '🧊', postit: '🗒', zone: '🗺', xer: '✥' };
  // social v1 — les kill-switches SERVEUR, rendus par Blade dans une chaîne (« 0 » = coupé). Hors Blade (une page de test construite
  // depuis le source brut), la chaîne garde le texte du gabarit : actif, comme par défaut.
  var DEGRES_SRV = "1" !== '0';
  var TSOIN_SRV = "1" !== '0';
  // relecture sécurité v1 (25.09) : le libellé d'un geste sans ce qu'on a tapé ou lu (voir libelleBorne) ; SOCIAL_TSOIN_BORNE=0 → celui d'avant
  var BORNE_SRV = "1" !== '0';
  // LES DEGRÉS (proposition de RS-1, à confirmer par RS-7) : [code, visibility (le filtrage serveur), libellé, sens]. O et I partagent
  // la visibilité « moi » (l'auteur seul) : O = brouillon, rien ne sort (le serveur refuse de le développer).
  var DEGRES = [['O', 'moi', 'brouillon', 'rien ne sort : toi seul, pas même un repo'], ['I', 'moi', 'moi', 'moi et mes identités'],
    ['X', 'amis', 'potes', 'mes xerions : les amis'], ['N', 'zion', 'zions', 'le nexus : les zions'], ['N+', 'public', 'ouvert', 'N ouvert : tous les connectés']];
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function degresActifs() { return DEGRES_SRV && lsGet('xb:degres') !== 'off'; }
  function tsoinActif() { return TSOIN_SRV && lsGet('xb:partage.tsoin') !== 'off'; }
  function degreInfo(c) { for (var i = 0; i < DEGRES.length; i++) if (DEGRES[i][0] === c) return DEGRES[i]; return null; }
  // un mot des deux vocabulaires (moi/amis/zion/public, O/I/X/N/N+, « brouillon ») → [visibility, degre] ; inconnu → null
  function versDegre(v) {
    v = String(v == null ? '' : v); if (v === 'brouillon') v = 'O';
    var d = degreInfo(v); if (d) return [d[1], d[0]];
    for (var i = 1; i < DEGRES.length; i++) if (DEGRES[i][1] === v) return [v, DEGRES[i][0]];
    return null;
  }
  // le degré d'une chose du fil : celui que rend le serveur (absent sous SOCIAL_DEGRES=0 → null = l'ancien vocabulaire)
  function degreDe(post) { var d = post && post.degre; return (degresActifs() && typeof d === 'string' && degreInfo(d)) ? d : null; }
  function badgeDegre(post) {
    var d = degreInfo(degreDe(post)); if (!d) return '';
    return '<span class="ptg-d ptg-d--' + (d[0] === 'N+' ? 'Nplus' : d[0]) + '" title="' + esc(d[0] + ' · ' + d[3]) + '">' + esc(d[0] + ' · ' + d[2]) + '</span>';
  }

  function actif() {
    try { if (/[?&]partage=off\b/.test(location.search)) return false; } catch (e) {}
    try { if (localStorage.getItem('xb:partage.off') === '1') return false; } catch (e2) {}
    return true;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // URL affichable : http(s) absolue ou chemin same-origin — jamais javascript:/data:
  // « /\evil » = //evil pour un navigateur (lien sortant déguisé en chemin local) : refusé (relecture sécurité 25.09), comme le serveur
  function safeUrl(u) { u = String(u || ''); return (/^https?:\/\//i.test(u) || /^\/(?![\/\\])/.test(u)) && !/[\s"<>\\]/.test(u) ? u : ''; }
  function csrf() { var m = document.querySelector('meta[name="csrf-token"]'); return m ? (m.getAttribute('content') || '') : ''; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function erreur(r, d) {
    var m = (d && (d.error || d.message)) || (r.status === 401 || r.status === 419 ? 'connecte-toi d\'abord' : ('erreur ' + r.status));
    var e = new Error(m); e.status = r.status; return e;
  }
  function json(method, url, body) {
    var o = { method: method, credentials: 'same-origin', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } };
    if (method !== 'GET') o.headers['X-CSRF-TOKEN'] = csrf();
    if (body !== undefined) { o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(body); }
    return fetch(url, o).then(function (r) {
      return r.json().catch(function () { return null; }).then(function (d) { if (!r.ok) throw erreur(r, d); return d || {}; });
    });
  }
  function annonce(post) {
    try { window.dispatchEvent(new CustomEvent('xb:partage', { detail: { post: post } })); } catch (e) {}
    try { if (window.jOSPorts && window.jOSPorts.emit) window.jOSPorts.emit('partage', 'cree', post); } catch (e2) {}
  }

  // ---- partager : l'enveloppe → le serveur (il valide ; ici on ne fait que transporter) ----
  // visibility (+ degre si O) d'une enveloppe : o.degre gagne, puis o.visibility (les deux vocabulaires) ; défaut amis (X). On n'envoie
  // « degre » que pour un brouillon (O) : le reste se déduit de visibility, et un serveur sans les degrés garde un post « moi » (privé).
  function visDe(o) {
    var d = o.degre ? versDegre(o.degre) : null, v = o.visibility ? versDegre(o.visibility) : null, r = d || v;
    if (!r) return [o.visibility || 'amis', null];
    return [r[0], (r[1] === 'O' && degresActifs()) ? 'O' : null];
  }
  function partager(o) {
    o = o || {};
    var vd = visDe(o);
    var corps = { kind: o.kind || 'texte', visibility: vd[0], caption: o.caption || '', title: o.title || '', zone: o.zone || '' };
    if (vd[1]) corps.degre = vd[1];
    if (o.payload && typeof o.payload === 'object') corps.payload = o.payload;
    var files = (o.fichiers || []).filter(Boolean);
    var p;
    if (files.length) {
      var fd = new FormData();
      Object.keys(corps).forEach(function (k) { if (k === 'payload') fd.append('payload', JSON.stringify(corps.payload)); else if (corps[k] !== '') fd.append(k, corps[k]); });
      files.slice(0, 6).forEach(function (f) { fd.append('media[]', f, f.name || 'media'); });
      p = fetch('/px/xion/post', { method: 'POST', credentials: 'same-origin', body: fd, headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf(), 'X-Requested-With': 'XMLHttpRequest' } })
        .then(function (r) { return r.json().catch(function () { return null; }).then(function (d) { if (!r.ok) throw erreur(r, d); return d || {}; }); });
    } else {
      if (!corps.zone) delete corps.zone;
      if (!corps.title) delete corps.title;
      p = json('POST', '/px/partage', corps);
    }
    return p.then(function (d) { var post = d && d.post; if (post) annonce(post); return post; });
  }
  function get(id) { return json('GET', '/px/partage/' + encodeURIComponent(id)).then(function (d) { return d.post; }); }
  function developper(id) {
    return json('POST', '/px/partage/' + encodeURIComponent(id) + '/developper', {}).catch(function (e) {
      if (e.status === 404 || e.status === 405) { var x = new Error('« développer » n\'est pas encore branché sur ce boxion'); x.status = e.status; throw x; }
      throw e;
    });
  }

  // ---- rendu d'une chose partagée, par kind (tout échappé ; URLs filtrées) ----
  function taille(n) { n = +n || 0; return n > 1048576 ? (n / 1048576).toFixed(1) + ' Mo' : n > 1024 ? Math.round(n / 1024) + ' Ko' : n + ' o'; }
  function ouvrir(id) { try { if (window.jOSMobile && window.jOSMobile.open(id, id)) return; } catch (e) {} try { if (window.jOS && window.jOS.openPloxion) { window.jOS.openPloxion(id); return; } } catch (e2) {} location.href = '/px/' + encodeURIComponent(id); }
  var regP = null;
  function registre() { if (!regP) regP = fetch('/px/registry.json', { credentials: 'same-origin', headers: { Accept: 'application/json' } }).then(function (r) { return r.json(); })
    .then(function (d) { var m = {}; ((d && d.ploxions) || []).forEach(function (x) { if (x && x.id) m[x.id] = x; }); return m; }).catch(function () { regP = null; return {}; }); return regP; }
  function corps(post) {
    var k = (post && post.kind) || 'texte', p = (post && post.payload) || {}, h = '';
    if (k === 'texte' || (k === 'image' && !(p.media || []).length) || (k === 'video' && !(p.media || []).length)) return null;
    var c = el('div', 'ptg-c ptg-c--' + k);
    if (k === 'lien') {
      var u = safeUrl(p.url);
      h = '<div class="t">🔗 ' + (u ? '<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer nofollow">' + esc(p.titre || u) + '</a>' : esc(p.url)) + '</div>'
        + (p.description ? '<div class="d">' + esc(p.description) + '</div>' : '');
      // (15.10, RS-7 : « un aperçu de la playlist Spotify, avec l'image de la playlist et les sons ») le lecteur intégré de Spotify : la
      // pochette, la liste des titres et leurs extraits ; open.spotify.com est déjà dans frame-src (config/csp.php)
      var sp = /^https:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(playlist|album|track|artist|episode|show)\/([A-Za-z0-9]{10,32})/.exec(u || '');
      if (sp) h += '<iframe class="ptg-spotify ' + sp[1] + '" src="https://open.spotify.com/embed/' + sp[1] + '/' + sp[2] + '?theme=0" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" title="Spotify"></iframe>';
    } else if (k === 'image' || k === 'video') {
      (p.media || []).slice(0, 6).forEach(function (m) { var mu = safeUrl(m && m.url); if (!mu) return;
        h += m.type === 'video' ? '<video src="' + esc(mu) + '" controls playsinline preload="metadata" muted></video>' : '<img src="' + esc(mu) + '" alt="" loading="lazy">'; });
    } else if (k === 'fichier') {
      var fu = safeUrl(p.url);
      h = '<div class="t">📄 ' + esc(p.nom) + '</div><div class="d">' + esc([p.mime, p.taille ? taille(p.taille) : '', p.chemin].filter(Boolean).join(' · ')) + '</div>'
        + (fu ? '<a href="' + esc(fu) + '" target="_blank" rel="noopener noreferrer">télécharger</a>' : (p.chemin ? '<button class="ptg__b" data-ptg-fs>📁 ouvrir dans mes fichiers</button>' : ''));
    } else if (k === 'lieu') {
      var la = +p.lat, lo = +p.lng;
      h = '<div class="t">📍 ' + esc(p.nom || 'un lieu') + '</div><div class="d">' + esc(la.toFixed(5) + ', ' + lo.toFixed(5)) + (p.adresse ? ' · ' + esc(p.adresse) : '') + '</div>'
        + (isFinite(la) && isFinite(lo) ? '<button type="button" class="ptg-b" data-ptg-lieu>⌖ voir sur la carte</button>' : '');   // (02.11) LA carte, plus un site externe
    } else if (k === 'tsoin') {
      var nev = (p.events || []).length, ref = (p.ref && typeof p.ref === 'object') ? p.ref : null;
      h = '<div class="t">⧗ ' + esc(p.label || p.id || 'un tsoin') + '</div><div class="d">'
        + (nev ? nev + (p.total > nev ? ' sur ' + (+p.total) : '') + ' événements' : (ref ? esc(REF_NOM[ref.type] || 'une référence') : '0 événement'))
        + (p.dur ? ' · ' + Math.round(p.dur / 1000) + ' s' : '') + (p.resume ? ' · ' + esc(p.resume) : '') + '</div>'
        + (tsoinActif() && (nev || ref) ? '<button type="button" class="ptg-b" data-ptg-rejouer>▶ rejouer</button>' : '');
    } else if (k === 'idee') {
      h = '<div class="t">💡 ' + esc(p.pitch) + '</div>' + (p.braindump ? '<details><summary class="d">braindump</summary><pre>' + esc(p.braindump) + '</pre></details>' : '')
        + ((p.blocs || []).length ? '<div class="d">blocs : ' + esc(p.blocs.join(' · ')) + '</div>' : '');
    } else if (k === 'ploxion') {
      // (15.10, RS-7 : « pour les partages de ploxion, un aperçu du ploxion ») la carte du registre (icône, nom, catégorie, description) et,
      // sur demande, le ploxion VIVANT dans une petite fenêtre (le fil reste léger : rien ne se charge sans le geste)
      h = '<div class="ptg-px"><span class="ptg-px-ic" data-ptg-ic>🧩</span><div><div class="t"><b data-ptg-nom>' + esc(p.id) + '</b></div><div class="d" data-ptg-cat>ploxion</div></div></div>'
        + '<div class="d ptg-px-desc" data-ptg-desc></div>'
        + (p.params && Object.keys(p.params).length ? '<div class="d">' + esc(Object.keys(p.params).map(function (x) { return x + '=' + p.params[x]; }).join(' · ')) + '</div>' : '')
        + '<div class="ptg-px-b"><button class="ptg__b" data-ptg-apercu>◎ aperçu</button><button class="ptg__b" data-ptg-px>▶ ouvrir</button></div><div data-ptg-vue></div>';
    } else if (k === 'objet3d') {
      var ou = safeUrl(p.fichier);
      h = '<div class="t">🧊 ' + esc(p.nom) + '</div>' + (ou ? '<a href="' + esc(ou) + '" target="_blank" rel="noopener noreferrer">fichier 3D ↗</a>' : '')
        + (p.scad ? '<details><summary class="d">recette OpenSCAD</summary><pre>' + esc(p.scad) + '</pre></details>' : '');
    } else if (k === 'postit') {
      var co = String(p.couleur || ''); if (/^#[0-9a-f]{3}$/i.test(co)) co = '#' + co[1] + co[1] + co[2] + co[2] + co[3] + co[3];   // #rgb + '33' n'est pas une couleur
      c.style.background = /^#[0-9a-f]{6}$/i.test(co) ? co + '33' : '';
      h = '<div>🗒 ' + esc(p.texte) + '</div>';
    } else if (k === 'xer') {   // lot 2 du compositeur de xer (docs/dev/37 §12) : un xer = un document, une DONNÉE ; ▶ l'ouvre dans une feuille, rien sans geste
      var xd = (p.doc && typeof p.doc === 'object') ? p.doc : null;
      h = '<div class="t">✥ ' + esc(xd ? (String(xd.icone || '') + ' ' + String(xd.nom || 'un xer')) : (p.titre || 'un xer')) + '</div>'
        + (xd && xd.desc ? '<div class="d">' + esc(xd.desc) + '</div>' : '')
        + '<div class="d">un xer : une donnée, rien ne change sans ton geste' + (xd && xd.auteur && xd.auteur.handle ? ' · @' + esc(xd.auteur.handle) : '') + '</div>'
        + (xd && post && post.id ? '<button type="button" class="ptg-b" data-ptg-xer>✥ voir · installer</button>' : '');
    } else {   // bion · kion · glyphe · zone : générique, clés/valeurs échappées
      h = '<div class="t">' + (ICONES[k] || '•') + ' ' + esc(p.nom || p.id || p.seed || k) + '</div><div class="d">'
        + Object.keys(p).filter(function (x) { return x !== 'titre' && x !== 'icone' && typeof p[x] !== 'object'; }).map(function (x) { return esc(x) + ' : ' + esc(p[x]); }).join('<br>') + '</div>';
    }
    c.innerHTML = h;
    var bx = c.querySelector('[data-ptg-px]');
    if (bx) bx.onclick = function () {
      var u = '/px/' + encodeURIComponent(p.id || '') + (p.params && Object.keys(p.params).length ? '?' + new URLSearchParams(p.params).toString() : '');
      if (p.params && Object.keys(p.params).length) location.href = u; else ouvrir(p.id);
    };
    if (k === 'ploxion' && p.id) {
      registre().then(function (m) { var x = m[p.id]; if (!x) return; var q = function (s) { return c.querySelector(s); };
        if (q('[data-ptg-ic]')) q('[data-ptg-ic]').textContent = x.icon || '🧩'; if (q('[data-ptg-nom]')) q('[data-ptg-nom]').textContent = x.name || p.id;
        if (q('[data-ptg-cat]')) q('[data-ptg-cat]').textContent = (x.cat_icon || '') + ' ' + (x.cat_label || 'ploxion');
        if (q('[data-ptg-desc]')) q('[data-ptg-desc]').textContent = String(x.description || '').slice(0, 220) + (String(x.description || '').length > 220 ? '…' : ''); }).catch(function () {});
      var ba = c.querySelector('[data-ptg-apercu]');
      if (ba) ba.onclick = function () { var v = c.querySelector('[data-ptg-vue]'); if (v.firstChild) { v.innerHTML = ''; ba.textContent = '◎ aperçu'; return; }
        v.innerHTML = '<iframe class="ptg-px-vue" src="/px/' + encodeURIComponent(p.id) + '?embed=1" loading="lazy" title="aperçu"></iframe>'; ba.textContent = '✕ fermer l\'aperçu'; };
    }
    var bl = c.querySelector('[data-ptg-lieu]');
    if (bl) bl.onclick = function () { try { if (window.jOSCarte && window.jOSCarte.ouvrirLieu && window.jOSCarte.ouvrirLieu(p.lat, p.lng, p.nom)) return; } catch (e) {}
      try { sessionStorage.setItem('carte:lieu', JSON.stringify({ lat: +p.lat, lng: +p.lng, name: p.nom || '', t: Date.now() })); } catch (e) {} ouvrir('carte'); };
    var bf = c.querySelector('[data-ptg-fs]');
    // (26.09, docs/dev/33 § « Ouvrir un fichier dans son app, de partout ») le fichier choisi s'ouvre AUSSI dans son app (pick {ouvrir}) ;
    // xb:fichiers.ouvrir-partout=off : le sélecteur d'avant, rien de plus
    if (bf) bf.onclick = function () { try { if (window.jOSFiles && window.jOSFiles.pick) { window.jOSFiles.pick({ mode: 'open', dir: String(p.chemin).replace(/\/[^/]*$/, '/'), ouvrir: 'partage' }); return; } } catch (e) {} ouvrir('files'); };
    var bxer = c.querySelector('[data-ptg-xer]');
    if (bxer) bxer.onclick = function () {   // la feuille de jOSXerDoc (le lien p:<id> : le serveur ne rend le xer qu'à qui peut le voir)
      try { if (window.jOSXerDoc && window.jOSXerDoc.recevoir) { window.jOSXerDoc.recevoir('p:' + post.id); return; } } catch (e) {}
      location.href = '/home?xer-recevoir=' + encodeURIComponent('p:' + post.id);
    };
    var br = c.querySelector('[data-ptg-rejouer]');
    if (br) br.onclick = function () { rejouer(post); };
    return c;
  }
  // le repo d'une chose : le fil le donne en slug (post.repo), POST …/developper en objet {id, slug, url} → toujours le slug
  // (relecture 25.09 : sans ça la bande affichait « 📦 [object Object] » après « développer »)
  function repoSlug(r) { return (r && typeof r === 'object') ? String(r.slug || r.id || '') : String(r || ''); }
  function pipeline(post, onDev) {
    var st = (post && post.statut) || 'partage', i = -1, box = el('div', 'ptg-p'), rs = repoSlug(post && post.repo), ru = safeUrl(post && post.repo_url);
    // un brouillon (degré O, social v1) n'est pas encore dans la pipeline : rien ne sort, pas de « développer » (le serveur refuse)
    if (degreDe(post) === 'O') { box.innerHTML = '<span class="ici">O · brouillon</span><span>rien ne sort tant que tu ne le publies pas</span>'; return box; }
    ETAPES.forEach(function (e, n) { if (e[0] === st) i = n; });
    box.innerHTML = ETAPES.map(function (e, n) { return '<span class="' + (n === i ? 'ici' : (n < i ? 'fait' : '')) + '">' + esc(e[1]) + '</span>'; }).join('')
      + (rs ? '<span class="fait">📦 ' + (ru ? '<a href="' + esc(ru) + '" target="_blank" rel="noopener noreferrer">' + esc(rs) + '</a>' : esc(rs)) + '</span>' : '')
      + (post && !rs && onDev ? '<button type="button" data-ptg-dev>🛠 développer</button>' : '');
    var b = box.querySelector('[data-ptg-dev]');
    if (b) b.onclick = function () {
      b.disabled = true; b.textContent = '…';
      developper(post.id).then(function (d) {
        var np = (d && d.post) || null, r = np ? np.repo : (d && (d.repo || d.slug));
        post.repo = repoSlug(r) || repoSlug(post.repo); post.statut = (np && np.statut) || (d && d.statut) || 'repo';
        if (r && typeof r === 'object' && r.url) post.repo_url = r.url;
        onDev(null, post);
      }).catch(function (e) { b.disabled = false; b.textContent = '🛠 développer'; onDev(e, post); });
    };
    return box;
  }

  // ---- LE composeur (feuille modale, construite au 1er appel) ----
  var ov = null, st = null;
  function zoneCourante() { try { var z = window.jOSZone && window.jOSZone.current && window.jOSZone.current(); return (z && z.id) || ''; } catch (e) { return ''; } }
  function pxCourant() { var m = /^\/px\/([a-z0-9][a-z0-9-]{1,63})/.exec(location.pathname || ''); return m ? m[1] : ''; }
  function tsoins() {
    var l = [];
    try { if (window.jOSTsoin && window.jOSTsoin.list) l = l.concat(window.jOSTsoin.list() || []); } catch (e) {}
    try { if (window.jOSTsoinEngine && window.jOSTsoinEngine.list) l = l.concat(window.jOSTsoinEngine.list() || []); } catch (e2) {}
    // social v1 : les sessions scellées de la machine (jOSSession : leurs actions = un tsoin v1), sous le même kill-switch que partagerTsoin
    try { if (tsoinActif() && window.jOSSession && typeof window.jOSSession.list === 'function') (window.jOSSession.list() || []).forEach(function (s) { if (s && s.id && Array.isArray(s.actions)) l.push({ id: s.id, label: s.label, dur: s.dur, events: s.actions, session: true }); }); } catch (e3) {}
    var vu = {}; return l.filter(function (t) { if (!t || !t.id || vu[t.id]) return false; vu[t.id] = 1; return Array.isArray(t.events) && t.events.length; }).slice(-20).reverse();
  }
  function champs() {
    var k = st.choix, p = st.payload || {}, h = '';
    var txt = '<textarea data-f="caption" rows="3" placeholder="' + (k === 'texte' ? 'dis un truc…' : 'un mot pour accompagner (optionnel)') + '">' + esc(st.caption) + '</textarea>';
    if (k === 'texte') h = txt;
    else if (k === 'lien') h = '<input data-f="url" inputmode="url" placeholder="https://…" value="' + esc(p.url || '') + '"><input data-f="description" placeholder="de quoi ça parle (optionnel)" value="' + esc(p.description || '') + '">' + txt;
    else if (k === 'media') h = '<button type="button" class="ptg__b" data-a="pick">📷 Choisir photos / vidéos</button>'
      + (window.jOSFiles && window.jOSFiles.pick ? ' <button type="button" class="ptg__b" data-a="fs-media">📁 depuis mes fichiers</button>' : '')
      + '<input type="file" data-f="files" accept="image/*,video/*" multiple hidden><div class="ptg__hint" data-info>' + (st.fichiers.length ? st.fichiers.length + ' média(s) prêt(s)' : 'jusqu\'à 6 · 40 Mo chacun') + '</div>' + txt;
    else if (k === 'fichier') h = (window.jOSFiles && window.jOSFiles.pick ? '<button type="button" class="ptg__b" data-a="fs-file">📁 Choisir dans mes fichiers</button>' : '<div class="ptg__hint">jOSFiles absent ici — ouvre le composeur depuis le bureau.</div>')
      + '<div class="ptg__hint" data-info>' + (p.chemin ? esc(p.nom + ' — ' + p.chemin) : 'astuce : un fichier dans chaoxion:/ s\'ouvre chez les zions ; ailleurs, toi seul l\'ouvres') + '</div>' + txt;
    else if (k === 'lieu') h = '<button type="button" class="ptg__b" data-a="geo">📍 Ma position</button><div class="ptg__row"><input data-f="lat" inputmode="decimal" placeholder="latitude" value="' + esc(p.lat != null ? p.lat : '') + '"><input data-f="lng" inputmode="decimal" placeholder="longitude" value="' + esc(p.lng != null ? p.lng : '') + '"></div>'
      + '<input data-f="nom" placeholder="le nom du lieu" value="' + esc(p.nom || '') + '">' + txt;
    else if (k === 'tsoin') {
      var ts = tsoins(), dansListe = ts.some(function (t) { return p.id && t.id === p.id; });
      // un tsoin arrivé tout prêt (partagerTsoin(source, {composer:true}) : une frame, une branche, une session d'ailleurs)
      h = (!dansListe && ((p.events && p.events.length) || (p.ref && p.ref.id)) ? '<div class="ptg__hint">⧗ ' + esc(p.label || p.titre || 'un tsoin') + ' — prêt à partager</div>' : '')
        + (ts.length ? '<div class="ptg__list">' + ts.map(function (t) { return '<button type="button" data-ts="' + esc(t.id) + '" class="' + (p.id === t.id ? 'on' : '') + '">' + (t.session ? '🎬 ' : '⧗ ') + esc(t.label || t.name || t.id) + ' · ' + t.events.length + ' év.</button>'; }).join('') + '</div>' : '<div class="ptg__hint">pas encore de tsoin enregistré sur cet appareil</div>');
      h += txt;
    }
    else if (k === 'idee') h = '<textarea data-f="pitch" rows="2" placeholder="l\'idée en une phrase">' + esc(p.pitch || '') + '</textarea><textarea data-f="braindump" rows="4" placeholder="balance tout (optionnel)">' + esc(p.braindump || '') + '</textarea>';
    else if (k === 'ploxion') h = '<input data-f="pxid" placeholder="id du ploxion (ex. carte)" value="' + esc(p.id || pxCourant()) + '">' + txt;
    else if (k === 'objet3d') h = '<input data-f="nom" placeholder="nom de l\'objet" value="' + esc(p.nom || '') + '"><input data-f="fichier" inputmode="url" placeholder="lien du fichier 3D (optionnel)" value="' + esc(p.fichier || '') + '"><textarea data-f="scad" rows="4" placeholder="recette OpenSCAD (optionnel)">' + esc(p.scad || '') + '</textarea>' + txt;
    else h = '<div class="ptg__hint">' + (ICONES[k] || '•') + ' ' + esc(k) + ' prêt à partager</div>' + txt;   // kinds venus d'un ploxion (bion, kion, glyphe, postit, zone)
    return h;
  }
  function f(n) { var e = ov.querySelector('[data-f="' + n + '"]'); return e ? String(e.value || '').trim() : ''; }
  function lire() {   // formulaire → état (garde ce qui est tapé quand on change de kind)
    if (!ov) return; var k = st.choix, p = st.payload = st.payload || {};
    if (ov.querySelector('[data-f="caption"]')) st.caption = f('caption');
    st.title = f('title');
    if (k === 'lien') { p.url = f('url'); p.description = f('description'); }
    else if (k === 'lieu') { p.lat = f('lat'); p.lng = f('lng'); p.nom = f('nom'); }
    else if (k === 'idee') { p.pitch = f('pitch'); p.braindump = f('braindump'); }
    else if (k === 'ploxion') { p.id = f('pxid'); }
    else if (k === 'objet3d') { p.nom = f('nom'); p.fichier = f('fichier'); p.scad = f('scad'); }
  }
  function nettoie(o) { var r = {}; Object.keys(o || {}).forEach(function (k) { var v = o[k]; if (v !== '' && v != null && !(Array.isArray(v) && !v.length)) r[k] = v; }); return r; }
  function enveloppe() {
    lire();
    var k = st.choix, p = st.payload || {}, e = { kind: k, title: st.title, caption: st.caption, visibility: st.vis, zone: f('zone') };
    if (st.deg === 'O') e.degre = 'O';   // un brouillon (social v1) : visibility « moi » + degre O
    if (k === 'media') { e.fichiers = st.fichiers; e.kind = st.fichiers.length && /^video/.test(st.fichiers[0].type || '') ? 'video' : 'image'; if (!st.fichiers.length) throw new Error('choisis au moins une photo ou vidéo'); return e; }
    if (k === 'texte') { if (!st.caption) throw new Error('écris quelque chose'); return e; }
    if (k === 'lien') { if (!/^https?:\/\//i.test(p.url || '')) throw new Error('un lien http(s)://…'); e.payload = nettoie({ url: p.url, description: p.description }); }
    else if (k === 'lieu') { if (p.lat === '' || p.lng === '' || isNaN(+p.lat) || isNaN(+p.lng)) throw new Error('il faut une position (📍 ou lat/lng)'); e.payload = nettoie({ lat: +p.lat, lng: +p.lng, nom: p.nom, adresse: p.adresse, zoom: p.zoom }); }
    else if (k === 'tsoin') {
      if (!(p.events && p.events.length) && !(tsoinActif() && p.ref && p.ref.id)) throw new Error('choisis un tsoin');
      // social v1 : le tsoin BORNÉ comme par partagerTsoin (sans valeurs saisies ni images, ≤ 60 Ko) ; sous le kill-switch, l'envoi d'avant
      if (tsoinActif()) { var tb = tsoinDe(p.session ? { id: p.id, label: p.label, dur: p.dur, actions: p.events, counts: {} } : p); if (!tb) throw new Error('ce tsoin est illisible'); e.payload = tb.payload; }
      else e.payload = nettoie({ id: /^[a-z0-9][a-z0-9_.-]{0,63}$/i.test(p.id || '') ? p.id : '', label: String(p.label || '').slice(0, 200), dur: +p.dur || '', events: p.events.slice(0, 200) });
    }
    else if (k === 'idee') { if (!p.pitch) throw new Error('l\'idée en une phrase'); e.payload = nettoie({ pitch: p.pitch, braindump: p.braindump, blocs: p.blocs }); }
    else if (k === 'ploxion') { if (!p.id) throw new Error('quel ploxion ?'); e.payload = nettoie({ id: p.id, params: p.params }); }
    else if (k === 'objet3d') { if (!p.nom) throw new Error('le nom de l\'objet'); e.payload = nettoie({ nom: p.nom, fichier: p.fichier, scad: p.scad, bion: p.bion, params: p.params }); }
    else if (k === 'fichier') { if (!p.chemin && !p.url) throw new Error('choisis un fichier'); e.payload = nettoie({ nom: p.nom, chemin: p.chemin, url: p.url, taille: p.taille, mime: p.mime }); }
    else e.payload = nettoie(p);
    return e;
  }
  function peindre() {
    ov.querySelector('[data-kinds]').innerHTML = CHOIX.concat(CHOIX.some(function (c) { return c[0] === st.choix; }) ? [] : [[st.choix, (ICONES[st.choix] || '•') + ' ' + st.choix]])
      .map(function (c) { return '<button type="button" class="ptg__k' + (c[0] === st.choix ? ' on' : '') + '" data-k="' + esc(c[0]) + '">' + esc(c[1]) + '</button>'; }).join('');
    ov.querySelector('[data-champs]').innerHTML = champs();
    // les degrés (social v1) : data-v garde la visibility (l'ancien vocabulaire, le filtrage), data-d le degré ; sinon les 4 d'avant
    ov.querySelector('[data-vis]').innerHTML = degresActifs()
      ? DEGRES.map(function (d) { return '<button type="button" data-v="' + d[1] + '" data-d="' + esc(d[0]) + '" title="' + esc(d[0] + ' · ' + d[3]) + '" class="' + (d[0] === st.deg ? 'on' : '') + '"><b>' + esc(d[0]) + '</b><small>' + esc(d[2]) + '</small></button>'; }).join('')
      : VISIBILITES.map(function (v) { return '<button type="button" data-v="' + v[0] + '" class="' + (v[0] === st.vis ? 'on' : '') + '">' + esc(v[1]) + '</button>'; }).join('');
    ov.querySelector('[data-vhint]').innerHTML = degresActifs()
      ? 'X par défaut : tes potes voient · O = brouillon, rien ne sort<details class="ptg__deg"><summary>les degrés O · I · X · N, c\'est quoi ?</summary>'
        + DEGRES.map(function (d) { return '<div><b>' + esc(d[0]) + '</b> · ' + esc(d[3]) + '</div>'; }).join('')
        + '<div>proposition de RS-1, <b>à confirmer par RS-7</b></div></details>'
      : 'par défaut tes amis voient ; 🔒 moi = rien que toi';
    ov.querySelector('[data-err]').textContent = '';
  }
  function fermer(post) { if (!ov) return; ov.hidden = true; var r = st && st.resolve; st = null; if (r) r(post || null); }
  function construire() {
    ov = el('div'); ov.id = 'ptg-ov'; ov.hidden = true;
    ov.innerHTML = '<div class="ptg" role="dialog" aria-label="Partager"><div class="ptg__hd"><b>📤 Partager n\'importe quoi</b><button type="button" class="ptg__x" data-a="x" aria-label="fermer">×</button></div>'
      + '<div class="ptg__kinds" data-kinds></div><input data-f="title" maxlength="200" placeholder="titre (optionnel)"><div data-champs></div>'
      + '<div class="ptg__vis" data-vis></div><input data-f="zone" maxlength="100" placeholder="zone (optionnel)"><div class="ptg__hint" data-vhint></div>'
      + '<div class="ptg__err" data-err></div><button type="button" class="ptg__b ptg__go" data-a="go">Partager</button></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) {
      if (e.target === ov) { fermer(null); return; }
      var t = e.target.closest('[data-k],[data-v],[data-a],[data-ts]'); if (!t || !st) return;
      if (t.hasAttribute('data-k')) { lire(); st.choix = t.getAttribute('data-k'); peindre(); return; }
      if (t.hasAttribute('data-v')) { st.vis = t.getAttribute('data-v'); st.deg = t.getAttribute('data-d') || null; ov.querySelectorAll('[data-v]').forEach(function (b) { b.classList.toggle('on', b === t); }); return; }
      if (t.hasAttribute('data-ts')) { var id = t.getAttribute('data-ts'), ts = tsoins().filter(function (x) { return x.id === id; })[0]; if (ts) { lire(); st.payload = { id: ts.id, label: ts.label || ts.name || '', dur: ts.dur, events: ts.events, session: !!ts.session }; var ti = ov.querySelector('[data-f="title"]'); if (ti && !ti.value) ti.value = st.title = ts.label || ts.name || ''; peindre(); } return; }
      var a = t.getAttribute('data-a'), info = ov.querySelector('[data-info]');
      if (a === 'x') fermer(null);
      else if (a === 'go') envoyer(t);
      else if (a === 'pick') { var inp = ov.querySelector('[data-f="files"]'); if (inp) inp.click(); }
      else if (a === 'geo') {
        if (!navigator.geolocation) { ov.querySelector('[data-err]').textContent = 'pas de géoloc ici — tape lat/lng'; return; }
        t.textContent = '📍 …';
        navigator.geolocation.getCurrentPosition(function (pos) { if (!st) return; lire(); st.payload.lat = +pos.coords.latitude.toFixed(6); st.payload.lng = +pos.coords.longitude.toFixed(6); peindre(); },
          function () { if (!st) return; t.textContent = '📍 Ma position'; ov.querySelector('[data-err]').textContent = 'position refusée — tape lat/lng'; }, { timeout: 12000, maximumAge: 60000 });
      } else if (a === 'fs-media' || a === 'fs-file') {
        Promise.resolve(window.jOSFiles.pick({ mode: 'open' })).then(function (path) {
          if (!path || !st) return;
          var nom = String(path).split('/').pop();
          if (a === 'fs-file') {
            lire(); st.payload = { nom: nom, chemin: String(path) };
            Promise.resolve(window.jOSFiles.stat ? window.jOSFiles.stat(path) : null).then(function (s) { if (s && st) { st.payload.taille = s.size; st.payload.mime = s.mime; } }).catch(function () {}).then(function () { if (st) peindre(); });
            return;
          }
          return window.jOSFiles.readBlob(path).then(function (b) {
            if (!b || !st) return;
            if (!/^(image|video)\//.test(b.type || '')) { ov.querySelector('[data-err]').textContent = 'pas une photo/vidéo'; return; }
            try { st.fichiers.push(new File([b], nom, { type: b.type })); } catch (e2) { b.name = nom; st.fichiers.push(b); }
            if (info) info.textContent = st.fichiers.length + ' média(s) prêt(s)';
          });
        }).catch(function () {});
      }
    });
    ov.addEventListener('change', function (e) {
      if (!st || !e.target.matches('[data-f="files"]')) return;
      var err = ov.querySelector('[data-err]'); err.textContent = '';
      Array.prototype.slice.call(e.target.files || []).forEach(function (fl) {
        if (st.fichiers.length >= 6) { err.textContent = '6 médias max'; return; }
        if (fl.size > 40 * 1024 * 1024) { err.textContent = fl.name + ' dépasse 40 Mo'; return; }
        st.fichiers.push(fl);
      });
      var info = ov.querySelector('[data-info]'); if (info) info.textContent = st.fichiers.length + ' média(s) prêt(s)';
      try { e.target.value = ''; } catch (e3) {}
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov && !ov.hidden) fermer(null); });
  }
  function envoyer(btn) {
    var err = ov.querySelector('[data-err]'), env;
    try { env = enveloppe(); } catch (e) { err.textContent = e.message; return; }
    btn.disabled = true; btn.textContent = 'partage…';
    partager(env).then(function (post) {
      btn.disabled = false; btn.textContent = 'Partager';
      try { if (window.jOSb && window.jOSb.toast) window.jOSb.toast(document.body, 'partagé ✓'); } catch (e) {}
      fermer(post);
    }).catch(function (e) { btn.disabled = false; btn.textContent = 'Partager'; err.textContent = e.message || 'échec'; });
  }
  function composer(opts) {
    opts = opts || {};
    if (!ov) construire();
    if (st && st.resolve) st.resolve(null);
    var k = opts.kind || 'texte';
    // un kind sans champs ici (bion, kion, glyphe, postit, zone…) ET sans payload = impasse (422 « payload.x requis ») → texte
    // (ex. le filtre 🧬 du fil puis ➕). Venu d'un ploxion avec son payload, il est gardé tel quel.
    if (k !== 'image' && k !== 'video' && !CHOIX.some(function (c) { return c[0] === k; }) && !(opts.payload && Object.keys(opts.payload).length)) k = 'texte';
    // la pré-sélection accepte les deux vocabulaires (opts.degre ou opts.visibility) ; défaut amis = X
    var vd = versDegre(opts.degre) || versDegre(opts.visibility) || ['amis', 'X'];
    if (vd[1] === 'O' && !degresActifs()) vd = ['moi', 'I'];
    return new Promise(function (resolve) {
      st = { choix: (k === 'image' || k === 'video') ? 'media' : k, payload: JSON.parse(JSON.stringify(opts.payload || {})), caption: opts.caption || '', title: opts.title || '',
        vis: vd[0], deg: vd[1], fichiers: (opts.fichiers || []).slice(0, 6), resolve: resolve };
      peindre();
      ov.querySelector('[data-f="title"]').value = st.title;
      ov.querySelector('[data-f="zone"]').value = opts.zone != null ? opts.zone : zoneCourante();
      ov.hidden = false;
    });
  }

  // ---- social v1 : changer le degré d'une chose (l'auteur : publier un brouillon O → I / X / N / N+) ----
  function changerDegre(id, degre) {
    return json('POST', '/px/partage/' + encodeURIComponent(id) + '/degre', { degre: String(degre || '') }).then(function (d) {
      var post = d && d.post;
      if (post) { try { window.dispatchEvent(new CustomEvent('xb:partage:degre', { detail: { post: post } })); } catch (e) {} }
      return post;
    });
  }

  // =====================================================================================================================
  // social v1 — PARTAGER UN TSOIN EN UN GESTE (docs/dev/35-social-echelle.md). Aucune capture ici : on LIT les sources qui
  // existent (jOSSession, jOSTemps, jOSTsoin, jOSTsoinEngine) et on BORNE ce qui part. Rejouer = LECTURE SEULE.
  // =====================================================================================================================
  var REF_NOM = { session: 'une session de la machine', frame: 'un instant de la machine à tsoins', branche: 'une branche de la machine à tsoins', tsoin: 'un tsoin' };
  var EV_MAX = 200, OCTETS_MAX = 60000, DUR_MAX = 604800000;
  var SLUG = /^[a-z0-9][a-z0-9_.-]{0,63}$/i, REF_ID = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,119}$/, REF_SRC = /^[A-Za-z0-9_][A-Za-z0-9_.:-]{0,99}$/;
  function num(v) { v = +v; return isFinite(v) ? v : 0; }
  function octets(s) { try { return new TextEncoder().encode(s).length; } catch (e) { return unescape(encodeURIComponent(s)).length; } }
  // le LIBELLÉ d'un geste, sans ce qu'on a tapé ou lu (relecture sécurité v1, 25.09 ; le même algorithme que
  // XionSocialController::libelleBorne, qui le réapplique côté serveur) : le recorder (jOSTsoin) écrit un clic « input « <texte visé> »
  // @fenêtre », et le texte visé d'un champ, c'est sa VALEUR (un mot de passe tapé puis cliqué compris) → la balise et la fenêtre seules ;
  // une commande « dm <quelqu'un> <le message> » (jOSOp) → son verbe ; une navigation ou un départ → le chemin sans ?requête ni #fragment ;
  // une URL citée ailleurs perd sa requête. Pas de lookbehind dans ces regex (un vieux Safari refuserait tout le script).
  function libelleBorne(k, d) {
    d = String(d).replace(/[\x00-\x1F\x7F]/g, '');
    if (k === 'nav' || k === 'start') return d.split(/[?#]/)[0];
    if (k === 'click') {
      var m = /^[a-z][a-z0-9-]{0,19}/i.exec(d), tag = m ? m[0] : '', r = d.slice(tag.length);
      if (r.indexOf(' «') === 0) { var i = r.lastIndexOf(' »'); r = i >= 0 ? r.slice(i + 2) : ''; }
      return tag + (/^ @[^«»]{0,40}$/.test(r) ? r : '');
    }
    if (k === 'cmd') return d.trim().split(/\s+/)[0] || '';
    return d.replace(/((?:https?:)?\/\/[^\s?#]*|(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?\/[^\s?#]*)[?#]\S*/gi, '$1')
      .replace(/(^|[^A-Za-z0-9_.])(\/[^\s?#]*)[?#]\S*/g, '$1$2');
  }
  // un événement → sa forme bornée (tsoin v1 : t, k, d, xy, vw, vh, scene). JAMAIS la valeur saisie (val), une image (img), l'URL d'un
  // clip, un sélecteur (sel) ni le texte visé (txt), pas même recopiés dans le libellé ; une navigation garde son chemin, sans ?requête ni
  // #fragment (un code, un jeton).
  function evBorne(e) {
    if (!e || typeof e !== 'object' || e.noise) return null;
    var o = { t: Math.max(0, Math.round(num(e.t != null ? e.t : e.dt))), k: String(e.k || e.topic || e.kind || '•').slice(0, 40) };
    var d = e.d != null ? e.d : (e.label != null ? e.label : e.payload);
    if (d != null && d !== '') {
      if (typeof d !== 'string') { try { d = JSON.stringify(d); } catch (x) { d = ''; } }
      if (BORNE_SRV) d = libelleBorne(o.k, d);
      else if (o.k === 'nav') d = String(d).split(/[?#]/)[0];
      if (d) o.d = String(d).slice(0, 120);
    }
    if (Array.isArray(e.xy) && e.xy.length >= 2) o.xy = [Math.round(num(e.xy[0])), Math.round(num(e.xy[1]))];
    if (e.vw) o.vw = Math.round(num(e.vw));
    if (e.vh) o.vh = Math.round(num(e.vh));
    if (Array.isArray(e.scene) && e.scene.length) o.scene = e.scene.filter(function (w) { return w && typeof w === 'object'; }).slice(0, 8).map(function (w) {
      return { app: String(w.app || '').slice(0, 40), ti: String(w.ti || '').slice(0, 24), x: Math.round(num(w.x)), y: Math.round(num(w.y)), w: Math.round(num(w.w)), h: Math.round(num(w.h)) };
    });
    return o;
  }
  function echantillon(l, n) {   // le premier, le dernier, et des gestes régulièrement espacés entre les deux
    if (l.length <= n) return l;
    var out = [], pas = (l.length - 1) / (n - 1), i;
    for (i = 0; i < n; i++) out.push(l[Math.round(i * pas)]);
    return out;
  }
  function bornerEvents(src) {
    var l = (Array.isArray(src) ? src : []).map(evBorne).filter(Boolean), total = l.length;
    return { events: echantillon(l, EV_MAX), total: total };
  }
  function tenir(p) {   // ≤ 60 Ko : les scènes d'abord (on en garde une sur dix, puis aucune), puis la moitié des gestes, et encore
    if (!p.events || !p.events.length) return p;
    var taille = function () { return octets(JSON.stringify(p)); };
    if (taille() <= OCTETS_MAX) return p;
    p.events.forEach(function (e, i) { if (i % 10) delete e.scene; });
    if (taille() <= OCTETS_MAX) return p;
    p.events.forEach(function (e) { delete e.scene; });
    while (taille() > OCTETS_MAX && p.events.length > 2) p.events = echantillon(p.events, Math.max(2, Math.floor(p.events.length / 2)));
    return p;
  }
  function genre(s) {
    if (!s || typeof s !== 'object') return null;
    if (Array.isArray(s.actions) && (s.counts || /^ses-/.test(String(s.id || '')))) return 'session';
    if (typeof s.source === 'string' && typeof s.id === 'string' && /^b[0-9a-z]+-/.test(s.id) && ('nom' in s || 'cree' in s)) return 'branche';
    if (typeof s.source === 'string' && typeof s.id === 'string' && ('hash' in s || 'resume' in s || 'cle' in s) && !Array.isArray(s.events)) return 'frame';
    if (Array.isArray(s.events) || (s.ref && typeof s.ref === 'object')) return 'tsoin';
    return null;
  }
  function parId(id) {   // un id → l'objet LOCAL (jOSTsoin, jOSSession, jOSTsoinEngine), ou null
    id = String(id || ''); if (!id) return null;
    try { var t = window.jOSTsoin && window.jOSTsoin.get && window.jOSTsoin.get(id); if (t) return t; } catch (e) {}
    try { var s = window.jOSSession && typeof window.jOSSession.get === 'function' && window.jOSSession.get(id); if (s) return s; } catch (e2) {}
    try { var l = (window.jOSTsoinEngine && window.jOSTsoinEngine.list && window.jOSTsoinEngine.list()) || []; for (var i = 0; i < l.length; i++) if (l[i] && l[i].id === id) return l[i]; } catch (e3) {}
    return null;
  }
  function refPropre(type, id, source, t) {
    if (!REF_NOM[type] || !REF_ID.test(String(id || ''))) return null;
    var r = { type: type, id: String(id) };
    if (source != null && source !== '') { if (!REF_SRC.test(String(source))) return null; r.source = String(source); }
    if (t != null && isFinite(+t) && +t > 0) r.t = Math.round(+t);
    return r;
  }
  function quand(t) {
    var d = new Date(+t); if (!isFinite(d.getTime())) return '';
    var z = function (x) { return ('0' + x).slice(-2); };
    return z(d.getDate()) + '.' + z(d.getMonth() + 1) + ' ' + z(d.getHours()) + ':' + z(d.getMinutes());
  }
  // source → {kind:'tsoin', titre, payload} BORNÉ (ce qui partira), ou null si ce n'est pas un tsoin. Le résumé d'une frame de jOSTemps
  // n'est jamais recopié (il peut contenir le début de la valeur) : on dit sa source, sa clé et son heure.
  function tsoinDe(source) {
    var s = (typeof source === 'string') ? parId(source) : source, g = genre(s), p, b = null;
    if (!g) return null;
    if (g === 'session') {
      b = bornerEvents(s.actions);
      p = { label: String(s.label || 'une session').slice(0, 200), events: b.events, ref: refPropre('session', s.id) };
      if (SLUG.test(String(s.id || ''))) p.id = s.id;
      if (s.dur) p.dur = Math.min(DUR_MAX, Math.round(num(s.dur)));
      var at = num(s.t0) || Date.parse(s.at || '') || 0; if (at) p.at = at;
    } else if (g === 'frame') {
      var dat = (s.data && typeof s.data === 'object') ? s.data : null;   // une frame « a: » (moteur ambiant) porte le tsoin lui-même
      var v1 = (s.ref && s.ref.v1) ? parId(s.ref.v1) : null;             // une frame d'action = un tsoin v1 migré : on a ses gestes
      var evs = (dat && Array.isArray(dat.events)) ? dat.events : (v1 && Array.isArray(v1.events) ? v1.events : null);
      if (evs) b = bornerEvents(evs);
      p = { label: String((s.cle ? s.cle + ' · ' : '') + (s.source || 'la machine') + (s.t ? ' · ' + quand(s.t) : '')).slice(0, 200),
        ref: refPropre('frame', s.id, s.source, s.t), resume: String((s.source || '') + ' · ' + (s.cle || s.kind || 'état')).slice(0, 300) };
      if (b && b.events.length) p.events = b.events;
    } else if (g === 'branche') {
      p = { label: String('⑂ ' + (s.nom || 'une branche') + ' · ' + (s.source || '')).slice(0, 200), ref: refPropre('branche', s.id, s.source, s.cree),
        resume: String((s.source || '') + ' · ' + (+s.n || 0) + ' changement' + ((+s.n || 0) > 1 ? 's' : '')).slice(0, 300) };
    } else {   // un tsoin v1 (jOSTsoin, jOSTsoinEngine) — ou une enveloppe déjà bornée : on la re-borne (idempotent)
      b = bornerEvents(s.events);
      p = { label: String(s.label || s.name || s.titre || 'un tsoin').slice(0, 200) };
      if (b.events.length) p.events = b.events;
      var r = (s.ref && typeof s.ref === 'object') ? refPropre(s.ref.type, s.ref.id, s.ref.source, s.ref.t) : null;
      p.ref = r || refPropre('tsoin', s.id);
      if (SLUG.test(String(s.id || ''))) p.id = s.id;
      if (s.dur) p.dur = Math.min(DUR_MAX, Math.round(num(s.dur)));
      var at2 = typeof s.at === 'number' ? s.at : (Date.parse(s.at || '') || num(s.t)); if (at2 > 0) p.at = Math.round(at2);
      if (typeof s.resume === 'string' && s.resume) p.resume = s.resume.slice(0, 300);
      if (+s.total > b.total) b.total = Math.round(+s.total);
    }
    if (!p.ref) delete p.ref;
    if (!(p.events && p.events.length) && !p.ref) return null;
    tenir(p);
    if (b && p.events && b.total > p.events.length) p.total = Math.min(100000000, b.total);
    return { kind: 'tsoin', titre: p.label, payload: p };
  }
  // partagerTsoin(source, {degre, visibility, caption, title, zone, composer, toast}) : UN geste → une enveloppe kind tsoin, au degré X
  // (tes potes) par défaut. composer:true ouvre le composeur pré-rempli (choisir le degré, un mot) au lieu d'envoyer tout de suite.
  function partagerTsoin(source, opts) {
    opts = opts || {};
    if (!tsoinActif()) { var off = new Error('le partage des tsoins est coupé ici'); off.status = 404; return Promise.reject(off); }
    var t = null;
    try { t = tsoinDe(typeof source === 'function' ? source() : source); } catch (e) { t = null; }
    if (!t) { var x = new Error('rien à partager : il faut une session, une frame, une branche ou un tsoin'); x.status = 422; return Promise.reject(x); }
    var env = { kind: 'tsoin', title: opts.title || t.titre, caption: opts.caption || '', payload: t.payload, zone: opts.zone || '',
      degre: opts.degre || (opts.visibility ? '' : 'X'), visibility: opts.visibility || '' };
    if (opts.composer) return composer(env);
    return partager(env).then(function (post) {
      var d = degreInfo(degreDe(post));
      if (opts.toast !== false) { try { if (window.jOSb && window.jOSb.toast) window.jOSb.toast(document.body, '⧗ tsoin partagé' + (d ? ' · ' + d[0] + ' ' + d[2] : '') + ' ✓'); } catch (e) {} }
      return post;
    });
  }
  // un bouton tout fait « ⧗ partager à mes potes » pour la machine à tsoins, la carte mobile, le mode soirée (source = l'objet ou une
  // fonction qui le rend au moment du geste) ; opts = ceux de partagerTsoin + libelle, fait(err, post)
  function boutonTsoin(source, opts) {
    opts = opts || {};
    var libelle = opts.libelle || '⧗ partager à mes potes', b = el('button', 'ptg-b');
    b.type = 'button'; b.textContent = libelle;
    if (!tsoinActif()) { b.hidden = true; return b; }
    b.onclick = function () {
      b.disabled = true; b.textContent = '…';
      partagerTsoin(source, opts).then(function (post) {
        b.disabled = false; b.textContent = post ? '✓ partagé' : libelle;
        if (typeof opts.fait === 'function') { try { opts.fait(null, post); } catch (e) {} }
      }, function (e) {
        b.disabled = false; b.textContent = libelle;
        if (typeof opts.fait === 'function') { try { opts.fait(e, null); } catch (x) {} return; }
        try { if (window.jOSb && window.jOSb.toast) window.jOSb.toast(document.body, '✗ ' + ((e && e.message) || 'échec'), { bad: true }); } catch (x2) {}
      });
    };
    return b;
  }

  // ---- REJOUER : le lecteur ⧗, en LECTURE SEULE (il montre les gestes, les fenêtres et le pointeur ; il n'exécute rien) ----
  var LAB = { open: 'ouvre', snap: 'photo', clip: 'clip', theme: 'thème →', nav: 'va à', cmd: 'commande /', click: 'clic', saisie: 'saisie dans', touche: 'touche', son: 'son' };
  function labEv(e) { var k = String((e && e.k) || '•'), d = (e && e.d != null) ? String(e.d) : ''; if (k === 'start') return 'début'; if (k === 'stop') return 'fin'; return (LAB[k] || k) + (d ? (k === 'cmd' ? '' : ' ') + d : ''); }
  function secondes(t) { return (Math.max(0, num(t)) / 1000).toFixed(1).replace('.', ',') + ' s'; }
  var lec = null;
  function lecteurDom() {
    if (lec) return lec;
    var o = el('div'); o.id = 'ptg-lec'; o.hidden = true;
    o.innerHTML = '<div class="ptg" role="dialog" aria-label="Rejouer un tsoin"><div class="ptg__hd"><b data-l-titre>⧗</b><button type="button" class="ptg__x" data-l="x" aria-label="fermer">×</button></div>'
      + '<div data-l-corps></div><div class="ptg__hint">lecture seule : rien n\'est rejoué sur ton appareil (ni clic, ni saisie, ni commande)</div></div>';
    document.body.appendChild(o);
    lec = { el: o, fin: null };
    o.addEventListener('click', function (e) { if (e.target === o || (e.target.closest && e.target.closest('[data-l="x"]'))) fermerLecteur(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lec && !lec.el.hidden) fermerLecteur(); });
    return lec;
  }
  function fermerLecteur() {
    if (!lec) return;
    if (lec.fin) { try { lec.fin(); } catch (e) {} lec.fin = null; }
    lec.el.hidden = true; lec.el.querySelector('[data-l-corps]').innerHTML = '';
  }
  function ouvrirLecteur(titre) {   // → une boîte neuve dans la feuille (un écouteur par ouverture, rien ne s'empile)
    var L = lecteurDom();
    if (L.fin) { try { L.fin(); } catch (e) {} L.fin = null; }
    L.el.querySelector('[data-l-titre]').textContent = '⧗ ' + String(titre || 'un tsoin').slice(0, 120);
    var c = L.el.querySelector('[data-l-corps]'), box = el('div'); c.innerHTML = ''; c.appendChild(box);
    L.el.hidden = false;
    return { L: L, box: box };
  }
  function dessinerScene(ecran, ev, n) {
    var sc = null, avec = null, k, e = ev[n];
    for (k = n; k >= 0 && !sc; k--) if (ev[k] && Array.isArray(ev[k].scene) && ev[k].scene.length) { sc = ev[k].scene; avec = ev[k]; }
    var vw = num((avec && avec.vw) || e.vw), vh = num((avec && avec.vh) || e.vh);
    if (!vw || !vh) { (sc || []).forEach(function (w) { vw = Math.max(vw, num(w.x) + num(w.w)); vh = Math.max(vh, num(w.y) + num(w.h)); }); if (e.xy) { vw = Math.max(vw, num(e.xy[0])); vh = Math.max(vh, num(e.xy[1])); } }
    vw = vw || 1; vh = vh || 1;
    var pn = function (a, b) { return Math.max(0, Math.min(100, a / b * 100)); }, pc = function (x) { return x.toFixed(2) + '%'; };
    ecran.innerHTML = '';
    (sc || []).forEach(function (w) {   // une fenêtre qui déborde de l'écran d'origine est coupée au bord (jamais hors du lecteur)
      var r = document.createElement('i'), l = pn(num(w.x), vw), t = pn(num(w.y), vh);
      r.style.left = pc(l); r.style.top = pc(t); r.style.width = pc(Math.min(pn(num(w.w), vw), 100 - l)); r.style.height = pc(Math.min(pn(num(w.h), vh), 100 - t));
      r.textContent = w.ti || w.app || ''; ecran.appendChild(r);
    });
    if (e.xy && e.xy.length >= 2) { var pt = document.createElement('b'); pt.style.left = pc(pn(num(e.xy[0]), vw)); pt.style.top = pc(pn(num(e.xy[1]), vh)); ecran.appendChild(pt); }
    if (!sc) { var v = document.createElement('div'); v.className = 'ptg-lec__vide'; v.textContent = labEv(e); ecran.appendChild(v); }
  }
  function lecteur(p, opts) {
    opts = opts || {};
    // relecture sécurité v1 : le lecteur ne montre que des gestes BORNÉS (un tsoin posté avant, ou par un autre chemin, garde peut-être
    // val / txt / un libellé de clic avec la valeur d'un champ) — SOCIAL_TSOIN_BORNE=0 → tels quels, comme livré
    var brut = (Array.isArray(p.events) ? p.events : []).filter(function (e) { return e && typeof e === 'object'; }).slice(0, EV_MAX);
    var O = ouvrirLecteur(p.label || p.titre), box = O.box, ev = BORNE_SRV ? brut.map(evBorne).filter(Boolean) : brut;
    box.innerHTML = '<div class="ptg-lec__ecran" data-l-ecran></div><div class="ptg-lec__ev" data-l-ev></div><div class="ptg-lec__barre"><i data-l-barre></i></div>'
      + '<div class="ptg__row" data-l-cmd><button type="button" class="ptg__b" data-l="play">⏸ pause</button><button type="button" class="ptg__b" data-l="debut">⏮ début</button><button type="button" class="ptg__b" data-l="vite">×1</button></div>'
      + '<ol class="ptg-lec__liste" data-l-liste></ol>';
    var ecran = box.querySelector('[data-l-ecran]'), evEl = box.querySelector('[data-l-ev]'), barre = box.querySelector('[data-l-barre]'), liste = box.querySelector('[data-l-liste]');
    var i = -1, vitesse = 1, joue = !!ev.length, tm = 0, fin = ev.length ? num(ev[ev.length - 1].t) : 0;
    function arret() { if (tm) { clearTimeout(tm); tm = 0; } }
    O.L.fin = arret;
    if (!ev.length) {
      var vide = document.createElement('div'); vide.className = 'ptg-lec__vide'; vide.textContent = opts.vide || 'rien à rejouer'; ecran.appendChild(vide);
      box.querySelector('[data-l-cmd]').hidden = true;
      return { fermer: fermerLecteur, etat: function () { return { i: -1, joue: false, vitesse: 1, n: 0 }; } };
    }
    ev.forEach(function (e, n) { var li = document.createElement('li'), b = document.createElement('button'); b.type = 'button'; b.setAttribute('data-l-i', String(n)); b.textContent = secondes(e.t) + ' · ' + labEv(e); li.appendChild(b); liste.appendChild(li); });
    function montrer(n) {
      i = n; var e = ev[n];
      evEl.textContent = secondes(e.t) + ' · ' + labEv(e);
      barre.style.width = (fin > 0 ? Math.min(100, Math.round(num(e.t) / fin * 100)) : Math.round((n + 1) / ev.length * 100)) + '%';
      dessinerScene(ecran, ev, n);
      for (var k = 0; k < liste.children.length; k++) liste.children[k].className = k === n ? 'ici' : '';
    }
    function majBouton() { box.querySelector('[data-l="play"]').textContent = joue ? '⏸ pause' : '▶ lecture'; }
    function suivant() {   // UNE chaîne de setTimeout, rien d'autre ; un silence de plus de 2,5 s est raccourci
      tm = 0; if (!joue) return;
      if (i >= ev.length - 1) { joue = false; majBouton(); return; }
      var n = i + 1, gap = i < 0 ? 0 : Math.max(0, num(ev[n].t) - num(ev[i].t));
      tm = setTimeout(function () { tm = 0; montrer(n); suivant(); }, Math.max(120, Math.min(2500, gap) / vitesse));
    }
    box.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-l],[data-l-i]') : null; if (!t) return;
      if (t.hasAttribute('data-l-i')) { arret(); joue = false; majBouton(); montrer(+t.getAttribute('data-l-i')); return; }
      var a = t.getAttribute('data-l');
      if (a === 'play') { if (joue) { joue = false; arret(); } else { joue = true; if (i >= ev.length - 1) i = -1; suivant(); } majBouton(); }
      else if (a === 'debut') { arret(); joue = true; majBouton(); montrer(0); suivant(); }
      else if (a === 'vite') { vitesse = vitesse >= 4 ? 1 : vitesse * 2; t.textContent = '×' + vitesse; if (joue) { arret(); suivant(); } }
    });
    montrer(0); suivant();
    return { fermer: fermerLecteur, etat: function () { return { i: i, joue: joue, vitesse: vitesse, n: ev.length }; } };
  }
  // une frame ou une branche de jOSTemps : elle vit dans le boxion de son AUTEUR → jOSTemps.voir si on l'a ici (la page isolée de la
  // machine, rien n'écrit dans le réel), sinon on le dit
  function voirTemps(ref, p) {
    var O = ouvrirLecteur(p.label), box = O.box, h = null, fini = false;
    box.innerHTML = '<div class="ptg-lec__ev" data-l-ev>ouverture…</div><div class="ptg-lec__bulle" data-l-bulle></div>';
    var msg = box.querySelector('[data-l-ev]'), bulle = box.querySelector('[data-l-bulle]');
    O.L.fin = function () { fini = true; if (h) { try { h.unmount(); } catch (e) {} h = null; } };
    function rien(t) { if (fini) return; msg.textContent = t || 'cet instant vit dans le boxion de son auteur : lui seul peut l\'ouvrir pour l\'instant (le transport par le xion viendra)'; bulle.hidden = true; }
    var T = window.jOSTemps, src = String(ref.source || '');
    if (!T || T.coupe || typeof T.voir !== 'function' || !src) { rien(src ? 'la machine à tsoins n\'est pas là sur cette page (ou elle est coupée)' : ''); return { fermer: fermerLecteur }; }
    var cible = ref.type === 'frame'
      ? Promise.resolve(T.frame(ref.id)).then(function (f) { return f && f.id ? f.id : null; })
      : Promise.resolve(T.branches(src)).then(function (bs) {
        var br = (bs || []).filter(function (x) { return x && x.id === ref.id; })[0]; if (!br) return null;
        return Promise.resolve(T.frames(src, { branche: br.id, limite: 1 })).then(function (fs) { return (fs && fs.length) ? fs[fs.length - 1].id : (br.de || null); });
      });
    cible.then(function (fid) {
      if (fini) return;
      if (!fid) { rien(); return; }
      msg.textContent = ref.type === 'branche' ? '⑂ la branche, telle qu\'elle est chez toi' : '⧗ l\'instant, tel qu\'il était';
      h = T.voir(src, fid, bulle, {});
    }).catch(function () { rien(); });
    return { fermer: fermerLecteur };
  }
  // rejouer(post du fil | tsoin | source) : les gestes embarqués → le lecteur ; une frame / une branche → jOSTemps.voir ; une référence
  // à une session ou à un tsoin qu'on a sur cet appareil → ses gestes ; sinon le lecteur le dit
  function rejouer(x, opts) {
    if (!tsoinActif()) return null;
    var p = (x && x.schema && x.payload) ? x.payload : x;
    if (p && typeof p === 'object' && !Array.isArray(p.events) && !(p.ref && p.ref.type)) { var t = tsoinDe(p); p = t ? t.payload : null; }
    if (!p || typeof p !== 'object') return null;
    // (08.11) un tsoin DE PLOXION (scope « px-<id> », ex. un zoom de fractal-fractal) : c'est le ploxion qui le rejoue, pas le lecteur de gestes ;
    // le tsoin attend dans sessionStorage, le ploxion le prend en montant (kill-switch : localStorage xb:partage.tsoin-px=off → le lecteur)
    var pxs = /^px-([a-z0-9][a-z0-9-]{0,60})$/.exec(String(p.scope || ''));
    if (pxs && Array.isArray(p.events) && p.events.length && lsGet('xb:partage.tsoin-px') !== 'off') {
      try { sessionStorage.setItem('xb:tsoin.' + p.scope, JSON.stringify({ events: p.events, dur: p.dur || 0, label: p.label || "" })); window.location.href = '/px/' + pxs[1]; return { fermer: function () {} }; } catch (e) {}
    }
    if (Array.isArray(p.events) && p.events.length) return lecteur(p, opts);
    var ref = (p.ref && typeof p.ref === 'object') ? p.ref : {};
    if (ref.type === 'frame' || ref.type === 'branche') return voirTemps(ref, p);
    if (ref.type === 'session' || ref.type === 'tsoin') { var loc = parId(ref.id), tl = loc ? tsoinDe(loc) : null; if (tl && tl.payload.events) return lecteur(tl.payload, opts); }
    return lecteur(p, { vide: 'ce tsoin vit dans le boxion de son auteur : lui seul peut l\'ouvrir pour l\'instant (le transport par le xion viendra)' });
  }

  window.jOSPartage = {
    v: 1, KINDS: KINDS, VISIBILITES: VISIBILITES.map(function (v) { return v[0]; }), ETAPES: ETAPES, ICONES: ICONES,
    // social v1 : les degrés et le tsoin en un geste
    degres: function () { return { actif: degresActifs(), liste: DEGRES.map(function (d) { return { code: d[0], visibility: d[1], libelle: d[2], sens: d[3] }; }) }; },
    degreDe: degreDe, badgeDegre: badgeDegre, versDegre: versDegre, changerDegre: changerDegre,
    tsoinActif: tsoinActif, tsoinDe: tsoinDe, partagerTsoin: partagerTsoin, boutonTsoin: boutonTsoin, rejouer: rejouer, fermerLecteur: fermerLecteur,
    actif: actif, partager: partager, composer: composer, fermer: function () { fermer(null); }, get: get, developper: developper,
    corps: corps, pipeline: pipeline, esc: esc, safeUrl: safeUrl
  };
})();
;
