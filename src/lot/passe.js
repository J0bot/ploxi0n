// ○ LE PASSÉ : LE ZOOM DE TEMPS (0.97). RS-7 (23.10) : « le but de tout mon système, c'est de pouvoir trouver des apps et ouvrir des ploxions
// selon le temps : j'ai 500 ploxions, je me rappelle qu'il y a deux semaines j'ai utilisé ce ploxion, et où sur la map ; soit je vais sur la
// map et je vois quand je l'ai utilisé, soit je vais juste en arrière dans le temps et je vois défiler toutes mes actions en reverse, je peux
// me balader dans le passé » ; « un zoom dans le temps, un zoom entre les ploxions : zoom de temps, zoom de fractale » ; « le wormion, c'est se
// balader dans le temps ; le portion, entre les ploxions ».
// Ici, le zoom de TEMPS : tout ce que tu as fait, à l'envers (le plus récent en haut ; défiler, c'est reculer). Deux sources :
//   - le journal « passe » (main.js, à chaque fois qu'on quitte un ploxion : { id, sec }) ;
//   - les tsoins (⧗ ce que tu as noté).
// Les PALIERS de zoom : l'heure (chaque ouverture), le jour, la semaine, le mois (les ploxions de la période, rangés par usage). Pincer, ou ⊕ ⊖.
// Toucher un ploxion le rouvre. La map dit l'autre moitié : quand chaque koin a servi, et la réglette du wormion (map-hubs.js).
export const PALIERS = [['heure', 'les heures'], ['jour', 'les jours'], ['semaine', 'les semaines'], ['mois', 'les mois']];
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'], MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const duree = (s) => (!s ? '' : s < 60 ? s + ' s' : s < 3600 ? Math.round(s / 60) + ' min' : (s / 3600).toFixed(1).replace('.', ',') + ' h');

/** la clé et le titre d'un instant à un palier (le seau où il tombe) */
export function seau(t, palier) {
  const d = new Date(t);
  if (palier === 'heure') return [d.toDateString() + ' ' + d.getHours(), JOURS[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()] + ' · ' + d.getHours() + ' h'];
  if (palier === 'jour') return [d.toDateString(), JOURS[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()]];
  if (palier === 'semaine') { const l = new Date(d); l.setHours(0, 0, 0, 0); l.setDate(l.getDate() - ((l.getDay() + 6) % 7)); return ['s' + l.getTime(), 'la semaine du ' + l.getDate() + ' ' + MOIS[l.getMonth()]]; }
  return [d.getFullYear() + '-' + d.getMonth(), MOIS[d.getMonth()] + ' ' + d.getFullYear()];
}
/** les événements (déjà triés, le plus récent d'abord) → les seaux d'un palier ; aux grands paliers, un ploxion = une ligne (combien, combien de temps) */
export function grouper(evs, palier) {
  const out = [], parCle = new Map();
  for (const e of evs) {
    const [k, titre] = seau(e.t, palier);
    let s = parCle.get(k); if (!s) { s = { cle: k, titre, l: [], px: new Map() }; parCle.set(k, s); out.push(s); }
    if (palier === 'heure' || e.genre === 'tsoin') { s.l.push(e); continue; }
    const p = s.px.get(e.id); if (p) { p.n++; p.sec += e.sec || 0; } else { const x = { ...e, n: 1, sec: e.sec || 0 }; s.px.set(e.id, x); s.l.push(x); }
  }
  for (const s of out) if (palier !== 'heure') s.l.sort((a, b) => (b.genre === 'tsoin') - (a.genre === 'tsoin') || (b.sec || 0) - (a.sec || 0));
  return out;
}

