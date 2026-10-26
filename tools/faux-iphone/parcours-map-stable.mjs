// ▦ (0.99.25, RS-7 26.10 : deux captures, toute la page décalée à gauche et « c'est pas stable les mouvements, soit trop grand soit trop petit,
// à cause du zoom ça part en couilles ») : la map de l'accueil, pincée, dézoomée, glissée ; rien ne doit pouvoir faire défiler la page de côté,
// et le pincement doit garder sous les doigts ce qui y était.
export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(600);
  for (let i = 0; i < 3; i++) { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^(ok|plus tard|passer)$/i.test(x.textContent.trim())); if (b) b.click(); }); await page.waitForTimeout(400); }
  await page.waitForSelector('[data-map-v]', { timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const mesure = (quoi) => page.evaluate((quoi) => {
    const W = innerWidth, out = { quoi, defile: [] };
    for (const e of [document.scrollingElement, ...document.querySelectorAll('*')]) {
      if (!e) continue; const cs = getComputedStyle(e);
      if (e.scrollWidth > e.clientWidth + 1 && (e === document.scrollingElement || /auto|scroll|hidden/.test(cs.overflowX)) && e.clientWidth > 0)
        out.defile.push((e.className && e.className.baseVal === undefined ? String(e.className).slice(0, 40) : e.tagName) + ' ' + e.clientWidth + '→' + e.scrollWidth + ' (' + cs.overflowX + ', x=' + e.scrollLeft + ')');
    }
    out.defile = out.defile.slice(0, 12);
    const v = document.querySelector('[data-map-v]'); out.vue = v ? { t: v.style.transform, o: v.style.overflow, origine: v.style.transformOrigin } : null;
    const c = document.querySelector('.px-map-ici'); if (c) { const r = c.getBoundingClientRect(); out.centre = { x: Math.round(r.left + r.width / 2 - W / 2), w: Math.round(r.width) }; }
    return out;
  }, quoi);
  const r = [];
  r.push(await mesure('départ'));
  const v = await page.$('[data-map-v]'); const b = await v.boundingBox();
  const cdp = await page.context().newCDPSession(page);
  const pincer = async (x, y, d0, d1, pas = 8) => {
    const pts = (d) => [{ x: x - d / 2, y, id: 1 }, { x: x + d / 2, y, id: 2 }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(d0) });
    for (let i = 1; i <= pas; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(d0 + (d1 - d0) * i / pas) }); await page.waitForTimeout(20); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  // pincer en dehors du centre : ce qui est sous les doigts doit y rester
  const px = b.x + b.width * 0.3, py = b.y + b.height * 0.4;
  const sous = () => page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const k = e && e.closest('[data-k],[data-c]'); return k ? (k.getAttribute('data-k') || k.getAttribute('data-c')) : null; }, [px, py]);
  const avant = await sous();
  const pos = () => page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const k = e && e.closest('[data-k],[data-c]'); if (!k) return null; const r = k.getBoundingClientRect(); return { cx: Math.round(r.left + r.width / 2), cy: Math.round(r.top + r.height / 2) }; }, [px, py]);
  const p0 = await pos();
  await pincer(px, py, 200, 150, 6);   /* dézoomer un peu (×0,75), sans reculer de scène */
  await page.waitForTimeout(300);
  r.push({ ...(await mesure('dézoomé ×0,75')), sousLesDoigts: { avant, apres: await sous() } });
  await ecrire('01-dezoome');
  await pincer(px, py, 150, 190, 6);   /* rezoomer (×1,27 du précédent ≈ ×0,95) */
  await page.waitForTimeout(300);
  const p1 = await pos();
  r.push({ ...(await mesure('rezoomé')), derive: p0 && p1 ? { dx: p1.cx - p0.cx, dy: p1.cy - p0.cy } : null });
  // glisser de côté, au doigt (touch) : la page ne doit pas suivre
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: b.x + b.width * 0.85, y: b.y + b.height * 0.5, id: 3 }] });
  for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: b.x + b.width * (0.85 - 0.08 * i), y: b.y + b.height * 0.5, id: 3 }] }); await page.waitForTimeout(16); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(600);
  r.push(await mesure('après un glisser'));
  await ecrire('02-glisse');
  // et le glisser vers un voisin marche toujours, même après un pincement
  const hub = () => page.evaluate(() => { const c = document.querySelector('.px-map-ici'); return c && c.getAttribute('data-c'); });
  const h0 = await hub();
  await page.mouse.move(b.x + b.width * 0.8, b.y + b.height / 2); await page.mouse.down(); await page.mouse.move(b.x + b.width * 0.2, b.y + b.height / 2, { steps: 6 }); await page.mouse.up();
  await page.waitForTimeout(700);
  r.push({ quoi: 'glisser vers un voisin', avant: h0, apres: await hub(), ...(await mesure('après le voisin')) });
  return r;
}
