// DES PLOXIONS EN VRAIES APPS SUR L'ÉCRAN D'ACCUEIL DE L'iPHONE (RS-7 : « ajouter des ploxions au homescreen et les utiliser tous seuls, mais
// connectés » ; 12.10 : « je veux vraiment que tu trouves un moyen de faire des apps avec notre app »).
// iOS ne laisse pas une app poser des icônes ; un PROFIL DE CONFIGURATION le peut : un clip d'écran d'accueil par ploxion, son icône, son nom,
// plein écran. ploxi0n envoie la liste (id, nom, icône PNG) au labo, qui FABRIQUE le profil (docs/dev/57 du labo : seulement des clips) ;
// Safari l'ouvre → « Profil téléchargé » → Réglages → Installer. Toucher une icône : /app/ouvrir/<id> → ploxi0n://px/<id> (l'app, sur ce
// ploxion ; installé à la volée s'il manque) ; sans l'app, le ploxion en ligne. Réinstaller le profil remplace l'ancien (ajouter, retirer).
// En secours : le guide Raccourcis (l'action « Ouvrir un ploxion »). Le choix est gardé : boxion_local « reglages/apps-accueil ».
// (0.55) L'icône est le XERKION du ploxion (src/app/xerkion-icone.js). RS-7 : « qu'on puisse choisir l'icône et le texte, sinon c'est pas
// drôle » → l'ATELIER : le nom sous l'icône, la palette, le cœur, les koins, le glyphe, ou une photo (« reglages/apps-accueil-perso »).
// Et « si quelqu'un a fait une meilleure icône, il peut la proposer » → proposer() : POST /api/app/icones { ploxion, xerkion, png } ; le labo
// la relit et, s'il la prend, la pose dans le registre (« xerkion »: {…}) : tout le monde l'a. Tant que le labo ne la reçoit pas, elle attend
// (« reglages/icones-proposees ») et repart à la prochaine ouverture de la feuille.
import { svgXerkion, pngXerkion, specXerkion, GPAL, CENTRES, FORMES } from '../app/xerkion-icone.js';
import { GLYPHES, glyphe } from '../app/glyphes.js';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const teinteDe = (id) => { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return 160 + (h % 160); };

/** l'icône d'un clip (PNG, base64 sans préfixe) : son xerkion, perso compris ; null sans canvas */
export function iconePng(W, p, taille = 180, perso = null, seul = false) {
  return pngXerkion(W, p, { taille, perso: specPerso(perso), photo: perso && perso.photo || null, seul });
}
/** ce qui, d'une perso, touche le dessin (le nom et la photo vivent à côté) */
export function specPerso(o) {
  if (!o) return null; const r = {};
  for (const k of ['pal', 'centre', 'glyphe', 'style']) if (o[k] != null) r[k] = o[k];
  return Object.keys(r).length ? r : null;
}
/** une photo → un carré de 160 px (JPEG) : léger dans le profil et dans boxion_local */
function reduirePhoto(W, fichier) {
  return new Promise((res, rej) => {
    const lr = new W.FileReader(); lr.onerror = () => rej(new Error('photo illisible'));
    lr.onload = () => { const img = new W.Image(); img.onerror = () => rej(new Error('photo illisible')); img.onload = () => {
      const c = W.document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d'); if (!x) return rej(new Error('pas de canvas'));
      const m = Math.min(img.width, img.height); x.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, 160, 160); res(c.toDataURL('image/jpeg', 0.85));
    }; img.src = lr.result; };
    lr.readAsDataURL(fichier);
  });
}

