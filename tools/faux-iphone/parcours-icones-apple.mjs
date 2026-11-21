// ▢ (0.99.67, RS-7 coord #2227-2229) les icônes à l'Apple sur le chemin iPhone : l'accueil (grille, compacte, liste), la bande des koins, le
// marketplace, les réglages (les installés, le style des icônes) ; un réglage d'avant (xerboxion) passe une fois à l'Apple.
export default async function ({ page, ecrire }) {
  const passer = () => page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await passer(); await page.waitForTimeout(500);
  // des réglages d'avant : le xerboxion d'alors, sans la marque
  await page.evaluate(async () => { const a = (await window.ploxi0n.boxion.get('reglages', 'app')) || {}; delete a.iconesAppleVu; await window.ploxi0n.boxion.put('reglages', 'app', { ...a, styleIcones: 'xerboxion', koins: true }); });
  await page.reload(); await page.waitForTimeout(3000); await passer(); await page.waitForTimeout(600);
  const r = {};
  r.style = await page.evaluate(() => ({ pref: window.ploxi0n.prefs.lire().styleIcones, html: document.documentElement.classList.contains('px-icones-apple') }));
  r.tuiles = await page.evaluate(() => [...document.querySelectorAll('.px-tuile[data-id]')].slice(0, 8).map(b => { const s = b.querySelector('svg.xki'), ic = b.querySelector('.px-ic').getBoundingClientRect(), n = b.querySelector('span:last-child');
    return { id: b.getAttribute('data-id'), style: s && s.getAttribute('data-style'), ic: Math.round(ic.width) + 'x' + Math.round(ic.height), police: getComputedStyle(n).fontFamily.split(',')[0], lignes: Math.round(n.getBoundingClientRect().height / parseFloat(getComputedStyle(n).lineHeight || 15)) }; }));
  r.colonnes = await page.evaluate(() => getComputedStyle(document.querySelector('.px-grille')).gridTemplateColumns.split(' ').length);
  await ecrire('01-accueil-grille');
  await page.evaluate(() => { const b = document.querySelector('[data-vue-accueil="compacte"]'); if (b) b.click(); }); await page.waitForTimeout(500); await ecrire('02-accueil-compacte');
  await page.evaluate(() => { const b = document.querySelector('[data-vue-accueil="liste"]'); if (b) b.click(); }); await page.waitForTimeout(500); await ecrire('03-accueil-liste');
  await page.evaluate(() => { const b = document.querySelector('[data-vue-accueil="grille"]'); if (b) b.click(); }); await page.waitForTimeout(300);
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('marketplace')); await page.waitForTimeout(1800);
  r.marketplace = await page.evaluate(() => [...document.querySelectorAll('.mk-tuile svg.xki')].slice(0, 6).map(s => s.getAttribute('data-style')));
  await ecrire('04-marketplace');
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('reglages-app')); await page.waitForTimeout(1000);
  await page.evaluate(() => { const b = document.querySelector('[data-rg-aller="ploxions"]'); if (b) b.click(); }); await page.waitForTimeout(900);
  r.reglages = await page.evaluate(() => [...document.querySelectorAll('.rg .ic-x svg.xki')].slice(0, 6).map(s => s.getAttribute('data-style')));
  await ecrire('05-reglages-ploxions');
  return r;
}
