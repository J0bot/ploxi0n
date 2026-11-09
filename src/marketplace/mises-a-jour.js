// ↻ LES MISES À JOUR DES PLOXIONS (0.80). RS-7 (19.10) : « il faut ajouter une fonctionnalité de mise à jour des ploxions dans les réglages,
// et aussi activer automatiquement, pck des fois il y a des ploxions qui ne sont pas à jour directement ».
//   automatique (par défaut) : au lancement (après 20 s, hors du chemin critique), puis toutes les `heures` tant que l'app est ouverte, et au
//              retour dans l'app si la dernière vérification est trop vieille ; seulement en ligne. Ce qui a changé est dit (une ligne en bas).
//   les bions  aussi (par défaut) : chacun est relu ; ceux qui ont changé se chargent au prochain lancement de l'app.
//   ⚙ › Ploxions › Mises à jour : l'interrupteur, la fréquence, « vérifier maintenant » avec la progression, la dernière vérification.
// Le travail lui-même est dans depot.aJour (sans cache, les nouveaux bions, le pack compris, 6 à la fois) ; chaque ploxion mis à jour quitte
// la page (routeur.oublier) : la prochaine ouverture lit sa nouvelle version, sans redémarrer l'app.
// boxion_local « reglages/maj » = { auto, bions, heures } ; « reglages/maj-etat » = { le, mis: [ids], erreurs: [ids], bions }.
export const MAJ_DEFAUT = { auto: true, bions: true, heures: 6 };
export const FREQUENCES = [[1, 'toutes les heures'], [6, 'toutes les 6 h'], [24, 'une fois par jour']];
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function creerMisesAJour({ W = globalThis.window, depot, boxion, routeur = () => null, signaler = () => {}, apres = async () => {}, enLigne = () => W.navigator.onLine !== false, maintenant = () => Date.now(), completer = null }) {
  let r = { ...MAJ_DEFAUT }, etat = null, enCours = null, minuteur = null;
  const pret = Promise.all([boxion.get('reglages', 'maj').catch(() => null), boxion.get('reglages', 'maj-etat').catch(() => null)])
    .then(([a, b]) => { if (a && typeof a === 'object') r = { ...MAJ_DEFAUT, ...a }; if (b && typeof b === 'object') etat = b; });

  /** tout vérifier ; rend { mis, erreurs, aJour, bions, le } ; une seule vérification à la fois */
  function verifier({ auto = false, progres = null } = {}) {
    if (enCours) return enCours;
    enCours = (async () => {
      await pret;
      if (!enLigne()) return { horsLigne: true, mis: [], erreurs: [], aJour: 0, bions: 0, le: maintenant() };
      const res = await depot.aJour({ progres, auto });
      const mis = res.filter(x => x.etat === 'mis-a-jour').map(x => x.id), erreurs = res.filter(x => x.etat === 'erreur').map(x => x.id);
      let bions = 0;
      if (r.bions && depot.bions && depot.majBion) {
        for (const b of await depot.bions().catch(() => [])) { try { if ((await depot.majBion(b.nom)) === 'mis-a-jour') bions++; } catch (e) { /* un bion introuvable n'arrête pas les autres */ } }
      }
      // ⧉ (0.81) les dépendances : ce que les ploxions installés composent (ultimate-social → social, chat, carte…) et qui manque
      let ajoutes = []; if (completer) { try { ajoutes = (await completer()) || []; } catch (e) { /* hors ligne en route */ } }
      etat = { le: maintenant(), mis, erreurs, bions, ajoutes, aJour: res.length - mis.length - erreurs.length };
      await boxion.put('reglages', 'maj-etat', etat).catch(() => {});
      if (mis.length) { try { await apres(mis); } catch (e) { /* l'accueil se redessine */ } }
      if (auto && ajoutes.length) signaler('⧉ ' + ajoutes.length + ' ploxion' + (ajoutes.length > 1 ? 's' : '') + ' dont tes ploxions ont besoin : ' + ajoutes.slice(0, 4).join(', ') + (ajoutes.length > 4 ? '…' : ''));
      if (auto && (mis.length || bions)) {
        const att = routeur() && routeur().enAttenteDeMaj ? routeur().enAttenteDeMaj() : [];
        signaler('↻ ' + (mis.length ? mis.length + ' ploxion' + (mis.length > 1 ? 's' : '') + ' à jour (' + mis.slice(0, 3).join(', ') + (mis.length > 3 ? '…' : '') + ')' : '') + (mis.length && bions ? ' · ' : '') + (bions ? bions + ' bion' + (bions > 1 ? 's' : '') + ' au prochain lancement' : '') + (att.length ? ' · ' + att.join(', ') + ' : à sa fermeture' : ''));
      }
      return { ...etat };
    })().finally(() => { enCours = null; });
    return enCours;
  }
  const duree = () => Math.max(1, +r.heures || 6) * 3600e3;
  const due = () => !etat || !etat.le || maintenant() - etat.le >= duree();
  /** l'automatique : au lancement (après `attente`), puis à la fréquence ; au retour dans l'app si c'est l'heure */
  function demarrer({ attente = 20000 } = {}) {
    const tic = () => { if (r.auto && !W.document.hidden && due()) verifier({ auto: true }).catch(() => {}); };
    W.setTimeout(tic, attente);
    minuteur = W.setInterval(tic, 15 * 60e3);
    W.document.addEventListener('visibilitychange', () => { if (!W.document.hidden) W.setTimeout(tic, 3000); });
  }
  async function regler(p) { await pret; r = { ...r, ...p }; await boxion.put('reglages', 'maj', r).catch(() => {}); return { ...r }; }

  /** la section des réglages (⚙ › Ploxions) : brancher(zone) après l'avoir posée */
  function html() {
    const quand = etat && etat.le ? new Date(etat.le).toLocaleString('fr-CH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'jamais';
    const bilan = etat && etat.le ? (etat.mis.length ? etat.mis.length + ' mis à jour (' + esc(etat.mis.slice(0, 4).join(', ')) + (etat.mis.length > 4 ? '…' : '') + ')' : 'tout était à jour') + (etat.erreurs.length ? ' · ' + etat.erreurs.length + ' en erreur' : '') : '';
    return '<div class="bloc px-maj">'
      + '<label class="l"><span>Mettre à jour tout seul<small>au lancement, puis ' + esc((FREQUENCES.find(f => f[0] === +r.heures) || FREQUENCES[1])[1]) + ', en ligne seulement</small></span><input type="checkbox" data-maj-auto' + (r.auto ? ' checked' : '') + '></label>'
      + '<div class="l ls"><span>Fréquence</span><div class="seg">' + FREQUENCES.map(([h]) => '<button data-maj-heures="' + h + '"' + (+r.heures === h ? ' class="on"' : '') + '>' + h + ' h</button>').join('') + '</div></div>'
      + '<label class="l"><span>Les bions aussi<small>ils se chargent au prochain lancement de l\'app</small></span><input type="checkbox" data-maj-bions' + (r.bions ? ' checked' : '') + '></label>'
      + '<div class="l"><span>Vérifier maintenant<small data-maj-etat>dernière vérification : ' + esc(quand) + (bilan ? ' · ' + bilan : '') + '</small></span><button class="p" data-maj-maintenant>↻ vérifier</button></div></div>';
  }
  function brancher(zone) {
    const s = zone.querySelector('[data-maj-etat]'); if (!s) return;
    zone.addEventListener('change', async (e) => {
      if (e.target.matches('[data-maj-auto]')) await regler({ auto: e.target.checked });
      if (e.target.matches('[data-maj-bions]')) await regler({ bions: e.target.checked });
    });
    zone.addEventListener('click', async (e) => {
      const b = e.target.closest('button'); if (!b || !zone.contains(b)) return;
      if (b.hasAttribute('data-maj-heures')) { e.stopPropagation(); await regler({ heures: +b.getAttribute('data-maj-heures') }); zone.querySelectorAll('[data-maj-heures]').forEach(x => x.classList.toggle('on', x === b)); return; }
      if (!b.hasAttribute('data-maj-maintenant')) return;
      e.stopPropagation(); b.disabled = true;
      const x = await verifier({ progres: ({ fait, total }) => { s.textContent = '↻ ' + fait + ' / ' + total + '…'; } }).catch((er) => ({ erreur: er.message }));
      b.disabled = false;
      s.textContent = x.erreur ? '⚠ ' + x.erreur : x.horsLigne ? 'hors ligne : réessaie avec du réseau'
        : (x.mis.length ? '✓ ' + x.mis.length + ' mis à jour : ' + x.mis.join(', ') : '✓ tout est à jour') + (x.ajoutes && x.ajoutes.length ? ' · ajoutés (dépendances) : ' + x.ajoutes.join(', ') : '') + (x.bions ? ' · ' + x.bions + ' bion(s) au prochain lancement' : '') + (x.erreurs.length ? ' · en erreur (labo injoignable, ou ploxion retiré du labo) : ' + x.erreurs.join(', ') : '');
    });
  }
  return { pret, verifier, demarrer, regler, reglage: () => ({ ...r }), etat: () => (etat ? { ...etat } : null), html, brancher, arreter: () => W.clearInterval(minuteur) };
}
