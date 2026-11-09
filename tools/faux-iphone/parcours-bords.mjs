// ⇆ (0.99.26, RS-7 27.10, des captures : la page des réglages décalée à gauche après la fractale ; « aucune action avec le bord droit ne
// fonctionne, les menus se perdent ; ma seule manière de quitter une app c'est le bord gauche bas »). Chaque geste des bords, puis : où est
// la page (main, l'écran, l'hôte), où sont les deux bords, ce qui garde une transformation, la vue (défilée ?).
export default async function ({ page, ecrire }) {
  for (let i = 0; i < 3; i++) { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^(ok|plus tard|passer)$/i.test(x.textContent.trim())); if (b) b.click(); }); await page.waitForTimeout(300); }
  const mesure = (quoi) => page.evaluate((quoi) => {
    const r = (s) => { const e = typeof s === 'string' ? document.querySelector(s) : s; if (!e) return null; const b = e.getBoundingClientRect(); return Math.round(b.left) + '..' + Math.round(b.right); };
    const tf = [...document.querySelectorAll('body, body *')].filter(e => { const cs = getComputedStyle(e); return cs.transform && cs.transform !== 'none' && !e.closest('svg') && e.getBoundingClientRect().width > 300; })
      .map(e => (e.tagName + '.' + String(e.className).split(' ').slice(0, 2).join('.')).slice(0, 50) + ' ' + getComputedStyle(e).transform.slice(0, 60) + (e.getAnimations ? ' anim:' + e.getAnimations().length : '')).slice(0, 8);
    const h = [...document.querySelectorAll('.px-hote')].find(x => !x.hidden);
    const dehors = [...document.querySelectorAll('body *')].filter(e => { const cs = getComputedStyle(e); if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') return false; const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && (b.right > innerWidth + 1 || b.left < -1); }).slice(0, 6).map(e => (e.tagName + '.' + String(e.className).split(' ')[0]).slice(0, 40) + ' ' + Math.round(e.getBoundingClientRect().left) + '..' + Math.round(e.getBoundingClientRect().right));
    return { quoi, largeur: innerWidth, viewport: (document.querySelector('meta[name=viewport]') || {}).content, dehors, sw: document.documentElement.scrollWidth, scrollX: scrollX, vv: visualViewport ? Math.round(visualViewport.offsetLeft) + '@' + visualViewport.scale : null, main: r('main'), ecran: r('.px-ecran'), hote: h ? h.dataset.ploxion + ' ' + r(h) : null,
      bordG: r('.px-bord-g'), bordD: r('.px-bord-d'), classes: document.querySelector('main') && [...document.querySelector('main').classList].filter(c => /fx|tire/.test(c)).join(' '), tf };
  }, quoi);
  const bord = async (cote, { dy = 0.5, dx = 120, tenir = 0, pas = 10 } = {}) => {
    const b = await page.$('.px-bord-' + cote); const bb = await b.boundingBox();
    const x0 = bb.x + bb.width / 2, y = bb.y + bb.height * dy, s = cote === 'g' ? 1 : -1;
    await page.mouse.move(x0, y); await page.mouse.down(); if (tenir) await page.waitForTimeout(tenir);
    for (let i = 1; i <= pas; i++) { await page.mouse.move(x0 + s * dx * i / pas, y); await page.waitForTimeout(16); }
    await page.mouse.up(); await page.waitForTimeout(900);
  };
  const r = [];
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('reglages-app')); await page.waitForTimeout(1200);
  r.push(await mesure('réglages ouverts'));
  await bord('d', { dx: 120 }); r.push(await mesure('bord droit glissé (milieu : suivante)'));
  await bord('g', { dx: 120 }); r.push(await mesure('bord gauche glissé (milieu : précédente)'));
  await bord('d', { tenir: 700, dx: 10 }); r.push(await mesure('bord droit tenu (la fractale), lâché sur place')); await ecrire('01-apres-tenir');
  await bord('d', { tenir: 700, dx: 200 }); r.push(await mesure('bord droit tenu puis tiré loin'));
  await bord('d', { dy: 0.85, dx: 120 }); r.push(await mesure('bord droit bas (accueil)'));
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('reglages-app')); await page.waitForTimeout(900);
  await bord('d', { dy: 0.15, dx: 120 }); r.push(await mesure('bord droit haut (chercher)')); await ecrire('02-fin');
  return r;
}
