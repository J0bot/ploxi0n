// (0.61) les pages de côté de l'accueil : à gauche « aujourd'hui », à droite « bibliothèque » ; l'accueil s'ouvre sur la page principale.
export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  const r = {};
  // un ploxion ouvert puis minimisé : « ce qui vit » n'est pas vide
  await page.evaluate(() => { const t = document.querySelector('.px-tuile[data-id="bother"]'); if (t) t.click(); }); await page.waitForTimeout(800);
  await page.evaluate(() => { const m = document.querySelector('[data-minimiser]'); if (m) m.click(); }); await page.waitForTimeout(500);
  const ici = () => page.evaluate(() => { const c = document.querySelector('.px-pages'); const i = Math.round(c.scrollLeft / c.clientWidth); const s = c.children[i]; return s.dataset.special || 'page ' + s.dataset.page; });
  r.depart = await ici();
  await page.evaluate(() => { const c = document.querySelector('.px-pages'); c.scrollLeft = 0; }); await page.waitForTimeout(400);
  r.gauche = await ici(); await ecrire('02-aujourdhui');
  r.vit = await page.evaluate(() => document.querySelectorAll('.px-auj-l').length);
  await page.evaluate(() => { const c = document.querySelector('.px-pages'); c.scrollLeft = c.scrollWidth; }); await page.waitForTimeout(400);
  r.droite = await ici(); await ecrire('03-bibliotheque');
  return r;
}
