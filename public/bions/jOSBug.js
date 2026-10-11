/* bion jOSBug — servi seul pour ploxi0n (/px/bion-app/jOSBug.js) */
void 0;

;
(function () {
    if (window.jOSBug) return;
    var last = null, prompted = false;
    var IGNORE = /(Script error\.?$|ResizeObserver|WebGL|Failed to fetch|Load failed|NetworkError|geolocation)/i;

    function capture(msg, src, line, col, err) {
        msg = String(msg || (err && err.message) || '');
        if (!msg || IGNORE.test(msg)) return;                 // bruit connu / cross-origin sans détail
        last = { msg: msg, stack: (err && err.stack) ? String(err.stack) : '',
                 src: (src || '') + (line ? (':' + line + ':' + (col || 0)) : ''),
                 page: location.pathname + location.hash, t: Date.now() };
        offer();
    }
    window.addEventListener('error', function (e) { if (e) capture(e.message, e.filename, e.lineno, e.colno, e.error); });
    window.addEventListener('unhandledrejection', function (e) { var r = e && e.reason; capture((r && r.message) || (typeof r === 'string' ? r : ''), '', 0, 0, r); });

    function offer() {
        if (prompted || !document.body) return;                // au plus une invite par session (pas spam)
        prompted = true;
        var d = document.createElement('div');
        d.setAttribute('data-josbug', '1');
        d.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:100050;max-width:330px;'
          + 'background:#1a1420;color:#ffd9d9;border:1px solid rgba(255,120,120,.5);border-radius:13px;'
          + 'padding:12px 14px;font:13px/1.45 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.45)';
        d.innerHTML = '🐛 <b>Un bug ?</b> Envoie-le : la flotte d\'agents le corrige, et le xerboxion s\'améliore pour tout le monde.'
          + '<div style="display:flex;gap:8px;margin-top:10px">'
          + '<button data-send style="flex:1;cursor:pointer;border:0;border-radius:9px;padding:9px;background:#ff7a7a;color:#210;font-weight:800">signaler</button>'
          + '<button data-later style="cursor:pointer;border:1px solid rgba(255,255,255,.22);border-radius:9px;padding:9px 12px;background:transparent;color:inherit">plus tard</button>'
          + '</div>';
        document.body.appendChild(d);
        function close() { if (d.parentNode) d.parentNode.removeChild(d); }
        d.querySelector('[data-send]').onclick = function () { report(); close(); };
        d.querySelector('[data-later]').onclick = close;
        setTimeout(function () { if (d.parentNode) close(); }, 16000);   // se referme seul, discret
    }

    function report() {
        if (!last) return;
        var text = '🐞 Bug auto-capté (jeu/ploxion)\nPage : ' + last.page + '\nErreur : ' + last.msg
          + (last.src ? ('\nSource : ' + last.src) : '')
          + (last.stack ? ('\nStack :\n' + last.stack.slice(0, 1400)) : '');
        window.__botherPrefill = { kind: 'bug', text: text };
        if (window.jOSMobile && window.jOSMobile.open) window.jOSMobile.open('bother', 'Bother me');
        else if (window.jOS && window.jOS.openPloxion) window.jOS.openPloxion('bother');
    }

    // API : jOSBug.report() (déclenchable manuellement), jOSBug.last() (le dernier bug capté).
    window.jOSBug = { report: report, last: function () { return last; } };
})();
;
