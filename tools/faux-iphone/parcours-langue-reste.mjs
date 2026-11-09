// ⟡ (0.99.23) ce qui reste en français quand l'app parle anglais : les textes visibles de chaque écran que le dictionnaire ne connaît pas
// (src/app/langues.js). Rend les phrases uniques, les plus vues d'abord, pour traduire là où ça se voit.
export default async function ({ page }) {
  await page.evaluate(async () => { const b = window.ploxi0n.boxion, a = (await b.get('reglages', 'app')) || {}; await b.put('reglages', 'app', { ...a, langue: 'en', mode: 'organique' }); });
  await page.reload(); await page.waitForTimeout(3500);
  await page.waitForSelector('[data-nv]', { timeout: 3000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  const releve = () => page.evaluate(() => {
    const IGN = 'svg,script,style,textarea,select,option,[contenteditable],.px-g-e,[data-ecrit],[translate="no"],.px-hote-labo';
    const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) { const t = n.data.replace(/\s+/g, ' ').trim(); const el = n.parentElement; if (!t || !el || el.closest(IGN)) continue;
      const r = el.getBoundingClientRect(); if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden') continue;
      if (!/\p{L}{3,}/u.test(t)) continue; if (/[àâçéèêëîïôûùœ]|\b(le|la|les|des|du|un|une|et|ou|pour|avec|dans|sur|tes|ton|ta|qui|pas|plus)\b/i.test(t)) out.push(t); }
    for (const el of document.querySelectorAll('[placeholder],[aria-label],[title]')) for (const a of ['placeholder', 'aria-label', 'title']) { const t = (el.getAttribute(a) || '').trim(); if (t && !el.closest(IGN) && /[àâçéèêëîïôûùœ]|\b(le|la|les|des|du|un|une|et|pour|avec|dans|tes|ton|ta)\b/i.test(t)) out.push(t); }
    return out;
  });
  const tous = new Map(), parEcran = {};
  const noter = (ecran, l) => { parEcran[ecran] = new Set(l).size; for (const t of l) tous.set(t, (tous.get(t) || 0) + 1); };
  noter('accueil', await releve());
  for (const id of ['reglages-app', 'marketplace', 'proche', 'synthe', 'autour', 'atelier-peaux', 'systeme', 'ambiances', 'passe', 'mes-xers']) {
    await page.evaluate((i) => window.ploxi0n.routeur.ouvrir(i), id).catch(() => {}); await page.waitForTimeout(1000);
    noter(id, await releve());
    await page.evaluate(() => window.ploxi0n.routeur.faire('accueil')).catch(() => {}); await page.waitForTimeout(300);
  }
  return { parEcran, phrases: [...tous].sort((a, b) => b[1] - a[1]).map(x => x[0]) };
}
