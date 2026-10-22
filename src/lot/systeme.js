// ▤ LE SYSTÈME, FAÇON BTOP (0.88, le lot de ploxions de RS-7, 13.10 : « btop (+ le xerminal du labo) »). docs/LOOK.md : « btop = le widget
// SYSTEM : ce que l'iPhone donne vraiment ». Un ploxion interne, en panneaux au trait, rafraîchi toutes les 2 s tant qu'on le regarde :
//   images/s (la fluidité de l'app, mesurée), la mémoire de l'app, le disque, le stockage du web, la batterie, l'état thermique, le mode
//   économie, le réseau et la latence jusqu'au labo, les ploxions vivants et endormis ; des courbes en blocs (▁▂▃▄▅▆▇█) sur une minute.
// iOS seul sait le thermique, l'économie, le disque, la mémoire physique : PloxiApple.systeme (Swift, AppDelegate.swift) ; Device.getInfo :
// la mémoire de l'app. Hors iPhone : ce que le web donne. Démonté : plus rien ne tourne (le droit au silence).
// Le xerminal du labo (fastfetch du xerboxion) : un bouton l'ouvre (le ploxion « xerminal », installé à la demande).
const BLOCS = '▁▂▃▄▅▆▇█';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const octets = (n) => (n == null || n < 0 || !isFinite(n) ? '—' : n < 1048576 ? Math.round(n / 1024) + ' Ko' : n < 1073741824 ? Math.round(n / 1048576) + ' Mo' : (Math.round(n / 107374182.4) / 10).toLocaleString('fr-CH') + ' Go');
export const duree = (s) => (!s ? '—' : s < 3600 ? Math.round(s / 60) + ' min' : s < 86400 ? Math.floor(s / 3600) + ' h ' + Math.round((s % 3600) / 60) + ' min' : Math.floor(s / 86400) + ' j ' + Math.round((s % 86400) / 3600) + ' h');
/** une série → une courbe en blocs (max : la valeur pleine) */
export function courbe(serie, max, largeur = 30) {
  const l = serie.slice(-largeur); if (!l.length) return '';
  const m = max || Math.max(1, ...l);
  return l.map(v => BLOCS[Math.max(0, Math.min(7, Math.round((v / m) * 7)))]).join('');
}
/** une jauge au trait : [████░░░░] */
export const jauge = (f, n = 16) => { const k = Math.max(0, Math.min(n, Math.round((f || 0) * n))); return '█'.repeat(k) + '░'.repeat(n - k); };
const THERMIQUE = { nominal: ['nominal', 'ok'], tiede: ['tiède', 'ok'], chaud: ['chaud', 'mi'], critique: ['critique', 'ko'], inconnu: ['—', ''] };

