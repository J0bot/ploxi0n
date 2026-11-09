// ↻ (0.80) les mises à jour des ploxions sur le chemin iPhone : ⚙ › Ploxions (automatique par défaut, la fréquence), « vérifier » (le HTTP
// natif, sans cache, ?maj=), le bilan ; l'automatique part tout seul après le lancement
export default async function ({ page, ecrire, appels }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.ploxi0nRouteur.ouvrir('reglages-app')); await page.waitForTimeout(1200);
  await page.evaluate(() => document.querySelector('[data-accueil] [data-rg-aller="ploxions"]').click()); await page.waitForTimeout(400);
  const ligne = await page.evaluate(() => { const l = document.querySelector('[data-rg-aller="ploxions"] small'); return l ? l.textContent : null; });
  await ecrire('01-ploxions');
  const auto = await page.evaluate(() => (document.querySelector('[data-maj-auto]') || {}).checked);
  await page.evaluate(() => document.querySelector('[data-maj-maintenant]').click()); await page.waitForTimeout(3000);
  await ecrire('02-verifie');
  const bilan = await page.evaluate(() => (document.querySelector('[data-maj-etat]') || {}).textContent);
  const http = appels.filter(a => a.p === 'CapacitorHttp' && /\/app\.js/.test(a.o.url || '')).map(a => a.o.url.replace(/maj=[a-z0-9]+/, 'maj=…') + (a.o.headers && a.o.headers['Cache-Control'] ? ' [no-cache]' : '')).slice(0, 4);
  return { auto, ligne, bilan, http };
}
