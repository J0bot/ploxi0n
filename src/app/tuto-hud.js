// ◎ LE HUD DE TUTO (0.63). RS-7 : « haut gauche, ça ajoute le HUD de tuto : ça montre les actions possibles, soit sur l'écran ou le bureau,
// et dans un ploxion ça donne un tuto du ploxion ou du xerkion ; comme ça c'est facile de faire des tutos aussi : quand y'en a pas, y a
// des plus, et je peux partager des tutos dans le marketplace, genre c'est des tsoins : on enregistre le tsoin et on le partage ».
// Une feuille, toujours la même grammaire :
//   - LES BORDS : l'iPhone dessiné au trait, ses neuf zones et ce que chacune fait chez toi (⚙ › Gestes des bords) ; ▶ = la démo (le
//     doigt fantôme, src/app/demo.js)
//   - TENIR : la profondeur (aperçu, fractale, slider, cube), pincer (tout le xerboxion), chacune ▶
//   - ICI : dans un ploxion, SON tuto (son manifeste : tuto: [étapes], sinon celui que tu as écrit) ; aucun → « ＋ écrire le tuto » ;
//     un tuto se partage (↗ : la feuille de partage d'iOS ; le marketplace des tsoins viendra) et devient un TSOIN (genre « tuto »).
// boxion_local « tutos/<id> » = { etapes: [texte], le } (les tiens).
import { ACTIONS_BORDS } from './routeur.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// la démo de chaque action d'un bord (s'il y en a une)
const DEMO_ACTION = { suivante: 'glisser', precedente: 'glisser', carte: 'carte', freefall: 'freefall' };
const TENIR = [['apercu', 'tenir 0,3 s', 'l\'app d\'à côté passe la tête ; tire-la'], ['fractale', 'tenir 0,9 s', 'la fractale : toutes tes apps'], ['lancer', 'lancer', 'le paquet file sur son élan'],
  ['slider', 'tenir 1,9 s', 'le slider défile tout seul'], ['cube', 'arrêté, tenir', 'le xer devient un cube ; ses bions dessus'], ['carte', 'pincer', 'tout le xerboxion, la carte']];

export function creerTutoHud({ W = globalThis.window, boxion = null, routeur = () => null, demo = null, prefs = () => ({}), vibrer = () => {}, tsoin = null, glyphe = () => '' } = {}) {
  const D = W.document;
  let feuille = null;
  const nomAction = (k) => { const a = ACTIONS_BORDS.find(x => x[0] === k); return a ? a[1] : k; };
  const geste = (k) => { const r = routeur(), g = (prefs() || {}).gestes || {}; return g[k] || (r && r.GESTES_DEFAUT ? r.GESTES_DEFAUT[k] : '') || 'rien'; };
  function zone(k, cote) {
    const a = geste(k), d = DEMO_ACTION[a];
    return '<div class="px-th-zone px-th-' + cote + '"><b>' + esc(nomAction(a)) + '</b>' + (d && demo ? '<button type="button" data-th-demo="' + d + '">▶</button>' : '') + '</div>';
  }
  async function tutoDe(id) {
    if (!id) return null;
    const r = routeur(), p = r && r.catalogue ? (r.catalogue().find(x => x.id === id) || {}) : {};
    const m = W.jOSApps && W.jOSApps[id] && W.jOSApps[id].manifest ? W.jOSApps[id].manifest : {};
    const officiel = Array.isArray(m.tuto) ? m.tuto : Array.isArray(p.tuto) ? p.tuto : null;
    const tien = boxion ? await boxion.get('tutos', id).catch(() => null) : null;
    return { nom: p.nom || m.nom || id, officiel, tien: tien && Array.isArray(tien.etapes) ? tien.etapes : null };
  }
  function fermer() { if (feuille) { feuille.remove(); feuille = null; } }
  async function ouvrir(id = null) {
    fermer();
    const t = await tutoDe(id);
    const f = D.createElement('div'); f.className = 'px-voile px-tuto-hud'; feuille = f;
    const etapes = t ? (t.tien || t.officiel) : null;
    const ici = t ? '<section class="px-th-ici"><h3>' + glyphe('livre') + ' le tuto de ' + esc(t.nom) + '</h3>'
      + (etapes && etapes.length ? '<ol>' + etapes.map(e => '<li>' + esc(typeof e === 'string' ? e : e && e.t) + '</li>').join('') + '</ol>'
        + '<div class="px-th-actions">' + (t.tien ? '<button type="button" data-th="ecrire">✎ le retoucher</button>' : '<button type="button" data-th="ecrire">＋ le tien</button>') + '<button type="button" data-th="partager">↗ partager</button></div>'
        : '<p class="px-sous">Pas encore de tuto pour lui.</p><div class="px-th-actions"><button type="button" class="p" data-th="ecrire">＋ écrire le tuto</button></div>')
      + '</section>' : '';
    f.innerHTML = '<div class="px-tiroir"><p class="px-ft">◎ ce que tu peux faire ' + (id ? 'ici' : 'sur l\'accueil') + '</p>' + ici
      + '<section><h3>les bords</h3><div class="px-th-tel">' + zone('g-haut', 'g') + '<div class="px-th-ecran"><i></i></div>' + zone('d-haut', 'd') + zone('g-milieu', 'g') + zone('d-milieu', 'd') + zone('g-bas', 'g') + zone('d-bas', 'd') + '</div>'
      + '<p class="px-th-deux"><b>les deux bords ensemble</b> · ' + ['haut', 'milieu', 'bas'].map(z => esc(nomAction(geste('deux-' + z)))).filter((x, i, l) => l.indexOf(x) === i).join(' · ') + '</p></section>'
      + '<section><h3>tenir un bord</h3><ul class="px-th-tenir">' + TENIR.map(([k, q, txt]) => '<li><b>' + esc(q) + '</b><span>' + esc(txt) + '</span>' + (demo ? '<button type="button" data-th-demo="' + k + '">▶</button>' : '') + '</li>').join('') + '</ul></section>'
      + '<button type="button" class="p" data-th="ok">ok</button></div>';
    f.addEventListener('click', (e) => {
      const b = e.target.closest && e.target.closest('[data-th-demo],[data-th]');
      if (!b) { if (e.target === f) { fermer(); vibrer('leger'); } return; }
      e.stopPropagation();
      const dm = b.getAttribute('data-th-demo');
      if (dm) { fermer(); vibrer('leger'); W.setTimeout(() => demo && demo.jouer(dm), 260); return; }
      const a = b.getAttribute('data-th');
      if (a === 'ok') { fermer(); vibrer('leger'); }
      else if (a === 'ecrire') ecrire(id, t, f);
      else if (a === 'partager') partager(t, etapes);
    });
    (D.getElementById('ploxi0n') || D.body).appendChild(f);
    vibrer('fx-apercu');
    return f;
  }
  /** ＋ écrire (ou retoucher) le tuto d'un ploxion : une étape par ligne ; gardé dans boxion_local, et noté comme un tsoin « tuto » */
  function ecrire(id, t, f) {
    const sec = f.querySelector('.px-th-ici'); if (!sec) return;
    const deja = (t && (t.tien || t.officiel)) || [];
    sec.innerHTML = '<h3>' + glyphe('editer') + ' le tuto de ' + esc(t ? t.nom : id) + '</h3><p class="px-sous">Une étape par ligne. Il reste à toi ; ↗ pour le donner.</p>'
      + '<textarea data-th-texte rows="6" placeholder="1. ouvre…&#10;2. touche…">' + esc(deja.map(e => (typeof e === 'string' ? e : e && e.t) || '').join('\n')) + '</textarea>'
      + '<div class="px-th-actions"><button type="button" data-th-annuler>annuler</button><button type="button" class="p" data-th-garder>garder</button></div>';
    sec.querySelector('[data-th-annuler]').onclick = (e) => { e.stopPropagation(); ouvrir(id); };
    sec.querySelector('[data-th-garder]').onclick = async (e) => {
      e.stopPropagation();
      const etapes = sec.querySelector('[data-th-texte]').value.split('\n').map(x => x.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean).slice(0, 40);
      if (boxion) await boxion.put('tutos', id, { etapes, le: new Date().toISOString() }).catch(() => {});
      if (tsoin && etapes.length) { try { await tsoin({ texte: 'tuto · ' + (t ? t.nom : id) + '\n' + etapes.map((x, i) => (i + 1) + '. ' + x).join('\n'), genre: 'tuto', ploxion: id }); } catch (er) { /* le tuto est gardé quand même */ } }
      vibrer('succes'); ouvrir(id);
    };
  }
  function partager(t, etapes) {
    const texte = 'tuto · ' + (t ? t.nom : '') + '\n' + (etapes || []).map((x, i) => (i + 1) + '. ' + (typeof x === 'string' ? x : x && x.t)).join('\n') + '\n— ploxi0n';
    const n = W.jOSNatif; if (n && n.partager) n.partager({ texte, titre: 'tuto · ' + (t ? t.nom : '') }).catch(() => {});
    vibrer('leger');
  }
  return { ouvrir, fermer, ouverte: () => !!feuille };
}
