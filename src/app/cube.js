// ◈ LE CUBE (0.48, RS-7 : « pour les widgets, on peut avoir les infos des bions, genre un widget cube qui bouge selon le gyroscope »).
// Six faces = six infos des bions (les VALEURS : celles de l'app — tsoins, à l'écoute, pas, compte… — et celles que chaque ploxion ou
// bion publie avec jOSRaccourcis.publierValeur, préfixe px.). L'app les publie (Préférences ploxi0n.cube → App Group) avec la dernière
// inclinaison du téléphone (--mx/--my du thème vivant) : le widget « Cube » les dessine en 3D, penché comme le téléphone l'était, et
// tourne d'un geste (⟲, iOS 17) ou de lui-même au fil de la journée. LE GYROSCOPE EN DIRECT : impossible dans un widget (Apple ne leur
// donne ni capteurs ni animation continue) — c'est l'aperçu de ⚙ › Widgets, dans l'app, qui suit le téléphone en temps réel.
// Réglages : boxion_local « reglages/cube » = [6 clés de valeurs].
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const FACES_DEFAUT = ['tsoins-jour', 'musique', 'pas', 'ploxions', 'compte', 'dernier-tsoin'];
export const GLYPHES = { 'tsoins-jour': '⧗', 'dernier-tsoin': '✎', musique: '♫', pas: '👣', sommeil: '☾', ploxions: '▣', compte: '◇', mode: '🌐' };

/** les six faces : [{ k, g (glyphe), t (titre), v (valeur) }] */
export function faces(choix, valeurs) {
  return choix.map(k => { const x = valeurs[k]; return { k, g: GLYPHES[k] || (String(k).startsWith('px.') ? '⬡' : '◆'), t: x ? String(x.titre || k) : k, v: x ? String(x.valeur ?? '') : '—' }; });
}

export function creerCube({ W = globalThis.window, boxion, valeurs = () => ({}), preferences = () => import('@capacitor/preferences') } = {}) {
  let choix = [...FACES_DEFAUT], dernier = '';
  const pret = boxion.get('reglages', 'cube').then(v => { if (Array.isArray(v) && v.length === 6) choix = v.map(String); }).catch(() => {});
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  const inclinaison = () => { const st = W.document.documentElement.style, r = (x) => Math.round((+x || 0) * 10) / 10; return { x: r(st.getPropertyValue('--mx')), y: r(st.getPropertyValue('--my')) }; };
  const lesFaces = () => faces(choix, valeurs() || {});
  async function publier() {
    await pret;
    const s = JSON.stringify({ faces: lesFaces(), incl: inclinaison() });
    if (s === dernier || !natif()) return; dernier = s;
    try { const { Preferences } = await preferences(); await Preferences.set({ key: 'ploxi0n.cube', value: s }); } catch (e) { /* */ }
  }
  async function choisir(i, cle) { await pret; if (i >= 0 && i < 6 && cle) { choix[i] = String(cle); await boxion.put('reglages', 'cube', choix).catch(() => {}); } return publier(); }
  /** l'aperçu 3D de l'app : il suit le gyroscope (--mx/--my) en temps réel */
  function apercu() {
    const f = lesFaces(), pos = ['avant', 'droite', 'arriere', 'gauche', 'haut', 'bas'];
    return '<div class="px-cube-scene"><div class="px-cube">' + f.map((x, i) => '<div class="px-cube-f px-cube-' + pos[i] + '"><b>' + esc(x.g) + '</b><span>' + esc(x.v) + '</span><small>' + esc(x.t) + '</small></div>').join('') + '</div></div>';
  }
  return { pret, publier, choisir, apercu, choix: () => [...choix], faces: lesFaces };
}
