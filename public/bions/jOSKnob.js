/* bion jOSKnob — servi seul pour ploxi0n (/px/bion-app/jOSKnob.js) */
void 0;
(function(){try{if(document.querySelector('style[data-bion-css="'+"jOSKnob"+'"]'))return;var s=document.createElement('style');s.setAttribute('data-bion-css',"jOSKnob");s.textContent="\n  .jkn{display:inline-flex;flex-direction:column;align-items:center;gap:3px;width:74px;user-select:none;font-family:var(--xr-font-ui,ui-sans-serif,system-ui)}\n  .jkn svg{cursor:ns-resize;touch-action:none}\n  .jkn__lab{font-size:.62rem;color:var(--xr-muted,#8fa0c8);text-align:center;line-height:1.1}\n  .jkn__val{font-size:.66rem;color:var(--xr-accent,#5fe0c0);font-variant-numeric:tabular-nums}\n  .jkn-panel{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start}\n";document.head.appendChild(s);}catch(e){}})();

;
(function () {
    'use strict';
    if (window.jOSKnob) return;
    var TAU = Math.PI * 2, A0 = Math.PI * 0.75, ASPAN = Math.PI * 1.5;   // arc de 270°

    function knobSVG(frac, shape) {
        var cx = 32, cy = 32, R = 26, ang = A0 + ASPAN * frac;
        var s = '<svg viewBox="0 0 64 64" width="64" height="64">';
        // le CORPS : KOIN (triangle) ou KION (octogone)
        var sides = shape === 'koin' ? 3 : 8, path = '';
        for (var i = 0; i < sides; i++) { var a = i / sides * TAU + (shape === 'koin' ? -Math.PI / 2 : TAU / 16), x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R; path += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }
        s += '<path d="' + path + 'Z" fill="rgba(20,32,54,.85)" stroke="rgba(120,150,255,.4)" stroke-width="1.4"/>';
        // koins-ticks (triangles autour) : marqueurs de l'arc
        for (var k = 0; k <= 10; k++) { var af = A0 + ASPAN * (k / 10), on = (k / 10) <= frac + 1e-6;
            var tx = cx + Math.cos(af) * (R + 4), ty = cy + Math.sin(af) * (R + 4);
            s += '<circle cx="' + tx.toFixed(1) + '" cy="' + ty.toFixed(1) + '" r="1.6" fill="' + (on ? 'var(--xr-accent,#5fe0c0)' : 'rgba(120,150,255,.3)') + '"/>'; }
        // arc de valeur
        var ax = cx + Math.cos(ang) * (R + 4), ay = cy + Math.sin(ang) * (R + 4);
        // aiguille
        s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + Math.cos(ang) * (R - 6)).toFixed(1) + '" y2="' + (cy + Math.sin(ang) * (R - 6)).toFixed(1) + '" stroke="var(--xr-accent,#5fe0c0)" stroke-width="2.4" stroke-linecap="round"/>';
        s += '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="var(--xr-accent,#5fe0c0)"/>';
        return s + '</svg>';
    }

    function create(host, opts) {
        opts = opts || {}; var min = opts.min != null ? opts.min : 0, max = opts.max != null ? opts.max : 1;
        var step = opts.step || (max - min) / 100, val = opts.value != null ? opts.value : (min + max) / 2;
        var fmt = opts.fmt || function (v) { return (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(2)); };
        var el = document.createElement('div'); el.className = 'jkn';
        el.innerHTML = '<div class="jkn__lab">' + (opts.label || '') + '</div><div data-k></div><div class="jkn__val" data-v></div>';
        var kEl = el.querySelector('[data-k]'), vEl = el.querySelector('[data-v]');
        function frac() { return max === min ? 0 : (val - min) / (max - min); }
        function paint() { kEl.innerHTML = knobSVG(Math.max(0, Math.min(1, frac())), opts.shape); vEl.textContent = fmt(val); }
        function set(v, silent) { v = Math.max(min, Math.min(max, v)); v = Math.round(v / step) * step; if (Math.abs(v - val) < 1e-12 && silent) return; val = v; paint(); if (!silent && opts.onChange) opts.onChange(val); }
        paint();
        var drag = false, sy = 0, sv = 0;
        kEl.addEventListener('pointerdown', function (e) { drag = true; sy = e.clientY; sv = val; try { kEl.setPointerCapture(e.pointerId); } catch (x) {} e.preventDefault(); });
        kEl.addEventListener('pointermove', function (e) { if (!drag) return; var dv = (sy - e.clientY) / 140 * (max - min); set(sv + dv); });
        kEl.addEventListener('pointerup', function () { drag = false; });
        kEl.addEventListener('wheel', function (e) { e.preventDefault(); set(val + (e.deltaY < 0 ? step * 3 : -step * 3)); }, { passive: false });
        kEl.setAttribute('tabindex', '0');
        kEl.addEventListener('keydown', function (e) { if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); set(val + step); } if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); set(val - step); } });
        if (host) host.appendChild(el);
        return { el: el, get: function () { return val; }, set: function (v) { set(v, true); }, min: min, max: max };
    }

    // BION-FONCTION → KNOBS : spec = [{key,label,min,max,value,step,fmt}] → panneau + onChange(values)
    function panel(host, spec, onChange, popts) {
        popts = popts || {}; var wrap = document.createElement('div'); wrap.className = 'jkn-panel'; var knobs = {}, vals = {};
        spec.forEach(function (p) { vals[p.key] = p.value != null ? p.value : ((p.min + p.max) / 2);
            knobs[p.key] = create(wrap, { label: p.label || p.key, min: p.min, max: p.max, value: vals[p.key], step: p.step, fmt: p.fmt, shape: p.shape || popts.shape,
                onChange: function (v) { vals[p.key] = v; if (onChange) onChange(vals, p.key); } }); });
        if (host) host.appendChild(wrap);
        return { el: wrap, values: vals, knobs: knobs, set: function (k, v) { if (knobs[k]) { knobs[k].set(v); vals[k] = v; } } };
    }

    window.jOSKnob = { create: create, panel: panel, svg: knobSVG };
})();
;
