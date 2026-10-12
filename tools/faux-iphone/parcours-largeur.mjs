export default async function ({ page }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  const mesurer = () => page.evaluate(() => {
    const W = innerWidth, trop = [];
    for (const el of document.querySelectorAll('body *')) { const r = el.getBoundingClientRect(); if (r.width && r.right > W + 1 && getComputedStyle(el).position !== 'fixed') trop.push((el.className || el.tagName).toString().slice(0, 40) + ' → ' + Math.round(r.right)); }
    return { W, scroll: document.documentElement.scrollWidth, trop: [...new Set(trop)].slice(0, 8) };
  });
  const out = { accueil: await mesurer() };
  for (const id of ['sante', 'reglages-app', 'banc', 'marketplace', 'journal-tsoins', 'gestion']) { await page.evaluate((i) => window.ploxi0n.routeur.ouvrir(i), id); await page.waitForTimeout(900); out[id] = await mesurer(); await page.evaluate(() => window.ploxi0n.routeur.accueil()); }
  return out;
}
