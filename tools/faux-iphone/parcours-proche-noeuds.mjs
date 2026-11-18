// 🗺 (0.99.53) les nœuds sur la carte : Proche allumé, « garder où j'entends les nœuds » → une rencontre avec RS-3 (voisin direct) → sa zone sur
// les tuiles, la liste dessous ; window.jOSMaille la rend (pour mappion)
export default async function ({ page, ecrire }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('proche')); await page.waitForTimeout(1200);
  await page.evaluate(() => { const h = document.querySelector('.px-proche'); h.querySelector('[data-pr-nom]').value = 'RS-7'; h.querySelector('[data-pr="allumer"]').click(); });
  await page.waitForTimeout(1800);
  await page.evaluate(() => document.querySelector('[data-pr-page="autour"]').click()); await page.waitForTimeout(400);
  const r = {};
  r.avant = await page.evaluate(() => (document.querySelector('[data-pr-noeuds]') || {}).innerText || null);
  await page.evaluate(() => document.querySelector('[data-pr-noeuds-garder]').click()); await page.waitForTimeout(1500);
  r.apres = await page.evaluate(() => ({ carte: !!document.querySelector('.px-pr-noeuds-carte svg'), zones: document.querySelectorAll('.px-pr-noeuds-svg circle').length, tuiles: document.querySelectorAll('[data-pr-noeuds-tu] img').length, liste: [...document.querySelectorAll('.px-pr-noeuds-l li')].map(x => x.innerText.replace(/\s+/g, ' ')) }));
  r.jOSMaille = await page.evaluate(() => window.jOSMaille ? window.jOSMaille.noeuds().noeuds.map(n => ({ nom: n.nom, zone: !!n.zone, q: n.q != null ? Math.round(n.q * 100) / 100 : null })) : null);
  await page.evaluate(() => document.querySelector('.px-pr-noeuds-carte') && document.querySelector('.px-pr-noeuds-carte').scrollIntoView()); await page.waitForTimeout(300);
  await ecrire('noeuds-01-carte');
  return r;
}
