// 📁 LE DOSSIER ploxi0n DANS L'APP FICHIERS D'iOS (RS-7 12.10 : « je veux avoir le dossier ploxion dans Fichiers aussi — fichier natif »).
// Info.plist : UIFileSharingEnabled + LSSupportsOpeningDocumentsInPlace → « Sur mon iPhone › ploxi0n ». Le dossier Documents de l'app y est :
//   Lisez-moi.txt
//   Tsoins/       un journal par mois (AAAA-MM.md, lisible partout) + tsoins.json (tout, pour les machines)
//   Vocaux/       chaque vocal : son .m4a et sa transcription .txt
//   Fond d'écran/ l'image du fond
//   Ploxions/     installés.json (nom, version, poids, bions)
//   Dépôt/        TES fichiers : ce que tu y glisses depuis Fichiers, les ploxions le lisent (jOSNatif.fichiers)
// Écrit au démarrage (en différé) et quand l'app passe en arrière-plan ; un vocal déjà copié ne l'est plus. Rien ne quitte le téléphone.
const pad2 = (n) => String(n).padStart(2, '0');
const propre = (s) => String(s || '').replace(/[\/\\:*?"<>|\u0000-\u001f]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 80) || 'sans-nom';
/** un chemin RELATIF au dossier, sans « .. » ni racine */
export const sur = (p) => { const x = String(p || '').replace(/\\/g, '/').split('/').filter(s => s && s !== '.'); if (x.some(s => s === '..')) throw new Error('chemin interdit'); return x.join('/'); };

export const LISEZ_MOI = `ploxi0n — ton dossier
=====================

Ce dossier est celui de l'app ploxi0n, sur ce téléphone. Rien n'y part sur internet.

Tsoins/        tes tsoins, un journal par mois (.md) et tout en .json
Vocaux/        tes vocaux (.m4a) et leurs transcriptions (.txt)
Fond d'écran/  l'image de ton fond
Ploxions/      la liste de tes ploxions installés
Dépôt/         glisse ici des fichiers : tes ploxions peuvent les lire

Il se met à jour quand tu quittes l'app.
`;

/** le journal d'un mois en Markdown */
export function journalMois(mois, tsoins) {
  const parJour = new Map();
  for (const t of tsoins) { const d = new Date(t.t || t.le), j = d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); if (!parJour.has(j)) parJour.set(j, []); parJour.get(j).push(t); }
  let md = '# Tsoins · ' + mois + '\n';
  for (const [j, l] of [...parJour].sort()) {
    md += '\n## ' + j + '\n\n';
    for (const t of l.sort((a, b) => (a.t || 0) - (b.t || 0))) { const d = new Date(t.t || t.le); md += '- ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ' · ' + (t.genre || t.kind || '') + (t.d ? ' — ' + String(t.d).replace(/\n+/g, ' ') : '') + (t.ploxion ? ' (⧉ ' + t.ploxion + ')' : '') + (t.lieu ? ' 📍' + t.lieu.lat + ',' + t.lieu.lng : '') + '\n'; }
  }
  return md;
}

export function creerDossier({ W = globalThis.window, boxion, depot = null, fs = null }) {
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  const F = async () => { if (fs) return fs; if (!natif()) throw new Error('le dossier Fichiers : sur l\'iPhone'); const m = await import('@capacitor/filesystem'); return { Filesystem: m.Filesystem, Directory: m.Directory, Encoding: m.Encoding }; };
  async function ecrire(chemin, data, binaire = false) {
    const { Filesystem, Directory, Encoding } = await F();
    await Filesystem.writeFile({ path: sur(chemin), data, directory: Directory.Documents, recursive: true, ...(binaire ? {} : { encoding: Encoding.UTF8 }) });
  }
  let enCours = null;
  /** recopie l'état de l'app dans le dossier ; renvoie ce qui a été écrit */
  async function synchroniser() {
    if (enCours) return enCours;
    enCours = (async () => {
      const ecrits = [];
      const exp = (await boxion.get('reglages', 'dossier-exportes').catch(() => null)) || { vocaux: [] };
      await ecrire('Lisez-moi.txt', LISEZ_MOI); ecrits.push('Lisez-moi.txt');
      // le dépôt existe toujours (un fichier caché le garde)
      await ecrire('Dépôt/.ploxi0n', 'glisse ici des fichiers : tes ploxions peuvent les lire\n');
      // les tsoins natifs
      const t = (await boxion.lire('tsoins', { limite: 20000 }).catch(() => [])).filter(x => x.entry && x.entry.kind === 'tsoin').map(x => ({ ...x.entry, t: x.t }));
      if (t.length) {
        const mois = new Map();
        for (const x of t) { const d = new Date(x.t || x.le), m = d.getFullYear() + '-' + pad2(d.getMonth() + 1); if (!mois.has(m)) mois.set(m, []); mois.get(m).push(x); }
        for (const [m, l] of mois) { await ecrire('Tsoins/' + m + '.md', journalMois(m, l)); ecrits.push('Tsoins/' + m + '.md'); }
        await ecrire('Tsoins/tsoins.json', JSON.stringify(t, null, 1)); ecrits.push('Tsoins/tsoins.json');
      }
      // les vocaux (une fois chacun)
      for (const { key } of await boxion.list('vocaux').catch(() => [])) {
        if (exp.vocaux.includes(key)) continue;
        const v = await boxion.get('vocaux', key); if (!v) continue;
        const d = new Date(v.le || Date.now()), nom = d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + 'h' + pad2(d.getMinutes()) + ' ' + propre(String(v.texte || '').split(/\s+/).slice(0, 5).join(' ') || key);
        if (v.audio && /^data:[^;]+;base64,/.test(v.audio)) { await ecrire('Vocaux/' + nom + '.m4a', v.audio.split(',')[1], true); ecrits.push('Vocaux/' + nom + '.m4a'); }
        if (v.texte) { await ecrire('Vocaux/' + nom + '.txt', v.texte + '\n'); ecrits.push('Vocaux/' + nom + '.txt'); }
        exp.vocaux.push(key);
      }
      // le fond
      const fi = await boxion.get('reglages', 'fond-image').catch(() => null);
      if (fi && fi.url && fi.url !== exp.fond) { const m = /^data:image\/(\w+);base64,(.*)$/.exec(fi.url); if (m) { await ecrire('Fond d\'écran/fond.' + (m[1] === 'jpeg' ? 'jpg' : m[1]), m[2], true); ecrits.push('Fond d\'écran'); exp.fond = fi.url.slice(0, 64) + fi.url.length; } }
      // les ploxions
      if (depot && depot.inventaire) { try { const inv = await depot.inventaire(); await ecrire('Ploxions/installés.json', JSON.stringify(inv.ploxions.map(p => ({ id: p.id, nom: p.nom, installe: p.installe, maj: p.maj, octets: p.total, bions: p.deps.map(d => d.nom) })), null, 1)); ecrits.push('Ploxions/installés.json'); } catch (e) { /* */ } }
      await boxion.put('reglages', 'dossier-exportes', exp).catch(() => {});
      return ecrits;
    })().finally(() => { enCours = null; });
    return enCours;
  }
  // jOSNatif.fichiers : les ploxions lisent le Dépôt (et tout le dossier), écrivent dans le Dépôt seulement
  const api = {
    async lister(chemin = 'Dépôt') { const { Filesystem, Directory } = await F(); const r = await Filesystem.readdir({ path: sur(chemin), directory: Directory.Documents }); return (r.files || []).filter(f => !String(f.name).startsWith('.')).map(f => ({ nom: f.name, type: f.type, taille: f.size, modifie: f.mtime })); },
    async lire(chemin, { texte = true } = {}) { const { Filesystem, Directory, Encoding } = await F(); const r = await Filesystem.readFile({ path: sur(chemin), directory: Directory.Documents, ...(texte ? { encoding: Encoding.UTF8 } : {}) }); return r.data; },
    async ecrire(nom, data, { binaire = false } = {}) { const p = 'Dépôt/' + propre(String(nom).split('/').pop()); await ecrire(p, data, binaire); return p; },
    synchroniser,
  };
  return { synchroniser, api };
}
