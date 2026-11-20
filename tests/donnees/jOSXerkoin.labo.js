// COPIE du bion jOSXerkoin du labo (resources/views/partials/_xerkoin_bion.blade.php, servi par /px/bion-app/jOSXerkoin.js, relevée le
// 20.11.2026) : les tests du trou entre les koins (tests/koin-trou.test.mjs) branchent le VRAI bion (pour, bande, lancer), pas une API inventée.
/* bion jOSXerkoin — servi seul pour ploxi0n (/px/bion-app/jOSXerkoin.js) */
(function () {
    'use strict';
    if (window.jOSXerkoin) return;
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    // ── les cellules (viewBox 100) : contour + contours imbriqués ; les places d'action = data-slot ──
    var tri = function (a, cls) { return '<polygon points="' + a.map(function (p) { return p.join(','); }).join(' ') + '"' + (cls || '') + '/>'; };
    var vers = function (pts, c, k) { return pts.map(function (p) { return [c[0] + (p[0] - c[0]) * k, c[1] + (p[1] - c[1]) * k]; }); };   // un contour intérieur
    var cen = function (pts) { return [(pts[0][0] + pts[1][0] + pts[2][0]) / 3, (pts[0][1] + pts[1][1] + pts[2][1]) / 3]; };
    // (20.11) les glyphes se règlent dans le ploxion alien (RS-7 #2004 « mes glyphes des koins, c'est dans le ploxion alien qu'on peut paramétrer ça ») :
    // R = les contours (k1 le koin, k2 l'intérieur, k3 le centre) et l'arrondi du cadre ; xb:alien:glyphes sur l'appareil, les défauts sinon
    var R = { k1: .92, k2: .55, k3: .2, rond: 3 };
    function koin(pts, slot) { var c = cen(pts); return tri(vers(pts, c, R.k1), ' data-slot="' + slot + '"') + tri(vers(pts, c, R.k2), ' class="i"') + (R.k3 > 0.01 ? tri(vers(pts, c, R.k3), ' class="p"') : ''); }
    var CELLS = {
        wormion: { n: '◎ wormion', slots: 0, svg: function () { return '<rect x="4" y="4" width="92" height="92" rx="' + R.rond + '"/><circle cx="50" cy="50" r="38"/><circle class="i" cx="52" cy="48" r="27"/><circle class="i" cx="53" cy="47" r="17"/><circle class="i" cx="54" cy="46" r="8"/><circle class="p" cx="54" cy="46" r="2.5"/>'; } },
        portion: { n: '▣ portion', slots: 0, svg: function () { return '<rect x="4" y="4" width="92" height="92" rx="' + R.rond + '"/><rect x="16" y="16" width="68" height="68"/><rect class="i" x="30" y="30" width="40" height="40"/><rect class="p" x="45" y="45" width="10" height="10"/>'; } },
        portions: { n: '⊞ quatre portions', slots: 0, svg: function () { var s = '<rect x="4" y="4" width="92" height="92" rx="' + R.rond + '"/>'; [[14, 14], [54, 14], [14, 54], [54, 54]].forEach(function (p) { s += '<rect x="' + p[0] + '" y="' + p[1] + '" width="32" height="32"/><rect class="i" x="' + (p[0] + 9) + '" y="' + (p[1] + 9) + '" width="14" height="14"/>'; }); return s; } },
        carre: { n: '◩ deux koins', slots: 2, svg: function () { return '<rect x="4" y="4" width="92" height="92" rx="' + R.rond + '"/>' + koin([[8, 12], [8, 92], [88, 92]], 0) + koin([[12, 8], [92, 8], [92, 88]], 1); } },
        carre2: { n: '◪ deux koins', slots: 2, svg: function () { return '<rect x="4" y="4" width="92" height="92" rx="' + R.rond + '"/>' + koin([[8, 8], [88, 8], [8, 88]], 0) + koin([[92, 12], [92, 92], [12, 92]], 1); } },
        x: { n: '⨯ quatre koins', slots: 4, svg: function () { return '<rect x="4" y="4" width="92" height="92" rx="' + R.rond + '"/>' + koin([[10, 8], [90, 8], [50, 46]], 0) + koin([[92, 10], [92, 90], [54, 50]], 1) + koin([[90, 92], [10, 92], [50, 54]], 2) + koin([[8, 90], [8, 10], [46, 50]], 3); } },
        sablier: { n: '⧗ sablier', slots: 2, svg: function () { return '<rect x="4" y="4" width="92" height="92" rx="' + R.rond + '"/>' + koin([[14, 8], [86, 8], [50, 46]], 0) + koin([[86, 92], [14, 92], [50, 54]], 1) + '<path class="i" d="M8 18 Q30 50 8 82"/><path class="i" d="M92 18 Q70 50 92 82"/><circle class="p" cx="50" cy="50" r="2.5"/>'; } },
        losange: { n: '◇ losange · ploxion',   /* (20.11, RS-7 #2130 « losange c'est ploxion ») */ slots: 4, svg: function () { return '<rect x="4" y="4" width="92" height="92" rx="' + R.rond + '"/><polygon points="50,14 86,50 50,86 14,50"/><polygon class="i" points="50,28 72,50 50,72 28,50"/><rect class="p" x="46" y="46" width="8" height="8" transform="rotate(45 50 50)"/>' + koin([[8, 8], [42, 8], [8, 42]], 0) + koin([[92, 8], [92, 42], [58, 8]], 1) + koin([[92, 92], [58, 92], [92, 58]], 2) + koin([[8, 92], [8, 58], [42, 92]], 3); } }
    };
    var ORDRE = ['wormion', 'carre', 'carre2', 'x', 'sablier', 'losange', 'portions', 'portion'];
    // les bandes du carnet (page « les xers de koins », 15.11)
    var CARNET = [['wormion', 'carre', 'portion'], ['wormion', 'portion'], ['carre', 'portions', 'carre2'], ['carre', 'portion', 'carre2'], ['wormion', 'x', 'portion'], ['carre', 'sablier', 'portion'],
        ['wormion', 'carre', 'portions'], ['wormion', 'sablier', 'portion'], ['x', 'losange', 'x'], ['wormion', 'sablier', 'wormion'], ['wormion', 'sablier', 'portion'], ['wormion', 'x', 'carre2', 'portion'], ['wormion', 'sablier', 'losange']];
    // LES 64 (15.11, RS-7 : « générer tous les xerkoins possibles… que ça fasse 64, comme ça on est au max ») : 4 cellules par place, 3 places ;
    // n° 1 = wormion | ⨯ | portion, la bande de base (« partout la même chose au début »)
    var G4 = ['wormion', 'carre', 'sablier', 'x'], M4 = ['x', 'carre', 'sablier', 'losange'], D4 = ['portion', 'portions', 'carre2', 'losange'];
    var XK64 = []; for (var n0 = 0; n0 < 64; n0++) XK64.push([G4[Math.floor(n0 / 16)], M4[Math.floor(n0 / 4) % 4], D4[n0 % 4]]);
    // AUTO (15.11, « le xerkoin doit être généré automatiquement ») : parmi les 64, celles qui ont juste assez de koins pour les actions ; l'empreinte
    // du nom départage (deux ploxions pareils n'ont pas forcément la même bande) ; un choix à la main l'emporte
    function h32(s2) { var h = 2166136261 >>> 0; for (var i = 0; i < s2.length; i++) { h ^= s2.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
    function autoN(id, nActs) { var sl = XK64.map(function (b) { return b.reduce(function (a, c) { return a + ({ carre: 2, carre2: 2, sablier: 2, x: 4, losange: 4 }[c] || 0); }, 0); });
        var ok = sl.map(function (v, i) { return v >= nActs ? i : -1; }).filter(function (i) { return i >= 0; }); if (!ok.length) ok = [sl.indexOf(Math.max.apply(null, sl))];
        var mn = Math.min.apply(null, ok.map(function (i) { return sl[i]; })), c2 = ok.filter(function (i) { return sl[i] === mn; }); return c2[h32(String(id)) % c2.length]; }
    function bande(cells, o) { o = o || {}; var k = 0; return '<div class="xk__b" style="--t:' + (o.t || 64) + 'px">' + cells.map(function (c, ci) { var C = CELLS[c]; if (!C) return ''; var s = C.svg();
        if (C.slots) s = s.replace(/data-slot="(\d)"/g, function (m, i) { var n = k++, a = o.acts && o.acts[n]; return 'data-slot="' + n + '"' + (o.acts ? (a ? ' data-a="' + n + '"' : ' class="vide"') : '') + (a ? '><title>' + esc(a.label) + '</title></polygon' : ''); }).replace(/(<title>[^<]*<\/title><\/polygon)\/>/g, '$1>');
        return '<svg viewBox="0 0 100 100" data-cell="' + ci + '">' + s + (o.ouvre && c.indexOf('portion') === 0 && ci === cells.length - 1 ? '<rect x="4" y="4" width="92" height="92" fill="transparent" stroke="none" data-ouvre style="cursor:pointer"><title>ouvrir</title></rect>' : '') + '</svg>'; }).join('') + '</div>'; }
    var slots = function (cells) { return cells.reduce(function (a, c) { return a + (CELLS[c] ? CELLS[c].slots : 0); }, 0); };
    // ── un ploxion en koins : describe() → actions ; la bande qui les tient ──
    function auto(n) { if (n <= 0) return ['wormion', 'portion']; if (n <= 2) return ['wormion', 'carre', 'portion']; if (n <= 4) return ['wormion', 'x', 'portion']; if (n <= 6) return ['wormion', 'carre', 'x', 'portion']; if (n <= 8) return ['wormion', 'x', 'x', 'portion']; return ['wormion', 'x', 'losange', 'x', 'portion']; }
    function chargerDescribe(id) { var A = window.jOSApps && window.jOSApps[id]; if (A && A.describe) return Promise.resolve(A);
        return new Promise(function (ok) { var s = document.createElement('script'); s.src = '/px/' + encodeURIComponent(id) + '/app.js'; s.onload = function () { ok(window.jOSApps && window.jOSApps[id]); }; s.onerror = function () { ok(null); }; document.head.appendChild(s); setTimeout(function () { ok(window.jOSApps && window.jOSApps[id]); }, 6000); }); }
    function lireItems(A, id) { var d = null; try { d = A && A.describe ? A.describe() : null; } catch (e) { d = null; } var it = (d && d.items) || [], acts = [], stats = [];
        (function f(l) { (l || []).forEach(function (x) { if (!x) return; if (x.act && x.act.port) acts.push(x); else if (x.kind === 'stat' || x.value != null) stats.push(x); if (x.items) f(x.items); }); })(it);
        acts.sort(function (a, b) { return (a.p || 9) - (b.p || 9); }); stats.sort(function (a, b) { return (a.p || 9) - (b.p || 9); }); return { d: d, acts: acts.slice(0, 16), stats: stats }; }
    function nDe(id, nActs) { var V = {}; try { V = JSON.parse(localStorage.getItem('xerkoin:valid') || '{}') || {}; } catch (e) {} var v = V[id] || {}; return v.manuel && v.n != null ? v.n : autoN(id, nActs); }
    // une bande COMPOSÉE dans l'atelier (V[id].cells, et l'ordre des actions V[id].ordre) fait foi partout
    function valide(id) { try { return ((JSON.parse(localStorage.getItem('xerkoin:valid') || '{}') || {})[id]) || {}; } catch (e) { return {}; } }
    function ordonner(acts, ordre) { if (!ordre || !ordre.length) return acts; var out = []; ordre.forEach(function (i) { if (acts[i] && out.indexOf(acts[i]) < 0) out.push(acts[i]); }); acts.forEach(function (a) { if (out.indexOf(a) < 0) out.push(a); }); return out; }
    function pour(id, A) { var it = lireItems(A || (window.jOSApps && window.jOSApps[id]), id), n = nDe(id, it.acts.length), v = valide(id), cells = Array.isArray(v.cells) && v.cells.length ? v.cells.filter(function (c) { return CELLS[c]; }) : XK64[n];
        return { n: n, cells: cells, compose: !!(v.cells && v.cells.length), acts: ordonner(it.acts, v.ordre), stats: it.stats }; }
    function lancer(id, a) { if (!a || !a.act) return; var m = /^ploxion\.([^.]+)\.(.+)$/.exec(a.act.port); try { if (window.jOSPorts && jOSPorts.emit) { if (m) jOSPorts.emit(m[1], m[2], a.act.payload || {}); else jOSPorts.emit(id, a.act.port, a.act.payload || {}); } } catch (e) {} }
    function regler(p) { p = p || {}; var num = function (v, a, b, d) { v = +v; return isFinite(v) ? Math.max(a, Math.min(b, v)) : d; };
        R.k1 = num(p.k1, .6, .99, .92); R.k2 = num(p.k2, .2, .9, .55); R.k3 = num(p.k3, 0, .5, .2); R.rond = num(p.rond, 0, 30, 3);
        try { var H = document.documentElement.style; H.setProperty('--xk-trait', num(p.trait, .6, 5, 2.2)); H.setProperty('--xk-trait-i', num(p.traitI, .3, 4, 1.5)); } catch (e) {} return R; }
    // le carnet de l'alien (les bandes gardées avec RS-7) remplace celui du 15.11, EN PLACE (ceux qui tiennent CARNET le voient)
    function carnet(l) { if (!Array.isArray(l) || !l.length) return CARNET; var ok = l.filter(function (b) { return Array.isArray(b) && b.length && b.every(function (c) { return CELLS[c]; }); }); if (!ok.length) return CARNET;
        CARNET.splice.apply(CARNET, [0, CARNET.length].concat(ok)); return CARNET; }
    try { var g0 = JSON.parse(localStorage.getItem('xb:alien:glyphes') || 'null'); if (g0) regler(g0); } catch (e) {}
    try { var c0 = JSON.parse(localStorage.getItem('xb:alien:carnet') || 'null'); if (c0) carnet(c0); } catch (e) {}
    window.jOSXerkoin = { regler: regler, carnet: carnet, R: R, CELLS: CELLS, ORDRE: ORDRE, CARNET: CARNET, XK64: XK64, autoN: autoN, nDe: nDe, bande: bande, slots: slots, auto: auto, chargerDescribe: chargerDescribe, lireItems: lireItems, pour: pour, ordonner: ordonner, lancer: lancer };
})();
