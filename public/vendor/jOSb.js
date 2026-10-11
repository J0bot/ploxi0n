/* jOSb — copié du labo (resources/views/ploxions/_bions.blade.php) par tools/extraire-ploxions.mjs */

(function () {
    if (window.jOSb) return;
    // esc échappe & < > " ' (relecture sécurité du social, 25.09.2026) : l'ancien (textContent → innerHTML) n'échappait NI " NI ',
    // or 159 ploxions l'appellent aussi DANS des attributs (value="…", data-x="…", title="…") → un nom, un titre ou une URL avec « " »
    // sortait de l'attribut (XSS ; le CSP autorise le script inline : l'échappement est la seule muraille). En texte (innerHTML),
    // &quot; / &#39; s'affichent pareil. Diagnostic par navigateur : localStorage 'xb:esc.ancien' = '1' → l'ancien comportement.
    var ESC_ANCIEN = false; try { ESC_ANCIEN = localStorage.getItem('xb:esc.ancien') === '1'; } catch (e) {}
    function esc(s) {
        if (ESC_ANCIEN) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
    }

    var B = {
        // ▢ voir : échapper du HTML / formater un temps
        esc: esc,
        fmtTime: function (s) { if (!isFinite(s)) return '–:--'; s = Math.max(0, s | 0); return (s / 60 | 0) + ':' + ('0' + (s % 60)).slice(-2); },

        // ✸ main : copier dans le presse-papier (avec fallback)
        copy: function (text) {
            try { return navigator.clipboard.writeText(text); }
            catch (e) { try { var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); } catch (e2) {} return Promise.resolve(); }
        },

        // ◐ lux : un toast transitoire dans un hôte (position relative auto)
        toast: function (host, msg, opts) {
            if (!host) return; opts = opts || {};
            try { if (getComputedStyle(host).position === 'static') host.style.position = 'relative'; } catch (e) {}
            var t = document.createElement('div'); t.textContent = msg;
            t.style.cssText = 'position:absolute;left:50%;' + (opts.bottom ? 'bottom:' + opts.bottom + 'px;' : 'top:46px;') + 'transform:translateX(-50%);z-index:40;'
                + 'padding:6px 13px;border-radius:18px;font-size:.74rem;color:#fff;border:1px solid rgba(255,255,255,.16);box-shadow:0 6px 22px rgba(0,0,0,.5);'
                + 'background:' + (opts.bad ? 'rgba(120,40,40,.96)' : 'rgba(20,80,60,.96)');
            host.appendChild(t);
            setTimeout(function () { t.style.transition = 'opacity .4s'; t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 400); }, opts.ms || 1600);
        },

        // ⛁ trace : état persistant JSON en localStorage -> { get(def), set(v) }
        store: function (key) {
            return {
                get: function (def) { try { var v = localStorage.getItem(key); return v == null ? def : JSON.parse(v); } catch (e) { return def; } },
                set: function (v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }
            };
        },

        // ♪ onde : s'enregistrer au Mixer (bus jOSSound) — boilerplate factorisé
        sound: function (opts) { try { return (window.jOSSound && window.jOSSound.register) ? window.jOSSound.register(opts) : function () {}; } catch (e) { return function () {}; } },

        // ♪ onde : un clic/bip WebAudio (métronome, minuteur, séquenceur…)
        beep: function (ac, o) {
            if (!ac) return; o = o || {}; var when = o.when || ac.currentTime;
            var osc = ac.createOscillator(), g = ac.createGain();
            osc.type = o.type || 'square'; osc.frequency.value = o.freq || 880;
            g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(o.vol || 0.4, when + 0.001);
            g.gain.exponentialRampToValueAtTime(0.0001, when + (o.dur || 0.06));
            osc.connect(g); g.connect(ac.destination); osc.start(when); osc.stop(when + (o.dur || 0.06) + 0.01);
        },

        // ⧗ tsoin : consommer le cue de replay d'un tsoin pour CE type de source.
        // fn(ref, posSeconds) si un cue de ce kind est présent. Renvoie true si consommé.
        cue: function (kind, fn) {
            if (window.__sndCue && window.__sndCue.kind === kind && window.__sndCue.ref) {
                var c = window.__sndCue; window.__sndCue = null; try { fn(c.ref, c.pos || 0); } catch (e) {} return true;
            }
            return false;
        },
        // ===== SOCLE étendu (revue « découvrir tous les bions » 2026-07) : les micro-bions
        // les plus RÉIMPLÉMENTÉS du labo, canonisés ici pour être adoptés (cf bions-census.json). =====
        pad2: function (n) { return ('0' + (n | 0)).slice(-2); },                       // ×12 : ('0'+x).slice(-2)
        clamp: function (v, min, max) { return v < min ? min : (v > max ? max : v); },   // ×41
        rid: function () { try { return crypto.randomUUID().slice(0, 8); } catch (e) { return Math.random().toString(36).slice(2, 10); } }, // ×18
        uuid: function () { try { return crypto.randomUUID(); } catch (e) { return 'x'.replace(/x/, function () { return Date.now().toString(36) + Math.random().toString(36).slice(2); }); } },
        csrf: function () { var m = document.querySelector('meta[name=csrf-token]'); return m ? m.getAttribute('content') : ''; }, // ×24
        ago: function (t) { // ×11 : « il y a Xs/min/h/j » (libellés unifiés)
            if (typeof t !== 'number') { var d = new Date(t); t = isNaN(d) ? Date.now() : d.getTime(); }
            var s = Math.max(0, (Date.now() - t) / 1000 | 0);
            if (s < 60) return 'il y a ' + s + 's';
            if (s < 3600) return 'il y a ' + (s / 60 | 0) + 'min';
            if (s < 86400) return 'il y a ' + (s / 3600 | 0) + 'h';
            return 'il y a ' + (s / 86400 | 0) + 'j';
        },
        fetchJSON: function (url, opts) { // ×91 : fetch -> json, throw si !ok
            return fetch(url, opts).then(function (r) { if (!r.ok) throw new Error(r.status + ' ' + url); return r.json(); });
        },
        postJSON: function (url, body, opts) { // POST JSON + CSRF auto (×24 avec csrf)
            opts = opts || {};
            var h = Object.assign({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': B.csrf() }, opts.headers || {});
            return fetch(url, { method: opts.method || 'POST', headers: h, body: typeof body === 'string' ? body : JSON.stringify(body || {}) })
                .then(function (r) { if (!r.ok) throw new Error(r.status + ' ' + url); return r.status === 204 ? null : r.json(); });
        },
        downloadBlob: function (blob, name) { // ×27 : télécharge + revoke (corrige les fuites)
            var url = URL.createObjectURL(blob), a = document.createElement('a');
            a.href = url; a.download = name || 'download'; document.body.appendChild(a); a.click(); a.remove();
            setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        },
        // envoyer N'IMPORTE QUOI au boxion (Blob/File/string/objet) — le bion universel
        saveToBoxion: function (data, name, cat) {
            if (!(window.jOSBoxion && jOSBoxion.authed && jOSBoxion.authed())) return Promise.resolve(null);
            var blob = (data instanceof Blob) ? data : new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 1)], { type: typeof data === 'string' ? 'text/plain' : 'application/json' });
            var f; try { f = new File([blob], name || 'donnees.json', { type: blob.type }); } catch (e) { f = blob; }
            return jOSBoxion.uploadFile(f, cat || 'docs', name || 'donnees.json').then(function (item) {
                try { if (item && window.jOSPorts) jOSPorts.emit('boxion', 'file-saved', JSON.stringify({ name: name, size: blob.size, cat: cat || 'docs' })); } catch (e2) {}
                return item;
            });
        },
        debounce: function (fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms || 200); }; }
    };
    window.jOSb = B;
})();
