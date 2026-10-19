// 🔑 (0.83) le labo connecté tout seul, sur le chemin iPhone : un compte dans l'app → le mode xerboxion demande un passe (POST /api/app/passe,
// le jeton en en-tête, CapacitorHttp) et son cadre ouvre /app/entrer?passe=…&vers=/home?app=ploxi0n ; le navigateur intégré aussi
export default async function ({ page, ecrire, appels }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.ploxi0n.boxion.put('compte', 'courant', { jeton: 'jeton-du-faux-iphone', compte: { nom: 'Josion' }, le: new Date().toISOString() }));
  await page.reload(); await page.waitForTimeout(3000);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.evaluate(() => { const b = document.querySelector('[data-mode="xerboxion"]'); if (b) b.click(); }); await page.waitForTimeout(1500);
  await ecrire('01-xerboxion');
  const cadre = await page.evaluate(() => { const f = document.querySelector('.px-labo iframe'); return f ? f.getAttribute('src') : null; });
  await page.evaluate(() => window.jOSNatif.navigateur('https://labo.j0bot.ch/ideas')); await page.waitForTimeout(500);
  const navigateur = appels.filter(a => a.p === 'Browser' && a.m === 'open').map(a => a.o.url).pop();
  const passe = appels.filter(a => a.p === 'CapacitorHttp' && /\/api\/app\/passe/.test(a.o.url || '')).map(a => a.o.method + ' ' + a.o.url.replace('https://labo.j0bot.ch', '') + ((a.o.headers || {}).Authorization ? ' [Bearer]' : ' [sans jeton !]') + (/jeton-du-faux/.test(a.o.url) ? ' [JETON DANS L\'ADRESSE !]' : ''));
  return { cadre, navigateur, passe };
}
