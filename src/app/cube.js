// ◈ LE CUBE (0.48, RS-7 : « pour les widgets, on peut avoir les infos des bions, genre un widget cube qui bouge selon le gyroscope »).
// Six faces = six infos des bions (les VALEURS : celles de l'app — tsoins, à l'écoute, pas, compte… — et celles que chaque ploxion ou
// bion publie avec jOSRaccourcis.publierValeur, préfixe px.). L'app les publie (Préférences ploxi0n.cube → App Group) avec la dernière
// inclinaison du téléphone (--mx/--my du thème vivant) : le widget « Cube » les dessine en 3D, penché comme le téléphone l'était, et
// tourne d'un geste (⟲, iOS 17) ou de lui-même au fil de la journée. LE GYROSCOPE EN DIRECT : impossible dans un widget (Apple ne leur
// donne ni capteurs ni animation continue) — c'est l'aperçu de ⚙ › Widgets, dans l'app, qui suit le téléphone en temps réel.
// Réglages : boxion_local « reglages/cube » = [6 clés de valeurs].
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const FACES_DEFAUT = ['tsoins-jour', 'musique', 'pas', 'ploxions', 'compte', 'dernier-tsoin'];
export const GLYPHES = { 'px.clicker': '◈', 'tsoins-jour': '⧗', 'dernier-tsoin': '✎', musique: '♫', pas: '∷', sommeil: '☾', ploxions: '▣', compte: '◇', mode: '◈' };   // (0.54) aucun emoji : le widget les écrit tels quels

/** les six faces : [{ k, g (glyphe), t (titre), v (valeur) }] */
export function faces(choix, valeurs) {
  return choix.map(k => { const x = valeurs[k]; return { k, g: GLYPHES[k] || (String(k).startsWith('px.') ? '⬡' : '◆'), t: x ? String(x.titre || k) : k, v: x ? String(x.valeur ?? '') : '—' }; });
}

export function creerCube({ W = globalThis.window, boxion, valeurs = () => ({}), preferences = () => import('@capacitor/preferences') } = {}) {
  let choix = [...FACES_DEFAUT], dernier = '';
  const pret = boxion.get('reglages', 'cube').then(v => { if (Array.isArray(v) && v.length === 6) choix = v.map(String); }).catch(() => {});
  const natif = () => !!(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  const inclinaison = () => { const v = (W.ploxi0nMouvement && W.ploxi0nMouvement.valeurs) ? W.ploxi0nMouvement.valeurs() : { x: 0, y: 0 }, r = (x) => Math.round((+x || 0) * 10) / 10; return { x: r(v.x), y: r(v.y) }; };   // (0.64) plus lu sur <html>
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
  /** (0.54, RS-7 : « pas de prévisualisation ») l'aperçu VIT tout seul : le gyroscope en direct (jOSNatif.mouvement.ecouter : il ne
   *  tourne qu'à la demande depuis la 0.53), le doigt qui le fait tourner, et sinon une rotation lente ; s'arrête quand l'aperçu disparaît */
  function animer(scene) {
    const cube = scene && scene.querySelector('.px-cube'); if (!cube || scene.__anime) return null; scene.__anime = true;
    let rx = -24, ry = -34, cibleX = -24, cibleY = -34, gyro = 0, doigt = null, t0 = Date.now(), image = 0;
    const M = W.jOSNatif && W.jOSNatif.mouvement;
    const off = M && M.ecouter ? M.ecouter((e) => { gyro = Date.now(); cibleX = -24 + (+e.y || 0) * 30; cibleY = -34 + (+e.x || 0) * 42; }) : null;
    scene.addEventListener('pointerdown', (e) => { doigt = { x: e.clientX, y: e.clientY, rx: cibleX, ry: cibleY }; try { scene.setPointerCapture(e.pointerId); } catch (er) { /* */ } });
    scene.addEventListener('pointermove', (e) => { if (!doigt) return; cibleY = doigt.ry + (e.clientX - doigt.x) * 0.6; cibleX = doigt.rx - (e.clientY - doigt.y) * 0.6; });
    const lacher = () => { doigt = null; t0 = Date.now(); };
    scene.addEventListener('pointerup', lacher); scene.addEventListener('pointercancel', lacher);
    scene.style.touchAction = 'none'; cube.style.transition = 'none';
    const pas = () => {
      if (!scene.isConnected) { if (off) off(); scene.__anime = false; return; }
      if (!doigt && Date.now() - gyro > 1500 && Date.now() - t0 > 1200) cibleY += 0.25;   // pas de capteur : il tourne doucement
      rx += (cibleX - rx) * 0.12; ry += (cibleY - ry) * 0.12;
      cube.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
      image = (W.requestAnimationFrame || ((f) => W.setTimeout(f, 16)))(pas);
    };
    pas();
    return { arreter: () => { if (off) off(); scene.__anime = false; } };
  }
  return { pret, publier, choisir, apercu, animer, choix: () => [...choix], faces: lesFaces };
}
