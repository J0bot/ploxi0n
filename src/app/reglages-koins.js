// ⊞ LES RÉGLAGES EN KOINS (0.99.67). RS-7 coord #2203 : « transformer les réglages en koins de réglages accessibles partout depuis le koin gauche de
// partout », avec la capture des réglages de ploxi0n (PLOXIONS · 64 : mises à jour, fréquence, les bions aussi, vérifier, installés…).
// La case ⊞ du koin gauche (src/app/koins.js) ouvre une grille de koins : un toucher bascule un réglage, comme le labo l'a fait dans ses koins
// (partials/_koins_bion.blade.php : montrerReglages / basculerReglage) ; « ⊞ tous les réglages » ouvre la page entière, « installés » le
// gestionnaire. Ce module ne dessine rien : il dit les koins (liste) et fait le toucher (basculer) ; les koins les peignent.
import { FREQUENCES } from '../marketplace/mises-a-jour.js';

/** [id, glyphe (src/app/glyphes.js), nom] : les mises à jour d'abord (la capture), puis l'app, puis les deux portes */
export const KOINS_REGLAGES = [
  ['maj-auto', 'relire', 'à jour tout seul'], ['maj-heures', 'horloge', 'fréquence'], ['maj-bions', 'bion', 'les bions aussi'], ['maj-verifier', 'valider', 'vérifier'],
  ['haptique', 'haptique', 'haptique'], ['calme', 'pause', 'calme'], ['grain', 'palette', 'la patine'], ['themeVivant', 'neurone', 'thème vivant'],
  ['telecommande', 'navigation', 'télécommande'], ['barreClavier', 'clavier', 'barre du clavier'], ['installes', 'boite', 'installés'], ['tout', 'portions', 'tous les réglages'],
];
/** les réglages de l'app qu'un koin bascule : leur valeur « allumée » telle que les réglages la lisent (prefs.js) */
const ALLUME = { haptique: (v) => v !== false, calme: (v) => !!v, grain: (v) => v !== false, themeVivant: (v) => v !== false, telecommande: (v) => v !== false, barreClavier: (v) => v === true };

/** prefs : creerPrefs ; maj : creerMisesAJour (ou null : pas de koins des mises à jour) ; ouvrir(id) : ouvrir un ploxion */
export function creerReglagesKoins({ prefs, maj = null, ouvrir = () => {} }) {
  let verif = '';   // ce que le dernier « vérifier » a trouvé
  function etat(id) {
    const p = prefs.lire(), m = maj ? maj.reglage() : null;
    if (id.startsWith('maj-')) {
      if (!m) return null;
      if (id === 'maj-auto') return { on: !!m.auto };
      if (id === 'maj-bions') return { on: !!m.bions };
      if (id === 'maj-heures') return { on: true, texte: (+m.heures || 6) + ' h' };
      return { texte: verif || 'maintenant' };
    }
    if (ALLUME[id]) return { on: ALLUME[id](p[id]) };
    return {};   // installés, tous les réglages : des portes
  }
  /** les koins : [{ id, glyphe, nom, on, etat }] (etat : oui, non, 6 h, le résultat de vérifier…) */
  function liste() {
    return KOINS_REGLAGES.map(([id, glyphe, nom]) => {
      const e = etat(id); if (!e) return null;
      return { id, glyphe, nom, on: !!e.on, etat: e.texte != null ? e.texte : ('on' in e ? (e.on ? 'oui' : 'non') : '') };
    }).filter(Boolean);
  }
  /** le toucher d'un koin ; rend 'fermer' quand il ouvre une page (les koins se referment), 'ok' quand il a basculé, null sinon */
  async function basculer(id) {
    if (id === 'tout') { ouvrir('reglages-app'); return 'fermer'; }
    if (id === 'installes') { ouvrir('gestion'); return 'fermer'; }
    if (id.startsWith('maj-')) {
      if (!maj) return null;
      const m = maj.reglage();
      if (id === 'maj-auto') await maj.regler({ auto: !m.auto });
      else if (id === 'maj-bions') await maj.regler({ bions: !m.bions });
      else if (id === 'maj-heures') { const l = FREQUENCES.map(f => f[0]), i = l.indexOf(+m.heures); await maj.regler({ heures: l[(i + 1) % l.length] }); }
      else if (id === 'maj-verifier') {
        verif = '…';
        const r = await maj.verifier().catch((e) => ({ erreur: (e && e.message) || 'erreur' }));
        verif = r.erreur ? 'pas pu' : r.horsLigne ? 'hors ligne' : (r.mis && r.mis.length) ? r.mis.length + ' à jour' : 'tout est à jour';
      } else return null;
      return 'ok';
    }
    if (ALLUME[id]) { await prefs.regler({ [id]: !ALLUME[id](prefs.lire()[id]) }); return 'ok'; }
    return null;
  }
  return { liste, basculer };
}
