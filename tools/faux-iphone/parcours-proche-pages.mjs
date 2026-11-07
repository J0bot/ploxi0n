// ◉ (0.99.35, RS-7 : « encore ultra bloat : des sections distinctes, des pages différentes » ; « de meshlink, seulement le code QR ») :
// Proche démarre (Tom et Léa arrivent), puis chaque page à l'écran : messages, autour, potes, son, ▣ carte (mon QR). L'ajout d'une carte
// (scannée ou par un lien ploxi0n://pote…) : tests/proche-carte.test.mjs.
export default async function ({ page, ecrire }) {
  const r = {};
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {}); await page.waitForTimeout(400);
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('proche')); await page.waitForTimeout(900);
  await ecrire('01-proche-eteint');
  r.eteint = await page.evaluate(() => [...document.querySelectorAll('.px-proche [data-pr-section]')].filter(s => !s.hidden).map(s => s.getAttribute('data-pr-section')));
  await page.evaluate(() => { const h = document.querySelector('.px-proche'); h.querySelector('[data-pr-nom]').value = 'RS-7'; h.querySelector('[data-pr="allumer"]').click(); });
  await page.waitForTimeout(1800);
  await page.evaluate(() => { const i = document.querySelector('[data-pr-msg]'); i.value = 'on se retrouve au lac ?'; document.querySelector('[data-pr="envoyer"]').click(); });
  await page.waitForTimeout(900);
  r.pages = {};
  for (const k of ['messages', 'autour', 'potes', 'son', 'carte']) {
    await page.evaluate((x) => document.querySelector('.px-proche [data-pr-page="' + x + '"]').click(), k); await page.waitForTimeout(500);
    r.pages[k] = await page.evaluate(() => { const s = [...document.querySelectorAll('.px-proche [data-pr-section]')].filter(x => !x.hidden); const h = document.querySelector('.px-proche').scrollHeight; return { visibles: s.map(x => x.getAttribute('data-pr-section')), hauteur: h }; });
    await ecrire('02-page-' + k);
  }
  r.qr = await page.evaluate(() => !!document.querySelector('.px-pr-qr svg path'));
  r.onglets = await page.evaluate(() => { const n = document.querySelector('.px-pr-onglets').getBoundingClientRect(); return { haut: Math.round(n.top), largeur: Math.round(n.width) }; });
  await ecrire('03-carte');
  return r;
}
