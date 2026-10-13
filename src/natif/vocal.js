// 🎙 LES VOCAUX (RS-7 12.10 : « une intégration pour les vocaux ; j'aime beaucoup faire des vocaux, mais je veux aussi une transcription »).
// Le plugin natif PloxiVocal (AppDelegate.swift) enregistre (m4a) et transcrit avec la reconnaissance d'iOS, sur le téléphone quand il le peut,
// en privilégiant le vocabulaire du xerboxion. Ici :
//   - le bouton 🎙 du dock : un appui = enregistrer, un appui = arrêter → la transcription → une feuille : copier · noter comme tsoin ·
//     envoyer à pourriture-4 (le journal personnel) · partager
//   - jOSNatif.vocal pour les ploxions : commencer() · arreter() → { texte, audio (data: URL), duree } · liste()
//   - chaque vocal est gardé : boxion_local « vocaux/<id> » = { le, duree, texte, audio } (l'audio au plus 8 Mo)
import { MOTS } from './vocabulaire.js';
import { PloxiVocal } from './plugins-app.js';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function creerVocal({ W = globalThis.window, boxion, catalogue = () => [], vibrer = () => {}, ouvrir = () => {}, surEtat = () => {} }) {
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  let enCours = false;
  const vocabulaire = () => [...Object.keys(MOTS), ...catalogue().map(p => p.nom).filter(Boolean)].slice(0, 100);
  const langue = () => (W.navigator.language || 'fr-FR');
  async function commencer() {
    if (!natif()) throw new Error('les vocaux : sur l\'iPhone');
    if (enCours) return; await PloxiVocal.commencer(); enCours = true; vibrer('moyen'); surEtat(true);
  }
  async function arreter() {
    if (!enCours) throw new Error('aucun vocal en cours');
    const r = await PloxiVocal.arreter(); enCours = false; vibrer('leger'); surEtat(false);
    let texte = '', erreur = null;
    try { texte = (await PloxiVocal.transcrire({ chemin: r.chemin, langue: langue(), vocabulaire: vocabulaire() })).texte || ''; } catch (e) { erreur = e.message || String(e); }
    const audio = 'data:' + (r.type || 'audio/mp4') + ';base64,' + r.base64;
    const id = 'v' + Date.now();
    await boxion.put('vocaux', id, { id, le: new Date().toISOString(), duree: Math.round(r.duree || 0), texte, audio: audio.length < 8e6 ? audio : null }).catch(() => {});
    await boxion.append('tsoins', { kind: 'vocal', id, duree: Math.round(r.duree || 0), d: texte.slice(0, 300) }).catch(() => {});
    return { id, texte, audio, duree: r.duree || 0, erreur };
  }
  async function liste() { const l = []; for (const { key } of await boxion.list('vocaux')) { const v = await boxion.get('vocaux', key); if (v) l.push({ ...v, audio: undefined }); } return l.reverse(); }

  /** la feuille après un vocal : la transcription et quoi en faire */
  function feuille(v) {
    const f = W.document.createElement('div'); f.className = 'px-voile';
    f.innerHTML = '<div class="px-tiroir"><p class="px-ft">🎙 vocal · ' + Math.round(v.duree) + ' s</p>'
      + (v.audio ? '<audio controls src="' + esc(v.audio) + '" style="width:100%;margin:2px 0 8px"></audio>' : '')
      + '<textarea data-texte rows="5" style="width:100%;box-sizing:border-box;padding:12px;border-radius:13px;border:2px solid var(--bord2);background:var(--creux);color:var(--txt);font:15px var(--police)">' + esc(v.texte) + '</textarea>'
      + (v.erreur ? '<p class="px-sous" style="margin:6px 2px">⚠ transcription : ' + esc(v.erreur) + '</p>' : '')
      + '<button data-v="tsoin">⧗ noter comme tsoin</button><button data-v="p4">📓 envoyer à pourriture-4</button><button data-v="copier">copier le texte</button><button data-v="partager">partager</button><button data-v="">fermer</button></div>';
    (W.document.getElementById('ploxi0n') || W.document.body).appendChild(f);
    f.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-v]'); if (!b && e.target !== f) return;
      const k = b ? b.getAttribute('data-v') : '', t = f.querySelector('[data-texte]').value;
      try {
        if (k === 'tsoin') { await boxion.append('tsoins', { kind: 'action', k: 'raccourci', d: t.slice(0, 500), source: 'vocal', vocal: v.id }); vibrer('succes'); b.textContent = '✓ noté'; return; }
        if (k === 'copier') { await W.jOSNatif.copier(t); b.textContent = '✓ copié'; return; }
        if (k === 'partager') { await W.jOSNatif.partager({ texte: t }); return; }
        if (k === 'p4') { f.remove(); return ouvrir('pourriture-4', { texte: t, vocal: v.id, source: 'vocal' }); }
      } catch (er) { b.textContent = '⚠ ' + (er.message || er); return; }
      f.remove();
    });
  }
  async function basculer() {
    try {
      if (!enCours) return await commencer();
      const v = await arreter(); feuille(v);
    } catch (e) { enCours = false; surEtat(false); vibrer('erreur'); const b = W.document.createElement('div'); b.className = 'px-bulle'; b.textContent = '🎙 ' + (e.message || e); (W.document.getElementById('ploxi0n') || W.document.body).appendChild(b); W.setTimeout(() => b.remove(), 4500); }
  }
  return { commencer, arreter, liste, basculer, enCours: () => enCours, api: { commencer, arreter, liste } };
}
