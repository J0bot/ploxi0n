// ⬡ (0.99.63, RS-7 : « Prio 1 : xer xerboxion », natif) le mode xerboxion sur le chemin iPhone : le xer dessiné dans l'app (pas de cadre du
// labo), l'en-tête, les onglets, une tuile ouvre son ploxion, les koins là ; le thème cyan
export default async function ({ page, ecrire }) {
  const passer = () => page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); const n = document.querySelector('[data-nv]'); if (n) n.click(); });
  await passer();
  await page.evaluate(async () => { const a = (await window.ploxi0n.boxion.get('reglages', 'app')) || {}; await window.ploxi0n.boxion.put('reglages', 'app', { ...a, mode: 'xerboxion' }); });
  await page.reload(); await page.waitForTimeout(3500); await passer(); await page.waitForTimeout(600);
  const r = {};
  r.xer = await page.evaluate(() => ({ panneau: !!document.querySelector('.px-xbx'), cadre: !!document.querySelector('.px-labo iframe'), koins: document.documentElement.classList.contains('px-koins'),
    compte: (document.querySelector('[data-xbx-compte]') || {}).textContent, onglets: [...document.querySelectorAll('[data-xbx-onglet]')].map(b => b.textContent.trim()),
    tuiles: document.querySelectorAll('.px-xbx-t').length, acc: getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() }));
  await ecrire('xbx-01-bureau');
  await page.evaluate(() => document.querySelector('[data-xbx-onglet="capteurs"]').click()); await page.waitForTimeout(300);
  r.capteurs = await page.evaluate(() => [...document.querySelectorAll('.px-xbx-t')].map(t => t.getAttribute('data-xbx-id')).slice(0, 12));
  await ecrire('xbx-02-capteurs');
  await page.evaluate(() => document.querySelector('[data-xbx-id="autour"]').click()); await page.waitForTimeout(1500);
  r.ouvert = await page.evaluate(() => window.ploxi0n.routeur.courant());
  await page.evaluate(() => window.ploxi0n.routeur.accueil()); await page.waitForTimeout(800);
  r.retour = await page.evaluate(() => ({ panneau: !!document.querySelector('.px-xbx'), onglet: (document.querySelector('[data-xbx-onglet].on') || {}).textContent }));
  return r;
}
