// DES PLOXIONS EN VRAIES APPS SUR L'ÉCRAN D'ACCUEIL DE L'iPHONE (RS-7 : « ajouter des ploxions au homescreen et les utiliser tous seuls, mais
// connectés » ; 12.10 : « je veux vraiment que tu trouves un moyen de faire des apps avec notre app »).
// iOS ne laisse pas une app poser des icônes ; un PROFIL DE CONFIGURATION le peut : un clip d'écran d'accueil par ploxion, son icône, son nom,
// plein écran. ploxi0n envoie la liste (id, nom, icône PNG) au labo, qui FABRIQUE le profil (docs/dev/57 du labo : seulement des clips) ;
// Safari l'ouvre → « Profil téléchargé » → Réglages → Installer. Toucher une icône : /app/ouvrir/<id> → ploxi0n://px/<id> (l'app, sur ce
// ploxion ; installé à la volée s'il manque) ; sans l'app, le ploxion en ligne. Réinstaller le profil remplace l'ancien (ajouter, retirer).
// En secours : le guide Raccourcis (l'action « Ouvrir un ploxion »). Le choix est gardé : boxion_local « reglages/apps-accueil ».
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const teinteDe = (id) => { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return 160 + (h % 160); };

/** l'icône (PNG, base64 sans préfixe) : l'emoji du ploxion sur un verre violet teinté (chill-tekk) ; null sans canvas */
export function iconePng(W, icone, taille = 180, teinte = 265) {
  try {
    const c = W.document.createElement('canvas'); c.width = c.height = taille;
    const x = c.getContext('2d'); if (!x) return null;
    // une cellule : l'aplat teinté du ploxion et sa membrane (aucun dégradé ; iOS arrondit l'icône)
    x.fillStyle = 'hsl(' + teinte + ',38%,24%)'; x.fillRect(0, 0, taille, taille);
    x.lineWidth = taille * 0.06; x.strokeStyle = 'hsl(' + teinte + ',48%,46%)'; x.strokeRect(taille * 0.03, taille * 0.03, taille * 0.94, taille * 0.94);
    x.font = Math.round(taille * 0.54) + 'px "Apple Color Emoji","Noto Color Emoji",system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(String(icone || '▣'), taille / 2, taille * 0.54);
    const u = c.toDataURL('image/png'); return u && u.startsWith('data:image/png;base64,') ? u.slice(22) : null;
  } catch (e) { return null; }
}

