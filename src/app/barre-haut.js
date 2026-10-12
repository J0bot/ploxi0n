// ▔ LA BARRE DU HAUT (RS-7 12.10 : « pour le plein écran complet sur iPhone, il faut qu'on ait nos propres infos en haut aussi, et qu'on
// puisse customiser ça »). En plein écran, iOS cache sa barre d'état mais garde la place (l'encoche, la Dynamic Island) : une bande vide.
// Elle devient NOTRE barre : à gauche et à droite de l'île (le centre reste libre), les éléments choisis, gravés en mono.
//   éléments : heure · date · batterie · réseau · ploxion (celui qui est ouvert) · ouverts (combien vivent) · tsoins (du jour) · compte · météo
//   composée dans boxion_local « reglages/barre-haut » = { gauche: [k…], droite: [k…] } ; appui long sur la barre (ou ⚙ › Apparence) → la
//   composer ; un toucher → remonter en haut du ploxion ouvert (comme la barre d'iOS).
// Aucune animation, aucune boucle d'images : une minuterie à la minute, en pause quand l'app n'est pas visible (le xer tourne sur un Pi 4).
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const ELEMENTS_HAUT = [['heure', '🕐 heure'], ['date', '📅 date'], ['batterie', '🔋 batterie'], ['reseau', '📶 réseau'], ['ploxion', '◇ ploxion ouvert'],
  ['ouverts', '⧉ ploxions ouverts'], ['tsoins', '⧗ tsoins du jour'], ['compte', '👤 compte'], ['meteo', '☁ météo (WeatherKit)']];
export const HAUT_DEFAUT = { gauche: ['heure', 'ploxion'], droite: ['tsoins', 'reseau', 'batterie'] };

