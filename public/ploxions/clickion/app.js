/* ploxion clickion — app à la demande (/px/clickion/app.js, format 2, 2 scripts) */
void 0;
(function(){try{var B=window.__PLOXIONS_BIONS__=window.__PLOXIONS_BIONS__||{};B["clickion"]=["jOSTsoin","jOSUsage"];}catch(e){}})();
(function(){try{if(document.querySelector('style[data-px-css="'+"clickion"+'"]'))return;var s=document.createElement('style');s.setAttribute('data-px-css',"clickion");s.textContent="\n  .ck { --a:#a597cf; --b:#79d9a2; --t:#ddd6ea; --m:#7f7699; --s:#0f0b18; --bd:#272036; --bd2:#3a3050; min-height:100%; box-sizing:border-box; background:#07050c; color:var(--t);\n    padding:12px 14px 0; display:flex; flex-direction:column; font-family:-apple-system,system-ui,sans-serif; -webkit-user-select:none; user-select:none; }\n  .ck-tete { text-align:center; padding-top:6px; }\n  .ck-n { font:800 clamp(30px,10vw,46px)/1.05 ui-monospace,Menlo,monospace; text-shadow:calc(var(--mx,0) * -1.5px) calc(var(--my,0) * -1.5px) 0 #000; }\n  .ck-p { margin-top:5px; font:600 12.5px ui-monospace,Menlo,monospace; color:var(--m); } .ck-p b { color:var(--b); font-weight:600; }\n  .ck-cube { display:block; margin:6px auto 0; width:min(78vw,320px); aspect-ratio:1; border:0; background:none; padding:0; -webkit-tap-highlight-color:transparent; touch-action:manipulation; }\n  .ck-cube svg { width:100%; height:100%; overflow:visible; translate:calc(var(--mx,0) * 7px) calc(var(--my,0) * 7px); }\n  .ck-cube .corps { animation:ckrespire 7s ease-in-out infinite; transform-origin:150px 150px; transform-box:view-box; }\n  @keyframes ckrespire { 50% { transform:scale(1.025); } }\n  .ck-cube.bat .corps { animation:ckbat .35s cubic-bezier(.3,1.6,.4,1); }\n  @keyframes ckbat { 40% { transform:scale(1.06); } }\n  .ck-rosa { margin:6px 0 10px; padding:11px 13px; border-radius:14px; border:1.5px solid var(--bd2); background:var(--s); font-size:14px; line-height:1.45; }\n  .ck-rosa b { display:block; font:700 10.5px ui-monospace,Menlo,monospace; letter-spacing:.16em; text-transform:uppercase; color:var(--b); margin-bottom:4px; }\n  .ck-h { margin:18px 0 8px; font-size:15px; } .ck-h small { display:block; font:600 11px ui-monospace,Menlo,monospace; color:var(--m); margin-top:2px; }\n  .ck-carte { padding:12px 13px; margin-bottom:9px; border-radius:15px; border:2px solid var(--bd); background:var(--s); }\n  .ck-carte b { font-size:15px; } .ck-carte p { margin:4px 0 0; color:var(--m); font-size:13px; line-height:1.45; }\n  .ck-barre { display:block; height:6px; border-radius:3px; background:#1a1426; margin:9px 0 4px; overflow:hidden; } .ck-barre i { display:block; height:100%; background:var(--a); min-width:2px; }\n  .ck-mono { font:600 11.5px ui-monospace,Menlo,monospace; color:var(--m); }\n  .ck-lieu { display:flex; align-items:center; gap:11px; padding:10px 12px; margin-bottom:8px; border-radius:14px; border:2px solid var(--bd); background:var(--s); }\n  .ck-lieu i { font-style:normal; width:26px; text-align:center; font-size:18px; color:var(--a); } .ck-lieu div { flex:1; min-width:0; } .ck-lieu small { display:block; color:var(--m); font-size:12px; margin-top:2px; }\n  .ck-lieu.ferme { opacity:.45; border-style:dashed; }\n  .ck-suivant .ck-ligne { display:flex; align-items:baseline; gap:10px; } .ck-suivant .ck-ligne b { flex:1; }\n  .ck-sources { display:grid; grid-template-columns:repeat(auto-fill,minmax(132px,1fr)); gap:7px; margin-top:4px; }\n  .ck-sources div { display:grid; grid-template-columns:22px 1fr auto; grid-template-rows:auto auto; column-gap:6px; padding:8px 10px; border-radius:12px; border:1.5px solid var(--bd); background:var(--s); }\n  .ck-sources i { grid-row:1 / 3; font-style:normal; font-size:17px; color:var(--a); align-self:center; } .ck-sources b { font:700 13px ui-monospace,Menlo,monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }\n  .ck-sources small { grid-column:2; font:600 10px ui-monospace,Menlo,monospace; color:var(--m); } .ck-sources em { grid-column:3; grid-row:1 / 3; align-self:center; font:700 11px ui-monospace,Menlo,monospace; color:var(--b); font-style:normal; }\n  .ck-frag { padding:11px 13px; margin-bottom:8px; border-left:2px solid var(--b); background:var(--s); border-radius:0 12px 12px 0; }\n  .ck-frag p { margin:5px 0 0; font-size:14px; line-height:1.5; } .ck-frag a { display:inline-block; margin-top:6px; color:var(--b); text-decoration:none; }\n  .ck-frag.ferme { border-left-color:var(--bd2); opacity:.45; } .ck-frag.ferme p { font:600 12px ui-monospace,Menlo,monospace; color:var(--m); }\n  .ck-series { display:flex; gap:6px; overflow-x:auto; margin:0 0 12px; padding-bottom:2px; } .ck-series button { flex:0 0 auto; display:flex; flex-direction:column; align-items:center; gap:1px; padding:7px 11px; border-radius:12px; border:1.5px solid var(--bd); background:var(--s); color:var(--m); font:700 10px ui-monospace,Menlo,monospace; }\n  .ck-series button i { font-style:normal; font-size:16px; color:var(--a); } .ck-series button small { font-size:9.5px; } .ck-series button.on { border-color:var(--b); color:var(--t); }\n  .ck-rs { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; margin-bottom:10px; } .ck-rs div { padding:9px 8px; border-radius:12px; border:1.5px solid var(--bd); background:var(--s); text-align:center; }\n  .ck-rs b { display:block; font:800 15px ui-monospace,Menlo,monospace; } .ck-rs small { font:600 9.5px ui-monospace,Menlo,monospace; color:var(--m); }\n  .ck-voie { display:flex; gap:10px; align-items:center; } .ck-voie .ck-emb { width:58px; height:58px; flex:0 0 58px; } .ck-voie > div { flex:1; min-width:0; } .ck-voie small.pk { color:var(--a); }\n  .ck-auto { display:flex; align-items:center; gap:10px; padding:9px 12px; margin:0 0 10px; border-radius:13px; border:1.5px dashed var(--bd2); } .ck-auto.on { border-style:solid; border-color:var(--b); background:#14261d; }\n  .ck-auto i { font-style:normal; font-size:20px; color:var(--b); } .ck-auto div { flex:1; } .ck-auto b { display:block; font-size:13px; } .ck-auto small { color:var(--m); font-size:11.5px; }\n  .ck-mod u { position:absolute; top:6px; right:8px; text-decoration:none; color:var(--b); font-size:12px; } .ck-mod { position:relative; }\n  .ck-but { display:grid; grid-template-columns:1fr auto; gap:2px 10px; padding:9px 12px; margin-bottom:7px; border-radius:12px; border:1.5px solid var(--bd); background:var(--s); }\n  .ck-but b { font-size:13.5px; } .ck-but .ck-barre { grid-column:1 / -1; margin:5px 0 2px; } .ck-but .ck-pts { grid-column:1 / -1; letter-spacing:.2em; font-size:10px; }\n  .ck-carte-u { display:block; width:100%; max-width:440px; margin:0 auto 6px; overflow:visible; }\n  .ck-ici { animation:ckIci 2.4s ease-in-out infinite; transform-box:fill-box; transform-origin:center; } @keyframes ckIci { 50% { transform:scale(1.18); opacity:.4; } }\n  .ck-uni p { color:var(--t); }\n  .ck-ici-u { margin-top:4px; color:var(--b); }\n  .ck-arrivee { position:fixed; inset:0; z-index:100; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; animation:ckArr 1.7s ease forwards; pointer-events:none; }\n  .ck-arrivee i { font-style:normal; font-size:84px; animation:ckArrG 1.7s cubic-bezier(.2,.8,.2,1) forwards; } .ck-arrivee b { font:800 22px ui-monospace,Menlo,monospace; letter-spacing:.2em; text-transform:uppercase; }\n  @keyframes ckArr { 0% { opacity:0; } 15%,70% { opacity:1; } 100% { opacity:0; } } @keyframes ckArrG { 0% { transform:scale(.2) rotate(-90deg); } 60% { transform:scale(1.1) rotate(0); } 100% { transform:scale(1.6); } }\n  .ck { transition:background .6s ease; }\n  .ck-ech { margin-top:4px; color:var(--a); }\n  .ck-echelle div { display:grid; grid-template-columns:86px 1fr auto; gap:8px; align-items:baseline; padding:7px 10px; border-left:2px solid var(--bd2); opacity:.5; }\n  .ck-echelle div.ok { border-left-color:var(--b); opacity:1; } .ck-echelle b { font-size:13px; font-weight:600; } .ck-echelle em { font:700 11px ui-monospace,Menlo,monospace; color:var(--b); font-style:normal; text-align:right; }\n  .ck-contrat { display:grid; grid-template-columns:22px 1fr auto; gap:2px 8px; align-items:center; margin-top:8px; } .ck-contrat i { font-style:normal; color:var(--a); } .ck-contrat .ck-barre { grid-column:2 / -1; margin:2px 0 0; }\n  .ck-contrat.fait span:not(.ck-barre) { color:var(--b); } .ck-contrat em { font-style:normal; }\n  .ck-coll { width:100%; margin-bottom:6px; border-color:var(--a) !important; }\n  .ck-set { margin-bottom:12px; } .ck-arts { display:grid; grid-template-columns:repeat(auto-fill,minmax(96px,1fr)); gap:6px; margin-top:6px; }\n  .ck-art { padding:9px 8px; border-radius:12px; border:1.5px solid var(--bd); background:var(--s); text-align:center; } .ck-art i { display:block; font-style:normal; font-size:20px; }\n  .ck-art b { display:block; font-size:11.5px; line-height:1.25; margin-top:3px; } .ck-art small { font:600 9.5px ui-monospace,Menlo,monospace; color:var(--m); }\n  .ck-art.vide { opacity:.35; border-style:dashed; } .ck-art.vide i { color:var(--m); }\n  .ck-art.r0 i { color:#9d93b8; } .ck-art.r1 i { color:#7fb2e5; } .ck-art.r1 { border-color:#2b4a6b; } .ck-art.r2 i { color:#f0d36c; } .ck-art.r2 { border-color:#6b5a1f; } .ck-art.r3 i { color:#ef6f8e; } .ck-art.r3 { border-color:#7a2a40; background:#1a0a10; }\n  .ck-signal { margin:0 0 10px; padding:12px 14px; border-radius:15px; border:2px solid #f0d36c; background:#171204; display:grid; gap:6px; animation:ckSig 1.2s ease-in-out infinite alternate; }\n  .ck-signal b { color:#f0d36c; } .ck-signal em { font-style:normal; } .ck-choix { display:flex; gap:8px; } .ck-choix button { flex:1; }\n  @keyframes ckSig { to { border-color:#8a6d1a; } }\n  .ck-mods { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:8px; }\n  .ck-mod { display:grid; grid-template-columns:28px 1fr; text-align:left; gap:2px 8px; padding:11px 12px; border-radius:14px; border:2px solid var(--bd); background:var(--s); color:var(--t); }\n  .ck-mod i { grid-row:1 / 4; font-style:normal; font-size:22px; color:var(--a); align-self:center; } .ck-mod b { font-size:14px; } .ck-mod small { font:600 10px ui-monospace,Menlo,monospace; color:var(--m); }\n  .ck-mod em { font:700 11px ui-monospace,Menlo,monospace; color:var(--b); font-style:normal; } .ck-mod.ferme { opacity:.4; border-style:dashed; }\n  .ck-retour { margin-bottom:6px; }\n  .ck-piste { position:relative; height:44px; margin:18px 0; border-radius:12px; border:2px solid var(--bd2); background:#0a0712; overflow:hidden; }\n  .ck-zone { position:absolute; top:0; bottom:0; background:rgba(121,217,162,.22); border-left:2px solid var(--b); border-right:2px solid var(--b); }\n  .ck-curseur { position:absolute; top:4px; bottom:4px; width:4px; border-radius:2px; background:var(--t); animation:ckva 1s linear infinite; }\n  @keyframes ckva { 0% { left:0; } 50% { left:calc(100% - 4px); } 100% { left:0; } }\n  .ck-gros { display:block; width:100%; min-height:96px; border-radius:20px; border:2px solid var(--a); background:#151021; color:var(--t); font-size:40px; touch-action:manipulation; }\n  .ck-gros:active { background:#221a33; }\n  .ck-graines { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; }\n  .ck-parcelles { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }\n  .ck-parc { aspect-ratio:1; border-radius:14px; border:2px solid var(--bd); background:#120d19; color:var(--t); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; }\n  .ck-parc i { font-style:normal; font-size:28px; } .ck-parc small { font:600 10px ui-monospace,Menlo,monospace; color:var(--m); }\n  .ck-parc.vide { border-style:dashed; color:var(--m); font-size:24px; } .ck-parc.mur { border-color:var(--b); background:#14261d; }\n  .ck-seq { min-height:64px; text-align:center; font-size:44px; letter-spacing:.2em; margin:12px 0; color:var(--b); }\n  .ck-glyphes { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; } .ck-glyphes button { min-height:64px; font-size:28px; }\n  .ck-exp { width:100%; text-align:left; color:var(--t); } .ck-exp span { color:var(--b); }\n  .ck-prochain { display:grid; grid-template-columns:auto 1fr auto; gap:10px; align-items:center; margin-top:12px; opacity:.8; }\n  .ck-nav button.ferme { opacity:.35; }\n  .ck-ouvre { position:fixed; left:50%; top:30%; transform:translateX(-50%); padding:14px 22px; border:1px solid #79d9a2; background:#0f1a14; color:#79d9a2; font:600 18px ui-monospace,monospace; z-index:99; animation:ckOuvre 2.6s ease forwards; pointer-events:none; }\n  @keyframes ckOuvre { 0% { opacity:0; transform:translate(-50%,10px); } 12%,80% { opacity:1; transform:translate(-50%,0); } 100% { opacity:0; } }\n  .ck button.act { min-height:42px; padding:0 13px; border-radius:12px; border:2px solid var(--a); background:var(--a); color:#0d0a16; font:800 13px -apple-system,system-ui,sans-serif; }\n  .ck button.sec { min-height:42px; padding:0 13px; border-radius:12px; border:2px solid var(--bd2); background:#0a0712; color:var(--t); font:700 13px -apple-system,system-ui,sans-serif; }\n  .ck button:disabled { opacity:.45; }\n  .ck-voies { display:grid; grid-template-columns:1fr 1fr; gap:8px; }\n  .ck-voie { text-align:left; padding:11px 12px; border-radius:14px; border:2px solid var(--bd); background:var(--s); color:var(--t); }\n  .ck-voie b { display:block; font-size:14px; } .ck-voie small { display:block; color:var(--m); font-size:11.5px; line-height:1.35; margin-top:3px; }\n  .ck-voie em { display:block; margin-top:4px; font:700 12px ui-monospace,Menlo,monospace; color:var(--b); font-style:normal; } .ck-voie:disabled { opacity:1; }\n  .ck-voie.on { border-color:var(--b); background:#14261d; } .ck-voie.xo { grid-column:1 / -1; } .ck-voie.ferme { opacity:.45; border-style:dashed; }\n  .ck textarea { width:100%; box-sizing:border-box; min-height:96px; padding:11px; border-radius:13px; border:2px solid var(--bd2); background:#0a0712; color:var(--t); font:11px ui-monospace,Menlo,monospace; -webkit-user-select:text; user-select:text; }\n  .ck-corps { flex:1; }\n  .ck-nav { position:sticky; bottom:calc(env(safe-area-inset-bottom,0px) + 8px); margin-top:14px; display:flex; gap:5px; padding:6px; border-radius:20px; border:2px solid var(--bd2); background:#0a0712; z-index:5; }\n  .ck-nav button { flex:1; min-height:52px; border:0; border-radius:14px; background:none; color:var(--m); font:700 8.5px ui-monospace,Menlo,monospace; letter-spacing:.05em; text-transform:uppercase; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; }\n  .ck-nav button i { font-style:normal; font-size:17px; } .ck-nav button.on { background:#151021; color:var(--t); box-shadow:inset 0 0 0 1.5px var(--b); }\n  .ck-flot { position:fixed; pointer-events:none; transform:translate(-50%,-50%); font:800 17px ui-monospace,Menlo,monospace; color:var(--b); animation:ckflot .9s ease-out forwards; z-index:7; }\n  @keyframes ckflot { to { opacity:0; transform:translate(-50%,-160%); } }\n  .ck-verrou { text-align:center; padding-top:16vh; } .ck-verrou .g { font-size:54px; color:var(--a); } .ck-verrou p { color:var(--m); line-height:1.55; max-width:380px; margin:10px auto; }\n  @media (prefers-reduced-motion:reduce) { .ck-cube .corps, .ck-flot { animation:none; } }\n";var a=document.getElementById('px-apps-css');if(a&&a.parentNode)a.parentNode.insertBefore(s,a.nextSibling);else document.head.appendChild(s);}catch(e){}})();

/* script 1/2 */

