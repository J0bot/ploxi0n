// COPIE du bion jOSPlayer du labo (https://labo.j0bot.ch/px/bion-app/jOSPlayer.js, relevée le 13.10.2026) : les tests branchent le VRAI bion,
// pas une API inventée (0.49 testait un { open, embed } qui n'existe pas au labo — d'où un plugion qui n'enveloppait rien).
/* bion jOSPlayer — servi seul pour ploxi0n (/px/bion-app/jOSPlayer.js) */
void 0;

;
    window.jOSPlayer = window.jOSPlayer || {
        _pending: null, _live: null, _hist: null,
        play: function (url, opts) {
            if (!url && !(opts && (opts.ytid || opts.list || opts.channel))) return;   // YouTube/TV : url vide + ytid/channel OK
            this._record(url, opts || {});
            var req = { url: url, opts: opts || {} };
            if (this._live) { this._live(req); }          // un lecteur est monté -> charge direct
            else { this._pending = req;                    // sinon on ouvre le ploxion
                if (window.jOSMobile && window.jOSMobile.open) window.jOSMobile.open('player', 'Lecteur');
                else if (window.jOS && window.jOS.openPloxion) window.jOS.openPloxion('player'); }
        },
        history: function () { if (this._hist) return this._hist; try { this._hist = JSON.parse(localStorage.getItem('player:history')) || []; } catch (e) { this._hist = []; } return this._hist; },
        clearHistory: function () { this._hist = []; try { localStorage.removeItem('player:history'); } catch (e) {} try { if (window.jOSBoxion && window.jOSBoxion.saveSoon) window.jOSBoxion.saveSoon('player', 'history', [], 'Historique lecteur'); } catch (e) {} try { window.dispatchEvent(new CustomEvent('jos:player:history')); } catch (e) {} },
        // position de reprise par média (url -> secondes)
        mark: function (url, sec) { if (!url || !sec) return; try { var r = JSON.parse(localStorage.getItem('player:resume') || '{}'); r[url] = Math.floor(sec); localStorage.setItem('player:resume', JSON.stringify(r)); if (window.jOSBoxion && window.jOSBoxion.saveSoon) window.jOSBoxion.saveSoon('player', 'resume', r, 'Reprises lecteur'); } catch (e) {} },
        resumeAt: function (url) { try { return (JSON.parse(localStorage.getItem('player:resume') || '{}'))[url] || 0; } catch (e) { return 0; } },
        _record: function (url, opts) {
            try {
                var h = this.history();
                var item = { url: url || '', title: (opts && opts.title) || url || 'lecture', ytid: (opts && opts.ytid) || '', ts: Math.floor(Date.now() / 1000) };
                if (!item.url && !item.ytid) return;
                h = h.filter(function (x) { return (x.url || '') !== item.url || (x.ytid || '') !== item.ytid; });
                h.unshift(item); if (h.length > 120) h = h.slice(0, 120);
                this._hist = h;
                try { localStorage.setItem('player:history', JSON.stringify(h)); } catch (e) {}
                try { if (window.jOSBoxion && window.jOSBoxion.saveSoon) window.jOSBoxion.saveSoon('player', 'history', h, 'Historique lecteur'); } catch (e) {}
                try { window.dispatchEvent(new CustomEvent('jos:player:history')); } catch (e) {}
            } catch (e) {}
        }
    };
    // hydrate l'historique depuis le boxion (cross-appareil) au chargement
    (function () { try {
        if (!(window.jOSBoxion && window.jOSBoxion.load)) return;
        Promise.resolve(window.jOSBoxion.load('player', 'history')).then(function (v) {
            var r = Array.isArray(v) ? v : (v && Array.isArray(v.data) ? v.data : null);
            if (r && r.length) { window.jOSPlayer._hist = r; try { localStorage.setItem('player:history', JSON.stringify(r)); } catch (e) {} try { window.dispatchEvent(new CustomEvent('jos:player:history')); } catch (e) {} }
        }).catch(function () {});
    } catch (e) {} })();
    // PLUGION : le lecteur déclare son entrée « play » (type stream) → câblable dans la forge à plugion
    (function preg(){ try { if (window.jOSPlug) { window.jOSPlug.register('player', { name: 'Lecteur 🎞️', inputs: [{ port: 'play', type: 'stream', label: 'lire', fn: function (s) { if (window.jOSPlayer) window.jOSPlayer.play((s && s.url) || s, { title: (s && s.title) || '' }); } }] }); return; } } catch (e) {} setTimeout(preg, 700); })();
;
