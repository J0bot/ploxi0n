// 👁 (0.99.46) piloter de la tête : ⚙ › Piloter de la tête › tête → le point suit la tête ; fixer un bouton 0,9 s le touche ; le mode regard
// (calibrage en 4 points, puis un coup de tête = le ploxion d'à côté) ; arrêter
export default async function ({ page, ecrire, regardFaux }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.waitForTimeout(600);
  const r = {};
  await page.evaluate(() => { window.__tous = []; window.addEventListener('jos-regard', (e) => window.__tous.push(e.detail.geste + '@' + (e.detail.x != null ? e.detail.x.toFixed(2) + ',' + e.detail.y.toFixed(2) : ''))); });
  await page.evaluate(() => window.ploxi0n.prefs.regler({ regard: 'tete' })); await page.waitForTimeout(800);
  r.tete = { demarre: regardFaux.actif, calque: await page.evaluate(() => !!document.querySelector('.px-regard')), etat: await page.evaluate(() => window.jOSRegard.etat()) };
  // la tête tourne : le point part sur le côté (tourner de 0,175 rad = la moitié de la portée)
  regardFaux.visage = { ...regardFaux.visage, lacet: -0.175 }; await page.waitForTimeout(700);
  r.pointeurTourne = await page.evaluate(() => window.jOSRegard.etat().pointeur);
  // viser un bouton : on calcule l'angle qui met le point dessus, puis on le fixe
  const vise = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => { const q = x.getBoundingClientRect(); return q.width > 30 && q.top > 120 && q.top < innerHeight - 200; }); if (!b) return null;
    const q = b.getBoundingClientRect(); return { x: (q.left + q.width / 2) / innerWidth, y: (q.top + q.height / 2) / innerHeight, nom: (b.getAttribute('aria-label') || b.textContent).trim().slice(0, 40) }; });
  r.vise = vise;
  if (vise) {
    regardFaux.visage = { ...regardFaux.visage, lacet: 0 }; await page.evaluate(() => window.jOSRegard.recentrer()); await page.waitForTimeout(300);
    regardFaux.visage = { ...regardFaux.visage, lacet: -(vise.x - 0.5) * 0.7, tangage: -(vise.y - 0.5) * 0.7 }; await page.waitForTimeout(2200);
    r.gestesTete = await page.evaluate(() => window.__tous.slice()); r.touche = await page.evaluate(() => window.jOSRegard.etat().touche); r.toucheLeBon = r.touche === vise.nom;
    await ecrire('regard-01-tete');
  }
  // le mode regard : calibrer (4 points), puis un coup de tête à gauche
  regardFaux.visage = { lacet: 0, tangage: 0, cligneG: 0, cligneD: 0, x: 0.01, y: 0.02 };
  await page.evaluate(() => { window.__tous = []; });
  await page.evaluate(() => window.ploxi0n.prefs.regler({ regard: 'regard' })); await page.waitForTimeout(500);
  const pts = [{ x: 0, y: 0 }, { x: -0.03, y: 0.04 }, { x: -0.03, y: -0.04 }, { x: 0.04, y: 0 }];
  for (const p of pts) { regardFaux.visage = { ...regardFaux.visage, x: p.x, y: p.y }; await page.waitForTimeout(1400); }
  await page.waitForTimeout(400);
  r.calibre = await page.evaluate(() => window.jOSRegard.etat().calibre);
  r.gestes = []; await page.evaluate(() => { window.__gestes = []; window.jOSRegard.sur('gauche', (g) => window.__gestes.push(g.geste)); window.jOSRegard.sur('droite', (g) => window.__gestes.push(g.geste)); });
  for (const l of [0, 0.2, 0.4, 0.45, 0.3, 0.1, 0, 0, 0]) { regardFaux.visage = { ...regardFaux.visage, lacet: l }; await page.waitForTimeout(70); }
  await page.waitForTimeout(300);
  r.gestes = await page.evaluate(() => window.__gestes); r.tous = await page.evaluate(() => window.__tous); r.etatRegard = await page.evaluate(() => window.jOSRegard.etat());
  await page.evaluate(() => window.ploxi0n.prefs.regler({ regard: 'non' })); await page.waitForTimeout(400);
  r.arrete = { actif: regardFaux.actif, calque: await page.evaluate(() => !!document.querySelector('.px-regard')) };
  return r;
}