/** lire() → { fps, … } ; deps injectables pour les tests */
export function creerSysteme({ W = globalThis.window, systeme = null, appareil = null, batterie = null, reseau = null, sonder = null, ploxions = () => ({ vivants: [], endormis: [] }), ouvrir = () => {}, periode = 2000 } = {}) {
  const D = W.document;
  async function lire() {
    const [s, a, b, r, est] = await Promise.all([
      systeme ? systeme().catch(() => null) : null,
      appareil ? appareil().catch(() => null) : null,
      batterie ? batterie().catch(() => null) : null,
      reseau ? reseau().catch(() => null) : null,
      W.navigator.storage && W.navigator.storage.estimate ? W.navigator.storage.estimate().catch(() => null) : null,
    ]);
    return { s: s || {}, a: a || {}, b: b || {}, r: r || {}, web: est || {}, coeurs: (s && s.coeurs) || W.navigator.hardwareConcurrency || null };
  }

  function mount(hote) {
    let vivant = true, minuteur = 0, raf = 0, images = 0, t0 = W.performance.now(), latence = null, enSonde = false;
    const hist = { fps: [], mem: [], lat: [] };
    hote.innerHTML = '<div class="px-page px-btop"><p class="px-grave">▤ système</p><div data-btop></div>'
      + '<div class="px-btop-b"><button type="button" class="px-gros" data-btop-xerminal><b>❯_ le xerminal</b><small>le fastfetch du xerboxion, au labo</small></button></div></div>';
    const zone = hote.querySelector('[data-btop]');
    hote.querySelector('[data-btop-xerminal]').addEventListener('click', () => ouvrir('xerminal'));
    // la fluidité : les images peintes par seconde (un rAF qui compte ; il s'arrête avec le ploxion)
    const compter = () => { if (!vivant) return; images++; raf = W.requestAnimationFrame(compter); };
    raf = W.requestAnimationFrame(compter);
    const ligne = (k, v, plus = '', cls = '') => '<div class="px-btop-l' + (cls ? ' px-btop-' + cls : '') + '"><span class="k">' + esc(k) + '</span><span class="v">' + v + '</span>' + (plus ? '<span class="p">' + plus + '</span>' : '') + '</div>';
    async function peindre() {
      if (!vivant) return;
      const t = W.performance.now(), fps = Math.round(images * 1000 / Math.max(1, t - t0)); images = 0; t0 = t;
      const x = await lire(); if (!vivant) return;
      if (sonder && !enSonde && (!x.r || x.r.connecte !== false)) { enSonde = true; const d = W.performance.now(); sonder().then(() => { latence = Math.round(W.performance.now() - d); }).catch(() => { latence = null; }).finally(() => { enSonde = false; }); }
      const memApp = x.a.memUsed, memTot = x.s.memoire;
      hist.fps.push(fps); if (memApp) hist.mem.push(memApp); if (latence != null) hist.lat.push(latence);
      for (const k in hist) if (hist[k].length > 60) hist[k].splice(0, hist[k].length - 60);
      const th = THERMIQUE[x.s.thermique] || THERMIQUE.inconnu;
      const disque = x.s.disqueTotal > 0 ? 1 - x.s.disqueLibre / x.s.disqueTotal : null;
      const px = ploxions();
      zone.innerHTML = '<div class="px-btop-p"><h4>appareil</h4>'
        + ligne('modèle', esc([x.a.model, x.a.operatingSystem && (x.a.operatingSystem + ' ' + (x.a.osVersion || ''))].filter(Boolean).join(' · ') || '—'))
        + ligne('allumé', esc(duree(x.s.depuis))) + ligne('cœurs', esc(x.coeurs || '—'))
        + ligne('thermique', esc(th[0]), '', th[1]) + ligne('économie', x.s.economie == null ? '—' : x.s.economie ? 'oui' : 'non', '', x.s.economie ? 'mi' : '')
        + '</div><div class="px-btop-p"><h4>l\'app</h4>'
        + ligne('images/s', esc(fps), '<code>' + courbe(hist.fps, 60) + '</code>', fps < 30 ? 'ko' : fps < 50 ? 'mi' : 'ok')
        + ligne('mémoire', esc(octets(memApp)) + (memTot ? ' / ' + esc(octets(memTot)) : ''), memApp ? '<code>' + courbe(hist.mem) + '</code>' : '')
        + ligne('stockage web', esc(octets(x.web.usage)) + (x.web.quota ? ' / ' + esc(octets(x.web.quota)) : ''), x.web.quota ? '<code>' + jauge(x.web.usage / x.web.quota) + '</code>' : '')
        + ligne('ploxions', px.vivants.length + ' vivant' + (px.vivants.length > 1 ? 's' : '') + (px.endormis.length ? ' · ' + px.endormis.length + ' endormi' + (px.endormis.length > 1 ? 's' : '') : ''), esc(px.vivants.slice(0, 6).join(' · ')))
        + '</div><div class="px-btop-p"><h4>énergie · disque · réseau</h4>'
        + ligne('batterie', x.b.niveau == null ? '—' : Math.round(x.b.niveau * 100) + ' %' + (x.b.enCharge ? ' ⚡' : ''), x.b.niveau == null ? '' : '<code>' + jauge(x.b.niveau) + '</code>', x.b.niveau != null && x.b.niveau < 0.2 && !x.b.enCharge ? 'ko' : '')
        + ligne('disque', disque == null ? '—' : esc(octets(x.s.disqueLibre)) + ' libres / ' + esc(octets(x.s.disqueTotal)), disque == null ? '' : '<code>' + jauge(disque) + '</code>', disque != null && disque > 0.92 ? 'ko' : '')
        + ligne('réseau', x.r.connecte === false ? 'hors ligne' : esc(x.r.type || (x.r.connecte ? 'connecté' : '—')), '', x.r.connecte === false ? 'ko' : '')
        + ligne('labo', latence == null ? '—' : latence + ' ms', hist.lat.length ? '<code>' + courbe(hist.lat) + '</code>' : '', latence != null && latence > 800 ? 'mi' : '')
        + '</div>';
    }
    peindre(); minuteur = W.setInterval(peindre, periode);
    return { unmount() { vivant = false; W.clearInterval(minuteur); W.cancelAnimationFrame(raf); hote.innerHTML = ''; } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps.systeme = { manifest: { id: 'systeme', name: 'Système', icon: '▤' }, mount };
  return { lire, mount, ploxion: { id: 'systeme', nom: 'Système', icone: '▤', interne: true } };
}
