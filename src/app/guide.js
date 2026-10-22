// 🧭 LE GUIDE (0.95). RS-7 (22.10) : « je veux que le système de tutoriel soit amélioré au maximum, parce que là, à toutes les mises à jour,
// les gens me disent que c'est trop compliqué ». Le tuto d'avant (onboarding.js) : neuf cartes de texte, qui parlaient d'un dock que les
// koins remplacent. Le guide, trois idées, sans paragraphes :
//   1. APPRENDRE EN FAISANT : quatre étapes seulement, sur la VRAIE interface. L'écran s'assombrit sauf ce qu'il faut toucher (le projecteur),
//      une phrase, un doigt qui pulse dessus ; l'étape passe quand tu l'as FAIT (ouvert, revenu…). « passer » partout.
//   2. LES ASTUCES AU BON MOMENT : la première fois qu'une chose apparaît (les koins, un trackpad, la map, les modes…), une bulle d'UNE phrase
//      à côté d'elle ; « compris », ou ▶ montre-moi (le doigt fantôme, demo.js) quand il y a une démo. Une fois chacune.
//   3. « C'EST QUOI ÇA ? » : touche n'importe quoi, l'app dit ce que c'est (l'astuce connue, sinon son nom) ; rien ne s'ouvre. ⓘ dans la barre
//      des koins, ⚙ › À propos, et la dernière étape.
// boxion_local « reglages/guide » = { vu: VERSION_GUIDE, astuces: [ids vues] }.
export const VERSION_GUIDE = 2;   // 1 = les neuf cartes d'avant : tout le monde voit le nouveau guide une fois

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** les étapes : cible (un sélecteur, la première visible), la phrase, et quand c'est fait (r = le routeur) */
export const ETAPES = [
  { id: 'ouvrir', cible: '.px-accueil [data-id]', texte: 'Touche un ploxion : il s\'ouvre.', fait: (r) => !!(r && r.courant && r.courant()) },
  { id: 'revenir', cible: '.px-retour, .px-koin-gauche', texte: '‹ te ramène à l\'accueil. Ton ploxion reste vivant.', sous: 'ou glisse depuis le bord gauche', fait: (r) => !!(r && r.courant && !r.courant()) },
  { id: 'xer', cible: '.px-modes', texte: 'Ton xer : la même app, une autre allure. Organique, c\'est le vivant ; chill-tekk, celui d\'avant.', sous: 'touche « suivant » quand tu as vu', fait: null },
  { id: 'fin', cible: null, texte: 'C\'est tout. Le reste, l\'app te le montre quand tu le croises.', sous: 'perdu ? ⓘ « c\'est quoi ça ? » : touche n\'importe quoi, l\'app te dit ce que c\'est', fait: null },
];

/** les astuces : la première fois que la cible est visible ; une phrase ; une démo (demo.js) si elle existe */
export const ASTUCES = [
  { id: 'koins', cible: '.px-koin-gauche', texte: 'Tes koins : touche un coin pour qu\'il grandisse ; glisse vers le haut, tout s\'ouvre.' },
  { id: 'wormion', cible: '[data-pad="wormion"]', texte: 'Le temps : tourne ton doigt dessus, tu remontes ce que tu avais ouvert. Lâche pour y aller.' },
  { id: 'portion', cible: '[data-pad="portion"]', texte: 'Glisse dessus : ← → tes apps, ↑ la map, ↓ l\'accueil.' },
  { id: 'map', cible: '.px-map-ici', texte: 'La map : glisse pour aller au hub d\'à côté ; touche un koin pour l\'ouvrir ; ＋ crée le tien.' },
  { id: 'modes', cible: '.px-modes', texte: 'Ton xer : organique (vivant), chill-tekk (celui d\'avant), xerboxion (le labo), xerbot (le monde physique).' },
  { id: 'bande', cible: '.px-bande-suite', texte: 'La bande : l\'app suivante dépasse à droite ; touche-la pour y aller.' },
  { id: 'systeme', cible: '.px-btop', texte: 'Le système : ce que fait ton iPhone et l\'app, en direct.' },
  { id: 'ambiances', cible: '.px-ambiances [data-amb-sons]', texte: 'Monte un son : il continue quand tu changes d\'app. ‹ coupe tout.' },
];

