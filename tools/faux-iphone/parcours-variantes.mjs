// 〰 (0.95) les cinq peaux de l'organique, côte à côte (RS-7 : « donne-moi plusieurs versions en même temps, je veux pouvoir comparer ») :
// pour chaque variante, les mêmes écrans — les koins ouverts sur l'accueil, la map, le système
export default async function ({ page, ecrire }) {
  await page.evaluate(async () => { const a = (await window.ploxi0n.boxion.get('reglages', 'app')) || {}; await window.ploxi0n.boxion.put('reglages', 'app', { ...a, koins: true, mode: 'organique' }); });
  await page.reload(); await page.waitForTimeout(3000);
  for (const id of ['systeme', 'ambiances']) { await page.evaluate((i) => window.ploxi0n.routeur.ouvrir(i), id); await page.waitForTimeout(500); await page.evaluate(() => window.ploxi0n.routeur.faire('minimiser')); await page.waitForTimeout(300); }
  const vues = {};
  for (const v of ['nerfs', 'vaisseaux', 'cables', 'gelee', 'terminal']) {
    await page.evaluate((x) => document.documentElement.setAttribute('data-px-variante', x), v);
    await page.evaluate(() => window.ploxi0n.routeur.faire('accueil')); await page.waitForTimeout(400);
    for (let k = 0; k < 3; k++) { await page.click('[data-koin="gauche"]'); await page.waitForTimeout(200); }
    await page.waitForTimeout(600); await ecrire(v + '-1-koins');
    await page.click('.px-koin-voile', { position: { x: 20, y: 20 } }).catch(() => {}); await page.waitForTimeout(200);
    await page.evaluate(() => window.ploxi0n.routeur.faire('map')); await page.waitForTimeout(1200); await ecrire(v + '-2-map');
    await page.evaluate(() => window.ploxi0n.routeur.ouvrir('systeme')); await page.waitForTimeout(1200); await ecrire(v + '-3-systeme');
    vues[v] = await page.evaluate(() => document.querySelectorAll('.px-neurones').length);
  }
  return { vues };
}
