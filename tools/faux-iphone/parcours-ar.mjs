// 👁 (0.73) l'AR native du terrax sur le chemin iPhone : PloxiAR (le vrai pont de Capacitor, les méthodes telles que le Swift les déclare),
// ouvrir, une pose venue d'iOS gardée à sa vraie place, la chambre, le scan de la pièce ouvert en AR Quick Look (PloxiApple.apercu)
export default async function ({ page, ecrire, appels, emettre }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.ploxi0nRouteur.ouvrir('terrax')); await page.waitForTimeout(2500);
  await page.evaluate(() => document.querySelector('[data-page-cube="terrax"]').click()); await page.waitForTimeout(800);
  const bouton = await page.evaluate(() => document.querySelector('[data-tx="yeux"]').textContent);
  await page.evaluate(() => document.querySelector('[data-tx="yeux"]').click());
  for (let i = 0; i < 40 && !appels.some(a => a.p === 'PloxiAR' && a.m === 'ouvrir'); i++) await page.waitForTimeout(250);   // la position d'abord
  await ecrire('01-ar-ouverte');
  emettre('PloxiAR', 'ar', { type: 'pose', id: 'txfaux1', x: 3, y: -1.1, z: -4, emoji: '🍄', texte: 'posé dans l\'AR' }); await page.waitForTimeout(400);
  emettre('PloxiAR', 'ar', { type: 'ferme' }); await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('[data-page-cube="chambre"]').click()); await page.waitForTimeout(500);
  await ecrire('02-chambre');
  await page.evaluate(() => document.querySelector('[data-tx="scanner"]').click()); await page.waitForTimeout(800);
  await ecrire('03-piece');
  await page.evaluate(() => document.querySelector('[data-tx="voir-piece"]').click()); await page.waitForTimeout(500);
  // 📦 (0.74) Object Capture : l'objet capturé, vu en AR Quick Look, puis proposé quand on pose dans la chambre en AR
  await page.evaluate(() => { const x = document.querySelector('[data-tx="annuler"]'); if (x) x.click(); document.querySelector('[data-tx="capturer"]').click(); }); await page.waitForTimeout(800);
  await ecrire('04-objet-3d');
  await page.evaluate(() => document.querySelector('[data-tx="voir-objet"]').click()); await page.waitForTimeout(400);
  await page.evaluate(() => { const x = document.querySelector('[data-tx="annuler"]'); if (x) x.click(); document.querySelector('[data-tx="ar-chambre"]').click(); }); await page.waitForTimeout(600);
  const objets = await page.evaluate(() => new Promise((ok) => { const b = window.ploxi0n && window.ploxi0n.boxion; if (!b) return ok(null); b.get('terrax', 'objets').then(ok, () => ok(null)); }));
  const ar = appels.filter(a => a.p === 'PloxiAR' || (a.p === 'PloxiApple' && a.m === 'apercu')).map(a => a.p + '.' + a.m + (a.m === 'ouvrir' ? ':' + a.o.mode + ':' + (a.o.objets || []).length + ':modeles=' + (a.o.modeles || []).map(m => m.nom).join('|') : '') + (a.m === 'apercu' ? ':' + a.o.chemin + ':' + a.o.echelleReelle : ''));
  const pose = objets && objets.find(o => o.id === 'txfaux1');
  return { bouton, ar, pose: pose ? { lat: pose.lat, lon: pose.lon, h: pose.h, lieu: pose.lieu } : objets === null ? 'boxion invisible' : 'absente', piece: objets && (objets.find(o => o.piece) || {}).piece, objet3d: objets && (objets.find(o => o.capture) || {}).modele };
}
