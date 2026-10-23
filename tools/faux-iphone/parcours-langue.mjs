// ⟡ (0.99.14) toutes les langues : ⚙ › Apparence › Langue › Deutsch ; les réglages, l'accueil, Autour, Proche passent en allemand à chaud,
// les néologismes restent (ploxion, koin…), les noms des lieux aussi ; retour au français : tout revient
export default async function ({ page, ecrire }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.waitForTimeout(1000);
  const textes = () => page.evaluate(() => { const s = [], w = document.createTreeWalker(document.body, 4); let t; while ((t = w.nextNode())) { const e = t.parentElement; if (e && !e.closest('svg,style,script') && e.getClientRects().length && /\p{L}{2}/u.test(t.data)) s.push(t.data.trim()); } return s; });
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('reglages-app')); await page.waitForTimeout(1200);
  await page.evaluate(() => document.querySelector('[data-rg-aller="apparence"]').click()); await page.waitForTimeout(600);
  await page.evaluate(() => document.querySelector('[data-pv="langue"][data-v="de"]').click()); await page.waitForTimeout(800);
  const r = { lang: await page.evaluate(() => document.documentElement.lang), apparence: (await textes()).slice(0, 14) };
  await ecrire('01-apparence-de');
  await page.evaluate(() => document.querySelector('[data-rg-retour]').click()); await page.waitForTimeout(600);
  r.reglages = (await textes()).slice(0, 24); r.recherche = await page.evaluate(() => document.querySelector('[data-q]').placeholder);
  await ecrire('02-reglages-de');
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('autour')); await page.waitForTimeout(1500);
  r.autour = (await textes()).slice(0, 16); await ecrire('03-autour-de');
  await page.evaluate(() => window.ploxi0n.routeur.faire('accueil')); await page.waitForTimeout(1000);
  r.accueil = (await textes()).filter(t => /koins|Portale|ploxions/.test(t)).slice(0, 6); await ecrire('04-accueil-de');
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('reglages-app')); await page.waitForTimeout(800);
  await page.evaluate(() => document.querySelector('[data-rg-aller="apparence"]').click()); await page.waitForTimeout(600);
  await page.evaluate(() => document.querySelector('[data-pv="langue"][data-v="fr"]').click()); await page.waitForTimeout(800);
  await page.evaluate(() => document.querySelector('[data-rg-retour]').click()); await page.waitForTimeout(600);
  r.retour = { lang: await page.evaluate(() => document.documentElement.lang), reglages: (await textes()).slice(0, 8) };
  return r;
}
