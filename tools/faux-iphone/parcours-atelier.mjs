// ◈ (0.96) l'atelier des peaux sur le chemin iPhone : la grille fractale, zoomer dans une peau, tourner un knob (jOSKnob), garder
export default async function ({ page, ecrire }) {
  await page.evaluate(async () => { const a = (await window.ploxi0n.boxion.get('reglages', 'app')) || {}; await window.ploxi0n.boxion.put('reglages', 'app', { ...a, mode: 'organique', variante: 'xeno' }); });
  await page.reload(); await page.waitForTimeout(3000);
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('atelier-peaux')); await page.waitForTimeout(2000);
  const r = {};
  r.tuiles = await page.evaluate(() => document.querySelectorAll('.px-at-t .px-neurones').length);
  r.knobs = await page.evaluate(() => document.querySelectorAll('.px-at-k .jkn').length);
  await ecrire('01-atelier');
  await page.click('[data-t="2"]'); await page.waitForTimeout(1500);
  r.zoom = await page.evaluate(() => document.querySelector('[data-at-z]').textContent);
  r.variante = await page.evaluate(() => document.documentElement.getAttribute('data-px-variante'));
  await ecrire('02-zoome');
  // tourner le knob « le halo » puis « les épines » (vers le haut)
  for (const k of ['halo', 'epines', 'glitch']) {
    const box = await page.evaluate((k) => { const el = [...document.querySelectorAll('.px-at-k .jkn')].find(x => x.querySelector('.jkn__lab').textContent.includes(k === 'halo' ? 'halo' : k === 'epines' ? 'épines' : 'glitch')); el.scrollIntoView({ block: 'center' }); const b = el.querySelector('[data-k]').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, k);
    await page.mouse.move(box.x, box.y); await page.mouse.down(); for (let i = 1; i <= 6; i++) await page.mouse.move(box.x, box.y - i * 12); await page.mouse.up(); await page.waitForTimeout(600);
  }
  await page.waitForTimeout(800);
  await page.evaluate(() => document.querySelector('.px-at-g').scrollIntoView({ block: 'start' })); await page.waitForTimeout(400);
  await ecrire('03-knobs');
  await page.evaluate(() => document.querySelector('.px-at-k').scrollIntoView({ block: 'start' })); await page.waitForTimeout(400);
  await ecrire('04-les-knobs');
  return r;
}
