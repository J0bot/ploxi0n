
(function () {
    'use strict';
    var ID = 'pomodoro', HOST = 'minuteur';
    function toast(el, m) {
        try { if (window.jOSb && jOSb.toast) return jOSb.toast(el, m); } catch (e) {}
        try { if (window.jOS && jOS.toast) return jOS.toast(m); } catch (e) {}
    }
    function mount(container) {
        container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;gap:6px;color:#8aa0c0;font:.85rem ui-sans-serif,system-ui">🍅 Pomodoro vit dans <b style="color:#3fe0d0">Minuteur</b> (onglet Pomodoro) — ouverture…</div>';
        toast(container, '🍅 Pomodoro = l\'onglet Pomodoro du Minuteur');
        var t = setTimeout(function () { try { if (window.jOS && jOS.openPloxion) jOS.openPloxion(HOST); } catch (e) {} }, 350);
        return { unmount: function () { clearTimeout(t); container.innerHTML = ''; } };
    }
    window.jOSApps = window.jOSApps || {};
    window.jOSApps[ID] = { manifest: { id: ID, name: 'Pomodoro', icon: '🍅' }, mount: mount };
})();
