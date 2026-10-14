// (0.64) la lenteur, mesurée : CPU ralenti ×4 (un iPhone), 202 ploxions (le xer de RS-7) ; le coût de l'accueil, du thème vivant, d'une ouverture
export default async function ({ page, ecrire }) {
  const cdp = await page.context().newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(800);
  const r = await page.evaluate(async () => {
    const R = window.ploxi0nRouteur, cat = R.catalogue(), cats = ['jeu', 'social', 'musique', 'connaissance', 'outil', 'sante', 'video', 'maison'];
    const faux = Array.from({ length: 192 }, (_, i) => ({ id: 'faux-' + i, nom: 'Ploxion ' + i, icone: '◇', cat: cats[i % 8], type: i % 7 ? 'ploxion' : 'xerkion', koins: 5 + (i % 3), bions: ['jOSGpg'] }));
    const m = (f) => { const t = performance.now(); f(); return Math.round(performance.now() - t); };
    const res = {};
    let t = performance.now(); R.majCatalogue([...cat, ...faux], { redessiner: true }); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); res.accueil202 = Math.round(performance.now() - t);
    res.noeuds = document.getElementsByTagName('*').length; res.svg = document.querySelectorAll('svg').length;
    const h = document.documentElement; let s = 0;
    for (let i = 0; i < 16; i++) s += m(() => { h.style.setProperty('--mx', (Math.sin(i) * 0.5).toFixed(3)); void document.body.offsetHeight; });
    res.htmlVarParMesure = +(s / 16).toFixed(1);   // le coût d'une variable posée sur <html> (ce que le thème vivant faisait avant la 0.63.1)
    s = 0; for (let i = 0; i < 16; i++) s += m(() => { h.classList.toggle('px-zzz'); void document.body.offsetHeight; });
    res.classeSurHtml = +(s / 16).toFixed(1);
    res.redessin = m(() => { R.majCatalogue([...cat, ...faux], { redessiner: true }); void document.body.offsetHeight; });
    // à l'accueil, au repos, le gyroscope simulé qui bouge (le thème vivant) : combien d'images en 2 s (120 = parfait) ?
    await new Promise(r => setTimeout(r, 600));
    res.images2s = await new Promise((fin) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else fin(n); }; requestAnimationFrame(f); });
    res.themeActif = document.documentElement.classList.contains('px-anime');
    return res;
  });
  await ecrire('01-accueil-202');
  const t0 = Date.now(); await page.evaluate(() => window.ploxi0nRouteur.ouvrir('marketplace')); await page.waitForTimeout(50); r.ouvrirMarketplace = Date.now() - t0;
  await page.waitForTimeout(800); await page.evaluate(() => window.ploxi0nRouteur.minimiser()); await page.waitForTimeout(500);
  r.longues = await page.evaluate(() => { const l = performance.getEntriesByType('longtask') || []; return l.length; });
  return r;
}
