// ⬡ LE XER XERBOXION, EN NATIF (0.99.63). RS-7 : « Prio 1 : xer xerboxion », puis le choix « natif dans l'app » ; xerxion1 (13.11) : « le xer
// xerboxion de l'app = le xer chill-tekk du labo : même thème, koins gauche = l'app / droite = le global, hypercube, octogone en bas, ‹ › ;
// + tout le natif iPhone / Android ; ton xer chill-tekk reste le tien ». Jusqu'ici, le mode xerboxion chargeait la page du labo dans un cadre
// (une session à ouvrir, le serveur qui doit répondre) : il est maintenant dessiné ici, hors ligne compris, et la page du labo reste à un
// toucher (onglet Xers › le xer du labo en ligne).
//   - l'en-tête du labo : « Home · N ploxions · M cubions » (le catalogue du labo, gardé hors ligne ; les cubions = ses catégories), filtrer ;
//   - les onglets : Bureau (les tiens, les plus utilisés d'abord), Labo (tout le catalogue, par catégorie : un toucher l'installe et l'ouvre),
//     Capteurs & bions (le natif de l'iPhone : Proche, Autour, la veille, la santé, la lampe, le NFC, le Bluetooth…), Quêtes, Xers ;
//   - des tuiles à l'octogone (les icônes des xerkions : la forme = le type, la couleur = la catégorie), le thème cyan du chill-tekk du labo ;
//   - les koins toujours là (le koin du chill-tekk : trion, hypercube, wormion, portion ; la bande ‹ › en bas).
// Rien n'est appelé sur le réseau ici : le catalogue vient du dépôt (son cache), l'ouverture passe par le routeur (qui installe au besoin).

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const ONGLETS = [['bureau', '△', 'Bureau'], ['labo', '⬡', 'Labo'], ['capteurs', '◉', 'Capteurs & bions'], ['quetes', '⧗', 'Quêtes'], ['xers', '⊠', 'Xers']];
const NATIF = /proche|autour|sante|veille|lampe|nfc|bluetooth|regard|controleur|cape|trackpad|banc|systeme|haptique|camera|photo|ondes|carplay|meteo/i;

/** trier et filtrer : le texte cherché dans le nom, l'id, la catégorie, la description */
export function filtrer(liste, q) {
  const s = String(q || '').toLowerCase().trim(); if (!s) return liste;
  return liste.filter(p => [p.nom, p.id, p.categorie, p.cat, p.description].some(x => String(x || '').toLowerCase().includes(s)));
}
/** les sections d'un onglet : [{ titre, glyphe, items }] */
export function sections(onglet, { installes = [], labo = [], usage = {}, modes = [] } = {}) {
  const ext = installes.filter(p => p && p.id && !p.interne);
  const nb = (p) => +((usage[p.id] && (usage[p.id].seconds || usage[p.id].ouvertures)) || 0);
  if (onglet === 'bureau') return [{ titre: 'Bureau', glyphe: '△', items: [...installes.filter(p => p && p.id && p.id !== 'accueil')].sort((a, b) => nb(b) - nb(a) || String(a.nom).localeCompare(String(b.nom))) }];
  if (onglet === 'labo') {
    const src = labo.length ? labo : ext, par = new Map();
    for (const p of src) { const c = p.categorie || p.cat || 'autre'; if (!par.has(c)) par.set(c, []); par.get(c).push(p); }
    return [...par].sort((a, b) => b[1].length - a[1].length).map(([c, l]) => ({ titre: c, glyphe: '⬡', items: l }));
  }
  if (onglet === 'capteurs') return [{ titre: 'Capteurs & bions', glyphe: '◉', items: installes.filter(p => p && p.id && (NATIF.test(p.id) || (Array.isArray(p.bions) && p.bions.includes('jOSNatif')))) }];
  if (onglet === 'quetes') {
    const vus = new Set(), l = [...installes, ...labo].filter(p => p && p.id && /qu[eê]te|defi|progression|xp\b|jeu/i.test(p.id + ' ' + (p.nom || '')) && !vus.has(p.id) && vus.add(p.id));
    return [{ titre: 'Quêtes', glyphe: '⧗', items: l }];
  }
  if (onglet === 'xers') return [{ titre: 'Xers', glyphe: '⊠', items: [...modes.map(m => ({ id: 'xer:' + m.id, nom: m.nom, xer: m.id, on: m.on, description: m.description })),
    ...installes.filter(p => p && /^xer(-|$)|xer-en-ligne/.test(p.id))] }];
  return [];
}

/**
 * installes() → le catalogue du routeur ; labo() → Promise<[{ id, nom, icone, categorie }]> (le dépôt, son cache) ; icone(p) → svg ;
 * ouvrir(id) ; choisirMode(id) ; modes() → [{ id, nom, on, description }] ; usage() → Promise<{ id: { seconds } }> ; enLigne() (le xer du labo)
 */
