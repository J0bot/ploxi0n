// ⊕ (0.99.19, RS-7 : « l'entièreté du truc est trop petite ») la taille de tout ; (0.99.26) elle passe par la balise viewport (mise en page à
// 393 / z, agrandie ×z) et plus par le zoom natif de WebKit, qui posait le bord droit hors de l'écran. Le faux iPhone (Chromium mobile)
// applique la balise comme l'iPhone : à chaque taille, choisie dans ⚙ › Apparence, rien ne déborde, et tout ce qui est fixé reste à l'écran.
export default async function ({ page, ecrire, tailles }) {
  for (let i = 0; i < 3; i++) { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^(ok|plus tard|passer)$/i.test(x.textContent.trim())); if (b) b.click(); }); await page.waitForTimeout(300); }
  await page.waitForTimeout(800);
  const r = { zoomNatif: tailles.slice() };
  const choisir = async (z) => {
    await page.evaluate(() => window.ploxi0n.routeur.ouvrir('reglages-app')); await page.waitForTimeout(700);
    await page.evaluate(() => { const b = document.querySelector('[data-rg-aller="apparence"]'); if (b) b.click(); }); await page.waitForTimeout(400);
    await page.evaluate((z) => { const b = document.querySelector('[data-pv="taille"][data-v="' + z + '"]'); if (b) b.click(); }, String(z)); await page.waitForTimeout(700);
  };
  for (const z of [1, 1.15, 1.3, 1.45]) {
    await choisir(z);
    const res = { viewport: await page.evaluate(() => (document.querySelector('meta[name=viewport]') || {}).content) };
    for (const id of [null, 'reglages-app', 'marketplace', 'synthe', 'autour', 'atelier-peaux']) {
      if (id) { await page.evaluate((i) => window.ploxi0n.routeur.ouvrir(i), id); await page.waitForTimeout(700); } else { await page.evaluate(() => window.ploxi0n.routeur.faire('accueil')); await page.waitForTimeout(700); }
      res[id || 'accueil'] = await page.evaluate(() => {
        const dehors = [...document.querySelectorAll('body *')].filter(e => { const cs = getComputedStyle(e); if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && (b.right > innerWidth + 2 || b.left < -2); }).map(e => String(e.className).split(' ')[0]);
        const bd = document.querySelector('.px-bord-d'), b = bd && bd.getBoundingClientRect();
        return { largeur: innerWidth, deborde: document.documentElement.scrollWidth - innerWidth, bordDroit: b ? Math.round(b.right) === innerWidth : null, fixesDehors: dehors.slice(0, 4) };
      });
      if (z === 1.3 && (id === null || id === 'synthe')) await ecrire('taille-' + z + '-' + (id || 'accueil'));
    }
    r['×' + z] = res;
  }
  return r;
}
