// ⬡ (0.55) les icônes du xerboxion sur l'accueil, l'atelier d'une icône (menu « son icône »), et Face ID : verrouiller un ploxion, l'ouvrir,
// passer en arrière-plan (App « pause ») → il se cache derrière le verrou ; revenir (« resume ») → le visage est redemandé.
export default async function ({ page, ecrire, appels, emettre }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  const r = {};
  r.tuiles = await page.evaluate(() => [...document.querySelectorAll('.px-tuile[data-id]')].map(b => [b.getAttribute('data-id'), (b.querySelector('svg.xki') || {}).dataset ? b.querySelector('svg.xki').dataset.type : null]));
  await ecrire('02-icones-accueil');
  const visages = () => appels.filter(a => a.m === 'verifyIdentity').length;
  const appuiLong = async (id) => {
    const c = await page.evaluate((i) => { const b = document.querySelector('.px-tuile[data-id="' + i + '"]').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 3 }; }, id);
    await page.mouse.move(c.x, c.y); await page.mouse.down(); await page.waitForTimeout(650); await page.mouse.up(); await page.waitForTimeout(300);
  };
  // un ploxion du pack (pas interne : lui seul a le verrou et l'atelier)
  const cible = await page.evaluate(() => { for (const b of document.querySelectorAll('.px-tuile[data-id]')) { const id = b.getAttribute('data-id'); if (!/^(marketplace|xer-en-ligne|banc|cape|sante|journal-tsoins|reglages-app|portion|gestion)$/.test(id)) return id; } return null; });
  r.cible = cible; if (!cible) return r;
  // l'atelier
  await appuiLong(cible);
  r.menuIcone = await page.evaluate(() => !!document.querySelector('[data-m="icone"]'));
  await page.evaluate(() => document.querySelector('[data-m="icone"]').click()); await page.waitForTimeout(400);
  r.atelier = await page.evaluate(() => !!document.querySelector('.px-atelier'));
  r.typeAtelier = await page.evaluate(() => (document.querySelector('.px-at-type') || {}).textContent || '');
  await ecrire('03-atelier');
  await page.evaluate(() => { document.querySelector('[data-pal="1"]').click(); }); await page.waitForTimeout(200);
  await page.evaluate(() => { const g = document.querySelector('[data-gl="lampe"]'); if (g) g.click(); }); await page.waitForTimeout(200);
  await ecrire('04-atelier-retouche');
  await page.evaluate(() => document.querySelector('[data-at-ok]').click()); await page.waitForTimeout(600);
  r.tuileRetouchee = await page.evaluate((i) => { const s = document.querySelector('.px-tuile[data-id="' + i + '"] svg.xki'); return s ? s.outerHTML.includes('#c14bff') : null; }, cible);
  // Face ID
  await appuiLong(cible);
  await page.evaluate(() => { const b = document.querySelector('[data-m="verrou"]'); if (b) b.click(); }); await page.waitForTimeout(500);
  const v0 = visages();
  await page.evaluate((i) => document.querySelector('.px-tuile[data-id="' + i + '"]').click(), cible); await page.waitForTimeout(1500);
  r.ouvertApresVisage = await page.evaluate((i) => !!document.querySelector('.px-hote[data-ploxion="' + i + '"]:not([hidden])'), cible);
  r.visagesOuverture = visages() - v0;
  emettre('App', 'pause', {}); await page.waitForTimeout(400);
  r.cacheEnArrierePlan = await page.evaluate((i) => { const h = document.querySelector('.px-hote[data-ploxion="' + i + '"]'); return !!h && h.hidden && /ne s'ouvre qu'avec ton visage/.test(document.querySelector('#ploxi0n').textContent); }, cible);
  await ecrire('05-verrou-arriere-plan');
  emettre('App', 'resume', {}); await page.waitForTimeout(1200);
  r.visagesRetour = visages() - v0 - r.visagesOuverture;
  r.revenu = await page.evaluate((i) => !!document.querySelector('.px-hote[data-ploxion="' + i + '"]:not([hidden])'), cible);
  return r;
}
