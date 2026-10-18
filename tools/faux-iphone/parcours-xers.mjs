// § (0.77) mes xers sur le chemin iPhone : le premier xer, un nouveau (le modèle XERB0T), revenir, partager (le lien + le QR de CoreImage),
// recevoir un xer par son lien (l'aperçu, l'ajouter et y aller)
export default async function ({ page, ecrire, appels }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.ploxi0nRouteur.ouvrir('mes-xers')); await page.waitForTimeout(1200);
  await ecrire('01-mes-xers');
  await page.evaluate(() => document.querySelector('[data-xr-modele="xerbot"]').click()); await page.waitForTimeout(1500);
  const modeBot = await page.evaluate(() => [...document.documentElement.classList].filter(c => /^px-m-/.test(c)).join(' '));
  await ecrire('02-accueil-xerbot');
  await page.evaluate(() => window.ploxi0nRouteur.ouvrir('mes-xers')); await page.waitForTimeout(2000);
  await ecrire('03-deux-xers');
  await page.evaluate(() => document.querySelector('[data-xr-aller="x1"]').click()); await page.waitForTimeout(1200);
  const modeRetour = await page.evaluate(() => [...document.documentElement.classList].filter(c => /^px-m-/.test(c)).join(' '));
  await page.evaluate(() => window.ploxi0nRouteur.ouvrir('mes-xers')); await page.waitForTimeout(800);
  await page.evaluate(() => document.querySelector('[data-xr-partager="x1"]').click()); await page.waitForTimeout(1000);
  await ecrire('04-partager');
  const lien = await page.evaluate(() => (document.querySelector('.px-partage .px-pt-lien') || {}).value);
  const qrImg = await page.evaluate(() => !!document.querySelector('.px-partage [data-pt-qr] img'));
  await page.evaluate(() => document.querySelector('.px-partage [data-pt="fermer"]').click());
  // le recevoir : comme un lien universel ouvert (le routeur reçoit params.lien)
  await page.evaluate((l) => window.ploxi0nRouteur.ouvrir('mes-xers', { lien: '?x=' + new URL(l).searchParams.get('x') }), lien); await page.waitForTimeout(1200);
  await ecrire('05-recu');
  const recu = await page.evaluate(() => (document.querySelector('.px-xr-recu .px-ft') || {}).textContent);
  await page.evaluate(() => document.querySelector('[data-xr="recu-garder"]').click()); await page.waitForTimeout(800);
  const liste = await page.evaluate(async () => (await window.ploxi0nXers.liste()).map(x => x.nom + (x.actif ? ' *' : '')));
  const qr = appels.filter(a => a.p === 'PloxiApple' && a.m === 'qr').length;
  return { modeBot, modeRetour, lien: lien && lien.slice(0, 90) + '… (' + lien.length + ')', qrImg, qr, recu, liste };
}
