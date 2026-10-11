
(function(){
'use strict';
var ID='couleurs';
/* XUI : getter live posé au mount (l'état-vérité reste dans le mount) ; null si pas monté */
var LIVE=null;

/* ── helpers couleur ──────────────────────────────────────────────── */
function clamp(v,a,b){return window.jOSb&&window.jOSb.clamp?window.jOSb.clamp(v,a,b):(v<a?a:(v>b?b:v));}

function rgbToHex(r,g,b){
    return '#'+[r,g,b].map(function(x){return ('0'+clamp(Math.round(x),0,255).toString(16)).slice(-2);}).join('');
}

function hexToRgb(hex){
    var h=String(hex||'').replace('#','').trim();
    if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if(!/^[0-9a-fA-F]{6}$/.test(h))return null;
    var n=parseInt(h,16);
    return{r:(n>>16)&255,g:(n>>8)&255,b:n&255};
}

function rgbToHsl(r,g,b){
    r/=255;g/=255;b/=255;
    var mx=Math.max(r,g,b),mn=Math.min(r,g,b),h,s,l=(mx+mn)/2,d=mx-mn;
    if(d===0){h=s=0;}else{
        s=l>0.5?d/(2-mx-mn):d/(mx+mn);
        switch(mx){
            case r:h=((g-b)/d+(g<b?6:0))/6;break;
            case g:h=((b-r)/d+2)/6;break;
            default:h=((r-g)/d+4)/6;
        }
    }
    return{h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};
}

function hslToRgb(h,s,l){
    s/=100;l/=100;h/=360;
    var r,g,b;
    if(s===0){r=g=b=l;}else{
        function hue2rgb(p,q,t){
            if(t<0)t+=1;if(t>1)t-=1;
            if(t<1/6)return p+(q-p)*6*t;
            if(t<1/2)return q;
            if(t<2/3)return p+(q-p)*(2/3-t)*6;
            return p;
        }
        var q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;
        r=hue2rgb(p,q,h+1/3);
        g=hue2rgb(p,q,h);
        b=hue2rgb(p,q,h-1/3);
    }
    return{r:Math.round(r*255),g:Math.round(g*255),b:Math.round(b*255)};
}

function hslToHex(h,s,l){var c=hslToRgb(h,s,l);return rgbToHex(c.r,c.g,c.b);}

/* luminance relative + ratio de contraste WCAG */
function relLum(r,g,b){
    var a=[r,g,b].map(function(v){
        v/=255;
        return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);
    });
    return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];
}
function contrastRatio(c1,c2){
    var l1=relLum(c1.r,c1.g,c1.b),l2=relLum(c2.r,c2.g,c2.b);
    var hi=Math.max(l1,l2),lo=Math.min(l1,l2);
    return (hi+0.05)/(lo+0.05);
}

/* ── générateurs palette ─────────────────────────────────────────── */
function palComplementaire(h,s,l){
    return[
        {hex:hslToHex(h,s,l),tip:'source'},
        {hex:hslToHex((h+180)%360,s,l),tip:'complément'},
        {hex:hslToHex(h,s,clamp(l-20,8,92)),tip:'source −20L'},
        {hex:hslToHex((h+180)%360,s,clamp(l+15,8,92)),tip:'complém +15L'}
    ];
}
function palAnalogues(h,s,l){
    return[
        {hex:hslToHex((h-40+360)%360,s,l),tip:'−40°'},
        {hex:hslToHex((h-20+360)%360,s,l),tip:'−20°'},
        {hex:hslToHex(h,s,l),tip:'source'},
        {hex:hslToHex((h+20)%360,s,l),tip:'+20°'},
        {hex:hslToHex((h+40)%360,s,l),tip:'+40°'}
    ];
}
function palTriade(h,s,l){
    return[
        {hex:hslToHex(h,s,l),tip:'source'},
        {hex:hslToHex((h+120)%360,s,l),tip:'+120°'},
        {hex:hslToHex((h+240)%360,s,l),tip:'+240°'}
    ];
}
function palTetrade(h,s,l){
    return[
        {hex:hslToHex(h,s,l),tip:'source'},
        {hex:hslToHex((h+90)%360,s,l),tip:'+90°'},
        {hex:hslToHex((h+180)%360,s,l),tip:'+180°'},
        {hex:hslToHex((h+270)%360,s,l),tip:'+270°'}
    ];
}
function palNuances(h,s,l){
    var steps=[];
    for(var i=0;i<8;i++){var ll=10+i*11;steps.push({hex:hslToHex(h,s,ll),tip:ll+'%L'});}
    return steps;
}
function palTeintes(h,s,l){
    /* saturation variable, L fixe */
    var steps=[];
    for(var i=0;i<7;i++){var ss=Math.round(i*100/6);steps.push({hex:hslToHex(h,ss,l),tip:ss+'%S'});}
    return steps;
}

