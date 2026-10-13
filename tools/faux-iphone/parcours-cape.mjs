// 🥼 (0.50) labo-cape : la simulation, la consigne (+ jusqu'au plafond de 42 °C), une zone éteinte, la session enregistrée en tsoin.
export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('cape')); await page.waitForTimeout(600);
  const clic = (sel) => page.evaluate((s) => { const b = document.querySelector(s); if (b) b.click(); return !!b; }, sel);
  await clic('[data-a="sim"]'); await clic('[data-a="enreg"]');
  for (let i = 0; i < 8; i++) await clic('[data-sp="1"]');   // 38 + 8 → plafonné à 42
  await clic('[data-zone="c3"]');
  await page.waitForTimeout(4500);
  await ecrire('cape');
  const r = await page.evaluate(() => ({ titre: document.querySelector('.px-grave').textContent, consigne: document.querySelector('.px-cape-sp b').textContent,
    zones: [...document.querySelectorAll('.px-cape-z')].slice(0, 4).map(z => z.innerText.replace(/\s+/g, ' ')), puissance: document.querySelector('.px-cape-puiss') && document.querySelector('.px-cape-puiss').innerText.replace(/\s+/g, ' ') }));
  await clic('[data-a="enreg"]'); await page.waitForTimeout(300);
  r.tsoin = await page.evaluate(async () => { const t = await window.ploxi0n.boxion.lire('tsoins', { limite: 50 }); const x = t.reverse().find(e => e.entry.source === 'labo-cape'); return x && x.entry.d; });
  return r;
}
