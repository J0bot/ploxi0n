// UN PLOXION SUR L'ÉCRAN D'ACCUEIL DE L'iPHONE (RS-7 : « pouvoir ajouter des ploxions au homescreen et les utiliser tous seuls, mais connectés »).
// iOS ne laisse pas une app poser elle-même des icônes : la voie qui marche passe par l'app Raccourcis. ploxi0n fournit l'action
// « Ouvrir un ploxion » (App Intents, ios/App/App/Raccourcis.swift) ; ce guide prépare le reste en trois gestes :
//   1. l'icône du ploxion (son emoji sur le dégradé de l'app, 1024 px) → la feuille de partage → « Enregistrer l'image »
//   2. Raccourcis s'ouvre sur un nouveau raccourci → « Ouvrir un ploxion » → ce ploxion → « Sur l'écran d'accueil » → la photo
//   3. le lien ploxi0n://px/<id> (copié) pour qui préfère l'action « Ouvrir les URL »
// Touché depuis l'écran d'accueil : ploxi0n s'ouvre directement sur ce ploxion (seul, plein écran), connecté au compte s'il l'est.
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** l'icône (PNG, base64 sans préfixe) : l'emoji du ploxion, centré, sur un dégradé ; null sans canvas */
export function iconePng(W, icone, taille = 1024) {
  try {
    const c = W.document.createElement('canvas'); c.width = c.height = taille;
    const x = c.getContext('2d'); if (!x) return null;
    const g = x.createLinearGradient(0, 0, taille, taille); g.addColorStop(0, '#16324a'); g.addColorStop(1, '#070b14');
    x.fillStyle = g; x.fillRect(0, 0, taille, taille);
    x.font = Math.round(taille * 0.56) + 'px "Apple Color Emoji", system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(String(icone || '▣'), taille / 2, taille * 0.53);
    const u = c.toDataURL('image/png'); return u && u.startsWith('data:image/png;base64,') ? u.slice(22) : null;
  } catch (e) { return null; }
}

export function creerEcranAccueil({ W = globalThis.window, trouver }) {
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  async function enregistrerIcone(p) {
    const b64 = iconePng(W, p.icone); if (!b64) throw new Error('pas de canvas');
    if (!natif()) { const a = W.document.createElement('a'); a.href = 'data:image/png;base64,' + b64; a.download = p.id + '.png'; a.click(); return; }
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const f = await Filesystem.writeFile({ path: 'icone-' + p.id + '.png', data: b64, directory: Directory.Cache });
    await Share.share({ title: p.nom, files: [f.uri] });
  }
  async function copier(t) {
    try { if (natif()) { const { Clipboard } = await import('@capacitor/clipboard'); await Clipboard.write({ string: t }); return true; } await W.navigator.clipboard.writeText(t); return true; } catch (e) { return false; }
  }
  return function guider(id) {
    const p = trouver(id); if (!p) return false;
    const lien = 'ploxi0n://px/' + encodeURIComponent(id);
    const f = W.document.createElement('div'); f.className = 'px-voile';
    f.innerHTML = '<div class="px-feuille px-guide"><p class="px-ft"><span class="px-ic">' + esc(p.icone || '▣') + '</span> ' + esc(p.nom || id) + ' sur l\'écran d\'accueil</p>'
      + '<button data-g="icone">1 · enregistrer son icône dans Photos</button>'
      + '<button data-g="raccourcis">2 · ouvrir Raccourcis</button>'
      + '<ol class="px-etapes"><li>« Ajouter une action », cherche <b>ploxi0n</b> → <b>Ouvrir un ploxion</b> → choisis <b>' + esc(p.nom || id) + '</b></li>'
      + '<li>en haut, le nom du raccourci → <b>Sur l\'écran d\'accueil</b></li><li>touche l\'icône → <b>Choisir une photo</b> → celle de l\'étape 1 → <b>Ajouter</b></li></ol>'
      + '<button data-g="lien">ou copier le lien ' + esc(lien) + '</button><p class="px-sous" data-msg></p><button data-g="">fermer</button></div>';
    (W.document.getElementById('ploxi0n') || W.document.body).appendChild(f);
    const msg = f.querySelector('[data-msg]');
    f.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-g]'); if (!b && e.target !== f) return;
      e.stopPropagation();
      const g = b ? b.getAttribute('data-g') : '';
      try {
        if (g === 'icone') { await enregistrerIcone(p); msg.textContent = '✓ icône prête : choisis « Enregistrer l\'image »'; return; }
        if (g === 'raccourcis') { W.location.href = 'shortcuts://create-shortcut'; return; }
        if (g === 'lien') { msg.textContent = (await copier(lien)) ? '✓ copié : action « Ouvrir les URL » dans Raccourcis' : lien; return; }
      } catch (er) { msg.textContent = '⚠ ' + (er.message || er); return; }
      f.remove();
    });
    return true;
  };
}