// le symbole SF de WeatherKit (« cloud.sun.fill ») → un glyphe
const ciel = (s) => { s = String(s || ''); return /bolt/.test(s) ? '⚡' : /snow/.test(s) ? '❄' : /rain|drizzle/.test(s) ? '☂' : /fog|haze/.test(s) ? '≋' : /sun|clear/.test(s) && /cloud/.test(s) ? '⛅' : /cloud/.test(s) ? '☁' : /moon/.test(s) ? '☾' : /sun|clear/.test(s) ? '☀' : ''; };
export function creerBarreHaut({ W = globalThis.window, boxion, actif = () => true, courant = () => null, ouverts = () => 0, compte = null, vibrer = () => {} }) {
  const D = W.document, nj = () => W.jOSNatif || {};
  let config = HAUT_DEFAUT, el = null, minuterie = null;
  const etat = { batterie: null, reseau: null, tsoins: 0, meteo: null, meteoLe: 0 };
  const normaliser = (c) => {
    const ok = new Set(ELEMENTS_HAUT.map(x => x[0])), vus = new Set();
    const f = (l) => (Array.isArray(l) ? l : []).filter(k => ok.has(k) && !vus.has(k) && vus.add(k)).slice(0, 5);
    return c ? { gauche: f(c.gauche), droite: f(c.droite) } : { ...HAUT_DEFAUT };
  };
  const pret = boxion.get('reglages', 'barre-haut').then(c => { config = normaliser(c); }).catch(() => {});
  const utilise = (k) => config.gauche.includes(k) || config.droite.includes(k);
  const morceaux = {
    heure: () => new Date().toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' }),
    date: () => new Date().toLocaleDateString('fr-CH', { weekday: 'short', day: 'numeric', month: 'short' }),
    batterie: () => { const b = etat.batterie; if (!b || b.niveau == null || b.niveau < 0) return ''; const n = Math.round(b.niveau * 100); return '<span class="' + (n <= 20 && !b.enCharge ? 'bas' : '') + '">' + (b.enCharge ? '⚡' : '▮') + n + '%</span>'; },
    reseau: () => { const r = etat.reseau, en = W.navigator.onLine !== false; if (!en) return '<span class="bas">hors ligne</span>'; return r && r.type ? (r.type === 'wifi' ? 'wi-fi' : r.type === 'cellular' ? 'cell' : r.type) : 'en ligne'; },
    ploxion: () => { const c = courant(); return c ? esc(String(c).slice(0, 16)) : 'accueil'; },
    ouverts: () => { const n = ouverts(); return n ? '⧉' + n : ''; },
    tsoins: () => '⧗' + etat.tsoins,
    compte: () => { const e = compte && compte.etat(); return e && e.connecte ? esc(e.glyphe || '·') + ' ' + esc(String(e.nom || '').slice(0, 10)) : '—'; },
    meteo: () => etat.meteo ? esc(etat.meteo) : '',
  };
  const cote = (l) => l.map(k => { const h = morceaux[k](); return h ? '<span data-k="' + k + '">' + h + '</span>' : ''; }).join('');
  function peindre() {
    if (!el) return;
    el.hidden = !actif();
    D.documentElement.classList.toggle('px-haut-on', !el.hidden);
    if (el.hidden) return;
    el.innerHTML = '<span class="g">' + cote(config.gauche) + '</span><span class="ile"></span><span class="d">' + cote(config.droite) + '</span>';
  }
  async function mesurer() {
    if (D.hidden) return;
    const n = nj();
    if (utilise('batterie') && n.batterie) etat.batterie = await n.batterie().catch(() => null);
    if (utilise('reseau') && n.reseau) etat.reseau = await n.reseau().catch(() => null);
    if (utilise('tsoins')) { const jour = new Date().toDateString(); etat.tsoins = (await boxion.lire('tsoins', { limite: 2000 }).catch(() => [])).filter(x => new Date(x.t).toDateString() === jour).length; }
    if (utilise('meteo') && n.meteo && Date.now() - etat.meteoLe > 30 * 60000) {
      etat.meteoLe = Date.now();
      try { const m = await n.meteo(); if (m) etat.meteo = ciel(m.symbole) + Math.round(m.temperature) + '°'; } catch (e) { etat.meteo = null; }
    }
    peindre();
  }
  function demarrer() {
    arreter(); mesurer();
    // à la minute pile, puis chaque minute
    minuterie = W.setTimeout(function tic() { mesurer(); minuterie = W.setTimeout(tic, 60000); }, 60000 - (Date.now() % 60000) + 50);
  }
  function arreter() { if (minuterie) W.clearTimeout(minuterie); minuterie = null; }

  function installer(racine) {
    el = D.createElement('div'); el.className = 'px-haut'; el.setAttribute('role', 'status');
    (racine || D.body).appendChild(el);
    let t0 = 0, long = null;
    el.addEventListener('pointerdown', () => { t0 = Date.now(); long = W.setTimeout(() => { long = null; vibrer('moyen'); composer(); }, 500); });
    el.addEventListener('pointerup', () => {
      if (!long) return; W.clearTimeout(long); long = null;
      if (Date.now() - t0 < 500) {   // remonter en haut de ce qui est ouvert
        const h = D.querySelector('.px-hote:not([hidden])') || D.querySelector('.px-accueil') || D.scrollingElement;
        for (const x of [h, ...(h ? h.querySelectorAll('*') : [])].slice(0, 400)) if (x && x.scrollTop > 0) { try { x.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { x.scrollTop = 0; } }
        vibrer('selection');
      }
    });
    el.addEventListener('pointercancel', () => { if (long) W.clearTimeout(long); long = null; });
    D.addEventListener('visibilitychange', () => { if (D.hidden) arreter(); else demarrer(); });
    W.addEventListener('online', peindre); W.addEventListener('offline', peindre);
    pret.then(demarrer);
  }

  /** la feuille pour composer la barre : chaque élément à gauche, à droite, ou nulle part */
  function composer() {
    const f = D.createElement('div'); f.className = 'px-voile';
    const place = (k) => config.gauche.includes(k) ? 'g' : config.droite.includes(k) ? 'd' : '';
    const dessiner = () => {
      f.innerHTML = '<div class="px-tiroir"><p class="px-ft">▔ la barre du haut</p><p class="px-sous" style="margin:0 2px 8px">À gauche et à droite de l\'île. Visible en plein écran complet (⚙ › Apparence).</p>'
        + ELEMENTS_HAUT.map(([k, n]) => '<div class="l"><span>' + esc(n) + '</span><span class="px-puces">'
          + [['g', '◧ gauche'], ['', '—'], ['d', 'droite ◨']].map(([p, t]) => '<button class="px-puce' + (place(k) === p ? ' on' : '') + '" data-k="' + k + '" data-p="' + p + '">' + t + '</button>').join('') + '</span></div>').join('')
        + '<button data-defaut>par défaut</button><button data-fermer>fermer</button></div>';
    };
    f.addEventListener('click', async (e) => {
      if (e.target === f || e.target.closest('[data-fermer]')) return f.remove();
      if (e.target.closest('[data-defaut]')) { await regler(HAUT_DEFAUT); return dessiner(); }
      const b = e.target.closest('[data-k][data-p]'); if (!b) return;
      const k = b.getAttribute('data-k'), p = b.getAttribute('data-p');
      const c = { gauche: config.gauche.filter(x => x !== k), droite: config.droite.filter(x => x !== k) };
      if (p === 'g') c.gauche.push(k); if (p === 'd') c.droite.push(k);
      await regler(c); vibrer('selection'); dessiner();
    });
    (D.getElementById('ploxi0n') || D.body).appendChild(f);
    dessiner();
  }
  async function regler(c) { config = normaliser(c); await boxion.put('reglages', 'barre-haut', config).catch(() => {}); mesurer(); return config; }
  return { installer, peindre, mesurer, composer, regler, config: () => normaliser(config), pret };
}
