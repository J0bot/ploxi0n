// ▥ LA BANDE FAÇON NIRI (0.87). RS-7 (13.10) : « je veux que l'app soit un peu comme niri » : les ploxions vivants en COLONNES sur une
// bande qui défile, le nouveau s'ouvre À DROITE de celui qu'on regarde, une VUE D'ENSEMBLE. docs/LOOK.md : chaque ploxion = une colonne-panneau,
// son nom gravé dans le cadre.
//   ⚙ › Navigation › « La bande » (coupée par défaut : l'app reste comme avant).
//   Portrait : une colonne (86 % de l'écran) et le bord de la suivante, vivante, à droite ; la toucher la ramène devant. Paysage (≥ 700 px) :
//   deux colonnes côte à côte. Les bords (glisser depuis le bord gauche ou droit) font défiler la bande dans son ordre.
//   La vue d'ensemble (▥ dans les gestes des bords, ou appui long sur le bord de la suivante) : toutes les colonnes en petit, sur une ligne,
//   qu'on fait glisser ; toucher une colonne la ramène devant ; les endormis y sont aussi (leur nom, un toucher les réveille).
// Rien n'est déplacé dans le DOM : un hôte de ploxion reste où il est (un iframe déplacé se recharge) ; la bande ne pose que des largeurs et des
// translations. Le routeur garde tout le reste (montrer, cacher, le sommeil, la pile) et dit à la bande quand regarder (poser).
const GAP = 8;

