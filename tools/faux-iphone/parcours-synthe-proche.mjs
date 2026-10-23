// ≋◉ (0.99.10) jouer à plusieurs : Proche démarré (Tom, le voisin simulé), le synthé partagé dans Proche, un preset → le son repart ;
// et pencher l'iPhone (une inclinaison simulée) tourne deux knobs
export default async function ({ page, ecrire, procheEnvoyes, emettre }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('proche')); await page.waitForTimeout(1000);
  await page.evaluate(() => { const h = document.querySelector('.px-proche'); h.querySelector('[data-pr-nom]').value = 'RS-7'; h.querySelector('[data-pr="allumer"]').click(); }); await page.waitForTimeout(1200);
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('synthe')); await page.waitForTimeout(1500);
  await page.evaluate(() => document.querySelector('.px-synthe [data-sy="proche"]').click()); await page.waitForTimeout(600);
  const r = { bouton: await page.evaluate(() => document.querySelector('.px-synthe [data-sy="proche"]').textContent) };
  await page.evaluate(() => document.querySelector('.px-synthe [data-sy-preset="nappe"]').click()); await page.waitForTimeout(600);
  const basses = procheEnvoyes.map(o => { try { return JSON.parse(o.donnees); } catch (e) { return null; } }).filter(x => x && x.g === 'basse' && x.d && x.d.son);
  r.basses = basses.length; r.dernierSon = basses.length ? { coupure: basses.at(-1).d.son.coupure, reverb: basses.at(-1).d.son.reverb, tempo: basses.at(-1).d.tempo } : null;
  await page.evaluate(() => document.querySelector('.px-synthe [data-sy="pencher"]').click()); await page.waitForTimeout(300);
  await page.evaluate(() => { const e = new Event('deviceorientation'); Object.defineProperty(e, 'gamma', { value: 40 }); Object.defineProperty(e, 'beta', { value: 70 }); window.dispatchEvent(e); }); await page.waitForTimeout(400);
  r.penche = await page.evaluate(() => [...document.querySelectorAll('.px-synthe .jkn')].filter(k => /coupure|résonance/.test(k.textContent)).map(k => k.textContent.replace(/\s+/g, ' ').trim()));
  r.mouvementNatif = await page.evaluate(() => window.__pxMouvementWeb);
  await ecrire('01-synthe-dans-proche');
  return r;
}
