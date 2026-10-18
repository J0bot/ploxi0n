// ◈ (0.78) le clicker et le clickion en natif sur le chemin iPhone : installés d'office depuis le pack (hors ligne), 🎮 Jeu et sa progression
// (jOSGame), le cœur touché à plusieurs doigts (chaque doigt compte, au toucher), la partie publiée pour les widgets
export default async function ({ page, ecrire, appels }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(800);
  const installes = await page.evaluate(() => ['xp', 'clickion'].filter(id => window.ploxi0nRouteur.connait(id)));
  await page.evaluate(() => window.ploxi0nRouteur.ouvrir('xp')); await page.waitForTimeout(1500);
  await ecrire('01-jeu-progression');
  const progression = await page.evaluate(() => { const h = document.querySelector('.px-hote[data-ploxion="xp"]'); return h ? h.textContent.slice(0, 160).replace(/\s+/g, ' ') : null; });
  await page.evaluate(() => { const b = document.querySelector('.px-hote[data-ploxion="xp"] [data-tab="idle"]'); if (b) b.click(); }); await page.waitForTimeout(800);
  const avant = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('xb:xpclick')).clics || 0; } catch (e) { return 0; } });
  // trois doigts, puis deux, sur la cité : de vrais évènements tactiles (CDP)
  const r = await page.evaluate(() => { const c = document.querySelector('.px-hote[data-ploxion="xp"] [data-orb]'); if (!c) return null; const b = c.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
  const cdp = await page.context().newCDPSession(page);
  if (r) for (const n of [3, 2, 1, 1]) {
    const pts = Array.from({ length: n }, (_, i) => ({ x: r.x - 20 + i * 20, y: r.y, id: i }));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(1300);
  await ecrire('02-clicker');
  const apres = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('xb:xpclick')).clics || 0; } catch (e) { return 0; } });
  const partie = await page.evaluate(() => window.ploxi0nClicker.publierPartie());
  await page.waitForTimeout(300);
  await page.evaluate(() => window.ploxi0nRouteur.ouvrir('clickion')); await page.waitForTimeout(1500);
  await ecrire('03-clickion');
  const clickion = await page.evaluate(() => { const h = document.querySelector('.px-hote[data-ploxion="clickion"]'); return h ? h.textContent.slice(0, 140).replace(/\s+/g, ' ') : null; });
  const valeurs = appels.filter(a => a.p === 'Preferences' && a.m === 'set' && a.o.key === 'ploxi0n.valeurs').map(a => (JSON.parse(a.o.value)['px.clicker'] || {}).valeur).filter(Boolean).pop();
  const reseau = appels.filter(a => a.p === 'CapacitorHttp').map(a => a.o.url).slice(0, 5);
  return { installes, progression, touchers: apres - avant, attendu: 7, partie, valeurWidget: valeurs, clickion, reseau };
}
