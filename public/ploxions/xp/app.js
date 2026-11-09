/* ploxion xp — app à la demande (/px/xp/app.js, format 2, 2 scripts) */
void 0;
(function(){try{var B=window.__PLOXIONS_BIONS__=window.__PLOXIONS_BIONS__||{};B["xp"]=["jOSGame","jOSTsoin","jOSUsage"];}catch(e){}})();
(function(){try{if(document.querySelector('style[data-px-css="'+"xp"+'"]'))return;var s=document.createElement('style');s.setAttribute('data-px-css',"xp");s.textContent="\n  .pxp { display:flex; flex-direction:column; height:100%; background:radial-gradient(circle at 50% 15%, rgba(30,46,70,.5), #06090d 72%);\n    color:rgba(220,232,240,.92); font-family:ui-sans-serif,system-ui,sans-serif; font-size:.84rem; overflow:hidden; }\n  .xp__tabs { flex:0 0 auto; display:flex; gap:6px; padding:9px 12px 0; }\n  .xp__tab { cursor:pointer; font-size:.74rem; font-weight:700; padding:6px 12px; border-radius:9px 9px 0 0; border:1px solid rgba(120,160,230,.2); border-bottom:0;\n    background:rgba(18,26,42,.4); color:rgba(160,195,255,.7); }\n  .xp__tab.on { background:rgba(40,64,110,.55); color:#fff; }\n  .xp__panel { flex:1; min-height:0; overflow-y:auto; }\n  /* --- progression (vrai jeu) --- */\n  .xp__head { padding:14px 14px 10px; text-align:center; }\n  .xp__lvl { font-weight:800; color:#fff; font-size:1.15rem; } .xp__lvl b { color:rgba(120,220,160,.95); }\n  .xp__tot { font-family:'Share Tech Mono',ui-monospace,monospace; color:rgba(150,200,255,.95); font-size:1.5rem; margin-top:2px; }\n  .xp__bar { height:9px; border-radius:20px; background:rgba(30,40,60,.7); border:1px solid rgba(120,160,230,.25); overflow:hidden; margin:8px auto 0; max-width:340px; }\n  .xp__barf { height:100%; background:linear-gradient(90deg,rgba(90,180,255,.85),rgba(120,220,160,.9)); transition:width .3s; }\n  .xp__next { font-size:.66rem; color:rgba(150,180,220,.6); margin-top:4px; }\n  .xp__sh { font-size:.66rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:rgba(150,190,255,.65); padding:12px 14px 5px; }\n  .xp__rules { padding:0 12px; }\n  .xp__r { display:flex; align-items:center; gap:11px; padding:8px 10px; border-radius:10px; margin-bottom:6px; border:1px solid rgba(120,160,230,.16); background:rgba(18,26,42,.45); }\n  .xp__ric { font-size:1.3rem; width:28px; text-align:center; }\n  .xp__rn { font-weight:600; color:#fff; } .xp__rm { font-size:.66rem; color:rgba(150,180,220,.6); }\n  .xp__rv { margin-left:auto; text-align:right; }\n  .xp__rxp { font-family:'Share Tech Mono',monospace; color:rgba(255,211,90,.95); font-weight:700; }\n  .xp__rc { font-size:.64rem; color:rgba(150,180,220,.6); }\n  .xp__log { padding:0 14px 10px; }\n  .xp__le { display:flex; gap:8px; align-items:center; font-size:.74rem; padding:4px 0; border-bottom:1px solid rgba(120,160,230,.08); }\n  .xp__le .lx { margin-left:auto; font-family:'Share Tech Mono',monospace; color:rgba(120,220,160,.9); }\n  .xp__ach { display:grid; grid-template-columns:repeat(auto-fill,minmax(96px,1fr)); gap:7px; padding:2px 12px 16px; }\n  .xp__a { text-align:center; padding:9px 5px; border-radius:11px; border:1px solid rgba(120,160,230,.16); background:rgba(18,26,42,.4); opacity:.4; }\n  .xp__a.on { opacity:1; border-color:rgba(255,211,90,.5); background:rgba(50,42,12,.5); }\n  .xp__aic { font-size:1.5rem; } .xp__an { font-size:.66rem; font-weight:700; color:#fff; margin-top:2px; } .xp__ax { font-size:.6rem; color:rgba(255,211,90,.85); }\n  /* --- idle (cookie clicker) --- */\n  .xp__orbwrap { display:flex; justify-content:center; padding:14px 0 6px; position:relative; }\n  .xp__orb { width:120px; height:120px; border-radius:50%; cursor:pointer; border:0; font-size:3rem;\n    background:radial-gradient(circle at 38% 32%, rgba(150,220,255,.95), rgba(60,120,220,.85) 60%, rgba(30,60,140,.9));\n    box-shadow:0 0 36px rgba(90,160,255,.5), inset 0 -8px 20px rgba(0,0,0,.3); color:#fff; user-select:none; transition:transform .06s; }\n  .xp__orb:active { transform:scale(.92); }\n  .xp__float { position:absolute; pointer-events:none; color:rgba(180,230,255,.95); font-weight:700; font-size:.9rem; animation:xpf .8s ease-out forwards; }\n  @keyframes xpf { from { opacity:1; transform:translateY(0); } to { opacity:0; transform:translateY(-38px); } }\n  .xp__gens { padding:6px 11px 11px; }\n  .xp__g { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:10px; margin-bottom:6px; border:1px solid rgba(120,160,230,.18); background:rgba(18,26,42,.5); cursor:pointer; }\n  .xp__g.no { opacity:.5; cursor:not-allowed; } .xp__gic { font-size:1.4rem; width:30px; text-align:center; }\n  .xp__gn { font-weight:600; color:#fff; } .xp__gm { font-size:.66rem; color:rgba(150,180,220,.65); }\n  .xp__gr { margin-left:auto; text-align:right; } .xp__gc { font-family:'Share Tech Mono',monospace; color:rgba(120,220,160,.95); font-size:.8rem; } .xp__go { font-size:.66rem; color:rgba(150,180,220,.6); }\n  .xp__idlehead { text-align:center; padding:10px 0 0; font-size:.72rem; color:rgba(150,180,220,.6); }\n  /* --- LE CLICKER DU XERBOXION (13.10) : chill-tekk, pensé iPhone — le cœur au centre, les commandes au pouce, aucun dégradé ;\n     le cœur et l'anneau suivent le téléphone (var(--mx) / var(--my), le thème vivant de ploxi0n) --- */\n  .xc { --xa:#a597cf; --xb:#79d9a2; --xt:#ddd6ea; --xm:#7f7699; --xs:#0f0b18; --xs2:#151021; --xbd:#272036; --xbd2:#3a3050;\n    position:relative; color:var(--xt); padding:6px 14px calc(96px + env(safe-area-inset-bottom,0px)); font-family:-apple-system,system-ui,sans-serif; -webkit-user-select:none; user-select:none; }\n  .xc-absent { margin:4px auto 0; width:max-content; max-width:100%; padding:6px 12px; border-radius:11px; border:1.5px solid rgba(121,217,162,.45); color:var(--xb); font:600 12px ui-monospace,Menlo,monospace; }\n  .xc-tete { text-align:center; padding:14px 0 2px; }\n  .xc-total { font:800 clamp(34px,11vw,52px)/1.05 ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:-.01em; color:var(--xt);\n    text-shadow:calc(var(--mx,0) * -1.6px) calc(var(--my,0) * -1.6px) 0 rgba(0,0,0,.9); font-variant-numeric:tabular-nums; }\n  .xc-sous { margin-top:6px; font:600 12.5px ui-monospace,Menlo,monospace; letter-spacing:.06em; color:var(--xm); }\n  .xc-sous span { color:var(--xb); }\n  .xc-coeur { display:block; margin:10px auto 4px; width:min(62vw,250px); aspect-ratio:1; border:0; background:none; padding:0; cursor:pointer;\n    -webkit-tap-highlight-color:transparent; touch-action:manipulation; translate:calc(var(--mx,0) * 8px) calc(var(--my,0) * 8px); transition:transform .08s; }\n  .xc-coeur:active { transform:scale(.94); }\n  .xc-coeur.bat .xc-h1 { animation:xcbat .32s cubic-bezier(.3,1.6,.4,1); }\n  @keyframes xcbat { 40% { transform:scale(1.06); } }\n  .xc-hex { width:100%; height:100%; overflow:visible; }\n  .xc-hex .xc-h1 { fill:var(--xs); stroke:var(--xa); stroke-width:5; stroke-linejoin:round; transform-origin:100px 100px;\n    filter:drop-shadow(calc(var(--mx,0) * -6px) calc(var(--my,0) * -6px + 8px) 10px rgba(0,0,0,.6)); }\n  .xc-hex .xc-h2 { fill:none; stroke:var(--xbd2); stroke-width:3; stroke-linejoin:round; translate:calc(var(--mx,0) * 3px) calc(var(--my,0) * 3px); }\n  .xc-hex .xc-noyau { fill:var(--xb); }\n  .xc-hex .xc-anneau-fond { fill:none; stroke:#1a1426; stroke-width:6; }\n  .xc-hex .xc-anneau { fill:none; stroke:var(--xb); stroke-width:6; stroke-linecap:round; transition:stroke-dasharray .4s; }\n  .xc-decouv { text-align:center; font:600 11.5px ui-monospace,Menlo,monospace; letter-spacing:.08em; color:var(--xm); margin-bottom:12px; }\n  .xc-decouv b { color:var(--xb); }\n  .xc-flot { position:absolute; pointer-events:none; transform:translate(-50%,-50%); font:800 18px ui-monospace,Menlo,monospace; color:var(--xb);\n    animation:xcflot .9s cubic-bezier(.2,.8,.3,1) forwards; text-shadow:0 2px 6px rgba(0,0,0,.8); }\n  @keyframes xcflot { to { opacity:0; transform:translate(-50%,-140%) scale(1.15); } }\n  .xc-corps { min-height:40vh; }\n  .xc-mode { display:flex; gap:6px; margin:0 0 10px; }\n  .xc-mode button { flex:1; min-height:38px; border-radius:11px; border:2px solid var(--xbd); background:var(--xs); color:var(--xm); font:700 13px ui-monospace,Menlo,monospace; }\n  .xc-mode button.on { border-color:var(--xb); color:var(--xt); }\n  .xc-g { display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:11px 13px; margin:0 0 8px; border-radius:15px;\n    border:2px solid var(--xbd); background:var(--xs); color:var(--xt); transition:transform .09s, border-color .15s, opacity .15s; opacity:.55; }\n  .xc-g.peut { opacity:1; border-color:var(--xbd2); }\n  .xc-g.peut:active { transform:scale(.97); border-color:var(--xb); }\n  .xc-g.non { animation:xcnon .3s; }\n  @keyframes xcnon { 25% { translate:-5px 0; } 75% { translate:5px 0; } }\n  .xc-g.verrou { opacity:.35; border-style:dashed; }\n  .xc-gi { width:40px; height:40px; flex:none; display:flex; align-items:center; justify-content:center; border-radius:12px; background:var(--xs2); border:1.5px solid var(--xbd);\n    font-size:20px; color:var(--xa); translate:calc(var(--mx,0) * 1.5px) calc(var(--my,0) * 1.5px); }\n  .xc-gt { flex:1; min-width:0; } .xc-gt b { display:block; font-weight:700; font-size:15px; } .xc-gt small { display:block; color:var(--xm); font:600 11px ui-monospace,Menlo,monospace; margin-top:2px; }\n  .xc-gc { text-align:right; } .xc-gc b { display:block; font:700 14px ui-monospace,Menlo,monospace; color:var(--xb); } .xc-gc small { display:block; font:600 11px ui-monospace,Menlo,monospace; color:var(--xm); margin-top:2px; }\n  .xc-g:not(.peut) .xc-gc b { color:var(--xm); }\n  .xc-note { color:var(--xm); font-size:13px; line-height:1.45; margin:2px 2px 12px; }\n  .xc-mult { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px; }\n  .xc-mult span { flex:1 1 30%; min-width:96px; padding:8px 10px; border-radius:12px; border:1.5px solid var(--xbd); background:var(--xs); color:var(--xm); font:600 10.5px ui-monospace,Menlo,monospace; text-transform:lowercase; }\n  .xc-mult b { display:block; margin-top:3px; color:var(--xt); font-size:14px; }\n  .xc-cat { display:flex; align-items:center; gap:10px; padding:9px 2px; border-bottom:1px solid rgba(190,175,230,.06); }\n  .xc-trans { margin:10px 14px 4px; padding:9px 12px; border-left:2px solid #79d9a2; background:rgba(15,11,24,.85); border-radius:0 10px 10px 0; font-size:13px; line-height:1.45; color:#ddd6ea; }\n  .xc-trans span { display:block; font:600 10px ui-monospace,Menlo,monospace; letter-spacing:.12em; color:#79d9a2; margin-bottom:3px; }\n  .xc-cat > div { flex:1; min-width:0; } .xc-cat b { font-size:14px; } .xc-cat em { font:600 12px ui-monospace,Menlo,monospace; color:var(--xm); font-style:normal; }\n  .xc-cat.complete em, .xc-cat.complete b { color:var(--xb); }\n  .xc-ci { width:28px; text-align:center; font-size:18px; }\n  .xc-barre { display:block; height:5px; border-radius:3px; background:#1a1426; margin-top:6px; overflow:hidden; }\n  .xc-barre i { display:block; height:100%; background:var(--xa); min-width:2px; }\n  .xc-cat.complete .xc-barre i, .xc-fin.faite .xc-barre i { background:var(--xb); }\n  .xc-carte { padding:14px; margin-bottom:12px; border-radius:16px; border:2px solid var(--xbd); background:var(--xs); }\n  .xc-carte h4 { margin:0 0 6px; font-size:16px; } .xc-carte p { margin:0 0 10px; color:var(--xm); font-size:13px; line-height:1.45; }\n  .xc-gros { font:800 40px ui-monospace,Menlo,monospace; color:var(--xb); } .xc-carte small { display:block; color:var(--xm); font:600 11px ui-monospace,Menlo,monospace; margin:2px 0 10px; }\n  .xc-action { width:100%; min-height:52px; border-radius:14px; border:2px solid var(--xa); background:var(--xa); color:#0d0a16; font:800 16px -apple-system,system-ui,sans-serif; margin-top:8px; }\n  .xc-action:disabled { background:none; color:var(--xm); border-color:var(--xbd); }\n  .xc textarea, .xc input { width:100%; box-sizing:border-box; padding:11px 12px; margin-top:6px; border-radius:12px; border:2px solid var(--xbd2); background:#0a0712; color:var(--xt); font:15px ui-monospace,Menlo,monospace; -webkit-user-select:text; user-select:text; }\n  .xc-imp { display:flex; align-items:center; gap:8px; margin-top:8px; padding:8px 10px; border-radius:11px; background:var(--xs2); font-size:13px; }\n  .xc-imp span { margin-left:auto; color:var(--xb); font:600 12px ui-monospace,Menlo,monospace; } .xc-imp button { border:0; background:none; color:var(--xm); font-size:18px; }\n  .xc-fin { padding:12px 2px; border-bottom:1px solid rgba(190,175,230,.06); display:grid; grid-template-columns:1fr auto; gap:4px 10px; align-items:center; }\n  .xc-fin b { font-size:15px; } .xc-fin small { display:block; color:var(--xm); font:600 11px ui-monospace,Menlo,monospace; margin-top:2px; }\n  .xc-fin .xc-barre { grid-column:1 / -1; } .xc-fin em { font:700 12px ui-monospace,Menlo,monospace; color:var(--xa); font-style:normal; } .xc-fin.faite em { color:var(--xb); }\n  .xc-onglets { position:fixed; left:12px; right:12px; bottom:calc(env(safe-area-inset-bottom,0px) + 10px); z-index:5; display:flex; gap:6px; padding:6px;\n    border-radius:20px; border:2px solid var(--xbd2); background:rgba(10,7,18,.96); }\n  .xc-onglets button { flex:1; min-height:54px; border:0; border-radius:14px; background:none; color:var(--xm); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; }\n  .xc-onglets i { font-style:normal; font-size:18px; } .xc-onglets span { font:700 9.5px ui-monospace,Menlo,monospace; letter-spacing:.08em; text-transform:uppercase; }\n  .xc-onglets button.on { background:var(--xs2); color:var(--xt); box-shadow:inset 0 0 0 1.5px var(--xb); }\n  .xc-toast { position:fixed; left:50%; top:calc(env(safe-area-inset-top,0px) + 70px); transform:translateX(-50%); z-index:6; padding:11px 16px; border-radius:14px;\n    background:var(--xs2); border:2px solid var(--xb); color:var(--xt); font:700 14px -apple-system,system-ui,sans-serif; white-space:nowrap; max-width:92vw; overflow:hidden; text-overflow:ellipsis;\n    animation:xctoast 3.2s cubic-bezier(.2,.9,.3,1.2) forwards; }\n  @keyframes xctoast { 0% { opacity:0; translate:0 -14px; } 10%,85% { opacity:1; translate:0 0; } 100% { opacity:0; } }\n  @media (prefers-reduced-motion:reduce) { .xc-flot,.xc-toast,.xc-coeur.bat .xc-h1 { animation:none; } }\n  /* v2 (13.10, RS-7 : « pas assez polish ») : les onglets collent en bas DANS la page (ils couvraient les générateurs), le cœur sans cadre,\n     la puissance de dix, l'arbre */\n  .xc { padding-bottom:18px !important; }\n  .xc-onglets { position:sticky !important; left:auto !important; right:auto !important; bottom:calc(env(safe-area-inset-bottom,0px) + 8px) !important; margin-top:14px; background:#0a0712 !important; }\n  .xc-onglets span { font-size:9px; }\n  .xc-coeur, .xc-coeur:focus, .xc-coeur:hover { border:0 !important; background:transparent !important; box-shadow:none !important; outline:none !important; border-radius:0 !important; }\n  .xc-coeur { width:min(48vw,200px) !important; margin:4px auto 2px !important; }\n  .xc-tete { padding-top:8px !important; }\n  .xc-exp { font:600 11px ui-monospace,Menlo,monospace; letter-spacing:.14em; color:#5f5878; margin-top:2px; min-height:1.2em; }\n  .xc-pal { font-style:normal; font:700 11px ui-monospace,Menlo,monospace; color:#79d9a2; margin-left:6px; padding:1px 6px; border:1.5px solid rgba(121,217,162,.4); border-radius:7px; }\n  .xc-mini { display:block; height:3px; border-radius:2px; background:#1a1426; margin-top:6px; overflow:hidden; } .xc-mini i { display:block; height:100%; background:#3a3050; }\n  .xc-g.peut .xc-mini i { background:#a597cf; }\n  .xc-trophee { margin:0 0 10px; padding:10px 13px; border-radius:13px; border:1.5px dashed rgba(165,151,207,.45); color:#a597cf; font:700 13px ui-monospace,Menlo,monospace; text-align:center; }\n  .xc-branches { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:10px; }\n  .xc-branches button { position:relative; min-height:58px; border-radius:13px; border:2px solid #272036; background:#0f0b18; color:#7f7699; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1px; }\n  .xc-branches i { font-style:normal; font-size:18px; color:#a597cf; } .xc-branches span { font:700 10px ui-monospace,Menlo,monospace; letter-spacing:.06em; text-transform:uppercase; }\n  .xc-branches em { position:absolute; top:5px; right:7px; font:600 9px ui-monospace,Menlo,monospace; font-style:normal; color:#5f5878; }\n  .xc-branches button.on { border-color:#a597cf; color:#ddd6ea; } .xc-branches button.dispo { box-shadow:inset 0 0 0 1.5px #79d9a2; } .xc-branches button.dispo em { color:#79d9a2; }\n  .xc-arbre { position:relative; padding-left:6px; }\n  .xc-arbre::before { content:''; position:absolute; left:27px; top:22px; bottom:22px; width:2px; background:#272036; }\n  .xc-n { position:relative; display:flex; align-items:center; gap:12px; padding:10px 0; }\n  .xc-ni { position:relative; z-index:1; width:44px; height:44px; flex:none; display:flex; align-items:center; justify-content:center; font-size:19px; color:#5f5878;\n    background:#0f0b18; border:2px solid #272036; clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); }\n  .xc-n.dispo .xc-ni { color:#ddd6ea; background:#1a1426; border-color:#a597cf; } .xc-n.cher .xc-ni { color:#a597cf; } .xc-n.acquis .xc-ni { color:#0d0a16; background:#79d9a2; }\n  .xc-nt { flex:1; min-width:0; } .xc-nt b { display:block; font-size:15px; } .xc-nt small { display:block; color:#7f7699; font-size:12.5px; line-height:1.35; margin-top:2px; }\n  .xc-n.verrou .xc-nt b { color:#7f7699; } .xc-n.acquis .xc-nt b { color:#79d9a2; }\n  .xc-cond { display:inline-block; margin-top:5px; padding:2px 8px; border-radius:7px; border:1.5px solid #272036; color:#7f7699; font:600 10.5px ui-monospace,Menlo,monospace; }\n  .xc-cond.ok { border-color:rgba(121,217,162,.45); color:#79d9a2; }\n  .xc-n button { flex:none; min-width:84px; min-height:42px; padding:0 10px; border-radius:12px; border:2px solid #a597cf; background:#a597cf; color:#0d0a16; font:800 12px ui-monospace,Menlo,monospace; }\n  .xc-n button:disabled { background:none; border-color:#272036; color:#5f5878; }\n  .xc-acq { font-style:normal; color:#79d9a2; font-size:20px; padding:0 10px; }\n  /* --- ton xerboxion bâti : la cité hexagonale (chill-tekk : aplats, traits, aucun dégradé ; la profondeur par anneau suit le gyroscope) --- */\n  .xc-coeur.xc-coeur-cite { width:min(88vw,360px) !important; aspect-ratio:1; margin:2px auto 0 !important; }\n  .xc-cite { width:100%; height:100%; overflow:visible; }\n  .xc-cite .xc-couche { fill:none; stroke:#3a3050; stroke-width:1.2; stroke-dasharray:2 4; }\n  .xc-cite .xc-anneau-fond { fill:none; stroke:#1a1426; stroke-width:3; } .xc-cite .xc-anneau { fill:none; stroke:#79d9a2; stroke-width:3; stroke-linecap:round; }\n  .xc-t { translate:calc(var(--mx,0) * var(--anneau) * 0.9px) calc(var(--my,0) * var(--anneau) * 0.9px); }\n  .xc-t polygon { stroke-width:1.2; stroke-linejoin:round; }\n  .xc-t text { font:600 7px ui-monospace,Menlo,monospace; text-anchor:middle; pointer-events:none; }\n  .xc-t.t0 polygon { fill:#120e1d; stroke:#272036; } .xc-t.t0 text { fill:#5f5878; }\n  .xc-t.t1 polygon { fill:#151021; stroke:#3a3050; } .xc-t.t1 text { fill:#7f7699; }\n  .xc-t.t2 polygon { fill:#1a1428; stroke:#4a3e66; } .xc-t.t2 text { fill:#a597cf; }\n  .xc-t.t3 polygon { fill:#211a33; stroke:#5b4c82; } .xc-t.t3 text { fill:#c3b8e6; }\n  .xc-t.t4 polygon { fill:#28203f; stroke:#7364a6; } .xc-t.t4 text { fill:#ddd6ea; }\n  .xc-t.t5 polygon { fill:#2f254b; stroke:#8d7ec4; } .xc-t.t5 text { fill:#ddd6ea; }\n  .xc-t.t6 polygon { fill:#362a57; stroke:#a597cf; } .xc-t.t6 text { fill:#fff; }\n  .xc-t.t7 polygon, .xc-t.t8 polygon, .xc-t.t9 polygon { fill:#3d3063; stroke:#c3b8e6; } .xc-t.t7 text, .xc-t.t8 text, .xc-t.t9 text { fill:#fff; }\n  .xc-t.mon polygon { fill:#14261d; stroke:#79d9a2; stroke-width:1.6; } .xc-t.mon text { fill:#79d9a2; }\n  .xc-t.neuf { transform-box:fill-box; transform-origin:center; animation:xcpousse .5s cubic-bezier(.2,1.6,.4,1) both; animation-delay:var(--d,0ms); }\n  @keyframes xcpousse { from { transform:scale(0); opacity:0; } 60% { opacity:1; } }\n  .xc-cite .xc-c .xc-h1 { fill:#0f0b18; stroke:#a597cf; stroke-width:2; } .xc-cite .xc-c .xc-h2 { fill:none; stroke:#3a3050; stroke-width:1.2; } .xc-cite .xc-noyau { fill:#79d9a2; }\n  .xc-coeur.bat .xc-c { transform-box:fill-box; transform-origin:center; animation:xcbat .32s cubic-bezier(.3,1.6,.4,1); }\n  .xc-bati { text-align:center; font:600 11.5px ui-monospace,Menlo,monospace; letter-spacing:.06em; color:#7f7699; margin:4px 0 2px; } .xc-bati b { color:#ddd6ea; }\n  @media (prefers-reduced-motion:reduce) { .xc-t.neuf { animation:none; } }\n  /* la compaction : une tuile ×7, ×49… plus dense (bord épais, échos intérieurs), et elle s'allume quand elle vient de fusionner */\n  .xc-t.lv polygon:first-child { stroke-width:2; } .xc-t.lv2 polygon:first-child { stroke-width:2.6; } .xc-t.lv3 polygon:first-child { stroke-width:3.2; }\n  .xc-t .xc-echo { fill:none; stroke-width:.9; opacity:.7; } .xc-t.lv .xc-echo { stroke:inherit; }\n  .xc-t.lv polygon.xc-echo { stroke:#a597cf; } .xc-t.lv text { font-size:6px; } .xc-t .xc-x { font:700 3.6px ui-monospace,Menlo,monospace !important; fill:#79d9a2 !important; }\n  .xc-t.fusion { transform-box:fill-box; transform-origin:center; animation:xcfusion .9s cubic-bezier(.2,1.4,.4,1); }\n  .xc-t.fusion polygon:first-child { stroke:#79d9a2; }\n  @keyframes xcfusion { 0% { transform:scale(1.5); opacity:.3; } 50% { transform:scale(.92); opacity:1; } }\n  @media (prefers-reduced-motion:reduce) { .xc-t.fusion { animation:none; } }\n  /* --- v3 : améliorations, boosts, éclats, défis --- */\n  .xc-boosts { display:flex; justify-content:center; gap:6px; flex-wrap:wrap; min-height:0; margin-top:6px; }\n  .xc-boost { padding:3px 9px; border-radius:9px; border:1.5px solid #79d9a2; color:#79d9a2; font:700 11px ui-monospace,Menlo,monospace; animation:xcbattre 1.4s ease-in-out infinite; }\n  .xc-boost.clic { border-color:#a597cf; color:#c3b8e6; }\n  @keyframes xcbattre { 50% { opacity:.6; } }\n  .xc-upgs { display:flex; gap:7px; overflow-x:auto; padding:2px 0 10px; margin:0 -2px; -webkit-overflow-scrolling:touch; scrollbar-width:none; }\n  .xc-upg { flex:none; width:68px; padding:8px 4px; border-radius:13px; border:2px solid #272036; background:#0f0b18; color:#7f7699; display:flex; flex-direction:column; align-items:center; gap:2px; opacity:.6; }\n  .xc-upg i { font-style:normal; font-size:18px; color:#a597cf; } .xc-upg span { font:800 11px ui-monospace,Menlo,monospace; color:#79d9a2; } .xc-upg b { font:600 9.5px ui-monospace,Menlo,monospace; }\n  .xc-upg.dispo { opacity:1; border-color:#79d9a2; color:#ddd6ea; } .xc-upg.dispo:active { transform:scale(.94); }\n  .xc-eclat { position:absolute; z-index:4; width:54px; height:54px; margin:-27px 0 0 -27px; border-radius:50%; border:2.5px solid #ffd76a; background:#2a2108; color:#ffd76a; font-size:26px;\n    box-shadow:0 0 18px rgba(255,215,106,.55); animation:xceclat 1.1s ease-in-out infinite; cursor:pointer; }\n  @keyframes xceclat { 50% { transform:scale(1.12) rotate(12deg); box-shadow:0 0 30px rgba(255,215,106,.85); } }\n  .xc-h { margin:16px 0 8px; font-size:15px; } .xc-h small { display:block; font:600 11px ui-monospace,Menlo,monospace; color:#7f7699; margin-top:2px; }\n  .xc-q { display:flex; align-items:center; gap:11px; padding:10px 12px; margin-bottom:8px; border-radius:14px; border:2px solid #272036; background:#0f0b18; }\n  .xc-q > div { flex:1; min-width:0; } .xc-q b { font-size:14px; } .xc-q small { font:600 10.5px ui-monospace,Menlo,monospace; color:#7f7699; }\n  .xc-qi { width:30px; text-align:center; font-size:19px; color:#a597cf; }\n  .xc-q button { min-width:58px; min-height:42px; border-radius:12px; border:2px solid #79d9a2; background:#79d9a2; color:#0d0a16; font:800 13px ui-monospace,Menlo,monospace; }\n  .xc-q button:disabled { background:none; border-color:#272036; color:#5f5878; } .xc-q em { font-style:normal; color:#79d9a2; font-size:20px; padding:0 8px; }\n  .xc-q.faite { opacity:.6; }\n  .xc-succes { display:grid; grid-template-columns:repeat(auto-fill,minmax(38px,1fr)); gap:6px; }\n  .xc-succes span { aspect-ratio:1; display:flex; align-items:center; justify-content:center; border-radius:10px; border:1.5px dashed #272036; color:#3a3050; font-size:16px; }\n  .xc-succes span.ok { border:1.5px solid #79d9a2; color:#79d9a2; background:#14261d; }\n  .xc-stats { display:grid; grid-template-columns:1fr 1fr; gap:6px; }\n  .xc-stats span { padding:9px 11px; border-radius:12px; border:1.5px solid #272036; background:#0f0b18; color:#7f7699; font:600 10.5px ui-monospace,Menlo,monospace; }\n  .xc-stats b { display:block; margin-top:3px; color:#ddd6ea; font-size:14px; }\n  .xc-onglets span { font-size:8.5px !important; letter-spacing:.04em !important; }\n  @media (prefers-reduced-motion:reduce) { .xc-boost, .xc-eclat { animation:none; } }\n  .xc-reels { display:flex; flex-direction:column; gap:6px; margin-bottom:14px; }\n  .xc-reel { padding:10px 13px; border-radius:13px; border:2px solid #272036; background:#0f0b18; } .xc-reel b { font-size:15px; } .xc-reel small { display:block; color:#7f7699; font-size:12px; margin-top:2px; }\n  .xc-reel.atteint { border-color:#79d9a2; } .xc-reel.atteint b { color:#79d9a2; } .xc-reel.loin { border-style:dashed; opacity:.55; } .xc-reel.loin b { color:#a597cf; }\n";var a=document.getElementById('px-apps-css');if(a&&a.parentNode)a.parentNode.insertBefore(s,a.nextSibling);else document.head.appendChild(s);}catch(e){}})();

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
  function fmt(n){ n=Math.floor(n); if(n<1e4)return ''+n; if(n<1e6)return (n/1e3).toFixed(1)+'k'; if(n<1e9)return (n/1e6).toFixed(2)+'M'; return (n/1e9).toFixed(2)+'Md'; }
  function esc(s){return window.jOSb&&window.jOSb.esc?window.jOSb.esc(s):(function(x){var d=document.createElement('div');d.textContent=x==null?'':x;return d.innerHTML;})(s);}
  function ago(t){ var s=Math.round((Date.now()-t)/1000); if(s<60)return 'il y a '+s+'s'; if(s<3600)return 'il y a '+Math.floor(s/60)+'min'; return 'il y a '+Math.floor(s/3600)+'h'; }

  function mount(container, ctx) {
    var alive=true, tab='prog', timer=null;
    container.innerHTML='<div class="pxp"><div class="xp__tabs">'
      +'<div class="xp__tab" data-tab="prog">✪ Progression</div><div class="xp__tab" data-tab="quests">▦ Quêtes</div><div class="xp__tab" data-tab="vect">⌖ Vecteur</div><div class="xp__tab" data-tab="idle">ϟ Idle</div>'
      +'</div><div class="xp__panel" data-panel></div></div>';
    var panel=container.querySelector('[data-panel]');
    container.querySelectorAll('.xp__tab').forEach(function(t){t.onclick=function(){tab=t.getAttribute('data-tab');render();};});

    // ===== onglet PROGRESSION : la vraie économie jOSGame =====
    function renderProg(){
      var G=window.jOSGame;
      if(!G){ panel.innerHTML='<div style="padding:30px;text-align:center;opacity:.6">le moteur de jeu se charge…</div>'; return; }
      var pr=G.progress(), counts=G.counts(), rules=G.rules(), log=G.log(), ach=G.achievements;
      var TITLES=['','Bion','Cubion','Ploxion','Plugion','Boxion','Xerion','Xeroction'];
      var title=TITLES[Math.min(pr.level,TITLES.length-1)]||('Niv '+pr.level);
      var h='<div class="xp__head"><div class="xp__lvl">Niveau '+pr.level+' · <b>'+esc(title)+'</b></div>'
        +'<div class="xp__tot">'+fmt(G.xp())+' XP</div>'
        +'<div class="xp__bar"><div class="xp__barf" style="width:'+(pr.span?Math.round(pr.into/pr.span*100):100)+'%"></div></div>'
        +'<div class="xp__next">'+fmt(Math.max(0,pr.next))+' XP avant le niveau '+(pr.level+1)+'</div></div>';
      // TABLE DES GAINS — ce qui donne de l'XP et combien
      h+='<div class="xp__sh">ce qui donne de l\'XP</div><div class="xp__rules">';
      rules.forEach(function(r){ var c=counts[r.key]||0;
        var val=r.variable?'variable':'+'+r.xp+' XP';
        var sub=r.variable?(c+'×'):(c?('×'+c+' → '+(c*r.xp)+' XP'):'pas encore');
        h+='<div class="xp__r"><span class="xp__ric">'+r.icon+'</span>'
          +'<span><div class="xp__rn">'+esc(r.label)+'</div><div class="xp__rm">'+(r.repeat?'à chaque fois':'une fois par ploxion')+'</div></span>'
          +'<span class="xp__rv"><div class="xp__rxp">'+val+'</div><div class="xp__rc">'+sub+'</div></span></div>';
      });
      h+='</div>';
      // LOG des gains récents
      h+='<div class="xp__sh">tes derniers gains</div><div class="xp__log">';
      if(!log.length) h+='<div style="opacity:.5;font-size:.74rem;padding:4px 0">joue pour gagner de l\'XP — ouvre des ploxions, fais des quêtes, capte des tsoins…</div>';
      log.slice(0,18).forEach(function(l){ h+='<div class="xp__le"><span>'+(l.icon||'✦')+'</span><span>'+esc(l.label)+'</span><span style="opacity:.5;font-size:.64rem">'+ago(l.t)+'</span><span class="lx">+'+l.xp+'</span></div>'; });
      h+='</div>';
      // SUCCÈS
      h+='<div class="xp__sh">succès</div><div class="xp__ach">';
      ach.forEach(function(a){ var on=G.isUnlocked(a.id);
        h+='<div class="xp__a'+(on?' on':'')+'" title="'+esc(a.desc)+'"><div class="xp__aic">'+a.icon+'</div><div class="xp__an">'+esc(a.name)+'</div><div class="xp__ax">'+(on?'✓ ':'')+'+'+a.xp+' XP</div></div>'; });
      h+='</div>';
      panel.innerHTML=h;
    }

    // ===== onglet QUÊTES : auto-évaluées + AUTO-COMPLÉTION depuis l'état RÉEL du jeu =====
    var ONION='eu44a2lwfkmzr2imejw6irvmmfnwpgiaceazdokrb4c73zuiwvwvn7qd.onion';
    var DONEKEY='jos:quests-done';
    function loadDone(){ try{ var d=JSON.parse(localStorage.getItem(DONEKEY)||'{}'); return (d&&typeof d==='object')?d:{}; }catch(e){ return {}; } }
    function saveDone(d){ try{ localStorage.setItem(DONEKEY,JSON.stringify(d)); }catch(e){} }
    // définitions : chaque quête a une CONDITION auto-évaluée depuis jOSGame (opened/counts/isUnlocked/level)
    function questDefs(){
      var G=window.jOSGame;
      var opened=G?Object.keys(G.state().opened||{}).length:0;
      var counts=G?G.counts():{};
      var level=G?G.level():1;
      function u(id){ return G&&G.isUnlocked(id)?1:0; }
      return [
        {id:'awake',    name:'Éveil : ouvre un ploxion',                     icon:'⸙', cur:Math.min(opened,1),          max:1},
        {id:'explorer', name:'Explorateur : ouvre 10 ploxions',              icon:'⌖', cur:Math.min(opened,10),         max:10},
        {id:'tinker',   name:'Bricoleur : utilise 20 bions',                 icon:'⌬', cur:Math.min(counts.bion||0,20),  max:20},
        {id:'wormion',  name:'Voyageur : ouvre le wormion ◎',               icon:'◎', cur:u('wormion'),                max:1},
        {id:'tsoin',    name:'Capte un tsoin dans la machine ⧗',             icon:'⧗',  cur:u('tsoin'),                  max:1},
        {id:'space',    name:'Simule un vaisseau Véga-capable au ⟰ Chantier',icon:'⟰', cur:u('space'),                  max:1},
        {id:'rank3',    name:'Ploxion : atteins le niveau 3',                icon:'↗', cur:Math.min(level,3),           max:3},
        {id:'vega',     name:'Cap sur Véga ✦ (quête RS-7)',                 icon:'✦', cur:u('vega'),                   max:1, vega:true}
      ];
    }
    // AUTO-COMPLÉTION : ré-évalue à chaque event jeu ; une quête au max passe DONE UNE seule fois,
    // persiste (jos:quests-done) et déclenche UNE récompense. Verrou anti-réentrance (award ré-émet jos:game).
    var checkingQuests=false;
    function checkQuests(){
      var G=window.jOSGame; if(!G||checkingQuests) return;
      checkingQuests=true; var changed=false;
      try{
        var done=loadDone();
        questDefs().forEach(function(q){
          if(done[q.id]||q.cur<q.max) return;
          done[q.id]=Date.now(); changed=true;
          try{ G.award('quest-done',{label:'Quête : '+q.name, icon:'✪', toast:true}); }catch(e){}
          try{ window.dispatchEvent(new CustomEvent('jos:quest-done',{detail:{id:q.id,name:q.name}})); }catch(e){}
        });
        if(changed) saveDone(done);
      }finally{ checkingQuests=false; }
      if(alive&&tab==='quests') renderQuests();
    }
    function renderQuests(){
      var isDark=/\.onion$/i.test(location.hostname);
      var done=loadDone(), defs=questDefs(), nDone=0;
      defs.forEach(function(q){ if(done[q.id]||q.cur>=q.max) nDone++; });
      var h='<div class="xp__sh">mode de connexion</div><div style="display:flex;gap:7px;padding:0 12px 4px">'
        +'<button data-conn="dark" style="flex:1;padding:9px;border-radius:9px;cursor:pointer;border:1px solid '+(isDark?'#ffd35a':'rgba(120,160,230,.25)')+';background:'+(isDark?'rgba(60,50,10,.6)':'rgba(18,26,42,.5)')+';color:'+(isDark?'#ffd35a':'rgba(200,220,255,.85)')+'">◉ Dark · Tor</button>'
        +'<button data-conn="clearweb" style="flex:1;padding:9px;border-radius:9px;cursor:pointer;border:1px solid '+(!isDark?'#ffd35a':'rgba(120,160,230,.25)')+';background:'+(!isDark?'rgba(60,50,10,.6)':'rgba(18,26,42,.5)')+';color:'+(!isDark?'#ffd35a':'rgba(200,220,255,.85)')+'">◍ Clearweb</button></div>';
      h+='<div class="xp__sh">quêtes <span style="opacity:.6;font-weight:400">· '+nDone+'/'+defs.length+' · se valident toutes seules</span></div><div class="xp__rules">';
      defs.forEach(function(q){ var isDone=!!done[q.id]||q.cur>=q.max; var pct=Math.min(q.cur/q.max*100,100);
        h+='<div class="xp__r" style="'+(isDone?'border-color:rgba(120,220,160,.5)':'')+'"><span class="xp__ric">'+(isDone?'✓':(q.icon||'▦'))+'</span>'
          +'<span style="flex:1"><div class="xp__rn">'+esc(q.name)+'</div>'
          +'<div style="height:5px;border-radius:4px;background:rgba(30,40,60,.7);overflow:hidden;margin-top:5px;max-width:230px"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,rgba(90,160,255,.85),rgba(120,220,160,.9));transition:width .3s"></div></div>'
          +(q.vega&&!isDone?'<div class="xp__rm" style="margin-top:4px;color:rgba(255,211,90,.7)">⊘ le VRAI lancement — se débloque quand on partira pour de vrai (en attendant : simulations au Chantier)</div>':'')
          +'</span><span class="xp__rv"><div class="xp__rc">'+(isDone?'✓ fait':q.cur+'/'+q.max)+'</div></span></div>';
      });
      h+='</div>';
      panel.innerHTML=h;
      panel.querySelectorAll('[data-conn]').forEach(function(b){ b.onclick=function(){
        var m=b.getAttribute('data-conn');
        if(m==='dark'){ if(!isDark&&confirm('Mode DARK : via Tor (.onion), anonyme — nécessite le Tor Browser. Ouvrir l\'adresse .onion ?')) location.href='http://'+ONION+'/home'; }
        else if(isDark) location.href='https://labo.j0bot.ch/home';
      };});
    }

    // ===== onglet VECTEUR XERION : ton usage réel → ta direction dans les dimensions =====
    // Données du bion window.jOSUsage (_usage_bion) : radar par catégorie + top ploxions +
    // tendance 7 jours + cubions suggérés (co-usage quotidien → snippet config/cubions.php).
    function fmtDur(s){ s=Math.round(s||0); if(s<60)return s+'s'; var m=Math.round(s/60); if(m<60)return m+'min'; var h=Math.floor(m/60); return h+'h'+('0'+(m%60)).slice(-2); }
    var cubSnips=[];
    function catMetaOf(reg){ var m={}; try{ Object.keys(reg).forEach(function(id){ var r=reg[id]; if(r&&r.c&&!m[r.c]) m[r.c]={label:r.l||r.c,icon:r.i||'▣'}; }); }catch(e){} return m; }
    function radarSvg(vec,catMeta){
      var ax=Object.keys(vec).map(function(k){return {k:k,v:vec[k]};}).sort(function(a,b){return b.v-a.v;}).slice(0,8);
      if(!ax.length) return '<div style="text-align:center;opacity:.55;padding:18px 12px;font-size:.76rem">utilise des ploxions pour tracer ton vecteur — chaque ouverture, chaque minute compte</div>';
      // un radar a besoin d'au moins 3 axes : on complète avec d'autres catégories connues à 0
      var have={}; ax.forEach(function(a){have[a.k]=1;});
      var extra=Object.keys(catMeta).filter(function(k){return !have[k];});
      while(ax.length<3){ var k2=extra.shift(); ax.push({k:(k2||('·'+ax.length)),v:0}); }
      var n=ax.length,cx=130,cy=112,R=78,maxV=0;
      ax.forEach(function(a){ if(a.v>maxV)maxV=a.v; }); if(!(maxV>0))maxV=1;
      function pt(i,r){ var an=-Math.PI/2+i*2*Math.PI/n; return [cx+Math.cos(an)*r,cy+Math.sin(an)*r]; }
      function poly(r){ var p=[]; for(var i=0;i<n;i++){var q=pt(i,r);p.push(q[0].toFixed(1)+','+q[1].toFixed(1));} return p.join(' '); }
      var s='<svg viewBox="0 0 260 224" style="width:100%;max-width:340px;display:block;margin:0 auto" aria-label="vecteur xerion">';
      [0.33,0.66,1].forEach(function(f){ s+='<polygon points="'+poly(R*f)+'" fill="none" stroke="rgba(120,160,230,.18)" stroke-width="1"/>'; });
      var vp=[];
      for(var i=0;i<n;i++){
        var e=pt(i,R); s+='<line x1="'+cx+'" y1="'+cy+'" x2="'+e[0].toFixed(1)+'" y2="'+e[1].toFixed(1)+'" stroke="rgba(120,160,230,.14)"/>';
        var q=pt(i,R*(ax[i].v/maxV)); vp.push(q[0].toFixed(1)+','+q[1].toFixed(1));
        var L=pt(i,R+18), meta=catMeta[ax[i].k]||{};
        s+='<text x="'+L[0].toFixed(1)+'" y="'+L[1].toFixed(1)+'" text-anchor="middle" dominant-baseline="middle" font-size="9" fill="rgba(180,205,240,.85)">'+(meta.icon||'')+' '+esc(meta.label||ax[i].k)+'</text>';
        s+='<text x="'+L[0].toFixed(1)+'" y="'+(L[1]+10).toFixed(1)+'" text-anchor="middle" font-size="8" fill="rgba(150,180,220,.55)">'+(ax[i].v?Math.round(ax[i].v*100)+'%':'')+'</text>';
      }
      s+='<polygon points="'+vp.join(' ')+'" fill="rgba(63,224,208,.22)" stroke="var(--xr-accent,#3fe0d0)" stroke-width="1.6" stroke-linejoin="round"/>';
      s+='</svg>';
      return s;
    }
    function sparkSvg(dd){
      var max=0; dd.forEach(function(d){ if(d.seconds>max)max=d.seconds; });
      var W=220,H=34,pts=[];
      dd.forEach(function(d,i){ var x=6+i*(W-12)/Math.max(dd.length-1,1); var y=H-4-(max>0?(d.seconds/max)*(H-10):0); pts.push(x.toFixed(1)+','+y.toFixed(1)); });
      var s='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;max-width:260px;height:34px;display:block">';
      s+='<polyline points="'+pts.join(' ')+'" fill="none" stroke="var(--xr-accent,#3fe0d0)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>';
      pts.forEach(function(p,i){ var xy=p.split(','); s+='<circle cx="'+xy[0]+'" cy="'+xy[1]+'" r="1.8" fill="var(--xr-accent,#3fe0d0)"><title>'+esc(dd[i].date)+' · '+fmtDur(dd[i].seconds)+'</title></circle>'; });
      s+='</svg>';
      return s;
    }
    function suggestCubions(U){
      var days=U.coDays(14), pair={}, ids={};
      days.forEach(function(d){
        var a=(d.ids||[]).slice(0,12);
        a.forEach(function(x){ids[x]=1;});
        for(var i=0;i<a.length;i++)for(var j=i+1;j<a.length;j++){ var k=[a[i],a[j]].sort().join('|'); pair[k]=(pair[k]||0)+1; }
      });
      function co(x,y){ return pair[[x,y].sort().join('|')]||0; }
      var pairs=Object.keys(pair).map(function(k){ var p=k.split('|'); return {a:p[0],b:p[1],n:pair[k]}; })
        .filter(function(p){return p.n>=2;}).sort(function(x,y){return y.n-x.n;});
      var groups=[],used={};
      pairs.forEach(function(p){
        if(groups.length>=3||(used[p.a]&&used[p.b])) return;
        var g=[p.a,p.b],best=null,bn=0;
        Object.keys(ids).forEach(function(x){ if(g.indexOf(x)>=0)return; var n=Math.min(co(x,p.a),co(x,p.b)); if(n>=2&&n>bn){bn=n;best=x;} });
        if(best)g.push(best);
        g.forEach(function(x){used[x]=1;});
        groups.push({ids:g,n:p.n});
      });
      return groups;
    }
    function cubionSnippet(g,i){
      var members=g.ids.map(function(x){ return "'"+String(x).replace(/[^a-z0-9_\-]/gi,'')+"'"; }).join(', ');
      var name=g.ids.map(function(x){ return String(x).replace(/[^a-z0-9_\-]/gi,'').toUpperCase(); }).join('+');
      return "        ['id' => 'cubion-vecteur-"+(i+1)+"', 'name' => 'CUBION "+name+"', 'members' => ["+members+"],\n            'description' => 'Cubion suggéré par ton vecteur xerion (ploxions utilisés ensemble au quotidien).'],";
    }
    function copySnippet(txt){
      function done(){ try{ if(window.jOSBoxion&&window.jOSBoxion.toast) window.jOSBoxion.toast('⧉ snippet config/cubions.php copié'); }catch(e){} }
      function fallback(){ try{ var ta=document.createElement('textarea'); ta.value=txt; ta.style.cssText='position:fixed;opacity:0;left:-999px'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); done(); }catch(e){} }
      try{ if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(done,fallback); return; } }catch(e){}
      fallback();
    }
    function drawVect(vec,reg){
      var U=window.jOSUsage, catMeta=catMetaOf(reg||{});
      var h='<div class="xp__sh">ton vecteur xerion</div>'
        +'<div style="text-align:center;font-size:.68rem;color:rgba(150,180,220,.65);padding:0 14px 6px">ton vecteur xerion = ta direction dans les dimensions</div>'
        +'<div style="padding:0 8px">'+radarSvg(vec,catMeta)+'</div>';
      // top 10 des ploxions les plus utilisés (opens + temps)
      var t10=U.top(10), maxSc=0;
      t10.forEach(function(p){ var sc=p.seconds+p.opens*30; if(sc>maxSc)maxSc=sc; });
      h+='<div class="xp__sh">tes 10 ploxions les plus utilisés</div><div class="xp__rules">';
      if(!t10.length) h+='<div style="opacity:.5;font-size:.74rem;padding:0 2px 8px">rien encore — ouvre des ploxions, ton usage se trace tout seul</div>';
      t10.forEach(function(p){
        var r=(reg&&reg[p.id])||{}; var pct=maxSc>0?Math.round((p.seconds+p.opens*30)/maxSc*100):0;
        h+='<div class="xp__r"><span class="xp__ric">'+(r.ic||'▣')+'</span>'
          +'<span style="flex:1;min-width:0"><div class="xp__rn">'+esc(r.n||p.id)+'</div>'
          +'<div style="height:5px;border-radius:4px;background:rgba(30,40,60,.7);overflow:hidden;margin-top:5px;max-width:230px"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,rgba(90,160,255,.85),var(--xr-accent,#3fe0d0));"></div></div></span>'
          +'<span class="xp__rv"><div class="xp__rxp">'+fmtDur(p.seconds)+'</div><div class="xp__rc">×'+p.opens+' ouvertures</div></span></div>';
      });
      h+='</div>';
      // tendance 7 jours
      var dd=U.days(7), tot7=0; dd.forEach(function(d){tot7+=d.seconds;});
      h+='<div class="xp__sh">tendance 7 jours <span style="opacity:.6;font-weight:400">· '+fmtDur(tot7)+' au total</span></div>'
        +'<div style="padding:0 14px 6px">'+sparkSvg(dd)+'</div>';
      // cubions suggérés : co-usage quotidien
      var groups=suggestCubions(U); cubSnips=[];
      h+='<div class="xp__sh">tes cubions suggérés <span style="opacity:.6;font-weight:400">· les ploxions que TU utilises ensemble</span></div><div class="xp__rules" style="padding-bottom:14px">';
      if(!groups.length) h+='<div style="opacity:.5;font-size:.74rem;padding:0 2px 8px">pas encore de motif — utilise plusieurs ploxions le même jour, plusieurs jours de suite, et tes cubions apparaîtront</div>';
      groups.forEach(function(g,i){
        cubSnips[i]=cubionSnippet(g,i);
        var names=g.ids.map(function(id){ var r=(reg&&reg[id])||{}; return (r.ic||'▣')+' '+esc(r.n||id); }).join(' + ');
        h+='<div class="xp__r"><span style="flex:1;min-width:0"><div class="xp__rn">'+names+'</div><div class="xp__rm">vus ensemble '+g.n+' jours</div></span>'
          +'<button data-cub="'+i+'" style="cursor:pointer;min-height:44px;padding:8px 13px;border-radius:11px;border:1px solid var(--xr-accent,#3fe0d0);background:rgba(18,42,40,.6);color:var(--xr-accent,#3fe0d0);font:700 .72rem system-ui">⧉ créer ce cubion</button></div>';
      });
      h+='</div>';
      panel.innerHTML=h;
      panel.querySelectorAll('[data-cub]').forEach(function(b){ b.onclick=function(){ var s=cubSnips[parseInt(b.getAttribute('data-cub'),10)]; if(s) copySnippet(s); }; });
    }
    function renderVect(){
      var U=window.jOSUsage;
      if(!U){ panel.innerHTML='<div style="padding:30px;text-align:center;opacity:.6">le bion d\'usage (jOSUsage) se charge…</div>'; return; }
      panel.innerHTML='<div style="padding:30px;text-align:center;opacity:.6">calcul du vecteur xerion…</div>';
      try{
        Promise.all([U.registry(),U.vecteur()]).then(function(rr){
          if(!alive||tab!=='vect') return;
          try{ drawVect(rr[1]||{},rr[0]||{}); }catch(e){ drawVect({},{}); }
        }).catch(function(){ if(alive&&tab==='vect') drawVect({},{}); });
      }catch(e){ drawVect({},{}); }
    }

    // ===== onglet IDLE = LE CLICKER DU XERBOXION (13.10, braindump 2026-10-12-clicker-du-xerboxion.md ; moteur : _clicker.blade.php) =====
    // Le jeu, c'est la carte du xerboxion : les générateurs se débloquent avec les ploxions VRAIMENT découverts, la production est multipliée
    // par la découverte, les catégories complètes, les tsoins, les heures et les clickers importés, puis élevée à la puissance des dimensions.
    // Le passif tourne app fermée (calculé au retour). Sauvé en local et sur le boxion (jOSBoxion xp/idle, le plus récent gagne).
    var C=window.jOSXerClicker, KEY='xb:xpclick', vision=null;
    function nD(x){ return x<1e6?String(x):C.fmtL(Math.log10(x)); }   // 6673098127501581000 → 6.67·10^18
    // (16.10) la vision du serveur (/px/clickion/vision) : ce qui est vraiment fait, sur tous les appareils — les découvertes ne dépendent plus du téléphone
    try{ fetch('/px/clickion/vision',{credentials:'same-origin',headers:{Accept:'application/json'}}).then(function(r){return r.ok?r.json():null;}).then(function(v){ if(v&&v.ok){ vision=v; ctxT=0; if(!idle.clickion) idle.clickion={voies:[],calcul:null,nee:Date.now()}; idle.clickion.sceaux=(v.sceaux||[]).length; idle.clickion.mes=v.mesures||{}; idle.clickion.xo=!!v.xeroction; idle.clickion.palier=v.palier; if(alive&&tab==='idle')renderIdle(); } }).catch(function(){}); }catch(e){}
    var idle=C.normaliser((function(){ try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } })());
    var lastT=Date.now(), sous='gen', mode=1, regMap=null, ctxCache=null, ctxT=0;
    var SYNC=true; try{SYNC=localStorage.getItem('xb:xp.idle-sync')!=='off';}catch(e){}
    var envoiT=0;
    function vib(k){ try{ if(window.jOSNatif&&window.jOSNatif.vibrer) window.jOSNatif.vibrer(k); else if(navigator.vibrate) navigator.vibrate(k==='succes'?[18,40,18]:k==='moyen'?14:6); }catch(e){} }
    // le vrai xerboxion : ploxions découverts (jOSUsage), catégories (registre), tsoins, heures
    try{ if(window.jOSUsage&&window.jOSUsage.registry) Promise.resolve(window.jOSUsage.registry()).then(function(m){ regMap=m||{}; ctxT=0; if(alive&&tab==='idle')renderIdle(); }).catch(function(){}); }catch(e){}
    function contexte(){
      if(ctxCache&&Date.now()-ctxT<15000) return ctxCache;
      var U=window.jOSUsage, px={}; try{ px=(U&&U.stats&&U.stats().px)||{}; }catch(e){}
      var ids=Object.keys(px).filter(function(id){ return (px[id].opens||0)>0||(px[id].seconds||0)>0; });
      if(vision&&vision.ploxions){ var vu={}; ids.forEach(function(x){vu[x]=1;}); vision.ploxions.forEach(function(x){ if(!vu[x]){ vu[x]=1; ids.push(x); if(!px[x]) px[x]={opens:1,seconds:0}; } }); }
      var R=regMap||{}, total=Object.keys(R).length, dec=total?ids.filter(function(id){return R[id];}):ids, cats={};
      Object.keys(R).forEach(function(id){ var x=R[id]||{}, k=x.c||'autre'; cats[k]=cats[k]||{k:k,l:x.l||k,i:x.i||'▣',fait:0,total:0}; cats[k].total++; });
      dec.forEach(function(id){ var x=R[id]; if(x&&cats[x.c||'autre']) cats[x.c||'autre'].fait++; });
      var h=0,hn=0; ids.forEach(function(id){ var s=(px[id].seconds||0)/3600; h+=s; if(/nexus|minecraft/i.test(id)) hn+=s; });
      var T=0; try{ T=window.jOSTsoin&&window.jOSTsoin.list?window.jOSTsoin.list().length:0; }catch(e){}
      var jourCle=new Date().toISOString().slice(0,10), auj={opens:0,minutes:0,tsoins:0,nouveaux:0,categories:0}, catsAuj={};
      try{ var dd=(U&&U.days)?U.days(1):[]; if(dd[0]){ auj.opens=dd[0].opens||0; auj.minutes=Math.round((dd[0].seconds||0)/60); } }catch(e){}
      ids.forEach(function(id){ var x=px[id]; if(x.lastAt&&new Date(x.lastAt).toISOString().slice(0,10)===jourCle){ if((x.opens||0)<=1) auj.nouveaux++; var c=(R[id]||{}).c; if(c) catsAuj[c]=1; } });
      auj.categories=Object.keys(catsAuj).length;
      try{ auj.tsoins=(window.jOSTsoin&&window.jOSTsoin.list?window.jOSTsoin.list():[]).filter(function(t){ var tt=t.t||t.at||t.ts; return tt&&new Date(tt).toISOString().slice(0,10)===jourCle; }).length; }catch(e){}
      var ouv={}; ids.forEach(function(id){ ouv[id]=1; });
      ctxCache={ ouverts:ouv, jour:auj, decouverts:dec.length, total:total, categories:Object.keys(cats).map(function(k){return cats[k];}).sort(function(a,b){return (b.fait/b.total)-(a.fait/a.total);}), tsoins:T, heures:h, heuresNexus:hn };
      ctxT=Date.now(); return ctxCache;
    }
    var lien=C.lier({ get:function(){ return idle; }, set:function(n){ idle=n; }, apres:function(){ rattraper(); if(alive&&tab==='idle')renderIdle(); }, sync:function(){ return SYNC; } });
    function idleSave(force){ lien.sauver(force); }
    C.ouvrir(idle);   // les déblocages déjà atteints → la transmission s'affiche dès l'ouverture
    function rattraper(){ var r=C.rattraper(contexte(),idle,Date.now()); lastT=Date.now(); if(r&&r.s>60) idle.absent={s:r.s,L:r.L,jusqua:Date.now()+9000}; }
    var tLocal=+idle.t||0; rattraper();
    try{ document.addEventListener('visibilitychange',function(){ if(!alive)return; if(document.visibilityState==='hidden'){ } else { rattraper(); if(tab==='idle')renderIdle(); } }); }catch(e){}
    function auto(){ var ctx=contexte(), j=new Date().toISOString().slice(0,10);
      C.missionsEtat(ctx,idle).forEach(function(x){ if(x.fait&&!x.reclamee&&C.reclamerMission(ctx,idle,x.m.id)) toast('◇ '+x.m.n+' · ×2'); });
      C.etatQuetes(ctx,idle,j).forEach(function(x){ if(x.fait&&!x.reclamee&&C.reclamerQuete(ctx,idle,j,x.q.id)) toast('☼ '+x.q.n+' · ×3 1 h'); }); }
    function palierEtToast(){ auto(); C.automates(idle,contexte()).forEach(function(t){ if(!/auto/.test(t)) toast(t); }); C.lore(idle).forEach(function(x){ toast(x[1]+' '+x[2]+' · ⧉'); }); var nvx=C.ouvrir(idle); nvx.forEach(function(x){ vib('succes'); toast('◈ '+x[2]+(C.JOURNAL[x[0]]?' · ⧉ nouvelle transmission':'')); }); if(nvx.length&&tab==='idle'&&alive) setTimeout(renderIdle,0); C.nouveauxSucces(contexte(),idle).forEach(function(x){ vib('succes'); toast('✪ succès : '+x.n+' (+3 %)'); try{ if(window.jOSTsoin&&window.jOSTsoin.mark) window.jOSTsoin.mark('clicker','succès '+x.n); }catch(e){} });
      C.nouveauxPaliers(idle).forEach(function(p){ vib('succes'); try{ if(window.jOSTsoin&&window.jOSTsoin.mark) window.jOSTsoin.mark('clicker','palier '+p[1]); }catch(e){} toast('✦ palier franchi : '+p[1]); }); }
    function toast(t){ var w=panel.querySelector('.xc'); if(!w)return; var d=document.createElement('div'); d.className='xc-toast'; d.textContent=t; w.appendChild(d); setTimeout(function(){ d.remove(); },3200); }
    var esc2=function(x){ return esc(String(x==null?'':x)); };
    function hex(prc){ var per=Math.max(0,Math.min(1,prc)); return '<svg class="xc-hex" viewBox="0 0 200 200" aria-hidden="true">'
      +'<circle cx="100" cy="100" r="92" class="xc-anneau-fond"/><circle cx="100" cy="100" r="92" class="xc-anneau" pathLength="100" stroke-dasharray="'+(per*100).toFixed(2)+' 100" transform="rotate(-90 100 100)"/>'
      +'<path class="xc-h1" d="M100 26 L164 63 L164 137 L100 174 L36 137 L36 63 Z"/><path class="xc-h2" d="M100 58 L136 100 L100 142 L64 100 Z"/><circle class="xc-noyau" cx="100" cy="100" r="7"/></svg>'; }
    // ===== TON XERBOXION BÂTI (13.10, RS-7 : « il faut qu'on ait l'impression de BUILD quelque chose avec notre clicker ») =====
    // Le cœur devient une cité hexagonale : chaque générateur acheté pose des tuiles en spirale (son glyphe, sa teinte), chaque nœud de
    // l'arbre un monument (vert), chaque dimension une couche sous la cité. Une tuile neuve « pousse ». Toucher la cité = toucher le cœur.
    // (RS-7 : « il faut que ça grandisse ») aucune borne : les anneaux suivent les tuiles (jusqu'à 18 anneaux, ~1000 tuiles), et la vue recule
    var RAYONS_MAX=18, tuilesVues=null;
    var SPIRALE=(function(){ var out=[], dirs=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]]; for(var k=1;k<=RAYONS_MAX;k++){ var q=-k, r=k; for(var i=0;i<6;i++) for(var j=0;j<k;j++){ out.push([q,r,k]); q+=dirs[i][0]; r+=dirs[i][1]; } } return out; })();
    // les unités d'un générateur (n^0.6 : la cité grandit avec chaque achat) ; puis LA COMPACTION (RS-7 : « au fur et à mesure que ça
    // grandit, ça se compacte automatiquement ») : 7 tuiles d'un palier fusionnent en une tuile ×7 (une fleur hexagonale), 7 de celles-ci
    // en ×49… dès que la cité dépasse son budget (qui grandit lentement avec le total) ; ça commence par le centre (les paliers anciens).
    function unites(n){ return n>0?Math.min(1e15,Math.ceil(Math.pow(n,0.6))):0; }
    function tuilesAProfondeur(u,d){ var out=[], p=Math.pow(7,d), haut=Math.floor(u/p), reste=u-haut*p; for(var j=d-1;j>=0;j--){ var q=Math.pow(7,j), c=Math.floor(reste/q); reste-=c*q; for(var k=0;k<c;k++) out.push(j); }
      var t=[]; for(var h2=0;h2<Math.min(haut,2000);h2++) t.push(d); return t.concat(out); }
    var niveauxVus=null;
    function compacter(){
      var U=C.GENS.map(function(g){ return unites(idle.owned[g.id]||0); }), tot=U.reduce(function(a,b){return a+b;},0);
      var budget=Math.min(SPIRALE.length-30, Math.round(40+20*Math.log2(1+tot))), D=U.map(function(){return 0;});
      var compte=function(){ return U.reduce(function(a,u,i){ return a+tuilesAProfondeur(u,D[i]).length; },0); };
      for(var garde=0; compte()>budget && garde<400; garde++){ var i=U.findIndex(function(u,k){ return u>=Math.pow(7,D[k]+1)&&(k===U.length-1||true); });
        // le palier le plus bas qui peut encore se compacter
        var pris=-1; for(var k=0;k<U.length;k++){ if(U[k]>=Math.pow(7,D[k]+1)){ pris=k; break; } } if(pris<0) break; D[pris]++; }
      return U.map(function(u,i){ return tuilesAProfondeur(u,D[i]); });
    }
    function cite(dPrc){
      var t=[], niv=compacter(), fus={};
      C.GENS.forEach(function(g,i){ niv[i].forEach(function(lv){ t.push({ i:i, g:g, lv:lv }); }); });
      // une fusion depuis le dernier dessin : la tuile compacte s'allume
      if(niveauxVus) C.GENS.forEach(function(g,i){ var avant=niveauxVus[i]||[], mx=Math.max.apply(null,[0].concat(niv[i])), mxa=Math.max.apply(null,[0].concat(avant)); if(mx>mxa||niv[i].filter(function(x){return x===mx;}).length>avant.filter(function(x){return x===mx;}).length&&mx>0) fus[i]=mx; });
      if(niveauxVus&&Object.keys(fus).length&&idle.stats) idle.stats.fusions=(idle.stats.fusions||0)+Object.keys(fus).length;
      niveauxVus=niv;
      C.ARBRE.forEach(function(n){ if((idle.tech||{})[n.id]) t.push({ m:n }); });
      t=t.slice(0,SPIRALE.length);
      var RAYONS=Math.max(2,t.length?SPIRALE[t.length-1][2]:1);
      var s=10, R3=Math.sqrt(3), ext=s*R3*(RAYONS+0.9), dims=Math.min(10,idle.dims||0), neufs=tuilesVues==null?0:Math.max(0,t.length-tuilesVues);
      var poly=function(cx,cy,rr){ var p=[]; for(var a=0;a<6;a++){ var an=Math.PI/180*(60*a-30); p.push((cx+rr*Math.cos(an)).toFixed(1)+','+(cy+rr*Math.sin(an)).toFixed(1)); } return p.join(' '); };
      var h='<svg class="xc-cite" viewBox="'+(-ext-14)+' '+(-ext-14)+' '+(2*ext+28)+' '+(2*ext+28)+'" aria-hidden="true">';
      for(var c=dims;c>=1;c--) h+='<circle class="xc-couche" cx="0" cy="0" r="'+(ext*(0.55+0.05*c)).toFixed(1)+'" style="opacity:'+(0.18+0.04*c).toFixed(2)+'"/>';
      h+='<circle cx="0" cy="0" r="'+(ext+8)+'" class="xc-anneau-fond"/><circle cx="0" cy="0" r="'+(ext+8)+'" class="xc-anneau" pathLength="100" stroke-dasharray="'+(dPrc*100).toFixed(2)+' 100" transform="rotate(-90)"/>';
      t.forEach(function(x,k){ var sp=SPIRALE[k], q=sp[0], r=sp[1], cx=s*R3*(q+r/2), cy=s*1.5*r, neuf=k>=t.length-neufs&&neufs>0;
        var lv=x.lv||0, cls='xc-t'+(x.m?' mon':' t'+x.i)+(lv?' lv lv'+Math.min(lv,3):'')+(neuf?' neuf':'')+(!x.m&&fus[x.i]===lv&&lv>0?' fusion':''), gl=x.m?x.m.ic:x.g.ic;
        h+='<g class="'+cls+'" style="--anneau:'+sp[2]+';--d:'+(neuf?(k-(t.length-neufs))*35:0)+'ms"><polygon points="'+poly(cx,cy,s*0.94)+'"/>'
          +(lv?'<polygon class="xc-echo" points="'+poly(cx,cy,s*0.62)+'"/>'+(lv>1?'<polygon class="xc-echo" points="'+poly(cx,cy,s*0.34)+'"/>':''):'')
          +'<text x="'+cx.toFixed(1)+'" y="'+(cy+(lv?2.4:3.4)).toFixed(1)+'">'+esc2(gl)+'</text>'+(lv?'<text class="xc-x" x="'+cx.toFixed(1)+'" y="'+(cy+7.6).toFixed(1)+'">×'+(lv<6?Math.pow(7,lv):'7^'+lv)+'</text>':'')+'</g>'; });
      h+='<g class="xc-c"><polygon class="xc-h1" points="'+poly(0,0,s*1.25)+'"/><polygon class="xc-h2" points="0,-7 6,0 0,7 -6,0"/><circle class="xc-noyau" cx="0" cy="0" r="2.4"/></g></svg>';
      tuilesVues=t.length;
      return { svg:h, tuiles:t.filter(function(x){return !x.m;}).length, compactes:t.filter(function(x){return !x.m&&x.lv;}).length, monuments:t.filter(function(x){return x.m;}).length, plein:t.length>=SPIRALE.length };
    }
    function renderIdle(){
      var ctx=contexte(), pr=C.production(ctx,idle), abs=idle.absent; if(abs&&Date.now()>abs.jusqua){ idle.absent=null; abs=null; }
      var dPrc=ctx.total?ctx.decouverts/ctx.total:0, dims=C.dimensionsAGagner(idle);
      var h='<div class="xc">'
        +(abs?'<div class="xc-absent">pendant ton absence ('+(abs.s>=3600?Math.round(abs.s/3600)+' h':Math.round(abs.s/60)+' min')+') · +'+C.fmtL(abs.L)+'</div>':'')
        +'<div class="xc-tete"><div class="xc-total" data-c-total>'+C.fmtL(idle.L)+'</div><div class="xc-exp" data-c-exp>'+expo(idle.L)+'</div><div class="xc-exp" data-c-ech style="color:#a597cf">'+esc2(C.phrase(idle.L))+'</div><div class="xc-sous">'+(idle.clickion&&C.universDe(idle).id!=='reel'?'<b style="color:'+C.universDe(idle).pal[1]+'">'+C.universDe(idle).g+' '+esc2(C.universDe(idle).n)+'</b> · ':'')+'<span data-c-prod>+'+C.fmtL(pr.L)+'</span> /s'+(idle.dims?' · ∞ '+nD(idle.dims)+' dimension'+(idle.dims>1?'s':''):'')+(C.effets(idle).auto?' · ⟳ '+C.effets(idle).auto+'/s':'')+'</div><div class="xc-boosts" data-boosts>'+boostsHtml()+'</div></div>'
        +(function(){ var ci=cite(dPrc); return '<button class="xc-coeur xc-coeur-cite" data-orb aria-label="toucher ton xerboxion">'+ci.svg+'</button>'
          +'<div class="xc-bati">ton xerboxion · <b>'+ci.tuiles+'</b> tuile'+(ci.tuiles>1?'s':'')+(ci.compactes?' (dont <b>'+ci.compactes+'</b> compactes)':'')+' · <b>'+ci.monuments+'</b> monument'+(ci.monuments>1?'s':'')+(idle.dims?' · <b>'+Math.min(10,idle.dims)+'</b> couche'+(idle.dims>1?'s':''):'')+(ci.plein?' · la cité est pleine : plonge':'')+'</div>'; })()
          +(function(){ var tr=C.derniereTransmission(idle); return tr?'<div class="xc-trans"><span>⧉ '+('000'+tr.n).slice(-4)+' · rosa</span>'+esc2(tr.t)+'</div>':''; })()
        +'<div class="xc-decouv"><b>'+ctx.decouverts+'</b> / '+(ctx.total||'?')+' ploxions découverts · '+(dPrc*100).toFixed(1)+' % du xerboxion</div>'
        +'<div class="xc-corps">'+(sous==='gen'?vueGen(ctx):sous==='arbre'?vueArbre(ctx):sous==='defis'?vueDefis(ctx):sous==='carte'?vueCarte(ctx):sous==='dim'?vueDim(ctx,dims):vueFins(ctx))+'</div>'
        +'<nav class="xc-onglets">'+[['gen','⬡','générer'],['arbre','⟡','arbre'+(nbDispo(ctx)?' · '+nbDispo(ctx):'')],['defis','☼','défis'+(nbQuetes(ctx)?' · '+nbQuetes(ctx):'')],['carte','◈','carte'],['dim','∞','dim.'+(dims>0?' +'+nD(dims):'')],['fins','✦','fins']].map(function(o){ return '<button data-sous="'+o[0]+'" class="'+(sous===o[0]?'on':'')+'"><i>'+o[1]+'</i><span>'+o[2]+'</span></button>'; }).join('')+'</nav>'
        +'</div>';
      panel.innerHTML=h; brancher();
    }
    // les boosts : groupés par nom (×produit, le plus long restant) — 7 « ϟ ×3 » identiques devenaient illisibles
    function boostsHtml(){ var t=Date.now(), g={}, o=[]; (idle.boosts||[]).filter(function(b){return b.fin>t;}).forEach(function(b){ var k=(b.n||(b.k==='clic'?'✶':'ϟ'))+'|'+b.k; if(!g[k]){ g[k]={k:b.k,n:b.n,m:0,fin:0,c:0}; o.push(k); } g[k].m+=b.m; g[k].fin=Math.max(g[k].fin,b.fin); g[k].c++; });
      return o.map(function(k){ var b=g[k]; return '<span class="xc-boost '+b.k+'">'+(b.n?esc2(b.n)+' ':(b.k==='clic'?'✶ ':'ϟ '))+'×'+C.fmtL(b.m)+(b.c>1?' ('+b.c+')':'')+' · '+Math.ceil((b.fin-t)/60000)+' min</span>'; }).join(''); }
    function vueGen(ctx){
      var ups=C.UPG.map(function(u){ return { u:u, e:C.upgEtat(idle,u) }; }).filter(function(x){ return x.e==='dispo'||x.e==='cher'; }).sort(function(a,b){ return a.u.L-b.u.L; }).slice(0,10);
      var upHtml=ups.length?'<div class="xc-upgs">'+ups.map(function(x){ return '<button class="xc-upg '+x.e+'" data-upg="'+x.u.id+'" title="'+esc2(x.u.d)+'"><i>'+esc2(x.u.ic)+'</i><span>×2</span><b>'+C.fmtL(x.u.L)+'</b></button>'; }).join('')+'</div>':'';
      return upHtml+'<div class="xc-mode">'+[[1,'×1'],[10,'×10'],['max','max']].map(function(m){ return '<button data-mode="'+m[0]+'" class="'+(String(mode)===String(m[0])?'on':'')+'">'+m[1]+'</button>'; }).join('')+'</div>'
        +(function(){ var E=C.effets(idle), pr=C.production(ctx,idle), vus=0; return C.GENS.map(function(g,i){ var o=idle.owned[g.id]||0, ok=C.debloque(ctx,g,idle);
          if(!ok){ if(vus++) return ''; var av=i>0?C.GENS[i-1]:null; return '<div class="xc-g verrou"><span class="xc-gi">'+g.ic+'</span><div class="xc-gt"><b>'+esc2(g.n)+'</b><small>⊘ '+((ctx.decouverts||0)<g.dec?'découvre '+g.dec+' ploxions ('+ctx.decouverts+')':'')+((ctx.decouverts||0)<g.dec&&av&&(idle.owned[av.id]||0)<C.AVANT?' · ':'')+(av&&(idle.owned[av.id]||0)<C.AVANT?C.AVANT+' '+esc2(av.n)+' ('+(idle.owned[av.id]||0)+')':'')+'</small></div></div>'; }
          var n=mode==='max'?Math.max(1,C.maxAchetable(g,o,idle.L,E.croissance)):mode, c=C.coutL(g,o,n,E.croissance), peut=idle.L!=null&&c<=idle.L+1e-12;
          var part=pr.L!=null&&pr.parts[g.id]!=null?Math.pow(10,pr.parts[g.id]-pr.base):0, pal=Math.floor(o/50), prochain=(pal+1)*50;
          return '<button class="xc-g'+(peut?' peut':'')+'" data-buy="'+g.id+'"><span class="xc-gi">'+g.ic+'</span><div class="xc-gt"><b>'+esc2(g.n)+(pal?' <em class="xc-pal">×'+C.fmtL(Math.log10(2)*Math.min(40,pal))+'</em>':'')+'</b><small>'+(o?Math.round(part*100)+' % de la production · ':'')+'palier ×2 à '+prochain+'</small><span class="xc-mini"><i style="width:'+((o%50)/50*100).toFixed(0)+'%"></i></span></div><div class="xc-gc"><b data-cout="'+g.id+'">'+C.fmtL(c)+'</b><small>'+o+(n!==1?' · +'+n:'')+'</small></div></button>'; }).join(''); })();
    }
    function nbQuetes(ctx){ return C.etatQuetes(ctx,idle,new Date().toISOString().slice(0,10)).filter(function(x){ return x.fait&&!x.reclamee; }).length; }
    function nbDispo(ctx){ return C.ARBRE.filter(function(n){ return C.techEtat(ctx,idle,n)==='dispo'; }).length; }
    var branche='dec';
    function vueArbre(ctx){
      var noeuds=C.ARBRE.filter(function(n){ return n.b===branche; });
      return '<div class="xc-branches">'+C.BRANCHES.map(function(b){ var d=C.ARBRE.filter(function(n){ return n.b===b[0]&&C.techEtat(ctx,idle,n)==='dispo'; }).length, a=C.ARBRE.filter(function(n){ return n.b===b[0]&&(idle.tech||{})[n.id]; }).length;
          return '<button data-branche="'+b[0]+'" class="'+(branche===b[0]?'on':'')+(d?' dispo':'')+'"><i>'+b[1]+'</i><span>'+esc2(b[2])+'</span><em>'+a+'/4</em></button>'; }).join('')+'</div>'
        +''
        +'<div class="xc-arbre">'+noeuds.map(function(n){ var e=C.techEtat(ctx,idle,n), v=C.valeurCond(ctx,idle,n.c.cle), cout=n.dims!=null?n.dims+' dimension'+(n.dims>1?'s':''):C.fmtL(n.L);
          return '<div class="xc-n '+e+'"><span class="xc-ni">'+n.ic+'</span><div class="xc-nt"><b>'+esc2(n.n)+'</b><small>'+esc2(n.d)+'</small>'
            +(e==='acquis'?'':'<span class="xc-cond'+(v>=n.c.n?' ok':'')+'">'+(v>=n.c.n?'✓ ':'')+Math.min(v,n.c.n)+' / '+n.c.n+' '+esc2(n.c.lib)+(n.r&&!(idle.tech||{})[n.r]?' · après '+esc2((C.ARBRE.filter(function(x){return x.id===n.r;})[0]||{}).n||''):'')+'</span>')+'</div>'
            +(e==='acquis'?'<em class="xc-acq">✓</em>':'<button data-tech="'+n.id+'"'+(e==='dispo'?'':' disabled')+'>'+cout+'</button>')+'</div>'; }).join('')+'</div>';
    }
    function vueDefis(ctx){
      var jour=new Date().toISOString().slice(0,10), qs=C.etatQuetes(ctx,idle,jour), nS=Object.keys(idle.succes||{}).length, S=idle.stats||{};
      return '<h4 class="xc-h">☼ quêtes du jour</h4>'
        +qs.map(function(x){ return '<div class="xc-q'+(x.reclamee?' faite':'')+'"><span class="xc-qi">'+esc2(x.q.ic)+'</span><div><b>'+esc2(x.q.n)+'</b><span class="xc-barre"><i style="width:'+(x.v/x.q.n2*100).toFixed(0)+'%"></i></span><small>'+x.v+' / '+x.q.n2+'</small></div>'
          +(x.reclamee?'<em>✓</em>':'<em class="xc-attente">'+x.v+'/'+x.q.n2+'</em>')+'</div>'; }).join('')
        +'<h4 class="xc-h">▲ missions du terrax</h4>'
        +C.missionsEtat(ctx,idle).map(function(x){ return '<div class="xc-q'+(x.reclamee?' faite':'')+'"><span class="xc-qi">'+esc2(x.m.ic)+'</span><div><b>'+esc2(x.m.n)+'</b><small>'+esc2(x.m.d)+'</small></div>'
          +(x.reclamee?'<em>✓</em>':'<button data-aller="'+esc2(x.m.px[0])+'">▶</button>')+'</div>'; }).join('')
        +'<h4 class="xc-h">✪ succès <small>'+nS+' / '+C.SUCCES.length+' · +'+Math.round((Math.pow(1.03,nS)-1)*100)+' % de production</small></h4>'
        +'<div class="xc-succes">'+C.SUCCES.map(function(x){ var ok=(idle.succes||{})[x.id]; return '<span class="'+(ok?'ok':'')+'" title="'+esc2(x.n+' — '+x.d)+'">'+esc2(x.ic)+'</span>'; }).join('')+'</div>'
        +'<p class="xc-note" data-succes-detail>touche un succès pour le voir</p>'
        +'<h4 class="xc-h">≡ statistiques</h4><div class="xc-stats">'
        +[['meilleur compteur',C.fmtL(S.meilleur)],['touchers',idle.clics||0],['temps de jeu',Math.round((S.jeu||0)/60)+' min'],['éclats attrapés',S.eclats||0],['fusions de la cité',S.fusions||0],['plongeons',S.plongeons||0],['quêtes accomplies',S.quetes||0],['améliorations',Object.keys(idle.upg||{}).length+' / '+C.UPG.length],['nœuds de l\'arbre',Object.keys(idle.tech||{}).length+' / '+C.ARBRE.length],['saisons',(idle.saisons||[]).length+1]]
          .map(function(x){ return '<span>'+esc2(x[0])+'<b>'+esc2(x[1])+'</b></span>'; }).join('')+'</div>';
    }
    function vueCarte(ctx){
      var m=C.multiplicateurs(ctx,idle);
      return '<p class="xc-note">Chaque ploxion découvert (ouvert pour de vrai) produit ; une catégorie complète multiplie tout. Pour finir le jeu : tout découvrir.</p>'
        +'<div class="xc-mult">'+[['découverte',m.decouverte],['catégories',m.categories],['tsoins ('+ctx.tsoins+')',m.tsoins],['heures ('+Math.round(ctx.heures)+' h)',m.heures],['clickers',m.clickers],['arbre',m.arbre]].map(function(x){ return '<span>'+esc2(x[0])+'<b>×'+C.fmtL(x[1])+'</b></span>'; }).join('')+'<span>dimensions ('+(idle.dims||0)+')<b>×'+C.fmtL(m.dimensions)+'</b></span></div>'
        +(ctx.categories.length?ctx.categories.map(function(c){ var pc=c.total?c.fait/c.total:0; return '<div class="xc-cat'+(pc>=1?' complete':'')+'"><span class="xc-ci">'+esc2(c.i)+'</span><div><b>'+esc2(c.l)+'</b><span class="xc-barre"><i style="width:'+(pc*100).toFixed(1)+'%"></i></span></div><em>'+c.fait+'/'+c.total+'</em></div>'; }).join(''):'<p class="xc-note">le registre se charge…</p>');
    }
    function vueDim(ctx,dims){
      var tro=(idle.saisons||[]).map(function(x){ return '<div class="xc-trophee">✪ saison '+x.saison+' · '+C.fmtL(x.L)+(x.dims?' · ∞ '+x.dims:'')+'</div>'; }).join('');
      return tro+'<div class="xc-carte"><h4>∞ Plonger d\'une dimension</h4>'
        +'<div class="xc-gros">+'+nD(dims)+'</div><small>dimension'+(dims>1?'s':'')+' à gagner (meilleur compteur de cette vie : '+C.fmtL(idle.Lrun)+')</small>'
        +'<button class="xc-action" data-plonger'+(dims<1?' disabled':'')+'>'+(dims<1?'il faut atteindre 10^15':'plonger')+'</button></div>'
        +'<div class="xc-carte"><h4>⇄ Tous les clickers</h4>'
        +'<textarea data-import rows="3" placeholder="sauvegarde ou total…" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea><input data-import-nom placeholder="nom du clicker (si c\'est un total)"><button class="xc-action" data-importer>importer</button> <button class="xc-action" data-exporter>exporter ma partie</button>'
        +(idle.imports.length?idle.imports.map(function(x,i){ return '<div class="xc-imp"><b>'+esc2(x.nom)+'</b><span>'+esc2(x.d||C.fmtL(x.L))+'</span><button data-oublier="'+i+'" aria-label="retirer">×</button></div>'; }).join(''):'')+'</div>';
    }
    function vueFins(ctx){
      var pk=C.palierReel(idle);
      return '<h4 class="xc-h">les paliers de réel</h4><div class="xc-reels">'
        +C.REELS.map(function(x,i){ var etat=x.inatteignable?'loin':i<=pk?'atteint':'avant'; return '<div class="xc-reel '+etat+'"><b>'+esc2(x.n)+'</b><small>'+esc2(x.d)+(x.inatteignable?' · « un autre truc que l\'infini »':' · '+x.dims+' dimensions')+'</small></div>'; }).reverse().join('')+'</div>'
        +''+C.fins(ctx,idle).map(function(f){ return '<div class="xc-fin'+(f.fait?' faite':'')+'"><div><b>'+esc2(f.n)+'</b><small>'+esc2(f.d)+'</small></div><span class="xc-barre"><i style="width:'+(f.p*100).toFixed(3)+'%"></i></span><em>'+(f.fait?'✓':(f.p*100<0.01&&f.p>0?'<0.01':(f.p*100).toFixed(2))+' %')+'</em></div>'; }).join('');
    }
    function brancher(){
      var w=panel.querySelector('.xc'), coeur=panel.querySelector('[data-orb]');
      coeur.onclick=function(ev){ var g=C.clic(contexte(),idle); C.gagner(idle,g); idle.clics=(idle.clics||0)+1; vib('leger');
        coeur.classList.remove('bat'); void coeur.offsetWidth; coeur.classList.add('bat');   /* le centre de la cité bat */
        var f=document.createElement('span'); f.className='xc-flot'; f.textContent='+'+C.fmtL(g); var r=coeur.getBoundingClientRect(), wr=w.getBoundingClientRect();
        f.style.left=((ev&&ev.clientX?ev.clientX:r.left+r.width/2)-wr.left)+'px'; f.style.top=((ev&&ev.clientY?ev.clientY:r.top+r.height/2)-wr.top)+'px'; w.appendChild(f); setTimeout(function(){ f.remove(); },900);
        palierEtToast(); maj(); idleSave(); };
      panel.querySelectorAll('[data-sous]').forEach(function(b){ b.onclick=function(){ sous=b.getAttribute('data-sous'); vib('selection'); renderIdle(); }; });
      panel.querySelectorAll('[data-mode]').forEach(function(b){ b.onclick=function(){ var m=b.getAttribute('data-mode'); mode=m==='max'?'max':+m; vib('selection'); renderIdle(); }; });
      panel.querySelectorAll('[data-buy]').forEach(function(b){ b.onclick=function(){ var n=C.acheter(contexte(),idle,b.getAttribute('data-buy'),mode); if(!n){ vib('erreur'); b.classList.remove('non'); void b.offsetWidth; b.classList.add('non'); return; } vib('moyen'); palierEtToast(); idleSave(true); renderIdle(); }; });
      var pl=panel.querySelector('[data-plonger]'); if(pl) pl.onclick=function(){ if(pl.dataset.sur!=='1'){ pl.dataset.sur='1'; pl.textContent='sûr ? toucher encore'; vib('moyen'); return; } var g=C.plonger(idle); if(g){ vib('succes'); try{ if(window.jOSTsoin&&window.jOSTsoin.mark) window.jOSTsoin.mark('clicker','dimension +'+g); }catch(e){} idleSave(true); renderIdle(); toast('∞ +'+nD(g)+' dimensions · tout est multiplié'); } };
      // exporter : la partie entière (base64, comme Clickion) ; la recoller dans « importer » la FUSIONNE (rien ne recule)
      var ex=panel.querySelector('[data-exporter]'); if(ex) ex.onclick=function(){ var t=panel.querySelector('[data-import]'); t.value=btoa(unescape(encodeURIComponent(JSON.stringify(idle)))); try{ navigator.clipboard.writeText(t.value); }catch(e){} t.select(); toast('⇅ partie copiée'); };
      var im=panel.querySelector('[data-importer]'); if(im) im.onclick=function(){ var brut=panel.querySelector('[data-import]').value.trim(); if(/^[A-Za-z0-9+\/=]{200,}$/.test(brut)){ try{ var dd=JSON.parse(decodeURIComponent(escape(atob(brut)))); if(dd&&dd.v===3){ lien.poser(C.fusionner(idle,dd)); idleSave(true); toast('⇅ partie fusionnée'); renderIdle(); return; } }catch(e){} } try{ var x=C.importer(panel.querySelector('[data-import]').value, panel.querySelector('[data-import-nom]').value); idle.imports=idle.imports.filter(function(y){ return !(y.type===x.type&&y.nom===x.nom); }); idle.imports.push(x); vib('succes'); idleSave(true); renderIdle(); toast('⇄ '+x.nom+' : '+x.d); }catch(er){ vib('erreur'); toast('! '+er.message); } };
      panel.querySelectorAll('[data-upg]').forEach(function(b){ b.onclick=function(){ if(C.acheterUpg(idle,b.getAttribute('data-upg'))){ vib('succes'); var u=C.UPG.filter(function(x){return x.id===b.getAttribute('data-upg');})[0]; toast('⬆ '+u.n+' : ×2'); palierEtToast(); idleSave(true); renderIdle(); } else vib('erreur'); }; });
      panel.querySelectorAll('[data-mission]').forEach(function(b){ b.onclick=function(){ if(C.reclamerMission(contexte(),idle,b.getAttribute('data-mission'))){ vib('succes'); toast('▲ mission du terrax : ×2 pour toujours'); try{ if(window.jOSTsoin&&window.jOSTsoin.mark) window.jOSTsoin.mark('clicker','mission '+b.getAttribute('data-mission')); }catch(e){} idleSave(true); renderIdle(); } }; });
      panel.querySelectorAll('[data-aller]').forEach(function(b){ b.onclick=function(){ var id=b.getAttribute('data-aller'); try{ if(window.jOS&&window.jOS.openPloxion) window.jOS.openPloxion(id); else location.href='/px/'+encodeURIComponent(id); }catch(e){ location.href='/px/'+encodeURIComponent(id); } }; });
      panel.querySelectorAll('[data-quete]').forEach(function(b){ b.onclick=function(){ if(C.reclamerQuete(contexte(),idle,new Date().toISOString().slice(0,10),b.getAttribute('data-quete'))){ vib('succes'); toast('☼ quête accomplie : ×3 pendant 1 h'); try{ if(window.jOSTsoin&&window.jOSTsoin.mark) window.jOSTsoin.mark('clicker','quête du jour'); }catch(e){} palierEtToast(); idleSave(true); renderIdle(); } }; });
      panel.querySelectorAll('.xc-succes span').forEach(function(sp){ sp.onclick=function(){ var d=panel.querySelector('[data-succes-detail]'); if(d) d.textContent=sp.getAttribute('title'); vib('selection'); }; });
      var ec=panel.querySelector('[data-eclat]'); if(ec) ec.onclick=function(ev){ ev.stopPropagation(); attraperEclat(); };
      panel.querySelectorAll('[data-branche]').forEach(function(b){ b.onclick=function(){ branche=b.getAttribute('data-branche'); vib('selection'); renderIdle(); }; });
      panel.querySelectorAll('[data-tech]').forEach(function(b){ b.onclick=function(){ var id=b.getAttribute('data-tech'); if(C.acheterTech(contexte(),idle,id)){ var n=C.ARBRE.filter(function(x){return x.id===id;})[0]; vib('succes'); try{ if(window.jOSTsoin&&window.jOSTsoin.mark) window.jOSTsoin.mark('clicker','arbre : '+n.n); }catch(e){} idleSave(true); renderIdle(); toast('⟡ '+n.n+' : '+n.d); } else vib('erreur'); }; });
      panel.querySelectorAll('[data-oublier]').forEach(function(b){ b.onclick=function(){ idle.imports.splice(+b.getAttribute('data-oublier'),1); idleSave(true); renderIdle(); }; });
    }
    /** chaque seconde : seulement les nombres (pas de redessin : l'animation reste fluide) */
    function maj(){
      var ctx=contexte(), pr=C.production(ctx,idle), t=panel.querySelector('[data-c-total]'), p=panel.querySelector('[data-c-prod]'); if(!t) return;
      t.textContent=C.fmtL(idle.L); if(p) p.textContent='+'+C.fmtL(pr.L); var ex=panel.querySelector('[data-c-exp]'); if(ex) ex.textContent=expo(idle.L); var ech=panel.querySelector('[data-c-ech]'); if(ech) ech.textContent=C.phrase(idle.L);
      var bo=panel.querySelector('[data-boosts]'); if(bo) bo.innerHTML=boostsHtml();
      var k=C.effets(idle).croissance;
      panel.querySelectorAll('[data-buy]').forEach(function(b){ var g=C.GENS.filter(function(x){return x.id===b.getAttribute('data-buy');})[0], o=idle.owned[g.id]||0, n=mode==='max'?Math.max(1,C.maxAchetable(g,o,idle.L,k)):mode, c=C.coutL(g,o,n,k);
        b.classList.toggle('peut', idle.L!=null&&c<=idle.L+1e-12); var cc=b.querySelector('[data-cout]'); if(cc) cc.textContent=C.fmtL(c); });
    }
    var eclatVisible=null, eclatT=Date.now()+45000;
    function attraperEclat(){ if(!eclatVisible) return; var id=eclatVisible; eclatVisible=null; var el=panel.querySelector('[data-eclat]'); if(el) el.remove();
      var r=C.eclat(contexte(),idle,id); vib('succes'); toast(r.e.ic+' '+r.e.n+' : '+r.e.d+(r.gain!=null?' (+'+C.fmtL(r.gain)+')':'')); try{ if(window.jOSTsoin&&window.jOSTsoin.mark) window.jOSTsoin.mark('clicker','éclat '+r.e.n); }catch(e){} palierEtToast(); idleSave(true); maj(); }
    function peutEtreEclat(){
      if(tab!=='idle'||document.hidden||eclatVisible||Date.now()<eclatT) return;
      if(Math.random()>1/40) return;   // ~ une fois toutes les 40 s une fois l'attente passée
      var w=panel.querySelector('.xc-coeur-cite'); if(!w) return;
      eclatVisible=C.ECLATS[Math.floor(Math.random()*C.ECLATS.length)].id; eclatT=Date.now()+60000+Math.random()*90000;
      var b=document.createElement('button'); b.className='xc-eclat'; b.setAttribute('data-eclat',''); b.setAttribute('aria-label','un éclat doré'); b.textContent='✸';
      b.style.left=(15+Math.random()*70)+'%'; b.style.top=(15+Math.random()*60)+'%'; b.onclick=function(ev){ ev.stopPropagation(); attraperEclat(); };
      w.parentNode.style.position='relative'; w.parentNode.appendChild(b); vib('moyen');
      setTimeout(function(){ if(b.isConnected){ b.remove(); if(eclatVisible) eclatVisible=null; } },12000);
    }
    function expo(L){ return L==null||L<4?'':'10^'+(L<1e6?Math.floor(L):C.fmtL(Math.log10(L))); }
    function rate(){ var p=C.production(contexte(),idle).L; return p==null?0:p; }

    // ===== PORTS (bus jOSPorts) : ins gain/action -> jOSGame.award ; out balance -> budget cadeau =====
    var offs=[], lastBal=null, lastAct={sig:'',t:0};
    var KOINKEY='jos:xp-koins';
    function loadKoins(){ try{ var d=JSON.parse(localStorage.getItem(KOINKEY)||'{}'); return (d&&typeof d==='object')?d:{}; }catch(e){ return {}; } }
    function saveKoins(d){ try{ localStorage.setItem(KOINKEY,JSON.stringify(d)); }catch(e){} }
    function clean(s){ return String(s).replace(/[<>]/g,'').slice(0,80); }
    // OUT balance : l'XP total part sur le bus au fur et à mesure des gains (cadeau.budget s'en nourrit)
    function emitBalance(){
      var G=window.jOSGame; if(!G) return;
      try{ var x=G.xp(); if(x===lastBal) return; lastBal=x;
        if(window.jOSPorts&&window.jOSPorts.emit) window.jOSPorts.emit('xp','balance',{xp:x,level:G.level()});
      }catch(e){}
    }
    // IN gain : tree.term (koin découvert = XP une seule fois par koin) ou jeux.score (le score devient de l'XP)
    function onGain(p){
      if(!alive) return; var G=window.jOSGame; if(!G) return;
      if(typeof p==='string') p={slug:p};
      if(!p||typeof p!=='object') return;
      try{
        if(typeof p.score==='number'&&isFinite(p.score)){
          if(!(p.score>0)&&!p.win) return;
          var xp=Math.max(1,Math.min(40,Math.round(p.score/10)));
          G.award('game-score',{xp:xp,label:'Partie : '+clean(p.name||p.game||'arcade')+(p.win?' (gagnée)':''),icon:'◈',toast:true});
          return;
        }
        var slug=p.slug||p.term||p.name||p.label;
        if(typeof slug!=='string'||!slug) return;
        var seen=loadKoins(); if(seen[slug]) return;
        seen[slug]=Date.now(); saveKoins(seen);
        G.award('koin-discover',{xp:2,label:'Koin découvert : '+clean(slug),icon:'△',toast:false});
      }catch(e){}
    }
    // IN action : bd.done / bouffe.order — une action réelle accomplie donne de l'XP
    function onAction(p){
      if(!alive) return; var G=window.jOSGame; if(!G) return;
      if(typeof p==='string') p={title:p};
      if(!p||typeof p!=='object') return;
      var label=p.title||p.name||p.label; if(typeof label!=='string'||!label) return;
      var t=Date.now(); if(lastAct.sig===label&&t-lastAct.t<5000) return;
      lastAct={sig:label,t:t};
      var xp=(typeof p.xp==='number'&&isFinite(p.xp))?Math.max(1,Math.min(50,Math.round(p.xp))):12;
      try{ G.award('real-action',{xp:xp,label:'Action réelle : '+clean(label),icon:'◎',toast:true}); }catch(e){}
    }

    function render(){
      container.querySelectorAll('.xp__tab').forEach(function(t){t.classList.toggle('on',t.getAttribute('data-tab')===tab);});
      if(tab==='idle')renderIdle(); else if(tab==='quests')renderQuests(); else if(tab==='vect')renderVect(); else renderProg();
    }
    function onGame(){ if(!alive)return; checkQuests(); emitBalance(); if(tab==='prog')renderProg(); }
    window.addEventListener('jos:game',onGame);
    render();
    checkQuests();   // catch-up : valide les quêtes déjà remplies par les parties précédentes
    try{ if(window.jOSPorts&&window.jOSPorts.on){
      offs.push(window.jOSPorts.on('ploxion.xp.gain',onGain));
      offs.push(window.jOSPorts.on('ploxion.xp.action',onAction));
    } }catch(e){}
    emitBalance();   // balance initiale sur le bus
    timer=setInterval(function(){ if(!alive)return; if(lastBal===null)emitBalance(); var now=Date.now(),dt=C.ecoule(idle);lastT=now; var cx=contexte(), p=C.production(cx,idle).L, au=C.effets(idle).auto; if(p!=null&&dt>0){ C.gagner(idle,p+Math.log10(dt)); } if(au&&dt>0&&dt<5){ C.gagner(idle,C.clic(cx,idle)+Math.log10(au*dt)); } /* l'auto-toucher ne compte pas comme toucher : l'arbre ✦ exige de VRAIS touchers */ if(tab==='idle'&&!document.hidden){ idle.stats.jeu=(idle.stats.jeu||0)+dt; peutEtreEclat(); } if((p!=null||au)&&dt>0){ idle.t=now; palierEtToast(); idleSave(); if(tab==='idle')maj(); } },1000);
    return { unmount:function(){ alive=false; if(timer)clearInterval(timer); window.removeEventListener('jos:game',onGame); offs.forEach(function(o){ try{o();}catch(e){} }); lien.fin(); container.innerHTML=''; } };
  }
  // ===== XUI (contrat v0, bion jOSXui) : describe() = MA progression de jeu, non monté =====
  // p1 = le niveau + XP de la vraie économie (LA donnée maîtresse : window.jOSGame, le bion
  // core) ; p3 = l'idle bonus (xb:xpclick). Gauge = la barre vers le niveau suivant. Ne throw jamais.
  function describe(){
    var items=[];
    try{
      var G=window.jOSGame;
      if(G&&G.progress){
        var pr=G.progress()||{};
        var TITLES=['','Bion','Cubion','Ploxion','Plugion','Boxion','Xerion','Xeroction'];
        var title=TITLES[Math.min(pr.level|0,TITLES.length-1)]||('Niv '+(pr.level|0));
        items.push({ p:1, kind:'stat', label:'◈ niveau '+(pr.level|0)+' · '+title, value:(typeof G.xp==='function'?(G.xp()|0):0)+' XP' });
        if(pr.span) items.push({ p:2, kind:'gauge', label:'vers le niveau '+((pr.level|0)+1), value:Math.round((pr.into||0)/pr.span*100), min:0, max:100 });
      } else {
        items.push({ p:1, kind:'text', label:'◈ jeu', value:'moteur jOSGame pas chargé' });
      }
      var idle=null; try{ idle=JSON.parse(localStorage.getItem('xb:xpclick')); }catch(e){}
      if(idle&&window.jOSXerClicker){ var cl=window.jOSXerClicker.normaliser(idle); items.push({ p:3, kind:'stat', label:'clicker du xerboxion', value:window.jOSXerClicker.fmtL(cl.L)+(cl.dims?' · ∞'+cl.dims:'') }); }
    }catch(e){ items=[{ p:1, kind:'text', label:'◈ jeu', value:'progression indisponible' }]; }
    return { v:1, id:'xp', title:'Jeu', icon:'◈', items:items };
  }

  window.jOSApps=window.jOSApps||{};
  window.jOSApps['xp']={ manifest:{ id:'xp', name:'Jeu', icon:'◈' }, mount:mount, describe:describe };
  window.jOSApps['quests']=window.jOSApps['xp'];   // FUSION (directive RS-7) : quests → xp, alias rétro-compat
})();
;

try{window.dispatchEvent(new CustomEvent('xb:app:registered',{detail:{id:"xp"}}));}catch(e){}
