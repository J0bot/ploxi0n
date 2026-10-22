// ◺◿ (0.89) les koins du carnet de RS-7 sur le chemin iPhone : l'accueil sans dock, les deux koins ; ils grandissent ; les cases et la barre
// des glyphes ; dans un ploxion (sans la barre du bas) ; une case agit
export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(async () => { const a = (await window.ploxi0n.boxion.get('reglages', 'app')) || {}; await window.ploxi0n.boxion.put('reglages', 'app', { ...a, koins: true }); });
  await page.reload(); await page.waitForTimeout(3000);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  const dock = await page.evaluate(() => { const d = document.querySelector('.px-dock'); return d ? getComputedStyle(d).display : 'absent'; });
  await ecrire('01-accueil-koins');
  await page.click('[data-koin="gauche"]'); await page.waitForTimeout(350); await ecrire('02-moyen');
  await page.click('[data-koin="gauche"]'); await page.waitForTimeout(350); await ecrire('03-grand');
  await page.click('[data-koin="gauche"]'); await page.waitForTimeout(350); await ecrire('04-cases');
  const cases = await page.evaluate(() => [...document.querySelectorAll('[data-cases]:not([hidden]) [data-koin-a]')].map(b => b.getAttribute('data-koin-a')));
  await page.click('[data-koin-a="toi"]'); await page.waitForTimeout(900);
  const ouvert = await page.evaluate(() => window.ploxi0n.routeur.courant());
  const barre = await page.evaluate(() => { const b = document.querySelector('.px-ecran>.px-barre'); return b ? getComputedStyle(b).display : 'absente'; });
  await ecrire('05-dans-un-ploxion');
  return { dock, cases, ouvert, barre };
}
