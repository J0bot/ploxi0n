/* bion jOSFiles — servi seul pour ploxi0n (/px/bion-app/jOSFiles.js) */
void 0;

;
(function () {
  "use strict";
  if (window.jOSFiles) return;
  function csrf(){ var m=document.querySelector('meta[name=csrf-token]'); return m?m.content:''; }
  function J(u,o){ return fetch(u,Object.assign({credentials:'same-origin',headers:{Accept:'application/json'}},o||{})); }
  function post(url, obj){ return J(url,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-TOKEN':csrf(),'X-Requested-With':'XMLHttpRequest',Accept:'application/json'},body:JSON.stringify(obj||{})}).then(function(r){return r.ok?r.json():null;}); }
  function esc(s){ return (s==null?'':String(s)).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function join(dir,name){ return (dir==='/'||dir==='')?('/'+name):(dir.replace(/\/$/,'')+'/'+name); }

  // ===== chemins & schémas =====
  var SCHEMAS=['fs','boxion','chaoxion','zone','local','xion','boxions','nexus','ios'];   // boxions: juste sous xion: (les miroirs vivent dans le dossier du xion)
  var META={ fs:{nom:'Mes fichiers',icone:'🗂'}, boxion:{nom:'Boxion',icone:'☁'}, chaoxion:{nom:'Chaoxion',icone:'🌀'}, zone:{nom:'Zones partagées',icone:'🤝'}, local:{nom:'Ce PC',icone:'💻'},
             xion:{nom:'Ce PC (xion)',icone:'🧿'}, boxions:{nom:'Miroirs (Ce PC)',icone:'🪞'}, nexus:{nom:'Nexus',icone:'🌐'}, ios:{nom:'iPhone',icone:'📱'} };
  // norm : chemin absolu propre (jamais de .. ni de segment vide) — pour les montages NON-fs seulement
  function norm(p){ var parts=String(p==null?'':p).replace(/\\/g,'/').split('/'), out=[]; for (var i=0;i<parts.length;i++){ var s=parts[i]; if(!s||s==='.') continue; if(s==='..'){ out.pop(); continue; } out.push(s); } return '/'+out.join('/'); }
  function baseOf(p){ return String(p||'').replace(/\/$/,'').split('/').pop()||''; }
  function dirOf(p){ var q=String(p||'').replace(/\/$/,''), i=q.lastIndexOf('/'); return i<=0?'/':q.slice(0,i); }
  // parse : « schema:/reste » → {schema, rest} ; un chemin sans schéma (ou fs:) = montage fs, reste INTACT (byte-identique)
  function parse(path){ var s=String(path==null?'':path), m=/^([a-z]+):(.*)$/i.exec(s);
    if (m){ var sc=m[1].toLowerCase(); if (sc==='fs') return {schema:'fs',rest:m[2]}; if (SCHEMAS.indexOf(sc)>=0) return {schema:sc,rest:norm(m[2])}; }
    return {schema:'fs',rest:s}; }
  function full(schema,rest){ return schema==='fs'?rest:(schema+':'+rest); }
  var MIMES={json:'application/json',txt:'text/plain',md:'text/markdown',html:'text/html',htm:'text/html',css:'text/css',js:'text/javascript',csv:'text/csv',xml:'application/xml',
    png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',svg:'image/svg+xml',avif:'image/avif',pdf:'application/pdf',zip:'application/zip',
    mp3:'audio/mpeg',wav:'audio/wav',ogg:'audio/ogg',m4a:'audio/mp4',mp4:'video/mp4',webm:'video/webm',mov:'video/quicktime',stl:'model/stl',obj:'model/obj',gltf:'model/gltf+json',glb:'model/gltf-binary',scad:'text/plain',wasm:'application/wasm'};
  function mimeOf(name){ var e=(String(name||'').split('.').pop()||'').toLowerCase(); return MIMES[e]||'application/octet-stream'; }
  function isBlob(d){ return (typeof Blob!=='undefined' && d instanceof Blob) || (typeof File!=='undefined' && d instanceof File); }
  function toBlob(data,name){ if (isBlob(data)) return data; if (typeof data==='string'){ var t=mimeOf(name); return new Blob([data],{type:t==='application/octet-stream'?'text/plain':t}); } return new Blob([JSON.stringify(data)],{type:'application/json'}); }
  function blobText(b){ if (b && typeof b.text==='function') return b.text(); return new Promise(function(res,rej){ try { var fr=new FileReader(); fr.onload=function(){ res(String(fr.result||'')); }; fr.onerror=function(){ rej(fr.error); }; fr.readAsText(b); } catch(e){ rej(e); } }); }
  function blobDataUrl(b){ return new Promise(function(res,rej){ try { var fr=new FileReader(); fr.onload=function(){ res(String(fr.result||'')); }; fr.onerror=function(){ rej(fr.error); }; fr.readAsDataURL(b); } catch(e){ rej(e); } }); }
  // respOf : une réponse « comme fetch » (ok/text/json/blob) autour d'un Blob — pour local:/ios: (pas de HTTP)
  function respOf(blob, ok, status){ ok=ok!==false; try { if (ok && typeof Response==='function') return new Response(blob,{status:200}); } catch(e){}
    return { ok:ok, status:status||(ok?200:404), headers:{get:function(){ return blob&&blob.type||''; }},
      blob:function(){ return Promise.resolve(blob); }, text:function(){ return blob?blobText(blob):Promise.resolve(''); },
      json:function(){ return blobText(blob).then(function(t){ return JSON.parse(t); }); }, arrayBuffer:function(){ return blob&&blob.arrayBuffer?blob.arrayBuffer():Promise.resolve(null); } }; }
  function NOK(){ return respOf(null,false,404); }
  function emit(schema,path,op,extra){ try { var d={schema:schema,path:path,op:op}; if (extra) Object.keys(extra).forEach(function(k){ d[k]=extra[k]; }); window.dispatchEvent(new CustomEvent('xb:fs:change',{detail:d})); } catch(e){} }
  function toast(m){ try { if (window.jOSToast){ if (typeof jOSToast==='function') return jOSToast(m); if (jOSToast.show) return jOSToast.show(m); } if (window.jOSBoxion && jOSBoxion.toast) jOSBoxion.toast(m); } catch(e){} }
  function online(){ return !(typeof navigator!=='undefined' && navigator.onLine===false); }
  function authed(){ try { if (window.jOSBoxion && jOSBoxion.authed) return !!jOSBoxion.authed(); } catch(e){} var m=document.querySelector('meta[name=user-authenticated]'); return !!(m && m.getAttribute('content')==='1'); }
  function dirEntry(schema,rest){ return {name:baseOf(rest),type:'dir',path:full(schema,rest),size:0,mtime:0,mime:''}; }

  // ===== montage fs — /fs/* du boxion courant : v1 TEL QUEL (byte-identique) =====
  // envoiSuivi : un POST dont on suit l'envoi (xhr.upload.onprogress) ; même contrat que J(…).then(r.json) : l'objet rendu, ou null
  function envoiSuivi(url, h, body, progres){ return new Promise(function(res){ try { var x=new XMLHttpRequest(); x.open('POST',url,true); x.withCredentials=true;
    Object.keys(h).forEach(function(k){ x.setRequestHeader(k,h[k]); });
    if (x.upload) x.upload.onprogress=function(e){ if (e && e.lengthComputable) { try { progres(e.loaded, e.total); } catch(er){} } };
    x.onload=function(){ var j=null; if (x.status>=200 && x.status<300){ try { j=JSON.parse(x.responseText||'null'); } catch(er){ j=null; } } res(j); };
    x.onerror=x.onabort=x.ontimeout=function(){ res(null); }; x.send(body); } catch(e){ res(null); } }); }
  var FS = {
    etat: function(){ if (!authed()) return 'absent'; return online()?'pret':'hors-ligne'; },
    caps: {read:true,write:true,mkdir:true,move:true,copy:true,stream:true},
    url: function(path){ return '/fs/read?path='+encodeURIComponent(path); },
    list: function(dir){ return J('/fs/list?dir='+encodeURIComponent(dir||'')).then(function(r){return r.ok?r.json():{dir:'/',entries:[]};}).catch(function(){return {dir:'/',entries:[]};}); },
    read: function(path){ return J(FS.url(path)); },
    write: function(path, data, o){ var h={'X-CSRF-TOKEN':csrf(),'X-Requested-With':'XMLHttpRequest',Accept:'application/json'}, body;
      if (data instanceof Blob || data instanceof File){ var fd=new FormData(); fd.append('path',path); fd.append('file',data,(path.split('/').pop()||'file')); body=fd; }
      else { h['Content-Type']='application/json'; body=JSON.stringify({path:path, content:(typeof data==='string'?data:JSON.stringify(data))}); }
      // (25.09) o.progres(fait, total) : la progression de l'envoi (l'anneau de l'icône qui naît sur le bureau) — seul XMLHttpRequest la
      // donne ; sans o.progres, la requête d'avant, byte-identique (fetch)
      if (o && typeof o.progres==='function' && typeof FormData!=='undefined' && body instanceof FormData && typeof XMLHttpRequest!=='undefined') return envoiSuivi('/fs/write',h,body,o.progres);
      return J('/fs/write',{method:'POST',headers:h,body:body}).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;}); },
    mkdir: function(path){ return post('/fs/mkdir',{path:path}); },
    del: function(path){ return post('/fs/delete',{path:path}); },
    move: function(from,to){ return post('/fs/move',{from:from,to:to}); },
    // stat (nouveau) : via /fs/list du parent ; l'entrée reste celle du serveur (mtime en SECONDES, historique) + mime déduit
    stat: function(path){ var p=norm(path), name=baseOf(p); if (!name) return Promise.resolve({name:'',type:'dir',path:'/',size:0,mtime:0,mime:''});
      return FS.list(dirOf(p)).then(function(d){ var e=(d.entries||[]).filter(function(x){ return x.name===name; })[0]||null; if (e && e.mime==null) e.mime=e.type==='dir'?'':mimeOf(e.name); return e; }); },
    objectUrl: function(path){ return Promise.resolve(FS.url(path)); }
  };

  // ===== montage chaoxion: — le DOSSIER PARTAGÉ des zions du xeroction (routes /chaoxion/* du boxion courant, même
  // contrat que /fs/* : credentials same-origin + X-CSRF ; entrées normalisées comme xion: → path chaoxion:/…, mtime ms,
  // mime). Réservé : <meta name="user-zion" content="1"> (User::isZion() côté serveur) sinon « absent » ; le serveur
  // refuse (403) toute écriture dans inbox/, approved/ et les segments « .xxx » (pont GPG du nexus + journal) =====
  function zion(){ var m=document.querySelector('meta[name=user-zion]'); return !!(m && m.getAttribute('content')==='1'); }
  var CHAOXION = (function(){ var schema='chaoxion';
    function u(route,q){ return '/chaoxion/'+route+(q?('?'+q):''); }
    function fix(e){ e=e||{}; var p=String(e.path||''); if (p.indexOf(schema+':')!==0) e.path=schema+':'+norm(p||('/'+(e.name||''))); if (e.mime==null) e.mime=e.type==='dir'?'':mimeOf(e.name||''); if (e.mtime>0 && e.mtime<1e11) e.mtime=e.mtime*1000; return e; }
    var D = {
      etat: function(){ if (!authed() || !zion()) return 'absent'; return online()?'pret':'hors-ligne'; },
      caps: {read:true,write:true,mkdir:true,move:true,copy:true,stream:true},
      list: function(rest){ return J(u('list','dir='+encodeURIComponent(rest))).then(function(r){ return r.ok?r.json():null; }).then(function(d){ d=d||{}; return {dir:schema+':'+norm(d.dir||rest),entries:(d.entries||[]).map(fix)}; }).catch(function(){ return {dir:schema+':'+rest,entries:[]}; }); },
      // stat : via list du parent (pas de route stat côté /chaoxion, comme /fs) ; racine = dossier
      stat: function(rest){ var p=norm(rest), name=baseOf(p); if (!name) return Promise.resolve(dirEntry(schema,'/')); return D.list(dirOf(p)).then(function(d){ return d.entries.filter(function(e){ return e.name===name; })[0]||null; }); },
      url: function(rest){ return u('read','path='+encodeURIComponent(rest)); },
      objectUrl: function(rest){ return Promise.resolve(u('read','path='+encodeURIComponent(rest))); },
      read: function(rest){ return J(u('read','path='+encodeURIComponent(rest))); },
      // write : texte → JSON {path,content} ; binaire → multipart path + file (mêmes en-têtes que FS.write)
      write: function(rest, blob, raw){ var h={'X-CSRF-TOKEN':csrf(),'X-Requested-With':'XMLHttpRequest',Accept:'application/json'}, body;
        if (typeof raw==='string'){ h['Content-Type']='application/json'; body=JSON.stringify({path:rest,content:raw}); }
        else { var fd=new FormData(); fd.append('path',rest); fd.append('file',blob,baseOf(rest)||'fichier'); body=fd; }
        return J(u('write'),{method:'POST',headers:h,body:body}).then(function(r){ return r.ok?r.json():null; }).then(function(d){ if (!d) return null; var mt=d.mtime||0; if (mt>0 && mt<1e11) mt=mt*1000; return {ok:true,path:schema+':'+rest,size:d.size!=null?d.size:blob.size,mtime:mt||Date.now()}; }).catch(function(){ return null; }); },
      mkdir: function(rest){ return post(u('mkdir'),{path:rest}); },
      del: function(rest){ return post(u('delete'),{path:rest}); },
      move: function(from,to){ return post(u('move'),{from:from,to:to}); }
    };
    return D; })();

  // ===== montage zone: — les DOSSIERS DES ZONES PARTAGÉES (08.10.2026, docs/dev/54-zones-partagees.md) : zone:/<id>/<chemin> ;
  // la racine liste les zones du compte qui ont le module « dossier » ; dessous, le contrat /fs (routes /px/zones/<id>/fs/*, garde
  // membre côté serveur : lecteur = lecture seule, 403 à l'écriture). Déplacer d'une zone à une autre = refusé (copier). =====
  var ZONE = (function(){ var schema='zone';
    function split(rest){ var p=norm(rest).replace(/^\/+/,''), i=p.indexOf('/'); return i<0?{id:p,sub:''}:{id:p.slice(0,i),sub:p.slice(i+1)}; }
    function u(id,route,q){ return '/px/zones/'+encodeURIComponent(id)+'/fs/'+route+(q?('?'+q):''); }
    function fix(id){ return function(e){ e=e||{}; var p=String(e.path||'/'+(e.name||'')); e.path=schema+':'+norm('/'+id+p); if (e.mime==null) e.mime=e.type==='dir'?'':mimeOf(e.name||''); if (e.mtime>0 && e.mtime<1e11) e.mtime=e.mtime*1000; return e; }; }
    var D = {
      etat: function(){ if (!authed()) return 'absent'; return online()?'pret':'hors-ligne'; },
      caps: {read:true,write:true,mkdir:true,move:true,copy:true,stream:true},
      list: function(rest){ var s=split(rest);
        if (!s.id) return J('/px/zones').then(function(r){ return r.ok?r.json():null; }).then(function(d){ d=d||{}; return {dir:schema+':/',entries:(d.zones||[]).filter(function(z){ return (z.modules||[]).indexOf('dossier')>=0; }).map(function(z){ return {name:(z.icone?z.icone+' ':'')+z.nom, type:'dir', path:schema+':/'+z.id, size:0, mtime:Date.parse(z.maj||'')||0, mime:'', zone:z.id, role:z.role}; })}; }).catch(function(){ return {dir:schema+':/',entries:[]}; });
        return J(u(s.id,'list','dir='+encodeURIComponent(s.sub))).then(function(r){ return r.ok?r.json():null; }).then(function(d){ d=d||{}; return {dir:schema+':'+norm('/'+s.id+'/'+s.sub),entries:(d.entries||[]).map(fix(s.id))}; }).catch(function(){ return {dir:schema+':'+norm(rest),entries:[]}; }); },
      stat: function(rest){ var p=norm(rest), name=baseOf(p); if (!name) return Promise.resolve(dirEntry(schema,'/')); return D.list(dirOf(p)).then(function(d){ return d.entries.filter(function(e){ return e.path===schema+':'+p || e.name===name; })[0]||null; }); },
      url: function(rest){ var s=split(rest); return u(s.id,'read','path='+encodeURIComponent(s.sub)); },
      objectUrl: function(rest){ return Promise.resolve(D.url(rest)); },
      read: function(rest){ return J(D.url(rest)); },
      write: function(rest, blob, raw){ var s=split(rest); if (!s.id || !s.sub) return Promise.resolve(null); var h={'X-CSRF-TOKEN':csrf(),'X-Requested-With':'XMLHttpRequest',Accept:'application/json'}, body;
        if (typeof raw==='string'){ h['Content-Type']='application/json'; body=JSON.stringify({path:s.sub,content:raw}); }
        else { var fd=new FormData(); fd.append('path',s.sub); fd.append('file',blob,baseOf(rest)||'fichier'); body=fd; }
        return J(u(s.id,'write'),{method:'POST',headers:h,body:body}).then(function(r){ return r.ok?r.json():null; }).then(function(d){ if (!d) return null; var mt=d.mtime||0; if (mt>0 && mt<1e11) mt=mt*1000; return {ok:true,path:schema+':'+norm(rest),size:d.size!=null?d.size:(blob&&blob.size),mtime:mt||Date.now()}; }).catch(function(){ return null; }); },
      mkdir: function(rest){ var s=split(rest); return s.id&&s.sub ? post(u(s.id,'mkdir'),{path:s.sub}) : Promise.resolve(null); },
      del: function(rest){ var s=split(rest); return s.id&&s.sub ? post(u(s.id,'delete'),{path:s.sub}) : Promise.resolve(null); },
      move: function(from,to){ var a=split(from), b=split(to); if (!a.id || a.id!==b.id || !a.sub || !b.sub) return Promise.resolve(null); return post(u(a.id,'move'),{from:a.sub,to:b.sub}); }
    };
    return D; })();

  // ===== montage boxion: — le silo plat /px/boxion/file* (jOSBoxion = backend) =====
  var bx={ idx:null, t:0, cats:{} };
  // bxIndex : jOSBoxion.listFiles() (backend, accepte l'index brut ET {items} depuis le 19.09) ; si vide, relecture directe
  // de /px/boxion/files (filet : un _boxion plus ancien qui ne lirait que `.items`)
  function bxH(h){ try { return window.jOSBoxion&&jOSBoxion.entetes?jOSBoxion.entetes(h||{}):(h||{}); } catch(e){ return h||{}; } }   
  function bxRaw(){ return fetch('/px/boxion/files',{credentials:'same-origin',headers:bxH({Accept:'application/json'})}).then(function(r){ return r.ok?r.json():null; }).then(function(d){ return Array.isArray(d)?d:((d&&d.items)||[]); }).catch(function(){ return []; }); }
  // bxUnique : le silo accepte plusieurs fichiers de MÊME nom dans une catégorie (ids différents) → le chemin
  // boxion:/<cat>/<nom> doit être unique (sélection, aperçu, suppression) : le plus ancien garde son nom, les
  // suivants deviennent « nom (2).ext », « nom (3).ext »… (numérotation stable : par date croissante).
  function bxUnique(items){ var vus={}, ordre=items.slice().sort(function(a,b){ return bxMtime(a)-bxMtime(b); });
    ordre.forEach(function(it){ var cat=bxCat(it), base=String(it.name||'fichier'), m=base.match(/^(.*?)(\.[^.\/]*)?$/), stem=m[1], ext=m[2]||'', nom=base, n=1;
      if (!vus[cat]) vus[cat]={}; while (vus[cat][nom]) { n++; nom=stem+' ('+n+')'+ext; } vus[cat][nom]=1; it.__nom=nom; });
    return items; }
  function bxNom(it){ return it.__nom||it.name; }
  function bxIndex(){ if (bx.idx && Date.now()-bx.t<4000) return Promise.resolve(bx.idx); if (!(window.jOSBoxion && jOSBoxion.listFiles) || !authed()) return Promise.resolve([]);
    return jOSBoxion.listFiles().then(function(items){ return (items && items.length)?items:bxRaw(); }).then(function(items){ bx.idx=bxUnique(items||[]); bx.t=Date.now(); return bx.idx; }).catch(function(){ return bx.idx||[]; }); }
  try { document.addEventListener('xb:boxion:files', function(){ bx.t=0; }); } catch(e){}
  function bxCat(it){ return it.category||'Sans catégorie'; }
  function bxSplit(rest){ var segs=rest.split('/').filter(Boolean); return {cat:segs[0]||'', name:segs.slice(1).join('/')}; }
  function bxMtime(it){ return it.savedAt?(Date.parse(it.savedAt)||0):0; }
  function bxEntry(it){ return {name:bxNom(it),type:'file',path:'boxion:/'+bxCat(it)+'/'+bxNom(it),size:it.size|0,mtime:bxMtime(it),mime:it.mime||mimeOf(it.name),id:it.id,categorie:bxCat(it)}; }
  function bxFind(items,cat,name){ for (var i=0;i<items.length;i++){ if (bxCat(items[i])===cat && bxNom(items[i])===name) return items[i]; } return null; }
  function bxRes(cat,name,item){ return {ok:true,path:'boxion:/'+cat+'/'+name,size:item.size|0,mtime:bxMtime(item)||Date.now(),id:item.id}; }
  var BOXION = {
    etat: function(){ if (!(window.jOSBoxion && jOSBoxion.uploadFile) || !authed()) return 'absent'; return online()?'pret':'hors-ligne'; },
    caps: {read:true,write:true,mkdir:true,move:true,copy:true,stream:true},
    list: function(rest){ var s=bxSplit(rest); return bxIndex().then(function(items){ var out=[], i;
      if (!s.cat){ var cats={}; for (i=0;i<items.length;i++){ var c=bxCat(items[i]); if (!cats[c]) cats[c]={n:0,m:0}; cats[c].n++; var m=bxMtime(items[i]); if (m>cats[c].m) cats[c].m=m; }
        Object.keys(bx.cats).forEach(function(k){ if (!cats[k]) cats[k]={n:0,m:0}; });
        Object.keys(cats).sort(function(a,b){ return a.localeCompare(b); }).forEach(function(c){ out.push({name:c,type:'dir',path:'boxion:/'+c,size:0,mtime:cats[c].m,mime:'',count:cats[c].n}); });
        return {dir:'boxion:/',entries:out}; }
      for (i=0;i<items.length;i++){ if (bxCat(items[i])===s.cat && (!s.name || bxNom(items[i]).indexOf(s.name+'/')===0)) out.push(bxEntry(items[i])); }
      return {dir:'boxion:'+rest,entries:out}; }); },
    stat: function(rest){ var s=bxSplit(rest); return bxIndex().then(function(items){ if (!s.cat) return dirEntry('boxion','/');
      if (!s.name){ var has=bx.cats[s.cat] || items.some(function(i){ return bxCat(i)===s.cat; }); return has?dirEntry('boxion','/'+s.cat):null; }
      var it=bxFind(items,s.cat,s.name); return it?bxEntry(it):null; }); },
    url: function(rest){ var s=bxSplit(rest), it=bx.idx?bxFind(bx.idx,s.cat,s.name):null; return it?jOSBoxion.fileUrl(it.id):''; },
    objectUrl: function(rest){ var s=bxSplit(rest); return bxIndex().then(function(items){ var it=bxFind(items,s.cat,s.name); return it?jOSBoxion.fileUrl(it.id):null; }); },
    read: function(rest){ var s=bxSplit(rest); return bxIndex().then(function(items){ var it=bxFind(items,s.cat,s.name); if (!it) return NOK(); return fetch(jOSBoxion.fileUrl(it.id),{credentials:'same-origin',headers:bxH()}); }); },
    // write = uploadFile (même catégorie + même nom déjà présent → l'ancien est supprimé après : sémantique « remplacer »)
    write: function(rest, blob){ var s=bxSplit(rest); if (!s.cat||!s.name) return Promise.resolve(null); var f; try { f=new File([blob],s.name,{type:blob.type||mimeOf(s.name)}); } catch(e){ f=blob; }
      return bxIndex().then(function(items){ var old=bxFind(items,s.cat,s.name);
        return jOSBoxion.uploadFile(f,s.cat,s.name).then(function(item){ if (!item) return null; bx.t=0;
          if (old && old.id!==item.id) return jOSBoxion.delFile(old.id).then(function(){ return bxRes(s.cat,s.name,item); });
          return bxRes(s.cat,s.name,item); }); }).catch(function(){ return null; }); },
    mkdir: function(rest){ var s=bxSplit(rest); if (!s.cat) return Promise.resolve(null); bx.cats[s.cat]=1; return Promise.resolve({ok:true,path:'boxion:/'+s.cat,implicite:true}); },
    del: function(rest){ var s=bxSplit(rest); if (!s.cat) return Promise.resolve(null); return bxIndex().then(function(items){
      var victimes=items.filter(function(i){ return bxCat(i)===s.cat && (!s.name || bxNom(i)===s.name); });
      if (!s.name) delete bx.cats[s.cat];
      if (!victimes.length) return s.name?null:{ok:true};
      return Promise.all(victimes.map(function(v){ return jOSBoxion.delFile(v.id); })).then(function(){ bx.t=0; return {ok:true}; }); }).catch(function(){ return null; }); },
    // move : même nom → recatégoriser (recatFile) ; autre nom → re-upload + suppression (le silo n'a pas de renommage)
    move: function(from,to){ var a=bxSplit(from), b=bxSplit(to); if (!a.cat||!a.name||!b.cat) return Promise.resolve(null); var name=b.name||a.name;
      return bxIndex().then(function(items){ var it=bxFind(items,a.cat,a.name); if (!it) return null;
        if (name===a.name && jOSBoxion.recatFile) return jOSBoxion.recatFile(it.id,b.cat).then(function(r){ bx.t=0; return (r&&r.ok)?{ok:true,path:'boxion:/'+b.cat+'/'+name}:null; });
        return fetch(jOSBoxion.fileUrl(it.id),{credentials:'same-origin',headers:bxH()}).then(function(r){ return r.ok?r.blob():null; }).then(function(blob){ if (!blob) return null;
          return BOXION.write('/'+b.cat+'/'+name,blob).then(function(res){ if (!res) return null; return jOSBoxion.delFile(it.id).then(function(){ bx.t=0; return res; }); }); }); }).catch(function(){ return null; }); }
  };

  // ===== montage local: — LE dossier xerboxion du disque (File System Access + IndexedDB) =====
  var lc={ handle:null, state:'absent', db:null };
  function idb(){ if (lc.db) return Promise.resolve(lc.db); return new Promise(function(res,rej){ try { if (!window.indexedDB) return rej(new Error('indexedDB absent'));
    var rq=indexedDB.open('xerboxion',1); rq.onupgradeneeded=function(){ try { rq.result.createObjectStore('handles'); } catch(e){} };
    rq.onsuccess=function(){ lc.db=rq.result; res(lc.db); }; rq.onerror=function(){ rej(rq.error); }; rq.onblocked=function(){ rej(new Error('bloqué')); }; } catch(e){ rej(e); } }); }
  function idbGet(key){ return idb().then(function(db){ return new Promise(function(res,rej){ var rq=db.transaction('handles','readonly').objectStore('handles').get(key); rq.onsuccess=function(){ res(rq.result||null); }; rq.onerror=function(){ rej(rq.error); }; }); }).catch(function(){ return null; }); }
  function idbSet(key,val){ return idb().then(function(db){ return new Promise(function(res,rej){ var tx=db.transaction('handles','readwrite'); tx.objectStore('handles').put(val,key); tx.oncomplete=function(){ res(true); }; tx.onerror=function(){ rej(tx.error); }; }); }).catch(function(){ return false; }); }
  function fsaOk(){ return typeof window.showDirectoryPicker==='function'; }
  function lcSet(state){ var was=lc.state; lc.state=state; if (was!==state) emit('local','local:/','mount'); }
  // boot : SEULEMENT queryPermission (requestPermission sans geste utilisateur = refusé par le navigateur)
  if (fsaOk() && window.indexedDB){ idbGet('local').then(function(h){ if (!h){ lcSet('absent'); return; } lc.handle=h;
      var q=h.queryPermission?h.queryPermission({mode:'readwrite'}):'prompt';
      return Promise.resolve(q).then(function(p){ lcSet(p==='granted'?'granted':'prompt'); }); }).catch(function(){ lcSet(lc.handle?'prompt':'absent'); }); }
  function lcConnect(){ if (!fsaOk()) return Promise.resolve(null);
    return window.showDirectoryPicker({id:'xerboxion',mode:'readwrite',startIn:'documents'}).then(function(h){ lc.handle=h; return idbSet('local',h).then(function(){ lcSet('granted'); return h; }); }).catch(function(){ return null; }); }
  function lcReconnect(){ if (!lc.handle) return lcConnect();
    var q; try { q=lc.handle.requestPermission?lc.handle.requestPermission({mode:'readwrite'}):'denied'; } catch(e){ q='denied'; }
    return Promise.resolve(q).then(function(p){ if (p==='granted'){ lcSet('granted'); return lc.handle; } return lcConnect(); }).catch(function(){ return lcConnect(); }); }
  function segsOf(rest){ return rest.split('/').filter(Boolean); }
  function lcDir(segs,create){ var h=lc.handle; if (!h) return Promise.reject(new Error('local absent')); var i=0;
    function step(cur){ if (i>=segs.length) return Promise.resolve(cur); var s=segs[i++]; return cur.getDirectoryHandle(s,{create:!!create}).then(step); } return step(h); }
  // itération d'un DirectoryHandle sans for-await (style du fichier : promesses)
  function iterate(dh,fn){ var it=dh.values?dh.values():dh.entries(); function step(){ return it.next().then(function(r){ if (r.done) return; var v=r.value; return Promise.resolve(fn(Array.isArray(v)?v[1]:v)).then(step); }); } return step(); }
  function lcEntry(h,parent){ var p=(parent==='/'?'':parent)+'/'+h.name;
    if (h.kind==='directory') return Promise.resolve({name:h.name,type:'dir',path:'local:'+p,size:0,mtime:0,mime:''});
    return h.getFile().then(function(f){ return {name:h.name,type:'file',path:'local:'+p,size:f.size,mtime:f.lastModified||0,mime:f.type||mimeOf(h.name)}; })
      .catch(function(){ return {name:h.name,type:'file',path:'local:'+p,size:0,mtime:0,mime:mimeOf(h.name)}; }); }
  function lcFile(rest){ var segs=segsOf(rest), name=segs.pop(); if (!name) return Promise.resolve(null);
    return lcDir(segs).then(function(d){ return d.getFileHandle(name); }).then(function(h){ return h.getFile(); }).catch(function(){ return null; }); }
  var LOCAL = {
    etat: function(){ if (!fsaOk()) return 'absent'; return lc.state==='granted'?'pret':(lc.handle?'a-reconnecter':'absent'); },
    caps: {read:true,write:true,mkdir:true,move:true,copy:true,stream:true},
    list: function(rest){ var out=[]; return lcDir(segsOf(rest)).then(function(d){ return iterate(d,function(h){ return lcEntry(h,rest).then(function(e){ out.push(e); }); }); })
      .then(function(){ out.sort(function(a,b){ return a.type===b.type?a.name.localeCompare(b.name):(a.type==='dir'?-1:1); }); return {dir:'local:'+rest,entries:out}; })
      .catch(function(){ return {dir:'local:'+rest,entries:[]}; }); },
    stat: function(rest){ var segs=segsOf(rest); if (!segs.length) return Promise.resolve(dirEntry('local','/')); var name=segs.pop();
      return lcDir(segs).then(function(d){ return d.getFileHandle(name).then(function(h){ return lcEntry(h,dirOf(rest)); }, function(){ return d.getDirectoryHandle(name).then(function(h){ return lcEntry(h,dirOf(rest)); }); }); }).catch(function(){ return null; }); },
    url: function(){ return ''; },
    objectUrl: function(rest){ return lcFile(rest).then(function(f){ return (f && URL.createObjectURL)?URL.createObjectURL(f):null; }); },
    read: function(rest){ return lcFile(rest).then(function(f){ return f?respOf(f):NOK(); }); },
    write: function(rest, blob){ var segs=segsOf(rest), name=segs.pop(); if (!name) return Promise.resolve(null);
      return lcDir(segs,true).then(function(d){ return d.getFileHandle(name,{create:true}); }).then(function(h){ return h.createWritable().then(function(w){ return w.write(blob).then(function(){ return w.close(); }); }); })
        .then(function(){ return {ok:true,path:'local:'+rest,size:blob.size,mtime:Date.now()}; }).catch(function(){ return null; }); },
    mkdir: function(rest){ return lcDir(segsOf(rest),true).then(function(){ return {ok:true,path:'local:'+rest}; }).catch(function(){ return null; }); },
    del: function(rest){ var segs=segsOf(rest), name=segs.pop(); if (!name) return Promise.resolve(null); return lcDir(segs).then(function(d){ return d.removeEntry(name,{recursive:true}); }).then(function(){ return {ok:true}; }).catch(function(){ return null; }); },
    move: function(from,to){ var a=segsOf(from), an=a.pop(), b=segsOf(to), bn=b.pop(); if (!an||!bn) return Promise.resolve(null);
      return lcDir(a).then(function(da){ return da.getFileHandle(an).then(function(h){ if (typeof h.move!=='function') return null;
          return lcDir(b,true).then(function(db){ return (a.join('/')===b.join('/'))?h.move(bn):h.move(db,bn); }).then(function(){ return {ok:true,path:'local:'+to}; }); }, function(){ return null; }); })
        .then(function(r){ if (r) return r; return lcFile(from).then(function(f){ if (!f) return null; return LOCAL.write(to,f).then(function(res){ if (!res) return null; return LOCAL.del(from).then(function(){ return res; }); }); }); })
        .catch(function(){ return null; }); }
  };

  // ===== montages xion: / nexus: — le xion local (jOSXion, livré par _appareil_bion) =====
  var lna=null;   // Local Network Access : Chrome ≥ 142 exige fetch(…,{targetAddressSpace:'loopback'}) ; ailleurs l'option est ignorée
  function lnaOk(){ if (lna===null){ lna=false; try { if (typeof Request==='function'){ new Request('https://x/',{targetAddressSpace:'zzz'}); } } catch(e){ lna=true; } } return lna; }
  function isLoopback(b){ return /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:|\/|$)/.test(String(b||'')); }
  function xInit(o){ o=o||{}; if (lnaOk() && isLoopback(xionBase())) o.targetAddressSpace='loopback'; return o; }   // comme jOSXion : jamais « loopback » pour une base LAN surchargée
  function xionOn(){ try { return !!(window.jOSXion && jOSXion.enabled && jOSXion.enabled()); } catch(e){ return false; } }
  function xionBase(){ try { var b=(window.jOSXion && jOSXion.base)?jOSXion.base():''; return String(b||'').replace(/\/$/,''); } catch(e){ return ''; } }
  var xprobe={ ok:null };
  try { window.addEventListener('xb:xion', function(e){ var d=e&&e.detail; if (d && typeof d.ok==='boolean') xprobe.ok=d.ok; }); } catch(e){}   // la sonde jOSXion (même forcée plus tard) met à jour l'état du montage
  function xionProbe(){ try { if (!xionOn() || !jOSXion.local) return; var r=jOSXion.local(); if (r && typeof r.then==='function') r.then(function(v){ xprobe.ok=!!(v&&v.ok); },function(){ xprobe.ok=false; }); else if (r) xprobe.ok=!!r.ok; } catch(e){} }
  function XION(racine, schema){ schema=schema||(racine?'nexus':'xion');   // racine = ?racine=<x> côté xion ; schema = le préfixe des chemins rendus
    function u(route,q){ var b=xionBase(); if (!b) return ''; var s=b+'/fichiers/'+route+(q?('?'+q):''); if (racine) s+=(q?'&':'?')+'racine='+encodeURIComponent(racine); return s; }
    function get(route,q){ var url=u(route,q); if (!url) return Promise.resolve(NOK()); return fetch(url,xInit({headers:{Accept:'application/json'}})); }
    function postJ(route,obj){ var url=u(route); if (!url) return Promise.resolve(null); return fetch(url,xInit({method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(obj||{})})).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }); }
    function fix(e){ e=e||{}; var p=String(e.path||''); if (p.indexOf(schema+':')!==0) e.path=schema+':'+norm(p||('/'+(e.name||''))); if (e.mime==null) e.mime=e.type==='dir'?'':mimeOf(e.name||''); if (e.mtime>0 && e.mtime<1e11) e.mtime=e.mtime*1000; return e; }
    return {
      etat: function(){ if (!xionOn() || !xionBase()) return 'absent'; if (xprobe.ok===false || !online()) return 'hors-ligne'; return 'pret'; },
      caps: {read:true,write:true,mkdir:true,move:true,copy:true,stream:true},
      list: function(rest){ return get('list','dir='+encodeURIComponent(rest)).then(function(r){ return r.ok?r.json():null; }).then(function(d){ d=d||{}; return {dir:schema+':'+norm(d.dir||rest),entries:(d.entries||[]).map(fix)}; }).catch(function(){ return {dir:schema+':'+rest,entries:[]}; }); },
      stat: function(rest){ return get('stat','path='+encodeURIComponent(rest)).then(function(r){ return r.ok?r.json():null; }).then(function(e){ if (!e) return null; e=e.entry||e; return (e.name!=null||e.type)?fix(e):null; }).catch(function(){ return null; }); },
      url: function(rest){ return u('read','path='+encodeURIComponent(rest)); },
      objectUrl: function(rest){ return Promise.resolve(u('read','path='+encodeURIComponent(rest))||null); },
      read: function(rest){ var url=u('read','path='+encodeURIComponent(rest)); if (!url) return Promise.resolve(NOK()); return fetch(url,xInit({})); },
      // write : texte → JSON {path,content} ; binaire → multipart path + file
      write: function(rest, blob, raw){ var url=u('write'); if (!url) return Promise.resolve(null); var init;
        if (typeof raw==='string') init={method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({path:rest,content:raw})};
        else { var fd=new FormData(); fd.append('path',rest); fd.append('file',blob,baseOf(rest)||'fichier'); init={method:'POST',body:fd}; }
        return fetch(url,xInit(init)).then(function(r){ return r.ok?r.json():null; }).then(function(d){ return d?{ok:true,path:schema+':'+rest,size:d.size!=null?d.size:blob.size,mtime:d.mtime||Date.now()}:null; }).catch(function(){ return null; }); },
      mkdir: function(rest){ return postJ('mkdir',{path:rest}); },
      del: function(rest){ return postJ('delete',{path:rest}); },
      move: function(from,to){ return postJ('move',{from:from,to:to}); },
      copyLocal: function(from,to){ return postJ('copy',{from:from,to:to}); }
    }; }

  // ===== montage boxions: — les MIROIRS tirés par le xion (22.09, xerboxion-rt `importer`) : <home>/boxions/<nom>/{fs,boxion}
  // via /fichiers/*?racine=boxions. LECTURE SEULE côté cœur ET ici : write/mkdir/del/move → null, sans requête ni événement
  // (« miroir en lecture seule ») ; copier DEPUIS le miroir vers un autre montage reste possible (redondance → « envoyer des
  // données entre les xerboxions »). Même état que xion:. Se remplit via « ⇊ Importer ce boxion sur Ce PC » ou xer-natif › Boxions.
  var BOXIONS = (function(){ var X=XION('boxions','boxions'); function non(){ return Promise.resolve(null); }
    return { etat:X.etat, caps:{read:true,write:false,mkdir:false,move:false,copy:true,stream:true},
      list:X.list, stat:X.stat, url:X.url, objectUrl:X.objectUrl, read:X.read, write:non, mkdir:non, del:non, move:non }; })();

  // ===== montage ios: — jOSiOS.files ({bytes,dir,url} → {size,type,path}) =====
  function iosOn(){ try { return !!(window.jOSiOS && jOSiOS.files && (!jOSiOS.files.supported || jOSiOS.files.supported())); } catch(e){ return false; } }
  function iosPath(rest){ return rest.replace(/^\//,''); }
  function iosEntry(it,parent){ var name=it.name||String(it.path||it.url||'').replace(/\/$/,'').split('/').pop()||''; var p=(parent==='/'?'':parent)+'/'+name; var mt=+it.mtime||0; if (mt>0 && mt<1e11) mt*=1000;
    return {name:name,type:it.dir?'dir':'file',path:'ios:'+p,size:it.bytes!=null?(it.bytes|0):(it.size|0),mtime:mt,mime:it.dir?'':(it.mime||mimeOf(name)),url:it.url||''}; }
  var IOS = {
    etat: function(){ return iosOn()?'pret':'absent'; },
    caps: {read:true,write:true,mkdir:false,move:true,copy:true,stream:false},
    list: function(rest){ if (!iosOn()) return Promise.resolve({dir:'ios:'+rest,entries:[]}); return jOSiOS.files.list(iosPath(rest)).then(function(items){ return {dir:'ios:'+rest,entries:(items||[]).map(function(it){ return iosEntry(it,rest); })}; }).catch(function(){ return {dir:'ios:'+rest,entries:[]}; }); },
    stat: function(rest){ var name=baseOf(rest); if (!name) return Promise.resolve(dirEntry('ios','/')); return IOS.list(dirOf(rest)).then(function(d){ return d.entries.filter(function(e){ return e.name===name; })[0]||null; }); },
    url: function(){ return ''; },
    objectUrl: function(rest){ return IOS.read(rest).then(function(r){ return r.ok?r.blob():null; }).then(function(b){ return (b && URL.createObjectURL)?URL.createObjectURL(b):null; }); },
    read: function(rest){ if (!iosOn()) return Promise.resolve(NOK()); return jOSiOS.files.read(iosPath(rest),'dataUrl').then(function(r){ if (!r) return NOK();
      if (typeof r==='string') return /^data:/.test(r)?fetch(r):respOf(new Blob([r],{type:mimeOf(rest)}));
      if (r.dataUrl) return fetch(r.dataUrl); if (r.text!=null) return respOf(new Blob([String(r.text)],{type:mimeOf(rest)})); return NOK(); }).catch(function(){ return NOK(); }); },
    write: function(rest, blob, raw){ if (!iosOn()) return Promise.resolve(null); var p=iosPath(rest);
      function w(v){ return jOSiOS.files.write(p,v).then(function(r){ return (r && r.ok!==false)?{ok:true,path:'ios:'+rest,size:blob.size,mtime:Date.now()}:null; }); }
      return (typeof raw==='string'?w(raw):blobDataUrl(blob).then(w)).catch(function(){ return null; }); },
    mkdir: function(){ return Promise.resolve(null); },
    del: function(rest){ if (!iosOn()) return Promise.resolve(null); return jOSiOS.files.del(iosPath(rest)).then(function(ok){ return ok?{ok:true}:null; }).catch(function(){ return null; }); },
    move: function(from,to){ return IOS.read(from).then(function(r){ return r.ok?r.blob():null; }).then(function(b){ if (!b) return null; return IOS.write(to,b).then(function(res){ if (!res) return null; return IOS.del(from).then(function(){ return res; }); }); }); }
  };

  var DRV={ fs:FS, boxion:BOXION, chaoxion:CHAOXION, zone:ZONE, local:LOCAL, xion:XION(''), boxions:BOXIONS, nexus:XION('nexus'), ios:IOS };
  function ecrivable(s){ return SCHEMAS.indexOf(s)>=0 && DRV[s].caps.write!==false; }   // un montage en lecture seule (boxions:) n'est jamais une cible

  // ===== l'API publique =====
  var API = {
    url: function(path){ var p=parse(path); return DRV[p.schema].url(p.rest); },
    list: function(dir){ var p=parse(dir); return DRV[p.schema].list(p.rest); },
    read: function(path){ var p=parse(path); return DRV[p.schema].read(p.rest); },
    readText: function(path){ return API.read(path).then(function(r){return r.ok?r.text():null;}).catch(function(){return null;}); },
    readJSON: function(path){ return API.read(path).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;}); },
    readBlob: function(path){ return API.read(path).then(function(r){return r.ok?r.blob():null;}).catch(function(){return null;}); },
    write: function(path, data, o){ var p=parse(path);   // o.progres(fait, total) : suivi de l'envoi (Mes fichiers seulement ; ailleurs, ignoré)
      if (p.schema==='fs') return FS.write(p.rest,data,o).then(function(r){ if (r) emit('fs',p.rest,'write'); return r; });
      return DRV[p.schema].write(p.rest,toBlob(data,baseOf(p.rest)),data).then(function(r){ if (r) emit(p.schema,full(p.schema,p.rest),'write'); return r; }); },
    writeJSON: function(path,obj){ return API.write(path, JSON.stringify(obj)); },
    mkdir: function(path){ var p=parse(path); return DRV[p.schema].mkdir(p.rest).then(function(r){ if (r) emit(p.schema,full(p.schema,p.rest),'mkdir'); return r; }); },
    del: function(path){ var p=parse(path); return DRV[p.schema].del(p.rest).then(function(r){ if (r) emit(p.schema,full(p.schema,p.rest),'del'); return r; }); },
    // move : même schéma = le montage ; schémas différents = transfert (copy puis del)
    move: function(from,to){ var a=parse(from), b=parse(to);
      if (a.schema===b.schema) return DRV[a.schema].move(a.rest,b.rest).then(function(r){ if (r) emit(b.schema,full(b.schema,b.rest),'move',{from:full(a.schema,a.rest)}); return r; });
      return API.copy(from,to).then(function(r){ if (!r) return null; return API.del(from).then(function(){ return r; }); }); },
    // copy : tous schémas = readBlob puis write (« envoyer vers le boxion de son choix ») ; `to` finissant par / = dossier → même nom
    copy: function(from,to){ var a=parse(from), b=parse(to), dst=b.rest; if (/\/$/.test(String(to)) || !baseOf(dst)) dst=join(dst,baseOf(a.rest));
      if (a.schema===b.schema && DRV[a.schema].copyLocal) return DRV[a.schema].copyLocal(a.rest,dst).then(function(r){ if (r) emit(b.schema,full(b.schema,dst),'copy',{from:full(a.schema,a.rest)}); return r; });
      return API.readBlob(from).then(function(blob){ if (!blob) return null;
        var w=(b.schema==='fs')?FS.write(dst,blob):DRV[b.schema].write(dst,blob,blob);
        return w.then(function(r){ if (r) emit(b.schema,full(b.schema,dst),'copy',{from:full(a.schema,a.rest)}); return r; }); }); },
    stat: function(path){ var p=parse(path); return DRV[p.schema].stat(p.rest).catch(function(){ return null; }); },
    exists: function(path){ return API.stat(path).then(function(e){ return !!e; }); },
    objectUrl: function(path){ var p=parse(path); return DRV[p.schema].objectUrl(p.rest).catch(function(){ return null; }); },
    mounts: function(){ return SCHEMAS.map(function(s){ var d=DRV[s], m=META[s], c={}; Object.keys(d.caps).forEach(function(k){ c[k]=d.caps[k]; }); return {schema:s,nom:m.nom,icone:m.icone,etat:d.etat(),capacites:c}; }); },
    capabilities: function(){ var o={}; SCHEMAS.forEach(function(s){ o[s]=DRV[s].etat()==='pret'; }); return o; },
    local: { connect:lcConnect, reconnect:lcReconnect, state:function(){ return fsaOk()?lc.state:'absent'; } },
    cible: function(){ var c=''; try { c=localStorage.getItem('xb:fs:cible')||''; } catch(e){} return ecrivable(c)?c:'boxion'; },
    setCible: function(s){ if (!ecrivable(s)) return false; try { localStorage.setItem('xb:fs:cible',s); } catch(e){} emit(s,full(s,'/'),'mount'); return true; },
    parse: parse, schemas: SCHEMAS.slice(), mimeOf: mimeOf,
    // ---- SÉLECTEUR modal : pick({mode:'open'|'save', dir, ext:['note'], name, schema, ouvrir}) -> Promise<path|null> ----
    // (26.09) ouvrir : en mode 'open', le fichier choisi s'ouvre AUSSI dans son app (jOSFiles.ouvrir ; une chaîne = depuis) — pour qui
    // choisit un fichier sans le lire lui-même (« 📁 ouvrir dans mes fichiers » d'une publication) ; xb:fichiers.ouvrir-partout=off : comme avant
    pick: function(opts){ opts=opts||{}; return openPicker(opts); }
  };

  // ===== DROP + PASTE globaux → cible() =====
  var DROP_DIR={ fs:'/', boxion:'/Sans catégorie', chaoxion:'/', zone:'/', local:'/', xion:'/', boxions:'/', nexus:'/', ios:'/' };
  function hasFiles(dt){ if (!dt) return false; try { if (dt.types && [].indexOf.call(dt.types,'Files')>=0) return true; } catch(e){} return !!(dt.files && dt.files.length); }
  function hasPlox(dt){ try { if (dt.types && [].indexOf.call(dt.types,'text/ploxion')>=0) return true; var it=dt.items||[]; for (var i=0;i<it.length;i++){ if (it[i].type==='text/ploxion') return true; } } catch(e){} return false; }
  function dropTarget(){ var c=API.cible(); if (ecrivable(c) && DRV[c].etat()==='pret') return c; if (DRV.xion.etat()==='pret') return 'xion'; if (DRV.boxion.etat()==='pret') return 'boxion'; if (DRV.fs.etat()==='pret') return 'fs'; return null; }
  // ingest(files) → Promise<[chemins écrits]> ; 30 fichiers max ; toast par fichier (comme _boxion v1)
  function ingest(files){ var t=dropTarget(), list=Array.prototype.slice.call(files||[],0,30); if (!list.length) return Promise.resolve([]);
    if (!t){ toast('⚠ aucun montage prêt : connecte-toi (ou reconnecte Ce PC)'); return Promise.resolve([]); }
    var m=META[t], done=0;
    return Promise.all(list.map(function(f){ var p=full(t,join(DROP_DIR[t]||'/',f.name||('fichier-'+Date.now())));
      return API.write(p,f).then(function(r){ if (r){ done++; toast(m.icone+' '+done+'/'+list.length+' ajouté'+(done>1?'s':'')+' → '+m.nom); } return r?p:null; }); })); }
  // LE VOILE DU DÉPÔT « ⬇ Déposer pour ajouter à … » (25.09, RS-7 : « y a cette page qui s'ouvre et qui reste bloquée et il faut
  // reload la page ») : il ne dépend plus de RECEVOIR le drop. Le bureau v2 écoute aussi en capture sur window ; quand son script
  // (en cache) s'exécute avant ce bion, son écouteur passe AVANT le nôtre et avale le drop (stopImmediatePropagation) : le voile,
  // caché par html.bv2-drag pendant le glisser, réapparaissait au dépôt et restait là jusqu'au rechargement. Donc :
  //   · il ne se montre que si le dépôt nous reviendra : au retour bubble de chaque dragover (après tout le monde), il est retiré
  //     quand un autre tient le glisser — html.bv2-drag (le bureau) ou un preventDefault posé AVANT notre capture ;
  //   · il part à la fin du glisser par tous les chemins : drop vu, dragend, sortie de la fenêtre, jOSFiles.finDepot() (pour qui
  //     avale un drop), et deux filets — le premier geste souris / clavier (aucun n'arrive pendant un glisser) et la veille : plus
  //     de dragover depuis VEILLE ms (le navigateur en envoie au moins toutes les 350 ± 200 ms tant qu'on glisse sur la page).
  //   Kill-switch des deux filets : localStorage xb:depot.filets = off.
  var dov=null, ddepth=0, dveille=0, dvu=0, VEILLE=1500;
  function filets(){ try { var v=localStorage.getItem('xb:depot.filets'); return !(v==='off'||v==='0'||v==='false'); } catch(e){ return true; } }
  function tenuAilleurs(){ try { return document.documentElement.classList.contains('bv2-drag'); } catch(e){ return false; } }
  function veiller(){ dvu=Date.now(); if (!dov || !filets()) return; if (dveille) clearTimeout(dveille); dveille=setTimeout(function(){ dveille=0; hideDov(); }, VEILLE); }
  // premier geste après le glisser : écouté seulement tant que le voile est là (rien au repos)
  function apresGlisser(e){ if (!dov || !filets()) return; if (e.type==='keydown' ? (e.key==='Escape' || Date.now()-dvu>150) : Date.now()-dvu>150) hideDov(); }
  function gestes(on){ var f=on?'addEventListener':'removeEventListener'; ['pointermove','pointerdown','keydown'].forEach(function(t){ window[f](t, apresGlisser, true); }); }
  function showDov(){ if (dov) return; var t=dropTarget(); if (!t) return; var m=META[t];
    dov=document.createElement('div'); dov.id='jfs-drop-ov'; dov.textContent='⬇ Déposer pour ajouter à '+m.nom+' '+m.icone;
    dov.style.cssText='position:fixed;inset:0;z-index:100090;display:flex;align-items:center;justify-content:center;font:800 1.05rem system-ui;color:#bff6d6;text-align:center;padding:24px;background:rgba(6,14,10,.78);border:3px dashed var(--xr-accent,#3fe0d0);backdrop-filter:blur(2px);pointer-events:none';
    document.body.appendChild(dov); gestes(true); veiller();
    try { if (dov.animate && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) dov.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 140, easing: 'ease-out' }); } catch(x){} }
  function hideDov(){ if (dveille){ clearTimeout(dveille); dveille=0; } if (dov){ dov.remove(); dov=null; gestes(false); } ddepth=0; }
  API.finDepot=function(){ hideDov(); };
  // garde commune (phase capture) : defaultPrevented / pas de fichiers → rien ; text/ploxion → laisser passer (bureau)
  function guard(e){ if (e.defaultPrevented) return false; var dt=e.dataTransfer; if (!hasFiles(dt)) return false; if (hasPlox(dt)) return false; return true; }
  window.addEventListener('dragenter', function(e){ dvu=Date.now(); if (!guard(e)) return; ddepth++; if (!tenuAilleurs()) showDov(); }, true);
  window.addEventListener('dragover', function(e){ var dt=e.dataTransfer; if (!hasFiles(dt) || hasPlox(dt)) return;
    e.__jfsVu=true; e.__jfsTenu=e.defaultPrevented; veiller();   // __jfsTenu : un écouteur passé avant nous tient déjà ce glisser
    if (e.defaultPrevented) return;
    e.preventDefault(); try { e.dataTransfer.dropEffect='copy'; } catch(x){} }, true);
  // retour bubble (après tout le monde) : le voile suit QUI recevra le dépôt à cet endroit
  window.addEventListener('dragover', function(e){ if (!e.__jfsVu) return; if (e.__jfsTenu || tenuAilleurs()) hideDov(); else showDov(); });
  window.addEventListener('dragleave', function(e){ dvu=Date.now(); if (!dov) return;
    var x=e.clientX, y=e.clientY;
    if (!e.relatedTarget && (x<=0 || y<=0 || x>=(window.innerWidth||0) || y>=(window.innerHeight||0))) { hideDov(); return; }   // sortie de la fenêtre
    ddepth--; if (ddepth<=0) hideDov(); }, true);
  // drop : capture = la garde marque l'événement ; bubble (dernier sur window) = décision : si un ploxion (dropzone jOSTools,
  // viewer, image-convert…) a fait preventDefault entre-temps, c'était SON fichier ; sinon on l'écrit dans cible()
  // capture : la garde marque l'événement ; l'overlay est retiré au tick suivant QUOI QU'IL ARRIVE (une dropzone qui fait
  // stopPropagation empêche le retour bubble sur window — sans ce filet, l'overlay plein écran restait affiché)
  window.addEventListener('drop', function(e){ if (!guard(e)){ hideDov(); return; } e.__jfsDrop=true; setTimeout(hideDov,0); }, true);
  window.addEventListener('dragend', function(){ hideDov(); }, true);
  window.addEventListener('drop', function(e){ if (!e.__jfsDrop) return; if (e.defaultPrevented){ hideDov(); return; }
    e.preventDefault(); e.stopPropagation(); try { e.stopImmediatePropagation(); } catch(x){}   // window = dernier nœud : immediate = les écouteurs enregistrés après nous
    var fs=e.dataTransfer&&e.dataTransfer.files; hideDov(); if (fs && fs.length) ingest(fs); });
  // ctrl+V : coller un fichier/image n'importe où → cible() (le texte reste géré normalement ; un éditeur qui preventDefault garde la main)
  document.addEventListener('paste', function(e){ if (e.defaultPrevented || !e.clipboardData) return; var fs=[], items=e.clipboardData.items||[];
    for (var i=0;i<items.length;i++){ if (items[i].kind==='file'){ var f=items[i].getAsFile(); if (f) fs.push(f); } }
    if (fs.length) ingest(fs); });
  API.ingest=ingest;   // exposé : un ploxion peut « envoyer vers cible() » ses propres fichiers

  // ===== LE CONTRAT « OUVRIR CE FICHIER » (25.09, docs/dev/33 § Créer des fichiers, ouvrir avec) =====
  // RS-7 : « il faut pouvoir créer des fichiers […] le but c'est de rester le plus possible uniquement dans le xerboxion ». UN seul chemin
  // pour passer un fichier à un ploxion, et qu'il l'enregistre LÀ où il est (jamais une copie qui part ailleurs) :
  //   confier(meta, io?, pid?) → jeton   l'ouvreur (le bureau v2) confie {chemin, nom, mime, taille} ; io = {lire()→Promise<Blob>,
  //                                     ecrire(Blob)→Promise<bool>} pour ce que ce bion ne lit pas (idb: — gardé sur l'appareil) ; sinon
  //                                     readBlob / write sur le chemin. pid : la demande attend CE ploxion (30 s, lue une fois).
  //   de(id, ctx) → poignée | null       au montage : ctx.fichier (un jeton), jOSXerPrefs.params(id, ctx).fichier (la demande du décideur),
  //                                     la demande d'ici, puis en page seule (/px/<id>) ?chemin=<chemin> (jamais idb:). Une vitre d'aperçu
  //                                     (ctx.apercu / lectureSeule) n'en prend jamais : elle ne consomme rien et n'écrit rien.
  //   ecouter(id, cb, ctx) → off         déjà ouvert : le bus ploxion.<id>.cmd {cmd:'fichier', fichier:<jeton>} — un JETON opaque, jamais un
  //                                     nom ni un chemin sur le bus (ses charges finissent dans les tsoins automatiques, partageables).
  //   html(s) → s                        le HTML d'un fichier (un .wdoc, un bloc de .deck, un texte de .note) réduit à une liste blanche :
  //                                     un fichier reçu d'un pote n'exécute rien (ni script, ni on…=, ni javascript:, ni style piégé).
  //   fidele(s) → bool                   (relecture adverse) s ressort-il ENTIER de cette liste blanche ? Sinon un ploxion ne le réécrit pas
  //                                     en place (Word et une page .html complète : lecture seule, le fichier reste intact).
  // La poignée : {jeton, chemin, nom, ext, tige, mime, taille, lire()→Blob|null, texte()→string|null, json()→objet|null, ecrire(string|objet|Blob)→bool,
  // occupe()→bool (relecture adverse : un envoi de CE fichier est en vol — un ploxion ne le relit pas à ce moment, il reculerait)}.
  // Rien au boot : du code seulement, aucun écouteur tant qu'un ploxion ne le demande.
  var FXR={}, FXO=[], FXA={};
  function fxExt(n){ var m=/\.([a-z0-9]{1,8})$/i.exec(String(n||'')); return m?m[1].toLowerCase():''; }
  function fxIo(chemin){ return { lire:function(){ return API.readBlob(chemin); }, ecrire:function(b){ return Promise.resolve(API.write(chemin,b)).then(function(r){ return !!r; }); } }; }
  function fxPoignee(j){ var r=FXR[j]; if (!r) return null; var m=r.meta;
    var h={ jeton:j, chemin:m.chemin, nom:m.nom, ext:fxExt(m.nom), tige:String(m.nom).replace(/\.[a-z0-9]{1,8}$/i,''), mime:m.mime, taille:m.taille,
      lire:function(){ try { return Promise.resolve(r.io.lire()).then(function(b){ return b||null; },function(){ return null; }); } catch(e){ return Promise.resolve(null); } },
      texte:function(){ return h.lire().then(function(b){ return b?blobText(b):null; }).catch(function(){ return null; }); },
      json:function(){ return h.texte().then(function(t){ if (t==null) return null; if (!String(t).trim()) return {}; try { var o=JSON.parse(t); return (o&&typeof o==='object')?o:null; } catch(e){ return null; } }); },
      // une écriture à la fois par fichier, la plus récente gagne : celles qui attendent derrière un envoi lent (le silo boxion : envoyer puis
      // retirer l'ancien) se fondent dans la dernière — jamais deux envois qui se croisent
      occupe:function(){ return !!r.enVol; },
      ecrire:function(data){ var b=toBlob(data,m.nom); r.dernier=b;
        if (r.enVol) return r.enVol.then(function(){ return r.dernier===b ? fxEnvoi(r,h,b) : true; });
        return fxEnvoi(r,h,b); } };
    return h; }
  function fxEnvoi(r, h, b){ var m=r.meta, p;
    try { p=Promise.resolve(r.io.ecrire(b)); } catch(e){ p=Promise.resolve(false); }
    r.enVol=p.then(function(ok){ if (ok){ m.taille=b.size||0; h.taille=m.taille; } return !!ok; },function(){ return false; }).then(function(v){ r.enVol=null; return v; });
    return r.enVol; }
  function fxConfier(meta, io, pid){
    if (!meta || typeof meta.chemin!=='string' || !meta.chemin) return null;
    var ioOk=!!(io && typeof io.lire==='function' && typeof io.ecrire==='function');
    if (!ioOk && /^idb:/.test(meta.chemin)) return null;   // gardé sur l'appareil : seul l'ouvreur sait le lire
    var j='f'+Date.now().toString(36)+Math.random().toString(36).slice(2,8), c=String(meta.chemin).slice(0,700);
    FXR[j]={ meta:{ chemin:c, nom:String(meta.nom||baseOf(c)||'fichier').slice(0,160), mime:String(meta.mime||'').slice(0,100), taille:+meta.taille||0 }, io:ioOk?io:fxIo(c) };
    FXO.push(j); while (FXO.length>64) delete FXR[FXO.shift()];
    if (typeof pid==='string' && pid) FXA[pid]={ j:j, t:Date.now() };
    return j; }
  function fxVitre(ctx){ return !!(ctx && (ctx.apercu || ctx.lectureSeule)); }
  function fxDe(id, ctx){
    ctx=ctx||{}; if (fxVitre(ctx) || typeof id!=='string') return null;
    var j=typeof ctx.fichier==='string'?ctx.fichier:'', p=null, X=window.jOSXerPrefs, a=FXA[id];
    if (!j){ try { if (X && typeof X.params==='function') p=X.params(id,ctx); } catch(e){ p=null; } if (p && typeof p.fichier==='string') j=p.fichier; }
    if (a){ delete FXA[id]; if (!j && Date.now()-a.t<30000) j=a.j; }
    var h=j?fxPoignee(j):null; if (h) return h;
    // la page seule (/px/<id>?chemin=…, le décideur en « page pleine ») : un chemin de jOSFiles, jamais idb: ni un montage inconnu
    if (ctx.standalone){ var c=(p && typeof p.chemin==='string')?p.chemin:'', cp=(p && typeof p.copie==='string')?p.copie:null;
      try { var q=new URLSearchParams(location.search); if (!c) c=q.get('chemin')||''; if (cp==null) cp=q.get('copie'); } catch(e){ c=''; }
      if (c && c.length<=700 && !/^idb:/i.test(c) && !/(^|\/)\.\.(\/|$)/.test(c) && (c.charAt(0)==='/' || /^[a-z]+:\//.test(c) && SCHEMAS.indexOf(parse(c).schema)>=0)){
        // (relecture adverse 26.09) ?copie= (ou un montage en lecture seule) : jamais en place — le 1er enregistrement fait la copie dans Mes fichiers
        var m0={ chemin:c, nom:baseOf(c) };
        return fxPoignee(fxConfier(m0, (cp!=null || lectureSeule(m0)) ? ioDe(metaDe(c), { copie:cp||'/Copies' }, dir0) : null)); } }
    return null; }
  function fxEcouter(id, cb, ctx){
    if (fxVitre(ctx) || typeof cb!=='function' || !window.jOSPorts || typeof jOSPorts.on!=='function') return function(){};
    var off=null; try { off=jOSPorts.on('ploxion.'+id+'.cmd', function(p){
      if (typeof p==='string'){ try { p=JSON.parse(p); } catch(e){ return; } }
      if (!p || typeof p!=='object') return;
      var j=p.cmd==='fichier'?p.fichier:(p.cmd==='params' && p.params && typeof p.params==='object'?p.params.fichier:null);
      if (typeof j!=='string') return; var h=fxPoignee(j); if (!h) return;
      if (FXA[id] && FXA[id].j===j) delete FXA[id];   // servie : elle ne traîne pas pour le prochain montage
      try { cb(h); } catch(e){} }); } catch(e){ off=null; }
    return function(){ try { if (typeof off==='function') off(); } catch(e){} }; }
  // la liste blanche du HTML (un fichier est une DONNÉE) : parsé dans un document INERTE (DOMParser : ni script, ni image chargée),
  // puis reconstruit balise par balise ; le reste est jeté (script, style, iframe, svg, formulaires…) ou déballé (on garde son texte)
  var FX_TAGS={P:1,BR:1,B:1,STRONG:1,I:1,EM:1,U:1,S:1,STRIKE:1,DEL:1,INS:1,SUB:1,SUP:1,H1:1,H2:1,H3:1,H4:1,H5:1,H6:1,UL:1,OL:1,LI:1,BLOCKQUOTE:1,PRE:1,CODE:1,HR:1,SPAN:1,DIV:1,FONT:1,A:1,IMG:1,TABLE:1,THEAD:1,TBODY:1,TFOOT:1,TR:1,TD:1,TH:1,CAPTION:1,MARK:1,SMALL:1,CENTER:1};
  var FX_JETER=/^(SCRIPT|STYLE|IFRAME|FRAME|FRAMESET|OBJECT|EMBED|APPLET|SVG|MATH|TEMPLATE|NOSCRIPT|NOEMBED|NOFRAMES|TITLE|HEAD|META|LINK|BASE|FORM|INPUT|BUTTON|TEXTAREA|SELECT|OPTION|AUDIO|VIDEO|SOURCE|TRACK|CANVAS|PORTAL|DIALOG|SLOT|XMP|PLAINTEXT)$/;
  var FX_PROPS=/^(color|background-color|text-align|font-weight|font-style|text-decoration|text-decoration-line|font-size|font-family|line-height)$/;
  function fxUrl(u, img){ u=String(u==null?'':u).replace(/[\u0000- ]+/g,''); if (!u) return '';
    if (/^https?:\/\//i.test(u) || /^\/(?![\/\\])/.test(u)) return u;
    if (!img && (/^mailto:/i.test(u) || /^#/.test(u))) return u;
    if (img && /^data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+\/=]+$/i.test(u)) return u;
    return ''; }
  function fxStyle(s){ var out=[]; String(s||'').split(';').forEach(function(d){ var i=d.indexOf(':'); if (i<0) return; var k=d.slice(0,i).trim().toLowerCase(), v=d.slice(i+1).trim();
    if (!FX_PROPS.test(k) || !v || v.length>80 || !/^[#a-z0-9 .,%()'-]+$/i.test(v) || /url|expression|var|attr|image|element/i.test(v)) return;
    if (/\(/.test(v) && !/^(rgba?|hsla?)\([0-9 .,%]+\)$/i.test(v)) return;
    out.push(k+':'+v); }); return out.join(';'); }
  // P (facultatif, relecture adverse 25.09) : {perdu} passe à vrai dès que la liste blanche JETTE quelque chose — une balise (jetée ou
  // déballée), un attribut, une déclaration de style, un commentaire. fidele(s) le dit AVANT d'écrire : un ploxion n'enregistre en place
  // que ce qu'il garde entier (Word et une page .html complète : sinon, relue et réécrite, elle perdait head, style, script, classes…)
  function fxPropre(n, out, prof, P){
    for (var c=n.firstChild; c; c=c.nextSibling){
      if (c.nodeType===3){ out.push(esc(c.nodeValue)); continue; }
      if (c.nodeType!==1){ if (P) P.perdu=true; continue; }
      var t=String(c.tagName||'').toUpperCase();
      if (FX_JETER.test(t) || prof>48){ if (P) P.perdu=true; continue; }
      if (!FX_TAGS[t]){ if (P) P.perdu=true; fxPropre(c,out,prof+1,P); continue; }
      var at='', v, garde={ target:1, rel:1 };   // target / rel d'un lien : refaits ici, jamais perdus
      if (t==='A'){ v=fxUrl(c.getAttribute('href'),false); if (v){ garde.href=1; at+=' href="'+esc(v)+'"'+(v.charAt(0)==='#'?'':' target="_blank" rel="noopener noreferrer"'); } }
      if (t==='IMG'){ v=fxUrl(c.getAttribute('src'),true); if (!v){ if (P) P.perdu=true; continue; } garde.src=garde.alt=1; at+=' src="'+esc(v)+'" alt="'+esc(String(c.getAttribute('alt')||'').slice(0,200))+'"';
        ['width','height'].forEach(function(k){ var x=c.getAttribute(k); if (x && /^\d{1,4}$/.test(x)){ garde[k]=1; at+=' '+k+'="'+x+'"'; } }); }
      if (t==='FONT'){ v=c.getAttribute('color'); if (v && /^#?[a-z0-9]{1,20}$/i.test(v)){ garde.color=1; at+=' color="'+esc(v)+'"'; } v=c.getAttribute('size'); if (v && /^[1-7]$/.test(v)){ garde.size=1; at+=' size="'+v+'"'; }
        v=c.getAttribute('face'); if (v && /^[a-z0-9 ,-]{1,60}$/i.test(v)){ garde.face=1; at+=' face="'+esc(v)+'"'; } }
      if (t==='TD' || t==='TH'){ ['colspan','rowspan'].forEach(function(k){ var x=c.getAttribute(k); if (x && /^\d{1,2}$/.test(x)){ garde[k]=1; at+=' '+k+'="'+x+'"'; } }); }
      v=c.getAttribute('align'); if (v && /^(left|right|center|justify)$/i.test(v)){ garde.align=1; at+=' align="'+v.toLowerCase()+'"'; }
      var s0=c.getAttribute('style'); v=fxStyle(s0); if (v) at+=' style="'+esc(v)+'"';
      if (P && !P.perdu){ if (s0!=null && (v?v.split(';').length:0)===String(s0).split(';').filter(function(d){ return d.indexOf(':')>=0; }).length) garde.style=1;
        for (var i=0;i<c.attributes.length;i++){ if (!garde[String(c.attributes[i].name).toLowerCase()]){ P.perdu=true; break; } } }
      var tl=t.toLowerCase();
      if (t==='BR' || t==='HR' || t==='IMG'){ out.push('<'+tl+at+'>'); continue; }
      out.push('<'+tl+at+'>'); fxPropre(c,out,prof+1,P); out.push('</'+tl+'>');
    } }
  var FX_LIMITE=4000000;   // au-delà, le HTML d'un fichier est coupé (un fichier-donnée ne fait pas travailler le Pi sans fin) : limite exposée, un ploxion ne réécrit jamais ce qu'il a relu coupé
  function fxHtml(src, P){ var s0=String(src==null?'':src), s=s0.slice(0,FX_LIMITE); if (P && s.length<s0.length) P.perdu=true;
    if (!/[<&]/.test(s)) return s.replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    var d=null; try { d=new DOMParser().parseFromString('<!doctype html><html><body>'+s+'</body></html>','text/html'); } catch(e){ d=null; }
    if (!d || !d.body){ if (P) P.perdu=true; return esc(s); }
    var out=[]; fxPropre(d.body,out,0,P||null); return out.join(''); }
  // fidele(s) → vrai si s ressort ENTIER de la liste blanche (une page complète — doctype, html, head, body — ne l'est jamais)
  function fxFidele(src){ var s=String(src==null?'':src); if (/<!doctype|<\/?(html|head|body)[\s>\/]/i.test(s)) return false; var P={ perdu:false }; fxHtml(s,P); return !P.perdu; }
  API.fichier={ confier:fxConfier, de:fxDe, ecouter:fxEcouter, html:function(s){ return fxHtml(s); }, fidele:fxFidele, limite:FX_LIMITE, poignee:fxPoignee };

  
  function coupe(nom){ try { var q=new RegExp('[?&]'+nom.replace(/\./g,'\\.')+'=([^&#]*)').exec(location.search||''); if (q && /^(off|0|false)$/.test(decodeURIComponent(q[1]))) return true; } catch(e){}
    try { var v=localStorage.getItem('xb:'+nom); return v==='off'||v==='0'||v==='false'; } catch(e){ return false; } }
  var OWN=Object.prototype.hasOwnProperty; function own(o,k){ return !!o && OWN.call(o,k); }
  function str(v,max){ return String(v==null?'':v).replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max||120); }
  
  function nomPropre(n){ n=str(String(n||'fichier').replace(/[\u0080-\u009f]/g,' ').replace(/[\u061c\u200b\u200e\u200f\u202a-\u202e\u2060\u2066-\u2069\ufeff]/g,''),120).replace(/[\\/:*?"<>|#%]/g,'-').replace(/^\.+/,''); return n||'fichier'; }
  var PXID=/^[a-z0-9][a-z0-9_.-]{0,63}$/i, RE_K=/^[a-z0-9-]{1,24}$/, RE_EXT=/^[a-z0-9]{1,8}$/, RE_URL=/^\/(?![\/\\])[^\s]{0,700}$/;
  var GENRES=[['image',/^(png|jpe?g|gif|webp|avif|svg|bmp|ico)$/],['video',/^(mp4|webm|mov|mkv|m4v|ogv)$/],['son',/^(mp3|wav|ogg|oga|m4a|flac|aac|opus)$/],['pdf',/^pdf$/],
    ['3d',/^(stl|obj|gltf|glb|ply|3mf)$/],['doc',/^(wdoc|note|xlc|deck|docx|odt|xlsx|xls|ods|pptx|odp)$/],['texte',/^(txt|md|markdown|csv|tsv|json|html?|css|m?js|ts|xml|ya?ml|log|scad|tsoin|ini|conf|sh|py|php)$/]];
  
  function genreDe(nom,mime){ var e=fxExt(nom), i; for (i=0;i<GENRES.length;i++) if (GENRES[i][1].test(e)) return GENRES[i][0]; mime=String(mime||'');
    return /^image\//.test(mime)?'image':/^video\//.test(mime)?'video':/^audio\//.test(mime)?'son':mime==='application/pdf'?'pdf':/^model\//.test(mime)?'3d':(/^text\//.test(mime)||/json|xml/.test(mime))?'texte':'autre'; }
  function taille(o){ o=+o||0; return o<1024?o+' o':o<1048576?(o/1024).toFixed(1).replace('.',',')+' Ko':(o/1048576).toFixed(1).replace('.',',')+' Mo'; }
  function manifeste(pid){ var l=window.__PLOXIONS__||[]; for (var i=0;i<l.length;i++) if (l[i] && l[i].id===pid) return l[i]; return null; }
  
  function ouvrable(pid){ if (!PXID.test(String(pid||''))) return false; var X=window.jOSXerPrefs; try { if (X && typeof X.ouvrable==='function') return !!X.ouvrable(pid); } catch(e){}
    return !!manifeste(pid) || !!(window.jOSApps && jOSApps[pid] && typeof jOSApps[pid].mount==='function'); }
  function nomPx(pid){ var m=manifeste(pid); if (m && m.name) return str(m.name,60); try { var a=window.jOSApps&&jOSApps[pid]; if (a && a.manifest && a.manifest.name) return str(a.manifest.name,60); } catch(e){} return str(pid,60); }
  
  var TF=null, TF_P=null, URL_TYPES='/data/types-fichiers.json';
  function lireJson(u){ try { if (window.jOSCache && typeof jOSCache.fetchJson==='function') return Promise.resolve(jOSCache.fetchJson(u,{ttl:600000})); } catch(e){}
    try { return Promise.resolve(fetch(u,{credentials:'same-origin',headers:{Accept:'application/json'}})).then(function(r){ return r && r.ok ? r.json() : null; }); } catch(e2){ return Promise.resolve(null); } }
  function validerTypes(d){
    if (!d || typeof d!=='object' || !d.types || typeof d.types!=='object' || Array.isArray(d.types)) return null;
    var out={ ordre:[], types:Object.create(null), ext:Object.create(null) };
    var pl=function(l){ return (Array.isArray(l)?l:[]).filter(function(p){ return typeof p==='string' && PXID.test(p); }).slice(0,8); };
    Object.keys(d.types).forEach(function(k){ var t=d.types[k]; if (!RE_K.test(k) || !t || typeof t!=='object' || !RE_EXT.test(String(t.ext||''))) return;
      var v=t.vide&&typeof t.vide==='object'?t.vide:{}, c=typeof v.texte==='string'?v.texte:(v.json&&typeof v.json==='object'?JSON.stringify(v.json):null);
      if (c==null || c.length>20000) return;
      out.types[k]={ k:k, ext:String(t.ext), label:str(t.label,40)||k, nom:nomPropre(str(t.nom,60)||'nouveau '+k), glyphe:str(t.glyphe,12), mime:str(t.mime,80)||'application/octet-stream', ploxions:pl(t.ploxions), vide:c }; });
    (Array.isArray(d.ordre)?d.ordre:Object.keys(out.types)).forEach(function(k){ if (typeof k==='string' && own(out.types,k) && out.ordre.indexOf(k)<0) out.ordre.push(k); });
    var e=d.extensions&&typeof d.extensions==='object'?d.extensions:{};
    Object.keys(e).forEach(function(x){ if (RE_EXT.test(x)) out.ext[x]=pl(e[x]); });
    out.ordre.forEach(function(k){ var t=out.types[k]; if (!own(out.ext,t.ext)) out.ext[t.ext]=t.ploxions.slice(); });
    return out; }
  function types(){ if (TF) return Promise.resolve(TF); if (TF_P) return TF_P;
    TF_P=Promise.resolve().then(function(){ return lireJson(URL_TYPES); }).then(function(d){ var t=validerTypes(d); if (!t) throw new Error('la table des types de fichiers est illisible'); TF=t; hydraterPrefs(); return t; });
    TF_P.catch(function(){ TF_P=null; }); return TF_P; }
  function est3d(nom,mime){ return genreDe(nom,mime)==='3d'; }
  
  function candidats(nom,mime){ var e=fxExt(nom), td=est3d(nom,mime), l=(TF && own(TF.ext,e))?TF.ext[e].slice():(td?['vue-3d']:[]);
    l=l.filter(function(p){ return (p==='viewer'||p==='vue-3d')?true:ouvrable(p); });
    if (l.indexOf('viewer')<0 && (!td || !l.length)) l.push('viewer'); return l; }
  
  var PREF_LS='xb:fichiers:ouvrir-avec', PREFS=null, PREFS_LU=false, PREFS_H=null;
  function prefsOk(o){ var p={ maj:0, ext:Object.create(null) }; if (!o || typeof o!=='object') return p;
    var m=+o.maj; p.maj=isFinite(m)?Math.max(0,Math.min(9e15,Math.round(m))):0; var e=o.ext&&typeof o.ext==='object'?o.ext:{};
    Object.keys(e).forEach(function(x){ if (RE_EXT.test(x) && typeof e[x]==='string' && PXID.test(e[x])) p.ext[x]=e[x]; }); return p; }
  function prefs(){ if (!PREFS){ var o=null; try { o=JSON.parse(localStorage.getItem(PREF_LS)||'null'); } catch(e){ o=null; } PREFS=prefsOk(o); } return PREFS; }
  function prefsJson(){ var p=prefs(), e={}; Object.keys(p.ext).forEach(function(x){ e[x]=p.ext[x]; }); return { v:1, maj:p.maj, ext:e }; }
  function prefsLs(){ try { localStorage.setItem(PREF_LS, JSON.stringify(prefsJson())); } catch(e){} }
  function envoyerPrefs(){ if (!PREFS_LU || !authed() || !window.jOSBoxion || !jOSBoxion.save) return; try { jOSBoxion.save('fichiers','ouvrir-avec',prefsJson(),'Ouvrir avec'); } catch(e){} }
  
  function compteVide(){ try { if (window.jOSTemps && jOSTemps.posee && jOSTemps.posee('fichiers')) return Promise.resolve(true);
      var h={Accept:'application/json'}; try { if (window.jOSBoxion && jOSBoxion.entetes) h=jOSBoxion.entetes(h); } catch(e){}
      return Promise.resolve(fetch('/px/boxion/load?ns=fichiers&key=ouvrir-avec',{credentials:'same-origin',headers:h})).then(function(r){ return r && r.ok ? r.json() : null; })
        .then(function(j){ return !!(j && typeof j==='object' && j.item===null); },function(){ return false; }); } catch(e){ return Promise.resolve(false); } }
  function hydraterPrefs(){
    if (PREFS_LU || PREFS_H || !authed() || !window.jOSBoxion || !jOSBoxion.load) return PREFS_H || Promise.resolve(false);
    PREFS_H=Promise.resolve(jOSBoxion.load('fichiers','ouvrir-avec')).then(function(it){ var d=it&&it.data;
      if (d && typeof d==='object'){ PREFS_LU=true; var p=prefsOk(d); if (p.maj>prefs().maj){ PREFS=p; prefsLs(); } else if (prefs().maj>p.maj) envoyerPrefs(); return true; }
      return compteVide().then(function(v){ if (v){ PREFS_LU=true; if (prefs().maj) envoyerPrefs(); } PREFS_H=null; return v; });
    }).catch(function(){ PREFS_H=null; return false; });
    return PREFS_H; }
  function busF(port,p){ try { if (window.jOSPorts && jOSPorts.emit) jOSPorts.emit('fichiers',port,p); } catch(e){} }
  function toujours(ext,pid){ ext=String(ext||'').toLowerCase(); if (!RE_EXT.test(ext) || (pid && !PXID.test(pid))) return false;
    var p=prefs(); if (pid) p.ext[ext]=pid; else delete p.ext[ext];
    p.maj=Math.max(Date.now(),p.maj+1); prefsLs();
    if (PREFS_LU) envoyerPrefs(); else hydraterPrefs();
    busF('ouvrir-avec',{ ext:ext, px:pid||null }); return true; }
  
  var LOURD=5*1048576;
  function lourd(m){ return genreDe(m.nom,m.mime)==='texte' && (+m.taille||0)>LOURD && !coupe('fichiers.lourd'); }
  function metaDe(src){ if (typeof src==='string') src={ chemin:src }; if (!src || typeof src!=='object') return null;
    var c=typeof src.chemin==='string'?src.chemin.slice(0,700):'', u=(typeof src.url==='string' && RE_URL.test(src.url))?src.url:'', b=isBlob(src.blob)?src.blob:null;
    var nom=str(src.nom||(b&&b.name)||baseOf(c)||(u?baseOf(u.split(/[?#]/)[0]):'')||'fichier',160);
    return { chemin:c, url:u, blob:b, nom:nom, mime:str(src.mime||(b&&b.type)||'',100)||mimeOf(nom), taille:+(src.taille!=null?src.taille:(b?b.size:src.size))||0, type:String(src.type||'') }; }
  function ploxionDe(src){ var m=metaDe(src); if (!m) return 'viewer';
    if (coupe('fichiers.associations') || !TF) return (m.type==='3d' || est3d(m.nom,m.mime)) ? 'vue-3d' : 'viewer';
    var l=candidats(m.nom,m.mime), p=prefs().ext[fxExt(m.nom)];
    if (p && l.indexOf(p)>=0) return p;
    return (lourd(m) && l.indexOf('viewer')>=0) ? 'viewer' : (l[0]||'viewer'); }
  
  function appDe(src){ var m=metaDe(src); if (!m || !TF || coupe('fichiers.associations')) return null; var p=ploxionDe(m);
    if (p!=='viewer' && p!=='vue-3d') return p; var l=candidats(m.nom,m.mime); for (var i=0;i<l.length;i++) if (l[i]!=='viewer' && l[i]!=='vue-3d') return l[i]; return null; }
  function dir0(t,ms){ toast(t); }
  function fenetres(pid){ try { return (window.jOS && jOS.list ? jOS.list() : []).filter(function(w){ return w && w.kind==='app' && (w.tabs||[]).some(function(t){ return t && t.app===pid; }); }).map(function(w){ return w.id; }); } catch(e){ return []; } }
  function ouvertIci(pid){ if (fenetres(pid).length) return true; try { return !!(window.jOSMobile && jOSMobile.tabs && jOSMobile.tabs().indexOf(pid)>=0); } catch(e){ return false; } }
  function decideur(){ var X=window.jOSXerPrefs; return (X && typeof X.ouvrir==='function' && (!X.central || X.central())) ? X : null; }
  
  function ouvrirPx(pid,o,params){ var X=decideur(); try { if (X) return X.ouvrir(pid,params?{ depuis:'fichier'+(o.depuis?':'+str(o.depuis,30):''), label:nomPx(pid), params:params }:{ depuis:'fichier'+(o.depuis?':'+str(o.depuis,30):''), label:nomPx(pid) }); } catch(e){ return null; }
    try { if (window.jOS && jOS.openPloxion){ var r=jOS.openPloxion(pid); if (r) return r; } } catch(e1){}
    try { if (window.jOSMobile && jOSMobile.open && jOSMobile.open(pid,nomPx(pid))) return 'mobile'; } catch(e2){} return null; }
  
  function libre(p){ var m=/^(.*?)(\.[^.\/]*)?$/.exec(p), n=1; function essai(q){ return API.exists(q).then(function(x){ if (!x || n>60) return q; n++; return essai(m[1]+' ('+n+')'+(m[2]||'')); }); } return essai(p); }
  
  function bxAmbigu(items,it){ if (!it) return false; if (bxNom(it)!==String(it.name||'fichier')) return true; var c=bxCat(it);
    for (var i=0;i<items.length;i++){ var x=items[i]; if (x && x!==it && x.id!==it.id && bxCat(x)===c && String(x.name||'fichier')===String(it.name||'fichier')) return true; } return false; }
  function lectureSeule(m){ if (!(m && m.chemin && !/^idb:/i.test(m.chemin) && !m.url && !m.blob)) return false; var pc=parse(m.chemin);
    if (!ecrivable(pc.schema)) return true;
    if (pc.schema==='boxion' && bx.idx){ var s0=bxSplit(pc.rest); return bxAmbigu(bx.idx, bxFind(bx.idx,s0.cat,s0.name)); }
    return false; }
  
  function boxionChemin(items,it){ if (!Array.isArray(items) || !it || it.id==null || /\//.test(String(it.name||''))) return null;
    var l=bxUnique(items.filter(function(x){ return !!x; }).map(function(x){ return { id:x.id, name:x.name, category:x.category, savedAt:x.savedAt }; })), me=null;
    for (var i=0;i<l.length;i++) if (l[i].id===it.id){ me=l[i]; break; }
    return (me && !bxAmbigu(l,me)) ? 'boxion:/'+bxCat(me)+'/'+bxNom(me) : null; }
  
  function dossierCopie(o){ return (o && typeof o.copie==='string' && /^\/[^\\:*?"<>|#%]{0,120}$/.test(o.copie) && !/(^|\/)\.\.(\/|$)/.test(o.copie))?o.copie.replace(/\/+$/,''):'/Copies'; }
  
  function ioDe(m,o,dire){
    if (o.io && typeof o.io.lire==='function' && typeof o.io.ecrire==='function' && !lectureSeule(m)) return o.io;
    var lire=m.blob?function(){ return Promise.resolve(m.blob); }
      :m.url?function(){ return fetch(m.url,{credentials:'same-origin'}).then(function(r){ return r && r.ok ? r.blob() : null; }).catch(function(){ return null; }); }
      :(m.chemin && !/^idb:/i.test(m.chemin))?function(){ return API.readBlob(m.chemin); }:null;
    if (!lire) return null;
    if (!m.blob && !m.url && !o.copie && ecrivable(parse(m.chemin).schema)) return fxIo(m.chemin);
    var copie='', dir=dossierCopie(o);
    return { lire:function(){ return copie?API.readBlob(copie):lire(); }, ecrire:function(b){
      if (copie) return Promise.resolve(API.write(copie,b)).then(function(r){ return !!r; },function(){ return false; });
      if (DRV.fs.etat()!=='pret'){ dire('🔒 '+m.nom+' : lecture seule ici — connecte-toi pour en garder une copie dans Mes fichiers',7000); return Promise.resolve(false); }
      return libre(join(dir||'/',nomPropre(m.nom))).then(function(p){ return Promise.resolve(API.write(p,b)).then(function(r){ if (!r) return false; copie=p;
        dire('✎ '+m.nom+' ne se réécrit pas là-bas : ta copie est dans Mes fichiers '+dirOf(p)+' (la suite y va)',7000); return true; }); }).catch(function(){ return false; }); } }; }
  
  var VUS=(typeof WeakMap==='function')?new WeakMap():null;
  
  function mimeTable(nom){ var e=fxExt(nom); if (!TF || !e) return ''; for (var i=0;i<TF.ordre.length;i++){ var t=TF.types[TF.ordre[i]]; if (t && t.ext===e) return t.mime; } return ''; }
  function pourLeViewer(m,b){ var ex=fxExt(m.nom), bt=String(b.type||'').toLowerCase(), OCT='application/octet-stream';
    if (!bt || bt===OCT) bt=String((m.mime && m.mime!==OCT) ? m.mime : (mimeTable(m.nom)||m.mime||'')).toLowerCase();
    var tf=ex==='pdf'?'application/pdf':ex==='svg'?'image/svg+xml':(/html|xml|javascript|ecmascript/.test(bt)?'text/plain':bt);
    var f; try { f=new File([b],m.nom||'fichier',{type:tf}); } catch(e){ f=b; } return f; }
  
  function pagePleine(){ var X=decideur(); try { return !!(X && X.mode && X.mode().resolu==='page'); } catch(e){ return false; } }
  function viewerPage(c){ c=String(c==null?'':c); if (!c || c.length>700 || /^idb:/i.test(c) || /(^|\/)\.\.(\/|$)/.test(c) || !(c.charAt(0)==='/' || /^[a-z]+:\//.test(c) && SCHEMAS.indexOf(parse(c).schema)>=0)) return Promise.resolve(null);
    var m=metaDe(c), io=ioDe(m,{},dir0); if (!io) return Promise.resolve(null);
    
    return Promise.resolve(io.lire()).then(function(b){ if (!b) return null; var f=pourLeViewer(m,b); try { if (VUS && f && typeof f==='object') VUS.set(f,{ m:m, io:io, copie:'' }); } catch(e){} return f; },function(){ return null; }); }
  function versViewer(m,io,pid,o,dire){
    return Promise.resolve(io.lire()).then(function(b){
      if (!b){ dire('fichier introuvable : '+m.nom); return false; }
      var f=pourLeViewer(m,b);
      try { if (VUS && f && typeof f==='object') VUS.set(f,{ m:m, io:io, copie:o.copie||'' }); } catch(e){}
      busF('ouvre',{ px:pid, type:genreDe(m.nom,m.mime), depuis:str(o.depuis,40) });
      if (pid==='vue-3d'){ (window.__viewer3dQueue=window.__viewer3dQueue||[]).push(f); return !!ouvrirPx('vue-3d',o); }
      var avant=fenetres('viewer'); window.__viewerDrop=[f];
      var cv=(m.chemin && !/^idb:/i.test(m.chemin) && !m.url && !m.blob)?m.chemin:'', pp=pagePleine();
      if (pp && !cv) dire('⚠ en « page pleine », ce fichier ne suit pas jusqu\'à la page : ouvre-le en fenêtre, ou mets-le dans tes fichiers',8000);
      var r=ouvrirPx('viewer',o,(pp && cv)?{ chemin:cv }:null);
      if (r && avant.indexOf(r)>=0 && window.jOS && jOS.recharger){ try { jOS.recharger(r); } catch(e2){} }   // déjà ouvert : il reprend le fichier au remontage
      setTimeout(function(){ if (window.__viewerDrop && window.__viewerDrop[0]===f) window.__viewerDrop=null; },5000);
      return !!r; }); }
  function versPloxion(m,io,pid,o,dire){
    var j=fxConfier({ chemin:m.chemin||m.url||('fichier:'+m.nom), nom:m.nom, mime:m.mime, taille:m.taille },io,pid);
    if (!j) return versViewer(m,io,'viewer',o,dire);
    var avant=ouvertIci(pid), payload={ cmd:'fichier', fichier:j }, r=null, X=decideur(), cv=(m.chemin && !/^idb:/i.test(m.chemin) && !m.url && !m.blob)?m.chemin:'';
  
    var cp=(cv && (o.copie || lectureSeule(m)))?(dossierCopie(o)||'/'):'';
  
    try { if (!cv && X && X.mode && X.mode().resolu==='page') dire('⚠ en « page pleine », ce fichier ne suit pas jusqu\'à la page : ouvre-le en fenêtre, ou mets-le dans tes fichiers',8000); } catch(e0){}
    var params={ fichier:j }; if (cv) params.chemin=cv; if (cp) params.copie=cp;
    try { if (X) r=X.ouvrir(pid,{ depuis:'fichier'+(o.depuis?':'+str(o.depuis,30):''), label:nomPx(pid), params:params, port:'cmd', payload:payload }); } catch(e){ r=null; }
    if (!r && !X){ try { if (window.jOS && jOS.openPloxion) r=jOS.openPloxion(pid); } catch(e1){ r=null; }
      if (!r){ try { if (window.jOSMobile && jOSMobile.open && jOSMobile.open(pid,nomPx(pid))) r='mobile'; } catch(e2){} }
      if (r && avant){ try { if (window.jOSPorts && jOSPorts.emit) jOSPorts.emit(pid,'cmd',payload); } catch(e3){} } }
    busF('ouvre',{ px:pid, type:genreDe(m.nom,m.mime), depuis:str(o.depuis,40) });
    if (!r) dire('« '+nomPx(pid)+' » ne s\'ouvre pas ici');
    return Promise.resolve(!!r); }
  function ouvrir(src,o){
    o=(o && typeof o==='object')?o:{};
    var m=metaDe(src), dire=typeof o.dire==='function'?o.dire:dir0;
    if (!m || (!m.chemin && !m.url && !m.blob && !o.io)) return Promise.resolve(false);
    var io=ioDe(m,o,dire); if (!io){ dire('fichier introuvable : '+m.nom); return Promise.resolve(false); }
    var viewer=function(){ return (m.type==='3d' || est3d(m.nom,m.mime)) ? 'vue-3d' : 'viewer'; };
    var go=function(){
      var pid=(typeof o.avec==='string' && PXID.test(o.avec))?o.avec:ploxionDe(m);
      if (pid!=='viewer' && pid!=='vue-3d' && (coupe('fichiers.associations') || !ouvrable(pid))) pid=viewer();
      if (!o.avec && pid==='viewer' && lourd(m) && (candidats(m.nom,m.mime)[0]||'viewer')!=='viewer') dire('📄 '+taille(m.taille)+' : trop lourd pour l\'éditer ici — ouvert en lecture (« ouvrir avec » pour l\'éditer quand même)',6000);
      return (pid==='viewer' || pid==='vue-3d') ? versViewer(m,io,pid,o,dire) : versPloxion(m,io,pid,o,dire); };
    if (coupe('fichiers.associations')) return versViewer(m,io,viewer(),o,dire);
    if (typeof o.avec==='string' && o.avec) return Promise.resolve(go());
    return types().then(go,go); }
  
  function vu(f){ try { return (VUS && f && typeof f==='object' && VUS.get(f)) || null; } catch(e){ return null; } }
  
  var MA=null;
  function fermerMenuAvec(rendre){ if (!MA) return; var x=MA; MA=null; try { x.el.remove(); } catch(e){} document.removeEventListener('pointerdown',x.dehors,true); document.removeEventListener('keydown',x.clavier,true); window.removeEventListener('resize',x.fin);
    if (rendre && x.retour && x.retour.focus){ try { x.retour.focus({preventScroll:true}); } catch(e){} } }
  function menuCss(){ if (document.getElementById('jfs-ma-css')) return; var s=document.createElement('style'); s.id='jfs-ma-css';
    s.textContent='.jfs-ma{position:fixed;z-index:100096;min-width:210px;max-width:min(320px,92vw);max-height:70vh;overflow:auto;padding:5px;display:flex;flex-direction:column;background:var(--xr-surface,#0c1320);color:var(--xr-text,#e7f0ff);border:1px solid var(--xr-border,#22324f);border-radius:12px;box-shadow:0 12px 36px rgba(0,0,0,.55);font:13px var(--xr-font-ui,system-ui)}'
      +'.jfs-ma-t{padding:6px 10px 3px;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;color:var(--xr-muted,#8aa0c0)}'
      +'.jfs-ma-i{display:flex;align-items:center;gap:10px;min-height:38px;padding:7px 10px;border:0;border-radius:8px;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}'
      +'.jfs-ma-i:hover,.jfs-ma-i:focus{outline:none;background:color-mix(in srgb,var(--xr-accent,#3fe0d0) 14%,transparent)}.jfs-ma-i .l{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.jfs-ma-i .v{font-size:.7rem;color:var(--xr-muted,#8aa0c0)}'
      +'.jfs-ma hr{border:0;border-top:1px solid var(--xr-border,#22324f);margin:4px 6px}';
    document.head.appendChild(s); }
  function menuAvec(ancre,src,o){
    o=(o && typeof o==='object')?o:{}; fermerMenuAvec(false);
    var m=metaDe(src), dire=typeof o.dire==='function'?o.dire:dir0; if (!m) return Promise.resolve(null);
    return types().then(null,function(){ return null; }).then(function(){
      menuCss(); var el=document.createElement('div'); el.className='jfs-ma'; el.setAttribute('role','menu'); el.setAttribute('aria-label','ouvrir avec');
      var def=ploxionDe(m), l=candidats(m.nom,m.mime), e=fxExt(m.nom), cur=e?(prefs().ext[e]||''):''; if (cur && l.indexOf(cur)<0) cur='';
      if (coupe('fichiers.associations')) l=[est3d(m.nom,m.mime)?'vue-3d':'viewer'];
      function titre(t){ var h=document.createElement('div'); h.className='jfs-ma-t'; h.textContent=t; el.appendChild(h); }
      function item(label,val,act,attr,coche){ var b=document.createElement('button'); b.type='button'; b.className='jfs-ma-i'; b.setAttribute('role',coche==null?'menuitem':'menuitemradio');
        if (coche!=null) b.setAttribute('aria-checked',coche?'true':'false'); b.setAttribute(attr[0],attr[1]);
        var s=document.createElement('span'); s.className='l'; s.textContent=label; b.appendChild(s);
        if (val){ var v=document.createElement('span'); v.className='v'; v.textContent=val; b.appendChild(v); }
        b.addEventListener('click',function(ev){ ev.preventDefault(); ev.stopPropagation(); fermerMenuAvec(false); act(); }); el.appendChild(b); }
      titre('ouvrir '+m.nom.slice(0,40)+' avec');
  
      l.forEach(function(pid){ item(nomPx(pid),pid===def?'par défaut':'',function(){ if (typeof o.ouvrir==='function') o.ouvrir(pid); else ouvrir(src,{ avec:pid, depuis:o.depuis, io:o.io, copie:o.copie, dire:o.dire }); },['data-avec',pid]); });
      if (e && !coupe('fichiers.associations')){ el.appendChild(document.createElement('hr')); titre('toujours ouvrir les .'+e+' avec');
        l.forEach(function(pid){ item((pid===cur?'● ':'○ ')+nomPx(pid),'',function(){ toujours(e,pid); dire('↗ les .'+e+' s\'ouvrent maintenant avec '+nomPx(pid)+' (ton compte)'); },['data-toujours',pid],pid===cur); });
        item((cur?'○ ':'● ')+'par défaut ('+nomPx(l[0]||'viewer')+')','',function(){ toujours(e,null); dire('↗ les .'+e+' reprennent leur ploxion par défaut'); },['data-toujours','defaut'],!cur); }
      if (typeof o.voir==='function'){ el.appendChild(document.createElement('hr')); item('voir le contenu (brut)','',o.voir,['data-voir','1']); }
      document.body.appendChild(el);
      var vw=window.innerWidth||1280, vh=window.innerHeight||800, x=0, y=0, w=el.offsetWidth||240, h=el.offsetHeight||200;
      if (ancre && typeof ancre.getBoundingClientRect==='function'){ var r=ancre.getBoundingClientRect(); x=r.left; y=r.bottom+4; if (y+h>vh-8) y=Math.max(8,r.top-h-4); }
      else if (ancre && isFinite(ancre.x) && isFinite(ancre.y)){ x=+ancre.x; y=+ancre.y; }
      el.style.left=Math.max(8,Math.min(x,vw-w-8))+'px'; el.style.top=Math.max(8,Math.min(y,vh-h-8))+'px';
      var bs=function(){ return Array.prototype.slice.call(el.querySelectorAll('.jfs-ma-i')); };
      var x0={ el:el, retour:(ancre && ancre.focus)?ancre:null, fin:function(){ fermerMenuAvec(false); },
        dehors:function(ev){ if (!el.contains(ev.target)) fermerMenuAvec(false); },
        clavier:function(ev){ var l2=bs(), i=l2.indexOf(document.activeElement);
          if (ev.key==='Escape'){ ev.preventDefault(); ev.stopPropagation(); fermerMenuAvec(true); }
          else if (ev.key==='ArrowDown' || ev.key==='ArrowUp'){ ev.preventDefault(); ev.stopPropagation(); var n=l2.length; if (n) l2[i<0?0:(i+(ev.key==='ArrowDown'?1:n-1))%n].focus(); }
          else if (ev.key==='Tab') fermerMenuAvec(false); } };
      MA=x0; setTimeout(function(){ if (MA===x0){ document.addEventListener('pointerdown',x0.dehors,true); document.addEventListener('keydown',x0.clavier,true); window.addEventListener('resize',x0.fin); } },0);
      var p0=el.querySelector('[data-avec="'+def+'"]')||bs()[0]; try { if (p0) p0.focus({preventScroll:true}); } catch(e2){}
      return el; }); }
  API.ouvrir=ouvrir; API.types=types; API.typesSync=function(){ return TF; }; API.candidats=candidats; API.ploxionDe=ploxionDe; API.appDe=appDe;
  API.appPour=function(src){ return types().then(function(){ return appDe(src); },function(){ return null; }); };
  API.boxionChemin=boxionChemin; API.viewerPage=viewerPage;
  API.toujours=toujours; API.preferences=function(){ return prefsJson(); }; API.ouvrable=ouvrable; API.nomPx=nomPx; API.genreDe=genreDe;
  API.partout=function(){ return !coupe('fichiers.ouvrir-partout'); }; API.vu=vu; API.menuAvec=menuAvec; API.fermerMenuAvec=function(){ fermerMenuAvec(false); };

  // ===== picker UI =====
  var ov=null, st=null;
  function withS(dir){ return st.schema==='fs'?dir:(st.schema+':'+(dir||'/')); }
  function stripS(p){ var q=parse(p); return q.schema==='fs'?q.rest:q.rest; }
  function ensureOv(){ if (ov) return; injectCss();
    ov=document.createElement('div'); ov.id='jfs-ov'; ov.hidden=true;
    ov.innerHTML='<div class="jfs-panel"><div class="jfs-hd"><button class="jfs-up" title="dossier parent">↑</button><select class="jfs-mnt" data-mnt title="montage"></select>'
      +'<div class="jfs-bc" data-bc></div><button class="jfs-x" title="fermer">×</button></div>'
      +'<div class="jfs-tools"><button class="jfs-newf">＋ dossier</button><label class="jfs-upl">⬆ importer<input type="file" hidden multiple></label><span class="jfs-title" data-title></span></div>'
      +'<div class="jfs-list" data-list></div>'
      +'<div class="jfs-foot"><input class="jfs-name" data-name placeholder="nom du fichier" hidden><button class="jfs-cancel">Annuler</button><button class="jfs-ok" data-ok disabled>Ouvrir</button></div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e){ if(e.target===ov) close(null); });
    ov.querySelector('.jfs-x').onclick=function(){ close(null); };
    ov.querySelector('.jfs-cancel').onclick=function(){ close(null); };
    ov.querySelector('.jfs-up').onclick=function(){ var p=st.dir.replace(/\/[^\/]*$/,''); go(p||''); };
    ov.querySelector('[data-mnt]').onchange=function(e){ var s=e.target.value; if (SCHEMAS.indexOf(s)>=0){ st.schema=s; go(''); } };
    ov.querySelector('.jfs-newf').onclick=function(){ var n=prompt('Nom du dossier'); if(n){ API.mkdir(withS(join(st.dir,n))).then(function(){ go(st.dir); }); } };
    ov.querySelector('.jfs-upl input').onchange=function(e){ var fs=e.target.files; if(!fs||!fs.length) return; var done=0;
      Array.prototype.forEach.call(fs,function(f){ API.write(withS(join(st.dir,f.name)),f).then(function(){ if(++done===fs.length) go(st.dir); }); }); e.target.value=''; };
    ov.querySelector('[data-ok]').onclick=function(){ finish(); };
    ov.querySelector('[data-name]').addEventListener('input', function(){ updOk(); });
  }
  function injectCss(){ if(document.getElementById('jfs-css'))return; var s=document.createElement('style'); s.id='jfs-css';
    s.textContent='#jfs-ov{position:fixed;inset:0;z-index:100095;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,#000 60%,transparent);backdrop-filter:blur(5px);font-family:var(--xr-font-ui,system-ui)}'
      +'#jfs-ov[hidden]{display:none}.jfs-panel{width:min(560px,96vw);max-height:86vh;display:flex;flex-direction:column;background:var(--xr-surface,#0c1320);border:1px solid var(--xr-border,#22324f);border-radius:16px;overflow:hidden;color:var(--xr-text,#e7f0ff)}'
      +'.jfs-hd{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--xr-border,#22324f)}'
      +'.jfs-up,.jfs-x{cursor:pointer;border:1px solid var(--xr-border,#22324f);background:var(--xr-bg,#0b1220);color:var(--xr-text,#e7f0ff);width:32px;height:32px;border-radius:8px;font-size:16px;flex:none}'
      +'.jfs-mnt{max-width:38%;border:1px solid var(--xr-border,#22324f);background:var(--xr-bg,#0b1220);color:var(--xr-text,#e7f0ff);border-radius:8px;height:32px;padding:0 6px;font-size:.78rem}.jfs-mnt[hidden]{display:none}'
      +'.jfs-bc{flex:1;min-width:0;font-size:.82rem;color:var(--xr-muted,#8aa0c0);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.jfs-bc b{color:var(--xr-accent,#3fe0d0)}'
      +'.jfs-tools{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--xr-border,#22324f)}'
      +'.jfs-tools button,.jfs-upl,.jfs-reco{cursor:pointer;border:1px solid var(--xr-border,#22324f);background:var(--xr-bg,#0b1220);color:var(--xr-text,#e7f0ff);border-radius:8px;padding:6px 10px;font-size:.76rem}'
      +'.jfs-title{margin-left:auto;color:var(--xr-muted,#8aa0c0);font-size:.78rem}'
      +'.jfs-list{flex:1;min-height:120px;overflow:auto;padding:6px}'
      +'.jfs-it{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:9px;cursor:pointer;font-size:.88rem}'
      +'.jfs-it:hover{background:color-mix(in srgb,var(--xr-accent,#3fe0d0) 9%,transparent)}.jfs-it.sel{background:color-mix(in srgb,var(--xr-accent,#3fe0d0) 18%,transparent)}'
      +'.jfs-it .ic{font-size:1.1rem}.jfs-it .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.jfs-it .mt{font-size:.68rem;color:var(--xr-muted,#8aa0c0)}'
      +'.jfs-foot{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--xr-border,#22324f)}'
      +'.jfs-name{flex:1;min-width:0;background:var(--xr-bg,#0b1220);border:1px solid var(--xr-border,#22324f);border-radius:8px;color:var(--xr-text,#e7f0ff);padding:8px 10px;font-size:.86rem}'
      +'.jfs-cancel{margin-left:auto;cursor:pointer;border:1px solid var(--xr-border,#22324f);background:none;color:var(--xr-text,#e7f0ff);border-radius:8px;padding:8px 12px}'
      +'.jfs-ok{cursor:pointer;border:none;background:var(--xr-accent,#3fe0d0);color:#08111b;font-weight:800;border-radius:8px;padding:8px 14px}.jfs-ok:disabled{opacity:.5}';
    document.head.appendChild(s); }
  function extOk(name){ if(!st.ext||!st.ext.length) return true; var e=(name.split('.').pop()||'').toLowerCase(); return st.ext.indexOf(e)!==-1; }
  function fmtSize(b){ if(!b)return''; var u=['o','Ko','Mo','Go'],i=Math.floor(Math.log(b)/Math.log(1024)); return (b/Math.pow(1024,i)).toFixed(i?1:0)+u[i]; }
  function fillMounts(){ var sel=ov.querySelector('[data-mnt]'), ms=API.mounts().filter(function(m){ if (st.mode==='save' && m.capacites.write===false && m.schema!==st.schema) return false;   // on n'enregistre pas dans un miroir
      return m.etat==='pret'||m.etat==='a-reconnecter'||m.schema===st.schema; });
    sel.innerHTML=ms.map(function(m){ return '<option value="'+m.schema+'"'+(m.schema===st.schema?' selected':'')+'>'+m.icone+' '+esc(m.schema==='fs'?'mes fichiers':m.nom)+'</option>'; }).join('');
    sel.hidden=ms.length<2; }
  function go(dir){ st.dir=dir||''; st.sel=null; var m=META[st.schema], ro=!ecrivable(st.schema);   // miroir en lecture seule : pas de ＋ dossier ni d'import
    ov.querySelector('.jfs-newf').disabled=ro; ov.querySelector('.jfs-upl input').disabled=ro; ov.querySelector('.jfs-upl').style.opacity=ro?'.45':'';
    ov.querySelector('[data-bc]').innerHTML='<b>'+m.icone+' '+esc(st.schema==='fs'?'mes fichiers':m.nom)+'</b>'+(st.dir?st.dir.split('/').filter(Boolean).map(function(s){return ' / '+esc(s);}).join(''):'');
    var box=ov.querySelector('[data-list]'); box.innerHTML='<div class="jfs-it" style="opacity:.6">…</div>';
    if (st.schema==='local' && LOCAL.etat()!=='pret'){ box.innerHTML='<div style="padding:16px;text-align:center;font-size:.84rem;color:var(--xr-muted,#8aa0c0)">'+(LOCAL.etat()==='a-reconnecter'?'Le dossier xerboxion est à reconnecter.':'Aucun dossier xerboxion choisi sur ce PC.')+'<br><br><button class="jfs-reco" data-reco>'+(LOCAL.etat()==='a-reconnecter'?'🔓 Reconnecter Ce PC':'📂 Choisir le dossier xerboxion')+'</button></div>';
      box.querySelector('[data-reco]').onclick=function(){ (LOCAL.etat()==='a-reconnecter'?lcReconnect():lcConnect()).then(function(){ fillMounts(); go(st.dir); }); }; updOk(); return; }
    API.list(withS(st.dir)).then(function(d){ var dd=stripS(d.dir); st.dir=(dd==='/'?'':dd); var es=(d.entries||[]).filter(function(e){ return e.type==='dir'||extOk(e.name); });
      if(!es.length){ box.innerHTML='<div style="padding:16px;color:var(--xr-muted,#8aa0c0);font-size:.84rem;text-align:center">Dossier vide.</div>'; updOk(); return; }
      box.innerHTML=es.map(function(e){ return '<div class="jfs-it" data-p="'+esc(e.path)+'" data-t="'+e.type+'" data-n="'+esc(e.name)+'"><span class="ic">'+(e.type==='dir'?'📁':fileIcon(e.name))+'</span><span class="nm">'+esc(e.name)+'</span><span class="mt">'+(e.type==='dir'?'':fmtSize(e.size))+'</span></div>'; }).join('');
      box.querySelectorAll('[data-p]').forEach(function(el){ el.onclick=function(){ if(el.getAttribute('data-t')==='dir'){ go(stripS(el.getAttribute('data-p'))); } else { box.querySelectorAll('.jfs-it').forEach(function(x){x.classList.remove('sel');}); el.classList.add('sel'); st.sel=el.getAttribute('data-p'); if(st.mode==='save') ov.querySelector('[data-name]').value=el.getAttribute('data-n'); updOk(); } };
        el.ondblclick=function(){ if(el.getAttribute('data-t')==='file'){ st.sel=el.getAttribute('data-p'); finish(); } }; });
      updOk(); }); }
  function fileIcon(n){ var e=(n.split('.').pop()||'').toLowerCase(); if(['png','jpg','jpeg','gif','webp','svg'].indexOf(e)!==-1)return'🖼'; if(e==='pdf')return'📕'; if(['note'].indexOf(e)!==-1)return'🖊'; if(['xlsx','csv','xlc'].indexOf(e)!==-1)return'📊'; if(['pptx','deck'].indexOf(e)!==-1)return'📽'; if(['doc','docx','html','wdoc'].indexOf(e)!==-1)return'📄'; return'📄'; }
  function updOk(){ var ok=ov.querySelector('[data-ok]'); if(st.mode==='save'){ ok.textContent='Enregistrer'; ok.disabled=!(ov.querySelector('[data-name]').value.trim()); } else { ok.textContent='Ouvrir'; ok.disabled=!st.sel; } }
  function finish(){ if(st.mode==='save'){ var n=ov.querySelector('[data-name]').value.trim(); if(!n) return; if(st.ext&&st.ext.length&&n.indexOf('.')===-1) n+='.'+st.ext[0]; close(withS(join(st.dir,n))); } else { if(st.sel) close(st.sel); } }
  function openPicker(opts){ ensureOv(); return new Promise(function(resolve){
    var d=parse(opts.dir||''), schema=(opts.schema && SCHEMAS.indexOf(opts.schema)>=0)?opts.schema:d.schema;
    st={ mode:opts.mode==='save'?'save':'open', schema:schema, dir:(schema===d.schema?d.rest:'')||'', ext:opts.ext||null, resolve:resolve, ouvrir:opts.mode!=='save'&&opts.ouvrir?(typeof opts.ouvrir==='string'?opts.ouvrir:'pick'):'' };
    if (st.schema!=='fs' && st.dir==='/') st.dir='';
    ov.querySelector('[data-title]').textContent = st.mode==='save'?'Enregistrer sous':'Ouvrir un fichier';
    var ni=ov.querySelector('[data-name]'); ni.hidden = st.mode!=='save'; if(st.mode==='save'){ ni.value=opts.name||''; }
    fillMounts(); ov.hidden=false; go(st.dir); }); }
  function close(path){ if(!ov) return; ov.hidden=true; var r=st&&st.resolve, o=st&&st.ouvrir; st=null; if(path && o && API.partout()) ouvrir(path,{ depuis:o }); if(r) r(path||null); }

  setTimeout(xionProbe, 0);   // jOSXion peut être chargé après ce bion : sonde au tick suivant
  window.jOSFiles = API;
})();
;
