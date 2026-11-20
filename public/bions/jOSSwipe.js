/* bion jOSSwipe — servi seul pour ploxi0n (/px/bion-app/jOSSwipe.js) */
void 0;

;
(function () {
  "use strict";
  if (window.jOSSwipe) return;

  var THRESH = 88;   // px de déplacement au-delà duquel le swipe est validé
  var DEFAULTS = [
    { key: "pass", label: "✕", dir: "left",  color: "#f0506e" },
    { key: "like", label: "♥", dir: "right", color: "#32d296" },
    { key: "love", label: "★", dir: "up",    color: "#ffd15a" }
  ];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function boxed() { try { return window.jOSBoxion && jOSBoxion.authed && jOSBoxion.authed(); } catch (e) { return false; } }

  /* ============ persistance PARTAGÉE par ns (decks + collections lisent le MÊME store) ============
     - décisions COURANTES : localStorage "jsw:"+ns (map key->{verdict,note,ts}) + jOSBoxion(ns,key,dec,verdict)
     - HISTORIQUE temporel : localStorage "jsw:"+ns+":hist" (map key->[{id,verdict,ts,prev}]) + jOSBoxion(ns,"hist:"+key,arr,"hist")
       Le verdict courant = source de vérité ; l'historique garde l'ÉVOLUTION (chaque révision = un log horodaté). */
  function nsLSKey(ns) { return ns ? ("jsw:" + ns) : ""; }
  function nsHistLSKey(ns) { return ns ? ("jsw:" + ns + ":hist") : ""; }
  function loadDecMap(ns) {
    var k = nsLSKey(ns); if (!k) return {};
    try { var m = JSON.parse(localStorage.getItem(k) || "null"); return (m && typeof m === "object") ? m : {}; }
    catch (e) { return {}; }
  }
  function saveDecMap(ns, map) {
    var k = nsLSKey(ns); if (!k) return;
    try { localStorage.setItem(k, JSON.stringify(map)); } catch (e) {}
  }
  function loadHistMap(ns) {
    var k = nsHistLSKey(ns); if (!k) return {};
    try { var m = JSON.parse(localStorage.getItem(k) || "null"); return (m && typeof m === "object") ? m : {}; }
    catch (e) { return {}; }
  }
  function saveHistMap(ns, map) {
    var k = nsHistLSKey(ns); if (!k) return;
    try { localStorage.setItem(k, JSON.stringify(map)); } catch (e) {}
  }
  function storeLogHist(ns, key, verdictKey, prevVerdict) {
    var entry = { id: key, verdict: verdictKey, ts: Date.now(), prev: prevVerdict || null };
    var hmap = loadHistMap(ns);
    if (!hmap[key]) hmap[key] = [];
    hmap[key].push(entry);
    saveHistMap(ns, hmap);
    try { if (ns && boxed() && jOSBoxion.save) jOSBoxion.save(ns, "hist:" + key, hmap[key], "hist"); } catch (e) {}
    return entry;
  }
  function storeSetVerdict(ns, key, verdictKey, note) {
    var map = loadDecMap(ns);
    var prev = map[key] || null;
    var dec = { verdict: verdictKey, note: (note != null ? note : (prev && prev.note ? prev.note : "")), ts: Date.now() };
    map[key] = dec;
    saveDecMap(ns, map);
    try { if (ns && boxed() && jOSBoxion.save) jOSBoxion.save(ns, key, dec, verdictKey); } catch (e) {}
    storeLogHist(ns, key, verdictKey, prev ? prev.verdict : null);
    return dec;
  }

  /* ============ registre des vues VIVANTES par ns (sync deck <-> collection en temps réel) ============ */
  var LIVE = {};
  function subscribe(ns, obj) {
    if (!ns) return function () {};
    if (!LIVE[ns]) LIVE[ns] = [];
    LIVE[ns].push(obj);
    return function () { var a = LIVE[ns]; if (!a) return; var i = a.indexOf(obj); if (i >= 0) a.splice(i, 1); };
  }
  function notify(ns, except) {
    var a = LIVE[ns]; if (!a) return;
    for (var i = 0; i < a.length; i++) { if (a[i] === except) continue; try { a[i].refresh(); } catch (e) {} }
  }
  function reDeckNs(ns, key) {
    var a = LIVE[ns]; if (!a) return false;
    var ok = false, i;
    for (i = 0; i < a.length; i++) { if (a[i].reDeckKey) { try { if (a[i].reDeckKey(key)) ok = true; } catch (e) {} } }
    return ok;
  }
  function agoStr(ts) {
    if (!ts) return "";
    var s = Math.max(1, Math.round((Date.now() - ts) / 1000));
    if (s < 60) return "il y a " + s + " s";
    var m = Math.round(s / 60); if (m < 60) return "il y a " + m + " min";
    var h = Math.round(m / 60); if (h < 24) return "il y a " + h + " h";
    var d = Math.round(h / 24); if (d < 30) return "il y a " + d + " j";
    var mo = Math.round(d / 30); if (mo < 12) return "il y a " + mo + " mois";
    return "il y a " + Math.round(mo / 12) + " an";
  }

  function injectCSS() {
    if (document.getElementById("jsw-css")) return;
    var css = ""
      + ".jsw{display:flex;flex-direction:column;height:100%;box-sizing:border-box;position:relative;overflow:hidden;"
      + "background:var(--xr-bg,#0a0d16);color:var(--xr-fg,var(--xr-text,#e8ecf8));font-family:var(--xr-font-ui,ui-sans-serif,system-ui,sans-serif)}"
      + ".jsw *{box-sizing:border-box}"
      + ".jsw__head{flex:0 0 auto;padding:10px 13px 9px;border-bottom:1px solid var(--xr-line,rgba(150,160,200,.16))}"
      + ".jsw__titrow{display:flex;align-items:center;gap:8px}"
      + ".jsw__title{font-weight:800;font-size:1rem;display:flex;align-items:center;gap:6px}"
      + ".jsw__hint{font-size:.72rem;opacity:.6;margin-top:5px;line-height:1.3}"
      + ".jsw__prog{display:flex;align-items:center;gap:9px;margin-top:8px}"
      + ".jsw__bar{flex:1;height:6px;border-radius:6px;background:rgba(150,160,200,.16);overflow:hidden}"
      + ".jsw__barfill{height:100%;width:0;background:var(--xr-accent,#3fe0d0);transition:width .3s ease}"
      + ".jsw__progtxt{font-size:.7rem;opacity:.72;font-variant-numeric:tabular-nums;white-space:nowrap}"
      + ".jsw__deck{flex:1;min-height:0;position:relative;display:flex;align-items:center;justify-content:center;padding:14px}"
      + ".jsw__stack{position:relative;height:100%;width:auto;aspect-ratio:.82;max-width:100%;margin:auto}"
      + ".jsw__card{position:absolute;inset:0;border-radius:20px;background:var(--xr-card,#111a30);"
      + "border:1px solid var(--xr-line,rgba(150,160,200,.22));box-shadow:0 18px 44px rgba(0,0,0,.45);"
      + "display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;"
      + "will-change:transform;user-select:none;-webkit-user-select:none}"
      + ".jsw__card--top{cursor:grab;touch-action:none;z-index:5}"
      + ".jsw__card--top:active{cursor:grabbing}"
      + ".jsw__body{width:100%;flex:1 1 auto;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;text-align:center}"
      + ".jsw__body svg{max-width:100%;height:auto}"
      + ".jsw__body img{max-width:100%;height:auto}"
      + ".jsw__cardnote{flex:0 0 auto;width:100%;display:flex;flex-direction:column;align-items:center;gap:6px;margin-top:10px}"
      + ".jsw__notebtn{cursor:pointer;font-size:.68rem;padding:3px 10px;border-radius:14px;border:1px dashed var(--xr-line,rgba(150,160,200,.4));background:none;color:inherit;opacity:.8}"
      + ".jsw__notebtn.has{border-style:solid;opacity:1}"
      + ".jsw__noteedit{width:100%;margin-top:6px;display:none;gap:6px;flex-direction:column}"
      + ".jsw__noteedit.on{display:flex}"
      + ".jsw__noteedit textarea{width:100%;min-height:48px;resize:vertical;border-radius:9px;padding:7px 9px;font:inherit;font-size:.78rem;background:rgba(0,0,0,.25);color:inherit;border:1px solid var(--xr-line,rgba(150,160,200,.3))}"
      + ".jsw__noterow{display:flex;gap:6px;justify-content:flex-end}"
      + ".jsw__noterow button{cursor:pointer;font-size:.72rem;padding:4px 12px;border-radius:9px;border:0;font-weight:700}"
      + ".jsw__notesave{background:var(--xr-accent,#3fe0d0);color:#06121a}"
      + ".jsw__notecancel{background:rgba(150,160,200,.18);color:inherit}"
      + ".jsw__stamp{position:absolute;top:22px;font-weight:900;font-size:1.5rem;letter-spacing:.06em;padding:5px 14px;border:4px solid;border-radius:12px;opacity:0;pointer-events:none;text-transform:uppercase}"
      + ".jsw__stamp--right{right:18px;transform:rotate(14deg)}"
      + ".jsw__stamp--left{left:18px;transform:rotate(-14deg)}"
      + ".jsw__stamp--up{left:50%;top:14px;transform:translateX(-50%)}"
      + ".jsw__acts{flex:0 0 auto;display:flex;align-items:center;justify-content:center;gap:14px;padding:10px 12px calc(12px + env(safe-area-inset-bottom))}"
      + ".jsw__act{cursor:pointer;border-radius:50%;border:2px solid;background:var(--xr-card,#111a30);display:flex;align-items:center;justify-content:center;font-size:1.15rem;line-height:1;box-shadow:0 6px 16px rgba(0,0,0,.35);color:inherit}"
      + ".jsw__act:active{transform:scale(.92)}"
      + ".jsw__act[disabled]{opacity:.32;cursor:default}"
      + ".jsw__act--sm{width:44px;height:44px;font-size:1rem}"
      + ".jsw__act--lg{width:60px;height:60px;font-size:1.5rem}"
      + ".jsw__act--undo{border-color:#c9a94a;color:#e7c766}"
      + ".jsw__empty{text-align:center;opacity:.75;font-size:.9rem;padding:26px;line-height:1.5;max-width:320px}"
      + ".jsw__empty b{color:var(--xr-accent,#8fe)}"
      + "@media (max-width:520px){.jsw__stack{width:88vw}.jsw__act--lg{width:56px;height:56px}}"
      /* ---- VUE COLLECTION (grille des jugés, révisable) ---- */
      + ".jswc{display:flex;flex-direction:column;height:100%;box-sizing:border-box;background:var(--xr-bg,#0a0d16);"
      + "color:var(--xr-fg,var(--xr-text,#e8ecf8));font-family:var(--xr-font-ui,ui-sans-serif,system-ui,sans-serif)}"
      + ".jswc *{box-sizing:border-box}"
      + ".jswc__bar{flex:0 0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:9px 12px;border-bottom:1px solid var(--xr-line,rgba(150,160,200,.16))}"
      + ".jswc__f,.jswc__sort{cursor:pointer;font:600 .74rem inherit;padding:5px 11px;border-radius:12px;border:1px solid var(--xr-line,rgba(150,160,200,.3));background:none;color:inherit;opacity:.68}"
      + ".jswc__f[data-on],.jswc__sort[data-on]{opacity:1;border-color:var(--xr-accent,#3fe0d0);color:var(--xr-accent,#8fe)}"
      + ".jswc__sp{flex:1}"
      + ".jswc__grid{flex:1;min-height:0;overflow:auto;padding:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:11px;align-content:start}"
      + ".jswc__tile{border:1px solid var(--xr-line,rgba(150,160,200,.2));border-radius:13px;padding:10px;background:var(--xr-card,#111a30);display:flex;flex-direction:column;gap:7px}"
      + ".jswc__prev{height:104px;display:flex;align-items:center;justify-content:center;overflow:hidden;text-align:center}"
      + ".jswc__prev svg{max-width:100%;max-height:104px;height:auto}"
      + ".jswc__prev img{max-width:100%;max-height:104px;height:auto}"
      + ".jswc__ph{font-family:ui-monospace,monospace;font-size:.66rem;opacity:.6;word-break:break-all;padding:6px}"
      + ".jswc__meta{display:flex;align-items:center;gap:7px}"
      + ".jswc__verdict{cursor:pointer;flex:0 0 auto;width:30px;height:30px;border-radius:50%;border:2px solid;background:none;color:inherit;font-size:.95rem;line-height:1;display:flex;align-items:center;justify-content:center}"
      + ".jswc__verdict:active{transform:scale(.9)}"
      + ".jswc__when{flex:1;font-size:.64rem;opacity:.68;line-height:1.2}"
      + ".jswc__redeck{cursor:pointer;flex:0 0 auto;width:28px;height:28px;border-radius:8px;border:1px solid var(--xr-line,rgba(150,160,200,.35));background:none;color:inherit;font-size:.85rem;opacity:.8}"
      + ".jswc__redeck:hover{border-color:var(--xr-accent,#3fe0d0);opacity:1}"
      + ".jswc__empty{grid-column:1/-1;text-align:center;opacity:.6;font-size:.85rem;padding:26px}";
    var st = document.createElement("style");
    st.id = "jsw-css";
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }

  function mount(container, opts) {
    injectCSS();
    opts = opts || {};
    var alive = true;
    var items = (opts.items && opts.items.length) ? opts.items.slice() : [];
    var verdicts = (opts.verdicts && opts.verdicts.length) ? opts.verdicts : DEFAULTS;
    var ns = opts.persistNs || "";
    var LSKEY = ns ? ("jsw:" + ns) : "";
    var showNote = !!opts.note;
    var doneFired = false;

    // maps verdict par clé et par direction
    var vByKey = {}, vByDir = {}, i;
    for (i = 0; i < verdicts.length; i++) {
      vByKey[verdicts[i].key] = verdicts[i];
      vByDir[verdicts[i].dir] = verdicts[i];
    }

    function keyOf(item) {
      if (opts.persistKeyOf) { try { return String(opts.persistKeyOf(item)); } catch (e) {} }
      return "swipe:" + item.id;
    }
    var itemByKey = {}, keyById = {};
    for (i = 0; i < items.length; i++) { var _k = keyOf(items[i]); itemByKey[_k] = items[i]; keyById[items[i].id] = _k; }
    function keyForId(id) { return keyById[id] != null ? keyById[id] : ("swipe:" + id); }
    var forceShow = {};   // clés re-mises dans le deck via reDeck() malgré un verdict existant
    var liveObj = null;   // entrée du registre LIVE (assignée avant le return)

    // decisions[key] = { verdict, note, ts }
    var decisions = {};
    var queue = [];   // items non-vus, dans l'ordre
    var pos = 0;      // index carte du dessus
    var history = []; // pile undo : { key, prev|null }
    var animating = false;
    var drag = null;

    /* ---------------- persistance ---------------- */
    function loadLocal() {
      if (!LSKEY) return {};
      try { var m = JSON.parse(localStorage.getItem(LSKEY) || "null"); return (m && typeof m === "object") ? m : {}; }
      catch (e) { return {}; }
    }
    function saveLocal() { if (!LSKEY) return; try { localStorage.setItem(LSKEY, JSON.stringify(decisions)); } catch (e) {} }
    function persist(key, dec) {
      saveLocal();
      if (!ns) return;
      if (!dec) { try { if (boxed() && jOSBoxion.del) jOSBoxion.del(ns, key); } catch (e) {} return; }
      try { if (boxed() && jOSBoxion.save) jOSBoxion.save(ns, key, dec, dec.verdict); } catch (e) {}
    }

    /* ---------------- deck / comptes ---------------- */
    function seen(key) { if (forceShow[key]) return false; var d = decisions[key]; return !!(d && d.verdict); }
    function isPositive(verdictKey) { var v = vByKey[verdictKey]; return !!(v && v.dir !== "left"); }
    function rebuildQueue() {
      queue = [];
      for (var j = 0; j < items.length; j++) if (!seen(keyOf(items[j]))) queue.push(items[j]);
      pos = 0;
    }
    function counts() {
      var vus = 0, aimes = 0, k;
      for (k in decisions) if (decisions.hasOwnProperty(k) && decisions[k].verdict) {
        vus++; if (isPositive(decisions[k].verdict)) aimes++;
      }
      return { vus: vus, aimes: aimes, total: items.length };
    }
    function resultsMap() {
      var out = {}, k;
      for (k in decisions) if (decisions.hasOwnProperty(k) && decisions[k].verdict) {
        var it = itemByKey[k];
        if (it) out[it.id] = decisions[k].verdict;
      }
      return out;
    }

    /* ---------------- DOM squelette ---------------- */
    var actsHtml = '<button class="jsw__act jsw__act--sm jsw__act--undo" data-a="undo" title="Annuler">↩</button>';
    // ordre visuel : left (gros), up (petit), right (gros), autres (petit)
    var order = [];
    if (vByDir.left) order.push(vByDir.left);
    if (vByDir.up) order.push(vByDir.up);
    if (vByDir.right) order.push(vByDir.right);
    for (i = 0; i < verdicts.length; i++) if (order.indexOf(verdicts[i]) < 0) order.push(verdicts[i]);
    for (i = 0; i < order.length; i++) {
      var v = order[i];
      var big = (v.dir === "left" || v.dir === "right");
      actsHtml += '<button class="jsw__act ' + (big ? "jsw__act--lg" : "jsw__act--sm") + '" data-decide="' + esc(v.key) + '"'
        + ' title="' + esc(v.key) + '" style="border-color:' + esc(v.color) + ';color:' + esc(v.color) + '">' + esc(v.label) + "</button>";
    }

    container.innerHTML =
      '<div class="jsw">' +
      '  <div class="jsw__head">' +
      '    <div class="jsw__titrow"><span class="jsw__title">' + esc(opts.title || "🃏 Swipe") + "</span></div>" +
      (opts.hint ? '    <div class="jsw__hint">' + esc(opts.hint) + "</div>" : "") +
      '    <div class="jsw__prog"><div class="jsw__bar"><div class="jsw__barfill" data-fill></div></div><span class="jsw__progtxt" data-prog></span></div>' +
      "  </div>" +
      '  <div class="jsw__deck" data-deck></div>' +
      '  <div class="jsw__acts" data-acts>' + actsHtml + "</div>" +
      "</div>";

    var root = container.querySelector(".jsw");
    var deckEl = root.querySelector("[data-deck]");
    var actsEl = root.querySelector("[data-acts]");
    var fillEl = root.querySelector("[data-fill]");
    var progEl = root.querySelector("[data-prog]");

    /* ---------------- rendu ---------------- */
    function stampsHtml() {
      var h = "";
      for (var j = 0; j < verdicts.length; j++) {
        var v = verdicts[j];
        h += '<div class="jsw__stamp jsw__stamp--' + v.dir + '" data-stamp="' + esc(v.key) + '"'
          + ' style="color:' + esc(v.color) + ';border-color:' + esc(v.color) + '">' + esc(v.label) + "</div>";
      }
      return h;
    }
    function noteHtml(item) {
      if (!showNote) return "";
      var d = decisions[keyOf(item)];
      var has = d && d.note ? " has" : "";
      return '<div class="jsw__cardnote">' +
        '<button class="jsw__notebtn' + has + '" data-note>📝 ' + (d && d.note ? "note ✓" : "note") + "</button>" +
        '<div class="jsw__noteedit" data-noteedit>' +
        '<textarea data-notetext placeholder="une note…">' + esc(d && d.note ? d.note : "") + "</textarea>" +
        '<div class="jsw__noterow"><button class="jsw__notecancel" data-notecancel>annuler</button><button class="jsw__notesave" data-notesave>garder</button></div>' +
        "</div></div>";
    }
    function fillBody(cardEl, item) {
      var body = cardEl.querySelector("[data-body]");
      if (!body) return;
      if (item.render) { try { item.render(body); return; } catch (e) {} }
      body.innerHTML = item.html != null ? item.html : "";
    }
    function updateProgress() {
      var c = counts();
      var pct = c.total ? Math.round(c.vus / c.total * 100) : 0;
      if (fillEl) fillEl.style.width = pct + "%";
      if (progEl) progEl.textContent = c.vus + " / " + c.total + " · " + c.aimes + " aimé" + (c.aimes > 1 ? "s" : "");
    }
    function setActs(enabled) {
      var undo = actsEl.querySelector('[data-a="undo"]');
      if (undo) undo.disabled = !history.length;
      var main = actsEl.querySelectorAll("[data-decide]");
      for (var j = 0; j < main.length; j++) main[j].disabled = !enabled;
    }
    function renderDeck() {
      if (!items.length) {
        deckEl.innerHTML = '<div class="jsw__empty">Rien à balader.</div>';
        setActs(false); updateProgress(); return;
      }
      if (pos >= queue.length) {
        var c = counts();
        deckEl.innerHTML = '<div class="jsw__empty">🎉 Tout parcouru — <b>' + c.total + "</b> carte" + (c.total > 1 ? "s" : "") +
          ".<br>" + c.aimes + " aimé" + (c.aimes > 1 ? "s" : "") + ".</div>";
        setActs(false); updateProgress();
        if (!doneFired) { doneFired = true; try { if (opts.onDone) opts.onDone(resultsMap()); } catch (e) {} }
        return;
      }
      doneFired = false;
      var html = '<div class="jsw__stack" data-stack>';
      var depth = Math.min(3, queue.length - pos);
      for (var j = depth - 1; j >= 0; j--) {
        var isTop = (j === 0);
        var scale = 1 - j * 0.05, ty = j * 12;
        var cls = "jsw__card" + (isTop ? " jsw__card--top" : "");
        var stl = isTop ? "" : ' style="transform:translateY(' + ty + "px) scale(" + scale + ");opacity:" + (1 - j * 0.12) + '"';
        html += '<div class="' + cls + '" data-card="' + (isTop ? "top" : j) + '"' + stl + ">" +
          (isTop ? stampsHtml() : "") +
          '<div class="jsw__body" data-body></div>' +
          (isTop ? noteHtml(queue[pos]) : "") +
          "</div>";
      }
      html += "</div>";
      deckEl.innerHTML = html;
      // remplir les corps
      var cards = deckEl.querySelectorAll("[data-card]");
      for (var m = 0; m < cards.length; m++) {
        var attr = cards[m].getAttribute("data-card");
        var idx = attr === "top" ? 0 : parseInt(attr, 10);
        var it = queue[pos + idx];
        if (it) fillBody(cards[m], it);
      }
      setActs(true);
      bindTopCard();
      updateProgress();
    }

    /* ---------------- note ---------------- */
    function setNote(key, txt) {
      var d = decisions[key];
      if (!d) { d = { verdict: "", note: "", ts: Date.now() }; decisions[key] = d; }
      d.note = txt || ""; d.ts = Date.now();
      if (d.verdict) persist(key, d); else saveLocal();
    }
    function bindTopCard() {
      var cardEl = deckEl.querySelector('[data-card="top"]');
      if (!cardEl) return;
      var noteBtn = cardEl.querySelector("[data-note]");
      var noteEdit = cardEl.querySelector("[data-noteedit]");
      if (noteBtn && noteEdit) {
        noteBtn.addEventListener("click", function (e) {
          e.stopPropagation(); noteEdit.classList.toggle("on");
          var ta = noteEdit.querySelector("[data-notetext]");
          if (ta && noteEdit.classList.contains("on")) ta.focus();
        });
        var cancel = noteEdit.querySelector("[data-notecancel]");
        var save = noteEdit.querySelector("[data-notesave]");
        if (cancel) cancel.addEventListener("click", function (e) { e.stopPropagation(); noteEdit.classList.remove("on"); });
        if (save) save.addEventListener("click", function (e) {
          e.stopPropagation();
          var ta = noteEdit.querySelector("[data-notetext]");
          var val = ta ? ta.value : "";
          setNote(keyOf(queue[pos]), val);
          noteEdit.classList.remove("on");
          noteBtn.className = "jsw__notebtn" + (val ? " has" : "");
          noteBtn.textContent = "📝 " + (val ? "note ✓" : "note");
        });
      }
      cardEl.addEventListener("pointerdown", onDown);
    }

    /* ---------------- geste (pointer) ---------------- */
    function onDown(e) {
      if (animating || drag) return;
      if (e.target && e.target.closest && e.target.closest("[data-noteedit],[data-note]")) return;
      var cardEl = e.currentTarget;
      drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, dx: 0, dy: 0, cardEl: cardEl };
      try { cardEl.setPointerCapture(e.pointerId); } catch (err) {}
      cardEl.style.transition = "none";
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    }
    function stampEl(cardEl, key) { return cardEl.querySelector('[data-stamp="' + key + '"]'); }
    function onMove(e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dx = e.clientX - drag.sx;
      drag.dy = e.clientY - drag.sy;
      var rot = drag.dx / 14;
      drag.cardEl.style.transform = "translate(" + drag.dx + "px," + drag.dy + "px) rotate(" + rot + "deg)";
      var upBias = (vByDir.up && -drag.dy > Math.abs(drag.dx) * 1.1 && drag.dy < 0);
      var up = vByDir.up ? stampEl(drag.cardEl, vByDir.up.key) : null;
      var rt = vByDir.right ? stampEl(drag.cardEl, vByDir.right.key) : null;
      var lf = vByDir.left ? stampEl(drag.cardEl, vByDir.left.key) : null;
      if (up) up.style.opacity = upBias ? Math.min(1, -drag.dy / THRESH) : 0;
      if (rt) rt.style.opacity = (!upBias && drag.dx > 0) ? Math.min(1, drag.dx / THRESH) : 0;
      if (lf) lf.style.opacity = (!upBias && drag.dx < 0) ? Math.min(1, -drag.dx / THRESH) : 0;
    }
    function onUp(e) {
      if (!drag || e.pointerId !== drag.id) return;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      var d = drag, dx = d.dx, dy = d.dy; drag = null;
      var upBias = (vByDir.up && -dy > Math.abs(dx) * 1.1 && dy < 0);
      if (upBias && -dy > THRESH) { fling(vByDir.up.key, d.cardEl); return; }
      if (vByDir.right && dx > THRESH) { fling(vByDir.right.key, d.cardEl); return; }
      if (vByDir.left && dx < -THRESH) { fling(vByDir.left.key, d.cardEl); return; }
      d.cardEl.style.transition = "transform .28s cubic-bezier(.22,1,.36,1)";
      d.cardEl.style.transform = "";
      for (var j = 0; j < verdicts.length; j++) { var s = stampEl(d.cardEl, verdicts[j].key); if (s) s.style.opacity = 0; }
    }

    /* ---------------- valider / envoler ---------------- */
    function fling(verdictKey, cardEl) {
      if (animating) return;
      var v = vByKey[verdictKey];
      if (!v) return;
      animating = true;
      cardEl = cardEl || deckEl.querySelector('[data-card="top"]');
      var item = queue[pos];
      if (!cardEl || !item) { animating = false; return; }
      var s = stampEl(cardEl, verdictKey);
      if (s) s.style.opacity = 1;
      var W = (root.clientWidth || 400) + 240;
      var H = (root.clientHeight || 500) + 240;
      var tx = v.dir === "right" ? W : v.dir === "left" ? -W : 0;
      var ty = v.dir === "up" ? -H : 40;
      var rot = v.dir === "right" ? 22 : v.dir === "left" ? -22 : 0;
      cardEl.style.transition = "transform .34s ease-in, opacity .34s ease-in";
      cardEl.style.transform = "translate(" + tx + "px," + ty + "px) rotate(" + rot + "deg)";
      cardEl.style.opacity = "0";
      recordDecision(keyOf(item), verdictKey, item);
      setTimeout(function () {
        if (!alive) return;
        pos++; animating = false; renderDeck();
      }, 340);
    }
    function decide(verdictKey) {
      if (animating) return;
      if (pos >= queue.length) return;
      fling(verdictKey, null);
    }
    function recordDecision(key, verdictKey, item) {
      var prev = decisions[key] || null;
      history.push({ key: key, prev: prev ? { verdict: prev.verdict, note: prev.note, ts: prev.ts } : null });
      var note = prev && prev.note ? prev.note : "";
      var dec = { verdict: verdictKey, note: note, ts: Date.now() };
      decisions[key] = dec;
      if (forceShow[key]) delete forceShow[key];
      persist(key, dec);
      storeLogHist(ns, key, verdictKey, prev ? prev.verdict : null);
      try { if (opts.onVerdict) opts.onVerdict(item, verdictKey, note); } catch (e) {}
      notify(ns, liveObj);
    }
    /* révise le verdict d'un item ARBITRAIRE (pas forcément la carte du dessus) — depuis la collection/API */
    function deckSetVerdict(key, verdictKey) {
      if (!vByKey[verdictKey]) return false;
      var prev = decisions[key] || null;
      var dec = { verdict: verdictKey, note: prev && prev.note ? prev.note : "", ts: Date.now() };
      decisions[key] = dec;
      persist(key, dec); saveLocal();
      storeLogHist(ns, key, verdictKey, prev ? prev.verdict : null);
      updateProgress();
      if (!animating && !drag && pos >= queue.length) renderDeck();
      notify(ns, liveObj);
      return true;
    }
    /* renvoie un item EN TÊTE du deck pour le rejuger (garde son verdict jusqu'au re-swipe) */
    function reDeck(key) {
      if (!itemByKey[key]) return false;
      forceShow[key] = 1;
      rebuildQueue();
      for (var m = 0; m < queue.length; m++) { if (keyOf(queue[m]) === key) { pos = m; break; } }
      renderDeck();
      return true;
    }

    function undo() {
      if (animating || !history.length) return;
      var h = history.pop();
      if (h.prev) { decisions[h.key] = { verdict: h.prev.verdict, note: h.prev.note, ts: h.prev.ts }; persist(h.key, decisions[h.key]); }
      else { delete decisions[h.key]; persist(h.key, null); }
      var newQ = [];
      for (var j = 0; j < items.length; j++) if (!seen(keyOf(items[j]))) newQ.push(items[j]);
      queue = newQ; pos = 0;
      for (var m = 0; m < queue.length; m++) { if (keyOf(queue[m]) === h.key) { pos = m; break; } }
      renderDeck();
    }
    function next() {
      if (animating) return;
      if (pos < queue.length) { pos++; renderDeck(); }
    }

    /* ---------------- events ---------------- */
    function onActClick(e) {
      var b = e.target && e.target.closest ? e.target.closest("[data-a],[data-decide]") : null;
      if (!b) return;
      if (b.getAttribute("data-a") === "undo") { undo(); return; }
      var dk = b.getAttribute("data-decide");
      if (dk) decide(dk);
    }
    function onKey(e) {
      var ae = document.activeElement;
      if (ae && (ae.tagName === "TEXTAREA" || ae.tagName === "INPUT")) return;
      if (e.key === "ArrowRight" && vByDir.right) { e.preventDefault(); decide(vByDir.right.key); }
      else if (e.key === "ArrowLeft" && vByDir.left) { e.preventDefault(); decide(vByDir.left.key); }
      else if (e.key === "ArrowUp" && vByDir.up) { e.preventDefault(); decide(vByDir.up.key); }
      else if (e.key === "Backspace" || e.key === "z" || e.key === "Z") { e.preventDefault(); undo(); }
    }
    actsEl.addEventListener("click", onActClick);
    document.addEventListener("keydown", onKey);

    /* ---------------- boot + reprise ---------------- */
    function applyDecisions(map) {
      decisions = {};
      if (!map) return;
      for (var k in map) if (map.hasOwnProperty(k)) {
        var d = map[k];
        if (d && (d.verdict || d.note)) decisions[k] = { verdict: d.verdict || "", note: d.note || "", ts: d.ts || 0 };
      }
    }
    function start() { if (!alive) return; rebuildQueue(); renderDeck(); }

    applyDecisions(loadLocal());
    if (ns && boxed() && jOSBoxion.list) {
      jOSBoxion.list(ns).then(function (list) {
        if (!alive) return;
        if (list && list.length) {
          for (var j = 0; j < list.length; j++) {
            var it = list[j];
            if (!it.key || !vByKey[it.name]) continue;
            var ex = decisions[it.key] || { note: "" };
            decisions[it.key] = { verdict: it.name, note: ex.note || "", ts: it.savedAt || ex.ts || 0 };
          }
          saveLocal();
        }
        start();
      })["catch"](function () { start(); });
    } else {
      start();
    }

    /* ---- API vivante : révision + historique ---- */
    function apiSetVerdict(id, verdictKey) { return deckSetVerdict(keyForId(id), verdictKey); }
    function apiReDeck(id) { return reDeck(keyForId(id)); }
    function apiHistory(id) {
      var h = loadHistMap(ns);
      if (id == null) return h;
      return h[keyForId(id)] || [];
    }

    // s'inscrire au registre : une collection qui révise un verdict rafraîchit ce deck (et inversement)
    liveObj = {
      ns: ns,
      refresh: function () {
        applyDecisions(loadLocal());
        updateProgress();
        if (!animating && !drag && pos >= queue.length) renderDeck();
      },
      reDeckKey: reDeck,
      setVerdict: apiSetVerdict,
      reDeck: apiReDeck,
      history: apiHistory
    };
    var unsub = subscribe(ns, liveObj);

    return {
      destroy: function () {
        alive = false;
        try { unsub(); } catch (e) {}
        try { window.removeEventListener("pointermove", onMove); } catch (e) {}
        try { window.removeEventListener("pointerup", onUp); } catch (e) {}
        try { window.removeEventListener("pointercancel", onUp); } catch (e) {}
        try { document.removeEventListener("keydown", onKey); } catch (e) {}
        try { actsEl.removeEventListener("click", onActClick); } catch (e) {}
        container.innerHTML = "";
      },
      next: next,
      undo: undo,
      results: resultsMap,
      setVerdict: apiSetVerdict,
      reDeck: apiReDeck,
      history: apiHistory
    };
  }

  /* ================= VUE COLLECTION : grille de tout ce qui a été jugé, filtrable/triable, RÉVISABLE ================= */
  function collection(container, opts) {
    injectCSS();
    if (container && !container.nodeType) { opts = container; container = null; }
    opts = opts || {};
    container = container || opts.container;
    if (!container) return { destroy: function () {} };

    var alive = true;
    var ns = opts.persistNs || "";
    var verdicts = (opts.verdicts && opts.verdicts.length) ? opts.verdicts : DEFAULTS;
    var vByKey = {}, order = [], i;
    for (i = 0; i < verdicts.length; i++) { vByKey[verdicts[i].key] = verdicts[i]; order.push(verdicts[i].key); }
    var items = (opts.items && opts.items.length) ? opts.items.slice() : [];
    var renderItem = opts.renderItem || null;

    function keyOf(item) {
      if (opts.persistKeyOf) { try { return String(opts.persistKeyOf(item)); } catch (e) {} }
      return "swipe:" + item.id;
    }
    var itemByKey = {}, idByKey = {}, keyById = {};
    for (i = 0; i < items.length; i++) { var kk = keyOf(items[i]); itemByKey[kk] = items[i]; idByKey[kk] = items[i].id; keyById[items[i].id] = kk; }
    function keyForId(id) { return keyById[id] != null ? keyById[id] : ("swipe:" + id); }

    var filter = "all";    // "all" | <verdictKey> | "none"
    var sort = "recent";   // "recent" | "verdict"
    var decMap = {};

    container.innerHTML =
      '<div class="jswc">' +
      '  <div class="jswc__bar" data-bar></div>' +
      '  <div class="jswc__grid" data-grid></div>' +
      "</div>";
    var root = container.querySelector(".jswc");
    var barEl = root.querySelector("[data-bar]");
    var gridEl = root.querySelector("[data-grid]");

    function verb(vk) {
      var v = vByKey[vk]; if (!v) return "jugé";
      if (v.dir === "right") return "aimé";
      if (v.dir === "up") return "adoré";
      if (v.dir === "left") return "écarté";
      return "jugé";
    }
    function previewInto(el, item, key) {
      if (!el) return;
      if (item && item.render) { try { item.render(el); return; } catch (e) {} }
      if (item && item.html != null) { el.innerHTML = item.html; return; }
      if (renderItem) {
        try {
          var r = renderItem(item ? item.id : (idByKey[key] || key));
          if (r) { if (typeof r === "string") el.innerHTML = r; else el.appendChild(r); return; }
        } catch (e) {}
      }
      el.innerHTML = '<div class="jswc__ph">' + esc((item && item.id) || key) + "</div>";
    }

    function loadAll(cb) {
      decMap = loadDecMap(ns);
      if (ns && boxed() && jOSBoxion.list) {
        jOSBoxion.list(ns).then(function (rows) {
          var j;
          for (j = 0; j < (rows || []).length; j++) {
            var r = rows[j];
            if (!r.key || !r.name) continue;
            if (r.key.indexOf("hist:") === 0) continue;
            if (!vByKey[r.name]) continue;
            var ex = decMap[r.key] || { note: "" };
            decMap[r.key] = { verdict: r.name, note: ex.note || "", ts: r.savedAt || ex.ts || 0 };
          }
          cb();
        })["catch"](function () { cb(); });
      } else { cb(); }
    }

    function fbtn(f, label) { return '<button class="jswc__f" data-f="' + esc(f) + '"' + (filter === f ? " data-on" : "") + ">" + esc(label) + "</button>"; }
    function renderBar() {
      var h = fbtn("all", "tout"), j;
      for (j = 0; j < verdicts.length; j++) h += fbtn(verdicts[j].key, verdicts[j].label);
      if (items.length) h += fbtn("none", "non jugés");
      h += '<span class="jswc__sp"></span>';
      h += '<button class="jswc__sort" data-sort="recent"' + (sort === "recent" ? " data-on" : "") + ">récent</button>";
      h += '<button class="jswc__sort" data-sort="verdict"' + (sort === "verdict" ? " data-on" : "") + ">verdict</button>";
      barEl.innerHTML = h;
    }

    function renderGrid() {
      var list = [], j, k;
      if (filter === "none") {
        for (j = 0; j < items.length; j++) { var ck = keyOf(items[j]); var dn = decMap[ck]; if (!dn || !dn.verdict) list.push({ key: ck, dec: null }); }
      } else {
        for (k in decMap) {
          if (!decMap.hasOwnProperty(k)) continue;
          var d = decMap[k];
          if (!d || !d.verdict) continue;
          if (filter !== "all" && d.verdict !== filter) continue;
          list.push({ key: k, dec: d });
        }
        list.sort(function (a, b) {
          if (sort === "verdict") { var oa = order.indexOf(a.dec.verdict), ob = order.indexOf(b.dec.verdict); if (oa !== ob) return oa - ob; }
          return (b.dec ? b.dec.ts : 0) - (a.dec ? a.dec.ts : 0);
        });
      }
      if (!list.length) { gridEl.innerHTML = '<div class="jswc__empty">Rien ici.</div>'; return; }
      var html = "";
      for (j = 0; j < list.length; j++) {
        var e = list[j];
        var v = e.dec ? vByKey[e.dec.verdict] : null;
        var color = v ? v.color : "rgba(150,160,200,.55)";
        var label = v ? v.label : "·";
        var when = e.dec ? esc(verb(e.dec.verdict) + " " + agoStr(e.dec.ts)) : "non jugé";
        html += '<div class="jswc__tile" data-key="' + esc(e.key) + '">' +
          '<div class="jswc__prev" data-prev></div>' +
          '<div class="jswc__meta">' +
          '<button class="jswc__verdict" data-cycle title="changer le verdict" style="border-color:' + esc(color) + ";color:" + esc(color) + '">' + esc(label) + "</button>" +
          '<span class="jswc__when">' + when + "</span>" +
          '<button class="jswc__redeck" data-redeck title="re-swiper dans le deck">↻</button>' +
          "</div></div>";
      }
      gridEl.innerHTML = html;
      var tiles = gridEl.querySelectorAll(".jswc__tile");
      for (j = 0; j < tiles.length; j++) {
        var key = tiles[j].getAttribute("data-key");
        previewInto(tiles[j].querySelector("[data-prev]"), itemByKey[key], key);
      }
    }

    function onBar(e) {
      var f = e.target && e.target.closest ? e.target.closest("[data-f]") : null;
      if (f) { filter = f.getAttribute("data-f"); renderBar(); renderGrid(); return; }
      var s = e.target && e.target.closest ? e.target.closest("[data-sort]") : null;
      if (s) { sort = s.getAttribute("data-sort"); renderBar(); renderGrid(); }
    }
    function onGrid(e) {
      var tile = e.target && e.target.closest ? e.target.closest(".jswc__tile") : null;
      if (!tile) return;
      var key = tile.getAttribute("data-key");
      if (e.target.closest("[data-redeck]")) { reDeckNs(ns, key); return; }
      if (e.target.closest("[data-cycle]")) {
        var cur = decMap[key] ? decMap[key].verdict : null;
        var idx = cur ? order.indexOf(cur) : -1;
        var nextKey = order[(idx + 1) % order.length];
        storeSetVerdict(ns, key, nextKey, null);
        notify(ns, colObj);
        loadAll(function () { if (alive) renderGrid(); });
      }
    }
    barEl.addEventListener("click", onBar);
    gridEl.addEventListener("click", onGrid);

    var colObj = { ns: ns, refresh: function () { loadAll(function () { if (alive) renderGrid(); }); } };
    var unsub = subscribe(ns, colObj);

    renderBar();
    loadAll(function () { if (alive) renderGrid(); });

    return {
      destroy: function () {
        alive = false;
        try { unsub(); } catch (e) {}
        try { barEl.removeEventListener("click", onBar); } catch (e) {}
        try { gridEl.removeEventListener("click", onGrid); } catch (e) {}
        container.innerHTML = "";
      },
      refresh: function () { loadAll(function () { if (alive) renderGrid(); }); },
      setVerdict: function (id, verdictKey) {
        if (!vByKey[verdictKey]) return false;
        storeSetVerdict(ns, keyForId(id), verdictKey, null);
        notify(ns, colObj);
        loadAll(function () { if (alive) renderGrid(); });
        return true;
      },
      reDeck: function (id) { return reDeckNs(ns, keyForId(id)); },
      history: function (id) { var h = loadHistMap(ns); if (id == null) return h; return h[keyForId(id)] || []; }
    };
  }

  /* niveau namespace : délègue aux vues VIVANTES (un deck/collection qui connaît cet id agit + logge) */
  function nsSetVerdict(id, verdictKey) {
    var res = false, k, a, i;
    for (k in LIVE) { if (!LIVE.hasOwnProperty(k)) continue; a = LIVE[k]; for (i = 0; i < a.length; i++) { if (a[i].setVerdict) { try { if (a[i].setVerdict(id, verdictKey)) res = true; } catch (e) {} } } }
    return res;
  }
  function nsReDeck(id) {
    var res = false, k, a, i;
    for (k in LIVE) { if (!LIVE.hasOwnProperty(k)) continue; a = LIVE[k]; for (i = 0; i < a.length; i++) { if (a[i].reDeck) { try { if (a[i].reDeck(id)) res = true; } catch (e) {} } } }
    return res;
  }
  function nsHistory(id) {
    var k, a, i, out;
    for (k in LIVE) { if (!LIVE.hasOwnProperty(k)) continue; a = LIVE[k]; for (i = 0; i < a.length; i++) { if (a[i].history) { try { out = a[i].history(id); if (out && (id == null || out.length)) return out; } catch (e) {} } } }
    return id == null ? {} : [];
  }

  window.jOSSwipe = {
    mount: mount,
    collection: collection,
    setVerdict: nsSetVerdict,
    reDeck: nsReDeck,
    history: nsHistory,
    version: 2
  };
})();
;
