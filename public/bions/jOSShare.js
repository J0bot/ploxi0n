/* bion jOSShare — servi seul pour ploxi0n (/px/bion-app/jOSShare.js) */
void 0;
(function(){try{if(document.querySelector('style[data-bion-css="'+"jOSShare"+'"]'))return;var s=document.createElement('style');s.setAttribute('data-bion-css',"jOSShare");s.textContent="\n  #sh-ov{position:fixed;inset:0;z-index:100090;display:flex;align-items:flex-end;justify-content:center;\n    background:color-mix(in srgb,var(--xr-bg,#050505) 60%,transparent);backdrop-filter:blur(5px)}\n  #sh-ov[hidden]{display:none} html.is-embedded #sh-ov{display:none!important}\n  .sh-panel{width:min(560px,100vw);max-height:90vh;display:flex;flex-direction:column;\n    background:var(--xr-surface,#0c1320);border:1px solid var(--xr-border,#22324f);border-radius:18px 18px 0 0;\n    overflow:hidden;font-family:var(--xr-font-ui,system-ui);padding-bottom:env(safe-area-inset-bottom)}\n  @media(min-width:620px){ #sh-ov{align-items:center} .sh-panel{border-radius:18px} }\n  .sh-head{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--xr-border,#22324f)}\n  .sh-head b{flex:1;color:var(--xr-accent,#3fe0d0)}\n  .sh-x{background:none;border:1px solid var(--xr-border,#22324f);color:var(--xr-text,#e7f0ff);width:32px;height:32px;border-radius:9px;cursor:pointer;font-size:17px}\n  .sh-body{flex:1;min-height:120px;overflow:auto;padding:8px 12px}\n  .sh-t{display:flex;align-items:center;gap:11px;padding:11px;border-radius:12px;cursor:pointer;border:1px solid transparent}\n  .sh-t:hover{background:color-mix(in srgb,var(--xr-accent,#3fe0d0) 8%,transparent);border-color:var(--xr-border,#22324f)}\n  .sh-av{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font-size:1.1rem;background:color-mix(in srgb,var(--xr-accent,#3fe0d0) 16%,transparent);flex:0 0 auto}\n  .sh-t b{font-size:.9rem}.sh-t small{display:block;font-size:.68rem;color:var(--xr-muted,#8aa0c0)}\n  .sh-sec{font-size:.7rem;text-transform:uppercase;letter-spacing:.06em;color:var(--xr-muted,#8aa0c0);margin:12px 4px 4px;font-weight:700}\n  .sh-msg{max-width:78%;margin:5px 0;padding:8px 11px;border-radius:13px;font-size:.86rem;line-height:1.35;word-break:break-word}\n  .sh-msg.me{margin-left:auto;background:color-mix(in srgb,var(--xr-accent,#3fe0d0) 20%,transparent);border-bottom-right-radius:4px}\n  .sh-msg.them{background:var(--xr-bg,#0b1220);border:1px solid var(--xr-border,#22324f);border-bottom-left-radius:4px}\n  .sh-msg .au{font-size:.62rem;color:var(--xr-accent,#3fe0d0);font-weight:700;margin-bottom:2px}\n  .sh-msg img,.sh-msg video{max-width:100%;border-radius:9px;display:block;margin-top:4px}\n  .sh-msg a{color:var(--xr-accent,#3fe0d0)}\n  .sh-compose{flex:0 0 auto;border-top:1px solid var(--xr-border,#22324f);padding:8px 10px}\n  .sh-att{display:flex;flex-wrap:wrap;gap:6px}.sh-att .chip{font-size:.72rem;background:color-mix(in srgb,var(--xr-accent,#3fe0d0) 12%,transparent);border:1px solid var(--xr-border,#22324f);border-radius:999px;padding:4px 9px;display:flex;gap:6px;align-items:center}.sh-att .chip b{cursor:pointer;opacity:.6}\n  .sh-row{display:flex;gap:8px;align-items:center;margin-top:6px}\n  .sh-clip{cursor:pointer;font-size:1.2rem;width:40px;height:40px;display:grid;place-items:center;border:1px solid var(--xr-border,#22324f);border-radius:10px}\n  .sh-in{flex:1;min-width:0;background:var(--xr-bg,#0b1220);border:1px solid var(--xr-border,#22324f);border-radius:10px;color:var(--xr-text,#e7f0ff);padding:9px 11px;font:14px system-ui}\n  .sh-send{cursor:pointer;border:none;border-radius:10px;background:var(--xr-accent,#3fe0d0);color:#08101e;font-weight:800;width:44px;height:40px;font-size:1.1rem}\n  .sh-gpg{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:6px}\n  .sh-gpg[hidden]{display:none}  /* (relecture adverse 25.09) sans clé GPG, le « 🔓 clair » s'affichait quand même : display:flex battait [hidden] */\n  .sh-lock{cursor:pointer;border:1px solid var(--xr-border,#22324f);background:var(--xr-bg,#0b1220);color:var(--xr-muted,#8aa0c0);border-radius:999px;padding:4px 11px;font-size:.74rem;font-weight:700}\n  .sh-lock.on{background:color-mix(in srgb,var(--xr-ok,#36d399) 18%,transparent);border-color:var(--xr-ok,#36d399);color:var(--xr-text,#e7f0ff)}\n  .sh-rcpt{display:flex;flex-wrap:wrap;gap:5px;font-size:.7rem;color:var(--xr-muted,#8aa0c0)}\n  .sh-rcpt .rc{cursor:pointer;border:1px solid var(--xr-border,#22324f);border-radius:999px;padding:3px 8px}\n  .sh-rcpt .rc.sel{background:color-mix(in srgb,var(--xr-accent,#3fe0d0) 16%,transparent);border-color:var(--xr-accent,#3fe0d0);color:var(--xr-text,#e7f0ff)}\n  .sh-msg .lockbadge{font-size:.6rem;color:var(--xr-ok,#36d399);font-weight:700;margin-bottom:2px;letter-spacing:.04em}\n  .sh-msg.enc-fail{font-style:italic;color:var(--xr-muted,#8aa0c0)}\n  /* fichiers dans les DM (25.09) : chips, progression (transform seulement), fil (vignette, lecteur, carte), glisser sur la feuille */\n  .sh-panel{position:relative}\n  .sh-att .chip{max-width:100%;min-width:0}.sh-att .chip .cn{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n  .sh-att .chip small{opacity:.7;flex:0 0 auto}.sh-att .chip em{font-style:normal;color:#ff8a7a;flex:0 0 auto}.sh-att .chip.err{border-color:#ff8a7a}\n  .sh-att .chip button{flex:0 0 auto;background:none;border:0;color:inherit;opacity:.65;cursor:pointer;font-size:.8rem;min-width:26px;min-height:26px;padding:0}\n  .sh-prog{position:relative;height:22px;margin-top:6px;border-radius:7px;overflow:hidden;background:var(--xr-bg,#0b1220);border:1px solid var(--xr-border,#22324f)}\n  .sh-prog[hidden]{display:none}\n  .sh-prog i{position:absolute;inset:0;transform-origin:0 50%;transform:scaleX(0);transition:transform .2s;background:color-mix(in srgb,var(--xr-accent,#3fe0d0) 35%,transparent)}\n  .sh-prog span{position:relative;display:block;padding:0 8px;font-size:.7rem;line-height:22px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n  .sh-err{font-size:.74rem;color:#ff8a7a;margin-top:4px;word-break:break-word}.sh-err:empty{display:none}\n  .sh-msg .fx{display:flex;flex-direction:column;gap:5px}.sh-msg .bd:empty{display:none}\n  .sh-fx-img img{max-height:220px;width:auto;object-fit:cover;background:rgba(255,255,255,.04)}\n  .sh-fx-media video{max-height:260px}.sh-fx-media audio{display:block;width:100%;max-width:280px;margin-top:4px}\n  .sh-fx-media .n{display:block;font-size:.68rem;color:var(--xr-muted,#8aa0c0);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n  .sh-msg a.sh-fx-carte{display:flex;align-items:center;gap:8px;min-height:40px;min-width:0;margin-top:4px;padding:6px 10px;border-radius:10px;border:1px solid var(--xr-border,#22324f);background:rgba(255,255,255,.03);color:inherit;text-decoration:none}\n  .sh-fx-carte .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.8rem}\n  .sh-fx-carte .tl{flex:0 0 auto;font-size:.68rem;color:var(--xr-muted,#8aa0c0)}.sh-fx-carte .dl{flex:0 0 auto;color:var(--xr-accent,#3fe0d0);font-weight:800}\n  .sh-fx-carte .ext{flex:0 0 auto;min-width:34px;padding:4px 5px;border-radius:5px;border:1px solid var(--xr-border,#22324f);font:700 .6rem/1 ui-monospace,Menlo,monospace;letter-spacing:.04em;text-align:center;color:var(--xr-accent,#3fe0d0)}\n  .sh-panel.sh-glisse{outline:2px dashed var(--xr-accent,#3fe0d0);outline-offset:-6px}\n  .sh-panel.sh-glisse::after{content:'⬇ lâche pour joindre';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:800;color:var(--xr-accent,#3fe0d0);background:color-mix(in srgb,var(--xr-bg,#050505) 72%,transparent);pointer-events:none;border-radius:inherit}\n  .sh-note{padding:18px 14px;text-align:center;color:var(--xr-muted,#8aa0c0);font-size:.85rem}\n  .sh-cta{display:block;margin:12px auto;cursor:pointer;border:none;border-radius:11px;background:var(--xr-accent,#3fe0d0);color:#08101e;font-weight:800;padding:11px 18px}\n";document.head.appendChild(s);}catch(e){}})();
(function(){try{if(document.querySelector('[data-bion-html="'+"jOSShare"+'"]'))return;var d=document.createElement('div');d.setAttribute('data-bion-html',"jOSShare");d.innerHTML="<div id=\"sh-ov\" hidden role=\"dialog\" aria-label=\"Envoyer à un ami\">\n  <div class=\"sh-panel\">\n    <div class=\"sh-head\"><button class=\"sh-x\" data-sh-back hidden>‹</button><b data-sh-title>Envoyer à…</b><button class=\"sh-x\" data-sh-close>×</button></div>\n    <div class=\"sh-body\" data-sh-body></div>\n    <div class=\"sh-compose\" data-sh-compose hidden>\n      <div class=\"sh-gpg\" data-sh-gpg hidden>\n        <button class=\"sh-lock\" data-sh-lock title=\"chiffrer ce message de bout en bout (GPG)\">🔓 clair</button>\n        <div class=\"sh-rcpt\" data-sh-rcpt></div>\n      </div>\n      <div class=\"sh-att\" data-sh-att></div>\n      <div class=\"sh-prog\" data-sh-prog role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\" aria-valuenow=\"0\" hidden><i data-sh-prog-bar></i><span data-sh-prog-t></span></div>\n      <div class=\"sh-err\" data-sh-err role=\"status\" aria-live=\"polite\"></div>\n      <div class=\"sh-row\"><label class=\"sh-clip\" data-sh-clip title=\"image / vidéo\">📎<input type=\"file\" accept=\"image/*,video/*\" data-sh-file hidden></label>\n        <input class=\"sh-in\" data-sh-text placeholder=\"message…\" maxlength=\"4000\">\n        <button class=\"sh-send\" data-sh-send>➤</button></div>\n    </div>\n  </div>\n</div>";document.body.appendChild(d);}catch(e){}})();

