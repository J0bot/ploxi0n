// ▤ ≈ (0.88) le lot de ploxions sur le chemin iPhone : le système (PloxiApple.systeme, Device.getInfo, la batterie) et les ambiances (Web Audio
// → un <audio> qui joue : le routeur ne l'endort pas)
export default async function ({ page, ecrire, appels }) {
  for (let i = 0; i < 3; i++) { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^(ok|plus tard|passer)$/i.test(x.textContent.trim())); if (b) b.click(); }); await page.waitForTimeout(250); }   // (0.99.27) les feuilles du lancement (nouveautés) couvraient les boutons
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(600);
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('systeme')); await page.waitForTimeout(2600);
  const systeme = await page.evaluate(() => (document.querySelector('.px-hote[data-ploxion="systeme"]') || {}).innerText);
  await ecrire('01-systeme');
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('ambiances')); await page.waitForTimeout(800);
  await page.click('.px-hote[data-ploxion="ambiances"] [data-amb="pluie"]');
  await page.evaluate(() => { for (const [k, v] of [['pluie', '0.6'], ['feu', '0.4']]) { const i = document.querySelector('[data-amb="' + k + '"]'); i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); } });
  await page.waitForTimeout(1200);
  const joue = await page.evaluate(() => { const a = document.querySelector('.px-hote[data-ploxion="ambiances"] audio'); return a ? { paused: a.paused, flux: !!a.srcObject } : null; });
  await ecrire('02-ambiances');
  await page.evaluate(() => window.ploxi0n.routeur.faire('minimiser')); await page.waitForTimeout(500);   // ▁ : il reste vivant (‹ le fermerait)
  const toujours = await page.evaluate(() => { const a = document.querySelector('.px-hote[data-ploxion="ambiances"] audio'); return a ? !a.paused : false; });
  const natif = appels.filter(a => a.p === 'PloxiApple' && a.m === 'systeme').length;
  return { systeme: (systeme || '').replace(/\s+/g, ' ').slice(0, 600), natif, joue, toujoursMinimise: toujours };
}
