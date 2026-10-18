/* bion jOSGame — servi seul pour ploxi0n (/px/bion-app/jOSGame.js) */
void 0;
(function(){try{if(document.querySelector('style[data-bion-css="'+"jOSGame"+'"]'))return;var s=document.createElement('style');s.setAttribute('data-bion-css',"jOSGame");s.textContent="\n  #xgame-toast{position:fixed;left:50%;bottom:80px;transform:translateX(-50%) translateY(20px);z-index:2147483400;\n    background:linear-gradient(135deg,#241a05,#3a2c08);border:1.5px solid #ffd35a;border-radius:13px;padding:11px 16px;\n    color:#ffe9a8;font-family:ui-sans-serif,system-ui;box-shadow:0 10px 30px #000b,0 0 20px #ffd35a55;opacity:0;\n    transition:opacity .3s,transform .3s;pointer-events:none;max-width:80vw}\n  #xgame-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}\n  #xgame-toast b{color:#ffd35a}#xgame-toast small{display:block;color:#c8b488;font-size:.72rem;margin-top:2px}\n";document.head.appendChild(s);}catch(e){}})();

;
(function () {
  if (window.jOSGame) return;
  var ACH = [
    { id: 'first-open', name: 'Éveil', desc: 'Ouvrir ton premier ploxion', icon: '🌱', xp: 10 },
    { id: 'explorer', name: 'Explorateur', desc: 'Ouvrir 10 ploxions différents', icon: '🧭', xp: 40 },
    { id: 'wormion', name: 'Voyageur du zoom', desc: 'Ouvrir le wormion (le zoom infini)', icon: '🌀', xp: 25 },
    { id: 'tsoin', name: 'Capteur de tsoins', desc: 'Capter un tsoin dans la machine', icon: '⧗', xp: 25 },
    { id: 'telecommande', name: 'Télécommandeur', desc: 'Appairer la télécommande', icon: '📡', xp: 25 },
    { id: 'koin', name: 'Démêleur', desc: 'Utiliser le koin (long-appui)', icon: '△', xp: 15 },
    { id: 'creator', name: 'Forgeron', desc: 'Créer un ploxion', icon: '🔨', xp: 50 },
    { id: 'space', name: 'Astronaute', desc: 'Ouvrir le xer Space', icon: '🚀', xp: 20 },
    { id: 'quester', name: 'Aventurier', desc: 'Accomplir ta première quête', icon: '🗺️', xp: 40 },
    { id: 'vega', name: 'Cap sur Véga', desc: 'La quête de RS-7 : atteindre Véga (~25 al)', icon: '🌟', xp: 80 }
  ];
  // TABLE DES GAINS XP — ce qui donne de l'XP et combien (visible dans le ploxion xp).
  var RULES = [
    { key: 'bion',       icon: '🔬', label: 'Bion utilisé',           xp: 1,  repeat: true  },
    { key: 'open',       icon: '▣',  label: 'Nouveau ploxion ouvert', xp: 5,  repeat: false },
    { key: 'quest-step', icon: '☑',  label: 'Étape de quête',         xp: 10, repeat: true  },
    { key: 'quest-done', icon: '🏆', label: 'Quête accomplie',        xp: 50, repeat: true  },
    { key: 'side-done',  icon: '✨', label: 'Side-quest accomplie',   xp: 20, repeat: true  },
    { key: 'nexus-step', icon: '⬡',  label: 'Étape de quête nexus',   xp: 20, repeat: true  },
    { key: 'nexus-done', icon: '🌌', label: 'Quête nexus accomplie (contribution)', xp: 150, repeat: true },
    { key: 'contrib',    icon: '📦', label: 'Contribution au nexus (idée/repo/point/wiki)', xp: 30, repeat: true },
    { key: 'tsoin',      icon: '⧗',  label: 'Tsoin capté',            xp: 15, repeat: true  },
    { key: 'achievement',icon: '🎖', label: 'Succès débloqué',        xp: 0,  repeat: true, variable: true }
  ];
  function rule(k) { for (var i = 0; i < RULES.length; i++) if (RULES[i].key === k) return RULES[i]; return null; }

  var st = { unlocked: {}, xp: 0, opened: {}, counts: {}, log: [] };
  try { var s = JSON.parse(localStorage.getItem('jos:game') || '{}'); if (s && typeof s === 'object' && ('xp' in s || s.unlocked)) st = s; } catch (e) {}
  st.unlocked = st.unlocked || {}; st.opened = st.opened || {}; st.counts = st.counts || {}; st.log = st.log || {};
  if (!Array.isArray(st.log)) st.log = [];
  function save() { try { localStorage.setItem('jos:game', JSON.stringify(st)); } catch (e) {}
    // fix 16.08 : saveSoon('game', st) sans key → 422 en boucle sur /px/boxion/save (jamais persisté)
    try { if (window.jOSBoxion && window.jOSBoxion.saveSoon) window.jOSBoxion.saveSoon('game', 'state', st, 'Jeu (XP/quêtes)', 2000); } catch (e) {} }

  function levelOf(xp) { return Math.floor(Math.sqrt((xp || 0) / 25)) + 1; }
  function xpForLevel(l) { return 25 * (l - 1) * (l - 1); }   // inverse : XP requis pour le niveau l

  var toastEl;
  function toast(icon, title, xp, sub) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.id = 'xgame-toast'; (document.body || document.documentElement).appendChild(toastEl); }
    toastEl.innerHTML = (xp > 0 ? '+' + xp + ' XP ' : '') + '<b>' + icon + ' ' + title + '</b>' + (sub ? '<small>' + sub + '</small>' : '');
    toastEl.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.classList.remove('on'); }, 3200);
    try { if (window.jOSb && window.jOSb.beep) window.jOSb.beep(); } catch (e) {}
    if (navigator.vibrate) navigator.vibrate([12, 40, 12]);
  }
  function achById(id) { for (var i = 0; i < ACH.length; i++) if (ACH[i].id === id) return ACH[i]; return null; }

  // CŒUR : accorder de l'XP, tracer dans le log, notifier. meta = {xp,label,icon,toast,quiet}
  function award(key, meta) {
    meta = meta || {};
    var r = rule(key) || { key: key, icon: '✦', label: key, xp: 0 };
    var lvBefore = levelOf(st.xp);
    var xp = (typeof meta.xp === 'number') ? meta.xp : r.xp;
    st.xp = (st.xp || 0) + xp;
    st.counts[key] = (st.counts[key] || 0) + 1;
    st.log.unshift({ t: Date.now(), key: key, xp: xp, label: meta.label || r.label, icon: meta.icon || r.icon });
    if (st.log.length > 120) st.log.length = 120;
    save();
    if (meta.toast !== false && (xp > 0 || meta.toast)) toast(meta.icon || r.icon, meta.label || r.label, xp, meta.sub);
    var lvAfter = levelOf(st.xp);
    if (lvAfter > lvBefore) setTimeout(function () { toast('⬆️', 'Niveau ' + lvAfter + ' !', 0, 'tu montes de niveau'); }, meta.toast === false ? 0 : 900);
    try { window.dispatchEvent(new CustomEvent('jos:game', { detail: { award: key, xp: xp, total: st.xp } })); } catch (e) {}
    return xp;
  }

  var G = {
    achievements: ACH,
    rules: function () { return RULES; },
    state: function () { return st; },
    xp: function () { return st.xp || 0; },
    counts: function () { return st.counts || {}; },
    log: function () { return st.log || []; },
    level: function () { return levelOf(st.xp); },
    xpForLevel: xpForLevel,
    // XP restant + total dans le palier courant → barre de progression
    progress: function () { var l = levelOf(st.xp), a = xpForLevel(l), b = xpForLevel(l + 1); return { level: l, into: (st.xp || 0) - a, span: b - a, next: b - (st.xp || 0) }; },
    isUnlocked: function (id) { return !!st.unlocked[id]; },
    award: award,
    unlock: function (id) { var a = achById(id); if (!a || st.unlocked[id]) return false; st.unlocked[id] = Date.now();
      award('achievement', { xp: a.xp, label: a.name, icon: a.icon, sub: a.desc }); return true; },
    // 1 XP par bion utilisé (throttlé par bion pour ne pas spammer le bus)
    bion: function (name) { var k = 'bn:' + (name || 'x'); var t = Date.now(); G.__bt = G.__bt || {};
      if (G.__bt[k] && t - G.__bt[k] < 1500) return; G.__bt[k] = t; award('bion', { label: 'Bion « ' + (name || 'bion') + ' »', toast: false }); },
    event: function (type, data) {
      if (type === 'open') {
        var id = data; if (!st.opened[id]) { st.opened[id] = 1; award('open', { label: 'Ploxion « ' + id + ' »', toast: false }); }
        var n = Object.keys(st.opened).length;
        if (n >= 1) G.unlock('first-open');
        if (n >= 10) G.unlock('explorer');
        if (id === 'hud' || id === 'wormion') G.unlock('wormion');
        if (id === 'remote' || id === 'telexion') G.unlock('telecommande');
        if (id === 'space' || id === 'carte-espace') G.unlock('space');
        if (id === 'forge' || id === 'builder') G.unlock('creator');
      } else if (type === 'bion') { G.bion(data); }
      else if (type === 'tsoin') { award('tsoin', { toast: true }); G.unlock('tsoin'); }
      else if (type === 'koin') G.unlock('koin');
      else if (type === 'create-ploxion') G.unlock('creator');
      // QUÊTES : une étape franchie / une quête accomplie donnent de l'XP.
      // Les quêtes NEXUS (type='nexus' : contribuer un ploxion/bion/fix au RepoVerse) paient
      // beaucoup plus — c'est LE moteur « gagner de l'XP en contribuant » (RS-7 2026-07-24).
      else if (type === 'quest-step') { var nx = data && data.nexus; award(nx ? 'nexus-step' : 'quest-step', { label: 'Étape : ' + (data && data.texte || (data && data.quete) || 'quête'), toast: true }); }
      else if (type === 'quest-done') { var side = data && data.side, nxd = data && data.nexus;
        award(nxd ? 'nexus-done' : (side ? 'side-done' : 'quest-done'), { label: (nxd ? 'Quête nexus' : side ? 'Side-quest' : 'Quête') + ' : ' + (data && data.nom || ''), icon: nxd ? '🌌' : side ? '✨' : '🏆', toast: true }); G.unlock('quester'); if (nxd) G.unlock('creator'); }
      // CONTRIBUTION directe (hors quête) : idée→repo, point carte, page wiki… → +XP
      else if (type === 'contrib') { award('contrib', { label: 'Contribution : ' + (data && (data.label || data.kind) || 'nexus'), toast: true }); }
    }
  };
  window.jOSGame = G;

  // AUTO-HOOK ouverture de ploxions (crédite open + achievements).
  var tries = 0;
  (function hook() {
    var done = false;
    ['jOS', 'jOSOp', 'jOSMobile'].forEach(function (ns) {
      var o = window[ns]; if (!o) return;
      var fn = o.openPloxion ? 'openPloxion' : (o.open ? 'open' : null); if (!fn || o['__g_' + fn]) return;
      var orig = o[fn]; o['__g_' + fn] = 1;
      o[fn] = function (id) { try { G.event('open', id); } catch (e) {} return orig.apply(o, arguments); };
      done = true;
    });
    if (++tries < 20 && !done) setTimeout(hook, 400); else if (tries < 20) setTimeout(hook, 1500);
  })();

  // BUS : « 1 xp par bion UTILISÉ » (RS-7) — mais utiliser ≠ battre (16.08 : « ça me
  // génère trop d'xp pour rien »). Le BRUIT (heartbeats de persistance, pings, télémétrie
  // périodique) ne donne JAMAIS d'XP : observer n'est pas agir. Filtre partagé avec le
  // tsoin engine (jOSTsoinEngine.noise) + denylist locale en secours.
  var XP_NOISE = /(^|\.)(heartbeat|presence|ping|tick|poll|telemetry|state)$|^store\.[^.]+\.changed$|^sys\./;
  function xpNoise(src, topic, payload) {
    try { if (window.jOSTsoinEngine && jOSTsoinEngine.noise) return jOSTsoinEngine.noise((src ? src + '.' : '') + (topic || ''), payload); } catch (e) {}
    var t = (src ? src + '.' : '') + (topic || '');
    if (XP_NOISE.test(t)) { var r = payload && payload.reason; return !(r && /add|set|remove|upsert|replace|clear/.test(r)); }
    return false;
  }
  (function busHook() {
    try {
      if (window.jOSPorts && window.jOSPorts.emit && !window.jOSPorts.__gwrap) {
        window.jOSPorts.__gwrap = 1; var oe = window.jOSPorts.emit;
        window.jOSPorts.emit = function (src, topic, payload) { try { if (!xpNoise(src, topic, payload)) G.bion(src || topic); } catch (e) {} return oe.apply(this, arguments); };
        return;
      }
    } catch (e) {}
    setTimeout(busHook, 700);
  })();
})();
;
