// 🤖 (0.75) XERB0T · le contrôleur sur le chemin iPhone : Bonjour (PloxiApple.reseauChercher / reseauResoudre), le HTTP natif (CapacitorHttp,
// jamais le jeton du labo), un WLED trouvé sur le réseau puis piloté, Home Assistant avec un jeton
export default async function ({ page, ecrire, appels }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.ploxi0nRouteur.ouvrir('controleur')); await page.waitForTimeout(1500);
  await ecrire('01-vide');
  await page.evaluate(() => document.querySelector('[data-page-cube="ajouter"]').click()); await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('[data-xb-chercher]').click()); await page.waitForTimeout(1500);
  await ecrire('02-trouves');
  await page.evaluate(() => document.querySelector('[data-xb-trouve="0"]').click()); await page.waitForTimeout(1500);
  await ecrire('03-wled');
  await page.evaluate(() => document.querySelector('[data-xb-act="basculer"]').click()); await page.waitForTimeout(800);
  const apresBascule = await page.evaluate(() => (document.querySelector('[data-xb-act="basculer"]') || {}).textContent);
  // Home Assistant à la main, avec son jeton (hors trousseau dans le faux iPhone : Face ID simulé absent → la séance)
  await page.evaluate(() => { document.querySelector('[data-xb-fermer]').click(); document.querySelector('[data-page-cube="ajouter"]').click(); });
  await page.waitForTimeout(300);
  await page.evaluate(() => { document.querySelector('[data-xb-adresse]').value = '10.0.0.9:8123'; document.querySelector('[data-xb-type]').value = 'ha'; document.querySelector('[data-xb-jeton]').value = 'bon'; document.querySelector('[data-xb-ajouter]').click(); });
  await page.waitForTimeout(1800);
  await ecrire('04-home-assistant');
  const http = appels.filter(a => a.p === 'CapacitorHttp').map(a => (a.o.method || 'GET') + ' ' + a.o.url + (a.o.headers && a.o.headers.Authorization ? ' [' + a.o.headers.Authorization.slice(0, 6) + '…]' : '') + (a.o.headers && a.o.headers['X-Ploxi0n'] ? ' [X-Ploxi0n !]' : ''));
  const bonjour = appels.filter(a => a.p === 'PloxiApple' && /^reseau/.test(a.m)).map(a => a.m);
  const entites = await page.evaluate(() => [...document.querySelectorAll('.xb-e b')].map(b => b.textContent));
  return { bonjour, http: http.slice(0, 20), apresBascule, entites };
}