export function creerXerXerboxion({ W = globalThis.window, installes = () => [], labo = async () => [], icone = (p) => esc(p.icone || '◇'), ouvrir = () => {}, choisirMode = () => {},
  modes = () => [], usage = async () => ({}), enLigne = null, vibrer = () => {} } = {}) {
  const D = W.document;
  let hote = null, onglet = 'bureau', q = '', cacheLabo = [], cacheUsage = {}, charge = false;
  function tuile(p) {
    const ic = p.xer ? '<span class="px-xbx-x">' + (p.on ? '◉' : '⊠') + '</span>' : icone(p);
    return '<button type="button" class="px-xbx-t' + (p.on ? ' on' : '') + '" data-xbx-id="' + esc(p.id) + '"' + (p.xer ? ' data-xbx-xer="' + esc(p.xer) + '"' : '')
      + ' aria-label="' + esc(p.nom || p.id) + '"><span class="px-xbx-ic">' + ic + '</span><span class="px-xbx-n">' + esc(p.nom || p.id) + '</span></button>';
  }
  function peindre() {
    if (!hote) return;
    const inst = installes() || [], ss = sections(onglet, { installes: inst, labo: cacheLabo, usage: cacheUsage, modes: modes() || [] })
      .map(s => ({ ...s, items: filtrer(s.items, q) })).filter(s => s.items.length || onglet !== 'labo');
    const total = cacheLabo.length || inst.length, cubions = new Set((cacheLabo.length ? cacheLabo : inst).map(p => p.categorie || p.cat).filter(Boolean)).size;
    hote.querySelector('[data-xbx-compte]').textContent = total + ' ploxions · ' + cubions + ' cubions';
    for (const b of hote.querySelectorAll('[data-xbx-onglet]')) b.classList.toggle('on', b.getAttribute('data-xbx-onglet') === onglet);
    const corps = hote.querySelector('[data-xbx-corps]');
    corps.innerHTML = ss.map(s => '<section class="px-xbx-s"><h3><span>' + esc(s.glyphe) + '</span> ' + esc(s.titre) + ' <small>' + s.items.length + '</small></h3>'
      + (s.items.length ? '<div class="px-xbx-g">' + s.items.map(tuile).join('') + '</div>' : '<p class="px-xbx-vide">' + (q ? 'rien pour « ' + esc(q) + ' »' : 'rien ici pour l\'instant') + '</p>') + '</section>').join('')
      + (onglet === 'xers' && enLigne ? '<button type="button" class="px-xbx-lien" data-xbx-enligne>⬡ le xer du labo, en ligne (la page chill-tekk)</button>' : '')
      + (onglet === 'labo' && !cacheLabo.length ? '<p class="px-xbx-vide">le catalogue du labo arrive avec le réseau ; en attendant, tes ploxions</p>' : '');
  }
  async function charger() {
    if (charge) return; charge = true;
    try { cacheLabo = (await labo()) || []; } catch (e) { cacheLabo = []; }
    try { cacheUsage = (await usage()) || {}; } catch (e) { cacheUsage = {}; }
    peindre();
  }
  /** le panneau, monté dans `el` (gardé d'un dessin de l'accueil à l'autre : mêmes onglet, filtre et défilement) */
  function monter(el) {
    if (!hote) {
      hote = D.createElement('div'); hote.className = 'px-xbx';
      hote.innerHTML = '<div class="px-xbx-tete"><span class="px-xbx-glo">⬡</span><b>Home</b><small data-xbx-compte></small>'
        + '<input class="px-xbx-q" data-xbx-q placeholder="filtrer…" autocomplete="off" enterkeyhint="search"></div>'
        + '<nav class="px-xbx-ong">' + ONGLETS.map(([k, g, n]) => '<button type="button" data-xbx-onglet="' + k + '"><span>' + g + '</span> ' + esc(n) + '</button>').join('') + '</nav>'
        + '<div class="px-xbx-corps" data-xbx-corps></div>';
      hote.addEventListener('input', (e) => { if (e.target.matches('[data-xbx-q]')) { q = e.target.value; peindre(); } });
      hote.addEventListener('click', (e) => {
        const o = e.target.closest('[data-xbx-onglet]'); if (o) { e.stopPropagation(); onglet = o.getAttribute('data-xbx-onglet'); vibrer('selection'); peindre(); hote.querySelector('[data-xbx-corps]').scrollTop = 0; return; }
        if (e.target.closest('[data-xbx-enligne]')) { e.stopPropagation(); vibrer('selection'); if (enLigne) enLigne(); return; }
        const t = e.target.closest('[data-xbx-id]'); if (!t) return; e.stopPropagation();
        const x = t.getAttribute('data-xbx-xer'); vibrer('fx-arrivee');
        if (x) { choisirMode(x); return; }
        ouvrir(t.getAttribute('data-xbx-id'));
      }, true);
    }
    if (hote.parentNode !== el) el.appendChild(hote);
    peindre(); charger();
    return hote;
  }
  return { monter, peindre, onglet: (k) => { if (k) { onglet = k; peindre(); } return onglet; }, filtre: (s) => { if (s != null) { q = String(s); peindre(); } return q; }, recharger: () => { charge = false; return charger(); } };
}
