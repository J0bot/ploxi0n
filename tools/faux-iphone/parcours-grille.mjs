// ▦ (0.99.19, RS-7 : « c'est quoi ça, pourquoi c'est tout petit » : tes ploxions au dézoom, une grille de 4 cases réduite au milieu de l'écran ;
// « il faut que ça prenne la place maximale possible, automatiquement ») : la grille de tes ploxions REMPLIT la scène à toutes les échelles ;
// pincer change le nombre de colonnes (dézoomer = plus de colonnes). Peu de ploxions = de grandes cases ; beaucoup = ça défile.
export default async function ({ page, ecrire }) {
  const installer = (n) => page.evaluate(async (n) => { const b = window.ploxi0n.boxion; const ids = [];
    for (let i = 0; i < n; i++) { const id = 'g' + i; ids.push(id); await b.put('ploxions', id, { id, nom: 'ploxion ' + i, icone: '▣', js: 'document.body.textContent="' + id + '"', hash: 'h', installe: new Date().toISOString(), bions: [] }); }
    const l = (await b.get('marketplace', 'installes')) || []; await b.put('marketplace', 'installes', [...new Set([...l, ...ids])]);
    const a = (await b.get('reglages', 'app')) || {}; await b.put('reglages', 'app', { ...a, mode: 'organique' }); }, n);
  const m = (f, ...a) => page.evaluate(([f, a]) => { const h = document.querySelector('.px-accueil .px-org-map-h'); return h && h.__map ? h.__map[f](...a) : null; }, [f, a]);
  const mesure = () => page.evaluate(() => { const s = document.querySelector('.px-accueil .px-map-n'), t = s && s.querySelector('.px-map-tt'), c = t && t.querySelector('.px-map-tc'); if (!t || !c) return null;
    const cs = getComputedStyle(s), place = s.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), rt = t.getBoundingClientRect(), rc = c.getBoundingClientRect();
    return { cases: t.children.length, colonnes: getComputedStyle(t).gridTemplateColumns.split(' ').length, case: Math.round(rc.width), remplit: Math.round(rt.width / place * 100), transform: s.style.transform || '', nom: getComputedStyle(c.querySelector('small')).fontSize }; });
  const r = {};
  await installer(9); await page.reload(); await page.waitForTimeout(3500);
  await m('zoomer', 'tout'); await page.waitForTimeout(1200);
  r.peu = await mesure(); await ecrire('grille-01-peu');
  await m('echelle', 0.55); await page.waitForTimeout(400); r.peuLoin = await mesure(); await ecrire('grille-02-peu-loin');
  await installer(80); await page.reload(); await page.waitForTimeout(3500);
  await m('zoomer', 'tout'); await page.waitForTimeout(1200);
  r.beaucoup = await mesure(); await ecrire('grille-03-beaucoup');
  await m('echelle', 0.55); await page.waitForTimeout(400); r.beaucoupLoin = await mesure(); await ecrire('grille-04-beaucoup-loin');
  await m('echelle', 1.45); await page.waitForTimeout(400); r.beaucoupPres = await mesure(); await ecrire('grille-05-beaucoup-pres');
  return r;
}
