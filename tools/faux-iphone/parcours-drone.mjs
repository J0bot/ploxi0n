// ◬ (0.99.12) le drone dans XERB0T : mavlink2rest simulé (10.0.0.42:8088) ; ajouté à la main, son état ; « revenir » demande « sûr ? »,
// puis part en COMMAND_LONG MAV_CMD_NAV_RETURN_TO_LAUNCH ; aucune autre commande n'existe
export default async function ({ page, ecrire, droneFaux }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('controleur')); await page.waitForTimeout(1500);
  await page.evaluate(() => document.querySelector('[data-page-cube="ajouter"]').click()); await page.waitForTimeout(300);
  await page.evaluate(() => { document.querySelector('[data-xb-adresse]').value = '10.0.0.42:8088'; document.querySelector('[data-xb-type]').value = 'drone'; document.querySelector('[data-xb-ajouter]').click(); });
  await page.waitForTimeout(2000);
  const r = { entites: await page.evaluate(() => [...document.querySelectorAll('.xb-e, [data-xb-entite], .xb-ligne-e')].map(x => x.textContent.replace(/\s+/g, ' ').trim()).slice(0, 12)), types: await page.evaluate(() => [...document.querySelectorAll('[data-xb-type] option')].map(o => o.value)) };
  r.boutons = await page.evaluate(() => [...document.querySelectorAll('[data-xb-act]')].map(b => b.getAttribute('data-xb-act') + ':' + b.className));
  await ecrire('01-le-drone');
  await page.evaluate(() => { const b = document.querySelector('[data-xb-act="revenir"]'); if (b) b.click(); }); await page.waitForTimeout(300);
  r.avant = droneFaux.length;   /* le premier toucher ne fait que demander « sûr ? » */
  await page.evaluate(() => { const b = document.querySelector('[data-xb-act="revenir"]'); if (b) b.click(); }); await page.waitForTimeout(1500);
  r.commandes = droneFaux.map(x => JSON.stringify(x).match(/MAV_CMD_[A-Z_]+/)?.[0] || JSON.stringify(x).slice(0, 80));
  r.texte = await page.evaluate(() => (document.querySelector('.xb-detail, [data-xb-detail]') || document.body).innerText.slice(0, 400));
  return r;
}
