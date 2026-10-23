// ◈ (0.99.2, RS-7 sur l'iPhone : « ça reste pas fixe à la page ; pas assez lisible ») : l'accueil organique ne défile plus (ni en long, ni
// en large, même après le réseau qui centre sa scène), et la map se lit sur un fond chargé (une image de galaxie simulée)
export default async function ({ page, ecrire }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.waitForTimeout(800);
  // un fond chargé, comme celui de RS-7 (étoiles, une galaxie claire au milieu)
  await page.addStyleTag({ content: 'body{background:radial-gradient(ellipse 60% 25% at 50% 55%,#c8c0b0 0,#6d6658 18%,transparent 45%),radial-gradient(circle at 20% 20%,#3a3550 0,transparent 40%),repeating-radial-gradient(circle at 50% 55%,#0b0a14 0 6px,#2b2836 7px 8px) !important}' });
  await page.waitForTimeout(600);
  const m = () => page.evaluate(() => { const a = document.querySelector('.px-accueil'); a.scrollTop = 200; a.scrollLeft = 50; return { st: a.scrollTop, sl: a.scrollLeft, sh: a.scrollHeight, ch: a.clientHeight }; });
  const r = { hub: await m() };
  await ecrire('01-hub-sur-fond');
  await page.evaluate(() => { const t = document.querySelector('.px-accueil [data-map-temps]'); t.value = 3; t.dispatchEvent(new Event('input', { bubbles: true })); t.dispatchEvent(new Event('change', { bubbles: true })); });
  await page.waitForTimeout(700); await ecrire('02-le-temps');
  await page.evaluate(() => document.querySelector('.px-accueil [data-map-palier="reseau"]').click()); await page.waitForTimeout(1500);
  r.reseau = await m(); await ecrire('03-reseau');
  await page.evaluate(() => document.querySelector('.px-accueil [data-map-palier="tout"]').click()); await page.waitForTimeout(1200);
  await ecrire('04-tes-ploxions');
  return r;
}
