// ✥ (0.54) le glisser-déposer de l'accueil : appui long sur une tuile, glissée après une autre, lâchée ; sur un dossier.
export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  const ordre = () => page.evaluate(() => [...document.querySelectorAll('.px-pages > .px-page:first-child .px-tuile[data-id]')].map(b => b.getAttribute('data-id')));
  const r = { avant: await ordre() };
  const centre = (id) => page.evaluate((i) => { const b = document.querySelector('.px-tuile[data-id="' + i + '"]').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 3 }; }, id);
  const [a, , , d] = r.avant; const pa = await centre(a), pd = await centre(d);
  await page.mouse.move(pa.x, pa.y); await page.mouse.down(); await page.waitForTimeout(600);
  r.souleve = await page.evaluate(() => document.querySelector('#ploxi0n').classList.contains('px-tri'));
  await page.mouse.move(pa.x + 20, pa.y + 10, { steps: 3 }); await page.mouse.move(pd.x + 30, pd.y, { steps: 8 });
  await ecrire('tri-en-cours');
  await page.mouse.up(); await page.waitForTimeout(500);
  r.apres = await ordre();
  return r;
}
