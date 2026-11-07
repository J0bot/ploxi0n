// 🎧 LE XER DE SPOTIFY (0.99.34, RS-7 : « tu peux donner un vrai xer au ploxion spotify ? »). Le ploxion n'est pas son UI, c'est son bion :
// le moteur du labo (/px/spotify : la connexion, le lecteur Spotify, le bus jOSPorts, le tsoin, le fil) reste TEL QUEL ; ploxi0n lui pose une
// autre interface, faite pour le téléphone, sur les mêmes éléments (aucun lecteur réécrit, aucun appel à Spotify en plus) :
//   la bibliothèque en grille de pochettes + une recherche ; une playlist glisse par-dessus (pochette, « ▶ tout jouer », ‹ tes sons) ;
//   le lecteur en carte au-dessus des koins ; le toucher → « en lecture » (la grande pochette, la barre de temps, les gros boutons).
// Le labo change ses classes (.sp__…) ? Le xer ne trouve rien et le ploxion reste comme au labo : jamais cassé.
export const plat = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function habillerSpotify(hote, { W = globalThis.window, vibrer = () => {} } = {}) {
  const D = W.document;
  hote.classList.add('px-xsp');
  let q = '', obs = null, fini = false;
  const $ = (s) => hote.querySelector(s);

  function bibliotheque() {
    const side = $('.sp__side'); if (!side) return;
    // les likés : le labo pose une <img src=""> sur un dégradé (une image cassée sur le téléphone) → un cœur
    side.querySelectorAll('.sp__pl[data-liked] img.sp__plimg').forEach((im) => { if (im.getAttribute('src')) return; const c = D.createElement('span'); c.className = 'sp__plimg px-xsp-coeur'; c.textContent = '♥'; im.replaceWith(c); });
    if (side.querySelector('.px-xsp-q') || !side.querySelector('.sp__pl')) return;
    const champ = D.createElement('input');
    champ.type = 'search'; champ.className = 'px-xsp-q'; champ.placeholder = 'chercher dans tes playlists'; champ.setAttribute('enterkeyhint', 'search'); champ.autocomplete = 'off';
    champ.value = q;
    champ.addEventListener('input', () => { q = champ.value; filtrer(); });
    side.insertBefore(champ, side.firstChild);
    filtrer();
  }
  function filtrer() {
    const k = plat(q).trim();
    hote.querySelectorAll('.sp__side [data-pl]').forEach((el) => { const t = el.querySelector('.sp__plt'); el.hidden = !!k && !plat(t && t.textContent).includes(k); });
  }

  /** une playlist (ou les likés) ouverte : le panneau glisse, avec sa pochette et « tout jouer » */
  function pistes() {
    const main = $('.sp__main'), top = $('.sp__top'); if (!main || !top) return;
    const titre = main.querySelector('.sp__htitle');
    if (!titre) { top.classList.remove('px-xsp-pistes'); return; }
    top.classList.add('px-xsp-pistes');
    if (main.querySelector('.px-xsp-tete')) return;
    const choisie = hote.querySelector('.sp__side .sp__pl.on'), img = choisie && choisie.querySelector('.sp__plimg'), nb = choisie && choisie.querySelector('.sp__plc');
    const tete = D.createElement('div'); tete.className = 'px-xsp-tete';
    tete.innerHTML = '<button type="button" class="px-xsp-retour" aria-label="retour à tes sons">‹ tes sons</button>'
      + '<div class="px-xsp-cover"></div><div class="px-xsp-info"><small></small><button type="button" class="px-xsp-tout">▶ tout jouer</button></div>';
    const cover = tete.querySelector('.px-xsp-cover');
    if (img && img.getAttribute('src')) { const i = D.createElement('img'); i.alt = ''; i.src = img.getAttribute('src'); cover.appendChild(i); } else cover.classList.add('vide');
    tete.querySelector('small').textContent = nb ? nb.textContent : '';
    main.insertBefore(tete, main.firstChild);
    main.scrollTop = 0;
  }

  function lecteur() {
    const bar = $('.sp__bar'); if (!bar || bar.querySelector('.px-xsp-fermer')) return;
    const fermer = D.createElement('button'); fermer.type = 'button'; fermer.className = 'px-xsp-fermer'; fermer.setAttribute('aria-label', 'réduire'); fermer.textContent = '⌄';
    bar.insertBefore(fermer, bar.firstChild);
    const lbl = D.createElement('p'); lbl.className = 'px-xsp-enlecture'; lbl.textContent = 'en lecture'; bar.insertBefore(lbl, fermer.nextSibling);
  }
  function pochetteFond() {
    const bar = $('.sp__bar'), img = bar && bar.querySelector('.sp__barimg');
    if (img && img.getAttribute('src')) bar.style.setProperty('--xsp-art', 'url("' + img.getAttribute('src').replace(/["\\]/g, '') + '")');
  }

  function voir() { if (fini) return; bibliotheque(); pistes(); lecteur(); pochetteFond(); }

  hote.addEventListener('click', (ev) => {
    const t = ev.target;
    if (t.closest('.px-xsp-retour')) { ev.stopPropagation(); vibrer('revenir'); const top = $('.sp__top'); if (top) top.classList.remove('px-xsp-pistes'); return; }
    if (t.closest('.px-xsp-tout')) { ev.stopPropagation(); const p = hote.querySelector('.sp__main .sp__tr'); if (p) { vibrer('ouvrir'); p.click(); } return; }
    if (t.closest('.px-xsp-fermer')) { ev.stopPropagation(); vibrer('minimiser'); const b = $('.sp__bar'); if (b) b.classList.remove('px-xsp-grand'); return; }
    const bar = t.closest('.sp__bar');
    if (bar && !bar.classList.contains('px-xsp-grand') && !t.closest('button, input')) { vibrer('ouvrir'); bar.classList.add('px-xsp-grand'); return; }
  }, true);

  // le labo réécrit sa page (playlists chargées, une playlist ouverte, le titre qui change) : on rhabille ce qui est neuf, rien d'autre
  let prevu = 0;
  obs = new W.MutationObserver(() => { if (prevu) return; prevu = W.requestAnimationFrame(() => { prevu = 0; voir(); }); });
  obs.observe(hote, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
  voir();
  return { couper() { fini = true; if (obs) obs.disconnect(); if (prevu) W.cancelAnimationFrame(prevu); hote.classList.remove('px-xsp'); }, voir };
}

/** les xers de ploxi0n pour des ploxions du labo : id → habiller(hote, o) */
export const XERS_PLOXIONS = { spotify: habillerSpotify };
