// ⊡ (0.70) la capture d'écran : le xer en image, ses voisins autour ; glisser vers la droite
export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  for (const id of ['bother', 'marketplace', 'reglages-app']) { await page.evaluate((x) => window.ploxi0nRouteur.ouvrir(x), id); await page.waitForTimeout(700); }
  await page.evaluate(() => window.dispatchEvent(new Event('ploxi0n-capture')));
  await page.waitForTimeout(80); await ecrire('01-eclair');
  await page.waitForTimeout(600); await ecrire('02-xer-en-image');
  const avant = await page.evaluate(() => [...document.querySelectorAll('.px-vx-t')].map(t => (t.dataset.dir || 'centre') + ':' + t.dataset.vx));
  await page.mouse.move(330, 420); await page.mouse.down(); await page.mouse.move(120, 425, { steps: 6 }); await page.mouse.up();
  await page.waitForTimeout(500); await ecrire('03-glisse');
  const apres = await page.evaluate(() => [...document.querySelectorAll('.px-vx-t')].map(t => (t.dataset.dir || 'centre') + ':' + t.dataset.vx));
  return { avant, apres };
}
