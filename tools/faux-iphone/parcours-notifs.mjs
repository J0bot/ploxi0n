// 🔔 (0.99.64, RS-7 : « un ploxion notifs pour voir toutes les notifs, les nouveaux builds, choisir les mots ») : le ploxion Notifs sur le
// chemin iPhone ; un nouveau build (une version jamais vue) ; un mot caché
export default async function ({ page, ecrire }) {
  const passer = () => page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); const n = document.querySelector('[data-nv]'); if (n) n.click(); });
  await passer();
  await page.evaluate(() => window.ploxi0n.boxion.put('reglages', 'notifs-version', '0.0.1'));   // une version d'avant : la prochaine ouverture est un nouveau build
  await page.reload(); await page.waitForTimeout(3500); await passer();
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('notifs')); await page.waitForTimeout(1200);
  const r = {};
  r.page = await page.evaluate(() => { const h = document.querySelector('.px-hote:not([hidden])'); return { ouvert: window.ploxi0n.routeur.courant(), notifs: [...h.querySelectorAll('.px-nt-n')].map(n => n.textContent.replace(/\s+/g, ' ').trim()) }; });
  await ecrire('notifs-01');
  await page.evaluate(() => { const i = document.querySelector('[data-nt-in="cacher"]'); i.value = 'installé'; i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); });
  await page.waitForTimeout(400);
  r.cache = await page.evaluate(() => ({ mots: [...document.querySelectorAll('[data-nt-ote]')].map(b => b.textContent), notifs: document.querySelectorAll('.px-nt-n').length }));
  return r;
}
