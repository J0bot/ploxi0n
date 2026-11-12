// 🎞 (0.99.51) le banc des animations : il s'ouvre, jOSSwipe arrive, la carte du dessus joue son animation en boucle ; trois swipes au
// clavier (→ oui, ↑ celle-là, ← non) ; les choix sont gardés (boxion_local « banc/animations »)
export default async function ({ page, ecrire }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.waitForTimeout(600);
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('banc-anim')); await page.waitForTimeout(2500);
  const r = {};
  r.carte = await page.evaluate(() => { const c = document.querySelector('.ba-carte'); return c ? c.querySelector('.t').textContent : null; });
  r.cartes = await page.evaluate(() => document.querySelectorAll('.ba-carte').length);
  // la carte du dessus, à mi-animation
  await page.waitForTimeout(700); await ecrire('banc-anim-01');
  r.anime = await page.evaluate(() => document.getAnimations().filter(a => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.ba-tel')).length);
  for (const k of ['ArrowRight', 'ArrowUp', 'ArrowLeft']) { await page.keyboard.press(k); await page.waitForTimeout(700); }
  await ecrire('banc-anim-02-apres-trois');
  r.apres = await page.evaluate(() => { const c = document.querySelector('.ba-carte'); return c ? c.querySelector('.t').textContent : null; });
  r.garde = await page.evaluate(async () => { const v = await window.ploxi0n.boxion.get('banc', 'animations'); return v ? v.choix : null; });
  return r;
}
