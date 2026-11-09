// ▥ (0.87) la bande façon niri sur le chemin iPhone : ⚙ › Navigation › La bande ; trois ploxions ouverts l'un depuis l'autre ; la suivante
// dépasse à droite ; la toucher l'amène devant ; la vue d'ensemble ; en paysage, deux colonnes
export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(async () => { const a = (await window.ploxi0n.boxion.get('reglages', 'app')) || {}; await window.ploxi0n.boxion.put('reglages', 'app', { ...a, bande: true }); });
  await page.reload(); await page.waitForTimeout(3000);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  const ids = await page.evaluate(() => window.ploxi0n.routeur.catalogue().map(p => p.id));
  const trois = ['journal-tsoins', 'reglages-app', 'gestion'].filter(id => ids.includes(id)).concat(ids.filter(i => !['journal-tsoins', 'reglages-app', 'gestion'].includes(i))).slice(0, 3);
  for (const id of trois) { await page.evaluate((i) => window.ploxi0n.routeur.ouvrir(i), id); await page.waitForTimeout(900); }
  await page.evaluate((i) => window.ploxi0n.routeur.aller(i), trois[0]); await page.waitForTimeout(800);
  const etat = () => page.evaluate(() => ({ courant: window.ploxi0n.routeur.courant(), colonnes: [...document.querySelectorAll('.px-scene>.px-hote')].map(h => ({ id: h.dataset.ploxion, cache: h.hidden, voisin: h.classList.contains('px-bande-voisin'), x: h.style.transform, l: h.style.width })), suite: (document.querySelector('.px-bande-suite') || {}).dataset }));
  const a = await etat(); await ecrire('01-bande');
  await page.evaluate(() => document.querySelector('.px-bande-suite').click()); await page.waitForTimeout(700);
  const b = await etat(); await ecrire('02-suivante-devant');
  await page.evaluate(() => window.ploxi0n.routeur.faire('bande')); await page.waitForTimeout(700);
  const vue = await page.evaluate(() => [...document.querySelectorAll('.px-bande-etiquette')].map(e => e.textContent));
  await ecrire('03-vue-ensemble');
  await page.evaluate(() => document.querySelector('.px-bande-etiquette').click()); await page.waitForTimeout(700);
  const c = await etat();
  await page.setViewportSize({ width: 852, height: 393 }); await page.waitForTimeout(800);
  const paysage = await etat(); await ecrire('04-paysage');
  return { trois, a, b, vue, c, paysage };
}
