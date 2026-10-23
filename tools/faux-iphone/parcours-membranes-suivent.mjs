// 〰 (0.99.19, RS-7 « What ? » : en peau pleine, les membranes des modes et des koins restées à une ancienne place) : la mise en page bouge
// SANS que le DOM change (une feuille de style, une animation qui finit, la taille de tout) ; les membranes doivent suivre leurs cellules.
// L'écart = la distance entre le corps dessiné (la boîte du calque) et la boîte des cellules, en px ; ~0 attendu.
export default async function ({ page, ecrire }) {
  await page.evaluate(async () => { const b = window.ploxi0n.boxion, a = (await b.get('reglages', 'app')) || {}; await b.put('reglages', 'app', { ...a, mode: 'organique', peau: 'pleine' }); });
  await page.reload(); await page.waitForTimeout(3500);
  const ecart = () => page.evaluate(() => { const c = document.querySelector('.px-accueil .px-modes'), svg = c && c.querySelector(':scope>.px-neurones'), g = svg && svg.querySelector('g'); if (!g) return null;
    const cells = [...c.querySelectorAll('.px-neurone,[data-neurone]')].map(e => e.getBoundingClientRect()).filter(r => r.width);
    const L = Math.min(...cells.map(r => r.left)), T = Math.min(...cells.map(r => r.top)), R = Math.max(...cells.map(r => r.right)), B = Math.max(...cells.map(r => r.bottom));
    const sr = svg.getBoundingClientRect(), bb = g.getBBox(); const x = sr.left + bb.x, y = sr.top + bb.y;
    return Math.round(Math.max(Math.abs(x - L), Math.abs(y - T), Math.abs(x + bb.width - R), Math.abs(y + bb.height - B))); });
  const r = { depart: await ecart() };
  // une feuille de style (dans <head> : le DOM de la page ne bouge pas) qui fait glisser les modes (une transition : aucune taille ne change)
  await page.evaluate(() => { const s = document.createElement('style'); s.id = 'px-essai'; s.textContent = '.px-accueil .px-modes .px-neurone{transition:transform .15s}'; document.head.appendChild(s); });
  await page.waitForTimeout(100);
  await page.evaluate(() => { document.getElementById('px-essai').textContent += '.px-accueil .px-modes .px-neurone{transform:translateY(24px)}'; });
  await page.waitForTimeout(800); r.apresTransition = await ecart(); await ecrire('membranes-apres-transition');
  // l'écran change (la taille de tout, couché) : remesuré aussi
  await page.setViewportSize({ width: 342, height: 741 }); await page.waitForTimeout(800); r.apresTaille = await ecart();
  return r;
}
