// LES PRÉFÉRENCES de l'app (RS-7 12.10 : « améliorer au max les réglages, on a tellement d'options qu'on peut activer ou désactiver »).
// boxion_local « reglages/app » ; appliquer() pose des classes sur <html> (le CSS s'y accroche), le routeur lit le reste.
//   grain       la patine (le grain fixe)                  calme      plus aucune transition ni animation de geste
//   icones      petites | normales | grandes               contraste  normal | fort (textes et bords plus clairs)
//   bords       glisser depuis les bords pour changer d'app appuiLong le menu d'un ploxion à l'appui long
//   maxVivants  ploxions gardés vivants en arrière-plan    dock       le dock en bas de l'accueil
//   plaque      la plaque gravée « cycle … » de l'accueil
//   haptique    les retours haptiques (ouvrir, revenir, minimiser, les bords, les pages, les interrupteurs…)
export const PREFS_DEFAUT = { barreClavier: true, telecommande: true, pleinEcran: false, clicDroit: true, gestes: {}, haptique: true, grain: true, calme: false, icones: 'normales', contraste: 'normal', bords: true, appuiLong: true, maxVivants: 5, dock: true, plaque: true, barreHaut: true, reprendre: true, themeVivant: true, webNatif: true, mode: 'chill-tekk', miniDocks: 2 };

export function creerPrefs({ W = globalThis.window, boxion }) {
  let p = { ...PREFS_DEFAUT };
  const abonnes = new Set();
  const pret = boxion.get('reglages', 'app').then(v => { if (v && typeof v === 'object') p = { ...PREFS_DEFAUT, ...v }; }).catch(() => {});
  function appliquer() {
    const h = W.document.documentElement;
    h.classList.toggle('px-sans-grain', !p.grain);
    h.classList.toggle('px-calme', !!p.calme);
    h.classList.toggle('px-contraste', p.contraste === 'fort');
    for (const t of ['petites', 'normales', 'grandes']) h.classList.toggle('px-icones-' + t, p.icones === t);
    h.classList.toggle('px-sans-dock', !p.dock);
    h.classList.toggle('px-sans-plaque', !p.plaque);
    h.classList.toggle('px-sans-bords', !p.bords);
    h.classList.toggle('px-telecommande', p.telecommande !== false);
  }
  return {
    pret, appliquer,
    lire: () => ({ ...p }),
    async regler(patch) {
      p = { ...p, ...patch };
      p.maxVivants = Math.max(1, Math.min(8, +p.maxVivants || 5));
      await boxion.put('reglages', 'app', p); appliquer();
      for (const f of abonnes) { try { f(p); } catch (e) { /* */ } }
      return { ...p };
    },
    surChangement(f) { abonnes.add(f); return () => abonnes.delete(f); },
  };
}
