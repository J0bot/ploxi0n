// ⬡ (0.99.3) « le chemin » ouvre ses étapes par jOS.openPloxion('jOSChemin') : un BION. Avant : une installation ratée (« le serveur refuse
// jOSChemin (HTTP 404) »). Maintenant : le neurone du bion (le palier « bion » de la map), sans installation
export default async function ({ page, ecrire, appels }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.waitForTimeout(500);
  const avant = appels.length;
  await page.evaluate(() => window.jOS.openPloxion('jOSChemin')); await page.waitForTimeout(2000);
  const r = await page.evaluate(() => {
    const cartes = [...document.querySelectorAll('.px-installation')].map(x => x.innerText);
    const m = [...document.querySelectorAll('.px-map')].find(x => x.offsetParent !== null);
    return { installation: cartes, palier: m && m.getAttribute('data-palier'), ou: m && (m.querySelector('[data-map-ou]') || {}).textContent, neurone: !!(m && m.querySelector('.px-nv')) };
  });
  r.toutes = await page.evaluate(() => [...document.querySelectorAll('.px-map')].map(m => ({ palier: m.getAttribute('data-palier'), visible: m.offsetParent !== null, hote: (m.closest('[data-ploxion]') || {}).dataset ? m.closest('[data-ploxion]').dataset.ploxion : null, ou: (m.querySelector('[data-map-ou]') || {}).textContent })));
  r.courant = await page.evaluate(() => window.ploxi0n.routeur.courant && window.ploxi0n.routeur.courant());
  r.requetesChemin = appels.slice(avant).filter(a => JSON.stringify(a.o || {}).includes('jOSChemin/app.js')).length;
  await ecrire('01-le-neurone-de-jOSChemin');
  return r;
}