/** vivants() → [{ id, hote, nom }] ; ordre() → [ids] (vivants et endormis, l'ordre de la bande) ; courant() → id ; aller(id, sens) ; endormis() → [{ id, nom }] */
export function creerBande({ W = globalThis.window, scene, actif = () => false, vivants = () => [], ordre = () => [], courant = () => null, aller = () => {}, nomDe = (id) => id, vibrer = () => {}, calme = () => false }) {
  const D = W.document;
  let suite = null, vue = null, pose = false;
  const largeur = () => scene.clientWidth || W.innerWidth || 390;
  const colonnes = () => { const L = largeur(); return L >= 700 ? { n: 2, col: Math.floor((L - GAP) / 2) } : { n: 1, col: Math.round(L * 0.86) }; };

  function nettoyer() {
    if (!pose) return; pose = false;
    scene.classList.remove('px-bande', 'px-bande-vue');
    for (const v of vivants()) { v.hote.style.removeProperty('width'); v.hote.style.removeProperty('right'); v.hote.style.removeProperty('transform'); v.hote.classList.remove('px-bande-voisin', 'px-bande-col'); v.hote.removeAttribute('data-bande-nom'); }
    if (suite) { suite.remove(); suite = null; }
    if (vue) { vue.remove(); vue = null; }
  }

  /** la bande autour de la colonne regardée ; appelé par le routeur après chaque montrer() */
  function poser() {
    if (!actif() || !courant()) { nettoyer(); return; }
    if (vue) return;   // la vue d'ensemble se pose elle-même
    pose = true; scene.classList.add('px-bande'); scene.classList.toggle('px-bande-calme', !!calme());
    const ids = ordre().filter(id => vivants().some(v => v.id === id)), f = ids.indexOf(courant());
    const { n, col } = colonnes();
    let prochaine = null;
    for (const v of vivants()) {
      const i = ids.indexOf(v.id), d = i - f;
      v.hote.classList.add('px-bande-col'); v.hote.setAttribute('data-bande-nom', nomDe(v.id));
      v.hote.style.width = col + 'px'; v.hote.style.right = 'auto';
      v.hote.style.transform = 'translateX(' + (d * (col + GAP)) + 'px)';
      const visible = d === 0 || (d > 0 && d < n + (n === 1 ? 1 : 0));
      if (d !== 0) { v.hote.classList.toggle('px-bande-voisin', visible); if (visible) v.hote.hidden = false; }
      else v.hote.classList.remove('px-bande-voisin');
      if (d === 1) prochaine = v.id;
    }
    // le bord de la suivante (portrait) ou la deuxième colonne (paysage) : un toucher l'amène devant ; un appui long, la vue d'ensemble
    if (prochaine) {
      if (!suite) {
        suite = D.createElement('button'); suite.type = 'button'; suite.className = 'px-bande-suite'; suite.setAttribute('aria-label', 'la colonne suivante');
        let t = 0, long = false;
        suite.addEventListener('pointerdown', () => { long = false; t = W.setTimeout(() => { long = true; vibrer('appui'); ouvrirVue(); }, 520); });
        const fin = () => W.clearTimeout(t); suite.addEventListener('pointerup', fin); suite.addEventListener('pointercancel', fin);
        suite.addEventListener('click', (e) => { e.stopPropagation(); if (long) return; const p = suite.getAttribute('data-id'); if (p) { vibrer('selection'); aller(p, 1); } });
        scene.appendChild(suite);
      }
      suite.setAttribute('data-id', prochaine);
      suite.style.left = (col + GAP) + 'px'; suite.style.width = Math.max(0, largeur() - col - GAP) + 'px';
    } else if (suite) { suite.remove(); suite = null; }
  }

  /** ▥ la vue d'ensemble : toutes les colonnes en petit, sur une ligne qu'on fait glisser */
  function ouvrirVue() {
    if (!actif()) return false;
    const liste = ordre(), vv = vivants(); if (!liste.length) return false;
    if (suite) { suite.remove(); suite = null; }
    pose = true; scene.classList.add('px-bande', 'px-bande-vue');
    const L = largeur(), H = scene.clientHeight || W.innerHeight || 700, s = 0.34, cw = Math.round(L * 0.86), pas = Math.round((cw + GAP * 3) * s);
    const y = Math.round((H - H * s) / 2);
    let decal = 0; const f = Math.max(0, liste.indexOf(courant()));
    decal = Math.min(0, Math.round(L / 2 - (f + 0.5) * pas));
    vue = D.createElement('div'); vue.className = 'px-bande-calque';
    vue.innerHTML = liste.map((id, i) => '<button type="button" class="px-bande-etiquette' + (vv.some(v => v.id === id) ? '' : ' px-bande-endormi') + '" data-bande-id="' + String(id).replace(/"/g, '&quot;') + '" style="left:' + (i * pas) + 'px;top:' + y + 'px;width:' + Math.round(cw * s) + 'px;height:' + Math.round(H * s) + 'px"><span>' + esc(nomDe(id)) + '</span></button>').join('');
    scene.appendChild(vue);
    const placer = () => {
      vue.style.transform = 'translateX(' + decal + 'px)';
      for (const v of vv) { const i = liste.indexOf(v.id); if (i < 0) continue; v.hote.hidden = false; v.hote.classList.add('px-bande-col'); v.hote.classList.remove('px-bande-voisin'); v.hote.style.width = cw + 'px'; v.hote.style.right = 'auto'; v.hote.style.transform = 'translate(' + (decal + i * pas) + 'px,' + y + 'px) scale(' + s + ')'; }
    };
    placer();
    // glisser : la ligne défile ; toucher sans glisser : cette colonne devant
    let x0 = null, d0 = 0, bouge = false;
    vue.addEventListener('pointerdown', (e) => { x0 = e.clientX; d0 = decal; bouge = false; });
    vue.addEventListener('pointermove', (e) => { if (x0 == null) return; const dx = e.clientX - x0; if (Math.abs(dx) > 6) bouge = true; if (bouge) { const min = Math.min(0, L - liste.length * pas - GAP); decal = Math.max(min - 40, Math.min(40, d0 + dx)); placer(); } });
    vue.addEventListener('pointerup', () => { x0 = null; const min = Math.min(0, L - liste.length * pas - GAP); decal = Math.max(min, Math.min(0, decal)); placer(); });
    vue.addEventListener('click', (e) => {
      e.stopPropagation(); if (bouge) { bouge = false; return; }
      const b = e.target.closest('[data-bande-id]'); const id = b ? b.getAttribute('data-bande-id') : null;
      fermerVue(); if (id) { vibrer('selection'); aller(id, 0); } else poser();
    });
    vibrer('fx-carte');
    return true;
  }
  function fermerVue() { if (!vue) return; vue.remove(); vue = null; scene.classList.remove('px-bande-vue'); for (const v of vivants()) if (v.id !== courant()) v.hote.hidden = true; }
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  W.addEventListener('resize', () => { if (pose && !vue) poser(); });
  return { poser, nettoyer, ouvrirVue, fermerVue, vueOuverte: () => !!vue, colonnes };
}

/** l'ordre de la bande : le nouveau à DROITE de celui d'où on l'ouvre (niri) ; sans bande, à la fin (comme avant) */
export function placerDansOrdre(ordre, id, depuis, bande) {
  const o = ordre.filter(x => x !== id);
  const i = bande && depuis != null ? o.indexOf(depuis) : -1;
  if (i >= 0) o.splice(i + 1, 0, id); else o.push(id);
  return o;
}
