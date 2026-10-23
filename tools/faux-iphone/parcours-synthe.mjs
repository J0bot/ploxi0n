// ≋ (0.99.4) faire du son avec des knobs : le synthé s'ouvre, les knobs (jOSKnob) par groupe, deux pads à la fois (deux doigts), un preset,
// un knob tourné (le son change en direct), la boucle lancée ; l'oscilloscope dessine
export default async function ({ page, ecrire }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.waitForTimeout(400);
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('synthe')); await page.waitForTimeout(1500);
  const r = {};
  r.knobs = await page.evaluate(() => document.querySelectorAll('.px-synthe .jkn').length);
  r.groupes = await page.evaluate(() => [...document.querySelectorAll('.px-synthe .px-sy-g .px-sy-t')].map(x => x.textContent));
  await ecrire('01-synthe');
  // deux doigts sur deux pads
  const pads = await page.evaluate(() => [...document.querySelectorAll('.px-synthe [data-sy-pad]')].slice(12, 14).map(b => { const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, id: b.getAttribute('data-sy-pad') }; }));
  await page.evaluate((ps) => { ps.forEach((p, i) => { const el = document.elementFromPoint(p.x, p.y); el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 10 + i, clientX: p.x, clientY: p.y, isPrimary: i === 0 })); }); }, pads);
  await page.waitForTimeout(300);
  r.tenus = await page.evaluate(() => document.querySelectorAll('.px-synthe .px-sy-pad.on').length);
  await ecrire('02-deux-pads');
  await page.evaluate((ps) => { ps.forEach((p, i) => { const el = document.elementFromPoint(p.x, p.y); el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 10 + i })); }); }, pads);
  await page.evaluate(() => document.querySelector('.px-synthe [data-sy-preset="acide"]').click()); await page.waitForTimeout(300);
  r.coupureAcide = await page.evaluate(() => { const k = [...document.querySelectorAll('.px-synthe .jkn')].find(x => /coupure/.test(x.textContent)); return k && k.querySelector('.jkn__val').textContent; });
  await page.evaluate(() => document.querySelector('.px-synthe [data-sy="boucle"]').click()); await page.waitForTimeout(1200);
  r.boucle = await page.evaluate(() => document.querySelector('.px-synthe [data-sy="boucle"]').textContent);
  await ecrire('03-acide-en-boucle');
  await page.evaluate(() => document.querySelector('.px-synthe [data-sy="boucle"]').click());
  return r;
}
