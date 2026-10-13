/* ploxion minuteur — app à la demande (/px/minuteur/app.js, format 2, 1 script) */
void 0;
(function(){try{if(document.querySelector('style[data-px-css="'+"minuteur"+'"]'))return;var s=document.createElement('style');s.setAttribute('data-px-css',"minuteur");s.textContent="\n    .pmin{display:flex;flex-direction:column;height:100%;align-items:center;justify-content:center;gap:16px;background:radial-gradient(circle at 50% 35%,#08120e,#04060a);color:#dffbe9;font-family:ui-sans-serif,system-ui,sans-serif}\n    .pmin__tab{display:flex;gap:6px;font-size:.78rem;flex-wrap:wrap;justify-content:center}\n    .pmin__tab button{cursor:pointer;padding:4px 12px;border-radius:14px;border:1px solid rgba(0,255,159,.25);background:none;color:rgba(180,210,200,.7)}\n    .pmin__tab button.on{background:rgba(0,255,159,.15);color:#fff;border-color:rgba(0,255,159,.5)}\n    .pmin__phase{font-size:.82rem;letter-spacing:.05em;text-transform:uppercase;color:rgba(120,230,180,.85);min-height:1em}\n    .pmin.is-break .pmin__phase{color:rgba(130,190,255,.9)}\n    .pmin__t{font-family:'Share Tech Mono',ui-monospace,monospace;font-size:3.1rem;color:#fff;text-shadow:0 0 18px rgba(0,255,159,.4)}\n    .pmin.is-break .pmin__t{text-shadow:0 0 18px rgba(120,180,255,.45)}\n    .pmin.is-done .pmin__t{color:#ff8c82;animation:pminblink .5s steps(2) infinite}\n    @keyframes pminblink{50%{opacity:.3}}\n    .pmin__row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}\n    .pmin__b{cursor:pointer;padding:9px 18px;border-radius:22px;border:1px solid rgba(0,255,159,.45);background:rgba(0,255,159,.1);color:rgba(0,255,159,.95);font-size:.9rem;font-weight:600}\n    .pmin__b:hover{background:rgba(0,255,159,.18);color:#fff}\n    .pmin__preset{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}\n    .pmin__preset button{cursor:pointer;padding:4px 11px;border-radius:14px;border:1px solid rgba(0,255,159,.25);background:rgba(0,255,159,.05);color:rgba(200,235,220,.85);font-size:.76rem;font-family:ui-monospace,monospace}\n    .pmin__preset button:hover{background:rgba(0,255,159,.16);color:#fff}\n    .pmin__cd{display:flex;gap:6px;align-items:center;font-size:.82rem;color:rgba(180,210,200,.7)}\n    .pmin__cd input{width:46px;background:rgba(0,255,159,.06);border:1px solid rgba(0,255,159,.3);color:#dffbe9;border-radius:6px;padding:4px;text-align:center;font-family:inherit}\n    .pmin__cyc{font-size:.74rem;color:rgba(180,210,200,.6);font-family:ui-monospace,monospace;min-height:1em}\n";var a=document.getElementById('px-apps-css');if(a&&a.parentNode)a.parentNode.insertBefore(s,a.nextSibling);else document.head.appendChild(s);}catch(e){}})();

/* script 1/1 */

