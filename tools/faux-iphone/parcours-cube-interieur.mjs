// ▣ (0.67) « dans le cube » (le téléphone = une face, les quatre autres autour, le gyroscope simulé) + le marketplace (icônes, portée)
export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.ploxi0nRouteur.ouvrir('cube-interieur')); await page.waitForTimeout(1200);
  await ecrire('01-dans-le-cube');
  const cube = await page.evaluate(() => ({ faces: document.querySelectorAll('.ci-face').length, titres: [...document.querySelectorAll('.ci-face [data-ci-face]')].map(x => x.textContent.trim()).slice(0, 5) }));
  await page.evaluate(() => window.ploxi0nRouteur.ouvrir('marketplace')); await page.waitForTimeout(1200);
  await ecrire('02-marketplace');
  const mk = await page.evaluate(() => ({ icones: document.querySelectorAll('.mk-xk').length, portees: [...document.querySelectorAll('[data-portee]')].map(x => x.textContent.trim()) }));
  return { cube, mk };
}
