// ⬡ (0.99.5, RS-7 : « quand on zoome sur un ploxion, il faut qu'on puisse voir son bion ») : le neurone d'un ploxion montre son CŒUR (son
// propre bion) et tous les bions que son code touche ; le cœur se zoome (son code, ce qu'il enregistre, ses bions), un bion aussi
export default async function ({ page, ecrire }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.waitForTimeout(800);
  const m = (f, ...a) => page.evaluate(([f, a]) => { const h = document.querySelector('.px-accueil .px-org-map-h'); return h && h.__map ? h.__map[f](...a) : null; }, [f, a]);
  const lire = () => page.evaluate(() => { const n = document.querySelector('.px-accueil .px-nv'); return n ? { titre: (n.querySelector('.px-nv-noyau b') || {}).textContent, bions: [...n.querySelectorAll('[data-nv-bion] i')].map(x => x.textContent), e: n.querySelectorAll('.px-nv-c.px-nv-e').length, s: n.querySelectorAll('.px-nv-c.px-nv-s').length } : null; });
  const id = await page.evaluate(() => { const l = window.ploxi0n.routeur.catalogue().filter(p => !p.interne); return (l.find(p => p.id === 'notes') || l[0] || {}).id; });
  await m('zoomer', 'ploxion', { ploxion: id }); await page.waitForTimeout(1500);
  const r = { id, ploxion: await lire() }; await ecrire('01-le-ploxion-et-ses-bions');
  await page.evaluate(() => document.querySelector('.px-accueil .px-nv-coeur').click()); await page.waitForTimeout(1500);
  r.coeur = await lire(); await ecrire('02-son-coeur');
  const autre = await page.evaluate(() => { const b = [...document.querySelectorAll('.px-accueil [data-nv-bion]')][0]; if (b) b.click(); return b && b.getAttribute('data-nv-bion'); });
  await page.waitForTimeout(1500); r.plusBas = { bion: autre, vue: await lire() }; await ecrire('03-un-bion-plus-bas');
  return r;
}