(function(){
    'use strict';
    var ID='minuteur';
    var LIVE=null; // posé au mount : { disp, running, mode }
    function describe(){
        if(!LIVE) return { v:1, id:ID, title:'Minuteur', icon:'⏱', items:[{ p:1, kind:'text', label:'minuteur', value:'chrono/compte à rebours/pomodoro' }] };
        var running=LIVE.running(), mode=LIVE.mode();
        return { v:1, id:ID, title:'Minuteur', icon:'⏱', items:[
            { p:1, kind:'stat', label:(running?'▶ ':'⏸ ')+mode, value:LIVE.disp() },
            { p:2, kind:'action', label:running?'pause':'start', act:{ port:'ploxion.minuteur.cmd', payload:{ cmd:'toggle' } } }
        ] };
    }
    function mount(container){
        container.innerHTML='<div class="pmin" data-root>'
            +'<div class="pmin__tab"><button data-mode="chrono" class="on">Chrono</button><button data-mode="cd">Compte à rebours</button><button data-mode="pomo">Pomodoro</button></div>'
            +'<div class="pmin__phase" data-phase></div>'
            +'<div class="pmin__t" data-disp>00:00.00</div>'
            +'<div class="pmin__cd" data-cdset style="display:none"><input data-min type="number" min="0" value="5"> min <input data-sec type="number" min="0" max="59" value="0"> s</div>'
            +'<div class="pmin__preset" data-preset style="display:none"><button data-p="1">1 min</button><button data-p="3">3</button><button data-p="5">5</button><button data-p="10">10</button><button data-p="15">15</button><button data-p="25">25</button></div>'
            +'<div class="pmin__cd" data-pomoset style="display:none">travail <input data-work type="number" min="1" value="25"> min · pause <input data-rest type="number" min="1" value="5"> min</div>'
            +'<div class="pmin__row"><button class="pmin__b" data-go>▶ start</button><button class="pmin__b" data-reset>⟲ reset</button></div>'
            +'<div class="pmin__cyc" data-cyc></div></div>';
        var root=container.querySelector('[data-root]'), disp=container.querySelector('[data-disp]'), goB=container.querySelector('[data-go]');
        var cdset=container.querySelector('[data-cdset]'), preset=container.querySelector('[data-preset]'), pomoset=container.querySelector('[data-pomoset]');
        var phaseEl=container.querySelector('[data-phase]'), cycEl=container.querySelector('[data-cyc]');
        var mode='chrono', running=false, t0=0, acc=0, raf=0, target=0, ac=null, pomoPhase='work', cycles=0;
        function fmt(ms){ ms=Math.max(0,ms); var cs=Math.floor(ms/10)%100, s=Math.floor(ms/1000)%60, m=Math.floor(ms/60000); return (m<10?'0':'')+m+':'+(s<10?'0':'')+s+'.'+(cs<10?'0':'')+cs; }
        function fmtm(ms){ ms=Math.max(0,ms); var s=Math.floor(ms/1000)%60, m=Math.floor(ms/60000); return (m<10?'0':'')+m+':'+(s<10?'0':'')+s; }
        function beep(n){ try{ ac=ac||new (window.AudioContext||window.webkitAudioContext)(); for(var i=0;i<(n||1);i++){ var o=ac.createOscillator(),g=ac.createGain(); o.frequency.value=880; o.connect(g); g.connect(ac.destination); var t=ac.currentTime+i*0.22; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.25,t+0.02); g.gain.exponentialRampToValueAtTime(.0001,t+0.18); o.start(t); o.stop(t+0.2);} }catch(e){} }
        function pomoDur(){ return ((pomoPhase==='work'?(+container.querySelector('[data-work]').value||25):(+container.querySelector('[data-rest]').value||5)))*60000; }
        function loop(){ var el=acc+(running?(performance.now()-t0):0);
            if(mode==='chrono'){ disp.textContent=fmt(el); }
            else if(mode==='cd'){ var left=target-el; disp.textContent=fmtm(left)+'.'+('0'+(Math.floor(left/10)%100)).slice(-2); if(left<=0){ stop(); root.classList.add('is-done'); disp.textContent='00:00.00'; beep(3); return; } }
            else { var l=pomoDur()-el; disp.textContent=fmtm(l); if(l<=0){
                beep(pomoPhase==='work'?3:2);
                if(pomoPhase==='work'){ cycles++; pomoPhase='rest'; root.classList.add('is-break'); } else { pomoPhase='work'; root.classList.remove('is-break'); }
                phaseEl.textContent=pomoPhase==='work'?'● travail':'☕ pause'; cycEl.textContent='cycles complétés : '+cycles;
                acc=0; t0=performance.now(); } }
            raf=requestAnimationFrame(loop); }
        function start(){ if(running)return;
            if(mode==='cd'&&acc===0){ target=((+container.querySelector('[data-min]').value||0)*60+(+container.querySelector('[data-sec]').value||0))*1000; if(target<=0)return; }
            if(mode==='pomo'){ phaseEl.textContent=pomoPhase==='work'?'● travail':'☕ pause'; }
            root.classList.remove('is-done'); running=true; t0=performance.now(); goB.textContent='⏸ pause'; loop(); }
        function stop(){ if(!running)return; acc+=performance.now()-t0; running=false; if(raf)cancelAnimationFrame(raf),raf=0; goB.textContent='▶ start'; }
        function reset(){ stop(); acc=0; pomoPhase='work'; cycles=0; root.classList.remove('is-done','is-break'); cycEl.textContent=''; phaseEl.textContent=mode==='pomo'?'● travail':'';
            disp.textContent= mode==='cd'?fmtm(((+container.querySelector('[data-min]').value||0)*60+(+container.querySelector('[data-sec]').value||0))*1000)+'.00' : mode==='pomo'?fmtm(pomoDur()):'00:00.00'; }
        function setMode(m){ mode=m; root.querySelectorAll('[data-mode]').forEach(function(x){x.classList.toggle('on',x.getAttribute('data-mode')===m);});
            cdset.style.display=m==='cd'?'flex':'none'; preset.style.display=m==='cd'?'flex':'none'; pomoset.style.display=m==='pomo'?'flex':'none'; reset(); }
        goB.addEventListener('click',function(){ running?stop():start(); });
        container.querySelector('[data-reset]').addEventListener('click',reset);
        root.querySelectorAll('[data-mode]').forEach(function(b){ b.addEventListener('click',function(){ setMode(b.getAttribute('data-mode')); }); });
        preset.addEventListener('click',function(e){ var b=e.target.closest('[data-p]'); if(!b)return; container.querySelector('[data-min]').value=b.getAttribute('data-p'); container.querySelector('[data-sec]').value=0; reset(); start(); });
        /* ── PORTS BUS (jOSPorts) ── in `duree` ← ex. convertisseur.result (via jOSWire) :
           une durée reçue (payload.seconds, ou {min,sec}, ou nombre = secondes) arme le
           compte à rebours comme un preset. Best-effort, jamais bloquant. */
        var portOffs=[];
        function onDuree(p){ try{
            var secs=null;
            if(typeof p==='number') secs=p;
            else if(p&&typeof p==='object'){
                if(typeof p.seconds==='number') secs=p.seconds;
                else if(typeof p.min==='number'||typeof p.sec==='number') secs=(+p.min||0)*60+(+p.sec||0);
            }
            if(secs===null||!isFinite(secs)) return;
            secs=Math.round(secs); if(secs<=0) return;
            setMode('cd');
            container.querySelector('[data-min]').value=Math.floor(secs/60);
            container.querySelector('[data-sec]').value=secs%60;
            reset(); start();
        }catch(e){} }
        if(window.jOSPorts&&window.jOSPorts.on){ try{ portOffs.push(window.jOSPorts.on('ploxion.minuteur.duree',onDuree)); }catch(e){} }
        if(window.jOSPorts&&window.jOSPorts.on){ try{ portOffs.push(window.jOSPorts.on('ploxion.minuteur.cmd',function(p){
            var cmd=p&&p.cmd; if(cmd==='toggle'){ running?stop():start(); } else if(cmd==='start') start(); else if(cmd==='stop') stop(); else if(cmd==='reset') reset();
        })); }catch(e){} }
        LIVE={ disp:function(){return disp.textContent;}, running:function(){return running;}, mode:function(){return mode;} };
        return { unmount:function(){ LIVE=null; if(raf)cancelAnimationFrame(raf); if(ac){try{ac.close();}catch(e){}} portOffs.forEach(function(f){ try{ f&&f(); }catch(e){} }); portOffs=[]; container.innerHTML=''; } };
    }
    window.jOSApps=window.jOSApps||{};
    window.jOSApps[ID]={manifest:{id:ID,name:'Minuteur',icon:'⏱'},mount:mount,describe:describe};
})();
;

try{window.dispatchEvent(new CustomEvent('xb:app:registered',{detail:{id:"minuteur"}}));}catch(e){}
