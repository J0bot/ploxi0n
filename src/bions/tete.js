// @bion tete — la tête et le regard en gestes : un pointeur lissé (la tête, ou le regard calibré), fixer = toucher, cligner longtemps =
// toucher, hocher = oui, secouer = non, un coup de tête = gauche / droite | api: creerTete, ajusterAffine, appliquerAffine, GESTES
// 👁 (0.99.46, RS-7 : intégrer le Suivi du regard et de la tête → « notre suivi tête / regard »). Pur, sans DOM ni horloge : on lui pousse les
// mesures de PloxiRegard ({ t, lacet, tangage, cligneG, cligneD, x?, y? }), il rend le pointeur (0…1 sur l'écran) et les gestes reconnus.
// Les seuils sont des réglages (le JS de l'app les expose) : à ajuster sur l'iPhone, rien n'a encore été mesuré sur un vrai visage.

export const GESTES = ['fixer', 'cligner', 'oui', 'non', 'gauche', 'droite'];

export const REGLAGES = {
  portee: 0.35,        // radians de tête pour aller du centre au bord de l'écran (≈ 20°)
  lissage: 0.3,        // le poids de la nouvelle mesure (0 : figé, 1 : brut)
  fixerMs: 900,        // rester dans un petit rond ce temps = toucher
  fixerRayon: 0.045,   // la taille du rond (en fraction de l'écran)
  clinSeuil: 0.6,      // les deux yeux fermés au-delà = un clignement
  clinMin: 350, clinMax: 1500,   // un clignement VOLONTAIRE (les réflexes durent ~150 ms)
  hocheAmp: 0.12,      // l'amplitude d'un aller-retour de la tête pour oui / non (radians)
  hocheFenetre: 1200,  // les allers-retours doivent tenir dans ce temps
  coupAmp: 0.35,       // un coup de tête à gauche / à droite : aussi loin…
  coupRetour: 0.15,    // …puis revenir près du centre
  coupMax: 900,        // le tout en moins de ce temps
  refractaire: 700,    // après un geste, on attend avant d'en reconnaître un autre
};

/** l'affine (2 × 3) qui envoie les points bruts sur les points voulus, au sens des moindres carrés (3 paires au moins, pas alignées) */
export function ajusterAffine(paires) {
  if (!Array.isArray(paires) || paires.length < 3) return null;
  // résoudre [x y 1] · [a b c]ᵀ = X et = Y : les équations normales (3 × 3)
  const S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], BX = [0, 0, 0], BY = [0, 0, 0];
  for (const { brut, vise } of paires) {
    const v = [brut.x, brut.y, 1];
    for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) S[i][j] += v[i] * v[j]; BX[i] += v[i] * vise.x; BY[i] += v[i] * vise.y; }
  }
  const resoudre = (A, b) => {   // Gauss avec pivot
    const M = A.map((l, i) => [...l, b[i]]);
    for (let c = 0; c < 3; c++) {
      let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      if (Math.abs(M[p][c]) < 1e-12) return null;
      [M[c], M[p]] = [M[p], M[c]];
      for (let r = 0; r < 3; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]; }
    }
    return [M[0][3] / M[0][0], M[1][3] / M[1][1], M[2][3] / M[2][2]];
  };
  const ax = resoudre(S, BX), ay = resoudre(S, BY);
  return ax && ay ? { ax, ay } : null;
}
export const appliquerAffine = (A, p) => ({ x: A.ax[0] * p.x + A.ax[1] * p.y + A.ax[2], y: A.ay[0] * p.x + A.ay[1] * p.y + A.ay[2] });

const borne = (v) => Math.max(0, Math.min(1, v));

/**
 * mode : 'tete' (la tête pointe ; fixer et cligner touchent) | 'regard' (le regard calibré pointe ; la tête fait oui, non, gauche, droite)
 * reglages : REGLAGES à changer ; inverser : { lacet?, tangage? } (le sens de la tête, à confirmer sur l'iPhone)
 * → { pousser(m) → [gestes], pointeur(), recentrer(), calibration(A | null), neutre() }
 */
