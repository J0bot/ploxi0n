// 🌍 (0.71) le terrax : le terrion (la carte), poser un objet, les quêtes, son cube
export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.ploxi0nRouteur.ouvrir('terrax')); await page.waitForTimeout(2500);
  await ecrire('01-terrion');
  await page.evaluate(() => document.querySelector('[data-tx="poser-centre"]').click()); await page.waitForTimeout(300);
  await page.evaluate(() => { document.querySelector('[data-tx-texte]').value = 'départ du terrax'; });
  await ecrire('02-poser');
  await page.evaluate(() => document.querySelector('[data-tx="graver"]').click()); await page.waitForTimeout(500);
  await ecrire('03-pose');
  await page.evaluate(() => document.querySelector('[data-page-cube="quetes"]').click()); await page.waitForTimeout(300);
  await ecrire('04-quetes');
  await page.evaluate(() => document.querySelector('[data-cube]').click()); await page.waitForTimeout(1500);
  await ecrire('05-cube');
  return page.evaluate(() => ({ tuiles: document.querySelectorAll('.tx-t').length, chargees: [...document.querySelectorAll('.tx-t')].filter(i => i.complete && i.naturalWidth).length, marques: document.querySelectorAll('.tx-m').length, faces: [...document.querySelectorAll('.px-cube-pages .ci-etiquette')].map(x => x.textContent) }));
}
