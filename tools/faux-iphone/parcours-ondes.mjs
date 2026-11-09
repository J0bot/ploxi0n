// ᛒ (0.99.30, la branche xerbot-ledfx fusionnée) Autour › les ondes : le scan Bluetooth bas niveau (PloxiOndes, simulé : Tom qui s'annonce
// comme ploxi, une montre Apple, un ESP32), du plus proche au plus loin, avec le fabricant ; et window.jOSVeille (la veille) répond
export default async function ({ page, appels }) {
  for (let i = 0; i < 3; i++) { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^(ok|plus tard|passer)$/i.test(x.textContent.trim())); if (b) b.click(); }); await page.waitForTimeout(250); }
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('autour')); await page.waitForTimeout(1200);
  await page.evaluate(() => { const b = document.querySelector('[data-au="ondes"]'); if (b) b.click(); }); await page.waitForTimeout(1000);
  const ondes = await page.evaluate(() => { const z = document.querySelector('[data-au-ondes]'); return { bouton: (document.querySelector('[data-au="ondes"]') || {}).textContent, lignes: z ? [...z.querySelectorAll('.px-au-l')].map(x => x.textContent.replace(/\s+/g, ' ').trim()) : null }; });
  const veille = await page.evaluate(async () => { const V = window.jOSVeille; if (!V) return null; const d = await V.demarrer({ fine: true }); const l = await V.lire(0); const e = await V.etat(); return { demarre: d, points: l.points.length, visites: l.visites.length, etat: e.etat }; });
  return { ondes, veille, scan: appels.filter(a => a.p === 'PloxiOndes').map(a => a.m) };
}