(function () {
  if (window.jOSXerClicker) return;
  var LOG115 = Math.log10(1.15);
  // ---- les grands nombres en log10 ----
  function addL(a, b) { if (a == null) return b; if (b == null) return a; var m = Math.max(a, b), n = Math.min(a, b); if (m - n > 15) return m; return m + Math.log10(1 + Math.pow(10, n - m)); }
  function subL(a, b) { if (b == null) return a; if (a == null || b >= a) return null; if (a - b > 15) return a; return a + Math.log10(1 - Math.pow(10, b - a)); }
  function deN(n) { return n > 0 ? Math.log10(n) : null; }
  function versN(L) { return L == null ? 0 : Math.pow(10, L); }
  var SUF = ['', 'k', 'M', 'Md', 'Bn', 'Bd', 'Tn', 'Td', 'Qn', 'Qd', 'Sx', 'Sd'];
  /** un nombre lisible : 1 234 · 12.3 M · 4.56·10^45 · 10^(1.23·10^30) · googolplex */
  function fmtL(L, court) {
    // (v2.2, RS-7 : « ×10 ou max faisait crasher le jeu ») un non-fini (Infinity, NaN) appelait fmtL(log10(∞)) à l'infini → pile pleine
    if (L != null && !isFinite(L)) return '∞';
    if (L == null || L < 0) return L == null ? '0' : (Math.round(Math.pow(10, L) * 100) / 100).toString();
    if (L < 4) return String(Math.floor(Math.pow(10, L) + 1e-9));
    if (L < 36) { var g = Math.floor(L / 3), m = Math.pow(10, L - g * 3); return (m < 10 ? m.toFixed(2) : m < 100 ? m.toFixed(1) : m.toFixed(0)) + ' ' + SUF[g]; }
    if (L >= 1e100) return L >= 1e100 && L < 1.0001e100 ? 'googolplex' : '10^' + fmtL(Math.log10(L), true);
    if (L < 1e6) { var e = Math.floor(L), mm = Math.pow(10, L - e); return mm.toFixed(2) + '·10^' + e; }
    return '10^(' + fmtL(Math.log10(L), true) + ')';
  }
  // ---- les générateurs : le xerboxion, du plus petit au plus grand ; « dec » = ploxions découverts pour le débloquer ----
  var GENS = [
    { id: 'bion', n: 'Bion', ic: '·', cost: 15, rate: 0.1, dec: 0 },
    { id: 'cubion', n: 'Cubion', ic: '⬡', cost: 100, rate: 1, dec: 3 },
    { id: 'ploxion', n: 'Ploxion', ic: '◌', cost: 1100, rate: 8, dec: 8 },
    { id: 'boxion', n: 'Boxion', ic: '▣', cost: 12000, rate: 47, dec: 20 },
    { id: 'xerion', n: 'Xerion', ic: '✦', cost: 130000, rate: 260, dec: 45 },
    { id: 'galaxion', n: 'Galaxion', ic: '❂', cost: 1.4e6, rate: 1400, dec: 90 },
    { id: 'xerboxion', n: 'Xerboxion', ic: '∞', cost: 2e7, rate: 7800, dec: 150 },
    { id: 'nexus', n: 'Nexus', ic: '⬢', cost: 3.3e8, rate: 44000, dec: 250 },
    { id: 'tsoinfini', n: 'Tsoinfini', ic: '⧗', cost: 5.1e9, rate: 260000, dec: 350 },
    { id: 'omnixion', n: 'Omnixion', ic: '✺', cost: 7.5e10, rate: 1.6e6, dec: 500 },
    // (v3) l'au-delà : débloqués par les DIMENSIONS (et 15 du palier d'avant) — le jeu d'après les premiers plongeons
    { id: 'cosmion', n: 'Cosmion', ic: '❋', cost: 1e12, rate: 1e7, dec: 0, dims: 1 },
    { id: 'chronion', n: 'Chronion', ic: '⧖', cost: 1.4e13, rate: 6.5e7, dec: 0, dims: 5 },
    { id: 'hyperion', n: 'Hyperion', ic: '⟁', cost: 1.7e14, rate: 4.3e8, dec: 0, dims: 20 },
    { id: 'omegaxion', n: 'Omégaxion', ic: 'Ω', cost: 2.1e15, rate: 2.9e9, dec: 0, dims: 100 },
    { id: 'googolion', n: 'Googolion', ic: '𝔊', cost: 2.6e16, rate: 2.1e10, dec: 0, dims: 1000 },
  ];
  var PALIERS = [[6, 'un million'], [9, 'un milliard'], [12, 'mille milliards'], [15, 'un billiard'], [24, 'le cap des 10^24'], [33, 'un quintilliard'],
    [50, '10^50'], [100, 'un googol'], [303, 'un centillion'], [1000, '10^1000'], [1e6, 'un million de chiffres'], [1e100, 'GOOGOLPLEX']];

  /** l'état : nouveau, ou celui d'avant (v1 : { xp, owned }) migré */
  function normaliser(d) {
    d = d && typeof d === 'object' ? d : {};
    var st = { v: 3, v31: true, L: null, owned: {}, dims: 0, Lrun: null, imports: [], paliers: {}, clics: 0, tech: {}, upg: {}, succes: {}, stats: { eclats: 0, fusions: 0, jeu: 0, plongeons: 0, meilleur: null }, boosts: [], quetes: { jour: '', faites: {} }, saisons: Array.isArray(d.saisons) ? d.saisons : [], t: +d.t || 0 };
    // (13.10, RS-7 : « c'est beaucoup trop simple d'arriver à avoir tout ») la saison 2 : une partie v1/v2 devient un trophée, on recommence
    if (d.v === 2 || (d.v === 3 && !d.v31) || (d.v == null && typeof d.xp === 'number')) {
      var Lv = d.v >= 2 ? (typeof d.L === 'number' ? d.L : null) : deN(d.xp);
      if (Lv != null) st.saisons.push({ saison: st.saisons.length + 1, L: Lv, dims: +d.dims || 0, le: Date.now() });
      st.imports = Array.isArray(d.imports) ? d.imports.slice(0, 40) : []; st.clics = +d.clics || 0; st.t = Date.now();
      return st;
    }
    if (d.v === 3) { st.L = typeof d.L === 'number' ? d.L : null; st.dims = +d.dims || 0; st.Lrun = typeof d.Lrun === 'number' ? d.Lrun : st.L; st.imports = Array.isArray(d.imports) ? d.imports.slice(0, 40) : []; st.paliers = d.paliers || {}; st.clics = +d.clics || 0; st.tech = d.tech && typeof d.tech === 'object' ? d.tech : {};
      ['upg', 'succes', 'missions'].forEach(function (k) { if (d[k] && typeof d[k] === 'object') st[k] = d[k]; }); if (d.stats && typeof d.stats === 'object') for (var sk in d.stats) st.stats[sk] = d.stats[sk];
      st.boosts = Array.isArray(d.boosts) ? d.boosts.filter(function (b) { return b && b.fin > Date.now(); }).slice(0, 12) : []; if (d.quetes && typeof d.quetes === 'object') st.quetes = d.quetes; }
    // (16.10) Clickion continue la MÊME partie : ses couches vivent dans st.clickion, que le jeu d'origine garde intactes
    if (d.clickion && typeof d.clickion === 'object') st.clickion = d.clickion;
    if (!isFinite(st.dims)) st.dims = DIMS_MAX; ['L', 'Lrun'].forEach(function (f) { if (st[f] != null && !isFinite(st[f])) st[f] = 1e300; });
    if (st.stats.meilleur == null && st.L != null) st.stats.meilleur = Math.max(st.L, st.Lrun || st.L);
    var o = d.owned && typeof d.owned === 'object' ? d.owned : {};
    GENS.forEach(function (g) { var n = +o[g.id] || 0; if (n > 0) st.owned[g.id] = Math.min(n, 1e300); });
    return st;
  }
  // ---- L'ARBRE (13.10, RS-7 : « il manque un tech tree, il faut qu'on puisse améliorer le clicker en utilisant le xerboxion ») ----
  // Chaque nœud coûte de la monnaie du clicker (ou des dimensions) ET exige une condition RÉELLE du xerboxion (des tsoins, des catégories
  // complètes, des heures, le Nexus, un clicker importé…). Acquis pour toujours : il survit aux plongeons de dimension.
  var BRANCHES = [['dec', '◌', 'Découverte'], ['tsoin', '⧗', 'Tsoins'], ['mod', '◫', 'Modules'], ['rs', '✦', 'Voies'], ['lore', '⧉', 'Journal'], ['bion', '⬡', 'Bions'], ['clic', '✦', 'Toucher'], ['nexus', '⬢', 'Nexus'], ['dim', '∞', 'Dimensions']];
  function cond(cle, n, lib) { return { cle: cle, n: n, lib: lib }; }
  var ARBRE = [
    { id: 'D1', b: 'dec', n: 'Cartographe', ic: '◌', L: 5, c: cond('decouverts', 10, 'ploxions découverts'), d: 'tes ploxions découverts multiplient la production (+2,5 % chacun)', e: { decCoef: 0.5 } },
    { id: 'D2', b: 'dec', n: 'Explorateur', ic: '◎', L: 9, r: 'D1', c: cond('categoriesFinies', 1, 'catégorie complète'), d: 'chaque catégorie complète ×1,25', e: { catMult: 1.25 } },
    { id: 'D3', b: 'dec', n: 'Arpenteur', ic: '⊚', L: 18, r: 'D2', c: cond('decouverts', 200, 'ploxions découverts'), d: 'chaque découverte pèse 3× plus', e: { decCoef: 1.5 } },
    { id: 'D4', b: 'dec', n: 'Omniscience', ic: '⦿', L: 40, r: 'D3', c: cond('categoriesFinies', 10, 'catégories complètes'), d: 'chaque catégorie complète ×2', e: { catMult: 2 } },
    { id: 'T1', b: 'tsoin', n: 'Machine à tsoins', ic: '⧗', L: 6, c: cond('tsoins', 50, 'tsoins'), d: 'tes tsoins multiplient la production', e: { tsoinDiv: 250 } },
    { id: 'T2', b: 'tsoin', n: 'Rejeu', ic: '⟲', L: 11, r: 'T1', c: cond('tsoins', 200, 'tsoins'), d: 'l\'absence rapporte ×2, jusqu\'à 90 jours', e: { absenceMult: 2, absenceCap: 90 } },
    { id: 'T3', b: 'tsoin', n: 'Tsoin engine', ic: '⧖', L: 21, r: 'T2', c: cond('tsoins', 1000, 'tsoins'), d: 'les tsoins pèsent 5× plus', e: { tsoinDiv: 50 } },
    { id: 'T4', b: 'tsoin', n: 'Tsoinfini', ic: '∞', L: 45, r: 'T3', c: cond('tsoins', 5000, 'tsoins'), d: 'l\'absence ×10, jusqu\'à un an', e: { absenceMult: 10, absenceCap: 365 } },
    { id: 'B1', b: 'bion', n: 'Bions partagés', ic: '·', L: 3, c: cond('possedes', 25, 'générateurs'), d: 'bion et cubion ×3', e: { gen: { bion: 3, cubion: 3 } } },
    { id: 'B2', b: 'bion', n: 'Craft', ic: '⬡', L: 8, r: 'B1', c: cond('possedes', 150, 'générateurs'), d: 'les prix montent moins vite (×1,15 → ×1,13)', e: { croissance: 1.13 } },
    { id: 'B3', b: 'bion', n: 'Usine à bions', ic: '⬢', L: 15, r: 'B2', c: cond('possedes', 500, 'générateurs'), d: 'synergies : chaque palier nourrit le suivant (+1 % par unité du palier d\'avant)', e: { synergie: true } },
    { id: 'B4', b: 'bion', n: 'Forge', ic: '⟁', L: 30, r: 'B3', c: cond('possedes', 2000, 'générateurs'), d: 'les prix montent à peine (×1,10)', e: { croissance: 1.10 } },
    { id: 'C1', b: 'clic', n: 'Doigt chill', ic: '✦', L: 2.5, c: cond('clics', 100, 'touchers'), d: 'un toucher vaut 5 % de la production (au lieu de 3 %)', e: { clicPart: 0.05 } },
    { id: 'C2', b: 'clic', n: 'Haptique', ic: '≈', L: 7, r: 'C1', c: cond('clics', 1000, 'touchers'), d: 'un toucher ×10', e: { clicMult: 10 } },
    { id: 'C3', b: 'clic', n: 'Auto-toucher', ic: '⟳', L: 13, r: 'C2', c: cond('clics', 3000, 'touchers'), d: 'le cœur se touche tout seul, 2 fois par seconde', e: { auto: 2 } },
    { id: 'C4', b: 'clic', n: 'Le geste', ic: '✶', L: 26, r: 'C3', c: cond('clics', 10000, 'touchers'), d: 'un toucher vaut 25 % de la production, 10 par seconde', e: { clicPart: 0.25, auto: 10 } },
    { id: 'N1', b: 'nexus', n: 'Présence', ic: '◍', L: 6, c: cond('heures', 10, 'heures dans les ploxions'), d: 'tes heures dans les ploxions multiplient la production', e: { heureDiv: 50 } },
    { id: 'N2', b: 'nexus', n: 'Xerion', ic: '✧', L: 12, r: 'N1', c: cond('heures', 50, 'heures'), d: 'tout ×5', e: { global: 5 } },
    { id: 'N3', b: 'nexus', n: 'Le Nexus', ic: '⬢', L: 23, r: 'N2', c: cond('heuresNexus', 1, 'heure dans le Nexus'), d: 'tes heures pèsent 5× plus', e: { heureDiv: 10 } },
    { id: 'N4', b: 'nexus', n: 'Minecraft éternel', ic: '▦', L: 45, r: 'N3', c: cond('heuresNexus', 10, 'heures dans le Nexus'), d: 'le temps du Nexus compte ×1000 pour la fin Minecraft, et tout ×100', e: { nexusMult: 1000, global: 100 } },
    { id: 'X1', b: 'dim', n: 'Plongeon', ic: '∞', dims: 1, c: cond('dims', 1, 'dimension'), d: 'les dimensions pèsent plus : ×(1+d)² → ×(1+d)^2,5', e: { dimExp: 2.5 } },
    { id: 'X2', b: 'dim', n: 'Profondeur', ic: '⧜', dims: 3, r: 'X1', c: cond('dims', 4, 'dimensions'), d: 'les plongeons rapportent ×2 dimensions', e: { gainDim: 2 } },
    { id: 'X3', b: 'dim', n: 'Multivers', ic: '⧝', dims: 6, r: 'X2', c: cond('imports', 1, 'clicker importé'), d: 'les clickers importés comptent ×3', e: { clickersMult: 3 } },
    { id: 'X4', b: 'dim', n: 'Hyperdimension', ic: '✺', dims: 15, r: 'X3', c: cond('dims', 20, 'dimensions'), d: 'les dimensions pèsent encore plus : ×(1+d)³', e: { dimExp: 3 } },
    // (16.10, RS-7 : « l'arbre se termine trop vite, pas assez de features ») — quatre étages de plus par branche, et trois branches
    // (modules, voies, journal). globalL = un multiplicateur en exposant (×10^x), pour tenir aux échelles de 10^300 et au-delà.
    { id: 'D5', b: 'dec', n: 'Cartes du Nexus', ic: '⌘', L: 80, r: 'D4', c: cond('decouverts', 420, 'ploxions découverts'), d: 'tout ×10^5', e: { globalL: 5 } },
    { id: 'D6', b: 'dec', n: 'Atlas', ic: '⊛', L: 150, r: 'D5', c: cond('decouverts', 480, 'ploxions découverts'), d: 'chaque découverte pèse 10× plus', e: { decCoef: 15 } },
    { id: 'D7', b: 'dec', n: 'Le regard total', ic: '◉', L: 300, r: 'D6', c: cond('decouverts', 540, 'ploxions découverts'), d: 'tout ×10^20', e: { globalL: 20 } },
    { id: 'D8', b: 'dec', n: 'Plus rien d\'inconnu', ic: '⦾', L: 600, r: 'D7', c: cond('decouverts', 590, 'ploxions découverts'), d: 'tout ×10^50', e: { globalL: 50 } },
    { id: 'T5', b: 'tsoin', n: 'Le montage', ic: '⧖', L: 80, r: 'T4', c: cond('tsoins', 1000, 'tsoins'), d: 'tes tsoins pèsent 5× plus', e: { tsoinDiv: 10 } },
    { id: 'T6', b: 'tsoin', n: 'Le rejeu', ic: '⟲', L: 150, r: 'T5', c: cond('tsoins', 2500, 'tsoins'), d: 'tout ×10^8', e: { globalL: 8 } },
    { id: 'T7', b: 'tsoin', n: 'Les instants choisis', ic: '⧗', L: 300, r: 'T6', c: cond('tsoins', 5000, 'tsoins'), d: 'tout ×10^20', e: { globalL: 20 } },
    { id: 'T8', b: 'tsoin', n: 'La machine à tsoins', ic: '⌛', L: 600, r: 'T7', c: cond('tsoins', 10000, 'tsoins'), d: 'tout ×10^50', e: { globalL: 50 } },
    { id: 'B5', b: 'bion', n: 'Usine', ic: '⚙', L: 80, r: 'B4', c: cond('possedes', 20000, 'générateurs'), d: 'les prix montent encore moins (×1,07)', e: { croissance: 1.07 } },
    { id: 'B6', b: 'bion', n: 'Chaîne', ic: '⛓', L: 150, r: 'B5', c: cond('possedes', 50000, 'générateurs'), d: 'tout ×10^8', e: { globalL: 8 } },
    { id: 'B7', b: 'bion', n: 'Réplicateurs', ic: '⧉', L: 300, r: 'B6', c: cond('possedes', 100000, 'générateurs'), d: 'les prix montent à peine (×1,04)', e: { croissance: 1.04 } },
    { id: 'B8', b: 'bion', n: 'Von Neumann', ic: '✺', L: 600, r: 'B7', c: cond('possedes', 200000, 'générateurs'), d: 'tout ×10^50', e: { globalL: 50 } },
    { id: 'C5', b: 'clic', n: 'Le réflexe', ic: '⌖', L: 80, r: 'C4', c: cond('clics', 50000, 'touchers'), d: '30 touchers par seconde', e: { auto: 30 } },
    { id: 'C6', b: 'clic', n: 'La main sûre', ic: '✋', L: 150, r: 'C5', c: cond('clics', 100000, 'touchers'), d: 'un toucher vaut toute la production', e: { clicPart: 1 } },
    { id: 'C7', b: 'clic', n: 'Le tambour', ic: '◎', L: 300, r: 'C6', c: cond('clics', 250000, 'touchers'), d: '100 touchers par seconde', e: { auto: 100 } },
    { id: 'C8', b: 'clic', n: 'Le geste du Cube', ic: '◈', L: 600, r: 'C7', c: cond('clics', 1000000, 'touchers'), d: 'tout ×10^50', e: { globalL: 50 } },
    { id: 'N5', b: 'nexus', n: 'Résident', ic: '⌂', L: 80, r: 'N4', c: cond('heures', 100, 'heures'), d: 'tes heures pèsent 10× plus', e: { heureDiv: 1 } },
    { id: 'N6', b: 'nexus', n: 'Habitant', ic: '⬡', L: 150, r: 'N5', c: cond('heures', 250, 'heures'), d: 'tout ×10^8', e: { globalL: 8 } },
    { id: 'N7', b: 'nexus', n: 'Pilier', ic: '⬢', L: 300, r: 'N6', c: cond('heures', 500, 'heures'), d: 'tout ×10^20', e: { globalL: 20 } },
    { id: 'N8', b: 'nexus', n: 'Le Nexus, c\'est toi', ic: '✧', L: 600, r: 'N7', c: cond('heures', 1000, 'heures'), d: 'tout ×10^50', e: { globalL: 50 } },
    { id: 'X5', b: 'dim', n: 'Pli', ic: '⧜', dims: 1e3, r: 'X4', c: cond('dims', 1e3, 'dimensions'), d: 'tout ×10^10', e: { globalL: 10 } },
    { id: 'X6', b: 'dim', n: 'Repli', ic: '⧝', dims: 1e6, r: 'X5', c: cond('dims', 1e6, 'dimensions'), d: 'tout ×10^25', e: { globalL: 25 } },
    { id: 'X7', b: 'dim', n: 'L\'origami', ic: '✴', dims: 1e12, r: 'X6', c: cond('dims', 1e12, 'dimensions'), d: 'tout ×10^60', e: { globalL: 60 } },
    { id: 'X8', b: 'dim', n: 'Le cube de l\'infini', ic: '∞', dims: 1e24, r: 'X7', c: cond('dims', 1e24, 'dimensions'), d: 'tout ×10^150', e: { globalL: 150 } },
    // ◫ modules
    { id: 'M1', b: 'mod', n: 'Terreau', ic: '⸙', L: 45, c: cond('recoltes', 10, 'récoltes'), d: 'xerfarm : 3 parcelles de plus', e: { parcelles: 3 } },
    { id: 'M2', b: 'mod', n: 'Logistique', ic: '⏣', L: 60, r: 'M1', c: cond('pieces', 10, 'pièces'), d: 'xerbot : expéditions 2× plus rapides', e: { expVite: 2 } },
    { id: 'M3', b: 'mod', n: 'Serre', ic: '❀', L: 90, r: 'M2', c: cond('recoltes', 200, 'récoltes'), d: 'xerfarm : ça pousse 2× plus vite', e: { fermeVite: 2 } },
    { id: 'M4', b: 'mod', n: 'Mémoire longue', ic: '⌬', L: 140, r: 'M3', c: cond('xerax', 6, 'record xerax'), d: 'xerax : le record pèse 2× plus', e: { xeraxMult: 2 } },
    { id: 'M5', b: 'mod', n: 'Flotte', ic: '⚙', L: 220, r: 'M4', c: cond('autos', 2, 'automates'), d: 'tous les modules permanents ×2 (en exposant)', e: { modMult: 2 } },
    { id: 'M6', b: 'mod', n: 'Usine du réel', ic: '⟠', L: 400, r: 'M5', c: cond('implants', 20, 'implants'), d: 'tout ×10^40', e: { globalL: 40 } },
    // ✦ voies
    { id: 'R1', b: 'rs', n: 'Initié', ic: '✦', L: 45, c: cond('voiesNiv', 10, 'niveaux de voie'), d: 'les voies pèsent plus : ×(1+m)^2,5', e: { voieExp: 2.5 } },
    { id: 'R2', b: 'rs', n: 'Adepte', ic: '✧', L: 70, r: 'R1', c: cond('voiesNiv', 20, 'niveaux de voie'), d: 'tout ×10^6', e: { globalL: 6 } },
    { id: 'R3', b: 'rs', n: 'Maître', ic: '✶', L: 110, r: 'R2', c: cond('voiesNiv', 30, 'niveaux de voie'), d: 'les voies : ×(1+m)^3', e: { voieExp: 3 } },
    { id: 'R4', b: 'rs', n: 'Archonte', ic: '✷', L: 180, r: 'R3', c: cond('voiesNiv', 40, 'niveaux de voie'), d: 'tout ×10^15', e: { globalL: 15 } },
    { id: 'R5', b: 'rs', n: 'Reality scientist', ic: '✹', L: 300, r: 'R4', c: cond('voiesNiv', 50, 'niveaux de voie'), d: 'les voies : ×(1+m)^4', e: { voieExp: 4 } },
    { id: 'R6', b: 'rs', n: 'Rational self', ic: '❂', L: 500, r: 'R5', c: cond('voiesNiv', 60, 'niveaux de voie'), d: 'tout ×10^40', e: { globalL: 40 } },
    // ⧉ journal
    { id: 'J1', b: 'lore', n: 'Lecteur', ic: '⧉', L: 42, c: cond('lore', 5, 'fragments'), d: 'chaque fragment du journal ×10', e: { loreL: 1 } },
    { id: 'J2', b: 'lore', n: 'Archiviste', ic: '▤', L: 65, r: 'J1', c: cond('lore', 12, 'fragments'), d: 'tout ×10^5', e: { globalL: 5 } },
    { id: 'J3', b: 'lore', n: 'Chroniqueur', ic: '✎', L: 100, r: 'J2', c: cond('lore', 20, 'fragments'), d: 'chaque fragment ×100', e: { loreL: 2 } },
    { id: 'J4', b: 'lore', n: 'La fondation', ic: '◇', L: 170, r: 'J3', c: cond('sceaux', 25, 'sceaux'), d: 'chaque sceau ×10 de plus', e: { sceauL: 1 } },
    { id: 'J5', b: 'lore', n: 'Le récit', ic: '❦', L: 280, r: 'J4', c: cond('lore', 40, 'fragments'), d: 'chaque fragment ×1000', e: { loreL: 3 } },
    { id: 'J6', b: 'lore', n: 'Toute l\'histoire', ic: '✺', L: 480, r: 'J5', c: cond('transmissions', 22, 'transmissions'), d: 'tout ×10^40', e: { globalL: 40 } },
  ];
  /** les effets de l'arbre acquis (les plus forts gagnent ; les multiplicateurs se cumulent) */
  function effets(st) {
    var E = { decCoef: 0, catMult: 1, tsoinDiv: Infinity, heureDiv: Infinity, croissance: 1.15, clicPart: 0.03, clicMult: 1, auto: 0, absenceCap: 30, absenceMult: 1,
      global: 1, gen: {}, synergie: false, dimExp: 2, gainDim: 1, clickersMult: 1, nexusMult: 1,
      globalL: 0, parcelles: 0, expVite: 1, fermeVite: 1, xeraxMult: 1, modMult: 1, voieExp: 2, loreL: 0, sceauL: 0 };
    ARBRE.forEach(function (n) { if (!(st.tech || {})[n.id]) return; var e = n.e;
      if (e.decCoef) E.decCoef = Math.max(E.decCoef, e.decCoef); if (e.catMult) E.catMult = Math.max(E.catMult, e.catMult);
      if (e.tsoinDiv) E.tsoinDiv = Math.min(E.tsoinDiv, e.tsoinDiv); if (e.heureDiv) E.heureDiv = Math.min(E.heureDiv, e.heureDiv);
      if (e.croissance) E.croissance = Math.min(E.croissance, e.croissance); if (e.clicPart) E.clicPart = Math.max(E.clicPart, e.clicPart);
      if (e.clicMult) E.clicMult *= e.clicMult; if (e.auto) E.auto = Math.max(E.auto, e.auto);
      if (e.absenceCap) E.absenceCap = Math.max(E.absenceCap, e.absenceCap); if (e.absenceMult) E.absenceMult = Math.max(E.absenceMult, e.absenceMult);
      if (e.global) E.global *= e.global; if (e.gen) for (var g in e.gen) E.gen[g] = (E.gen[g] || 1) * e.gen[g];
      if (e.synergie) E.synergie = true; if (e.dimExp) E.dimExp = Math.max(E.dimExp, e.dimExp);
      if (e.gainDim) E.gainDim = Math.max(E.gainDim, e.gainDim); if (e.clickersMult) E.clickersMult = Math.max(E.clickersMult, e.clickersMult); if (e.nexusMult) E.nexusMult = Math.max(E.nexusMult, e.nexusMult);
      if (e.globalL) E.globalL += e.globalL; if (e.parcelles) E.parcelles += e.parcelles; if (e.expVite) E.expVite = Math.max(E.expVite, e.expVite); if (e.fermeVite) E.fermeVite = Math.max(E.fermeVite, e.fermeVite);
      if (e.xeraxMult) E.xeraxMult = Math.max(E.xeraxMult, e.xeraxMult); if (e.modMult) E.modMult = Math.max(E.modMult, e.modMult); if (e.voieExp) E.voieExp = Math.max(E.voieExp, e.voieExp);
      if (e.loreL) E.loreL = Math.max(E.loreL, e.loreL); if (e.sceauL) E.sceauL = Math.max(E.sceauL, e.sceauL); });
    return E;
  }
  function possedes(st) { var n = 0; GENS.forEach(function (g) { n += st.owned[g.id] || 0; }); return n; }
  /** la valeur réelle d'une condition (le contexte du xerboxion + l'état du jeu) */
  function valeurCond(ctx, st, cle) {
    if (cle === 'categoriesFinies') return (ctx.categories || []).filter(function (c) { return c.total > 0 && c.fait >= c.total; }).length;
    if (cle === 'possedes') return possedes(st); if (cle === 'clics') return st.clics || 0; if (cle === 'dims') return st.dims || 0;
    if (cle === 'imports') return (st.imports || []).length;
    var k = st.clickion || {};
    if (cle === 'recoltes') return k.recoltes || 0; if (cle === 'pieces') return k.pieces || 0; if (cle === 'xerax') return (k.xerax && k.xerax.record) || 0;
    if (cle === 'autos') return Object.keys(k.autos || {}).length; if (cle === 'implants') return nbImplants(k); if (cle === 'lore') return (k.lore || []).length;
    if (cle === 'sceaux') return k.sceaux || 0; if (cle === 'transmissions') return (k.ouverts || []).filter(function (x) { return JOURNAL[x]; }).length;
    if (cle === 'voiesNiv') return voiesEtat(st).reduce(function (a, v) { return a + (v.on ? v.niv : 0); }, 0);
    return +ctx[cle] || 0;
  }
  /** l'état d'un nœud : acquis · dispo (tout est réuni) · cher (condition OK, pas assez) · verrou (condition ou nœud parent manquant) */
  function techEtat(ctx, st, n) {
    if ((st.tech || {})[n.id]) return 'acquis';
    if (n.r && !(st.tech || {})[n.r]) return 'verrou';
    if (valeurCond(ctx, st, n.c.cle) < n.c.n) return 'verrou';
    var peut = n.dims != null ? (st.dims || 0) >= n.dims : (st.L != null && st.L >= n.L);
    return peut ? 'dispo' : 'cher';
  }
  function acheterTech(ctx, st, id) {
    var n = ARBRE.filter(function (x) { return x.id === id; })[0]; if (!n || techEtat(ctx, st, n) !== 'dispo') return false;
    if (n.dims != null) st.dims -= n.dims; else st.L = subL(st.L, n.L);
    st.tech = st.tech || {}; st.tech[id] = Date.now(); return true;
  }

  // ---- (v3) LES AMÉLIORATIONS : 5 doublements par générateur, dès 1 / 10 / 50 / 100 / 200 possédés ----
  var SEUILS_UPG = [1, 10, 50, 100, 200], NOMS_UPG = ['affûté', 'renforcé', 'tissé', 'fusionné', 'transcendé'];
  var UPG = []; GENS.forEach(function (g, i) { SEUILS_UPG.forEach(function (n, k) { UPG.push({ id: g.id + '-' + k, g: g.id, gi: i, n: g.n + ' ' + NOMS_UPG[k], ic: g.ic, seuil: n, L: Math.log10(g.cost) + 1 + k * 1.6 + (k > 2 ? 1 : 0), d: g.n + ' ×2 (dès ' + n + ')' }); }); });
  function upgEtat(st, u) { if ((st.upg || {})[u.id]) return 'acquis'; if ((st.owned[u.g] || 0) < u.seuil) return 'verrou'; return st.L != null && st.L >= u.L ? 'dispo' : 'cher'; }
  function acheterUpg(st, id) { var u = UPG.filter(function (x) { return x.id === id; })[0]; if (!u || upgEtat(st, u) !== 'dispo') return false; st.L = subL(st.L, u.L); st.upg = st.upg || {}; st.upg[id] = Date.now(); return true; }
  function upgGen(st, gid) { var n = 0; for (var k in (st.upg || {})) if (k.indexOf(gid + '-') === 0) n++; return n; }

  // ---- (v3) LES SUCCÈS : chacun +3 % de production ----
  var SUCCES = [];
  [[3, 'Mille'], [6, 'Un million'], [9, 'Un milliard'], [12, 'Mille milliards'], [15, 'Le billiard'], [20, '10^20'], [30, '10^30'], [50, '10^50'], [100, 'Un googol'], [303, 'Le centillion']].forEach(function (x) { SUCCES.push({ id: 'L' + x[0], ic: '✦', n: x[1], d: 'atteindre 10^' + x[0], t: function (c, s) { return s.stats.meilleur != null && s.stats.meilleur >= x[0]; } }); });
  GENS.forEach(function (g) { [[50, 'bâtisseur'], [200, 'maître']].forEach(function (x) { SUCCES.push({ id: 'G' + g.id + x[0], ic: g.ic, n: g.n + ' ' + x[1], d: x[0] + ' ' + g.n, t: function (c, s) { return (s.owned[g.id] || 0) >= x[0]; } }); }); });
  [[100, 'Le doigt'], [1000, 'La main'], [10000, 'Le bras'], [100000, 'Le geste éternel']].forEach(function (x) { SUCCES.push({ id: 'C' + x[0], ic: '⌖', n: x[1], d: x[0] + ' touchers', t: function (c, s) { return (s.clics || 0) >= x[0]; } }); });
  [[1, 'Première pousse'], [6, 'Jardinier'], [12, 'Arboriste'], [24, 'L\'arbre entier']].forEach(function (x) { SUCCES.push({ id: 'T' + x[0], ic: '⟡', n: x[1], d: x[0] + ' nœud(s) de l\'arbre', t: function (c, s) { return Object.keys(s.tech || {}).length >= x[0]; } }); });
  [[1, 'Premier plongeon'], [10, 'Plongeur'], [100, 'Abyssal'], [1000, 'Hors du temps']].forEach(function (x) { SUCCES.push({ id: 'X' + x[0], ic: '∞', n: x[1], d: x[0] + ' dimension(s)', t: function (c, s) { return (s.dims || 0) >= x[0]; } }); });
  [[50, 'Curieux'], [100, 'Explorateur du réel'], [200, 'Cartographe du réel'], [400, 'Presque tout'], [537, 'Tout le xerboxion']].forEach(function (x) { SUCCES.push({ id: 'D' + x[0], ic: '◌', n: x[1], d: x[0] + ' ploxions vraiment découverts', t: function (c) { return (c.decouverts || 0) >= x[0]; } }); });
  [[50, 'Tsoineur'], [500, 'Machine humaine'], [5000, 'Le tsoin engine, c\'est toi']].forEach(function (x) { SUCCES.push({ id: 'S' + x[0], ic: '⧗', n: x[1], d: x[0] + ' tsoins réels', t: function (c) { return (c.tsoins || 0) >= x[0]; } }); });
  [[1, 'Passeur'], [3, 'Multivers']].forEach(function (x) { SUCCES.push({ id: 'I' + x[0], ic: '⇄', n: x[1], d: x[0] + ' clicker(s) importé(s)', t: function (c, s) { return (s.imports || []).length >= x[0]; } }); });
  [[1, 'Éclat'], [10, 'Chasseur d\'éclats'], [100, 'Pluie d\'or']].forEach(function (x) { SUCCES.push({ id: 'E' + x[0], ic: '✸', n: x[1], d: x[0] + ' éclat(s) attrapé(s)', t: function (c, s) { return (s.stats.eclats || 0) >= x[0]; } }); });
  [[1, 'Bon jour'], [7, 'Une semaine'], [30, 'Rituel']].forEach(function (x) { SUCCES.push({ id: 'Q' + x[0], ic: '☼', n: x[1], d: x[0] + ' quête(s) du jour accomplie(s)', t: function (c, s) { return (s.stats.quetes || 0) >= x[0]; } }); });
  // (16.10, RS-7 : « pas assez de succès ») — Clickion, modules, lore, voies, et plus loin dans les nombres
  function ck(s) { return s.clickion || {}; }
  [[500, 'Au-delà du googol'], [1000, '10^1000'], [2000, '10^2000'], [5000, '10^5000'], [10000, '10^10000']].forEach(function (x) { SUCCES.push({ id: 'L' + x[0], ic: '✦', n: x[1], d: '10^' + x[0], t: function (c, s) { return s.L != null && s.L >= x[0]; } }); });
  [[1e6, 'Million de plis'], [1e12, 'Billion de plis'], [1e24, 'Quadrillion de plis'], [1e48, 'Plié à l\'infini'], [1e100, 'Un googol de plis']].forEach(function (x, i) { SUCCES.push({ id: 'XX' + i, ic: '∞', n: x[1], d: fmtL(Math.log10(x[0])) + ' dimensions', t: function (c, s) { return (s.dims || 0) >= x[0]; } }); });
  [[10, 'Apnée'], [50, 'Plongeur des abysses'], [100, 'Cent plongeons'], [500, 'Le fond n\'existe pas']].forEach(function (x) { SUCCES.push({ id: 'P' + x[0], ic: '⤓', n: x[1], d: x[0] + ' plongeons', t: function (c, s) { return (s.stats.plongeons || 0) >= x[0]; } }); });
  [[1e6, 'Le million de gestes']].forEach(function (x) { SUCCES.push({ id: 'C' + x[0], ic: '⌖', n: x[1], d: '1 M touchers', t: function (c, s) { return (s.clics || 0) >= x[0]; } }); });
  [[1000, 'Ruée vers l\'or']].forEach(function (x) { SUCCES.push({ id: 'E' + x[0], ic: '✸', n: x[1], d: x[0] + ' éclats', t: function (c, s) { return (s.stats.eclats || 0) >= x[0]; } }); });
  [[36, 'Arbre touffu'], [50, 'Forêt'], [70, 'Tout l\'arbre']].forEach(function (x) { SUCCES.push({ id: 'T' + x[0], ic: '⟡', n: x[1], d: x[0] + ' nœuds', t: function (c, s) { return Object.keys(s.tech || {}).length >= x[0]; } }); });
  [[100, 'Saison'], [365, 'Une année de rituels']].forEach(function (x) { SUCCES.push({ id: 'Q' + x[0], ic: '☼', n: x[1], d: x[0] + ' quêtes', t: function (c, s) { return (s.stats.quetes || 0) >= x[0]; } }); });
  [[36000, 'Dix heures de jeu'], [360000, 'Cent heures'], [3600000, 'Mille heures']].forEach(function (x) { SUCCES.push({ id: 'J' + x[0], ic: '◷', n: x[1], d: Math.round(x[0] / 3600) + ' h dans le jeu', t: function (c, s) { return (s.stats.jeu || 0) >= x[0]; } }); });
  [[1, 'Signal'], [5, 'Fréquence'], [11, 'Moitié du récit'], [22, 'Toutes les transmissions']].forEach(function (x) { SUCCES.push({ id: 'TR' + x[0], ic: '⧉', n: x[1], d: x[0] + ' transmission(s)', t: function (c, s) { return (ck(s).ouverts || []).filter(function (o) { return JOURNAL[o]; }).length >= x[0]; } }); });
  [[10, 'Carnet'], [25, 'Archives'], [47, 'Tout le journal']].forEach(function (x) { SUCCES.push({ id: 'LO' + x[0], ic: '▤', n: x[1], d: x[0] + ' fragments', t: function (c, s) { return (ck(s).lore || []).length >= x[0]; } }); });
  [[5, 'Attesté'], [10, 'Scellé'], [20, 'Registre'], [40, 'La fondation te connaît'], [70, 'Tout est vrai']].forEach(function (x) { SUCCES.push({ id: 'SC' + x[0], ic: '◇', n: x[1], d: x[0] + ' sceaux', t: function (c, s) { return (ck(s).sceaux || 0) >= x[0]; } }); });
  [[1, 'Une voie'], [2, 'Deux voies']].forEach(function (x) { SUCCES.push({ id: 'VO' + x[0], ic: '✦', n: x[1], d: x[0] + ' voie(s) RS', t: function (c, s) { return (ck(s).voies || []).length >= x[0] || !!ck(s).xo; } }); });
  SUCCES.push({ id: 'XO', ic: '◆', n: 'Xeroction', d: 'toutes les voies, ton boxion', t: function (c, s) { return !!ck(s).xo; } });
  [[1, 'Pousse'], [100, 'Potager'], [1000, 'Ferme'], [10000, 'Xerfarm']].forEach(function (x) { SUCCES.push({ id: 'FE' + x[0], ic: '⸙', n: x[1], d: x[0] + ' récoltes', t: function (c, s) { return (ck(s).recoltes || 0) >= x[0]; } }); });
  [[1, 'Retour'], [100, 'Butin'], [1000, 'Trésor'], [10000, 'Flotte de xerbos']].forEach(function (x) { SUCCES.push({ id: 'XB' + x[0], ic: '⏣', n: x[1], d: x[0] + ' pièces', t: function (c, s) { return (ck(s).pieces || 0) >= x[0]; } }); });
  [[3, 'Un mot'], [5, 'Une phrase'], [8, 'Un paragraphe'], [12, 'Mémoire xerax'], [16, 'Mémoire absolue']].forEach(function (x) { SUCCES.push({ id: 'XM' + x[0], ic: '⌬', n: x[1], d: 'record xerax ' + x[0], t: function (c, s) { return ((ck(s).xerax && ck(s).xerax.record) || 0) >= x[0]; } }); });
  [[1, 'Greffe'], [10, 'Augmenté'], [30, 'Universal-suit'], [60, 'Plus humain qu\'humain']].forEach(function (x) { SUCCES.push({ id: 'IM' + x[0], ic: '⟠', n: x[1], d: x[0] + ' implants', t: function (c, s) { return nbImplants(ck(s)) >= x[0]; } }); });
  [[1, 'Premier automate'], [3, 'Flotte'], [6, 'Tout tourne seul']].forEach(function (x) { SUCCES.push({ id: 'AU' + x[0], ic: '⚙', n: x[1], d: x[0] + ' automate(s)', t: function (c, s) { return Object.keys(ck(s).autos || {}).length >= x[0]; } }); });
  [[3, 'Saut'], [10, 'Bond'], [25, 'Wormion']].forEach(function (x) { SUCCES.push({ id: 'WO' + x[0], ic: '◎', n: x[1], d: 'combo ' + x[0], t: function (c, s) { return ((ck(s).saut && ck(s).saut.combo) || 0) >= x[0]; } }); });
  [[1, 'Tempo'], [10, 'Métronome'], [50, 'Le temps est à toi']].forEach(function (x) { SUCCES.push({ id: 'RY' + x[0], ic: '⧗', n: x[1], d: x[0] + ' parties de rythme', t: function (c, s) { return (ck(s).rythmeN || 0) >= x[0]; } }); });
  [[1e7, 'Ça calcule'], [1e8, 'Ça chauffe'], [1e9, 'Un milliard d\'op/s']].forEach(function (x, i) { SUCCES.push({ id: 'CA' + i, ic: '⚙', n: x[1], d: fmtL(Math.log10(x[0])) + ' op/s', t: function (c, s) { return ((ck(s).calcul && ck(s).calcul.record) || 0) >= x[0]; } }); });
  [[10, 'En marche'], [50, 'En route'], [120, 'Autoroute'], [300, 'Grande vitesse'], [900, 'En vol']].forEach(function (x) { SUCCES.push({ id: 'EL' + x[0], ic: '➚', n: x[1], d: x[0] + ' km/h', t: function (c, s) { return ((ck(s).elan && ck(s).elan.kmh) || 0) >= x[0]; } }); });
  [[10, 'Initié'], [30, 'Maître des voies'], [60, 'Reality scientist']].forEach(function (x) { SUCCES.push({ id: 'VN' + x[0], ic: '✧', n: x[1], d: x[0] + ' niveaux de voie', t: function (c, s) { return valeurCond(c, s, 'voiesNiv') >= x[0]; } }); });
  [[1, 'Premier voyage'], [3, 'Voyageur'], [5, 'Nomade'], [7, 'Tous les univers']].forEach(function (x) { SUCCES.push({ id: 'UV' + x[0], ic: '◎', n: x[1], d: x[0] + ' univers visité(s)', t: function (c, s) { return (ck(s).visites || []).length >= x[0]; } }); });
  [[3600, 'Une heure ailleurs'], [36000, 'Dix heures ailleurs']].forEach(function (x) { SUCCES.push({ id: 'UT' + x[0], ic: '◎', n: x[1], d: Math.round(x[0] / 3600) + ' h hors du Réel', t: function (c, s) { var T = ck(s).uniT || {}, n = 0; for (var i in T) if (i !== 'reel') n += T[i]; return n >= x[0]; } }); });
  function nbArtefacts(s) { var c = ck(s).coll || {}; return ARTEFACTS.filter(function (a) { return c[a.id] > 0; }).length; }
  [[1, 'Trouvaille'], [6, 'Collectionneur'], [18, 'Cabinet de curiosités'], [36, 'Toute la collection']].forEach(function (x) { SUCCES.push({ id: 'AR' + x[0], ic: '◆', n: x[1], d: x[0] + ' artefact(s)', t: function (c, s) { return nbArtefacts(s) >= x[0]; } }); });
  SUCCES.push({ id: 'ARU', ic: '∞', n: 'Unique', d: 'un artefact unique', t: function (c, s) { var cc = ck(s).coll || {}; return ARTEFACTS.some(function (a) { return a.r === 3 && cc[a.id] > 0; }); } });
  [[1, 'Contractuel'], [10, 'Agent de la fondation'], [50, 'Pilier de la fondation']].forEach(function (x) { SUCCES.push({ id: 'CO' + x[0], ic: '◇', n: x[1], d: x[0] + ' contrat(s)', t: function (c, s) { return (ck(s).contratsN || 0) >= x[0]; } }); });
  [[1, 'À l\'écoute'], [10, 'Fréquence de Rosa'], [50, 'Elle te connaît']].forEach(function (x) { SUCCES.push({ id: 'SI' + x[0], ic: 'ϟ', n: x[1], d: x[0] + ' signal(aux)', t: function (c, s) { return (ck(s).signauxN || 0) >= x[0]; } }); });
  function nouveauxSucces(ctx, st) { var out = []; st.succes = st.succes || {}; SUCCES.forEach(function (x) { if (!st.succes[x.id] && x.t(ctx, st)) { st.succes[x.id] = Date.now(); out.push(x); } }); return out; }

  // ---- (v3) LES BOOSTS (éclats dorés, quêtes du jour) : { k: 'prod'|'clic', m: log10 du multiplicateur, fin } ----
  function boostL(st, k, maintenant) { var t = maintenant || Date.now(), L = 0; (st.boosts || []).forEach(function (b) { if (b.k === k && b.fin > t) L += b.m; }); return L; }
  var ECLATS = [
    { id: 'frenesie', n: 'Frénésie', ic: 'ϟ', d: 'production ×7 pendant 30 s' },
    { id: 'chance', n: 'Chance', ic: '✸', d: '15 minutes de production, tout de suite' },
    { id: 'pluie', n: 'Pluie de touchers', ic: '✶', d: 'chaque toucher ×77 pendant 13 s' },
  ];
  function eclat(ctx, st, id, maintenant) {
    var t = maintenant || Date.now(), e = ECLATS.filter(function (x) { return x.id === id; })[0] || ECLATS[0], gain = null;
    st.boosts = (st.boosts || []).filter(function (b) { return b.fin > t; });
    if (e.id === 'frenesie') st.boosts.push({ k: 'prod', m: Math.log10(7), fin: t + 30000, n: e.n });
    if (e.id === 'pluie') st.boosts.push({ k: 'clic', m: Math.log10(77), fin: t + 13000, n: e.n });
    if (e.id === 'chance') { var p = production(ctx, st).L; gain = p == null ? 2 : p + Math.log10(900); gagner(st, gain); }
    st.stats.eclats = (st.stats.eclats || 0) + 1; return { e: e, gain: gain };
  }
  // ---- (v3) LES QUÊTES DU JOUR : 3 par jour, tirées du jour, mesurées dans le VRAI xerboxion (ctx.jour) ----
  var QUETES = [
    { id: 'ouvrir', n: 'Ouvre 5 ploxions', ic: '◇', cle: 'opens', n2: 5 },
    { id: 'temps', n: 'Passe 20 minutes dans le xerboxion', ic: '◍', cle: 'minutes', n2: 20 },
    { id: 'tsoins', n: 'Fais 3 tsoins', ic: '⧗', cle: 'tsoins', n2: 3 },
    { id: 'nouveau', n: 'Découvre un ploxion jamais ouvert', ic: '◌', cle: 'nouveaux', n2: 1 },
    { id: 'toucher', n: 'Touche le cœur 200 fois', ic: '⌖', cle: 'clics', n2: 200 },
    { id: 'divers', n: 'Ouvre 3 ploxions de catégories différentes', ic: '◈', cle: 'categories', n2: 3 },
  ];
  function quetesDuJour(jour) { var h = 0; for (var i = 0; i < jour.length; i++) h = (h * 31 + jour.charCodeAt(i)) >>> 0; var pool = QUETES.slice(), out = []; while (out.length < 3) { var k = h % pool.length; out.push(pool.splice(k, 1)[0]); h = Math.floor(h / 7) + 13; } return out; }
  function etatQuetes(ctx, st, jour) {
    if (!st.quetes || st.quetes.jour !== jour) st.quetes = { jour: jour, faites: {}, clics0: st.clics || 0 };
    var J = Object.assign({}, ctx.jour || {}, { clics: (st.clics || 0) - (st.quetes.clics0 || 0) });
    return quetesDuJour(jour).map(function (q) { var v = +J[q.cle] || 0; return { q: q, v: Math.min(v, q.n2), fait: v >= q.n2, reclamee: !!st.quetes.faites[q.id] }; });
  }
  function reclamerQuete(ctx, st, jour, id, maintenant) {
    var e = etatQuetes(ctx, st, jour).filter(function (x) { return x.q.id === id; })[0]; if (!e || !e.fait || e.reclamee) return false;
    st.quetes.faites[id] = Date.now(); st.stats.quetes = (st.stats.quetes || 0) + 1;
    st.boosts = (st.boosts || []).filter(function (b) { return b.fin > (maintenant || Date.now()); }); st.boosts.push({ k: 'prod', m: Math.log10(3), fin: (maintenant || Date.now()) + 3600000, n: e.q.n });
    return true;
  }

  // ---- (v4, braindump 2026-10-14 « l'ultra tsoin du seption ») LES PALIERS DE RÉEL : pas 2D/3D, des paliers de réel ; le seption = le maximum ;
  // la conscience (entre 7ion et oction) = le chaos ; l'oction = l'âme — hors d'atteinte par l'infini (« il faut un autre truc que l'infini »)
  var REELS = [
    { id: '3ion', n: '3ion', d: 'le réel d\'où l\'on part', dims: 0 },
    { id: '4ion', n: '4ion', d: 'le premier palier au-delà', dims: 10 },
    { id: '5ion', n: '5ion', d: 'le réel s\'élargit', dims: 50 },
    { id: '6ion', n: '6ion', d: 'les abords du seption', dims: 200 },
    { id: 'seption', n: 'Seption', d: 'le maximum possible : tout ce qu\'on sait et peut faire', dims: 1000 },
    { id: 'conscience', n: 'Conscience', d: 'entre le 7ion et l\'oction : les abords du réel, le chaos', inatteignable: true },
    { id: 'oction', n: 'Oction', d: 'la dimension âme — l\'infini n\'y mène pas', inatteignable: true },
  ];
  function palierReel(st) { var k = 0; REELS.forEach(function (x, i) { if (!x.inatteignable && (st.dims || 0) >= x.dims) k = i; }); return k; }
  // ---- LES MISSIONS DU TERRAX : « le but du jeu, c'est que tout le monde m'aide à implémenter tout ça » — chacune envoie dans un VRAI atelier ----
  var MISSIONS = [
    { id: 'atelier', ic: '⚙', n: 'Ouvre l\'atelier', d: 'prends un ploxion, modifie-le, envoie le tsoin — c\'est le commit', px: ['atelier'] },
    { id: 'forge', ic: '⟁', n: 'Forge un ploxion', d: 'la forge : décris, génère', px: ['forge', 'mega-forge'] },
    { id: 'repoverse', ic: '⬢', n: 'Entre dans le RepoVerse', d: 'le Nexus des dépôts : contribuer', px: ['repoverse', 'rv-code', 'rv-chat'] },
    { id: 'chaoxion', ic: '◎', n: 'Ordonne le chaos', d: 'le chaoxion : ranger les idées en vrac', px: ['chaoxion'] },
    { id: 'bother', ic: '⁂', n: 'Propose une idée ou un bug', d: 'bother me : le chemin le plus court vers RS-7', px: ['bother'] },
    { id: 'xerax', ic: '⌬', n: 'Explore xerax', d: 'le terrain du cerveau', px: ['xerax'] },
    { id: 'tsoinmachine', ic: '⧗', n: 'Rejoue un tsoin', d: 'la machine à tsoins', px: ['machine-a-tsoins', 'tsoinmachine', 'tsoin-engine'] },
    { id: 'nexus', ic: '▦', n: 'Pose un bloc dans le Nexus', d: 'le monde Minecraft du xerboxion', px: ['nexus', 'minecraft-nexus'] },
    { id: 'code', ic: '⌥', n: 'Écris du code', d: 'Code : le premier pas d\'un rewrite, ultra optimisé ou vibe codé', px: ['code', 'vscode'] },
    { id: 'tsoinfini', ic: '∞', n: 'Pense au-delà du seption', d: 'tsoinfini : cordes, quantique, particules', px: ['tsoinfini'] },
  ];
  function missionsEtat(ctx, st) { var o = ctx.ouverts || {}; return MISSIONS.map(function (m) { var fait = m.px.some(function (id) { return o[id]; }); return { m: m, fait: fait, reclamee: !!(st.missions || {})[m.id] }; }); }
  function reclamerMission(ctx, st, id) { var e = missionsEtat(ctx, st).filter(function (x) { return x.m.id === id; })[0]; if (!e || !e.fait || e.reclamee) return false; st.missions = st.missions || {}; st.missions[id] = Date.now(); return true; }

  /** le contexte du vrai xerboxion : { decouverts, total, categories:[{l,i,fait,total}], tsoins, heures, heuresNexus } */
  function multiplicateurs(ctx, st) {
    var E = effets(st), D = ctx.decouverts || 0, cats = (ctx.categories || []).filter(function (c) { return c.total > 0 && c.fait >= c.total; }).length;
    var imp = 0; (st.imports || []).forEach(function (x) { if (x.L > 0) imp += Math.log10(1 + x.L); });
    return { decouverte: Math.log10(1 + D * E.decCoef / 20), categories: cats * Math.log10(E.catMult), tsoins: Math.log10(1 + (ctx.tsoins || 0) / E.tsoinDiv),
      heures: Math.log10(1 + (ctx.heures || 0) / E.heureDiv), clickers: imp * E.clickersMult, arbre: Math.log10(E.global) + E.globalL, univers: st.clickion ? (uMod(st).prodL || 0) + universL(st) : 0, artefacts: st.clickion ? artefactsL(st) : 0, lore: ((st.clickion && st.clickion.lore && st.clickion.lore.length) || 0) * (E.loreL + (st.clickion ? perk(st, 'etudiant') : 0)),
      // (v2.1) une dimension MULTIPLIE (×(1+d)^2), elle n'élève plus en puissance : la puissance faisait boule de neige (333 dimensions en 5 min)
      dimensions: Math.log10(1 + (st.dims || 0)) * E.dimExp,
      succes: Object.keys(st.succes || {}).length * Math.log10(1.03), boosts: boostL(st, 'prod'),
      reel: palierReel(st) * 2, missions: Object.keys(st.missions || {}).length * Math.log10(2),
      // (16.10) Clickion : chaque sceau (attesté par le serveur) ×1,25 ; le cœur de calcul (op/s mesurées) — améliorer le réel = plus de points
      sceaux: ((st.clickion && st.clickion.sceaux) || 0) * (Math.log10(1.25) + E.sceauL) * (st.clickion ? (uMod(st).sceauX || 1) : 1), calcul: st.clickion && st.clickion.calcul ? 2 * Math.log10(1 + (st.clickion.calcul.record || 0) / 1e7) : 0,
      ouverts: ((st.clickion && st.clickion.ouverts && st.clickion.ouverts.length) || 0) * Math.log10(2),
      voies: st.clickion ? (uMod(st).voieX || 1) * voiesEtat(st).reduce(function (a, v) { return a + (v.on ? v.L : 0); }, 0) : 0,
      modules: st.clickion ? (function (x) { return x.ferme + x.xerax + x.xerbot + x.implants; })(modulesL(st)) : 0 };
  }
  /** la part (log10) d'un générateur : nombre × taux × arbre × paliers de 50 (×2 chacun) × synergie avec le palier d'avant */
  function genL(st, g, E, i) {
    var n = st.owned[g.id] || 0; if (!(n > 0)) return null;
    var L = Math.log10(n * g.rate) + Math.log10(E.gen[g.id] || 1) + Math.log10(2) * Math.min(40, Math.floor(n / 50)) + Math.log10(2) * upgGen(st, g.id);
    if (E.synergie && i > 0) L += Math.log10(1 + (st.owned[GENS[i - 1].id] || 0) / 100);
    return L;
  }
  /** la production par seconde (log10) et son détail (parts par générateur) */
  function production(ctx, st) {
    var E = effets(st), m = multiplicateurs(ctx, st), base = null, parts = {};
    GENS.forEach(function (g, i) { var l = genL(st, g, E, i); parts[g.id] = l; base = addL(base, l); });
    if (base == null) return { L: null, m: m, parts: parts, base: null };
    var Lb = base + m.decouverte + m.categories + m.tsoins + m.heures + m.clickers + m.arbre + m.dimensions + m.succes + m.boosts + m.reel + m.missions + m.sceaux + m.calcul + m.ouverts + m.voies + m.modules + m.lore + m.univers + m.artefacts;
    return { L: Lb, m: m, parts: parts, base: base };
  }
  function clic(ctx, st) { var E = effets(st), p = production(ctx, st).L, bc = boostL(st, 'clic') + (st.clickion ? (uMod(st).clicL || 0) : 0); return bc + addL(Math.log10(1 + (ctx.decouverts || 0) / 20) + Math.log10(E.clicMult), p == null ? null : p + Math.log10(E.clicPart) + Math.log10(E.clicMult)); }
  // un générateur se débloque avec les ploxions découverts ET 15 du générateur d'avant (sinon, 434 découvertes ouvraient tout d'un coup)
  var AVANT = 15;
  function debloque(ctx, g, st) { var i = GENS.indexOf(g); if ((ctx.decouverts || 0) < g.dec) return false; if (g.dims && (!st || (st.dims || 0) < g.dims)) return false; if (i > 0 && st && (st.owned[GENS[i - 1].id] || 0) < AVANT) return false; return true; }
  /** le coût de n générateurs de plus (log10) ; la croissance vient de l'arbre */
  // en log10 de bout en bout : k^n dépassait 10^308 (Infinity) dès qu'on achetait « max » avec un gros compteur
  function coutL(g, possede, n, k) { k = k || 1.15; var lk = Math.log10(k), a = n * lk; var geo = a > 15 ? a - Math.log10(k - 1) : Math.log10((Math.pow(10, a) - 1) / (k - 1)); return Math.log10(g.cost) + possede * lk + geo; }
  function maxAchetable(g, possede, L, k) {
    k = k || 1.15; var lk = Math.log10(k); if (L == null) return 0; var x = L - Math.log10(g.cost) - possede * lk;
    var v = x > 15 ? x + Math.log10(k - 1) : Math.log10(1 + (k - 1) * Math.pow(10, x));
    return Math.max(0, Math.floor(v / lk + 1e-9));
  }
  function acheter(ctx, st, id, n) {
    var g = GENS.filter(function (x) { return x.id === id; })[0]; if (!g || !debloque(ctx, g, st)) return 0;
    var k = effets(st).croissance, o = st.owned[id] || 0; if (n === 'max') n = maxAchetable(g, o, st.L, k); n = Math.max(0, Math.floor(n)); if (!n) return 0;
    var c = coutL(g, o, n, k); if (st.L == null || c > st.L + 1e-12) return 0;
    st.L = subL(st.L, c); st.owned[id] = Math.min(o + n, 1e300); return n;
  }
  function gagner(st, L) { if (L == null || !isFinite(L)) return; st.L = addL(st.L, L); if (st.L != null && (st.Lrun == null || st.L > st.Lrun)) st.Lrun = st.L; if (st.stats && st.L != null && (st.stats.meilleur == null || st.L > st.stats.meilleur)) st.stats.meilleur = st.L; }
  /** le passif : au retour, le temps écoulé × la production (30 j, plus avec l'arbre) → le gain (log10) et la durée */
  function rattraper(ctx, st, maintenant) {
    var E = effets(st), t = +st.t || 0, dt = t > 0 ? Math.min(E.absenceCap * 86400, Math.max(0, (maintenant - t) / 1000)) : 0; st.t = maintenant;
    var p = production(ctx, st).L; if (p == null || dt < 1) return null;
    var g = p + Math.log10(dt) + Math.log10(E.absenceMult); gagner(st, g); return { s: dt, L: g };
  }
  // ---- les dimensions : plonger = tout recommencer, plus fort (la puissance de la production) ----
  // (v2) dès 10^15 seulement, et ça grandit lentement — l'arbre (∞ Profondeur) double le gain
  // (v2.1) exponentielle dans le meilleur compteur (comme les jeux de prestige) : 10^15 → 1, 10^25 → 10, 10^35 → 100 — il y a toujours un plongeon de plus
  // (16.10, RS-7 : « c'est si haut, il faut réfléchir pour aller plus loin pour pas que ça crash ») les dimensions sont un nombre JS :
  // au-delà de ~10^308 elles devenaient Infinity et cassaient toute la partie. Le gain se calcule en exposant, ralentit après 10^50
  // (log du log : la croissance passe aux couches qui sont déjà des exposants — arbre, modules, univers) et plafonne à 10^300.
  var DIMS_MAX = 1e300;
  function gainDimL(st) { var gL = (st.Lrun - 15) / 10 + Math.log10(effets(st).gainDim); return gL <= 50 ? gL : 50 + 20 * Math.log10(1 + (gL - 50) / 2); }
  function dimensionsAGagner(st) { if (st.Lrun == null || st.Lrun < 15) return 0; var gL = gainDimL(st); if (!isFinite(gL)) return 0; return Math.max(0, Math.min(DIMS_MAX - (st.dims || 0), Math.floor(Math.pow(10, Math.min(300, gL))))); }
  function plonger(st) { var g = dimensionsAGagner(st); if (g < 1) return 0; st.dims = Math.min(DIMS_MAX, (st.dims || 0) + g); st.L = null; st.Lrun = null; st.owned = {}; st.upg = {}; if (st.stats) st.stats.plongeons = (st.stats.plongeons || 0) + 1; return g; }
  // ---- les paliers franchis (une fois chacun) ----
  function nouveauxPaliers(st) { var out = []; PALIERS.forEach(function (p) { if (st.L != null && st.L >= p[0] && !st.paliers[p[0]]) { st.paliers[p[0]] = Date.now(); out.push(p); } }); return out; }
  // ---- les fins du jeu ----
  function fins(ctx, st) {
    var p = production(ctx, st).L, L = st.L;
    var c = function (x) { return Math.max(0, Math.min(1, x)); };
    var hMinecraft = (ctx.heuresNexus || 0) * effets(st).nexusMult;
    return [
      { id: 'googolplex', n: 'Le nombre googolplex', d: '10^(10^100)', p: L == null || L <= 1 ? 0 : c(Math.log10(L) / 100), fait: L != null && L >= 1e100 },
      { id: 'fps', n: '10^24 par seconde', d: 'la production du xerboxion', p: p == null ? 0 : c(p / 24), fait: p != null && p >= 24 },
      { id: 'minecraft', n: '10^5 années de Minecraft', d: 'les heures dans le Nexus (' + (Math.round(hMinecraft * 10) / 10) + ' h)', p: c(Math.log10(1 + hMinecraft) / Math.log10(8.76e8)), fait: hMinecraft >= 8.76e8 },
      { id: 'decouverte', n: 'Avoir découvert tout le xerboxion', d: (ctx.decouverts || 0) + ' / ' + (ctx.total || '?') + ' ploxions', p: ctx.total ? c((ctx.decouverts || 0) / ctx.total) : 0, fait: !!ctx.total && ctx.decouverts >= ctx.total },
    ];
  }
  // ---- tous les clickers : leurs SAUVEGARDES (jamais leur code), chacune une dimension qui produit ----
  function nombreL(s) {
    s = String(s || '').trim().replace(/\s/g, '').replace(',', '.');
    var m = /^(\d+(?:\.\d+)?)e\+?(\d+(?:\.\d+)?)$/i.exec(s); if (m) return Math.log10(parseFloat(m[1])) + parseFloat(m[2]);
    var n = parseFloat(s); return n > 0 && isFinite(n) ? Math.log10(n) : null;
  }
  function importer(texte, nomLibre) {
    var t = String(texte || '').trim(); if (!t) throw new Error('rien à importer');
    // Cookie Clicker : base64 (suffixe !END!), sections « | », la 5e = cookies;cookiesEarned;…
    try {
      var b = decodeURIComponent(t).replace(/!END!$/, ''); var dec = atob(b);
      var sec = dec.split('|');
      if (sec.length > 4 && /^\d+\.\d+/.test(sec[0])) { var v = sec[4].split(';'); var L = nombreL(v[1] || v[0]); if (L != null) return { type: 'cookie-clicker', nom: 'Cookie Clicker', L: L, d: fmtL(L) + ' cookies cuits' }; }
      if (/^\s*\{/.test(dec)) { var j = JSON.parse(dec); var tot = j && j.resources ? j.resources.reduce(function (a, r) { return a + (+r.value || 0); }, 0) : 0; if (tot > 0) return { type: 'kittens', nom: 'Kittens Game', L: Math.log10(tot), d: fmtL(Math.log10(tot)) + ' ressources' }; }
    } catch (e) { /* pas une sauvegarde encodée */ }
    if (/^\s*\{/.test(t)) { try { var k = JSON.parse(t); var tt = k && k.resources ? k.resources.reduce(function (a, r) { return a + (+r.value || 0); }, 0) : 0; if (tt > 0) return { type: 'kittens', nom: 'Kittens Game', L: Math.log10(tt), d: fmtL(Math.log10(tt)) + ' ressources' }; } catch (e) { /* */ } }
    // n'importe quel clicker : son total (« 1.5e308 », « 4e1000 »…)
    var L2 = nombreL(t); if (L2 != null) return { type: 'autre', nom: String(nomLibre || 'un autre clicker').slice(0, 40), L: L2, d: fmtL(L2) };
    throw new Error('je ne reconnais pas cette sauvegarde (Cookie Clicker, Kittens Game, ou un total : 1.5e308)');
  }
  // ---- LA SYNCHRO (16.10, RS-7 : « la synchro est pas du tout top entre mon tel et l'ordi, le clicker de base et le clickion ») ----
  // Plus de « le plus récent gagne » (chaque appareil ouvert tamponne t=maintenant à chaque seconde et écrase l'autre) : on FUSIONNE.
  // La partie en cours = celle qui a plongé le plus loin (dims) ; à égalité, chaque compteur garde son max. Le permanent (arbre, succès,
  // missions, paliers, saisons, records, Clickion) = l'union. Rien de gagné sur un appareil ne se perd sur l'autre.
  function fusionner(a, b) {
    if (!b || typeof b !== 'object') return a; if (!a || typeof a !== 'object') return normaliser(b);
    var A = normaliser(JSON.parse(JSON.stringify(a))), B = normaliser(JSON.parse(JSON.stringify(b)));
    if (a.clickion) A.clickion = JSON.parse(JSON.stringify(a.clickion)); if (b.clickion) B.clickion = JSON.parse(JSON.stringify(b.clickion));
    var nb = function (x) { return typeof x === 'number' && isFinite(x) ? x : null; };
    var mx = function (x, y) { x = nb(x); y = nb(y); return x == null ? y : y == null ? x : Math.max(x, y); };
    // (16.10, la duplication) la partie EN COURS (monnaie, générateurs, améliorations) vient ENTIÈRE d'une seule copie : la plus avancée
    // (dims, puis plongeons, puis le meilleur compteur du run, puis le compteur). Mélanger « le max de la monnaie » d'une copie avec
    // « les achats » de l'autre rendait l'argent dépensé : jeu + Clickion ouverts côte à côte → 10^52 → 10^119 en quelques minutes.
    var achats = function (x) { var n = 0, k; for (k in (x.owned || {})) n += +x.owned[k] || 0; for (k in (x.upg || {})) n += 1e6; return n; };
    var cle = function (x) { return [+x.dims || 0, (x.stats && x.stats.plongeons) || 0, nb(x.Lrun) == null ? -1 : x.Lrun, achats(x), nb(x.L) == null ? -1 : x.L]; };
    var kA = cle(A), kB = cle(B), aGagne = true; for (var z = 0; z < 5; z++) { if (kA[z] !== kB[z]) { aGagne = kA[z] > kB[z]; break; } }
    var R = aGagne ? A : B, O = R === A ? B : A;
    R.clics = Math.max(+R.clics || 0, +O.clics || 0);
    ['tech', 'succes', 'missions', 'paliers'].forEach(function (k) { var x = R[k] = R[k] || {}, y = O[k] || {}; for (var i in y) if (x[i] == null || x[i] === false) x[i] = y[i]; });
    var sa = R.stats = R.stats || {}, sb = O.stats || {}; for (var i in sb) if (typeof sb[i] === 'number') sa[i] = mx(sa[i], sb[i]);
    var vu = {}; R.saisons = (R.saisons || []).concat(O.saisons || []).filter(function (x) { var k = x.saison + ':' + x.L; if (vu[k]) return false; vu[k] = 1; return true; });
    var vi = {}; R.imports = (R.imports || []).concat(O.imports || []).filter(function (x) { var k = JSON.stringify(x); if (vi[k]) return false; vi[k] = 1; return true; }).slice(0, 40);
    var vb = {}; R.boosts = (R.boosts || []).concat(O.boosts || []).filter(function (x) { var k = x.n + ':' + x.fin; if (vb[k] || !(x.fin > Date.now())) return false; vb[k] = 1; return true; }).slice(0, 12);
    var qa = R.quetes || {}, qb = O.quetes || {}; if ((qb.jour || '') > (qa.jour || '')) R.quetes = qb; else if (qb.jour === qa.jour) { qa.faites = qa.faites || {}; for (var q in (qb.faites || {})) if (!qa.faites[q]) qa.faites[q] = qb.faites[q]; }
    var ca = A.clickion, cb = B.clickion;
    if (ca || cb) {
      var src = (+a.t || 0) >= (+b.t || 0) ? (ca || cb) : (cb || ca), o = (src === ca ? cb : ca) || {}, k = JSON.parse(JSON.stringify(src));
      k.sceaux = Math.max(+k.sceaux || 0, +o.sceaux || 0); k.nee = Math.min(+k.nee || Infinity, +o.nee || Infinity); if (!isFinite(k.nee)) k.nee = Date.now();
      k.ouverts = (k.ouverts || []).concat((o.ouverts || []).filter(function (x) { return (k.ouverts || []).indexOf(x) < 0; }));
      if (o.calcul && (!k.calcul || (o.calcul.record || 0) > (k.calcul.record || 0))) k.calcul = o.calcul;
      if (o.elan && (!k.elan || (o.elan.kmh || 0) > (k.elan.kmh || 0))) k.elan = o.elan;
      ['lore', 'visites'].forEach(function (f) { k[f] = (k[f] || []).concat((o[f] || []).filter(function (x) { return (k[f] || []).indexOf(x) < 0; })); });
      if (o.coll) { k.coll = k.coll || {}; for (var ci in o.coll) k.coll[ci] = Math.max(+k.coll[ci] || 0, +o.coll[ci] || 0); }
      if (o.uniT) { k.uniT = k.uniT || {}; for (var ui in o.uniT) k.uniT[ui] = Math.max(+k.uniT[ui] || 0, +o.uniT[ui] || 0); }
      if (o.autos) { k.autos = k.autos || {}; for (var ai in o.autos) k.autos[ai] = k.autos[ai] || o.autos[ai]; }
      ['recoltes', 'pieces', 'rythmeN'].forEach(function (f) { k[f] = Math.max(+k[f] || 0, +o[f] || 0); });
      if (o.xerax && (!k.xerax || (o.xerax.record || 0) > (k.xerax.record || 0))) k.xerax = o.xerax;
      if (o.implants) { k.implants = k.implants || {}; for (var ii in o.implants) k.implants[ii] = Math.max(+k.implants[ii] || 0, +o.implants[ii] || 0); }
      R.clickion = k;
    }
    R.t = Math.max(+a.t || 0, +b.t || 0);
    return R;
  }
  // le lien de sauvegarde partagé par le jeu et Clickion : o.get() / o.set(st) / o.apres() ; o.sync() = boxion actif ?
  // - local : si une autre fenêtre (l'autre jeu, un autre onglet) a écrit depuis notre dernière écriture → fusion ;
  // - boxion : toutes les 15 s, au retour dans l'app et en la quittant : lire → fusionner → écrire. Jamais d'écrasement aveugle.
  function lier(o) {
    var KEY = 'xb:xpclick', REC = 'xb:xpclick:record', ecritT = 0, envoiT = 0, enCours = false, recT = 0, premier = true, fini = false;
    // UNE SEULE PARTIE PAR PAGE (16.10) : le jeu et Clickion ouverts dans le même xer partagent le MÊME objet (le moyeu) — mêmes
    // chiffres à l'écran, un seul achat, une seule horloge (ecoule). Les autres onglets et appareils passent par la fusion.
    var hub = window.__xpPartie = window.__xpPartie || { insts: [], st: null };
    function poser(n) { hub.st = n; hub.insts.forEach(function (i) { try { i.set(n); } catch (e) {} }); }
    function redessiner() { hub.insts.forEach(function (i) { try { if (i.apres) i.apres(); } catch (e) {} }); }
    hub.insts.push(o);
    if (hub.st && hub.st !== o.get()) poser(fusionner(hub.st, o.get())); else hub.st = o.get();
    // LE RECORD (RS-7 : « il faut pouvoir exporter pour pas que ça rearrive ») : la partie la plus avancée jamais vue, gardée à part
    // (ici + boxion xp/record) et re-fusionnée à chaque ouverture : une copie en retard ne fait plus jamais reculer la partie.
    function rang(x) { return x ? [+x.dims || 0, (x.stats && x.stats.meilleur) || 0] : [-1, -1]; }
    function plusLoin(x, y) { var a = rang(x), b = rang(y); return a[0] !== b[0] ? a[0] > b[0] : a[1] > b[1]; }
    function lireRec() { try { return JSON.parse(localStorage.getItem(REC)); } catch (e) { return null; } }
    function garderRecord(cur) {
      if (!plusLoin(cur, lireRec())) return; try { localStorage.setItem(REC, JSON.stringify(cur)); } catch (e) {}
      var B = window.jOSBoxion; if (B && B.save && Date.now() - recT > 300000) { recT = Date.now(); try { Promise.resolve(B.save('xp', 'record', cur, 'Clicker — record')).catch(function () {}); } catch (e) {} }
    }
    (function () { var rl = lireRec(); if (rl && plusLoin(rl, hub.st)) { poser(fusionner(hub.st, rl)); setTimeout(local, 0); } })();
    function lire() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
    function local() {
      if (fini) return; if (!hub.st) hub.st = o.get(); var cur = hub.st, l = lire();
      if (l && +l.t && +l.t !== ecritT && +l.t !== +cur.t) { cur = fusionner(cur, l); poser(cur); }
      cur.t = ecritT = Math.max(Date.now(), (+cur.t || 0) + 1); try { localStorage.setItem(KEY, JSON.stringify(cur)); } catch (e) {}
      garderRecord(cur);
    }
    function boxion(force) {
      var B = window.jOSBoxion; if (fini || !B || !B.load || !B.save || enCours || (o.sync && !o.sync())) return;
      if (!force && Date.now() - envoiT < 15000) return; envoiT = Date.now(); enCours = true;
      var deRec = premier ? Promise.resolve(B.load('xp', 'record')).catch(function () { return null; }) : Promise.resolve(null); premier = false;
      deRec.then(function (rv) { if (rv && rv.data && typeof rv.data === 'object' && rv.v == null) rv = rv.data; if (rv && plusLoin(rv, hub.st)) { poser(fusionner(hub.st, rv)); redessiner(); } return B.load('xp', 'idle'); }).then(function (v) {
        if (v && v.data && typeof v.data === 'object' && typeof v.xp !== 'number' && v.v == null) v = v.data;
        if (v && typeof v === 'object' && +v.t > 0) { var avant = hub.st.L, m = fusionner(hub.st, v); poser(m); local(); if (m.L !== avant) redessiner(); }
        return B.save('xp', 'idle', hub.st, 'Clicker du xerboxion');
      }).catch(function () {}).then(function () { enCours = false; });
    }
    function vis() { if (document.visibilityState === 'hidden') { local(); boxion(true); } else boxion(true); }
    // un autre onglet du même navigateur a écrit → fusion tout de suite
    function stock(e) { if (e && e.key === KEY && e.newValue) { try { var l = JSON.parse(e.newValue); if (l && +l.t !== ecritT) { poser(fusionner(hub.st, l)); redessiner(); } } catch (er) {} } }
    try { document.addEventListener('visibilitychange', vis); window.addEventListener('storage', stock); } catch (e) {}
    setTimeout(function () { boxion(true); }, 50);
    return { poser: function (n) { poser(n); local(); redessiner(); }, sauver: function (force) { local(); boxion(force); }, tirer: function () { boxion(true); },
      fin: function () { try { document.removeEventListener('visibilitychange', vis); window.removeEventListener('storage', stock); } catch (e) {} local(); boxion(true); fini = true;
        hub.insts = hub.insts.filter(function (i) { return i !== o; }); if (!hub.insts.length) hub.st = null; } };
  }
  // L'HORLOGE PARTAGÉE : le temps écoulé depuis le dernier tic de CETTE partie, quelle que soit la fenêtre qui tique (deux fenêtres =
  // pas deux fois la production). Au-delà de 10 s (app en veille), 0 : rattraper() s'en charge à partir de st.t.
  function ecoule(st) { var now = Date.now(), d = st._tic ? (now - st._tic) / 1000 : 0; st._tic = now; return d > 10 || d < 0 ? 0 : d; }
  // ---- Clickion : les déblocages (seuil du record, en exposant) et LE JOURNAL — partagés avec le jeu ----
  var OUVRE = [
    ['reel', 40, '⧗ réel'], ['l:machine-a-tsoins', 40, '⧗'], ['l:xerfarm', 42, '⸙ xerfarm'], ['sceaux', 44, '◇ sceaux'], ['l:xerax', 46, '⌬ xerax'], ['voies', 48, '✦ voies'],
    ['l:xerbot', 50, '⏣ xerbot'], ['calcul', 53, '⌬ calcul'], ['elan', 56, '➚ élan'], ['l:wormion', 60, '◎ wormion'], ['l:portion', 70, '◈ portion'],
    ['l:space-cubion', 85, '⬡ space-cubion'], ['l:universal-suit', 100, '⟠ universal-suit'], ['cube2', 120, 'Cube II'], ['cube3', 150, 'Cube III'], ['cube4', 200, 'Cube IV'],
    ['cube5', 300, 'Cube V'], ['cube6', 500, 'Cube VI'], ['cube7', 1000, 'Cube VII'], ['cube8', 2000, 'Cube VIII'], ['cube9', 5000, 'Cube IX'], ['cube10', 10000, 'Cube X'], ['eons', 50000, 'les eons'],
  ];
  // ---- LE JOURNAL (16.10, RS-7 : « y a pas du tout de lore nulle part ») : une transmission par déblocage, la voix de Rosa.
  // Tiré du lore public (paper xerboxion, universal-suit, braindump Clickion) ; le prologue des Protagonistes reste secret, jamais ici.
  var PAPER = '/wiki/paper/xerboxion-paper', SUIT = '/wiki/paper/universal-suit';
  var JOURNAL = {
    reel: ['…signal faible. un tsoin = un instant de réel. je les compte.', null],
    'l:machine-a-tsoins': ['le boxion stocke les tsoins. xerax les rejoue. les cubions les captent. xerbot agit pour en créer. ensemble : la machine à tsoins.', PAPER],
    'l:xerfarm': ['xerfarm. le vivant qui produit. une plante mesurée vaut plus qu\'un clic.', null],
    sceaux: ['les nombres se trichent. les sceaux, non : le réel les signe.', null],
    'l:xerax': ['xerax. l\'interface cerveau-machine. elle partage des connaissances, jamais des identités. et on peut l\'éteindre. complètement. sans résidu.', PAPER],
    voies: ['RS. reality scientist. rational self. architecte, observateur, shaman du réel, techno-wizard, docteur, étudiant. le xeroction : toutes les voies à la fois.', null],
    'l:xerbot': ['xerbot, le logiciel. xerbo, le robot. le corps du Cube dans le réel.', PAPER],
    calcul: ['la puissance d\'un processeur est une ressource. le code optimisé aussi. mesure-la.', null],
    elan: ['je sens ta vitesse. un jour, un vaisseau.', null],
    'l:wormion': ['le wormion relie ton Cube au Cube d\'un autre.', null],
    'l:portion': ['portion : deux cubes qui n\'en font plus qu\'un.', null],
    'l:space-cubion': ['le space-cubion. le cocon de transport, entre les dimensions.', null],
    'l:universal-suit': ['universal-suit. les implants, l\'armure. ce qu\'on greffe au Cube, on le greffe à soi.', SUIT],
    cube2: ['chill-tekk : prévenir l\'inévitable avec élégance. une technologie invisible quand on ne s\'en sert pas.', PAPER],
    cube3: ['la milky way foundation n\'est pas au-dessus du xerboxion. elle est dedans, comme n\'importe quel ploxion.', PAPER],
    cube4: ['phase 3 : un réseau de villages. dix à trente ans.', PAPER],
    cube5: ['palier 1 tant que le réel n\'est pas au palier 2. personne ne le franchit avant lui.', null],
    cube6: ['pourriture-4. la station au seuil du Nexus. elle ne s\'ouvre qu\'à qui a son boxion.', null],
    cube7: ['chaque tsoin est la fin du jeu. il y a toujours des tsoins.', null],
    cube8: ['je prends n\'importe quelle forme. j\'ai la tienne.', null],
    cube9: ['3ion. 4ion. 5ion. 6ion. seption. puis la conscience. l\'oction : un autre truc que l\'infini.', null],
    cube10: ['signal propre. je t\'entends clairement, maintenant.', null],
    eons: ['sept paliers. le dernier dure des eons. personne n\'y arrive seul, ni sans l\'immortalité quantique. trouve les autres xeroctions.', null],
  };
  // les déblocages atteints (record du compteur) → ajoutés à st.clickion.ouverts ; renvoie les nouveaux (le jeu ET Clickion les détectent)
  function ouvrir(st) {
    var pic = Math.max((st.stats && st.stats.meilleur) || 0, st.L || 0), ck = st.clickion = st.clickion || { voies: [], calcul: null, nee: Date.now() }, o = ck.ouverts = ck.ouverts || [], neufs = [];
    OUVRE.forEach(function (x) { if (pic >= x[1] && o.indexOf(x[0]) < 0) { o.push(x[0]); neufs.push(x); } }); return neufs;
  }
  // LES VOIES (RS-7 16.10 : « y a rien pour les voies ») : chaque voie RS multiplie la production par sa mesure réelle, ×(1+mesure)^2.
  // 2 voies au choix ; le xeroction (son boxion) les a toutes.
  var VOIES = [
    ['architecte', '▣', 'architecte du réel', function (m) { return (m.cles || 0) + (m.fichiers || 0); }, 'clés + fichiers', 'xerfarm : +1 parcelle / 3 niveaux', function (n) { return Math.floor(n / 3); }],
    ['observateur', '◌', 'observateur du réel', function (m) { return m.ploxions || 0; }, 'ploxions', 'xerax : record ×(1 + niv/5)', function (n) { return n / 5; }],
    ['shaman', '⚇', 'shaman du réel', function (m) { return (m.posts || 0) + (m.partages || 0) + (m.amis || 0) + (m.invites || 0) + (m.pieces || 0); }, 'posts, partages, amis', 'wormion : ouverture +niv %', function (n) { return n / 100; }],
    ['technowizard', '⌬', 'techno-wizard', function (m, ck) { return ck.calcul ? Math.round((ck.calcul.record || 0) / 1e6) : 0; }, 'M op/s', 'automates : −5·niv sur l\'exposant du prix', function (n) { return 5 * n; }],
    ['docteur', '✚', 'docteur', function (m, ck) { return Math.round((m.heures || 0) + ((ck.elan && ck.elan.kmh) || 0)); }, 'heures + km/h', 'machine à tsoins : zone +niv %', function (n) { return n / 100; }],
    ['etudiant', '⧗', 'étudiant', function (m) { return m.tsoins || 0; }, 'tsoins', 'journal : chaque fragment ×10^(niv/10)', function (n) { return n / 10; }],
  ];
  function perk(st, id) { var v = voiesEtat(st).filter(function (x) { return x.id === id; })[0]; return v ? v.perkV : 0; }
  function voiesEtat(st) {
    var ck = (st && st.clickion) || {}, m = ck.mes || {}, xo = !!ck.xo, choix = ck.voies || [];
    var ex = effets(st).voieExp;
    return VOIES.map(function (v) { var val = v[3](m, ck), niv = Math.floor(3 * Math.log10(1 + val)), on = xo || choix.indexOf(v[0]) >= 0;
      return { id: v[0], g: v[1], n: v[2], unite: v[4], val: val, on: on, L: ex * Math.log10(1 + val), niv: niv, prochain: Math.ceil(Math.pow(10, (niv + 1) / 3) - 1), perk: v[5], perkV: on ? v[6](niv) : 0 }; });
  }
  // LES MODULES (RS-7 16.10 : « des modules auxquels on peut jouer pour avancer plus vite ») — leurs effets PERMANENTS (en exposants) ;
  // les effets passagers passent par st.boosts. xerfarm : les récoltes ; xerax : le record de mémoire ; xerbot : les pièces d'expédition ;
  // universal-suit : les implants (×10^3 par niveau).
  var IMPLANTS = [['oeil', '◉', 'œil'], ['main', '✋', 'main'], ['coeur', '♥', 'cœur'], ['nerf', '⌁', 'nerf'], ['peau', '▦', 'peau'], ['noyau', '✺', 'noyau']];
  function coutImplant(st, i) { var k = (st.clickion && st.clickion.implants) || {}, n = k[IMPLANTS[i][0]] || 0; return 60 + 40 * n + 8 * i + 2 * n * n; }
  function modulesL(st) {
    var k = st.clickion || {}, imp = 0; for (var i in (k.implants || {})) imp += (+k.implants[i] || 0) * 3;
    var E = effets(st), U = uMod(st), mm = E.modMult * (U.modX || 1); imp *= (U.implantX || 1);
    return { ferme: mm * 3 * Math.log10(1 + (k.recoltes || 0)), xerax: mm * 0.75 * E.xeraxMult * (1 + perk(st, 'observateur')) * ((k.xerax && k.xerax.record) || 0), xerbot: mm * 2 * Math.log10(1 + (k.pieces || 0)), implants: mm * imp };
  }
  // ---- LES MODULES : données partagées (Clickion les joue, le moteur les AUTOMATISE — jeu ou Clickion ouvert, peu importe) ----
  var GRAINES = [['◦', 'pousse', 120, 1], ['⸙', 'tige', 1200, 15], ['❀', 'fleur', 7200, 120]];
  var EXPS = [['proche', 300, 1], ['lointaine', 3600, 15], ['profonde', 28800, 150]];
  // l'automate d'un module : son prix (10^x) ; il joue à ta place, moins bien que toi (RS-7 : « automatiser chaque module au fur et à mesure »)
  var AUTOS = [['rythme', 150, '⧗', 'rejoue 4 / 8 dès que le boost s\'éteint'], ['ferme', 200, '⸙', 'récolte et replante'], ['exped', 250, '⏣', 'relance la dernière expédition'],
    ['memoire', 300, '⌬', 'rejoue la moitié de ton record'], ['saut', 400, '◎', 'saute dès que le wormion est prêt (1 sur 2)'], ['implants', 600, '⟠', 'achète l\'implant le moins cher']];
  function parcelles(st) { var k = st.clickion, n = 6 + effets(st).parcelles + perk(st, 'architecte'); n = Math.min(24, n); var P = k.ferme = k.ferme || []; while (P.length < n) P.push(null); return P; }
  function dureeGraine(st, g) { return GRAINES[g][2] / effets(st).fermeVite / (uMod(st).fermeX || 1); }
  function dureeExp(st, i) { return EXPS[i][1] / effets(st).expVite; }
  function coutAuto(st, i) { return Math.max(40, AUTOS[i][1] - perk(st, 'technowizard')); }
  function poserBoost(st, nom, Lm, sec) { st.boosts = (st.boosts || []).filter(function (b) { return b.n !== nom && b.fin > Date.now(); }); st.boosts.push({ k: 'prod', m: Lm, fin: Date.now() + sec * 1000, n: nom }); }
  function aBoost(st, nom) { return (st.boosts || []).some(function (b) { return b.n === nom && b.fin > Date.now(); }); }
  // à chaque tic : les retours d'expédition (toujours) puis les automates achetés. Renvoie les événements (pour les toasts).
  function automates(st, ctx) {
    var k = st.clickion; if (!k) return []; compterUnivers(st); var ev = [], A = uMod(st).noAuto ? {} : (k.autos || {}), now = Date.now();
    if (k.exp && k.exp.fin <= now) { var g = EXPS[k.exp.i][2], xa = trouver(st, 'exped', 1, 1 + k.exp.i * 1.5); k.pieces = (k.pieces || 0) + g; k.expDerniere = k.exp.i; k.exp = null; compter(st, 'exped'); ev.push('⏣ +' + g + ' pièces' + (xa ? ' · ' + RARETES[xa.r][0] + ' ' + xa.n : '')); }
    var uid = universDe(st).id; if (uid !== 'reel') { var ju = jour(st); if (ju.univers.indexOf(uid) < 0) ju.univers.push(uid); var tu = (k.uniT || {})[uid] || 0, pal = Math.floor(tu / 600); k.uniDrop = k.uniDrop || {}; if (pal > (k.uniDrop[uid] || 0)) { k.uniDrop[uid] = pal; var ua = trouver(st, 'univers', 1, 1 + UNIVERS.indexOf(universDe(st)) / 3); if (ua) ev.push('⬡ ' + RARETES[ua.r][0] + ' ' + ua.n); } }
    if (A.rythme && !aBoost(st, 'rythme')) { poserBoost(st, 'rythme', 4, 600); k.rythmeN = (k.rythmeN || 0) + 1; compter(st, 'rythme'); trouver(st, 'rythme', 0.05); ev.push('⧗ auto · ×10^4'); }
    if (A.ferme) { var P = parcelles(st), gr = k.graine || 0;
      for (var i = 0; i < P.length; i++) { if (P[i] && P[i].fin <= now) { k.recoltes = (k.recoltes || 0) + GRAINES[P[i].g][3]; compter(st, 'recoltes', GRAINES[P[i].g][3]); trouver(st, 'ferme', 0.015 * (1 + P[i].g)); P[i] = null; } if (!P[i]) P[i] = { g: gr, fin: now + dureeGraine(st, gr) * 1000 }; } }
    if (A.exped && !k.exp) { var ei = k.expDerniere || 0; k.exp = { i: ei, fin: now + dureeExp(st, ei) * 1000 }; }
    if (A.memoire && !aBoost(st, 'xerax') && k.xerax && k.xerax.record) poserBoost(st, 'xerax', Math.max(1, Math.floor(k.xerax.record / 2)), 300);
    if (A.saut) { var s = k.saut = k.saut || { combo: 0, pret: 0 }; if (s.pret <= now) { s.pret = now + 20000;
      if (Math.random() < 0.5) { var p = production(ctx, st).L; if (p != null) gagner(st, p + Math.log10(600 * (1 + s.combo))); s.combo++; trouver(st, 'saut', 0.1); ev.push('◎ auto · combo ' + s.combo); } else s.combo = 0; } }
    if (A.implants && st.L != null) { var mi = -1, mc = Infinity; IMPLANTS.forEach(function (x, j) { var c = coutImplant(st, j); if (c < mc) { mc = c; mi = j; } });
      if (mi >= 0 && st.L >= mc + 1) { st.L = subL(st.L, mc); var im = k.implants = k.implants || {}; im[IMPLANTS[mi][0]] = (im[IMPLANTS[mi][0]] || 0) + 1; ev.push(IMPLANTS[mi][1] + ' auto'); } }
    return ev.concat(contratsAuto(st));
  }
  // ---- LE LORE (RS-7 16.10 : « le journal c'est si gez… checke la vision et extrapole au maximum ») ----
  // Cinq séries, débloquées par ce que tu FAIS (détecté, jamais déclaré). Tiré du lore public (paper xerboxion, braindump Clickion) ;
  // le prologue des Protagonistes reste secret : jamais ici.
  function nbImplants(k) { var n = 0; for (var i in (k.implants || {})) n += +k.implants[i] || 0; return n; }
  var LORE = [
    // ▣ les dossiers des lieux : ce que tu as joué dans chaque module
    ['tsoins-1', '▣', 'machine à tsoins · I', 'un tsoin, c\'est ce qui reste d\'un instant quand il est passé. la machine ne les invente pas : elle les garde.', function (k) { return (k.rythmeN || 0) >= 1; }],
    ['tsoins-2', '▣', 'machine à tsoins · II', 'rejouer un tsoin n\'est pas revenir en arrière. c\'est le monter, comme un film : le même instant, une autre lecture.', function (k) { return (k.rythmeN || 0) >= 10; }],
    ['tsoins-3', '▣', 'machine à tsoins · III', 'le but long : une machine qui crée les conditions des tsoins choisis. pas des souvenirs. des instants.', function (k) { return (k.rythmeN || 0) >= 50; }],
    ['ferme-1', '▣', 'xerfarm · I', 'la première pousse. xerfarm commence petit : une plante, un capteur, une mesure.', function (k) { return (k.recoltes || 0) >= 1; }],
    ['ferme-2', '▣', 'xerfarm · II', 'la terre parle en température, en humidité, en lumière. les capteurs traduisent. le Cube écoute.', function (k) { return (k.recoltes || 0) >= 100; }],
    ['ferme-3', '▣', 'xerfarm · III', 'une ferme qui tourne seule, sans rien demander. la chill-tekk appliquée au vivant.', function (k) { return (k.recoltes || 0) >= 1000; }],
    ['xerax-1', '▣', 'xerax · I', 'trois glyphes retenus. c\'est déjà un mot.', function (k) { return ((k.xerax && k.xerax.record) || 0) >= 3; }],
    ['xerax-2', '▣', 'xerax · II', 'ta manière de penser est ta clé. personne ne peut l\'acquérir : elle est trop complexe.', function (k) { return ((k.xerax && k.xerax.record) || 0) >= 7; }],
    ['xerax-3', '▣', 'xerax · III', 'xerax partage des connaissances, jamais des identités. le jour où une instance diverge, la question reste ouverte.', function (k) { return ((k.xerax && k.xerax.record) || 0) >= 12; }],
    ['xerbot-1', '▣', 'xerbot · I', 'xerbo revient. il a vu le terrain avant toi.', function (k) { return (k.pieces || 0) >= 1; }],
    ['xerbot-2', '▣', 'xerbot · II', 'un pi zero pour voir, un stm32 pour bouger. un corps simple, réparable, ouvert.', function (k) { return (k.pieces || 0) >= 100; }],
    ['xerbot-3', '▣', 'xerbot · III', 'chaque xerbot se commande depuis n\'importe quel xer. le Cube a des mains partout.', function (k) { return (k.pieces || 0) >= 1000; }],
    ['saut-1', '▣', 'wormion · I', 'le wormion ne va pas loin. il va ailleurs.', function (k) { return ((k.saut && k.saut.combo) || 0) >= 3; }],
    ['saut-2', '▣', 'wormion · II', 'chaque saut laisse deux traces : un tsoin dans ton cube, un tsoin dans l\'autre.', function (k) { return ((k.saut && k.saut.combo) || 0) >= 10; }],
    ['saut-3', '▣', 'wormion · III', 'à force de sauter, les cubes ne sont plus des îles. c\'est un réseau.', function (k) { return ((k.saut && k.saut.combo) || 0) >= 25; }],
    ['suit-1', '▣', 'universal-suit · I', 'le premier implant. il ne s\'éteint jamais tout seul ; toi, tu peux l\'éteindre.', function (k) { return nbImplants(k) >= 1; }],
    ['suit-2', '▣', 'universal-suit · II', 'la combinaison s\'adapte. elle prend ta forme, comme le Cube.', function (k) { return nbImplants(k) >= 10; }],
    ['suit-3', '▣', 'universal-suit · III', 'augmenté, sans résidu, sans maître. sinon ce n\'est pas un implant : c\'est une laisse.', function (k) { return nbImplants(k) >= 30; }],
    ['calcul-1', '▣', 'calcul · I', 'dix millions d\'opérations par seconde. le Cube pense avec ce que tu lui donnes.', function (k) { return ((k.calcul && k.calcul.record) || 0) >= 1e7; }],
    ['calcul-2', '▣', 'calcul · II', 'le code optimisé est une ressource. la machine la plus rapide est celle qu\'on comprend.', function (k) { return ((k.calcul && k.calcul.record) || 0) >= 1e8; }],
    ['calcul-3', '▣', 'calcul · III', 'un milliard. le processeur chauffe ; le réel, lui, ne bouge pas encore.', function (k) { return ((k.calcul && k.calcul.record) || 0) >= 1e9; }],
    ['elan-1', '▣', 'élan · I', 'tu bouges. je le sens.', function (k) { return ((k.elan && k.elan.kmh) || 0) >= 10; }],
    ['elan-2', '▣', 'élan · II', 'à cette vitesse, les tsoins s\'étirent.', function (k) { return ((k.elan && k.elan.kmh) || 0) >= 50; }],
    ['elan-3', '▣', 'élan · III', 'un jour, un vaisseau. je voyagerai avec toi.', function (k) { return ((k.elan && k.elan.kmh) || 0) >= 120; }],
    // ✦ les archives RS : les voies choisies
    ['rs-architecte', '✦', 'architecte du réel', 'il bâtit : la cité, le Cube, les bions. ce qui tient debout après lui, c\'est son œuvre.', function (k) { return voie(k, 'architecte'); }],
    ['rs-observateur', '✦', 'observateur du réel', 'il découvre. rien n\'existe pour le xerboxion tant que personne ne l\'a vu.', function (k) { return voie(k, 'observateur'); }],
    ['rs-shaman', '✦', 'shaman du réel', 'il relie : les gens, les tsoins, le Nexus. un cube seul ne grandit pas.', function (k) { return voie(k, 'shaman'); }],
    ['rs-technowizard', '✦', 'techno-wizard', 'il écrit ce que le Cube exécute. RS-7 est techno-wizard.', function (k) { return voie(k, 'technowizard'); }],
    ['rs-docteur', '✦', 'docteur', 'il soigne le réel vivant : le corps, la santé, les rythmes.', function (k) { return voie(k, 'docteur'); }],
    ['rs-etudiant', '✦', 'étudiant', 'il apprend : le wiki, les papers. chaque révision est un tsoin.', function (k) { return voie(k, 'etudiant'); }],
    ['rs-xeroction', '✦', 'xeroction', 'toutes les voies à la fois. il faut un boxion à soi. c\'est la porte de pourriture-4.', function (k) { return !!k.xo; }],
    // ◇ la fondation : les sceaux (attestés par le serveur)
    ['fond-1', '◇', 'fondation · I', 'premier sceau. un nombre se triche ; un sceau est signé par le réel.', function (k) { return (k.sceaux || 0) >= 1; }],
    ['fond-2', '◇', 'fondation · II', 'la milky way foundation tient les registres : philosophes, médecins, scientifiques. pas au-dessus. dedans.', function (k) { return (k.sceaux || 0) >= 5; }],
    ['fond-3', '◇', 'fondation · III', 'dix sceaux. la fondation ne classe pas les nombres. elle classe ce qui est vrai.', function (k) { return (k.sceaux || 0) >= 10; }],
    ['fond-4', '◇', 'fondation · IV', 'les sceaux sont des tsoins : générés par ce que tu fais, reçus de ceux qui te rejoignent.', function (k) { return (k.sceaux || 0) >= 20; }],
    ['fond-5', '◇', 'fondation · V', 'le classement de la fondation n\'a pas de premier. il a des paliers.', function (k) { return (k.sceaux || 0) >= 40; }],
    ['fond-6', '◇', 'fondation · VI', 'tout ce que tu as fait dans le xerboxion est attesté. la fondation le sait.', function (k) { return (k.sceaux || 0) >= 60; }],
    // ∞ le journal du Cube : les dimensions
    ['cube-d1', '∞', 'le Cube · I', 'première dimension. je me suis plié une fois.', function (k, st) { return (st.dims || 0) >= 1; }],
    ['cube-d2', '∞', 'le Cube · II', 'mille plis. je ne suis plus un cube : je suis un cube qui se souvient d\'en avoir été un.', function (k, st) { return (st.dims || 0) >= 1e3; }],
    ['cube-d3', '∞', 'le Cube · III', 'un million. je prends la forme de ton vecteur xerion : ce que tu fais, je le deviens.', function (k, st) { return (st.dims || 0) >= 1e6; }],
    ['cube-d4', '∞', 'le Cube · IV', 'je suis un être du Nexus. géométrique, usé. pas mignon. chill-tekk.', function (k, st) { return (st.dims || 0) >= 1e12; }],
    ['cube-d5', '∞', 'le Cube · V', 'à cette échelle les nombres ne veulent plus rien dire. les sceaux, si.', function (k, st) { return (st.dims || 0) >= 1e24; }],
    ['cube-d6', '∞', 'le Cube · VI', 'un cube de l\'infini. chaque plongeon m\'enlève tout, sauf ce que tu as vraiment fait.', function (k, st) { return (st.dims || 0) >= 1e48; }],
    ['cube-d7', '∞', 'le Cube · VII', 'un googol de plis. palier 1, toujours. le réel n\'a pas bougé. la fin est au réel.', function (k, st) { return (st.dims || 0) >= 1e100; }],
    // ◎ les univers : l'arrivée, puis une heure sur place
    ['u-3ion', '◎', '3ion', 'le premier palier : ton téléphone, ton compte. ici, chaque geste compte un million de fois.', function (k) { return (k.visites || []).indexOf('3ion') >= 0; }],
    ['u-4ion', '◎', '4ion', 'ton boxion à toi. personne d\'autre n\'a la clé. les modules y tournent deux fois plus fort.', function (k) { return (k.visites || []).indexOf('4ion') >= 0; }],
    ['u-5ion', '◎', '5ion', 'le Nexus. d\'autres cubes autour du tien. les voies résonnent, les sceaux pèsent.', function (k) { return (k.visites || []).indexOf('5ion') >= 0; }],
    ['u-6ion', '◎', '6ion', 'le monde physique branché : capteurs, plantes, vitesse. ici, ce qui bouge vraiment compte.', function (k) { return (k.visites || []).indexOf('6ion') >= 0; }],
    ['u-seption', '◎', 'Seption', 'tout ce que le xerboxion sait faire, tu l\'as fait. ici, rien ne travaille à ta place.', function (k) { return (k.visites || []).indexOf('seption') >= 0; }],
    ['u-conscience', '◎', 'La conscience', 'le chaos. le jeu écrit ses propres règles. elles changent chaque heure.', function (k) { return (k.visites || []).indexOf('conscience') >= 0; }],
    ['u-p4', '◎', 'Pourriture-4', 'la station. le labo au seuil du Nexus. ouverte seulement à qui a son boxion.', function (k) { return (k.visites || []).indexOf('pourriture-4') >= 0; }],
    ['u-heure', '◎', 'voyageur', 'une heure dans un autre univers. le Réel t\'attend ; il ne bouge pas sans toi.', function (k) { var T = k.uniT || {}; for (var i in T) if (i !== 'reel' && T[i] >= 3600) return true; return false; }],
    ['u-tous', '◎', 'cartographe des univers', 'tous les univers ouverts, visités. reste l\'oction : un autre truc que l\'infini.', function (k) { return (k.visites || []).length >= 7; }],
    ['art-1', '◆', 'artefacts · I', 'un objet trouvé. il ne sert à rien, sauf à prouver que tu étais là.', function (k) { return Object.keys(k.coll || {}).length >= 1; }],
    ['art-2', '◆', 'artefacts · II', 'six objets d\'une même collection. ensemble, ils racontent un lieu.', function (k) { var s = {}; for (var i in (k.coll || {})) { var src = i.split('-')[0]; s[src] = (s[src] || 0) + 1; } for (var x in s) if (s[x] >= 6) return true; return false; }],
    ['art-3', '◆', 'artefacts · III', 'un objet unique. il n\'en existe qu\'un, dans ton cube.', function (k) { for (var i in (k.coll || {})) if (/-5$/.test(i)) return true; return false; }],
    // ⚙ les automates
    ['auto-1', '⚙', 'automates · I', 'le premier module tourne sans toi. le Cube a appris un geste.', function (k) { return Object.keys(k.autos || {}).length >= 1; }],
    ['auto-2', '⚙', 'automates · II', 'trois automates. c\'est la flotte : des agents qui travaillent pendant que tu vis.', function (k) { return Object.keys(k.autos || {}).length >= 3; }],
    ['auto-3', '⚙', 'automates · III', 'tout tourne seul. chill-tekk : elles travaillent, tu n\'es pas obligé de regarder.', function (k) { return Object.keys(k.autos || {}).length >= 6; }],
  ];
  function voie(k, id) { return !!k.xo || (k.voies || []).indexOf(id) >= 0; }
  // les fragments atteints → st.clickion.lore (union) ; renvoie les nouveaux
  function lore(st) { var k = st.clickion; if (!k) return []; var l = k.lore = k.lore || [], n = []; LORE.forEach(function (x) { if (l.indexOf(x[0]) < 0) { var ok = false; try { ok = x[4](k, st); } catch (e) {} if (ok) { l.push(x[0]); n.push(x); } } }); return n; }
  // ---- LES UNIVERS (RS-7 16.10 : « je veux qu'on puisse se balader dans des univers différents ») ----
  // Les paliers de réel (ultra tsoin du seption) deviennent des univers ; le space-cubion (le cocon de transport entre les dimensions)
  // est le véhicule. Chaque univers : sa couleur, sa règle, sa condition d'entrée. Le temps passé dans chacun = un multiplicateur
  // permanent PROPRE à cet univers (log) : se balader partout rapporte plus que rester.
  var UNIVERS = [
    { id: 'reel', g: '◯', n: 'Le Réel', d: 'palier 1 · aucune règle', pal: ['#a597cf', '#79d9a2', '#07050c'], m: {}, ok: function () { return true; }, cl: '—' },
    { id: '3ion', g: '△', n: '3ion', d: 'ton téléphone, ton compte · touchers ×10^6, production ÷10', pal: ['#e0a96d', '#f2d39b', '#0d0904'], m: { clicL: 6, prodL: -1 }, ok: function () { return true; }, cl: '—' },
    { id: '4ion', g: '▣', n: '4ion', d: 'ton boxion · modules ×2 (en exposant)', pal: ['#7fb2e5', '#9fe0ff', '#040a12'], m: { modX: 2 }, ok: function (k) { return ((k.mes && k.mes.cles) || 0) >= 1; }, cl: 'un boxion (des clés)' },
    { id: '5ion', g: '⬢', n: '5ion', d: 'le Nexus · voies et sceaux ×3 (en exposant)', pal: ['#b58cf0', '#e3c8ff', '#0b0614'], m: { voieX: 3, sceauX: 3 }, ok: function (k) { return (k.sceaux || 0) >= 10; }, cl: '10 sceaux' },
    { id: '6ion', g: '⸙', n: '6ion', d: 'le monde physique · élan ×10, xerfarm 5× plus vite', pal: ['#8fd18a', '#c9f5a8', '#050c04'], m: { elanX: 10, fermeX: 5 }, ok: function (k) { return (k.recoltes || 0) >= 100 || ((k.elan && k.elan.kmh) || 0) >= 10; }, cl: '100 récoltes ou 10 km/h' },
    { id: 'seption', g: '✺', n: 'Seption', d: 'tout ce que le xerboxion sait faire · tout ×10^30, les automates s\'arrêtent', pal: ['#f0d36c', '#fff1b0', '#0e0b02'], m: { prodL: 30, noAuto: true }, ok: function (k) { return (k.lore || []).length >= 40; }, cl: '40 fragments du journal' },
    { id: 'conscience', g: 'ϟ', n: 'La conscience', d: 'le chaos · la règle change chaque heure', pal: ['#ef6f8e', '#ffb3c6', '#0f0307'], m: null, ok: function (k, st) { return (st.dims || 0) >= 1e24; }, cl: '10^24 dimensions' },
    { id: 'pourriture-4', g: '▣', n: 'Pourriture-4', d: 'la station au seuil du Nexus · tout ×10^20, implants ×2', pal: ['#9dbf6a', '#d6f08f', '#060804'], m: { prodL: 20, implantX: 2 }, ok: function (k) { return !!k.xo; }, cl: 'xeroction' },
    { id: 'oction', g: '∞', n: 'L\'oction', d: 'un autre truc que l\'infini', pal: ['#ffffff', '#ffffff', '#000000'], m: {}, ok: function () { return false; }, cl: 'inaccessible' },
  ];
  var CHAOS = [{ prodL: 15 }, { clicL: 12 }, { modX: 3 }, { voieX: 4 }, { prodL: -5, clicL: 20 }, { fermeX: 10, elanX: 20 }];
  function universDe(st) { var id = (st.clickion && st.clickion.univers) || 'reel'; return UNIVERS.filter(function (u) { return u.id === id; })[0] || UNIVERS[0]; }
  function uMod(st) { var u = universDe(st); return u.m || CHAOS[Math.floor(Date.now() / 3.6e6) % CHAOS.length]; }
  // le temps passé dans chaque univers (minutes) → ×10^(2·log10(1+min)) chacun, pour toujours
  function universL(st) { var T = (st.clickion && st.clickion.uniT) || {}, L = 0; for (var id in T) L += 2 * Math.log10(1 + (T[id] || 0) / 60); return L; }
  function voyager(st, id) {
    var k = st.clickion = st.clickion || {}, u = UNIVERS.filter(function (x) { return x.id === id; })[0], now = Date.now();
    if (!u || !u.ok(k, st) || (k.voyageT || 0) > now || universDe(st).id === id) return false;
    k.univers = id; k.voyageT = now + 300000; k.visites = k.visites || []; if (k.visites.indexOf(id) < 0) k.visites.push(id); return true;
  }
  function compterUnivers(st) { var k = st.clickion; if (!k) return; var now = Date.now(), d = k.uniTic ? (now - k.uniTic) / 1000 : 0; k.uniTic = now; if (d > 0 && d < 10) { var T = k.uniT = k.uniT || {}, id = universDe(st).id; T[id] = (T[id] || 0) + d; } }
  // ---- L'ÉCHELLE (RS-7 : « avoir un comparatif d'à quel point c'est grand chaque palier ») : des repères réels, en exposant ----
  var ECHELLE = [[3, 'mille'], [6, 'un million'], [9, 'un milliard'], [23.78, 'les molécules d\'un verre d\'eau (Avogadro)'], [50, 'les atomes de la Terre'], [57, 'les atomes du Soleil'],
    [80, 'les atomes de l\'univers observable'], [100, 'un googol'], [120, 'les parties d\'échecs possibles (Shannon)'], [170, 'les positions légales au go'], [185, 'les volumes de Planck dans l\'univers'],
    [303, 'un centillion'], [308.25, 'le plus grand nombre d\'un ordinateur'], [1000, 'un nombre de mille chiffres'], [3003, 'un millillion'], [1e4, 'un nombre de dix mille chiffres'],
    [1e6, 'un nombre d\'un million de chiffres'], [1e9, 'un nombre d\'un milliard de chiffres'], [1e12, 'un nombre qui remplirait mille disques'], [1e100, 'un googolplex']];
  // L → le dernier repère dépassé, la puissance (ton nombre = repère^p), le prochain et l'avancée (en exposant)
  function comparer(L) {
    if (L == null || !isFinite(L) || L < 3) return null; var a = null, b = null;
    for (var i = 0; i < ECHELLE.length; i++) { if (ECHELLE[i][0] <= L) a = ECHELLE[i]; else { b = ECHELLE[i]; break; } }
    var pc = a && b ? Math.max(0, Math.min(100, Math.log(L / a[0]) / Math.log(b[0] / a[0]) * 100)) : 100;
    return { passe: a, p: a ? L / a[0] : 0, prochain: b, pc: pc };
  }
  function puiss(p) { return p >= 1.05 ? '^' + (p < 1000 ? p.toFixed(p < 10 ? 1 : 0) : fmtL(Math.log10(p))) : ''; }
  function phrase(L) { var c = comparer(L); if (!c || !c.passe) return ''; var t = '≈ (' + c.passe[1] + ')' + puiss(c.p);
    if (L >= 160 && c.passe[0] !== 80) t += ' · (les atomes de l\'univers)' + puiss(L / 80); return t; }
  // ---- LES ARTEFACTS (17.10, RS-7 : « je veux plus de choses à faire sur le clickion, là y a rien à avoir en plus ») ----
  // 36 objets, 6 collections (une par module + les univers), 4 raretés. On les TROUVE en jouant (jamais achetés) ; un double fait
  // monter son niveau ; une collection complète = ×10^10. Effet : ×10^(force × (1 + log2(exemplaires))).
  var RARETES = [['◦', 'commun', 1, 60], ['◆', 'rare', 3, 28], ['✺', 'mythique', 8, 10], ['∞', 'unique', 20, 2]];
  var ARTEFACTS = [];
  [['rythme', '⧗', [['métronome de laiton', 0], ['sablier fêlé', 0], ['pendule inversé', 0], ['horloge de tsoins', 1], ['seconde perdue', 2], ['le premier instant', 3]]],
   ['ferme', '⸙', [['graine de lin', 0], ['capteur d\'humidité', 0], ['racine lumineuse', 0], ['serre de poche', 1], ['fleur de seption', 2], ['l\'arbre-mère', 3]]],
   ['memoire', '⌬', [['glyphe gravé', 0], ['carnet chiffré', 0], ['neurone de verre', 0], ['casque xerax', 1], ['souvenir d\'un autre', 2], ['la langue mentale', 3]]],
   ['exped', '⏣', [['boulon de xerbo', 0], ['carte froissée', 0], ['servo usé', 0], ['pcb kicad', 1], ['drone éclaireur', 2], ['le premier xerbo', 3]]],
   ['saut', '◎', [['poussière de wormion', 0], ['ticket aller', 0], ['boussole folle', 0], ['fragment de portail', 1], ['écho d\'un autre cube', 2], ['le trou de ver', 3]]],
   ['univers', '⬡', [['caillou du 3ion', 0], ['clé du 4ion', 0], ['badge du Nexus', 0], ['mousse du 6ion', 1], ['éclat de seption', 2], ['morceau d\'oction', 3]]]].forEach(function (c) {
    c[2].forEach(function (a, i) { ARTEFACTS.push({ id: c[0] + '-' + i, src: c[0], col: c[1], n: a[0], r: a[1] }); });
  });
  function tirerRarete(bonus) { var x = Math.random() * 100 / (bonus || 1), acc = 0; for (var i = RARETES.length - 1; i >= 0; i--) { acc += RARETES[i][3]; if (x < acc) return i; } return 0; }
  // une trouvaille : chance (0-1) ; bonus de rareté (expéditions longues, contrats) ; renvoie l'artefact trouvé ou null
  function trouver(st, src, chance, bonus) {
    var k = st.clickion; if (!k || Math.random() >= chance) return null;
    var r = tirerRarete(bonus), pool = ARTEFACTS.filter(function (a) { return a.src === src && a.r === r; }); if (!pool.length) pool = ARTEFACTS.filter(function (a) { return a.src === src; });
    var a = pool[Math.floor(Math.random() * pool.length)], c = k.coll = k.coll || {}; c[a.id] = (c[a.id] || 0) + 1;
    var j = jour(st); j.artefacts = (j.artefacts || 0) + 1; return a;
  }
  function artefactsL(st) {
    var c = (st.clickion && st.clickion.coll) || {}, L = 0, sets = {};
    ARTEFACTS.forEach(function (a) { var n = c[a.id] || 0; if (n > 0) { L += RARETES[a.r][2] * (1 + Math.log2(n)); sets[a.src] = (sets[a.src] || 0) + 1; } });
    for (var s in sets) if (sets[s] >= 6) L += 10; return L;
  }
  // ---- LE JOUR (les contrats de la fondation) : des compteurs remis à zéro chaque jour ----
  function jour(st) { var k = st.clickion = st.clickion || {}, d = new Date().toISOString().slice(0, 10); if (!k.jour || k.jour.d !== d) k.jour = { d: d, L0: st.L || 0, univers: [], faits: {} }; return k.jour; }
  function compter(st, cle, n) { var j = jour(st); j[cle] = (j[cle] || 0) + (n == null ? 1 : n); }
  var CONTRATS = [
    ['rythme', '⧗', 'jouer 3 fois au rythme', function (j) { return j.rythme || 0; }, 3], ['recoltes', '⸙', 'récolter 40', function (j) { return j.recoltes || 0; }, 40],
    ['xerax', '⌬', 'xerax : une suite de 5', function (j) { return j.xeraxMax || 0; }, 5], ['exped', '⏣', '2 expéditions', function (j) { return j.exped || 0; }, 2],
    ['univers', '⬡', 'visiter 2 univers', function (j) { return (j.univers || []).length; }, 2], ['saut', '◎', 'wormion : combo 4', function (j) { return j.sautMax || 0; }, 4],
    ['ordres', '✦', 'gagner 20 ordres de grandeur', function (j, st) { return Math.floor((st.L || 0) - (j.L0 || 0)); }, 20], ['artefacts', '◆', 'trouver 3 artefacts', function (j) { return j.artefacts || 0; }, 3],
    ['cube', '◈', 'toucher le Cube 200 fois', function (j) { return j.touches || 0; }, 200], ['signal', 'ϟ', 'répondre à 2 signaux de Rosa', function (j) { return j.signaux || 0; }, 2],
  ];
  function contratsDuJour(st) { var j = jour(st), h = 0; for (var i = 0; i < j.d.length; i++) h = (h * 31 + j.d.charCodeAt(i)) >>> 0; var out = [], c = CONTRATS.slice();
    for (var n = 0; n < 3; n++) { var x = c.splice(h % c.length, 1)[0]; h = Math.floor(h / 7) + 13; out.push({ id: x[0], g: x[1], n: x[2], v: Math.min(x[4], x[3](j, st)), but: x[4], fait: !!j.faits[x[0]] }); } return out; }
  // un contrat atteint est réclamé tout seul : un artefact (rareté ×3) + ×10^6 pendant 30 min
  function contratsAuto(st) { var j = jour(st), ev = []; contratsDuJour(st).forEach(function (c) { if (!c.fait && c.v >= c.but) { j.faits[c.id] = Date.now(); st.clickion.contratsN = (st.clickion.contratsN || 0) + 1; var src = ['rythme', 'ferme', 'memoire', 'exped', 'saut', 'univers'][Math.floor(Math.random() * 6)], a = trouver(st, src, 1, 3); poserBoost(st, 'fondation', 6, 1800); ev.push('◇ contrat · ' + c.n + (a ? ' · ' + RARETES[a.r][0] + ' ' + a.n : '')); } }); return ev; }
  // ---- LES SIGNAUX DE ROSA : un événement toutes les 4 à 9 minutes (Clickion ouvert) ----
  function signal(st) { var k = st.clickion; if (!k) return null; var now = Date.now();
    if (k.sig && k.sig.fin > now) return k.sig; if (k.sig && k.sig.fin <= now) { k.sig = null; k.sigProchain = now + (240 + Math.random() * 300) * 1000; }
    if (!k.sigProchain) k.sigProchain = now + 90000; if (now < k.sigProchain) return null;
    k.sig = Math.random() < 0.5 ? { t: 'anomalie', fin: now + 12000, n: 0, but: 25 } : { t: 'choix', fin: now + 30000 }; k.sigProchain = now + (240 + Math.random() * 300) * 1000; return k.sig; }
  function derniereTransmission(st) { var o = (st.clickion && st.clickion.ouverts) || []; for (var i = o.length - 1; i >= 0; i--) if (JOURNAL[o[i]]) return { id: o[i], n: i + 1, t: JOURNAL[o[i]][0], lien: JOURNAL[o[i]][1] }; return null; }
  window.jOSXerClicker = { OUVRE: OUVRE, JOURNAL: JOURNAL, derniereTransmission: derniereTransmission, ouvrir: ouvrir, VOIES: VOIES, voiesEtat: voiesEtat, ECHELLE: ECHELLE, comparer: comparer, phrase: phrase, DIMS_MAX: DIMS_MAX, RARETES: RARETES, ARTEFACTS: ARTEFACTS, trouver: trouver, artefactsL: artefactsL, compter: compter, jour: jour, contratsDuJour: contratsDuJour, signal: signal, UNIVERS: UNIVERS, universDe: universDe, uMod: uMod, universL: universL, voyager: voyager, GRAINES: GRAINES, EXPS: EXPS, AUTOS: AUTOS, parcelles: parcelles, dureeGraine: dureeGraine, dureeExp: dureeExp, coutAuto: coutAuto, perk: perk, automates: automates, poserBoost: poserBoost, LORE: LORE, lore: lore, IMPLANTS: IMPLANTS, coutImplant: coutImplant, modulesL: modulesL, fusionner: fusionner, lier: lier, ecoule: ecoule, KEY_RECORD: 'xb:xpclick:record', addL: addL, subL: subL, deN: deN, versN: versN, fmtL: fmtL, GENS: GENS, PALIERS: PALIERS, normaliser: normaliser, multiplicateurs: multiplicateurs,
    production: production, clic: clic, REELS: REELS, palierReel: palierReel, MISSIONS: MISSIONS, missionsEtat: missionsEtat, reclamerMission: reclamerMission, UPG: UPG, upgEtat: upgEtat, acheterUpg: acheterUpg, SUCCES: SUCCES, nouveauxSucces: nouveauxSucces, ECLATS: ECLATS, eclat: eclat, boostL: boostL, QUETES: QUETES, quetesDuJour: quetesDuJour, etatQuetes: etatQuetes, reclamerQuete: reclamerQuete, ARBRE: ARBRE, BRANCHES: BRANCHES, effets: effets, techEtat: techEtat, acheterTech: acheterTech, valeurCond: valeurCond, genL: genL, possedes: possedes, debloque: debloque, coutL: coutL, maxAchetable: maxAchetable, acheter: acheter, gagner: gagner, rattraper: rattraper,
    AVANT: AVANT, dimensionsAGagner: dimensionsAGagner, plonger: plonger, nouveauxPaliers: nouveauxPaliers, fins: fins, importer: importer, nombreL: nombreL };
})();
;

/* script 2/2 */

(function () {
  function esc(x) { var d = document.createElement('div'); d.textContent = x == null ? '' : String(x); return d.innerHTML; }
  function quand(t) { var s = Math.round((Date.now() - Date.parse(t)) / 1000); return s < 3600 ? Math.max(1, Math.round(s / 60)) + ' min' : s < 86400 ? Math.round(s / 3600) + ' h' : Math.round(s / 86400) + ' j'; }
  var NOMS = { ploxions: '◌ ploxions', heures: '◍ heures', tsoins: '⧗ tsoins', cles: '▣ boxion', fichiers: '⌸ fichiers', posts: '△ posts', partages: '⇄ partages', amis: '⚇ amis', invites: '◆ invités', arrives: '◆ arrivés', pieces: '⁂ pièces' };
  function vib(k) { try { if (window.jOSNatif && window.jOSNatif.vibrer) window.jOSNatif.vibrer(k); else if (navigator.vibrate) navigator.vibrate(k === 'succes' ? [18, 40, 18] : 6); } catch (e) {} }
  var KEY = 'xb:xpclick', SEUIL = 40;
  // le réel : le palier 1 a commencé avec Clickion ; le réel passera au palier 2 dans 50 ans (« une info du xerboxion » : publiée, jamais écrite par une partie)
  var PALIER1 = Date.parse('2026-10-16T00:00:00Z'), CINQUANTE = 50 * 365.25 * 864e5, AN = 365.25 * 864e5;
  // (18.10, RS-7 : « le jeu dure 50 ans, le deuxième palier jusqu'à 250 ans, le troisième 700, le quatrième 1000, le cinquième 4200, le sixième
  // 7000, le septième EONS ») — les fins des paliers, en années depuis le 16.10.2026. Personne n'y arrive sans l'immortalité quantique : le
  // but est de trouver les autres xeroctions. On reste au palier tant que le réel n'a pas franchi le suivant.
  var PALIERS_T = [[1, 50], [2, 250], [3, 700], [4, 1000], [5, 4200], [6, 7000], [7, Infinity]];
  var LIEUX = [
    ['pourriture-4', '▣', 'Pourriture-4', 'le labo de RS-7, la station au seuil du Nexus', true], ['machine-a-tsoins', '⧗', 'La machine à tsoins', 'la mémoire du Cube : rejouer le réel'],
    ['xerfarm', '⸙', 'Xerfarm', 'la ferme : le vivant qui produit'], ['xerax', '⌬', 'Xerax', 'le cerveau : les idées, la mémoire'],
    ['xerbot', '⏣', 'xerbot', 'le corps : les capteurs, les objets'], ['wormion', '◎', 'Le wormion', 'voyager jusqu\'au Cube d\'un autre'],
    ['portion', '◈', 'Portion', 'fusionner deux cubes'], ['space-cubion', '⬡', 'Space-cubion', 'le cocon de transport, entre les dimensions'],
    ['universal-suit', '⟠', 'Universal-suit', 'les implants, l\'armure'],
  ];
  var OUVRE = window.jOSXerClicker.OUVRE, JOURNAL = window.jOSXerClicker.JOURNAL;   // dans le moteur : le jeu montre aussi les transmissions
  function mount(c) {
    var C = window.jOSXerClicker, vivant = true, tab = 'cube', st = null, envoiT = 0, est_xo = false, regMap = null;
    function lireLocal() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
    st = C.normaliser(lireLocal()); st.clickion = st.clickion || { voies: [], calcul: null, nee: Date.now() };
    var lien = C.lier({ get: function () { return st; }, set: function (n) { st = n; st.clickion = st.clickion || { voies: [], calcul: null, nee: Date.now() }; }, apres: function () { dessiner(); } });
    function sauver(force) { lien.sauver(force); }
    var vision = null;
    try { fetch('/px/clickion/vision', { credentials: 'same-origin', headers: { Accept: 'application/json' } }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.ok) return; vision = d; est_xo = !!d.xeroction; st.clickion.sceaux = (d.sceaux || []).length; st.clickion.mes = d.mesures || {}; st.clickion.xo = est_xo; st.clickion.palier = d.palier; sauver(true); dessiner(); }).catch(function () {}); } catch (e) {}
    est_xo = est_xo || !!(st.clickion && st.clickion.xo);
    try { if (window.jOSUsage && window.jOSUsage.registry) Promise.resolve(window.jOSUsage.registry()).then(function (m) { regMap = m || {}; }).catch(function () {}); } catch (e) {}
    function contexte() {
      var U = window.jOSUsage, px = {}; try { px = (U && U.stats && U.stats().px) || {}; } catch (e) {}
      var ids = Object.keys(px).filter(function (id) { return (px[id].opens || 0) > 0 || (px[id].seconds || 0) > 0; }), R = regMap || {}, h = 0;
      if (vision && vision.ploxions) vision.ploxions.forEach(function (x) { if (ids.indexOf(x) < 0) ids.push(x); });
      ids.forEach(function (id) { h += ((px[id] && px[id].seconds) || 0) / 3600; });
      var T = 0; try { T = window.jOSTsoin && window.jOSTsoin.list ? window.jOSTsoin.list().length : 0; } catch (e) {}
      if (vision && vision.mesures) { T = Math.max(T, vision.mesures.tsoins || 0); h = Math.max(h, vision.mesures.heures || 0); }
      return { decouverts: Object.keys(R).length ? ids.filter(function (id) { return R[id]; }).length : ids.length, total: Object.keys(R).length, tsoins: T, heures: h, categories: [], jour: {} };
    }
    // ---- le Cube : un polyèdre qui respire ; une excroissance par catégorie du vecteur xerion, longue comme ton temps passé ----
    var vecteur = {};
    try { if (window.jOSUsage && window.jOSUsage.vecteur) Promise.resolve(window.jOSUsage.vecteur()).then(function (v) { vecteur = v || {}; if (tab === 'cube') dessiner(); }).catch(function () {}); } catch (e) {}
    function cube() {
      var cats = Object.keys(vecteur).sort(function (a, b) { return vecteur[b] - vecteur[a]; }).slice(0, 8), age = Math.max(0, st.stats && st.stats.meilleur || 0);
      var s = 64 + Math.min(26, age / 6), cx = 150, cy = 156, h = s * 0.58;
      var top = [[cx, cy - s], [cx + s * 0.87, cy - s / 2], [cx, cy], [cx - s * 0.87, cy - s / 2]], gauche = [[cx - s * 0.87, cy - s / 2], [cx, cy], [cx, cy + s], [cx - s * 0.87, cy + s / 2]], droite = [[cx, cy], [cx + s * 0.87, cy - s / 2], [cx + s * 0.87, cy + s / 2], [cx, cy + s]];
      var pts = function (a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); };
      var exc = cats.map(function (k, i) { var w = vecteur[k], an = (i / Math.max(1, cats.length)) * Math.PI * 2 - Math.PI / 2, r0 = s * 0.95, r1 = r0 + 18 + w * 120;
        var x0 = cx + Math.cos(an) * r0, y0 = cy + Math.sin(an) * r0 * 0.8, x1 = cx + Math.cos(an) * r1, y1 = cy + Math.sin(an) * r1 * 0.8, pa = an + Math.PI / 2, l = 5 + w * 14;
        return '<polygon points="' + (x0 + Math.cos(pa) * l).toFixed(1) + ',' + (y0 + Math.sin(pa) * l).toFixed(1) + ' ' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' ' + (x0 - Math.cos(pa) * l).toFixed(1) + ',' + (y0 - Math.sin(pa) * l).toFixed(1) + '" fill="#14261d" stroke="#79d9a2" stroke-width="1.6" stroke-linejoin="round"/>'
          + '<text x="' + (cx + Math.cos(an) * (r1 + 12)).toFixed(1) + '" y="' + (cy + Math.sin(an) * (r1 + 12) * 0.8 + 3).toFixed(1) + '" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="10" fill="#9d93b8">' + esc(k) + '</text>'; }).join('');
      var stade = (st.clickion.ouverts || []).filter(function (x) { return /^cube\d/.test(x); }).length, anneaux = '';
      for (var a = 0; a < stade; a++) anneaux += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + (s * 1.25 + a * 9) + '" ry="' + ((s * 1.25 + a * 9) * 0.8) + '" fill="none" stroke="#79d9a2" stroke-opacity="' + (0.5 - a * 0.04).toFixed(2) + '" stroke-dasharray="' + (2 + a) + ' ' + (5 + a * 2) + '"/>';
      return '<svg viewBox="0 0 300 300" aria-hidden="true"><g class="corps">' + anneaux + exc
        + '<polygon points="' + pts(gauche) + '" fill="#151021" stroke="#a597cf" stroke-width="2.2" stroke-linejoin="round"/><polygon points="' + pts(droite) + '" fill="#0f0b18" stroke="#a597cf" stroke-width="2.2" stroke-linejoin="round"/>'
        + '<polygon points="' + pts(top) + '" fill="#1a1428" stroke="#c3b8e6" stroke-width="2.2" stroke-linejoin="round"/><circle cx="' + cx + '" cy="' + (cy - s / 2) + '" r="4" fill="#79d9a2"/></g></svg>';
    }
    function pic() { return Math.max((st.stats && st.stats.meilleur) || 0, st.L || 0); }
    function ouvert(id) { if (id === 'cube') return true; if (id === 'univers') return ouvert('l:space-cubion'); for (var i = 0; i < OUVRE.length; i++) if (OUVRE[i][0] === id) return pic() >= OUVRE[i][1]; return true; }
    function prochain() { for (var i = 0; i < OUVRE.length; i++) if (pic() < OUVRE[i][1]) return OUVRE[i]; return null; }
    function seuil(id) { for (var i = 0; i < OUVRE.length; i++) if (OUVRE[i][0] === id) return OUVRE[i][1]; return 0; }
    // une ouverture = un ×2 permanent + un signal ; détectée, jamais déclarée
    function verifierOuvertures() {
      var nn = C.ouvrir(st), neuf = nn.length ? nn[nn.length - 1] : null;
      if (neuf) { vib('succes'); var t = document.createElement('div'); t.className = 'ck-ouvre'; t.textContent = '◈ ' + neuf[2] + (JOURNAL[neuf[0]] ? ' · ⧉' : ''); document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600); sauver(true); dessiner(); }
    }
    function rosa() {
      var lignes = ['…signal faible. je t\'entends.', 'un tsoin = un instant de réel.', 'palier 1.'].concat(pic() >= 50 ? ['la fin est au réel.'] : [], pic() >= 60 ? ['le wormion répond.'] : [], pic() >= 85 ? ['le cocon tient.'] : [], pic() >= 120 ? ['je grandis avec toi.'] : [], est_xo ? ['pourriture-4 : ouverte.'] : pic() >= 46 ? ['pourriture-4 : fermée.'] : []);
      var o = st.clickion.ouverts || []; for (var i = o.length - 1; i >= 0; i--) if (JOURNAL[o[i]]) { lignes.push(JOURNAL[o[i]][0]); break; }
      return lignes[Math.floor(Date.now() / 20000) % lignes.length];
    }
    function vueCube() {
      var pr = C.production(contexte(), st);
      return '<div class="ck-tete"><div class="ck-n" data-n>' + C.fmtL(st.L) + '</div><div class="ck-p"><b data-p>+' + C.fmtL(pr.L) + '</b> /s</div><div class="ck-ech ck-mono" data-ech>' + esc(C.phrase(st.L)) + '</div>' + (C.universDe(st).id !== 'reel' ? '<div class="ck-ici-u ck-mono">' + C.universDe(st).g + ' ' + esc(C.universDe(st).n) + '</div>' : '') + '</div>'
        + '<button class="ck-cube" data-cube aria-label="toucher le Cube">' + cube() + '</button>'
        + '<div class="ck-rosa"><b>Rosa</b><span data-rosa>' + esc(rosa()) + '</span></div>'
        + '<div data-sig-place>' + vueSignal() + '</div>' + vueProchain() + vueSources(pr);
    }
    // le prochain déblocage : son nom, son seuil, la barre depuis le précédent (en exposants)
    function avancee() { var n = prochain(), avant = 40; OUVRE.forEach(function (x) { if (x[1] <= pic()) avant = Math.max(avant, x[1]); }); return n ? Math.min(100, Math.max(0, (pic() - avant) / Math.max(1, n[1] - avant) * 100)) : 100; }
    function vueProchain() {
      var n = prochain(), fait = (st.clickion.ouverts || []).length;
      return '<div class="ck-carte ck-suivant"><div class="ck-ligne"><span class="ck-mono">◈ ' + fait + ' / ' + OUVRE.length + '</span>' + (n ? '<b>' + esc(n[2]) + '</b><span class="ck-mono">10^' + n[1] + '</span>' : '<b>tout est ouvert</b>') + '</div>' + (n ? '<div class="ck-mono" style="margin-top:3px">' + esc(C.phrase(n[1])) + '</div>' : '')
        + (n ? '<span class="ck-barre"><i data-prochain style="width:' + avancee().toFixed(1) + '%"></i></span>' : '') + '</div>';
    }
    // ce qui fait monter le nombre : chaque source et son multiplicateur (×10^x)
    function vueSources(pr) {
      var m = pr.m || {}, o = (st.clickion.ouverts || []).length, src = [
        ['∞', 'dimensions', st.dims ? C.fmtL(Math.log10(st.dims)) : '0', m.dimensions], ['◈', 'ouvertures', o, m.ouverts], ['◇', 'sceaux', st.clickion.sceaux || 0, m.sceaux],
        ['⌬', 'calcul', st.clickion.calcul ? C.fmtL(Math.log10(st.clickion.calcul.record || 1)) + ' op/s' : '—', m.calcul], ['◌', 'ploxions', contexte().decouverts, m.decouverte],
        ['⧗', 'tsoins', contexte().tsoins, m.tsoins], ['✦', 'arbre', Object.keys(st.tech || {}).length, m.arbre], ['▲', 'succès', Object.keys(st.succes || {}).length, m.succes]];
      return '<div class="ck-sources">' + src.map(function (x) { return '<div><i>' + x[0] + '</i><b>' + esc(String(x[2])) + '</b><small>' + x[1] + '</small><em>' + (x[3] > 0.005 ? '×' + C.fmtL(x[3]) : '—') + '</em></div>'; }).join('') + '</div>';
    }
    function modDe(lieu) { var m = MODS.filter(function (x) { return x[3] === 'l:' + lieu; })[0]; return m ? m[0] : null; }
    function vueEchelle() {
      var L = st.L || 0, cp = C.comparer(L);
      return '<h3 class="ck-h">⇡ l\'échelle</h3><div class="ck-carte"><b>' + C.fmtL(L) + '</b><p>' + esc(C.phrase(L)) + '</p>'
        + (cp && cp.prochain ? '<span class="ck-barre"><i style="width:' + cp.pc.toFixed(1) + '%"></i></span><span class="ck-mono">prochain : ' + esc(cp.prochain[1]) + ' · 10^' + C.fmtL(Math.log10(cp.prochain[0])) + '</span>' : '') + '</div>'
        + '<div class="ck-echelle">' + C.ECHELLE.slice().reverse().map(function (x) { var ok = L >= x[0], p = L / x[0];
          return '<div class="' + (ok ? 'ok' : '') + '"><span class="ck-mono">10^' + (x[0] < 1e6 ? (Math.round(x[0] * 100) / 100) : C.fmtL(Math.log10(x[0]))) + '</span><b>' + esc(x[1]) + '</b><em>' + (ok ? (p >= 1.05 ? '× ^' + (p < 1000 ? p.toFixed(p < 10 ? 1 : 0) : C.fmtL(Math.log10(p))) : '✓') : '') + '</em></div>'; }).join('')
        + '</div>' + '<h3 class="ck-h">◈ les paliers</h3><div class="ck-echelle">' + OUVRE.map(function (x) { return '<div class="' + (pic() >= x[1] ? 'ok' : '') + '"><span class="ck-mono">10^' + x[1] + '</span><b>' + esc(x[2]) + '</b><em>' + esc(C.phrase(x[1]).replace('≈ ', '')) + '</em></div>'; }).join('') + '</div>';
    }
    function vueReelEtSceaux() { return vueReel() + vueEchelle() + (ouvert('sceaux') ? vueSceaux() : ''); }
    function vueReel() {
      var ecoule = Math.max(0, Date.now() - PALIER1), pc = ecoule / CINQUANTE, ans = ecoule / (365.25 * 864e5), cx = contexte();
      var ici = PALIERS_T.filter(function (x) { return ans < x[1]; })[0], debut = ici[0] > 1 ? PALIERS_T[ici[0] - 2][1] : 0;
      return '<h3 class="ck-h">palier ' + ici[0] + '</h3><div class="ck-carte"><span class="ck-barre"><i style="width:' + (isFinite(ici[1]) ? ((ans - debut) / (ici[1] - debut) * 100).toFixed(4) : 0) + '%"></i></span><span class="ck-mono">' + ans.toFixed(3) + ' / ' + (isFinite(ici[1]) ? ici[1] : '∞') + ' ans</span></div>'
        + '<div class="ck-echelle">' + PALIERS_T.map(function (x, i) { var d = i ? PALIERS_T[i - 1][1] : 0, fait = ans >= x[1], la = x === ici;
          return '<div class="' + (fait || la ? 'ok' : '') + '"><span class="ck-mono">palier ' + x[0] + '</span><b>' + (isFinite(x[1]) ? d + ' → ' + x[1] + ' ans' : d + ' ans → eons') + '</b><em>' + (la ? '◉ ici' : fait ? '✓' : isFinite(x[1]) ? (x[1] - d) + ' ans' : '∞') + '</em></div>'; }).join('') + '</div>'
        + '<div class="ck-carte ck-mono">⧗ ' + cx.tsoins + ' · ◍ ' + Math.round(cx.heures) + ' h · ◌ ' + cx.decouverts + ' / ' + (cx.total || '?') + '</div>'
        + '<h3 class="ck-h">lieux</h3>'
        + LIEUX.map(function (l) { var verrou = !l[4] && !ouvert('l:' + l[0]); if (verrou) return '<div class="ck-lieu ferme"><i>⊘</i><div><b>· · ·</b><small class="ck-mono">10^' + seuil('l:' + l[0]) + '</small></div></div>'; var ferme = l[4] && !est_xo, e = vision && vision.lieux && vision.lieux[l[0]]; return '<div class="ck-lieu' + (ferme ? ' ferme' : '') + '"><i>' + l[1] + '</i><div><b>' + esc(l[2]) + '</b>' + (e ? '<small class="ck-mono">' + e.n + ' données' + (e.le ? ' · il y a ' + quand(e.le) : '') + '</small>' : '') + '</div>' + (ferme ? '<i>⊘</i>' : (modDe(l[0]) ? '<button class="act" data-mod-lieu="' + modDe(l[0]) + '">◫</button> ' : '') + '<button class="sec" data-aller="' + l[0] + '">↗</button>') + '</div>'; }).join('');
    }
    function vueSceaux() {
      if (!vision) return '';
      var m = vision.mesures, eu = {}, E = vision.echelles; (vision.sceaux || []).forEach(function (x) { eu[x] = 1; });
      var buts = Object.keys(NOMS).map(function (k) { var v = +m[k] || 0, n = E.filter(function (e) { return eu[k + ':' + e]; }).length, prochain = E[n];
        return { k: k, v: v, n: n, p: prochain, pc: prochain ? Math.min(99, Math.log10(1 + v) / Math.log10(1 + prochain) * 100) : 100 }; }).sort(function (a, b) { return b.pc - a.pc; });
      return '<h3 class="ck-h">◇ sceaux · ' + (vision.sceaux || []).length + ' <span class="ck-mono" style="float:right">×' + C.fmtL(C.production(contexte(), st).m.sceaux) + '</span></h3>'
        + buts.map(function (x) { return '<div class="ck-but"><b>' + NOMS[x.k] + '</b><span class="ck-mono">' + x.v + (x.p ? ' → ' + x.p : ' ✓') + '</span><span class="ck-barre"><i style="width:' + x.pc.toFixed(1) + '%"></i></span><span class="ck-mono ck-pts">' + E.map(function (e, i) { return i < x.n ? '◆' : '◇'; }).join('') + '</span></div>'; }).join('');
    }
    var serie = 'tr';
    function vueJournal() {
      var o = st.clickion.ouverts || [], lo = st.clickion.lore || [], S = [['tr', '⧉', 'transmissions'], ['▣', '▣', 'lieux'], ['✦', '✦', 'RS'], ['◇', '◇', 'fondation'], ['◎', '◎', 'univers'], ['∞', '∞', 'le Cube'], ['⚙', '⚙', 'automates']];
      var nTr = o.filter(function (id) { return JOURNAL[id]; }).length, tot = nTr + lo.length, max = Object.keys(JOURNAL).length + C.LORE.length;
      var h = '<h3 class="ck-h">⧉ journal · ' + tot + ' / ' + max + '</h3><div class="ck-series">' + S.map(function (s) {
        var n = s[0] === 'tr' ? nTr : C.LORE.filter(function (x) { return x[1] === s[0] && lo.indexOf(x[0]) >= 0; }).length, m = s[0] === 'tr' ? Object.keys(JOURNAL).length : C.LORE.filter(function (x) { return x[1] === s[0]; }).length;
        return '<button class="' + (serie === s[0] ? 'on' : '') + '" data-serie="' + s[0] + '"><i>' + s[1] + '</i>' + s[2] + '<small>' + n + ' / ' + m + '</small></button>'; }).join('') + '</div>';
      if (serie === 'tr') return h + OUVRE.slice().reverse().map(function (x) { var j = JOURNAL[x[0]]; if (!j) return ''; var i = OUVRE.indexOf(x) + 1;
          if (o.indexOf(x[0]) < 0) return '<div class="ck-frag ferme"><span class="ck-mono">' + ('000' + i).slice(-4) + '</span><p>⊘ 10^' + x[1] + '</p></div>';
          return '<div class="ck-frag"><span class="ck-mono">' + ('000' + i).slice(-4) + ' · ' + esc(x[2]) + '</span><p>' + esc(j[0]) + '</p>' + (j[1] ? '<a class="ck-mono" href="' + j[1] + '" target="_blank" rel="noopener">→ wiki</a>' : '') + '</div>'; }).join('');
      return h + C.LORE.filter(function (x) { return x[1] === serie; }).map(function (x) { var ok = lo.indexOf(x[0]) >= 0;
        return '<div class="ck-frag' + (ok ? '' : ' ferme') + '"><span class="ck-mono">' + x[1] + ' · ' + esc(x[2]) + '</span><p>' + (ok ? esc(x[3]) : '⊘') + '</p></div>'; }).join('');
    }
    function vueVoies() {
      var vs = C.voiesEtat(st), n = vs.filter(function (v) { return v.on; }).length, tot = vs.reduce(function (a, v) { return a + (v.on ? v.L : 0); }, 0), niv = vs.reduce(function (a, v) { return a + (v.on ? v.niv : 0); }, 0);
      return '<div class="ck-rs"><div><b>RS</b><small>' + esc(st.clickion.palier || (vision ? vision.palier : '…')) + '</small></div><div><b>' + (est_xo ? '6 / 6' : n + ' / 2') + '</b><small>voies</small></div><div><b>' + niv + '</b><small>niveaux</small></div><div><b>×' + C.fmtL(tot) + '</b><small>production</small></div></div>'
        + '<div class="ck-voies">' + vs.map(function (v) {
          var bas = Math.pow(10, v.niv / 3) - 1, pc = Math.max(0, Math.min(100, (v.val - bas) / Math.max(1, v.prochain - bas) * 100)), R = 26, P = 2 * Math.PI * R;
          return '<button class="ck-voie' + (v.on ? ' on' : '') + '" data-voie="' + v.id + '"' + (est_xo ? ' disabled' : '') + '>'
            + '<svg viewBox="0 0 64 64" class="ck-emb"><circle cx="32" cy="32" r="' + R + '" fill="none" stroke="#272036" stroke-width="5"/><circle cx="32" cy="32" r="' + R + '" fill="none" stroke="' + (v.on ? '#79d9a2' : '#5b5274') + '" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + (P * pc / 100).toFixed(1) + ' ' + P.toFixed(1) + '" transform="rotate(-90 32 32)"/><text x="32" y="31" text-anchor="middle" font-size="18" fill="' + (v.on ? '#ddd6ea' : '#7f7699') + '">' + v.g + '</text><text x="32" y="47" text-anchor="middle" font-size="10" font-family="ui-monospace,monospace" fill="#a597cf">' + v.niv + '</text></svg>'
            + '<div><b>' + esc(v.n) + '</b><small>' + v.val + ' / ' + v.prochain + ' ' + esc(v.unite) + '</small><small class="pk">' + esc(v.perk) + '</small><em>×' + C.fmtL(v.L) + '</em></div></button>'; }).join('')
        + '<div class="ck-voie xo' + (est_xo ? ' on' : ' ferme') + '"><b>◆ xeroction</b><small>' + (est_xo ? 'toutes les voies' : 'ton propre boxion') + '</small></div></div>';
    }
    function vueCalcul() {
      var k = st.clickion.calcul;
      return '<h3 class="ck-h">⌬</h3><div class="ck-carte"><b>' + (k ? C.fmtL(Math.log10(k.ops)) + ' op/s' : '—') + '</b>' + (k ? '<div class="ck-mono">record ' + C.fmtL(Math.log10(k.record || k.ops)) + '</div>' : '') + '<p><button class="act" data-calcul>⌬ 2 s</button></p></div>'
        + (!ouvert('elan') ? '<h3 class="ck-h">⊘</h3><div class="ck-carte ck-mono">10^' + seuil('elan') + '</div>' : '')
        + (!ouvert('elan') ? '' : '<h3 class="ck-h">➚ élan</h3><div class="ck-carte"><b data-elan>' + (elan.on ? Math.round(elan.kmh) + ' km/h · ' + elan.g.toFixed(2) + ' g · ×' + elan.mult.toFixed(1) : '—') + '</b><div class="ck-mono">record ' + Math.round((st.clickion.elan || {}).kmh || 0) + ' km/h</div><p><button class="' + (elan.on ? 'sec' : 'act') + '" data-elan-bouton>' + (elan.on ? '■' : '➚') + '</button></p></div>');
    }

    // ======== LES MODULES (RS-7 16.10 : « des modules auxquels on peut jouer pour avancer encore plus vite ») ========
    // Un module par lieu du lore, ouvert avec son lieu. Chaque partie a un effet RÉEL sur la production (boost passager ou multiplicateur permanent).
    var MODS = [['rythme', '⧗', 'machine à tsoins', 'l:machine-a-tsoins', 'rythme · boost'], ['ferme', '⸙', 'xerfarm', 'l:xerfarm', 'récoltes · permanent'],
      ['memoire', '⌬', 'xerax', 'l:xerax', 'mémoire · permanent'], ['exped', '⏣', 'xerbot', 'l:xerbot', 'expéditions · permanent'], ['calcul', '⚙', 'calcul', 'calcul', 'processeur · permanent'],
      ['elan', '➚', 'élan', 'elan', 'vitesse · boost'], ['saut', '◎', 'wormion', 'l:wormion', 'saut · gain immédiat'], ['implants', '⟠', 'universal-suit', 'l:universal-suit', 'implants · permanent']];
    var mod = null, jeu = null;
    function toast(t) { var d = document.createElement('div'); d.className = 'ck-ouvre'; d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2600); }
    // le retour d'expédition et les comptes à rebours : à chaque tic, sans redessiner (une partie en cours n'est jamais coupée)
    function tickModules() {
      var avant = st.clickion.sig, sgn = C.signal(st);
      if (sgn !== avant) { var pl = c.querySelector('[data-sig-place]'); if (pl) pl.innerHTML = vueSignal(); else if (sgn) toast('ϟ Rosa · un signal (◈ cube)'); }
      var sd = c.querySelector('[data-sig-cd]'); if (sgn && sd) sd.textContent = (sgn.t === 'anomalie' ? sgn.n + ' / ' + sgn.but + ' · ' : '') + Math.max(0, Math.ceil((sgn.fin - Date.now()) / 1000)) + ' s';
      var k = st.clickion, ev = C.automates(st, contexte()), lo = C.lore(st);
      ev.forEach(function (t) { if (!/auto/.test(t)) toast(t); }); lo.forEach(function (x) { toast(x[1] + ' ' + x[2] + ' · ⧉'); });
      if (ev.length || lo.length) { sauver(true); if (tab === 'modules' && !jeu && ev.some(function (t) { return !/auto/.test(t); })) return dessiner(); }
      if (tab === 'modules' && !mod) { var ct = c.querySelector('.ck-contrats'); if (ct && ev.length) ct.outerHTML = vueContrats(); }
      if (tab !== 'modules' && tab !== 'univers') return;
      [].forEach.call(c.querySelectorAll('[data-mod-etat]'), function (e) { e.textContent = etatMod(e.getAttribute('data-mod-etat')); });
      [].forEach.call(c.querySelectorAll('[data-parc-cd]'), function (e) { var p = (k.ferme || [])[+e.getAttribute('data-parc-cd')]; if (p) { if (p.fin <= Date.now() && !jeu) return dessiner(); e.textContent = duree(p.fin - Date.now()); } });
      var ec = c.querySelector('[data-exp-cd]'), eb = c.querySelector('[data-exp-barre]'); if (k.exp && ec) { ec.textContent = duree(k.exp.fin - Date.now()); if (eb) eb.style.width = Math.min(100, (1 - (k.exp.fin - Date.now()) / (C.dureeExp(st, k.exp.i) * 1000)) * 100).toFixed(1) + '%'; }
      var vc = c.querySelector('[data-voyage-cd]'); if (vc) { var va = (k.voyageT || 0) - Date.now(); if (va <= 0) return dessiner(); vc.textContent = '⬡ ' + duree(va); }
      var sc = c.querySelector('[data-saut-cd]'); if (sc) { var a = ((k.saut && k.saut.pret) || 0) - Date.now(); if (a <= 0 && !jeu) dessiner(); else sc.textContent = duree(a); }
    }   // le module ouvert ; la partie en cours (rythme, mémoire, saut)
    function boost(nom, Lm, sec) { st.boosts = (st.boosts || []).filter(function (b) { return b.n !== nom && b.fin > Date.now(); }); st.boosts.push({ k: 'prod', m: Lm, fin: Date.now() + sec * 1000, n: nom }); sauver(true); }
    function resteBoost(nom) { var b = (st.boosts || []).filter(function (x) { return x.n === nom && x.fin > Date.now(); })[0]; return b ? '×' + C.fmtL(b.m) + ' · ' + Math.ceil((b.fin - Date.now()) / 60000) + ' min' : ''; }
    function duree(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return s >= 3600 ? Math.floor(s / 3600) + ' h ' + Math.floor(s % 3600 / 60) + ' min' : s >= 60 ? Math.floor(s / 60) + ' min ' + (s % 60) + ' s' : s + ' s'; }
    function vueAuto(id) {
      var i = -1; C.AUTOS.forEach(function (a, j) { if (a[0] === id) i = j; }); if (i < 0) return '';
      var a = C.AUTOS[i], on = !!(st.clickion.autos || {})[id], cout = C.coutAuto(st, i), ok = st.L != null && st.L >= cout;
      return '<div class="ck-auto' + (on ? ' on' : '') + '"><i>⚙</i><div><b>automate</b><small>' + esc(a[3]) + '</small></div>' + (on ? '<span class="ck-mono">✓ actif</span>' : '<button class="' + (ok ? 'act' : 'sec') + '" data-auto="' + id + '"' + (ok ? '' : ' disabled') + '>10^' + cout + '</button>') + '</div>';
    }
    function vueModules() {
      if (mod) return '<button class="sec ck-retour" data-mod-retour>←</button>' + vueAuto(mod) + (mod === 'rythme' ? vueRythme() : mod === 'ferme' ? vueFerme() : mod === 'memoire' ? vueMemoire() : mod === 'exped' ? vueExped() : mod === 'saut' ? vueSaut() : mod === 'implants' ? vueImplants() : mod === 'collection' ? vueCollection() : vueCalcul());
      var ml = C.modulesL(st), tot = ml.ferme + ml.xerax + ml.xerbot + ml.implants;
      return vueContrats() + '<button class="ck-mod ck-coll" data-mod="collection"><i>◆</i><b>collection</b><small>' + C.ARTEFACTS.filter(function (a) { return (st.clickion.coll || {})[a.id] > 0; }).length + ' / ' + C.ARTEFACTS.length + ' artefacts</small><em>×' + C.fmtL(C.artefactsL(st)) + '</em></button>'
        + '<h3 class="ck-h">◫ modules <span class="ck-mono" style="float:right">permanent ×' + C.fmtL(tot) + '</span></h3><div class="ck-mods">'
        + MODS.map(function (m) { var ok = ouvert(m[3]); return ok ? '<button class="ck-mod" data-mod="' + m[0] + '"><i>' + m[1] + '</i><b>' + esc(m[2]) + '</b><small>' + m[4] + '</small><em data-mod-etat="' + m[0] + '">' + etatMod(m[0]) + '</em>' + ((st.clickion.autos || {})[m[0]] ? '<u>⚙</u>' : '') + '</button>'
          : '<div class="ck-mod ferme"><i>⊘</i><b>· · ·</b><small>10^' + seuil(m[3]) + '</small></div>'; }).join('') + '</div>';
    }
    function etatMod(id) {
      var k = st.clickion, ml = C.modulesL(st);
      if (id === 'rythme') return resteBoost('rythme') || '—';
      if (id === 'ferme') { var mur = (k.ferme || []).filter(function (p) { return p && p.fin <= Date.now(); }).length; return (mur ? '❀ ' + mur + ' prêtes · ' : '') + '×' + C.fmtL(ml.ferme); }
      if (id === 'memoire') return 'record ' + ((k.xerax && k.xerax.record) || 0) + ' · ×' + C.fmtL(ml.xerax);
      if (id === 'exped') return k.exp ? (k.exp.fin <= Date.now() ? '⏣ de retour' : '⏣ ' + duree(k.exp.fin - Date.now())) : (k.pieces || 0) + ' pièces · ×' + C.fmtL(ml.xerbot);
      if (id === 'calcul') return k.calcul ? C.fmtL(Math.log10(k.calcul.record || 1)) + ' op/s' : '—';
      if (id === 'elan') return elan.on ? Math.round(elan.kmh) + ' km/h' : (k.elan ? 'record ' + Math.round(k.elan.kmh) + ' km/h' : '—');
      if (id === 'saut') return 'combo ' + ((k.saut && k.saut.combo) || 0);
      if (id === 'implants') return '×' + C.fmtL(ml.implants);
      return '';
    }
    // ⧗ RYTHME : un curseur balaie la barre ; toucher quand il passe dans la zone. 8 battements ; chaque coup parfait = ×10 pendant 10 min.
    function vueRythme() {
      if (!jeu || jeu.t !== 'rythme') return '<h3 class="ck-h">⧗ machine à tsoins</h3><div class="ck-carte"><b>' + (resteBoost('rythme') || '8 battements') + '</b><p><button class="act" data-rythme-go>⧗ jouer</button></p></div>';
      return '<h3 class="ck-h">⧗ ' + jeu.n + ' / 8 · ' + jeu.ok + ' ✓</h3><div class="ck-piste"><span class="ck-zone" style="left:' + ((0.42 - C.perk(st, 'docteur')) * 100).toFixed(1) + '%;width:' + ((0.16 + 2 * C.perk(st, 'docteur')) * 100).toFixed(1) + '%"></span><span class="ck-curseur" style="animation-duration:' + jeu.p + 'ms"></span></div>'
        + '<button class="ck-gros" data-rythme-tap>⧗</button><div class="ck-mono" data-jeu-msg>' + (jeu.msg || '') + '</div>';
    }
    function rythmeTap() {
      var pos = ((performance.now() - jeu.t0) % jeu.p) / jeu.p, tri = pos < 0.5 ? pos * 2 : 2 - pos * 2;   // aller-retour 0→1→0
      var dz = C.perk(st, 'docteur'), bon = tri >= 0.42 - dz && tri <= 0.58 + dz; jeu.n++; if (bon) { jeu.ok++; jeu.p = Math.max(520, jeu.p * 0.9); vib('succes'); } else vib('erreur');
      jeu.msg = bon ? '✓' : '✗';
      if (jeu.n >= 8) { var g = jeu.ok; jeu = null; st.clickion.rythmeN = (st.clickion.rythmeN || 0) + 1; C.compter(st, 'rythme'); trouvaille(C.trouver(st, 'rythme', 0.05 + g * 0.03)); if (g) { boost('rythme', g, 600); toast('⧗ ' + g + ' / 8 · ×' + C.fmtL(g) + ' · 10 min'); } return dessiner(); }
      dessiner();
    }
    // ⸙ XERFARM : 6 parcelles ; une graine pousse en temps réel (même app fermée) ; la récolte s'ajoute pour toujours.
    var GRAINES = C.GRAINES;
    function vueFerme() {
      var k = st.clickion, P = C.parcelles(st), g = k.graine || 0;
      return '<h3 class="ck-h">⸙ xerfarm <span class="ck-mono" style="float:right">' + (k.recoltes || 0) + ' récoltés · ×' + C.fmtL(C.modulesL(st).ferme) + '</span></h3>'
        + '<div class="ck-graines">' + GRAINES.map(function (x, i) { return '<button class="' + (i === g ? 'act' : 'sec') + '" data-graine="' + i + '">' + x[0] + ' ' + x[1] + ' · ' + duree(C.dureeGraine(st, i) * 1000) + ' · +' + x[3] + '</button>'; }).join('') + '</div>'
        + '<div class="ck-parcelles">' + P.map(function (p, i) { if (!p) return '<button class="ck-parc vide" data-parc="' + i + '">＋</button>';
          var mur = p.fin <= Date.now(); return '<button class="ck-parc' + (mur ? ' mur' : '') + '" data-parc="' + i + '"><i>' + (mur ? '❀' : GRAINES[p.g][0]) + '</i><small data-parc-cd="' + i + '">' + (mur ? 'récolter' : duree(p.fin - Date.now())) + '</small></button>'; }).join('') + '</div>';
    }
    // ⌬ XERAX : retenir une suite de glyphes (une de plus à chaque tour). Record = multiplicateur permanent ; chaque tour réussi = un boost 5 min.
    var GLY = ['△', '▢', '◯', '◇', '✦', '⬡'];
    function vueMemoire() {
      var rec = (st.clickion.xerax && st.clickion.xerax.record) || 0;
      if (!jeu || jeu.t !== 'memoire') return '<h3 class="ck-h">⌬ xerax</h3><div class="ck-carte"><b>record ' + rec + '</b><p><button class="act" data-memoire-go>⌬ jouer</button></p></div>';
      return '<h3 class="ck-h">⌬ ' + jeu.seq.length + '</h3><div class="ck-seq" data-seq>' + (jeu.montre ? '' : jeu.rep.map(function (i) { return GLY[i]; }).join(' ')) + '</div>'
        + '<div class="ck-glyphes">' + GLY.map(function (g, i) { return '<button class="sec" data-gly="' + i + '"' + (jeu.montre ? ' disabled' : '') + '>' + g + '</button>'; }).join('') + '</div>';
    }
    function memoireTour() {
      if (!jeu || jeu.t !== 'memoire') return;
      jeu.seq.push(Math.floor(Math.random() * GLY.length)); jeu.rep = []; jeu.montre = true; dessiner();
      var i = 0, z = c.querySelector('[data-seq]');
      (function un() { if (!jeu || jeu.t !== 'memoire' || !vivant) return; if (i >= jeu.seq.length) { jeu.montre = false; return dessiner(); }
        z = c.querySelector('[data-seq]'); if (z) z.textContent = GLY[jeu.seq[i]]; setTimeout(function () { if (z) z.textContent = ''; i++; setTimeout(un, 180); }, 560); })();
    }
    function memoireGly(i) {
      jeu.rep.push(i); var n = jeu.rep.length;
      if (jeu.seq[n - 1] !== i) { var r = jeu.seq.length - 1, k = st.clickion.xerax = st.clickion.xerax || { record: 0 }; if (r > k.record) { k.record = r; toast('⌬ record ' + r); } vib('erreur'); jeu = null; sauver(true); return dessiner(); }
      if (n === jeu.seq.length) { vib('succes'); boost('xerax', n, 300); var jx = C.jour(st); jx.xeraxMax = Math.max(jx.xeraxMax || 0, n); if (n >= 3) trouvaille(C.trouver(st, 'memoire', 0.12)); var k2 = st.clickion.xerax = st.clickion.xerax || { record: 0 }; if (n > k2.record) k2.record = n; sauver(true); return setTimeout(memoireTour, 400); }
      dessiner();
    }
    // ⏣ XERBOT : une expédition (temps réel) ; au retour, des pièces (multiplicateur permanent). Une à la fois.
    var EXPS = C.EXPS;
    function vueExped() {
      var k = st.clickion;
      return '<h3 class="ck-h">⏣ xerbot <span class="ck-mono" style="float:right">' + (k.pieces || 0) + ' pièces · ×' + C.fmtL(C.modulesL(st).xerbot) + '</span></h3>'
        + (k.exp ? '<div class="ck-carte"><b>⏣ ' + esc(EXPS[k.exp.i][0]) + '</b><span class="ck-barre"><i data-exp-barre style="width:' + Math.min(100, (1 - (k.exp.fin - Date.now()) / (C.dureeExp(st, k.exp.i) * 1000)) * 100).toFixed(1) + '%"></i></span><span class="ck-mono" data-exp-cd>' + (k.exp.fin <= Date.now() ? 'de retour' : duree(k.exp.fin - Date.now())) + '</span></div>'
          : EXPS.map(function (x, i) { return '<button class="ck-lieu ck-exp" data-exp="' + i + '"><i>⏣</i><div><b>' + x[0] + '</b><small class="ck-mono">' + duree(C.dureeExp(st, i) * 1000) + ' · +' + x[2] + ' pièces</small></div><span>▶</span></button>'; }).join(''));
    }
    // ◎ WORMION : attraper l'ouverture (une zone étroite, ailleurs à chaque saut). Réussi = gain immédiat de (1 + combo) × 10 min de production.
    function vueSaut() {
      var k = st.clickion.saut = st.clickion.saut || { combo: 0, pret: 0 }, attente = k.pret - Date.now();
      if (!jeu || jeu.t !== 'saut') return '<h3 class="ck-h">◎ wormion · combo ' + k.combo + '</h3><div class="ck-carte"><b>' + (1 + k.combo) + ' × 10 min</b><p>' + (attente > 0 ? '<span class="ck-mono" data-saut-cd>' + duree(attente) + '</span>' : '<button class="act" data-saut-go>◎ sauter</button>') + '</p></div>';
      return '<h3 class="ck-h">◎</h3><div class="ck-piste"><span class="ck-zone" style="left:' + (jeu.z * 100).toFixed(1) + '%;width:' + (jeu.w * 100).toFixed(1) + '%"></span><span class="ck-curseur" style="animation-duration:' + jeu.p + 'ms"></span></div><button class="ck-gros" data-saut-tap>◎</button>';
    }
    function sautTap() {
      var pos = ((performance.now() - jeu.t0) % jeu.p) / jeu.p, tri = pos < 0.5 ? pos * 2 : 2 - pos * 2, k = st.clickion.saut;
      var bon = tri >= jeu.z && tri <= jeu.z + jeu.w; jeu = null; k.pret = Date.now() + 20000;
      if (bon) { var p = C.production(contexte(), st).L; if (p != null) C.gagner(st, p + Math.log10(600 * (1 + k.combo))); toast('◎ +' + C.fmtL(p + Math.log10(600 * (1 + k.combo)))); k.combo++; var js = C.jour(st); js.sautMax = Math.max(js.sautMax || 0, k.combo); trouvaille(C.trouver(st, 'saut', 0.2)); vib('succes'); }
      else { k.combo = 0; vib('erreur'); toast('◎ ✗'); }
      sauver(true); dessiner();
    }
    // ⟠ UNIVERSAL-SUIT : six implants payés avec le nombre ; chaque niveau ×10^3 pour toujours.
    function vueImplants() {
      var k = st.clickion.implants = st.clickion.implants || {};
      return '<h3 class="ck-h">⟠ universal-suit <span class="ck-mono" style="float:right">×' + C.fmtL(C.modulesL(st).implants) + '</span></h3>'
        + C.IMPLANTS.map(function (x, i) { var cout = C.coutImplant(st, i), ok = st.L != null && st.L >= cout;
          return '<div class="ck-lieu"><i>' + x[1] + '</i><div><b>' + x[2] + ' · ' + (k[x[0]] || 0) + '</b><small class="ck-mono">10^' + cout + '</small></div><button class="' + (ok ? 'act' : 'sec') + '" data-implant="' + i + '"' + (ok ? '' : ' disabled') + '>×10^3</button></div>'; }).join('');
    }
    // ======== LES UNIVERS : la carte, le voyage (space-cubion), la palette de l'univers courant ========
    var uniVu = null;   // l'univers sélectionné sur la carte
    function vueUnivers() {
      var U = C.UNIVERS, cur = C.universDe(st), k = st.clickion, T = k.uniT || {}, sel = U.filter(function (u) { return u.id === (uniVu || cur.id); })[0] || cur;
      var W = 340, H = 300, pts = U.map(function (u, i) { var a = i / U.length * Math.PI * 2.4 - Math.PI / 2, rr = 40 + i * 13; return [W / 2 + Math.cos(a) * rr, H / 2 + Math.sin(a) * rr * 0.82]; });
      var chemin = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
      var carte = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ck-carte-u"><path d="' + chemin + '" fill="none" stroke="var(--bd2)" stroke-width="1.5" stroke-dasharray="3 5"/>'
        + U.map(function (u, i) { var p = pts[i], ok = u.ok(k, st), ici = u.id === cur.id, vu = (k.visites || []).indexOf(u.id) >= 0;
          return '<g class="ck-noeud" data-uni="' + u.id + '" style="cursor:pointer">' + (ici ? '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="21" fill="none" stroke="' + u.pal[1] + '" stroke-width="1.5" class="ck-ici"/>' : '')
            + '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="15" fill="' + (ok ? u.pal[2] : '#0a0712') + '" stroke="' + (ok ? u.pal[0] : '#3a3050') + '" stroke-width="' + (sel.id === u.id ? 3 : 1.6) + '"' + (ok ? '' : ' stroke-dasharray="3 3"') + '/>'
            + '<text x="' + p[0] + '" y="' + (p[1] + 5) + '" text-anchor="middle" font-size="14" fill="' + (ok ? u.pal[1] : '#5b5274') + '">' + (ok ? u.g : '⊘') + '</text>'
            + '<text x="' + p[0] + '" y="' + (p[1] + 29) + '" text-anchor="middle" font-size="8.5" font-family="ui-monospace,monospace" fill="' + (vu || ici ? '#ddd6ea' : '#7f7699') + '">' + esc(u.n) + '</text></g>'; }).join('') + '</svg>';
      var ok = sel.ok(k, st), attente = (k.voyageT || 0) - Date.now(), min = (T[sel.id] || 0) / 60, regle = sel.m ? sel.d : sel.d + ' · maintenant : ' + JSON.stringify(C.uMod(st)).replace(/[{}"]/g, '').replace(/,/g, ' · ');
      return '<h3 class="ck-h">◎ univers · ' + (k.visites || []).length + ' visités <span class="ck-mono" style="float:right">×' + C.fmtL(C.universL(st)) + '</span></h3>' + carte
        + '<div class="ck-carte ck-uni" style="border-color:' + sel.pal[0] + '"><div class="ck-ligne"><b style="color:' + sel.pal[1] + '">' + sel.g + ' ' + esc(sel.n) + '</b>' + (sel.id === cur.id ? '<span class="ck-mono">ici</span>' : '') + '</div>'
        + '<p>' + esc(regle) + '</p><div class="ck-mono">' + (ok ? Math.round(min) + ' min passées · ×' + C.fmtL(2 * Math.log10(1 + min)) + ' pour toujours' : '⊘ ' + esc(sel.cl)) + '</div>'
        + (sel.id === cur.id || !ok ? '' : '<p>' + (attente > 0 ? '<span class="ck-mono" data-voyage-cd>⬡ ' + duree(attente) + '</span>' : '<button class="act" data-voyager="' + sel.id + '">⬡ voyager</button>') + '</p>') + '</div>';
    }
    function arrivee(u) {
      var d = document.createElement('div'); d.className = 'ck-arrivee'; d.style.background = u.pal[2]; d.innerHTML = '<i style="color:' + u.pal[1] + '">' + u.g + '</i><b style="color:' + u.pal[0] + '">' + esc(u.n) + '</b>';
      document.body.appendChild(d); setTimeout(function () { d.remove(); }, 1700);
    }
    function palette() { var u = C.universDe(st); return '--a:' + u.pal[0] + ';--b:' + u.pal[1] + ';background:' + u.pal[2] + ';'; }
    // ======== LA COLLECTION, LES CONTRATS DE LA FONDATION, LES SIGNAUX DE ROSA ========
    function vueContrats() {
      var cs = C.contratsDuJour(st);
      return '<div class="ck-carte ck-contrats"><div class="ck-ligne"><b>◇ fondation · contrats du jour</b><span class="ck-mono">' + cs.filter(function (x) { return x.fait; }).length + ' / 3</span></div>'
        + cs.map(function (x) { return '<div class="ck-contrat' + (x.fait ? ' fait' : '') + '"><i>' + x.g + '</i><span>' + esc(x.n) + '</span><em class="ck-mono">' + (x.fait ? '✓' : x.v + ' / ' + x.but) + '</em><span class="ck-barre"><i style="width:' + Math.min(100, x.v / x.but * 100).toFixed(0) + '%"></i></span></div>'; }).join('')
        + '<div class="ck-mono" style="margin-top:6px">récompense : un artefact (rareté ×3) + ×10^6 · 30 min</div></div>';
    }
    function vueCollection() {
      var c = st.clickion.coll || {}, R = C.RARETES, sets = {};
      C.ARTEFACTS.forEach(function (a) { (sets[a.src] = sets[a.src] || []).push(a); });
      var n = C.ARTEFACTS.filter(function (a) { return c[a.id] > 0; }).length, NOMS_S = { rythme: '⧗ machine à tsoins', ferme: '⸙ xerfarm', memoire: '⌬ xerax', exped: '⏣ xerbot', saut: '◎ wormion', univers: '⬡ univers' };
      return '<h3 class="ck-h">◆ collection · ' + n + ' / ' + C.ARTEFACTS.length + ' <span class="ck-mono" style="float:right">×' + C.fmtL(C.artefactsL(st)) + '</span></h3>'
        + Object.keys(sets).map(function (s) { var t = sets[s].filter(function (a) { return c[a.id] > 0; }).length;
          return '<div class="ck-set"><div class="ck-ligne"><b>' + NOMS_S[s] + '</b><span class="ck-mono">' + t + ' / 6' + (t >= 6 ? ' · ×10^10' : '') + '</span></div><div class="ck-arts">'
            + sets[s].map(function (a) { var k = c[a.id] || 0; return k ? '<div class="ck-art r' + a.r + '"><i>' + R[a.r][0] + '</i><b>' + esc(a.n) + '</b><small>' + R[a.r][1] + (k > 1 ? ' · ×' + k : '') + '</small></div>' : '<div class="ck-art vide"><i>?</i><small>' + R[a.r][1] + '</small></div>'; }).join('') + '</div></div>'; }).join('');
    }
    function vueSignal() {
      var s = C.signal(st); if (!s) return '';
      if (s.t === 'anomalie') return '<div class="ck-signal" data-signal><b>ϟ anomalie</b><span>touche le Cube ' + s.but + ' fois</span><em class="ck-mono" data-sig-cd>' + s.n + ' / ' + s.but + ' · ' + Math.ceil((s.fin - Date.now()) / 1000) + ' s</em></div>';
      return '<div class="ck-signal" data-signal><b>ϟ Rosa · choisis</b><div class="ck-choix"><button class="act" data-choix="boost">×10^6 · 15 min</button><button class="sec" data-choix="temps">1 h de production</button></div><em class="ck-mono" data-sig-cd>' + Math.ceil((s.fin - Date.now()) / 1000) + ' s</em></div>';
    }
    function signalReussi(txt) { var k = st.clickion; k.sig = null; k.signauxN = (k.signauxN || 0) + 1; C.compter(st, 'signaux'); vib('succes'); toast(txt); sauver(true); dessiner(); }
    function trouvaille(a) { if (a) toast(C.RARETES[a.r][0] + ' ' + a.n + ' · ' + C.RARETES[a.r][1]); }
    function vueSave() {
      return '<div class="ck-carte"><p><button class="act" data-exporter>exporter</button> <button class="sec" data-coord>→ coord</button></p><textarea data-save></textarea><p><button class="sec" data-importer>importer</button> <span class="ck-mono" data-msg></span></p></div>';
    }
    function dessiner() {
      if (!vivant) return;
      if (!((st.stats && st.stats.meilleur) >= SEUIL || (st.saisons || []).some(function (x) { return x.L >= SEUIL; }))) {
        c.innerHTML = '<div class="ck"><div class="ck-verrou"><div class="g">◈</div><h2>Clickion</h2><p><b>10^40</b> · ' + C.fmtL(st.stats && st.stats.meilleur) + '</p><button class="act" data-aller="xp">▶</button></div></div>';
        return;
      }
      if (!ouvert(tab)) tab = 'cube';
      if (jeu && (jeu.t === 'rythme' || jeu.t === 'saut')) setTimeout(function () { if (jeu) jeu.t0 = performance.now(); }, 0);
      c.innerHTML = '<div class="ck" style="' + palette() + '"><div class="ck-corps">' + (tab === 'cube' ? vueCube() : tab === 'reel' ? vueReelEtSceaux() : tab === 'modules' ? vueModules() : tab === 'univers' ? vueUnivers() : tab === 'journal' ? vueJournal() : tab === 'voies' ? vueVoies() : tab === 'calcul' ? vueCalcul() : vueSave()) + '</div>'
        + '<nav class="ck-nav">' + [['cube', '◈', 'cube'], ['modules', '◫', 'modules'], ['univers', '◎', 'univers'], ['journal', '⧉', 'journal'], ['reel', '⧗', 'réel'], ['voies', '✦', 'voies'], ['save', '⇅', 'partie']].map(function (t) { return ouvert(t[0]) ? '<button data-tab="' + t[0] + '" class="' + (tab === t[0] ? 'on' : '') + '"><i>' + t[1] + '</i>' + t[2] + '</button>' : '<button class="ferme" disabled><i>⊘</i>' + seuil(t[0]) + '</button>'; }).join('') + '</nav></div>';
    }
    // ---- l'élan : vitesse GPS (m/s → km/h) + accélération (le capteur de mouvement) → un boost ×(1 + km/h / 20 + 4·g) tant qu'on bouge ----
    var elan = { on: false, kmh: 0, g: 0, mult: 1, geo: null, mv: null };
    function poserElan() {
      elan.mult = 1 + (elan.kmh / 20 + 4 * elan.g) * (C.uMod(st).elanX || 1);
      st.boosts = (st.boosts || []).filter(function (b) { return b.n !== 'élan' && b.fin > Date.now(); });
      if (elan.mult > 1.05) st.boosts.push({ k: 'prod', m: Math.log10(elan.mult), fin: Date.now() + 4000, n: 'élan' });
      var r = st.clickion.elan = st.clickion.elan || { kmh: 0 }; if (elan.kmh > r.kmh) r.kmh = elan.kmh;
      var e = c.querySelector('[data-elan]'); if (e) e.textContent = Math.round(elan.kmh) + ' km/h · ' + elan.g.toFixed(2) + ' g · ×' + elan.mult.toFixed(1);
    }
    function elanOn() {
      elan.on = true;
      try { if (navigator.geolocation) elan.geo = navigator.geolocation.watchPosition(function (p) { var v = p.coords.speed; elan.kmh = v != null && v > 0 ? v * 3.6 : 0; poserElan(); }, function () {}, { enableHighAccuracy: true, maximumAge: 2000 }); } catch (e) {}
      try { if (window.jOSNatif && window.jOSNatif.mouvement && window.jOSNatif.mouvement.ecouter) elan.mv = window.jOSNatif.mouvement.ecouter(function (m) { elan.g = 0.8 * elan.g + 0.2 * Math.hypot(m.ax || 0, m.ay || 0, m.az || 0); poserElan(); }); } catch (e) {}
    }
    function elanOff() { elan.on = false; elan.kmh = 0; elan.g = 0; try { if (elan.geo != null) navigator.geolocation.clearWatch(elan.geo); } catch (e) {} try { if (elan.mv) elan.mv(); } catch (e) {} elan.geo = elan.mv = null; poserElan(); }
    function maj() { var ec = c.querySelector('[data-ech]'); if (ec) ec.textContent = C.phrase(st.L); var n = c.querySelector('[data-n]'), p = c.querySelector('[data-p]'), r = c.querySelector('[data-rosa]'); if (n) n.textContent = C.fmtL(st.L); if (p) p.textContent = '+' + C.fmtL(C.production(contexte(), st).L); if (r) r.textContent = rosa(); }
    function calculer() {
      // un vrai calcul (des racines, des multiplications) pendant ~2 s, par tranches pour ne pas figer l'écran
      return new Promise(function (ok) { var ops = 0, t0 = performance.now(), x = 1.0001;
        (function tranche() { var t = performance.now(); while (performance.now() - t < 40) { for (var i = 0; i < 20000; i++) { x = Math.sqrt(x * 1.0000001 + i) * 0.5 + 1; } ops += 20000; }
          if (performance.now() - t0 < 2000) setTimeout(tranche, 0); else ok(ops / ((performance.now() - t0) / 1000)); })(); });
    }
    c.addEventListener('click', function (e) {
      var nu = e.target.closest('[data-uni]'); if (nu) { uniVu = nu.getAttribute('data-uni'); vib('selection'); return dessiner(); }
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.tab) { if (b.dataset.tab !== 'modules') { mod = null; jeu = null; } tab = b.dataset.tab; vib('selection'); return dessiner(); }
      if (b.hasAttribute('data-cube')) { var g = C.clic(contexte(), st); C.gagner(st, g); st.clics = (st.clics || 0) + 1; C.compter(st, 'touches');
        var sg = st.clickion.sig; if (sg && sg.t === 'anomalie' && sg.fin > Date.now()) { sg.n++; var sc2 = c.querySelector('[data-sig-cd]'); if (sc2) sc2.textContent = sg.n + ' / ' + sg.but + ' · ' + Math.ceil((sg.fin - Date.now()) / 1000) + ' s';
          if (sg.n >= sg.but) { var srcs = ['rythme', 'ferme', 'memoire', 'exped', 'saut', 'univers'], aa = C.trouver(st, srcs[Math.floor(Math.random() * 6)], 1, 2); signalReussi('ϟ anomalie · ' + (aa ? C.RARETES[aa.r][0] + ' ' + aa.n : '')); } } vib('leger'); b.classList.remove('bat'); void b.offsetWidth; b.classList.add('bat');
        var f = document.createElement('span'); f.className = 'ck-flot'; f.textContent = '+' + C.fmtL(g); f.style.left = (e.clientX || innerWidth / 2) + 'px'; f.style.top = (e.clientY || innerHeight / 2) + 'px'; document.body.appendChild(f); setTimeout(function () { f.remove(); }, 900); maj(); sauver(); return; }
      if (b.dataset.voie) { if (est_xo) return; var v = st.clickion.voies = st.clickion.voies || [], i = v.indexOf(b.dataset.voie); if (i >= 0) v.splice(i, 1); else { v.push(b.dataset.voie); while (v.length > 2) v.shift(); } vib('selection'); sauver(true); return dessiner(); }
      if (b.dataset.aller) { try { if (window.jOS && window.jOS.openPloxion) return window.jOS.openPloxion(b.dataset.aller); } catch (er) {} location.href = '/px/' + encodeURIComponent(b.dataset.aller); return; }
      if (b.dataset.modLieu) { tab = 'modules'; mod = b.dataset.modLieu; jeu = null; return dessiner(); }
      if (b.dataset.voyager) { if (C.voyager(st, b.dataset.voyager)) { var uu = C.universDe(st); vib('succes'); arrivee(uu); uniVu = null; sauver(true); } return dessiner(); }
      if (b.dataset.choix) { var pc2 = C.production(contexte(), st).L; if (b.dataset.choix === 'boost') { boost('rosa', 6, 900); signalReussi('ϟ ×10^6 · 15 min'); } else { if (pc2 != null) C.gagner(st, pc2 + Math.log10(3600)); signalReussi('ϟ +' + C.fmtL(pc2 + Math.log10(3600))); } return; }
      if (b.dataset.serie) { serie = b.dataset.serie; return dessiner(); }
      if (b.dataset.mod) { mod = b.dataset.mod; jeu = null; vib('selection'); return dessiner(); }
      if (b.hasAttribute('data-mod-retour')) { mod = null; jeu = null; return dessiner(); }
      if (b.dataset.auto) { var ai = -1; C.AUTOS.forEach(function (a, j) { if (a[0] === b.dataset.auto) ai = j; }); var ca = C.coutAuto(st, ai);
        if (ai >= 0 && st.L != null && st.L >= ca) { st.L = C.subL(st.L, ca); (st.clickion.autos = st.clickion.autos || {})[b.dataset.auto] = Date.now(); vib('succes'); toast('⚙ automate · ' + C.AUTOS[ai][2]); sauver(true); } return dessiner(); }
      if (b.hasAttribute('data-rythme-go')) { jeu = { t: 'rythme', n: 0, ok: 0, p: 1300, t0: performance.now() }; return dessiner(); }
      if (b.hasAttribute('data-rythme-tap')) { if (jeu && jeu.t === 'rythme') rythmeTap(); return; }
      if (b.dataset.graine != null) { st.clickion.graine = +b.dataset.graine; return dessiner(); }
      if (b.dataset.parc != null) { var P = C.parcelles(st), i2 = +b.dataset.parc, pp = P[i2], G = GRAINES[st.clickion.graine || 0];
        if (!pp) { P[i2] = { g: st.clickion.graine || 0, fin: Date.now() + C.dureeGraine(st, st.clickion.graine || 0) * 1000 }; vib('leger'); }
        else if (pp.fin <= Date.now()) { st.clickion.recoltes = (st.clickion.recoltes || 0) + GRAINES[pp.g][3]; C.compter(st, 'recoltes', GRAINES[pp.g][3]); trouvaille(C.trouver(st, 'ferme', 0.04 * (1 + pp.g))); P[i2] = null; vib('succes'); toast('❀ +' + GRAINES[pp.g][3]); }
        sauver(true); return dessiner(); }
      if (b.hasAttribute('data-memoire-go')) { jeu = { t: 'memoire', seq: [], rep: [] }; return memoireTour(); }
      if (b.dataset.gly != null) { if (jeu && jeu.t === 'memoire' && !jeu.montre) memoireGly(+b.dataset.gly); return; }
      if (b.dataset.exp != null) { if (!st.clickion.exp) { st.clickion.exp = { i: +b.dataset.exp, fin: Date.now() + C.dureeExp(st, +b.dataset.exp) * 1000 }; st.clickion.expDerniere = +b.dataset.exp; vib('selection'); sauver(true); } return dessiner(); }
      if (b.hasAttribute('data-saut-go')) { jeu = { t: 'saut', p: 900 + Math.random() * 500, z: 0.1 + Math.random() * 0.75, w: Math.max(0.06, 0.14 - 0.01 * ((st.clickion.saut && st.clickion.saut.combo) || 0)) + C.perk(st, 'shaman'), t0: performance.now() }; return dessiner(); }
      if (b.hasAttribute('data-saut-tap')) { if (jeu && jeu.t === 'saut') sautTap(); return; }
      if (b.dataset.implant != null) { var ii = +b.dataset.implant, ct = C.coutImplant(st, ii); if (st.L != null && st.L >= ct) { st.L = C.subL(st.L, ct); var im = st.clickion.implants = st.clickion.implants || {}, nm = C.IMPLANTS[ii][0]; im[nm] = (im[nm] || 0) + 1; vib('succes'); toast(C.IMPLANTS[ii][1] + ' ' + C.IMPLANTS[ii][2] + ' ' + im[nm]); sauver(true); } return dessiner(); }
      if (b.hasAttribute('data-elan-bouton')) { if (elan.on) elanOff(); else elanOn(); vib('selection'); return dessiner(); }
      if (b.hasAttribute('data-calcul')) { b.disabled = true; b.textContent = 'le cœur tourne…'; return calculer().then(function (ops) { var k = st.clickion.calcul || {}; st.clickion.calcul = { ops: ops, le: Date.now(), record: Math.max(ops, k.record || 0) }; vib('succes'); sauver(true); dessiner(); }); }
      if (b.hasAttribute('data-exporter')) { var t = c.querySelector('[data-save]'); t.value = btoa(unescape(encodeURIComponent(JSON.stringify(st)))); try { navigator.clipboard.writeText(t.value); } catch (er) {} c.querySelector('[data-msg]').textContent = '✓ copiée'; return; }
      if (b.hasAttribute('data-coord')) { var txt = 'Ma partie de Clickion : ' + C.fmtL(st.L) + ' · ' + (st.dims || 0) + ' dimensions\n' + btoa(unescape(encodeURIComponent(JSON.stringify(st))));
        try { if (window.jOS && window.jOS.openPloxion) return window.jOS.openPloxion('coord', { params: { texte: txt } }); } catch (er) {} location.href = '/px/coord?texte=' + encodeURIComponent(txt.slice(0, 1800)); return; }
      if (b.hasAttribute('data-importer')) { try { var d = JSON.parse(decodeURIComponent(escape(atob(c.querySelector('[data-save]').value.trim())))); lien.poser(C.fusionner(st, d)); sauver(true); vib('succes'); dessiner(); } catch (er) { c.querySelector('[data-msg]').textContent = '! sauvegarde illisible'; } }
    });
    var t0 = Date.now(), tic = setInterval(function () { if (!vivant || document.hidden) { t0 = Date.now(); return; } var now = Date.now(), dt = C.ecoule(st); t0 = now;
      var cx = contexte(), p = C.production(cx, st).L, au = C.effets(st).auto; if (p != null && dt > 0) C.gagner(st, p + Math.log10(dt)); if (au && dt > 0 && dt < 5) C.gagner(st, C.clic(cx, st) + Math.log10(au * dt)); st.t = now; maj(); verifierOuvertures(); tickModules(); var bp = c.querySelector('[data-prochain]'), n = prochain(); if (bp && n) bp.style.width = avancee().toFixed(1) + '%'; sauver(); }, 1000);
    var r = C.rattraper(contexte(), st, Date.now()); dessiner();
    return { unmount: function () { vivant = false; clearInterval(tic); elanOff(); lien.fin(); sauver(true); c.innerHTML = ''; } };
  }
  window.jOSApps = window.jOSApps || {};
  window.jOSApps['clickion'] = { manifest: { id: 'clickion', name: 'Clickion', icon: '◈' }, mount: mount };
})();
;

try{window.dispatchEvent(new CustomEvent('xb:app:registered',{detail:{id:"clickion"}}));}catch(e){}
