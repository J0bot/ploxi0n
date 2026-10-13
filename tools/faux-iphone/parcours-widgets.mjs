// ◈ (0.48) ⚙ › Widgets : l'aperçu du cube (il suit --mx/--my), le choix d'une face, la publication ploxi0n.cube vers les widgets.
export default async function ({ page, ecrire, prefs }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.evaluate(() => window.ploxi0nWidgets.publier()); await page.waitForTimeout(400);
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('reglages-app')); await page.waitForTimeout(900);
  await page.evaluate(() => document.querySelector('[data-accueil] [data-aller="widgets"]').click()); await page.waitForTimeout(500);
  const r = {};
  r.page = await page.evaluate(() => ({ titre: document.querySelector('[data-titre]').textContent, faces: [...document.querySelectorAll('.px-cube-f')].map(f => f.innerText.replace(/\s+/g, ' ')), selects: document.querySelectorAll('[data-cube-face]').length }));
  const avant = await page.evaluate(() => getComputedStyle(document.querySelector('.px-cube')).transform);
  await page.evaluate(() => { document.documentElement.style.setProperty('--mx', '0.8'); document.documentElement.style.setProperty('--my', '-0.5'); }); await page.waitForTimeout(300);
  r.suitLeTelephone = avant !== await page.evaluate(() => getComputedStyle(document.querySelector('.px-cube')).transform);
  await ecrire('widgets');
  await page.selectOption('[data-cube-face="1"]', 'ploxions'); await page.waitForTimeout(600);
  r.cubePublie = JSON.parse(prefs.get('ploxi0n.cube') || 'null');
  return r;
}
