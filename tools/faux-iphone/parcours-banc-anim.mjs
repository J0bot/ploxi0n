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
  // (0.99.52) la ★ est devenue l'animation de l'app pour sa famille
  r.reglage = await page.evaluate(() => window.ploxi0n.prefs.lire().animations);
  // ◫ le pokédex : les animations jugées, en tuiles
  await page.evaluate(() => document.querySelector('[data-ong="pokedex"]').click()); await page.waitForTimeout(800);
  r.pokedex = await page.evaluate(() => document.querySelectorAll('[data-poke] .jswc__tile').length);
  await ecrire('banc-anim-03-pokedex');
  // ⚙ dans l'app : choisir l'ouverture « Sortir de l'icône (iOS) »
  await page.evaluate(() => document.querySelector('[data-ong="app"]').click()); await page.waitForTimeout(400);
  r.choixOuvrir = await page.evaluate(() => [...document.querySelectorAll('[data-choisir^="ouvrir|"]')].map(b => b.textContent + (b.classList.contains('on') ? '*' : '')));
  await page.evaluate(() => document.querySelector('[data-choisir="ouvrir|ouvrir-ios"]').click()); await page.waitForTimeout(300);
  r.apresChoix = await page.evaluate(() => window.ploxi0n.prefs.lire().animations.ouvrir);
  await ecrire('banc-anim-04-dans-l-app');
  // une vraie ouverture avec le cercle : le ploxion sort d'un cercle centré sur son icône
  await page.evaluate(() => window.ploxi0n.prefs.regler({ animations: { ...window.ploxi0n.prefs.lire().animations, ouvrir: 'ouvrir-cercle', cascade: 'cascade-centre' } }));
  r.cascade = await page.evaluate(() => document.documentElement.classList.contains('px-cascade-centre'));
  await page.evaluate(() => window.ploxi0n.routeur.faire('accueil')); await page.waitForTimeout(900);
  await page.evaluate(() => { const o = Element.prototype.animate; Element.prototype.animate = function (k, opt) { const a = o.call(this, k, opt); if (this.classList && this.classList.contains('px-hote')) { a.pause(); a.currentTime = (opt.duration || 400) * 0.4; window.__a = a; window.__k = JSON.stringify(k[0]).slice(0, 90); } return a; }; });
  const t = await page.evaluate(() => { const x = [...document.querySelectorAll('.px-accueil [data-id]')].find(e => { const q = e.getBoundingClientRect(); return q.top > 250 && q.top < innerHeight - 260 && q.width > 40; }); const q = x.getBoundingClientRect(); return { x: q.x + q.width / 2, y: q.y + 30 }; });
  await page.mouse.click(t.x, t.y); await page.waitForTimeout(400);
  r.cercle = await page.evaluate(() => window.__k || null);
  await ecrire('banc-anim-05-le-cercle');
  await page.evaluate(() => { if (window.__a) window.__a.play(); });
  return r;
}
