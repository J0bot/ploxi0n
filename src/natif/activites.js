// 🏝 LES LIVE ACTIVITIES (0.91, RS-7 22.10 : « parfait, live activités »). L'écran verrouillé et la Dynamic Island suivent ce qui est EN COURS :
//   ☾ dodo (le chrono depuis le coucher, jusqu'au réveil) · 🎙 un vocal qui enregistre · ≈ le minuteur des ambiances (le compte à rebours) ;
//   et tout ploxion : jOSNatif.activite.debut({ titre, sous, glyphe, debut, fin, progression }) → id ; maj(id, …) ; fin(id).
// Le natif : PloxiApple.activiteDebut / activiteMaj / activiteFin (AppDelegate.swift, ActivityKit, iOS 16.2+) ; la vue : l'extension des widgets
// (ActivitePloxi0n). Sans iPhone, sans iOS 16.2, ou coupé (⚙ › Notifications, ou Réglages iOS › ploxi0n) : rien, sans erreur.
// Une seule activité par CLÉ (« dodo », « vocal », « ambiances », « px:<id> ») : la redemander met à jour la même.
export const GLYPHES_SF = { tsoin: 'hourglass', dodo: 'moon.zzz', vocal: 'mic', minuteur: 'timer', ambiances: 'cloud.rain', musique: 'waveform', ploxion: 'square.grid.2x2', jeu: 'gamecontroller' };
const nettoyer = (o = {}) => {
  const n = (x) => (x == null || x === '' || !isFinite(+x) ? undefined : +x);
  const d = (x) => (x instanceof Date ? x.getTime() : n(x));
  const g = String(o.glyphe || '');
  return { titre: String(o.titre || 'ploxi0n').slice(0, 60), sous: String(o.sous || '').slice(0, 80), glyphe: GLYPHES_SF[g] || (/^[a-z0-9]+(\.[a-z0-9]+)*$/.test(g) && g.length <= 40 ? g : 'hourglass'),
    debut: d(o.debut), fin: d(o.fin), progression: n(o.progression),
    ...(Number.isInteger(o.compte) && o.compte >= 0 ? { compte: Math.min(o.compte, 9999) } : {}) };   // (0.99.43) un nombre à montrer (Proche : les voisins)
};

/** plugin = PloxiApple ; actif() : le réglage (⚙ › Notifications › Activités en direct) */
export function creerActivites({ plugin = null, natif = () => false, actif = () => true, boxion = null }) {
  const ids = new Map();   // clé → id de l'activité iOS
  const pret = boxion ? boxion.get('reglages', 'activites-ids').then(v => { if (v && typeof v === 'object') for (const k in v) ids.set(k, v[k]); }).catch(() => {}) : Promise.resolve();
  const garder = () => { if (boxion) boxion.put('reglages', 'activites-ids', Object.fromEntries(ids)).catch(() => {}); };
  const dispo = () => !!(plugin && natif() && actif());
  async function debut(cle, o = {}) {
    await pret; if (!dispo()) return null;
    const e = nettoyer(o);
    if (ids.has(cle)) { try { await plugin.activiteMaj({ id: ids.get(cle), ...e }); return ids.get(cle); } catch (er) { ids.delete(cle); } }
    try { const r = await plugin.activiteDebut({ genre: o.genre || cle.split(':')[0], ploxion: o.ploxion || 'accueil', ...e }); if (r && r.id) { ids.set(cle, r.id); garder(); return r.id; } } catch (er) { /* coupé, iOS trop ancien */ }
    return null;
  }
  async function maj(cle, o = {}) { await pret; if (!dispo() || !ids.has(cle)) return false; try { await plugin.activiteMaj({ id: ids.get(cle), ...nettoyer(o) }); return true; } catch (er) { ids.delete(cle); garder(); return false; } }
  async function fin(cle) { await pret; if (!ids.has(cle)) return false; const id = ids.get(cle); ids.delete(cle); garder(); if (!plugin || !natif()) return false; try { await plugin.activiteFin({ id }); return true; } catch (er) { return false; } }
  async function toutFinir() { ids.clear(); garder(); if (plugin && natif()) { try { await plugin.activiteFin({}); } catch (er) { /* */ } } }
  /** pour les ploxions (jOSNatif.activite) : la clé est celle du ploxion, une activité chacun */
  const pour = (idPloxion) => ({
    debut: (o) => debut('px:' + idPloxion, { ...o, genre: 'ploxion', ploxion: idPloxion }),
    maj: (o) => maj('px:' + idPloxion, o),
    fin: () => fin('px:' + idPloxion),
  });
  return { debut, maj, fin, toutFinir, pour, en: (cle) => ids.has(cle) };
}
