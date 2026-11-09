// ⊞ (0.99.16) le pas à pas du synthé : « ⊞ à moi », poser des notes à la main (16 pas × 8 degrés), « partir du motif », la boucle les joue,
// la tête de lecture avance ; gardé au lancement suivant (reglages/synthe)
export default async function ({ page, ecrire }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('synthe')); await page.waitForTimeout(1500);
  await page.click('.px-synthe [data-sy-motif="mien"]'); await page.waitForTimeout(300);
  await page.click('.px-synthe [data-sy="seq-vider"]'); await page.waitForTimeout(200);
  for (const c of ['0:0', '3:2', '6:4', '8:0', '10:7', '12:3', '14:5']) await page.click('.px-synthe [data-sy-c="' + c + '"]');
  await page.click('.px-synthe [data-sy-c="3:2"]'); await page.click('.px-synthe [data-sy-c="3:1"]');   // toucher une note la remplace sur son pas
  const r = { grille: await page.evaluate(() => document.querySelectorAll('.px-synthe .px-sy-c').length),
    on: await page.evaluate(() => [...document.querySelectorAll('.px-synthe .px-sy-c.on')].map(x => x.getAttribute('data-sy-c')).sort()) };
  await page.click('.px-synthe [data-sy="boucle"]');
  const tetes = []; for (let i = 0; i < 5; i++) { await page.waitForTimeout(170); tetes.push(await page.evaluate(() => (document.querySelector('.px-synthe .px-sy-c.ici') || {}).dataset?.k)); }
  r.tete = tetes; await ecrire('01-pas-a-pas');
  await page.click('.px-synthe [data-sy="boucle"]');
  await page.waitForTimeout(600);
  r.garde = await page.evaluate(async () => (await window.ploxi0n.boxion.get('reglages', 'synthe')).pas);
  await page.setViewportSize({ width: 852, height: 393 }); await page.waitForTimeout(600); await ecrire('02-pas-a-pas-paysage');
  r.paysage = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cellule: Math.round(document.querySelector('.px-sy-c').getBoundingClientRect().width) }));
  return r;
}
