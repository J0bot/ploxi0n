// 🧪 (0.99.24, RS-7 : « utilise le banc de test natif pour me faire tout tester les nouveaux bions ») : le banc s'ouvre, ses sondes auto
// tournent, puis « ▶ les nouveaux bions, tout » (la radio, le GPS, la boussole, le réseau compris) ; rend chaque ligne comme le log du banc.
export default async function ({ page }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.waitForTimeout(600);
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('banc'));
  await page.waitForSelector('[data-nouveaux]', { timeout: 8000 });
  await page.waitForTimeout(4000);   // les sondes auto
  await page.evaluate(() => document.querySelector('[data-nouveaux]').click());
  await page.waitForTimeout(500);
  await page.waitForFunction(() => { const b = document.querySelector('[data-nouveaux]'); return b && !b.disabled; }, null, { timeout: 90000 });
  return page.evaluate(() => ({
    resume: (document.querySelector('[data-resume]') || {}).textContent,
    nouveaux: [...document.querySelectorAll('[data-s^="nb-"]')].map(e => e.querySelector('b').textContent + ' ' + e.querySelector('div').firstChild.textContent + ' — ' + e.querySelector('small').textContent),
  }));
}
