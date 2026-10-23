// ⟷ (0.99.5, RS-7 : « commencer une version paysage iPhone ») : l'iPhone couché (852 × 393) : l'accueil organique (en-tête et modes à gauche,
// la map à droite), le synthé (jouer à gauche, régler à droite), le neurone d'un ploxion ; rien ne déborde en largeur
export default async function ({ page, ecrire }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.setViewportSize({ width: 852, height: 393 }); await page.waitForTimeout(1500);
  const deborde = () => page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: innerWidth, accueil: (() => { const a = document.querySelector('.px-accueil'); return a ? a.scrollWidth - a.clientWidth : null; })() }));
  const r = { accueil: await deborde() };
  r.map = await page.evaluate(() => { const m = document.querySelector('.px-accueil .px-org-map'); if (!m) return null; const b = m.getBoundingClientRect(); return { x: Math.round(b.left), w: Math.round(b.width), h: Math.round(b.height) }; });
  await ecrire('01-accueil-paysage');
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('synthe')); await page.waitForTimeout(1500);
  r.synthe = await page.evaluate(() => { const j = document.querySelector('.px-sy-jouer'), g = document.querySelector('.px-sy-regler'), p = document.querySelector('.px-sy-pads'); const b = (e) => e && e.getBoundingClientRect(); return { jouer: b(j) && Math.round(b(j).left), regler: b(g) && Math.round(b(g).left), padsBas: b(p) && Math.round(b(p).bottom), hauteur: innerHeight }; });
  await ecrire('02-synthe-paysage');
  await page.evaluate(() => window.ploxi0n.routeur.faire('accueil')); await page.waitForTimeout(800);
  await page.evaluate(() => { const h = document.querySelector('.px-accueil .px-org-map-h'); const id = (window.ploxi0n.routeur.catalogue().find(p => !p.interne) || {}).id; if (h && h.__map) h.__map.zoomer('ploxion', { ploxion: id }); }); await page.waitForTimeout(1500);
  r.neurone = await deborde(); await ecrire('03-neurone-paysage');
  return r;
}
