// ◈ (0.50) les modes : chill-tekk → xerbot (la maison, la lampe, le bus xerbot.cmd) → xerboxion (l'UI du labo) → chill-tekk.
export default async function ({ page, ecrire, appels }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  const clic = (sel) => page.evaluate((s) => { const b = document.querySelector(s); if (b) b.click(); return !!b; }, sel);
  const r = {};
  r.puces = await page.evaluate(() => [...document.querySelectorAll('.px-modes button')].map(b => b.textContent + (b.classList.contains('on') ? ' ●' : '')));
  await clic('[data-mode="xerbot"]'); await page.waitForTimeout(500);
  await clic('[data-xb="maison"]'); await page.waitForTimeout(500);
  await clic('[data-xb-acc="a1"]'); await page.waitForTimeout(400);
  await clic('[data-xb="lampe"]'); await page.waitForTimeout(400);
  await page.fill('[data-xb-cmd]', 'avance 1m'); await clic('[data-xb="envoyer"]'); await page.waitForTimeout(400);
  await ecrire('mode-xerbot');
  r.xerbot = await page.evaluate(() => ({ html: document.documentElement.className.includes('px-m-xerbot'), grilleCachee: getComputedStyle(document.querySelector('.px-accueil > .px-pages') || document.body).display === 'none',
    maison: [...document.querySelectorAll('.px-xb-maison button')].map(b => b.textContent + (b.classList.contains('on') ? ' ✓' : '')), bus: document.querySelector('.px-xerbot .px-cape-log').textContent.slice(0, 120),
    lampe: [...document.querySelectorAll('.px-xb-c')].find(c => c.textContent.includes('La lampe')).innerText.replace(/\s+/g, ' ') }));
  await clic('[data-mode="xerboxion"]'); await page.waitForTimeout(500);
  await ecrire('mode-xerboxion');
  r.xerboxion = await page.evaluate(() => { const f = document.querySelector('.px-labo iframe'); return f ? f.getAttribute('src') : null; });
  await clic('[data-mode="chill-tekk"]'); await page.waitForTimeout(500);
  r.retour = await page.evaluate(() => getComputedStyle(document.querySelector('.px-accueil > .px-pages')).display !== 'none');
  r.natif = [...new Set(appels.filter(a => a.p === 'PloxiApple' && /maison|lampe/.test(a.m)).map(a => a.m))];
  return r;
}
