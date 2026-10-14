// ▣ (0.68) le cube des pages : bother (ses onglets), on tourne, on entre ; les réglages (le contrat) ; le marketplace (ses vues)
export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  const cube = async (id, nom) => {
    await page.evaluate((x) => window.ploxi0nRouteur.ouvrir(x), id); await page.waitForTimeout(1400);
    await page.evaluate(() => document.querySelector('[data-cube]').click()); await page.waitForTimeout(1800);
    await ecrire(nom);
    return page.evaluate(() => ({ ouvert: window.ploxi0nRouteur.cubeActif(), faces: [...document.querySelectorAll('.px-cube-pages .ci-face')].map(f => f.className.replace('ci-face ', '') + ' : ' + (f.querySelector('.ci-etiquette') || {}).textContent) }));
  };
  const r = {};
  r.bother = await cube('bother', '01-bother-cube');
  // glisser vers la gauche : la page d'à droite vient au fond
  const s = await page.evaluate(() => { const b = document.querySelector('.px-cube-pages').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
  await page.mouse.move(s.x + 120, s.y); await page.mouse.down(); await page.mouse.move(s.x - 60, s.y, { steps: 4 }); await page.mouse.up();
  await page.waitForTimeout(190); await ecrire('02-bother-tourne');
  await page.waitForTimeout(500); await ecrire('03-bother-tourne-fin');
  r.fondApres = await page.evaluate(() => document.querySelector('.px-cube-pages .ci-fond .ci-etiquette').textContent);
  // toucher le fond : on y entre
  await page.mouse.click(s.x, s.y); await page.waitForTimeout(900); await ecrire('04-bother-entre');
  r.apresEntree = await page.evaluate(() => ({ ouvert: window.ploxi0nRouteur.cubeActif(), onglet: (document.querySelector('.px-hote[data-ploxion="bother"] [data-tab].on') || {}).textContent }));
  r.reglages = await cube('reglages-app', '05-reglages-cube');
  await page.evaluate(() => document.querySelector('[data-cube]').click()); await page.waitForTimeout(300);
  r.marketplace = await cube('marketplace', '06-marketplace-cube');
  return r;
}
