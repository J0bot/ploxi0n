// ○ ▦ (0.97) le zoom de temps et le zoom de fractale sur le chemin iPhone : des visites (le journal « passe »), la map en 3 × 3, la réglette du
// wormion, le passé à plusieurs paliers
export default async function ({ page, ecrire }) {
  await page.evaluate(async () => { const a = (await window.ploxi0n.boxion.get('reglages', 'app')) || {}; await window.ploxi0n.boxion.put('reglages', 'app', { ...a, mode: 'organique', variante: 'cyberpunk' }); });
  await page.reload(); await page.waitForTimeout(3000);
  // des visites, et un passé plus ancien posé à la main (le fil et l'usage)
  for (const id of ['systeme', 'ambiances', 'journal-tsoins', 'map']) { await page.evaluate((i) => window.ploxi0n.routeur.ouvrir(i), id); await page.waitForTimeout(700); await page.evaluate(() => window.ploxi0n.routeur.faire('accueil')); await page.waitForTimeout(400); }
  await page.evaluate(async () => {
    const b = window.ploxi0n.boxion, u = (await b.get('usage', 'stats')) || { px: {} }, j = Date.now() - 12 * 86400e3, d = new Date(j), k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    u.px.xp = { opens: 3, seconds: 900, lastAt: j }; u.days = u.days || {}; u.days[k] = { opens: 3, seconds: 900, px: { xp: { o: 3, s: 900 } } }; await b.put('usage', 'stats', u);
    if (window.jOSTsoin) window.jOSTsoin.mark('idée', 'la map dans le temps');
  });
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('map')); await page.waitForTimeout(1800);
  const r = {};
  r.cartes = await page.evaluate(() => [...document.querySelectorAll('.px-map-c')].map(c => [...c.classList].find(x => /px-map-(ici|droite|gauche|haut|bas|hg|hd|bg|bd)$/.test(x))));
  await ecrire('01-map-3x3');
  await page.evaluate(() => { const i = document.querySelector('[data-map-temps]'); i.value = 4; i.dispatchEvent(new Event('input', { bubbles: true })); }); await page.waitForTimeout(1200);
  r.allumes = await page.evaluate(() => [...document.querySelectorAll('.px-map-vu')].map(k => k.getAttribute('data-k')));
  await ecrire('02-map-il-y-a-2-sem');
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('passe')); await page.waitForTimeout(1500);
  await ecrire('03-passe-jours');
  await page.click('[data-palier="heure"]'); await page.waitForTimeout(800); await ecrire('04-passe-heures');
  r.seaux = await page.evaluate(() => [...document.querySelectorAll('.px-passe-s h4')].map(h => h.textContent).slice(0, 6));
  return r;
}
