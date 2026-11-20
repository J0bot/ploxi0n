// ⌖ AUTOUR : CE QU'IL Y A AUTOUR DE MOI, EN CONTINU (0.99.9, RS-7 23.10 en marchant dans Zurich ; docs/MAPION.md). Compose le bion `autour`
// (src/bions/autour.js) : OpenStreetMap par Overpass, une case d'environ 1 km à la fois (gardée 3 jours : hors ligne, la dernière connue),
// les toilettes en un geste, des propositions selon l'heure et ton vecteur xerion, « suivre » (la liste se refait quand tu marches, la case
// suivante se charge d'elle-même), et « ＋ poser ici » : mapper soi-même (tes lieux, à toi seul). Toucher un lieu : y aller à pied (Plans).
// Ne pas nuire : seule la case part sur le réseau (son centre), jamais ta position ; « suivre » s'arrête quand on quitte le ploxion.
// (0.99.15) la boussole : les flèches tournent avec toi (deviceorientation, la boussole de CoreMotion via web-natif) ; les trottinettes et les
// vélos en direct en Suisse (sharedmobility.ch, la même case ; une minute de fraîcheur, gardés en mémoire seulement).
import { CATEGORIES, cellule, requete, lire, trier, proposer, fleche, metres, plansLien, distance, capBoussole, enSuisse, requeteVehicules, lireVehicules, resumeAutour } from '../bions/autour.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
const GARDE = 3 * 864e5;