var PAL_MODES=[
    {key:'complementaire',label:'Complément.',fn:palComplementaire},
    {key:'analogues',label:'Analogues',fn:palAnalogues},
    {key:'triade',label:'Triade',fn:palTriade},
    {key:'tetrade',label:'Tétrade',fn:palTetrade},
    {key:'nuances',label:'Nuances',fn:palNuances},
    {key:'teintes',label:'Teintes',fn:palTeintes}
];

/* ── copier ──────────────────────────────────────────────────────── */
function copyText(txt,badge){
    try{
        if(navigator.clipboard&&navigator.clipboard.writeText){
            navigator.clipboard.writeText(txt).then(function(){flash(badge);},function(){});
        }
    }catch(e){}
}
function flash(el){
    if(!el)return;
    el.classList.add('is-vis');
    setTimeout(function(){el.classList.remove('is-vis');},900);
}

/* ── mount ───────────────────────────────────────────────────────── */
function mount(container,ctx){
    /* état */
    var R=120,G=60,B=180;        /* couleur courante */
    var curPalMode='complementaire';
    /* contraste : 2 couleurs indépendantes */
    var cFg={r:231,g:240,b:255}, cBg={r:7,g:11,b:18};
    /* dégradé : 2 couleurs */
    var gA={r:63,g:224,b:208}, gB={r:120,g:60,b:180};
    /* port channel : rotation R→G→B quand les nombres arrivent un par un */
    var chanIdx=0;

    container.innerHTML=''
        +'<div class="pcol">'
            /* preview + valeurs copiables + input color natif + pipette */
            +'<div class="pcol__top">'
                +'<div class="pcol__preview" data-preview>'
                    +'<input class="pcol__pick" type="color" data-pick>'
                    +'<span class="pcol__picklbl" data-picklbl>＋ palette OS</span>'
                    +'<span class="pcol__eye" data-eye style="display:none">💧 pipette</span>'
                +'</div>'
                +'<div class="pcol__vals">'
                    +'<div class="pcol__chip" data-copy="hex"><span class="pcol__chip-label">HEX</span><span class="pcol__chip-val" data-hex>#783cb4</span><span class="pcol__copied" data-cp-hex>copié</span></div>'
                    +'<div class="pcol__chip" data-copy="rgb"><span class="pcol__chip-label">RGB</span><span class="pcol__chip-val" data-rgb>rgb(120,60,180)</span><span class="pcol__copied" data-cp-rgb>copié</span></div>'
                    +'<div class="pcol__chip" data-copy="hsl"><span class="pcol__chip-label">HSL</span><span class="pcol__chip-val" data-hsl>hsl(270,50%,47%)</span><span class="pcol__copied" data-cp-hsl>copié</span></div>'
                +'</div>'
            +'</div>'
            /* onglets principaux */
            +'<div class="pcol__tabs">'
                +'<button class="pcol__tab is-on" data-panel="pick">Sélecteur</button>'
                +'<button class="pcol__tab" data-panel="palette">Palettes</button>'
                +'<button class="pcol__tab" data-panel="contrast">Contraste</button>'
                +'<button class="pcol__tab" data-panel="gradient">Dégradé</button>'
            +'</div>'

            /* ── panneau sélecteur ─────────────────────────────────── */
            +'<div class="pcol__panel is-on" data-panel-c="pick">'
                +'<div class="pcol__sub">'
                    +'<button class="pcol__subtab is-on" data-mode-tab="rgb">RGB</button>'
                    +'<button class="pcol__subtab" data-mode-tab="hsl">HSL</button>'
                +'</div>'
                +'<div class="pcol__mode is-on" data-mode="rgb">'
                    +'<div class="pcol__row"><span class="pcol__lbl">R</span><input class="pcol__sld" type="range" min="0" max="255" data-r><span class="pcol__num" data-rv>120</span></div>'
                    +'<div class="pcol__row"><span class="pcol__lbl">G</span><input class="pcol__sld" type="range" min="0" max="255" data-g><span class="pcol__num" data-gv>60</span></div>'
                    +'<div class="pcol__row"><span class="pcol__lbl">B</span><input class="pcol__sld" type="range" min="0" max="255" data-b><span class="pcol__num" data-bv>180</span></div>'
                +'</div>'
                +'<div class="pcol__mode" data-mode="hsl">'
                    +'<div class="pcol__row"><span class="pcol__lbl">H</span><input class="pcol__sld" type="range" min="0" max="359" data-h><span class="pcol__num" data-hv>270</span></div>'
                    +'<div class="pcol__row"><span class="pcol__lbl">S</span><input class="pcol__sld" type="range" min="0" max="100" data-s><span class="pcol__num" data-sv>50</span></div>'
                    +'<div class="pcol__row"><span class="pcol__lbl">L</span><input class="pcol__sld" type="range" min="0" max="100" data-sl><span class="pcol__num" data-slv>47</span></div>'
                +'</div>'
                +'<div class="pcol__hint">Clic sur HEX/RGB/HSL = copie. Clic sur l\'aperçu = palette de l\'OS.</div>'
            +'</div>'

            /* ── panneau palettes ──────────────────────────────────── */
            +'<div class="pcol__panel" data-panel-c="palette">'
                +'<div class="pcol__pal-tabs" data-ptabs></div>'
                +'<div class="pcol__pal-grid" data-pal-grid></div>'
                +'<div class="pcol__hint">Clic sur une couleur = la sélectionner comme courante.</div>'
            +'</div>'

            /* ── panneau contraste ─────────────────────────────────── */
            +'<div class="pcol__panel" data-panel-c="contrast">'
                +'<div class="pcol__cpair">'
                    +'<div class="pcol__cside">'
                        +'<div class="pcol__cwell" data-fg-well><input type="color" data-fg></div>'
                        +'<div class="pcol__csmall"><span>Texte <span data-fg-hex></span></span><span class="pcol__cuse" data-fg-use>← courante</span></div>'
                    +'</div>'
                    +'<div class="pcol__cside">'
                        +'<div class="pcol__cwell" data-bg-well><input type="color" data-bg></div>'
                        +'<div class="pcol__csmall"><span>Fond <span data-bg-hex></span></span><span class="pcol__cuse" data-bg-use>← courante</span></div>'
                    +'</div>'
                +'</div>'
                +'<div class="pcol__cdemo" data-cdemo>'
                    +'<div class="pcol__cratio"><span class="pcol__cnum" data-cnum>—</span><span data-clev style="font-size:.78rem;opacity:.6">ratio</span></div>'
                    +'<b>Texte normal</b> &nbsp; <span>texte courant — exemple lisible ?</span>'
                +'</div>'
                +'<div class="pcol__cbadges" data-cbadges></div>'
            +'</div>'

            /* ── panneau dégradé ───────────────────────────────────── */
            +'<div class="pcol__panel" data-panel-c="gradient">'
                +'<div class="pcol__gprev" data-gprev></div>'
                +'<div class="pcol__grow">'
                    +'<div class="pcol__gstop"><div class="pcol__gwell" data-ga-well><input type="color" data-ga></div><span class="pcol__cuse" data-ga-use>courante →</span></div>'
                    +'<div class="pcol__gstop"><div class="pcol__gwell" data-gb-well><input type="color" data-gb></div><span class="pcol__cuse" data-gb-use>courante →</span></div>'
                +'</div>'
                +'<div class="pcol__grow">'
                    +'<span class="pcol__lbl" style="min-width:auto">Sens</span>'
                    +'<select class="pcol__sel" data-gdir>'
                        +'<option value="to right">→ droite</option>'
                        +'<option value="to bottom">↓ bas</option>'
                        +'<option value="135deg">⤢ 135°</option>'
                        +'<option value="to left">← gauche</option>'
                        +'<option value="circle">○ radial</option>'
                    +'</select>'
                +'</div>'
                +'<div class="pcol__code" data-gcode>background:...</div>'
                +'<div class="pcol__hint">Clic sur le code = copie le CSS.</div>'
            +'</div>'
        +'</div>';

    /* ── refs ─────────────────────────────────────────────────────── */
    var q=function(s){return container.querySelector(s);};
    var preview=q('[data-preview]'), pick=q('[data-pick]'), picklbl=q('[data-picklbl]'), eyeBtn=q('[data-eye]');
    var spanHex=q('[data-hex]'), spanRgb=q('[data-rgb]'), spanHsl=q('[data-hsl]');
    var cpHex=q('[data-cp-hex]'), cpRgb=q('[data-cp-rgb]'), cpHsl=q('[data-cp-hsl]');
    var sldR=q('[data-r]'), sldG=q('[data-g]'), sldB=q('[data-b]');
    var numR=q('[data-rv]'), numG=q('[data-gv]'), numB=q('[data-bv]');
    var sldH=q('[data-h]'), sldS=q('[data-s]'), sldL=q('[data-sl]');
    var numH=q('[data-hv]'), numS=q('[data-sv]'), numLL=q('[data-slv]');
    var palGrid=q('[data-pal-grid]'), palTabs=q('[data-ptabs]');
    /* contraste */
    var fgInp=q('[data-fg]'), bgInp=q('[data-bg]'), fgHex=q('[data-fg-hex]'), bgHex=q('[data-bg-hex]');
    var fgWell=q('[data-fg-well]'), bgWell=q('[data-bg-well]');
    var cdemo=q('[data-cdemo]'), cnum=q('[data-cnum]'), clev=q('[data-clev]'), cbadges=q('[data-cbadges]');
    /* dégradé */
    var gprev=q('[data-gprev]'), gaInp=q('[data-ga]'), gbInp=q('[data-gb]'), gdir=q('[data-gdir]'), gcode=q('[data-gcode]');
    var gaWell=q('[data-ga-well]'), gbWell=q('[data-gb-well]');

    sldR.value=R; sldG.value=G; sldB.value=B;

    /* ── dégradés de fond des sliders ─────────────────────────────── */
    function updateRgbGrads(){
        sldR.style.backgroundImage='linear-gradient(to right,'+rgbToHex(0,G,B)+','+rgbToHex(255,G,B)+')';
        sldG.style.backgroundImage='linear-gradient(to right,'+rgbToHex(R,0,B)+','+rgbToHex(R,255,B)+')';
        sldB.style.backgroundImage='linear-gradient(to right,'+rgbToHex(R,G,0)+','+rgbToHex(R,G,255)+')';
    }
    function updateHslGrads(){
        var h=+sldH.value,s=+sldS.value,l=+sldL.value,stops=[],i;
        for(i=0;i<=12;i++){stops.push(hslToHex(i*30,s,l));}
        sldH.style.backgroundImage='linear-gradient(to right,'+stops.join(',')+')';
        sldS.style.backgroundImage='linear-gradient(to right,'+hslToHex(h,0,l)+','+hslToHex(h,100,l)+')';
        sldL.style.backgroundImage='linear-gradient(to right,'+hslToHex(h,s,0)+','+hslToHex(h,s,50)+','+hslToHex(h,s,100)+')';
    }

    /* ── render couleur courante ──────────────────────────────────── */
    function render(){
        var hex=rgbToHex(R,G,B);
        var hsl=rgbToHsl(R,G,B);
        preview.style.background=hex;
        spanHex.textContent=hex;
        spanRgb.textContent='rgb('+R+', '+G+', '+B+')';
        spanHsl.textContent='hsl('+hsl.h+', '+hsl.s+'%, '+hsl.l+'%)';
        numR.textContent=R; numG.textContent=G; numB.textContent=B;
        numH.textContent=hsl.h; numS.textContent=hsl.s; numLL.textContent=hsl.l;
        sldH.value=hsl.h; sldS.value=hsl.s; sldL.value=hsl.l;
        try{pick.value=hex;}catch(e){}
        /* contraste du label pipette/palette pour rester lisible */
        var lum=relLum(R,G,B);
        var txt=lum>0.45?'#000':'#fff';
        picklbl.style.color=txt; eyeBtn.style.color=txt;
        updateRgbGrads(); updateHslGrads();
        renderPalette(hsl.h,hsl.s,hsl.l);
    }

    function setRGB(r,g,b){
        R=clamp(Math.round(r),0,255);G=clamp(Math.round(g),0,255);B=clamp(Math.round(b),0,255);
        sldR.value=R;sldG.value=G;sldB.value=B;
        render();
    }

    /* ── palettes ─────────────────────────────────────────────────── */
    function buildPalTabs(){
        palTabs.innerHTML='';
        PAL_MODES.forEach(function(m){
            var btn=document.createElement('button');
            btn.className='pcol__ptab'+(m.key===curPalMode?' is-on':'');
            btn.textContent=m.label;
            btn.setAttribute('data-pkey',m.key);
            btn.addEventListener('click',function(){
                curPalMode=m.key;
                container.querySelectorAll('.pcol__ptab').forEach(function(b){
                    b.classList.toggle('is-on',b.getAttribute('data-pkey')===curPalMode);
                });
                var hsl=rgbToHsl(R,G,B);
                renderPalette(hsl.h,hsl.s,hsl.l);
            });
            palTabs.appendChild(btn);
        });
    }
    function renderPalette(h,s,l){
        var mode=PAL_MODES.find(function(m){return m.key===curPalMode;})||PAL_MODES[0];
        var swatches=mode.fn(h,s,l);
        palGrid.innerHTML='';
        swatches.forEach(function(sw){
            var div=document.createElement('div');
            div.className='pcol__swatch';
            div.title='Sélectionner '+sw.hex;
            var box=document.createElement('div');
            box.className='pcol__swatch-box'; box.style.background=sw.hex;
            var hexLbl=document.createElement('div');
            hexLbl.className='pcol__swatch-hex'; hexLbl.textContent=sw.hex;
            var tip=document.createElement('div');
            tip.className='pcol__swatch-tip'; tip.textContent=sw.tip||'';
            div.appendChild(box); div.appendChild(hexLbl); div.appendChild(tip);
            div.addEventListener('click',function(){
                var c=hexToRgb(sw.hex);
                if(c)setRGB(c.r,c.g,c.b);
            });
            palGrid.appendChild(div);
        });
    }

    /* ── contraste WCAG ───────────────────────────────────────────── */
    function renderContrast(){
        var fgHexV=rgbToHex(cFg.r,cFg.g,cFg.b), bgHexV=rgbToHex(cBg.r,cBg.g,cBg.b);
        try{fgInp.value=fgHexV; bgInp.value=bgHexV;}catch(e){}
        /* peindre les wells (l'input color natif est opacity:0 → sans ça ils restent vides) */
        fgWell.style.background=fgHexV; bgWell.style.background=bgHexV;
        fgHex.textContent=fgHexV; bgHex.textContent=bgHexV;
        cdemo.style.background=bgHexV; cdemo.style.color=fgHexV;
        var ratio=contrastRatio(cFg,cBg);
        cnum.textContent=ratio.toFixed(2)+':1';
        /* seuils WCAG : AA normal 4.5, AA large 3, AAA normal 7, AAA large 4.5 */
        var defs=[
            {l:'AA normal',min:4.5},
            {l:'AA large',min:3},
            {l:'AAA normal',min:7},
            {l:'AAA large',min:4.5}
        ];
        var anyPass=false;
        cbadges.innerHTML='';
        defs.forEach(function(d){
            var pass=ratio>=d.min; if(pass)anyPass=true;
            var b=document.createElement('span');
            b.className='pcol__badge '+(pass?'pcol__badge--pass':'pcol__badge--fail');
            b.textContent=(pass?'✓ ':'✗ ')+d.l;
            cbadges.appendChild(b);
        });
        clev.textContent=anyPass?'lisible':'échoue partout';
    }

    /* ── dégradé ──────────────────────────────────────────────────── */
    function gradCss(){
        var a=rgbToHex(gA.r,gA.g,gA.b), b=rgbToHex(gB.r,gB.g,gB.b);
        var dir=gdir.value;
        if(dir==='circle')return 'radial-gradient(circle, '+a+', '+b+')';
        return 'linear-gradient('+dir+', '+a+', '+b+')';
    }
    function renderGradient(){
        var a=rgbToHex(gA.r,gA.g,gA.b), b=rgbToHex(gB.r,gB.g,gB.b);
        try{gaInp.value=a; gbInp.value=b;}catch(e){}
        gaWell.style.background=a; gbWell.style.background=b;
        var css=gradCss();
        gprev.style.background=css;
        gcode.textContent='background: '+css+';';
    }

    /* ── onglets principaux ───────────────────────────────────────── */
    container.querySelectorAll('[data-panel]').forEach(function(btn){
        btn.addEventListener('click',function(){
            var key=btn.getAttribute('data-panel');
            container.querySelectorAll('[data-panel]').forEach(function(b){b.classList.toggle('is-on',b.getAttribute('data-panel')===key);});
            container.querySelectorAll('[data-panel-c]').forEach(function(p){p.classList.toggle('is-on',p.getAttribute('data-panel-c')===key);});
            if(key==='contrast')renderContrast();
            if(key==='gradient')renderGradient();
        });
    });
    /* sous-onglets RGB/HSL */
    container.querySelectorAll('[data-mode-tab]').forEach(function(btn){
        btn.addEventListener('click',function(){
            var key=btn.getAttribute('data-mode-tab');
            container.querySelectorAll('[data-mode-tab]').forEach(function(b){b.classList.toggle('is-on',b.getAttribute('data-mode-tab')===key);});
            container.querySelectorAll('[data-mode]').forEach(function(m){m.classList.toggle('is-on',m.getAttribute('data-mode')===key);});
        });
    });

    /* ── listeners sélecteur ──────────────────────────────────────── */
    sldR.addEventListener('input',function(){R=+sldR.value;render();});
    sldG.addEventListener('input',function(){G=+sldG.value;render();});
    sldB.addEventListener('input',function(){B=+sldB.value;render();});
    function fromHsl(){var c=hslToRgb(+sldH.value,+sldS.value,+sldL.value);setRGB(c.r,c.g,c.b);}
    sldH.addEventListener('input',fromHsl);
    sldS.addEventListener('input',fromHsl);
    sldL.addEventListener('input',fromHsl);

    /* input color natif (palette OS) */
    pick.addEventListener('input',function(){var c=hexToRgb(pick.value);if(c)setRGB(c.r,c.g,c.b);});
    function openPick(){try{pick.click();}catch(e){}}
    preview.addEventListener('click',function(e){if(e.target===eyeBtn)return;openPick();});
    picklbl.addEventListener('click',function(e){e.stopPropagation();openPick();});

    /* pipette EyeDropper si dispo */
    if(typeof window!=='undefined' && 'EyeDropper' in window){
        eyeBtn.style.display='';
        eyeBtn.addEventListener('click',function(e){
            e.stopPropagation();
            try{
                var ed=new window.EyeDropper();
                ed.open().then(function(res){
                    var c=hexToRgb(res.sRGBHex);
                    if(c)setRGB(c.r,c.g,c.b);
                }).catch(function(){});
            }catch(err){}
        });
    }

    /* copie chips */
    q('[data-copy="hex"]').addEventListener('click',function(){copyText(spanHex.textContent,cpHex);});
    q('[data-copy="rgb"]').addEventListener('click',function(){copyText(spanRgb.textContent,cpRgb);});
    q('[data-copy="hsl"]').addEventListener('click',function(){copyText(spanHsl.textContent,cpHsl);});

    /* contraste : inputs + boutons "courante" */
    fgInp.addEventListener('input',function(){var c=hexToRgb(fgInp.value);if(c){cFg=c;renderContrast();}});
    bgInp.addEventListener('input',function(){var c=hexToRgb(bgInp.value);if(c){cBg=c;renderContrast();}});
    q('[data-fg-use]').addEventListener('click',function(){cFg={r:R,g:G,b:B};renderContrast();});
    q('[data-bg-use]').addEventListener('click',function(){cBg={r:R,g:G,b:B};renderContrast();});

    /* dégradé : inputs + boutons "courante" + sens + copie */
    gaInp.addEventListener('input',function(){var c=hexToRgb(gaInp.value);if(c){gA=c;renderGradient();}});
    gbInp.addEventListener('input',function(){var c=hexToRgb(gbInp.value);if(c){gB=c;renderGradient();}});
    q('[data-ga-use]').addEventListener('click',function(){gA={r:R,g:G,b:B};renderGradient();});
    q('[data-gb-use]').addEventListener('click',function(){gB={r:R,g:G,b:B};renderGradient();});
    gdir.addEventListener('change',renderGradient);
    gcode.addEventListener('click',function(){copyText(gcode.textContent,null);gcode.style.borderColor='var(--xr-accent,#3fe0d0)';setTimeout(function(){gcode.style.borderColor='';},700);});

    /* ── bus : port d'entrée channel (hasard.result → couleur aléatoire) ──
       accepte {r,g,b}, une liste de nombres, un nombre seul (rotation R→G→B),
       ou un hex ; ignore le reste. __wired/__via (routeur) jamais lus. */
    function numsFrom(p){
        var out=[],i;
        function push(v){var n=+v;if(isFinite(n))out.push(n);}
        if(p===null||p===undefined)return out;
        if(typeof p==='number'||typeof p==='string'){push(p);return out;}
        if(Object.prototype.toString.call(p)==='[object Array]'){p.forEach(push);return out;}
        if(typeof p==='object'){
            if(p.r!==undefined&&p.g!==undefined&&p.b!==undefined){push(p.r);push(p.g);push(p.b);return out;}
            var lists=['values','channels','results','rolls'];
            for(i=0;i<lists.length;i++){
                var l=p[lists[i]];
                if(Object.prototype.toString.call(l)==='[object Array]'){l.forEach(push);if(out.length)return out;}
            }
            var singles=['value','result','total','n'];
            for(i=0;i<singles.length;i++){
                if(p[singles[i]]!==undefined&&p[singles[i]]!==null){push(p[singles[i]]);if(out.length)return out;}
            }
        }
        return out;
    }
    function onChannel(payload){
        /* un hex direct (tirage parmi des couleurs) gagne */
        var hx=null;
        if(typeof payload==='string')hx=hexToRgb(payload);
        else if(payload&&typeof payload==='object')hx=hexToRgb(payload.hex||payload.color||'');
        if(hx){chanIdx=0;setRGB(hx.r,hx.g,hx.b);return;}
        var nums=numsFrom(payload),i;
        if(!nums.length)return; /* payload sans nombre : ignoré */
        if(nums.length>=3){
            chanIdx=0;
            setRGB(nums[0],nums[1],nums[2]);
        }else{
            var rgb=[R,G,B];
            for(i=0;i<nums.length;i++){rgb[chanIdx]=nums[i];chanIdx=(chanIdx+1)%3;}
            setRGB(rgb[0],rgb[1],rgb[2]);
        }
    }
    var offs=[];
    try{
        if(window.jOSPorts&&window.jOSPorts.on){
            offs.push(window.jOSPorts.on('ploxion.couleurs.channel',function(payload){
                try{onChannel(payload);}catch(e){}
            }));
        }
    }catch(e){}

    /* ── init ─────────────────────────────────────────────────────── */
    buildPalTabs();
    render();
    renderContrast();
    renderGradient();

    /* XUI : expose la couleur courante au describe() (lecture seule) */
    LIVE={ color:function(){ return { r:R, g:G, b:B }; } };

    return {
        unmount:function(){
            LIVE=null;
            offs.forEach(function(off){try{if(typeof off==='function')off();}catch(e){}});
            offs=[];
            container.innerHTML='';
        }
    };
}