export function creerEcranAccueil({ W = globalThis.window, trouver, liste, boxion, envoyer, source = 'https://xerboxion.org' }) {
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  async function ouvrirSafari(url) {
    if (natif()) { const { AppLauncher } = await import('@capacitor/app-launcher'); await AppLauncher.openUrl({ url }); return; }
    W.open(url, '_blank', 'noopener');
  }
  async function copier(t) {
    try { if (natif()) { const { Clipboard } = await import('@capacitor/clipboard'); await Clipboard.write({ string: t }); return true; } await W.navigator.clipboard.writeText(t); return true; } catch (e) { return false; }
  }
  /** fabrique le profil (labo) et l'ouvre dans Safari ; rend l'URL */
  let dansApp = false;   // (12.10) par défaut l'icône EST le ploxion (seul, depuis xerboxion.org) ; sinon ploxi0n s'ouvre dessus
  async function installer(ids) {
    const apps = ids.map(id => trouver(id)).filter(Boolean).slice(0, 40).map(p => ({ id: p.id, nom: String(p.nom || p.id).slice(0, 40), icone: iconePng(W, p.icone, 180, teinteDe(p.id)), mode: dansApp ? 'app' : 'seul' }));
    if (!apps.length) throw new Error('choisis au moins un ploxion');
    if (apps.some(a => !a.icone)) throw new Error('impossible de dessiner les icônes');
    const r = await envoyer({ methode: 'POST', url: source + '/api/app/accueil', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, corps: JSON.stringify({ apps }) });
    let d = {}; try { d = JSON.parse(r.texte || '{}'); } catch (e) { /* */ }
    if (r.status !== 200 || !d.url) throw new Error(d.message || ('le labo refuse (HTTP ' + r.status + ')'));
    if (boxion) await boxion.put('reglages', 'apps-accueil', ids).catch(() => {});
    await ouvrirSafari(d.url);
    return d.url;
  }

  /** la feuille : cocher les ploxions qui deviennent des apps ; id = coché d'office */
  return async function guider(id) {
    const deja = (boxion && await boxion.get('reglages', 'apps-accueil').catch(() => null)) || [];
    const tous = liste(), ids = new Set(tous.map(p => p.id));
    const choix = new Set(deja.filter(x => ids.has(x))); if (id && ids.has(id)) choix.add(id);
    const f = W.document.createElement('div'); f.className = 'px-voile';
    const peindre = () => {
      f.innerHTML = '<div class="px-tiroir px-guide"><p class="px-ft">📲 Tes ploxions en apps</p>'
        + '<p class="px-sous" style="margin:0 0 10px">Coche-les : chacun devient une icône de l\'écran d\'accueil. Safari s\'ouvre, puis Réglages → « Profil téléchargé » → Installer.</p>'
        + '<div class="px-choix">' + tous.map(p => '<button class="px-tuile' + (choix.has(p.id) ? ' on' : '') + '" data-c="' + esc(p.id) + '"><span class="px-ic" style="--t:' + teinteDe(p.id) + '">' + esc(p.icone || '▣') + '</span><span>' + esc(p.nom || p.id) + '</span></button>').join('') + '</div>'
        + '<div class="px-puces" style="margin:0 0 8px"><button class="px-puce' + (!dansApp ? ' on' : '') + '" data-mode="seul">l\'icône EST le ploxion</button><button class="px-puce' + (dansApp ? ' on' : '') + '" data-mode="app">ouvre ploxi0n dessus</button></div>'
        + '<button class="p" data-g="installer"' + (choix.size ? '' : ' disabled') + '>' + (choix.size ? 'Mettre ' + choix.size + ' app' + (choix.size > 1 ? 's' : '') + ' sur l\'écran d\'accueil' : 'coche au moins un ploxion') + '</button>'
        + '<p class="px-sous" data-msg style="margin:6px 2px"></p>'
        + (id ? '<button class="px-lien" data-g="raccourcis">ou avec Raccourcis (« Ouvrir un ploxion »)</button>' : '') + '<button data-g="">fermer</button></div>';
    };
    peindre();
    (W.document.getElementById('ploxi0n') || W.document.body).appendChild(f);
    f.addEventListener('click', async (e) => {
      const md = e.target.closest('[data-mode]'); if (md) { dansApp = md.getAttribute('data-mode') === 'app'; peindre(); return; }
      const c = e.target.closest('[data-c]');
      if (c) { const k = c.getAttribute('data-c'); if (choix.has(k)) choix.delete(k); else choix.add(k); peindre(); return; }
      const b = e.target.closest('[data-g]'); if (!b && e.target !== f) return;
      e.stopPropagation();
      const g = b ? b.getAttribute('data-g') : '';
      const msg = f.querySelector('[data-msg]');
      try {
        if (g === 'installer') { b.disabled = true; b.textContent = '⏳'; await installer([...choix]); msg.innerHTML = '✓ profil envoyé à Safari. Ensuite :<ol class="px-etapes"><li>Safari : <b>Autoriser</b> le téléchargement</li><li>ouvre <b>Réglages</b> : tout en haut, <b>Profil téléchargé</b> (sinon Général › VPN et gestion de l\'appareil)</li><li><b>Installer</b> (3 fois), puis ton code ; « non vérifié » est normal</li></ol>Si une erreur s\'affiche, envoie-moi une capture (bother me).'; b.disabled = false; b.textContent = 'renvoyer le profil'; return; }
        if (g === 'raccourcis') { await copier('ploxi0n://px/' + encodeURIComponent(id)); W.location.href = 'shortcuts://create-shortcut'; return; }
      } catch (er) { msg.textContent = '⚠ ' + (er.message || er); if (b) { b.disabled = false; b.textContent = 'réessayer'; } return; }
      f.remove();
    });
    return true;
  };
}