export function creerTete({ mode = 'tete', reglages = {}, inverser = {} } = {}) {
  const R = { ...REGLAGES, ...reglages };
  let neutre = null, affine = null, pt = null, fixe = null, clinDebut = 0;
  const calme = { pointeur: -Infinity, tete: -Infinity };   // le repos après un geste, par canal : un « fixer » ne mange pas un coup de tête
  const hist = [];   // les dernières mesures (pour oui / non / les coups)
  let coup = null;   // { cote, t } : la tête est partie loin d'un côté
  const sl = (m) => (inverser.lacet ? -1 : 1) * (m.lacet - neutre.lacet);
  const st = (m) => (inverser.tangage ? -1 : 1) * (m.tangage - neutre.tangage);

  function brutPointeur(m) {
    if (mode === 'regard') { if (!affine || m.x == null || m.y == null) return null; const p = appliquerAffine(affine, m); return { x: borne(p.x), y: borne(p.y) }; }
    return { x: borne(0.5 - sl(m) / (2 * R.portee)), y: borne(0.5 - st(m) / (2 * R.portee)) };
  }
  /** les changements de sens d'un angle (d'au moins amp chacun) dans la fenêtre : 2 = un aller-retour-aller (hocher, secouer) */
  function oscillations(cle, t) {
    const l = hist.filter(h => t - h.t <= R.hocheFenetre).map(h => h[cle]); if (!l.length) return 0;
    let n = 0, sens = 0, ext = l[0];
    for (const v of l) {
      if (sens === 0) { if (v - ext >= R.hocheAmp) { sens = 1; ext = v; } else if (ext - v >= R.hocheAmp) { sens = -1; ext = v; } }
      else if (sens === 1) { if (v > ext) ext = v; else if (ext - v >= R.hocheAmp) { n++; sens = -1; ext = v; } }
      else { if (v < ext) ext = v; else if (v - ext >= R.hocheAmp) { n++; sens = 1; ext = v; } }
    }
    return n;
  }

  function pousser(m) {
    if (!m || !Number.isFinite(m.t) || !Number.isFinite(m.lacet) || !Number.isFinite(m.tangage)) return [];
    if (!neutre) neutre = { lacet: m.lacet, tangage: m.tangage };
    const t = m.t, sortie = [];
    const emettre = (g, d = {}) => { const canal = g === 'fixer' || g === 'cligner' ? 'pointeur' : 'tete'; if (t - calme[canal] < R.refractaire) return; sortie.push({ geste: g, t, ...d }); calme[canal] = t; };
    // le pointeur, lissé
    const b = brutPointeur(m);
    if (b) pt = pt ? { x: pt.x + R.lissage * (b.x - pt.x), y: pt.y + R.lissage * (b.y - pt.y) } : b;
    // fixer
    if (pt) {
      if (!fixe || Math.hypot(pt.x - fixe.x, pt.y - fixe.y) > R.fixerRayon) fixe = { x: pt.x, y: pt.y, t, fait: false };
      else if (!fixe.fait && t - fixe.t >= R.fixerMs) { fixe.fait = true; emettre('fixer', { x: fixe.x, y: fixe.y }); }
    }
    // cligner (les deux yeux, longtemps)
    const ferme = (m.cligneG || 0) > R.clinSeuil && (m.cligneD || 0) > R.clinSeuil;
    if (ferme && !clinDebut) clinDebut = t;
    if (!ferme && clinDebut) { const d = t - clinDebut; clinDebut = 0; if (d >= R.clinMin && d <= R.clinMax) emettre('cligner', pt ? { x: pt.x, y: pt.y } : {}); }
    // la tête : seulement quand elle ne pointe pas (mode regard)
    if (mode === 'regard') {
      hist.push({ t, l: sl(m), p: st(m) }); while (hist.length && t - hist[0].t > R.hocheFenetre) hist.shift();
      const L = sl(m);
      if (!coup && Math.abs(L) >= R.coupAmp) coup = { cote: L > 0 ? 'gauche' : 'droite', t };
      if (coup && t - coup.t > R.coupMax) coup = null;
      if (coup && Math.abs(L) <= R.coupRetour) { emettre(coup.cote); coup = null; hist.length = 0; }
      else if (oscillations('p', t) >= 2) { emettre('oui'); hist.length = 0; }
      else if (oscillations('l', t) >= 2) { emettre('non'); hist.length = 0; coup = null; }
    }
    dernierT = t;
    return sortie;
  }
  let dernierT = 0;
  return {
    pousser, pointeur: () => (pt ? { ...pt } : null),
    /** 0…1 : le temps déjà passé à fixer le point courant (l'anneau qui se remplit) */
    progres: () => (fixe && !fixe.fait ? Math.min(1, Math.max(0, (dernierT - fixe.t) / R.fixerMs)) : 0),
    recentrer: () => { neutre = null; pt = null; fixe = null; },
    calibration: (A) => { if (A !== undefined) affine = A; return affine; },
    neutre: () => (neutre ? { ...neutre } : null),
  };
}