/* ===== XUI (contrat v0) : describe() PUR — couleur courante via LIVE (posé au mount),
   défaut honnête sinon. Le port BUS ploxion.couleurs.channel accepte {r,g,b}/hex/nombre :
   les actions poussent une vraie couleur dedans. Ne lève jamais. ===== */
function describe(){
    try{
        var c=LIVE?LIVE.color():{r:120,g:60,b:180};
        var hex=rgbToHex(c.r,c.g,c.b);
        var hsl=rgbToHsl?rgbToHsl(c.r,c.g,c.b):null;
        var items=[
            { p:1, kind:'stat', label:'🎨 couleur', value:hex+(LIVE?'':' (défaut)') },
            { p:2, kind:'stat', label:'rgb', value:c.r+' · '+c.g+' · '+c.b },
            { p:2, kind:'action', label:'teal', act:{ port:'ploxion.couleurs.channel', payload:{ r:63, g:224, b:208, src:'xui' } } },
            { p:3, kind:'action', label:'magenta', act:{ port:'ploxion.couleurs.channel', payload:{ r:255, g:0, b:200, src:'xui' } } }
        ];
        if(hsl) items.push({ p:3, kind:'stat', label:'hsl', value:Math.round(hsl.h)+'° '+Math.round(hsl.s)+'% '+Math.round(hsl.l)+'%' });
        items.push({ p:4, kind:'text', label:'sélecteur RGB/HSL · palettes · contraste · dégradés · pipette OS' });
        return { v:1, id:ID, title:'Couleurs', icon:'🎨', items:items };
    }catch(e){
        return { v:1, id:ID, title:'Couleurs', icon:'🎨', items:[{ p:1, kind:'text', label:'Couleurs' }] };
    }
}

window.jOSApps=window.jOSApps||{};
window.jOSApps['couleurs']={manifest:{id:'couleurs',name:'Couleurs',icon:'🎨'},mount:mount,describe:describe};
})();
