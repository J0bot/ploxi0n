// LES PRÉFÉRENCES de l'app (RS-7 12.10 : « améliorer au max les réglages, on a tellement d'options qu'on peut activer ou désactiver »).
// boxion_local « reglages/app » ; appliquer() pose des classes sur <html> (le CSS s'y accroche), le routeur lit le reste.
//   grain       la patine (le grain fixe)                  calme      plus aucune transition ni animation de geste
//   icones      petites | normales | grandes               contraste  normal | fort (textes et bords plus clairs)
//   bords       glisser depuis les bords pour changer d'app appuiLong le menu d'un ploxion à l'appui long
//   maxVivants  ploxions gardés vivants en arrière-plan    dock       le dock en bas de l'accueil
//   plaque      la plaque gravée « cycle … » de l'accueil
//   mode        (0.94) organique (membranes et neurones, src/app/neurones.js) | chill-tekk (0.99.47, RS-7 : « le mode de base quand on installe
//               l'appli, c'est le plus simple pour prendre en main ») | xerboxion | xerbot
//   organiqueVu (0.94) la bascule unique vers l'organique est faite (le xer d'avant est gardé dans « mes xers », src/app/xers.js)
//   ecriture    (0.96) comment tout s'écrit : xerboxion (forme + glyphe + nom) | texte-glyphes | glyphes (rien que) | texte (rien que) | emoji | minimal
//               | humain (0.99.8 : zéro texte, des glyphes et des maths ; src/bions/humain.js)
//   regard      (0.99.46) non | tete | regard : piloter de la tête ou du regard (src/app/regard.js)
//   cibles      (0.99.44) auto | oui | non : les grandes cibles (44 points), pour le regard, la tête, le contrôle de sélection
//   haptique    les retours haptiques (ouvrir, revenir, minimiser, les bords, les pages, les interrupteurs…)
export const PREFS_DEFAUT = { barreClavier: true, telecommande: true, pleinEcran: false, clicDroit: true, gestes: {}, haptique: true, grain: true, calme: false, icones: 'normales', contraste: 'normal', bords: true, appuiLong: true, maxVivants: 12, sommeil: 5, dock: true, plaque: true, barreHaut: true, reprendre: true, themeVivant: true, webNatif: true, mode: 'chill-tekk', miniDocks: 2, pxChill: true, glyphes: true, styleIcones: 'xerboxion', fractale: true, pagesCote: true, bande: false, koins: false, activites: true, cibles: 'auto', regard: 'non', regardInverse: false, organiqueVu: true, variante: 'nerfs', ecriture: 'xerboxion', police: 'mixte', langue: 'auto', taille: 1.15, peau: 'legere', policePartout: false };

/** (0.96) RS-7 23.10 : « un mode texte + glyphes, un mode pur glyphes, pur texte, emoji, minimal, xerboxion : tous les modes » */
import { POLICES, poserPolice } from '../bions/polices.js';
export { POLICES };
export const ECRITURES = [['xerboxion', 'xerboxion'], ['texte-glyphes', 'texte + glyphes'], ['glyphes', 'glyphes'], ['texte', 'texte'], ['emoji', 'emoji'], ['minimal', 'minimal'], ['humain', 'humain']];