;
(function () {
  if (window.jOSShare) return;
  var ov=document.getElementById('sh-ov'); if(!ov) return;
  var body=ov.querySelector('[data-sh-body]'), titleEl=ov.querySelector('[data-sh-title]'),
      compose=ov.querySelector('[data-sh-compose]'), attEl=ov.querySelector('[data-sh-att]'),
      textIn=ov.querySelector('[data-sh-text]'), fileIn=ov.querySelector('[data-sh-file]'),
      backBtn=ov.querySelector('[data-sh-back]'),
      gpgBar=ov.querySelector('[data-sh-gpg]'), lockBtn=ov.querySelector('[data-sh-lock]'),
      rcptEl=ov.querySelector('[data-sh-rcpt]'),
      clipEl=ov.querySelector('[data-sh-clip]'), progEl=ov.querySelector('[data-sh-prog]'), progBar=ov.querySelector('[data-sh-prog-bar]'),
      progTxt=ov.querySelector('[data-sh-prog-t]'), errEl=ov.querySelector('[data-sh-err]'), panel=ov.querySelector('.sh-panel');
  function S(){ return window.jOSSocial || null; }
  function isLocal(){ var s=S(); return !!(s && s.mode && s.mode()==='local'); }
  function G(){ return window.jOSGpg || null; }
  // marqueur d'un média chiffré DANS le texte (lui-même chiffré) : ⟦enc:img|vid:URL⟧
  var ENC_RE=/⟦enc:(img|vid):(\S+?)⟧/g;
  function esc(s){ return (s==null?'':String(s)).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function csrf(){ var m=document.querySelector('meta[name=csrf-token]'); return m?m.content:''; }
  // appels API sociale bruts (jOSSocial expose base+token)
  function sapi(method, path, b){ var s=S(); if(!s) return Promise.reject();
    var o={ method:method, headers:{ 'Accept':'application/json','Authorization':'Bearer '+(s.token?s.token():'') } };
    if(b){ o.headers['Content-Type']='application/json'; o.body=JSON.stringify(b); }
    return fetch(s.base+path, o).then(function(r){ if(!r.ok) throw new Error(r.status); return r.status===204?null:r.json(); }); }
  function arr(d){ return (d&&d.data)||d||[]; }

  var payload=null, target=null, myId=null;
  var gpgOn=false, picked={};   // E2E : chiffrer ? + empreintes destinataires sélectionnées

  // Construit la barre GPG (réutilise jOSGpg.recipients() comme le ploxion chat).
  function buildGpg(){
    var g=G(); if(!g){ gpgBar.hidden=true; return; }
    var st=g.state(); if(!st.hasKey){ gpgBar.hidden=true; gpgOn=false; return; }
    gpgBar.hidden=false;
    var rcpts=g.recipients();   // [{name,fpr,self}]
    rcptEl.innerHTML = gpgOn ? rcpts.map(function(r){
      return '<span class="rc'+(picked[r.fpr]?' sel':'')+'" data-fpr="'+esc(r.fpr)+'">'+(r.self?'🙂 ':'')+esc(r.name)+'</span>'; }).join('')
      : '<span style="opacity:.7">message en clair</span>';
    rcptEl.querySelectorAll('[data-fpr]').forEach(function(e){ e.onclick=function(){
      var f=e.getAttribute('data-fpr'); if(picked[f]) delete picked[f]; else picked[f]=1; buildGpg(); }; });
    lockBtn.className='sh-lock'+(gpgOn?' on':''); lockBtn.textContent=gpgOn?'🔒 chiffré':'🔓 clair';
    if(!st.unlocked && gpgOn) lockBtn.textContent='🔒 déverrouille ta clé';
  }
  lockBtn.onclick=function(){ var g=G(); if(!g) return;
    var st=g.state();
    if(!st.hasKey){ close(); if(window.jOSOp) window.jOSOp.openPloxion('trousseau'); return; }
    gpgOn=!gpgOn;
    if(gpgOn){ // par défaut : se chiffrer pour soi (relire) ; l'utilisateur ajoute les destinataires
      if(st.me) picked[st.me.fpr]=1;
      if(!st.unlocked && g.unlock){ var p=prompt('Passphrase de ta clé GPG (pour signer/lire) :'); if(p) g.unlock(p).then(buildGpg).catch(function(){ alert('passphrase incorrecte'); }); }
    }
    buildGpg();
  };
  function pickedFprs(){ return Object.keys(picked); }

  function open(p){ payload=p||null; target=null;
    var s=S(); if(s && !(s.token&&s.token()) && s.linkSSO) s.linkSSO();
    ov.hidden=false; backBtn.hidden=true; titleEl.textContent='Envoyer à…'; compose.hidden=true;
    renderAtt(); pickTarget();
  }
  function close(){ ov.hidden=true; }
  // 🛰 RS-1 (26.09) : admin (le bus du xion n'est ouvert qu'à l'admin, la meta du layout le dit aussi), la coord au manifeste, pas coupée
  function rs1Ok(){
    try { var v=localStorage.getItem('xb:coord.pieces'); if(v==='off'||v==='0'||v==='false') return false; } catch(e){}
    var m=document.querySelector('meta[name="user-admin"]'), adm=(m && m.getAttribute('content')==='1') || !!(window.jOSPorts && window.jOSPorts.xion===true);
    var px=false; try { px=(window.__PLOXIONS__||[]).some(function(p){ return p && p.id==='coord'; }); } catch(e){}
    return adm && px;
  }
  function versRS1(){
    var p=payload||{}, B=(window.__coordAJoindre=window.__coordAJoindre||[]), t=Date.now(), n0=B.length;
    if(p.text) B.push({ t:t, message:String(p.text).slice(0,4000) });
    (Array.isArray(p.fichiers)?p.fichiers:[]).slice(0,20).forEach(function(f){ if(f && typeof f.size==='number') B.push({ t:t, fichier:f, nom:f.name||'fichier', source:'partage' }); });
    if(p.tsoin) B.push({ t:t, genre:'tsoin', tsoin:p.tsoin });
    if(p.mediaUrl) B.push({ t:t, genre:'lien', url:String(p.mediaUrl) });
    var ok=false;
    try { if(window.jOS && window.jOS.openPloxion) ok=!!window.jOS.openPloxion('coord'); } catch(e){}
    try { if(!ok && window.jOSMobile && window.jOSMobile.open) ok=!!window.jOSMobile.open('coord','Coord'); } catch(e){}
    // pas de fenêtre ici (une page sans gestionnaire) : rien ne part, rien ne traîne dans la boîte, c'est dit
    if(!ok){ B.splice(n0, B.length-n0); body.insertAdjacentHTML('afterbegin','<div class="sh-note">⚠ la coord ne s\'ouvre pas sur cette page : ouvre-la depuis ton bureau</div>'); return; }
    close();
    // déjà ouverte : elle vide la boîte ; qui vient de s'ouvrir la vide au montage (le bus ne porte ni nom ni contenu)
    try { if(window.jOSPorts && window.jOSPorts.emit) window.jOSPorts.emit('coord','cmd',{ cmd:'joindre' }); } catch(e){}
  }
  // (relecture d'usage, 26.09) la ligne RS-1 ne dépend pas du social : elle était posée seulement quand les amis se chargeaient — pas connecté
  // aux amis, pendant le chargement ou social injoignable, « Envoyer à… » n'offrait pas RS-1. Elle est maintenant en tête de CHAQUE état.
  function rs1Html(){ return rs1Ok() ? '<div class="sh-sec">🛰 La flotte</div><div class="sh-t" data-rs1><span class="sh-av">🛰</span><div><b>RS-1</b><small>par la coord : texte, fichiers, tsoin</small></div></div>' : ''; }
  function brancherRs1(){ var r1=body.querySelector('[data-rs1]'); if(r1) r1.onclick=versRS1; }
  function pickTarget(){
    var s=S();
    if(!s || !(isLocal() ? s.isAuthed() : (s.token&&s.token()))){ body.innerHTML=rs1Html()+'<div class="sh-note">Connecte-toi à tes amis pour envoyer (via ton compte j0bot).</div><button class="sh-cta" data-amis>👋 Ouvrir Amis</button>';
      body.querySelector('[data-amis]').onclick=function(){ close(); if(window.jOSOp) window.jOSOp.openPloxion('amis'); }; brancherRs1(); return; }
    body.innerHTML=rs1Html()+'<div class="sh-note">chargement de tes amis…</div>'; brancherRs1();
    // groupes = spaces IdP, best-effort : sans jeton IdP on ne les demande même pas (le graphe local suffit)
    var spacesP = (s.token&&s.token()) ? s.spaces() : Promise.resolve([]);
    Promise.all([s.me(), s.friends(), spacesP]).then(function(res){
      var me=res[0]||{}, fr=res[1]||[], sp=res[2]||[]; myId=me.id||me.uuid;
      var h=rs1Html();
      if(fr.length){ h+='<div class="sh-sec">👤 Amis (DM)</div>'+fr.map(function(f){ var n=f.displayName||f.username||f.name||'ami'; var id=f.id||f.uuid||f.friend_id;
        return '<div class="sh-t" data-f="'+esc(id)+'" data-n="'+esc(n)+'"><span class="sh-av">'+esc((n[0]||'?').toUpperCase())+'</span><div><b>'+esc(n)+'</b><small>message privé'+(f.handle?' · @'+esc(f.handle):'')+'</small></div></div>'; }).join(''); }
      if(sp.length){ h+='<div class="sh-sec">👥 Groupes</div>'+sp.map(function(g){ var n=g.name||g.title||'Groupe';
        return '<div class="sh-t" data-s="'+esc(g.id)+'" data-n="'+esc(n)+'"><span class="sh-av">👥</span><div><b>'+esc(n)+'</b><small>groupe</small></div></div>'; }).join(''); }
      if(!fr.length && !sp.length) h+='<div class="sh-note">Pas encore d\'amis ni de groupes. Ajoute un pote dans <b>Amis</b>, puis reviens.</div>';
      body.innerHTML=h;
      brancherRs1();
      body.querySelectorAll('[data-f]').forEach(function(e){ e.onclick=function(){ openConv({kind:'friend',id:e.getAttribute('data-f'),name:e.getAttribute('data-n')}); }; });
      body.querySelectorAll('[data-s]').forEach(function(e){ e.onclick=function(){ openConv({kind:'group',id:e.getAttribute('data-s'),name:e.getAttribute('data-n')}); }; });
    }).catch(function(){ body.innerHTML=rs1Html()+'<div class="sh-note">Social injoignable. Réessaie.</div>'; brancherRs1(); });
  }

  // résout le CHANNEL d'une cible (groupe = son 1er channel ; ami = space DM find-or-create)
  function resolveChannel(t){
    if(t.kind==='group') return firstChannel(t.id);
    // graphe LOCAL : le DM n'a pas de channel, sa room est re-dérivée serveur depuis l'amitié (/px/dm/{id})
    if(isLocal()) return Promise.resolve('dm:'+t.id);
    // DM : space privé déterministe dm-<min>-<max>
    var pair=[String(myId),String(t.id)].sort().join('-'); var slug='dm-'+pair.replace(/[^a-zA-Z0-9-]/g,'').slice(0,40);
    return S().spaces().then(function(sp){ var ex=arr(sp).filter(function(g){ return (g.name||g.title)===slug; })[0];
      if(ex) return firstChannel(ex.id);
      return S().createSpace(slug,'private').then(function(d){ var sid=(d&&(d.id||(d.data&&d.data.id)))||(d&&d.space&&d.space.id);
        return S().inviteToSpace(sid, t.id).catch(function(){}).then(function(){ return firstChannel(sid); }); });
    });
  }
  function firstChannel(spaceId){ return S().channels(spaceId).then(function(ch){ ch=arr(ch);
    if(ch.length) return ch[0].id;
    return sapi('POST','/spaces/'+spaceId+'/channels',{name:'general'}).then(function(d){ return (d&&(d.id||(d.data&&d.data.id))); }); }); }

  function openConv(t){ target=t; backBtn.hidden=false; titleEl.textContent=t.name; compose.hidden=false; textIn.value=payload&&payload.text?payload.text:'';
    buildGpg();
    // (relecture adverse) ce qui n'est pas parti vers CET ami pendant qu'on regardait ailleurs (feuille fermée, autre fil) revient ici
    var cle=cleFil(t); pendingFichiers=restes[cle]||[]; delete restes[cle]; armerClip(); progres(null);
    dire(pendingFichiers.length ? '⚠ '+pendingFichiers.length+' fichier'+(pendingFichiers.length>1?'s pas partis':' pas parti')+' la dernière fois : ➤ pour réessayer, ✕ pour laisser' : '');
    renderAtt();
    body.innerHTML='<div class="sh-note">ouverture…</div>';
    resolveChannel(t).then(function(cid){ if(target!==t) return; target.channel=cid; armerClip();
        // jOSShare.to(ami, {fichiers:[File]}) : pré-joints (un groupe n'en prend pas : dit sur chaque chip)
        if(payload && payload.fichiers && payload.fichiers.length) ajouterFichiers(Array.prototype.slice.call(payload.fichiers));
        loadMsgs(); })
      .catch(function(){ body.innerHTML='<div class="sh-note">Impossible d\'ouvrir la conversation (API à compléter ?).</div>'; });
  }
  // un message du DM local {id,from,mine,text,fichiers?} → la forme lue par msgShell/hydrate (« mine » gardé : ouvert par to(), myId est inconnu)
  function fromDm(m){ return { id:m.id, body:m.text, author:m.from, mine:!!m.mine, user_id: m.mine ? myId : ('x'+m.id), fichiers: Array.isArray(m.fichiers)?m.fichiers:[] }; }
  function isDmLocal(){ return !!(target && target.kind==='friend' && String(target.channel||'').indexOf('dm:')===0); }
  function loadMsgs(){ if(!target||!target.channel) return;
    var get = isDmLocal() ? S().dm(target.id).then(function(d){ return (d&&d.messages||[]).map(fromDm); })
      : sapi('GET','/channels/'+target.channel+'/messages');
    get.then(function(d){ var ms=arr(d);
      if(!ms.length){ body.innerHTML='<div class="sh-note">Démarre la conversation 👋</div>'; return; }
      body.innerHTML = ms.map(msgShell).join('');
      if(!body.__fx){ body.__fx=1; body.addEventListener('click', ouvrirFx); }   // (26.09) au 1er fil montré, jamais au boot
      ms.forEach(function(m,i){ hydrate(m, body.querySelector('[data-mi="'+i+'"]')); });
      body.scrollTop=body.scrollHeight;
    }).catch(function(){ body.innerHTML='<div class="sh-note">Conversation prête. Écris un message.</div>'; });
  }
  // linkifie un texte DÉJÀ échappé (jamais d'HTML brut du sender) + médias en clair
  function linkify(escd){
    return escd.replace(/(https?:\/\/[^\s]+\.(png|jpe?g|gif|webp|heic|heif))/gi,'<img src="$1">')
      .replace(/(https?:\/\/[^\s]+\.(mp4|webm|mov))/gi,'<video src="$1" controls></video>')
      .replace(/(https?:\/\/[^\s<>"]+)(?![^<]*>)/gi, function(u){ return /<(img|video)/.test(u)?u:'<a href="'+u+'" target="_blank" rel="noopener">'+u+'</a>'; });
  }
  function msgShell(m,i){ var mine=m.mine!=null ? !!m.mine : (m.user_id||m.userId)===myId;
    var fx=(m.fichiers&&m.fichiers.length) ? '<div class="fx">'+fichiersHTML(m.fichiers)+'</div>' : '';
    return '<div class="sh-msg '+(mine?'me':'them')+'" data-mi="'+i+'">'+(mine?'':'<div class="au">'+esc(m.author||m.username||'')+'</div>')+'<div class="bd">'+(fx&&!m.body?'':'…')+'</div>'+fx+'</div>'; }
  // les pièces jointes d'un message (fichiers dans les DM, 25.09) : une image = sa vignette (clic = l'originale), un son / une vidéo = le
  // lecteur, le reste = une carte nom + taille + ⬇ (un pdf s'ouvre à côté). TOUT échappé ; l'url n'est prise que si c'est la nôtre
  // (/px/dm/fichier/<id>), sinon refaite depuis l'id — jamais un javascript: ou un autre hôte venu d'une réponse.
  var FX_URL=/^\/px\/dm\/fichier\/[0-9]+$/;
  // (26.09, docs/dev/33 § « Ouvrir un fichier dans son app, de partout ») une pièce jointe s'ouvre dans SON app (jOSFiles.ouvrir : un .note
  // dans OneNote, une image au viewer) — elle ne se réécrit pas : le 1er enregistrement en fait une copie dans Mes fichiers/Reçus (c'est dit) ;
  // le ⬇ de la carte télécharge comme avant ; kill-switch xb:fichiers.ouvrir-partout=off : le lien d'avant
  // (relecture adverse) Ctrl/⌘/Maj-clic : le geste du navigateur (un onglet, une fenêtre), comme avant
  function ouvrirFx(e){ var a=e.target&&e.target.closest&&e.target.closest('a.sh-fx-carte,a.sh-fx-img'); if(!a||e.target.closest('.dl')||e.defaultPrevented||e.button||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey) return;
    var F=window.jOSFiles, u=a.getAttribute('href')||''; if(!F||typeof F.ouvrir!=='function'||(F.partout&&!F.partout())||!FX_URL.test(u)) return;
    e.preventDefault(); F.ouvrir({ url:u, nom:a.getAttribute('data-fx-nom')||'fichier', mime:a.getAttribute('data-fx-mime')||'', taille:+a.getAttribute('data-fx-taille')||0 }, { depuis:'dm', copie:'/Reçus' }); }
  function urlFx(x){ var u=String(x&&x.url||''); if(FX_URL.test(u)) return u; var id=parseInt(x&&x.id,10); return id>0?'/px/dm/fichier/'+id:''; }
  function taille(o){ o=+o||0; return o<1024 ? o+' o' : o<1048576 ? (o/1024).toFixed(1).replace('.',',')+' Ko' : (o/1048576).toFixed(1).replace('.',',')+' Mo'; }
  function fichiersHTML(l){ return (l||[]).map(function(x){
    var u=urlFx(x); if(!u) return ''; var m=String(x.mime||'').toLowerCase(), nom=String(x.nom||'fichier'), t=taille(x.taille);
    var fx=' data-fx-nom="'+esc(nom)+'" data-fx-mime="'+esc(m)+'" data-fx-taille="'+(+x.taille||0)+'"';   // (26.09) ouvrir dans son app : la méta, du texte
    if(/^image\//.test(m)) return '<a class="sh-fx sh-fx-img" href="'+esc(u)+'"'+fx+' target="_blank" rel="noopener" title="'+esc(nom)+'"><img src="'+esc(u)+'" alt="'+esc(nom)+'" loading="lazy"></a>';
    if(/^audio\//.test(m)) return '<div class="sh-fx sh-fx-media"><audio controls preload="none" src="'+esc(u)+'"></audio><span class="n">'+esc(nom)+' · '+esc(t)+'</span></div>';
    if(/^video\//.test(m)) return '<div class="sh-fx sh-fx-media"><video controls preload="metadata" playsinline src="'+esc(u)+'"></video><span class="n">'+esc(nom)+' · '+esc(t)+'</span></div>';
    var pdf=m==='application/pdf', ext=(/\.([a-z0-9]{1,5})$/i.exec(nom)||[])[1];   // l'extension en badge : lisible partout (pas d'emoji, absent des polices du Pi)
    return '<a class="sh-fx sh-fx-carte" href="'+esc(u)+'"'+fx+(pdf?' target="_blank" rel="noopener"':' download="'+esc(nom)+'"')+' title="'+esc(nom)+'"><span class="ext" aria-hidden="true">'+esc(ext?ext.toUpperCase():(pdf?'PDF':'—'))+'</span><span class="nm">'+esc(nom)+'</span><span class="tl">'+esc(t)+'</span><span class="dl" aria-hidden="true">⬇</span></a>';
  }).join(''); }
  // hydrate un message : déchiffre si armor (GPG E2E), sinon rendu clair. Les médias
  // chiffrés (marqueur ⟦enc:…⟧ dans le texte déchiffré) sont fetch + déchiffrés en objectURL.
  function hydrate(m, el){ if(!el) return; var bd=el.querySelector('.bd'); var raw=m.body||''; var g=G();
    if(g && g.isArmored && g.isArmored(raw)){
      g.tryDecrypt(raw).then(function(res){
        if(!res.ok){ el.classList.add('enc-fail'); bd.textContent = res.reason==='verrouille' ? '🔒 chiffré — déverrouille ta clé (trousseau)' : (res.reason==='pas-de-cle' ? '🔒 chiffré — crée ta clé GPG' : '🔒 chiffré (pas pour toi)'); return; }
        var badge='<div class="lockbadge">🔒 chiffré'+(res.by?' · signé '+esc(res.by):'')+'</div>';
        var html=linkify(esc(res.text||'')).replace(/⟦enc:(img|vid):[^⟧]+⟧/g,'');
        bd.innerHTML=badge+html; decryptInlineMedia(bd, res.text||'');
      });
    } else { bd.innerHTML=linkify(esc(raw)); }
  }
  // remplace les marqueurs ⟦enc:img|vid:URL⟧ par le média déchiffré (objectURL)
  function decryptInlineMedia(bd, text){ var g=G(); if(!g||!g.decryptBytes) return;
    var mm, marks=[]; ENC_RE.lastIndex=0; while((mm=ENC_RE.exec(text))){ marks.push({kind:mm[1], url:mm[2]}); }
    if(!marks.length) return;
    // retire les marqueurs déjà rendus en texte échappé, ajoute les placeholders
    marks.forEach(function(mk){
      var ph=document.createElement(mk.kind==='vid'?'video':'img'); if(mk.kind==='vid') ph.controls=true; ph.alt='🔒'; bd.appendChild(ph);
      fetch(mk.url,{headers:{Accept:'application/octet-stream'}}).then(function(r){ return r.arrayBuffer(); })
        .then(function(buf){ return g.decryptBytes(new Uint8Array(buf)); })
        .then(function(d){ if(d&&d.ok){ var blob=new Blob([d.bytes]); ph.src=URL.createObjectURL(blob); } else { ph.replaceWith(document.createTextNode('🔒 média non déchiffrable')); } })
        .catch(function(){ ph.replaceWith(document.createTextNode('🔒 média indisponible')); });
    });
  }

  // pièce jointe (image/vidéo) : on retient le fichier, on l'upload à l'envoi
  var pendingFile=null;
  // fichiers dans les DM (25.09) : [{f: File, err?: 'trop gros…' (jamais envoyé), echec?: raison du dernier envoi (réessayé au suivant)}]
  var pendingFichiers=[], MAX_FICHIERS=20;
  // (relecture adverse) restes[kind:id] = ce qui n'est pas parti vers un fil qu'on ne regardait plus à la fin de l'envoi : rendu à son
  // prochain openConv (jamais dans le fil d'un autre, jamais perdu en silence)
  var restes={};
  function cleFil(t){ return t ? String(t.kind||'')+':'+String(t.id) : ''; }
  function avertir(m){ try { if(window.jOSBoxion && window.jOSBoxion.toast) window.jOSBoxion.toast(m); } catch (e) {} }
  function modeFichiers(){ var s=S(); return !!(isDmLocal() && s && s.dmFichiers && s.dmFichiers()); }
  function armerClip(){ var on=modeFichiers();
    fileIn.accept = on ? '' : 'image/*,video/*'; fileIn.multiple = on;
    clipEl.title = on ? 'joindre des fichiers (ou glisse-les sur la feuille)' : 'image / vidéo';
    clipEl.setAttribute('aria-label', clipEl.title);
  }
  function dire(t){ errEl.textContent = t || ''; }
  function progres(fait, total, nom, i, n){
    if(fait==null){ progEl.hidden=true; progBar.style.transform='scaleX(0)'; return; }
    var pc = total>0 ? Math.min(100, Math.round(fait*100/total)) : 0;
    progEl.hidden=false; progBar.style.transform='scaleX('+(pc/100)+')'; progEl.setAttribute('aria-valuenow', String(pc));
    progTxt.textContent = (n>1 ? (i+1)+'/'+n+' · ' : '')+(nom||'')+' · '+pc+' %';
  }
  function ajouterFichiers(l){ var s=S(), max=(s&&s.dmFichierMax)||26214400, on=modeFichiers(), trop=0;
    (l||[]).forEach(function(f){ if(!f) return; if(pendingFichiers.length>=MAX_FICHIERS){ trop++; return; }
      pendingFichiers.push({ f:f, err: !on ? 'un groupe ne prend pas de pièce jointe' : (f.size||0)>max ? 'trop gros (> '+taille(max)+')' : '' }); });
    dire(trop ? MAX_FICHIERS+' fichiers à la fois au plus : '+trop+' laissé'+(trop>1?'s':'')+' de côté' : '');
    renderAtt(); }
  function chip(t, i, err){ return '<span class="chip'+(err?' err':'')+'">'+t+' <button type="button" data-clr="'+esc(i)+'" aria-label="retirer">✕</button></span>'; }
  function renderAtt(){ var h='';
    if(payload&&payload.tsoin) h+=chip('⦿ tsoin « '+esc(payload.tsoin.label||'')+' »','');
    if(payload&&payload.mediaUrl) h+=chip('🔗 média','');
    if(pendingFile) h+=chip('📎 '+esc(pendingFile.name),'');
    pendingFichiers.forEach(function(p,i){ var w=p.err||p.echec;
      h+=chip('📎 <span class="cn">'+esc(p.f.name||'fichier')+'</span> <small>'+esc(taille(p.f.size))+'</small>'+(w?' <em>⚠ '+esc(w)+'</em>':''), String(i), !!w); });
    attEl.innerHTML=h;
    attEl.querySelectorAll('[data-clr]').forEach(function(b){ b.onclick=function(){ var i=b.getAttribute('data-clr');
      if(i!==''){ pendingFichiers.splice(+i,1); if(payload) payload.fichiers=null; }
      else { pendingFile=null; if(payload){payload.tsoin=null;payload.mediaUrl=null;} }
      renderAtt(); }; });
  }
  fileIn.onchange=function(){ var l=Array.prototype.slice.call(fileIn.files||[]);
    if(modeFichiers()) ajouterFichiers(l); else { pendingFile=l[0]||null; renderAtt(); }
    try { fileIn.value=''; } catch (e) {}   // re-choisir le même fichier redéclenche change
  };
  // glisser des fichiers sur la feuille (fil d'un ami). Le bureau v2 (capture) exclut #sh-ov de ses cibles ; ici on arrête la bulle :
  // jOSFiles (dernier écouteur sur window) ne les range donc pas en plus.
  function aDesFichiers(e){ try { var t=e.dataTransfer&&e.dataTransfer.types; return !!t && Array.prototype.indexOf.call(t,'Files')>=0; } catch (x) { return false; } }
  function glisserOk(e){ return !compose.hidden && modeFichiers() && aDesFichiers(e); }
  panel.addEventListener('dragover', function(e){ if(!glisserOk(e)) return; e.preventDefault(); e.stopPropagation(); try { e.dataTransfer.dropEffect='copy'; } catch (x) {} panel.classList.add('sh-glisse'); });
  panel.addEventListener('dragleave', function(e){ if(!e.relatedTarget || !panel.contains(e.relatedTarget)) panel.classList.remove('sh-glisse'); });
  panel.addEventListener('drop', function(e){ panel.classList.remove('sh-glisse'); if(!glisserOk(e)) return; e.preventDefault(); e.stopPropagation();
    ajouterFichiers(Array.prototype.slice.call((e.dataTransfer&&e.dataTransfer.files)||[])); });

  function postUpload(fd){ fd.append('_t', csrf());
    return fetch('/share-media',{method:'POST',body:fd,headers:{'X-CSRF-TOKEN':csrf(),'X-Requested-With':'XMLHttpRequest'},credentials:'same-origin'})
      .then(function(r){ return r.ok?r.json():null; }).then(function(d){ return d&&d.url||null; }); }
  // Renvoie le FRAGMENT texte à insérer dans le message : URL en clair, ou marqueur
  // ⟦enc:…⟧ si chiffré (le blob uploadé est déjà du cipher GPG opaque).
  function uploadMedia(enc, fprs){ if(!pendingFile) return Promise.resolve('');
    var kind=(pendingFile.type||'').indexOf('video')===0?'vid':'img';
    if(!enc){ var fd=new FormData(); fd.append('file',pendingFile);
      return postUpload(fd).then(function(u){ return u||''; }); }
    var g=G();
    return pendingFile.arrayBuffer().then(function(buf){ return g.encryptBytes(new Uint8Array(buf), fprs); })
      .then(function(cipher){ var fd=new FormData(); fd.append('enc','1');
        fd.append('file', new Blob([cipher],{type:'application/octet-stream'}), 'm.gpg');
        return postUpload(fd); })
      .then(function(u){ return u?'⟦enc:'+kind+':'+u+'⟧':''; });
  }
  // fichiers dans les DM : tout part en UN message (le texte compris), la progression dans la barre ; ce qui est parti quitte la liste,
  // ce qui échoue y reste avec sa raison (réessayé au prochain ➤, ou retiré d'un ✕) — jamais perdu en silence
  // (relecture adverse) l'envoi peut durer (25 Mo sur le Pi) : on garde le fil et le brouillon du ➤. Fini, il ne touche l'écran que si
  // c'est encore ce fil, visible — avant, il effaçait le texte tapé PENDANT l'envoi, ou le brouillon du fil d'un autre ami ouvert
  // entre-temps, et y affichait ses échecs ; feuille fermée, ils étaient perdus en silence (openConv vide la liste)
  function envoyerAvecFichiers(clear, fx){
    var b=String(clear).slice(0,9900), t0=target, tape=textIn.value, p0=payload;
    function ici(){ return !!target && cleFil(target)===cleFil(t0) && !ov.hidden; }
    progres(0, 1, fx[0].f.name||'', 0, fx.length);
    return S().envoyerFichiersDm(t0.id, fx.map(function(p){ return p.f; }), b, { onProgress: function(o){ if(ici()) progres(o.fait, o.total, o.nom, o.i, o.n); } })
      .then(function(r){
        progres(null);
        var partis=r.envoyes.map(function(x){ return fx[x.i]; }), rates=[];
        r.echecs.forEach(function(e){ var p=fx[e.i]; if(p){ p.echec=e.raison; rates.push(p); } });
        var dit=r.echecs.length ? '⚠ '+r.echecs.length+' fichier'+(r.echecs.length>1?'s pas partis':' pas parti')+' : '+r.echecs.map(function(e){ return e.nom+' ('+e.raison+')'; }).join(' · ') : '';
        if(r.messages.length && p0 && payload===p0){ p0.tsoin=null; p0.mediaUrl=null; p0.text=''; p0.fichiers=null; }
        if(ici()){
          pendingFichiers=pendingFichiers.filter(function(p){ return partis.indexOf(p)<0; });
          rates.forEach(function(p){ if(pendingFichiers.indexOf(p)<0) pendingFichiers.push(p); });   // le fil rouvert pendant l'envoi : ils reviennent
          if(r.messages.length && textIn.value===tape) textIn.value='';   // ce qu'on a tapé PENDANT l'envoi reste
          renderAtt(); if(r.messages.length) loadMsgs();
          dire(dit);
        } else {
          var cle=cleFil(t0), l=restes[cle]||[];
          // même fil, feuille fermée : tout ce qui reste de sa liste (ratés compris) revient à son prochain openConv
          if(target && cleFil(target)===cle) pendingFichiers.forEach(function(p){ if(partis.indexOf(p)<0 && l.indexOf(p)<0) l.push(p); });
          rates.forEach(function(p){ if(l.indexOf(p)<0) l.push(p); });
          if(l.length) restes[cle]=l;
          if(dit) avertir(dit+' → '+(t0.name||'ton ami')+' (ils t\'attendent dans son fil)');
        }
      }, function(){ progres(null); if(ici()) dire('⚠ envoi impossible (réseau ?)'); else avertir('⚠ envoi impossible vers '+(t0.name||'ton ami')+' (réseau ?)'); });
  }
  function send(){ if(!target||!target.channel) return;
    // (relecture adverse) un envoi à la fois : Entrée pendant un téléversement relançait send() et renvoyait les MÊMES fichiers
    // (doublons chez l'ami, quota mangé deux fois) — le ➤ était grisé, pas la touche Entrée
    if(ov.querySelector('[data-sh-send]').disabled) return;
    var g=G(), enc = gpgOn && g && g.state().hasKey, fprs = enc ? pickedFprs() : [];
    if(enc && !fprs.length){ alert('Choisis au moins un destinataire (sa clé GPG) — ou importe-la dans le trousseau.'); return; }
    // les pièces jointes des DM partent EN CLAIR (comme le texte des DM) : jamais sous un 🔒 qui ferait croire le contraire. UNE seule
    // image / vidéo sous 🔒 garde l'ancien chemin chiffré (/share-media, marqueur ⟦enc:…⟧ dans le texte chiffré).
    var fx = modeFichiers() ? pendingFichiers.filter(function(p){ return !p.err; }) : [];
    if(fx.length && enc){
      if(fx.length===1 && pendingFichiers.length===1 && /^(image|video)\//.test(fx[0].f.type||'')){ pendingFile=fx[0].f; pendingFichiers=[]; fx=[]; renderAtt(); }
      else { dire('🔒 chiffré : les pièces jointes des DM partent en clair — coupe 🔒 pour les joindre (seule une image ou une vidéo seule part chiffrée)'); return; }
    }
    var sendBtn=ov.querySelector('[data-sh-send]'); sendBtn.disabled=true; dire('');
    uploadMedia(enc, fprs).then(function(frag){
      var parts=[]; if(textIn.value.trim()) parts.push(textIn.value.trim());
      if(payload&&payload.tsoin) parts.push('⦿ tsoin « '+(payload.tsoin.label||'')+' » ('+(payload.tsoin.events?payload.tsoin.events.length:0)+' actions)');
      if(payload&&payload.mediaUrl) parts.push(payload.mediaUrl);
      if(frag) parts.push(frag);
      var clear=parts.join('\n');
      if(fx.length) return envoyerAvecFichiers(clear, fx).then(function(){ sendBtn.disabled=false; });
      if(!clear.trim()){ sendBtn.disabled=false; if(pendingFichiers.length) dire('rien à envoyer : retire les fichiers en ⚠'); return; }
      (enc ? g.encryptTo(clear, fprs) : Promise.resolve(clear)).then(function(b){
        b=String(b).slice(0,9900);
        (isDmLocal() ? S().sendDm(target.id, b) : sapi('POST','/channels/'+target.channel+'/messages',{body:b})).then(function(){
          textIn.value=''; pendingFile=null; if(payload){payload.tsoin=null;payload.mediaUrl=null;payload.text='';} renderAtt(); sendBtn.disabled=false; loadMsgs();
        }).catch(function(){ sendBtn.disabled=false; });
      }).catch(function(){ sendBtn.disabled=false; alert('Chiffrement impossible (clé verrouillée ?).'); });
    }).catch(function(){ sendBtn.disabled=false; alert('Upload du média impossible.'); });
  }

  ov.querySelector('[data-sh-send]').onclick=send;
  textIn.onkeydown=function(e){ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); send(); } };
  ov.querySelector('[data-sh-close]').onclick=close;
  backBtn.onclick=function(){ target=null; backBtn.hidden=true; titleEl.textContent='Envoyer à…'; compose.hidden=true; pendingFichiers=[]; dire(''); progres(null); renderAtt(); pickTarget(); };
  ov.addEventListener('click', function(e){ if(e.target===ov) close(); });

  // envoi DIRECT (programmatique) sans ouvrir la feuille de choix
  function to(t, p){ payload=p||null; openConv(t); ov.hidden=false; }
  window.jOSShare = { open:open, close:close, to:to };
})();
;
