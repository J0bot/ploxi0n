// ◇ LE TRACKPAD HAPTIQUE : LES ESSAIS (0.60, RS-7 : « et d'ailleurs fais déjà les tests pour le trackpad haptique »). Un ploxion de l'app
// pour SENTIR, sur l'iPhone, ce que vaut un trackpad au Taptic Engine avant d'en faire un vrai : une surface où le doigt pilote un curseur
// dans un petit écran, et des TEXTURES haptiques à comparer :
//   grille   un cran (selection) tous les N px parcourus : le grain du trackpad
//   bords    un choc (fort) quand le curseur touche un bord de l'écran
//   cibles   le curseur entre dans un bouton : une bosse (leger) ; il y est aimanté
//   aucune   le témoin : rien
// Toucher bref = clic (moyen) ; appui tenu 0,5 s = clic fort (fort, comme le Force Touch) ; deux doigts = défiler (un cran par ligne).
// Le banc compte ce qu'il demande et ce que l'iPhone tient : haptiques/s demandés, plafond (au-delà de 60/s, on saute : le Taptic Engine
// n'en rend pas plus), et le temps d'aller-retour natif d'un vibrer() (ms). Les réglages du banc restent ici (rien n'est gardé).
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const TEXTURES = [['grille', 'grille'], ['bords', 'bords'], ['cibles', 'cibles'], ['aucune', 'aucune']];
export const PAS = [6, 12, 20, 32];
export const CRANS = [['selection', 'cran'], ['leger', 'léger'], ['moyen', 'moyen']];
const PLAFOND = 60;   // haptiques par seconde, au plus

/** le moteur, sans DOM (testable) : rend les haptiques à jouer pour un déplacement du curseur */
export function creerTexture({ largeur = 300, hauteur = 190, cibles = [] } = {}) {
  let x = largeur / 2, y = hauteur / 2, parcouru = 0, dans = -1, aubord = false;
  return {
    get x() { return x; }, get y() { return y; },
    /** déplacer de (dx, dy) ; o = { texture, pas, cran } ; rend la liste des styles à jouer */
    bouger(dx, dy, o) {
      const l = [];
      const nx = Math.max(0, Math.min(largeur, x + dx)), ny = Math.max(0, Math.min(hauteur, y + dy));
      const bord = nx === 0 || ny === 0 || nx === largeur || ny === hauteur;
      if (o.texture === 'grille') { parcouru += Math.hypot(nx - x, ny - y); while (parcouru >= o.pas) { parcouru -= o.pas; l.push(o.cran); } }
      if (o.texture === 'bords' || o.texture === 'grille') { if (bord && !aubord) l.push('fort'); }
      aubord = bord;
      x = nx; y = ny;
      if (o.texture === 'cibles') {
        const i = cibles.findIndex(c => x >= c.x && x <= c.x + c.l && y >= c.y && y <= c.y + c.h);
        if (i >= 0 && i !== dans) { l.push('leger'); const c = cibles[i]; x += (c.x + c.l / 2 - x) * 0.35; y += (c.y + c.h / 2 - y) * 0.35; }   // aimanté
        dans = i;
      }
      return l;
    },
    cible() { return cibles.findIndex(c => x >= c.x && x <= c.x + c.l && y >= c.y && y <= c.y + c.h); },
    placer(nx, ny) { x = nx; y = ny; },
  };
}

