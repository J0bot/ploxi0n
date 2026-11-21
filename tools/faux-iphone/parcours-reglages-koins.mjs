// ⊞ (0.99.67, RS-7 coord #2203) les réglages en koins sur le chemin iPhone : le koin gauche ouvert (la case ⊞ sous le trion et le wormion), la
// grille des koins de réglages, un toucher qui bascule, ⊞ tous les réglages qui ouvre la page.
export default async function ({ page, ecrire }) {
  const passer = () => page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await passer(); await page.waitForTimeout(500);
  await page.evaluate(async () => { const a = (await window.ploxi0n.boxion.get('reglages', 'app')) || {}; await window.ploxi0n.boxion.put('reglages', 'app', { ...a, koins: true }); });
  await page.reload(); await page.waitForTimeout(3000); await passer(); await page.waitForTimeout(600);
  const r = {};
  await page.click('[data-koin="gauche"]'); await page.waitForTimeout(700);
  r.cases = await page.evaluate(() => [...document.querySelectorAll('[data-cases="gauche"] > *')].map(b => b.getAttribute('data-koin-a') || b.getAttribute('data-pad')));
  await ecrire('01-koin-ouvert');
  await page.click('[data-cases="gauche"] [data-koin-a="reglages"]'); await page.waitForTimeout(500);
  r.koins = await page.evaluate(() => [...document.querySelectorAll('.px-koin-reglages [data-koin-reg]')].map(b => b.getAttribute('data-koin-reg') + (b.classList.contains('on') ? '*' : '')));
  r.grille = await page.evaluate(() => { const z = document.querySelector('.px-koin-reglages').getBoundingClientRect(), b = document.querySelector('.px-koin-barre').getBoundingClientRect(); return { haut: Math.round(z.top), bas: Math.round(z.bottom), bande: Math.round(b.top) }; });
  await ecrire('02-reglages-en-koins');
  await page.click('.px-koin-reglages [data-koin-reg="haptique"]'); await page.waitForTimeout(400);
  r.haptique = await page.evaluate(() => ({ pref: window.ploxi0n.prefs.lire().haptique, koin: document.querySelector('.px-koin-reglages [data-koin-reg="haptique"] em').textContent }));
  await ecrire('03-haptique-coupee');
  await page.click('.px-koin-reglages [data-koin-reg="tout"]'); await page.waitForTimeout(1000);
  r.ouvert = await page.evaluate(() => window.ploxi0n.routeur.courant());
  await ecrire('04-tous-les-reglages');
  return r;
}
