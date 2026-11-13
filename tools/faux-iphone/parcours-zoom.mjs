// 🔍 (0.99.48) ouvrir depuis l'icône, refermer dans l'icône : on touche une icône de l'accueil, on fige le zoom à mi-chemin (les animations
// de la page, à mi-temps) pour le voir ; puis ▁ minimiser : il rentre dans son icône
export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.waitForTimeout(800);
  const r = {};
  const cible = await page.evaluate(() => { const t = [...document.querySelectorAll('.px-accueil [data-id]')].find(x => { const q = x.getBoundingClientRect(); return q.top > 300 && q.top < innerHeight - 260 && q.width > 40; }); if (!t) return null; const q = (t.querySelector('.px-ic,.px-g') || t).getBoundingClientRect(); return { id: t.getAttribute('data-id'), x: q.x + q.width / 2, y: q.y + q.height / 2, w: q.width }; });
  r.cible = cible; if (!cible) return r;
  // figer chaque animation de zoom dès qu'elle démarre (à 35 % de son temps)
  await page.evaluate(() => { const o = Element.prototype.animate; window.__fige = 0.35; Element.prototype.animate = function (k, opt) { const a = o.call(this, k, opt); if (this.classList && this.classList.contains('px-hote') && window.__fige != null) { a.pause(); a.currentTime = (opt.duration || 400) * window.__fige; window.__anim = a; } return a; }; });
  await page.mouse.click(cible.x, cible.y); await page.waitForTimeout(400);
  r.ouverture = await page.evaluate(() => { const h = document.querySelector('.px-scene>.px-hote:not([hidden])'); if (!h) return null; const b = h.getBoundingClientRect(); return { courant: window.ploxi0n.routeur.courant(), transform: getComputedStyle(h).transform, clip: getComputedStyle(h).clipPath.slice(0, 60), w: Math.round(b.width) }; });
  await ecrire('zoom-01-sort-de-l-icone');
  await page.evaluate(() => { if (window.__anim) window.__anim.play(); window.__fige = null; }); await page.waitForTimeout(700);
  await ecrire('zoom-02-ouvert');
  r.ouvertPlein = await page.evaluate(() => { const h = document.querySelector('.px-scene>.px-hote:not([hidden])'); return h ? getComputedStyle(h).transform : null; });
  // ▁ minimiser : il rentre dans son icône
  await page.evaluate(() => { window.__fige = 0.6; }); await page.evaluate(() => window.ploxi0n.routeur.faire('minimiser')); await page.waitForTimeout(400);
  r.fermeture = await page.evaluate(() => { const h = document.querySelector('.px-scene>.px-hote.px-sortant'); return h ? { transform: getComputedStyle(h).transform, accueil: !!document.querySelector('.px-accueil') } : null; });
  await ecrire('zoom-03-rentre-dans-l-icone');
  await page.evaluate(() => { if (window.__anim) window.__anim.play(); window.__fige = null; }); await page.waitForTimeout(700);
  r.apres = await page.evaluate(() => ({ courant: window.ploxi0n.routeur.courant(), vivants: window.ploxi0n.routeur.vivants(), sortants: document.querySelectorAll('.px-sortant').length, scene: document.querySelector('.px-scene').className }));
  // ‹ depuis le ploxion rouvert : il rentre aussi, puis il est démonté
  await page.mouse.click(cible.x, cible.y); await page.waitForTimeout(900);
  await page.evaluate(() => window.ploxi0n.routeur.retour()); await page.waitForTimeout(900);
  r.apresRetour = await page.evaluate(() => ({ courant: window.ploxi0n.routeur.courant(), vivants: window.ploxi0n.routeur.vivants() }));
  return r;
}
