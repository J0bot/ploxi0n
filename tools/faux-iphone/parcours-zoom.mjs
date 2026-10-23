// ❄ (0.99) le zoom libre ou par paliers figés : l'écriture suit l'échelle (le glyphe seul, les deux, le texte en ChillTekk) ; ❄ fige un palier ;
// libre ↔ paliers ; un palier figé y ramène (hote.__map, exposé pour les parcours)
export default async function ({ page, ecrire }) {
  await page.evaluate(async () => { const a = (await window.ploxi0n.boxion.get('reglages', 'app')) || {}; await window.ploxi0n.boxion.put('reglages', 'app', { ...a, mode: 'organique', variante: 'xeno' }); });
  await page.reload(); await page.waitForTimeout(3500);
  const r = {};
  const m = (f, ...a) => page.evaluate(([f, a]) => { const h = document.querySelector('.px-accueil .px-org-map-h'); return h && h.__map ? h.__map[f](...a) : null; }, [f, a]);
  const detail = () => page.evaluate(() => { const c = document.querySelector('.px-accueil .px-map'); const k = c && c.querySelector('.px-map-k small'); return { d: c && c.getAttribute('data-detail'), taille: k ? getComputedStyle(k).fontSize : null, police: k ? getComputedStyle(k).fontFamily : null }; });
  await m('echelle', 0.7); await page.waitForTimeout(500); r.loin = await detail(); await ecrire('01-loin-glyphes');
  await m('echelle', 1); await page.waitForTimeout(500); r.milieu = await detail(); await ecrire('02-milieu-les-deux');
  await m('echelle', 1.45); await page.waitForTimeout(500); r.pres = await detail(); await ecrire('03-pres-texte');
  r.niveau = await m('niveau');
  await page.evaluate(() => document.querySelector('.px-accueil [data-map-figer]').click()); await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('.px-accueil [data-map-mode]').click()); await page.waitForTimeout(300);
  r.reglage = await m('reglage'); r.figes = await page.evaluate(() => document.querySelectorAll('.px-accueil [data-map-fige]').length);
  await ecrire('04-fige-paliers');
  await m('zoomer', 'tout'); await page.waitForTimeout(1200); await m('echelle', 0.7); await page.waitForTimeout(500); r.toutLoin = await detail(); await ecrire('05-tes-ploxions-loin');
  await page.evaluate(() => document.querySelector('.px-accueil [data-map-fige]').click()); await page.waitForTimeout(1500);
  r.retour = { palier: await page.evaluate(() => document.querySelector('.px-accueil .px-map').getAttribute('data-palier')), niveau: await m('niveau') };
  await ecrire('06-retour-au-palier-fige');
  const stocke = await page.evaluate(() => window.ploxi0n.boxion.get('reglages', 'zoom')); r.stocke = stocke;
  return r;
}
