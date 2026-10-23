// ⌖ AUTOUR : CE QU'IL Y A AUTOUR DE MOI, EN CONTINU (0.99.9, RS-7 23.10 en marchant dans Zurich ; docs/MAPION.md). Compose le bion `autour`
// (src/bions/autour.js) : OpenStreetMap par Overpass, une case d'environ 1 km à la fois (gardée 3 jours : hors ligne, la dernière connue),
// les toilettes en un geste, des propositions selon l'heure et ton vecteur xerion, « suivre » (la liste se refait quand tu marches, la case
// suivante se charge d'elle-même), et « ＋ poser ici » : mapper soi-même (tes lieux, à toi seul). Toucher un lieu : y aller à pied (Plans).
// Ne pas nuire : seule la case part sur le réseau (son centre), jamais ta position ; « suivre » s'arrête quand on quitte le ploxion.
import { CATEGORIES, cellule, requete, lire, trier, proposer, fleche, metres, plansLien, distance } from '../bions/autour.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
const GARDE = 3 * 864e5;

export function creerAutour({ W = globalThis.window, boxion, http, position, ouvrirLien = null, usage = async () => null, vibrer = () => {}, maintenant = () => Date.now() }) {
  let pos = null, lieux = new Map(), miens = [], genres = null, etat = '', suivi = 0, enCours = new Set(), peindre = () => {};
  const pret = boxion.get('reglages', 'autour-miens').then(l => { if (Array.isArray(l)) miens = l.slice(0, 500); }).catch(() => {});

  /** une case : le cache (3 jours), sinon Overpass (le miroir si le premier est occupé) */
  async function charger(c) {
    if (enCours.has(c.cle)) return; enCours.add(c.cle);
    try {
      const k = await boxion.get('autour', c.cle).catch(() => null);
      if (k && Array.isArray(k.lieux) && maintenant() - (+k.le || 0) < GARDE) { for (const l of k.lieux) lieux.set(l.id, l); return; }
      let err = null;
      for (const base of OVERPASS) {
        try {
          const r = await http.get(base + '?data=' + encodeURIComponent(requete(c)), { headers: { Accept: 'application/json' } });
          if (r.status !== 200) { err = new Error('OpenStreetMap : HTTP ' + r.status); continue; }
          const l = lire(JSON.parse(r.texte || '{}'));
          await boxion.put('autour', c.cle, { le: maintenant(), lieux: l }).catch(() => {});
          for (const x of l) lieux.set(x.id, x); return;
        } catch (e) { err = e; }
      }
      if (k && Array.isArray(k.lieux)) { for (const l of k.lieux) lieux.set(l.id, l); etat = 'hors ligne : ce qu\'on savait de cette case'; }
      else if (err) etat = (err.message || 'OpenStreetMap ne répond pas') + ' ; réessaie dans un moment';
    } finally { enCours.delete(c.cle); }
  }
  /** la case de la position, et celles d'à côté si on est près du bord (à moins de ~300 m) */
  function cellules(p) { const vus = new Map(); for (const [a, b] of [[0, 0], [0.003, 0], [-0.003, 0], [0, 0.004], [0, -0.004]]) { const c = cellule(p.lat + a, p.lng + b); vus.set(c.cle, c); } return [...vus.values()]; }

  async function situer() {
    etat = 'où es-tu…'; peindre();
    try { const p = await position(); if (!p || !Number.isFinite(+p.lat)) throw new Error('pas de position');
      const avant = pos; pos = { lat: +p.lat, lng: +p.lng, precision: +p.precision || null };
      if (!avant || distance(avant, pos) > 40) { etat = ''; peindre(); for (const c of cellules(pos)) { await charger(c); peindre(); } }
      etat = etat.startsWith('où') ? '' : etat; peindre(); return pos;
    } catch (e) { etat = 'la position n\'est pas là : ' + (e.message || e) + ' (Réglages iOS › ploxi0n › Position)'; peindre(); return null; }
  }
  function suivre(oui) {
    W.clearInterval(suivi); suivi = 0;
    if (oui) { suivi = W.setInterval(() => { situer(); }, 20000); situer(); }
    peindre();
  }
  async function poser(genre = 'mien', nom = '') {
    const p = pos || await situer(); if (!p) return null;
    const l = { id: 'mien-' + maintenant().toString(36), genre: 'mien', glyphe: '◉', nom: String(nom || 'mon lieu').slice(0, 60), lat: p.lat, lng: p.lng, le: maintenant(), quoi: genre };
    miens = [...miens, l].slice(-500); await boxion.put('reglages', 'autour-miens', miens).catch(() => {}); vibrer('succes'); peindre(); return l;
  }
  const tous = () => [...lieux.values(), ...miens];
  const aller = (l) => { const u = plansLien(l); vibrer('fx-arrivee'); if (ouvrirLien) ouvrirLien(u); else if (W.open) W.open(u, '_blank'); };

  function mount(hote) {
    let vivant = true, vus = [];
    hote.innerHTML = '<div class="px-page px-autour" data-neurones="fin"><p class="px-grave">⌖ autour</p>'
      + '<p class="px-sous">Ce qu\'il y a autour de toi (OpenStreetMap), du plus proche au plus loin. Ta position ne part pas : seulement le centre d\'une case d\'un kilomètre.</p>'
      + '<div class="px-au-b"><button type="button" data-au="situer">◎ me situer</button><button type="button" data-au="suivre"></button><button type="button" data-au="poser">＋ poser ici</button></div>'
      + '<p class="px-au-etat" data-au-etat></p>'
      + '<button type="button" class="px-au-wc" data-neurone data-au-wc></button>'
      + '<h3 class="px-au-t">◈ à faire autour</h3><div class="px-au-prop" data-au-prop data-neurones="fin"></div>'
      + '<div class="px-au-puces" data-au-puces></div><div class="px-au-liste" data-au-liste data-ecrit></div></div>';
    const $ = (s) => hote.querySelector(s);
    const ligne = (l, i) => '<button type="button" class="px-au-l" data-au-aller="' + i + '"><span class="px-au-g">' + esc(l.glyphe) + '</span><span class="px-au-n">' + esc(l.nom) + (l.horaires ? '<small>' + esc(l.horaires) + '</small>' : '') + '</span><span class="px-au-d">' + metres(l.d) + ' ' + fleche(l.cap) + '</span></button>';
    peindre = async () => {
      if (!vivant) return;
      $('[data-au="suivre"]').textContent = suivi ? '■ ne plus suivre' : '◉ suivre en marchant'; $('[data-au="suivre"]').classList.toggle('on', !!suivi);
      $('[data-au-etat]').textContent = etat || (pos ? (lieux.size + ' lieux autour' + (suivi ? ' · je te suis' : '')) : 'touche « me situer »');
      $('[data-au-puces]').innerHTML = CATEGORIES.map(c => '<button type="button" data-au-genre="' + c[0] + '"' + (genres && genres.includes(c[0]) ? ' class="on"' : '') + '>' + esc(c[1]) + ' ' + esc(c[2]) + '</button>').join('') + '<button type="button" data-au-genre="mien"' + (genres && genres.includes('mien') ? ' class="on"' : '') + '>◉ les miens</button>';
      if (!pos) { $('[data-au-wc]').hidden = true; $('[data-au-prop]').innerHTML = ''; $('[data-au-liste]').innerHTML = ''; return; }
      const wc = trier(tous(), pos, { genres: ['toilettes'], max: 1 })[0], b = $('[data-au-wc]');
      b.hidden = false; b.innerHTML = wc ? '<b>WC</b> les toilettes les plus proches · ' + metres(wc.d) + ' ' + fleche(wc.cap) : '<b>WC</b> pas de toilettes connues ici';
      b.dataset.id = wc ? wc.id : '';
      const u = await usage().catch(() => null); if (!vivant) return;
      const pr = proposer(tous(), pos, { heure: new Date(maintenant()).getHours(), usage: (u && u.px) || {} });
      vus = trier(tous(), pos, { genres, max: 80 });
      $('[data-au-prop]').innerHTML = pr.map((l) => '<button type="button" class="px-au-p" data-neurone data-au-id="' + esc(l.id) + '"><span class="px-au-g">' + esc(l.glyphe) + '</span><b>' + esc(l.nom) + '</b><small>' + metres(l.d) + ' ' + fleche(l.cap) + '</small></button>').join('') || '<p class="px-sous">rien encore</p>';
      $('[data-au-liste]').innerHTML = vus.map(ligne).join('') || '<p class="px-sous">rien de ce genre dans cette case</p>';
    };
    pret.then(() => peindre());
    hote.addEventListener('click', (e) => {
      const g = e.target.closest('[data-au-genre]'); if (g) { const k = g.getAttribute('data-au-genre'); genres = genres && genres.includes(k) ? (genres.filter(x => x !== k).length ? genres.filter(x => x !== k) : null) : [...(genres || []), k]; vibrer('selection'); peindre(); return; }
      const al = e.target.closest('[data-au-aller]'); if (al) { const l = vus[+al.getAttribute('data-au-aller')]; if (l) aller(l); return; }
      const id = (e.target.closest('[data-au-id]') || {}).dataset; if (id && id.auId) { const l = tous().find(x => x.id === id.auId); if (l) aller(l); return; }
      const wc = e.target.closest('[data-au-wc]'); if (wc) { const l = tous().find(x => x.id === wc.dataset.id); if (l) aller(l); return; }
      const b = e.target.closest('[data-au]'); if (!b) return; const a = b.getAttribute('data-au');
      if (a === 'situer') situer(); else if (a === 'suivre') suivre(!suivi); else if (a === 'poser') poser('mien', '');
    });
    if (!pos) situer();
    return { unmount() { vivant = false; suivre(false); peindre = () => {}; hote.innerHTML = ''; } };
  }
  if (W) { W.jOSApps = W.jOSApps || {}; W.jOSApps.autour = { manifest: { id: 'autour', name: 'Autour', icon: '⌖' }, mount }; }
  return { mount, pret, situer, suivre, poser, etat: () => ({ pos, lieux: tous(), etat, suivi: !!suivi }), ploxion: { id: 'autour', nom: 'Autour', icone: '⌖', interne: true } };
}