export function enregistrerTrackpad({ W = globalThis.window, vibrer = (s) => (W.jOSNatif && W.jOSNatif.vibrer ? W.jOSNatif.vibrer(s) : Promise.resolve()) } = {}) {
  function mount(hote) {
    const o = { texture: 'grille', pas: 12, cran: 'selection', gain: 1.6 };
    const L = 300, H = 190, CIBLES = [{ x: 24, y: 24, l: 70, h: 34, n: 'ion' }, { x: 116, y: 24, l: 70, h: 34, n: 'koin' }, { x: 208, y: 24, l: 70, h: 34, n: 'kion' }, { x: 24, y: 120, l: 120, h: 44, n: 'portion' }, { x: 160, y: 120, l: 116, h: 44, n: 'wormion' }];
    const tex = creerTexture({ largeur: L, hauteur: H, cibles: CIBLES });
    const stats = { demandes: 0, joues: 0, sautes: 0, fenetre: [], rtt: [] , clics: 0 };
    let vivant = true;
    hote.innerHTML = '<div class="tpk"><style>'
      + '.tpk{padding:12px 14px 40px;font-size:14px;color:var(--txt,#e6e9f2)}.tpk h2{margin:2px 0 2px;font-size:1.15rem}.tpk .n{color:var(--muted,#8aa0c0);font-size:.82rem;margin:0 0 10px}'
      + '.tpk .ecran{position:relative;width:' + L + 'px;max-width:100%;height:' + H + 'px;margin:0 auto 12px;border-radius:14px;background:#070b12;box-shadow:inset 0 0 0 1px rgba(125,191,184,.35);overflow:hidden}'
      + '.tpk .ecran i{position:absolute;border-radius:8px;border:1px solid rgba(125,191,184,.4);color:#7dbfb8;font:600 11px ui-monospace,monospace;display:flex;align-items:center;justify-content:center;transition:background .12s}'
      + '.tpk .ecran i.on{background:rgba(125,191,184,.18)}.tpk .ecran i.clic{background:#7dbfb8;color:#070b12}'
      + '.tpk .curseur{position:absolute;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:#7dbfb8;box-shadow:0 0 12px #7dbfb8;pointer-events:none}'
      + '.tpk .pad{height:230px;border-radius:22px;background:#0d1016;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),inset 0 10px 30px rgba(0,0,0,.5);touch-action:none;display:flex;align-items:flex-end;justify-content:center;padding:10px;color:#4b5568;font:600 10px ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase}'
      + '.tpk .pad.appui{background:#121722}'
      + '.tpk .r{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 0}.tpk .r span{width:100%;font:600 10px ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--muted,#8aa0c0)}'
      + '.tpk .r button{flex:1;min-height:34px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:#151a24;color:inherit;font:600 12px inherit}.tpk .r button.on{border-color:#7dbfb8;color:#7dbfb8}'
      + '.tpk .st{margin-top:12px;font:12px ui-monospace,monospace;color:var(--muted,#8aa0c0);line-height:1.6}.tpk .st b{color:var(--txt,#e6e9f2)}'
      + '</style><h2>Trackpad haptique</h2><p class="n">Les essais : le doigt sur la surface pilote le curseur. Compare les textures, le pas, le cran. Toucher = clic, tenir 0,5 s = clic fort, deux doigts = défiler.</p>'
      + '<div class="ecran">' + CIBLES.map((c, i) => '<i data-c="' + i + '" style="left:' + c.x + 'px;top:' + c.y + 'px;width:' + c.l + 'px;height:' + c.h + 'px">' + esc(c.n) + '</i>').join('') + '<div class="curseur"></div></div>'
      + '<div class="pad" data-pad>surface</div>'
      + '<div class="r"><span>texture</span>' + TEXTURES.map(([k, n]) => '<button data-texture="' + k + '">' + esc(n) + '</button>').join('') + '</div>'
      + '<div class="r"><span>pas de la grille (px)</span>' + PAS.map(p => '<button data-pas="' + p + '">' + p + '</button>').join('') + '</div>'
      + '<div class="r"><span>le cran</span>' + CRANS.map(([k, n]) => '<button data-cran="' + k + '">' + esc(n) + '</button>').join('') + '</div>'
      + '<div class="st" data-st></div></div>';
    const R = hote.querySelector('.tpk'), pad = R.querySelector('[data-pad]'), cur = R.querySelector('.curseur'), st = R.querySelector('[data-st]');
    const peindreChoix = () => { for (const b of R.querySelectorAll('[data-texture]')) b.classList.toggle('on', b.dataset.texture === o.texture); for (const b of R.querySelectorAll('[data-pas]')) b.classList.toggle('on', +b.dataset.pas === o.pas); for (const b of R.querySelectorAll('[data-cran]')) b.classList.toggle('on', b.dataset.cran === o.cran); };
    const peindreCurseur = () => { cur.style.left = tex.x + 'px'; cur.style.top = tex.y + 'px'; const c = tex.cible(); R.querySelectorAll('.ecran i').forEach((e, i) => e.classList.toggle('on', i === c)); };
    function jouer(style) {
      const t = Date.now(); stats.demandes++;
      stats.fenetre = stats.fenetre.filter(x => t - x < 1000);
      if (stats.fenetre.length >= PLAFOND) { stats.sautes++; return; }
      stats.fenetre.push(t); stats.joues++;
      const t0 = (W.performance && W.performance.now) ? W.performance.now() : t;
      Promise.resolve(vibrer(style)).then(() => { const t1 = (W.performance && W.performance.now) ? W.performance.now() : Date.now(); stats.rtt.push(t1 - t0); if (stats.rtt.length > 40) stats.rtt.shift(); }).catch(() => {});
    }
    function peindreStats() {
      if (!vivant) return;
      const moy = stats.rtt.length ? stats.rtt.reduce((a, b) => a + b, 0) / stats.rtt.length : 0;
      st.innerHTML = 'haptiques/s <b>' + stats.fenetre.filter(x => Date.now() - x < 1000).length + '</b> · joués <b>' + stats.joues + '</b> · sautés (> ' + PLAFOND + '/s) <b>' + stats.sautes + '</b><br>aller-retour natif <b>' + moy.toFixed(1) + ' ms</b> · clics <b>' + stats.clics + '</b>';
      W.setTimeout(peindreStats, 250);
    }
    R.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.texture) o.texture = b.dataset.texture; if (b.dataset.pas) o.pas = +b.dataset.pas; if (b.dataset.cran) o.cran = b.dataset.cran;
      peindreChoix(); jouer('selection');
    });
    // la surface : un doigt = le curseur (avec accélération), deux doigts = défiler ; toucher = clic, tenir = clic fort
    const doigts = new Map(); let appui = null, long = null, defile = 0;
    pad.addEventListener('pointerdown', (e) => {
      try { pad.setPointerCapture(e.pointerId); } catch (er) { /* */ }
      doigts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (doigts.size === 1) { appui = { x: e.clientX, y: e.clientY, t: Date.now(), bouge: false, fort: false }; pad.classList.add('appui'); long = W.setTimeout(() => { if (appui && !appui.bouge) { appui.fort = true; jouer('fort'); cliquer(true); } }, 500); }
      else { if (long) W.clearTimeout(long); appui = null; }
    });
    pad.addEventListener('pointermove', (e) => {
      const d = doigts.get(e.pointerId); if (!d) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y; d.x = e.clientX; d.y = e.clientY;
      if (appui && Math.hypot(e.clientX - appui.x, e.clientY - appui.y) > 6) { appui.bouge = true; if (long) W.clearTimeout(long); }
      if (doigts.size >= 2) { defile += dy / 2; while (Math.abs(defile) >= 14) { defile -= Math.sign(defile) * 14; jouer('selection'); } return; }
      const v = Math.hypot(dx, dy), g = o.gain * (1 + Math.min(2, v / 12));   // l'accélération : vite = plus loin
      for (const s of tex.bouger(dx * g, dy * g, o)) jouer(s);
      peindreCurseur();
    });
    const lever = (e) => {
      doigts.delete(e.pointerId); if (long) W.clearTimeout(long); pad.classList.remove('appui');
      if (appui && !appui.bouge && !appui.fort && e.type === 'pointerup' && Date.now() - appui.t < 350) { jouer('moyen'); cliquer(false); }
      if (!doigts.size) appui = null;
    };
    pad.addEventListener('pointerup', lever); pad.addEventListener('pointercancel', lever);
    function cliquer(fort) {
      stats.clics++; const c = tex.cible(); if (c < 0) return;
      const el = R.querySelectorAll('.ecran i')[c]; el.classList.add('clic'); if (fort) jouer('succes');
      W.setTimeout(() => el.classList.remove('clic'), 180);
    }
    peindreChoix(); peindreCurseur(); peindreStats();
    return { unmount() { vivant = false; hote.innerHTML = ''; } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps.trackpad = { manifest: { id: 'trackpad', name: 'Trackpad haptique', icon: '◇' }, mount };
  return { id: 'trackpad', nom: 'Trackpad haptique', icone: '◇', interne: true };
}
