
(function(){
    'use strict';
    var ID='horloge';
    var CITIES=[['Lausanne','Europe/Zurich'],['Paris','Europe/Paris'],['Londres','Europe/London'],['Lima','America/Lima'],['New York','America/New_York'],['Los Angeles','America/Los_Angeles'],['São Paulo','America/Sao_Paulo'],['UTC','UTC'],['Le Caire','Africa/Cairo'],['Dubaï','Asia/Dubai'],['Bombay','Asia/Kolkata'],['Pékin','Asia/Shanghai'],['Tokyo','Asia/Tokyo'],['Sydney','Australia/Sydney'],['Auckland','Pacific/Auckland']];
    var DEFAULT=[['Lausanne','Europe/Zurich'],['Lima','America/Lima'],['UTC','UTC'],['Tokyo','Asia/Tokyo']];
    function load(){ try{ var z=JSON.parse(localStorage.getItem('xb:horloge')); if(z&&z.length)return z; }catch(e){} return DEFAULT.slice(); }
    function save(z){ try{ localStorage.setItem('xb:horloge',JSON.stringify(z)); }catch(e){} }
    // heure de base du xerboxion = UTC, en heures-only par défaut (RS-7 : « juste les heures »).
    function loadUtcMode(){ try{ var m=localStorage.getItem('xb:horloge:utc'); if(m==='hm')return 'hm'; }catch(e){} return 'h'; }
    function saveUtcMode(m){ try{ localStorage.setItem('xb:horloge:utc',m); }catch(e){} }
    function pad2(n){ return (n<10?'0':'')+n; }

    function describe(){
        var d=new Date();
        var hh=pad2(d.getHours()), mm=pad2(d.getMinutes());
        return { v:1, id:ID, title:'Horloge', icon:'🕐', items:[
            { p:1, kind:'stat', label:'heure locale', value:hh+':'+mm }
        ] };
    }
    function mount(container){
        var local=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
        var zones=load();
        var utcMode=loadUtcMode();
        container.innerHTML='<div class="phor">'
            +'<div class="phor__utc"><div class="phor__utcv" data-utc>--</div>'
            +'<div class="phor__utcl"><span>UTC — heure de base du xerboxion</span><button class="phor__utcm" data-utcmode title="basculer heures / heures:minutes"></button></div></div>'
            +'<div class="phor__big">'
            +'<svg class="phor__face" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" stroke-width="2"/>'
            +'<line data-h x1="50" y1="50" x2="50" y2="28" stroke="#dffbe9" stroke-width="3" stroke-linecap="round"/>'
            +'<line data-m x1="50" y1="50" x2="50" y2="16" stroke="rgba(0,255,159,.9)" stroke-width="2" stroke-linecap="round"/>'
            +'<line data-s x1="50" y1="50" x2="50" y2="12" stroke="#ff8c82" stroke-width="1" stroke-linecap="round"/>'
            +'<circle cx="50" cy="50" r="2.5" fill="#dffbe9" stroke="none"/></svg>'
            +'<div class="phor__txt"><div class="phor__time" data-big>--:--:--</div><div class="phor__date" data-bigd></div><div class="phor__loc">⏱ '+local+'</div></div></div>'
            +'<div class="phor__add"><select data-city></select><button data-addz>+ ville</button></div>'
            +'<div class="phor__zones" data-zones></div></div>';
        var big=container.querySelector('[data-big]'), bigd=container.querySelector('[data-bigd]'), zonesEl=container.querySelector('[data-zones]');
        var hH=container.querySelector('[data-h]'), hM=container.querySelector('[data-m]'), hS=container.querySelector('[data-s]');
        var citySel=container.querySelector('[data-city]');
        var utcEl=container.querySelector('[data-utc]'), utcBtn=container.querySelector('[data-utcmode]');
        function renderUtc(){
            var d=new Date();
            utcEl.textContent = utcMode==='hm' ? pad2(d.getUTCHours())+':'+pad2(d.getUTCMinutes()) : pad2(d.getUTCHours());
            utcBtn.textContent = utcMode==='hm' ? 'HH:MM' : 'HH';
        }
        utcBtn.addEventListener('click',function(){ utcMode = utcMode==='hm' ? 'h' : 'hm'; saveUtcMode(utcMode); renderUtc(); });
        citySel.innerHTML=CITIES.map(function(c){ return '<option value="'+c[1]+'">'+c[0]+'</option>'; }).join('');
        function fmt(tz,opt){ try{ return new Intl.DateTimeFormat('fr-FR',Object.assign({timeZone:tz},opt)).format(new Date()); }catch(e){ return '—'; } }
        function renderZones(){
            zonesEl.innerHTML=zones.map(function(o,i){ return '<div class="phor__z"><span class="phor__zn">'+o[0]+'</span><span class="phor__zt" data-zt="'+i+'">--:--:--</span> <span class="phor__zd" data-zd="'+i+'"></span><button class="phor__x" data-rmz="'+i+'" title="retirer">✕</button></div>'; }).join('')||'<div class="phor__zd" style="text-align:center">ajoute une ville ↑</div>';
        }
        function tick(){
            var now=new Date();
            renderUtc();
            big.textContent=fmt(local,{hour:'2-digit',minute:'2-digit',second:'2-digit'});
            bigd.textContent=fmt(local,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
            var h=now.getHours()%12,m=now.getMinutes(),s=now.getSeconds();
            hS.setAttribute('transform','rotate('+(s*6)+' 50 50)');
            hM.setAttribute('transform','rotate('+((m+s/60)*6)+' 50 50)');
            hH.setAttribute('transform','rotate('+((h+m/60)*30)+' 50 50)');
            zones.forEach(function(o,i){ var t=zonesEl.querySelector('[data-zt="'+i+'"]'), d=zonesEl.querySelector('[data-zd="'+i+'"]');
                if(t)t.textContent=fmt(o[1],{hour:'2-digit',minute:'2-digit',second:'2-digit'}); if(d)d.textContent=fmt(o[1],{weekday:'short',day:'numeric',month:'short'}); });
        }
        container.querySelector('[data-addz]').addEventListener('click',function(){ var tz=citySel.value, nm=(CITIES.filter(function(c){return c[1]===tz;})[0]||['',tz])[0];
            if(!zones.some(function(z){return z[1]===tz;})){ zones.push([nm,tz]); save(zones); renderZones(); tick(); } });
        zonesEl.addEventListener('click',function(e){ var b=e.target.closest('[data-rmz]'); if(!b)return; zones.splice(+b.getAttribute('data-rmz'),1); save(zones); renderZones(); tick(); });
        renderZones(); tick(); var iv=setInterval(tick,1000);
        return { unmount:function(){ clearInterval(iv); container.innerHTML=''; } };
    }
    window.jOSApps=window.jOSApps||{};
    window.jOSApps[ID]={manifest:{id:ID,name:'Horloge',icon:'🕐'},mount:mount,describe:describe};
})();
