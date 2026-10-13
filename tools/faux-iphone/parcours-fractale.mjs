// ⧉ (0.59) la fractale des ploxions : trois ploxions ouverts, puis tenir le bord droit → l'aperçu (0,3 s), la fractale (0,9 s), le slider
// (1,9 s) ; puis un glissement vite (le passage d'app en app), photographié en plein vol.
export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(500);
  const r = {};
  const ids = await page.evaluate(() => [...document.querySelectorAll('.px-tuile[data-id]')].map(b => b.getAttribute('data-id')).filter(id => /^(bother|marketplace|banc|sante|journal-tsoins|gestion)$/.test(id)).slice(0, 4));
  for (const id of ids) {
    await page.evaluate((i) => document.querySelector('.px-tuile[data-id="' + i + '"]').click(), id); await page.waitForTimeout(900);
    await page.evaluate(() => { const m = document.querySelector('[data-minimiser]'); if (m) m.click(); }); await page.waitForTimeout(400);
  }
  await page.evaluate((i) => document.querySelector('.px-tuile[data-id="' + i + '"]').click(), ids[1]); await page.waitForTimeout(800);
  r.ouverts = ids; r.courant = await page.evaluate(() => (document.querySelector('.px-hote:not([hidden])') || {}).dataset ? document.querySelector('.px-hote:not([hidden])').dataset.ploxion : null);
  const bord = await page.evaluate(() => { const b = document.querySelector('.px-bord-d').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
  // (les captures prennent ~0,7 s : on photographie des états qui tiennent)
  // 1. l'aperçu, tiré un peu (il tient : la fractale ne vient plus d'elle-même), puis relâché en deçà : tout revient
  await page.mouse.move(bord.x, bord.y); await page.mouse.down(); await page.waitForTimeout(380);
  await page.mouse.move(bord.x - 80, bord.y, { steps: 4 }); await page.waitForTimeout(150); await ecrire('02-apercu-tire');
  r.apercu = await page.evaluate(() => document.querySelector('#ploxi0n').classList.contains('px-fx-apercu'));
  await page.mouse.move(bord.x - 20, bord.y, { steps: 2 }); await page.mouse.up(); await page.waitForTimeout(500);
  // 2. la fractale : tenue 1 s puis lâchée sans bouger, elle reste ouverte
  await page.mouse.move(bord.x, bord.y); await page.mouse.down(); await page.waitForTimeout(1050); await page.mouse.up(); await page.waitForTimeout(450);
  await ecrire('03-fractale');
  r.cartes = await page.evaluate(() => document.querySelectorAll('.px-fx-cible').length);
  r.ouverte = await page.evaluate(() => document.querySelector('#ploxi0n').classList.contains('px-fx-ouverte'));
  await page.mouse.move(200, 120); await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(500);   // à côté : on revient
  // 3. le slider
  await page.mouse.move(bord.x, bord.y); await page.mouse.down(); await page.waitForTimeout(2100); await ecrire('04-slider');
  r.slider = await page.evaluate(() => document.querySelector('#ploxi0n').classList.contains('px-fx-suit'));
  await page.mouse.up(); await page.waitForTimeout(500);
  r.apresSlider = await page.evaluate(() => (document.querySelector('.px-hote:not([hidden])') || {}).dataset ? document.querySelector('.px-hote:not([hidden])').dataset.ploxion : 'accueil');
  // le glissement : vite depuis le bord gauche
  const bg = await page.evaluate(() => { const b = document.querySelector('.px-bord-g').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
  await page.mouse.move(bg.x, bg.y); await page.mouse.down(); await page.mouse.move(bg.x + 110, bg.y, { steps: 3 }); await page.mouse.up();
  await page.waitForTimeout(140); await ecrire('05-glissement');
  await page.waitForTimeout(600);
  r.apresGlissement = await page.evaluate(() => (document.querySelector('.px-hote:not([hidden])') || {}).dataset ? document.querySelector('.px-hote:not([hidden])').dataset.ploxion : 'accueil');
  return r;
}
