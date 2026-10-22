// ▦ (0.90) la map en carrés sur le chemin iPhone : les hubs du labo (CapacitorHttp → /px/xerkions.json), le Xerboxion au centre, ses voisins
// aux bords ; glisser ; créer un hub à côté ; le store du labo (xerkions-persos)
export default async function ({ page, ecrire, appels }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(600);
  await page.evaluate(() => window.ploxi0n.routeur.faire('map')); await page.waitForTimeout(1800);
  const ici = () => page.evaluate(() => { const c = document.querySelector('.px-map-ici'); return c ? { hub: c.getAttribute('data-c'), koins: c.querySelectorAll('[data-k]').length, voisins: ['droite', 'gauche', 'haut', 'bas'].map(x => (document.querySelector('.px-map-' + x) || {}).dataset).map(d => (d ? d.c : null)) } : null; });
  const a = await ici(); await ecrire('01-map');
  const v = await page.$('[data-map-v]'); const b = await v.boundingBox();
  await page.mouse.move(b.x + b.width * 0.8, b.y + b.height / 2); await page.mouse.down(); await page.mouse.move(b.x + b.width * 0.2, b.y + b.height / 2, { steps: 6 }); await page.mouse.up();
  await page.waitForTimeout(500);
  const apres = await ici(); await ecrire('02-glisse');
  await page.click('[data-map="creer"]'); await page.waitForTimeout(300);
  await page.fill('[data-ed-nom]', 'Mes jeux'); await page.click('[data-ed-centre="trion"]');
  await page.evaluate(() => { for (const id of ['xp', 'clickion']) { const c = document.querySelector('[data-ed-k="' + id + '"]'); if (c) c.checked = true; } });
  await ecrire('03-creer');
  await page.click('[data-ed="garder"]'); await page.waitForTimeout(700);
  const cree = await ici(); await ecrire('04-mon-hub');
  const store = await page.evaluate(() => JSON.parse(localStorage.getItem('store:xerkions-persos:items') || '[]').map(h => ({ id: h.id, nom: h.nom, portals: h.portals, koins: h.koins.length })));
  const http = appels.filter(x => x.p === 'CapacitorHttp' && /xerkions\.json/.test(x.o.url || '')).length;
  return { a, apres, cree, store, http };
}