export function creerPasse({ W = globalThis.window, boxion, ouvrir = () => {}, catalogue = () => [], glyphe = () => '', vibrer = () => {} } = {}) {
  const D = W.document;
  async function evenements() {
    const [p, t] = await Promise.all([boxion.lire('passe', { limite: 5000 }).catch(() => []), boxion.lire('tsoins', { limite: 2000 }).catch(() => [])]);
    const evs = [
      ...p.map(e => ({ genre: 'ploxion', t: e.t, id: e.entry && e.entry.id, sec: (e.entry && e.entry.sec) || 0 })).filter(e => e.id),
      ...t.map(e => ({ genre: 'tsoin', t: e.t, k: e.entry && e.entry.k, d: e.entry && e.entry.d })).filter(e => e.k),
    ];
    return evs.sort((a, b) => b.t - a.t);
  }
  function mount(hote) {
    let palier = 'jour', evs = [], vivant = true, pince = null;
    const nom = (id) => { const p = catalogue().find(x => x.id === id); return p ? p.nom || id : id; };
    hote.innerHTML = '<div class="px-page px-passe"><p class="px-grave">○ le passé</p><p class="px-sous">tout ce que tu as fait, à l\'envers : défile pour reculer ; pince ou ⊕ ⊖ pour zoomer dans le temps ; touche un ploxion pour y revenir</p>'
      + '<div class="px-passe-z" data-neurones="fin" data-neurones-cellules="button">' + '<button type="button" data-pz="-" aria-label="zoomer : plus près">⊕</button>' + PALIERS.map(([k, n]) => '<button type="button" data-palier="' + k + '">' + n + '</button>').join('') + '<button type="button" data-pz="+" aria-label="dézoomer : plus loin">⊖</button></div>'
      + '<div class="px-passe-l" data-passe-l><p class="px-sous">…</p></div></div>';
    const liste = hote.querySelector('[data-passe-l]');
    function peindre() {
      for (const b of hote.querySelectorAll('[data-palier]')) b.classList.toggle('on', b.getAttribute('data-palier') === palier);
      if (!evs.length) { liste.innerHTML = '<p class="px-sous">rien encore : ouvre des ploxions, note des tsoins ; ils s\'écriront ici, et sur la map.</p>'; return; }
      liste.innerHTML = grouper(evs, palier).slice(0, 400).map(s => '<section class="px-passe-s"><h4>' + esc(s.titre) + '</h4><div class="px-passe-c" data-neurones="fin" data-neurones-cellules="button">'
        + s.l.slice(0, 60).map(e => (e.genre === 'tsoin'
          ? '<button type="button" class="px-passe-t" data-tsoin="1"><span>⧗</span><b>' + esc(e.k) + '</b><small>' + esc(e.d || '') + '</small></button>'
          : '<button type="button" class="px-passe-e" data-passe-id="' + esc(e.id) + '">' + glyphe({ id: e.id, nom: nom(e.id) }) + '<b>' + esc(nom(e.id)) + '</b><small>'
            + esc(palier === 'heure' ? new Date(e.t).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' }) + (e.sec ? ' · ' + duree(e.sec) : '') : (e.n > 1 ? e.n + ' fois · ' : '') + duree(e.sec)) + '</small></button>')).join('')
        + '</div></section>').join('');
    }
    const changer = (sens) => { const i = PALIERS.findIndex(p => p[0] === palier), j = Math.max(0, Math.min(PALIERS.length - 1, i + sens)); if (j === i) return vibrer('fx-butee'); palier = PALIERS[j][0]; vibrer('fx-cran'); peindre(); };
    hote.addEventListener('click', (e) => {
      const z = e.target.closest('[data-pz]'); if (z) return changer(z.getAttribute('data-pz') === '+' ? 1 : -1);
      const p = e.target.closest('[data-palier]'); if (p) { palier = p.getAttribute('data-palier'); vibrer('selection'); return peindre(); }
      const x = e.target.closest('[data-passe-id]'); if (x) { vibrer('fx-arrivee'); ouvrir(x.getAttribute('data-passe-id')); }
    });
    // pincer : écarter = plus près (les heures), resserrer = plus loin (les mois)
    hote.addEventListener('touchstart', (e) => { if (e.touches.length === 2) pince = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }, { passive: true });
    hote.addEventListener('touchmove', (e) => {
      if (pince == null || e.touches.length !== 2) return; const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      if (d > pince * 1.35) { pince = d; changer(-1); } else if (d < pince / 1.35) { pince = d; changer(1); }
    }, { passive: true });
    hote.addEventListener('touchend', () => { pince = null; }, { passive: true });
    evenements().then(l => { if (!vivant) return; evs = l; peindre(); }).catch(() => {});
    return { unmount() { vivant = false; hote.innerHTML = ''; } };
  }
  W.jOSApps = W.jOSApps || {};
  W.jOSApps.passe = { manifest: { id: 'passe', name: 'Le passé', icon: '○' }, mount };
  return { evenements, mount, ploxion: { id: 'passe', nom: 'Le passé', icone: '○', interne: true } };
}