// ◉ (0.99.59, RS-7 : « pour Autour, le truc live comme Proche : toujours savoir ce qu'il y a autour, voir quand je partage ma position avec mes
// potes, et la distance de mes potes ») EN DIRECT : une Live Activity (écran verrouillé, Dynamic Island) : les lieux les plus proches, si tu
// partages ta position, le pote le plus proche avec sa distance et sa direction (sinon le lieu le plus proche). Elle se met à jour quand l'app
// est réveillée (toutes les 30 s ; en arrière-plan, quand Proche ou la veille la gardent éveillée). activite = { debut, maj, fin } ;
// potes() → { partage, positions } (Proche).
export function creerAutour({ W = globalThis.window, boxion, http, position, ouvrirLien = null, usage = async () => null, vibrer = () => {}, maintenant = () => Date.now(), activite = null, potes = () => null }) {
  let pos = null, lieux = new Map(), miens = [], genres = null, etat = '', suivi = 0, enCours = new Set(), peindre = () => {};
  let vehicules = [], vehCase = '', vehLe = 0, cap0 = null;
  // 🏝 (0.99.43) la balade : la Live Activity de PloxiVeille (écran verrouillé, Dynamic Island) ; pendant une balade, toucher un lieu en fait la cible
  let balade = null;   // null, ou { cible: { id, nom, lat, lng } | null }
  const V = () => (W.jOSVeille && W.jOSVeille.balade) || null;
  const pret = boxion.get('reglages', 'autour-miens').then(l => { if (Array.isArray(l)) miens = l.slice(0, 500); }).catch(() => {});
  // ◉ en direct
  let direct = false, tDirect = 0, texteDirect = '';
  function resumeDirect() {
    let pt = null; try { pt = potes(); } catch (e) { pt = null; }
    return resumeAutour({ pos, lieux: tous(), potes: (pt && pt.positions) || [], partage: !!(pt && pt.partage), maintenant: maintenant() });
  }
  async function majDirect(premier = false) {
    if (!direct || !activite) return;
    if (!premier) await situer();
    const r = resumeDirect(), t = JSON.stringify(r);
    if (premier) { texteDirect = t; await activite.debut(r).catch(() => {}); return; }
    if (t !== texteDirect) { texteDirect = t; activite.maj(r).catch(() => {}); }
  }
  async function enDirect(oui) {
    if (!activite) return false;
    direct = !!oui; W.clearInterval(tDirect); tDirect = 0;
    await boxion.put('reglages', 'autour-direct', direct).catch(() => {});
    if (direct) { if (!pos) await situer(); await majDirect(true); tDirect = W.setInterval(() => { majDirect(); }, 30000); etat = '◉ autour est sur l\'écran verrouillé'; }
    else { texteDirect = ''; await activite.fin().catch(() => {}); etat = '◉ plus en direct'; }
    vibrer('selection'); peindre(); W.setTimeout(() => { etat = ''; peindre(); }, 3500);
    return direct;
  }
  // relancée : le direct reprend s'il était allumé (l'activité d'iOS, elle, a survécu ou non)
  boxion.get('reglages', 'autour-direct').then(v => { if (v === true && activite) { direct = true; pret.then(() => situer()).then(() => majDirect(true)).catch(() => {}); tDirect = W.setInterval(() => { majDirect(); }, 30000); } }).catch(() => {});

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
  /** les trottinettes et vélos libres de la case (sharedmobility.ch) : en Suisse seulement, une minute de fraîcheur */
  async function chargerVehicules() {
    if (!pos || !enSuisse(pos)) { vehicules = []; return; }
    const c = cellule(pos.lat, pos.lng); if (c.cle === vehCase && maintenant() - vehLe < 60e3) return;
    vehCase = c.cle; vehLe = maintenant();
    try { const r = await http.get(requeteVehicules(c), { headers: { Accept: 'application/json' } }); if (r.status === 200) vehicules = lireVehicules(JSON.parse(r.texte || '{}')); }
    catch (e) { /* le direct manque : les vélos d'OpenStreetMap restent */ }
  }
  /** la case de la position, et celles d'à côté si on est près du bord (à moins de ~300 m) */
  function cellules(p) { const vus = new Map(); for (const [a, b] of [[0, 0], [0.003, 0], [-0.003, 0], [0, 0.004], [0, -0.004]]) { const c = cellule(p.lat + a, p.lng + b); vus.set(c.cle, c); } return [...vus.values()]; }

  async function situer() {
    etat = 'où es-tu…'; peindre();
    try { const p = await position(); if (!p || !Number.isFinite(+p.lat)) throw new Error('pas de position');
      const avant = pos; pos = { lat: +p.lat, lng: +p.lng, precision: +p.precision || null };
      if (!avant || distance(avant, pos) > 40) { etat = ''; peindre(); for (const c of cellules(pos)) { await charger(c); peindre(); } }
      await chargerVehicules();
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
  const tous = () => [...lieux.values(), ...vehicules, ...miens];
  async function baladeOnOff(cible = null) {
    const B = V(); if (!B) return;
    try {
      if (balade && !cible) { const r = await B.fin(); balade = null; etat = '🏝 balade finie · ' + metres(r.metres || 0); }
      else if (balade) { await B.cible(cible); balade.cible = cible; etat = '🏝 sur l\'écran verrouillé : ' + cible.nom; }
      else { await B.debut({ titre: 'balade', ploxion: 'autour', cible }); balade = { cible }; etat = '🏝 la balade est sur l\'écran verrouillé' + (cible ? ' : ' + cible.nom : ' · touche un lieu pour t\'y guider'); }
      vibrer('selection');
    } catch (e) { etat = '🏝 ' + ((e && e.message) || 'impossible'); }
    peindre(); W.setTimeout(() => { etat = ''; peindre(); }, 4000);
  }
  const cibleDe = (l) => ({ id: l.id, nom: ((l.glyphe && !/^[\p{L}\p{N}]+$/u.test(l.glyphe) ? l.glyphe + ' ' : '') + (l.nom || '')).trim().slice(0, 40), lat: l.lat, lng: l.lng });   // « WC » n'est pas un symbole : pas « WC WC de la place »
  const aller = (l) => {
    if (balade) { baladeOnOff(cibleDe(l)); return; }   // en balade : le lieu devient la cible (↗ Plans reste dans la barre)
    const u = plansLien(l); vibrer('fx-arrivee'); if (ouvrirLien) ouvrirLien(u); else if (W.open) W.open(u, '_blank'); };

  function mount(hote) {
    let vivant = true, vus = [];
    hote.innerHTML = '<div class="px-page px-autour" data-neurones="fin"><p class="px-grave">⌖ autour</p>'
      + '<p class="px-sous">Ce qu\'il y a autour de toi (OpenStreetMap), du plus proche au plus loin. Ta position ne part pas : seulement le centre d\'une case d\'un kilomètre.</p>'
      + '<div class="px-au-b"><button type="button" data-au="situer">◎ me situer</button><button type="button" data-au="suivre"></button><button type="button" data-au="poser">＋ poser ici</button>' + (activite ? '<button type="button" data-au="direct"></button>' : '') + (V() ? '<button type="button" data-au="balade"></button>' : '') + '</div>'
      + '<div class="px-au-b px-au-balade" data-au-bal hidden></div>'
      + '<p class="px-au-etat" data-au-etat></p>'
      + '<button type="button" class="px-au-wc" data-neurone data-au-wc></button>'
      + '<button type="button" class="px-au-wc px-au-tr" data-neurone data-au-tr hidden></button>'
      + '<h3 class="px-au-t">◈ à faire autour</h3><div class="px-au-prop" data-au-prop data-neurones="fin"></div>'
      + '<div class="px-au-puces" data-au-puces></div><div class="px-au-liste" data-au-liste data-ecrit></div>'
      + (W.jOSOndes ? '<h3 class="px-au-t">ᛒ les ondes autour</h3><div class="px-au-b"><button type="button" data-au="ondes"></button></div><div class="px-au-liste" data-au-ondes data-ecrit></div>' : '')
      + '</div>';
    const $ = (s) => hote.querySelector(s);
    const f = (l) => '<span data-au-f="' + Math.round(l.cap) + '">' + fleche(l.cap, cap0 || 0) + '</span>';   // la flèche : relative à ta direction si la boussole parle
    const ligne = (l, i) => '<button type="button" class="px-au-l" data-au-aller="' + i + '"><span class="px-au-g">' + esc(l.glyphe) + '</span><span class="px-au-n">' + esc(l.nom) + (l.horaires ? '<small>' + esc(l.horaires) + '</small>' : '') + (l.direct ? '<small>en direct · sharedmobility.ch</small>' : '') + '</span><span class="px-au-d">' + metres(l.d) + ' ' + f(l) + '</span></button>';
    let tour = 0;
    const tourner = () => { tour = 0; for (const x of hote.querySelectorAll('[data-au-f]')) x.textContent = fleche(+x.getAttribute('data-au-f'), cap0 || 0); };
    const boussole = (e) => { const c = capBoussole(e); if (c == null) return; const d = cap0 == null ? 999 : Math.abs(((c - cap0 + 540) % 360) - 180);
      if (d < 8) return; const premier = cap0 == null; cap0 = c; if (premier) peindre(); else if (!tour) tour = W.requestAnimationFrame(tourner); };
    W.addEventListener('deviceorientation', boussole);
    // ᛒ (0.99.20) tout ce qui émet en Bluetooth autour : le plus proche en haut, la distance estimée, le fabricant, les ploxis marqués
    let ondesOn = false, offOndes = null, tOndes = 0;
    const peindreOndes = () => { tOndes = 0; const el = $('[data-au-ondes]'), b = $('[data-au="ondes"]'); if (!el || !W.jOSOndes) return;
      b.textContent = ondesOn ? '■ arrêter' : '◎ écouter les ondes'; b.classList.toggle('on', ondesOn);
      const l = W.jOSOndes.appareils();
      el.innerHTML = l.slice(0, 60).map(v => '<div class="px-au-l"><span class="px-au-g">' + (v.ploxi ? '◉' : 'ᛒ') + '</span><span class="px-au-n">' + esc(v.nom || v.fabricant || 'inconnu')
        + '<small>' + esc([v.nom && v.fabricant, v.connectable ? 'connectable' : '', v.rssi + ' dBm'].filter(Boolean).join(' · ')) + '</small></span><span class="px-au-d">~' + v.distance + ' m</span></div>').join('')
        || (ondesOn ? '<p class="px-sous">j\'écoute…</p>' : '<p class="px-sous">écoute tout ce qui émet en Bluetooth autour : montres, écouteurs, ESP32, téléphones avec ploxi0n</p>'); };
    const ondes = (oui) => { if (!W.jOSOndes) return; ondesOn = oui;
      if (oui) { W.jOSOndes.scanner().catch(() => {}); if (!offOndes) offOndes = W.jOSOndes.sur(() => { if (!tOndes) tOndes = W.setTimeout(peindreOndes, 700); }); }
      else { W.jOSOndes.arreter(); if (offOndes) { offOndes(); offOndes = null; } }
      peindreOndes(); };
    peindre = async () => {
      if (!vivant) return;
      peindreOndes();
      $('[data-au="suivre"]').textContent = suivi ? '■ ne plus suivre' : '◉ suivre en marchant'; $('[data-au="suivre"]').classList.toggle('on', !!suivi);
      const bd = $('[data-au="direct"]'); if (bd) { bd.textContent = direct ? '■ plus en direct' : '◉ en direct'; bd.classList.toggle('on', direct); }
      const bb = $('[data-au="balade"]'); if (bb) { bb.textContent = balade ? '■ finir la balade' : '🏝 balade'; bb.classList.toggle('on', !!balade); }
      const bl = $('[data-au-bal]'); if (bl) { bl.hidden = !balade; bl.innerHTML = balade ? '<span class="px-sous">🏝 ' + (balade.cible ? 'vers ' + esc(balade.cible.nom) : 'touche un lieu : il te guide depuis l\'écran verrouillé') + '</span>' + (balade.cible ? '<button type="button" data-au="plans">↗ Plans</button><button type="button" data-au="sans">✕ cible</button>' : '') : ''; }
      $('[data-au-etat]').textContent = etat || (pos ? ((lieux.size + vehicules.length) + ' lieux autour' + (suivi ? ' · je te suis' : '') + (cap0 != null ? ' · boussole' : '')) : 'touche « me situer »');
      $('[data-au-puces]').innerHTML = CATEGORIES.map(c => '<button type="button" data-au-genre="' + c[0] + '"' + (genres && genres.includes(c[0]) ? ' class="on"' : '') + '>' + esc(c[1]) + ' ' + esc(c[2]) + '</button>').join('') + '<button type="button" data-au-genre="mien"' + (genres && genres.includes('mien') ? ' class="on"' : '') + '>◉ les miens</button>';
      if (!pos) { $('[data-au-wc]').hidden = true; $('[data-au-prop]').innerHTML = ''; $('[data-au-liste]').innerHTML = ''; return; }
      const wc = trier(tous(), pos, { genres: ['toilettes'], max: 1 })[0], b = $('[data-au-wc]');
      b.hidden = false; b.innerHTML = wc ? '<b>WC</b> les toilettes les plus proches · ' + metres(wc.d) + ' ' + f(wc) : '<b>WC</b> pas de toilettes connues ici';
      b.dataset.id = wc ? wc.id : '';
      const tr = trier(vehicules, pos, { max: 1 })[0], bt = $('[data-au-tr]');
      bt.hidden = !tr; bt.dataset.id = tr ? tr.id : ''; if (tr) bt.innerHTML = '<b>⋈</b> ' + esc(tr.sorte) + (tr.fournisseur ? ' · ' + esc(tr.fournisseur) : '') + ' · ' + metres(tr.d) + ' ' + f(tr) + '<small>en direct · sharedmobility.ch</small>';
      const u = await usage().catch(() => null); if (!vivant) return;
      const pr = proposer(tous(), pos, { heure: new Date(maintenant()).getHours(), usage: (u && u.px) || {} });
      vus = trier(tous(), pos, { genres, max: 80 });
      $('[data-au-prop]').innerHTML = pr.map((l) => '<button type="button" class="px-au-p" data-neurone data-au-id="' + esc(l.id) + '"><span class="px-au-g">' + esc(l.glyphe) + '</span><b>' + esc(l.nom) + '</b><small>' + metres(l.d) + ' ' + f(l) + '</small></button>').join('') || '<p class="px-sous">rien encore</p>';
      $('[data-au-liste]').innerHTML = vus.map(ligne).join('') || '<p class="px-sous">rien de ce genre dans cette case</p>';
    };
    pret.then(() => peindre());
    if (V() && !balade && W.jOSVeille.etat) W.jOSVeille.etat().then(r => { if (r && r.balade && !balade) { balade = { cible: null }; peindre(); } }).catch(() => {});   // l'app relancée pendant une balade
    hote.addEventListener('click', (e) => {
      const g = e.target.closest('[data-au-genre]'); if (g) { const k = g.getAttribute('data-au-genre'); genres = genres && genres.includes(k) ? (genres.filter(x => x !== k).length ? genres.filter(x => x !== k) : null) : [...(genres || []), k]; vibrer('selection'); peindre(); return; }
      const al = e.target.closest('[data-au-aller]'); if (al) { const l = vus[+al.getAttribute('data-au-aller')]; if (l) aller(l); return; }
      const id = (e.target.closest('[data-au-id]') || {}).dataset; if (id && id.auId) { const l = tous().find(x => x.id === id.auId); if (l) aller(l); return; }
      const wc = e.target.closest('[data-au-wc],[data-au-tr]'); if (wc) { const l = tous().find(x => x.id === wc.dataset.id); if (l) aller(l); return; }
      const b = e.target.closest('[data-au]'); if (!b) return; const a = b.getAttribute('data-au');
      if (a === 'situer') situer(); else if (a === 'suivre') suivre(!suivi); else if (a === 'poser') poser('mien', ''); else if (a === 'ondes') ondes(!ondesOn);
      else if (a === 'balade') baladeOnOff(null);
      else if (a === 'direct') enDirect(!direct);
      else if (a === 'plans' && balade && balade.cible) { const u = plansLien(balade.cible); if (ouvrirLien) ouvrirLien(u); else if (W.open) W.open(u, '_blank'); }
      else if (a === 'sans' && balade) { const B = V(); if (B) B.cible(null).then(() => { balade.cible = null; peindre(); }).catch(() => {}); }
    });
    if (!pos) situer();
    return { unmount() { vivant = false; suivre(false); if (ondesOn) ondes(false); if (tOndes) W.clearTimeout(tOndes); W.removeEventListener('deviceorientation', boussole); if (tour) W.cancelAnimationFrame(tour); peindre = () => {}; hote.innerHTML = ''; } };
  }
  if (W) { W.jOSApps = W.jOSApps || {}; W.jOSApps.autour = { manifest: { id: 'autour', name: 'Autour', icon: '⌖' }, mount }; }
  /** 🎛 (0.99.43) le bouton « Toilettes » du Centre de contrôle : les plus proches, guidées depuis l'écran verrouillé (la balade) */
  async function toilettes() {
    await pret; if (!(await situer())) return null;
    const wc = trier(tous(), pos, { genres: ['toilettes'], max: 1 })[0]; if (!wc) { etat = 'WC : pas de toilettes connues ici'; peindre(); return null; }
    if (V()) await baladeOnOff(cibleDe(wc)); else aller(wc);
    return wc;
  }
  return { mount, pret, situer, suivre, poser, toilettes, balade: () => balade, enDirect, direct: () => direct, resumeDirect, etat: () => ({ pos, lieux: tous(), etat, suivi: !!suivi, cap: cap0, vehicules: vehicules.length }), ploxion: { id: 'autour', nom: 'Autour', icone: '⌖', interne: true } };
}
