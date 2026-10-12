export default async function ({ page, ecrire }) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /passer/i.test(x.textContent)); if (b) b.click(); });
  await page.evaluate(() => window.ploxi0n.routeur.ouvrir('reglages-app')); await page.waitForTimeout(1200);
  await ecrire('rg-0-accueil');
  const pages = await page.evaluate(() => [...document.querySelectorAll('[data-accueil] [data-aller]')].map(b => b.getAttribute('data-aller')));
  const out = { pages, vues: {} };
  for (const p of pages) { try {
    await page.evaluate((k) => document.querySelector('[data-accueil] [data-aller="' + k + '"]').click(), p); await page.waitForTimeout(250);
    out.vues[p] = await page.evaluate(() => ({ titre: document.querySelector('[data-titre]').textContent, visibles: [...document.querySelectorAll('.rg section')].filter(s => !s.hidden).map(s => s.getAttribute('data-s')), lignes: [...document.querySelectorAll('.rg section:not([hidden]) .l, .rg section:not([hidden]) .lien')].length, sous: [...document.querySelectorAll('.rg section:not([hidden]) .lien')].map(b => b.getAttribute('data-aller')) }));
    if (['natif', 'sante', 'haptique', 'navigation'].includes(p)) await ecrire('rg-' + p);
    for (const sp of out.vues[p].sous) { await page.evaluate((k) => document.querySelector('.rg section:not([hidden]) [data-aller="' + k + '"]').click(), sp); await page.waitForTimeout(200);
      out.vues[p + '>' + sp] = await page.evaluate(() => ({ titre: document.querySelector('[data-titre]').textContent, visibles: [...document.querySelectorAll('.rg section')].filter(s => !s.hidden).map(s => s.getAttribute('data-s')) }));
      await page.evaluate(() => document.querySelector('[data-rg-retour]').click()); await page.waitForTimeout(150); }
    await page.evaluate(() => document.querySelector('[data-rg-retour]').click()); await page.waitForTimeout(150);
  } catch (e) { out.erreur = p + ' : ' + e.message.split('\n')[0] + ' · ' + JSON.stringify(await page.evaluate(() => ({ titre: document.querySelector('[data-titre]').textContent, retour: !!document.querySelector('[data-rg-retour]'), cache: document.querySelector('[data-rg-retour]') && document.querySelector('[data-rg-retour]').hidden }))); break; } }
  await page.fill('[data-q]', 'plein'); await page.waitForTimeout(200);
  out.recherche = await page.evaluate(() => ({ titre: document.querySelector('[data-titre]').textContent, sections: [...document.querySelectorAll('.rg section')].filter(s => !s.hidden).map(s => s.getAttribute('data-s')), lignes: [...document.querySelectorAll('.rg section:not([hidden]) .l:not([hidden])')].map(l => l.textContent.slice(0, 40)) }));
  await ecrire('rg-recherche');
  return out;
}
