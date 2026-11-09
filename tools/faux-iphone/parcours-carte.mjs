// ⊞ (0.64) la carte du xerboxion avec 202 ploxions (le xer de RS-7) : ouverte, les trois niveaux, promenée (images/s, CPU ×4)
export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const R = window.ploxi0nRouteur, cats = ['jeux', 'social', 'son', 'savoir', 'outils', 'media', 'maison', 'notes', 'cartes'];
    const faux = Array.from({ length: 192 }, (_, i) => ({ id: 'faux-' + i, nom: 'Ploxion ' + i, icone: '◇', cat: cats[i % 9], type: i % 7 ? 'ploxion' : 'xerkion', koins: 5, bions: ['jOS' + (i % 40)] }));
    R.majCatalogue([...R.catalogue(), ...faux], { redessiner: true });
  });
  await page.waitForTimeout(600);
  await page.evaluate(() => window.ploxi0nRouteur.carte()); await page.waitForTimeout(900); await ecrire('01-carte-milieu');
  const r = { noeuds: await page.evaluate(() => document.querySelector('.px-carte').getElementsByTagName('*').length) };
  // promenée : un doigt glisse, avec CPU ×4
  const cdp = await page.context().newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const n0 = await page.evaluate(() => { window.__n = 0; const f = () => { window.__n++; if (window.__n < 1e6) requestAnimationFrame(f); }; requestAnimationFrame(f); return 0; });
  await page.mouse.move(200, 400); await page.mouse.down(); await page.mouse.move(60, 300, { steps: 30 }); await page.mouse.up(); await page.waitForTimeout(1000);
  r.imagesPromenade = await page.evaluate(() => window.__n); void n0;
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await page.evaluate(() => { const k = document.querySelector('.px-carte-plan'); void k; }); await ecrire('02-promenee');
  // loin (dézoom) et près : par la caméra (le pincement à deux doigts n'existe pas au faux iPhone)
  r.niveaux = [];
  for (const [z, nom] of [[0.45, '03-loin'], [2, '04-pres']]) {
    await page.evaluate((zz) => { const el = document.querySelector('.px-carte'); el.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientX: 100, clientY: 300, bubbles: true })); el.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 2, clientX: 300, clientY: 500, bubbles: true }));
      const d = Math.hypot(200, 200) * zz; el.dispatchEvent(new PointerEvent('pointermove', { pointerId: 2, clientX: 100 + d / Math.SQRT2, clientY: 300 + d / Math.SQRT2, bubbles: true }));
      el.dispatchEvent(new PointerEvent('pointerup', { pointerId: 2, bubbles: true })); el.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true })); }, z);
    await page.waitForTimeout(400); await ecrire(nom); r.niveaux.push(await page.evaluate(() => document.querySelector('.px-carte') && document.querySelector('.px-carte').dataset.niveau));
  }
  return r;
}
