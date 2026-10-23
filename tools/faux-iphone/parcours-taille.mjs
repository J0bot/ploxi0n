// ⊕ (0.99.19, RS-7 : « l'entièreté du truc est trop petite ») : la taille de tout part au natif (PloxiApple.taille → pageZoom de WebKit) ;
// son effet est simulé ici comme WebKit le fait : la page voit un écran plus étroit (393 / zoom). Rien ne déborde en largeur, à chaque taille.
export default async function ({ page, ecrire, tailles }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.waitForTimeout(1000);
  const r = { auDemarrage: tailles.slice() };
  for (const z of [1.15, 1.3, 1.45]) {
    await page.setViewportSize({ width: Math.round(393 / z), height: Math.round(852 / z) }); await page.waitForTimeout(700);
    const res = {};
    for (const id of [null, 'reglages-app', 'marketplace', 'synthe', 'autour', 'atelier-peaux']) {
      if (id) { await page.evaluate((i) => window.ploxi0n.routeur.ouvrir(i), id); await page.waitForTimeout(800); } else { await page.evaluate(() => window.ploxi0n.routeur.faire('accueil')); await page.waitForTimeout(700); }
      res[id || 'accueil'] = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (z === 1.3 && (id === null || id === 'synthe')) await ecrire('taille-' + z + '-' + (id || 'accueil'));
    }
    r['×' + z] = res;
  }
  await page.setViewportSize({ width: 393, height: 852 });
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('reglages-app')); await page.waitForTimeout(800);
  await page.evaluate(() => document.querySelector('[data-rg-aller="apparence"]').click()); await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector('[data-pv="taille"][data-v="1.3"]').click()); await page.waitForTimeout(500);
  r.apresReglage = tailles.slice(-1);
  return r;
}
