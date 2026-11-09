// (0.63) le HUD de tuto, les états d'un ploxion (plein, pip, cadre), une démo jouée, et la lenteur : les longues tâches au lancement
export default async function ({ page, ecrire }) {
  const r = {};
  r.lancement = await page.evaluate(() => ({ dcl: Math.round(performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd || 0), maintenant: Math.round(performance.now()) }));
  await page.evaluate(() => { window.__lt = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({ type: 'longtask', buffered: true }); } catch (e) { /* */ } });
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(600);
  await page.evaluate(() => window.ploxi0nRouteur.faire('tuto')); await page.waitForTimeout(500); await ecrire('01-tuto-accueil');
  r.tuto = await page.evaluate(() => (document.querySelector('.px-tuto-hud') || {}).textContent?.slice(0, 160));
  await page.evaluate(() => document.querySelector('[data-th="ok"]')?.click());
  const id = await page.evaluate(() => [...document.querySelectorAll('.px-tuile[data-id]')].map(b => b.getAttribute('data-id')).find(i => /^(marketplace|banc|journal-tsoins)$/.test(i)));
  await page.evaluate((i) => document.querySelector('.px-tuile[data-id="' + i + '"]').click(), id); await page.waitForTimeout(900);
  await page.evaluate(() => window.ploxi0nRouteur.etat()); await page.waitForTimeout(300); await ecrire('02-plein');
  await page.evaluate(() => window.ploxi0nRouteur.etat()); await page.waitForTimeout(600); await ecrire('03-pip');
  r.pip = await page.evaluate(() => window.ploxi0nRouteur.flottant());
  await page.evaluate(() => window.ploxi0nRouteur.etat()); await page.waitForTimeout(500); await ecrire('04-cadre');
  await page.evaluate(() => window.ploxi0nRouteur.etat()); await page.waitForTimeout(400);
  r.courant = await page.evaluate(() => window.ploxi0nRouteur.courant());
  await page.evaluate(() => window.ploxi0nRouteur.faire('tuto')); await page.waitForTimeout(400); await ecrire('05-tuto-ploxion');
  await page.evaluate(() => document.querySelector('[data-th="ok"]')?.click());
  r.longues = await page.evaluate(() => window.__lt);
  r.erreurs = await page.evaluate(() => (window.__erreurs || []).slice(0, 5));
  return r;
}
