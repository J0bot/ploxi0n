// ◺◿ (0.99.7, RS-7 : « les koins bien collés aux coins de l'écran, ça gobe les coins ») : les koins touchent les deux coins du bas ; l'écran
// de l'iPhone est simulé arrondi (55 px) pour voir le koin découpé par l'arrondi ; leurs triangles intérieurs restent dans l'arrondi
export default async function ({ page, ecrire }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.waitForTimeout(600);
  await page.addStyleTag({ content: 'html{clip-path:inset(0 round 55px)}' });
  const r = await page.evaluate(() => [...document.querySelectorAll('.px-koin')].map(k => { const b = k.getBoundingClientRect(); return { cote: k.dataset.koin, gauche: Math.round(b.left), droite: Math.round(innerWidth - b.right), bas: Math.round(innerHeight - b.bottom), taille: Math.round(b.width) }; }));
  await ecrire('01-coins');
  return r;
}
