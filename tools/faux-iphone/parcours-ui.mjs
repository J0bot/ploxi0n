// 🧹 (0.99.65, RS-7 : « bref, faut régler les problèmes de UI ») les défauts des captures, sur le chemin iPhone : le clavier ouvert (la bande
// s'efface), une feuille ouverte dans un ploxion (la bande s'efface), le « ? » du labo caché en mode koin, le fond sous les coins
export default async function ({ page, ecrire, emettre }) {
  const passer = () => page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); const n = document.querySelector('[data-nv]'); if (n) n.click(); });
  await passer();
  await page.evaluate(async () => { const a = (await window.ploxi0n.boxion.get('reglages', 'app')) || {}; await window.ploxi0n.boxion.put('reglages', 'app', { ...a, koins: true }); });
  await page.reload(); await page.waitForTimeout(3000); await passer();
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('reglages-app')); await page.waitForTimeout(900);
  const bande = () => page.evaluate(() => { const r = document.querySelector('.px-koins-r'); return r ? getComputedStyle(r).display : 'absente'; });
  const r = { avant: await bande() };
  emettre('Keyboard', 'keyboardWillShow', { keyboardHeight: 336 }); await page.waitForTimeout(200);
  r.clavier = await bande(); await ecrire('ui-01-clavier');
  emettre('Keyboard', 'keyboardWillHide', {}); await page.waitForTimeout(200);
  r.apresClavier = await bande();
  await page.evaluate(() => { const h = document.querySelector('.px-hote:not([hidden])'); const v = document.createElement('div'); v.className = 'px-voile'; v.id = 'essai-voile'; v.innerHTML = '<div class="px-tiroir"><p>une feuille</p></div>'; h.appendChild(v);
    const b = document.createElement('button'); b.id = 'jos-aide-btn'; b.textContent = '?'; b.style.cssText = 'position:fixed;right:16px;bottom:120px'; document.body.appendChild(b); });
  await page.waitForTimeout(200);
  r.feuille = await bande(); await ecrire('ui-02-feuille');
  await page.evaluate(() => document.getElementById('essai-voile').remove()); await page.waitForTimeout(150);
  r.apresFeuille = await bande();
  r.aide = await page.evaluate(() => getComputedStyle(document.getElementById('jos-aide-btn')).display);
  r.fondCoins = await page.evaluate(() => getComputedStyle(document.querySelector('.px-koins-r'), '::before').backgroundColor);
  return r;
}