export function creerEcranAccueil({ W = globalThis.window, trouver, liste, boxion, envoyer, source = 'https://labo.j0bot.ch', verrous = () => [], jeton = async () => null, surPerso = () => {}, seul = () => false }) {
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  async function ouvrirSafari(url) {
    if (natif()) { const { AppLauncher } = await import('@capacitor/app-launcher'); await AppLauncher.openUrl({ url }); return; }
    W.open(url, '_blank', 'noopener');
  }
  async function copier(t) {
    try { if (natif()) { const { Clipboard } = await import('@capacitor/clipboard'); await Clipboard.write({ string: t }); return true; } await W.navigator.clipboard.writeText(t); return true; } catch (e) { return false; }
  }
  let perso = null;
  async function lirePerso() { if (!perso) perso = (boxion && await boxion.get('reglages', 'apps-accueil-perso').catch(() => null)) || {}; return perso; }
  // écrite à chaque retouche ; l'accueil, lui, se redessine une fois la feuille fermée (fermer), quand l'écriture est faite
  let ecriture = Promise.resolve(), retouche = false;
  function garderPerso() { retouche = true; if (boxion) ecriture = ecriture.then(() => boxion.put('reglages', 'apps-accueil-perso', perso)).catch(() => {}); }
  function fermer(f) { f.remove(); if (!retouche) return; retouche = false; ecriture.then(() => { try { surPerso(perso); } catch (e) { /* */ } }); }
  const nomDe = (p) => String((perso && perso[p.id] && perso[p.id].nom) || p.nom || p.id).slice(0, 40);
  const icone = (p) => svgXerkion(p, { perso: specPerso(perso && perso[p.id]), photo: (perso && perso[p.id] && perso[p.id].photo) || null, seul: seul() });

  /** fabrique le profil (labo) et l'ouvre dans Safari ; rend l'URL */
  let dansApp = false;   // (12.10) par défaut l'icône EST le ploxion (seul, en ligne) ; sinon ploxi0n s'ouvre dessus
  async function installer(ids) {
    await lirePerso();
    // (0.55, RS-7 : « un ploxion en Face ID, mis sur l'écran d'accueil seul : plus besoin de Face ID ») le verrou vit dans l'app ; « seul »,
    // l'icône ouvrait le ploxion en ligne, sans elle. Un ploxion verrouillé passe TOUJOURS par ploxi0n (ploxi0n://px/<id>, Face ID), et le
    // labo est prévenu (verrou: true) : pas de repli sur /px/<id> en ligne pour lui.
    const ferme = new Set(verrous() || []);
    const ps = ids.map(id => trouver(id)).filter(Boolean).slice(0, 40);
    const apps = await Promise.all(ps.map(async p => Object.assign({ id: p.id, nom: nomDe(p), icone: await iconePng(W, p, 180, perso[p.id], seul()), mode: dansApp || ferme.has(p.id) ? 'app' : 'seul' },
      ferme.has(p.id) ? { verrou: true, url: 'ploxi0n://px/' + encodeURIComponent(p.id) } : {})));
    if (!apps.length) throw new Error('choisis au moins un ploxion');
    if (apps.some(a => !a.icone)) throw new Error('impossible de dessiner les icônes');
    const r = await envoyer({ methode: 'POST', url: source + '/api/app/accueil', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, corps: JSON.stringify({ apps }) });
    let d = {}; try { d = JSON.parse(r.texte || '{}'); } catch (e) { /* */ }
    if (r.status !== 200 || !d.url) throw new Error(d.message || ('le labo refuse (HTTP ' + r.status + ')'));
    if (boxion) await boxion.put('reglages', 'apps-accueil', ids).catch(() => {});
    await ouvrirSafari(d.url);
    return d.url;
  }

  /** proposer l'icône d'un ploxion au labo : 'envoyee' | 'en-attente' (le labo ne la reçoit pas encore : elle repartira) */
  async function poster(prop) {
    const j = await Promise.resolve().then(jeton).catch(() => null);
    const h = { 'Content-Type': 'application/json', Accept: 'application/json' }; if (j) h.Authorization = 'Bearer ' + j;
    const r = await envoyer({ methode: 'POST', url: source + '/api/app/icones', headers: h, corps: JSON.stringify(prop) }).catch(() => ({ status: 0 }));
    return r.status >= 200 && r.status < 300;
  }
  async function proposer(id) {
    await lirePerso(); const p = trouver(id); if (!p) throw new Error('ploxion inconnu');
    const o = perso[id] || {}, s = specXerkion(p, specPerso(o));
    const prop = { ploxion: id, xerkion: { pal: s.pal, centre: s.centre, glyphe: s.glyphe, style: s.style || (seul() ? 'glyphe' : 'xerboxion') }, type: s.type, nom: o.nom || null, photo: !!o.photo, png: await iconePng(W, p, 180, o, seul()), le: new Date().toISOString() };
    if (await poster(prop)) return 'envoyee';
    const file = (boxion && await boxion.get('reglages', 'icones-proposees').catch(() => null)) || [];
    file.push(prop); if (boxion) await boxion.put('reglages', 'icones-proposees', file.filter((x, i, l) => l.findLastIndex(y => y.ploxion === x.ploxion) === i).slice(-30)).catch(() => {});
    return 'en-attente';
  }
  /** les propositions en attente repartent (best effort) */
  async function renvoyer() {
    const file = (boxion && await boxion.get('reglages', 'icones-proposees').catch(() => null)) || []; if (!file.length) return 0;
    const reste = []; for (const prop of file) if (!(await poster(prop))) reste.push(prop);
    if (boxion) await boxion.put('reglages', 'icones-proposees', reste).catch(() => {});
    return file.length - reste.length;
  }

  // L'ATELIER d'une icône : peint dans la feuille (f), rend true si la feuille doit être repeinte
  function atelierHtml(id) {
    const p = trouver(id) || { id }, o = perso[id] || {}, s = specXerkion(p, specPerso(o)), st = s.style || (seul() ? 'glyphe' : 'xerboxion');
    const puces = (attr, vals, cur, lib = (v) => v) => '<div class="px-puces px-at-puces">' + vals.map(v => '<button class="px-puce' + (String(v) === String(cur) ? ' on' : '') + '" ' + attr + '="' + esc(v) + '">' + esc(lib(v)) + '</button>').join('') + '</div>';
    return '<div class="px-tiroir px-guide px-atelier"><p class="px-ft">' + glyphe('editer') + ' L\'icône de ' + esc(p.nom || id) + '</p>'
      + '<div class="px-at-tete"><span class="px-at-apercu">' + icone(p) + '</span><label class="px-at-nom">le nom sous l\'icône<input data-at-nom maxlength="40" value="' + esc(nomDe(p)) + '" autocomplete="off"></label></div>'
      + '<p class="px-at-t">la palette</p><div class="px-at-pal">' + GPAL.map((P, i) => '<button class="' + (i === s.pal ? 'on' : '') + '" data-pal="' + i + '" style="--c:' + P.a + '" aria-label="' + P.n + '"></button>').join('') + '</div>'
      + '<p class="px-at-t">le style</p>' + puces('data-style', ['xerboxion', 'glyphe'], st, (v) => v === 'glyphe' ? 'glyphe seul' : 'xerboxion')
      + (st === 'xerboxion' ? '<p class="px-sous px-at-type">' + esc(s.type) + ' · ' + esc(FORMES[s.type] || '') + (s.cotes ? ' (' + s.cotes + ')' : '') + ' : la forme dit ce qu\'il est, elle ne se change pas</p>' : '')
      + (st === 'xerboxion' && s.type === 'xerkion' ? '<p class="px-at-t">le cœur</p>' + puces('data-centre', CENTRES, s.centre) : '')
      + '<p class="px-at-t">le glyphe</p><div class="px-at-gl">' + Object.keys(GLYPHES).map(n => '<button class="' + (n === s.glyphe ? 'on' : '') + '" data-gl="' + n + '" aria-label="' + n + '">' + glyphe(n) + '</button>').join('') + '</div>'
      + '<div class="px-puces px-at-puces"><label class="px-puce">' + glyphe('photo') + ' une photo<input type="file" accept="image/*" data-at-photo hidden></label>' + (o.photo ? '<button class="px-puce" data-at-sans-photo>sans la photo</button>' : '') + '<button class="px-puce" data-at-defaut>par défaut</button></div>'
      + '<button class="p" data-at-ok>c\'est elle</button><button data-at-proposer>' + glyphe('partager') + ' proposer cette icône au labo</button><p class="px-sous" data-msg style="margin:6px 2px"></p></div>';
  }
  function majPerso(id, k, v) { const o = Object.assign({}, perso[id]); if (v == null || v === '') delete o[k]; else o[k] = v; if (Object.keys(o).length) perso[id] = o; else delete perso[id]; garderPerso(); }

  /** la feuille : cocher les ploxions qui deviennent des apps ; id = coché d'office ; ouvrirAtelier = droit à l'atelier de id */
  async function guider(id, { ouvrirAtelier = false } = {}) {
    await lirePerso(); renvoyer().catch(() => {});
    const deja = (boxion && await boxion.get('reglages', 'apps-accueil').catch(() => null)) || [];
    const tous = liste(), ids = new Set(tous.map(p => p.id));
    const choix = new Set(deja.filter(x => ids.has(x))); if (id && ids.has(id) && !ouvrirAtelier) choix.add(id);
    let atelier = ouvrirAtelier && id ? id : null, seulAtelier = !!atelier;
    const f = W.document.createElement('div'); f.className = 'px-voile';
    const peindre = () => {
      if (atelier) { f.innerHTML = atelierHtml(atelier); return; }
      const ch = tous.filter(p => choix.has(p.id));
      f.innerHTML = '<div class="px-tiroir px-guide"><p class="px-ft">' + glyphe('iphone') + ' Tes ploxions en apps</p>'
        + '<p class="px-sous" style="margin:0 0 10px">Coche-les : chacun devient une icône de l\'écran d\'accueil. Safari s\'ouvre, puis Réglages → « Profil téléchargé » → Installer.</p>'
        + '<div class="px-choix">' + tous.map(p => '<button class="px-tuile' + (choix.has(p.id) ? ' on' : '') + '" data-c="' + esc(p.id) + '"><span class="px-ic">' + icone(p) + '</span><span>' + esc(nomDe(p)) + '</span></button>').join('') + '</div>'
        + (ch.length ? '<p class="px-at-t">leur icône et leur nom</p><div class="px-at-liste">' + ch.map(p => '<button data-at="' + esc(p.id) + '">' + icone(p) + '<span>' + esc(nomDe(p)) + '</span>' + glyphe('editer') + '</button>').join('') + '</div>' : '')
        + (ch.some(p => verrous().includes(p.id)) ? '<p class="px-sous" style="margin:0 0 8px">' + glyphe('verrou') + ' les ploxions verrouillés s\'ouvrent toujours dans ploxi0n, avec ton visage.</p>' : '')
        + '<div class="px-puces" style="margin:0 0 8px"><button class="px-puce' + (!dansApp ? ' on' : '') + '" data-mode="seul">l\'icône EST le ploxion</button><button class="px-puce' + (dansApp ? ' on' : '') + '" data-mode="app">ouvre ploxi0n dessus</button></div>'
        + '<button class="p" data-g="installer"' + (choix.size ? '' : ' disabled') + '>' + (choix.size ? 'Mettre ' + choix.size + ' app' + (choix.size > 1 ? 's' : '') + ' sur l\'écran d\'accueil' : 'coche au moins un ploxion') + '</button>'
        + '<p class="px-sous" data-msg style="margin:6px 2px"></p>'
        + (id ? '<button class="px-lien" data-g="raccourcis">ou avec Raccourcis (« Ouvrir un ploxion »)</button>' : '') + '<button data-g="">fermer</button></div>';
    };
    peindre();
    (W.document.getElementById('ploxi0n') || W.document.body).appendChild(f);
    f.addEventListener('input', (e) => { const n = e.target.closest('[data-at-nom]'); if (!n || !atelier) return; const p = trouver(atelier) || {}; const v = n.value.trim(); majPerso(atelier, 'nom', v && v !== p.nom ? v : null); });
    f.addEventListener('change', async (e) => {
      const ph = e.target.closest('[data-at-photo]'); if (!ph || !atelier || !ph.files || !ph.files[0]) return;
      try { majPerso(atelier, 'photo', await reduirePhoto(W, ph.files[0])); peindre(); } catch (er) { const m = f.querySelector('[data-msg]'); if (m) m.textContent = '⚠ ' + (er.message || er); }
    });
    f.addEventListener('click', async (e) => {
      if (atelier) {
        const t = e.target; let b;
        if ((b = t.closest('[data-pal]'))) { majPerso(atelier, 'pal', +b.getAttribute('data-pal')); return peindre(); }
        if ((b = t.closest('[data-style]'))) { majPerso(atelier, 'style', b.getAttribute('data-style')); return peindre(); }
        if ((b = t.closest('[data-centre]'))) { majPerso(atelier, 'centre', b.getAttribute('data-centre')); return peindre(); }
        if ((b = t.closest('[data-gl]'))) { majPerso(atelier, 'glyphe', b.getAttribute('data-gl')); majPerso(atelier, 'photo', null); return peindre(); }
        if (t.closest('[data-at-sans-photo]')) { majPerso(atelier, 'photo', null); return peindre(); }
        if (t.closest('[data-at-defaut]')) { delete perso[atelier]; garderPerso(); return peindre(); }
        if ((b = t.closest('[data-at-proposer]'))) {
          const m = f.querySelector('[data-msg]'); b.disabled = true;
          try { const r = await proposer(atelier); m.textContent = r === 'envoyee' ? '✓ proposée : le labo la relit ; si elle est prise, tout le monde l\'aura' : 'gardée : le labo ne reçoit pas encore les propositions d\'icônes, elle partira dès qu\'il saura'; } catch (er) { m.textContent = '⚠ ' + (er.message || er); }
          b.disabled = false; return;
        }
        if (t.closest('[data-at-ok]') || t === f) { if (seulAtelier) { fermer(f); return; } atelier = null; return peindre(); }
        return;
      }
      const at = e.target.closest('[data-at]'); if (at) { atelier = at.getAttribute('data-at'); return peindre(); }
      const md = e.target.closest('[data-mode]'); if (md) { dansApp = md.getAttribute('data-mode') === 'app'; peindre(); return; }
      const c = e.target.closest('[data-c]');
      if (c) { const k = c.getAttribute('data-c'); if (choix.has(k)) choix.delete(k); else choix.add(k); peindre(); return; }
      const b = e.target.closest('[data-g]'); if (!b && e.target !== f) return;
      e.stopPropagation();
      const g = b ? b.getAttribute('data-g') : '';
      const msg = f.querySelector('[data-msg]');
      try {
        if (g === 'installer') { b.disabled = true; b.textContent = '…'; await installer([...choix]); msg.innerHTML = '✓ profil envoyé à Safari. Ensuite :<ol class="px-etapes"><li>Safari : <b>Autoriser</b> le téléchargement</li><li>ouvre <b>Réglages</b> : tout en haut, <b>Profil téléchargé</b> (sinon Général › VPN et gestion de l\'appareil)</li><li><b>Installer</b> (3 fois), puis ton code ; « non vérifié » est normal</li></ol>Si une erreur s\'affiche, envoie-moi une capture (bother me).'; b.disabled = false; b.textContent = 'renvoyer le profil'; return; }
        if (g === 'raccourcis') { await copier('ploxi0n://px/' + encodeURIComponent(id)); W.location.href = 'shortcuts://create-shortcut'; return; }
      } catch (er) { msg.textContent = '⚠ ' + (er.message || er); if (b) { b.disabled = false; b.textContent = 'réessayer'; } return; }
      fermer(f);
    });
    return true;
  }
  guider.atelier = (id) => guider(id, { ouvrirAtelier: true });
  guider.proposer = proposer;
  guider.perso = async () => Object.assign({}, await lirePerso());
  return guider;
}
