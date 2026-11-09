// ⌖ (0.99.9) Autour : la position (simulée), la case chargée d'OpenStreetMap (simulé), les toilettes en un geste, les propositions, la liste ;
// la requête ne porte que le centre de la case ; « poser ici » ; « suivre »
export default async function ({ page, ecrire, appels }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('autour')); await page.waitForTimeout(2500);
  const r = await page.evaluate(() => ({ wc: (document.querySelector('.px-autour [data-au-wc]') || {}).textContent, prop: [...document.querySelectorAll('.px-autour .px-au-p b')].map(x => x.textContent),
    liste: document.querySelectorAll('.px-autour .px-au-l').length, etat: (document.querySelector('.px-autour [data-au-etat]') || {}).textContent }));
  r.requetes = appels.filter(a => a.p === 'CapacitorHttp' && /overpass/.test(JSON.stringify(a.o))).map(a => decodeURIComponent((a.o.url || '').split('data=')[1] || '').match(/around:\d+,[\d.]+,[\d.]+/)[0]);
  await ecrire('01-autour');
  await page.evaluate(() => document.querySelector('.px-autour [data-au-genre="toilettes"]').click()); await page.waitForTimeout(400);
  r.filtre = await page.evaluate(() => [...document.querySelectorAll('.px-autour .px-au-l .px-au-n')].map(x => x.textContent));
  await page.evaluate(() => document.querySelector('.px-autour [data-au="suivre"]').click()); await page.waitForTimeout(500);
  r.suivre = await page.evaluate(() => document.querySelector('.px-autour [data-au="suivre"]').textContent);
  await ecrire('02-les-toilettes-et-suivre');
  // (0.99.15) la trottinette la plus proche (sharedmobility.ch : la même case, son centre) ; la boussole : tourné vers l'est, la flèche du nord devient ←
  r.trottinette = await page.evaluate(() => (document.querySelector('.px-autour [data-au-tr]') || {}).textContent);
  r.requeteSm = appels.filter(a => a.p === 'CapacitorHttp' && /sharedmobility/.test(JSON.stringify(a.o))).map(a => (a.o.url || '').split('?')[1]).slice(0, 2);
  const avant = await page.evaluate(() => (document.querySelector('.px-autour [data-au-tr] [data-au-f]') || {}).textContent);
  await page.evaluate(() => { const e = new Event('deviceorientation'); e.webkitCompassHeading = 90; window.dispatchEvent(e); }); await page.waitForTimeout(400);
  r.boussole = { avant, apres: await page.evaluate(() => (document.querySelector('.px-autour [data-au-tr] [data-au-f]') || {}).textContent), etat: await page.evaluate(() => document.querySelector('.px-autour [data-au-etat]').textContent) };
  await ecrire('03-trottinette-boussole');
  return r;
}
