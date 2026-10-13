// 🖼 LA GALERIE : chaque app de ploxi0n (les ploxions internes + le pack hors ligne) ouverte et capturée, les trois modes de l'accueil,
// la page des mini docks. Sortie : <dossier>/g-*.png (tools/faux-iphone/planche.py en fait une planche).
export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(400);
  // le pack hors ligne : ajouté à l'accueil (sinon seul « bother » y est)
  await page.evaluate(async () => {
    const r = await fetch('/ploxions/index.json').then(x => x.json()).catch(() => ({ ploxions: [] }));
    const R = window.ploxi0n.routeur, deja = new Set(R.catalogue().map(p => p.id));
    R.majCatalogue([...R.catalogue(), ...r.ploxions.filter(p => !deja.has(p.id)).map(p => ({ id: p.id, nom: p.nom, icone: p.icone }))]);
    await R.accueil();
  });
  await page.waitForTimeout(600);
  const fait = [];
  const mode = async (m) => { await page.evaluate((k) => { const b = document.querySelector('[data-mode="' + k + '"]'); if (b) b.click(); }, m); await page.waitForTimeout(900); };
  await ecrire('g-00-accueil'); fait.push('accueil');
  await mode('xerbot'); await ecrire('g-01-mode-xerbot'); fait.push('mode xerbot');
  await mode('xerboxion'); await ecrire('g-02-mode-xerboxion'); fait.push('mode xerboxion');
  await mode('chill-tekk');
  const ids = await page.evaluate(() => window.ploxi0n.routeur.catalogue().map(p => p.id));
  let n = 10;
  for (const id of ids) {
    try {
      await page.evaluate((x) => window.ploxi0n.routeur.ouvrir(x), id);
      await page.waitForTimeout(1500);
      if (id === 'cape') { await page.evaluate(() => { const b = document.querySelector('[data-a="sim"]'); if (b) b.click(); }); await page.waitForTimeout(3500); }
      await ecrire('g-' + (n++) + '-' + id); fait.push(id);
      if (id !== 'cape' && id !== 'sante') await page.evaluate(() => window.ploxi0n.routeur.fermer());
      else await page.evaluate(() => window.ploxi0n.routeur.minimiser());   // ces deux-là restent en mini dock
      await page.evaluate(() => window.ploxi0n.routeur.accueil()); await page.waitForTimeout(300);
    } catch (e) { fait.push(id + ' ⚠ ' + String(e.message).slice(0, 80)); }
  }
  await ecrire('g-90-accueil-mini-docks'); fait.push('accueil + mini docks');
  await page.evaluate(() => { const b = document.querySelector('.px-md-tous'); if (b) b.click(); }); await page.waitForTimeout(500);
  await ecrire('g-91-page-mini-docks'); fait.push('page des mini docks');
  return fait;
}
