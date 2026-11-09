// ⟷ (0.99.13) l'iPhone couché sur tous les écrans de l'app : rien ne déborde en largeur, le contenu tient la hauteur ou défile ;
// une capture par écran (build/fi/…)
export default async function ({ page, ecrire }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.setViewportSize({ width: 852, height: 393 }); await page.waitForTimeout(1200);
  const ids = await page.evaluate(() => window.ploxi0n.routeur.catalogue().filter(p => p.interne).map(p => p.id));
  const r = { ids, ecrans: {} };
  for (const id of ids) {
    await page.evaluate((i) => window.ploxi0n.routeur.ouvrir(i), id); await page.waitForTimeout(900);
    r.ecrans[id] = await page.evaluate(() => {
      const vis = [...document.querySelectorAll('.px-page, .px-accueil, [data-page]')].filter(e => e.offsetParent !== null);
      const p = vis[vis.length - 1]; if (!p) return null; const b = p.getBoundingClientRect();
      const larges = [...p.querySelectorAll('*')].filter(e => { const x = e.getBoundingClientRect(); return x.width > 0 && x.right > innerWidth + 2; }).slice(0, 3).map(e => e.className.toString().slice(0, 40) || e.tagName);
      return { sw: document.documentElement.scrollWidth, w: innerWidth, l: Math.round(b.left), larg: Math.round(b.width), haut: p.scrollHeight, larges };
    });
    await ecrire('p-' + id);
  }
  return r;
}
