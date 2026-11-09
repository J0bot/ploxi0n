// ◈ (0.66) le xerploxion : un ploxion en hologramme (le gyroscope simulé le penche)
export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.ploxi0nRouteur.ouvrir('marketplace')); await page.waitForTimeout(900);
  await page.evaluate(() => document.querySelector('[data-holo]').click()); await page.waitForTimeout(900); await ecrire('01-xerploxion');
  return { actif: await page.evaluate(() => window.ploxi0nRouteur.holoActif()), transform: await page.evaluate(() => document.querySelector('.px-hote.px-holo')?.style.transform) };
}
