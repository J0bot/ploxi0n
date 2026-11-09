// ⊙ (0.99.8) le mode humain : zéro texte ; la map (8◇ · 4⊡, ∀t), le neurone (◇ →0 · 0→, ∅) ; on compte les mots qui restent visibles
export default async function ({ page, ecrire }) {
  await page.waitForSelector('[data-nv]', { timeout: 4000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  await page.evaluate(async () => { const a = (await window.ploxi0n.boxion.get('reglages', 'app')) || {}; await window.ploxi0n.boxion.put('reglages', 'app', { ...a, mode: 'organique', ecriture: 'humain' }); });
  await page.reload(); await page.waitForTimeout(3500);
  await page.waitForSelector('[data-nv]', { timeout: 2000 }).then(() => page.evaluate(() => document.querySelector('[data-nv]').click())).catch(() => {});
  const mots = () => page.evaluate(() => { const l = []; const w = document.createTreeWalker(document.querySelector('.px-accueil') || document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) { const t = w.currentNode, el = t.parentElement; if (!el || !t.data.trim()) continue; const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.fontSize) === 0 || r.width === 0 || r.bottom < 0 || r.top > innerHeight) continue;
      if (/[a-zà-ÿ]{3,}/i.test(t.data)) l.push(t.data.trim().slice(0, 30)); } return l; });
  const r = { classe: await page.evaluate(() => document.documentElement.classList.contains('px-e-humain')), motsMap: await mots() };
  r.pied = await page.evaluate(() => (document.querySelector('.px-accueil .px-map-ici .px-map-pied') || {}).dataset);
  await ecrire('01-map-humaine');
  await page.evaluate(() => { const h = document.querySelector('.px-accueil .px-org-map-h'); const id = (window.ploxi0n.routeur.catalogue().find(p => !p.interne) || {}).id; h.__map.zoomer('ploxion', { ploxion: id }); }); await page.waitForTimeout(1500);
  r.motsNeurone = await mots(); await ecrire('02-neurone-humain');
  return r;
}
