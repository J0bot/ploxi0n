
(function () {
    'use strict';
    var ID='bother';
    function esc(s){return window.jOSb&&window.jOSb.esc?window.jOSb.esc(s):(function(x){var d=document.createElement('div');d.textContent=x==null?'':x;return d.innerHTML;})(s);}
    function CSRF(){ var m=document.querySelector('meta[name="csrf-token"]'); return m?m.getAttribute('content'):''; }
    function isAdmin(){ var m=document.querySelector('meta[name="user-admin"]'); return m&&m.getAttribute('content')==='1'; }
    function post(url,body){ return fetch(url,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-TOKEN':CSRF(),'Accept':'application/json'},credentials:'same-origin',body:JSON.stringify(body||{})}).then(function(r){return r.json();}); }
    function get(url){ return fetch(url,{headers:{'Accept':'application/json'},credentials:'same-origin'}).then(function(r){return r.ok?r.json():null;}); }
    // redimensionne une image (file/blob) -> dataURL (max côté), pour rester léger
    function imgToData(file,max){ return new Promise(function(res,rej){ var fr=new FileReader(); fr.onload=function(){ var im=new Image(); im.onload=function(){ var w=im.width,h=im.height,m=max||1280; if(w>m||h>m){ var s=Math.min(m/w,m/h); w=Math.round(w*s); h=Math.round(h*s); } var cv=document.createElement('canvas'); cv.width=w; cv.height=h; cv.getContext('2d').drawImage(im,0,0,w,h); res(cv.toDataURL('image/jpeg',0.82)); }; im.onerror=rej; im.src=fr.result; }; fr.onerror=rej; fr.readAsDataURL(file); }); }
    function mine(){ try{ return JSON.parse(localStorage.getItem('jos:bother:mine')||'[]'); }catch(e){ return []; } }
    function addMine(t,kind){ try{ var a=mine(); a.unshift({token:t,kind:kind,at:Date.now()}); localStorage.setItem('jos:bother:mine',JSON.stringify(a.slice(0,40))); }catch(e){} }

    function describe(){
        var a = mine();
        return { v:1, id:ID, title:'Bother me', icon:'🗯', items:[
          { p:1, kind:'stat', label:'tickets envoyés', value:a.length }
        ]};
    }
    function mount(container, ctx){
        var G=window.jOSGpg, priv=null, kind='idee', imgData=null;
        container.innerHTML=
            '<div class="bo"><div class="bo__bar"><span class="bo__t">🗯 Bother me</span><span class="bo__sp"></span>'
          + '<button class="bo__tab on" data-tab="send">envoyer</button>'
          + (isAdmin()?'<button class="bo__tab" data-tab="inbox">📥 inbox</button>':'<button class="bo__tab" data-tab="mine">mes envois</button>')
          + '</div><div class="bo__body">'
          + '<div class="bo__pane on" data-pane="send"></div>'
          + '<div class="bo__pane" data-pane="'+(isAdmin()?'inbox':'mine')+'"></div>'
          + '</div></div>';
        var body=container.querySelector('.bo__body');
        container.querySelectorAll('[data-tab]').forEach(function(t){ t.onclick=function(){ container.querySelectorAll('[data-tab]').forEach(function(x){x.classList.toggle('on',x===t);}); var k=t.getAttribute('data-tab'); container.querySelectorAll('[data-pane]').forEach(function(p){p.classList.toggle('on',p.getAttribute('data-pane')===k);}); if(k==='inbox')loadInbox(); if(k==='mine')loadMine(); }; });

        // ---------- ENVOYER (tout le monde) ----------
        var sp=container.querySelector('[data-pane="send"]');
        sp.innerHTML=
            '<div class="bo__msg">Balance ton <b>idée</b> ou ton <b>bug</b> à RS-7 — écris, ajoute une photo/capture, envoie. C\'est tout. (chiffré de bout en bout 🔒, t\'as rien à faire).</div>'
          + '<div class="bo__kinds"><div class="bo__k on" data-k="idee">💡 idée</div><div class="bo__k" data-k="bug">🐞 bug</div></div>'
          + '<textarea class="bo__ta" data-ta placeholder="dis ce que tu veux, balance et continue ta vie…"></textarea>'
          + '<div class="bo__row"><button class="bo__btn" data-file>📷 photo</button><button class="bo__btn" data-screen>🖥 capturer l\'écran</button><span data-att></span></div>'
          + '<input type="file" accept="image/*" data-fin style="display:none">'
          + '<button class="bo__btn bo__send" data-go>🗯 envoyer à RS-7</button>'
          + '<div class="bo__msg" data-status></div>';
        sp.querySelectorAll('[data-k]').forEach(function(k){ k.onclick=function(){ kind=k.getAttribute('data-k'); sp.querySelectorAll('[data-k]').forEach(function(x){x.classList.toggle('on',x===k);}); }; });
        // Pré-remplissage depuis le bion jOSBug (capteur d'erreurs global) : bug auto-capté -> prêt à envoyer.
        if (window.__botherPrefill){ var __pf=window.__botherPrefill; window.__botherPrefill=null;
            var __ta=sp.querySelector('[data-ta]'); if(__ta) __ta.value=__pf.text||'';
            if(__pf.kind==='bug'){ kind='bug'; sp.querySelectorAll('[data-k]').forEach(function(x){x.classList.toggle('on',x.getAttribute('data-k')==='bug');}); } }
        var fin=sp.querySelector('[data-fin]'), att=sp.querySelector('[data-att]'), st=sp.querySelector('[data-status]');
        function setImg(d){ imgData=d; att.innerHTML=d?'<img class="bo__thumb" src="'+d+'"> <span class="bo__ok">✓</span>':''; }
        sp.querySelector('[data-file]').onclick=function(){ fin.click(); };
        fin.onchange=function(){ var f=fin.files&&fin.files[0]; if(f) imgToData(f,1280).then(setImg).catch(function(){ st.textContent='image illisible'; }); };
        sp.querySelector('[data-screen]').onclick=function(){ if(!navigator.mediaDevices||!navigator.mediaDevices.getDisplayMedia){ st.textContent='capture écran indispo ici — utilise 📷'; return; }
            navigator.mediaDevices.getDisplayMedia({video:true}).then(function(s){ var v=document.createElement('video'); v.srcObject=s; v.play(); v.onloadedmetadata=function(){ setTimeout(function(){ var cv=document.createElement('canvas'); var w=v.videoWidth,h=v.videoHeight,m=1280; if(w>m||h>m){var sc=Math.min(m/w,m/h);w=Math.round(w*sc);h=Math.round(h*sc);} cv.width=w;cv.height=h; cv.getContext('2d').drawImage(v,0,0,w,h); s.getTracks().forEach(function(t){t.stop();}); setImg(cv.toDataURL('image/jpeg',0.82)); },250); }; }).catch(function(){ st.textContent='capture annulée'; }); };
        // coller une image
        container.addEventListener('paste',function(e){ var it=e.clipboardData&&e.clipboardData.items; if(!it)return; for(var i=0;i<it.length;i++){ if(it[i].type.indexOf('image')===0){ var f=it[i].getAsFile(); if(f) imgToData(f,1280).then(setImg); } } });
        sp.querySelector('[data-go]').onclick=function(){
            var msg=(sp.querySelector('[data-ta]').value||'').trim();
            if(!msg&&!imgData){ st.textContent='écris un truc ou ajoute une image'; return; }
            st.textContent='envoi…';
            get('/bother/pubkey').then(function(d){ var pub=d&&d.pubkey;
                if(!pub){ st.innerHTML='⚠ la boîte n\'est pas encore activée par RS-7.'; return; }
                var payload=JSON.stringify({ msg:msg, img:imgData||null, kind:kind, page:location.pathname+location.hash, ts:Date.now() });
                return G.ensureLib().then(function(pgp){ return pgp.readKey({armoredKey:pub}).then(function(key){ return pgp.createMessage({text:payload}).then(function(m){ return pgp.encrypt({message:m,encryptionKeys:[key]}); }); }); })
                    .then(function(cipher){ return post('/bother',{cipher:cipher,kind:kind,page:location.pathname}); })
                    .then(function(rr){ if(rr&&rr.ok){ addMine(rr.token,kind); sp.querySelector('[data-ta]').value=''; setImg(null); st.innerHTML='✅ envoyé à RS-7. Merci ! (tu peux suivre dans « mes envois »)'; } else st.textContent='échec d\'envoi'; });
            }).catch(function(){ st.textContent='échec (réseau / chiffrement)'; });
        };

        // ---------- MES ENVOIS (expéditeur) ----------
        function loadMine(){ var p=container.querySelector('[data-pane="mine"]'); var a=mine(); if(!a.length){ p.innerHTML='<div class="bo__msg">Tes envois apparaîtront ici, avec la réponse de RS-7.</div>'; return; }
            p.innerHTML='<div class="bo__msg">Tes envois :</div>'; a.forEach(function(it){ var card=document.createElement('div'); card.className='bo__card'; card.innerHTML='<div class="bo__meta">'+(it.kind==='bug'?'🐞 bug':'💡 idée')+' · '+new Date(it.at).toLocaleString('fr-FR')+'</div><div data-st class="bo__msg">…</div>'; p.appendChild(card);
                get('/bother/t/'+encodeURIComponent(it.token)).then(function(d){ var s=card.querySelector('[data-st]'); if(!d||!d.ok){ s.textContent='introuvable'; return; } s.innerHTML='statut : <b>'+esc(d.status)+'</b>'+(d.reply?('<br>réponse de RS-7 : '+esc(d.reply)):''); }); }); }

        // ---------- INBOX (admin) ----------
        function loadInbox(){ var p=container.querySelector('[data-pane="inbox"]');
            G.ensureLib().then(function(){ proceed(p); }).catch(function(){ p.innerHTML='<div class="bo__msg">OpenPGP indisponible (hors-ligne ?).</div>'; });
        }
        function proceed(p){
            var stored=null; try{ stored=localStorage.getItem('jos:bother:priv'); }catch(e){}
            if(!stored){ p.innerHTML='<div class="bo__msg"><b>Activer la boîte</b> : on génère ta clé (la privée reste sur cet appareil, le serveur ne voit que du chiffré). Choisis une phrase secrète.</div>'
                + '<input class="bo__in" data-pass type="password" placeholder="phrase secrète (à retenir)"><button class="bo__btn bo__send" data-init>🔑 activer ma boîte</button><div class="bo__msg" data-ist></div>';
                p.querySelector('[data-init]').onclick=function(){ var pass=p.querySelector('[data-pass]').value; if(pass.length<4){ p.querySelector('[data-ist]').textContent='phrase trop courte'; return; } p.querySelector('[data-ist]').textContent='génération…';
                    G.ensureLib().then(function(pgp){ return pgp.generateKey({type:'ecc',curve:'curve25519',userIDs:[{name:'bother me'}],passphrase:pass}); }).then(function(kp){
                        try{ localStorage.setItem('jos:bother:priv',kp.privateKey); }catch(e){}
                        return G.ensureLib().then(function(pgp){ return pgp.readKey({armoredKey:kp.publicKey}); }).then(function(k){ return post('/bother/pubkey',{pubkey:kp.publicKey,fpr:k.getFingerprint()}); });
                    }).then(function(){ loadInbox(); }).catch(function(e){ p.querySelector('[data-ist]').textContent='échec : '+(e&&e.message||''); }); };
                return; }
            if(!priv){ p.innerHTML='<div class="bo__msg">Déverrouille ta boîte pour lire les tickets.</div><input class="bo__in" data-pass type="password" placeholder="phrase secrète"><button class="bo__btn bo__send" data-unlock>déverrouiller</button><div class="bo__msg" data-ust></div>';
                p.querySelector('[data-unlock]').onclick=function(){ var pass=p.querySelector('[data-pass]').value;
                    G.ensureLib().then(function(pgp){ return pgp.readPrivateKey({armoredKey:stored}).then(function(pk){ return pgp.decryptKey({privateKey:pk,passphrase:pass}); }); })
                        .then(function(dec){ priv=dec; loadInbox(); }).catch(function(){ p.querySelector('[data-ust]').textContent='phrase incorrecte'; }); };
                return; }
            // déverrouillé → charge + déchiffre
            p.innerHTML='<div class="bo__row"><span class="bo__msg">🔓 boîte ouverte</span><span class="bo__sp"></span><button class="bo__btn" data-ref>↻</button></div><div data-list><div class="bo__msg">chargement…</div></div>';
            p.querySelector('[data-ref]').onclick=function(){ priv=priv; loadInbox(); };
            var list=p.querySelector('[data-list]');
            get('/bother/inbox').then(function(d){ var ts=(d&&d.data)||[]; if(!ts.length){ list.innerHTML='<div class="bo__msg">aucun ticket pour l\'instant.</div>'; return; } list.innerHTML='';
                ts.forEach(function(t){ var card=document.createElement('div'); card.className='bo__card'; card.innerHTML='<div class="bo__meta">#'+t.id+' · '+new Date(t.created_at).toLocaleString('fr-FR')+(t.page?(' · '+esc(t.page)):'')+' · '+esc(t.status)+'</div><div data-c class="bo__msg">déchiffrement…</div>'; list.appendChild(card);
                    G.ensureLib().then(function(pgp){ return pgp.readMessage({armoredMessage:t.cipher}).then(function(m){ return pgp.decrypt({message:m,decryptionKeys:priv}); }); })
                        .then(function(res){ var o={}; try{o=JSON.parse(res.data);}catch(e){o={msg:res.data};}
                            var c=card.querySelector('[data-c]'); c.innerHTML='<span class="bo__badge '+(o.kind==='bug'?'bug':'')+'">'+(o.kind==='bug'?'🐞 bug':'💡 idée')+'</span> '+esc(o.msg||'')+(o.img?('<br><img class="bo__thumb" style="max-width:100%;max-height:240px" src="'+esc(o.img)+'">'):'');
                            var rep=document.createElement('div'); rep.className='bo__row'; rep.innerHTML='<input class="bo__in" data-r style="flex:1" placeholder="répondre…" value="'+esc(t.reply||'')+'"><button class="bo__btn" data-sr>répondre</button>'; card.appendChild(rep);
                            rep.querySelector('[data-sr]').onclick=function(){ var v=rep.querySelector('[data-r]').value; post('/bother/'+t.id+'/reply',{reply:v,status:'answered'}).then(function(){ rep.querySelector('[data-sr]').textContent='✓'; }); };
                        }).catch(function(){ card.querySelector('[data-c]').textContent='✗ pas déchiffrable (autre clé ?)'; }); }); });
        }

        if(isAdmin()) {} // l'inbox se charge au clic de l'onglet
        return { unmount:function(){ priv=null; container.innerHTML=''; } };
    }
    window.jOSApps=window.jOSApps||{};
    window.jOSApps[ID]={ manifest:{ id:ID, name:'Bother me', icon:'🗯' }, mount: mount, describe: describe };
})();
