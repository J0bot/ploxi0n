// 🛰 (0.99.61, RS-7 : « le ploxion coord marche pas » : « rien à envoyer : un texte ou une pièce » avec « Test » écrit) : coord embarqué, sur
// le chemin iPhone (le relais du mode connecté, le multipart par CapacitorHttp tel que le Swift le fait : sans Content-Type, pas de corps).
// Connecté (un jeton) : le fil s'ouvre ; écrire « Test », envoyer : il arrive au labo, et réapparaît dans le fil.
export default async function ({ page, ecrire }) {
  const passer = () => page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); const n = document.querySelector('[data-nv]'); if (n) n.click(); });
  await passer();
  await page.evaluate(() => window.ploxi0n.boxion.put('compte', 'courant', { jeton: 'jeton-du-faux-iphone', compte: { nom: 'Josion' }, le: new Date().toISOString() }));
  await page.reload(); await page.waitForTimeout(3000); await passer();
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('coord')); await page.waitForTimeout(3500);
  const avant = await page.evaluate(() => ({ verrou: !!document.querySelector('.crd__gate'), fil: (document.querySelector('.px-hote:not([hidden])') || document.body).innerText.includes('bonjour la flotte') }));
  await page.evaluate(() => { const i = document.querySelector('.px-hote:not([hidden]) [data-in]'); i.value = 'Test'; i.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.waitForTimeout(200);
  await page.evaluate(() => { const g = document.querySelector('.px-hote:not([hidden]) [data-go]'); if (g) g.click(); });
  await page.waitForTimeout(2500);
  await ecrire('coord-01-envoye');
  const apres = await page.evaluate(() => { const h = document.querySelector('.px-hote:not([hidden])'); const t = h ? h.innerText : ''; return { erreur: /rien à envoyer/.test(t), parti: /parti à RS-1|✓ posté/.test(t), fil: /\bTest\b/.test(t), champ: (h.querySelector('[data-in]') || {}).value }; });
  return { avant, apres };
}
