// ◺◿ (0.89) les koins du carnet de RS-7 sur le chemin iPhone : l'accueil sans dock, les deux koins ; ils grandissent ; les cases et la barre
// des glyphes ; dans un ploxion (sans la barre du bas) ; une case agit
export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(async () => { const a = (await window.ploxi0n.boxion.get('reglages', 'app')) || {}; await window.ploxi0n.boxion.put('reglages', 'app', { ...a, koins: true }); });
  await page.reload(); await page.waitForTimeout(3000);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  for (const id of ['systeme', 'ambiances', 'journal-tsoins']) { await page.evaluate((i) => window.ploxi0n.routeur.ouvrir(i), id); await page.waitForTimeout(500); await page.evaluate(() => window.ploxi0n.routeur.faire('minimiser')); await page.waitForTimeout(300); }
  const dock = await page.evaluate(() => { const d = document.querySelector('.px-dock'); return d ? getComputedStyle(d).display : 'absent'; });
  await ecrire('01-accueil-koins');
  await page.click('[data-koin="gauche"]'); await page.waitForTimeout(350); await ecrire('02-moyen');
  await page.click('[data-koin="gauche"]'); await page.waitForTimeout(350); await ecrire('03-grand');
  await page.click('[data-koin="gauche"]'); await page.waitForTimeout(350); await ecrire('04-cases');
  const cases = await page.evaluate(() => [...document.querySelectorAll('[data-cases]:not([hidden]) [data-koin-a]')].map(b => b.getAttribute('data-koin-a')));
  // ○ □ (0.92) les trackpads : tourner le wormion (horaire), puis glisser le portion vers le haut — la capture pendant le geste
  const pad = async (sel) => { const b = await (await page.$(sel)).boundingBox(); return b; };
  const w = await pad('[data-pad="wormion"]'), cx = w.x + w.width / 2, cy = w.y + w.height / 2, R = w.width * 0.36;
  await page.mouse.move(cx + R, cy); await page.mouse.down();
  for (let d = 10; d <= 70; d += 10) await page.mouse.move(cx + R * Math.cos(d * Math.PI / 180), cy + R * Math.sin(d * Math.PI / 180));
  const wormion = await page.evaluate(() => ({ l: document.querySelector('[data-pad="wormion"] [data-pad-l]').textContent, s: document.querySelector('[data-pad="wormion"] [data-pad-s]').textContent }));
  await ecrire('05-wormion-tourne');
  for (let d = 60; d >= 0; d -= 10) await page.mouse.move(cx + R * Math.cos(d * Math.PI / 180), cy + R * Math.sin(d * Math.PI / 180));
  await page.mouse.up(); await page.waitForTimeout(300);   // revenu au départ : rien n'est ouvert, le panneau reste
  const resteOuvert = await page.evaluate(() => !document.querySelector('[data-cases="gauche"]').hidden);
  const p = await pad('[data-pad="portion"]'), px = p.x + p.width / 2, py = p.y + p.height / 2;
  await page.mouse.move(px, py); await page.mouse.down();
  for (let k = 1; k <= 8; k++) await page.mouse.move(px + 2, py - k * 7);
  const portion = await page.evaluate(() => ({ l: document.querySelector('[data-pad="portion"] [data-pad-l]').textContent, dir: document.querySelector('[data-pad="portion"]').getAttribute('data-dir') }));
  await ecrire('06-portion-glisse');
  await page.mouse.up(); await page.waitForTimeout(1200);
  const apresPortion = await page.evaluate(() => window.ploxi0n.routeur.courant());
  await ecrire('07-portion-la-map');
  await page.evaluate(() => window.ploxi0n.routeur.faire('accueil')); await page.waitForTimeout(500);
  await page.click('[data-koin="gauche"]'); await page.waitForTimeout(150); await page.click('[data-koin="gauche"]'); await page.waitForTimeout(150); await page.click('[data-koin="gauche"]'); await page.waitForTimeout(350);
  await page.click('[data-koin-a="toi"]'); await page.waitForTimeout(900);
  const ouvert = await page.evaluate(() => window.ploxi0n.routeur.courant());
  const barre = await page.evaluate(() => { const b = document.querySelector('.px-ecran>.px-barre'); return b ? getComputedStyle(b).display : 'absente'; });
  await ecrire('05-dans-un-ploxion');
  return { dock, cases, wormion, resteOuvert, portion, apresPortion, ouvert, barre };
}