export function creerGuide({ W = globalThis.window, boxion, routeur = () => null, vibrer = () => {}, demo = null, connecter = null } = {}) {
  const D = W.document;
  let etat = { vu: 0, astuces: [] }, couche = null, tic = null, enCours = false, quoi = null;
  const pret = boxion.get('reglages', 'guide').then(v => { if (v && typeof v === 'object') etat = { vu: +v.vu || 0, astuces: Array.isArray(v.astuces) ? v.astuces : [] }; }).catch(() => {});
  const garder = () => boxion.put('reglages', 'guide', { ...etat, le: new Date().toISOString() }).catch(() => {});
  const visible = (el) => { if (!el || !el.isConnected) return null; const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < (W.innerHeight || 9999) ? r : null; };
  const premier = (sel) => { if (!sel) return null; for (const el of D.querySelectorAll(sel)) { const r = visible(el); if (r) return { el, r }; } return null; };

  // ---- le projecteur : tout s'assombrit sauf la cible ; la bulle au-dessus ou en dessous ----
  function fermer() { if (couche) { couche.remove(); couche = null; } if (tic) { W.clearInterval(tic); tic = null; } }
  function projeter(cible, { texte, sous = '', boutons = '', doigt = true } = {}) {
    if (!couche) { couche = D.createElement('div'); couche.className = 'px-guide'; D.body.appendChild(couche); }   // au-dessus de tout (les koins vivent sur body)
    const H = W.innerHeight || 800, r = cible ? cible.r : null, m = 8;
    const trou = r ? '<i class="px-guide-trou" style="left:' + (r.left - m) + 'px;top:' + (r.top - m) + 'px;width:' + (r.width + 2 * m) + 'px;height:' + (r.height + 2 * m) + 'px"></i>'
      + (doigt ? '<i class="px-guide-doigt" style="left:' + (r.left + r.width / 2 - 22) + 'px;top:' + (r.top + r.height / 2 - 22) + 'px"></i>' : '') : '<i class="px-guide-voile"></i>';
    const haut = r && r.top + r.height / 2 > H / 2;   // la cible en bas : la bulle au-dessus
    const pos = r ? (haut ? 'bottom:' + Math.round(H - r.top + 18) + 'px' : 'top:' + Math.round(r.bottom + 18) + 'px') : 'top:38%';
    couche.innerHTML = trou + '<div class="px-guide-bulle" style="' + pos + '"><p>' + esc(texte) + '</p>' + (sous ? '<small>' + esc(sous) + '</small>' : '') + '<div class="px-guide-b">' + boutons + '</div></div>';
  }

  // ---- 1. apprendre en faisant ----
  function montrer() {
    if (enCours) return; enCours = true; let i = 0;
    const fin = async () => { enCours = false; fermer(); etat.vu = VERSION_GUIDE; await garder(); };
    const peindre = () => {
      const e = ETAPES[i]; if (!e) return fin();
      const c = premier(e.cible), dernier = i === ETAPES.length - 1;
      if (e.cible && !c && e.fait) { i++; return peindre(); }   // rien à toucher ici (déjà fait, ou pas sur cet écran) : la suivante
      projeter(c, { texte: e.texte, sous: e.sous,
        boutons: '<button type="button" data-g="passer">passer</button>'
          + (dernier ? '<button type="button" data-g="quoi">ⓘ essayer « c\'est quoi ça ? »</button>' + (connecter ? '<button type="button" data-g="connecter">se connecter</button>' : '') : '')
          + (!e.fait ? '<button type="button" class="p" data-g="suivant">' + (dernier ? 'c\'est parti' : 'suivant') + '</button>' : '')
          + '<span class="px-guide-n">' + (i + 1) + ' / ' + ETAPES.length + '</span>' });
      vibrer(i ? 'selection' : 'motif:vague');
    };
    couche = null; peindre();
    couche.addEventListener('click', async (ev) => {
      const b = ev.target.closest('[data-g]'); if (!b) return;
      const g = b.getAttribute('data-g');
      if (g === 'passer') return fin();
      if (g === 'quoi') { await fin(); return cestQuoi(); }
      if (g === 'connecter') { await fin(); return connecter(); }
      i++; peindre();
    });
    // l'étape passe quand c'est fait (un regard 4 fois par seconde, seulement pendant le guide)
    tic = W.setInterval(() => {
      const e = ETAPES[i]; if (!e) return;
      if (e.fait && e.fait(routeur())) { vibrer('succes'); i++; peindre(); return; }
      const c = premier(e.cible); if (c && couche) { const t = couche.querySelector('.px-guide-trou'); if (t && Math.abs(parseFloat(t.style.top) - (c.r.top - 8)) > 2) peindre(); }
    }, 250);
  }

  // ---- 2. les astuces : une fois chacune, quand elles apparaissent (rien pendant le guide) ----
  let prevu = false;
  function regarder() {
    prevu = false;
    if (enCours || quoi || couche) return;
    for (const a of ASTUCES) {
      if (etat.astuces.includes(a.id)) continue;
      const c = premier(a.cible); if (!c) continue;
      etat.astuces.push(a.id); garder();
      projeter(c, { texte: a.texte, doigt: false, boutons: (a.demo && demo ? '<button type="button" data-g="demo">▶ montre-moi</button>' : '') + '<button type="button" class="p" data-g="ok">compris</button>' });
      couche.classList.add('px-guide-astuce');
      couche.addEventListener('click', (ev) => { const b = ev.target.closest('[data-g]'); if (!b) return; fermer(); if (b.getAttribute('data-g') === 'demo') demo.jouer(a.demo); }, { once: false });
      vibrer('leger');
      return;
    }
  }
  const prevoir = () => { if (prevu) return; prevu = true; W.setTimeout(regarder, 700); };   // laisser l'écran se poser

  // ---- 3. c'est quoi ça ? : le prochain toucher explique au lieu d'agir ----
  function expliquer(el) {
    const a = ASTUCES.find(x => el.closest(x.cible)) || null;
    const nom = (el.closest('[aria-label]') || {}).getAttribute ? (el.closest('[aria-label]') || el).getAttribute('aria-label') : '';
    const titre = (el.closest('[title]') || {}).getAttribute ? (el.closest('[title]') || el).getAttribute('title') : '';
    const txt = a ? a.texte : (nom || titre || (el.textContent || '').trim().slice(0, 80) || 'une partie de l\'interface');
    return txt;
  }
  function cestQuoi() {
    if (quoi) return;
    projeter(null, { texte: 'ⓘ Touche ce que tu veux comprendre.', sous: 'rien ne s\'ouvrira', doigt: false, boutons: '<button type="button" data-g="fin">fini</button>' });
    couche.classList.add('px-guide-quoi');
    quoi = (ev) => {
      if (couche && couche.contains(ev.target) && ev.target.closest('[data-g="fin"]')) { finQuoi(); return; }
      if (couche && couche.contains(ev.target)) return;
      ev.preventDefault(); ev.stopPropagation();
      const el = D.elementFromPoint(ev.clientX, ev.clientY); if (!el) return;
      const r = el.closest('button,a,[data-neurone],[data-pad],[data-id],[role]') || el;
      projeter({ el: r, r: r.getBoundingClientRect() }, { texte: expliquer(r), doigt: false, boutons: '<button type="button" data-g="fin">fini</button>' });
      couche.classList.add('px-guide-quoi'); vibrer('selection');
    };
    // la couche laisse passer les touchers (pointer-events) : on les attrape avant l'app, en capture
    for (const t of ['click', 'pointerup']) W.addEventListener(t, quoi, true);
    W.addEventListener('pointerdown', bloquer, true);
  }
  function bloquer(ev) { if (quoi && !(couche && couche.contains(ev.target))) { ev.stopPropagation(); } }
  function finQuoi() { if (!quoi) return; for (const t of ['click', 'pointerup']) W.removeEventListener(t, quoi, true); W.removeEventListener('pointerdown', bloquer, true); quoi = null; fermer(); }

  function installer() {
    if (W.MutationObserver) new W.MutationObserver(prevoir).observe(D.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    prevoir();
  }
  // un navigateur piloté (le faux iPhone, Playwright : navigator.webdriver) : ni guide ni astuces d'eux-mêmes (un parcours les appelle)
  const pilote = () => !!(W.navigator && W.navigator.webdriver);
  async function auDemarrage() { await pret; if (pilote()) return false; installer(); if (etat.vu >= VERSION_GUIDE) return false; W.setTimeout(montrer, 600); return true; }
  async function remettreAstuces() { await pret; etat.astuces = []; await garder(); }
  return { pret, montrer, auDemarrage, cestQuoi, finQuoi, remettreAstuces, installer, fermer, etat: () => ({ ...etat, astuces: etat.astuces.slice() }) };
}
