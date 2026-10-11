
(function(){
  var ID='langues';
  // langues du monde : [code, nom natif, nom fr, drapeau]
  var LANGS=[
    ['fr','Français','français','🇫🇷'],['en','English','anglais','🇬🇧'],['es','Español','espagnol','🇪🇸'],
    ['de','Deutsch','allemand','🇩🇪'],['ru','Русский','russe','🇷🇺'],['pt','Português','portugais','🇵🇹'],
    ['it','Italiano','italien','🇮🇹'],['nl','Nederlands','néerlandais','🇳🇱'],['pl','Polski','polonais','🇵🇱'],
    ['zh','中文','chinois','🇨🇳'],['ja','日本語','japonais','🇯🇵'],['ko','한국어','coréen','🇰🇷'],
    ['ar','العربية','arabe','🇸🇦'],['hi','हिन्दी','hindi','🇮🇳'],['bn','বাংলা','bengali','🇧🇩'],
    ['tr','Türkçe','turc','🇹🇷'],['vi','Tiếng Việt','vietnamien','🇻🇳'],['th','ไทย','thaï','🇹🇭'],
    ['id','Indonesia','indonésien','🇮🇩'],['uk','Українська','ukrainien','🇺🇦'],['el','Ελληνικά','grec','🇬🇷'],
    ['he','עברית','hébreu','🇮🇱'],['sv','Svenska','suédois','🇸🇪'],['no','Norsk','norvégien','🇳🇴'],
    ['da','Dansk','danois','🇩🇰'],['fi','Suomi','finnois','🇫🇮'],['cs','Čeština','tchèque','🇨🇿'],
    ['ro','Română','roumain','🇷🇴'],['hu','Magyar','hongrois','🇭🇺'],['fa','فارسی','persan','🇮🇷'],
    ['ur','اردو','ourdou','🇵🇰'],['ta','தமிழ்','tamoul','🇮🇳'],['sw','Kiswahili','swahili','🇰🇪'],
    ['ca','Català','catalan','🇦🇩'],['eu','Euskara','basque','🏴'],['gl','Galego','galicien','🇪🇸'],
    ['hr','Hrvatski','croate','🇭🇷'],['sr','Српски','serbe','🇷🇸'],['sk','Slovenčina','slovaque','🇸🇰'],
    ['bg','Български','bulgare','🇧🇬'],['lt','Lietuvių','lituanien','🇱🇹'],['et','Eesti','estonien','🇪🇪'],
    ['is','Íslenska','islandais','🇮🇸'],['ga','Gaeilge','irlandais','🇮🇪'],['cy','Cymraeg','gallois','🏴'],
    ['af','Afrikaans','afrikaans','🇿🇦'],['ms','Melayu','malais','🇲🇾'],['fil','Filipino','philippin','🇵🇭'],
    ['eo','Esperanto','espéranto','🌍'],['la','Latina','latin','🏛️']
  ];
  // emoji 🇫🇷 → « fr » (indicateurs régionaux) ; null si pas un drapeau-pays (🏴 🌍 🏛️ restent emoji)
  function flagCc(em){var a=[],i=0,c;em=String(em||'');while(i<em.length){c=em.codePointAt(i);if(c<127462||c>127487)return null;a.push(String.fromCharCode(97+c-127462));i+=2;}return a.length===2?a.join(''):null;}
  // <img> SVG vendorisé + fallback emoji si 404 (Windows n'affiche pas les emoji drapeaux)
  function flagHtml(em,name){var cc=flagCc(em);if(!cc)return em;
    return '<img class="lng__fli" src="/vendor/flags/'+cc+'.svg" width="26" height="20" alt="'+name+'" loading="lazy" decoding="async" data-em="'+em+'" onerror="this.replaceWith(this.getAttribute(\'data-em\'))">';}
  function mount(container,ctx){
    var m=(window.__PLOXIONS__||[]).filter(function(p){return p.id===ID;})[0]||{};
    var active=(m.config&&m.config.locales)||['fr','en','de','es','ru'];
    var cur=document.documentElement.getAttribute('lang')||'fr';
    try{ var mt=document.querySelector('html'); if(mt&&mt.lang) cur=mt.lang.slice(0,2); }catch(e){}
    container.innerHTML=
      '<div class="lng"><div class="lng__bar"><span class="lng__t">🌐 Langues</span>'
      +'<input class="lng__s" placeholder="chercher une langue…" aria-label="chercher"></div>'
      +'<div class="lng__grid" id="lng-grid"></div>'
      +'<div class="lng__foot">'+active.length+' langues live · '+LANGS.length+' au total · le README existe en 15 langues</div></div>';
    var grid=container.querySelector('#lng-grid'), search=container.querySelector('.lng__s');
    function go(code){
      var u=new URL(window.location.href); u.searchParams.set('setlocale',code);
      window.location.href=u.toString();
    }
    function render(){
      var q=(search.value||'').toLowerCase(); grid.innerHTML='';
      LANGS.forEach(function(L){
        var code=L[0],nat=L[1],frn=L[2],fl=L[3];
        if(q && (code+' '+nat+' '+frn).toLowerCase().indexOf(q)<0) return;
        var on=active.indexOf(code)>=0;
        var d=document.createElement('div');
        d.className='lng__c'+(on?' on':' soon')+(code===cur?' cur':'');
        d.innerHTML='<span class="lng__fl">'+flagHtml(fl,frn)+'</span><span class="lng__nm"><span class="lng__na"></span><span class="lng__en"></span></span>'
          +'<span class="lng__badge">'+(on?'live':'bientôt')+'</span>';
        d.querySelector('.lng__na').textContent=nat;
        d.querySelector('.lng__en').textContent=frn+(code===cur?' · actuelle':'');
        d.addEventListener('click',function(){ go(code); });
        grid.appendChild(d);
      });
      if(!grid.children.length) grid.innerHTML='<div class="lng__foot">aucune langue trouvée</div>';
    }
    search.addEventListener('input',render); render();
    setTimeout(function(){try{search.focus();}catch(e){}},60);
    return { unmount:function(){ container.innerHTML=''; } };
  }
  window.jOSApps=window.jOSApps||{};
  window.jOSApps[ID]={manifest:{id:ID,name:'Langues',icon:'🌐'},mount:mount};
})();
