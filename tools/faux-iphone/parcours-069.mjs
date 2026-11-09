// (0.69) la page ne défile plus de côté (la barre ne dépasse plus) ; 🔍 chercher chez soi
export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  for (const id of ['bother', 'horloge', 'piano', 'marketplace']) { await page.evaluate((x) => window.ploxi0nRouteur.ouvrir(x), id); await page.waitForTimeout(500); }
  await ecrire('01-barre');
  const deborde = await page.evaluate(() => { const se = document.scrollingElement; se.scrollLeft = 400; window.scrollTo(400, 0); return { largeur: se.scrollWidth, ecran: innerWidth, decale: se.scrollLeft || window.scrollX, barre: (() => { const b = document.querySelector('.px-barre'); return b ? Math.round(b.getBoundingClientRect().right) : null; })() }; });
  await page.evaluate(() => document.querySelector('[data-chercher]') ? document.querySelector('[data-chercher]').click() : window.ploxi0nRouteur.faire('chercher'));
  await page.waitForTimeout(300);
  await page.keyboard.type('pia'); await page.waitForTimeout(200);
  await ecrire('02-chercher');
  const trouves = await page.evaluate(() => [...document.querySelectorAll('[data-cl-id]')].map(b => b.getAttribute('data-cl-id')));
  return { deborde, trouves };
}