export function creerPrefs({ W = globalThis.window, boxion }) {
  let p = { ...PREFS_DEFAUT };
  const abonnes = new Set();
  // ♿ (0.64, l'accessibilité de l'App Store : « Animations réduites ») « Réduire les animations » d'iOS = le mode Calme, sans rien régler
  let mq = null; try { mq = W.matchMedia ? W.matchMedia('(prefers-reduced-motion: reduce)') : null; } catch (e) { mq = null; }
  const ios = () => !!(mq && mq.matches);
  if (mq && mq.addEventListener) mq.addEventListener('change', () => { appliquer(); for (const f of abonnes) { try { f({ ...p, calme: !!p.calme || ios() }); } catch (e) { /* */ } } });
  const pret = boxion.get('reglages', 'app').then(v => {
    if (!v || typeof v !== 'object') return;
    p = { ...PREFS_DEFAUT, ...v };
    // 〰 (0.94, RS-7 : « avant on avait le xer ploxi0n, maintenant c'est le xer chill-tekk ; le truc de base, c'est ce qu'on fait maintenant ») :
    // une fois, le chill-tekk d'avant passe à l'organique ; son snapshot reste dans « mes xers » (xers.js), on y revient d'un toucher
    // (0.99.47) chill-tekk est redevenu le mode de base : la bascule ne change plus le mode, elle pose seulement la marque
    if (!v.organiqueVu) { p.organiqueVu = true; boxion.put('reglages', 'app', p).catch(() => {}); }
  }).catch(() => {});
  function appliquer() {
    const h = W.document.documentElement;
    h.classList.toggle('px-sans-grain', !p.grain);
    h.classList.toggle('px-calme', !!p.calme || ios());
    h.classList.toggle('px-px-chill', p.pxChill !== false);   // ◇ (0.52) tous les ploxions en chill-tekk
    h.classList.toggle('px-contraste', p.contraste === 'fort');
    // ♿ (0.99.44) les grandes cibles (44 × 44 points au moins) : pour le Suivi du regard, de la tête, le Contrôle de sélection, AssistiveTouch
    // d'iOS. auto : seulement quand iOS dit qu'une de ces aides tourne (W.__ploxiAssistance, posé par main.js) ; oui ; non
    h.classList.toggle('px-grandes-cibles', p.cibles === 'oui' || (p.cibles !== 'non' && !!W.__ploxiAssistance));
    for (const t of ['petites', 'normales', 'grandes']) h.classList.toggle('px-icones-' + t, p.icones === t);
    h.classList.toggle('px-sans-dock', !p.dock);
    h.classList.toggle('px-sans-plaque', !p.plaque);
    h.classList.toggle('px-sans-bords', !p.bords);
    h.classList.toggle('px-telecommande', p.telecommande !== false);
    h.classList.toggle('px-organique', p.mode === 'organique');
    // (0.99.19) la peau légère : les cellules en CSS, sans la couche SVG des membranes (trop lourde sur l'iPhone) ; auto = légère en économie d'énergie
    h.classList.toggle('px-leger', p.peau === 'pleine' ? false : p.peau === 'auto' ? h.getAttribute('data-px-economie') === '1' : true);
    for (const e of ECRITURES) h.classList.toggle('px-e-' + e[0], (p.ecriture || 'xerboxion') === e[0]);   // (0.96) l'écriture
    poserPolice(h, p.mode === 'organique' ? (p.police || 'mixte') : null);
    h.classList.toggle('px-police-partout', !!p.policePartout);   // (0.99.21, RS-7 : « quand on change la police, ça met la police PARTOUT ») : le xer seulement, sauf si on le veut   // (0.96) la police ; le chill-tekk garde la sienne
    h.setAttribute('data-px-variante', p.variante || 'nerfs');   // (0.95) nerfs | vaisseaux | cables | gelee | terminal (src/bions/membrane.js)   // 〰 (0.94) le xer organique : les membranes, les neurones
  }
  return {
    pret, appliquer,
    // (0.96) l'écriture décide des glyphes et du style des icônes (sans toucher à ce que tu avais réglé : revenir à xerboxion le rend)
    lire: () => { const e = p.ecriture || 'xerboxion'; return { ...p, calme: !!p.calme || ios(), calmeIos: ios(), glyphes: e === 'emoji' ? false : e === 'xerboxion' ? p.glyphes : true, styleIcones: e === 'texte-glyphes' || e === 'glyphes' || e === 'humain' ? 'glyphe' : p.styleIcones }; },
    async regler(patch) {
      p = { ...p, ...patch };
      // (0.56, RS-7 : « le max 8 ploxions ça devient chiant ») 0 = sans limite ; les cachés sont gelés (src/app/gel.js), leurs vidéos coupées
      p.maxVivants = +p.maxVivants === 0 ? 0 : Math.max(1, Math.min(99, +p.maxVivants || 12));
      p.sommeil = +p.sommeil === 0 ? 0 : Math.max(1, Math.min(240, +p.sommeil || 5));   // (0.69) minutes cachés avant de s'endormir ; 0 = jamais
      await boxion.put('reglages', 'app', p); appliquer();
      for (const f of abonnes) { try { f(p); } catch (e) { /* */ } }
      return { ...p };
    },
    surChangement(f) { abonnes.add(f); return () => abonnes.delete(f); },
  };
}
